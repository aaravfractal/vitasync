# VitaSync AI

One patient-owned health record. Next.js 16 · Tailwind v4 · Supabase · Vercel (Mumbai).

```bash
npm install
cp .env.example .env.local     # add ANTHROPIC_API_KEY to use Claude, otherwise the chat mocks
npm run dev                    # http://localhost:3000
```

Routes: `/` landing · `/onboarding` · `/pricing` · `/app` (home, symptom, book, record, vitals, refills, vault, emergency, profile, id) · `/u/{token}` public emergency strip with OTP-gated full record · `/api/chat` · `/api/share/{token}`.

Demo share link: `/u/k7q2m9x4e1`. Request the code on that page; without SMS configured the code is shown on screen.

## Deploy to Vercel
1. Push to GitHub, import in Vercel.
2. Project → Settings → Functions → Region: **Mumbai (bom1)**.
3. Add env vars from `.env.example`.
4. Add the domain `vitasync.ai` before printing any QR.

Sign-in demo code: `482913`. Every screen is fully interactive against a local store; `python3 clickthrough.py` (with the server on :3111) tests all buttons.

See `CLAUDE.md` for the build order and locked product rules.
