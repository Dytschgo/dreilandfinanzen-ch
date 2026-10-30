/* Dreiland Finanzen – «Tragwerk»
 * Gemeinsame Grundlagen für WebGPU- und Canvas-2D-Renderer:
 * Mathematik, Geometrie der Bildmarke (aus dem Original-SVG), Partikel-Formationen.
 * Klassisches Script (kein ES-Modul), damit die Seite auch per file:// läuft. */
(function () {
  'use strict';
  var DF = (window.DF = window.DF || {});

  /* ---------- Mathe (Spalten-Major, WebGPU-Tiefe 0..1) ---------- */
  var M = {};
  M.perspective = function (fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, far * nf, -1, 0, 0, near * far * nf, 0]);
  };
  M.lookAt = function (e, c, up) {
    var zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2];
    var l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    var xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
    var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return new Float32Array([
      xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1
    ]);
  };
  M.mul = function (a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  };
  M.invert = function (m) {
    var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3], a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7],
      a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11], a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
    var b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return null;
    det = 1 / det;
    return new Float32Array([
      (a11 * b11 - a12 * b10 + a13 * b09) * det, (a02 * b10 - a01 * b11 - a03 * b09) * det,
      (a31 * b05 - a32 * b04 + a33 * b03) * det, (a22 * b04 - a21 * b05 - a23 * b03) * det,
      (a12 * b08 - a10 * b11 - a13 * b07) * det, (a00 * b11 - a02 * b08 + a03 * b07) * det,
      (a32 * b02 - a30 * b05 - a33 * b01) * det, (a20 * b05 - a22 * b02 + a23 * b01) * det,
      (a10 * b10 - a11 * b08 + a13 * b06) * det, (a01 * b08 - a00 * b10 - a03 * b06) * det,
      (a30 * b04 - a31 * b02 + a33 * b00) * det, (a21 * b02 - a20 * b04 - a23 * b00) * det,
      (a11 * b07 - a10 * b09 - a12 * b06) * det, (a00 * b09 - a01 * b07 + a02 * b06) * det,
      (a31 * b01 - a30 * b03 - a32 * b00) * det, (a20 * b03 - a21 * b01 + a22 * b00) * det
    ]);
  };
  M.xform = function (m, x, y, z) {
    return [
      m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13],
      m[2] * x + m[6] * y + m[10] * z + m[14], m[3] * x + m[7] * y + m[11] * z + m[15]
    ];
  };
  DF.M = M;

  /* ---------- Bildmarke: Polygone 1:1 aus dreiland-finanzen_icon_*.svg ---------- */
  var SVG_POLYS = [
    [20.6, 26.8, 20.6, 51.6, 40.4, 63.03, 61.88, 50.63],                       // flaeche-blau
    [95.6, 26.2, 60.9, 46.23, 66.3, 49.35, 66.3, 69.52, 95.6, 52.6],           // flaeche-gold
    [43.3, 64.9, 62.8, 53.64, 62.8, 75.39, 71.0, 70.65, 71.0, 104.39, 43.3, 88.4] // flaeche-rot
  ];
  var CX = 58.1, CY = 65.3, S = 1 / 38;
  DF.HALF_DEPTH = 0.11;

  function toWorld(poly) {
    var out = [];
    for (var i = 0; i < poly.length; i += 2) out.push([(poly[i] - CX) * S, -(poly[i + 1] - CY) * S]);
    return out;
  }
  function area(p) {
    var a = 0;
    for (var i = 0; i < p.length; i++) { var q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; }
    return a / 2;
  }
  function pointInTri(p, a, b, c) {
    var d1 = (p[0] - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (p[1] - b[1]);
    var d2 = (p[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (p[1] - c[1]);
    var d3 = (p[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (p[1] - a[1]);
    var neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(neg && pos);
  }
  // Ear-Clipping (Polygone sind CCW nach toWorld+Orientierungskorrektur)
  function triangulate(p) {
    var idx = p.map(function (_, i) { return i; }), tris = [], guard = 0;
    while (idx.length > 3 && guard++ < 100) {
      for (var i = 0; i < idx.length; i++) {
        var ia = idx[(i + idx.length - 1) % idx.length], ib = idx[i], ic = idx[(i + 1) % idx.length];
        var a = p[ia], b = p[ib], c = p[ic];
        var cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
        if (cross <= 0) continue; // reflex
        var ok = true;
        for (var j = 0; j < idx.length; j++) {
          var k = idx[j];
          if (k === ia || k === ib || k === ic) continue;
          if (pointInTri(p[k], a, b, c)) { ok = false; break; }
        }
        if (!ok) continue;
        tris.push([ia, ib, ic]); idx.splice(i, 1); break;
      }
    }
    tris.push([idx[0], idx[1], idx[2]]);
    return tris;
  }

  DF.POLYS = SVG_POLYS.map(function (sp) {
    var p = toWorld(sp);
    if (area(p) < 0) p.reverse();
    return p;
  });
  DF.TRIS = DF.POLYS.map(triangulate);

  /* Extrudierte Flächen: Float32Array mit [x,y,z, nx,ny,nz, gruppe] je Vertex */
  DF.buildSlabMesh = function () {
    var d = DF.HALF_DEPTH, v = [];
    function push(p, n, g) { v.push(p[0], p[1], p[2], n[0], n[1], n[2], g); }
    DF.POLYS.forEach(function (poly, g) {
      DF.TRIS[g].forEach(function (t) {
        var a = poly[t[0]], b = poly[t[1]], c = poly[t[2]];
        push([a[0], a[1], d], [0, 0, 1], g); push([b[0], b[1], d], [0, 0, 1], g); push([c[0], c[1], d], [0, 0, 1], g);
        push([a[0], a[1], -d], [0, 0, -1], g); push([c[0], c[1], -d], [0, 0, -1], g); push([b[0], b[1], -d], [0, 0, -1], g);
      });
      for (var i = 0; i < poly.length; i++) {
        var a = poly[i], b = poly[(i + 1) % poly.length];
        var ex = b[0] - a[0], ey = b[1] - a[1], l = Math.hypot(ex, ey);
        var n = [ey / l, -ex / l, 0];
        var a0 = [a[0], a[1], d], a1 = [a[0], a[1], -d], b0 = [b[0], b[1], d], b1 = [b[0], b[1], -d];
        push(a0, n, g); push(a1, n, g); push(b0, n, g);
        push(b0, n, g); push(a1, n, g); push(b1, n, g);
      }
    });
    return new Float32Array(v);
  };

  /* Seitenflächen/Fronten für den 2D-Fallback (Maler-Algorithmus) */
  DF.slabFaces = function () {
    var d = DF.HALF_DEPTH, faces = [];
    DF.POLYS.forEach(function (poly, g) {
      faces.push({ g: g, n: [0, 0, 1], pts: poly.map(function (p) { return [p[0], p[1], d]; }) });
      faces.push({ g: g, n: [0, 0, -1], pts: poly.map(function (p) { return [p[0], p[1], -d]; }) });
      for (var i = 0; i < poly.length; i++) {
        var a = poly[i], b = poly[(i + 1) % poly.length];
        var ex = b[0] - a[0], ey = b[1] - a[1], l = Math.hypot(ex, ey);
        faces.push({ g: g, n: [ey / l, -ex / l, 0], pts: [[a[0], a[1], d], [b[0], b[1], d], [b[0], b[1], -d], [a[0], a[1], -d]] });
      }
    });
    return faces;
  };

  /* Zufällige Punkte in einer Fläche (Rejection Sampling) */
  function samplePoly(g, rnd) {
    var poly = DF.POLYS[g], minx = 9, miny = 9, maxx = -9, maxy = -9;
    poly.forEach(function (p) { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); });
    for (var tries = 0; tries < 200; tries++) {
      var x = minx + rnd() * (maxx - minx), y = miny + rnd() * (maxy - miny), inside = false;
      DF.TRIS[g].forEach(function (t) { if (pointInTri([x, y], poly[t[0]], poly[t[1]], poly[t[2]])) inside = true; });
      if (inside) return [x, y];
    }
    return poly[0];
  }
  var POLY_AREA = DF.POLYS.map(area);
  var TOTAL_AREA = POLY_AREA[0] + POLY_AREA[1] + POLY_AREA[2];

  DF.rng = function (seed) {
    var s = seed >>> 0;
    return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };

  /* Partikel: je 5×vec4 = pos, vel, home(xyz, gruppe), seed, farbe */
  DF.FLOATS_PER_PARTICLE = 20;
  DF.initParticles = function (n) {
    var rnd = DF.rng(20260611), a = new Float32Array(n * 20);
    for (var i = 0; i < n; i++) {
      var r = rnd() * TOTAL_AREA, g = r < POLY_AREA[0] ? 0 : r < POLY_AREA[0] + POLY_AREA[1] ? 1 : 2;
      var hp = samplePoly(g, rnd), o = i * 20;
      // Start: weit gestreut – die Bildmarke setzt sich beim Laden zusammen
      var th = rnd() * Math.PI * 2, ph = (rnd() - 0.5) * 2.4, R = 4 + rnd() * 5;
      a[o] = Math.cos(th) * Math.cos(ph) * R; a[o + 1] = Math.sin(ph) * R * 0.6; a[o + 2] = Math.sin(th) * Math.cos(ph) * R - 2; a[o + 3] = 1;
      a[o + 8] = hp[0]; a[o + 9] = hp[1]; a[o + 10] = DF.HALF_DEPTH + 0.006 + rnd() * rnd() * 0.07; a[o + 11] = g;
      a[o + 12] = rnd(); a[o + 13] = rnd(); a[o + 14] = rnd(); a[o + 15] = rnd();
      a[o + 16] = 0.3; a[o + 17] = 0.4; a[o + 18] = 0.6; a[o + 19] = 0;
    }
    return a;
  };

  /* ---------- Formationen (JS-Spiegel der WGSL-Funktion target()) ---------- */
  var GROUP_COL = [[0.31, 0.525, 0.776], [0.851, 0.71, 0.4], [0.898, 0.282, 0.302]];
  DF.GROUP_COL = GROUP_COL;
  function mix3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  DF.mix3 = mix3;
  DF.ampel = function (s) {
    var g = [0.30, 0.72, 0.51], y = [0.85, 0.71, 0.40], r = [0.90, 0.28, 0.30];
    return s < 0.5 ? mix3(g, y, s * 2) : mix3(y, r, (s - 0.5) * 2);
  };
  DF.slabOffset = function (g, explode, stress, t) {
    var dir = g === 0 ? [-0.55, 0.45, -1.0] : g === 1 ? [0.6, 0.5, 0.0] : [0.0, -0.6, 1.0];
    var o = [dir[0] * explode, dir[1] * explode, dir[2] * explode];
    if (g === 2) { o[2] += stress * 0.35; o[0] += Math.sin(t * 7) * stress * stress * 0.012; }
    return o;
  };
  function riverY(x) { return -0.55 + 0.35 * Math.sin(x * 0.5 + 0.8) + 0.15 * Math.sin(x * 1.3); }
  function riverZ(x) { return -1.0 + 0.9 * Math.sin(x * 0.35); }
  var TRI = [0.2, riverY(0.2), riverZ(0.2)];
  DF.TOWNS = [ // FR Saint-Louis (blau), DE Lörrach (gold), CH Basel (rot)
    [TRI[0] - 1.15, TRI[1], TRI[2] + 0.35],
    [TRI[0] + 0.95, TRI[1], TRI[2] - 0.85],
    [TRI[0] + 0.4, TRI[1], TRI[2] + 0.8]
  ];
  function nrm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
  var BORDERS = [nrm([-0.3, 0, 1]), nrm([-0.35, 0, -1]), nrm([1, 0, 0.15])];

  // st = {t, ratio, stress, explode, scale, lift}
  DF.target = function (f, i, a, o, st) {
    var sx = a[o + 12], sy = a[o + 13], sz = a[o + 14], sw = a[o + 15], g = a[o + 11], t = st.t;
    var pos, col, al;
    if (f === 2 && sx < 0.8) {
      var tick = Math.min(Math.abs(sy - 0.35), Math.abs(sy - 0.6)) < 0.0035;
      var th = Math.PI / 2 - sy * Math.PI * 2, R = 1.62 + (sz - 0.5) * (tick ? 0.46 : 0.2);
      pos = [Math.cos(th) * R, Math.sin(th) * R, (sw - 0.5) * 0.12];
      if (tick) { col = [0.93, 0.95, 0.98]; al = 0.8; } else if (sy < st.ratio) { col = DF.ampel(st.stress); al = 1.0; } else { col = [0.42, 0.5, 0.7]; al = 0.4; }
    } else if (f === 1) {
      var kk = Math.min(2, Math.floor(sx * 3)), gx = Math.floor(sy * 18) / 17 - 0.5, gz = Math.floor(sz * 18) / 17 - 0.5;
      var lx = (gx - gz) * 0.7071 * 1.25, lz = (gx + gz) * 0.7071 * 1.25;
      pos = [-1.3 + 1.3 * kk + lx, -0.75 + 0.55 * kk + Math.sin(t * 0.8 + kk * 1.3) * 0.03, 0.5 - 0.6 * kk + lz];
      col = GROUP_COL[kk]; al = 0.5;
    } else if (f === 3) {
      if (sx < 0.78) {
        var uu = (sy + t * 0.01 * (0.7 + sz * 0.6)) % 1, rx = (uu - 0.5) * 13, w = (sz - 0.5) * 0.7 * (0.35 + 0.65 * sw);
        pos = [rx, riverY(rx) + Math.abs(w) * 0.05, riverZ(rx) + w];
        col = mix3([0.31, 0.53, 0.78], [0.78, 0.88, 1.0], sw * sw); al = 0.75;
      } else if (sx < 0.84) {
        var bk = Math.min(2, Math.floor((sx - 0.78) / 0.02)), bl = (Math.floor(sy * 22) + sz * 0.5) / 22 * 2.4 + 0.08, bd = BORDERS[bk];
        pos = [TRI[0] + bd[0] * bl, TRI[1] + 0.01, TRI[2] + bd[2] * bl];
        col = [0.85, 0.71, 0.40]; al = 0.65 * (1 - sy * 0.6);
      } else {
        var k = Math.min(2, Math.floor((sx - 0.84) / 0.0534)), tw = DF.TOWNS[k];
        if (sw < 0.3) {
          pos = [tw[0] + (sy - 0.5) * 0.03, tw[1] + sz * sz * 0.7, tw[2]];
          col = mix3(GROUP_COL[k], [1, 1, 1], 0.3); al = 0.7 * (1 - sz);
        } else {
          var ang = sy * 6.2832 + t * 0.15, el = (sz - 0.5) * 3.0, rr = 0.04 + (sw - 0.3) * 0.26;
          pos = [tw[0] + Math.cos(ang) * Math.cos(el) * rr, tw[1] + Math.abs(Math.sin(el)) * 0.6 * rr, tw[2] + Math.sin(ang) * Math.cos(el) * rr];
          col = GROUP_COL[k]; al = 1.0;
        }
      }
    } else { // 0 = Bildmarke (+ Rest der Gauge-Formation)
      if (sx < 0.62 || f === 2) {
        var so = DF.slabOffset(g, st.explode, st.stress, t), sc = st.scale;
        pos = [a[o + 8] * sc + so[0] + (sy - 0.5) * 0.02, a[o + 9] * sc + so[1] + (sz - 0.5) * 0.02 + st.lift, a[o + 10] * sc + so[2]];
        col = mix3(GROUP_COL[g], [1, 1, 1], 0.2); al = 0.5;
      } else {
        var an = sy * 6.2832 + t * 0.04 * (0.4 + sz), e = (sz - 0.5) * 1.0, Rr = 1.45 + sw * 1.1;
        pos = [Math.cos(an) * Math.cos(e) * Rr, Math.sin(e) * Rr * 0.8, Math.sin(an) * Math.cos(e) * Rr * 0.6];
        col = mix3(GROUP_COL[g], [1, 1, 1], 0.5); al = 0.45;
      }
    }
    return [pos[0], pos[1], pos[2], col[0], col[1], col[2], al];
  };
})();
