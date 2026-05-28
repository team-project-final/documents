# 18 기술 스택 정의서 카테고리 검증 — 마스터 설계

> 작성일: 2026-05-28
> 대상 위키: `documents.wiki/18_기술_스택_정의서.md` (현재 v2.2)
> 작성자: Synapse Team (에이전트: claude-opus-4-7)
> 관련 메모리: `data-sync-outbox-cqrs`, `deploy-mirror-standardization`, `git-pr-workflow`
> 이 스펙은 6개 카테고리 세션의 공통 표준이며, 각 세션은 본 스펙을 그대로 따른다.

---

## 0. 배경 & 목적

`18_기술_스택_정의서.md`는 5498줄·8 레이어·30+ 기술을 다루는 백과사전 형식의 위키 문서다.
v2.2(2026-05-28) 데이터 동기화 정합화 직후 시점에서, **각 기술 설명·설정 코드·예시의 사실 정확성**과
**보강이 필요한 깊이**를 체계적으로 검증한다.

단일 세션 깊은 검증은 비현실적이므로 **기술적 성격으로 재분류한 6개 카테고리 세션**으로 분할 수행한다.
세션 간 인계는 본 스펙과 마스터 인덱스를 통해 보장된다.

### 검증으로 답해야 할 질문
- 명시된 버전·옵션·API명이 공식 문서와 일치하는가?
- 예시 설정·코드가 실제 동작하는가? (`synapse-*` 레포 실 코드와의 정렬)
- 보강 가치가 명백한 빠진 옵션·운영 함정·베스트프랙티스가 있는가?
- 18 문서 자체의 구조적 결함(절 번호 충돌, 표 누락 등)이 있는가?

---

## 1. 검증 방법론 — 세션 내부 6단계 파이프라인

각 카테고리 세션은 다음 6단계를 순서대로 실행한다.

### Step 1. 카테고리 인벤토리
- 18 문서에서 해당 카테고리의 모든 `###` 절 열거
- 표 컬럼: 절 번호 / 기술명 / 명시 버전 / 항목 길이(라인 수) / 코드 블록 개수 / 1차 진단
- 산출: 보고서 §1

### Step 2. skill-recommender 1회 실행 (카테고리 단위)
- 스크립트: `node C:\workspace\dsd\.claude\skills\skill-recommender\scripts\search-catalog.cjs --catalog C:\workspace\dsd\skill-catalog\catalog.json --keywords "<카테고리 기술 키워드들>" --limit 30 --type all`
- 결과에서 **공식 마켓플레이스 플러그인 / 공식 MCP / verified 스킬**을 우선 채택
- 채택한 도구는 Step 3에서 우선 활용 (예: 공식 도큐먼트 MCP가 있다면 그것을 통해 패치)
- 산출: 보고서 §2

### Step 3. context7로 공식 도큐먼트 패치 (병렬)
- 각 기술마다: `mcp__plugin_context7_context7__resolve-library-id` → `query-docs`
- 패치 토픽: `configuration`, `version compatibility`, 그리고 18 문서가 다룬 핵심 주제
- context7가 매핑 못 하는 라이브러리는 `WebFetch`로 공식 URL 직접 패치(18 문서 명시 URL 활용)
- 산출: 보고서 §3 (기술별 인용·진단)

### Step 4. 실 코드 대조 (`synapse-*` 레포)
- 의존성 추출 대상: `build.gradle(.kts)` / `pom.xml` / `pubspec.yaml` / `pyproject.toml` / `requirements.txt`
- 설정 추출 대상: `application.yml` / `Dockerfile` / `docker-compose.yml` / `*.argocd/*.yaml` / `helm/values*.yaml`
- 18 문서가 명시한 "프로젝트 내 사용 위치" 경로 실재 여부 확인 (`Glob`)
- 메모리 표준(예: `data-sync-outbox-cqrs`의 파티션 키 표준)과의 정합성
- 산출: 보고서 §4

### Step 5. 발견사항 분류 + 보고서 작성
- §3 분류 체계 적용(E1/E2/D/R/OK + P0/P1/P2)
- 모든 finding에 `evidence_official` 또는 `evidence_repo` 첨부
- 산출: 보고서 §1 요약 통계, §6 Findings, §7 Deep Dive 일람, §9 후속 과제

### Step 6. 위키 일괄 패치 + 단일 커밋
- `documents.wiki/18_기술_스택_정의서.md` 직접 `Edit`
- 강화 방식: 제자리 교체(E1/E2/D) + 절 끝 "더 깊이 / Deep Dive" 부속 서브섹션 추가(R)
- §11 변경 이력에 `v2.3-S{N}` 행 추가
- 단일 커밋 + `git push origin master` (GitHub Wiki는 PR 없음)
- 산출: 위키 커밋 SHA → 보고서 헤더에 기입

---

## 2. 카테고리 매핑 (6 세션)

### S1. 언어 (Languages)
| 절 | 기술 | 비고 |
|----|------|------|
| 4.1.1 | Java 21 (LTS) | |
| 4.2.1 | Python 3.12 | |
| 2.2 | Dart 3.x | |

**검증 초점**: LTS 라이프사이클, EoL 일자, ZGC/Virtual Threads, Pattern Matching/Records 등 18 문서가 명시한 기능

### S2. 프레임워크 (Frameworks)
| 절 | 기술 | 분류 |
|----|------|------|
| 4.1.2 | Spring Boot 4 | Backend(Spring) |
| 4.1.3 | Spring Security 7 | Backend(Spring) |
| 4.1.4 | Spring Data JPA + Hibernate 7 | Backend(Spring) |
| 4.1.5 | Flyway 10.x | Backend(Spring) |
| 4.1.6 | Spring WebFlux | Backend(Spring) |
| 4.1.8 | Spring Modulith 2.0.x | Backend(Spring) |
| 4.2.2 | FastAPI | Backend(Python) |
| 4.2.3 | uvicorn | Backend(Python) |
| 4.2.4 | LangChain | Backend(Python) |
| 4.2.5 | httpx | Backend(Python) |
| 2.1 | Flutter 3.x | Frontend |
| 2.3 | Riverpod | Frontend |
| 2.4 | GoRouter | Frontend |
| 2.4 | google_fonts | ⚠ 절 번호 충돌 — 첫 발견사항 |
| 2.5 | Sliver 기반 리스트 | Frontend |
| 2.5 | CanvasKit | ⚠ 절 번호 충돌 — 첫 발견사항 |
| 2.6 | D3.js / force_directed | Frontend |
| 2.7 | flutter_test + integration_test | Frontend |
| 3.1 | Spring Cloud Gateway 5 | Gateway |

**검증 초점**: Boot 4 + Cloud Oakwood + Security 7 + JPA/Hibernate 7 호환 매트릭스, Modulith 1.x→2.0.x 갱신 정합성, Riverpod 3.0 코드 생성 워크플로, FastAPI lifespan/DI 최신 패턴

**S2 분할 옵션**: 분량이 임계치를 넘으면 세션 도중 S2a(백엔드)/S2b(프론트+게이트웨이)로 분할 가능. 분할 시 인덱스의 진행률 행을 두 줄로 나눠 기록.
- 분할 트리거 기준 (다음 중 하나라도 충족 시): (a) Step 3 context7 패치가 13개 기술 이상 누적, (b) Step 5 finding 누계 25건 초과, (c) 보고서 본문이 800줄 초과 추정, (d) 컨텍스트 윈도우 사용량이 60% 초과.

### S3. 데이터스토어 (Data Stores)
| 절 | 기술 |
|----|------|
| 5.1.1 | PostgreSQL 16 |
| 5.1.2 | pgvector 0.8.x |
| 5.2 | Redis 7 Cluster |
| 5.3.1 | Elasticsearch 8 + nori |
| 5.7 | AWS S3 |

**검증 초점**: PG 16 파티셔닝/RLS, pgvector HNSW 파라미터, Redis 7 vs 7.4.9 LTS 정책, ES 8 nori 형태소 옵션, S3 KMS·버저닝·라이프사이클

### S4. 이벤트/동기화 (Event & Sync)
| 절 | 기술 | 비고 |
|----|------|------|
| 5.4 | Apache Kafka 3.x | v2.2 갱신 직후 |
| 5.5 | Confluent Schema Registry 7.x | |
| 5.6 | Apache Avro 1.11.x | |
| 3.2 | Resilience4j | |
| 3.3 | Redis Token Bucket | |
| — | ShedLock 7.7.x | 표에만 있음. 독립 절 신설 검토 |
| — | Outbox/Polling Relay | §5.4 예제만 있음. 운영 패턴 절 신설 검토 |

**검증 초점**: Boot 4 + Spring Kafka 4 + Avro 1.11 + Schema Registry 7 호환, 메모리 `data-sync-outbox-cqrs`와의 일치(파티션 키 `{tenant_id}:{aggregate_id}`, KafkaAvroSerializer·specific.avro.reader 설정), 02_ERD §2.3.A / 03-A §A.10~A.11 상호참조 무결성

### S5. 운영/관측성 (Operations & Observability)
| 절 | 기술 | 분류 |
|----|------|------|
| 7.1 | Docker + Docker Compose | Infra |
| 7.2 | AWS EKS | Infra |
| 7.3 | ArgoCD (+ ApplicationSet) | Infra |
| 7.4 | GitHub Actions | Infra |
| 7.5 | Cloudflare | Infra |
| 7.6 | Istio | Infra |
| 7.7 | AWS ECR | Infra |
| 8.1 | Prometheus + Grafana | Observability |
| 8.2 | Fluent Bit + CloudWatch/Loki | Observability |
| 8.3 | OpenTelemetry + Jaeger | Observability |
| 8.4 | Sentry | Observability |
| 8.5 | AlertManager + Slack | Observability |
| 4.1.7 | Testcontainers | 이관 후보 |
| 4.2.6 | pytest | 이관 후보 |

**검증 초점**: EKS 1.31+ / ArgoCD 3.4 / Helm 4 호환, Istio + Cloudflare WAF 정책, GitHub Actions ↔ ECR OIDC(메모리 `deploy-mirror-standardization` 참조), Prometheus·Grafana 차트 버전

### S6. 외부 API + AI/ML (External & AI)
| 절 | 기술 |
|----|------|
| 6.1 | Anthropic Claude API |
| 6.2 | OpenAI Embeddings |
| 6.3 | RAG 파이프라인 |
| 6.4 | 시맨틱 캐시 |
| 9.1 | Stripe |
| 9.2 | OAuth 제공자 |
| 9.3 | FCM / APNs |
| 9.4 | AWS SES |
| 9.5 | AWS Secrets Manager |

**검증 초점**: Claude/OpenAI 최신 모델 ID·요금·rate limit(현재 시점 2026-05), Stripe Checkout/Subscriptions 최신, OAuth 2.1 PKCE 강제, FCM v1 API, SES 도메인 검증·DKIM

---

## 3. 발견사항 분류 체계

### 3.1 클래스 (5종)

| 코드 | 명칭 | 정의 | 처리 방침 |
|------|------|------|-----------|
| **E1** | 사실 오류 | 공식 문서·실 코드와 명백히 다름 (버전, API명, 기본값) | 제자리 교체 + 공식 인용 첨부 |
| **E2** | 설정/코드 오류 | 예시가 컴파일 안 됨, 잘못된 옵션 키, 지원 종료 문법 | 제자리 교체 + 동작 검증한 코드로 |
| **D** | 표류/불일치 | 문서 ↔ `synapse-*` 레포 간 버전·설정 불일치 | 진실 결정 후 정렬. 결정 근거 보고서에 명시 |
| **R** | 보강 권장 | 정확하지만 얕음 — 빠진 옵션·트러블슈팅·베스트프랙티스 | 본문 유지 + 절 끝 "더 깊이 / Deep Dive" 추가 |
| **OK** | 검증 통과 | 공식·실 코드와 일치, 깊이도 충분 | 보고서에 한 줄 + 증거 링크 1~2개 |

### 3.2 심각도 (3종)

- **P0**: 따라 했을 때 장애·보안 위험 (잘못된 인증·암호화·DB 설정)
- **P1**: 따라 했을 때 빌드·런타임 오류 (잘못된 버전·API명·옵션 키)
- **P2**: 표현·깊이·일관성 (의미는 통하지만 개선 여지)

### 3.3 보고서 finding 표준 필드

```yaml
finding_id: S2-F03
section: "§4.1.2 Spring Boot 4"
class: E1            # E1 | E2 | D | R | OK
severity: P1         # P0 | P1 | P2
title: "<짧은 제목>"
evidence_official: |
  <context7 인용 또는 공식 URL>
evidence_repo: |
  <synapse-*/path:line>   # 해당될 때
current_text: |
  <18 문서 현재 표현 발췌>
proposed_text: |
  <대체 또는 추가 텍스트>
patch_target: "documents.wiki/18_기술_스택_정의서.md L<from>-L<to>"
deep_dive: false     # R 클래스일 때 true
```

---

## 4. 산출물 구조

### 4.1 보고서 — `documents` 레포

**경로**: `documents/docs/superpowers/specs/2026-05-28-stack-review-S{N}-{slug}.md`

**섹션** (고정 9개):
1. 요약 (Summary) — 클래스·심각도 통계
2. 카테고리 인벤토리 (Step 1)
3. skill-recommender 결과 (Step 2)
4. 공식 문서 검증 결과 (Step 3)
5. 실 코드 대조 결과 (Step 4)
6. 발견사항 (Findings) — finding_id별 표준 필드 블록
7. "더 깊이 / Deep Dive" 보강 항목 일람 (R 클래스 모음)
8. 위키 패치 diff 요약
9. 후속 과제 (Follow-ups) — 다른 세션·다른 문서로 위임

### 4.2 위키 패치 — `documents.wiki` 레포

**파일**: `documents.wiki/18_기술_스택_정의서.md` (단일)

**제자리 교체 (E1/E2/D) 규칙**:
- 같은 코드 펜스 언어 유지
- 기존 한국어 주석 톤 유지
- 표 값만 바뀌면 표 전체 재정렬 금지

**Deep Dive 부속 서브섹션 (R) 형식 — 고정**:
```markdown
#### 더 깊이 / Deep Dive
> 출처: <공식 URL 또는 context7 query>  · 검증 일자: 2026-05-28

- **<주제 1>**: <2~5줄>
- **<주제 2>**: <2~5줄>
- **실전 베스트프랙티스**: ...
- **운영 함정**: ...
```
- 위치: 해당 `###` 절의 "참고 자료" **바로 위**
- 추가 트리거 기준 (다음 중 하나라도 충족 시 추가): (a) 공식 문서에 명시된 핵심 옵션·기능이 18 문서에 누락, (b) 운영 함정(흔한 장애 시나리오·성능 저하 원인)이 빠짐, (c) 18 문서가 다룬 주제의 베스트프랙티스가 공식 출처에 명시되어 있지만 18 문서에 미반영. 이외에는 추가하지 않음.

**§11 변경 이력**:
```
| v2.3-S{N} | 2026-05-28 | Synapse Team | S{N} {category} 검증 반영 — E1:a/E2:b/D:c/R:d (보고서: documents PR #<num>) |
```

### 4.3 마스터 인덱스 — `documents` 레포

**경로**: `documents/docs/superpowers/specs/2026-05-28-stack-review-INDEX.md`

본 스펙 §6.1 템플릿 사용. 세션 종료마다 갱신·푸시.

---

## 5. 운영 워크플로

### 5.1 레포·브랜치 정책

```
documents.wiki (master)            documents (main)
────────────────────────           ──────────────────────────────
GitHub Wiki — PR 불가              일반 레포 — PR 사용
세션마다 master 직접 푸시           세션마다 브랜치→PR
                                    (memory: git-pr-workflow)
```

### 5.2 세션 1회 실행 사이클 (10 step)

```
1. cd documents.wiki && git pull --rebase origin master
2. cd documents && git pull --rebase origin main
   git checkout -b docs/stack-review-S{N}-{slug}
3. §1 6단계 파이프라인 실행
4. documents 보고서 md 작성
5. documents.wiki/18_*.md Edit (E1/E2/D 제자리 교체 + R Deep Dive 삽입 + §11 변경 이력 갱신)
6. cd documents.wiki && git add -u 18_기술_스택_정의서.md
   git commit -m "docs(stack): S{N} {category} — context7·repo 검증 반영 + 보강

E1:a · E2:b · D:c · R:d · OK:e
P0:x · P1:y · P2:z

Refs: documents PR #<TBD>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
   git push origin master
7. 위키 커밋 SHA → 보고서 헤더 "위키 패치 커밋:" 기입
8. cd documents && git add <보고서 md> <INDEX.md>
   git commit -m "docs(stack-review): S{N} {category} 보고서

위키 커밋: documents.wiki@<sha>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
   git push -u origin docs/stack-review-S{N}-{slug}
   gh pr create --base main --title "docs(stack-review): S{N} {category}" --body ...
9. PR 번호로 INDEX 재갱신·커밋·푸시
10. 머지·배포는 사용자 (에이전트 대기) — memory: git-pr-workflow
```

### 5.3 커밋 규칙

- 위키: 세션당 단일 커밋. `git add -u` 사용. force-push 금지.
- 보고서: 세션당 1~2 커밋. PR 1개. base=main. 에이전트 머지 금지.
- 무관한 미추적 파일은 절대 커밋하지 않음 (`git add -u` + 명시적 파일 지정).

### 5.4 인터럽트/롤백

- 위키 패치 전 중단: 보고서만 WIP로 남기고 INDEX `in_progress` 표시
- 위키 push 후 중단: 보고서까지 반드시 push (갭이 가장 위험)
- 롤백: 위키 `git revert <sha>` + 보고서 PR close 또는 revert 커밋. INDEX에 `reverted` + 사유

### 5.5 범위 격리

- 작업 중 발견된 다른 절·다른 문서 결함은 보고서 §9 후속 과제로만 기록
- 18 문서 외(02_ERD, 03-A 등) 수정은 권고만, 별도 작업으로 분리

---

## 6. 마스터 진행 추적

### 6.1 인덱스 파일 템플릿

**경로**: `documents/docs/superpowers/specs/2026-05-28-stack-review-INDEX.md`

```markdown
# 18 기술 스택 정의서 — 카테고리 검증 진행판

작성일: 2026-05-28
마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
대상 위키: documents.wiki/18_기술_스택_정의서.md v2.2 → v2.3 (예정)

## 세션 진척
| 세션 | 카테고리 | 상태 | 보고서 PR | 위키 커밋 | E1/E2/D/R/OK | P0/P1/P2 | 시작일 | 종료일 |
|------|---------|------|---------|---------|-------------|---------|--------|--------|
| S1 | 언어 | pending | - | - | - | - | - | - |
| S2 | 프레임워크 | pending | - | - | - | - | - | - |
| S3 | 데이터 | pending | - | - | - | - | - | - |
| S4 | 이벤트 | pending | - | - | - | - | - | - |
| S5 | 운영 | pending | - | - | - | - | - | - |
| S6 | 외부/AI | pending | - | - | - | - | - | - |

## 누적 통계
- 검증한 기술 수: 0 / 약 45
- E1: 0 · E2: 0 · D: 0 · R: 0 · OK: 0
- P0: 0 · P1: 0 · P2: 0
- 문서 자체 결함(절 번호 충돌 등) 발견 누계: 0

## 세션 간 발생한 교차 발견사항
- (S{N}에서 발견했지만 다른 세션 영역인 항목 — 해당 세션으로 위임 표시)

## 후속 과제 큐 (Follow-ups)
- 18 문서 외 위키 문서(02_ERD, 03-A 등) 권고된 수정 사항
- v2.3 통합 정리 작업(전 세션 완료 후)

## 메모리 갱신 후보
```

### 6.2 세션 시작 시 컨텍스트 복원 (5 step)

각 카테고리 세션은 새 대화에서 시작. 다음 순서로 인계:

1. 마스터 인덱스 읽기 (누적 통계·이전 위임 항목·후속 과제 큐)
2. 마스터 스펙(이 문서) 읽기 (방법론·분류·산출물·워크플로)
3. 직전 세션 보고서 §9 후속 과제 확인 (본 세션 영역으로 위임된 항목)
4. 메모리 확인 (`MEMORY.md` + 관련 메모리 파일)
   - `data-sync-outbox-cqrs` (S4 필수)
   - `deploy-mirror-standardization` (S5 필수)
   - `git-pr-workflow` (전 세션 필수)
5. Step 1 인벤토리 시작

### 6.3 세션 종료 체크리스트 (Definition of Done)

세션을 "완료"로 표시하기 전 다음 모두 충족:

- [ ] §1 6단계 파이프라인 6/6 완료
- [ ] 보고서가 §4.1 9개 섹션 모두 채워짐
- [ ] 모든 finding에 `evidence_official` OR `evidence_repo` 첨부
- [ ] 모든 E1/E2/D 항목이 `patch_target`에 매핑
- [ ] 위키 커밋 SHA가 보고서 헤더에 기입
- [ ] documents 측 PR 생성 완료
- [ ] 마스터 인덱스 갱신·푸시 완료
- [ ] 위임 항목이 인덱스 "교차 발견사항"에 기록
- [ ] 후속 과제가 인덱스 "후속 과제 큐"에 추가
- [ ] 메모리 갱신 후보 식별 (있다면)

### 6.4 6세션 종료 후 마무리 작업 (선택)

- 18 문서 §11 변경 이력에 `v2.3` 통합 행 추가 (S1~S6 합본)
- 18 문서 §1.4 / §10.1 / §12 호환성 표 일관성 재검토
- 마스터 인덱스 최종본 잠금 (CHANGELOG 성격 보존)
- 메모리 갱신 (확정된 표준이 있다면)

---

## 7. 범위 외 (Out of Scope)

다음은 본 검증 작업의 명시적 범위 외:

- 18 문서 외 위키 문서(02_ERD, 03-A 등) 본문 수정 — 권고만
- `synapse-*` 레포의 실제 코드 변경 — 검증 결과 18 문서가 옳고 코드가 틀린 경우라도 코드 수정은 별도 작업
- 신규 기술 도입 제안 — 본 작업은 "기록된 것의 검증"이지 "추가할 것의 결정"이 아님
- 18 문서 전체 v2.3 통합 정리 — §6.4 선택 작업으로 분리

---

## 8. 위험 & 완화책

| 위험 | 영향 | 완화 |
|------|------|------|
| 위키 push 후 보고서 push 누락 | 변경 근거 미공개로 추적 불가 | §5.2 step 8을 step 6 직후 반드시 수행. INDEX `in_progress`로 표시 |
| 세션 도중 분량 초과 | 6단계 미완으로 보고서 불완전 | S2 분할 옵션 적용. 또는 보고서 §9 "후속 과제"로 일부 위임 |
| context7가 라이브러리 매핑 못 함 | 공식 문서 패치 실패 | `WebFetch`로 18 문서 명시 URL 직접 패치. 그래도 실패 시 evidence_official 부재 표시 + finding은 D/R로 분류(E1 단정 회피) |
| skill-recommender 카탈로그 오래됨 | 추천 도구 부실 | 카탈로그 사용 + 추천은 보조 자원. 검증의 진실 원천은 context7·실 코드 |
| 메모리와 위키 사이 표준 충돌 | 어느 쪽이 진실인지 모호 | 결정 회의가 아니라 결정 사실 적용. 메모리에 명시된 표준이 있으면 그것이 진실. 위키가 어긋나면 D 클래스로 패치 |

---

## 부록 A. 세션 슬러그 표준

- S1: `languages`
- S2: `frameworks` (분할 시 `frameworks-backend`, `frameworks-frontend`)
- S3: `datastores`
- S4: `event-sync`
- S5: `operations`
- S6: `external-ai`

## 부록 B. 변경 이력

| 버전 | 날짜 | 변경 |
|------|------|------|
| v1.0 | 2026-05-28 | 마스터 설계 초안 — 6 세션 분할, 6단계 파이프라인, 분류 체계 E1/E2/D/R/OK · P0/P1/P2 확정 |
