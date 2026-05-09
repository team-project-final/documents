# Self-Contained Systems & Micro-Frontend + BFF 패턴

> **시리즈**: MSA 학습 로드맵 — 보충 주제
> **선행 학습**: MSA 기초, 바운디드 컨텍스트, API Gateway, 이벤트 기반 통신
> **난이도**: ★★★★☆ (조직 설계 수준의 의사결정 포함)
> **예상 학습 시간**: 이론 6h + 실습 14h (80/20 원칙)

---

## 📚 학습 목표 (Bloom's Taxonomy)

| 수준 | 목표 |
|---|---|
| **이해 (Understand)** | SCS 7원칙과 "수직 슬라이스" 개념을 자기 언어로 설명할 수 있다 |
| **이해 (Understand)** | Micro-Frontend, BFF, SCS의 관계와 차이를 구분할 수 있다 |
| **적용 (Apply)** | 5가지 MFE 통합 방식 중 상황에 맞는 것을 선택할 수 있다 |
| **적용 (Apply)** | BFF에 들어가도 되는 코드와 안 되는 코드를 구분할 수 있다 |
| **분석 (Analyze)** | 수직 분할(SCS)과 수평 분할(전통적 MSA)의 트레이드오프를 분석할 수 있다 |
| **평가 (Evaluate)** | 자신의 프로젝트가 SCS를 도입할 만큼 성숙했는지 판단할 수 있다 |
| **창조 (Create)** | 자신의 도메인에 SCS 경계를 그리고 BFF API를 설계할 수 있다 |

---

## 🧭 한 줄 요약

> **"한 비즈니스 도메인의 UI · BFF · 도메인 서비스 · DB를, 한 팀이 독립 배포 단위로 통째로 소유한다."**

기존 "백엔드만 MSA로 쪼개고 프론트는 한 덩어리"인 흔한 MSA의 한계를 깨기 위해, **프론트엔드까지 같이 수직 분할**하는 접근법.

---

## 1. 왜 이 패턴이 등장했나

### 1.1 흔한 어설픈 MSA의 모양

```
       ┌─────────────────────────┐
       │  거대한 SPA Monolith    │  ← FE는 여전히 모놀리식
       │  (React 단일 앱)        │
       └────────────┬────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
     [Order]    [Catalog]    [User]   ← 백엔드만 분리
```

### 1.2 이 구조에서 실제로 터지는 통증

| 통증 | 구체적 증상 |
|---|---|
| **FE 팀이 영원한 병목** | 모든 백엔드 변경이 FE 코드베이스에 닿는다 |
| **배포 독립성이 환상** | 기능 하나 추가에도 SPA 전체 빌드/배포 |
| **콘웨이 법칙 위배** | 팀은 도메인 단위인데 FE 코드는 한 덩어리 |
| **기술 스택 락인** | React 18 → 19 마이그레이션이 전사 이벤트가 됨 |
| **레거시 흡수 불가** | 일부 화면만 점진적으로 새 기술로 못 옮김 |
| **장애 폭발 반경** | FE 빌드 깨지면 전 도메인 서비스 마비 |

### 1.3 핵심 깨달음

> **"콘웨이의 법칙대로 팀을 도메인으로 쪼갰다면, 코드도 도메인으로 끝까지 쪼개야 한다."**

여기서 **"끝까지"**는 UI 코드까지 포함한다는 뜻이다. 이게 SCS의 출발점.

---

## 2. 같은 아이디어, 여러 이름

| 명칭 | 관점 | 출처 / 대표자 |
|---|---|---|
| **Self-Contained Systems (SCS)** | 학술/조직 관점 | INNOQ (Stefan Tilkov) |
| **Vertical Slice Architecture** | 코드 조직 관점 | Jimmy Bogard |
| **Micro-Frontend + BFF** | 구현 패턴 관점 | Sam Newman, Cam Jackson (Martin Fowler 블로그) |
| **Full-Stack Microservice** | 통속적 표현 | — |

이 문서에서는 **SCS**를 메인 용어로 쓰고, 그 안의 구체적 구현 기법으로 **MFE**와 **BFF**를 다룬다.

---

## 3. 아키텍처 구조

### 3.1 전체 구조도

```
┌──────────────────── 사용자 브라우저 ─────────────────────┐
│                                                         │
│   ┌─── Shell (App Composer / Layout) ───┐               │
│   │   공통 헤더·메뉴·디자인시스템         │               │
│   └────┬───────────────┬─────────────────┘               │
│        │ MFE 로딩      │ MFE 로딩                         │
│   ┌────▼────┐     ┌────▼────┐                            │
│   │Order MFE│     │Catalog  │   ← 각 도메인의 UI 조각     │
│   │         │     │ MFE     │                            │
│   └────┬────┘     └────┬────┘                            │
└────────┼───────────────┼─────────────────────────────────┘
         │ HTTP/WSS      │ HTTP/WSS
   ┌─────▼─────┐    ┌────▼──────┐
   │ Order BFF │    │Catalog BFF│        ← 프론트 전용 API
   │ (조합/변환)│    │ (조합/변환)│
   └─────┬─────┘    └────┬──────┘
         │               │
   ┌─────▼─────┐    ┌────▼──────┐
   │Order Svc  │    │Catalog Svc│        ← 순수 도메인 서비스
   │ (도메인)   │    │ (도메인)  │
   └─────┬─────┘    └────┬──────┘
         │               │
      [Order DB]      [Catalog DB]   ← 데이터 격리

   ─── Order 팀 소유 ───   ─── Catalog 팀 소유 ───
        (한 줄로 끝까지 수직 슬라이스)
```

### 3.2 핵심 비교 — 수평 vs 수직

```
[ 수평 분할 (전통 MSA) ]         [ 수직 분할 (SCS) ]

 ┌───────────────────┐          ┌──────┬──────┬──────┐
 │   FE Monolith     │          │  UI  │  UI  │  UI  │
 ├───────────────────┤          │      │      │      │
 │   API Gateway     │          ├──────┼──────┼──────┤
 ├──┬──┬──┬──┬──┬───┤          │ BFF  │ BFF  │ BFF  │
 │  │  │  │  │  │   │          ├──────┼──────┼──────┤
 │ S1 S2 S3 S4 S5...│          │ Svc  │ Svc  │ Svc  │
 ├──┴──┴──┴──┴──┴───┤          ├──────┼──────┼──────┤
 │      DBs          │          │  DB  │  DB  │  DB  │
 └───────────────────┘          └──────┴──────┴──────┘
   팀 분할이 어렵다                팀 = 한 칼럼
```

> **포인트**: SCS는 시스템을 **수평선이 아니라 수직선으로** 자른다.

---

## 4. SCS 7대 원칙 (INNOQ)

외워둘 가치가 있는 원칙. 모두 지키긴 어렵지만 의사결정의 기준이 된다.

| # | 원칙 | 한국어 의미 |
|---|---|---|
| 1 | 자율적인 웹 애플리케이션 | 각 SCS는 UI까지 포함된 완전한 웹앱이다 |
| 2 | 한 팀 소유 | 한 SCS는 정확히 한 팀이 책임진다 |
| 3 | 비동기 통신 우선 | SCS 간 통신은 가능한 한 이벤트 기반 |
| 4 | 우아한 격리 | 다른 SCS가 죽어도 일부 기능은 살아 있어야 한다 |
| 5 | 코드/데이터 비공유 | SCS 간 코드·DB 공유 금지 (공통 라이브러리는 OK) |
| 6 | 자기 도메인 로직 보유 | 다른 SCS의 비즈니스 로직을 호출하지 않는다 |
| 7 | UI 통합은 디바이스에서 | 사용자 브라우저에서 조립한다 |

### ⚠️ 가장 어려운 원칙

- **#4 우아한 격리**: 동기 호출 체인이 길어지면 자동으로 깨진다. **회로 차단기(Circuit Breaker)** 같은 안전장치 + **데이터 복제**가 거의 필수.
- **#6 자기 도메인 로직 보유**: 데이터 복제(eventual consistency)를 받아들여야 가능. 트랜잭션 일관성을 포기해야 한다.

---

## 5. 핵심 구성 요소 ①: Micro-Frontend (MFE)

### 5.1 정의

**프론트엔드를 도메인 단위로 쪼갠 독립 배포 가능 모듈.** SPA 모놀리식의 반대 개념.

### 5.2 5가지 통합 방식 비교

| 방식 | 격리 수준 | 런타임 성능 | SEO | 학습난이도 | 대표 도구 |
|---|:---:|:---:|:---:|:---:|---|
| **iframe** | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ | ⭐ | (브라우저 표준) |
| **Module Federation** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Webpack 5, Rspack |
| **Web Components** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Lit, Stencil |
| **Server-side Composition** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Tailor, Podium, Mosaic |
| **single-spa** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | single-spa.js |

### 5.3 통합 시점별 선택 가이드

| 시점 | 설명 | 추천 상황 |
|---|---|---|
| **Build-time** | npm 패키지로 조립 | ⚠️ 거의 항상 안티패턴 (독립 배포 불가) |
| **Server-side** | ESI/Tailor/Podium | SEO·초기로딩이 핵심인 이커머스 |
| **Edge-side** | Cloudflare Workers 등 | 글로벌 트래픽 + SEO |
| **Client-side** | Module Federation, single-spa | 인터랙션이 많은 어드민/대시보드 |

### 5.4 Module Federation 미니 예제 (개념만)

```javascript
// host (Shell)의 webpack.config.js
new ModuleFederationPlugin({
  name: "shell",
  remotes: {
    order: "order@http://order.example.com/remoteEntry.js",
    catalog: "catalog@http://catalog.example.com/remoteEntry.js",
  },
  shared: ["react", "react-dom"],
});

// remote (Order MFE)의 webpack.config.js
new ModuleFederationPlugin({
  name: "order",
  filename: "remoteEntry.js",
  exposes: {
    "./OrderApp": "./src/OrderApp",
  },
  shared: ["react", "react-dom"],
});

// host에서 사용
const OrderApp = React.lazy(() => import("order/OrderApp"));
```

> **포인트**: `remoteEntry.js`가 핵심. 빌드 타임이 아니라 **런타임에** 다른 팀의 빌드 결과를 가져와 합친다.

### 5.5 ⚠️ MFE 자주 터지는 함정

| 함정 | 대응 |
|---|---|
| 각 MFE가 React 복사본을 가져 번들 폭증 | `shared` 옵션으로 singleton 강제 |
| 디자인이 누더기 | 강제 디자인 시스템 (Storybook + 토큰) |
| 라우팅 충돌 | Shell이 라우팅 마스터 역할, MFE는 sub-route만 |
| 전역 상태 공유 욕망 | Custom Event 또는 외부 store(Zustand 등)로 최소화 |
| MFE 간 직접 호출 | ❌ 금지. Shell의 이벤트 버스로 우회 |

---

## 6. 핵심 구성 요소 ②: BFF (Backend for Frontend)

### 6.1 정의

Sam Newman이 정립한 패턴. **프론트엔드 종류별 전용 API 게이트웨이.**

```
        [Web BFF]      [iOS BFF]      [Android BFF]
            │              │              │
            └──────────────┼──────────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        [Order Svc]  [Catalog Svc]  [User Svc]
```

### 6.2 BFF의 4가지 역할

| 역할 | 설명 | 예시 |
|---|---|---|
| **API 조합 (Aggregation)** | 한 화면에 필요한 여러 도메인을 한 번에 호출 | 주문 상세 = 주문 + 상품 + 사용자 정보 |
| **클라이언트 맞춤 변환** | 모바일은 슬림하게, 웹은 풍성하게 | 모바일은 썸네일만, 웹은 고화질 |
| **인증·인가 통합** | 프론트는 BFF 토큰만 알면 됨 | OAuth 토큰 교환을 BFF가 수행 |
| **백엔드 변경 흡수** | 도메인 서비스 변경 시 어댑터 역할 | API v1→v2 마이그레이션 시 BFF만 수정 |

### 6.3 ⚠️ BFF 안티패턴 — "비대한 BFF"

> **BFF에 비즈니스 로직을 넣지 마세요.**

```
✅ BFF의 역할: 조합 · 변환 · 인증 · 캐싱
❌ BFF의 역할이 아닌 것: 도메인 규칙 · 트랜잭션 · 데이터 검증(도메인적)
```

비즈니스 로직이 BFF에 새어들어가면 → **분산 모놀리식** 완성. 도메인 서비스가 두 곳(BFF + 도메인 svc)에 흩어져 유지보수 지옥이 된다.

### 6.4 BFF 구현 스택 (Spring Boot 4.x 기준)

| 요소 | 추천 |
|---|---|
| 프레임워크 | Spring Boot 4.x (WebFlux 권장 — I/O 집약적) |
| 도메인 서비스 호출 | `RestClient` (동기) 또는 `WebClient` (비동기/스트리밍) |
| 회복성 | Resilience4j (Circuit Breaker, Retry, TimeLimiter) |
| 캐싱 | Redis (BFF는 캐시 친화적) |
| 인증 | Spring Security + OAuth2 Resource Server |
| 관찰성 | Micrometer + OpenTelemetry |

### 6.5 BFF 코드 예시 (개념)

```java
// ✅ 좋은 BFF — 조합과 변환만 한다
@RestController
@RequestMapping("/bff/web/orders")
class OrderWebBffController {
    private final OrderClient orderClient;       // 도메인 svc 호출
    private final ProductClient productClient;
    private final UserClient userClient;

    @GetMapping("/{id}")
    Mono<OrderDetailViewModel> getOrderDetail(@PathVariable String id) {
        return orderClient.getOrder(id)
            .flatMap(order ->
                Mono.zip(
                    productClient.getProducts(order.itemIds()),
                    userClient.getUser(order.customerId())
                ).map(tuple -> OrderDetailViewModel.from(order, tuple.getT1(), tuple.getT2()))
            );
    }
}

// ❌ 나쁜 BFF — 도메인 로직이 새어들어옴
@PostMapping("/{id}/cancel")
Mono<Void> cancelOrder(@PathVariable String id) {
    return orderClient.getOrder(id).flatMap(order -> {
        // ❌ 이 비즈니스 규칙은 Order Svc에 있어야 한다!
        if (order.shippedAt() != null
            && Duration.between(order.shippedAt(), Instant.now()).toDays() > 7) {
            return Mono.error(new IllegalStateException("배송 7일 이후 취소 불가"));
        }
        return orderClient.cancel(id);
    });
}
```

---

## 7. 데이터 일관성과 SCS 간 통신

### 7.1 SCS 간 통신 원칙

| 우선순위 | 방식 | 사용 상황 |
|:---:|---|---|
| 1순위 | **이벤트 기반 (비동기)** | 상태 변경 알림, 데이터 복제 |
| 2순위 | **데이터 복제 (Materialized View)** | 다른 SCS의 데이터를 자주 읽을 때 |
| 3순위 | **동기 HTTP 호출** | 실시간성이 필수일 때만 (회로차단기 필수) |

### 7.2 데이터 복제 패턴

```
┌─────────── Catalog SCS ──────────┐
│ [Catalog Svc] ── ProductChanged ─┼──┐
│      │                            │  │
│  [Catalog DB]                     │  │ Kafka
└───────────────────────────────────┘  │
                                       │
┌─────────── Order SCS ─────────────┐  │
│      ┌────────────────────────────┼──┘
│      ▼ (Consumer)
│ [Product Replica View] ◀── 자기 DB에 필요한 부분만 복제
│      ▲
│ [Order Svc]
│  [Order DB + product_view]
└────────────────────────────────────┘
```

> **포인트**: Order SCS는 Catalog SCS의 **상품 정보를 자기 DB에 복제**해 둔다. 이래야 Catalog가 죽어도 주문 화면이 살아남는다 (SCS 원칙 #4).

### 7.3 ⚠️ Eventual Consistency를 받아들여라

SCS를 제대로 하려면 **트랜잭션 일관성**을 거의 포기해야 한다.

- 즉시 일관성이 필요한 영역은 **하나의 SCS 안에** 두기
- SCS 간에는 **결과적 일관성 + 보상 트랜잭션 (Saga)**

이게 받아들여지지 않는 도메인이라면 SCS는 적합하지 않을 수 있다.

---

## 8. 트레이드오프 정리

### ✅ 얻는 것

| 항목 | 설명 |
|---|---|
| **팀 자율성** | 라이브러리 · 언어 · 배포 주기까지 팀이 결정 |
| **진짜 독립 배포** | 한 도메인 = 한 파이프라인, 다른 팀 영향 0 |
| **콘웨이 정렬** | 조직 구조와 코드 구조가 일치 |
| **빠른 온보딩** | 한 SCS만 이해하면 일을 시작할 수 있음 |
| **점진적 교체** | 레거시를 한 SCS씩 단계적으로 교체 가능 |
| **장애 격리** | 한 SCS가 죽어도 다른 도메인은 동작 |

### ❌ 잃는 것 / 비용

| 항목 | 설명 |
|---|---|
| **UX 일관성 위험** | 강한 디자인 시스템 없으면 UI가 누더기 |
| **번들 사이즈 폭증** | MFE마다 React 복사본 가질 위험 |
| **인증·세션 복잡성** | 여러 도메인을 가로지르는 SSO 필수 |
| **장애 디버깅 지옥** | 한 페이지에 N개 팀 시스템 관여 |
| **인프라 복잡도** | CI/CD, 모니터링, 로깅이 N배 |
| **소규모 조직엔 과잉** | 팀이 1~2개면 무조건 오버엔지니어링 |

### 8.1 도입 판단 기준

```
SCS를 도입해야 할까?

[Q1] 팀이 3개 이상인가?              아니오 → ❌ 모듈러 모놀리식
       ↓ 예
[Q2] 도메인 경계가 명확한가?           아니오 → ❌ 먼저 DDD부터
       ↓ 예
[Q3] 즉시 일관성을 일부 포기 가능한가?  아니오 → ❌ 다른 패턴 고려
       ↓ 예
[Q4] 인프라 운영 역량이 있는가?        아니오 → ⚠️ 단계적 도입
       ↓ 예
                                      ✅ SCS 도입 검토 가능
```

---

## 9. 실전 사례

| 회사 | 적용 방식 | 특징 |
|---|---|---|
| **Zalando** | Mosaic 9 + Tailor (Server-side) | SCS의 정석. 오픈소스 공개 |
| **IKEA** | Fragment 기반 페이지 조립 | 글로벌 다국가 운영 |
| **DAZN** | Module Federation | 스트리밍 서비스 MFE |
| **Spotify** | Squad 기반 풀스택 소유 | 클라이언트는 네이티브 앱 |
| **Upwork** | single-spa | 단계적 React 마이그레이션 |
| **PayPal** | Glue (자체 framework) | 결제 도메인별 분리 |

---

## 10. ⚠️ 실전 트랩 모음

### 트랩 1: "FE도 마이크로하면 멋있잖아"로 시작하기
**증상**: 도메인 분리 없이 기술만 도입
**결과**: 100% 망함. 화면 단위로 쪼개져 SCS가 아니라 "분산된 컴포넌트"
**해법**: 먼저 DDD로 바운디드 컨텍스트부터 그려라

### 트랩 2: BFF 비대화
**증상**: 도메인 로직이 BFF로 새어들어감
**결과**: 분산 모놀리식 완성, 같은 로직이 여러 BFF에 중복
**해법**: BFF는 "조합 · 변환 · 인증" 3가지만. 비즈니스 규칙은 도메인 svc에

### 트랩 3: 공유 데이터베이스
**증상**: 두 SCS가 같은 테이블을 본다
**결과**: SCS 원칙 #5 위반. 사실상 SCS 아님
**해법**: 데이터 복제 + 이벤트로 우회

### 트랩 4: 디자인 시스템 부재
**증상**: 팀별로 헤더 폰트, 버튼 스타일이 다름
**결과**: 사용자가 "다른 사이트에 들어왔나?" 착각
**해법**: 도입 첫날부터 토큰 기반 디자인 시스템 강제 (Style Dictionary 등)

### 트랩 5: 너무 잘게 쪼개기
**증상**: SCS가 화면 단위로 쪼개짐 (50개 SCS)
**결과**: 운영 폭발. SCS는 도메인 단위지 화면 단위가 아니다
**해법**: 한 SCS = 최소 한 명의 풀타임 개발자가 1년 일할 분량

### 트랩 6: 동기 호출 체이닝
**증상**: A의 BFF가 B의 BFF를 호출하기 시작
**결과**: 장애 도미노 + 응답 지연 폭주
**해법**: BFF끼리 절대 호출 금지. 도메인 svc 또는 이벤트로만 통신

### 트랩 7: 공통 인증 재발명
**증상**: 각 SCS가 자기 인증을 구현
**결과**: 사용자가 도메인 이동마다 재로그인
**해법**: SSO + OAuth2/OIDC를 처음부터 결정

### 트랩 8: Build-time Composition
**증상**: 모든 MFE를 npm 패키지로 만들어 한 번에 빌드
**결과**: 독립 배포 불가능 → SCS 의미 0
**해법**: Server-side 또는 Client-side runtime composition만 허용

---

## 11. StockPilot 적용 시나리오 (실전)

### 11.1 도메인 경계 그리기

```
┌──────────────────────────────────────────┐
│  Shell (공통 헤더 · 메뉴 · 인증)          │
└──────┬─────────┬─────────┬──────┬───────┘
       │         │         │      │
   ┌───▼───┐ ┌──▼──┐ ┌────▼──┐ ┌─▼────┐
   │Inbound│ │Out- │ │Inven- │ │Master│
   │ MFE   │ │bound│ │tory   │ │ MFE  │
   │       │ │ MFE │ │ MFE   │ │      │
   └───┬───┘ └──┬──┘ └────┬──┘ └─┬────┘
       │        │         │      │
   ┌───▼───┐ ┌──▼──┐ ┌────▼──┐ ┌─▼────┐
   │Inbound│ │Out- │ │Inven- │ │Master│
   │ BFF   │ │bound│ │tory   │ │ BFF  │
   │       │ │ BFF │ │ BFF   │ │      │
   └───┬───┘ └──┬──┘ └────┬──┘ └─┬────┘
       │        │         │      │
   ┌───▼───┐ ┌──▼──┐ ┌────▼──┐ ┌─▼────┐
   │Inbound│ │Out- │ │Inven- │ │Master│
   │ Svc   │ │bound│ │tory   │ │ Svc  │
   │       │ │ Svc │ │ Svc   │ │      │
   └───┬───┘ └──┬──┘ └────┬──┘ └─┬────┘
       │        │         │      │
    [DB]     [DB]      [DB]   [DB]

    팀 A    팀 B      팀 C    팀 D
```

### 11.2 통신 흐름 예시 — "출고 처리"

```
1. 사용자가 Outbound MFE에서 "출고 확정" 클릭
2. Outbound MFE → Outbound BFF 호출
3. Outbound BFF → Outbound Svc 호출
4. Outbound Svc:
   - 자기 DB의 출고 상태 변경
   - "OutboundConfirmed" 이벤트 발행 (Kafka)
5. Inventory Svc가 이벤트 구독:
   - 자기 DB의 재고 차감
   - "StockDecreased" 이벤트 발행
6. 화면은 WebSocket 또는 폴링으로 상태 갱신

✅ 출고 시점에 Inventory Svc가 죽어 있어도:
   → 이벤트는 Kafka에 쌓이고, 복구 후 자동 처리
   → 사용자는 "처리 중" 상태를 보다가 결과 확인
```

### 11.3 ⚠️ 1인 개발 환경에서의 현실

> **풀-SCS는 1인 개발 환경에서 거의 확실하게 오버엔지니어링이다.**

| 단계 | 추천 구조 | 이유 |
|---|---|---|
| **현재 (1인)** | 모듈러 모놀리식 + BFF 레이어만 분리 | 운영 부담 최소화 |
| **2~3인 팀** | 백엔드만 도메인별 분리, FE는 모놀리식 | 점진적 분리 시작 |
| **다중 팀** | 풀 SCS (MFE + BFF + 도메인 svc) | 팀 자율성이 필수가 됨 |

**현실적 절충안 — "SCS 마인드, BFF 구현"**:
1. **설계 마인드는 SCS로**: 바운디드 컨텍스트별 코드 폴더 분리
2. **구현은 BFF 패턴까지만**: React SPA + 도메인별 BFF + 도메인 svc
3. **MFE 도입은 보류**: 팀이 늘어나기 전엔 모듈 경계만 잘 그어두기

### 11.4 LearnFlow AI는 다르다

LearnFlow AI 같은 LMS는:
- 도메인 경계가 흐림 (강의 ↔ 학습 ↔ AI 채점이 강하게 결합)
- 트랜잭션 일관성이 자주 필요 (수강 ↔ 결제 ↔ 진도)

→ **모듈러 모놀리식 + BFF**가 SCS보다 더 적합할 가능성이 높음.

---

## 12. 자기 진단 체크리스트

### 🎯 개념 이해 (최소 8/10 통과)

- [ ] SCS 7원칙을 막힘없이 설명할 수 있다
- [ ] "수직 분할"과 "수평 분할"의 차이를 그림으로 그릴 수 있다
- [ ] BFF의 4가지 역할을 나열할 수 있다
- [ ] BFF에 들어가도 되는 코드와 안 되는 코드를 예시로 구분할 수 있다
- [ ] 5가지 MFE 통합 방식의 트레이드오프를 표로 그릴 수 있다
- [ ] Module Federation의 `remoteEntry.js` 역할을 설명할 수 있다
- [ ] Build-time composition이 왜 안티패턴인지 설명할 수 있다
- [ ] SCS 간 데이터 복제가 왜 필요한지 예시로 설명할 수 있다
- [ ] Eventual consistency를 받아들이지 못하면 왜 SCS가 어려운지 안다
- [ ] SCS 도입 판단 기준 4가지를 답할 수 있다

### 🛠 적용 능력 (최소 5/8 통과)

- [ ] 자신의 프로젝트에 SCS 경계를 그릴 수 있다
- [ ] 한 도메인의 BFF API 5개 이상을 설계할 수 있다
- [ ] BFF 코드 예시를 작성하면서 도메인 로직 누수를 피할 수 있다
- [ ] 두 SCS 간 데이터 복제 흐름을 시퀀스 다이어그램으로 그릴 수 있다
- [ ] 자신의 프로젝트가 SCS 도입에 적합한지 판단할 수 있다
- [ ] MFE를 도입할지 말지 트레이드오프 기반으로 결정할 수 있다
- [ ] Module Federation 설정을 보고 무슨 의미인지 읽을 수 있다
- [ ] 8가지 트랩 중 자신이 가장 빠지기 쉬운 것을 식별할 수 있다

### 🔍 분석/평가 (심화)

- [ ] StockPilot에 SCS를 적용할 때의 비용/이익을 정량적으로 추정할 수 있다
- [ ] 자신의 프로젝트에서 "어디서 SCS를 멈출지" 결정할 수 있다
- [ ] 풀-SCS가 오버엔지니어링이 되는 구체적 시점을 식별할 수 있다

---

## 13. 다음 학습 주제 추천

이 문서를 마쳤다면 다음 순서로 심화하면 좋다.

| 다음 주제 | 이유 |
|---|---|
| **Saga 패턴 (오케스트레이션 vs 코레오그래피)** | SCS 간 트랜잭션 처리의 핵심 |
| **Outbox 패턴** | 데이터 복제를 안정적으로 구현하려면 필수 |
| **CQRS + Event Sourcing** | SCS의 데이터 모델 분리에 잘 맞음 |
| **Service Mesh (Istio, Linkerd)** | SCS 간 통신의 회복성·관찰성 |
| **Backstage (개발자 포털)** | SCS가 늘어나면 카탈로그 관리가 필수 |
| **Module Federation 실습** | MFE 손에 익히기 |
| **Strangler Fig 패턴** | 모놀리식을 SCS로 점진적 전환 |

---

## 📚 참고 자료

| 자료 | 종류 | 추천 이유 |
|---|---|---|
| `scs-architecture.org` | 공식 사이트 | INNOQ가 운영하는 SCS 원전 |
| Sam Newman, *Building Microservices* (2nd ed.) | 책 | BFF 패턴의 정석 |
| Cam Jackson, "Micro Frontends" | Martin Fowler 블로그 | MFE 입문 필독 |
| Luca Mezzalira, *Building Micro-Frontends* | 책 | MFE 깊이 있는 가이드 |
| Zalando Mosaic | 오픈소스 | SCS의 살아있는 레퍼런스 구현 |
| Module Federation 공식 문서 | 문서 | 실제 구현할 때 |

---

## 🎬 마무리 한마디

> **SCS는 "기술 패턴"이 아니라 "조직 설계 패턴"이다.**

조직이 준비되지 않았는데 기술만 도입하면 100% 실패한다. 반대로 조직만 갖춰지면, 기술적 구현은 그 다음에 따라온다.

자신의 프로젝트에 적용할 때는:
1. **현재 단계를 정직하게 평가하기** (1인? 다중 팀?)
2. **마인드는 SCS로, 구현은 한 단계 낮춰서 시작하기**
3. **트랩을 외우기 전에 한 번씩 다 밟아보기** (실수해야 배운다)

---

*작성: MSA 학습 로드맵 보충 시리즈*
*포맷: 80/20 이론·실습 + Bloom's Taxonomy + 자기 진단 체크리스트 + 트랩 경고*
