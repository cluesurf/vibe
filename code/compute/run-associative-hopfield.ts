// Headless runner for the GPU DENSE Hopfield associative memory on the {3,4,3,4}-sized neuron set, via the
// `webgpu` package (Dawn). A corrupted cue relaxes to the nearest stored pattern by energy descent, the
// EMERGENT-layer attractor recall. The bare reversible vibe rule cannot do this (it conserves charge and has
// no attractor, the honest negative shown in test/experiment/associative/hopfield-emergent-recall). This
// runner (1) recalls a 20-percent-corrupted cue on the GPU, (2) checks it agrees with a CPU dense reference
// and recovers the prototype, and (3) benchmarks at scale. Run: pnpm tsx code/compute/run-associative-hopfield.ts.

import { create, globals } from 'webgpu'
import { makeRng } from '@/code/tool/rng'
import { storedPatterns, toneOverlap } from '@/code/operator/hopfield'
import {
  HOPFIELD_OVERLAP_WGSL,
  HOPFIELD_UPDATE_WGSL,
} from '@/code/compute/hopfield.wgsl'

Object.assign(globalThis, globals)
const navigator = { gpu: create([]) }

const WORKGROUP = 256
const POWER = 3
const ITERS = 5
const CHECK_NEURONS = 256
const CHECK_PATTERNS = 20
const BENCH_NEURONS = 4096
const BENCH_PATTERNS = 200

// the CPU dense reference, the same overlap-then-sign update with the same f32 weighting as the shader
function cpuDenseRecall(
  patternsFlat: Int32Array,
  cue: Int32Array,
  n: number,
  p: number,
  power: number,
  iters: number,
): Int32Array {
  let state = Int32Array.from(cue)
  for (let it = 0; it < iters; it++) {
    const overlap = new Int32Array(p)
    for (let mu = 0; mu < p; mu++) {
      let s = 0
      const base = mu * n
      for (let i = 0; i < n; i++) {
        s += patternsFlat[base + i]! * state[i]!
      }

      overlap[mu] = s
    }

    const next = new Int32Array(n)
    for (let i = 0; i < n; i++) {
      let field = 0
      for (let mu = 0; mu < p; mu++) {
        let w = 1
        const o = overlap[mu]!
        for (let e = 1; e < power; e++) {
          w = Math.fround(w * o)
        }

        field = Math.fround(
          field + Math.fround(patternsFlat[mu * n + i]! * w),
        )
      }

      next[i] = field >= 0 ? 1 : -1
    }

    state = next
  }

  return state
}

function agreement(a: Int32Array, b: Int32Array): number {
  let same = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) {
      same++
    }
  }

  return same / a.length
}

async function gpuDenseRecall(input: {
  device: GPUDevice
  overlapPipe: GPUComputePipeline
  updatePipe: GPUComputePipeline
  n: number
  p: number
  patternsFlat: Int32Array
  cue: Int32Array
  iters: number
}): Promise<{ state: Int32Array; ms: number }> {
  const {
    device,
    overlapPipe,
    updatePipe,
    n,
    p,
    patternsFlat,
    cue,
    iters,
  } = input
  const ro = (data: Int32Array | Uint32Array): GPUBuffer => {
    const b = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
    device.queue.writeBuffer(b, 0, data)

    return b
  }

  const params = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })
  device.queue.writeBuffer(params, 0, new Uint32Array([n, p, POWER, 0]))
  const patterns = ro(patternsFlat)
  const overlap = device.createBuffer({
    size: p * 4,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  })
  let stateA = device.createBuffer({
    size: n * 4,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  })
  let stateB = device.createBuffer({
    size: n * 4,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  })
  device.queue.writeBuffer(stateA, 0, cue)

  const t0 = performance.now()
  for (let it = 0; it < iters; it++) {
    const ovBind = device.createBindGroup({
      layout: overlapPipe.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: params } },
        { binding: 1, resource: { buffer: patterns } },
        { binding: 2, resource: { buffer: stateA } },
        { binding: 3, resource: { buffer: overlap } },
      ],
    })
    const upBind = device.createBindGroup({
      layout: updatePipe.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: params } },
        { binding: 1, resource: { buffer: patterns } },
        { binding: 2, resource: { buffer: overlap } },
        { binding: 3, resource: { buffer: stateB } },
      ],
    })
    const enc = device.createCommandEncoder()
    const pass = enc.beginComputePass()
    pass.setPipeline(overlapPipe)
    pass.setBindGroup(0, ovBind)
    pass.dispatchWorkgroups(Math.ceil(p / WORKGROUP))
    pass.setPipeline(updatePipe)
    pass.setBindGroup(0, upBind)
    pass.dispatchWorkgroups(Math.ceil(n / WORKGROUP))
    pass.end()
    device.queue.submit([enc.finish()])
    const tmp = stateA
    stateA = stateB
    stateB = tmp
  }

  const read = device.createBuffer({
    size: n * 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })
  const enc2 = device.createCommandEncoder()
  enc2.copyBufferToBuffer(stateA, 0, read, 0, n * 4)
  device.queue.submit([enc2.finish()])
  await read.mapAsync(GPUMapMode.READ)
  const out = new Int32Array(read.getMappedRange().slice(0))
  read.unmap()

  return { state: out, ms: performance.now() - t0 }
}

function buildPatterns(
  n: number,
  p: number,
  seed: number,
): { flat: Int32Array; list: Int8Array[] } {
  const list = storedPatterns(p, n, makeRng({ seed }))
  const flat = new Int32Array(n * p)
  for (let mu = 0; mu < p; mu++) {
    for (let i = 0; i < n; i++) {
      flat[mu * n + i] = list[mu]![i]!
    }
  }

  return { flat, list }
}

function corrupt(
  pattern: Int8Array,
  fraction: number,
  rng: { nextInt: (i: { max: number }) => number },
): Int32Array {
  const cue = Int32Array.from(pattern)
  const flips = Math.round(fraction * pattern.length)
  for (let k = 0; k < flips; k++) {
    const i = rng.nextInt({ max: pattern.length })
    cue[i] = -cue[i]!
  }

  return cue
}

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.log(
      'no WebGPU adapter available (needs a GPU). The GPU dense Hopfield is written and will run where an adapter is present.',
    )

    return
  }

  const device = await adapter.requestDevice()
  const overlapPipe = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: device.createShaderModule({
        code: HOPFIELD_OVERLAP_WGSL,
      }),
      entryPoint: 'overlap_kernel',
    },
  })
  const updatePipe = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: device.createShaderModule({ code: HOPFIELD_UPDATE_WGSL }),
      entryPoint: 'update_kernel',
    },
  })

  // CHECK, recall a 20-percent-corrupted cue, the GPU agrees with the CPU reference and recovers the prototype
  const n = CHECK_NEURONS
  const p = CHECK_PATTERNS
  const { flat, list } = buildPatterns(n, p, 1)
  const prototype = list[Math.floor(p / 2)]!
  const cue = corrupt(prototype, 0.2, makeRng({ seed: 2 }))

  const cpu = cpuDenseRecall(flat, cue, n, p, POWER, ITERS)
  const gpu = await gpuDenseRecall({
    device,
    overlapPipe,
    updatePipe,
    n,
    p,
    patternsFlat: flat,
    cue,
    iters: ITERS,
  })

  const cpuRecall = toneOverlap(Int8Array.from(cpu), prototype)
  const gpuRecall = toneOverlap(Int8Array.from(gpu.state), prototype)
  const agree = agreement(cpu, gpu.state)

  console.log(
    `dense Hopfield, ${n} neurons, ${p} patterns, power ${POWER}, ${ITERS} relaxation steps`,
  )
  console.log(
    `cue overlap to prototype before recall, ${toneOverlap(Int8Array.from(cue), prototype).toFixed(3)}`,
  )
  console.log(
    `recall overlap to prototype, cpu ${cpuRecall.toFixed(3)}, gpu ${gpuRecall.toFixed(3)}`,
  )
  console.log(
    `gpu vs cpu agreement, ${(agree * 100).toFixed(1)} percent`,
  )

  // BENCHMARK at scale
  const nb = BENCH_NEURONS
  const pb = BENCH_PATTERNS
  const big = buildPatterns(nb, pb, 3)
  const cueB = corrupt(
    big.list[Math.floor(pb / 2)]!,
    0.2,
    makeRng({ seed: 4 }),
  )
  const bench = await gpuDenseRecall({
    device,
    overlapPipe,
    updatePipe,
    n: nb,
    p: pb,
    patternsFlat: big.flat,
    cue: cueB,
    iters: ITERS,
  })
  const benchRecall = toneOverlap(
    Int8Array.from(bench.state),
    big.list[Math.floor(pb / 2)]!,
  )
  console.log(
    `benchmark, ${nb} neurons, ${pb} patterns, ${ITERS} GPU steps in ${bench.ms.toFixed(2)} ms, recall ${benchRecall.toFixed(3)}`,
  )

  const ok = gpuRecall >= 0.99 && cpuRecall >= 0.99 && agree >= 0.98
  if (!ok) {
    console.error(
      'FAIL, the GPU dense Hopfield did not recall the prototype or did not agree with the CPU reference',
    )
    process.exit(1)
  }

  console.log(
    'OK, the GPU dense Hopfield recalls the prototype and agrees with the CPU reference (emergent-layer attractor recall)',
  )
}

const main = run
main()
