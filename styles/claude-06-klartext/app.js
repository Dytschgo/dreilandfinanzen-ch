/* Dreiland Finanzen – «Klartext»: Der Rechner antwortet in der Überschrift. */
(() => {
  const EFF = 0.089;                       // Beispiel: effektiver Jahreszins
  const I = Math.pow(1 + EFF, 1 / 12) - 1; // Monatszins
  const OK = 0.35, TIGHT = 0.6;            // Anteil der Rate am freien Budget
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = id => document.getElementById(id);
  const hero = document.querySelector(".hero");
  const amount = $("amount"), income = $("income"), fix = $("fix");
  const term = () => +document.querySelector('input[name="term"]:checked').value;

  const group = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  const chf0 = n => `CHF ${group(n)}`;
  const chf2 = n => { const [a, b] = Math.abs(n).toFixed(2).split("."); return `CHF ${group(+a)}.${b}`; };
  const parse = el => Math.max(0, +String(el.value).replace(/[^\d]/g, "") || 0);
  const rateOf = (a, n) => a * I / (1 - Math.pow(1 + I, -n));
  const pvOf = (r, n) => r * (1 - Math.pow(1 + I, -n)) / I;

  /* ---------- Isometrischer Budget-Block ---------- */
  const svg = $("blockSvg"), NS = "http://www.w3.org/2000/svg";
  const L = 420, D = 52, H = 34, c30 = Math.cos(Math.PI / 6), s30 = 0.5;
  const O = { x: 124, y: 286 };
  const P = (a, b, z) => [O.x + a * c30 - b * c30, O.y - a * s30 - b * s30 - z];
  const pts = arr => arr.map(p => p.map(v => v.toFixed(1)).join(",")).join(" ");
  const COL = {
    fix: ["#0A4682", "#2D68A8", "#08386A"],
    rate: ["#C69D49", "#DDB868", "#A9843A"],
    over: ["#CE2530", "#E5484D", "#A81D27"],
    free: ["#D5DCE7", "#E8EDF4", "#C3CCDA"],
  };
  const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const segs = ["fix", "rate", "free"].map(k => {
    const g = el("g", {}), front = el("polygon", {}), top = el("polygon", {}), cap = el("polygon", {});
    g.append(cap, front, top); svg.append(g); return { k, front, top, cap };
  });
  const limit = el("g", { "aria-hidden": "true" });
  const limitLine = el("polyline", { fill: "none", stroke: "#CE2530", "stroke-width": "2.5", "stroke-linecap": "round" });
  const limitText = el("text", { fill: "#CE2530", "font-size": "12", "font-weight": "600", "font-family": "Inter, Arial, sans-serif",
    stroke: "#fff", "stroke-width": "4", "paint-order": "stroke", "stroke-linejoin": "round" });
  limitText.textContent = "Grenze der Tragbarkeit";
  limit.append(limitLine, limitText); svg.append(limit);

  let cur = null, target = null, raf = 0;
  function draw(s) {
    let x = 0;
    for (const seg of segs) {
      const w = s[seg.k];
      const c = seg.k === "rate" && s.over ? COL.over : COL[seg.k];
      const a = x, b = x + w;
      seg.front.setAttribute("points", pts([P(a, 0, 0), P(b, 0, 0), P(b, 0, H), P(a, 0, H)]));
      seg.top.setAttribute("points", pts([P(a, 0, H), P(b, 0, H), P(b, D, H), P(a, D, H)]));
      seg.cap.setAttribute("points", x === 0 ? pts([P(a, 0, 0), P(a, 0, H), P(a, D, H), P(a, D, 0)]) : "");
      // Endkappe des letzten sichtbaren Segments
      seg.front.setAttribute("fill", c[0]); seg.top.setAttribute("fill", c[1]); seg.cap.setAttribute("fill", c[2]);
      seg.front.setAttribute("stroke", "#fff"); seg.front.setAttribute("stroke-width", "0.75");
      seg.top.setAttribute("stroke", "#fff"); seg.top.setAttribute("stroke-width", "0.75");
      x = b;
    }
    const g = s.limit;
    limitLine.setAttribute("points", pts([P(g, 0, 0), P(g, 0, H + 3), P(g, D, H + 3)]));
    const [tx, ty] = P(g, D, H + 10);
    limitText.setAttribute("x", (tx - 4).toFixed(1)); limitText.setAttribute("y", (ty - 16).toFixed(1));
    limit.style.opacity = s.showLimit ? 1 : 0;
  }
  function tick() {
    raf = 0;
    let done = true;
    for (const k of ["fix", "rate", "free", "limit"]) {
      const d = target[k] - cur[k];
      if (Math.abs(d) > 0.3) { cur[k] += d * 0.22; done = false; } else cur[k] = target[k];
    }
    cur.over = target.over; cur.showLimit = target.showLimit;
    draw(cur);
    if (!done) raf = requestAnimationFrame(tick);
  }
  function animateTo(t) {
    target = t;
    if (!cur || reduce) { cur = { ...t }; draw(cur); return; }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  /* ---------- Rechnen und antworten ---------- */
  let suggestion = 0;
  function update() {
    const A = +amount.value, n = term(), inc = parse(income), fx = parse(fix);
    const rate = rateOf(A, n), free = inc - fx, share = free > 0 ? rate / free : Infinity;
    const max = free > 0 ? Math.min(+amount.max, Math.floor(pvOf(free * OK, n) / 500) * 500) : 0;

    amount.style.setProperty("--p", `${((A - amount.min) / (amount.max - amount.min)) * 100}%`);
    $("amountOut").textContent = `${chf0(A)}.–`;
    $("rate").textContent = chf2(rate);
    $("cost").textContent = chf2(rate * n - A);
    $("question").textContent = `${chf0(A)} in ${n} Monaten?`;

    let state, verdict, sub, sug = "";
    if (free <= 0 || max < 1000) {
      state = "none"; verdict = "Ehrlich gesagt: lieber keinen Kredit";
      sub = free <= 0 ? "Ihre Fixkosten brauchen das ganze Einkommen. Reden wir über Ihr Budget." : "Für diese Laufzeit bleibt zu wenig Spielraum.";
    } else if (share <= OK) {
      state = "ok"; verdict = "Das passt"; sub = "Die Rate lässt Ihnen genug Spielraum.";
    } else if (share <= TIGHT) {
      state = "tight"; verdict = "Das wird knapp"; sub = "Es bleibt wenig Reserve für Unvorhergesehenes.";
      sug = `Mit ${chf0(max)} wäre es entspannter`;
    } else {
      state = "high"; verdict = "Ehrlich gesagt: lieber weniger"; sub = "Diese Rate würde Ihr Budget zu stark belasten.";
      sug = `Tragbar wären etwa ${chf0(max)}`;
    }
    hero.dataset.state = state;
    $("verdict").innerHTML = `${verdict}<span class="mark">.</span>`;
    $("verdictSub").textContent = sub;
    suggestion = max;
    const btn = $("suggest");
    btn.hidden = !sug;
    if (sug) btn.innerHTML = `${sug} <span aria-hidden="true">→</span>`;

    $("lgFix").textContent = chf0(fx);
    $("lgRate").textContent = chf0(rate);
    $("lgFree").textContent = chf0(Math.max(0, free - rate));

    const total = Math.max(inc, fx + rate, 1), k = L / total;
    animateTo({
      fix: Math.min(fx, total) * k,
      rate: rate * k,
      free: Math.max(0, inc - fx - rate) * k,
      limit: free > 0 ? (fx + free * OK) * k : Math.min(fx, total) * k,
      over: state === "high" || state === "none",
      showLimit: free > 0,
    });
  }

  function formatMoney(e) { const v = parse(e.target); e.target.value = group(v); }
  amount.addEventListener("input", update);
  document.querySelectorAll('input[name="term"]').forEach(r => r.addEventListener("change", update));
  for (const f of [income, fix]) {
    f.addEventListener("input", update);
    f.addEventListener("blur", formatMoney);
  }
  $("suggest").addEventListener("click", () => {
    amount.value = Math.max(+amount.min, suggestion);
    update();
    amount.focus();
  });
  update();
})();
