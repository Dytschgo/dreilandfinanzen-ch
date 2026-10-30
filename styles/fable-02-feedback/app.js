/* Dreiland Finanzen – fable-02-feedback (Basis: «Isometrie»)
 * Vanilla JS: Kreditrechner, geführter Budgetcheck, geometrische Linien, Höhenlinien.
 * Keine externen Bibliotheken, keine Netzwerkzugriffe. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var RM = mq.matches;
  var SVGNS = "http://www.w3.org/2000/svg";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var EASE = "cubic-bezier(.16,1,.3,1)";

  function el(name, attrs, parent) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------- Isometrisches Raster (±30° + Senkrechte) ---------- */
  function isoGrid(g, w, h, s, ox, oy) {
    var t = Math.tan(Math.PI / 6), hh = 2 * s * t, lines = [];
    for (var x = ox % s; x <= w; x += s) lines.push(el("line", { x1: x, y1: 0, x2: x, y2: h }, g));
    var span = w * t;
    for (var c = (oy % hh) - Math.ceil((span + h) / hh) * hh; c <= h + span; c += hh) {
      lines.push(el("line", { x1: 0, y1: c - ox * t, x2: w, y2: c + (w - ox) * t }, g));
      lines.push(el("line", { x1: 0, y1: c + ox * t, x2: w, y2: c - (w - ox) * t }, g));
    }
    return lines;
  }

  /* ---------- Header ---------- */
  var header = $(".site-header");
  var burger = $(".burger");
  var nav = $("#nav");
  function onScrollHeader() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  burger.addEventListener("click", function () {
    var open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Menü schliessen" : "Menü öffnen");
    nav.classList.toggle("is-open", open);
  });
  $$("#nav a").forEach(function (a) {
    a.addEventListener("click", function () { if (nav.classList.contains("is-open")) burger.click(); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { burger.click(); burger.focus(); }
  });
  var navLinks = $$('.nav ul a');
  if ("IntersectionObserver" in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + en.target.id)); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (a) { var t = $(a.getAttribute("href")); if (t) secObs.observe(t); });
  }

  /* ---------- Hero: nur geometrische Linien, kein Emblem ---------- */
  var hero = $(".hero-svg");
  var gridLines = isoGrid($(".hero-grid", hero), 640, 640, 86, 20, 30);
  var construct = $(".hero-construct", hero);
  var nodes = $(".hero-nodes", hero);
  var t30 = Math.tan(Math.PI / 6);
  var cDefs = [[[120, 300], -t30], [[120, 300], t30], [[380, 150], -t30], [[380, 150], t30], [[300, 0], "v"], [[470, 0], "v"], [[130, 0], "v"]];
  var cLines = cDefs.map(function (d) {
    var p = d[0];
    if (d[1] === "v") return el("line", { x1: p[0], y1: 20, x2: p[0], y2: 620, pathLength: 1 }, construct);
    return el("line", { x1: 10, y1: p[1] + (10 - p[0]) * d[1], x2: 630, y2: p[1] + (630 - p[0]) * d[1], pathLength: 1 }, construct);
  });
  var vtx = [[120, 300], [300, 300 - 180 * t30], [300, 300 + 180 * t30], [470, 150 + 90 * t30], [470, 150 - 90 * t30], [130, 150 - 250 * t30], [130, 300 + 10 * t30]];
  var nodeEls = vtx.map(function (v) { return el("circle", { cx: v[0], cy: v[1], r: 3.2 }, nodes); });
  (function heroIntro() {
    if (RM || !hero.animate) return;
    gridLines.forEach(function (l, i) { l.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 100 + (i % 11) * 20, easing: "ease-out", fill: "backwards" }); });
    cLines.forEach(function (l, i) { l.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 700, delay: 250 + i * 45, easing: "cubic-bezier(.65,0,.35,1)", fill: "backwards" }); });
    nodeEls.forEach(function (n, i) {
      n.style.transformBox = "fill-box"; n.style.transformOrigin = "center";
      n.animate([{ opacity: 0, transform: "scale(0)" }, { opacity: 1, transform: "scale(1)" }], { duration: 350, delay: 500 + i * 40, easing: EASE, fill: "backwards" });
    });
  })();

  /* ---------- Reveal (einmalig, kurz) ---------- */
  var reveals = $$(".reveal");
  reveals.forEach(function (r) {
    var sibs = Array.prototype.filter.call(r.parentElement.children, function (c) { return c.classList.contains("reveal"); });
    var i = sibs.indexOf(r);
    if (i > 0) r.style.setProperty("--d", Math.min(i * 0.05, 0.25) + "s");
  });
  if ("IntersectionObserver" in window && !RM) {
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); rObs.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -4% 0px", threshold: 0.05 });
    reveals.forEach(function (r) { rObs.observe(r); });
  } else reveals.forEach(function (r) { r.classList.add("is-in"); });

  /* ---------- Lesefortschritt (Fallback ohne scroll-driven animations) ---------- */
  var hasScrollTL = window.CSS && CSS.supports && CSS.supports("animation-timeline: scroll()");
  function renderProgress() {
    if (hasScrollTL) return;
    var max = doc.scrollHeight - window.innerHeight;
    $(".progress").style.setProperty("--sp", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScrollHeader(); renderProgress(); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScrollHeader(); renderProgress();

  /* ---------- Höhenlinien (Marching Squares über ein Hügelfeld) ----------
   * Künstlerische Interpretation des Dreiländerecks – keine Geografie. */
  function makeField(w, h, hills, river) {
    return function (x, y) {
      var v = 0, i;
      for (i = 0; i < hills.length; i++) {
        var hl = hills[i], dx = (x - hl[0]) / hl[2], dy = (y - hl[1]) / hl[3];
        v += hl[4] * Math.exp(-(dx * dx + dy * dy));
      }
      if (river) {
        var best = 1e9;
        for (i = 0; i < river.length; i++) { var rx = x - river[i][0], ry = y - river[i][1], d = rx * rx + ry * ry; if (d < best) best = d; }
        v -= 0.75 * Math.exp(-best / (2 * 38 * 38));
      }
      return v;
    };
  }
  function contours(g, w, h, field, levels, cell) {
    var nx = Math.ceil(w / cell) + 1, ny = Math.ceil(h / cell) + 1, grid = [], i, j;
    for (j = 0; j < ny; j++) { grid[j] = []; for (i = 0; i < nx; i++) grid[j][i] = field(i * cell, j * cell); }
    var lerp = function (a, b, va, vb, lv) { return a + (b - a) * ((lv - va) / (vb - va || 1e-9)); };
    levels.forEach(function (lv, li) {
      var d = "";
      for (j = 0; j < ny - 1; j++) for (i = 0; i < nx - 1; i++) {
        var x0 = i * cell, y0 = j * cell, x1 = x0 + cell, y1 = y0 + cell;
        var a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], e = grid[j + 1][i];
        var idx = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (e > lv ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        var top = [lerp(x0, x1, a, b, lv), y0], right = [x1, lerp(y0, y1, b, c, lv)], bottom = [lerp(x0, x1, e, c, lv), y1], left = [x0, lerp(y0, y1, a, e, lv)];
        var segs = {
          1: [left, bottom], 2: [bottom, right], 3: [left, right], 4: [top, right], 5: [top, left, bottom, right], 6: [top, bottom], 7: [top, left],
          8: [top, left], 9: [top, bottom], 10: [top, right, bottom, left], 11: [top, right], 12: [left, right], 13: [bottom, right], 14: [left, bottom]
        }[idx];
        for (var s = 0; s < segs.length; s += 2) d += "M" + segs[s][0].toFixed(1) + " " + segs[s][1].toFixed(1) + "L" + segs[s + 1][0].toFixed(1) + " " + segs[s + 1][1].toFixed(1);
      }
      if (d) el("path", { d: d, "class": li % 4 === 0 ? "ct ct--major" : "ct" }, g);
    });
  }
  function riverPoints(path, n) {
    var tmp = el("path", { d: path }), L = tmp.getTotalLength(), pts = [];
    for (var i = 0; i <= n; i++) { var p = tmp.getPointAtLength(L * i / n); pts.push([p.x, p.y]); }
    return pts;
  }
  var RHEIN = "M560 322 C 500 318, 440 300, 384 292 C 330 284, 290 300, 258 276 C 232 254, 246 200, 240 150 C 234 100, 244 50, 230 0";

  /* Region: Terrain mit Rhein */
  var terrain = $(".terrain");
  if (terrain) {
    var rg = $(".terrain__rhein", terrain);
    var rp = riverPoints(RHEIN, 60);
    var hillsR = [[110, 120, 120, 90, 1], [470, 110, 110, 95, 1.1], [140, 380, 150, 80, .9], [430, 400, 130, 70, 1], [330, 230, 60, 50, .55], [60, 250, 70, 60, .5]];
    contours($(".terrain__contours", terrain), 560, 460, makeField(560, 460, hillsR, rp), [-.2, -.08, .04, .16, .28, .4, .52, .64, .76, .88, 1], 7);
    el("path", { d: RHEIN, "class": "rhein-bank" }, rg);
    el("path", { d: RHEIN, "class": "rhein", pathLength: 1 }, rg);
  }
  /* Versprechen: ruhige Höhenlinien als Hintergrund, Textbereich frei */
  var cbg = $(".contour-bg");
  if (cbg) {
    var hillsB = [[1010, 150, 220, 160, 1], [880, 470, 180, 120, .8], [1130, 420, 120, 110, .7]];
    contours(cbg, 1200, 600, makeField(1200, 600, hillsB, null), [.1, .2, .3, .4, .5, .6, .7, .8, .9], 10);
  }

  /* ---------- Rechnen ---------- */
  var RATE_EFF = 0.089; /* Platzhalter, als Beispiel markiert */
  function fmtInt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "'"); }
  function chf(n) { return "CHF " + fmtInt(n) + ".–"; }
  function chf2(n) {
    var v = Math.round(n * 100) / 100, int = Math.floor(v), dec = Math.round((v - int) * 100);
    if (dec === 100) { int += 1; dec = 0; }
    return "CHF " + fmtInt(int) + "." + (dec < 10 ? "0" : "") + dec;
  }
  /* Annuität: effektiver Jahreszins → Monatszins; Rate auf Rappen gerundet,
   * Gesamtrückzahlung = Rate × Laufzeit, Zinskosten = Gesamt − Betrag (konsistent). */
  function annuity(P, n) {
    var im = Math.pow(1 + RATE_EFF, 1 / 12) - 1;
    var rate = Math.round(P * im / (1 - Math.pow(1 + im, -n)) * 100) / 100;
    var total = Math.round(rate * n * 100) / 100;
    return { rate: rate, total: total, zins: Math.round((total - P) * 100) / 100 };
  }
  window.__dfAnnuity = annuity; /* für Prüfskript */

  function tween(node, to, fmt) {
    if (node._cur === undefined || RM) { node._cur = to; node.textContent = fmt(to); return; }
    cancelAnimationFrame(node._raf);
    var fromV = node._cur, t0 = performance.now(), d = 380;
    var step = function (t) {
      var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 4);
      node._cur = fromV + (to - fromV) * e;
      node.textContent = fmt(node._cur);
      if (k < 1) node._raf = requestAnimationFrame(step);
    };
    node._raf = requestAnimationFrame(step);
  }
  function setFill(r) { r.style.setProperty("--fill", ((r.value - r.min) / (r.max - r.min) * 100).toFixed(2) + "%"); }

  /* ---------- Kreditrechner (Hero) ---------- */
  var inBetrag = $("#in-betrag"), outBetrag = $("#out-betrag");
  var R = { rate: $("#r-rate"), zins: $("#r-zins"), total: $("#r-total") };
  var live = $("#calc-live"), liveTimer = 0;
  var lzInputs = $$('input[name="laufzeit"]');
  function laufzeit() { var c = $('input[name="laufzeit"]:checked'); return c ? +c.value : 36; }
  function computeHero(fromSync) {
    var P = +inBetrag.value, n = laufzeit();
    setFill(inBetrag);
    outBetrag.textContent = chf(P);
    var a = annuity(P, n);
    tween(R.rate, a.rate, chf2);
    tween(R.zins, a.zins, chf2);
    tween(R.total, a.total, chf2);
    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () { live.textContent = "Monatliche Rate " + chf2(a.rate) + ", Zinskosten " + chf2(a.zins) + ", Gesamtrückzahlung " + chf2(a.total) + "."; }, 600);
    if (!fromSync) syncToBc(P, n);
  }
  inBetrag.addEventListener("input", function () { computeHero(false); });
  lzInputs.forEach(function (r) { r.addEventListener("change", function () { computeHero(false); }); });

  /* ---------- Budgetcheck (geführt, 3 Schritte) ---------- */
  var bcForm = $("#bc-form");
  var bcSteps = $$(".bc__step", bcForm), bcTabs = $$(".bc__tab", bcForm);
  var bcBetrag = $("#bc-betrag"), bcOutBetrag = $("#bc-out-betrag"), bcLz = $("#bc-lz"), bcRate = $("#bc-rate");
  var bcInk = $("#bc-ink"), bcAus = $("#bc-aus"), bcRes = $("#bc-res"), bcErr = $("#bc-err");
  var bcResult = $("#bc-result"), bcStatus = $("#bc-status"), bcFrei = $("#bc-frei"), bcDesc = $("#bc-desc"), bcRate2 = $("#bc-rate2"), bcLive = $("#bc-live");
  var BC_TEXT = {
    ok: ["Rechnerischer Spielraum", "Nach Ausgaben, Reserve und Rate bleibt Ihnen rechnerisch Luft. Im Gespräch prüfen wir, ob das auch in einem schwierigen Monat gilt."],
    warn: ["Wenig Spielraum", "Die Rate passt rechnerisch, aber knapp. Oft hilft ein kleinerer Betrag oder eine längere Laufzeit – das besprechen wir gemeinsam."],
    bad: ["Zu wenig Spielraum", "Nach Ausgaben und Reserve bleibt für diese Rate nicht genug übrig. Ein kleinerer Betrag oder ein anderer Weg passt hier besser."]
  };
  var bcState = null, bcLiveTimer = 0, syncing = false;
  function syncToBc(P, n) {
    if (syncing) return; syncing = true;
    bcBetrag.value = P; bcLz.value = String(n);
    computeBc(true); syncing = false;
  }
  function syncToHero(P, n) {
    if (syncing) return; syncing = true;
    inBetrag.value = P;
    lzInputs.forEach(function (r) { r.checked = +r.value === n; });
    computeHero(true); syncing = false;
  }
  function num(inp) { var v = parseFloat(inp.value); return isFinite(v) && v >= 0 ? v : NaN; }
  function computeBc(fromSync) {
    var P = +bcBetrag.value, n = +bcLz.value;
    setFill(bcBetrag);
    bcOutBetrag.textContent = chf(P);
    var a = annuity(P, n);
    bcRate.textContent = chf2(a.rate);
    bcRate2.textContent = chf2(a.rate);
    var inc = num(bcInk), aus = num(bcAus), res = num(bcRes);
    if (isNaN(inc) || isNaN(aus) || isNaN(res)) { if (!fromSync) syncToHero(P, n); return a; }
    var frei = inc - aus - res - a.rate;
    var st = frei < 0 ? "bad" : frei < inc * 0.10 ? "warn" : "ok";
    tween(bcFrei, frei, function (v) { return (v < 0 ? "− " : "") + chf(Math.abs(v)); });
    var base = Math.max(inc, aus + res + a.rate);
    $(".budget__fix", bcForm).style.setProperty("--w", (aus / base * 100).toFixed(2) + "%");
    $(".budget__res", bcForm).style.setProperty("--w", (res / base * 100).toFixed(2) + "%");
    $(".budget__rate", bcForm).style.setProperty("--w", (a.rate / base * 100).toFixed(2) + "%");
    $(".budget__rest", bcForm).style.setProperty("--w", (Math.max(frei, 0) / base * 100).toFixed(2) + "%");
    if (st !== bcState) {
      bcState = st;
      bcResult.setAttribute("data-state", st);
      bcStatus.textContent = BC_TEXT[st][0];
      bcDesc.textContent = BC_TEXT[st][1];
      $("small", bcFrei.parentElement).textContent = frei < 0 ? "fehlen pro Monat" : "bleiben pro Monat";
    } else $("small", bcFrei.parentElement).textContent = frei < 0 ? "fehlen pro Monat" : "bleiben pro Monat";
    clearTimeout(bcLiveTimer);
    bcLiveTimer = setTimeout(function () { bcLive.textContent = "Erste Einschätzung: " + BC_TEXT[st][0] + ". " + (frei < 0 ? "Es fehlen " : "Es bleiben ") + chf(Math.abs(frei)) + " pro Monat."; }, 600);
    if (!fromSync) syncToHero(P, n);
    return a;
  }
  window.__dfBudget = function () { return { frei: bcFrei.textContent, state: bcResult.getAttribute("data-state") }; };
  function bcValidate() {
    var bad = [];
    [[bcInk, "Nettoeinkommen"], [bcAus, "Ausgaben"], [bcRes, "Reserve"]].forEach(function (f) {
      var ok = !isNaN(num(f[0]));
      f[0].setAttribute("aria-invalid", String(!ok));
      if (!ok) bad.push(f[1]);
    });
    bcErr.textContent = bad.length ? "Bitte als Zahl angeben: " + bad.join(", ") + "." : "";
    return !bad.length;
  }
  function bcGo(i, focus) {
    if (i === 2 && !bcValidate()) { $('[aria-invalid="true"]', bcForm).focus(); return; }
    if (i === 2) computeBc(true);
    bcSteps.forEach(function (s, k) { s.hidden = k !== i; });
    bcTabs.forEach(function (t, k) {
      if (k === i) t.setAttribute("aria-current", "step"); else t.removeAttribute("aria-current");
      t.classList.toggle("is-done", k < i);
    });
    bcForm.setAttribute("data-step", String(i));
    if (focus) { var h = $("h3", bcSteps[i]); if (h) h.focus({ preventScroll: false }); }
  }
  $$("[data-go]", bcForm).forEach(function (b) { b.addEventListener("click", function () { bcGo(+b.getAttribute("data-go"), true); }); });
  bcForm.addEventListener("submit", function (e) { e.preventDefault(); var cur = +bcForm.getAttribute("data-step") || 0; if (cur < 2) bcGo(cur + 1, true); });
  [bcBetrag, bcLz, bcInk, bcAus, bcRes].forEach(function (i) { i.addEventListener("input", function () { computeBc(false); }); });
  bcLz.addEventListener("change", function () { computeBc(false); });
  bcGo(0, false);

  /* Navigation «Budgetcheck» öffnet den Check bei Schritt 1 */
  $$('a[href="#budgetcheck"]').forEach(function (a) { a.addEventListener("click", function () { bcGo(0, false); }); });

  computeHero(true);
  computeBc(true);
  if ("IntersectionObserver" in window && !RM) {
    [R.rate, R.zins, R.total].forEach(function (n) { n._cur = 0; });
    var cObs = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { cObs.disconnect(); computeHero(true); } }, { threshold: 0.5 });
    R.rate.textContent = chf2(0);
    cObs.observe($(".calc__rate"));
  }

  /* ---------- Kontaktformular (Demo) ---------- */
  var form = $("#contact-form"), msg = $("#form-msg");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = [];
    [["#f-name", "Name"], ["#f-mail", "E-Mail"]].forEach(function (f) {
      var n = $(f[0]); var ok = n.checkValidity();
      n.parentElement.classList.toggle("is-invalid", !ok);
      n.setAttribute("aria-invalid", String(!ok));
      if (!ok) bad.push(f[1]);
    });
    var cb = $("#f-ok");
    cb.closest(".check").classList.toggle("is-invalid", !cb.checked);
    cb.setAttribute("aria-invalid", String(!cb.checked));
    if (!cb.checked) bad.push("Einverständnis");
    if (bad.length) {
      msg.className = "form__msg is-error";
      msg.textContent = "Bitte prüfen Sie: " + bad.join(", ") + ".";
      var first = form.querySelector('[aria-invalid="true"]'); if (first) first.focus();
      return;
    }
    msg.className = "form__msg";
    msg.textContent = "Danke! Dies ist eine Demo – es wurden keine Daten gesendet.";
    form.reset();
  });

  if (mq.addEventListener) mq.addEventListener("change", function () { location.reload(); });
})();
