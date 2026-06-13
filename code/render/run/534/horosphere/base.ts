// THE FULL PIPELINE, the Euclidean layer extracted from the evolved hyperbolic bulk, rendered.
// (1) build the {5,3,4} hyperbolic honeycomb with coordinates, (2) evolve it step by step on the GPU (the
// wave on the irregular bulk graph, via the `webgpu` package), (3) EXTRACT the horosphere, the flat
// Euclidean slice, as the cells in a Busemann level band, (4) project that slice to 2D and RENDER it to a
// PNG. So the flat space we see is genuinely built out of the hyperbolic space, not a separate flat grid.
//
// Honest scale note, the EXTRACTION needs float coordinates, which the coordinate engine holds reliably to
// about 15k to 60k cells before the precision wall. The bulk SIMULATION itself scales to millions via the
// fingerprint engine (run-bulk.ts), but the rendered horosphere extraction is coordinate-limited until the
// exact-coordinate horosphere generator is built (horosphere-extraction-algorithms.md). The {5,3,4}
// horosphere is also genuinely APERIODIC (the honeycomb is compact), so the slice is irregular, that is the
// real horosphere, not a tidy lattice. Run: pnpm tsx code/gpu/render-horosphere.ts   (after `pnpm add webgpu`)

import { create, globals } from 'webgpu'
import { TONE_COLORS } from '@/code/draw/color'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { BULK_STEP_WGSL } from '@/code/compute/wave.wgsl'
import { encodePng } from '@/code/draw/png'
import { pack, currentOf } from '@/code/tone/pack'
import { toCsr } from '@/code/tool/graph'
import { idealDirection, busemann, extractBand } from '@/code/substrate/horosphere'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

Object.assign(globalThis, globals)
const navigator = { gpu: create([]) }

const WORKGROUP = 256
const MAX_CELLS = 2500000 // ~2.5M bulk cells, the GPU adjacency-buffer ceiling (128 MiB), gives ~5800 band cells
const BEATS = 140
const IMG = 1200 // output image size in pixels
const LEVEL = 0 // the horosphere through the origin (a Busemann level set)
const HALF = 0.5 // band half-width in Busemann units, wider catches more cells of the aperiodic slice
const RADIUS = 2 // dot radius per horosphere cell, in pixels

const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0)

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.log('no WebGPU adapter available (needs a GPU)')
    return
  }
  const device = await adapter.requestDevice()

  // (1) build the hyperbolic bulk with coordinates
  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells: MAX_CELLS })
  const n = g.cellCount
  const coords = g.coords
  const dim = coords[0]!.length
  console.log(`built {5,3,4} bulk, ${n.toLocaleString()} cells (${dim}D ball coordinates)`)

  // Busemann function, the ideal point is the direction of the farthest cell, level sets are horospheres
  const xi = idealDirection(coords)
  const heights = busemann({ coords, ideal: xi })

  // (2) evolve the whole bulk on the GPU, the wave on the irregular CSR graph
  const { offsets, adj } = toCsr(g.neighbors)

  const seed = new Uint32Array(n)
  let rng = 2468013579 % 0x7fffffff
  const nextR = (): number => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff
    return rng / 0x7fffffff
  }
  for (let i = 0; i < n; i++) seed[i] = pack({ current: Math.floor(nextR() * 3), previous: Math.floor(nextR() * 3) })

  const byteLength = n * 4
  const params = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST })
  device.queue.writeBuffer(params, 0, new Uint32Array([n, 0, 0, 0]))
  const makeState = (): GPUBuffer =>
    device.createBuffer({ size: byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST })
  const bufs: [GPUBuffer, GPUBuffer] = [makeState(), makeState()]
  device.queue.writeBuffer(bufs[0], 0, seed)
  const offBuf = device.createBuffer({ size: offsets.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST })
  device.queue.writeBuffer(offBuf, 0, offsets)
  const adjBuf = device.createBuffer({ size: adj.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST })
  device.queue.writeBuffer(adjBuf, 0, adj)

  const module = device.createShaderModule({ code: BULK_STEP_WGSL })
  const pipeline = device.createComputePipeline({ layout: 'auto', compute: { module, entryPoint: 'main' } })
  const layout = pipeline.getBindGroupLayout(0)
  const bind = (read: GPUBuffer, write: GPUBuffer): GPUBindGroup =>
    device.createBindGroup({
      layout,
      entries: [
        { binding: 0, resource: { buffer: params } },
        { binding: 1, resource: { buffer: read } },
        { binding: 2, resource: { buffer: write } },
        { binding: 3, resource: { buffer: offBuf } },
        { binding: 4, resource: { buffer: adjBuf } },
      ],
    })
  const dispatch = Math.ceil(n / WORKGROUP)
  let src = 0
  for (let b = 0; b < BEATS; b++) {
    const enc = device.createCommandEncoder()
    const pass = enc.beginComputePass()
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bind(bufs[src]!, bufs[1 - src]!))
    pass.dispatchWorkgroups(dispatch)
    pass.end()
    device.queue.submit([enc.finish()])
    src = 1 - src
  }
  const staging = device.createBuffer({ size: byteLength, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ })
  {
    const enc = device.createCommandEncoder()
    enc.copyBufferToBuffer(bufs[src]!, 0, staging, 0, byteLength)
    device.queue.submit([enc.finish()])
  }
  await staging.mapAsync(GPUMapMode.READ)
  const tones = new Uint32Array(staging.getMappedRange().slice(0))
  staging.unmap()

  // (3) EXTRACT the horosphere, the cells in the Busemann band, and project them to 2D (the plane perp to xi)
  // an orthonormal basis e1, e2 of the plane perpendicular to the ideal direction xi
  const seedVec = (k: number): number[] => Array.from({ length: dim }, (_, i) => (i === k ? 1 : 0))
  const sub = (a: number[], b: number[], s: number): number[] => a.map((x, i) => x - s * b[i]!)
  const normalize = (v: number[]): number[] => {
    const m = norm(v)
    return v.map((x) => x / (m || 1))
  }
  // choose an axis least aligned with xi to start, then Gram-Schmidt twice
  let axis = 0
  for (let k = 1; k < dim; k++) if (Math.abs(xi[k]!) < Math.abs(xi[axis]!)) axis = k
  const e1 = normalize(sub(seedVec(axis), xi, dot(seedVec(axis), xi)))
  let axis2 = (axis + 1) % dim
  for (let k = 0; k < dim; k++) if (k !== axis && Math.abs(xi[k]!) < Math.abs(xi[axis2]!)) axis2 = k
  let e2raw = sub(seedVec(axis2), xi, dot(seedVec(axis2), xi))
  e2raw = sub(e2raw, e1, dot(e2raw, e1))
  const e2 = normalize(e2raw)

  type Cell = { u: number; v: number; tone: number }
  const band: Cell[] = []
  for (const i of extractBand({ busemann: heights, level: LEVEL, half: HALF })) {
    const x = coords[i]!
    const px = dot(x, xi)
    const proj = sub(x, xi, px) // component in the horosphere plane
    band.push({ u: dot(proj, e1), v: dot(proj, e2), tone: currentOf(tones[i]!) })
  }
  console.log(`horosphere band, ${band.length.toLocaleString()} cells extracted from the evolved bulk`)
  if (band.length === 0) {
    console.log('no cells in the band, widen HALF')
    return
  }

  // (4) RENDER, rasterize the band cells (coloured by tone) into an RGBA image and write a PNG
  let minU = Infinity
  let maxU = -Infinity
  let minV = Infinity
  let maxV = -Infinity
  for (const c of band) {
    minU = Math.min(minU, c.u)
    maxU = Math.max(maxU, c.u)
    minV = Math.min(minV, c.v)
    maxV = Math.max(maxV, c.v)
  }
  const pad = 40
  const spanU = maxU - minU || 1
  const spanV = maxV - minV || 1
  const span = Math.max(spanU, spanV)
  const rgba = new Uint8Array(IMG * IMG * 4)
  for (let i = 0; i < IMG * IMG; i++) {
    rgba[i * 4] = 10
    rgba[i * 4 + 1] = 10
    rgba[i * 4 + 2] = 11
    rgba[i * 4 + 3] = 255
  }
  const COLORS = TONE_COLORS
  for (const c of band) {
    if (c.tone === 0) continue // peace is black, draw only the charges
    const cx = pad + ((c.u - minU) / span) * (IMG - 2 * pad)
    const cy = pad + ((c.v - minV) / span) * (IMG - 2 * pad)
    const col = COLORS[c.tone]!
    for (let dy = -RADIUS; dy <= RADIUS; dy++) {
      for (let dx = -RADIUS; dx <= RADIUS; dx++) {
        if (dx * dx + dy * dy > RADIUS * RADIUS) continue
        const px = Math.round(cx + dx)
        const py = Math.round(cy + dy)
        if (px < 0 || px >= IMG || py < 0 || py >= IMG) continue
        const idx = (py * IMG + px) * 4
        rgba[idx] = col[0]
        rgba[idx + 1] = col[1]
        rgba[idx + 2] = col[2]
        rgba[idx + 3] = 255
      }
    }
  }

  const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'make')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, 'horosphere.png')
  writeFileSync(outPath, encodePng(rgba, IMG, IMG))
  console.log(`wrote ${outPath}`)
  console.log('this is the flat horosphere slice, extracted from the evolved {5,3,4} hyperbolic bulk')
}

run().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e))
})
