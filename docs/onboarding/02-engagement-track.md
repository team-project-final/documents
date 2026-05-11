# 02 — 트랙 B: Engagement 합류 가이드

> **트랙 mention**: `@engagement-owner` (1명)
> **담당 레포**: `synapse-engagement-svc`
> **담당 도메인**: community · gamification (Spring Modulith 2 모듈)
> **소요**: Day 1 트랙 작업 ~3시간

---

## Day 1 트랙별 흐름

```
0. 환경 점검 (10분)
1. 레포 클론 + 로컬 빌드 (20분)
2. 위키 트랙 정독 (40분)
3. SECRETS.md 확인 (10분 — 외부 SaaS 의존 적음)
4. 첫 비즈니스 PR (90분)
```

트랙 B는 외부 SaaS 의존이 작아 Day 1 첫 PR이 가장 빠르게 비즈니스 로직으로 들어갑니다. CRUD + Kafka 이벤트 소비가 주류.

---

## 1. 환경 점검 (10분)

```bash
java --version         # Temurin 21.0.x
./gradlew --version    # Gradle 8.10+
docker --version       # 24.x+
```

Redis가 트랙 B의 핵심 의존성(리더보드 Sorted Set 캐시). Docker Compose로 띄울 예정 (10 환경 설정 §3 참조).

---

## 2. 레포 클론 + 로컬 빌드 (20분)

```bash
cd D:/workspace/synapse
gh repo clone team-project-final/synapse-engagement-svc
gh repo clone team-project-final/synapse-shared    # Avro 이벤트 스키마 참조

cd synapse-engagement-svc
./gradlew clean build --no-daemon
```

기대 출력: `BUILD SUCCESSFUL` + `ModuleStructureTest > verifiesModuleStructure() PASSED` (community/gamification 2 모듈 + shared).

```bash
./gradlew bootRun
curl http://localhost:8082/actuator/health
# > {"status":"UP"}
```

---

## 3. 위키 트랙 정독 (40분)

| 문서 | 자기 영역 |
|---|---|
| **02 ERD 문서** §2.2.7 | 커뮤니티 도메인 (study_groups / shared_decks / shared_notes / reports / shared_deck_ratings / deck_copies) |
| **02 ERD 문서** §2.2.8 | 게이미피케이션 도메인 (user_profiles_gamification / xp_events / badges / user_badges / level_definitions / leaderboards / leaderboard_entries) |
| **04 API 명세서** §4.15 (Community) / §4.16 (Gamification) | 트랙 B 책임 엔드포인트 |
| **05 화면 흐름 시퀀스** §5.9~5.11 (덱 공유+복사 / 그룹 생성+가입 / XP+레벨업) | 도메인 시나리오 |
| **07 요구사항** §2.9 (COMM) / §2.10 (GAME) | FR-COMM-001~008, FR-GAME-001~006 |
| **18 기술 스택** §4.3 (Redis Sorted Set 리더보드) | 리더보드 캐시 전략 |

핵심 결정사항:
- **idempotency**: XP 적립은 Kafka 이벤트 소비라 중복 방지 필수. `processed_events` 테이블 사용 (ERD §2.2.6).
- **share_token**: 12-char base62, `share_type=link`일 때만 발급. ERD §2.2.7.
- **신고 rate limit**: 동일 target 중복 X + 사용자당 일 10건. FR-COMM-007.
- **리더보드 스코프**: `global`도 테넌트 내 (RLS 정책 준수). ERD §2.2.8 주의 박스.

---

## 4. SECRETS.md 확인 (10분)

```bash
cat docs/SECRETS.md
```

트랙 B는 외부 SaaS 의존이 작습니다:
- `ECR_REGISTRY` (deploy.yml 공통) — `@team-lead` 책임 (W2+ 인프라 셋업)
- 다른 외부 secrets 없음

다만 트랙 B의 Kafka consumer는 `learning-card` 서비스의 internal API(`POST /internal/decks/copy`)를 호출하므로, W2 이후 learning-card가 떴을 때 그쪽 URL이 환경변수로 들어와야 함:
```bash
# K8s ConfigMap (gitops 레포 → @team-lead 작업)
LEARNING_CARD_INTERNAL_URL=http://synapse-learning-card.synapse-dev.svc.cluster.local:8084/internal
```

W1 시점엔 이 변수가 없어도 community.deck.shared 발행 + Kafka 토픽까지만 동작하면 됨.

---

## 5. 첫 비즈니스 PR (90분) — community 모듈 스터디 그룹 CRUD

placeholder를 실제 그룹 CRUD로 교체합니다.

### 5.1 브랜치

```bash
cd synapse-engagement-svc
git checkout -b feature/ENG-002-study-group-crud
```

### 5.2 구현 범위

| 파일 | 변경 |
|---|---|
| `src/main/java/com/synapse/engagement/community/StudyGroup.java` (Create) | JPA Entity + @TenantId |
| `src/main/java/com/synapse/engagement/community/StudyGroupRepository.java` (Create) | JpaRepository |
| `src/main/java/com/synapse/engagement/community/StudyGroupService.java` (Create) | 비즈니스 로직 |
| `src/main/java/com/synapse/engagement/community/StudyGroupController.java` (Create) | POST/GET/PATCH/DELETE `/api/v1/community/groups` |
| `src/main/java/com/synapse/engagement/community/CommunityPlaceholderComponent.java` (Delete) | placeholder 제거 |
| `src/test/java/com/synapse/engagement/community/StudyGroupServiceTest.java` (Create) | TDD |
| `src/test/java/com/synapse/engagement/community/RlsIsolationTest.java` (Create) | RLS 격리 |

04 API 명세서 §4.15 그룹 CRUD 7개 엔드포인트 중 `POST/GET/PATCH/DELETE`만 W1 첫 PR. 가입/멤버 관리/초대/신고는 W2~W3.

### 5.3 PR

```bash
git push -u origin feature/ENG-002-study-group-crud
gh pr create --fill
```

PR 본문 — 영향 받는 다른 서비스 체크박스에서 "(영향 없음)"으로 표시.

---

## 6. W1~W5 트랙 B 일정 (17 스케줄 v3.0)

| 주차 | 트랙 B 작업 |
|---|---|
| **W1** (5/12~15) | engagement-svc 골격 + community 모듈 (그룹 CRUD + 멤버 관리) |
| **W2** (5/18~22) | gamification XP 기초 + xp_events + community 공유 (덱·노트 share_token + 공유 콘텐츠 검색) |
| **W3** (5/26~29) | gamification 완성 (배지 · 레벨 · 스트릭 · 리더보드) + `gamification.level_up` / `badge_earned` Kafka 발행 |
| **W4** (6/1~5) | community 신고 처리 + Admin 모더레이션 API |
| **W5** (6/8~12) | 게이미피케이션/공유 E2E + P0 버그 |

W3가 가장 무거운 주차 — 배지 criteria_json 평가 + 스트릭 daily Cron + 리더보드 weekly/monthly Cron + Kafka 발행이 한꺼번에 들어옴. W2 끝에 미리 Cron job 골격 + Redis ZADD/ZREVRANGE 검증 필요.

---

## 7. 도메인 깊이 학습 자료

- **Spring Modulith 이벤트 패턴**: https://docs.spring.io/spring-modulith/reference/events.html
- **Redis Sorted Set 리더보드**: https://redis.io/learn/develop/java/spring/rate-limiting/fixed-window/leaderboards
- **Kafka idempotency + processed_events 패턴**: 09 §B4 + ERD §2.2.6
- **CloudEvents 1.0 envelope**: https://github.com/cloudevents/spec — 모든 Kafka 발행이 따라야 함
- **Cron job in K8s**: `CronJob` resource — 11 테스트 전략 §7.5 community/gamification 테스트 범위 참조

---

## 8. 트랙 B FAQ

**Q1. community 모듈에서 learning-card 서비스의 internal API를 호출해도 되나?**
> 네. 09 §3.4 신규 토픽 표 마지막 — `POST /internal/decks/copy`. 다른 서비스의 internal API 호출은 외부 노출 안 된 시스템 간 통신이라 OK. 다만 Gateway 우회라 Istio mTLS는 강제.

**Q2. 동일 노트/덱을 두 번 공유하면 중복 share_token이 발급되나?**
> 04 API §4.15 POST /community/shared-decks는 idempotent하지 않음. 같은 (deck_id, share_type, target_group_id) 조합이 이미 active면 409 Conflict 반환 권장. 04 API §6.4 NOTE_TITLE_DUPLICATED 같은 패턴.

**Q3. 신고 사용자당 일 10건 제한은 어디서 강제?**
> Service 레이어에서 `SELECT COUNT(*) FROM reports WHERE reporter_user_id = ? AND created_at::date = CURRENT_DATE`. 11 테스트 전략 §7.5 — "신고 API rate limit (10건/일) 검증" 필수.

**Q4. XP 보상표는 하드코딩? 아니면 DB?**
> ERD §2.2.8 + 04 API §4.13의 `/admin/gamification/xp-config`. 관리자가 변경 가능하도록 DB(또는 admin-managed config map)에 두는 게 권장. 다만 W1 첫 PR엔 enum + hardcoded 상수로 시작해도 됨.

**Q5. 리더보드 weekly/monthly Cron이 RLS 정책 위반 가능성?**
> Cron job은 시스템 사용자로 동작하므로 `app.current_tenant_id`를 각 테넌트별로 SET LOCAL 하면서 순회해야 함. 02 ERD §2.4 Tenant Context Propagation 참조. 02 ERD §2.2.8 주의 박스에 RLS 준수 명시.

---

## 9. 막혔을 때

| 상황 | 멘토 | 채널 |
|---|---|---|
| 일반 도메인 질문 | `@team-lead` | `#synapse-dev` |
| Redis Sorted Set 자료구조 | `@team-lead` | `#synapse-dev` |
| Kafka idempotency 패턴 | `@team-lead` 또는 `@platform-owner` (audit 모듈 같은 패턴) | `#synapse-dev` |
| 모더레이션 정책 | `@team-lead` | `#security` |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v1.0 | 2026-05-12 | 초안 — Engagement 트랙 합류 가이드 |
