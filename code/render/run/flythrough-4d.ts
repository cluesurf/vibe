// FLY THROUGH a 4D hyperbolic honeycomb. A regular 4D honeycomb ({3,4,3,4}, {5,3,3,4}, {4,3,3,5}, ...) is
// built as a Scene with four ball coordinates, then each frame turns the figure through the fourth axis (the
// x-w and z-w planes) and perspective-projects 4D -> 3D -> 2D on the CPU raster. Sweeping the 4D angle across
// the frames is the fly-through, cells swing in from the fourth dimension, grow, and pass through, the way a
// 3D slice of a 4D crystal would change as you rotate it. The frames are encoded into one animated GIF.
//
// Run: pnpm tsx code/render/run/flythrough-4d.ts [symbol]   e.g. pnpm tsx code/render/run/flythrough-4d.ts 3-4-3-4

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildHoneycombScene } from '@/code/render/geometry/honeycomb'
import { renderSceneToRgba } from '@/code/render/adapter/raster'
import { encodeGif } from '@/code/draw/gif'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(
  here,
  '..',
  '..',
  '..',
  'make',
  'render',
  'flythrough-4d',
)

const SIZE = 512
const FRAMES = 48

function run(): void {
  mkdirSync(outDir, { recursive: true })

  // a compact 4D honeycomb by default, {4,3,3,5}, whose cell is the tesseract (small, degree 8). Paracompact
  // honeycombs like {3,4,3,4} have ideal vertices on the boundary sphere, so they draw no finite edges.
  const symbolText = process.argv[2] ?? '4-3-3-5'
  const symbol = symbolText.split('-').map(Number)

  // a modest cell count keeps the 4D projection legible, a denser patch turns into an unreadable hairball
  const scene = buildHoneycombScene({ symbol, maxCells: 400 })

  if (scene.dim < 4) {
    console.log(
      `${symbolText} is ${scene.dim}D, not a 4D honeycomb. Pick a four-entry symbol like 3-4-3-4.`,
    )

    return
  }

  const frames: Uint8Array[] = []

  for (let i = 0; i < FRAMES; i++) {
    const turn = (2 * Math.PI * i) / FRAMES
    const { rgba } = renderSceneToRgba({
      scene,
      size: SIZE,
      segments: 16,
      rotateX: 0.5,
      rotateY: 0.4,
      rotateXW: turn, // sweep the fourth axis into view
      rotateZW: turn * 0.5,
      near: [150, 130, 255],
      far: [40, 36, 90],
    })

    frames.push(rgba)

    if (i % 8 === 0) {
      console.log(`frame ${i + 1}/${FRAMES}`)
    }
  }

  const gif = encodeGif({
    frames,
    width: SIZE,
    height: SIZE,
    delayMs: 60,
  })

  const file = join(outDir, `${symbol.join('-')}.gif`)
  writeFileSync(file, gif)
  console.log(
    `wrote ${file}  (${scene.cellCount} cells, ${scene.edges.length} edges, ${FRAMES} frames)`,
  )
}

run()
