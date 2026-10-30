"""Rendering über Headless Chrome (Playwright)."""
from __future__ import annotations

from contextlib import contextmanager
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE_CSS = "html,body{margin:0;padding:0;background:transparent}svg{display:block;width:100%;height:100%}"


class Renderer:
    def __init__(self, browser):
        self.browser = browser
        self.page = browser.new_page()

    def svg_png(self, svg: str, w: int, h: int, out: Path, transparent: bool = True):
        out.parent.mkdir(parents=True, exist_ok=True)
        self.page.set_viewport_size({"width": w, "height": h})
        self.page.set_content(f"<!doctype html><style>{BASE_CSS}</style>{svg}")
        self.page.screenshot(path=str(out), omit_background=transparent, full_page=False)

    def html_png(self, html_path: Path, w: int, h: int, out: Path, scale: float = 1, transparent=False):
        out.parent.mkdir(parents=True, exist_ok=True)
        ctx = self.browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=scale)
        pg = ctx.new_page()
        pg.goto(html_path.resolve().as_uri())
        pg.wait_for_load_state("networkidle")
        pg.evaluate("document.fonts.ready")
        pg.screenshot(path=str(out), omit_background=transparent, full_page=False)
        ctx.close()

    def html_pdf(self, html_path: Path, out: Path):
        out.parent.mkdir(parents=True, exist_ok=True)
        pg = self.browser.new_page()
        pg.goto(html_path.resolve().as_uri())
        pg.wait_for_load_state("networkidle")
        pg.evaluate("document.fonts.ready")
        pg.emulate_media(media="print")
        pg.pdf(path=str(out), prefer_css_page_size=True, print_background=True)
        pg.close()


@contextmanager
def renderer():
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome")
        try:
            yield Renderer(b)
        finally:
            b.close()
