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

Drei kurze Schritte: Ihr Kredit → Ihr Budget → Ihr Spielraum. Im Budget werden nur Nettoeinkommen
und Miete inklusive Nebenkosten erfragt. Betrag und Laufzeit lassen sich per Schieberegler ändern;
die Laufzeit ist in 12-Monats-Schritten wählbar. Kein Verwendungszweck, keine weiteren Budgetfragen.

Kreditregeln und Zinsformel entsprechen weiterhin `credit-core` v0.2: Beispielzins 7.9 % effektiv,
ab CHF 5'000, Start CHF 20'000 / 48 Monate, Laufzeiten 12–120 Monate, über CHF 80'000 höchstens
84 Monate. Antragsformular und Zustellung sind noch nicht angebunden; das Kontaktformular ist eine Demo.

Die grobe Schätzung rechnet: Nettoeinkommen − Miete − geschätzte weitere Ausgaben − gewählte
Monatsrate. Die früheren 30/36-Zahlungsbänder und Tragbarkeitseinstufungen sind aus dem Rechner
entfernt. Eine längere Laufzeit verändert nur das Rechenbeispiel, nicht eine Kreditentscheidung.

Weitere Ausgaben werden mit `40 % des Nettoeinkommens` pro Monat geschätzt, auf Rappen gerundet,
ohne festen Mindestbetrag. Die Miete wird separat abgezogen. Der Nutzer hat auf Rückfrage die
bestehenden 40 % ausdrücklich ausgewählt; der frühere Mindestbetrag von CHF 2'500 entfällt.
Prozentsatz und errechneter Betrag werden im Ergebnis und in der Beratungszusammenfassung genannt.
Dies bleibt eine illustrative Projektannahme, keine Bankvorgabe oder gesetzliche Pauschale.
Haushaltsgrösse, Steuern, Verpflichtungen und tatsächliche Ausgaben sind unbekannt; das Einkommen
allein bestimmt die tatsächlichen Kosten nicht. Auch bei 0 Einkommen entfällt der feste Mindestbetrag:
0 geschätzte weitere Ausgaben sind eine Folge der Formel, keine Aussage über tatsächliche Kosten.
Die Auswahl der Formel autorisiert keinen Merge und keine Veröffentlichung dieser Änderung.

Ergebnisse zeigen einen geschätzten Spielraum oder eine Budgetlücke. Sie garantieren weder einen Kredit
noch den gewünschten Betrag. Die vollständige Prüfung bleibt separat bei der Kreditgeberin.
Beispielzins, Pflichthinweis und «Erste Einschätzung, keine Kreditzusage» bleiben sichtbar.

### Budgetcheck prüfen

Node.js und lokales Google Chrome werden benötigt. Playwright dient nur den lokalen Prüfungen und wird
im ignorierten Verzeichnis `dist/qa` installiert; die Website bleibt ohne externe Laufzeit-Abhängigkeiten.

```powershell
npm install --prefix dist/qa --no-save --package-lock=false playwright
node --check app.js
node --check tools/verify-budget.cjs
node tools/verify-budget.cjs
git diff --check
```

Der Test lädt die echte `index.html` mit `app.js` und `style.css` lokal in Headless Chrome.
Er prüft die zwei Budgetfelder, fehlende/ungültige Angaben, einkommensabhängige Ausgabenschätzung, gewählte Rate,
positive/negative/Null-Ergebnisse, Rappen, Laufzeitgrenzen, beide Laufzeitregler per Tastatur,
Beratungszusammenfassung und Rücknavigation. Alle drei Schritte werden bei 1440/900/390/320 Pixeln
sowie 200 % Textgrösse auf Überlauf und abgeschnittene Steuerelemente geprüft.
Protokoll und Screenshots liegen unter `dist/qa/evidence/income-expenses/`. Die Screenshots des Rechners
blenden nur für die Aufnahme den haftenden Seitenkopf und den Sprunglink aus.
Es werden keine produktiven Anfragen gestellt.

Die [Feedback-Auswertung](tools/feedback-affordability.md#einkommensabhängige-weitere-ausgaben) dokumentiert
Befund, Umsetzung, Annahmen und offene Freigabepunkte. Frühere Abschnitte sind historischer Kontext;
ihre Veröffentlichungsfreigabe gilt nicht für diese neue Änderung.

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
