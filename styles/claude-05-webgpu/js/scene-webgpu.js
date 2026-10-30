/* Dreiland Finanzen – «Tragwerk»: WebGPU-Renderer
 * 1 Compute-Pass (Partikelphysik + Formationen) und 1 Render-Pass (MSAA 4×):
 *   Hintergrund (Isometrie-Raster, Kachel-Übergang zwischen Abschnitten, Lichtkegel der Maus)
 *   → drei extrudierte Flächen der Bildmarke (Licht, Tiefe) → Partikel (additiv, tiefengetestet).
 * Eigene WGSL-Shader, keine Bibliotheken. Wirft bei jedem Problem, damit app.js auf Canvas 2D wechselt. */
(function () {
  'use strict';
  var DF = (window.DF = window.DF || {});

  var COMMON = /* wgsl */ `
struct U {
  viewProj: mat4x4f,
  cam: vec4f,     // xyz Auge, w Zeit
  mouse: vec4f,   // xy Maus px, zw Maus-Welt (Ebene z=0)
  form: vec4f,    // x FormA, y FormB, z Blend, w dt
  calc: vec4f,    // x Belastung (0..1), y Stress (Ampel 0..1), z Puls, w Explode
  screen: vec4f,  // x Breite px, y Höhe px, z reduzierte Bewegung, w devicePixelRatio
  bgA: vec4f,
  bgB: vec4f,
  misc: vec4f,    // x Kachel-Übergang, y Partikelzahl, z Intensität, w Maus aktiv
  glow: vec4f,    // xy Zentrum px, z Radius px, w Stärke
  proj: vec4f,    // x P00, y P11, z Skalierung Flächen, w Anhebung Flächen
};
struct Particle { pos: vec4f, vel: vec4f, home: vec4f, seed: vec4f, col: vec4f };
@group(0) @binding(0) var<uniform> u: U;
const PI: f32 = 3.14159265;
fn groupColor(g: f32) -> vec3f {
  if (g < 0.5) { return vec3f(0.31, 0.525, 0.776); }
  if (g < 1.5) { return vec3f(0.851, 0.71, 0.4); }
  return vec3f(0.898, 0.282, 0.302);
}
fn ampel(s: f32) -> vec3f {
  let g = vec3f(0.30, 0.72, 0.51); let y = vec3f(0.85, 0.71, 0.40); let r = vec3f(0.90, 0.28, 0.30);
  if (s < 0.5) { return mix(g, y, s * 2.0); }
  return mix(y, r, (s - 0.5) * 2.0);
}
fn slabOffset(g: f32, explode: f32, stress: f32, t: f32) -> vec3f {
  var dir = vec3f(-0.55, 0.45, -1.0);
  if (g > 0.5 && g < 1.5) { dir = vec3f(0.6, 0.5, 0.0); }
  if (g > 1.5) { dir = vec3f(0.0, -0.6, 1.0); }
  var o = dir * explode;
  if (g > 1.5) { o = o + vec3f(sin(t * 7.0) * stress * stress * 0.012, 0.0, stress * 0.35); }
  return o;
}
`;

  var COMPUTE = COMMON + /* wgsl */ `
@group(0) @binding(1) var<storage, read_write> ps: array<Particle>;
struct Tg { pos: vec3f, col: vec4f };
fn riverY(x: f32) -> f32 { return -0.55 + 0.35 * sin(x * 0.5 + 0.8) + 0.15 * sin(x * 1.3); }
fn riverZ(x: f32) -> f32 { return -1.0 + 0.9 * sin(x * 0.35); }
fn tri() -> vec3f { return vec3f(0.2, riverY(0.2), riverZ(0.2)); }
fn town(k: i32) -> vec3f {
  if (k == 0) { return tri() + vec3f(-1.15, 0.0, 0.35); }
  if (k == 1) { return tri() + vec3f(0.95, 0.0, -0.85); }
  return tri() + vec3f(0.4, 0.0, 0.8);
}
fn borderDir(k: i32) -> vec3f {
  if (k == 0) { return normalize(vec3f(-0.3, 0.0, 1.0)); }
  if (k == 1) { return normalize(vec3f(-0.35, 0.0, -1.0)); }
  return normalize(vec3f(1.0, 0.0, 0.15));
}
fn formTarget(f: i32, i: u32, p: Particle) -> Tg {
  let s = p.seed; let g = p.home.w; let t = u.cam.w;
  var o: Tg;
  if (f == 2 && s.x < 0.8) {
    // Tragbarkeits-Ring: Anteil der Rate an den freien Mitteln
    let th = PI * 0.5 - s.y * 2.0 * PI;
    let tick = min(abs(s.y - 0.35), abs(s.y - 0.6)) < 0.0035;
    let R = 1.62 + (s.z - 0.5) * select(0.2, 0.46, tick);
    o.pos = vec3f(cos(th) * R, sin(th) * R, (s.w - 0.5) * 0.12);
    if (tick) {
      o.col = vec4f(0.93, 0.95, 0.98, 0.95);
    } else if (s.y < u.calc.x) {
      let tip = 1.0 - smoothstep(0.0, 0.035, u.calc.x - s.y);
      o.col = vec4f(mix(ampel(u.calc.y), vec3f(1.0), tip * 0.45), 0.95 + tip * 0.4);
    } else { o.col = vec4f(0.42, 0.5, 0.7, 0.4); }
  } else if (f == 1) {
    // Drei isometrische Stufen (Ablauf in 3 Schritten) als Partikel-Raster
    let k = min(2.0, floor(s.x * 3.0));
    let gx = floor(s.y * 18.0) / 17.0 - 0.5; let gz = floor(s.z * 18.0) / 17.0 - 0.5;
    let c = vec3f(-1.3 + 1.3 * k, -0.75 + 0.55 * k, 0.5 - 0.6 * k);
    let lx = (gx - gz) * 0.7071 * 1.25; let lz = (gx + gz) * 0.7071 * 1.25;
    let j = (vec3f(s.w, fract(s.w * 7.31), fract(s.w * 13.17)) - 0.5) * 0.016;
    o.pos = c + vec3f(lx, sin(t * 0.8 + k * 1.3) * 0.03, lz) + j;
    o.col = vec4f(groupColor(k), 0.32);
  } else if (f == 3) {
    if (s.x < 0.78) {
      // Rhein: Partikel fliessen entlang einer Kurve
      let uu = fract(s.y + t * 0.01 * (0.7 + s.z * 0.6)); let x = (uu - 0.5) * 13.0;
      let w = (s.z - 0.5) * 0.7 * (0.35 + 0.65 * s.w);
      o.pos = vec3f(x, riverY(x) + abs(w) * 0.05, riverZ(x) + w);
      o.col = vec4f(mix(vec3f(0.31, 0.53, 0.78), vec3f(0.78, 0.88, 1.0), s.w * s.w), 0.75);
    } else if (s.x < 0.84) {
      // Grenzen: drei gestrichelte Linien treffen sich am Dreiländereck
      let k = min(2, i32(floor((s.x - 0.78) / 0.02)));
      let len = (floor(s.y * 22.0) + s.z * 0.5) / 22.0 * 2.4 + 0.08;
      o.pos = tri() + borderDir(k) * len + vec3f(0.0, 0.01 + (s.w - 0.5) * 0.015, 0.0);
      o.col = vec4f(0.85, 0.71, 0.40, 0.9 * (1.0 - s.y * 0.55));
    } else {
      // Drei Orte: Saint-Louis (FR), Lörrach (DE), Basel (CH)
      let k = min(2, i32(floor((s.x - 0.84) / 0.0534)));
      if (s.w < 0.3) {
        o.pos = town(k) + vec3f((s.y - 0.5) * 0.03, s.z * s.z * 0.7, (fract(s.y * 9.7) - 0.5) * 0.03);
        o.col = vec4f(mix(groupColor(f32(k)), vec3f(1.0), 0.3), 0.7 * (1.0 - s.z));
      } else {
        let ang = s.y * 6.2832 + t * 0.15; let el = (s.z - 0.5) * 3.0; let rr = 0.04 + (s.w - 0.3) * 0.26;
        o.pos = town(k) + vec3f(cos(ang) * cos(el), abs(sin(el)) * 0.6, sin(ang) * cos(el)) * rr;
        o.col = vec4f(groupColor(f32(k)), 1.0);
      }
    }
  } else {
    if (s.x < 0.62 || f == 2) {
      o.pos = p.home.xyz * u.proj.z + slabOffset(g, u.calc.w, u.calc.y, t) + vec3f((s.y - 0.5) * 0.02, (s.z - 0.5) * 0.02 + u.proj.w, 0.0);
      o.col = vec4f(mix(groupColor(g), vec3f(1.0), 0.2), 0.5);
    } else {
      let a = s.y * 6.2832 + t * 0.04 * (0.4 + s.z); let e = (s.z - 0.5) * 1.0; let R = 1.45 + s.w * 1.1;
      o.pos = vec3f(cos(a) * cos(e) * R, sin(e) * R * 0.8, sin(a) * cos(e) * R * 0.6);
      o.col = vec4f(mix(groupColor(g), vec3f(1.0), 0.5), 0.45);
    }
  }
  return o;
}
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x;
  if (i >= u32(u.misc.y)) { return; }
  var p = ps[i];
  let bl = clamp(u.form.z * 1.6 - p.seed.w * 0.6, 0.0, 1.0);
  let b = bl * bl * (3.0 - 2.0 * bl);
  let A = formTarget(i32(u.form.x + 0.5), i, p);
  let B = formTarget(i32(u.form.y + 0.5), i, p);
  let tp = mix(A.pos, B.pos, b);
  let tc = mix(A.col, B.col, b);
  if (u.screen.z > 0.5) {
    // prefers-reduced-motion: direkt auf Ziel, keine Bewegung
    p.pos = vec4f(tp, 1.0); p.vel = vec4f(0.0); p.col = tc; ps[i] = p; return;
  }
  let dt = u.form.w; let t = u.cam.w;
  var x = p.pos.xyz; var v = p.vel.xyz;
  var acc = (tp - x) * 7.0;
  let q = x * 1.3 + p.seed.xyz * 6.0;
  acc += vec3f(sin(q.y + t * 0.7), sin(q.z * 1.1 - t * 0.6), sin(q.x * 0.9 + t * 0.5)) * 0.32;
  let d = x.xy - u.mouse.zw; let d2 = dot(d, d);
  acc += vec3f(normalize(d + vec2f(0.0001, 0.0)) * 3.0 * exp(-d2 / 0.09) * u.misc.w, 0.0);
  acc += vec3f(normalize(x.xy + vec2f(0.0001, 0.0)), 0.0) * u.calc.z * 9.0 * step(s_ring(p), 0.5);
  v = v * exp(-3.4 * dt) + acc * dt;
  x = x + v * dt;
  p.pos = vec4f(x, 1.0);
  p.vel = vec4f(v, 0.0);
  p.col = mix(p.col, tc, 1.0 - exp(-dt * 3.5));
  ps[i] = p;
}
fn s_ring(p: Particle) -> f32 { return select(1.0, 0.0, p.seed.x < 0.8); }
`;

  var PARTICLES = COMMON + /* wgsl */ `
@group(0) @binding(1) var<storage, read> ps: array<Particle>;
struct VO { @builtin(position) pos: vec4f, @location(0) uv: vec2f, @location(1) col: vec4f };
@vertex fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VO {
  let p = ps[ii];
  var corners = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0));
  let c = corners[vi];
  var clip = u.viewProj * vec4f(p.pos.xyz, 1.0);
  let w = max(clip.w, 0.05);
  let size = 0.009 + p.seed.z * 0.013;
  let rpxRaw = size * u.proj.y * 0.5 * u.screen.y / w;
  let rpx = max(rpxRaw, 0.85 * u.screen.w);
  let ndc = vec2f(rpx * 2.0 / u.screen.x, rpx * 2.0 / u.screen.y);
  clip = vec4f(clip.xy + c * ndc * w, clip.z, clip.w);
  var o: VO;
  o.pos = clip; o.uv = c;
  let speed = length(p.vel.xyz);
  var a = p.col.a * (0.65 + min(speed * 0.5, 0.9)) * u.misc.z;
  a = a * min(1.0, rpxRaw / rpx + 0.35) * exp(-max(w - 6.5, 0.0) * 0.13);
  o.col = vec4f(p.col.rgb, a);
  return o;
}
@fragment fn fs(i: VO) -> @location(0) vec4f {
  let d = length(i.uv);
  if (d > 1.0) { discard; }
  let core = 1.0 - smoothstep(0.0, 1.0, d);
  let f = core * core * 0.9 + (1.0 - smoothstep(0.0, 0.35, d)) * 0.5;
  let a = clamp(i.col.a * f, 0.0, 1.0);
  // vormultipliziert: Deckkraft + leichter additiver Glanz
  return vec4f(i.col.rgb * a * 1.25, a * 0.8);
}
`;

  var SLABS = COMMON + /* wgsl */ `
struct VI { @location(0) p: vec3f, @location(1) n: vec3f, @location(2) g: f32 };
struct VO { @builtin(position) pos: vec4f, @location(0) wp: vec3f, @location(1) n: vec3f, @location(2) g: f32 };
@vertex fn vs(v: VI) -> VO {
  var o: VO;
  let wp = v.p * u.proj.z + slabOffset(v.g, u.calc.w, u.calc.y, u.cam.w) + vec3f(0.0, u.proj.w, 0.0);
  o.pos = u.viewProj * vec4f(wp, 1.0);
  o.wp = wp; o.n = v.n; o.g = v.g;
  return o;
}
@fragment fn fs(i: VO) -> @location(0) vec4f {
  let base = groupColor(i.g);
  let N = normalize(i.n);
  let V = normalize(u.cam.xyz - i.wp);
  let L = normalize(vec3f(-0.45, 0.6, 0.85));
  let diff = max(dot(N, L), 0.0);
  let H = normalize(L + V);
  let spec = pow(max(dot(N, H), 0.0), 60.0);
  let lp = vec3f(u.mouse.zw, 1.3);
  let ld = lp - i.wp;
  let pl = max(dot(N, normalize(ld)), 0.0) / (1.0 + dot(ld, ld) * 1.4) * u.misc.w;
  let fres = pow(1.0 - abs(dot(N, V)), 3.0);
  let sheen = 0.92 + 0.16 * clamp(i.wp.y * 0.5 + 0.5, 0.0, 1.0);
  var c = base * (0.42 + 0.68 * diff + 0.7 * pl) * sheen + vec3f(1.0, 0.95, 0.86) * (spec * 0.3 + fres * 0.2);
  if (i.g > 1.5) { c += base * u.calc.y * (0.22 + 0.12 * sin(u.cam.w * 2.6)); }
  // seitliche Kanten etwas dunkler – betont die Tiefe der Fläche
  c *= select(0.72, 1.0, abs(N.z) > 0.5);
  return vec4f(c, 1.0);
}
`;

  var BACKGROUND = COMMON + /* wgsl */ `
@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  var p = array<vec2f, 3>(vec2f(-1.0, -3.0), vec2f(-1.0, 1.0), vec2f(3.0, 1.0));
  return vec4f(p[i], 1.0, 1.0);
}
fn hash3(p: vec3f) -> f32 { return fract(sin(dot(p, vec3f(12.9898, 78.233, 37.719))) * 43758.5453); }
fn hash2(p: vec2f) -> f32 { return fract(sin(dot(p, vec2f(12.9898, 78.233))) * 43758.5453); }
@fragment fn fs(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let res = u.screen.xy; let px = fc.xy; let dpr = u.screen.w;
  let uv = px / res;
  // gleichseitiges Dreiecksraster mit 30°-Kanten (wie die Bildmarke)
  let L = 54.0 * dpr; let w = L * 0.8660254; let t30 = 0.57735027;
  let a = px.x / w; let b = (px.y - px.x * t30) / L; let c = (px.y + px.x * t30) / L;
  let cell = vec3f(floor(a), floor(b), floor(c));
  let h = hash3(cell);
  let cy = (floor(b) + floor(c) + 1.0) * L * 0.5 / res.y;
  // Kachel-Übergang: die nächste Sektion kippt Kachel für Kachel von unten herein
  let front = (1.0 - cy) * 0.86 + h * 0.14;
  let prog = u.misc.x;
  let m = smoothstep(front - 0.035, front, prog);
  var col = mix(u.bgA.rgb, u.bgB.rgb, m);
  let edge = (1.0 - smoothstep(0.0, 0.05, abs(front - prog))) * sin(clamp(prog, 0.0, 1.0) * PI);
  // sanfter vertikaler Verlauf + Licht hinter der Szene
  col *= 0.86 + 0.24 * (1.0 - uv.y);
  let gd = length(px - u.glow.xy) / max(u.glow.z, 1.0);
  col += vec3f(0.05, 0.11, 0.24) * exp(-gd * gd * 1.6) * u.glow.w;
  // Linien
  let va = (0.5 - abs(fract(a) - 0.5)) * w;
  let vb = (0.5 - abs(fract(b) - 0.5)) * L * 0.8660254;
  let vc = (0.5 - abs(fract(c) - 0.5)) * L * 0.8660254;
  let line = 1.0 - smoothstep(0.0, 1.1 * dpr, min(va, min(vb, vc)));
  let md = length(px - u.mouse.xy) / (300.0 * dpr);
  let spot = exp(-md * md * 2.0) * u.misc.w;
  col += vec3f(0.45, 0.58, 0.85) * line * (0.028 + 0.16 * spot);
  col += vec3f(0.85, 0.71, 0.40) * line * edge * 0.32;
  col += vec3f(0.85, 0.71, 0.40) * edge * 0.02 * h;
  // Vignette + Dither gegen Banding
  let vg = length((uv - 0.5) * vec2f(1.0, 1.25));
  col *= 1.0 - vg * vg * 0.38;
  col += (hash2(px + fract(u.cam.w) * 0.0) - 0.5) / 255.0;
  return vec4f(col, 1.0);
}
`;

  async function compile(device, code, label) {
    var mod = device.createShaderModule({ code: code, label: label });
    if (mod.getCompilationInfo) {
      var info = await mod.getCompilationInfo();
      var errs = info.messages.filter(function (m) { return m.type === 'error'; });
      if (errs.length) {
        throw new Error('WGSL-Fehler in ' + label + ': ' + errs.map(function (m) { return m.lineNum + ':' + m.linePos + ' ' + m.message; }).join(' | '));
      }
    }
    return mod;
  }

  DF.createWebGPUScene = async function (canvas, opts) {
    if (!('gpu' in navigator) || !navigator.gpu) throw new Error('navigator.gpu fehlt');
    var adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('Kein WebGPU-Adapter');
    var device = await adapter.requestDevice();
    var ctx = canvas.getContext('webgpu');
    if (!ctx) throw new Error('Kein webgpu-Kontext');
    var format = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device: device, format: format, alphaMode: 'opaque' });

    var lost = false;
    device.lost.then(function (info) {
      lost = true;
      if (info.reason !== 'destroyed' && opts.onLost) opts.onLost(info.message || 'device lost');
    });
    device.addEventListener('uncapturederror', function (e) {
      console.error('[Tragwerk] WebGPU-Fehler:', e.error && e.error.message);
      if (opts.onLost && !lost) { lost = true; opts.onLost('uncaptured error'); }
    });

    device.pushErrorScope('validation');
    var mods = await Promise.all([
      compile(device, COMPUTE, 'compute'), compile(device, PARTICLES, 'particles'),
      compile(device, SLABS, 'slabs'), compile(device, BACKGROUND, 'background')
    ]);
    var SAMPLES = 4, DEPTH = 'depth24plus';
    var blendAdd = { color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' }, alpha: { srcFactor: 'zero', dstFactor: 'one', operation: 'add' } };
    var pipes = await Promise.all([
      device.createComputePipelineAsync({ layout: 'auto', compute: { module: mods[0], entryPoint: 'main' } }),
      device.createRenderPipelineAsync({
        layout: 'auto',
        vertex: { module: mods[1], entryPoint: 'vs' },
        fragment: { module: mods[1], entryPoint: 'fs', targets: [{ format: format, blend: blendAdd }] },
        primitive: { topology: 'triangle-list' },
        depthStencil: { format: DEPTH, depthWriteEnabled: false, depthCompare: 'less-equal' },
        multisample: { count: SAMPLES }
      }),
      device.createRenderPipelineAsync({
        layout: 'auto',
        vertex: {
          module: mods[2], entryPoint: 'vs',
          buffers: [{ arrayStride: 28, attributes: [
            { shaderLocation: 0, offset: 0, format: 'float32x3' },
            { shaderLocation: 1, offset: 12, format: 'float32x3' },
            { shaderLocation: 2, offset: 24, format: 'float32' }] }]
        },
        fragment: { module: mods[2], entryPoint: 'fs', targets: [{ format: format }] },
        primitive: { topology: 'triangle-list', cullMode: 'none' },
        depthStencil: { format: DEPTH, depthWriteEnabled: true, depthCompare: 'less' },
        multisample: { count: SAMPLES }
      }),
      device.createRenderPipelineAsync({
        layout: 'auto',
        vertex: { module: mods[3], entryPoint: 'vs' },
        fragment: { module: mods[3], entryPoint: 'fs', targets: [{ format: format }] },
        primitive: { topology: 'triangle-list' },
        depthStencil: { format: DEPTH, depthWriteEnabled: false, depthCompare: 'always' },
        multisample: { count: SAMPLES }
      })
    ]);
    var computePipe = pipes[0], partPipe = pipes[1], slabPipe = pipes[2], bgPipe = pipes[3];

    var N = opts.particles;
    var uniformBuf = device.createBuffer({ size: 256, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    var pdata = DF.initParticles(N);
    var partBuf = device.createBuffer({ size: pdata.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(partBuf, 0, pdata);
    var mesh = DF.buildSlabMesh();
    var meshBuf = device.createBuffer({ size: mesh.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(meshBuf, 0, mesh);
    var meshCount = mesh.length / 7;

    function bg(pipe, withParticles) {
      var entries = [{ binding: 0, resource: { buffer: uniformBuf } }];
      if (withParticles) entries.push({ binding: 1, resource: { buffer: partBuf } });
      return device.createBindGroup({ layout: pipe.getBindGroupLayout(0), entries: entries });
    }
    var computeBG = bg(computePipe, true), partBG = bg(partPipe, true), slabBG = bg(slabPipe, false), bgBG = bg(bgPipe, false);
    var err = await device.popErrorScope();
    if (err) throw new Error('WebGPU-Validierung: ' + err.message);

    var msaaTex = null, depthTex = null, texW = 0, texH = 0;
    function ensureTargets() {
      var w = canvas.width, h = canvas.height;
      if (w === texW && h === texH && msaaTex) return;
      if (msaaTex) msaaTex.destroy();
      if (depthTex) depthTex.destroy();
      msaaTex = device.createTexture({ size: [w, h], sampleCount: SAMPLES, format: format, usage: GPUTextureUsage.RENDER_ATTACHMENT });
      depthTex = device.createTexture({ size: [w, h], sampleCount: SAMPLES, format: DEPTH, usage: GPUTextureUsage.RENDER_ATTACHMENT });
      texW = w; texH = h;
    }

    var U = new Float32Array(64);
    function render(fr) {
      if (lost) return;
      ensureTargets();
      U.set(fr.viewProj, 0);
      U.set([fr.eye[0], fr.eye[1], fr.eye[2], fr.time], 16);
      U.set([fr.mousePx[0], fr.mousePx[1], fr.mouseWorld[0], fr.mouseWorld[1]], 20);
      U.set([fr.formA, fr.formB, fr.blend, fr.dt], 24);
      U.set([fr.ratio, fr.stress, fr.pulse, fr.explode], 28);
      U.set([canvas.width, canvas.height, fr.reduced ? 1 : 0, fr.dpr], 32);
      U.set([fr.bgA[0], fr.bgA[1], fr.bgA[2], 1], 36);
      U.set([fr.bgB[0], fr.bgB[1], fr.bgB[2], 1], 40);
      U.set([fr.wipe, N, fr.intensity, fr.mouseActive], 44);
      U.set([fr.glow[0], fr.glow[1], fr.glow[2], fr.glow[3]], 48);
      U.set([fr.proj00, fr.proj11, fr.slabScale, fr.slabLift], 52);
      device.queue.writeBuffer(uniformBuf, 0, U);

      var enc = device.createCommandEncoder();
      var cp = enc.beginComputePass();
      cp.setPipeline(computePipe); cp.setBindGroup(0, computeBG);
      cp.dispatchWorkgroups(Math.ceil(N / 64));
      cp.end();
      var rp = enc.beginRenderPass({
        colorAttachments: [{ view: msaaTex.createView(), resolveTarget: ctx.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'discard', clearValue: { r: 0.012, g: 0.1, b: 0.24, a: 1 } }],
        depthStencilAttachment: { view: depthTex.createView(), depthLoadOp: 'clear', depthClearValue: 1, depthStoreOp: 'discard' }
      });
      rp.setPipeline(bgPipe); rp.setBindGroup(0, bgBG); rp.draw(3);
      rp.setPipeline(slabPipe); rp.setBindGroup(0, slabBG); rp.setVertexBuffer(0, meshBuf); rp.draw(meshCount);
      rp.setPipeline(partPipe); rp.setBindGroup(0, partBG); rp.draw(6, N);
      rp.end();
      device.queue.submit([enc.finish()]);
    }

    return {
      kind: 'webgpu',
      particles: N,
      adapterInfo: adapter.info ? (adapter.info.vendor + ' ' + adapter.info.architecture).trim() : '',
      render: render,
      destroy: function () { try { device.destroy(); } catch (e) { /* egal */ } }
    };
  };
})();
