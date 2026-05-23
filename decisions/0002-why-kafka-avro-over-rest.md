# ADR-0002 · Why Kafka + Avro Schema Registry over REST?

- **Status**: Accepted
- **Date**: 2026-05-11
- **Last updated**: 2026-05-23
- **Decision driver**: 책임개발자 (김민구)

## Context

ADR-0001로 4개 마이크로서비스를 분리하기로 했다. 그러면 서비스 간 통신 방법이 결정되어야 한다.

대표 시나리오: **결제 → 학습 활성화**
1. 사용자가 학습 카드 팩을 구매
2. Platform Service가 결제 처리
3. Learning Service가 사용자에게 해당 카드 팩을 활성화하고 SRS 큐를 초기화

대안 검토:
1. **동기 REST**: Platform이 결제 후 Learning의 `/activate` 엔드포인트를 직접 호출. **문제**: Learning이 다운이면 Platform의 결제 트랜잭션이 실패하거나 부분 성공 (결제는 됐는데 활성화 안 됨).
2. **메시지 큐 (RabbitMQ)**: 비동기 발행. **문제**: 새 컨슈머 추가 시 큐 토폴로지 재구성. 이벤트 재처리·과거 이벤트 재생 어려움.
3. **이벤트 스트림 (Kafka)**: 비동기 발행 + 영구 저장 + 컨슈머 추가 자유.

추가 고려: 스키마 진화. 4개 서비스가 같은 이벤트를 다르게 해석하면 안 됨. JSON은 자유로워서 위험. **Avro + Schema Registry**가 호환성을 강제.

발행 일관성: Platform이 결제 트랜잭션 안에서 카프카에 발행하면 dual-write 문제. **Transactional Outbox 패턴**으로 해결.

## Decision

**Kafka (KRaft 모드) + Avro Schema Registry + Transactional Outbox**를 채택한다.

- 모든 도메인 이벤트는 발행 서비스의 Outbox 테이블에 같은 DB 트랜잭션으로 적재
- Outbox Relay(스케줄러 또는 Debezium CDC)가 Kafka 토픽으로 publish
- 컨슈머는 멱등 처리(이벤트 ID 기반 dedup)
- Avro 스키마는 BACKWARD 호환성 강제 (필드 추가 OK, 필수 필드 삭제·타입 변경 NO)

## Consequences

**받아들이는 이점**
- 서비스 가용성 결합이 끊김. Learning 다운 중에도 Platform은 결제 가능, 복구되면 이벤트 catch-up.
- 새 컨슈머(예: 향후 Analytics Service) 추가가 무료.
- 이벤트 재처리·과거 시점 재생이 자연스러움.
- 스키마 거버넌스가 코드 리뷰가 아닌 Schema Registry 강제로 옮겨감.

**받아들이는 비용**
- 디버깅 비용 ↑. "결제는 됐는데 활성화 안 됨" 같은 상황 추적에 트레이싱(Tempo)이 필수.
- 최종 일관성 모델로 사고 전환 필요. 동기 REST에 익숙한 팀원의 학습 곡선.
- Schema Registry 운영 비용 (1개 인스턴스 추가).
- 트랜잭션 격리 측면에서 컨슈머 멱등 처리가 필수 (책임은 컨슈머에).

## Links

- 관련 ADR: ADR-0001 (MSA 채택의 자연스러운 귀결)
- 관련 레포: synapse-shared (Avro 스키마 정의 위치)
