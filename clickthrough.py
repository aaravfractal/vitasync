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
    # chat daily cap, with no bypass header: the 6th request must be refused
    api=p.request.new_context(base_url=B)
    codes=[api.post("/api/chat", data={"messages":[{"role":"user","content":"headache"}]}).status for _ in range(6)]
    check("chat daily cap 429s", codes[5]==429)
    api.dispose()
    # sign out
    pg.goto(B+"/app/profile"); pg.get_by_role("button",name="Sign out").click(); pg.wait_for_url("**/onboarding"); check("sign out", True)
    b.close()
print("\n%d failures"%len(fails)); print(fails)
