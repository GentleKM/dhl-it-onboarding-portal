import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Upstash Rate Limiter mock — 기본값: 허용
const mockRecommendLimit = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ success: true, remaining: 9, reset: Date.now() + 60_000 })
);
vi.mock("@/lib/rate-limit", () => ({
  recommendRatelimit: { limit: mockRecommendLimit },
  emailRatelimit: { limit: vi.fn().mockResolvedValue({ success: true, remaining: 4, reset: Date.now() + 60_000 }) },
}));

// Gemini AI mock
vi.mock("@ai-sdk/google", () => ({ google: vi.fn(() => "mock-model") }));
vi.mock("ai", () => ({
  generateObject: vi.fn().mockResolvedValue({
    object: { solution: "MyDHL+", reason: "테스트 추천 근거입니다. 50자 이상을 맞추기 위해 충분한 텍스트를 작성합니다." },
  }),
}));

// Supabase mock
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    rpc: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: "123456", error: null }) })),
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

import { POST } from "./route";

// 테스트용 유효 요청 바디
const validBody = {
  businessType: "의류 제조사",
  mainProduct: "의류",
  monthlyShipments: 100,
  originCountry: "KR",
  destinationCountry: "US",
  hasItSystem: false,
};

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/recommend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 기본: Rate Limit 허용
    mockRecommendLimit.mockResolvedValue({ success: true, remaining: 9, reset: Date.now() + 60_000 });
  });

  it("유효한 입력에 대해 6자리 key를 반환한다", async () => {
    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("key");
    expect(json.key).toBe("123456");
  });

  it("필수 필드 누락 시 400을 반환한다", async () => {
    const res = await POST(makeRequest({ businessType: "의류" }));
    expect(res.status).toBe(400);
  });

  it("잘못된 JSON 형식 시 400을 반환한다", async () => {
    const req = new NextRequest("http://localhost/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("Rate Limit 초과 시 429를 반환한다", async () => {
    mockRecommendLimit.mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Date.now() + 30_000,
    });

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json).toHaveProperty("error");
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });
});
