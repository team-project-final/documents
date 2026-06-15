# SYNAPSE 개인 회고 — 일정별 (velka)

- **생성일**: 2026-05-26
- **최종 업데이트**: 2026-06-15 (06-12 직접 작업 잔여를 5주차 4회에 통합 — JWT 공개키 단일출처화 #196·검색 인덱싱 3중 단절 #198·메모리 이중합산 오탐 #194·bastion 레이스+ECR IaC #182·ServiceMonitor 오탐 #207·destroy 선정리 3건·gateway prometheus 노출 #7·compose 서비스별 DB initdb #75를 #199와 함께 반영, 5주차 4회 제목·범위 확장)
- **직전 업데이트**: 2026-06-12 (06-09~06-11 W5 실 통합·라이브 검증·안정화 구간을 주차 5로 추가 — 실 EKS dev+staging 16/16 Healthy·ES nori 실기동·bring-up 견고화·Avro 정본 분기 P0/DLT·actuator 401 CrashLoop·learning-ai Kafka SSL·frontend deploy 재발산 방지·W3/W4/W5 마감 + D-043 사인오프·24h 소크 + 06-12 #199 dev·staging 토픽 환경 프리픽스 격리(주차 5 5주차 4회 추가))
- **이전 업데이트**: 2026-06-08 (05-30~06-08 운영 점검·감사·표준화 구간을 주차 4로 추가)
- **저자(본인) 별칭**: velka, Qahnaarin, Velkaressia, VelkaressiaBlutkrone (모두 동일 인물, `deepestdark@gmail.com`)
- **구성**: 실제 커밋 일정(2026-05-09~05-29)을 **주차별 → 주당 3~4회 세션**으로 나눠, 세션마다 What/Why/Problem/Solution/회고 표 1개. 05-30~06-08 구간(주차 4)은 [[repo-edit-scope-policy]]에 따라 직접 작업을 gitops·shared·gateway + 문서로 한정하고 서비스 변경은 이슈로 위임한 **운영 점검·표준화** 성격이라 커밋 수보다 산출물(보고서·표준·이슈) 중심으로 기술
- **내 커밋 총계**: 약 1,129건 (--all 전수 기준, 2026-05-29 재집계 / 주차 4는 재집계 미수행)
- **관련 문서**: [주제별](./SYNAPSE_개인회고_주제별_velka.md) · [레포별 상세](./SYNAPSE_개인회고_velka.md) · [아키텍처 현황 보고서(06-08)](./docs/synapse-architecture-status-2026-06-08.md)

## 전체 요약

실 작업은 약 3주(2026-05-09~05-29)에 집중되어 **① 착수 주(5/9~5/16) → ② 집중 개발 주(5/18~5/22) → ③ 마무리·검증·온보딩 단계(5/26~5/29)** 세 단계로 진행됐다. 착수 주에는 프로토타입·문서/PM 체계·폴리레포 부트스트랩 같은 기반을, 집중 주에는 백엔드 골격(svc-template·gateway·shared)·프론트(frontend 52화면·flow-simulator)·대시보드 스킬화를, 마무리 주에는 GitOps staging 승격과 관측·bring-up 자동화를 완성했다. 마무리 단계(5/26~5/29)는 더 나아가 **W4 synapse-prod 거버넌스 레이어 도입과 bring-up 실 EKS 라이브 검증(9건 A2 환류), 18 기술 스택 정의서 6세션 사실검증과 위키 v2.3 통합 마감, 4개 백엔드 서비스 application.yml/JWT 표준화·dev-smoke CI, 그리고 신입용 synapse-onboarding 신규 포털 구축**으로 확장됐다. 매 세션에 spec→plan→구현 흐름과 FINDING/D-0xx 이슈 번호화가 일관됐고, 백엔드 Dockerfile Revert→재작성·모바일 CSS 연속 fix·gh-pages 배포 실패 같은 시행착오가 시간대별로 반복 등장한다.

이후 **④ 운영 점검·감사·표준화 구간(주차 4, 5/30~6/8)** 에서는 만드는 일에서 **점검·표준화·정합 검증**으로 무게가 옮겨갔다. [[repo-edit-scope-policy]]에 따라 직접 작업은 gitops·shared·gateway + 문서로 한정하고 서비스 레포 변경은 GitHub 이슈로 위임하면서, **Kafka 4서비스 감사(소비측 부재·CI 계약검증 부재·버전 드리프트 발견)**, **Kafka TLS MSK env-only 미배선 갭과 knowledge OpenSearch↔ES 이중 불일치 조사**, **gitops Kafka SSL Phase 2/3·OpenSearch→인클러스터 ES 9.2.1 전환(D-003)**, **Flyway 타임스탬프 버전 표준 + CI 가드(`flyway_guard.py`) 수립**, **deploy/mirror reusable 표준화 마감(G8)**, 그리고 이 모두를 origin 기준으로 재판정한 **2026-06-08 아키텍처 현황 보고서(간극 G1~G8: 해소 3·진행 4·미해결 1)** 와 **main 직행 PR 4건 dev 재타겟·충돌 위임**을 수행했다. 이 구간의 일관된 교훈은 "상태 단언은 `git fetch` 후 origin 기준", "env 주입≠앱 배선", "표준은 문서가 아니라 CI 가드로 강제"였다.

마지막으로 **⑤ 실 통합·라이브 검증·안정화 구간(주차 5, 6/9~6/11)** 에서는 감사·위임으로 식별만 해 둔 간극을 **실 EKS에 올려 닫는** 작업으로 무게가 옮겨갔다. 이 구간에서 velka의 역할이 **감사·위임자**에서 **실 EKS/staging 통합 오너 + 크로스커팅 계약/배포 통합자**로 넓어져, 위임만으로 닫히지 않는 **통합 차단(release-blocking) 결함**은 서비스 레포(engagement/learning/frontend)도 직접 수정했다. 핵심 산출은 ① **gitops 실 EKS dev+staging 통합** — ES(nori 커스텀 이미지) 실기동·`es-reindex`/`kafka-topics`/`db-init` bring-up phase·견고화(Windows 경로·orphan LB·psql `\gexec`·ruleset 레이스), 관측 W3 Step8 마감, **dev 9/9 + staging 7/7 → 16/16 Healthy + 24h 소크 진입**, ② **shared W5 일일 staging/통합 리포트·핸드오프 + nori ES ECR 이미지 빌드 + node20→24 액션 + platform#87 DLT 가설 A 입증**, ③ **크로스커팅 직접 수정** — Avro writer 정본 분기 P0(engagement#32 `UserRegistered`·learning#64 `NotificationSend`)·learning-ai Kafka SSL `ssl_context`(#67)·actuator 하위경로 401 CrashLoop(engagement#44)·JWT subject 결정적 도출(#33)·**frontend deploy semver 통일로 main↔dev 재발산 방지(#54~#56, G7 해소)**, ④ **W3/W4/W5 문서 마감 + 실도메인 nip.io 임시완결 + D-043 사인오프(velka 겸임)**. 06-08 G1~G8 대비 **G7(frontend 발산) 해소**, G4(버전 드리프트)는 Avro 정본 정렬로 DLT 근본수정, G6(ES)·G1(Kafka TLS)은 실 EKS 기동으로 검증 진전. 일관된 교훈은 "계약은 토픽 네이밍이 아니라 writer 스키마 정본까지", "헬스 프로브는 하위경로까지 permit", "라이브 EKS 레이스는 실기동으로만 잡힘", "배포 태그는 SHA로 핀", "release-blocker는 위임 말고 직접 통합"이었다. 이어 (6/12) **dev·staging 공유 MSK 이벤트 누수**를 **토픽 환경 프리픽스(#199, 옵션 B)** 로 격리하며 — 인프라(gitops#206·shared#72) 직접, 앱은 서비스 이슈 위임 — 한 클러스터 멀티환경 격리를 닫았다(5주차 4회). 같은 날(데모/녹화 직전 라이브 마감일) #174 풀 E2E 추적에서 드러난 통합 차단·관측 오탐·destroy 갭도 인프라 측에서 직접 닫았다 — **JWT 공개키 단일출처화(#196)·검색 인덱싱 3중 단절(#198)·메모리 cAdvisor 이중합산 오탐(#194)·bastion cloud-init 레이스+ECR IaC 분리(#182)·ServiceMonitor 비-Spring 3종 제외(#207)·destroy 선정리 갭 3건**, 그리고 **gateway Boot 4.0 prometheus 노출(#7)**·**shared 로컬 compose 서비스별 DB initdb(#75)**. 즉 마지막 날은 한 주제가 아니라 인증·검색·관측·IaC·격리를 가로지르는 **실 통합 오너십**이었다.

## 목차

- **주차 1 (5/9~5/16) — 착수·기반 구축**: [1회](#1주차-1회-5950--프로토타입--위키-착수) · [2회](#1주차-2회-511512--pm-문서체계--폴리레포-부트스트랩) · [3회](#1주차-3회-513514--컨벤션가이드-사이트--gitops-착수) · [4회](#1주차-4회-515516--위키-정합--eksargocd-부트스트랩)
- **주차 2 (5/18~5/22) — 집중 개발**: [1회](#2주차-1회-518--런북-사이트--대시보드-파이프라인) · [2회](#2주차-2회-519--svc-template-골격sb4--gateway--shared) · [3회](#2주차-3회-520--서비스-dockerfile--flow-simulator--대시보드-스킬화) · [4회](#2주차-4회-521522--ux완성--frontend-52화면--핸드오프)
- **주차 3 (5/26~5/29) — 마무리·검증·온보딩**: [1회](#3주차-1회-526--로컬-msa-실행-경로--온보딩) · [2회](#3주차-2회-526--w3-staging-승격--관측--bring-up-자동화) · [3회](#3주차-3회-527--백엔드-표준화--온보딩-포털--reusable-워크플로) · [4회](#3주차-4회-528529--w4-prod-거버넌스--기술스택-6세션-검증-v23)
- **주차 4 (5/30~6/8) — 운영 점검·감사·표준화**: [1회](#4주차-1회-6264--kafka-4서비스-감사--tls-msk-갭es-불일치-조사) · [2회](#4주차-2회-65--gitops-kafka-sslphase-23--es-전환d-003--flyway-표준ci-가드) · [3회](#4주차-3회-68--아키텍처-현황-보고서--deploymirror-표준화-마감--main-직행-pr-정리)
- **주차 5 (6/9~6/12) — 실 통합·라이브 검증·안정화**: [1회](#5주차-1회-69--통합-차단-결함-직접-수정-avro-정본jwtssl) · [2회](#5주차-2회-610--actuator-401-crashloop--ruleset-레이스--dlt-가설-a--관측-마감) · [3회](#5주차-3회-611--es-nori-실기동--bringup-견고화--frontend-재발산-방지--163016--24h-소크) · [4회](#5주차-4회-612--공유-msk-토픽-격리와-인증-검색-관측-인프라-직접-수정)

---

## 주차 1 (5/9~5/16) — 착수·기반 구축

### 1주차 1회 (5/9~5/10) — 프로토타입 + 위키 착수
> 활동 레포: synapse-prototype(주력) · documents · documents.wiki  ·  주말 집중

| 항목 | 내용 |
| --- | --- |
| **What** | - **synapse-prototype M1~M7 일괄 구축** — Vite+React+Tailwind v4, DESIGN.md 토큰 ds primitives, **7개 Zustand store**, SM-2/wikilink/graph TDD, 19라우트, Playwright E2E <br> - **코드리뷰 대응·보안 하드닝** — React #185 무한 루프 제거, Mermaid `strict`+docs allowlist <br> - **위키/문서 초기 부트스트랩** — 프로젝트 문서 18종 + **09 Git 규칙 v2.0 + ADR-001/002(10→4 서비스 통합)** 채택 |
| **Why** | 발표·온보딩·레퍼런스용 인터랙티브 시뮬레이터 + Living Documentation 기반을 주말에 선제 구축하고, 단일 사실원이 될 위키를 세워 이후 모든 명세·일정의 출발점을 만들기 위함. |
| **Problem** | prototype에서 **React #185 무한 업데이트 루프** — useSyncExternalStore 셀렉터가 매 렌더 새 배열 참조를 반환. Mermaid 에러 렌더의 innerHTML·슬러그 미검증 path traversal 위험. |
| **Solution** | useEffect deps를 비우고 `getState()` 명령형 1회 실행 + 안정 셀렉터로 루프 차단, Mermaid `securityLevel='strict'`+`textContent`+docs allowlist 검증으로 보안 해결. |
| **회고** | 첫 이틀에 도메인 로직을 TDD로 작게 쪼개 마일스톤을 일괄 구축한 추진력이 좋았고, Zustand v5 셀렉터의 참조 안정성 함정을 root cause까지 파고든 점이 이후 프론트 작업의 토대가 됐다. |

### 1주차 2회 (5/11~5/12) — PM 문서체계 + 폴리레포 부트스트랩
> 활동 레포: documents · schedule-repo · syn · workflow-dashboard + 9개 서비스 레포 일괄 bootstrap(5/12)

| 항목 | 내용 |
| --- | --- |
| **What** | - **PM 문서 5종 체계(documents)** — SCOPE/PRD/TASK/WORKFLOW/HISTORY (7명×W1~W5) <br> - **일정 관리 SPA(schedule-repo)** — React/Vite/Zustand Gantt·Kanban·주차뷰 + MD→JSON + Pages 배포 <br> - **폴리레포 부트스트랩(syn)** — 멱등 `common.sh`/`repos.sh`, **Phase 1~3**(레포 생성·secrets·scaffold) <br> - **전 레포 bootstrap + 대시보드 착수** — shared/platform/knowledge/learning/engagement/gitops/frontend 초기 커밋, workflow-dashboard 구현 시작 |
| **Why** | `SCOPE→PRD→TASK→WORKFLOW→HISTORY` 추적 체계로 5주·7인 개발을 분해하고, "Day 1 셋업" 체크리스트(09 v2.0 §C1)대로 4서비스 폴리레포를 재현 가능하게 일괄 생성하기 위함. |
| **Problem** | syn phase3 실행 보고서에서 **Tier1 Actions 3/6·mirror dirs 0/6 검증 실패**(미러 미동작·Flutter scaffold 누락), private 레포 branch protection 불가(Free plan). |
| **Solution** | `mirror.yml`에 `git add -A`+`_mirror` exclude, `frontend-flutter.sh --project-name` 인자로 scaffold 복구, phase1 graceful fallback로 플랜 제한 우회, deploy skip 모드. |
| **회고** | 스크립트를 처음부터 멱등(가드·재실행 안전)으로 설계하고 phase마다 자동 보고서를 남긴 덕에 실패를 수치로 즉시 진단·복구할 수 있었다. 문서 체계와 인프라 부트스트랩을 같은 날 정렬한 것이 이후 병렬 개발의 기반이 됐다. |

### 1주차 3회 (5/13~5/14) — 컨벤션/가이드 사이트 + GitOps 착수
> 활동 레포: documents · workflow-guide · moking-data-guide · synapse-gitops + 서비스 CI

| 항목 | 내용 |
| --- | --- |
| **What** | - **개발 컨벤션 Rule북(documents)** — 공통·Spring·Flutter 컨벤션 + 16챕터 코드 Rule북 <br> - **가이드/목킹 사이트** — workflow-guide gh-pages, **moking-data-guide 8문서 + 19종 시뮬레이터** 부트스트랩 <br> - **GitOps 착수(synapse-gitops)** — EKS/ArgoCD 초기 작업 <br> - **서비스 CI 정비** — platform/knowledge/learning/engagement/frontend `parse-workflow` 트리거 확장 |
| **Why** | 컨벤션을 통일해 7인 병렬 개발의 일관성을 확보하고, 목킹 전략을 직접 체험할 시뮬레이터 사이트를 제공하며, 백엔드 배포의 종착지인 GitOps를 일찍 띄우기 위함. |
| **Problem** | moking 시뮬레이터 초기 로직 버그 다수(Stripe `plan` 미해석, CloudEvents ID 비고정으로 재현 불가, 하드코딩 태그 오류). 서비스들의 `gradlew`가 실행권한 없이(100644) 커밋되어 CI 취약. |
| **Solution** | 상태 기반 plan 해석·고정 event ID(BASE_DATE 상수)·동적 길이 치환으로 재현성 확보. 이후 회차에서 gradlew file mode 100755 교정 + `chmod +x` 안전망으로 수렴. |
| **회고** | 컨벤션·가이드 같은 "협업 토대"를 코드와 병행해 깔아둔 점이 좋았고, 시뮬레이터의 재현성(고정 ID·상태 기반 해석)을 초기에 바로잡아 이후 콘텐츠 보강을 안정적으로 얹을 수 있었다. |

### 1주차 4회 (5/15~5/16) — 위키 정합 + EKS/ArgoCD 부트스트랩
> 활동 레포: documents · documents.wiki · synapse-gitops(주력, 5/16 38건)

| 항목 | 내용 |
| --- | --- |
| **What** | - **위키 정합성 감사·동기화(documents/wiki)** — ERD·API 경로·enum 일괄 보정, ADR 후 stale 문서 그룹 단위 갱신 <br> - **EKS/ArgoCD 부트스트랩 집중(synapse-gitops)** — Terraform IaC(dev), **ArgoCD HA + NLB passthrough**, ApplicationSet 5개 앱 스코프 (5/16 하루 38건) |
| **Why** | ADR-001/002로 핵심 결정이 바뀌면서 어긋난 위키·PM 문서를 단일 기준으로 재정합하고, 5개 백엔드 앱을 EKS에 GitOps로 자동 배포할 토대를 본격 구축하기 위함. |
| **Problem** | 대량 문서 병렬 작성으로 **정합성 드리프트**(ERD 불일치, OpenSearch→Elasticsearch 잔존, `notes.status` enum) + ADR 후 03/10/14/17/18 stale 상태. |
| **Solution** | 위키 단일 기준 **감사→일괄 동기화→재확인(잔여 7건)** 루프로 수습, 09를 v2.0.1로 올려 stale 경고 제거. |
| **회고** | 단일 사실원(위키) 확정 후 의존 문서를 그룹 단위 사이클로 갱신하고 버전 패치로 닫는 패턴이 대규모 정합 변경을 추적 가능하게 만들었다. 같은 주에 인프라(gitops) 부트스트랩을 집중해 다음 주 집중 개발의 배포 경로를 미리 확보했다. |

---

## 주차 2 (5/18~5/22) — 집중 개발

### 2주차 1회 (5/18) — 런북 사이트 + 대시보드 파이프라인
> 활동 레포: synapse-gitops(37) · workflow-dashboard(13) · documents.wiki(4) · 서비스 일부

| 항목 | 내용 |
| --- | --- |
| **What** | - **GitOps 런북/문서 사이트(synapse-gitops)** — Flutter Web 런북, Markdown 뷰어/GoRouter 셸 <br> - **대시보드 데이터 파이프라인(workflow-dashboard)** — **gitops 트랙 team-lead 정규화**, prdPerTrack 멀티레포 지원, 트랙 정규화 <br> - **위키 서비스 ARCHITECTURE 문서(documents.wiki)** — 5개 서비스 아키텍처 문서 산출 |
| **Why** | 배포 절차를 팀이 따라할 수 있는 런북 사이트로 노출하고, 진행률 대시보드가 멀티레포 트랙을 올바르게 집계하도록 데이터 모델을 정비하기 위함. |
| **Problem** | 대시보드 자동 파싱 CI가 **수기로 넣은 데이터를 덮어쓰기**하고 같은 날 여러 sync가 진행률을 깎아 차트가 역행. |
| **Solution** | `trackAliasMap`(gitops→team-lead)으로 파일명을 안 바꾸고 매핑, history를 **rolling max로 단조 증가** 보장해 역행 차단. |
| **회고** | 자동 파이프라인과 수기 데이터의 충돌을 "monotonic max·alias map" 같은 멱등·방어 규칙으로 근본 차단한 것이 효과적이었다. 집중 개발 주 첫날에 데이터 신뢰성을 먼저 확보해 이후 대시보드 확장이 안정적이었다. |

### 2주차 2회 (5/19) — svc-template 골격/SB4 + gateway + shared
> 활동 레포: synapse-svc-template(93) · workflow-dashboard(11) · synapse-shared(10) · synapse-gateway(7) · synapse-gitops(7)

| 항목 | 내용 |
| --- | --- |
| **What** | - **진화형 골격 템플릿(svc-template)** — **16개 누적 skeleton 브랜치**(W1~W4) + **Spring Boot 3.3.5→4.0.6/Gradle 9.5.1 업글** + F-01~06 fix + 70/70 PASS <br> - **공용 스키마·인프라(shared)** — Kafka Avro 4종 + `{service}.{domain}.{event}-v1` 토픽 + **13서비스 Docker Compose** <br> - **API 게이트웨이(gateway)** — Spring Cloud Gateway 5.0.1 라우팅+Rate Limit+CORS <br> - **대시보드 config 시스템(workflow-dashboard)** — `config.json`+useConfig 훅으로 하드코딩 제거 |
| **Why** | 신입도 주차 브랜치를 골라 패키지명만 치환하면 시작할 수 있는 표준 골격을 만들고, 헥사고날 의존 원칙을 ArchUnit으로 자동 강제하며, 이벤트 스키마·로컬 환경·진입 게이트웨이를 하루에 일원화하기 위함. |
| **Problem** | SB4 업그레이드 직후 **빌드 연쇄 깨짐**(ArchUnit 1.3.0 API 변경, Jackson 3 Serializer, Consumer bean 충돌, adapter erasure 충돌). gateway는 **Boot 4.0.6 YAML 라우트 버그**. |
| **Solution** | svc-template은 **cherry-pick 누적 전파**(force-push 없이) + ArchUnit predicate·룰 정밀화·Jackson 3 이전·adapter SRP 분리. gateway는 라우트/CORS를 **Java config로 전환** 후 429·CORS 실제 검증. |
| **회고** | 누적 브랜치 + cherry-pick으로 16개 브랜치에 동형 수정을 force-push 없이 일관 적용하고, ArchUnit이 프레임워크 변경을 빌드 단계에서 즉시 드러내 회귀를 조기 포착한 점이 강점. 하루에 골격·스키마·게이트웨이를 묶어 올린 밀도 높은 세션이었다. |

### 2주차 3회 (5/20) — 서비스 Dockerfile + flow-simulator + 대시보드 스킬화
> 활동 레포: workflow-dashboard(34) · synapse-gitops(29) · synapse-flow-simulator(19) · 4개 서비스 Dockerfile · 기타

| 항목 | 내용 |
| --- | --- |
| **What** | - **4개 서비스 EKS Dockerfile(platform/knowledge/engagement/learning-svc)** — multi-stage·non-root·레이어 캐싱 <br> - **flow-simulator 코어+접근성** — 플로우 엔진, scenarios.json, **FINDING-001~010**(44px·WCAG AA·ARIA) <br> - **대시보드 스킬화/Force Sync(workflow-dashboard)** — `/project-dashboard` 스킬, PAT·workflow dispatch <br> - **GitOps 보강(synapse-gitops)** |
| **Why** | 각 서비스를 EKS에 배포 가능한 컨테이너로 만들고, 시뮬레이터의 접근성 베이스라인을 세우며, 대시보드를 다른 프로젝트에도 재사용할 스킬로 추출하기 위함. |
| **Problem** | **4개 서비스 공통으로 Dockerfile 추가→Revert→재작성** 반복(engagement #5→#7, knowledge #14→#16, learning #15→#17). Force Sync는 clock skew·동시 트리거 git push race. |
| **Solution** | 깨진 Dockerfile을 **Revert 후 multi-stage(non-root·캐싱)로 재작성** + file mode 100755 교정. Force Sync는 run id 식별 + concurrency lock으로 race 해결, 불안정한 polling은 제거 단순화. |
| **회고** | 4개 서비스에서 동일하게 Dockerfile을 되돌렸다 재작성한 반복은 첫 PR 전 빌드 검증을 강화했다면 줄일 수 있었던 공통 시행착오. 반면 "무리한 수정보다 Revert 후 깨끗이 재작성"과 polling 제거 같은 단순화 판단은 신뢰성을 높인 좋은 선택이었다. |

### 2주차 4회 (5/21~5/22) — UX완성 + frontend 52화면 + 핸드오프
> 활동 레포: synapse-flow-simulator(39) · workflow-dashboard(38) · synapse-gitops(37) · synapse-frontend(18) · synapse-shared(20)

| 항목 | 내용 |
| --- | --- |
| **What** | - **flow-simulator UX/모드/반응형** — 검색·필터, **3-모드 시스템(학습/프레젠테이션/레퍼런스)**, 줌·미니맵·딥링킹, 모바일 안정화 <br> - **Flutter 52화면 완성(synapse-frontend)** — 갭 분석 후 **52개 화면+공통 컴포넌트 9종(9,744줄)**, AdminShell <br> - **shared 핸드오프/E2E + Docs Portal 계획** — HANDOFF_HUB, EVENT_FLOW_MATRIX, E2E_SCENARIOS_W3 <br> - **gitops Docs Portal(build_docs.mjs)** + 대시보드 E2E |
| **Why** | 혼재된 사용 목적을 모드로 분리해 시뮬레이터를 완성하고, 비즈니스 로직 없이 순수 UI를 먼저 완성해 팀원이 Provider만 연동하면 되게 하며, W3 통합 전 핸드오프·E2E 기반을 미리 갖추기 위함. |
| **Problem** | flow-simulator **모바일 3컬럼 그리드 0px 붕괴**·CSS source order로 mode-switcher 미숨김(4~5회 연속 fix). frontend는 **Admin 화면 진입/복귀 경로 누락**. |
| **Solution** | `<700px` 단일 컬럼 그리드 + `!important` 우선순위 + `min(220px,75vw)` 클램프. frontend는 `kIsWeb` 조건부 관리자 메뉴+복귀 링크로 양방향 내비 완성. |
| **회고** | 설계서로 갭(52화면 상태표)을 정량화한 뒤 단일 PR에 9천 줄을 일관 완성한 점이 효과적. 다만 모바일 CSS·Admin 내비처럼 "만든 뒤에야 드러난" 문제로 연속 fix가 필요했고, 통합 시점에 CSS source order·진입 경로를 동시 검증해야 한다는 교훈이 집중 주의 마지막에 또렷이 남았다. |

---

## 주차 3 (5/26~5/29) — 마무리·검증·온보딩

### 3주차 1회 (5/26) — 로컬 MSA 실행 경로 + 온보딩
> 활동 레포: synapse-gitops (단독, 하루 100건)

| 항목 | 내용 |
| --- | --- |
| **What** | - **로컬 MSA(minikube/k8s) 실행 경로** — 인클러스터 인프라 매니페스트(postgres/redis/kafka/opensearch), 앱 5개 로컬 overlay <br> - **인터랙티브 HTML 세팅 가이드** — AWS 없이 로컬에서 MSA를 띄우는 온보딩 문서 |
| **Why** | 팀원/신규가 AWS 비용·권한 없이도 동일한 MSA 환경을 로컬에서 재현하도록, 인클러스터 인프라와 앱 overlay·온보딩 가이드를 제공하기 위함. |
| **Problem** | 특이사항 없음 (로컬 overlay·매니페스트 신규 구성, 회귀 없이 진행). |
| **Solution** | 해당 없음 — 인프라 매니페스트와 가이드를 새로 작성해 로컬 실행 경로를 신설. |
| **회고** | 클라우드 의존을 로컬 재현 경로로 흡수해 진입 장벽을 낮춘 점이 좋았고, 마무리 주 첫 세션에 온보딩 자산을 함께 만들어 둔 것이 프로젝트 인수인계 품질을 높였다. |

### 3주차 2회 (5/26) — W3 staging 승격 + 관측 + bring-up 자동화
> 활동 레포: synapse-gitops (단독)

| 항목 | 내용 |
| --- | --- |
| **What** | - **W3 staging 승격** — staging ALB Ingress/TLS, auto-sync 전환 <br> - **관측 스택(FR-GO-303~307)** + EBS CSI addon(IRSA)·gp3 default StorageClass <br> - **phase 기반 `bring-up.sh`** — local/cluster/observability/verify/destroy 단계 자동화 |
| **Why** | dev를 넘어 staging 환경을 GitOps로 승격하고 관측 가능성을 확보하며, 반복되는 수동 부트스트랩을 1회 실행으로 재현하는 멱등 스크립트로 완성하기 위함. |
| **Problem** | 라이브 EKS 검증에서 결함 다수(`D-0xx`): private endpoint로 readiness 체크 부적합, ExternalSecret `v1beta1` 미지원, Loki `schemaConfig` 누락으로 loki-0 미생성, EBS CSI 부재. |
| **Solution** | readiness를 `get nodes`로 교체, ExternalSecret apiVersion v1 통일, Loki `schemaConfig`+SingleBinary, **EBS CSI addon+IRSA·gp3 default**, argocd phase 멱등화(`--force-conflicts`)로 각 발견을 해결 커밋 처리. |
| **회고** | "라이브 검증 → 발견 번호화 → 멱등 수정" 루프가 마지막까지 일관되게 작동해, 추측이 아닌 실제 클러스터 동작에 맞춰 견고화했다. 부트스트랩·배포를 phase 단위(dry-run·verify·destroy)로 분해해 1회성 수동 작업을 재현 자동화로 끌어올린 것이 프로젝트의 마무리 성과였다. |

### 3주차 3회 (5/27) — 백엔드 표준화 + 온보딩 포털 + reusable 워크플로
> 활동 레포: synapse-knowledge/engagement/learning/platform-svc · synapse-onboarding(신규) · synapse-frontend · synapse-gateway · synapse-shared

| 항목 | 내용 |
| --- | --- |
| **What** | - **4개 백엔드 서비스 application.yml/JWT 표준화 + dev-smoke CI** — knowledge(8082)/engagement(8083)/learning(8084)/platform(8081)의 dev/prod/test 프로파일 분리·`synapse.jwt.public-key` prefix 통일·local yml 제거, OAuth2 Resource Server 검증자 신설, `docker-compose.ci.yml` 기반 부팅 헬스 검증 dev-smoke 도입 <br> - **reusable deploy/mirror caller 전환** — frontend/gateway/서비스 CI를 `synapse-shared`의 `mirror-service.yml`/`deploy-service.yml`(workflow_call·OIDC) caller 호출로 축약, 미러/배포 로직 중앙 일원화 <br> - **synapse-onboarding 신규 Flutter Web 포털** — gitops Docs Portal 포크 후 카테고리를 overview/flow/practice 3종으로 재정의, 콘텐츠 빌드 파이프라인+Mermaid 렌더, 온보딩 서사 9섹션·샘플 코드, GitHub Pages 배포 <br> - **shared W3 로컬 Kafka E2E harness** — 로컬 docker-compose 중심 W3 플랜 현행화, harness 베이스라인 검증(5/5 토픽 produce→consume) |
| **Why** | EKS destroy·팀 Kafka PR 0건 현실에서 W3 통합 전 로컬 우선 검증을 확보하고, MSA 신입이 전체 흐름을 한눈에 보도록 온보딩 포털을 제공하며, 서비스별 CI 중복(rsync/ECR/태그 sed)을 제거하고, 빈 스텁만 있던 보안을 실제 검증자로 강제하기 위함. |
| **Problem** | (1) `flyway-core`만 선언돼 Flyway 자동설정 미트리거로 마이그레이션이 침묵 미실행. (2) platform dev `synapse.jwt.private-key` 기본값이 손상된 base64라 public-key와 키쌍 불일치. (3) 온보딩 포털 `MarkdownViewer`가 `onTapLink` 없이 렌더돼 본문 링크 전부 무반응(no-op). (4) Kafka 컨테이너가 stale ZK znode로 Exited(1), 멀티라인 JSON이 줄 단위로 분리돼 CONSUME WARN. |
| **Solution** | (1) `flyway-core`→`spring-boot-starter-flyway` 교체 + dev/prod `ddl-auto` none(Flyway를 스키마 권위). (2) private-key 기본값을 public-key와 짝 맞는 유효 PKCS8 키로 교정. (3) `onTapLink`+`url_launcher` 연결과 주입형 콜백+회귀 테스트. (4) `down -v` 볼륨 정리, `compact_json`(jq -c)로 1라인 압축. |
| **회고** | 보안 스텁을 실제 검증자로 전환하면서 통합 테스트 401 계약을 실토큰 기준으로 갱신해 회귀를 고정한 점, dev-smoke 부팅 헬스 검증이 Flyway 침묵 미실행·손상 키 같은 설정 결함을 CI에서 조기 포착한 점, 검증된 gitops 포털을 포크·삭감해 인프라 대신 콘텐츠에 집중한 전략이 주효했다. |

### 3주차 4회 (5/28~5/29) — W4 prod 거버넌스 + 기술스택 6세션 검증 v2.3
> 활동 레포: synapse-gitops(주력) · documents · documents.wiki

| 항목 | 내용 |
| --- | --- |
| **What** | - **gitops bring-up 실 EKS 라이브 검증 9건 A2 환류** — `scripts/bring-up.sh`를 실 EKS에 처음 돌려 발견한 9건 갭(터널 readiness `/readyz`→`get nodes`, eks-auth `authenticationMode` 폴링, argocd `--force-conflicts` 멱등화, ExternalSecret `v1beta1`→`v1`, tfvars fail-fast, `--verify` curl-pod 메트릭 조회)을 코드에 환류 <br> - **W4 synapse-prod 거버넌스 레이어** — synapse-prod AppProject + manual-sync ApplicationSet + `role:prod-deployer` RBAC + Velero S3+IRSA 일일 백업 Schedule + 롤백·백업 런북(RTO 30분/RPO 1시간) (PR #59~#75) <br> - **W1/W2 PM 100% 정합(D-041)** — W1=8→0·W2=13→0 미해결 박스를 라인 이동+사유 주석으로 정리, TASK Status 전 Step `[x] Done` 통일(PR #76) <br> - **documents 18 기술 스택 6 카테고리 사실검증 파이프라인** — S1 언어~S6 외부/AI 6/6 세션 종료(PR #6~#13), 55개 기술·누적 182 findings·ADR 5건 <br> - **wiki v2.0→v2.3 통합 마감** |
| **Why** | dev/staging을 넘어 prod 복구 경로를 확보하고, 권위 문서를 "목표를 현재처럼 단정하던 픽션"이 아닌 실재 기준 단일 진실 출처로 되돌리기 위함. |
| **Problem** | (1) bring-up.sh 실 EKS 첫 실행에서 로컬/kind에 안 보이던 갭 9건 노출 + platform Redis 키 오배선(`spring.data.redis.*` 미주입→localhost 폴백)이 local·dev·staging 세 곳에 잠복. (2) 위키가 §6.3 RAG·§6.4 Semantic Cache 등 목표를 실재처럼 단정한 픽션 P0 16건. (3) S5 운영 세션 Phase B3 멀티 subagent 디스패치 중 API 529 Overloaded로 세션 중단. |
| **Solution** | (1) 9건 A2 발견을 bring-up.sh/lib에 멱등 환류 + Redis 키를 `SPRING_DATA_REDIS_*` relaxed-binding으로 교정(PR #57·#58). (2) 전 항목을 "적용 현황(목표 vs 실재)" 박스로 분리·P0 실코드 기준 재작성·§8.6 ADR 5건 명문화. (3) HANDOFF v1.2로 진척 직렬화 후 동일 브랜치에서 Phase B3부터 무손실 재개. |
| **회고** | "로컬/kind 그린은 EKS 그린을 보장하지 않는다" — 멱등 자동화의 검증 가치는 실 클러스터 1회 실행에서 드러난 9건 환경 차이로 입증됐고, redis 누락 잠복에서 **probe 그린과 actuator aggregate 그린을 분리해 봐야 한다**는 교훈을 얻었다. 5498줄 단일 권위 문서를 6 카테고리로 쪼개 "보고서 PR + 위키 단일 커밋" dual-commit 검증으로 완주한 것이 핵심이었다. |

---

## 주차 4 (5/30~6/8) — 운영 점검·감사·표준화

> 이 구간은 [[repo-edit-scope-policy]]에 따라 직접 작업을 gitops·shared·gateway + 문서로 한정하고, 서비스 레포 변경은 GitHub 이슈로 위임한 **점검·표준화·정합 검증** 성격이다.

### 4주차 1회 (6/2~6/4) — Kafka 4서비스 감사 + TLS MSK 갭·ES 불일치 조사
> 활동: documents(감사 보고서) · 19개 레포 origin 감사  ·  서비스 변경은 이슈 위임

| 항목 | 내용 |
| --- | --- |
| **What** | - **Kafka 4서비스 감사(`docs/kafka-service-audit-2026-06-02.md`)** — shared EVENT_CONTRACT_STANDARD·EVENT_FLOW_MATRIX 기준으로 도입/설정/CI 대조, engagement 소비측 부재(P0)·CI Schema Registry 미표준화·Avro/serializer 버전 드리프트·Outbox 불균일을 번호화 <br> - **Kafka TLS MSK 앱 준비 갭 조사** — gitops `SPRING_KAFKA_SECURITY_PROTOCOL=SSL` env만으로는 서비스 커스텀 `KafkaConfig`가 `security.protocol`을 안 읽어 미배선임을 규명, 앱 PR 선행 필요로 플랜 정정 <br> - **knowledge OpenSearch↔ES 이중 불일치 조사** — env명 불일치(`OPENSEARCH_URL` dead config)+ES9 client↔OpenSearch 서버 product-check 비호환 두 갭 규명 |
| **Why** | "staging/prod Kafka SSL 적용"을 gitops-only 작업으로 잡으면 실패하므로, 표준 대비 서비스별 실재 간극을 origin 기준으로 정확히 식별해 앱 선행조건과 위임 범위를 가르기 위함. 검색은 프로비저닝됐어도 앱이 못 쓰는 상태라 결정이 필요했음. |
| **Problem** | 초기 audit가 체크아웃된 feature 브랜치를 봐서 일부 항목(security.protocol 배선)을 오판할 뻔함. 검색은 인프라가 떠 있어도 앱이 `localhost:9200`로 폴백하는 dead config. |
| **Solution** | 19개 레포 `git fetch origin --prune` 후 origin/main·origin/dev 기준으로만 재판정. Kafka 갭은 앱 배선 이슈로 위임(platform #59·knowledge #46·learning #49)하고 gitops env는 직접 작업으로 분리. 검색은 D-003 ADR로 "인클러스터 ES 전환" 방향 결정. |
| **회고** | "토픽 네이밍 정렬"만으로 이벤트 계약이 닫히지 않고 소비측·CI 호환·버전 정본까지 봐야 한다는 점, **env 주입은 필요조건일 뿐 앱이 읽는 코드 경로까지 대조해야 충분조건**이라는 점을 감사로 확인했다. 직접 고치는 대신 간극을 정확히 번호화·위임하는 역할 전환이 이 구간의 색깔이었다. |

### 4주차 2회 (6/5) — gitops Kafka SSL(Phase 2/3) + ES 전환(D-003) + Flyway 표준/CI 가드
> 활동 레포: synapse-gitops(주력) · synapse-shared · documents(spec/plan)

| 항목 | 내용 |
| --- | --- |
| **What** | - **gitops Kafka SSL Phase 2/3** — dev 4서비스 `KAFKA_ENABLED`+SSL env(PR #118), schema-registry staging/prod 오버레이 + 서비스 staging/prod SSL env + applicationset 등록(PR #119) main 머지(prod sync는 Manual 유지) <br> - **OpenSearch→인클러스터 ES 9.2.1 전환(D-003)** — gitops PR #114로 `apps/elasticsearch` StatefulSet(ES 9.2.1)+knowledge 오버레이 `ELASTICSEARCH_URIS` 정합, AWS 관리형 OpenSearch 도메인 제거, shared #16 정합 문서 <br> - **Flyway 표준 + CI 가드 수립** — `synapse-shared/docs/rules/12-flyway-migration.md`(14자리 타임스탬프 버전·기존 정수 불변·out-of-order/baseline), `scripts/flyway_guard.py`(stdlib)+reusable `flyway-guard.yml`, 서비스 롤아웃은 이슈 위임(platform#65·knowledge#48·learning#55·engagement#28) |
| **Why** | TLS MSK·검색의 앱 선행조건이 origin/dev에 머지된 것을 확인했으니 인프라 측(KAFKA_ENABLED+SSL env, schema-registry 오버레이, ES StatefulSet)을 직접 채우고, platform V28 중복 같은 Flyway 충돌을 구조적으로 막는 표준을 세우기 위함. |
| **Problem** | platform-svc V28 중복(머지된 `allow_multiple_refresh_tokens` vs untracked `rename_oauth_provider_id_column`) — 전역 정수 버전 수동 선택 관행 + 병렬 브랜치 공유. Spring 3서비스는 `synapse.kafka.enabled` 게이트가 없어 `KAFKA_ENABLED`가 no-op. |
| **Solution** | Flyway를 타임스탬프 버전 표준으로 전환하고 CI 가드(중복/비-타임스탬프/기머지 수정 3종)로 fail-fast 강제. 게이트 부재는 서비스 이슈로 위임(platform·learning은 이후 #59/#49 해소, knowledge #46 잔여). |
| **회고** | 전역 정수 버전 수동 선택은 병렬 개발에서 충돌이 시간문제라 **단조 정렬 타임스탬프 + CI 가드**로 구조적으로 제거하는 게 정답이었다. 표준은 문서로 끝내지 않고 가드로 강제해야 지켜진다. gitops env(주입)와 앱 게이트(소비)는 쌍으로 있어야 동작함을 다시 확인했다. |

### 4주차 3회 (6/8) — 아키텍처 현황 보고서 + deploy/mirror 표준화 마감 + main 직행 PR 정리
> 활동 레포: documents(보고서) · synapse-shared/gitops 확인 · org PR/이슈 정리

| 항목 | 내용 |
| --- | --- |
| **What** | - **2026-06-08 아키텍처 현황 보고서(`docs/synapse-architecture-status-2026-06-08.md`)** — 19레포 origin 기준 전 구성(서비스/인프라/CI·CD) 점검, 간극 8건 재판정(**해소 3: G3 engagement 컨슈머·G6 ES 정합·G8 deploy/mirror / 진행 4: G1 Kafka TLS·G4 버전 드리프트·G5 Flyway·G7 main↔dev 발산 / 미해결 1: G2 S3**), Explore 4병렬 + 상충 3건 직접 `git show`/`git grep` 재확인 <br> - **deploy/mirror 표준화 마감(G8)** — shared `deploy-service.yml`·`mirror-service.yml`(workflow_call) main 머지, 6개 레포 caller 전환, gitops `apps/gateway` 확인. Flyway 가드(shared#22)도 main 머지 확인 <br> - **main 직행 PR 4건 정리** — 열린 PR 전부 base를 dev로 재타겟(knowledge #50/#51 깨끗), engagement #30·learning #57 충돌은 engagement#31·learning#59 이슈로 위임 |
| **Why** | 베이스라인(06-02 Kafka 감사 + 메모리 간극 8건) 이후 다수 PR 머지·전환이 일어났으므로, 로컬 stale을 배제하고 origin 기준으로 "오늘 실제 상태"를 팀 공유용으로 단일 보고서에 고정하고, main 직행 머지로 누적된 발산을 dev 단일 통합 경로로 되돌리기 위함. |
| **Problem** | 로컬 클론이 stale해 knowledge "미머지"·서비스 "미배선"으로 오판할 뻔하고, learning에 stale 기준 중복 이슈(#50)를 냈다가 닫음. main 직행 PR을 dev로 재타겟하니 engagement/learning이 충돌(main에 dev 미경유 머지 존재). |
| **Solution** | 전 레포 `git fetch origin --prune` 후 origin ref로만 판정, 에이전트 상충 보고는 직접 `git show`로 정정(engagement Avro 1.11.3, knowledge 게이트 부재, G5 진행). 충돌 PR은 직접 머지 대신 dev 재분기 이슈로 위임. |
| **회고** | 멀티레포 상태는 반드시 `git fetch` 후 origin 기준이라는 교훈([[verify-merge-state-via-origin]])을 보고서 작성 전 게이트로 박았고, 간극을 G1~G8로 번호화해 "근거(origin)+추적(이슈)+베이스라인 대비"를 한 표에 담은 것이 팀 공유와 다음 우선순위 결정에 효과적이었다. 만드는 사람에서 **origin 기준 감사·표준 수립·위임자**로 역할이 옮겨간 구간이었다. |

---

## 주차 5 (6/9~6/12) — 실 통합·라이브 검증·안정화

> 감사·위임으로 식별만 해 둔 간극을 **실 EKS dev+staging에 올려 닫는** 릴리스 마감 구간. velka의 역할이 **감사·위임자 → 실 통합 오너 + 크로스커팅 계약/배포 통합자**로 넓어져, 위임만으로 닫히지 않는 **release-blocking 결함**(Avro 정본 분기·Kafka SSL·actuator 401·deploy 재발산)은 서비스 레포(engagement/learning/frontend)도 직접 수정했다. platform/knowledge의 기능 API·검색 등 도메인 개발은 여전히 각 owner 몫이라 본 회고에는 포함하지 않는다.

### 5주차 1회 (6/9) — 통합 차단 결함 직접 수정 (Avro 정본·JWT·SSL)
> 활동 레포: synapse-engagement-svc · synapse-learning-svc · synapse-knowledge-svc(JWT) · shared(W5 잔여 핸드오프)  ·  직접 수정 = release-blocker 한정

| 항목 | 내용 |
| --- | --- |
| **What** | - **Avro writer 스키마 정본 정렬(P0)** — engagement#32 `UserRegistered`(`registeredAt` 제거 + 공통메타), learning#64 `NotificationSend`(namespace + 공통메타) — 06-02 감사 F1·F2·F3의 직접 귀결 <br> - **JWT subject 결정적 도출** — `userId` claim 부재 시 subject(UUID)→결정적 Long, HTTP·Kafka 경로 통일(engagement#33·knowledge#59) <br> - **learning-ai Kafka SSL 배선** — SSL일 때 `ssl_context` 생성·전달로 CrashLoop 해소(learning#67, gitops#144) <br> - **W5 잔여 핸드오프 정합** — HANDOFF_W5 잔여 5건 라이브 완료 반영, 저우선 후속 3건 이관 |
| **Why** | 06-02 Kafka 감사·06-04 TLS 갭에서 번호화만 해 둔 P0(스키마 분기·게이트·SSL)가 라이브에서 실제 DLT·CrashLoop로 발현. 위임만으로는 릴리스가 막혀 통합 차단 결함에 한해 직접 수정 범위를 열었다. |
| **Problem** | 토픽 네이밍은 표준과 맞는데 **writer 스키마(namespace·공통메타·필드) 분기**로 역직렬화 실패→DLT. JWT `userId` 부재 시 HTTP·Kafka가 서로 다른 Long을 생성. learning-ai는 `security_protocol=SSL`만으로 핸드셰이크 실패(aiokafka는 `ssl_context` 필수). |
| **Solution** | writer 스키마를 정본 namespace+공통메타로 정렬, 식별자 도출을 결정적 단일 함수로 통일, aiokafka에 `ssl_context` 주입. 각 fix에 회귀 테스트/스모크 동반. |
| **회고** | "계약은 토픽 네이밍이 아니라 **writer 스키마 정본**까지 일치해야 닫힌다" — 스키마 분기는 mock 레지스트리 CI에선 안 보이고 런타임 DLT로만 드러나, 감사로 번호화(F1~F3)해 둔 P0가 라이브에서 그대로 터졌다. env 주입≠배선이 Python 클라이언트(`ssl_context`)에서도 동일함을 재확인. |

### 5주차 2회 (6/10) — actuator 401 CrashLoop·ruleset 레이스·DLT 가설 A·관측 마감
> 활동 레포: synapse-engagement-svc · synapse-learning-svc · synapse-gitops(ruleset·db-init·관측) · synapse-shared(DLT fix-request)

| 항목 | 내용 |
| --- | --- |
| **What** | - **actuator 하위경로 401 CrashLoop 해소** — `/actuator/health` 정확매칭→`/actuator/health/**` permitAll(engagement#44·learning-card#79) + 회귀 스모크 <br> - **분기 보호 ruleset 정상화** — required check 컨텍스트 잡명 `validate` 정정(gitops#173) + strict 완화로 main BEHIND 레이스 제거(#165), SHA↔semver 태깅 전략 결정문서 <br> - **bring-up db-init 수정** — psql `\gexec`를 stdin 전달로 교정(#171) <br> - **platform#87 DLT 가설 A 입증** — learning `ReviewCompleted` 발행 스키마 분기를 fix-request로 분기 입증(shared#50/#51)→learning#84 근본수정 <br> - **관측 W3 Step8 마감** — ESO sync 알람·앱별 대시보드·Grafana nip.io ingress(gitops#170) |
| **Why** | 라이브 staging에서 파드가 기동 후 SIGTERM 루프(actuator 401)·PR 영구 BLOCKED(ruleset)·DLT 장애가 동시에 릴리스를 막아, 앱·CI·관측을 가로질러 한 번에 안정화할 필요. |
| **Problem** | K8s 프로브가 `/actuator/health/liveness`·`/readiness`를 호출하는데 SecurityConfig가 `/actuator/health`만 permit→401→livenessProbe SIGTERM. ruleset required check를 워크플로명으로 적어 잡명 `validate`와 불일치→영구 미충족. `psql -c`가 `\gexec` 메타커맨드 무시. |
| **Solution** | 보안 매처를 `/**`로 확장, ruleset 컨텍스트를 잡명으로 정정 + strict 완화, `\gexec`를 stdin으로, DLT는 발행측 정본 정렬을 owner에 위임. |
| **회고** | "기동 후 일정 시간 뒤 SIGTERM"은 콜드스타트로 오인하기 쉽지만 **헬스 프로브 응답코드(401)** 를 먼저 봤어야 했다(엔드포인트 존재→404 아닌 401). required check는 **잡명**으로, strict 보호는 처닝 잦은 main에서 직렬 BEHIND 레이스를 부른다. DLT는 소비측이 아니라 **발행측 writer 스키마 분기**가 근본인 경우가 많다. |

### 5주차 3회 (6/11) — ES nori 실기동·bring-up 견고화·frontend 재발산 방지·16/16·24h 소크
> 활동 레포: synapse-gitops(주력) · synapse-shared(nori ECR·node24) · synapse-frontend(deploy 통일)

| 항목 | 내용 |
| --- | --- |
| **What** | - **EKS ES 실기동** — nori 커스텀 ES 이미지 ECR 빌드(shared#54/#55)로 교체, `es-reindex` phase + nori/검색 verify(gitops#179), fsGroup·gp3 SC 순서·StatefulSet 대기(#180), 인덱스 존재판정 본문 grep→HTTP 상태코드(#185) <br> - **bring-up 견고화** — destroy 전 orphan ALB/NLB 선정리(#178), Windows kubectl KUBECONFIG 경로 자동변환(#181), `kafka-topics`(MSK 9종 SSL Job)·`db-init`(RDS 5 DB) 멱등 phase, 라이브 산출물 .gitignore(#184) <br> - **앱 안정화(인프라측)** — learning-card 콜드스타트(cpu·startupProbe)+이미지 `dev-latest`→SHA 핀(#164), engagement 콜드스타트 **오진→revert→실근본 actuator 401**(#187/#188), staging 이미지 태그 정정 ImagePullBackOff(#191/#192) <br> - **frontend deploy 재발산 방지(G7 해소)** — 컨테이너 이미지 파이프라인(#54)+main을 semver 모델로 통일(#55)+dev 배포 인프라를 main 정본과 정합(#56) <br> - **node20→24 액션 일괄 업그레이드**(shared#56/#57) <br> - **EKS 매니지드 컨트롤플레인 룰 false-positive 비활성**(#194/#195) <br> - **dev 9/9 + staging 7/7 → 16/16 Healthy + 24h 소크 진입**, W3/W4/W5 마감·실도메인 nip.io 임시완결·D-043 사인오프(velka 겸임) |
| **Why** | dev/staging을 실제로 그린 상태로 올려 24h 소크로 안정성을 입증하고, 06-08 보고서의 최우선 리스크였던 **frontend main↔dev 발산(G7)** 을 deploy 표준 통일로 구조적으로 닫기 위함. |
| **Problem** | ES가 fsGroup·gp3 SC·배포 순서 레이스로 1회성 미기동 + 404 본문 grep 오탐, Nori가 stock 이미지에 부재, destroy를 orphan LB가 차단, `dev-latest` 부동 태그로 staging ImagePullBackOff·롤백 불가, engagement CrashLoop을 콜드스타트로 오진, frontend가 main·dev 서로 다른 deploy 모델로 재발산 위험. |
| **Solution** | ES 순서 고정+상태코드 판정+nori ECR 이미지, destroy orphan LB 선정리·Windows 경로 변환, 이미지 SHA 핀, 오진 revert 후 실근본(actuator 401) 처리, frontend deploy를 main 정본 semver로 단일화. |
| **회고** | "로컬/kind 그린은 EKS 그린을 보장하지 않는다"가 W5에서도 관철 — ES 순서 레이스·orphan LB·`\gexec`는 실 EKS 1회 기동으로만 드러났다. **오진 위에 쌓은 인프라 튜닝은 증상을 가리므로 revert 후 실 근본원인부터**, **배포 태그는 SHA로 핀**, **부동 태그는 staging 비결정성·롤백 불능을 부른다**. 06-08 최우선 리스크 G7을 만드는 일이 아니라 **deploy 표준 통일**로 닫은 것이 이 구간의 정점이었고, 만드는 사람→감사·위임자를 거쳐 **실 통합 오너**로 한 바퀴 돌아온 마감이었다. |

### 5주차 4회 (6/12) — 공유 MSK 토픽 격리와 인증 검색 관측 인프라 직접 수정
> 활동 레포: synapse-gitops(주력) · synapse-gateway · synapse-shared (직접) · 서비스 4종 이슈 위임  ·  데모/녹화 직전 라이브 마감일 — #199 토픽 격리 + 통합 차단(#196/#198)·관측 오탐(#194/#207/gateway#7)·IaC/destroy(#182·선정리 3건)·로컬 compose(#75)

| 항목 | 내용 |
| --- | --- |
| **What** | **(A) 라이브 통합 차단·관측 오탐·destroy 갭 직접 수정 (인프라, #174 E2E 추적 중 발견)** <br> - **JWT 공개키 단일출처화(#196)** — gateway 사본 공개키 오염 + 서비스 3종 `JWT_PUBLIC_KEY` 미주입(ephemeral 폴백)→전 인증 API 401, remoteRef를 서명 주체(`platform-svc/jwt-public-key`)로 통일 + 키 주입 <br> - **검색 인덱싱 3중 단절(#198)** — note-search-sync 토픽 정본 누락·knowledge Redis 미주입(`localhost:6379` 폴백→DLQ)·`SEARCH_AI_BASE_URL` 미설정 동시 복구 <br> - **메모리 알람 이중합산 오탐(#194)** — cAdvisor `container=""` roll-up 합산으로 194%·12건 오탐→`container!=""` 필터 + platform 실측 limit 768Mi 상향 <br> - **bastion 레이스+ECR IaC(#182)** — `user_data` 암묵 의존성 부재 IAM 전파 레이스→`depends_on`+재시도, ECR 8종 standalone 스택 분리 <br> - **ServiceMonitor 비-Spring 3종 제외(#207)** + **destroy 선정리 갭 3건**(`--field-selector spec.type=` BadRequest→jsonpath·컨트롤러 SG·EBS orphan reap) <br> **(B) gateway prometheus 노출(#7/#8)** — Boot 4.0 exposure + micrometer 레지스트리 둘 다 필요(미노출 404→TargetDown 해소) <br> **(C) 공유 MSK 토픽 환경 프리픽스(#199)** — dev knowledge(1)+staging knowledge(2)가 같은 토픽·같은 컨슈머그룹으로 3파티션 교차 분산→dev 검색 0건·staging DLQ. 옵션 B 채택, gitops#206(오버레이 15개 `KAFKA_TOPIC_PREFIX` 주입+bring-up `""`·dev.·staging.·prod. 4종 멱등 생성)·shared#72(`EVENT_CONTRACT_STANDARD §2.1`) 직접, 앱은 platform#102·knowledge#87·learning#93·engagement#49 위임 <br> **(D) shared 로컬 compose 서비스별 DB initdb(#75)** — 단일 DB 공유 Flyway history 충돌 방지(`scripts/initdb` 기본 compose 마운트) + W5 발표 슬라이드·데모 스크립트·사전점검 리포트(#68~#74) 정리 |
| **Why** | 06-12은 데모/녹화를 앞둔 라이브 마감일 — #174 풀 E2E를 추적하며 통합을 막는 인증(401)·검색(0건)·관측 오탐·destroy 실패를 인프라 측에서 한 번에 닫아야 했다. 공유 MSK 한 클러스터에 dev·staging이 동시 가동되며 토픽/그룹에 환경 구분이 없어 파티션이 교차 배정되므로, 토픽명에 환경 프리픽스를 주면 한 클러스터 안에서 완전 격리되고 인프라 주입은 앱 채택 전까지 inert라 무중단 선행이 가능. gateway/shared는 직접 작업 허용 레포라 prometheus 노출·compose DB 분리를 직접 처리. |
| **Problem** | (인증) gateway 사본 키 오염 + 서비스 미주입이 에러 아닌 ephemeral 폴백으로 전수 401. (검색) 토픽·멱등store·다운스트림 URL 중 하나라도 localhost 폴백이면 조용히 유실/DLQ. (관측) cAdvisor roll-up 무필터 합산·비-Spring 워크로드 무차별 스크랩·Boot 4.0 노출 부족(레지스트리 미존재 404)으로 오탐. (destroy) `--field-selector spec.type=`가 BadRequest(애초 무동작), 컨트롤러 동적 SG·EBS가 state 밖이라 VPC teardown 차단·과금. (#199) 토픽명이 일부 env-driven·일부 하드코딩 상수(`NoteSearchSyncRequested.TOPIC`)·DLQ라 앱 전수 치환 필요, 옵션 A는 공유 Redis/테넌트 교차오염·C는 비용 과다. (compose) 단일 DB 공유로 서비스 간 Flyway 버전 충돌. |
| **Solution** | 인증은 공개키 SoT(서명 주체 remoteRef)+키 주입, 검색은 토픽·Redis·URL 동시 주입, 관측은 `container!=""` 필터+실측 상향+비대상 제외+gateway 레지스트리 추가, destroy는 jsonpath 열거+SG revoke·EBS reap. #199는 프리픽스 `<env>.`로 결정→gitops 주입·bring-up 레거시 병존 생성(무중단)→shared 단일 계약→앱 owner 위임(데모 전 staging knowledge scale-down 임시책, origin 확인: platform#102 해소·learning/engagement dev·knowledge 미착수). compose는 `scripts/initdb`를 기본 compose에 마운트(기존 볼륨 `down -v` 안내). |
| **회고** | 라이브 마감일의 직접 작업은 한 주제가 아니라 **인증·검색·관측·IaC·격리를 가로지르는 통합 오너십**이었다. 반복 교훈: **단일 서명자 자산은 사본 없이 SoT**(미주입은 에러 아닌 폴백이라 더 위험), **파이프라인은 토픽·멱등store·URL이 모두 충족돼야**(localhost 폴백 조용한 유실), **관측 알람은 끄기 전에 실측으로 진성 신호 분리**, **컨트롤러 동적 자산(SG·EBS)은 명시 reap**, **Boot 4.0 노출은 설정+레지스트리 둘 다**. #199는 **env 주입(gitops)≠앱 배선** 원칙이 멀티환경 격리에서도 그대로 — 인프라는 inert로 선행, 충돌 해소는 앱 채택까지 origin으로 추적하는 위임형 마감. 만드는 사람→감사·위임자→**실 통합 오너**로 한 바퀴 돈 W5의 마지막 날. |
