# 18 기술 스택 정의서 검증 — S5 운영/관측성

> 작성일: 2026-05-28 / 검증자: claude-opus-4-8 / 마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
> 대상 위키: documents.wiki/18_기술_스택_정의서.md (S4 후 v2.3-S4 상태, 베이스 SHA `8785252`)
> 위키 패치 커밋: documents.wiki@`dc5b0bd` (8785252..dc5b0bd, master) — 242 insertions / 120 deletions
> 보고서 PR: [documents#12](https://github.com/team-project-final/documents/pull/12)
> 메모리 정합: `deploy-mirror-standardization` · `redis-topology-decision` · `s3-implementation-status`(참조)
> 플랜: `documents/docs/superpowers/plans/2026-05-28-stack-review-S5-operations.md`

---

## 0. 요약 (Summary)

### 0.1 검증 대상

마스터 스펙 §2 매핑 기준 S5 카테고리 12개 항목(인프라 7 + 관측성 5):

**인프라(§7.1–§7.7)**
- §7.1 Docker + Docker Compose
- §7.2 AWS EKS (Kubernetes)
- §7.3 ArgoCD (+ ApplicationSet)
- §7.4 GitHub Actions
- §7.5 Cloudflare
- §7.6 Istio (서비스 메시)
- §7.7 AWS ECR

**관측성(§8.1–§8.5)**
- §8.1 Prometheus + Grafana
- §8.2 Fluent Bit → Promtail + Loki
- §8.3 OpenTelemetry + Jaeger
- §8.4 Sentry
- §8.5 AlertManager + Slack

검증은 **2개 subagent 병렬**(A: 인프라 7, B: 관측성 5)로 수행, controller가 단일 보고서·단일 위키 패치로 통합.

### 0.2 클래스·심각도 통계

| 클래스 | 건수 | 비고 |
|--------|------|------|
| E1 (사실 오류) | **9** | 경로·미배포·제거된 API·미통합 등 |
| E2 (설정/코드 오류) | **9** | version 키·cluster 플래그·base 이미지·마스킹 예제 등 |
| D (표류/불일치) | **6** | 네임스페이스·배포 단위·appset·보존·채널명·PrometheusRule·Outbox 매핑 |
| R (보강 권장) | **2** | non-root/distroless·Enhanced Scanning |
| OK (검증 통과) | **5** | 롤링/HPA·autoSync·WAF·retention·group/inhibit 등 |
| **합계** | **31** | (INFRA 18 + OBS 13) |

| 심각도 | 건수 | 비고 |
|--------|------|------|
| P0 | **0** | — |
| P1 | **19** | 경로·미배포·미구현·제거된 API 등 |
| P2 | **12** | 설정 보강·메모·라벨링 |

### 0.3 ADR 결정 5건 (S2a/S3/S4 위임 누적 청산)

| ADR | 대상 | 결정 | 적용 시점 |
|-----|------|------|----------|
| ADR-S5-1 | §3.1 Gateway JWT·CircuitBreaker | Gateway가 JWT 서명/만료 검증(공통), 서비스가 세분 인가 유지. CB는 ADR-S5-2 통합 | W4 구현 |
| ADR-S5-2 | §3.2 Resilience4j Gateway | 도입 확정, gateway 모듈 한정 timeout + circuit breaker | W4 구현 |
| ADR-S5-3 | §3.3 RedisRateLimiter | RequestRateLimiter + RedisRateLimiter, KeyResolver = userId + plan tier, 플랜별 분기 | W4 구현(ADR-S5-1 선행) |
| ADR-S5-4 | §5.2 Redis Cluster 전환 | standalone 유지, 전환 트리거 = RPS 임계·메모리 70%·HA 요구 중 하나 | 트리거 도달 시 |
| ADR-S5-5 | §5.3 ES vs OpenSearch | **OpenSearch 채택** (이미 프로비저닝·Apache 2.0·AWS Managed·nori) | 결정 즉시 |

5건 모두 위키 신설 **§8.6 운영 ADR** 절에 결정/트레이드오프/적용시점 박스로 기록, §3.1/§3.2/§3.3/§5.2/§5.3 본문에는 cross-reference 추가.

### 0.4 메모리 정합 결과

| 메모리 | 결과 | 상세 |
|--------|------|------|
| `deploy-mirror-standardization` | **CONSISTENT** | §7.4 reusable workflow(deploy-service.yml/mirror-service.yml) PR #8 머지 대기, learning-svc만 caller 전환(모노레포 2-job), AWS_ROLE_ARN/ECR `synapse/gateway`/ECR_REGISTRY 차단 선행조건 — 위키에 현행/목표 구분으로 반영(INFRA-F12·F14·F18) |
| `redis-topology-decision` | **CONSISTENT** | §5.2 standalone 유지·전환 트리거를 ADR-S5-4로 형식화. 메모리의 "운영 트래픽 도달 시 전환"을 RPS·메모리 70%·HA 3트리거로 구체화 |
| `s3-implementation-status` (참조) | **CONSISTENT** | §7.5/§8.x 미구현 항목을 동일한 "적용 현황 (목표 vs 실재)" 박스 형식으로 통일 |

### 0.5 한 줄 결론

S5의 사실 오류(E1 7건)는 **가상 경로·미배포/미구현·제거된 API·미통합**에 집중된다 — §7.3 매니페스트 레포명(`synapse-manifests`→`synapse-gitops`), §7.6 Istio 미배포, §8.3 OTel exporter 제거(`jaeger`→`otlp/jaeger`)·분산추적 미구현, §8.4 Sentry 미통합 등. 운영 로그 스택은 위키의 "Fluent Bit + CloudWatch"와 실제 결정("Promtail + Loki")이 어긋나 **§8.2 절 제목·본문을 전면 정정**했다. 누적 위임 ADR 5건은 **§8.6 운영 ADR 신설 절**에서 일괄 결정해 §3.x/§5.x 본문 정합화했고, 메모리 `deploy-mirror-standardization`·`redis-topology-decision`은 모두 **CONSISTENT**다. 미구현 항목(Prometheus 노출·분산추적·Sentry)은 `[[s3-implementation-status]]`와 동일한 "적용 현황 (목표 vs 실재)" 박스로 목표/실재를 구분해 진실의 단일 출처를 만들었다.

---

## 1. 개요 / 범위 (Scope)

본 세션은 마스터 스펙 §2의 S5(운영/관측성) 카테고리를 다룬다. 인프라 7개 절(§7.1–§7.7)과 관측성 5개 절(§8.1–§8.5)을 **공식 문서(context7 + WebFetch)** 와 **실 코드(`synapse-*` / `synapse-gitops` / `synapse-shared`)** 에 대조하고, 누적된 위임 ADR 5건을 결정한다.

| 범위 | 처리 |
|------|------|
| §7.1~§7.7 인프라 | 검증·정정·보강 (본 세션) |
| §8.1~§8.5 관측성 | 검증·정정·보강 (본 세션) |
| ADR 5건(§3.1/§3.2/§3.3/§5.2/§5.3 위임) | §8.6 운영 ADR 신설 절에서 결정 (본 세션) |
| §4.x/§5.x/§5.4.1 | S2a/S3/S4 처리 영역 — **cross-reference만 추가, 본문 정정 금지** |
| §6 RAG LangChain 잔존 | **S6 위임** (비변경) |

### 1.1 S4 신설 절 영향

S4가 §4.1.9(ShedLock)·§5.4.1(Outbox/Polling Relay)을 신설하면서 라인 번호가 +170 정도 이동했다. 본 세션은 §5.4.1의 Outbox 모니터링 지표 4종을 §8.1 PrometheusRule로 구현하고 §8.5 라우팅에 cross-reference로 연결한다(OBS-F02·F12).

---

## 2. 방법론 (Methodology)

마스터 스펙 §1 6단계 파이프라인 적용. 12개 항목을 2개 자연 카테고리로 분리해 **Phase B3에서 2개 subagent 병렬 dispatch**:

- **subagent A** — 인프라 7개(§7.1–§7.7) + deploy-mirror-standardization 정합
- **subagent B** — 관측성 5개(§8.1–§8.5) + §5.4.1 Outbox 메트릭 정합

각 subagent는 자체 evidence·classification을 처리하고, controller가 `INFRA-F##`/`OBS-F##`를 통합 `S5-F##` 일렬로 재번호하며 통계·메모리 정합·§6 Deep Dive·ADR 5건을 통합한다.

### 2.1 도구 사용

| 단계 | 도구 | 비고 |
|------|------|------|
| Step 2 skill-recommender | 카탈로그 검색 | S1~S4 동일 기준 — verified/marketplace/MCP 채택 0건 |
| Step 3 공식 문서 | **context7** 우선, 매핑 실패 시 **WebFetch** 폴백 | docker/k8s/eks/argocd/github actions/cloudflare/istio/ecr/prometheus/grafana/loki/otel/jaeger/sentry/alertmanager |
| Step 4 실 코드 | Glob/Grep/Read | `synapse-gitops`·`synapse-shared`·`synapse-*` |

---

## 3. 검증 대상 (Targets)

| 절 번호 | 기술 | 라인 범위(베이스 `8785252`) | 1차 진단 |
|---------|------|------------------------------|----------|
| §7.1 | Docker + Docker Compose | L4889–L5004 | `version: '3.9'` obsolete·redis cluster 플래그 오류·단일 base 이미지 단정 의심 |
| §7.2 | AWS EKS | L5006–L5147 | 네임스페이스 prod 중심·11 논리 서비스 표 |
| §7.3 | ArgoCD | L5149–L5245 | 매니페스트 레포명·image-updater 미언급·appset matrix 부정확 의심 |
| §7.4 | GitHub Actions | L5247–L5371 | OIDC 기정사실 서술·gitops 경로·reusable workflow 미반영 의심 |
| §7.5 | Cloudflare | L5373–L5459 | IaC 0건(외부 인프라)·wrangler.toml Workers 포맷 의심 |
| §7.6 | Istio | L5461–L5561 | cert TTL 90일·Istio 미배포 의심 |
| §7.7 | AWS ECR | L5563–L5633 | Enhanced Scanning vs Basic·ECR IaC 0건·gateway 명칭 의심 |
| §8.1 | Prometheus + Grafana | L5640–L5739 | Boot2식 export API·§5.4.1 PrometheusRule 미반영 의심 |
| §8.2 | Fluent Bit + CloudWatch/Loki | L5741–L5826 | 실제 Promtail+Loki·CloudWatch 미채택 의심 |
| §8.3 | OpenTelemetry + Jaeger | L5828–L5921 | `jaeger` exporter 제거·분산추적 미구현 의심 |
| §8.4 | Sentry | L5923–L6021 | Sentry 미통합·fingerprint tag 오류 의심 |
| §8.5 | AlertManager + Slack | L6023–L6133 | 3채널/PagerDuty 서술 vs 단일 receiver 의심 |

---

## 4. 분류 체계 (Taxonomy)

| 클래스 | 정의 |
|--------|------|
| **E1** | 사실 오류 — 경로·버전·존재 여부 등 검증 가능한 사실이 틀림 |
| **E2** | 설정/코드 오류 — 예제 설정·명령·플래그가 동작하지 않거나 비표준 |
| **D** | 표류/불일치 — 위키 ↔ 코드 ↔ runbook 간 값 불일치(둘 다 부분적으로 맞음) |
| **R** | 보강 권장 — 누락된 공식 권고·운영 표준 추가 |
| **OK** | 검증 통과 — 변경 없음(기록만) |

| 심각도 | 정의 |
|--------|------|
| **P0** | 즉시 차단 — 운영 사고 직결 |
| **P1** | 높음 — 잘못된 사실/경로로 작업자가 오도됨 |
| **P2** | 중간 — 보강·메모 수준 |

---

## 5. 발견사항 (Findings)

> 표기 규칙: subagent의 `INFRA-F##`/`OBS-F##`를 통합 `S5-F01~S5-F31` 일렬로 재번호. 괄호에 원 ID 병기.

### S5-F01 / INFRA-F01

```yaml
finding_id: S5-F01
section: "§7.1 Docker + Docker Compose"
class: E2
severity: P1
title: "docker-compose version: '3.9' obsolete (Compose Spec) — version 키 제거 + 'v3 profiles' 표현 정정"
evidence_official: "Compose Spec/Compose v2: top-level version 키는 obsolete, 무시됨. profiles는 Compose Spec 기능."
evidence_repo: "synapse-gitops/docker-compose.yml:1 — version 줄 없음(standalone 구성)."
patch_target: "위키 §7.1 L4904(선택 이유) + L4926(예제 version 줄)"
applied: true
```

### S5-F02 / INFRA-F02

```yaml
finding_id: S5-F02
section: "§7.1 Docker + Docker Compose"
class: E1
severity: P1
title: "redis 예제 --cluster-enabled yes 오류 — 단일 인스턴스 슬롯 미할당(CLUSTERDOWN)"
evidence_official: "Redis Cluster는 슬롯 할당 필요 — 단일 인스턴스에 cluster-enabled yes만 주면 동작 불가."
evidence_repo: "synapse-gitops/docker-compose.yml:56-59 — standalone (--maxmemory 128mb --maxmemory-policy allkeys-lru)."
patch_target: "위키 §7.1 L4946-4948"
applied: true
```

### S5-F03 / INFRA-F03

```yaml
finding_id: S5-F03
section: "§7.1 Docker + Docker Compose"
class: E2
severity: P2
title: "베이스 이미지 단일 '21-jre' 단정 오류 — gateway/platform-svc/FastAPI 분기 + ai-service→learning-ai"
evidence_repo: "gateway=21-jre-alpine, platform-svc=21-jre-jammy, learning-ai=python:3.12-slim."
patch_target: "위키 §7.1 L4899(역할) + L4969(Dockerfile 주석) + 예제 service 명"
applied: true
```

### S5-F04 / INFRA-F04

```yaml
finding_id: S5-F04
section: "§7.1 Docker + Docker Compose"
class: R
severity: P2
title: "distroless·non-root 권고 누락 — platform-svc만 non-root, learning-ai는 root"
evidence_official: "컨테이너 보안 표준: non-root + distroless로 공급망 공격 표면 축소."
evidence_repo: "platform-svc non-root, learning-ai root 실행."
patch_target: "위키 §7.1 기술적 이점 bullet 추가"
applied: true
deep_dive: true
```

### S5-F05 / INFRA-F05

```yaml
finding_id: S5-F05
section: "§7.2 AWS EKS"
class: E2
severity: P1
title: "네임스페이스 prod 중심·dev 누락 — 실제 synapse-{env}, 활성=synapse-dev(자동동기화)"
evidence_repo: "synapse-gitops/.../applicationset.yaml:43 — synapse-dev 자동, staging/prod 수동."
patch_target: "위키 §7.2 L5013"
applied: true
```

### S5-F06 / INFRA-F06

```yaml
finding_id: S5-F06
section: "§7.2 AWS EKS"
class: D
severity: P2
title: "K8s 리소스 표 11개 논리 서비스 vs 실 배포 5런타임+gateway"
evidence_repo: "ADR-001/002 통합 후 platform/engagement/knowledge/learning-card/learning-ai + gateway."
patch_target: "위키 §7.2 L5043-5055 — Spring Modulith 1레포 다모듈 주석"
applied: true
```

### S5-F07 / INFRA-F07

```yaml
finding_id: S5-F07
section: "§7.2 AWS EKS"
class: OK
severity: P2
title: "롤링업데이트 maxSurge/HPA autoscaling/v2/probe 분리 — 정확"
evidence_repo: "maxSurge:1/maxUnavailable:0, HPA v2 averageUtilization, liveness/readiness 분리 정합."
patch_target: "위키 §7.2 L5059-5130 (변경 없음)"
applied: false
```

### S5-F08 / INFRA-F08

```yaml
finding_id: S5-F08
section: "§7.3 ArgoCD"
class: E1
severity: P1
title: "매니페스트 레포 synapse-team/synapse-manifests 오류 → team-project-final/synapse-gitops"
evidence_repo: "synapse-gitops/.../applicationset.yaml:38 — repoURL team-project-final/synapse-gitops."
patch_target: "위키 §7.3 L5155(본문) + L5195(예제 repoURL)"
applied: true
```

### S5-F09 / INFRA-F09

```yaml
finding_id: S5-F09
section: "§7.3 ArgoCD"
class: E2
severity: P1
title: "argocd-image-updater(semver git write-back) 미언급 — dev는 image-updater + 일부 deploy.yml 직접 bump 공존"
evidence_repo: "synapse-gitops/.../applicationset.yaml:29-34 — image-updater 어노테이션."
patch_target: "위키 §7.3 L5156"
applied: true
```

### S5-F10 / INFRA-F10

```yaml
finding_id: S5-F10
section: "§7.3 ArgoCD"
class: D
severity: P1
title: "'단일 ApplicationSet matrix 15개' 부정확 — 실제 환경별 3개 appset 분리, prod automated 없음, gateway 미포함"
evidence_repo: "applicationset*.yaml — dev matrix / staging·prod list."
patch_target: "위키 §7.3 L5231"
applied: true
```

### S5-F11 / INFRA-F11

```yaml
finding_id: S5-F11
section: "§7.3 ArgoCD"
class: OK
severity: P2
title: "autoSync 환경별 정책표 정확"
evidence_repo: "dev true / staging·prod false 정합."
patch_target: "위키 §7.3 L5233-5237 (변경 없음)"
applied: false
```

### S5-F12 / INFRA-F12

```yaml
finding_id: S5-F12
section: "§7.4 GitHub Actions"
class: E1
severity: P1
title: "OIDC 기정사실 서술 vs 실제 gateway deploy.yml은 static key(AWS_ACCESS_KEY_ID/SECRET), AWS_ROLE_ARN 부재"
evidence_repo: "synapse-gateway/.github/workflows/deploy.yml:24-28 — 정적 키 사용."
evidence_memory: "[[deploy-mirror-standardization]] AWS_ROLE_ARN 차단 선행조건."
patch_target: "위키 §7.4 L5263(선택 이유) + L5276(기술적 이점)"
applied: true
```

### S5-F13 / INFRA-F13

```yaml
finding_id: S5-F13
section: "§7.4 GitHub Actions"
class: E1
severity: P1
title: "예제 gitops 경로 오류 — synapse-manifests/overlays/production (dev push가 production bump)"
evidence_repo: "실제 apps/<svc>/overlays/dev/kustomization.yaml + yq newTag bump (synapse-platform-svc deploy.yml:55)."
patch_target: "위키 §7.4 L5335-5341"
applied: true
```

### S5-F14 / INFRA-F14

```yaml
finding_id: S5-F14
section: "§7.4 GitHub Actions"
class: D
severity: P1
title: "reusable workflow 표준 미반영 — synapse-shared deploy-service.yml/mirror-service.yml 부재(PR#8 머지대기), learning-svc만 caller 전환"
evidence_memory: "[[deploy-mirror-standardization]] W3 reusable workflow PR 세트."
patch_target: "위키 §7.4 폴리레포 워크플로 절에 Reusable Workflow 표준화 소절 추가"
applied: true
```

### S5-F15 / INFRA-F15

```yaml
finding_id: S5-F15
section: "§7.5 Cloudflare"
class: E2
severity: P2
title: "Cloudflare IaC 0건=외부 인프라(대시보드). wrangler.toml은 Workers 포맷(Pages는 _headers). Pages 자동배포=계획"
evidence_repo: "synapse-gitops Cloudflare manifest 0건."
patch_target: "위키 §7.5 개요 외부 인프라 박스 + 예제 _headers 정정"
applied: true
```

### S5-F16 / INFRA-F16

```yaml
finding_id: S5-F16
section: "§7.5 Cloudflare"
class: OK
severity: P2
title: "WAF OWASP / L3-7 DDoS / TLS 1.3 Full(Strict) / PoP — 정확"
evidence_official: "Cloudflare WAF·DDoS·TLS 표준 정합(F15 외부 인프라 라벨 병기)."
patch_target: "위키 §7.5 L5378-5407 (변경 없음)"
applied: false
```

### S5-F17 / INFRA-F17

```yaml
finding_id: S5-F17
section: "§7.6 Istio"
class: E1
severity: P1
title: "(1) 워크로드 cert TTL '90일' 오류→기본 24h (istiod root CA 혼동), (2) Istio 미배포(manifest 0건)"
evidence_official: "Istio 워크로드 인증서 기본 TTL 24h, root CA는 장기."
evidence_repo: "synapse-gitops Istio manifest 0건."
patch_target: "위키 §7.6 개요 미배포 박스 + L5492 TTL 정정"
applied: true
```

### S5-F18 / INFRA-F18

```yaml
finding_id: S5-F18
section: "§7.7 AWS ECR"
class: R
severity: P1
title: "Enhanced Scanning은 레지스트리 단위(put-registry-scanning-configuration/Inspector), scanOnPush=true는 Basic. ECR IaC 0건, gateway 명칭 불일치"
evidence_official: "ECR Enhanced Scanning = registry-level + Inspector; scanOnPush = Basic(repo-level)."
evidence_repo: "ECR 리포 IaC 0건, synapse-gateway vs synapse/gateway 표기 불일치."
evidence_memory: "[[deploy-mirror-standardization]] ECR synapse/gateway 신규 필요."
patch_target: "위키 §7.7 역할 박스 + 예제 주석"
applied: true
deep_dive: true
```

### S5-F19 / OBS-F01

```yaml
finding_id: S5-F19
section: "§8.1 Prometheus + Grafana"
class: E2
severity: P1
title: "Boot2식 management.metrics.export.prometheus.enabled 제거됨. micrometer-registry-prometheus 의존성 + exposure 필요 (현재 5서비스 미설정 → /actuator/prometheus 404)"
evidence_official: "Boot 3+에서 management.prometheus.metrics.export.* 로 이동, 의존성 클래스패스 기반 자동 노출."
evidence_repo: "5 Spring 런타임 micrometer-registry-prometheus 미설정 → 404."
patch_target: "위키 §8.1 L5695-5704 예제 정정 + 적용 현황 박스"
applied: true
```

### S5-F20 / OBS-F02

```yaml
finding_id: S5-F20
section: "§8.1 Prometheus + Grafana"
class: D
severity: P1
title: "§5.4.1 Outbox 4개 메트릭이 PrometheusRule로 미반영"
evidence_repo: "§5.4.1 모니터링 지표 표 vs §8.1 PrometheusRule 부재."
patch_target: "위키 §8.1 PrometheusRule 블록 추가(OutboxBacklogHigh/PublishLatency/FailedSpike/RelayKafkaErrors) + §5.4.1 cross-ref"
applied: true
```

### S5-F21 / OBS-F03

```yaml
finding_id: S5-F21
section: "§8.1 Prometheus + Grafana"
class: OK
severity: P2
title: "kube-prometheus-stack / retention 15d / SLO PromQL — 정확"
patch_target: "위키 §8.1 (변경 없음)"
applied: false
```

### S5-F22 / OBS-F04

```yaml
finding_id: S5-F22
section: "§8.2 Fluent Bit → Promtail + Loki"
class: E1
severity: P1
title: "'Fluent Bit + CloudWatch' → 실제 Promtail + Loki(Step8 결정). Fluent Bit 0건, CloudWatch 미채택"
evidence_repo: "Promtail+Loki 결정, Fluent Bit 구성 0건, CloudWatch 로그 destination 미채택."
patch_target: "위키 §8.2 제목·개요·역할·대안표·예제·트러블슈팅·참고 전반 정정"
applied: true
```

### S5-F23 / OBS-F05

```yaml
finding_id: S5-F23
section: "§8.2 Fluent Bit → Promtail + Loki"
class: E2
severity: P2
title: "Fluent Bit modify Set 마스킹 예제 오류(없는 필드 주입) — F22 정정 시 삭제"
evidence_official: "Fluent Bit modify Set은 필드 신규 주입 — 마스킹 동작 아님."
patch_target: "위키 §8.2 L5786-5790 삭제 + logback 마스킹으로 이관 명시"
applied: true
```

### S5-F24 / OBS-F06

```yaml
finding_id: S5-F24
section: "§8.2 Fluent Bit → Promtail + Loki"
class: E2
severity: P2
title: "로그 보존 INFO30/ERROR90/AUDIT1y 미구현. 실제 Loki 720h(30일), runbook 7일 불일치"
evidence_repo: "Loki limits_config.retention_period 720h 단일."
patch_target: "위키 §8.2 로그 보존 소절 추가(Loki 30일, 등급별 차등=목표)"
applied: true
```

### S5-F25 / OBS-F07

```yaml
finding_id: S5-F25
section: "§8.3 OpenTelemetry + Jaeger"
class: E1
severity: P1
title: "jaeger exporter(14250) 제거됨 → otlp/jaeger(4317)"
evidence_official: "OTel Collector에서 jaeger exporter 제거, Jaeger는 OTLP 네이티브 수신(4317)."
patch_target: "위키 §8.3 L5871-5879 예제 교체"
applied: true
```

### S5-F26 / OBS-F08

```yaml
finding_id: S5-F26
section: "§8.3 OpenTelemetry + Jaeger"
class: D
severity: P1
title: "분산추적 실코드 전무(management.tracing/otel 의존성 0) — 적용 현황 미구현(목표), W4+ 도입"
evidence_repo: "어느 서비스도 management.tracing/OTel 의존성 없음, learning-ai pyproject.toml opentelemetry-* 0건."
patch_target: "위키 §8.3 적용 현황 박스 신설"
applied: true
```

### S5-F27 / OBS-F09

```yaml
finding_id: S5-F27
section: "§8.4 Sentry"
class: E1
severity: P1
title: "Sentry 어느 레포도 미통합(sentry_flutter/sentry-spring/sentry-sdk 0) — 적용 현황 미구현(목표)"
evidence_repo: "sentry_flutter / sentry-spring-boot-starter / sentry-sdk 의존성 0건, SENTRY_DSN 미설정."
patch_target: "위키 §8.4 적용 현황 박스 신설"
applied: true
```

### S5-F28 / OBS-F10

```yaml
finding_id: S5-F28
section: "§8.4 Sentry"
class: E2
severity: P2
title: "set_tag('fingerprint',...) 오류 — fingerprint는 tag 아님(scope.fingerprint)"
evidence_official: "Sentry fingerprint는 scope.fingerprint 또는 event['fingerprint'], tag 아님."
patch_target: "위키 §8.4 L6012 트러블슈팅 정정"
applied: true
```

### S5-F29 / OBS-F11

```yaml
finding_id: S5-F29
section: "§8.5 AlertManager + Slack"
class: E1
severity: P1
title: "3채널(#alert-*)+PagerDuty 서술 vs 실제 단일 receiver slack→#synapse-gitops (severity=~critical|warning). 채널명 3중 불일치"
evidence_repo: "alertmanager.yml 단일 receiver #synapse-gitops; 위키↔runbook(#synapse-alerts)↔실(#synapse-gitops) 불일치."
patch_target: "위키 §8.5 역할 본문 + 예제 정정 (채널분리·PagerDuty=목표 W4+)"
applied: true
```

### S5-F30 / OBS-F12

```yaml
finding_id: S5-F30
section: "§8.5 AlertManager + Slack"
class: D
severity: P1
title: "§5.4.1 Outbox 알람이 §8.5 라우팅에 미매핑(단 severity 라벨로 호환 가능)"
evidence_repo: "§5.4.1 알람 severity 라벨로 현 라우팅(severity=~critical|warning) 호환."
patch_target: "위키 §8.5 cross-reference 추가 + §5.4.1 매핑 명시"
applied: true
```

### S5-F31 / OBS-F13

```yaml
finding_id: S5-F31
section: "§8.5 AlertManager + Slack"
class: OK
severity: P2
title: "group_wait/group_interval/repeat_interval/inhibit_rules/send_resolved — 정확"
patch_target: "위키 §8.5 (변경 없음)"
applied: false
```

---

## 6. "더 깊이 / Deep Dive" 보강 항목 일람

본 세션은 R 클래스 보강 + **위임 ADR 5건 결정**을 함께 다룬다. R 클래스는 해당 절 본문에 보강하고, ADR 5건은 분량이 커 위키 **신설 §8.6 운영 ADR** 절(§8 끝 직후)로 분리했다.

### 6.1 R 클래스 보강

#### 6.1.1 §7.1 non-root / distroless (S5-F04)
컨테이너 공급망 공격 표면 축소를 위해 non-root 실행 + 슬림 베이스를 권고한다. platform-svc 계열은 이미 non-root지만 `learning-ai`는 root 실행이므로 `USER appuser` + distroless/`-jre-jammy` 권고를 §7.1 기술적 이점에 명시했다.

#### 6.1.2 §7.7 ECR Enhanced Scanning (S5-F18)
`scanOnPush=true`는 Basic Scanning이고 Enhanced Scanning(Amazon Inspector)은 **레지스트리 단위**(`put-registry-scanning-configuration`) 설정이다. 또한 ECR 리포 IaC가 0건이고 gateway 명칭(`synapse-gateway` 레포 ↔ `synapse/gateway` ECR 경로)이 불일치하므로, 예제 주석으로 Enhanced 설정 명령과 명칭 통일 필요를 명시했다.

> R 클래스는 위 2건(F04·F18)이다. §8.1 PrometheusRule 신설(S5-F20)·§8.5 Outbox 라우팅 매핑(S5-F30)은 §5.4.1 표준을 §8로 확장하는 보강 성격을 겸하나, 분류상 D(표류/불일치)로 집계한다.

### 6.2 운영 ADR 5건 결정 (위키 §8.6 신설 절)

#### ADR-S5-1 — Gateway JWT 검증·CircuitBreaker 정책 (§3.1 위임)
- **결정**: Gateway가 JWT 서명/만료 검증(공통)을 수행하고, 서비스는 세분 인가(권한·소유권)를 유지한다. Gateway 레벨 CircuitBreaker는 ADR-S5-2로 통합.
- **트레이드오프**: Gateway 공통 검증으로 서비스 중복 토큰 파싱 제거 + Gateway SPOF는 멀티 인스턴스 + Resilience4j(ADR-S5-2)로 보완. 세분 인가까지 Gateway에 두면 도메인 결합 과해져 서비스에 남김.
- **적용 시점**: 현재 미구현 → **W4 구현 목표**.

#### ADR-S5-2 — Resilience4j Gateway 도입 (§3.2 위임)
- **결정**: 도입 확정. `synapse-gateway` 모듈 한정으로 다운스트림 호출에 timeout + circuit breaker(`spring-cloud-circuitbreaker-resilience4j`) 적용.
- **트레이드오프**: Gateway 한정으로 폭발 반경·설정 단순. Istio outlierDetection(§7.6)과 역할 겹칠 수 있으나 Istio 미배포 동안 Gateway가 1차 방어.
- **적용 시점**: **W4 구현**.

#### ADR-S5-3 — RedisRateLimiter 플랜별 분기 (§3.3 위임)
- **결정**: `RequestRateLimiter` + `RedisRateLimiter`, KeyResolver = `userId + plan tier`. `free`/`pro`/`enterprise`별 `replenishRate`/`burstCapacity` 분기.
- **트레이드오프**: plan tier를 키에 포함하면 플랜 변경 즉시 반영, plan 정보는 JWT claim 의존(ADR-S5-1 선행). 현재 단일 `RedisRateLimiter(1,60,1)`.
- **적용 시점**: **W4 구현**(ADR-S5-1 선행).

#### ADR-S5-4 — Redis Cluster 전환 트리거 (§5.2 위임)
- **결정**: 현재 standalone 유지. 전환 트리거 = (1) 지속 RPS 임계 도달, (2) 메모리 사용률 70% 초과, (3) HA 요구 발생 중 **하나라도** 충족 시 Cluster 전환.
- **트레이드오프**: standalone은 운영 단순·현 트래픽 충분. Cluster는 샤딩/HA를 주나 클라이언트 복잡도·멀티키 제약·운영 부담 증가. 메모리 [[redis-topology-decision]] 형식화.
- **적용 시점**: 트리거 도달 시. 현재 미도달.

#### ADR-S5-5 — ES vs OpenSearch (§5.3 위임)
- **결정**: **OpenSearch 채택**.
- **근거**: (1) 인프라가 이미 OpenSearch 2.11 프로비저닝, (2) Apache 2.0 라이선스(Elastic SSPL 회피), (3) AWS Managed Service(OpenSearch Service) 네이티브, (4) nori 한국어 분석기 지원. 단점(ES 8 신기능 fast-follow 지연)은 Synapse 사용 API 표면(BM25+nori+multi_match)에 영향 없음.
- **적용 시점**: 결정 즉시. §5.3 OpenSearch 기준 정렬(클라이언트는 ES 8 Java Client 호환 유지).

---

## 7. 위키 패치 diff 요약

**커밋**: `<controller가 기입>`
**변경 통계**: `git diff --stat` 기반 — `<controller가 채움>`

### 7.1 finding ↔ 위키 패치 위치 매핑

| finding_id | class | 위키 패치 위치 | 변경 형태 |
|------------|-------|----------------|-----------|
| S5-F01 | E2 | §7.1 선택 이유 + 예제 | version 키 제거 + "Compose profiles" |
| S5-F02 | E1 | §7.1 redis 예제 | cluster 플래그 제거 → standalone command |
| S5-F03 | E2 | §7.1 역할 + Dockerfile 주석 | base 이미지 분기 + ai-service→learning-ai |
| S5-F04 | R | §7.1 기술적 이점 | non-root/distroless bullet 추가 |
| S5-F05 | E2 | §7.2 역할 | synapse-{env} + dev 활성 |
| S5-F06 | D | §7.2 리소스 표 | 5런타임+gateway 주석 박스 |
| S5-F07 | OK | §7.2 | 변경 없음 |
| S5-F08 | E1 | §7.3 역할 + 예제 repoURL | synapse-gitops 치환 |
| S5-F09 | E2 | §7.3 역할 | argocd-image-updater 언급 |
| S5-F10 | D | §7.3 ApplicationSet | 환경별 3 appset 박스 |
| S5-F11 | OK | §7.3 | 변경 없음 |
| S5-F12 | E1 | §7.4 선택 이유 + 기술적 이점 | OIDC 현행/목표 구분 |
| S5-F13 | E1 | §7.4 예제 | gitops 경로 정정 + yq bump |
| S5-F14 | D | §7.4 폴리레포 워크플로 | Reusable Workflow 표준화 소절 |
| S5-F15 | E2 | §7.5 개요 + 예제 | 외부 인프라 박스 + _headers |
| S5-F16 | OK | §7.5 | 변경 없음 |
| S5-F17 | E1 | §7.6 개요 + 기술적 이점 | 미배포 박스 + cert TTL 24h |
| S5-F18 | R | §7.7 역할 + 예제 | Enhanced/Basic 구분 + 명칭 주석 |
| S5-F19 | E2 | §8.1 예제 + 적용 현황 박스 | export API 정정 + 404 박스 |
| S5-F20 | D | §8.1 PrometheusRule 블록 | Outbox 4 알람 + cross-ref |
| S5-F21 | OK | §8.1 | 변경 없음 |
| S5-F22 | E1 | §8.2 전반 | Promtail+Loki 전면 정정 |
| S5-F23 | E2 | §8.2 예제 | 마스킹 예제 삭제 → logback 이관 |
| S5-F24 | E2 | §8.2 로그 보존 | Loki 30일 단일 + 차등=목표 |
| S5-F25 | E1 | §8.3 예제 | jaeger→otlp/jaeger(4317) |
| S5-F26 | D | §8.3 적용 현황 박스 | 분산추적 미구현(목표) |
| S5-F27 | E1 | §8.4 적용 현황 박스 | Sentry 미통합(목표) |
| S5-F28 | E2 | §8.4 트러블슈팅 | scope.fingerprint 정정 |
| S5-F29 | E1 | §8.5 역할 + 예제 | 단일 receiver #synapse-gitops |
| S5-F30 | D | §8.5 cross-ref | §5.4.1 Outbox 매핑 |
| S5-F31 | OK | §8.5 | 변경 없음 |
| (신설) §8.6 | — | §8 끝 직후 | 운영 ADR 5건 절 신설 |
| §3.1/§3.2/§3.3/§5.2/§5.3 | — | 각 절 머리 | ADR cross-reference 추가 |
| §11 변경 이력 | — | v2.3-S4 다음 | v2.3-S5 행 추가 |

### 7.2 라인 변동

- §8.6 운영 ADR 신설로 §9 이하 라인 이동
- §8.1 PrometheusRule 블록·§8.2 Promtail 재작성으로 §8 내부 증분
- 정정 패치 다수(본문 교체)
- **위키 최종 라인 수: `7014`** (S4 베이스 6135 → +879, §8.6 ADR 신설·PrometheusRule·Promtail 재작성 포함)

---

## 8. 후속 과제 (Follow-ups)

### 8.1 본 세션 처리 완료
- 인프라 7개 정정·보강(INFRA-F01~F18): version 키·cluster 플래그·base 이미지·non-root·네임스페이스·리소스표·매니페스트 레포명·image-updater·appset·OIDC 현행/목표·gitops 경로·reusable workflow·Cloudflare 외부 인프라·Istio 미배포·cert TTL·Enhanced Scanning
- 관측성 5개 정정·보강(OBS-F01~F13): Prometheus export API·PrometheusRule·Promtail+Loki 전환·마스킹·보존·OTel exporter·분산추적 미구현·Sentry 미통합·fingerprint·단일 receiver·Outbox 라우팅 매핑
- 운영 ADR 5건 결정(§8.6 신설) + §3.x/§5.x cross-reference
- 메모리 deploy-mirror-standardization·redis-topology-decision 정합 확인

### 8.2 S6 외부/AI 세션 위임 (그대로 유지)
- §6 RAG 절 LangChain 잔존 언급 일괄 정정(S2a §4.2.4 Direct SDK 패턴과 일관)

### 8.3 별도 코드 PR 후속 (deploy-mirror-standardization Phase 4 의존)
- **(P1)** `synapse-shared` reusable workflow(deploy-service.yml/mirror-service.yml) PR #8 머지 + 나머지 서비스 caller 전환 (INFRA-F14)
- **(P1)** `AWS_ROLE_ARN`(OIDC deploy role) 생성 → gateway deploy.yml 정적 키 → OIDC 전환 (INFRA-F12)
- **(P1)** ECR `synapse/gateway` 리포 신규 생성 + `ECR_REGISTRY` 시크릿 등록 (INFRA-F18)
- **(P1)** 5 Spring 런타임 `micrometer-registry-prometheus` 의존성 + exposure 추가 → /actuator/prometheus 노출 (OBS-F01)
- **(P1)** §8.1 PrometheusRule(Outbox 4 알람) 매니페스트 추가 (OBS-F02)
- **(P2)** 분산추적(OTel) W4+ 도입 (OBS-F08), Sentry SDK W4+ 통합 (OBS-F09)
- **(P2)** AlertManager 채널 3분리 + PagerDuty 에스컬레이션 (OBS-F11)
- (유지) S4·S3·S2a 후속 코드 PR 큐(Avro 1.11.3 정렬·Modulith 2.0.6·outbox_event 마이그레이션·S3 AttachmentService 등)

### 8.4 별도 결정 사항
- (신규) Istio 도입 시점 ADR — 현재 미배포, 운영 트래픽·멀티서비스 메시 요구 발생 시
- (신규) Loki 등급별 차등 보존(감사 로그 1년 장기 보관소 이관) 결정

### 8.5 v2.3 통합 정리 작업 (6 세션 종료 후)
- §10.1 요약표·§12.4 인프라 버전 매트릭스에 S5 변경 반영(Promtail+Loki·OpenSearch 확정·Istio 미배포)
- §1.4 기술 스택 전체 목록 표 S5 정정 반영

### 8.6 메모리 갱신 후보
- ✅ `deploy-mirror-standardization` — 본 세션 정합 확인. PR #8 머지·AWS_ROLE_ARN 생성 시 갱신.
- ✅ `redis-topology-decision` — ADR-S5-4로 전환 트리거 형식화. 추가 갱신 불필요.
- **(신규 검토)** `observability-stack-promtail-loki` — §8.2 Promtail+Loki 결정·Loki 30일 보존·로그 마스킹 logback 위치가 메모리화할 표준. W4 구현 정착 시 검토.
- **(신규 검토)** `operations-adr-s5` — ADR 5건 결정(Gateway JWT·Resilience4j·RateLimiter·Redis Cluster·OpenSearch) 정착 시 메모리화 검토.

---

## 부록 (Appendix)

### 9.1 subagent 통합 매핑

| subagent | 원 ID 범위 | 통합 ID 범위 | 건수 |
|----------|-----------|--------------|------|
| A (인프라) | INFRA-F01~F18 | S5-F01~S5-F18 | 18 |
| B (관측성) | OBS-F01~F13 | S5-F19~S5-F31 | 13 |

### 9.2 클래스 분포(원 데이터)

- 인프라: E1 5 / E2 5 / D 3 / R 2 / OK 3 = 18
- 관측성: E1 4 / E2 4 / D 3 / R 0 / OK 2 = 13
- **합계: E1:9 / E2:9 / D:6 / R:2 / OK:5 = 31** — §0.2 요약 통계는 위 per-finding 1차 분류 합계와 정확히 일치한다(인프라 5/5/3/2/3 + 관측성 4/4/3/0/2).
- 심각도 합계: P0:0 / P1:19 / P2:12 = 31.

### 9.3 미구현 "적용 현황 (목표 vs 실재)" 박스 통일 항목

| 절 | 항목 | 실재 | 목표 |
|----|------|------|------|
| §8.1 | /actuator/prometheus | 5서비스 404(의존성 미설정) | W4 노출 |
| §8.3 | 분산추적 | OTel 의존성 0 | W4+ 도입 |
| §8.4 | Sentry | SDK/DSN 0 | W4+ 통합 |
| §7.5 | Cloudflare | 대시보드 수동(IaC 0) | Pages 자동배포 계획 |
| §7.6 | Istio | manifest 0(미배포) | 목표 아키텍처 |

모두 `[[s3-implementation-status]]`와 동일한 "목표 형태 문서" 패턴.

### 9.4 참조
- 메모리: `deploy-mirror-standardization` · `redis-topology-decision` · `s3-implementation-status`
- S4 보고서: `documents/docs/superpowers/specs/2026-05-28-stack-review-S4-event-sync.md` (§5.4.1 Outbox 메트릭 단일 출처)
- 위키 §8.6 운영 ADR (본 세션 신설)
