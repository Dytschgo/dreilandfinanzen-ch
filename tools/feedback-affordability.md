# Feedback-Auswertung: persönlicher Budgetcheck

Aktuell: [Vereinfachung zum schnellen Budgetcheck](#vereinfachung-zum-schnellen-budgetcheck).
Die folgenden früheren Auswertungen und Veröffentlichungsfreigaben sind historisch und gelten
nicht als Freigabe für die neue Vereinfachung.

Stand: 31. Oktober 2026. Auswertung vor Veröffentlichung; lokale Prüfung abgeschlossen.
Ausgangsstand: `10e7aeb` auf `main`, vor Beginn ohne lokale Änderungen.

## Vorgehen und Befund

Im ausgewählten Projekt wurde weder eine `AGENTS.md` noch ein eigener Feedback- oder
Verifikationsablauf gefunden. Massgebend sind `CONTRIBUTING.md`, `README.md` und die vorhandene
statische Website. Bestehende Playwright-Nutzung im Projekt: `tools/render.py`.

Vor der Änderung wurden die öffentlich erreichbare Website und der lokale Quelltext geprüft.
Die öffentliche HTML-Antwort enthielt den Rechner und die dokumentierte 10-%-Beispielschwelle.
`app.js` verwendete tatsächlich `Spielraum < Einkommen × 0.1` für die Warnstufe.
Es gab nur drei Budgetfelder: Einkommen, zusammengefasste Ausgaben und Reserve.
Die Jahresrechnungen und bestehenden Kreditraten wurden lediglich im Hilfetext erwähnt.

Der unveränderte Rechner wurde lokal in Headless Chrome bedient: CHF 20'000 über 48 Monate
ergaben CHF 484.77 Monatsrate. Bei CHF 6'000 Einkommen, CHF 3'800 Ausgaben und CHF 500 Reserve
zeigte er CHF 1'215.– «Rechnerischer Spielraum». Das war keine Prüfung aller neu angefragten Parameter.
Die lokale Darstellung wurde gegen den bestehenden Entwurf geprüft; die öffentliche Website wurde
per HTTP abgerufen, nicht als Browser-Sitzung bedient.

## Angenommen und umgesetzt

- Verlässliches Nettoeinkommen mit Hinweis gegen unsichere Boni und Überstunden.
- Getrennte Lebenshaltung und bestehende Verpflichtungen. Hilfetexte nennen Wohnen,
  Krankenkasse, Essen, Transport, Haushalt, Angehörige, Kreditraten, Leasing und Unterhalt.
- Jahresrechnungen als Jahresbetrag, Abzug von einem Zwölftel. Keine doppelte Erfassung
  bereits abgezogener Steuern oder anderweitig erfasster Kosten.
- Reserve als eigener Abzug; 0 bleibt möglich und löst einen Druckhinweis aus.
- Dreilands Standard-Budgetrechnung mit 30 Zahlungen und unverändertem Beispielzins.
  Ist die gewählte Laufzeit kürzer, wird deren höhere Rate verwendet. Eine längere Laufzeit
  verbessert den Budgetspielraum nicht. Die gewählte Monatsrate und Gesamtkosten bleiben separat sichtbar.
- Transparente Abzüge und monatlicher Spielraum, zusätzlich Spielraum nach den selbst angegebenen
  Zusatzkosten eines teureren Monats. Bei 0 Zusatzkosten wird ausdrücklich kein Belastungstest behauptet.
- Haushaltsgrösse und Einkommensstabilität als Kontext der persönlichen Prüfung.
  Keine erfundenen Haushalts-Pauschalen oder automatischen Gewichtungen.
- Negative Werte zeigen eine Budgetlücke gegenüber der Prüfrate. Die unten ergänzte Zahleneinstufung
  unterscheidet inzwischen 31–36 Zahlungen von ab 37. Kein Puffer, ein ausgeschöpfter Puffer im teureren
  Monat, fehlende Reserve oder unsicheres Einkommen bleiben zusätzliche Druckhinweise.
  Auch rechnerisch tragbare Ergebnisse verlangen weiterhin persönliche Prüfung.
- Keine Freigabe anhand von 10 % des Einkommens. Auch CHF 50 positiver Spielraum wird ausdrücklich
  nicht als komfortable Tragbarkeit bewertet.
- Gewünschter Wortlaut unverändert sichtbar im Ergebnis:
  «Diese Berechnung zeigt Ihren geschätzten monatlichen Spielraum. Ob ein Kredit tragbar ist,
  prüfen wir gemeinsam anhand Ihrer vollständigen Situation.»
- Sichtbare Abgrenzung zur formellen Schweizer Kreditfähigkeitsprüfung durch die Kreditgeberin,
  zusätzlich in Erklärung, FAQ und Beratungszusammenfassung.
- Gleiche Budgetrechnung und Vorzeichen in Ergebnis und Beratungszusammenfassung. Ungültige
  oder unvollständige Eingaben löschen alte Ergebnisse und werden nicht stillschweigend als 0 behandelt.

## Nicht übernommen

Die Aussage «über 31 Zahlungen lehnen Banken grundsätzlich ab» wird nicht als allgemeine
Bankenregel veröffentlicht. Für die formelle Kreditfähigkeitsprüfung nach KKG sieht
[Art. 28 Abs. 4](https://www.fedlex.admin.ch/filestore/fedlex.data.admin.ch/eli/cc/2002/593/20230901/de/pdf-a/fedlex-data-admin-ch-eli-cc-2002-593-20230901-de-pdf-a.pdf)
eine Amortisationsannahme von 36 Monaten vor, selbst bei längerer vereinbarter Laufzeit.
Die angefragten 30 Zahlungen sind im Budgetcheck klar als Dreilands Berechnungsbasis bezeichnet,
nicht als gesetzliche Zusage- oder Ablehnungsgrenze. Der Rechner berechnet keine formelle KKG-Prüfung.

## Rückfrage und Antwort

Gefragt wurde, ob die 31-Zahlungs-Grenze eine dokumentierte Richtlinie einer Partnerbank oder
eine interne Vorgabe sei. Der Reviewer stellte klar, dass keine bestimmte Bank gemeint sei,
sondern eine Standardberechnung. Deshalb wurden die 30 Zahlungen für Dreilands Budgetrechnung
übernommen, ohne daraus eine allgemeine Ablehnungsbehauptung abzuleiten. Keine offene Rückfrage
blockiert die lokale Umsetzung.

## Prüfung und Grenzen

Reproduzierbarer Ablauf: Abschnitt «Budgetcheck prüfen» in `README.md`.
`node --check app.js`, `node tools/verify-budget.cjs` und `git diff --check` wurden ausgeführt.
Browsergrundlage ist die echte lokale `index.html` mit ihren Skripten, Schriften und Styles.
Die Regression prüft die Berechnung, Eingaben und Statuswechsel, 12/30/48/120-Zahlungs-Konstellationen,
die bestehende Laufzeitgrenze über CHF 80'000, Beratungszusammenfassung, Rücknavigation,
Tastaturfokus und Layout bei 1440/900/390/320 Pixeln sowie 200 % Textgrösse.
Keine Browser-Laufzeitfehler und keine HTTP-Anfragen während des lokalen Tests.
Screenshots der Budget- und Ergebnisansichten wurden visuell geprüft; Protokoll und Aufnahmen
liegen lokal unter `dist/qa/evidence/` und sind nicht versioniert.

Rechenbeispiel der neuen Logik: CHF 6'000 Einkommen − CHF 3'000 Lebenshaltung − CHF 200
Verpflichtungen − CHF 500 Jahresanteil − CHF 500 Reserve − CHF 734.36 Prüfrate ergibt
CHF 1'065.64 Spielraum. Bei CHF 300 Zusatzkosten bleiben CHF 765.64. Die gewählte
48-Monatsrate für CHF 20'000 bleibt CHF 484.77. Rappen werden im Ergebnis gerundet;
einzeln angezeigte Teilbeträge können durch Rundung um einen Rappen von der Summe abweichen.

Die Prüfung erfolgt in lokalem Chrome, nicht auf physischen Mobilgeräten und nicht mit einem
Screenreader. Das vorhandene Beratungsformular bleibt eine Demo ohne Zustellung; eine
Anbindung oder formelle Bankenprüfung ist nicht Teil dieser Änderung.

## Freigabegrenze

`CONTRIBUTING.md` verlangt Änderungen per Pull Request gegen `main`.
Laut `README.md` und `.htaccess` geht ein Push auf `main` unmittelbar live.
Die Feedback-Auswertung allein war keine Freigabe zur Veröffentlichung. Nach abgeschlossener
Prüfung hat der Nutzer ausdrücklich die Veröffentlichung der Änderungen angefordert. Die
Veröffentlichung erfolgt über einen Pull Request gegen `main`, ohne den bestehenden Weg zu umgehen.

## Ergänzendes Feedback: 30 / 31–36 / ab 37 Zahlungen

Der Reviewer hat die gewünschte Standardberechnung präzisiert: bis 30 Zahlungen «go»,
31–36 «Optimierung nötig», ab 37 «nicht tragbar». Die erneut gelesene lokale Implementierung
und der vor Änderungen ausgeführte Chrome-Test bestätigten, dass die vorherige Fassung zwar eine
30-Zahlungs-Prüfrate, aber noch keine 31–36-Optimierungsstufe hatte. Die öffentliche Website war
beim ersten Durchgang per HTTP geprüft worden; der erneute Web-Abruf war im Werkzeug nicht erreichbar.
Die aktuelle Prüfung betrifft die echte lokale Website, nicht eine neue Produktionsversion.
Weiterhin keine `AGENTS.md` im ausgewählten Projekt; der dokumentierte Prüfablauf wurde wiederverwendet.

**Angenommen:** Diese drei Bereiche werden als Dreiland-Budgetregel umgesetzt. Massgeblich ist die
kleinste ganze Anzahl monatlicher Zahlungen, die mit Nettoeinkommen abzüglich Lebenshaltung,
Verpflichtungen, Jahresanteil und Reserve möglich ist, inklusive des bestehenden Beispielzinses.
Die gewählte Vertragslaufzeit wird dafür nicht verwendet. Teilzahlungen zählen als ganze Zahlung;
benötigte Monatsbeträge werden auf den nächsten vollen Rappen aufgerundet und das verfügbare
Budget auf volle Rappen abgerundet. Oberhalb von 36 wird «37 oder mehr» angezeigt. Deckt das
Budget nicht einmal die laufenden Zinsen, steht «Keine Rückzahlung möglich».

Ergebnis und Beratungszusammenfassung zeigen verfügbares Rückzahlungsbudget, benötigte Zahlungen
und dieselbe Einstufung. Der 30-Zahlungs-Spielraum bleibt als getrennte Zahl sichtbar. So kann
ein negativer Spielraum gegenüber 30 Zahlungen trotzdem zur Optimierungsstufe 31–36 gehören.
Warnungen wegen fehlender Reserve, unsicheren Einkommens oder eines schwierigen Monats werden
auch im Bereich bis 30 nicht unterdrückt. Der gewünschte deutsche Hinweis und die persönliche
Prüfung bleiben erhalten.

**Nicht übernommen:** «go» wird nicht als verbindliche Kreditzusage oder Bankentscheidung dargestellt.
Die formelle Schweizer Kreditfähigkeitsprüfung bleibt ausdrücklich getrennt. Es wird auch keine
neue gesetzliche Regel behauptet. Der oben dokumentierte rechtliche Bezug bleibt unverändert.

**Offene Fragen:** Keine blockierende Frage. Die Zählung erfolgt inklusive Zinsen und nach Reserve,
entsprechend der vorhandenen Berechnung; die Monatsbelastung eines teureren Monats bleibt eine
separate Belastungsprüfung und verändert die normale Zahlungsanzahl nicht.

**Verifikation:** Der bestehende Chrome-Test wurde um 29/30/31/36/37-Zahlungsfälle, einen Rappen
unter den 30- und 36-Zahlungsgrenzen, fehlendes oder negatives Rückzahlungsbudget, bloss gedeckte
Zinsen, Änderungen des Kreditbetrags sowie entsprechende Beratungszusammenfassungen erweitert.
Syntaxprüfungen für Anwendung und Test, die erweiterte Chrome-Regression sowie `git diff --check`
wurden erfolgreich ausgeführt. Alle zusätzlichen Grenzfälle wurden auch bei 320 Pixeln auf
Überlauf geprüft. Die Ergebnisaufnahmen für Optimierung, nicht tragbar und den regulären Bereich
wurden visuell geprüft, ebenso schmale und vergrösserte Darstellung. Keine Browser-Laufzeitfehler
oder externen Anfragen im lokalen Test.

## Freigabe zur Veröffentlichung

Nach der ausdrücklichen Veröffentlichungsanweisung wurden Repository-Standards und ursprüngliche
Anforderungen unabhängig von zwei weiteren Agenten geprüft. Beide Reviews fanden keine blockierenden
Probleme. Eine unabhängige iterative Restschuldrechnung bestätigte die Zahlungsgrenzen in 60 Fällen
für CHF 5'000 bis CHF 300'000, einschliesslich Rappen-Grenzfällen. GitHub meldete für `main`
keinen Branchschutz und keine anwendbaren Rulesets. Die lokale Prüfung und beide Reviews beziehen
sich auf die Änderungen gegenüber `10e7aebd3dbdf9ea4b9712b82d63a26772f0a01d`.

Die Änderung ist reversibel: Bei einem Releaseproblem kann der Merge per regulärem Revert-PR
zurückgenommen werden. Es werden keine gespeicherten Kundendaten oder Datenbankschemata geändert.
PR-, Merge- und Produktionsstatus werden im Veröffentlichungsablauf separat bestätigt.

## Vereinfachung zum schnellen Budgetcheck

Stand: 31. Oktober 2026. Ausgangspunkt: `5309314` auf `main`, zu Beginn ohne lokale Änderungen.
Kategorie: Verbesserung. Lokal umgesetzt und geprüft; Veröffentlichung anschliessend ausdrücklich
freigegeben (siehe «Freigabe und Release-Prüfung» unten).

### Vor Änderung geprüft

Im ausgewählten Projekt gibt es weiterhin keine `AGENTS.md` und keine `.out-of-scope/`-Einträge.
Verwendet wurden `CONTRIBUTING.md`, `README.md`, diese bestehende Auswertung und
`tools/verify-budget.cjs`. Der unveränderte Chrome-Test bestand vor der Bearbeitung.
Die echte lokale Website wurde gerendert und bedient; Budgetansicht auf Desktop und Ergebnisansicht
auf schmalem Bildschirm wurden angesehen. Der Abruf von `https://dreilandfinanzen.ch` über das
Web-Werkzeug scheiterte mit «is not accessible via this tool». Keine neue Aussage über den
Produktionsstand; die Umsetzung und Nachweise betreffen den lokalen Quellstand.

Der Befund bestätigt das Feedback: acht Pflichtangaben im Budget (sechs Geldbeträge, Haushaltsgrösse,
Einkommensstabilität), lange Hilfetexte und eine ausführliche Ausgabe der 30/36-Zahlungsregel.
Der Kredit-Schritt bot zehn Laufzeit-Radiobuttons, die Ergebnisansicht ein Laufzeit-Dropdown.
Die gewünschte kurze Schätzung war somit noch nicht vorhanden. Frühere Feedbackabschnitte
verlangen diese Detailansicht; das neue Feedback ersetzt diese Vorgabe für den öffentlichen Rechner.

### Angenommen und umgesetzt

- Nur zwei Budgetfelder: monatliches Nettoeinkommen und eigener Mietanteil inklusive Nebenkosten.
  Keine weiteren Ausgaben-, Haushalts- oder Stabilitätsfragen. Der optionale Verwendungszweck entfällt.
- Laufzeit als nativer Schieberegler in beiden Ansichten, mit sichtbarem Wert und Tastaturbedienung.
  Bestehende Laufzeiten, Zinsformel, Betragsgrenzen und die 84-Monatsgrenze über CHF 80'000 bleiben erhalten.
- Grobe Monatsrechnung aus Einkommen minus Miete, pauschal geschätzten weiteren Ausgaben und der
  gewählten Monatsrate. Keine Berechnung oder Anzeige von 30/36-Zahlungsbändern im Schnellrechner.
  Der Rechner trifft keine Scoring-Entscheidung und berechnet keinen zugesagten Kreditbetrag.
- Kurzes Ergebnis als geschätzter Spielraum, Null-Spielraum oder Budgetlücke. Auch ein negativer Wert
  ist eine Schätzung, keine Ablehnung. Die lange Abzugstabelle, Grafik und Scoring-Erklärung entfallen.
- Kurzer sichtbarer Hinweis auf die geschätzten weiteren Ausgaben, keine zusätzliche Eingabe dafür.
  Beratungszusammenfassung und FAQ verwenden dieselbe Schätzung und dieselbe Abgrenzung.
- Keine Zusage oder Garantie für den gewünschten Betrag; vollständige Prüfung durch die Kreditgeberin
  separat. Beispielzins und bestehender rechtlicher Pflichthinweis bleiben sichtbar.
- Eingabefehler löschen alte Ergebnisse, blockieren den Ergebnisschritt und fokussieren das betroffene Feld.
  Null ist erlaubt, leere oder negative Werte werden nicht als Null ausgelegt.

### Nicht übernommen

Keine inhaltliche Verbesserungsanforderung wurde abgelehnt. «Einfach» wird jedoch nicht als Weglassen
der bestehenden Pflichtinformationen oder als Zusage eines Kreditbetrags umgesetzt. Kurze Angaben
zum Beispielzins, zu pauschalen Kosten und zur fehlenden Kreditzusage bleiben, damit das Rechenbeispiel
verständlich ist. Das Feedback autorisiert weder Merge noch Deployment.

### Rückfrage, Antwort und Annahme

Gefragt wurde nach einer vereinbarten Pauschale für Ausgaben neben der Miete. Als vorläufige
Alternative wurden CHF 2'500 oder mindestens 40 % des Nettoeinkommens vorgeschlagen.
Die Antwort «only rent» bestätigt die Miete als einzige Ausgabenfrage, legt aber keine Pauschale fest.
Deshalb gibt es keine weitere Ausgabenfrage; weitere Kosten werden wie im Feedback gewünscht geschätzt.

Die lokale Umsetzung verwendet vorläufig `max(CHF 2'500, Nettoeinkommen × 0.4)` pro Monat,
auf Rappen gerundet. Das ist eine illustrative Annahme, keine nachgewiesene Bank- oder Geschäftsregel
und keine gesetzliche Pauschale. Sie soll weitere Lebenshaltung, Steuern, Verpflichtungen und einen
Puffer nur überschlägig abbilden. Ihre individuelle Höhe ist unbekannt. Der verwendete Schätzbetrag
wird in der Oberfläche genannt; die Konfiguration ist in `EXPENSE_ALLOWANCE` zusammengefasst.
Diese Annahme war bei Erstellung noch offen; der Nutzer hat die Veröffentlichung damit anschliessend
auf konkrete Rückfrage ausdrücklich bestätigt (siehe unten).
Eine spätere vollständige Kreditprüfung muss die tatsächlichen Verhältnisse berücksichtigen.

Beispiel: CHF 6'000 netto − CHF 1'500 Miete − CHF 2'500 geschätzte weitere Ausgaben − CHF 484.77
Rate für CHF 20'000 über 48 Monate ergibt CHF 1'515.23 geschätzten monatlichen Spielraum.
Die Änderung auf 120 Monate ergibt CHF 1'761.26, weil die Beispielrate CHF 238.74 beträgt.
Das verbessert ausschliesslich diese Schätzung und garantiert keinen Kredit.

### Verifikation und Freigabegrenze

Der bestehende Chrome-Prüfablauf wurde an den neuen Verhaltensvertrag angepasst. Die früheren
Zahlungsbandtests entfallen, weil diese Einstufungen aus dem Schnellrechner entfernt wurden.
Syntaxprüfungen für Anwendung und Test, `node tools/verify-budget.cjs` und `git diff --check` bestanden.
Geprüft: genau zwei Budgetfelder, Kreditgrenzen, Laufzeitregler und deren Synchronisierung,
Schätzpauschale, Zahlenformate, positive/negative/Null-Werte und Rappenfälle, fehlende/ungültige
Eingaben, keine veralteten Budgetwerte in der Beratungszusammenfassung sowie die sichtbaren Hinweise.
Alle drei Schritte wurden bei 1440/900/390/320 Pixeln und 200 % Textgrösse geprüft. Ein dabei gefundener
Überlauf im Betragskopf und in den Gesamtkosten wurde durch Umbruch und ein anpassendes Raster behoben.
Keine Browser-Laufzeitfehler oder externen HTTP-Anfragen im lokalen Test.

Neue Nachweise liegen unter `dist/qa/evidence/simple/`; frühere Aufnahmen werden nicht als Beleg
für diese Änderung verwendet. Die Prüfung erfolgt in lokalem Chrome, ohne physische Mobilgeräte
oder Screenreader. Die Screenshots der geänderten Ansichten wurden visuell geprüft.

Nach Abschluss der lokalen Prüfung hat der Nutzer den Push dieser Änderung ausdrücklich angefordert.
Die Änderung wird auf einen Review-Branch gepusht und per Pull Request gegen `main` vorgelegt.
Kein Merge oder Deployment ist Teil dieses Push-Auftrags. Die frühere Veröffentlichungsanweisung
und frühere Agentenreviews gelten nur für den damaligen Stand. Der Pull-Request-Weg aus
`CONTRIBUTING.md` bleibt bestehen. Der anschliessende Freigabeschritt ist unten dokumentiert.

### Freigabe und Release-Prüfung

Auf die konkrete Frage, ob PR #2 gemergt und mit `max(CHF 2'500, 40 % des Nettoeinkommens)` als
Ausgabenannahme veröffentlicht werden soll, hat der Nutzer ausdrücklich mit «yes» geantwortet.
Diese Antwort gilt der konkreten Freigabefrage, nicht bloss einer unspezifischen Feedbackmeldung.
Sie autorisiert diesen Merge und die damit verbundene automatische Veröffentlichung über Hostinger.
Die Kostenannahme bleibt eine illustrative Schätzung und keine allgemeine Bank- oder Rechtsregel.

Unmittelbar vor dem Release war PR #2 offen und konfliktfrei, `main` stand auf `5309314` und der
geprüfte Implementierungsstand auf `a616d30`. GitHub meldete keinen Branchschutz, keine anwendbaren
Branch-Regeln und keine CI-Checks. Der öffentliche HTTP-Abruf bestätigte noch die alte Budgetansicht
mit `pflicht`-Feld, ohne `miete`-Feld und mit Assetversion `2026-10-31-bands`.

Zwei unabhängige, rein lesende Agentenreviews prüften die Änderungen gegenüber `5309314` getrennt
auf Repository-Standards und ursprüngliche Anforderungen. Standards: keine blockierenden Codebefunde;
kleiner Nachweismangel durch einen fest codierten Quellstand im Prüfprotokoll. Anforderungen: keine
Befunde; zusätzlich wurden fünf Einkommens-/Mietszenarien unabhängig im Browser geprüft.
Der Nachweismangel wurde korrigiert: Das Protokoll nennt nun die tatsächliche Git-Revision und meldet,
ob versionierte Dateien lokale Änderungen enthalten. Freigabetexte wurden aktualisiert; die
Berechnung und Bedienung bleiben gegenüber dem unabhängig geprüften Stand unverändert.

Vorher-/Nachher-Nachweise: Der bisherige Rechner verlangte acht Budgetangaben und zeigte die
30/36-Zahlungsbänder. Die neue Fassung verlangt genau zwei Angaben und zeigt einen geschätzten
Monatsspielraum ohne Kreditentscheidung. Frühere Aufnahmen liegen unter `dist/qa/evidence/`, neue
Aufnahmen und das reproduzierbare Prüfprotokoll unter `dist/qa/evidence/simple/`.

Der Release ist reversibel: Bei einem Problem kann der Merge über einen regulären Revert-PR
zurückgenommen werden. Es gibt keine Datenbankänderung und keine Migration gespeicherter Kundendaten.
Merge-Ergebnis und Abgleich der live ausgelieferten HTML-, JavaScript- und CSS-Dateien werden nach
der Veröffentlichung separat bestätigt; diese Freigabenotiz allein behauptet keinen Live-Erfolg.
