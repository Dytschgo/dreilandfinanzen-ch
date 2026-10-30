"""Baut den veröffentlichbaren Webseiten-Ordner `site/` aus `styles/`.

Aufruf: python tools/build_site.py

Entfernt Arbeitsdateien (Screenshots, Prüfskripte, Briefings) und sperrt die
Design-Review-Seite für Suchmaschinen (robots.txt + X-Robots-Tag).
"""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "styles"
OUT = ROOT / "site"

SKIP_DIRS = {"screenshots", "test", "frames", "__pycache__"}
SKIP_SUFFIX = {".py", ".md", ".pyc"}
SKIP_NAMES = {"verification.json"}


def ignore(dirpath: str, names: list[str]) -> set[str]:
    out = set()
    for n in names:
        p = Path(dirpath) / n
        if p.is_dir() and n in SKIP_DIRS:
            out.add(n)
        elif p.is_file() and (p.suffix in SKIP_SUFFIX or n in SKIP_NAMES):
            out.add(n)
    return out


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    # Gleiche Struktur wie der main-Branch: / leitet auf /styles/ weiter, Brand Kit unter /brand-kit/
    shutil.copytree(SRC, OUT / "styles", ignore=ignore)
    if (ROOT / "brand-kit").exists():
        shutil.copytree(ROOT / "brand-kit", OUT / "brand-kit")
    for name in ("index.html", "robots.txt", ".htaccess"):
        shutil.copy(ROOT / name, OUT / name)
    files = [f for f in OUT.rglob("*") if f.is_file()]
    size = sum(f.stat().st_size for f in files) / 1e6
    print(f"site/ gebaut: {len(files)} Dateien, {size:.1f} MB")


if __name__ == "__main__":
    main()
