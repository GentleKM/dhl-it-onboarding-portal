# 보안 규칙

## 환경 변수

- API 키, 비밀번호 등 민감 정보는 `.env.local`에 저장
- 클라이언트에 노출될 변수만 `NEXT_PUBLIC_` 접두사 사용
- `.env.local`은 절대 Git에 커밋하지 않음 (`.gitignore`에 포함)

## 입력 검증

- 모든 사용자 입력은 Zod 스키마로 서버에서 검증
- SQL은 Supabase 클라이언트 사용 (파라미터 바인딩 자동 처리)
- XSS 방지: React 기본 이스케이프 활용

## 6자리 Key 보안

- Key 조회 API에 Rate Limiting 적용 예정 (Vercel Edge Config 또는 Upstash Redis) — Phase 5 구현
- 존재하지 않는 Key 조회 시 동일한 에러 응답 반환 (열거 공격 방지)

## AI 관련

- AI가 생성한 코드는 정기적으로 보안 리뷰 수행
- 사용자 입력을 AI 프롬프트에 직접 삽입 시 prompt injection 방지
  → 사용자 입력은 구조화된 JSON 형태로 전달
