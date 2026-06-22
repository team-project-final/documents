# P1 증거 하드닝 실행 리포트

> 작성: 2026-06-22 KST
> 기준 계획: [P1 증거 하드닝 실행 플랜](../plans/P1_EVIDENCE_HARDENING_PLAN.md)
> 실행 범위: backend live-tail equivalent tests, GitOps cost/stability preflight, frontend responsive/design QA
> 원칙: live/staging 증거가 없는 TASK/WORKFLOW 완료 체크와 dashboard JSON 수동 수정은 하지 않는다.

## 1. 결론

P1 증거 하드닝을 진행해 로컬/동등 실행 증거를 새로 확보했고, GitOps dev Image Updater semver 계약 drift를 수정했다.

완료 처리로 전환하지 않는 항목도 명확하다. `AuthBillingE2ETest`는 Docker daemon 미기동으로 실행되지 않았고, EKS/ArgoCD live gate는 현재 `kubectl` context가 `docker-desktop`이라 닫지 못했다. Cost Explorer는 조회됐지만 `Project` tag group이 `Project$`로만 표시되어 비용 배분 태그 활성화 또는 untagged cost gap 후속이 필요하다.

## 2. Evidence Register

| Evidence ID | Priority | Repo | Gate | Owner | Result | Artifact / command | Follow-up |
|---|---|---|---|---|---|---|---|
| P1-BE-20260622-01 | P1 | `synapse-platform-svc` | notification/audit Kafka smoke | @platform-owner | PASS | `.\gradlew.bat test --tests "*AuditConsumerIntegrationTest" --tests "*KafkaConsumerConfigSmokeTest" --no-daemon` | Auth/Billing E2E는 Docker blocker 별도 |
| P1-BE-20260622-02 | P1 | `synapse-platform-svc` | Auth/Billing E2E | @platform-owner | BLOCKED | `AuthBillingE2ETest` initialization error: Docker environment unavailable | Docker Desktop/daemon 기동 후 `AuthBillingE2ETest` 재실행, Stripe test data trace 필요 |
| P1-BE-20260622-03 | P1 | `synapse-knowledge-svc` | note/graph/search local slice | @knowledge-owner-1, @knowledge-owner-2 | PASS | `.\gradlew.bat test --tests "*KnowledgeGraphFlowE2ETest" --tests "*NoteVersionIntegrationTest" --tests "*TagIntegrationTest" --tests "*NoteServiceKafkaPublishTest" --tests "*NoteSearchKafkaProducerTest" --tests "*NoteSearchKafkaConsumerTest" --no-daemon` | staging `search result > 0`, DLQ 0, ES lag evidence still open |
| P1-BE-20260622-04 | P1 | `synapse-learning-svc/learning-card` | review due + AI card local chain | @learning-card-owner | PASS | `.\gradlew.bat test --tests "*KafkaEventFlowE2ETest" --tests "*ReviewDueEventPublisherIntegrationTest" --tests "*AiCardGenerationE2ETest" --no-daemon` | review-due -> platform notification live evidence still open |
| P1-BE-20260622-05 | P1 | `synapse-learning-svc/learning-ai` | Kafka consumer/TLS local chain | @learning-ai-owner | PASS | `python -m pytest tests/test_kafka_consumer.py tests/test_kafka_tls.py`: 16 passed, 1 cache warning | deployed `note.created -> learning-ai -> learning-card API` log still open |
| P1-BE-20260622-06 | P1 | `synapse-engagement-svc` | gamification/community event contract | @engagement-owner | PASS | `.\gradlew.bat test --tests "*GamificationStep12FinalE2ETests" --tests "*GamificationKafkaProducerTests" --tests "*CommunityStep13FinalE2ETests" --no-daemon` | EKS pod MSK init + live producer log still open |
| P1-GITOPS-20260622-01 | P1 | `synapse-gitops` | Image Updater semver contract | @team-lead | PASS after fix | `.\scripts\verify-phase-d-release-hardening.ps1 -RunKustomize` | Live ECR tag -> Image Updater branch/PR -> dev sync evidence still open |
| P1-GITOPS-20260622-02 | P1 | `synapse-gitops` | dev overlay semver drift | @team-lead | FIXED | `platform-svc`, `knowledge-svc`, `learning-card`, `learning-ai` dev `newTag` restored to `1.0.0` | Watch shared deploy write-back so SHA tags do not reappear under semver strategy |
| P1-GITOPS-20260622-03 | P1 | `workflow-dashboard` | dashboard sync hygiene | @team-lead | PASS dry-run | `node scripts/validate-data.mjs`: 0 warnings; `DOCS_DIR=...\synapse-gitops\docs\project-management node scripts\sync.mjs synapse-gitops --dry-run`: 211 checks, 205 done | No live sync executed |
| P1-GITOPS-20260622-04 | P1 | AWS/GitOps | cost tag evidence | @team-lead | PARTIAL | `aws sts get-caller-identity` account `963773969059`; Resource Groups Tagging API found 8 `Project=synapse` ECR repos | Cost Explorer group-by `Project` still returns `Project$`; confirm cost allocation tag activation/untagged resources |
| P1-GITOPS-20260622-05 | P1 | AWS/GitOps | cost distribution | @team-lead | PASS capture | Cost Explorer 2026-06-15..2026-06-22 by service: Secrets Manager about $0.626/day, VPC $0.12/day, ECR about $0.028/day; 2026-06-21 also Polly $0.140 | Add accepted risk or cleanup owner for recurring Secrets Manager/VPC cost |
| P1-GITOPS-20260622-06 | P1 | EKS/ArgoCD | HPA/PDB + app health live | @team-lead | BLOCKED | `kubectl config current-context`: `docker-desktop`; `kubectl get hpa,pdb -n synapse-prod`: local API refused; `argocd app list`: server unspecified | Switch to EKS context / ArgoCD login and rerun live gate |
| P1-QA-20260622-01 | P1 | `synapse-frontend` | responsive/render QA | 전체 협업 | PASS | `flutter test` render suite for auth, dashboard, notes, search, graph, cards, community, gamification, notification, admin: 98 passed, 1 skipped | Still needs screenshots or staging browser QA before UX completion |
| P1-QA-20260622-02 | P1 | `synapse-frontend` | design token/orb audit | 전체 협업 | PARTIAL | raw `Color(0x...)` outside `app_colors.dart`: 1 bronze rank color; Flutter `Colors.*` outside theme: 34 mostly transparent/white/black/graph cluster usage; `SynapseOrb` refs: 38 | Decide whether bronze rank token should move into `AppColors`; keep `SynapseOrb` as functional brand mark unless visual QA says otherwise |

## 3. GitOps Fix Applied

The first GitOps verification run failed because four dev overlays had SHA `newTag` values while the dev ApplicationSet uses `argocd-image-updater.argoproj.io/app.update-strategy: semver`.

Files changed:

| File | Before | After |
|---|---|---|
| `synapse-gitops/apps/platform-svc/overlays/dev/kustomization.yaml` | `a5bdcc36657b78bedd4aa4d7d240be4c4924609a` | `1.0.0` |
| `synapse-gitops/apps/knowledge-svc/overlays/dev/kustomization.yaml` | `6cdcf347d1eb19f1be064226bc194b92c080d708` | `1.0.0` |
| `synapse-gitops/apps/learning-card/overlays/dev/kustomization.yaml` | `6ba063bc254b43725460b90d040882285e636c13` | `1.0.0` |
| `synapse-gitops/apps/learning-ai/overlays/dev/kustomization.yaml` | `6ba063bc254b43725460b90d040882285e636c13` | `1.0.0` |

Post-fix verification:

```text
== Phase D release hardening checks ==

Phase D release hardening checks passed.
```

## 4. Live Gate Status

| Gate | Status | Evidence | Decision |
|---|---|---|---|
| Cost Explorer tag | PARTIAL | Cost Explorer grouped by `Project` returned `Project$`; Tagging API found 8 ECR repos with `Project=synapse` | Do not close. Treat as cost allocation/untagged cost follow-up |
| HPA/PDB live | BLOCKED | Current `kubectl` context is `docker-desktop`; local API refused connection | Do not close. Requires EKS kubeconfig/context |
| Image Updater writeback | PARTIAL | Static semver contract fixed and local verification passed | Do not close until semver tag push -> image-updater branch/PR -> dev sync is captured |
| Metrics gap | OPEN | No live Prometheus/Alertmanager capture in this run | Assign owner or accepted risk in final handoff |
| 24h signoff | OPEN | No 24h live stability record in this run | Requires dated operation log |
| Destroy decision | OPEN | No environment keep/destroy decision in this run | Requires team-lead handoff decision |

## 5. Frontend QA Notes

The render suite gives useful local responsive coverage across desktop/tablet/mobile-style test harnesses, but it is not a substitute for screenshot evidence.

Design token findings:

- Product colors are centralized in `lib/core/theme/app_colors.dart`; screens overwhelmingly use `AppColors.*`.
- One raw product color remains outside the token file: `leaderboard_screen.dart` bronze rank `Color(0xFFCD7F32)`.
- `Colors.transparent`, `Colors.white`, `Colors.black87`, and `Colors.white70` remain in 34 references. Most are overlay/contrast/transparent UI primitives, not new brand palette values.
- `SynapseOrb` is still named for compatibility, but `lib/shared/widgets/synapse_orb.dart` documents it as a restrained brand mark. Current uses are navigation/avatar/AI entry/review result, not purely decorative background orbs.

## 6. Current Closeout Decision

No P1 dashboard completion sync was executed.

The safe state after this run is:

- Backend local/equivalent evidence improved, but live/staging event chain closeout remains open.
- GitOps semver contract drift was fixed and validated locally, but EKS/ArgoCD live evidence remains open.
- Cost visibility evidence exists, but Cost Explorer tag grouping shows a follow-up gap.
- Frontend render QA passed, but screenshot/browser QA and final design token cleanup remain open.

Next worker should run the live gates only after Docker Desktop/EKS kubeconfig/ArgoCD login are available, then paste the live evidence into a new dated report before marking any remaining TASK/WORKFLOW items complete.
