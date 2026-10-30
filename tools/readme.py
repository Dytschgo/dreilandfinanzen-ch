"""LIESMICH für das Brand Kit."""
from __future__ import annotations

from colors import palette

TEXT = """# Dreiland Finanzen – Brand Kit

Version 1.0 · Oktober 2026

**Fair finanziert. Persönlich begleitet.**

## Inhalt

| Ordner | Inhalt |
|---|---|
| `01_Logo/SVG` | Editierbare Vektordateien: horizontal, vertikal, icon, wortmarke – jeweils farbig, monochrom-navy, monochrom-schwarz, invertiert, darkmode, darkmode-flaeche |
| `01_Logo/PNG` | Transparente PNG-Exporte in mehreren Breiten (bis 4000 px) |
| `02_Logo-Animation` | Animierte SVG-Logo-Reveals (respektieren `prefers-reduced-motion`), `vorschau.html` |
| `03_Favicons` | favicon.ico / favicon.svg (mit Dark Mode), PNG 16–512 px, Apple Touch, Android, Maskable, `site.webmanifest`, `einbindung.html` |
| `04_Farben` | CSS-Variablen, JSON-Tokens, Adobe Swatch Exchange (.ase), GIMP/Inkscape-Palette (.gpl) |
| `05_Typografie` | Montserrat, Inter, Source Serif 4 (Variable Fonts, SIL Open Font License) |
| `06_Brand-Guidelines` | Markenhandbuch als PDF (18 Seiten) |
| `07_Mockups` | Visitenkarte (+ Druck-PDF mit 3 mm Beschnitt), Briefpapier (+ A4-PDF), Website, Social-Media-Vorlagen |
| `08_Anwendungsrichtungen` | Swiss Corporate, Premium Finance, Digital Finance (PNG + PDF) |
| `09_Vorlage` | Original-Rastervorlage als Referenz |

## Farben (Annäherung)

| Name | HEX | RGB | CMYK* | Pantone** |
|---|---|---|---|---|
{rows}

\\* rechnerisch, ohne Farbprofil · \\*\\* unverbindliche Annäherung

## Wichtige Hinweise

- **Rekonstruktion:** Das Logo wurde aus einer Rastervorlage (361 × 143 px) vektorisiert. Die Bildmarke ist auf exakte
  30°-Winkel idealisiert. Die Originalschrift ist unbekannt; die Wortmarke verwendet Montserrat Bold / Regular als
  Annäherung (in Pfade umgewandelt). Die Farben sind aus dem Raster gemessen. Vor Druckproduktion Originaldaten anfragen
  oder einen Farbproof erstellen.
- **Platzhalter:** Namen, Adresse, Telefon, UID, IBAN, Zinssätze und Rechenbeispiele in Mockups ersetzen.
- **Kreditwerbung:** In jeder Werbung für Kredite gehört der Hinweis «Die Kreditvergabe ist verboten, falls sie zur
  Überschuldung führt (Art. 3 UWG).» Aggressive Werbung für Konsumkredite ist verboten (Art. 36a KKG).
  Werbemittel vor Veröffentlichung rechtlich prüfen lassen.
- **Schriften:** SIL Open Font License 1.1, frei kommerziell nutzbar.
"""


def build(r):
    from build import KIT, write
    rows = "\n".join(f"| {p['name']} | {p['hex']} | {', '.join(map(str, p['rgb']))} | "
                     f"{' / '.join(map(str, p['cmyk']))} | {p['pantone']} |" for p in palette())
    write(KIT / "LIESMICH.md", TEXT.format(rows=rows))
    print("readme ok")
