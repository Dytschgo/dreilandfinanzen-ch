/* Dreiland Finanzen – «Isometrie, aufgeräumt»
   Kreditrechner, geführter Budgetcheck, Höhenlinien, Menü, Demo-Formular. Keine Bibliotheken. */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (name, attrs, parent) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  /* ---------- Rechnen ---------- */
  const EFF = 0.089;                        // Beispiel: effektiver Jahreszins
  const IM = Math.pow(1 + EFF, 1 / 12) - 1; // Monatszins – wie in den übrigen Varianten
  const group = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  const chf = n => `CHF ${group(n)}.–`;
  const chf2 = n => { const [a, b] = Math.abs(n).toFixed(2).split("."); return `${n < 0 ? "− " : ""}CHF ${group(+a)}.${b}`; };
  /* Rate auf Rappen gerundet; Gesamtrückzahlung = Rate × Laufzeit, Zinskosten = Gesamt − Betrag */
  function annuity(P, n) {
    const rate = Math.round(P * IM / (1 - Math.pow(1 + IM, -n)) * 100) / 100;
    const total = Math.round(rate * n * 100) / 100;
    return { rate, total, zins: Math.round((total - P) * 100) / 100 };
  }
  const fill = r => r.style.setProperty("--fill", `${((r.value - r.min) / (r.max - r.min)) * 100}%`);

  /* ---------- Kreditrechner ---------- */
  const betrag = $("#betrag"), bcBetrag = $("#bc-betrag"), bcLz = $("#bc-lz");
  const laufzeit = () => +$('input[name="laufzeit"]:checked').value;

  function render(P, n) {
    const a = annuity(P, n);
    fill(betrag); fill(bcBetrag);
    $("#betrag-out").textContent = chf(P);
    $("#bc-betrag-out").textContent = chf(P);
    $("#rate").textContent = chf2(a.rate);
    $("#zins").textContent = chf2(a.zins);
    $("#total").textContent = chf2(a.total);
    $("#bc-rate").textContent = chf2(a.rate);
    estimate(a.rate);
  }
  /* Hero-Rechner und Budgetcheck teilen Betrag und Laufzeit */
  function fromHero() { bcBetrag.value = betrag.value; bcLz.value = String(laufzeit()); render(+betrag.value, laufzeit()); }
  function fromCheck() {
    betrag.value = bcBetrag.value;
    $$('input[name="laufzeit"]').forEach(r => { r.checked = r.value === bcLz.value; });
    render(+bcBetrag.value, +bcLz.value);
  }
  betrag.addEventListener("input", fromHero);
  $$('input[name="laufzeit"]').forEach(r => r.addEventListener("change", fromHero));
  bcBetrag.addEventListener("input", fromCheck);
  bcLz.addEventListener("change", fromCheck);

  /* ---------- Budgetcheck ---------- */
  const form = $("#bc");
  const num = el => { const v = +String(el.value).replace(/[^\d.]/g, ""); return el.value.trim() !== "" && isFinite(v) ? v : NaN; };
  const TEXT = {
    ok: ["Rechnerischer Spielraum", "Nach Ausgaben, Reserve und Rate bleibt Ihnen rechnerisch Luft. Im Gespräch prüfen wir, ob das auch in einem schwierigen Monat gilt."],
    warn: ["Wenig Spielraum", "Die Rate passt rechnerisch, aber knapp. Oft hilft ein kleinerer Betrag oder eine längere Laufzeit – das besprechen wir gemeinsam."],
    bad: ["Zu wenig Spielraum", "Für diese Rate bleibt nicht genug übrig. Ein kleinerer Betrag oder ein anderer Weg passt hier besser."],
  };
  function estimate(rate) {
    const inc = num($("#bc-ink")), aus = num($("#bc-aus")), res = num($("#bc-res"));
    if ([inc, aus, res].some(isNaN)) return;
    const frei = inc - aus - res - rate;
    const state = frei < 0 ? "bad" : frei < inc * 0.1 ? "warn" : "ok";
    const base = Math.max(inc, aus + res + rate) || 1;
    const w = (cls, v) => $(cls, form).style.setProperty("--w", `${(Math.max(v, 0) / base) * 100}%`);
    w(".bar__aus", aus); w(".bar__res", res); w(".bar__rate", rate); w(".bar__frei", frei);
    $("#estimate").dataset.state = state;
    $("#est-status").textContent = TEXT[state][0];
    $("#est-text").textContent = TEXT[state][1];
    $("#est-frei").textContent = chf(Math.abs(frei));
    $("#est-unit").textContent = frei < 0 ? "fehlen pro Monat" : "bleiben pro Monat";
  }
  function validate() {
    const missing = [["#bc-ink", "Nettoeinkommen"], ["#bc-aus", "Ausgaben"], ["#bc-res", "Reserve"]].filter(([id]) => {
      const bad = isNaN(num($(id)));
      $(id).setAttribute("aria-invalid", String(bad));
      return bad;
    });
    $("#bc-err").textContent = missing.length ? `Bitte als Zahl angeben: ${missing.map(m => m[1]).join(", ")}.` : "";
    return !missing.length;
  }
  function go(step, focus = true) {
    if (step === 2 && !validate()) { $('[aria-invalid="true"]', form).focus(); return; }
    form.dataset.step = step;
    $$(".bc__step", form).forEach(s => { s.hidden = +s.dataset.step !== step; });
    $$("[data-tab]", form).forEach(t => {
      const i = +t.dataset.tab;
      t.classList.toggle("is-current", i === step);
      t.classList.toggle("is-done", i < step);
      if (i === step) t.setAttribute("aria-current", "step"); else t.removeAttribute("aria-current");
    });
    if (step === 2) render(+bcBetrag.value, +bcLz.value);
    if (focus) $(`#bc-h${step + 1}`).focus();
  }
  $$("[data-go]", form).forEach(b => b.addEventListener("click", () => go(+b.dataset.go)));
  ["#bc-ink", "#bc-aus", "#bc-res"].forEach(id => $(id).addEventListener("input", () => render(+bcBetrag.value, +bcLz.value)));
  form.addEventListener("submit", e => { e.preventDefault(); const s = +form.dataset.step; if (s < 2) go(s + 1); });
  /* «Budgetcheck» in der Navigation öffnet den Check bei Schritt 1 */
  $$('a[href="#budgetcheck"]').forEach(a => a.addEventListener("click", () => go(0, false)));

  /* ---------- Höhenlinien (Marching Squares, künstlerisch) ---------- */
  function field(hills, river) {
    return (x, y) => {
      let v = 0;
      for (const [hx, hy, sx, sy, a] of hills) { const dx = (x - hx) / sx, dy = (y - hy) / sy; v += a * Math.exp(-(dx * dx + dy * dy)); }
      if (river) {
        let best = Infinity;
        for (const [rx, ry] of river) { const d = (x - rx) ** 2 + (y - ry) ** 2; if (d < best) best = d; }
        v -= 0.7 * Math.exp(-best / 1800);
      }
      return v;
    };
  }
  function contours(g, w, h, f, levels, cell) {
    const nx = Math.ceil(w / cell) + 1, ny = Math.ceil(h / cell) + 1;
    const grid = Array.from({ length: ny }, (_, j) => Array.from({ length: nx }, (_, i) => f(i * cell, j * cell)));
    const lerp = (a, b, va, vb, lv) => a + (b - a) * ((lv - va) / (vb - va || 1e-9));
    const SEG = { 1: [3, 2], 2: [2, 1], 3: [3, 1], 4: [0, 1], 5: [0, 3, 2, 1], 6: [0, 2], 7: [0, 3], 8: [0, 3], 9: [0, 2], 10: [0, 1, 2, 3], 11: [0, 1], 12: [3, 1], 13: [2, 1], 14: [3, 2] };
    levels.forEach((lv, li) => {
      let d = "";
      for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
        const x0 = i * cell, y0 = j * cell, x1 = x0 + cell, y1 = y0 + cell;
        const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], e = grid[j + 1][i];
        const idx = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (e > lv ? 1 : 0);
        if (!SEG[idx]) continue;
        const edge = [[lerp(x0, x1, a, b, lv), y0], [x1, lerp(y0, y1, b, c, lv)], [lerp(x0, x1, e, c, lv), y1], [x0, lerp(y0, y1, a, e, lv)]];
        const s = SEG[idx];
        for (let k = 0; k < s.length; k += 2) {
          const p = edge[s[k]], q = edge[s[k + 1]];
          d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
        }
      }
      if (d) svgEl("path", { d, class: li % 4 === 0 ? "ct ct--major" : "ct" }, g);
    });
  }
  const bg = $('[data-terrain="bg"]');
  if (bg) contours(svgEl("g", {}, bg), 1200, 600, field([[1010, 150, 220, 160, 1], [880, 470, 180, 120, .8], [1130, 420, 120, 110, .7]]), [.1, .2, .3, .4, .5, .6, .7, .8, .9], 10);

  /* Regionale Karte: Rhein von Osten (CH/DE-Grenze) zum Rheinknie bei Basel, dann nach Norden (FR/DE) */
  const map = $('[data-terrain="map"]');
  if (map) {
    const RHEIN = "M560 205 C 480 200, 420 188, 360 186 C 310 184, 285 196, 262 176 C 240 156, 252 110, 246 72 C 240 36, 248 14, 240 0";
    const tmp = svgEl("path", { d: RHEIN }, map), L = tmp.getTotalLength(), pts = [];
    for (let i = 0; i <= 50; i++) { const p = tmp.getPointAtLength((L * i) / 50); pts.push([p.x, p.y]); }
    tmp.remove();
    contours(svgEl("g", {}, map), 560, 300, field([[100, 90, 120, 80, 1], [440, 80, 110, 70, 1], [150, 270, 140, 60, .8], [430, 280, 130, 60, .9]], pts), [-.15, 0, .15, .3, .45, .6, .75, .9], 8);
    svgEl("path", { d: RHEIN, class: "rhein" }, map);
    [["FR", 110, 110], ["DE", 440, 100], ["CH", 400, 270]].forEach(([t, x, y]) => { svgEl("text", { x, y, class: "label", "text-anchor": "middle" }, map).textContent = t; });
    svgEl("circle", { cx: 262, cy: 176, r: 6, fill: "#fff", stroke: "#CE2530", "stroke-width": 3 }, map);
    svgEl("text", { x: 276, y: 168, class: "basel" }, map).textContent = "Basel";
  }

  /* ---------- Menü ---------- */
  const burger = $(".burger"), nav = $("#nav");
  const setMenu = open => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Menü schliessen" : "Menü öffnen");
    nav.classList.toggle("is-open", open);
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", nav).forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); burger.focus(); } });

  /* ---------- Kontaktformular (Demo) ---------- */
  const cf = $("#contact-form"), msg = $("#form-msg");
  cf.addEventListener("submit", e => {
    e.preventDefault();
    const bad = [["#f-name", "Name"], ["#f-mail", "E-Mail"]].filter(([id]) => {
      const ok = $(id).checkValidity();
      $(id).setAttribute("aria-invalid", String(!ok));
      return !ok;
    }).map(([, l]) => l);
    const ok = $("#f-ok").checked;
    $("#f-ok").closest(".check").classList.toggle("is-invalid", !ok);
    if (!ok) bad.push("Einverständnis");
    if (bad.length) { msg.className = "form__msg is-error"; msg.textContent = `Bitte prüfen Sie: ${bad.join(", ")}.`; cf.querySelector('[aria-invalid="true"]')?.focus(); return; }
    msg.className = "form__msg";
    msg.textContent = "Danke! Dies ist eine Demo – es wurden keine Daten gesendet.";
    cf.reset();
  });

  window.__dfAnnuity = annuity; // für Prüfskript
  go(0, false);
  render(+betrag.value, laufzeit());
})();
