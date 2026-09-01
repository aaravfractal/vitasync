# VitaSync build plan and open questions

Analysis for turning the handoff and decks into a startup and a shippable product. This doc is opinion plus derived plan, not source material.

## What exists today
A live web app on Vercel with 12 pages, covering the AI assistant, dashboard, emergency map, vitals and refills. SHA-256 is computed in the browser with the Web Crypto API. On-chain anchoring is simulated. The design handoff adds 21 designed views that go well beyond what is built, including the full mobile app, ABHA linking, watch sync, reports summary, the VitaSync ID QR, and the company pages.

So the gap is not design and not narrative. The gap is backend, identity, and the supply side.

## Recommended stack
- **Web app and landing:** Next.js (App Router) on Vercel, matching what is already deployed. TypeScript throughout.
- **Mobile:** the designs are drawn at 390x844 iPhone frames. Ship a responsive PWA first from the same Next.js codebase, then React Native (Expo) when HealthKit and Health Connect are needed, since those need native modules.
- **Styling:** Tailwind with the token table from `claude/01-vitasync-design-system.md` mapped into `tailwind.config`. Do not hand-roll hex values in components.
- **Icons:** Lucide, which the handoff names as the close match.
- **Backend and data:** Postgres via Supabase, which gives phone OTP auth, row-level security, and storage in one. RLS is the right primitive when the product's core promise is "only you can see your record".
- **Files:** encrypted client-side before upload. The server should never hold a decryption key. This is what makes the VitaVault claim true rather than marketing.
- **AI:** an LLM behind a server route, never called from the client. Every session writes a structured session report (symptoms, likely cause, advice, urgency, next step) because screen 5d already depends on that shape.
- **Chain:** Polygon. Anchor a Merkle root of the day's hashes rather than one transaction per entry, or gas and latency will make per-entry anchoring painful at scale.

## Data model, first pass
```
users            id, phone, name, city, blood_group, allergies, ice_contact, abha_id
family_members   id, owner_id, member_user_id, relation
records          id, user_id, type(consult|report|rx|vital|ai_session),
                 occurred_at, provider, title, summary, file_ref,
                 sha256, anchor_tx, sealed_at
vitals           id, user_id, metric, value, unit, measured_at, source(manual|watch|lab)
prescriptions    id, user_id, medicine, dosage, prescriber, schedule,
                 days_prescribed, started_on
doctors          id, name, speciality, years, clinic, fee, lat, lng, verified_at
slots            id, doctor_id, starts_at, status
bookings         id, user_id, slot_id, record_id, status
chat_sessions    id, user_id, urgency, symptoms[], recommendation, closed_at, record_id
access_grants    id, user_id, grantee, scope, expires_at, revoked_at
access_log       id, user_id, actor, action, at
share_links      id, user_id, token, scope, expires_at, revoked_at
```
Two rules fall straight out of the designs: a record shows the verified badge only after its hash is confirmed, and every share link defaults to a 24-hour expiry and is revocable.

## Build order
1. **Auth and record spine.** Phone OTP, profile, the records table, upload, client-side encryption, hash on write, timeline UI. Without this nothing else means anything.
2. **AI assistant with session reports.** Chat, urgency classification, the recommendation card, and writing a session report into the timeline on close. This is the acquisition hook and it is already the strongest built piece.
3. **Vitals and refills.** Manual logging first, since these are pure CRUD plus charts and they fill the dashboard with real data.
4. **Emergency.** Real geolocation, Overpass or Places for `amenity=hospital` with `emergency=yes`, a directions API for ETA, country-aware emergency numbers. Low effort, high demo value.
5. **Sharing.** VitaSync ID QR, expiring links, access grants and the access log. This is what makes the doctor-side story real without needing a doctor app.
6. **Anchoring.** Daily Merkle root to Polygon, a public verify page, Polygonscan links. Until this ships, say "hashing live, anchoring next" in every surface.
7. **ABHA / ABDM.** Sandbox first. This is the longest-lead item because it needs compliance work, so start the paperwork in parallel with step 1.
8. **Booking and the doctor side.** Doctor onboarding, verification, slots, payouts. Do not build this before there are doctors willing to be onboarded.
9. **Watch sync.** Needs the native app. Last.

## The startup gaps, ranked
1. **Regulatory.** Telemedicine Practice Guidelines 2020 govern any consult flow. The DPDP Act makes VitaSync a data fiduciary with consent, breach-notification and erasure duties. Health data also carries a higher bar. Get an opinion before any consult goes live, and put a one-line disclaimer plus an escalation path into the AI product itself, which the designs already gesture at with "AI can be wrong".
2. **Supply side.** Zero signed clinics is the real bottleneck, not code. One signed Dehradun clinic with a QR at the desk is worth more than every remaining screen in the handoff. Target three by the end of the next quarter.
3. **Medical accountability.** Who is responsible when the AI's triage is wrong? A named medical advisor on the team page changes how both judges and clinics read the product.
4. **ABDM integration timeline.** Everything in the trust layer depends on it and it is the item with the least founder control.
5. **Consistency across surfaces.** Prices, emergency numbers, roadmap dates and traction claims currently disagree between the deck, the landing page and the app. Fix before the next pitch. Details in `claude/04-vitasync-pitch-decks.md`.
6. **Cost of AI inference at free tier.** 5 chats/day free with unlimited on ₹299 needs a modelled per-user inference cost, or the gross margin story collapses at exactly the moment growth works.

## Near-term milestones worth committing to
- One signed Dehradun clinic partner with a QR at the desk
- The record spine live: upload, encrypt, hash, timeline, share link with expiry
- Polygon testnet anchoring visible in the product with a working verify page
- A single reconciled fact sheet (price, emergency number, roadmap, traction) used by every surface
- Legal opinion on telemedicine and DPDP obligations
