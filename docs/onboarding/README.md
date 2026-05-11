# Synapse 합류 가이드 — 인덱스

> **대상**: Synapse 프로젝트에 새로 합류하는 팀원
> **작성일**: 2026-05-12 (부트스트랩 완료 시점 기준)
> **소요**: Day 0 준비 ~1시간 + Day 1 트랙별 작업 ~3시간

---

## 첫날 흐름

```
[Day 0 — 합류 전날]                  [Day 1 — 첫 출근일]
─────────────────────                ─────────────────────
 00-common-day1.md                    트랙별 가이드 (택 1)
   ├ GitHub 가입 + 2FA                  ├ 자기 레포 클론
   ├ team-project-final org 합류         ├ 자기 영역 위키 정독
   ├ gh CLI 설치 + 인증                  ├ SECRETS.md 확인 + 발급
   ├ Java 21 / Python 3.11 /            ├ 첫 비즈니스 PR (Hello World
   │  Flutter / Docker 설치               기준 위에 실제 기능)
   ├ syn(documents) 클론 + 18개         └ W1~W5 자기 트랙 일정 확인
   │  위키 정독 순서
   ├ 09a Git 워크플로우 정독
   └ DESIGN.md 정독
```

---

## 트랙별 가이드 (자기 트랙 1개 선택해서 읽기)

| 합류자 | 트랙 mention | 담당 레포 | 가이드 |
|---|---|---|---|
| 팀장 | `@team-lead` | (인프라 + cross-review) | 본 가이드 작성자, 별도 onboarding 없음 |
| 트랙 A (1명) | `@platform-owner` | `synapse-platform-svc` | [01-platform-track.md](./01-platform-track.md) |
| 트랙 B (1명) | `@engagement-owner` | `synapse-engagement-svc` | [02-engagement-track.md](./02-engagement-track.md) |
| 트랙 C (2명) | `@knowledge-owner-1`, `@knowledge-owner-2` | `synapse-knowledge-svc` | [03-knowledge-track.md](./03-knowledge-track.md) |
| 트랙 D (2명) | `@learning-card-owner` (Java), `@learning-ai-owner` (Python) | `synapse-learning-svc` | [04-learning-track.md](./04-learning-track.md) |
| 협업 (전 트랙) | — | `synapse-frontend` | [05-frontend.md](./05-frontend.md) |

---

## 공통 문서 (모든 합류자 필독)

- **[00-common-day1.md](./00-common-day1.md)** — Day 0 사전 준비 + Day 1 공통 작업 (계정/도구/문서 정독)

---

## 관련 외부 문서

| 문서 | 위치 | 역할 |
|---|---|---|
| 09 Git 규칙 정의서 v2.0 | [위키](https://github.com/team-project-final/documents/wiki/09_Git_규칙_정의서) | 폴리레포 운영 규칙 — Part A/B/C |
| 09a Git 워크플로우 가이드 | [위키](https://github.com/team-project-final/documents/wiki/09a_Git_워크플로우_가이드) | 합류자용 시나리오 워크스루 |
| DESIGN.md | `syn/DESIGN.md` | UI/UX 디자인 시스템 |
| 18 기술 스택 정의서 | [위키](https://github.com/team-project-final/documents/wiki/18_기술_스택_정의서) | 트랙별 스택 + 라이브러리 |
| 17 스케줄 v3.0 | [위키](https://github.com/team-project-final/documents/wiki/17_스케줄) | W1~W5 트랙별 일정 |
| 부트스트랩 스펙 | [`syn/docs/superpowers/specs/2026-05-12-polyrepo-bootstrap-design.md`](../superpowers/specs/2026-05-12-polyrepo-bootstrap-design.md) | 8개 레포가 어떻게 만들어졌는지 |

---

## 막혔을 때

| 상황 | 채널 |
|---|---|
| 일반 개발 질문 | `#synapse-dev` (영업시간 2시간 내) |
| 아키텍처 결정 필요 | `#architecture` (1~3일 ADR 토론) |
| 빌드/배포 문제 | `#devops` (@team-lead mention) |
| 보안 관련 | `#security` (DM 권장) |
| 🚨 운영 장애 | `#incident` + on-call 호출 (즉시) |
| 본 가이드가 헷갈림 | `@team-lead` DM (1일 내) |

> 부끄러운 질문은 없습니다. 잘못된 가정으로 시작하는 게 훨씬 더 큰 비용입니다.

---

## 가이드 자체에 대한 피드백

본 가이드가 헷갈리거나 빠진 케이스가 있으면 PR로 기여해 주세요:
```
feature/INFRA-XXX-onboarding-improve
```
"내가 처음 합류했을 때 이게 있었으면 좋았겠다" 싶은 내용을 추가하는 게 가장 가치 있는 개선입니다.
