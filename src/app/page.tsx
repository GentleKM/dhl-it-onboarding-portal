"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 클라이언트 사이드 폼 검증 스키마
const intakeSchema = z.object({
  businessType: z.string().min(1, "업종을 선택해주세요"),
  mainProduct: z.string().min(1, "주요 발송물을 입력해주세요"),
  monthlyShipments: z.coerce.number().min(1, "발송 건수를 입력해주세요"),
  originCountry: z.string().length(2, "출발 국가를 선택해주세요"),
  destinationCountry: z.string().length(2, "도착 국가를 선택해주세요"),
  hasItSystem: z.enum(["true", "false", "null"], { message: "보유 여부를 선택해주세요" }),
});

type IntakeFormData = z.infer<typeof intakeSchema>;
type FormErrors = Partial<Record<keyof IntakeFormData, string>>;

// 업종 선택 목록
const BUSINESS_TYPES = [
  { value: "이커머스/온라인 쇼핑몰", label: "이커머스/온라인 쇼핑몰" },
  { value: "반도체/전자/IT", label: "반도체/전자/IT" },
  { value: "제조업", label: "제조업" },
  { value: "물류/무역", label: "물류/무역" },
  { value: "기타", label: "기타" },
];

// 주요 국가 목록 (ISO 3166-1 alpha-2)
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

// IT 시스템 보유 여부 옵션
const IT_SYSTEM_OPTIONS = [
  { value: "true", label: "있음", description: "자체 ERP, WMS 또는 개발팀 보유" },
  { value: "false", label: "없음", description: "별도 시스템 없음" },
  { value: "null", label: "모르겠음", description: "잘 모르겠음" },
];

export default function Home() {
  const router = useRouter();

  // 폼 상태
  const [formData, setFormData] = useState<Partial<IntakeFormData>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 재조회 상태
  const [lookupKey, setLookupKey] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);

  // 폼 필드 업데이트 헬퍼
  function updateField<K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // 해당 필드 에러 초기화
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  // 폼 제출 핸들러
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    // Zod 검증
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

    // hasItSystem 문자열 → boolean | null 변환
    const apiPayload = {
      businessType: validated.businessType,
      mainProduct: validated.mainProduct,
      monthlyShipments: validated.monthlyShipments,
      originCountry: validated.originCountry,
      destinationCountry: validated.destinationCountry,
      hasItSystem:
        validated.hasItSystem === "true"
          ? true
          : validated.hasItSystem === "false"
            ? false
            : null,
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

  // 재조회 핸들러
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
    <div className="min-h-screen bg-gray-50">
      {/* DHL 헤더 */}
      <header style={{ backgroundColor: "#D40511" }} className="py-6 px-4 shadow-md">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            {/* DHL 로고 텍스트 */}
            <div
              className="text-3xl font-black tracking-wider px-3 py-1 rounded"
              style={{ backgroundColor: "#FFCC00", color: "#D40511" }}
            >
              DHL
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">IT 솔루션 추천 서비스</h1>
              <p className="text-red-200 text-sm">귀사에 최적화된 DHL 솔루션을 찾아드립니다</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* 소개 문구 */}
        <div className="text-center space-y-2">
          <p className="text-gray-600 text-base">
            아래 6가지 질문에 답하시면 귀사에 맞는 DHL 솔루션을 AI가 즉시 추천해 드립니다.
          </p>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-gray-800">기업 정보 입력</CardTitle>
              <CardDescription>모든 항목을 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Q1. 업종 */}
              <div className="space-y-2">
                <Label htmlFor="businessType" className="font-semibold text-gray-700">
                  1. 업종 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.businessType ?? ""}
                  onValueChange={(v) => updateField("businessType", v)}
                >
                  <SelectTrigger id="businessType" className={errors.businessType ? "border-red-500" : ""}>
                    <SelectValue placeholder="업종을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.businessType && (
                  <p className="text-sm text-red-500">{errors.businessType}</p>
                )}
              </div>

              {/* Q2. 주요 발송물 */}
              <div className="space-y-2">
                <Label htmlFor="mainProduct" className="font-semibold text-gray-700">
                  2. 주요 발송물 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mainProduct"
                  placeholder="예: 스마트폰 부품, 의류, 화장품"
                  value={formData.mainProduct ?? ""}
                  onChange={(e) => updateField("mainProduct", e.target.value)}
                  className={errors.mainProduct ? "border-red-500" : ""}
                />
                {errors.mainProduct && (
                  <p className="text-sm text-red-500">{errors.mainProduct}</p>
                )}
              </div>

              {/* Q3. 월 발송 건수 */}
              <div className="space-y-2">
                <Label htmlFor="monthlyShipments" className="font-semibold text-gray-700">
                  3. 월 평균 발송 건수 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="monthlyShipments"
                  type="number"
                  min={1}
                  placeholder="예: 500"
                  value={formData.monthlyShipments ?? ""}
                  onChange={(e) =>
                    updateField("monthlyShipments", Number(e.target.value) as unknown as number)
                  }
                  className={errors.monthlyShipments ? "border-red-500" : ""}
                />
                {errors.monthlyShipments && (
                  <p className="text-sm text-red-500">{errors.monthlyShipments}</p>
                )}
              </div>

              {/* Q4 & Q5: 출발/도착 국가 */}
              <div className="grid grid-cols-2 gap-4">
                {/* Q4. 출발 국가 */}
                <div className="space-y-2">
                  <Label htmlFor="originCountry" className="font-semibold text-gray-700">
                    4. 출발 국가 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.originCountry ?? ""}
                    onValueChange={(v) => updateField("originCountry", v)}
                  >
                    <SelectTrigger
                      id="originCountry"
                      className={errors.originCountry ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.originCountry && (
                    <p className="text-sm text-red-500">{errors.originCountry}</p>
                  )}
                </div>

                {/* Q5. 도착 국가 */}
                <div className="space-y-2">
                  <Label htmlFor="destinationCountry" className="font-semibold text-gray-700">
                    5. 도착 국가 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.destinationCountry ?? ""}
                    onValueChange={(v) => updateField("destinationCountry", v)}
                  >
                    <SelectTrigger
                      id="destinationCountry"
                      className={errors.destinationCountry ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.destinationCountry && (
                    <p className="text-sm text-red-500">{errors.destinationCountry}</p>
                  )}
                </div>
              </div>

              {/* Q6. IT 시스템 보유 여부 */}
              <div className="space-y-3">
                <Label className="font-semibold text-gray-700">
                  6. 자체 IT 시스템 또는 개발팀 보유 여부 <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {IT_SYSTEM_OPTIONS.map((opt) => {
                    const isSelected = formData.hasItSystem === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          updateField("hasItSystem", opt.value as IntakeFormData["hasItSystem"])
                        }
                        className={`
                          relative p-3 rounded-lg border-2 text-left transition-all
                          ${
                            isSelected
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }
                        `}
                      >
                        <div
                          className={`font-semibold text-sm ${isSelected ? "text-red-700" : "text-gray-800"}`}
                        >
                          {opt.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{opt.description}</div>
                        {isSelected && (
                          <div
                            className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#D40511" }}
                          >
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.hasItSystem && (
                  <p className="text-sm text-red-500">{errors.hasItSystem}</p>
                )}
              </div>

              {/* 제출 에러 */}
              {submitError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {/* 제출 버튼 */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-bold text-white transition-opacity disabled:opacity-70"
                style={{ backgroundColor: isSubmitting ? "#aaa" : "#D40511" }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    AI 추천 분석 중...
                  </span>
                ) : (
                  "솔루션 추천 받기 →"
                )}
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* 재조회 섹션 */}
        <Card className="shadow-sm border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-gray-700">이전 추천 결과 재조회</CardTitle>
            <CardDescription>이전에 받은 6자리 코드로 결과를 다시 확인할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="flex gap-2">
              <Input
                placeholder="6자리 코드 입력 (예: 123456)"
                value={lookupKey}
                onChange={(e) => {
                  setLookupKey(e.target.value);
                  setLookupError(null);
                }}
                maxLength={6}
                className={`flex-1 ${lookupError ? "border-red-500" : ""}`}
              />
              <Button
                type="submit"
                variant="outline"
                className="shrink-0 border-gray-400 hover:bg-gray-100"
              >
                조회
              </Button>
            </form>
            {lookupError && <p className="text-sm text-red-500 mt-2">{lookupError}</p>}
          </CardContent>
        </Card>

        {/* 푸터 */}
        <footer className="text-center text-xs text-gray-400 pb-8">
          © 2026 DHL Express Korea · IT 솔루션 추천 서비스
        </footer>
      </main>
    </div>
  );
}
