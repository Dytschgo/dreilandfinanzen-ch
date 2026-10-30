# Überarbeitung: Kreditrechner in den Hero, viel weniger Text

Du überarbeitest **eine bestehende Landingpage** in `styles/<dein-ordner>/`. Nur diesen Ordner ändern.
`styles/BRIEF.md` gilt weiterhin (Logo unverändert, Schweizer Rechtschreibung, Pflichthinweis,
keine aggressive Kreditwerbung, Barrierefreiheit, prefers-reduced-motion, keine CDNs).
Den visuellen Stil der Seite **beibehalten** – es ist eine Überarbeitung, kein Neuentwurf.

## 1. Kreditrechner direkt im Hero (wichtigste Aufgabe)

Vorbild: Schweizer Kreditanbieter wie Best Finance oder Royal Credit – der Betrags-Slider ist das Erste,
was man sieht, und sofort bedienbar.

- Im **ersten Bildschirm** (ohne Scrollen) muss sichtbar und bedienbar sein – auf Desktop 1440 × 900
  **und** Mobile 390 × 844:
  - **Kreditbetrag-Slider** (gross, gut greifbar, Betrag gross angezeigt, z. B. CHF 15'000.–)
  - **Laufzeit** (Slider oder Auswahl-Chips, z. B. 12 / 24 / 36 / 48 / 60 Monate)
  - **Monatsrate** als grosses Ergebnis, ändert sich live
  - **ein** Button, z. B. «Beratung vereinbaren»
  - Kleingedruckt direkt am Rechner: «Beispiel: 8.9 % eff. Jahreszins» und
    «Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG).»
- Desktop: Claim links, Rechner rechts (oder anders, aber beides im ersten Bildschirm). Mobile: kurze
  Headline, darunter sofort der Rechner. Bei Bedarf Navigation/Hero-Grafik verkleinern.
- Die Tragbarkeitsprüfung (Einkommen, Ausgaben, Ampel) darf weiter unten bleiben oder als
  aufklappbarer Teil «Tragbarkeit prüfen» am Hero-Rechner hängen. Werte zwischen Hero-Rechner und einem
  eventuellen zweiten Rechner synchron halten – oder den alten Rechner-Abschnitt entfernen, wenn er
  doppelt wäre.
- Bestehende Animationen/WebGPU-Szenen dürfen bleiben, aber den Rechner nicht verdecken oder bremsen.

## 2. Text radikal kürzen

Ziel: **mindestens die Hälfte weniger Text.** Die Seite soll man in 30 Sekunden erfassen.

- Headlines: höchstens ~6 Wörter.
- Absätze: höchstens 1–2 kurze Sätze. Lieber weglassen als erklären.
- Keine Wiederholungen derselben Aussage (das USP «auch ein ehrliches Nein» höchstens 2× auf der Seite).
- Kleine Labels/Eyebrows/Randnotizen/Mikrotexte stark reduzieren.
- Leistungen: Titel + eine Zeile. Ablauf: 3 Schritte mit je max. 6 Wörtern.
- FAQ: max. 4 Fragen, Antworten 1–2 Sätze.
- Bleiben muss: Pflichthinweis (beim Rechner und im Footer), «Beispiel»-Kennzeichnung des Zinssatzes,
  Platzhalter-Kennzeichnung bei Kontaktdaten.

## 3. Prüfen und abschliessen

1. Headless Chrome (Python Playwright, `p.chromium.launch(channel="chrome", args=["--enable-unsafe-webgpu"])`).
   Seite über `http://127.0.0.1:5180/<dein-ordner>/index.html` öffnen (Server läuft), sonst file://.
2. Neue Screenshots in `screenshots/`:
   - `hero-desktop.png` (Viewport 1440 × 900, **nicht** ganze Seite) – Slider muss sichtbar sein
   - `hero-mobile.png` (Viewport 390 × 844, nicht ganze Seite) – Slider muss sichtbar sein
   - `desktop.png` und `mobile.png` (ganze Seite) neu erzeugen
3. Per Skript prüfen: Slider im ersten Viewport (`getBoundingClientRect().bottom <= innerHeight`),
   Slider bewegen → Monatsrate ändert sich, keine Konsolenfehler, kein horizontales Scrollen bei 360 px.
4. Screenshots selbst ansehen und nachbessern.
5. README kurz aktualisieren. Nichts committen.
6. Antwort: was geändert wurde, Textmenge vorher/nachher (Wortzahl `document.body.innerText`),
   Prüfergebnis.
