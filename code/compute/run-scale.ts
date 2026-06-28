// Scale sweep for the flat GPU vibe field, via the `webgpu` package (Dawn). Benchmarks the wave compute at
// growing grid sizes and reports the ceiling on this machine, cells, beats per second, and billions of
// cell-updates per second. The flat field needs no neighbour table (fixed offsets), so memory is just the
// two state buffers. Run: pnpm tsx code/gpu/run-scale.ts   (after `pnpm add webgpu`)

import { create, globals } from 'webgpu'
import { WAVE_STEP_WGSL } from '@/code/compute/wave.wgsl'

Object.assign(globalThis, globals)

const navigator = { gpu: create([]) }

const WORKGROUP = 256
const SIZES = [1024, 2048, 4096, 8192, 16384] // 1M, 4M, 16.8M, 67M, 268M cells
const BENCH_BEATS = 120

async function benchOne(
  device: GPUDevice,
  size: number,
): Promise<{ cells: number; beatsPerSec: number; ok: boolean }> {
  const count = size * size
  const byteLength = count * 4

  // WebGPU validation errors are async, so guard proactively against the device's storage-buffer limit
  if (byteLength > Number(device.limits.maxStorageBufferBindingSize)) {
    throw new Error(
      `buffer ${(byteLength / 1e6).toFixed(0)}MB over device limit ${(Number(device.limits.maxStorageBufferBindingSize) / 1e6).toFixed(0)}MB`,
    )
  }

  // 2D dispatch so the workgroup count per dimension stays under 65535
  const groups = Math.ceil(count / WORKGROUP)
  const gx = Math.min(groups, 65535)
  const gy = Math.ceil(groups / gx)
  const strideX = gx * WORKGROUP

  const params = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  device.queue.writeBuffer(
    params,
    0,
    new Uint32Array([size, size, count, strideX]),
  )

  const make = (): GPUBuffer =>
    device.createBuffer({
      size: byteLength,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
    })

  const bufs: [GPUBuffer, GPUBuffer] = [make(), make()]
  // a single central pulse (cheap to seed at huge sizes, no big CPU array upload beyond zeros)
  device.queue.writeBuffer(
    bufs[0],
    ((count >> 1) + (size >> 1)) * 4,
    new Uint32Array([1]),
  )

  const module = device.createShaderModule({ code: WAVE_STEP_WGSL })
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
      ],
    })

  // warm up
  {
    const enc = device.createCommandEncoder()
    const pass = enc.beginComputePass()
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bind(bufs[0], bufs[1]))
    pass.dispatchWorkgroups(gx, gy)
    pass.end()
    device.queue.submit([enc.finish()])
  }

  await device.queue.onSubmittedWorkDone()

  const start = performance.now()

  let src = 0

  for (let b = 0; b < BENCH_BEATS; b++) {
    const enc = device.createCommandEncoder()
    const pass = enc.beginComputePass()
    pass.setPipeline(pipeline)
    pass.setBindGroup(0, bind(bufs[src]!, bufs[1 - src]!))
    pass.dispatchWorkgroups(gx, gy)
    pass.end()
    device.queue.submit([enc.finish()])
    src = 1 - src
  }

  await device.queue.onSubmittedWorkDone()

  const seconds = (performance.now() - start) / 1000
  bufs[0].destroy()
  bufs[1].destroy()

  return { cells: count, beatsPerSec: BENCH_BEATS / seconds, ok: true }
}

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    console.log('no WebGPU adapter available (needs a GPU)')

    return
  }

  const device = await adapter.requestDevice()
  console.log('flat field GPU scale sweep')
  console.log(
    `  ${'grid'.padEnd(12)} ${'cells'.padEnd(14)} ${'beats/sec'.padEnd(12)} cell-updates/sec`,
  )

  for (const size of SIZES) {
    try {
      const r = await benchOne(device, size)
      const cps = r.beatsPerSec * r.cells
      console.log(
        `  ${`${size}x${size}`.padEnd(12)} ${r.cells.toLocaleString().padEnd(14)} ${r.beatsPerSec.toFixed(0).padEnd(12)} ${(cps / 1e9).toFixed(1)} billion`,
      )
    } catch (e) {
      console.log(
        `  ${`${size}x${size}`.padEnd(12)} skipped (${e instanceof Error ? e.message : String(e)})`,
      )
    }
  }
}

run().catch(e => {
  console.error(e instanceof Error ? e.message : String(e))
})
