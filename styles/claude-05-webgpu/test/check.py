"""Prüfskript «Tragwerk» (Hero mit Budgetcheck): Konsole, Renderer-Pfad, Slider im ersten Viewport, Screenshots.

Aufruf (lokaler Server auf styles/ unter :5180, siehe REWORK.md):
  python check.py webgpu      # Chrome mit --enable-unsafe-webgpu, WebGPU-Pfad
  python check.py fallback    # navigator.gpu entfernt -> Canvas 2D
  python check.py reduced     # prefers-reduced-motion: reduce
  python check.py file        # per file:// geladen
  python check.py shots       # hero-desktop/-mobile (Viewport), desktop/mobile (ganze Seite)
"""
import sys, os, time, json
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

HERE = Path(__file__).resolve().parent.parent
SHOTS = HERE / 'screenshots'
SHOTS.mkdir(exist_ok=True)
URL = 'http://127.0.0.1:5180/claude-05-webgpu/index.html'
GPU_ARGS = ['--enable-unsafe-webgpu', '--enable-features=Vulkan']
mode = sys.argv[1] if len(sys.argv) > 1 else 'webgpu'

FIRST_VIEW_JS = """() => {
  const vh = innerHeight, out = {};
  for (const id of ['betrag', 'laufzeit', 'r-rate', 'budget']) {
    const el = document.getElementById(id);
    out[id] = el ? Math.round(el.getBoundingClientRect().bottom) : null;
  }
  const btn = document.querySelector('#budget .btn');
  out.button = btn ? Math.round(btn.getBoundingClientRect().bottom) : null;
  out.vh = vh;
  out.ok = [out.betrag, out.laufzeit, out['r-rate'], out.button].every(v => v === null || v <= vh);
  return out;
}"""


def stitched(page, out, vw, vh):
    """Ganzseiten-Bild aus Viewport-Aufnahmen (die Szene ist fixed und folgt dem Scroll)."""
    page.evaluate('window.scrollTo(0,0)')
    time.sleep(2.5)
    total = page.evaluate('document.documentElement.scrollHeight')
    head = page.evaluate("document.querySelector('.site-header').offsetHeight")
    tiles, y = [], 0
    step = vh - head
    while True:
        page.evaluate(f'window.scrollTo(0,{y})')
        time.sleep(2.2)
        real = page.evaluate('window.scrollY')
        p = SHOTS / f'_tile{len(tiles)}.png'
        page.screenshot(path=str(p))
        tiles.append((real, p))
        if real + vh >= total - 1:
            break
        y += step
    img = Image.new('RGB', (vw, total))
    for i, (real, p) in enumerate(tiles):
        t = Image.open(p)
        if i == 0:
            img.paste(t, (0, 0))
        else:
            img.paste(t.crop((0, head, vw, vh)), (0, real + head))
        os.remove(p)
    img.save(out)
    print('gespeichert', out, img.size)


def run(p, label, args=None, url=URL, reduced=None, vw=1440, vh=900, no_gpu=False, mobile=False, full=None, shots=True, hero_file=None):
    b = p.chromium.launch(channel='chrome', args=args or [])
    ctx = b.new_context(viewport={'width': vw, 'height': vh}, reduced_motion=reduced or 'no-preference',
                        device_scale_factor=1, is_mobile=mobile, has_touch=mobile)
    if no_gpu:
        ctx.add_init_script('try{delete Navigator.prototype.gpu}catch(e){}')
    page = ctx.new_page()
    logs = []
    page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}'))
    page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
    page.goto(url)
    time.sleep(3.5)
    state = page.evaluate('window.__tragwerk && window.__tragwerk()')
    status = page.evaluate("document.getElementById('render-status').textContent")
    print(f'== {label}: state={json.dumps(state)}')
    print(f'   status: {status}')
    print('   erster Viewport:', json.dumps(page.evaluate(FIRST_VIEW_JS)))
    if hero_file:
        page.screenshot(path=str(SHOTS / hero_file))
    if shots:
        page.screenshot(path=str(SHOTS / f'{label}-hero.png'))
    # Slider bedienen -> Monatsrate muss sich ändern
    before = page.evaluate("document.getElementById('r-rate').textContent")
    page.evaluate("""()=>{const r=document.getElementById('betrag'); r.value=60000; r.dispatchEvent(new Event('input',{bubbles:true}));
                      const l=document.getElementById('laufzeit'); l.value=24; l.dispatchEvent(new Event('input',{bubbles:true}));}""")
    time.sleep(1.5)
    after = page.evaluate("document.getElementById('r-rate').textContent")
    print(f'   Monatsrate vorher {before} -> nachher {after} (geändert: {before != after})')
    if shots:
        page.locator('#budget').screenshot(path=str(SHOTS / f'{label}-calc-red.png'))
        page.evaluate("document.querySelector('.tragbar').open = true")
        time.sleep(0.5)
        print('   ampel (rot-Lauf):', page.evaluate("document.getElementById('ampel-label').textContent"))
        page.locator('#budget').screenshot(path=str(SHOTS / f'{label}-calc-red-open.png'))
        page.evaluate("""()=>{const r=document.getElementById('betrag'); r.value=15000; r.dispatchEvent(new Event('input',{bubbles:true}));
                          const l=document.getElementById('laufzeit'); l.value=48; l.dispatchEvent(new Event('input',{bubbles:true}));}""")
        time.sleep(1.5)
        page.locator('#budget').screenshot(path=str(SHOTS / f'{label}-calc-green.png'))
        print('   ampel (gruen-Lauf):', page.evaluate("document.getElementById('ampel-label').textContent"))
        page.evaluate("document.querySelector('.tragbar').open = false")
        for sid in ['leistungen', 'haltung', 'ablauf', 'region', 'faq']:
            page.evaluate(f"document.getElementById('{sid}').scrollIntoView()")
            time.sleep(2.5)
            page.screenshot(path=str(SHOTS / f'{label}-{sid}.png'))
    if mobile:
        ctx2 = b.new_context(viewport={'width': 360, 'height': 780}, device_scale_factor=1, is_mobile=True, has_touch=True)
        p2 = ctx2.new_page()
        p2.goto(url); time.sleep(2)
        sw = p2.evaluate('document.documentElement.scrollWidth')
        print(f'   horizontales Scrollen bei 360 px: scrollWidth={sw} ({"ok" if sw <= 360 else "FEHLER"})')
        ctx2.close()
    if full:
        stitched(page, SHOTS / full, vw, vh)
    errs = [l for l in logs if l.startswith('[error]') or l.startswith('[pageerror]') or l.startswith('[warning]')]
    print('   konsole:', *logs, sep='\n     ')
    print('   fehler/warnungen:', len(errs))
    b.close()


with sync_playwright() as p:
    if mode == 'webgpu':
        run(p, 'webgpu', GPU_ARGS)
    elif mode == 'fallback':
        run(p, 'fallback', no_gpu=True)
    elif mode == 'reduced':
        run(p, 'reduced', GPU_ARGS, reduced='reduce')
    elif mode == 'file':
        run(p, 'file', GPU_ARGS, url=(HERE / 'index.html').as_uri(), shots=False)
    elif mode == 'shots':
        run(p, 'desk', GPU_ARGS, full='desktop.png', shots=False, hero_file='hero-desktop.png')
        run(p, 'mob', GPU_ARGS, vw=390, vh=844, mobile=True, full='mobile.png', shots=False, hero_file='hero-mobile.png')
