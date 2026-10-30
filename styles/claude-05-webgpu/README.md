# Tragwerk – Dreiland Finanzen (WebGPU-Variante)

**Stilname:** Tragwerk

## Idee
Die drei isometrischen Flächen der Bildmarke werden zu einer Echtzeit-Szene: extrudierte, beleuchtete Körper mit einer Haut aus Partikeln, auf einem nachtblauen Isometrie-Raster. Der Budgetcheck steht direkt im Hero, rechts neben dem Claim. Links darunter legt sich der Tragbarkeits-Ring um die Marke. Er zeigt live, welchen Anteil der freien Mittel die Rate binden würde (grün/gelb/rot, Markierungen bei 35 % und 60 %). Beim Scrollen ordnet sich die Szene zu jedem Abschnitt neu an: Bei «Auch ein ehrliches Nein» wird die Marke in ihre Teile zerlegt, im Ablauf bilden die Partikel drei Stufen, in der Region fliesst der Rhein mit Basel, Lörrach und Saint-Louis. Bei «nicht tragbar» rückt die rote Fläche nach vorn und glüht. «Tragwerk» meint das, was trägt: Es geht um Tragbarkeit, nicht um Tempo.

## Technik
- **Ohne Bibliotheken, ohne Build, keine ES-Module** (damit es per `file://` läuft). Einstieg: `index.html`.
- `js/scene-webgpu.js`: eigene WGSL-Shader.
  - **Compute-Pass:** Physik für 24'576 Partikel (Mobile: 12'288). Federn zu den Formationen (Marke, Ring, Stufen, Rhein) mit gestaffeltem Übergang, Strömungsrauschen, Abstossung durch die Maus und ein Puls bei Eingaben im Rechner.
  - **Render-Pass (MSAA 4×):** Hintergrund-Shader (30°-Dreiecksraster, Lichtkegel der Maus, Kachel-Übergang mit goldener Kante), beleuchtete extrudierte Flächen (diffus, Blinn-Spekular, Fresnel, Punktlicht der Maus) und Partikel-Billboards mit Tiefentest.
- Die Szene folgt unsichtbaren Bühnen im Layout (`[data-stage]`). Die Bühne `stage-hero` liegt im Hero links unter dem Claim, rechts daneben steht der Rechner (`#budget`). Kameraposition und Massstab kommen aus der Bounding-Box der Bühne. Die Ortsbeschriftungen am Rhein sind echtes HTML und werden auf die projizierten 3D-Punkte gesetzt.
- Der Rechner ist ein Panel über der Szene (fast deckend, leichte Unschärfe), damit er klar lesbar bleibt.
- **Fehlerbehandlung:**
  - `getCompilationInfo()` prüft jedes WGSL-Modul.
  - Error-Scope, `createRenderPipelineAsync`, `device.lost` und `uncapturederror` sind abgefangen.
  - Bei jedem Fehler wird der Canvas ersetzt und die Seite wechselt auf den Fallback.
- **Fallback:**
  - `js/scene-2d.js` zeigt dieselbe Szene in Canvas 2D (Maler-Algorithmus, rund 700 CPU-Partikel, gleiche Kamera und Formationen).
  - Ohne Canvas oder ohne JS bleibt ein CSS-Raster mit der statischen Bildmarke.
  - Den 2D-Pfad kann man mit `?renderer=2d` erzwingen.
- **Performance:**
  - devicePixelRatio ist begrenzt (WebGPU 1.5, 2D 1.25), zusätzlich gilt ein Pixelbudget.
  - Bei verstecktem Tab stoppt die Schleife (`visibilitychange`).
  - Die Zeitschritte (dt) sind begrenzt.
- **Bewegung:**
  - Bei `prefers-reduced-motion` springen die Partikel direkt auf ihr Ziel. Es gibt dann keine Animation, gerendert wird nur bei Änderungen (Scroll, Resize, Rechner).
  - Zusätzlich gibt es einen Schalter «Szene anhalten» (WCAG 2.2.2).
- Alle Inhalte sind semantisches HTML, der Canvas ist `aria-hidden`. Die Monatsrate ist als `aria-live` markiert.
- Logo: Das Header-Logo ist inline und 1:1 aus `horizontal_darkmode.svg` übernommen. Die drei Flächen bauen sich beim Laden auf, der Endzustand ist das Original. Im Footer wird die Original-SVG-Datei eingebunden.
- `test/check.py`: Playwright-Prüfung, Aufruf mit `webgpu | fallback | reduced | file | shots`. Erwartet den lokalen Server auf `styles/` unter Port 5180. Prüft zusätzlich, ob Slider, Monatsrate und Button im ersten Viewport liegen (Desktop 1440 × 900 und Mobil 390 × 844) und ob bei 360 px nicht horizontal gescrollt wird.

## Textmenge
- Vorher: 745 Wörter (`document.body.innerText`).
- Nachher: 327 Wörter. Die aufgeklappte «Tragbarkeit prüfen» (Einkommen, Fixkosten, Ampel) ist dabei nicht mitgezählt.
- Headlines höchstens rund 6 Wörter, Absätze 1–2 Sätze, FAQ mit 4 Fragen, Leistungen mit Titel und einer Zeile, Ablauf mit je max. 6 Wörtern.
- Das USP «Auch ein ehrliches Nein» steht einmal als Zitat im Abschnitt «Unser Versprechen».

## Prüfung (headless Chrome, Windows, NVIDIA)
| Lauf | Renderer | Konsole | Erster Viewport |
|---|---|---|---|
| `--enable-unsafe-webgpu --enable-features=Vulkan`, http | **WebGPU** (24'576 Partikel) | 0 Fehler/Warnungen | Slider, Rate, Button sichtbar (1440 × 900) |
| dasselbe per `file://` | **WebGPU** | 0 Fehler/Warnungen | ok |
| `navigator.gpu` entfernt | **Canvas 2D** | Info «navigator.gpu fehlt – Fallback.», 0 Fehler | ok |
| `reduced_motion=reduce` | WebGPU, statisch (Schleife stoppt) | 0 Fehler | ok |
| Mobil 390 × 844 | WebGPU (12'288 Partikel) | 0 Fehler | ok (Button unten bei 745 px) |

Bedienung getestet: Betrag 60'000 und Laufzeit 24 Monate ändern die Monatsrate (CHF 370.12 → CHF 2'728.89) und setzen die Ampel auf «Nicht tragbar». Zurück auf 15'000/48 wird sie «Tragbar». Horizontales Scrollen bei 360 px: keines.

Screenshots in `screenshots/`:
- `hero-desktop.png` (1440 × 900) und `hero-mobile.png` (390 × 844), nur der erste Bildschirm.
- `desktop.png` und `mobile.png`, ganze Seite. Sie sind aus Viewport-Aufnahmen zusammengesetzt, weil die Szene fixiert ist und dem Scroll folgt.
- Pro Pfad (`webgpu-*`, `fallback-*`, `reduced-*`) einzelne Abschnitte, darunter der Rechner im Zustand «tragbar» und «nicht tragbar» (mit aufgeklappter Tragbarkeit).

## Bekannte Grenzen
- Zinssatz (8.9 % eff.), Adresse, Telefon, E-Mail, Zeiten und Konditionen sind Platzhalter. Die Ampel ist eine vereinfachte Orientierung (Rate / freie Mittel; ≤ 35 % / ≤ 60 % / darüber) und keine Kreditfähigkeitsprüfung nach KKG.
- Die Tragbarkeitsprüfung (Einkommen, Fixkosten, Ampel) ist eingeklappt. Wer sie nicht öffnet, sieht die Ampel nicht; die Farbe des Rings zeigt aber trotzdem den Stand.
- Auf dem Handy liegt der Schalter «Szene anhalten» (fest unten rechts) teilweise über dem Kleingedruckten des Rechners.
- Das Kontaktformular sendet nichts (nur ein Demo-Hinweis).
- WebGPU wurde nur mit Chrome/NVIDIA geprüft. Safari, Firefox und mobile GPUs sind nicht getestet. Auf schwachen Geräten können 24k Partikel plus MSAA viel Leistung brauchen; eine adaptive Qualitätsstufe fehlt.
- Der 2D-Fallback ist bewusst einfacher: weniger Partikel, Sortierung pro Fläche statt Tiefenpuffer.
