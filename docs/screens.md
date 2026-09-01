# VitaSync screen inventory

21 designed views. Canvas IDs in brackets. Mobile unless noted.

## Mobile core (turn 2)

**Onboarding [2a]** - centered column, 28px padding. 56px teal logo chip, 30px title "Your whole health record, in one place", muted subline, three trust bullets (shield "You own your data", file "No more lost files", calendar "Any doctor, full history"). Bottom-pinned teal pill "Continue with phone number" plus "Already have an account? Sign in".

**Home / dashboard [1a]** - greeting ("Good morning" 13px muted over 26px name) and 44px teal avatar. Verified pill below. Action grid: full-width teal hero card "Not feeling well?" with white pill CTA "Check a symptom", then white cards Book doctor / My records / Refill / Vitals, each with a 22px teal outline icon, 14px title, 12px subline. Bottom: upcoming appointment card with 46px teal-tint date chip and "View" link.

**AI symptom checker [1a]** - chat screen. Header has back chevron, "Symptom Checker", and a green-dot privacy line "Private - saved only to your record". Input bar is a white pill field with a 44px teal circular send button. The AI asks at most one clarifying question, then gives a plain-language suggestion plus a recommendation card.

**Recommendation card (in chat)** - white card, 20px radius, gold overline "RECOMMENDED NEXT STEP", 15.5px Space Grotesk title, muted context line, then filled teal "Book a GP" and outline "Remind me later". CTA deep-links into booking with the suggested slot preselected.

**Doctor booking [2b]** - search pill, filter chips (GP / Today / Under 2 km / Fee ≤ ₹500), results count, doctor cards with 48px initials circle, name, "speciality · yrs · clinic", right-aligned fee and distance, then time-slot chips and a teal "Book" pill. Footer: "Booking saves to your health record automatically".

**Unified health record [2c] - signature screen** - filters All / Consults / Reports / Rx. Vertical timeline with month overlines ("AUGUST 2026") and entry cards carrying title, date, one-line summary, and a footer action ("Sealed · owned by you", "View PDF / Share", "Refill now"). Bottom-pinned teal pill "Share record with a doctor".

**Vitals tracker [2d]** - "+ Log" pill in header. Hero BP card with 26px value "122/81", "Normal range" tint pill, 90px SVG trend line with 7% area fill and end dot. 2x2 grid: blood sugar, weight, resting heart rate, SpO₂, each with delta line. Footer note: "Vitals feed into your health record, so your doctor sees the trend - not just one reading."

**Prescription refills [2e]** - gold-tint "DUE IN 3 DAYS" card with medicine, dosage, prescriber, teal "Reorder" pill and progress bar ("27 of 30 days used"). Active prescriptions list with pill-bottle icon chips and outline Reorder pills. Last order card with receipt link. Footer: "Refills need a valid prescription on your record".

**Security / blockchain [2f]** - solid teal hero card, outlined shield-check, "This record belongs to you", subline "Every entry is sealed with SHA-256. Nobody can change it - not a hospital, not us." Stats row: 14 entries sealed / 2 doctors with access / 0 third parties. Recent seals list with monospace truncated hashes ("a3f8…e21c · today 8:05 AM"). Outline buttons "Manage access" and "Download all".

**Profile / settings [2g]** - 60px avatar, name, masked phone and city. Highlighted teal-tint "Data ownership" row. Grouped list: family members (2 linked), privacy & access (2 doctors), connected clinics & labs (3), language (English), help & support. Separate destructive "Sign out" card. Footer "VitaSync AI · v1.4 · Built in Dehradun".

**Landing page [2h] - desktop, 1180px reference** - nav with How it works / For clinics / Pricing / teal "Open dashboard". Hero: trust pill "We don't sell health data to anyone", 52px h1 "The health app that actually connects the dots", subline "Symptom check, vitals, doctor booking and refills in one place. Built in Dehradun.", CTAs "Check a symptom" and "Open dashboard", floating chat-preview card on the right. Stat strip: 10+ / <60s / SHA-256 / Anywhere. Footer CTA band, solid teal: "One record. Yours." plus "Free to start · ₹99/month…" and a white "Get started" pill.

## Emergency (turn 3)

**Emergency [3a]** - title in `#C0442E`, subline "5 hospitals with 24×7 emergency near you", "Live location" teal-tint pill with green dot. Full-bleed Leaflet / OpenStreetMap map centered on 30.3225, 78.031 with a pulsing teal user dot and red hospital pins. Seeded hospitals: Doon Govt. Medical College (1.1 km), CMI Hospital (0.6 km), Synergy Institute (3.0 km), Max Super Speciality (4.2 km), Shri Mahant Indiresh (4.5 km). Bottom sheet: full-width red pill "Call ambulance · 108", two nearest-hospital rows with "Directions" pills, footer "Your medical record is shared with the hospital on arrival - one tap."

Production note from the handoff: use device geolocation, a places API (Google Places or OSM Overpass with `amenity=hospital` and `emergency=yes`), and a directions API for ETA. 108 is India's ambulance number. The web assistant screen cites 112 for emergencies.

## Web app (turn 4, matches the live build)

**Pricing [4a]** - Free ₹0 forever (AI assistant 5 chats/day, basic dashboard, medication reminders), Plus ₹299/mo marked MOST POPULAR (unlimited AI, full dashboard and insights, 2 free consults/month, medication tracker), Family ₹499/mo (4 family profiles, priority consult slots, everything in Plus). Footer strip: "NO CARD NEEDED FOR FREE · CANCEL ANYTIME · WE DON'T SELL HEALTH DATA".

**Dashboard [4b]** - nav Dashboard / Emergency / Vault / Assistant. Health score 87 synced 14m ago, weekly heart-rate chart at avg 73 bpm, medications list (Vitamin D 1000 IU morning, Metformin 500 mg after lunch, Omega-3 night) with 86% weekly adherence, hydration 5/8 glasses, insight cards (sleep down 12%, resting HR improved 4%) each with "Ask the AI about this", plus Emergency-ready and VitaVault entry points.

**AI health assistant [4c]** - chat with starter chips (headache since morning, fever for 2 days, can't sleep properly, weight loss diet, feeling anxious, what's in my vault), language toggle EN, read-aloud toggle, new chat. Right session panel shows symptoms detected and urgency, with "Book a doctor". Disclaimer: "AI CAN BE WRONG. FOR EMERGENCIES CALL 112."

## Trust and integration layer (turn 5)

**ABHA ID [5a]** - Ayushman Bharat Health Account linked and verified with ABDM, ID and handle shown, three explainers (pulls records from ABDM hospitals, consent stays with you via OTP and is revocable, one ID at every counter). Actions: "Show QR at desk", "Sync records now". Last-synced timestamp.

**Watch sync [5b]** - Apple Watch via Apple Health (live heart rate, steps, sleep, SpO₂) and Galaxy Watch via Health Connect. What syncs: heart rate and HRV, sleep stages, steps and activity, fall detection alerts. Note that abnormal readings can trigger the Emergency screen.

**Reports summary [5c]** - AI digest across 6 reports Jan to Aug 2026, prose summary plus metric tiles (HbA1c 6.4% improving, LDL 96 in range, Hb 11.8 watch), source report list with providers and dates. Disclaimer: "Summary is AI-generated from your reports - not a diagnosis".

**AI session report [5d]** - doctor-ready summary of one chat session with urgency tag, reported symptoms, likely cause, advice given, next step, and a sealed hash. Print and Share actions. Past sessions list. Key line: if the consult is booked, the report reaches the doctor before the visit.

**My VitaSync ID [5e]** - personal QR, ID `VS-ASHA-2381`, share link `vitasync.ai/u/asha-2381`. A scan always shows name, blood group, allergies, and ICE contact. The full record needs approval. Links expire after 24 hours by default and are revocable from Privacy & access.

## Company surfaces (turn 6)

**Roadmap [6a]**, **Privacy & partners [6b]**, **Polygon ledger [6c]**, **Business page [6d]**. Content captured in `claude/03-vitasync-business.md`.

## Cross-cutting behavior
- Bottom-pinned primary actions on Record and Onboarding. Keyboard-attached input on chat.
- Booking: selecting a slot tints it teal, "Book" leads to a confirmation screen that was never designed, extend the same card style. A completed booking writes a timeline entry.
- Timeline filters filter in place. Every new entry moves to "Sealed" after hashing, and the verified badge only appears after hash confirmation.
- Refill progress bar equals days consumed over days prescribed. "Reorder" opens a pharmacy order flow that was never designed.

## State to model
Auth (phone OTP), user profile, family members. Chat session (messages, pending recommendation, writes a summary to the record on close). Records list (type, date, provider, summary, hash, verified flag). Vitals series per metric. Prescriptions with computed days remaining. Doctor search (query, filters, results with slots).
