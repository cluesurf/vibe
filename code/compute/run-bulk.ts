// Headless Node runner for the wave on the HYPERBOLIC {5,3,4} BULK on the GPU, via the `webgpu` package
// (Dawn). The bulk is an irregular 12-neighbour graph, so neighbours are uploaded as a CSR adjacency
// (offsets, adj) built by the exact engine, and the GPU sums over them (stored-neighbour path, plan Stage 3).
// It (1) SELF-CHECKS the GPU against a CPU reference of the same graph rule, and (2) BENCHMARKS at scale.
// Run: pnpm tsx code/gpu/run-bulk.ts   (after `pnpm add webgpu`). See note/plan/vibe-webgpu-billion-cell-sim.md.

import { create, globals } from 'webgpu'
import { makeRng } from '@/code/tool/rng'
import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { BULK_STEP_WGSL } from '@/code/compute/wave.wgsl'

Object.assign(globalThis, globals)
const navigator = { gpu: create([]) }

const WORKGROUP = 256
const BUILD_CELLS = 500000
const BENCH_BEATS = 200
const CHECK_BEATS = 40

const pack = (current: number, previous: number): number =>
  (previous << 2) | current
const currentOf = (packed: number): number => packed & 3

// the CPU reference, one beat of the same second-order mod-3 rule over the CSR graph
function cpuStep(
  state: Uint32Array,
  offsets: Int32Array,
  adj: Int32Array,
): Uint32Array {
  const out = new Uint32Array(state.length)
  for (let i = 0; i < state.length; i++) {
    const cur = currentOf(state[i]!)
    const prev = (state[i]! >> 2) & 3
    let s = 0
    for (let p = offsets[i]!; p < offsets[i + 1]!; p++)
      s += currentOf(state[adj[p]!]!)
    out[i] = pack((s + 27 - prev) % 3, cur)
  }
  return out
}

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.log('no WebGPU adapter available (needs a GPU)')
    return
  }
  const device = await adapter.requestDevice()

  // build the exact {5,3,4} bulk graph on the CPU, then upload its adjacency to the GPU
  const g = buildDodecagrid({ maxCells: BUILD_CELLS })
  const n = g.cellCount
  const offsetsU = new Uint32Array(g.offsets) // n+1
  const adjU = new Uint32Array(g.adj)
  console.log(
    `built {5,3,4} bulk, ${n.toLocaleString()} cells, ${adjU.length.toLocaleString()} directed edges`,
  )

  // a deterministic pseudo-random initial field, both tone slots filled so the second-order rule has history
  const seed = new Uint32Array(n)
  const r = makeRng({ seed: 987654321 })
  const nextR = (): number => r.next()
  for (let i = 0; i < n; i++)
    seed[i] = pack(Math.floor(nextR() * 3), Math.floor(nextR() * 3))

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
    size: offsetsU.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  })
  device.queue.writeBuffer(offBuf, 0, offsetsU)
  const adjBuf = device.createBuffer({
    size: adjU.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  })
  device.queue.writeBuffer(adjBuf, 0, adjU)

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

  const stepGpu = (count: number, fromSrc: number): number => {
    let src = fromSrc
    for (let b = 0; b < count; b++) {
      const enc = device.createCommandEncoder()
      const pass = enc.beginComputePass()
      pass.setPipeline(pipeline)
      pass.setBindGroup(0, bind(bufs[src]!, bufs[1 - src]!))
      pass.dispatchWorkgroups(dispatch)
      pass.end()
      device.queue.submit([enc.finish()])
      src = 1 - src
    }
    return src
  }

  // (1) SELF-CHECK against the CPU reference
  const srcAfterCheck = stepGpu(CHECK_BEATS, 0)
  const staging = device.createBuffer({
    size: byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })
  {
    const enc = device.createCommandEncoder()
    enc.copyBufferToBuffer(
      bufs[srcAfterCheck]!,
      0,
      staging,
      0,
      byteLength,
    )
    device.queue.submit([enc.finish()])
  }
  await staging.mapAsync(GPUMapMode.READ)
  const gpuOut = new Uint32Array(staging.getMappedRange().slice(0))
  staging.unmap()

  let cpu = seed.slice()
  for (let b = 0; b < CHECK_BEATS; b++)
    cpu = cpuStep(cpu, g.offsets, g.adj)
  let mismatches = 0
  for (let i = 0; i < n; i++)
    if (currentOf(cpu[i]!) !== currentOf(gpuOut[i]!)) mismatches++
  const ok = mismatches === 0
  console.log(
    `self-check ${CHECK_BEATS} beats: GPU vs CPU mismatches ${mismatches} -> ${ok ? 'IDENTICAL' : 'FAIL'}`,
  )

  // (2) BENCHMARK
  device.queue.writeBuffer(bufs[0], 0, seed)
  stepGpu(1, 0)
  await device.queue.onSubmittedWorkDone()
  const start = performance.now()
  stepGpu(BENCH_BEATS, 0)
  await device.queue.onSubmittedWorkDone()
  const seconds = (performance.now() - start) / 1000
  const beatsPerSec = BENCH_BEATS / seconds
  console.log(
    `benchmark ${n.toLocaleString()} bulk cells, ${BENCH_BEATS} beats in ${seconds.toFixed(2)}s`,
  )
  console.log(
    `  ${beatsPerSec.toFixed(0)} beats/sec, ${((beatsPerSec * n) / 1e9).toFixed(2)} billion cell-updates/sec`,
  )
  console.log(
    ok
      ? 'OK, the {5,3,4} bulk runs correctly on the GPU'
      : 'FAILED self-check',
  )
}

run().catch(e => {
  console.error(e instanceof Error ? e.message : String(e))
})
