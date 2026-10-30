# Spielraum — Geschmack A

## Stil

Ruhige Schweizer Klarheit mit Navy, Weissraum und der unveränderten Dreiland-Bildmarke. Die kurze Headline steht neben einem Kreditrechner, der auf Desktop und Mobile bereits im ersten Bildschirm bedienbar ist. Montserrat trägt die Überschriften, Inter den Lesetext; Gold bleibt ein zurückhaltender Akzent.

## Technik

Statisches HTML, CSS und Vanilla JavaScript. Die lokalen Logo-SVGs und variablen Schriften liegen in `../_assets/`; externe Ressourcen oder ein Build-Schritt sind nicht nötig. Betrag, Laufzeit, Rate und aufklappbarer Budgetcheck berechnen sich lokal. Kontakt bleibt als klar markierte Formular-Demo ohne Versand.

## Prüfung

`python styles/sol-01-geschmack-a/verify.py` startet Chrome mit WebGPU-Flag, prüft die Hero-Slider bei 1440 × 900 und 390 × 844, Live-Berechnung, Budgetstatus, FAQ-Tastaturbedienung, reduzierte Bewegung, interne Links und horizontales Scrollen von 360 bis 1920 px. Dabei werden `hero-desktop.png`, `hero-mobile.png`, `desktop.png` und `mobile.png` erzeugt.

## Bekannte Grenzen

Zinssatz und Kontaktdaten sind Platzhalter. Es gibt keine individuelle Kreditfähigkeitsprüfung oder echte Kontaktanbindung. Safari, Firefox und Screenreader wurden nicht separat geprüft.
