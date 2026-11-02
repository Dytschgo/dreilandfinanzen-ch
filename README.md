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

Drei kurze Schritte: Ihr Kredit → Ihr Budget → Ihr Spielraum. Das Budget erfragt monatliches
Netto-Haushaltseinkommen, Miete oder Hypothek inklusive Nebenkosten, verheiratet Ja/Nein und
Anzahl unterhaltsberechtigter Kinder (ganze Zahl 0–99). Einkommen und Wohnkosten müssen denselben
Haushalt abdecken. Eigentümer erfassen auch Amortisation und Unterhalt. Die vereinfachte
Haushaltsannahme ist sichtbar: verheiratet = zwei Erwachsene, sonst einer.

Kreditregeln und Zinsformel entsprechen weiterhin `credit-core` v0.2: Beispielzins 7.9 % effektiv,
ab CHF 5'000, Start CHF 20'000 / 48 Monate, Laufzeiten 12–120 Monate, über CHF 80'000 höchstens
84 Monate. Betrag und Laufzeit lassen sich per Schieberegler ändern. Das Kontaktformular bleibt eine Demo.

Die vom Nutzer ausgewählte illustrative Ausgabenschätzung ist zentral in `EXPENSE_ALLOWANCE` definiert:
25 % des Netto-Haushaltseinkommens ohne Ehe, 30 % mit Ehe, plus 5 Prozentpunkte je Kind.
Zusätzlich werden separat 5 % des Einkommens als Sicherheitspuffer abgezogen. Prozentbeträge werden
jeweils auf Rappen gerundet. Wohnkosten werden separat abgezogen; die Prozentschätzung umfasst
Lebenshaltung, Steuern, Krankenkasse und bestehende Verpflichtungen nur grob. Sie ist keine validierte
Bankvorgabe oder gesetzliche Pauschale und bildet tatsächliche Kosten und andere Haushaltsformen
nicht zuverlässig ab. Bei 0 Einkommen entstehen rechnerisch 0 geschätzte weitere Ausgaben, was keine
Aussage über tatsächliche Kosten ist.

Nettoeinkommen minus Wohnkosten, weitere Ausgaben und Sicherheitspuffer ergibt das freie Budget.
Der positive Anteil wird vollständig als für Kreditraten verfügbar ausgewiesen. Die gewählte Rate
wird davon abgezogen; negative Beträge bleiben als Budgetlücke sichtbar. Es gibt keinen zusätzlichen
Mindestrestbetrag von CHF 50 oder CHF 100 und keine automatische Kreditzusage. Die früheren
30/36-Zahlungsbänder bleiben entfernt. Eine längere Laufzeit verändert nur das Rechenbeispiel.
Ergebnis, FAQ und Beratungszusammenfassung verwenden dieselben Annahmen. Der Rechner bittet ausdrücklich
nur um ungefähre Monatsbeträge, ohne Unterlagen oder Uploads. Er verspricht keine Bearbeitungszeit.
Der Ergebnistext beschreibt das rechnerische Budget neutral und empfiehlt nicht, es auszuschöpfen.
Die vier Fragen und die ausgewählte Prozentformel bleiben erhalten.

Die sichtbare Abgrenzung und die FAQ trennen diese Schätzung von der gesetzlichen Kreditfähigkeitsprüfung.
Für die von Art. 28 KKG erfasste Prüfung gelten unter anderem das kantonale Existenzminimum,
tatsächliche Miete, Steuern, gemeldete Verpflichtungen und die 36-Monats-Annahme, auch bei längerer
Vertragslaufzeit. Das bildet der Schnellrechner nicht ab. Nachweise können später verlangt werden;
bei Zweifeln muss die Kreditgeberin die Angaben prüfen (Art. 31 KKG). Diese Änderung ist keine
rechtliche Freigabe der gesamten Website; die bestehenden Firmen-/Kontaktplatzhalter bleiben offen.

Die gewählte CTA-Variante A ergänzt einen gut sichtbaren Beratungsbutton unter der Hauptaussage
und einen vollbreiten Beratungsbutton unter dem Rechner. Beide verwenden den vorhandenen
Kontaktanker und die Beratungszusammenfassung; keine feststehende Beratungsleiste.

Der Status im Ergebnis ist grün bei positivem Spielraum («Tragbar (Schätzung)»), gelb bei
exakt CHF 0.00 («Knapp tragbar (Schätzung)») und rot bei einer Lücke («Nicht tragbar (Schätzung)»). Massgeblich ist
der bestehende auf Rappen gerundete Spielraum nach Rate. Keine neue Schwelle für kleine positive
Beträge; CHF 0.01 bleibt rechnerisch gedeckt. Fehlende Angaben zeigen einen neutralen Status.
Text und Farbe vermitteln dieselbe Bedeutung; die Beratungszusammenfassung verwendet denselben
Status. Auch der erklärende Satz nennt explizit «tragbar», «knapp tragbar» oder «nicht tragbar»
und bezieht dies auf die Budgetschätzung. Die Farben und Begriffe sind keine Kreditentscheidung.

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
Er prüft die vier Budgetfelder, fehlende/ungültige Angaben, Haushalts- und Kinderszenarien,
separaten Sicherheitspuffer, vollständig verfügbares Rückzahlungsbudget, gewählte Rate,
positive/negative/Null-Ergebnisse, Rappen, Laufzeitgrenzen, beide Laufzeitregler per Tastatur,
Beratungszusammenfassung, Statusfarben inklusive Kontrast, CTA-Tastaturbedienung und Rücknavigation. Alle drei Schritte werden bei 1440/900/390/320 Pixeln
sowie 200 % Textgrösse auf Überlauf und abgeschnittene Steuerelemente geprüft.
Protokoll und Screenshots liegen unter `dist/qa/evidence/affordability-wording/`. Die Screenshots des Rechners
blenden nur für die Aufnahme den haftenden Seitenkopf und den Sprunglink aus.
Es werden keine produktiven Anfragen gestellt.

Die [Feedback-Auswertung](tools/feedback-affordability.md#verständliche-tragbarkeitsbegriffe) dokumentiert
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
