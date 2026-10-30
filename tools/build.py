"""Erzeugt das komplette Dreiland Finanzen Brand Kit.

Aufruf:  python tools/build.py [schritt ...]
Schritte: logos animation favicons farben typo vorlage mockups richtungen guidelines readme zip
(ohne Argument: alle)
"""
from __future__ import annotations

import shutil
import sys
import zipfile
from pathlib import Path

from PIL import Image

import animation
import colors
from logos import LAYOUTS, VARIANTS, size, svg
from render import renderer

TOOLS = Path(__file__).resolve().parent
ROOT = TOOLS.parent
KIT_NAME = "Dreiland-Finanzen_Brand-Kit"
KIT = ROOT / "dist" / KIT_NAME
WORK = ROOT / "dist" / "_work"

D_LOGO = KIT / "01_Logo"
D_ANIM = KIT / "02_Logo-Animation"
D_FAV = KIT / "03_Favicons"
D_COL = KIT / "04_Farben"
D_TYPO = KIT / "05_Typografie"
D_GUIDE = KIT / "06_Brand-Guidelines"
D_MOCK = KIT / "07_Mockups"
D_DIR = KIT / "08_Anwendungsrichtungen"
D_SRC = KIT / "09_Vorlage"

PNG_WIDTHS = {"horizontal": [800, 2000, 4000], "vertikal": [600, 1500, 3000],
              "icon": [256, 512, 1024, 2048], "wortmarke": [800, 2000, 4000]}
PNG_PAD = 4  # Logo-Einheiten Randabstand bei PNG (Kantenglättung)


def fname(layout, variant):
    return f"dreiland-finanzen_{layout}_{variant}"


def write(path: Path, text: str | bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(text, bytes):
        path.write_bytes(text)
    else:
        path.write_text(text, encoding="utf-8", newline="\n")


# ---------------------------------------------------------------------------
def step_logos(r):
    for layout in LAYOUTS:
        for variant in VARIANTS:
            write(D_LOGO / "SVG" / layout / f"{fname(layout, variant)}.svg", svg(layout, variant))
            w, h = size(layout, PNG_PAD)
            for px in PNG_WIDTHS[layout]:
                ph = round(px * h / w)
                r.svg_png(svg(layout, variant, pad=PNG_PAD), px, ph,
                          D_LOGO / "PNG" / layout / f"{fname(layout, variant)}_{px}px.png")
    print("logos ok")


def step_animation(r):
    for layout in ("horizontal", "vertikal", "icon"):
        write(D_ANIM / f"logo-reveal_{layout}.svg", animation.animated(layout))
    write(D_ANIM / "logo-reveal_horizontal_darkmode.svg", animation.animated("horizontal", "darkmode"))
    write(D_ANIM / "vorschau.html", animation.DEMO_HTML)
    print("animation ok")


FAVICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">
<style>
  .b{{fill:#0A4682}} .g{{fill:#C69D49}} .r{{fill:#CE2530}}
  @media (prefers-color-scheme: dark) {{ .b{{fill:#4F86C6}} .g{{fill:#D9B566}} .r{{fill:#E5484D}} }}
</style>
{body}
</svg>
"""


def step_favicons(r):
    pad = 6
    body, (w, h) = svg("icon", "farbig", pad=pad, inner_only=True, ids=False)
    body = (body.replace('fill="#0A4682"', 'class="b"').replace('fill="#C69D49"', 'class="g"')
                .replace('fill="#CE2530"', 'class="r"'))
    write(D_FAV / "favicon.svg", FAVICON_SVG.format(w=f"{w:.2f}", h=f"{h:.2f}", body=body))

    small = {}
    for px in (16, 32, 48, 64, 96, 128, 256):
        out = WORK / f"fav_{px}.png"
        r.svg_png(svg("icon", "farbig", pad=4 if px <= 48 else pad), px, px, out)
        small[px] = out
    for px in (16, 32, 48, 96):
        shutil.copy(small[px], D_FAV / f"favicon-{px}x{px}.png")
    imgs = [Image.open(small[p]).convert("RGBA") for p in (16, 32, 48, 64, 128, 256)]
    imgs[-1].save(D_FAV / "favicon.ico", sizes=[(i.width, i.height) for i in imgs], append_images=imgs[:-1])

    def tile(px, frac, bg, out, rx=0):
        s_w, s_h = size("icon")
        inner, _ = svg("icon", "farbig", inner_only=True, ids=False)
        scale = px * frac / s_w
        off = px * (1 - frac) / 2
        doc = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {px} {px}">'
               f'<rect width="{px}" height="{px}" rx="{rx}" fill="{bg}"/>'
               f'<g transform="translate({off} {off}) scale({scale})">{inner}</g></svg>')
        r.svg_png(doc, px, px, out, transparent=True)

    tile(180, 0.72, "#FFFFFF", D_FAV / "apple-touch-icon.png")
    tile(192, 0.74, "#FFFFFF", D_FAV / "android-chrome-192x192.png")
    tile(512, 0.74, "#FFFFFF", D_FAV / "android-chrome-512x512.png")
    tile(512, 0.56, "#FFFFFF", D_FAV / "maskable-icon-512x512.png")
    tile(150, 0.60, "#FFFFFF", D_FAV / "mstile-150x150.png")
    tile(1024, 0.70, "#FFFFFF", D_FAV / "app-icon-1024x1024.png", rx=0)

    write(D_FAV / "site.webmanifest", """{
  "name": "Dreiland Finanzen",
  "short_name": "Dreiland",
  "lang": "de-CH",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/maskable-icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "theme_color": "#062B63",
  "background_color": "#FFFFFF",
  "display": "standalone"
}
""")
    write(D_FAV / "browserconfig.xml", """<?xml version="1.0" encoding="utf-8"?>
<browserconfig><msapplication><tile>
  <square150x150logo src="/mstile-150x150.png"/>
  <TileColor>#062B63</TileColor>
</tile></msapplication></browserconfig>
""")
    write(D_FAV / "einbindung.html", """<!-- Dreiland Finanzen – Favicons: Dateien ins Web-Root kopieren und im <head> einfügen -->
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#062B63">
<meta name="msapplication-config" content="/browserconfig.xml">
""")
    print("favicons ok")


def step_farben(r):
    write(D_COL / "dreiland-finanzen_farben.css", colors.tokens_css())
    write(D_COL / "dreiland-finanzen_farben.json", colors.tokens_json())
    write(D_COL / "dreiland-finanzen_farben.ase", colors.ase_bytes())
    write(D_COL / "dreiland-finanzen_farben.gpl", colors.gpl_text())
    print("farben ok")


def step_typo(r):
    fonts = TOOLS / "fonts"
    for f in ("Montserrat-VF.ttf", "OFL-Montserrat.txt", "Inter-VF.ttf", "OFL-Inter.txt",
              "SourceSerif4-VF.ttf", "OFL-SourceSerif4.txt"):
        dest = D_TYPO / ("Montserrat" if "Montserrat" in f else "Inter" if "Inter" in f else "Source-Serif-4")
        dest.mkdir(parents=True, exist_ok=True)
        shutil.copy(fonts / f, dest / f)
    write(D_TYPO / "LIESMICH.txt", """Schriften Dreiland Finanzen
==========================

Montserrat (Variable Font, 100–900)  – Display, Headlines, Wortmarke (Annäherung)
Inter (Variable Font, 100–900)       – Fliesstext, UI, Tabellen
Source Serif 4 (Variable Font)        – nur Richtung «Premium Finance», Zitate, Editorial

Alle Schriften stehen unter der SIL Open Font License 1.1 (siehe OFL-*.txt)
und dürfen frei kommerziell genutzt und weitergegeben werden.

Wichtig: Die Original-Logoschrift ist nicht bekannt. Montserrat Bold/Regular ist die
nächstliegende frei verfügbare Annäherung aus dem Raster. In den Logo-Dateien sind die
Buchstaben in Pfade umgewandelt – das Logo nie neu setzen, immer die Dateien verwenden.
""")
    print("typo ok")


def step_vorlage(r):
    D_SRC.mkdir(parents=True, exist_ok=True)
    shutil.copy(TOOLS / "original-logo-raster.png", D_SRC / "original-logo-raster_361x143.png")
    write(D_SRC / "LIESMICH.txt", """Rastervorlage (361 × 143 px), aus der dieses Brand Kit rekonstruiert wurde.
Nur als Referenz – für alle Anwendungen die Vektordateien in 01_Logo verwenden.
""")


def step_zip(r):
    out = ROOT / "dist" / f"{KIT_NAME}.zip"
    if out.exists():
        out.unlink()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for f in sorted(KIT.rglob("*")):
            if f.is_file():
                z.write(f, Path(KIT_NAME) / f.relative_to(KIT))
    print("zip ok", out, round(out.stat().st_size / 1e6, 1), "MB")


def main(argv):
    import guidelines
    import mockups
    import directions
    import readme
    steps = {"logos": step_logos, "animation": step_animation, "favicons": step_favicons,
             "farben": step_farben, "typo": step_typo, "vorlage": step_vorlage,
             "mockups": mockups.build, "richtungen": directions.build, "guidelines": guidelines.build,
             "readme": readme.build, "zip": step_zip}
    chosen = argv or list(steps)
    WORK.mkdir(parents=True, exist_ok=True)
    with renderer() as r:
        for s in chosen:
            steps[s](r)


if __name__ == "__main__":
    main(sys.argv[1:])
