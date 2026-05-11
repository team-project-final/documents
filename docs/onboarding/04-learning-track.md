# 04 — 트랙 D: Learning 합류 가이드 (Java + Python 페어)

> **트랙 mention**: `@learning-card-owner` (Java), `@learning-ai-owner` (Python) — 2명 페어, 스택 분담
> **담당 레포**: `synapse-learning-svc` (모노레포 — Java multi-module + Python sub-tree)
> **담당 도메인**: card · srs (Java) + ai (Python/FastAPI) — 가장 무거운 서비스
> **소요**: Day 1 트랙 작업 ~3.5시간 (스택 차이로 환경 셋업이 더 김)

---

## 페어 분담 (스택별)

| 멤버 | sub-tree | 책임 |
|---|---|---|
| `@learning-card-owner` | `learning-card/` (Java) | 카드/덱 CRUD + SM-2 알고리즘 + 복습 큐/세션 + `card.reviewed`/`card.review.due` Kafka 발행 |
| `@learning-ai-owner` | `learning-ai/` (Python) | LLM 카드 자동 생성 + 시맨틱 검색 + 시맨틱 캐시 + RAG Q&A |

페어 프로그래밍은 **인터페이스(Kafka 토픽 + Internal REST API) 부분만**. 나머지는 분담 (한 명 Java, 한 명 Python). 인터페이스 합의가 트랙 D의 가장 큰 협업 포인트.

---

## Day 1 트랙별 흐름

```
0. 환경 점검 (15분 — Java + Python 둘 다)
1. 레포 클론 + 로컬 빌드 (30분 — Gradle + Python pip)
2. 위키 트랙 정독 (50분)
3. SECRETS.md 발급 (40분 — Anthropic + OpenAI 가입)
4. 스택별 첫 비즈니스 PR (90분)
```

---

## 1. 환경 점검 (15분)

### Java 측 (learning-card-owner)
```bash
java --version         # Temurin 21.0.x
./gradlew --version    # Gradle 8.10+
```

### Python 측 (learning-ai-owner)
```bash
python --version       # Python 3.11+
pip --version
# 가상환경 권장: pyenv 또는 .venv
python -m venv .venv
source .venv/bin/activate   # bash
.venv\Scripts\Activate.ps1  # PowerShell
```

### 공통
```bash
docker --version       # 24.x+
```

PostgreSQL + pgvector + Redis + Elasticsearch + Kafka가 Docker Compose로 뜸. learning-svc는 거의 모든 인프라에 의존.

---

## 2. 레포 클론 + 로컬 빌드 (30분)

```bash
cd D:/workspace/synapse
gh repo clone team-project-final/synapse-learning-svc
gh repo clone team-project-final/synapse-shared

cd synapse-learning-svc
```

### Java 빌드
```bash
./gradlew :learning-card:clean :learning-card:build --no-daemon
```
기대: `BUILD SUCCESSFUL` + Modulith verify (card/srs 2 모듈 + shared).

```bash
./gradlew :learning-card:bootRun
curl http://localhost:8084/actuator/health
```

### Python 빌드
```bash
cd learning-ai
pip install -e ".[dev]"
pytest                  # 2 passing (test_health_returns_ok, test_ready_returns_ready)
ruff check app/ tests/  # 0 errors
uvicorn app.main:app --reload --port 8090
# 다른 터미널:
curl http://localhost:8090/health
# > {"status":"ok"}
```

---

## 3. 위키 트랙 정독 (50분)

| 문서 | 자기 영역 |
|---|---|
| **02 ERD 문서** §2.2.4 | 카드/SRS 도메인 (card_decks / cards / card_reviews / review_sessions) |
| **02 ERD 문서** §2.2.5 | AI/RAG 도메인 (semantic_cache / llm_usage_logs / llm_feedback) |
| **04 API 명세서** §4.7 (Cards/Decks) / §4.8 (SRS) / §4.10 (AI) | 트랙 D 책임 엔드포인트 |
| **05 화면 흐름 시퀀스** §5.4 (AI 카드 자동 생성) / §5.5 (복습 SRS 스케줄링) / §5.6 (시맨틱 검색 RRF) | 핵심 시나리오 |
| **07 요구사항** §2.3 (CARD) / §2.4 (SRS) / §2.6 (AI) | FR-CARD-001~004, FR-SRS-001~004, FR-AI-001~005 |
| **18 기술 스택** §4.5 (AI 비용 통제 다층 방어) | Semantic Cache + Intelligent Routing + Tenant Quota |

핵심 결정사항:
- **SM-2 알고리즘**: `srs_state` JSONB (`{easeFactor, intervalDays, repetitions, lapses}`). 02 ERD §2.2.4 + §6.2 — 알고리즘 교체 가능하도록 `srs_algorithm` 컬럼.
- **시맨틱 캐시 70% 절감**: ERD §2.2.5 semantic_cache 표 + 04 API §5.2 — exact match → embedding match (sim ≥ 0.95).
- **AI 사용량 한도**: Free 100K tokens/월, Pro 5M, Team 20M. plan_quotas + usage_counters + llm_usage_logs 3중 추적.
- **Kafka 인터페이스**: card 모듈이 `card.reviewed` 발행 → engagement-svc gamification이 소비 (XP 적립). learning-ai의 카드 자동 생성은 knowledge-svc의 `note.created` 소비.

---

## 4. SECRETS.md 발급 (40분)

```bash
cat docs/SECRETS.md
```

### 4.1 Anthropic API (learning-ai 주 LLM)

1. https://console.anthropic.com → API keys → Create key
2. 이름: `synapse-learning-ai-{env}`
3. Workspace billing 설정 (W1엔 dev tier로 충분, 무료 크레딧 활용)

```bash
gh secret set ANTHROPIC_API_KEY --repo team-project-final/synapse-learning-svc
```

> 모델 선택은 18 기술 스택 §4.5 Intelligent Routing:
> - Free 사용자 → `claude-haiku-4-5`
> - Pro/Team → `claude-sonnet-4-6` (default)
> - 복잡 작업 → `claude-opus-4-7`

### 4.2 OpenAI API (embedding 위주)

1. https://platform.openai.com → API keys → Create new secret key
2. 사용 한도 설정 (`Usage limits` — 월 $50로 시작)

```bash
gh secret set OPENAI_API_KEY --repo team-project-final/synapse-learning-svc
```

> 모델 선택:
> - Embedding: `text-embedding-3-small` (벡터 차원 1536, 가성비 최고)
> - W2+ 대안: `bge-m3` (다국어 + 자체 호스팅, 18 기술 스택 §4.2)

### 4.3 (선택) LangSmith — LLM 관측

W2+ AI 비용 모니터 필요할 때 발급. W1엔 skip.
1. https://smith.langchain.com → Settings → API Keys

```bash
# W2 발급 시:
gh secret set LANGCHAIN_API_KEY --repo team-project-final/synapse-learning-svc
gh secret set LANGCHAIN_TRACING_V2 --body "true" --repo team-project-final/synapse-learning-svc
```

---

## 5. 스택별 첫 비즈니스 PR (90분)

### Java 측: 첫 PR — card 모듈 카드/덱 CRUD

```bash
git checkout -b feature/LEARN-CARD-002-card-deck-crud
```

| 파일 | 변경 |
|---|---|
| `learning-card/src/main/java/com/synapse/learning/card/Card.java` + `CardDeck.java` (Entity) | JPA + @TenantId + srs_state JSONB |
| `learning-card/src/main/java/com/synapse/learning/card/CardService.java` + `CardDeckService.java` | CRUD 로직 |
| `learning-card/src/main/java/com/synapse/learning/card/CardController.java` + `CardDeckController.java` | `/api/v1/decks` + `/api/v1/cards` |
| `learning-card/src/main/java/com/synapse/learning/card/CardPlaceholderComponent.java` | Delete |
| 테스트: `CardServiceTest`, `Sm2AlgorithmTest` (SRS는 다음 PR이지만 골격) | TDD |

### Python 측: 첫 PR — ai 모듈 시맨틱 검색 skeleton

```bash
git checkout -b feature/LEARN-AI-002-semantic-search-skeleton
```

| 파일 | 변경 |
|---|---|
| `learning-ai/app/ai/embedding.py` (Create) | OpenAI embedding API client |
| `learning-ai/app/ai/semantic_search.py` (Create) | pgvector 쿼리 + tenant 필터 |
| `learning-ai/app/api/__init__.py` + `learning-ai/app/api/ai_router.py` (Create) | `POST /ai/search/semantic` |
| `learning-ai/app/main.py` (Modify) | router include |
| `learning-ai/tests/test_semantic_search.py` (Create) | MockLLMClient + pytest |

### PR 순서

- Java + Python PR은 **독립적**으로 머지 가능 (각자 sub-tree).
- 인터페이스(Kafka 토픽 페이로드, internal REST API) 변경이 있는 PR만 둘이 합의 후 진행.
- W2~W3에 Java가 `card.reviewed` 발행 → Python이 소비 시점부터 페어 협의 늘어남.

---

## 6. W1~W5 트랙 D 일정 (17 스케줄 v3.0)

| 주차 | Java (learning-card-owner) | Python (learning-ai-owner) |
|---|---|---|
| **W1** (5/12~15) | learning-card 골격 + card 모듈 (덱/카드 CRUD + SM-2 알고리즘 기초) | learning-ai 골격 (FastAPI scaffolding + Anthropic API 연동 + Embedding API 연결) |
| **W2** (5/18~22) | SRS 복습 세션 완성 (rating → SM-2 → 다음 복습일) + `card.reviewed` Kafka 발행 + review_sessions 통계 | 시맨틱 검색 골격 (pgvector 임베딩 저장·조회) + AI 카드 자동 생성 골격 (Note → LLM → Card) |
| **W3** (5/26~29) | `card.review.due` Kafka 발행 + 복습 통계 대시보드 | AI 카드 자동 생성 안정화 (W2 구현분 보강) + 시맨틱 캐시 (코사인 유사도 > 0.95) |
| **W4** (6/1~5) | (W3 잔무 + 복습 전체 E2E) | RAG Q&A (시간 허용 시) + AI 카드 자동 생성 E2E + 시맨틱 검색 정확도 검증 |
| **W5** (6/8~12) | 복습 안정화 + Kafka 안정화 | 시맨틱 검색 안정화 |

W3 시맨틱 캐시(70% 비용 절감)가 트랙 D의 가장 큰 기술 도전. W2 시맨틱 검색이 동작하면 캐시는 추가 step이지만 cosine similarity threshold (0.95) 튜닝 필요.

---

## 7. 도메인 깊이 학습 자료

### SM-2 / FSRS
- **SM-2 원본**: https://super-memory.com/english/ol/sm2.htm
- **FSRS (Phase 5+)**: https://github.com/open-spaced-repetition/fsrs4anki
- **13 테스트 보고서 BUG-003**: SRS 간격 계산 경계값 (easeFactor 최솟값 1.3)

### LLM / RAG
- **Anthropic Messages API**: https://docs.claude.com/en/api/messages
- **Anthropic Batches API (W3+ 비용 50% 절감)**: https://docs.claude.com/en/docs/build-with-claude/batch-processing
- **pgvector HNSW**: https://github.com/pgvector/pgvector
- **RRF (Reciprocal Rank Fusion)**: 스펙 §5.6 — k=60
- **LangChain RAG patterns**: https://python.langchain.com/docs/use_cases/question_answering/
- **LLMLingua (Phase 5+ prompt compression)**: https://github.com/microsoft/LLMLingua

### Spring Boot + Python 통합
- **paths-filter GitHub Action**: https://github.com/dorny/paths-filter — 09 §A3 신규 자동화 4번째 항목
- **shared-python 패키지 발행 (Phase 2+)**: PyPI 또는 internal index

---

## 8. 트랙 D FAQ

**Q1. Java와 Python 둘 다 같은 시점에 변경할 때, atomic PR이 가능한가?**
> 같은 레포라 가능. 09a 시나리오 D 참조 — `feature/LEARN-AI-005-quality-score-to-srs` 같은 단일 브랜치에서 Java(srs/) + Python(ai/) 동시 수정 + 한 commit으로 묶기. paths-filter가 두 빌드를 분기 실행.

**Q2. LLM 비용을 W1에 줄이려면?**
> Day 1엔 모든 호출이 dev 환경 (Anthropic dev tier, 무료 크레딧). 18 기술 스택 §4.5 비용 통제 다층 방어:
> 1. Semantic Cache (W3에 활성)
> 2. Intelligent Routing (Free→Haiku, Pro→Sonnet)
> 3. Tenant 월 한도 (plan_quotas — W2 billing 모듈 연동)
> 4. Anomaly Detection (시간당 폭주 차단)

**Q3. card.reviewed 이벤트 페이로드는 어떻게 정의?**
> synapse-shared의 Avro 스키마(`CardReviewed.avsc`). W1엔 부트스트랩이 깔아둔 `UserRegistered.avsc`만 있고, `CardReviewed.avsc`는 W2 트랙 D의 첫 schema PR. 09 §B4 호환성 모드 BACKWARD 강제.

**Q4. semantic_cache TTL 결정?**
> ERD §7.1 TTL 정책 표:
> - `card_generation`: 7일 (노트 변경 빈도 보통)
> - `qa`: 1일 (컨텍스트 빨리 바뀜)
> - `summarize`: 30일 (노트 자체 동일하면 재사용)
> - `similar_notes`: 7일

**Q5. NoteUpdated 이벤트 받으면 semantic_cache invalidate 어떻게?**
> ai 모듈이 Kafka consumer로 `note.updated` 소비 → 해당 noteId 관련 cache 행 DELETE. 02 ERD §7.1 무효화 정책 + 11 테스트 전략 §7.5 Gamification idempotency 같은 패턴.

**Q6. learning-card와 learning-ai의 K8s Deployment 분리?**
> 같은 레포 한 git build, 다른 Docker image (2개). 14 배포 가이드 §1 Dockerfile 분리. ApplicationSet matrix 5×3 = 15에서 `learning-card`/`learning-ai` 둘 다 별도 Application.

---

## 9. 막혔을 때

| 상황 | 멘토 | 채널 |
|---|---|---|
| SM-2 알고리즘 경계값 | `@team-lead` | `#synapse-dev` |
| LLM 응답 비결정성 | `@team-lead` | `#architecture` |
| pgvector HNSW 튜닝 | `@team-lead` 또는 `@knowledge-owner-2` (같은 인덱스 사용) | `#synapse-dev` |
| Anthropic API rate limit | `@team-lead` | `#devops` |
| Java↔Python 통합 패턴 | `@team-lead` (페어 시 직접 합의) | DM |
| LLM 비용 폭주 | `@team-lead` (긴급) | `#incident` |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v1.0 | 2026-05-12 | 초안 — Learning 트랙 합류 가이드 (Java + Python 스택 분담) |
