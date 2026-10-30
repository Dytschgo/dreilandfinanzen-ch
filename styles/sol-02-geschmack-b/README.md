# Rhein & Haltung

## Idee

Der dunkle Editorial-Stil mit Source Serif 4, feinen Linien und den bestehenden Dreilandfarben bleibt erhalten. Der Kreditrechner steht jetzt im Hero neben dem Claim; Betrag, Laufzeit, Beispielrate, Beratungslink und Pflichthinweis sind sofort sichtbar. Die Budgetprüfung und Kostenübersicht klappen bei Bedarf auf. Die übrigen Abschnitte sind gekürzt und halten das ehrliche «Nein» als Teil der Beratung sichtbar.

## Technik

Statische HTML-, CSS- und JavaScript-Dateien ohne Build-Schritt oder externe Abhängigkeiten. Originales Darkmode-Logo und lokal gespeicherte Schriften. Der Rechner nutzt 8,9 % als gekennzeichneten Beispielzins; Budgetwerte werden nur lokal verarbeitet. Kontakt, Impressum und Datenschutz bleiben als Vorschau beziehungsweise Platzhalter gekennzeichnet.

## Prüfung

`python styles/sol-02-geschmack-b/verify.py` führt 45 Browserchecks in headless Google Chrome aus. Slider, Live-Rate, Budgetzustände, Tastaturbedienung, Dialoge, Links, HTTP/file://, Konsole und horizontales Scrollen von 360 bis 1920 px wurden geprüft. Der Slider liegt im ersten Viewport bei 1440 × 900 und 390 × 844 px.

Screenshots in `screenshots/`: `hero-desktop.png`, `hero-mobile.png` (Viewport) sowie `desktop.png`, `mobile.png` (ganze Seite).

## Grenzen

Designvorschau ohne echte Kontaktdaten, produktive Terminbuchung oder Kreditdienstleistung. Beispielzins, Reserve und Tragbarkeitsanzeige sind keine Offerte oder Kreditfähigkeitsprüfung. Keine zusätzliche Prüfung in Safari oder Firefox.
