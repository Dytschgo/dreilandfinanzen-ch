/* Dreiland Finanzen – «Die rote Linie»
   Klassisches Script (kein Modul), damit die Seite auch per file:// läuft. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Zahlen im Schweizer Format ---------- */
  function group(intStr) { return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, "'"); }
  function chf(n, cents) {
    var neg = n < 0; n = Math.abs(n);
    if (cents) {
      var s = n.toFixed(2).split('.');
      return (neg ? '– ' : '') + 'CHF ' + group(s[0]) + '.' + s[1];
    }
    return (neg ? '– ' : '') + 'CHF ' + group(String(Math.round(n))) + '.–';
  }

  /* ---------- Navigation (mobil) ---------- */
  var toggle = document.querySelector('.top__toggle');
  var nav = document.getElementById('hauptnav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); toggle.focus();
      }
    });
  }

  /* ---------- Budgetcheck (inkl. Kreditrechner im Hero) ---------- */
  var EFF_ZINS = 0.089;          // Beispielwert, klar gekennzeichnet
  var GRENZE = 0.40;             // rote Linie: Rate max. 40 % des freien Budgets (Beispielregel)
  var KOMFORT = 0.25;            // darunter: gut tragbar

  // Kreditbetrag und Laufzeit gibt es zweimal (Hero und Budgetcheck). Alle Regler und
  // Zahlenfelder einer Grösse bleiben synchron.
  var KEYS = ['betrag', 'laufzeit', 'einkommen', 'fixkosten'];
  var fields = {};
  KEYS.forEach(function (k) { fields[k] = { ranges: [], nums: [] }; });
  ['', 'h-'].forEach(function (prefix) {
    KEYS.forEach(function (k) {
      var r = document.getElementById(prefix + k);
      var n = document.getElementById(prefix + k + '-num');
      if (r) fields[k].ranges.push(r);
      if (n) fields[k].nums.push(n);
    });
  });

  function paintRange(r) {
    var p = (r.value - r.min) / (r.max - r.min) * 100;
    r.style.setProperty('--p', p + '%');
  }
  function val(k) { return Number(fields[k].ranges[0].value); }
  function parseNum(v) { return Number(String(v).replace(/[^\d]/g, '')); }

  // Setzt den Wert in allen Reglern und Zahlenfeldern der Gruppe. skip = Feld, das gerade getippt wird.
  function setAll(k, v, skip) {
    var g = fields[k];
    g.ranges.forEach(function (r) { r.value = v; paintRange(r); });
    var snapped = val(k); // Regler rasten auf die Schrittweite ein
    g.nums.forEach(function (n) { if (n !== skip) n.value = group(String(snapped)); });
  }

  function annuity(P, n) {
    var i = Math.pow(1 + EFF_ZINS, 1 / 12) - 1;
    return P * i / (1 - Math.pow(1 + i, -n));
  }
  function maxAmount(rate, n) {
    var i = Math.pow(1 + EFF_ZINS, 1 / 12) - 1;
    return rate * (1 - Math.pow(1 + i, -n)) / i;
  }

  var out = {
    rate: document.getElementById('o-rate'),
    hRate: document.getElementById('h-rate'),
    zins: document.getElementById('o-zins'),
    total: document.getElementById('o-total'),
    frei: document.getElementById('o-frei'),
    anteil: document.getElementById('o-anteil'),
    status: document.getElementById('o-status'),
    text: document.getElementById('o-text'),
    ampel: document.getElementById('ampel'),
    fix: document.getElementById('seg-fix'),
    segRate: document.getElementById('seg-rate'),
    rest: document.getElementById('seg-rest'),
    limit: document.getElementById('seg-limit')
  };
  var lastSummary = '';
  var statusTimer = null;

  function calc(now) {
    if (!out.rate) return;
    var P = val('betrag'), n = val('laufzeit'), inc = val('einkommen'), fix = val('fixkosten');
    var rate = annuity(P, n);
    var total = rate * n;
    var frei = inc - fix;
    var ratio = frei > 0 ? rate / frei : Infinity;
    var sugg = frei > 0 ? Math.floor(maxAmount(frei * KOMFORT, n) / 500) * 500 : 0;
    sugg = Math.min(sugg, 80000);

    if (out.hRate) out.hRate.textContent = chf(rate, true);
    out.rate.textContent = chf(rate, true);
    out.zins.textContent = chf(total - P, true);
    out.total.textContent = chf(total, true);
    out.frei.textContent = chf(frei, false);
    out.anteil.textContent = isFinite(ratio) ? Math.round(ratio * 100) + ' %' : '–';

    var state, title, text, rest = frei - rate;
    if (frei <= 0) {
      state = 'no';
      title = 'Zu hoch – hier raten wir ab.';
      text = 'Die Fixkosten decken Ihr ganzes Einkommen. Wir suchen gemeinsam andere Wege.';
    } else if (ratio <= KOMFORT) {
      state = 'ok';
      title = 'Tragbar – nach dieser Orientierung.';
      text = 'Die Rate beansprucht ' + Math.round(ratio * 100) + ' % des freien Budgets. Es bleiben <strong>' + chf(rest, false) + '</strong> pro Monat.';
    } else if (ratio <= GRENZE) {
      state = 'tight';
      title = 'Knapp – schauen wir genauer hin.';
      text = 'Entspannter wäre bis etwa <strong>' + chf(sugg, false) + '</strong> bei gleicher Laufzeit.';
    } else {
      state = 'no';
      title = 'Zu hoch – hier raten wir ab.';
      text = sugg >= 1000
        ? 'Tragbar wäre eher bis etwa <strong>' + chf(sugg, false) + '</strong> – oder gar kein Kredit.'
        : 'In dieser Lage raten wir von einem Kredit ab.';
    }

    out.ampel.setAttribute('data-state', state);
    // Live-Region nur verzögert aktualisieren, damit Screenreader beim Schieben nicht überflutet werden
    clearTimeout(statusTimer);
    var apply = function () { out.status.textContent = title; out.text.innerHTML = text; };
    if (now) apply(); else statusTimer = setTimeout(apply, 350);

    // Balken: Breite = Einkommen
    var base = Math.max(inc, 1);
    var fixW = Math.min(fix, base) / base * 100;
    var rateW = Math.min(rate, Math.max(frei, 0)) / base * 100;
    var restW = Math.max(0, 100 - fixW - rateW);
    out.fix.style.width = fixW + '%';
    out.segRate.style.width = rateW + '%';
    out.rest.style.width = restW + '%';
    var lim = frei > 0 ? (fix + frei * GRENZE) / base * 100 : 100;
    out.limit.style.left = Math.min(lim, 100) + '%';

    lastSummary =
      'Mein Budgetcheck (Beispielrechnung): ' + chf(P, false) + ' über ' + n + ' Monate, ' +
      'Monatsrate ca. ' + chf(rate, true) + ', Nettoeinkommen ' + chf(inc, false) +
      ', Fixkosten ' + chf(fix, false) + '. Ergebnis: ' + title;
  }

  KEYS.forEach(function (k) {
    var g = fields[k];
    if (!g.ranges.length) return;
    var min = Number(g.ranges[0].min), max = Number(g.ranges[0].max);
    g.ranges.forEach(function (r) {
      paintRange(r);
      r.addEventListener('input', function () { setAll(k, Number(r.value), null); calc(); });
    });
    g.nums.forEach(function (n) {
      n.addEventListener('input', function () {
        if (!/\d/.test(n.value)) return;
        var v = parseNum(n.value);
        if (v >= min && v <= max) { setAll(k, v, n); calc(); }
      });
      n.addEventListener('change', function () {
        var v = parseNum(n.value);
        if (!/\d/.test(n.value)) v = val(k);
        v = Math.min(max, Math.max(min, v));
        setAll(k, v, null); calc();
      });
    });
  });
  calc(true);

  var take = document.getElementById('mitnehmen');
  var msg = document.getElementById('k-msg');
  if (take && msg) {
    take.addEventListener('click', function () {
      msg.value = lastSummary;
      setTimeout(function () { var n = document.getElementById('k-name'); if (n) n.focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
    });
  }

  /* ---------- Kontaktformular (Demo) ----------
     Das Formular hat novalidate: Die Browser-Pflichtfeldprüfung würde sonst vor dem submit-Ereignis
     greifen und weder unsere Fehlermeldung noch die Bestätigung zeigen. Geprüft wird hier. */
  var form = document.getElementById('kontaktform');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var st = document.getElementById('form-status');
      var name = document.getElementById('k-name');
      var kontakt = document.getElementById('k-mail');
      if (!name.value.trim() || !kontakt.value.trim()) {
        st.textContent = 'Bitte geben Sie Ihren Namen und eine E-Mail-Adresse oder Telefonnummer an.';
        (name.value.trim() ? kontakt : name).focus();
        return;
      }
      st.textContent = 'Danke, ' + name.value.trim() + '. Dies ist ein Demo-Formular – es wurden keine Daten übertragen.';
    });
  }

  /* ---------- Einblenden ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    var targets = document.querySelectorAll('.vows li, .nein__lead, .tile, .route__stop, .region__map, .faq details, .contact__form, .calc__out, .h2, .calc__head h2');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(targets, function (t, i) {
      t.classList.add('rv');
      t.style.transitionDelay = ((i % 3) * 80) + 'ms';
      io.observe(t);
    });
  }

  /* ---------- Die rote Linie ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  var svg, ghost, path, tip, markers = [], segs = [], totalLen = 0, drawn = 0, target = 0, raf = 0, maxTy = 0;

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function setupLine() {
    svg = el('svg', { 'class': 'redline', 'aria-hidden': 'true', focusable: 'false' });
    ghost = el('path', { 'class': 'redline__ghost' });
    path = el('path', { 'class': 'redline__path' });
    tip = el('polygon', { 'class': 'redline__tip', points: '0,-6 10,0 0,6 -10,0' });
    svg.appendChild(ghost); svg.appendChild(path); svg.appendChild(tip);
    document.body.insertBefore(svg, document.body.firstChild);
  }

  function buildLine() {
    var de = document.documentElement;
    svg.setAttribute('height', 0);
    var docW = de.clientWidth;
    var docH = Math.max(document.body.scrollHeight, de.scrollHeight);
    var ref = document.querySelector('.hero .wrap') || document.querySelector('.wrap');
    var rr = ref.getBoundingClientRect();
    var railL = Math.round(rr.left - Math.min(44, rr.left * 0.5));
    var railR = Math.round(rr.right + Math.min(44, (docW - rr.right) * 0.5));
    var narrow = docW < 900;

    var anchors = document.querySelectorAll('.anchor');
    var pts = [];
    Array.prototype.forEach.call(anchors, function (a) {
      if (a.getAttribute('data-only') === 'narrow' && !narrow) return;
      var r = docOffset(a); // ohne CSS-Transforms (Einblend-Animationen verschieben sonst die Anker)
      var x, y = r.top, mode = a.getAttribute('data-x');
      if (mode === 'R') x = railR;
      else if (mode === 'self' && !narrow) x = r.left;
      else x = railL;
      if (a.getAttribute('data-y') === 'prev' && !narrow && pts.length) y = pts[pts.length - 1].y;
      if (pts.length && y < pts[pts.length - 1].y) y = pts[pts.length - 1].y;
      pts.push({ x: Math.round(x), y: Math.round(y), marker: a.getAttribute('data-marker'), el: a });
    });
    if (pts.length < 2) return;

    // Segmente: senkrecht, dann im 30°-Winkel (Kante der Bildmarke) – oder waagrecht über die Grenze
    segs = [];
    var t30 = Math.tan(Math.PI / 6);
    function push(x1, y1, x2, y2) {
      var len = Math.hypot(x2 - x1, y2 - y1);
      if (len < 0.5) return;
      segs.push({ x1: x1, y1: y1, x2: x2, y2: y2, len: len });
    }
    for (var i = 1; i < pts.length; i++) {
      var A = pts[i - 1], B = pts[i];
      var dx = B.x - A.x, dy = B.y - A.y, adx = Math.abs(dx);
      if (adx < 1) { push(A.x, A.y, A.x, B.y); continue; }
      if (dy < 1) { push(A.x, A.y, B.x, A.y); continue; }
      var need = adx * t30;
      if (dy >= need) { push(A.x, A.y, A.x, B.y - need); push(A.x, B.y - need, B.x, B.y); }
      else { var mx = A.x + Math.sign(dx) * dy / t30; push(A.x, A.y, mx, B.y); push(mx, B.y, B.x, B.y); }
    }
    var d = '', acc = 0;
    segs.forEach(function (s, k) {
      s.start = acc; acc += s.len;
      d += (k === 0 ? 'M' + s.x1 + ' ' + s.y1 : '') + 'L' + s.x2 + ' ' + s.y2;
    });
    totalLen = acc;

    svg.setAttribute('width', docW);
    svg.setAttribute('height', docH);
    svg.setAttribute('viewBox', '0 0 ' + docW + ' ' + docH);
    ghost.setAttribute('d', d);
    path.setAttribute('d', d);
    path.style.strokeDasharray = totalLen + ' ' + (totalLen + 10);

    // Markierungen (Grenzsteine)
    markers.forEach(function (m) { m.node.remove(); });
    markers = [];
    pts.forEach(function (p) {
      if (p.marker === null) return;
      var end = p.marker === 'end';
      var w = end ? 14 : 10, h = w * t30 * 1.0;
      var poly = el('polygon', {
        'class': 'redline__mk',
        points: (p.x) + ',' + (p.y - h) + ' ' + (p.x + w) + ',' + p.y + ' ' + p.x + ',' + (p.y + h) + ' ' + (p.x - w) + ',' + p.y
      });
      svg.appendChild(poly);
      markers.push({ node: poly, at: lengthAtPoint(p) });
    });
    svg.appendChild(tip);
    target = targetFromScroll();
    if (reduceMotion) drawn = totalLen;
    else drawn = Math.min(drawn, target);
    render();
  }

  function docOffset(node) {
    var top = 0, left = 0;
    while (node) { top += node.offsetTop; left += node.offsetLeft; node = node.offsetParent; }
    return { top: top, left: left };
  }

  function lengthAtPoint(p) {
    var best = 0, bestD = Infinity;
    segs.forEach(function (s) {
      var ex = s.x2, ey = s.y2;
      var dd = Math.hypot(ex - p.x, ey - p.y);
      if (dd < bestD) { bestD = dd; best = s.start + s.len; }
      dd = Math.hypot(s.x1 - p.x, s.y1 - p.y);
      if (dd < bestD) { bestD = dd; best = s.start; }
    });
    return best;
  }

  function targetFromScroll() {
    // Einmal gezeichnet, bleibt die Linie stehen (sie zieht sich beim Hochscrollen nicht zurück)
    if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4) maxTy = Infinity;
    maxTy = Math.max(maxTy, window.pageYOffset + window.innerHeight * 0.62);
    var ty = maxTy;
    var L = 0;
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      if (s.y2 <= ty) { L = s.start + s.len; continue; }
      if (s.y1 < ty) { L = s.start + s.len * (ty - s.y1) / (s.y2 - s.y1); }
      break;
    }
    if (maxTy === Infinity) L = totalLen;
    return L;
  }

  function pointAt(L) {
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      if (L <= s.start + s.len || i === segs.length - 1) {
        var t = Math.max(0, Math.min(1, (L - s.start) / s.len));
        return { x: s.x1 + (s.x2 - s.x1) * t, y: s.y1 + (s.y2 - s.y1) * t };
      }
    }
    return { x: 0, y: 0 };
  }

  function render() {
    path.style.strokeDashoffset = String(totalLen - drawn);
    var p = pointAt(drawn);
    tip.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')');
    tip.style.opacity = drawn > 2 && drawn < totalLen - 2 ? '1' : '0';
    markers.forEach(function (m) { m.node.classList.toggle('is-on', drawn >= m.at - 1); });
  }

  function tick() {
    raf = 0;
    var diff = target - drawn;
    if (Math.abs(diff) < 0.5) { drawn = target; render(); return; }
    // Gleichmässig nachziehen; waagrechte Grenzübertritte werden so sichtbar gezeichnet
    drawn += Math.sign(diff) * Math.max(Math.min(Math.abs(diff) * 0.14, 90), 1.5);
    render();
    raf = requestAnimationFrame(tick);
  }

  function onScroll() {
    if (reduceMotion || !segs.length) return;
    target = targetFromScroll();
    if (!raf) raf = requestAnimationFrame(tick);
  }

  if (document.querySelector('.anchor') && document.createElementNS) {
    setupLine();
    var rebuildT;
    var rebuild = function () { clearTimeout(rebuildT); rebuildT = setTimeout(buildLine, 80); };
    buildLine();
    window.addEventListener('load', rebuild);
    window.addEventListener('resize', rebuild);
    window.addEventListener('scroll', onScroll, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
    if ('ResizeObserver' in window) {
      var lastH = 0;
      new ResizeObserver(function () {
        var h = document.body.scrollHeight;
        if (Math.abs(h - lastH) > 2) { lastH = h; rebuild(); }
      }).observe(document.body);
    }
    // Hero: Linie beim Laden sanft einzeichnen
    if (!reduceMotion) { drawn = 0; onScroll(); }
  }
})();
