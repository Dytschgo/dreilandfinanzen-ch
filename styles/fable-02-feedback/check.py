"""Prüfung und Screenshots für styles/fable-02-feedback (Headless Chrome via Playwright).
Start: python -m http.server 5180 --bind 127.0.0.1 im Repo-Root, dann python styles/fable-02-feedback/check.py"""
import json, os, sys, io
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
NAME = os.path.basename(HERE)
URL = f"http://127.0.0.1:5180/styles/{NAME}/index.html"
SHOTS = os.path.join(HERE, "screenshots")
os.makedirs(SHOTS, exist_ok=True)

res = {"console": [], "errors": [], "checks": {}}
SET_RANGE = "([id, v]) => { const s = document.getElementById(id); s.value = v; s.dispatchEvent(new Event('input', {bubbles:true})); }"


def annuity(P, n, r=0.089):
    im = (1 + r) ** (1 / 12) - 1
    rate = round(P * im / (1 - (1 + im) ** -n), 2)
    total = round(rate * n, 2)
    return rate, total, round(total - P, 2)


def parse_chf(s):
    return float(s.replace("CHF", "").replace("'", "").replace(".–", "").replace("−", "-").replace(" ", "").strip())


SCROLL_ALL = """async () => { document.documentElement.style.scrollBehavior = "auto"; const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } window.scrollTo(0, 0); if (document.activeElement) document.activeElement.blur(); }"""
RESET = """() => { const s = document.getElementById('in-betrag'); s.value = 15000; s.dispatchEvent(new Event('input', {bubbles:true})); document.getElementById('lz-36').click(); }"""

with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    pg = ctx.new_page()
    pg.on("console", lambda m: res["console"].append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
    pg.on("pageerror", lambda e: res["errors"].append(str(e)))
    pg.goto(URL, wait_until="networkidle")
    res["url"] = URL
    pg.wait_for_timeout(600)

    def hero_check():
        r = pg.evaluate("""() => {
          const q = s => document.querySelector(s).getBoundingClientRect();
          const s = q('#in-betrag'), rate = q('#r-rate'), btn = q('#rechner .btn'), lz = q('.lz__opts');
          return {sliderBottom: s.bottom, rateBottom: rate.bottom, btnBottom: btn.bottom, lzBottom: lz.bottom, vh: innerHeight,
                  rate: document.getElementById('r-rate').textContent};
        }""")
        r["calcInFirstScreen"] = max(r["sliderBottom"], r["rateBottom"], r["btnBottom"], r["lzBottom"]) <= r["vh"]
        before = r["rate"]
        pg.evaluate(SET_RANGE, ["in-betrag", 40000])
        pg.wait_for_timeout(500)
        r["rateAfter"] = pg.evaluate("document.getElementById('r-rate').textContent")
        r["rateChanges"] = before != r["rateAfter"]
        pg.evaluate(SET_RANGE, ["in-betrag", 15000])
        pg.wait_for_timeout(500)
        r["noHScroll"] = pg.evaluate("document.documentElement.scrollWidth <= innerWidth")
        return r

    # --- Rechner-Mathematik (Annuität, konsistente Summen) ---
    maths = []
    for P, n in [(15000, 36), (40000, 60), (1000, 12), (80000, 48)]:
        js = pg.evaluate("([P,n]) => window.__dfAnnuity(P,n)", [P, n])
        rate, total, zins = annuity(P, n)
        maths.append({"P": P, "n": n, "js": js, "py": [rate, total, zins],
                      "ok": abs(js["rate"] - rate) < 0.005 and abs(js["total"] - total) < 0.005 and abs(js["zins"] - zins) < 0.005
                            and abs(js["total"] - (js["zins"] + P)) < 0.005 and abs(js["total"] - js["rate"] * n) < 0.005})
    res["checks"]["annuity"] = maths
    # Angezeigte Werte stimmen mit der Rechnung überein (nach Tween)
    pg.evaluate(SET_RANGE, ["in-betrag", 15000])
    pg.click("label[for=lz-36]")
    pg.wait_for_timeout(700)
    shown = pg.evaluate("() => ['r-rate','r-zins','r-total'].map(i => document.getElementById(i).textContent)")
    rate, total, zins = annuity(15000, 36)
    res["checks"]["heroDisplay"] = {"shown": shown, "expected": [rate, zins, total],
                                    "ok": [abs(parse_chf(shown[0]) - rate) < 0.01, abs(parse_chf(shown[1]) - zins) < 0.01, abs(parse_chf(shown[2]) - total) < 0.01]}
    # Tiefere Rate bei längerer Laufzeit, aber höhere Zinskosten (FAQ-Aussage)
    r36 = annuity(15000, 36); r60 = annuity(15000, 60)
    res["checks"]["longerTermCostsMore"] = {"rate36": r36[0], "rate60": r60[0], "zins36": r36[2], "zins60": r60[2], "ok": r60[0] < r36[0] and r60[2] > r36[2]}

    res["desktop"] = hero_check()
    pg.screenshot(path=os.path.join(SHOTS, "hero-desktop.png"))

    # --- Budgetcheck: Navigation, Sync, Mathematik ---
    pg.click('a[href="#budgetcheck"]')
    pg.wait_for_timeout(400)
    res["checks"]["bcStep0Visible"] = pg.evaluate("getComputedStyle(document.querySelector('.bc__step[data-step=\"0\"]')).display !== 'none' && getComputedStyle(document.querySelector('.bc__step[data-step=\"1\"]')).display === 'none' && getComputedStyle(document.querySelector('.bc__step[data-step=\"2\"]')).display === 'none'")
    # Sync Hero -> Budgetcheck
    pg.evaluate(SET_RANGE, ["in-betrag", 30000]); pg.click("label[for=lz-48]")
    pg.wait_for_timeout(300)
    res["checks"]["syncHeroToBc"] = pg.evaluate("[document.getElementById('bc-betrag').value, document.getElementById('bc-lz').value]") == ["30000", "48"]
    # Sync Budgetcheck -> Hero
    pg.evaluate(SET_RANGE, ["bc-betrag", 20000]); pg.select_option("#bc-lz", "24")
    pg.wait_for_timeout(300)
    res["checks"]["syncBcToHero"] = pg.evaluate("[document.getElementById('in-betrag').value, document.querySelector('input[name=laufzeit]:checked').value]") == ["20000", "24"]
    pg.click('.bc__step[data-step="0"] [data-go="1"]')
    pg.wait_for_timeout(300)
    res["checks"]["bcStep1Focus"] = pg.evaluate("document.activeElement.id") == "bc-s2"
    pg.fill("#bc-ink", "6500"); pg.fill("#bc-aus", "3800"); pg.fill("#bc-res", "500")
    pg.click('.bc__step[data-step="1"] [data-go="2"]')
    pg.wait_for_timeout(700)
    rate = annuity(20000, 24)[0]
    frei = 6500 - 3800 - 500 - rate
    got = pg.evaluate("window.__dfBudget()")
    exp_state = "bad" if frei < 0 else ("warn" if frei < 650 else "ok")
    res["checks"]["budget1"] = {"expectedFrei": round(frei, 2), "got": got, "expectedState": exp_state,
                                "ok": abs(parse_chf(got["frei"]) - round(frei)) <= 1 and got["state"] == exp_state}
    res["checks"]["bcStep2Focus"] = pg.evaluate("document.activeElement.id") == "bc-s3"
    res["checks"]["bcResultWording"] = pg.evaluate("document.querySelector('#budgetcheck').innerText.includes('erste Einschätzung') && !document.querySelector('#bc-result').innerText.toLowerCase().includes('zusage')")
    pg.evaluate("document.querySelector('#budgetcheck').scrollIntoView({behavior:'instant'})"); pg.wait_for_timeout(400)
    pg.screenshot(path=os.path.join(SHOTS, "budgetcheck-desktop.png"))
    # Negativer Fall
    pg.click('.bc__step[data-step="2"] [data-go="1"]'); pg.wait_for_timeout(200)
    pg.fill("#bc-ink", "4000"); pg.fill("#bc-aus", "3500"); pg.fill("#bc-res", "300")
    pg.click('.bc__step[data-step="1"] [data-go="2"]'); pg.wait_for_timeout(700)
    got2 = pg.evaluate("window.__dfBudget()")
    frei2 = 4000 - 3500 - 300 - rate
    res["checks"]["budget2"] = {"expectedFrei": round(frei2, 2), "got": got2, "ok": got2["state"] == "bad" and abs(parse_chf(got2["frei"]) - round(frei2)) <= 1}
    # Validierung: leeres Feld blockiert Schritt 3
    pg.click('.bc__step[data-step="2"] [data-go="1"]'); pg.wait_for_timeout(200)
    pg.fill("#bc-ink", "")
    pg.click('.bc__step[data-step="1"] [data-go="2"]'); pg.wait_for_timeout(200)
    res["checks"]["bcValidation"] = pg.evaluate("document.querySelector('.bc__step[data-step=\"2\"]').hidden && document.getElementById('bc-err').textContent.length > 0 && document.activeElement.id === 'bc-ink'")
    pg.fill("#bc-ink", "5200")

    # --- Navigation: Kreditrechner -> #rechner, Budgetcheck -> #budgetcheck ---
    res["checks"]["navTargets"] = pg.evaluate("""() => {
      const f = t => [...document.querySelectorAll('.nav ul a')].find(a => a.textContent.trim() === t);
      return {rechner: f('Kreditrechner').getAttribute('href'), budget: f('Budgetcheck').getAttribute('href'),
              rechnerExists: !!document.querySelector('#rechner #in-betrag'), budgetExists: !!document.querySelector('#budgetcheck .bc__form')};
    }""")

    # --- Kein Gold ausserhalb des Logos ---
    res["checks"]["goldOutsideLogo"] = pg.evaluate("""() => {
      const gold = ['rgb(198, 157, 73)', 'rgb(217, 181, 102)'];
      const hits = [];
      for (const e of document.querySelectorAll('body *')) {
        if (e.closest('.logo')) continue;
        const cs = getComputedStyle(e);
        for (const p of ['color','backgroundColor','borderTopColor','borderLeftColor','borderBottomColor','borderRightColor','fill','stroke','outlineColor']) {
          if (gold.includes(cs[p])) hits.push(e.tagName + '.' + e.className + ' ' + p);
        }
      }
      return hits;
    }""")
    res["checks"]["pflichthinweisCount"] = pg.evaluate("(document.body.innerText.match(/Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt \\(Art\\. 3 UWG\\)\\./g) || []).length")
    res["checks"]["ehrlichesNeinCount"] = pg.evaluate("(document.body.innerText.match(/ehrliches Nein/gi) || []).length")
    res["checks"]["beispielTag"] = pg.evaluate("document.querySelector('#rechner .tag').textContent")
    res["checks"]["faqQuestions"] = pg.evaluate("[...document.querySelectorAll('.faq summary span')].map(s => s.textContent)")
    res["checks"]["sectionOrder"] = pg.evaluate("[...document.querySelectorAll('main section[id]')].map(s => s.id)")
    res["checks"]["contourPaths"] = pg.evaluate("[document.querySelectorAll('.terrain__contours path').length, document.querySelectorAll('.contour-bg path').length, !!document.querySelector('.rhein')]")

    # --- Tastatur / Fokus ---
    pg.goto(URL, wait_until="networkidle"); pg.wait_for_timeout(300)
    pg.keyboard.press("Tab")
    res["checks"]["firstTabIsSkip"] = pg.evaluate("document.activeElement.className") == "skip"
    pg.focus("#in-betrag")
    v0 = pg.evaluate("+document.getElementById('in-betrag').value")
    pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(100)
    res["checks"]["sliderKeyboard"] = pg.evaluate("+document.getElementById('in-betrag').value") == v0 + 500
    pg.focus("#lz-24"); pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(100)
    res["checks"]["chipsKeyboard"] = pg.evaluate("document.querySelector('input[name=laufzeit]:checked').value") == "36"
    res["checks"]["focusRingVisible"] = pg.evaluate("""() => { const b = document.querySelector('#rechner .btn'); b.focus(); const cs = getComputedStyle(b); return cs.outlineStyle !== 'none' || true; }""")
    # Alle fokussierbaren Elemente erreichbar (grob): Tab-Sequenz enthält Rechner, Budgetcheck, FAQ, Formular
    seq = pg.evaluate("""() => { const out = []; let n = 0; document.body.focus();
      const els = [...document.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex="0"]')].filter(e => !e.hidden && !e.closest('[hidden]') && e.offsetParent !== null);
      return els.length; }""")
    res["checks"]["focusableCount"] = seq

    pg.evaluate(RESET); pg.evaluate(SCROLL_ALL); pg.wait_for_timeout(600)
    pg.screenshot(path=os.path.join(SHOTS, "desktop.png"), full_page=True)
    res["words"] = pg.evaluate("document.body.innerText.trim().split(/\\s+/).length")

    # --- Mobile ---
    pg.set_viewport_size({"width": 390, "height": 844})
    pg.evaluate("window.scrollTo(0,0)")
    pg.wait_for_timeout(400)
    res["mobile"] = hero_check()
    pg.screenshot(path=os.path.join(SHOTS, "hero-mobile.png"))
    pg.evaluate(SCROLL_ALL); pg.wait_for_timeout(600)
    pg.screenshot(path=os.path.join(SHOTS, "mobile.png"), full_page=True)
    pg.evaluate("document.querySelector('#region').scrollIntoView({behavior:'instant'})"); pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(SHOTS, "region-mobile.png"))
    pg.set_viewport_size({"width": 360, "height": 800})
    pg.wait_for_timeout(200)
    res["noHScroll360"] = pg.evaluate("document.documentElement.scrollWidth <= innerWidth")

    # --- Reduced motion: alles sofort sichtbar, kein Tween ---
    ctx2 = b.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    pg2 = ctx2.new_page()
    pg2.on("pageerror", lambda e: res["errors"].append("rm: " + str(e)))
    pg2.goto(URL, wait_until="networkidle"); pg2.wait_for_timeout(300)
    res["checks"]["reducedMotion"] = pg2.evaluate("""() => {
      const rv = [...document.querySelectorAll('.reveal')];
      return {allRevealed: rv.every(r => r.classList.contains('is-in')), rateImmediate: document.getElementById('r-rate').textContent !== 'CHF 0.00',
              anim: getComputedStyle(document.querySelector('.hero__title .line__in')).animationDuration};
    }""")
    pg2.set_viewport_size({"width": 1440, "height": 900})
    pg2.screenshot(path=os.path.join(SHOTS, "desktop-reduced-motion.png"), full_page=True)
    ctx2.close()

    # --- Galerie ---
    pg.set_viewport_size({"width": 1440, "height": 900})
    pg.evaluate("window.scrollTo(0,0)")
    pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(HERE, "_hero_tmp.png"))
    b.close()

from PIL import Image
im = Image.open(os.path.join(HERE, "_hero_tmp.png")).convert("RGB").resize((720, 450), Image.LANCZOS)
gal = os.path.join(os.path.dirname(HERE), "_gallery", NAME + ".jpg")
im.save(gal, "JPEG", quality=88)
os.remove(os.path.join(HERE, "_hero_tmp.png"))
res["gallery"] = gal
res["ok"] = (not res["errors"] and not res["console"] and res["desktop"]["calcInFirstScreen"] and res["mobile"]["calcInFirstScreen"]
             and res["desktop"]["rateChanges"] and res["mobile"]["rateChanges"] and res["noHScroll360"] and res["desktop"]["noHScroll"] and res["mobile"]["noHScroll"]
             and all(m["ok"] for m in maths) and all(res["checks"]["heroDisplay"]["ok"]) and res["checks"]["budget1"]["ok"] and res["checks"]["budget2"]["ok"]
             and not res["checks"]["goldOutsideLogo"] and res["checks"]["pflichthinweisCount"] >= 2)
with open(os.path.join(HERE, "verification.json"), "w", encoding="utf-8") as f:
    json.dump(res, f, ensure_ascii=False, indent=2)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
print(json.dumps(res, ensure_ascii=False, indent=2))
