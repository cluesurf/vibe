// Animated walk through a 2D hyperbolic tiling, as if you were scrolling forward, the camera moving along a
// straight geodesic so far-away tiles stream in toward the center and grow as you pass through them. Reuses
// the cell engine (buildHoneycombScene), the Mobius isometry layer (render/geometry/isometry), and the CPU
// raster, and encodes the frames to ONE animated GIF (gifenc) with no external tool.
//
// Modes:
//   walk (default) — keep moving forward along the vertical corridor, an endless seamless loop, far tiles come
//                    to the center. This is the "scroll down and keep walking" view.
//   spin           — rotate the disk in place, a seamless loop.
//   zoom           — the Escher dive, fall toward an ideal boundary point.
// Run: pnpm tsx code/render/run/flyover.ts [walk|spin|zoom] [symbol]   e.g. pnpm tsx ... walk 7-3

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildHoneycombScene } from '@/code/render/geometry/honeycomb'
import {
  renderSceneToRgba,
  type Rgb,
} from '@/code/render/adapter/raster'
import {
  transformScene,
  glide,
  rotateAboutOrigin,
  originDistance,
} from '@/code/render/geometry/isometry'
import { encodeGif } from '@/code/draw/gif'
import { encodePng } from '@/code/draw/png'
import type { Vec } from '@/code/render/scene'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '..', '..', '..', 'make', 'render', 'flyover')

const NEAR: Rgb = [150, 130, 255]
const FAR: Rgb = [55, 50, 110]

// the forward corridor for a seamless walking loop, the cell center nearest to straight up. Gliding by exactly
// its distance along its direction lands the next tile on the center, so frame N matches frame 0, no seam.
function verticalStep(centers: Vec[] | undefined): {
  direction: Vec
  period: number
} {
  const fallback = { direction: [0, 1] as Vec, period: 1.2 }

  if (!centers || centers.length < 2) {
    return fallback
  }

  let best: Vec | null = null
  let bestScore = -Infinity

  for (const c of centers) {
    const r = Math.hypot(c[0] ?? 0, c[1] ?? 0)

    if (r < 1e-6) {
      continue
    }

    // prefer centers pointing up (+y), penalize horizontal and distant ones so we step one tile forward
    const upness = (c[1] ?? 0) / r
    const score = upness - r * 0.15

    if (score > bestScore) {
      bestScore = score
      best = c
    }
  }

  if (!best) {
    return fallback
  }

  const r = Math.hypot(best[0] ?? 0, best[1] ?? 0)

  return {
    direction: [best[0]! / r, best[1]! / r],
    period: originDistance(best),
  }
}

function run(): void {
  mkdirSync(outDir, { recursive: true })

  const mode = process.argv[2] ?? 'walk'
  const symbolText = process.argv[3] ?? '7-3'
  const symbol = symbolText.split('-').map(Number)
  const size = 600
  const frameCount = 48
  const base = buildHoneycombScene({
    symbol,
    maxCells: mode === 'walk' ? 7000 : 3500,
  })

  const step = verticalStep(base.centers)

  const frames: Uint8Array[] = []

  for (let f = 0; f < frameCount; f++) {
    const t = f / frameCount
    const transform =
      mode === 'spin'
        ? rotateAboutOrigin({ angle: t * 2 * Math.PI })
        : mode === 'zoom'
          ? glide({
              direction: [Math.cos(0.35), Math.sin(0.35)],
              distance: t * 5,
            })
          : // walk, move forward one lattice period over the loop so it repeats with no seam
            glide({
              direction: step.direction,
              distance: t * step.period,
            })

    const moved = transformScene(base, transform)
    const { rgba } = renderSceneToRgba({
      scene: moved,
      size,
      segments: 14,
      lineWidth: 1.3,
      near: NEAR,
      far: FAR,
    })

    frames.push(rgba)

    if (f === 0 || f === Math.floor(frameCount / 2)) {
      writeFileSync(
        join(outDir, `${mode}-${symbolText}-frame${f}.png`),
        encodePng(rgba, size, size),
      )
    }
  }

  const gif = encodeGif({
    frames,
    width: size,
    height: size,
    delayMs: 60,
  })

  writeFileSync(join(outDir, `${mode}-${symbolText}.gif`), gif)
  console.log(
    `wrote ${mode}-${symbolText}.gif  ${(gif.length / 1024).toFixed(0)} KB  ${frameCount} frames  ${size}x${size}`,
  )
}

run()
