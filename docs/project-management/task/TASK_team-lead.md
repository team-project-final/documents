# TASK: @team-lead

> **담당 서비스**: Gateway / 인프라 / 아키텍처  
> **주차**: W1 (2026-05-12 ~ 2026-05-16)  
> **관련 문서**: [SCOPE](../scope/SCOPE_team-lead.md) | [PRD_W1](../prd/PRD_W1.md) | [WORKFLOW](../workflow/WORKFLOW_team-lead_W1.md) | [HISTORY](../history/HISTORY_team-lead.md)

---

## Step 1: AWS 인프라 프로비저닝

- **Step Goal**: 팀장이 AWS 인프라(EKS, RDS, MSK, ElastiCache, OpenSearch)와 ArgoCD를 프로비저닝하여 4-서비스 배포 기반을 확보한다.
- **Done When**:
  - [ ] EKS 클러스터 정상 가동 (kubectl get nodes → Ready)
  - [ ] RDS PostgreSQL 16 인스턴스 접속 가능
  - [ ] MSK(Kafka) 클러스터 브로커 접속 가능
  - [ ] ElastiCache(Redis 7) 접속 가능
  - [ ] OpenSearch 도메인 접속 가능
  - [ ] ArgoCD 대시보드 접근 가능
- **Scope**:
  - In Scope:
    - EKS 클러스터 생성 (3 node)
    - RDS PostgreSQL 16 (db.t3.medium)
    - MSK Kafka 3.x (3 broker)
    - ElastiCache Redis 7 (cache.t3.micro)
    - OpenSearch 8.x (1 node dev)
    - ArgoCD 설치 + ApplicationSet
  - Out of Scope:
    - Production 규모 인프라 (dev 환경만)
    - 모니터링 대시보드 (W3)
    - 비용 최적화
- **Input**: AWS 계정 정보, VPC 설계도, 09_Git_규칙_정의서 §C1
- **Instructions**:
  1. EKS 클러스터 생성 (eksctl 또는 Terraform)
  2. RDS PostgreSQL 인스턴스 생성 + 보안 그룹 설정
  3. MSK 클러스터 생성 + Schema Registry 설정
  4. ElastiCache Redis 클러스터 생성
  5. OpenSearch 도메인 생성 + nori 플러그인
  6. ArgoCD 설치 + ApplicationSet(5서비스×3환경) 구성
  7. 접속 테스트 및 팀원 접근 권한 부여
- **Output Format**: 인프라 구성도 + 접속 정보 문서 (Notion 또는 .env.example 업데이트)
- **Constraints**:
  - dev 환경 전용 (최소 사양)
  - VPC 내부 통신만 허용 (퍼블릭 접근 제한)
  - 비용: 월 $200 이내
- **Duration**: 2일
- **RULE Reference**: wiki 14_배포_가이드 §2, wiki 10_환경_설정_템플릿
- **Assignee**: @team-lead
- **Reviewer**: —

**Status**: [ ] Not Started / [ ] In Progress / [ ] Done

---

## Step 2: Docker Compose 4-서비스 구성

- **Step Goal**: 팀장이 Docker Compose로 4개 서비스와 Schema Registry를 포함한 전체 로컬 개발 환경을 한 번에 실행할 수 있다.
- **Done When**:
  - [ ] `docker compose up` → 4-서비스 Health OK (< 2분)
  - [ ] Schema Registry 접속 (http://localhost:8081)
  - [ ] PostgreSQL + Redis + Kafka + ES 접속 가능
  - [ ] 팀원 온보딩 문서에 실행 방법 기재
- **Scope**:
  - In Scope:
    - docker-compose.yml (4-서비스 + infra)
    - .env.example 업데이트
    - Schema Registry 컨테이너
    - Health check 설정
  - Out of Scope:
    - Production Docker 이미지 최적화
    - K8s Helm Chart (별도 관리)
- **Input**: 각 서비스 Dockerfile, .env.example, Schema Registry 설정
- **Instructions**:
  1. docker-compose.yml 작성 (services: platform, engagement, knowledge, learning-card, learning-ai, postgres, redis, kafka, zookeeper, schema-registry, elasticsearch)
  2. 각 서비스 health check 설정 (depends_on + healthcheck)
  3. .env.example에 전체 환경 변수 정리
  4. README에 실행 방법 문서화
  5. 팀원 로컬 테스트
- **Output Format**: `docker-compose.yml` + `.env.example` + README 섹션
- **Constraints**:
  - 단일 `docker compose up`으로 전체 실행
  - 메모리 8GB 환경에서 동작
  - Apple Silicon(ARM) 호환
- **Duration**: 1일
- **RULE Reference**: wiki 10_환경_설정_템플릿
- **Assignee**: @team-lead
- **Reviewer**: —

**Status**: [ ] Not Started / [ ] In Progress / [ ] Done

---

## Step 3: CI/CD 파이프라인 구성

- **Step Goal**: 팀장이 GitHub Actions CI/CD 파이프라인(mirror, CI, deploy)을 구성하여 main push 시 자동 빌드와 dev 환경 배포가 동작한다.
- **Done When**:
  - [ ] mirror.yml: 소스 레포 → 미러 레포 동기화 동작
  - [ ] ci.yml: PR → 빌드 + 테스트 + lint 동작
  - [ ] deploy.yml: main push → ECR 이미지 푸시 → ArgoCD dev 동기화
  - [ ] 파이프라인 문서화
- **Scope**:
  - In Scope:
    - mirror.yml (소스 → 미러 동기화)
    - ci.yml (빌드 + 테스트 + Modulith verify)
    - deploy.yml (ECR push + ArgoCD image tag 업데이트)
    - GitHub Secrets 설정
  - Out of Scope:
    - staging/prod 배포 (수동 승인 — W3)
    - 성능 테스트 CI
    - Canary/Blue-Green 배포
- **Input**: GitHub 레포 구조, ECR 레지스트리, ArgoCD API
- **Instructions**:
  1. mirror.yml 작성 (on: push main → mirror sync)
  2. ci.yml 작성 (on: PR → gradle build + test + modulith verify)
  3. deploy.yml 작성 (on: push main → docker build → ECR push → gitops image tag patch)
  4. GitHub Secrets 설정 (AWS credentials, ECR URL, ArgoCD token)
  5. 전체 플로우 테스트 (dummy commit → 파이프라인 동작 확인)
- **Output Format**: `.github/workflows/mirror.yml`, `ci.yml`, `deploy.yml`
- **Constraints**:
  - dev 환경만 자동 배포 (autoSync: true)
  - staging/prod는 수동 승인 (autoSync: false)
  - CI 실행 시간 < 5분
- **Duration**: 2일
- **RULE Reference**: wiki 09_Git_규칙_정의서 §B3, wiki 14_배포_가이드
- **Assignee**: @team-lead
- **Reviewer**: —

**Status**: [ ] Not Started / [ ] In Progress / [ ] Done
