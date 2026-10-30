"""Focused browser verification for the hero calculator rework."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
import json
from playwright.sync_api import sync_playwright

FOLDER = Path(__file__).resolve().parent
SCREENSHOTS = FOLDER / 'screenshots'
SCREENSHOTS.mkdir(exist_ok=True)
REPORT = {'checks': [], 'console_errors': [], 'failed_requests': [], 'word_count': {}}

def check(label, value):
    assert value, label
    REPORT['checks'].append(label)

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

handler = partial(QuietHandler, directory=str(FOLDER.parents[1]))
server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/styles/sol-04-ultramodern/index.html'

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(channel='chrome', args=['--enable-unsafe-webgpu'])
    page = browser.new_page(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
    page.on('pageerror', lambda error: REPORT['console_errors'].append(str(error)))
    page.on('console', lambda msg: REPORT['console_errors'].append(msg.text) if msg.type == 'error' else None)
    page.on('requestfailed', lambda req: REPORT['failed_requests'].append(req.url))
    page.goto(url, wait_until='networkidle')
    page.evaluate('document.fonts.ready')
    check('Local fonts loaded', page.evaluate('document.fonts.check("500 16px Inter") && document.fonts.check("550 16px Montserrat")'))
    REPORT['word_count']['desktop'] = len(page.evaluate('document.body.innerText').split())
    check('Hero amount slider is visible in the desktop viewport', page.locator('#amount').evaluate('(el) => el.getBoundingClientRect().bottom <= innerHeight'))
    before = page.locator('#monthly').inner_text()
    page.locator('#amount').evaluate("el => { el.value = '30000'; el.dispatchEvent(new Event('input', {bubbles:true})); }")
    page.wait_for_timeout(400)
    check('Amount slider updates the monthly example live', page.locator('#monthly').inner_text() != before)
    page.locator('#amount').evaluate("el => { el.value = '15000'; el.dispatchEvent(new Event('input', {bubbles:true})); }")
    page.locator('.term-options label').first.click()
    short_term_rate = float(page.locator('#monthly').inner_text().replace("'", ''))
    page.locator('.term-options label').nth(2).click()
    check('Term chips recalculate the monthly example', short_term_rate > float(page.locator('#monthly').inner_text().replace("'", '')))
    page.locator('.affordability summary').click()
    page.locator('.calculation-details summary').click()
    page.wait_for_timeout(100)
    check('Affordability details open and budget status is shown', page.locator('.budget-status').is_visible())
    check('One calculator action is present', page.locator('#discuss-result').count() == 1)
    check('Legal disclosure is next to the hero calculator', 'Art. 3 UWG' in page.locator('.calculator-disclosure').inner_text())

    page.locator('.affordability').evaluate('el => el.open = false')
    page.locator('.calculation-details').evaluate('el => el.open = false')
    page.screenshot(path=str(SCREENSHOTS / 'hero-desktop.png'))
    page.screenshot(path=str(SCREENSHOTS / 'desktop.png'), full_page=True)

    for width, height in [(390, 844), (360, 844), (768, 900), (1024, 900), (1920, 1080)]:
        page.set_viewport_size({'width': width, 'height': height})
        page.wait_for_timeout(150)
        check(f'No horizontal overflow at {width}px', page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
        if width == 390:
            page.locator('.affordability').evaluate('el => el.open = false')
            REPORT['word_count']['mobile'] = len(page.evaluate('document.body.innerText').split())
            check('Hero amount slider is visible in the mobile viewport', page.locator('#amount').evaluate('(el) => el.getBoundingClientRect().bottom <= innerHeight'))
            check('Hero action is visible in the mobile viewport', page.locator('#discuss-result').evaluate('(el) => el.getBoundingClientRect().bottom <= innerHeight'))
            check('Required disclosure is visible in the mobile viewport', page.locator('.calculator-disclosure').evaluate('(el) => el.getBoundingClientRect().bottom <= innerHeight'))
            page.screenshot(path=str(SCREENSHOTS / 'hero-mobile.png'))
            page.screenshot(path=str(SCREENSHOTS / 'mobile.png'), full_page=True)
            button = page.locator('.menu-toggle')
            button.click()
            check('Mobile menu opens', button.get_attribute('aria-expanded') == 'true')
            page.keyboard.press('Escape')
            check('Mobile menu closes with Escape', button.get_attribute('aria-expanded') == 'false')

    page.locator('#discuss-result').click()
    check('Calculator action transfers the example to contact', "15'000" in page.locator('#contact-message').input_value())
    page.emulate_media(reduced_motion='reduce')
    check('Reduced motion leaves the page usable', page.locator('#amount').is_visible() and page.locator('#discuss-result').is_visible())
    check('No browser console errors', not REPORT['console_errors'])
    check('No failed requests', not REPORT['failed_requests'])
    file_page = browser.new_page(viewport={'width': 390, 'height': 844})
    file_page.on('pageerror', lambda error: REPORT['console_errors'].append(str(error)))
    file_page.goto(FOLDER.joinpath('index.html').as_uri(), wait_until='networkidle')
    check('Direct file opening keeps the calculator usable', file_page.locator('#amount').is_visible() and file_page.locator('#discuss-result').is_visible())
    browser.close()
server.shutdown()
(FOLDER / 'verification.json').write_text(json.dumps(REPORT, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(json.dumps(REPORT, indent=2, ensure_ascii=False))
