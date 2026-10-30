<img src="assets/logo/favicon.svg" width="64" height="64" alt="">

# dreilandfinanzen.ch

Website und Brand Kit für **Dreiland Finanzen** – Kreditberatung in Basel.

| Pfad | Inhalt |
|---|---|
| `index.html`, `style.css`, `app.js` | Die Website (statisch, ohne Build-Schritt) |
| `assets/` | Schriften (Montserrat, Inter – SIL OFL) und Logo-Dateien der Website |
| `img/` | Bilder der Website (derzeit ein gekennzeichnetes KI-Symbolbild) |
| `brand-kit/` | Fertiges Brand Kit (Logos, Guidelines-PDF, Mockups, ZIP), online unter `/brand-kit/` |
| `tools/` | Generatoren für das Brand Kit |

## Lokal ansehen

```
python -m http.server 5180 --bind 127.0.0.1
```

Dann http://127.0.0.1:5180/ öffnen.

## Kredit & Budgetcheck

Ein Werkzeug in drei Schritten (Ihr Kredit → Ihr Budget → Ihr Spielraum). Kreditregeln und Schätzformel entsprechen
`credit-core` v0.2 (`shared/credit-rules.json`, `estimateCredit`): Beispielzins 7.9 % eff., ab CHF 5'000, Start CHF 20'000 /
48 Monate, Laufzeiten 12–120 Monate, über CHF 80'000 höchstens 84 Monate. Rate ohne Einkommensangabe; Budget optional.
Antragsformular und Zustellung aus credit-core sind noch nicht angebunden (siehe offene Punkte im Projekt).

## Veröffentlichen

Hostinger liefert den Branch `main` direkt aus (Git-Deployment). Jeder Push auf `main` ist sofort live.
`.htaccess` sperrt Repo-Interna (`tools/`, `.github/`, Markdown/Python-Dateien) und setzt `noindex`, solange Platzhalter
(Kontaktdaten, Firmenangaben, Fotos) enthalten sind.

## Brand Kit

```
pip install pillow playwright uharfbuzz fonttools
python tools/build.py
python tools/publish_brandkit.py
```

## Mitmachen & Lizenz

Siehe [CONTRIBUTING.md](CONTRIBUTING.md). Code unter [MIT](LICENSE); Name und Logo von Dreiland Finanzen sind davon
ausgenommen, Schriften unter SIL OFL.
