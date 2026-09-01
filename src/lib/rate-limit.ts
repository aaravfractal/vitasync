/**
 * Per-IP daily counter. In-memory, so it resets on deploy and is per serverless
 * instance — good enough to stop one person burning the Claude budget, not a
 * security control. Move to Upstash/Vercel KV alongside the /u/* limits (CLAUDE.md step 5).
 */
import { timingSafeEqual } from "node:crypto";

type Bucket = { day: string; count: number };

const g = globalThis as unknown as { __vs_rate?: Map<string, Bucket> };
const buckets = (g.__vs_rate ??= new Map<string, Bucket>());

const today = () => new Date().toISOString().slice(0, 10);

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function takeDaily(key: string, max: number) {
  const day = today();
  const b = buckets.get(key);
  if (!b || b.day !== day) {
    buckets.set(key, { day, count: 1 });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.day !== day) buckets.delete(k);
    return { ok: true as const, remaining: max - 1 };
  }
  if (b.count >= max) return { ok: false as const, remaining: 0 };
  b.count += 1;
  return { ok: true as const, remaining: max - b.count };
}

/**
 * Local-testing escape hatch. Off unless RATE_LIMIT_BYPASS_TOKEN is set, and
 * then only for a request whose x-vs-bypass header matches it exactly.
 *
 * Anyone holding the token can spend the Claude budget freely, so it must never
 * be set in Vercel — it exists so clickthrough.py can run repeatedly against a
 * long-lived local server without tripping the daily cap it is not testing.
 */
export function rateLimitBypassed(req: Request) {
  const token = process.env.RATE_LIMIT_BYPASS_TOKEN;
  if (!token) return false;
  const sent = req.headers.get("x-vs-bypass");
  if (!sent) return false;
  const a = Buffer.from(sent);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
