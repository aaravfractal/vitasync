/**
 * Share-token + OTP service. Stateless: every bit of state travels in HMAC-signed
 * httpOnly cookies scoped to /u/{token}, so the flow survives Vercel serverless
 * where no two requests share a process.
 *
 * Rules (locked): the OTP goes to the PATIENT's or nominated caregiver's phone,
 * never the doctor's. 6 digits, 10 min, 5 attempts then a 15-minute lockout,
 * one session per facility (60 min), every access logged, link dies in 24 h.
 *
 * The cookie carries an HMAC of the code, never the code itself — an httpOnly
 * cookie is hidden from JS but plainly readable in the doctor's devtools, and a
 * readable code would hand them the patient's approval. Same shape as the
 * `share_otps` "hashed codes" column in CLAUDE.md step 5.
 */
import { createHmac, randomInt, randomUUID, timingSafeEqual } from "node:crypto";

const OTP_TTL_MS = 10 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/** Dev fallback so the demo runs with no config. Production must set SHARE_SECRET. */
const DEV_SECRET = "vitasync-dev-share-secret-not-for-production";
let warned = false;
function secret() {
  const s = process.env.SHARE_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production" && !warned) {
    warned = true;
    console.warn("[share] SHARE_SECRET is not set — falling back to the dev secret. Set it in the Vercel project settings.");
  }
  return DEV_SECRET;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Constant-time compare of two base64url/hex strings of equal intent. */
function sameDigest(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function seal(obj: unknown) {
  const body = Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function open<T>(raw: string | undefined): T | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;
  const body = raw.slice(0, dot);
  if (!sameDigest(raw.slice(dot + 1), sign(body))) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()) as T;
  } catch {
    return null;
  }
}

/** What the /u/{token} OTP cookie holds. The code is present only as an HMAC. */
export type Challenge = { codeHash: string; expiresAt: number; attempts: number; lockedUntil?: number };
type Session = { token: string; facility: string; expiresAt: number; id: string };

export const otpCookie = (token: string) => `vs_otp_${token}`;
export const sessionCookie = (token: string) => `vs_share_${token}`;
/** Cookies are pinned to this path so they never leak to the rest of the site. */
export const cookiePath = (token: string) => `/u/${token}`;

function hashCode(token: string, code: string) {
  return createHmac("sha256", secret()).update(`otp:${token}:${code}`).digest("base64url");
}

export function readChallenge(raw: string | undefined) {
  return open<Challenge>(raw);
}

/** Best-effort in-process log. Durable access_log lands with CLAUDE.md step 5. */
const g = globalThis as unknown as { __vs_log?: Array<{ token: string; actor: string; action: string; at: string }> };
export const accessLog = (g.__vs_log ??= []);
function log(token: string, actor: string, action: string) {
  accessLog.push({ token, actor, action, at: new Date().toISOString() });
}

export function requestOtp(token: string, prev: Challenge | null) {
  const now = Date.now();
  if (prev?.lockedUntil && prev.lockedUntil > now) {
    return { ok: false as const, error: "Too many attempts. Try again in 15 minutes." };
  }
  const code = String(randomInt(100000, 1000000));
  const challenge: Challenge = { codeHash: hashCode(token, code), expiresAt: now + OTP_TTL_MS, attempts: 0 };
  log(token, "facility", "otp_requested");
  return {
    ok: true as const,
    cookie: seal(challenge),
    // TODO(step 5): send via DLT-registered SMS to the patient + caregiver.
    demoCode: process.env.SMS_PROVIDER ? undefined : code,
  };
}

type VerifyResult =
  | { ok: false; error: string; cookie?: string; clear?: boolean }
  | { ok: true; cookie: string; expiresAt: string };

export function verifyOtp(token: string, code: string, facility: string, challenge: Challenge | null): VerifyResult {
  const now = Date.now();
  if (!challenge) return { ok: false, error: "Ask the patient to approve first." };
  if (challenge.lockedUntil && challenge.lockedUntil > now) return { ok: false, error: "Locked. Try again in 15 minutes." };
  if (challenge.expiresAt < now) return { ok: false, error: "Code expired. Request a new one.", clear: true };

  if (!sameDigest(hashCode(token, code), challenge.codeHash)) {
    const attempts = challenge.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      log(token, facility, "otp_locked");
      return { ok: false, error: "Too many wrong codes. Locked for 15 minutes.", cookie: seal({ ...challenge, attempts, lockedUntil: now + LOCKOUT_MS }) };
    }
    const left = MAX_ATTEMPTS - attempts;
    return { ok: false, error: `Wrong code. ${left} ${left === 1 ? "try" : "tries"} left.`, cookie: seal({ ...challenge, attempts }) };
  }

  const expiresAt = now + SESSION_TTL_MS;
  const session: Session = { token, facility, expiresAt, id: randomUUID() };
  log(token, facility, "record_opened");
  return { ok: true, cookie: seal(session), expiresAt: new Date(expiresAt).toISOString() };
}

export function sessionValid(raw: string | undefined, token: string) {
  const s = open<Session>(raw);
  return !!s && s.token === token && s.expiresAt > Date.now();
}

export const shareLimits = { OTP_TTL_MS, LOCKOUT_MS, SESSION_TTL_MS, MAX_ATTEMPTS };
