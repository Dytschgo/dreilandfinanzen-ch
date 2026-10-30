from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path('styles/astra-04-vorlage-bf/_referenz')
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
 page.goto('https://bf.imnota.xyz/',wait_until='networkidle')
 page.wait_for_timeout(1400)
 page.screenshot(path=str(root/'hero-desktop.png'))
 # Trigger any reveal sections before full-page capture.
 for y in range(0,page.evaluate('document.documentElement.scrollHeight'),650):
  page.evaluate('(y)=>window.scrollTo(0,y)',y);page.wait_for_timeout(150)
 page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(500)
 page.screenshot(path=str(root/'desktop.png'),full_page=True)
 text=page.locator('body').inner_text()
 (root/'page-text.txt').write_text(text,encoding='utf-8')
 print(text)
 print('BUTTONS',page.locator('button').all_text_contents())
 print('INPUTS',page.locator('input').evaluate_all('(els)=>els.map(e=>({type:e.type,min:e.min,max:e.max,value:e.value,aria:e.getAttribute("aria-label")}))'))
 print('STRUCTURE',page.locator('h1,h2,h3').evaluate_all('(els)=>els.map(e=>({tag:e.tagName,text:e.innerText,font:getComputedStyle(e).fontSize,weight:getComputedStyle(e).fontWeight,rect:e.getBoundingClientRect().toJSON()}))'))
 page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(500)
 page.screenshot(path=str(root/'hero-mobile.png'))
 page.screenshot(path=str(root/'mobile.png'),full_page=True)
 print('MOBILE BUTTONS',page.locator('button:visible').all_text_contents())
 browser.close()
