# 18 기술 스택 검증 — S6 외부 API + AI/ML 세션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 18 기술 스택 정의서의 S6 카테고리(§6.1~§6.4 AI/ML 4개 + §9.1~§9.5 외부 서비스 5개 = 9개)에 대해 context7 공식 문서 검증 + `synapse-learning-svc/learning-ai`·`synapse-platform-svc`·`synapse-gitops` 실 코드 대조 + 보강을 수행하고, S2a/S2b에서 위임된 **§6 RAG 절 LangChain 잔존 언급 일괄 정정**을 청산한다. 6세션 검증 프로젝트의 **마지막 세션**.

**Architecture:** 마스터 스펙 §1 6단계 파이프라인. 9개 항목을 두 자연 카테고리로 분리해 **Phase B3에서 2개 subagent 병렬 dispatch**(subagent A: AI/ML 4개 §6.1-§6.4 / subagent B: 외부 서비스 5개 §9.1-§9.5). controller가 결과를 통합해 단일 보고서·단일 위키 패치·단일 PR로 마감. S5(인프라7/관측성5)와 동일 패턴. 보고서 9 섹션 + 위키 일괄 패치 + PR/INDEX·HANDOFF 갱신은 S1~S5와 동일.

**Tech Stack:** Markdown · PowerShell 7 · Git · GitHub CLI(gh) · context7 MCP

**관련 산출물 위치:**
- 마스터 스펙: `documents/docs/superpowers/specs/2026-05-28-tech-stack-doc-review-design.md`
- 마스터 INDEX: `documents/docs/superpowers/specs/2026-05-28-stack-review-INDEX.md` (S5 종료 후 S1~S5 completed, main 머지됨 #12)
- 마스터 HANDOFF: `documents/docs/superpowers/specs/2026-05-28-stack-review-HANDOFF.md` (v1.3 — 6세션 중 5 완료, S6만 남음. §3.B에 S6 가이드)
- 본 플랜 자신: `documents/docs/superpowers/plans/2026-05-28-stack-review-S6-external-ai.md`
- 본 플랜이 만들 보고서: `documents/docs/superpowers/specs/2026-05-28-stack-review-S6-external-ai.md`
- 본 플랜이 패치할 위키: `documents.wiki/18_기술_스택_정의서.md` (S5 dual-commit 후 `387849b` 상태, 7014 라인)
- 실 코드 검증 대상:
  - `synapse-learning-svc/learning-ai/` — §6.1 Claude·§6.2 OpenAI Embeddings·§6.3 RAG·§6.4 Semantic Cache (pyproject.toml·app/clients·app/api·app/services). 메모리 [[python-ai-stack-direct-sdk]] 진실 원천
  - `synapse-platform-svc/` — §9.1 Stripe(billing)·§9.2 OAuth·§9.3 FCM 디바이스 토큰 (archive: 20260519-step4-billing·step5-fcm-device·20260526 OAuth/cookie)
  - `synapse-gitops/` + ESO — §9.5 Secrets Manager (external-secrets, [[deploy-mirror-standardization]]의 `synapse/*` SM 정책)
  - §9.4 SES — synapse-platform-svc 알림/이메일 또는 미구현(목표 형태)

**필수 메모리 (S6 핵심):**
- `python-ai-stack-direct-sdk` — **핵심**: learning-ai는 LangChain 미사용, OpenAI/Anthropic SDK 직접 호출(S1 검증). §6.1·§6.2·§6.3 검증의 진실 원천. §6.3 RAG 절 LangChain 잔존 정정의 근거.
- `s3-implementation-status` — **참조**: 미구현 항목 "적용 현황(목표 vs 실재)" 박스 패턴(S5 정착). §9.4 SES·일부 §9.x 미구현 시 동일 적용.
- `git-pr-workflow` — 운영 표준.

**S6 검증 대상 (9개) + 라인 범위 (Phase B1 확정, 위키 387849b / 7014 라인):**
- §6.1 Anthropic Claude API — **L4416-L4532**
- §6.2 OpenAI Embeddings (text-embedding-3-small) — **L4533-L4653**
- §6.3 RAG (Retrieval Augmented Generation) 파이프라인 — **L4654-L4778**
- §6.4 시맨틱 캐시 (Semantic Cache) — **L4779-L4888** (§7.1 Docker L4889 직전)
- §9.1 Stripe — **L6261-L6368**
- §9.2 OAuth 제공자 (Google / GitHub / Apple / Microsoft) — **L6369-L6464**
- §9.3 FCM / APNs — **L6465-L6571**
- §9.4 AWS SES — **L6572-L6651**
- §9.5 AWS Secrets Manager — **L6652-L6753** (§10 요약 매트릭스 L6754 직전)

**S2a/S2b 위임 정정 (본 세션 청산):**
- **§6.3 RAG 절들의 LangChain 잔존 언급** → S2a §4.2.4 "AI Service 통합 패턴 (Direct SDK)" 와 일관되게 일괄 정정. learning-ai는 OpenAI/Anthropic SDK 직접 호출(LangChain 미사용).
- §1.4·§12.3·§12.5 cross-section은 S2a에서 이미 정정됨 — 본 세션은 §6 본문 내 잔존분만.

**S6 검증 초점:**
- **§6.1 Anthropic Claude API**: 모델 ID 현행성(claude-* 네이밍), Messages API, 프롬프트 캐싱(cache_control), 스트리밍(SSE), tool use, max_tokens·temperature, anthropic Python SDK 버전, 비동기 클라이언트. learning-ai 실 호출 코드 대조.
- **§6.2 OpenAI Embeddings**: `text-embedding-3-small` 1536 dims·`dimensions` 파라미터, 배치 임베딩, openai Python SDK v1.x, 비용·토큰 제한, pgvector 저장 차원 정합(§5.x note_chunks).
- **§6.3 RAG**: 청킹 전략·pgvector cosine 검색·top-k·reranking·context window 관리. **LangChain 잔존 정정**(Direct SDK 패턴). 임베딩→검색→프롬프트 조립 파이프라인 실 코드.
- **§6.4 Semantic Cache**: 임베딩 유사도 임계값·캐시 키·Redis vs pgvector 저장·TTL·캐시 히트 판정. 실 구현 여부(미구현 시 목표 형태 박스).
- **§9.1 Stripe**: API 버전 고정, Checkout Session, Webhook 서명 검증(`Stripe-Signature`)·멱등키, Customer/Subscription, 결제 실패 처리. platform-svc billing 실 코드.
- **§9.2 OAuth**: Authorization Code + PKCE, OIDC, state/nonce, 토큰 검증(JWKS), 4개 제공자별 차이(Apple client_secret JWT·Microsoft tenant). platform-svc OAuth 실 코드.
- **§9.3 FCM / APNs**: FCM HTTP v1 API(레거시 아님), APNs token-based auth(.p8), 디바이스 토큰 관리·만료·멀티 디바이스. platform-svc fcm-device 실 코드.
- **§9.4 AWS SES**: SendEmail/SendTemplatedEmail, SNS 바운스·컴플레인 처리, 샌드박스 제한, configuration set. 실 구현 여부.
- **§9.5 AWS Secrets Manager**: ESO(External Secrets Operator) 연동·`synapse/*` 정책([[deploy-mirror-standardization]]), 자동 로테이션, IRSA, SecretStore/ExternalSecret. synapse-gitops 실 manifest.

---

## Phase A — 작업 브랜치 (이미 생성됨)

### Task A1: 브랜치 + 동기화 확인

> S5 PR #12가 main 머지 완료. S6는 깨끗한 main에서 시작(cherry-pick 불필요).

- [ ] **Step 1: documents 브랜치 확인** (이미 `docs/stack-review-S6-external-ai` 생성됨)

```
Push-Location 'C:\workspace\team-project-final\documents'
git branch --show-current   # docs/stack-review-S6-external-ai
git log --oneline -2         # main HEAD 7332a94 (Merge PR #12) 포함
Pop-Location
```
Expected: 브랜치 `docs/stack-review-S6-external-ai`, main에 S1~S5 산출물 포함.

- [ ] **Step 2: documents.wiki 동기화 확인**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git checkout master
git pull --rebase origin master
git log --oneline -2   # 387849b (S5 §11 PR#12) + dc5b0bd
Pop-Location
```
Expected: master `387849b`, 7014 라인.

- [ ] **Step 3: INDEX S6 상태가 `pending`인지 확인**

`Grep` pattern `"^\| S6 \|.*pending"` in INDEX. Expected: 매치 1줄.

---

## Phase B — S6 6 단계 파이프라인

### Task B1: Step 1 — 9개 항목 인벤토리 (완료 — 라인 범위 확정)

- [ ] **Step 1: §6.x/§9.x 절 헤더 위치 재확인** (Phase B3 dispatch 직전 1회 재검증)

`Grep` pattern `"^### (6\.[1-4]|9\.[1-5]) "` in `documents.wiki/18_기술_스택_정의서.md`, `-n: true`.
Expected (현재 387849b 기준): 6.1=4416 / 6.2=4533 / 6.3=4654 / 6.4=4779 / 9.1=6261 / 9.2=6369 / 9.3=6465 / 9.4=6572 / 9.5=6652. 라인 이동 시 본 플랜 라인 범위 갱신 후 dispatch.

- [ ] **Step 2: LangChain 잔존 스캔 (§6 RAG 정정 대상 식별)**

`Grep` pattern `"LangChain|langchain|LCEL|langgraph"` in 위키, `-n: true`. Expected: §6.3 위주 매치. S2a §4.2.4 Direct SDK 패턴과 정합/표류 식별. 각 매치를 subagent A 프롬프트에 임베드.

- [ ] **Step 3: 모델 ID·SDK 버전 cross-section 인용 확인**

`Grep` pattern `"claude-|text-embedding-3|anthropic|openai|§12\.(3|5)"` in 위키, `-n: true`. Expected: §6.1/§6.2/§12.3/§12.5 인용. 모델 ID 현행성 점검 위치 식별.

### Task B2: Step 2 — skill-recommender (S6 키워드)

- [ ] **Step 1: 키워드 정의 + 실행** (S5와 동일 절차, verified MCP 0~5건 가능, 본 검증 비사용 — context7+WebFetch만)

```
node C:\workspace\dsd\.claude\skills\skill-recommender\scripts\search-catalog.cjs `
  --catalog C:\workspace\dsd\skill-catalog\catalog.json `
  --keywords "anthropic,claude,openai,embeddings,rag,pgvector,semantic cache,stripe,oauth,oidc,fcm,apns,push notification,aws ses,email,secrets manager,external secrets" `
  --limit 30 --type all 2>&1 | Out-File -Encoding utf8 -FilePath C:\Temp\_S6-skill-rec.json
$data = Get-Content C:\Temp\_S6-skill-rec.json -Raw | ConvertFrom-Json
Write-Output "TOTAL=$($data.totalMatches)"
$data.results | Where-Object { $_.source -in @('marketplace','mcp-official-registry') -or $_.verified -eq $true } | Select-Object -First 8 | ForEach-Object { "{0,-50} | {1,-12} | src={2,-25} | v={3}" -f $_.name, $_.type, $_.source, $_.verified }
Remove-Item C:\Temp\_S6-skill-rec.json -Force -ErrorAction SilentlyContinue
```
Expected: stripe MCP·anthropic 등 0~5건 verified 가능. 보고서 §2에 "채택 가능 도구로 기록만".

- [ ] **Step 2: 채택 후보 선별** — verified만 기록, 검증엔 context7만.

### Task B3: Step 3+4 — 두 subagent 병렬 + 결과 통합

> S5와 동일. 각 subagent 자체 evidence·classification, controller가 finding_id 통합(AI-F## / EXT-F## → S6-F## 일렬).

- [ ] **Step 1: subagent A dispatch — AI/ML 4개 (§6.1-§6.4)** (`Agent` general-purpose)

prompt 핵심:
```
You are verifying 4 AI/ML wiki sections (§6.1-§6.4) of `documents.wiki/18_기술_스택_정의서.md` against official docs and synapse-learning-svc/learning-ai code. Part of S6 (final session, after S1~S5 completed/merged).

## Working directory: C:\workspace\team-project-final
## Sections (Read each in documents.wiki/18_기술_스택_정의서.md)
- §6.1 Anthropic Claude API — L4416-L4532
- §6.2 OpenAI Embeddings — L4533-L4653
- §6.3 RAG 파이프라인 — L4654-L4778
- §6.4 Semantic Cache — L4779-L4888

## CRITICAL: 메모리 [[python-ai-stack-direct-sdk]] 정합 (S6 핵심)
먼저 Read: C:\Users\G\.claude\projects\C--workspace-team-project-final\memory\python-ai-stack-direct-sdk.md
핵심: learning-ai는 LangChain 미사용, OpenAI/Anthropic SDK 직접 호출.
- §6.3 RAG: LangChain/LCEL/langgraph 잔존 언급 전수 발견 → Direct SDK 패턴(S2a §4.2.4 정착)으로 정정 제안
- §6.1/§6.2: SDK 직접 호출 패턴이 본문에 반영됐는지

## Step A — context7 / WebFetch (ToolSearch로 context7 스키마 로드 후)
- "anthropic" → Messages API, 모델 ID(claude-* 현행), prompt caching(cache_control), streaming, tool use, max_tokens
- "openai" → embeddings text-embedding-3-small, dimensions 파라미터(1536), SDK v1.x, batch
- "pgvector" → cosine 검색, 차원 정합 (RAG·임베딩 저장)
Fallback WebFetch: docs.anthropic.com / platform.openai.com/docs / github.com/pgvector

## Step B — 실 코드 대조 (synapse-learning-svc/learning-ai)
- Glob: synapse-learning-svc/learning-ai/pyproject.toml → anthropic/openai 버전, langchain 부재 확인
- Glob: synapse-learning-svc/learning-ai/app/**/*.py → Claude/OpenAI 호출 코드, RAG 파이프라인, semantic cache 구현 여부
- Grep: "langchain|ChatOpenAI|ChatAnthropic|LLMChain" → 실코드 LangChain 부재 재확인
- Grep: "claude-|text-embedding-3|cache_control|dimensions" → 모델 ID·파라미터 실태

## Step C/D — 분류 + YAML (finding_id = AI-F##)
표준 필드: finding_id·section·class(E1/E2/D/R/OK)·severity(P0/P1/P2)·current_text·issue·evidence(context7/WebFetch/코드 경로:라인)·proposed_text(즉시 Edit 가능 markdown)·patch_target

## Step E — 자기 점검: 4개 절 각 ≥1 finding · OK ≥2 · python-ai-stack-direct-sdk 정합 결과 명시(§6.3) · LangChain 잔존 전수 목록 · 각 finding evidence

## Report Format (최종 메시지=반환값, 원시 데이터)
Status / Findings (AI-F##): count — E1/E2/D/R/OK / Severity / <YAML ---로 구분> / Memory consistency (python-ai-stack-direct-sdk: CONSISTENT|DRIFT + LangChain 잔존 위치) / Self-review / Concerns

## 주의: 파일 수정·git 금지(읽기 전용). 한국어. §9 외부서비스는 다른 subagent. §5.x(pgvector 저장)는 S3 처리 영역 — cross-ref만. 작업 디렉토리 C:\workspace\team-project-final
```

- [ ] **Step 2: subagent B dispatch — 외부 서비스 5개 (§9.1-§9.5)** (병렬, 같은 메시지에 두 Agent 호출)

prompt 핵심:
```
You are verifying 5 EXTERNAL SERVICE wiki sections (§9.1-§9.5) of `documents.wiki/18_기술_스택_정의서.md` against official docs and synapse-platform-svc / synapse-gitops code. Part of S6 (final session).

## Working directory: C:\workspace\team-project-final
## Sections
- §9.1 Stripe — L6261-L6368
- §9.2 OAuth (Google/GitHub/Apple/Microsoft) — L6369-L6464
- §9.3 FCM / APNs — L6465-L6571
- §9.4 AWS SES — L6572-L6651
- §9.5 AWS Secrets Manager — L6652-L6753

## CRITICAL: 미구현 항목 "적용 현황(목표 vs 실재)" 박스 (S5 정착 패턴)
먼저 Read: C:\Users\G\.claude\projects\C--workspace-team-project-final\memory\s3-implementation-status.md
구현 안 된 외부 연동(SES 등)은 본문 단정 대신 "적용 현황(목표 vs 실재)" 박스로 정정 제안.
§9.5 Secrets Manager는 Read도: C:\Users\G\.claude\projects\C--workspace-team-project-final\memory\deploy-mirror-standardization.md (synapse/* SM 정책·ESO 연동 맥락)

## Step A — context7 / WebFetch
- "stripe" → API 버전 고정, Checkout Session, Webhook 서명 검증, 멱등키, Subscription
- "oauth"/"openid connect" → Auth Code+PKCE, OIDC, JWKS 검증, state/nonce, Apple client_secret JWT
- "firebase cloud messaging" → HTTP v1 API(레거시 폐기), APNs token auth(.p8)
- "aws ses" → SendEmail, SNS 바운스/컴플레인, 샌드박스
- "aws secrets manager"/"external secrets operator" → ESO SecretStore/ExternalSecret, 로테이션, IRSA
Fallback WebFetch: docs.stripe.com/api / openid.net/connect / firebase.google.com/docs/cloud-messaging / docs.aws.amazon.com/ses / external-secrets.io

## Step B — 실 코드 대조
- §9.1 Stripe / §9.2 OAuth / §9.3 FCM: synapse-platform-svc Glob/Grep ("stripe|Checkout|webhook|StripeSignature" / "oauth|pkce|jwks|client_secret|provider" / "fcm|apns|device.?token|FirebaseMessaging")
- §9.4 SES: Grep "ses|SimpleEmail|sendEmail|sns" all repos — 미구현 시 목표 박스
- §9.5 Secrets Manager: synapse-gitops Glob "**/externalsecret*.yaml" "**/secretstore*.yaml", Grep "external-secrets|SecretStore|ExternalSecret|secretsmanager"

## Step C/D — 분류 + YAML (finding_id = EXT-F##)
표준 필드(위 A subagent와 동일).

## Step E — 자기 점검: 5개 절 각 ≥1 finding · OK ≥2 · 미구현 항목 목표/실재 구분 · §9.5 ESO 정합(deploy-mirror-standardization) · 각 finding evidence

## Report Format: Status / Findings (EXT-F##): count — E1/E2/D/R/OK / Severity / <YAML> / Memory consistency (s3-implementation-status 패턴 적용·deploy-mirror-standardization §9.5 정합) / Self-review / Concerns

## 주의: 파일 수정·git 금지(읽기 전용). 한국어. §6 AI/ML은 다른 subagent. 작업 디렉토리 C:\workspace\team-project-final
```

- [ ] **Step 3: 두 subagent 결과 수신 + 통합** — AI-F##→S6-F01~ / EXT-F##→이어서 일렬. 통계 합산은 **개별 finding 1차 분류를 직접 재집계**(S5 교훈: subagent self-report 통계 신뢰 금지). 메모리 정합·LangChain 정정 결과 통합.

### Task B4: Step 5 — 보고서 9 섹션 작성

- [ ] **Step 1: 보고서 헤더 + 9 섹션 스켈레톤** — `Write` `documents/docs/superpowers/specs/2026-05-28-stack-review-S6-external-ai.md`. S5 보고서와 동일 구조. §6에 R 클래스 Deep Dive + LangChain 정정 일람. §8 후속 과제(미구현 외부연동 코드 PR·v2.3 통합 정리). 헤더에 "위키 패치 커밋: <controller 기입>" placeholder.
- [ ] **Step 2: §1~§7 채우기** — 통합 finding YAML §5. §6 Deep Dive. §7 위키 패치 diff는 B6 후.
- [ ] **Step 3: §0 요약 통계 + 검증** — `## \d` 섹션 9, `### S6-F\d` ≥9. **통계는 §5 per-finding 합계와 일치 확인**(S5 교훈).

### Task B5: Step 6 — 위키 패치 적용

- [ ] **Step 1: 사전 동기화 재확인** — `git pull --rebase origin master` in documents.wiki.
- [ ] **Step 2: E1/E2/D finding 제자리 교체** — §5 finding current_text→proposed_text. S6 영역 §6.1-§6.4 / §9.1-§9.5만. §5.x(pgvector)·§4.2.x(S2a) 본문 정정 금지(cross-ref만).
- [ ] **Step 3: §6.3 RAG LangChain 잔존 일괄 정정** — Direct SDK 패턴(S2a §4.2.4 일관).
- [ ] **Step 4: R 클래스 Deep Dive + 미구현 "적용 현황(목표 vs 실재)" 박스** — S5 패턴 동일.
- [ ] **Step 5: §11 변경 이력 갱신** — S5 행 다음:
```
| v2.3-S6 | 2026-05-28 | Synapse Team | S6 외부/AI 검증 — E1:a/E2:b/D:c/R:d/OK:e (보고서: documents PR #<TBD>). §6.1 Claude / §6.2 OpenAI Embeddings / §6.3 RAG / §6.4 Semantic Cache / §9.1 Stripe / §9.2 OAuth / §9.3 FCM·APNs / §9.4 SES / §9.5 Secrets Manager. §6.3 RAG LangChain 잔존 → Direct SDK 정정(메모리 python-ai-stack-direct-sdk). 미구현 외부연동 "적용 현황(목표 vs 실재)" 박스 통일. |
```
- [ ] **Step 6: 패치 검증** — 라인 수·`git diff --stat` 단일 파일.

### Task B6: Step 6 — 위키 단일 커밋 + 푸시 + SHA

- [ ] **Step 1: 커밋 + 푸시 + SHA** — `git add -u` + here-string 커밋 메시지(S5 패턴, 통계·메모리·주요변경). `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. `git push origin master`. `$wikiSha` 캡처.
- [ ] **Step 2: 보고서 헤더 위키 SHA 기입 + §7 diff 요약**.

---

## Phase C — 보고서 PR + INDEX/HANDOFF v1.4 + 프로젝트 마감

### Task C1: documents 커밋·푸시·PR 생성

- [ ] **Step 1: INDEX 갱신** — S6 행 pending→completed(PR·위키 SHA·통계·날짜), 누적 통계(46→55 항목, findings 합산), S6 완료로 "남은 위임" 청산(§6 RAG LangChain ✅), 후속 과제 큐에 S6 발견 추가.
- [ ] **Step 2: HANDOFF v1.4 갱신** — §1 한 줄: **6세션 전부 완료**. §2 표 S6 행. §3: 잔여 = v2.3 통합 정리(§6 별도 작업)만. §8 변경 이력 v1.4.
- [ ] **Step 3: 보고서·플랜·INDEX·HANDOFF 스테이징 + 커밋** — `git add` 4개 파일, here-string 커밋(S5 패턴). `git push -u origin docs/stack-review-S6-external-ai`.
- [ ] **Step 4: PR 생성** — base=main, head=docs/stack-review-S6-external-ai. body에 통계·LangChain 정정·미구현 박스·메모리 정합·**프로젝트 6세션 완료 선언**. `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

### Task C2: 위키 §11 PR# 교체 (dual-commit 의도된 예외)

- [ ] **Step 1: §11 행 PR# 기입 + 커밋·푸시** — S1~S5 dual-commit 동일.

### Task C3: INDEX/HANDOFF 최종 + DoD + v2.3 통합 정리 안내

- [ ] **Step 1: INDEX·HANDOFF·보고서 헤더 PR# 링크 기입 + 추가 커밋·푸시** (dual-commit).
- [ ] **Step 2: DoD 검증** (마스터 스펙 §6.3) — 보고서 9섹션·finding evidence·patch_target·위키 SHA·PR OPEN·INDEX/HANDOFF·위임 청산·후속 과제·메모리 갱신 후보.
- [ ] **Step 3: v2.3 통합 정리 안내** — 6세션 종료로 마스터 스펙 §6.4 "v2.3 통합 정리"(§10.1 요약표·§11 통합 행·§12.x 버전 매핑·INDEX 잠금)가 **다음 별도 작업**임을 사용자에 보고. 본 세션 범위 밖.
- [ ] **Step 4: 메모리 갱신 후보 처리** — python-ai-stack-direct-sdk(§6 정합 CONSISTENT 확인 기록). s3-implementation-status(미구현 외부연동에도 패턴 확장 — W4+ 갱신 후보).
- [ ] **Step 5: 사용자 보고** — 보고서 PR#·위키 SHA·통계·LangChain 청산·**프로젝트 6/6 세션 완료**·다음=v2.3 통합 정리.

---

## 부록 — 비상 절차 (S5 동일)

- **subagent 분량 초과 → BLOCKED**: AI/ML4 + 외부5 분할 적용됨. 추가 분할 시 외부서비스를 §9.1-§9.3 / §9.4-§9.5로.
- **API 529 Overloaded**: 재시도 또는 단일 subagent fallback(9개 묶음).
- **미구현 외부연동 다수(SES 등)**: "적용 현황(목표 vs 실재)" 박스로 처리(s3-implementation-status 패턴), 본문 단정 금지.
- **LangChain 정정 범위 모호**: §6.3 본문만 정정, §1.4/§12.x는 S2a 처리분이므로 재정정 금지(cross-ref 일관성만 확인).
- **통계 불일치**: §0 요약은 §5 per-finding 1차 분류 합계와 반드시 일치(S5 교훈 — subagent self-report 통계 신뢰 금지, controller 직접 재집계).

---

## 추정 시간
- Phase A: 5분 (브랜치 기 생성)
- Phase B: 3~3.5시간 (9개 항목, 두 subagent 병렬)
- Phase C: 30분 + v2.3 통합 정리 안내

총: ~4시간

---

## 변경 이력

| 버전 | 날짜 | 변경 |
|------|------|------|
| v1.0 | 2026-05-28 | S6 외부/AI 세션 플랜 초안 — 9개 항목(AI/ML 4 + 외부 5), Phase B3 두 subagent 병렬, 메모리 python-ai-stack-direct-sdk 핵심, §6.3 RAG LangChain 정정 청산. 마지막 세션. |
