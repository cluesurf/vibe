// Validation render: the 2D tiling {7,3} (the order-3 heptagonal tiling, the canonical hyperbolic tiling)
// inside the Poincare disk. Same generic generator and the same node raster adapter as the 3D {5,3,4} render,
// proving the geometry core is dimension-general (a 2D tiling and a 3D honeycomb from one code path).
// Run: npx tsx code/render/run/render-73.ts

import { buildHoneycombScene } from '@/code/render/geometry/honeycomb'
import { renderSceneToPng } from '@/code/render/adapter/raster'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SYMBOL = [7, 3]
const MAX_CELLS = 2000
const SIZE = 1200

function run(): void {
  const scene = buildHoneycombScene({
    symbol: SYMBOL,
    maxCells: MAX_CELLS,
  })

  console.log(
    `{${SYMBOL.join(',')}} scene: dim ${scene.dim}, ${scene.cellCount} cells, ${scene.edges.length} edges`,
  )
  const png = renderSceneToPng({
    scene,
    size: SIZE,
    near: [150, 130, 255],
    far: [55, 50, 110],
  })

  const here = dirname(fileURLToPath(import.meta.url))
  const outDir = join(here, '..', '..', '..', 'make', 'render')
  mkdirSync(outDir, { recursive: true })
  const out = join(outDir, 'tessellation-73.png')
  writeFileSync(out, png)
  console.log(`wrote ${out}`)
}

run()
