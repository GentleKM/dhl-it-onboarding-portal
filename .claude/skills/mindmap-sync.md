---
name: mindmap-sync
description: "프로젝트 목적·구조·기능·기술 스택·폴더 구조·주요 설정"이 생성 또는 변경되었을 때 사용한다. docs/mindmap.md를 실제 프로젝트 상태에 맞게 최신화한다. 사용자가 "/update-mindmap"으로 직접 호출할 수도 있다.
---

# 마인드맵 동기화 (Mindmap Sync)

## 이 문서의 성격 (가장 중요)
- docs/mindmap.md는 **전체 구조 및 진행 상황을 한눈에 확인하기 위한 조망 전용 문서**다.
- **절대 개발·구현의 기준 문서로 삼지 않는다.**
- 이 파일을 보고 코드나 다른 문서를 추측·생성하지 않는다.
- 갱신 방향은 항상 [원본(코드·설계문서) → 마인드맵] 한 방향뿐이다.

## 발동 조건 (언제 갱신하는가)
다음 상황이 발생하면 docs/mindmap.md를 갱신한다:
- 폴더 구조 추가/삭제/이동
- 기술 스택 추가 및 변경 (라이브러리 추가/교체)
- 주요 설정 추가 및 변경 (배포 방식, 환경변수 구조 등)
- 새 기능/페이지/API 라우트 추가 및 변경
- Git commit

## 저장 위치 규칙
- 파일은 반드시 `docs/mindmap.md`에 둔다.
- src/, public/ 등 빌드·실행·배포에 포함되는 경로에는 절대 생성하지 않는다.
  (public/은 외부에 그대로 노출되므로 금지)

## 수행 절차
1. 현재 폴더 구조와 주요 설정 파일(package.json 등)을 확인한다.
2. docs/mindmap.md를 아래 Markmap 형식으로 갱신한다.
3. 파일 최상단에 조망 전용 경고 주석을 항상 유지한다.
4. 변경된 부분만 요약해 사용자에게 보고한다.

## 출력 형식 (Markmap 문법)
- 파일 첫 줄은 아래 경고를 그대로 유지한다:
  `<!-- 이 문서는 조망 전용입니다. 개발·구현의 기준으로 사용하지 마세요. 원본: docs/, src/ -->`
- 최상위: `#` 프로젝트명 (1단계)
- 대분류: `##` 기술스택 / 폴더구조 / 개발단계 등 (2단계)
- 중분류: `-` 리스트 (3단계)
- 세부: 들여쓴 `-` 리스트 (4단계)
- **들여쓰기는 최대 4단계까지만.** 그 이상 깊어지면 항목을 묶거나 생략한다.
- 각 항목에 대한 간단한 설명을 한 줄로 추가한다.

## Markmap 예시
```markdown
<!-- 이 문서는 조망 전용입니다. 개발·구현의 기준으로 사용하지 마세요. 원본: docs/, src/ -->
# DHL IT Onboarding Portal

## 🎯 목적
- DHL 신규 고객이 최적 솔루션을 쉽게 찾도록 AI가 맞춤 추천
- 입력 → AI 분석 → 솔루션 추천 + 통관 안내

## 📦 추천 솔루션 (3가지)
- **MyDHL+**: 빠른 시작, 시스템 연동 불필요
- **DEC**: 이커머스 대량 발송, Shopify 연동
- **MyDHL API**: 자체 IT 인프라 기업, ERP/WMS 연동

## 🖥️ 기술 스택
### Frontend / Backend
- Next.js 16 (App Router)
- React 19
- TypeScript

### UI
- Tailwind CSS v4
- Shadcn.ui (Radix UI 기반)
- DHL 브랜드 색상: `#FFCC00` `#D40511`

### 서비스
- Supabase (PostgreSQL DB)
- Vercel AI SDK + Gemini 2.5 Flash (Free Tier)
- Resend (이메일 발송)
- Zod (입력 검증)

### 배포
- Vercel (GitHub 자동 배포)

## 📁 폴더 구조
### 루트
- `CLAUDE.md` — Claude 진입점 (목차만)
- `AGENTS.md` — Codex 진입점 (목차만)
- `.env.local.example` — 환경 변수 템플릿
- `components.json` — Shadcn.ui 설정

### docs/
- `PRD.md` — 무엇을 만드는가
- `Architecture.md` — 어떻게 만드는가
- `ADR.md` — 왜 그렇게 결정했는가
- `API.md` — API 명세
- `mindmap.md` — 프로젝트 전체 마인드맵 (현재 파일)

### rules/
- `coding-convention.md` — camelCase, 한글 주석
- `security.md` — 환경변수, XSS, Rate Limiting
- `git.md` — git 규칙
- `testing.md` — TDD 원칙
- `ai-agent-policy.md` — Claude/Codex 역할 분담

### src/app/
- `page.tsx` — 홈 (입력 폼 + 재조회)
- `result/[key]/page.tsx` — 결과 페이지
- `api/recommend/route.ts` — AI 추천 API
- `api/email/route.ts` — 이메일 발송 API

### src/components/
- `ui/` — Button, Card, Input, Label, Select
- `intake-form/` — 입력 폼 컴포넌트
- `result/` — 결과 페이지 컴포넌트

### src/lib/
- `supabase/client.ts` — 브라우저 클라이언트
- `supabase/server.ts` — 서버 클라이언트
- `ai/recommend.ts` — Claude 추천 로직
- `email/send.ts` — Resend 이메일 템플릿

### src/content/
- `customs-guide.ts` — 통관 용어 설명 (수동 편집용)

### supabase/
- `migrations/001_sessions.sql` — DB 스키마 + key 생성 함수

## 📊 DB 스키마 (sessions 테이블)
- `id` UUID (PK)
- `key` CHAR(6) — 6자리 숫자, 중복 불가
- `business_type` TEXT — 업종
- `main_product` TEXT — 주요 발송물
- `monthly_shipments` INT — 월 발송 건수
- `origin_country` VARCHAR(2) — 출발 국가
- `destination_country` VARCHAR(2) — 도착 국가
- `has_it_system` BOOLEAN — IT 시스템 보유 여부
- `recommended_solution` TEXT — 추천 솔루션
- `recommendation_reason` TEXT — AI 추천 근거
- `created_at` TIMESTAMPTZ

## 🔄 서비스 흐름
- 사용자 → 홈 페이지 입력 (6개 질문)
- → POST /api/recommend
- → Claude AI 분석 (generateObject)
- → Supabase 저장 + 6자리 key 발급
- → /result/[key] 결과 페이지
- → (선택) 이메일 발송 (Resend)
- → key로 언제든 재조회 가능

## 📝 입력 폼 질문 (6개)
1. 업종 (자유 입력)
2. 주요 발송물 (자유 입력)
3. 월 발송 건수 (숫자)
4. 출발 국가
5. 도착 국가
6. IT 시스템/개발팀 보유 여부 (있음 / 없음 / 모르겠음)

## 🚀 개발 Phase
### Phase 1 ✅ 완료 (2026-05-24)
- Next.js 프로젝트 생성
- 의존성 설치 (Supabase, AI SDK, Resend, Zod, Vitest)
- Shadcn.ui 컴포넌트 수동 생성
- DHL 브랜드 색상 적용
- 프로젝트 문서 구조 생성
- DB 마이그레이션 스크립트
- AI 추천 로직 / 이메일 로직 초안
- GitHub 연결

### Phase 2 ✅ 완료 (2026-05-25)
- Anthropic → Gemini 2.5 Flash (Free Tier) 전환
- Supabase sessions 테이블 + key 생성 함수 마이그레이션 실행
- 6개 질문 Intake Form UI 구현 (Zod 검증 + 로딩 상태)
- `/api/recommend` API 구현 (Gemini AI → DB 저장 → key 반환)
- **완료 조건 달성**: 폼 제출 → AI 추천 → 6자리 key 발급 확인

### Phase 3 ✅ 완료 (2026-05-25)
- 결과 페이지(`/result/[key]`) 전면 구현
- 추천 솔루션 카드 (AI 근거 + 입력 요약)
- 4개 솔루션 비교표 (추천 솔루션 하이라이트)
- 통관 용어 섹션 (6개 용어 카드)
- 6자리 key 복사 버튼
- **완료 조건 달성**: 모든 정보 표시 확인

### Phase 4 — 이메일 발송 (pending)
- Resend API 연동
- 이메일 템플릿 (솔루션 + key + 링크)
- 이메일 발송 버튼 활성화
- **완료 조건**: 이메일 수신 + 토스트 피드백

### Phase 5 — Rate Limiting + 보안 강화 (pending)
- Key 열거 공격 방지 Rate Limiting
- `/result/[key]` 존재하지 않는 key 처리
- **완료 조건**: 1분 내 10회 이상 시도 시 차단

## 🤖 AI 핸즈온 엔지니어링
### Claude (개발자)
- 코드 작성 및 구현
- Phase별 기능 개발

### Codex (기획자/검토자)
- Phase 1: 설정 완료 여부 검토
- Phase 2: UX/접근성 리뷰
- Phase 3: 프롬프트 품질 검토
- Phase 4: 브랜드 일치 여부 리뷰
- Phase 5: 보안 취약점 검토
- Phase 6: 최종 E2E 검토

## 🔐 보안 설계
- 환경 변수: `.env.local` (절대 Git 커밋 금지)
- 입력 검증: Zod 서버 검증
- Key 보안: Rate Limiting 예정 (열거 공격 방지)
- AI Prompt Injection 방지: 사용자 입력 → 구조화된 JSON 전달

## 🌍 통관 정보 관리
- `src/content/customs-guide.ts` 파일 직접 편집
- 현재 6개 항목: HS 코드, 인코텀즈, 상업송장, 원산지증명서, 관세, 부가가치세
- 추가 방법: `customsTerms` 배열에 객체 추가 후 저장

## ⚙️ 환경 변수
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_BASE_URL`

## 📌 주요 의사결정 (ADR)
- **generateObject 사용**: Zod 타입 강제로 파싱 오류 방지
- **로그인 없음 + 6자리 key**: 진입 장벽 최소화
- **통관 정보 정적 관리**: 외부 API 불필요, 용어 설명만 제공
- **Tailwind v4**: Next.js 16 기본 설정, Shadcn 수동 생성으로 대응
```
