# Phase B Platform Frontend Handoff - 2026-06-21

> 목적: 다음 세션에서 Phase B frontend API 전환 작업을 바로 이어가기 위한 인수 문서.
> 기준 시각: 2026-06-21 KST
> 대상 레포: `synapse-frontend`, `documents`, `workflow-dashboard`, `synapse-gitops`

## 1. 이번 세션 완료

### PM/dashboard 정합화

- `workflow-dashboard`
  - `fb8aa9a fix: stabilize PM dashboard sync`
  - parser alias, `[~]` partial parsing, gitops live sync count drift를 정리했다.
- `synapse-frontend`
  - `58b839d docs: restore frontend W5 dashboard workflow`
  - `e2387d7 docs: align frontend workflow raw counts`
  - frontend workflow 문서 raw checkbox count가 dashboard JSON과 일치한다.
- `synapse-gitops`
  - `d9cfebb docs: update gitops PM sync status`
- `documents`
  - Phase F drift audit와 closeout follow-up을 기록했다.

### Phase B platform frontend API 전환

- `synapse-frontend`
  - `1585f0c docs: clarify frontend auth integration status`
  - `452f206 feat: connect password reset flow`
  - `f711466 feat: connect MFA backup codes`
  - `6ece90d feat: connect billing usage history`
  - `1f937fd feat: connect admin dashboard summary`
- `documents`
  - `aa9f995 docs: update phase B frontend status`
  - `5acbfaa docs: record password reset completion`
  - `d5c1396 docs: record MFA backup completion`
  - `51e8dbd docs: record billing API completion`
  - `df9854b docs: record notification API verification`
  - `0448540 docs: record admin summary completion`

## 2. 검증 증거

`synapse-frontend`에서 통과한 검증:

```text
flutter test test/services/platform/auth/platform_auth_api_test.dart test/services/platform/auth/auth_screens_test.dart
flutter test test/services/platform/auth/platform_auth_api_test.dart test/services/platform/auth/auth_screens_test.dart test/services/platform/settings/security_settings_mfa_test.dart
flutter test test/services/platform/billing/billing_api_test.dart test/services/platform/billing/billing_plans_screen_test.dart test/services/platform/billing_screens_render_test.dart
flutter test test/services/platform/notifications/notification_api_test.dart test/services/platform/notifications/notification_device_api_test.dart test/services/platform/notification_screens_render_test.dart
flutter test test/services/platform/admin/admin_api_test.dart test/services/platform/admin_screens_render_test.dart
flutter analyze
```

주의: Flutter/Dart 명령은 sandbox 안에서 timeout이 났고, 승인된 외부 실행에서는 정상 통과했다.

## 3. 남은 작업 우선순위

1. OAuth consent 화면
   - frontend에는 `OAuthConsentScreen` mock/TODO가 남아 있다.
   - 현재 `synapse-platform-svc`에서 `/oauth/consent/allow|deny` 엔드포인트는 확인되지 않았다.
   - 먼저 backend 계약을 만들거나 기존 OAuth2 consent contract를 찾아야 한다.

2. Admin report 화면
   - frontend `AdminReportScreen`은 `_mockReports` 기반이다.
   - 현재 `synapse-platform-svc`에서 신고 목록 API 계약은 확인되지 않았다.
   - engagement/moderation 쪽 실제 API 소유권 확인이 필요하다.

3. Knowledge feature API 전환
   - note CRUD, tag management, graph, search 화면의 `_mock*` 의존 제거.
   - `synapse-knowledge-svc` API 계약과 DTO mapping을 먼저 대조한다.

4. Learning feature API 전환
   - decks/cards/review/AI card generation 화면을 learning-card/learning-ai API와 연결.
   - demo identity는 `APP_ENV=demo`에서만 learning-ai direct client에 붙는다.

5. Engagement feature API 전환
   - community/shared decks/shared notes/gamification 화면 mock 제거.
   - admin report와 moderation API 소유권이 이 영역과 겹칠 가능성이 있다.

## 4. 건드리지 말아야 할 기존 dirty 파일

이번 세션에서는 아래 파일/폴더를 의도적으로 커밋하지 않았다.

- `synapse-frontend`
  - `.gitignore`
  - `pubspec.lock`
  - `.omc/`
- `documents`
  - `.gitignore`
  - `build/`
- `workflow-dashboard`
  - `.omc/`
- `synapse-gitops`
  - `.omc/`
  - `apply-W1.ps1`
  - `docs/.omc/`
  - `infra/aws/dev/.omc/`

다음 세션도 이 변경을 사용자/기존 작업으로 간주하고 임의로 되돌리지 않는다.

## 5. 다음 세션 시작 절차

1. `git status --short --branch`를 네 레포에서 확인한다.
2. 원격 push 상태를 확인한다.
3. `documents/docs/project-management/FINAL_REFACTOR_COMPLETION_PLAN.md`의 Phase B 섹션을 기준으로 남은 작업을 고른다.
4. backend 계약이 없는 항목(OAuth consent, admin report)은 frontend에서 임의 endpoint를 만들지 않는다.
5. 구현 후 focused test, `flutter analyze`, 계획서 업데이트, 커밋 순서로 닫는다.
