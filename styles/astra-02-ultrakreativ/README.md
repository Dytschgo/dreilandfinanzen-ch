# Der Dreiland-Atlas

**Stilname:** Der Dreiland-Atlas — Was uns verbindet.

## Idee

Die bestehende Papierlandschaft, Markenfarben und reliefartige Dreiländerkarte bleiben erhalten. Der Hero stellt jetzt den Kreditrechner in den Mittelpunkt: links der kurze Claim, rechts Betrag, Laufzeit und Monatsrate. Auf Mobile folgt der Rechner direkt unter der Headline. Die Karte steht weiter unten im Regionalabschnitt.

## Einstieg und Technik

`index.html` funktioniert per Doppelklick oder über einen lokalen Server. Die Seite nutzt statisches HTML, CSS und JavaScript sowie die lokalen Schriften und das unveränderte Dreiland-Logo aus `../_assets/`. Es gibt keinen Build-Schritt und keine externen Netzwerk-Abhängigkeiten.

Der Betragsschieber und die Laufzeitauswahl aktualisieren Monatsrate und Beispielkosten live. «Tragbarkeit prüfen» klappt Einkommen, Ausgaben und die Orientierungshilfe auf. Der Beispielzins von 8,9 % ist sichtbar gekennzeichnet; Pflichthinweis und Platzhalter bleiben beim Rechner, im Footer und bei den Kontaktdaten erkennbar. Der Kontaktbereich erzeugt nur eine lokale Gesprächsnotiz und bucht keinen Termin.

## Prüfung

Mit installiertem Chrome und Python Playwright: `python styles/astra-02-ultrakreativ/verify.py`.

- Desktop 1440 × 900 und Mobile 390 × 844: Slider, Laufzeit, Monatsrate, Beratungsbutton und Pflichthinweis passen in den ersten Bildschirm.
- Slider-Tastaturbedienung, Live-Rate, Laufzeit, Eingabefehler und alle drei Tragbarkeitshinweise geprüft.
- Kein horizontaler Überlauf bei 360, 390, 768, 1024, 1440 und 1920 px; 200 % Textvergrösserung bei 390 px geprüft.
- Keine Konsolenfehler, JavaScript-Ausnahmen oder externen Anfragen; lokale Datei, HTTP-Aufruf, Reduced Motion und Darstellung ohne JavaScript geprüft.
- Sichtbarer Text: rund 713 Wörter vor der Überarbeitung, 336 danach (`document.body.innerText` bei 1440 × 900; vorher aus dem ursprünglichen Seitentext gezählt).

Screenshots liegen in `screenshots/`: `hero-desktop.png`, `hero-mobile.png`, `desktop.png` und `mobile.png`. `verification.json` enthält die Prüfergebnisse.

## Grenzen

Die Seite bleibt eine Designstudie. Adresse und weitere Unternehmensangaben sind Platzhalter. Zinssatz, Reserve und Tragbarkeitsschwellen dienen nur der Beispielrechnung. Es gibt keine echte Terminbuchung oder Kreditanfrage. Geprüft wurde in Chrome, nicht auf einem physischen Mobilgerät oder in Safari/Firefox.
