# 테스팅 규칙

## 테스트 원칙

- UI 컴포넌트·단순 유틸리티는 제외, **핵심 로직만** 테스트한다
- 핵심 로직: AI 추천, API Route 입력 검증, DB 저장·조회

## 테스트 도구

- **Vitest** — 단위 테스트 및 통합 테스트
- 설치: `npm install -D vitest @vitejs/plugin-react`
- 설정 파일: `vitest.config.ts` (프로젝트 루트)
- 실행: `npm test` (단발) / `npm run test:watch` (감시 모드)

## 테스트 범위

| 대상 | 파일 | 테스트 내용 |
|---|---|---|
| AI 추천 로직 | `src/lib/ai/recommend.ts` | 4개 솔루션이 입력 조건에 따라 올바르게 분류되는지 |
| API Route | `src/app/api/recommend/route.ts` | 입력 검증(Zod), 에러 처리, 응답 형식 |
| DB 저장·조회 | `src/lib/supabase/` | 세션 저장 및 6자리 key 조회 |

## 테스트 환경 (Mock 처리)

외부 서비스는 모두 mock으로 대체한다. 실제 API 키·DB 연결 없이 실행 가능해야 한다.

**Google Gemini API mock**
```ts
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => 'mock-model'),
}))
vi.mock('ai', () => ({
  generateObject: vi.fn().mockResolvedValue({
    object: { solution: 'MyDHL+', reason: '테스트용 추천 근거입니다.' },
  }),
}))
```

**Supabase 클라이언트 mock**
```ts
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: { key: '123456' }, error: null }),
      select: vi.fn().mockResolvedValue({ data: [{ key: '123456' }], error: null }),
    })),
  })),
}))
```

## 테스트 실행 시점

- **커밋 전 반드시 실행** — `npm test` 전체 통과 후 커밋한다
- 테스트 실패 시 커밋·Codex 검토 요청 불가
