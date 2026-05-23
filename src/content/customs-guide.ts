// 통관 용어 설명 — 이 파일을 직접 편집해 내용을 추가/수정하세요.
// 새 항목 추가: { term, description, example } 객체를 배열 끝에 추가

export interface CustomsTerm {
  term: string;
  description: string;
  example?: string;
}

export const customsTerms: CustomsTerm[] = [
  {
    term: "HS 코드 (Harmonized System Code)",
    description:
      "국제 무역에서 화물의 종류를 분류하는 국제 표준 코드입니다. 6자리 숫자로 구성되며, 통관 시 적용되는 관세율과 규제를 결정하는 핵심 정보입니다.",
    example: "예: 6109 = T셔츠류, 8542 = 반도체 집적회로",
  },
  {
    term: "인코텀즈 (Incoterms)",
    description:
      "수출자와 수입자 사이에서 운임, 보험료, 통관 비용을 각각 누가 부담하는지 정의한 국제 거래 조건입니다. 계약 시 반드시 명시해야 합니다.",
    example: "예: DAP (Delivered at Place) — 목적지까지 판매자 부담, 수입 통관 비용은 구매자 부담",
  },
  {
    term: "상업 송장 (Commercial Invoice)",
    description:
      "수출 화물에 첨부하는 거래 명세서입니다. 품목명, 수량, 단가, 총액, HS 코드, 원산지 등이 포함되며 통관 심사의 핵심 서류입니다.",
    example: "DHL 발송 시 전자 상업 송장(ePaperless Trade)을 활용하면 통관이 더 빠릅니다.",
  },
  {
    term: "원산지 증명서 (Certificate of Origin)",
    description:
      "화물이 어느 나라에서 생산/제조되었는지를 증명하는 서류입니다. FTA(자유무역협정)를 적용받을 때 관세 혜택을 받기 위해 필요합니다.",
    example: "한-EU FTA 적용 시 원산지 증명서 제출로 관세 절감 가능",
  },
  {
    term: "관세 (Customs Duty)",
    description:
      "수입국이 수입 화물에 부과하는 세금입니다. HS 코드와 원산지에 따라 세율이 다르며, 수입자가 납부합니다.",
    example: "미국은 의류류에 약 12~32% 관세를 부과합니다. (국가별·품목별로 상이)",
  },
  {
    term: "부가가치세 (VAT / GST)",
    description:
      "수입 시 관세 외에 추가로 부과되는 소비세입니다. 국가마다 세율이 다르며, 수입자가 납부합니다.",
    example: "영국 VAT 20%, 독일 VAT 19%, 호주 GST 10%",
  },
];
