// The BROWSER adapter, an interactive WebGPU renderer on a canvas. It is the in-browser counterpart of the
// headless readback adapter, both sit on the same device-agnostic core (fold-scene.ts), the same camera
// (camera.ts), and the same controls (input.ts), so nothing about the tiling math or the navigation is
// duplicated per target. This adapter draws straight into the canvas swap-chain texture (no readback) every
// animation frame, which is the fast path, 100% WebGPU.
//
// The React component (code/render/react) is a thin mount over this. Use createVibeRenderer in any host.

import {
  createFoldScene,
  type FoldMode,
  type FoldScene,
} from '@/code/render/gpu/fold-scene'
import { makeCamera, type Camera } from '@/code/render/gpu/camera'
import { attachControls, type Controls } from '@/code/render/gpu/input'

export type VibeRenderer = {
  readonly camera: Camera
  setTiling(input: { symbol: number[]; mode: FoldMode }): void
  dispose(): void
}

export async function createVibeRenderer(input: {
  canvas: HTMLCanvasElement
  symbol: number[]
  mode: FoldMode
}): Promise<VibeRenderer> {
  const gpu = (navigator as unknown as { gpu?: GPU }).gpu

  if (!gpu) {
    throw new Error('WebGPU is not available in this browser')
  }

  const adapter = await gpu.requestAdapter()

  if (!adapter) {
    throw new Error(
      'no WebGPU adapter (the GPU may be blocked or unavailable)',
    )
  }

  const device = await adapter.requestDevice()
  const context = input.canvas.getContext(
    'webgpu',
  ) as GPUCanvasContext | null

  if (!context) {
    throw new Error('could not get a webgpu canvas context')
  }

  const format = gpu.getPreferredCanvasFormat()
  context.configure({ device, format, alphaMode: 'opaque' })

  let mode: FoldMode = input.mode
  let symbol = input.symbol
  let scene: FoldScene = createFoldScene({
    device,
    format,
    symbol,
    mode,
  })

  let camera: Camera = makeCamera(mode)
  let controls: Controls = attachControls({
    canvas: input.canvas,
    camera,
  })

  // keep the drawing buffer matched to the displayed size and the device pixel ratio
  const resize = (): void => {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = Math.max(1, Math.floor(input.canvas.clientWidth * dpr))
    const h = Math.max(1, Math.floor(input.canvas.clientHeight * dpr))

    if (input.canvas.width !== w || input.canvas.height !== h) {
      input.canvas.width = w
      input.canvas.height = h
    }
  }

  const observer = new ResizeObserver(resize)
  observer.observe(input.canvas)
  resize()

  let last = performance.now()
  let running = true
  let frame = 0

  const renderLoop = (now: number): void => {
    if (!running) {
      return
    }

    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    controls.tick(dt)

    // the live viewport aspect so the disk stays circular and the honeycomb keeps its proportions on any canvas
    const aspect =
      input.canvas.height > 0
        ? input.canvas.width / input.canvas.height
        : 1

    if (mode === '2d') {
      scene.setCamera2D({ ...camera.uniform2D(), aspect })
    } else {
      scene.setCamera3D({ ...camera.uniform3D(), aspect })
    }

    const encoder = device.createCommandEncoder()
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: 'clear',
          storeOp: 'store',
          clearValue: { r: 0.04, g: 0.04, b: 0.05, a: 1 },
        },
      ],
    })

    scene.draw(pass)
    pass.end()
    device.queue.submit([encoder.finish()])
    frame = requestAnimationFrame(renderLoop)
  }

  frame = requestAnimationFrame(renderLoop)

  return {
    get camera() {
      return camera
    },
    setTiling(next) {
      // rebuild the core for a new symbol or mode, rewiring the camera and controls so nothing leaks
      controls.detach()
      scene.dispose()
      mode = next.mode
      symbol = next.symbol
      scene = createFoldScene({ device, format, symbol, mode })
      camera = makeCamera(mode)
      controls = attachControls({ canvas: input.canvas, camera })
    },
    dispose() {
      running = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.detach()
      scene.dispose()
      device.destroy()
    },
  }
}
