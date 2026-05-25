# 테스팅 규칙

## Phase 완료 후 검증·커밋 절차

커밋 메시지 형식·브랜치 전략 → [rules/git.md](git.md) 참조

| 순서 | 작업 | 비고 |
|------|------|------|
| 1 | Phase 코드 구현 완료 | |
| 2 | `npm test` 실행 → 전체 통과 확인 | 실패 시 수정 후 재실행. 세부 사항 → 1단계 참조 |
| 3 | `/codex:review` 호출 → AGENTS.md 체크리스트 기준 코드 리뷰 실행 | `npm test` 통과 직후 자동 호출. 세부 사항 → 2단계 참조 |
| 4 | `/codex:result` 호출 → 리뷰 결과 수신 후 사용자에게 보고 및 승인 요청, 승인 시 피드백 반영 | 사용자 승인 없이 코드 수정 불가 |
| 5 | 피드백 반영 후 `npm test` 재확인 | 수정이 없으면 생략 |
| 6 | `[Phase N] 영문 요약` 형식으로 커밋 → `git push origin main` | |

---

## 1단계: npm test — 자동 단위 테스트

Vitest 기반의 자동화된 단위 테스트. 코드 버그·엣지케이스를 객관적(pass/fail)으로 검출한다.

### 원칙

- UI 컴포넌트·단순 유틸리티는 제외, **핵심 로직만** 테스트한다
- 핵심 로직: AI 추천, API Route 입력 검증, DB 저장·조회, 이메일 발송
- 기능 구현 전 테스트 코드 먼저 작성 (TDD)
- 테스트 실패 시 커밋·Codex 검토 불가

### 도구

- **Vitest** — 단위 테스트 및 통합 테스트
- 설정 파일: `vitest.config.ts` (프로젝트 루트)
- 실행: `npm test` (단발) / `npm run test:watch` (감시 모드)

### 테스트 범위

| 대상 | 파일 | 테스트 내용 |
|---|---|---|
| AI 추천 로직 | `src/lib/ai/recommend.ts` | 솔루션 반환값, 4개 유효값 검증 |
| 이메일 발송 로직 | `src/lib/email/send.ts` | 정상 완료, 수신자 전달, HTML 이스케이프 방어 |
| API Route | `src/app/api/recommend/route.ts` | 입력 검증(Zod), 에러 처리, 응답 형식 |

### 테스트 환경 (Mock 처리)

외부 서비스는 모두 mock으로 대체한다. 실제 API 키·DB 연결 없이 실행 가능해야 한다.

#### Google Gemini API mock

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

#### Resend mock (`vi.hoisted` 필수)

`vi.mock`은 파일 상단으로 호이스팅되므로, mock 내부에서 참조할 변수는 반드시 `vi.hoisted()`로 선언한다.

```ts
const mockSend = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null })
)
vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return { emails: { send: mockSend } }
  }),
}))
```

#### Supabase 클라이언트 mock

```ts
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: { key: '123456' }, error: null }),
      select: vi.fn().mockResolvedValue({ data: [{ key: '123456' }], error: null }),
    })),
  })),
}))
```

---

## 2단계: Codex 검토 — 품질·적합성 리뷰

`npm test`가 잡지 못하는 **PRD 준수, 보안, UX, 코딩 컨벤션**을 주관적으로 판단한다.
별도의 mock이나 테스트 환경 없이 코드 자체를 리뷰한다.

### 검토 체크리스트 (AGENTS.md 기준)

1. 기능이 PRD 요구사항과 일치하는가?
2. 보안 취약점이 없는가? (SQL injection, XSS, key 열거 공격 등)
3. 핵심 로직 테스트가 작성되어 있고 `npm test` 전체 통과하는가?
4. 코딩 컨벤션([rules/coding-convention.md](coding-convention.md))을 준수하는가?

### /codex:review — 리뷰 실행

- `npm test` 통과 직후 Claude가 자동 호출
- AGENTS.md 체크리스트 4개 항목 기준으로 현재 Phase 변경 코드를 리뷰

### /codex:result — 결과 수신 및 반영

- 리뷰 결과를 수신하여 사용자에게 항목별로 보고
- **사용자 승인 없이 코드 수정 불가**
- 승인 후 피드백 반영 → `npm test` 재확인 → 커밋