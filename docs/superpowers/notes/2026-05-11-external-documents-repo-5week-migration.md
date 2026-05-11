# `documents` 레포 5주 일정 적용 가이드

> **작성일**: 2026-05-11 (v1.0) → 보정 2026-05-11 (v1.1)
> **대상 레포**: `team-project-final/documents` 레포의 `docs/project-management/` 디렉토리
> **본 환경 위치**: `syn/docs/project-management/` (syn 폴더 = `team-project-final/documents.git` 클론)
> **근거 spec**: `syn/docs/superpowers/specs/2026-05-11-schedule-5week-revamp-design.md`

> ⚠️ **v1.1 보정 안내**: v1.0은 documents 레포가 본 작업 환경 "외부"라고 가정했으나,
> 실제 syn 폴더가 documents 레포 자체임이 확인되었다 (origin = team-project-final/documents.git).
> 따라서 본 환경에서 직접 적용 가능하며, 별도 clone 단계는 필요 없다.
> spec §6.2의 "외부 레포 부재" 진술도 같은 의미로 무효 — 실제 SoT는 본 환경의 `syn/docs/project-management/`.

## 1. 적용 순서

본 작업으로 `schedule/src/data/{schedule,tasks}.json`은 이미 5주로 갱신되었다.
이 가이드는 `documents` 레포의 분할 마크다운(SCOPE/TASK/PRD/HISTORY/WORKFLOW)도 같은 5주로 정합화하기 위한 절차다. 적용 후 sync를 돌리면 schedule 앱 데이터가 분할 MD에서 다시 생성되어 본 작업 결과와 일치해야 한다.

```bash
# 1. syn(=documents) 레포의 project-management 디렉토리로 이동
cd "D:/workspace/final-project-syn/syn/docs/project-management"

# 2. PRD 분할/이동
git mv prd/PRD_W4.md prd/PRD_W5.md
# (PRD_W3.md는 본문 수정, 새 PRD_W4.md는 신규 작성 — §2 참조)
# (선택) PRD_PRESENTATION.md 신규 (6/15 발표일)

# 3. TASK 8개 헤더 변환 (W3 분할, W4 → W5)
#    각 TASK_*.md를 열고 spec §4.2 매핑표에 따라 ## W3 섹션을 ## W3 / ## W4로 분리,
#    기존 ## W4 섹션을 ## W5로 헤더 변경.
#    권장 step 추가: TASK_team-lead.md ## W5에 Step 12 (최종 발표 자료 + 시연 리허설),
#    TASK_frontend.md ## W5에 Step 14 (발표용 데모 시나리오 정돈).

# 4. SCOPE 7개 — 일정 언급 부분만 5주로 보정 (대부분 변경 없음)

# 5. HISTORY 8개 — 신규 W5 step 행만 추가 (기존 행 유지)

# 6. WORKFLOW — 주차별 작업 흐름 문서가 있다면 W4 → W5 헤더 변경 + W3 분할 반영

# 7. README.md (project-management) — 주차 수 4→5 등 메타 갱신

# 8. sync 실행 — 외부에서 schedule 레포로 갱신을 흘려보냄
cd "D:/workspace/final-project-syn/schedule"
node scripts/sync-from-md.js \
  --input ../syn/docs/project-management \
  --output src/data

# 9. 결과 비교 — 본 작업 결과와 0 diff면 적용 성공
git diff src/data/

# 10. commit + push
git -C "D:/workspace/final-project-syn/syn" add docs/project-management
git -C "D:/workspace/final-project-syn/syn" commit -m "docs(project-management): 4주 → 5주 일정 적용 (PRD/TASK/HISTORY/SCOPE/WORKFLOW 일괄 갱신)"
git -C "D:/workspace/final-project-syn/syn" push origin main
```

## 2. PRD 분할 diff (핵심)

### 2.1 prd/PRD_W3.md (본문 수정)

```diff
- # PRD: Week 3 — 부가 기능 + Kafka 통합
- 기간 | 2026-05-26 ~ 2026-05-30
+ # PRD: Week 3 — 이벤트 발행자 + 검색 RRF + AI 자동 생성
+ 기간 | 2026-05-26 ~ 2026-05-29 (5/25 부처님오신날 제외)

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

### 2.2 prd/PRD_W4.md (신규 파일)

```markdown
# PRD: Week 4 — 이벤트 소비자 + 운영 기능

| 항목 | 내용 |
|------|------|
| 기간 | 2026-06-01 ~ 2026-06-05 (6/3 지방선거일 제외) |

## 5. 성공 기준

- [ ] notification Kafka 소비 → FCM 푸시 + SES 이메일 발송 동작
- [ ] audit Kafka 소비 → audit_logs 적재 동작 (90일 보존)
- [ ] 관리자 신고 처리 + 모더레이션 API 동작
- [ ] 검색 튜닝 + 하이브리드 E2E 통과
- [ ] AI 카드 자동 생성 E2E 통과
- [ ] ArgoCD dev/staging 환경 자동 배포 검증
```

### 2.3 prd/PRD_W5.md (구 PRD_W4.md 이름 변경 + 갱신)

```diff
- # PRD: Week 4 — 통합 테스트 + 마무리
- 기간 | 2026-06-02 ~ 2026-06-06
+ # PRD: Week 5 — E2E + 버그 + 발표 준비
+ 기간 | 2026-06-08 ~ 2026-06-12
+ 발표 | 2026-06-15(월) — 코드 동결, 발표·시연·제출
```

## 3. TASK 헤더 변환 (모든 TASK_*.md 공통)

각 팀원의 `TASK_<owner>.md`에서:

```diff
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

각 step의 W3 → W4 분배는 spec §4.2 매핑표를 참조. 신규 권장 step (`team-lead-12 최종 발표 자료 준비 + 시연 리허설`, `frontend-14 발표용 데모 시나리오 정돈`)은 본 작업으로 schedule 앱에 추가됨 — 외부 레포의 TASK_team-lead.md / TASK_frontend.md에도 같은 step을 추가하면 sync 결과가 일치함.

## 4. 검증

적용 후 sync를 돌리고 본 환경의 `schedule/src/data/{schedule,tasks}.json`과 diff 0건이면 적용 성공.

```bash
cd <schedule-repo-path>
node scripts/sync-from-md.js --input <documents-repo-path>/docs/project-management --output src/data
git diff src/data/
```

## 5. 롤백

외부 레포에서 `git revert <commit>` 한 줄. sync를 다시 돌리면 schedule app은 이전 4주 상태로 돌아간다. 본 환경 commits (`syn:aa9479f/544c51d, schedule:3ec338b, documents.wiki:f6d0471`)도 각각 `git revert`로 롤백 가능.
