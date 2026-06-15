# CI를 dev 테스트 환경과 통일 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 4개 `*-svc` 레포의 CI가 `dev` 브랜치/PR에서 실행되게 하고, 실제 서비스(docker-compose)를 띄워 `dev` 프로파일로 앱을 부팅·헬스체크하는 `dev-smoke` job을 추가한다.

**Architecture:** 기존 `build` job(H2/Testcontainers 테스트)은 유지하고, CI 트리거에 `dev`를 추가한다. 각 레포에 인프라 전용 `docker-compose.ci.yml`을 커밋하고, `dev-smoke` job이 그 서비스를 띄운 뒤 `gradlew bootRun --args='--spring.profiles.active=dev'`로 앱을 기동해 `/actuator/health`가 UP인지 검증한다. 변경은 각 레포의 기존 `chore/standardize-application-yml` 브랜치에 추가해 표준화 PR이 CI로 자가검증되게 한다.

**Tech Stack:** GitHub Actions, Docker Compose v2, Gradle (Spring Boot 4 bootRun), PostgreSQL 16 / Redis 7 / OpenSearch 2.11 / Confluent Kafka 7.7.

**작업 규칙:** 각 레포 독립 git repo. 변경은 **기존 `chore/standardize-application-yml` 브랜치**에 커밋·push(기존 dev 대상 PR 갱신). **머지는 사용자가 직접**(push까지만). 4개 Phase는 독립이며 순서 무관.

---

## 공통 레퍼런스 (Shared Reference)

### R1. 포트맵 / dev DB (표준화 결과)
| 레포 | 서버 port | dev DB URL 기본값 | DB user/pw |
|---|---|---|---|
| platform-svc | 8081 | `jdbc:postgresql://localhost:5432/synapse` | synapse / synapse_local_pw |
| knowledge-svc | 8082 | `jdbc:postgresql://localhost:5432/synapse` | synapse / synapse_local_pw |
| engagement-svc | 8083 | `jdbc:postgresql://localhost:5432/synapse` | synapse / synapse_local_pw |
| learning-svc | 8084 | `jdbc:postgresql://localhost:5432/synapse_learning` | postgres / postgres |

### R2. dev-smoke health 검증 스크립트 (port만 치환해 각 워크플로에 인라인)
```bash
./gradlew bootRun --args='--spring.profiles.active=dev' > app.log 2>&1 &
APP_PID=$!
HEALTHY=0
for i in $(seq 1 60); do
  if curl -sf "http://localhost:__PORT__/actuator/health" | grep -q '"status":"UP"'; then
    HEALTHY=1; echo "actuator health UP"; break
  fi
  if ! kill -0 "$APP_PID" 2>/dev/null; then echo "app process exited early"; break; fi
  sleep 3
done
if [ "$HEALTHY" != "1" ]; then
  echo "===== app.log ====="; cat app.log
  kill "$APP_PID" 2>/dev/null || true
  exit 1
fi
kill "$APP_PID" 2>/dev/null || true
```

### R3. CI 트리거 (모든 대상 워크플로 공통 교체)
```yaml
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]
```

---

## Phase 0: 사전 점검

### Task 0.1: 브랜치/도커 확인

- [ ] **Step 1: 각 레포가 chore 브랜치에 있고 워킹트리 깨끗한지 확인**

Run (PowerShell, 루트 `C:\workspace\team-project-final`):
```powershell
"synapse-platform-svc","synapse-knowledge-svc","synapse-engagement-svc","synapse-learning-svc" | % {
  "$_ => branch=$(git -C $_ rev-parse --abbrev-ref HEAD); dirty=$(git -C $_ status --porcelain | Measure-Object -Line | % Lines)"
}
```
Expected: 각 `branch=chore/standardize-application-yml`. dirty는 platform만 1(untracked V28) 허용, 나머지 0. 다르면 멈추고 보고.

- [ ] **Step 2: Docker 가용 확인**

Run: `docker info`
Expected: 정상 출력(데몬 동작). 안 되면 dev-smoke 로컬 검증은 건너뛰고 push 후 CI에서만 확인.

---

## Phase 1: platform-svc (postgres + redis)

### Task 1.1: `docker-compose.ci.yml` 생성

**Files:**
- Create: `synapse-platform-svc/docker-compose.ci.yml`

- [ ] **Step 1: 파일 생성**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: synapse
      POSTGRES_USER: synapse
      POSTGRES_PASSWORD: synapse_local_pw
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U synapse -d synapse"]
      interval: 5s
      timeout: 5s
      retries: 15
  redis:
    image: redis:7-alpine
    command: ["redis-server", "--requirepass", "redis_local_pw"]
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD-SHELL", "redis-cli -a redis_local_pw ping | grep -q PONG"]
      interval: 5s
      timeout: 5s
      retries: 15
```

### Task 1.2: `ci-java.yml` 트리거 변경 + dev-smoke job 추가

**Files:**
- Modify: `synapse-platform-svc/.github/workflows/ci-java.yml`

- [ ] **Step 1: 트리거를 R3으로 교체**

기존:
```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```
→ R3 내용으로 교체(`[main, dev]`).

- [ ] **Step 2: `jobs:` 끝에 dev-smoke job 추가** (기존 `build` job 아래에 추가)
```yaml
  dev-smoke:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Java 21
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: gradle
      - name: Start dev services
        run: docker compose -f docker-compose.ci.yml up -d --wait
      - name: Boot app (dev) and verify health
        run: |
          ./gradlew bootRun --args='--spring.profiles.active=dev' > app.log 2>&1 &
          APP_PID=$!
          HEALTHY=0
          for i in $(seq 1 60); do
            if curl -sf "http://localhost:8081/actuator/health" | grep -q '"status":"UP"'; then
              HEALTHY=1; echo "actuator health UP"; break
            fi
            if ! kill -0 "$APP_PID" 2>/dev/null; then echo "app process exited early"; break; fi
            sleep 3
          done
          if [ "$HEALTHY" != "1" ]; then
            echo "===== app.log ====="; cat app.log
            kill "$APP_PID" 2>/dev/null || true
            exit 1
          fi
          kill "$APP_PID" 2>/dev/null || true
      - name: Stop services
        if: always()
        run: docker compose -f docker-compose.ci.yml down -v
```

### Task 1.3: 로컬 검증 (Docker 가용 시)

- [ ] **Step 1: 서비스 기동**

Run: `cd synapse-platform-svc; docker compose -f docker-compose.ci.yml up -d --wait`
Expected: postgres, redis가 healthy로 기동.

- [ ] **Step 2: dev 부팅 + 헬스 (PowerShell)**

Run:
```powershell
cd C:\workspace\team-project-final\synapse-platform-svc
$p = Start-Process -FilePath ".\gradlew.bat" -ArgumentList "bootRun","--args=--spring.profiles.active=dev" -PassThru -RedirectStandardOutput app.out.log -RedirectStandardError app.err.log
for ($i=0; $i -lt 60; $i++) { try { if ((Invoke-WebRequest -UseBasicParsing http://localhost:8081/actuator/health).Content -match '"status":"UP"') { "UP"; break } } catch {}; Start-Sleep 3 }
Stop-Process -Id $p.Id -Force 2>$null
```
Expected: `UP` 출력. 아니면 `app.err.log`/`app.out.log` 확인 후 원인 수정(flyway/redis 등).

- [ ] **Step 3: 서비스 정리 + 로그파일 제거**

Run: `docker compose -f docker-compose.ci.yml down -v; Remove-Item app.out.log,app.err.log -ErrorAction SilentlyContinue`

### Task 1.4: 커밋 & push (PR 갱신)

- [ ] **Step 1: 추적 변경만 스테이징(V28 untracked 제외) 후 커밋**

Run (bash):
```bash
cd /c/workspace/team-project-final/synapse-platform-svc
git add .github/workflows/ci-java.yml docker-compose.ci.yml
git commit -m "ci: run on dev + add dev-smoke (postgres/redis, dev profile boot health)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push
```
Expected: push 성공(기존 PR #34 갱신).

### Task 1.5: PR CI 확인

- [ ] **Step 1: 체크 상태 폴링**

Run: `gh -R team-project-final/synapse-platform-svc pr checks chore/standardize-application-yml --watch`
Expected: `build`, `dev-smoke` 모두 pass. 실패 시 로그 확인 후 수정·재push.

---

## Phase 2: knowledge-svc (postgres + opensearch)

### Task 2.1: `docker-compose.ci.yml` 생성

**Files:**
- Create: `synapse-knowledge-svc/docker-compose.ci.yml`

- [ ] **Step 1: 파일 생성**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: synapse
      POSTGRES_USER: synapse
      POSTGRES_PASSWORD: synapse_local_pw
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U synapse -d synapse"]
      interval: 5s
      timeout: 5s
      retries: 15
  opensearch:
    image: opensearchproject/opensearch:2.11.0
    environment:
      - discovery.type=single-node
      - plugins.security.disabled=true
      - OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:9200/_cluster/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 30
```

### Task 2.2: `ci-java.yml` 트리거 변경 + dev-smoke job 추가

**Files:**
- Modify: `synapse-knowledge-svc/.github/workflows/ci-java.yml`

- [ ] **Step 1: 트리거를 R3으로 교체** (Phase 1 Task 1.2 Step 1과 동일 내용)

- [ ] **Step 2: dev-smoke job 추가** (port 8082)
```yaml
  dev-smoke:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Java 21
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: gradle
      - name: Start dev services
        run: docker compose -f docker-compose.ci.yml up -d --wait
      - name: Boot app (dev) and verify health
        run: |
          ./gradlew bootRun --args='--spring.profiles.active=dev' > app.log 2>&1 &
          APP_PID=$!
          HEALTHY=0
          for i in $(seq 1 60); do
            if curl -sf "http://localhost:8082/actuator/health" | grep -q '"status":"UP"'; then
              HEALTHY=1; echo "actuator health UP"; break
            fi
            if ! kill -0 "$APP_PID" 2>/dev/null; then echo "app process exited early"; break; fi
            sleep 3
          done
          if [ "$HEALTHY" != "1" ]; then
            echo "===== app.log ====="; cat app.log
            kill "$APP_PID" 2>/dev/null || true
            exit 1
          fi
          kill "$APP_PID" 2>/dev/null || true
      - name: Stop services
        if: always()
        run: docker compose -f docker-compose.ci.yml down -v
```

### Task 2.3: 로컬 검증 (Docker 가용 시)

- [ ] **Step 1: 기동 + 부팅 + 헬스**

Run:
```powershell
cd C:\workspace\team-project-final\synapse-knowledge-svc
docker compose -f docker-compose.ci.yml up -d --wait
$p = Start-Process -FilePath ".\gradlew.bat" -ArgumentList "bootRun","--args=--spring.profiles.active=dev" -PassThru -RedirectStandardOutput app.out.log -RedirectStandardError app.err.log
for ($i=0; $i -lt 60; $i++) { try { if ((Invoke-WebRequest -UseBasicParsing http://localhost:8082/actuator/health).Content -match '"status":"UP"') { "UP"; break } } catch {}; Start-Sleep 3 }
Stop-Process -Id $p.Id -Force 2>$null
docker compose -f docker-compose.ci.yml down -v
Remove-Item app.out.log,app.err.log -ErrorAction SilentlyContinue
```
Expected: `UP`. 만약 OpenSearch health indicator가 DOWN을 유발하면 app.err.log로 확인 — OpenSearch 2.11은 dev에서 사용하는 이미지이므로 정상 UP 기대. 문제 시 원인(클러스터 상태/버전) 수정.

### Task 2.4: 커밋 & push

- [ ] **Step 1:**
```bash
cd /c/workspace/team-project-final/synapse-knowledge-svc
git add .github/workflows/ci-java.yml docker-compose.ci.yml
git commit -m "ci: run on dev + add dev-smoke (postgres/opensearch, dev profile boot health)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push
```

### Task 2.5: PR CI 확인

- [ ] **Step 1:** `gh -R team-project-final/synapse-knowledge-svc pr checks chore/standardize-application-yml --watch`
Expected: `build`, `dev-smoke` pass.

---

## Phase 3: engagement-svc (postgres)

### Task 3.1: `docker-compose.ci.yml` 생성

**Files:**
- Create: `synapse-engagement-svc/docker-compose.ci.yml`

- [ ] **Step 1: 파일 생성**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: synapse
      POSTGRES_USER: synapse
      POSTGRES_PASSWORD: synapse_local_pw
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U synapse -d synapse"]
      interval: 5s
      timeout: 5s
      retries: 15
```

### Task 3.2: `ci-java.yml` 트리거 변경 + dev-smoke job 추가

**Files:**
- Modify: `synapse-engagement-svc/.github/workflows/ci-java.yml`

- [ ] **Step 1: 트리거를 R3으로 교체**

- [ ] **Step 2: dev-smoke job 추가** (port 8083)
```yaml
  dev-smoke:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Java 21
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: gradle
      - name: Start dev services
        run: docker compose -f docker-compose.ci.yml up -d --wait
      - name: Boot app (dev) and verify health
        run: |
          ./gradlew bootRun --args='--spring.profiles.active=dev' > app.log 2>&1 &
          APP_PID=$!
          HEALTHY=0
          for i in $(seq 1 60); do
            if curl -sf "http://localhost:8083/actuator/health" | grep -q '"status":"UP"'; then
              HEALTHY=1; echo "actuator health UP"; break
            fi
            if ! kill -0 "$APP_PID" 2>/dev/null; then echo "app process exited early"; break; fi
            sleep 3
          done
          if [ "$HEALTHY" != "1" ]; then
            echo "===== app.log ====="; cat app.log
            kill "$APP_PID" 2>/dev/null || true
            exit 1
          fi
          kill "$APP_PID" 2>/dev/null || true
      - name: Stop services
        if: always()
        run: docker compose -f docker-compose.ci.yml down -v
```

### Task 3.3: 로컬 검증 (Docker 가용 시)

- [ ] **Step 1:**
```powershell
cd C:\workspace\team-project-final\synapse-engagement-svc
docker compose -f docker-compose.ci.yml up -d --wait
$p = Start-Process -FilePath ".\gradlew.bat" -ArgumentList "bootRun","--args=--spring.profiles.active=dev" -PassThru -RedirectStandardOutput app.out.log -RedirectStandardError app.err.log
for ($i=0; $i -lt 60; $i++) { try { if ((Invoke-WebRequest -UseBasicParsing http://localhost:8083/actuator/health).Content -match '"status":"UP"') { "UP"; break } } catch {}; Start-Sleep 3 }
Stop-Process -Id $p.Id -Force 2>$null
docker compose -f docker-compose.ci.yml down -v
Remove-Item app.out.log,app.err.log -ErrorAction SilentlyContinue
```
Expected: `UP`.

### Task 3.4: 커밋 & push

- [ ] **Step 1:**
```bash
cd /c/workspace/team-project-final/synapse-engagement-svc
git add .github/workflows/ci-java.yml docker-compose.ci.yml
git commit -m "ci: run on dev + add dev-smoke (postgres, dev profile boot health)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push
```

### Task 3.5: PR CI 확인

- [ ] **Step 1:** `gh -R team-project-final/synapse-engagement-svc pr checks chore/standardize-application-yml --watch`
Expected: `build`, `dev-smoke` pass.

---

## Phase 4: learning-svc (postgres + kafka 스택; 멀티모듈)

### Task 4.1: `docker-compose.ci.yml` 생성 (learning-card 디렉터리)

**Files:**
- Create: `synapse-learning-svc/learning-card/docker-compose.ci.yml`

- [ ] **Step 1: 파일 생성**
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: synapse_learning
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d synapse_learning"]
      interval: 5s
      timeout: 5s
      retries: 15
  zookeeper:
    image: confluentinc/cp-zookeeper:7.7.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
  kafka:
    image: confluentinc/cp-kafka:7.7.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    healthcheck:
      test: ["CMD-SHELL", "kafka-broker-api-versions --bootstrap-server localhost:9092 || exit 1"]
      interval: 10s
      timeout: 10s
      retries: 30
  schema-registry:
    image: confluentinc/cp-schema-registry:7.7.0
    depends_on:
      - kafka
    ports:
      - "8081:8081"
    environment:
      SCHEMA_REGISTRY_HOST_NAME: schema-registry
      SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: PLAINTEXT://kafka:29092
      SCHEMA_REGISTRY_LISTENERS: http://0.0.0.0:8081
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:8081/subjects || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 30
```

### Task 4.2: `ci.yml` 트리거 변경 + dev-smoke job 추가

**Files:**
- Modify: `synapse-learning-svc/.github/workflows/ci.yml`

- [ ] **Step 1: 트리거를 R3으로 교체** (`[main]` → `[main, dev]`, push/pull_request 모두)

- [ ] **Step 2: `jobs:` 에 dev-smoke job 추가** (detect-changes 의존, working-directory learning-card, port 8084)
```yaml
  dev-smoke:
    needs: detect-changes
    if: needs.detect-changes.outputs.java == 'true'
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: learning-card
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
      - uses: gradle/actions/setup-gradle@v4
      - name: Grant execute permission
        run: chmod +x gradlew
      - name: Start dev services
        run: docker compose -f docker-compose.ci.yml up -d --wait
      - name: Boot app (dev) and verify health
        run: |
          ./gradlew bootRun --args='--spring.profiles.active=dev' > app.log 2>&1 &
          APP_PID=$!
          HEALTHY=0
          for i in $(seq 1 60); do
            if curl -sf "http://localhost:8084/actuator/health" | grep -q '"status":"UP"'; then
              HEALTHY=1; echo "actuator health UP"; break
            fi
            if ! kill -0 "$APP_PID" 2>/dev/null; then echo "app process exited early"; break; fi
            sleep 3
          done
          if [ "$HEALTHY" != "1" ]; then
            echo "===== app.log ====="; cat app.log
            kill "$APP_PID" 2>/dev/null || true
            exit 1
          fi
          kill "$APP_PID" 2>/dev/null || true
      - name: Stop services
        if: always()
        run: docker compose -f docker-compose.ci.yml down -v
```

### Task 4.3: 로컬 검증 (Docker 가용 시)

- [ ] **Step 1:**
```powershell
cd C:\workspace\team-project-final\synapse-learning-svc\learning-card
docker compose -f docker-compose.ci.yml up -d --wait
$p = Start-Process -FilePath ".\gradlew.bat" -ArgumentList "bootRun","--args=--spring.profiles.active=dev" -PassThru -RedirectStandardOutput app.out.log -RedirectStandardError app.err.log
for ($i=0; $i -lt 60; $i++) { try { if ((Invoke-WebRequest -UseBasicParsing http://localhost:8084/actuator/health).Content -match '"status":"UP"') { "UP"; break } } catch {}; Start-Sleep 3 }
Stop-Process -Id $p.Id -Force 2>$null
docker compose -f docker-compose.ci.yml down -v
Remove-Item app.out.log,app.err.log -ErrorAction SilentlyContinue
```
Expected: `UP`. (flyway가 synapse_learning에 마이그레이션 적용 후 부팅.)

### Task 4.4: 커밋 & push

- [ ] **Step 1:**
```bash
cd /c/workspace/team-project-final/synapse-learning-svc
git add .github/workflows/ci.yml learning-card/docker-compose.ci.yml
git commit -m "ci: run on dev + add dev-smoke (postgres/kafka/schema-registry, dev profile boot health)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push
```

### Task 4.5: PR CI 확인

- [ ] **Step 1:** `gh -R team-project-final/synapse-learning-svc pr checks chore/standardize-application-yml --watch`
Expected: `detect-changes`, `build-java`, `dev-smoke` pass.

---

## Final Verification

- [ ] **Step 1: 4개 PR 체크 일괄 확인**

Run (bash):
```bash
cd /c/workspace/team-project-final
for d in synapse-platform-svc synapse-knowledge-svc synapse-engagement-svc synapse-learning-svc; do
  echo "==== $d ===="
  gh -R team-project-final/$d pr checks chore/standardize-application-yml 2>&1 | head -10
done
```
Expected: 각 PR의 모든 체크가 pass(녹색).

- [ ] **Step 2: 사용자 보고**

각 PR 링크 + CI 결과 요약을 사용자에게 보고. 머지는 사용자가 직접(대기).

---

## Self-Review (작성자 점검 결과)

- **Spec coverage:** 트리거 `[main,dev]`(R3·각 Task), dev-smoke job(각 Phase), 레포별 서비스(platform=pg+redis / knowledge=pg+opensearch / engagement=pg / learning=pg+kafka스택), docker-compose.ci.yml(각 Task .1), 기존 build 유지(트리거만 변경, build job 미수정), 기존 chore 브랜치에 반영(각 Task .4), PR 통과 확인(각 Task .5 + Final), mirror/deploy/parse 미변경(범위 외) — 모두 대응.
- **Placeholder scan:** `__PORT__`는 R2 템플릿 표시이며 각 Phase의 dev-smoke job에 실제 포트(8081~8084)가 인라인됨. TODO/TBD 없음.
- **Type/일관성:** DB명·계정·포트가 R1(표준화 결과)과 각 compose/health URL에서 일치(platform/knowledge/engagement=synapse·synapse, learning=synapse_learning·postgres). 워크플로 job 이름 `dev-smoke` 일관.
- 미확정 위험: knowledge OpenSearch health indicator의 UP 여부, learning kafka 스택 기동 시간 — 로컬 검증(각 Task .3)에서 선확인 후 push.
