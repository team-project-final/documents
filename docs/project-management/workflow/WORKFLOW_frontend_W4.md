# WORKFLOW: Frontend 전체 협업 — Week 4

> **Task 문서**: [TASK_frontend.md](../task/TASK_frontend.md)
> **기간**: 2026-06-01 ~ 2026-06-05, 4 영업일
> **PRD**: [PRD_W4.md](../prd/PRD_W4.md)

---

## Step 11: 전체 화면 반응형 검증

### 11.1 E2E 시나리오 정의
- [ ] 반응형 검증 시나리오 작성 (Mobile/Tablet/Desktop)
- [ ] 테스트 데이터 준비

### 11.2 E2E 테스트 실행
- [x] Mobile 뷰포트 전체 화면 검증 — 2026-06-22 knowledge note/search/graph + learning review render tests PASS
- [ ] Tablet 뷰포트 전체 화면 검증
- [x] Desktop 뷰포트 전체 화면 검증 — 2026-06-22 knowledge note/search/graph + learning review render tests PASS
- [ ] 실패 항목 기록

### 11.3 버그 트리아지
- [ ] P0/P1/P2 분류
- [ ] P0 즉시 수정 대상 확정

### 11.4 버그 수정
- [ ] P0 버그 수정
- [ ] 수정 코드 리뷰 + 테스트

### 11.5 회귀 테스트
- [x] 수정 후 전체 테스트 재실행 — `flutter test` PASS (202 tests, 1 skipped)
- [ ] 커버리지 80% 이상 확인

### 11.6 문서 업데이트
- [ ] API 문서 최신화
- [ ] HISTORY 완료 기록

**Step 11 Status**: [ ] Not Started / [x] In Progress / [ ] Done

---

## Step 12: 에러/로딩 상태 일관성 검증

### 12.1 E2E 시나리오 정의
- [ ] 에러/로딩 상태 검증 시나리오 작성 (AppErrorWidget/AppLoadingWidget 전수 확인)
- [ ] 테스트 데이터 준비

### 12.2 E2E 테스트 실행
- [x] AppErrorWidget 일관성 전수 검증 — knowledge note/search/graph + learning review route partial
- [x] AppLoadingWidget 일관성 전수 검증 — knowledge note/search/graph + learning review route partial
- [ ] 실패 항목 기록

### 12.3 버그 트리아지
- [ ] P0/P1/P2 분류
- [ ] P0 즉시 수정 대상 확정

### 12.4 버그 수정
- [ ] P0 버그 수정
- [ ] 수정 코드 리뷰 + 테스트

### 12.5 회귀 테스트
- [x] 수정 후 전체 테스트 재실행 — `flutter analyze`, focused knowledge tests, `flutter test`, `flutter build web --release` PASS
- [ ] 커버리지 80% 이상 확인

### 12.6 문서 업데이트
- [ ] API 문서 최신화
- [ ] HISTORY 완료 기록

**Step 12 Status**: [ ] Not Started / [x] In Progress / [ ] Done

---

## Step 13: DESIGN.md 토큰 일관성 검증

### 13.1 E2E 시나리오 정의
- [ ] DESIGN.md 토큰 일관성 검증 시나리오 작성 (하드코딩 색상/스페이싱 0건 목표)
- [ ] 테스트 데이터 준비

### 13.2 E2E 테스트 실행
- [ ] 하드코딩 색상 전수 검색 + 검증
- [ ] 하드코딩 스페이싱 전수 검색 + 검증
- [ ] 실패 항목 기록

### 13.3 버그 트리아지
- [ ] P0/P1/P2 분류
- [ ] P0 즉시 수정 대상 확정

### 13.4 버그 수정
- [ ] P0 버그 수정 (하드코딩 → 디자인 토큰 교체)
- [ ] 수정 코드 리뷰 + 테스트

### 13.5 회귀 테스트
- [ ] 수정 후 전체 테스트 재실행
- [ ] 커버리지 80% 이상 확인

### 13.6 문서 업데이트
- [ ] API 문서 최신화
- [ ] HISTORY 완료 기록

**Step 13 Status**: [ ] Not Started / [ ] In Progress / [ ] Done
