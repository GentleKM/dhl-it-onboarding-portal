import type { NextConfig } from "next";

const securityHeaders = [
  // 클릭재킹 방지: iframe 내 렌더링 금지
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // MIME 스니핑 방지
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Referer 정보 최소 전송
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // XSS 필터 강제 활성화 (구형 브라우저)
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  // HTTPS 강제 (1년)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // 권한 API 제한
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // 모든 라우트에 보안 헤더 적용
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
