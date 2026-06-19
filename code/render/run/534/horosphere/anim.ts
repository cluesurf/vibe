// THE FULL PIPELINE, ANIMATED. Build the {5,3,4} hyperbolic bulk with coordinates, extract the horosphere
// (the flat Euclidean slice) ONCE, then evolve the bulk one beat at a time on the GPU and render the slice
// EVERY beat, writing a PNG frame per beat. Assemble the frames into a video with ffmpeg to watch the
// Euclidean layer evolve. The geometry (which cells, where) is fixed, only the tones change, so the band is
// extracted once and recoloured each beat. Run: pnpm tsx code/gpu/render-horosphere-anim.ts (after
// `pnpm add webgpu`), then ffmpeg the frames. See note/plan/vibe-webgpu-billion-cell-sim.md.

import { create, globals } from 'webgpu'
import { makeRng } from '@/code/tool/rng'
import { PLEASURE, PAIN } from '@/code/draw/color'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { BULK_STEP_WGSL } from '@/code/compute/wave.wgsl'
import { encodePng } from '@/code/draw/png'
import { writeFrame } from '@/code/draw/animation'
import { pack, currentOf } from '@/code/tone/pack'
import { toCsr } from '@/code/tool/graph'
import {
  idealDirection,
  busemann,
  extractBand,
} from '@/code/substrate/horosphere'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

Object.assign(globalThis, globals)
const navigator = { gpu: create([]) }

const WORKGROUP = 256
const MAX_CELLS = 2500000 // ~2.5M bulk cells, the GPU adjacency-buffer ceiling (128 MiB), gives ~5800 band cells
const FRAMES = 150 // one rendered frame per beat
const IMG = 1200
const LEVEL = 0
const HALF = 0.5
const RADIUS = 2
const ZOOM_FIT = 0.6 // fraction of band cells to fit in frame, the dense core fills it, outliers clip

const norm = (v: number[]): number =>
  Math.sqrt(v.reduce((s, x) => s + x * x, 0))
const dot = (a: number[], b: number[]): number =>
  a.reduce((s, x, i) => s + x * b[i]!, 0)

const COLORS: [number, number, number][] = [
  [40, 40, 46],
  PLEASURE,
  PAIN,
]

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.log('no WebGPU adapter available (needs a GPU)')
    return
  }
  const device = await adapter.requestDevice()

  // build the bulk and its coordinates, and the Busemann function whose level set is the horosphere
  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells: MAX_CELLS })
  const n = g.cellCount
  const coords = g.coords
  const dim = coords[0]!.length
  const xi = idealDirection(coords)
  const heights = busemann({ coords, ideal: xi })

  // an orthonormal basis of the horosphere plane (perpendicular to the ideal direction xi)
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

  // extract the horosphere band ONCE, the cell index plus its fixed pixel position
  type BandCell = { index: number; px: number; py: number }
  const raw: { index: number; u: number; v: number }[] = []
  for (const i of extractBand({
    busemann: heights,
    level: LEVEL,
    half: HALF,
  })) {
    const x = coords[i]!
    const proj = sub(x, xi, dot(x, xi))
    raw.push({ index: i, u: dot(proj, e1), v: dot(proj, e2) })
  }
  // zoom on the dense core, center on the median and scale by a percentile of the spread, so the packed
  // centre fills the frame and the sparse far outliers clip off-screen (they would otherwise shrink it all)
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
  const half = IMG / 2 - pad
  const band: BandCell[] = raw.map(c => ({
    index: c.index,
    px: Math.round(IMG / 2 + ((c.u - cu) / halfExtent) * half),
    py: Math.round(IMG / 2 + ((c.v - cv) / halfExtent) * half),
  }))
  console.log(
    `bulk ${n.toLocaleString()} cells, horosphere band ${band.length.toLocaleString()} cells, rendering ${FRAMES} beats`,
  )

  // GPU bulk pipeline
  const { offsets, adj } = toCsr(g.neighbors)
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
    // one beat
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

    // rasterize the band coloured by this beat's tones
    const rgba = new Uint8Array(IMG * IMG * 4)
    for (let i = 0; i < IMG * IMG; i++) {
      rgba[i * 4] = 10
      rgba[i * 4 + 1] = 10
      rgba[i * 4 + 2] = 11
      rgba[i * 4 + 3] = 255
    }
    for (const c of band) {
      const tone = currentOf(tones[c.index]!)
      if (tone === 0) {
        continue
      } // peace is black, the background, draw only the charges
      const col = COLORS[tone]!
      for (let dy = -RADIUS; dy <= RADIUS; dy++) {
        for (let dx = -RADIUS; dx <= RADIUS; dx++) {
          if (dx * dx + dy * dy > RADIUS * RADIUS) {
            continue
          }
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
  console.log(
    'assemble with, ffmpeg -y -framerate 20 -i make/frames/frame_%04d.png -pix_fmt yuv420p make/horosphere.mp4',
  )
}

run().catch(e => {
  console.error(e instanceof Error ? e.message : String(e))
})
