# ADR-0003 · Why 3-Schema Isolation over Database-per-Service?

- **Status**: Accepted
- **Date**: 2026-05-12
- **Last updated**: 2026-05-23
- **Decision driver**: 책임개발자 (김민구)

## Context

ADR-0001로 4개 마이크로서비스를 두기로 했다. 표준 MSA 패턴은 **서비스당 DB 1개** (Database-per-Service)다. 그러면 PostgreSQL 클러스터를 4개 운영해야 한다.

졸업 프로젝트 6인 팀 현실:
- 운영비: PostgreSQL 클러스터 4개의 cloud 비용·관리 부담이 비현실적
- 백업·모니터링·튜닝을 4개 독립 시스템에 적용해야 함
- 학습 측면에서 "올바른 MSA"가 운영 카오스에 가려질 위험

반대로 **단일 스키마 공유**는 격리가 없다. 한 서비스의 마이그레이션이 다른 서비스를 깨거나, 권한 없는 테이블에 직접 SELECT가 일어남.

대안 검토:
1. **Database-per-Service** (정석): 격리 완벽, 운영비 4배
2. **Schema-per-Service in Shared Cluster**: 단일 PostgreSQL 클러스터, 서비스별 PostgreSQL `SCHEMA` 분리 + DB 계정 권한 분리
3. **단일 스키마 공유**: 운영 단순, 격리 없음

용어 명확화: 여기서 "**3-Schema Isolation**"이라는 명칭을 쓰지만 실제 운영 서비스는 4개다. Platform/Learning/Knowledge/Engagement 각각의 schema + Public(읽기 전용 공통 참조) 1개 = 5개 schema. "3-Schema"는 **물리/논리/외부** 격리의 3계층을 가리키는 관용어로, 본 프로젝트에서는 운영 측면에서 클러스터 1·물리 db 1·스키마 N개의 구조를 말한다.

## Decision

**단일 PostgreSQL 16 클러스터 + 서비스별 PostgreSQL SCHEMA 격리 + 서비스 계정의 스키마별 권한 분리**를 채택한다.

- DB 계정 `platform_svc`는 `platform` 스키마에만 쓰기 권한
- 크로스 스키마 SELECT 금지 (필요하면 이벤트로 데이터 복제, ADR-0002)
- 모든 서비스의 마이그레이션은 자기 스키마 안에서만 실행

## Consequences

**받아들이는 이점**
- 클러스터 1개로 운영비 4분의 1. 백업·모니터링·튜닝 단일 지점.
- 서비스 간 우발적 결합 차단(권한으로 강제).
- 졸업 프로젝트 일정 안에 운영 가능.

**받아들이는 비용**
- 한 클러스터의 장애 = 4개 서비스 전체 영향. 가용성 측면에서 진짜 격리는 아님.
- 미래에 서비스가 정말 독립 DB 인스턴스가 필요해지면(예: pgvector 확장 분리) 분리 비용 발생.
- 보안 요구사항이 강해지면(예: PHI · 결제 카드) 재검토 필요.

## Links

- 관련 ADR: ADR-0001 (MSA 채택), ADR-0002 (크로스 서비스 데이터 접근은 이벤트로)
- 관련 레포: synapse-gitops (PostgreSQL Helm chart 위치)
