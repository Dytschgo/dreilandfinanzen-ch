"""Local verification: python styles/sol-02-geschmack-b/verify.py
Requires the installed Python Playwright package and Google Chrome.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
import math
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parent
SHOTS = ROOT / 'screenshots'
SHOTS.mkdir(exist_ok=True)
report = {'browser': 'Google Chrome, headless', 'checks': [], 'console_errors': [], 'failed_requests': []}


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


def check(label, condition=True):
    assert condition, label
    report['checks'].append(label)


def contrast(a, b):
    def luminance(value):
        channels = [int(value[i:i+2], 16) / 255 for i in (1, 3, 5)]
        channels = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in channels]
        return sum(v * k for v, k in zip(channels, (.2126, .7152, .0722)))
    x, y = sorted((luminance(a), luminance(b)))
    return (y + .05) / (x + .05)


with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce', accept_downloads=True)
    page = context.new_page()
    page.on('pageerror', lambda error: report['console_errors'].append(str(error)))
    page.on('console', lambda msg: report['console_errors'].append(msg.text) if msg.type == 'error' else None)
    page.on('requestfailed', lambda request: report['failed_requests'].append(request.url))
    remote_requests = []
    page.on('request', lambda request: remote_requests.append(request.url) if request.url.startswith('https://') else None)
    page.goto((ROOT / 'index.html').as_uri())
    page.evaluate('document.fonts.ready')
    check('file:// loads all images and fonts', page.evaluate("[...document.images].every(i => i.complete && i.naturalWidth > 0) && document.fonts.check('16px Inter') && document.fonts.check('16px Montserrat') && document.fonts.check('16px \"Source Serif 4\"')"))
    page.keyboard.press('Tab')
    check('Skip link is first keyboard target', page.locator('.skip-link').evaluate('(el) => el === document.activeElement'))
    page.keyboard.press('Enter')
    check('Skip link reaches main content', page.evaluate("location.hash === '#inhalt'"))

    rate = math.pow(1.089, 1 / 12) - 1
    expected = 15000 * rate / (1 - math.pow(1 + rate, -36))
    check('Annuity uses effective monthly interest', abs(float(page.locator('#monthly').inner_text()) - expected) < .005)
    check('Hero slider is visible in desktop first viewport', page.locator('#amount').evaluate('(el) => el.getBoundingClientRect().bottom <= innerHeight'))
    initial_rate = page.locator('#monthly').inner_text()
    page.locator('#amount').evaluate('(el) => {el.value=20000;el.dispatchEvent(new Event("input",{bubbles:true}));}')
    check('Changing hero slider updates monthly rate', page.locator('#monthly').inner_text() != initial_rate)
    page.locator('#amount').evaluate('(el) => {el.value=15000;el.dispatchEvent(new Event("input",{bubbles:true}));}')
    page.locator('.budget-disclosure summary').click()
    check('Default affordability: enough room', page.locator('#affordability').get_attribute('data-state') == 'good')
    page.locator('#expenses').fill('4000')
    check('Low budget: caution state', page.locator('#affordability').get_attribute('data-state') == 'warning')
    page.locator('#expenses').fill('4500')
    check('Insufficient budget: stop state', page.locator('#affordability').get_attribute('data-state') == 'danger')
    page.locator('#income').fill('')
    check('Missing input does not produce a misleading result', page.locator('#status-title').inner_text() == 'Budgetangaben prüfen')
    page.locator('#income').fill('-1')
    check('Negative budget input is rejected', page.locator('#status-title').inner_text() == 'Budgetangaben prüfen')
    page.locator('#income').fill('0')
    page.locator('#expenses').fill('0')
    check('Zero income has insufficient budget', page.locator('#affordability').get_attribute('data-state') == 'danger')
    page.locator('#income').fill('5500')
    page.locator('#expenses').fill('3800')
    page.locator('#term').select_option('60')
    long_payment = float(page.locator('#monthly').inner_text())
    long_total = float(page.locator('#total').text_content().replace('CHF ', '').replace("'", ''))
    check('Longer term reduces instalment and increases total cost', long_payment < expected and long_total > expected * 36)
    page.locator('#amount').focus()
    page.keyboard.press('ArrowRight')
    check('Slider is keyboard operable', page.locator('#amount').input_value() == '15500')
    for principal, months in [(1000, '12'), (80000, '60')]:
        page.locator('#amount').evaluate('(el, value) => {el.value=value;el.dispatchEvent(new Event("input",{bubbles:true}));}', principal)
        page.locator('#term').select_option(months)
        actual = float(page.locator('#monthly').inner_text().replace("'", ''))
        reference = principal * rate / (1 - math.pow(1 + rate, -int(months)))
        check(f'Calculation at range endpoint {principal}/{months}', abs(actual - reference) < .005)
    page.locator('#amount').evaluate('(el) => {el.value=15000;el.dispatchEvent(new Event("input",{bubbles:true}));}')
    page.locator('#term').select_option('36')

    summaries = page.locator('.faq summary')
    summaries.nth(0).focus()
    page.keyboard.press('Enter')
    check('FAQ opens using keyboard', page.locator('.faq details').nth(0).get_attribute('open') is not None)
    summaries.nth(1).click()
    check('FAQ uses exclusive native disclosure', page.locator('.faq details[open]').count() == 1)
    summaries.nth(1).click()

    button = page.locator('[data-open="contact-dialog"]')
    button.click()
    expect(page.locator('#contact-dialog')).to_be_visible()
    page.locator('#message').fill('Ich möchte meinen Spielraum verstehen.')
    with page.expect_download() as download_info:
        page.locator('#contact-form button[type="submit"]').click()
    download = download_info.value
    text = Path(download.path()).read_text(encoding='utf-8-sig')
    check('Local conversation note downloads with selected values', 'Ich möchte meinen Spielraum verstehen.' in text and "CHF 15'000.–" in text)
    check('Download is truthfully confirmed', 'keine Anfrage versendet' in page.locator('#contact-status').inner_text())
    page.keyboard.press('Escape')
    expect(page.locator('#contact-dialog')).not_to_be_visible()
    check('Dialog restores focus to its trigger', button.evaluate('(el) => el === document.activeElement'))
    for name in ['legal', 'privacy']:
        page.locator(f'[data-open="{name}-dialog"]').click()
        expect(page.locator(f'#{name}-dialog')).to_be_visible()
        page.locator(f'#{name}-dialog .dialog-close').click()
    check('Impressum and privacy dialogs open and close')
    check('All fragment links have targets', page.evaluate("[...document.querySelectorAll('a[href^=\"#\"]')].every(a=>a.hash==='' || a.hash==='#' || !!document.querySelector(a.hash))"))
    page.locator('.budget-disclosure summary').click()

    for width in [360, 390, 768, 1024, 1440, 1920]:
        page.set_viewport_size({'width': width, 'height': 844 if width < 768 else 900})
        page.evaluate('window.scrollTo(0,0)')
        check(f'No horizontal overflow at {width}px', page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
        if width == 390:
            page.locator('.menu-toggle').click()
            expect(page.locator('#mobile-nav')).to_be_visible()
            page.keyboard.press('Escape')
            expect(page.locator('#mobile-nav')).not_to_be_visible()
            page.locator('.menu-toggle').click()
            page.locator('#mobile-nav a[href="#budgetcheck"]').click()
            check('Mobile navigation closes after selection', page.locator('#mobile-nav').is_hidden())
            page.evaluate('window.scrollTo(0,0)')
            page.locator('.menu-toggle').blur()
            page.screenshot(path=str(SHOTS / 'mobile.png'), full_page=True)
            check('Hero slider is visible in 390px first viewport', page.locator('#amount').evaluate('(el) => el.getBoundingClientRect().bottom <= innerHeight'))
            page.screenshot(path=str(SHOTS / 'hero-mobile.png'))
        if width == 1440:
            page.screenshot(path=str(SHOTS / 'desktop.png'), full_page=True)
            check('Hero slider is visible in 1440px first viewport', page.locator('#amount').evaluate('(el) => el.getBoundingClientRect().bottom <= innerHeight'))
            page.screenshot(path=str(SHOTS / 'hero-desktop.png'))

    check('No remote network dependencies', not remote_requests)
    check('No browser console errors', not report['console_errors'])
    check('No failed file requests', not report['failed_requests'])
    check('No local storage or cookies', page.evaluate('localStorage.length === 0 && sessionStorage.length === 0') and not context.cookies())

    for a, b, label in [('#D9B566', '#031A3D', 'Gold / night'), ('#EEF1F6', '#062B63', 'Mist / navy'), ('#58637E', '#FFFFFF', 'Slate / white'), ('#031A3D', '#D9B566', 'Button'), ('#4F86C6', '#031A3D', 'Blue accent / night')]:
        check(f'Text contrast AA: {label}', contrast(a, b) >= 4.5)

    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT.parent)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        response = page.goto(f'http://127.0.0.1:{server.server_port}/{ROOT.name}/index.html')
        page.evaluate('document.fonts.ready')
        check('HTTP loads successfully', response.status == 200)
        check('HTTP calculator works', page.locator('#monthly').inner_text() == '473.90')
        check('HTTP assets load', page.evaluate('[...document.images].every(i => i.complete && i.naturalWidth > 0)'))
        check('No console or asset errors over HTTP', not report['console_errors'] and not report['failed_requests'])
    finally:
        server.shutdown()
        server.server_close()
    browser.close()

report['result'] = 'PASS'
(ROOT / 'verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"PASS: {len(report['checks'])} checks; no console errors; screenshots saved.")


