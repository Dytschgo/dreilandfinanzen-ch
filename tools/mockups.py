"""Mockups: Visitenkarte, Briefpapier, Website, Social Media."""
from __future__ import annotations

from pathlib import Path

from common import C, icon_inline, iso_pattern, logo, page

# Platzhalter – vor Produktion durch echte Angaben ersetzen
P = {
    "name": "Vorname Nachname",
    "rolle": "Kreditberatung",
    "tel": "+41 61 000 00 00",
    "mail": "info@dreilandfinanzen.ch",
    "web": "dreilandfinanzen.ch",
    "strasse": "Musterstrasse 1",
    "ort": "4051 Basel",
}

DESK = """background:
  radial-gradient(120% 90% at 30% 20%, #F4F5F7 0%, #DADDE3 60%, #C9CDD5 100%);"""
SHADOW = ("box-shadow: 0 1px 1px rgba(3,26,61,.08), 0 6px 12px rgba(3,26,61,.10), "
          "0 30px 60px -10px rgba(3,26,61,.28);")


# ---------------------------------------------------------------------------
# Visitenkarte 85 × 55 mm
# ---------------------------------------------------------------------------
def card_front(unit="mm"):
    return f"""<div class="card front">
  {logo('horizontal', 'farbig', width='58%')}
</div>"""


def card_back():
    return f"""<div class="card back">
  {iso_pattern('#FFFFFF', 0.05, 26, 'isoc')}
  <div class="cb-top">{icon_inline(('#4F86C6', '#D9B566', '#E5484D'), 'width:9mm')}</div>
  <div class="cb-person"><strong>{P['name']}</strong><span>{P['rolle']}</span></div>
  <div class="cb-contact">
    <span>{P['tel']}</span><span>{P['mail']}</span><span>{P['strasse']} · {P['ort']}</span><span class="web">{P['web']}</span>
  </div>
</div>"""


CARD_CSS = """
.card { width: 85mm; height: 55mm; position: relative; overflow: hidden; }
.front { background: #fff; display: grid; place-items: center; }
.back { background: var(--ink); color: #fff; padding: 6mm; display: grid; grid-template-rows: auto 1fr auto; }
.cb-top { display: flex; justify-content: flex-end; position: relative; }
.cb-person { position: relative; align-self: end; display: grid; gap: 1mm; margin-bottom: 3.5mm; }
.cb-person strong { font-family: var(--display); font-weight: 700; font-size: 3.9mm; letter-spacing: .01em; }
.cb-person span { font-size: 2.5mm; color: #AFC0DD; letter-spacing: .04em; }
.cb-contact { position: relative; display: grid; gap: .9mm; font-size: 2.35mm; color: #E6ECF5; padding-top: 3mm; border-top: .25mm solid rgba(255,255,255,.18); }
.cb-contact .web { color: #8FB4E3; font-weight: 600; }
"""


def build_card(r, out_dir: Path, work: Path):
    # Druckvorlage mit 3 mm Beschnitt
    css = CARD_CSS + """
@page { size: 91mm 61mm; margin: 0; }
.sheet { width: 91mm; height: 61mm; padding: 3mm; break-after: page; position: relative; }
.sheet.f { background: #fff; } .sheet.b { background: var(--ink); }
.sheet .card { box-shadow: none; }
"""
    html = (f'<div class="sheet f">{card_front()}</div><div class="sheet b">{card_back()}</div>')
    f = work / "visitenkarte_druck.html"
    f.write_text(page(html, css, "Visitenkarte"), encoding="utf-8")
    r.html_pdf(f, out_dir / "visitenkarte_druckvorlage_85x55mm_3mm-beschnitt.pdf")

    # Szene
    css = CARD_CSS + f"""
body {{ width: 2400px; height: 1600px; {DESK} position: relative; overflow: hidden; }}
.stage {{ position: absolute; left: 0; top: 0; width: 750px; height: 500px; zoom: 3.2; }}
.s {{ position: absolute; transform-origin: center; {SHADOW} border-radius: .4mm; }}
.s1 {{ left: 45px; top: 110px; transform: rotate(-5deg); }}
.s2 {{ left: 385px; top: 175px; transform: rotate(4deg); }}
.s3 {{ left: 330px; top: 30px; transform: rotate(-11deg); }}
.label {{ position: absolute; left: 25px; bottom: 18px; font: 500 7px var(--text); color: #58637E; letter-spacing: .04em; }}
"""
    html = f"""<div class="stage">
  <div class="s s1">{card_front()}</div>
  <div class="s s2">{card_back()}</div>
  <div class="label">Visitenkarte · 85 × 55 mm · Vorder- und Rückseite</div>
</div>"""
    f = work / "visitenkarte_mockup.html"
    f.write_text(page(html, css), encoding="utf-8")
    r.html_png(f, 2400, 1600, out_dir / "mockup_visitenkarte.png")


# ---------------------------------------------------------------------------
# Briefpapier A4 (Fenster rechts, CH-Norm)
# ---------------------------------------------------------------------------
LETTER_CSS = """
.a4 { width: 210mm; height: 297mm; background: #fff; position: relative; overflow: hidden; color: #1c2740; font-size: 10.5pt; line-height: 1.5; }
.a4 .lg { position: absolute; left: 20mm; top: 16mm; }
.a4 .fold { position: absolute; left: 6mm; width: 4mm; height: .2mm; background: #9aa6bf; }
.a4 .sender { position: absolute; left: 118mm; top: 50mm; font-size: 6.5pt; color: var(--slate); letter-spacing: .02em; border-bottom: .2mm solid #cfd6e3; padding-bottom: 1mm; width: 80mm; }
.a4 .addr { position: absolute; left: 118mm; top: 56mm; width: 80mm; }
.a4 .meta { position: absolute; left: 20mm; top: 98mm; }
.a4 .body { position: absolute; left: 20mm; right: 22mm; top: 110mm; }
.a4 h1 { font: 700 11pt var(--display); color: var(--navy); margin: 0 0 6mm; }
.a4 p { margin: 0 0 4mm; }
.a4 .foot { position: absolute; left: 20mm; right: 20mm; bottom: 12mm; display: grid; grid-template-columns: 1.1fr 1fr 1fr auto; gap: 6mm; font-size: 7pt; color: var(--slate); border-top: .25mm solid #dfe4ee; padding-top: 4mm; line-height: 1.55; }
.a4 .foot b { color: var(--navy); font-weight: 600; }
.a4 .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 2.2mm; display: grid; grid-template-columns: 3fr 1fr 1fr; }
"""


def letter():
    return f"""<div class="a4">
  <div class="lg">{logo('horizontal', 'farbig', height='15mm')}</div>
  <div class="fold" style="top:99mm"></div><div class="fold" style="top:198mm"></div>
  <div class="sender">Dreiland Finanzen · {P['strasse']} · {P['ort']}</div>
  <div class="addr">Frau<br>Erika Muster<br>Beispielweg 12<br>4052 Basel</div>
  <div class="meta">Basel, 30. Oktober 2026</div>
  <div class="body">
    <h1>Ihre Kreditanfrage</h1>
    <p>Sehr geehrte Frau Muster</p>
    <p>Vielen Dank für das offene Gespräch. Wir haben Ihre Anfrage für einen Privatkredit über CHF 20'000.– sorgfältig geprüft und Ihr Budget gemeinsam mit Ihnen durchgerechnet.</p>
    <p>Unsere ehrliche Empfehlung: ein Kreditbetrag von CHF 15'000.– mit einer Laufzeit von 48 Monaten. So bleibt Ihre monatliche Belastung tragbar und Sie behalten finanziellen Spielraum für Unvorhergesehenes. Die detaillierte Offerte mit allen Kosten finden Sie in der Beilage.</p>
    <p>Gerne besprechen wir die Unterlagen persönlich mit Ihnen. Für Rückfragen sind wir jederzeit für Sie da.</p>
    <p style="margin-top:8mm">Freundliche Grüsse</p>
    <p style="margin-top:12mm"><b style="color:var(--navy)">{P['name']}</b><br><span style="color:var(--slate)">{P['rolle']}</span></p>
  </div>
  <div class="foot">
    <div><b>Dreiland Finanzen</b><br>{P['strasse']}<br>{P['ort']}</div>
    <div>{P['tel']}<br>{P['mail']}<br>{P['web']}</div>
    <div>UID CHE-000.000.000<br>IBAN CH00 0000 0000 0000 0000 0</div>
    <div>{icon_inline(style='width:8mm')}</div>
  </div>
  <div class="bar"><span style="background:var(--navy)"></span><span style="background:var(--blue)"></span><span style="background:var(--red)"></span></div>
</div>"""


def build_letter(r, out_dir: Path, work: Path):
    css = LETTER_CSS + "@page { size: A4; margin: 0; }"
    f = work / "briefpapier.html"
    f.write_text(page(letter(), css, "Briefpapier"), encoding="utf-8")
    r.html_pdf(f, out_dir / "briefpapier_vorlage_A4.pdf")

    css = LETTER_CSS + f"""
body {{ width: 2400px; height: 1700px; {DESK} position: relative; overflow: hidden; }}
.stage {{ position: absolute; left: 0; top: 0; width: 2000px; height: 1417px; zoom: 1.2; }}
.p {{ position: absolute; {SHADOW} }}
.p1 {{ left: 150px; top: 120px; transform: rotate(-3deg); }}
.p2 {{ left: 1040px; top: 60px; transform: rotate(2.5deg); }}
.env {{ position: absolute; left: 1010px; top: 930px; width: 229mm; height: 114mm; background: #fff; transform: rotate(-5deg); {SHADOW} }}
.env .w {{ position: absolute; right: 20mm; top: 50mm; width: 90mm; height: 45mm; border: .3mm solid #e3e7ef; border-radius: 1mm; background: #fafbfd; }}
.env .l {{ position: absolute; left: 12mm; top: 10mm; }}
"""
    html = f"""<div class="stage"><div class="p p2">{letter()}</div><div class="p p1">{letter()}</div>
<div class="env"><div class="l">{logo('horizontal', 'farbig', height='11mm')}</div><div class="w"></div></div></div>"""
    f = work / "briefpapier_mockup.html"
    f.write_text(page(html, css), encoding="utf-8")
    r.html_png(f, 2400, 1700, out_dir / "mockup_briefpapier.png")


# ---------------------------------------------------------------------------
# Website (Desktop + Mobile)
# ---------------------------------------------------------------------------
WEB_CSS = """
.site { background: #fff; color: var(--navy); position: relative; overflow: hidden; }
.nav { display: flex; align-items: center; justify-content: space-between; padding: 28px 72px; border-bottom: 1px solid #E6EAF1; }
.nav ul { display: flex; gap: 36px; list-style: none; margin: 0; padding: 0; font: 500 16px var(--text); color: #2b3a5c; }
.btn { display: inline-flex; align-items: center; gap: 10px; font: 600 16px var(--text); padding: 15px 24px; border-radius: 4px; background: var(--navy); color: #fff; }
.btn.ghost { background: transparent; color: var(--navy); box-shadow: inset 0 0 0 1.5px var(--navy); }
.hero { display: grid; grid-template-columns: 1.05fr .95fr; gap: 40px; padding: 88px 72px 64px; align-items: center; }
.eyebrow { font: 600 13px var(--text); letter-spacing: .16em; text-transform: uppercase; color: var(--red); display: flex; gap: 12px; align-items: center; }
.eyebrow::before { content: ''; width: 28px; height: 2px; background: var(--red); }
.hero h1 { font: 700 64px/1.05 var(--display); letter-spacing: -.02em; margin: 22px 0 24px; text-wrap: balance; }
.hero p { font: 400 19px/1.6 var(--text); color: #4a5778; max-width: 34em; margin: 0 0 36px; }
.hero .ctas { display: flex; gap: 14px; }
.visual { position: relative; height: 520px; background: var(--mist); border-radius: 6px; overflow: hidden; display: grid; place-items: center; }
.visual .chip { position: absolute; background: #fff; border-radius: 6px; padding: 16px 20px; font: 600 15px var(--text); box-shadow: 0 10px 30px -10px rgba(3,26,61,.25); display: grid; gap: 4px; }
.visual .chip small { font: 500 12px var(--text); color: var(--slate); letter-spacing: .06em; text-transform: uppercase; }
.trust { display: flex; gap: 48px; padding: 0 72px 40px; font: 500 14px var(--text); color: var(--slate); }
.trust b { display: block; font: 700 30px var(--display); color: var(--navy); }
.services { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 0 72px; }
.svc { border: 1px solid #E3E8F0; border-radius: 6px; padding: 28px; display: grid; gap: 10px; }
.svc i { width: 36px; height: 4px; display: block; }
.svc h3 { margin: 6px 0 0; font: 700 21px var(--display); }
.svc p { margin: 0; font: 400 15px/1.55 var(--text); color: #4a5778; }
"""


def website_desktop():
    return f"""<div class="site" style="width:1440px;height:900px">
  <div class="nav">{logo('horizontal', 'farbig', height='46px')}
    <ul><li>Leistungen</li><li>Über uns</li><li>Wissen</li><li>Kontakt</li></ul>
    <span class="btn">Beratung vereinbaren</span></div>
  <div class="hero">
    <div><div class="eyebrow">Kreditberatung im Dreiländereck</div>
      <h1>Fair finanziert. Persönlich begleitet.</h1>
      <p>Wir finden den Kredit, der zu Ihrer finanziellen Situation passt – und sagen Ihnen ehrlich, wenn ein kleinerer oder gar kein Kredit die bessere Wahl ist.</p>
      <div class="ctas"><span class="btn">Beratung vereinbaren →</span><span class="btn ghost">Budget prüfen</span></div>
      <div style="font:400 12px var(--text);color:var(--slate);margin-top:22px">Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG).</div></div>
    <div class="visual">{iso_pattern(C['navy'], .07, 34, 'isow')}
      {icon_inline(style='width:250px;position:relative')}
      <div class="chip" style="left:36px;top:44px"><small>Privatkredit</small>Faire Konditionen</div>
      <div class="chip" style="right:36px;top:150px"><small>Umschuldung</small>Kosten senken</div>
      <div class="chip" style="left:60px;bottom:48px"><small>Budgetcheck</small>Tragbarkeit zuerst</div>
    </div>
  </div>
  <div class="services">
    <div class="svc"><i style="background:var(--blue)"></i><h3>Privatkredit</h3><p>Faire Konditionen, abgestimmt auf Ihr Budget – transparent bis zum letzten Franken.</p></div>
    <div class="svc"><i style="background:var(--slate)"></i><h3>Kreditablösung</h3><p>Bestehende Kredite zusammenfassen und Zinskosten spürbar senken.</p></div>
    <div class="svc"><i style="background:var(--red)"></i><h3>Ehrliche Beratung</h3><p>Wäre die Belastung zu hoch, raten wir zu einem kleineren oder zu keinem Kredit.</p></div>
  </div>
</div>"""


def website_mobile():
    return f"""<div class="site m" style="width:390px;height:844px;padding-top:48px">
  <div class="nav" style="padding:14px 22px 18px">{logo('horizontal', 'farbig', height='34px')}
    <span style="display:grid;gap:5px"><i style="width:24px;height:2px;background:var(--navy)"></i><i style="width:24px;height:2px;background:var(--navy)"></i><i style="width:16px;height:2px;background:var(--navy)"></i></span></div>
  <div style="padding:36px 22px 0">
    <div class="eyebrow" style="font-size:11px">Kreditberatung im Dreiländereck</div>
    <h1 style="font:700 38px/1.08 var(--display);letter-spacing:-.02em;margin:16px 0 16px">Fair finanziert. Persönlich begleitet.</h1>
    <p style="font:400 16px/1.6 var(--text);color:#4a5778;margin:0 0 24px">Der Kredit, der zu Ihrer Situation passt – oder ein ehrliches Nein.</p>
    <span class="btn" style="width:100%;justify-content:center">Beratung vereinbaren →</span>
    <div style="font:400 11px/1.4 var(--text);color:var(--slate);margin-top:14px">Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG).</div>
    <div class="visual" style="height:250px;margin-top:28px">{iso_pattern(C['navy'], .07, 26, 'isom')}{icon_inline(style='width:120px;position:relative')}</div>
  </div>
</div>"""


def build_website(r, out_dir: Path, work: Path):
    f = work / "web_desktop.html"
    f.write_text(page(website_desktop(), WEB_CSS), encoding="utf-8")
    r.html_png(f, 1440, 900, out_dir / "website_desktop_1440x900.png", scale=2)
    f = work / "web_mobile.html"
    f.write_text(page(website_mobile(), WEB_CSS), encoding="utf-8")
    r.html_png(f, 390, 844, out_dir / "website_mobile_390x844.png", scale=3)

    desk = (out_dir / "website_desktop_1440x900.png").as_uri()
    mob = (out_dir / "website_mobile_390x844.png").as_uri()
    css = f"""
body {{ width: 2400px; height: 1500px; background: linear-gradient(160deg, #EEF1F6 0%, #DCE2EC 100%); position: relative; overflow: hidden; }}
.browser {{ position: absolute; left: 140px; top: 150px; width: 1680px; border-radius: 14px; overflow: hidden; background: #fff; {SHADOW} }}
.bar {{ height: 52px; background: #F1F3F7; display: flex; align-items: center; gap: 10px; padding: 0 20px; border-bottom: 1px solid #E1E5EC; }}
.bar i {{ width: 13px; height: 13px; border-radius: 50%; background: #D5DAE3; }}
.url {{ margin-left: 24px; flex: 1; max-width: 560px; height: 30px; border-radius: 15px; background: #fff; font: 500 14px var(--text); color: #58637E; display: flex; align-items: center; padding: 0 16px; }}
.browser img {{ display: block; width: 1680px; }}
.phone {{ position: absolute; right: 150px; top: 380px; width: 440px; padding: 16px; border-radius: 60px; background: #0b1226; {SHADOW} }}
.phone img {{ display: block; width: 100%; border-radius: 46px; }}
.notch {{ position: absolute; left: 50%; top: 30px; transform: translateX(-50%); width: 120px; height: 32px; border-radius: 16px; background: #0b1226; }}
"""
    html = f"""<div class="browser"><div class="bar"><i></i><i></i><i></i><div class="url">dreilandfinanzen.ch</div></div><img src="{desk}"></div>
<div class="phone"><img src="{mob}"><div class="notch"></div></div>"""
    f = work / "web_mockup.html"
    f.write_text(page(html, css), encoding="utf-8")
    r.html_png(f, 2400, 1500, out_dir / "mockup_website.png")


# ---------------------------------------------------------------------------
# Social Media
# ---------------------------------------------------------------------------
SOCIAL_CSS = """
.sm { position: relative; overflow: hidden; }
.sm .tag { font: 600 26px var(--text); letter-spacing: .16em; text-transform: uppercase; }
.sm h2 { font: 700 92px/1.04 var(--display); letter-spacing: -.02em; margin: 0; }
"""


def social_assets():
    post1 = f"""<div class="sm" style="width:1080px;height:1080px;background:var(--ink);color:#fff;padding:90px">
  {iso_pattern('#FFFFFF', .06, 60, 'iso1')}
  <div style="position:relative;display:grid;height:100%;grid-template-rows:auto 1fr auto">
    {icon_inline(('#4F86C6', '#D9B566', '#E5484D'), 'width:120px')}
    <h2 style="align-self:center">Fair finanziert.<br>Persönlich begleitet.</h2>
    <div style="display:grid;gap:22px">
      <div style="display:flex;justify-content:space-between;align-items:end">
      <span class="tag" style="color:#8FB4E3">Kredit · Umschuldung · Budgetcheck</span>
      <span style="font:500 26px var(--text);color:#AFC0DD">{P['web']}</span></div>
      <span style="font:400 19px var(--text);color:#8FA0C2">Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG).</span></div>
  </div></div>"""
    post2 = f"""<div class="sm" style="width:1080px;height:1080px;background:#fff;color:var(--navy);padding:90px;display:grid;grid-template-rows:auto 1fr auto">
  <span class="tag" style="color:var(--red)">Unser Versprechen</span>
  <div style="align-self:center">
    <div style="font:800 190px/1 var(--display);color:var(--blue);letter-spacing:-.04em">Nein.</div>
    <h2 style="font-size:72px;margin-top:24px">Auch das kann eine ehrliche Beratung sein.</h2>
    <p style="font:400 30px/1.5 var(--text);color:#4a5778;margin:28px 0 0;max-width:26em">Wäre die Belastung zu hoch, raten wir Ihnen zu einem kleineren oder zu keinem Kredit.</p>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;border-top:2px solid #E3E8F0;padding-top:36px">
    {logo('horizontal', 'farbig', height='70px')}<span style="font:600 26px var(--text);color:var(--slate)">{P['web']}</span></div></div>"""
    story = f"""<div class="sm" style="width:1080px;height:1920px;background:linear-gradient(170deg,var(--navy),var(--ink));color:#fff;padding:140px 96px;display:grid;grid-template-rows:auto 1fr auto">
  {iso_pattern('#FFFFFF', .05, 70, 'iso2')}
  <div style="position:relative">{logo('horizontal', 'invertiert', height='96px')}</div>
  <div style="position:relative;align-self:center">
    <span class="tag" style="color:#8FB4E3">Kreditberatung in der Region Basel</span>
    <h2 style="font-size:112px;margin-top:36px">Ein Kredit, der zu Ihnen passt.</h2>
    <p style="font:400 40px/1.5 var(--text);color:#C9D5EA;margin:44px 0 0">Persönliche Beratung – vor Ort oder online.</p></div>
  <div style="position:relative;display:grid;gap:36px"><div style="background:#fff;color:var(--navy);border-radius:999px;padding:40px;text-align:center;font:700 40px var(--display)">Beratung vereinbaren</div>
  <div style="font:400 24px/1.4 var(--text);color:#8FA0C2;text-align:center">Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG).</div></div></div>"""
    banner = f"""<div class="sm" style="width:1584px;height:396px;background:var(--mist);display:flex;align-items:center;justify-content:flex-end;padding:0 110px">
  {iso_pattern(C['navy'], .06, 40, 'iso3')}
  <div style="position:absolute;left:0;top:0;bottom:0;width:440px;background:var(--navy)"></div>
  <div style="position:relative;text-align:right">
    <div style="font:700 50px/1.1 var(--display);color:var(--navy);letter-spacing:-.01em">Fair finanziert. Persönlich begleitet.</div>
    <div style="font:500 24px var(--text);color:var(--slate);margin-top:16px;letter-spacing:.06em">KREDITBERATUNG · UMSCHULDUNG · BUDGETCHECK · {P['web'].upper()}</div></div></div>"""
    profile = f"""<div class="sm" style="width:400px;height:400px;background:#fff;display:grid;place-items:center">
  {icon_inline(style='width:230px;transform:translateY(-4px)')}</div>"""
    return {"instagram-post_markenbotschaft_1080x1080": (post1, 1080, 1080),
            "instagram-post_versprechen_1080x1080": (post2, 1080, 1080),
            "instagram-story_1080x1920": (story, 1080, 1920),
            "linkedin-banner_1584x396": (banner, 1584, 396),
            "profilbild_400x400": (profile, 400, 400)}


def build_social(r, out_dir: Path, work: Path):
    sdir = out_dir / "Social-Media"
    for name, (html, w, h) in social_assets().items():
        f = work / f"{name}.html"
        f.write_text(page(html, SOCIAL_CSS), encoding="utf-8")
        r.html_png(f, w, h, sdir / f"{name}.png")
    u = {n: (sdir / f"{n}.png").as_uri() for n in social_assets()}
    css = f"""
body {{ width: 2400px; height: 1500px; background: linear-gradient(160deg, #EEF1F6, #D8DFEA); position: relative; overflow: hidden; }}
img {{ position: absolute; display: block; {SHADOW} }}
.phone {{ position: absolute; left: 140px; top: 120px; width: 600px; padding: 18px; border-radius: 70px; background: #0b1226; {SHADOW} }}
.phone img {{ position: static; width: 100%; border-radius: 54px; box-shadow: none; }}
.li {{ position: absolute; left: 860px; top: 120px; width: 1400px; background: #fff; border-radius: 10px; overflow: hidden; {SHADOW} }}
.li img {{ position: static; width: 100%; box-shadow: none; }}
.li .pp {{ position: absolute; left: 48px; top: 230px; width: 190px; height: 190px; border-radius: 50%; border: 6px solid #fff; overflow: hidden; background: #fff; }}
.li .pp img {{ width: 100%; }}
.li .meta {{ padding: 110px 48px 40px; font: 400 22px var(--text); color: #58637E; }}
.li .meta b {{ display: block; font: 700 36px var(--display); color: var(--navy); margin-bottom: 6px; }}
"""
    html = f"""<div class="phone"><img src="{u['instagram-story_1080x1920']}"></div>
<div class="li"><img src="{u['linkedin-banner_1584x396']}"><div class="pp"><img src="{u['profilbild_400x400']}"></div>
<div class="meta"><b>Dreiland Finanzen</b>Kreditberatung · Basel, Schweiz</div></div>
<img src="{u['instagram-post_markenbotschaft_1080x1080']}" style="left:860px;top:760px;width:640px">
<img src="{u['instagram-post_versprechen_1080x1080']}" style="left:1620px;top:760px;width:640px">"""
    f = work / "social_mockup.html"
    f.write_text(page(html, css), encoding="utf-8")
    r.html_png(f, 2400, 1500, out_dir / "mockup_social-media.png")


def build(r):
    from build import D_MOCK, WORK
    D_MOCK.mkdir(parents=True, exist_ok=True)
    build_card(r, D_MOCK, WORK)
    build_letter(r, D_MOCK, WORK)
    build_website(r, D_MOCK, WORK)
    build_social(r, D_MOCK, WORK)
    print("mockups ok")
