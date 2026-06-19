// Headless runner for the GPU content-addressable associative MATCH on the {3,4,3,4} bulk, via the `webgpu`
// package (Dawn). It (1) SELF-CHECKS the GPU responder set against the CPU ground truth (operator
// associative-memory) bit for bit, and (2) BENCHMARKS the parallel match at scale. The GPU does the whole
// content search in one dispatch, the maximally parallel realization of Potter's associative search.
// Run: pnpm tsx code/compute/run-associative.ts   (after `pnpm add webgpu`, needs a GPU adapter).

import { create, globals } from 'webgpu'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import {
  makeAssociativeMemory,
  ternaryWord,
  storeWord,
  readWord,
  searchExact,
  search,
} from '@/code/operator/associative-memory'
import { ASSOCIATIVE_MATCH_WGSL } from '@/code/compute/associative.wgsl'

Object.assign(globalThis, globals)
const navigator = { gpu: create([]) }

const WORKGROUP = 256
const WORD_BITS = 21
const CHECK_CELLS = 4000
const BENCH_CELLS = 200000

async function gpuResponders(input: {
  device: GPUDevice
  pipeline: GPUComputePipeline
  cellCount: number
  wordBits: number
  minScore: number
  wordsU: Uint32Array
  comparandU: Uint32Array
  maskU: Uint32Array
}): Promise<{ responders: Uint32Array; ms: number }> {
  const {
    device,
    pipeline,
    cellCount,
    wordBits,
    minScore,
    wordsU,
    comparandU,
    maskU,
  } = input
  const storage = (data: Uint32Array, extra = 0): GPUBuffer => {
    const b = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | extra,
    })
    device.queue.writeBuffer(b, 0, data)
    return b
  }
  const params = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })
  device.queue.writeBuffer(
    params,
    0,
    new Uint32Array([cellCount, wordBits, minScore, 0]),
  )
  const words = storage(wordsU)
  const comparand = storage(comparandU)
  const mask = storage(maskU)
  const scores = storage(new Uint32Array(cellCount))
  const responders = device.createBuffer({
    size: cellCount * 4,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  })
  const readback = device.createBuffer({
    size: cellCount * 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  const bind = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: params } },
      { binding: 1, resource: { buffer: words } },
      { binding: 2, resource: { buffer: comparand } },
      { binding: 3, resource: { buffer: mask } },
      { binding: 4, resource: { buffer: scores } },
      { binding: 5, resource: { buffer: responders } },
    ],
  })

  const t0 = performance.now()
  const enc = device.createCommandEncoder()
  const pass = enc.beginComputePass()
  pass.setPipeline(pipeline)
  pass.setBindGroup(0, bind)
  pass.dispatchWorkgroups(Math.ceil(cellCount / WORKGROUP))
  pass.end()
  enc.copyBufferToBuffer(responders, 0, readback, 0, cellCount * 4)
  device.queue.submit([enc.finish()])
  await readback.mapAsync(GPUMapMode.READ)
  const out = new Uint32Array(readback.getMappedRange().slice(0))
  readback.unmap()
  const ms = performance.now() - t0
  return { responders: out, ms }
}

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.log(
      'no WebGPU adapter available (needs a GPU). The GPU associative match is written and will run where an adapter is present.',
    )
    return
  }
  const device = await adapter.requestDevice()
  const module = device.createShaderModule({
    code: ASSOCIATIVE_MATCH_WGSL,
  })
  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module, entryPoint: 'match_kernel' },
  })

  // CHECK, the GPU responder set equals the CPU ground truth, exact and partial
  const g = buildCellGraph({
    symbol: [3, 4, 3, 4],
    maxCells: CHECK_CELLS,
  })
  const n = g.cellCount
  const mem = makeAssociativeMemory({
    neighbors: g.neighbors,
    wordBits: WORD_BITS,
  })
  for (let c = 0; c < n; c++)
    storeWord(mem, c, ternaryWord(c, WORD_BITS))
  const wordsU = Uint32Array.from(mem.words)
  const maskU = new Uint32Array(WORD_BITS).fill(1)

  // pick a query, the stored word of a mid cell, exact match must return exactly that cell
  const queryCell = Math.floor(n / 2)
  const comparandU = Uint32Array.from(readWord(mem, queryCell))

  const cpuExact = searchExact({ mem, comparand: comparandU })
  const gpuExact = await gpuResponders({
    device,
    pipeline,
    cellCount: n,
    wordBits: WORD_BITS,
    minScore: WORD_BITS,
    wordsU,
    comparandU,
    maskU,
  })
  const gpuExactCells: number[] = []
  for (let c = 0; c < n; c++)
    if (gpuExact.responders[c] === 1) gpuExactCells.push(c)
  const exactMatch =
    cpuExact.length === gpuExactCells.length &&
    cpuExact.every((c, i) => c === gpuExactCells[i])

  // a partial query, minScore below full, the responder sets must agree
  const minScore = WORD_BITS - 3
  const cpuPartial = search({ mem, comparand: comparandU, minScore })
  const gpuPartial = await gpuResponders({
    device,
    pipeline,
    cellCount: n,
    wordBits: WORD_BITS,
    minScore,
    wordsU,
    comparandU,
    maskU,
  })
  const gpuPartialCells: number[] = []
  for (let c = 0; c < n; c++)
    if (gpuPartial.responders[c] === 1) gpuPartialCells.push(c)
  const partialMatch =
    cpuPartial.length === gpuPartialCells.length &&
    cpuPartial.every((c, i) => c === gpuPartialCells[i])

  console.log(`{3,4,3,4} bulk, ${n} cells, word ${WORD_BITS} trits`)
  console.log(
    `exact match, cpu ${cpuExact.length} responder(s), gpu ${gpuExactCells.length}, agree ${exactMatch}`,
  )
  console.log(
    `partial match (minScore ${minScore}), cpu ${cpuPartial.length}, gpu ${gpuPartialCells.length}, agree ${partialMatch}`,
  )

  // BENCHMARK at scale
  const gb = buildCellGraph({
    symbol: [3, 4, 3, 4],
    maxCells: BENCH_CELLS,
  })
  const nb = gb.cellCount
  const memb = makeAssociativeMemory({
    neighbors: gb.neighbors,
    wordBits: WORD_BITS,
  })
  for (let c = 0; c < nb; c++)
    storeWord(memb, c, ternaryWord(c, WORD_BITS))
  const wordsUb = Uint32Array.from(memb.words)
  const comparandUb = Uint32Array.from(
    readWord(memb, Math.floor(nb / 2)),
  )
  const bench = await gpuResponders({
    device,
    pipeline,
    cellCount: nb,
    wordBits: WORD_BITS,
    minScore: WORD_BITS,
    wordsU: wordsUb,
    comparandU: comparandUb,
    maskU,
  })
  console.log(
    `benchmark, ${nb.toLocaleString()} cells searched on the GPU in ${bench.ms.toFixed(2)} ms (one parallel dispatch)`,
  )

  if (!exactMatch || !partialMatch) {
    console.error(
      'MISMATCH, the GPU responder set does not equal the CPU ground truth',
    )
    process.exit(1)
  }
  console.log(
    'OK, the GPU associative match equals the CPU ground truth',
  )
}

const main = run
main()
