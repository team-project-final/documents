# Synapse 설계 결정 노트 (ADR)

Synapse 프로젝트의 주요 설계 결정 기록입니다. 각 결정은 **맥락 / 결정 / 결과** 3부 구조로 작성됩니다.

포맷: [Michael Nygard ADR](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

## 용어집

조직 프로필 README의 다이어그램과 ADR 본문에서 일관되게 쓰이는 컴포넌트 이름:

| 표기 | 의미 |
|---|---|
| Platform Service | auth · audit · billing · notification 묶음 |
| Learning Service | card · SRS + AI 게이트웨이 |
| Knowledge Service | note · graph · chunking |
| Engagement Service | community · gamification |
| AI Service | Python FastAPI + Qwen 2.5 + ChromaDB |
| Event Bus | Kafka KRaft + Avro Schema Registry |
| Outbox | 각 서비스의 도메인 이벤트 발행 테이블 |

## 인덱스

| # | 제목 | 상태 | 최종 갱신 |
|---|---|---|---|
| [0001](./0001-why-msa-over-modular-monolith.md) | Why MSA over Modular Monolith? | Accepted | 2026-05-23 |
| [0002](./0002-why-kafka-avro-over-rest.md) | Why Kafka + Avro Schema Registry over REST? | Accepted | 2026-05-23 |
| [0003](./0003-why-3-schema-isolation.md) | Why 3-Schema Isolation over Database-per-Service? | Accepted | 2026-05-23 |

[↑ 조직 프로필로](https://github.com/team-project-final)
