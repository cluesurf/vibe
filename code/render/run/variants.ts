// Render tiling VARIANTS, the truncated and rectified forms of a regular tiling, the hyperbolic analogue of
// HyperRogue's truncated / Goldberg families. We build the regular {p,q} Scene, then carve every vertex with
// `truncateScene`, and write both the regular and the variant to PNG so they can be compared side by side.
//
// Run: pnpm tsx code/render/run/variants.ts            (defaults to a small gallery)
//      pnpm tsx code/render/run/variants.ts 7-3 8-3    (a chosen set of 2D symbols)

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildHoneycombScene } from '@/code/render/geometry/honeycomb'
import { truncateScene } from '@/code/render/geometry/truncate'
import { renderSceneToPng } from '@/code/render/adapter/raster'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(
  here,
  '..',
  '..',
  '..',
  'make',
  'render',
  'variants',
)

const DEFAULT_SYMBOLS = ['7-3', '8-3', '5-4']

const symbols = (
  process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_SYMBOLS
).map(s => s.split('-').map(Number))

mkdirSync(outDir, { recursive: true })

for (const symbol of symbols) {
  const tag = symbol.join('-')
  const regular = buildHoneycombScene({ symbol, maxCells: 1600 })

  const truncated = truncateScene(regular, { fraction: 1 / 3 })
  const rectified = truncateScene(regular, { fraction: 1 / 2 })

  for (const [name, scene] of [
    ['regular', regular],
    ['truncated', truncated],
    ['rectified', rectified],
  ] as const) {
    const png = renderSceneToPng({
      scene,
      size: 900,
      segments: 96,
      superSample: 3,
    })
    const file = join(outDir, `${tag}-${name}.png`)
    writeFileSync(file, png)
    console.log(
      `${tag} ${name}: ${scene.edges.length} edges -> ${file}`,
    )
  }
}
