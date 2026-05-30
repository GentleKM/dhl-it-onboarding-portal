import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CopyCodeButton } from "@/components/result/copy-code-button";
import { EmailButton } from "@/components/result/email-button";
import { solutions, solutionMap, COMPARISON_ROWS } from "@/content/solutions";
import { customsTerms } from "@/content/customs-guide";
import { getRouteWarnings } from "@/lib/ai/route-warnings";
import type { DhlSolution, RouteWarning } from "@/types";

interface ResultPageProps {
  params: Promise<{ key: string }>;
}

const SOLUTION_ACCENT: Record<DhlSolution, { bar: string; text: string; badge: string; light: string }> = {
  "MyDHL+":    { bar: "#D40511", text: "#D40511", badge: "#D40511", light: "#fff5f5" },
  DEC:         { bar: "#b45309", text: "#b45309", badge: "#b45309", light: "#fffbeb" },
  "MyDHL API": { bar: "#15803d", text: "#15803d", badge: "#15803d", light: "#f0fdf4" },
};

const COUNTRY_NAMES: Record<string, string> = {
  KR: "대한민국", US: "미국", CN: "중국", JP: "일본",
  DE: "독일", GB: "영국", FR: "프랑스", SG: "싱가포르",
  HK: "홍콩", AU: "호주", VN: "베트남", TH: "태국",
  TW: "대만", IN: "인도", NL: "네덜란드",
};

export default async function ResultPage({ params }: ResultPageProps) {
  const { key } = await params;

  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("key", key)
    .single();

  if (error || !session) notFound();

  const solution = session.recommended_solution as DhlSolution;
  const accent = SOLUTION_ACCENT[solution];
  const solutionInfo = solutionMap.get(solution);

  if (!accent || !solutionInfo) notFound();

  const originName = COUNTRY_NAMES[session.origin_country] ?? session.origin_country;
  const destName = COUNTRY_NAMES[session.destination_country] ?? session.destination_country;

  let routeWarnings: RouteWarning[] = [];
  try {
    routeWarnings = await getRouteWarnings(session.origin_country, session.destination_country);
  } catch (err) {
    console.error("[route-warnings] AI 호출 실패", {
      origin: session.origin_country,
      destination: session.destination_country,
      error: err,
    });
  }

  const itSystemLabel =
    session.has_it_system === true ? "있음" :
    session.has_it_system === false ? "없음" : "모르겠음";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f8fa" }}>
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Image
            src="/dhl-express-cambodia-ltd-1200px-logo.jpg"
            alt="DHL"
            width={88}
            height={51}
            className="rounded"
          />
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: "#fff5f5", color: "#D40511" }}
          >
            AI 추천 결과
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-5">

        {/* ① 추천 솔루션 카드 */}
        <div
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          style={{ borderLeft: `4px solid ${accent.bar}` }}
        >
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: accent.badge }}
              >
                AI 추천
              </span>
              <span className="text-xs font-semibold" style={{ color: accent.text }}>{solution}</span>
            </div>
            <h1 className="text-2xl font-bold leading-snug" style={{ color: "#191f28" }}>
              {solutionInfo.tagline}
            </h1>
          </div>

          <div className="mx-6 mb-5 p-4 rounded-xl" style={{ backgroundColor: "#f7f8fa" }}>
            <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "#8b95a1" }}>
              AI 추천 근거
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#191f28" }}>
              {session.recommendation_reason}
            </p>
          </div>

          <div className="px-6 mb-5">
            <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "#8b95a1" }}>입력 정보</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { label: "업종", value: session.business_type },
                { label: "주요 발송물", value: session.main_product },
                { label: "월 발송 건수", value: `${session.monthly_shipments}건` },
                { label: "발송 구간", value: `${originName} → ${destName}` },
                { label: "IT 시스템", value: itSystemLabel },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3" style={{ backgroundColor: "#f7f8fa" }}>
                  <p className="text-xs mb-0.5" style={{ color: "#8b95a1" }}>{label}</p>
                  <p className="text-sm font-semibold" style={{ color: "#191f28" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 pb-6">
            <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "#8b95a1" }}>주요 특징</p>
            <ul className="space-y-2">
              {solutionInfo.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: "#191f28" }}>
                  <span className="mt-0.5 font-bold flex-shrink-0" style={{ color: accent.text }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ② 솔루션 비교표 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b" style={{ borderColor: "#f7f8fa" }}>
            <h2 className="text-sm font-semibold" style={{ color: "#191f28" }}>3개 솔루션 비교</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #f7f8fa" }}>
                  <th className="text-left py-3 px-6 text-xs font-semibold w-24" style={{ color: "#8b95a1" }}>항목</th>
                  {solutions.map((s) => (
                    <th
                      key={s.id}
                      className="text-center py-3 px-3 text-xs font-bold"
                      style={{
                        color: s.id === solution ? accent.text : "#8b95a1",
                        borderBottom: s.id === solution ? `2px solid ${accent.bar}` : undefined,
                      }}
                    >
                      {s.id === solution && (
                        <span
                          className="block text-xs text-white rounded-full px-2 py-0.5 mb-1 mx-auto w-fit"
                          style={{ backgroundColor: accent.badge }}
                        >
                          추천
                        </span>
                      )}
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.key} style={{ borderBottom: "1px solid #f7f8fa" }}>
                    <td className="py-3 px-6 text-xs font-semibold" style={{ color: "#8b95a1" }}>{row.label}</td>
                    {solutions.map((s) => (
                      <td
                        key={s.id}
                        className="text-center py-3 px-3 text-xs"
                        style={{
                          color: s.id === solution ? accent.text : "#8b95a1",
                          fontWeight: s.id === solution ? 600 : 400,
                          backgroundColor: s.id === solution ? accent.light : undefined,
                        }}
                      >
                        {s[row.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ③ 루트별 통관 주의사항 */}
        {routeWarnings.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5" style={{ borderBottom: "1px solid #fef3c7" }}>
              <h2 className="text-sm font-semibold" style={{ color: "#191f28" }}>
                ⚠️ {originName} → {destName} 발송 시 주의사항
              </h2>
              <p className="text-xs mt-1" style={{ color: "#8b95a1" }}>
                AI가 생성한 정보입니다. 중요한 결정 전 DHL 담당자에게 확인하세요.
              </p>
            </div>
            <div className="p-6 grid gap-3 sm:grid-cols-2">
              {routeWarnings.map((warning, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}
                >
                  <p className="font-semibold text-sm mb-1.5" style={{ color: "#92400e" }}>
                    ⚠️ {warning.title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "#78350f" }}>
                    {warning.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ④ 통관 용어 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #f7f8fa" }}>
            <h2 className="text-sm font-semibold" style={{ color: "#191f28" }}>📦 추가 정보</h2>
            <p className="text-xs mt-0.5" style={{ color: "#8b95a1" }}>해외 발송 및 DHL 이용 참고사항</p>
          </div>
          <div className="p-6 grid gap-3 sm:grid-cols-2">
            {customsTerms.map((item) => (
              <div
                key={item.term}
                className="rounded-xl p-4"
                style={{ backgroundColor: "#f7f8fa", border: "1px solid #e5e8eb" }}
              >
                <p className="font-semibold text-sm mb-1" style={{ color: "#191f28" }}>{item.term}</p>
                <p className="text-xs leading-relaxed" style={{ color: "#8b95a1" }}>{item.description}</p>
                {item.example && (
                  <p className="text-xs mt-1.5 italic" style={{ color: "#b0b8c1" }}>{item.example}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ⑤ 6자리 코드 + 이메일 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-sm mb-2" style={{ color: "#8b95a1" }}>이 결과를 다시 보려면 아래 코드를 입력하세요</p>
              <p className="text-5xl font-mono font-bold tracking-widest" style={{ color: "#D40511" }}>
                {key}
              </p>
              <p className="text-xs mt-1.5" style={{ color: "#b0b8c1" }}>홈 화면에서 이 6자리 코드로 재조회 가능</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <CopyCodeButton code={key} />
              <EmailButton sessionKey={key} />
            </div>
          </div>
        </div>

        {/* ⑥ 홈으로 */}
        <div className="flex justify-center pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#D40511" }}
          >
            ← 처음으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
