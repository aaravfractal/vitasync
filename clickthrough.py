"""Click every button in the app and assert something happened. Run with the dev/prod server on :3111."""
from playwright.sync_api import sync_playwright
B="http://127.0.0.1:3111"
fails=[]
def check(name, cond):
    print(("PASS " if cond else "FAIL ")+name); 
    if not cond: fails.append(name)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":390,"height":844})
    # onboarding → otp → app
    pg.goto(B+"/onboarding"); pg.get_by_role("button",name="Continue with phone number").click()
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
    pg.goto(B+"/app/profile/language"); pg.get_by_role("button",name="हिन्दी (Hindi)").click(); pg.wait_for_timeout(200); pg.goto(B+"/app/profile"); check("language persisted", pg.get_by_text("हिन्दी").count()>=1)
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
    # sign out
    pg.goto(B+"/app/profile"); pg.get_by_role("button",name="Sign out").click(); pg.wait_for_url("**/onboarding"); check("sign out", True)
    b.close()
print("\n%d failures"%len(fails)); print(fails)
