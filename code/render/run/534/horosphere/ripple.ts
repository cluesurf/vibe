// HOROSPHERE RIPPLE. The horosphere is the FLAT emergent 2D space of {5,3,4} (never the Poincare disk).
// Build the bulk, extract the flat horosphere slice ONCE, seed a small LOCALIZED charge packet at the centre
// of that flat sheet (the rest at peace), then evolve the deterministic rule on the GPU and render the flat
// slice every beat. You see ONE clean disturbance expand outward across flat space, like a stone dropped in
// a pond. Tones: blue = +1, red = -1, black = 0. Run: npx tsx code/gpu/render-horosphere-ripple-534.ts.

import { create, globals } from 'webgpu'
import { makeRng } from '@/code/tool/rng'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { BULK_STEP_WGSL } from '@/code/compute/wave.wgsl'
import { encodePng } from '@/code/draw/png'
import { writeFrame } from '@/code/draw/animation'
import { pack, currentOf, toneColor } from '@/code/tone/pack'
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
const MAX_CELLS = 2500000
const FRAMES = 150
const IMG = 1200
const LEVEL = 0
const HALF = 0.5
const RADIUS = 3 // dot radius in pixels
const ZOOM_FIT = 0.6
const SEED_FRACTION = 0.1 // seed cells within this fraction of the band spread, at the centre

const norm = (v: number[]): number =>
  Math.sqrt(v.reduce((s, x) => s + x * x, 0))

const dot = (a: number[], b: number[]): number =>
  a.reduce((s, x, i) => s + x * b[i]!, 0)

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    console.log('no WebGPU adapter available (needs a GPU)')

    return
  }

  const device = await adapter.requestDevice()

  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells: MAX_CELLS })
  const n = g.cellCount
  const coords = g.coords
  const dim = coords[0]!.length
  const xi = idealDirection(coords)
  const heights = busemann({ coords, ideal: xi })

  // orthonormal basis of the horosphere plane (perpendicular to the ideal direction xi)
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

  // extract the flat horosphere band once: cell index + (u,v) in the flat plane
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

  const median = (xs: number[]): number => {
    const s = [...xs].sort((a, b) => a - b)

    return s[Math.floor(s.length / 2)] ?? 0
  }

  const cu = median(raw.map(c => c.u)),
    cv = median(raw.map(c => c.v))

  const radii = raw
    .map(c => Math.max(Math.abs(c.u - cu), Math.abs(c.v - cv)))
    .sort((a, b) => a - b)

  const halfExtent =
    (radii[Math.floor(radii.length * ZOOM_FIT)] ?? 1) || 1

  const pad = 20,
    half = IMG / 2 - pad

  const band = raw.map(c => ({
    index: c.index,
    u: c.u,
    v: c.v,
    px: Math.round(IMG / 2 + ((c.u - cu) / halfExtent) * half),
    py: Math.round(IMG / 2 + ((c.v - cv) / halfExtent) * half),
  }))

  console.log(
    `bulk ${n.toLocaleString()} cells, flat horosphere band ${band.length.toLocaleString()} cells`,
  )

  // GPU pipeline
  const { offsets, adj } = toCsr(g.neighbors)

  // seed: peace everywhere, a localized charge COLUMN through the bulk at the central (u,v). A thin band
  // cannot hold a 2D packet (charge leaks into the bulk perpendicular to the slice), so we seed the whole
  // vertical column near the centre, and the band always catches its spreading footprint as an expanding
  // ripple on the flat sheet.
  const seed = new Uint32Array(n) // all zero = peace
  const rng = makeRng({ seed: 99194853 })
  const nextR = (): number => rng.next()
  const seedRadius = halfExtent * SEED_FRACTION

  let seeded = 0

  for (let i = 0; i < n; i++) {
    const x = coords[i]!
    const proj = sub(x, xi, dot(x, xi))
    const u = dot(proj, e1),
      v = dot(proj, e2)

    if (Math.hypot(u - cu, v - cv) < seedRadius) {
      seed[i] = pack({
        current: 1 + Math.floor(nextR() * 2),
        previous: 1 + Math.floor(nextR() * 2),
      })
      seeded++
    }
  }

  console.log(
    `seeded ${seeded} bulk cells in the central column (u,v radius fraction ${SEED_FRACTION})`,
  )

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

  const here = dirname(fileURLToPath(import.meta.url))
  const outDir = join(here, '..', '..', 'make', 'frames-ripple')
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

    for (let i = 0; i < rgba.length; i += 4) {
      rgba[i] = 6
      rgba[i + 1] = 6
      rgba[i + 2] = 9
      rgba[i + 3] = 255
    }

    for (const c of band) {
      const tone = currentOf(tones[c.index]!)

      if (tone === 0) {
        continue
      }

      const col = toneColor(tone)

      for (let dy = -RADIUS; dy <= RADIUS; dy++) {
        for (let dx = -RADIUS; dx <= RADIUS; dx++) {
          if (dx * dx + dy * dy > RADIUS * RADIUS) {
            continue
          }

          const x = c.px + dx,
            y = c.py + dy

          if (x < 0 || x >= IMG || y < 0 || y >= IMG) {
            continue
          }

          const o = (y * IMG + x) * 4
          rgba[o] = col[0]
          rgba[o + 1] = col[1]
          rgba[o + 2] = col[2]
        }
      }
    }

    writeFrame({
      dir: outDir,
      index: f,
      rgba,
      width: IMG,
      height: IMG,
      prefix: 'ripple_',
    })

    if (f % 25 === 0) {
      console.log(`  beat ${f}/${FRAMES}`)
    }
  }

  console.log(`wrote ${FRAMES} frames to ${outDir}`)
  console.log(
    `ffmpeg -y -framerate 20 -i ${join(outDir, 'ripple_%04d.png')} -pix_fmt yuv420p ${join(here, '..', '..', 'make', '534', 'horosphere-ripple-534.mp4')}`,
  )
}

run()
