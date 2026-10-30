# Mitmachen

Danke fürs Mitarbeiten an den Dreiland-Finanzen-Designs!

## Lokal starten

```
python -m http.server 5180 --bind 127.0.0.1 --directory styles
```

http://127.0.0.1:5180/ zeigt den Design-Viewer. Jedes Design liegt in `styles/<ordner>/` und läuft ohne Build-Schritt.

## Regeln für Designs

Die vollständigen Vorgaben stehen in [`styles/BRIEF.md`](styles/BRIEF.md) und [`styles/REWORK.md`](styles/REWORK.md). Kurz:

- **Logo unverändert** verwenden (`styles/_assets/logo/`), nicht neu zeichnen oder umfärben.
- **Kreditrechner im ersten Bildschirm** (Betrag-Slider, Laufzeit, Monatsrate) – Desktop und Mobile.
- **Schweizer Rechtschreibung** (ss statt ß, «Guillemets», CHF 15'000.–), wenig Text.
- **Pflichthinweis** sichtbar: «Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG).»
  Keine aggressive Kreditwerbung (Art. 36a KKG).
- Barrierefreiheit (Tastatur, Kontrast AA, `prefers-reduced-motion`), keine CDNs, keine externen Abhängigkeiten.
- Platzhalter (Kontakt, Zinssätze) als solche kennzeichnen.

## Neues Design hinzufügen

1. Ordner `styles/<name>/` mit `index.html` anlegen.
2. Eintrag im Array `STYLES` in `styles/index.html` ergänzen.
3. Vorschaubild `styles/_gallery/<name>.jpg` (1440 × 900, verkleinert auf 720 × 450) ablegen.
4. Pull Request gegen `main` öffnen.

## Veröffentlichen (Maintainer)

`python tools/publish_site.py` baut `site/` und aktualisiert den Branch `site`, den Hostinger ausliefert.
