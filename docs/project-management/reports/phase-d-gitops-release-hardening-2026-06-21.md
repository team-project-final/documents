# Phase D GitOps 및 릴리즈 하드닝 실행 리포트

> 작성: 2026-06-21 KST
> 기준 계획: `documents/docs/project-management/FINAL_REFACTOR_COMPLETION_PLAN.md` Phase D
> 사용자 요청: "Phase D. GitOps 및 릴리즈 하드닝 내용 확인하고 작업 진행하기"
> 원칙: live 운영 증거 없는 PRD/TASK/WORKFLOW 완료 체크, dashboard JSON 강제 완료 처리는 하지 않는다.

## 1. 결론

Phase D의 GitOps 코드/문서 하드닝은 `synapse-gitops` PR #211로 머지됐다.

다만 Phase D 전체를 완료 처리하지는 않는다. 로컬 계약 검증과 manifest 렌더 검증은 통과했지만, AWS/EKS/ArgoCD live 증거와 dashboard live sync gate가 아직 남아 있다. 특히 `workflow-dashboard` live sync 후보는 `team-lead` track 경고와 큰 JSON diff를 만들기 때문에 보류한다.

## 2. 머지된 GitOps 변경

| 항목 | 결과 | 증거 |
|---|---|---|
| PR | `team-project-final/synapse-gitops` PR #211 merged | <https://github.com/team-project-final/synapse-gitops/pull/211> |
| Merge commit | `0b2a2ef0dc596649df3352830103dccb1d02c315` | `git log -1` |
| dev image tags | frontend/gateway/platform/knowledge/learning-ai/learning-card dev overlay를 semver baseline `1.0.0`으로 정렬, engagement는 `1.0.1` 유지 | PR #211 diff |
| Image Updater 계약 | dev ApplicationSet의 semver allow-tags, git write-back, kustomization write-back target, per-service `image-updater-<svc>` branch 계약을 검증 스크립트에 고정 | `scripts/verify-phase-d-release-hardening.ps1` |
| HPA/PDB | prod 5개 서비스 PDB를 W5 Step 12 기대값인 `minAvailable: 2`로 정렬 | prod overlays + verify script |
| 비용 태그 | standalone ECR Terraform에 `Environment=shared`, `Service=<svc>` 태그 추가 | `infra/aws/ecr` |
| Runbook | Phase D local/live verification 절차 추가 | `docs/runbooks/final-release-hardening-phase-d.md` |

## 3. Phase D 남은 작업 매핑

| 계획 항목 | 현재 판단 | 남은 증거 |
|---|---|---|
| image tag 계약 검증 | 정적 계약 완료. dev overlay와 ECR repo 매핑은 검증 스크립트 통과 | live ECR tag 존재와 ArgoCD sync 로그 |
| ArgoCD Image Updater writeback/semver path | 설정 계약 완료. semver tag, allow-tags, write-back branch 규칙 검증됨 | 실제 semver tag push -> image-updater PR/branch 생성 -> dev sync 증거 |
| 비용 태그와 untagged resource | Terraform/ECR 태그 보강 완료 | Cost Explorer 또는 Resource Groups Tagging API에서 untagged Synapse resource 0건 확인 |
| HPA/PDB 기대 상태 | prod PDB manifest와 overlay wiring 검증 완료 | `kubectl get hpa,pdb -n synapse-prod` live output |
| dev/staging/prod Synced + Healthy | 로컬에서는 확인 불가 | `argocd app list` 또는 ArgoCD UI/export 로그 |
| 제품 앱 디자인과 local-k8s/developer guide 디자인 분리 | 문서 경계 재확인. 제품 앱은 `documents/DESIGN.md`, GitOps 개발자 문서는 `synapse-gitops/DESIGN.md` 기준 | 화면/문서 변경 시 각 repo에서 재확인 |
| kustomize/yamllint/kubeconform | `-RunKustomize` 포함 Phase D 검증 통과. 현재 머신은 `kubectl` 사용 가능, `kustomize`/`yamllint`/`kubeconform`은 PATH에 없음 | CI 또는 도구 설치 환경에서 yamllint/kubeconform 로그 |

## 4. 검증 결과

### GitOps local contract

Command:

```powershell
.\scripts\verify-phase-d-release-hardening.ps1 -RunKustomize
```

Result:

```text
== Phase D release hardening checks ==

Phase D release hardening checks passed.
```

판단: 로컬 Phase D 계약과 `kubectl kustomize` 기반 overlay build 검증은 통과했다.

### Dashboard dry-run

Command:

```powershell
$env:DOCS_DIR='D:\workspace\final-project-syn\synapse-gitops\docs\project-management'
node scripts\sync.mjs synapse-gitops --dry-run
```

Result:

```text
Would write: 211 checks, 205 done (97%)
New changelog entries: 0
```

판단: PR #211 이후 PM 문서 기준은 205/211로 계산된다. 기존 Phase F 기준의 current JSON 204/211보다 1개 증가했으므로, live sync 전에 이 증가분이 실제 증거 기반인지 diff와 parser 계약으로 설명되어야 한다.

### Dashboard validation after live sync candidate

Command:

```powershell
node scripts\validate-data.mjs
```

Result:

```text
Data validation passed with 1 warning(s).
Data warnings:
- synapse-gitops.json: missing track "team-lead"; consumed by a virtualTrack and will be treated as empty
```

추가 diff 관찰:

- `data/synapse-gitops.json` diff가 700 lines 규모다.
- track name이 `team-lead`에서 `gitops`로 바뀐다.
- 기존 `partial` fields가 대량 제거된다.

판단: 이 live sync 후보는 Phase D 완료 증거로 수용하지 않는다. `workflow-dashboard`의 virtualTrack/config가 `gitops` track을 받도록 정리되거나, parser가 기존 `team-lead` track 계약을 유지하도록 수정된 뒤 재실행해야 한다.

## 5. 다음 live gate

다음 조건을 만족할 때만 Phase D dashboard sync와 완료 처리를 진행한다.

1. Cost Explorer 또는 Resource Groups Tagging API에서 Synapse untagged resource 결과를 저장한다.
2. `argocd app list` 기준 dev/staging/prod 앱의 Synced + Healthy 결과를 남긴다.
3. semver ECR tag push가 Image Updater branch/PR/writeback으로 이어지는 로그를 남긴다.
4. `kubectl get hpa,pdb -n synapse-prod` 결과를 handoff에 첨부한다.
5. metrics gap, 24h signoff, destroy decision을 handoff에 명시한다.
6. dashboard sync는 dry-run, live sync, `validate-data` 0 warning, diff 승인 순서로만 반영한다.

## 6. 현재 최종 판단

Phase D는 "코드/문서 하드닝 PR 머지 및 로컬 검증 완료" 상태다.

완료 처리 전에는 live AWS/EKS/ArgoCD 증거와 dashboard sync warning 해소가 필요하다. 따라서 중앙 계획과 PM README에는 이 리포트를 Phase D 기준점으로 연결하되, PRD/TASK/WORKFLOW checkbox 추가 완료나 dashboard JSON 커밋은 보류한다.
