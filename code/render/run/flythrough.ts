// FLY THROUGH a 3D hyperbolic honeycomb, headless, into an animated GIF. It drives the SAME fold core, camera,
// and motion model as the interactive browser engine (code/render/gpu/*), so the fly-through you see in the
// React app and the GIF here come from one renderer. `inside` uses the solid-room interior shader (you fly the
// textured dodecahedral corridors), `dive` uses the exterior shader (nested shells from outside). Each frame
// advances the camera one geodesic step, read back and encoded to a GIF.
// Run: pnpm tsx code/render/run/flythrough.ts [symbol] [inside|dive]   e.g. pnpm tsx code/render/run/flythrough.ts 5-3-4 inside

import { create, globals } from 'webgpu'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { encodePng } from '@/code/draw/png'
import { encodeGif } from '@/code/draw/gif'
import {
  createHeadlessFoldScene,
  renderFoldToRgba,
} from '@/code/render/gpu/headless'
import { makeCamera } from '@/code/render/gpu/camera'

Object.assign(globalThis, globals)
const navigator = { gpu: create([]) }

const SIZE = 512 // per-frame side length, SIZE*4 is 256-aligned (no readback row padding)
const FRAMES = 60

async function run(): Promise<void> {
  const arg = process.argv[2] ?? '5-3-4'
  const mode = process.argv[3] ?? 'inside' // 'inside' (textured corridors) or 'dive' (from outside)
  const inside = mode !== 'dive'
  const symbol = arg.split('-').map(Number)
  if (symbol.length < 3) {
    throw new Error('flythrough is for 3D honeycombs, e.g. 5-3-4')
  }

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.log(
      'no WebGPU adapter available (needs a GPU). The flythrough is written and runs where an adapter is present.',
    )

    return
  }

  const device = await adapter.requestDevice()

  const foldMode = inside ? '3d-interior' : '3d'
  const scene = createHeadlessFoldScene({
    device,
    symbol,
    mode: foldMode,
  })
  const camera = makeCamera(foldMode)

  // fly forward by one cell period over the loop (so it repeats seamlessly through the periodic honeycomb)
  const period = 1.45
  const stepPerFrame = period / FRAMES
  const outDir = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    '..',
    'make',
    'render',
    'flythrough',
  )
  mkdirSync(outDir, { recursive: true })

  const frames: Uint8Array[] = []
  for (let frame = 0; frame < FRAMES; frame++) {
    // high-quality march settings for the offscreen still / GIF
    scene.setCamera3D({
      ...camera.uniform3D(),
      detail: 0.0008,
      maxSteps: 700,
    })
    const rgba = await renderFoldToRgba({ device, scene, size: SIZE })
    frames.push(rgba)
    if (frame === 0 || frame === Math.floor(FRAMES / 2)) {
      writeFileSync(
        join(outDir, `flythrough-${arg}-${mode}-frame${frame}.png`),
        encodePng(rgba, SIZE, SIZE),
      )
    }

    camera.moveForward(stepPerFrame)
  }

  const gif = encodeGif({
    frames,
    width: SIZE,
    height: SIZE,
    delayMs: 60,
  })
  writeFileSync(join(outDir, `flythrough-${arg}-${mode}.gif`), gif)
  console.log(
    `flew through {${symbol.join(',')}} (${mode}), wrote flythrough-${arg}-${mode}.gif  ${(gif.length / 1024).toFixed(0)} KB  ${FRAMES} frames  ${SIZE}x${SIZE}`,
  )
}

run()
