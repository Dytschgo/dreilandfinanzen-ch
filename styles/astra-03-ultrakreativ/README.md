# Am selben Tisch

## Idee

Die ruhige Dreiland-Finanzen-Gestaltung bleibt erhalten: Original-Logo, Navy, Gold, Rot und die grosse typografische Aussage. Der Hero führt direkt mit einem Betragsslider und synchroner Laufzeit zur Beispielrate. Darunter ordnet ein kurzer Budgetcheck Einkommen, Ausgaben und Rücklage ein; ein ehrliches Nein bleibt Teil der Beratung.

## Technik

Statische HTML-, CSS- und Vanilla-JavaScript-Dateien, ohne Build-Schritt, CDNs oder externe Dienste. Der Slider verwendet `input type="range"`; eine Annuitätenrechnung mit ausdrücklich beispielhaften 8.9 % eff. Jahreszins aktualisiert die Monatsrate live. Der spätere Budgetcheck ergänzt die Tragbarkeitsampel. Logo und Schriften werden lokal geladen.

## Prüfung

Mit lokalem, headless Google Chrome und Python Playwright geprüft. Der Slider und die Monatsrate sind in den Viewports 1440 × 900 und 390 × 844 sichtbar; Slider, Laufzeit und Budgetcheck reagieren korrekt. Bei 360, 390, 768, 1024, 1440 und 1920 px gab es keinen horizontalen Überlauf. Keine Konsolenfehler oder fehlgeschlagenen Ressourcenanfragen. Der sichtbare Text (`document.body.innerText`) sank von 578 auf 286 Wörter (50.5 % weniger).

Screenshots im Ausgangszustand: `screenshots/hero-desktop.png`, `hero-mobile.png`, `desktop.png` und `mobile.png`. Prüfergebnis: `verification.json`. Wiederholen mit `python styles/astra-03-ultrakreativ/verify.py` vom Projektordner aus.

## Grenzen

Die Seite bleibt eine Designstudie ohne echte Terminbuchung. Kontaktangaben sind als Platzhalter markiert; Beispielzins und Ampel sind keine Konditionen, Kreditfähigkeitsprüfung oder Zusage. Keine gesonderten Safari-, Firefox-, Screenreader- oder echten Mobilgerätetests.
