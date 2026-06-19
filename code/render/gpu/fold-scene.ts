// The device-agnostic WebGPU fold renderer, the shared core under every WebGPU output (the headless PNG / GIF
// readback adapter AND the browser canvas / React adapter). It compiles the fold shader for a mode, builds the
// pipeline, the uniform buffer, and the bind group, and exposes a `draw` that records into ANY render pass, so
// the same core renders into an offscreen texture for readback or into a canvas swap-chain texture in the
// browser. The camera uniform is written through uniform.ts, the single byte-layout source of truth.

import { canonicalMirrors } from '@/code/render/mirrors'
import {
  FOLD_2D_WGSL,
  FOLD_3D_WGSL,
  FOLD_3D_INTERIOR_WGSL,
} from '@/code/render/fold.wgsl'
import {
  packFold2D,
  packFold3D,
  type Fold2DUniform,
  type Fold3DUniform,
} from '@/code/render/gpu/uniform'

export type FoldMode = '2d' | '3d' | '3d-interior'

const WGSL: Record<FoldMode, string> = {
  '2d': FOLD_2D_WGSL,
  '3d': FOLD_3D_WGSL,
  '3d-interior': FOLD_3D_INTERIOR_WGSL,
}

export type FoldScene = {
  readonly mode: FoldMode
  readonly mirrors: number[][]
  setCamera2D(camera: Fold2DUniform): void
  setCamera3D(camera: Fold3DUniform): void
  draw(pass: GPURenderPassEncoder): void
  dispose(): void
}

export function createFoldScene(input: {
  device: GPUDevice
  format: GPUTextureFormat
  symbol: number[]
  mode: FoldMode
}): FoldScene {
  const { device, format, symbol, mode } = input
  const mirrors = canonicalMirrors(symbol)
  const module = device.createShaderModule({ code: WGSL[mode] })
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module, entryPoint: 'vs' },
    fragment: { module, entryPoint: 'fs', targets: [{ format }] },
    primitive: { topology: 'triangle-list' },
  })
  const byteLength = mode === '2d' ? 80 : 112
  const uniform = device.createBuffer({
    size: byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniform } }],
  })

  return {
    mode,
    mirrors,
    setCamera2D(camera) {
      device.queue.writeBuffer(uniform, 0, packFold2D(mirrors, camera))
    },
    setCamera3D(camera) {
      device.queue.writeBuffer(uniform, 0, packFold3D(mirrors, camera))
    },
    draw(pass) {
      pass.setPipeline(pipeline)
      pass.setBindGroup(0, bindGroup)
      pass.draw(3)
    },
    dispose() {
      uniform.destroy()
    },
  }
}
