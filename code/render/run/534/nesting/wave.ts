// GPU DYNAMICS x NESTING video. Build the {5,3,4} bulk, evolve the deterministic reversible rule on the GPU
// (BULK_STEP_WGSL) one beat at a time, and render EVERY cell projected to the Poincare disk, sized by its
// conformal scale (1 - r^2) so cells crowd the boundary (the nesting), coloured by its GPU-evolved tone.
// A charge packet seeded at the centre spreads outward through the nested shells, so you watch the wave move
// through the recursive hyperbolic structure. Heavy GPU use (hundreds of thousands of cells per beat).
// Run: npx tsx code/gpu/render-nesting-wave-534.ts (after `pnpm add webgpu`), then ffmpeg the frames.

import { create, globals } from 'webgpu'
import { makeRng } from '@/code/tool/rng'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { BULK_STEP_WGSL } from '@/code/compute/wave.wgsl'
import { encodePng } from '@/code/draw/png'
import { pack, currentOf, toneColor } from '@/code/tone/pack'
import { toCsr } from '@/code/tool/graph'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

Object.assign(globalThis, globals)

const navigator = { gpu: create([]) }

const WORKGROUP = 256
const MAX_CELLS = 300000
const FRAMES = 120
const IMG = 1200
const MARGIN = 0.94
const DOT_SCALE = 34
const SEED_DEPTH = 3 // seed a charge packet in shells 0..SEED_DEPTH at the centre

const norm = (v: number[]): number =>
  Math.sqrt(v.reduce((s, x) => s + x * x, 0))

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    console.log('no WebGPU adapter available (needs a GPU)')

    return
  }

  const device = await adapter.requestDevice()

  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells: MAX_CELLS })
  const n = g.cellCount

  // BFS depth from cell 0 (for seeding the central packet)
  const depth = new Array<number>(n).fill(-1)

  depth[0] = 0

  let frontier = [0]

  while (frontier.length) {
    const next: number[] = []

    for (const u of frontier) {
      for (const v of g.neighbors[u]!) {
        if (depth[v]! < 0) {
          depth[v] = depth[u]! + 1
          next.push(v)
        }
      }
    }

    frontier = next
  }

  // precompute each cell's Poincare-disk pixel position and dot radius (conformal scale), draw far-first
  const half = IMG / 2
  const scale = half * MARGIN

  type Dot = {
    index: number
    px: number
    py: number
    rad: number
    r2: number
  }

  const dots: Dot[] = []

  for (let i = 0; i < n; i++) {
    const x = g.coords[i]![0]!,
      y = g.coords[i]![1]!

    const r2 = norm(g.coords[i]!) ** 2

    dots.push({
      index: i,
      px: half + scale * x,
      py: half - scale * y,
      rad: Math.max(0.6, DOT_SCALE * (1 - r2)),
      r2,
    })
  }

  dots.sort((a, b) => b.r2 - a.r2) // far (boundary) first, centre drawn last on top
  console.log(
    `bulk ${n.toLocaleString()} cells, rendering ${FRAMES} beats on GPU`,
  )

  // GPU pipeline (CSR adjacency + ping-pong state), same as render-horosphere-anim
  const { offsets, adj } = toCsr(g.neighbors)

  // seed: peace everywhere, a deterministic charge packet in the central shells
  const seed = new Uint32Array(n)
  const rng = makeRng({ seed: 2246822519 })
  const nextR = (): number => rng.next()

  for (let i = 0; i < n; i++) {
    if (depth[i]! >= 0 && depth[i]! <= SEED_DEPTH) {
      seed[i] = pack({
        current: 1 + Math.floor(nextR() * 2),
        previous: 1 + Math.floor(nextR() * 2),
      })
    } else {
      seed[i] = pack({ current: 0, previous: 0 })
    }
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

  const here = dirname(fileURLToPath(import.meta.url))
  const outDir = join(here, 'frames-nesting-wave-534')

  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  const drawDot = (
    rgba: Uint8Array,
    cx: number,
    cy: number,
    rad: number,
    col: [number, number, number],
  ): void => {
    const r0 = Math.max(0, Math.floor(cx - rad)),
      r1 = Math.min(IMG - 1, Math.ceil(cx + rad))

    const c0 = Math.max(0, Math.floor(cy - rad)),
      c1 = Math.min(IMG - 1, Math.ceil(cy + rad))

    const rr = rad * rad

    for (let py = c0; py <= c1; py++) {
      for (let px = r0; px <= r1; px++) {
        const dx = px - cx,
          dy = py - cy

        if (dx * dx + dy * dy <= rr) {
          const o = (py * IMG + px) * 4

          rgba[o] = col[0]
          rgba[o + 1] = col[1]
          rgba[o + 2] = col[2]
          rgba[o + 3] = 255
        }
      }
    }
  }

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
      rgba[i] = 8
      rgba[i + 1] = 8
      rgba[i + 2] = 11
      rgba[i + 3] = 255
    }

    // boundary ring
    for (let a = 0; a < 3600; a++) {
      const th = (a / 3600) * 2 * Math.PI
      const px = Math.round(half + scale * Math.cos(th)),
        py = Math.round(half + scale * Math.sin(th))

      if (px >= 0 && px < IMG && py >= 0 && py < IMG) {
        const o = (py * IMG + px) * 4

        rgba[o] = 60
        rgba[o + 1] = 60
        rgba[o + 2] = 68
      }
    }

    for (const d of dots) {
      const tone = currentOf(tones[d.index]!)

      if (tone === 0) {
        continue
      }
      // peace is black (the background), draw only the charges

      drawDot(rgba, d.px, d.py, d.rad, toneColor(tone))
    }

    writeFileSync(
      join(outDir, `wave-${String(f).padStart(3, '0')}.png`),
      encodePng(rgba, IMG, IMG),
    )

    if (f % 20 === 0) {
      console.log(`  beat ${f}/${FRAMES}`)
    }
  }

  console.log(`wrote ${FRAMES} frames to ${outDir}`)
  console.log(
    `ffmpeg -framerate 24 -i ${join(outDir, 'wave-%03d.png')} -pix_fmt yuv420p ${join(here, 'nesting-wave-534.mp4')}`,
  )
}

void run()
