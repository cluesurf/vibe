// HOROSPHERE GLIDING WAVE, base-faithful (the-four-elements.md). DYNAMICS = ONLY the four base elements:
// the {5,3,4} mesh, discrete ternary tone {-1,0,+1}, discrete beats, and the discrete second-order
// conserving rule (BULK_STEP, next = (sum of neighbour tones - previous) mod 3). No continuous wave, no
// added coin. The raw per-cell tone STROBES (mod-3), so to SEE the emergent wave we COARSE-GRAIN the
// discrete tone field for DISPLAY ONLY (the doc: continuous amplitudes are the effective description after
// coarse-graining). Big flat sheet (~120k cells via buildHorosphereBand) so the ballistic front (the
// lightcone, ~1 cell/beat) has room to visibly glide. Three flat tones: black = 0, blue = +1, red = -1.
// Run: npx tsx code/gpu/render-horosphere-glide-534.ts.

import { create, globals } from 'webgpu'
import { makeRng } from '@/code/tool/rng'
import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'
import { BULK_STEP_WGSL } from '@/code/compute/wave.wgsl'
import { writeFrame } from '@/code/draw/animation'
import { pack, currentOf, signedTone } from '@/code/tone/pack'
import { toCsr } from '@/code/tool/graph'
import { extractBand } from '@/code/substrate/horosphere'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

Object.assign(globalThis, globals)

const navigator = { gpu: create([]) }

const WORKGROUP = 256
const MAX_BAND = 120000
const HALF = 0.5
const FRAMES = 200
const IMG = 1200
const SEED_FRACTION = 0.05 // localized charge column near the centre
const SMOOTH_PASSES = 6 // coarse-graining for DISPLAY only (the base dynamics stays discrete)
const DOT = 4

const norm = (v: number[]): number =>
  Math.sqrt(v.reduce((s, x) => s + x * x, 0))

const dot = (a: number[], b: number[]): number =>
  a.reduce((s, x, i) => s + x * b[i]!, 0)

const BLUE: [number, number, number] = [60, 130, 255]
const RED: [number, number, number] = [255, 60, 70]

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    console.log('no WebGPU adapter available (needs a GPU)')

    return
  }

  const device = await adapter.requestDevice()

  const slab = buildHorosphereBand({
    symbol: [5, 3, 4],
    maxBand: MAX_BAND,
    half: HALF,
    margin: 0.6,
  })

  const n = slab.cellCount
  const xi = slab.idealPoint
  const dim = xi.length

  // HOROCYCLIC flat coordinate: invert about the ideal point (un-crushes the crowding), then project
  const sub = (a: number[], b: number[], s: number): number[] =>
    a.map((x, i) => x - s * b[i]!)

  const normalize = (v: number[]): number[] => {
    const m = norm(v) || 1

    return v.map(x => x / m)
  }

  const seedVec = (k: number): number[] =>
    Array.from({ length: dim }, (_, i) => (i === k ? 1 : 0))

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

  const U = new Float32Array(n),
    V = new Float32Array(n)

  for (let i = 0; i < n; i++) {
    const d = sub(slab.coords[i]!, xi, 1)
    const dd = dot(d, d) || 1e-9
    const inv = d.map(x => x / dd)

    U[i] = dot(inv, e1)
    V[i] = dot(inv, e2)
  }

  // the band (|busemann| < HALF) and its induced adjacency (for display coarse-graining)
  const bandList = extractBand({
    busemann: slab.busemann,
    level: 0,
    half: HALF,
  })

  const reindex = new Int32Array(n).fill(-1)

  for (let a = 0; a < bandList.length; a++) {
    reindex[bandList[a]!] = a
  }

  const B = bandList.length
  const bandNbr: number[][] = bandList.map(() => [])

  for (let a = 0; a < B; a++) {
    for (const w of slab.neighbors[bandList[a]!]!) {
      const b = reindex[w]!

      if (b >= 0) {
        bandNbr[a]!.push(b)
      }
    }
  }

  const med = (xs: number[]): number => {
    const s = [...xs].sort((p, q) => p - q)

    return s[Math.floor(s.length / 2)] ?? 0
  }

  const cu = med(bandList.map(i => U[i]!)),
    cv = med(bandList.map(i => V[i]!))

  const radii = bandList
    .map(i => Math.max(Math.abs(U[i]! - cu), Math.abs(V[i]! - cv)))
    .sort((p, q) => p - q)

  const ext = (radii[Math.floor(radii.length * 0.55)] ?? 1) || 1
  const halfPx = IMG / 2 - 16
  const px = new Int32Array(B),
    py = new Int32Array(B)

  for (let a = 0; a < B; a++) {
    const i = bandList[a]!

    px[a] = Math.round(IMG / 2 + ((U[i]! - cu) / ext) * halfPx)
    py[a] = Math.round(IMG / 2 + ((V[i]! - cv) / ext) * halfPx)
  }

  console.log(
    `slab ${n.toLocaleString()} cells, flat band ${B.toLocaleString()} cells`,
  )

  // GPU: evolve the DISCRETE base rule (BULK_STEP) on the slab; seed a localized charge column
  const { offsets, adj } = toCsr(slab.neighbors)
  const seed = new Uint32Array(n)
  const rng = makeRng({ seed: 99194853 })
  const nextR = (): number => rng.next()
  const seedRadius = ext * SEED_FRACTION

  let seeded = 0

  for (let i = 0; i < n; i++) {
    if (Math.hypot(U[i]! - cu, V[i]! - cv) < seedRadius) {
      seed[i] = pack({
        current: 1 + Math.floor(nextR() * 2),
        previous: 1 + Math.floor(nextR() * 2),
      })
      seeded++
    }
  }

  console.log(`seeded ${seeded} cells in the central charge column`)

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

  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: device.createShaderModule({ code: BULK_STEP_WGSL }),
      entryPoint: 'main',
    },
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
  const outDir = join(here, '..', '..', 'make', 'frames-glide')

  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  const reached = new Int32Array(B).fill(-1)

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

    // signed discrete tone on the band, then COARSE-GRAIN (display only) to reveal the emergent wave
    let sm = new Float32Array(B)

    for (let a = 0; a < B; a++) {
      const t = signedTone(currentOf(tones[bandList[a]!]!))

      sm[a] = t

      if (reached[a]! < 0 && t !== 0) {
        reached[a] = f
      }
    }

    for (let p = 0; p < SMOOTH_PASSES; p++) {
      const ns = new Float32Array(B)

      for (let a = 0; a < B; a++) {
        let s = sm[a]!,
          d = 1

        for (const b of bandNbr[a]!) {
          s += sm[b]!
          d++
        }

        ns[a] = s / d
      }

      sm = ns
    }

    let mx = 1e-6

    for (let a = 0; a < B; a++) {
      const v = Math.abs(sm[a]!)

      if (v > mx) {
        mx = v
      }
    }

    const eps = 0.06 * mx

    const rgba = new Uint8Array(IMG * IMG * 4)

    for (let i = 0; i < rgba.length; i += 4) {
      rgba[i] = 0
      rgba[i + 1] = 0
      rgba[i + 2] = 0
      rgba[i + 3] = 255
    }

    for (let a = 0; a < B; a++) {
      if (reached[a]! < 0) {
        continue
      }
      // outside the causal cone, black

      const s = sm[a]!

      if (Math.abs(s) < eps) {
        continue
      }
      // peace, black

      const col = s > 0 ? BLUE : RED
      const cx = px[a]!,
        cy = py[a]!

      for (let dy = -DOT; dy <= DOT; dy++) {
        for (let dx = -DOT; dx <= DOT; dx++) {
          if (dx * dx + dy * dy > DOT * DOT) {
            continue
          }

          const x = cx + dx,
            y = cy + dy

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
      prefix: 'glide_',
    })

    if (f % 25 === 0) {
      console.log(`  beat ${f}/${FRAMES}`)
    }
  }

  console.log(`wrote ${FRAMES} frames to ${outDir}`)
  console.log(
    `ffmpeg -y -framerate 24 -i ${join(outDir, 'glide_%04d.png')} -pix_fmt yuv420p ${join(here, '..', '..', 'make', '534', 'horosphere-glide-534.mp4')}`,
  )
}

void run()
