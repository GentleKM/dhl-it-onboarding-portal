# Architecture — DHL IT Onboarding Portal

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend/Backend | Next.js 16 (App Router) |
| 언어 | TypeScript |
| UI | Shadcn.ui + Tailwind CSS v4 |
| DB | Supabase (PostgreSQL) |
| AI | Vercel AI SDK + Gemini 2.5 Pro (Free Tier) |
| 이메일 | Resend |
| 배포 | Vercel |

## 디렉토리 구조

```
src/
├── app/
│   ├── page.tsx                    # 홈 (입력 폼 + 재조회)
│   ├── result/[key]/page.tsx       # 결과 페이지
│   └── api/
│       ├── recommend/route.ts      # AI 추천 API (POST)
│       └── email/route.ts          # 이메일 발송 API (POST)
├── components/
│   ├── ui/                         # Shadcn 기본 컴포넌트
│   ├── intake-form/                # 입력 폼 관련 컴포넌트
│   └── result/                     # 결과 페이지 컴포넌트
├── lib/
│   ├── supabase/client.ts          # 브라우저 Supabase 클라이언트
│   ├── supabase/server.ts          # 서버 Supabase 클라이언트
│   ├── ai/recommend.ts             # AI 추천 로직
│   └── email/send.ts               # Resend 이메일 발송
├── content/
│   └── customs-guide.ts            # 통관 용어 정적 콘텐츠 (수동 편집용)
└── types/index.ts                  # 공통 타입
```

## 데이터 흐름

```
사용자 입력 → /api/recommend → Gemini AI → 결과 생성
                                          ↓
                              Supabase에 세션 저장 (6자리 key 발급)
                                          ↓
                              /result/[key] 페이지로 이동
                                          ↓
                              (선택) 이메일 발송 → Resend
```

## DB 스키마

`supabase/migrations/001_sessions.sql` 참조.

## 환경 변수

`.env.local.example` 참조.
