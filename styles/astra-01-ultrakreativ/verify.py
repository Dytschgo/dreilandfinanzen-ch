from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import json

ROOT = Path(__file__).resolve().parent
BASE = 'http://127.0.0.1:5180/astra-01-ultrakreativ/index.html'
errors = []
checks = []
def passed(text): checks.append(text)
with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True, args=['--enable-unsafe-webgpu'])
    page = browser.new_page(viewport={'width':1440,'height':900}, device_scale_factor=1)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
    response = page.goto(BASE, wait_until='networkidle')
    assert response and response.status == 200
    page.evaluate('document.fonts.ready')
    expect(page.locator('#monthly')).to_have_text('473.90')
    expect(page.locator('#spielraum')).to_have_accessible_name('IHR SPIELRAUM-CHECK Lokal berechnet · nichts wird gesendet')
    for width, height, shot, full in [(1440,900,'hero-desktop.png',False),(390,844,'hero-mobile.png',False),(1440,900,'desktop.png',True),(390,844,'mobile.png',True),(360,844,'mobile-360.png',False)]:
        page.set_viewport_size({'width':width,'height':height})
        page.evaluate('document.fonts.ready')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'horizontal overflow at {width}px'
        slider=page.locator('#amount')
        bounds=slider.bounding_box()
        assert bounds and bounds['y'] + bounds['height'] <= height, f'amount slider outside first viewport at {width}x{height}: {bounds}'
        page.screenshot(path=str(ROOT/'screenshots'/shot), full_page=full)
        passed(f'{shot}: rendered at {width}x{height}; amount slider within viewport; no horizontal overflow')
    page.set_viewport_size({'width':1440,'height':900})
    page.locator('#amount').focus()
    page.keyboard.press('ArrowRight')
    expect(page.locator('#amount-label')).to_have_text("CHF 15'500.–")
    expect(page.locator('#monthly')).not_to_have_text('473.90')
    expect(page.locator('#total')).not_to_have_text("CHF 17'060.57")
    passed('Amount slider changes monthly payment and total live')
    page.locator('#duration').focus()
    page.keyboard.press('ArrowRight')
    expect(page.locator('#duration-label')).to_have_text('48 Monate')
    passed('Duration slider keyboard operation updates its value')
    page.locator('.affordability summary').click()
    expect(page.locator('#income')).to_be_visible()
    page.locator('#expenses').fill('5400')
    expect(page.locator('.budget-status')).to_have_attribute('data-state','red')
    passed('Expandable affordability check updates the budget state')
    assert not errors, errors
    file_page = browser.new_page(viewport={'width':390,'height':844})
    file_page.on('pageerror', lambda error: errors.append(str(error)))
    file_page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
    file_page.goto((ROOT/'index.html').as_uri(), wait_until='networkidle')
    expect(file_page.locator('#monthly')).to_have_text('473.90')
    assert file_page.locator('#amount').is_visible()
    passed('file:// loads the calculator and local assets')
    assert not errors, errors
    passed('No browser console or page errors')
    words=page.locator('body').inner_text().split()
    report={'result':'PASS','url':BASE,'checks':checks,'console_errors':errors,'body_innerText_words_after':len(words)}
    (ROOT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    browser.close()
