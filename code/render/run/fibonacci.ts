// WATCH THE RAILWAY MACHINE COMPUTE FIBONACCI, ON {7,3}. A Fibonacci function written in TypeScript is compiled
// to the Minsky register-machine IR (code/compute/ts-to-railway.ts), the model the uniform CA realizes, and then
// EXECUTED one instruction at a time. Each register is a track, a wedge of heptagons growing out from the centre,
// and every inc / dec lights or clears its tip, so you watch the counters churn as the program runs. The two
// Fibonacci accumulators a and b are violet and emerald, the rest are zinc-toned, and the running Fibonacci
// output is latched as a large number in the centre, ticking up 1, 1, 2, 3, 5, 8, ... as each loop iteration
// completes. Run: pnpm tsx code/render/run/fibonacci.ts

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildTilingFaces } from '@/code/render/geometry/tiling-faces'
import { renderSceneToRgba } from '@/code/render/adapter/raster'
import { encodeGif } from '@/code/draw/gif'
import { encodePng } from '@/code/draw/png'
import { compileToRailway } from '@/code/compute/ts-to-railway'
import { runRailway, type RailStep } from '@/code/compute/railway'
import { shade, type Hue } from '@/code/render/palette'
import {
  cellOutlines,
  layoutWedges,
  drawCentralNumber,
} from '@/code/render/run/anim-tiling'
import type { Scene, SceneEdge, SceneFace } from '@/code/render/scene'

const FIB_SOURCE = `
function fib(n) {
  let a = 0
  let b = 1
  let t = 0
  while (n !== 0) {
    n--
    t = a
    t += b
    a = b
    b = t
  }
  return a
}
`

// the register -> Tailwind hue map, kept to violet, emerald, and zinc. The two Fibonacci accumulators a and b
// are the stars in violet and emerald; the temp shares violet (a different wedge, so it still reads apart), and
// the loop counter and scratch are quiet zinc neutrals.
const REGISTER_HUE: Record<string, Hue> = {
  a: 'violet',
  b: 'emerald',
  t: 'violet',
  n: 'zinc',
  $scratch: 'zinc',
}

const N = 10 // compute fib(1..N) live; register values stay within each wedge for this N
const SIZE = 760
const MARGIN = 0.96 // matches the raster's bounded-frame default, so the central-tile fit math is exact
const MAX_CELLS = 980
const FRAMES_PER_OP = 4 // every computation step (operation) gets the SAME number of frames; none are skipped

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

  const cellCount = tiling.cellCount

  // compile the TypeScript and trace the whole execution, one snapshot per instruction
  const compiled = compileToRailway(FIB_SOURCE)
  const nIndex = compiled.registers.get('n')!
  const bIndex = compiled.registers.get('b')!
  const initial = new Array<number>(compiled.program.registers).fill(0)
  initial[0] = N

  // ONE execution of the compiled machine. We trace every instruction and remember the loop-iteration
  // boundaries (each n--), where b holds the latest complete Fibonacci term. We do NOT rerun the function per
  // number, the centre value updates live as the single run reaches each term.
  const trace: RailStep[] = []

  let latched = 0

  const latchedAt: number[] = [] // the Fibonacci value showing in the centre at each step
  const boundaries: number[] = [] // trace indices where a new term completes (the n-- of each iteration)
  runRailway(compiled.program, initial, step => {
    // latch the latest complete term at a loop decrement while n is still nonzero; skip the final exit (n == 0),
    // which would otherwise latch b = the already-computed next term
    if (
      step.op === 'dec' &&
      step.reg === nIndex &&
      step.registers[nIndex] !== 0
    ) {
      latched = step.registers[bIndex]!
      boundaries.push(trace.length)
    }

    trace.push(step)
    latchedAt.push(latched)
  })

  const finalTerm =
    trace[trace.length - 1]!.registers[compiled.returnRegister]!

  console.log(
    `compiled ${compiled.program.code.length} instructions; executed ${trace.length} steps computing fib(${N}) = ${finalTerm}`,
  )

  // lay each register out as a wedge of cells: assign every non-central cell to the register whose direction is
  // closest (by the cell-centre angle), then order each wedge by radius so the track grows outward
  const names = [...compiled.registers.keys()]
  const wedges = layoutWedges(tiling.centers, names.length)

  const edges = cellOutlines(tiling.polygons)
  void boundaries

  // FAITHFUL + EQUAL-PER-NUMBER pacing. The machine is unary, so a literal tick-by-tick view makes bigger numbers
  // take more frames. Instead we group the REAL instruction trace into the high-level operations it implements
  // (the compiled opIndex), each a real run of machine steps. Every loop iteration runs the same operations, so
  // giving each operation the same number of frames makes every Fibonacci number take the same screen time, while
  // each frame still shows the machine's real register state (interpolated across the operation's actual steps).
  const opIndex = compiled.opIndex
  type Segment = {
    pre: number[]
    post: number[]
    display: number
    active: number
    mode: 'add' | 'sub' | 'idle'
  }
  const segments: Segment[] = []

  let start = 0

  for (let i = 1; i <= trace.length; i++) {
    const boundary =
      i === trace.length ||
      opIndex[trace[i]!.pc] !== opIndex[trace[start]!.pc]

    if (!boundary) {
      continue
    }

    const pre =
      start === 0 ? initial.slice() : trace[start - 1]!.registers

    const post = trace[i - 1]!.registers

    let active = 0,
      delta = 0

    for (let r = 0; r < post.length; r++) {
      const d = post[r]! - pre[r]!

      if (Math.abs(d) > Math.abs(delta)) {
        delta = d
        active = r
      }
    }

    segments.push({
      pre,
      post,
      display: latchedAt[i - 1]!,
      active,
      mode: delta > 0 ? 'add' : delta < 0 ? 'sub' : 'idle',
    })
    start = i
  }

  const framesPerOp = FRAMES_PER_OP
  const frames: Uint8Array[] = []

  for (const seg of segments) {
    for (let f = 1; f <= framesPerOp; f++) {
      const registers = seg.post.map((post, r) =>
        Math.round(
          seg.pre[r]! + (post - seg.pre[r]!) * (f / framesPerOp),
        ),
      )

      frames.push(
        renderFrame({
          tiling,
          edges,
          wedges,
          names,
          registers,
          active: seg.active,
          mode: seg.mode,
          display: seg.display,
          cellCount,
        }),
      )
    }
  }

  // hold the final answer for a moment
  const lastRegs = trace[trace.length - 1]!.registers

  for (let h = 0; h < 14; h++) {
    frames.push(
      renderFrame({
        tiling,
        edges,
        wedges,
        names,
        registers: lastRegs,
        active: compiled.returnRegister,
        mode: 'idle',
        display: finalTerm,
        cellCount,
      }),
    )
  }

  writeFileSync(
    join(outDir, 'fibonacci-7-3-poincare-frame.png'),
    encodePng(frames[frames.length - 1]!, SIZE, SIZE),
  )

  const gif = encodeGif({
    frames,
    width: SIZE,
    height: SIZE,
    delayMs: 55,
  })

  writeFileSync(join(outDir, 'fibonacci-7-3-poincare.gif'), gif)
  console.log(
    `wrote fibonacci-7-3-poincare.gif  ${(gif.length / 1024).toFixed(0)} KB  ${frames.length} frames  ${SIZE}x${SIZE}`,
  )
}

function renderFrame(input: {
  tiling: ReturnType<typeof buildTilingFaces>
  edges: SceneEdge[]
  wedges: number[][]
  names: string[]
  registers: number[]
  active: number // the register changing in this operation (its tip flashes)
  mode: 'add' | 'sub' | 'idle' // the kind of operation (colours the central locomotive tile)
  display: number
  cellCount: number
}): Uint8Array {
  const {
    tiling,
    edges,
    wedges,
    names,
    registers,
    active,
    mode,
    display,
    cellCount,
  } = input

  const faces: SceneFace[] = []
  const FAINT: [number, number, number] = [34, 34, 42] // faint zinc, so the whole tessellation stays visible

  for (let r = 0; r < names.length; r++) {
    const hue = REGISTER_HUE[names[r]!] ?? 'zinc'
    const value = registers[r] ?? 0
    const track = wedges[r]!

    for (let p = 0; p < track.length; p++) {
      const cell = track[p]!

      if (p < value) {
        const t = 0.45 + 0.2 * (p / Math.max(1, value)) // vivid (~500) hue, a touch deeper toward the tip
        const isTip = p === value - 1
        const isActive = r === active && isTip
        const rgb01 = isActive
          ? ([0.96, 0.96, 0.99] as const)
          : shade(hue, t)

        faces.push({
          polygon: tiling.polygons[cell]!,
          color: [
            Math.round(rgb01[0] * 255),
            Math.round(rgb01[1] * 255),
            Math.round(rgb01[2] * 255),
          ],
        })
      } else {
        faces.push({ polygon: tiling.polygons[cell]!, color: FAINT })
      }
    }
  }

  // the central tile is the locomotive's seat: colour it by the OPERATION running this frame, emerald for an add
  // (a register growing), violet for a subtract (shrinking), a quiet zinc for a step that moves nothing
  const opHue: Hue =
    mode === 'add' ? 'emerald' : mode === 'sub' ? 'violet' : 'zinc'

  const opRgb = shade(opHue, mode === 'idle' ? 0.4 : 0.6)
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
    segments: 18,
    lineWidth: 1.0,
    near: [56, 56, 66],
    far: [56, 56, 66],
    model: 'poincare',
    margin: MARGIN,
    superSample: 2,
  })

  // the running Fibonacci output, fitted inside the central heptagon
  drawCentralNumber({
    rgba,
    size: SIZE,
    margin: MARGIN,
    centralPolygon: tiling.polygons[0]!,
    text: String(display),
  })

  return rgba
}

run()
