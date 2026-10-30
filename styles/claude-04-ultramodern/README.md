# Dreiland Finanzen – «Isometrie» (claude-04-ultramodern)

## Idee
Eine präzise Landingpage, die die Bildmarke wie eine technische Konstruktionszeichnung behandelt.
Der Kreditrechner steht im ersten Bildschirm: Betrag, Laufzeit und Monatsrate, ein Button. Die Konstruktion des Zeichens
entsteht dahinter live (Raster, Linien, Knoten, drei Flächen) und ist dezent hinter die Titelspalte gerückt. Die Tragbarkeit
(Einkommen, Fixkosten, Ampel) ist ein aufklappbarer Teil desselben Rechners. Beim Scrollen setzen sich die drei Flächen im
Abschnitt «Ablauf» zusammen; der Endzustand ist immer das Originalzeichen. Ruhige Farbflächen, Montserrat/Inter.

## Technik
- Statisch: `index.html`, `styles.css`, `app.js`. Kein Build, keine Bibliotheken, keine Netzwerkzugriffe.
  Schriften und Logos per relativem Pfad aus `../_assets/`. Funktioniert per Doppelklick (file://) und über einen Server.
- Logo: Header = Inline-Kopie von `dreiland-finanzen_horizontal_farbig.svg` (Pfade unverändert), animierter Reveal per CSS
  (`translate`/`scale`/`clip-path`, Endzustand = Original). Footer = `dreiland-finanzen_horizontal_darkmode.svg` als `<img>`.
- Hero: SVG-Raster und Konstruktionslinien per JS erzeugt, Ablauf per Web Animations API, dezente Tiefen-Parallaxe
  der drei Flächen (Zeiger). Hero-Grafik: absolut, `pointer-events: none`, auf Mobile in den Hintergrund.
- Rechner im Hero: Laufzeit als Radio-Chips (12/24/36/48/60), Monatsrate als animierte Zahl, Tragbarkeit in `<details>`.
  Der frühere eigene Rechner-Abschnitt ist entfernt (keine doppelten Werte).
- Ablauf: Sticky-Bühne, die Scroll-Fortschritt auf pausierte WAAPI-Animationen abbildet (`currentTime`).
- CSS scroll-driven animations (`animation-timeline: scroll()`/benannte `view-timeline`) für Lesefortschritt (dreifarbig),
  Belastungskurve «Auch ein ehrliches Nein», Rhein und Grenze in der Karte sowie die Hero-Drift. Fallback ohne Unterstützung:
  JS setzt `--sd`/`--sp` beim Scrollen (Klasse `no-sda`), getestet durch Simulation.
- Rechner: Annuität mit 8.9 % eff. (Platzhalter), animierte Zahlen (rAF-Tween), Ring für die Belastungsquote, Budgetbalken,
  Ampel mit Icon-Morph (✓ / ! / ×) über `d: path()`. Zusammenfassung über `aria-live`, verzögert.
- Micro-Interactions: Button-Fill-Sweep und Pfeil, nachgezeichnete Icons beim Hover, dreifarbige Kartenlinie,
  Floating Labels mit Fokuslinie, Segment-Schalter, Haken mit Linienzeichnung, FAQ-Plus/Minus-Morph mit
  `::details-content` und `interpolate-size`, Burger-Menü mit Morph.
- `prefers-reduced-motion: reduce`: alle Animationen aus, die Ablauf-Bühne wird zur normalen Sektion, alle Flächen und Linien
  sind im Endzustand.

## Screenshots
- `screenshots/hero-desktop.png` (1440 × 900) und `hero-mobile.png` (390 × 844): nur der erste Bildschirm, Rechner sichtbar.
- `screenshots/desktop.png` und `mobile.png`: ganze Seite, reduzierte Bewegung (alle Elemente im Endzustand).
- `screenshots/frames/` stammt aus der Vorversion (alter Rechner-Abschnitt) und ist nicht aktualisiert.

## Bekannte Grenzen
- Die Karte ist schematisch, nicht geografisch genau (so beschriftet).
- Adresse, Telefon, E-Mail, Zeiten, Konditionen und Zinssatz sind Platzhalter. Das Kontaktformular ist eine Demo und sendet nichts.
- Die Tragbarkeitsampel ist vereinfacht (Rate ÷ frei verfügbares Einkommen; Grenzwerte 25 % / 40 % als Beispiel) und ersetzt keine KKG-Prüfung.
- Der FAQ-Höhenübergang und der Icon-Morph brauchen aktuelle Chromium-Browser. Andere Browser schalten ohne Animation um.
- Der Ablauf braucht beim Scrollen viel Höhe (340 vh), das ist gewollt.
- Textmenge: rund 700 → 350 Wörter (`document.body.innerText`, Desktop).
