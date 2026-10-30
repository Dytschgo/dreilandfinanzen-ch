"""SVG-Generator für alle Logo-Layouts und Farbvarianten."""
from __future__ import annotations

from brand import COLORS, DARK, DIVIDER, ICON_BBOX, icon_polygons, poly_points, wordmark

C = {k: v["hex"] for k, v in COLORS.items()}

# Rolle → Farbe je Variante
VARIANTS = {
    "farbig": {"label": "Farbig (Original)", "blue": C["blue"], "gold": C["gold"], "red": C["red"],
               "text": C["navy"], "divider": C["slate"], "bg": None},
    "monochrom-navy": {"label": "Monochrom Navy", "blue": C["navy"], "gold": C["navy"], "red": C["navy"],
                       "text": C["navy"], "divider": C["navy"], "bg": None},
    "monochrom-schwarz": {"label": "Monochrom Schwarz", "blue": "#000000", "gold": "#000000", "red": "#000000",
                          "text": "#000000", "divider": "#000000", "bg": None},
    "invertiert": {"label": "Invertiert (Weiss)", "blue": "#FFFFFF", "gold": "#FFFFFF", "red": "#FFFFFF",
                   "text": "#FFFFFF", "divider": "#FFFFFF", "bg": None},
    "darkmode": {"label": "Dark Mode", "blue": DARK["blue"], "gold": DARK["gold"], "red": DARK["red"],
                 "text": DARK["text"], "divider": DARK["divider"], "bg": None},
    "darkmode-flaeche": {"label": "Dark Mode mit Fläche", "blue": DARK["blue"], "gold": DARK["gold"],
                         "red": DARK["red"], "text": DARK["text"], "divider": DARK["divider"], "bg": C["ink"]},
}

LAYOUTS = {
    "horizontal": "Horizontal (Original)",
    "vertikal": "Vertikal",
    "icon": "Bildmarke / Icon",
    "wortmarke": "Wortmarke",
}

WM_X0, WM_X1, WM_Y0, WM_Y1 = 142.0, 334.0, 33.0, 94.0  # Tinten-Box der Wortmarke
IX0, IY0, IX1, IY1 = ICON_BBOX
ICON_W, ICON_H = IX1 - IX0, IY1 - IY0


def _f(v: float) -> str:
    return f"{v:.2f}".rstrip("0").rstrip(".")


def layout(name: str):
    """Liefert (icon_tf, show_divider, wordmark_tf, (w, h)).
    tf = (dx, dy, s) mit Abbildung p' = (p + (dx,dy)) * s  – in Quellkoordinaten."""
    if name == "horizontal":
        x0, y0 = IX0, min(IY0, DIVIDER["y0"])
        x1, y1 = WM_X1, max(IY1, DIVIDER["y1"])
        t = (-x0, -y0, 1.0)
        return t, True, t, (x1 - x0, y1 - y0)
    if name == "icon":
        side = max(ICON_W, ICON_H)
        return (-IX0 + (side - ICON_W) / 2, -IY0 + (side - ICON_H) / 2, 1.0), False, None, (side, side)
    if name == "wortmarke":
        return None, False, (-WM_X0, -WM_Y0, 1.0), (WM_X1 - WM_X0, WM_Y1 - WM_Y0)
    if name == "vertikal":
        s = 1.2
        wm_w = WM_X1 - WM_X0
        icon_t = (-IX0 + (wm_w - ICON_W * s) / 2 / s, -IY0, s)
        gap = 20.0
        wm_t = (-WM_X0, -WM_Y0 + ICON_H * s + gap, 1.0)
        return icon_t, False, wm_t, (wm_w, ICON_H * s + gap + WM_Y1 - WM_Y0)
    raise KeyError(name)


def _tf_attr(t, pad):
    dx, dy, s = t
    if s == 1.0:
        return f'translate({_f(dx + pad)} {_f(dy + pad)})'
    return f'translate({_f(pad)} {_f(pad)}) scale({_f(s)}) translate({_f(dx)} {_f(dy)})'


def svg(layout_name: str, variant: str = "farbig", *, pad: float = 0.0, width: float | None = None,
        title: str | None = None, ids: bool = True, extra_attrs: str = "", classes: bool = False,
        inner_only: bool = False) -> str:
    v = VARIANTS[variant]
    icon_t, divider, wm_t, (w, h) = layout(layout_name)
    W, H = w + 2 * pad, h + 2 * pad
    a, b = wordmark()
    parts = []
    if v["bg"]:
        parts.append(f'<rect id="hintergrund" width="{_f(W)}" height="{_f(H)}" fill="{v["bg"]}"/>')
    if icon_t:
        polys = icon_polygons()
        g = [f'<g id="bildmarke" transform="{_tf_attr(icon_t, pad)}">' if ids else
             f'<g transform="{_tf_attr(icon_t, pad)}">']
        for key, pid in (("blue", "flaeche-blau"), ("gold", "flaeche-gold"), ("red", "flaeche-rot")):
            idattr = f' id="{pid}"' if ids else ""
            cls = f' class="p-{key}"' if classes else ""
            g.append(f'  <polygon{idattr}{cls} fill="{v[key]}" points="{poly_points(polys[key])}"/>')
        g.append("</g>")
        parts.append("\n".join(g))
    if divider:
        dx, dy, _ = icon_t
        x = DIVIDER["x"] - DIVIDER["w"] / 2 + dx + pad
        y = DIVIDER["y0"] + dy + pad
        idattr = ' id="trennlinie"' if ids else ""
        cls = ' class="divider"' if classes else ""
        parts.append(f'<rect{idattr}{cls} fill="{v["divider"]}" x="{_f(x)}" y="{_f(y)}" '
                     f'width="{_f(DIVIDER["w"])}" height="{_f(DIVIDER["y1"] - DIVIDER["y0"])}"/>')
    if wm_t:
        g = [f'<g id="wortmarke" fill="{v["text"]}" transform="{_tf_attr(wm_t, pad)}">' if ids else
             f'<g fill="{v["text"]}" transform="{_tf_attr(wm_t, pad)}">']
        for t, pid in ((a, "dreiland"), (b, "finanzen")):
            idattr = f' id="{pid}"' if ids else ""
            path = f'<path{idattr} transform="translate({_f(t["tx"])} {_f(t["ty"])})" d="{t["d"]}"/>'
            # Animationsklasse auf Wrapper, damit CSS-transform das transform-Attribut nicht ersetzt
            g.append(f'  <g class="w-{pid}">{path}</g>' if classes else f'  {path}')
        g.append("</g>")
        parts.append("\n".join(g))
    body = "\n".join(parts)
    if inner_only:
        return body, (W, H)
    title = title or f"Dreiland Finanzen – {LAYOUTS[layout_name]}, {v['label']}"
    size = ""
    if width:
        size = f' width="{_f(width)}" height="{_f(width * H / W)}"'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {_f(W)} {_f(H)}"{size} '
            f'role="img" aria-labelledby="t"{extra_attrs}>\n'
            f'<title id="t">{title}</title>\n'
            f'<desc>Vektor-Rekonstruktion aus der Rastervorlage. Schrift in Pfade umgewandelt '
            f'(Annäherung: Montserrat Bold / Regular). Farben aus dem Raster gemessen – Annäherung.</desc>\n'
            f'{body}\n</svg>\n')


def size(layout_name: str, pad: float = 0.0):
    _, _, _, (w, h) = layout(layout_name)
    return w + 2 * pad, h + 2 * pad
