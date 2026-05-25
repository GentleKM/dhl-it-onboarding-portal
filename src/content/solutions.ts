// DHL 4개 솔루션 정적 콘텐츠 — 비교표 및 결과 페이지에서 사용
// 내용 수정이 필요하면 이 파일을 직접 편집하세요.

import type { DhlSolution } from "@/types";

export interface SolutionInfo {
  id: DhlSolution;
  name: string;
  tagline: string; // 한 줄 요약
  features: string[]; // 주요 특징 3가지
  bestFor: string; // 적합 고객 유형
  systemIntegration: string; // 시스템 연동 여부
  shipmentScale: string; // 발송 규모
  industries: string; // 적합 업종
  color: string; // 강조 색상 (Tailwind)
}

export const solutions: SolutionInfo[] = [
  {
    id: "MyDHL+",
    name: "MyDHL+",
    tagline: "가장 빠르게 DHL 발송을 시작하는 방법",
    features: [
      "별도 개발 없이 웹에서 즉시 사용",
      "모든 산업 및 발송 규모 지원",
      "운송장 출력·배송 추적·인보이스 관리",
    ],
    bestFor: "시스템 연동 없이 빠르게 시작하고 싶은 기업",
    systemIntegration: "불필요",
    shipmentScale: "소~대량",
    industries: "모든 업종",
    color: "blue",
  },
  {
    id: "DEC",
    name: "DEC",
    tagline: "이커머스 대량 발송 전문 솔루션",
    features: [
      "Shopify·WooCommerce 등 커머스 플랫폼 연동",
      "B2C 발송 및 대량 운송장 출력 최적화",
      "주문 데이터 자동 연동으로 발송 오류 감소",
    ],
    bestFor: "온라인 쇼핑몰·이커머스 운영 기업",
    systemIntegration: "커머스 플랫폼 연동",
    shipmentScale: "중~대량",
    industries: "이커머스/온라인 쇼핑몰",
    color: "green",
  },
  {
    id: "MyDHL API",
    name: "MyDHL API",
    tagline: "ERP·WMS와 DHL을 직접 연결하는 API",
    features: [
      "REST API로 사내 시스템과 DHL 직접 통합",
      "ERP·WMS·OMS 등 기업 시스템 연동",
      "고도화된 물류 자동화 및 커스터마이징 지원",
    ],
    bestFor: "자체 IT 인프라를 보유한 기업 고객",
    systemIntegration: "ERP/WMS API 연동",
    shipmentScale: "대량",
    industries: "제조/물류/IT 기업",
    color: "purple",
  },
  {
    id: "DCIS",
    name: "DCIS",
    tagline: "반도체·기술 산업 전문 발송 솔루션",
    features: [
      "복잡한 인보이스 처리 및 대량 발송 지원",
      "반도체·전자·IT 산업 특화 기능",
      "정밀 부품 배송 추적 및 컴플라이언스 관리",
    ],
    bestFor: "반도체·전자·기술 산업의 대량 발송 기업",
    systemIntegration: "시스템 연동 지원",
    shipmentScale: "대량",
    industries: "반도체/전자/IT",
    color: "orange",
  },
];

// 솔루션 ID로 빠르게 조회하는 Map
export const solutionMap = new Map<DhlSolution, SolutionInfo>(
  solutions.map((s) => [s.id, s])
);

// 비교표 항목
export const COMPARISON_ROWS = [
  { key: "systemIntegration" as const, label: "시스템 연동" },
  { key: "shipmentScale" as const, label: "발송 규모" },
  { key: "industries" as const, label: "적합 업종" },
  { key: "bestFor" as const, label: "추천 대상" },
] satisfies { key: keyof Pick<SolutionInfo, "systemIntegration" | "shipmentScale" | "industries" | "bestFor">; label: string }[];
