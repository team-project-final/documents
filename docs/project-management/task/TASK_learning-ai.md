# TASK: @learning-ai-owner

> **담당 서비스**: learning-ai-svc
> **주차**: W1 (2026-05-12 ~ 2026-05-16)
> **관련 문서**: [SCOPE](../scope/SCOPE_learning-ai.md) | [PRD_W1](../prd/PRD_W1.md) | [WORKFLOW](../workflow/WORKFLOW_learning-ai_W1.md) | [HISTORY](../history/HISTORY_learning-ai.md)

---

## Step 1: 프로젝트 초기 설정

| 필드 | 내용 |
|------|------|
| **Step Name** | 프로젝트 초기 설정 |
| **Step Goal** | learning-ai-owner가 FastAPI + uvicorn 기반 learning-ai 프로젝트를 생성하여 Health endpoint와 기본 구조가 동작한다. |
| **Done When** | uvicorn → /health 200 OK + pytest 실행 + Dockerfile 빌드 |
| **Scope** | **In**: FastAPI 프로젝트 구조, uvicorn 설정, Health endpoint, Dockerfile / **Out**: AI 모델 연동, 비즈니스 로직, DB 연동 |
| **Input** | FastAPI 공식 문서, 팀 Python 프로젝트 표준 구조, PRD_W1 서비스 요구사항 |
| **Instructions** | 1. `pyproject.toml` 기반 프로젝트 초기화 (Poetry 또는 uv)<br>2. FastAPI + uvicorn 의존성 설정<br>3. 프로젝트 디렉토리 구조 생성 (`app/`, `app/api/`, `app/core/`, `app/services/`)<br>4. `/health` 엔드포인트 구현 (200 OK + 서비스명/버전 응답)<br>5. pytest 설정 및 health 테스트 작성<br>6. `Dockerfile` 작성 (multi-stage build)<br>7. `docker-compose.yml`에 서비스 추가<br>8. `.env.example` 및 설정 관리 (pydantic-settings) |
| **Output Format** | 프로젝트 디렉토리 구조 + Health 응답 JSON + Docker 빌드 로그 |
| **Constraints** | - Python 3.12+<br>- FastAPI 0.115+<br>- 포트: 8090<br>- async/await 기반 핸들러<br>- 타입 힌트 100% 적용 |
| **Duration** | 0.5일 |
| **RULE Reference** | [18-기술-스택](../../wiki/18-기술-스택.md) · [10-환경-설정](../../wiki/10-환경-설정.md) · [14-배포-가이드](../../wiki/14-배포-가이드.md) |
| **Assignee** | @learning-ai-owner |
| **Reviewer** | @tech-lead |

---

## Step 2: Claude API 연동

| 필드 | 내용 |
|------|------|
| **Step Name** | Claude API 연동 |
| **Step Goal** | learning-ai 서비스가 Anthropic Claude API를 호출하여 텍스트를 생성할 수 있다. |
| **Done When** | POST /api/v1/ai/generate → Claude 응답 + 에러 핸들링(429/500) + pytest mock 테스트 |
| **Scope** | **In**: Anthropic SDK 연동, 텍스트 생성 API, 에러 핸들링, 재시도 로직 / **Out**: 프롬프트 최적화, 스트리밍 응답, 사용량 추적 |
| **Input** | Anthropic Python SDK 문서, API Key 설정, PRD_W1 AI 기능 명세 |
| **Instructions** | 1. `anthropic` Python SDK 의존성 추가<br>2. `ClaudeService` 클래스 생성 (비동기 클라이언트)<br>3. POST `/api/v1/ai/generate` 엔드포인트 구현<br>4. Request/Response Pydantic 모델 정의<br>5. 429 (Rate Limit) 에러 시 exponential backoff 재시도 구현<br>6. 500 에러 시 fallback 응답 처리<br>7. pytest mock 테스트 작성 (정상/429/500 시나리오)<br>8. API Key를 환경변수로 관리 (ANTHROPIC_API_KEY) |
| **Output Format** | API 엔드포인트 + Request/Response 스키마 + 테스트 결과 |
| **Constraints** | - Claude 모델: claude-sonnet-4-20250514<br>- 최대 토큰: 4096<br>- 타임아웃: 30초<br>- 재시도 최대 3회 (1s, 2s, 4s 간격)<br>- API Key는 절대 코드에 하드코딩 금지 |
| **Duration** | 1.5일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) |
| **Assignee** | @learning-ai-owner |
| **Reviewer** | @tech-lead |

---

## Step 3: Embedding API 연동

| 필드 | 내용 |
|------|------|
| **Step Name** | Embedding API 연동 |
| **Step Goal** | learning-ai 서비스가 텍스트를 OpenAI Embedding API로 벡터(1536차원)로 변환할 수 있다. |
| **Done When** | POST /api/v1/ai/embed → 벡터 반환 + pgvector 저장 준비 + pytest 테스트 |
| **Scope** | **In**: OpenAI Embedding API 연동, 벡터 변환, pgvector 스키마 준비 / **Out**: 유사도 검색, RAG 파이프라인, 벡터 인덱싱 최적화 |
| **Input** | OpenAI Embedding API 문서, pgvector 설정 가이드, PRD_W1 임베딩 요구사항 |
| **Instructions** | 1. `openai` Python SDK 의존성 추가<br>2. `EmbeddingService` 클래스 생성 (비동기)<br>3. POST `/api/v1/ai/embed` 엔드포인트 구현<br>4. 텍스트 → 1536차원 벡터 변환 로직<br>5. pgvector 확장 활성화 및 `embeddings` 테이블 마이그레이션 (Alembic)<br>6. 배치 임베딩 지원 (최대 20개 텍스트 동시 처리)<br>7. pytest mock 테스트 작성 (단일/배치/에러 시나리오)<br>8. 입력 텍스트 길이 검증 (최대 8192 토큰) |
| **Output Format** | API 엔드포인트 + 벡터 응답 예시 + DB 스키마 + 테스트 결과 |
| **Constraints** | - 모델: text-embedding-3-small (1536차원)<br>- 입력 최대: 8192 토큰<br>- 배치 최대: 20건<br>- pgvector 확장 필수<br>- 벡터 저장 시 normalize 적용<br>- API Key 환경변수 관리 (OPENAI_API_KEY) |
| **Duration** | 2일 |
| **RULE Reference** | [03-아키텍처](../../wiki/03-아키텍처.md) · [18-기술-스택](../../wiki/18-기술-스택.md) · [14-배포-가이드](../../wiki/14-배포-가이드.md) |
| **Assignee** | @learning-ai-owner |
| **Reviewer** | @tech-lead |
