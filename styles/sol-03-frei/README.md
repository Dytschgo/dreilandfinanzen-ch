# Spielraum

## Idee

«Spielraum» macht die Beispielrate zum Einstieg: Ein ruhiger, heller Hero rahmt den dunklen Rechner in Rheinblau. Montserrat, Source Serif 4 und die bestehenden Markenfarben erhalten den Charakter der bisherigen Seite. Die Budgetprüfung bleibt unter «Tragbarkeit prüfen» erreichbar. Kurze Abschnitte führen von der Beratung über den Ablauf zum Gespräch.

## Technik

- Statisches HTML, CSS und Vanilla-JavaScript; direkt per `file://` oder lokalem Server nutzbar.
- Unverändertes Original-Logo und lokal gespeicherte OFL-Schriften; keine CDNs oder externen Anfragen.
- Betrag, Laufzeit, Monatsrate und optionale Budgetampel reagieren ohne Datenübermittlung.
- Tastaturfokus, semantische Formularfelder und `prefers-reduced-motion` werden berücksichtigt.

## Prüfung

Am 30. Oktober 2026 mit Chrome und Python Playwright über `file://` geprüft. Der Slider ist bei 1440 × 900 und 390 × 844 vollständig im ersten Viewport; eine Slideränderung aktualisiert die Monatsrate. Die Tragbarkeit klappt auf, bei 360 px gibt es keinen horizontalen Überlauf und die Konsole bleibt fehlerfrei. Screenshots: `screenshots/hero-desktop.png`, `hero-mobile.png`, `desktop.png` und `mobile.png`; Prüfdaten in `screenshots/verification.json`.

Der aktuelle `document.body.innerText` umfasst 301 Wörter. Ein Vorher-Wert wurde vor der Überarbeitung nicht erfasst; der genaue prozentuale Vergleich lässt sich daher nicht angeben.

## Grenzen

Das Kontaktformular zeigt nur eine lokale Vorschau und versendet keine Anfrage. Adresse, Telefon, E-Mail, Impressum und vollständige Datenschutzerklärung sind Platzhalter. Der Beispielzins und die Tragbarkeitseinschätzung sind unverbindlich und ersetzen keine individuelle Kreditfähigkeitsprüfung.
