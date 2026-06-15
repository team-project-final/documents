# SYNAPSE 전체 아키텍처 현황 보고서 — 설계

- 날짜: 2026-06-08
- 상태: 승인됨 (브레인스토밍 완료)
- 산출물: `docs/synapse-architecture-status-2026-06-08.md` (팀 공유용, 한국어)

## 1. 목적

SYNAPSE 멀티레포 시스템의 전체 구성(애플리케이션 서비스, 인프라/gitops, CI/CD, 알려진 간극)을
2026-06-08 origin 기준으로 점검하고, 팀이 공유할 수 있는 단일 현황 보고서를 작성한다.

- 독자: 팀원 (공식 현황 문서, 추후 위키/레포 게시 가능 수준)
- 읽기 전용 작업: 코드/설정 수정 없음. 산출물은 보고서 파일 1개.

## 2. 보고서 구조

파일: `docs/synapse-architecture-status-2026-06-08.md`

| 장 | 내용 |
|---|---|
| 1. 개요 | 시스템 한 줄 요약, 기준일(2026-06-08), 기준 소스(origin/main·origin/dev) |
| 2. 시스템 맵 | 서비스 목록 + mermaid 다이어그램 1개 (REST/Kafka 통신, 인프라 의존). 보조 레포(prototype, flow-simulator 등)는 한 줄 언급 |
| 3. 애플리케이션 서비스 현황 | 레포별 역할·기술스택/버전·노출 API·발행/구독 이벤트·특이사항 — platform, knowledge, learning, engagement, gateway, shared, frontend, onboarding |
| 4. 인프라/gitops 현황 | 배포 토폴로지, Kafka(MSK)/Redis/ES/DB 구성, dev/prod 환경 구조 — synapse-gitops(+s6) 기준 |
| 5. CI/CD 현황 | 레포별 워크플로우 표, deploy/mirror 표준화 진행 상태, Flyway 가드 롤아웃 상태 |
| 6. 간극 및 리스크 | 알려진 간극 재검증 표: 항목 / 상태(해소·진행·미해결) / 코드 근거 / 추적 이슈 |
| 7. 부록 | 검증 방법, 미확인 영역 전체 목록 |

작성 원칙: 표 위주로 간결하게, 모든 주장에 `레포:파일경로` 근거 인용.

## 3. 조사 프로세스

### 0단계 — 신선도 확보
모든 레포에서 `git fetch origin`. 이후 판단은 전부 origin/main·origin/dev 기준
(로컬 클론 stale로 2번 오판한 교훈 반영). fetch 실패 레포는 부록에 "미확인" 명시.

### 1단계 — 베이스라인 로드
기존 검증 산출물을 입력으로 사용:
- `docs/kafka-service-audit-2026-06-02.md` — Kafka 도입/CI 간극
- 메모리 간극 목록: Kafka TLS 앱 배선 갭(2026-06-04), S3 AttachmentService 미구현(W4 이후),
  engagement 소비측 미구현, Flyway 표준 롤아웃(2026-06-05), ES 정합성(2026-06-05 해소),
  main 직행 PR 정리 — engagement#31/learning#59 충돌 위임, main↔dev 발산 주의(2026-06-08)
- 기존 spec/plan: Deploy/Mirror 표준화, CI dev 환경 통일, application.yml 표준화 등

### 2단계 — 도메인별 병렬 탐색 (Explore 에이전트 4개)

| 에이전트 | 담당 | 확인 내용 |
|---|---|---|
| 서비스 | platform·knowledge·learning·engagement·gateway + shared + frontend + onboarding | 기술스택, API/이벤트, 베이스라인(6/2) 이후 변경분 |
| 인프라 | gitops(+s6) | 배포 토폴로지, 미들웨어 구성, env 구조 |
| CI/CD | 전 레포 `.github/workflows` | 워크플로우 현황, 표준화 적용 여부 |
| 간극 재검증 | 간극 항목별 해당 코드 | 각 간극의 현재 상태를 코드 근거로 판정 |

### 3단계 — 종합·작성
에이전트 결과를 메인 컨텍스트에서 교차 대조(상충 시 코드 직접 재확인) 후 보고서 작성.

### 검증 규칙
- §6 간극 표에 들어가는 항목은 베이스라인 출처와 무관하게 2단계에서 코드 근거 재확인 필수.
- 재확인하지 못한 베이스라인 주장은 "최종 확인일" 표기로 구분.
- 에이전트가 판단 불가한 항목은 추측 금지 — "미확인"으로 부록에 기재.

## 4. 완료 기준

- §3~§5 모든 표 항목에 코드/설정 근거(`레포:경로`)가 달려 있다.
- §6 간극 표 전 항목이 2026-06-08 origin 기준으로 재판정되어 있다.
- "미확인" 항목이 숨겨지지 않고 부록에 모두 나열되어 있다.
- mermaid 다이어그램이 §3 서비스 목록·이벤트와 모순되지 않는다.

## 5. 범위 제외 (YAGNI)

- 코드 품질 리뷰·버그 탐색 (현황 파악만; 평가는 간극 표에 한정)
- 보조 레포(prototype, flow-simulator, moking-data-guide 등) 상세 분석 — 시스템 맵 한 줄 언급만
- 위키 전체 정합성 전수 대조 — 이미 알려진 간극만 재검증
- 보고서 위키 게시 — 파일 생성까지만, 게시 여부는 별도 결정
