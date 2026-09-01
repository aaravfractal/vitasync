# VitaSync AI — Claude Code brief

One patient-owned health record. AI symptom check, doctor booking, timeline, vitals, refills, emergency, two-tier sharing. Built in Dehradun. Hosted on Vercel.

## Stack (decided, do not change)
Next.js 16 App Router + TypeScript, Tailwind v4 (tokens in `src/app/globals.css` `@theme`), lucide-react, Leaflet/OSM, Anthropic SDK behind `/api/chat`, Supabase (Postgres + phone OTP auth + RLS + storage) for data, Polygon Amoy testnet for hash anchoring. Deploy: Vercel, region `bom1` (Mumbai) so "data stays in India" is true.

## Commands
`npm run dev` · `npm run build` · `npm run lint`. Build and lint must pass before every commit.

## Design system — locked
Calm Clinic tokens live in `globals.css`. Never hard-code hex in components; use `bg-teal`, `text-muted`, `border-line`, etc. Red (`danger`) only for emergency and destructive actions. Fonts: Space Grotesk (display), Albert Sans (body), monospace for hashes/IDs. Card radius 18px, hero 22px, pills 999px, slot chips 10px, 44px tap targets, 22px screen padding. Voice: plain, human, non-alarming; never "As an AI…". Full spec: `docs/design-system.md`, screens: `docs/screens.md`.

## Product rules — locked (from the founders)
1. **Two-tier sharing.** `/u/{token}` shows the emergency strip (name, blood group, allergies, ICE, emergency meds) with NO OTP, ever. Full record opens only after a 6-digit OTP sent to the **patient's** number or a nominated caregiver's. Never to the doctor's number. 10-minute code, 5 attempts then 15-min lockout, one session per facility (60 min), every access logged, link expires 24 h, revocable. Push "Approve" in the patient's app is the parallel path.
2. **Share token is random.** The friendly ID (VS-ASHA-2381) is display only. URLs never contain the name.
3. **Hash-only vault.** Encrypt on device, SHA-256 the ciphertext, anchor only the hash. The "Sealed / verified" badge appears only after a real anchor. Until anchoring ships, copy says "hashing live, anchoring on testnet next".
4. **Emergency numbers.** 112 unified, 108 ambulance. Show both, label both, everywhere.
5. **AI safety.** Red flags → urgency `emergency` → route to `/app/emergency`, never a chat reply. Always show "AI can be wrong. For emergencies call 112." No diagnoses, no dosing.
6. **Pricing.** Free / Plus ₹299 / Family ₹499. First physical card included with Plus and Family.
7. **Honesty.** Partners (Max, CMI, Dr Lal, SRL, Apollo) are targets, not signed. Zero public users. Never claim otherwise in UI copy.

## Current state
**The client store is the source of truth.** Every button works against `src/lib/store.tsx` (React context + localStorage) seeded from `src/lib/demo-data.ts`. Bookings, logged vitals, refill orders, access grants/revokes, family/caregiver, reminders, language and sign-out all persist across refresh. `clickthrough.py` (Playwright) exercises every button; keep it green. It stays this way until a clinic partner is signed — no real patient data exists yet, so a database would only add operational risk and a privacy surface we do not need. Supabase (step 1) is deferred until then. Because the store hydrates from localStorage in an effect, every `/app` screen sits behind `HydrationGate` (`src/components/hydration-gate.tsx`, wired in `src/app/app/layout.tsx`) and shows a neutral skeleton until `ready`; without it the first paint is seed data that visibly flips. Keep new `/app` screens inside that layout. `/app/emergency` is the one exemption (locked rule 4: 112 and 108 must be in the prerendered HTML); exempt a screen only if it neither reads nor writes the store.

The share/OTP gate is stateless: `src/lib/share.ts` puts an HMAC-signed challenge (`{codeHash, expiresAt, attempts}`) and session in httpOnly cookies scoped to `/u/{token}`, signed with `SHARE_SECRET`, so it survives Vercel serverless. The cookie carries an HMAC of the code, never the code — an httpOnly cookie is still readable in the doctor's devtools. Endpoint is `POST /u/{token}/otp` (under `/u/` so the browser returns the scoped cookies). Demo code is shown on screen while `SMS_PROVIDER` is unset.

`/api/chat` uses Claude when `ANTHROPIC_API_KEY` is set, mock otherwise, capped at 5 requests per IP per day (`src/lib/rate-limit.ts`, in-memory); over the cap it returns 429 and the chat shows "Daily limit reached. Plus gets unlimited." with a link to `/pricing`. Setting `RATE_LIMIT_BYPASS_TOKEN` locally lets a request carrying a matching `x-vs-bypass` header skip the cap, so `clickthrough.py` can run repeatedly against one server — never set it in Vercel. `/api/reports/summary` follows the same Claude-or-mock pattern. Emergency uses `navigator.geolocation` and Overpass (`amenity=hospital` + `emergency=yes`, 10 km) on the device, falling back to the seeded Dehradun list if it is denied, fails, or takes over 4 s.

Screens built: landing, onboarding, pricing, home, symptom, book (with confirmation), record, AI session report (`/app/record/session/{id}`), reports summary (`/app/reports`), vitals, refills, vault, emergency, profile, my-id, public `/u/{token}`.

## Build order (do these in order, one PR each)
1. **Auth + record spine. DEFERRED** until a clinic partner is signed — we ship on the local store until then. When it comes back: Supabase phone OTP, `users` row on first login with `vs_id` and random `share_token`, records table, upload with client-side encryption (WebCrypto AES-GCM, key derived on device, never sent), hash on write, timeline reads from DB. Migration: `supabase/migrations/0001_init.sql`. It replaces the store's reads/writes, keeping the same action names.
2. **Chat sessions → record.** *Done against the store:* an `ai_session` record carries the structured summary (`ai: {urgency, symptoms, likelyCause, advice, nextStep}` on `HealthRecord`). Persisting `chat_sessions` server-side waits on step 1.
3. **Vitals + refills CRUD.** Log form, series charts from DB, refill progress from `prescriptions`.
4. **Emergency, real.** *Done:* device geolocation + Overpass within 10 km, Dehradun fallback (`src/lib/geo.ts`). Still open: OSRM for ETA, GPS-denied city search.
5. **Sharing, real.** Move `share.ts` to Supabase tables (`share_links`, `share_otps` with hashed codes, `access_grants`, `access_log`). SMS via DLT-registered sender (MSG91). Push approve. Real QR (`qrcode` package) on `/app/id`. Rate-limit `/u/*` (Upstash or Vercel KV; `src/lib/rate-limit.ts` is in-memory and per-instance). Lost-card freeze.
6. **Anchoring.** Daily Merkle root of new hashes → Polygon Amoy; store `anchor_tx`; public `/verify/{sha}` page with Polygonscan link; badge logic tied to `anchor_tx`.
7. **ABHA/ABDM.** Sandbox first. Start paperwork now; it's the longest lead item.
8. **Doctor side.** Only after clinics are signed.
9. **Watch sync.** Needs native (Expo). Last.

## Conventions
Server components by default; `"use client"` only where state or browser APIs are needed. Every API route validates input and returns `{ ok, error }` shape. No secrets on the client. Keep files small; one screen per folder under `src/app/app/*`. Keep copy in sentence case, no exclamation marks. Add a Playwright screenshot to any PR that touches UI (`python3 shots.py`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
