import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRecommendation } from "@/lib/ai/recommend";
import { createClient } from "@/lib/supabase/server";

// 서버 사이드 입력 검증 스키마
const sessionInputSchema = z.object({
  businessType: z.string().min(1),
  mainProduct: z.string().min(1),
  monthlyShipments: z.number().int().min(1),
  originCountry: z.string().length(2),
  destinationCountry: z.string().length(2),
  hasItSystem: z.boolean().nullable(),
});

export async function POST(req: NextRequest) {
  // 1. 요청 파싱
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  // 2. Zod 검증
  const parseResult = sessionInputSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", details: parseResult.error.issues },
      { status: 400 }
    );
  }

  const input = parseResult.data;

  // 3. Gemini AI 추천 생성
  let recommendation;
  try {
    recommendation = await getRecommendation(input);
  } catch (err) {
    // AI 에러만 별도 로깅 — 터미널에서 원인 확인 가능
    console.error("[추천 오류] Gemini AI 호출 실패:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `AI 추천 생성 실패: ${message}` },
      { status: 500 }
    );
  }

  // 4. Supabase 클라이언트 + 6자리 key 생성
  let supabase;
  try {
    supabase = await createClient();
  } catch (err) {
    console.error("[추천 오류] Supabase 클라이언트 생성 실패:", err);
    return NextResponse.json({ error: "DB 연결에 실패했습니다." }, { status: 500 });
  }

  const { data: keyData, error: keyError } = await supabase
    .rpc("generate_unique_session_key")
    .single();

  if (keyError || !keyData) {
    console.error("[추천 오류] 키 생성 실패:", keyError);
    return NextResponse.json({ error: "세션 키 생성에 실패했습니다." }, { status: 500 });
  }

  const sessionKey = keyData as string;

  // 5. sessions 테이블에 저장
  const { error: insertError } = await supabase.from("sessions").insert({
    key: sessionKey,
    business_type: input.businessType,
    main_product: input.mainProduct,
    monthly_shipments: input.monthlyShipments,
    origin_country: input.originCountry,
    destination_country: input.destinationCountry,
    has_it_system: input.hasItSystem,
    recommended_solution: recommendation.solution,
    recommendation_reason: recommendation.reason,
  });

  if (insertError) {
    console.error("[추천 오류] 세션 저장 실패:", insertError);
    return NextResponse.json({ error: "결과 저장에 실패했습니다." }, { status: 500 });
  }

  // 6. 6자리 키 반환
  return NextResponse.json({ key: sessionKey });
}
