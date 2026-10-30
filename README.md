<img src="styles/_assets/logo/dreiland-finanzen_icon_farbig.svg" width="64" height="64" alt="">

# dreilandfinanzen.ch

Brand Kit und Website-Designvarianten für **Dreiland Finanzen** – Kreditberatung im Dreiländereck.

| Ordner | Inhalt |
|---|---|
| `styles/` | 13 Landingpage-Varianten (Claude, GPT-6.1 Sol, GPT-6 Astra) und der Design-Viewer (`styles/index.html`) |
| `brand-kit/` | Fertiges Brand Kit (Logos, Guidelines-PDF, Mockups, ZIP) – aktualisieren mit `python tools/build.py && python tools/publish_brandkit.py` |
| `tools/` | Generatoren: Brand Kit (`build.py`), veröffentlichbare Website (`build_site.py`) |

## Lokal ansehen

```
python -m http.server 5180 --bind 127.0.0.1
```

Dann http://127.0.0.1:5180/ öffnen (leitet auf `/styles/` weiter, Brand Kit unter `/brand-kit/`). Wechseln mit ← / →, Suche mit ⌘K / Strg+K.

## Veröffentlichen

```
python tools/build_site.py
```

Erzeugt `site/` (ohne Screenshots und Prüfskripte, mit `robots.txt` und `.htaccess` gegen Indexierung).

```
python tools/publish_site.py
```

Baut `site/` und legt es als Branch **`site`** auf GitHub ab. Hostinger kann `main` direkt ausliefern: `index.html` leitet auf `/styles/` weiter, `.htaccess` sperrt
`tools/`, `.github/` u. a. und setzt noindex. Der Branch `site` enthält dieselbe Struktur ohne Repo-Interna.

## Brand Kit

```
pip install pillow playwright uharfbuzz fonttools
python tools/build.py
```

Erzeugt `dist/Dreiland-Finanzen_Brand-Kit/` und die ZIP-Datei.

## Mitmachen & Lizenz

Siehe [CONTRIBUTING.md](CONTRIBUTING.md). Code unter [MIT](LICENSE); Name und Logo von Dreiland Finanzen sind davon ausgenommen, Schriften unter SIL OFL.

Alle Inhalte enthalten Platzhalter (Kontaktdaten, Zinssätze). Logo-Vektoren, Farben und Schrift sind aus einer
Rastervorlage rekonstruiert (Annäherung).
