// VOLUME render of the {3,4,3,4} flat 3D CUSP ({4,3,4} cubic space), animated. The cusp is genuine flat 3D
// Euclidean space, so the field is a 3D cubic lattice. We run the wave on the GPU (BULK_STEP, the same kernel
// as the {5,3,4} bulk), then VOLUME-RENDER each beat, the rotated 3D field is projected to 2D and every
// charged cell adds a translucent splat (blue +1, red -1), so cells stacked along the view ray build up
// OPACITY and the whole 3D structure glows at once. A central pulse makes the expanding 3D wave-shells
// legible. Run: pnpm tsx code/gpu/render-cusp-3434-vol.ts   then task/render-video.sh

import { create, globals } from 'webgpu'
import { makeRng } from '@/code/tool/rng'
import { PLEASURE, PAIN } from '@/code/draw/color'
import { BULK_STEP_WGSL } from '@/code/compute/wave.wgsl'
import { writeFrame } from '@/code/draw/animation'
import { pack, currentOf } from '@/code/tone/pack'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

Object.assign(globalThis, globals)

const navigator = { gpu: create([]) }

const L = Number(process.argv[2]) || 96 // cube side, N = L^3 cells of flat 3D space (pass a larger arg to scale up)
const FRAMES = 180
const IMG = 1000
const WORKGROUP = 256
const AX = 0.5 // view rotation
const AY = 0.9
const ALPHA = 0.35 // per-cell opacity for back-to-front compositing (blends, never sums to white)
const SPLAT = 1 // each projected cell paints a small square so sparse shells stay visible

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    console.log('no WebGPU adapter available (needs a GPU)')

    return
  }

  const device = await adapter.requestDevice()
  const N = L * L * L
  const idx = (x: number, y: number, z: number): number =>
    (z * L + y) * L + x

  // the {4,3,4} cubic cusp as a 6-neighbour CSR graph (bounded cube)
  const offsets = new Int32Array(N + 1)
  const deg = (x: number, y: number, z: number): number =>
    (x > 0 ? 1 : 0) +
    (x < L - 1 ? 1 : 0) +
    (y > 0 ? 1 : 0) +
    (y < L - 1 ? 1 : 0) +
    (z > 0 ? 1 : 0) +
    (z < L - 1 ? 1 : 0)

  for (let z = 0; z < L; z++) {
    for (let y = 0; y < L; y++) {
      for (let x = 0; x < L; x++) {
        offsets[idx(x, y, z) + 1] = deg(x, y, z)
      }
    }
  }

  for (let i = 0; i < N; i++) {
    offsets[i + 1] = offsets[i + 1]! + offsets[i]!
  }

  const adj = new Int32Array(offsets[N]!)

  {
    let p = 0

    for (let z = 0; z < L; z++) {
      for (let y = 0; y < L; y++) {
        for (let x = 0; x < L; x++) {
          if (x > 0) {
            adj[p++] = idx(x - 1, y, z)
          }

          if (x < L - 1) {
            adj[p++] = idx(x + 1, y, z)
          }

          if (y > 0) {
            adj[p++] = idx(x, y - 1, z)
          }

          if (y < L - 1) {
            adj[p++] = idx(x, y + 1, z)
          }

          if (z > 0) {
            adj[p++] = idx(x, y, z - 1)
          }

          if (z < L - 1) {
            adj[p++] = idx(x, y, z + 1)
          }
        }
      }
    }
  }

  console.log(
    `{3,4,3,4} cusp = {4,3,4} cubic, ${N.toLocaleString()} cells (${L}^3), volume render`,
  )

  // a central blob of random tones, the wave expands from it as rich 3D shells
  const seed = new Uint32Array(N)
  const c = L >> 1
  const rr = makeRng({ seed: 12345 })
  const rnd = (): number => rr.next()
  const B = 6

  for (let z = -B; z <= B; z++) {
    for (let y = -B; y <= B; y++) {
      for (let x = -B; x <= B; x++) {
        if (x * x + y * y + z * z > B * B) {
          continue
        }

        seed[idx(c + x, c + y, c + z)] = pack({
          current: Math.floor(rnd() * 3),
          previous: Math.floor(rnd() * 3),
        })
      }
    }
  }

  const byteLength = N * 4
  const params = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  device.queue.writeBuffer(params, 0, new Uint32Array([N, 0, 0, 0]))

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

  device.queue.writeBuffer(offBuf, 0, new Uint32Array(offsets))

  const adjBuf = device.createBuffer({
    size: adj.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  })

  device.queue.writeBuffer(adjBuf, 0, new Uint32Array(adj))

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

  const dispatch = Math.ceil(N / WORKGROUP)
  const staging = device.createBuffer({
    size: byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  // rotation + orthographic projection, PRECOMPUTED once (rotation is fixed), plus a back-to-front draw order
  const cosx = Math.cos(AX)
  const sinx = Math.sin(AX)
  const cosy = Math.cos(AY)
  const siny = Math.sin(AY)
  const half = (L - 1) / 2
  const scale = (IMG * 0.62) / L
  const PX = new Int32Array(N)
  const PY = new Int32Array(N)
  const DEPTH = new Float32Array(N)
  const z2arr = new Float32Array(N)

  for (let z = 0; z < L; z++) {
    for (let y = 0; y < L; y++) {
      for (let x = 0; x < L; x++) {
        const ox = x - half
        const oy = y - half
        const oz = z - half
        const y1 = oy * cosx - oz * sinx
        const z1 = oy * sinx + oz * cosx
        const x2 = ox * cosy + z1 * siny
        const z2 = -ox * siny + z1 * cosy
        const i = idx(x, y, z)

        PX[i] = Math.round(IMG / 2 + x2 * scale)
        PY[i] = Math.round(IMG / 2 - y1 * scale)
        z2arr[i] = z2
        DEPTH[i] = 0.5 + 0.5 * (z2 / L + 0.5)
      }
    }
  }

  // back-to-front order (smallest rotated-z first, so nearer cells composite on top)
  const order = Array.from({ length: N }, (_, i) => i).sort(
    (a, b) => z2arr[a]! - z2arr[b]!,
  )

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

  const accR = new Float32Array(IMG * IMG)
  const accG = new Float32Array(IMG * IMG)
  const accB = new Float32Array(IMG * IMG)

  for (let f = 0; f < FRAMES; f++) {
    // read back current field
    {
      const enc = device.createCommandEncoder()

      enc.copyBufferToBuffer(bufs[src]!, 0, staging, 0, byteLength)
      device.queue.submit([enc.finish()])
    }

    await staging.mapAsync(GPUMapMode.READ)

    const field = new Uint32Array(staging.getMappedRange().slice(0))

    staging.unmap()

    accR.fill(0)
    accG.fill(0)
    accB.fill(0)

    // house palette, +1 blue, -1 red, 0 black. BACK-TO-FRONT alpha compositing, blends (never sums to white)
    const BLUE: [number, number, number] = PLEASURE
    const RED: [number, number, number] = PAIN

    for (let k = 0; k < N; k++) {
      const cell = order[k]!
      const t = currentOf(field[cell]!)

      if (t === 0) {
        continue
      }

      const col = t === 1 ? BLUE : RED
      const d = DEPTH[cell]!
      const cxp = PX[cell]!
      const cyp = PY[cell]!

      for (let dy = -SPLAT; dy <= SPLAT; dy++) {
        for (let dx = -SPLAT; dx <= SPLAT; dx++) {
          const ix = cxp + dx
          const iy = cyp + dy

          if (ix < 0 || ix >= IMG || iy < 0 || iy >= IMG) {
            continue
          }

          const pix = iy * IMG + ix

          accR[pix] = accR[pix]! * (1 - ALPHA) + col[0] * d * ALPHA
          accG[pix] = accG[pix]! * (1 - ALPHA) + col[1] * d * ALPHA
          accB[pix] = accB[pix]! * (1 - ALPHA) + col[2] * d * ALPHA
        }
      }
    }

    const rgba = new Uint8Array(IMG * IMG * 4)

    for (let i = 0; i < IMG * IMG; i++) {
      rgba[i * 4] = Math.min(255, 8 + accR[i]!)
      rgba[i * 4 + 1] = Math.min(255, 8 + accG[i]!)
      rgba[i * 4 + 2] = Math.min(255, 9 + accB[i]!)
      rgba[i * 4 + 3] = 255
    }

    writeFrame({ dir: outDir, index: f, rgba, width: IMG, height: IMG })

    // advance one beat on the GPU
    const enc = device.createCommandEncoder()
    const pass = enc.beginComputePass()

    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bind(bufs[src]!, bufs[1 - src]!))
    pass.dispatchWorkgroups(dispatch)
    pass.end()
    device.queue.submit([enc.finish()])
    src = 1 - src
  }

  console.log(
    `wrote ${FRAMES} frames of the {3,4,3,4} flat 3D cusp (volume render), assemble with task/render-video.sh`,
  )
}

run().catch(e => {
  console.error(e instanceof Error ? e.message : String(e))
})
