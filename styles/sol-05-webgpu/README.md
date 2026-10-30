# Spielraum — WebGPU

## Idee

Der Kreditrechner steht direkt im Hero und macht Betrag, Laufzeit und Monatsrate sofort erfassbar. Eine ruhige, helle Rechnerfläche liegt über der abstrahierten WebGPU-Szene der drei Länder und bleibt klar lesbar. Die Flächen übersetzen Alltag, Möglichkeiten und Pläne in ein räumliches Gleichgewicht. Das originale Dreiland-Finanzen-Logo bleibt unverändert.

## Technik

- Statische HTML-, CSS- und JavaScript-Dateien; per Doppelklick oder lokalem HTTP-Server nutzbar, ohne Build und externe Abhängigkeiten.
- WGSL-Szene in `scene.js`, mit Canvas-2D-Fallback. Rechner und Tragbarkeitsteil funktionieren auch ohne WebGPU.
- Der Slider aktualisiert Monatsrate und Rückzahlung live. Einkommen, Ausgaben und Ampel sind unter «Tragbarkeit prüfen» aufklappbar.
- Schrift, Logo und Farben nutzen lokale Assets. Reduzierte Bewegung, Tastaturfokus und native Disclosure-Elemente werden unterstützt.

## Prüfen

```powershell
python styles/sol-05-webgpu/verify.py
```

Am 30. Oktober 2026 mit Headless Chrome 156 und Playwright ausgeführt: **72 Checks bestanden**, keine Konsolenfehler oder -warnungen und keine externen Anfragen. Geprüft wurden WebGPU, Canvas-Fallback, Rechnerinteraktion, reduzierte Bewegung, Dialog, FAQ und horizontales Overflow von 360 bis 1920 px. Der sichtbare Rechner inklusive Pflichttext passt in die ersten Viewports 1440 × 900 und 390 × 844. Text auf der Seite: **606 → 282 Wörter (−53.5 %)** nach `document.body.innerText`.

Screenshots: `screenshots/hero-desktop.png`, `hero-mobile.png`, `desktop.png` und `mobile.png`. Der Kontakt bleibt eine Design-Demo; Adresse, Telefon, Terminbuchung, Impressum und Datenschutzerklärung sind Platzhalter. Der Zins von 8.9 % ist ein Beispiel, kein Angebot. Keine Abnahme auf Safari, Firefox oder physischer Mobilhardware.
