// Shared animation for a POSITIONAL register machine (binary base 2, ternary base 3, ...) computing Fibonacci on
// {7,3}. Each register is a radial row of digit-cells (lowest digit at the centre, growing outward), tinted by
// the register's hue and brightened by the digit value (a 0 is dark, the top digit is bright; ternary's middle
// digit sits between). A cell flashes white when its digit changes. The centre tile is the locomotive's seat,
// emerald for an add, violet for a subtract, zinc when idle, with the running Fibonacci value drawn on it. The
// binary and ternary runners are thin wrappers that call this with their base and run function.

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildTilingFaces } from '@/code/render/geometry/tiling-faces'
import { renderSceneToRgba } from '@/code/render/adapter/raster'
import { encodeGif } from '@/code/draw/gif'
import { encodePng } from '@/code/draw/png'
import { compileToBinary } from '@/code/compute/ts-to-binary'
import type { BinaryProgram } from '@/code/compute/binary-machine'
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

const REGISTER_HUE: Record<string, Hue> = {
  a: 'violet',
  b: 'emerald',
  t: 'violet',
  n: 'zinc',
  $jump: 'zinc',
  $one: 'zinc',
}

const SIZE = 760
const MARGIN = 0.96
const MAX_CELLS = 980
const FRAMES_PER_OP = 2

export type DigitStep = {
  kind: string
  reg: number
  registers: bigint[]
}

// run the shared Fibonacci animation for a positional base
export function renderDigitFibonacci(input: {
  base: number
  runner: (
    program: BinaryProgram,
    initial: bigint[],
    onStep: (step: DigitStep) => void,
  ) => void
  outName: string // e.g. 'fibonacci-7-3-binary'
  digitsShown: number
  n?: number
  costLabel: string // e.g. 'word-ops' / 'trit-ops'
}): void {
  const { base, runner, outName, digitsShown } = input
  const n = input.n ?? 10
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

  const compiled = compileToBinary(FIB_SOURCE)
  const nIndex = compiled.registers.get('n')!
  const bIndex = compiled.registers.get('b')!
  const names = [...compiled.registers.keys()]
  const initial = new Array<bigint>(compiled.program.registers).fill(0n)
  initial[0] = BigInt(n)

  const steps: DigitStep[] = []
  const display: number[] = []
  let latched = 0
  runner(compiled.program, initial, step => {
    if (
      step.kind === 'jz' &&
      step.reg === nIndex &&
      step.registers[nIndex] !== 0n
    )
      latched = Number(step.registers[bIndex]!)
    steps.push(step)
    display.push(latched)
  })
  const finalTerm = Number(
    steps[steps.length - 1]!.registers[compiled.returnRegister]!,
  )
  console.log(
    `${outName}: ${compiled.program.code.length} ops, executed ${steps.length} ${input.costLabel} computing fib(${n}) = ${finalTerm}`,
  )

  const wedges = layoutWedges(tiling.centers, names.length)
  const edges = cellOutlines(tiling.polygons)

  const digit = (value: bigint, p: number): number =>
    Number((value / BigInt(base) ** BigInt(p)) % BigInt(base))
  const frames: Uint8Array[] = []
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!
    const prev = i === 0 ? initial : steps[i - 1]!.registers
    const changed = new Set<number>()
    for (let p = 0; p < digitsShown; p++)
      if (
        digit(step.registers[step.reg]!, p) !==
        digit(prev[step.reg]!, p)
      )
        changed.add(p)
    const av = step.registers[step.reg]!
    const pv = prev[step.reg]!
    const mode: 'add' | 'sub' | 'idle' =
      av > pv ? 'add' : av < pv ? 'sub' : 'idle'
    for (let f = 0; f < FRAMES_PER_OP; f++) {
      const flash = f === 0 ? changed : new Set<number>()
      frames.push(
        renderFrame({
          tiling,
          edges,
          wedges,
          names,
          registers: step.registers,
          active: step.reg,
          changed: flash,
          mode,
          display: display[i]!,
          cellCount,
          base,
          digitsShown,
          digit,
        }),
      )
    }
  }
  const lastRegs = steps[steps.length - 1]!.registers
  for (let h = 0; h < 14; h++)
    frames.push(
      renderFrame({
        tiling,
        edges,
        wedges,
        names,
        registers: lastRegs,
        active: compiled.returnRegister,
        changed: new Set(),
        mode: 'idle',
        display: finalTerm,
        cellCount,
        base,
        digitsShown,
        digit,
      }),
    )

  writeFileSync(
    join(outDir, `${outName}-frame.png`),
    encodePng(frames[frames.length - 1]!, SIZE, SIZE),
  )
  const gif = encodeGif({
    frames,
    width: SIZE,
    height: SIZE,
    delayMs: 70,
  })
  writeFileSync(join(outDir, `${outName}.gif`), gif)
  console.log(
    `wrote ${outName}.gif  ${(gif.length / 1024).toFixed(0)} KB  ${frames.length} frames  ${SIZE}x${SIZE}`,
  )
}

function renderFrame(input: {
  tiling: ReturnType<typeof buildTilingFaces>
  edges: SceneEdge[]
  wedges: number[][]
  names: string[]
  registers: bigint[]
  active: number
  changed: Set<number>
  mode: 'add' | 'sub' | 'idle'
  display: number
  cellCount: number
  base: number
  digitsShown: number
  digit: (value: bigint, p: number) => number
}): Uint8Array {
  const {
    tiling,
    edges,
    wedges,
    names,
    registers,
    active,
    changed,
    mode,
    display,
    cellCount,
    base,
    digitsShown,
    digit,
  } = input
  const faces: SceneFace[] = []
  const FAINT: [number, number, number] = [34, 34, 42]

  for (let r = 0; r < names.length; r++) {
    const hue = REGISTER_HUE[names[r]!] ?? 'zinc'
    const value = registers[r] ?? 0n
    const track = wedges[r]!
    for (let p = 0; p < track.length; p++) {
      const cell = track[p]!
      if (p < digitsShown) {
        const d = digit(value, p)
        const isFlash = r === active && changed.has(p)
        // brightness rises with the digit value: a 0 is a dark hue (~800), the top digit a vivid hue (~500),
        // matching the saturated Tailwind 500s of view/vibe-mesh-{7,3}.svg
        const t = 0.8 - 0.3 * (d / (base - 1))
        const rgb01 = isFlash
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
  drawCentralNumber({
    rgba,
    size: SIZE,
    margin: MARGIN,
    centralPolygon: tiling.polygons[0]!,
    text: String(display),
  })
  return rgba
}
