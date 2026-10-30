# Die rote Linie – claude-03-frei

## Idee
Im Dreiländereck sind Grenzen Alltag – bei Krediten sind sie Verantwortung. Die Seite folgt einer roten Linie (Grenz Rot),
die sich beim Scrollen wie eine Grenze auf einer Landkarte durch die Seite zieht. Der Kreditrechner steht gleich im ersten
Bildschirm: Betrag, Laufzeit, Monatsrate und ein Button. Die Linie läuft am linken Rand und setzt den Hero-Rechner nicht
frei. Im Budgetcheck erscheint «Ihre rote Linie» wieder im Monatsbudget, mit ehrlichem Vorschlag für einen kleineren oder
gar keinen Kredit.

## Technik
- Statisches HTML/CSS/JS ohne Framework und Build-Schritt; klassisches Script (kein Modul), damit `file://` funktioniert.
- Schriften und Logo-Dateien liegen in `assets/` (aus `styles/_assets/` kopiert, Logos unverändert; OFL-Lizenzen dabei).
- Kreditrechner im Hero: Betrag und Laufzeit sind mit dem Budgetcheck synchron (beide Regler und Zahlenfelder). Die Rate
  wird live berechnet, Tragbarkeit (Einkommen, Fixkosten, Ampel) steht im Budgetcheck weiter unten.
- Rote Linie: SVG-Overlay, aus Ankerpunkten im HTML berechnet (senkrecht, waagrecht oder mit 30°-Kanten wie in der
  Bildmarke), scrollgekoppelt gezeichnet und nach Grösse/Schriftladen neu berechnet. Ohne JS fehlt nur die Linie.
- Budgetcheck: Annuität mit 8.9 % eff. Jahreszins (als Beispielwert markiert), Ampel in Blau/Gold/Rot mit Textstatus
  (`role="status"`, verzögert, damit Screenreader beim Schieben nicht überflutet werden).
- Kontaktformular: `novalidate`, damit die eigene Prüfung und Bestätigung auch erscheinen (Browser-Pflichtfeldprüfung
  greift sonst vor dem Submit-Ereignis).
- `prefers-reduced-motion`: Linie sofort komplett, keine Einblend- oder Logo-Animation.

## Bekannte Grenzen
- Die 40-%-Grenze und die 25-%-Komfortzone sind Beispielregeln, keine gesetzliche Kreditfähigkeitsprüfung (auf der Seite so erklärt).
- Das Kontaktformular ist eine Demo und sendet nichts.
- Kein Dark Mode. Die Dreiländereck-Grafik ist schematisch, nicht massstabsgetreu.
- Adresse, Telefon, E-Mail, Vergütungsmodell und Unterlagen sind Platzhalter.
- Auf dem Handy ist die Bildmarke im Hero ausgeblendet, um den Rechner in den ersten Bildschirm zu bringen.
