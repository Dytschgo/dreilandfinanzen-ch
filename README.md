<img src="assets/logo/favicon.svg" width="64" height="64" alt="">

# dreilandfinanzen.ch

Website und Brand Kit für **Dreiland Finanzen** – Kreditberatung in Basel.

| Pfad | Inhalt |
|---|---|
| `index.html`, `style.css`, `app.js`, `header.js` | Website und Budgetcheck |
| `ueber-uns.html`, `karriere.html` | Eigene Unternehmens- und Karriereseiten mit ausdrücklich gekennzeichneten Platzhaltern |
| `antrag.html`, `application.js`, `application-layout.js`, `application.css` | Dreiland-Antragsseite mit vorbereitetem credit-core-Anschluss und kompakter Schrittnavigation |
| `credit-core/` | Privates Submodul, unverändert auf Release v0.2.0 gepinnt |
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

Es gibt einen Beratungs-Einstieg in der haftenden Kopfzeile: «Beratung anfragen» auf Desktop,
«Beratung» neben dem Menü auf schmalen Bildschirmen. Die doppelten Buttons im Einstieg und unter
dem Rechner sind entfernt. Der Absende-Button im Kontaktformular bleibt bestehen.
Der letzte Rechner-Schritt führt mit «Kredit beantragen» zu `antrag.html`; nur Betrag und Laufzeit
werden als `amount` und `months` übergeben. Budget- und Personendaten stehen nicht in der URL.
Die Beratungszusammenfassung bleibt über den Kopfzeilenbutton aus allen Schritten erreichbar.

Im Ergebnis lässt sich «Laufzeiten vergleichen» optional aufklappen. Für denselben Betrag stehen
die gewählte Laufzeit und eine andere erlaubte Laufzeit mit Monatsrate, Zinskosten und
Gesamtrückzahlung gegenüber. Beide Beispiele verwenden dieselbe vorhandene 7.9-%-Formel.
Der Vergleich ändert weder Kreditwunsch, Budgetstatus, Beratungszusammenfassung noch Antragslink.
Die Alternative startet bei 60 Monaten; fällt sie mit der Auswahl zusammen oder ausserhalb der
zulässigen Grenze, wird die nächste längere erlaubte Laufzeit verwendet, sonst die längste kürzere.
Über CHF 80'000 gilt auch im Vergleich die Grenze von 84 Monaten. Ungültige Kreditbeträge leeren
die Vergleichszahlen und sperren die Vergleichsauswahl. Längere Laufzeiten werden ausdrücklich
mit höheren gesamten Zinskosten eingeordnet; es gibt keine automatische Empfehlung.

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
Protokoll und Screenshots liegen unter `dist/qa/evidence/single-consultation/`. Die Screenshots des Rechners
blenden nur für die Aufnahme den haftenden Seitenkopf und den Sprunglink aus.
Es werden keine produktiven Anfragen gestellt.

Die [Feedback-Auswertung](tools/feedback-affordability.md#kundenweg-zuständigkeiten-bewerbung-und-laufzeitvergleich) dokumentiert
Befund, Umsetzung, Annahmen und offene Freigabepunkte. Frühere Abschnitte sind historischer Kontext;
ihre Veröffentlichungsfreigabe gilt nicht für diese neue Änderung.

## Inhaltsseiten im Entwicklungsstand

«Über uns» und «Karriere» sind eigene Seiten, erreichbar über die Hauptnavigation und die bestehenden
Bildkacheln auf der Startseite. Unternehmensgeschichte, Arbeitsweise, Teamprofile und Stellenprofil
sind ausdrücklich als Platzhalter gekennzeichnet. Es werden keine realen Personen, Qualifikationen
oder offenen Stellen behauptet. Das Stellenbeispiel lässt sich per Tastatur aufklappen; es gibt noch
keinen Bewerbungsversand. Die bestehende Beratung bleibt in der Kopfzeile erreichbar.

Der bestehende Abschnitt zum Kundenweg erklärt Budgetschätzung, lokale Antragsvorbereitung und
die spätere Prüfung durch die Kreditgeberin. Er kennzeichnet den Ablauf als geplant und die
Übermittlung als noch nicht freigeschaltet. «Über uns» benennt den bestätigten Best-Finance-
Formularbetreiber; konkrete Rollen in der Zusammenarbeit mit Dreiland bleiben gekennzeichnete
Platzhalter. «So bewerben Sie sich» auf der Karriereseite zeigt einen Beispielablauf mit Platzhaltern
für Kontakt, Bewerbungsweg, Interviewstufen und Rückmeldefristen, ohne aktiven Bewerbungsversand.

## Kreditantrag mit credit-core

Die Antragsseite verwendet den unterstützten Consumer-Vertrag von `credit-core`, Release `v0.2.0`
auf `eeb52f8b29191627867059833b146391046d889a`. Das private Submodul wird nicht als öffentliche
Quelle oder kopierte Bibliothek ausgeliefert. Anmeldung bei GitHub mit privatem Lesezugriff ist erforderlich:

```powershell
git submodule update --init credit-core
```

Der Nutzer hat den vorhandenen **Best-Finance-Betreiber mit Filiale AA** ausdrücklich bestätigt.
`credit-core.brand.json` setzt diese Auswahl und Dreilands Marke explizit; Kontakte, Empfänger und
zugehörige Core-Texte stammen unverändert aus dem gepinnten Default-Betreiber. Es gibt keine
zusätzliche Teil-Konfiguration mit überschriebenen Kontaktdaten. Die Markenwerte sind
«Dreiland Finanzen», `dreilandfinanzen.ch` und `germanTone: formal`.

Build und Inventarprüfung:

```powershell
python tools/build_application.py
python credit-core/tools/consumer.py doctor --consumer .
python tools/package_site.py
```

Der Build generiert ausschliesslich ignorierte Ausgaben unter `credit-runtime/` und eine ignorierte
Inventardatei. Der Namespace `dreilandfinanzen` hält Entwürfe von anderen Websites getrennt.
Die Seite prüft übergebene Kreditangaben mit dem Core, übernimmt nur Betrag und Laufzeit und lässt
willkürliche Zinsparameter nicht zu. Ein ausdrücklicher neuer Kreditwunsch ersetzt den Kreditteil
eines alten Entwurfs; Personendaten bleiben erhalten. Beim Rückweg wird der Kreditwunsch wieder
im Rechner angezeigt. Ladefehler zeigen eine verständliche Meldung mit weiter erreichbarer Beratung.

Die Integration ist ausdrücklich **Vorbereitung** (`mode: prepare`). Ausfüllen, lokale Unterlagen und
Überblick sind möglich, die letzte Übermittlung wird vor PDF-Erstellung oder POST gestoppt. Zusätzlich
sperrt `.htaccess` den gesamten API-Pfad; das Release-Paket enthält keine PHP-API. Der Betreiber,
seine Datenschutzhinweise und Zustellung müssen separat geprüft werden, bevor echte Einsendungen
freigeschaltet werden. Das ist keine fertige Bankanbindung oder rechtliche Gesamtfreigabe.

Die Einleitung ist verkürzt. Der Fortschritt «Schritt … von …» bleibt sichtbar; die Schrittliste liegt
in einem nativen, anfangs geschlossenen «Schritte wechseln»-Element. Erfolgreiche Schrittwechsel
schliessen es wieder, Validierungsfehler lassen es offen. `application-layout.js` ergänzt nur diese
Consumer-Darstellung; Core-Schrittregeln, Inhalte und Pflichtfelder bleiben unverändert.

### Antragsseite prüfen

```powershell
node tools/verify-application.cjs
node tools/verify-application.cjs --configured
# Optional: denselben Ablauf am erzeugten Release-Paket prüfen
node tools/verify-application.cjs --configured --package dist/releases/<Paketverzeichnis>
```

Der Browser-Test erzeugt einen ausdrücklich **synthetischen** Betreiber mit Filiale `TEST` unter
`dist/qa/application-fixture/`; er ersetzt keine bestätigte Betreiberkonfiguration. Er bedient die echten
Dreiland-Seiten und den gepinnten Core über einen lokalen Testserver. Geprüft werden Übergabe und
Rückweg, Pflichtfeldfehler, vollständige synthetische Eingaben bis zum Überblick, keine Übertragung,
warme Entwürfe, ignorierte Zinsparameter, ungültige Links und die Rückfallebene bei fehlendem Runtime.
Alle Formularschritte werden bei 320 Pixeln und 200 % Textgrösse geprüft; die erste Ansicht zusätzlich
bei 1440/900/390 Pixeln. Protokoll und Screenshots: `dist/qa/evidence/application/`.
Zusätzlich geprüft: erstes Betragsfeld vollständig im anfänglichen 390×844-Viewport, Tastaturbedienung
der kompakten Schrittliste, Seitenwechsel über Navigation und Bildkacheln, aktive Seitenmarkierung,
Platzhalter und die neuen Seiten bei 1440/900/390/320 Pixeln sowie 320 Pixeln mit 200 % Textgrösse.
Mit `--configured` wird derselbe Ablauf gegen den tatsächlich gebauten Best-Finance-/AA-Runtime
geprüft. Nur die Antragstellerdaten und die lokalen Ausfüllhilfen bleiben synthetisch. Der Test vergleicht
die Betreiberkontakte mit dem gepinnten Original, prüft die sichtbare Betreiberangabe und bestätigt,
dass die Vorbereitung keine Daten sendet. Belege: `dist/qa/evidence/application-configured/`.
Bei einem Release-Paket prüft er zusätzlich Hashinventar und Ausschluss von Core-Checkout,
Consumer-Konfiguration, API und Dev-Tools. Das Paket benennt ausdrücklich den lokalen Änderungsstand;
ein Paket aus uncommittierten Quellen wird nicht als saubere Commit-Ausgabe ausgegeben.
Zusätzlich wurde `python credit-core/tools/check.py` am unveränderten Release ausgeführt.

**Veröffentlichungsweg:** Der Git-only-Ablauf erzeugt die ignorierten Runtime-Dateien nicht.
Für diese Integration wird deshalb nach dem Merge das mit `tools/package_site.py` gebaute und
geprüfte öffentliche Paket über Hostingers Static-Archive-Deployment an `dreilandfinanzen.ch`
veröffentlicht. Der verbundene Hostinger-Zugang wurde für genau diese Website geprüft; das
öffentliche Ziel enthält statische Projektdateien. Vor der ersten Veröffentlichung wurde ein
Rollback-Archiv des bisherigen öffentlichen Stands aufbewahrt. Der bestehende Inhalt darf nur
durch das vollständige geprüfte Paket ersetzt werden, niemals durch den privaten Core-Checkout.

Jeder spätere Release dieses Branches braucht ebenfalls ein frisches Paket und dessen Veröffentlichung,
solange kein privater Build in Hosting/CI eingerichtet ist. Ein Git-Push allein reicht für den Antrag
nicht aus. Die Paketerstellung installiert keine Zugangsdaten und veröffentlicht nichts von selbst.
Die Freigabe zum Merge umfasst hier die Veröffentlichung des geprüften Standes; Zustellung bleibt
in Vorbereitung gesperrt und ist davon getrennt.

## Veröffentlichen

Hostinger liefert den Branch `main` direkt aus (Git-Deployment). Jeder Push auf `main` verändert die Live-Dateien.
Für den vollständigen Antrag ist zusätzlich der oben beschriebene öffentliche Paket-Release erforderlich.
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
