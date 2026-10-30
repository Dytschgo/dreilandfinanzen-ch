# Mitmachen

## Lokal starten

```
python -m http.server 5180 --bind 127.0.0.1
```

http://127.0.0.1:5180/ zeigt die Website, `/brand-kit/` das Brand Kit.

## Regeln

- **Logo unverändert** verwenden (`assets/logo/`), nicht neu zeichnen oder umfärben. **Gold nur im Logo.**
- **Schriften:** Montserrat (Überschriften) und Inter (Text) in ihren Standardformen – keine Stilvarianten (`ss01`, `cv11` …).
- **Kredit & Budgetcheck:** Kreditregeln und Formel wie `credit-core` (7.9 % eff. Beispielzins, ab CHF 5'000,
  über CHF 80'000 höchstens 84 Monate). Zahlen sofort mit Endwert anzeigen, keine hochzählenden Animationen.
- **Schweizer Rechtschreibung** (ss statt ß, «Guillemets», CHF 15'000.–), wenig Text.
- **Pflichthinweis** sichtbar: «Die Kreditvergabe ist verboten, falls sie zur Überschuldung führt (Art. 3 UWG).»
  Keine aggressive Kreditwerbung (Art. 36a KKG). «Erste Einschätzung, keine Kreditzusage» bleibt sichtbar.
- Barrierefreiheit (Tastatur, Kontrast AA, `prefers-reduced-motion`), keine CDNs, keine externen Abhängigkeiten.
- Platzhalter (Kontakt, Firmenangaben, Fotos) als solche kennzeichnen.

## Ablauf

Änderungen per Pull Request gegen `main`. Jeder Merge auf `main` geht sofort live.
