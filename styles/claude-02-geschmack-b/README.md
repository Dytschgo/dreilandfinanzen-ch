# Das Heft – Dreiland Finanzen

**Stil:** editorial und warm, wie ein Schweizer Magazin über Geld und Vertrauen.

## Idee
Die Seite beginnt mit dem Claim und dem Kreditrechner im ersten Bildschirm: Links die Headline, rechts eine Arbeitsblatt-Karte mit Betragsslider, Laufzeit-Chips, grosser Monatsrate und einem Button. Die Tragbarkeitsprüfung (Einkommen, Fixkosten, Ampel) klappt darunter auf. Danach folgen die Rubriken im Zeitungsraster mit Randnotizen-Logik, Initiale und Pull-Quote. Die Haltung ist die dunkle Doppelseite; die Ampel nutzt die drei Flächen der Bildmarke.

## Technik
- Statisches HTML, CSS und Vanilla-JS (`index.html`, `style.css`, `app.js`). Kein Build-Schritt, keine Netzwerkzugriffe. Funktioniert per `file://` und über einen lokalen Server.
- Logo als `<img>` aus `../_assets/logo/`, unverändert.
- Schriften lokal aus `../_assets/fonts/`: Source Serif 4, Montserrat, Inter.
- Rechner: Annuität mit 8.9 % effektivem Jahreszins (Platzhalter). Ampel: Rate ≤ 25 % des frei verfügbaren Einkommens = tragbar, ≤ 40 % mit mindestens CHF 800 Rest = knapp, sonst zu hoch.
- Barrierefreiheit: Landmarks, Skip-Link, sichtbarer Fokus, Laufzeit als Radiogruppe, `aria-live` für das Ergebnis, `aria-valuetext` am Slider, FAQ mit `<details>`. Bei `prefers-reduced-motion` sind Animationen aus.

## Überarbeitung
- Kreditrechner in den Hero verschoben; der frühere Budgetcheck-Abschnitt entfällt, damit es nur einen Rechner gibt.
- Textmenge von 1095 auf rund 390 Wörter gesenkt (`document.body.innerText`).
- Nur noch ein Button im Hero; Masthead-CTA entfernt.

## Bekannte Grenzen
- Adresse, Telefon, Sprachen, Vergütung, Impressum, Zinssatz und Zitat sind als Platzhalter markiert.
- Das Kontaktformular ist eine Demo und sendet nichts.
- Die Karte ist eine schematische Skizze und nicht massstäblich.
- Kein eigener Dark Mode.
- Source Serif 4 liegt nur ohne Kursiv vor; Betonung erfolgt über Gold-Unterstreichung.
