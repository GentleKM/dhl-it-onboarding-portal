import { describe, it, expect, vi, beforeEach } from "vitest";

// Google Gemini API mock
vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(() => "mock-model"),
}));

// generateObject mock — 실제 AI 호출 없이 고정 응답 반환
vi.mock("ai", () => ({
  generateObject: vi.fn().mockResolvedValue({
    object: { solution: "MyDHL+", reason: "테스트용 추천 근거입니다. 이 텍스트는 50자 이상이어야 합니다. 충분한 길이를 맞춥니다." },
  }),
}));

import { getRecommendation } from "./recommend";
import type { SessionInput } from "@/types";

const baseInput: SessionInput = {
  businessType: "이커머스/온라인 쇼핑몰",
  mainProduct: "의류",
  monthlyShipments: 500,
  originCountry: "KR",
  destinationCountry: "US",
  hasItSystem: false,
};

describe("getRecommendation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("올바른 솔루션과 추천 이유를 반환한다", async () => {
    const result = await getRecommendation(baseInput);

    expect(result).toHaveProperty("solution");
    expect(result).toHaveProperty("reason");
    expect(["MyDHL+", "DEC", "MyDHL API"]).toContain(result.solution);
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it("반환된 solution은 4개 중 하나이다", async () => {
    const result = await getRecommendation(baseInput);
    const validSolutions = ["MyDHL+", "DEC", "MyDHL API"];
    expect(validSolutions).toContain(result.solution);
  });
});
