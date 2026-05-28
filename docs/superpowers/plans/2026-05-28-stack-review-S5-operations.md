# 18 기술 스택 검증 — S5 운영/관측성 세션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 18 기술 스택 정의서의 S5 운영/관측성 카테고리(§7.1~§7.7 인프라 7개 + §8.1~§8.5 관측성 5개 = 12개)에 대해 context7 공식 문서 검증 + `synapse-*`/`synapse-gitops`/`synapse-shared` 실 코드 대조 + 보강을 수행하고, 누적된 **5건 ADR 위임**(§3.1 Gateway JWT·CB / §3.2 Resilience4j Gateway 도입 / §3.3 RedisRateLimiter 플랜별 / Redis Cluster 전환 / ES vs OpenSearch)을 본 세션 §6 Deep Dive 형태로 결정·정리한다.

**Architecture:** 마스터 스펙 §1 6단계 파이프라인. 12개 항목은 두 자연 카테고리로 분리 가능하므로 **Phase B3에서 2개 subagent 병렬 dispatch**(subagent A: 인프라 7 + Testcontainers·pytest 이관 후보 / subagent B: 관측성 5). controller가 결과를 통합해 단일 보고서·단일 위키 패치·단일 PR로 마감. S2a(12개 단일 subagent)와 분량은 비슷하나 두 카테고리 분리로 보고서 가독성·subagent 분량 통제 둘 다 개선. 보고서 9 섹션 + 위키 일괄 패치 + PR/INDEX·HANDOFF 갱신은 S1·S2a·S2b·S3·S4와 동일.

**Tech Stack:** Markdown · PowerShell 7 · Git · GitHub CLI(gh) · context7 MCP

**관련 산출물 위치:**
- 마스터 스펙: `documents/docs/superpowers/specs/2026-05-28-tech-stack-doc-review-design.md`
- 마스터 INDEX: `documents/docs/superpowers/specs/2026-05-28-stack-review-INDEX.md` (S4 종료 후 S1·S2a·S2b·S3·S4 completed 상태, S4 브랜치 `docs/stack-review-S4-event-sync`에 최신본 있음 — main 머지 대기)
- 마스터 HANDOFF: `documents/docs/superpowers/specs/2026-05-28-stack-review-HANDOFF.md` (v1.1 — 5세션 완료/2세션 남음, S4 브랜치에 최신본)
- 본 플랜 자신: `documents/docs/superpowers/plans/2026-05-28-stack-review-S5-operations.md`
- 본 플랜이 만들 보고서: `documents/docs/superpowers/specs/2026-05-28-stack-review-S5-operations.md`
- 본 플랜이 패치할 위키: `documents.wiki/18_기술_스택_정의서.md` (S4 dual-commit 후 `8785252` 상태)
- 실 코드 검증 대상:
  - `synapse-*/Dockerfile` · `synapse-*/docker-compose.yml` — §7.1
  - `synapse-gitops/` 전체 — §7.2 EKS, §7.3 ArgoCD ApplicationSet
  - `synapse-shared/.github/workflows/*.yml` + 각 `synapse-*/.github/workflows/*.yml` — §7.4 GitHub Actions
  - `synapse-gitops/local-k8s/infra/` — §7.6 Istio (IstioOperator·VirtualService·DestinationRule), §7.5 Cloudflare(원격 추정)
  - `synapse-gitops/local-k8s/observability/` — §8.1-§8.5 관측성 스택 manifests
  - 각 서비스 `src/main/resources/application*.yml` — `management.metrics.tags` · `management.tracing` 설정

**필수 메모리 (S5 핵심):**
- `deploy-mirror-standardization` — **핵심**: W3 reusable workflow PR 세트(synapse-shared #8 base main, gitops #70, 5 service caller PRs), AWS_ROLE_ARN 차단, ECR 리포 `synapse/gateway` 신규 필요. 18 §7.4 GitHub Actions·§7.7 ECR 검증의 진실 원천.
- `redis-topology-decision` — **핵심**: Redis Cluster 전환 ADR 결정 컨텍스트. 본 세션 §6 ADR 1건.
- `s3-implementation-status` — **참조**: S3 §5.7는 목표 형태. §7.5 Cloudflare(CDN)·§8.2 Fluent Bit S3 destination 검증 시 인용. 본 세션 본문 비변경.
- `git-pr-workflow` — 운영 표준.

**S5 검증 대상 (12개 + 이관 후보 2개):**
- §7.1 Docker + Docker Compose
- §7.2 AWS EKS (Kubernetes)
- §7.3 ArgoCD (+ ApplicationSet)
- §7.4 GitHub Actions
- §7.5 Cloudflare
- §7.6 Istio (서비스 메시)
- §7.7 AWS ECR
- §8.1 Prometheus + Grafana
- §8.2 Fluent Bit + CloudWatch/Loki
- §8.3 OpenTelemetry + Jaeger
- §8.4 Sentry
- §8.5 AlertManager + Slack
- (이관 후보) §4.1.7 Testcontainers — S2a에서 이미 처리됨. 본 세션 비변경.
- (이관 후보) §4.2.6 pytest — S2a에서 이미 처리됨. 본 세션 비변경.

→ **이관 후보 2개는 S2a에서 처리 완료** 확인. 본 세션은 12개에 집중.

**S2a/S3/S4 위임 ADR 5건 (본 세션 §6 Deep Dive에서 결정):**
1. (S2a 위임) **§3.1 Gateway JWT 미구현 + CircuitBreaker 미설정** — 운영 정책 ADR
2. (S4 위임) **§3.2 Resilience4j Gateway 도입 결정** — 도입 여부 + 도입 시 모듈 범위
3. (S4 위임) **§3.3 RedisRateLimiter 플랜별 분기 결정** — KeyResolver/플랜 키 패턴
4. (S3 위임) **Redis Cluster 전환 트리거 ADR** — RPS·메모리·HA 임계치
5. (S3 위임) **ES vs OpenSearch 결정 ADR** — 라이선스·AWS Managed Service·기능 fast-follow

이들은 S5 본문 검증과 자연스럽게 연결되므로 본 세션에서 한 번에 결정.

**S5 검증 초점:**
- **§7.1 Docker + Docker Compose**: Docker 24+ / Compose v2 표준 명령(`docker compose` vs `docker-compose`), multi-stage build·BuildKit, healthcheck, distroless 베이스, layer 최적화
- **§7.2 AWS EKS**: 1.31+ (1.29 EoL), IRSA(IAM Roles for Service Accounts), CoreDNS·VPC CNI·EBS CSI 드라이버, EKS Anywhere vs Managed, AMI Linux 2023, Karpenter / Cluster Autoscaler
- **§7.3 ArgoCD**: 3.4 + ApplicationSet, App-of-Apps, sync waves, ignoreDifferences, GitOps PR-based promotion (synapse-gitops 패턴)
- **§7.4 GitHub Actions**: OIDC vs static credentials, reusable workflows(synapse-shared 패턴, 메모리 [[deploy-mirror-standardization]]), matrix builds, Cosign image signing 가능 여부
- **§7.5 Cloudflare**: WAF rule sets, DDoS L7 protection, Workers/Pages, Argo Tunnel, R2 vs S3
- **§7.6 Istio**: 1.20+/1.21 Ambient Mesh 옵션, Gateway API (Gateway 5와 분리), mTLS STRICT, RequestAuthentication·AuthorizationPolicy, EnvoyFilter 최소화
- **§7.7 AWS ECR**: 이미지 스캔(Enhanced Scanning vs Basic), Lifecycle Policy(태그 보존 정책), Cross-account replication, Pull-through cache
- **§8.1 Prometheus + Grafana**: Prometheus 2.x, kube-prometheus-stack(차트 65+), ServiceMonitor·PodMonitor·PrometheusRule, Grafana 11.x, dashboard provisioning, ServiceMonitor·remote_write
- **§8.2 Fluent Bit**: 3.x, kubernetes filter, Loki vs CloudWatch destinations, multi-pipeline, parser/filter chain
- **§8.3 OpenTelemetry + Jaeger**: OTel Collector 0.110+, OTLP gRPC vs HTTP, sampling(parentbased_traceidratio), Jaeger v2 vs v1, span attributes 표준
- **§8.4 Sentry**: 24.x, breadcrumb·tag·release tracking, performance monitoring(transaction), self-hosted vs SaaS
- **§8.5 AlertManager + Slack**: alertmanager.yml 라우팅 트리, Slack webhook templating, inhibition rules, group_wait/group_interval

---

## Phase A — 작업 브랜치 + S4 누적 산출물 cherry-pick

### Task A1: 브랜치 + 동기화 + S4 INDEX·HANDOFF 가져오기

> S4 PR #11이 main 머지 대기 중이므로, S5 작업은 main + S4 브랜치에서 누적 산출물(INDEX·HANDOFF)을 cherry-pick하는 패턴(S3 플랜과 동일).

- [ ] **Step 1: documents main 동기화 + S5 브랜치 생성**

```
Push-Location 'C:\workspace\team-project-final\documents'
git fetch origin
git checkout main
git pull --rebase origin main
git log --oneline -3
git checkout -b docs/stack-review-S5-operations
Pop-Location
```
Expected: `Switched to a new branch 'docs/stack-review-S5-operations'`.

- [ ] **Step 2: documents.wiki 동기화 (S4 dual-commit 포함)**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git checkout master
git pull --rebase origin master
git log --oneline -3
Pop-Location
```
Expected: `8785252 docs(stack): S4 변경 이력 행에 PR 번호 기입` + `0a7e5a2`.

- [ ] **Step 3: S4 브랜치에서 INDEX·HANDOFF cherry-pick**

```
Push-Location 'C:\workspace\team-project-final\documents'
git checkout origin/docs/stack-review-S4-event-sync -- docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git checkout origin/docs/stack-review-S4-event-sync -- docs/superpowers/specs/2026-05-28-stack-review-HANDOFF.md
git status --short
Pop-Location
```
Expected: 2개 파일 staged. INDEX·HANDOFF는 S4 completed 상태 포함된 최신본.

- [ ] **Step 4: INDEX S5 상태가 `pending`인지 확인**

`Grep`:
```yaml
pattern: "^\\| S5 \\|.*pending"
path: C:\workspace\team-project-final\documents\docs\superpowers\specs\2026-05-28-stack-review-INDEX.md
output_mode: content
-n: true
```
Expected: 매치 1줄.

- [ ] **Step 5: S5 본 플랜 파일도 본 브랜치에 포함**

```
Push-Location 'C:\workspace\team-project-final\documents'
git status --short
# 본 플랜 파일은 본 PR 생성 시 함께 add (Task C1에서 처리)
Pop-Location
```

---

## Phase B — S5 6 단계 파이프라인

### Task B1: Step 1 — 12개 항목 인벤토리

- [ ] **Step 1: §7.x/§8.x 절 헤더 위치 확인 (S4 신설 §4.1.9/§5.4.1 영향 반영)**

`Grep`:
```yaml
pattern: "^### (7\\.[1-7]|8\\.[1-5]) "
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
Expected: §7.1~§7.7·§8.1~§8.5 12개 헤더 라인 번호 확보. S4 신설 절들로 라인 번호가 +170 정도 이동했을 것.

- [ ] **Step 2: 검증 대상 12개 절의 라인 범위 계산**

다음 절 시작 직전까지:
- §7.1 Docker → §7.2 시작 직전
- §7.2 AWS EKS → §7.3 시작 직전
- §7.3 ArgoCD → §7.4 시작 직전
- §7.4 GitHub Actions → §7.5 시작 직전
- §7.5 Cloudflare → §7.6 시작 직전
- §7.6 Istio → §7.7 시작 직전
- §7.7 AWS ECR → §8 또는 ## 8 시작 직전
- §8.1 Prometheus+Grafana → §8.2 시작 직전
- §8.2 Fluent Bit → §8.3 시작 직전
- §8.3 OTel+Jaeger → §8.4 시작 직전
- §8.4 Sentry → §8.5 시작 직전
- §8.5 AlertManager → §9 또는 ## 9 시작 직전

각 라인 범위를 Task B3 subagent A·B 프롬프트에 임베드.

- [ ] **Step 3: deploy-mirror 관련 위키 현재 언급 위치 스캔**

`Grep`:
```yaml
pattern: "deploy\\.yml|mirror\\.yml|reusable workflow|AWS_ROLE_ARN|OIDC|ECR_REGISTRY"
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
Expected: §7.4·§7.7 위주 다수 매치. 메모리 [[deploy-mirror-standardization]] 표준과 정합/표류 식별.

- [ ] **Step 4: ADR 5건 cross-section 인용 확인**

`Grep`:
```yaml
pattern: "§(3\\.[123]|5\\.[23])|JWT 미구현|CircuitBreaker 미설정|Redis Cluster|OpenSearch"
path: C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md
output_mode: content
-n: true
```
Expected: §10.1 / §12.4 / §3.x / §5.x 인용. ADR 결정의 §6 Deep Dive 위치 후보 식별.

---

### Task B2: Step 2 — skill-recommender (S5 키워드)

- [ ] **Step 1: 키워드 정의 + 실행**

```
node C:\workspace\dsd\.claude\skills\skill-recommender\scripts\search-catalog.cjs `
  --catalog C:\workspace\dsd\skill-catalog\catalog.json `
  --keywords "docker,kubernetes,eks,argocd,helm,istio,prometheus,grafana,opentelemetry,jaeger,sentry,alertmanager,fluentbit,cloudflare,ecr,github actions" `
  --limit 30 `
  --type all 2>&1 | Out-File -Encoding utf8 -FilePath C:\Temp\_S5-skill-rec.json
$data = Get-Content C:\Temp\_S5-skill-rec.json -Raw | ConvertFrom-Json
Write-Output "TOTAL=$($data.totalMatches)"
$data.results | Where-Object { $_.source -in @('marketplace','mcp-official-registry') -or $_.verified -eq $true } | Select-Object -First 8 | ForEach-Object { "{0,-50} | {1,-12} | src={2,-25} | v={3}" -f $_.name, $_.type, $_.source, $_.verified }
Remove-Item C:\Temp\_S5-skill-rec.json -Force -ErrorAction SilentlyContinue
```
Expected: kubernetes MCP·grafana MCP·prometheus MCP 등 0~5건 verified 가능. S1·S2·S3·S4 동일 기준으로 채택.

- [ ] **Step 2: 채택 후보 선별 + 사용 결정**

verified 0~5건. 그 외엔 context7만 사용.

---

### Task B3: Step 3+4 — 두 subagent 병렬 + 결과 통합

> S2a 12개 단일 subagent와 비교해 분량 통제·보고서 가독성 위해 **두 subagent 병렬 dispatch**. 각각 자체 evidence·classification 처리, controller가 finding_id 통합.

- [ ] **Step 1: subagent A dispatch — 인프라 7개 (§7.1-§7.7)**

`Agent` 도구(general-purpose). prompt 핵심:

```
You are verifying 7 INFRASTRUCTURE wiki sections (§7.1-§7.7) of `documents.wiki/18_기술_스택_정의서.md` against official docs and synapse-* / synapse-gitops / synapse-shared code. Part of S5 Operations session (after S1·S2a·S2b·S3·S4 completed, S4 머지 대기).

## Working directory
C:\workspace\team-project-final

## Sections to verify (Read each in C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md)

- §7.1 Docker + Docker Compose — L<from>-L<to>
- §7.2 AWS EKS (Kubernetes) — L<from>-L<to>
- §7.3 ArgoCD (+ ApplicationSet) — L<from>-L<to>
- §7.4 GitHub Actions — L<from>-L<to>
- §7.5 Cloudflare — L<from>-L<to>
- §7.6 Istio (서비스 메시) — L<from>-L<to>
- §7.7 AWS ECR (Elastic Container Registry) — L<from>-L<to>

(라인 범위는 controller가 Task B1에서 계산해 전달)

## CRITICAL: 메모리 정합성 검증 (S5 핵심)

먼저 Read:
- C:\Users\G\.claude\projects\C--workspace-team-project-final\memory\deploy-mirror-standardization.md
- C:\Users\G\.claude\projects\C--workspace-team-project-final\memory\redis-topology-decision.md

핵심 표준:

[deploy-mirror-standardization]
- W3: synapse-shared의 reusable workflow(deploy-service.yml, mirror-service.yml) + 얇은 caller로 표준화
- 차단된 인프라 선행조건: AWS_ROLE_ARN(OIDC deploy role) 부재, ECR `synapse/gateway` 리포 신규 필요
- 기존 deploy.yml은 `apps/synapse-<svc>/...`(잘못) → 실제는 `apps/<svc>/...`(접두사 없음). bump가 no-op 버그였음
- learning은 모노레포(learning-ai/ + learning-card/)인데 단일 빌드였음
- ECR_REGISTRY 시크릿 미등록("Phase 3 예정") latent 상태

검증 시:
- §7.4 GitHub Actions: reusable workflow 패턴이 본문에 반영됐는지 / static credentials → OIDC 권고
- §7.4 ECR push 인증: OIDC 표준 명시 여부
- §7.7 AWS ECR: synapse/gateway 리포 부재 사실 / Lifecycle Policy 표준
- §7.4/§7.7 cross-reference로 [[deploy-mirror-standardization]] PR 세트 인용 가능 여부

## ADR 위임 결정 처리 (controller가 §6 Deep Dive에서 다룸)
본 subagent는 §7.x 본문 검증만 집중. ADR 5건은 controller가 별도 처리.

## Step A — context7 / WebFetch

- "docker" → multi-stage, BuildKit, healthcheck, distroless
- "docker compose" v2 → `docker compose` vs `docker-compose` (deprecated)
- "kubernetes" → 1.31+ 변경, IRSA, deprecation timeline (1.29 EoL 2024-02)
- "aws eks" → control plane 1.31, AMI Linux 2023, EBS CSI, VPC CNI
- "argocd" → 3.4, ApplicationSet, sync waves, ignoreDifferences
- "github actions" → reusable workflows, OIDC providers, matrix builds, Cosign
- "cloudflare" → WAF, DDoS L7, Workers, Argo Tunnel, R2
- "istio" → 1.21+ Ambient, Gateway API, mTLS STRICT, AuthorizationPolicy
- "aws ecr" → Enhanced Scanning, Lifecycle Policy, Cross-account replication, Pull-through cache

Fallback WebFetch: docs.docker.com / kubernetes.io / docs.aws.amazon.com/eks/latest/userguide/ / argo-cd.readthedocs.io / docs.github.com/en/actions / developers.cloudflare.com / istio.io/latest/docs/ / docs.aws.amazon.com/AmazonECR/latest/userguide/

## Step B — 실 코드 대조

Read·Grep (synapse-gitops + synapse-shared + synapse-*):

(1) §7.1 Docker:
```
Glob: synapse-*/Dockerfile
Read 각 Dockerfile — multi-stage 사용 여부, 베이스 이미지, distroless 여부
Glob: synapse-*/docker-compose*.yml
```

(2) §7.2 EKS / §7.3 ArgoCD / §7.6 Istio (synapse-gitops):
```
Glob: synapse-gitops/**/*.yaml
Read 주요 ApplicationSet, kustomization, IstioOperator manifests
```

(3) §7.4 GitHub Actions:
```
Glob: synapse-shared/.github/workflows/*.yml
Glob: synapse-*/.github/workflows/*.yml
Grep: "uses:\\s*team-project-final/synapse-shared/.github/workflows/" → reusable 참조 확인
Grep: "AWS_ROLE_ARN|aws-actions/configure-aws-credentials|role-to-assume" → OIDC 사용 여부
```

(4) §7.7 ECR:
```
Grep: "ECR_REGISTRY|aws-account.dkr.ecr|public.ecr.aws|amazonaws.com/synapse/" all repos
synapse-shared mirror.yml의 destination registry 확인
```

(5) §7.5 Cloudflare: synapse-gitops에 Cloudflare manifests 있는지 확인. 없으면 "외부 인프라" 라벨로 기록.

(6) §7.6 Istio: synapse-gitops/local-k8s/infra/istio/ 또는 manifest 디렉토리 확인.

## Step C/D — 분류 + YAML (finding_id = INFRA-F##)

표준 필드 YAML. proposed_text는 즉시 Edit 가능한 markdown 형태.

## Step E — 자기 점검

- [ ] 7개 절 각각 최소 1개 finding
- [ ] OK 항목 최소 2개
- [ ] 메모리 deploy-mirror-standardization 정합 결과 명시 (§7.4·§7.7)
- [ ] context7 또는 WebFetch evidence

## Report Format
Status: DONE | ...
Findings (INFRA-F##): <count> — E1:_ E2:_ D:_ R:_ OK:_
Severity: P0:_ P1:_ P2:_
<YAML findings 한 항목씩 ---로>
Memory consistency:
  - deploy-mirror-standardization: <CONSISTENT | DRIFT> + 상세
Self-review:
Concerns:

## 주의
- 파일 수정·git 작업 절대 금지
- 한국어 출력
- §8 관측성은 다른 subagent 담당 — 건드리지 말 것
- §5.7 AWS S3(S3 처리)·§4.1.7 Testcontainers(S2a 처리)는 건드리지 말 것
- 작업 디렉토리: C:\workspace\team-project-final
```

- [ ] **Step 2: subagent B dispatch — 관측성 5개 (§8.1-§8.5)** (병렬, 같은 메시지에 두 Agent 호출)

prompt 핵심:

```
You are verifying 5 OBSERVABILITY wiki sections (§8.1-§8.5) of `documents.wiki/18_기술_스택_정의서.md` against official docs and synapse-* / synapse-gitops code.

## Working directory
C:\workspace\team-project-final

## Sections to verify

- §8.1 Prometheus + Grafana — L<from>-L<to>
- §8.2 Fluent Bit + CloudWatch / Loki — L<from>-L<to>
- §8.3 OpenTelemetry + Jaeger — L<from>-L<to>
- §8.4 Sentry — L<from>-L<to>
- §8.5 AlertManager + Slack — L<from>-L<to>

## CRITICAL: S4 신설 절 §5.4.1 모니터링 지표와의 정합 확인

S4 §5.4.1 (신설) — Outbox 운영 Prometheus 알람 임계값:
- `outbox_backlog_count{service}` > 1,000 5분 평균
- `outbox_publish_latency_seconds{quantile="0.99"}` > 5s
- `outbox_failed_total{service}` 1분당 > 10
- `kafka_producer_record_error_total{client_id=~"outbox-relay-.*"}` 1분당 > 5

§8.1 Prometheus 검증 시:
- 이 메트릭들이 §8.1 표준 ServiceMonitor·PrometheusRule 표현으로 본문에 반영되는지 확인
- 부재면 R 보강 후보(§5.4.1과 cross-reference 추가 권고)

§8.5 AlertManager 검증 시:
- §5.4.1 알람 임계값들이 alertmanager.yml 라우팅 트리에 매핑 가능한 형태인지 확인

## Step A — context7 / WebFetch

- "prometheus" → 2.x, kube-prometheus-stack, ServiceMonitor, PodMonitor, PrometheusRule, remote_write
- "grafana" → 11.x, dashboard provisioning, datasource provisioning, alerting v9 통합
- "fluent bit" → 3.x, kubernetes filter, Loki output, CloudWatch output, parser/filter chain
- "opentelemetry" → Collector 0.110+, OTLP, sampling(parentbased_traceidratio), Java agent
- "jaeger" → v2 vs v1, Cassandra/Elasticsearch storage, sampling strategies
- "sentry" → 24.x, transactions, releases, breadcrumbs, self-hosted vs SaaS
- "alertmanager" → routing tree, inhibition rules, group_wait/group_interval, Slack webhook templating

Fallback WebFetch: prometheus.io/docs/ / grafana.com/docs/ / docs.fluentbit.io / opentelemetry.io/docs/ / www.jaegertracing.io/docs/ / docs.sentry.io / prometheus.io/docs/alerting/

## Step B — 실 코드 대조

(1) synapse-gitops 관측성 manifests:
```
Glob: synapse-gitops/**/observability/**
Glob: synapse-gitops/**/monitoring/**
```

(2) 각 서비스 application*.yml에서 management.metrics / management.tracing:
```
Grep pattern: "management\\.(metrics|tracing|endpoint)|micrometer|otel|opentelemetry"
glob: "synapse-*/src/main/resources/application*.yml"
glob: "synapse-*/*/src/main/resources/application*.yml"
output_mode: content
```

(3) Python AI 서비스 OTel 통합:
```
Glob: synapse-learning-svc/learning-ai/pyproject.toml
Grep pattern: "opentelemetry|sentry"
```

(4) Sentry DSN/SDK 통합:
```
Grep pattern: "sentry-spring|sentry-sdk|@SentryTransaction|SENTRY_DSN" all repos
```

(5) Prometheus ServiceMonitor·Grafana dashboard·AlertManager 룰:
```
Glob: synapse-gitops/**/servicemonitor*.yaml
Glob: synapse-gitops/**/dashboard*.yaml
Glob: synapse-gitops/**/alertmanager*.yaml
Glob: synapse-gitops/**/prometheus-rules*.yaml
```

## Step C/D — 분류 + YAML (finding_id = OBS-F##)

표준 필드 YAML. proposed_text는 즉시 Edit 가능한 markdown.

## Step E — 자기 점검

- [ ] 5개 절 각각 최소 1개 finding
- [ ] OK 항목 최소 2개
- [ ] §5.4.1 Outbox 모니터링 지표 정합 확인 결과
- [ ] context7 또는 WebFetch evidence

## Report Format
Status: DONE | ...
Findings (OBS-F##): <count> — E1:_ E2:_ D:_ R:_ OK:_
Severity: P0:_ P1:_ P2:_
<YAML findings 한 항목씩 ---로>
S4 outbox metrics consistency: <CONSISTENT | DRIFT | UNDOCUMENTED_IN_§8>
Self-review:
Concerns:

## 주의
- 파일 수정·git 작업 절대 금지
- 한국어 출력
- §7 인프라는 다른 subagent 담당
- 작업 디렉토리: C:\workspace\team-project-final
```

- [ ] **Step 3: 두 subagent 결과 수신 + 통합**

controller는 다음을 수행:
- INFRA-F## → S5-IF## / OBS-F## → S5-OF## 변환 (또는 통합 S5-F##로 일렬 번호)
- 통합 통계: E1·E2·D·R·OK 합산
- 메모리 정합 결과 통합 (deploy-mirror-standardization·redis-topology-decision)
- §5.4.1 outbox 메트릭 §8.1 정합 결과

---

### Task B4: Step 5 — 보고서 9 섹션 작성

- [ ] **Step 1: 보고서 헤더 + 9 섹션 스켈레톤 생성**

`Write`로 `documents/docs/superpowers/specs/2026-05-28-stack-review-S5-operations.md` 생성. S4 보고서와 동일 구조 + §6 Deep Dive에 ADR 5건 결정 본문 포함.

§6 Deep Dive (ADR 5건 별도 표시):
```markdown
## 6. "더 깊이 / Deep Dive" 보강 항목 일람

### 6.x ADR-S5-1: Gateway JWT 미구현·CircuitBreaker 미설정 정책 (§3.1 위임)
- 결정: ...
- 트레이드오프: ...
- 적용 시점: ...
- 본문 patch_target: §3.1 또는 §6 운영 보강 절

### 6.x ADR-S5-2: Resilience4j Gateway 도입 결정 (§3.2 위임)
- 결정: ...
### 6.x ADR-S5-3: RedisRateLimiter 플랜별 분기 결정 (§3.3 위임)
- 결정: ...
### 6.x ADR-S5-4: Redis Cluster 전환 트리거 ADR (§5.2 위임)
- 결정: ...
- 임계치: RPS·메모리·HA
### 6.x ADR-S5-5: ES vs OpenSearch 결정 ADR (§5.3 위임)
- 결정: ...
- 근거: 라이선스·AWS Managed·기능 fast-follow
```

§8 후속 과제:
- 본 세션 처리
- S6 위임 (§6 RAG)
- 별도 코드 PR (deploy-mirror-standardization Phase 4 의존)
- 별도 결정 (AWS_ROLE_ARN OIDC provider 생성)
- v2.3 통합 정리

- [ ] **Step 2: §1~§7 채우기**

S1·S2·S3·S4 패턴 동일. 통합 finding YAML들 §5에. §6에 R 클래스 Deep Dive + ADR 5건.

§7 위키 패치 diff는 Task B6 후 채움.

- [ ] **Step 3: §0 요약 통계 + 검증**

```
Select-String -Path '...S5-operations.md' -Pattern '^## \d' | Measure-Object | Select-Object Count
# Expected: 9
Select-String -Path '...S5-operations.md' -Pattern '^### S5-F\d' | Measure-Object | Select-Object Count
# Expected: 최소 12개 (12 항목)
```

---

### Task B5: Step 6 — 위키 패치 적용

- [ ] **Step 1: 사전 동기화 재확인**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git pull --rebase origin master
git status
Pop-Location
```

- [ ] **Step 2: E1/E2/D finding 제자리 교체**

§5 finding의 `current_text` → `proposed_text`. S5 영역 §7.1-§7.7 / §8.1-§8.5.

특히 주의:
- §4.1.8/§4.1.9/§5.1.1/§5.4/§5.4.1는 S2a/S3/S4 처리. cross-reference만 추가 가능, 본문 정정 금지.
- §3.x ADR 5건 적용 위치는 §3.1/§3.2/§3.3 본문 박스 또는 §6 신설 ADR 절 (subagent + controller 합의 위치).
- 메모리 [[deploy-mirror-standardization]] PR 세트 인용은 §7.4 본문에서.

- [ ] **Step 3: R 클래스 Deep Dive 부속 서브섹션 삽입**

S1·S2·S3·S4 동일 형식.

- [ ] **Step 4: ADR 5건 적용**

각 ADR 결정에 따라:
- 결정 박스를 해당 § 본문에 삽입 (또는)
- §6 신설 "운영 ADR" 절 신설 (§7과 §8 사이 또는 §8 끝 직후)

controller가 subagent와 함께 위치 결정. 분량이 크면 §6 신설 절 추천.

- [ ] **Step 5: §11 변경 이력 갱신**

```
| v2.3-S5 | 2026-05-28 | Synapse Team | S5 운영/관측성 검증 반영 — E1:a/E2:b/D:c/R:d/OK:e (보고서: documents PR #<TBD>). §7.1 Docker / §7.2 EKS / §7.3 ArgoCD / §7.4 GitHub Actions / §7.5 Cloudflare / §7.6 Istio / §7.7 ECR / §8.1 Prometheus+Grafana / §8.2 Fluent Bit / §8.3 OTel+Jaeger / §8.4 Sentry / §8.5 AlertManager. ADR 5건 결정 정착: §3.1 Gateway JWT·CB / §3.2 Resilience4j Gateway 도입 / §3.3 RedisRateLimiter 플랜별 / §5.2 Redis Cluster 전환 / §5.3 ES vs OpenSearch. 메모리 deploy-mirror-standardization·redis-topology-decision 정합 확인. (구체 변경: subagent 결과 기반) |
```

S4 행 다음에 추가.

- [ ] **Step 6: 패치 검증**

```
(Get-Content C:\workspace\team-project-final\documents.wiki\18_기술_스택_정의서.md | Measure-Object -Line).Lines
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git diff --stat
Pop-Location
```
Expected: 단일 파일 변경.

---

### Task B6: Step 6 — 위키 단일 커밋 + 푸시 + SHA 캡처

- [ ] **Step 1: 커밋 + 푸시 + SHA**

```
Push-Location 'C:\workspace\team-project-final\documents.wiki'
git add -u 18_기술_스택_정의서.md
git commit -m @'
docs(stack): S5 운영/관측성 — context7·repo 검증 반영 + 보강

E1:a · E2:b · D:c · R:d · OK:e
P0:x · P1:y · P2:z

§7.1 Docker / §7.2 EKS / §7.3 ArgoCD / §7.4 GitHub Actions / §7.5 Cloudflare / §7.6 Istio / §7.7 ECR
§8.1 Prometheus+Grafana / §8.2 Fluent Bit / §8.3 OTel+Jaeger / §8.4 Sentry / §8.5 AlertManager

ADR 5건 결정:
- §3.1 Gateway JWT·CircuitBreaker 운영 정책
- §3.2 Resilience4j Gateway 도입 결정
- §3.3 RedisRateLimiter 플랜별 분기 결정
- §5.2 Redis Cluster 전환 트리거
- §5.3 ES vs OpenSearch 결정

메모리 정합 확인:
- deploy-mirror-standardization (W3 reusable workflow + AWS_ROLE_ARN 차단)
- redis-topology-decision (Cluster ADR 결정 정합)

주요 변경:
- (controller가 §5/§7 기반으로 채움)

Refs: documents PR #<TBD>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push origin master
$wikiSha = (git rev-parse HEAD).Trim()
Write-Output "WIKI_SHA=$wikiSha"
Pop-Location
```

- [ ] **Step 2: 보고서 헤더 위키 SHA 기입 + §7 diff 요약**

`Edit`로 헤더 "위키 패치 커밋:" 라인 교체. §7에 git show --stat 기반 diff 요약 표.

---

## Phase C — 보고서 PR + INDEX/HANDOFF v1.2

### Task C1: documents 커밋·푸시·PR 생성

- [ ] **Step 1: INDEX 갱신**

- S5 행: pending → completed, PR(추후 #), 위키 SHA, E1/E2/D/R/OK, P0/P1/P2, 2026-05-28/2026-05-28
- 누적 통계: 6세션 합산 (34 + 12 = 46개 항목 — 또는 위키 정의 기준 ~45 기술 중 다수 처리)
- S5 처리 완료 + S5 → S6 위임 사항 갱신
- 후속 과제 큐: S5 발견 항목 추가
- ADR 5건 결정 사실 §"세션 간 발생한 교차 발견사항"에 기록

- [ ] **Step 2: HANDOFF v1.2 갱신**

- §1 한 줄: 6세션 완료 / 1세션 남음(S6)
- §2 표에 S5 행 추가
- §3 선택지: S6만 남음
- §5 후속 코드 PR 큐: S5 발견 추가 (AWS_ROLE_ARN OIDC provider·ECR `synapse/gateway` 리포 등)
- §8 변경 이력: v1.2 추가

- [ ] **Step 3: 보고서·플랜·INDEX·HANDOFF 스테이징 + 커밋**

```
Push-Location 'C:\workspace\team-project-final\documents'
git add docs/superpowers/specs/2026-05-28-stack-review-S5-operations.md
git add docs/superpowers/specs/2026-05-28-stack-review-INDEX.md
git add docs/superpowers/specs/2026-05-28-stack-review-HANDOFF.md
git add docs/superpowers/plans/2026-05-28-stack-review-S5-operations.md
git status --short
git commit -m @'
docs(stack-review): S5 운영/관측성 보고서

위키 커밋: documents.wiki@<wikiSha>

- S5 보고서 9 섹션 완성 (12 항목 + ADR 5건 결정)
  - 인프라 7개: Docker / EKS / ArgoCD / GitHub Actions / Cloudflare / Istio / ECR
  - 관측성 5개: Prometheus+Grafana / Fluent Bit / OTel+Jaeger / Sentry / AlertManager
  - <N> findings — E1:a · E2:b · D:c · R:d · OK:e
  - P0:x · P1:y · P2:z
- ADR 5건 결정 (S2a/S3/S4 위임 누적 처리):
  - §3.1 Gateway JWT·CB 운영 정책
  - §3.2 Resilience4j Gateway 도입
  - §3.3 RedisRateLimiter 플랜별
  - §5.2 Redis Cluster 전환 트리거
  - §5.3 ES vs OpenSearch 결정
- 메모리 정합 확인:
  - deploy-mirror-standardization (W3 reusable workflow)
  - redis-topology-decision (Cluster ADR)
- INDEX: S5 completed + 누적 통계 갱신
- HANDOFF v1.2: 6세션 완료/1세션 남음(S6)
- S6 위임 (그대로): §6 RAG 절 LangChain 잔존

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
'@
git push -u origin docs/stack-review-S5-operations
Pop-Location
```

- [ ] **Step 4: PR 생성**

S4 패턴 동일. base=main, head=docs/stack-review-S5-operations. body에 ADR 5건 결정 요약 + 신설 절 결정 + 메모리 정합.

---

### Task C2: 위키 §11 PR# 교체 (dual-commit 의도된 예외)

- [ ] **Step 1: §11 행 PR# 기입 + 커밋·푸시**

S1·S2·S3·S4 dual-commit 동일.

---

### Task C3: INDEX/HANDOFF 최종 갱신 + DoD 검증

- [ ] **Step 1: INDEX·HANDOFF S5 행 PR# 링크 기입**
- [ ] **Step 2: 보고서 헤더 PR# 링크 추가**
- [ ] **Step 3: 추가 커밋·푸시** (S4 dual-commit 패턴)
- [ ] **Step 4: DoD 검증 (마스터 스펙 §6.3)**
  - 보고서 9 섹션·모든 finding evidence·patch_target·위키 SHA·PR OPEN·INDEX/HANDOFF 갱신·위임 항목 기록·후속 과제·메모리 갱신 후보
- [ ] **Step 5: 사용자 보고**

```
S5 운영/관측성 세션 완료.
- 보고서 PR: documents#<prNumber>
- 위키 커밋: documents.wiki@<wikiSha>
- 통계: E1:a · E2:b · D:c · R:d · OK:e / P0:x · P1:y · P2:z
- ADR 5건 결정 완료 (S2a/S3/S4 위임 누적 청산)
- 메모리 정합: deploy-mirror-standardization·redis-topology-decision
- 누적: 46/45 기술 검증 (S5까지 6 세션 완료)

다음: S6 외부 API + AI/ML 세션 (마지막)
```

---

## 부록 — 비상 절차

S1·S2·S3·S4 동일.

- **subagent 분량 초과 → BLOCKED**: 인프라/관측성 분할이 이미 적용됨. 더 분할 필요 시 인프라를 §7.1-§7.4 / §7.5-§7.7로 추가 분할 가능.
- **ADR 결정에 비즈니스 컨텍스트 부족**: §6 Deep Dive에 "결정 보류 + 결정 기준 정의 + 차후 결정 시점" 명시. ADR 자체는 미완으로 두되 위키에 "결정 보류 및 보류 사유" 박스 명시.
- **메모리 정합 실패**: `deploy-mirror-standardization` PR 세트가 변경됐을 수 있음. 본 세션 시작 시 GitHub PR 상태 재확인.
- **두 subagent 결과 충돌 (예: 같은 §에 cross-reference)**: controller가 통합 시 §6 통합 절 신설로 해소.

---

## 추정 시간

- Phase A: 10분
- Phase B: 3.5~4시간 (12개 항목 + ADR 5건 결정. 두 subagent 병렬)
- Phase C: 30분

총: ~4.5시간

---

## 변경 이력

| 버전 | 날짜 | 변경 |
|------|------|------|
| v1.0 | 2026-05-28 | S5 운영/관측성 세션 플랜 초안 — 12개 항목 + ADR 5건 결정, Phase B3 두 subagent 병렬, 메모리 2건 정합 검증 핵심 |
