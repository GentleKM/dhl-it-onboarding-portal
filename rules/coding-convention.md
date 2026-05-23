# 코딩 컨벤션

## 기본 규칙

- 변수명: camelCase
- 컴포넌트명: PascalCase
- 파일/폴더명: kebab-case (영문 소문자, 하이픈)
- 주석: 한글로 작성 (WHY 중심, WHAT 제외)
- 상수: UPPER_SNAKE_CASE

## 금지 사항

- `any` 타입 사용 금지 (명시적 타입 선언 필수)
- console.log 프로덕션 코드 내 사용 금지
- 불필요한 주석 금지 (코드가 스스로 설명해야 함)

## 파일 구조

- 각 기능별 디렉토리로 분리
- 공통 유틸: `src/lib/utils.ts`
- 타입: `src/types/index.ts`
- 정적 콘텐츠: `src/content/`

## Next.js 규칙

- 서버 컴포넌트 기본 사용
- 클라이언트 컴포넌트는 `"use client"` 명시
- API Route는 `src/app/api/` 하위에 위치
