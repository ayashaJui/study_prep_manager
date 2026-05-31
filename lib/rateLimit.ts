type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitRecord>();

export type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

export function rateLimit(options: RateLimitOptions): {
  ok: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = buckets.get(options.key);

  if (!record || record.resetAt <= now) {
    const resetAt = now + options.windowMs;
    buckets.set(options.key, { count: 1, resetAt });
    return { ok: true, remaining: options.limit - 1, resetAt };
  }

  record.count += 1;
  buckets.set(options.key, record);

  if (record.count > options.limit) {
    return { ok: false, remaining: 0, resetAt: record.resetAt };
  }

  return {
    ok: true,
    remaining: Math.max(options.limit - record.count, 0),
    resetAt: record.resetAt,
  };
}
