/* Dreiland Finanzen – Kredit & Budgetcheck, Höhenlinien, Menü, Beratungsanfrage.
   Kreditregeln und Schätzformel entsprechen credit-core v0.2 (shared/credit-rules.json, estimateCredit). */
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

  /* ---------- Regeln (credit-core) ---------- */
  const RULES = Object.freeze({
    exampleAnnualRate: 7.9, minAmount: 5000, sliderMaxAmount: 300000, amountStep: 500,
    terms: [12, 24, 36, 48, 60, 72, 84, 96, 108, 120], standardMaxTerm: 84, longTermMaxAmount: 80000,
    defaultAmount: 20000, defaultTerm: 48,
    budgetPayments: 30, // Dreiland-Budgetplanung, keine formelle Kreditfähigkeitsprüfung
    optimisationPayments: 36,
  });
  const maxTermFor = amount => (amount > RULES.longTermMaxAmount ? RULES.standardMaxTerm : RULES.terms.at(-1));
  function estimate(amount, months) {
    const i = Math.pow(1 + RULES.exampleAnnualRate / 100, 1 / 12) - 1;
    const monthly = amount * i / (1 - Math.pow(1 + i, -months));
    const total = monthly * months;
    return { monthly, total, interest: total - amount };
  }
  /* Schieberegler 0–1000, quadratisch verteilt: kleine Beträge fein, grosse grob */
  const CURVE = 2.2;
  const toAmount = v => {
    const raw = RULES.minAmount + (RULES.sliderMaxAmount - RULES.minAmount) * Math.pow(v / 1000, CURVE);
    return Math.min(RULES.sliderMaxAmount, Math.max(RULES.minAmount, Math.round(raw / RULES.amountStep) * RULES.amountStep));
  };
  const toSlider = a => Math.round(1000 * Math.pow((Math.min(Math.max(a, RULES.minAmount), RULES.sliderMaxAmount) - RULES.minAmount) / (RULES.sliderMaxAmount - RULES.minAmount), 1 / CURVE));

  /* ---------- Format ---------- */
  const group = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  const chf = n => `CHF ${group(n)}.–`;
  const chf2 = n => { const [a, b] = Math.abs(n).toFixed(2).split("."); return `CHF ${n < 0 ? "−" : ""}${group(+a)}.${b}`; };
  const parse = el => {
    const s = String(el.value).replace(/[\s'’]/g, "");
    const v = /^\d+(?:[.,]\d{1,2})?$/.test(s) ? Number(s.replace(",", ".")) : NaN;
    return Number.isSafeInteger(Math.round(v * 100)) ? v : NaN;
  };
  const formatInput = v => {
    const [whole, decimals] = String(v).split(".");
    return group(+whole) + (decimals ? `.${decimals}` : "");
  };

  /* ---------- Zustand ---------- */
  const tool = $("#rechner");
  const state = { amount: RULES.defaultAmount, months: RULES.defaultTerm, step: 0 };
  const amountIn = $("#betrag"), amountRange = $("#betrag-range"), adjRange = $("#adj-betrag"), adjLz = $("#adj-lz");

  /* Laufzeit-Auswahl einmal aus den Regeln erzeugen */
  const termsRow = $("#terms");
  RULES.terms.forEach(t => {
    termsRow.insertAdjacentHTML("beforeend", `<label><input type="radio" name="laufzeit" value="${t}"><span>${t}</span></label>`);
    adjLz.insertAdjacentHTML("beforeend", `<option value="${t}">${t} Monate</option>`);
  });
  const termRadios = $$('input[name="laufzeit"]');

  const valid = () => Number.isInteger(state.amount) && state.amount >= RULES.minAmount && state.amount <= RULES.sliderMaxAmount;
  const fill = r => r.style.setProperty("--fill", `${(r.value / 1000) * 100}%`);

  function render({ fromInput = false } = {}) {
    const ok = valid();
    // Laufzeitgrenze über CHF 80'000
    const maxT = maxTermFor(ok ? state.amount : 0);
    if (state.months > maxT) state.months = maxT;
    termRadios.forEach(r => { r.disabled = +r.value > maxT; r.checked = +r.value === state.months; });
    $$("option", adjLz).forEach(o => { o.disabled = +o.value > maxT; });
    adjLz.value = String(state.months);
    $("#terms-note").hidden = maxT === RULES.terms.at(-1);

    if (ok) {
      const pos = toSlider(state.amount);
      amountRange.value = pos; adjRange.value = pos;
      if (!fromInput) amountIn.value = group(state.amount);
    }
    fill(amountRange); fill(adjRange);
    $("#betrag-err").textContent = ok ? "" : state.amount > RULES.sliderMaxAmount ? "Höchstens CHF 300'000.–." : "Mindestens CHF 5'000.–.";
    amountIn.setAttribute("aria-invalid", String(!ok));

    const e = ok ? estimate(state.amount, state.months) : null;
    $("#rate").textContent = e ? chf2(e.monthly) : "–";
    $("#zins").textContent = e ? chf2(e.interest) : "–";
    $("#total").textContent = e ? chf2(e.total) : "–";
    $("#adj-rate").textContent = e ? chf2(e.monthly) : "–";
    $("#adj-betrag-out").textContent = ok ? chf(state.amount) : "–";
    $("#carry").textContent = e ? `${chf(state.amount)} · ${state.months} Monate · Rate ${chf2(e.monthly)}` : "Bitte zuerst einen gültigen Kreditbetrag wählen.";
    budget(e ? estimate(state.amount, Math.min(state.months, RULES.budgetPayments)).monthly : null);
  }

  /* ---------- Budget ---------- */
  const TEXT = {
    go: ["Tragbar im Budgetcheck", "Mit dem verfügbaren Monatsbudget ist die Rückzahlung in höchstens 30 Zahlungen rechnerisch möglich. Auch ein positiver Spielraum, etwa CHF 50, bedeutet nicht automatisch komfortable Tragbarkeit. Die persönliche Prüfung bleibt nötig."],
    optimise: ["Optimierung nötig", "Das verfügbare Monatsbudget reicht rechnerisch für 31 bis 36 Zahlungen. Wir prüfen gemeinsam, ob ein kleinerer Kreditbetrag oder eine Anpassung des Budgets sinnvoll ist."],
    unaffordable: ["Im Budgetcheck nicht tragbar", "Das verfügbare Monatsbudget reicht nicht für eine Rückzahlung innerhalb von 36 Zahlungen. Bitte besprechen Sie einen kleineren Kreditbetrag oder andere Möglichkeiten mit uns."],
  };
  function repaymentAssessment(capacity) {
    // Ganze Zahlungen inklusive Beispielzins. Auf volle Rappen aufrunden, damit
    // ein rechnerisch fehlender Rappen nicht zur besseren Einstufung führt.
    for (let payments = 1; payments <= RULES.optimisationPayments; payments++) {
      const required = Math.ceil((estimate(state.amount, payments).monthly - 1e-9) * 100) / 100;
      if (capacity >= required) return { payments, band: payments <= RULES.budgetPayments ? "go" : "optimise" };
    }
    return { payments: 37, band: "unaffordable" };
  }
  const budgetFields = [["#ink", "Nettoeinkommen"], ["#aus", "Lebenshaltung"], ["#pflicht", "Verpflichtungen"], ["#jahr", "Jahresrechnungen"], ["#res", "Reserve"], ["#mehr", "Zusatzkosten"]];
  const householdValid = () => Number.isSafeInteger(parse($("#haushalt"))) && parse($("#haushalt")) >= 1;
  const stabilityValid = () => ["stabil", "unsicher"].includes($("#stabil").value);
  function readBudget(rate) {
    const [inc, living, commitments, annual, reserve, extra] = budgetFields.map(([id]) => parse($(id)));
    if (rate === null || [inc, living, commitments, annual, reserve, extra].some(isNaN) || !householdValid() || !stabilityValid()) return null;
    const annualMonth = annual / 12;
    const expenses = living + commitments + annualMonth;
    const capacity = Math.floor((inc - expenses - reserve) * 100 + 1e-6) / 100;
    const assessment = repaymentAssessment(capacity);
    // Rappen für Ergebnis und Status: Anzeige und Warnung müssen übereinstimmen.
    const buffer = Math.round((inc - expenses - reserve - rate) * 100) / 100;
    const stressed = Math.round((buffer - extra) * 100) / 100;
    const uncertain = $("#stabil").value === "unsicher";
    const pressure = buffer <= 0 || stressed <= 0 || reserve === 0 || uncertain;
    const status = assessment.band === "unaffordable" ? "bad" : assessment.band === "optimise" || pressure ? "warn" : "review";
    const paymentsText = capacity <= state.amount * (Math.pow(1 + RULES.exampleAnnualRate / 100, 1 / 12) - 1) ? "Keine Rückzahlung möglich" : assessment.payments === 37 ? "37 oder mehr" : String(assessment.payments);
    return { inc, living, commitments, annualMonth, reserve, extra, expenses, rate, buffer, stressed, uncertain, status, pressure, capacity, paymentsText, ...assessment, household: parse($("#haushalt")) };
  }
  function budget(rate) {
    const b = readBudget(rate);
    if (!b) {
      $("#estimate").dataset.state = "incomplete";
      delete $("#estimate").dataset.band;
      $("#est-status").textContent = "Bitte Eingaben vervollständigen";
      $("#est-text").textContent = "Für Ihren Spielraum brauchen wir einen gültigen Kreditbetrag und alle Budgetangaben. Bitte 0 eintragen, wenn keine Kosten anfallen.";
      $("#est-frei").textContent = "–";
      $("#est-unit").textContent = "";
      $$(".budget-math dd").forEach(el => { el.textContent = "–"; });
      $$(".bar i", tool).forEach(el => el.style.setProperty("--w", "0%"));
      $("#budget-context").textContent = "";
      return false;
    }
    const base = Math.max(b.inc, b.expenses + b.reserve + rate) || 1;
    const w = (cls, v) => $(cls, tool).style.setProperty("--w", `${(Math.max(v, 0) / base) * 100}%`);
    w(".bar__aus", b.expenses); w(".bar__res", b.reserve); w(".bar__rate", rate); w(".bar__frei", b.buffer);
    $("#estimate").dataset.state = b.status;
    $("#estimate").dataset.band = b.band;
    $("#est-status").textContent = b.band === "go" && b.pressure ? "Bis 30 Zahlungen – Budget unter Druck" : TEXT[b.band][0];
    const concerns = [];
    if (b.buffer <= 0) concerns.push("Für die angezeigte Prüfrate bleibt kein positiver Puffer.");
    else if (b.stressed <= 0) concerns.push("Die Zusatzkosten im teureren Monat schöpfen den Puffer aus.");
    if (b.reserve === 0) concerns.push("Eine Reserve fehlt.");
    if (b.uncertain) concerns.push("Das Einkommen ist unsicher.");
    $("#est-text").textContent = `${TEXT[b.band][1]} ${concerns.join(" ")}`.trim();
    $("#est-frei").textContent = chf2(Math.abs(b.buffer));
    $("#est-unit").textContent = b.buffer < 0 ? "fehlen pro Monat" : "bleiben pro Monat";
    for (const [id, v] of Object.entries({ ink: b.inc, aus: b.living, pflicht: b.commitments, jahr: b.annualMonth, res: b.reserve, capacity: b.capacity, rate, frei: b.buffer, stress: b.stressed })) $("#b-" + id).textContent = chf2(v);
    $("#b-payments").textContent = b.paymentsText;
    const payments = Math.min(state.months, RULES.budgetPayments);
    $("#budget-rate-label").textContent = `− Prüfrate (${payments} Zahlungen)`;
    $("#budget-context").textContent = `${b.household} ${b.household === 1 ? "Person lebt" : "Personen leben"} von diesem Budget. ${b.uncertain ? "Das Einkommen ist unsicher und muss genauer geprüft werden." : "Sie haben das Einkommen als stabil eingeschätzt."} ${b.extra === 0 ? "Es wurde keine Mehrbelastung geprüft." : `Im teureren Monat sind ${chf2(b.extra)} zusätzliche Kosten berücksichtigt.`} Die Prüfrate basiert auf ${payments} Zahlungen; eine längere gewählte Laufzeit vergrössert diesen Budgetspielraum nicht.`;
    return true;
  }
  function validateBudget() {
    const missing = budgetFields.filter(([id]) => {
      const bad = isNaN(parse($(id)));
      $(id).setAttribute("aria-invalid", String(bad));
      return bad;
    });
    $("#haushalt").setAttribute("aria-invalid", String(!householdValid()));
    $("#stabil").setAttribute("aria-invalid", String(!stabilityValid()));
    const errors = [];
    if (missing.length) errors.push(`Bitte als nicht negative Zahl in CHF mit höchstens zwei Nachkommastellen angeben (0, falls keine): ${missing.map(m => m[1]).join(", ")}.`);
    if (!householdValid()) errors.push("Bitte mindestens 1 Person als ganze Zahl angeben.");
    if (!stabilityValid()) errors.push("Bitte die Einkommensstabilität wählen.");
    $("#budget-err").textContent = errors.join(" ");
    return !errors.length;
  }

  /* ---------- Schritte ---------- */
  function go(step, { focus = true } = {}) {
    if (step >= 1 && !valid()) { step = 0; amountIn.focus(); render(); return; }
    if (step === 2 && !validateBudget()) { show(1); $('[aria-invalid="true"]', $('.step[data-step="1"]')).focus(); return; }
    show(step);
    render();
    if (focus) $(`#s${step + 1}-title`).focus({ preventScroll: true });
  }
  function show(step) {
    state.step = step;
    tool.dataset.step = step;
    $$(".step", tool).forEach(s => { s.hidden = +s.dataset.step !== step; });
    $$(".stepper button", tool).forEach(b => {
      const i = +b.dataset.go;
      b.classList.toggle("is-done", i < step);
      if (i === step) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
  }
  $$("[data-go]", tool).forEach(b => b.addEventListener("click", () => go(+b.dataset.go)));
  tool.addEventListener("submit", e => { e.preventDefault(); if (state.step < 2) go(state.step + 1); });

  /* ---------- Eingaben ---------- */
  amountRange.addEventListener("input", () => { state.amount = toAmount(+amountRange.value); render(); });
  adjRange.addEventListener("input", () => { state.amount = toAmount(+adjRange.value); render(); });
  amountIn.addEventListener("input", () => { state.amount = parse(amountIn); render({ fromInput: true }); });
  amountIn.addEventListener("blur", () => { if (valid()) amountIn.value = group(state.amount); });
  termRadios.forEach(r => r.addEventListener("change", () => { state.months = +r.value; render(); }));
  adjLz.addEventListener("change", () => { state.months = +adjLz.value; render(); });
  budgetFields.forEach(([id]) => {
    $(id).addEventListener("input", () => { render(); if ($("#budget-err").textContent) validateBudget(); });
    $(id).addEventListener("blur", e => { const v = parse(e.target); if (!isNaN(v)) e.target.value = formatInput(v); });
  });
  ["#haushalt", "#stabil"].forEach(id => $(id).addEventListener(id === "#stabil" ? "change" : "input", () => {
    render();
    if ($("#budget-err").textContent) validateBudget();
  }));

  /* ---------- Beratung anfragen (aus jedem Schritt) ---------- */
  function consultSummary() {
    if (!valid()) return "";
    const e = estimate(state.amount, state.months);
    const zweck = $("#zweck").value;
    let s = `${zweck ? zweck + ": " : ""}${chf(state.amount)} über ${state.months} Monate, Rate ca. ${chf2(e.monthly)} (Beispiel 7.9 %).`;
    const payments = Math.min(state.months, RULES.budgetPayments);
    const b = readBudget(estimate(state.amount, payments).monthly);
    if (b) s += ` Budgetcheck mit ${payments} Zahlungen und Prüfrate ${chf2(b.rate)}: Nettoeinkommen ${chf2(b.inc)} − Lebenshaltung ${chf2(b.living)} − Verpflichtungen ${chf2(b.commitments)} − Jahresanteil ${chf2(b.annualMonth)} − Reserve ${chf2(b.reserve)}. Verfügbar für Rückzahlung ${chf2(b.capacity)} pro Monat; benötigte Zahlungen: ${b.paymentsText}; Dreiland-Einstufung: ${TEXT[b.band][0]}.${b.pressure ? " Zusätzlicher Budgetdruck: bitte Ergebnis und vollständige Situation persönlich prüfen." : ""} Spielraum ${chf2(b.buffer)} pro Monat; im teureren Monat nach ${chf2(b.extra)} Zusatzkosten ${chf2(b.stressed)}. Haushalt: ${b.household} Person(en), Einkommen ${b.uncertain ? "unsicher" : "als stabil eingeschätzt"}. Persönliche Prüfung nötig; keine formelle Kreditfähigkeitsprüfung.`;
    return s;
  }
  $$("[data-consult]").forEach(a => a.addEventListener("click", () => {
    const s = consultSummary();
    $("#consult-summary").hidden = !s;
    $("#consult-text").textContent = s;
  }));

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

  /* ---------- Beratungsformular (Demo, sendet nichts) ---------- */
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

  window.__dfEstimate = estimate; // für Prüfungen
  show(0);
  render();
})();
