"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CopyCodeButtonProps {
  code: string;
}

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      // 2초 후 원래 상태로 복구
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 미지원 환경 대비 fallback
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      className={`transition-all ${
        copied
          ? "border-green-500 text-green-700 bg-green-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      {copied ? "✓ 복사됨!" : "코드 복사"}
    </Button>
  );
}
