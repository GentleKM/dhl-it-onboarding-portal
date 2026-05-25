import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.mock은 파일 상단으로 호이스팅되므로, mock 내부에서 참조할 변수는 vi.hoisted()로 선언
const mockSend = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: { id: "mock-email-id" }, error: null })
);

vi.mock("resend", () => ({
  Resend: vi.fn(function () {
    return { emails: { send: mockSend } };
  }),
}));

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
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "recipient@example.com" })
    );
  });

  it("HTML 특수문자가 포함된 사용자 입력을 이스케이프 처리한다", async () => {
    // XSS 시도: <script> 태그가 이메일 HTML에 그대로 삽입되면 안 됨
    const xssSession: SessionResult = {
      ...mockSession,
      recommendationReason: '<script>alert("xss")</script>',
      input: {
        ...mockSession.input,
        businessType: "<b>굵은 텍스트</b> & '따옴표'",
        mainProduct: '"큰따옴표"',
      },
    };

    await sendResultEmail("test@example.com", xssSession);

    const callArg = mockSend.mock.calls[0]?.[0] as { html: string };
    expect(callArg.html).not.toContain("<script>");
    expect(callArg.html).toContain("&lt;script&gt;");
    expect(callArg.html).toContain("&amp;");
    expect(callArg.html).toContain("&#x27;");
  });
});
