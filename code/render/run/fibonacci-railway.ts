// WATCH THE LITERAL RAILWAY-CA COMPUTE FIBONACCI, ON {7,3}, in unary, binary, and ternary. Here addition is the
// actual locomotive running on tracks, every +1 is a real increment of a railway counter (railway-ca.ts), and
// EVERY locomotive increment is one frame, so you watch the carries ripple one at a time. The three register
// bases are rendered as separate GIFs:
//   unary   - the value is a length of track (a violet/emerald/blue wedge fills up)
//   binary  - the value is a row of bit-cells (bright = 1, dark = 0)
//   ternary - the value is a row of trit-cells (three brightness levels, the vibe-theory base)
// The accumulators a, b, t are violet, emerald, blue, and the running Fibonacci output counts up in the centre.
// Run: pnpm tsx code/render/run/fibonacci-railway.ts

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildTilingFaces } from '@/code/render/geometry/tiling-faces'
import { renderSceneToRgba } from '@/code/render/adapter/raster'
import { encodeGif } from '@/code/draw/gif'
import { encodePng } from '@/code/draw/png'
import {
  makeUnaryCounter,
  makeBinaryCounter,
  makeTernaryCounter,
  type RailRegister,
} from '@/code/compute/railway-ca'
import { shade, type Hue } from '@/code/render/palette'
import {
  cellOutlines,
  layoutWedges,
  drawCentralNumber,
} from '@/code/render/run/anim-tiling'
import type { Scene, SceneEdge, SceneFace } from '@/code/render/scene'

const N = 10
const SIZE = 560
const MARGIN = 0.96
const MAX_CELLS = 820
const HUES: Hue[] = ['violet', 'emerald', 'blue'] // a, b, t

type Config = {
  name: string
  base: number
  shown: number
  make: () => RailRegister
}
const CONFIGS: Config[] = [
  { name: 'unary', base: 1, shown: 60, make: () => makeUnaryCounter() },
  {
    name: 'binary',
    base: 2,
    shown: 10,
    make: () => makeBinaryCounter(8),
  },
  {
    name: 'ternary',
    base: 3,
    shown: 8,
    make: () => makeTernaryCounter(8),
  },
]

type Snap = { regs: number[]; active: number; display: number }

function run(): void {
  const outDir = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    '..',
    'make',
    'render',
    'fibonacci',
  )

  mkdirSync(outDir, { recursive: true })

  const tiling = buildTilingFaces({
    symbol: [7, 3],
    maxCells: MAX_CELLS,
  })

  for (const cfg of CONFIGS) {
    renderBase(cfg, tiling, outDir)
  }
}

function renderBase(
  cfg: Config,
  tiling: ReturnType<typeof buildTilingFaces>,
  outDir: string,
): void {
  const cellCount = tiling.cellCount
  const a = cfg.make(),
    b = cfg.make(),
    t = cfg.make()

  a.clear()
  b.set(1)
  t.clear()

  const counters = [a, b, t]
  const snaps: Snap[] = []

  let latched = 0

  const snap = (active: number): void => {
    snaps.push({
      regs: counters.map(c => c.count()),
      active,
      display: latched,
    })
  }

  const addInto = (dstIdx: number, srcIdx: number): void => {
    const times = counters[srcIdx]!.count()

    for (let k = 0; k < times; k++) {
      counters[dstIdx]!.increment()
      snap(dstIdx)
    }
  }

  snap(0)

  for (let iter = 0; iter < N; iter++) {
    t.clear()
    addInto(2, 0)
    addInto(2, 1) // t = a + b
    a.clear()
    addInto(0, 1) // a = b
    latched = a.count()
    b.clear()
    addInto(1, 2) // b = t
  }

  const finalTerm = a.count()
  console.log(
    `literal railway CA (${cfg.name}): fib(${N}) = ${finalTerm} via ${snaps.length} locomotive increments`,
  )

  const wedges = layoutWedges(tiling.centers, counters.length)
  const edges = cellOutlines(tiling.polygons)
  const frames: Uint8Array[] = []

  for (let i = 0; i < snaps.length; i++) {
    frames.push(
      renderFrame({
        tiling,
        edges,
        wedges,
        snap: snaps[i]!,
        prev: snaps[Math.max(0, i - 1)]!,
        cellCount,
        cfg,
      }),
    )
  }

  for (let h = 0; h < 16; h++) {
    frames.push(
      renderFrame({
        tiling,
        edges,
        wedges,
        snap: {
          regs: counters.map(c => c.count()),
          active: -1,
          display: finalTerm,
        },
        prev: snaps[snaps.length - 1]!,
        cellCount,
        cfg,
      }),
    )
  }

  writeFileSync(
    join(outDir, `fibonacci-7-3-railway-${cfg.name}-frame.png`),
    encodePng(frames[frames.length - 1]!, SIZE, SIZE),
  )

  const gif = encodeGif({
    frames,
    width: SIZE,
    height: SIZE,
    delayMs: 40,
  })

  writeFileSync(
    join(outDir, `fibonacci-7-3-railway-${cfg.name}.gif`),
    gif,
  )
  console.log(
    `wrote fibonacci-7-3-railway-${cfg.name}.gif  ${(gif.length / 1024).toFixed(0)} KB  ${frames.length} frames  ${SIZE}x${SIZE}`,
  )
}

function renderFrame(input: {
  tiling: ReturnType<typeof buildTilingFaces>
  edges: SceneEdge[]
  wedges: number[][]
  snap: Snap
  prev: Snap
  cellCount: number
  cfg: Config
}): Uint8Array {
  const { tiling, edges, wedges, snap, prev, cellCount, cfg } = input
  const faces: SceneFace[] = []
  const FAINT: [number, number, number] = [34, 34, 42]
  const digit = (value: number, p: number): number =>
    Math.floor(value / cfg.base ** p) % cfg.base

  for (let r = 0; r < wedges.length; r++) {
    const hue = HUES[r] ?? 'zinc'
    const value = snap.regs[r] ?? 0
    const prevValue = prev.regs[r] ?? 0
    const track = wedges[r]!

    for (let p = 0; p < track.length; p++) {
      const cell = track[p]!

      let color: [number, number, number] = FAINT

      if (cfg.base === 1) {
        // unary: the value is a filled length
        if (p < value) {
          const changed = r === snap.active && p >= prevValue
          const rgb01 = changed
            ? ([0.96, 0.96, 0.99] as const)
            : shade(hue, 0.5)

          color = [
            Math.round(rgb01[0] * 255),
            Math.round(rgb01[1] * 255),
            Math.round(rgb01[2] * 255),
          ]
        }
      } else if (p < cfg.shown) {
        // binary / ternary: the value is a row of digits, brightness by digit
        const d = digit(value, p)
        const changed = r === snap.active && d !== digit(prevValue, p)
        const rgb01 = changed
          ? ([0.96, 0.96, 0.99] as const)
          : shade(hue, 0.8 - 0.3 * (d / (cfg.base - 1)))

        color = [
          Math.round(rgb01[0] * 255),
          Math.round(rgb01[1] * 255),
          Math.round(rgb01[2] * 255),
        ]
      }

      faces.push({ polygon: tiling.polygons[cell]!, color })
    }
  }

  const opRgb = shade(
    snap.active >= 0 ? 'emerald' : 'zinc',
    snap.active >= 0 ? 0.5 : 0.4,
  )

  faces.push({
    polygon: tiling.polygons[0]!,
    color: [
      Math.round(opRgb[0] * 255),
      Math.round(opRgb[1] * 255),
      Math.round(opRgb[2] * 255),
    ],
  })

  const scene: Scene = {
    dim: 2,
    symbol: [7, 3],
    edges,
    faces,
    cellCount,
  }

  const { rgba } = renderSceneToRgba({
    scene,
    size: SIZE,
    segments: 16,
    lineWidth: 1.0,
    near: [56, 56, 66],
    far: [56, 56, 66],
    model: 'poincare',
    margin: MARGIN,
    superSample: 2,
  })

  drawCentralNumber({
    rgba,
    size: SIZE,
    margin: MARGIN,
    centralPolygon: tiling.polygons[0]!,
    text: String(snap.display),
  })

  return rgba
}

run()
