from pathlib import Path
from playwright.sync_api import sync_playwright
import json, re
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parent
out=root/'screenshots'
report={'errors':[],'failedRequests':[],'viewports':{}}
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True,args=['--enable-unsafe-webgpu'])
 page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 page.on('console',lambda m:report['errors'].append(m.text) if m.type=='error' else None)
 page.on('requestfailed',lambda r:report['failedRequests'].append(r.url))
 url='http://127.0.0.1:5180/astra-04-vorlage-bf/index.html'
 try:
  response=page.goto(url,wait_until='networkidle',timeout=7000)
  if not response or response.status!=200 or page.title()!='Dreiland Finanzen – Ihr Vorhaben. Unser Rückhalt.':raise ValueError('Server root does not match')
 except Exception:
  url=root.joinpath('index.html').as_uri();page.goto(url,wait_until='networkidle')
 report['url']=url
 report['errors']=[];report['failedRequests']=[]
 for label,w,h in [('desktop',1440,900),('mobile',390,844),('narrow',360,844),('tablet',768,1024),('medium',1024,900),('wide',1920,1080)]:
  page.set_viewport_size({'width':w,'height':h});page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(200)
  page.evaluate('document.fonts.ready')
  report['viewports'][label]=page.evaluate('''()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,slider:document.querySelector('#amount-slider').getBoundingClientRect().toJSON(),term:document.querySelector('#term').getBoundingClientRect().toJSON(),rate:document.querySelector('#monthly').getBoundingClientRect().toJSON(),cta:document.querySelector('.result .button').getBoundingClientRect().toJSON(),legal:document.querySelector('.legal').getBoundingClientRect().toJSON(),words:document.body.innerText.trim().split(/\\s+/u).length})''')
  if label in ['desktop','mobile']:
   page.screenshot(path=str(out/f'hero-{label}.png'))
   page.screenshot(path=str(out/f'{label}.png'),full_page=True)
  assert report['viewports'][label]['scrollWidth']<=w, f'overflow {label}'
  if label in ['desktop','mobile']:
   for key in ['slider','term','rate','cta','legal']:
    assert report['viewports'][label][key]['bottom']<=h,f'{key} below viewport {label}'
 page.set_viewport_size({'width':1440,'height':900})
 initial=page.locator('#monthly').inner_text()
 page.locator('#amount-slider').focus();page.keyboard.press('ArrowRight')
 moved=page.locator('#monthly').inner_text()
 assert initial!=moved
 report['sliderChange']={'before':initial,'after':moved,'method':'ArrowRight on range'}
 page.locator('#term').select_option('24');short=page.locator('#monthly').inner_text();assert short!=moved
 report['termChange']=short
 page.locator('#amount').fill("20'000");page.locator('#amount').blur()
 report['typedAmount']={'amount':page.locator('#amount').input_value(),'slider':page.locator('#amount-slider').input_value(),'rate':page.locator('#monthly').inner_text()}
 assert page.locator('#amount-slider').input_value()=='20000'
 page.locator('#amount').fill('1');assert page.locator('#amount').get_attribute('aria-invalid')=='true'
 page.locator('#amount').fill("15'000");page.locator('#amount').blur();page.locator('#term').select_option('48')
 page.locator('#kosten > summary').click()
 assert page.locator('#total').is_visible()
 report['costs']={'principal':page.locator('#principal').inner_text(),'interest':page.locator('#interest').inner_text(),'total':page.locator('#total').inner_text(),'panel':page.locator('.cost-panel').bounding_box()}
 page.locator('.cost-panel').scroll_into_view_if_needed();page.wait_for_timeout(400);page.screenshot(path=str(out/'kosten-desktop.png'))
 page.locator('.budget > summary').click()
 page.locator('#income').fill('5000');page.locator('#expenses').fill('3000')
 report['budgetNormal']=page.locator('#budget-result').inner_text()
 page.locator('#expenses').fill('4900');assert page.locator('#budget-result').get_attribute('data-state')=='danger'
 report['budgetDanger']=page.locator('#budget-result').inner_text()
 page.locator('#kosten > summary').click()
 page.locator('#contact-open').click();assert page.locator('#contact-dialog').is_visible()
 report['dialog']=page.locator('#selection-summary').inner_text()
 page.keyboard.press('Escape');assert not page.locator('#contact-dialog').is_visible()
 assert page.locator('#contact-open').evaluate('(e)=>e===document.activeElement')
 page.set_viewport_size({'width':390,'height':844});page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(300)
 page.locator('.menu-toggle').click();assert page.locator('#mobile-nav').is_visible()
 page.wait_for_timeout(250);page.screenshot(path=str(out/'menu-mobile.png'))
 page.keyboard.press('Escape');assert not page.locator('#mobile-nav').is_visible()
 page.locator('.menu-toggle').click();page.locator('#mobile-nav a[href="#leistungen"]').click();assert not page.locator('#mobile-nav').is_visible()
 report['menu']='Open, Escape, focus return, anchor navigation and close: passed'
 report['anchors']=page.locator('a[href^="#"]').evaluate_all('(els)=>els.filter(e=>!document.querySelector(e.getAttribute("href"))).map(e=>e.outerHTML)')
 assert not report['anchors']
 report['images']=page.locator('img').evaluate_all('(els)=>els.map(e=>({src:e.getAttribute("src"),loaded:e.complete&&e.naturalWidth>0}))')
 assert all(i['loaded'] for i in report['images'])
 page.emulate_media(reduced_motion='reduce');report['reducedMotion']=page.evaluate('getComputedStyle(document.documentElement).scrollBehavior');assert report['reducedMotion']=='auto'
 page.goto(root.joinpath('index.html').as_uri(),wait_until='networkidle')
 report['fileProtocol']='passed' if page.locator('#monthly').inner_text() else 'failed'
 browser.close()
ref=Image.open(root/'_referenz/hero-desktop.png').convert('RGB')
ours=Image.open(out/'hero-desktop.png').convert('RGB')
comparison=Image.new('RGB',(2880,956),'#EEF1F6')
draw=ImageDraw.Draw(comparison)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
draw.text((26,16),'VORLAGE · bf.imnota.xyz · 1440 × 900',font=font,fill='#062B63')
draw.text((1466,16),'DREILAND FINANZEN · Astra 04 · 1440 × 900',font=font,fill='#062B63')
comparison.paste(ref,(0,56));comparison.paste(ours,(1440,56));comparison.save(out/'vergleich.png')
(root/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'url':report['url'],'errors':report['errors'],'failedRequests':report['failedRequests'],'words':{k:v['words'] for k,v in report['viewports'].items()},'sliderChange':report['sliderChange'],'checks':'passed'},ensure_ascii=True,indent=2))
