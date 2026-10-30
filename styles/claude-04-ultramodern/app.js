/* Dreiland Finanzen – claude-04-ultramodern
 * Vanilla JS: Web Animations API, IntersectionObserver, scroll-gesteuerte SVG.
 * Keine externen Bibliotheken. */
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
  var SDA = window.CSS && CSS.supports && CSS.supports("animation-timeline: view()");
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
    a.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) { burger.click(); }
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { burger.click(); burger.focus(); }
  });

  /* Aktiver Navigationspunkt */
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

  /* ---------- Hero: Konstruktion des Zeichens ---------- */
  var hero = $(".hero-svg");
  var M = function (x, y) { return [320 + 4.6 * (x - 58.1), 330 + 4.6 * (y - 65.3)]; };
  var gridLines = isoGrid($(".hero-grid", hero), 640, 640, 4.6 * 18.75, M(20.6, 0)[0], M(0, 26.8)[1]);
  var construct = $(".hero-construct", hero);
  var nodes = $(".hero-nodes", hero);
  var t30 = Math.tan(Math.PI / 6);
  /* Konstruktionslinien: Verlängerungen der Kanten des Zeichens */
  var cLines = [
    [[40.4, 63.03], -t30], [[20.6, 51.6], t30], [[95.6, 26.2], -t30], [[43.3, 88.4], t30], [[43.3, 64.9], -t30],
    [[20.6, 0], "v"], [[95.6, 0], "v"], [[71, 0], "v"], [[43.3, 0], "v"]
  ].map(function (d, i) {
    var p = M(d[0][0], d[0][1]), a;
    if (d[1] === "v") a = el("line", { x1: p[0], y1: 40, x2: p[0], y2: 610, pathLength: 1 }, construct);
    else {
      var x1 = 20, x2 = 620, m;
      m = d[1];
      a = el("line", { x1: x1, y1: p[1] + (x1 - p[0]) * m, x2: x2, y2: p[1] + (x2 - p[0]) * m, pathLength: 1 }, construct);
    }
    return a;
  });
  var vtx = [[20.6, 26.8], [61.88, 50.63], [95.6, 26.2], [95.6, 52.6], [71, 104.39], [43.3, 88.4], [20.6, 51.6], [40.4, 63.03], [66.3, 69.52], [62.8, 53.64]];
  var nodeEls = vtx.map(function (v) { var p = M(v[0], v[1]); return el("circle", { cx: p[0], cy: p[1], r: 3.6 }, nodes); });
  var hFaces = { b: $(".hm--b", hero), g: $(".hm--g", hero), r: $(".hm--r", hero) };

  function heroIntro() {
    if (RM || !hero.animate) return;
    var t0 = 250;
    gridLines.forEach(function (l, i) {
      l.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: t0 + (i % 17) * 28, easing: "ease-out", fill: "backwards" });
    });
    cLines.forEach(function (l, i) {
      l.animate([{ strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, opacity: 1 }], { duration: 1300, delay: t0 + 250 + i * 70, easing: "cubic-bezier(.65,0,.35,1)", fill: "backwards" });
    });
    nodeEls.forEach(function (n, i) {
      n.animate([{ opacity: 0, transform: "scale(0)" }, { opacity: 1, transform: "scale(1)" }], { duration: 600, delay: t0 + 800 + i * 55, easing: EASE, fill: "backwards" });
      n.style.transformBox = "fill-box"; n.style.transformOrigin = "center";
    });
    var fk = function (x, y) { return [{ opacity: 0, transform: "translate(" + x + "px," + y + "px)" }, { opacity: 1, transform: "translate(0,0)" }]; };
    hFaces.b.animate(fk(-20.8, -12), { duration: 1400, delay: t0 + 1050, easing: EASE, fill: "backwards" });
    hFaces.g.animate(fk(20.8, -12), { duration: 1400, delay: t0 + 1200, easing: EASE, fill: "backwards" });
    hFaces.r.animate(fk(0, 24), { duration: 1400, delay: t0 + 1350, easing: EASE, fill: "backwards" });
    $$(".hero-annot > *", hero).forEach(function (a, i) {
      var kf = a.tagName === "path" ? [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }] : [{ opacity: 0 }, { opacity: 1 }];
      if (a.tagName === "path") a.style.strokeDasharray = "1";
      a.animate(kf, { duration: 900, delay: t0 + 1700 + i * 90, easing: EASE, fill: "backwards" });
    });
  }
  heroIntro();

  /* Dezente Tiefen-Parallaxe der drei Flächen (Pointer) */
  var heroStage = $(".hero__stage");
  if (!RM && window.matchMedia("(pointer: fine)").matches) {
    var target = { x: 0, y: 0 }, cur = { x: 0, y: 0 }, raf = 0;
    var depth = { b: 1.0, g: -0.8, r: 0.55 };
    var tick = function () {
      cur.x += (target.x - cur.x) * 0.08; cur.y += (target.y - cur.y) * 0.08;
      Object.keys(hFaces).forEach(function (k) { hFaces[k].style.translate = (cur.x * depth[k]).toFixed(3) + "px " + (cur.y * depth[k]).toFixed(3) + "px"; });
      construct.style.translate = (cur.x * -2).toFixed(2) + "px " + (cur.y * -2).toFixed(2) + "px";
      if (Math.abs(target.x - cur.x) > 0.01 || Math.abs(target.y - cur.y) > 0.01) raf = requestAnimationFrame(tick); else raf = 0;
    };
    document.querySelector(".hero").addEventListener("pointermove", function (e) {
      var r = heroStage.getBoundingClientRect();
      target.x = clamp((e.clientX - (r.left + r.width / 2)) / r.width, -1, 1) * 1.6;
      target.y = clamp((e.clientY - (r.top + r.height / 2)) / r.height, -1, 1) * 1.6;
      if (!raf) raf = requestAnimationFrame(tick);
    });
    document.querySelector(".hero").addEventListener("pointerleave", function () { target.x = 0; target.y = 0; if (!raf) raf = requestAnimationFrame(tick); });
  }

  /* ---------- Reveal (einmalig) ---------- */
  var reveals = $$(".reveal");
  /* Stagger innerhalb gemeinsamer Eltern */
  reveals.forEach(function (r) {
    var sibs = Array.prototype.filter.call(r.parentElement.children, function (c) { return c.classList.contains("reveal"); });
    var i = sibs.indexOf(r);
    if (i > 0) r.style.setProperty("--d", Math.min(i * 0.08, 0.5) + "s");
  });
  if ("IntersectionObserver" in window && !RM) {
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); rObs.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (r) { rObs.observe(r); });
  } else reveals.forEach(function (r) { r.classList.add("is-in"); });

  /* ---------- Ablauf: Flächen setzen sich beim Scrollen zusammen ---------- */
  var ablauf = $("#ablauf");
  var abSvg = $(".ablauf-svg");
  isoGrid($(".ab-grid", abSvg), 480, 480, 4 * 18.75, 240 + 4 * (20.6 - 58.1), 236 + 4 * (26.8 - 65.3));
  var faces = [$(".ab-face--b"), $(".ab-face--g"), $(".ab-face--r")];
  var ghosts = $$(".ab-ghosts polygon");
  var from = [[-30, -17.32], [30, -17.32], [0, 34.64]];
  var steps = $$(".step");
  var countN = $(".ab-count__n");
  var track = $(".steps__track span");
  var caption = $(".ab-caption");
  var faceAnims = faces.map(function (f, i) {
    if (!f.animate) return null;
    var a = f.animate([
      { transform: "translate(" + from[i][0] + "px," + from[i][1] + "px)", opacity: 0 },
      { transform: "translate(" + from[i][0] * 0.25 + "px," + from[i][1] * 0.25 + "px)", opacity: 1, offset: 0.55 },
      { transform: "translate(0,0)", opacity: 1 }
    ], { duration: 1000, fill: "both", easing: "linear" });
    a.pause();
    return a;
  });
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var lastStep = -1;
  function ablaufProgress() {
    if (RM) return 1;
    var r = ablauf.getBoundingClientRect(), vh = window.innerHeight;
    return clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
  }
  function renderAblauf() {
    var p = ablaufProgress();
    var ranges = [[0.04, 0.3], [0.34, 0.6], [0.64, 0.9]];
    faceAnims.forEach(function (a, i) {
      if (!a) return;
      var lp = clamp((p - ranges[i][0]) / (ranges[i][1] - ranges[i][0]), 0, 1);
      a.currentTime = easeOut(lp) * 1000;
      ghosts[i].style.opacity = (1 - clamp((lp - 0.7) / 0.3, 0, 1)).toFixed(3);
    });
    var s = p < 0.32 ? 0 : p < 0.62 ? 1 : 2;
    if (s !== lastStep) {
      steps.forEach(function (st, i) { st.classList.toggle("is-active", i === s); st.classList.toggle("is-done", i < s); });
      countN.textContent = "0" + (s + 1);
      lastStep = s;
    }
    track.style.setProperty("--p", clamp(p / 0.92, 0, 1).toFixed(4));
    caption.style.setProperty("--cap", clamp((p - 0.9) / 0.06, 0, 1).toFixed(3));
  }

  /* ---------- Fallback für CSS scroll-driven animations ---------- */
  var sdItems = [];
  if (!SDA && !RM) {
    doc.classList.add("no-sda");
    var cfg = [
      [".sd--a", "#versprechen", 0.12, 0.38], [".sd--b", "#versprechen", 0.38, 0.47], [".sd--c", "#versprechen", 0.46, 0.52],
      [".sd--rhein", "#region", 0.15, 0.5], [".sd--border", "#region", 0.3, 0.55]
    ];
    cfg.forEach(function (c) { var n = $(c[0]); if (n) sdItems.push({ n: n, s: $(c[1]), a: c[2], b: c[3] }); });
  }
  function renderSD() {
    var vh = window.innerHeight;
    sdItems.forEach(function (it) {
      var r = it.s.getBoundingClientRect();
      var cover = (vh - r.top) / (vh + r.height);
      it.n.style.setProperty("--sd", clamp((cover - it.a) / (it.b - it.a), 0, 1).toFixed(4));
    });
    if (!(window.CSS && CSS.supports && CSS.supports("animation-timeline: scroll()"))) {
      var max = doc.scrollHeight - vh;
      $(".progress").style.setProperty("--sp", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    }
  }

  /* ---------- Scroll-Loop ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScrollHeader(); renderAblauf(); renderSD(); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScrollHeader(); renderAblauf(); renderSD();

  /* ---------- Region: Raster ---------- */
  isoGrid($(".map-grid"), 560, 460, 40, 0, 0);

  /* ---------- Kreditrechner (im Hero) ---------- */
  var RATE_EFF = 0.089; /* Platzhalter */
  function fmtInt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "'"); }
  function chf(n) { return "CHF " + fmtInt(n) + ".–"; }
  function chf2(n) {
    var v = Math.round(n * 100) / 100, int = Math.floor(v), dec = Math.round((v - int) * 100);
    if (dec === 100) { int += 1; dec = 0; }
    return "CHF " + fmtInt(int) + "." + (dec < 10 ? "0" : "") + dec;
  }
  var inp = { betrag: $("#in-betrag"), einkommen: $("#in-einkommen"), fix: $("#in-fix") };
  var out = { betrag: $("#out-betrag"), einkommen: $("#out-einkommen"), fix: $("#out-fix") };
  var R = { rate: $("#r-rate"), zins: $("#r-zins"), total: $("#r-total"), frei: $("#r-frei"), quote: $("#r-quote"), status: $("#r-status"), desc: $("#r-desc") };
  var ampel = $("#ampel"), calc = $("#rechner"), live = $("#calc-live");
  var lzInputs = $$('input[name="laufzeit"]');
  var iconPath = $(".ampel__icon path");
  var ICONS = {
    ok: "M6.5 12.5 L10 16 L17.5 8 M17.5 8 L17.5 8",
    warn: "M12 5.5 L12 9.5 L12 13 M12 17.6 L12 17.7",
    bad: "M7 7 L12 12 L17 17 M17 7 L7 17"
  };
  var TEXT = {
    ok: ["Tragbar", "Die Rate lässt Ihnen voraussichtlich genügend Spielraum."],
    warn: ["Knapp", "Machbar, aber mit wenig Reserve. Prüfen wir gemeinsam einen kleineren Betrag oder eine längere Laufzeit."],
    bad: ["Zu hoch", "Diese Belastung wäre zu hoch. Hier würden wir Ihnen von diesem Kredit abraten."]
  };
  iconPath.setAttribute("d", ICONS.ok);

  function laufzeit() { var c = $('input[name="laufzeit"]:checked'); return c ? +c.value : 36; }

  function tween(node, to, fmt) {
    if (node._cur === undefined || RM) { node._cur = to; node.textContent = fmt(to); return; }
    cancelAnimationFrame(node._raf);
    var fromV = node._cur, t0 = performance.now(), d = 650;
    var step = function (t) {
      var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 4);
      node._cur = fromV + (to - fromV) * e;
      node.textContent = fmt(node._cur);
      if (k < 1) node._raf = requestAnimationFrame(step);
    };
    node._raf = requestAnimationFrame(step);
  }
  function setFill(r) { r.style.setProperty("--fill", ((r.value - r.min) / (r.max - r.min) * 100).toFixed(2) + "%"); }

  var state = null, liveTimer = 0;
  function compute() {
    var P = +inp.betrag.value, n = laufzeit(), inc = +inp.einkommen.value, fix = +inp.fix.value;
    Object.keys(inp).forEach(function (k) { setFill(inp[k]); });
    out.betrag.textContent = chf(P);
    out.einkommen.textContent = chf(inc);
    out.fix.textContent = chf(fix);
    var im = Math.pow(1 + RATE_EFF, 1 / 12) - 1;
    var rate = P * im / (1 - Math.pow(1 + im, -n));
    var total = rate * n, zins = total - P, frei = inc - fix;
    var q = frei > 0 ? rate / frei : Infinity;
    var st = q <= 0.25 ? "ok" : q <= 0.4 ? "warn" : "bad";
    tween(R.rate, rate, chf2);
    tween(R.zins, zins, chf2);
    tween(R.total, total, chf2);
    tween(R.frei, Math.max(frei, 0), chf);
    var qPct = isFinite(q) ? q * 100 : 999;
    tween(R.quote, Math.min(qPct, 999), function (v) { return v >= 999 ? "> 100 %" : Math.round(v) + " %"; });
    ampel.style.setProperty("--q", Math.min(qPct, 100).toFixed(2));
    /* Budget-Balken */
    var used = fix + rate, base = Math.max(inc, used);
    $(".budget__fix").style.setProperty("--w", (fix / base * 100).toFixed(2) + "%");
    $(".budget__rate").style.setProperty("--w", (rate / base * 100).toFixed(2) + "%");
    $(".budget__rest").style.setProperty("--w", (Math.max(inc - used, 0) / base * 100).toFixed(2) + "%");
    if (st !== state) {
      var prev = state; state = st;
      ampel.setAttribute("data-state", st);
      calc.setAttribute("data-state", st);
      R.status.textContent = TEXT[st][0];
      R.desc.textContent = TEXT[st][1];
      if (prev && !RM && iconPath.animate) {
        try {
          iconPath.animate([{ d: 'path("' + ICONS[prev] + '")' }, { d: 'path("' + ICONS[st] + '")' }], { duration: 520, easing: EASE });
        } catch (e) { /* Morph nicht unterstützt */ }
        R.status.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: EASE });
      }
      iconPath.setAttribute("d", ICONS[st]);
    }
    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () {
      live.textContent = "Monatliche Rate " + chf2(rate) + ". Tragbarkeit: " + TEXT[st][0] + ".";
    }, 700);
  }
  Object.keys(inp).forEach(function (k) { inp[k].addEventListener("input", compute); });
  lzInputs.forEach(function (r) { r.addEventListener("change", compute); });
  compute();
  /* Monatsrate beim ersten Sichtkontakt von 0 hochzählen */
  if ("IntersectionObserver" in window && !RM) {
    [R.rate, R.zins, R.total, R.frei, R.quote].forEach(function (n) { n._cur = 0; });
    var cObs = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { cObs.disconnect(); compute(); }
    }, { threshold: 0.5 });
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

  /* Reduzierte Bewegung live umschalten */
  if (mq.addEventListener) mq.addEventListener("change", function () { location.reload(); });
})();
