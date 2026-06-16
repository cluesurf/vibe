// Headless runner for the fundamental-domain "folding" renderer, via the `webgpu` package (Dawn).
// It builds the Coxeter mirror normals from mirrorFrame(symbol) (no hand-rolled angles), reorders
// them into a canonical Minkowski basis (time last), uploads them as a uniform, runs the fold
// fragment shader over a full-screen triangle into an offscreen texture, reads the pixels back,
// and writes make/render/fold/<symbol>.png. A 2-entry symbol like 7-3 renders the 2D {p,q} tiling
// in the Poincare disk. A 3-entry symbol like 5-3-4 raymarches the {p,q,r} honeycomb in the ball.
// Run: pnpm tsx code/render/run/fold.ts 7-3       (after `pnpm add webgpu`, needs a GPU adapter)
//      pnpm tsx code/render/run/fold.ts 5-4
//      pnpm tsx code/render/run/fold.ts 5-3-4

import { create, globals } from 'webgpu'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mirrorFrame } from '@/code/substrate/coxeter/schlafli'
import { encodePng } from '@/code/draw/png'
import { FOLD_2D_WGSL, FOLD_3D_WGSL } from '@/code/render/fold.wgsl'

Object.assign(globalThis, globals)
const navigator = { gpu: create([]) }

const SIZE = 1024 // image is SIZE x SIZE. SIZE * 4 is 256-aligned, so no row padding on readback.
const ITERATIONS = 200 // fold cap. deep / paracompact tilings need more, this is ample for {p,q} and {p,q,r}.

// The mirror normals in a canonical Minkowski basis with the timelike axis LAST, so the metric is
// diag(1, ..., 1, -1). mirrorFrame returns the timelike axis at an arbitrary index, the WGSL math
// assumes it is last, so reorder the columns to put every spacelike axis first and the one
// timelike axis last. The J-inner product of the normals still reproduces the Gram matrix.
function canonicalMirrors(symbol: number[]): number[][] {
  const frame = mirrorFrame(symbol)
  const dim = frame.metric.length
  const order: number[] = []
  for (let a = 0; a < dim; a++) if ((frame.metric[a] ?? 1) > 0) order.push(a)
  for (let a = 0; a < dim; a++) if ((frame.metric[a] ?? 1) < 0) order.push(a)
  return frame.normals.map((row) => order.map((a) => row[a] ?? 0))
}

function parseSymbol(text: string): number[] {
  const nums = text.split('-').map((part) => Number(part.trim()))
  if (nums.some((n) => !Number.isInteger(n) || n < 2)) {
    throw new Error(`bad symbol "${text}", expected dash-separated integers like 7-3 or 5-3-4`)
  }
  return nums
}

async function readTexture(input: {
  device: GPUDevice
  module: GPUShaderModule
  uniform: GPUBuffer
}): Promise<Uint8Array> {
  const { device, module, uniform } = input
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module, entryPoint: 'vs' },
    fragment: { module, entryPoint: 'fs', targets: [{ format: 'rgba8unorm' }] },
    primitive: { topology: 'triangle-list' },
  })
  const target = device.createTexture({
    size: { width: SIZE, height: SIZE },
    format: 'rgba8unorm',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  })
  const bind = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniform } }],
  })

  const enc = device.createCommandEncoder()
  const pass = enc.beginRenderPass({
    colorAttachments: [
      { view: target.createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 1 } },
    ],
  })
  pass.setPipeline(pipeline)
  pass.setBindGroup(0, bind)
  pass.draw(3)
  pass.end()

  const bytesPerRow = SIZE * 4
  const pixelBuffer = device.createBuffer({
    size: bytesPerRow * SIZE,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })
  enc.copyTextureToBuffer(
    { texture: target },
    { buffer: pixelBuffer, bytesPerRow, rowsPerImage: SIZE },
    { width: SIZE, height: SIZE },
  )
  device.queue.submit([enc.finish()])
  await pixelBuffer.mapAsync(GPUMapMode.READ)
  const rgba = new Uint8Array(pixelBuffer.getMappedRange().slice(0))
  pixelBuffer.unmap()
  return rgba
}

function buildUniform2D(device: GPUDevice, mirrors: number[][]): GPUBuffer {
  // Params: n0,n1,n2 (vec4), cam (vec4), iterations (u32), edgeWidth, 2 pads. 80 bytes.
  const data = new ArrayBuffer(80)
  const f = new Float32Array(data)
  const u = new Uint32Array(data)
  for (let i = 0; i < 3; i++) {
    f[i * 4 + 0] = mirrors[i]?.[0] ?? 0
    f[i * 4 + 1] = mirrors[i]?.[1] ?? 0
    f[i * 4 + 2] = mirrors[i]?.[2] ?? 0
    f[i * 4 + 3] = 0
  }
  // cam = (panX, panY, zoom, unused), identity = no pan, zoom 1 (the static view)
  f[12] = 0; f[13] = 0; f[14] = 1; f[15] = 0
  u[16] = ITERATIONS
  f[17] = 0.012 // edgeWidth in hyperboloid-distance units
  const buffer = device.createBuffer({ size: 80, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST })
  device.queue.writeBuffer(buffer, 0, data)
  return buffer
}

function buildUniform3D(device: GPUDevice, mirrors: number[][]): GPUBuffer {
  // Params: n0..n3 (vec4), eye (vec4), cam (vec4), iterations (u32), edgeWidth, detail, maxSteps. 112 bytes.
  const data = new ArrayBuffer(112)
  const f = new Float32Array(data)
  const u = new Uint32Array(data)
  for (let i = 0; i < 4; i++) {
    f[i * 4 + 0] = mirrors[i]?.[0] ?? 0
    f[i * 4 + 1] = mirrors[i]?.[1] ?? 0
    f[i * 4 + 2] = mirrors[i]?.[2] ?? 0
    f[i * 4 + 3] = mirrors[i]?.[3] ?? 0
  }
  // eye sits outside the unit ball looking at the center (the static, from-outside view)
  f[16] = 0.0; f[17] = 0.0; f[18] = 2.4; f[19] = 0.0
  // cam = 0, no Mobius world-shift, the identity (static) camera
  f[20] = 0.0; f[21] = 0.0; f[22] = 0.0; f[23] = 0.0
  u[24] = ITERATIONS
  f[25] = 0.06 // edgeWidth (honeycomb walls, thick enough for the sphere tracer to catch)
  f[26] = 0.0007 // detail (march hit threshold)
  f[27] = 600.0 // maxSteps
  const buffer = device.createBuffer({ size: 112, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST })
  device.queue.writeBuffer(buffer, 0, data)
  return buffer
}

async function run(): Promise<void> {
  const arg = process.argv[2] ?? '7-3'
  const symbol = parseSymbol(arg)
  const key = symbol.join('-')
  const threeD = symbol.length >= 3

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.log(
      'no WebGPU adapter available (needs a GPU, e.g. Metal on macOS). The fold renderer is written and will run where an adapter is present.',
    )
    return
  }
  const device = await adapter.requestDevice()

  const mirrors = canonicalMirrors(symbol)
  const module = device.createShaderModule({ code: threeD ? FOLD_3D_WGSL : FOLD_2D_WGSL })
  const uniform = threeD ? buildUniform3D(device, mirrors) : buildUniform2D(device, mirrors)
  const rgba = await readTexture({ device, module, uniform })

  const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'make', 'render', 'fold')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, `${key}.png`)
  writeFileSync(outPath, encodePng(rgba, SIZE, SIZE))
  console.log(
    `rendered {${symbol.join(',')}} ${threeD ? 'honeycomb (raymarch)' : 'tiling (Poincare disk)'} at ${SIZE}x${SIZE}, wrote ${outPath}`,
  )
}

run()
