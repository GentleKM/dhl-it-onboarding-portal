/**
 * Upstash Redis 기반 분산 Rate Limiter
 *
 * Vercel 다중 인스턴스 환경에서도 정확하게 동작하는 슬라이딩 윈도우 방식.
 * 환경변수: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/** AI 추천 API: 60초당 최대 10회 */
export const recommendRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "rl:recommend",
});

/** 이메일 발송 API: 60초당 최대 5회 (열거 공격 방지) */
export const emailRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "rl:email",
});
