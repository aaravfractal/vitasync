/**
 * Per-IP daily counter. In-memory, so it resets on deploy and is per serverless
 * instance — good enough to stop one person burning the Claude budget, not a
 * security control. Move to Upstash/Vercel KV alongside the /u/* limits (CLAUDE.md step 5).
 */
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
