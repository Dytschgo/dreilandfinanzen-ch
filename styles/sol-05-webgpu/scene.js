/* No libraries, imports or asset fetches: also works from file://.
 * Compute: 1,024 orbital particles. Render: shaded, extruded planes + analytic grid.
 * Uniforms: viewport/time/motion, pointer/scroll/pressure, reserve/scene.
 */
(() => {
  'use strict';
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const diagnostics = window.__sceneDiagnostics = { path: 'initializing', frames: 0, errors: [], reducedMotion: motionQuery.matches, paused: false, maxDpr: 1.5, particleCount: 1024 };
  const state = { pressure: .31, reserve: .23, scroll: 0, pointer: [0, 0], paused: false, time: 0 };
  const roots = [document.getElementById('hero-scene'), document.getElementById('budget-scene')];
  let scenes = [], frameId = 0, lastTick = 0, initializing = true, destroyed = false;
  const common = `
    struct Uniforms { viewport: vec4f, interaction: vec4f, budget: vec4f };
    @group(0) @binding(0) var<uniform> u: Uniforms;
    fn project(p: vec3f) -> vec4f {
      let angle = -0.22 + u.interaction.x * 0.13 + u.interaction.z * 0.22;
      let x = p.x * cos(angle) - p.z * sin(angle);
      let z = p.x * sin(angle) + p.z * cos(angle);
      let screenX = (x - z) * 0.866;
      let screenY = p.y * 0.94 + (x + z) * 0.5;
      let aspect = u.viewport.x / max(u.viewport.y, 1.0);
      let zoom = select(3.15, 3.5, u.budget.y > 0.5);
      return vec4f(screenX / (zoom * aspect), (screenY - 0.15) / zoom, 0.5 - p.y * 0.038 + (x + z) * 0.026, 1.0);
    }
    fn palette(i: u32) -> vec3f {
      if (i == 0u) { return vec3f(0.085, 0.34, 0.64); }
      if (i == 1u) { return vec3f(0.84, 0.66, 0.32); }
      return vec3f(0.78, 0.14, 0.21);
    }
  `;
  const planeShader = common + `
    struct VertexOut { @builtin(position) position: vec4f, @location(0) local: vec3f, @location(1) normal: vec3f, @location(2) color: vec3f };
    @vertex fn vs(@location(0) local: vec3f, @location(1) normal: vec3f, @builtin(instance_index) id: u32) -> VertexOut {
      let t = u.viewport.z;
      let pressure = u.interaction.w;
      let gap = 1.05 - pressure * 0.8;
      var centre = vec3f(-0.62, gap, -0.15);
      if (id == 1u) { centre = vec3f(0.63, 1.45 + gap * 0.4, -0.52); }
      if (id == 2u) { centre = vec3f(0.16, -gap * 0.7, 0.68); }
      centre.y += sin(t * 0.46 + f32(id) * 1.8) * 0.06 * u.viewport.w;
      centre.y += u.interaction.y * 0.12;
      let angle = (f32(id) - 1.0) * 0.045 + sin(t * 0.19) * 0.018 * u.viewport.w;
      let size = vec3f(1.34, 0.10 + pressure * 0.22, 0.9);
      let p = local * size;
      let rotated = vec3f(p.x * cos(angle) - p.z * sin(angle), p.y, p.x * sin(angle) + p.z * cos(angle));
      var out: VertexOut;
      out.position = project(rotated + centre);
      out.local = local; out.normal = normal;
      out.color = palette(id);
      return out;
    }
    @fragment fn fs(v: VertexOut) -> @location(0) vec4f {
      let light = normalize(vec3f(-0.4, 0.9, 0.6));
      let diffuse = max(dot(v.normal, light), 0.0);
      var color = v.color * (0.42 + diffuse * 0.72);
      let top = step(0.8, v.normal.y);
      let edge = smoothstep(0.96, 0.993, max(abs(v.local.x), abs(v.local.z))) * top;
      color += vec3f(0.25, 0.23, 0.19) * edge;
      let lineX = 1.0 - smoothstep(0.012, 0.025, abs(fract(v.local.x * 7.0 + 0.5) - 0.5));
      let lineZ = 1.0 - smoothstep(0.012, 0.025, abs(fract(v.local.z * 5.0 + 0.5) - 0.5));
      color += (lineX + lineZ) * 0.028 * top;
      let sheen = pow(max(0.0, 1.0 - abs(v.local.x + v.local.z * 0.4) * 0.4), 8.0);
      color += vec3f(0.11, 0.12, 0.14) * sheen * top;
      return vec4f(color, 1.0);
    }
  `;
  const computeShader = common + `
    @group(0) @binding(1) var<storage, read_write> particles: array<vec4f>;
    fn hash(x: f32) -> f32 { return fract(sin(x * 127.1 + 311.7) * 43758.5453); }
    @compute @workgroup_size(64) fn cs(@builtin(global_invocation_id) gid: vec3u) {
      let i = gid.x; if (i >= 1024u) { return; }
      let f = f32(i);
      let t = u.viewport.z * 0.055;
      let ring = 2.0 + hash(f + 1.0) * 1.6 + u.interaction.w * 0.3;
      let angle = f * 2.3999632 + t * (0.4 + hash(f + 2.0));
      let y = (hash(f + 3.0) - 0.5) * 2.2 + sin(angle * 2.0 + t) * 0.22;
      particles[i] = vec4f(cos(angle) * ring, y, sin(angle) * ring, 0.15 + hash(f + 4.0) * 0.75);
    }
  `;
  const particleShader = common + `
    @group(0) @binding(1) var<storage, read> particles: array<vec4f>;
    struct Out { @builtin(position) position: vec4f, @location(0) uv: vec2f, @location(1) alpha: f32 };
    @vertex fn vs(@builtin(vertex_index) vid: u32, @builtin(instance_index) id: u32) -> Out {
      let corners = array<vec2f, 6>(vec2f(-1,-1),vec2f(1,-1),vec2f(-1,1),vec2f(-1,1),vec2f(1,-1),vec2f(1,1));
      let p = particles[id]; let corner = corners[vid];
      var out: Out; out.position = project(p.xyz);
      out.position.x += corner.x * 1.25 / u.viewport.x;
      out.position.y += corner.y * 1.25 / u.viewport.y;
      out.uv = corner; out.alpha = p.w; return out;
    }
    @fragment fn fs(v: Out) -> @location(0) vec4f {
      let a = (1.0 - smoothstep(0.0, 1.0, length(v.uv))) * v.alpha * 0.62;
      return vec4f(0.60, 0.72, 0.87, a);
    }
  `;
  const floorShader = common + `
    struct Out { @builtin(position) position: vec4f, @location(0) uv: vec2f };
    @vertex fn vs(@builtin(vertex_index) i: u32) -> Out {
      let points = array<vec2f, 3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3));
      var o: Out; o.position = vec4f(points[i], 0.99, 1); o.uv = points[i]; return o;
    }
    @fragment fn fs(v: Out) -> @location(0) vec4f {
      let aspect = u.viewport.x / u.viewport.y;
      let p = vec2f(v.uv.x * aspect, v.uv.y + 0.25);
      let a = vec2f(p.x * 0.866 + p.y, -p.x * 0.866 + p.y) * 8.0;
      let fw = max(fwidth(a), vec2f(0.001));
      let grid = abs(fract(a - 0.5) - 0.5) / fw;
      let line = 1.0 - min(min(grid.x, grid.y), 1.0);
      let fade = exp(-dot(p, p) * 1.2);
      let ellipse = length(vec2f(p.x, p.y * 2.0));
      let ring = (1.0 - smoothstep(0.002, 0.006, abs(ellipse - 0.83))) * 0.10;
      let glow = exp(-dot(p, p) * 3.0) * 0.035;
      let alpha = (line * 0.10 + ring + glow) * fade;
      return vec4f(0.30, 0.46, 0.65, alpha);
    }
  `;

  function cubeData() {
    const faces = [
      [[0,1,0],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]]],
      [[0,-1,0],[[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]]],
      [[1,0,0],[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]]],
      [[-1,0,0],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]]],
      [[0,0,1],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]],
      [[0,0,-1],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]]
    ];
    return new Float32Array(faces.flatMap(([n, verts]) => [0,1,2,0,2,3].flatMap(i => [...verts[i], ...n])));
  }

  class GPUScene {
    constructor(root, device, pipelines, index) {
      this.root = root; this.canvas = root.querySelector('canvas'); this.device = device; this.p = pipelines; this.index = index;
      this.context = this.canvas.getContext('webgpu');
      if (!this.context) throw Error('WebGPU canvas context unavailable');
      this.context.configure({ device, format: pipelines.format, alphaMode: 'premultiplied' });
      this.uniform = device.createBuffer({ size:48, usage:GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
      this.particles = device.createBuffer({ size:1024*16, usage:GPUBufferUsage.STORAGE });
      const entries = [{ binding:0, resource:{ buffer:this.uniform } }];
      this.groups = {};
      for (const key of ['plane','floor','particle','compute']) {
        this.groups[key] = device.createBindGroup({ layout: pipelines[key].getBindGroupLayout(0), entries: key === 'particle' || key === 'compute' ? [...entries,{ binding:1, resource:{ buffer:this.particles } }] : entries });
      }
      this.visible = true; this.width = 0; this.height = 0;
    }
    render(time) {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(this.root.clientWidth*dpr));
      const h = Math.max(1, Math.round(this.root.clientHeight*dpr));
      if (w !== this.width || h !== this.height) {
        this.width = this.canvas.width = w; this.height = this.canvas.height = h;
        this.depth?.destroy();
        this.depth = this.device.createTexture({ size:[w,h], format:'depth24plus', usage:GPUTextureUsage.RENDER_ATTACHMENT });
      }
      const calm = motionQuery.matches || state.paused;
      this.device.queue.writeBuffer(this.uniform, 0, new Float32Array([w,h,time,calm?0:1,calm?0:state.pointer[0],calm?0:state.pointer[1],calm?0:state.scroll,state.pressure,state.reserve,this.index,0,0]));
      const encoder = this.device.createCommandEncoder();
      const compute = encoder.beginComputePass();
      compute.setPipeline(this.p.compute); compute.setBindGroup(0,this.groups.compute); compute.dispatchWorkgroups(16); compute.end();
      const pass = encoder.beginRenderPass({ colorAttachments:[{ view:this.context.getCurrentTexture().createView(), clearValue:{r:0,g:0,b:0,a:0}, loadOp:'clear', storeOp:'store' }], depthStencilAttachment:{ view:this.depth.createView(), depthClearValue:1, depthLoadOp:'clear', depthStoreOp:'store' } });
      pass.setPipeline(this.p.floor); pass.setBindGroup(0,this.groups.floor); pass.draw(3);
      pass.setPipeline(this.p.plane); pass.setBindGroup(0,this.groups.plane); pass.setVertexBuffer(0,this.p.cube); pass.draw(36,3);
      pass.setPipeline(this.p.particle); pass.setBindGroup(0,this.groups.particle); pass.draw(6,1024);
      pass.end(); this.device.queue.submit([encoder.finish()]);
    }
    dispose() { this.depth?.destroy(); this.uniform.destroy(); this.particles.destroy(); this.context.unconfigure(); }
  }

  class FallbackScene {
    constructor(root, index) {
      this.root = root; this.index = index; this.visible = true;
      const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden','true');
      root.querySelector('canvas').replaceWith(canvas); this.canvas = canvas; this.ctx = canvas.getContext('2d');
    }
    render(time) {
      const ratio = Math.min(devicePixelRatio || 1, 1.5), w = this.root.clientWidth, h = this.root.clientHeight;
      if (this.canvas.width !== Math.round(w*ratio) || this.canvas.height !== Math.round(h*ratio)) {this.canvas.width=Math.round(w*ratio);this.canvas.height=Math.round(h*ratio);}
      const ctx = this.ctx; if (!ctx) return;
      ctx.setTransform(ratio,0,0,ratio,0,0); ctx.clearRect(0,0,w,h);
      const calm = motionQuery.matches || state.paused;
      const scale = this.index ? Math.min(w/7.2,h/4.6) : Math.min(w/6.1,h/5.7);
      const angle = -.22 + (calm?0:state.pointer[0]*.13+state.scroll*.22);
      const project = ([x,y,z]) => {const xx=x*Math.cos(angle)-z*Math.sin(angle),zz=x*Math.sin(angle)+z*Math.cos(angle);return [w/2+(xx-zz)*.866*scale,h*.52-(y*.94+(xx+zz)*.5-.15)*scale];};
      const line = (a,b,alpha) => {ctx.strokeStyle=`rgba(105,148,194,${alpha})`;ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();};
      for(let i=-7;i<=7;i++){line(project([i,-1.8,-7]),project([i,-1.8,7]),.09);line(project([-7,-1.8,i]),project([7,-1.8,i]),.09);}
      ctx.strokeStyle='rgba(108,154,207,.16)';ctx.beginPath();ctx.ellipse(w/2,h*.62,w*.36,h*.14,0,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<110;i++){let a=i*2.39996+time*.03,r=2.1+(Math.sin(i*81.7)*.5+.5)*1.3;let point=project([Math.cos(a)*r,Math.sin(i*42.1),Math.sin(a)*r]);ctx.fillStyle=`rgba(158,186,216,${.12+(i%5)*.06})`;ctx.fillRect(point[0],point[1],1,1);}
      const gap=1.05-state.pressure*.8, centres=[[-.62,gap,-.15],[.63,1.45+gap*.4,-.52],[.16,-gap*.7,.68]];
      const colors = [['#1d64a6','#0c396a','#164f87'],['#d4ae60','#80612c','#a58240'],['#ca3445','#75182a','#a42636']];
      // Back-to-front order: lower red plane, blue plane, elevated gold plane.
      for(const i of [2,0,1]){
        const c=[...centres[i]];if(!calm)c[1]+=Math.sin(time*.46+i*1.8)*.06+state.pointer[1]*.12;
        const height=.10+state.pressure*.22;
        const pts=[[-1.34,height,-.9],[1.34,height,-.9],[1.34,height,.9],[-1.34,height,.9],[-1.34,-height,-.9],[1.34,-height,-.9],[1.34,-height,.9],[-1.34,-height,.9]].map(p=>project(p.map((v,j)=>v+c[j])));
        const polygon=(ids,color)=>{ctx.beginPath();ids.forEach((p,k)=>k?ctx.lineTo(...pts[p]):ctx.moveTo(...pts[p]));ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='rgba(255,255,255,.14)';ctx.lineWidth=.7;ctx.stroke();};
        polygon([0,1,5,4],colors[i][1]);polygon([0,3,7,4],colors[i][2]);polygon([0,1,2,3],colors[i][0]);
        for(let j=-1;j<=1;j+=.33){line(project([c[0]+j,c[1]+height+.002,c[2]-.9]),project([c[0]+j,c[1]+height+.002,c[2]+.9]),.13);}
      }
    }
    dispose() {}
  }

  function setStatus(path, reason) {
    diagnostics.path=path; diagnostics.reason=reason || null;
    document.documentElement.dataset.renderer=path;
    const label = path==='webgpu'?'WebGPU · Echtzeit-Szene':'Canvas 2D · alternative Ansicht';
    document.getElementById('render-status').textContent=label;
  }
  function fallback(reason) {
    for(const scene of scenes) {try{scene.dispose();}catch{ /* Lost devices may already be disposed. */ }}
    scenes=roots.map((root,i)=>new FallbackScene(root,i));
    setStatus('canvas2d', reason); initializing=false; observe(); invalidate();
  }
  async function init() {
    if(!navigator.gpu){fallback('navigator.gpu unavailable');return;}
    try {
      const adapter=await navigator.gpu.requestAdapter();
      if(!adapter) throw Error('No WebGPU adapter');
      const device=await adapter.requestDevice();
      diagnostics.adapter = adapter.info ? {vendor:adapter.info.vendor, architecture:adapter.info.architecture, device:adapter.info.device, description:adapter.info.description} : {};
      device.addEventListener('uncapturederror',event=>{diagnostics.errors.push(event.error.message);if(diagnostics.path==='webgpu')fallback('WebGPU validation error');});
      device.lost.then(info=>{if(!destroyed)fallback('WebGPU device lost: '+info.reason);});
      const shaders = {};
      for(const [key,code] of Object.entries({plane:planeShader,compute:computeShader,particle:particleShader,floor:floorShader})){
        const module=device.createShaderModule({label:key,code});
        const info=await module.getCompilationInfo();
        const errors=info.messages.filter(message=>message.type==='error');
        if(errors.length)throw Error(key+': '+errors.map(e=>e.message).join('; '));
        shaders[key]=module;
      }
      device.pushErrorScope('validation');
      const format=navigator.gpu.getPreferredCanvasFormat();
      const blend={color:{srcFactor:'src-alpha',dstFactor:'one-minus-src-alpha'},alpha:{srcFactor:'one',dstFactor:'one-minus-src-alpha'}};
      const createRender = (key, buffers, depthWrite) => device.createRenderPipelineAsync({label:key,layout:'auto',vertex:{module:shaders[key],entryPoint:'vs',buffers},fragment:{module:shaders[key],entryPoint:'fs',targets:[{format,blend}]},primitive:{topology:'triangle-list',cullMode:'none'},depthStencil:{format:'depth24plus',depthWriteEnabled:depthWrite,depthCompare:'less-equal'}});
      const [plane,floor,particle,compute]=await Promise.all([
        createRender('plane',[{arrayStride:24,attributes:[{shaderLocation:0,offset:0,format:'float32x3'},{shaderLocation:1,offset:12,format:'float32x3'}]}],true),
        createRender('floor',[],false),createRender('particle',[],false),device.createComputePipelineAsync({layout:'auto',compute:{module:shaders.compute,entryPoint:'cs'}})
      ]);
      const error=await device.popErrorScope();if(error)throw Error(error.message);
      const data=cubeData(),cube=device.createBuffer({size:data.byteLength,usage:GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST});device.queue.writeBuffer(cube,0,data);
      const pipelines={format,plane,floor,particle,compute,cube};
      for(let i=0;i<roots.length;i++) scenes.push(new GPUScene(roots[i],device,pipelines,i));
      setStatus('webgpu');initializing=false;observe();invalidate();
    } catch(error) { diagnostics.errors.push(String(error));fallback(String(error)); }
  }
  let observer;
  function observe(){
    observer?.disconnect();observer=new IntersectionObserver(entries=>{for(const entry of entries){const scene=scenes.find(s=>s.root===entry.target);if(scene)scene.visible=entry.isIntersecting;}invalidate();},{rootMargin:'80px'});
    scenes.forEach(s=>observer.observe(s.root));
  }
  function frame(timestamp){
    frameId=0;if(document.hidden||initializing||destroyed)return;
    const calm=motionQuery.matches||state.paused;
    if(!calm&&lastTick)state.time+=Math.min((timestamp-lastTick)/1000,.05);
    lastTick=timestamp;
    for(const scene of scenes)if(scene.visible)scene.render(motionQuery.matches?0:state.time);
    diagnostics.frames++;diagnostics.activeScenes=scenes.filter(s=>s.visible).length;diagnostics.time=state.time;
    if(!calm&&scenes.some(s=>s.visible))frameId=requestAnimationFrame(frame);
  }
  function invalidate(){if(!frameId&&!document.hidden&&!initializing&&!destroyed)frameId=requestAnimationFrame(frame);}
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frameId);frameId=0;lastTick=0;diagnostics.hidden=document.hidden;if(!document.hidden)invalidate();});
  addEventListener('resize',invalidate,{passive:true});
  addEventListener('scroll',()=>{state.scroll=Math.min(scrollY/Math.max(innerHeight,1),1);if(!motionQuery.matches&&!state.paused)invalidate();},{passive:true});
  roots[0].addEventListener('pointermove',event=>{if(motionQuery.matches||state.paused)return;const box=roots[0].getBoundingClientRect();state.pointer=[(event.clientX-box.left)/box.width*2-1,1-(event.clientY-box.top)/box.height*2];invalidate();},{passive:true});
  roots[0].addEventListener('pointerleave',()=>{state.pointer=[0,0];if(!motionQuery.matches&&!state.paused)invalidate();});
  motionQuery.addEventListener('change',()=>{diagnostics.reducedMotion=motionQuery.matches;lastTick=0;updateButton();invalidate();});
  const button=document.querySelector('.motion-toggle');
  function updateButton(){button.disabled=motionQuery.matches;button.setAttribute('aria-pressed',String(state.paused||motionQuery.matches));button.innerHTML=motionQuery.matches?'Reduzierte Bewegung <span aria-hidden="true">—</span>':state.paused?'Bewegung fortsetzen <span aria-hidden="true">▷</span>':'Bewegung pausieren <span aria-hidden="true">Ⅱ</span>';}
  button.addEventListener('click',()=>{state.paused=!state.paused;diagnostics.paused=state.paused;lastTick=0;updateButton();invalidate();});
  window.addEventListener('budgetchange',event=>{state.pressure=event.detail.pressure;state.reserve=event.detail.reserve;diagnostics.budget={...event.detail};invalidate();});
  addEventListener('pagehide',event=>{if(event.persisted)return;destroyed=true;cancelAnimationFrame(frameId);observer?.disconnect();scenes.forEach(s=>s.dispose());});
  updateButton();init();
})();
