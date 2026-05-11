# PRD: Week 3 — 부가 기능 + Kafka 통합

## 1. 주차 개요

| 항목 | 내용 |
|------|------|
| 기간 | 2026-05-26 (월) ~ 2026-05-30 (금) |
| 목표 | Gamification 완성 / 알림 발송 / Kafka 이벤트 연동 / 관리자 / Audit |
| 전주 결과 | W2에서 SRS 복습, 그래프, 검색, 공유, AI 골격 완성 |

## 2. 기능 요구사항

### 2.1 @team-lead — 통합 테스트 + 배포

| ID | 유저 스토리 | 수용 기준 | 우선순위 |
|----|------------|-----------|----------|
| FR-TL-201 | 전체 서비스 간 Kafka 이벤트 흐름이 E2E로 동작한다 | 복습→XP→레벨업→알림 전체 체인 동작 확인 | P0 |
| FR-TL-202 | ArgoCD dev/staging 환경 배포가 검증된다 | dev autoSync 동작 + staging 수동 승인 배포 성공 | P0 |

### 2.2 @platform-owner — Audit + Notification 발송

| ID | 유저 스토리 | 수용 기준 | 우선순위 |
|----|------------|-----------|----------|
| FR-PL-201 | 시스템이 주요 이벤트를 audit_logs에 자동 기록한다 | Kafka 이벤트 소비 → audit_logs 적재 + 90일 보존 정책 | P0 |
| FR-PL-202 | 사용자에게 FCM 푸시 알림이 발송된다 | gamification.level_up / community.shared / card.review.due → 푸시 발송 | P0 |
| FR-PL-203 | 사용자에게 이메일 알림이 발송된다 | AWS SES → 주간 학습 리포트 이메일 | P1 |
| FR-PL-204 | 사용자가 조용한 시간을 설정할 수 있다 | PUT /api/v1/notifications/quiet-hours → 해당 시간 알림 미발송 | P1 |
| FR-PL-205 | 관리자가 테넌트/사용자를 관리할 수 있다 | 사용자 목록/검색/정지/삭제 관리 API | P0 |

### 2.3 @engagement-owner — Gamification 완성 + 신고

| ID | 유저 스토리 | 수용 기준 | 우선순위 |
|----|------------|-----------|----------|
| FR-EG-201 | 사용자가 배지를 획득할 수 있다 | 조건 달성 → 배지 수여 + 축하 모달 트리거 | P0 |
| FR-EG-202 | 사용자의 레벨이 XP 누적에 따라 자동 상승한다 | XP 임계값 도달 → 레벨업 + gamification.level_up 이벤트 발행 | P0 |
| FR-EG-203 | 사용자의 연속 학습 스트릭이 추적된다 | 일일 복습 → 스트릭 카운트 증가 + 끊김 시 리셋 | P0 |
| FR-EG-204 | 사용자가 리더보드를 조회할 수 있다 | GET /api/v1/leaderboard?period=weekly → 상위 N명 + 내 순위 | P0 |
| FR-EG-205 | 사용자가 부적절한 콘텐츠를 신고할 수 있다 | POST /api/v1/reports → 신고 접수 + 관리자 알림 | P1 |
| FR-EG-206 | 관리자가 신고를 처리할 수 있다 | GET/PUT /api/v1/admin/reports → 신고 목록 + 승인/거부/숨김 | P1 |

### 2.4 @knowledge-owner-1 — 버전 이력 + 태그

| ID | 유저 스토리 | 수용 기준 | 우선순위 |
|----|------------|-----------|----------|
| FR-KN-201 | 사용자가 노트 수정 이력을 조회할 수 있다 | GET /api/v1/notes/{id}/versions → 수정 히스토리 목록 | P0 |
| FR-KN-202 | 사용자가 이전 버전으로 노트를 복원할 수 있다 | POST /api/v1/notes/{id}/versions/{versionId}/restore | P1 |
| FR-KN-203 | 사용자가 태그로 노트를 필터링할 수 있다 | GET /api/v1/notes?tags=java,spring → 태그 기반 필터 | P0 |

### 2.5 @knowledge-owner-2 — RRF 검색

| ID | 유저 스토리 | 수용 기준 | 우선순위 |
|----|------------|-----------|----------|
| FR-K2-201 | 사용자가 하이브리드 검색(BM25+시맨틱)으로 노트를 검색할 수 있다 | GET /api/v1/search?q=query → RRF 결합 결과 반환 | P0 |
| FR-K2-202 | 검색 정확도가 측정되고 리포트된다 | 테스트 쿼리 세트 → 정확도 리포트 출력 | P1 |

### 2.6 @learning-card-owner — 복습 리마인더 + 통계

| ID | 유저 스토리 | 수용 기준 | 우선순위 |
|----|------------|-----------|----------|
| FR-LC-201 | 시스템이 복습 대상 카드가 있으면 card.review.due 이벤트를 발행한다 | 매일 스케줄러 → 복습 대상 사용자 → Kafka 발행 → notification 소비 | P0 |
| FR-LC-202 | 사용자가 복습 통계 대시보드를 조회할 수 있다 | GET /api/v1/review/dashboard → 일별/주별 복습 수, 정답률, 스트릭 | P0 |

### 2.7 @learning-ai-owner — AI 카드 자동 생성 + RAG

| ID | 유저 스토리 | 수용 기준 | 우선순위 |
|----|------------|-----------|----------|
| FR-LA-201 | 노트 생성 시 AI가 자동으로 플래시카드를 생성한다 | note.created Kafka 소비 → LLM → Card 생성 → learning-card API 호출 | P0 |
| FR-LA-202 | 사용자가 노트 기반으로 AI에게 질문할 수 있다 (RAG Q&A) | POST /api/v1/ai/ask → 관련 청크 검색 → LLM 답변 생성 | P2 (시간 허용 시) |
| FR-LA-203 | 시맨틱 캐시로 중복 요청이 최적화된다 | 코사인 유사도 > 0.95 → 캐시 히트 → API 비용 절감 | P2 (시간 허용 시) |

### 2.8 Frontend (전체 협업)

| ID | 유저 스토리 | 수용 기준 | 우선순위 |
|----|------------|-----------|----------|
| FR-FE-201 | 사용자가 게이미피케이션 UI를 볼 수 있다 | XP 바 + 배지 갤러리 + 레벨 표시 + 레벨업 축하 애니메이션 | P0 |
| FR-FE-202 | 사용자가 알림 센터에서 알림을 확인할 수 있다 | 알림 목록 + 읽음/안읽음 + 알림 설정 | P0 |
| FR-FE-203 | 관리자가 관리 화면에서 신고를 처리할 수 있다 | 신고 목록 + 처리(승인/거부) | P1 |
| FR-FE-204 | 사용자가 공유 덱을 탐색하고 복사할 수 있다 | 공유 덱 목록 + 상세 + 복사 버튼 | P0 |

## 3. 비기능 요구사항

| ID | 항목 | 기준 |
|----|------|------|
| NFR-201 | E2E 이벤트 체인 | 복습→XP→레벨업→알림 전체 < 10초 |
| NFR-202 | 알림 발송 | FCM 발송 성공률 > 95% |
| NFR-203 | 리더보드 응답 | P95 < 500ms (Redis 캐시) |
| NFR-204 | AI 카드 생성 | 노트당 3-5개 카드, 생성 시간 < 30초 |
| NFR-205 | Audit 로그 | 적재 지연 < 30초, 90일 보존 |

## 4. 의존성 맵

| From | To | 내용 | 시점 |
|------|-----|------|------|
| @learning-card-owner | @engagement-owner | card.reviewed → XP 적립 | W3 Day 1~ |
| @engagement-owner | @platform-owner | gamification.level_up → 알림 발송 | W3 Day 2~ |
| @learning-card-owner | @platform-owner | card.review.due → 복습 리마인더 알림 | W3 Day 3~ |
| @knowledge-owner-1 | @learning-ai-owner | note.created → AI 카드 자동 생성 | W3 Day 2~ |
| @knowledge-owner-2 | @learning-ai-owner | 시맨틱 벡터 → RRF 결합 | W3 Day 1~ |

## 5. 성공 기준 체크리스트

- [ ] 복습 완료 → XP 적립 → 레벨업 → 축하 + 알림 전체 흐름 동작
- [ ] 덱 공유 → 그룹원 알림 동작
- [ ] 리더보드 조회 동작
- [ ] 관리자 신고 처리 동작
- [ ] ArgoCD dev 환경 자동 배포 + Schema Registry 검증 통과

## 6. 리스크 & 대안

| 리스크 | 영향 | 확률 | 대안 |
|--------|------|------|------|
| Kafka 이벤트 체인 복잡도 | 디버깅 어려움 | 중 | Dead Letter Queue + 이벤트 추적 로깅 |
| FCM 인증서 설정 오류 | 푸시 알림 불가 | 중 | 이메일 알림을 1순위 폴백으로 |
| AI 카드 품질 | 자동 생성 카드 부정확 | 중 | 사용자 검수 UI + 자동 생성 ON/OFF 토글 |
| RAG 시간 부족 | W3 내 완성 불가 | 높 | P2로 분류 — W4 또는 Phase 2로 이월 |
