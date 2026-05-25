# ADR — Architecture Decision Records

## ADR-001: AI SDK generateObject 사용

**날짜:** 2026-05-23
**결정:** Claude AI 추천 시 `generateText` 대신 `generateObject` 사용
**이유:** Zod 스키마로 응답 타입을 강제해 파싱 오류 없이 솔루션명과 추천 이유를 안전하게 추출
**트레이드오프:** 스트리밍 불가. 로딩 UI로 대응.

## ADR-002: 별도 로그인 없음 + 6자리 숫자 코드

**날짜:** 2026-05-23
**결정:** 사용자 인증 없이 6자리 랜덤 숫자로 결과 재조회
**이유:** 진입 장벽 최소화. DHL 첫 사용자에게 회원가입을 요구하지 않음.
**트레이드오프:** 6자리 숫자는 열거 가능(100만 경우의 수). Rate limiting 추가 예정.

## ADR-003: 통관 정보 정적 콘텐츠

**날짜:** 2026-05-23
**결정:** 통관 용어 설명을 `src/content/customs-guide.ts`에 정적으로 관리
**이유:** 특정 국가/품목 정보는 제공하지 않고 용어 설명만 제공하므로, 외부 API 불필요.
**트레이드오프:** 내용 추가 시 파일 직접 편집 필요. 향후 CMS 연동 고려 가능.

## ADR-005: Gemini Free Tier 선택

**날짜:** 2026-05-25
**결정:** Anthropic Claude 대신 Google Gemini 1.5 Flash (Free Tier) 사용
**이유:**
- 무료 API 할당량으로 프로토타입 단계 비용 절감
- Vercel AI SDK의 `@ai-sdk/google` 패키지로 기존 `generateObject` 인터페이스 그대로 유지
- Gemini 2.0 Flash Exp는 구조화된 출력(Zod 스키마) 완벽 지원
**트레이드오프:** Claude 대비 한국어 추론 품질 차이 가능. 필요 시 Claude로 복귀 용이 (Vercel AI SDK 추상화).

## ADR-004: Tailwind v4 사용

**날짜:** 2026-05-23
**결정:** create-next-app 기본 설정인 Tailwind v4 사용
**이유:** Next.js 16과 함께 설치된 최신 버전 유지
**트레이드오프:** Shadcn.ui CLI 대신 컴포넌트 수동 생성 필요 (v4 호환 CLI 제한).
