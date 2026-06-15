// Animated flyover of a 2D hyperbolic tiling, the camera moving through hyperbolic space. Reuses the cell
// engine (buildHoneycombScene), the Mobius isometry layer (render/geometry/isometry), and the CPU raster, and
// encodes the frames to ONE animated GIF with no external tool. Three modes, glide (fly along a geodesic),
// spin (rotate the disk, a seamless loop), and zoom (the Escher dive toward an ideal boundary point).
// Run: pnpm tsx code/render/run/flyover.ts [glide|spin|zoom] [symbol]   e.g. pnpm tsx ... glide 7-3

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildHoneycombScene } from '@/code/render/geometry/honeycomb'
import { renderSceneToRgba, type Rgb } from '@/code/render/adapter/raster'
import { transformScene, glide, rotateAboutOrigin } from '@/code/render/geometry/isometry'
import { encodeGif } from '@/code/draw/gif'
import { encodePng } from '@/code/draw/png'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '..', '..', '..', 'make', 'render', 'flyover')

const NEAR: Rgb = [150, 130, 255]
const FAR: Rgb = [55, 50, 110]

function run(): void {
  mkdirSync(outDir, { recursive: true })
  const mode = process.argv[2] ?? 'glide'
  const symbolText = process.argv[3] ?? '7-3'
  const symbol = symbolText.split('-').map(Number)
  const size = 600
  const frameCount = 48
  const base = buildHoneycombScene({ symbol, maxCells: mode === 'glide' ? 6000 : 3500 })

  const frames: Uint8Array[] = []
  for (let f = 0; f < frameCount; f++) {
    const t = f / frameCount
    const transform =
      mode === 'spin'
        ? rotateAboutOrigin({ angle: t * 2 * Math.PI })
        : mode === 'zoom'
          ? glide({ direction: [Math.cos(0.35), Math.sin(0.35)], distance: t * 5 })
          : glide({ direction: [1, 0], distance: (t - 0.5) * 3 })
    const moved = transformScene(base, transform)
    const { rgba } = renderSceneToRgba({ scene: moved, size, segments: 14, lineWidth: 1.3, near: NEAR, far: FAR })
    frames.push(rgba)
    if (f === 0 || f === Math.floor(frameCount / 2)) {
      writeFileSync(join(outDir, `${mode}-${symbolText}-frame${f}.png`), encodePng(rgba, size, size))
    }
  }

  const gif = encodeGif({ frames, width: size, height: size, delayMs: 60 })
  writeFileSync(join(outDir, `${mode}-${symbolText}.gif`), gif)
  console.log(`wrote ${mode}-${symbolText}.gif  ${(gif.length / 1024).toFixed(0)} KB  ${frameCount} frames  ${size}x${size}`)
}

run()
