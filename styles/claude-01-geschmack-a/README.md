# Augenmass

**Stil:** «Augenmass» – editorial, ruhig, Schweizer Raster.

**Idee:** Die Seite ist gesetzt wie ein gut gemachter Jahresbericht: 12-Spalten-Raster mit Haarlinien, nummerierte
Kapitel, viel Weissraum. Montserrat trägt die Zahlen und Fakten («Fair finanziert.»), Source Serif die menschliche
Stimme («Persönlich begleitet.»). Der Kreditrechner steht im ersten Bildschirm als «Budget-Blatt»: Betrag, Laufzeit,
Monatsrate und ein Button. Die Tragbarkeitsprüfung ist aufklappbar und schlägt bei zu hoher Belastung einen kleineren
Betrag oder keinen Kredit vor. Das Hero-Motiv (Konstruktionszeichnung der Bildmarke) fügt sich beim Laden zum Originalzeichen.

**Technik:** Statisches HTML/CSS/JS ohne Build und ohne Netzwerk (`index.html`, `styles.css`, `app.js`).
Schriften (OFL) und Logo-Dateien nach `assets/` kopiert, damit `file://` in allen Browsern funktioniert.
Rechner: Annuität mit Beispielzins 8.9 % eff. (Platzhalter); Laufzeit als Auswahl 12/24/36/48/60 Monate; Ampel nach
Anteil der Rate am frei verfügbaren Budget (≤ 35 % tragbar, ≤ 60 % knapp, darüber zu hoch).
`prefers-reduced-motion` schaltet alle Animationen ab.

**Überarbeitung:** Rechner aus Abschnitt 03 in den Hero verschoben (alter Abschnitt entfernt, damit nur ein Rechner
existiert). Text um rund die Hälfte gekürzt (Wortzahl ca. 760 → 340): Headlines kurz, Leistungen als Titel plus eine
Zeile, Ablauf in drei Schritten, FAQ auf vier Fragen.

**Bekannte Grenzen:** Kontaktformular ist eine Demo (wird nicht versendet). Adresse, Telefon, E-Mail, Zeiten,
Honorarmodell sind Platzhalter. Tragbarkeitslogik ist bewusst vereinfacht und keine KKG-Prüfung.
Die Regionenkarte ist schematisch. Kein Dark Mode. Kein WebGPU-Element in dieser Variante.
