"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface EmailButtonProps {
  sessionKey: string;
}

type ButtonState = "idle" | "input" | "loading" | "success" | "error";

export function EmailButton({ sessionKey }: EmailButtonProps) {
  const [state, setState] = useState<ButtonState>("idle");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 이메일 형식 간단 검증
  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSend() {
    if (!isValidEmail(email)) {
      setErrorMsg("올바른 이메일 주소를 입력해주세요");
      return;
    }

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, key: sessionKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "이메일 발송에 실패했습니다");
        setState("error");
        return;
      }

      setState("success");
      // 2초 후 초기 상태로 복귀
      setTimeout(() => {
        setState("idle");
        setEmail("");
      }, 2000);
    } catch {
      setErrorMsg("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setState("error");
    }
  }

  function handleCancel() {
    setState("idle");
    setEmail("");
    setErrorMsg("");
  }

  // 성공 상태
  if (state === "success") {
    return (
      <span className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
        ✓ 이메일이 발송되었습니다!
      </span>
    );
  }

  // 초기 상태 — 버튼만 표시
  if (state === "idle") {
    return (
      <Button
        variant="outline"
        onClick={() => setState("input")}
        className="border-gray-300"
      >
        📧 이메일로 받기
      </Button>
    );
  }

  // 입력 / 로딩 / 오류 상태 — 이메일 입력 폼 표시
  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMsg) setErrorMsg("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="이메일 주소 입력"
          disabled={state === "loading"}
          autoFocus
          className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
          style={{ minWidth: "200px" }}
        />
        <Button
          onClick={handleSend}
          disabled={state === "loading" || email.trim() === ""}
          style={{ backgroundColor: "#D40511" }}
          className="text-white shrink-0"
        >
          {state === "loading" ? "발송 중..." : "발송"}
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={state === "loading"}
          className="shrink-0"
        >
          취소
        </Button>
      </div>

      {/* 오류 메시지 */}
      {errorMsg && (
        <p className="text-xs text-red-600 px-1">{errorMsg}</p>
      )}
    </div>
  );
}
