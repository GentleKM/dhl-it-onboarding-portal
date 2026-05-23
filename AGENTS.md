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

## Codex 검토 체크리스트

각 Phase 완료 후:
1. 기능이 PRD 요구사항과 일치하는가?
2. 보안 취약점이 없는가? (SQL injection, XSS, key 열거 공격 등)
3. DHL 브랜드 가이드라인을 준수하는가?
4. AI 추천 결과가 일관적이고 정확한가?
