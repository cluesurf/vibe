// Render ONE tessellation in every projection model, the same Scene seen as a Poincare disk, a Klein disk, the
// upper half-plane, a band, and the Gans plane. Proves the master-representation idea, one geometry, many
// views, all off the hyperboloid. Writes make/render/models/<symbol>-<model>.png.
// Run: pnpm tsx code/render/run/models.ts [symbol]   e.g. pnpm tsx code/render/run/models.ts 7-3

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildHoneycombScene } from '@/code/render/geometry/honeycomb'
import {
  renderSceneToPng,
  type Rgb,
} from '@/code/render/adapter/raster'
import type { ProjectionModel } from '@/code/render/geometry/projection'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '..', '..', '..', 'make', 'render', 'models')

const NEAR: Rgb = [150, 130, 255]
const FAR: Rgb = [55, 50, 110]
const MODELS: ProjectionModel[] = [
  'poincare',
  'klein',
  'gans',
  'half-plane',
  'band',
  'azimuthal-equidistant',
  'equal-area',
  'inverted',
  'hemisphere',
  'two-point-equidistant',
]

function run(): void {
  mkdirSync(outDir, { recursive: true })
  const symbolText = process.argv[2] ?? '7-3'
  const symbol = symbolText.split('-').map(Number)
  const scene = buildHoneycombScene({ symbol, maxCells: 2000 })
  for (const model of MODELS) {
    const png = renderSceneToPng({
      scene,
      size: 1000,
      segments: 96,
      lineWidth: 1.4,
      near: NEAR,
      far: FAR,
      model,
      superSample: 3,
    })
    writeFileSync(join(outDir, `${symbolText}-${model}.png`), png)
    console.log(
      `wrote ${symbolText}-${model}.png  (${scene.edges.length} edges)`,
    )
  }
}

run()
