import { Resend } from "resend";
import type { SessionResult } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

// 이메일 HTML 인젝션 방지 — 사용자 데이터를 HTML에 삽입 전 반드시 이스케이프
function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function sendResultEmail(to: string, session: SessionResult) {
  const { key, input, recommendedSolution, recommendationReason } = session;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  // RESEND_FROM_EMAIL 미설정 시 Resend 테스트 도메인 사용
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  // 모든 사용자 입력 데이터를 이스케이프 처리 후 HTML에 삽입
  const safeKey = escapeHtml(key);
  const safeSolution = escapeHtml(recommendedSolution);
  const safeReason = escapeHtml(recommendationReason);
  const safeBusinessType = escapeHtml(input.businessType);
  const safeMainProduct = escapeHtml(input.mainProduct);
  const safeMonthlyShipments = escapeHtml(input.monthlyShipments);
  const safeOriginCountry = escapeHtml(input.originCountry);
  const safeDestCountry = escapeHtml(input.destinationCountry);

  // key는 6자리 숫자이므로 URL에 그대로 사용해도 안전
  const resultUrl = `${baseUrl}/result/${safeKey}`;

  await resend.emails.send({
    from,
    to,
    subject: `[DHL Starter] 추천 솔루션: ${safeSolution}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #FFCC00; padding: 20px; text-align: center;">
          <h1 style="color: #D40511; margin: 0; font-size: 24px;">DHL Starter</h1>
          <p style="color: #333; margin: 8px 0 0;">맞춤 DHL 솔루션 추천 결과</p>
        </div>

        <div style="padding: 24px; background: #fff; border: 1px solid #e5e7eb;">
          <h2 style="color: #D40511;">추천 솔루션: ${safeSolution}</h2>
          <p style="color: #374151; line-height: 1.6;">${safeReason}</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

          <h3 style="color: #111827;">입력 정보 요약</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #6b7280; width: 40%;">업종</td><td style="color: #111827;">${safeBusinessType}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">주요 발송물</td><td style="color: #111827;">${safeMainProduct}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">월 발송 건수</td><td style="color: #111827;">${safeMonthlyShipments}건</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">발송 경로</td><td style="color: #111827;">${safeOriginCountry} → ${safeDestCountry}</td></tr>
          </table>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

          <p style="color: #6b7280; font-size: 14px;">
            나중에 이 결과를 다시 조회하려면 아래 코드를 사용하세요.
          </p>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px;">조회 코드</p>
            <p style="font-size: 32px; font-weight: bold; color: #D40511; letter-spacing: 0.2em; margin: 0;">${safeKey}</p>
          </div>

          <p style="margin-top: 16px;">
            <a href="${resultUrl}" style="color: #D40511;">결과 페이지 바로가기 →</a>
          </p>
        </div>
      </div>
    `,
  });
}
