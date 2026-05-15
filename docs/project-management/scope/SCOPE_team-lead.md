# 작업 스코프: @team-lead

## 담당자 정보

| 항목 | 내용 |
|------|------|
| Handle | @team-lead |
| 역할 | 팀장 (1명) |
| 담당 서비스 | Spring Cloud Gateway / 인프라 / 아키텍처 |
| 담당 영역 | EKS, RDS, MSK, Redis, OpenSearch, ArgoCD, Schema Registry, CI/CD, Docker Compose |
| GitHub Repository | [syn](https://github.com/team-project-final/syn) · [synapse-shared](https://github.com/team-project-final/synapse-shared) · [synapse-mirror](https://github.com/team-project-final/synapse-mirror) · [synapse-gitops](https://github.com/team-project-final/synapse-gitops) |

## 5주 전체 책임 범위

### 도메인 경계

- **In Scope**:
  - AWS 인프라 프로비저닝 (EKS, RDS, MSK, ElastiCache, OpenSearch)
  - ArgoCD ApplicationSet 구성 (4서비스 + learning 내부 2런타임 × 3환경)
  - Docker Compose 로컬 개발 환경
  - CI/CD 파이프라인 (GitHub Actions: mirror, ci, deploy)
  - Schema Registry 운영 + 호환성 정책 관리
  - Spring Cloud Gateway 라우팅 + Rate Limit
  - 전체 PR cross-review 승인
  - 통합 테스트 조율
- **Out of Scope**:
  - 개별 서비스 비즈니스 로직 구현
  - Flutter UI 전담 개발
  - AI/ML 모델 구현

### 주차별 스코프 매트릭스

| 주차 | 기간 | 핵심 목표 | 산출물 | 의존성 |
|------|------|-----------|--------|--------|
| W1 | 05-12~15 | 인프라 셋업 + Docker Compose + CI/CD 기초 | EKS 클러스터, docker-compose.yml, CI/CD yml 3종 | AWS 계정, GitHub 레포 |
| W2 | 05-18~22 | Kafka 토픽 설계 + Schema Registry 호환성 강제 + Gateway 라우팅 | 토픽 목록, 호환성 정책, Gateway 설정 | 4개 서비스 골격 완성 (W1) |
| W3 | 05-26~29 | 통합 테스트 조율 + 코드 리뷰 + ArgoCD dev/staging 배포 검증 | 통합 테스트 시나리오, 배포 검증 리포트 | 전체 서비스 기능 구현 (W2) |
| W4 | 06-01~05 | 최종 점검 + 성능 튜닝 + Staging 배포 | Staging 환경 완성, 성능 리포트 | 전체 기능 완성 (W3) |
| W5 | 06-08~12 | 전체 E2E 조율 + P0 버그 트리아지 + 발표 자료/리허설 | E2E 결과 리포트, P0 버그 현황, 발표 자료, 리허설 노트 | W4 staging 검증 |

## 협업 인터페이스

| 상대 | 주고받는 것 | 방향 |
|------|------------|------|
| 전체 팀원 | 인프라 환경 (Docker Compose, K8s) | 제공 → |
| 전체 팀원 | PR cross-review 승인 | ← 수신 |
| @platform-owner | Gateway ↔ platform-svc 라우팅 설정 | 양방향 |
| @knowledge-owner-2 | Schema Registry 정책 협의 | 양방향 |

## 성공 기준

- [ ] 4개 서비스가 EKS에서 정상 구동
- [ ] Docker Compose로 로컬 전체 환경 1분 내 실행
- [ ] CI/CD: main push → 자동 빌드 → ECR → ArgoCD dev 동기화
- [ ] Schema Registry 전 토픽 BACKWARD 호환
- [ ] Staging 환경 배포 완료 + 모니터링 대시보드 가동
