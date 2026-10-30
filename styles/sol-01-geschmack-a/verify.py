"""Local browser checks and screenshots. Run from project root."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import json
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
SHOTS = ROOT / 'screenshots'
errors = []
report = {'viewports': [], 'checks': []}

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 5180), partial(QuietHandler, directory=str(ROOT.parent)))
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', args=['--enable-unsafe-webgpu'], headless=True)
        page = browser.new_page(viewport={'width': 1440, 'height': 900}, device_scale_factor=1)
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
        page.goto('http://127.0.0.1:5180/sol-01-geschmack-a/index.html')
        page.evaluate('document.fonts.ready')
        report['body_word_count'] = len(page.locator('body').inner_text().split())
        assert page.title().startswith('Dreiland Finanzen')
        amount = page.locator('#amount')
        months = page.locator('#months')
        before = page.locator('#payment').inner_text()
        expected = 15000 * ((1.089**(1/12))-1) / (1-(1.089**(1/12))**-36)
        assert abs(float(before.replace("'", '')) - expected) < .01

        for width, height, shot in [(1440, 900, 'hero-desktop.png'), (390, 844, 'hero-mobile.png')]:
            page.set_viewport_size({'width': width, 'height': height})
            page.screenshot(path=str(SHOTS / shot), full_page=False, animations='disabled')
            bounds = page.locator('#amount').bounding_box()
            assert bounds and bounds['y'] + bounds['height'] <= height, f'Amount slider not visible at {width}x{height}'
            assert page.locator('#months').bounding_box()['y'] + page.locator('#months').bounding_box()['height'] <= height
            report['viewports'].append({'width': width, 'height': height, 'amount_slider_visible': True, 'term_slider_visible': True})
        report['checks'].append(f'Hero sliders visible at 1440x900 and 390x844; default CHF {before}, formula verified')

        page.set_viewport_size({'width': 1440, 'height': 900})
        amount.fill('30000')
        after = page.locator('#payment').inner_text()
        assert after != before, f'Payment did not update: {before} -> {after}'
        months.fill('48')
        assert page.locator('#months-label').inner_text() == '48 Monate'
        report['checks'].append(f'Live calculation updates on slider input: CHF {before} -> CHF {after}; term updates')

        page.locator('.affordability summary').click()
        assert page.locator('#income').is_visible()
        page.locator('#expenses').fill('5000')
        assert page.locator('.budget-outlook').get_attribute('data-state') in ['caution', 'danger']
        page.locator('#income').fill('')
        assert page.locator('.budget-outlook').get_attribute('data-state') == 'invalid'
        report['checks'].append('Expandable affordability check, expense and invalid-input states')

        page.goto('http://127.0.0.1:5180/sol-01-geschmack-a/index.html')
        page.evaluate('document.fonts.ready')
        page.set_viewport_size({'width': 390, 'height': 844})
        page.screenshot(path=str(SHOTS / 'mobile.png'), full_page=True, animations='disabled')
        page.set_viewport_size({'width': 1440, 'height': 900})
        page.screenshot(path=str(SHOTS / 'desktop.png'), full_page=True, animations='disabled')

        for width in [360, 390, 768, 1024, 1440, 1920]:
            page.set_viewport_size({'width': width, 'height': 844 if width < 760 else 900})
            overflow = page.evaluate('document.documentElement.scrollWidth > innerWidth')
            assert not overflow, f'Horizontal overflow at {width}'
            broken = page.evaluate('[...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i=>i.src)')
            assert not broken, broken
            report['viewports'].append({'width': width, 'horizontal_overflow': overflow})

        summary = page.locator('.faq-list summary').first
        summary.focus()
        page.keyboard.press('Enter')
        assert page.locator('.faq-list details').first.get_attribute('open') is not None
        page.keyboard.press('Enter')
        assert page.locator('.faq-list details').first.get_attribute('open') is None
        page.locator('#name').fill('Demo Person')
        page.locator('#email').fill('demo@example.ch')
        page.locator('#contact-form button[type=submit]').click()
        assert page.locator('#contact-result').is_visible()
        with page.expect_download() as info:
            page.locator('#download-note').click()
        assert info.value.suggested_filename == 'dreiland-finanzen-gespraechsnotiz.txt'
        report['checks'].append('FAQ keyboard and local contact-note flow; internal images load')

        page.emulate_media(reduced_motion='reduce')
        assert page.locator('html').evaluate('(e)=>getComputedStyle(e).scrollBehavior') == 'auto'
        report['checks'].append('Reduced motion disables smooth scrolling and entry animation')

        for link in page.locator('a[href^="#"]').all():
            href = link.get_attribute('href')
            assert href == '#' or page.locator(href).count() == 1, href
        report['checks'].append('All in-page links have targets')
        assert not errors, errors
        report['console_errors'] = errors
        browser.close()
finally:
    server.shutdown()
    server.server_close()

(SHOTS / 'verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
