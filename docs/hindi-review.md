# Hindi review sheet

Every Hindi string shipping in the app, next to its English source. **None of
these has been reviewed by a native speaker yet** — each one is marked
`// REVIEW` in `src/lib/i18n.ts`. Reviewing means: correct the Hindi column
here, then edit the matching line in `i18n.ts` and drop its `// REVIEW`.

Rules the translation must keep:

- **"112" and "108" are never translated or transliterated.** Same for medicine
  names, doses, blood groups, `ABHA`, `ABDM`, `ICE`, `SpO₂` and `SHA-256`.
- Digits stay Latin. `hi-IN` uses the `latn` numbering system by default, so a
  number a paramedic reads is identical in both languages.
- Address the patient as **आप**, never तू or तुम.
- Sentence case, no exclamation marks (CLAUDE.md conventions).
- `{braces}` are placeholders filled at runtime. Keep them exactly, spelling
  included; the words around them may be reordered freely.

340 strings. Regenerate with `node scripts/gen-hindi-review.mjs`.

| Key | English | हिन्दी (draft) |
| --- | --- | --- |
| `common.back` | Back | वापस |
| `common.dismiss` | Dismiss | हटाएँ |
| `common.view` | View | देखें |
| `common.book` | Book | बुक करें |
| `common.download` | Download | डाउनलोड करें |
| `common.share` | Share | साझा करें |
| `common.verifyNow` | Verify now | अभी जाँचें |
| `common.hashMatches` | Matches · untampered | मेल खाता है · कोई छेड़छाड़ नहीं |
| `common.hashMismatch` | Mismatch · altered | मेल नहीं खाता · बदला गया है |
| `common.generating` | Generating… | बन रहा है… |
| `common.offline` | Offline — showing last saved emergency info | ऑफ़लाइन — पिछली सहेजी गई आपातकालीन जानकारी दिख रही है |
| `common.loggedByYou` | Logged by you | आपने दर्ज किया |
| `nav.home` | Home | होम |
| `nav.check` | Check | जाँच |
| `nav.record` | Record | रिकॉर्ड |
| `nav.vitals` | Vitals | वाइटल |
| `nav.profile` | Profile | प्रोफ़ाइल |
| `nav.emergency` | Emergency | आपातकाल |
| `lang.pick` | Choose your language | अपनी भाषा चुनें |
| `lang.english` | English | English |
| `lang.hindi` | हिन्दी | हिन्दी |
| `lang.shortEn` | EN | EN |
| `lang.shortHi` | हिं | हिं |
| `lang.switchAria` | Language | भाषा |
| `onb.heroTitle` | Your whole health record, in one place | आपका पूरा स्वास्थ्य रिकॉर्ड, एक ही जगह |
| `onb.heroSub` | Symptoms, doctors, reports, refills and emergencies, on one timeline you own. | लक्षण, डॉक्टर, रिपोर्ट, दवाएँ और आपात स्थिति — सब एक टाइमलाइन पर, जो आपकी अपनी है। |
| `onb.b1` | You own your data | आपका डेटा आपका ही रहता है |
| `onb.b2` | No more lost files | अब कोई फ़ाइल नहीं खोएगी |
| `onb.b3` | Any doctor, full history | कोई भी डॉक्टर, पूरा इतिहास |
| `onb.continuePhone` | Continue with phone number | मोबाइल नंबर से आगे बढ़ें |
| `onb.haveAccount` | Already have an account? | पहले से खाता है? |
| `onb.signIn` | Sign in | साइन इन करें |
| `onb.phoneTitle` | Your mobile number | आपका मोबाइल नंबर |
| `onb.phoneSub` | We'll send a one-time code. No password. | हम एक बार का कोड भेजेंगे। कोई पासवर्ड नहीं। |
| `onb.mobileLabel` | Mobile number | मोबाइल नंबर |
| `onb.sendCode` | Send code | कोड भेजें |
| `onb.badPhone` | Enter a 10-digit mobile number. | 10 अंकों का मोबाइल नंबर डालिए। |
| `onb.otpTitle` | Enter the code | कोड डालिए |
| `onb.sentTo` | Sent to {phone}. | {phone} पर भेजा गया। |
| `onb.change` | Change | बदलें |
| `onb.demoCode` | Demo mode: the code is | डेमो मोड: कोड है |
| `onb.codeLabel` | 6-digit code | 6 अंकों का कोड |
| `onb.wrongCode` | Wrong code. Try again. | कोड ग़लत है। फिर कोशिश कीजिए। |
| `onb.continue` | Continue | आगे बढ़ें |
| `home.morning` | Good morning | सुप्रभात |
| `home.afternoon` | Good afternoon | नमस्कार |
| `home.evening` | Good evening | शुभ संध्या |
| `home.verified` | Record verified · owned by you | रिकॉर्ड प्रमाणित · आपका अपना |
| `home.notWell` | Not feeling well? | तबीयत ठीक नहीं लग रही? |
| `home.notWellSub` | Describe it in plain words. One question back, then a next step. | अपने शब्दों में बताइए। एक सवाल पूछेंगे, फिर अगला कदम बताएँगे। |
| `home.checkSymptom` | Check a symptom | लक्षण जाँचें |
| `home.wellness` | Wellness | वेलनेस |
| `home.wellnessOn` | {steps} steps · {a}/{b} glasses today | {steps} कदम · आज {a}/{b} गिलास |
| `home.wellnessOff` | Connect a watch or band, track steps and water | घड़ी या बैंड जोड़िए, कदम और पानी देखिए |
| `home.bookDoctor` | Book doctor | डॉक्टर बुक करें |
| `home.bookDoctorSub` | GPs near you, today | पास के डॉक्टर, आज ही |
| `home.myRecords` | My records | मेरे रिकॉर्ड |
| `home.myRecordsSub` | {n} entries, sealed | {n} प्रविष्टियाँ, सील की हुई |
| `home.refill` | Refill | दवा दोबारा लें |
| `home.refillDueNow` | 1 due now | 1 अभी बाकी |
| `home.refillDueIn` | 1 due in {n} days | 1 दवा {n} दिन में |
| `home.vitalsSub` | BP {v}, normal | BP {v}, सामान्य |
| `home.myId` | My VitaSync ID | मेरा VitaSync ID |
| `home.myIdSub` | Share with a doctor | डॉक्टर को दिखाइए |
| `home.emergencySub` | Nearest 24×7 help | नज़दीकी 24×7 मदद |
| `home.sealNote` | Every entry is sealed with SHA-256. Nobody can change it. | हर प्रविष्टि SHA-256 से सील है। कोई इसे बदल नहीं सकता। |
| `home.profileAria` | Profile | प्रोफ़ाइल |
| `sym.title` | Symptom Checker | लक्षण जाँच |
| `sym.private` | Private · saved only to your record | निजी · सिर्फ़ आपके रिकॉर्ड में सहेजा जाता है |
| `sym.opener` | Tell me what's going on, in your own words. | अपने शब्दों में बताइए कि क्या तकलीफ़ है। |
| `sym.placeholder` | Describe how you feel | बताइए आप कैसा महसूस कर रहे हैं |
| `sym.send` | Send | भेजें |
| `sym.nextStep` | Recommended next step | सुझाया गया अगला कदम |
| `sym.openEmergency` | Open emergency | आपातकाल खोलें |
| `sym.bookGp` | Book a GP | डॉक्टर बुक करें |
| `sym.remindLater` | Remind me later | बाद में याद दिलाएँ |
| `sym.reminderSet` | We'll remind you on your home screen | हम आपके होम स्क्रीन पर याद दिला देंगे |
| `sym.reminderText` | Reminder: {title} — {context} | याद दिलाना: {title} — {context} |
| `sym.reminderFallback` | book a GP | डॉक्टर बुक करना |
| `sym.disclaimer` | AI can be wrong. For emergencies call 112, or 108 for an ambulance. | AI ग़लत हो सकता है। आपात स्थिति में 112 पर कॉल कीजिए, या एम्बुलेंस के लिए 108 पर। |
| `sym.limit` | Daily limit reached. Plus gets unlimited. | आज की सीमा पूरी हो गई। Plus में कोई सीमा नहीं। |
| `sym.seePlans` | See plans | प्लान देखें |
| `sym.offlineErr` | Couldn't reach the assistant. Check your connection and try again. | सहायक तक नहीं पहुँच सके। कनेक्शन जाँचकर फिर कोशिश कीजिए। |
| `sym.chip1` | Dull headache since morning | सुबह से हल्का सिर दर्द |
| `sym.chip2` | Fever for 2 days | दो दिन से बुख़ार |
| `sym.chip3` | Can't sleep properly | ठीक से नींद नहीं आ रही |
| `sym.mic` | Speak | बोलकर बताएँ |
| `sym.micStop` | Stop listening | सुनना बंद करें |
| `sym.listening` | Listening… speak normally | सुन रहे हैं… सामान्य रूप से बोलिए |
| `sym.micDenied` | Microphone blocked. Allow it in your browser settings, or type instead. | माइक्रोफ़ोन बंद है। ब्राउज़र सेटिंग में इसकी अनुमति दीजिए, या लिखकर बताइए। |
| `sym.speakOn` | Read replies aloud | जवाब पढ़कर सुनाएँ |
| `sym.speakOff` | Stop reading aloud | पढ़कर सुनाना बंद करें |
| `sym.urgencyEmergency` | Emergency | आपातकाल |
| `sym.urgencyGp` | See a GP today | आज ही डॉक्टर को दिखाइए |
| `sym.urgencyLow` | Low urgency | कम गंभीर |
| `sym.sessionTitle` | Symptom check — {symptom} | लक्षण जाँच — {symptom} |
| `sym.noCause` | Not established from this conversation | इस बातचीत से कारण तय नहीं हुआ |
| `sym.noStep` | No action needed right now | अभी कुछ करने की ज़रूरत नहीं |
| `emg.title` | Emergency | आपातकाल |
| `emg.sub` | {n} hospitals with 24×7 emergency near you | आपके पास 24×7 इमरजेंसी वाले {n} अस्पताल |
| `emg.live` | Live location | लाइव लोकेशन |
| `emg.dehradun` | Dehradun | देहरादून |
| `emg.call112` | Call 112 | 112 पर कॉल करें |
| `emg.amb108` | Ambulance · 108 | एम्बुलेंस · 108 |
| `emg.note` | 112 is the unified emergency number. 108 is the ambulance line. Your emergency strip is shared with the hospital on arrival, one tap. | 112 एक ही आपातकालीन नंबर है। 108 एम्बुलेंस के लिए है। अस्पताल पहुँचते ही आपकी आपातकालीन जानकारी एक टैप में साझा हो जाती है। |
| `emg.showId` | Show my emergency ID | मेरा आपातकालीन ID दिखाएँ |
| `emg.shareHospital` | Share my record with the hospital | अस्पताल के साथ मेरा रिकॉर्ड साझा करें |
| `emg.sourceLive` | Your curated list plus hospitals within 10 km from OpenStreetMap. Tap a pin to jump to its row. | आपकी चुनी हुई सूची और OpenStreetMap से 10 किमी के भीतर के अस्पताल। पंक्ति पर जाने के लिए पिन दबाइए। |
| `emg.sourcePrecise` | Curated list only — the hospital search did not answer in time. Tap a pin to jump to its row. | सिर्फ़ चुनी हुई सूची — अस्पताल खोज समय पर जवाब नहीं दे पाई। पंक्ति पर जाने के लिए पिन दबाइए। |
| `emg.sourceCurated` | Curated Dehradun list. Turn on location for hospitals near you. | देहरादून की चुनी हुई सूची। पास के अस्पतालों के लिए लोकेशन चालू कीजिए। |
| `emg.nearest` | Nearest | सबसे पास |
| `emg.row` | {km} km · 24×7 emergency | {km} किमी · 24×7 इमरजेंसी |
| `emg.verifiedNumber` | Verified number | नंबर जाँचा हुआ |
| `emg.listed` | Listed | सूचीबद्ध |
| `emg.noNumber` | No number listed · use 108 | कोई नंबर दर्ज नहीं · 108 इस्तेमाल कीजिए |
| `emg.call` | Call | कॉल |
| `emg.callAria` | Call {name} | {name} को कॉल करें |
| `emg.directions` | Directions | रास्ता |
| `emg.directionsAria` | Directions to {name} | {name} तक का रास्ता |
| `id.title` | My VitaSync ID | मेरा VitaSync ID |
| `id.qrAlt` | QR code for {url} | {url} का QR कोड |
| `id.shareQr` | Share QR | QR साझा करें |
| `id.shareLink` | Share link | लिंक साझा करें |
| `id.downloadQr` | Download QR image | QR इमेज डाउनलोड करें |
| `id.linkCopied` | Link copied | लिंक कॉपी हो गया |
| `id.stripLine` | Name, blood group, allergies, ICE | नाम, ब्लड ग्रुप, एलर्जी, ICE |
| `id.always` | Always | हमेशा |
| `id.fullRecord` | Full health record | पूरा स्वास्थ्य रिकॉर्ड |
| `id.afterApprove` | After you approve | आपकी मंज़ूरी के बाद |
| `id.note` | Approval is a one-time code to your phone or your caregiver's. Links expire after 24 hours and you can revoke them from Privacy & access. | मंज़ूरी के लिए आपके या आपके देखभालकर्ता के फ़ोन पर एक बार का कोड आता है। लिंक 24 घंटे में ख़त्म हो जाते हैं और आप उन्हें प्राइवेसी और एक्सेस से रद्द कर सकते हैं। |
| `id.preview` | Preview what a doctor sees | देखिए डॉक्टर को क्या दिखता है |
| `rec.title` | Health record | स्वास्थ्य रिकॉर्ड |
| `rec.sub` | {n} entries · sealed | {n} प्रविष्टियाँ · सील की हुई |
| `rec.reportsSummary` | Reports summary | रिपोर्ट सारांश |
| `rec.all` | All | सभी |
| `rec.consults` | Consults | परामर्श |
| `rec.reports` | Reports | रिपोर्ट |
| `rec.rx` | Rx | दवाएँ |
| `rec.sealed` | Sealed · owned by you | सील · आपका अपना |
| `rec.sealing` | Sealing… | सील हो रहा है… |
| `rec.actionViewShare` | View / Share | देखें / साझा करें |
| `rec.actionRefill` | Refill | दोबारा लें |
| `rec.actionReport` | View report | रिपोर्ट देखें |
| `rec.actionOpen` | Open | खोलें |
| `rec.empty` | Nothing here yet. Entries appear as you book, log vitals and upload reports. | अभी यहाँ कुछ नहीं है। जैसे-जैसे आप बुक करेंगे, वाइटल दर्ज करेंगे और रिपोर्ट अपलोड करेंगे, प्रविष्टियाँ यहाँ दिखेंगी। |
| `rec.shareWithDoctor` | Share record with a doctor | डॉक्टर के साथ रिकॉर्ड साझा करें |
| `rec.sha` | SHA-256 | SHA-256 |
| `rec.shaEncrypted` | SHA-256 of the encrypted file | एन्क्रिप्टेड फ़ाइल का SHA-256 |
| `rec.pending` | pending | बाकी है |
| `rec.anchorNext` | anchoring on Polygon testnet next | Polygon टेस्टनेट पर एंकरिंग अगले चरण में |
| `rec.refillNow` | Refill now | अभी दोबारा लें |
| `rec.downloadedTxt` | Downloaded. PDF export arrives with real uploads. | डाउनलोड हो गया। असली अपलोड के साथ PDF एक्सपोर्ट आएगा। |
| `rec.decrypted` | Decrypted on this device and saved | इसी डिवाइस पर डिक्रिप्ट करके सहेजा गया |
| `upl.card` | Upload report | रिपोर्ट अपलोड करें |
| `upl.cardSub` | PDF or photo, encrypted on this device | PDF या फ़ोटो, इसी डिवाइस पर एन्क्रिप्ट |
| `upl.chooseFile` | Choose a file | फ़ाइल चुनिए |
| `upl.fileHint` | PDF or photo, up to 10 MB | PDF या फ़ोटो, 10 MB तक |
| `upl.titleLabel` | Title | शीर्षक |
| `upl.titlePlaceholder` | e.g. Lipid panel | जैसे Lipid panel |
| `upl.providerLabel` | Lab or clinic | लैब या क्लिनिक |
| `upl.providerPlaceholder` | e.g. Dr Lal PathLabs | जैसे Dr Lal PathLabs |
| `upl.dateLabel` | Date on the report | रिपोर्ट पर लिखी तारीख़ |
| `upl.privacy` | Encrypted here with a key that never leaves this device. Your record keeps the hash of the encrypted file, nothing else. | यहीं ऐसी चाबी से एन्क्रिप्ट किया जाता है जो इस डिवाइस से कभी बाहर नहीं जाती। आपके रिकॉर्ड में सिर्फ़ एन्क्रिप्टेड फ़ाइल का हैश रहता है, और कुछ नहीं। |
| `upl.save` | Encrypt and save | एन्क्रिप्ट करके सहेजें |
| `upl.saving` | Encrypting… | एन्क्रिप्ट हो रहा है… |
| `upl.onlyPdf` | PDF or image only. | सिर्फ़ PDF या इमेज। |
| `upl.tooBig` | That file is {size}. The limit is 10 MB. | यह फ़ाइल {size} की है। सीमा 10 MB है। |
| `upl.failed` | Could not encrypt that file. Try again. | यह फ़ाइल एन्क्रिप्ट नहीं हो सकी। फिर कोशिश कीजिए। |
| `upl.done` | Encrypted on your device and added to your record | आपके डिवाइस पर एन्क्रिप्ट होकर रिकॉर्ड में जुड़ गई |
| `upl.uploadedBy` | Uploaded by you | आपने अपलोड किया |
| `upl.summary` | {name} · {size}. Encrypted on this device, so only you can open it. | {name} · {size}। इसी डिवाइस पर एन्क्रिप्ट, इसलिए इसे सिर्फ़ आप खोल सकते हैं। |
| `att.decrypting` | Decrypting on this device… | इसी डिवाइस पर डिक्रिप्ट हो रहा है… |
| `att.otherDevice` | This file was encrypted on another device, so it cannot be opened here. The hash below still proves what was sealed. | यह फ़ाइल किसी दूसरे डिवाइस पर एन्क्रिप्ट हुई थी, इसलिए यहाँ नहीं खुलेगी। नीचे दिया हैश फिर भी साबित करता है कि क्या सील हुआ था। |
| `att.whatsStored` | What's stored | क्या सहेजा गया है |
| `att.hide` | Hide | छिपाएँ |
| `att.firstBytes` | First {n} bytes of {total} of ciphertext | {total} सिफ़रटेक्स्ट में से पहले {n} बाइट |
| `att.allThatLeaves` | This is all that would ever leave your phone — plus the hash. | आपके फ़ोन से बस इतना ही बाहर जाता — और हैश। |
| `att.nothingStored` | Nothing stored on this device. | इस डिवाइस पर कुछ भी सहेजा नहीं गया है। |
| `ref.title` | Refills | दवा दोबारा |
| `ref.dueNow` | Due now | अभी बाकी |
| `ref.dueInDays` | Due in {n} days | {n} दिन में बाकी |
| `ref.dueInDay` | Due in 1 day | 1 दिन में बाकी |
| `ref.daysUsed` | {used} of {total} days used | {total} में से {used} दिन इस्तेमाल हुए |
| `ref.reorder` | Reorder | दोबारा मँगाएँ |
| `ref.active` | Active prescriptions | चालू पर्चियाँ |
| `ref.daysLeft` | {dosage} · {n} days left | {dosage} · {n} दिन बाकी |
| `ref.lastOrder` | Last order | पिछला ऑर्डर |
| `ref.lastOrders` | Last orders | पिछले ऑर्डर |
| `ref.receipt` | Receipt | रसीद |
| `ref.needRx` | Refills need a valid prescription on your record. | दोबारा दवा के लिए आपके रिकॉर्ड में वैध पर्ची होनी चाहिए। |
| `ref.pharmacy` | Pharmacy | फ़ार्मेसी |
| `ref.deliverTo` | Deliver to | यहाँ पहुँचाएँ |
| `ref.estTotal` | Estimated total | अनुमानित कुल |
| `ref.place` | Place order | ऑर्डर करें |
| `ref.simNote` | Pharmacy fulfilment is simulated until a partner is signed. | पार्टनर तय होने तक फ़ार्मेसी डिलीवरी सिम्युलेटेड है। |
| `ref.placed` | Order placed. Receipt is in Last order. | ऑर्डर हो गया। रसीद पिछला ऑर्डर में है। |
| `ref.rxLine` | {dosage} · {days} days · Rx by {prescriber} | {dosage} · {days} दिन · पर्ची {prescriber} की |
| `ref.item` | Item | दवा |
| `ref.date` | Date | तारीख़ |
| `ref.status` | Status | स्थिति |
| `ref.total` | Total | कुल |
| `ref.statusPlaced` | placed | ऑर्डर हुआ |
| `ref.statusDelivered` | delivered | पहुँच गया |
| `ref.orderTitle` | Refill ordered: {medicine} | दोबारा ऑर्डर: {medicine} |
| `ref.orderSummary` | {qty} units · ₹{amount} · against {prescriber}'s prescription. Delivery to {address}. | {qty} इकाई · ₹{amount} · {prescriber} की पर्ची पर। डिलीवरी {address} पर। |
| `vit.title` | Vitals | वाइटल |
| `vit.log` | Log | दर्ज करें |
| `vit.normalRange` | Normal range | सामान्य सीमा |
| `vit.watch` | Watch | ध्यान दें |
| `vit.lastN` | Last {n} readings (systolic) | पिछली {n} रीडिंग (सिस्टोलिक) |
| `vit.note` | Vitals feed into your health record, so your doctor sees the trend, not just one reading. | वाइटल आपके स्वास्थ्य रिकॉर्ड में जुड़ते हैं, ताकि डॉक्टर एक रीडिंग नहीं, पूरा रुझान देख सके। |
| `vit.sheetTitle` | Log a reading | रीडिंग दर्ज करें |
| `vit.metric` | Metric | माप |
| `vit.valueLabel` | Value ({unit}) | मान ({unit}) |
| `vit.save` | Save reading | रीडिंग सहेजें |
| `vit.logged` | Logged and added to your record | दर्ज होकर आपके रिकॉर्ड में जुड़ गया |
| `vit.loggedJustNow` | logged just now | अभी दर्ज किया |
| `vit.vsLast` | {d} vs last | पिछली बार से {d} |
| `vit.outOfRange` | Outside the usual range. Worth mentioning at your next consult. | सामान्य सीमा से बाहर। अगली बार डॉक्टर को ज़रूर बताइए। |
| `vit.inRange` | Within normal range. | सामान्य सीमा के भीतर। |
| `vit.bp` | Blood pressure | रक्तचाप |
| `vit.glucose` | Blood sugar | ब्लड शुगर |
| `vit.weight` | Weight | वज़न |
| `vit.hr` | Resting heart rate | आराम की हृदय गति |
| `vit.spo2` | SpO₂ | SpO₂ |
| `wel.title` | Wellness | वेलनेस |
| `wel.noDevice` | No device connected | कोई डिवाइस नहीं जुड़ा |
| `wel.targets` | Targets | लक्ष्य |
| `wel.targetsAria` | Edit targets | लक्ष्य बदलें |
| `wel.demoNote` | Demo sync · real watch sync ships with the mobile app | डेमो सिंक · असली घड़ी सिंक मोबाइल ऐप के साथ आएगा |
| `wel.connect` | Connect a device | डिवाइस जोड़ें |
| `wel.tapConnect` | Tap to connect | जोड़ने के लिए दबाएँ |
| `wel.searching` | Searching… | खोज रहे हैं… |
| `wel.connected` | Connected | जुड़ गया |
| `wel.disconnect` | Disconnect {name} | {name} हटाएँ |
| `wel.today` | Today, live | आज, लाइव |
| `wel.steps` | Steps | कदम |
| `wel.kcal` | Active kcal | सक्रिय kcal |
| `wel.activeMin` | Active minutes | सक्रिय मिनट |
| `wel.of` | of {n} | {n} में से |
| `wel.askAi` | Ask the AI about this | इस बारे में AI से पूछें |
| `wel.updating` | Updating every half minute or so while this screen is open. {note}. | यह स्क्रीन खुली रहने तक हर आधे मिनट में अपडेट होता है। {note}। |
| `wel.connectPrompt` | Connect a device to see steps, kcal and active minutes move. | कदम, kcal और सक्रिय मिनट चलते देखने के लिए डिवाइस जोड़िए। |
| `wel.water` | Water | पानी |
| `wel.glasses` | {a} of {b} glasses | {b} में से {a} गिलास |
| `wel.addGlass` | + Add glass | + एक गिलास |
| `wel.footNote` | These figures come from demo sync, not a medical device, and a summary is added to your record once a day. Real Apple Health and Health Connect reads need the native app. | ये आँकड़े डेमो सिंक से आते हैं, किसी मेडिकल डिवाइस से नहीं, और दिन में एक बार इनका सारांश आपके रिकॉर्ड में जुड़ जाता है। असली Apple Health और Health Connect के लिए नेटिव ऐप चाहिए। |
| `wel.targetsSheet` | Daily targets | रोज़ के लक्ष्य |
| `wel.tSteps` | Steps | कदम |
| `wel.tKcal` | Active kcal burned | जली हुई सक्रिय kcal |
| `wel.tMin` | Active minutes | सक्रिय मिनट |
| `wel.tWater` | Glasses of water | पानी के गिलास |
| `wel.saveTargets` | Save targets | लक्ष्य सहेजें |
| `wel.saved` | Targets updated | लक्ष्य बदल गए |
| `wel.connectedToast` | {name} connected · demo sync | {name} जुड़ गया · डेमो सिंक |
| `wel.disconnected` | Device disconnected | डिवाइस हट गया |
| `wel.summaryTitle` | Activity summary — {steps} steps, {a}/{b} glasses | गतिविधि सारांश — {steps} कदम, {a}/{b} गिलास |
| `wel.summaryBody` | {steps} steps, {kcal} active kcal, {min} active minutes, {a} of {b} glasses of water. Figures are from demo sync, not a medical device. | {steps} कदम, {kcal} सक्रिय kcal, {min} सक्रिय मिनट, {b} में से {a} गिलास पानी। ये आँकड़े डेमो सिंक से हैं, किसी मेडिकल डिवाइस से नहीं। |
| `wel.demoSync` | {name} · demo sync | {name} · डेमो सिंक |
| `wel.askSteps` | My watch says I walked {steps} steps today, against a target of {target}. Is that enough for someone like me? | मेरी घड़ी कहती है कि मैं आज {steps} कदम चला, लक्ष्य {target} था। क्या मेरे जैसे व्यक्ति के लिए यह काफ़ी है? |
| `wel.askKcal` | I burned about {kcal} active kcal today against a {target} kcal target. What should I make of that? | मैंने आज लगभग {kcal} सक्रिय kcal जलाईं, लक्ष्य {target} kcal था। इसका क्या मतलब समझूँ? |
| `wel.askMin` | I got {min} active minutes today against a {target} minute target. Is that enough movement? | मुझे आज {min} सक्रिय मिनट मिले, लक्ष्य {target} मिनट था। क्या इतनी गतिविधि काफ़ी है? |
| `wel.askWater` | I have had {a} of {b} glasses of water today. Should I be drinking more? | मैंने आज {b} में से {a} गिलास पानी पिया है। क्या मुझे और पीना चाहिए? |
| `prof.title` | Profile | प्रोफ़ाइल |
| `prof.family` | Family members | परिवार के सदस्य |
| `prof.familySub` | {n} linked | {n} जुड़े हुए |
| `prof.access` | Privacy & access | प्राइवेसी और एक्सेस |
| `prof.accessSub` | {a} with access · {b} events logged | {a} के पास एक्सेस · {b} घटनाएँ दर्ज |
| `prof.clinics` | Connected clinics & labs | जुड़े क्लिनिक और लैब |
| `prof.abha` | ABHA | ABHA |
| `prof.abhaLinked` | Linked · verified with ABDM | जुड़ा हुआ · ABDM से सत्यापित |
| `prof.abhaNot` | Not linked | जुड़ा नहीं है |
| `prof.language` | Language | भाषा |
| `prof.help` | Help & support | मदद और सहायता |
| `prof.ownership` | Data ownership | डेटा का मालिकाना |
| `prof.ownershipSub` | You own the record. We never sell your data. | रिकॉर्ड आपका है। हम आपका डेटा कभी नहीं बेचते। |
| `prof.signOut` | Sign out | साइन आउट करें |
| `prof.version` | VitaSync AI · v1.4 · Built in Dehradun | VitaSync AI · v1.4 · देहरादून में बना |
| `prof.elder` | Elder Mode | बुज़ुर्ग मोड |
| `prof.elderOn` | On · large type, simpler home | चालू · बड़े अक्षर, आसान होम |
| `prof.elderOff` | Off | बंद |
| `langs.title` | Language | भाषा |
| `langs.englishFull` | English | English |
| `langs.hindiFull` | हिन्दी (Hindi) | हिन्दी (Hindi) |
| `langs.selectedEn` | English selected | English selected |
| `langs.selectedHi` | हिन्दी चुनी गई | हिन्दी चुनी गई |
| `langs.note` | The app, the assistant and voice input all follow this choice. Hindi strings are machine-drafted and still under review — see docs/hindi-review.md. | ऐप, सहायक और बोलकर बताने की सुविधा — सब इसी चुनाव पर चलते हैं। हिन्दी पंक्तियाँ मशीन से बनी हैं और अभी समीक्षा में हैं — देखिए docs/hindi-review.md। |
| `langs.elderTitle` | Elder Mode | बुज़ुर्ग मोड |
| `langs.elderSub` | Bigger text, a simpler home screen, and replies read aloud | बड़े अक्षर, आसान होम स्क्रीन, और जवाब पढ़कर सुनाए जाते हैं |
| `langs.elderOnToast` | Elder Mode on | बुज़ुर्ग मोड चालू |
| `langs.elderOffToast` | Elder Mode off | बुज़ुर्ग मोड बंद |
| `elder.callFamily` | Call family | परिवार को कॉल करें |
| `elder.callFamilySub` | {name} · {relation} | {name} · {relation} |
| `elder.noCaregiver` | Add a caregiver in Profile | प्रोफ़ाइल में देखभालकर्ता जोड़िए |
| `elder.more` | Everything else is in Profile | बाकी सब कुछ प्रोफ़ाइल में है |
| `u.kicker` | Patient health ID | मरीज़ का स्वास्थ्य ID |
| `u.emergencyBanner` | EMERGENCY · no code needed | आपातकाल · कोई कोड नहीं चाहिए |
| `u.bloodGroup` | Blood group | ब्लड ग्रुप |
| `u.allergies` | Allergies | एलर्जी |
| `u.emergencyMeds` | Emergency meds | आपातकालीन दवाएँ |
| `u.ice` | ICE | ICE |
| `u.doctorNote` | Doctor: the emergency info above needs no code. The full file opens after a one-time code. | डॉक्टर: ऊपर दी आपातकालीन जानकारी के लिए कोई कोड नहीं चाहिए। पूरी फ़ाइल एक बार के कोड के बाद खुलती है। |
| `u.approved` | Approved by the patient · this session only · logged | मरीज़ ने मंज़ूरी दी · सिर्फ़ इस सत्र के लिए · दर्ज किया गया |
| `u.fullRecord` | Full record | पूरा रिकॉर्ड |
| `u.gateHead` | Full record · reports, consults, AI summaries | पूरा रिकॉर्ड · रिपोर्ट, परामर्श, AI सारांश |
| `u.gateNeeds` | Needs the patient's approval. A 6-digit code goes to their phone, or their nominated caregiver's. | इसके लिए मरीज़ की मंज़ूरी चाहिए। 6 अंकों का कोड उनके फ़ोन पर, या उनके चुने हुए देखभालकर्ता के फ़ोन पर जाता है। |
| `u.request` | Request full record | पूरा रिकॉर्ड माँगें |
| `u.sent` | Code sent to the patient. Ask them for it. | कोड मरीज़ को भेज दिया गया। उनसे पूछिए। |
| `u.demo` | Demo mode (no SMS configured): code is | डेमो मोड (कोई SMS सेट नहीं): कोड है |
| `u.facility` | Your name / facility (for the log) | आपका नाम / संस्थान (रिकॉर्ड के लिए) |
| `u.code` | 6-digit code | 6 अंकों का कोड |
| `u.open` | Open record | रिकॉर्ड खोलें |
| `u.foot` | Full record opens only with a one-time code sent to the patient's or caregiver's phone. Every access is logged and visible to the patient. Link expires in 24 hours. | पूरा रिकॉर्ड सिर्फ़ उस एक बार के कोड से खुलता है जो मरीज़ या देखभालकर्ता के फ़ोन पर जाता है। हर बार खोलना दर्ज होता है और मरीज़ को दिखता है। लिंक 24 घंटे में ख़त्म हो जाता है। |
| `camp.title` | Health camp | स्वास्थ्य शिविर |
| `camp.badge` | Health-camp mode · pilot demo | स्वास्थ्य शिविर मोड · परीक्षण डेमो |
| `camp.intro` | Register a patient. They get an emergency ID they can carry. | मरीज़ को दर्ज कीजिए। उन्हें एक आपातकालीन ID मिलेगी जो वे साथ रख सकते हैं। |
| `camp.registeredToday` | {n} registered today | आज {n} दर्ज हुए |
| `camp.name` | Full name | पूरा नाम |
| `camp.mobile` | Mobile number | मोबाइल नंबर |
| `camp.age` | Age | उम्र |
| `camp.sex` | Sex | लिंग |
| `camp.sexF` | Female | महिला |
| `camp.sexM` | Male | पुरुष |
| `camp.sexO` | Other | अन्य |
| `camp.bloodGroup` | Blood group | ब्लड ग्रुप |
| `camp.bloodUnknown` | Not known | पता नहीं |
| `camp.allergies` | Allergies | एलर्जी |
| `camp.allergyOther` | Anything else? (optional) | कुछ और? (ज़रूरी नहीं) |
| `camp.area` | Village or area | गाँव या इलाका |
| `camp.submit` | Register | दर्ज कीजिए |
| `camp.badName` | Enter the patient's name. | मरीज़ का नाम लिखिए। |
| `camp.badPhone` | Enter a 10-digit mobile number. | 10 अंकों का मोबाइल नंबर डालिए। |
| `camp.done` | Registered | दर्ज हो गया |
| `camp.slipId` | VitaSync ID | VitaSync ID |
| `camp.scanNote` | Scan this for the emergency strip. No code needed. | आपातकालीन जानकारी के लिए इसे स्कैन कीजिए। कोई कोड नहीं चाहिए। |
| `camp.print` | Print slip | पर्ची छापिए |
| `camp.another` | Register the next person | अगले व्यक्ति को दर्ज कीजिए |
| `camp.slipLine` | VitaSync · Emergency ID · no OTP needed for this strip | VitaSync · आपातकालीन ID · इस पर्ची के लिए कोई OTP नहीं चाहिए |
| `camp.noAllergies` | None recorded | कोई दर्ज नहीं |
| `camp.notOnDevice` | This ID was registered at a camp on another device, so it cannot be opened here. Open it on that device, or ask the patient to sign in to the app. | यह ID किसी दूसरे डिवाइस पर शिविर में दर्ज हुई थी, इसलिए यहाँ नहीं खुलेगी। उसी डिवाइस पर खोलिए, या मरीज़ से ऐप में साइन इन करने के लिए कहिए। |
