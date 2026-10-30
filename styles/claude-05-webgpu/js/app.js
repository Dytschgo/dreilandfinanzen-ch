/* Dreiland Finanzen – «Tragwerk»: Steuerung
 * Regie (Scroll → Formation/Kamera/Hintergrund), Maus, Budgetcheck, Renderer-Wahl, Render-Schleife. */
(function () {
  'use strict';
  var DF = window.DF;
  var root = document.documentElement;
  root.classList.remove('no-js');

  /* ================= Budgetcheck ================= */
  var RATE_EFF = 0.089; // Beispiel-Zinssatz (Platzhalter)
  var form = document.getElementById('budget');
  var calc = { ratio: 0.3, stress: 0, pulse: 0 };

  function chf(v, rappen) {
    var neg = v < 0; v = Math.abs(v);
    var s = rappen ? v.toFixed(2) : String(Math.round(v));
    var parts = s.split('.'), int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    return (neg ? '−' : '') + 'CHF ' + int + (rappen ? '.' + parts[1] : '.–');
  }
  function num(id) { var v = parseFloat(String(document.getElementById(id).value).replace(/['’\s]/g, '')); return isFinite(v) ? v : 0; }
  function setText(id, t) { var el = document.getElementById(id); if (el && el.textContent !== t) el.textContent = t; }

  function updateCalc(fromUser) {
    var P = num('betrag'), n = num('laufzeit'), inc = num('einkommen'), fix = num('fixkosten');
    var i = Math.pow(1 + RATE_EFF, 1 / 12) - 1;
    var rate = P * i / (1 - Math.pow(1 + i, -n));
    var total = rate * n, interest = total - P, free = inc - fix;
    var q = free > 0 ? rate / free : Infinity;
    setText('betrag-out', chf(P));
    setText('laufzeit-out', n + ' Monate');
    setText('r-rate', chf(rate, true));
    setText('r-zins', chf(interest, true));
    setText('r-total', chf(total, true));
    setText('r-frei', chf(free));
    setText('r-anteil', isFinite(q) ? Math.round(q * 100) + ' %' : '–');
    var level, label, text;
    if (!isFinite(q) || q > 0.6) {
      level = 'rot'; label = 'Nicht tragbar';
      text = free <= 0
        ? 'Die Fixkosten erreichen das Einkommen. Zuerst das Budget klären.'
        : 'Die Rate bindet mehr als 60 % der freien Mittel. Eher kleiner planen.';
    } else if (q > 0.35) {
      level = 'gelb'; label = 'Knapp';
      text = 'Machbar, aber mit wenig Reserve.';
    } else {
      level = 'gruen'; label = 'Tragbar';
      text = 'Die Rate lässt Reserve.';
    }
    var amp = document.getElementById('ampel');
    if (amp.dataset.level !== level) amp.dataset.level = level;
    setText('ampel-label', label);
    setText('ampel-text', text);
    var meter = document.getElementById('r-meter');
    meter.style.setProperty('--q', Math.min(1, isFinite(q) ? q : 1));
    calc.ratio = Math.min(1, isFinite(q) ? q : 1);
    calc.stress = level === 'rot' ? 1 : level === 'gelb' ? 0.5 : 0;
    if (fromUser) calc.pulse = 1;
    invalidate();
  }
  if (form) {
    form.addEventListener('input', function () { updateCalc(true); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    updateCalc(false);
  }
  // Range-Slider: Fortschritt als CSS-Variable (Füllung der Spur)
  Array.prototype.forEach.call(document.querySelectorAll('input[type=range]'), function (r) {
    function f() { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); }
    r.addEventListener('input', f); f();
  });

  // Kontaktformular: Demo ohne Versand
  var cform = document.getElementById('kontaktform');
  if (cform) cform.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = document.getElementById('kontakt-msg');
    msg.textContent = 'Danke. Dies ist eine Vorlage – es wird nichts versendet. Bitte vorerst Telefon oder E-Mail nutzen (Platzhalter).';
    msg.hidden = false; msg.focus();
  });

  /* ================= Bewegung: System + Nutzerwahl ================= */
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var userPaused = false;
  function isReduced() { return mq.matches || userPaused; }
  var motionBtn = document.getElementById('motion-toggle');
  function syncMotionUi() {
    root.classList.toggle('is-calm', isReduced());
    if (!motionBtn) return;
    motionBtn.setAttribute('aria-pressed', String(isReduced()));
    var lbl = mq.matches ? 'Szene ruhig (Systemeinstellung: reduzierte Bewegung)' : userPaused ? 'Szene wieder bewegen' : 'Szene anhalten';
    motionBtn.querySelector('span').textContent = lbl; motionBtn.title = lbl;
    motionBtn.disabled = mq.matches;
  }
  if (motionBtn) motionBtn.addEventListener('click', function () { userPaused = !userPaused; syncMotionUi(); kick(); });
  if (mq.addEventListener) mq.addEventListener('change', function () { syncMotionUi(); kick(); });

  /* ================= Regie ================= */
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-scene]'));
  function hex(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255]; }
  var cfg = sections.map(function (s) {
    var d = s.dataset;
    return {
      el: s, form: +d.scene, bg: hex(d.bg || '#031A3D'), intensity: d.intensity ? +d.intensity : 1,
      explode: +(d.explode || 0), pitch: +(d.pitch || 0.06), r: +(d.r || 1.6),
      slab: d.slab ? +d.slab : 1, lift: +(d.lift || 0),
      stage: s.querySelector('[data-stage]'), fx: +(d.fx || 0.5), fy: +(d.fy || 0.3), dist: +(d.dist || 10)
    };
  });
  var labels = Array.prototype.slice.call(document.querySelectorAll('[data-town]'));

  var FOV = 35 * Math.PI / 180, P11 = 1 / Math.tan(FOV / 2);
  var cur = null; // geglättete Werte
  var st = { formA: 0, formB: 0, blend: 1, active: 0 };
  var mouse = { x: 0, y: 0, nx: 0, ny: 0, sx: 0, sy: 0, active: 0, last: -1e9, isMouse: false };
  var lastVP = null, lastW = 1, lastH = 1;

  window.addEventListener('pointermove', function (e) {
    mouse.isMouse = e.pointerType === 'mouse';
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.nx = e.clientX / innerWidth * 2 - 1; mouse.ny = 1 - e.clientY / innerHeight * 2;
    if (mouse.isMouse) mouse.last = performance.now();
    if (isReduced()) return; kick();
  }, { passive: true });
  window.addEventListener('pointerleave', function () { mouse.last = -1e9; });

  function sectionTargets(W, H) {
    var vh = innerHeight, vw = innerWidth, center = vh * 0.5, active = 0;
    for (var i = 0; i < cfg.length; i++) {
      var r = cfg[i].el.getBoundingClientRect();
      if (r.top <= center) active = i;
    }
    var c = cfg[active], sx, sy, dist, rpx, gx, gy, ambient = false;
    if (c.stage && c.stage.offsetParent !== null) {
      var sr = c.stage.getBoundingClientRect();
      gx = sr.left + sr.width / 2; gy = sr.top + sr.height / 2;
      rpx = Math.max(60, Math.min(sr.width, sr.height) / 2);
      sx = gx / vw * 2 - 1; sy = 1 - gy / vh * 2;
      dist = c.r * P11 * vh / (2 * rpx);
    } else {
      // Ohne sichtbare Bühne: klein und gedämpft in die Ecke (Hochformat: weiter weg)
      var portrait = vw / vh < 0.9;
      sx = portrait ? 0.45 : c.fx; sy = portrait ? 0.6 : c.fy;
      dist = (c.stage ? 13 : c.dist) * (portrait ? Math.max(1, 0.95 / (vw / vh)) : 1);
      ambient = true;
      gx = (sx * 0.5 + 0.5) * vw; gy = (0.5 - sy * 0.5) * vh; rpx = c.r * P11 * vh / (2 * dist);
    }
    sy = Math.max(-1.6, Math.min(1.6, sy));
    dist = Math.max(4.5, Math.min(30, dist));
    // Hintergrund-Übergang an der Sektionsgrenze, die gerade durchs Bild läuft
    var bgA = c.bg, bgB = c.bg, wipe = 0;
    for (var k = 0; k < cfg.length - 1; k++) {
      var yb = cfg[k].el.getBoundingClientRect().bottom;
      if (yb > 0 && yb <= vh) { wipe = 1 - yb / vh; bgA = cfg[k].bg; bgB = cfg[k + 1].bg; break; }
    }
    if (!wipe) {
      for (var m = 0; m < cfg.length; m++) {
        var rr = cfg[m].el.getBoundingClientRect();
        if (rr.top <= 0 && rr.bottom > 0) { bgA = bgB = cfg[m].bg; break; }
      }
    }
    return { active: active, c: c, ambient: ambient, sx: sx, sy: sy, dist: dist, glow: [gx, gy, rpx * 2.2], bgA: bgA, bgB: bgB, wipe: wipe };
  }

  function lerp(a, b, k) { return a + (b - a) * k; }

  function frame(dt, time, W, H, dpr) {
    var reduced = isReduced();
    var T = sectionTargets(W, H);
    var c = T.c;
    if (T.active !== st.active || cur === null) {
      if (c.form !== st.formB) {
        if (st.blend < 0.5 && cur !== null) { /* Zwischenstand: von der aktuellen Hauptformation aus */ } else { st.formA = st.formB; }
        st.formB = c.form; st.blend = 0;
      }
      st.active = T.active;
    }
    st.blend = reduced ? 1 : Math.min(1, st.blend + dt / 1.7);
    if (st.blend >= 1) { st.formA = st.formB; }

    var mActive = (!reduced && mouse.isMouse && time * 1000 - (mouse.last - t0) < 2500) ? 1 : 0;
    if (cur === null) {
      cur = { sx: T.sx, sy: T.sy, dist: T.dist + 3, pitch: c.pitch, explode: c.explode, slab: c.slab, lift: c.lift, intensity: 0, ratio: calc.ratio, stress: calc.stress, mact: 0, gauge: 0 };
    }
    var gaugeW = (st.formB === 2 ? (st.blend) : 0) + (st.formA === 2 && st.formB === 2 ? 1 : 0);
    gaugeW = Math.min(1, gaugeW);
    var k1 = reduced ? 1 : 1 - Math.exp(-dt * 7), k2 = reduced ? 1 : 1 - Math.exp(-dt * 2.6), k3 = reduced ? 1 : 1 - Math.exp(-dt * 5);
    cur.sx = lerp(cur.sx, T.sx, k1); cur.sy = lerp(cur.sy, T.sy, k1);
    cur.dist = lerp(cur.dist, T.dist, k2); cur.pitch = lerp(cur.pitch, c.pitch, k2);
    cur.explode = lerp(cur.explode, c.explode, k2); cur.slab = lerp(cur.slab, c.slab, k2); cur.lift = lerp(cur.lift, c.lift, k2); cur.intensity = lerp(cur.intensity, c.intensity * (T.ambient ? 0.6 : 1), k2);
    cur.ratio = lerp(cur.ratio, calc.ratio, k3); cur.stress = lerp(cur.stress, calc.stress * gaugeW, k3);
    cur.mact = lerp(cur.mact, mActive, k3);
    if (!reduced) { mouse.sx = lerp(mouse.sx, mouse.isMouse ? mouse.nx : 0, k2); mouse.sy = lerp(mouse.sy, mouse.isMouse ? mouse.ny : 0, k2); }
    calc.pulse = reduced ? 0 : Math.max(0, calc.pulse - dt * 3);

    var aspect = W / H;
    var breathe = reduced ? 0 : Math.sin(time * 0.6) * 0.025;
    var yaw = reduced ? -0.22 : -0.22 + mouse.sx * 0.28 + Math.sin(time * 0.13) * 0.1;
    var pitch = cur.pitch + (reduced ? 0.04 : mouse.sy * -0.14 + Math.sin(time * 0.17) * 0.03);
    var eye = [Math.sin(yaw) * Math.cos(pitch) * cur.dist, Math.sin(pitch) * cur.dist, Math.cos(yaw) * Math.cos(pitch) * cur.dist];
    var view = DF.M.lookAt(eye, [0, 0, 0], [0, 1, 0]);
    var proj = DF.M.perspective(FOV, aspect, 0.1, 60);
    var shift = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, cur.sx, cur.sy, 0, 1]);
    var vp = DF.M.mul(shift, DF.M.mul(proj, view));
    lastVP = vp; lastW = W; lastH = H;

    // Maus auf Ebene z=0
    var mw = [99, 99];
    var inv = DF.M.invert(vp);
    if (inv) {
      var mx = mouse.x / innerWidth * 2 - 1, my = 1 - mouse.y / innerHeight * 2;
      var a = DF.M.xform(inv, mx, my, 0), b = DF.M.xform(inv, mx, my, 1);
      a = [a[0] / a[3], a[1] / a[3], a[2] / a[3]]; b = [b[0] / b[3], b[1] / b[3], b[2] / b[3]];
      var tz = a[2] / (a[2] - b[2]);
      if (isFinite(tz)) mw = [a[0] + (b[0] - a[0]) * tz, a[1] + (b[1] - a[1]) * tz];
    }
    var cs = W / innerWidth;
    var gl = T.glow;
    return {
      viewProj: vp, eye: eye, time: reduced ? 12 : time, dt: reduced ? 0 : dt, dpr: dpr, reduced: reduced,
      proj00: proj[0], proj11: proj[5],
      mousePx: [mouse.x * cs, mouse.y * cs], mouseWorld: mw, mouseActive: cur.mact,
      formA: st.formA, formB: st.formB, blend: st.blend,
      slabScale: cur.slab, slabLift: cur.lift,
      ratio: cur.ratio, stress: cur.stress, pulse: calc.pulse * gaugeW, explode: cur.explode + breathe,
      bgA: T.bgA, bgB: T.bgB, wipe: T.wipe,
      glow: [gl[0] * cs, gl[1] * cs, gl[2] * cs, cur.intensity], intensity: cur.intensity,
      settled: st.blend >= 1 && Math.abs(cur.sx - T.sx) < 0.002 && Math.abs(cur.sy - T.sy) < 0.002 && Math.abs(cur.dist - T.dist) < 0.01
    };
  }

  /* HTML-Beschriftungen, die 3D-Punkten (Orte am Rhein) folgen */
  function placeLabels(fr) {
    if (!labels.length || !lastVP) return;
    var show = st.formB === 3 && st.blend > 0.6;
    labels.forEach(function (el) {
      var t = DF.TOWNS[+el.dataset.town];
      var c = DF.M.xform(lastVP, t[0], t[1], t[2]);
      var x = (c[0] / c[3] * 0.5 + 0.5) * innerWidth, y = (0.5 - c[1] / c[3] * 0.5) * innerHeight;
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      el.classList.toggle('is-on', show && x > 40 && x < innerWidth - 40 && y > 60 && y < innerHeight - 20);
    });
  }

  /* ================= Renderer ================= */
  var canvas = document.getElementById('scene');
  var scene = null, running = false, rafId = 0, t0 = performance.now(), lastT = 0, dirty = true;
  var statusEl = document.getElementById('render-status');

  function setStatus(kind, extra) {
    root.dataset.renderer = kind;
    var txt = kind === 'webgpu' ? 'WebGPU – Echtzeit-Szene mit eigenen WGSL-Shadern' + (extra ? ' (' + extra + ')' : '')
      : kind === 'canvas2d' ? 'Canvas 2D – vereinfachte Szene (WebGPU nicht verfügbar)'
        : 'Statisch – ohne Canvas';
    if (statusEl) statusEl.textContent = txt;
    console.info('[Tragwerk] Renderer:', kind, extra || '');
  }

  function maxDpr(kind) { return Math.min(window.devicePixelRatio || 1, kind === 'webgpu' ? 1.5 : 1.25); }
  function resize() {
    if (!scene) return;
    var dpr = maxDpr(scene.kind), w = innerWidth, h = innerHeight;
    // Pixelbudget begrenzen (grosse Bildschirme)
    var budget = scene.kind === 'webgpu' ? 3.4e6 : 1.6e6;
    if (w * h * dpr * dpr > budget) dpr = Math.sqrt(budget / (w * h));
    var cw = Math.max(1, Math.round(w * dpr)), ch = Math.max(1, Math.round(h * dpr));
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    scene.dpr = dpr;
    invalidate();
  }
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', function () { invalidate(); }, { passive: true });

  function invalidate() { dirty = true; kick(); }
  function kick() {
    if (!scene || document.hidden) return;
    if (!running) { running = true; lastT = performance.now(); rafId = requestAnimationFrame(loop); }
  }
  function loop(now) {
    if (document.hidden || !scene) { running = false; return; }
    var dt = Math.min(1 / 30, Math.max(0, (now - lastT) / 1000)); lastT = now;
    var fr = frame(dt, (now - t0) / 1000, canvas.width, canvas.height, scene.dpr || 1);
    var reduced = fr.reduced;
    if (!reduced || dirty) {
      try { scene.render(fr); } catch (e) { console.error('[Tragwerk] Renderfehler:', e); fallback(String(e)); return; }
      placeLabels(fr);
      dirty = false;
    }
    // reduzierte Bewegung: nur rendern, solange sich etwas ändert
    if (reduced && fr.settled && !dirty) { running = false; return; }
    if (reduced) dirty = true;
    rafId = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(rafId); running = false; } else { kick(); }
  });

  function freshCanvas() {
    var c = canvas.cloneNode(false);
    canvas.parentNode.replaceChild(c, canvas);
    canvas = c;
  }

  var fellBack = false;
  function fallback(reason) {
    if (fellBack) return; fellBack = true;
    console.warn('[Tragwerk] Wechsel auf Canvas 2D:', reason);
    if (scene && scene.destroy) scene.destroy();
    scene = null; cancelAnimationFrame(rafId); running = false;
    freshCanvas();
    start2D();
  }
  function start2D() {
    try {
      scene = DF.create2DScene(canvas, { particles: innerWidth < 720 ? 360 : 700 });
      setStatus('canvas2d');
      resize(); kick();
    } catch (e) {
      console.warn('[Tragwerk] Auch Canvas 2D nicht verfügbar:', e);
      scene = null; canvas.hidden = true; setStatus('css');
    }
  }

  syncMotionUi();
  var forced = /[?&]renderer=2d\b/.test(location.search);
  if (!forced && navigator.gpu && DF.createWebGPUScene) {
    DF.createWebGPUScene(canvas, { particles: innerWidth < 720 ? 12288 : 24576, onLost: function (m) { fallback('WebGPU verloren: ' + m); } })
      .then(function (s) {
        scene = s;
        setStatus('webgpu', s.particles.toLocaleString('de-CH') + ' Partikel');
        resize(); kick();
      })
      .catch(function (e) {
        console.warn('[Tragwerk] WebGPU nicht nutzbar:', e && e.message ? e.message : e);
        freshCanvas(); start2D();
      });
  } else {
    if (!forced) console.info('[Tragwerk] navigator.gpu fehlt – Fallback.');
    start2D();
  }

  // Test-/Diagnose-Hook
  window.__tragwerk = function () { return { renderer: root.dataset.renderer, running: running, reduced: isReduced(), formA: st.formA, formB: st.formB, blend: st.blend }; };
})();
