# 슬라이드별 발표 대본 + 실무자 Q&A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 콘텐츠 슬라이드 26장에 구어체 발표 대본 + 실무자 예상 Q&A(질문+모범답변)를 작성해 덱 화자노트(발표자 뷰)와 별도 MD 문서에 동시 반영한다.

**Architecture:** 단일 소스(파이썬 dict: slide_id → {script, qa[]})를 작성 → 생성기 스크립트가 (a) `report-deck.html`의 해당 `<aside class="speaker-notes">` innerHTML을 결정적으로 교체, (b) `발표대본_Q&A_SYNAPSE.md`를 생성. 화자노트는 innerHTML 렌더이므로 HTML 마크업(`<br>`·`<strong>`) 사용.

**Tech Stack:** Python 3 (`py -3.14`), HTML/정규식, gstack-browse(검증).

**참조:** 스펙 `documents/docs/superpowers/specs/2026-06-15-presentation-script-qa-design.md`. 렌더 근거: report-deck.html 6148행(notes-panel `notes.innerHTML`)·6266행(presNotes `e.data.notes` innerHTML).

**브랜치:** `docs/presentation-script-qa` (스펙 커밋 `4027274` 존재).

---

## File Structure

- **Create** `report-presentation/presentation_qa.py` — 단일 콘텐츠 소스. `CONTENT = { "slide-4": {"script": "...", "qa": [("Q","A"), ...]}, ... }` (26개 slide_id).
- **Create** `report-presentation/gen_presentation_qa.py` — 생성기. report-deck.html aside 교체 + MD 생성.
- **Modify** `documents/docs/final-deliverables/report-deck.html` — 26개 콘텐츠 슬라이드의 `<aside class="speaker-notes">` 내용 교체(섹션/표지 8개 미변경).
- **Create** `documents/docs/final-deliverables/발표대본_Q&A_SYNAPSE.md` — 인쇄·리허설용 통합 문서.

대상 콘텐츠 slide_id(26): slide-4,5,6,7,9,11,12,14,15,16,17,18,19,20,21,22,24,25,26,27,28,29,30,32,33,34.
제외(8): slide-1,2,3,8,10,13,23,31.

---

## Task 1: 단일 콘텐츠 소스 작성 (대본 + Q&A)

**Files:** Create `report-presentation/presentation_qa.py`

각 콘텐츠 슬라이드의 가시 불릿(report-deck.html 본문)과 스펙 §4 방향을 근거로 [대본](구어체 3~5문장)과 Q&A(3~5쌍, 시연영상 slide-22는 2~3쌍)를 작성한다. 답변은 슬라이드에 실제 있는 근거만 인용(SLA P1 79.7ms, JaCoCo 80%, rate-limit 1rps·burst 60, BACKWARD 호환 등). 슬라이드에 없는 수치 단정 금지.

- [ ] **Step 1: 파일 골격 + 완성 예시 1개(slide-15) 작성**

아래 형식·톤을 템플릿으로 삼는다(slide-15 ① 진입·계정, platform):
```python
# report-presentation/presentation_qa.py
# 콘텐츠 슬라이드 발표 대본 + 실무자 예상 Q&A 단일 소스.
CONTENT = {
    "slide-15": {
        "script": (
            "사용자가 처음 만나는 관문, platform입니다. "
            "OAuth와 JWT, MFA로 인증하고 Stripe로 결제하며, FCM·SES로 알림을 보냅니다. "
            "모든 행위는 감사 로그로 90일 보존되고요. "
            "가입 순간 user-registered 이벤트를 Transactional Outbox로 발행해, 뒤의 게이미피케이션이 프로필을 만듭니다."
        ),
        "qa": [
            ("게이트웨이에서 JWT를 검증하고 서비스로 신원을 전파하면, 서비스가 토큰을 재검증하지 않아 내부 위변조 위험은 없나요?",
             "게이트웨이가 엣지에서 JWT(RS256)를 검증하고 신원 헤더를 전파하며, 내부망은 신뢰 경계로 둡니다. 외부에서 서비스로 직접 접근하는 경로는 게이트웨이만 노출해 차단합니다. 더 엄격히 가려면 서비스 측 헤더 서명 검증을 추가하는 게 다음 단계입니다."),
            ("MFA는 필수인가요, 선택인가요? 미설정 사용자 UX는?",
             "TOTP 기반 MFA는 선택 제공이고, 설정 시 로그인에 2단계가 추가됩니다. 미설정 사용자는 OAuth/비밀번호로 진입하며, 보안 등급이 필요한 테넌트는 정책으로 강제할 수 있도록 설계했습니다."),
            ("Stripe 결제에서 webhook 위조나 중복 처리는 어떻게 막나요?",
             "결제 확정은 Stripe webhook만 신뢰하고 해당 엔드포인트만 공개, 나머지는 인증을 강제합니다. 이벤트는 멱등 처리해 중복 수신에도 구독 상태가 한 번만 반영되도록 했습니다."),
            ("user-registered를 Outbox로 발행하는 이유는? 그냥 동기 호출이 더 단순하지 않나요?",
             "가입 트랜잭션과 이벤트 발행을 같은 DB 트랜잭션으로 묶어 유실을 막기 위해서입니다. 동기 호출은 engagement 장애가 가입까지 실패시키는 가용성 결합을 만듭니다. Outbox는 그 결합을 끊고 BACKWARD 호환 Avro로 계약을 안정화합니다."),
        ],
    },
    # ... 나머지 25개 slide_id
}
```

- [ ] **Step 2: 나머지 25개 슬라이드 작성**

각 slide_id에 대해 동일 구조로 작성. 슬라이드별 Q&A 방향(스펙 §4 + 본문 불릿):
  - slide-4 주제·배경: PKM+SRS 통합 필요성, 경쟁(Obsidian/Anki) 대비 차별, 타깃 사용자
  - slide-5 차별화·ADR: 단일 PG+스키마 격리 트레이드오프, Kafka+Outbox가 끊는 결합, BACKWARD 호환 의미
  - slide-6 시스템 구성: 4도메인 경계 기준, pgvector 1536d 선택, 이벤트 순환 신뢰성
  - slide-7 개발환경: Spring Boot 4.0/Modulith 채택 이유, JaCoCo 80% 게이트 운영, Flutter 단일 코드베이스 한계
  - slide-9 팀 분담: knowledge/learning 2인 분할 기준, 프론트 공동 구현 리스크
  - slide-11 스프린트: 5주 일정 압축 리스크, 중간보고(W3) 산출물
  - slide-12 협업·품질: 멀티레포 19개 관리비용, 5종 문서체계 실효, ArchUnit 경계 강제
  - slide-14 사용자 시나리오: 이벤트 순환 정합성, 담당 분리 기준
  - slide-16 노트: 위키링크 파싱·PageRank 비용, Outbox AFTER_COMMIT·멱등 Redis TTL 7d·DLQ
  - slide-17 AI카드: Claude/OpenAI 이중화 폴백 기준, 비용·레이턴시, DLQ·멱등
  - slide-18 복습 SRS: SM-2 선택 이유(vs FSRS), review-due 스케줄링
  - slide-19 보상·커뮤니티: XP 멱등성(중복 적립 방지), 리더보드 Redis→DB 폴백, 모더레이션
  - slide-20 검색: BM25×임베딩 RRF 가중치/k, 정확도 측정 한계(골든셋), 3s 폴백
  - slide-21 백본: rate-limit 1rps 근거, Outbox 무한 재시도 대비, staging 16/16·SLA 5/7 의미
  - slide-22 시연영상(2~3쌍): 모듈식 Optional 구성 이유, 미완성 파트 드롭 전략
  - slide-24~30 회고: 각 트러블슈팅의 근본원인·재발방지(예: slide-24 Flyway V28 중복→타임스탬프+CI 가드, slide-26 SSL ssl_context 미전달 CrashLoop, slide-30 XP 멱등성 리더보드 붕괴)
  - slide-32 달성도: 🟡 항목(G2 AI카드·G4 검색) 솔직한 한계, staging 실운영 의미
  - slide-33 개선점: Outbox max-attempt+DLQ 전환 시 유실 방지, UUID 정본 통일, Avro 드리프트 정렬
  - slide-34 소감: 현업 표준 도구체인 경험, 가장 큰 배움

- [ ] **Step 3: 소스 무결성 검증**

```bash
py -3.14 -c "import sys; sys.path.insert(0,'report-presentation'); from presentation_qa import CONTENT; ids=set(CONTENT); exp=set('slide-%d'%n for n in [4,5,6,7,9,11,12,14,15,16,17,18,19,20,21,22,24,25,26,27,28,29,30,32,33,34]); print('count',len(CONTENT)); assert ids==exp, ('mismatch', ids^exp); [print(k, len(v['qa']),'Q') for k,v in CONTENT.items()]; assert all(2<=len(v['qa'])<=5 for v in CONTENT.values()); assert all(v['script'].strip() for v in CONTENT.values()); print('OK')"
```
Expected: `count 26`, 각 slide Q 수 출력(2~5), `OK`.

- [ ] **Step 4: 커밋**

```bash
cd /d/workspace/final-project-syn
git -C documents add ../report-presentation/presentation_qa.py 2>/dev/null || true
git -C documents commit --allow-empty -q -m "chore: 발표 대본+Q&A 단일 소스 작성(26슬라이드)" || true
```
> 주: `report-presentation/`는 documents 레포 밖이라 git 추적이 안 될 수 있음. 추적 안 되면 이 커밋은 비우고 Task 3에서 산출물만 커밋한다.

---

## Task 2: 생성기 스크립트

**Files:** Create `report-presentation/gen_presentation_qa.py`

- [ ] **Step 1: 생성기 작성**

```python
# report-presentation/gen_presentation_qa.py
import re, html, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from presentation_qa import CONTENT

HTML = pathlib.Path(r"D:/workspace/final-project-syn/documents/docs/final-deliverables/report-deck.html")
MD = pathlib.Path(r"D:/workspace/final-project-syn/documents/docs/final-deliverables/발표대본_Q&A_SYNAPSE.md")

def esc(s):
    return html.escape(s, quote=False)

def aside_html(item):
    parts = ["<strong>[대본]</strong><br>", esc(item["script"]).replace("\n", "<br>")]
    parts.append("<br><br><strong>── 예상 Q&A ──</strong>")
    for i, (q, a) in enumerate(item["qa"], 1):
        parts.append(f"<br><br><strong>Q{i}.</strong> {esc(q)}<br><strong>A{i}.</strong> {esc(a)}")
    return "".join(parts)

# 슬라이드 섹션 내 <aside class="speaker-notes" ...>...</aside> 교체
ASIDE_RE = re.compile(r'(<aside class="speaker-notes"[^>]*>).*?(</aside>)', re.DOTALL)

def replace_aside(deck, slide_id, inner):
    start = deck.index(f'id="{slide_id}"')
    sec_start = deck.rindex("<section", 0, start)
    sec_end = deck.index("</section>", start)
    sec = deck[sec_start:sec_end]
    new_sec, n = ASIDE_RE.subn(lambda m: m.group(1) + inner + m.group(2), sec, count=1)
    if n != 1:
        raise SystemExit(f"{slide_id}: speaker-notes aside 교체 실패 (n={n})")
    return deck[:sec_start] + new_sec + deck[sec_end:]

def main():
    deck = HTML.read_text(encoding="utf-8")
    for sid, item in CONTENT.items():
        deck = replace_aside(deck, sid, aside_html(item))
    HTML.write_text(deck, encoding="utf-8")
    # MD 생성
    lines = ["# SYNAPSE 발표 대본 + 실무자 예상 Q&A", "",
             "> report-deck.html 화자노트와 동일 소스. 콘텐츠 슬라이드 26장.", ""]
    for sid, item in CONTENT.items():
        lines += [f"## {sid}", "", "**[대본]**", "", item["script"], "", "**예상 Q&A**", ""]
        for i, (q, a) in enumerate(item["qa"], 1):
            lines += [f"- **Q{i}.** {q}", f"  - **A{i}.** {a}"]
        lines.append("")
    MD.write_text("\n".join(lines), encoding="utf-8")
    print("asides updated:", len(CONTENT), "| MD:", MD)

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: 생성기 실행**

```bash
cd /d/workspace/final-project-syn
py -3.14 report-presentation/gen_presentation_qa.py
```
Expected: `asides updated: 26 | MD: ...발표대본_Q&A_SYNAPSE.md`.

---

## Task 3: 검증 + 커밋

**Files:** Modify `report-deck.html`; Create `발표대본_Q&A_SYNAPSE.md`

- [ ] **Step 1: 구조 무결성 검증**

```bash
cd /d/workspace/final-project-syn
F="documents/docs/final-deliverables/report-deck.html"
echo "슬라이드 수: $(grep -oE 'id=\"slide-[0-9]+\"' "$F" | wc -l) (34)"
echo "2x2 보존: $(grep -oE 'class=\"shot-2x2\"' "$F" | wc -l) (6)"
echo "대본 마커: $(grep -oE '\[대본\]' "$F" | wc -l) (26)"
echo "예상 Q&A 마커: $(grep -oE '예상 Q&A' "$F" | wc -l) (26)"
echo "MD 존재: $(test -f documents/docs/final-deliverables/발표대본_Q&A_SYNAPSE.md && echo yes)"
```
Expected: 34 / 6 / 26 / 26 / yes.

- [ ] **Step 2: presenter 패널 육안 검증 (gstack-browse)**

덱을 Temp로 복사해 열고, 콘텐츠 슬라이드에서 노트 패널(키 `n` 또는 notes-panel)에 [대본]+Q&A가 줄바꿈·굵게 표시되는지 확인. 섹션 슬라이드(slide-3 등)는 기존 노트 유지 확인.
```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"
cp documents/docs/final-deliverables/report-deck.html "C:/Users/deepe/AppData/Local/Temp/deck-qa.html"
"$B" goto "file:///C:/Users/deepe/AppData/Local/Temp/deck-qa.html"
"$B" js "(function(){location.hash='#slide-15';return 1;})()"; sleep 1
"$B" js "(function(){var n=document.querySelector('#slide-15 .speaker-notes');return n?n.innerHTML.slice(0,200):'none';})()"
```
Expected: slide-15 aside innerHTML에 `<strong>[대본]</strong>`·`Q1.`·`A1.` 포함.

- [ ] **Step 3: 커밋**

```bash
cd /d/workspace/final-project-syn/documents
git add docs/final-deliverables/report-deck.html "docs/final-deliverables/발표대본_Q&A_SYNAPSE.md"
git commit -q -m "feat: 콘텐츠 슬라이드 26장 발표 대본+실무자 Q&A 추가(화자노트+별도 문서)"
git log --oneline -2
```
Expected: 커밋 성공.

---

## Self-Review 결과

- **스펙 커버리지:** §1 결정(둘 다·콘텐츠만·질문+답변·길이·톤) → Task 1 작성 규칙 + Task 2 양쪽 산출. §2 26장 매핑 → Task 1/2 slide_id 목록. §3 aside 형식 → `aside_html()`(HTML 마크업, innerHTML 렌더 근거 반영). §4 Q&A 방향 → Task 1 Step 2 슬라이드별 지침. §5 별도 문서 → Task 2 MD 생성. §7 DoD → Task 3 검증. 누락 없음.
- **Placeholder 스캔:** 콘텐츠 본문(대본·Q&A)은 작성 대상이라 Task 1에 1개 완성 예시(slide-15) + 슬라이드별 출처·방향을 명시(슬라이드 불릿이 1차 소스). 생성기 코드는 전문 제공. 모호 지시 없음.
- **타입/명명 일관성:** `CONTENT[slide_id] = {"script": str, "qa": [(q,a)]}` 구조를 Task 1·2·검증에서 동일 사용. `aside_html()`/`replace_aside()` 명명 일관.
