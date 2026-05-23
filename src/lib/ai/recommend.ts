import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { SessionInput, RecommendResponse } from "@/types";

const SYSTEM_PROMPT = `당신은 DHL 솔루션 전문가입니다. 고객 정보를 바탕으로 아래 4가지 솔루션 중
가장 적합한 하나를 추천하고, 명확한 이유를 한국어로 설명하세요.

[솔루션 기준]
- MyDHL+: 시스템 연동 없이 빠르게 DHL 발송을 시작하고 싶은 고객. 별도 개발 없이 웹페이지에서 바로 사용 가능하며 모든 산업 및 다양한 규모의 고객이 사용할 수 있는 DHL의 대표 발송 솔루션입니다.
- DEC: 온라인 쇼핑몰, 이커머스 중심의 대량 발송 고객. B2C 발송에 특화된 솔루션으로 대량 운송장 출력에 최적화되어 있으며 Shopify 등 주요 커머스 플랫폼과 연동이 가능합니다.
- MyDHL API: 자체 IT 인프라를 보유하고 있고, 고도화된 물류 자동화를 원하는 기업 고객. 고객사의 내부 시스템(ERP, WMS 등)과 DHL을 직접 연결하는 방식입니다.
- DCIS: 반도체 및 기술 산업 고객을 위한 발송 솔루션. 대량 발송 및 복잡한 인보이스 처리가 필요한 고객에게 적합합니다.

[추천 시 고려사항]
- 업종이 반도체/전자/기술 산업이면 DCIS를 우선 고려하세요.
- IT 시스템이나 개발팀이 있으면 MyDHL API를 고려하세요.
- 이커머스/온라인 쇼핑몰 운영자이면 DEC를 고려하세요.
- 위 조건에 해당하지 않으면 MyDHL+를 기본으로 추천하세요.

추천 이유는 고객의 구체적인 상황(업종, 발송량, 발송 국가 등)을 언급하며 3~5문장으로 설명하세요.`;

const recommendSchema = z.object({
  solution: z.enum(["MyDHL+", "DEC", "MyDHL API", "DCIS"]),
  reason: z.string().min(50),
});

export async function getRecommendation(input: SessionInput): Promise<RecommendResponse> {
  const userMessage = `
고객 정보:
- 업종: ${input.businessType}
- 주요 발송물: ${input.mainProduct}
- 월 발송 건수: ${input.monthlyShipments}건
- 출발 국가: ${input.originCountry}
- 도착 국가: ${input.destinationCountry}
- IT 시스템/개발팀 보유 여부: ${
    input.hasItSystem === true ? "있음" : input.hasItSystem === false ? "없음" : "잘 모르겠음"
  }
  `;

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-6"),
    schema: recommendSchema,
    system: SYSTEM_PROMPT,
    prompt: userMessage,
  });

  return object;
}
