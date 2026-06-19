// Generate a self-contained INTERACTIVE WebGPU explorer page. It precomputes the Coxeter mirror sets for a
// list of tilings (so the browser needs no math library), embeds the fold shaders and a vanilla-JS WebGPU app,
// and writes make/render/web/index.html. Open it in a WebGPU browser (Chrome / Edge) to fly the tilings live:
//   2D, drag to pan (a Mobius glide), wheel to zoom, number keys to switch tiling.
//   3D, drag to orbit the {5,3,4} dodecagrid, wheel to dive through it, I toggles the interior corridor view.
// Run: pnpm tsx code/render/run/web-export.ts
//
// This is the "webgpu for everything" interactive layer. The headless runners prove the shaders; this hands
// them a live camera in the browser. See note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mirrorFrame } from '@/code/substrate/coxeter/schlafli'
import {
  FOLD_2D_WGSL,
  FOLD_3D_WGSL,
  FOLD_3D_INTERIOR_WGSL,
} from '@/code/render/fold.wgsl'

const TWO_D = ['7-3', '5-4', '8-3', '6-4', '4-5', '5-5', '7-4', '3-7']
const THREE_D = ['5-3-4', '4-3-5', '3-5-3']

// the mirror normals in a canonical Minkowski basis with the timelike axis LAST (metric diag(+..,-1))
function canonicalMirrors(symbol: number[]): number[][] {
  const frame = mirrorFrame(symbol)
  const dim = frame.metric.length
  const order: number[] = []
  for (let a = 0; a < dim; a++)
    if ((frame.metric[a] ?? 1) > 0) order.push(a)
  for (let a = 0; a < dim; a++)
    if ((frame.metric[a] ?? 1) < 0) order.push(a)
  return frame.normals.map(row => order.map(a => row[a] ?? 0))
}

function run(): void {
  const mirrors: Record<string, number[][]> = {}
  for (const s of [...TWO_D, ...THREE_D]) {
    try {
      mirrors[s] = canonicalMirrors(s.split('-').map(Number))
    } catch (error) {
      console.log(`skip ${s}: ${(error as Error).message}`)
    }
  }

  const html = page({
    mirrors,
    twoD: TWO_D.filter(s => mirrors[s]),
    threeD: THREE_D.filter(s => mirrors[s]),
  })
  const outDir = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    '..',
    'make',
    'render',
    'web',
  )
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, 'index.html')
  writeFileSync(outPath, html)
  console.log(`wrote the interactive WebGPU explorer to ${outPath}`)
  console.log(
    `open it in a WebGPU browser (Chrome/Edge). 2D: drag to pan, wheel to zoom, number keys to switch tiling. 3D: drag to orbit, wheel to dive, I = interior.`,
  )
}

function page(input: {
  mirrors: Record<string, number[][]>
  twoD: string[]
  threeD: string[]
}): string {
  const data = JSON.stringify(input)
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Hyperbolic tiling explorer (WebGPU)</title>
<style>
  html, body { margin: 0; height: 100%; background: #0a0a0e; color: #cfc9e6; font: 13px/1.5 ui-monospace, monospace; overflow: hidden; }
  #c { display: block; width: 100vw; height: 100vh; touch-action: none; cursor: grab; }
  #c:active { cursor: grabbing; }
  #ui { position: fixed; top: 10px; left: 12px; pointer-events: none; text-shadow: 0 1px 2px #000; }
  #ui b { color: #b9a8ff; }
  #err { position: fixed; inset: 0; display: grid; place-items: center; padding: 2rem; text-align: center; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="ui"></div>
<script type="module">
const DATA = ${data};
const FOLD_2D = ${JSON.stringify(FOLD_2D_WGSL)};
const FOLD_3D = ${JSON.stringify(FOLD_3D_WGSL)};
const FOLD_3D_INTERIOR = ${JSON.stringify(FOLD_3D_INTERIOR_WGSL)};
${APP_JS}
</script>
</body>
</html>
`
}

// the browser app (runs in the page, not in Node). Kept as a string so this Node script can emit it.
const APP_JS = /* js */ `
const canvas = document.getElementById('c');
const ui = document.getElementById('ui');
const fail = (m) => { document.body.innerHTML = '<div id="err">' + m + '</div>'; };

async function main() {
  if (!navigator.gpu) return fail('This browser has no WebGPU. Try Chrome or Edge.');
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return fail('No WebGPU adapter (GPU) available.');
  const device = await adapter.requestDevice();
  const ctx = canvas.getContext('webgpu');
  const format = navigator.gpu.getPreferredCanvasFormat();
  ctx.configure({ device, format, alphaMode: 'opaque' });

  // state: which tiling, which mode, and the camera
  const twoD = DATA.twoD, threeD = DATA.threeD;
  let mode = '2d';         // '2d' | '3d' | '3d-inside'
  let symbol = twoD[0];
  let pan = [0, 0], zoom = 1;            // 2D camera
  let orbitX = 0.45, orbitY = 0.6, dive = 0; // 3D camera (orbit angles + Mobius dive distance)

  const shaderFor = (m) => m === '2d' ? FOLD_2D : m === '3d-inside' ? FOLD_3D_INTERIOR : FOLD_3D;
  const pipelines = {};
  function pipeline(m) {
    if (pipelines[m]) return pipelines[m];
    const module = device.createShaderModule({ code: shaderFor(m) });
    const p = device.createRenderPipeline({ layout: 'auto', vertex: { module, entryPoint: 'vs' },
      fragment: { module, entryPoint: 'fs', targets: [{ format }] }, primitive: { topology: 'triangle-list' } });
    pipelines[m] = p; return p;
  }
  const uniform = device.createBuffer({ size: 128, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
  }
  window.addEventListener('resize', resize); resize();

  function writeUniform() {
    const m = DATA.mirrors[symbol];
    const buf = new ArrayBuffer(128);
    const f = new Float32Array(buf), u = new Uint32Array(buf);
    if (mode === '2d') {
      for (let i = 0; i < 3; i++) { f[i*4] = m[i][0]; f[i*4+1] = m[i][1]; f[i*4+2] = m[i][2]; }
      f[12] = pan[0]; f[13] = pan[1]; f[14] = zoom; f[15] = 0;
      u[16] = 220; f[17] = 0.012;
    } else {
      for (let i = 0; i < 4; i++) { f[i*4] = m[i][0]; f[i*4+1] = m[i][1]; f[i*4+2] = m[i][2]; f[i*4+3] = m[i][3]; }
      const inside = mode === '3d-inside';
      // eye orbits the ball (outside) or sits within it (interior view)
      const R = inside ? 0.0 : 2.4;
      const ex = R * Math.sin(orbitY) * Math.cos(orbitX);
      const ey = R * Math.sin(orbitX);
      const ez = R * Math.cos(orbitY) * Math.cos(orbitX);
      f[16] = inside ? 0 : ex; f[17] = inside ? 0 : ey; f[18] = inside ? -0.08 : (ez || 2.4); f[19] = 0;
      // cam = Mobius world-shift along +z by the dive distance
      const t = Math.tanh(dive / 2);
      f[20] = 0; f[21] = 0; f[22] = -t; f[23] = 0;
      u[24] = 200; f[25] = inside ? 0.05 : 0.06; f[26] = inside ? 0.0008 : 0.0007; f[27] = 700;
    }
    device.queue.writeBuffer(uniform, 0, buf);
  }

  function frame() {
    writeUniform();
    const p = pipeline(mode);
    const bind = device.createBindGroup({ layout: p.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: uniform } }] });
    const enc = device.createCommandEncoder();
    const pass = enc.beginRenderPass({ colorAttachments: [{ view: ctx.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0.04, g: 0.04, b: 0.06, a: 1 } }] });
    pass.setPipeline(p); pass.setBindGroup(0, bind); pass.draw(3); pass.end();
    device.queue.submit([enc.finish()]);
    ui.innerHTML = '<b>{' + symbol.split('-').join(',') + '}</b> &middot; ' + mode +
      '<br>drag: ' + (mode === '2d' ? 'pan' : 'orbit') + ' &middot; wheel: ' + (mode === '2d' ? 'zoom' : 'dive') +
      '<br>keys 1-' + (mode === '2d' ? twoD.length : threeD.length) + ': tiling &middot; M: 2D/3D &middot; I: interior';
    requestAnimationFrame(frame);
  }

  // --- input ---
  let dragging = false, lastX = 0, lastY = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = (e.clientX - lastX) / canvas.clientHeight, dy = (e.clientY - lastY) / canvas.clientHeight;
    lastX = e.clientX; lastY = e.clientY;
    if (mode === '2d') {
      pan[0] = Math.max(-0.985, Math.min(0.985, pan[0] - dx * 1.6 / zoom));
      pan[1] = Math.max(-0.985, Math.min(0.985, pan[1] + dy * 1.6 / zoom));
    } else {
      orbitY -= dx * 2.5; orbitX = Math.max(-1.5, Math.min(1.5, orbitX + dy * 2.5));
    }
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (mode === '2d') zoom = Math.max(0.2, Math.min(40, zoom * Math.exp(-e.deltaY * 0.001)));
    else dive = Math.max(0, Math.min(6, dive - e.deltaY * 0.002));
  }, { passive: false });
  window.addEventListener('keydown', (e) => {
    const list = mode === '2d' ? twoD : threeD;
    const n = parseInt(e.key, 10);
    if (!isNaN(n) && n >= 1 && n <= list.length) symbol = list[n - 1];
    if (e.key === 'm' || e.key === 'M') { mode = mode === '2d' ? '3d' : '2d'; symbol = (mode === '2d' ? twoD : threeD)[0]; pan = [0,0]; zoom = 1; dive = 0; }
    if (e.key === 'i' || e.key === 'I') { if (mode !== '2d') mode = mode === '3d' ? '3d-inside' : '3d'; }
  });

  requestAnimationFrame(frame);
}
main();
`

run()
