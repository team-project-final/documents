# 18 기술 스택 검증 — S3 데이터스토어 세션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 18 기술 스택 정의서의 S3 데이터스토어 카테고리(PostgreSQL 16, pgvector, Redis 7, Elasticsearch 8+nori, AWS S3 = 5개)에 대해 context7 공식 문서 검증 + `synapse-*` 실 코드 대조 + 보강을 수행한다. 메모리 `data-sync-outbox-cqrs`의 PostgreSQL outbox·user_ref 표준과의 일관성 검증이 핵심.

**Architecture:** 마스터 스펙 §1 6단계 파이프라인. 5개 기술은 데이터 에코시스템(스토어 + 인덱스 + 캐시 + 검색 + 객체)이므로 **1개 subagent**로 통합 검증 (S2b와 동일 분량). 보고서 9 섹션 + 위키 일괄 패치 + PR/INDEX 갱신은 S1·S2a·S2b와 동일.

**Tech Stack:** Markdown · PowerShell 7 · Git · GitHub CLI(gh) · context7 MCP

**관련 산출물 위치:**
- 마스터 스펙: `documents/docs/superpowers/specs/2026-05-28-tech-stack-doc-review-design.md`
- 마스터 INDEX: `documents/docs/superpowers/specs/2026-05-28-stack-review-INDEX.md` (S2b 종료 후 S2a·S2b completed 상태)
- 본 플랜 자신: `documents/docs/superpowers/plans/2026-05-28-stack-review-S3-datastores.md`
- 본 플랜이 만들 보고서: `documents/docs/superpowers/specs/2026-05-28-stack-review-S3-datastores.md`
- 본 플랜이 패치할 위키: `documents.wiki/18_기술_스택_정의서.md`
- 실 코드 검증 대상:
  - `synapse-*/src/main/resources/db/migration/V*.sql` (Flyway 마이그레이션)
  - `synapse-*/src/main/resources/application*.yml` (DB/Redis 설정)
  - `synapse-knowledge-svc` (Elasticsearch 사용 추정)
  - `synapse-learning-svc/learning-ai/` (pgvector·Redis 사용)
  - `synapse-platform-svc` (notifications·billing → S3·Redis)

**필수 메모리:**
- `data-sync-outbox-cqrs` — **핵심**: `outbox_event` 테이블·인덱스, `user_ref` 복제본 패턴, 파티션 키 표준 `{tenant_id}:{aggregate_id}`. §5.1.1 PostgreSQL 검증에 직접 영향.
- `git-pr-workflow` — 운영 표준.

**S3 검증 대상 (5개)**:
- §5.1.1 PostgreSQL 16
- §5.1.2 pgvector 0.8.x
- §5.2 Redis 7 Cluster
- §5.3.1 Elasticsearch 8 + nori Analyzer
- §5.7 AWS S3

**S1+S2 위임 잔여**: 없음 (모두 처리 완료).

**S3 검증 초점**:
- **PostgreSQL 16**: Logical replication, declarative partitioning, BRIN/GIN, RLS, UUID v7(또는 gen_random_uuid), Modulith Event Publication Registry 테이블 명세 일치
- **pgvector**: HNSW 파라미터(`m`, `ef_construction`, `ef_search`), `vector(N)` 차원, IVFFlat vs HNSW, halfvec/binary quantization
- **Redis 7**: Cluster 모드 설정, ACL/사용자, Streams(Kafka 대안 검토 여부), Pub/Sub, 키 네이밍 규칙, eviction policy
- **Elasticsearch 8 + nori**: 보안(xpack.security), nori 형태소 분석기 옵션(`user_dictionary`, `decompound_mode`), index template/lifecycle, BM25 vs k-NN 결합
- **AWS S3**: KMS 암호화·버저닝·라이프사이클·Presigned URL TTL·이벤트 알림(SNS/SQS/EventBridge)·Object Lock(WORM)

---

## Phase A — 작업 브랜치 + 동기화

### Task A1: 브랜치 + 동기화 + INDEX 가져오기

- [ ] **Step 1: documents S3 브랜치 생성 (master-spec 기반)**

```
Push-Location 'C:\workspace\team-project-final\documents'
git fetch origin
git checkout docs/stack-review-master-spec
git pull --rebase origin docs/stack-review-master-spec
git checkout -b docs/stack-review-S3-datastores
Pop-Location
```
Expected: `Switched to a new branch 'docs/stack-review-S3-datastores'`.

- [ ] **Step 2: documents.wiki 동기화**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git checkout master
git pull --rebase origin master
git log --oneline -3
Pop-Location
```
Expected: 최근 커밋이 S2b PR# 기입(`4eca299`)인지 확인.

- [ ] **Step 3: INDEX 파일을 S2b 브랜치에서 가져오기**

```
Push-Location 'C:\workspace\team-project-final\documents'
git checkout docs/stack-review-S2b-frontend-frameworks -- docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git status --short
Pop-Location
```
Expected: `A  docs/superpowers/specs/2026-05-28-stack-review-INDEX.md` (S2a·S2b completed 포함).

- [ ] **Step 4: INDEX S3 상태가 `pending`인지 확인**

```
Select-String -Path 'C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-INDEX.md' -Pattern '^\| S3 \|.*pending'
```
Expected: 매치 1줄.

---

## Phase B — S3 6 단계 파이프라인

### Task B1: Step 1 — 5개 절 인벤토리

- [ ] **Step 1: §5.x 절 위치 확인 (S2 패치로 라인이 이동했을 수 있음)**

`Grep`:
```yaml
pattern: "^### 5\\.[1-7](\\.[12])? "
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
Expected: §5.1·5.1.1·5.1.2·5.2·5.3·5.3.1·5.4·5.5·5.6·5.7 등 헤더 라인 번호.

- [ ] **Step 2: 검증 대상 5개 절의 라인 범위 계산**

다음 절 시작 직전까지:
- §5.1.1 PostgreSQL 16 → §5.1.2 시작 직전
- §5.1.2 pgvector → §5.2 시작 직전
- §5.2 Redis 7 Cluster → §5.3 시작 직전
- §5.3.1 Elasticsearch 8 → §5.4 시작 직전 (또는 §5.3.2가 있다면 그 직전)
- §5.7 AWS S3 → §6.x 또는 `---` 구분선 직전

각 라인 범위를 Task B3 subagent에 전달.

- [ ] **Step 3: cross-section 인용 확인**

`Grep`으로 §5.1.1·§5.1.2·§5.2·§5.3.1·§5.7 인용:
```yaml
pattern: "§5\\.[1-7]|5\\.[1-7] 절"
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
Expected: 메모리 `data-sync-outbox-cqrs`가 명시한 §5.4 Kafka 절 등 §5.x 인용 확인.

---

### Task B2: Step 2 — skill-recommender

- [ ] **Step 1: 키워드 정의 + 실행**

```
node C:\workspace\dsd\.claude\skills\skill-recommender\scripts\search-catalog.cjs `
  --catalog C:\workspace\dsd\skill-catalog\catalog.json `
  --keywords "postgresql,postgres,pgvector,redis,elasticsearch,opensearch,nori,s3,aws s3" `
  --limit 30 `
  --type all 2>&1 | Out-File -Encoding utf8 -FilePath C:\Temp\_S3-skill-rec.json
$data = Get-Content C:\Temp\_S3-skill-rec.json -Raw | ConvertFrom-Json
Write-Output "TOTAL=$($data.totalMatches)"
$data.results | Where-Object { $_.source -in @('marketplace','mcp-official-registry') -or $_.verified -eq $true } | Select-Object -First 5 | ForEach-Object { "{0,-50} | {1,-12} | src={2,-25} | v={3}" -f $_.name, $_.type, $_.source, $_.verified }
Remove-Item C:\Temp\_S3-skill-rec.json -Force -ErrorAction SilentlyContinue
```
Expected: 데이터스토어용 MCP 후보 있을 가능성(PostgreSQL MCP·Redis MCP 등 verified 0~1건 가능). 0건이면 context7만 사용 — S1/S2 패턴.

- [ ] **Step 2: 채택 후보 5개 이내 선별**

S1·S2와 동일 기준. 결과 표는 보고서 §2에 그대로.

---

### Task B3: Step 3+4 — 5개 데이터스토어 통합 검증 (단일 subagent)

- [ ] **Step 1: subagent dispatch**

`Agent` 도구(general-purpose) 호출. prompt:

```
You are verifying 5 datastore wiki sections of `documents.wiki/18_기술_스택_정의서.md` against official docs and synapse-* code. Part of S3 Datastores session (after S1·S2a·S2b completed).

## Sections to verify (Read each in C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md)

- §5.1.1 PostgreSQL 16 — L<from>-L<to>
- §5.1.2 pgvector 0.8.x — L<from>-L<to>
- §5.2 Redis 7 Cluster — L<from>-L<to>
- §5.3.1 Elasticsearch 8 + nori Analyzer — L<from>-L<to>
- §5.7 AWS S3 — L<from>-L<to>

(라인 범위는 controller가 Task B1에서 계산해 전달)

## CRITICAL: 메모리 `data-sync-outbox-cqrs` 정합성 (§5.1.1 검증 핵심)

Read `C:\Users\G\.claude\projects\C--workspace-team-project-final\memory\data-sync-outbox-cqrs.md` 먼저.

핵심 표준:
- `outbox_event` 테이블이 02_ERD §2.3.A에 정의됨 (PostgreSQL)
- `user_ref` 복제본 테이블도 02_ERD §2.3.A
- Polling Relay + ShedLock 단일 활성
- 파티션 키 `{tenant_id}:{aggregate_id}`
- 와이어 포맷 Avro, payload는 JSONB
- 18 §5.4 Kafka 절은 v2.2(2026-05-28)에서 KafkaAvroSerializer + OutboxRecorder 패턴으로 정합됨
- Spring Modulith Event Publication Registry는 `event_publication` 테이블 (S2a §4.1.8에서 보강됨)

§5.1.1 PostgreSQL 검증 시:
- "outbox_event"·"user_ref"·"event_publication"·"processed_events" 같은 테이블이 §5.1.1 본문이나 코드 예제에 언급되는지 확인
- 언급 없으면 보강 후보 (R 클래스)
- 언급 있는데 메모리 표준과 다르면 D 클래스
- Modulith Event Publication Registry 테이블 명세(2025년 spring-modulith 2.0.x)와의 일관성

## Step A — context7 / WebFetch

Try `mcp__plugin_context7_context7__resolve-library-id` for:
- "postgresql 16" → topics: declarative partitioning, RLS, logical replication, UUID v7, BRIN/GIN indexes, JSONB operators, pg_stat_io (16 신규)
- "pgvector" → topics: HNSW index (m, ef_construction, ef_search), IVFFlat, halfvec, binary quantization, vector(N) 차원
- "redis 7" → topics: Redis Cluster, ACL, Streams, eviction policy, AOF/RDB, key-prefix conventions
- "elasticsearch 8" → topics: security defaults (xpack.security.enabled=true since 8.0), index lifecycle, mapping templates, BM25 + k-NN 결합, async search
- "nori" → topics: user_dictionary, decompound_mode, part of speech filtering
- "aws s3" → topics: KMS encryption, versioning, lifecycle, presigned URLs, event notifications (SNS/SQS/EventBridge), Object Lock

Fallback WebFetch:
- postgresql.org/docs/16/
- github.com/pgvector/pgvector
- redis.io/docs/latest/develop/reference/
- elastic.co/guide/en/elasticsearch/reference/8.x/
- github.com/apache/lucene-solr-mirror/blob/main/lucene/analysis/nori/...
- docs.aws.amazon.com/AmazonS3/latest/userguide/

## Step B — 실 코드 대조 (synapse-*)

Read:
- 모든 synapse-*/src/main/resources/db/migration/V*.sql (Flyway 마이그레이션) — PostgreSQL 스키마, 파티션 정의, 인덱스
  - 특히 `outbox_event`·`user_ref` 테이블 정의 확인
- 모든 synapse-*/src/main/resources/application*.yml — DB·Redis 설정
- synapse-knowledge-svc/src/main/java/.../search/ — Elasticsearch 클라이언트 사용 확인
- synapse-learning-svc/learning-ai/app/ — pgvector·Redis 사용
- synapse-platform-svc/src/main/java/.../billing/notification/ — S3 사용

Grep:
- "pgvector|halfvec|vector\(|HNSW|IVFFlat" — pgvector 사용
- "spring.data.redis|spring.redis|RedisTemplate|RedisConnectionFactory|@RedisHash" — Redis 사용
- "spring.elasticsearch|ElasticsearchClient|@Document|RestClient" — ES 사용
- "software.amazon.awssdk.s3|AmazonS3|S3Client|S3Presigner|@MultipartFile" — S3 사용
- "CREATE TABLE.*outbox_event|CREATE TABLE.*user_ref|CREATE TABLE.*processed_events|CREATE TABLE.*event_publication" — Outbox/CQRS/Modulith 테이블

Cross-check 위키 명시 버전 vs 실제:
- pgvector 위키: 0.8.x → 실제?
- Redis 위키: 7 → 실제 (Spring Boot 4 BOM 위임 가능)
- Elasticsearch 위키: 8.x → 실제 (테스트용 testcontainer 버전이 단서)
- AWS SDK S3 버전

## Step C — 분류 / Step D — YAML 출력 (finding_id = DS-F##)

```yaml
finding_id: DS-F01
section: "§5.1.1 PostgreSQL 16"
class: E1
severity: P1
title: "<짧은 한국어 제목>"
evidence_official: |
  <인용 또는 URL>
evidence_repo: |
  <synapse-*/path:LN — 해당 시>
current_text: |
  <18 문서 현재 표현>
proposed_text: |
  <대체 markdown>
patch_target: "documents.wiki/18_기술_스택_정의서.md L<from>-L<to>"
deep_dive: false
```

R 클래스 deep_dive: true + Deep Dive 부속 서브섹션.
OK 항목 짧은 형식.

## Step E — 자기 점검

- [ ] context7 또는 WebFetch 사용 (5개 기술 모두)
- [ ] 모든 finding에 evidence
- [ ] 5개 기술 각각 최소 1개 finding
- [ ] OK 항목 최소 3개
- [ ] §5.1.1 PostgreSQL 검증이 메모리 data-sync-outbox-cqrs 표준과 정합 검증 포함
- [ ] proposed_text 즉시 적용 가능

## Report Format

```
Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
Findings (DS-F##): <count> total — E1:_ E2:_ D:_ R:_ OK:_
<YAMLs>
Self-review:
Concerns:
```

## 주의

- 파일 수정·git 작업 절대 금지
- 한국어 사용자 → 한국어 출력
- 추정 X — 공식 또는 실 코드 인용
- 작업 디렉토리: C:\workspace\team-project-final
```

- [ ] **Step 2: subagent 결과 수신**

DS-F## 형식. controller가 S3-F##로 통합 번호 변환.

---

### Task B4: Step 5 — 보고서 9 섹션 작성

- [ ] **Step 1: 보고서 헤더 + 9 섹션 스켈레톤 생성**

`Write` 도구로 `documents/docs/superpowers/specs/2026-05-28-stack-review-S3-datastores.md` 생성:

```markdown
# 18 기술 스택 정의서 검증 — S3 데이터스토어

> 작성일: 2026-05-28 / 검증자: claude-opus-4-7 / 마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
> 대상 위키: documents.wiki/18_기술_스택_정의서.md (S2b 후 v2.3-S2b 상태)
> 위키 패치 커밋: (Task B6에서 기입)

## 0. 요약 (Summary)
## 1. 카테고리 인벤토리 (Step 1)
## 2. skill-recommender 결과 (Step 2)
## 3. 공식 문서 검증 결과 (Step 3)
## 4. 실 코드 대조 결과 (Step 4)
## 5. 발견사항 (Findings)
## 6. "더 깊이 / Deep Dive" 보강 항목 일람
## 7. 위키 패치 diff 요약
## 8. 후속 과제 (Follow-ups)
```

- [ ] **Step 2: §1~§6 채우기**

S1·S2 패턴 동일. DS-F## → S3-F## 통합 번호.

§8에 추가할 항목:
- 본 세션 처리: 메모리 `data-sync-outbox-cqrs` PostgreSQL 부분 정합 확인 결과
- S4 위임: §5.4 Kafka·§5.5 Schema Registry·§5.6 Avro·§3.2 Resilience4j·§3.3 Redis Token Bucket (S4 이벤트 세션에서 처리)
- S5 위임: Redis 운영(Cluster ACL·eviction)·ES 운영(snapshot/restore) 일부는 S5에서 더 깊이 다룰 수 있음
- 별도 작업: §10.1 / §12.4 매트릭스 갱신

- [ ] **Step 3: §0 요약 통계 + 검증**

```
Select-String -Path '...S3-datastores.md' -Pattern '^## \d' | Measure-Object | Select-Object Count
# Expected: 9
Select-String -Path '...S3-datastores.md' -Pattern '^### S3-F\d' | Measure-Object | Select-Object Count
# Expected: 최소 5개
```

---

### Task B5: Step 6 — 위키 패치 적용

- [ ] **Step 1: 사전 동기화 재확인**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git pull --rebase origin master
git status
Pop-Location
```

- [ ] **Step 2: E1/E2/D 클래스 finding 제자리 교체**

§5에서 정리한 각 finding의 `current_text` → `proposed_text`로 `Edit` 호출. S3 영역 §5.1.1·§5.1.2·§5.2·§5.3.1·§5.7. 결합 패치는 단일 Edit으로.

특히 주의:
- §5.1.1 PostgreSQL에 `outbox_event`·`user_ref`·`event_publication` 등 메모리 표준 테이블 명세 보강
- §5.4 Kafka 절(S4 영역)은 본 세션에서 건드리지 말 것 (이미 v2.2에서 정합됨)

- [ ] **Step 3: R 클래스 Deep Dive 부속 서브섹션 삽입**

S1·S2 동일 형식. "참고 자료" 직전.

- [ ] **Step 4: §11 변경 이력 갱신**

```
| v2.3-S3 | 2026-05-28 | Synapse Team | S3 데이터스토어 검증 반영 — E1:a/E2:b/D:c/R:d (보고서: documents PR #<TBD>). §5.1.1 PostgreSQL 16 / §5.1.2 pgvector / §5.2 Redis 7 / §5.3.1 Elasticsearch 8+nori / §5.7 AWS S3. 메모리 data-sync-outbox-cqrs 정합 확인. (구체 변경: subagent 결과 기반 작성) |
```

S2b 행 다음에 추가.

- [ ] **Step 5: 패치 검증**

```
(Get-Content C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md | Measure-Object -Line).Lines
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git diff --stat
Pop-Location
```
Expected: 단일 파일 변경.

---

### Task B6: Step 6 — 위키 단일 커밋 + 푸시 + 보고서 헤더 SHA 기입

- [ ] **Step 1: 커밋 + 푸시 + SHA 캡처**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git add -u 18_기술_스택_정의서.md
git commit -m @'
docs(stack): S3 데이터스토어 — context7·repo 검증 반영 + 보강

E1:a · E2:b · D:c · R:d · OK:e
P0:x · P1:y · P2:z

§5.1.1 PostgreSQL 16 / §5.1.2 pgvector / §5.2 Redis 7 / §5.3.1 ES 8+nori / §5.7 AWS S3

메모리 data-sync-outbox-cqrs 정합 확인 (outbox_event·user_ref·event_publication).

주요 정정:
- (controller가 §5/§7 기반으로 채움)

Refs: documents PR #<TBD>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin master
$wikiSha = (git rev-parse HEAD).Trim()
Write-Output "WIKI_SHA=$wikiSha"
Pop-Location
```

- [ ] **Step 2: 보고서 헤더 위키 SHA 기입 + §7 diff 요약**

`Edit`로 헤더 갱신. §7에 git show --stat 기반 diff 요약 표 (S1·S2 형식).

---

## Phase C — 보고서 PR + INDEX 갱신

### Task C1: documents 커밋·푸시·PR 생성

- [ ] **Step 1: 보고서 + INDEX 스테이징 + 커밋**

```
Push-Location 'C:\workspace\team-project-final\documents'
git add docs/superpowers/specs/2026-05-28-stack-review-S3-datastores.md
git add docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git status --short
git commit -m @'
docs(stack-review): S3 데이터스토어 보고서

위키 커밋: documents.wiki@<wikiSha>

- S3 보고서 9 섹션 완성
  - PostgreSQL 16 / pgvector / Redis 7 / Elasticsearch 8+nori / AWS S3 (5개)
  - <N> findings — E1:a · E2:b · D:c · R:d · OK:e
  - P0:x · P1:y · P2:z
- 메모리 data-sync-outbox-cqrs 정합 확인 (PostgreSQL 영역)
- S4 위임: §5.4·§5.5·§5.6 Kafka·Schema Registry·Avro

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push -u origin docs/stack-review-S3-datastores
Pop-Location
```

- [ ] **Step 2: PR 생성**

```
Push-Location 'C:\workspace\team-project-final\documents'
gh pr create `
  --base main `
  --head docs/stack-review-S3-datastores `
  --title "docs(stack-review): S3 데이터스토어" `
  --body @'
## 개요

18 기술 스택 정의서 카테고리 검증의 네 번째 세션(S3 데이터스토어).
PostgreSQL 16 / pgvector / Redis 7 / Elasticsearch 8+nori / AWS S3 5개 기술.

## 산출

- 보고서: docs/superpowers/specs/2026-05-28-stack-review-S3-datastores.md
- 위키 커밋: documents.wiki@<wikiSha>

## 통계

- E1:a · E2:b · D:c · R:d · OK:e
- P0:x · P1:y · P2:z

## 메모리 정합 확인

`data-sync-outbox-cqrs`의 PostgreSQL 부분(`outbox_event`·`user_ref`·`event_publication` 테이블·파티션 키 표준)이 §5.1.1과 일관 — (controller가 결과 기반으로 채움)

## 주요 정정

(controller가 §5/§7 결과 기반으로 P0/P1 항목 3~5건 bullet 정리)

## S4 위임

S3에서 발견된 이벤트 영역 항목:
- §5.4 Kafka / §5.5 Schema Registry / §5.6 Avro 추가 검증 필요 시
- §3.2 Resilience4j / §3.3 Redis Token Bucket (Gateway 영역, S5에서도 가능)

## 관련

- 마스터 스펙: docs/superpowers/specs/2026-05-28-tech-stack-doc-review-design.md (PR #5)
- S1: PR #6 / S2a: PR #7 / S2b: PR #8 / 본 PR (S3)
- 플랜: docs/superpowers/plans/2026-05-28-stack-review-S3-datastores.md
- 메모리: data-sync-outbox-cqrs, git-pr-workflow

🤖 Generated with [Claude Code](https://claude.com/claude-code)
'@
$prNumber = (gh pr view --json number -q .number)
Write-Output "PR_NUMBER=$prNumber"
Pop-Location
```

---

### Task C2: 위키 §11 PR# 교체

> S1·S2 dual-commit 예외 동일.

- [ ] **Step 1: §11 행 교체 + 커밋·푸시**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
# Edit로 v2.3-S3 행의 #<TBD> → #<prNumber> 교체
git add -u 18_기술_스택_정의서.md
git commit -m @'
docs(stack): S3 변경 이력 행에 PR 번호 기입

Refs: documents PR #<prNumber>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin master
Pop-Location
```

---

### Task C3: INDEX 최종 갱신 + DoD 검증

- [ ] **Step 1: INDEX S3 행 갱신 + 누적 통계**

INDEX의 S3 행을 `completed`로 + 누적 통계 합산(S1+S2a+S2b+S3).

- [ ] **Step 2: 보고서 헤더에 PR 링크 추가**

S1·S2 패턴 동일.

- [ ] **Step 3: 추가 커밋·푸시**

```
Push-Location 'C:\workspace\team-project-final\documents'
git add docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git add docs/superpowers/specs/2026-05-28-stack-review-S3-datastores.md
git commit -m @'
docs(stack-review): S3 INDEX 갱신 + 보고서 PR 링크

- INDEX: S3 completed
- 누적 통계: 27기술 / ~N findings
- S4 위임 항목 명시 (§5.4·§5.5·§5.6)
- 보고서 헤더에 PR 링크 추가

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin docs/stack-review-S3-datastores
Pop-Location
```

- [ ] **Step 4: DoD 검증**

S1·S2 동일:
```
# 보고서 9 섹션, 위키 SHA, PR 링크, finding 최소 5개, PR OPEN
```

- [ ] **Step 5: 사용자 보고**

```
S3 데이터스토어 세션 완료.

- 보고서 PR: documents#<prNumber>
- 위키 커밋: documents.wiki@<wikiSha>
- 통계: E1:a · E2:b · D:c · R:d · OK:e / P0:x · P1:y · P2:z
- 메모리 정합: data-sync-outbox-cqrs ↔ §5.1.1 PostgreSQL 일관 확인
- 누적: 27/45 기술 검증 (S3까지 4 세션 완료)

다음: S4 이벤트/동기화 세션 (별도 writing-plans)
```

---

## 부록 — 비상 절차

S1·S2 동일.

---

## 추정 시간

- Phase A: 10분
- Phase B: 2시간 (5개 기술, S2b 분량 비슷)
- Phase C: 30분

총: ~2.5시간
