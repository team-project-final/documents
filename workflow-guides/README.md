# workflow-guides/

Standalone HTML 워크플로 가이드. 이 폴더의 파일들은 자동으로
[workflow-guide 사이트](https://team-project-final.github.io/workflow-guide/)에 배포된다.

## 새 가이드 추가

1. 적절한 step 폴더에 HTML 파일 추가:
   - 위치: `workflow-guides/workflow-w{N}-step{M}-guide/`
   - 파일명: `{role}__{topic-kebab}-workflow-guide({한글이름 또는 '전체'}).html`
2. HTML `<title>` 필수, 형식: `WORKFLOW Guide - {한글 제목}`
3. standalone HTML 권장. `<style>` 안에 `body`/`header`/`main`/`footer` 셀렉터를 자유롭게
   사용해도 된다 (빌드가 `.guide-body`로 자동 스코프).

## Role 매핑표

| 파일명 prefix | 표시명 | 트랙 |
|---|---|---|
| `team-lead` | Team Lead | 인프라/Gateway |
| `platform-owner` | Platform | A |
| `engagement-owner` | Engagement | B |
| `knowledge-owner-1` | Knowledge-1 | C-1 |
| `knowledge-owner-2` | Knowledge-2 | C-2 |
| `learning-card-owner` | Learning Card | D-1 |
| `learning-ai-owner` | Learning AI | D-2 |
| `frontend-owner` | Frontend | 협업 |

## 로컬 검증

```bash
cd build
npm ci                # 최초 1회
npm run validate      # PR 전 빠른 검증
npm run build         # dist 생성
npm run preview       # http://localhost:3000 미리보기
npm test              # 단위 테스트
```

## PR 흐름

1. PR 열기 → CI(`Deploy workflow-guide site` Action)가 build + 검증 실행
2. PR check 녹색이면 머지 가능 (artifact `dist`도 첨부되어 다운로드로 미리보기 가능)
3. main 머지 → 자동 deploy (수 분 내 사이트 반영)

## 슬러그 충돌

같은 step 폴더 안에서 슬러그가 같으면 빌드가 fail한다. `topic-kebab` 부분에 구분어를
추가해서 해결 (예: `…-workflow-guide-v2`).

## 보조 문서 (deploy되지 않음)

- `w{N}-step{M}-guide-coverage-audit.md` — step별 가이드 커버리지 점검 문서
- 폴더 외부 다른 `.md` 파일들

## 자세한 설계

[docs/superpowers/specs/2026-05-13-workflow-guide-deploy-design.md](../docs/superpowers/specs/2026-05-13-workflow-guide-deploy-design.md)
