import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { patient } from "@/lib/demo-data";
import { cookiePath, otpCookie, readChallenge, requestOtp, sessionCookie, shareLimits, verifyOtp } from "@/lib/share";

export const runtime = "nodejs";

/**
 * POST /u/:token/otp  { action: "request" } | { action: "verify", code, facility }
 *
 * Lives under /u/:token rather than /api/* on purpose: the challenge and session
 * cookies are pinned to path /u/:token, so the browser only ever returns them here.
 */
export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (token !== patient.shareToken) return NextResponse.json({ ok: false, error: "Unknown ID" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const jar = await cookies();
  const challenge = readChallenge(jar.get(otpCookie(token))?.value);

  const path = cookiePath(token);
  const secure = process.env.NODE_ENV === "production";
  const base = { httpOnly: true as const, sameSite: "lax" as const, secure, path };
  // 15 min, not 10: the lockout has to outlive the code it guards.
  const challengeMaxAge = shareLimits.LOCKOUT_MS / 1000;

  if (body.action === "request") {
    const r = requestOtp(token, challenge);
    if (!r.ok) return NextResponse.json(r, { status: 429 });
    const res = NextResponse.json({ ok: true, demoCode: r.demoCode });
    res.cookies.set(otpCookie(token), r.cookie, { ...base, maxAge: challengeMaxAge });
    return res;
  }

  if (body.action === "verify") {
    const facility = String(body.facility ?? "").trim() || "unknown";
    const r = verifyOtp(token, String(body.code ?? ""), facility, challenge);

    if (!r.ok) {
      const res = NextResponse.json({ ok: false, error: r.error }, { status: 400 });
      if (r.cookie) res.cookies.set(otpCookie(token), r.cookie, { ...base, maxAge: challengeMaxAge });
      if (r.clear) res.cookies.set(otpCookie(token), "", { ...base, maxAge: 0 });
      return res;
    }

    const res = NextResponse.json({ ok: true, expiresAt: r.expiresAt });
    res.cookies.set(sessionCookie(token), r.cookie, { ...base, maxAge: shareLimits.SESSION_TTL_MS / 1000 });
    res.cookies.set(otpCookie(token), "", { ...base, maxAge: 0 });
    return res;
  }

  return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
}
