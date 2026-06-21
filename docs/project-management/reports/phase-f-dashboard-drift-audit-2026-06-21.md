# Phase F Dashboard / PM 문서 Count Drift 원인 감사

> 작성: 2026-06-21 KST
> 기준 리포트: [Phase F PM Dashboard / 문서 동기화 실행 리포트](./phase-f-pm-dashboard-doc-sync-2026-06-21.md)
> 대상: `synapse-frontend`, `synapse-shared`, `synapse-gitops`
> 원칙: dashboard JSON 수동 수정, live sync, 증거 없는 checkbox 완료 처리는 하지 않는다.

## 1. 결론

`workflow-dashboard` live sync는 아직 실행하면 안 된다.

세 레포의 drift 원인은 서로 다르다.

| Repo | Current JSON | Parser raw | Done-guard dry-run | 핵심 원인 | 조치 판단 |
|---|---:|---:|---:|---|---|
| `synapse-frontend` | 168 / 481 | 93 / 475 | 163 / 475 | PM workflow 문서가 dashboard JSON보다 뒤처져 있고 W5 step 1개가 문서에서 사라짐 | workflow 문서 복구/정정 전 live sync 금지 |
| `synapse-shared` | 281 / 291 | 281 / 281 | 281 / 281 | `[~]` partial checkbox를 parser가 count하지 않아 total 10개가 사라짐 | partial 처리 정책 결정 전 live sync 금지 |
| `synapse-gitops` | 204 / 211, track `team-lead` | 205 / 211, track `gitops` | 205 / 211, track `gitops` | workflow 파일명 track은 `gitops`, config/dashboard canonical track은 `team-lead` | track canonical 정렬 전 live sync 금지 |

현재 dashboard JSON 계약은 `node scripts/validate-data.mjs` 기준 0 warning으로 유효하다. 문제는 JSON 자체가 아니라 parser 입력 문서와 dashboard 데이터 모델 사이의 불일치다.

## 2. 검토 기준

확인한 dashboard 코드 조건:

- `github-markdown` parser는 `WORKFLOW_<track>_<week>.md` 파일명에서 track을 추출한다.
- checkbox parser는 `- [ ]`와 `- [x]`만 count한다. `[~]` partial checkbox는 total에도 done에도 포함되지 않는다.
- `done-guard`는 track name, week, step name이 모두 같은 경우에만 기존의 더 높은 done count를 보존한다.
- `workflow-dashboard/data/config.json`은 `synapse-gitops`, `synapse-shared` 모두 canonical track을 `team-lead`로 기대한다.
- virtual track `team-lead`도 `synapse-gitops/team-lead`, `synapse-shared/team-lead`를 source로 사용한다.

## 3. `synapse-frontend` drift

요약:

- Current JSON: 168 / 481
- Parser raw: 93 / 475
- Done-guard dry-run: 163 / 475
- Live sync 시 done 5개와 total 6개가 감소한다.

확인된 차이:

| 위치 | Current JSON | Parser raw | Done-guard | 판단 |
|---|---:|---:|---:|---|
| W1 `로그인/회원가입 화면 및 OAuth 인증` | 37 / 43 | 31 / 43 | 37 / 43 | 문서 done count가 뒤처져 있으나 guard가 보존 |
| W2 `SRS 복습 화면 - 카드 제시 -> 뒤집기 -> 난이도 선택 -> 다음 카드` | 30 / 43 | 9 / 43 | 30 / 43 | 문서 done count가 크게 뒤처져 있으나 guard가 보존 |
| W3 `알림 센터 - 알림 목록 + 읽음/안읽음 + 설정` | 38 / 44 | 0 / 44 | 38 / 44 | 문서 done count가 뒤처져 있으나 guard가 보존 |
| W3 `관리자 화면 - 신고 목록 + 처리(승인/거부)` | 5 / 42 | 0 / 42 | 5 / 42 | 문서 done count가 뒤처져 있으나 guard가 보존 |
| W5 `에러/로딩 상태 통일` | 0 / 6 | 0 / 10 | 0 / 10 | workflow 문서가 current JSON보다 checkbox 4개 많음 |
| W5 `컨테이너 이미지 파이프라인 (이슈 #52)` | 5 / 10 | 없음 | 없음 | current JSON에는 있으나 `WORKFLOW_frontend_W5.md`에는 없음 |

원인:

- frontend local PM workflow 문서가 dashboard JSON보다 오래되었거나 일부 step이 삭제된 상태다.
- `done-guard`는 같은 track/week/step 이름으로 매칭되는 step만 보존한다.
- W5 `컨테이너 이미지 파이프라인 (이슈 #52)`는 문서에 없기 때문에 guard가 보존할 수 없다.
- W5 `에러/로딩 상태 통일`은 current JSON 6개 check, 문서 10개 check로 총량 기준이 다르다.

권장 조치:

1. W5 `컨테이너 이미지 파이프라인 (이슈 #52)`가 아직 유효한 작업인지 확인한다.
2. 유효하다면 `synapse-frontend/docs/project-management/workflow/WORKFLOW_frontend_W5.md`에 10개 check 기준으로 복구한다.
3. 유효하지 않다면 삭제 사유를 frontend history와 Phase F 리포트에 남기고, parser sync로 제거되도록 한다.
4. W5 `에러/로딩 상태 통일`의 6개/10개 기준 중 어느 쪽이 최신인지 확정한다.
5. W1/W2/W3의 낮은 local checkbox 상태는 실제 완료 증거와 비교해 workflow 문서를 최신화한다. guard에만 의존하면 다음 step rename/delete 때 다시 회귀한다.

## 4. `synapse-shared` drift

요약:

- Current JSON: 281 / 291
- Parser raw: 281 / 281
- Done-guard dry-run: 281 / 281
- Live sync 시 total 10개가 사라진다.

확인된 차이:

| 위치 | Current JSON | Parser raw | 판단 |
|---|---:|---:|---|
| W4 `전체 E2E 시나리오 정의 + 테스트 실행 조율` | 11 / 13 | 11 / 11 | partial checkbox 2개 미count |
| W4 `성능 SLA 검증` | 11 / 14 | 11 / 11 | partial checkbox 3개 미count |
| W4 `Staging 배포 + 모니터링 대시보드 가동` | 11 / 13 | 11 / 11 | partial checkbox 2개 미count |
| W5 `전체 E2E 서비스 단위 실행 (W4 이월)` | 5 / 7 | 5 / 5 | partial checkbox 2개 미count |
| W5 `성능 SLA 검증 (W4 이월)` | 1 / 2 | 1 / 1 | partial checkbox 1개 미count |

원인:

- `synapse-shared` workflow 문서에는 `[~]` partial checkbox가 남아 있다.
- 현재 parser의 checkbox regex는 `[ ]`와 `[x]`만 인식한다.
- current JSON에는 과거 partial 상태가 `partial` metadata와 total count에 반영돼 있지만, 현재 parser로 live sync하면 partial field와 total count가 사라질 수 있다.

권장 조치:

1. dashboard가 partial 상태를 계속 표시해야 하는지 결정한다.
2. partial을 유지한다면 parser에 `[~]` 지원을 추가하고 `partialChecks` 또는 동등한 metadata를 data contract에 명시한다.
3. partial을 폐기한다면 workflow 문서의 `[~]`를 `[ ]`로 바꾸고 partial 의미를 텍스트로 남긴다.
4. 어느 쪽이든 `synapse-shared` live sync 전에 `281/291` 또는 의도된 새 기준이 dry-run에서 재현되어야 한다.

## 5. `synapse-gitops` drift

요약:

- Current JSON: 204 / 211, track `team-lead`
- Parser raw: 205 / 211, track `gitops`
- Done-guard dry-run: 205 / 211, track `gitops`
- Live sync 후보는 `synapse-gitops.json: missing track "team-lead"` warning을 만든다.

확인된 차이:

- `synapse-gitops/docs/project-management/workflow` 파일은 `WORKFLOW_gitops_W1.md`부터 `WORKFLOW_gitops_W5.md`까지다.
- `github-markdown` parser는 파일명에서 track `gitops`를 추출한다.
- `workflow-dashboard/data/config.json`은 `synapse-gitops`의 expected track을 `team-lead`로 정의한다.
- `done-guard`는 track name이 다르면 이전 step을 매칭하지 못한다.

원인:

- source PM 문서의 track 명명과 dashboard/config의 canonical track 명명이 다르다.
- `gitops` dry-run의 done +1이 실제 증거 기반인지 확인하기 전에 live sync하면 track warning과 virtual track breakage가 먼저 발생한다.

권장 조치:

1. canonical track을 하나로 정한다. 현재 dashboard와 virtual track 기준은 `team-lead`다.
2. `team-lead`를 유지한다면 다음 중 하나를 적용한다.
   - workflow 파일명을 `WORKFLOW_team-lead_W*.md`로 정렬한다.
   - 또는 parser/config에 repo별 track alias `gitops -> team-lead`를 추가한다.
3. `gitops`를 canonical으로 바꾼다면 `config.json`, virtual track source, 중앙/team-lead history 참조까지 함께 바꿔야 하므로 범위가 더 크다.
4. track 정렬 후 dry-run 205/211의 +1 done이 실제 PR/운영 증거 기반인지 별도로 확인한다.

## 6. 다음 실행 순서

안전한 순서:

1. `synapse-gitops` track canonical 문제를 먼저 해결한다. 이 문제는 validation warning으로 바로 드러나는 hard blocker다. 완료: `trackAliases`로 `gitops -> team-lead`를 적용했다.
2. `synapse-shared` partial checkbox 정책을 결정하고 parser 또는 문서 표현을 정렬한다. 완료: `[~]`를 parser가 total에 포함하고 `partial: true`로 유지하도록 보강했다.
3. `synapse-frontend` W5 누락 step과 W1/W2/W3 stale checkbox를 workflow 문서에서 정정한다. 남은 작업이다.
4. 각 레포별로 `DOCS_DIR` dry-run을 다시 실행한다.
5. `node scripts/validate-data.mjs` 또는 현재 환경의 `bun scripts/validate-data.mjs`가 0 warning인지 확인한다.
6. diff가 설명 가능한 경우에만 repo별 live sync를 실행한다.

재검증 명령:

```powershell
cd workflow-dashboard

$env:DOCS_DIR="..\synapse-gitops\docs\project-management"
node scripts/sync.mjs synapse-gitops --dry-run

$env:DOCS_DIR="..\synapse-shared\docs\project-management"
node scripts/sync.mjs synapse-shared --dry-run

$env:DOCS_DIR="..\synapse-frontend\docs\project-management"
node scripts/sync.mjs synapse-frontend --dry-run

node scripts/validate-data.mjs
```

## 7. 금지 사항

- `workflow-dashboard/data/*.json`을 손으로 맞추지 않는다.
- `sync.mjs` live mode를 drift 원인 수정 전에 실행하지 않는다.
- PRD/TASK/WORKFLOW checkbox를 증거 없이 완료 처리하지 않는다.
- count를 맞추기 위해 check를 삭제하지 않는다. 삭제가 필요하면 history에 사유를 남긴다.

## 8. 2026-06-21 후속 조치 결과

적용한 변경:

- `workflow-dashboard/data/config.json`에 `synapse-gitops` 전용 `trackAliases: { "gitops": "team-lead" }`를 추가했다.
- `workflow-dashboard/scripts/sync.mjs`가 repo별 `trackAliases`를 parser에 전달하도록 수정했다.
- `workflow-dashboard/scripts/parsers/github-markdown.mjs`가 기존 중복 checkbox parser 대신 `[~]` partial을 지원하는 `parse-workflow-md.mjs`를 재사용하도록 수정했다.
- `synapse-gitops` repo 단위 live sync를 실행해 dashboard JSON을 204/211에서 205/211로 갱신했다.

검증 결과:

- `synapse-gitops` dry-run/live sync: 211 checks, 205 done.
- `synapse-gitops` +1 항목: W5 `Cost 최적화 + 안정화`의 `PDB 정의 (prod 환경 최소 가용성)` check. 근거는 2026-06-21 Phase D PR #211의 prod PDB `minAvailable=2` 정렬과 검증 스크립트 추가다.
- `synapse-shared` dry-run: 291 checks, 281 done, changelog 0. `[~]` partial checkbox total drift는 parser 보강으로 해결됐다.
- `synapse-frontend` W5 workflow: `컨테이너 이미지 파이프라인 (이슈 #52)` Step 13을 복구했다. `Done When` loose checkbox 4개는 Step 13 `배포 파이프라인`에 포함해 current JSON의 10개 check 구조와 맞췄다.
- `synapse-frontend` dry-run: 481 checks, 168 done, changelog 0. count drift는 해소됐다.
- `synapse-frontend` W1/W2/W3 workflow: current JSON의 completed item과 설명을 문서 checkbox에 반영했다. done-guard 없이 raw parser 결과도 168/481로 current JSON과 일치한다.
- Parser fixture: `test-parsers.mjs` 20 passed, `parse-workflow-md.test.mjs` 5 passed.
- Data validation: `Data validation passed with 0 warning(s).`

남은 위험:

- Phase F count drift는 현재 해소됐다. 이후 신규 checkbox 변경은 동일하게 repo별 dry-run, validation, diff 확인을 거쳐 반영한다.
