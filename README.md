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

Der persönliche Budgetcheck zieht Lebenshaltung, bestehende Verpflichtungen, Jahresrechnungen ÷ 12,
Reserve und die Prüfrate vom verlässlichen Nettoeinkommen ab. Dreilands Prüfrate basiert auf 30 monatlichen
Zahlungen zum Beispielzins; bei kürzerer gewählter Laufzeit gilt deren höhere Rate. Die Kreditkonditionen
oben bleiben auf die gewählte Laufzeit bezogen. Zusatzkosten zeigen den Spielraum in einem teureren Monat.
Haushaltsgrösse und Einkommensstabilität ergänzen die persönliche Prüfung, ohne automatische Haushalts-Pauschalen.
Keine 10-%-Freigabe, keine Kreditzusage und kein Ersatz für die formelle Kreditfähigkeitsprüfung der Kreditgeberin.

Die Einstufung richtet sich nach den benötigten Zahlungen mit dem Betrag, der vor der neuen Rate
nach allen Ausgaben und Reserve verfügbar ist, inklusive Beispielzins: bis 30 rechnerisch tragbar,
31–36 Optimierung nötig, ab 37 nicht tragbar. Benötigte Monatsbeträge werden auf volle Rappen
aufgerundet; eine Restzahlung zählt als ganze Zahlung. Die Vertragslaufzeit verändert diese Einstufung
nicht. Auch im Bereich bis 30 bleiben Hinweise auf einen fehlenden Puffer, unsicheres Einkommen
oder fehlende Reserve bestehen. Keine Rückzahlungsmöglichkeit ist ebenfalls «nicht tragbar».

### Budgetcheck prüfen

Node.js und lokales Google Chrome werden benötigt. Playwright dient nur den lokalen Prüfungen und wird
im ignorierten Verzeichnis `dist/qa` installiert; die Website bleibt ohne externe Laufzeit-Abhängigkeiten.

```powershell
npm install --prefix dist/qa --no-save --package-lock=false playwright
node --check app.js
node tools/verify-budget.cjs
git diff --check
```

Der Test lädt die echte `index.html` mit `app.js` und `style.css` lokal in Headless Chrome.
Er prüft Berechnung, 30/31/36/37-Zahlungsgrenzen (auch einen Rappen darunter), Warnungen,
Eingabefehler, Beratungszusammenfassung, Tastaturbedienung und Layout
bei 1440/900/390/320 Pixeln sowie 200 % Textgrösse. Protokoll und Screenshots liegen unter
`dist/qa/evidence/`. Die Screenshots des Rechners blenden nur für die Aufnahme den haftenden Seitenkopf
und den Sprunglink aus. Es werden keine produktiven Anfragen gestellt.

Die [Feedback-Auswertung](tools/feedback-affordability.md) dokumentiert Annahmen und Abgrenzung.

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
