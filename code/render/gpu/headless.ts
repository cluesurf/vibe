// The HEADLESS adapter, render a FoldScene into an offscreen texture and read the pixels back to RGBA. This is
// the counterpart of the browser engine, both draw the same device-agnostic core (fold-scene.ts), one into a
// canvas swap-chain, the other into a readback texture for PNG / GIF. The Dawn `webgpu` device is created by the
// caller (a Node runner) and passed in, so this file stays free of any node-only import and can be reasoned
// about as plain WebGPU.

import {
  createFoldScene,
  type FoldMode,
  type FoldScene,
} from '@/code/render/gpu/fold-scene'

// the readback texture format. SIZE * 4 is 256-aligned for the common sizes, so no row padding on copy.
const READBACK_FORMAT: GPUTextureFormat = 'rgba8unorm'

// create a fold core wired for offscreen readback in the given format
export function createHeadlessFoldScene(input: {
  device: GPUDevice
  symbol: number[]
  mode: FoldMode
}): FoldScene {
  return createFoldScene({
    device: input.device,
    format: READBACK_FORMAT,
    symbol: input.symbol,
    mode: input.mode,
  })
}

// render one frame of a (camera-set) FoldScene to an RGBA pixel buffer of side `size`
export async function renderFoldToRgba(input: {
  device: GPUDevice
  scene: FoldScene
  size: number
}): Promise<Uint8Array> {
  const { device, scene, size } = input
  const target = device.createTexture({
    size: { width: size, height: size },
    format: READBACK_FORMAT,
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  })

  const encoder = device.createCommandEncoder()
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: target.createView(),
        loadOp: 'clear',
        storeOp: 'store',
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
      },
    ],
  })

  scene.draw(pass)
  pass.end()

  const bytesPerRow = size * 4
  const pixelBuffer = device.createBuffer({
    size: bytesPerRow * size,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  })

  encoder.copyTextureToBuffer(
    { texture: target },
    { buffer: pixelBuffer, bytesPerRow, rowsPerImage: size },
    { width: size, height: size },
  )
  device.queue.submit([encoder.finish()])
  await pixelBuffer.mapAsync(GPUMapMode.READ)
  const rgba = new Uint8Array(pixelBuffer.getMappedRange().slice(0))
  pixelBuffer.unmap()
  target.destroy()
  pixelBuffer.destroy()

  return rgba
}
