---
name: test-and-verify
description: Phase 구현 완료 또는 신규 기능 반영 후 검증·커밋 전체 절차를 실행한다. npm test → Codex 리뷰 → 사용자 승인 → 커밋 순서를 자동으로 진행한다. 사용자가 "/test-and-verify"로 직접 호출할 수도 있다.
---

# 검증 및 커밋 (Test & Verify)

## 발동 조건
- Phase 구현 완료 후
- 신규 기능 반영 후
- 사용자가 `/test-and-verify` 로 직접 호출 시

인자로 Phase 번호를 전달하면 커밋 메시지에 반영한다.
예: `/test-and-verify Phase 6` → 커밋 메시지: `[Phase 6] ...`

## 수행 절차

### 1단계: npm test

```bash
npm test
```

- 전체 테스트 통과 확인
- **실패 시**: 원인 파악 → 수정 → 재실행. 통과 전까지 2단계 진행 불가
- 통과 시: "✅ npm test 전체 통과 (N개)" 보고 후 즉시 2단계 진행

### 2단계: Codex 리뷰 실행

`/codex:review` 를 호출한다. (Skill 도구 사용)

AGENTS.md 체크리스트 4개 항목 기준으로 현재 변경 코드를 리뷰:
1. 기능이 PRD 요구사항과 일치하는가?
2. 보안 취약점이 없는가? (SQL injection, XSS, key 열거 공격 등)
3. 핵심 로직 테스트가 작성되어 있고 `npm test` 전체 통과하는가?
4. 코딩 컨벤션(rules/coding-convention.md)을 준수하는가?

### 3단계: Codex 결과 수신

`/codex:result` 를 호출한다. (Skill 도구 사용)

결과를 항목별로 사용자에게 보고한다.

### 4단계: 사용자 승인 대기

- 리뷰 결과 및 반영 필요 여부를 사용자에게 명확히 전달
- **사용자 승인 없이 코드 수정 불가**
- 승인 시 피드백 반영 → 5단계 진행
- 수정 없음 확인 시 → 6단계 바로 진행

### 5단계: 피드백 반영 후 재확인

- 수정 사항이 있으면 `npm test` 재실행 → 전체 통과 확인
- 수정이 없으면 생략

### 6단계: 커밋 & 푸시

커밋 메시지 형식: `[Phase N] 영문 요약` (rules/git.md 참조)

```bash
git add -p   # 변경 파일 확인 후 스테이징
git commit
git push origin main
```

커밋 완료 후 사용자에게 완료 보고.
