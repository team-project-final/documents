# 01 — 트랙 A: Platform 합류 가이드

> **트랙 mention**: `@platform-owner` (1명)
> **담당 레포**: `synapse-platform-svc`
> **담당 도메인**: auth · audit · billing · notification (Spring Modulith 4 모듈)
> **소요**: Day 1 트랙 작업 ~3시간 (Day 0 + 공통 완료 후)

---

## Day 1 트랙별 흐름

```
0. 환경 점검 (10분)         → Java 21 / Docker / IntelliJ 또는 VS Code
1. 레포 클론 + 로컬 빌드 (20분)
2. 위키 트랙 정독 (40분)     → 02 ERD · 04 API · 09 Git §A4
3. SECRETS.md 발급 절차 (30분)
4. 첫 비즈니스 PR (90분)    → 첫 모듈 placeholder를 실제 기능으로
```

---

## 1. 환경 점검 (10분)

```bash
java --version          # Temurin 21.0.x
./gradlew --version     # Gradle 8.10+ (wrapper)
docker --version        # 24.x+
```

미설치 시:
- Java 21: https://adoptium.net/temurin/releases/?version=21
- Docker Desktop: https://www.docker.com/products/docker-desktop/

IntelliJ IDEA 권장 (커뮤니티 에디션 OK). Spring Boot + Modulith 자동 인식.

---

## 2. 레포 클론 + 로컬 빌드 (20분)

```bash
cd D:/workspace/synapse        # 또는 ~/workspace/synapse
gh repo clone team-project-final/synapse-platform-svc
gh repo clone team-project-final/synapse-shared    # 아직 안 클론했다면

cd synapse-platform-svc
./gradlew clean build --no-daemon
```

기대 출력: `BUILD SUCCESSFUL` + `ModuleStructureTest > verifiesModuleStructure() PASSED`.

만약 Spring Boot 4가 milestone이거나 GA 출시 안 됐다면 `build.gradle.kts`의 `springBootVersion`이 `4.0.0-M3` 또는 `3.4.x`일 수 있습니다 (부트스트랩의 fallback chain, 스펙 §7.1 R2).

로컬 실행 확인:
```bash
./gradlew bootRun
# 다른 터미널:
curl http://localhost:8081/actuator/health
# > {"status":"UP"}
```

---

## 3. 위키 트랙 정독 (40분)

| 문서 | 자기 영역 |
|---|---|
| **02 ERD 문서** §2.2.1~3 | 테넌시/빌링 + 인증/사용자 + 노트 도메인 (auth/billing 모듈에서 사용) |
| **04 API 명세서** §4.2 (Auth) / §4.4 (Billing) / §4.17 (Notification) | 트랙 A 책임 엔드포인트 전체 |
| **09 Git 규칙 v2.0** §A4 | platform-svc CODEOWNERS — `/auth/` 보안 cross-review 필수 |
| **18 기술 스택** §4.5 | Auth + Billing + 컴플라이언스 (BCrypt cost 12, Stripe SAQ A) |
| **공통_개발_규칙.md** + **Spring_개발_컨벤션.md** | 본 가이드와 같은 레포 `docs/` |

위키 본문 외 짧은 메모:
- **§4.2.4 login Response**: `Set-Cookie: synapse_at=...` httpOnly + Secure + SameSite=Strict. JWT를 localStorage에 넣지 않는 의도 (XSS 방어).
- **§4.4.2 checkout**: Stripe Checkout Session 생성. 직접 결제 정보 받지 않음 → PCI-DSS SAQ A 자동 충족.
- **§4.17 Notification**: 카테고리별 push/email/in_app 토글. quiet_hours는 사용자 timezone 적용 필요.

---

## 4. SECRETS.md 발급 절차 (30분)

```bash
cd synapse-platform-svc
cat docs/SECRETS.md
```

W1 시점에 `⏳ pending` 상태인 secrets를 본인이 발급:

### 4.1 OAuth Providers

| Provider | 발급처 | 발급 후 secrets 등록 |
|---|---|---|
| Google | https://console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 Client ID (Web app) | `OAUTH_GOOGLE_CLIENT_ID`, `OAUTH_GOOGLE_CLIENT_SECRET` |
| GitHub | https://github.com/settings/developers → New OAuth App | `OAUTH_GITHUB_CLIENT_ID`, `OAUTH_GITHUB_CLIENT_SECRET` |
| Apple | https://developer.apple.com → Certificates, Identifiers & Profiles → Identifiers (Apple ID) | `OAUTH_APPLE_CLIENT_ID`, `OAUTH_APPLE_TEAM_ID`, `OAUTH_APPLE_KEY_ID` + .p8 file |
| Microsoft | https://portal.azure.com → App registrations | `OAUTH_MICROSOFT_CLIENT_ID`, `OAUTH_MICROSOFT_CLIENT_SECRET` |

각 Provider의 Redirect URI:
```
Local:   http://localhost:8081/api/v1/auth/oauth/{provider}/callback
Dev:     https://api-dev.synapse.app/api/v1/auth/oauth/{provider}/callback
Prod:    https://api.synapse.app/api/v1/auth/oauth/{provider}/callback
```

발급 후 secrets 등록:
```bash
gh secret set OAUTH_GOOGLE_CLIENT_ID --repo team-project-final/synapse-platform-svc
# stdin으로 값 붙여넣기 → Ctrl+D (또는 PowerShell: Enter 후 Ctrl+Z)
gh secret set OAUTH_GOOGLE_CLIENT_SECRET --repo team-project-final/synapse-platform-svc
```

### 4.2 Stripe (Test Mode 먼저)

1. https://dashboard.stripe.com → Test mode 활성화
2. Developers → API keys → Secret key 복사 (`sk_test_...`)
3. Developers → Webhooks → Add endpoint → `https://api-dev.synapse.app/webhook/stripe` → Signing secret 복사 (`whsec_...`)

```bash
gh secret set STRIPE_SECRET_KEY --repo team-project-final/synapse-platform-svc
gh secret set STRIPE_WEBHOOK_SECRET --repo team-project-final/synapse-platform-svc
```

> Live mode 키는 W4+ 운영 배포 시 별도 발급. Test mode로 시작.

### 4.3 FCM (W3에 진행, W1엔 skip 가능)

W1 첫주에는 notification 모듈이 활성화 안 되어 있을 수 있음. notification 모듈 작업이 시작되는 W3에 발급:
1. https://console.firebase.google.com → 새 프로젝트
2. Cloud Messaging → Server key 복사

### 4.4 SECRETS.md 인벤토리 갱신 PR

발급 후 `docs/SECRETS.md`의 `상태` 컬럼을 `⏳ pending` → `✅ 등록`으로 변경하는 PR:
```bash
git checkout -b feature/PLAT-002-secrets-oauth-stripe
# docs/SECRETS.md 편집
git add docs/SECRETS.md
git commit -m "docs(platform): update SECRETS.md inventory — OAuth + Stripe registered (PLAT-002)"
git push -u origin feature/PLAT-002-secrets-oauth-stripe
gh pr create --fill
```

---

## 5. 첫 비즈니스 PR (90분) — auth 모듈 OAuth Google

부트스트랩이 깔아둔 `auth/AuthPlaceholderComponent.java`를 실제 OAuth 진입점 + 콜백 핸들러로 교체합니다.

### 5.1 브랜치 + 작업 시작

```bash
cd synapse-platform-svc
git checkout main
git pull
git checkout -b feature/PLAT-003-oauth-google
```

### 5.2 구현 범위 (W1 첫 PR — 최소)

| 파일 | 변경 |
|---|---|
| `src/main/java/com/synapse/platform/auth/AuthController.java` (Create) | `GET /api/v1/auth/oauth/google` + `GET /callback/google` |
| `src/main/java/com/synapse/platform/auth/GoogleOAuthService.java` (Create) | id_token 검증 + user lookup/create |
| `src/main/java/com/synapse/platform/auth/AuthPlaceholderComponent.java` (Delete) | placeholder 제거 |
| `src/test/java/com/synapse/platform/auth/GoogleOAuthServiceTest.java` (Create) | TDD |
| `build.gradle.kts` | spring-security-oauth2-client 의존성 추가 |

자세한 구현은 04 API 명세서 §4.2 참조. 다음 시퀀스로 진행:
1. 실패하는 테스트 작성 (`should_returnRedirectUrl_when_googleOAuthInitiated`)
2. 테스트 실행 → fail 확인
3. AuthController + GoogleOAuthService 구현
4. 테스트 통과 확인
5. Modulith verify 통과 확인 (`./gradlew test --tests *ModuleStructureTest`)
6. PR 생성

### 5.3 PR 생성

PR 본문 템플릿(09 §A3):
```markdown
## 변경 사항
- auth 모듈에 OAuth Google login 진입점 + callback 핸들러 추가
- Spring Security OAuth2 client 통합
- AuthPlaceholderComponent 제거 (실제 기능으로 대체)

## 관련 이슈
Closes #1 (또는 GitHub Issue 번호)

## 영향 받는 다른 서비스
- [ ] platform-svc ← 본 PR
- [ ] 그 외: 영향 없음

## 이벤트/스키마 변경 여부
- [ ] (변경 없음)
- 다음 PR(PLAT-004)에서 `UserRegistered` Avro 이벤트 발행 예정

## 호환성 검증
- [x] (해당 없음)

## 미러링/GitOps 영향
- [x] 자동 미러링 정상
```

`@team-lead` + 자신(`@platform-owner`) 둘 다 self-approve할 수 없으므로 PR에 자기는 reviewer 지정 못 함. `@team-lead` 1명이 보안 cross-review.

---

## 6. W1~W5 트랙 A 일정 (17 스케줄 v3.0)

| 주차 | 트랙 A 작업 |
|---|---|
| **W1** (5/12~15) | platform-svc 골격 + auth 모듈 (OAuth + JWT + MFA 기초) |
| **W2** (5/18~22) | billing 모듈 (Stripe Checkout + Webhook + 플랜 관리) + notification 기초 (FCM 설정 + device_tokens) |
| **W3** (5/26~29) | (W2 잔무 마무리: FCM 디바이스 등록·테스트) |
| **W4** (6/1~5) | notification Kafka 소비 (`gamification.*` / `community.*` / `card.review.due`) + FCM 푸시 + SES 이메일 + audit Kafka 소비 → audit_logs 적재 (90일 보존) + 테넌트·사용자 관리 |
| **W5** (6/8~12) | 버그 수정 + 인증/결제 E2E |

W4가 가장 무거운 주차입니다 — notification consumer + audit consumer + admin API가 한꺼번에 들어옴. W2~W3에 미리 stub만 만들어 둬야 W4에 안전.

---

## 7. 도메인 깊이 학습 자료

- **Spring Modulith 공식**: https://docs.spring.io/spring-modulith/reference/
- **OAuth 2.1 보안 베스트 프랙티스**: RFC 9700 (OAuth 2.0 Security Best Current Practice)
- **Stripe 멱등성**: https://docs.stripe.com/api/idempotent_requests
- **PCI-DSS SAQ A 가이드**: Stripe Hosted Checkout 사용 시 자동 적용
- **JWT 저장**: httpOnly Cookie vs localStorage 비교 (스펙 §5.3)
- **FCM 인증**: HTTP v1 API (legacy server key는 deprecated)

---

## 8. 트랙 A FAQ

**Q1. auth 모듈에서 다른 모듈(billing)을 import해야 할 때?**
> Spring Modulith ArchUnit이 막습니다. 이벤트 publish로 통신: `events.publishEvent(new UserRegisteredEvent(...))` → billing의 `@ApplicationModuleListener`가 수신. Spring 컨벤션 §3.3 참조.

**Q2. Stripe Test mode와 Live mode를 어떻게 분리?**
> 다른 secret 이름: `STRIPE_SECRET_KEY_TEST` (dev/staging) vs `STRIPE_SECRET_KEY_LIVE` (prod). 또는 같은 이름이지만 환경별 overlay에서 다른 값. 17 스케줄 v3.0의 W4 staging 진입 시점에 결정.

**Q3. notification 모듈의 Kafka 소비는 W4부터인데, 그 전엔 stub만?**
> 네. W2~W3에는 `@KafkaListener`가 `notification.send` 토픽을 받기만 하고 로그만 출력. W4에 FCM/SES 실제 발송 구현.

**Q4. MFA TOTP secret을 DB에 저장할 때 평문이면 안 되겠죠?**
> ERD §4.3 `mfa_credentials.secret_encrypted`는 KMS 암호화 컬럼. PostgreSQL `pgcrypto` 확장 + AES-256-GCM. 스펙 §5.6 비밀 관리.

**Q5. 90일 audit_logs 보존을 어떻게 자동화?**
> ERD §8.1 audit_logs는 월별 RANGE 파티션. pg_partman cron 또는 자체 cron job으로 24개월 이전 partition을 S3 Glacier로 archive. 14 배포 가이드 §10 신규 모듈 추가 절차 참조.

---

## 9. 막혔을 때

| 상황 | 멘토 | 채널 |
|---|---|---|
| OAuth Provider 설정 안 됨 | `@team-lead` | `#synapse-dev` |
| Stripe Webhook 검증 실패 | `@team-lead` | `#devops` |
| Modulith verify 빨간색 | `@team-lead` 또는 `@knowledge-owner-1/2` (같은 패턴 경험) | `#synapse-dev` |
| 보안 결정 | `@team-lead` | `#security` (DM 권장) |
| 인프라(EKS/RDS) | `@team-lead` | `#devops` |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v1.0 | 2026-05-12 | 초안 — Platform 트랙 합류 가이드 |
