# 18 기술 스택 정의서 검증 — S6 외부 API + AI/ML

> 작성일: 2026-05-28 / 검증자: claude-opus-4-8 / 마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
> 대상 위키: documents.wiki/18_기술_스택_정의서.md (S5 후 v2.3-S5 상태, 베이스 SHA `387849b`, 7014 라인)
> 위키 패치 커밋: documents.wiki@`bac72d3` (387849b..bac72d3, master) — 247 insertions / 165 deletions
> 보고서 PR: [documents#13](https://github.com/team-project-final/documents/pull/13)
> 메모리 정합: `python-ai-stack-direct-sdk`(핵심) · `s3-implementation-status`(패턴) · `redis-topology-decision`(§6.4) · `deploy-mirror-standardization`(§9.5)
> 플랜: `documents/docs/superpowers/plans/2026-05-28-stack-review-S6-external-ai.md`
> **6세션 검증 프로젝트의 마지막 세션 (S6/6).**

---

## 0. 요약 (Summary)

### 0.1 검증 대상

마스터 스펙 §2 매핑 기준 S6 카테고리 9개 항목(AI/ML 4 + 외부 서비스 5):

**AI/ML(§6.1–§6.4)**
- §6.1 Anthropic Claude API
- §6.2 OpenAI Embeddings (text-embedding-3-small)
- §6.3 RAG (Retrieval Augmented Generation) 파이프라인
- §6.4 시맨틱 캐시 (Semantic Cache)

**외부 서비스(§9.1–§9.5)**
- §9.1 Stripe
- §9.2 OAuth 제공자 (Google / GitHub / Apple / Microsoft)
- §9.3 FCM / APNs
- §9.4 AWS SES
- §9.5 AWS Secrets Manager

검증은 **2개 subagent 병렬**(A: AI/ML 4, B: 외부 서비스 5)로 수행, controller가 단일 보고서·단일 위키 패치로 통합. **통계는 controller가 per-finding 1차 분류를 직접 재집계**(S5 교훈: subagent self-report 신뢰 금지).

### 0.2 클래스·심각도 통계

| 클래스 | 건수 | 비고 |
|--------|------|------|
| E1 (사실 오류) | **8** | 모델 ID·하이브리드 픽션·pgvector 캐시 픽션·webhook 이벤트·Microsoft 미구현·FCM 발송 미구현 등 |
| E2 (설정/코드 오류) | **8** | dimensions 미전달·정규화 오해·배치 상한 3중·키공간·Idempotency·OIDC 분리·ExternalSecret 부재 |
| D (표류/불일치) | **6** | 프롬프트 캐싱·히트카운터·env명/SM경로·API버전·SES 전면 미구현·ESO 버전/주기/경로 |
| R (보강 권장) | **2** | Jinja2 프롬프트 외부화·HNSW 인덱스 |
| OK (검증 통과) | **5** | 스트리밍·임베딩 모델·LangChain 미선택·Apple JWT·ESO 개념 |
| **합계** | **29** | (AI/ML 16 + 외부서비스 13) |

| 심각도 | 건수 | 비고 |
|--------|------|------|
| P0 | **2** | §6.3 하이브리드 픽션 · §6.4 pgvector 시맨틱 캐시 픽션 (RAG 핵심 아키텍처 오도) |
| P1 | **13** | 모델 ID·파라미터·webhook·Microsoft·FCM·SES·ESO 등 |
| P2 | **14** | 설정 보강·메모·라벨링 |

### 0.3 P0 2건 처리 — "적용 현황 (목표 vs 실재)" 박스 (s3-implementation-status / S5 패턴)

| P0 | 절 | 실재 (코드) | 목표 (로드맵) |
|----|----|------------|--------------|
| S6-F10 | §6.3 RAG | **pgvector cosine 단일 검색** (`rag_service.search_similar`, top_k=5, threshold=0.7, Redis 컨텍스트 캐시) | Elasticsearch BM25 + RRF 하이브리드 |
| S6-F13 | §6.4 시맨틱 캐시 | **Redis JSON + numpy 코사인 in-memory 스캔** (키 `rag_cache:{tenant_id}`, 최대 100 FIFO, TTL 3600초 단일, 임계값 0.95) | pgvector `semantic_query_cache` 테이블 + SHA-256 정확 캐시 + ivfflat |

두 절 모두 목표 설계를 **삭제하지 않고** 실재/목표를 분리 라벨로 reconcile했다(S5/`s3-implementation-status` 패턴). 미구현 외부연동(S6-F18 Customer Portal·S6-F25 FCM 발송·S6-F27 SES 전면)도 동일 박스로 통일.

### 0.4 LangChain 위임 청산 (S2a/S2b → S6)

S2a/S2b가 위임한 **§6 RAG 절 LangChain 잔존 언급 정정**은 본 세션에서 청산했다. §6.3 본문·예제·대안표 전수 스캔 결과 LangChain "사용" 잔존은 **0건**이며, 대안 비교표의 "LlamaIndex / LangChain … 미선택" 행만 존재(정상 — `python-ai-stack-direct-sdk` Direct SDK 결정과 정합). 실코드 `langchain*` import 0건 재확인. 따라서 LangChain 위임은 **검증 완료·잔존 없음(clean)**으로 청산한다. 실제 §6.3 드리프트는 LangChain이 아니라 **ES+RRF 하이브리드 픽션**(S6-F10)이었다.

### 0.5 메모리 정합 결과

| 메모리 | 결과 | 상세 |
|--------|------|------|
| `python-ai-stack-direct-sdk` | **CONSISTENT** | learning-ai LangChain 미사용·Direct SDK 직접 호출 재확인(§6.1 AsyncAnthropic·§6.2 AsyncOpenAI·§6.3 직접 구현 파이프라인). §6.3 LangChain 위임 청산 근거 |
| `s3-implementation-status` | **CONSISTENT(패턴 확장)** | 미구현 항목 "적용 현황 (목표 vs 실재)" 박스를 §6.3/§6.4 P0 + §9.3 FCM 발송 + §9.4 SES 전면에 동형 적용 |
| `redis-topology-decision` | **CONSISTENT** | §6.4 시맨틱 캐시 Redis 토폴로지를 "Redis 7 Cluster"→standalone으로 정정(S6-F14) — 메모리의 현재 standalone 결정과 정합 |
| `deploy-mirror-standardization` | **DRIFT 정정** | §9.5 ESO SM 경로 `synapse/production/<category>`→`synapse/<env>/<service>/<key>` per-service 표준으로 정정(S6-F28), §9.1 Stripe SM 경로도 동일 정정(S6-F20) |

### 0.6 한 줄 결론

S6의 사실 오류(E1 8건)는 **목표 설계를 실재로 단정한 픽션**에 집중된다 — §6.3 RAG는 "pgvector+ES BM25+RRF 하이브리드"로 서술됐으나 실코드는 **pgvector cosine 단일**(P0), §6.4 시맨틱 캐시는 "pgvector 테이블+SHA-256"으로 서술됐으나 실제는 **Redis numpy in-memory 스캔**(P0)이다. 외부 서비스는 §9.2 Microsoft OAuth(전체 주석+TODO)·§9.3 FCM/APNs 발송 코드·§9.4 SES 전면이 **미구현**으로, 모두 `[[s3-implementation-status]]`와 동일한 "적용 현황 (목표 vs 실재)" 박스로 진실의 단일 출처를 만들었다. S2a/S2b 위임 **LangChain 정정은 잔존 0건으로 clean 청산**됐고, 메모리 `python-ai-stack-direct-sdk`는 **CONSISTENT**, `deploy-mirror-standardization`의 §9.5 SM 경로 드리프트는 per-service 표준으로 정정했다. **6세션 검증 프로젝트가 본 세션으로 완료된다.**

---

## 1. 개요 / 범위 (Scope)

본 세션은 마스터 스펙 §2의 S6(외부 API + AI/ML) 카테고리를 다루는 **마지막(6/6) 세션**이다. AI/ML 4개 절(§6.1–§6.4)과 외부 서비스 5개 절(§9.1–§9.5)을 **공식 문서(context7 + WebFetch)** 와 **실 코드(`synapse-learning-svc/learning-ai` / `synapse-platform-svc` / `synapse-gitops`)** 에 대조하고, S2a/S2b에서 위임된 §6 RAG 절 LangChain 잔존 정정을 청산한다.

| 범위 | 처리 |
|------|------|
| §6.1~§6.4 AI/ML | 검증·정정·보강 (본 세션) |
| §9.1~§9.5 외부 서비스 | 검증·정정·보강 (본 세션) |
| §6.3 RAG LangChain 잔존 (S2a/S2b 위임) | **청산 — 잔존 0건(clean)** (본 세션) |
| §5.x (pgvector 저장) | S3 처리 영역 — **cross-reference만, 본문 정정 금지** |
| §4.2.x (S2a Direct SDK) · §1.4 · §12.x | S1/S2a 처리 영역 — **cross-reference만, 본문 정정 금지** |

### 1.1 메모리 진실 원천

`python-ai-stack-direct-sdk`(S1 확정)가 §6.1~§6.4 검증의 진실 원천이다 — learning-ai는 LangChain 미사용, `from anthropic import AsyncAnthropic` / `from openai import AsyncOpenAI` 직접 호출. §6.3 RAG의 픽션 식별(ES+RRF 하이브리드 vs pgvector 단일)도 이 메모리의 "직접 구현 패턴"에 근거한다.

---

## 2. 방법론 (Methodology)

마스터 스펙 §1 6단계 파이프라인 적용. 9개 항목을 2개 자연 카테고리로 분리해 **Phase B3에서 2개 subagent 병렬 dispatch**:

- **subagent A** — AI/ML 4개(§6.1–§6.4) + `python-ai-stack-direct-sdk` 정합 + LangChain 잔존 전수 스캔
- **subagent B** — 외부 서비스 5개(§9.1–§9.5) + `s3-implementation-status` 박스 패턴 + `deploy-mirror-standardization` §9.5 정합

각 subagent는 자체 evidence·classification을 처리하고, controller가 `AI-F##`/`EXT-F##`를 통합 `S6-F01~S6-F29` 일렬로 재번호하며 통계·메모리 정합·§6 Deep Dive·P0 박스 결정을 통합한다. **통계는 controller가 per-finding 1차 분류를 직접 재집계**(subagent self-report와 상이 시 controller 값 채택).

### 2.1 도구 사용

| 단계 | 도구 | 비고 |
|------|------|------|
| Step 2 skill-recommender | 카탈로그 검색 | S1~S5 동일 기준 — verified/marketplace/MCP 채택 0건(context7+WebFetch만 사용) |
| Step 3 공식 문서 | **context7** 우선, 매핑 실패 시 **WebFetch** 폴백 | anthropic / openai / pgvector / stripe / oauth·oidc / firebase fcm / apns / aws ses / aws secrets manager / external-secrets |
| Step 4 실 코드 | Glob/Grep/Read | `synapse-learning-svc/learning-ai`·`synapse-platform-svc`·`synapse-gitops` |

---

## 3. 검증 대상 (Targets)

| 절 번호 | 기술 | 라인 범위(베이스 `387849b`) | 1차 진단 |
|---------|------|------------------------------|----------|
| §6.1 | Anthropic Claude API | L4416–L4532 | 모델 ID 현행성·프롬프트 캐싱 실적용·JSON 모드 표현 의심 |
| §6.2 | OpenAI Embeddings | L4533–L4653 | dimensions 파라미터 실전달·정규화 오해·배치 상한 불일치 의심 |
| §6.3 | RAG 파이프라인 | L4654–L4778 | ES+RRF 하이브리드 vs pgvector 단일 의심·LangChain 잔존 스캔 |
| §6.4 | 시맨틱 캐시 | L4779–L4888 | pgvector 캐시 vs Redis numpy·TTL/임계값·토폴로지 의심 |
| §9.1 | Stripe | L6261–L6368 | webhook 이벤트명·Customer Portal·Idempotency·env명/SM경로 의심 |
| §9.2 | OAuth 제공자 | L6369–L6464 | Microsoft 미구현·OIDC/OAuth2 분리·redirect-uri 표준 의심 |
| §9.3 | FCM / APNs | L6465–L6571 | FCM/APNs 발송 코드·의존성 부재·410 자동삭제 의심 |
| §9.4 | AWS SES | L6572–L6651 | SES/SNS/SQS 전면 미구현 의심 |
| §9.5 | AWS Secrets Manager | L6652–L6753 | ESO apiVersion·refreshInterval·SM 경로 드리프트 의심 |

---

## 4. 분류 체계 (Taxonomy)

| 클래스 | 정의 |
|--------|------|
| **E1** | 사실 오류 — 경로·버전·존재 여부 등 검증 가능한 사실이 틀림 |
| **E2** | 설정/코드 오류 — 예제 설정·명령·플래그가 동작하지 않거나 비표준 |
| **D** | 표류/불일치 — 위키 ↔ 코드 ↔ runbook 간 값 불일치(둘 다 부분적으로 맞음) |
| **R** | 보강 권장 — 누락된 공식 권고·운영 표준 추가 |
| **OK** | 검증 통과 — 변경 없음(기록만) |

| 심각도 | 정의 |
|--------|------|
| **P0** | 즉시 차단 — 핵심 아키텍처를 통째로 오도 |
| **P1** | 높음 — 잘못된 사실/경로로 작업자가 오도됨 |
| **P2** | 중간 — 보강·메모 수준 |

---

## 5. 발견사항 (Findings)

> 표기 규칙: subagent의 `AI-F01~F16`/`EXT-F01~F13`를 통합 `S6-F01~S6-F29` 일렬로 재번호. AI→S6-F01~F16, EXT→S6-F17~F29.

### S6-F01

```yaml
finding_id: S6-F01
section: "§6.1 Anthropic Claude API"
class: E1
severity: P1
title: "모델 ID claude-3-5-sonnet-20241022 → 실코드 claude-3-5-sonnet-20240620"
evidence_repo: "learning-ai/app/services/claude_service.py:50,75,92 — claude-3-5-sonnet-20240620"
patch_target: "위키 §6.1 L4453, L4471"
applied: true
```

### S6-F02

```yaml
finding_id: S6-F02
section: "§6.1 Anthropic Claude API"
class: D
severity: P1
title: "프롬프트 캐싱(cache_control) 4곳 서술하나 실코드 미적용(system 평문)"
evidence_repo: "learning-ai — system 인자 평문 string, cache_control 블록 부재"
patch_target: "위키 §6.1 L4433, L4447, L4457, L4492-4496 — 목표 박스 주석(s3 선례)"
applied: true
```

### S6-F03

```yaml
finding_id: S6-F03
section: "§6.1 Anthropic Claude API"
class: E2
severity: P2
title: "'JSON 모드로 파싱오류 제거' 부정확 — 실제 수동 추출+json.loads+재시도"
evidence_repo: "learning-ai — 응답 텍스트에서 ```json 블록 수동 추출 후 json.loads, 실패 시 재호출"
patch_target: "위키 §6.1 L4450"
applied: true
```

### S6-F04

```yaml
finding_id: S6-F04
section: "§6.1 Anthropic Claude API"
class: R
severity: P2
title: "설정 예제 보강 — Jinja2 프롬프트 외부화(app/core/prompts.py)+모듈레벨 AsyncAnthropic(timeout 30s, max_retries=0)+tenacity 재시도"
evidence_repo: "learning-ai/app/core/prompts.py (Jinja2), 모듈레벨 클라이언트 + tenacity 데코레이터"
patch_target: "위키 §6.1 L4476-4500"
applied: true
deep_dive: true
```

### S6-F05

```yaml
finding_id: S6-F05
section: "§6.1 Anthropic Claude API"
class: OK
severity: P2
title: "AsyncAnthropic + messages.stream() + text_stream 정확 (Direct SDK 정합)"
evidence_repo: "learning-ai — AsyncAnthropic·messages.stream()·async for text in stream.text_stream 정합"
patch_target: "위키 §6.1 (변경 없음)"
applied: false
```

### S6-F06

```yaml
finding_id: S6-F06
section: "§6.2 OpenAI Embeddings"
class: E1
severity: P1
title: "예제 embeddings.create에 dimensions 전달하나 실코드 미전달(기본 1536). dimensions=1536은 무의미"
evidence_official: "text-embedding-3-small 기본 1536차원 — dimensions=1536 전달은 no-op"
evidence_repo: "learning-ai — embeddings.create(model, input) 만 호출, dimensions 미전달"
patch_target: "위키 §6.2 L4565, L4617"
applied: true
```

### S6-F07

```yaml
finding_id: S6-F07
section: "§6.2 OpenAI Embeddings"
class: E2
severity: P1
title: "'반환 벡터 기본 정규화' 오해소지 — 실코드가 자체 L2 정규화(_normalize) 명시 수행"
evidence_repo: "learning-ai — _normalize()로 L2 정규화 직접 수행"
patch_target: "위키 §6.2 L4566"
applied: true
```

### S6-F08

```yaml
finding_id: S6-F08
section: "§6.2 OpenAI Embeddings"
class: E2
severity: P2
title: "배치 상한 2048/100/20 3중 불일치(본문 2048, 예제 BATCH_SIZE=100, docstring 20)"
evidence_repo: "위키 본문 2048 · 예제 BATCH_SIZE=100 · docstring 20 — 출처 간 불일치"
patch_target: "위키 §6.2 L4564, L4571, L4590"
applied: true
```

### S6-F09

```yaml
finding_id: S6-F09
section: "§6.2 OpenAI Embeddings"
class: OK
severity: P2
title: "text-embedding-3-small 1536 + AsyncOpenAI 정확"
evidence_repo: "learning-ai — text-embedding-3-small·AsyncOpenAI 정합"
patch_target: "위키 §6.2 (변경 없음)"
applied: false
```

### S6-F10

```yaml
finding_id: S6-F10
section: "§6.3 RAG 파이프라인"
class: E1
severity: P0
title: "'pgvector+ES BM25+RRF 하이브리드' 서술하나 실코드는 pgvector cosine 단일(top_k=5, threshold=0.7). ES/RRF/hybrid/병렬 함수 전무, rag_pipeline.py 가상"
evidence_repo: "learning-ai/app/services/rag_service.py — search_similar(pgvector cosine, top_k=5, threshold=0.7) + _build_context + Redis 컨텍스트 캐시. elasticsearch/RRF/hybrid_search 코드 0건. rag_pipeline.py 파일 부재"
evidence_memory: "[[python-ai-stack-direct-sdk]] 직접 구현 패턴"
patch_target: "위키 §6.3 L4661-4662, L4676, L4683-4685, L4690-4709, L4717-4761 — 적용 현황(목표 vs 실재) 박스 + 아키텍처/설정코드 rag_service.py 실코드 교체 + 비교표 재검토"
applied: true
```

### S6-F11

```yaml
finding_id: S6-F11
section: "§6.3 RAG 파이프라인"
class: E1
severity: P1
title: "파라미터 불일치 — 실제 _MAX_CONTEXT_CHARS=12000(≈3000토큰, 문자 기준), top_k=5, threshold=0.7 (위키 4000토큰/top-20/RRF k=60 틀림)"
evidence_repo: "learning-ai/app/services/rag_service.py — _MAX_CONTEXT_CHARS=12000, top_k=5, threshold=0.7"
patch_target: "위키 §6.3 L4664, L4719-4722"
applied: true
```

### S6-F12

```yaml
finding_id: S6-F12
section: "§6.3 RAG 파이프라인"
class: OK
severity: P1
title: "대안 비교표 LangChain/LlamaIndex '미선택' → Direct SDK 정합. 코드 langchain 0건 (LangChain 위임 청산 근거)"
evidence_repo: "learning-ai — langchain/LCEL/langgraph import 0건"
evidence_memory: "[[python-ai-stack-direct-sdk]] CONSISTENT"
patch_target: "위키 §6.3 대안 비교표 (변경 없음 — 잔존 없음 clean)"
applied: false
```

### S6-F13

```yaml
finding_id: S6-F13
section: "§6.4 시맨틱 캐시"
class: E1
severity: P0
title: "'pgvector semantic_query_cache 테이블+SHA-256 정확캐시+ivfflat' 서술하나 실제 Redis JSON+numpy 코사인 in-memory 스캔, TTL 단일 3600초(24h/5min 분리 없음), 임계값 0.95"
evidence_repo: "learning-ai — Redis 키 rag_cache:{tenant_id}, JSON 직렬화 + numpy 코사인 in-memory 스캔, 최대 100 FIFO, TTL 3600초 단일. pgvector semantic_query_cache 테이블·SHA-256·ivfflat 코드 0건"
patch_target: "위키 §6.4 L4786-4787, L4814-4827, L4832, L4839-4840, L4842-4877, L4888 — 적용 현황(목표 vs 실재) 박스"
applied: true
```

### S6-F14

```yaml
finding_id: S6-F14
section: "§6.4 시맨틱 캐시"
class: E2
severity: P1
title: "키공간·토폴로지 — 실키 rag_cache:{tenant_id}(synapse:ai:cache:* 아님), 'Redis 7 Cluster'→standalone"
evidence_repo: "learning-ai — Redis 키 rag_cache:{tenant_id}"
evidence_memory: "[[redis-topology-decision]] 현재 standalone"
patch_target: "위키 §6.4 L4788, L4831, L4843, L4848, L4854"
applied: true
```

### S6-F15

```yaml
finding_id: S6-F15
section: "§6.4 시맨틱 캐시"
class: D
severity: P2
title: "히트카운터/대시보드 코드 부재(로그만), 캐시 격리 tenant 단위(user 격리 없음)"
evidence_repo: "learning-ai — hit_count INCR/대시보드 메트릭 코드 부재(로그만), 캐시 키 tenant 단위"
patch_target: "위키 §6.4 L4789, L4795 — 로드맵 명시"
applied: true
```

### S6-F16

```yaml
finding_id: S6-F16
section: "§6.4 시맨틱 캐시"
class: R
severity: P2
title: "트러블슈팅 ivfflat → 실 인덱스 HNSW(m=16, ef_construction=64, vector_cosine_ops). 캐시는 Redis라 pgvector 인덱스 무관"
evidence_repo: "learning-ai/migrations — note_chunks HNSW 인덱스(m=16, ef_construction=64, vector_cosine_ops)"
patch_target: "위키 §6.4 L4888 (+§6.3 cross-ref)"
applied: true
deep_dive: true
```

### S6-F17

```yaml
finding_id: S6-F17
section: "§9.1 Stripe"
class: E1
severity: P1
title: "webhook invoice.payment_failed → 실코드 invoice.paid(handleInvoicePaid). handlePaymentFailed 부재"
evidence_repo: "synapse-platform-svc billing — handleInvoicePaid(invoice.paid), handlePaymentFailed 미존재"
patch_target: "위키 §9.1 L6270, L6318"
applied: true
```

### S6-F18

```yaml
finding_id: S6-F18
section: "§9.1 Stripe"
class: E2
severity: P1
title: "Customer Portal·Proration 코드 전무(Checkout + 3 webhook + 구독조회만)"
evidence_repo: "synapse-platform-svc billing — Checkout Session + webhook 3종 + 구독 조회만, Customer Portal/Proration 코드 0건"
patch_target: "위키 §9.1 L6269, L6271, L6359 — 적용 현황(목표 vs 실재) 박스"
applied: true
```

### S6-F19

```yaml
finding_id: S6-F19
section: "§9.1 Stripe"
class: E2
severity: P2
title: "Idempotency-Key 미부착(Checkout 생성). 중복방지는 inbound processed_event 테이블만"
evidence_repo: "synapse-platform-svc — Checkout 생성 시 Idempotency-Key 미부착, processed_event 테이블로 inbound 중복방지"
patch_target: "위키 §9.1 L6293, L6357"
applied: true
```

### S6-F20

```yaml
finding_id: S6-F20
section: "§9.1 Stripe"
class: D
severity: P2
title: "env명 STRIPE_SECRET_KEY → 실제 STRIPE_API_KEY, SM경로 synapse/production/stripe → synapse/<env>/platform-svc/stripe-api-key"
evidence_repo: "synapse-platform-svc — STRIPE_API_KEY, SM 경로 synapse/<env>/platform-svc/stripe-api-key"
evidence_memory: "[[deploy-mirror-standardization]] per-service SM 경로"
patch_target: "위키 §9.1 L6342-6348"
applied: true
```

### S6-F21

```yaml
finding_id: S6-F21
section: "§9.1 Stripe"
class: D
severity: P2
title: "API버전 고정(Stripe-Version) 코드·위키 모두 없음. 예제는 정적 Webhook.constructEvent/별도 컨트롤러인데 실제 StripeClient+BillingController 통합"
evidence_repo: "synapse-platform-svc — StripeClient 인스턴스 + BillingController 통합, Stripe-Version 고정 없음"
patch_target: "위키 §9.1 L6299-6323"
applied: true
```

### S6-F22

```yaml
finding_id: S6-F22
section: "§9.2 OAuth 제공자"
class: E1
severity: P1
title: "Microsoft OAuth 미구현(application.yml 전체 주석+TODO MVP이후). 위키는 활성 제공자로 단정"
evidence_repo: "synapse-platform-svc/application.yml — microsoft 블록 전체 주석 + TODO(MVP 이후)"
patch_target: "위키 §9.2 L6369, L6378, L6420-6425 — 제목 '(Google/GitHub/Apple; Microsoft 계획)', microsoft 블록 계획 표시"
applied: true
```

### S6-F23

```yaml
finding_id: S6-F23
section: "§9.2 OAuth 제공자"
class: E2
severity: P2
title: "실제 OIDC(CustomOidcUserService)/OAuth2(CustomOAuth2UserService) 분리+OAuthUserResolver, redirect-uri 표준 {baseUrl}/login/oauth2/code/{registrationId}. 위키 단일 OAuth2UserService 예제 틀림"
evidence_repo: "synapse-platform-svc — CustomOidcUserService + CustomOAuth2UserService + OAuthUserResolver, redirect-uri {baseUrl}/login/oauth2/code/{registrationId}"
patch_target: "위키 §9.2 L6410, L6428-6447"
applied: true
```

### S6-F24

```yaml
finding_id: S6-F24
section: "§9.2 OAuth 제공자"
class: OK
severity: P2
title: "Apple client_secret JWT(ES256, 6개월)·GitHub /user/emails·common 엔드포인트 정확"
evidence_repo: "synapse-platform-svc — Apple JWT ES256·GitHub /user/emails·Microsoft common 정합"
patch_target: "위키 §9.2 (변경 없음)"
applied: false
```

### S6-F25

```yaml
finding_id: S6-F25
section: "§9.3 FCM / APNs"
class: E1
severity: P1
title: "FCM/APNs 실제 발송(FirebaseMessaging/ApnsClient/PushNotificationService)·의존성(firebase-admin/pushy) 전무. 디바이스토큰 등록/해제(디바이스당 5개)만 구현"
evidence_repo: "synapse-platform-svc — 디바이스 토큰 등록/해제(디바이스당 5개)만. FirebaseMessaging/ApnsClient/PushNotificationService 코드 0건, firebase-admin/pushy 의존성 0건"
patch_target: "위키 §9.3 L6474, L6495-6543 — 적용 현황(목표 vs 실재) 박스"
applied: true
```

### S6-F26

```yaml
finding_id: S6-F26
section: "§9.3 FCM / APNs"
class: E2
severity: P2
title: "FCM/APNs 시크릿 ExternalSecret 미정의, SM경로 드리프트, 410 Gone 자동삭제 미구현"
evidence_repo: "synapse-gitops — FCM/APNs ExternalSecret 미정의. 410 Gone 자동삭제 미구현"
patch_target: "위키 §9.3 L6475-6476, L6546-6554, L6560"
applied: true
```

### S6-F27

```yaml
finding_id: S6-F27
section: "§9.4 AWS SES"
class: D
severity: P1
title: "SES/SNS/SQS 전면 미구현(software.amazon.awssdk 0건). 선행작업(awssdk ses 추가·DKIM·샌드박스해제·email_suppression_list)"
evidence_repo: "synapse-platform-svc — software.amazon.awssdk 의존성 0건, SES/SNS/SQS 코드 0건"
evidence_memory: "[[s3-implementation-status]] AttachmentService 동형"
patch_target: "위키 §9.4 L6577-6635 — 적용 현황(목표 vs 실재) 박스 + 선행작업"
applied: true
```

### S6-F28

```yaml
finding_id: S6-F28
section: "§9.5 AWS Secrets Manager"
class: D
severity: P1
title: "ESO apiVersion v1beta1 → 실제/upstream v1, refreshInterval 1h → 5m, SM경로 synapse/production/<category> → synapse/<env>/<service>/<key>. ClusterSecretStore명 aws-secrets-manager 일치"
evidence_repo: "synapse-gitops — external-secrets.io/v1, refreshInterval 5m, key synapse/<env>/<service>/<key>"
evidence_memory: "[[deploy-mirror-standardization]] per-service SM 경로"
patch_target: "위키 §9.5 L6684, L6690, L6700-6722"
applied: true
```

### S6-F29

```yaml
finding_id: S6-F29
section: "§9.5 AWS Secrets Manager"
class: OK
severity: P2
title: "ESO 연동 개념·IRSA(auth.jwt)·ClusterSecretStore명 정확 (F28 항목만 정정)"
evidence_repo: "synapse-gitops — ESO 연동·IRSA auth.jwt·ClusterSecretStore명 aws-secrets-manager 정합"
patch_target: "위키 §9.5 (변경 없음 — F28 항목만 정정)"
applied: false
```

---

## 6. "더 깊이 / Deep Dive" 보강 항목 일람

본 세션은 R 클래스 보강 2건 + **LangChain 위임 청산** + **P0 2건 목표 vs 실재 결정**을 다룬다.

### 6.1 R 클래스 보강

#### 6.1.1 §6.1 Claude 설정 예제 보강 (S6-F04)
실코드는 프롬프트를 `app/core/prompts.py`에 **Jinja2 템플릿으로 외부화**하고, `AsyncAnthropic`을 모듈 레벨에서 한 번만 생성(`timeout=30s`, `max_retries=0` — SDK 자체 재시도 비활성)한 뒤 **tenacity 데코레이터로 애플리케이션 레벨 재시도**를 적용한다. 위키 §6.1 설정 가이드는 매 호출마다 `async with AsyncAnthropic()`을 여는 예제였으므로, 모듈 레벨 클라이언트 + Jinja2 외부화 + tenacity 패턴을 보강했다.

#### 6.1.2 §6.4 시맨틱 캐시 인덱스 정정 (S6-F16)
트러블슈팅의 `ivfflat` 인덱스 생성 명령은 실제 인프라와 무관하다 — 시맨틱 캐시는 Redis로 구현돼 있어 pgvector 인덱스가 개입하지 않고, RAG 검색용 `note_chunks` 벡터 인덱스는 실제 **HNSW**(`m=16, ef_construction=64, vector_cosine_ops`)다. ivfflat 항목을 HNSW로 정정하고, 캐시는 Redis라 pgvector 인덱스와 무관함을 명시(§6.3 cross-ref).

> R 클래스는 위 2건(F04·F16)이다.

### 6.2 LangChain 위임 청산 (S2a/S2b → S6, clean)

S2a/S2b가 위임한 **§6 RAG 절 LangChain 잔존 정정**을 본 세션에서 검증했다. §6.3 본문·아키텍처 다이어그램·설정 코드·대안 비교표를 전수 스캔한 결과:

- 본문/예제에 LangChain "사용" 잔존 **0건**.
- 대안 비교표에 `LlamaIndex / LangChain … 의존성 과다 … 미선택` 행만 존재 — 이는 Direct SDK 결정(`python-ai-stack-direct-sdk`)을 **정당하게 기록**한 정상 항목이므로 **유지**(S6-F12 OK).
- 실코드 `langchain`/`LCEL`/`langgraph` import **0건** 재확인.

따라서 LangChain 위임은 **검증 완료·잔존 없음(clean)**으로 청산한다. 위키 본문 정정은 불필요했고, 실제 §6.3 드리프트는 LangChain이 아니라 **ES+RRF 하이브리드 픽션**(S6-F10)이었다.

### 6.3 P0 2건 — "적용 현황 (목표 vs 실재)" 결정

#### 6.3.1 §6.3 RAG 하이브리드 픽션 (S6-F10, P0)
위키 §6.3은 "pgvector ANN(top-20) + Elasticsearch BM25(top-20) + RRF(k=60) 하이브리드 → 상위 5개/4000토큰"을 **실재처럼** 서술하고, `rag_pipeline.py`의 `hybrid_search`/`pgvector_search`/`elasticsearch_search` 코드까지 제시했다. 그러나 실코드(`rag_service.py`)는 **pgvector cosine 단일 검색**(`search_similar`, top_k=5, threshold=0.7) + `_build_context` + Redis 컨텍스트 캐시이며, Elasticsearch·RRF·hybrid·병렬(`asyncio.gather`) 함수가 **전무**하고 `rag_pipeline.py` 파일 자체가 **부재**다.

**결정**: 목표 설계를 삭제하지 않고 **"적용 현황 (목표 vs 실재)" 박스**로 reconcile — 실재=pgvector cosine 단일(top_k=5/threshold=0.7/Redis 컨텍스트 캐시), 목표=ES BM25+RRF 하이브리드. 아키텍처 다이어그램·설정 코드를 `rag_service.py` 실코드로 교체하고, 대안 비교표의 "하이브리드 선택" 행은 목표 라벨로 재검토. 파라미터는 S6-F11로 정정(`_MAX_CONTEXT_CHARS=12000`≈3000토큰/문자 기준, top_k=5, threshold=0.7).

#### 6.3.2 §6.4 시맨틱 캐시 pgvector 픽션 (S6-F13, P0)
위키 §6.4는 "pgvector `semantic_query_cache` 테이블 + SHA-256 정확 캐시(TTL 24h) + 시맨틱 근사 캐시(TTL 5min) + ivfflat 인덱스"를 **실재처럼** 서술했다. 실코드는 **Redis JSON + numpy 코사인 in-memory 스캔**(키 `rag_cache:{tenant_id}`, 최대 100 FIFO, TTL **3600초 단일**, 임계값 0.95)이며, pgvector 테이블·SHA-256 정확 캐시·24h/5min TTL 분리·ivfflat이 **모두 부재**다.

**결정**: **"적용 현황 (목표 vs 실재)" 박스** — 실재=Redis numpy(키 `rag_cache:{tenant_id}`, 최대 100 FIFO, TTL 3600), 목표=pgvector 캐시/SHA-256. 토폴로지는 standalone(`[[redis-topology-decision]]`, S6-F14), 히트카운터/유저 격리는 로드맵(S6-F15). 목표 설계 보존.

> 미구현 외부연동 3건(S6-F18 Customer Portal·S6-F25 FCM/APNs 발송·S6-F27 SES 전면)도 동일 박스 패턴으로 통일(`[[s3-implementation-status]]`).

---

## 7. 위키 패치 diff 요약

**커밋**: `documents.wiki@bac72d3` (내용 패치) + `documents.wiki@5e3840e` (§11 PR#13 기입, dual-commit)
**변경 통계**: `18_기술_스택_정의서.md` — 247 insertions / 165 deletions (7014 → 7096 라인)

### 7.1 finding ↔ 위키 패치 위치 매핑

| finding_id | class | sev | 위키 패치 위치 | 변경 형태 |
|------------|-------|-----|----------------|-----------|
| S6-F01 | E1 | P1 | §6.1 핵심기능 + config | 모델 ID 20240620 |
| S6-F02 | D | P1 | §6.1 캐싱 서술/예제 | 프롬프트 캐싱 목표 박스 주석 |
| S6-F03 | E2 | P2 | §6.1 기술적 이점 | JSON 모드 → 수동 추출+재시도 |
| S6-F04 | R | P2 | §6.1 설정 가이드 | Jinja2 외부화+모듈클라이언트+tenacity |
| S6-F05 | OK | P2 | §6.1 | 변경 없음 |
| S6-F06 | E1 | P1 | §6.2 기술적 이점/예제 | dimensions 미전달 |
| S6-F07 | E2 | P1 | §6.2 기술적 이점 | 자체 L2 정규화 |
| S6-F08 | E2 | P2 | §6.2 본문/예제/docstring | 배치 상한 통일 |
| S6-F09 | OK | P2 | §6.2 | 변경 없음 |
| S6-F10 | E1 | **P0** | §6.3 전반 | 목표 vs 실재 박스 + rag_service.py 교체 |
| S6-F11 | E1 | P1 | §6.3 파라미터 | 12000자/top_k=5/threshold=0.7 |
| S6-F12 | OK | P1 | §6.3 대안표 | 변경 없음(LangChain 청산 근거) |
| S6-F13 | E1 | **P0** | §6.4 전반 | 목표 vs 실재 박스 + Redis numpy |
| S6-F14 | E2 | P1 | §6.4 키공간/토폴로지 | rag_cache:{tenant_id}/standalone |
| S6-F15 | D | P2 | §6.4 역할 | 히트카운터/유저격리 로드맵 |
| S6-F16 | R | P2 | §6.4 트러블슈팅 | ivfflat → HNSW |
| S6-F17 | E1 | P1 | §9.1 역할/예제 | invoice.paid |
| S6-F18 | E2 | P1 | §9.1 역할 | 목표 vs 실재 박스(Portal/Proration) |
| S6-F19 | E2 | P2 | §9.1 기술적이점/트러블슈팅 | Idempotency 실태 |
| S6-F20 | D | P2 | §9.1 env/SM경로 | STRIPE_API_KEY/per-service 경로 |
| S6-F21 | D | P2 | §9.1 설정 가이드 | StripeClient+BillingController |
| S6-F22 | E1 | P1 | §9.2 제목/역할/예제 | Microsoft 계획 |
| S6-F23 | E2 | P2 | §9.2 예제 | OIDC/OAuth2 분리+redirect-uri |
| S6-F24 | OK | P2 | §9.2 | 변경 없음 |
| S6-F25 | E1 | P1 | §9.3 역할/예제 | 목표 vs 실재 박스(발송 미구현) |
| S6-F26 | E2 | P2 | §9.3 SM경로/트러블슈팅 | ExternalSecret/410 미구현 |
| S6-F27 | D | P1 | §9.4 전반 | 목표 vs 실재 박스(SES 전면) |
| S6-F28 | D | P1 | §9.5 예제 | ESO v1/5m/per-service 경로 |
| S6-F29 | OK | P2 | §9.5 | 변경 없음 |
| §11 변경 이력 | — | — | v2.3-S5 다음 | v2.3-S6 행 추가 |

### 7.2 라인 변동
- §6.3/§6.4 P0 박스 신설 + 설정 코드 교체로 §6 내부 증분
- §9.1/§9.3/§9.4 미구현 박스 신설로 §9 내부 증분
- 정정 패치 다수(본문 교체)
- **위키 최종 라인 수: `7096`** (S5 베이스 7014 → +82)

---

## 8. 후속 과제 (Follow-ups)

### 8.1 본 세션 처리 완료
- AI/ML 4개 정정·보강(S6-F01~F16): 모델 ID·프롬프트 캐싱 목표·JSON 추출·Jinja2 보강·dimensions·정규화·배치 상한·**RAG 하이브리드 픽션(P0)**·파라미터·**시맨틱 캐시 pgvector 픽션(P0)**·키공간/토폴로지·히트카운터·HNSW
- 외부 서비스 5개 정정·보강(S6-F17~F29): invoice.paid·Portal 목표·Idempotency·env/SM경로·StripeClient·Microsoft 계획·OIDC 분리·**FCM 발송 미구현**·ExternalSecret·**SES 전면 미구현**·ESO v1/5m/per-service
- LangChain 위임 **clean 청산**(잔존 0건)
- 메모리 python-ai-stack-direct-sdk·redis-topology-decision CONSISTENT, deploy-mirror-standardization §9.5 드리프트 정정

### 8.2 미구현 외부연동 코드 PR 큐
- **(P0)** §6.3 RAG: Elasticsearch BM25 + RRF 하이브리드 검색 구현 (현재 pgvector cosine 단일) — 목표 아키텍처 도달
- **(P0)** §6.4 시맨틱 캐시: pgvector `semantic_query_cache` 테이블 + SHA-256 정확 캐시 + 24h/5min TTL 분리 (현재 Redis numpy in-memory)
- **(P1)** §6.1 프롬프트 캐싱(cache_control) 실적용 — 현재 system 평문
- **(P1)** §9.3 FCM/APNs 실제 발송(firebase-admin/pushy 의존성 + PushNotificationService) — 현재 디바이스 토큰 등록/해제만
- **(P1)** §9.4 SES 전면 구현 — `software.amazon.awssdk:ses` 추가 + DKIM/샌드박스 해제 + email_suppression_list + SNS/SQS 반송 처리
- **(P1)** §9.2 Microsoft OAuth 활성화 — application.yml microsoft 블록 주석 해제 + Azure AD 등록 (MVP 이후)
- **(P2)** §9.1 Stripe Customer Portal·Proration·Idempotency-Key 보강

### 8.3 v2.3 통합 정리 작업 (6세션 종료 후 — 별도 작업)
- §10.1 요약표·§12.x 버전 매트릭스에 S6 변경 반영(Claude 모델 ID·RAG 실재 아키텍처·Redis 시맨틱 캐시·미구현 외부연동)
- §1.4 기술 스택 전체 목록 표 S6 정정 반영(이미 S1/S2a 처리분과 cross-ref)
- 마스터 스펙 §6.4 "v2.3 통합 정리"(§10.1·§11 통합 행·§12.x·INDEX 잠금)가 다음 별도 작업 — 본 세션 범위 밖

### 8.4 메모리 갱신 후보
- ✅ `python-ai-stack-direct-sdk` — 본 세션 §6 정합 CONSISTENT 재확인. RAG 하이브리드/시맨틱 캐시 W4+ 구현 시 갱신.
- ✅ `s3-implementation-status` — 미구현 외부연동(§6.3/§6.4/§9.3/§9.4)에도 박스 패턴 확장. W4+ 구현 시 갱신.
- ✅ `redis-topology-decision` — §6.4 시맨틱 캐시 standalone 정합. 추가 갱신 불필요.
- ✅ `deploy-mirror-standardization` — §9.5/§9.1 SM 경로 per-service 표준 정정. 추가 갱신 불필요.
- **(신규 검토)** `rag-pipeline-actual-vs-target` — §6.3 pgvector 단일(실재) vs ES+RRF(목표)·§6.4 Redis numpy(실재) vs pgvector(목표)를 단일 출처로 메모리화. W4+ 구현 정착 시 검토.

---

## 부록 (Appendix)

### 9.1 subagent 통합 매핑

| subagent | 원 ID 범위 | 통합 ID 범위 | 건수 |
|----------|-----------|--------------|------|
| A (AI/ML) | AI-F01~F16 | S6-F01~S6-F16 | 16 |
| B (외부 서비스) | EXT-F01~F13 | S6-F17~S6-F29 | 13 |

### 9.2 클래스 분포(controller per-finding 직접 재집계)

- AI/ML(§6): E1 5 / E2 4 / D 2 / R 2 / OK 3 = 16 (P0 2 / P1 7 / P2 7)
- 외부 서비스(§9): E1 3 / E2 4 / D 4 / R 0 / OK 2 = 13 (P0 0 / P1 6 / P2 7)
- **합계: E1:8 / E2:8 / D:6 / R:2 / OK:5 = 29** — §0.2 요약 통계는 위 per-category 합계와 정확히 일치한다(AI/ML 5/4/2/2/3 + 외부 3/4/4/0/2).
- 심각도 합계: **P0:2 / P1:13 / P2:14 = 29** (AI/ML 2/7/7 + 외부 0/6/7).

> subagent self-report 통계는 위 controller 직접 재집계 값과 다를 수 있으며, 본 보고서·위키 §11은 **controller 값만** 사용한다(S5 교훈).

### 9.3 미구현 "적용 현황 (목표 vs 실재)" 박스 통일 항목

| 절 | 항목 | 실재 | 목표 |
|----|------|------|------|
| §6.3 | RAG 검색 | pgvector cosine 단일(top_k=5/threshold=0.7/Redis 컨텍스트 캐시) | ES BM25 + RRF 하이브리드 |
| §6.4 | 시맨틱 캐시 | Redis JSON+numpy in-memory(rag_cache:{tenant_id}/100 FIFO/TTL 3600) | pgvector 테이블 + SHA-256 + ivfflat |
| §9.1 | Stripe Portal/Proration | Checkout+webhook 3종+구독조회 | Customer Portal + Proration |
| §9.3 | FCM/APNs | 디바이스 토큰 등록/해제만 | 실제 발송(firebase-admin/pushy) |
| §9.4 | SES | awssdk 0건(전면 미구현) | SES+SNS+SQS 반송 처리 |

모두 `[[s3-implementation-status]]`와 동일한 "목표 형태 문서" 패턴.

### 9.4 참조
- 메모리: `python-ai-stack-direct-sdk` · `s3-implementation-status` · `redis-topology-decision` · `deploy-mirror-standardization`
- S1 보고서: `documents/docs/superpowers/specs/2026-05-28-stack-review-S1-languages.md` (Direct SDK 진실 원천, S1-F12~F14)
- S5 보고서: `documents/docs/superpowers/specs/2026-05-28-stack-review-S5-operations.md` (적용 현황 박스 패턴·ESO 맥락)
