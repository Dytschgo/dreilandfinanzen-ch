from pathlib import Path
import json
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
SHOTS = ROOT / 'screenshots'
report = {'console_errors': [], 'page_errors': [], 'external_requests': [], 'checks': []}
with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', args=['--enable-unsafe-webgpu'], headless=True)
    page = browser.new_page(viewport={'width':1440,'height':900}, device_scale_factor=1)
    page.on('console', lambda msg: report['console_errors'].append(msg.text) if msg.type == 'error' else None)
    page.on('pageerror', lambda error: report['page_errors'].append(str(error)))
    page.on('request', lambda req: report['external_requests'].append(req.url) if req.url.startswith(('http:','https:')) else None)
    page.goto((ROOT/'index.html').as_uri())
    page.evaluate('document.fonts.ready')
    desktop_bounds=page.locator('#amount-range').evaluate('(e)=>({bottom:e.getBoundingClientRect().bottom,height:innerHeight})')
    assert desktop_bounds['bottom'] <= desktop_bounds['height'], desktop_bounds
    page.screenshot(path=str(SHOTS/'hero-desktop.png'))
    page.screenshot(path=str(SHOTS/'desktop.png'), full_page=True)
    report['checks'].append({'desktop_hero_slider_bottom':round(desktop_bounds['bottom'],1),'viewport_height':desktop_bounds['height']})
    # Contrast scan skips content in collapsed native disclosures.
    contrast=page.evaluate('''() => {
      const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      const lum=rgb=>{const c=rgb.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return c[0]*.2126+c[1]*.7152+c[2]*.0722};
      let checked=0,minimum=100;const failures=[];
      for(const el of document.querySelectorAll('body *')){
        if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||el.closest('[aria-hidden=true],svg,noscript,[hidden],details:not([open])')||!el.getClientRects().length)continue;
        const s=getComputedStyle(el);if(s.visibility==='hidden')continue;
        const chain=[];let node=el;while(node){chain.unshift(node);node=node.parentElement}
        ctx.fillStyle='white';ctx.fillRect(0,0,1,1);for(const ancestor of chain){ctx.fillStyle=getComputedStyle(ancestor).backgroundColor;ctx.fillRect(0,0,1,1)}
        const back=lum([...ctx.getImageData(0,0,1,1).data]);ctx.fillStyle=s.color;ctx.fillRect(0,0,1,1);const fore=lum([...ctx.getImageData(0,0,1,1).data]);
        const ratio=(Math.max(back,fore)+.05)/(Math.min(back,fore)+.05),size=parseFloat(s.fontSize),large=size>=24||(size>=18.66&&parseInt(s.fontWeight)>=700);checked++;minimum=Math.min(minimum,ratio);
        if(ratio<(large?3:4.5))failures.push({tag:el.tagName,text:el.innerText?.slice(0,60),ratio,required:large?3:4.5});
      }return{checked,minimum,failures};
    }''')
    report['text_contrast']=contrast
    assert not contrast['failures'],contrast['failures']
    # Default annuity and live range interaction.
    expected=15000*((1.089)**(1/12)-1)/(1-(1.089)**(-36/12))
    initial=float(page.locator('#monthly').inner_text())
    assert abs(expected-initial)<.005,(expected,initial)
    page.locator('#amount-range').focus()
    page.keyboard.press('ArrowRight')
    moved=float(page.locator('#monthly').inner_text())
    assert moved != initial,(initial,moved)
    assert page.locator('#amount-display').inner_text() != "CHF 15'000.–"
    page.locator('#amount-range').focus()
    page.keyboard.press('Home')
    page.locator('#amount-range').focus()
    page.keyboard.press('End')
    assert page.locator('#amount-display').inner_text() == "CHF 100'000.–"
    page.locator('#amount-range').focus()
    page.keyboard.press('Home')
    page.locator('#amount-range').focus()
    for _ in range(28): page.keyboard.press('ArrowRight')
    assert page.locator('#amount-display').inner_text() == "CHF 15'000.–"
    report['checks'].append({'default_monthly_payment':round(initial,2),'after_slider_keypress':round(moved,2),'slider_amount_display':'updates and formats as CHF'})
    # Term, affordability, errors and statuses.
    page.locator('#months').select_option('12')
    assert float(page.locator('#monthly').inner_text().replace("'",'')) > initial
    page.locator('#months').select_option('36')
    affordability=page.locator('.affordability-check')
    affordability.locator('summary').click()
    for value,expected_status in [('6500','green'),('5500','amber'),('4200','red')]:
        page.locator('#income').fill(value);page.wait_for_timeout(210)
        assert page.locator('.status-box').get_attribute('data-status')==expected_status
    page.locator('#income').fill('')
    assert page.locator('#input-error').is_visible() and page.locator('#monthly').inner_text()=='—'
    page.locator('#income').fill('5500')
    page.locator('#expenses').fill('-1')
    assert page.locator('#input-error').is_visible()
    page.locator('#expenses').fill('3900')
    report['checks'].append('Term changes, three affordability states and invalid-input handling')
    # The moved atlas controls and the shortened FAQ/contact interactions remain usable.
    page.locator('[data-country="fr"][type="button"]').focus();page.keyboard.press('Enter')
    assert page.locator('.atlas').get_attribute('data-country')=='fr'
    page.locator('.atlas-toggle').focus();page.keyboard.press('Space')
    assert page.locator('.atlas').get_attribute('data-mode')=='apart'
    page.locator('.atlas-toggle').click();assert page.locator('.atlas').get_attribute('data-mode')=='together'
    page.locator('.faq-list summary').first.focus();page.keyboard.press('Enter')
    assert page.locator('.faq-list details').first.get_attribute('open') is not None
    page.locator('.faq-list summary').first.focus();page.keyboard.press('Enter')
    page.locator('#topic').select_option(label='Einen Privatkredit prüfen')
    page.locator('input[value="Online"]').check();page.locator('#contact-form button').click()
    assert page.locator('#contact-result').is_visible()
    with page.expect_download() as download_info: page.locator('#download-note').click()
    note=Path(download_info.value.path()).read_text(encoding='utf-8-sig')
    assert 'Einen Privatkredit prüfen' in note and 'Online' in note and 'kein Termin gebucht' in note
    report['checks'].append('Atlas keyboard controls, FAQ and local conversation note')
    # Narrow width and zoom check.
    for width in [360,390,768,1024,1440,1920]:
        page.set_viewport_size({'width':width,'height':844 if width<500 else 900})
        dims=page.evaluate('({scroll:document.documentElement.scrollWidth,viewport:innerWidth})')
        assert dims['scroll']<=dims['viewport'],(width,dims)
    page.evaluate("document.documentElement.style.fontSize='200%'")
    dims=page.evaluate('({scroll:document.documentElement.scrollWidth,viewport:innerWidth})')
    assert dims['scroll']<=dims['viewport'],('200% text',dims)
    page.evaluate("document.documentElement.style.fontSize=''")
    page.set_viewport_size({'width':390,'height':844});page.reload();page.evaluate('document.fonts.ready');page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
    mobile_bounds=page.evaluate("() => Object.fromEntries(['#amount-range','#months','#monthly','.hero-calculator .button','.hero-assumption'].map(sel=>[sel,document.querySelector(sel).getBoundingClientRect().bottom]))")
    assert max(mobile_bounds.values())<=page.evaluate('innerHeight'),mobile_bounds
    page.screenshot(path=str(SHOTS/'hero-mobile.png'))
    page.screenshot(path=str(SHOTS/'mobile.png'),full_page=True)
    report['checks'].append({'mobile_hero_controls_bottoms':{k:round(v,1) for k,v in mobile_bounds.items()},'viewport_height':page.evaluate('innerHeight')})
    page.set_viewport_size({'width':1440,'height':900});page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
    report['body_word_count_1440x900']=page.evaluate("document.body.innerText.trim().split(/\\s+/).filter(Boolean).length")
    report['checks'].append('No horizontal scroll at 360, 390, 768, 1024, 1440 or 1920 px; 200% text at 390 px')
    # Reduced motion.
    page.emulate_media(reduced_motion='reduce')
    page.locator('.atlas-toggle').click()
    assert page.locator('.land-fr').evaluate('e=>getComputedStyle(e).transitionDuration')=='0s'
    report['checks'].append('Reduced motion leaves map state changes immediate')
    context=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
    nojs=context.new_page();nojs.goto((ROOT/'index.html').as_uri())
    assert nojs.locator('#hero-title').is_visible() and nojs.locator('#atlas-svg').is_visible()
    assert nojs.locator('#amount-range').is_disabled() and nojs.locator('.fallback-notice').is_visible()
    report['checks'].append('No JavaScript: labelled example, disabled controls and static map')
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self,*_): pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT.parent)))
    Thread(target=server.serve_forever,daemon=True).start()
    served=browser.new_page(viewport={'width':390,'height':844});errors=[]
    served.on('response',lambda response:errors.append(str(response.status)+' '+response.url) if response.status>=400 else None)
    served.goto(f'http://127.0.0.1:{server.server_port}/{ROOT.name}/index.html');served.evaluate('document.fonts.ready')
    assert served.locator('#monthly').inner_text()=='473.90' and not errors,errors
    assert served.locator('.hero-assumption').evaluate('(e)=>e.getBoundingClientRect().bottom<=innerHeight')
    report['checks'].append('Local HTTP path loads logo, local fonts, calculator and first-screen slider')
    server.shutdown();server.server_close();browser.close()
assert not report['console_errors'] and not report['page_errors'] and not report['external_requests'],report
(SHOTS/'verification.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
print(json.dumps(report,indent=2,ensure_ascii=False))
