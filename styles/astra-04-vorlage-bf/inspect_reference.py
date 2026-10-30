from playwright.sync_api import sync_playwright
from pathlib import Path
import json
r=Path('styles/astra-04-vorlage-bf/_referenz')
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 page=b.new_page(viewport={'width':1440,'height':900});page.goto('https://bf.imnota.xyz/',wait_until='networkidle')
 print('NAV',page.locator('header').evaluate('(e)=>e.outerHTML')[:14000])
 page.get_by_role('button',name='Kosten im Detail').click();page.wait_for_timeout(400)
 page.locator('input[type=range]').scroll_into_view_if_needed();page.screenshot(path=str(r/'kosten-desktop.png'))
 print('DETAIL',page.locator('body').inner_text()[:3700])
 # Read visual and animation styles, no bundle downloading.
 print('ANIMATION',page.evaluate('Array.from(document.querySelectorAll("*"),e=>({tag:e.tagName,cls:e.className,transition:getComputedStyle(e).transition,animation:getComputedStyle(e).animationName})).filter(x=>x.animation!=="none"||!x.transition.startsWith("all 0s")).slice(0,45)'))
 page.get_by_text('Kreditlösungen',exact=True).first.hover();page.wait_for_timeout(400);page.screenshot(path=str(r/'mega-desktop.png'))
 print('NAVHOVER',page.locator('header').inner_text())
 page.set_viewport_size({'width':390,'height':844});page.evaluate('window.scrollTo(0,0)')
 print('MOBILE',page.locator('header').evaluate('(e)=>e.outerHTML')[:11000])
 page.locator('header button').first.click();page.wait_for_timeout(400);page.screenshot(path=str(r/'menu-mobile.png'))
 print('MOBILEOPEN',page.locator('header').inner_text())
 b.close()
