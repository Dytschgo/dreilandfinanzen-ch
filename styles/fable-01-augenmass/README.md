# Augenmass

**Stilname:** Augenmass · **Kategorie:** Freie Wahl

**Idee:** Der Hero ist zweigeteilt: links ein ruhiger Navy-Block mit dem Claim, rechts sofort der Kreditrechner.
Der Rechner behauptet Transparenz nicht, er zeigt sie: Neben der Monatsrate steht der gesamte Zinsanteil, und ein
Säulenstreifen zeigt für jeden einzelnen Monat, wie viel davon Rückzahlung (Blau) und wie viel Zins (Gold) ist –
bei längerer Laufzeit sinkt die Rate sichtbar, der Goldanteil wächst. Unter «Tragbarkeit prüfen» rechnet die Seite
mit Einkommen und Fixkosten offen und schlägt bei Überlastung einen kleineren, tragbaren Betrag vor (ein Klick übernimmt ihn).
Das Dreiländereck erscheint als dezentes Linienmotiv (drei Grenzlinien in den Logofarben, 30°-Winkel der Bildmarke).

**Technik:** Statisches HTML, CSS und Vanilla JS; Säulenstreifen als per JS erzeugtes SVG. Logo unverändert aus
`../_assets/logo/`, Schriften Montserrat und Inter lokal (OFL). Keine CDNs, kein Build. Funktioniert per `file://`
und über HTTP. Semantisches HTML, native Range-/Radio-Eingaben, sichtbarer Fokus, `prefers-reduced-motion`
schaltet Übergänge ab. Prüfskript: `check.py` (Playwright, Headless Chrome) erzeugt Screenshots, Galeriebild
und `screenshots/verification.json`.

**Annahmen / Platzhalter:** 8.9 % eff. Jahreszins (Beispiel, Annuitätenformel mit monatlichem Zins aus dem effektiven
Satz). Tragbarkeit: Rate ≤ 35 % des freien Budgets = «passt», ≤ 60 % = «knapp», darüber «lieber weniger».
Adresse, Telefon, E-Mail, Impressum und Datenschutz sind Platzhalter. Kein Formularversand.
