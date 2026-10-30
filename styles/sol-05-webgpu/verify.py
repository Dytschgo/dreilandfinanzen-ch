"""Reproducible local checks. Requires Python Playwright and installed Chrome.
Run from any directory: python styles/sol-05-webgpu/verify.py
Only writes into this variant's screenshots/ folder.
"""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
import math
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'screenshots'
OUT.mkdir(exist_ok=True)
RESULTS = {'browser': '', 'scenarios': [], 'checks': []}


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


@contextmanager
def local_server():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT.parent.parent)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f'http://127.0.0.1:{server.server_port}/styles/sol-05-webgpu/index.html'
    finally:
        server.shutdown()
        server.server_close()


def check(name, assertion):
    assert assertion, name
    RESULTS['checks'].append(name)


def open_page(browser, name, url, *, viewport=None, script=None, motion='no-preference', mobile=False):
    page = browser.new_page(viewport=viewport or {'width': 1440, 'height': 900},
                            reduced_motion=motion, device_scale_factor=2 if mobile else 1,
                            is_mobile=mobile, has_touch=mobile)
    errors, warnings, external = [], [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error'
            else warnings.append(message.text) if message.type == 'warning' else None)
    page.on('request', lambda request: external.append(request.url) if request.url.startswith('http')
            and not request.url.startswith('http://127.0.0.1') else None)
    if script:
        page.add_init_script(script)
    page.goto(url)
    page.wait_for_function("window.__sceneDiagnostics && window.__sceneDiagnostics.path !== 'initializing'")
    page.evaluate('document.fonts.ready')
    page.wait_for_timeout(500)
    item = {'name': name, 'urlScheme': url.split(':')[0], 'viewport': page.viewport_size,
            'diagnostics': page.evaluate('window.__sceneDiagnostics'), 'consoleErrors': errors,
            'consoleWarnings': warnings, 'externalRequests': external}
    RESULTS['scenarios'].append(item)
    return page, item


def overflow(page):
    return page.evaluate('document.documentElement.scrollWidth > window.innerWidth')


def set_range(page, name, value):
    page.locator('#'+name).evaluate('(el,v) => {el.value = v; el.dispatchEvent(new Event("input", {bubbles:true}));}', str(value))


with sync_playwright() as p, local_server() as http_url:
    with p.chromium.launch(channel='chrome', headless=True, args=['--enable-unsafe-webgpu']) as browser:
        RESULTS['browser'] = browser.version
        RESULTS['webgpuLaunchArgs'] = ['--enable-unsafe-webgpu']
        page, desktop = open_page(browser, 'WebGPU desktop / file', (ROOT/'index.html').as_uri())
        check('Unsafe-WebGPU launch uses the WebGPU path', desktop['diagnostics']['path'] == 'webgpu')
        check('WGSL compilation and validation clean', not desktop['diagnostics']['errors'])
        check('No horizontal overflow at 1440', not overflow(page))
        check('Desktop amount slider is in the first viewport', page.locator('#amount').evaluate('(el)=>el.getBoundingClientRect().bottom <= innerHeight'))
        check('Desktop term slider is in the first viewport', page.locator('#months').evaluate('(el)=>el.getBoundingClientRect().bottom <= innerHeight'))
        check('Desktop monthly rate and consultation action are visible', page.locator('#monthly').is_visible() and page.locator('#contact-button').evaluate('(el)=>el.getBoundingClientRect().bottom <= innerHeight'))
        check('Desktop calculator disclosure is in the first viewport', page.locator('.hero-calculator .legal').evaluate('(el)=>el.getBoundingClientRect().bottom <= innerHeight'))
        page.locator('.affordability-details summary').click()
        check('Affordability details open from the hero calculator', page.locator('.affordability-details').get_attribute('open') is not None)
        expected_rate = (math.pow(1.089, 1/12)-1)
        expected_payment = 25000*expected_rate/(1-math.pow(1+expected_rate, -48))
        check('Effective annual rate converted correctly', abs(page.evaluate('window.__sceneDiagnostics.budget.payment')-expected_payment) < .000001)
        check('Initial budget is green', page.locator('#affordability').get_attribute('data-state') == 'good')
        page.locator('#expenses').fill('4800')
        check('Tight reserve is amber', page.locator('#affordability').get_attribute('data-state') == 'warning')
        page.locator('#expenses').fill('5800')
        check('Negative reserve is red', page.locator('#affordability').get_attribute('data-state') == 'danger')
        check('Budget updates WebGPU uniform state', page.evaluate('window.__sceneDiagnostics.budget.pressure') == 1)
        page.locator('#expenses').fill('')
        check('Empty number input has clear validation feedback', page.locator('#affordability').get_attribute('data-state') == 'invalid')
        page.locator('#expenses').fill('-100')
        check('Negative number input rejected', page.locator('#affordability').get_attribute('data-state') == 'invalid')
        page.locator('#expenses').fill('4000')
        page.locator('#income').fill('0')
        check('Zero income produces safe red state', page.locator('#affordability').get_attribute('data-state') == 'danger')
        page.locator('#income').fill('6000')
        set_range(page, 'amount', 80000)
        set_range(page, 'months', 12)
        check('Amount and term update payment', page.evaluate('window.__sceneDiagnostics.budget.payment') > 6900)
        for width in [360, 390, 700, 768, 1000, 1440, 1920]:
            page.set_viewport_size({'width':width,'height':900})
            page.wait_for_timeout(100)
            check(f'No overflow with maximum payment at {width}px', not overflow(page))
        page.set_viewport_size({'width':1440,'height':900})
        set_range(page,'amount',25000)
        set_range(page,'months',48)
        page.locator('#amount').focus()
        page.keyboard.press('ArrowRight')
        check('Range supports keyboard', page.locator('#amount').input_value() == '26000')
        set_range(page,'amount',25000)
        page.locator('#fragen summary').first.click()
        check('FAQ opens', page.locator('#fragen details').first.get_attribute('open') is not None)
        page.locator('#fragen summary').nth(1).click()
        check('FAQ uses native exclusive disclosure', page.locator('#fragen details').first.get_attribute('open') is None)
        page.locator('#fragen summary').nth(1).click()
        page.locator('#fragen').scroll_into_view_if_needed()
        page.wait_for_timeout(200)
        before = page.evaluate('window.__sceneDiagnostics.frames')
        page.wait_for_timeout(200)
        check('Offscreen scenes stop rendering', before == page.evaluate('window.__sceneDiagnostics.frames'))
        page.locator('#contact-button').click()
        check('Contact dialog opens', page.locator('#contact-dialog').evaluate('(el)=>el.open'))
        page.keyboard.press('Escape')
        check('Escape closes dialog and restores focus', not page.locator('#contact-dialog').evaluate('(el)=>el.open') and page.locator('#contact-button').evaluate('(el)=>el===document.activeElement'))
        page.evaluate('window.scrollTo(0,0)')
        page.wait_for_timeout(600)
        page.locator('.affordability-details summary').click()
        page.wait_for_timeout(150)
        page.locator('.motion-toggle').click()
        page.wait_for_timeout(100)
        before = page.evaluate('window.__sceneDiagnostics.frames')
        page.wait_for_timeout(250)
        check('Pause stops continuous frame loop', before == page.evaluate('window.__sceneDiagnostics.frames'))
        page.screenshot(path=str(OUT/'hero-desktop.png'),scale='css')
        page.screenshot(path=str(OUT/'desktop.png'),full_page=True,scale='css')
        page.locator('.motion-toggle').click()
        # Explicitly exercise visibilitychange logic. Headless Chrome keeps all tabs visible.
        page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}); document.dispatchEvent(new Event('visibilitychange'))")
        before = page.evaluate('window.__sceneDiagnostics.frames')
        page.wait_for_timeout(250)
        check('Hidden-document event cancels animation', before == page.evaluate('window.__sceneDiagnostics.frames'))
        page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>false}); document.dispatchEvent(new Event('visibilitychange'))")
        page.wait_for_timeout(150)
        check('Visible-document event resumes animation', before < page.evaluate('window.__sceneDiagnostics.frames'))
        desktop['finalDiagnostics'] = page.evaluate('window.__sceneDiagnostics')
        page.close()

        page, mobile = open_page(browser, 'WebGPU mobile / HTTP', http_url, viewport={'width':390,'height':844}, mobile=True)
        check('HTTP mobile uses WebGPU', mobile['diagnostics']['path']=='webgpu')
        check('Device pixel ratio is capped at 1.5', page.locator('#hero-scene canvas').evaluate('(c)=>c.width/c.clientWidth') <= 1.51)
        check('Mobile no horizontal overflow', not overflow(page))
        check('Mobile amount slider is in the first viewport', page.locator('#amount').evaluate('(el)=>el.getBoundingClientRect().bottom <= innerHeight'))
        check('Mobile term slider is in the first viewport', page.locator('#months').evaluate('(el)=>el.getBoundingClientRect().bottom <= innerHeight'))
        check('Mobile monthly rate and consultation action are visible', page.locator('#monthly').is_visible() and page.locator('#contact-button').evaluate('(el)=>el.getBoundingClientRect().bottom <= innerHeight'))
        check('Mobile calculator disclosure is in the first viewport', page.locator('.hero-calculator .legal').evaluate('(el)=>el.getBoundingClientRect().bottom <= innerHeight'))
        page.evaluate('window.scrollTo(0,0)')
        page.wait_for_timeout(400)
        page.screenshot(path=str(OUT/'hero-mobile.png'),scale='css')
        page.screenshot(path=str(OUT/'mobile.png'),full_page=True,scale='css')
        page.locator('#spielraum').scroll_into_view_if_needed()
        set_range(page,'amount',80000)
        set_range(page,'months',12)
        check('Mobile maximum payment does not overflow result', page.locator('.budget-result').evaluate('(el)=>el.scrollWidth <= el.clientWidth'))
        page.close()

        page, reduced = open_page(browser, 'WebGPU reduced motion', http_url, motion='reduce')
        before = page.evaluate('window.__sceneDiagnostics.frames')
        page.wait_for_timeout(300)
        check('Reduced motion has no continuous frames', before == page.evaluate('window.__sceneDiagnostics.frames'))
        check('Reduced motion disables movement toggle', page.locator('.motion-toggle').is_disabled())
        check('Reduced-motion scene time remains zero', page.evaluate('window.__sceneDiagnostics.time') == 0)
        page.locator('.affordability-details summary').click()
        page.locator('#expenses').fill('5900')
        check('Reduced motion retains interactive calculator', page.locator('#affordability').get_attribute('data-state')=='danger')
        page.close()

        page, missing = open_page(browser, 'No navigator.gpu / file fallback', (ROOT/'index.html').as_uri(), script="Object.defineProperty(navigator, 'gpu', {get:()=>undefined})")
        check('Missing navigator.gpu uses Canvas 2D', missing['diagnostics']['path']=='canvas2d')
        check('No-GPU fallback has no initialization errors', missing['diagnostics']['errors']==[])
        page.locator('.motion-toggle').click()
        page.screenshot(path=str(OUT/'fallback-hero.png'),scale='css')
        page.screenshot(path=str(OUT/'fallback-desktop.png'),full_page=True,scale='css')
        page.locator('.affordability-details summary').click()
        page.locator('#income').fill('2000')
        check('Fallback calculator remains functional', page.locator('#affordability').get_attribute('data-state')=='danger')
        page.close()

        page, quiet_fallback = open_page(browser, 'Mobile Canvas 2D reduced motion', http_url,
            viewport={'width':390,'height':844}, mobile=True, motion='reduce',
            script="Object.defineProperty(navigator, 'gpu', {get:()=>undefined})")
        before = page.evaluate('window.__sceneDiagnostics.frames')
        page.wait_for_timeout(200)
        check('Canvas 2D reduced motion has no continuous frames', before == page.evaluate('window.__sceneDiagnostics.frames'))
        check('Mobile Canvas 2D has no overflow', not overflow(page))
        page.screenshot(path=str(OUT/'fallback-mobile.png'),full_page=True,scale='css')
        page.close()

        page, unavailable = open_page(browser, 'Unavailable adapter fallback', http_url, script='navigator.gpu.requestAdapter = async () => null')
        check('Unavailable adapter uses Canvas 2D', unavailable['diagnostics']['path']=='canvas2d')
        page.close()

        loss_script = '''const original = navigator.gpu.requestAdapter.bind(navigator.gpu);
          navigator.gpu.requestAdapter = async (...args) => { const a = await original(...args);
            const originalDevice = a.requestDevice.bind(a); a.requestDevice = async (...args) => {
              const d = await originalDevice(...args); window.__testDevice = d; return d; }; return a; };'''
        page, loss = open_page(browser, 'Device-loss recovery', http_url, script=loss_script)
        page.evaluate('window.__testDevice.destroy()')
        page.wait_for_function("window.__sceneDiagnostics.path === 'canvas2d'")
        loss['afterDeviceLoss'] = page.evaluate('window.__sceneDiagnostics')
        check('Lost WebGPU device gracefully switches to Canvas 2D', loss['afterDeviceLoss']['path']=='canvas2d')
        page.close()

    with p.chromium.launch(channel='chrome', headless=True) as browser:
        page, default = open_page(browser, 'Chrome without WebGPU flag', http_url)
        check('Default Chrome renders a usable scene', default['diagnostics']['path'] in ['webgpu','canvas2d'])
        page.close()

        page = browser.new_page(java_script_enabled=False, viewport={'width':390,'height':844})
        page.goto((ROOT/'index.html').as_uri())
        check('HTML content remains readable without JavaScript', page.locator('h1').is_visible() and page.locator('#leistungen').is_visible())
        check('Without JavaScript a calculator explanation is shown', page.locator('noscript').is_visible())
        check('No JavaScript does not introduce horizontal overflow', not overflow(page))
        page.close()

    for scenario in RESULTS['scenarios']:
        check(scenario['name']+': no console errors', not scenario['consoleErrors'])
        check(scenario['name']+': no external network requests', not scenario['externalRequests'])

(OUT/'verification.json').write_text(json.dumps(RESULTS,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'chrome':RESULTS['browser'],'checks':len(RESULTS['checks']),
      'scenarios':[{ 'name':s['name'],'renderer':s['diagnostics']['path'],
                    'errors':s['consoleErrors'],'warnings':s['consoleWarnings']} for s in RESULTS['scenarios']]},ensure_ascii=False,indent=2))
