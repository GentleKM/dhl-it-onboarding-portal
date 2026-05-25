import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendResultEmail } from "@/lib/email/send";
import { checkRateLimit } from "@/lib/rate-limit";
import type { SessionResult } from "@/types";

// 요청 바디 검증 스키마
const emailRequestSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력해주세요"),
  key: z.string().length(6, "6자리 코드를 입력해주세요"),
});

// 이메일 발송 Rate Limit: 1분 내 IP당 5회 (key 열거 공격 방지)
const RATE_LIMIT_OPTIONS = { windowMs: 60_000, maxRequests: 5 };

export async function POST(req: NextRequest) {
  // 0. IP 기반 Rate Limit 확인
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, remaining, resetAt } = checkRateLimit(ip, RATE_LIMIT_OPTIONS);

  if (!allowed) {
    const retryAfterSec = Math.ceil((resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: `요청이 너무 많습니다. ${retryAfterSec}초 후 다시 시도해주세요.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // 1. 요청 바디 파싱 및 Zod 검증
  let parsed;
  try {
    const body = await req.json();
    parsed = emailRequestSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message ?? "입력값이 올바르지 않습니다" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const { email, key } = parsed;

  // 2. Supabase에서 key로 세션 조회
  const supabase = await createClient();
  const { data: session, error: dbError } = await supabase
    .from("sessions")
    .select("*")
    .eq("key", key)
    .single();

  if (dbError || !session) {
    return NextResponse.json(
      { error: "해당 코드에 대한 결과를 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  // 3. DB 데이터 → SessionResult 타입 변환
  const sessionResult: SessionResult = {
    id: session.id,
    key: session.key,
    input: {
      businessType: session.business_type,
      mainProduct: session.main_product,
      monthlyShipments: session.monthly_shipments,
      originCountry: session.origin_country,
      destinationCountry: session.destination_country,
      hasItSystem: session.has_it_system,
    },
    recommendedSolution: session.recommended_solution,
    recommendationReason: session.recommendation_reason,
    createdAt: session.created_at,
  };

  // 4. 이메일 발송
  try {
    await sendResultEmail(email, sessionResult);
  } catch (err) {
    console.error("[/api/email] Resend 오류:", err);
    return NextResponse.json(
      { error: "이메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true },
    { headers: { "X-RateLimit-Remaining": String(remaining) } }
  );
}
