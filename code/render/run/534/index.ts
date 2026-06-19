// Validation render: the 3D honeycomb {5,3,4} (the order-4 dodecahedral honeycomb, the committed vibe
// substrate) inside the Poincare ball. Builds the renderer-agnostic Scene with the generic generator, then
// draws it with the node raster adapter (no three.js, no browser). Proves the ported geometry is correct.
// Run: npx tsx code/render/run/render-534.ts

import { buildHoneycombScene } from '@/code/render/geometry/honeycomb'
import { renderSceneToPng } from '@/code/render/adapter/raster'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SYMBOL = [5, 3, 4]
const MAX_CELLS = 6000
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
    rotateX: 0.45,
    rotateY: 0.6,
  })

  const here = dirname(fileURLToPath(import.meta.url))
  const outDir = join(here, '..', '..', '..', 'make', 'render')
  mkdirSync(outDir, { recursive: true })

  const out = join(outDir, 'tessellation-534.png')
  writeFileSync(out, png)
  console.log(`wrote ${out}`)
}

run()
