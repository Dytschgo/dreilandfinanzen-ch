# Im Einklang — Ultramodern

Eine ruhige, präzise Landingpage mit Nachtblau, den unveränderten Markenfarben und lokalen Montserrat-/Inter-Schriften. Die isometrischen Markenflächen bleiben als Gestaltungsmotiv in den Abschnitt zur Region eingebunden. Im Hero führt der Rechner direkt vom Betrag und der Laufzeit zur Beispielrate; Einkommen und Ausgaben lassen sich bei Bedarf unter «Tragbarkeit prüfen» ergänzen.

## Start und Technik

`index.html` funktioniert per Doppelklick oder über einen statischen lokalen Server. Die Seite verwendet HTML, CSS, Vanilla JavaScript, lokale Schriftdateien und SVG. Es gibt keinen Build-Schritt und keine externen Laufzeitabhängigkeiten. Rechnerwerte werden nur im Browser verarbeitet.

Der Rechner zeigt einen klar gekennzeichneten Beispielzins von 8,9 % effektivem Jahreszins. Rate und Gesamtkosten beruhen auf einer vereinfachten Annuitätenrechnung. Die Tragbarkeit ist eine Orientierung und ersetzt keine gesetzliche Kreditfähigkeitsprüfung. Kontaktdaten sind als Platzhalter markiert; das Formular erstellt nur eine lokale Gesprächsnotiz.

## Prüfung

Mit `python styles/sol-04-ultramodern/verify.py` werden lokal geladene Schriften, Slider- und Laufzeitänderungen, die Tragbarkeit, die Kontaktübernahme, der sichtbare Hero-Rechner bei 1440 × 900 und 390 × 844, die mobile Navigation, reduzierte Bewegung, horizontales Scrollen bei 360–1920 px und Konsolen-/Netzwerkfehler geprüft. Das Skript schreibt die Screenshots und `verification.json` neu.

- `screenshots/hero-desktop.png` und `screenshots/hero-mobile.png`: erster Viewport.
- `screenshots/desktop.png` und `screenshots/mobile.png`: ganze Seite.

Der Textumfang wird nach dem Laden im Browser mit `document.body.innerText` gezählt. Browserprüfung erfolgte mit lokalem Chrome; kein vollständiger Screenreader-Audit und keine Prüfung auf realen Mobilgeräten.

## Bekannte Grenzen

Dies ist eine lokale Designstudie ohne Termin- oder Kontaktversand. Betreiberangaben, Adresse, Telefon und E-Mail müssen vor Veröffentlichung ergänzt werden. Zinssatz, Rate und Tragbarkeit bleiben Beispiele. Die regionale Karte ist schematisch.
