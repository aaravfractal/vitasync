"""Click every button in the app and assert something happened. Run with the dev/prod server on :3111.

Set RATE_LIMIT_BYPASS_TOKEN to the same value the server has and the browser's
chat calls skip the /api/chat daily cap, so the suite can run repeatedly against
one server. The cap itself is still tested below, without the header.
"""
import os, re
from playwright.sync_api import sync_playwright
B="http://127.0.0.1:3111"
PDF=b"%PDF-1.4 minimal bytes, enough to prove the encryption path"
BYPASS=os.environ.get("RATE_LIMIT_BYPASS_TOKEN","")
# A SpeechRecognition that never touches a speech service: `start` publishes the
# language it was given and a `__fire` hook to push transcripts through onresult.
STUB="""
class R {
  constructor(){ this.lang=''; this.continuous=false; this.interimResults=false;
                 this.onresult=null; this.onerror=null; this.onend=null; }
  start(){ window.__recLang=this.lang; const self=this;
           window.__fire=(t,f)=>{ self.onresult && self.onresult(
             {resultIndex:0, results:{length:1, 0:{isFinal:f, length:1, 0:{transcript:t}}}}); }; }
  stop(){ this.onend && this.onend(); }
  abort(){}
}
window.webkitSpeechRecognition = R; delete window.SpeechRecognition;
"""
NOSPEECH="""
delete window.SpeechRecognition; delete window.webkitSpeechRecognition;
try { Object.defineProperty(window,'speechSynthesis',{get(){return undefined}}); } catch(e) {}
delete window.speechSynthesis;
"""
fails=[]
def check(name, cond):
    print(("PASS " if cond else "FAIL ")+name); 
    if not cond: fails.append(name)
with sync_playwright() as p:
    b=p.chromium.launch()
    # An explicit context, so the voice tests below can open extra pages that
    # share this one's localStorage (and so its signed-in store).
    ctx=b.new_context(viewport={"width":390,"height":844})
    if BYPASS: ctx.set_extra_http_headers({"x-vs-bypass": BYPASS})
    pg=ctx.new_page()
    # onboarding → language → otp → app
    pg.goto(B+"/onboarding")
    check("language is the first screen", pg.get_by_role("button",name="हिन्दी",exact=True).count()==1 and pg.get_by_role("button",name="Continue with phone number").count()==0)
    pg.get_by_role("button",name="English",exact=True).click(); pg.wait_for_timeout(200)
    check("language switch in onboarding header", pg.get_by_role("group",name="Language").count()==1)
    pg.get_by_role("button",name="Continue with phone number").click()
    pg.get_by_label("Mobile number").fill("9876543210"); pg.get_by_role("button",name="Send code").click()
    pg.get_by_label("6-digit code").fill("482913"); pg.get_by_role("button",name="Continue").click(); pg.wait_for_url("**/app")
    check("onboarding signs in", pg.url.endswith("/app"))
    # symptom → remind later → home reminder
    pg.goto(B+"/app/symptom"); pg.get_by_role("button",name="Dull headache since morning").click(); pg.wait_for_timeout(800)
    pg.get_by_label("Describe how you feel").fill("all over, since I woke up"); pg.get_by_label("Send").click(); pg.wait_for_timeout(1200)
    check("recommendation card", pg.get_by_text("Recommended next step").count()==1)
    pg.get_by_role("button",name="Remind me later").click(); pg.wait_for_timeout(300)
    pg.goto(B+"/app"); pg.wait_for_timeout(400); check("reminder on home", pg.get_by_text("Reminder:").count()==1)
    pg.get_by_label("Dismiss").click(); pg.wait_for_timeout(200); check("dismiss reminder", pg.get_by_text("Reminder:").count()==0)
    # record has ai_session
    pg.goto(B+"/app/record"); pg.wait_for_timeout(600); check("ai session in record", pg.get_by_text("Symptom check — all over").count()>=1 or pg.get_by_text("Symptom check —").count()>=2)
    # book
    pg.goto(B+"/app/book"); pg.get_by_role("button",name="10:30").click(); pg.get_by_role("button",name="Book").first.click(); pg.wait_for_timeout(500)
    check("booking confirmed", pg.get_by_text("Booked").count()>=1)
    pg.get_by_role("link",name="View in record").click(); pg.wait_for_timeout(600); check("consult in record", pg.get_by_text("Booked: General physician consult").count()>=1)
    # record detail + verify + download
    pg.get_by_text("HbA1c and lipid panel").first.click(); pg.wait_for_timeout(300); pg.get_by_role("button",name="Verify now").click(); pg.wait_for_timeout(300)
    check("hash verifies", pg.get_by_text("Matches · untampered").count()==1)
    with pg.expect_download(): pg.get_by_role("button",name="Download").click()
    check("record download", True); pg.keyboard.press("Escape")
    # upload a report: encrypted on the device, only ciphertext stored, decrypted to view
    pg.goto(B+"/app/record"); pg.wait_for_timeout(500)
    pg.get_by_role("button",name="Upload report").click()
    pg.set_input_files("input[type=file]", {"name":"lipid-panel.pdf","mimeType":"application/pdf","buffer":PDF})
    pg.get_by_label("Title").fill("Lipid panel Aug"); pg.get_by_label("Lab or clinic").fill("Dr Lal PathLabs")
    pg.get_by_role("button",name="Encrypt and save").click(); pg.wait_for_timeout(900)
    check("upload lands in record", pg.get_by_text("Lipid panel Aug").count()>=1)
    raw=pg.evaluate("localStorage.getItem('vitasync.v1')")
    check("no plaintext in the store", "%PDF" not in raw and "JVBERi" not in raw)
    head=pg.evaluate("""() => new Promise((res) => { const r = indexedDB.open('vitasync-vault');
      r.onsuccess = () => { const g = r.result.transaction('blobs').objectStore('blobs').getAll();
        g.onsuccess = () => { const rows = g.result;
          res(rows.length ? String.fromCharCode(...new Uint8Array(rows[0].ciphertext.slice(0, 8))) : ""); }; }; })""")
    check("stored bytes are ciphertext", head != "" and not head.startswith("%PDF"))
    ext=pg.evaluate("""() => new Promise((res) => { const r = indexedDB.open('vitasync-vault');
      r.onsuccess = () => { const g = r.result.transaction('keys').objectStore('keys').get('primary');
        g.onsuccess = () => res(g.result ? g.result.extractable : null); }; })""")
    check("key is non-extractable", ext is False)
    pg.get_by_text("Lipid panel Aug").first.click(); pg.wait_for_timeout(900)
    check("decrypts into a viewer", pg.locator("iframe[title='lipid-panel.pdf']").count()==1)
    pg.get_by_role("button",name="Verify now").click(); pg.wait_for_timeout(400)
    check("ciphertext hash verifies", pg.get_by_text("Matches · untampered").count()==1)
    pg.get_by_role("button",name="What's stored").click(); pg.wait_for_timeout(400)
    check("what's stored panel", pg.get_by_text("This is all that would ever leave your phone").count()==1)
    with pg.expect_download(): pg.get_by_role("button",name="Download").click()
    check("decrypted download", True); pg.keyboard.press("Escape")
    pg.goto(B+"/app"); pg.wait_for_timeout(500)
    check("upload card on home", pg.get_by_role("button",name="Upload report").count()==1)
    # vitals log
    pg.goto(B+"/app/vitals"); pg.get_by_role("button",name="Log").click(); pg.get_by_label("Metric").select_option("hr"); pg.get_by_label("Value (bpm)").fill("70"); pg.get_by_role("button",name="Save reading").click(); pg.wait_for_timeout(400)
    check("vital logged", pg.get_by_text("70 bpm").count()>=1)
    # refills order + receipt
    pg.goto(B+"/app/refills"); pg.get_by_role("button",name="Reorder").first.click(); pg.get_by_role("button",name="Place order").click(); pg.wait_for_timeout(400)
    check("order placed", pg.get_by_text("placed").count()>=1)
    pg.get_by_role("button",name="Receipt").first.click(); pg.wait_for_timeout(200); check("receipt sheet", pg.get_by_role("dialog").count()==1); pg.keyboard.press("Escape")
    # vault download + manage access
    pg.goto(B+"/app/vault")
    with pg.expect_download(): pg.get_by_role("button",name="Download all").click()
    check("vault export", True)
    pg.get_by_role("link",name="Manage access").click(); pg.wait_for_url("**/profile/access")
    n=pg.get_by_role("button",name="Revoke").count(); pg.get_by_role("button",name="Revoke").first.click(); pg.wait_for_timeout(300)
    check("revoke grant", pg.get_by_role("button",name="Revoke").count()==n-1 and pg.get_by_text("revoked access").count()>=1)
    # family
    pg.goto(B+"/app/profile/family"); pg.get_by_role("button",name="Add").click(); pg.get_by_label("Name").fill("Meera Rawat"); pg.get_by_role("button",name="Add member").click(); pg.wait_for_timeout(300)
    check("family added", pg.get_by_text("Meera Rawat").count()>=1)
    pg.get_by_role("button",name="Make caregiver").first.click(); pg.wait_for_timeout(200); check("caregiver toggle", pg.get_by_text("receives approval codes").count()>=2)
    # language, abha, clinics, help
    # language: switch to Hindi, prove the UI really renders in it, then switch back
    # so every later assertion below reads the English strings it expects.
    pg.goto(B+"/app/profile/language"); pg.get_by_role("button",name="हिन्दी (Hindi)").click(); pg.wait_for_timeout(200)
    pg.goto(B+"/app/profile"); check("language persisted", pg.get_by_text("हिन्दी").count()>=1)
    pg.goto(B+"/app"); pg.wait_for_timeout(400)
    check("home renders in hindi", pg.get_by_text("तबीयत ठीक नहीं लग रही?").count()==1 and pg.get_by_role("link",name="लक्षण जाँचें").count()==1)
    pg.goto(B+"/app/symptom"); pg.wait_for_timeout(400)
    dis=pg.get_by_text("112").first.inner_text()
    check("112 and 108 survive translation", "112" in dis and "108" in dis)
    # voice: the mic follows the UI language, so check it while Hindi is still on.
    # Chromium ships a webkitSpeechRecognition that needs a live speech service, so
    # both the present and absent cases are stubbed here rather than left to chance.
    hi_pg=ctx.new_page(); hi_pg.add_init_script(STUB); hi_pg.goto(B+"/app/symptom"); hi_pg.wait_for_timeout(400)
    hi_pg.get_by_role("button",name="बोलकर बताएँ").click(); hi_pg.wait_for_timeout(200)
    check("mic uses hi-IN in hindi", hi_pg.evaluate("window.__recLang")=="hi-IN")
    check("listening banner translated", hi_pg.get_by_text("सुन रहे हैं… सामान्य रूप से बोलिए").count()==1)
    hi_pg.close()
    pg.goto(B+"/app/profile/language"); pg.get_by_role("button",name="English").click(); pg.wait_for_timeout(200)
    # voice, English: dictation lands in the input and is NOT sent on its own.
    v_pg=ctx.new_page(); v_pg.add_init_script(STUB); v_pg.goto(B+"/app/symptom"); v_pg.wait_for_timeout(400)
    check("mic shown when supported", v_pg.get_by_role("button",name="Speak").count()==1)
    v_pg.get_by_role("button",name="Speak").click(); v_pg.wait_for_timeout(200)
    check("mic uses en-IN in english", v_pg.evaluate("window.__recLang")=="en-IN")
    check("listening banner", v_pg.get_by_text("Listening… speak normally").count()==1)
    v_pg.evaluate("window.__fire('headache since', false)"); v_pg.wait_for_timeout(150)
    check("interim text in input", v_pg.get_by_label("Describe how you feel").input_value()=="headache since")
    v_pg.evaluate("window.__fire('headache since morning', true)"); v_pg.wait_for_timeout(150)
    check("final text in input", v_pg.get_by_label("Describe how you feel").input_value()=="headache since morning")
    check("speech is not auto-sent", v_pg.locator("div.bg-teal.text-white").count()==0)
    v_pg.get_by_label("Describe how you feel").fill("headache since morning, mild")
    check("dictation stays editable", v_pg.get_by_label("Describe how you feel").input_value()=="headache since morning, mild")
    v_pg.get_by_role("button",name="Stop listening").click(); v_pg.wait_for_timeout(150)
    check("listening banner clears", v_pg.get_by_text("Listening… speak normally").count()==0)
    v_pg.close()
    # no Web Speech API: the mic is absent, not a dead button.
    n_pg=ctx.new_page(); n_pg.add_init_script(NOSPEECH); n_pg.goto(B+"/app/symptom"); n_pg.wait_for_timeout(400)
    check("mic hidden when unsupported", n_pg.get_by_role("button",name="Speak").count()==0 and n_pg.get_by_label("Send").count()==1)
    check("read-aloud hidden without synthesis", n_pg.get_by_role("button",name="Read replies aloud").count()==0)
    n_pg.close()
    # elder mode: bigger type, four cards, three-item nav, mic as primary input
    pg.goto(B+"/app/profile"); pg.wait_for_timeout(300)
    check("elder row in profile", pg.get_by_text("Elder Mode").count()>=1)
    pg.goto(B+"/app/profile/language")
    plain_nav=None
    pg.goto(B+"/app"); pg.wait_for_timeout(400)
    plain_h=pg.get_by_role("link",name="Check a symptom").first.bounding_box()["height"]
    plain_nav=pg.locator("nav[aria-label='Primary'] a").count()
    pg.goto(B+"/app/profile/language"); pg.get_by_role("switch",name="Elder Mode").click(); pg.wait_for_timeout(300)
    check("elder toggle is on", pg.get_by_role("switch",name="Elder Mode").get_attribute("aria-checked")=="true")
    check("elder html class", pg.evaluate("document.documentElement.classList.contains('elder')"))
    pg.goto(B+"/app"); pg.wait_for_timeout(500)
    check("elder home has four cards", pg.locator("main.screen a[class*='min-h-[92px]']").count()==4)
    check("elder nav is three items", pg.locator("nav[aria-label='Primary'] a").count()==3 and plain_nav==5)
    check("elder nav keeps emergency", pg.locator("nav[aria-label='Primary'] a[href='/app/emergency']").count()==1)
    check("call family dials the caregiver", pg.locator("a[href='tel:+919876543210']").count()==1)
    elder_h=pg.get_by_role("link",name="Check a symptom").first.bounding_box()["height"]
    check("elder scales the layout up", elder_h > plain_h*1.2)
    smallest=pg.evaluate("Math.min(...[...document.querySelectorAll('main.screen p, main.screen span')].map(e=>parseFloat(getComputedStyle(e).fontSize)).filter(n=>n>0))")
    check("no elder text under 14px", smallest>=14)
    # elder chat: read-aloud on by default and a 72px mic as the primary control
    e_pg=ctx.new_page(); e_pg.add_init_script(STUB); e_pg.goto(B+"/app/symptom"); e_pg.wait_for_timeout(500)
    check("elder chat reads aloud by default", e_pg.get_by_role("button",name="Stop reading aloud").count()==1)
    box=e_pg.get_by_role("button",name="Speak").bounding_box()
    check("elder mic is a large primary target", box["height"]>=72 and box["width"]>=72)
    e_pg.close()
    # zoom scales dvh boxes too, so the desktop phone frame must still fit the window
    d_pg=ctx.new_page(); d_pg.set_viewport_size({"width":1440,"height":900})
    d_pg.goto(B+"/app"); d_pg.wait_for_timeout(600)
    nav_box=d_pg.locator("nav[aria-label='Primary']").bounding_box()
    check("elder desktop frame fits the window", nav_box["y"]+nav_box["height"] <= 900 and d_pg.evaluate("document.body.scrollWidth")<=1440)
    d_pg.close()
    # elder mode survives a reload and works in hindi
    pg.reload(); pg.wait_for_timeout(500)
    check("elder mode persists", pg.evaluate("document.documentElement.classList.contains('elder')"))
    pg.goto(B+"/app/profile/language"); pg.get_by_role("button",name="हिन्दी (Hindi)").click(); pg.wait_for_timeout(300)
    pg.goto(B+"/app"); pg.wait_for_timeout(500)
    check("elder home in hindi", pg.get_by_text("लक्षण जाँचें").count()>=1 and pg.locator("main.screen a[class*='min-h-[92px]']").count()==4)
    pg.goto(B+"/app/profile/language"); pg.get_by_role("switch",name="बुज़ुर्ग मोड").click(); pg.wait_for_timeout(300)
    check("elder mode turns back off", not pg.evaluate("document.documentElement.classList.contains('elder')"))
    pg.get_by_role("button",name="English").click(); pg.wait_for_timeout(300)
    pg.goto(B+"/app/profile/abha"); pg.get_by_role("button",name="Sync now").click(); pg.wait_for_timeout(200); check("abha sync toast", pg.get_by_role("status").count()==1)
    pg.goto(B+"/app/profile/clinics"); pg.get_by_role("button",name="Suggest a clinic").click(); pg.wait_for_timeout(200); check("clinic toast", pg.get_by_role("status").count()==1)
    pg.goto(B+"/app/profile/help"); check("help faqs", pg.locator("details").count()==4)
    # id: qr + download
    pg.goto(B+"/app/id"); pg.wait_for_timeout(800); check("qr rendered", pg.locator("img[alt^='QR code']").count()==1)
    with pg.expect_download(): pg.get_by_role("button",name="Download QR image").click()
    check("qr download", True)
    # emergency share on arrival
    pg.goto(B+"/app/emergency/share"); pg.get_by_role("button",name="Share my record now").click(); pg.wait_for_timeout(300); check("emergency grant", pg.get_by_text("can see your full record").count()==1)
    pg.goto(B+"/app/profile/access"); check("emergency grant listed", pg.get_by_text("· Emergency").count()>=1)
    # public page otp
    pg.goto(B+"/u/k7q2m9x4e1"); pg.get_by_role("button",name="Request full record").click(); pg.wait_for_timeout(500)
    code=pg.locator("span.mono.font-bold").inner_text(); pg.get_by_label("6-digit code").fill(code); pg.get_by_role("button",name="Open record").click(); pg.wait_for_timeout(1000)
    check("public otp unlock", pg.get_by_text("Approved by the patient").count()==1)
    # emergency directory: full list, nearest badge, call + directions per row
    pg.goto(B+"/app/emergency"); pg.wait_for_timeout(5000)
    check("emergency 112 and 108", pg.get_by_role("link",name="Call 112").count()==1 and pg.get_by_role("link",name="Ambulance · 108").count()==1)
    rows=pg.locator("ul li").filter(has_text="24×7 emergency").count()
    check("full hospital list", rows>=5)
    calls=pg.get_by_role("link",name=re.compile(r"^Call .+")).count()
    check("call links per hospital", calls>=5)
    check("directions per hospital", pg.get_by_role("link",name=re.compile(r"^Directions to ")).count()==rows)
    check("nearest badge once", pg.get_by_text("Nearest",exact=True).count()==1)
    check("no unverified badge", pg.get_by_text("Verified number").count()==0 and pg.get_by_text("Listed",exact=True).count()>=5)
    hrefs=pg.get_by_role("link",name=re.compile(r"^Call .+")).first.get_attribute("href")
    check("call link is tel:", hrefs.startswith("tel:"))
    # wellness: connect a device, then log water
    pg.goto(B+"/app/wellness"); pg.wait_for_timeout(500)
    check("wellness demo label", pg.get_by_text("Demo sync · real watch sync ships with the mobile app").count()>=1)
    pg.get_by_role("button",name="Apple Watch").click(); pg.wait_for_timeout(1800)
    check("device connects", pg.get_by_text("Connected").count()>=1)
    pg.goto(B+"/app"); pg.wait_for_timeout(600)
    check("wellness card on home", pg.get_by_role("link",name="Wellness").count()==1)
    pg.goto(B+"/app/wellness"); pg.wait_for_timeout(600)
    check("device survives refresh", pg.get_by_text("Connected").count()>=1)
    before=pg.get_by_text("of 8 glasses").inner_text()
    pg.get_by_role("button",name="+ Add glass").click(); pg.wait_for_timeout(400)
    check("water +1", pg.get_by_text("of 8 glasses").inner_text()!=before)
    pg.get_by_role("link",name="Ask the AI about this").first.click(); pg.wait_for_url("**/app/symptom**"); pg.wait_for_timeout(600)
    check("ai prefilled", len(pg.get_by_label("Describe how you feel").input_value())>10)
    pg.goto(B+"/app/record"); pg.wait_for_timeout(700)
    check("activity summary in record", pg.get_by_text("Activity summary —").count()>=1)
    # AI replies follow the patient's own words, not the app's language setting.
    lang_api=p.request.new_context(base_url=B, extra_http_headers=({"x-vs-bypass":BYPASS} if BYPASS else {}))
    def ask(text, hint, turns=1):
        msgs=[{"role":"user","content":"x"},{"role":"assistant","content":"y"}]*(turns-1)+[{"role":"user","content":text}]
        return lang_api.post("/api/chat", data={"messages":msgs,"lang":hint}).json()
    dev=re.compile(r"[ऀ-ॿ]")
    r=ask("सुबह से सिर दर्द है", "en")
    check("devanagari message gets a hindi reply", bool(dev.search(r["reply"])))
    r=ask("subah se sir dard hai", "en")
    check("hinglish message gets a hindi reply", bool(dev.search(r["reply"])))
    r=ask("headache since morning", "hi")
    check("english message wins over a hindi hint", not dev.search(r["reply"]))
    r=ask("ok", "hi")
    check("hint decides when the message has no signal", bool(dev.search(r["reply"])))
    r=ask("छाती में दर्द और साँस फूल रही है", "hi")
    check("hindi red flag routes to emergency", r["urgency"]=="emergency")
    check("112 and 108 stay latin in hindi", "112" in r["reply"] and "108" in r["reply"] and not dev.search("112"))
    r=ask("दो दिन से बुख़ार है", "hi", turns=2)
    check("hindi next_step is in hindi", bool(dev.search(r["next_step"]["title"])) and bool(dev.search(r["advice"])))
    check("json shape is unchanged", set(r)>= {"reply","question","urgency","next_step","likely_cause","advice"})
    bad=lang_api.post("/api/chat", data={"lang":"hi"})
    check("chat validates its input", bad.status==400 and bad.json()["ok"] is False)
    lang_api.dispose()
    # chat daily cap, with no bypass header: the 6th request must be refused
    api=p.request.new_context(base_url=B)
    codes=[api.post("/api/chat", data={"messages":[{"role":"user","content":"headache"}]}).status for _ in range(6)]
    check("chat daily cap 429s", codes[5]==429)
    api.dispose()
    # offline: the emergency strip and /app/emergency must still render with the
    # network cut. A separate context, so the service worker installs clean.
    off=b.new_context(viewport={"width":390,"height":844})
    o=off.new_page()
    o.goto(B+"/u/k7q2m9x4e1"); o.wait_for_timeout(300)
    o.wait_for_function("navigator.serviceWorker.controller !== null", timeout=15000)
    o.goto(B+"/app/emergency"); o.wait_for_timeout(1500)   # let the precache settle
    off.set_offline(True)
    o.goto(B+"/u/k7q2m9x4e1"); o.wait_for_timeout(1600)
    check("offline strip renders", o.get_by_text("Asha Rawat").count()>=1)
    check("offline blood group", o.get_by_text("B+", exact=True).count()>=1)
    check("offline ice phone", o.locator("a[href='tel:+919876543210']").count()>=1)
    check("offline banner, both languages", o.get_by_role("status").count()>=1
          and "Offline" in o.get_by_role("status").first.inner_text()
          and "ऑफ़लाइन" in o.get_by_role("status").first.inner_text())
    check("offline strip stays locked", o.get_by_text("Full record").count()>=1 and o.get_by_text("Consultation").count()==0)
    o.goto(B+"/app/emergency"); o.wait_for_timeout(1600)
    body=o.locator("body").inner_text()
    check("offline emergency has 112 and 108", "112" in body and "108" in body)
    check("offline hospital list", o.get_by_text("Max Super Speciality").count()>=1)
    off.set_offline(False); off.close()
    # sign out
    pg.goto(B+"/app/profile"); pg.get_by_role("button",name="Sign out").click(); pg.wait_for_url("**/onboarding"); check("sign out", True)
    # camp mode — after sign out on purpose: /camp is public and needs no account.
    pg.goto(B+"/camp"); pg.wait_for_timeout(500)
    check("camp is public", pg.get_by_text("Health-camp mode · pilot demo").count()==1)
    check("camp has a language switch", pg.get_by_role("group",name="Language").count()==1)
    before=pg.get_by_text(re.compile(r"^\d+ registered today$")).inner_text()
    pg.get_by_label("Full name").fill("Kamla Devi")
    pg.get_by_label("Mobile number").fill("9812345678")
    pg.get_by_label("Age",exact=True).fill("64")
    pg.get_by_role("button",name="Female").click()
    pg.get_by_role("button",name="B+",exact=True).click()
    pg.get_by_role("button",name="Penicillin").click()
    pg.get_by_label("Anything else? (optional)").fill("Dust mites")
    pg.get_by_label("Village or area").fill("Sahastradhara")
    pg.get_by_role("button",name="Register",exact=True).click(); pg.wait_for_timeout(700)
    check("registration lands", pg.get_by_text("Registered",exact=True).count()==1)
    check("slip shows a VS id", pg.get_by_text(re.compile(r"^VS-KAML-\d{4}$")).count()==1)
    check("slip has a qr", pg.locator(".camp-slip img").count()==1)
    check("slip is bilingual", "no OTP needed for this strip" in pg.locator(".camp-slip").inner_text()
          and "आपातकालीन" in pg.locator(".camp-slip").inner_text())
    check("slip carries blood group and allergies", "B+" in pg.locator(".camp-slip").inner_text()
          and "Penicillin, Dust mites" in pg.locator(".camp-slip").inner_text())
    check("counter went up", pg.get_by_text(re.compile(r"^\d+ registered today$")).inner_text()!=before)
    # the token the QR points at must open the strip with no code
    tok=pg.evaluate("JSON.parse(localStorage.getItem('vitasync.v1')).campRegistrations[0].token")
    check("camp token is random, not the name", "kaml" not in tok.lower() and len(tok)>=8)
    pg.goto(B+"/u/"+tok); pg.wait_for_timeout(700)
    check("camp strip opens with no otp", pg.get_by_text("Kamla Devi").count()>=1 and pg.get_by_text("B+",exact=True).count()>=1)
    check("camp strip is dialable", pg.locator("a[href='tel:+919812345678']").count()==1)
    check("camp full record still gated", pg.get_by_role("button",name="Request full record").count()==1)
    pg.get_by_role("button",name="Register the next person").count()  # no-op, slip is gone
    # an unknown token is explained, not faked
    pg.goto(B+"/u/zzzzzzzzzz"); pg.wait_for_timeout(600)
    check("unknown camp token explained", pg.get_by_text("registered at a camp on another device", exact=False).count()==1)
    # insights: a desktop concept view, reachable only from the landing footer
    w=ctx.new_page(); w.set_viewport_size({"width":1280,"height":900})
    w.goto(B+"/"); w.wait_for_timeout(400)
    check("footer links health departments", w.get_by_role("link",name="For health departments").count()==1)
    w.get_by_role("link",name="For health departments").click(); w.wait_for_url("**/insights"); w.wait_for_timeout(600)
    check("insights banner is present", w.get_by_text("Simulated data · concept view for district health officers · no real user data exists").count()==1)
    check("insights escapes the phone frame", w.locator(".deck-frame").count()==0 and w.evaluate("document.body.scrollWidth")<=1280)
    check("insights has four tiles", w.locator("section div[class*='rounded-[18px]']").count()>=4)
    check("insights line chart", w.locator("svg[role='img'] path[stroke-width='2']").count()==1)
    check("insights bar chart", w.locator("ul[role='list'] li").count()>=6)
    check("insights carries no logos but its own", w.locator("img[src^='http']").count()==0)
    w.get_by_role("button",name="Show the numbers as tables").click(); w.wait_for_timeout(300)
    check("insights table view", w.locator("table").count()==3 and w.locator("svg[role='img']").count()==0)
    check("insights banner survives the table view", w.get_by_text("no real user data exists", exact=False).count()==1)
    w.close()
    b.close()
print("\n%d failures"%len(fails)); print(fails)
