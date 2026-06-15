# 레포별 작업 내용 안내 HTML 문서 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이번 세션 작업(application.yml 표준화 + CI dev-smoke + 발견 버그 수정)을 레포별 탭으로 분류해 비개발자도 이해하게 설명하는 단일 자체완결 HTML 문서 `docs/work-summary.html`를 만든다.

**Architecture:** 외부 의존성 없는 단일 HTML. 인라인 `<style>`로 카드/탭/Before-After/접이식 스타일, 인라인 `<script>`로 탭 전환. 탭 = 개요 + 4개 레포. 각 레포 탭은 동일 섹션 틀(서비스 소개 → 바꾼 것 → 효과(Before/After) → 고친 문제 → 접이식 개발자 상세+PR 링크).

**Tech Stack:** 순수 HTML/CSS/JS (프레임워크·CDN·빌드도구 없음). 한국어.

**작업 규칙:** 단일 파일을 점진적으로 채운다. 각 Task 후 브라우저로 열어 탭 전환·내용을 확인한다. 사실은 이 세션 산출물(스펙/플랜/커밋/PR/CI 결과)에 근거한다.

## 사실 레퍼런스 (문서에 반영할 확정 사실)

- 포트맵: platform **8081**, knowledge **8082**, engagement **8083**, learning **8084**.
- JWT 공통 키 prefix: `synapse.jwt.*` (platform=발급자, 나머지=검증자).
- PR 링크:
  - platform: https://github.com/team-project-final/synapse-platform-svc/pull/34
  - knowledge: https://github.com/team-project-final/synapse-knowledge-svc/pull/24
  - engagement: https://github.com/team-project-final/synapse-engagement-svc/pull/10
  - learning: https://github.com/team-project-final/synapse-learning-svc/pull/25
- CI 결과: 4개 PR 모두 `build`/`dev-smoke` green (knowledge는 ES 통합테스트 `@Disabled` 후 green).

---

## Task 1: HTML 골격 + 스타일 + 탭 전환 JS

**Files:**
- Create: `docs/work-summary.html`

- [ ] **Step 1: 파일 생성 (골격 전체)**

아래 내용으로 `docs/work-summary.html`를 생성한다. 각 탭 패널 본문은 후속 Task에서 채운다(지금은 빈 `<!-- TAB:xxx -->` 자리표시 주석).

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>작업 요약 — synapse 서비스 설정 표준화 & CI 통일</title>
<style>
  :root{
    --bg:#f6f7f9; --card:#fff; --ink:#1f2430; --muted:#5b6472; --line:#e6e9ef;
    --accent:#4f6bed; --good:#1f9d57; --bad:#c0392b; --warn:#b8860b;
    --c-platform:#4f6bed; --c-knowledge:#7c5cd6; --c-engagement:#e0793a; --c-learning:#1f9d8b;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);
    font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Malgun Gothic",sans-serif;line-height:1.65}
  header{padding:28px 20px 12px;max-width:980px;margin:0 auto}
  h1{font-size:1.5rem;margin:0 0 4px}
  .sub{color:var(--muted);font-size:.92rem}
  .tabs{position:sticky;top:0;background:var(--bg);z-index:5;
    max-width:980px;margin:0 auto;padding:10px 20px;display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--line)}
  .tab{border:1px solid var(--line);background:var(--card);color:var(--ink);
    padding:8px 14px;border-radius:999px;cursor:pointer;font-size:.9rem}
  .tab[aria-selected="true"]{background:var(--accent);color:#fff;border-color:var(--accent)}
  main{max-width:980px;margin:0 auto;padding:20px}
  .panel{display:none}
  .panel.active{display:block}
  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin:14px 0;
    box-shadow:0 1px 2px rgba(0,0,0,.03)}
  .lead{font-size:1.05rem}
  h2{font-size:1.2rem;margin:22px 0 6px}
  h3{font-size:1rem;margin:16px 0 6px;color:var(--muted)}
  ul{margin:8px 0;padding-left:20px} li{margin:4px 0}
  .pill{display:inline-block;font-size:.78rem;padding:2px 10px;border-radius:999px;background:#eef1fb;color:var(--accent)}
  .ba{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0}
  .ba .b,.ba .a{border-radius:12px;padding:12px 14px;font-size:.92rem}
  .ba .b{background:#fdecec;border:1px solid #f4caca}
  .ba .a{background:#e9f7ef;border:1px solid #c7ead5}
  .ba h4{margin:0 0 6px;font-size:.86rem;letter-spacing:.02em}
  .fix{background:#fff8e8;border:1px solid #f0e0b6;border-radius:12px;padding:12px 14px;margin:10px 0}
  details{background:#f1f3f8;border:1px solid var(--line);border-radius:12px;padding:6px 14px;margin:12px 0}
  summary{cursor:pointer;font-weight:600;padding:6px 0}
  details code,code{background:#eceef4;border-radius:6px;padding:1px 6px;font-size:.85em}
  table{border-collapse:collapse;width:100%;margin:10px 0;font-size:.92rem}
  th,td{border:1px solid var(--line);padding:8px 10px;text-align:left}
  th{background:#f1f3f8}
  a{color:var(--accent)}
  .note{color:var(--muted);font-size:.85rem}
  .legend span{margin-right:14px;font-size:.85rem;color:var(--muted)}
  @media(max-width:640px){.ba{grid-template-columns:1fr}}
  /* repo accent */
  #panel-platform .pill{background:#eaeefc;color:var(--c-platform)}
  #panel-knowledge .pill{background:#efeafa;color:var(--c-knowledge)}
  #panel-engagement .pill{background:#fbeee3;color:var(--c-engagement)}
  #panel-learning .pill{background:#e6f6f2;color:var(--c-learning)}
</style>
</head>
<body>
<header>
  <h1>synapse 서비스 — 설정 표준화 &amp; 자동 점검(CI) 통일 작업 요약</h1>
  <div class="sub">작성일 2026-05-27 · 비개발자도 읽을 수 있게 풀어 쓴 문서 · 탭으로 서비스별 분류</div>
  <div class="legend" style="margin-top:8px">
    <span>🟢 효과</span><span>🐞 고친 문제</span><span>⚙️ 설정</span><span>🔐 보안</span><span>🧪 점검</span>
  </div>
</header>

<nav class="tabs" role="tablist">
  <button class="tab" role="tab" data-tab="overview" aria-selected="true">📋 개요</button>
  <button class="tab" role="tab" data-tab="platform" aria-selected="false">🔐 platform-svc</button>
  <button class="tab" role="tab" data-tab="knowledge" aria-selected="false">📚 knowledge-svc</button>
  <button class="tab" role="tab" data-tab="engagement" aria-selected="false">👥 engagement-svc</button>
  <button class="tab" role="tab" data-tab="learning" aria-selected="false">🎴 learning-svc</button>
</nav>

<main>
  <section class="panel active" id="panel-overview"><!-- TAB:overview --></section>
  <section class="panel" id="panel-platform"><!-- TAB:platform --></section>
  <section class="panel" id="panel-knowledge"><!-- TAB:knowledge --></section>
  <section class="panel" id="panel-engagement"><!-- TAB:engagement --></section>
  <section class="panel" id="panel-learning"><!-- TAB:learning --></section>
</main>

<script>
  (function(){
    var tabs = document.querySelectorAll('.tab');
    function show(name){
      document.querySelectorAll('.panel').forEach(function(p){
        p.classList.toggle('active', p.id === 'panel-' + name);
      });
      tabs.forEach(function(t){ t.setAttribute('aria-selected', String(t.dataset.tab === name)); });
    }
    tabs.forEach(function(t){ t.addEventListener('click', function(){ show(t.dataset.tab); }); });
  })();
</script>
</body>
</html>
```

- [ ] **Step 2: 브라우저로 골격 확인**

Run: `start docs/work-summary.html` (Windows) — 또는 파일 더블클릭.
Expected: 상단에 5개 탭이 보이고, 탭 클릭 시 빈 패널이 전환된다(에러 없음).

- [ ] **Step 3: 커밋**
```bash
git -C docs 2>/dev/null || true
git add docs/work-summary.html
git commit -m "docs: work-summary HTML 골격(탭/스타일/전환)" 2>/dev/null || echo "(루트가 git이 아니면 커밋 생략 — 파일만 유지)"
```
> 참고: 루트는 git 저장소가 아닐 수 있다. 그 경우 커밋은 생략하고 파일만 유지한다(이전 docs 산출물과 동일 정책).

---

## Task 2: 개요 탭 콘텐츠

**Files:**
- Modify: `docs/work-summary.html` (`<!-- TAB:overview -->`를 아래로 치환)

- [ ] **Step 1: 개요 패널 본문 작성**

`<!-- TAB:overview -->`를 다음으로 치환:

```html
  <div class="card">
    <p class="lead">이번 작업은 크게 <b>두 가지</b>였어요.</p>
    <ul>
      <li><b>① 설정을 한 방식으로 통일</b> — 4개 서비스가 제각각이던 설정(주소·비밀번호·로그인 방식 등)을
        <b>똑같은 규칙</b>과 <b>환경 4종</b>(개발/운영/테스트의 묶음)으로 정리했어요.</li>
      <li><b>② 배포 전 자동 점검(CI) 추가</b> — 코드를 합치기 전에 <b>실제로 한 번 켜 보는 점검</b>을 자동으로 돌려,
        문제가 있으면 미리 잡도록 했어요. <span class="note">(CI = 변경할 때마다 자동으로 돌리는 점검)</span></li>
    </ul>
  </div>

  <h2>한눈에 보는 공통 규칙</h2>
  <table>
    <tr><th>서비스</th><th>쉬운 별명</th><th>주소(포트)</th></tr>
    <tr><td>platform-svc</td><td>회원·로그인·결제 안내데스크</td><td>8081</td></tr>
    <tr><td>knowledge-svc</td><td>메모 저장·검색 도서관 사서</td><td>8082</td></tr>
    <tr><td>engagement-svc</td><td>스터디 그룹·활동점수 동아리방</td><td>8083</td></tr>
    <tr><td>learning-svc</td><td>학습카드·복습 암기 도우미</td><td>8084</td></tr>
  </table>
  <p class="note">‘환경 4종’이란: <b>기본</b>(공통) · <b>dev</b>(개발용) · <b>prod</b>(운영용) · <b>test</b>(자동시험용) 설정 묶음.
    기본 실행 환경은 <b>dev</b>로 맞췄어요. 로그인 방식(JWT, 일종의 ‘출입증’) 설정 이름도 <code>synapse.jwt</code>로 통일했어요.</p>

  <h2>결과</h2>
  <div class="card">
    <p>🟢 4개 서비스 모두 <b>자동 점검 통과(녹색)</b> 상태이고, 합치기(머지)만 기다리고 있어요.</p>
    <ul>
      <li>platform-svc — <a href="https://github.com/team-project-final/synapse-platform-svc/pull/34">PR #34</a></li>
      <li>knowledge-svc — <a href="https://github.com/team-project-final/synapse-knowledge-svc/pull/24">PR #24</a></li>
      <li>engagement-svc — <a href="https://github.com/team-project-final/synapse-engagement-svc/pull/10">PR #10</a></li>
      <li>learning-svc — <a href="https://github.com/team-project-final/synapse-learning-svc/pull/25">PR #25</a></li>
    </ul>
    <p class="note">덤으로, 자동 점검을 붙이는 과정에서 <b>그동안 숨어있던 문제 몇 가지</b>도 발견해 고쳤어요(각 서비스 탭의 🐞 참고).</p>
  </div>
```

- [ ] **Step 2: 확인** — 개요 탭에 두 가지 요약·표·결과/PR 링크가 보인다.

---

## Task 3: platform-svc 탭 콘텐츠

**Files:**
- Modify: `docs/work-summary.html` (`<!-- TAB:platform -->` 치환)

- [ ] **Step 1: platform 패널 본문 작성**

```html
  <span class="pill">🔐 발급자 · 8081</span>
  <h2>이 서비스는 뭐예요?</h2>
  <p class="lead">회원 가입·로그인·결제를 담당하는 <b>안내데스크</b>예요. 로그인하면 ‘출입증(JWT)’을 만들어 나눠주는 곳이기도 해요.</p>

  <h2>무엇을 바꿨나요? <span class="pill">⚙️</span></h2>
  <ul>
    <li>설정을 <b>개발/운영/테스트</b> 환경별로 깔끔히 정리하고, 서비스 주소(포트)를 <b>8081</b>로 고정했어요.</li>
    <li>출입증(JWT) 관련 설정 이름을 공통 규칙 <code>synapse.jwt</code>로 통일했어요.</li>
    <li>개발할 때 <b>내 PC에서 바로 실행</b>되도록 기본값(접속 주소·임시 비밀번호 등)을 채워뒀어요.</li>
  </ul>

  <h2>왜 했나요? / 효과 <span class="pill">🟢</span></h2>
  <div class="ba">
    <div class="b"><h4>전</h4>설정 이름·기본값이 서비스마다 달라 헷갈리고, 새로 받은 사람이 실행하기 어려웠어요.</div>
    <div class="a"><h4>후</h4>똑같은 규칙이라 한 번 익히면 어느 서비스든 동일. 받자마자 개발 환경으로 바로 실행돼요.</div>
  </div>

  <h2>숨어있던 문제를 찾아 고쳤어요 <span class="pill">🐞</span></h2>
  <div class="fix">개발용 ‘출입증 도장(개인키)’ 기본값이 <b>깨진 값</b>이라, 개발 환경에서 출입증을 만들 수 없었어요.
    실제로 짝이 맞는 올바른 값으로 바로잡았습니다.</div>

  <details>
    <summary>🔧 개발자용 상세 (펼치기)</summary>
    <ul>
      <li><code>spring.application.name</code> <code>synapse-platform-svc</code> → <code>platform-svc</code>, 활성 프로파일 기본값 <code>dev</code>, port 8080 → 8081</li>
      <li>JWT prefix <code>jwt.*</code> → <code>synapse.jwt.*</code> (JwtProperties + dev/prod/test yml) — RSA RS256 발급자 유지</li>
      <li><code>application-local.yml</code> 제거 → dev가 로컬 기본값 흡수, prod에 Redis(env)·Hikari pool 20, 공통 로깅 패턴</li>
      <li>fix: dev <code>synapse.jwt.private-key</code> 손상 base64 → 유효 PKCS8 키로 교정</li>
      <li>CI: 트리거 <code>[main, dev]</code> + <code>dev-smoke</code>(postgres+redis 기동 후 dev 부팅, <code>/actuator/health</code> UP 검증)</li>
    </ul>
    <p>👉 <a href="https://github.com/team-project-final/synapse-platform-svc/pull/34">PR #34</a></p>
  </details>
```

- [ ] **Step 2: 확인** — platform 탭에 5개 섹션 + 접이식(기본 접힘) + PR 링크.

---

## Task 4: knowledge-svc 탭 콘텐츠

**Files:**
- Modify: `docs/work-summary.html` (`<!-- TAB:knowledge -->` 치환)

- [ ] **Step 1: knowledge 패널 본문 작성**

```html
  <span class="pill">📚 검증자 · 8082</span>
  <h2>이 서비스는 뭐예요?</h2>
  <p class="lead">메모(노트)를 저장하고 빠르게 찾아주는 <b>도서관 사서</b>예요. 한국어 검색도 담당해요.</p>

  <h2>무엇을 바꿨나요? <span class="pill">⚙️</span></h2>
  <ul>
    <li>설정을 환경 4종으로 정리하고, 주소(포트)를 <b>8082</b>로 고정했어요.</li>
    <li>출입증(JWT)을 <b>확인하는</b> 설정 이름을 공통 규칙 <code>synapse.jwt</code>로 통일했어요.</li>
    <li>비어 있던 개발 설정에 <b>실제 데이터베이스 연결</b>을 채워, 개발 환경에서 진짜로 켜지도록 했어요.</li>
  </ul>

  <h2>왜 했나요? / 효과 <span class="pill">🟢</span></h2>
  <div class="ba">
    <div class="b"><h4>전</h4>개발 설정이 사실상 비어 있어, 실제 DB로 켜본 적이 없고 숨은 문제가 잠복했어요.</div>
    <div class="a"><h4>후</h4>개발 환경에서 실제 DB로 켜져 동작이 검증돼요. 출입증 검사 규칙도 다른 서비스와 동일.</div>
  </div>

  <h2>숨어있던 문제를 찾아 고쳤어요 <span class="pill">🐞</span></h2>
  <div class="fix"><b>DB 설계도 자동 적용 도구(flyway)</b>가 연결되어 있지 않아, 표(테이블)가 아예 안 만들어지던 문제가 있었어요. 도구를 제대로 연결했습니다.</div>
  <div class="fix">검색에 쓰는 <b>특수 기능(벡터·대용량 텍스트)</b> 때문에 자동 형식검사가 맞지 않아, 설계도(flyway)를 ‘정답’으로 삼도록 조정했어요.</div>
  <div class="fix">한국어 <b>검색 통합테스트</b>는 검색엔진 버전 차이로 점검 환경에서 통과가 어려워, 지금은 <b>임시 보류</b>하고 별도 과제로 남겼어요(다른 점검은 모두 통과).</div>

  <details>
    <summary>🔧 개발자용 상세 (펼치기)</summary>
    <ul>
      <li>JWT <code>security.jwt.public-key-pem</code> → <code>synapse.jwt.public-key</code> (검증자, OAuth2 Resource Server + NimbusJwtDecoder)</li>
      <li>active 기본값 dev, port 8082, 빈 dev/prod 스텁 → 실제 DB(dev: localhost PostgreSQL, prod: env)</li>
      <li>fix: <code>flyway-core</code> → <code>spring-boot-starter-flyway</code>(자동설정 누락으로 마이그레이션 미실행이던 버그), dev/prod <code>ddl-auto: none</code>(flyway 권위; pgvector/@Lob 커스텀 타입은 validate 부적합)</li>
      <li>CI: 트리거 <code>[main, dev]</code>, <code>dev-smoke</code>(pgvector postgres + opensearch 기동, dev 부팅 health)</li>
      <li><code>SearchElasticsearchIntegrationTest</code> <code>@Disabled</code> — ES 클라이언트 9.2.1 ↔ 서버/운영 OpenSearch 2.11 ↔ Nori 설정 버전 정합은 별도 과제</li>
    </ul>
    <p>👉 <a href="https://github.com/team-project-final/synapse-knowledge-svc/pull/24">PR #24</a></p>
  </details>
```

- [ ] **Step 2: 확인** — knowledge 탭 섹션·🐞 3건·접이식·PR 링크.

---

## Task 5: engagement-svc 탭 콘텐츠

**Files:**
- Modify: `docs/work-summary.html` (`<!-- TAB:engagement -->` 치환)

- [ ] **Step 1: engagement 패널 본문 작성**

```html
  <span class="pill">👥 검증자 · 8083</span>
  <h2>이 서비스는 뭐예요?</h2>
  <p class="lead">스터디 그룹과 활동 점수(배지·경험치)를 관리하는 <b>동아리방</b>이에요.</p>

  <h2>무엇을 바꿨나요? <span class="pill">⚙️ 🔐</span></h2>
  <ul>
    <li>설정을 환경 4종으로 정리(쓰지 않던 staging 제거, 자동시험용 test 추가)하고, 주소(포트)를 <b>8083</b>으로 고정했어요.</li>
    <li>그동안 ‘임시’였던 신원 확인을 <b>실제 출입증(JWT) 검사로 승격</b>했어요. 이제 올바른 출입증이 없으면 보호된 기능에 들어갈 수 없어요.</li>
  </ul>

  <h2>왜 했나요? / 효과 <span class="pill">🟢</span></h2>
  <div class="ba">
    <div class="b"><h4>전</h4>로그인 연동 전이라 ‘이름표(헤더)’만 있으면 통과하는 임시 방식이었어요.</div>
    <div class="a"><h4>후</h4>진짜 출입증을 검사해요. 더 안전하고, 다른 서비스와 같은 보안 방식으로 통일.</div>
  </div>

  <div class="fix">참고: 보안을 실제로 켜면서 <b>외부 약속(계약)이 바뀌었어요</b> — 보호된 기능은 이제 유효한 출입증이 필수예요.
    이에 맞춰 자동시험도 ‘진짜 출입증’을 쓰도록 갱신했어요.</div>

  <details>
    <summary>🔧 개발자용 상세 (펼치기)</summary>
    <ul>
      <li>active 기본값 dev, port 8080 → 8083, <code>application-local.yml</code>/<code>application-staging.yml</code> 제거, test 리소스 신설</li>
      <li>보안 의존성(security + oauth2-resource-server) 추가, 검증자 <code>SecurityConfig</code>(NimbusJwtDecoder, <code>synapse.jwt.public-key</code>), 보호 엔드포인트 401 강제(공개: actuator/swagger/community share·search)</li>
      <li>통합테스트는 <code>TestJwt</code>로 실제 RS256 Bearer 토큰 발급, 로깅 패키지 <code>io.synapse</code> → <code>com.synapse.engagement</code> 교정</li>
      <li>CI: 트리거 <code>[main, dev]</code>, <code>dev-smoke</code>(postgres, dev 부팅 health)</li>
    </ul>
    <p>👉 <a href="https://github.com/team-project-final/synapse-engagement-svc/pull/10">PR #10</a></p>
  </details>
```

- [ ] **Step 2: 확인** — engagement 탭 섹션·접이식·PR 링크.

---

## Task 6: learning-svc 탭 콘텐츠

**Files:**
- Modify: `docs/work-summary.html` (`<!-- TAB:learning -->` 치환)

- [ ] **Step 1: learning 패널 본문 작성**

```html
  <span class="pill">🎴 검증자 · 8084</span>
  <h2>이 서비스는 뭐예요?</h2>
  <p class="lead">학습용 카드와 복습 일정을 챙겨주는 <b>암기 도우미</b>예요.</p>

  <h2>무엇을 바꿨나요? <span class="pill">⚙️ 🔐</span></h2>
  <ul>
    <li>옛날 설정 형식(<code>.properties</code>)을 <b>새 형식(yml)</b>으로 갈아끼우고 환경 4종으로 정리했어요.</li>
    <li>코드에 <b>그대로 적혀 있던 비밀번호</b>를 제거하고, 바깥에서 주입하도록 바꿨어요(보안).</li>
    <li>서비스 이름을 <code>learning-card</code> → <code>learning-svc</code>로, 주소(포트)를 <b>8084</b>로 정리하고, 출입증(JWT) 검사를 적용했어요.</li>
  </ul>

  <h2>왜 했나요? / 효과 <span class="pill">🟢 🔐</span></h2>
  <div class="ba">
    <div class="b"><h4>전</h4>설정 형식이 옛날 방식이고 비밀번호가 코드에 노출, 환경 구분도 없었어요.</div>
    <div class="a"><h4>후</h4>다른 서비스와 같은 형식·규칙, 비밀번호는 바깥에서 주입, 환경별로 분리돼 안전해요.</div>
  </div>

  <h2>숨어있던 문제를 찾아 고쳤어요 <span class="pill">🐞</span></h2>
  <div class="fix">knowledge와 똑같이 <b>DB 설계도 자동 적용 도구(flyway)</b>가 연결되어 있지 않아 표가 안 만들어지던 문제가 있었어요. 도구를 제대로 연결했습니다.</div>

  <details>
    <summary>🔧 개발자용 상세 (펼치기)</summary>
    <ul>
      <li><code>application.properties</code> → <code>application.yml</code> + dev/prod/test, app name <code>learning-card</code> → <code>learning-svc</code>, active dev, port 8084</li>
      <li>하드코딩 DB 비밀번호(<code>1234</code>) 제거 → 전부 환경변수, 보안 의존성 + 검증자 <code>SecurityConfig</code>(<code>synapse.jwt.public-key</code>)</li>
      <li>fix: <code>flyway-core</code> → <code>spring-boot-starter-flyway</code>(자동설정 누락으로 V8~V16 미실행이던 버그). dev/prod <code>ddl-auto: none</code>(flyway 권위)</li>
      <li>CI: 트리거 <code>[main, dev]</code>, <code>dev-smoke</code>(working-dir learning-card, postgres만; Kafka는 부팅 불필요·@EmbeddedKafka 테스트가 담당)</li>
    </ul>
    <p>👉 <a href="https://github.com/team-project-final/synapse-learning-svc/pull/25">PR #25</a></p>
  </details>
```

- [ ] **Step 2: 확인** — learning 탭 섹션·🐞·접이식·PR 링크.

---

## Task 7: 최종 검증 & 마무리

- [ ] **Step 1: 외부 의존성 없음 확인**

Run (PowerShell): `Select-String -Path docs/work-summary.html -Pattern 'src=|<link|cdn|http://(?!localhost)' `
Expected: 매칭은 PR용 `https://github.com/...` 링크(`<a href>`)뿐. `<script src>`/`<link href>`/CDN 로드 없음.

- [ ] **Step 2: 자리표시 주석 잔존 확인**

Run (PowerShell): `Select-String -Path docs/work-summary.html -Pattern '<!-- TAB:'`
Expected: 매칭 없음(모든 탭 본문이 채워짐).

- [ ] **Step 3: 브라우저 동작 확인**

Run: `start docs/work-summary.html`
Expected: 5개 탭 전부 전환되고, 각 탭에 내용이 보이며, 개발자용 상세는 기본 접힘 상태에서 펼치면 PR 링크가 보인다. 콘솔 에러 없음.

- [ ] **Step 4: (git이면) 커밋**

Run:
```bash
git add docs/work-summary.html
git commit -m "docs: 레포별 작업 내용 안내 HTML(개요+4개 레포 탭, 비개발자용)" 2>/dev/null || echo "(루트 비-git: 파일만 유지)"
```

---

## Self-Review (작성자 점검)

- **Spec coverage:** 단일 자체완결 HTML(Task1), 개요 탭(Task2), 4개 레포 탭 동일 5섹션 틀(Task3~6), 접이식 개발자 상세+PR 링크(각 탭), Before/After·아이콘·용어 풀이(콘텐츠), 외부 의존성/자리표시 검증(Task7), 저장 위치 `docs/work-summary.html` — 스펙 7개 절 모두 대응.
- **Placeholder scan:** `<!-- TAB:xxx -->`는 의도된 임시 자리표시이며 Task2~6에서 치환 + Task7 Step2에서 잔존 검증. 그 외 TODO/TBD 없음. 모든 콘텐츠는 실제 카피로 기재.
- **일관성:** 포트(8081~8084), JWT `synapse.jwt.*`, PR 번호(#34/#24/#10/#25), 패널 id(`panel-<name>`)와 탭 `data-tab`이 골격 JS와 일치.
