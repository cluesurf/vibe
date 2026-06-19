// A true LAZY, virtualized walk through a hyperbolic tiling, the camera moving forward so far-away tiles stream
// into the center and grow as you pass through them, forever. Unlike flyover.ts (which animates one big eager
// batch), this renders ONLY the bounded window of cells the virtualized Camera holds, rebasing across each cell
// boundary, so memory is constant no matter how far you walk and it works in 2D and 3D (and 4D for compact
// honeycombs). The loop is seamless, one cell-crossing returns the view to its start exactly (the tiling looks
// identical from every cell). Run: pnpm tsx code/render/run/walk.ts [symbol]   e.g. pnpm tsx ... walk.ts 7-3

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Camera } from '@/code/render/camera'
import {
  renderSceneToRgba,
  type Rgb,
} from '@/code/render/adapter/raster'
import {
  transformScene,
  rotateAboutOrigin,
} from '@/code/render/geometry/isometry'
import { encodeGif } from '@/code/draw/gif'
import { encodePng } from '@/code/draw/png'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '..', '..', '..', 'make', 'render', 'walk')

const NEAR: Rgb = [150, 130, 255]
const FAR: Rgb = [55, 50, 110]

function run(): void {
  mkdirSync(outDir, { recursive: true })

  const symbolText = process.argv[2] ?? '7-3'
  const symbol = symbolText.split('-').map(Number)
  const twoD = symbol.length === 2
  const size = 600
  const frameCount = 48
  const cam = new Camera({ symbol, windowNorm: twoD ? 0.92 : 0.82 })

  // rotate the view so the forward direction points straight up, so the motion reads as scrolling upward
  const forward = cam as unknown as {
    faceCenters: number[][]
    forwardFace: number
  }

  const target = forward.faceCenters[forward.forwardFace]!
  const upAngle =
    Math.PI / 2 - Math.atan2(target[1] ?? 0, target[0] ?? 0)

  const upright = rotateAboutOrigin({ angle: upAngle })

  const frames: Uint8Array[] = []

  for (let f = 0; f < frameCount; f++) {
    const scene = transformScene(cam.scene(), upright)
    const { rgba } = renderSceneToRgba({
      scene,
      size,
      segments: 14,
      lineWidth: 1.3,
      near: NEAR,
      far: FAR,
    })

    frames.push(rgba)

    if (f === 0 || f === Math.floor(frameCount / 2)) {
      writeFileSync(
        join(outDir, `walk-${symbolText}-frame${f}.png`),
        encodePng(rgba, size, size),
      )
    }

    // advance just under one full cell over the whole loop, so frame N wraps seamlessly onto frame 0
    cam.advance(1 / frameCount)
  }

  const gif = encodeGif({
    frames,
    width: size,
    height: size,
    delayMs: 60,
  })

  writeFileSync(join(outDir, `walk-${symbolText}.gif`), gif)
  console.log(
    `wrote walk-${symbolText}.gif  ${(gif.length / 1024).toFixed(0)} KB  ${frameCount} frames  ${size}x${size}  (window ${cam.activeCount} cells)`,
  )
}

run()
