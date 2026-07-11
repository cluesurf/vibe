// Render EVERY tessellation in the catalog to a PNG, the full strut-wireframe gallery. Reads the canonical
// list at note/research/vibe/notes/theory-v0.7.0/paper/tessellations.csv, builds each buildable symbol with
// the upright orientation (a vertex up for an odd-sided cell, a flat side up for an even-sided cell), draws
// true geodesic arcs in the Poincare disk (2D) or ball (3D, with the higher dimensions projected), and
// writes make/render/tessellations/<symbol>.png. Run: pnpm tsx code/render/run/tessellations.ts
// Optionally pass symbols to render a subset, e.g. pnpm tsx code/render/run/tessellations.ts 7-3 5-3-4

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildHoneycombScene } from '@/code/render/geometry/honeycomb'
import {
  renderSceneToPng,
  type Rgb,
} from '@/code/render/adapter/raster'

const here = dirname(fileURLToPath(import.meta.url))
const csvPath = join(
  here,
  '..',
  '..',
  '..',
  '..',
  '..',
  'note',
  'research',
  'vibe',
  'notes',
  'tessellations.csv',
)

const outDir = join(
  here,
  '..',
  '..',
  '..',
  'make',
  'render',
  'tessellations',
)

// a quote-aware CSV splitter, the symbol field is quoted and contains a comma (e.g. "{5,3,4}")
function csvCols(line: string): string[] {
  const out: string[] = []

  let cur = ''
  let quoted = false

  for (const ch of line) {
    if (ch === '"') {
      quoted = !quoted
      continue
    }

    if (ch === ',' && !quoted) {
      out.push(cur)
      cur = ''
      continue
    }

    cur += ch
  }

  out.push(cur)

  return out
}

function parseSymbol(text: string): number[] | null {
  const nums = text
    .replace(/[{}]/g, '')
    .trim()
    .split(',')
    .map(p => Number(p.trim()))

  if (nums.some(n => !Number.isInteger(n) || n <= 0)) return null

  return nums
}

const TWO_D_NEAR: Rgb = [150, 130, 255]
const TWO_D_FAR: Rgb = [55, 50, 110]
const BALL_NEAR: Rgb = [235, 235, 245]
const BALL_FAR: Rgb = [16, 16, 22]

function run(): void {
  mkdirSync(outDir, { recursive: true })

  const want = process.argv.slice(2)
  const lines = readFileSync(csvPath, 'utf8')
    .trim()
    .split('\n')
    .slice(1)

  let drawn = 0
  let skipped = 0

  for (const line of lines) {
    const cols = csvCols(line)
    const display = cols[0] ?? ''
    const dimension = Number(cols[2])
    const symbol = parseSymbol(display)

    if (!symbol) {
      skipped++

      if (!want.length) {
        console.log(
          `${display}  skip (non-integer symbol, not buildable)`,
        )
      }

      continue
    }

    const key = symbol.join('-')

    if (want.length && !want.includes(key)) continue

    const twoD = dimension === 2
    const maxCells = twoD ? 2800 : dimension === 3 ? 600 : 350

    try {
      const scene = buildHoneycombScene({ symbol, maxCells })
      const png = renderSceneToPng({
        scene,
        size: 1000,
        segments: twoD ? 24 : 18,
        lineWidth: twoD ? 1.4 : 1.0,
        near: twoD ? TWO_D_NEAR : BALL_NEAR,
        far: twoD ? TWO_D_FAR : BALL_FAR,
      })

      writeFileSync(join(outDir, `${key}.png`), png)
      drawn++
      console.log(
        `${display}  dim${scene.dim}  ${scene.cellCount} cells  ${scene.edges.length} edges`,
      )
    } catch (error) {
      console.log(`${display}  FAILED  ${(error as Error).message}`)
    }
  }

  console.log(
    `\ndrew ${drawn} tessellations, skipped ${skipped} non-buildable, into ${outDir}`,
  )
}

run()
