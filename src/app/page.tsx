"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const intakeSchema = z.object({
  businessType: z.string().min(1, "고객님 비즈니스의 업종을 알려주세요."),
  mainProduct: z.string().min(1, "주요 발송물은 무엇인가요?"),
  monthlyShipments: z.coerce.number().min(1, "월 평균 발송 건수가 어떻게 되나요?"),
  originCountry: z.string().length(2, "주로 어느 국가에서 발송하시나요?"),
  destinationCountry: z.string().length(2, "주로 어느 국가로 발송하시나요?"),
  hasItSystem: z.enum(["true", "false", "null"], { message: "보유 여부를 선택해주세요." }),
});

type IntakeFormData = z.infer<typeof intakeSchema>;
type FormErrors = Partial<Record<keyof IntakeFormData, string>>;

const BUSINESS_TYPES = [
  { value: "이커머스/온라인 쇼핑몰", label: "이커머스/온라인 쇼핑몰" },
  { value: "반도체/전자/IT", label: "반도체/전자/IT" },
  { value: "제조업", label: "제조업" },
  { value: "물류/무역", label: "물류/무역" },
  { value: "기타", label: "기타" },
];

const COUNTRIES = [
  { value: "KR", label: "🇰🇷 대한민국" },
  { value: "US", label: "🇺🇸 미국" },
  { value: "CN", label: "🇨🇳 중국" },
  { value: "JP", label: "🇯🇵 일본" },
  { value: "DE", label: "🇩🇪 독일" },
  { value: "GB", label: "🇬🇧 영국" },
  { value: "FR", label: "🇫🇷 프랑스" },
  { value: "SG", label: "🇸🇬 싱가포르" },
  { value: "HK", label: "🇭🇰 홍콩" },
  { value: "AU", label: "🇦🇺 호주" },
  { value: "VN", label: "🇻🇳 베트남" },
  { value: "TH", label: "🇹🇭 태국" },
  { value: "TW", label: "🇹🇼 대만" },
  { value: "IN", label: "🇮🇳 인도" },
  { value: "NL", label: "🇳🇱 네덜란드" },
];

const IT_SYSTEM_OPTIONS = [
  { value: "true", label: "가능", description: "자체 개발팀 또는 외주를 통한 시스템 개발 가능" },
  { value: "false", label: "불가능", description: "자체 시스템 개발은 어려움" },
  { value: "null", label: "미정", description: "개발 인프라 구축 예정 또는 추가 확인 필요" },
];

export default function Home() {
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<IntakeFormData>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lookupKey, setLookupKey] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);

  function updateField<K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const result = intakeSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof IntakeFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const validated = result.data;
    const apiPayload = {
      businessType: validated.businessType,
      mainProduct: validated.mainProduct,
      monthlyShipments: validated.monthlyShipments,
      originCountry: validated.originCountry,
      destinationCountry: validated.destinationCountry,
      hasItSystem:
        validated.hasItSystem === "true" ? true :
        validated.hasItSystem === "false" ? false : null,
    };

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "추천 생성에 실패했습니다. 다시 시도해주세요.");
      }

      const { key } = await res.json();
      router.push(`/result/${key}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  }

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupError(null);
    const trimmed = lookupKey.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setLookupError("6자리 숫자 코드를 입력해주세요");
      return;
    }
    router.push(`/result/${trimmed}`);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f8fa" }}>
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center">
          <Image
            src="/dhl-express-cambodia-ltd-1200px-logo.jpg"
            alt="DHL"
            width={88}
            height={51}
            className="rounded"
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        {/* 히어로 */}
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-wide" style={{ color: "#D40511" }}>
            AI 솔루션 추천
          </p>
          <h1 className="text-3xl font-bold leading-snug" style={{ color: "#191f28" }}>
            귀사에 딱 맞는 DHL 솔루션,<br />
            AI가 바로 찾아드립니다
          </h1>
          <p className="text-base" style={{ color: "#8b95a1" }}>
            아래 정보를 입력하시면 최적의 DHL 온라인 솔루션을 추천해 드립니다.
          </p>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <h2 className="text-base font-semibold" style={{ color: "#191f28" }}>기업 정보 입력</h2>
              <p className="text-sm mt-0.5" style={{ color: "#8b95a1" }}>모든 항목을 입력해주세요</p>
            </div>

            <div className="px-6 py-6 space-y-7">
              {/* Q1. 업종 */}
              <div className="space-y-2">
                <Label htmlFor="businessType" className="text-sm font-semibold" style={{ color: "#191f28" }}>
                  1. 업종 <span style={{ color: "#D40511" }}>*</span>
                </Label>
                <Select
                  value={formData.businessType ?? ""}
                  onValueChange={(v) => updateField("businessType", v)}
                >
                  <SelectTrigger
                    id="businessType"
                    className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white text-sm"
                    style={errors.businessType ? { borderColor: "#D40511" } : {}}
                  >
                    <SelectValue placeholder="업종을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.businessType && (
                  <p className="text-xs mt-1" style={{ color: "#D40511" }}>{errors.businessType}</p>
                )}
              </div>

              {/* Q2. 주요 발송물 */}
              <div className="space-y-2">
                <Label htmlFor="mainProduct" className="text-sm font-semibold" style={{ color: "#191f28" }}>
                  2. 주요 발송물 <span style={{ color: "#D40511" }}>*</span>
                </Label>
                <Input
                  id="mainProduct"
                  placeholder="예: 스마트폰 부품, 의류, 화장품"
                  value={formData.mainProduct ?? ""}
                  onChange={(e) => updateField("mainProduct", e.target.value)}
                  className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white text-sm"
                  style={errors.mainProduct ? { borderColor: "#D40511" } : {}}
                />
                {errors.mainProduct && (
                  <p className="text-xs mt-1" style={{ color: "#D40511" }}>{errors.mainProduct}</p>
                )}
              </div>

              {/* Q3. 월 발송 건수 */}
              <div className="space-y-2">
                <Label htmlFor="monthlyShipments" className="text-sm font-semibold" style={{ color: "#191f28" }}>
                  3. 월 평균 발송 건수 <span style={{ color: "#D40511" }}>*</span>
                </Label>
                <Input
                  id="monthlyShipments"
                  type="number"
                  min={1}
                  placeholder="예: 500"
                  value={formData.monthlyShipments ?? ""}
                  onChange={(e) => updateField("monthlyShipments", Number(e.target.value) as unknown as number)}
                  className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white text-sm"
                  style={errors.monthlyShipments ? { borderColor: "#D40511" } : {}}
                />
                {errors.monthlyShipments && (
                  <p className="text-xs mt-1" style={{ color: "#D40511" }}>{errors.monthlyShipments}</p>
                )}
              </div>

              {/* Q4 & Q5: 출발/도착 국가 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originCountry" className="text-sm font-semibold" style={{ color: "#191f28" }}>
                    4. 출발 국가 <span style={{ color: "#D40511" }}>*</span>
                  </Label>
                  <Select
                    value={formData.originCountry ?? ""}
                    onValueChange={(v) => updateField("originCountry", v)}
                  >
                    <SelectTrigger
                      id="originCountry"
                      className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white text-sm"
                      style={errors.originCountry ? { borderColor: "#D40511" } : {}}
                    >
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.originCountry && (
                    <p className="text-xs mt-1" style={{ color: "#D40511" }}>{errors.originCountry}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationCountry" className="text-sm font-semibold" style={{ color: "#191f28" }}>
                    5. 도착 국가 <span style={{ color: "#D40511" }}>*</span>
                  </Label>
                  <Select
                    value={formData.destinationCountry ?? ""}
                    onValueChange={(v) => updateField("destinationCountry", v)}
                  >
                    <SelectTrigger
                      id="destinationCountry"
                      className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white text-sm"
                      style={errors.destinationCountry ? { borderColor: "#D40511" } : {}}
                    >
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.destinationCountry && (
                    <p className="text-xs mt-1" style={{ color: "#D40511" }}>{errors.destinationCountry}</p>
                  )}
                </div>
              </div>

              {/* Q6. IT 시스템 보유 여부 */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold" style={{ color: "#191f28" }}>
                  6. 자체적으로 IT 시스템 개발이 가능하신가요? <span style={{ color: "#D40511" }}>*</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {IT_SYSTEM_OPTIONS.map((opt) => {
                    const isSelected = formData.hasItSystem === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateField("hasItSystem", opt.value as IntakeFormData["hasItSystem"])}
                        className="relative p-4 rounded-xl border-2 text-left transition-all"
                        style={{
                          borderColor: isSelected ? "#D40511" : "#e5e8eb",
                          backgroundColor: isSelected ? "#fff5f5" : "#f7f8fa",
                        }}
                      >
                        <div
                          className="font-semibold text-sm mb-1"
                          style={{ color: isSelected ? "#D40511" : "#191f28" }}
                        >
                          {opt.label}
                        </div>
                        <div className="text-xs leading-relaxed" style={{ color: "#8b95a1" }}>
                          {opt.description}
                        </div>
                        {isSelected && (
                          <div
                            className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: "#D40511" }}
                          >
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.hasItSystem && (
                  <p className="text-xs mt-1" style={{ color: "#D40511" }}>{errors.hasItSystem}</p>
                )}
              </div>

              {/* 제출 에러 */}
              {submitError && (
                <div className="rounded-xl p-4" style={{ backgroundColor: "#fff5f5", borderLeft: "3px solid #D40511" }}>
                  <p className="text-sm" style={{ color: "#D40511" }}>{submitError}</p>
                </div>
              )}

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-xl text-white text-base font-bold transition-opacity disabled:opacity-60"
                style={{ backgroundColor: "#D40511" }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    AI 분석 중...
                  </span>
                ) : (
                  "솔루션 추천 받기 →"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* 재조회 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
          <h3 className="text-sm font-semibold mb-1" style={{ color: "#191f28" }}>이전 결과 다시 보기</h3>
          <p className="text-xs mb-4" style={{ color: "#8b95a1" }}>받으신 6자리 코드를 입력해 주세요</p>
          <form onSubmit={handleLookup} className="flex gap-2">
            <Input
              placeholder="6자리 코드 (예: 123456)"
              value={lookupKey}
              onChange={(e) => { setLookupKey(e.target.value); setLookupError(null); }}
              maxLength={6}
              className="h-11 flex-1 rounded-xl border-gray-200 bg-gray-50 text-sm"
              style={lookupError ? { borderColor: "#D40511" } : {}}
            />
            <button
              type="submit"
              className="h-11 px-5 rounded-xl text-sm font-semibold border-2 transition-colors"
              style={{ borderColor: "#e5e8eb", color: "#191f28", backgroundColor: "#ffffff" }}
            >
              조회
            </button>
          </form>
          {lookupError && <p className="text-xs mt-2" style={{ color: "#D40511" }}>{lookupError}</p>}
        </div>

        {/* 푸터 */}
        <footer className="text-center pb-8">
          <p className="text-xs" style={{ color: "#b0b8c1" }}>© 2026 DHL Express Korea · DHL Onboarding Portal</p>
        </footer>
      </main>
    </div>
  );
}
