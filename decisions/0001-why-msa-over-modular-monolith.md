# ADR-0001 · Why MSA over Modular Monolith?

- **Status**: Accepted
- **Date**: 2026-05-10
- **Last updated**: 2026-05-23
- **Decision driver**: 책임개발자 (김민구)

## Context

Synapse는 학습자의 **노트·카드·커뮤니티 활동**을 통합 관리하는 학습 플랫폼이다. 도메인은 4개로 자연스럽게 갈라진다:

- Platform (인증·감사·빌링·알림 — 횡단 관심사)
- Learning (학습 카드·SRS 알고리즘·AI 학습 보조)
- Knowledge (노트·지식 그래프·문서 청킹)
- Engagement (커뮤니티·게이미피케이션)

각 도메인은 데이터 모델·라이프사이클·외부 의존성이 크게 다르다. 예: Learning은 AI 추론과 SRS 스케줄 큐가 핵심, Knowledge는 청킹·임베딩·그래프 DB 친화, Engagement는 알림·랭킹 등 실시간성. 한 모놀리식 안에 두면 의존성 그래프가 폭주.

대안 검토:
1. **Modular Monolith**: 패키지 경계로 분리. 운영 단순, 그러나 도메인 경계가 코드 리뷰에 의존해 시간이 가면 흐려짐.
2. **MSA (마이크로서비스 4개)**: 도메인 경계가 네트워크·배포 경계로 강제. 운영 복잡도 ↑.
3. **DDD Bounded Context as Library**: 모듈을 라이브러리로 분리. 빌드 시간 ↑, 독립 배포는 여전히 불가.

졸업 프로젝트의 학습 가치 측면에서, MSA를 "올바르게 실패할 자유"가 있는 환경은 흔치 않다.

## Decision

**4개 마이크로서비스로 시작**한다. 단, 운영비를 모놀리식 수준으로 유지하기 위해 다음을 공유한다:
- Kubernetes 클러스터 1개
- PostgreSQL 16 클러스터 1개 (3-Schema Isolation, ADR-0003 참조)
- Kafka 클러스터 1개

각 서비스는 자기 코드베이스·자기 이미지·자기 배포 파이프라인을 가진다.

## Consequences

**받아들이는 이점**
- 도메인 경계가 코드 리뷰 의존이 아니라 네트워크·배포 경계로 강제됨.
- 졸업 후 각자 PR 풀리퀘 운영·취업 포트폴리오 분리 가능.
- Polyglot 도입(Learning ↔ AI Service)이 자연스러움.

**받아들이는 비용**
- 통합 테스트가 모놀리식보다 복잡 (docker-compose 기반 로컬 e2e 필요).
- 6인 팀이 4개 서비스를 분담하면 1인 다역. Learning/AI 두 개를 한 명이 보는 식.
- 분산 트랜잭션 처리에 Saga 패턴이 강제됨 (ADR-0002 참조).

## Links

- 관련 ADR: ADR-0002 (서비스 간 통신), ADR-0003 (DB 격리 전략)
- 관련 레포: synapse-platform-svc · synapse-learning-svc · synapse-knowledge-svc · synapse-engagement-svc
