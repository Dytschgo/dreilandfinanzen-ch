"""Drei Branding-Anwendungsrichtungen: Swiss Corporate, Premium Finance, Digital Finance."""
from __future__ import annotations

from common import C, icon_inline, iso_pattern, logo, page

DARK_ICON = ("#4F86C6", "#D9B566", "#E5484D")

BASE = """
@page { size: 1920px 1080px; margin: 0; }
.board { width: 1920px; height: 1080px; position: relative; overflow: hidden; display: grid; grid-template-columns: 560px 1fr; break-after: page; }
.side { padding: 80px 64px; display: flex; flex-direction: column; gap: 34px; position: relative; }
.num { font: 600 15px var(--text); letter-spacing: .2em; text-transform: uppercase; }
.side h1 { margin: 10px 0 0; font-size: 58px; line-height: 1.02; }
.side p { margin: 0; font: 400 17px/1.6 var(--text); }
.sw { display: flex; height: 92px; border-radius: 3px; overflow: hidden; }
.sw div { display: flex; align-items: flex-end; padding: 10px; font: 600 11px var(--text); letter-spacing: .04em; }
.kw { display: flex; flex-wrap: wrap; gap: 8px; }
.kw span { font: 500 13px var(--text); padding: 7px 12px; border-radius: 99px; }
.typo { display: grid; gap: 6px; }
.typo .a { font-size: 44px; line-height: 1; }
.typo small { font: 500 12px var(--text); letter-spacing: .08em; text-transform: uppercase; opacity: .7; }
.main { position: relative; padding: 64px; }
.foot { margin-top: auto; font: 500 12px var(--text); letter-spacing: .06em; opacity: .6; }
"""


def swiss():
    return f"""<section class="board" style="background:#fff;color:var(--navy)">
<div class="side" style="border-right:1px solid #E3E8F0">
  <div><div class="num" style="color:var(--red)">Richtung 01</div><h1 style="font-family:var(--display);font-weight:700">Swiss Corporate</h1></div>
  <p style="color:#4a5778">Sachlich, transparent, verlässlich. Strenges Raster, viel Weissraum und linksbündige Typografie in der Tradition der Schweizer Grafik. Konditionen und Kosten werden vollständig und klar dargestellt – Transparenz als Gestaltungsprinzip. Rot setzt gezielte Akzente.</p>
  <div class="sw"><div style="flex:5;background:#fff;box-shadow:inset 0 0 0 1px #E3E8F0;color:var(--slate)">Weiss 60%</div><div style="flex:3;background:var(--navy);color:#fff">Navy 25%</div><div style="flex:1.2;background:var(--mist);color:var(--slate)">Nebel</div><div style="flex:.8;background:var(--red)"></div></div>
  <div class="typo"><small>Montserrat Bold · Inter Regular</small><div class="a" style="font-family:var(--display);font-weight:700">Klarheit 1'250.–</div><div style="font:400 17px var(--text);color:#4a5778">Zahlen ehrlich zeigen: tabellarische Ziffern, präzise Hierarchie, keine Kleingedruckt-Tricks.</div></div>
  <div class="kw">{''.join(f'<span style="background:var(--mist)">{k}</span>' for k in ('Transparent', 'Kompetent', 'Ehrlich', 'Verantwortungsbewusst', 'Regional verwurzelt'))}</div>
  <div class="foot">Einsatz: Offerten, Kreditunterlagen, Briefschaften, Website</div>
</div>
<div class="main" style="background:var(--mist)">
  <div style="position:absolute;inset:0;background-image:linear-gradient(to right, rgba(6,43,99,.06) 1px, transparent 1px);background-size:113.6px 100%;margin-left:64px"></div>
  <!-- Geschäftsbericht -->
  <div style="position:absolute;left:64px;top:64px;width:560px;height:792px;background:#fff;box-shadow:0 30px 60px -20px rgba(3,26,61,.3);padding:56px;display:flex;flex-direction:column">
    {logo('horizontal', 'farbig', height='52px')}
    <div style="margin-top:auto;border-top:6px solid var(--red);width:80px"></div>
    <div style="font:700 80px/0.98 var(--display);letter-spacing:-.03em;margin-top:24px">Kredit mit Augen&shy;mass.</div>
    <div style="font:600 30px/1.2 var(--display);margin-top:20px">Ratgeber 2026</div>
    <div style="font:400 16px var(--text);color:var(--slate);margin-top:8px">Privatkredit · Umschuldung · Budget</div>
  </div>
  <!-- Website-Header -->
  <div style="position:absolute;left:672px;top:64px;right:64px;height:420px;background:#fff;box-shadow:0 30px 60px -20px rgba(3,26,61,.25);overflow:hidden">
    <div style="display:flex;justify-content:space-between;align-items:center;padding:22px 36px;border-bottom:1px solid #E6EAF1">{logo('horizontal', 'farbig', height='34px')}<span style="font:500 13px var(--text);color:var(--slate);letter-spacing:.06em">LEISTUNGEN · ÜBER UNS · KONTAKT</span></div>
    <div style="padding:48px 36px;display:grid;grid-template-columns:1fr 1fr;gap:32px">
      <div style="font:700 44px/1.05 var(--display);letter-spacing:-.02em">Transparenz bis zum letzten Franken.</div>
      <div style="display:grid;gap:18px">{''.join(f'<div style="border-top:1px solid #D9DFEA;padding-top:12px;display:flex;justify-content:space-between;font:500 16px var(--text)"><span>{a}</span><b style="font-family:var(--display)">{b}</b></div>' for a, b in (('Kreditbetrag', "CHF 15'000.–"), ('Laufzeit', '48 Monate'), ('Monatsrate', 'CHF 372.60'), ('Eff. Jahreszins', '8.9 %')))}</div>
    </div>
    <div style="position:absolute;left:36px;bottom:0;width:120px;height:6px;background:var(--red)"></div>
  </div>
  <!-- Plakat -->
  <div style="position:absolute;left:672px;top:520px;width:350px;height:336px;background:var(--navy);color:#fff;padding:32px;display:flex;flex-direction:column;box-shadow:0 30px 60px -20px rgba(3,26,61,.35)">
    {icon_inline(DARK_ICON, 'width:56px')}
    <div style="margin-top:auto;font:700 34px/1.05 var(--display)">Lieber ehrlich als teuer.</div>
  </div>
  <div style="position:absolute;left:1046px;top:520px;right:64px;height:336px;background:#fff;padding:32px;box-shadow:0 30px 60px -20px rgba(3,26,61,.2)">
    <div class="num" style="color:var(--red);font-size:12px">Tragbarkeit · Rate im Verhältnis zum Budget</div>
    <svg viewBox="0 0 520 220" preserveAspectRatio="none" style="width:100%;height:220px;margin-top:16px">{''.join(f'<rect x="{i*74+8}" y="{220-h}" width="44" height="{h}" fill="{"#CE2530" if i==5 else "#062B63"}"/>' for i, h in enumerate((70, 92, 108, 124, 150, 196, 0)) if h)}<line x1="0" y1="219.5" x2="520" y2="219.5" stroke="#062B63"/></svg>
  </div>
  <div style="position:absolute;left:64px;bottom:64px;font:500 12px var(--text);letter-spacing:.06em;color:var(--slate)">Rechenbeispiel mit Platzhalterwerten · Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG).</div>
</div></section>"""


def premium():
    gold = "#D9B566"
    return f"""<section class="board" style="background:var(--ink);color:#fff">
{iso_pattern('#D9B566', .05, 54, 'isop')}
<div class="side" style="border-right:1px solid rgba(217,181,102,.25)">
  <div><div class="num" style="color:{gold}">Richtung 02</div><h1 style="font-family:var(--serif);font-weight:500;letter-spacing:-.01em">Premium Finance</h1></div>
  <p style="color:#C9D5EA">Ruhig, kompetent, persönlich. Tiefes Nachtblau als Bühne, Gold als feine Linie und Auszeichnung. Eine Serifenschrift für Headlines bringt Wertigkeit – für Beratungsunterlagen, Termine und Präsentationen, also überall dort, wo Vertrauen entsteht.</p>
  <div class="sw"><div style="flex:5;background:#031A3D;box-shadow:inset 0 0 0 1px rgba(255,255,255,.15);color:#AFC0DD">Nachtblau 65%</div><div style="flex:2;background:var(--navy);color:#fff">Navy</div><div style="flex:1.2;background:{gold};color:var(--ink)">Gold</div><div style="flex:.6;background:#F4EFE4"></div></div>
  <div class="typo"><small>Source Serif 4 · Inter Light</small><div class="a" style="font-family:var(--serif);font-weight:400;font-style:italic">Kredit mit Augenmass</div><div style="font:300 17px var(--text);color:#C9D5EA;letter-spacing:.02em">Grosszügige Abstände, feine Haarlinien, zurückhaltende Gesten.</div></div>
  <div class="kw">{''.join(f'<span style="border:1px solid rgba(217,181,102,.45);color:{gold}">{k}</span>' for k in ('Vertrauenswürdig', 'Kompetent', 'Persönlich', 'Verantwortungsbewusst', 'Diskret'))}</div>
  <div class="foot" style="color:#C9D5EA">Einsatz: Beratungsmappe, Terminbestätigung, Präsentationen · Bildmarke in Gold nur als Prägung</div>
</div>
<div class="main">
  <!-- Broschüre -->
  <div style="position:absolute;left:64px;top:64px;width:520px;height:736px;background:linear-gradient(160deg,#0A2450,#031A3D);border:1px solid rgba(217,181,102,.35);box-shadow:0 40px 80px -20px rgba(0,0,0,.6);padding:56px;display:flex;flex-direction:column;align-items:center;text-align:center">
    <div style="width:1px;height:110px;background:linear-gradient({gold},transparent)"></div>
    {icon_inline(('#C69D49', '#E2C88C', '#A87F35'), 'width:120px;margin-top:40px')}
    <div style="font:400 46px/1.1 var(--serif);margin-top:60px">Kredit mit<br><i>Augenmass</i></div>
    <div style="width:48px;height:1px;background:{gold};margin:32px 0"></div>
    <div style="font:500 13px var(--text);letter-spacing:.3em;color:{gold}">DREILAND FINANZEN</div>
    <div style="margin-top:auto;font:300 13px var(--text);letter-spacing:.2em;color:#AFC0DD">BASEL · MMXXVI</div>
  </div>
  <!-- Einladung -->
  <div style="position:absolute;left:640px;top:64px;right:64px;height:400px;background:#F4EFE4;color:var(--ink);box-shadow:0 40px 80px -20px rgba(0,0,0,.6);padding:52px 56px;display:grid;grid-template-columns:1fr auto;gap:32px">
    <div>
      <div style="font:500 12px var(--text);letter-spacing:.3em;color:#9A7A36">IHR BERATUNGSTERMIN</div>
      <div style="font:400 44px/1.1 var(--serif);margin-top:20px">Persönliches<br><i>Beratungsgespräch</i></div>
      <div style="font:400 17px/1.6 var(--text);color:#46506A;margin-top:24px">Donnerstag, 19. November 2026, 14.00 Uhr<br>Wir nehmen uns Zeit für Ihr Budget.</div>
    </div>
    {logo('vertikal', 'farbig', height='120px')}
  </div>
  <!-- Zitat -->
  <div style="position:absolute;left:640px;top:500px;right:64px;height:300px;border:1px solid rgba(217,181,102,.35);padding:48px 56px;display:flex;flex-direction:column;justify-content:center">
    <div style="font:400 38px/1.3 var(--serif);font-style:italic">«Ein guter Kredit ist einer, den man sich auch morgen noch leisten kann.»</div>
    <div style="font:500 13px var(--text);letter-spacing:.2em;color:{gold};margin-top:24px">— LEITSATZ (BEISPIEL)</div>
  </div>
  <div style="position:absolute;left:64px;bottom:64px;right:64px;display:flex;justify-content:space-between;align-items:center">{logo('horizontal', 'darkmode', height='44px')}<span style="font:300 13px var(--text);letter-spacing:.2em;color:#AFC0DD">GOLD NUR ALS AKZENT · MAX. 10 %</span></div>
</div></section>"""


def digital():
    chart2 = "M0 20 L 140 64 L 280 106 L 420 147 L 560 186"
    return f"""<section class="board" style="background:#F6F8FC;color:var(--navy)">
<div class="side">
  <div><div class="num" style="color:var(--blue)">Richtung 03</div><h1 style="font-family:var(--display);font-weight:800;letter-spacing:-.03em">Digital Finance</h1></div>
  <p style="color:#4a5778">Nahbar, transparent, interaktiv. Helle Oberflächen, weiche Radien und das Blau der Bildmarke als Interaktionsfarbe. Budgetcheck und Kreditrechner machen die Tragbarkeit sichtbar – bevor ein Kredit beantragt wird.</p>
  <div class="sw" style="border-radius:14px"><div style="flex:4;background:#F6F8FC;box-shadow:inset 0 0 0 1px #E1E7F0;color:var(--slate)">Hell 55%</div><div style="flex:2.2;background:var(--blue);color:#fff">Blau</div><div style="flex:1.2;background:var(--navy);color:#fff">Navy</div><div style="flex:.7;background:var(--gold)"></div><div style="flex:.7;background:var(--red)"></div></div>
  <div class="typo"><small>Montserrat ExtraBold · Inter Medium</small><div class="a" style="font-family:var(--display);font-weight:800;letter-spacing:-.03em">CHF 372.60 / Mt.</div><div style="font:500 17px var(--text);color:#4a5778">UI-Texte in Inter, Zahlen mit tabellarischen Ziffern.</div></div>
  <div class="kw">{''.join(f'<span style="background:#fff;box-shadow:0 0 0 1px #E1E7F0">{k}</span>' for k in ('Nahbar', 'Transparent', 'Kundenorientiert', 'Ehrlich', 'Barrierefrei'))}</div>
  <div class="foot">Einsatz: Kreditrechner, Kundenportal, Newsletter, Social Media, Online-Termine</div>
</div>
<div class="main">
  <div style="position:absolute;inset:0;opacity:.9">{iso_pattern(C['blue'], .07, 46, 'isod')}</div>
  <!-- Phone -->
  <div style="position:absolute;left:64px;top:56px;width:400px;height:820px;border-radius:52px;background:#0b1226;padding:14px;box-shadow:0 40px 80px -24px rgba(3,26,61,.45)">
    <div style="width:100%;height:100%;border-radius:40px;background:#fff;overflow:hidden;padding:56px 22px 22px;display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;justify-content:space-between;align-items:center">{icon_inline(style='width:34px')}<span style="width:36px;height:36px;border-radius:50%;background:var(--mist);display:grid;place-items:center;font:600 13px var(--text)">EM</span></div>
      <div style="font:500 14px var(--text);color:var(--slate)">Grüezi, Erika</div>
      <div style="background:linear-gradient(135deg,#0A4682,#062B63);color:#fff;border-radius:22px;padding:22px">
        <div style="font:500 13px var(--text);opacity:.8">Ihr Budgetcheck</div>
        <div style="font:800 34px var(--display);letter-spacing:-.02em;margin-top:6px">CHF 450 / Mt.</div>
        <div style="font:600 13px var(--text);color:#9FE0B5;margin-top:4px">✓ maximal tragbare Rate</div>
        <div style="margin-top:18px;height:10px;border-radius:5px;background:rgba(255,255,255,.18)"><div style="width:83%;height:100%;border-radius:5px;background:#D9B566"></div></div><div style="display:flex;justify-content:space-between;font:500 12px var(--text);opacity:.8;margin-top:8px"><span>Rate CHF 372.60</span><span>83 %</span></div>
      </div>
      {''.join(f'<div style="display:flex;align-items:center;gap:14px;padding:14px;border-radius:16px;background:#F6F8FC"><i style="width:10px;height:38px;border-radius:5px;background:{c}"></i><div style="flex:1"><div style="font:600 15px var(--text)">{a}</div><div style="font:500 12px var(--text);color:var(--slate)">{b}</div></div><b style="font:700 15px var(--display)">{v}</b></div>' for c, a, b, v in (('var(--blue)', 'Wunschbetrag', 'Ihre Anfrage', "20'000"), ('var(--gold)', 'Empfehlung', 'tragbar', "15'000"), ('var(--navy)', 'Laufzeit', 'Monate', "48")))}
      <div style="margin-top:auto;background:var(--blue);color:#fff;border-radius:14px;padding:16px;text-align:center;font:600 15px var(--text)">Beratung vereinbaren</div>
    </div>
  </div>
  <!-- Dashboard -->
  <div style="position:absolute;left:520px;top:56px;right:64px;height:440px;background:#fff;border-radius:22px;box-shadow:0 30px 60px -24px rgba(3,26,61,.3);padding:32px;display:grid;grid-template-columns:1fr 280px;gap:28px">
    <div><div style="font:700 22px var(--display)">Restschuld über die Laufzeit</div><div style="font:500 14px var(--text);color:var(--slate);margin-top:4px">Rechenbeispiel · CHF 15'000 · 48 Monate · Platzhalterwerte</div>
      <svg viewBox="0 0 560 190" style="width:100%;height:300px;margin-top:16px"><defs><linearGradient id="gd" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0A4682" stop-opacity=".25"/><stop offset="1" stop-color="#0A4682" stop-opacity="0"/></linearGradient></defs>
      {''.join(f'<line x1="0" x2="560" y1="{y}" y2="{y}" stroke="#E8EDF4"/>' for y in (30, 75, 120, 165))}<path d="{chart2} L560 190 L0 190Z" fill="url(#gd)"/><path d="{chart2}" fill="none" stroke="#0A4682" stroke-width="4" stroke-linecap="round"/><circle cx="560" cy="186" r="7" fill="#fff" stroke="#0A4682" stroke-width="4"/></svg></div>
    <div style="display:grid;gap:14px;align-content:start">
      <div style="font:600 13px var(--text);color:var(--slate);letter-spacing:.06em">MONATSBUDGET</div>
      <svg viewBox="0 0 42 42" style="width:170px;justify-self:center"><circle cx="21" cy="21" r="15.9" fill="none" stroke="#0A4682" stroke-width="6" stroke-dasharray="62 38" stroke-dashoffset="25"/><circle cx="21" cy="21" r="15.9" fill="none" stroke="#C69D49" stroke-width="6" stroke-dasharray="8 92" stroke-dashoffset="63"/><circle cx="21" cy="21" r="15.9" fill="none" stroke="#9FB4D4" stroke-width="6" stroke-dasharray="30 70" stroke-dashoffset="55"/></svg>
      {''.join(f'<div style="display:flex;justify-content:space-between;font:500 14px var(--text)"><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:{c};margin-right:8px"></i>{a}</span><b>{p}</b></div>' for c, a, p in (('#0A4682', 'Fixkosten', '62 %'), ('#C69D49', 'Kreditrate', '8 %'), ('#9FB4D4', 'Spielraum', '30 %')))}
    </div>
  </div>
  <!-- Notification + Social -->
  <div style="position:absolute;left:520px;top:532px;width:520px;height:120px;background:#fff;border-radius:20px;box-shadow:0 30px 60px -24px rgba(3,26,61,.3);display:flex;gap:18px;align-items:center;padding:22px">
    <div style="width:64px;height:64px;border-radius:16px;background:#fff;box-shadow:0 0 0 1px #E1E7F0;display:grid;place-items:center">{icon_inline(style='width:40px')}</div>
    <div><div style="font:700 16px var(--text)">Dreiland Finanzen · jetzt</div><div style="font:400 15px var(--text);color:#4a5778;margin-top:4px">Ihre Offerte ist bereit – angepasst an Ihr Budget.</div></div>
  </div>
  <div style="position:absolute;left:520px;top:688px;width:520px;height:188px;border-radius:20px;background:var(--blue);color:#fff;padding:28px;overflow:hidden">
    <div style="position:absolute;right:-30px;bottom:-40px;opacity:.25">{icon_inline(('#fff', '#fff', '#fff'), 'width:220px')}</div>
    <div style="font:800 32px/1.1 var(--display);letter-spacing:-.02em;position:relative">Budgetcheck<br>in 3 Minuten.</div>
    <div style="font:600 14px var(--text);margin-top:16px;position:relative;opacity:.85">dreilandfinanzen.ch/budgetcheck</div>
  </div>
  <div style="position:absolute;left:1076px;top:532px;right:64px;height:344px;border-radius:22px;background:var(--navy);color:#fff;padding:30px;display:flex;flex-direction:column;gap:14px">
    <div style="font:600 13px var(--text);letter-spacing:.08em;color:#AFC0DD">STATUS-SYSTEM</div>
    {''.join(f'<div style="display:flex;align-items:center;gap:12px;font:500 15px var(--text)"><i style="width:12px;height:12px;border-radius:50%;background:{c}"></i>{t}</div>' for c, t in (('#4F86C6', 'Information / Interaktion'), ('#D9B566', 'Hinweis / Empfehlung'), ('#E5484D', 'Warnung / Frist')))}
    <div style="margin-top:auto;font:500 13px/1.5 var(--text);color:#AFC0DD">Rot nie als einzige Kennzeichnung – immer mit Icon oder Text kombinieren.</div>
  </div>
</div></section>"""


def build(r):
    from build import D_DIR, WORK
    D_DIR.mkdir(parents=True, exist_ok=True)
    boards = {"01_swiss-corporate": swiss(), "02_premium-finance": premium(), "03_digital-finance": digital()}
    for name, html in boards.items():
        f = WORK / f"richtung_{name}.html"
        f.write_text(page(html, BASE, name), encoding="utf-8")
        r.html_png(f, 1920, 1080, D_DIR / f"richtung_{name}.png", scale=1.5)
    f = WORK / "richtungen_alle.html"
    f.write_text(page("".join(boards.values()), BASE, "Anwendungsrichtungen"), encoding="utf-8")
    r.html_pdf(f, D_DIR / "dreiland-finanzen_anwendungsrichtungen.pdf")
    print("richtungen ok")
