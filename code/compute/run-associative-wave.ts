// Headless runner for the GPU associative WAVE on the {3,4,3,4} bulk, via the `webgpu` package (Dawn). The
// comparand spreads from a seed one ring per beat, and the beat each cell is first reached is its graph
// distance. This is the GEOMETRIC LATENCY on real hardware, the whole region is covered in O(log N) beats on
// the hyperbolic bulk. It (1) SELF-CHECKS the GPU arrival beats against the CPU BFS (measure/shells) cell for
// cell, and (2) BENCHMARKS the coverage at scale. Run: pnpm tsx code/compute/run-associative-wave.ts.

import { create, globals } from 'webgpu'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { toCsr } from '@/code/tool/graph'
import { bfsShells } from '@/code/measure/shells'
import { ASSOCIATIVE_WAVE_WGSL } from '@/code/compute/associative-wave.wgsl'

Object.assign(globalThis, globals)

const navigator = { gpu: create([]) }

const WORKGROUP = 256
const CHECK_CELLS = 8000
const BENCH_CELLS = 200000

async function gpuWave(input: {
  device: GPUDevice
  pipeline: GPUComputePipeline
  cellCount: number
  offsetsU: Uint32Array
  adjU: Uint32Array
  seed: number
}): Promise<{ arrival: Int32Array; beats: number; ms: number }> {
  const { device, pipeline, cellCount, offsetsU, adjU, seed } = input

  const ro = (data: Uint32Array): GPUBuffer => {
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

  const offsets = ro(offsetsU)
  const adj = ro(adjU)
  const arrivalInit = new Int32Array(cellCount).fill(-1)
  arrivalInit[seed] = 0

  const arrival = device.createBuffer({
    size: cellCount * 4,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  })

  device.queue.writeBuffer(arrival, 0, arrivalInit)

  const changed = device.createBuffer({
    size: 4,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  })

  const changedRead = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  const bind = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: params } },
      { binding: 1, resource: { buffer: offsets } },
      { binding: 2, resource: { buffer: adj } },
      { binding: 3, resource: { buffer: arrival } },
      { binding: 4, resource: { buffer: changed } },
    ],
  })

  const t0 = performance.now()

  let beats = 0

  for (let beat = 1; beat < cellCount; beat++) {
    device.queue.writeBuffer(
      params,
      0,
      new Uint32Array([cellCount, beat, 0, 0]),
    )
    device.queue.writeBuffer(changed, 0, new Uint32Array([0]))

    const enc = device.createCommandEncoder()
    const pass = enc.beginComputePass()
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bind)
    pass.dispatchWorkgroups(Math.ceil(cellCount / WORKGROUP))
    pass.end()
    enc.copyBufferToBuffer(changed, 0, changedRead, 0, 4)
    device.queue.submit([enc.finish()])
    await changedRead.mapAsync(GPUMapMode.READ)

    const c = new Uint32Array(changedRead.getMappedRange())[0]!
    changedRead.unmap()

    if (c === 0) {
      break
    }

    beats = beat
  }

  const ms = performance.now() - t0

  const arrivalRead = device.createBuffer({
    size: cellCount * 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  const enc2 = device.createCommandEncoder()
  enc2.copyBufferToBuffer(arrival, 0, arrivalRead, 0, cellCount * 4)
  device.queue.submit([enc2.finish()])
  await arrivalRead.mapAsync(GPUMapMode.READ)

  const out = new Int32Array(arrivalRead.getMappedRange().slice(0))
  arrivalRead.unmap()

  return { arrival: out, beats, ms }
}

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    console.log(
      'no WebGPU adapter available (needs a GPU). The GPU wave is written and will run where an adapter is present.',
    )

    return
  }

  const device = await adapter.requestDevice()
  const module = device.createShaderModule({
    code: ASSOCIATIVE_WAVE_WGSL,
  })

  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module, entryPoint: 'wave_kernel' },
  })

  // CHECK, the GPU arrival beats equal the CPU BFS depth cell for cell
  const g = buildCellGraph({
    symbol: [3, 4, 3, 4],
    maxCells: CHECK_CELLS,
  })

  const n = g.cellCount
  const csr = toCsr(g.neighbors)
  const w = await gpuWave({
    device,
    pipeline,
    cellCount: n,
    offsetsU: csr.offsets,
    adjU: csr.adj,
    seed: 0,
  })

  const cpuDepth = bfsShells({ neighbors: g.neighbors, root: 0 }).depth

  let mismatches = 0
  let gpuCoverage = 0

  for (let c = 0; c < n; c++) {
    if (w.arrival[c] !== cpuDepth[c]) {
      mismatches++
    }

    if (w.arrival[c]! > gpuCoverage) {
      gpuCoverage = w.arrival[c]!
    }
  }

  let cpuCoverage = 0

  for (let c = 0; c < n; c++) {
    if (cpuDepth[c]! > cpuCoverage) {
      cpuCoverage = cpuDepth[c]!
    }
  }

  console.log(`{3,4,3,4} bulk, ${n} cells`)
  console.log(
    `GPU wave coverage ${gpuCoverage} beats, CPU BFS coverage ${cpuCoverage} beats, per-cell mismatches ${mismatches}`,
  )

  // BENCHMARK at scale
  const gb = buildCellGraph({
    symbol: [3, 4, 3, 4],
    maxCells: BENCH_CELLS,
  })

  const csrb = toCsr(gb.neighbors)
  const wb = await gpuWave({
    device,
    pipeline,
    cellCount: gb.cellCount,
    offsetsU: csrb.offsets,
    adjU: csrb.adj,
    seed: 0,
  })

  console.log(
    `benchmark, ${gb.cellCount.toLocaleString()} cells covered by the GPU wave in ${wb.beats} beats, ${wb.ms.toFixed(2)} ms`,
  )

  if (mismatches > 0 || gpuCoverage !== cpuCoverage) {
    console.error(
      'MISMATCH, the GPU wave arrival beats do not equal the CPU BFS',
    )
    process.exit(1)
  }

  console.log(
    'OK, the GPU wave equals the CPU BFS, coverage is logarithmic in the cell count',
  )
}

const main = run
void main()
