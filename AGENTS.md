<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# DHL IT Onboarding Portal — Codex 진입점

Codex 역할: 기획자 & 검토자. 코드 작성은 Claude가 담당.

## 문서 목차

- [PRD](docs/PRD.md)
- [Architecture](docs/Architecture.md)
- [ADR](docs/ADR.md)
- [API](docs/API.md)

## 규칙 목차

- [AI 에이전트 정책](rules/ai-agent-policy.md) — 역할 분담, 작업 순서, 보고 방식
- [테스팅 및 Phase 검증 절차](rules/testing.md) — 단위 테스트, Codex 검토, Phase 커밋 절차
- [Git 커밋 규칙](rules/git.md) — 커밋 메시지 형식, 브랜치 전략, 배포 전/후 규칙
- [보안](rules/security.md) — 환경변수, 입력 검증, Key 보안
- [코딩 컨벤션](rules/coding-convention.md) — 네이밍, 타입, 파일 구조

## Codex 검토 체크리스트

각 Phase 완료 후:
1. 기능이 PRD 요구사항과 일치하는가?
2. 보안 취약점이 없는가? (SQL injection, XSS, key 열거 공격 등)
3. 핵심 로직 테스트가 작성되어 있고 `npm test` 전체 통과하는가?
4. 코딩 컨벤션([rules/coding-convention.md](rules/coding-convention.md))을 준수하는가?

> 전체 검증·커밋 절차 → [rules/testing.md](rules/testing.md) 참조
