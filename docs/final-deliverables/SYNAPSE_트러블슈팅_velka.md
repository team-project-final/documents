# SYNAPSE 트러블슈팅 모음 (velka)

- **생성일**: 2026-05-26
- **최종 업데이트**: 2026-06-15 (06-12 직접 작업 잔여 8건 추가 — JWT 공개키 사본 드리프트 401(#196)·검색 인덱싱 파이프라인 3중 단절(#198)·SynapseHighMemory cAdvisor 이중합산 오탐(#194)·bastion cloud-init IAM 레이스+ECR IaC 분리(#182)·ServiceMonitor 비-Spring 3종 오탐(#207)·gateway Boot 4.0 prometheus 미노출(#7)·destroy 선정리 갭 3건·로컬 compose 단일 DB Flyway history 충돌(#75)) + **부록 A 신설** — 팀 레포 교차 트러블슈팅 13건(team-lead 연관, 본인 외 owner 작성: #199 앱채택·search consumer-group·Flyway/KAFKA_ENABLED/MSK TLS 앱채택·actuator 정합·ReviewCompleted DLT·platform DB URL·AI카드 계약·dev-smoke 함정·SSE 게이트웨이·G7 revert)
- **직전 업데이트**: 2026-06-12 (06-09~06-11 W5 + 06-12 #199 dev·staging Kafka 토픽 격리 반영 — 실 EKS dev+staging 16/16 Healthy·ES nori 실기동·bring-up 견고화·Avro 정본 분기 P0/DLT·actuator 401 CrashLoop·learning-ai Kafka SSL·frontend deploy 재발산 방지·24h 소크·**토픽 환경 프리픽스**)
- **이전 업데이트**: 2026-06-08 (05-30~06-08 운영 점검·감사·표준화 작업 반영 — Kafka 4서비스 감사·TLS MSK 갭 조사·gitops Kafka SSL/ES 전환·Flyway 표준·아키텍처 현황 보고서·main 직행 PR 정리)
- **재정렬**: 2026-06-01 — 영역별 구성에서 전체 일자 오름차순(옛날→최신) 단일 목록으로 재배열
- **저자(본인) 별칭**: velka, Qahnaarin, Velkaressia, VelkaressiaBlutkrone (모두 동일 인물, `deepestdark@gmail.com`)
- **형식**: 인시던트마다 `날짜` 그룹 아래 `제목` + `증상 / 원인 / 해결 / 배운 점` 4행 표 (트러블슈팅 템플릿). 각 인시던트의 영역(인프라/백엔드/프론트엔드/문서)은 레포명·식별자(T-0xx/D-0xx/G-x)로 식별 가능
- **출처**: 18개 레포 본인 커밋(fix/revert/refactor) + `synapse-gitops/docs/runbooks/troubleshooting-infra.md`(T-0xx/D-0xx) + `docs/kafka-service-audit-2026-06-02.md` + `docs/synapse-architecture-status-2026-06-08.md`(G1~G8) + W5 라이브 핸드오프(`synapse-gitops` HANDOFF_W5·`synapse-shared` Day3/Day4 closeout) + 통합 차단 PR(engagement#32·#33·#42·#44, learning#64·#67, frontend#54~#56, gitops#164·#165·#174·#191·#194) + 06-12 직접 작업(gitops#182·#194·#196·#198·#207·543f48b, gateway#7, shared#75) + **부록 A(팀 owner 커밋)** knowledge#45/#51/#54/#76/#85/#86/#91/#92, learning#46/#53/#63/#79/#84/#87/#94/#96, engagement#48/#50, platform#108, frontend#27~#30/#42
- **범위 주의(05-30 이후)**: 이 구간은 [[repo-edit-scope-policy]]에 따라 직접 작업은 `synapse-gitops`·`synapse-shared`·`synapse-gateway` + 문서에 한정했고, 서비스 레포(platform/knowledge/learning/engagement) 변경은 GitHub 이슈로 위임했다. 따라서 아래 06-02~06-08 인시던트는 **감사로 발견한 간극**과 **인프라/공유 계약/문서 측 조치**가 중심이며, 서비스 측 앱 수정은 위임 이슈로 표기한다.
- **범위 변화(06-09 이후 W5)**: 라이브 통합·릴리스 마감 구간에서는 위임만으로 체인이 닫히지 않는 **통합 차단(release-blocking) 결함**에 한해 서비스 레포(engagement/learning/frontend)도 직접 수정했다 — Avro writer 스키마 정본 분기(P0/DLT), Kafka SSL 배선, actuator 프로브 401, deploy 재발산. 즉 velka의 역할이 **감사·위임자**에서 **실 EKS/staging 통합 오너 + 크로스커팅 계약/배포 통합자**로 넓어졌다. platform/knowledge의 기능 API·검색 등 도메인 개발은 여전히 각 owner 몫이라 본 문서에는 포함하지 않는다.
- **관련 회고 문서**: [레포별](./SYNAPSE_개인회고_velka.md) · [주제별](./SYNAPSE_개인회고_주제별_velka.md) · [일정별](./SYNAPSE_개인회고_일정별_velka.md)

## 전체 요약

총 **86건**의 인시던트를 전체 일자 오름차순으로 정리했다(원래 4개 영역 — 인프라·백엔드·프론트엔드·문서 — 분류는 각 인시던트의 레포/식별자로 확인 가능). 반복적으로 나타난 근본 원인 계열은 다음과 같다 — **(1) `terraform destroy/apply` 재생성으로 바뀌는 식별자**(OIDC Provider ID, MSK 브로커 주소, EKS cluster SG)를 하드코딩해 매번 깨짐, **(2) 앱↔인프라 계약 불일치**(환경변수 14개 누락, AES 키 인코딩/길이, `mfa_credentials`·Flyway 컬럼명), **(3) 프레임워크 메이저 업그레이드 부작용**(Boot 4 / ArchUnit 1.3.0 / Jackson 3, Gateway YAML 라우트 버그), **(4) 컨테이너 빌드 컨텍스트·레이어 순서 + gradlew 권한**, **(5) React `useSyncExternalStore` 셀렉터 참조 불안정(#185 무한 루프)**, **(6) 모바일 CSS**(그리드 0px 붕괴·source order·고정 폭), **(7) gh-pages 서브경로 배포**(base path 404·ESM/CJS·SPA 딥링크 404), **(8) 자동 파이프라인 vs 수기 데이터 충돌**(덮어쓰기·진행률 역행·push race), **(9) 문서 정합성 드리프트**, **(10) relaxed-binding 환경변수 키 오배선과 probe vs actuator-aggregate 헬스 괴리**(앱이 읽는 prefix와 다른 키 주입으로 의존성이 health group 밖에서 장기 잠복), **(11) Flyway가 core 대신 starter 의존성이어야 자동설정이 걸리는 침묵 실패**(마이그레이션이 에러 없이 누락), **(12) 문서가 목표 아키텍처를 현재 실재처럼 단정하는 픽션 드리프트**(목표/실재 미분리로 권위 문서가 픽션화), **(13) gitops env-only 설정이 필요조건일 뿐 충분조건이 아님**(서비스 커스텀 Kafka 팩토리가 `security.protocol`을 안 읽어 SSL env가 no-op), **(14) 클라이언트↔서버 엔진 비호환 + dead config**(ES9 client가 product check로 OpenSearch 거부 + 앱이 안 읽는 `OPENSEARCH_URL` 주입), **(15) Flyway 전역 정수 버전 수동 선택이 부른 병렬 브랜치 중복**(platform V28 충돌), **(16) 로컬 클론 stale로 인한 머지/구현 상태 오판**(fetch 없이 로컬 main 신뢰), **(17) main 직행 머지가 부른 main↔dev 발산과 dev 재타겟 충돌**. **06-09 이후 W5 라이브 통합에서 새로 드러난 계열** — **(18) producer↔consumer Avro writer 스키마 정본 분기**(namespace·공통메타·필드 불일치로 역직렬화 실패→DLT, 토픽 네이밍은 맞아도 페이로드가 깨짐), **(19) `/actuator/health` 정확 매칭이 K8s 프로브 하위경로(`/liveness`·`/readiness`)를 401로 떨궈 livenessProbe SIGTERM CrashLoop**(엔드포인트 존재→404 아닌 401), **(20) 식별자 도출 비결정성**(JWT subject UUID claim 부재 시 HTTP·Kafka 경로가 서로 다른 Long을 생성), **(21) 라이브 EKS 1회성 레이스/순서 의존**(fsGroup·gp3 SC·es-reindex 타이밍, 404 본문 grep 오탐, orphan ALB/NLB가 VPC teardown 차단), **(22) 증상 오진 → 잘못된 수정 → revert → 실 근본원인**(engagement 콜드스타트로 오진했으나 실제는 actuator 401), **(23) 결정성 없는 이미지 태그**(dev-latest 부동 태그로 staging ImagePullBackOff·롤백 불가 → SHA 핀), **(24) 분기 보호 ruleset의 strict/컨텍스트 설정이 부른 직렬 머지 BEHIND 레이스·PR BLOCKED**. **06-12 직접 작업이 더한 계열** — **(25) 단일 서명자 자산(JWT 공개키)의 사본 드리프트 + 미주입 시 조용한 ephemeral 키 폴백**(사본 오염/미주입이 에러 아닌 전수 401로 발현), **(26) cAdvisor `container=""` cgroup roll-up 무필터 합산에 의한 메모리 사용률 이중합산 오탐**(최대 194%), **(27) Terraform `user_data`/스크립트의 문자열 리소스 참조가 암묵 의존성을 만들지 않아 생기는 cloud-init IAM 전파 레이스**, **(28) actuator 전제 ServiceMonitor를 비-Spring 워크로드에 적용한 상시 TargetDown 오탐 + Boot 4.0 prometheus 노출이 exposure 설정만으론 부족(micrometer 레지스트리 의존성 필요)**, **(29) `kubectl --field-selector`의 리소스별 지원 필드 제한과 컨트롤러 동적 생성 자산(SG·EBS PV)이 Terraform state 밖이라 부르는 teardown 차단·orphan**, **(30) 로컬 단일 DB 공유로 인한 서비스 간 Flyway history 버전 충돌**(전역 정수 버전 충돌의 compose판).

배운 점도 영역을 가로질러 수렴한다: **멱등·단조(monotonic) 불변식을 쓰기 시점에 강제**하고, **단일 출처(SoT)에서 단방향 동기화**하며, **가정한 엔드포인트가 아니라 환경이 실제 제공하는 신호로 검증**하고, **잘못 머지된 변경은 억지 수정보다 Revert 후 깨끗이 재작성**한다. 05-30 이후 운영 점검 구간이 더한 교훈은 **상태 단언은 반드시 `git fetch` 후 origin 기준으로**(로컬 클론은 stale), **env 주입은 앱이 실제 읽는 코드 경로까지 대조**(주입≠배선), **표준은 문서가 아니라 CI 가드로 강제**(타임스탬프 버전+`flyway_guard.py`), **간극은 번호화(G1~G8)해 origin 근거와 함께 상태를 재판정**한다는 것이다. 06-09 이후 W5 라이브 통합이 더한 교훈은 **계약은 토픽 네이밍이 아니라 writer 스키마 정본(namespace·공통메타·필드)까지 일치해야 닫히고**(불일치는 런타임 DLT로만 드러남), **헬스 프로브는 하위경로까지 permit·검증해야 하며**(probe 401은 무한 재시작), **라이브 EKS 결함은 1회성 순서·레이스라 실기동 검증으로만 잡히고**, **오진 위에 쌓은 수정은 revert 후 실 근본원인부터 다시**, **배포 태그는 SHA로 고정해 결정성·롤백을 확보**하고, **위임만으로 안 닫히는 release-blocking 결함은 직접 통합 수정**한다는 것이다. 06-12 직접 작업이 더한 교훈은 **단일 서명자 자산은 사본 없이 단일출처(SoT)로** 두고(미주입은 에러가 아니라 ephemeral 폴백이라 더 위험), **관측 알람은 끄기 전에 실측으로 진성 신호를 분리**하며(cAdvisor roll-up 제외 + 메모리 실측 상향, 비-Spring 워크로드는 스크랩 대상에서 제외), **수명주기가 다른 자산(ECR 이미지)은 destroy 대상 스택에서 분리**하고, **컨트롤러가 동적 생성한 자산(SG·EBS PV)은 명시적으로 reap**해야 teardown이 막히지 않는다는 것이다. 한편 본인이 직접 닫지 않았더라도 **team-lead/gitops·shared·gateway 영역과 맞물린 팀 owner측 인시던트는 부록 A**(문서 하단)에 따로 모았다 — 상당수가 velka가 감사·표준·인프라로 선행한 갭의 앱측 종결(MSK TLS·Flyway·KAFKA_ENABLED·#199 prefix)이거나, velka가 인프라측에서 본 증상의 앱측 근본(검색 0건·actuator·DLT)이다.

## 일자 인덱스

| 날짜 | 건수 | 주요 인시던트 |
| --- | --- | --- |
| [2026-05-09](#2026-05-09) | 2 | React #185 무한 루프, Mermaid securityLevel |
| [2026-05-10](#2026-05-10) | 2 | 스토어 셀렉터 Object.values, /docs auto-split 롤백 |
| [2026-05-11](#2026-05-11) | 3 | Mermaid foreignObject 잘림, dnd StrictMode, SPA 딥링크 404 |
| [2026-05-13](#2026-05-13) | 1 | 정적 빌드 BASE_PATH 누락 |
| [2026-05-14](#2026-05-14) | 2 | 시뮬레이터 Stripe/CloudEvents, 탭 레이아웃·Mermaid raw |
| [2026-05-15](#2026-05-15) | 1 | ADR 채택 후 위키 정합성 드리프트 |
| [2026-05-18](#2026-05-18) | 1 | gradlew 실행권한 누락 |
| [2026-05-19](#2026-05-19) | 6 | Boot 4 업그레이드(ArchUnit/Jackson/bean/erasure/Gateway), 파서 PRD 덮어쓰기 |
| [2026-05-20](#2026-05-20) | 5 | Dockerfile 재작성, learning-ai COPY, SideNav, PM 문서, gh-pages |
| [2026-05-21](#2026-05-21) | 13 | env 14개 누락, Flyway/JPA, MSK 주소, 모바일 CSS, sync race |
| [2026-05-26](#2026-05-26) | 12 | AES 키, OIDC/SG, bring-up 갭, Redis 키 오배선, Loki |
| [2026-05-27](#2026-05-27) | 5 | Kafka JSON 분리, Flyway starter, ES 호환, JWT 키, 온보딩 링크 |
| [2026-05-28](#2026-05-28) | 3 | Redis 헬스 게이트, API 529, 위키 픽션 P0 |
| [2026-06-02](#2026-06-02) | 1 | Kafka 4서비스 감사: engagement 컨슈머 부재·CI 계약검증 부재·버전 드리프트 |
| [2026-06-04](#2026-06-04) | 2 | Kafka TLS MSK env-only 미배선 갭, knowledge OpenSearch↔ES 이중 불일치 |
| [2026-06-05](#2026-06-05) | 2 | Flyway V28 중복 충돌, KAFKA_ENABLED 게이트 no-op (ES 전환 D-003은 06-04 ES 불일치 해결로 기록) |
| [2026-06-08](#2026-06-08) | 2 | main 직행 PR dev 재타겟 충돌, 로컬 클론 stale 머지상태 오판 |
| [2026-06-09](#2026-06-09) | 3 | Avro writer 스키마 정본 분기(P0/DLT), JWT subject 식별자 비결정성, learning-ai Kafka SSL CrashLoop |
| [2026-06-10](#2026-06-10) | 4 | actuator 하위경로 401 CrashLoop, ruleset 컨텍스트·BEHIND 레이스, psql \gexec, DLT 가설 A |
| [2026-06-11](#2026-06-11) | 7 | EKS ES 실기동 레이스, nori 커스텀 이미지, 콜드스타트 오진→revert, 이미지 태그 ImagePullBackOff, destroy orphan LB, 컨트롤플레인 룰 false-positive, node20→24 |
| [2026-06-12](#2026-06-12) | 9 | JWT 공개키 사본 드리프트 401(#196), 검색 인덱싱 3중 단절(#198), 메모리 cAdvisor 이중합산 오탐(#194), bastion cloud-init 레이스+ECR IaC(#182), dev·staging 공유 MSK 토픽 격리(#199), ServiceMonitor 비-Spring 오탐(#207), gateway Boot4 prometheus 미노출(#7), destroy 선정리 갭 3건, compose 단일 DB Flyway 충돌(#75) |
| **부록 A** | 13 | 팀 레포 교차 트러블슈팅(team-lead 연관, 본인 외 owner 작성) — 일자 인덱스 미포함, 문서 하단 별도 정리 |

---

## 2026-05-09

### React #185 무한 업데이트 루프 제거 (synapse-prototype)
| 항목 | 내용 |
| --- | --- |
| **증상** | 프로덕션에서 화면이 ErrorBoundary로 떨어지며 빈 화면 표시, "Maximum update depth exceeded" 발생 |
| **원인** | ① SeedGuard의 useEffect deps `[seeded, setSeeded]`가 setSeeded마다 재구독·재실행되어 5개 스토어 setState가 동기 재렌더 루프를 유발<br>② Groups의 셀렉터 `s.myGroups()`/`s.exploreGroups()`가 인라인 메서드 호출로 매 getSnapshot()마다 새 배열 반환 → Zustand v5의 useSyncExternalStore가 참조 변경을 감지해 25렌더 한도 초과 |
| **해결** | SeedGuard는 deps `[]`로 바꾸고 `getState()`로 마운트 시 1회 명령형 처리, Groups는 안정적인 groups 맵을 선택하고 필터 배열은 렌더 본문에서 파생 (commit 380dfb9). 앞서 무인자 `useStore()`/메서드 셀렉터도 primitive/property 셀렉터로 교체 |
| **배운 점** | useSyncExternalStore 기반 스토어에서 셀렉터가 매 렌더 새 참조(배열/객체)를 반환하면 즉시 무한 루프로 이어진다. 셀렉터는 안정 참조만 선택하고 파생 계산은 렌더 본문으로 빼야 한다. |

### Mermaid securityLevel 강화 및 docs slug path traversal 차단 (synapse-prototype)
| 항목 | 내용 |
| --- | --- |
| **증상** | Mermaid 에러 렌더가 innerHTML 경로를 타고, docs 로더가 임의 slug를 그대로 fetch하여 path traversal 위험 노출 |
| **원인** | Mermaid 기본 securityLevel 미지정 + 에러 메시지를 innerHTML로 주입, docs-loader가 slug 검증 없이 경로 조합 |
| **해결** | Mermaid에 `securityLevel='strict'` 명시, 에러 메시지를 textContent로 출력, docs-loader는 fetch 전 DOCS allowlist로 slug 검증 (commit 54aa4b3) |
| **배운 점** | 사용자 입력(slug)·서드파티 렌더러(Mermaid)는 항상 allowlist 검증과 textContent 주입으로 신뢰 경계를 명시해야 한다. |

---

## 2026-05-10

### 잔여 스토어 셀렉터의 Object.values 호이스팅 (synapse-prototype)
| 항목 | 내용 |
| --- | --- |
| **증상** | NotesList/DecksList/Graph/Search/AIGenerate 및 NoteEditor/MarkdownRenderer/NoteView가 빈 화면으로 ErrorBoundary에 떨어짐 |
| **원인** | 다섯 라우트가 Zustand 셀렉터 내부에서 `Object.values`를 호출하고, NoteView는 `s.backlinksOf(...)`를 셀렉터 안에서 호출 → 매 렌더 새 배열 반환으로 React #185("getSnapshot should be cached") 재발 |
| **해결** | Dashboard/Profile/Groups의 정상 패턴대로 기저 notes 객체 참조를 선택하고, `Object.values`/backlinks 계산은 컴포넌트 본문에서 수행하도록 두 차례에 걸쳐 수정 |
| **배운 점** | 같은 안티패턴이 코드베이스 곳곳에 흩어져 있을 수 있다 — 한 곳을 고치면 동일 셀렉터 패턴을 전수 검색해 일괄 정리해야 재발을 막는다. |

### /docs h2 auto-split UX 롤백 (synapse-prototype)
| 항목 | 내용 |
| --- | --- |
| **증상** | 20k자 이상 문서를 h2 기준으로 자동 분할(부모 인덱스 + 목차 + 서브페이지)했더니 내비게이션이 혼란스럽고, 페이지 전환이 부자연스러우며 딥링크 breadcrumb 누락·일부 서브페이지 링크 사망 |
| **원인** | 길이 임계값 기반의 일괄 분할이 실제 문서 구조·사용자 기대와 맞지 않았고(02_ERD, 04_API, 06_화면기능, 09_Git, 18_기술스택), 분할에 따른 라우팅/링크 정합성을 보장하지 못함 |
| **해결** | auto-split 분기를 sync-docs.mjs에서 통째로 제거하고 모든 .md를 단일 페이지로 렌더, `/docs/:slug/:sub` 라우트 삭제, Slug.tsx를 단일 `:slug`로 단순화 (commit 029e527). 사이드바 트리·TOC 스크롤스파이·mermaid pre-render는 그대로 유지 |
| **배운 점** | 길이 기반 일괄 자동 분할은 위험하다 — 분할이 필요하면 작성자 opt-in 방식이 더 안전하다. UX 실험이 실패하면 빠르게 revert하는 게 정답일 때가 있다. |

---

## 2026-05-11

### Mermaid SVG foreignObject 텍스트 잘림 (synapse-prototype)
| 항목 | 내용 |
| --- | --- |
| **증상** | docs 본문·컴포넌트·확대 모달의 Mermaid 다이어그램에서 텍스트가 잘려 표시됨 |
| **원인** | mermaid-cli가 서버 측 폰트 메트릭으로 foreignObject 폭을 계산하는데, 이 값이 브라우저 실제 폰트와 달라 `overflow:hidden`에 의해 텍스트가 truncate됨 |
| **해결** | 모든 Mermaid SVG 컨텍스트에서 foreignObject와 내부 div의 `overflow:hidden`을 `overflow:visible`로 오버라이드 (commit 0cce8fac, SvgZoomModal.tsx + globals.css) |
| **배운 점** | 서버 사이드 렌더와 클라이언트 폰트 메트릭이 다르면 폭 계산이 어긋난다 — foreignObject 텍스트는 overflow:visible로 클라이언트 reflow를 허용하는 편이 안전하다. |

### @hello-pangea/dnd StrictMode·transform·Modal containing block 충돌 (schedule-repo)
| 항목 | 내용 |
| --- | --- |
| **증상** | 칸반 드래그앤드롭이 동작 안 하거나 드롭 위치가 어긋나고, 모달이 잘못된 위치에 렌더링됨 |
| **원인** | React StrictMode 이중 렌더가 @hello-pangea/dnd와 비호환, 카드/레이아웃의 anim-fade transform이 containing block을 만들어 fixed 포지셔닝과 드롭 좌표를 왜곡 |
| **해결** | StrictMode 해제 + KanbanCard/Layout의 anim-fade transform 제거(a8303fb, 7f7154c), Modal을 createPortal로 body에 렌더 + ESC 닫기·스크롤 잠금 추가. dnd 비호환 환경 대비 상태 전환 버튼 fallback도 제공(6f9913e) |
| **배운 점** | CSS transform은 자식의 fixed 요소에 대해 새 containing block을 만들어 드래그 좌표계를 깨뜨린다.<br>dnd 라이브러리는 StrictMode 이중 마운트에 민감하므로 호환성 매트릭스를 먼저 확인해야 한다. |

### SPA 딥링크 404 (schedule-repo)
| 항목 | 내용 |
| --- | --- |
| **증상** | 가이드/로그인 콜백 등 딥링크 직접 접근 시 GitHub Pages가 404 반환, favicon 콘솔 에러 |
| **원인** | 정적 호스팅이 SPA 클라이언트 라우트의 실제 파일을 못 찾음. favicon 경로(vite.svg)도 빌드 산출물과 불일치 |
| **해결** | 404.html SPA fallback 추가(782a985), post-build 스크립트로 SPA 라우트를 dist에 사전 생성해 200 응답 + favicon 경로 정정(024ac88), login/callback 라우트 추가(206399f) |
| **배운 점** | 정적 호스팅에서 SPA 딥링크는 404 fallback 또는 라우트별 사전 생성 없이는 직접 진입이 불가능하다. |

---

## 2026-05-13

### 정적 빌드 BASE_PATH 누락으로 자산 경로 깨짐 (documents)
| 항목 | 내용 |
| --- | --- |
| **증상** | GitHub Pages 배포 시 /assets/styles.css 등 절대경로가 404 |
| **원인** | 사이트가 /workflow-guide/ 서브경로로 서빙되는데 빌드 파이프라인이 base prefix 없이 절대경로 출력 |
| **해결** | BASE_PATH 환경변수 도입(로컬 프리뷰 기본 빈 값), parse-metadata·render-home/week/404·inject-wrapper·render-shell·layout-shell에 일괄 적용, app.js는 import.meta.url로 fuse 로드해 base 무관 동작, CI에서 BASE_PATH=/workflow-guide 설정(45709b4) |
| **배운 점** | 서브경로 배포 환경에서는 base path를 빌드 파이프라인 전 구간에 한 번에 주입해야 하며, 자산 로드는 import.meta.url 기반으로 두면 환경에 독립적이다. |

---

## 2026-05-14

### 시뮬레이터 로직 버그: Stripe plan 미해석 · CloudEvents ID 비고정 (moking-data-guide)
| 항목 | 내용 |
| --- | --- |
| **증상** | Stripe 시뮬레이터의 Kafka 이벤트 plan 값이 잘못 표시되고, CloudEvents 출력이 실행마다 ID가 바뀌어 재현 불가 |
| **원인** | kafkaEvent.plan을 현재 상태가 아닌 함수 리터럴 시점 값으로 캡처. 이벤트 ID/날짜를 매 렌더 동적 생성 |
| **해결** | plan을 현재 state에서 해석하도록 수정(f9197d7), 이벤트 ID를 고정값으로 + BASE_DATE 상수 도입해 재현성 확보(6bbc220). 부수적으로 SemanticCache 시뮬레이터의 OPENAI 태그를 CLAUDE로 정정(c80e2e4) |
| **배운 점** | 클로저가 캡처하는 값이 최신 state인지 항상 확인해야 한다(stale closure).<br>데모/시뮬레이터는 ID·시각을 고정해야 산출물이 재현 가능하고 신뢰를 준다. |

### 탭 레이아웃 깨짐 + Mermaid raw 노출 (moking-data-guide)
| 항목 | 내용 |
| --- | --- |
| **증상** | 11개 탭이 한 줄에 안 들어가 넘치고, 5개 docs HTML의 Mermaid 코드 블록이 다이어그램 대신 raw 텍스트로 표시됨 |
| **원인** | 탭 nav가 단일 행 가정 + 패딩 과다. Mermaid 렌더러가 정적 사이트에 미적용되어 코드 펜스가 그대로 노출 |
| **해결** | 탭 nav를 2행 wrap + 패딩 축소 + 활성 탭 scroll-into-view 처리, 폰트·간격 복원(9191b73, 7e0cda5). Mermaid를 click-to-zoom 모달 SVG로 렌더링(vanilla JS)(4b83168) |
| **배운 점** | 탭 수가 늘면 단일 행 가정이 깨지므로 wrap·스크롤을 기본 전제로 설계해야 한다.<br>정적 사이트는 Mermaid 같은 마크다운 확장을 빌드/런타임에서 명시 렌더링하지 않으면 raw로 샌다. |

---

## 2026-05-15

### ADR 채택 후 위키 정합성 드리프트 (documents / documents.wiki)
| 항목 | 내용 |
| --- | --- |
| **증상** | ADR-001/002(10→4 서비스 통합) 채택 후 PRD/TASK/WORKFLOW의 ERD 테이블·컬럼·enum, API 엔드포인트, Kafka 토픽 구분자가 위키 기준과 어긋남 |
| **원인** | ADR로 아키텍처가 바뀌었으나 산하 PM 문서들이 위키(02 ERD / 03 아키텍처 / 04 API)와 독립적으로 유지돼 단일 출처 미동기화 |
| **해결** | 위키 ERD 기준으로 테이블/컬럼/enum 일괄 정정(6abe614, groups→study_groups, rating 1-4 통일 등), enum·OpenSearch→Elasticsearch 등 아키텍처 정합 동기화(2a9b145), 위키 측엔 누락 테이블 3건·API 13건 보강(bd8a03d, 99fa889). 사전에 정합성 audit·action plan 문서화(e08d88e, 2449561) |
| **배운 점** | ADR은 결정만 기록할 뿐 산하 문서를 자동 갱신하지 않는다. 위키를 단일 출처로 두고 후속 동기화 사이클을 명시적으로 돌려야 드리프트가 누적되지 않는다.<br>정합성 audit 리포트를 먼저 만들고 일괄 수정하면 누락을 줄일 수 있다. |

---

## 2026-05-18

### gradlew 실행권한 누락으로 CI 실패 (knowledge / engagement / learning-svc)
| 항목 | 내용 |
| --- | --- |
| **증상** | GitHub Actions CI에서 `./gradlew` 실행이 권한 의존적으로 불안정. |
| **원인** | `gradlew`가 실행권한 없이(100644) 커밋됨. `setup-gradle@v4`가 암묵적으로 권한을 부여해 통과 중이었으나 취약한 상태. learning-svc는 추가로 중복 `ci-java.yml` 워크플로우와 gradlew 위치(`learning-card/`) 문제까지 겹침. |
| **해결** | git file mode를 100755로 수정하고 워크플로우에 `chmod +x gradlew` 안전망 추가. learning-svc는 중복 워크플로우 제거 + `working-directory: learning-card` 지정 + ruff/mypy lint 위반까지 정리. |
| **배운 점** | CI 통과가 "행운(암묵적 권한 부여)"에 기대고 있을 수 있다. 실행 파일은 git mode를 명시적으로 100755로 고정하고 워크플로우에 안전망을 둬야 한다. |

---

## 2026-05-19

### Spring Boot 3.3.5→4.0.6 업그레이드 후 ArchUnit 빌드 깨짐 (synapse-svc-template)
| 항목 | 내용 |
| --- | --- |
| **증상** | Boot 3.3.5→4.0.6 업그레이드(Gradle 9.5.1, Java 21) 후 `./gradlew build` 시 ArchUnit 아키텍처 테스트가 컴파일/검증 실패. |
| **원인** | ArchUnit 1.3.0에서 `containAnyMethodsThat()` API 변경 — 무인자 호출 불가, `DescribedPredicate<JavaMethod>` 필요.<br>또한 도메인 슬라이스 룰이 `global` 패키지까지 슬라이스로 매칭해 정상 의존을 위반으로 판정. |
| **해결** | `annotatedWithKafkaListener()` helper predicate 추가.<br>슬라이스 룰에 global 양방향 `ignoreDependency` 추가, `application`이 응답 DTO 생성을 위해 `api/dto`는 의존 허용하도록 룰명·범위 정밀화. 4개 서비스 골격에 동일 패턴 적용. |
| **배운 점** | 메이저 프레임워크 업그레이드는 런타임뿐 아니라 ArchUnit 같은 테스트 라이브러리 API 변경도 동반된다. 아키텍처 룰은 의도하지 않은 패키지(global)까지 매칭하지 않도록 예외를 명시해야 한다. |

### Jackson 3 전환으로 JsonSerializer deprecated (synapse-svc-template)
| 항목 | 내용 |
| --- | --- |
| **증상** | Boot 4.0(Spring Kafka 4.0) 업그레이드 후 `JsonSerializer`/`JsonDeserializer`가 deprecation warning을 발생시킴. |
| **원인** | Boot 4.0이 Jackson 3 기반으로 전환되면서 기존 Spring Kafka의 `JsonSerializer`/`JsonDeserializer`가 deprecated 처리됨. |
| **해결** | `JacksonJsonSerializer`/`JacksonJsonDeserializer`(Jackson 3 신규 API)로 교체, `JsonMapper` 사용으로 type safety 향상, `TRUSTED_PACKAGES`도 `JacksonJsonDeserializer.TRUSTED_PACKAGES`로 이전. platform/knowledge/engagement/learning 4개 서비스 KafkaConfig에 동일 적용 → deprecation warning 0개. |
| **배운 점** | 직렬화 계층은 프레임워크 메이저 버전과 강하게 결합돼 있어, Jackson 메이저 전환 시 직렬화기 클래스명·상수 위치까지 함께 마이그레이션해야 한다. |

### Kafka Consumer bean name 충돌 (synapse-svc-template)
| 항목 | 내용 |
| --- | --- |
| **증상** | knowledge 서비스 빌드 시 Spring 컨텍스트 기동 중 동일 bean name 충돌로 실패. |
| **원인** | `graph/`와 `chunking/` 양쪽에 동일 클래스명 `NoteCreatedConsumer`(W4에서는 `NoteCreatedKafkaConsumer`)가 존재해 Spring 기본 bean name(`noteCreatedConsumer`)이 중복 생성됨. |
| **해결** | `@Component("graphNoteCreatedConsumer")` / `@Component("chunkingNoteCreatedConsumer")`처럼 명시적 bean name을 부여해 분리(W3·W4 모두). `./gradlew build` PASS. |
| **배운 점** | 도메인 슬라이스를 나누면 동일한 의미의 클래스가 여러 패키지에 생기기 쉽다. 단순 클래스명에 의존하는 Spring 기본 bean name은 충돌하므로 명시적 이름 부여가 안전하다. |

### Point/Badge adapter 제네릭 erasure 충돌 (synapse-svc-template)
| 항목 | 내용 |
| --- | --- |
| **증상** | engagement 서비스 빌드 시 `GamificationPersistenceAdapter`에서 컴파일 에러. |
| **원인** | 한 adapter가 `PointPort` + `BadgePort`를 동시 구현하면서 `findByUserId(Long)`이 제네릭 erasure 후 동일 시그니처(`List<Point>` vs `List<Badge>`)로 충돌. |
| **해결** | `PointPersistenceAdapter` + `BadgePersistenceAdapter`로 분리해 각 adapter가 단일 port만 구현(SRP)하도록 변경. `./gradlew build` PASS. |
| **배운 점** | 제네릭 반환 타입만 다른 동일 메서드는 erasure 후 충돌한다. 포트 하나당 어댑터 하나로 분리하면 충돌도 막고 책임도 명확해진다. |

### Boot 4.0.6 YAML 라우트 버그로 Java config 전환 (synapse-gateway)
| 항목 | 내용 |
| --- | --- |
| **증상** | gateway에서 `application.yml` 기반 라우트 정의가 Boot 4.0.6에서 정상 동작하지 않음. |
| **원인** | Spring Cloud Gateway 5.0.1 / Boot 4.0.6 조합에서 YAML 라우트 정의 버그. 더불어 CI의 `amazon-ecr-login@v2`가 Node.js 20 deprecation 대상. |
| **해결** | YAML 라우트를 `RoutesConfig` Java config(`RouteLocator` 빈)로 전환 — 4개 서비스 라우트 + `RedisRateLimiter`(IP 기반) + `CorsWebFilter` 구성. 라우팅/429/CORS 헤더 검증 완료. 별도 커밋에서 `amazon-ecr-login@v2→@v3` 업그레이드 및 master→main 브랜치 정리. |
| **배운 점** | 메이저 프레임워크 초기 버전(.0.x)은 선언적 설정(YAML)에 버그가 있을 수 있어, 동작이 검증된 programmatic(Java config) 경로로 우회하는 것이 빠르다. CI 액션도 런타임 deprecation에 맞춰 함께 올려야 한다. |

### 자동 파서 CI가 수기 PRD 데이터 덮어쓰기 (workflow-dashboard)
| 항목 | 내용 |
| --- | --- |
| **증상** | synapse-gitops 트랙의 PRD 항목이 사라져 디테일 화면이 비고, validate:data CI가 빈 prd 배열로 실패 |
| **원인** | sync 파서 CI가 서비스 레포를 파싱해 data/*.json을 덮어쓸 때, 수기로 채워둔 PRD를 빈 배열로 밀어버림 |
| **해결** | W1~W5 PRD 항목을 트랙의 주차별 step 정의 기준으로 재작성·복원(65bad2f), 이후 손실분도 다시 복구(c6a35b9) |
| **배운 점** | 자동 파서와 수기 데이터가 같은 파일을 공유하면 파서가 항상 이긴다. 파서가 비우지 못하는 보호 필드 또는 머지 정책이 선행돼야 한다.<br>CI validation이 데이터 유실의 마지막 안전망 역할을 했다. |

---

## 2026-05-20

### EKS Dockerfile 추가→Revert→재작성 (knowledge / engagement / learning-svc)
| 항목 | 내용 |
| --- | --- |
| **증상** | EKS 배포용 multi-stage Dockerfile을 추가했으나 곧 Revert 후 재작성하는 흐름이 반복됨. |
| **원인** | 초기 Dockerfile 구성(빌드 캐시 레이어링, 의존성 선행 다운로드 단계 부재 등)이 의도와 달라 머지된 PR을 되돌려야 했음. |
| **해결** | 머지 커밋을 `Revert`로 되돌린 뒤, `gradlew/gradle/build.gradle.kts/settings.gradle.kts`를 먼저 COPY하고 `./gradlew dependencies`로 의존성 레이어를 분리 캐싱한 뒤 `src` COPY → `bootJar`하는 multi-stage 구조로 재작성. 3개 서비스에 동일 적용. |
| **배운 점** | Dockerfile 레이어 순서는 빌드 캐시 효율을 좌우한다. 잘못 머지된 인프라 변경은 억지 수정보다 Revert 후 깔끔히 재작성하는 편이 이력상 명확하다. |

### learning-ai Dockerfile pip install COPY 순서 (synapse-learning-svc)
| 항목 | 내용 |
| --- | --- |
| **증상** | learning-ai 컨테이너에서 uvicorn 기동 후 곧 종료, EKS에서 restart 반복(CrashLoopBackOff). (LEARNING-AI_FIX_REQUEST 참조) |
| **원인** | Dockerfile에서 `pyproject.toml`만 COPY한 뒤 `pip install`을 실행해 실제 `app` 패키지가 이미지에 포함되지 않음 → import 실패. |
| **해결** | `pip install` 이전에 `COPY app app`을 추가해 애플리케이션 디렉터리를 먼저 복사하도록 순서 수정. |
| **배운 점** | `pip install .`은 대상 패키지 소스가 이미지에 존재해야 동작한다. 의존성만 복사하고 소스 복사를 빠뜨리면 빌드는 성공해도 런타임에 import 에러로 죽는다. |

### SideNav collapsed 상태 오버플로우 (synapse-frontend)
| 항목 | 내용 |
| --- | --- |
| **증상** | SideNav를 접은(collapsed) 상태와 펼침/접힘 애니메이션 도중 레이아웃 오버플로우 발생 |
| **원인** | collapsed 폭에서 아이콘·라벨이 컨테이너를 넘쳤고, 애니메이션 중 중간 폭에서 자식 위젯이 가용 폭을 초과 |
| **해결** | collapsed 상태에서 아이콘을 가운데 정렬하고 clip 처리, 애니메이션 중에는 LayoutBuilder로 가용 폭에 맞춰 오버플로우를 방지 (W1+W2 scaffold PR #6 내 fix 커밋들) |
| **배운 점** | 폭이 변하는 애니메이션 위젯은 최종 상태뿐 아니라 전이 중간 폭에서도 오버플로우가 나므로 LayoutBuilder로 가용 공간 기반 렌더링을 해야 한다. |

### PM 문서 stale로 인한 팀원 혼란 (synapse-frontend)
| 항목 | 내용 |
| --- | --- |
| **증상** | -svc 레포의 PM 문서가 옛 wiki 내용에 머물러 있어 팀원들이 최신 사양과 혼동 |
| **원인** | 프로젝트 관리 문서(prd/task/workflow)가 단일 소스(team-project-final/documents)와 동기화되지 않아 옛 잔재가 남음 |
| **해결** | documents 레포(@b80635b) 최신 내용 기준으로 prd/task/workflow 3개 폴더를 재정렬하고 비대상 파일은 삭제해 옛 잔재 제거 (PR #5). 이후 scaffold 진척에 맞춰 WORKFLOW_W2 갱신 (PR #8) |
| **배운 점** | PM 문서는 단일 진실 소스(SoT)를 정하고 거기서 단방향 동기화해야 한다 — 레포마다 사본이 표류하면 팀 혼선을 부른다. |

### gh-pages 서브경로 자산 base path 404 + fuse ESM (workflow-guide)
| 항목 | 내용 |
| --- | --- |
| **증상** | 105개 가이드 HTML에서 app.js가 /assets 절대경로로 로드돼 404, 탭 전환·검색 미동작. 검색 라이브러리는 'module is not defined' 에러 |
| **원인** | Pages가 /workflow-guide/ 서브경로로 서빙되는데 자산은 base path 없는 절대경로. fuse.min.mjs가 CommonJS(module.exports) 형식이라 ESM import 시 실패 |
| **해결** | app.js 경로를 /workflow-guide/assets 로 정정(45d8c7e), fuse.min.mjs를 module.exports → export default ESM으로 교체(07d243e) |
| **배운 점** | 프로젝트 Pages는 루트가 아닌 서브경로이므로 모든 절대경로에 base prefix가 필요하다.<br>.mjs 확장자만으로 ESM이 보장되지 않으며 export 형식 자체를 ESM으로 맞춰야 한다. |

---

## 2026-05-21

### platform-svc 환경변수 14개 누락으로 부팅 실패 (T-054/D-031)
| 항목 | 내용 |
| --- | --- |
| **증상** | platform-svc 기동 시 `Could not resolve placeholder 'AES_SECRET_KEY' in value "${AES_SECRET_KEY}" <-- "${app.crypto.aes-secret-key}"` 로 컨텍스트 로딩 실패 |
| **원인** | platform-svc PR #24(Stripe 결제 + OAuth2 + 필드 암호화) 이후 필요해진 환경변수 14개(`AES_SECRET_KEY`, `JWT_PRIVATE_KEY/PUBLIC_KEY`, `STRIPE_*`, `GOOGLE/GITHUB/APPLE_CLIENT_ID/SECRET` 등)가 gitops의 ExternalSecret/ConfigMap에 누락 |
| **해결** | PR #40에서 민감값 ExternalSecret 11개 + 비민감값 ConfigMap 3개(`STRIPE_*_PRICE_ID`) 추가, AWS Secrets Manager에 시크릿 11개 생성<br>주의: 기존 `JWT_SECRET`과 앱이 실제 쓰는 RSA 키페어(`JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY`)는 별개 키 |
| **배운 점** | 앱 측 신기능 PR(외부 결제·OAuth·암호화)이 머지되면 gitops의 시크릿/컨피그 매니페스트를 동기 갱신해야 한다. 코드와 배포 매니페스트의 환경변수 계약은 함께 검토되어야 한다. |

### Flyway 컬럼명과 JPA 엔티티 불일치 (T-056/D-029)
| 항목 | 내용 |
| --- | --- |
| **증상** | `Schema-validation: missing column [provider_user_id] in table [oauth_identities]` |
| **원인** | Flyway V3가 `provider_id` 컬럼으로 테이블을 생성했지만, JPA 엔티티 `OAuthIdentity.providerUserId`가 Hibernate 네이밍 전략에 의해 `provider_user_id`를 기대 |
| **해결** | platform-svc 레포에 Flyway V28 추가: `ALTER TABLE oauth_identities RENAME COLUMN provider_id TO provider_user_id;` + 유니크 인덱스 재생성(`uq_oauth_provider_user`). 이후 이미지를 ECR `dev-latest`로 re-push하고 Bastion에서 `rollout restart deploy platform-svc` |
| **배운 점** | DDL과 엔티티 매핑 불일치는 `ddl-auto: validate`에서만 잡힌다. 마이그레이션 작성 시 Hibernate 네이밍 전략을 기준으로 컬럼명을 맞춘다. |

### platform-svc CrashLoopBackOff: mfa_credentials 테이블 미존재 (T-050/D-024)
| 항목 | 내용 |
| --- | --- |
| **증상** | platform-svc가 CrashLoopBackOff, `mfa_credentials` 테이블 미존재로 기동 실패 |
| **원인** | Flyway migration에 해당 테이블 생성 DDL이 누락된 상태에서 `ddl-auto: validate`로 설정되어 부팅 시 스키마 검증 실패 |
| **해결** | `application-dev.yml`의 `ddl-auto`를 `update`로 변경(PR #26 머지), ECR re-push로 반영 |
| **배운 점** | 누락된 DDL이 있는 동안 `validate`는 부팅을 막는다. 마이그레이션 보강 전까지의 임시 우회는 `update`이며, 근본적으로는 모든 테이블 DDL을 마이그레이션에 포함해야 한다. |

### MSK 재생성으로 KAFKA_BROKERS 주소 변경 (T-073/D-033)
| 항목 | 내용 |
| --- | --- |
| **증상** | 서비스가 Kafka에 연결하지 못함. gitops ConfigMap의 `KAFKA_BROKERS`가 이전 브로커 도메인(예: `ejn12p`)을 가리킴 |
| **원인** | `terraform destroy → apply` 시 MSK 클러스터가 재생성되며 브로커 도메인명이 변경(`ejn12p` → `dchj3l`)되었으나 overlay의 주소가 갱신되지 않음 |
| **해결** | `aws kafka get-bootstrap-brokers ... --query 'BootstrapBrokerStringTls'`로 현재 주소 확인 후 `sed`로 10개 overlay kustomization을 일괄 교체, 커밋 + PR #42 + ArgoCD auto-sync로 반영 |
| **배운 점** | 재생성 시 바뀌는 엔드포인트(MSK 브로커, OIDC)는 하드코딩하면 매번 깨진다. 출력값을 표준 진단 명령으로 뽑아 일괄 치환하는 절차를 런북화한다. |

### dev 프로파일 mfa_credentials 미존재로 JPA validate 실패 (synapse-platform-svc)
| 항목 | 내용 |
| --- | --- |
| **증상** | EKS `synapse-dev`에서 platform-svc Pod가 CrashLoopBackOff. DB(RDS) TCP 연결은 성공하나 기동 중 크래시. (D-024 / PLATFORM-SVC_FIX_REQUEST 참조) |
| **원인** | Fresh RDS에 `mfa_credentials` 테이블이 없는 상태에서 JPA/Hibernate가 기동 시 해당 테이블을 참조 → validate 실패. 인프라(SG, ExternalSecret, probe delay)는 모두 정상인 앱 레벨 문제. |
| **해결** | dev 프로파일 `application-dev.yml`에 `spring.jpa.hibernate.ddl-auto: update`를 추가해 Flyway 미적용 테이블을 dev 한정 자동 생성하도록 조치. |
| **배운 점** | `ddl-auto: update`는 dev 한정으로만 쓰고 staging/prod는 Flyway가 안전하다. 인프라가 모두 녹색이어도 앱이 죽으면 스키마 정합성을 먼저 의심해야 한다. |

### 모바일 3컬럼 그리드 0px 붕괴 (synapse-flow-simulator)
| 항목 | 내용 |
| --- | --- |
| **증상** | 모바일에서 메인 뷰 폭이 0이 되어 시뮬레이터 본문이 보이지 않음 |
| **원인** | 3컬럼 그리드가 모바일에서 0px 컬럼으로 무너져 main-view가 폭을 받지 못함. 또한 미디어쿼리 뒤에 정의된 base 스타일이 source order로 이겨 mode-switcher·speed-btn의 모바일 `display:none`이 적용되지 않음 |
| **해결** | <700px에서 단일 컬럼 그리드 + auto 헤더 행으로 변경하고 main-view/log-panel에 grid-column/row 명시 지정, actor 그룹 박스는 모바일에서 숨김 (commit 03020d6). 이어서 mode-switcher·speed-btn 숨김에 `!important`를 추가해 source order 문제 해소 (commit dd37170) |
| **배운 점** | 0px이 될 수 있는 컬럼은 모바일에서 단일 컬럼으로 명시 전환해야 한다. 미디어쿼리 뒤에 base 규칙이 오면 specificity가 같아 source order로 져버리므로 규칙 순서나 우선순위를 의식적으로 관리해야 한다. |

### 사이드바 폭이 모바일 뷰포트 과점 (synapse-flow-simulator)
| 항목 | 내용 |
| --- | --- |
| **증상** | 375px 화면에서 고정 220px 사이드바가 뷰포트의 약 59%를 덮어 본문 영역을 잠식 |
| **원인** | 사이드바 폭이 뷰포트와 무관한 고정값(220px)이라 작은 화면일수록 점유 비율이 과도하게 커짐 |
| **해결** | 사이드바 폭을 `min(220px, 75vw)`로 변경해 큰 폰은 ~281px, 작은 폰은 ~220px로 캡 (commit e81525d) |
| **배운 점** | 패널 폭은 고정 px 대신 뷰포트 상대값과의 min()으로 상한을 두면 화면 크기에 따라 점유 비율이 폭주하지 않는다. |

### storyboard 미등록 Kafka 토픽 (synapse-flow-simulator)
| 항목 | 내용 |
| --- | --- |
| **증상** | storyboard 시나리오의 step에서 참조하는 Kafka 토픽이 topics 배열에 없어 스키마 엔트리로 해소되지 않음 |
| **원인** | 시나리오 단계에서 토픽을 참조하면서 scenarios.json의 topics 배열에 해당 토픽 정의를 등록하지 않음 |
| **해결** | 누락된 5개 토픽(deck-shared, streak-bonus, report-resolved, gdpr-export-completed, account-deletion-scheduled)을 topics 배열에 추가해 모든 step 수준 토픽 참조가 등록 스키마로 해소되게 함 (commit f351c6c) |
| **배운 점** | 참조-정의 무결성은 데이터 추가 시 반드시 함께 검증해야 한다 — step에서 쓰는 토픽은 topics 레지스트리에 동시에 등록되어 있어야 한다. |

### Admin 화면 진입/복귀 경로 누락 (synapse-frontend)
| 항목 | 내용 |
| --- | --- |
| **증상** | 관리자 화면으로 들어가는 진입점이 없고, AdminShell에 들어간 뒤 사용자 화면으로 돌아올 경로가 없어 갇힘 |
| **원인** | SideNav에 /admin 라우트 진입 메뉴가 없었고, AdminShell에도 사용자 화면 복귀 링크가 없었음 |
| **해결** | SideNav 하단에 `kIsWeb`일 때만 '관리자' 항목을 노출해 /admin으로 이동(commit d75aacd, PR #11), AdminShell 사이드바 하단에 '사용자 화면으로' 링크를 추가해 대시보드로 복귀(commit d963da7, PR #12) |
| **배운 점** | 분리된 셸(Admin/User) 간에는 양방향 내비게이션을 반드시 쌍으로 제공해야 한다 — 진입만 있고 복귀가 없으면 사용자가 갇힌다. |

### 같은 날 다중 sync로 진행률 역행 (workflow-dashboard)
| 항목 | 내용 |
| --- | --- |
| **증상** | dev/feat 브랜치 sync 후 main 기반 force sync가 돌면 추세 차트의 totalChecks/doneChecks가 당일 내에 줄어드는 회귀 발생 |
| **원인** | history[today] 항목을 마지막 sync 값으로 무조건 덮어써, 더 작은 값이 들어오면 진행률이 역행 |
| **해결** | parse-workflow.mjs / sync.mjs의 today entry 갱신을 max(old,new) 정책으로 변경(e70bae1), 과거 유실분은 git log의 per-repo 최대값으로 복원(5fa86ca) |
| **배운 점** | 진행률처럼 단조 증가해야 하는 지표는 쓰기 시점에 max 정책으로 불변식을 강제해야 한다.<br>한 번 깨진 시계열은 git 이력이 유일한 복원 출처가 된다. |

### Force Sync clock skew · git push race (workflow-dashboard)
| 항목 | 내용 |
| --- | --- |
| **증상** | Force Sync 버튼이 새로 띄운 workflow run을 매칭하지 못하고, 동시 트리거 시 두 번째 잡이 git push 단계에서 실패 |
| **원인** | useWorkflowDispatch가 new Date() 시각 비교로 run을 식별 → 클라이언트·GitHub 서버 간 clock skew에 취약. sync-data 워크플로에 concurrency 제어가 없어 동시 실행이 git push race |
| **해결** | POST 직전 최대 run id를 기록 후 1초 간격 20초 폴링으로 그보다 큰 id 탐색(ffa22fa), sync-data.yml에 concurrency group(cancel-in-progress:false) 추가로 직렬화 |
| **배운 점** | 분산 시스템에서 이벤트 식별은 시각이 아니라 단조 증가 id로 해야 한다.<br>같은 ref에 push하는 워크플로는 concurrency group으로 직렬화하지 않으면 반드시 race가 난다. |

### GITHUB_TOKEN push가 재배포를 못 트리거 (workflow-dashboard)
| 항목 | 내용 |
| --- | --- |
| **증상** | sync 워크플로가 data/*.json을 push해도 Pages 재배포가 안 일어나 사용자가 stale 데이터를 봄 |
| **원인** | GitHub은 재귀 방지를 위해 GITHUB_TOKEN으로 push한 커밋이 다른 워크플로를 자동 트리거하지 않음 |
| **해결** | 워크플로에 actions:write 권한 추가, data push 직후 `gh workflow run "Build & Deploy" --ref main`을 명시 호출(20793bc) |
| **배운 점** | GITHUB_TOKEN push는 의도적으로 워크플로 체이닝을 막는다. 다음 단계는 명시적으로 호출해야 한다. |

### typescript-eslint tsconfigRootDir 누락으로 매 빌드 실패 (workflow-dashboard)
| 항목 | 내용 |
| --- | --- |
| **증상** | sync 워크플로 도입 이후 Build & Deploy run이 'No tsconfigRootDir was set' 파싱 에러로 매번 실패 |
| **원인** | typescript-eslint v8은 후보 tsconfig가 여러 개일 때 명시적 tsconfigRootDir를 요구. 스캐폴드 템플릿의 자체 tsconfig가 루트 tsconfig와 충돌 |
| **해결** | parserOptions.tsconfigRootDir 지정, skills/**/templates/** 를 eslint ignore에 추가해 템플릿 tsconfig 충돌 제거(5a5ad27) |
| **배운 점** | 모노레포에 하위 tsconfig를 추가하면 린터의 프로젝트 루트 탐색이 모호해진다. 템플릿/스캐폴드는 린트 범위에서 제외하는 게 안전하다. |

---

## 2026-05-26

### FieldEncryptor AES 키 길이 검증 실패 (T-055/D-030)
| 항목 | 내용 |
| --- | --- |
| **증상** | `java.lang.IllegalArgumentException: AES secret key must be 32 bytes at com.synapse.platform.global.crypto.FieldEncryptor.<init>(FieldEncryptor.java:26)` |
| **원인** | `FieldEncryptor`가 `Base64.getDecoder().decode(encodedKey)`로 디코딩 후 AES-256(32바이트) 검증. 그런데 키를 `openssl rand -hex 16`으로 생성해 디코딩 시 16바이트가 되어 검증 실패 |
| **해결** | `openssl rand -base64 32`로 올바른 Base64 인코딩 32바이트 키 생성 후 `aws secretsmanager update-secret --secret-id synapse/dev/platform-svc/aes-secret-key ...`로 갱신, `kubectl delete secret platform-svc-secret` + `rollout restart deploy platform-svc`로 반영 |
| **배운 점** | 암호화 키는 "바이트 길이"와 "인코딩(hex vs Base64)"을 동시에 만족해야 한다. 키 생성 명령을 런북에 명시하고, 애플리케이션의 디코딩 방식과 일치하는지 확인한다. |

### ESO ClusterSecretStore OIDC ID 불일치 (T-030/D-021)
| 항목 | 내용 |
| --- | --- |
| **증상** | `kubectl get clustersecretstore` 결과 `aws-secrets-manager` 가 `InvalidProviderConfig` / `READY: False` |
| **원인** | ESO IAM role의 trust policy에 박힌 OIDC Provider ID가 현재 EKS 클러스터의 OIDC ID와 불일치. `terraform destroy → apply`로 EKS를 재생성할 때마다 OIDC ID가 변경됨 |
| **해결** | `aws eks describe-cluster ... --query 'cluster.identity.oidc.issuer'`로 현재 OIDC ID 확인 후 `aws iam update-assume-role-policy --role-name synapse-dev-eso-role`로 trust policy의 Federated ARN·aud·sub 갱신, `rollout restart deploy external-secrets`. 부트스트랩 스크립트에 oidc-fix phase를 추가해 자동화 |
| **배운 점** | 재생성마다 바뀌는 OIDC ID는 수동 갱신 시 반복 사고가 된다. terraform에서 ESO role trust policy가 `aws_iam_openid_connect_provider.eks` ARN을 참조하게 하거나, 부트스트랩 단계로 자동 보정해야 한다. |

### EKS managed node group SG가 인프라 SG 인바운드에 미등록 (T-040/D-026)
| 항목 | 내용 |
| --- | --- |
| **증상** | 서비스 Pod가 RDS/Redis/MSK/OpenSearch에 연결 실패 (timeout) |
| **원인** | EKS managed node group이 terraform이 만든 `eks_nodes` SG가 아닌 자동 생성된 `eks-cluster-sg-*` SG를 사용하는데, 이 SG가 인프라 서비스들의 인바운드 규칙에 등록되어 있지 않음 |
| **해결** | `aws eks describe-cluster ... --query 'cluster.resourcesVpcConfig.clusterSecurityGroupId'`로 cluster SG를 확인하고 각 인프라 SG 인바운드에 추가(부트스트랩 sg phase). terraform에 bring-up용 SG/OIDC output을 추가해 식별을 용이하게 함 |
| **배운 점** | EKS는 노드에 자체 cluster SG를 부여하므로, terraform이 만든 노드 SG만 신뢰하면 안 된다. `cluster_security_group_id`를 각 인프라 SG의 ingress source로 참조하도록 IaC를 고정한다. |

### EKS private endpoint 터널 readiness 체크 오류 (A2 발견)
| 항목 | 내용 |
| --- | --- |
| **증상** | SSM 터널 기동 후 readiness 체크가 `/readyz`에 대해 NotFound를 받아 부트스트랩이 진행되지 못함 |
| **원인** | 터널 readiness를 EKS API의 `/readyz` 엔드포인트로 확인했는데, 해당 EKS에서는 `/readyz`가 NotFound로 응답함(엔드포인트 부재) |
| **해결** | readiness 체크를 `/readyz` 대신 `kubectl get nodes` 성공 여부로 변경(부트스트랩 스크립트 수정) |
| **배운 점** | 클러스터 health 체크는 환경에서 실제로 제공되는 신호를 기준으로 해야 한다. 가정한 엔드포인트가 아니라 검증된 명령으로 readiness를 판정한다. |

### EKS 인증 모드 대기에 cluster-active waiter 부적합 (A2 발견)
| 항목 | 내용 |
| --- | --- |
| **증상** | 인증 모드 변경 후 `aws eks wait cluster-active` 기반 대기가 실제 변경 완료를 보장하지 못해 후속 단계가 조기 실행됨 |
| **원인** | authenticationMode 변경은 cluster-active 상태와 별개로 진행되어 `cluster-active` waiter로는 완료 시점을 포착할 수 없음 |
| **해결** | eks-auth 단계를 `authenticationMode` 값을 직접 폴링하며 대기하도록 수정 |
| **배운 점** | "리소스 active"와 "설정 변경 반영 완료"는 다른 상태다. 대기 조건은 우리가 기다리는 바로 그 속성을 폴링해야 한다. |

### ESO ExternalSecret apiVersion 미스매치 (A2 발견)
| 항목 | 내용 |
| --- | --- |
| **증상** | monitoring 스택의 ExternalSecret이 적용/동기화되지 않음 |
| **원인** | ExternalSecret을 `external-secrets.io/v1beta1`로 선언했으나, 설치된 ESO가 `v1`만 serve하며 레포의 나머지 매니페스트도 `v1` 사용 |
| **해결** | monitoring의 ExternalSecret apiVersion을 `v1beta1 → v1`로 변경해 ESO가 serve하는 버전 및 레포 표준과 정합화(앞서 2026-05-18에도 동일 유형의 ESO apiVersion 정정 이력 있음) |
| **배운 점** | CRD apiVersion은 설치된 컨트롤러가 실제 serve하는 버전과 레포 전체에서 일관되어야 한다. 같은 클래스 리소스의 버전을 한 곳으로 통일한다. |

### Loki 스키마/배포 모드 미설정 + EBS gp3 StorageClass 부재
| 항목 | 내용 |
| --- | --- |
| **증상** | monitoring 스택의 Loki가 정상 기동/동작하지 못함(스키마·배포 모드 설정 누락, 영속 볼륨 프로비저닝 불가) |
| **원인** | Loki values에 `schemaConfig`/`deploymentMode`가 지정되지 않았고, 클러스터에 기본 StorageClass(EBS) 및 EBS CSI 드라이버/IRSA가 없어 PVC 바인딩 불가 |
| **해결** | Loki values에 `schemaConfig` 추가 + `deploymentMode: SingleBinary` 설정. terraform에 `aws-ebs-csi-driver` addon + IRSA 추가하고 `gp3`를 default StorageClass로 지정 |
| **배운 점** | 스테이트풀 모니터링 컴포넌트는 (1) 차트의 스키마/배포 모드 명시와 (2) 클러스터의 default StorageClass + CSI 드라이버라는 두 전제를 함께 갖춰야 기동한다. |

### ArgoCD 부트스트랩 비멱등 / 서버사이드 conflict (T-020·T-022)
| 항목 | 내용 |
| --- | --- |
| **증상** | ArgoCD install.yaml 적용 시 `metadata.annotations: Too long: must have at most 262144 bytes`(CRD), 그리고 재실행 시 `Apply failed with 1 conflict: conflict with "kubectl-client-side-apply"` 발생. `no matches for kind "ApplicationSet"`로 ApplicationSet 미생성 |
| **원인** | 262KB를 넘는 CRD에 client-side apply의 last-applied-configuration annotation 제한이 걸리고, 기존 client-side/patch 관리 필드와의 field manager 충돌, 부트스트랩 스크립트의 비멱등성 |
| **해결** | `kubectl apply --server-side --force-conflicts`로 설치하도록 하고, argocd phase를 멱등화(`--force-conflicts`와 `--insecure` 중복 적용 방지) |
| **배운 점** | 대형 CRD는 server-side apply가 필수이며, 부트스트랩 스크립트는 재실행해도 안전하도록 멱등하게 작성해야 한다. field manager 충돌은 기능 영향 없는 경우 `--force-conflicts`로 흡수한다. |

### bring-up.sh 실 EKS 첫 실행 갭 9건 (A2 발견)
| 항목 | 내용 |
| --- | --- |
| **증상** | 멱등 bring-up.sh를 실 EKS에 처음 돌리자 터널 readiness 무한 대기, eks-auth 미완료 대기, argocd apply conflict, ExternalSecret unknown apiVersion, `--verify` 메트릭/Slack 조회 실패가 연쇄 발생 |
| **원인** | EKS API는 `/readyz`가 NotFound(로컬 kind와 다름), `aws eks wait cluster-active`가 authenticationMode 전환 미감지, 이전 client-side apply 잔재로 server-side conflict, ESO는 ExternalSecret `v1`만 serve(매니페스트는 `v1beta1`), Prometheus/Alertmanager 이미지에 wget 부재 |
| **해결** | 터널 readiness `/readyz`→`kubectl get nodes`(eedeac8), eks-auth를 authenticationMode 폴링 대기(bf34055), argocd phase `--force-conflicts`+중복방지 멱등화(629b656), monitoring ExternalSecret `v1beta1`→`v1`(2b695b2), `--verify`를 curl 전용 pod 조회(dd33529), tfvars 부재 fail-fast(eb11dee) |
| **배운 점** | 멱등 자동화의 검증 가치는 실 클러스터 1회 실행에서만 드러난다. 로컬 추상화(kind/minikube)와 EKS의 API readiness·waiter·이미지 도구 차이를 스크립트가 흡수해야 한다 |

### platform-svc Redis 연결 실패 (local + EKS dev/staging 공통 키 오배선)
| 항목 | 내용 |
| --- | --- |
| **증상** | platform-svc 파드는 1/1 Ready인데 `/actuator/health` aggregate가 DOWN, `DataRedisReactiveHealthIndicator: Unable to connect to Redis`. EKS에서는 ElastiCache 미연결 |
| **원인** | 앱은 `spring.data.redis.*`(relaxed-binding `SPRING_DATA_REDIS_*`)만 읽는데 overlay/configmap이 `REDIS_HOST/PORT`를 주입 → Spring Boot가 localhost:6379로 폴백. readiness/liveness 그룹에 redis가 없어 probe는 통과해 잠복. 동일 버그가 local·dev·staging 세 곳 존재. dev ElastiCache는 TLS+auth_token 필수라 SSL/PASSWORD도 누락 |
| **해결** | local-k8s: configmap 키를 `SPRING_DATA_REDIS_HOST/PORT`로, secret에 `SPRING_DATA_REDIS_PASSWORD` 추가(PR #57). EKS dev/staging: `SPRING_DATA_REDIS_HOST/PORT` + `SPRING_DATA_REDIS_SSL_ENABLED=true` + base ExternalSecret에 `SPRING_DATA_REDIS_PASSWORD`(PR #58) |
| **배운 점** | probe 그린(readiness group)과 actuator aggregate 그린은 별개다. health group에 빠진 의존성(redis)은 장기 잠복하므로, relaxed-binding 환경변수 키는 앱이 실제 읽는 prefix와 반드시 대조 검증해야 한다 |

### Loki 차트 SingleBinary 미기동 (라이브 EKS 발견)
| 항목 | 내용 |
| --- | --- |
| **증상** | W3 관측 스택 라이브 검증 중 grafana/loki 차트 적용 후 loki-0 파드가 생성되지 않음 |
| **원인** | grafana/loki 차트는 `schemaConfig` 필수이며 `deploymentMode: SingleBinary` 미설정 시 `singleBinary.replicas`가 무시되어 StatefulSet 미생성 |
| **해결** | loki-values.yaml에 `schemaConfig` + `deploymentMode: SingleBinary` 추가, 소규모 노드용 memcached 캐시 비활성(56652a8) |
| **배운 점** | 관측 스택 Helm 차트는 small-node 환경에서 기본값이 부적합한 경우가 많아 deploymentMode/schemaConfig 같은 필수 키를 명시해야 한다 |

### Kafka 컨테이너 기동 실패 (stale Zookeeper broker znode) (synapse-shared)
| 항목 | 내용 |
| --- | --- |
| **증상** | `docker compose up` 시 `synapse-kafka` 컨테이너가 `Exited (1)`로 즉시 종료, 로컬 E2E harness 기동 불가 |
| **원인** | 5일 전 unclean shutdown으로 Zookeeper 볼륨에 ephemeral broker znode(`/brokers/ids/1`) 잔존. 신규 broker(id=1)가 동일 znode 등록 시도 중 `NodeExistsException`으로 fatal 종료 |
| **해결** | `docker compose down -v`로 볼륨 정리 후 재기동(throwaway 스택, 시드는 재적용). 세션 종료 시 `down -v` 권장 명문화 |
| **배운 점** | 로컬 throwaway Kafka 스택은 세션 종료 시 `down -v`로 볼륨을 비워 다음 세션을 클린 시작해야 ephemeral znode 잔존 충돌을 피한다 |

---

## 2026-05-27

### kafka-console-producer가 멀티라인 JSON을 줄 단위 메시지로 분리 (D-2, synapse-shared)
| 항목 | 내용 |
| --- | --- |
| **증상** | E2E harness가 5개 토픽 모두 `[CONSUME] WARN — unexpected format` 보고(전송은 PASS). CloudEvent 페이로드 단위 검증 불완전 |
| **원인** | 샘플 JSON이 멀티라인 pretty-print(17~19줄). `kafka-console-producer`는 개행을 메시지 경계로 처리해 샘플 1개가 ~17개 단편으로 발행, consumer `--max-messages 1`이 첫 줄(`{`)만 읽어 `specversion` 미검출 |
| **해결** | `kafka-e2e-test.sh`에 `compact_json`(jq -c, 깨진 JSON은 `tr -d` fallback) 추가로 1라인 압축. 재검증 `--all` 5/5 OK(WARN 0)·`--full` 13/13 PASS |
| **배운 점** | `kafka-console-producer`로 JSON/CloudEvent 검증 시 메시지를 1라인으로 compact해야 한다(개행=구분자). round-trip PASS와 "페이로드 단위 검증"은 별개임을 구분 기록해야 신뢰도가 정확히 전달된다 |

### Flyway 마이그레이션 침묵 미실행 (flyway-core vs starter) (knowledge-svc·learning-card)
| 항목 | 내용 |
| --- | --- |
| **증상** | dev/prod 부팅 시 Flyway(knowledge V1~V4 / learning V8~V16)가 실행되지 않아 스키마가 비어 있음. 에러 없이 조용히 누락 |
| **원인** | build.gradle에 `flyway-core`만 선언되어 Spring Boot Flyway 자동설정이 미트리거. knowledge는 추가로 `ddl-auto: validate`가 pgvector `vector(1536)`/`@Lob` 커스텀 타입을 검증 못 해 충돌 |
| **해결** | `flyway-core`→`spring-boot-starter-flyway` 교체(자동설정 활성화), dev/prod `ddl-auto`를 `none`으로 내려 Flyway를 스키마 권위로. knowledge CI postgres를 `pgvector/pgvector:pg16`으로 지정 |
| **배운 점** | Flyway는 starter 의존성이어야 자동설정이 걸린다. 커스텀 컬럼 타입이 있으면 Hibernate validate 대신 Flyway 권위+ddl-auto none이 안전하다. 멀티모듈 전반에서 starter로 통일 |

### ES 통합 테스트 CI TransportException (클라이언트/서버 메이저 불일치) (knowledge-svc)
| 항목 | 내용 |
| --- | --- |
| **증상** | `SearchElasticsearchIntegrationTest`가 CI에서 indices.exists 등 모든 API 호출 시 TransportException. HTTP 200은 응답하나 인덱스/검색에서 실패 |
| **원인** | 컨테이너 HTTP 200은 주지만 클러스터/Nori 준비 전 + `elasticsearch-java:9.2.1`(메이저 9)의 `compatible-with=9` Accept 헤더를 ES 8.19.6 서버가 400 거부. 9.x로 올리면 Nori POS.Tag.E 불일치 |
| **해결** | wait 전략 `/_cluster/health?wait_for_status=yellow` 강화·컨테이너 메이저 정렬 시도했으나 운영 OpenSearch 2.11+Nori까지 얽혀 CI 통과 불가 판단, 추측성 수정 원복 후 `@Disabled`로 CI 제외(원래 로컬 skip이라 회귀 아님). 호환 매트릭스는 별도 과제 트래킹 |
| **배운 점** | ES/OpenSearch는 클라이언트-서버 메이저 호환(compatible-with 헤더)과 형태소 플러그인(Nori POS) 버전이 함께 맞아야 한다. 운영(OpenSearch)과 테스트(ES) 엔진이 다르면 호환 매트릭스를 별도 과제로 트래킹하는 편이 낫다 |

### dev JWT private-key 기본값 손상으로 토큰 라운드트립 실패 (platform-svc, PR #34)
| 항목 | 내용 |
| --- | --- |
| **증상** | dev 프로파일에서 JWT 발급/검증 라운드트립 실패(키 디코딩 불가) |
| **원인** | `synapse.jwt.private-key` dev 기본값이 손상된 base64로, 같은 프로파일 public-key와 키쌍 불일치 |
| **해결** | private-key 기본값을 public-key와 짝 맞는 유효 PKCS8 키로 교정(564b41f) |
| **배운 점** | JWT prefix 표준화(jwt.*→synapse.jwt.*) 같은 설정 리네이밍 시 키 값 유효성·키쌍 일치까지 함께 확인해야 한다. 발급/검증 라운드트립을 부팅/스모크에서 검증하면 조기 포착 가능 |

### 온보딩 포털 본문 마크다운 링크 전부 무반응(no-op) (synapse-onboarding)
| 항목 | 내용 |
| --- | --- |
| **증상** | 포털 문서 본문의 모든 인라인 마크다운 링크가 클릭해도 무동작. 9개 문서의 "다음 읽을거리" 외부 위키 링크가 전부 죽어 신입이 정식 위키로 이동 불가 |
| **원인** | `MarkdownViewer`가 `flutter_markdown`의 `Markdown()`을 `onTapLink` 핸들러 없이 렌더. `url_launcher`는 pubspec 선언만 되고 미와이어링 |
| **해결** | `onTapLink`로 비어있지 않은 href를 `launchUrl(externalApplication)`로 연결, 플랫폼 채널 없이 테스트 가능한 주입형 `onLinkTap` 콜백 도입 + 회귀 테스트(PR #1) |
| **배운 점** | 의존성을 pubspec에 선언하는 것과 코드에 연결하는 것은 별개다. 외부 SDK/플랫폼 채널 위젯은 콜백을 주입 가능하게 설계해야 단위 테스트로 회귀를 잡는다 |

---

## 2026-05-28

### Redis 캐싱 도입 후 dev-smoke 헬스 게이트 타임아웃 (learning-card, PR #30)
| 항목 | 내용 |
| --- | --- |
| **증상** | dev-smoke job의 `/actuator/health` 게이트가 UP을 반환하지 않고 60회 재시도 후 약 3분 만에 타임아웃 |
| **원인** | PR #29(LEARN-CARD-008)의 `@EnableCaching`+`RedisCacheManager` 도입으로 Actuator health에 Redis 인디케이터 자동 포함. CI compose에 Redis 브로커가 없어 health DOWN 고정 |
| **해결** | `learning-card/docker-compose.ci.yml`에 `redis:7-alpine`을 postgres와 함께 추가(requirepass 없음, platform-svc redis 블록 미러링)(6b06446) |
| **배운 점** | `@EnableCaching`/`RedisCacheManager` 같은 인프라 의존성 추가는 Actuator 헬스에 즉시 반영된다. 헬스 기반 부팅 검증 시 새 의존성에 맞춰 CI 인프라(브로커)를 동시에 추가해야 한다 |

### S5 운영 세션 Phase B3 멀티 subagent 디스패치 중 API 529 Overloaded (documents)
| 항목 | 내용 |
| --- | --- |
| **증상** | S5(운영/관측성) 검증 Phase B3에서 두 subagent 병렬 디스패치 시 API 529 Overloaded가 2회 연속 발생, 세션 중단(HANDOFF v1.2 changelog) |
| **원인** | 12개 기술 범위 대형 카테고리를 다중 subagent로 동시 실행하며 순간 부하가 몰려 업스트림 모델 API 과부하 |
| **해결** | 완료된 Phase B1·B2 결과·라인범위·위임 ADR 5건을 HANDOFF v1.2에 즉시 직렬화하고 INDEX S5를 `in_progress`로 표기. 다음 세션이 동일 브랜치 `docs/stack-review-S5-operations`에서 Phase B3만 이어받아 정상 완료(PR #12, 529 재발 없음) |
| **배운 점** | 다중 subagent 병렬 작업은 529에 취약하므로 Phase 단위로 쪼개고 각 Phase 종료 시 "완료/미시작 + 복원 입력"을 핸드오프 문서로 직렬화하면 일시적 API 장애에도 무손실 재개가 가능하다. 작업 브랜치 유지가 재개의 전제 |

### 기술스택 위키가 목표 아키텍처를 현재 실재처럼 단정(픽션 P0 16건) (documents.wiki)
| 항목 | 내용 |
| --- | --- |
| **증상** | §6.3 RAG가 "ES+RRF 하이브리드", §6.4 Semantic Cache가 "pgvector 캐시 테이블"로 기술됐으나 실코드는 pgvector cosine 단일 + Redis numpy in-memory. Gateway/Resilience4j/RateLimiter도 실재처럼 단정(실제 미적용), 모델 ID·옛 레포 좌표(`api-gateway/`·`syn/`) 잔존 |
| **원인** | 위키가 "목표 아키텍처"와 "현재 실재"를 구분하지 않고 단정 기술. ADR로 결정만 기록되고 산하 절이 실코드와 독립 유지 |
| **해결** | 전 항목을 "적용 현황(목표 vs 실재)" 박스로 분리, P0는 실코드 기준 재작성, 운영 정책 결정을 §8.6 ADR 5건으로 명문화, 레포/경로 좌표 일괄 정정. context7+실레포 이중 검증 + 자동 메모리 5건 교차 정합 |
| **배운 점** | 권위 문서는 목표와 실재를 분리하지 않으면 픽션이 된다. 카테고리별 세션 검증 + "목표 vs 실재" 박스 + ADR로 결정을 명문화해야 단일 진실 출처로 유지된다 |

---

## 2026-06-02

### Kafka 4서비스 감사: 소비측 부재·CI 계약검증 부재·버전 드리프트 (전 서비스, G3/G4)
| 항목 | 내용 |
| --- | --- |
| **증상** | 4개 서비스의 Kafka 도입/설정/CI가 `synapse-shared`의 EVENT_CONTRACT_STANDARD·EVENT_FLOW_MATRIX 표준에서 제각각 어긋남. 이벤트 체인이 코드 레벨에서 끊긴 구간 존재 |
| **원인** | (1) engagement가 producer(level-up·badge-earned)만 있고 `user-registered`·`review-completed` **컨슈머 미구현** → Chain A·C 차단(P0). (2) CI Schema Registry를 띄우는 건 engagement뿐, 나머지는 `mock://`라 **Avro BACKWARD 호환이 CI에서 미검증**. (3) Avro/serializer 버전 드리프트 — engagement·knowledge·shared=1.11.3/7.5.0, platform·learning-card=1.12.0/7.7.0. (4) Outbox 적용 불균일(platform 완비, 나머지 부분/미적용) |
| **해결** | 감사 결과를 `docs/kafka-service-audit-2026-06-02.md`로 번호화 정리(G3/G4 등). 서비스 코드 변경은 [[repo-edit-scope-policy]]상 직접 불가 → engagement 컨슈머 등 P0를 이슈로 추적. 이후 engagement 소비측은 06-08 origin 재확인 시 **해소**(EngagementKafkaConsumer @KafkaListener 구현 완료), shared#14로 버전 정본을 **1.11.3/7.5.0 확정**(platform·learning이 정본 초과 → 역방향 정렬 과제로 남김) |
| **배운 점** | 멀티서비스 이벤트 계약은 "토픽 네이밍 정렬"만으로는 부족하다 — 소비측 구현·CI 호환검증·serializer 버전 정본까지 함께 봐야 체인이 실제로 닫힌다. 표준 문서가 있어도 **CI Schema Registry 하니스가 전 서비스에 깔리지 않으면 BACKWARD 위반이 런타임까지 샌다**. 버전은 "표준 문서값"이 아니라 "shared build 실측값"을 정본으로 확정해야 정렬 방향이 명확해진다 |

---

## 2026-06-04

### Kafka TLS MSK: gitops SSL env만으로는 미배선 (앱 커스텀 팩토리 갭, G1)
| 항목 | 내용 |
| --- | --- |
| **증상** | MSK가 TLS 전용(client_broker=TLS, 9094)인데, gitops 오버레이에 `SPRING_KAFKA_SECURITY_PROTOCOL=SSL`을 추가해도 서비스가 TLS 브로커에 붙지 못할 구조 |
| **원인** | platform/knowledge/learning-card가 각자 커스텀 `KafkaConfig`(`DefaultKafkaProducerFactory`/`ConsumerFactory`)로 props를 **수동 구성**하는데 `security.protocol`을 넣는 코드/@Value가 없음 → Spring relaxed-binding(`SPRING_KAFKA_SECURITY_PROTOCOL`)을 줘도 이 수동 팩토리가 읽지 않아 PLAINTEXT 기본으로 폴백. learning-ai(Python)는 `Settings`에 `security_protocol` 필드 자체가 없음. 초기 audit가 체크아웃된 feature 브랜치를 봐서 한때 오판(→ origin 기준 재확인 필요) |
| **해결** | "gitops-only 작업"이라는 전제를 정정 — 각 서비스 레포에서 커스텀 팩토리에 `props.put("security.protocol", <env>)`(Python은 aiokafka `security_protocol`)를 배선하는 **앱 PR이 선행**돼야 함을 플랜에 명문화하고 이슈로 위임. 앱 배선 4모듈은 06-05 origin/dev 머지로 해소 확인(platform #54 등), gitops env(KAFKA_ENABLED+SSL+SCHEMA_REGISTRY_URL)는 직접 작업. 잔여: knowledge `synapse.kafka.enabled` 게이트 부재(#46)·EKS TLS E2E 미검증 |
| **배운 점** | **인프라 env 주입은 필요조건이지 충분조건이 아니다** — 앱이 그 env를 실제로 읽는 코드 경로(커스텀 팩토리)까지 대조해야 "배선됨"이라 말할 수 있다. `KAFKA_ENABLED` 같은 게이트도 앱에 `@ConditionalOnProperty`가 없으면 no-op이다. 정적 감사로는 런타임 TLS E2E를 확인할 수 없으니 미검증으로 정직히 표기한다 |

### knowledge 검색 OpenSearch↔ES 이중 불일치 (dead config + 엔진 비호환, G6)
| 항목 | 내용 |
| --- | --- |
| **증상** | knowledge 검색이 AWS/local-k8s에 OpenSearch로 프로비저닝됐으나 앱이 실제로 연결하지 못하는 상태 |
| **원인** | **갭1(env명)**: 인프라는 `OPENSEARCH_URL`을 주입하는데 앱은 `ELASTICSEARCH_URIS`만 읽음(소스에 `OPENSEARCH_URL` 참조 0건) → `localhost:9200` 폴백, `OPENSEARCH_URL`은 dead config. **갭2(엔진 비호환)**: 앱은 ES Java client 9.x인데 서버는 OpenSearch 2.x — ES8+/9 클라이언트는 product check(`X-Elastic-Product`)로 OpenSearch를 거부해 URL을 고쳐도 연결 거부 |
| **해결** | 결정 사항을 D-003 ADR로 정리 후 **인프라를 Elasticsearch로 교체** — gitops PR #114로 `apps/elasticsearch/base/statefulset.yaml`를 인클러스터 **ES 9.2.1** StatefulSet으로, knowledge 오버레이를 앱이 읽는 변수명과 동일한 `ELASTICSEARCH_URIS=http://elasticsearch:9200`로 정합. shared #16 정합 문서. AWS 관리형 OpenSearch 도메인 제거 |
| **배운 점** | "프로비저닝됨"과 "앱이 씀"은 별개다 — env 변수명이 어긋나면 인프라가 떠 있어도 dead config다. 검색엔진은 클라이언트-서버를 **같은 엔진·호환 메이저로** 맞춰야 하며(ES client↔ES server), 운영/테스트 엔진이 갈리면 product check 같은 하드 게이트에서 막힌다. 두 갭(env명·엔진)을 한 번에 풀어야 실제로 연결된다 |

---

## 2026-06-05

### Flyway V28 중복 충돌 (전역 정수 버전 수동 선택) (platform-svc, G5)
| 항목 | 내용 |
| --- | --- |
| **증상** | platform-svc에 동일 버전 `V28` 마이그레이션이 둘 존재 — 머지된 `V28__allow_multiple_refresh_tokens` vs untracked `V28__rename_oauth_provider_id_column` |
| **원인** | "다음 버전 번호를 수동 선택"하는 관행 + 병렬 브랜치/멀티 location이 전역 정수 번호 공간을 공유 + 서비스별 Flyway 정책(out-of-order/baseline) 불일치 → 같은 정수가 서로 다른 브랜치에서 동시에 선택됨 |
| **해결** | 표준을 `synapse-shared/docs/rules/12-flyway-migration.md`로 수립 — 신규 마이그레이션은 14자리 타임스탬프 `V<yyyyMMddHHmmss>__`(기존 정수 Vn은 불변, 타임스탬프가 항상 뒤로 정렬돼 공존 안전), `out-of-order: true`·`baseline-on-migrate` 명시. CI 차단을 위해 `scripts/flyway_guard.py`(stdlib only) + reusable `flyway-guard.yml`(중복 버전/신규 비-타임스탬프/기머지 수정·삭제·rename 3종 검사) 작성. 서비스 롤아웃은 이슈 위임(platform#65·knowledge#48·learning#55·engagement#28). spec/plan은 `docs/superpowers/.../2026-06-05-flyway-history-conflict-*` |
| **배운 점** | 전역 정수 버전을 수동 선택하면 병렬 개발에서 충돌은 시간문제다 — **단조 정렬되는 타임스탬프 버전**으로 충돌 자체를 구조적으로 제거하고, 표준은 문서가 아니라 **CI 가드로 fail-fast 강제**해야 지켜진다. 기머지 마이그레이션은 불변(rename/이동 금지)이 핵심 불변식 |

### KAFKA_ENABLED 게이트가 Spring 3서비스에서 no-op
| 항목 | 내용 |
| --- | --- |
| **증상** | gitops가 dev/staging/prod 오버레이에 `KAFKA_ENABLED`를 주입해도 platform-svc/knowledge-svc/learning-card에서 Kafka 초기화를 켜고 끄지 못함(항상 초기화) |
| **원인** | 세 Spring 서비스의 커스텀 `KafkaConfig`에 `synapse.kafka.enabled`(`@ConditionalOnProperty`) 게이트가 없어 env가 바인딩될 대상이 없음. learning-ai(Python)는 `settings.kafka_enabled`로 정상 게이트 |
| **해결** | 게이트 추가는 서비스 레포 영역이라 이슈 위임(platform #59, knowledge #46, learning-svc #49). platform·learning-card는 06-08까지 #59/#49로 해소, **knowledge #46만 잔여**(origin/dev grep 0건). gitops 쪽 env 주입은 유지(게이트 도착 시 즉시 동작) |
| **배운 점** | feature flag는 "env를 주입하는 쪽"과 "그 env를 조건으로 읽는 쪽"이 쌍으로 있어야 동작한다. 한쪽만 있으면 조용한 no-op이라, 게이트 부재를 grep으로 확인해 잔여 1건까지 추적해야 한다 |

---

## 2026-06-08

### main 직행 PR을 dev로 재타겟 시 충돌 (engagement/learning, G7)
| 항목 | 내용 |
| --- | --- |
| **증상** | org 열린 PR 4건이 전부 base가 `main` 직행이라 dev로 재타겟하던 중 engagement #30·learning #57이 CONFLICTING |
| **원인** | `ci/deploy-dispatch` 브랜치가 main에서 분기됐고, main에는 dev를 경유하지 않은 머지 커밋(engagement #23 / learning #41·#42)이 있어 main↔dev가 발산. 특히 learning은 dev가 main보다 19커밋 앞선 큰 발산. main 직행 머지가 누적되며 두 브랜치 히스토리가 갈림 |
| **해결** | 깨끗한 건(knowledge #50/#51, main이 dev 조상)은 base를 dev로 변경. 충돌 건은 [[repo-edit-scope-policy]]상 직접 해소 불가 → engagement#31·learning#59 이슈로 작성자에게 위임(브랜치 dev 재분기 + main→dev 동기화 요청). 06-08 아키텍처 보고서 G7에 rev-list 발산 수치 기록 |
| **배운 점** | main 직행 머지는 그 순간엔 편하지만 main↔dev 발산을 누적시켜 후속 PR 재타겟을 충돌로 만든다. **통합은 dev 단일 경로로** 강제해야 하고, 이미 발산한 브랜치는 억지 머지보다 dev 재분기가 깨끗하다 |

### 로컬 클론 stale로 머지/구현 상태 오판 (멀티레포 감사)
| 항목 | 내용 |
| --- | --- |
| **증상** | 서비스 레포 상태를 로컬 클론 기준으로 판단해 "미머지·미구현"으로 오판. learning에 stale 기준으로 중복 이슈(#50)를 만들었다가 닫음 |
| **원인** | 형제 서비스 레포 로컬 클론(`../synapse-*`)이 fetch가 안 돼 stale — knowledge-svc 로컬 `main`이 05-20에 멈춰 있어 "Producer 미머지·임계경로"로 봤으나 실제 origin/main #40(06-02)에 이미 머지. platform/learning/engagement도 로컬 기준 "security.protocol 미배선"으로 봤으나 origin/dev엔 배선 완료 |
| **해결** | 19개 레포 전체 `git fetch origin --prune` 후 **origin/main(머지 여부)·origin/dev(최신 구현) 기준으로만** 판단하도록 절차 고정(`git log origin/main -1`, `git grep <pat> origin/main`, `git rev-list --count origin/main..origin/dev`). 이 origin 기준으로 06-08 아키텍처 보고서의 G1~G8을 재판정(해소 3·진행 4·미해결 1) |
| **배운 점** | 멀티레포에서 로컬 체크아웃 브랜치/`main`은 신뢰하면 안 된다 — 상태 단언 전 반드시 `git fetch` 후 origin ref로 확인한다([[verify-merge-state-via-origin]]). stale 기준 판단은 정반대 결론과 중복 산출물(이슈)을 만든다. 추적 문서·이슈 등록 전 origin 확인이 필수 게이트 |

---

## 2026-06-09

> W5 진입 — 위임만으로 닫히지 않는 **통합 차단(release-blocking) 결함**을 velka가 직접 수정하기 시작한 구간. 06-02 Kafka 감사에서 번호화한 P0(F1~F3)·버전 드리프트가 라이브에서 실제 DLT·CrashLoop로 터졌다.

### Avro writer 스키마 정본 분기로 역직렬화 실패·DLT (engagement/learning, P0 · F1·F2·F3)
| 항목 | 내용 |
| --- | --- |
| **증상** | 라이브 이벤트 체인에서 `UserRegistered`·`NotificationSend` 소비가 역직렬화 단계에서 실패해 메시지가 DLT로 빠짐. 토픽 네이밍은 표준과 일치하는데도 체인이 코드 레벨에서 끊김 |
| **원인** | producer가 발행하는 Avro **writer 스키마가 정본과 분기** — engagement `UserRegistered`에 `registeredAt`이 남아 있고 공통메타(`eventId`/`occurredAt` 등) 누락, learning `NotificationSend`는 namespace가 정본과 달라 reader가 writer 스키마를 해소 못 함. 06-02 감사에서 P0/F1·F2·F3로 번호화했던 항목이 실제로 발현 |
| **해결** | engagement#32로 `UserRegistered` 정본 정렬(`registeredAt` 제거 + 공통메타 추가), learning#64로 `NotificationSend` writer를 정본 namespace+공통메타로 정렬. (이후 learning `ReviewCompleted`도 owner가 #84로 정렬해 platform#87 DLT 근본수정) |
| **배운 점** | 이벤트 계약은 "토픽 네이밍 정렬"이 아니라 **writer 스키마 정본(namespace·공통메타·필드)** 까지 일치해야 닫힌다. 스키마 분기는 컴파일·CI(mock 레지스트리)에선 안 보이고 **런타임 DLT로만 드러나므로**, BACKWARD 검증 하니스가 전 서비스에 없으면 발행 시점까지 샌다. 감사로 번호화(F1~F3)해 둔 P0가 라이브에서 그대로 터진다 |

### JWT subject 식별자 도출 비결정성 (engagement/knowledge, F7/F9 · P1/P2)
| 항목 | 내용 |
| --- | --- |
| **증상** | 동일 사용자인데 HTTP 요청 경로와 Kafka 소비 경로가 서로 다른 내부 `userId(Long)`로 처리돼 권한·소유 판정이 어긋남 |
| **원인** | JWT에 `userId` claim이 없을 때 내부 Long 식별자를 즉석 생성하는데, HTTP 필터와 Kafka 컨슈머가 **서로 다른 방식**으로 도출(또는 비결정적) → 같은 subject가 경로마다 다른 Long |
| **해결** | `userId` claim 부재 시 **JWT subject(UUID)를 결정적 Long으로 도출**하는 단일 규칙으로 통일 — engagement#33은 HTTP 경로를 Kafka 경로와 동일 규칙으로 맞추고, knowledge#59도 동일 결정적 도출 적용 |
| **배운 점** | 식별자 도출은 한 곳이라도 비결정적이면 경로 간 불일치가 된다 — UUID→Long 같은 축약은 **결정적 함수로 단일화**하고 모든 진입점(HTTP·Kafka)이 같은 함수를 쓰게 해야 한다 |

### learning-ai SSL 시 ssl_context 미생성으로 Kafka CrashLoop (synapse-learning-svc, gitops#144)
| 항목 | 내용 |
| --- | --- |
| **증상** | gitops가 `KAFKA_ENABLED`+SSL env를 주입한 staging/dev에서 learning-ai(Python) 파드가 Kafka 초기화 중 CrashLoop |
| **원인** | aiokafka는 `security_protocol=SSL`만으로는 부족하고 **`ssl_context`를 직접 만들어 넘겨야** 하는데, learning-ai가 SSL 분기에서 `ssl_context`를 생성·전달하지 않아 핸드셰이크 실패로 기동 직후 종료 |
| **해결** | learning#67로 SSL일 때 `ssl.create_default_context(...)`를 생성해 `AIOKafkaConsumer/Producer(ssl_context=...)`로 전달하도록 배선. gitops#144(Kafka TLS) 라이브 검증 경로에서 확인 |
| **배운 점** | env(`security_protocol=SSL`)는 필요조건일 뿐 — 클라이언트 라이브러리가 요구하는 **부속 객체(`ssl_context`)까지 코드가 만들어 넘겨야** 충분조건이다([[kafka-tls-msk-app-readiness-gap]]의 "주입≠배선"이 Python 클라이언트에서도 동일). TLS 배선은 정적 감사가 아니라 실 브로커 핸드셰이크로만 확증된다 |

---

## 2026-06-10

### actuator health 하위경로 401로 livenessProbe SIGTERM CrashLoop (engagement#44 / learning-card#79)
| 항목 | 내용 |
| --- | --- |
| **증상** | EKS dev/staging에서 engagement·learning-card가 정상 기동(~71s) 후 ~33초 만에 SIGTERM(143) 재시작 루프(0/1). `kubectl describe pod`에 `Liveness probe failed: statuscode 401`·`Readiness probe failed: statuscode 401` |
| **원인** | `SecurityConfig`가 **정확히 `/actuator/health`만** permitAll. K8s 프로브는 하위 경로 `/actuator/health/liveness`·`/readiness`를 호출하는데 이 경로가 매칭 안 돼 `anyRequest().authenticated()`로 떨어져 **401**. (`management.endpoint.health.probes.enabled: true`라 엔드포인트는 존재 → 404가 아닌 401) → livenessProbe 실패 → SIGTERM 루프 |
| **해결** | `requestMatchers("/actuator/health", ...)` → `requestMatchers("/actuator/health/**", ...)` 로 확장해 liveness·readiness 무인증 200 보장. 회귀 방지 스모크 테스트(`actuatorHealthProbesArePermittedWithoutAuth`) 추가. engagement#44·learning-card#79 동일 패턴 적용 |
| **배운 점** | 보안 매처는 정확 경로가 아니라 **프로브가 실제 부르는 하위경로(`/**`)** 까지 permit해야 한다. 엔드포인트가 존재하면 미인증은 404가 아닌 **401**로 나와 livenessProbe를 무한 재시작시킨다. "기동 성공 후 일정 시간 뒤 SIGTERM 루프"는 헬스 프로브 인증을 먼저 의심한다 |

### 분기 보호 ruleset의 컨텍스트 불일치·strict로 PR BLOCKED·BEHIND 레이스 (synapse-gitops #165/#173)
| 항목 | 내용 |
| --- | --- |
| **증상** | 머지 가능한 PR이 required status check 미충족으로 영구 BLOCKED. 또 strict(branch up-to-date) 요구로 main에 한 건 머지될 때마다 나머지 열린 PR이 BEHIND가 돼 직렬 재빌드 레이스 |
| **원인** | ruleset의 required check 컨텍스트를 **워크플로명**으로 적어 실제 보고되는 **잡명 `validate`** 와 불일치 → 절대 충족 불가. strict ruleset은 main이 처닝될 때마다 모든 PR에 rebase+재실행을 강제 |
| **해결** | required check 컨텍스트를 잡명 `validate`로 정정(#173), strict 요구를 완화해 **PR 자체 CI만** 요구하도록 조정(#165) — main 처닝 BEHIND 레이스 제거. SHA↔semver 태깅 전략은 결정 문서로 정리(옵션 a/b/c, 권장 c) |
| **배운 점** | required status check는 **워크플로명이 아니라 잡명(보고되는 컨텍스트 문자열)** 으로 지정해야 한다. strict(up-to-date) 보호는 머지 빈도가 높은 main에서 직렬 BEHIND 레이스를 만들어 처리량을 떨어뜨리므로, PR CI 통과만 요구하는 편이 실용적이다 |

### bring-up phase_db_init의 psql \gexec 미처리 (synapse-gitops #171/#166)
| 항목 | 내용 |
| --- | --- |
| **증상** | bring-up `db-init` phase가 RDS DB 멱등 생성 SQL을 돌렸는데 `\gexec` 메타커맨드가 실행되지 않아 DB가 생성되지 않음 |
| **원인** | `psql -c "...\\gexec"`로 전달했는데 `-c`는 **단일 SQL만 처리**하고 `\gexec` 같은 메타커맨드를 무시(psql은 `-c` 모드에서 백슬래시 커맨드 미해석) |
| **해결** | `\gexec` 스크립트를 **stdin으로 전달**(`psql <<'SQL'` / 파이프)하도록 수정해 메타커맨드가 정상 실행되게 함(#171) |
| **배운 점** | `psql -c`는 메타커맨드(`\gexec`·`\if` 등)를 처리하지 않는다 — 동적 SQL 생성·실행 패턴은 stdin/파일로 넣어야 한다 |

### platform#87 DLT 가설 A 확정 — ReviewCompleted 발행 스키마 분기 (synapse-shared #50/#51)
| 항목 | 내용 |
| --- | --- |
| **증상** | platform이 소비하는 `ReviewCompleted`가 DLT로 빠지는 장애. 원인 후보가 여럿(소비측 버그 vs 발행측 스키마) |
| **원인** | 가설 A(**learning 발행 스키마가 정본과 분기**) 입증 — learning-card `ReviewCompleted` writer의 namespace·`reviewedAt`/`occurredAt` 필드가 정본과 달라 platform reader가 해소 실패. 가설을 fix-request 문서로 분기 입증 |
| **해결** | shared#50/#51로 DLT 가설 A를 확정하고 **발행 스키마 정본 정렬**을 owner fix-request로 발행 → learning#84(choyj358-ai)가 namespace·reviewedAt·occurredAt 정본 정렬로 근본 수정 |
| **배운 점** | DLT 장애는 소비측부터 보기 쉽지만 **근본원인이 발행측 writer 스키마 분기**인 경우가 많다 — 가설을 fix-request로 분기 입증해 정본 소유자(발행 owner)에게 정렬을 위임하면 소비측 우회 대신 근본 수정이 된다. 06-02 버전 드리프트 감사의 직접 귀결 |

---

## 2026-06-11

### EKS에서 ES 실기동 — fsGroup·gp3 SC 순서·es-reindex 레이스 (synapse-gitops #174/#180)
| 항목 | 내용 |
| --- | --- |
| **증상** | 인클러스터 Elasticsearch(StatefulSet)가 EKS에서 기동/색인되지 않음. es-reindex가 인덱스 존재 판정에서 오탐 |
| **원인** | (1) ES 데이터 디렉터리 권한(`fsGroup`) 미설정 + gp3 StorageClass가 ES 앱 배포보다 늦게 생성돼 PVC 바인딩 순서가 어긋남. (2) es-reindex가 `notes-v1` 존재를 **HTTP 404 응답 본문 grep**으로 판정해, 본문 문자열 매칭이 오탐(레이스) |
| **해결** | #180으로 `fsGroup`·ES앱 배포·gp3 SC 생성 **순서를 고정**하고 StatefulSet ready 대기 추가. #185로 인덱스 존재 판정을 **본문 grep → HTTP 상태코드**로 교체(404=부재, 200=존재)해 오탐 제거. bring-up에 `es-reindex` phase + nori/검색 verify 등록(#179) |
| **배운 점** | 스테이트풀 컴포넌트는 권한(`fsGroup`)·StorageClass·앱 배포의 **순서**가 한 번이라도 어긋나면 1회성으로 깨진다. 존재 판정은 **응답 본문 문자열이 아니라 HTTP 상태코드**로 해야 오탐이 없다. 이런 레이스는 로컬 kind가 아니라 실 EKS 1회 기동에서만 드러난다 |

### analysis-nori가 ES 커스텀 이미지를 요구 (synapse-gitops #177 / synapse-shared #53/#54/#55)
| 항목 | 내용 |
| --- | --- |
| **증상** | knowledge 한국어 검색에 필요한 `analysis-nori` 플러그인이 stock Elasticsearch 이미지에 없어 인덱스 analyzer 생성 실패 |
| **원인** | Nori(한국어 형태소)는 ES에 **플러그인 설치가 필요**한데 공식 이미지엔 미포함. gitops#177은 커스텀 이미지로 교체하려 했으나 이미지 빌드 파이프라인 부재로 BLOCKED(shared#53) |
| **해결** | shared#54로 **nori 설치 ES 커스텀 이미지를 ECR에 빌드·push하는 워크플로** 신설, #55로 ECR Describe/Create 권한 의존 제거(배포 role 실측 권한 반영). gitops는 이 ECR 이미지로 ES StatefulSet 교체 |
| **배운 점** | 형태소 분석 플러그인(Nori)은 런타임 설치가 아니라 **이미지에 구워** 넣어야 EKS에서 재현된다. 커스텀 이미지가 필요하면 ECR 빌드 파이프라인을 먼저 세우고, 배포 role의 **실측 권한**(Describe/Create 가능 여부)에 워크플로를 맞춘다 |

### engagement 콜드스타트 오진 → revert → 실 근본원인은 actuator 401 (synapse-gitops #187/#188)
| 항목 | 내용 |
| --- | --- |
| **증상** | engagement 파드 CrashLoop을 콜드스타트(기동 지연) 문제로 보고 cpu req·startupProbe를 키웠으나 재시작 루프가 지속 |
| **원인** | #187에서 콜드스타트로 **오진**해 인프라 튜닝(cpu req 250m·startupProbe 300s)을 적용했지만, 실제 근본원인은 **actuator health 하위경로 401**(engagement#43/#44). 인프라 증상(SIGTERM)이 앱 보안 결함을 가렸다 |
| **해결** | #188로 오진 수정(#187)을 **revert**하고, 실 근본원인을 앱 측 actuator 401 수정(engagement#44)으로 처리. 핸드오프에 오진→원복 경위 기록 |
| **배운 점** | "기동 후 일정 시간 뒤 SIGTERM 루프"는 콜드스타트처럼 보이지만 **헬스 프로브 응답코드(401)** 를 먼저 확인했어야 했다. 오진 위에 인프라 튜닝을 쌓으면 증상이 가려지므로, **오진은 깨끗이 revert하고 실 근본원인부터** 다시 본다 |

### staging 이미지 태그 불일치 ImagePullBackOff + 부동 태그 결정성 (synapse-gitops #191/#192, #164)
| 항목 | 내용 |
| --- | --- |
| **증상** | staging에서 engagement·learning-card가 `ImagePullBackOff`. dev에선 멀쩡 |
| **원인** | staging overlay의 이미지 태그가 ECR에 실제 push된 태그와 불일치(#191). 더 근본적으로 `dev-latest` 같은 **부동(floating) 태그**를 staging이 참조해 어떤 이미지가 도는지 비결정적이고 롤백 불가(#164) |
| **해결** | #192로 staging 이미지 태그를 ECR 실제 태그로 정정. #164로 learning-card staging 이미지를 `dev-latest`→**SHA 핀**으로 바꿔 결정성·롤백 확보. (앞서 #189에서 engagement dev overlay newTag 1.0.1→1.0.0으로 ImagePull 복구) |
| **배운 점** | 환경 간 이미지 참조는 **불변 식별자(SHA/semver)** 로 핀해야 한다 — `dev-latest` 부동 태그는 staging에서 무엇이 도는지 비결정적으로 만들고 ImagePullBackOff·롤백 불능을 부른다 |

### destroy 시 orphan ALB/NLB가 VPC teardown 차단 + Windows KUBECONFIG 경로 (synapse-gitops #178/#181)
| 항목 | 내용 |
| --- | --- |
| **증상** | `bring-up.sh --destroy`가 VPC 삭제 단계에서 의존 리소스 잔존으로 실패. 별도로 Git Bash에서 Windows kubectl 사용 시 KUBECONFIG 경로가 안 맞아 터널 readiness 실패 |
| **원인** | (1) Ingress/Service(LoadBalancer)가 만든 ALB/NLB가 terraform 관리 밖에서 생성돼, VPC teardown 시 ENI 의존으로 **orphan LB가 남아 차단**. (2) Git Bash 경로(`/c/...`)와 Windows kubectl이 기대하는 경로(`C:\...`)가 달라 KUBECONFIG 미해석 |
| **해결** | #178로 destroy 전 **orphan ALB/NLB를 선정리**하는 단계 추가(VPC teardown 실패 차단). #181로 Git Bash에서 Windows kubectl용 KUBECONFIG 경로를 자동 변환. 라이브 산출물은 `.gitignore` 처리(#184) |
| **배운 점** | 컨트롤러가 동적 생성하는 LB(ALB/NLB)는 IaC 밖이라 **destroy 순서에서 선정리**하지 않으면 VPC를 잡는다. 크로스플랫폼(Windows+Git Bash) 도구 경유는 경로 변환을 스크립트가 흡수해야 한다 |

### EKS 매니지드 컨트롤플레인 Prometheus 룰 false-positive (synapse-gitops #194/#195)
| 항목 | 내용 |
| --- | --- |
| **증상** | 관측 스택이 EKS 컨트롤플레인 관련 알람을 상시 발화(스크래이프 타깃 없음/지표 부재) |
| **원인** | EKS는 **매니지드 컨트롤플레인**이라 etcd/apiserver 등 컨트롤플레인 컴포넌트 지표를 사용자 Prometheus가 스크래이프할 수 없는데, 자체 호스팅 가정의 룰이 그대로 켜져 false-positive |
| **해결** | #195로 매니지드 컨트롤플레인 대상 룰을 **비활성**(#194 false-positive). 함께 ESO sync 알람·앱별 대시보드·Grafana nip.io ingress로 W3 Step8 관측 잔여를 마감(#170) |
| **배운 점** | 매니지드 컨트롤플레인(EKS)에서는 self-hosted용 컨트롤플레인 알람 룰이 구조적으로 false-positive다 — 관측 룰셋은 **실제 스크래이프 가능한 타깃**에 맞춰 매니지드/셀프호스팅을 구분해야 한다 |

### node20→24 GitHub Actions 메이저 업그레이드 (synapse-shared #56/#57)
| 항목 | 내용 |
| --- | --- |
| **증상** | GitHub Actions의 Node 20 런타임 deprecation으로 워크플로 액션이 경고/폐기 예정 |
| **원인** | 액션 런타임이 Node 24로 이동하며 Node 20 기반 액션이 deprecated |
| **해결** | shared#56으로 공용 워크플로 액션을 Node 24로 일괄 상향하고, #57로 owner 4종(서비스 레포)에 동일 업그레이드 이슈를 fix-request로 발행. 각 서비스도 후속 적용(knowledge#81·platform#99 등) |
| **배운 점** | 액션 런타임 deprecation은 공용 reusable에서 먼저 올리고 **owner 이슈로 일괄 전파**하면 레포별 누락 없이 수렴한다. (05-20·06-02의 Node 폐기 대응과 같은 패턴이 반복) |

---

## 2026-06-12

### JWT 공개키 사본 드리프트로 전 인증 API 401 — 공개키 단일출처화 (synapse-gitops #196)
| 항목 | 내용 |
| --- | --- |
| **증상** | 게이트웨이 경유 전 인증 API가 401. gateway는 자체 사본 공개키가 06-08 시드 때 오염돼 서명 검증 실패, knowledge/engagement/learning-card는 `JWT_PUBLIC_KEY` 미주입이라 `SecurityConfig`가 **ephemeral(임시 생성) 키로 폴백** → 실토큰이 전부 401. |
| **원인** | 서명 주체는 platform-svc 하나인데 공개키가 **여러 사본으로 분산**(gateway 전용 사본 + 서비스별 미주입)돼 드리프트. 사본 오염·미주입이 곧 검증 실패인데, 미주입이 에러가 아니라 **조용한 ephemeral 폴백**으로 나타나 더 늦게 발견된다. |
| **해결** | gateway `ExternalSecret` remoteRef를 서명 주체 경로(`synapse/{env}/platform-svc/jwt-public-key`)로 변경해 **사본 경로 폐기**, knowledge/engagement/learning-card ExternalSecret에 `JWT_PUBLIC_KEY` 추가, prod 오버레이에 신규 인덱스 remoteRef patch. |
| **배운 점** | 단일 서명자 자산(공개키)은 **사본 금지·단일출처(SoT)** 가 원칙 — 사본은 시드 시점에 오염되면 드리프트로 전수 장애를 낸다. 키 미주입이 에러 대신 ephemeral 폴백으로 나타나면 "기동은 되는데 전부 401"이라 가장 까다롭다. [[verify-merge-state-via-origin]]류의 "조용한 폴백" 계열. |

### 검색 인덱싱 파이프라인 3중 단절 — 토픽·Redis·다운스트림 URL 동시 누락 (synapse-gitops #198)
| 항목 | 내용 |
| --- | --- |
| **증상** | dev 노트 생성 후 검색 0건. 인덱싱 이벤트가 `UNKNOWN_TOPIC_OR_PARTITION`으로 유실되거나 멱등store 단계에서 전 레코드 DLQ행, 청킹/임베딩도 실패. |
| **원인** | 세 곳이 동시에 끊김 — (1) `knowledge.note.note-search-sync-v1`(+`.dlq`) 토픽이 `topics.txt` 정본에 누락, (2) knowledge가 `SPRING_DATA_REDIS_*` 미주입이라 `KafkaIdempotencyStore`가 `localhost:6379` 폴백 → 전 레코드 DLQ, (3) `SEARCH_AI_BASE_URL` 미설정이라 청킹/임베딩이 `localhost:8090` 폴백. |
| **해결** | `topics.txt`에 토픽+DLQ 추가(라이브 생성), knowledge dev/staging/prod에 `SPRING_DATA_REDIS_HOST/PORT/SSL`(+prod DATABASE=1)·ExternalSecret에 `SPRING_DATA_REDIS_PASSWORD`(platform redis-auth-token) 주입, `SEARCH_AI_BASE_URL=http://learning-ai` 설정. |
| **배운 점** | 파이프라인 장애는 **단일 원인이 아니라 토픽·멱등store·다운스트림 URL이 모두 충족돼야 흐른다** — 어느 하나라도 `localhost` 폴백이면 조용히 유실/DLQ. "env 주입≠앱 배선"의 인프라판이자 [[redis-topology-decision]]·[[kafka-service-audit-state]]와 같은 계열. |

### SynapseHighMemory 12건 동시 오탐 — cAdvisor 이중합산(최대 194%) (synapse-gitops #194)
| 항목 | 내용 |
| --- | --- |
| **증상** | 메모리 알람 12건이 동시에 firing, 사용률이 최대 194%로 비현실적. |
| **원인** | PrometheusRule이 cAdvisor 메모리 시리즈를 무필터 합산 — pod cgroup roll-up 시리즈(`container=""`)가 컨테이너별 시리즈와 함께 더해져 **사용률이 약 2배**로 계산됐다. |
| **해결** | rule에 `container!=""` 필터 추가로 roll-up 시리즈 제외. 필터 후 실측(P95)에서 90% 초과는 platform-svc 3파드뿐(495Mi/512Mi=96.7%)이라 **진성 압박만 분리** → platform limit 512→768Mi(P95×1.3 런북 공식)·request 384Mi 상향. |
| **배운 점** | cAdvisor 메모리/CPU 합산 시 `container=""` cgroup roll-up을 **반드시 제외**해야 이중합산을 피한다. 오탐을 끄기 전에 **실측으로 진성 압박을 분리**(끄기 vs 상향)해 알람 신뢰를 지켰다 — 06-11 컨트롤플레인 false-positive(#194/#195)와 같은 관측 정밀화 계열. |

### bastion cloud-init IAM 전파 레이스 + destroy마다 ECR 이미지 소실 (synapse-gitops #182)
| 항목 | 내용 |
| --- | --- |
| **증상** | 06-11 02:44 bastion `update-kubeconfig`가 실패(정책 부재로 오진하기 쉬움). 별개로 윈도우 destroy를 돌릴 때마다 ECR 이미지 8종이 전부 삭제돼 재빌드 필요. |
| **원인** | (1) bastion `user_data`가 IAM 정책을 **문자열로만 참조**해 Terraform 암묵 의존성이 안 생김 → cloud-init 시점에 IAM이 아직 전파되지 않은 **레이스**(정책 자체는 현존 확인). (2) ECR이 dev 스택에 포함돼 dev destroy 때 이미지까지 동반 삭제. |
| **해결** | bastion `aws_instance`에 EKS·IAM 인라인정책 `depends_on` 명시 + `update-kubeconfig` 재시도 루프(30×30s). ECR 7서비스+elasticsearch를 **standalone 스택(자체 S3 state·`prevent_destroy`)** 으로 분리하고 기존 수동 생성분 8종 import+apply(plan: 0 add/0 destroy). |
| **배운 점** | `user_data`/스크립트 안의 리소스 참조는 Terraform **암묵 의존성을 만들지 않는다** → `depends_on` 명시 + 런타임 재시도로 전파 레이스를 흡수한다. **수명주기가 다른 자산(ECR 이미지)은 destroy 대상 스택에서 분리**해 라이프사이클을 격리해야 매 destroy마다 소실되지 않는다. |

### dev·staging이 공유 MSK·공유 컨슈머그룹으로 파티션 환경 교차 → 이벤트 누수 (#199, 토픽 환경 프리픽스)
| 항목 | 내용 |
| --- | --- |
| **증상** | dev knowledge(1 pod) + staging knowledge(2 pods)가 **같은 토픽을 같은 consumer group**(`knowledge-search-indexer`)으로 소비 → 3파티션이 dev 1·staging 2로 분산. dev에서 만든 노트의 인덱싱 이벤트 ~2/3이 **staging 컨슈머로 가** dev ES 미인덱싱(검색 0건)·staging은 ES 부재로 DLQ. 토픽을 공유하는 9개 그룹 전체에 구조적으로 동일 |
| **원인** | 공유 MSK 위에서 **토픽명·컨슈머 그룹에 환경 구분이 없어** Kafka가 dev+staging 파드를 한 그룹으로 보고 파티션을 교차 배정. W4 MSK 설계(공유 MSK) 시점엔 staging 앱 미가동이라 미노출, staging 동시 가동으로 발현 |
| **해결** | **옵션 B — 토픽 환경 프리픽스**(`${KAFKA_TOPIC_PREFIX}<base>`, `dev.`/`staging.`/`prod.`). **인프라 직접 완료**: gitops#206(5서비스×dev/staging/prod 오버레이 15개 `KAFKA_TOPIC_PREFIX`/`LEARNING_AI_KAFKA_TOPIC_PREFIX` 주입 + bring-up이 ""·dev.·staging.·prod. 토픽 멱등 생성), shared#72(`EVENT_CONTRACT_STANDARD §2.1` 표준). 앱 적용은 서비스 이슈 위임 — **platform#102 해소(main 5파일)**, **learning#93·engagement#49 dev 적용**, **knowledge#87 미착수**. 데모 전 임시책: staging knowledge auto-sync 중지 후 scale 0 |
| **배운 점** | 한 클러스터를 여러 환경이 공유하면 **토픽/그룹에 환경 식별이 없을 때 파티션이 교차 분산돼 이벤트가 샌다.** env 주입(gitops)은 필요조건일 뿐 — 앱이 토픽명을 `prefix+base`로 구성해야 충분조건(주입≠배선, [[kafka-tls-msk-app-readiness-gap]] 패턴과 동일). 인프라 변경은 서비스 채택 전까지 inert라 무중단 머지 가능하나, 채택 완료 전엔 충돌 잔존 → 임시 scale-down 병행 |

### ServiceMonitor가 비-Spring 워크로드 3종을 스크랩해 상시 TargetDown/PodDown (synapse-gitops #207)
| 항목 | 내용 |
| --- | --- |
| **증상** | frontend(nginx)·elasticsearch·schema-registry에 대해 `TargetDown`·`SynapsePodDown`이 상시 firing. |
| **원인** | 이 3종은 `/actuator/prometheus`가 **존재할 수 없는** 워크로드(nginx·exporter 미구성·JMX 미구성)인데 actuator 전제 ServiceMonitor가 무차별 스크랩 → `up==0` → 상시 firing. |
| **해결** | ServiceMonitor 대상에서 3종 제외(gateway는 Spring이라 유지 — exposure 노출은 gateway 레포 트랙 #7로 분리). ES/SR exporter 도입 시 재포함. |
| **배운 점** | actuator(`/actuator/prometheus`) 전제 ServiceMonitor를 **비-Spring 워크로드에 무차별 적용하면 상시 오탐**. 스크랩 대상은 메트릭 노출 가능 워크로드로 선별해야 하며, **앱측 노출(gateway #7)과 인프라측 대상 선별(#207)은 한 쌍**으로 다뤄야 한다. |

### Boot 4.0 게이트웨이 actuator prometheus 미노출(404)로 상시 TargetDown — exposure+레지스트리 둘 다 필요 (synapse-gateway #7/#8)
| 항목 | 내용 |
| --- | --- |
| **증상** | gitops ServiceMonitor가 gateway `/actuator/prometheus`를 스크랩하는데 404 → `up==0` → `TargetDown`·`SynapsePodDown` 상시 firing. |
| **원인** | Spring Boot 4.0에서 prometheus 엔드포인트 노출은 `management.endpoints.web.exposure.include`만으론 **부족** — `micrometer-registry-prometheus` 의존성이 있어야 `PrometheusMetricsExportAutoConfiguration`이 활성화돼 엔드포인트가 생긴다. 의존성 부재로 노출 설정을 해도 404. |
| **해결** | exposure.include에 `prometheus` 추가 + `micrometer-registry-prometheus`(runtimeOnly) 의존성 추가. 로컬 검증(JWT_PUBLIC_KEY 주입): `GET /actuator/prometheus → 200`, `text/plain;version=0.0.4`, 116 metric lines. 라이브 검증은 클러스터 destroy로 대기. |
| **배운 점** | **Boot 4.0의 prometheus 노출은 exposure 설정 + micrometer 레지스트리 의존성 두 가지가 모두 있어야** 한다(노출 설정만으론 404). 메모리 [[gateway-prometheus-boot4]]. #207(인프라측 비대상 제외)과 짝을 이루는 앱측 수정. |

### destroy 선정리 갭 3건 — field-selector 버그·컨트롤러 SG·EBS orphan (synapse-gitops, 2026-06-12 destroy 실측)
| 항목 | 내용 |
| --- | --- |
| **증상** | 2026-06-12 destroy가 VPC `DependencyViolation`으로 ~20분 행 후 실패. LoadBalancer Service 선정리가 무력, loki·ES의 EBS 볼륨이 available로 잔존해 과금. |
| **원인** | (1) `kubectl delete svc --field-selector spec.type=LoadBalancer`는 BadRequest — **Service는 `metadata.name/namespace` 필드만 field-selector 지원**(애초에 동작한 적 없는 코드). (2) ALB 컨트롤러가 동적 생성한 SG(`k8s-*`)가 Terraform state 밖에 잔존 → VPC 삭제 차단. (3) EBS CSI 동적 PV(loki·ES)가 available로 잔존. |
| **해결** | (1) LB Service 열거를 jsonpath로 교체, (2) 상호참조 룰 revoke 후 컨트롤러 SG 삭제 추가, (3) `kubernetes.io/cluster/<name>` 태그 기준 EBS available 볼륨 reap 추가. |
| **배운 점** | `--field-selector`는 **리소스별 지원 필드가 제한**(Service는 name/ns만)이라 타입 필터엔 jsonpath를 써야 한다. **컨트롤러가 동적 생성한 자산(SG·EBS PV)은 Terraform state 밖**이라 명시적 reap이 없으면 teardown을 막거나 과금된다 — 라이브 destroy 1회로만 드러나는 갭(W5 "실기동으로만 잡힌다" 계열). |

### 로컬 compose 단일 DB 공유로 Flyway history checksum mismatch (synapse-shared #75)
| 항목 | 내용 |
| --- | --- |
| **증상** | 기본 `docker-compose`로 여러 서비스를 함께 띄우면 서비스 간 Flyway 마이그레이션 버전(V1, V2…)이 겹쳐 `flyway_schema_history` checksum mismatch로 기동 실패. |
| **원인** | 기본 compose의 postgres가 서비스별 DB 분리 없이 **단일 `synapse` DB의 history를 공유** — 서비스마다 V1부터 시작하니 같은 버전 번호가 충돌한다. |
| **해결** | e2e compose에서만 쓰던 `scripts/initdb`를 기본 `docker-compose.yml`에도 마운트해 최초 기동 시 `synapse_platform/engagement/knowledge/learning/ai` DB를 자동 생성. 기존 `postgres-data` 볼륨엔 init이 재실행되지 않아 README에 `down -v`/수동 생성 안내 추가. 각 svc `application-dev.yml` 기본 URL 전환은 svc 레포 이슈로 분리. |
| **배운 점** | 서비스별 Flyway history는 **DB(또는 스키마) 단위로 격리**해야 한다 — 단일 DB 공유 시 전역 버전 충돌은 시간문제(06-05 platform V28 전역 정수 충돌의 로컬 compose판, [[flyway-migration-standard]]). |

---

## 부록 A: 팀 레포 교차 트러블슈팅 (team-lead 연관 — 본인 외 owner 작성)

> 본문은 velka 본인 커밋의 트러블슈팅이다. 이 부록은 **서비스 owner(팀원)가 각 레포에서 직접 해결**했지만 **velka의 team-lead / gitops·shared·gateway 영역(공유 계약·인프라·표준·게이트웨이)과 직접 맞물린** 인시던트를 모았다. 상당수는 velka가 감사·인프라·표준으로 식별/선행한 갭의 **앱측 종결**이거나, velka가 인프라측에서 본 증상의 **앱측 근본**이다. 각 항목 **연관·교훈** 행에 velka 영역과의 연결을 명시한다. 출처: 2026-06-15 origin 기준 5개 서비스 레포 + frontend 전수 스캔(velka·봇 커밋 제외). 본문 일자 인덱스에는 미포함(본인 외 작성).

### A1. #199 토픽 환경 프리픽스 — 앱측 채택 (knowledge#91/#92 · learning#94/#96 · engagement#50)
| 항목 | 내용 |
| --- | --- |
| **증상** | gitops#206이 `KAFKA_TOPIC_PREFIX`를 주입하고 bring-up이 프리픽스 토픽을 생성해도, 앱이 토픽명을 prefix로 구성하지 않으면 여전히 base 토픽으로 발행/구독 → dev·staging 교차 소비 잔존. |
| **원인** | 토픽명이 producer/consumer/DLQ/`@KafkaListener`·하드코딩 상수에 분산돼 env 주입만으론 무효(주입≠배선). |
| **해결** | 각 서비스가 공통 prefix resolver 도입 — knowledge#91(note created/updated·search-sync·DLQ를 단일 resolver로, `TopicPrefixLiveIntegrationTest`로 실 Kafka/SR 검증; #92에서 CI 스택으로 회귀 방지), learning#94/#96(`KAFKA_TOPIC_PREFIX`·`LEARNING_AI_KAFKA_TOPIC_PREFIX`), engagement#50(prefix resolver). live 검증은 기본 test에서 전용 task로 분리(CI clean build 보호). |
| **연관·교훈** | velka의 gitops#206·shared#72(`EVENT_CONTRACT_STANDARD §2.1`) 인프라/표준의 **앱측 종결**. "env 주입(gitops)≠앱 배선"이 그대로 입증 — 인프라가 inert로 선행한 뒤 owner가 resolver로 닫아야 충돌이 사라진다([[kafka-topic-env-prefix-199]]). |

### A2. search consumer-group 미등록 → ES 색인 0건 (knowledge#76)
| 항목 | 내용 |
| --- | --- |
| **증상** | dev에서 노트를 만들어도 ES 색인 0건(검색 무응답). |
| **원인** | (1) `@KafkaListener`가 리스너 ID를 consumer group으로 승격(`idIsGroup` 기본 true)해 의도한 `knowledge-search-indexer` 그룹 미등록, (2) 전역 `spring.kafka.listener.auto-startup`이 search 인덱싱 컨슈머를 **조용히 비활성**. |
| **해결** | knowledge#76 — 명시적 `groupId`+`idIsGroup=false`, search 리스너 시작 조건을 전용 키로 분리, 500 경로 error 로그·stack trace, 검색 E2E·dev 런타임 로그로 구독·파티션 할당 재검증. |
| **연관·교훈** | velka가 인프라측에서 본 "검색 0건"(#198 토픽·Redis·URL, #199 파티션 교차)의 **앱측 근본 한 갈래** — 같은 증상도 컨슈머 그룹 승격·`auto-startup` 같은 앱 설정이 원인일 수 있다. `@KafkaListener`의 listener-ID→group 승격은 흔한 함정. |

### A3. KAFKA_ENABLED 게이트 — 앱측 도입·revert·재도입 (knowledge#54→#57 · learning#53/#54)
| 항목 | 내용 |
| --- | --- |
| **증상** | Spring 서비스에서 `KAFKA_ENABLED` env가 no-op(토글 불가). knowledge는 게이트 도입 PR(#54) 머지 직후 revert(#57)했다 재정비. |
| **원인** | `synapse.kafka.enabled` 게이트(`@ConditionalOnProperty`)가 KafkaConfig·Publisher·OutboxDispatcher·Producer·Consumer 등 6곳에 없어 env 무효. #54 머지 후 회귀로 #57 revert. |
| **해결** | knowledge#54(6곳 게이트 + `KAFKA_ENABLED:false` 바인딩 + CI schema-registry/compose), learning#53/#54(engagement 패턴 정합, close #49). |
| **연관·교훈** | velka의 06-04 감사가 번호화한 "KAFKA_ENABLED no-op(G1)"의 앱측 종결(knowledge#46·learning#49 위임분). 횡단 토글은 발행·구독·outbox·config 빈 **전부에 일관 적용**해야 하고, 회귀 시 무리한 수정보다 revert 후 재정비가 깨끗(velka의 Revert 패턴과 동형). |

### A4. Flyway 타임스탬프 표준 — 앱측 채택 (knowledge#51)
| 항목 | 내용 |
| --- | --- |
| **증상** | platform V28 류 전역 정수 버전 충돌 위험이 타 서비스에 잔존. |
| **원인** | 서비스가 velka의 shared Flyway 표준(타임스탬프 버전·out-of-order·baseline)을 미채택. |
| **해결** | knowledge#51 — `application.yml`에 `out-of-order: true`·`baseline-on-migrate: true`·`baseline-version: 8` 추가, 이후 신규는 `V<yyyyMMddHHmmss>__` 14자리. (단, flyway-guard caller는 팀장 권한으로 별도 추가 명시) |
| **연관·교훈** | velka의 shared#22 Flyway 표준/CI 가드의 앱측 채택(knowledge#48 위임분, [[flyway-migration-standard]]). 표준은 owner가 application 설정으로 받아야 실효 — 가드 caller는 권한 분리로 팀장 몫(표준↔강제의 역할 경계). |

### A5. MSK TLS security.protocol — 앱측 배선 (knowledge#45)
| 항목 | 내용 |
| --- | --- |
| **증상** | MSK가 TLS-only(9094)인데 SSL env 주입에도 PLAINTEXT로 연결 시도 → 연결 실패. |
| **원인** | 커스텀 Kafka factory props에 `security.protocol`이 없어 `SPRING_KAFKA_SECURITY_PROTOCOL=SSL` env가 무효(주입≠배선). |
| **해결** | knowledge#45 — global/search KafkaConfig에 `security.protocol` 조건부 주입 + application.yml 바인딩 + KafkaConfig 테스트 보강. |
| **연관·교훈** | velka의 06-04 **"Kafka TLS MSK env-only 미배선 갭"** 감사가 정확히 예측한 결함의 앱측 실증·종결([[kafka-tls-msk-app-readiness-gap]]) — 서비스 커스텀 팩토리가 `security.protocol`을 읽어야 충분조건. 감사로 번호화한 갭이 라이브에서 그대로 확인됐고 owner가 닫았다. |

### A6. actuator 앱측 정합 — prometheus 노출(knowledge#86) + health 하위경로 401(learning#79)
| 항목 | 내용 |
| --- | --- |
| **증상** | (a) staging knowledge `/actuator/prometheus` 미노출 → ServiceMonitor scrape 실패. (b) learning-card staging readiness probe가 `/actuator/health/readiness`에서 401. |
| **원인** | (a) prometheus registry 의존성·노출·permitAll 부재(Boot 4). (b) `/actuator/health`만 정확 매칭 permit → 프로브 하위경로 401. 추가로 learning은 confluent가 끌어온 비jakarta swagger로 `/v3/api-docs` 500. |
| **해결** | knowledge#86(registry 의존성+노출+permitAll+회귀테스트, endpoint 200), learning#79(`/actuator/health/**` permitAll, dev 외 전 프로파일) + learning#75(confluent swagger-core.v3 exclude로 500 해소). |
| **연관·교훈** | velka의 gateway#7(prometheus 노출)·gitops#207(ServiceMonitor 비대상 제외)·engagement#44(health 401)와 **동일 계열의 앱측 정합**([[gateway-prometheus-boot4]]) — Boot 4 prometheus는 노출+레지스트리 둘 다, 헬스 매처는 프로브 하위경로(`/**`)까지. 전 서비스가 같은 함정을 각자 만났다. |

### A7. ReviewCompleted 발행 스키마 정본 정렬 — DLT 가설 A 종결 (learning#84)
| 항목 | 내용 |
| --- | --- |
| **증상** | platform#87 DLT — `ReviewCompleted` 이벤트 역직렬화 실패. |
| **원인** | learning이 발행하는 `ReviewCompleted` writer 스키마가 정본과 분기(namespace·`reviewedAt`·`occurredAt`). |
| **해결** | learning#84 — Avro 스키마 namespace·타입 정정 + import 일괄 수정으로 정본 정렬. |
| **연관·교훈** | velka가 shared#50/#51로 입증한 **DLT 가설 A(발행측 스키마 분기가 근본)** 의 owner측 **근본 종결**([[kafka-service-audit-state]]). 소비측 우회가 아니라 발행 owner가 writer 스키마를 정본 정렬해야 닫힌다 — 가설 입증→owner 위임→정본 정렬의 완결 사례. |

### A8. platform dev 기본 DB URL 분리 — shared#75 후속 종결 (platform#108, 06-15)
| 항목 | 내용 |
| --- | --- |
| **증상** | 로컬 bootRun에서 `DB_URL` 미지정 시 폴백이 공용 `synapse` DB → engagement/knowledge와 단일 `flyway_schema_history` 공유 → checksum mismatch로 기동 실패. |
| **원인** | dev 폴백 기본값이 서비스 전용 DB가 아닌 공용 DB. (배포 환경은 이미 서비스별 DB·`DB_URL` 명시라 무영향) |
| **해결** | platform#108 — dev 폴백을 `synapse_platform`으로 분리 + CI dev-smoke postgres DB도 정합(`synapse_platform`). 검증: Flyway 27개 마이그레이션 정상·health UP·mismatch 미발생. |
| **연관·교훈** | velka의 shared#75(서비스별 DB initdb)의 **svc측 후속 종결** — velka가 "svc 기본 URL 전환은 svc 이슈로 분리"한 것을 platform owner가 닫음(06-15 기준 platform 완료, 타 svc 동일 후속 필요). 본 문서가 추적하는 **최신 커밋**. |

### A9. AI 카드 생성 체인 계약 단절 — deckId·content/NoteApiClient (knowledge#85 · learning#87/#78)
| 항목 | 내용 |
| --- | --- |
| **증상** | API로 만든 노트에서 AI 카드 자동생성이 전혀 트리거 안 됨 + learning-ai가 note-created 소비 시 DLQ. |
| **원인** | (1) knowledge note-created payload에 `deckId` 부재 → learning-ai가 deckId null이면 카드 생성 skip. (2) learning-ai가 content를 HTTP `NoteApiClient`로 재조회 → knowledge 경로·ID타입·JWT **3중 불일치로 DLQ**. |
| **해결** | knowledge#85(`NoteCreateRequest`·엔티티·발행 payload에 `deckId` + 마이그레이션), learning#87/#78(note-created 이벤트의 `content`를 `pipeline_fn`에 직접 전달 → HTTP 재조회 제거). |
| **연관·교훈** | shared 이벤트 계약(velka 영역)의 cross-service 단절 — **이벤트는 소비자가 필요로 하는 필드(deckId·content)를 payload에 담아야** HTTP 역호출(경로·ID·JWT 불일치 DLQ)을 피한다. velka의 Avro 정본 정렬과 같은 "계약은 payload까지" 계열([[data-sync-outbox-cqrs]]). |

### A10. learning-ai SSL ssl_context CrashLoop — owner측 동일 인시던트 (learning#63)
| 항목 | 내용 |
| --- | --- |
| **증상** | `security_protocol=SSL` 환경(dev gitops)에서 aiokafka가 기동 실패(CrashLoop). |
| **원인** | aiokafka는 `security_protocol=SSL`만으론 부족, `ssl_context` 필수 인자 누락 시 ValueError. |
| **해결** | learning#63 — consumer.py·notification_producer.py 양쪽 `start()`에 `ssl.create_default_context()` 생성·전달(closes gitops#144). |
| **연관·교훈** | 본문 2026-06-09에 velka측(learning#67)으로 이미 기록된 인시던트의 **owner측 commit**(시간상 먼저). Python 클라이언트도 "env 주입≠배선"(`ssl_context` 부속 객체 필요)이 동일([[kafka-tls-msk-app-readiness-gap]]) — velka와 owner가 같은 근본을 양쪽에서 닫았다. |

### A11. 서비스 dev-smoke/CI 공통 함정 — Docker Hub rate-limit · Redis 헬스 · KafkaConfig 빈 충돌 (learning#46 · knowledge ci/merge)
| 항목 | 내용 |
| --- | --- |
| **증상** | dev-smoke CI 실패 다발 — (a) Docker Hub 익명 pull 제한(100회/6h) 초과 타임아웃, (b) actuator/health DOWN, (c) ApplicationContext 빈 충돌. |
| **원인** | (a) `docker/login-action` 부재, (b) `docker-compose.ci.yml`에 redis 누락(앱은 redis 의존), (c) global/KafkaConfig와 search/KafkaConfig가 둘 다 `@Configuration KafkaConfig`라 빈 `kafkaConfig` 중복 + `@Primary` KafkaTemplate 충돌. |
| **해결** | learning#46·knowledge hotfix(`docker/login-action@v3`), knowledge(`redis:7-alpine` 추가, app-dev.yml과 일치), knowledge(`@Configuration("searchSyncKafkaConfig")` + `@Bean("searchSyncKafkaTemplate")`+`@Qualifier`로 충돌 해소). |
| **연관·교훈** | velka가 표준화한 dev-smoke CI(shared reusable·`docker-compose.ci`)의 서비스측 공통 함정 — 의존성 추가(redis)·외부 레지스트리 제한·동명 `@Configuration` 빈 충돌은 전 서비스가 만난다. velka가 svc-template에서 본 "Consumer bean name 충돌"·learning dev-smoke redis와 동형([[flyway-migration-standard]] 류 표준-채택 갭). |

### A12. frontend SSE 게이트웨이 버퍼링·타임아웃 (frontend#42)
| 항목 | 내용 |
| --- | --- |
| **증상** | staging/prod에서 AI Q&A SSE 스트리밍이 깨짐(긴 답변 강제 종료·버퍼링), 한글 청크 크래시. |
| **원인** | nginx/API GW가 `text/event-stream`을 **버퍼링**, dio `receiveTimeout` 60s 고정이 SSE 전체 응답에 적용, `X-User-Id` 불일치, 한글 3바이트 경계 청크 잘림. |
| **해결** | frontend#42 — SSE 요청에 `Cache-Control: no-cache`(프록시 버퍼링 비활성 표준 헤더), `receiveTimeout` null, `X-User-Id`를 learning과 동일 UUID로 통일, `Utf8Decoder(allowMalformed)`. |
| **연관·교훈** | **gateway/프록시(velka 영역)** 가 SSE를 버퍼링하는 고전 함정 — 스트리밍 경로는 프록시 버퍼링 비활성 헤더가 필수. 엣지(게이트웨이) 동작이 앱 스트리밍 UX를 좌우한다. |

### A13. frontend ui-completion 발산 revert 체인 — G7 owner측 (frontend#27→#28/#29→#30)
| 항목 | 내용 |
| --- | --- |
| **증상** | frontend main↔dev 발산 — ui-completion(#25) 머지·인라인 정리(#27) 후 깨진 테스트·고아 part 파일로 #28/#29 revert, main 배포본을 #24 승인 디자인으로 복원(#30). |
| **원인** | 대규모 UI 인라인/머지가 dev·main 양쪽에 충돌·고아 파일·깨진 테스트를 남겨 "정본 불명확". |
| **해결** | owner(KHJ)가 revert 체인으로 정리 + main 복원. velka는 deploy 표준 통일(frontend#54~#56, semver on main)로 **재발산 자체를 구조적으로 차단**. |
| **연관·교훈** | velka의 06-08 보고서 **최우선 리스크 G7(frontend 발산)** 의 owner측 정리 사건([[main-direct-pr-cleanup]]) — 개별 revert는 owner가, 재발산 구조 제거(deploy 단일 정본)는 team-lead가. "정본 불명확" 발산은 정리+구조화가 함께 가야 닫힌다. |
