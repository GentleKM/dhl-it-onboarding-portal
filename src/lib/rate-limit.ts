/**
 * 인메모리 Rate Limiter
 *
 * 서버리스(Vercel) 환경에서는 인스턴스가 여러 개 존재할 수 있어
 * 완전한 분산 제한은 불가하지만, 단일 인스턴스 내 기본 보호는 제공.
 * Phase 5에서 Redis 기반으로 교체 예정.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  /** 제한 기간 (밀리초) */
  windowMs: number;
  /** 기간 내 최대 요청 수 */
  maxRequests: number;
}

/**
 * 주어진 식별자(IP 등)에 대해 Rate Limit을 확인한다.
 * @returns allowed: true면 허용, false면 차단
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const { windowMs, maxRequests } = options;

  const entry = store.get(identifier);

  // 첫 요청이거나 윈도우가 만료된 경우 초기화
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}
