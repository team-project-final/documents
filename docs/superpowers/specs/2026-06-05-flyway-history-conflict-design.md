# Flyway History 충돌 원인 진단 및 예방 표준 — Design

- 날짜: 2026-06-05
- 상태: 설계 합의 완료 (구현 계획 작성 대기)
- 범위: 진단(A) + 예방 표준(B) + 기존 충돌 해소·롤아웃(C)
- 대상 서비스: synapse-platform-svc, synapse-knowledge-svc, synapse-learning-svc(learning-card), synapse-engagement-svc (각각 독립 git repo)

---

## Section A — 진단: 충돌 발생 원인

### A-1. 직접 충돌 (platform-svc, 재현 확인됨)

platform-svc `src/main/resources/db/migration` 에 **동일 버전 V28이 2개** 존재한다.

| 파일 | git 상태 | 출처 |
|---|---|---|
| `V28__allow_multiple_refresh_tokens.sql` | tracked(커밋됨) | PR #33 (`feat/audit-multi-topic`) |
| `V28__rename_oauth_provider_id_column.sql` | **untracked (`??`)** | 로컬에서 신규 추가 |

**메커니즘**: 개발자가 "다음 버전 번호"를 자신의 로컬/브랜치 시점 기준으로 V28로 선택했으나, 다른 브랜치에서 이미 V28이 머지되어 있었다. 두 파일이 같은 워킹트리에 공존하면 Flyway가 부팅 시
`Found more than one migration with version 28` 으로 실패하고, 한쪽이 먼저 적용된 뒤 다른 쪽이 머지되면 checksum/순서 불일치가 발생한다.

### A-2. 구조적 위험 (engagement-svc)

engagement-svc는 단일 `flyway_schema_history` 에 **5개 location** 을 매핑한다:

```
classpath:db/migration/community/group
classpath:db/migration/community/group/member
classpath:db/migration/community/report
classpath:db/migration/community/share
classpath:db/migration/gamification/xp
```

버전 번호가 폴더를 가로질러 **하나의 전역 시퀀스**(V1 group, V2 share, V3·V4 xp, V5 group, V6 report)를 공유한다.
모듈별 병렬 작업 시 서로 다른 폴더에서 같은 `Vn` 을 집어 들기 매우 쉬워, A-1과 동일한 충돌이 폴더 경계를 넘어 발생할 수 있다.

### A-3. 서비스별 Flyway 정책 불일치 (진단·예방 기준 부재)

| 서비스 | 버전 분포 | locations | baseline-on-migrate | 비고 |
|---|---|---|---|---|
| platform-svc | V1–V3, V16–V32, **V28 x2** | 기본값(미지정) | 미지정 | V4–V15 공백(Flyway 허용, 문제 아님) |
| knowledge-svc | V1–V8 | 단일 | (test에서 flyway off) | 정상 |
| learning-card | V8–V17 | `classpath:db/migration` | **true** | V1–V7 baseline 처리 |
| engagement-svc | V1–V6 | 멀티(5개) | 미지정 | 전역 번호 namespace |

4개 서비스가 각자 git repo라 history 테이블은 독립적이지만, **번호 컨벤션·out-of-order·baseline·location 전략이 제각각** 이라 충돌을 사전에 막거나 진단할 공통 기준이 없다.

### A-4. 근본 원인 한 줄 요약

> "다음 버전 번호를 로컬 시점으로 **수동 선택**" + "병렬 브랜치 / 멀티 location의 **전역 번호 공유**" + "서비스별 Flyway **정책 불일치**" → 머지 시 중복 버전·checksum 불일치.

---

## Section B — 예방 표준 (Prevention Standard)

### B-1. 신규 버전 = 타임스탬프 (cutover 경계)

- **cutover 날짜: 2026-06-05**. 이후 추가되는 **모든 신규 마이그레이션**은 다음 형식을 따른다:

  ```
  V<yyyyMMddHHmmss>__<설명>.sql      예) V20260605103000__rename_oauth_provider_id_column.sql
  ```

- 버전 토큰은 **순수 14자리 숫자**. Flyway 버전 파서는 숫자·`.`·`_`·`-` 만 허용하므로 `T` 등 문자를 넣지 않는다.
- 기존 정수 `Vn` 은 **절대 변경/재번호하지 않는다**(checksum 안정성). 14자리 타임스탬프는 어떤 기존 정수(max 32)보다 수치상 훨씬 크므로 Flyway가 **항상 기존 정수 뒤로 정렬**한다 → 기존 마이그레이션 재배치 불필요.
- 근거: 브랜치 병렬 작업 시 타임스탬프는 사실상 고유하므로 번호 충돌이 **구조적으로** 사라진다.

### B-2. Flyway 설정 표준화 (4개 서비스 통일)

| 설정 | 값 | 이유 |
|---|---|---|
| `spring.flyway.out-of-order` | **true** | 늦게 머지된 더 이른 타임스탬프도 적용. 타임스탬프+병렬 머지의 필수 조건. |
| `spring.flyway.validate-on-migrate` | true(기본 유지) | checksum 드리프트 조기 발견. |
| `spring.flyway.baseline-on-migrate` | 서비스 현실대로 명시 | learning-card는 true 유지, 신규 환경은 V1부터. 암묵값 금지·명시화. |
| `spring.flyway.locations` | 서비스별 현행 유지 | engagement 멀티 location 유지 가능(아래). |

- engagement의 멀티 location 전역 namespace 위험은 **타임스탬프 도입으로 자동 해소**되므로, 별도 `flyway_schema_history` 분리나 번호대 분할은 **하지 않는다(YAGNI)**.

### B-3. CI 검증 — PR에서 차단(fail)

reusable GitHub Actions workflow로 작성하여 각 서비스 PR에서 실행하고, 위반 시 **fail(머지 차단)** 한다.

1. **중복 버전 검사** — 동일 version 토큰이 2개 이상이면 fail. (platform V28 재발 방지 / A-1·A-2 직격)
2. **파일명 규칙 검사** — cutover 이후 추가된 파일은 14자리 타임스탬프 형식 강제.
3. **checksum 안정성 검사** — 이미 머지된(과거) 마이그레이션 **파일 내용 변경** 차단.
4. *(선택)* 임시 DB 대상 `flyway validate` dry-run.

강도 결정: **차단(fail)**. 초기부터 강하게 적용한다(경고-후-차단 단계 도입 안 함).

---

## Section C — 기존 충돌 해소 + 롤아웃

### C-1. platform-svc V28 중복 즉시 해소

- `V28__rename_oauth_provider_id_column.sql` 은 **untracked(미머지)** 이므로 파일명 rename만으로 해소된다.
- 신규 표준 dogfooding → **타임스탬프로 rename**: `V20260605HHmmss__rename_oauth_provider_id_column.sql`.
- **처리 방식(정책 준수)**: platform-svc는 서비스 레포이므로 [repo-edit-scope-policy]에 따라 **직접 수정하지 않고 GitHub 이슈로 등록**하여 해당 레포 담당이 rename 한다. (우선순위 高)

### C-2. 나머지 서비스 — 충돌 없음, 표준만 채택

- knowledge(V1–8), learning(V8–17 baseline), engagement(V1–6)는 **기존 파일 무변경**. cutover 이후 신규만 타임스탬프.
- engagement 전역 namespace 위험은 B-1로 자동 해소. 추가 작업 없음.

### C-3. 롤아웃 매트릭스 (4개 서비스 각자 repo)

| 대상 | 기존 충돌 해소 | 표준 채택(설정+CI caller) | 처리 방식 |
|---|---|---|---|
| **중앙**(gitops/shared 등 직접수정 허용) | — | reusable CI workflow + 표준 문서 **1벌 작성** | 직접 수정 |
| **platform-svc** | ✅ V28 rename | ✅ | GitHub 이슈 (해소+롤아웃, 우선순위 高) |
| **knowledge-svc** | 없음 | ✅ | GitHub 이슈 (롤아웃만) |
| **learning-svc** | 없음 | ✅ | GitHub 이슈 (롤아웃만) |
| **engagement-svc** | 없음 | ✅ | GitHub 이슈 (롤아웃만) |

- CI 검증 스크립트/로직은 **중앙 reusable workflow 1벌**(직접 수정 허용 repo)로 작성. 각 서비스는 caller workflow 한 블록만 추가.
- 각 서비스 레포 변경(① Flyway 설정 표준화 ② caller workflow 추가 + platform은 ③ V28 rename)은 **GitHub 이슈로 등록**한다([repo-edit-scope-policy] 준수).

### C-4. 산출물

1. 본 진단·설계 문서(spec)
2. 예방 표준 문서(레포 README/CONTRIBUTING에 들어갈 컨벤션)
3. 중앙 reusable CI workflow 명세 + 검증 스크립트
4. 서비스별 GitHub 이슈 템플릿/체크리스트 (platform: rename+롤아웃, 그 외 3개: 롤아웃)

---

## 결정 로그

- 버전 컨벤션: **타임스탬프(신규) + CI 검증(방어선)** 조합 채택. 순수 정수+수동 rebase 방식은 기각(병렬 작업 충돌 근절 불가).
- 모듈별 번호대/이력테이블 분리: 기각(타임스탬프로 불필요, YAGNI).
- CI 강도: **차단(fail)** 부터 강하게.
- platform V28 처리: GitHub 이슈로 등록(정책 준수). 직접 rename 안 함.
- 예방 표준은 충돌이 없는 레포 포함 **4개 전부** 적용.

## 참고

- 작업 루트(`C:\workspace\team-project-final`)는 git repo가 아니므로 본 문서 커밋은 별도 docs 관리 위치 정책에 따른다.
- 관련 메모리: repo-edit-scope-policy, git-pr-workflow, deploy-mirror-standardization, verify-merge-state-via-origin.
