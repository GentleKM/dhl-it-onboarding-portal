# DHL IT Onboarding Portal

Claude Code 진입점. 상세 내용은 아래 문서 참조.

## 문서 목차

- [PRD](docs/PRD.md) — 무엇을 만드는가
- [Architecture](docs/Architecture.md) — 어떻게 만드는가
- [ADR](docs/ADR.md) — 왜 그렇게 결정했는가
- [API](docs/API.md) — API 명세

## 규칙

- [코딩 컨벤션](rules/coding-convention.md)
- [보안](rules/security.md)
- [테스팅 및 Phase 검증 절차](rules/testing.md) — 단위 테스트, Codex 검토, 커밋 전 체크리스트
- [AI 에이전트 정책](rules/ai-agent-policy.md)
- [Git 커밋 규칙](rules/git.md)

## 핵심 원칙

- 큰 작업은 5~10개 Phase로 나눠 순차 진행. 각 Phase 전후 `status.json` 확인/기록
- **코드 변경 전 관련 docs/·rules/를 먼저 확인·업데이트하고, 변경 후 docs/·rules/와 불일치가 생기면 즉시 동기화**
- 주요 의사결정은 docs/ADR.md에 기록
- 기능 구현 전 테스트 코드 먼저 작성 (TDD)
- 모든 폴더·파일명은 영문 소문자 (인코딩 오류 방지)
