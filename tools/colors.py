"""Farbdaten, Umrechnungen und Kontrastwerte."""
from __future__ import annotations

import json
import struct

from brand import COLORS, DARK

# Unverbindliche Annäherungen – vor Druckfreigabe mit Pantone-Fächer prüfen.
PANTONE = {"navy": "2758 C", "blue": "2945 C", "gold": "7562 C", "red": "1797 C",
           "slate": "7545 C", "mist": "656 C", "ink": "2767 C"}

ROLES = {
    "navy": "Primärfarbe · Wortmarke, Headlines, Text",
    "blue": "Bildmarke · Akzent, Links, Diagramme, Hervorhebungen",
    "gold": "Nur in der Bildmarke · kein Akzent für Flächen, Rahmen, Linien oder Text",
    "red": "Bildmarke · Signal, sparsam einsetzen",
    "slate": "Sekundärtext, Trennlinie, Rahmen",
    "mist": "Helle Flächen, Hintergründe",
    "ink": "Dunkle Flächen, Dark Mode",
    "white": "Grundfläche",
}


def hex_rgb(h: str):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rgb_cmyk(rgb):
    r, g, b = (c / 255 for c in rgb)
    k = 1 - max(r, g, b)
    if k >= 1:
        return 0, 0, 0, 100
    c, m, y = ((1 - x - k) / (1 - k) for x in (r, g, b))
    return tuple(round(v * 100) for v in (c, m, y, k))


def luminance(h):
    def ch(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(c) for c in hex_rgb(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = sorted((luminance(a), luminance(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def palette():
    out = []
    for key, c in COLORS.items():
        rgb = hex_rgb(c["hex"])
        out.append({"key": key, "name": c["name"], "hex": c["hex"], "rgb": rgb,
                    "cmyk": rgb_cmyk(rgb), "pantone": PANTONE.get(key, "–"), "rolle": ROLES[key]})
    return out


def tokens_css():
    lines = ["/* Dreiland Finanzen – Design Tokens",
             " * Farben aus Rastervorlage gemessen (Annäherung). */", ":root {"]
    for p in palette():
        lines.append(f"  --df-{p['key']}: {p['hex']}; /* {p['name']} */")
    for k, v in DARK.items():
        lines.append(f"  --df-dark-{k}: {v};")
    lines += ["  --df-font-display: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;",
              "  --df-font-text: 'Inter', 'Helvetica Neue', Arial, sans-serif;",
              "  --df-font-serif: 'Source Serif 4', Georgia, serif;",
              "  --df-radius: 4px;", "}", "",
              "@media (prefers-color-scheme: dark) {", "  :root {",
              "    --df-surface: var(--df-ink);", "    --df-text: #FFFFFF;", "  }", "}", ""]
    return "\n".join(lines)


def tokens_json():
    return json.dumps({
        "hinweis": "Farben aus Rastervorlage gemessen – Annäherung. CMYK rechnerisch, Pantone unverbindlich.",
        "farben": {p["key"]: {k: p[k] for k in ("name", "hex", "rgb", "cmyk", "pantone", "rolle")}
                   for p in palette()},
        "darkmode": DARK,
        "typografie": {"display": "Montserrat", "text": "Inter", "serif": "Source Serif 4"},
    }, ensure_ascii=False, indent=2)


def ase_bytes():
    """Adobe Swatch Exchange (RGB, global)."""
    blocks = b""
    count = 0
    for p in palette():
        name = (p["name"] + "\0").encode("utf-16-be")
        body = struct.pack(">H", len(name) // 2) + name + b"RGB "
        body += struct.pack(">fff", *(c / 255 for c in p["rgb"])) + struct.pack(">H", 0)
        blocks += struct.pack(">HI", 0x0001, len(body)) + body
        count += 1
    return b"ASEF" + struct.pack(">HHI", 1, 0, count) + blocks


def gpl_text():
    lines = ["GIMP Palette", "Name: Dreiland Finanzen", "Columns: 4", "#"]
    for p in palette():
        lines.append(f"{p['rgb'][0]:3d} {p['rgb'][1]:3d} {p['rgb'][2]:3d}\t{p['name']} {p['hex']}")
    return "\n".join(lines) + "\n"
