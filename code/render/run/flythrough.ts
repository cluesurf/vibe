// FLY INSIDE a 3D hyperbolic honeycomb on the GPU. The camera sits inside the Poincare ball and a Mobius
// world-shift (the cam uniform) boosts the whole honeycomb past it along a geodesic, so you fly forward through
// the dodecahedral cells of {5,3,4} (or any {p,q,r}). Each frame is sphere-traced by the fold shader (the
// fundamental-domain renderer, constant cost per pixel, no cell enumeration), read back, and encoded to one
// animated GIF. This is the "webgpu for everything" 3D view, the raymarcher flythrough.
// Run: pnpm tsx code/render/run/flythrough.ts [symbol]   e.g. pnpm tsx code/render/run/flythrough.ts 5-3-4

import { create, globals } from 'webgpu'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mirrorFrame } from '@/code/substrate/coxeter/schlafli'
import { encodePng } from '@/code/draw/png'
import { encodeGif } from '@/code/draw/gif'
import { FOLD_3D_WGSL, FOLD_3D_INTERIOR_WGSL } from '@/code/render/fold.wgsl'

Object.assign(globalThis, globals)
const navigator = { gpu: create([]) }

const SIZE = 512 // per-frame side length, SIZE*4 is 256-aligned (no readback row padding)
const FRAMES = 60
const ITERATIONS = 200

// the mirror normals in a canonical Minkowski basis with the timelike axis LAST (metric diag(1,1,1,-1))
function canonicalMirrors(symbol: number[]): number[][] {
  const frame = mirrorFrame(symbol)
  const dim = frame.metric.length
  const order: number[] = []
  for (let a = 0; a < dim; a++) if ((frame.metric[a] ?? 1) > 0) order.push(a)
  for (let a = 0; a < dim; a++) if ((frame.metric[a] ?? 1) < 0) order.push(a)
  return frame.normals.map((row) => order.map((a) => row[a] ?? 0))
}

// the camera ball point a hyperbolic distance `dist` along +z (tanh(dist/2) in the Poincare ball)
function flightPoint(dist: number): [number, number, number] {
  return [0, 0, Math.tanh(dist / 2)]
}

function writeUniform(device: GPUDevice, buffer: GPUBuffer, mirrors: number[][], camNeg: [number, number, number], inside: boolean): void {
  const data = new ArrayBuffer(112)
  const f = new Float32Array(data)
  const u = new Uint32Array(data)
  for (let i = 0; i < 4; i++) {
    f[i * 4 + 0] = mirrors[i]?.[0] ?? 0
    f[i * 4 + 1] = mirrors[i]?.[1] ?? 0
    f[i * 4 + 2] = mirrors[i]?.[2] ?? 0
    f[i * 4 + 3] = mirrors[i]?.[3] ?? 0
  }
  // inside, the eye sits within the ball flying through the beam-lattice corridors; dive, outside looking in
  if (inside) { f[16] = 0; f[17] = 0; f[18] = -0.08; f[19] = 0 } else { f[16] = 0; f[17] = 0; f[18] = 2.4; f[19] = 0 }
  // cam = the negated camera point, the Mobius world-shift that flies the honeycomb past the camera
  f[20] = camNeg[0]; f[21] = camNeg[1]; f[22] = camNeg[2]; f[23] = 0
  u[24] = ITERATIONS
  f[25] = inside ? 0.16 : 0.06 // edgeWidth, thicker beams for the interior view
  f[26] = 0.0008 // detail
  f[27] = 700 // maxSteps
  device.queue.writeBuffer(buffer, 0, data)
}

async function run(): Promise<void> {
  const arg = process.argv[2] ?? '5-3-4'
  const mode = process.argv[3] ?? 'inside' // 'inside' (corridor beams) or 'dive' (from outside)
  const inside = mode !== 'dive'
  const symbol = arg.split('-').map(Number)
  if (symbol.length < 3) throw new Error('flythrough is for 3D honeycombs, e.g. 5-3-4')
  const mirrors = canonicalMirrors(symbol)

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.log('no WebGPU adapter available (needs a GPU). The flythrough is written and runs where an adapter is present.')
    return
  }
  const device = await adapter.requestDevice()
  const module = device.createShaderModule({ code: inside ? FOLD_3D_INTERIOR_WGSL : FOLD_3D_WGSL })
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module, entryPoint: 'vs' },
    fragment: { module, entryPoint: 'fs', targets: [{ format: 'rgba8unorm' }] },
    primitive: { topology: 'triangle-list' },
  })
  const uniform = device.createBuffer({ size: 112, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST })
  const target = device.createTexture({
    size: { width: SIZE, height: SIZE },
    format: 'rgba8unorm',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  })
  const bind = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: uniform } }] })
  const bytesPerRow = SIZE * 4
  const readback = device.createBuffer({ size: bytesPerRow * SIZE, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ })

  // fly forward by one cell period over the loop (so it repeats seamlessly through the periodic honeycomb)
  const period = 1.45
  const frames: Uint8Array[] = []
  for (let frame = 0; frame < FRAMES; frame++) {
    const dist = (frame / FRAMES) * period
    const fp = flightPoint(dist)
    writeUniform(device, uniform, mirrors, [-fp[0], -fp[1], -fp[2]], inside)

    const enc = device.createCommandEncoder()
    const pass = enc.beginRenderPass({ colorAttachments: [{ view: target.createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 1 } }] })
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bind)
    pass.draw(3)
    pass.end()
    enc.copyTextureToBuffer({ texture: target }, { buffer: readback, bytesPerRow, rowsPerImage: SIZE }, { width: SIZE, height: SIZE })
    device.queue.submit([enc.finish()])
    await readback.mapAsync(GPUMapMode.READ)
    const rgba = new Uint8Array(readback.getMappedRange().slice(0))
    readback.unmap()
    frames.push(rgba)
    if (frame === 0 || frame === Math.floor(FRAMES / 2)) {
      const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'make', 'render', 'flythrough')
      mkdirSync(outDir, { recursive: true })
      writeFileSync(join(outDir, `flythrough-${arg}-${mode}-frame${frame}.png`), encodePng(rgba, SIZE, SIZE))
    }
  }

  const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'make', 'render', 'flythrough')
  mkdirSync(outDir, { recursive: true })
  const gif = encodeGif({ frames, width: SIZE, height: SIZE, delayMs: 60 })
  writeFileSync(join(outDir, `flythrough-${arg}-${mode}.gif`), gif)
  console.log(`flew through {${symbol.join(',')}} (${mode}), wrote flythrough-${arg}-${mode}.gif  ${(gif.length / 1024).toFixed(0)} KB  ${FRAMES} frames  ${SIZE}x${SIZE}`)
}

run()
