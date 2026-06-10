// Headless Node runner for the GPU vibe field, via the `webgpu` package (Dawn). It (1) SELF-CHECKS the GPU
// against a CPU reference of the exact same rule on a small grid, so a green run proves correctness, and (2)
// BENCHMARKS a large grid (millions of cells) to report beats per second. The same WGSL (./wave.wgsl) runs in
// the browser via the built-in navigator.gpu, so this is the headless half of the shared engine.
// Run: pnpm tsx code/gpu/run-wave.ts   (after `pnpm add webgpu`)
// See note/plan/vibe-webgpu-billion-cell-sim.md.

import { create, globals } from 'webgpu'
import { WAVE_STEP_WGSL } from '~/gpu/wave.wgsl'

// install the WebGPU global constants (GPUBufferUsage, GPUMapMode, ...) and the navigator.gpu entry point
Object.assign(globalThis, globals)
const navigator = { gpu: create([]) }

const WORKGROUP = 256

// pack a tone pair into the u32 the shader expects, current in the low 2 bits, previous in bits 2..3
const pack = (current: number, previous: number): number => (previous << 2) | current
const currentOf = (packed: number): number => packed & 3

// the CPU reference, one beat of the exact same rule, so the GPU output can be validated against it
function cpuStep(state: Uint32Array, width: number, height: number): Uint32Array {
  const out = new Uint32Array(state.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const xl = x === 0 ? width - 1 : x - 1
      const xr = x === width - 1 ? 0 : x + 1
      const yu = y === 0 ? height - 1 : y - 1
      const yd = y === height - 1 ? 0 : y + 1
      const cur = currentOf(state[i]!)
      const prev = (state[i]! >> 2) & 3
      const s =
        currentOf(state[y * width + xl]!) +
        currentOf(state[y * width + xr]!) +
        currentOf(state[yu * width + x]!) +
        currentOf(state[yd * width + x]!)
      const nx = (s + 9 - prev) % 3
      out[i] = pack(nx, cur)
    }
  }
  return out
}

// build the compute pipeline and a ping-pong pair of state buffers for a width x height field
function makeField(device: GPUDevice, init: Uint32Array, width: number, height: number) {
  const count = width * height
  const byteLength = count * 4

  const params = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST })
  device.queue.writeBuffer(params, 0, new Uint32Array([width, height, count, 0]))

  const make = (): GPUBuffer =>
    device.createBuffer({ size: byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST })
  const bufA = make()
  const bufB = make()
  device.queue.writeBuffer(bufA, 0, init)

  const module = device.createShaderModule({ code: WAVE_STEP_WGSL })
  const pipeline = device.createComputePipeline({ layout: 'auto', compute: { module, entryPoint: 'main' } })
  const layout = pipeline.getBindGroupLayout(0)

  const bind = (read: GPUBuffer, write: GPUBuffer): GPUBindGroup =>
    device.createBindGroup({
      layout,
      entries: [
        { binding: 0, resource: { buffer: params } },
        { binding: 1, resource: { buffer: read } },
        { binding: 2, resource: { buffer: write } },
      ],
    })

  return { count, byteLength, pipeline, bind, bufs: [bufA, bufB] as [GPUBuffer, GPUBuffer] }
}

async function readBack(device: GPUDevice, buffer: GPUBuffer, byteLength: number): Promise<Uint32Array> {
  const staging = device.createBuffer({ size: byteLength, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ })
  const enc = device.createCommandEncoder()
  enc.copyBufferToBuffer(buffer, 0, staging, 0, byteLength)
  device.queue.submit([enc.finish()])
  await staging.mapAsync(GPUMapMode.READ)
  const copy = new Uint32Array(staging.getMappedRange().slice(0))
  staging.unmap()
  return copy
}

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.log('no WebGPU adapter available (needs a GPU, e.g. Metal on macOS)')
    return
  }
  const device = await adapter.requestDevice()

  // (1) SELF-CHECK, a small grid, GPU vs CPU, identical means the kernel is correct
  const sw = 96
  const sh = 96
  const beats = 60
  const seed = new Uint32Array(sw * sh)
  // a deterministic pseudo-random field in both tone slots, so the second-order rule has history
  let r = 123456789
  const nextR = (): number => {
    r = (r * 1103515245 + 12345) & 0x7fffffff
    return r / 0x7fffffff
  }
  for (let i = 0; i < seed.length; i++) seed[i] = pack(Math.floor(nextR() * 3), Math.floor(nextR() * 3))

  const field = makeField(device, seed, sw, sh)
  const dispatch = Math.ceil(field.count / WORKGROUP)
  let src = 0
  for (let b = 0; b < beats; b++) {
    const enc = device.createCommandEncoder()
    const pass = enc.beginComputePass()
    pass.setPipeline(field.pipeline)
    pass.setBindGroup(0, field.bind(field.bufs[src]!, field.bufs[1 - src]!))
    pass.dispatchWorkgroups(dispatch)
    pass.end()
    device.queue.submit([enc.finish()])
    src = 1 - src
  }
  const gpuOut = await readBack(device, field.bufs[src]!, field.byteLength)

  let cpu = seed.slice()
  for (let b = 0; b < beats; b++) cpu = cpuStep(cpu, sw, sh)
  let mismatches = 0
  for (let i = 0; i < cpu.length; i++) if (currentOf(cpu[i]!) !== currentOf(gpuOut[i]!)) mismatches++
  const selfCheckOk = mismatches === 0
  console.log(`self-check ${sw}x${sh}, ${beats} beats: GPU vs CPU mismatches ${mismatches} -> ${selfCheckOk ? 'IDENTICAL' : 'FAIL'}`)

  // (2) BENCHMARK, a large grid, beats per second
  const bw = 2048
  const bh = 2048
  const big = new Uint32Array(bw * bh)
  big[(bh >> 1) * bw + (bw >> 1)] = pack(1, 0) // a single pulse at the centre
  const bigField = makeField(device, big, bw, bh)
  const bigDispatch = Math.ceil(bigField.count / WORKGROUP)
  const benchBeats = 200
  // warm up
  {
    const enc = device.createCommandEncoder()
    const pass = enc.beginComputePass()
    pass.setPipeline(bigField.pipeline)
    pass.setBindGroup(0, bigField.bind(bigField.bufs[0]!, bigField.bufs[1]!))
    pass.dispatchWorkgroups(bigDispatch)
    pass.end()
    device.queue.submit([enc.finish()])
  }
  await device.queue.onSubmittedWorkDone()

  const start = performance.now()
  let bsrc = 0
  for (let b = 0; b < benchBeats; b++) {
    const enc = device.createCommandEncoder()
    const pass = enc.beginComputePass()
    pass.setPipeline(bigField.pipeline)
    pass.setBindGroup(0, bigField.bind(bigField.bufs[bsrc]!, bigField.bufs[1 - bsrc]!))
    pass.dispatchWorkgroups(bigDispatch)
    pass.end()
    device.queue.submit([enc.finish()])
    bsrc = 1 - bsrc
  }
  await device.queue.onSubmittedWorkDone()
  const seconds = (performance.now() - start) / 1000
  const beatsPerSec = benchBeats / seconds
  const cellsPerSec = beatsPerSec * bigField.count

  console.log(`benchmark ${bw}x${bh} = ${bigField.count.toLocaleString()} cells, ${benchBeats} beats in ${seconds.toFixed(2)}s`)
  console.log(`  ${beatsPerSec.toFixed(1)} beats/sec, ${(cellsPerSec / 1e9).toFixed(2)} billion cell-updates/sec`)
  console.log(selfCheckOk ? 'OK, the GPU field is correct and fast' : 'FAILED self-check')
}

run().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e))
})
