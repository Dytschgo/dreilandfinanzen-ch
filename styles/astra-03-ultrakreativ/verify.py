"""Focused local checks and screenshots: python styles/astra-03-ultrakreativ/verify.py"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = Path(__file__).resolve().parent
PAGE_URL = "http://127.0.0.1:5180/astra-03-ultrakreativ/index.html"
REPORT = {"checks": [], "console_errors": [], "failed_requests": []}


def check(name, condition):
    assert condition, name
    REPORT["checks"].append(name)


with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True, args=["--enable-unsafe-webgpu"])
    page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    page.on("pageerror", lambda error: REPORT["console_errors"].append(str(error)))
    page.on("console", lambda message: REPORT["console_errors"].append(message.text) if message.type == "error" else None)
    page.on("requestfailed", lambda request: REPORT["failed_requests"].append(request.url))
    page.goto(PAGE_URL)
    page.evaluate("document.fonts.ready")
    check("Desktop hero slider is visible", page.locator("#hero-amount").evaluate("e=>e.type==='range' && e.getBoundingClientRect().bottom <= innerHeight"))
    check("Default rate is calculated", page.locator("#hero-monthly").inner_text() == "CHF 473.90")
    page.locator("#hero-amount").evaluate("e=>{e.value='30000';e.dispatchEvent(new Event('input',{bubbles:true}))}")
    check("Slider changes displayed amount and monthly rate", page.locator("#hero-amount-text").inner_text() == "CHF 30'000.–" and page.locator("#hero-monthly").inner_text() != "CHF 473.90")
    page.locator("#hero-amount").focus()
    page.keyboard.press("ArrowRight")
    check("Keyboard adjusts slider and live rate", page.locator("#hero-amount").input_value() == "30500" and page.locator("#hero-amount-text").inner_text() == "CHF 30'500.–")
    page.locator("#hero-months").select_option("60")
    check("Term changes monthly rate", page.locator("#hero-monthly").inner_text() != "CHF 1'029.28")
    page.locator("#hero-amount").evaluate("e=>{e.value='15000';e.dispatchEvent(new Event('input',{bubbles:true}))}")
    page.locator("#hero-months").select_option("36")
    page.locator("[data-next='1']").click()
    page.locator("#costs").fill("4100")
    page.locator("[data-next='2']").click()
    check("Budget check computes the amber result", page.locator("#assessment").get_attribute("data-status") == "amber")
    check("No horizontal overflow at desktop", page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
    page.goto(PAGE_URL)
    page.evaluate("document.fonts.ready")
    page.set_viewport_size({"width": 390, "height": 844})
    page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
    check("Mobile hero slider is visible", page.locator("#hero-amount").evaluate("e=>e.getBoundingClientRect().bottom <= innerHeight"))
    page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
    page.screenshot(path=str(BASE / "screenshots" / "hero-mobile.png"), animations="disabled")
    page.screenshot(path=str(BASE / "screenshots" / "mobile.png"), full_page=True, animations="disabled")
    for width in (360, 390, 768, 1024, 1440, 1920):
        page.set_viewport_size({"width": width, "height": 844 if width < 600 else 900})
        check(f"No horizontal overflow at {width}px", page.evaluate("document.documentElement.scrollWidth <= innerWidth"))
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(PAGE_URL)
    page.evaluate("document.fonts.ready")
    page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
    page.screenshot(path=str(BASE / "screenshots" / "hero-desktop.png"), animations="disabled")
    page.screenshot(path=str(BASE / "screenshots" / "desktop.png"), full_page=True, animations="disabled")
    check("No browser console errors", not REPORT["console_errors"])
    check("No failed requests", not REPORT["failed_requests"])
    browser.close()

(BASE / "verification.json").write_text(json.dumps(REPORT, indent=2, ensure_ascii=False), encoding="utf-8")
print(json.dumps(REPORT, indent=2, ensure_ascii=False))
