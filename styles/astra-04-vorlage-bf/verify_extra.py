import sys,json
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path
from playwright.sync_api import sync_playwright
r=Path('styles/astra-04-vorlage-bf')
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome');page=b.new_page(viewport={'width':360,'height':844});page.goto((r/'index.html').resolve().as_uri())
 page.locator('#amount').fill("100'000");page.locator('#amount').blur();page.locator('#term').select_option('12')
 page.locator('#kosten > summary').click();page.locator('.budget > summary').click();page.locator('#income').fill('6000');page.locator('#expenses').fill('4000')
 page.locator('.cost-panel').scroll_into_view_if_needed();page.wait_for_timeout(300);page.screenshot(path=str(r/'screenshots/kosten-mobile.png'))
 print('Open details 360px:',page.evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,inputWidth:document.querySelector("#amount").clientWidth,inputScroll:document.querySelector("#amount").scrollWidth})'))
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 print('Max-rate',page.locator('#monthly').inner_text())
 page.locator('.faq-list summary').first.click();assert page.locator('.faq-list details').nth(0).get_attribute('open') is not None
 page.locator('.faq-list summary').nth(1).click();assert page.locator('.faq-list details').nth(0).get_attribute('open') is None
 page.locator('#contact-open').click();page.wait_for_timeout(300);page.screenshot(path=str(r/'screenshots/kontakt-mobile.png'));page.keyboard.press('Escape')
 page.locator('#kosten > summary').click();page.locator('#budget-link').click();assert page.locator('#income').is_visible()
 # Check actual reference motion and dimensions without downloading code bundles.
 page.set_viewport_size({'width':1440,'height':900});page.goto('https://bf.imnota.xyz/',wait_until='networkidle')
 styles=page.evaluate('''()=>Array.from(document.querySelectorAll('header,main>section,main>div,h1,h2,button,input[type=range],a,details')).map(e=>{const s=getComputedStyle(e);return {tag:e.tagName,classes:e.className,text:e.innerText.slice(0,60),font:s.fontFamily,size:s.fontSize,radius:s.borderRadius,shadow:s.boxShadow,transition:s.transitionDuration,animation:s.animationName}}).filter(x=>x.tag!=='A'||x.transition!=='0s')''')
 (r/'_referenz/visual-observations.json').write_text(json.dumps(styles,ensure_ascii=False,indent=2),encoding='utf-8')
 b.close()
# Contrast checks for text/control pairs.
def lum(h):
 values=[int(h[i:i+2],16)/255 for i in (1,3,5)]
 values=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in values]
 return sum(v*w for v,w in zip(values,[.2126,.7152,.0722]))
for a,b in [('#062B63','#FFFFFF'),('#0A4682','#FFFFFF'),('#58637E','#FFFFFF'),('#58637E','#EEF1F6'),('#CE2530','#EEF1F6')]:
 x,y=sorted([lum(a),lum(b)]);print(a,b,round((y+.05)/(x+.05),2))
