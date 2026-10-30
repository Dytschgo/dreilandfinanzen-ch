"""Prüfung und Screenshots für styles/fable-01-augenmass (Headless Chrome via Playwright)."""
import json, os, sys, io
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
NAME = os.path.basename(HERE)
URL = f"http://127.0.0.1:5180/{NAME}/index.html"
SHOTS = os.path.join(HERE, "screenshots")
os.makedirs(SHOTS, exist_ok=True)

res = {"console": [], "errors": []}
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome", args=["--enable-unsafe-webgpu"])
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    pg = ctx.new_page()
    pg.on("console", lambda m: res["console"].append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: res["errors"].append(str(e)))
    try:
        pg.goto(URL, wait_until="networkidle")
    except Exception:
        URL = "file:///" + os.path.join(HERE, "index.html").replace("\\", "/")
        pg.goto(URL, wait_until="networkidle")
    res["url"] = URL
    pg.wait_for_timeout(300)

    def check(view):
        r = pg.evaluate("""() => {
          const s = document.getElementById('betrag').getBoundingClientRect();
          const rate = document.getElementById('rate').getBoundingClientRect();
          const btn = document.querySelector('.btn-primary').getBoundingClientRect();
          return {sliderBottom: s.bottom, rateBottom: rate.bottom, btnBottom: btn.bottom, vh: innerHeight,
                  rate: document.getElementById('rate').textContent};
        }""")
        r["sliderInView"] = r["sliderBottom"] <= r["vh"]
        before = r["rate"]
        pg.evaluate("""() => { const s = document.getElementById('betrag'); s.value = 40000; s.dispatchEvent(new Event('input', {bubbles:true})); }""")
        r["rateAfter"] = pg.evaluate("document.getElementById('rate').textContent")
        r["rateChanges"] = before != r["rateAfter"]
        pg.evaluate("""() => { const s = document.getElementById('betrag'); s.value = 15000; s.dispatchEvent(new Event('input', {bubbles:true})); }""")
        return r

    res["desktop"] = check("desktop")
    pg.screenshot(path=os.path.join(SHOTS, "hero-desktop.png"))
    pg.screenshot(path=os.path.join(SHOTS, "desktop.png"), full_page=True)
    res["words"] = pg.evaluate("document.body.innerText.trim().split(/\\s+/).length")

    pg.set_viewport_size({"width": 390, "height": 844})
    pg.wait_for_timeout(300)
    res["mobile"] = check("mobile")
    pg.screenshot(path=os.path.join(SHOTS, "hero-mobile.png"))
    pg.screenshot(path=os.path.join(SHOTS, "mobile.png"), full_page=True)

    pg.set_viewport_size({"width": 360, "height": 800})
    pg.wait_for_timeout(200)
    res["scrollW360"] = pg.evaluate("[document.documentElement.scrollWidth, innerWidth]")
    res["noHScroll360"] = res["scrollW360"][0] <= res["scrollW360"][1]

    # Tragbarkeit testen
    pg.set_viewport_size({"width": 1440, "height": 900})
    pg.click("#trag summary")
    pg.fill("#einkommen", "5500"); pg.fill("#fixkosten", "4200")
    pg.evaluate("""() => { const s = document.getElementById('betrag'); s.value = 40000; s.dispatchEvent(new Event('input', {bubbles:true})); }""")
    res["ampel"] = pg.evaluate("document.getElementById('ampel').dataset.state + ' | ' + document.getElementById('ampel').textContent + ' | ' + document.getElementById('vorschlag').textContent")
    pg.screenshot(path=os.path.join(SHOTS, "tragbarkeit-desktop.png"))

    # Galerie
    pg.evaluate("""() => { const s = document.getElementById('betrag'); s.value = 15000; s.dispatchEvent(new Event('input', {bubbles:true})); document.getElementById('trag').open = false; }""")
    pg.evaluate("window.scrollTo(0,0)")
    pg.screenshot(path=os.path.join(HERE, "_hero_tmp.png"))
    b.close()

from PIL import Image
im = Image.open(os.path.join(HERE, "_hero_tmp.png")).convert("RGB").resize((720, 450), Image.LANCZOS)
gal = os.path.join(os.path.dirname(HERE), "_gallery", NAME + ".jpg")
im.save(gal, "JPEG", quality=88)
os.remove(os.path.join(HERE, "_hero_tmp.png"))
res["gallery"] = gal
with open(os.path.join(SHOTS, "verification.json"), "w", encoding="utf-8") as f:
    json.dump(res, f, ensure_ascii=False, indent=2)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
print(json.dumps(res, ensure_ascii=False, indent=2))
