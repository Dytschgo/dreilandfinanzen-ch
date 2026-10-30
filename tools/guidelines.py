"""Brand Guidelines (PDF, A4 quer)."""
from __future__ import annotations

from brand import COLORS, DARK, DIVIDER, icon_polygons, poly_points
from colors import contrast, palette
from common import C, icon_inline, iso_pattern, logo, page
from logos import ICON_H, ICON_W, IX0, IY0, size as logo_size, svg as logo_svg

LEGAL = "Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG)."
X_UNIT = 51.6 - 26.8  # senkrechte Aussenkante der blauen Fläche (Quell-Einheiten)

CSS = """
@page { size: 297mm 210mm; margin: 0; }
.pg { width: 297mm; height: 210mm; padding: 16mm 18mm 14mm; position: relative; overflow: hidden; break-after: page; display: flex; flex-direction: column; background: #fff; }
.hd { display: flex; justify-content: space-between; font: 600 7.5pt var(--text); letter-spacing: .16em; text-transform: uppercase; color: var(--slate); }
.hd b { color: var(--red); font-weight: 600; }
.ft { position: absolute; left: 18mm; right: 18mm; bottom: 8mm; display: flex; justify-content: space-between; font: 500 7pt var(--text); color: #8a94ad; letter-spacing: .04em; }
h1 { font: 700 30pt/1.05 var(--display); letter-spacing: -.02em; margin: 8mm 0 3mm; }
h2 { font: 700 13pt var(--display); margin: 0 0 2mm; }
h3 { font: 600 8pt var(--text); letter-spacing: .14em; text-transform: uppercase; color: var(--slate); margin: 0 0 2mm; }
p, li { font: 400 9.5pt/1.55 var(--text); color: #34405e; margin: 0 0 2.5mm; }
.lead { font-size: 11.5pt; max-width: 150mm; color: #34405e; }
.grid { display: grid; gap: 6mm; flex: 1; min-height: 0; }
.tile { border-radius: 1.5mm; display: grid; place-items: center; position: relative; padding: 8mm; }
.cap { font: 500 8pt var(--text); color: var(--slate); margin-top: 2mm; }
.note { background: #FFF7E6; border-left: 1.2mm solid var(--gold); padding: 4mm 5mm; border-radius: 1mm; }
.note p { color: #4d3d14; }
table { border-collapse: collapse; width: 100%; font: 400 8.5pt var(--text); color: #34405e; }
td, th { text-align: left; padding: 2.2mm 3mm 2.2mm 0; border-bottom: .25mm solid #E3E8F0; vertical-align: top; }
th { font: 600 7pt var(--text); letter-spacing: .12em; text-transform: uppercase; color: var(--slate); }
.ok { color: #1d7a46; font-weight: 600; } .warn { color: #a3670b; font-weight: 600; } .no { color: var(--red); font-weight: 600; }
.x { position: absolute; right: 3mm; top: 3mm; width: 7mm; height: 7mm; border-radius: 50%; background: var(--red); color: #fff; display: grid; place-items: center; font: 700 10pt var(--text); }
.chk { background: #1d7a46; }
img.shot { width: 100%; height: 100%; object-fit: cover; border-radius: 1.5mm; display: block; box-shadow: 0 0 0 .25mm #E3E8F0; }
.kw { display: flex; flex-wrap: wrap; gap: 2mm; }
.kw span { font: 500 9pt var(--text); padding: 1.8mm 3.6mm; border-radius: 99px; background: var(--mist); color: var(--navy); }
"""

TOTAL = 18


def frame(n, section, body, dark=False):
    style = ' style="background:var(--ink);color:#fff"' if dark else ""
    return (f'<section class="pg"{style}><div class="hd"><span><b>{n:02d}</b> &nbsp; {section}</span>'
            f'<span>Dreiland Finanzen · Brand Guidelines</span></div>{body}'
            f'<div class="ft"><span>Version 1.0 · Oktober 2026</span><span>{n} / {TOTAL}</span></div></section>')


def cover():
    return f"""<section class="pg" style="background:var(--ink);color:#fff;padding:0">
  {iso_pattern('#FFFFFF', .05, 46, 'isocov')}
  <div style="position:relative;flex:1;display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:0 22mm">
    <div>{logo('horizontal', 'darkmode', width='120mm')}</div>
    <div style="border-left:.3mm solid rgba(255,255,255,.25);padding-left:14mm">
      <div style="font:600 8pt var(--text);letter-spacing:.2em;color:#D9B566">MARKENHANDBUCH</div>
      <div style="font:700 40pt/1 var(--display);margin:5mm 0">Brand<br>Guidelines</div>
      <div style="font:400 11pt var(--text);color:#C9D5EA">Logo · Farben · Typografie · Tonalität · Anwendungen</div>
      <div style="font:400 9pt var(--text);color:#8FA0C2;margin-top:10mm">Version 1.0 · Oktober 2026</div>
    </div>
  </div>
  <div style="position:relative;display:grid;grid-template-columns:3fr 1fr 1fr;height:3mm"><span style="background:#4F86C6"></span><span style="background:#D9B566"></span><span style="background:#E5484D"></span></div>
</section>"""


def p_intro():
    toc = ["Über dieses Dokument", "Markenkern", "Tonalität & Pflichthinweis", "Das Logo", "Logo-Varianten",
           "Farbvarianten", "Schutzraum & Mindestgrössen", "Konstruktion", "Fehlanwendungen", "Farbpalette",
           "Kontrast & Barrierefreiheit", "Typografie", "Bewegung", "Anwendungen", "Anwendungsrichtungen",
           "Dateien & Formate"]
    items = "".join(f'<li style="display:flex;gap:4mm;border-bottom:.25mm solid #E3E8F0;padding:1.5mm 0;margin:0"><b style="color:var(--red);width:7mm">{i+2:02d}</b>{t}</li>' for i, t in enumerate(toc))
    return frame(2, "Einleitung", f"""
<div class="grid" style="grid-template-columns:1.1fr 1fr;margin-top:6mm">
  <div><h1>Über dieses Dokument</h1>
    <p class="lead">Dieses Handbuch beschreibt, wie die Marke Dreiland Finanzen eingesetzt wird – damit sie überall gleich vertrauenswürdig, klar und wiedererkennbar auftritt: auf Papier, am Bildschirm und im persönlichen Gespräch.</p>
    <div class="note" style="margin-top:6mm"><h3 style="color:#8a6514">Wichtiger Hinweis zur Rekonstruktion</h3>
      <p>Grundlage ist eine Rastervorlage von 361 × 143 px. Die Bildmarke wurde daraus vektorisiert und auf exakte 30°-Winkel idealisiert.</p>
      <p><b>Schrift:</b> Die Originalschrift ist nicht bekannt. Montserrat Bold / Regular ist eine Annäherung aus dem Raster; im Logo ist sie in Pfade umgewandelt.</p>
      <p style="margin:0"><b>Farben:</b> Aus Pixeln gemessen (Kompressionsartefakte möglich) – Annäherung. CMYK rechnerisch, Pantone unverbindlich. Vor der Druckproduktion Originaldaten beim Urheber anfragen oder einen Farbproof erstellen.</p></div>
  </div>
  <ol style="list-style:none;padding:0;margin:14mm 0 0;font:400 9.5pt var(--text);color:var(--navy)">{items}</ol>
</div>""")


def p_kern():
    kws = ["Vertrauenswürdig", "Kompetent", "Persönlich", "Nahbar", "Transparent", "Ehrlich",
           "Verantwortungsbewusst", "Kundenorientiert", "Regional verwurzelt"]
    return frame(3, "Markenkern", f"""
<h1>Markenkern</h1>
<div class="grid" style="grid-template-columns:1.25fr 1fr;margin-top:4mm">
  <div style="display:grid;gap:6mm;align-content:start">
    <div style="background:var(--navy);color:#fff;border-radius:1.5mm;padding:9mm">
      <h3 style="color:#D9B566">Unser Versprechen (USP)</h3>
      <div style="font:700 17pt/1.25 var(--display)">Wir setzen uns für faire Kreditbedingungen ein, die zur finanziellen Situation unserer Kundinnen und Kunden passen.</div>
      <p style="color:#C9D5EA;margin:5mm 0 0;font-size:10.5pt">Wir begleiten sie persönlich und raten auch zu einem kleineren oder keinem Kredit, wenn die Belastung zu hoch wäre.</p>
    </div>
    <div><h3>Claim-Vorschläge</h3>
      <p style="font:700 14pt var(--display);color:var(--navy);margin:0 0 2mm">Fair finanziert. Persönlich begleitet.</p>
      <p style="margin:0">Alternativen: «Kredit mit Augenmass.» · «Lieber ehrlich als teuer.» · «Ein Kredit, der zu Ihnen passt.»</p></div>
  </div>
  <div style="display:grid;gap:6mm;align-content:start">
    <div><h3>Markenwerte</h3><div class="kw">{''.join(f'<span>{k}</span>' for k in kws)}</div></div>
    <div><h3>Lesart der Bildmarke</h3><p>Drei Flächen fügen sich zu einer Form: Dreiländereck und regionale Verwurzelung – und zugleich Kundin, Beratung und Kredit, die zusammenpassen müssen. Die Lücken zwischen den Flächen stehen für Offenheit und Transparenz.</p></div>
    <div><h3>Wofür wir stehen</h3><p>Tragbarkeit vor Abschluss. Klare Zahlen statt Kleingedrucktes. Persönliche Begleitung statt anonymer Antragsstrecke.</p></div>
  </div>
</div>""")


def p_ton():
    rows = [("Wir rechnen Ihr Budget gemeinsam durch.", "Sofortkredit ohne Fragen – jetzt zugreifen!"),
            ("Wäre die Rate zu hoch, sagen wir es Ihnen offen.", "Geld in 24 Stunden auf Ihrem Konto!"),
            ("Monatsrate CHF 372.60, eff. Jahreszins 8.9 %, Gesamtkosten CHF 2'884.80.", "Ab nur CHF 9.90 pro Tag!*"),
            ("Ein Kredit, der zu Ihnen passt.", "Gönn dir jetzt, was du willst!")]
    tr = "".join(f'<tr><td class="ok">✓ {a}</td><td class="no">✕ {b}</td></tr>' for a, b in rows)
    return frame(4, "Tonalität & Pflichthinweis", f"""
<h1>Tonalität</h1>
<div class="grid" style="grid-template-columns:1fr 1.2fr;margin-top:3mm">
  <div>
    <p class="lead">Wir sprechen wie eine gute Beraterin, ein guter Berater am Tisch: ruhig, klar, auf Augenhöhe.</p>
    <ul style="padding-left:4mm;margin:4mm 0">
      <li><b>Sie-Form</b>, kurze Sätze, aktive Verben.</li>
      <li><b>Zahlen vollständig:</b> Betrag, Laufzeit, Rate, effektiver Jahreszins, Gesamtkosten.</li>
      <li><b>Kein Druck:</b> keine künstliche Dringlichkeit, keine Lockvogel-Angebote.</li>
      <li><b>Schweizer Rechtschreibung:</b> ss statt ß, «Guillemets», CHF 15'000.–.</li>
    </ul>
    <div style="background:var(--navy);color:#fff;border-radius:1.5mm;padding:6mm">
      <h3 style="color:#D9B566">Pflichthinweis in jeder Kreditwerbung</h3>
      <div style="font:600 11pt/1.4 var(--text)">«{LEGAL}»</div>
      <p style="color:#AFC0DD;margin:3mm 0 0;font-size:8pt">Zudem ist aggressive Werbung für Konsumkredite verboten (Art. 36a KKG). Werbemittel vor Veröffentlichung rechtlich prüfen lassen.</p>
    </div>
  </div>
  <div><table><tr><th>So schreiben wir</th><th>So nicht</th></tr>{tr}</table>
  <p style="font-size:8pt;color:var(--slate);margin-top:3mm">Zahlen in den Beispielen sind Platzhalter.</p></div>
</div>""")


def p_logo():
    return frame(5, "Das Logo", f"""
<h1>Das Logo</h1>
<div class="grid" style="grid-template-columns:2fr 1fr;margin-top:3mm">
  <div class="tile" style="background:var(--mist)">{logo('horizontal', 'farbig', width='150mm')}</div>
  <div style="display:grid;gap:5mm;align-content:center">
    <div><h2><span style="color:var(--red)">A</span> Bildmarke</h2><p>Drei isometrische Flächen in Rhein Blau, Basler Gold und Grenz Rot. Die weissen Fugen sind Teil der Marke.</p></div>
    <div><h2><span style="color:var(--red)">B</span> Trennlinie</h2><p>Feine senkrechte Linie in Schiefer. Sie gliedert Bild- und Wortmarke und entfällt in der vertikalen Version.</p></div>
    <div><h2><span style="color:var(--red)">C</span> Wortmarke</h2><p>«Dreiland» kräftig, «Finanzen» leicht und gesperrt auf gleicher Breite. Immer als Pfad verwenden, nie neu setzen.</p></div>
    <p style="font-size:8pt;color:var(--slate)">Das horizontale Logo ist die Primärversion und entspricht der Originalvorlage.</p>
  </div>
</div>""")


def p_variants():
    t = [("horizontal", "Horizontal · Primär", "Standard für Website, Briefschaften, Präsentationen.", "120mm"),
         ("vertikal", "Vertikal", "Für quadratische und hohe Formate, Schilder, Merchandise.", "52mm"),
         ("icon", "Bildmarke", "Favicon, App-Icon, Social-Media-Profil, Stempel.", "34mm"),
         ("wortmarke", "Wortmarke", "Nur wenn die Bildmarke bereits präsent ist.", "80mm")]
    tiles = "".join(f'<div style="display:grid;grid-template-rows:1fr auto"><div class="tile" style="background:var(--mist)">{logo(l, "farbig", width=w)}</div><div><h2 style="margin-top:3mm">{n}</h2><p>{d}</p></div></div>' for l, n, d, w in t)
    return frame(6, "Logo-Varianten", f"""<h1>Logo-Varianten</h1>
<div class="grid" style="grid-template-columns:1.6fr 1fr;grid-template-rows:1fr 1fr;margin-top:2mm">{tiles}</div>""")


def p_colorvariants():
    t = [("farbig", "#FFFFFF", "Farbig – Standard auf Weiss und hellen Flächen"),
         ("monochrom-navy", "#FFFFFF", "Monochrom Navy – einfarbiger Druck, Stempel"),
         ("monochrom-schwarz", "#FFFFFF", "Monochrom Schwarz – Fax, Zeitungsinserat, Gravur"),
         ("invertiert", C["navy"], "Invertiert – auf Navy und dunklen Fotos"),
         ("invertiert", C["red"], "Invertiert – auf Markenfarben"),
         ("darkmode", C["ink"], "Dark Mode – aufgehellte Farben auf Nachtblau")]
    tiles = "".join(f'<div style="display:grid;grid-template-rows:1fr auto"><div class="tile" style="background:{bg};box-shadow:inset 0 0 0 .25mm #E3E8F0">{logo("horizontal", v, width="62mm")}</div><div class="cap">{d}</div></div>' for v, bg, d in t)
    return frame(7, "Farbvarianten", f"""<h1>Farbvarianten</h1>
<div class="grid" style="grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr;margin-top:2mm">{tiles}</div>
<p style="font-size:8pt;color:var(--slate);margin-top:3mm">Dark-Mode-Farben: Blau {DARK['blue']} · Gold {DARK['gold']} · Rot {DARK['red']} · Wortmarke Weiss · Trennlinie {DARK['divider']}.</p>""")


def clearspace_svg():
    w, h = logo_size("horizontal")
    X = X_UNIT
    W, H = w + 2 * X, h + 2 * X
    inner, _ = logo_svg("horizontal", "farbig", pad=X, inner_only=True, ids=False)
    m = []
    for (x, y) in ((0, 0), (W - X, 0), (0, H - X), (W - X, H - X), (X + 60, 0), (X + 60, H - X)):
        m.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{X:.1f}" height="{X:.1f}" fill="#CE2530" fill-opacity=".12" stroke="#CE2530" stroke-width=".5"/>'
                 f'<text x="{x + X/2:.1f}" y="{y + X/2 + 3:.1f}" font-family="Inter" font-size="9" font-weight="600" fill="#CE2530" text-anchor="middle">X</text>')
    # Mass X an blauer Kante
    bx = X + 0.0
    return (f'<svg viewBox="-2 -2 {W+4:.1f} {H+4:.1f}" style="width:100%;height:100%">'
            f'<rect x="0" y="0" width="{W:.1f}" height="{H:.1f}" fill="none" stroke="#CE2530" stroke-width=".6" stroke-dasharray="3 2"/>'
            f'<rect x="{X:.1f}" y="{X:.1f}" width="{w:.1f}" height="{h:.1f}" fill="none" stroke="#58637E" stroke-width=".3" stroke-dasharray="1.5 1.5"/>'
            f'{"".join(m)}{inner}'
            f'<line x1="{bx - 3:.1f}" y1="{X + 0.6:.1f}" x2="{bx - 3:.1f}" y2="{X + 0.6 + X:.1f}" stroke="#CE2530" stroke-width=".6"/>'
            f'</svg>')


def p_clearspace():
    rows = [("Horizontal", "35 mm", "140 px"), ("Vertikal", "22 mm", "90 px"), ("Wortmarke", "30 mm", "120 px"),
            ("Bildmarke", "6 mm", "16 px (Favicon)")]
    tr = "".join(f"<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td></tr>" for a, b, c in rows)
    return frame(8, "Schutzraum & Mindestgrössen", f"""<h1>Schutzraum & Mindestgrössen</h1>
<div class="grid" style="grid-template-columns:1.6fr 1fr;margin-top:2mm">
  <div class="tile" style="background:var(--mist);padding:10mm">{clearspace_svg()}</div>
  <div style="align-self:center">
    <h2>Schutzraum = X</h2>
    <p>X entspricht der Länge der senkrechten Aussenkante der blauen Fläche (≈ ⅓ der Logohöhe). Rund um das Logo bleibt mindestens X frei – keine Texte, Bilder oder Kanten in diesem Bereich.</p>
    <p>Für die Bildmarke allein gilt ebenfalls X; im Favicon darf der Schutzraum auf ½ X reduziert werden.</p>
    <h2 style="margin-top:6mm">Mindestgrössen (Breite)</h2>
    <table><tr><th>Version</th><th>Druck</th><th>Bildschirm</th></tr>{tr}</table>
  </div>
</div>""")


def construction_svg():
    P = icon_polygons()
    pad = 14
    x0, y0 = IX0 - pad, IY0 - pad
    W, H = ICON_W + 2 * pad, ICON_H + 2 * pad
    lines = []
    for poly in P.values():
        n = len(poly)
        for i in range(n):
            (ax, ay), (bx, by) = poly[i], poly[(i + 1) % n]
            dx, dy = bx - ax, by - ay
            L = (dx * dx + dy * dy) ** .5
            if L < 4:
                continue
            ux, uy = dx / L * 200, dy / L * 200
            lines.append(f'<line x1="{ax-ux:.2f}" y1="{ay-uy:.2f}" x2="{ax+ux:.2f}" y2="{ay+uy:.2f}"/>')
    cols = {"blue": C["blue"], "gold": C["gold"], "red": C["red"]}
    polys = "".join(f'<polygon points="{poly_points(p)}" fill="{cols[k]}" fill-opacity=".9"/>' for k, p in P.items())
    pts = "".join(f'<circle cx="{x:.2f}" cy="{y:.2f}" r=".7" fill="#fff" stroke="#062B63" stroke-width=".35"/>' for p in P.values() for x, y in p)
    bx, by = P["blue"][0]
    return (f'<svg viewBox="{x0:.1f} {y0:.1f} {W:.1f} {H:.1f}" style="width:100%;height:100%">'
            f'<clipPath id="cc"><rect x="{x0}" y="{y0}" width="{W}" height="{H}"/></clipPath>'
            f'<g clip-path="url(#cc)" stroke="#58637E" stroke-width=".18" stroke-dasharray="1 .8">{"".join(lines)}</g>'
            f'{polys}{pts}'
            f'<path d="M{bx+8:.1f} {by + 8*0.57735:.1f} A 8 8 0 0 0 {bx+8:.1f} {by:.1f}" fill="none" stroke="#CE2530" stroke-width=".35"/>'
            f'<text x="{bx+9.5:.1f}" y="{by+3.4:.1f}" font-family="Inter" font-size="2.6" fill="#CE2530" font-weight="600">30°</text>'
            f'</svg>')


def p_construction():
    return frame(9, "Konstruktion", f"""<h1>Konstruktion</h1>
<div class="grid" style="grid-template-columns:1.3fr 1fr;margin-top:2mm">
  <div class="tile" style="background:var(--mist);padding:6mm">{construction_svg()}</div>
  <div style="align-self:center">
    <p class="lead">Die Bildmarke basiert auf einem isometrischen Raster: alle schrägen Kanten verlaufen exakt im 30°-Winkel, alle übrigen Kanten senkrecht.</p>
    <p>Die drei Flächen sind durch gleich breite Fugen getrennt (≈ 4 % der Bildmarkenbreite). Die Fugen dürfen nicht geschlossen, verbreitert oder farbig gefüllt werden.</p>
    <p>Die Geometrie wurde aus der Rastervorlage rekonstruiert und auf das Raster idealisiert. Abweichungen zum Original liegen unter einem Pixel der Vorlage.</p>
    <p>Aus demselben 30°-Raster leitet sich das isometrische Linienmuster ab, das als dezentes Gestaltungselement auf Flächen eingesetzt werden kann.</p>
    <div style="position:relative;height:28mm;border-radius:1.5mm;overflow:hidden;background:var(--navy);margin-top:4mm">{iso_pattern('#FFFFFF', .12, 26, 'isoc2')}</div>
  </div>
</div>""")


def p_donts():
    base = logo("horizontal", "farbig", width="44mm")
    swapped = logo_svg("horizontal", "farbig", ids=False).replace(C["blue"], "#TMP").replace(C["red"], C["blue"]).replace("#TMP", C["red"])
    swapped = swapped.replace("<svg ", '<svg style="display:block;width:44mm" ', 1)
    t = [(f'<div style="transform:scaleX(1.45)">{logo("horizontal", "farbig", width="30mm")}</div>', "#fff", "Nicht verzerren"),
         (f'<div style="transform:rotate(-14deg)">{base}</div>', "#fff", "Nicht drehen"),
         (swapped, "#fff", "Farben nicht vertauschen"),
         (f'<div style="filter:drop-shadow(1.2mm 1.2mm .8mm rgba(0,0,0,.5))">{base}</div>', "#fff", "Keine Schatten oder Effekte"),
         (base, "linear-gradient(120deg,#CE2530,#C69D49 50%,#4F86C6)", "Nicht auf unruhige Hintergründe"),
         (f'<div style="display:flex;align-items:center;gap:3mm">{icon_inline(style="width:11mm")}<span style="font:italic 700 13pt Georgia,serif;color:var(--navy)">Dreiland Finanzen</span></div>', "#fff", "Wortmarke nicht neu setzen"),
         (logo("horizontal", "farbig", width="44mm", style="opacity:.35"), "#fff", "Nicht transparent abschwächen"),
         (f'<div style="display:flex;align-items:center;gap:2mm">{logo("wortmarke", "farbig", width="28mm")}{icon_inline(style="width:12mm")}</div>', "#fff", "Elemente nicht umstellen")]
    tiles = "".join(f'<div style="display:grid;grid-template-rows:1fr auto"><div class="tile" style="background:{bg};box-shadow:inset 0 0 0 .25mm #E3E8F0;overflow:hidden">{h}<span class="x">✕</span></div><div class="cap">{d}</div></div>' for h, bg, d in t)
    return frame(10, "Fehlanwendungen", f"""<h1>Fehlanwendungen</h1>
<div class="grid" style="grid-template-columns:repeat(4,1fr);grid-template-rows:minmax(0,1fr) minmax(0,1fr);margin-top:2mm">{tiles}</div>""")


def p_palette():
    pal = [p for p in palette() if p["key"] != "white"]
    prim = pal[:4]
    sec = pal[4:]
    def sw(p, big=True):
        light = p["key"] in ("mist",)
        fg = "var(--navy)" if light else "#fff"
        return (f'<div style="display:grid;grid-template-rows:{"1fr" if big else "16mm"} auto;border-radius:1.5mm;overflow:hidden;box-shadow:0 0 0 .25mm #E3E8F0">'
                f'<div style="background:{p["hex"]};color:{fg};padding:4mm;font:700 11pt var(--display);display:flex;align-items:flex-end">{p["name"]}</div>'
                f'<div style="padding:3mm 4mm;font:400 7.5pt/1.6 var(--text);color:#34405e"><b>{p["hex"]}</b><br>RGB {", ".join(map(str, p["rgb"]))}<br>'
                f'CMYK {" / ".join(map(str, p["cmyk"]))}*<br>Pantone ≈ {p["pantone"]}**<br><span style="color:var(--slate)">{p["rolle"]}</span></div></div>')
    return frame(11, "Farbpalette", f"""<h1>Farbpalette</h1>
<div class="grid" style="grid-template-columns:repeat(4,1fr);grid-template-rows:1fr auto;margin-top:2mm">
  {''.join(sw(p) for p in prim)}
  {''.join(sw(p, False) for p in sec)}
  <div style="display:grid;align-content:center;gap:2mm"><h3>Verhältnis</h3>
    <div style="display:flex;height:9mm;border-radius:1mm;overflow:hidden;box-shadow:0 0 0 .25mm #E3E8F0"><span style="flex:55;background:#fff"></span><span style="flex:25;background:var(--navy)"></span><span style="flex:12;background:var(--mist)"></span><span style="flex:4;background:var(--blue)"></span><span style="flex:2;background:var(--gold)"></span><span style="flex:2;background:var(--red)"></span></div>
    <p style="font-size:7.5pt;margin:0">Weiss 55 · Navy 25 · Nebel 12 · Akzente 8 %</p></div>
</div>
<p style="font-size:7.5pt;color:var(--slate);margin:3mm 0 0">Alle Werte aus der Rastervorlage gemessen – Annäherung. * CMYK rechnerisch ohne Farbprofil; für Offsetdruck mit ISO Coated v2 / PSO Coated v3 separieren und proofen. ** Pantone-Zuordnung unverbindlich, mit Farbfächer prüfen.</p>""")


def p_contrast():
    combos = [("navy", "white"), ("white", "navy"), ("blue", "white"), ("white", "blue"), ("red", "white"),
              ("white", "red"), ("gold", "white"), ("navy", "gold"), ("gold", "ink"), ("slate", "white"),
              ("white", "ink"), ("navy", "mist")]
    hexes = {k: v["hex"] for k, v in COLORS.items()}
    rows = []
    for fg, bg in combos:
        r = contrast(hexes[fg], hexes[bg])
        if r >= 7:
            v = '<span class="ok">AAA · alle Texte</span>'
        elif r >= 4.5:
            v = '<span class="ok">AA · alle Texte</span>'
        elif r >= 3:
            v = '<span class="warn">nur grosse Schrift ≥ 24 px / Grafik</span>'
        else:
            v = '<span class="no">nicht für Text</span>'
        rows.append(f'<tr><td><span style="display:inline-block;padding:1.5mm 4mm;border-radius:1mm;background:{hexes[bg]};color:{hexes[fg]};font:700 9pt var(--display);box-shadow:0 0 0 .25mm #E3E8F0">Aa Kredit</span></td>'
                    f'<td>{COLORS[fg]["name"]} auf {COLORS[bg]["name"]}</td><td><b>{r:.1f} : 1</b></td><td>{v}</td></tr>')
    half = len(rows) // 2
    head = "<tr><th>Muster</th><th>Kombination</th><th>Kontrast</th><th>WCAG 2.2</th></tr>"
    return frame(12, "Kontrast & Barrierefreiheit", f"""<h1>Kontrast & Barrierefreiheit</h1>
<p class="lead">Texte müssen mindestens WCAG 2.2 AA erfüllen. Gold ist ein Akzent – nie für Fliesstext auf Weiss.</p>
<div class="grid" style="grid-template-columns:1fr 1fr;margin-top:2mm;align-items:start">
  <table>{head}{''.join(rows[:half])}</table><table>{head}{''.join(rows[half:])}</table>
</div>
<p style="font-size:8pt;color:var(--slate)">Farbe nie als einziges Unterscheidungsmerkmal einsetzen (z. B. Rot für Fristen immer mit Text oder Icon). Animationen respektieren «Bewegung reduzieren».</p>""")


def p_typo():
    scale = [("H1 · Display", "Montserrat Bold 700", "48 / 52 px", "font:700 26pt/1.05 var(--display)", "Fair finanziert."),
             ("H2", "Montserrat Bold 700", "32 / 38 px", "font:700 17pt/1.1 var(--display)", "Persönlich begleitet"),
             ("H3", "Montserrat SemiBold 600", "22 / 28 px", "font:600 12.5pt var(--display)", "Ihr Budgetcheck"),
             ("Fliesstext", "Inter Regular 400", "16 / 26 px", "font:400 10pt var(--text)", "Wir finden den Kredit, der zu Ihrer Situation passt."),
             ("Label", "Inter SemiBold 600 · +16 %", "12 px", "font:600 7.5pt var(--text);letter-spacing:.16em;text-transform:uppercase", "Kreditberatung"),
             ("Zahlen", "Inter Medium · tabellarisch", "16 px", "font:500 10pt var(--text);font-variant-numeric:tabular-nums", "CHF 15'000.– · 8.9 % · 48 Mt.")]
    tr = "".join(f'<tr><td style="width:36mm"><b>{a}</b><br><span style="color:var(--slate);font-size:7.5pt">{b}<br>{c}</span></td><td style="{s};color:var(--navy)">{t}</td></tr>' for a, b, c, s, t in scale)
    return frame(13, "Typografie", f"""<h1>Typografie</h1>
<div class="grid" style="grid-template-columns:1fr 1.35fr;margin-top:1mm">
  <div style="display:grid;gap:4mm;align-content:start">
    <div style="background:var(--mist);border-radius:1.5mm;padding:6mm"><h3>Display · Montserrat</h3><div style="font:700 34pt/1 var(--display)">Aa Ää 123</div><p style="margin:2mm 0 0">Headlines, Zahlen-Highlights. Nächste Annäherung an die Logoschrift. OFL, frei nutzbar.</p></div>
    <div style="background:var(--mist);border-radius:1.5mm;padding:6mm"><h3>Text · Inter</h3><div style="font:400 30pt/1 var(--text)">Aa Ää 123</div><p style="margin:2mm 0 0">Fliesstext, UI, Tabellen. Hervorragend lesbar am Bildschirm. OFL.</p></div>
    <div><h3>Schweizer Schreibweise</h3><p style="margin:0">ss statt ß · «Guillemets» · CHF 1'250.– · 30.10.2026 · 14.00 Uhr · +41 61 000 00 00</p>
    <p style="font-size:8pt;color:var(--slate);margin-top:2mm">Ersatzschrift (System): Arial / Helvetica. Für «Premium Finance» ergänzend Source Serif 4.</p></div>
  </div>
  <table>{tr}</table>
</div>""")


def p_motion():
    steps = [("0.05 s", "Blaue Fläche", "gleitet entlang der 30°-Achse ein"), ("0.17 s", "Goldene Fläche", "folgt von rechts oben"),
             ("0.29 s", "Rote Fläche", "steigt von unten auf"), ("0.55 s", "Trennlinie", "wächst vertikal"),
             ("0.70 s", "«Dreiland»", "blendet mit leichtem Versatz ein"), ("0.90 s", "«Finanzen»", "folgt – Ende nach ca. 2 s")]
    tr = "".join(f"<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td></tr>" for a, b, c in steps)
    return frame(14, "Bewegung", f"""<h1>Bewegung</h1>
<div class="grid" style="grid-template-columns:1fr 1fr;margin-top:2mm">
  <div>
    <p class="lead">Die Marke setzt sich zusammen – ruhig und präzise, nie verspielt. Bewegung folgt dem 30°-Raster der Bildmarke.</p>
    <table style="margin-top:4mm"><tr><th>Zeit</th><th>Element</th><th>Bewegung</th></tr>{tr}</table>
    <p style="margin-top:4mm">Easing: <b>cubic-bezier(.16, 1, .3, 1)</b> · Dauer je Element 0.6–1.1 s · einmalig, keine Endlosschleifen.</p>
  </div>
  <div style="display:grid;gap:5mm;align-content:start">
    <div class="tile" style="background:var(--mist);height:60mm">{logo('horizontal', 'farbig', width='100mm')}</div>
    <div style="background:var(--navy);color:#fff;border-radius:1.5mm;padding:6mm"><h3 style="color:#D9B566">Barrierefreiheit</h3><p style="color:#C9D5EA;margin:0">Alle animierten SVG-Dateien enthalten <b>@media (prefers-reduced-motion: reduce)</b>: Bei aktivierter Systemeinstellung «Bewegung reduzieren» erscheint das Logo sofort statisch im Endzustand.</p></div>
    <p style="font-size:8pt;color:var(--slate)">Dateien: 02_Logo-Animation/ – Vorschau mit «vorschau.html».</p>
  </div>
</div>""")


def p_apps(mock_dir):
    shots = [("mockup_visitenkarte.png", "Visitenkarte 85 × 55 mm"), ("mockup_briefpapier.png", "Briefpapier A4, Fenster rechts"),
             ("mockup_website.png", "Website Desktop & Mobile"), ("mockup_social-media.png", "Social Media")]
    tiles = "".join(f'<div style="display:grid;grid-template-rows:minmax(0,1fr) auto;min-height:0"><img class="shot" src="{(mock_dir / f).as_uri()}"><div class="cap">{c}</div></div>' for f, c in shots)
    return frame(15, "Anwendungen", f"""<h1>Anwendungen</h1>
<div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:minmax(0,1fr) minmax(0,1fr);margin-top:1mm;margin-bottom:4mm">{tiles}</div>""")


def p_dirs(dir_dir):
    d = [("richtung_01_swiss-corporate.png", "01 Swiss Corporate", "Sachlich, transparent, Raster und Weissraum. Für Offerten, Unterlagen und Website."),
         ("richtung_02_premium-finance.png", "02 Premium Finance", "Ruhig und wertig: Nachtblau, Gold-Haarlinien, Serifen-Headlines. Für Beratungsmappe und Termine."),
         ("richtung_03_digital-finance.png", "03 Digital Finance", "Nahbar und interaktiv: Budgetcheck, Kreditrechner, Kundenportal, Social Media.")]
    tiles = "".join(f'<div style="display:grid;grid-template-rows:auto auto;align-content:start;gap:3mm"><img class="shot" style="height:auto" src="{(dir_dir / f).as_uri()}"><div><h2>{t}</h2><p>{x}</p></div></div>' for f, t, x in d)
    return frame(16, "Anwendungsrichtungen", f"""<h1>Drei Anwendungsrichtungen</h1>
<p class="lead">Alle drei Richtungen nutzen dasselbe Logo, dieselben Farben und Schriften – sie unterscheiden sich in Gewichtung, Flächen und Tonfall. Empfehlung: Swiss Corporate als Basis, Digital Finance für Online-Kanäle.</p>
<div class="grid" style="grid-template-columns:repeat(3,1fr);margin-top:3mm">{tiles}</div>""")


def p_files():
    tree = [("01_Logo", "SVG (editierbar) und PNG (transparent, bis 4000 px) – horizontal, vertikal, Icon, Wortmarke × farbig, monochrom Navy/Schwarz, invertiert, Dark Mode, Dark Mode mit Fläche"),
            ("02_Logo-Animation", "Animierte SVG-Reveals inkl. prefers-reduced-motion, Vorschau-HTML"),
            ("03_Favicons", "favicon.ico/.svg, PNG 16–512 px, Apple Touch, Android, Maskable, Webmanifest, Einbindungs-Code"),
            ("04_Farben", "CSS-Variablen, JSON-Tokens, Adobe ASE, GIMP/Inkscape GPL"),
            ("05_Typografie", "Montserrat, Inter, Source Serif 4 (Variable Fonts, SIL OFL)"),
            ("06_Brand-Guidelines", "Dieses Dokument (PDF)"),
            ("07_Mockups", "Visitenkarte (+ Druck-PDF), Briefpapier (+ A4-PDF), Website, Social-Media-Vorlagen"),
            ("08_Anwendungsrichtungen", "Swiss Corporate, Premium Finance, Digital Finance (PNG + PDF)"),
            ("09_Vorlage", "Original-Rastervorlage als Referenz")]
    tr = "".join(f"<tr><td style='width:52mm'><b>{a}</b></td><td>{b}</td></tr>" for a, b in tree)
    return frame(17, "Dateien & Formate", f"""<h1>Dateien & Formate</h1>
<div class="grid" style="grid-template-columns:1.6fr 1fr;margin-top:2mm;align-items:start">
  <table>{tr}</table>
  <div style="display:grid;gap:4mm">
    <div><h3>Welche Datei wofür?</h3><p><b>SVG</b> – Web, Präsentationen, Weiterbearbeitung (Illustrator, Figma, Affinity).<br><b>PNG</b> – Office, Social Media, wenn kein SVG möglich ist.<br><b>PDF</b> – Druckvorlagen.</p></div>
    <div><h3>Dateinamen</h3><p>dreiland-finanzen_[layout]_[variante]_[breite]px.png</p></div>
    <div class="note"><p style="margin:0">Platzhalter (Namen, Adresse, Telefon, UID, IBAN, Zinssätze) vor dem Einsatz durch echte Angaben ersetzen.</p></div>
  </div>
</div>""")


def back():
    return f"""<section class="pg" style="background:var(--ink);color:#fff;justify-content:center;align-items:center">
  {iso_pattern('#FFFFFF', .05, 46, 'isoback')}
  <div style="position:relative;display:grid;justify-items:center;gap:8mm">
    {logo('vertikal', 'darkmode', width='60mm')}
    <div style="font:700 15pt var(--display)">Fair finanziert. Persönlich begleitet.</div>
    <div style="font:400 9pt var(--text);color:#8FA0C2">dreilandfinanzen.ch · {LEGAL}</div>
  </div>
  <div class="ft" style="color:#8FA0C2"><span>Version 1.0 · Oktober 2026</span><span>{TOTAL} / {TOTAL}</span></div>
</section>"""


def build(r):
    from build import D_DIR, D_GUIDE, D_MOCK, WORK
    pages = [cover(), p_intro(), p_kern(), p_ton(), p_logo(), p_variants(), p_colorvariants(), p_clearspace(),
             p_construction(), p_donts(), p_palette(), p_contrast(), p_typo(), p_motion(), p_apps(D_MOCK),
             p_dirs(D_DIR), p_files(), back()]
    assert len(pages) == TOTAL
    f = WORK / "guidelines.html"
    f.write_text(page("".join(pages), CSS, "Dreiland Finanzen – Brand Guidelines"), encoding="utf-8")
    r.html_pdf(f, D_GUIDE / "Dreiland-Finanzen_Brand-Guidelines.pdf")
    print("guidelines ok")
