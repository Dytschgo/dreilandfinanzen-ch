# Dreiland Finanzen – «Isometrie, überarbeitet» (fable-02-feedback)

Basis: `claude-04-ultramodern` («Isometrie»). Headline-und-Rechner-Hero und Rechner-Styling bleiben; das konsolidierte
Owner-Feedback ist eingearbeitet. Reine Front-End-Studie: Rechner und Budgetcheck rechnen clientseitig, Formulare senden nichts,
Fotos, Partnerlogos und Kontaktdaten sind Platzhalter.

## Feedback → Umsetzung

| Punkt | Umsetzung |
|---|---|
| 1 Faire Konditionen und persönliche Begleitung betonen | Positiver Lead im Hero («Konditionen, die zu Ihrer Situation passen – und eine Ansprechperson …»), dunkle Sektion «Konditionen, die zu Ihnen passen» mit Fair / Persönlich / Verantwortungsvoll. «Ehrliches Nein» nur noch einmal, als Beleg unter «Verantwortungsvoll». Fotografischer Ansatz aus «Ihr Vorhaben. Unser Rückhalt.» in der Sektion «Über uns»: dessen KI-generiertes Symbolbild (`img/beratung.webp`, gekennzeichnet) in drei Ausschnitten, bis echte Fotos vorliegen. |
| 2 Markenversprechen sofort sichtbar | **Streifen** direkt unter dem Hero: «Faire Konditionen · Persönliche Begleitung · Verantwortungsvolle Beratung» (Variante astra-04). Keine zusätzlichen Labels im Hero. |
| 3 Vollständige Rechnerkosten | Im dunklen Ergebnisfeld stehen Monatsrate, Zinskosten total und Gesamtrückzahlung zusammen; kein Aufklappen. |
| 4 Optionaler Budgetcheck, leichter zu folgen | Eigene Sektion `#budgetcheck`: Ihr Wunsch → Ihr Alltag → Ihr Spielraum (Tabs + Weiter/Zurück, Fokus springt auf die Schritt-Überschrift). Schritt 2 mit separatem Feld «Monatliche Reserve» und Hinweis, dass Ausgaben jährliche Rechnungen (auf den Monat verteilt) und bestehende Raten enthalten. Ergebnis heisst «Ihre erste Einschätzung», danach «Persönliche Einschätzung anfragen»; nie «Zusage». Betrag/Laufzeit sind mit dem Hero-Rechner synchron. |
| 5 FAQ | Fünf Fragen mit 1–2 Sätzen, darunter die drei gewünschten (tiefere Rate ↔ Gesamtkosten, positives Ergebnis ≠ Zusage, keine Verpflichtung). |
| 6 Regionales Terrain, dezent | Höhenlinien per Marching Squares über ein Hügelfeld (JS, keine Geografie) plus Rhein-Motiv in der Region-Sektion; dieselben Linien blau-grau und sehr zurückhaltend hinter der rechten Hälfte der dunklen Versprechen-Sektion. Textbereiche bleiben frei; Bildunterschrift «Künstlerische Interpretation, keine geografische Karte». |
| Gold nur im Logo | Alle `--gold`/`--d-gold`-Verwendungen (Fortschrittsbalken, Kartenlinien, Fokusring, Chart, Budgetbalken, Formularlinie, Karte) durch Navy/Blau/Grau ersetzt. Prüfskript sucht nach `#C69D49`/`#D9B566` ausserhalb von `.logo`. Brand-Guide-Generator (`tools/colors.py`, `tools/guidelines.py`) ergänzt um die Regel; Mockups und Anwendungsrichtungen (`tools/mockups.py`, `tools/directions.py`) ebenfalls ohne Gold ausserhalb des Logos (Premium Finance: Silberblau statt Gold). |
| Asymmetrische Bildboxen | `#ueber-uns`: grosse Box «Über uns» links, «Unser Netzwerk» und «Karriere» rechts gestapelt, Text-Overlays; Fotos mit Kennzeichnung «Symbolbild · KI-generiert». |
| Partner getrennt | `#partner` mit «Partnerbanken» (4 Logo-Platzhalter) und «Kooperationspartner» (3 Logo-Platzhalter). |
| Ruhigere Bewegung | Reveal 0.4 s / 12 px statt 0.9–1.1 s / 26 px, Hero-Intro etwa halbiert, Sektionsabstände `clamp(56px, 7vw, 96px)` statt bis 160 px, Sticky-Ablauf (340 vh) durch drei statische Schritte ersetzt, Scroll-Cue und Zeiger-Parallaxe entfernt. |
| Hintergrund-Logo | Das verblasste Emblem im Hero ist weg; es bleiben isometrisches Raster, Konstruktionslinien und Knoten. |
| Navigation | «Kreditrechner» → `#rechner` (Hero), «Budgetcheck» → `#budgetcheck` (öffnet Schritt 1). |

## Technik
- Statisch: `index.html`, `styles.css`, `app.js`; Schriften und Logos aus `../_assets/`. Läuft per Doppelklick und über Server.
- Rechnung: Annuität mit 8.9 % eff. Jahreszins (Beispiel) → Monatszins `(1+r)^(1/12)−1`; Rate auf Rappen gerundet,
  Gesamtrückzahlung = Rate × Laufzeit, Zinskosten = Gesamt − Betrag (dadurch konsistent).
  Budgetcheck: Spielraum = Einkommen − Ausgaben − Reserve − Rate; unter 0 «zu wenig», unter 10 % des Einkommens «wenig»,
  sonst «rechnerischer Spielraum». Schwellen sind Beispiele, keine KKG-Prüfung.
- Logo unverändert (Inline-Kopie im Header, Darkmode-SVG im Footer).
- `prefers-reduced-motion: reduce`: alle Animationen aus, Zahlen ohne Tween, Rhein ohne Nachzeichnen.
- Ohne JavaScript: Budgetcheck zeigt alle drei Schritte untereinander.

## Prüfung
`python -m http.server 5180 --bind 127.0.0.1` im Repo-Root, dann `python styles/fable-02-feedback/check.py`.
Ergebnis in `verification.json`; Screenshots in `screenshots/` (`hero-desktop.png`, `hero-mobile.png`, `desktop.png`, `mobile.png`,
`budgetcheck-desktop.png`, `region-mobile.png`, `desktop-reduced-motion.png`).

Geprüft: Rechner im ersten Bildschirm (1440 × 900 und 390 × 844), Rate reagiert auf Slider, Annuität und Summen gegen
Python-Referenz, Anzeige = Rechnung, längere Laufzeit = tiefere Rate aber höhere Zinskosten, Budgetcheck-Zustände (ok/bad),
Validierung, Sync Hero ↔ Budgetcheck, Navigationsziele, kein Gold ausserhalb des Logos, Pflichthinweis 3×, «ehrliches Nein» 1×,
Tastatur (Skip-Link, Slider-Pfeiltasten, Laufzeit-Chips), Fokus auf Schritt-Überschriften, kein horizontaler Überlauf bei 360/390/1440,
keine Konsolenfehler, reduzierte Bewegung.

## Bekannte Grenzen
- Fotos (KI-generiertes Symbolbild), Partnerlogos, Adresse, Telefon, E-Mail, Konditionen und Zinssatz sind Platzhalter; Formulare senden nichts.
- Das Terrain ist eine künstlerische Interpretation, keine Karte.
- Nur in Chrome geprüft (Headless), nicht in Safari/Firefox oder auf physischen Geräten.
