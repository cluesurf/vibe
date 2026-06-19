// Headless GPU rendering of the vibe field to a PNG, via the `webgpu` package (Dawn). It runs the wave on
// the GPU (compute), renders the final state with the shared render shader (./wave.wgsl) to an offscreen
// texture, reads the pixels back, and writes a PNG, all in Node, no browser. This is the headless
// visualization path, the same WGSL also drives the live browser viz.
// Run: pnpm tsx code/gpu/render-wave.ts   (after `pnpm add webgpu`)
// See note/plan/vibe-webgpu-billion-cell-sim.md.

import { create, globals } from 'webgpu'
import zlib from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  WAVE_STEP_WGSL,
  WAVE_RENDER_WGSL,
} from '@/code/compute/wave.wgsl'
import { pack } from '@/code/tone/pack'

Object.assign(globalThis, globals)

const navigator = { gpu: create([]) }

const WORKGROUP = 256
const SIZE = 1024 // both the simulation grid and the rendered image are SIZE x SIZE (row stride is 256-aligned)
const BEATS = 320 // enough for the central pulse to grow a wide interference lightcone

// a minimal PNG encoder (no dependencies), RGBA, 8-bit, using Node's zlib for the IDAT stream
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)

  for (let n = 0; n < 256; n++) {
    let c = n

    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }

    t[n] = c >>> 0
  }

  return t
})()

function crc32(buf: Buffer): number {
  let c = 0xffffffff

  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]!) & 0xff]! ^ (c >>> 8)
  }

  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)

  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)

  return Buffer.concat([len, body, crc])
}

function encodePng(
  rgba: Uint8Array,
  width: number,
  height: number,
): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type 6, RGBA

  const stride = width * 4
  const raw = Buffer.alloc(height * (stride + 1))

  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter type 0 (none) per scanline
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1,
    )
  }

  const idat = zlib.deflateSync(raw)

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

async function run(): Promise<void> {
  const adapter = await navigator.gpu.requestAdapter()

  if (!adapter) {
    console.log(
      'no WebGPU adapter available (needs a GPU, e.g. Metal on macOS)',
    )

    return
  }

  const device = await adapter.requestDevice()

  const count = SIZE * SIZE
  const byteLength = count * 4

  // params uniform, shared by the compute and render pipelines
  const params = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  device.queue.writeBuffer(
    params,
    0,
    new Uint32Array([SIZE, SIZE, count, 0]),
  )

  // a single central pulse, the cleanest expanding relativistic lightcone
  const seed = new Uint32Array(count)
  seed[(SIZE >> 1) * SIZE + (SIZE >> 1)] = pack({
    current: 1,
    previous: 0,
  })

  const makeBuf = (): GPUBuffer =>
    device.createBuffer({
      size: byteLength,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
    })

  const bufs: [GPUBuffer, GPUBuffer] = [makeBuf(), makeBuf()]
  device.queue.writeBuffer(bufs[0], 0, seed)

  // compute pipeline, the wave step
  const stepModule = device.createShaderModule({ code: WAVE_STEP_WGSL })
  const stepPipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module: stepModule, entryPoint: 'main' },
  })

  const stepLayout = stepPipeline.getBindGroupLayout(0)
  const stepBind = (read: GPUBuffer, write: GPUBuffer): GPUBindGroup =>
    device.createBindGroup({
      layout: stepLayout,
      entries: [
        { binding: 0, resource: { buffer: params } },
        { binding: 1, resource: { buffer: read } },
        { binding: 2, resource: { buffer: write } },
      ],
    })

  const dispatch = Math.ceil(count / WORKGROUP)

  let src = 0

  for (let b = 0; b < BEATS; b++) {
    const enc = device.createCommandEncoder()
    const pass = enc.beginComputePass()
    pass.setPipeline(stepPipeline)
    pass.setBindGroup(0, stepBind(bufs[src]!, bufs[1 - src]!))
    pass.dispatchWorkgroups(dispatch)
    pass.end()
    device.queue.submit([enc.finish()])
    src = 1 - src
  }

  // render pipeline, colour the final state into an offscreen texture
  const renderModule = device.createShaderModule({
    code: WAVE_RENDER_WGSL,
  })

  const renderPipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: renderModule, entryPoint: 'vs' },
    fragment: {
      module: renderModule,
      entryPoint: 'fs',
      targets: [{ format: 'rgba8unorm' }],
    },
    primitive: { topology: 'triangle-list' },
  })

  const target = device.createTexture({
    size: { width: SIZE, height: SIZE },
    format: 'rgba8unorm',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  })

  const renderBind = device.createBindGroup({
    layout: renderPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: params } },
      { binding: 1, resource: { buffer: bufs[src]! } },
    ],
  })

  const renderEnc = device.createCommandEncoder()
  const renderPass = renderEnc.beginRenderPass({
    colorAttachments: [
      {
        view: target.createView(),
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
      },
    ],
  })

  renderPass.setPipeline(renderPipeline)
  renderPass.setBindGroup(0, renderBind)
  renderPass.draw(3)
  renderPass.end()

  // copy the rendered texture into a buffer and read it back (row stride must be 256-aligned, SIZE*4 is)
  const bytesPerRow = SIZE * 4
  const pixelBuffer = device.createBuffer({
    size: bytesPerRow * SIZE,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  renderEnc.copyTextureToBuffer(
    { texture: target },
    { buffer: pixelBuffer, bytesPerRow, rowsPerImage: SIZE },
    { width: SIZE, height: SIZE },
  )
  device.queue.submit([renderEnc.finish()])
  await pixelBuffer.mapAsync(GPUMapMode.READ)

  const rgba = new Uint8Array(pixelBuffer.getMappedRange().slice(0))
  pixelBuffer.unmap()

  const outDir = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'make',
  )

  mkdirSync(outDir, { recursive: true })

  const outPath = join(outDir, 'field.png')
  writeFileSync(outPath, encodePng(rgba, SIZE, SIZE))
  console.log(
    `rendered ${SIZE}x${SIZE} field after ${BEATS} beats, wrote ${outPath}`,
  )
}

run().catch(e => {
  console.error(e instanceof Error ? e.message : String(e))
})
