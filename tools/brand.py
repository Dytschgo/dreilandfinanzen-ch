"""Dreiland Finanzen – Markengeometrie, Farben und Text-zu-Pfad.

Alle Koordinaten sind in «Quell-Einheiten»: 1 Einheit = 1 Pixel der
gelieferten Rastervorlage (361 × 143 px). Die Bildmarke wurde aus dem Raster
rekonstruiert und auf exakte 30°-Isometriewinkel idealisiert.
"""
from __future__ import annotations

import io
import math
from functools import lru_cache
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent
FONTS = ROOT / "fonts"

# ---------------------------------------------------------------------------
# Farben (aus dem Raster gemessen – Annäherung, siehe Guidelines)
# ---------------------------------------------------------------------------
COLORS = {
    "navy":  {"name": "Dreiland Navy",  "hex": "#062B63"},   # Wortmarke
    "blue":  {"name": "Rhein Blau",     "hex": "#0A4682"},   # Bildmarke links
    "gold":  {"name": "Basler Gold",    "hex": "#C69D49"},   # Bildmarke rechts
    "red":   {"name": "Grenz Rot",      "hex": "#CE2530"},   # Bildmarke unten
    "slate": {"name": "Schiefer",       "hex": "#58637E"},   # Trennlinie / Sekundärtext
    "mist":  {"name": "Nebel",          "hex": "#EEF1F6"},   # Flächen hell
    "ink":   {"name": "Nachtblau",      "hex": "#031A3D"},   # Dark-Mode-Fläche
    "white": {"name": "Weiss",          "hex": "#FFFFFF"},
}
# Aufgehellte Varianten für dunkle Hintergründe (Dark Mode)
DARK = {"blue": "#4F86C6", "gold": "#D9B566", "red": "#E5484D", "text": "#FFFFFF",
        "divider": "#8FA0C2"}

K = math.tan(math.radians(30))  # Steigung der Isometrie-Kanten


def _r(v: float) -> float:
    return round(v, 2)


# ---------------------------------------------------------------------------
# Bildmarke (drei isometrische Flächen)
# ---------------------------------------------------------------------------
def icon_polygons() -> dict[str, list[tuple[float, float]]]:
    # Blau – links, senkrechte Aussenkante
    ax, ay, by = 20.6, 26.8, 51.6
    cx = 40.4
    cy = by + (cx - ax) * K
    dx = ((cy - ay) + K * (cx + ax)) / (2 * K)
    dy = ay + (dx - ax) * K
    blue = [(ax, ay), (ax, by), (cx, cy), (dx, dy)]

    # Gold – rechts, mit Spitze oben links
    rx, rt, rb, lx = 95.6, 26.2, 52.6, 66.3
    tx = 60.9
    ty = rt + (rx - tx) * K
    ny = ty + (lx - tx) * K
    gold = [(rx, rt), (tx, ty), (lx, ny), (lx, rb + (rx - lx) * K), (rx, rb)]

    # Rot – unten, mit Stufe unter der goldenen Fläche
    gap_v = 3.85  # vertikaler Abstand ≈ 3.33 senkrecht zur 30°-Kante
    lx2, ly_top, ly_bot = 43.3, 64.9, 88.4
    tipx = 62.8
    tipy = ly_top - (tipx - lx2) * K
    my = rb + (rx - tipx) * K + gap_v
    rx2 = 71.0
    ry_top = my - (rx2 - tipx) * K
    red = [(lx2, ly_top), (tipx, tipy), (tipx, my), (rx2, ry_top),
           (rx2, ly_bot + (rx2 - lx2) * K), (lx2, ly_bot)]
    return {"blue": blue, "gold": gold, "red": red}


ICON_BBOX = (20.6, 26.2, 95.6, 104.4)  # x0, y0, x1, y1 (wird unten exakt berechnet)


def _bbox(polys):
    xs = [p[0] for poly in polys for p in poly]
    ys = [p[1] for poly in polys for p in poly]
    return min(xs), min(ys), max(xs), max(ys)


ICON_BBOX = _bbox(icon_polygons().values())


def poly_d(poly, dx=0.0, dy=0.0, s=1.0) -> str:
    pts = " ".join(f"{_r((x + dx) * s)},{_r((y + dy) * s)}" for x, y in poly)
    return f"M{pts}Z".replace("M", "M", 1)


def poly_points(poly, dx=0.0, dy=0.0, s=1.0) -> str:
    return " ".join(f"{_r((x + dx) * s)},{_r((y + dy) * s)}" for x, y in poly)


# ---------------------------------------------------------------------------
# Typografie → Pfade
# ---------------------------------------------------------------------------
@lru_cache(maxsize=None)
def _font_blob(path: str) -> bytes:
    return Path(path).read_bytes()


@lru_cache(maxsize=None)
def _static_font(path: str, wght: int) -> TTFont:
    vf = TTFont(path)
    axes = {a.axisTag: a.defaultValue for a in vf["fvar"].axes}
    axes["wght"] = wght
    st = instancer.instantiateVariableFont(vf, axes)
    buf = io.BytesIO()
    st.save(buf)
    buf.seek(0)
    return TTFont(buf)


def shape(text: str, font: str, wght: int):
    path = str(FONTS / font)
    face = hb.Face(_font_blob(path))
    f = hb.Font(face)
    f.set_variations({"wght": wght})
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(f, buf, {"kern": True, "liga": False})
    st = _static_font(path, wght)
    order = st.getGlyphOrder()
    out = []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        out.append((order[info.codepoint], pos.x_advance, pos.x_offset, pos.y_offset))
    return st, out


def text_outline(text, font, wght, size, tracking=0.0):
    """Liefert (path_d, ink_bbox) relativ zu Ursprung (0, Grundlinie)."""
    st, glyphs = shape(text, font, wght)
    upm = st["head"].unitsPerEm
    sc = size / upm
    gs = st.getGlyphSet()
    pen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    bpen = BoundsPen(gs)
    x = 0.0
    for name, adv, xo, yo in glyphs:
        t = (sc, 0, 0, -sc, x + xo * sc, -yo * sc)
        gs[name].draw(TransformPen(pen, t))
        gs[name].draw(TransformPen(bpen, t))
        x += adv * sc + tracking
    return pen.getCommands(), bpen.bounds


def text_fitted(text, font, wght, left, right, cap_top, baseline):
    """Text so skalieren/sperren, dass Tinte exakt left..right und cap_top..baseline füllt
    (cap_top = oberste Tintenkante inkl. Oberlängen/i-Punkt)."""
    _, u = text_outline(text, font, wght, 100.0, 0)
    size = (baseline - cap_top) / (-u[1] / 100.0)
    _, b0 = text_outline(text, font, wght, size, 0)
    n = len(text) - 1
    tracking = ((right - left) - (b0[2] - b0[0])) / n if n else 0
    d, b = text_outline(text, font, wght, size, tracking)
    return {"d": d, "size": size, "tracking": tracking, "bbox": b,
            "tx": left - b[0], "ty": baseline}


# Messwerte aus dem Raster (Tintenkanten)
WORD_DREILAND = dict(text="Dreiland", font="Montserrat-VF.ttf", wght=700,
                     left=142.0, right=334.0, cap_top=33.0, baseline=70.0)
WORD_FINANZEN = dict(text="Finanzen", font="Montserrat-VF.ttf", wght=400,
                     left=144.0, right=322.0, cap_top=77.0, baseline=94.0)
DIVIDER = {"x": 114.8, "y0": 30.0, "y1": 106.0, "w": 1.4}


@lru_cache(maxsize=None)
def wordmark():
    a = text_fitted(**WORD_DREILAND)
    b = text_fitted(**WORD_FINANZEN)
    return a, b
