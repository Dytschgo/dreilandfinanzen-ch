# Kredit mit Augenmass — eine Landschaft für Ihr Leben

Stilvariante `astra-01-ultrakreativ` für Dreiland Finanzen.

## Idee

Die bestehende Papierlandschaft und kartografische Zeichensprache bleiben erhalten; der dunkle Rechner rückt als konkreter Einstieg in den Hero. Eine goldene Konturlinie verbindet die grosszügige Montserrat-Typografie und das ruhige Navy-Blau mit dem bestehenden Markenlogo. Der Rechner zeigt Rate und Gesamtkosten direkt, während die Budgetangaben erst bei «Tragbarkeit prüfen» erscheinen. Das handschriftlich wirkende «Auch ein ehrliches Nein» bleibt als persönliches Gegenstück zur Kreditwerbung.

## Technik

Statische HTML-, CSS- und Vanilla-JavaScript-Dateien, lokale Schriften und Markenassets, keine CDNs. Der Annuitätenrechner aktualisiert Betrag und Laufzeit live; Einkommen und Ausgaben steuern eine einfache, erklärte Budgetampel. Die Rate nutzt einen als Beispiel und Platzhalter bezeichneten effektiven Jahreszins von 8.9 %. Der Gesprächsbereich erstellt weiterhin nur eine lokale Gesprächsnotiz und versendet keine Angaben.

## Prüfung

`python styles/astra-01-ultrakreativ/verify.py` öffnet die laufende lokale Website mit Playwright und Google Chrome. Der sichtbare Seiteninhalt umfasst nach dem Umbau 407 Wörter (`document.body.innerText`). Das Skript erzeugt die Hero- und Ganzseiten-Screenshots für Desktop (1440 × 900) und Mobil (390 × 844), prüft die Regler, die Tragbarkeit und den horizontalen Überlauf bei 360 px und protokolliert Browserfehler in `verification.json`.

## Bekannte Grenzen

Die Monatsrate ist ein Rechenbeispiel ohne Gebühren, Versicherungen oder individuelle Kreditfähigkeitsprüfung. Adresse, Telefon, E-Mail, verantwortliche Person und betriebliche Rechtstexte sind vor Veröffentlichung zu ergänzen. Der Kontaktbereich bucht keinen Termin und versendet keine Anfrage; der Zinssatz und die Ampelregel sind Platzhalter. Die Seite bleibt als Designprototyp `noindex, nofollow`.

## Screenshots

- [Hero Desktop](screenshots/hero-desktop.png) · [Hero Mobil](screenshots/hero-mobile.png)
- [Ganze Seite Desktop](screenshots/desktop.png) · [Ganze Seite Mobil](screenshots/mobile.png)
