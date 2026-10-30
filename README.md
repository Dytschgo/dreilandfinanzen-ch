<img src="styles/_assets/logo/dreiland-finanzen_icon_farbig.svg" width="64" height="64" alt="">

# dreilandfinanzen.ch

Brand Kit und Website-Designvarianten für **Dreiland Finanzen** – Kreditberatung im Dreiländereck.

| Ordner | Inhalt |
|---|---|
| `styles/` | 13 Landingpage-Varianten (Claude, GPT-6.1 Sol, GPT-6 Astra) und der Design-Viewer (`styles/index.html`) |
| `tools/` | Generatoren: Brand Kit (`build.py`), veröffentlichbare Website (`build_site.py`) |

## Lokal ansehen

```
python -m http.server 5180 --bind 127.0.0.1 --directory styles
```

Dann http://127.0.0.1:5180/ öffnen. Wechseln mit ← / →, Suche mit ⌘K / Strg+K.

## Veröffentlichen

```
python tools/build_site.py
```

Erzeugt `site/` (ohne Screenshots und Prüfskripte, mit `robots.txt` und `.htaccess` gegen Indexierung).
Der Inhalt von `site/` gehört ins Web-Root von dreilandfinanzen.ch.

## Brand Kit

```
pip install pillow playwright uharfbuzz fonttools
python tools/build.py
```

Erzeugt `dist/Dreiland-Finanzen_Brand-Kit/` und die ZIP-Datei.

Alle Inhalte enthalten Platzhalter (Kontaktdaten, Zinssätze). Logo-Vektoren, Farben und Schrift sind aus einer
Rastervorlage rekonstruiert (Annäherung).
