import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyCodeButton } from "@/components/result/copy-code-button";
import { EmailButton } from "@/components/result/email-button";
import { solutions, solutionMap, COMPARISON_ROWS } from "@/content/solutions";
import { customsTerms } from "@/content/customs-guide";
import { getRouteWarnings } from "@/lib/ai/route-warnings";
import type { DhlSolution, RouteWarning } from "@/types";

interface ResultPageProps {
  params: Promise<{ key: string }>;
}

// 솔루션별 강조 색상 클래스
const SOLUTION_COLORS: Record<DhlSolution, { bg: string; border: string; text: string; badge: string }> = {
  "MyDHL+": {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-700",
    badge: "bg-red-600",
  },
  DEC: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    text: "text-yellow-700",
    badge: "bg-yellow-600",
  },
  "MyDHL API": {
    bg: "bg-green-50",
    border: "border-green-400",
    text: "text-green-700",
    badge: "bg-green-600",
  },
};

// 국가 코드 → 한국어 이름
const COUNTRY_NAMES: Record<string, string> = {
  KR: "대한민국", US: "미국", CN: "중국", JP: "일본",
  DE: "독일", GB: "영국", FR: "프랑스", SG: "싱가포르",
  HK: "홍콩", AU: "호주", VN: "베트남", TH: "태국",
  TW: "대만", IN: "인도", NL: "네덜란드",
};

export default async function ResultPage({ params }: ResultPageProps) {
  const { key } = await params;

  // 1. Supabase에서 세션 데이터 조회
  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("key", key)
    .single();

  // 존재하지 않는 key → 404
  if (error || !session) {
    notFound();
  }

  const solution = session.recommended_solution as DhlSolution;
  const colors = SOLUTION_COLORS[solution];
  const solutionInfo = solutionMap.get(solution);

  // 입력 정보 요약용
  const originName = COUNTRY_NAMES[session.origin_country] ?? session.origin_country;
  const destName = COUNTRY_NAMES[session.destination_country] ?? session.destination_country;

  // 루트별 통관 주의사항 (AI 생성, 실패 시 빈 배열로 graceful degradation)
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
    <div className="min-h-screen bg-gray-50">
      {/* DHL 헤더 */}
      <header style={{ backgroundColor: "#D40511" }} className="py-6 px-4 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div
            className="text-3xl font-black tracking-wider px-3 py-1 rounded"
            style={{ backgroundColor: "#FFCC00", color: "#D40511" }}
          >
            DHL
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">AI 솔루션 추천 결과</h1>
            <p className="text-red-200 text-sm">귀사에 최적화된 DHL 솔루션을 확인하세요</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ① 추천 솔루션 카드 (메인) */}
        <Card className={`border-2 ${colors.border} ${colors.bg} shadow-sm`}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-500 font-medium">AI 추천 솔루션</span>
              <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${colors.badge}`}>
                {solution}
              </span>
            </div>
            <CardTitle className={`text-2xl font-bold ${colors.text}`}>
              {solutionInfo?.tagline}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI 추천 이유 */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                AI 추천 근거
              </p>
              <p className="text-gray-800 leading-relaxed text-sm">
                {session.recommendation_reason}
              </p>
            </div>

            {/* 입력 정보 요약 */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: "업종", value: session.business_type },
                { label: "주요 발송물", value: session.main_product },
                { label: "월 발송 건수", value: `${session.monthly_shipments}건` },
                { label: "발송 구간", value: `${originName} → ${destName}` },
                { label: "IT 시스템", value: itSystemLabel },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded p-2 border border-gray-100">
                  <span className="text-gray-500 text-xs">{label}</span>
                  <p className="font-medium text-gray-800 text-sm mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* 솔루션 주요 특징 */}
            {solutionInfo && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  주요 특징
                </p>
                <ul className="space-y-1">
                  {solutionInfo.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className={`mt-0.5 font-bold ${colors.text}`}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ② 6자리 코드 + 이메일 버튼 */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 mb-1">나중에 이 결과를 다시 보려면</p>
                <p
                  className="text-4xl font-mono font-bold tracking-widest"
                  style={{ color: "#D40511" }}
                >
                  {key}
                </p>
                <p className="text-xs text-gray-400 mt-1">홈 화면에서 이 6자리 코드로 재조회 가능</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <CopyCodeButton code={key} />
                <EmailButton sessionKey={key} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ③ 3개 솔루션 비교표 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-gray-800">3개 솔루션 비교</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-3 text-gray-500 font-medium w-24">항목</th>
                    {solutions.map((s) => (
                      <th
                        key={s.id}
                        className={`text-center py-2 px-2 font-bold ${
                          s.id === solution
                            ? `${colors.text} border-b-2 ${colors.border}`
                            : "text-gray-600"
                        }`}
                      >
                        {s.id === solution && (
                          <span className={`block text-xs ${colors.badge} text-white rounded-full px-2 mb-1 mx-auto w-fit`}>
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
                    <tr key={row.key} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 pr-3 text-gray-500 font-medium">{row.label}</td>
                      {solutions.map((s) => (
                        <td
                          key={s.id}
                          className={`text-center py-2 px-2 text-xs ${
                            s.id === solution ? `${colors.bg} font-medium ${colors.text}` : "text-gray-600"
                          }`}
                        >
                          {s[row.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ④ 루트별 통관 주의사항 (AI 생성) */}
        {routeWarnings.length > 0 && (
          <Card className="shadow-sm border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-gray-800">
                ⚠️ {originName}에서 {destName}로 발송 시 주의사항
              </CardTitle>
              <p className="text-sm text-gray-500">이 구간에서 자주 발생하는 통관·비용 이슈</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {routeWarnings.map((warning, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                  >
                    <p className="font-semibold text-amber-800 text-sm mb-1">
                      ⚠️ {warning.title}
                    </p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      {warning.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ⑤ 통관 가이드 */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-gray-800">📦 통관 기초 가이드</CardTitle>
            <p className="text-sm text-gray-500">DHL 발송 시 알아두면 유용한 통관 용어</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {customsTerms.map((item) => (
                <div
                  key={item.term}
                  className="rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors"
                >
                  <p className="font-semibold text-gray-800 text-sm mb-1">{item.term}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                  {item.example && (
                    <p className="text-xs text-gray-400 mt-1 italic">{item.example}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ⑥ 홈으로 */}
        <div className="flex justify-center pb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#D40511" }}
          >
            처음으로 돌아가기
          </a>
        </div>
      </main>
    </div>
  );
}
