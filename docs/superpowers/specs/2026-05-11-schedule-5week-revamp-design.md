# Schedule 4-week → 5-week Revamp Design

> **작성일**: 2026-05-11
> **이전 버전**: `2026-05-09-schedule-revamp-design.md` (v2.0, 4주 일정)
> **본 문서 버전**: 3.0 (5주 일정)
> **상태**: 사용자 검토 대기

---

## 1. 컨텍스트와 동기

### 1.1 변경 사유

학기 팀 프로젝트의 가용 영업일이 **22일 / 5주차**로 확정되었다. 기존 v2.0 일정(4주, 20 영업일, 5/12~6/6)은 다음 두 문제를 갖고 있었다.

1. **W3 과부하** — 구 W3(5/26~30)에 게이미피케이션 완성 + Kafka 알림 + Audit + 관리자 + 검색 RRF + AI 카드 자동 생성이 모두 몰림. 이벤트 발행자와 소비자가 같은 주에 존재하여 통합 위험을 완충할 게이트가 없었다.
2. **마무리 주 부족** — 구 W4(6/2~6) 5일에 E2E·버그·발표를 모두 압축. 6/3 지방선거 공휴일이 들어오면 4 영업일로 축소되어 더 빡빡해진다.

### 1.2 제약 조건 (확정)

- **기간**: 2026-05-12(화) ~ 2026-06-15(월)
- **공휴일 제외**: 토·일 + 5/25(부처님오신날, 음력 4/8) + 6/3(제9회 전국동시지방선거)
- **총 영업일**: 22일 + 발표일 1일

---

## 2. 결정 사항 (확정)

| ID | 결정 | 사유 |
|----|------|------|
| D-1 | 4주 → **5주차** 구성 | 22 영업일을 5주에 분배 |
| D-2 | W3 분할 (W3a → 신규 W3, W3b → 신규 W4), 기존 W4 → 신규 W5 | 가장 무거운 주차의 위험 해소 + 기존 W1·W2·W4 응집 보존 |
| D-3 | W3·W4 분할 축 = **이벤트 흐름** (Producer → Consumer) | Kafka 통합 위험을 W3 종료 게이트로 차단, W4는 소비자 통합에 집중, W5 E2E가 깨끗하게 진입 |
| D-4 | W5 = E2E·버그·발표 준비 (5일), **6/15(월) = 별도 발표·시연·제출일** | 학기 프로젝트 표준 패턴, 발표 당일에 코드 변경 금지 |
| D-5 | 본 환경 파일은 직접 수정, 외부 `documents` 레포는 가이드만 산출 | 분할 마크다운 SoT가 본 환경 외부에 있음 (사실관계 §6 참조) |
| D-6 | sync-from-md.js의 `weekStarts`/`weekEnds`도 W1~W5로 확장 | 외부 레포가 추후 5주로 갱신되면 sync 결과가 본 JSON과 일관 유지 |

---

## 3. 5주 일정 상세

### 3.1 주차 경계와 영업일

| 주차 | 기간 | 영업일 | 휴일 보정 | 핵심 책임 |
|------|------|-------|-----------|-----------|
| **W1** | 2026-05-12(화) ~ 05-15(금) | 4일 | — | 인프라 + 핵심 CRUD (구 W1 그대로) |
| **W2** | 2026-05-18(월) ~ 05-22(금) | 5일 | — | 핵심 기능 완성 (구 W2 그대로) |
| **W3** | 2026-05-26(화) ~ 05-29(금) | 4일 | 5/25 부처님오신날 | **이벤트 발행자** + 검색 RRF + AI 자동 생성 (구 W3 전반) |
| **W4** | 2026-06-01(월) ~ 06-05(금) | 4일 | 6/3 지방선거일 | **이벤트 소비자** + 운영 기능 (구 W3 후반) |
| **W5** | 2026-06-08(월) ~ 06-12(금) | 5일 | — | E2E + 버그 + 발표 준비 (구 W4) |
| **발표** | 2026-06-15(월) | (1일) | — | 최종 발표·시연·제출일 (코드 동결) |

### 3.2 Gantt (5주)

```
2026
 5월 W2(화~금)   5월 W3          5월 W4*         6월 W1*         6월 W2          6월 W3
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼─────┤
│ ████████      W1: 인프라+핵심CRUD (4일)
│              ██████████████  W2: 핵심 기능 완성 (5일)
│                              ████████        W3: 이벤트 발행자+RRF+AI (4일, 5/25 제외)
│                                              ████████      W4: 이벤트 소비자+운영 (4일, 6/3 제외)
│                                                            ██████████████  W5: E2E+버그+발표 준비 (5일)
│                                                                            ◆ 6/15 발표
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼─────┤
* W4(5/25), W4-신규(6/3)는 단일 공휴일 1일씩 차감.
```

### 3.3 W3·W4 작업 분할 (이벤트 흐름별)

| 트랙 / 담당 | **W3 (5/26~29) — 발행자 + 가시 기능** | **W4 (6/1~5, 6/3 제외) — 소비자 + 운영** |
|---|---|---|
| **팀장** | Kafka 발행 모니터링 + Schema Registry 호환성 검증 | 통합 테스트 조율 + 코드 리뷰 + ArgoCD dev/staging 배포 검증 |
| **`@platform-owner`** | (W2 잔무 마무리) | notification Kafka 소비 (`gamification.*` / `community.*` / `card.review.due`) + FCM 푸시 + SES 이메일 + audit Kafka 소비 + 테넌트/사용자 관리 |
| **`@engagement-owner`** | gamification 완성 (배지·레벨·스트릭·리더보드) + `gamification.level_up` / `badge_earned` Kafka 발행 | community 신고 처리 + Admin 모더레이션 API |
| **`@knowledge-owner-1`** | note 버전 이력 + 태그 관리 고도화 + Graph PageRank (시간 허용 시) | (W3 잔무 + 통합 검증) |
| **`@knowledge-owner-2`** | 검색 RRF (BM25 + 시맨틱) + 정확도 측정 | 검색 튜닝 + P0 버그 수정 + 하이브리드 검색 E2E |
| **`@learning-card-owner`** | `card.review.due` Kafka 발행 + 복습 통계 대시보드 | (W3 잔무 + 복습 전체 E2E) |
| **`@learning-ai-owner`** | AI 카드 자동 생성 안정화 (W2 구현분 보강) + 시맨틱 캐시 (코사인 유사도 > 0.95) | RAG Q&A (시간 허용 시) + AI 카드 자동 생성 E2E + 시맨틱 검색 정확도 검증 |
| **Frontend (전체 협업)** | 게이미피케이션 UI + 검색 결과 RRF UI | 알림 센터 + 관리자 화면 + 공유 덱 탐색·상세 |

### 3.4 W5 + 발표일 책임

| 단계 | 담당 | 작업 |
|------|------|------|
| W5 (6/8~12) | 전체 | E2E 시나리오 통과, 잔여 P0 버그 수정, 성능 검증 (SLA: API P95<200ms, Kafka<5s), Staging 배포, **발표 자료 준비 + 시연 리허설** |
| 발표 (6/15) | 전체 | 최종 발표·시연·제출. **코드 변경 금지** (긴급 P0 패치만 허용, 별도 hotfix 브랜치) |

### 3.5 W3·W4 게이트 (통합 위험 차단)

- **W3 종료 시점 (5/29)**: 모든 producer 토픽이 Schema Registry에 BACKWARD 호환으로 등록되고, 발행이 동작한다.
  - `gamification.level_up`, `gamification.badge_earned`, `card.review.due`, `note.created` (AI 자동 생성용) 등
- **W4 종료 시점 (6/5)**: 모든 producer ↔ consumer 경로가 동작한다.
  - notification (FCM 푸시 + SES 이메일) 발송, audit_logs 적재, RRF·AI E2E 통과
- **W5 종료 시점 (6/12)**: 전체 시스템 E2E 시나리오 통과, Staging 배포, 발표 자료 완성.

---

## 4. tasks.json 재계산 (60+ task)

### 4.1 주차 매핑 규칙

| 기존 주차 | 신규 주차 | 규칙 |
|---|---|---|
| W1 | W1 | 동일 유지 (단 영업일 4일로 cursor 한계 도달 시 다음 task는 다음 영업일 이월) |
| W2 | W2 | 시작일 5/19 → 5/18(월), 종료 5/22 |
| W3 | W3 (발행자 분류) 또는 W4 (소비자 분류) | §4.2 매핑표 적용 |
| W4 | W5 | 통째로 1주 시프트 |

### 4.2 기존 W3 task 22개의 W3·W4 분배 (확정)

| 기존 task ID | 작업명 | 분류 | 신규 주차 |
|---|---|---|---|
| engagement-6 | 레벨/배지/스트릭/리더보드 시스템 | 가시 기능 | **W3** |
| engagement-7 | 게이미피케이션 Kafka 이벤트 발행 | 발행자 | **W3** |
| engagement-8 | 부적절 콘텐츠 신고 및 관리자 처리 | 운영 | **W4** |
| frontend-7 | 게이미피케이션 UI | 발행자 짝 UI | **W3** |
| frontend-8 | 알림 센터 | 소비자 짝 UI | **W4** |
| frontend-9 | 관리자 신고 처리 화면 | 운영 UI | **W4** |
| knowledge-1-6 | 노트 수정 이력 및 버전 복원 | 가시 기능 | **W3** |
| knowledge-1-7 | 태그 필터링 및 자동완성 | 가시 기능 | **W3** |
| knowledge-2-7 | 검색 정확도 측정 및 리포트 | 검증 | **W3** |
| knowledge-2-8 | 하이브리드 검색 E2E 테스트 | E2E | **W4** |
| knowledge-2-9 | 검색 튜닝 및 P0 버그 수정 | 튜닝 | **W4** |
| learning-ai-7 | RAG 기반 질문 답변 (P2) | 시간 허용 시 | **W4** |
| learning-ai-8 | AI 카드 자동 생성 E2E 테스트 | E2E | **W4** |
| learning-ai-9 | 시맨틱 검색 정확도 검증 및 P0 버그 수정 | 검증 | **W4** |
| learning-card-7 | 복습 리마인더 Kafka 이벤트 발행 | 발행자 | **W3** |
| learning-card-8 | 복습 통계 대시보드 | 가시 기능 | **W3** |
| learning-card-9 | 복습 전체 E2E 테스트 | E2E | **W4** |
| platform-6 | Kafka 이벤트 기반 Audit Log 자동 기록 | 소비자 | **W4** |
| platform-7 | FCM 푸시 및 SES 이메일 알림 발송 | 소비자 | **W4** |
| platform-8 | 관리자 테넌트/사용자 관리 | 운영 | **W4** |
| team-lead-7 | 전체 서비스 간 Kafka 이벤트 E2E 검증 및 코드 리뷰 조율 | 통합 조율 | **W4** |
| team-lead-8 | ArgoCD dev/staging 환경 배포 검증 | 운영 | **W4** |

→ **신규 W3에 8개, 신규 W4에 14개**. 영업일 4·4일에 W4가 다소 무거운 분포. 단 W4의 E2E·검증·운영 task(team-lead-7·8, knowledge-2-8·9, learning-ai-8·9, learning-card-9, platform-6·7·8)는 대부분 0.5~1일 단위 짧은 작업이라 4 영업일 안에 흡수 가능. 만약 실작업 중 W4 부담이 큰 것으로 드러나면 learning-ai-7(RAG, P2)을 W5 또는 차기로 이월.

### 4.3 신규 권장 task (선택 채택)

| 신규 ID | 작업명 | 주차 | duration | 사유 |
|---|---|---|---|---|
| **team-lead-12** | 최종 발표 자료 준비 + 시연 리허설 | W5 | 1일 | 발표일 6/15 안전 진입 |
| **frontend-14** | 발표용 데모 시나리오 정돈 | W5 | 0.5일 | 시연 흐름 안정화 |

### 4.4 plannedStart/plannedEnd 재계산 알고리즘

`schedule/scripts/sync-from-md.js`의 cursor 로직과 동일:

1. 각 (memberId, week) 그룹마다 `stepNumber` 오름차순 정렬.
2. cursor = 해당 주차 시작일 → 영업일이 아니면 다음 영업일로 이동 (`HOLIDAYS = {'2026-05-25', '2026-06-03'}`).
3. `task.plannedStart = cursor`
4. `task.plannedEnd = cursor + ⌈durationDays⌉ - 1 영업일`
5. 다음 task의 cursor = 직전 `plannedEnd + 1 영업일` (주차 경계를 넘으면 자연스럽게 다음 주로 흐름 — 현행 동작과 동일).

### 4.5 기존 데이터 정합성 보정

기존 v2.0 `tasks.json`에는 영업일 카운팅이 부정확해 `plannedEnd`가 주말 또는 공휴일에 떨어진 항목이 일부 존재한다(예: `engagement-3` plannedEnd `2026-05-18`이 차기 주차 시작일과 같음). 이런 경계 부정확도 §4.4 알고리즘 일괄 적용으로 함께 정합화된다. 본 변경의 부수 효과로 별도 PR 없이 같은 커밋에서 처리.

---

## 5. 영향 받는 파일

### 5.1 카테고리 1 — 본 환경에서 직접 수정

| # | 파일 | 변경 내용 |
|---|------|-----------|
| 1 | `documents.wiki/17_스케줄.md` | **v3.0 전면 개편** — 4주→5주, ② 이벤트 흐름 분할 매핑, W5/발표일 추가, §1 Gantt 5주, §2 W1~W5 마일스톤, §3 팀 분업 표 W1~W5+발표 컬럼, 변경 이력 v3.0 추가 |
| 2 | `documents.wiki/01_프로젝트_계획서.md` | §1.4 "MVP Phase 1 (4주)" → "(5주)", §1.8 일정 계획표 첫 행 "Phase 1: MVP \| 4주 (팀 프로젝트) \| ..." → "5주 (팀 프로젝트, 5/12~6/15)", §변경 이력 v1.2 추가 |
| 3 | `documents.wiki/09a_Git_워크플로우_가이드.md` | 헤더 "프로젝트 기간: 4주" → "5주", §1.1·§3.6 본문의 "4주 프로젝트" 표현(약 4곳), §3.6 주차별 통합 릴리즈 표 4행→5행+발표 행 추가, 변경 이력 v1.2 추가 |
| 4 | `documents.wiki/18_기술_스택_정의서.md` | "7명 팀에서 4주 내 30+ 화면" → "5주 내 30+ 화면" (1줄) |
| 5 | `schedule/src/data/schedule.json` | `weeks` 배열 4개→5개, 각 주차 name·startDate·endDate·goals·successCriteria를 §3 표 기준으로 재작성. 5번째 주차 추가 (W5: E2E + 버그 + 발표 준비). **6/15 발표일은 weeks와 동일 레벨에 신규 `presentation` 객체로 추가** (`{date: "2026-06-15", title: "최종 발표·시연·제출", goals: [...], frozen: true}`) — weeks 배열은 5개 유지하여 데이터 모델 단순성 보존 |
| 6 | `schedule/src/data/tasks.json` | 모든 task의 `week` 재분류 (§4.2 표) + `plannedStart`/`plannedEnd` 재계산 (§4.4) + 권장 신규 task 2개 추가 (§4.3) |
| 7 | `schedule/scripts/sync-from-md.js` | `weekStarts`/`weekEnds` 객체를 W1~W5 5개로 확장. `parseTasks()` 폴백 분기(stepNumber 9 초과 → W4) 도 stepNumber 12 초과 → W5로 보정. 코멘트 헤더에 "5주 일정 (2026-05-12 ~ 06-15)" 명시 |

### 5.2 카테고리 2 — 작성 중 grep 보정

작성 직전 다음 패턴을 wiki 전반에 재검색하여 누락 보정:
- `4주 \| W1~W4 \| W4 \| 2026-06-06 \| 2026-06-08`
- 매칭이 일정 의미인 경우만 갱신, SRS 알고리즘 설명("2~4주 후 복습")이나 다른 phase 정의는 보존.
- 우선 점검 대상: `documents.wiki/Home.md`, `documents.wiki/08_스토리_보드.md`, `documents.wiki/03_프로젝트_아키텍처_정의서.md`, `documents.wiki/06_화면_기능_정의서.md`

### 5.3 카테고리 3 — 변경 안 함 (의미 무관 / 역사 보존)

| 파일 | 사유 |
|------|------|
| `documents.wiki/13_테스트_보고서.md` | "2026-05-12 (영업일 3일)" — W1 시작점 동일, 무관 |
| `documents.wiki/15_사용자_메뉴얼.md` | "2~4주 후 복습" — SRS 알고리즘 설명, 무관 |
| `syn/docs/01_project_overview.md` | Phase 1 (8주) — 12개월 로드맵의 별도 phase 정의, 무관 |
| `syn/docs/superpowers/specs/2026-05-09-schedule-revamp-design.md` | 이전 v2.0 스펙 — 역사 보존 |
| `syn/docs/superpowers/plans/2026-05-09-schedule-revamp.md` | 이전 plan — 역사 보존 |

### 5.4 카테고리 4 — 외부 `documents` 레포 (가이드만 산출)

| 경로 | 변경 내용 |
|------|-----------|
| `documents/docs/project-management/prd/PRD_W4.md` | 파일명 `PRD_W5.md`로 이동, 본문의 "Week 4" → "Week 5", 기간 `2026-06-08 ~ 2026-06-12`로 갱신 |
| `documents/docs/project-management/prd/PRD_W3.md` | 본문 분할: 새 W3(발행자+RRF+AI 자동생성)만 남기고 소비자/운영 부분 제거. 기간 `2026-05-26 ~ 2026-05-29` |
| `documents/docs/project-management/prd/PRD_W4.md` (신규) | 기존 PRD_W3에서 분리한 소비자/운영 부분을 새 W4로 작성. 기간 `2026-06-01 ~ 2026-06-05` |
| `documents/docs/project-management/prd/PRD_PRESENTATION.md` (신규, 권장) | 6/15 발표일 책임/체크리스트 (선택) |
| `documents/docs/project-management/task/TASK_*.md` (7개) | 각 팀원의 `## W3` 섹션을 §4.2 매핑에 따라 W3·W4로 분할. `## W4` 섹션을 `## W5`로 헤더 변경 |
| `documents/docs/project-management/scope/SCOPE_*.md` (7개) | 일정 언급 부분만 5주로 보정 (대부분 WHO/WHAT 기준이므로 변경 적음) |
| `documents/docs/project-management/history/HISTORY_*.md` (7개) | 신규 W5 step 행 추가만 (기존 행은 유지) |

**적용 절차** (사용자가 외부 환경에서 실행):
```
1. 본 spec의 §4.2 매핑표를 옆에 띄움
2. 각 TASK_*.md를 열고 ## W3 섹션 내 step을 매핑표에 따라 ## W3 / ## W4로 분리
3. ## W4 섹션을 ## W5로 헤더 변경 (내용 그대로)
4. PRD_W3.md / PRD_W4.md 분할 (또는 신규 작성)
5. PRD_W4.md → PRD_W5.md 파일명 변경
6. (선택) PRD_PRESENTATION.md 신규 작성
7. cd schedule && node scripts/sync-from-md.js --input ../../documents/docs/project-management --output src/data
8. 결과 JSON 비교 — 본 spec 작업으로 직접 수정한 schedule.json/tasks.json과 일치해야 함
```

---

## 6. SoT 처리 방침

### 6.1 사실관계

`schedule/scripts/sync-from-md.js` (398 라인) 분석 결과:
- 입력: `--input <project-management-dir>` (CLI 인자)
- 입력 디렉토리는 `scope/`, `task/`, `prd/`, `history/` 4개 하위로 구성된 외부 `documents` 레포
- 출력: `src/data/{members,tasks,schedule}.json`
- 휴일은 코드에 하드코딩: `HOLIDAYS = new Set(['2026-05-25', '2026-06-03'])` — **이미 본 변경에 부합**
- 주차 시작/종료는 `weekStarts = {W1: '2026-05-12', W2: '2026-05-19', W3: '2026-05-26', W4: '2026-06-02'}` — **본 변경에서 W1~W5로 확장 필요**

### 6.2 본 환경 위치 확인

`D:/workspace/` 및 `D:/workspace/final-project-syn/` 양쪽에 `documents/docs/project-management/` 디렉토리 부재. `SCOPE_*.md`/`TASK_*.md`/`PRD_W*.md` 파일도 전 작업 디렉토리에 0건.

→ **외부 레포는 본 작업 환경 외부에 존재**. 본 spec은 외부 레포를 직접 수정하지 않으며, §5.4의 절차 가이드로 사용자가 별도 환경에서 적용한다.

### 6.3 일관성 보장 메커니즘

| 단계 | 시점 | 일관성 상태 |
|------|------|-------------|
| 본 작업 직후 | T+0 | schedule.json/tasks.json/sync-from-md.js: 5주 / 외부 분할 MD: 4주 → **불일치** |
| 사용자가 외부 레포 5주 적용 | T+α | 외부 분할 MD: 5주 → **일치 가능 상태** |
| 사용자가 sync 실행 | T+β | sync 결과 = 본 작업 결과와 동일 → **검증 가능** |

본 spec의 §7 구현 계획은 sync 코드의 `weekStarts`/`weekEnds`를 W1~W5로 확장하므로, T+β 시점에 sync 결과가 본 작업 결과와 동일해진다(검증 항목 §8.1 참조).

---

## 7. 구현 계획 (개략)

세부 task 분할은 후속 `writing-plans` 단계에서 작성. 본 spec에서는 의존 순서만 명시.

```
[1] 백업 확인        → 모든 대상 파일이 git 추적 중인지 확인 (또는 변경 직전 commit)
[2] 위키 본문 갱신    → 17_스케줄.md (v3.0), 01_프로젝트_계획서.md, 09a_Git_워크플로우_가이드.md, 18_기술_스택_정의서.md (병렬 가능)
[3] 추가 grep 보정    → §5.2 카테고리 2 패턴 재검색, 누락 부분 보정
[4] sync 코드 확장    → sync-from-md.js의 weekStarts/weekEnds W1~W5 확장
[5] schedule.json 재작성 → 5 weeks + 권장 6번째 항목(발표일)
[6] tasks.json 재계산 → §4.2 매핑 + §4.4 알고리즘 + §4.3 권장 task 2개
[7] 검증 실행        → §8 항목 전체
[8] 외부 레포 가이드 산출 → §5.4 적용 절차를 별도 README 또는 spec 부록으로
[9] 커밋             → documents.wiki + schedule 두 레포에 각각 단일 commit
```

의존: [1] → [2,3,4,5,6 병렬] → [7] → [8] → [9].

---

## 8. 검증

### 8.1 자동 검증

| # | 항목 | 방법 |
|---|------|------|
| V-1 | schedule app 빌드 성공 | `cd schedule && npm run build` |
| V-2 | schedule app dev 실행 시 W1~W5 + 발표일 표시 | `npm run dev` → 브라우저 확인 |
| V-3 | tasks.json의 모든 plannedStart/plannedEnd가 영업일 | Node 검증 스크립트: 모든 task에 대해 `getDay() ∉ {0,6}` and 날짜 ∉ HOLIDAYS |
| V-4 | tasks.json의 모든 날짜가 주차 범위 내 | week 컬럼과 plannedStart/plannedEnd가 같은 주차 시작·종료 사이 |
| V-5 | 위키 grep 결과 0건 | `rg "4주 프로젝트\|4주 단기" documents.wiki/{17_스케줄,01_프로젝트_계획서,09a_Git_워크플로우_가이드,18_기술_스택_정의서}.md` |
| V-6 | sync 코드 일관성 (선택, 외부 레포 5주 적용 후) | sync 결과 JSON과 본 작업 결과 JSON의 diff 0건 |

### 8.2 수동 검증

| # | 항목 | 방법 |
|---|------|------|
| V-7 | 주차별 task 수 균형 | 기존 W3 22개 → 신규 W3 8개 + W4 14개. 기존 W4 → W5로 통째 시프트. 권장 task 2개(team-lead-12, frontend-14) 채택 시 W5 +2. 전체 합계는 변경 전후 일치(권장 채택 시 +2) |
| V-8 | 트랙별 워크로드 가시화 | schedule app의 GanttChart에서 각 owner의 W1~W5 막대 폭 확인 |
| V-9 | 이벤트 흐름 게이트 충족 | W3 task에 모든 producer가 포함, W4 task에 모든 consumer가 포함 |
| V-10 | 변경 이력 일관성 | 갱신된 4개 위키 문서 모두에 동일 사유의 v3.0/v1.2 행이 추가됨 |

---

## 9. 롤백

| 단계 | 작업 |
|------|------|
| R-1 | 본 환경 commit ID 기록 (변경 직전과 직후) |
| R-2 | 문제 발생 시: `git revert <변경 직후 commit>` (documents.wiki 레포 1회, syn 레포 1회, schedule 레포 1회) |
| R-3 | 외부 documents 레포는 사용자 환경에서 별도 git revert (가이드에 명시) |
| R-4 | sync 결과와 본 작업 결과 사이 잠시 발생할 수 있는 불일치는 R-2 직후 자연 해소 |

---

## 10. 변경 이력 양식 (적용용)

### 10.1 `documents.wiki/17_스케줄.md` v3.0

```markdown
| v3.0 | 2026-05-11 | 4주 → 5주 일정 전면 개편 (5/12~6/15, 22 영업일).
공휴일 5/25(부처님오신날) · 6/3(제9회 전국동시지방선거) 제외 반영.
구 W3 (gamification·notification·audit 합본) → 이벤트 흐름 ②축으로
W3(발행자) · W4(소비자)로 분할. 구 W4(통합 테스트/마무리) → W5로 시프트.
6/15(월) 최종 발표·시연·제출일 별도 명시. §1 Gantt 5주로 재작성,
§2 W1~W5 마일스톤, §3 팀 분업 표 W1~W5+발표 컬럼으로 확장.
설계 근거: syn/docs/superpowers/specs/2026-05-11-schedule-5week-revamp-design.md |
```

### 10.2 다른 문서 변경 이력

01·09a·18은 각 위키 문서 하단의 변경 이력 표에 동일 사유의 한 줄을 추가하되, 각 문서의 책임 범위 표현을 그대로 사용한다 (예: 01은 "Phase 1 MVP 기간 4주→5주", 09a는 "주차별 통합 릴리즈 4회→5회+발표"). `schedule/scripts/sync-from-md.js`는 변경 이력 표가 없으므로 파일 헤더 JSDoc 주석에 "5주 일정 (2026-05-12 ~ 06-15) 반영, 2026-05-11" 한 줄을 추가한다.

---

## 11. 부록 A — 이전 4주 일정 (역사 보존)

이전 v2.0 일정은 `syn/docs/superpowers/specs/2026-05-09-schedule-revamp-design.md` 및 `documents.wiki/17_스케줄.md`의 v1.0~v2.0 변경 이력에서 참조 가능. 본 spec은 v2.0을 폐기하지 않고 새 v3.0으로 대체한다.

## 12. 부록 B — 외부 `documents` 레포 적용 diff 가이드

다음은 사용자가 외부 `documents` 레포에서 실행할 변경의 핵심 diff 형태(요약).

```diff
# documents/docs/project-management/prd/PRD_W3.md (분할 후)
- # PRD: Week 3 — 부가 기능 + Kafka 통합
- 기간 | 2026-05-26 ~ 2026-05-30
+ # PRD: Week 3 — 이벤트 발행자 + 검색 RRF + AI 자동 생성
+ 기간 | 2026-05-26 ~ 2026-05-29 (5/25 부처님오신날 제외)
  ...
- ## 5. 성공 기준
- - [ ] 복습 완료 → XP 적립 → 레벨업 → 축하 + 알림 전체 흐름 동작
- - [ ] 덱 공유 → 그룹원 알림 동작
+ ## 5. 성공 기준
+ - [ ] 모든 producer 토픽이 Schema Registry에 BACKWARD 호환으로 등록
+ - [ ] gamification.level_up / badge_earned / card.review.due / note.created 발행 동작
+ - [ ] gamification 완성 (배지·레벨·스트릭·리더보드)
+ - [ ] 검색 RRF (BM25 + 시맨틱) 동작 + 정확도 측정 리포트
+ - [ ] AI 카드 자동 생성 (note.created → LLM → Card) 동작
```

```diff
# documents/docs/project-management/prd/PRD_W4.md (신규)
+ # PRD: Week 4 — 이벤트 소비자 + 운영 기능
+ 기간 | 2026-06-01 ~ 2026-06-05 (6/3 지방선거일 제외)
+ ## 5. 성공 기준
+ - [ ] notification Kafka 소비 → FCM 푸시 + SES 이메일 발송 동작
+ - [ ] audit Kafka 소비 → audit_logs 적재 동작 (90일 보존)
+ - [ ] 관리자 신고 처리 + 모더레이션 API 동작
+ - [ ] 검색 튜닝 + 하이브리드 E2E 통과
+ - [ ] AI 카드 자동 생성 E2E 통과
+ - [ ] ArgoCD dev/staging 환경 자동 배포 검증
```

```diff
# documents/docs/project-management/prd/PRD_W5.md (구 PRD_W4 이름 변경 + 갱신)
- # PRD: Week 4 — 통합 테스트 + 마무리
- 기간 | 2026-06-02 ~ 2026-06-06
+ # PRD: Week 5 — E2E + 버그 + 발표 준비
+ 기간 | 2026-06-08 ~ 2026-06-12
+ 발표 | 2026-06-15(월) — 코드 동결, 발표·시연·제출
```

```diff
# documents/docs/project-management/task/TASK_<owner>.md (7개 모두)
- ## W3
- ### Step N: 게이미피케이션 ...
- ### Step N+1: 알림 ...
+ ## W3
+ ### Step N: 게이미피케이션 ... (발행자)
+ ## W4
+ ### Step N+1: 알림 ... (소비자)
- ## W4
+ ## W5
  (기존 W4 내용 그대로)
```

---

**문서 종료**
