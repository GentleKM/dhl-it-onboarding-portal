import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateObject = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    object: {
      warnings: [
        {
          title: "관세 및 부가세 부과",
          description: "미국 발송 시 $800 초과 물품은 관세와 부가세가 부과되므로 사전에 세금 계획을 세워두세요.",
        },
        {
          title: "수입 금지 품목 확인",
          description: "도착국 규정에 따라 특정 품목은 반입이 금지될 수 있으니 사전에 반드시 확인하세요.",
        },
      ],
    },
  })
);

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn(() => "mock-model"),
}));

vi.mock("ai", () => ({
  generateObject: mockGenerateObject,
}));

import { getRouteWarnings } from "./route-warnings";

describe("getRouteWarnings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateObject.mockResolvedValue({
      object: {
        warnings: [
          {
            title: "관세 및 부가세 부과",
            description: "미국 발송 시 $800 초과 물품은 관세와 부가세가 부과되므로 사전에 세금 계획을 세워두세요.",
          },
          {
            title: "수입 금지 품목 확인",
            description: "도착국 규정에 따라 특정 품목은 반입이 금지될 수 있으니 사전에 반드시 확인하세요.",
          },
        ],
      },
    });
  });

  it("출발국가와 도착국가를 받아 주의사항 2개를 반환한다", async () => {
    const result = await getRouteWarnings("KR", "US");

    expect(result).toHaveLength(2);
  });

  it("각 항목이 title과 description을 가진다", async () => {
    const result = await getRouteWarnings("KR", "US");

    result.forEach((warning) => {
      expect(warning).toHaveProperty("title");
      expect(warning).toHaveProperty("description");
      expect(typeof warning.title).toBe("string");
      expect(typeof warning.description).toBe("string");
      expect(warning.title.length).toBeGreaterThan(0);
      expect(warning.description.length).toBeGreaterThan(0);
    });
  });

  it("국가 코드가 프롬프트에 올바르게 전달된다", async () => {
    await getRouteWarnings("KR", "CN");

    expect(mockGenerateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining("KR"),
      })
    );
    expect(mockGenerateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining("CN"),
      })
    );
  });

  it("AI 호출 실패 시 에러를 전파한다", async () => {
    mockGenerateObject.mockRejectedValueOnce(new Error("API quota exceeded"));

    await expect(getRouteWarnings("KR", "US")).rejects.toThrow("API quota exceeded");
  });
});
