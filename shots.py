from playwright.sync_api import sync_playwright
pages=[("app","/app"),("symptom","/app/symptom"),("record","/app/record"),("vitals","/app/vitals"),("refills","/app/refills"),("book","/app/book"),("vault","/app/vault"),("emergency","/app/emergency"),("id","/app/id"),("u","/u/k7q2m9x4e1"),("onboarding","/onboarding")]
with sync_playwright() as p:
    b=p.chromium.launch()
    for n,u in pages:
        pg=b.new_page(viewport={"width":390,"height":844})
        pg.goto("http://127.0.0.1:3111"+u, wait_until="load", timeout=30000)
        pg.wait_for_timeout(1200)
        pg.screenshot(path=f"shots/s_{n}.png")
        pg.close()
    pg=b.new_page(viewport={"width":1280,"height":800}); pg.goto("http://127.0.0.1:3111/", wait_until="load"); pg.wait_for_timeout(800); pg.screenshot(path="shots/s_landing.png"); pg.close()
    pg=b.new_page(viewport={"width":1280,"height":900}); pg.goto("http://127.0.0.1:3111/pricing", wait_until="load"); pg.wait_for_timeout(800); pg.screenshot(path="shots/s_pricing.png"); pg.close()
    b.close()
