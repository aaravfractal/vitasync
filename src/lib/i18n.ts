/**
 * Typed translation dictionary. No i18n library: `en` is the source of truth and
 * `hi` is a `Record<Key, string>`, so a missing Hindi string is a build error.
 *
 * Medical safety (CLAUDE.md locked rules 4 and 5): "112", "108", medicine names,
 * doses and blood groups are NEVER translated or transliterated. Only the label
 * around them changes. Digits stay Latin — hi-IN's default numbering system is
 * `latn`, so a number a paramedic reads is the same in both languages.
 *
 * This module is deliberately free of React and of the store so a server
 * component can call `translate()` directly — `/u/{token}` renders the emergency
 * strip in both languages at once. The client hook lives in `use-t.ts`.
 *
 * Every `hi` line carries a // REVIEW marker: no native speaker has signed these
 * off yet. `docs/hindi-review.md` is the two-column sheet for that review.
 */

export type Lang = "en" | "hi";

export const en = {
  // ---- common ----------------------------------------------------------
  "common.back": "Back",
  "common.dismiss": "Dismiss",
  "common.view": "View",
  "common.book": "Book",
  "common.download": "Download",
  "common.share": "Share",
  "common.verifyNow": "Verify now",
  "common.hashMatches": "Matches · untampered",
  "common.hashMismatch": "Mismatch · altered",
  "common.generating": "Generating…",
  "common.offline": "Offline — showing last saved emergency info",
  "common.loggedByYou": "Logged by you",

  // ---- bottom nav ------------------------------------------------------
  "nav.home": "Home",
  "nav.check": "Check",
  "nav.record": "Record",
  "nav.vitals": "Vitals",
  "nav.profile": "Profile",
  "nav.emergency": "Emergency",

  // ---- language picker -------------------------------------------------
  "lang.pick": "Choose your language",
  "lang.english": "English",
  "lang.hindi": "हिन्दी",
  "lang.shortEn": "EN",
  "lang.shortHi": "हिं",
  "lang.switchAria": "Language",

  // ---- onboarding ------------------------------------------------------
  "onb.heroTitle": "Your whole health record, in one place",
  "onb.heroSub": "Symptoms, doctors, reports, refills and emergencies, on one timeline you own.",
  "onb.b1": "You own your data",
  "onb.b2": "No more lost files",
  "onb.b3": "Any doctor, full history",
  "onb.continuePhone": "Continue with phone number",
  "onb.haveAccount": "Already have an account?",
  "onb.signIn": "Sign in",
  "onb.phoneTitle": "Your mobile number",
  "onb.phoneSub": "We'll send a one-time code. No password.",
  "onb.mobileLabel": "Mobile number",
  "onb.sendCode": "Send code",
  "onb.badPhone": "Enter a 10-digit mobile number.",
  "onb.otpTitle": "Enter the code",
  "onb.sentTo": "Sent to {phone}.",
  "onb.change": "Change",
  "onb.demoCode": "Demo mode: the code is",
  "onb.codeLabel": "6-digit code",
  "onb.wrongCode": "Wrong code. Try again.",
  "onb.continue": "Continue",

  // ---- home ------------------------------------------------------------
  "home.morning": "Good morning",
  "home.afternoon": "Good afternoon",
  "home.evening": "Good evening",
  "home.verified": "Record verified · owned by you",
  "home.notWell": "Not feeling well?",
  "home.notWellSub": "Describe it in plain words. One question back, then a next step.",
  "home.checkSymptom": "Check a symptom",
  "home.wellness": "Wellness",
  "home.wellnessOn": "{steps} steps · {a}/{b} glasses today",
  "home.wellnessOff": "Connect a watch or band, track steps and water",
  "home.bookDoctor": "Book doctor",
  "home.bookDoctorSub": "GPs near you, today",
  "home.myRecords": "My records",
  "home.myRecordsSub": "{n} entries, sealed",
  "home.refill": "Refill",
  "home.refillDueNow": "1 due now",
  "home.refillDueIn": "1 due in {n} days",
  "home.vitalsSub": "BP {v}, normal",
  "home.myId": "My VitaSync ID",
  "home.myIdSub": "Share with a doctor",
  "home.emergencySub": "Nearest 24×7 help",
  "home.sealNote": "Every entry is sealed with SHA-256. Nobody can change it.",
  "home.profileAria": "Profile",

  // ---- symptom checker -------------------------------------------------
  "sym.title": "Symptom Checker",
  "sym.private": "Private · saved only to your record",
  "sym.opener": "Tell me what's going on, in your own words.",
  "sym.placeholder": "Describe how you feel",
  "sym.send": "Send",
  "sym.nextStep": "Recommended next step",
  "sym.openEmergency": "Open emergency",
  "sym.bookGp": "Book a GP",
  "sym.remindLater": "Remind me later",
  "sym.reminderSet": "We'll remind you on your home screen",
  "sym.reminderText": "Reminder: {title} — {context}",
  "sym.reminderFallback": "book a GP",
  "sym.disclaimer": "AI can be wrong. For emergencies call 112, or 108 for an ambulance.",
  "sym.limit": "Daily limit reached. Plus gets unlimited.",
  "sym.seePlans": "See plans",
  "sym.offlineErr": "Couldn't reach the assistant. Check your connection and try again.",
  "sym.chip1": "Dull headache since morning",
  "sym.chip2": "Fever for 2 days",
  "sym.chip3": "Can't sleep properly",
  "sym.mic": "Speak",
  "sym.micStop": "Stop listening",
  "sym.listening": "Listening… speak normally",
  "sym.micDenied": "Microphone blocked. Allow it in your browser settings, or type instead.",
  "sym.speakOn": "Read replies aloud",
  "sym.speakOff": "Stop reading aloud",
  "sym.urgencyEmergency": "Emergency",
  "sym.urgencyGp": "See a GP today",
  "sym.urgencyLow": "Low urgency",
  "sym.sessionTitle": "Symptom check — {symptom}",
  "sym.noCause": "Not established from this conversation",
  "sym.noStep": "No action needed right now",

  // ---- emergency -------------------------------------------------------
  "emg.title": "Emergency",
  "emg.sub": "{n} hospitals with 24×7 emergency near you",
  "emg.live": "Live location",
  "emg.dehradun": "Dehradun",
  "emg.call112": "Call 112",
  "emg.amb108": "Ambulance · 108",
  "emg.note": "112 is the unified emergency number. 108 is the ambulance line. Your emergency strip is shared with the hospital on arrival, one tap.",
  "emg.showId": "Show my emergency ID",
  "emg.shareHospital": "Share my record with the hospital",
  "emg.sourceLive": "Your curated list plus hospitals within 10 km from OpenStreetMap. Tap a pin to jump to its row.",
  "emg.sourcePrecise": "Curated list only — the hospital search did not answer in time. Tap a pin to jump to its row.",
  "emg.sourceCurated": "Curated Dehradun list. Turn on location for hospitals near you.",
  "emg.nearest": "Nearest",
  "emg.row": "{km} km · 24×7 emergency",
  "emg.verifiedNumber": "Verified number",
  "emg.listed": "Listed",
  "emg.noNumber": "No number listed · use 108",
  "emg.call": "Call",
  "emg.callAria": "Call {name}",
  "emg.directions": "Directions",
  "emg.directionsAria": "Directions to {name}",

  // ---- my id -----------------------------------------------------------
  "id.title": "My VitaSync ID",
  "id.qrAlt": "QR code for {url}",
  "id.shareQr": "Share QR",
  "id.shareLink": "Share link",
  "id.downloadQr": "Download QR image",
  "id.linkCopied": "Link copied",
  "id.stripLine": "Name, blood group, allergies, ICE",
  "id.always": "Always",
  "id.fullRecord": "Full health record",
  "id.afterApprove": "After you approve",
  "id.note": "Approval is a one-time code to your phone or your caregiver's. Links expire after 24 hours and you can revoke them from Privacy & access.",
  "id.preview": "Preview what a doctor sees",

  // ---- health record ---------------------------------------------------
  "rec.title": "Health record",
  "rec.sub": "{n} entries · sealed",
  "rec.reportsSummary": "Reports summary",
  "rec.all": "All",
  "rec.consults": "Consults",
  "rec.reports": "Reports",
  "rec.rx": "Rx",
  "rec.sealed": "Sealed · owned by you",
  "rec.sealing": "Sealing…",
  "rec.actionViewShare": "View / Share",
  "rec.actionRefill": "Refill",
  "rec.actionReport": "View report",
  "rec.actionOpen": "Open",
  "rec.empty": "Nothing here yet. Entries appear as you book, log vitals and upload reports.",
  "rec.shareWithDoctor": "Share record with a doctor",
  "rec.sha": "SHA-256",
  "rec.shaEncrypted": "SHA-256 of the encrypted file",
  "rec.pending": "pending",
  "rec.anchorNext": "anchoring on Polygon testnet next",
  "rec.refillNow": "Refill now",
  "rec.downloadedTxt": "Downloaded. PDF export arrives with real uploads.",
  "rec.decrypted": "Decrypted on this device and saved",

  // ---- upload report ---------------------------------------------------
  "upl.card": "Upload report",
  "upl.cardSub": "PDF or photo, encrypted on this device",
  "upl.chooseFile": "Choose a file",
  "upl.fileHint": "PDF or photo, up to 10 MB",
  "upl.titleLabel": "Title",
  "upl.titlePlaceholder": "e.g. Lipid panel",
  "upl.providerLabel": "Lab or clinic",
  "upl.providerPlaceholder": "e.g. Dr Lal PathLabs",
  "upl.dateLabel": "Date on the report",
  "upl.privacy": "Encrypted here with a key that never leaves this device. Your record keeps the hash of the encrypted file, nothing else.",
  "upl.save": "Encrypt and save",
  "upl.saving": "Encrypting…",
  "upl.onlyPdf": "PDF or image only.",
  "upl.tooBig": "That file is {size}. The limit is 10 MB.",
  "upl.failed": "Could not encrypt that file. Try again.",
  "upl.done": "Encrypted on your device and added to your record",
  "upl.uploadedBy": "Uploaded by you",
  "upl.summary": "{name} · {size}. Encrypted on this device, so only you can open it.",

  // ---- attachment viewer -----------------------------------------------
  "att.decrypting": "Decrypting on this device…",
  "att.otherDevice": "This file was encrypted on another device, so it cannot be opened here. The hash below still proves what was sealed.",
  "att.whatsStored": "What's stored",
  "att.hide": "Hide",
  "att.firstBytes": "First {n} bytes of {total} of ciphertext",
  "att.allThatLeaves": "This is all that would ever leave your phone — plus the hash.",
  "att.nothingStored": "Nothing stored on this device.",

  // ---- refills ---------------------------------------------------------
  "ref.title": "Refills",
  "ref.dueNow": "Due now",
  "ref.dueInDays": "Due in {n} days",
  "ref.dueInDay": "Due in 1 day",
  "ref.daysUsed": "{used} of {total} days used",
  "ref.reorder": "Reorder",
  "ref.active": "Active prescriptions",
  "ref.daysLeft": "{dosage} · {n} days left",
  "ref.lastOrder": "Last order",
  "ref.lastOrders": "Last orders",
  "ref.receipt": "Receipt",
  "ref.needRx": "Refills need a valid prescription on your record.",
  "ref.pharmacy": "Pharmacy",
  "ref.deliverTo": "Deliver to",
  "ref.estTotal": "Estimated total",
  "ref.place": "Place order",
  "ref.simNote": "Pharmacy fulfilment is simulated until a partner is signed.",
  "ref.placed": "Order placed. Receipt is in Last order.",
  "ref.rxLine": "{dosage} · {days} days · Rx by {prescriber}",
  "ref.item": "Item",
  "ref.date": "Date",
  "ref.status": "Status",
  "ref.total": "Total",
  "ref.statusPlaced": "placed",
  "ref.statusDelivered": "delivered",
  "ref.orderTitle": "Refill ordered: {medicine}",
  "ref.orderSummary": "{qty} units · ₹{amount} · against {prescriber}'s prescription. Delivery to {address}.",

  // ---- vitals ----------------------------------------------------------
  "vit.title": "Vitals",
  "vit.log": "Log",
  "vit.normalRange": "Normal range",
  "vit.watch": "Watch",
  "vit.lastN": "Last {n} readings (systolic)",
  "vit.note": "Vitals feed into your health record, so your doctor sees the trend, not just one reading.",
  "vit.sheetTitle": "Log a reading",
  "vit.metric": "Metric",
  "vit.valueLabel": "Value ({unit})",
  "vit.save": "Save reading",
  "vit.logged": "Logged and added to your record",
  "vit.loggedJustNow": "logged just now",
  "vit.vsLast": "{d} vs last",
  "vit.outOfRange": "Outside the usual range. Worth mentioning at your next consult.",
  "vit.inRange": "Within normal range.",
  "vit.bp": "Blood pressure",
  "vit.glucose": "Blood sugar",
  "vit.weight": "Weight",
  "vit.hr": "Resting heart rate",
  "vit.spo2": "SpO₂",

  // ---- wellness --------------------------------------------------------
  "wel.title": "Wellness",
  "wel.noDevice": "No device connected",
  "wel.targets": "Targets",
  "wel.targetsAria": "Edit targets",
  "wel.demoNote": "Demo sync · real watch sync ships with the mobile app",
  "wel.connect": "Connect a device",
  "wel.tapConnect": "Tap to connect",
  "wel.searching": "Searching…",
  "wel.connected": "Connected",
  "wel.disconnect": "Disconnect {name}",
  "wel.today": "Today, live",
  "wel.steps": "Steps",
  "wel.kcal": "Active kcal",
  "wel.activeMin": "Active minutes",
  "wel.of": "of {n}",
  "wel.askAi": "Ask the AI about this",
  "wel.updating": "Updating every half minute or so while this screen is open. {note}.",
  "wel.connectPrompt": "Connect a device to see steps, kcal and active minutes move.",
  "wel.water": "Water",
  "wel.glasses": "{a} of {b} glasses",
  "wel.addGlass": "+ Add glass",
  "wel.footNote": "These figures come from demo sync, not a medical device, and a summary is added to your record once a day. Real Apple Health and Health Connect reads need the native app.",
  "wel.targetsSheet": "Daily targets",
  "wel.tSteps": "Steps",
  "wel.tKcal": "Active kcal burned",
  "wel.tMin": "Active minutes",
  "wel.tWater": "Glasses of water",
  "wel.saveTargets": "Save targets",
  "wel.saved": "Targets updated",
  "wel.connectedToast": "{name} connected · demo sync",
  "wel.disconnected": "Device disconnected",
  "wel.summaryTitle": "Activity summary — {steps} steps, {a}/{b} glasses",
  "wel.summaryBody": "{steps} steps, {kcal} active kcal, {min} active minutes, {a} of {b} glasses of water. Figures are from demo sync, not a medical device.",
  "wel.demoSync": "{name} · demo sync",
  "wel.askSteps": "My watch says I walked {steps} steps today, against a target of {target}. Is that enough for someone like me?",
  "wel.askKcal": "I burned about {kcal} active kcal today against a {target} kcal target. What should I make of that?",
  "wel.askMin": "I got {min} active minutes today against a {target} minute target. Is that enough movement?",
  "wel.askWater": "I have had {a} of {b} glasses of water today. Should I be drinking more?",

  // ---- profile ---------------------------------------------------------
  "prof.title": "Profile",
  "prof.family": "Family members",
  "prof.familySub": "{n} linked",
  "prof.access": "Privacy & access",
  "prof.accessSub": "{a} with access · {b} events logged",
  "prof.clinics": "Connected clinics & labs",
  "prof.abha": "ABHA",
  "prof.abhaLinked": "Linked · verified with ABDM",
  "prof.abhaNot": "Not linked",
  "prof.language": "Language",
  "prof.help": "Help & support",
  "prof.ownership": "Data ownership",
  "prof.ownershipSub": "You own the record. We never sell your data.",
  "prof.signOut": "Sign out",
  "prof.version": "VitaSync AI · v1.4 · Built in Dehradun",
  "prof.elder": "Elder Mode",
  "prof.elderOn": "On · large type, simpler home",
  "prof.elderOff": "Off",

  // ---- language screen -------------------------------------------------
  "langs.title": "Language",
  "langs.englishFull": "English",
  "langs.hindiFull": "हिन्दी (Hindi)",
  "langs.selectedEn": "English selected",
  "langs.selectedHi": "हिन्दी चुनी गई",
  "langs.note": "The app, the assistant and voice input all follow this choice. Hindi strings are machine-drafted and still under review — see docs/hindi-review.md.",
  "langs.elderTitle": "Elder Mode",
  "langs.elderSub": "Bigger text, a simpler home screen, and replies read aloud",
  "langs.elderOnToast": "Elder Mode on",
  "langs.elderOffToast": "Elder Mode off",

  // ---- elder mode ------------------------------------------------------
  "elder.callFamily": "Call family",
  "elder.callFamilySub": "{name} · {relation}",
  "elder.noCaregiver": "Add a caregiver in Profile",
  "elder.more": "Everything else is in Profile",

  // ---- public share page /u/{token} ------------------------------------
  "u.kicker": "Patient health ID",
  "u.emergencyBanner": "EMERGENCY · no code needed",
  "u.bloodGroup": "Blood group",
  "u.allergies": "Allergies",
  "u.emergencyMeds": "Emergency meds",
  "u.ice": "ICE",
  "u.doctorNote": "Doctor: the emergency info above needs no code. The full file opens after a one-time code.",
  "u.approved": "Approved by the patient · this session only · logged",
  "u.fullRecord": "Full record",
  "u.gateHead": "Full record · reports, consults, AI summaries",
  "u.gateNeeds": "Needs the patient's approval. A 6-digit code goes to their phone, or their nominated caregiver's.",
  "u.request": "Request full record",
  "u.sent": "Code sent to the patient. Ask them for it.",
  "u.demo": "Demo mode (no SMS configured): code is",
  "u.facility": "Your name / facility (for the log)",
  "u.code": "6-digit code",
  "u.open": "Open record",
  "u.foot": "Full record opens only with a one-time code sent to the patient's or caregiver's phone. Every access is logged and visible to the patient. Link expires in 24 hours.",
} as const;

export type Key = keyof typeof en;

/**
 * Hindi. Drafted here, NOT yet reviewed by a native speaker — every line is
 * marked // REVIEW and listed in docs/hindi-review.md. Numerals, "112", "108",
 * medicine names, doses and blood groups stay exactly as they are in English.
 */
export const hi: Record<Key, string> = {
  // ---- common ----------------------------------------------------------
  "common.back": "वापस", // REVIEW
  "common.dismiss": "हटाएँ", // REVIEW
  "common.view": "देखें", // REVIEW
  "common.book": "बुक करें", // REVIEW
  "common.download": "डाउनलोड करें", // REVIEW
  "common.share": "साझा करें", // REVIEW
  "common.verifyNow": "अभी जाँचें", // REVIEW
  "common.hashMatches": "मेल खाता है · कोई छेड़छाड़ नहीं", // REVIEW
  "common.hashMismatch": "मेल नहीं खाता · बदला गया है", // REVIEW
  "common.generating": "बन रहा है…", // REVIEW
  "common.offline": "ऑफ़लाइन — पिछली सहेजी गई आपातकालीन जानकारी दिख रही है", // REVIEW
  "common.loggedByYou": "आपने दर्ज किया", // REVIEW

  // ---- bottom nav ------------------------------------------------------
  "nav.home": "होम", // REVIEW
  "nav.check": "जाँच", // REVIEW
  "nav.record": "रिकॉर्ड", // REVIEW
  "nav.vitals": "वाइटल", // REVIEW
  "nav.profile": "प्रोफ़ाइल", // REVIEW
  "nav.emergency": "आपातकाल", // REVIEW

  // ---- language picker -------------------------------------------------
  "lang.pick": "अपनी भाषा चुनें", // REVIEW
  "lang.english": "English", // REVIEW — a language's own name stays in its own script
  "lang.hindi": "हिन्दी", // REVIEW
  "lang.shortEn": "EN", // REVIEW
  "lang.shortHi": "हिं", // REVIEW
  "lang.switchAria": "भाषा", // REVIEW

  // ---- onboarding ------------------------------------------------------
  "onb.heroTitle": "आपका पूरा स्वास्थ्य रिकॉर्ड, एक ही जगह", // REVIEW
  "onb.heroSub": "लक्षण, डॉक्टर, रिपोर्ट, दवाएँ और आपात स्थिति — सब एक टाइमलाइन पर, जो आपकी अपनी है।", // REVIEW
  "onb.b1": "आपका डेटा आपका ही रहता है", // REVIEW
  "onb.b2": "अब कोई फ़ाइल नहीं खोएगी", // REVIEW
  "onb.b3": "कोई भी डॉक्टर, पूरा इतिहास", // REVIEW
  "onb.continuePhone": "मोबाइल नंबर से आगे बढ़ें", // REVIEW
  "onb.haveAccount": "पहले से खाता है?", // REVIEW
  "onb.signIn": "साइन इन करें", // REVIEW
  "onb.phoneTitle": "आपका मोबाइल नंबर", // REVIEW
  "onb.phoneSub": "हम एक बार का कोड भेजेंगे। कोई पासवर्ड नहीं।", // REVIEW
  "onb.mobileLabel": "मोबाइल नंबर", // REVIEW
  "onb.sendCode": "कोड भेजें", // REVIEW
  "onb.badPhone": "10 अंकों का मोबाइल नंबर डालिए।", // REVIEW
  "onb.otpTitle": "कोड डालिए", // REVIEW
  "onb.sentTo": "{phone} पर भेजा गया।", // REVIEW
  "onb.change": "बदलें", // REVIEW
  "onb.demoCode": "डेमो मोड: कोड है", // REVIEW
  "onb.codeLabel": "6 अंकों का कोड", // REVIEW
  "onb.wrongCode": "कोड ग़लत है। फिर कोशिश कीजिए।", // REVIEW
  "onb.continue": "आगे बढ़ें", // REVIEW

  // ---- home ------------------------------------------------------------
  "home.morning": "सुप्रभात", // REVIEW
  "home.afternoon": "नमस्कार", // REVIEW
  "home.evening": "शुभ संध्या", // REVIEW
  "home.verified": "रिकॉर्ड प्रमाणित · आपका अपना", // REVIEW
  "home.notWell": "तबीयत ठीक नहीं लग रही?", // REVIEW
  "home.notWellSub": "अपने शब्दों में बताइए। एक सवाल पूछेंगे, फिर अगला कदम बताएँगे।", // REVIEW
  "home.checkSymptom": "लक्षण जाँचें", // REVIEW
  "home.wellness": "वेलनेस", // REVIEW
  "home.wellnessOn": "{steps} कदम · आज {a}/{b} गिलास", // REVIEW
  "home.wellnessOff": "घड़ी या बैंड जोड़िए, कदम और पानी देखिए", // REVIEW
  "home.bookDoctor": "डॉक्टर बुक करें", // REVIEW
  "home.bookDoctorSub": "पास के डॉक्टर, आज ही", // REVIEW
  "home.myRecords": "मेरे रिकॉर्ड", // REVIEW
  "home.myRecordsSub": "{n} प्रविष्टियाँ, सील की हुई", // REVIEW
  "home.refill": "दवा दोबारा लें", // REVIEW
  "home.refillDueNow": "1 अभी बाकी", // REVIEW
  "home.refillDueIn": "1 दवा {n} दिन में", // REVIEW
  "home.vitalsSub": "BP {v}, सामान्य", // REVIEW — "BP" and the reading itself stay as they are
  "home.myId": "मेरा VitaSync ID", // REVIEW
  "home.myIdSub": "डॉक्टर को दिखाइए", // REVIEW
  "home.emergencySub": "नज़दीकी 24×7 मदद", // REVIEW
  "home.sealNote": "हर प्रविष्टि SHA-256 से सील है। कोई इसे बदल नहीं सकता।", // REVIEW
  "home.profileAria": "प्रोफ़ाइल", // REVIEW

  // ---- symptom checker -------------------------------------------------
  "sym.title": "लक्षण जाँच", // REVIEW
  "sym.private": "निजी · सिर्फ़ आपके रिकॉर्ड में सहेजा जाता है", // REVIEW
  "sym.opener": "अपने शब्दों में बताइए कि क्या तकलीफ़ है।", // REVIEW
  "sym.placeholder": "बताइए आप कैसा महसूस कर रहे हैं", // REVIEW
  "sym.send": "भेजें", // REVIEW
  "sym.nextStep": "सुझाया गया अगला कदम", // REVIEW
  "sym.openEmergency": "आपातकाल खोलें", // REVIEW
  "sym.bookGp": "डॉक्टर बुक करें", // REVIEW
  "sym.remindLater": "बाद में याद दिलाएँ", // REVIEW
  "sym.reminderSet": "हम आपके होम स्क्रीन पर याद दिला देंगे", // REVIEW
  "sym.reminderText": "याद दिलाना: {title} — {context}", // REVIEW
  "sym.reminderFallback": "डॉक्टर बुक करना", // REVIEW
  "sym.disclaimer": "AI ग़लत हो सकता है। आपात स्थिति में 112 पर कॉल कीजिए, या एम्बुलेंस के लिए 108 पर।", // REVIEW — 112 and 108 are never translated
  "sym.limit": "आज की सीमा पूरी हो गई। Plus में कोई सीमा नहीं।", // REVIEW
  "sym.seePlans": "प्लान देखें", // REVIEW
  "sym.offlineErr": "सहायक तक नहीं पहुँच सके। कनेक्शन जाँचकर फिर कोशिश कीजिए।", // REVIEW
  "sym.chip1": "सुबह से हल्का सिर दर्द", // REVIEW
  "sym.chip2": "दो दिन से बुख़ार", // REVIEW
  "sym.chip3": "ठीक से नींद नहीं आ रही", // REVIEW
  "sym.mic": "बोलकर बताएँ", // REVIEW
  "sym.micStop": "सुनना बंद करें", // REVIEW
  "sym.listening": "सुन रहे हैं… सामान्य रूप से बोलिए", // REVIEW
  "sym.micDenied": "माइक्रोफ़ोन बंद है। ब्राउज़र सेटिंग में इसकी अनुमति दीजिए, या लिखकर बताइए।", // REVIEW
  "sym.speakOn": "जवाब पढ़कर सुनाएँ", // REVIEW
  "sym.speakOff": "पढ़कर सुनाना बंद करें", // REVIEW
  "sym.urgencyEmergency": "आपातकाल", // REVIEW
  "sym.urgencyGp": "आज ही डॉक्टर को दिखाइए", // REVIEW
  "sym.urgencyLow": "कम गंभीर", // REVIEW
  "sym.sessionTitle": "लक्षण जाँच — {symptom}", // REVIEW
  "sym.noCause": "इस बातचीत से कारण तय नहीं हुआ", // REVIEW
  "sym.noStep": "अभी कुछ करने की ज़रूरत नहीं", // REVIEW

  // ---- emergency -------------------------------------------------------
  "emg.title": "आपातकाल", // REVIEW
  "emg.sub": "आपके पास 24×7 इमरजेंसी वाले {n} अस्पताल", // REVIEW
  "emg.live": "लाइव लोकेशन", // REVIEW
  "emg.dehradun": "देहरादून", // REVIEW
  "emg.call112": "112 पर कॉल करें", // REVIEW — the number itself never changes
  "emg.amb108": "एम्बुलेंस · 108", // REVIEW — the number itself never changes
  "emg.note": "112 एक ही आपातकालीन नंबर है। 108 एम्बुलेंस के लिए है। अस्पताल पहुँचते ही आपकी आपातकालीन जानकारी एक टैप में साझा हो जाती है।", // REVIEW
  "emg.showId": "मेरा आपातकालीन ID दिखाएँ", // REVIEW
  "emg.shareHospital": "अस्पताल के साथ मेरा रिकॉर्ड साझा करें", // REVIEW
  "emg.sourceLive": "आपकी चुनी हुई सूची और OpenStreetMap से 10 किमी के भीतर के अस्पताल। पंक्ति पर जाने के लिए पिन दबाइए।", // REVIEW
  "emg.sourcePrecise": "सिर्फ़ चुनी हुई सूची — अस्पताल खोज समय पर जवाब नहीं दे पाई। पंक्ति पर जाने के लिए पिन दबाइए।", // REVIEW
  "emg.sourceCurated": "देहरादून की चुनी हुई सूची। पास के अस्पतालों के लिए लोकेशन चालू कीजिए।", // REVIEW
  "emg.nearest": "सबसे पास", // REVIEW
  "emg.row": "{km} किमी · 24×7 इमरजेंसी", // REVIEW
  "emg.verifiedNumber": "नंबर जाँचा हुआ", // REVIEW
  "emg.listed": "सूचीबद्ध", // REVIEW
  "emg.noNumber": "कोई नंबर दर्ज नहीं · 108 इस्तेमाल कीजिए", // REVIEW
  "emg.call": "कॉल", // REVIEW
  "emg.callAria": "{name} को कॉल करें", // REVIEW
  "emg.directions": "रास्ता", // REVIEW
  "emg.directionsAria": "{name} तक का रास्ता", // REVIEW

  // ---- my id -----------------------------------------------------------
  "id.title": "मेरा VitaSync ID", // REVIEW
  "id.qrAlt": "{url} का QR कोड", // REVIEW
  "id.shareQr": "QR साझा करें", // REVIEW
  "id.shareLink": "लिंक साझा करें", // REVIEW
  "id.downloadQr": "QR इमेज डाउनलोड करें", // REVIEW
  "id.linkCopied": "लिंक कॉपी हो गया", // REVIEW
  "id.stripLine": "नाम, ब्लड ग्रुप, एलर्जी, ICE", // REVIEW — "ICE" kept as-is
  "id.always": "हमेशा", // REVIEW
  "id.fullRecord": "पूरा स्वास्थ्य रिकॉर्ड", // REVIEW
  "id.afterApprove": "आपकी मंज़ूरी के बाद", // REVIEW
  "id.note": "मंज़ूरी के लिए आपके या आपके देखभालकर्ता के फ़ोन पर एक बार का कोड आता है। लिंक 24 घंटे में ख़त्म हो जाते हैं और आप उन्हें प्राइवेसी और एक्सेस से रद्द कर सकते हैं।", // REVIEW
  "id.preview": "देखिए डॉक्टर को क्या दिखता है", // REVIEW

  // ---- health record ---------------------------------------------------
  "rec.title": "स्वास्थ्य रिकॉर्ड", // REVIEW
  "rec.sub": "{n} प्रविष्टियाँ · सील की हुई", // REVIEW
  "rec.reportsSummary": "रिपोर्ट सारांश", // REVIEW
  "rec.all": "सभी", // REVIEW
  "rec.consults": "परामर्श", // REVIEW
  "rec.reports": "रिपोर्ट", // REVIEW
  "rec.rx": "दवाएँ", // REVIEW
  "rec.sealed": "सील · आपका अपना", // REVIEW
  "rec.sealing": "सील हो रहा है…", // REVIEW
  "rec.actionViewShare": "देखें / साझा करें", // REVIEW
  "rec.actionRefill": "दोबारा लें", // REVIEW
  "rec.actionReport": "रिपोर्ट देखें", // REVIEW
  "rec.actionOpen": "खोलें", // REVIEW
  "rec.empty": "अभी यहाँ कुछ नहीं है। जैसे-जैसे आप बुक करेंगे, वाइटल दर्ज करेंगे और रिपोर्ट अपलोड करेंगे, प्रविष्टियाँ यहाँ दिखेंगी।", // REVIEW
  "rec.shareWithDoctor": "डॉक्टर के साथ रिकॉर्ड साझा करें", // REVIEW
  "rec.sha": "SHA-256", // REVIEW — technical identifier, never translated
  "rec.shaEncrypted": "एन्क्रिप्टेड फ़ाइल का SHA-256", // REVIEW
  "rec.pending": "बाकी है", // REVIEW
  "rec.anchorNext": "Polygon टेस्टनेट पर एंकरिंग अगले चरण में", // REVIEW
  "rec.refillNow": "अभी दोबारा लें", // REVIEW
  "rec.downloadedTxt": "डाउनलोड हो गया। असली अपलोड के साथ PDF एक्सपोर्ट आएगा।", // REVIEW
  "rec.decrypted": "इसी डिवाइस पर डिक्रिप्ट करके सहेजा गया", // REVIEW

  // ---- upload report ---------------------------------------------------
  "upl.card": "रिपोर्ट अपलोड करें", // REVIEW
  "upl.cardSub": "PDF या फ़ोटो, इसी डिवाइस पर एन्क्रिप्ट", // REVIEW
  "upl.chooseFile": "फ़ाइल चुनिए", // REVIEW
  "upl.fileHint": "PDF या फ़ोटो, 10 MB तक", // REVIEW
  "upl.titleLabel": "शीर्षक", // REVIEW
  "upl.titlePlaceholder": "जैसे Lipid panel", // REVIEW
  "upl.providerLabel": "लैब या क्लिनिक", // REVIEW
  "upl.providerPlaceholder": "जैसे Dr Lal PathLabs", // REVIEW
  "upl.dateLabel": "रिपोर्ट पर लिखी तारीख़", // REVIEW
  "upl.privacy": "यहीं ऐसी चाबी से एन्क्रिप्ट किया जाता है जो इस डिवाइस से कभी बाहर नहीं जाती। आपके रिकॉर्ड में सिर्फ़ एन्क्रिप्टेड फ़ाइल का हैश रहता है, और कुछ नहीं।", // REVIEW
  "upl.save": "एन्क्रिप्ट करके सहेजें", // REVIEW
  "upl.saving": "एन्क्रिप्ट हो रहा है…", // REVIEW
  "upl.onlyPdf": "सिर्फ़ PDF या इमेज।", // REVIEW
  "upl.tooBig": "यह फ़ाइल {size} की है। सीमा 10 MB है।", // REVIEW
  "upl.failed": "यह फ़ाइल एन्क्रिप्ट नहीं हो सकी। फिर कोशिश कीजिए।", // REVIEW
  "upl.done": "आपके डिवाइस पर एन्क्रिप्ट होकर रिकॉर्ड में जुड़ गई", // REVIEW
  "upl.uploadedBy": "आपने अपलोड किया", // REVIEW
  "upl.summary": "{name} · {size}। इसी डिवाइस पर एन्क्रिप्ट, इसलिए इसे सिर्फ़ आप खोल सकते हैं।", // REVIEW

  // ---- attachment viewer -----------------------------------------------
  "att.decrypting": "इसी डिवाइस पर डिक्रिप्ट हो रहा है…", // REVIEW
  "att.otherDevice": "यह फ़ाइल किसी दूसरे डिवाइस पर एन्क्रिप्ट हुई थी, इसलिए यहाँ नहीं खुलेगी। नीचे दिया हैश फिर भी साबित करता है कि क्या सील हुआ था।", // REVIEW
  "att.whatsStored": "क्या सहेजा गया है", // REVIEW
  "att.hide": "छिपाएँ", // REVIEW
  "att.firstBytes": "{total} सिफ़रटेक्स्ट में से पहले {n} बाइट", // REVIEW
  "att.allThatLeaves": "आपके फ़ोन से बस इतना ही बाहर जाता — और हैश।", // REVIEW
  "att.nothingStored": "इस डिवाइस पर कुछ भी सहेजा नहीं गया है।", // REVIEW

  // ---- refills ---------------------------------------------------------
  "ref.title": "दवा दोबारा", // REVIEW
  "ref.dueNow": "अभी बाकी", // REVIEW
  "ref.dueInDays": "{n} दिन में बाकी", // REVIEW
  "ref.dueInDay": "1 दिन में बाकी", // REVIEW
  "ref.daysUsed": "{total} में से {used} दिन इस्तेमाल हुए", // REVIEW
  "ref.reorder": "दोबारा मँगाएँ", // REVIEW
  "ref.active": "चालू पर्चियाँ", // REVIEW
  "ref.daysLeft": "{dosage} · {n} दिन बाकी", // REVIEW
  "ref.lastOrder": "पिछला ऑर्डर", // REVIEW
  "ref.lastOrders": "पिछले ऑर्डर", // REVIEW
  "ref.receipt": "रसीद", // REVIEW
  "ref.needRx": "दोबारा दवा के लिए आपके रिकॉर्ड में वैध पर्ची होनी चाहिए।", // REVIEW
  "ref.pharmacy": "फ़ार्मेसी", // REVIEW
  "ref.deliverTo": "यहाँ पहुँचाएँ", // REVIEW
  "ref.estTotal": "अनुमानित कुल", // REVIEW
  "ref.place": "ऑर्डर करें", // REVIEW
  "ref.simNote": "पार्टनर तय होने तक फ़ार्मेसी डिलीवरी सिम्युलेटेड है।", // REVIEW
  "ref.placed": "ऑर्डर हो गया। रसीद पिछला ऑर्डर में है।", // REVIEW
  "ref.rxLine": "{dosage} · {days} दिन · पर्ची {prescriber} की", // REVIEW
  "ref.item": "दवा", // REVIEW
  "ref.date": "तारीख़", // REVIEW
  "ref.status": "स्थिति", // REVIEW
  "ref.total": "कुल", // REVIEW
  "ref.statusPlaced": "ऑर्डर हुआ", // REVIEW
  "ref.statusDelivered": "पहुँच गया", // REVIEW
  "ref.orderTitle": "दोबारा ऑर्डर: {medicine}", // REVIEW — the medicine name is never translated
  "ref.orderSummary": "{qty} इकाई · ₹{amount} · {prescriber} की पर्ची पर। डिलीवरी {address} पर।", // REVIEW

  // ---- vitals ----------------------------------------------------------
  "vit.title": "वाइटल", // REVIEW
  "vit.log": "दर्ज करें", // REVIEW
  "vit.normalRange": "सामान्य सीमा", // REVIEW
  "vit.watch": "ध्यान दें", // REVIEW
  "vit.lastN": "पिछली {n} रीडिंग (सिस्टोलिक)", // REVIEW
  "vit.note": "वाइटल आपके स्वास्थ्य रिकॉर्ड में जुड़ते हैं, ताकि डॉक्टर एक रीडिंग नहीं, पूरा रुझान देख सके।", // REVIEW
  "vit.sheetTitle": "रीडिंग दर्ज करें", // REVIEW
  "vit.metric": "माप", // REVIEW
  "vit.valueLabel": "मान ({unit})", // REVIEW
  "vit.save": "रीडिंग सहेजें", // REVIEW
  "vit.logged": "दर्ज होकर आपके रिकॉर्ड में जुड़ गया", // REVIEW
  "vit.loggedJustNow": "अभी दर्ज किया", // REVIEW
  "vit.vsLast": "पिछली बार से {d}", // REVIEW
  "vit.outOfRange": "सामान्य सीमा से बाहर। अगली बार डॉक्टर को ज़रूर बताइए।", // REVIEW
  "vit.inRange": "सामान्य सीमा के भीतर।", // REVIEW
  "vit.bp": "रक्तचाप", // REVIEW
  "vit.glucose": "ब्लड शुगर", // REVIEW
  "vit.weight": "वज़न", // REVIEW
  "vit.hr": "आराम की हृदय गति", // REVIEW
  "vit.spo2": "SpO₂", // REVIEW — clinical abbreviation, kept as-is

  // ---- wellness --------------------------------------------------------
  "wel.title": "वेलनेस", // REVIEW
  "wel.noDevice": "कोई डिवाइस नहीं जुड़ा", // REVIEW
  "wel.targets": "लक्ष्य", // REVIEW
  "wel.targetsAria": "लक्ष्य बदलें", // REVIEW
  "wel.demoNote": "डेमो सिंक · असली घड़ी सिंक मोबाइल ऐप के साथ आएगा", // REVIEW
  "wel.connect": "डिवाइस जोड़ें", // REVIEW
  "wel.tapConnect": "जोड़ने के लिए दबाएँ", // REVIEW
  "wel.searching": "खोज रहे हैं…", // REVIEW
  "wel.connected": "जुड़ गया", // REVIEW
  "wel.disconnect": "{name} हटाएँ", // REVIEW
  "wel.today": "आज, लाइव", // REVIEW
  "wel.steps": "कदम", // REVIEW
  "wel.kcal": "सक्रिय kcal", // REVIEW — the unit stays as-is
  "wel.activeMin": "सक्रिय मिनट", // REVIEW
  "wel.of": "{n} में से", // REVIEW
  "wel.askAi": "इस बारे में AI से पूछें", // REVIEW
  "wel.updating": "यह स्क्रीन खुली रहने तक हर आधे मिनट में अपडेट होता है। {note}।", // REVIEW
  "wel.connectPrompt": "कदम, kcal और सक्रिय मिनट चलते देखने के लिए डिवाइस जोड़िए।", // REVIEW
  "wel.water": "पानी", // REVIEW
  "wel.glasses": "{b} में से {a} गिलास", // REVIEW
  "wel.addGlass": "+ एक गिलास", // REVIEW
  "wel.footNote": "ये आँकड़े डेमो सिंक से आते हैं, किसी मेडिकल डिवाइस से नहीं, और दिन में एक बार इनका सारांश आपके रिकॉर्ड में जुड़ जाता है। असली Apple Health और Health Connect के लिए नेटिव ऐप चाहिए।", // REVIEW
  "wel.targetsSheet": "रोज़ के लक्ष्य", // REVIEW
  "wel.tSteps": "कदम", // REVIEW
  "wel.tKcal": "जली हुई सक्रिय kcal", // REVIEW
  "wel.tMin": "सक्रिय मिनट", // REVIEW
  "wel.tWater": "पानी के गिलास", // REVIEW
  "wel.saveTargets": "लक्ष्य सहेजें", // REVIEW
  "wel.saved": "लक्ष्य बदल गए", // REVIEW
  "wel.connectedToast": "{name} जुड़ गया · डेमो सिंक", // REVIEW
  "wel.disconnected": "डिवाइस हट गया", // REVIEW
  "wel.summaryTitle": "गतिविधि सारांश — {steps} कदम, {a}/{b} गिलास", // REVIEW
  "wel.summaryBody": "{steps} कदम, {kcal} सक्रिय kcal, {min} सक्रिय मिनट, {b} में से {a} गिलास पानी। ये आँकड़े डेमो सिंक से हैं, किसी मेडिकल डिवाइस से नहीं।", // REVIEW
  "wel.demoSync": "{name} · डेमो सिंक", // REVIEW
  "wel.askSteps": "मेरी घड़ी कहती है कि मैं आज {steps} कदम चला, लक्ष्य {target} था। क्या मेरे जैसे व्यक्ति के लिए यह काफ़ी है?", // REVIEW
  "wel.askKcal": "मैंने आज लगभग {kcal} सक्रिय kcal जलाईं, लक्ष्य {target} kcal था। इसका क्या मतलब समझूँ?", // REVIEW
  "wel.askMin": "मुझे आज {min} सक्रिय मिनट मिले, लक्ष्य {target} मिनट था। क्या इतनी गतिविधि काफ़ी है?", // REVIEW
  "wel.askWater": "मैंने आज {b} में से {a} गिलास पानी पिया है। क्या मुझे और पीना चाहिए?", // REVIEW

  // ---- profile ---------------------------------------------------------
  "prof.title": "प्रोफ़ाइल", // REVIEW
  "prof.family": "परिवार के सदस्य", // REVIEW
  "prof.familySub": "{n} जुड़े हुए", // REVIEW
  "prof.access": "प्राइवेसी और एक्सेस", // REVIEW
  "prof.accessSub": "{a} के पास एक्सेस · {b} घटनाएँ दर्ज", // REVIEW
  "prof.clinics": "जुड़े क्लिनिक और लैब", // REVIEW
  "prof.abha": "ABHA", // REVIEW — official scheme name, never translated
  "prof.abhaLinked": "जुड़ा हुआ · ABDM से सत्यापित", // REVIEW
  "prof.abhaNot": "जुड़ा नहीं है", // REVIEW
  "prof.language": "भाषा", // REVIEW
  "prof.help": "मदद और सहायता", // REVIEW
  "prof.ownership": "डेटा का मालिकाना", // REVIEW
  "prof.ownershipSub": "रिकॉर्ड आपका है। हम आपका डेटा कभी नहीं बेचते।", // REVIEW
  "prof.signOut": "साइन आउट करें", // REVIEW
  "prof.version": "VitaSync AI · v1.4 · देहरादून में बना", // REVIEW
  "prof.elder": "बुज़ुर्ग मोड", // REVIEW
  "prof.elderOn": "चालू · बड़े अक्षर, आसान होम", // REVIEW
  "prof.elderOff": "बंद", // REVIEW

  // ---- language screen -------------------------------------------------
  "langs.title": "भाषा", // REVIEW
  "langs.englishFull": "English", // REVIEW
  "langs.hindiFull": "हिन्दी (Hindi)", // REVIEW
  "langs.selectedEn": "English selected", // REVIEW
  "langs.selectedHi": "हिन्दी चुनी गई", // REVIEW
  "langs.note": "ऐप, सहायक और बोलकर बताने की सुविधा — सब इसी चुनाव पर चलते हैं। हिन्दी पंक्तियाँ मशीन से बनी हैं और अभी समीक्षा में हैं — देखिए docs/hindi-review.md।", // REVIEW
  "langs.elderTitle": "बुज़ुर्ग मोड", // REVIEW
  "langs.elderSub": "बड़े अक्षर, आसान होम स्क्रीन, और जवाब पढ़कर सुनाए जाते हैं", // REVIEW
  "langs.elderOnToast": "बुज़ुर्ग मोड चालू", // REVIEW
  "langs.elderOffToast": "बुज़ुर्ग मोड बंद", // REVIEW

  // ---- elder mode ------------------------------------------------------
  "elder.callFamily": "परिवार को कॉल करें", // REVIEW
  "elder.callFamilySub": "{name} · {relation}", // REVIEW
  "elder.noCaregiver": "प्रोफ़ाइल में देखभालकर्ता जोड़िए", // REVIEW
  "elder.more": "बाकी सब कुछ प्रोफ़ाइल में है", // REVIEW

  // ---- public share page /u/{token} ------------------------------------
  "u.kicker": "मरीज़ का स्वास्थ्य ID", // REVIEW
  "u.emergencyBanner": "आपातकाल · कोई कोड नहीं चाहिए", // REVIEW
  "u.bloodGroup": "ब्लड ग्रुप", // REVIEW — the group itself (B+) is never translated
  "u.allergies": "एलर्जी", // REVIEW
  "u.emergencyMeds": "आपातकालीन दवाएँ", // REVIEW — medicine names are never translated
  "u.ice": "ICE", // REVIEW — the standard emergency-contact abbreviation, kept as-is
  "u.doctorNote": "डॉक्टर: ऊपर दी आपातकालीन जानकारी के लिए कोई कोड नहीं चाहिए। पूरी फ़ाइल एक बार के कोड के बाद खुलती है।", // REVIEW
  "u.approved": "मरीज़ ने मंज़ूरी दी · सिर्फ़ इस सत्र के लिए · दर्ज किया गया", // REVIEW
  "u.fullRecord": "पूरा रिकॉर्ड", // REVIEW
  "u.gateHead": "पूरा रिकॉर्ड · रिपोर्ट, परामर्श, AI सारांश", // REVIEW
  "u.gateNeeds": "इसके लिए मरीज़ की मंज़ूरी चाहिए। 6 अंकों का कोड उनके फ़ोन पर, या उनके चुने हुए देखभालकर्ता के फ़ोन पर जाता है।", // REVIEW
  "u.request": "पूरा रिकॉर्ड माँगें", // REVIEW
  "u.sent": "कोड मरीज़ को भेज दिया गया। उनसे पूछिए।", // REVIEW
  "u.demo": "डेमो मोड (कोई SMS सेट नहीं): कोड है", // REVIEW
  "u.facility": "आपका नाम / संस्थान (रिकॉर्ड के लिए)", // REVIEW
  "u.code": "6 अंकों का कोड", // REVIEW
  "u.open": "रिकॉर्ड खोलें", // REVIEW
  "u.foot": "पूरा रिकॉर्ड सिर्फ़ उस एक बार के कोड से खुलता है जो मरीज़ या देखभालकर्ता के फ़ोन पर जाता है। हर बार खोलना दर्ज होता है और मरीज़ को दिखता है। लिंक 24 घंटे में ख़त्म हो जाता है।", // REVIEW
};

const DICT: Record<Lang, Record<Key, string>> = { en, hi };

export type Vars = Record<string, string | number>;

/** Fill `{name}` placeholders. An unknown placeholder is left visible on purpose. */
function fill(s: string, vars?: Vars) {
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s;
}

/** Pure lookup. Falls back to English so a key can never render blank. */
export function translate(lang: Lang, key: Key, vars?: Vars) {
  return fill(DICT[lang][key] ?? en[key], vars);
}

export const localeOf = (lang: Lang) => (lang === "hi" ? "hi-IN" : "en-IN");

/** Dates follow the UI language. Digits stay Latin in both locales. */
export function fmtDate(iso: string | number | Date, lang: Lang, opts: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleString(localeOf(lang), opts);
}
