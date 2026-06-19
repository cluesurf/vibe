// THE TARGETED PIPELINE, ANIMATED, at scale. Grow ONLY the horosphere band slab (Busemann-pruned BFS,
// O(band) not O(bulk)), evolve it beat by beat on the GPU, and render the flat slice every beat. Because the
// whole cell budget goes to the band, this reaches HUNDREDS OF THOUSANDS of band cells, about 100x more than
// slicing a full bulk of the same size. Run: pnpm tsx code/gpu/render-band-anim.ts (after `pnpm add webgpu`),
// then task/render-video.sh. See note/research/vibe/notes/horosphere-extraction-algorithms.md and the plan.

import { create, globals } from 'webgpu'
import { makeRng } from '@/code/tool/rng'
import { TONE_COLORS } from '@/code/draw/color'
import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'
import { BULK_STEP_WGSL } from '@/code/compute/wave.wgsl'
import { encodePng } from '@/code/draw/png'
import { writeFrame } from '@/code/draw/animation'
import { pack, currentOf } from '@/code/tone/pack'
import { toCsr } from '@/code/tool/graph'
import { extractBand } from '@/code/substrate/horosphere'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

Object.assign(globalThis, globals)
const navigator = { gpu: create([]) }

const WORKGROUP = 256
const MAX_BAND = 500000 // band cells, slab stays under the 128 MiB GPU adjacency-buffer limit (~1.9M slab)
const HALF = 0.5
const MARGIN = 0.6
const FRAMES = 150
const IMG = 1600
const RADIUS = 1
const ZOOM_FIT = 0.6

const norm = (v: number[]): number =>
  Math.sqrt(v.reduce((s, x) => s + x * x, 0))

const dot = (a: number[], b: number[]): number =>
  a.reduce((s, x, i) => s + x * b[i]!, 0)

const COLORS = TONE_COLORS

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    console.log('no WebGPU adapter available (needs a GPU)')

    return
  }

  const device = await adapter.requestDevice()

  // grow only the horosphere band slab
  const slab = buildHorosphereBand({
    maxBand: MAX_BAND,
    half: HALF,
    margin: MARGIN,
  })

  const n = slab.cellCount
  const dim = slab.coords[0]!.length
  const xi = slab.idealPoint
  console.log(
    `targeted slab ${n.toLocaleString()} cells, band ${slab.bandCount.toLocaleString()} cells`,
  )

  // 2D projection basis, the plane perpendicular to the ideal direction xi
  const seedVec = (k: number): number[] =>
    Array.from({ length: dim }, (_, i) => (i === k ? 1 : 0))

  const sub = (a: number[], b: number[], s: number): number[] =>
    a.map((x, i) => x - s * b[i]!)

  const normalize = (v: number[]): number[] => {
    const m = norm(v) || 1

    return v.map(x => x / m)
  }

  let axis = 0

  for (let k = 1; k < dim; k++) {
    if (Math.abs(xi[k]!) < Math.abs(xi[axis]!)) {
      axis = k
    }
  }

  const e1 = normalize(sub(seedVec(axis), xi, dot(seedVec(axis), xi)))

  let axis2 = (axis + 1) % dim

  for (let k = 0; k < dim; k++) {
    if (k !== axis && Math.abs(xi[k]!) < Math.abs(xi[axis2]!)) {
      axis2 = k
    }
  }

  const e2 = normalize(
    sub(
      sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)),
      e1,
      dot(sub(seedVec(axis2), xi, dot(seedVec(axis2), xi)), e1),
    ),
  )

  // the band cells (|busemann| < half), with fixed pixel positions, zoomed on the dense core
  type BandCell = { index: number; px: number; py: number }
  // flatten the horosphere correctly by STEREOGRAPHIC INVERSION from the ideal point xi, w = (p - xi)/|p - xi|^2,
  // which maps the horosphere to a true Euclidean plane (an orthographic drop of xi folds it into a ring)
  const raw: { index: number; u: number; v: number }[] = []

  for (const i of extractBand({
    busemann: slab.busemann,
    level: 0,
    half: HALF,
  })) {
    const x = slab.coords[i]!
    const diff = x.map((v, k) => v - xi[k]!)
    const d2 = dot(diff, diff) || 1e-12
    const w = diff.map(v => v / d2)
    raw.push({ index: i, u: dot(w, e1), v: dot(w, e2) })
  }

  const median = (xs: number[]): number => {
    const s = [...xs].sort((a, b) => a - b)

    return s[Math.floor(s.length / 2)] ?? 0
  }

  const cu = median(raw.map(c => c.u))
  const cv = median(raw.map(c => c.v))
  const radii = raw
    .map(c => Math.max(Math.abs(c.u - cu), Math.abs(c.v - cv)))
    .sort((a, b) => a - b)

  const halfExtent =
    (radii[Math.floor(radii.length * ZOOM_FIT)] ?? 1) || 1

  const pad = 20
  const halfPix = IMG / 2 - pad
  const band: BandCell[] = raw.map(c => ({
    index: c.index,
    px: Math.round(IMG / 2 + ((c.u - cu) / halfExtent) * halfPix),
    py: Math.round(IMG / 2 + ((c.v - cv) / halfExtent) * halfPix),
  }))

  // GPU bulk pipeline on the slab graph
  const { offsets, adj } = toCsr(slab.neighbors)
  const seed = new Uint32Array(n)
  const rng = makeRng({ seed: 1357924680 })
  const nextR = (): number => rng.next()

  for (let i = 0; i < n; i++) {
    seed[i] = pack({
      current: Math.floor(nextR() * 3),
      previous: Math.floor(nextR() * 3),
    })
  }

  const byteLength = n * 4
  const params = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  device.queue.writeBuffer(params, 0, new Uint32Array([n, 0, 0, 0]))
  const makeState = (): GPUBuffer =>
    device.createBuffer({
      size: byteLength,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
    })

  const bufs: [GPUBuffer, GPUBuffer] = [makeState(), makeState()]
  device.queue.writeBuffer(bufs[0], 0, seed)
  const offBuf = device.createBuffer({
    size: offsets.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  })

  device.queue.writeBuffer(offBuf, 0, offsets)
  const adjBuf = device.createBuffer({
    size: adj.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  })

  device.queue.writeBuffer(adjBuf, 0, adj)
  const module = device.createShaderModule({ code: BULK_STEP_WGSL })
  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module, entryPoint: 'main' },
  })

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
  const staging = device.createBuffer({
    size: byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  const outDir = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'make',
    'frames',
  )

  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  let src = 0

  for (let f = 0; f < FRAMES; f++) {
    const enc = device.createCommandEncoder()
    const pass = enc.beginComputePass()
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bind(bufs[src]!, bufs[1 - src]!))
    pass.dispatchWorkgroups(dispatch)
    pass.end()
    enc.copyBufferToBuffer(bufs[1 - src]!, 0, staging, 0, byteLength)
    device.queue.submit([enc.finish()])
    src = 1 - src
    await staging.mapAsync(GPUMapMode.READ)
    const tones = new Uint32Array(staging.getMappedRange().slice(0))
    staging.unmap()

    const rgba = new Uint8Array(IMG * IMG * 4)

    for (let i = 0; i < IMG * IMG; i++) {
      rgba[i * 4] = 10
      rgba[i * 4 + 1] = 10
      rgba[i * 4 + 2] = 11
      rgba[i * 4 + 3] = 255
    }

    for (const c of band) {
      if (
        c.px < -RADIUS ||
        c.px >= IMG + RADIUS ||
        c.py < -RADIUS ||
        c.py >= IMG + RADIUS
      ) {
        continue
      }

      const tone = currentOf(tones[c.index]!)

      if (tone === 0) {
        continue
      }

      const col = COLORS[tone]!

      for (let dy = -RADIUS; dy <= RADIUS; dy++) {
        for (let dx = -RADIUS; dx <= RADIUS; dx++) {
          const x = c.px + dx
          const y = c.py + dy

          if (x < 0 || x >= IMG || y < 0 || y >= IMG) {
            continue
          }

          const idx = (y * IMG + x) * 4
          rgba[idx] = col[0]
          rgba[idx + 1] = col[1]
          rgba[idx + 2] = col[2]
        }
      }
    }

    writeFrame({ dir: outDir, index: f, rgba, width: IMG, height: IMG })
  }

  console.log(`wrote ${FRAMES} frames to ${outDir}`)
  console.log('assemble with, task/render-video.sh')
}

run().catch(e => {
  console.error(e instanceof Error ? e.message : String(e))
})
