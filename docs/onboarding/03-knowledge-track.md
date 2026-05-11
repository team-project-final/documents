# 03 — 트랙 C: Knowledge 합류 가이드

> **트랙 mention**: `@knowledge-owner-1`, `@knowledge-owner-2` (2명 페어)
> **담당 레포**: `synapse-knowledge-svc`
> **담당 도메인**: note · graph · chunking (Spring Modulith 3 모듈) — Synapse의 정체성 Core
> **소요**: Day 1 트랙 작업 ~3시간

---

## 페어 분담 권장 (Day 1에 결정)

| 멤버 | 주 모듈 | 백업 |
|---|---|---|
| `@knowledge-owner-1` | **note** (Markdown CRUD + 위키링크 파서 + 버전 관리 + 첨부) | graph |
| `@knowledge-owner-2` | **graph + chunking** (백링크 + PageRank + ES 동기화 + 청크 분할) | note |

둘 다 note 모듈을 알아야 페어 가능 (한 명이 자리 비워도 다른 한 명이 컨텍스트 유지). chunking은 비동기 작업 + learning-ai 호출이라 owner-2가 주.

---

## Day 1 트랙별 흐름

```
0. 환경 점검 (10분)
1. 레포 클론 + 로컬 빌드 (20분)
2. 위키 트랙 정독 (50분 — 도메인 무게가 큼)
3. SECRETS.md 확인 + S3/ES 발급 (30분)
4. 페어 분담 합의 + 첫 비즈니스 PR (90분)
```

---

## 1. 환경 점검 (10분)

```bash
java --version         # Temurin 21.0.x
./gradlew --version    # Gradle 8.10+
docker --version       # 24.x+
```

Knowledge 트랙은 다음 컴포넌트 의존:
- **PostgreSQL** (notes/note_links/note_chunks + pgvector)
- **Elasticsearch** (nori 한글 형태소 + 동기화)
- **AWS S3** (첨부파일)
- **Kafka** (note.created/updated/deleted 발행, learning-ai의 청킹 요청 소비)

W1 시점엔 Docker Compose로 PostgreSQL + ES + Kafka만 띄우면 충분. S3는 W2+.

---

## 2. 레포 클론 + 로컬 빌드 (20분)

```bash
cd D:/workspace/synapse
gh repo clone team-project-final/synapse-knowledge-svc
gh repo clone team-project-final/synapse-shared

cd synapse-knowledge-svc
./gradlew clean build --no-daemon
```

기대: `BUILD SUCCESSFUL` + `ModuleStructureTest > verifiesModuleStructure() PASSED` (note/graph/chunking + shared).

```bash
# 인프라 일부 docker compose로 띄우기 (10 환경 설정 §3 발췌)
docker compose -f ../documents/docker-compose.yml up -d postgres elasticsearch kafka schema-registry

# 로컬 실행
./gradlew bootRun
curl http://localhost:8083/actuator/health
```

---

## 3. 위키 트랙 정독 (50분)

| 문서 | 자기 영역 |
|---|---|
| **02 ERD 문서** §2.2.3 | 노트 도메인 (notes / note_versions / note_links / note_chunks / tags / note_tags / attachments / bookmarks) |
| **04 API 명세서** §4.6 (Notes) / §4.9 (Graph) | 트랙 C 책임 엔드포인트 |
| **05 화면 흐름 시퀀스** §5.3 (노트 작성 + 위키링크 + 백링크 갱신) / §5.6 (시맨틱 검색 RRF) | 데이터 흐름 |
| **07 요구사항** §2.2 (NOTE) / §2.5 (GRAPH) | FR-NOTE-001~006, FR-GRAPH-001~004 |
| **18 기술 스택** §4.2~3 (pgvector HNSW + Elasticsearch nori) | 검색 스택 |

핵심 결정사항:
- **note ↔ graph 강결합**: "노트=노드, 위키링크=엣지". 같은 서비스 안 모듈이지만 직접 import 금지, 이벤트로 통신 (`NoteCreatedEvent` → graph 모듈 `@ApplicationModuleListener`).
- **note_chunks의 tenant 격리**: pgvector HNSW 인덱스에 `WHERE tenant_id IS NOT NULL` partial. 02 ERD §1.2 인덱스 규칙 참조.
- **위키링크 파서**: `[[제목]]` → `note_links` 행 1개. 미해결(`dst_note_id = NULL`)도 허용. 노트 제목 변경 시 `note_links.dst_title` 일괄 갱신 + `dst_note_id` 재해결.
- **note_versions 정책 B**: 1시간 내 변경은 같은 버전에 머지. 30일 이상 자동 정리 (Pro+은 90일).
- **청킹 비동기**: chunking 모듈이 `note.created` Kafka 소비 → learning-ai에 청크 분할 + 임베딩 요청 → `note_chunks` INSERT.

---

## 4. SECRETS.md 발급 절차 (30분)

```bash
cat docs/SECRETS.md
```

### 4.1 AWS S3 (첨부 + 백업)

1. AWS Console → S3 → Create bucket
   - 이름: `synapse-uploads-{env}` (dev/staging/prod)
   - Region: `ap-northeast-2`
   - 객체 잠금 X, Versioning 활성화
2. IAM → Users → 새 user `synapse-knowledge-svc-{env}` → Programmatic access
   - Policy: S3 PutObject/GetObject/DeleteObject (해당 bucket만)
3. Access key ID + Secret access key 복사

```bash
gh secret set AWS_S3_BUCKET --repo team-project-final/synapse-knowledge-svc
gh secret set AWS_ACCESS_KEY_ID --repo team-project-final/synapse-knowledge-svc
gh secret set AWS_SECRET_ACCESS_KEY --repo team-project-final/synapse-knowledge-svc
```

> Presigned URL TTL: 1시간 (10 환경 설정 §2 `S3_PRESIGNED_URL_TTL=3600`).

### 4.2 OpenSearch / Elasticsearch (W2 인프라)

AWS OpenSearch Service 또는 self-host ES 8 + nori plugin. W1엔 Docker Compose 로컬 ES로 충분 (단일 노드, xpack.security disabled).

W2 인프라 셋업 시 `@team-lead`가 OpenSearch 도메인 생성 + `ES_HOST`/`ES_PASSWORD` 등록.

### 4.3 pgvector

PostgreSQL 16 + pgvector extension. 별도 secrets 없음 — DB_HOST/DB_PASSWORD에 포함. W2 RDS Multi-AZ 셋업 시 활성화.

---

## 5. 페어 분담 합의 + 첫 비즈니스 PR (90분)

페어 둘이 Day 1에 누가 어떤 PR을 가져갈지 결정:

### Owner-1 첫 PR — note 모듈 Markdown CRUD

```bash
git checkout -b feature/KNOW-002-note-crud
```

| 파일 | 변경 |
|---|---|
| `note/Note.java` + Repository + Service + Controller | Markdown CRUD |
| `note/WikilinkParser.java` | `[[제목]]` 파싱 |
| `note/NoteCreatedEvent.java` | 도메인 이벤트 |
| `note/NotePlaceholderComponent.java` | Delete |
| 테스트: `NoteServiceTest`, `WikilinkParserTest`, `RlsIsolationTest` | TDD |

### Owner-2 첫 PR — graph 모듈 백링크 + 청크 분할 skeleton

```bash
git checkout -b feature/KNOW-003-graph-backlinks
```

| 파일 | 변경 |
|---|---|
| `graph/BacklinkService.java` + `BacklinkController.java` | `GET /notes/{id}/backlinks` |
| `graph/NoteEventListener.java` | `@ApplicationModuleListener` for `NoteCreatedEvent` → note_links upsert |
| `chunking/ChunkRequestPublisher.java` | Kafka 발행 (learning-ai 소비) skeleton |
| `graph/GraphPlaceholderComponent.java` + `chunking/ChunkingPlaceholderComponent.java` | Delete |

페어 PR은 **순서 의존**: owner-1의 PR이 먼저 머지된 후 owner-2가 그 위에서 작업. 09a 시나리오 B "백엔드 → 프론트 순서로 머지" 와 같은 정신.

---

## 6. W1~W5 트랙 C 일정 (17 스케줄 v3.0)

| 주차 | 트랙 C 작업 |
|---|---|
| **W1** (5/12~15) | knowledge-svc 골격 + note 모듈 (Markdown CRUD + 위키링크 파싱). Owner-2: Spring Modulith 모듈 정의 + ArchUnit 검증 + Schema Registry 연동 검증 |
| **W2** (5/18~22) | Owner-1: graph 모듈 (백링크 + D3.js 데이터) + Elasticsearch 동기화 (Kafka). Owner-2: chunking 모듈 (비동기 청크 분할) + note 검색 통합 (BM25) |
| **W3** (5/26~29) | Owner-1: note 버전 이력 + 태그 관리 고도화 + Graph PageRank (시간 허용 시). Owner-2: 검색 RRF (BM25 + 시맨틱 결합) + 정확도 측정 |
| **W4** (6/1~5) | Owner-1: W3 잔무 + 통합 검증. Owner-2: 검색 튜닝 + 하이브리드 검색 E2E + P0 버그 수정 |
| **W5** (6/8~12) | Owner-1: 노트/그래프 E2E + ES 안정화. Owner-2: 검색 안정화 + 정확도 리포트 |

W3 RRF는 가장 어려운 알고리즘 작업. W2 끝에 BM25 + 시맨틱 각각 동작하면 W3 RRF는 fusion 함수만 추가하면 됨.

---

## 7. 도메인 깊이 학습 자료

- **pgvector HNSW 튜닝**: https://github.com/pgvector/pgvector → `m`, `ef_construction`, `ef_search` 파라미터
- **Elasticsearch nori**: https://www.elastic.co/guide/en/elasticsearch/plugins/8.12/analysis-nori.html → 사용자 사전 추가
- **RRF (Reciprocal Rank Fusion)**: `score = Σ 1/(k + rank_i)`, k=60 (스펙 §5.6)
- **PageRank**: JGraphT `PageRank` 클래스 또는 Apache Spark GraphX (Phase 5+)
- **Outbox 패턴**: 노트 commit + Kafka 발행을 같은 트랜잭션으로 (시리즈 #3)
- **18 기술 스택 §2.2.4 청크 재생성 정책**: 본문 수정/모델 업그레이드/메타 변경별 다른 전략

---

## 8. 트랙 C FAQ

**Q1. 위키링크 자동완성 응답 속도가 안 나오는데?**
> 13 테스트 보고서 BUG-007 "위키링크 자동완성 500ms+ 지연" — `note_title_trgm` GIN 인덱스 + Redis 캐시 (`tenant:{tenantId}:autocomplete:{prefix}`). 02 ERD §2.3 핵심 인덱스 표.

**Q2. note_chunks 재생성을 매 노트 수정 시 다 하면 비용이 큰데?**
> Phase 1~3는 "전체 청크 삭제 후 재생성", Phase 5+에 "diff 기반 incremental". 18 기술 스택 §2.2.4 청크 재생성 정책 표. 단순 메타 변경(title)은 summary_embedding만 재생성, 청크 미변경.

**Q3. graph 모듈이 note 모듈 데이터를 어떻게 받는가? 직접 SQL join하면 안 되나?**
> Spring Modulith가 빌드 시간에 막습니다. 두 가지 방법:
> 1. `@ApplicationModuleListener` (in-process, 같은 트랜잭션 가능)
> 2. note 모듈이 `NoteFinder` 같은 query interface를 공개하면 graph가 그 interface만 의존 (Hexagonal port)
>
> 04 API §4.6.8 backlinks는 두 번째 방식이 자연스러움.

**Q4. PageRank 계산을 매 노트 수정 시 다 돌리면 비용이 큰데?**
> Phase 1~3은 PageRank 안 함. Phase 5+에 batch Cron (예: 매시간) + 변경된 노트 주변만 incremental update. 시리즈 자료의 GraphX 또는 JGraphT.

**Q5. Elasticsearch 동기화가 깨졌을 때 (Kafka consumer fail)?**
> Outbox + processed_events 패턴(시리즈 #3, #5). ES INSERT 실패 시 Kafka offset commit 안 함 → 자동 재시도. 11 테스트 전략 §4.2 ES 동기화 통합 테스트 참조.

---

## 9. 막혔을 때

| 상황 | 멘토 | 채널 |
|---|---|---|
| pgvector 튜닝 | `@team-lead` | `#synapse-dev` |
| ES nori 사전 추가 | `@team-lead` 또는 `@knowledge-owner-2` | `#synapse-dev` |
| Modulith 모듈 경계 위반 | `@team-lead` | `#synapse-dev` |
| RRF 알고리즘 정확도 | `@team-lead` 또는 `@learning-ai-owner` (시맨틱 검색 같은 패턴) | `#synapse-dev` |
| 페어 작업 충돌 | 둘이 직접 또는 `@team-lead` | DM |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v1.0 | 2026-05-12 | 초안 — Knowledge 트랙 합류 가이드 (페어 분담 + note/graph/chunking) |
