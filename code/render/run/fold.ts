// Headless runner for the fundamental-domain "folding" renderer, via the `webgpu` package (Dawn). It drives the
// SAME device-agnostic fold core (code/render/gpu/fold-scene.ts) and the SAME camera (code/render/gpu/camera.ts)
// as the interactive browser engine, only the output differs, here it reads the texture back and writes a PNG.
// A 2-entry symbol like 7-3 renders the 2D {p,q} tiling in the Poincare disk. A 3-entry symbol like 5-3-4
// raymarches the {p,q,r} honeycomb in the ball.
// Run: pnpm tsx code/render/run/fold.ts 7-3       (after `pnpm add webgpu`, needs a GPU adapter)
//      pnpm tsx code/render/run/fold.ts 5-4
//      pnpm tsx code/render/run/fold.ts 5-3-4

import { create, globals } from 'webgpu'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { encodePng } from '@/code/draw/png'
import { createHeadlessFoldScene, renderFoldToRgba } from '@/code/render/gpu/headless'
import { makeCamera } from '@/code/render/gpu/camera'

Object.assign(globalThis, globals)
const navigator = { gpu: create([]) }

const SIZE = 1024 // image is SIZE x SIZE. SIZE * 4 is 256-aligned, so no row padding on readback.

function parseSymbol(text: string): number[] {
  const nums = text.split('-').map((part) => Number(part.trim()))
  if (nums.some((n) => !Number.isInteger(n) || n < 2)) {
    throw new Error(`bad symbol "${text}", expected dash-separated integers like 7-3 or 5-3-4`)
  }
  return nums
}

async function run(): Promise<void> {
  const arg = process.argv[2] ?? '7-3'
  const symbol = parseSymbol(arg)
  const key = symbol.join('-')
  const threeD = symbol.length >= 3
  const mode = threeD ? '3d' : '2d'

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.log('no WebGPU adapter available (needs a GPU, e.g. Metal on macOS). The fold renderer will run where an adapter is present.')
    return
  }
  const device = await adapter.requestDevice()

  const scene = createHeadlessFoldScene({ device, symbol, mode })
  const camera = makeCamera(mode)
  if (threeD) {
    // the static, from-outside view, with high-quality march settings for a still
    scene.setCamera3D({ ...camera.uniform3D(), detail: 0.0007, maxSteps: 600 })
  } else {
    scene.setCamera2D(camera.uniform2D())
  }
  const rgba = await renderFoldToRgba({ device, scene, size: SIZE })

  const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'make', 'render', 'fold')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, `${key}.png`)
  writeFileSync(outPath, encodePng(rgba, SIZE, SIZE))
  console.log(`rendered {${symbol.join(',')}} ${threeD ? 'honeycomb (raymarch)' : 'tiling (Poincare disk)'} at ${SIZE}x${SIZE}, wrote ${outPath}`)
}

run()
