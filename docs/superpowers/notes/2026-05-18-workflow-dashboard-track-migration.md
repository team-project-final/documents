# Workflow Dashboard 트랙 변경 기록

> **작업일**: 2026-05-18
> **커밋**: `b15cfb9` (workflow-dashboard 레포)

---

## 변경 요약

- `synapse-gitops` 트랙명을 `gitops` → `team-lead`로, 담당자를 `velka` → `김민구`로 변경
- `synapse-shared` 레포를 대시보드 관리 대상에서 완전히 제거
- TrackCard 컴포넌트의 표시명을 레포명 기반에서 트랙명 기반으로 변경

## 변경 전후

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 관리 레포 수 | 7개 | 6개 |
| 트랙 수 | 8개 | 7개 |
| synapse-shared | team-lead / 김민구 | **제거** |
| synapse-gitops | gitops / velka | team-lead / 김민구 |
| 카드 표시명 | 레포명 (`synapse-` 제거) | 트랙명 |

## 변경 파일 목록 (9개)

| 파일 | 변경 내용 |
|------|----------|
| `src/hooks/useData.ts` | DEFAULT_TRACKS에서 synapse-shared 제거, synapse-gitops 트랙/owner 변경 |
| `src/components/TrackCard.tsx` | 카드 표시명을 `repoData.repo.replace('synapse-', '')` → `trackName`으로 변경 |
| `scripts/validate-data.mjs` | EXPECTED_REPOS에서 synapse-shared 제거, synapse-gitops 트랙 변경 |
| `scripts/generate-sample-data.mjs` | synapse-shared → synapse-gitops로 교체 |
| `scripts/parse-prd.mjs` | synapse-shared 프리픽스 제거, synapse-gitops `FR-GO` → `FR-TL` |
| `scripts/parse-workflow.mjs` | ownerMap에서 `gitops: velka` 항목 제거 |
| `data/synapse-gitops.json` | 트랙명 `team-lead`, owner `김민구` (진행 데이터 보존) |
| `data/synapse-shared.json` | 파일 삭제 |
| `README.md` | synapse-shared → synapse-gitops 반영 |

## 최종 관리 대상 레포

| # | 레포 | 트랙 | 담당자 |
|---|------|------|--------|
| 1 | synapse-platform-svc | platform | 김해준 |
| 2 | synapse-engagement-svc | engagement | 한승완 |
| 3 | synapse-knowledge-svc | knowledge-1, knowledge-2 | 김현지, 박은서 |
| 4 | synapse-learning-svc | learning-card, learning-ai | 조유지, 김나경 |
| 5 | synapse-frontend | frontend | 전원 |
| 6 | synapse-gitops | team-lead | 김민구 |
