"""Animierte SVG-Logo-Reveals (CSS-Keyframes, respektiert prefers-reduced-motion)."""
from __future__ import annotations

import math

from logos import svg

EASE = "cubic-bezier(.16,1,.3,1)"
D = 12  # Einflugdistanz in Logo-Einheiten
cx, sy = D * math.cos(math.radians(30)), D * math.sin(math.radians(30))

CSS = f"""
<style>
  .p-blue, .p-gold, .p-red, .divider, .w-dreiland, .w-finanzen {{
    transform-box: fill-box; transform-origin: center;
    animation-duration: .9s; animation-timing-function: {EASE}; animation-fill-mode: both;
  }}
  .p-blue  {{ animation-name: df-blue;  animation-delay: .05s; }}
  .p-gold  {{ animation-name: df-gold;  animation-delay: .17s; }}
  .p-red   {{ animation-name: df-red;   animation-delay: .29s; }}
  .divider {{ animation-name: df-line;  animation-delay: .55s; animation-duration: .6s; }}
  .w-dreiland {{ animation-name: df-word; animation-delay: .70s; }}
  .w-finanzen {{ animation-name: df-sub;  animation-delay: .90s; animation-duration: 1.1s; }}
  @keyframes df-blue {{ from {{ opacity: 0; transform: translate({-cx:.1f}px, {-sy:.1f}px); }} }}
  @keyframes df-gold {{ from {{ opacity: 0; transform: translate({cx:.1f}px, {-sy:.1f}px); }} }}
  @keyframes df-red  {{ from {{ opacity: 0; transform: translate(0, {D}px); }} }}
  @keyframes df-line {{ from {{ opacity: 0; transform: scaleY(0); }} }}
  @keyframes df-word {{ from {{ opacity: 0; transform: translateX(-10px); }} }}
  @keyframes df-sub  {{ from {{ opacity: 0; transform: translateX(-6px); }} }}
  @media (prefers-reduced-motion: reduce) {{
    .p-blue, .p-gold, .p-red, .divider, .w-dreiland, .w-finanzen {{ animation: none !important; }}
  }}
</style>"""


def animated(layout: str, variant: str = "farbig") -> str:
    s = svg(layout, variant, classes=True, pad=8,
            title=f"Dreiland Finanzen – animierter Logo-Reveal ({layout}, {variant})")
    head, rest = s.split("</desc>\n", 1)
    return head + "</desc>" + CSS + "\n" + rest


DEMO_HTML = """<!doctype html>
<html lang="de-CH">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dreiland Finanzen – Logo-Animationen</title>
<style>
  :root { color-scheme: light; font-family: Inter, 'Segoe UI', Arial, sans-serif; color: #062B63; }
  body { margin: 0; background: #EEF1F6; }
  main { max-width: 1100px; margin: 0 auto; padding: 48px 24px; display: grid; gap: 24px; }
  h1 { font-family: Montserrat, Arial, sans-serif; margin: 0; }
  p { margin: 0; color: #58637E; max-width: 65ch; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 24px; }
  figure { margin: 0; background: #fff; border-radius: 6px; padding: 32px; display: grid; gap: 16px; }
  figure.dark { background: #031A3D; color: #fff; }
  figure img { width: 100%; height: 180px; object-fit: contain; }
  figcaption { font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
  button { font: inherit; border: 1px solid currentColor; background: none; color: inherit; border-radius: 4px; padding: 6px 12px; cursor: pointer; }
</style>
</head>
<body>
<main>
  <h1>Logo-Reveals</h1>
  <p>Die Animationen laufen einmal ab (ca. 2 s). Bei aktivierter Systemeinstellung «Bewegung reduzieren» (prefers-reduced-motion) wird das Logo sofort statisch angezeigt.</p>
  <div class="grid">
    <figure><img src="logo-reveal_horizontal.svg" alt="Dreiland Finanzen"><figcaption>Horizontal <button>Wiederholen</button></figcaption></figure>
    <figure><img src="logo-reveal_vertikal.svg" alt="Dreiland Finanzen"><figcaption>Vertikal <button>Wiederholen</button></figcaption></figure>
    <figure><img src="logo-reveal_icon.svg" alt="Dreiland Finanzen"><figcaption>Bildmarke <button>Wiederholen</button></figcaption></figure>
    <figure class="dark"><img src="logo-reveal_horizontal_darkmode.svg" alt="Dreiland Finanzen"><figcaption>Dark Mode <button>Wiederholen</button></figcaption></figure>
  </div>
</main>
<script>
  document.querySelectorAll('figure').forEach(f => {
    f.querySelector('button').addEventListener('click', () => {
      const img = f.querySelector('img'); const src = img.getAttribute('src').split('?')[0];
      img.src = src + '?t=' + Date.now();
    });
  });
</script>
</body>
</html>
"""
