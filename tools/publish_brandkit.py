"""Kopiert das gebaute Brand Kit nach `brand-kit/` und erzeugt eine Übersichtsseite.

Voraussetzung: `python tools/build.py` (erzeugt dist/).
Aufruf: python tools/publish_brandkit.py
"""
from __future__ import annotations

import html
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KIT = ROOT / "dist" / "Dreiland-Finanzen_Brand-Kit"
ZIP = ROOT / "dist" / "Dreiland-Finanzen_Brand-Kit.zip"
OUT = ROOT / "brand-kit"

SECTIONS = [
    ("06_Brand-Guidelines", "Brand Guidelines", "Markenhandbuch als PDF (18 Seiten)."),
    ("01_Logo", "Logo", "SVG und transparente PNG – horizontal, vertikal, Icon, Wortmarke in allen Farbvarianten."),
    ("02_Logo-Animation", "Logo-Animation", "Animierte SVG-Reveals mit prefers-reduced-motion."),
    ("03_Favicons", "Favicons", "ICO, SVG, Apple/Android-Icons, Webmanifest."),
    ("04_Farben", "Farben", "CSS, JSON, ASE, GPL."),
    ("05_Typografie", "Typografie", "Montserrat, Inter, Source Serif 4 (SIL OFL)."),
    ("07_Mockups", "Mockups", "Visitenkarte, Briefpapier, Website, Social Media."),
    ("08_Anwendungsrichtungen", "Anwendungsrichtungen", "Swiss Corporate, Premium Finance, Digital Finance."),
    ("09_Vorlage", "Vorlage", "Original-Rastervorlage als Referenz."),
]
PREVIEWS = [
    "07_Mockups/mockup_visitenkarte.png", "07_Mockups/mockup_briefpapier.png",
    "07_Mockups/mockup_website.png", "07_Mockups/mockup_social-media.png",
    "08_Anwendungsrichtungen/richtung_01_swiss-corporate.png",
    "08_Anwendungsrichtungen/richtung_02_premium-finance.png",
    "08_Anwendungsrichtungen/richtung_03_digital-finance.png",
]


def files_of(folder: Path) -> list[Path]:
    return sorted(p for p in folder.rglob("*") if p.is_file())


def size(p: Path) -> str:
    b = p.stat().st_size
    return f"{b / 1e6:.1f} MB" if b > 1e6 else f"{b / 1e3:.0f} kB"


def page() -> str:
    secs = []
    for folder, title, desc in SECTIONS:
        files = files_of(OUT / folder)
        rows = "".join(
            f'<li><a href="{html.escape(f.relative_to(OUT).as_posix())}">{html.escape(f.relative_to(OUT / folder).as_posix())}</a>'
            f'<span>{size(f)}</span></li>' for f in files)
        secs.append(f'<details{" open" if folder.startswith("06") else ""}><summary><b>{title}</b><span>{desc}</span>'
                    f'<em>{len(files)} Dateien</em></summary><ul>{rows}</ul></details>')
    previews = "".join(f'<a href="{p}"><img src="{p}" alt="" loading="lazy"></a>' for p in PREVIEWS)
    return f"""<!doctype html>
<html lang="de-CH"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dreiland Finanzen – Brand Kit</title><link rel="icon" href="03_Favicons/favicon.svg" type="image/svg+xml">
<style>
@font-face {{ font-family: Inter; src: url(/assets/fonts/Inter-VF.ttf) format("truetype"); font-weight: 100 900; }}
:root {{ --bg: #fff; --fg: #0a0a0a; --muted: #f5f5f5; --mfg: #737373; --border: #e5e5e5; --r: .625rem; }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; font: 14px/1.5 Inter, ui-sans-serif, system-ui, sans-serif; color: var(--fg); background: var(--bg); -webkit-font-smoothing: antialiased; }}
a {{ color: inherit; }}
header {{ position: sticky; top: 0; z-index: 2; height: 3.5rem; border-bottom: 1px solid var(--border); background: rgb(255 255 255 / .95); backdrop-filter: blur(8px); }}
.c {{ max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }}
header .c {{ height: 100%; display: flex; align-items: center; gap: 1.5rem; }}
header img {{ height: 22px; }}
header nav {{ display: flex; gap: 1.5rem; color: var(--mfg); }}
header nav a {{ text-decoration: none; }} header nav a:hover, header nav a[aria-current] {{ color: var(--fg); }}
h1 {{ margin: 2.5rem 0 .25rem; font-size: 1.875rem; font-weight: 600; letter-spacing: -.025em; }}
.lead {{ margin: 0 0 1.5rem; color: var(--mfg); font-size: 1rem; }}
.btns {{ display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 2rem; }}
.btn {{ display: inline-flex; align-items: center; height: 2.25rem; padding: 0 1rem; border-radius: calc(var(--r) - 2px); border: 1px solid var(--border); text-decoration: none; font-weight: 500; box-shadow: 0 1px 2px rgb(0 0 0 / .05); }}
.btn.primary {{ background: #171717; color: #fafafa; border-color: #171717; }}
.btn:hover {{ background: var(--muted); }} .btn.primary:hover {{ background: #262626; }}
.grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 1rem; margin-bottom: 2.5rem; }}
.grid img {{ width: 100%; aspect-ratio: 16/10; object-fit: cover; display: block; border: 1px solid var(--border); border-radius: var(--r); }}
details {{ border: 1px solid var(--border); border-radius: var(--r); margin-bottom: .75rem; overflow: hidden; }}
summary {{ display: grid; grid-template-columns: 12rem 1fr auto; gap: 1rem; align-items: center; padding: .875rem 1rem; cursor: pointer; list-style: none; }}
summary::-webkit-details-marker {{ display: none; }}
summary span {{ color: var(--mfg); }} summary em {{ font-style: normal; font-size: .75rem; color: var(--mfg); }}
summary:hover {{ background: var(--muted); }}
ul {{ margin: 0; padding: .25rem 1rem .75rem; list-style: none; border-top: 1px solid var(--border); max-height: 22rem; overflow: auto; }}
li {{ display: flex; justify-content: space-between; gap: 1rem; padding: .25rem 0; font-size: .8125rem; }}
li a {{ text-decoration: none; overflow-wrap: anywhere; }} li a:hover {{ text-decoration: underline; }} li span {{ color: var(--mfg); white-space: nowrap; }}
footer {{ margin: 3rem 0; color: var(--mfg); font-size: .75rem; }}
@media (max-width: 640px) {{ summary {{ grid-template-columns: 1fr auto; }} summary span {{ display: none; }} }}
</style></head><body>
<header><div class="c"><img src="01_Logo/SVG/horizontal/dreiland-finanzen_horizontal_farbig.svg" alt="Dreiland Finanzen">
<nav><a href="/">Website</a><a href="/brand-kit/" aria-current="page">Brand Kit</a><a href="https://github.com/Dytschgo/dreilandfinanzen-ch">GitHub</a></nav></div></header>
<main class="c">
<h1>Brand Kit</h1>
<p class="lead">Logo, Farben, Typografie, Guidelines und Mockups von Dreiland Finanzen. Vektoren, Schrift und Farben aus der Rastervorlage rekonstruiert (Annäherung).</p>
<div class="btns"><a class="btn primary" href="Dreiland-Finanzen_Brand-Kit.zip" download>Alles als ZIP ({size(OUT / "Dreiland-Finanzen_Brand-Kit.zip")})</a>
<a class="btn" href="06_Brand-Guidelines/Dreiland-Finanzen_Brand-Guidelines.pdf">Guidelines (PDF)</a>
<a class="btn" href="LIESMICH.md">LIESMICH</a></div>
<div class="grid">{previews}</div>
{''.join(secs)}
<footer>Name und Logo von Dreiland Finanzen sind von der Open-Source-Lizenz ausgenommen. Inhalte mit Platzhaltern.
Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG).</footer>
</main></body></html>
"""


def main() -> None:
    if not KIT.exists():
        raise SystemExit("dist/ fehlt – zuerst: python tools/build.py")
    # Inhalt leeren statt Ordner löschen (Windows sperrt Ordner, in denen eine Shell steht)
    OUT.mkdir(exist_ok=True)
    for child in OUT.iterdir():
        shutil.rmtree(child) if child.is_dir() else child.unlink()
    shutil.copytree(KIT, OUT, dirs_exist_ok=True)
    shutil.copy(ZIP, OUT / ZIP.name)
    (OUT / "index.html").write_text(page(), encoding="utf-8")
    print(f"brand-kit/ aktualisiert: {len(files_of(OUT))} Dateien")


if __name__ == "__main__":
    main()
