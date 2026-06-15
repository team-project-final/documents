# CI를 dev 테스트 환경과 통일 — 설계 문서

- 작성일: 2026-05-27
- 대상: `synapse-platform-svc`, `synapse-knowledge-svc`, `synapse-engagement-svc`, `synapse-learning-svc`
- 선행: `*-svc` application.yml 표준화 (각 레포 `chore/standardize-application-yml` 브랜치 / dev 대상 PR 진행 중)

## 1. 배경 & 문제

- 모든 CI 워크플로(`ci-java.yml`, learning `ci.yml`)가 `on: push/pull_request branches: [main]` 으로만 트리거된다.
- 표준화 PR은 **`dev` 브랜치 대상**이라 CI가 전혀 실행되지 않는다("no checks reported"). → "PR 통과 확인" 불가.
- 표준화 후 테스트는 `test` 프로파일(H2) + Testcontainers로 동작한다. CI는 `gradlew (clean) build`로 이 테스트를 실행하지만, **실제 dev 인프라(PostgreSQL/Redis/OpenSearch/Kafka)와의 연동은 검증하지 않는다.**

## 2. 목표

1. CI가 `dev` 대상 PR/푸시에서도 실행되게 하여 표준화 PR을 자가검증한다.
2. CI에 **실제 서비스(docker-compose)를 띄우고 `dev` 프로파일로 앱을 부팅·헬스체크하는 `dev-smoke` job**을 추가해, flyway 마이그레이션·Redis·OpenSearch 등 dev 실연동을 검증한다(= CI 환경을 dev 테스트 환경과 통일).
3. 기존 빠른 테스트(`build`: H2/Testcontainers)는 그대로 유지한다.

## 3. CI 트리거 변경

대상: 각 svc의 `.github/workflows/ci-java.yml`(platform/knowledge/engagement), `synapse-learning-svc/.github/workflows/ci.yml`.

```yaml
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]
```

- `mirror.yml` / `deploy.yml` / `parse-workflow.yml` 은 **변경하지 않는다**(머지 후 미러/배포/대시보드 — 테스트 CI가 아님, main 전용 유지).
- GitHub `pull_request` 이벤트는 PR의 병합 ref에 있는 워크플로 정의로 트리거를 평가하므로, 이 변경을 chore 브랜치에 포함하면 **기존 dev 대상 PR에서 즉시 CI가 실행**된다.

## 4. `dev-smoke` job

각 레포에 **인프라 전용 `docker-compose.ci.yml`** 을 커밋한다(앱 컨테이너 제외 — 앱은 Gradle로 실행). CI 워크플로는 기존 `build` job에 더해 `dev-smoke` job을 추가한다(두 job은 분리: `build`는 Testcontainers 랜덤포트, `dev-smoke`는 compose 고정포트 사용 → 간섭 방지).

### 4.1 레포별 서비스 및 검증

| 레포 | dev-smoke 서비스 | DB 이름/계정 | 헬스로 검증되는 실연동 |
|---|---|---|---|
| platform-svc | postgres + redis | `synapse` / `synapse` / `synapse_local_pw`, redis pw `redis_local_pw` | flyway 마이그레이션, Redis health |
| knowledge-svc | postgres + opensearch | `synapse` / `synapse` / `synapse_local_pw`, opensearch 9200 | flyway, Elasticsearch health |
| engagement-svc | postgres | `synapse` / `synapse` / `synapse_local_pw` | flyway, DB health |
| learning-svc | postgres + zookeeper + kafka + schema-registry | `synapse_learning` / `postgres` / `postgres` | flyway, 부팅(Kafka 빈 초기화) |

- 서비스 포트는 표준 포트(5432/6379/9200/9092/8081)로 노출하여 각 레포 `dev` 프로파일 기본값(localhost:해당포트)과 일치시킨다.
- learning의 Kafka 스택은 dev 인프라 충실 재현 목적으로 포함한다. (Kafka producer 빈은 지연 연결이라 헬스체크로 깊게 검증되지는 않으며, Kafka 심화 검증은 기존 `@EmbeddedKafka` 테스트가 담당한다.)

### 4.2 job 흐름 (레포 공통 패턴)

```
1) actions/checkout@v4
2) actions/setup-java@v4 (temurin 21)
3) docker compose -f docker-compose.ci.yml up -d --wait   # 각 서비스 healthcheck로 준비 대기
4) dev 프로파일로 앱 백그라운드 실행
   - 3 svc: ./gradlew bootRun --args='--spring.profiles.active=dev'
   - learning: working-directory: learning-card 에서 동일
5) /actuator/health 가 UP(200) 될 때까지 폴링(예: 60초 타임아웃, 2초 간격)
6) UP 확인 시 성공, 타임아웃/비-UP 시 실패(앱 로그 출력)
7) always: 앱 종료 + docker compose down
```

- dev 프로파일은 localhost 서비스 + JWT/OAuth/Stripe 테스트 기본값을 갖고 있어 **시크릿 없이 부팅**된다.
- `docker-compose.ci.yml` 각 서비스에 healthcheck를 정의해 `--wait`로 준비 완료를 보장한다(postgres: pg_isready, opensearch: cluster health, kafka/schema-registry: 포트/헬스 엔드포인트).

## 5. 작업 방식 (git)

- 선행 표준화와 동일 흐름: 각 레포 **기존 `chore/standardize-application-yml` 브랜치**에 (1) 워크플로 트리거 변경, (2) `docker-compose.ci.yml`, (3) `dev-smoke` job 추가를 커밋 → push(기존 PR 갱신) → CI 자동 실행 → 녹색 확인. **머지는 대기**(사용자가 직접).
- push 후 `gh pr checks`로 각 PR의 CI 결과를 확인하고, 실패 시 원인 수정 후 재push.

## 6. 리스크 / 주의

- `dev-smoke`가 실제 dev 부팅을 강제하므로 dev 설정의 숨은 문제(flyway 마이그레이션 정합성, 잘못된 기본값 등)가 드러날 수 있다 — 의도된 검증이며 발견 시 수정한다.
- 기존 `build` job이 dev에서 처음 실행되며 사전 존재하던(표준화와 무관한) 실패가 드러날 수 있다.
- platform의 untracked 중복 `V28` 마이그레이션은 PR/커밋에 미포함이라 CI에는 영향 없다.
- CI 실행 시간이 증가한다(서비스 기동 + 부팅). 허용 범위로 본다.

## 7. 확정된 결정 사항

- 통일 방식: **실제 서비스 프로비저닝** + dev 프로파일 부팅 스모크.
- 테스트 실행: **기존 테스트(H2/Testcontainers) 유지 + dev 스모크 추가**(전체 테스트를 dev 프로파일로 전환하지 않음).
- 프로비저닝: **레포별 CI 전용 `docker-compose.ci.yml`**(필요한 서비스만).
- 트리거: `[main, dev]`.
- 반영 위치: **기존 `chore/standardize-application-yml` 브랜치**(표준화 PR이 CI로 자가검증).

## 8. 범위 외 (Out of scope)

- `deploy.yml` / `mirror.yml` / `parse-workflow.yml` 변경.
- synapse-shared 자체 CI, 실제 배포/머지.
- 전체 테스트 스위트를 dev 프로파일/실서비스로 재작성.
- Kafka 발행 경로의 CI 통합 심화 검증(기존 `@EmbeddedKafka` 테스트 유지).
