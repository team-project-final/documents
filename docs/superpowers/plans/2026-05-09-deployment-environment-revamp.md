# 14 배포 가이드 + 10 환경 설정 v2.0 Implementation Plan (그룹 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ADR-001/002 채택을 반영하여 `documents.wiki/14_배포_가이드.md`와 `documents.wiki/10_환경_설정_템플릿.md`를 v1.0 → v2.0으로 갱신한다 (in-place, 절 구조 보존).

**Architecture:** spec `2026-05-09-deployment-environment-revamp-design.md` §4·§5 변경 매트릭스를 따라 16개 task로 분할. 14는 메타·주의문·§1 ApplicationSet·§2.2 Local 서비스 목록·§3 yq·§4.3 통합 태그 단락·§6.1 Health 표·§7.1 Smoke Test·§10 신규 모듈 추가 절차·§11 모듈 hotfix·§12 변경 이력. 10은 메타·주의문·§2 .env 4-서비스 PORT 블록·§3 Docker Compose 4-서비스 + Schema Registry·§8 변경 이력. 직교 콘텐츠는 보존만.

**Tech Stack:** Markdown / GFM 표·코드블록·Mermaid·YAML / git (documents.wiki + syn).

**Repository constraints:**
- `documents.wiki`: git repo. 14/10 갱신 후 commit + push 1회 (Task 15).
- `syn`: git repo. plan 진척 commit + push (Task 16).

**Source references:**
- spec: `D:\workspace\final-project-syn\syn\docs\superpowers\specs\2026-05-09-deployment-environment-revamp-design.md`
- 09 v2.0 (cross-reference 대상): `D:\workspace\final-project-syn\documents.wiki\09_Git_규칙_정의서.md`

---

## File Structure

| 파일 | 역할 | 액션 |
|---|---|---|
| `documents.wiki/14_배포_가이드.md` | 14 v1.0 본문 (부분 갱신) | Edit N회 (Task 1~9) |
| `documents.wiki/10_환경_설정_템플릿.md` | 10 v1.0 본문 (§2·§3 큰 갱신) | Edit N회 (Task 10~13) |
| `syn/docs/superpowers/plans/2026-05-09-deployment-environment-revamp.md` | 본 plan | Task 16에서 commit |

---

## Task 1: 14 메타데이터 v2.0 + ⚠️ 주의문 삽입

**Files:**
- Modify: `D:\workspace\final-project-syn\documents.wiki\14_배포_가이드.md` (제목 직후)

- [ ] **Step 1: 첫 10줄 Read하여 v1.0 메타 확인**

`Read`: 14 파일, offset 0, limit 10.

- [ ] **Step 2: 메타 + ⚠️ 주의문 Edit 교체**

`Edit`:
- old_string:
  ```
  > **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS
  > **버전**: v1.0
  > **작성일**: 2026-05-07
  > **기술 스택**: Spring Boot 4, Flutter 3.x, FastAPI, PostgreSQL 16, Redis, Elasticsearch, Kafka, K8s
  ```
- new_string:
  ```
  > **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS
  > **버전**: v2.0
  > **작성일**: 2026-05-07
  > **수정일**: 2026-05-09
  > **기술 스택**: Spring Boot 4, Flutter 3.x, FastAPI, PostgreSQL 16, Redis, Elasticsearch, Kafka, K8s

  > ⚠️ **v2.0 전면 개편 안내**
  >
  > 본 문서는 ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 을 반영하여 갱신되었다. 자세한 결정 근거와 운영 규칙은 `09_Git_규칙_정의서` v2.0 (§0.1 ADR 요지 / §B1 레포 구조 / §B3 GitOps + ApplicationSet / §B4 Schema Registry / Appendix A·B ADR 전문) 참조.
  >
  > 본 v2.0과 함께 / 이후 갱신되는 위키 문서:
  >  - `09_Git_규칙_정의서` v2.0 (이미 채택 완료)
  >  - `03_프로젝트_아키텍처_정의서` v2.0 (그룹 1 — 채택 완료)
  >  - `18_기술_스택_정의서` v2.0 (그룹 1 — 채택 완료)
  >  - `14_배포_가이드` v2.0 (그룹 2 — 본 사이클)
  >  - `10_환경_설정_템플릿` v2.0 (그룹 2 — 본 사이클)
  >  - `17_스케줄` v2.0 (그룹 3 — 다음 사이클)
  ```

- [ ] **Step 3: 검증**

| Grep | 기대 |
|---|---|
| `\*\*버전\*\*: v2\.0` | 1+ |
| `채택일 2026-05-09` | 1+ |
| `\*\*버전\*\*: v1\.0` | 0 |

---

## Task 2: 14 §1 CI/CD Mermaid — ApplicationSet 라벨 갱신

**Files:**
- Modify: 14 파일 §1 Mermaid (line ~10~42)

- [ ] **Step 1: §1 Mermaid 본문 Read**

`Read`: 14 파일, offset 10, limit 35.

기대: `flowchart LR` 안에 `I[Update Helm Values]` 또는 유사 노드 발견.

- [ ] **Step 2: ArgoCD CD 노드 라벨 갱신 (Edit)**

v1.0의 정확한 본문을 Read 결과로 확인 후:

`Edit`:
- old_string: `        H --> I[Update Helm Values]` (또는 v1.0 정확한 라인)
- new_string: `        H --> I[Update Kustomize newTag<br/>via ApplicationSet matrix<br/>5 services x 3 envs]`

만약 v1.0 본문이 다른 형태(`Helm`이 아니거나 다른 노드 ID)면 Read 결과로 정확한 매칭 후 동일 의미 변경.

- [ ] **Step 3: 검증**

`Grep`: pattern `Kustomize newTag\|ApplicationSet matrix`. 기대 1+.
`Grep`: pattern `Update Helm Values`. 기대 0 (변경됨).

---

## Task 3: 14 §2.2 Local Docker Compose — 서비스 목록 4-서비스로 재작성

**Files:**
- Modify: 14 파일 §2.2 (line ~58~83)

- [ ] **Step 1: §2.2 서비스 목록 본문 Read**

`Read`: 14 파일, offset 58, limit 25.

기대: `# 서비스 목록` 주석 블록 + 8개 서비스 라인.

- [ ] **Step 2: 서비스 목록 Edit 교체**

`Edit`:
- old_string:
  ```
  # 서비스 목록
  # - api-gateway (8080)
  # - note-service (8081)
  # - card-service (8082)
  # - auth-service (8083)
  # - ai-service (8090, FastAPI)
  # - postgresql (5432)
  # - redis (6379)
  # - elasticsearch (9200)
  # - kafka + zookeeper (9092)
  ```
- new_string:
  ```
  # 서비스 목록 (v2.0 4-서비스 통합)
  # - api-gateway (8080)
  # - synapse-platform-svc (8081 — auth + audit + billing + notification)
  # - synapse-engagement-svc (8082 — community + gamification)
  # - synapse-knowledge-svc (8083 — note + graph + chunking)
  # - synapse-learning-card (8084 — card + srs, Java)
  # - synapse-learning-ai (8090 — ai, Python/FastAPI)
  # - postgresql (5432)
  # - redis (6379)
  # - elasticsearch (9200)
  # - kafka + zookeeper (9092)
  # - schema-registry (8081 → 외부 매핑은 docker-compose 참조)
  # Docker Compose 풀 정의는 10_환경_설정_템플릿.md §3 참조
  ```

만약 v1.0 본문이 약간 다르면 Read 결과 그대로 매칭 + 위 패턴으로 교체.

- [ ] **Step 3: 검증**

`Grep`: pattern `synapse-platform-svc \(8081\|synapse-engagement-svc \(8082\|synapse-knowledge-svc \(8083\|synapse-learning-card \(8084\|synapse-learning-ai \(8090`. 기대 5+.
`Grep`: pattern `# - note-service \(\|# - card-service \(\|# - auth-service \(\|# - ai-service \(`. 기대 0.

---

## Task 4: 14 §3 도구 표에 yq 행 추가

**Files:**
- Modify: 14 파일 §3.1 도구 표 (line ~86~95)

- [ ] **Step 1: §3.1 도구 표 본문 Read**

`Read`: 14 파일, offset 86, limit 12.

기대: 도구 표 (Docker / kubectl / Helm / AWS CLI / ArgoCD CLI / Flyway CLI 행).

- [ ] **Step 2: 표 마지막 행 직후에 yq 행 추가 (Edit)**

`Edit`:
- old_string: `| Flyway CLI | 10.x | DB 마이그레이션 (로컬) |` (또는 v1.0 마지막 row)
- new_string:
  ```
  | Flyway CLI | 10.x | DB 마이그레이션 (로컬) |
  | yq | 4.x | kustomization newTag bump (deploy.yml — 09 §B3) |
  ```

- [ ] **Step 3: 검증**

`Grep`: pattern `\| yq \| 4\.x \|`. 기대 1+.

---

## Task 5: 14 §4.3 Rollback 절차에 통합 태그 1단락 추가

**Files:**
- Modify: 14 파일 §4.3 (line ~138~157)

- [ ] **Step 1: §4.3 끝 위치 확인**

`Grep` (`-n true`): pattern `^## 5\. DB 마이그레이션`. 기대 1 match (§5 시작 라인).

- [ ] **Step 2: §5 직전에 1단락 추가 (Edit)**

`Edit`:
- old_string: `## 5. DB 마이그레이션 (Flyway)`
- new_string:
  ```
  > **통합 배포 태그 롤백**: 운영 배포 시점은 `synapse-gitops/v{날짜}` 통합 배포 태그(예: `synapse-gitops/v2026.05.10`)로 식별된다. 통합 태그 단위 롤백 절차는 `09_Git_규칙_정의서` v2.0 §B5 참조.

  ## 5. DB 마이그레이션 (Flyway)
  ```

- [ ] **Step 3: 검증**

`Grep`: pattern `통합 배포 태그 롤백`. 기대 1+.
`Grep`: pattern `synapse-gitops/v\{날짜\}\|synapse-gitops/v2026\.05\.10`. 기대 1+.

---

## Task 6: 14 §6.1 Health 엔드포인트 표 4-서비스 재기재 (조건부)

**Files:**
- Modify: 14 파일 §6.1 (line ~198~206)

- [ ] **Step 1: §6.1 본문 Read**

`Read`: 14 파일, offset 196, limit 15.

기대: Health 엔드포인트 표. v1.0 도메인 서비스(`auth-service`, `note-service`, `card-service`, `ai-service`, `community-service`, `gamification-service`, `notification-service`) 행 발견 가능.

- [ ] **Step 2-A: 도메인 서비스 행이 있으면 4-서비스 5행으로 교체 (Edit)**

`Edit`:
- old_string: v1.0 표 본문 전체 (Read 결과 그대로)
- new_string:
  ```
  | 서비스 | Health 엔드포인트 | Readiness | Liveness |
  |---|---|---|---|
  | `synapse-platform-svc` | `/actuator/health` | `/actuator/health/readiness` | `/actuator/health/liveness` |
  | `synapse-engagement-svc` | `/actuator/health` | `/actuator/health/readiness` | `/actuator/health/liveness` |
  | `synapse-knowledge-svc` | `/actuator/health` | `/actuator/health/readiness` | `/actuator/health/liveness` |
  | `synapse-learning-card` (Java) | `/actuator/health` | `/actuator/health/readiness` | `/actuator/health/liveness` |
  | `synapse-learning-ai` (FastAPI) | `/health` | `/health/ready` | `/health/live` |
  ```

- [ ] **Step 2-B: 도메인 서비스 행이 없거나 표가 다른 형태면 skip + NOTES에 발견 사항 명시**

- [ ] **Step 3: 검증**

`Grep`: pattern `synapse-platform-svc.*actuator/health\|synapse-learning-ai.*\/health\/ready`. 기대 2+ (Step 2-A 실행 시).

---

## Task 7: 14 §7.1 Smoke Test host 재매핑 (조건부)

**Files:**
- Modify: 14 파일 §7.1 (line ~239~278)

- [ ] **Step 1: §7.1 본문 Read**

`Read`: 14 파일, offset 239, limit 45.

기대: Smoke Test 시나리오. v1.0 도메인 서비스 host(`note-service`, `card-service`, `auth-service`, `ai-service`, `community-service`, `gamification-service`, `notification-service`) 등장 가능.

- [ ] **Step 2: 발견된 host별 Edit (각 1회씩, replace_all 신중 사용)**

매핑:
- `auth-service:` → `platform-svc:`
- `billing-service:` → `platform-svc:`
- `audit-service:` → `platform-svc:`
- `notification-service:` → `platform-svc:`
- `community-service:` → `engagement-svc:`
- `gamification-service:` → `engagement-svc:`
- `note-service:` → `knowledge-svc:`
- `graph-service:` → `knowledge-svc:`
- `card-service:` → `learning-card:`
- `ai-service:` → `learning-ai:`

각 host가 §7.1 안에서 발견되면 1회씩 Edit. host 패턴이 다른 절에서도 등장한다면 §7.1 unique context 포함하여 매칭.

만약 §7.1 안에 위 패턴이 0건이면 skip.

- [ ] **Step 3: 검증**

`Grep` (in §7.1 영역): pattern `note-service\|card-service\|auth-service\|ai-service\|community-service\|gamification-service\|notification-service`. 기대 0 (Step 2 실행 시).

---

## Task 8: 14 §10 신규 모듈 추가 절차로 전면 재구성 + FCM/APNs 보존 + §11 hotfix 1줄

**Files:**
- Modify: 14 파일 §10 (line ~368~470) + §11 (line ~471~492)

- [ ] **Step 1: §10 시작~§11 직전까지 본문 Read**

`Grep` (`-n true`): pattern `^## 10\. 신규 서비스 배포 절차`.
`Grep` (`-n true`): pattern `^## 11\. 긴급 배포 \(Hotfix\)`.

`Read`: 14 파일, §10 시작~§11 직전 (위 grep 결과 라인 범위).

기대: §10 본문 + 10.1 Community / 10.2 Gamification / 10.3 Notification / 10.4 FCM/APNs sub-section.

- [ ] **Step 2: §10 시작~§11 직전 전체를 신규 본문으로 교체 (Edit)**

`Edit`:
- file_path: 14 파일
- old_string: §10 헤딩(`## 10. 신규 서비스 배포 절차`) 부터 `## 11. 긴급 배포 (Hotfix)` 직전까지 v1.0 본문 전체 (Step 1 Read 결과 정확한 문자열)
- new_string:

```markdown
## 10. 신규 모듈 추가 절차 (4-서비스 통합 후)

v2.0 (4-서비스 통합) 패턴: 신규 도메인이 추가되면 별도 서비스 생성이 아닌 **기존 서비스 안 모듈**로 추가한다. 모듈 경계는 Spring Modulith가 강제하고 ArchUnit이 검증한다.

**1. 트랙 owner와 합의** — 어느 서비스(platform / engagement / knowledge / learning-card / learning-ai) 안의 모듈로 들어갈지 결정 (도메인 응집도 + 트랙 부하 기준). `09_Git_규칙_정의서` §0.3 매핑표 참조.

**2. 모듈 선언** — 해당 서비스 레포에 신규 패키지 + `package-info.java`로 모듈 선언:

```java
@ApplicationModule(
    displayName = "New Module",
    allowedDependencies = {"shared"}  // 또는 다른 모듈 명시
)
package com.synapse.<service>.<newmodule>;

import org.springframework.modulith.ApplicationModule;
```

**3. ArchUnit 검증** — `ApplicationModules.of(Application.class).verify()` CI 자동 통과 확인 (`18_기술_스택_정의서` §4.1.8 Spring Modulith 참조).

**4. Avro 스키마 (선택)** — Kafka 이벤트 발행이 있다면 `synapse-shared`에 .avsc PR. Schema Registry BACKWARD 호환성 검증 — `09_Git_규칙_정의서` §B4 참조.

**5. 통합 테스트** — 모듈 단위 테스트 + 영향 받는 다른 모듈과의 통합 테스트.

**6. 배포** — 기존 서비스 image 재배포 (서비스 자체 분리 없음, 새 모듈 포함된 새 image). deploy.yml의 GitOps 흐름 그대로 — `09_Git_규칙_정의서` §B3 참조.

**7. ApplicationSet 그대로** — 별도 ArgoCD Application 추가 없음. 5×3 매트릭스(5 서비스 × dev/staging/prod)가 그대로 새 image를 가져간다.

> **v1.0 → v2.0 변화**: v1.0의 "신규 서비스 배포 절차"(별도 K8s Deployment / Service / Ingress / ArgoCD App 추가)는 4-서비스 통합 후 의미 없음. 모듈 단위 추가로 갈음.

### 10.x FCM/APNs 인증서 관리 절차

(여기에 v1.0 §10.4 FCM/APNs 인증서 관리 본문을 그대로 보존. owner는 `@platform-owner` + `@team-lead`로 명시)
```

> ⚠️ Step 2의 new_string 마지막 sub-section "10.x FCM/APNs 인증서 관리 절차"는 v1.0 §10.4의 본문(인증서 발급·갱신·교체 절차)을 그대로 옮긴다. Step 1 Read에서 §10.4 본문을 확보했으므로 그대로 복사하여 new_string에 포함. 만약 v1.0 §10.4 본문이 길다면 본문 전체를 new_string에 포함하여 정보 손실 없이 보존.

- [ ] **Step 3: §11 본문 끝에 1줄 추가**

`Grep` (`-n true`): pattern `^## 12\. 변경 이력`. 기대 1 (§12 시작).

`Read`: §11 본문 (offset = §11 시작, limit = §12까지).

`Edit`:
- old_string: `## 12. 변경 이력` (또는 §11 본문 마지막 라인 + `## 12.`)
- new_string: 1줄 추가:
  ```
  > **모듈 단위 hotfix**: Hotfix가 한 모듈만 영향 시 해당 서비스 단위로 진행 (서비스 전체 재배포가 아닌 모듈만 패치된 새 image). 영향 받는 모듈 owner와 `@team-lead` 단독 승인.

  ## 12. 변경 이력
  ```

- [ ] **Step 4: 검증**

| Grep | 기대 |
|---|---|
| `^## 10\. 신규 모듈 추가 절차` | 1 |
| `^### 10\.1 Community Service\|^### 10\.2 Gamification Service\|^### 10\.3 Notification Service` | 0 |
| `1\. 트랙 owner와 합의\|2\. 모듈 선언\|3\. ArchUnit 검증\|4\. Avro 스키마\|5\. 통합 테스트\|6\. 배포\|7\. ApplicationSet 그대로` | 6+ |
| `FCM` 또는 `APNs` (§10 안) | 1+ (10.x sub-section 보존 확인) |
| `모듈 단위 hotfix` | 1+ |

---

## Task 9: 14 §12 변경 이력 v2.0 row 추가

**Files:**
- Modify: 14 파일 §12 변경 이력 표

- [ ] **Step 1: §12 변경 이력 본문 Read**

`Grep` (`-n true`): pattern `^## 12\. 변경 이력`.

`Read`: 14 파일, §12 시작~끝 (offset = §12 grep 결과, limit = 20).

- [ ] **Step 2: v2.0 row 추가 (Edit)**

`Edit`:
- old_string: §12 표의 v1.0 마지막 row (Read 결과 그대로, 예: `| v1.0 | 2026-05-07 | Synapse Team | 초안 작성 |`)
- new_string: 그 row + 다음 row:
  ```
  | v2.0 | 2026-05-09 | Synapse Team | ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영. 09_Git_규칙_정의서 v2.0 채택 전제. ⚠️ 주의문 추가. §1 CI/CD Mermaid에 ArgoCD ApplicationSet matrix generator 라벨 / §2.2 Local 서비스 목록 4-서비스 + Schema Registry 재작성 / §3 도구 표 yq 행 추가 / §4.3 통합 배포 태그 롤백 단락 / §6.1 Health 엔드포인트 표 5행 4-서비스 재기재 / §7.1 Smoke Test host 재매핑 / §10 "신규 모듈 추가 절차"로 전면 재구성 (10.4 FCM/APNs 인증서 관리는 §10.x로 보존) / §11 모듈 단위 hotfix 안내 추가. 직교 절(§3·§4·§5·§8·§9 본문) 보존. |
  ```

- [ ] **Step 3: 검증**

`Grep`: pattern `\| v2\.0 \| 2026-05-09 \|`. 기대 1+.

---

## Task 10: 10 메타데이터 v2.0 + ⚠️ 주의문 삽입

**Files:**
- Modify: `D:\workspace\final-project-syn\documents.wiki\10_환경_설정_템플릿.md` (제목 직후)

- [ ] **Step 1: 첫 10줄 Read**

`Read`: 10 파일, offset 0, limit 10.

- [ ] **Step 2: 메타 + ⚠️ 주의문 Edit (Task 1과 동일 블록 패턴, 본문은 동일)**

`Edit`:
- file_path: 10 파일
- old_string:
  ```
  > **프로젝트명**: Synapse — 통합 학습-지식 그래프 SaaS
  > **버전**: v1.0
  > **작성일**: 2026-05-07
  > **기술 스택**: Spring Boot 4, Flutter 3.x, FastAPI, PostgreSQL 16, Redis, Elasticsearch, Kafka, K8s
  ```
- new_string: Task 1 Step 2의 new_string 그대로 (5문서 후속 갱신 안내 동일)

- [ ] **Step 3: 검증**

| Grep | 기대 |
|---|---|
| `\*\*버전\*\*: v2\.0` | 1+ |
| `채택일 2026-05-09` | 1+ |

---

## Task 11: 10 §2 .env 4-서비스 PORT 블록 + Schema Registry

**Files:**
- Modify: 10 파일 §2 (line ~26~187, 특히 §2 Community / Gamification / Notification 블록)

- [ ] **Step 1: §2의 도메인 서비스 PORT 블록 Read**

`Grep` (`-n true`): pattern `# ----- Community Service -----\|# ----- Gamification Service -----\|# ----- Notification Service -----`. 위치 확인.

`Read`: 10 파일, offset = 첫 매칭 라인 - 2, limit = 30 (3개 블록 모두 포함).

- [ ] **Step 2: 3개 도메인 블록을 4-서비스 PORT 블록으로 교체 (Edit)**

`Edit`:
- file_path: 10 파일
- old_string:
  ```
  # ----- Community Service -----
  COMMUNITY_SERVICE_PORT=8084
  COMMUNITY_SERVICE_URL=http://community-service:8084

  # ----- Gamification Service -----
  GAMIFICATION_SERVICE_PORT=8085
  GAMIFICATION_SERVICE_URL=http://gamification-service:8085
  GAMIFICATION_STREAK_XP_CAP=100
  GAMIFICATION_LEADERBOARD_CRON=0 0 * * *
  GAMIFICATION_STREAK_RESET_CRON=0 0 * * *

  # ----- Notification Service -----
  NOTIFICATION_SERVICE_PORT=8086
  NOTIFICATION_SERVICE_URL=http://notification-service:8086
  ```
- new_string:
  ```
  # ----- synapse-platform-svc (auth + audit + billing + notification 모듈) -----
  PLATFORM_SERVICE_PORT=8081
  PLATFORM_SERVICE_URL=http://synapse-platform-svc:8081

  # ----- synapse-engagement-svc (community + gamification 모듈) -----
  ENGAGEMENT_SERVICE_PORT=8082
  ENGAGEMENT_SERVICE_URL=http://synapse-engagement-svc:8082

  # ----- synapse-knowledge-svc (note + graph + chunking 모듈) -----
  KNOWLEDGE_SERVICE_PORT=8083
  KNOWLEDGE_SERVICE_URL=http://synapse-knowledge-svc:8083

  # ----- synapse-learning-card (card + srs 모듈, Java) -----
  LEARNING_CARD_PORT=8084
  LEARNING_CARD_URL=http://synapse-learning-card:8084

  # ----- synapse-learning-ai (ai 모듈, Python/FastAPI) -----
  LEARNING_AI_PORT=8090
  LEARNING_AI_URL=http://synapse-learning-ai:8090

  # ----- gamification 모듈 환경 변수 (engagement-svc 안) -----
  GAMIFICATION_STREAK_XP_CAP=100
  GAMIFICATION_LEADERBOARD_CRON=0 0 * * *
  GAMIFICATION_STREAK_RESET_CRON=0 0 * * *

  # ----- Schema Registry (Confluent) -----
  SCHEMA_REGISTRY_URL=http://schema-registry:8081
  SCHEMA_REGISTRY_USER=
  SCHEMA_REGISTRY_PASS=
  ```

만약 v1.0 본문이 위 old_string과 약간 다르면 (예: 빈 줄 위치 / 변수 순서) Read 결과 그대로 매칭. GAMIFICATION 모듈 환경 변수는 module owner인 engagement-svc 안에 있다는 의미로 블록 라벨만 바뀜.

- [ ] **Step 3: §2 Internal API 블록의 CARD_SERVICE_INTERNAL_URL 갱신**

`Read`: §2 Internal API 블록 본문 확인 (가능 시 grep으로 위치 확인).

`Grep` (`-n true`): pattern `CARD_SERVICE_INTERNAL_URL`. 기대 1 (있다면).

`Edit`:
- old_string: `CARD_SERVICE_INTERNAL_URL=http://card-service:8082/internal`
- new_string: `LEARNING_CARD_INTERNAL_URL=http://synapse-learning-card:8084/internal`

만약 v1.0 본문에 `CARD_SERVICE_INTERNAL_URL`이 0건이면 skip.

- [ ] **Step 4: 검증**

| Grep | 기대 |
|---|---|
| `PLATFORM_SERVICE_PORT=8081\|ENGAGEMENT_SERVICE_PORT=8082\|KNOWLEDGE_SERVICE_PORT=8083\|LEARNING_CARD_PORT=8084\|LEARNING_AI_PORT=8090` | 5+ |
| `COMMUNITY_SERVICE_PORT\|GAMIFICATION_SERVICE_PORT\|NOTIFICATION_SERVICE_PORT` | 0 |
| `SCHEMA_REGISTRY_URL=http://schema-registry` | 1+ |

---

## Task 12: 10 §3 Docker Compose 4-서비스 + Schema Registry 전면 재작성

**Files:**
- Modify: 10 파일 §3 (line ~187~350)

- [ ] **Step 1: §3 본문 전체 Read**

`Grep` (`-n true`): pattern `^## 3\. Docker Compose`.
`Grep` (`-n true`): pattern `^## 4\. 초기화 SQL`.

`Read`: 10 파일, §3 시작~§4 직전.

기대: v1.0의 services 정의 (8~10개 서비스: postgres / redis / elasticsearch / kafka + zookeeper / api-gateway / note-service / card-service / auth-service / ai-service / 또는 community-service / gamification-service / notification-service 등).

- [ ] **Step 2: §3 services 블록을 4-서비스 + Schema Registry로 전면 교체 (Edit)**

`Edit`:
- file_path: 10 파일
- old_string: §3의 ` ```yaml ` 코드블록 시작부터 ` ``` ` 종료까지 v1.0 본문 전체 (Read 결과 정확한 문자열)
- new_string (정확히 — zero-width space 사용 시 제거):

```yaml
# docker-compose.yml (v2.0 — 4-서비스 통합 + Schema Registry)
version: "3.9"

services:
  # ===== PostgreSQL 16 + pgvector =====
  postgres:
    image: pgvector/pgvector:pg16
    container_name: synapse-postgres
    environment:
      POSTGRES_DB: synapse
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - synapse-net

  # ===== Redis 7 =====
  redis:
    image: redis:7-alpine
    container_name: synapse-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - synapse-net

  # ===== Elasticsearch 8 =====
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: synapse-es
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    networks:
      - synapse-net

  # ===== Kafka 3.x + Zookeeper =====
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: synapse-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    networks:
      - synapse-net

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: synapse-kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_INTERNAL:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,PLAINTEXT_INTERNAL://kafka:29092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    networks:
      - synapse-net

  # ===== Confluent Schema Registry 7.x (v2.0 신규) =====
  schema-registry:
    image: confluentinc/cp-schema-registry:7.5.0
    container_name: synapse-schema-registry
    depends_on:
      - kafka
      - zookeeper
    ports:
      - "8085:8081"  # 호스트 8085 → 컨테이너 8081 (서비스 PORT 충돌 회피)
    environment:
      SCHEMA_REGISTRY_HOST_NAME: schema-registry
      SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: PLAINTEXT://kafka:29092
      SCHEMA_REGISTRY_LISTENERS: http://0.0.0.0:8081
    networks:
      - synapse-net

  # ===== API Gateway (Spring Cloud Gateway 5) =====
  api-gateway:
    build: ./api-gateway
    container_name: synapse-api-gateway
    ports:
      - "8080:8080"
    environment:
      JWT_SECRET: ${JWT_SECRET}
      REDIS_HOST: redis
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    depends_on:
      - redis
      - synapse-platform-svc
      - synapse-engagement-svc
      - synapse-knowledge-svc
      - synapse-learning-card
      - synapse-learning-ai
    networks:
      - synapse-net

  # ===== synapse-platform-svc (auth + audit + billing + notification) =====
  synapse-platform-svc:
    build: ./platform-svc
    container_name: synapse-platform-svc
    ports:
      - "8081:8081"
    environment:
      DB_HOST: postgres
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      KAFKA_BOOTSTRAP_SERVERS: kafka:29092
      SCHEMA_REGISTRY_URL: http://schema-registry:8081
      JWT_SECRET: ${JWT_SECRET}
      OAUTH_GOOGLE_CLIENT_ID: ${OAUTH_GOOGLE_CLIENT_ID}
      OAUTH_GOOGLE_CLIENT_SECRET: ${OAUTH_GOOGLE_CLIENT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      FCM_SERVER_KEY: ${FCM_SERVER_KEY}
      AWS_SES_REGION: ${AWS_SES_REGION}
    depends_on:
      - postgres
      - redis
      - kafka
      - schema-registry
    networks:
      - synapse-net

  # ===== synapse-engagement-svc (community + gamification) =====
  synapse-engagement-svc:
    build: ./engagement-svc
    container_name: synapse-engagement-svc
    ports:
      - "8082:8082"
    environment:
      DB_HOST: postgres
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      KAFKA_BOOTSTRAP_SERVERS: kafka:29092
      SCHEMA_REGISTRY_URL: http://schema-registry:8081
      LEARNING_CARD_INTERNAL_URL: http://synapse-learning-card:8084/internal
      GAMIFICATION_STREAK_XP_CAP: ${GAMIFICATION_STREAK_XP_CAP}
      GAMIFICATION_LEADERBOARD_CRON: ${GAMIFICATION_LEADERBOARD_CRON}
      GAMIFICATION_STREAK_RESET_CRON: ${GAMIFICATION_STREAK_RESET_CRON}
    depends_on:
      - postgres
      - redis
      - kafka
      - schema-registry
    networks:
      - synapse-net

  # ===== synapse-knowledge-svc (note + graph + chunking) =====
  synapse-knowledge-svc:
    build: ./knowledge-svc
    container_name: synapse-knowledge-svc
    ports:
      - "8083:8083"
    environment:
      DB_HOST: postgres
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      ES_HOST: elasticsearch
      ES_PORT: 9200
      KAFKA_BOOTSTRAP_SERVERS: kafka:29092
      SCHEMA_REGISTRY_URL: http://schema-registry:8081
      AWS_REGION: ${AWS_REGION}
      S3_BUCKET_NAME: ${S3_BUCKET_NAME}
    depends_on:
      - postgres
      - elasticsearch
      - kafka
      - schema-registry
    networks:
      - synapse-net

  # ===== synapse-learning-card (card + srs, Java) =====
  synapse-learning-card:
    build: ./learning-svc/learning-card
    container_name: synapse-learning-card
    ports:
      - "8084:8084"
    environment:
      DB_HOST: postgres
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      KAFKA_BOOTSTRAP_SERVERS: kafka:29092
      SCHEMA_REGISTRY_URL: http://schema-registry:8081
    depends_on:
      - postgres
      - redis
      - kafka
      - schema-registry
    networks:
      - synapse-net

  # ===== synapse-learning-ai (ai, Python/FastAPI) =====
  synapse-learning-ai:
    build: ./learning-svc/learning-ai
    container_name: synapse-learning-ai
    ports:
      - "8090:8090"
    environment:
      DB_HOST: postgres
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      ES_HOST: elasticsearch
      KAFKA_BOOTSTRAP_SERVERS: kafka:29092
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      EMBEDDING_API_KEY: ${EMBEDDING_API_KEY}
      EMBEDDING_MODEL: ${EMBEDDING_MODEL}
    depends_on:
      - postgres
      - redis
      - elasticsearch
      - kafka
    networks:
      - synapse-net

volumes:
  postgres_data:
  redis_data:
  es_data:

networks:
  synapse-net:
    driver: bridge
```

> ⚠️ Step 2의 new_string은 표준 백틱3개로 fence (zero-width space 사용 안 함). v1.0의 environment 변수는 모두 .env 변수를 참조하는 패턴 그대로 유지. 만약 v1.0에 다른 추가 컨테이너(예: mailhog)가 있었으면 보존하여 추가.

- [ ] **Step 3: 검증**

| Grep | 기대 |
|---|---|
| `synapse-platform-svc:\|synapse-engagement-svc:\|synapse-knowledge-svc:\|synapse-learning-card:\|synapse-learning-ai:` | 5+ matches (services 정의 + depends_on 등) |
| `schema-registry:` | 1+ |
| `confluentinc/cp-schema-registry` | 1+ |
| `note-service:\|card-service:\|auth-service:\|community-service:\|gamification-service:\|notification-service:` (services 정의 잔재) | 0 |

---

## Task 13: 10 §8 변경 이력 v2.0 row 추가

**Files:**
- Modify: 10 파일 §8 변경 이력 표

- [ ] **Step 1: §8 본문 Read**

`Grep` (`-n true`): pattern `^## 8\. 변경 이력`.
`Read`: §8 시작~끝.

- [ ] **Step 2: v2.0 row 추가 (Edit)**

`Edit`:
- old_string: §8 표의 v1.0 마지막 row
- new_string: 그 row + 다음:
  ```
  | v2.0 | 2026-05-09 | Synapse Team | ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영. 09_Git_규칙_정의서 v2.0 채택 전제. ⚠️ 주의문 추가. §2 .env 4-서비스 PORT 블록(PLATFORM/ENGAGEMENT/KNOWLEDGE/LEARNING_CARD/LEARNING_AI) + Schema Registry 변수 / §3 Docker Compose 4-서비스 + Schema Registry 전면 재작성 / 모듈별 환경 변수 보존. 직교 절(§1·§4·§5·§6·§7) 보존. |
  ```

- [ ] **Step 3: 검증**

`Grep`: pattern `\| v2\.0 \| 2026-05-09 \|`. 기대 1+.

---

## Task 14: 그룹 2 통합 검증 (spec §8 5영역)

- [ ] **Step 1: 14 검증 grep 일괄**

| 패턴 | path | 기대 |
|---|---|---|
| `Auth Service\|Note Service\|Card Service\|Graph Service\|AI Service\|Billing Service\|Audit Service\|Community Service\|Gamification Service\|Notification Service` (헤딩) | 14 | 0 (모듈 라벨 허용) |
| `synapse-platform-svc\|synapse-engagement-svc\|synapse-knowledge-svc\|synapse-learning-card\|synapse-learning-ai` | 14 | 5+ |
| `^### 10\.1 Community Service\|^### 10\.2 Gamification Service\|^### 10\.3 Notification Service` | 14 | 0 |
| `^## 10\. 신규 모듈 추가 절차` | 14 | 1 |
| `\| v2\.0 \| 2026-05-09 \|` | 14 | 1+ |
| `09_Git_규칙_정의서` (cross-reference) | 14 | 3+ |

- [ ] **Step 2: 10 검증 grep 일괄**

| 패턴 | path | 기대 |
|---|---|---|
| `PLATFORM_SERVICE_PORT\|ENGAGEMENT_SERVICE_PORT\|KNOWLEDGE_SERVICE_PORT\|LEARNING_CARD_PORT\|LEARNING_AI_PORT` | 10 | 5+ |
| `COMMUNITY_SERVICE_PORT\|GAMIFICATION_SERVICE_PORT\|NOTIFICATION_SERVICE_PORT` | 10 | 0 |
| `SCHEMA_REGISTRY_URL` | 10 | 1+ |
| `synapse-platform-svc:\|synapse-engagement-svc:\|synapse-knowledge-svc:\|synapse-learning-card:\|synapse-learning-ai:` | 10 | 5+ |
| `schema-registry:` (Docker Compose service) | 10 | 1+ |
| `note-service:\|card-service:\|auth-service:\|community-service:\|gamification-service:\|notification-service:` | 10 | 0 |
| `\| v2\.0 \| 2026-05-09 \|` | 10 | 1+ |

- [ ] **Step 3: 분량 확인**

`Bash`: `wc -l 'D:\workspace\final-project-syn\documents.wiki\14_배포_가이드.md' 'D:\workspace\final-project-syn\documents.wiki\10_환경_설정_템플릿.md'`

기대: 14 ∈ [470, 560], 10 ∈ [530, 620].

---

## Task 15: documents.wiki commit + push

- [ ] **Step 1: status 확인**

```bash
git -C 'D:\workspace\final-project-syn\documents.wiki' status -s
```

기대: M 14_배포_가이드.md / M 10_환경_설정_템플릿.md.

- [ ] **Step 2: 두 파일 add + commit + push**

```bash
git -C 'D:\workspace\final-project-syn\documents.wiki' add \
  '14_배포_가이드.md' \
  '10_환경_설정_템플릿.md'

git -C 'D:\workspace\final-project-syn\documents.wiki' commit -m "$(cat <<'EOF'
docs: 14 배포 가이드 + 10 환경 설정 v2.0 갱신 (그룹 2)

ADR-001 (10→4 서비스 통합) / ADR-002 (AI Service 통합) — 채택일 2026-05-09 — 반영.
09_Git_규칙_정의서 v2.0 채택 전제로 후속 갱신 5문서 중 그룹 2를 처리.

14_배포_가이드:
- ⚠️ 주의문
- 1. CI/CD Mermaid에 ArgoCD ApplicationSet matrix generator 라벨
- 2.2 Local 서비스 목록 4-서비스 + Schema Registry 재작성
- 3 도구 표 yq 행 추가
- 4.3 통합 배포 태그 롤백 단락
- 6.1 Health 엔드포인트 표 5행 4-서비스 재기재
- 7.1 Smoke Test host 재매핑
- 10 "신규 모듈 추가 절차"로 전면 재구성 (10.4 FCM/APNs 보존)
- 11 모듈 단위 hotfix 안내
- 12 변경 이력 v2.0
- 직교 절(§3·§4·§5·§8·§9 본문) 보존

10_환경_설정_템플릿:
- ⚠️ 주의문
- 2 .env 4-서비스 PORT 블록(PLATFORM/ENGAGEMENT/KNOWLEDGE/LEARNING_CARD/LEARNING_AI) + Schema Registry 변수
- 3 Docker Compose 4-서비스 + Schema Registry 전면 재작성
- 모듈별 환경 변수 보존
- 8 변경 이력 v2.0
- 직교 절(§1·§4·§5·§6·§7) 보존

후속: 그룹 3(17_스케줄)은 별도 사이클.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"

git -C 'D:\workspace\final-project-syn\documents.wiki' push
```

기대 출력: `<old-sha>..<new-sha>  master -> master`

---

## Task 16: syn 레포 plan commit + push

- [ ] **Step 1: plan 파일 add + commit + push**

```bash
git -C 'D:\workspace\final-project-syn\syn' add \
  docs/superpowers/plans/2026-05-09-deployment-environment-revamp.md

git -C 'D:\workspace\final-project-syn\syn' commit -m "$(cat <<'EOF'
docs(plan): 14 + 10 v2.0 그룹 2 작성 완료 — 16 task 검증 통과

documents.wiki에 14 v2.0 / 10 v2.0 push 완료. 양 문서 모두 ADR-001/002
채택 반영. 직교 콘텐츠는 보존.

후속: 그룹 3(17_스케줄)은 별도 spec → plan → 구현 사이클.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"

git -C 'D:\workspace\final-project-syn\syn' push
```

- [ ] **Step 2: 사용자에게 결과 보고**

> "그룹 2(14 + 10 v2.0) 작성·검증·push 완료. documents.wiki 1 commit + syn 레포 2 commit (spec + plan). 후속: 그룹 3(17_스케줄)은 별도 사이클."

---

## Self-Review

### 1. Spec 커버리지

| spec 섹션 | plan task |
|---|---|
| spec §3 메타·주의문 (양 문서) | Task 1 (14), Task 10 (10) |
| spec §4 14 §1 ApplicationSet | Task 2 |
| spec §4 14 §2.2 Local 서비스 목록 | Task 3 |
| spec §4 14 §3 yq | Task 4 |
| spec §4 14 §4.3 통합 태그 단락 | Task 5 |
| spec §4 14 §6.1 Health 표 | Task 6 |
| spec §4 14 §7.1 Smoke Test | Task 7 |
| spec §4 14 §10 신규 모듈 추가 + §11 hotfix | Task 8 |
| spec §4 14 §12 변경 이력 | Task 9 |
| spec §5 10 §2 .env | Task 11 |
| spec §5 10 §3 Docker Compose | Task 12 |
| spec §5 10 §8 변경 이력 | Task 13 |
| spec §8 통합 검증 | Task 14 |
| spec §7 결과물 (commit/push) | Task 15, 16 |

✅ 모든 spec 섹션이 task로 커버됨.

### 2. Placeholder 스캔

- 모든 task의 step에 구체 본문/grep 패턴/Edit old_string·new_string 명시
- Read step은 Edit 정확 매칭을 위한 사전 조회 (정상)
- Task 6 / 7 의 조건부 분기(2-A / 2-B)는 v1.0 본문 형태에 따라 분기 — 명시 OK
- Task 8 §10.x FCM/APNs 본문은 "v1.0 §10.4 본문 그대로 보존"이라 명시 — Step 1 Read에서 본문 확보 후 그대로 옮김

### 3. Type 일관성

- 4-서비스명 일관 (synapse-platform-svc / synapse-engagement-svc / synapse-knowledge-svc / synapse-learning-card / synapse-learning-ai)
- 영문 handle 일관 (`@team-lead`, `@platform-owner` 등)
- 환경 변수 일관 (`PLATFORM_SERVICE_PORT` 등)
- 09 cross-reference 절번호 일관 (§0.3 / §B3 / §B4 / §B5 등)

✅ Self-review 통과.

---

## Execution Handoff

**Plan saved to** `D:\workspace\final-project-syn\syn\docs\superpowers\plans\2026-05-09-deployment-environment-revamp.md`

Two execution options:

**1. Subagent-Driven (recommended)** — task 단위 fresh subagent dispatch + main 검증. 16개 task의 누적 컨텍스트 격리. 그룹 1 사이클과 동일 패턴.

**2. Inline Execution** — 본 세션에서 batch 실행. 빠르지만 §3 Docker Compose 큰 본문(~200줄)에서 누적 컨텍스트 증가.

Which approach?
