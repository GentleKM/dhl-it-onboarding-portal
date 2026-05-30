import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import type { RouteWarning } from "@/types";

const warningsSchema = z.object({
  warnings: z
    .array(
      z.object({
        title: z.string().min(1).max(50),
        description: z.string().min(1).max(100),
      })
    )
    .length(2),
});

const SYSTEM_PROMPT = `당신은 국제 물류 및 통관 전문가입니다.
주어진 출발국가 → 도착국가 구간에서 처음 해외배송을 하는 사람이 반드시 알아야 할
통관·세금·발송 제한 관련 주의사항 2가지를 한국어로 제공하세요.

각 항목 규칙:
- 실제로 통관 거절, 추가 비용, 지연이 발생할 수 있는 critical한 내용
- 초보자도 바로 이해할 수 있는 쉬운 표현
- description은 100자 이내의 완전한 문장으로 작성`;

export async function getRouteWarnings(
  originCountry: string,
  destinationCountry: string
): Promise<RouteWarning[]> {
  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: warningsSchema,
    system: SYSTEM_PROMPT,
    prompt: `출발 국가 코드: ${originCountry}\n도착 국가 코드: ${destinationCountry}`,
  });

  return object.warnings;
}
