/* Dreiland Finanzen – «Tragwerk»: Canvas-2D-Fallback (ohne navigator.gpu)
 * Gleiche Szene, gleiche Kamera, gleiche Formationen – vereinfacht:
 * Flächen per Maler-Algorithmus, wenige hundert Partikel auf der CPU. */
(function () {
  'use strict';
  var DF = (window.DF = window.DF || {});

  function rgb(c, k) {
    k = k === undefined ? 1 : k;
    return 'rgb(' + Math.round(Math.min(1, c[0] * k) * 255) + ',' + Math.round(Math.min(1, c[1] * k) * 255) + ',' + Math.round(Math.min(1, c[2] * k) * 255) + ')';
  }

  DF.create2DScene = function (canvas, opts) {
    var ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Kein 2D-Kontext');
    var N = opts.particles;
    var P = DF.initParticles(N);
    var faces = DF.slabFaces();
    var L = [-0.45, 0.6, 0.85], ll = Math.hypot(L[0], L[1], L[2]); L = L.map(function (v) { return v / ll; });
    var grid = null, gridKey = '';

    function buildGrid(w, h, dpr) {
      var key = w + 'x' + h;
      if (key === gridKey) return;
      gridKey = key;
      grid = document.createElement('canvas'); grid.width = w; grid.height = h;
      var g = grid.getContext('2d'), Ls = 54 * dpr, t30 = Math.tan(Math.PI / 6), wv = Ls * Math.cos(Math.PI / 6);
      g.strokeStyle = 'rgba(115,148,217,0.055)'; g.lineWidth = Math.max(1, dpr * 0.8);
      g.beginPath();
      for (var x = 0; x < w; x += wv) { g.moveTo(x, 0); g.lineTo(x, h); }
      var span = h + w * t30;
      for (var k = -w * t30; k < span; k += Ls) {
        g.moveTo(0, k); g.lineTo(w, k + w * t30);
        g.moveTo(0, k + w * t30); g.lineTo(w, k);
      }
      g.stroke();
    }

    function project(vp, W, H, x, y, z) {
      var c = DF.M.xform(vp, x, y, z);
      return [(c[0] / c[3] * 0.5 + 0.5) * W, (0.5 - c[1] / c[3] * 0.5) * H, c[3]];
    }

    function render(fr) {
      var W = canvas.width, H = canvas.height, dpr = fr.dpr;
      // Hintergrund mit Übergang
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = rgb(fr.bgA); ctx.fillRect(0, 0, W, H);
      if (fr.wipe > 0) {
        var yb = (1 - fr.wipe) * H;
        ctx.fillStyle = rgb(fr.bgB); ctx.fillRect(0, yb, W, H - yb);
        ctx.fillStyle = 'rgba(217,181,102,' + (0.35 * Math.sin(Math.min(1, fr.wipe) * Math.PI)).toFixed(3) + ')';
        ctx.fillRect(0, yb - dpr, W, 2 * dpr);
      }
      var gr = ctx.createRadialGradient(fr.glow[0], fr.glow[1], 0, fr.glow[0], fr.glow[1], fr.glow[2] * 1.2);
      gr.addColorStop(0, 'rgba(13,40,92,' + (0.75 * fr.glow[3]).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(13,40,92,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      buildGrid(W, H, dpr);
      ctx.drawImage(grid, 0, 0);
      var vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(1,8,22,0.45)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      // Partikel simulieren (CPU)
      var st = { t: fr.time, ratio: fr.ratio, stress: fr.stress, explode: fr.explode, scale: fr.slabScale, lift: fr.slabLift }, dt = fr.dt;
      var fa = Math.round(fr.formA), fb = Math.round(fr.formB);
      var proj = new Array(N), centerW = DF.M.xform(fr.viewProj, 0, 0, 0)[3];
      for (var i = 0; i < N; i++) {
        var o = i * 20;
        var bl = Math.min(1, Math.max(0, fr.blend * 1.6 - P[o + 15] * 0.6)), b = bl * bl * (3 - 2 * bl);
        var A = DF.target(fa, i, P, o, st), B = fa === fb ? A : DF.target(fb, i, P, o, st), T = new Array(7);
        for (var k = 0; k < 7; k++) T[k] = A[k] + (B[k] - A[k]) * b;
        if (fr.reduced) {
          P[o] = T[0]; P[o + 1] = T[1]; P[o + 2] = T[2]; P[o + 4] = P[o + 5] = P[o + 6] = 0;
          P[o + 16] = T[3]; P[o + 17] = T[4]; P[o + 18] = T[5]; P[o + 19] = T[6];
        } else {
          var damp = Math.exp(-3.4 * dt), kc = 1 - Math.exp(-dt * 3.5);
          for (var a = 0; a < 3; a++) {
            var acc = (T[a] - P[o + a]) * 7;
            P[o + 4 + a] = P[o + 4 + a] * damp + acc * dt;
            P[o + a] += P[o + 4 + a] * dt;
          }
          if (fr.mouseActive) {
            var dx = P[o] - fr.mouseWorld[0], dy = P[o + 1] - fr.mouseWorld[1], d2 = dx * dx + dy * dy, dl = Math.sqrt(d2) + 1e-4;
            var f = 3 * Math.exp(-d2 / 0.09) * dt;
            P[o + 4] += dx / dl * f; P[o + 5] += dy / dl * f;
          }
          for (var c = 0; c < 4; c++) P[o + 16 + c] += (T[3 + c] - P[o + 16 + c]) * kc;
        }
        proj[i] = project(fr.viewProj, W, H, P[o], P[o + 1], P[o + 2]);
      }

      function drawParticles(front) {
        ctx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < N; i++) {
          var p = proj[i]; if (p[2] <= 0.1 || (p[2] < centerW) !== front) continue;
          var o = i * 20, a = P[o + 19] * fr.intensity * Math.exp(-Math.max(p[2] - 6.5, 0) * 0.13);
          if (a < 0.02) continue;
          var r = Math.max(0.9 * dpr, (0.011 + P[o + 14] * 0.013) * fr.proj11 * 0.5 * H / p[2]);
          ctx.fillStyle = 'rgba(' + Math.round(P[o + 16] * 255) + ',' + Math.round(P[o + 17] * 255) + ',' + Math.round(P[o + 18] * 255) + ',' + Math.min(1, a * 0.9).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p[0], p[1], r * 0.8, 0, 6.2832); ctx.fill();
        }
      }
      drawParticles(false);

      // Flächen
      ctx.globalCompositeOperation = 'source-over';
      var list = [];
      for (var fI = 0; fr.slabScale > 0.02 && fI < faces.length; fI++) {
        var fc = faces[fI], so = DF.slabOffset(fc.g, fr.explode, fr.stress, fr.time), pts = [], wsum = 0, cx = 0, cy = 0, cz = 0;
        for (var j = 0; j < fc.pts.length; j++) {
          var q = fc.pts[j], x = q[0] * fr.slabScale + so[0], y = q[1] * fr.slabScale + so[1] + fr.slabLift, z = q[2] * fr.slabScale + so[2];
          var pp = project(fr.viewProj, W, H, x, y, z); pts.push(pp); wsum += pp[2]; cx += x; cy += y; cz += z;
        }
        var n = fc.pts.length; cx /= n; cy /= n; cz /= n;
        var vx = fr.eye[0] - cx, vy = fr.eye[1] - cy, vz = fr.eye[2] - cz;
        if (fc.n[0] * vx + fc.n[1] * vy + fc.n[2] * vz <= 0) continue; // Rückseite
        list.push({ f: fc, pts: pts, depth: wsum / n });
      }
      list.sort(function (a, b) { return b.depth - a.depth; });
      list.forEach(function (it) {
        var nrm = it.f.n, diff = Math.max(0, nrm[0] * L[0] + nrm[1] * L[1] + nrm[2] * L[2]);
        var k = (0.42 + 0.68 * diff) * (Math.abs(nrm[2]) > 0.5 ? 1 : 0.72);
        if (it.f.g === 2) k += fr.stress * 0.25;
        ctx.fillStyle = rgb(DF.GROUP_COL[it.f.g], k);
        ctx.beginPath();
        it.pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
        ctx.closePath(); ctx.fill();
      });
      drawParticles(true);
      ctx.globalCompositeOperation = 'source-over';
    }

    return { kind: 'canvas2d', particles: N, render: render, destroy: function () {} };
  };
})();
