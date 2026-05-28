# 18 기술 스택 정의서 — 카테고리 검증 진행판

작성일: 2026-05-28
마스터 스펙: 2026-05-28-tech-stack-doc-review-design.md
대상 위키: documents.wiki/18_기술_스택_정의서.md v2.2 → v2.3 (예정)

## 세션 진척

| 세션 | 카테고리 | 상태 | 보고서 PR | 위키 커밋 | E1/E2/D/R/OK | P0/P1/P2 | 시작일 | 종료일 |
|------|---------|------|---------|---------|-------------|---------|--------|--------|
| S1 | 언어 | completed | [#6](https://github.com/team-project-final/documents/pull/6) | documents.wiki@6f042fc | 9/10/4/3/4 | 6/11/13 | 2026-05-28 | 2026-05-28 |
| S2 | 프레임워크 | pending | - | - | - | - | - | - |
| S3 | 데이터 | pending | - | - | - | - | - | - |
| S4 | 이벤트 | pending | - | - | - | - | - | - |
| S5 | 운영 | pending | - | - | - | - | - | - |
| S6 | 외부/AI | pending | - | - | - | - | - | - |

## 누적 통계
- 검증한 기술 수: 3 / 약 45 (Java 21 / Python 3.12 / Dart 3.x)
- E1: 9 · E2: 10 · D: 4 · R: 3 · OK: 4
- P0: 6 · P1: 11 · P2: 13
- 문서 자체 결함(절 번호 충돌 등) 발견 누계: 0 (S2 영역 §2.4·§2.5 충돌은 마스터 스펙 §2에서 사전 발견됨, S2 첫 발견사항으로 예약)

## 세션 간 발생한 교차 발견사항
- **S1 → S2**: §4.1.2 Spring Boot 4 절에 §4.1.1 Java 21의 "Virtual Threads 자동 활성화" 오기와 동일한 표현 가능성 — S2 프레임워크 세션에서 §4.1.2 검증 시 함께 정정
- **S1 → S2**: §2.4 google_fonts·§2.5 CanvasKit 절 번호 충돌 (마스터 스펙에서 사전 예약)
- **S1 → S2**: §2.1 Flutter pubspec 환경 제약 `>=3.0.0 <4.0.0` ≠ 실 SDK `>=3.11.0 <4.0.0` — S2 Frontend 검증 시 정정
- **S1 → S2**: §2.3 Riverpod 절·기타 §2.x 절에서 `syn/` 경로 표기 잔존 가능성 — S2 Frontend grep 일괄 점검

## 후속 과제 큐 (Follow-ups)
- **(별도 작업)** 18 §1.4 기술 스택 전체 목록 표·§10.1 요약표에 S1 변경 반영 (특히 LangChain 제거·Anthropic 추가). 6 세션 종료 후 v2.3 통합 정리에서 처리.
- **(별도 결정)** 4개 굵은 서비스 application.yml에 `spring.threads.virtual.enabled: true` 추가 여부 — 본 세션은 위키 표현 톤다운만 적용, 코드 변경은 별도 PR로 분리 권장
- **(운영 표준 예외)** S1 위키에 추가 1 커밋(§11 PR 번호 기입). 마스터 스펙 §5.3 "세션당 단일 커밋"의 의도된 예외. 향후 세션도 동일 패턴.

## 메모리 갱신 후보
- **신규 메모리 후보**: `python-ai-stack-direct-sdk` — Python 절의 LangChain → 직접 SDK(OpenAI/Anthropic) 채택 사실. S6 AI/ML 세션에서도 영향이 크므로 S6 시작 전 메모리화 검토
