import { describe, it, expect, vi, beforeEach } from "vitest";

// Resend 클래스 mock — new Resend()를 일반 함수(constructor 가능)로 구현
vi.mock("resend", () => {
  const mockSend = vi.fn().mockResolvedValue({ data: { id: "mock-email-id" }, error: null });
  return {
    Resend: vi.fn(function () {
      return { emails: { send: mockSend } };
    }),
    _mockSend: mockSend,
  };
});

import { sendResultEmail } from "./send";
import type { SessionResult } from "@/types";

const mockSession: SessionResult = {
  id: "uuid-1234",
  key: "528183",
  input: {
    businessType: "이커머스/온라인 쇼핑몰",
    mainProduct: "의류",
    monthlyShipments: 500,
    originCountry: "KR",
    destinationCountry: "US",
    hasItSystem: false,
  },
  recommendedSolution: "DEC",
  recommendationReason: "이커머스 대량 발송에 최적화된 솔루션입니다.",
  createdAt: "2026-05-25T00:00:00Z",
};

describe("sendResultEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("오류 없이 이메일 발송이 완료된다", async () => {
    await expect(
      sendResultEmail("test@example.com", mockSession)
    ).resolves.not.toThrow();
  });

  it("Resend send()가 올바른 수신자 이메일로 호출된다", async () => {
    await sendResultEmail("recipient@example.com", mockSession);

    // vi.mock 내부의 _mockSend에 접근
    const resendModule = await import("resend");
    const mockSend = (resendModule as unknown as { _mockSend: ReturnType<typeof vi.fn> })._mockSend;
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "recipient@example.com" })
    );
  });
});
