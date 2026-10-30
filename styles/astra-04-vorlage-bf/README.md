# Astra 04 – Ihr Vorhaben. Unser Rückhalt.

Eine Dreiland-Finanzen-Landingpage nach dem Layout von https://bf.imnota.xyz/, geprüft am 30. Oktober 2026. Der geteilte Hero, der überlappende Kreditrechner und die grosszügigen zweispaltigen Abschnitte bleiben nah an der Vorlage. Das unveränderte Dreiland-Logo, Navy, Rheinblau, Gold, Rot und Nebel sowie Montserrat und Inter tragen die eigene Marke. Auf Mobile entfällt das Hero-Bild zugunsten eines unmittelbar bedienbaren Rechners. Alle Aussagen wurden für Dreiland neu geschrieben und auf kurze Orientierung reduziert.

## Einstieg

- `index.html` per Doppelklick oder unter `http://127.0.0.1:5180/astra-04-vorlage-bf/index.html` öffnen. Der vorhandene Server liefert `styles/` als Wurzel aus.
- HTML, CSS und Vanilla JavaScript; kein Build, keine Pakete, CDNs, Trackingdienste oder Laufzeit-Netzwerkabhängigkeiten.
- Logo und lokale OFL-Schriften werden unverändert aus `../_assets/` referenziert. Dieser Ordner muss bei einer Weitergabe mitgegeben werden.
- Nur `styles/astra-04-vorlage-bf/` wurde im Projekt angelegt/geändert. Kein Git-Befehl, Commit, Push oder Eingriff in den Galerieindex.

## Übernommen und ersetzt

| Bereich | Aus der Vorlage abgeleitet | Für Dreiland geändert |
| --- | --- | --- |
| Navigation | Weisser Header, horizontale Desktop-Links, aufklappendes Mobilmenü | Original-Logo; ausschliesslich Seitenanker; keine Telefonnummer oder Sprachauswahl |
| Hero | 46/54-Aufteilung, dunkle Textfläche, grosse zweiteilige Headline, Wohnmotiv | Dreiland-Farben, neue Aussagen, eigenes generiertes Symbolbild |
| Rechner | Überlappende weisse Karte; Betrag, Slider, Laufzeit-Auswahl, Beispielrate und CTA | CHF 15'000.– / 48 Monate; 8.9 % effektiver Beispielzins; sichtbarer UWG-Hinweis |
| Kostendetails | Aufklappbare Betragsübersicht und geteilter Rückzahlungsbalken | Neue Implementierung, synchroner Budgetcheck; keine Gebühren- oder Entschädigungsbehauptung |
| Vertrauen | Horizontale Zeile mit drei kurzen Merkmalen | Faire Bedingungen, persönliche Begleitung, kein Verkaufsdruck; keine Zahlen oder Bewertungen |
| Leistungen | Headline links, drei trennlinienbasierte Linkzeilen rechts | Privatkredit, Kreditablösung, Budgetcheck |
| Ablauf | Heller Hintergrund, Verbindungsdiagramm links, nummerierte vertikale Schritte rechts | Drei statt vier Schritte; maximal sechs Wörter pro Schritt |
| Beratung | Grosse Bild-/Textpaarung | Eigene schematische Dreiländer-Rhein-Illustration; keine angeblichen Mitarbeitenden oder Niederlassungen |
| Abschluss | Vier FAQ, Verantwortungsnotiz, dunkles CTA-Band, heller Footer | Eigene Kurztexte; Kontakt- und Rechtsangaben klar als Platzhalter |

**Kein Desktop-Megamenü vorhanden:** Die aktuell ausgelieferte Referenz hat einfache Links. Hover auf «Kreditlösungen» öffnet kein Megamenü; entsprechend wurde keines erfunden. Das Mobilmenü ist umgesetzt und getestet.

## Referenzanalyse

- Reihenfolge: Header → geteilter Hero → überlappender Rechner → Vertrauenszeile → Leistungslisten → Ablaufdiagramm/Timeline → Beratungsbild/Text → FAQ → Verantwortungsnotiz → CTA-Band → Footer.
- Desktop 1440 × 900: 90 px Header, Hero bis y = 690 px, etwa 1280 px Inhaltsbreite mit 80 px Seitenabstand. Die Rechnerkarte beginnt bei y = 618 px. Die eigene Version übernimmt diese Hauptkoordinaten.
- Vorlage: Manrope, Hero rund 76 px/500, Abschnittsüberschriften rund 48 px/500, Kartentitel 23 px. Dreiland: lokale Montserrat für Headlines, lokale Inter für Bedienung und Fliesstext; bewusst ähnliche Hierarchie und normale bis mittlere Gewichte.
- Karte mit etwa 14 px Radius, kleinen Buttonradien, weichen hellen Schatten und feinen Trennlinien. Abschnitte mit grosszügigen Abständen; Leistungsbereiche sind Listen, keine gleichförmigen Kachelraster.
- Die Referenz stapelt auf Mobile Text, grosses Foto und erst danach den Rechner. Dreiland lässt das Foto unter 801 px weg; Betrag und Laufzeit stehen nebeneinander, Rate und CTA darunter. Die Pflichtangaben folgen direkt.
- Beobachtete Bewegung: dezenter Headline-Eintritt, Link-/Buttonrückmeldung, Kostenumschalter und Mobilmenü. Dreiland nutzt zurückhaltende Farbwechsel, Plus-/Menürotation, Balkenübergang und Dialogeintritt. Bewegungsübergänge und sanftes Scrollen sind an `prefers-reduced-motion: no-preference` gebunden.
- Keine CSS-/JS-Bundles oder Bilddateien der Vorlage wurden als Website-Assets heruntergeladen oder eingebunden. `_referenz/` enthält ausschliesslich Untersuchungsbelege; die fertige Seite referenziert diesen Ordner nicht.

## Berechnung und Interaktion

Monatlicher Zinssatz `r = (1 + 0.089)^(1/12) - 1`; Annuität `Betrag × r / (1 - (1+r)^(-Monate))`. Bei CHF 15'000 und 48 Monaten: **CHF 370.12** monatlich, **CHF 2'765.94** Zinskosten, **CHF 17'765.94** Rückzahlung. Berechnung ungerundet, Anzeige auf zwei Dezimalstellen; Rundungsdifferenzen sind offengelegt.

Betrag-Eingabe und Slider teilen denselben Wert. Die Beispieldomäne CHF 5'000–100'000 und 12–84 Monate ist eine UI-Konfiguration, kein bestätigtes Produktangebot. Ungültige Beträge erhalten eine Textmeldung; die letzte gültige Rate bleibt ausdrücklich gekennzeichnet. Der ergänzende Budgetcheck zeigt Restbetrag oder Warnung und ersetzt keine gesetzliche Kreditfähigkeitsprüfung.

Native Eingaben, `details`/`summary`, FAQ-Einzelöffnung und ein nativer modaler Dialog gewährleisten Tastaturbedienung. Escape schliesst Menü und Dialog; der Fokus wird zurückgegeben. Alle Links führen zu vorhandenen Seitenabschnitten. «Budgetcheck» öffnet die zugehörigen Details.

## Prüfung

Ausgeführt mit Python Playwright, `p.chromium.launch(channel="chrome", args=["--enable-unsafe-webgpu"])`, über den vorhandenen HTTP-Server sowie zusätzlich mit `file://`.

| Prüfung | Ergebnis |
| --- | --- |
| Desktop 1440 × 900: Slider-Unterkante | 767.3 px, sichtbar und bedienbar |
| Mobile 390 × 844: Slider-Unterkante | 424.0 px, sichtbar und bedienbar |
| Laufzeit, Rate, CTA, vollständiger Pflichttext | In beiden ersten Viewports sichtbar |
| Slider mit Pfeiltaste | CHF 370.12 → CHF 370.15; live aktualisiert |
| Laufzeit und direkte Betrag-Eingabe | Rate und Gesamtkosten aktualisieren sich |
| Kostenpanel, Budgetwarnung, FAQ, Menü, Dialog | Bestanden |
| Horizontaler Überlauf | Keiner bei 360, 390, 768, 1024, 1440 und 1920 px |
| Maximalbetrag und geöffneter Budgetcheck bei 360 px | Kein Überlauf; Betrag vollständig sichtbar |
| Konsole / fehlgeschlagene Requests | 0 / 0 |
| Lokale Bilder und Schriften; file:// | Geladen / funktionsfähig |
| Reduzierte Bewegung | Kein Smooth-Scrolling, Bewegungsanimationen deaktiviert |
| Textkontraste | Navy/Weiss 13.69:1, Blau/Weiss 9.50:1, Schiefer/Weiss 6.00:1, Schiefer/Nebel 5.30:1, Rot/Nebel 4.72:1 |

Keine vollständige assistive-Technologie- oder Cross-Browser-Zertifizierung; geprüft wurde lokales Chrome. Gold dient nur als grafischer Akzent, nicht als Textfarbe auf Weiss.

**Textmenge:** Im Zielordner gab es keine alte Landingpage. Vergleichsbasis ist deshalb die vollständig geladene Referenz: **462 → 231 Wörter**, also **50 % weniger**, jeweils `document.body.innerText.trim().split(/\s+/).length` bei 1440 × 900, Menü und Details geschlossen. Mobile: **216 Wörter**. Native Select-Optionen zählen mit; CSS-/SVG-Dekorationszeichen zählen nicht als Text. Aufgeklappte Inhalte sind in dieser reproduzierbaren Ansicht nicht enthalten.

Skripte: `capture_reference.py`, `inspect_reference.py`, `verify.py`, `verify_extra.py`. Messdaten: `verification.json` und `_referenz/visual-observations.json`. Die Python-Skripte benötigen die bereits vorhandenen Pakete Playwright und Pillow; die Website selbst benötigt diese nicht.

## Bildnachweise und Screenshots

- `_referenz/desktop.png`, `_referenz/mobile.png`: vollständige Referenz bei 1440 × 900 bzw. 390 × 844.
- `_referenz/hero-desktop.png`, `_referenz/hero-mobile.png`, `_referenz/menu-mobile.png`, `_referenz/mega-desktop.png`, `_referenz/kosten-desktop.png`: zusätzliche Beobachtungen. `mega-desktop.png` dokumentiert den Hover ohne Megamenü.
- `screenshots/hero-desktop.png`, `screenshots/hero-mobile.png`: erste Viewports.
- `screenshots/desktop.png`, `screenshots/mobile.png`: vollständige Dreiland-Seite.
- `screenshots/vergleich.png`: Referenz links, Dreiland rechts, jeweils unverkleinerte 1440 × 900-Heros, mit Beschriftungszeile.
- Weitere Screenshots: geöffnete Kosten, Budgetwarnung, Mobilmenü und Kontakt-Dialog.

`wohnen.webp` wurde neu mit dem eingebauten **imagegen**-Tool erzeugt und lokal gespeichert. Keine reale Kundengeschichte; als «Symbolbild · KI-generiert» gekennzeichnet. Die schematische Karte ist eigenes SVG im HTML.

Bildprompt: “Use case: photorealistic-natural. Asset: original editorial lifestyle photograph for a Swiss responsible credit advice landing page, landscape 1536x1024. A couple in their late thirties sit at a light oak dining table in a bright modest European apartment planning their next steps together, one navy blue cotton shirt and one cream knit sweater, candid relaxed expressions looking at each other, natural realistic hands resting on table near a closed notebook and two ceramic cups. Large sash windows with soft late afternoon daylight, leafy house plant, understated lived-in interior, warm wood, blue accents, wide framing showing room, people in right half and centre, no text, no branding, no logos, no advertising gloss, no money, no luxury, no watermarks. High quality editorial architecture and lifestyle photography, 35mm lens. This is a generic illustrative scene, not a portrayal of an actual customer or advisor.”

## Offene Punkte vor Veröffentlichung

Echte Kontaktangaben, Impressum und Datenschutz ergänzen; Terminbuchung anschliessen; tatsächlichen Produktumfang und Konditionen bestätigen. Aktuell ist die Seite ausdrücklich eine Designvorschau mit `noindex`. Der Beratungsdialog bereitet ein Gespräch vor, versendet aber keine Daten und behauptet keine Buchung.
- \`_referenz/\` (Screenshots der Vorlage) liegt nur lokal und ist per .gitignore vom Repo ausgeschlossen.
