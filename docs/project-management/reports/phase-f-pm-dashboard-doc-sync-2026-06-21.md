# Phase F PM Dashboard / 문서 동기화 실행 리포트

> 작성: 2026-06-21 KST
> 기준 계획: `documents/docs/project-management/FINAL_REFACTOR_COMPLETION_PLAN.md` Lane F
> 사용자 요청: "문서에 따른 A~E까지의 완료된 작업을 모두 재검토 하고 F 진행"
> 원칙: 증거 없는 dashboard JSON 수동 수정, PRD/TASK/WORKFLOW 완료 체크, live sync 실행을 하지 않는다.

## 1. 결론

Phase F는 진행했지만, dashboard live sync는 보류한다.

이유는 A~E 재검토 결과 모든 phase가 완전 완료 상태가 아니며, `workflow-dashboard` dry-run에서 일부 레포의 PM 문서와 현재 JSON 사이에 count drift가 확인되었기 때문이다. 현재 안전한 F 결과는 "기준점 고정 + drift 기록 + 다음 live sync gate 정의"다.

## 2. A~E 재검토 결과

| Phase | 재검토 판단 | 증거 | 남은 조건 |
|---|---|---|---|
| A. 프론트 디자인 시스템 정렬 | 부분 완료, 주요 drift 해결 증거 있음 | `AppColors`가 Warm Amber/Stone으로 정렬됨, `AppRadius`가 4/8/12/16 계열로 정렬됨, `AppLoadingWidget`/`AppErrorWidget`/`AppEmptyState`/`ResponsivePageFrame` 존재, 음수 `letterSpacing` 0건 | `SynapseOrb`/orb 흔적 43건, dashboard의 DESIGN token/responsive 검증 미완료, 실제 화면 QA 증거 필요 |
| B. 프론트 API 연동 및 상태 리팩토링 | 미완료 | frontend README가 mock/auth bypass를 명시, `TODO`/mock/auth-bypass 신호 275건, dashboard 168/481로 313건 잔여 | production route API-backed 증거, auth bypass 제거, `flutter analyze/test/build web` 로그 |
| C. 백엔드 검증 잔여 작업 | 부분 완료 | platform/knowledge/learning/engagement 서비스는 대부분 97~99%대, Phase E evidence map 존재 | platform 11, knowledge 10, learning 2, engagement 4 dashboard check 잔여 |
| D. GitOps 및 릴리즈 하드닝 | 부분 완료 | Phase E report에 staging/ArgoCD/SLA 일부 증거 존재, `validate:data` 통과 | gitops cost/stability 7 check 잔여, metrics gap/24h signoff/destroy decision 증거 필요 |
| E. 통합 QA 및 문서 마감 | 부분 완료 | Phase E 리포트 작성, 중앙/서비스 PM README에 Phase E 기준 링크 동기화 | full staging demo, frontend QA, search/AI card blocker, dashboard 100% 또는 owner/date/blocker 세분화 필요 |

## 3. Dashboard 현재 JSON 기준

| Repo | Current JSON done / total | Remaining | 판단 |
|---|---:|---:|---|
| `synapse-frontend` | 168 / 481 | 313 | F 최대 blocker |
| `synapse-platform-svc` | 366 / 377 | 11 | backend tail |
| `synapse-knowledge-svc` | 611 / 621 | 10 | ES/search/E2E tail |
| `synapse-learning-svc` | 693 / 695 | 2 | event proof tail |
| `synapse-engagement-svc` | 415 / 419 | 4 | Kafka/live/ECR proof tail |
| `synapse-shared` | 281 / 291 | 10 | E2E/SLA/staging closeout tail |
| `synapse-gitops` | 204 / 211 | 7 | cost/stability tail |

## 4. Phase F 검증 명령 결과

`npm`이 PATH에 없어 Codex bundled Node를 직접 사용했다.

### Data validation

Command:

```powershell
node scripts/validate-data.mjs
```

Result:

```text
Data validation passed with 0 warning(s).
```

판단: 현재 `workflow-dashboard/data/*.json` 계약 자체는 유효하다.

### Global sync dry-run without DOCS_DIR

Command:

```powershell
node scripts/sync.mjs --dry-run
```

Result:

```text
0 synced, 7 skipped, 0 errors
```

판단: `github-markdown` parser는 local docs directory가 필요하므로, CI 또는 수동 실행에서 `DOCS_DIR`를 반드시 지정해야 한다.

### Repo-by-repo DOCS_DIR dry-run

각 레포의 `docs/project-management`를 `DOCS_DIR`로 지정하고 repo별 dry-run을 실행했다.

| Repo | Dry-run would write | Current JSON | 판단 |
|---|---:|---:|---|
| `synapse-frontend` | 163 / 475 | 168 / 481 | drift 있음. live sync 금지. workflow 문서와 JSON count 기준 재확인 필요 |
| `synapse-platform-svc` | 366 / 377 | 366 / 377 | 일치 |
| `synapse-knowledge-svc` | 611 / 621 | 611 / 621 | 일치 |
| `synapse-learning-svc` | 693 / 695 | 693 / 695 | 일치 |
| `synapse-engagement-svc` | 415 / 419 | 415 / 419 | 일치 |
| `synapse-shared` | 281 / 281 | 281 / 291 | drift 있음. 문서에는 10개 check가 사라진 상태로 보임 |
| `synapse-gitops` | 205 / 211 | 204 / 211 | drift 있음. 문서가 dashboard보다 1개 앞서 있음 |

## 5. F에서 수행한 동기화 작업

완료:

- A~E 재검토 결과를 이 Phase F 리포트에 고정했다.
- `workflow-dashboard` 현재 JSON 요약과 repo별 `DOCS_DIR` dry-run 결과를 기록했다.
- 중앙 PM README에 Phase F 기준점을 추가했다.
- `FINAL_REFACTOR_COMPLETION_PLAN.md`에 Phase F 진행 기록을 추가했다.
- team-lead history에 Phase F 작업 로그를 추가했다.
- 각 서비스 local PM README에 Phase F sync 기준과 live sync 보류 조건을 추가했다.

의도적으로 하지 않은 일:

- `workflow-dashboard/data/*.json` 수동 수정 없음.
- `scripts/sync.mjs` live mode 실행 없음.
- PRD/TASK/WORKFLOW checkbox 완료 처리 없음.
- frontend/shared/gitops count drift를 무시한 강제 완료 없음.

## 6. 다음 F gate

다음 조건을 만족할 때만 dashboard live sync를 실행한다.

1. `synapse-frontend` dry-run count가 현재 JSON과 왜 다른지 확인한다.
   - 현재: dry-run 163/475, JSON 168/481.
   - 의심: workflow 문서에서 check 제거 또는 parser가 읽지 못하는 구조 변경.

2. `synapse-shared` dry-run count가 현재 JSON과 왜 다른지 확인한다.
   - 현재: dry-run 281/281, JSON 281/291.
   - 의심: shared PM 문서에서 W4/W5 잔여 check가 삭제되었거나 parser 대상 파일이 바뀜.

3. `synapse-gitops` dry-run 1개 증가가 실제 증거 기반인지 확인한다.
   - 현재: dry-run 205/211, JSON 204/211.
   - 증거가 있으면 live sync 후보, 없으면 workflow checkbox 원복/보류.

4. 아래 순서로만 live sync를 수행한다.

```powershell
node scripts/sync.mjs <repo> --dry-run
node scripts/validate-data.mjs
node scripts/sync.mjs <repo>
node scripts/validate-data.mjs
```

5. live sync 후에는 `updatedAt`, `history`, `changelog`가 의도한 대로만 변했는지 diff를 확인한다.

## 7. 현재 최종 판단

F는 "진행 완료"지만 "dashboard live sync 완료"는 아니다.

현재의 올바른 상태는 다음과 같다.

- A: 부분 완료, 디자인 토큰 drift는 크게 해결됐으나 화면 QA 미완료.
- B: 미완료, frontend API-backed 전환이 가장 큰 잔여 작업.
- C: 부분 완료, backend tail은 각 서비스별 증거 수집 필요.
- D: 부분 완료, GitOps cost/stability/운영 signoff 필요.
- E: 부분 완료, Phase E 리포트와 README sync는 됐지만 full demo gate는 남음.
- F: 기준점 기록, dry-run 검증, drift 식별, live sync 보류 결정 완료.
