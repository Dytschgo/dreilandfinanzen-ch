"""Gemeinsame HTML-Bausteine (Schriften, Logo-Inline, Muster)."""
from __future__ import annotations

import math
from pathlib import Path

from brand import COLORS, icon_polygons, poly_points
from logos import svg as logo_svg

TOOLS = Path(__file__).resolve().parent
FONT_DIR = TOOLS / "fonts"
C = {k: v["hex"] for k, v in COLORS.items()}

FONT_CSS = f"""
@font-face {{ font-family: 'Montserrat'; src: url('{(FONT_DIR / "Montserrat-VF.ttf").as_uri()}') format('truetype'); font-weight: 100 900; }}
@font-face {{ font-family: 'Inter'; src: url('{(FONT_DIR / "Inter-VF.ttf").as_uri()}') format('truetype'); font-weight: 100 900; }}
@font-face {{ font-family: 'Source Serif 4'; src: url('{(FONT_DIR / "SourceSerif4-VF.ttf").as_uri()}') format('truetype'); font-weight: 200 900; }}
:root {{
  --navy: {C['navy']}; --blue: {C['blue']}; --gold: {C['gold']}; --red: {C['red']};
  --slate: {C['slate']}; --mist: {C['mist']}; --ink: {C['ink']};
  --display: 'Montserrat', Arial, sans-serif; --text: 'Inter', Arial, sans-serif; --serif: 'Source Serif 4', Georgia, serif;
}}
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; padding: 0; }}
body {{ font-family: var(--text); color: var(--navy); -webkit-font-smoothing: antialiased; font-feature-settings: 'ss01' 0; }}
"""


def logo(layout="horizontal", variant="farbig", height=None, width=None, style="", pad=0.0):
    import re
    from logos import size as logo_size
    s = logo_svg(layout, variant, pad=pad, ids=False)
    dims = ""
    if height:
        dims += f"height:{height};"
        if not width:
            m = re.fullmatch(r"([\d.]+)([a-z%]+)", height)
            w, h = logo_size(layout, pad)
            dims += f"width:{float(m.group(1)) * w / h:.2f}{m.group(2)};flex:none;"
    if width:
        dims += f"width:{width};"
    return s.replace("<svg ", f'<svg style="display:block;{dims}{style}" ', 1)


def iso_pattern(color="#FFFFFF", opacity=0.08, size=40, pid="iso"):
    """Isometrisches Linienmuster (30°) als <svg>-Hintergrund."""
    h = size * math.tan(math.radians(30))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">'
            f'<defs><pattern id="{pid}" width="{size}" height="{2*h:.3f}" patternUnits="userSpaceOnUse">'
            f'<path d="M0 0 L{size} {h:.3f} M0 {2*h:.3f} L{size} {h:.3f} M0 0 V{2*h:.3f}" stroke="{color}" stroke-opacity="{opacity}" fill="none" stroke-width="1"/>'
            f'</pattern></defs><rect width="100%" height="100%" fill="url(#{pid})"/></svg>')


def icon_inline(colors=("var(--blue)", "var(--gold)", "var(--red)"), style=""):
    from logos import layout as lay
    t, _, _, (w, h) = lay("icon")
    P = icon_polygons()
    polys = "".join(f'<polygon fill="{c}" points="{poly_points(P[k], t[0], t[1])}"/>'
                    for k, c in zip(("blue", "gold", "red"), colors))
    return f'<svg viewBox="0 0 {w:.2f} {h:.2f}" style="display:block;{style}" aria-hidden="true">{polys}</svg>'


def page(html_body: str, css: str, title="Dreiland Finanzen") -> str:
    return (f'<!doctype html><html lang="de-CH"><head><meta charset="utf-8"><title>{title}</title>'
            f'<style>{FONT_CSS}{css}</style></head><body>{html_body}</body></html>')
