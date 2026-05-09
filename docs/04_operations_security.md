# Synapse — 운영 / 보안 가이드

> SaaS 출시 + 운영을 위한 인프라, 보안, 비용, 컴플라이언스 가이드

> **문서 버전**: v2.0 (2026-04-30 전면 재작성)
> **이전**: v1.0 (`04_production_track.md` — 상용화 트랙 분리 문서) → v2.0에서 **단일 트랙의 운영/보안 가이드**로 재정의

---

## 0. 이 문서의 위치

`01~03` 문서가 **무엇을 만들 것인가**를 정의한다면, 본 문서는 **그것을 어떻게 안정적으로 운영할 것인가**를 다룬다.

| 영역 | 다루는 내용 |
|------|-------------|
| §1 Multi-tenancy 운영 | RLS 강제, 격리 검증, 노이지 네이버 방지 |
| §2 LLM 운영 | 캐싱, 라우팅, eval, 비용 통제 |
| §3 인프라 / DevOps | K8s, CI/CD, 백업, DR |
| §4 Observability | Metrics + Tracing + Logging + LLM observability |
| §5 보안 | 인증, 암호화, Audit, PII |
| §6 컴플라이언스 | GDPR, CCPA, 한국 개인정보보호법, SOC 2 |
| §7 비용 | 시뮬레이션, 통제, 최적화 |
| §8 운영 절차 | 출시, 인시던트, 온콜 |

---

## 1. Multi-tenancy 운영

### 1.1 격리 모델 (확정)

**Pool 모델 + Row Level Security (RLS) + 애플리케이션 강제 필터** = 이중 방어.

| 옵션 | 채택 시점 | 비고 |
|------|----------|------|
| Pool (공유 DB) | Phase 1~ | 기본 |
| Bridge (스키마 분리) | (검토 안 함) | 운영 복잡도 대비 이득 적음 |
| Silo (DB 분리) | Phase 6+ Enterprise | 데이터 거주 요구 시 |

### 1.2 격리 강제 메커니즘

#### Layer 1: PostgreSQL RLS
```sql
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notes
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

#### Layer 2: 애플리케이션 컨텍스트 주입
```java
// 모든 트랜잭션 시작 시 SET LOCAL
@Aspect
public class TenantContextAspect {
    @Around("@annotation(org.springframework.transaction.annotation.Transactional)")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        UUID tenantId = TenantContext.requireCurrent();
        try (Statement s = conn.createStatement()) {
            s.execute("SET LOCAL app.tenant_id = '" + tenantId + "'");
        }
        return pjp.proceed();
    }
}
```

#### Layer 3: Repository 강제 시그니처
```java
// ✅ tenantId 강제
public List<Note> findByTenantIdAndUserId(UUID tenantId, UUID userId);

// ❌ 컴파일 시 lint로 차단 또는 PR 리뷰에서 차단
public List<Note> findByUserId(UUID userId);  // tenant 누락
```

### 1.3 자동화 격리 테스트

CI에서 매 PR마다 실행:

```java
@Test
@DisplayName("Tenant A 사용자가 Tenant B 노트에 접근 불가")
void tenantIsolation() {
    // Given: Tenant A와 B에 각 1개 노트
    Note noteA = createNote(tenantA, userA);
    Note noteB = createNote(tenantB, userB);

    // When: Tenant A 컨텍스트로 모든 노트 조회
    TenantContext.set(tenantA);
    List<Note> visible = noteRepository.findAll();

    // Then: noteA만 보여야 함
    assertThat(visible).containsExactly(noteA);
    assertThat(visible).doesNotContain(noteB);
}

// 추가 테스트:
// - SQL injection으로 tenant_id 우회 시도
// - 직접 ID로 조회 시 (findById) 차단
// - JPA criteria query에서 tenant 누락 시 차단
```

### 1.4 다른 저장소의 격리

#### Redis
```
키 prefix로 격리 + ACL
tenant:{tenantId}:user:{userId}:srs-queue
tenant:{tenantId}:semantic-cache:{queryHash}
tenant:{tenantId}:rate-limit:{userId}
```

Redis 6+ ACL로 prefix별 접근 제한 (운영 사용자만 전체).

#### Elasticsearch
- 1000 tenant 미만: tenant당 인덱스 (`synapse-notes-tenant-{tenantId}`)
- 1000+: 단일 인덱스 + alias + filter + routing key

#### pgvector
- HNSW 인덱스에 `WHERE tenant_id IS NOT NULL` partial 적용
- 모든 벡터 쿼리에 `tenant_id = $1` 필터 강제 (lint 검증)

#### Kafka
- 토픽은 글로벌, payload에 `tenantId` 필수
- 컨슈머는 처리 시 `tenantId` 검증 + DB 세션 변수 주입

### 1.5 노이지 네이버 (Noisy Neighbor) 방지

| 자원 | 격리 메커니즘 |
|------|---------------|
| **DB connection pool** | 플랜별 max connection 제한 (Pro 5, Free 1, Enterprise 50) |
| **LLM tokens** | tenant별 월간 한도 (`plan_quotas`) |
| **벡터 검색 동시성** | Redis 동시 요청 카운트 + 큐잉 |
| **Storage I/O** | tenant별 분당 업로드/다운로드 제한 |
| **CPU/메모리** | K8s namespace별 ResourceQuota (Phase 5+) |

---

## 2. LLM 운영

### 2.1 Dual Pipeline

```
[Indexing Pipeline] - 비동기, 처리량 우선
NoteCreated/Updated → Chunk Splitter → Embedding (배치) → pgvector + ES

[Query Pipeline] - 동기, 응답시간 우선
검색 요청 → Semantic Cache → Hybrid Search (BM25+Vector) → Rerank (선택) → Cache 저장
```

### 2.2 Semantic Caching (비용 70% 절감 핵심)

#### 매칭 전략 (2단계)

```python
async def cached_llm_call(operation: str, input_text: str, tenant_id: UUID):
    cache_key = sha256(f"{operation}:{normalize(input_text)}")

    # 1. Exact match
    exact = await db.fetch_one(
        "SELECT output FROM semantic_cache "
        "WHERE tenant_id=$1 AND cache_key=$2 AND expires_at>NOW()",
        tenant_id, cache_key
    )
    if exact:
        await track_hit(exact, type='exact')
        return exact.output

    # 2. Semantic match (sim ≥ 0.95)
    embedding = await embed(input_text)
    semantic = await db.fetch_one(
        "SELECT output, 1-(input_embedding <=> $2::vector) AS sim "
        "FROM semantic_cache "
        "WHERE tenant_id=$1 AND operation=$3 AND expires_at>NOW() "
        "ORDER BY input_embedding <=> $2::vector LIMIT 1",
        tenant_id, embedding, operation
    )
    if semantic and semantic.sim >= 0.95:
        await track_hit(semantic, type='semantic')
        return semantic.output

    # 3. Cache miss → LLM 호출 + 저장
    output = await llm.call(input_text)
    await db.execute("INSERT INTO semantic_cache ...", ...)
    return output
```

#### TTL 정책

| operation | TTL | 이유 |
|-----------|-----|------|
| `card_generation` | 7일 | 노트 변경 빈도 보통 |
| `qa` | 1일 | 사용자 컨텍스트가 자주 바뀜 |
| `summarize` | 30일 | 노트 자체가 동일하면 재사용 |
| `similar_notes` | 7일 | 새 노트 생성 시 변동 |

#### 무효화
- `NoteUpdated` 이벤트 → 해당 노트 관련 캐시 invalidate
- `NoteDeleted` → 해당 노트 캐시 hard delete
- 모델 버전 변경 → 전체 무효화 (백그라운드 잡)

### 2.3 Hybrid Retrieval

```python
async def hybrid_retrieve(query: str, tenant_id: UUID, top_k: int = 10):
    # 1. 병렬 검색
    bm25_results, vector_results = await asyncio.gather(
        es_search(query, tenant_id, k=30),
        pgvector_search(await embed(query), tenant_id, k=30)
    )

    # 2. RRF 융합
    fused = rrf([bm25_results, vector_results], k=60)[:50]

    # 3. (선택) Cross-encoder rerank
    if settings.reranker_enabled and tenant.plan in ['pro','team','enterprise']:
        return await reranker.rank(query, fused, top_k=top_k)
    return fused[:top_k]
```

| 컴포넌트 | 모델 | 비용 |
|----------|------|------|
| 임베딩 | `text-embedding-3-small` 또는 `bge-m3` (다국어) | $0.02/1M tokens |
| Reranker | `bge-reranker-v2-m3` (자체 호스팅) | GPU 필요 |

### 2.4 Intelligent Routing

```python
def route_model(task_type: str, complexity: int, tenant_plan: str) -> str:
    # Free 사용자는 작은 모델
    if tenant_plan == 'free':
        return 'claude-haiku-4-5'

    # 작업별 라우팅
    if task_type == 'card_generation':
        return 'claude-haiku-4-5' if complexity < 5 else 'claude-sonnet-4-6'
    elif task_type == 'qa':
        return 'claude-opus-4-7' if complexity > 7 else 'claude-sonnet-4-6'
    elif task_type == 'summarize':
        return 'claude-haiku-4-5'
    return 'claude-sonnet-4-6'
```

### 2.5 비용 통제 다층 방어

| Layer | 메커니즘 | 트리거 |
|-------|----------|--------|
| 1 | Semantic Cache | 자동 (모든 호출) |
| 2 | Intelligent Routing | 자동 (작업 + 플랜) |
| 3 | Tenant 월간 한도 (`plan_quotas`) | 80% 알림, 100% 차단 |
| 4 | 시간당 폭주 감지 | 자동 차단 + 알림 (악의적 호출) |
| 5 | 운영 글로벌 한도 | 일별 총 비용 상한 (Killswitch) |

### 2.6 Guardrails

```python
async def guarded_llm_call(prompt: str, tenant_id: UUID):
    # 1. PII 검사 + 마스킹
    if user_settings.pii_redaction_enabled:
        prompt = await pii_redactor.redact(prompt)

    # 2. 프롬프트 인젝션 검사
    if prompt_injection_detector.is_injection(prompt):
        raise GuardrailViolation('prompt_injection')

    # 3. LLM 호출
    output = await llm.call(prompt)

    # 4. 출력 검증
    if hallucination_detector.is_hallucinated(output, context):
        log_warning(...)
        return await fallback_or_retry()
    if toxicity_filter.is_toxic(output):
        raise GuardrailViolation('toxicity')

    return output
```

### 2.7 Eval 파이프라인

| 메트릭 | 측정 | 목표 |
|--------|------|------|
| Recall@10 | 라벨 query-doc top-10 | ≥ 0.85 |
| NDCG@10 | 정규화 DCG | ≥ 0.75 |
| Answer Faithfulness | LLM-as-judge | ≥ 0.90 |
| Hallucination Rate | 컨텍스트 없는 인용 | ≤ 0.05 |

도구: **LangSmith** / **Phoenix (Arize)** / 자체 구축. **매일 자동 실행 + 회귀 시 알람**.

### 2.8 Incremental Re-embedding (Phase 5+)

```python
async def re_embed_note(note_id, old_md, new_md):
    old_chunks = chunk(old_md)
    new_chunks = chunk(new_md)
    changed = diff_chunks(old_chunks, new_chunks)

    for idx in changed:
        embedding = await embed(new_chunks[idx])
        await upsert_chunk(note_id, idx, embedding)

    if len(new_chunks) < len(old_chunks):
        await delete_chunks_after(note_id, len(new_chunks) - 1)
```

> 모델 버전 변경 시는 전체 재생성 (백그라운드 잡, 시간당 제한)

---

## 3. 인프라 / DevOps

### 3.1 환경 구성

| 환경 | 용도 | 인프라 |
|------|------|--------|
| **local** | 로컬 개발 | Docker Compose (PG + Redis) |
| **dev** | 통합 개발 | 단일 EKS 클러스터 (작은 노드) |
| **staging** | 운영 전 검증 | 운영과 동일 구성 (작은 규모) |
| **prod** | 운영 | Multi-AZ EKS + RDS + ElastiCache |

### 3.2 Kubernetes 구성

```
synapse-prod (cluster)
├── synapse-gateway       (HPA: 2~20)
├── synapse-auth          (HPA: 2~10)
├── synapse-note          (HPA: 2~30)
├── synapse-card          (HPA: 2~20)
├── synapse-graph         (HPA: 1~10)
├── synapse-ai            (HPA: 1~10, GPU 옵션)
├── synapse-billing       (HPA: 2~5)
├── synapse-audit         (HPA: 1~3)
└── synapse-jobs (CronJob: backup, anonymization, partition mgmt)
```

#### HPA 정책

| 서비스 | 메트릭 | min/max |
|--------|--------|---------|
| Gateway | CPU 70% | 2/20 |
| Note | CPU 70% + Kafka lag | 2/30 |
| Card | CPU 70% + Redis 큐 깊이 | 2/20 |
| AI (gen) | 동시 요청 + GPU util | 1/10 |
| AI (embed) | Kafka lag | 2/50 |
| Graph | CPU 60% | 1/10 |

### 3.3 데이터 마이그레이션 규율

| 규칙 | 이유 |
|------|------|
| **Hibernate `ddl-auto=validate` 만 허용** | 자동 변경 절대 금지 |
| Flyway (Spring) + Alembic (FastAPI) | 도구 통일 |
| **Forward-only** | 롤백 마이그레이션 작성 X (백업으로 복구) |
| **PR 리뷰 필수** | 운영 영향 검토 |
| **Backward-compatible** | 무중단 배포 가능한 변경만 |

#### Zero-downtime 컬럼 변경
```
Step 1: 컬럼 추가 (NULLABLE) + 코드는 둘 다 읽음
Step 2: 모든 행 백필 (배치)
Step 3: 코드를 새 컬럼만 사용하도록 배포
Step 4: 옛 컬럼 제거 마이그레이션
```

### 3.4 CI/CD 파이프라인

```yaml
PR:
  - lint (Checkstyle, ESLint, dart format)
  - test (unit + integration with Testcontainers)
  - SAST (Snyk, SonarQube)
  - 격리 자동화 테스트 (RLS 검증)
  - build (Docker image to GHCR)
  - smoke test (preview env)

Main → Staging:
  - Image tag + push
  - ArgoCD 자동 동기화 → staging
  - E2E 테스트 (Playwright)

Staging → Production:
  - 수동 승인
  - DB 마이그레이션 (별도 잡, dry-run 후 apply)
  - Blue/Green or Rolling
  - Smoke test 후 canary (10%)
  - 메트릭 정상 시 100% 전환
  - 5분간 모니터링 (자동 롤백 트리거)
```

### 3.5 Backup & Disaster Recovery

| 항목 | 정책 | RPO/RTO |
|------|------|---------|
| **PostgreSQL** | WAL 아카이브 + 일별 logical dump → S3 | RPO 5분 / RTO 1시간 |
| **pgvector** | PG와 함께 백업 | 동일 |
| **Redis** | RDB 매시간 + AOF + S3 backup | RPO 1시간 / RTO 30분 |
| **S3** | Versioning + Cross-region replication | RPO 0 / RTO 즉시 |
| **Kafka** | 7일 retention + DLQ 30일 | (재처리 가능) |
| **Audit Logs** | 매월 S3 archive + Glacier (1년+) | (compliance 보존) |

#### DR 훈련
- 분기별 1회 복구 시나리오 실행
- "RDS 인스턴스 사망" / "Region 장애" / "데이터 손상" 3가지 시나리오
- 실제 복구 시간 측정 + RTO 갱신

### 3.6 Rate Limiting & Abuse Prevention

#### 다층 방어
```
Layer 1: CDN/Edge (Cloudflare)        — DDoS, 봇 차단
Layer 2: Gateway (Spring Cloud)        — IP/User rate limit (Bucket4j + Redis)
Layer 3: Service (도메인별)            — 비싼 작업(LLM) 별도 한도
Layer 4: Tenant Quota                   — 플랜별 월간 한도
Layer 5: Anomaly Detection             — 시간당 폭주 자동 차단
```

#### Rate Limit 정책 (자세히)

| 대상 | 제한 |
|------|------|
| 비인증 IP (전체 API) | 60 req/min, 1000 req/hour |
| 인증 일반 API | 600 req/min/user |
| LLM 카드 생성 | 30 req/min, 1000 req/일 (Pro) |
| LLM Q&A | 60 req/min |
| 검색 (semantic) | 120 req/min |
| 회원가입 | 5 req/hour/IP (스팸 방지) |
| 비밀번호 재설정 요청 | 3 req/hour/email |
| 데이터 export | 5 req/일/user |

#### Anomaly Detection
- Redis sliding window로 사용자 행동 기록
- 급격한 LLM 호출 증가 → 자동 일시중지 + 알림
- 새 IP에서 대량 요청 → CAPTCHA 챌린지
- 비정상 패턴 ML 모델 (Phase 6+)

---

## 4. Observability

### 4.1 3 Pillars + AI

#### Metrics (Prometheus + Grafana)
표준 RED + 비즈니스 메트릭:
```
# 표준
http_requests_total{service,method,status}
http_request_duration_seconds{service,endpoint}

# 비즈니스
synapse_llm_cost_usd_total{tenant_id,model,operation}
synapse_llm_tokens_total{tenant_id,model,direction}
synapse_cards_due_total{tenant_id}
synapse_cache_hit_ratio{cache_type,operation}
synapse_review_accuracy{tenant_id,bloom_level}
synapse_subscription_active{plan}
synapse_quota_usage_ratio{tenant_id,resource}
```

#### Tracing (OpenTelemetry)
- end-to-end: Flutter → Gateway → Service → DB/LLM
- AI 호출은 별도 span: `llm.call`, `embedding.generate`, `vector.search`
- W3C Trace Context propagation
- Tempo 또는 Jaeger 로 백엔드

#### Logging (Loki / OpenSearch)
- JSON 구조화 (Logback JSON encoder)
- 표준 필드: `timestamp`, `level`, `service`, `traceId`, `tenantId`, `userId`, `message`
- 민감정보 자동 마스킹 (이메일, 토큰, 비밀번호)

#### LLM-Specific (LangSmith / Phoenix)
- 모든 LLM 호출 기록 (input/output/tokens/latency/cost)
- Eval 결과 추적
- Prompt template 버전 관리
- 회귀 알람

### 4.2 핵심 대시보드

| 대시보드 | 주요 위젯 |
|---------|----------|
| **Operations** | API P99, 에러율, 인스턴스 수, DB 연결 풀 |
| **Business** | MAU/DAU, MRR, Churn, 신규 가입, 결제 실패 |
| **LLM Cost** | 일별/시간별 비용, 모델별 분포, 캐시 적중률, tenant별 top |
| **Quality** | Recall@10, NDCG, 사용자 피드백 (thumbs up/down 비율) |
| **Security** | 인증 실패, MFA 챌린지, 의심 IP, audit log 이상 |

### 4.3 알람 정책

| 심각도 | 알람 | 대응 |
|--------|------|------|
| **P0** | 가용성 < 99%, DB 다운, 데이터 손실 | 즉시 페이저, 5분 내 응답 |
| **P1** | 에러율 > 5%, LLM 폭주, 결제 실패 다수 | Slack + 30분 내 응답 |
| **P2** | 단일 tenant 한도 초과, 캐시 적중률 급락 | Slack 알림 |
| **P3** | 디스크 70%, 백업 실패 | Slack 알림 (영업시간) |

---

## 5. 보안

### 5.1 인증

| 항목 | 정책 |
|------|------|
| 비밀번호 | BCrypt cost 12 + haveibeenpwned 체크 |
| OAuth | Google, GitHub, Apple, Microsoft |
| MFA | TOTP (Google Authenticator) + 백업코드 (10개) |
| Session | Access 1h + Refresh 14d (httpOnly + Secure + SameSite=Strict) |
| Brute Force | 5회 실패 = 15분 잠금, 10회 = 1시간 잠금 |
| Device Tracking | refresh_token에 device_id + UA + IP |
| 비밀번호 변경 | 모든 refresh_token revoke + 재로그인 강제 |

### 5.2 데이터 암호화

| 영역 | 방법 |
|------|------|
| Transit | TLS 1.3 |
| Rest (RDS) | AWS RDS encryption (AES-256) |
| Rest (S3) | SSE-S3 또는 SSE-KMS |
| Field-level (Phase 5+) | AES-256-GCM with KMS keys (민감 노트 옵션) |
| Backup | 암호화 + 별도 KMS key |

### 5.3 JWT 저장 (클라이언트)

| 환경 | 저장 위치 | 이유 |
|------|----------|------|
| **Web** | **httpOnly + Secure + SameSite=Strict 쿠키** | XSS 방어 |
| **Mobile (iOS)** | Keychain Services | OS 보안 |
| **Mobile (Android)** | EncryptedSharedPreferences | OS 보안 |
| **Desktop (Phase 5+)** | OS Keyring | OS 보안 |

#### Web CSRF 대응
- SameSite=Strict 기본
- 변경 작업에 CSRF 토큰 (`X-CSRF-Token` 헤더 + 서버 세션 검증)
- Origin 헤더 검증

### 5.4 PII 처리

#### 자동 탐지
정규식 + ML 모델 결합:
- 주민번호, 전화번호, 신용카드, API key 패턴
- 이메일 (사용자 옵션)
- 주소 (Phase 5+)

#### 처리 흐름
```
노트 작성 → PII 스캔 → 발견 시 사용자 알림 → 옵션:
  1. 그대로 저장 (사용자 결정)
  2. 마스킹 후 저장
  3. 작성 취소
LLM 전송 전 → 자동 마스킹 (사용자 옵션)
```

### 5.5 Audit Log

#### 기록 행위
- **인증**: signup, login (성공/실패), MFA, 비밀번호 변경, OAuth 연결, 강제 로그아웃
- **데이터**: 노트/카드 일괄 삭제, 데이터 내보내기, 첨부 다운로드
- **테넌트**: 멤버 추가/제거, 역할 변경, 정지
- **결제**: 플랜 변경, 결제 정보 수정, 환불
- **관리자**: 사용자 강제 로그아웃, tenant 정지, 데이터 접근
- **API**: API key 생성/폐기, rate limit 반복 초과

#### 보존
- 일반: 1년
- Enterprise: 7년
- 월별 파티션 + 24개월 이전 S3 archive (Glacier)

### 5.6 비밀 관리

| 비밀 | 저장 |
|------|------|
| DB credential | AWS Secrets Manager (자동 회전) |
| API keys (Stripe, Anthropic) | AWS Secrets Manager |
| JWT signing key | KMS managed |
| TOTP secret | DB (KMS 암호화 컬럼) |
| Refresh token | DB (SHA-256 해시만) |
| OAuth provider secrets | Secrets Manager |

### 5.7 보안 점검

| 주기 | 점검 |
|------|------|
| 매 PR | SAST (Snyk, SonarQube), 의존성 CVE |
| 매주 | Container image vulnerability scan |
| 매월 | 침투 테스트 (자동화) + 격리 테스트 |
| 분기 | 외부 보안 감사 (Phase 5+) |
| 연간 | SOC 2 감사 (Phase 6+) |

---

## 6. 컴플라이언스

### 6.1 법규 / 인증 매트릭스

| 인증/규제 | 우선순위 | 도입 시점 | 적용 대상 |
|-----------|---------|-----------|----------|
| **GDPR** | 높음 | Phase 1 | EU 사용자 |
| **CCPA** | 높음 | Phase 1 | 캘리포니아 |
| **한국 개인정보보호법** | 높음 | Phase 1 | 한국 사용자 |
| **PCI-DSS SAQ A** | 자동 | Phase 1 | Stripe Checkout 사용 |
| **SOC 2 Type II** | 중 | Phase 6 | B2B 고객 |
| **ISO 27001** | 중 | Phase 7 | 글로벌 엔터프라이즈 |
| **HIPAA** | 낮음 | (필요 시) | 의료 도메인 |

### 6.2 GDPR 사용자 권리 매핑

| 권리 | API | SLA |
|------|-----|-----|
| 열람 (Access) | `GET /me/data-export` | 30일 이내 |
| 삭제 (Right to be forgotten) | `DELETE /me/account` | 30일 grace + 즉시 처리 |
| 이동 (Portability) | `GET /me/data-export?format=...` | 30일 이내 |
| 수정 (Rectification) | 일반 PATCH API | 즉시 |
| 처리 제한 | 마케팅 옵트아웃 | 즉시 |
| 자동화 거부 | (현재 자동화 의사결정 없음) | N/A |

### 6.3 GDPR 데이터 삭제 처리

```
T+0: 사용자 DELETE /me/account
  ↓
T+0: deleted_at = NOW(), 로그아웃 강제
  (30일 grace, 사용자 로그인 시도 → 복구 안내)
  ↓
T+30: 일별 배치 잡 → hard delete + 익명화
  - 노트, 카드, 첨부, 청크 삭제
  - card_reviews 익명화 (분석용 보존)
  - users 테이블 익명화 (anonymized_at 설정)
  - audit_logs 보존 (compliance)
  - 백업도 30일 후 자동 정리
```

### 6.4 한국 개인정보보호법 추가 요구사항

- 개인정보 수집·이용 동의 (회원가입 시 명시)
- 개인정보 처리방침 공개 (한국어)
- 마케팅 수신 동의 별도 옵트인
- 개인정보 보호책임자 (DPO) 지정 + 공개
- 만 14세 미만은 법정대리인 동의 (Phase 4+)

### 6.5 SOC 2 준비 (Phase 6+)

5개 신뢰 서비스 기준 (TSC):
- **Security**: 위에서 다룸
- **Availability**: SLA 99.9%, DR 훈련
- **Processing Integrity**: 데이터 무결성 (트랜잭션, 검증)
- **Confidentiality**: 암호화, 접근 제어
- **Privacy**: GDPR 준수

준비 기간: 12~18개월 (감사 기간 포함). 외부 컨설턴트 + Vanta/Drata 자동화 도구.

---

## 7. 비용

### 7.1 단계별 시뮬레이션 (월간 USD)

| 단계 | MAU | 인프라 | LLM | 총 | 손익분기 (Pro) |
|------|-----|--------|-----|-----|----------------|
| MVP | 100 | $80 | $30 | $110 | 11명 |
| Early | 1,000 | $400 | $400 | $800 | 80명 |
| Growth | 10,000 | $3,000 | $4,000 | $7,000 | 700명 |
| Scale | 100,000 | $25,000 | $30,000 | $55,000 | 5,500명 |

가정:
- LLM: Free 평균 $0.30/월, Pro 평균 $4.00/월 (캐싱 70% 후)
- Pro 전환율 7~13%, 가격 $9.99
- 인프라: AWS RDS, ElastiCache, EKS, S3, CloudFront

### 7.2 LLM 비용 분해 (캐싱 후)

| 작업 | 모델 | 비용/요청 |
|------|------|-----------|
| 카드 생성 (10장) | Sonnet | $0.012 |
| 시맨틱 검색 | embedding-3-small | $0.00003 |
| Q&A | Sonnet | $0.015 |
| 노트 요약 | Haiku | $0.0015 |

### 7.3 비용 최적화 단계별

| Phase | 최적화 |
|-------|--------|
| 1-2 | Semantic Cache (가장 큰 효과) |
| 3 | Intelligent Routing + Tenant Quota |
| 4 | Anthropic Message Batches API (50% 할인) |
| 5 | Prompt Compression (LLMLingua) + Embedding Quantization |
| 5+ | Local vLLM tier (자체 호스팅) |

### 7.4 비용 모니터링 알람

| 알람 | 임계값 |
|------|--------|
| 일별 LLM 비용 > 예산 80% | Slack |
| Tenant 월 한도 80% | 사용자 이메일 + 운영 Slack |
| 시간당 LLM 호출 폭주 (10x baseline) | 자동 차단 + Pager |
| 캐시 적중률 < 50% | Slack (정상은 70%+) |

---

## 8. 운영 절차

### 8.1 출시 체크리스트

#### Phase 1 MVP 출시 전
- [ ] 모든 격리 테스트 통과
- [ ] DB 마이그레이션 staging 검증
- [ ] Stripe 테스트 카드 결제 흐름
- [ ] 이메일 발송 (verification, reset)
- [ ] Sentry + PostHog 통합 동작
- [ ] 데이터 export/delete 흐름 E2E 테스트
- [ ] 부하 테스트 (k6, 100 동시 사용자)
- [ ] 보안 스캔 (Snyk + 수동 점검)
- [ ] 약관 + 개인정보 처리방침 (한/영)
- [ ] 백업 자동화 검증
- [ ] 모니터링 대시보드 + 알람

### 8.2 인시던트 대응

#### Severity 정의
| Sev | 정의 | 응답 시간 |
|-----|------|-----------|
| **SEV-1** | 가용성 영향, 데이터 손실 위험 | 5분 |
| **SEV-2** | 일부 기능 영향, 다수 사용자 영향 | 30분 |
| **SEV-3** | 단일 사용자 영향, 우회 가능 | 4시간 |
| **SEV-4** | 사소, 우회 쉬움 | 영업일 |

#### Runbook
- `runbook/db-down.md` — DB 다운 시
- `runbook/llm-cost-spike.md` — LLM 비용 폭주
- `runbook/data-leak.md` — 격리 위반 의심
- `runbook/stripe-webhook-failure.md`
- `runbook/redis-cluster-failover.md`

### 8.3 Postmortem
- SEV-1, SEV-2 인시던트는 48시간 내 작성
- Blameless 원칙
- 5 Whys + Action items 명시
- 사용자 영향 + 보상 정책 (필요 시)

### 8.4 온콜 (Phase 4+)
- 1주 단위 로테이션
- PagerDuty 연동
- Tier 1 (1차 대응) + Tier 2 (escalation)
- 야간 응답률 / MTTR 추적

### 8.5 변경 관리

| 변경 유형 | 절차 |
|----------|------|
| **마이너 (코드)** | PR + 리뷰 + CI 통과 → staging → prod |
| **DB 스키마** | + DBA 리뷰 + dry-run + 롤백 계획 |
| **인프라** | + Terraform plan 리뷰 + 변경 윈도우 |
| **보안** | + 보안팀 리뷰 + 감사 로그 |
| **결제** | + 회계 리뷰 + Stripe 테스트 모드 검증 |

---

## 9. 다음 단계

1. **ADR 작성** (`docs/adr/`):
   - ADR-001: Multi-tenancy 모델 (Pool + RLS)
   - ADR-002: LLM Cost Optimization 전략
   - ADR-003: 인증 토큰 저장 (httpOnly Cookie)
   - ADR-004: Stripe vs Paddle 결제 프로바이더
   - ADR-005: 모니터링 스택 (Prometheus vs Datadog)

2. **Runbook 작성** (`docs/runbook/`)

3. **운영 자동화 스크립트**:
   - `scripts/dr-drill.sh` — DR 훈련
   - `scripts/isolation-test.sh` — 격리 검증
   - `scripts/cost-report.sh` — 일별 비용 리포트

4. **문서**:
   - 사용자 약관 + 개인정보처리방침
   - SLA 정의서
   - SOC 2 정책 문서 (Phase 6+)

---

## 10. 참고 자료

### Multi-Tenancy
- [AWS SaaS Lens](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/saas-lens.html)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### LLM Production
- [LangSmith](https://www.langchain.com/langsmith)
- [Phoenix by Arize](https://phoenix.arize.com)
- [LLMLingua](https://github.com/microsoft/LLMLingua)
- [Anthropic Batches](https://docs.claude.com/en/docs/build-with-claude/batch-processing)

### SaaS Foundations
- [Stripe Docs](https://docs.stripe.com)
- [PostHog](https://posthog.com)
- [Sentry](https://sentry.io)

### Compliance
- [GDPR.eu](https://gdpr.eu)
- [SOC 2 TSC](https://www.aicpa.org/resources/landing/soc-2-trust-services-criteria)
- [개인정보보호위원회](https://www.pipc.go.kr)
- [Vanta](https://www.vanta.com) / [Drata](https://drata.com) — SOC 2 자동화

---

**문서 버전**: v2.0
**최종 수정**: 2026-04-30
**v1.0 → v2.0 주요 변경**:
- 파일명 변경: `04_production_track.md` → `04_operations_security.md`
- "포트폴리오 vs 상용화" 비교 섹션 제거 (단일 트랙)
- "비용 시뮬레이션", "비즈니스 KPI" 등 비즈니스 영역은 `01_project_overview.md` 로 이동
- 본 문서는 **운영/보안에 집중** (인프라, observability, compliance, incident response)
- 운영 절차 (출시 체크리스트, 인시던트 대응, postmortem, 온콜) 신규 추가
