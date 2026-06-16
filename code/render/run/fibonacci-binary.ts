// WATCH THE BINARY 64-BIT MACHINE COMPUTE FIBONACCI, ON {7,3}. The same Fibonacci function in TypeScript, but
// compiled to the BINARY register machine (code/compute/binary-machine.ts), the modern-CPU representation: each
// register is a word of bits, not a pile of tokens. Each register is a radial row of bit-cells (the least
// significant bit at the centre, growing outward), lit for 1 and dark for 0, so you watch the binary patterns
// ripple as the machine adds. The accumulators a and b are violet and emerald, the rest zinc, and the running
// Fibonacci output counts up in the centre. Unlike the unary version, every operation is a fixed 64-bit word, so
// each Fibonacci number costs the same, the bits just toggle. Run: pnpm tsx code/render/run/fibonacci-binary.ts

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildTilingFaces } from '@/code/render/geometry/tiling-faces'
import { renderSceneToRgba } from '@/code/render/adapter/raster'
import { encodeGif } from '@/code/draw/gif'
import { encodePng } from '@/code/draw/png'
import { compileToBinary } from '@/code/compute/ts-to-binary'
import { runBinary, type BinaryStep } from '@/code/compute/binary-machine'
import { shade, type Hue } from '@/code/render/palette'
import { cellOutlines, layoutWedges, drawCentralNumber } from '@/code/render/run/anim-tiling'
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

// register -> hue: the two accumulators are violet and emerald, everything else is zinc (the request's palette)
const REGISTER_HUE: Record<string, Hue> = { a: 'violet', b: 'emerald', t: 'violet', n: 'zinc', $jump: 'zinc', $one: 'zinc' }

const N = 10
const SIZE = 760
const MARGIN = 0.96
const MAX_CELLS = 980
const BITS_SHOWN = 18 // low bits per register (fib to 55 needs 6; headroom shows the 64-bit word is sparse)
const FRAMES_PER_OP = 2 // equal frames per operation (every step shown); 2 keeps it brisk between numbers

function run(): void {
  const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'make', 'render', 'fibonacci')
  mkdirSync(outDir, { recursive: true })

  const tiling = buildTilingFaces({ symbol: [7, 3], maxCells: MAX_CELLS })
  const cellCount = tiling.cellCount

  const compiled = compileToBinary(FIB_SOURCE)
  const nIndex = compiled.registers.get('n')!
  const bIndex = compiled.registers.get('b')!
  const names = [...compiled.registers.keys()]
  const initial = new Array<bigint>(compiled.program.registers).fill(0n)
  initial[0] = BigInt(N)

  // trace one operation per step; latch the latest complete term at each loop test (jz on n, where b holds it)
  const steps: BinaryStep[] = []
  const display: number[] = []
  let latched = 0
  runBinary(compiled.program, initial, (step) => {
    // latch the latest complete term at each CONTINUING loop test (jz on n with n still nonzero), where b holds
    // it. Skip the final exit test (n == 0), which would otherwise latch b = the already-computed next term (89).
    if (step.kind === 'jz' && step.reg === nIndex && step.registers[nIndex] !== 0n) latched = Number(step.registers[bIndex]!)
    steps.push(step)
    display.push(latched)
  })
  const finalTerm = Number(steps[steps.length - 1]!.registers[compiled.returnRegister]!)
  console.log(`compiled ${compiled.program.code.length} binary ops; executed ${steps.length} word-ops computing fib(${N}) = ${finalTerm}`)

  const wedges = layoutWedges(tiling.centers, names.length)
  const edges = cellOutlines(tiling.polygons)

  const frames: Uint8Array[] = []
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!
    const prev = i === 0 ? initial : steps[i - 1]!.registers
    // bits of the active register that changed this op, so they can flash
    const changed = new Set<number>()
    const av = step.registers[step.reg]!
    const pv = prev[step.reg]!
    for (let bit = 0; bit < BITS_SHOWN; bit++) if (((av >> BigInt(bit)) & 1n) !== ((pv >> BigInt(bit)) & 1n)) changed.add(bit)
    const mode: 'add' | 'sub' | 'idle' = av > pv ? 'add' : av < pv ? 'sub' : 'idle'
    for (let f = 0; f < FRAMES_PER_OP; f++) {
      const flash = f === 0 // flash the changed bits on the operation's first frame
      frames.push(renderFrame({ tiling, edges, wedges, names, registers: step.registers, active: step.reg, changed: flash ? changed : new Set(), mode, display: display[i]!, cellCount }))
    }
  }
  // hold the final answer
  const lastRegs = steps[steps.length - 1]!.registers
  for (let h = 0; h < 14; h++) frames.push(renderFrame({ tiling, edges, wedges, names, registers: lastRegs, active: compiled.returnRegister, changed: new Set(), mode: 'idle', display: finalTerm, cellCount }))

  writeFileSync(join(outDir, 'fibonacci-7-3-binary-frame.png'), encodePng(frames[frames.length - 1]!, SIZE, SIZE))
  const gif = encodeGif({ frames, width: SIZE, height: SIZE, delayMs: 70 })
  writeFileSync(join(outDir, 'fibonacci-7-3-binary.gif'), gif)
  console.log(`wrote fibonacci-7-3-binary.gif  ${(gif.length / 1024).toFixed(0)} KB  ${frames.length} frames  ${SIZE}x${SIZE}`)
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
}): Uint8Array {
  const { tiling, edges, wedges, names, registers, active, changed, mode, display, cellCount } = input
  const faces: SceneFace[] = []
  const FAINT: [number, number, number] = [34, 34, 42] // faint zinc, so the whole tessellation stays visible

  for (let r = 0; r < names.length; r++) {
    const hue = REGISTER_HUE[names[r]!] ?? 'zinc'
    const value = registers[r] ?? 0n
    const track = wedges[r]!
    for (let p = 0; p < track.length; p++) {
      const cell = track[p]!
      if (p < BITS_SHOWN) {
        // tint the WHOLE register word in its hue so each register reads as violet (a, t) / emerald (b) / zinc
        // (bookkeeping), and show the bit value as brightness: a 1 is bright, a 0 is the same hue but dark.
        const isOne = ((value >> BigInt(p)) & 1n) === 1n
        const isFlash = r === active && changed.has(p)
        const rgb01 = isFlash ? ([0.96, 0.96, 0.99] as const) : shade(hue, isOne ? 0.4 : 0.85)
        faces.push({ polygon: tiling.polygons[cell]!, color: [Math.round(rgb01[0] * 255), Math.round(rgb01[1] * 255), Math.round(rgb01[2] * 255)] })
      } else {
        faces.push({ polygon: tiling.polygons[cell]!, color: FAINT }) // beyond the word, faint background
      }
    }
  }

  // the central tile is the locomotive's seat, coloured by the operation (emerald add, violet subtract, zinc idle)
  const opHue: Hue = mode === 'add' ? 'emerald' : mode === 'sub' ? 'violet' : 'zinc'
  const opRgb = shade(opHue, mode === 'idle' ? 0.4 : 0.6)
  faces.push({ polygon: tiling.polygons[0]!, color: [Math.round(opRgb[0] * 255), Math.round(opRgb[1] * 255), Math.round(opRgb[2] * 255)] })

  const scene: Scene = { dim: 2, symbol: [7, 3], edges, faces, cellCount }
  const { rgba } = renderSceneToRgba({ scene, size: SIZE, segments: 18, lineWidth: 1.0, near: [56, 56, 66], far: [56, 56, 66], model: 'poincare', margin: MARGIN, superSample: 2 })
  drawCentralNumber({ rgba, size: SIZE, margin: MARGIN, centralPolygon: tiling.polygons[0]!, text: String(display) })
  return rgba
}

run()
