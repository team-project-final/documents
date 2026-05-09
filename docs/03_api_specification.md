# Synapse — REST API 명세서

> Spring Cloud Gateway 뒤의 마이크로서비스 API 통합 명세

> **문서 버전**: v2.0 (2026-04-30 전면 재작성)
> **이전**: v1.2 (포트폴리오/상용화 분리) → v2.0에서 **상용 SaaS 단일 트랙** 통합
> 모든 빌링 / 감사 / 관리자 / 분석 API를 본 문서로 흡수

---

## 1. 공통 규약

### 1.1 기본 정보
- **Base URL**: `https://api.synapse.app/api/v1`
- **인증**: JWT Bearer Token (httpOnly Cookie 우선) 또는 `Authorization` 헤더
- **Content-Type**: `application/json; charset=UTF-8`
- **시간 형식**: ISO 8601 UTC
- **ID 형식**: UUID v7

### 1.2 인증 / 컨텍스트 헤더

#### 권장 (Web)
```http
Cookie: synapse_at=eyJ...; synapse_rt=eyJ...
X-CSRF-Token: <csrf-token>
X-Trace-Id: abc-123
```

#### Mobile / API
```http
Authorization: Bearer eyJ...
X-Tenant-Id: 01941a00-...      (선택, JWT claim 우선)
X-Trace-Id: abc-123
```

#### Tenant 결정 우선순위
1. JWT claim `tenantId` (최우선)
2. `X-Tenant-Id` 헤더 (다중 멤버십 시 컨텍스트 전환)
3. `users.default_tenant_id`

> 게이트웨이가 tenant context 를 주입한 뒤 코어 서비스로 라우팅. RLS와 애플리케이션 강제 필터로 이중 방어.

### 1.3 표준 응답 포맷

#### 성공
```json
{
  "success": true,
  "data": { /* 데이터 */ },
  "meta": {
    "timestamp": "2026-04-30T12:34:56.789Z",
    "traceId": "abc-123"
  }
}
```

#### 페이지네이션
```json
{
  "success": true,
  "data": [ /* ... */ ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 142,
    "totalPages": 8,
    "hasNext": true
  },
  "meta": { /* ... */ }
}
```

#### 에러
```json
{
  "success": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "월간 AI 토큰 한도를 초과했습니다.",
    "details": { "used": 100000, "limit": 100000, "resetAt": "2026-05-01T00:00:00Z" },
    "fieldErrors": []
  },
  "meta": { /* ... */ }
}
```

### 1.4 페이지네이션 파라미터
| 파라미터 | 기본값 | 설명 |
|----------|--------|------|
| `page` | 0 | 0부터 시작 |
| `size` | 20 | 1~100 |
| `sort` | (엔드포인트별) | `field,asc|desc` |

### 1.5 표준 에러 코드

| HTTP | code | 설명 |
|------|------|------|
| 400 | `VALIDATION_ERROR` | 검증 실패 |
| 401 | `UNAUTHENTICATED` | 토큰 누락/만료 |
| 401 | `MFA_REQUIRED` | MFA 챌린지 필요 |
| 402 | `PLAN_FEATURE_LOCKED` | 상위 플랜 필요 |
| 403 | `FORBIDDEN` | 권한 없음 |
| 403 | `TENANT_ACCESS_DENIED` | 해당 tenant 멤버 아님 |
| 404 | `RESOURCE_NOT_FOUND` | 리소스 없음 |
| 409 | `RESOURCE_CONFLICT` | 중복/충돌 |
| 422 | `BUSINESS_RULE_VIOLATION` | 비즈니스 규칙 |
| 429 | `RATE_LIMIT_EXCEEDED` | Rate limit |
| 429 | `QUOTA_EXCEEDED` | 플랜 한도 초과 |
| 500 | `INTERNAL_SERVER_ERROR` | 서버 오류 |
| 502 | `UPSTREAM_ERROR` | LLM/외부 서비스 오류 |
| 503 | `SERVICE_UNAVAILABLE` | 일시 사용 불가 |

### 1.6 Rate Limiting

| 등급 | 제한 | 헤더 |
|------|------|------|
| 비인증 IP | 60 req/min | `X-RateLimit-Limit/Remaining/Reset` |
| 인증 일반 | 600 req/min/user | 동일 |
| LLM 카드 생성 | 30 req/min/user, 1000 req/일 | + `X-Quota-Used/Limit/Reset` |
| LLM Q&A | 60 req/min/user | + `X-Quota-*` |
| 검색 | 120 req/min/user | 동일 |
| 회원가입 | 5 req/hour/IP | 동일 |

### 1.7 멱등성 (POST에 권장)

비파괴적 재시도 가능 작업은 `Idempotency-Key` 헤더 지원:
```http
POST /cards
Idempotency-Key: 01941d12-...
```

서버는 24시간 동안 같은 키로 동일 응답 반환. 결제 / LLM 호출 등 비싼 작업에 필수.

---

## 2. 인증 (Auth Service)

### 2.1 회원가입
```
POST /auth/signup
```
**Request**:
```json
{
  "email": "user@example.com",
  "username": "developer_kim",
  "password": "P@ssw0rd!",
  "displayName": "김개발",
  "marketingOptIn": false,
  "captchaToken": "..."
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "userId": "01941c8e-...",
    "tenantId": "01941a00-...",
    "email": "user@example.com",
    "username": "developer_kim",
    "emailVerificationSent": true
  }
}
```

**처리**:
- BCrypt cost 12 + haveibeenpwned 체크
- Personal tenant 자동 생성 (slug = username)
- 이메일 인증 메일 발송
- Audit log: `auth.signup`

---

### 2.2 OAuth 로그인 시작
```
GET /auth/oauth/{provider}/authorize?redirect_uri=...
```
**provider**: `google` / `github` / `apple` / `microsoft`

**Response 302**: OAuth 제공자로 리다이렉트

### 2.3 OAuth 콜백
```
GET /auth/oauth/{provider}/callback?code=...&state=...
```

---

### 2.4 로그인 (이메일/비밀번호)
```
POST /auth/login
```
**Request**:
```json
{
  "email": "user@example.com",
  "password": "P@ssw0rd!",
  "deviceName": "Chrome on macOS"
}
```

**Response 200** (MFA 미사용):
```http
HTTP/1.1 200 OK
Set-Cookie: synapse_at=eyJ...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600
Set-Cookie: synapse_rt=eyJ...; HttpOnly; Secure; SameSite=Strict; Path=/auth; Max-Age=1209600

{
  "success": true,
  "data": {
    "user": { /* ... */ },
    "tenant": { /* ... */ },
    "mfaRequired": false
  }
}
```

**Response 200** (MFA 사용):
```json
{
  "success": true,
  "data": {
    "mfaRequired": true,
    "mfaChallengeToken": "eyJ...",
    "availableMfaTypes": ["totp", "backup_code"]
  }
}
```

### 2.5 MFA 검증
```
POST /auth/mfa/verify
```
**Request**:
```json
{
  "challengeToken": "eyJ...",
  "mfaType": "totp",
  "code": "123456"
}
```

**Response**: 2.4와 동일 (쿠키 발급)

### 2.6 MFA 등록
```
POST /auth/me/mfa/totp/enroll
```
**Response 200**:
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCodeUrl": "otpauth://totp/Synapse:user@example.com?secret=...&issuer=Synapse",
    "backupCodes": ["abc-123", "def-456", ...]
  }
}
```

```
POST /auth/me/mfa/totp/confirm
```
**Request**: `{ "code": "123456" }`

```
POST /auth/me/mfa/disable
```
**Request**: `{ "password": "..." }` (비밀번호 재확인)

---

### 2.7 토큰 갱신
```
POST /auth/refresh
```
**Request**: 본문 없음 (쿠키에서 refresh token 자동 사용)

**Response 200**: 새 쿠키 + 사용자 정보

### 2.8 로그아웃
```
POST /auth/logout
```
**Response 204**: 쿠키 삭제 + DB refresh_token revoke

### 2.9 모든 디바이스 로그아웃
```
POST /auth/logout-all
```

### 2.10 디바이스 / 세션 목록
```
GET /auth/me/sessions
```
**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "01941d00-...",
      "deviceName": "Chrome on macOS",
      "ipAddress": "...",
      "lastUsedAt": "...",
      "createdAt": "...",
      "isCurrent": true
    }
  ]
}
```

### 2.11 특정 세션 종료
```
DELETE /auth/me/sessions/{sessionId}
```

---

### 2.12 비밀번호 재설정 요청
```
POST /auth/password-reset/request
```
**Request**: `{ "email": "..." }`

### 2.13 비밀번호 재설정 완료
```
POST /auth/password-reset/confirm
```
**Request**:
```json
{ "token": "...", "newPassword": "..." }
```

### 2.14 이메일 인증
```
GET /auth/verify-email?token=...
```

### 2.15 내 정보
```
GET /auth/me
```

### 2.16 사용자 설정
```
GET /auth/me/settings
PATCH /auth/me/settings
```

---

## 3. 테넌트 / 멤버십

### 3.1 내 컨텍스트
```
GET /tenants/me
```
**Response 200**:
```json
{
  "success": true,
  "data": {
    "currentTenant": {
      "id": "01941a00-...",
      "name": "김개발의 학습 공간",
      "slug": "developer-kim",
      "plan": "pro",
      "tenantType": "personal",
      "role": "owner"
    },
    "memberships": [
      { "tenantId": "...", "tenantName": "...", "role": "owner" },
      { "tenantId": "...", "tenantName": "팀A", "role": "member" }
    ]
  }
}
```

### 3.2 테넌트 컨텍스트 전환
```
POST /tenants/switch
```
**Request**: `{ "tenantId": "..." }`

**Response 200**: 새 쿠키 + 갱신된 컨텍스트

### 3.3 사용량 조회
```
GET /tenants/me/usage
```
**Response 200**:
```json
{
  "success": true,
  "data": {
    "plan": "pro",
    "period": { "start": "2026-04-01", "end": "2026-04-30" },
    "usage": {
      "notes": { "used": 142, "limit": 50000 },
      "cards": { "used": 387, "limit": 50000 },
      "storageBytes": { "used": 12485760, "limit": 10000000000 },
      "aiTokens": { "used": 1200000, "limit": 5000000 },
      "aiCardGenerations": { "used": 12, "limit": 500 }
    },
    "warnings": []
  }
}
```

### 3.4 테넌트 정보 갱신 (owner only)
```
PATCH /tenants/me
```
**Request**: `{ "name": "...", "settings": {...} }`

### 3.5 멤버 초대 (Team plan)
```
POST /tenants/me/members/invite
```
**Request**:
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

### 3.6 멤버 목록
```
GET /tenants/me/members
```

### 3.7 멤버 역할 변경
```
PATCH /tenants/me/members/{userId}
```
**Request**: `{ "role": "admin" }`

### 3.8 멤버 제거
```
DELETE /tenants/me/members/{userId}
```

---

## 4. 빌링 (Billing Service)

### 4.1 플랜 목록
```
GET /billing/plans
```
**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "plan": "pro",
      "displayName": "Pro",
      "priceUsdMonthly": 9.99,
      "priceUsdYearly": 95.88,
      "yearlyDiscount": 0.20,
      "quotas": {
        "maxNotes": 50000,
        "maxAiTokensMonthly": 5000000
      },
      "features": ["graphView", "semanticSearch"]
    }
  ]
}
```

### 4.2 Stripe Checkout 세션 생성
```
POST /billing/checkout
```
**Request**:
```json
{
  "plan": "pro",
  "billingCycle": "monthly",
  "successUrl": "https://app.synapse.app/billing/success",
  "cancelUrl": "https://app.synapse.app/billing/cancel"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/pay/cs_..."
  }
}
```

### 4.3 Customer Portal 세션
```
POST /billing/portal
```
**Response 200**:
```json
{
  "success": true,
  "data": { "portalUrl": "https://billing.stripe.com/p/session/..." }
}
```

### 4.4 현재 구독
```
GET /billing/subscription
```
**Response 200**:
```json
{
  "success": true,
  "data": {
    "plan": "pro",
    "status": "active",
    "currentPeriodStart": "2026-04-01T00:00:00Z",
    "currentPeriodEnd": "2026-05-01T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "stripeCustomerId": "cus_..."
  }
}
```

### 4.5 구독 취소
```
POST /billing/subscription/cancel
```
**Request**:
```json
{
  "immediately": false,
  "reason": "..."
}
```

> `immediately=false` 면 period_end까지 사용 가능, 자동 다운그레이드.

### 4.6 결제 이력
```
GET /billing/invoices?page=0&size=20
```

### 4.7 Stripe Webhook
```
POST /webhook/stripe
Stripe-Signature: ...
```
**처리 이벤트**:
- `customer.subscription.created/updated/deleted`
- `invoice.paid/payment_failed`
- `customer.subscription.trial_will_end`

> 모든 webhook은 멱등 처리 (`event.id` PK).

---

## 5. 사용자 데이터 권리 (GDPR/CCPA)

### 5.1 데이터 내보내기 요청
```
POST /me/data-export
```
**Request**:
```json
{ "format": "obsidian-zip", "scope": "all" }
```
**format**: `obsidian-zip` / `anki-apkg` / `json`
**scope**: `all` / `notes_only` / `cards_only`

**Response 202**:
```json
{
  "success": true,
  "data": {
    "jobId": "01942100-...",
    "status": "pending",
    "estimatedCompletionAt": "2026-04-30T13:05:00Z"
  }
}
```

### 5.2 내보내기 상태
```
GET /me/data-export/{jobId}
```
**Response 200** (완료):
```json
{
  "success": true,
  "data": {
    "jobId": "01942100-...",
    "status": "completed",
    "downloadUrl": "https://...signed-url...",
    "expiresAt": "2026-05-01T13:00:00Z",
    "sizeBytes": 12345678
  }
}
```

### 5.3 내보내기 이력
```
GET /me/data-export
```

### 5.4 계정 삭제 요청
```
DELETE /me/account
```
**Request**:
```json
{
  "confirmEmail": "user@example.com",
  "password": "...",
  "reason": "..."
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "scheduledDeletionAt": "2026-05-30T13:00:00Z",
    "gracePeriodDays": 30,
    "cancelInstructions": "30일 이내 로그인 시 자동 취소"
  }
}
```

### 5.5 삭제 취소 (grace period 내)
```
POST /me/account/restore
```

---

## 6. 노트 (Note Service)

### 6.1 노트 생성
```
POST /notes
```
**Request**:
```json
{
  "title": "Spring Boot 트랜잭션",
  "contentMd": "# 트랜잭션\n\n[[JPA]]를 사용할 때...",
  "tags": ["spring", "transaction"],
  "metadata": { "icon": "📘" }
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "01941d12-...",
    "tenantId": "01941a00-...",
    "title": "Spring Boot 트랜잭션",
    "contentMd": "...",
    "tags": [...],
    "isPinned": false,
    "wordCount": 42,
    "metadata": {...},
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**한도 체크**: 사전에 `usage_counters.notes_count + 1 <= max_notes` 검증. 초과 시 `429 QUOTA_EXCEEDED`.

### 6.2 노트 목록
```
GET /notes?page=0&size=20&sort=updatedAt,desc&tag=spring&pinned=true&q=...
```

### 6.3 노트 상세
```
GET /notes/{noteId}
```

### 6.4 노트 수정
```
PATCH /notes/{noteId}
```

### 6.5 노트 삭제 (Soft)
```
DELETE /notes/{noteId}
```

### 6.6 노트 복원
```
POST /notes/{noteId}/restore
```

### 6.7 휴지통
```
GET /notes/trash
DELETE /notes/trash/empty
```

### 6.8 백링크
```
GET /notes/{noteId}/backlinks
```

### 6.9 outgoing 링크
```
GET /notes/{noteId}/links
```

### 6.10 버전 이력
```
GET /notes/{noteId}/versions
GET /notes/{noteId}/versions/{versionNo}
POST /notes/{noteId}/versions/{versionNo}/restore
```

### 6.11 첨부파일
```
POST /notes/{noteId}/attachments  (multipart/form-data)
DELETE /notes/{noteId}/attachments/{attachmentId}
```

### 6.12 노트 검색

```
GET /notes/search?q=트랜잭션&page=0&size=20
```

| Phase | 검색 엔진 | 매치 타입 |
|-------|-----------|----------|
| Phase 1 | `pg_trgm` | `title_keyword`, `body_keyword` |
| Phase 2 | + Elasticsearch nori | + `title_exact`, `body_phrase` |
| Phase 3 | + pgvector RRF | + `semantic` |
| Phase 5 | + 그래프 거리 | + `graph_proximity` |

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "noteId": "...",
      "title": "Spring Boot <em>트랜잭션</em>",
      "highlight": "...스프링 부트의 <em>트랜잭션</em> 관리...",
      "score": 4.27,
      "matchReasons": [
        { "type": "title_exact", "weight": 0.45, "detail": "제목 정확 일치" },
        { "type": "body_phrase", "weight": 0.32, "detail": "본문 5회" }
      ]
    }
  ],
  "pagination": {...}
}
```

> **모든 검색 응답은 `matchReasons` 필수.** 사용자가 결과를 신뢰할 수 있게 함.

---

## 7. 태그 / 북마크

### 7.1 태그
```
GET /tags
POST /tags
PATCH /tags/{tagId}
DELETE /tags/{tagId}
GET /tags/{tagId}/notes
```

### 7.2 북마크
```
GET /bookmarks
POST /bookmarks  body: { "noteId": "..." }
DELETE /bookmarks/{noteId}
```

---

## 8. 카드 덱 / 카드

### 8.1 덱
```
GET /decks
POST /decks
GET /decks/{deckId}
PATCH /decks/{deckId}
DELETE /decks/{deckId}?cardAction=move&targetDeckId=...
```

### 8.2 카드 생성
```
POST /cards
```
**Request**:
```json
{
  "deckId": "...",
  "sourceType": "NOTE",
  "sourceId": "01941d12-...",
  "cardType": "qa",
  "front": "...",
  "back": "...",
  "bloomLevel": "remember"
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "tenantId": "...",
    "deckId": "...",
    "sourceType": "NOTE",
    "sourceId": "...",
    "srsAlgorithm": "SM2",
    "srsState": {
      "easeFactor": 2.5,
      "intervalDays": 0,
      "repetitions": 0,
      "lapses": 0
    },
    "state": "new",
    "nextReviewAt": "...",
    /* ... */
  }
}
```

### 8.3 카드 목록
```
GET /cards?deckId=...&sourceType=NOTE&state=review&bloomLevel=apply
```

### 8.4 카드 CRUD
```
GET /cards/{cardId}
PATCH /cards/{cardId}
DELETE /cards/{cardId}
POST /cards/{cardId}/suspend
POST /cards/{cardId}/resume
```

### 8.5 카드 일괄
```
POST /cards/batch/move      body: { cardIds: [], targetDeckId: "..." }
POST /cards/batch/delete    body: { cardIds: [] }
POST /cards/batch/suspend   body: { cardIds: [] }
```

---

## 9. SRS / 복습

### 9.1 복습 큐
```
GET /reviews/queue?deckId=...&limit=50
```
**Response 200**:
```json
{
  "success": true,
  "data": {
    "queue": [
      {
        "cardId": "...",
        "front": "...",
        "back": "...",
        "cardType": "qa",
        "state": "review",
        "srsAlgorithm": "SM2",
        "srsState": {...},
        "sourceType": "NOTE",
        "sourceId": "...",
        "sourceTitle": "Spring Boot 트랜잭션"
      }
    ],
    "summary": {
      "newCards": 5,
      "learningCards": 2,
      "reviewCards": 28,
      "totalDue": 35
    }
  }
}
```

### 9.2 복습 세션 시작
```
POST /reviews/sessions
```
**Request**: `{ "deckIds": [...], "device": "mobile" }`

### 9.3 카드 응답 제출
```
POST /reviews/sessions/{sessionId}/submit
Idempotency-Key: <uuid>
```
**Request**:
```json
{
  "cardId": "...",
  "quality": 4,
  "elapsedMs": 3200
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "cardId": "...",
    "quality": 4,
    "srsAlgorithm": "SM2",
    "previous": {
      "state": "review",
      "srsState": { "easeFactor": 2.6, "intervalDays": 7, "repetitions": 3, "lapses": 0 }
    },
    "updated": {
      "state": "review",
      "srsState": { "easeFactor": 2.65, "intervalDays": 18, "repetitions": 4, "lapses": 0 },
      "nextReviewAt": "2026-05-18T..."
    },
    "sessionProgress": {
      "completed": 12,
      "remaining": 23,
      "correctRate": 0.83
    }
  }
}
```

### 9.4 세션 종료
```
POST /reviews/sessions/{sessionId}/end
```

### 9.5 복습 이력
```
GET /cards/{cardId}/reviews
GET /reviews/sessions?from=...&to=...
```

---

## 10. 그래프 (Graph Service)

> Phase 표시: 🟢 P2 (백링크) / 🟡 P5 (PageRank·클러스터)

### 10.1 🟢 사용자 전체 그래프
```
GET /graph?depth=2&minDegree=1&limit=200
```
**Response 200**:
```json
{
  "success": true,
  "data": {
    "nodes": [...],
    "edges": [...],
    "stats": {
      "totalNodes": 142,
      "totalEdges": 387,
      "isolatedNodes": 12,
      "truncated": false
    }
  }
}
```

### 10.2 🟢 노트 중심 부분 그래프
```
GET /graph/notes/{noteId}/neighborhood?depth=2
```

### 10.3 🟡 클러스터
```
GET /graph/clusters
```

### 10.4 🟡 PageRank 핵심 노트
```
GET /graph/important?limit=20
```

### 10.5 🟡 학습 약점 영역
```
GET /graph/weak-areas?threshold=0.5
```

---

## 11. AI / RAG (AI Service)

> 모든 AI 엔드포인트는 사용량 한도 체크 + LLM usage 기록 + Semantic Cache 적용

### 11.1 카드 자동 생성 제안
```
POST /ai/cards/generate
Idempotency-Key: <uuid>
```
**Request**:
```json
{
  "noteId": "...",
  "selectionText": null,
  "options": {
    "cardTypes": ["qa", "cloze"],
    "maxCards": 10,
    "bloomLevels": ["remember", "understand"],
    "language": "ko"
  }
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "noteId": "...",
    "suggestions": [
      {
        "cardType": "qa",
        "front": "...",
        "back": "...",
        "bloomLevel": "remember",
        "sourceContext": "...",
        "confidence": 0.92
      }
    ],
    "model": "claude-sonnet-4-6",
    "tokensUsed": 1247,
    "costUsd": 0.012,
    "cacheHit": false
  }
}
```

### 11.2 카드 제안 수락
```
POST /ai/cards/generate/accept
```

### 11.3 시맨틱 검색
```
POST /ai/search/semantic
```

### 11.4 하이브리드 검색
```
POST /ai/search/hybrid
```
**Request**:
```json
{
  "query": "스프링 동시성",
  "weights": { "keyword": 0.3, "semantic": 0.5, "graph": 0.2 },
  "topK": 20,
  "explain": true
}
```

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "noteId": "...",
      "title": "...",
      "score": 0.71,
      "scoreBreakdown": {
        "keyword": 0.65,
        "semantic": 0.89,
        "graph": 0.42,
        "fusionMethod": "RRF",
        "rrfK": 60
      },
      "matchReasons": [...]
    }
  ]
}
```

### 11.5 유사 노트
```
GET /ai/notes/{noteId}/similar?topK=10
```

### 11.6 RAG Q&A (스트리밍)
```
POST /ai/qa
Accept: text/event-stream
```
**Request**:
```json
{
  "question": "JPA에서 N+1 문제는 어떻게 해결?",
  "scope": "all",
  "maxContextNotes": 5,
  "stream": true
}
```

**Response 200** (SSE 스트림):
```
event: token
data: {"token":"JPA의 "}

event: token
data: {"token":"N+1 문제는 "}

event: citations
data: [{"noteId":"...","title":"...","similarity":0.91}]

event: done
data: {"model":"claude-sonnet-4-6","tokensUsed":2387,"costUsd":0.018,"cacheHit":false}
```

### 11.7 노트 요약
```
POST /ai/notes/{noteId}/summarize
```

### 11.8 위키링크 자동 제안
```
POST /ai/notes/{noteId}/suggest-links
```

### 11.9 LLM 응답 피드백
```
POST /ai/feedback
```
**Request**:
```json
{
  "usageLogId": 12345,
  "rating": 1,
  "comment": "유용했음"
}
```

### 11.10 캐시 통계 (admin only)
```
GET /ai/cache/stats
```

### 11.11 임베딩 재생성 트리거
```
POST /ai/notes/{noteId}/reembed
```

---

## 12. 통계 / 대시보드

### 12.1 학습 대시보드
```
GET /stats/dashboard
```
**Response 200**:
```json
{
  "success": true,
  "data": {
    "today": {
      "newCardsLearned": 12,
      "reviewsCompleted": 35,
      "accuracy": 0.83,
      "studyTimeSec": 1420
    },
    "totals": {
      "totalNotes": 142,
      "totalCards": 387,
      "totalReviews": 5421,
      "averageAccuracy": 0.78
    },
    "streak": { "current": 14, "longest": 42 },
    "dueToday": { "newCards": 8, "reviewCards": 27, "total": 35 }
  }
}
```

### 12.2 학습 캘린더 (히트맵)
```
GET /stats/calendar?from=2026-01-01&to=2026-04-30
```

### 12.3 시간대별 패턴
```
GET /stats/heatmap/hourly
```

### 12.4 Bloom 분포
```
GET /stats/bloom-distribution?deckId=...
```

### 12.5 노트별 메트릭
```
GET /stats/notes/{noteId}
```

---

## 13. 가져오기 / 내보내기

### 13.1 Markdown 임포트
```
POST /import/markdown    (multipart)
```

### 13.2 Anki APKG 임포트
```
POST /import/anki        (multipart)
```

### 13.3 Notion / Obsidian 임포트
```
POST /import/notion
POST /import/obsidian
```

### 13.4 노트 내보내기
```
GET /export/notes?format=markdown&tag=spring
```

### 13.5 카드 내보내기
```
GET /export/cards?deckId=...&format=csv
```

> 전체 백업은 §5.1 `/me/data-export` 사용

---

## 14. 시스템 / 헬스

### 14.1 헬스체크
```
GET /actuator/health
```

### 14.2 메트릭
```
GET /actuator/prometheus
```

---

## 15. 이벤트 / 실시간 통신

### 15.1 표준 이벤트 봉투
모든 도메인 이벤트는 동일 봉투 사용.
```json
{
  "eventId": "01941d12-...",
  "eventType": "NoteCreated",
  "schemaVersion": 1,
  "occurredAt": "2026-04-30T...",
  "tenantId": "...",
  "userId": "...",
  "traceId": "...",
  "payload": {...}
}
```

### 15.2 이벤트 카탈로그

| eventType | schemaVersion | payload 핵심 |
|-----------|---------------|--------------|
| `NoteCreated` | 1 | `noteId`, `title`, `contentMd`, `tags` |
| `NoteUpdated` | 1 | `noteId`, `changedFields[]` |
| `NoteRenamed` | 1 | `noteId`, `oldTitle`, `newTitle` |
| `NoteDeleted` | 1 | `noteId`, `softDelete` |
| `CardCreated` | 1 | `cardId`, `deckId`, `sourceType`, `sourceId` |
| `CardReviewed` | 1 | `cardId`, `quality`, `srsAlgorithm`, `prev/newSrsState` |
| `LLMCalled` | 1 | `operation`, `model`, `tokens`, `costUsd`, `cacheHit` |
| `SubscriptionChanged` | 1 | `oldPlan`, `newPlan`, `effectiveAt` |
| `UserSignedUp` | 1 | `userId`, `email`, `tenantId` |

### 15.3 그래프 변경 SSE
```
GET /events/graph/stream
Accept: text/event-stream
```

### 15.4 복습 세션 동기화 (다중 디바이스)
```
WS /ws/reviews
```

### 15.5 알림 SSE
```
GET /events/notifications/stream
```

---

## 16. 관리자 (Admin) API

> Synapse 운영팀 전용. JWT에 `admin` 역할 필요.

### 16.1 테넌트 관리
```
GET /admin/tenants?status=active&plan=pro
GET /admin/tenants/{tenantId}
POST /admin/tenants/{tenantId}/suspend
POST /admin/tenants/{tenantId}/restore
```

### 16.2 사용자 관리
```
GET /admin/users?email=...
POST /admin/users/{userId}/force-logout
POST /admin/users/{userId}/reset-password
```

### 16.3 LLM 사용량 모니터
```
GET /admin/llm-usage?tenantId=...&from=...&to=...
GET /admin/llm-usage/anomalies        ← 비정상 폭주 감지
```

### 16.4 시스템 헬스
```
GET /admin/health/all
GET /admin/metrics/business        ← MAU, MRR, churn 등
```

### 16.5 Feature Flag
```
GET /admin/feature-flags
PATCH /admin/feature-flags/{flagKey}
```

---

## 17. 감사 로그

### 17.1 테넌트 감사 로그 조회 (admin/owner only, Enterprise)
```
GET /audit-logs?from=...&to=...&action=note.delete
```

### 17.2 단일 로그 상세
```
GET /audit-logs/{logId}
```

---

## 18. 분석 (Analytics)

### 18.1 클라이언트 이벤트 수집
```
POST /analytics/event
```
**Request**:
```json
{
  "event": "card_generated_by_ai",
  "properties": { "deckId": "...", "modelUsed": "claude-haiku" }
}
```
> PostHog/Mixpanel SDK 직접 사용 가능. 본 엔드포인트는 서버 측 추가 검증/익명화용.

### 18.2 테넌트 사용 분석 (owner only)
```
GET /analytics/dashboard?period=last_30_days
```

---

## 19. 도메인별 에러 코드 모음

### Auth
| 코드 | HTTP |
|------|------|
| `EMAIL_ALREADY_EXISTS` | 409 |
| `USERNAME_ALREADY_EXISTS` | 409 |
| `INVALID_CREDENTIALS` | 401 |
| `WEAK_PASSWORD` | 400 |
| `EMAIL_NOT_VERIFIED` | 403 |
| `MFA_REQUIRED` | 401 |
| `INVALID_MFA_CODE` | 401 |
| `ACCOUNT_LOCKED` | 423 |
| `OAUTH_PROVIDER_ERROR` | 502 |

### Tenant
| 코드 | HTTP |
|------|------|
| `TENANT_NOT_FOUND` | 404 |
| `TENANT_ACCESS_DENIED` | 403 |
| `TENANT_SUSPENDED` | 403 |
| `MEMBER_NOT_FOUND` | 404 |
| `OWNER_CANNOT_LEAVE` | 422 |

### Billing
| 코드 | HTTP |
|------|------|
| `STRIPE_API_ERROR` | 502 |
| `INVALID_PLAN` | 400 |
| `SUBSCRIPTION_NOT_FOUND` | 404 |
| `PAYMENT_REQUIRED` | 402 |
| `WEBHOOK_SIGNATURE_INVALID` | 400 |

### Quota
| 코드 | HTTP |
|------|------|
| `QUOTA_EXCEEDED` | 429 |
| `PLAN_FEATURE_LOCKED` | 402 |

### Note
| 코드 | HTTP |
|------|------|
| `NOTE_NOT_FOUND` | 404 |
| `NOTE_TITLE_DUPLICATED` | 409 |
| `NOTE_DELETED` | 410 |
| `ATTACHMENT_TOO_LARGE` | 413 |

### Card / SRS
| 코드 | HTTP |
|------|------|
| `CARD_NOT_FOUND` | 404 |
| `DECK_NOT_FOUND` | 404 |
| `INVALID_CARD_TYPE` | 400 |
| `CARD_SUSPENDED` | 422 |
| `INVALID_QUALITY_VALUE` | 400 |
| `SESSION_ALREADY_ENDED` | 409 |

### AI
| 코드 | HTTP |
|------|------|
| `LLM_PROVIDER_ERROR` | 502 |
| `LLM_RATE_LIMIT` | 429 |
| `EMBEDDING_FAILED` | 502 |
| `CONTEXT_TOO_LARGE` | 413 |
| `GUARDRAIL_VIOLATION` | 422 |

---

## 20. API 버전 관리

- 모든 엔드포인트는 `/api/v1` prefix
- Breaking change 시 `/api/v2` 신설, v1은 6개월 deprecated
- Deprecation 헤더:
```http
Deprecation: true
Sunset: Wed, 01 Oct 2026 00:00:00 GMT
Link: <https://api.synapse.app/api/v2/notes>; rel="successor-version"
```

---

## 21. OpenAPI / Swagger

- 스펙: `https://api.synapse.app/api/v1/openapi.json`
- Swagger UI: `https://api.synapse.app/swagger-ui.html`
- 각 서비스(Auth, Note, Card, Graph, AI, Billing) 별 OpenAPI → 게이트웨이에서 통합

---

## 22. 다음 단계

1. OpenAPI 3.0 YAML 작성 (자동 생성 + 수동 보강)
2. Postman Collection
3. Spring Boot 컨트롤러 스캐폴딩 (springdoc-openapi)
4. Flutter chopper/retrofit 클라이언트 코드 자동 생성
5. SDK 패키지 (TypeScript / Python / Dart)

---

**문서 버전**: v2.0
**최종 수정**: 2026-04-30
**v1.2 → v2.0 주요 변경**:
- 포트폴리오/상용화 분리 → **상용 SaaS 단일 트랙** 통합
- §1.2 인증을 httpOnly Cookie 우선으로 변경
- §1.7 Idempotency-Key 도입 (POST 멱등성)
- §2 OAuth + MFA 흐름 표준화
- §3 테넌트 멤버십 + 멤버 초대/관리
- §4 빌링/Stripe 통합 (Checkout, Portal, Webhook)
- §5 GDPR 데이터 권리 API
- §11 LLM API에 한도/캐시/스트리밍 통합
- §16 Admin API
- §17 감사 로그 API (Enterprise)
- §18 분석 API
- 도메인별 에러 코드 대폭 확장
