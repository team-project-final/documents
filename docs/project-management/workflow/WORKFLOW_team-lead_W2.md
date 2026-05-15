# WORKFLOW: @team-lead — Week 2

> **Task 문서**: [TASK_team-lead.md](../task/TASK_team-lead.md)
> **기간**: 2026-05-18 ~ 2026-05-22, 5 영업일
> **PRD**: [PRD_W2.md](../prd/PRD_W2.md)

---

## Step 4: Kafka 토픽 설계 + 생성

### 4.1 TASK 시작
- [ ] Step Goal / Done When / Scope / Input 확인
- [ ] PRD_W2 해당 요구사항 확인 (Kafka 토픽 설계)
- [ ] Duration 산정 확인

### 4.2 요구사항 분석
- [ ] 도메인별 토픽 목록 확정 (card.reviewed, note.updated 등)
- [ ] 토픽 파티션 수 / 복제 팩터 정의
- [ ] 토픽 네이밍 컨벤션 확정 ({domain}.{event})
- [ ] 메시지 보존 기간 정책 정의
- [ ] Instructions 초안 → TASK 문서 반영

### 4.3 Security 1차 검토 (네트워크 보안)
- [ ] Kafka ACL 토픽별 생산자/소비자 권한 정의
- [ ] SASL/TLS 인증 설정 확인
- [ ] 토픽 접근 제어 최소 권한 원칙 적용
- [ ] 결과 → TASK Constraints 반영

### 4.4 인프라 아키텍처 설계
- [ ] 도메인별 토픽 목록 및 파티션 구성도 작성
- [ ] 프로듀서/컨슈머 매핑 다이어그램 작성
- [ ] 토픽 보존 기간 / cleanup.policy 설정 설계
- [ ] Duration(final) 갱신

### 4.5 Security 2차 검토
- [ ] 토픽 메시지 암호화 전송 (TLS) 확인
- [ ] 민감 데이터 토픽 접근 제한 확인
- [ ] 결과 → TASK Constraints 반영

### 4.6 N/A (인프라 — DTO/Entity 해당 없음)

### 4.7 Kafka 토픽 생성
- [ ] MSK/Kafka 클러스터에 토픽 생성 (kafka-topics.sh --create)
- [ ] 각 토픽 파티션 수 / 복제 팩터 설정
- [ ] 토픽 config 설정 (retention.ms, cleanup.policy)
- [ ] docker-compose에 토픽 자동 생성 스크립트 반영

### 4.8 토픽 검증 테스트
- [ ] kafka-topics.sh --list 로 토픽 목록 확인
- [ ] kafka-console-producer/consumer 로 메시지 송수신 테스트
- [ ] 파티션 배분 확인
- [ ] docker compose 환경에서 토픽 자동 생성 확인

### 4.9 N/A (인프라 — Controller 해당 없음)

### 4.10 N/A (인프라 — View 해당 없음)

**Step 4 Status**: [ ] Not Started / [ ] In Progress / [ ] Done

---

## Step 5: Schema Registry BACKWARD 호환성 강제

### 5.1 TASK 시작
- [ ] Step Goal / Done When / Scope / Input 확인
- [ ] PRD_W2 해당 요구사항 확인 (Schema Registry 정책)
- [ ] Duration 산정 확인

### 5.2 요구사항 분석
- [ ] Schema Registry 글로벌 호환성 정책 요건 분석 (BACKWARD)
- [ ] Avro 스키마 호환성 규칙 분석 (필드 추가=default 필수, 삭제 불가)
- [ ] 서비스별 스키마 등록 절차 정의
- [ ] Instructions 초안 → TASK 문서 반영

### 5.3 Security 1차 검토 (네트워크 보안)
- [ ] Schema Registry API 접근 제한 (내부 네트워크만)
- [ ] 스키마 등록/수정 권한 관리 확인
- [ ] 결과 → TASK Constraints 반영

### 5.4 인프라 아키텍처 설계
- [ ] 글로벌 호환성 레벨 설정 전략 수립
- [ ] 스키마 버전 관리 정책 정의
- [ ] Duration(final) 갱신

### 5.5 Security 2차 검토
- [ ] 스키마 삭제 방지 정책 확인 (soft delete만)
- [ ] 비인가 스키마 등록 방지 확인
- [ ] 결과 → TASK Constraints 반영

### 5.6 N/A (인프라 — DTO/Entity 해당 없음)

### 5.7 Schema Registry 설정 적용
- [ ] 글로벌 호환성 레벨 BACKWARD 설정 (`PUT /config`)
- [ ] 기존 토픽 subject별 호환성 레벨 확인
- [ ] docker-compose Schema Registry 환경변수 반영

### 5.8 호환성 검증 테스트
- [ ] 호환 스키마 등록 → 성공 확인
- [ ] 비호환 스키마 등록 → 409 거부 확인 (필드 삭제 시)
- [ ] `GET /config` → BACKWARD 확인
- [ ] 각 서비스별 호환성 테스트

### 5.9 N/A (인프라 — Controller 해당 없음)

### 5.10 N/A (인프라 — View 해당 없음)

**Step 5 Status**: [ ] Not Started / [ ] In Progress / [ ] Done

---

## Step 6: Gateway 라우팅

### 6.1 TASK 시작
- [ ] Step Goal / Done When / Scope / Input 확인
- [ ] PRD_W2 해당 요구사항 확인 (Gateway 라우팅)
- [ ] Duration 산정 확인

### 6.2 요구사항 분석
- [ ] 서비스별 경로 매핑 요건 정의 — Wiki 도메인 경로 기준:
  - platform-svc: `/auth/**`, `/tenant/**`, `/billing/**`, `/me/**`
  - engagement-svc: `/community/**`, `/gamification/**`
  - knowledge-svc: `/notes/**`, `/graph/**`
  - learning-ai (FastAPI port 8090): `/ai/**`
  - learning-card: `/decks/**`, `/cards/**`, `/reviews/**`, `/stats/**`
  - cross-cutting: `/notifications/**`
  - admin: `/admin/**`
- [ ] Rate Limit 요건 분석 — 플랜별 제한: Free 100회/min, Pro 1000회/min, Team 3000회/min
- [ ] Gateway 필터 체인 순서 확인: CORS → Rate Limiter → JWT Validator → Tenant Resolver → Request Logger → Circuit Breaker
- [ ] Tenant Resolution 요건 확인 (JWT 클레임에서 tenant_id 추출 → X-Tenant-Id 헤더 하위 서비스 주입)
- [ ] Circuit Breaker (Resilience4j) 요건 확인
- [ ] CORS 설정 요건 확인
- [ ] Instructions 초안 → TASK 문서 반영

### 6.3 Security 1차 검토 (네트워크 보안)
- [ ] Gateway → 서비스 간 내부 통신만 허용
- [ ] 외부 접근 Gateway 단일 진입점 확인
- [ ] Rate Limit으로 DDoS 완화 확인
- [ ] 결과 → TASK Constraints 반영

### 6.4 인프라 아키텍처 설계
- [ ] 서비스별 라우팅 테이블 설계 (Wiki 도메인 경로 기준, `/api/platform/**` 등 구 prefix 제거)
- [ ] learning-svc 경로 분할 설계: `/ai/**` → learning-ai (FastAPI, port 8090), `/decks/**`,`/cards/**`,`/reviews/**`,`/stats/**` → learning-card
- [ ] Rate Limit 정책 설계 — 플랜 기반: Free 100/min, Pro 1000/min, Team 3000/min (Redis 기반 RequestRateLimiter)
- [ ] Gateway 필터 체인 순서 설계: CORS → Rate Limiter → JWT Validator → Tenant Resolver → Request Logger → Circuit Breaker
- [ ] Health check 엔드포인트 바이패스 설계
- [ ] Duration(final) 갱신

### 6.5 Security 2차 검토
- [ ] JWT 검증 Gateway 레벨 적용 확인
- [ ] Tenant Resolution 필터: JWT에서 tenant_id 추출 → X-Tenant-Id 헤더 하위 서비스 전달 확인
- [ ] Rate Limit 버스트 정책 확인
- [ ] Circuit Breaker (Resilience4j) fallback 정책 확인
- [ ] 민감 헤더 전파 제한 확인
- [ ] 결과 → TASK Constraints 반영

### 6.6 N/A (인프라 — DTO/Entity 해당 없음)

### 6.7 Gateway 구현
- [ ] Spring Cloud Gateway 라우트 설정 (Wiki 도메인 경로 기준):
  - platform-svc: `/auth/**`, `/tenant/**`, `/billing/**`, `/me/**`
  - engagement-svc: `/community/**`, `/gamification/**`
  - knowledge-svc: `/notes/**`, `/graph/**`
  - learning-ai (FastAPI port 8090): `/ai/**`
  - learning-card: `/decks/**`, `/cards/**`, `/reviews/**`, `/stats/**`
  - `/notifications/**`, `/admin/**`
- [ ] Gateway 필터 체인 구현 순서: CORS → Rate Limiter → JWT Validator → Tenant Resolver → Request Logger → Circuit Breaker
- [ ] Tenant Resolver 필터 구현 (JWT claims → X-Tenant-Id 헤더 주입)
- [ ] Circuit Breaker 필터 구현 (Resilience4j, 서비스별 fallback 설정)
- [ ] Rate Limit 필터 설정 (Redis 기반 RequestRateLimiter — Free 100/min, Pro 1000/min, Team 3000/min)
- [ ] CORS 글로벌 설정
- [ ] docker-compose에 Gateway 서비스 추가/갱신

### 6.8 라우팅 테스트
- [ ] 각 서비스 경로 라우팅 동작 확인
- [ ] `/ai/**` → learning-ai (port 8090) 라우팅 확인
- [ ] Rate Limit 초과 시 429 응답 확인 (플랜별 임계치)
- [ ] X-Tenant-Id 헤더 하위 서비스 전달 확인
- [ ] Circuit Breaker 동작 확인 (서비스 다운 시 fallback 응답)
- [ ] CORS preflight 요청 처리 확인
- [ ] Health endpoint 바이패스 확인

### 6.9 N/A (인프라 — Controller 해당 없음)

### 6.10 N/A (인프라 — View 해당 없음)

**Step 6 Status**: [ ] Not Started / [ ] In Progress / [ ] Done
