# Brief: Dreiland Finanzen – Website-Stilvarianten

Mehrere Agenten bauen je **eine eigenständige Landingpage** für Dreiland Finanzen in einem eigenen Stil.
Du arbeitest **nur in deinem eigenen Ordner** `styles/<dein-ordner>/`. Andere Ordner nicht anfassen,
`styles/_assets/` nur lesen.

## Die Marke

- **Dreiland Finanzen** – Kreditberatung im Dreiländereck (Region Basel, CH/DE/FR). Domain: dreilandfinanzen.ch
- **USP:** Wir setzen uns für faire Kreditbedingungen ein, die zur finanziellen Situation unserer Kundinnen und
  Kunden passen. Wir begleiten sie persönlich und raten auch zu einem kleineren oder keinem Kredit, wenn die
  Belastung zu hoch wäre.
- **Werte:** vertrauenswürdig, kompetent, persönlich, nahbar, transparent, ehrlich, verantwortungsbewusst,
  kundenorientiert, regional verwurzelt.
- **Claim (Vorschlag):** «Fair finanziert. Persönlich begleitet.» – Alternativen: «Kredit mit Augenmass.»,
  «Lieber ehrlich als teuer.», «Ein Kredit, der zu Ihnen passt.» Eigene Formulierungen sind erlaubt, wenn sie zum
  USP passen.
- **Leistungen:** Privatkredit · Kreditablösung/Umschuldung · Budgetcheck (Tragbarkeit vor Abschluss) · persönliche
  Beratung vor Ort oder online.

## Logo – unverändert verwenden

- Dateien in `styles/_assets/logo/` (horizontal, vertikal, icon, wortmarke × farbig, monochrom-navy,
  monochrom-schwarz, invertiert, darkmode, darkmode-flaeche; plus animierte `logo-reveal_*.svg` und `favicon.svg`).
- Logo **nie neu zeichnen, verzerren, umfärben oder neu setzen**. Inline-SVG (Inhalt der Datei kopieren) ist
  erlaubt, damit du einzelne Teile animieren kannst (`#flaeche-blau`, `#flaeche-gold`, `#flaeche-rot`,
  `#trennlinie`, `#dreiland`, `#finanzen`). Animation ja – der Endzustand muss das Originallogo sein.
- Die Bildmarke (3 isometrische Flächen, 30°-Kanten) darf als **Gestaltungsmotiv** abgeleitet werden
  (Muster, Flächen, 3D, Partikel …), solange das echte Logo klar erkennbar bleibt.

## Farben & Schrift (Annäherung aus Raster)

Navy `#062B63` · Rhein Blau `#0A4682` · Basler Gold `#C69D49` · Grenz Rot `#CE2530` · Schiefer `#58637E` ·
Nebel `#EEF1F6` · Nachtblau `#031A3D` · Dark-Mode-Akzente `#4F86C6` `#D9B566` `#E5484D`.
Tokens: `styles/_assets/dreiland-finanzen_farben.css`.
Schriften (lokal, OFL): `styles/_assets/fonts/` – Montserrat-VF (Display), Inter-VF (Text), SourceSerif4-VF
(optional). Weitere Schriften nur, wenn du sie lokal ablegst und die Lizenz frei ist. Keine CDNs.
Gold nicht für Text auf Weiss (Kontrast 2.5:1).

Referenz (optional, nicht kopieren): `dist/Dreiland-Finanzen_Brand-Kit/06_Brand-Guidelines/*.pdf` und
`dist/Dreiland-Finanzen_Brand-Kit/08_Anwendungsrichtungen/*.png`. Dein Stil soll **eigenständig** sein.

## Inhalt (Richtwert – Reihenfolge und Form frei)

Hero mit Claim · Leistungen · Versprechen «Auch ein ehrliches Nein» · Ablauf in 3 Schritten ·
**interaktiver Kreditrechner/Budgetcheck** (Betrag, Laufzeit, Einkommen/Fixkosten → Monatsrate, Gesamtkosten,
Tragbarkeitsampel; Zinssatz als Platzhalter, z. B. 8.9 % eff., klar als Beispiel markiert) · regional verwurzelt ·
FAQ · Kontakt/Termin · Footer.

## Pflicht

- **Deutsch, Schweizer Rechtschreibung:** ss statt ß, «Guillemets», CHF 15'000.–, Sie-Form.
- **Pflichthinweis sichtbar** (z. B. Footer und beim Rechner): «Die Kreditvergabe ist verboten, falls sie zur
  Überschuldung führt (Art. 3 UWG).»
- **Keine aggressive Kreditwerbung** (Art. 36a KKG): kein «Sofortkredit», keine künstliche Dringlichkeit,
  keine Lockangebote. Ton: ruhig, ehrlich, auf Augenhöhe.
- **Platzhalter** (Adresse, Telefon, Namen, Zinssätze, Bewertungen) als solche erkennbar; keine erfundenen
  Fakten als echt ausgeben (keine Fake-Auszeichnungen, Kundenzahlen, Testimonials ohne «Beispiel»).
- **Barrierefreiheit:** semantisches HTML, Tastaturbedienung, sichtbarer Fokus, Kontrast WCAG AA,
  `prefers-reduced-motion` respektieren (Animationen aus/reduziert), Alt-Texte.
- **Responsive** 360 px bis 1920 px.
- **Technik:** statische Dateien, kein Build-Schritt, keine externen Netzwerk-Abhängigkeiten. Einstieg
  `styles/<dein-ordner>/index.html`, funktioniert per Doppelklick (file://) **und** über einen lokalen Server.
  Assets per relativem Pfad (`../_assets/...`) oder in deinen Ordner kopiert.
- WebGPU-Varianten: echtes WebGPU (WGSL-Shader) als Kernerlebnis, **mit Fallback** (Canvas 2D/CSS) wenn
  `navigator.gpu` fehlt – die Seite muss auch ohne WebGPU vollständig nutzbar sein.

## Abschluss

1. Seite im Browser prüfen. Headless Chrome ist vorhanden (Python Playwright: `p.chromium.launch(channel="chrome")`).
   Screenshots ablegen: `styles/<dein-ordner>/screenshots/desktop.png` (1440 × 900, ganze Seite) und
   `mobile.png` (390 × 844, ganze Seite). Konsole auf Fehler prüfen.
2. `styles/<dein-ordner>/README.md`: Stilname, Idee in 3–5 Sätzen, Technik, bekannte Grenzen.
3. Nichts committen. Antwort: Ordner, Stilname, Kurzbeschreibung, Prüfergebnis (Konsole, Screenshots), offene Punkte.
