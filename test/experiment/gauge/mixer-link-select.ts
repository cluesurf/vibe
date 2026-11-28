// THE MIXER AND THE LINK, SELECTED IN TWO HALVES. Every
// gate, the family and its count were registered before this file existed (gate 3abdc27af879,
// 2026-11-17T05:51:35Z), and every run goes through task/pre-register.
//
// THE QUESTION. A board proposal asks for one exact reversible piece that mixes the lines of a dock, selected from a named
// family on motion and binding only. No rule couples a mixer to a link member: the mixers act on the
// working rule's quantum amplitudes, whose vibes carry no colour, and the link members are classical Sigma(648) fields
// with demons. So the selection is made in two halves and the selected pair is a PRODUCT: a bound moving pair is not
// tested here (a recorded decision's S1 is where it would be).
//
// MOTION HALF. Six mixers (F-G, F-L, R-w, R-w2, R-1, R-star; the board log of 2026-11-15) and the bare working rule as
// the control, each on one lone love started on every slot of the base dock of the exact R = 4 ball, beats 1 to 4
// (inside the horizon: a vibe from the base reaches the frontier shell at beat 4 and leaves it only at beat 5). The
// state of one vibe is held sparse, (dock, slot, point, open) to an amplitude, because the branch code keeps a whole
// configuration per branch. The kernel of each beat is READ from the member's own code (E-SLF-0185's memberBeat) on
// the base dock of the exact R = 2 ball, and the sparse engine is gated against the branch code (K1). The husk
// position is the lattice position of each dock's exact center in the cusp chart of CUSP_VERTEX (buildExactCusp's
// positionOf), so a line's whole shadow is at most sqrt 2 (E-SPN-0156), which the bare control must show (C0).
//
// BINDING HALF. m2, m3, m4 of F35 (E-FRC-0317) at matched demon beta on the period-4 cusp's two floors, E-FRC-0319's
// procedure with a grid in energy per link (1.5 to 10 by 0.25). m1 passed in E-FRC-0319 and is not rerun; two of its
// points are rerun bit for bit as the engine check R'.
//
// GRADE. Motion: honeycomb (exact ball within its horizon). Binding: mirrored (the floor is felt). Depth L2.

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import {
  buildExactBall,
  exactCell,
  matrixVector,
  twiceForm,
  type ExactMatrix,
  type ExactVector,
} from '@/code/substrate/coxeter/exact-3434'
import { CUSP_VERTEX, cuspTranslations } from '@/code/substrate/coxeter/exact-cusp'
import {
  cloneConfiguration,
  lockedState,
  lockedTables,
  mergeBranches,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  coinedVetoBeat,
  currentCoinPlace,
  liftBranch,
  mixBranch,
  setCoinPlace,
} from '@/code/rule/coined-locked-knit'
import { ringDockMixBranch, ringScale, SWAP_ANGLE, type RingUnit } from '@/code/rule/swap-mixer'

import {
  colorGroup,
  cuspGraph,
  familyF35,
  i2Holds,
  instrumentGates,
  makeField,
  runPoint,
  type Member as LinkMember,
  type RunReading,
} from '@/test/experiment/gauge/demon-link-family'
import { fineGates } from '@/test/experiment/gauge/demon-link-m1-fine'
import {
  FLOORS,
  matchedPairs,
  type BetaPart,
  type BetaRun,
  type FloorName,
  type Match,
} from '@/test/experiment/gauge/demon-link-m1-beta'

const SLOTS = 24
const SQ3 = Math.sqrt(3)
const BEATS = 4
const OFF_LINE = Math.SQRT2 + 1e-9
const AMP_TOL = 1e-12
const SUPPORT_TOL = 1e-14
const NORM_TOL = 1e-12
const CONTROL_TOL = 1e-12
const UNIT_TOL = 1e-9
const MOTION_W_OFF = 0.01

// ---------------------------------------------------------------------------------------------------------------
// the mixers (E-SLF-0185's members, mix and scale only)

export type Mixer = {
  name: string
  mix: (cells: number, br: Branch) => Branch[]
  scale: bigint
}

const ringMixer = (name: string, u: RingUnit): Mixer => ({
  name,
  mix: (cells, br) => ringDockMixBranch(cells, br, u, false),
  scale: ringScale(u),
})

export const BARE: Mixer = { name: 'bare', mix: (_cells, br) => [br], scale: 1n }

export const MIXERS: readonly Mixer[] = [
  { name: 'F-G', mix: (cells, br) => mixBranch(cells, br), scale: 1n },
  { name: 'F-L', mix: (cells, br) => liftBranch(cells, br), scale: 1n },
  ringMixer('R-w', { num: [0n, 1n], den: 1n }),
  ringMixer('R-w2', { num: [-1n, -1n], den: 1n }),
  ringMixer('R-1', { num: [-1n, 0n], den: 1n }),
  ringMixer('R-star', SWAP_ANGLE),
]

const cloneBranch = (b: Branch): Branch => ({ ...cloneConfiguration(b), a: b.a, b: b.b, k: b.k })

export function mixerBeat(m: Mixer, t: LockedTables, s: LockedState, beat: number): LockedState {
  const mixed = mergeBranches(s.branches.flatMap(b => m.mix(t.cells, cloneBranch(b))))

  return coinedVetoBeat('none', t, { branches: mixed }, beat)
}

// ---------------------------------------------------------------------------------------------------------------
// the small exact ball and the branch code

export type SmallBall = { cells: number; tables: LockedTables; table: Int32Array; distance: Int32Array }

export function smallBall(radius: number): SmallBall {
  const m = exactBallMesh({ radius })
  const f = lockedFresh({ mesh: m.mesh, store: new Int8Array(m.cells * 12) })
  const tables = lockedTables(f.weave, 'pass', new Int16Array(m.cells * 24).fill(f.weave.moves.identity))

  return { cells: m.cells, tables, table: m.ball.table, distance: m.ball.distance }
}

export function oneLove(cells: number, dock: number, slot: number, point: number, open: number): Configuration {
  const c: Configuration = {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }

  c.vibe[dock * 24 + slot] = 1
  c.point[dock * 24 + slot] = point
  c.open[dock * 24 + slot] = open

  return c
}

// n / d as a float, for big exact integers
function ratio(n: bigint, d: bigint): number {
  if (n === 0n) {
    return 0
  }

  const neg = n < 0n
  const q = ((neg ? -n : n) << 160n) / d

  return ((neg ? -1 : 1) * Number(q)) / 2 ** 160
}

// one vibe: (dock, slot, point, open) as a number
export const keyOf = (dock: number, slot: number, point: number, open: number): number =>
  ((dock * SLOTS + slot) * 64 + (point + 32)) * 2 + open

const unkey = (key: number): { dock: number; slot: number; point: number; open: number } => {
  const open = key % 2
  const rest = (key - open) / 2
  const p = rest % 64
  const ds = (rest - p) / 64

  return { dock: Math.floor(ds / SLOTS), slot: ds % SLOTS, point: p - 32, open }
}

export type Amplitudes = Map<number, [number, number]>

type Shape = { exceptions: number }

// the branch code's state as amplitudes (beats run, so the scale is S^(cells beats))
function amplitudesOf(s: LockedState, cells: number, scale: bigint, beats: number, shape: Shape): Amplitudes {
  const out: Amplitudes = new Map()
  const den0 = scale ** BigInt(cells * beats)

  for (const b of s.branches) {
    const held: number[] = []

    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] !== 0) {
        held.push(i)
      }
    }

    const storeEmpty = b.store.every(v => v === 0)

    if (held.length !== 1 || b.vibe[held[0]!] !== 1 || !storeEmpty) {
      shape.exceptions++
      continue
    }

    const i = held[0]!
    const den = den0 << BigInt(b.k)
    const A = ratio(b.a, den)
    const B = ratio(b.b, den)
    const key = keyOf(Math.floor(i / 24), i % 24, b.point[i]!, b.open[i]!)
    const old = out.get(key) ?? [0, 0]

    out.set(key, [old[0] + A - B / 2, old[1] + (B * SQ3) / 2])
  }

  return out
}

// ---------------------------------------------------------------------------------------------------------------
// the kernel, read from the member's code on the base dock of the R = 2 ball

export type Out = { dir: number; slot: number; point: number; open: number; re: number; im: number }

export type Kernel = {
  get: (beat: number, slot: number, point: number, open: number) => Out[]
  exceptions: () => number
  reads: () => number
}

export function readKernel(m: Mixer, ball: SmallBall): Kernel {
  const cache = new Map<string, Out[]>()
  const dirOf = new Map<number, number>()
  const shape: Shape = { exceptions: 0 }

  for (let e = 0; e < SLOTS; e++) {
    dirOf.set(ball.table[e]!, e)
  }

  return {
    get(beat, slot, point, open) {
      const id = `${beat}:${slot}:${point}:${open}`
      const hit = cache.get(id)

      if (hit) {
        return hit
      }

      const s = mixerBeat(m, ball.tables, lockedState(oneLove(ball.cells, 0, slot, point, open)), beat)
      const amps = amplitudesOf(s, ball.cells, m.scale, 1, shape)
      const outs: Out[] = []

      for (const [key, [re, im]] of amps) {
        const u = unkey(key)
        const dir = u.dock === 0 ? -1 : (dirOf.get(u.dock) ?? -2)

        if (dir === -2 || u.open !== 1) {
          shape.exceptions++
          continue
        }

        outs.push({ dir, slot: u.slot, point: u.point, open: u.open, re, im })
      }

      cache.set(id, outs)

      return outs
    },
    exceptions: () => shape.exceptions,
    reads: () => cache.size,
  }
}

// one beat of the sparse engine on a table
export function sparseBeat(
  kernel: Kernel,
  table: Int32Array,
  state: Amplitudes,
  beat: number,
  hits: { frontier: number },
): Amplitudes {
  const next: Amplitudes = new Map()

  for (const [key, [re, im]] of state) {
    const u = unkey(key)

    for (const o of kernel.get(beat, u.slot, u.point, u.open)) {
      const y = o.dir < 0 ? u.dock : table[u.dock * SLOTS + o.dir]!

      if (y < 0) {
        hits.frontier++
        continue
      }

      const k = keyOf(y, o.slot, o.point, o.open)
      const old = next.get(k) ?? [0, 0]

      next.set(k, [old[0] + re * o.re - im * o.im, old[1] + re * o.im + im * o.re])
    }
  }

  return next
}

export function compare(a: Amplitudes, b: Amplitudes): { diff: number; mismatches: number } {
  let diff = 0
  let mismatches = 0

  for (const key of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(key) ?? [0, 0]
    const y = b.get(key) ?? [0, 0]

    diff = Math.max(diff, Math.hypot(x[0] - y[0], x[1] - y[1]))

    if (Math.hypot(...x) > SUPPORT_TOL !== Math.hypot(...y) > SUPPORT_TOL) {
      mismatches++
    }
  }

  return { diff, mismatches }
}

// K1: the sparse engine against the branch code on the R = 2 ball
function kernelCheck(m: Mixer, ball: SmallBall, kernel: Kernel, starts: number[]): { diff: number; mismatches: number; runs: number } {
  let diff = 0
  let mismatches = 0
  let runs = 0
  const hits = { frontier: 0 }
  const shape: Shape = { exceptions: 0 }
  const run = (dock: number, slot: number, first: number, beats: number): void => {
    let s = lockedState(oneLove(ball.cells, dock, slot, 0, 1))
    let a: Amplitudes = new Map([[keyOf(dock, slot, 0, 1), [1, 0]]])

    for (let t = first; t < first + beats; t++) {
      s = mixerBeat(m, ball.tables, s, t)
      a = sparseBeat(kernel, ball.table, a, t, hits)
    }

    const c = compare(amplitudesOf(s, ball.cells, m.scale, beats, shape), a)

    diff = Math.max(diff, c.diff)
    mismatches += c.mismatches
    runs++
  }

  for (let slot = 0; slot < SLOTS; slot++) {
    run(0, slot, 0, 2)
    run(0, slot, 2, 2)

    for (const dock of starts) {
      for (let t = 0; t < BEATS; t++) {
        run(dock, slot, t, 1)
      }
    }
  }

  return { diff, mismatches: mismatches + shape.exceptions + hits.frontier, runs }
}

// ---------------------------------------------------------------------------------------------------------------
// the R = 4 ball and the husk chart

export type Chart = {
  cells: number
  table: Int32Array
  distance: Int32Array
  pos: Float64Array
  layer: Uint8Array
  exact: boolean
  layerSlots: number[]
  axes: { slot: number; partner: number }[]
}

export function chartBall(radius: number): Chart {
  const cell = exactCell()
  const ball = buildExactBall({ radius, keepFrames: true, cell })
  const translations = cuspTranslations(cell)
  const toFloat = ([x, y]: [bigint, bigint]): number => Number(x) + Number(y) * Math.SQRT2
  const unit = (i: number): ExactVector => {
    const v = new Array<bigint>(10).fill(0n)

    v[2 * i] = 1n

    return v
  }
  const zOf = (c: ExactVector): number[] => {
    const level = toFloat(twiceForm(c, CUSP_VERTEX))

    return [1, 2, 3].map(i => toFloat(twiceForm(c, unit(i))) / level)
  }
  const z0 = zOf(cell.center)
  const shifts = translations.axes.map(a => zOf(matrixVector(a.translation, cell.center)).map((v, i) => v - z0[i]!))
  const S = [0, 1, 2].map(i => [0, 1, 2].map(j => shifts[j]![i]!))
  const Sinv = invert3(S)
  const level0 = twiceForm(cell.center, CUSP_VERTEX)
  const pos = new Float64Array(ball.cells * 3)
  const layer = new Uint8Array(ball.cells)

  for (let x = 0; x < ball.cells; x++) {
    const c = matrixVector(ball.frames![x] as ExactMatrix, cell.center)
    const dz = zOf(c).map((v, i) => v - z0[i]!)
    const level = twiceForm(c, CUSP_VERTEX)

    for (let i = 0; i < 3; i++) {
      pos[x * 3 + i] = [0, 1, 2].reduce((s, j) => s + Sinv[i]![j]! * dz[j]!, 0)
    }

    layer[x] = level[0] === level0[0] && level[1] === level0[1] ? 1 : 0
  }

  return {
    cells: ball.cells,
    table: ball.table,
    distance: ball.distance,
    pos,
    layer,
    exact: ball.inconsistentSteps === 0 && ball.returnsExactly,
    layerSlots: translations.layerSlots,
    axes: translations.axes.map(a => ({ slot: a.slot, partner: a.partner })),
  }
}

function invert3(S: number[][]): number[][] {
  const g = (i: number, j: number): number => S[i]![j]!
  const det =
    g(0, 0) * (g(1, 1) * g(2, 2) - g(1, 2) * g(2, 1)) -
    g(0, 1) * (g(1, 0) * g(2, 2) - g(1, 2) * g(2, 0)) +
    g(0, 2) * (g(1, 0) * g(2, 1) - g(1, 1) * g(2, 0))
  const cof = (i: number, j: number): number => {
    const r = [0, 1, 2].filter(k => k !== i)
    const c = [0, 1, 2].filter(k => k !== j)
    const m = g(r[0]!, c[0]!) * g(r[1]!, c[1]!) - g(r[0]!, c[1]!) * g(r[1]!, c[0]!)

    return (i + j) % 2 === 0 ? m : -m
  }

  return [0, 1, 2].map(i => [0, 1, 2].map(j => cof(j, i) / det))
}

// the eigenvalues of a symmetric 3 x 3, ascending
function symmetricEigen3(m: number[][]): [number, number, number] {
  const p1 = m[0]![1]! ** 2 + m[0]![2]! ** 2 + m[1]![2]! ** 2
  const q = (m[0]![0]! + m[1]![1]! + m[2]![2]!) / 3

  if (p1 === 0) {
    return [m[0]![0]!, m[1]![1]!, m[2]![2]!].sort((a, b) => a - b) as [number, number, number]
  }

  const p2 = (m[0]![0]! - q) ** 2 + (m[1]![1]! - q) ** 2 + (m[2]![2]! - q) ** 2 + 2 * p1
  const p = Math.sqrt(p2 / 6)
  const B = m.map((row, i) => row.map((v, j) => (v - (i === j ? q : 0)) / p))
  const detB =
    B[0]![0]! * (B[1]![1]! * B[2]![2]! - B[1]![2]! * B[2]![1]!) -
    B[0]![1]! * (B[1]![0]! * B[2]![2]! - B[1]![2]! * B[2]![0]!) +
    B[0]![2]! * (B[1]![0]! * B[2]![1]! - B[1]![1]! * B[2]![0]!)
  const r = Math.max(-1, Math.min(1, detB / 2))
  const phi = Math.acos(r) / 3
  const e1 = q + 2 * p * Math.cos(phi)
  const e3 = q + 2 * p * Math.cos(phi + (2 * Math.PI) / 3)

  return [e3, 3 * q - e1 - e3, e1]
}

// ---------------------------------------------------------------------------------------------------------------
// the motion half

export type BeatReading = {
  wOff: number
  msd: number
  meanShift: number
  layerWeight: number
  meanDistance: number
  norm: number
  // the displacement second moments, summed over the 24 starts and divided by 24
  moments: number[]
  maxShadow: number
}

export type MixerReading = {
  name: string
  beats: BeatReading[]
  normOff: number
  frontier: number
  kernelExceptions: number
  kernelReads: number
  check: { diff: number; mismatches: number; runs: number }
  eigenRatio: number
  pass: boolean
}

export type MotionPart = {
  cells: number
  exact: boolean
  h1: { unitOff: number; pairOff: number; axes: number; layerSlots: number[] }
  starts: number[]
  readings: MixerReading[]
}

function readMixer(m: Mixer, small: SmallBall, chart: Chart, starts: number[], log: (line: string) => void): MixerReading {
  const started = Date.now()
  const kernel = readKernel(m, small)
  const check = kernelCheck(m, small, kernel, starts)
  const hits = { frontier: 0 }
  const sums: BeatReading[] = Array.from({ length: BEATS }, () => ({
    wOff: 0,
    msd: 0,
    meanShift: 0,
    layerWeight: 0,
    meanDistance: 0,
    norm: 0,
    moments: new Array<number>(9).fill(0),
    maxShadow: 0,
  }))

  let normOff = 0

  for (let slot = 0; slot < SLOTS; slot++) {
    let a: Amplitudes = new Map([[keyOf(0, slot, 0, 1), [1, 0]]])

    for (let t = 0; t < BEATS; t++) {
      a = sparseBeat(kernel, chart.table, a, t, hits)

      const r = sums[t]!

      let weight = 0
      let wOff = 0
      let msd = 0
      let layerWeight = 0
      let distance = 0
      const mean = [0, 0, 0]

      for (const [key, [re, im]] of a) {
        const w = re * re + im * im
        const x = Math.floor(key / (SLOTS * 128))
        const d = [0, 1, 2].map(i => chart.pos[x * 3 + i]! - chart.pos[i]!)
        const s2 = d[0]! ** 2 + d[1]! ** 2 + d[2]! ** 2

        weight += w
        msd += w * s2
        layerWeight += w * chart.layer[x]!
        distance += w * chart.distance[x]!

        if (w > SUPPORT_TOL) {
          r.maxShadow = Math.max(r.maxShadow, Math.sqrt(s2))
        }

        if (Math.sqrt(s2) > OFF_LINE) {
          wOff += w
        }

        for (let i = 0; i < 3; i++) {
          mean[i]! += w * d[i]!

          for (let j = 0; j < 3; j++) {
            r.moments[i * 3 + j]! += (w * d[i]! * d[j]!) / SLOTS
          }
        }
      }

      normOff = Math.max(normOff, Math.abs(weight - 1))
      r.wOff += wOff / SLOTS
      r.msd += msd / SLOTS
      r.meanShift += Math.hypot(...mean) / SLOTS
      r.layerWeight += layerWeight / SLOTS
      r.meanDistance += distance / SLOTS
      r.norm += weight / SLOTS
    }
  }

  const last = sums[BEATS - 1]!
  const M = [0, 1, 2].map(i => [0, 1, 2].map(j => last.moments[i * 3 + j]!))
  const [lo, , hi] = symmetricEigen3(M)
  const pass = last.wOff >= MOTION_W_OFF && last.msd > sums[1]!.msd

  log(
    `${m.name}: W_off ${sums.map(s => s.wOff.toFixed(4)).join(' ')} msd ${sums.map(s => s.msd.toFixed(4)).join(' ')} layer ${sums.map(s => s.layerWeight.toFixed(4)).join(' ')} K1 diff ${check.diff.toExponential(1)} mismatches ${check.mismatches} norm off ${normOff.toExponential(1)} ${((Date.now() - started) / 1000).toFixed(0)} s`,
  )

  return {
    name: m.name,
    beats: sums,
    normOff,
    frontier: hits.frontier,
    kernelExceptions: kernel.exceptions(),
    kernelReads: kernel.reads(),
    check,
    eigenRatio: hi > 0 ? lo / hi : Number.NaN,
    pass,
  }
}

export function motionPart(log: (line: string) => void): MotionPart {
  const place0 = currentCoinPlace()

  setCoinPlace('split')

  try {
    const small = smallBall(2)
    const chart = chartBall(BEATS)

    log(`R = 2 ball ${small.cells} docks, R = ${BEATS} ball ${chart.cells} docks, exact ${chart.exact}`)

    // H1: the six layer neighbours at unit distance, in opposite pairs
    const at = (x: number): number[] => [0, 1, 2].map(i => chart.pos[x * 3 + i]! - chart.pos[i]!)
    const unitOff = Math.max(
      ...chart.layerSlots.map(s => Math.abs(Math.hypot(...at(chart.table[s]!)) - 1)),
    )
    const pairOff = Math.max(
      ...chart.axes.map(({ slot, partner }) => {
        const p = at(chart.table[slot]!)
        const q = at(chart.table[partner]!)

        return Math.hypot(p[0]! + q[0]!, p[1]! + q[1]!, p[2]! + q[2]!)
      }),
    )
    const layerDock = small.table[chart.layerSlots[0]!]!
    const bulkSlot = Array.from({ length: SLOTS }, (_, k) => k).find(k => !chart.layerSlots.includes(k))!
    const starts = [layerDock, small.table[bulkSlot]!]
    const readings = [BARE, ...MIXERS].map(m => readMixer(m, small, chart, starts, log))

    return {
      cells: chart.cells,
      exact: chart.exact,
      h1: { unitOff, pairOff, axes: chart.axes.length, layerSlots: chart.layerSlots },
      starts,
      readings,
    }
  } finally {
    setCoinPlace(place0)
  }
}

export type MotionGates = { k0: boolean; k1: boolean; k2: boolean; k3: boolean; h1: boolean; c0: boolean; all: boolean }

// normTol: E-FRC-0320's 1e-12 by default; E-FRC-0321 passes 1e-10
export function motionGates(part: MotionPart, normTol = NORM_TOL): MotionGates {
  const k0 = part.readings.every(r => r.kernelExceptions === 0)
  const k1 = part.readings.every(r => r.check.diff <= AMP_TOL && r.check.mismatches === 0)
  const k2 = part.readings.every(r => r.normOff <= normTol)
  const k3 = part.readings.every(r => r.frontier === 0)
  const h1 =
    part.h1.layerSlots.length === 6 && part.h1.axes === 3 && part.h1.unitOff <= UNIT_TOL && part.h1.pairOff <= UNIT_TOL
  const bare = part.readings.find(r => r.name === 'bare')!
  const c0 = bare.beats.every(b => b.wOff <= CONTROL_TOL)

  return { k0, k1, k2, k3, h1, c0, all: k0 && k1 && k2 && k3 && h1 && c0 }
}

// ---------------------------------------------------------------------------------------------------------------
// the binding half

const BETA_TOLERANCE = 0.01
const MAX_BISECTIONS = 12
const EDGE_LOW = 0.02
const EDGE_HIGH = 0.4
const FLOOR_TOLERANCE = 0.25
const PASS_PAIRS = 3

export const ENERGIES: readonly number[] = Array.from({ length: 35 }, (_, k) => 1.5 + 0.25 * k)

const strip = ({ state: _, ...reading }: RunReading & { state: unknown }): RunReading => reading

const within = (beta: number, target: number): boolean => Math.abs(beta - target) <= BETA_TOLERANCE * Math.abs(target)

function straddle(runs: readonly BetaRun[], target: number): [BetaRun, BetaRun] | null {
  const sorted = [...runs].sort((a, b) => a.fill - b.fill)

  for (let k = sorted.length - 2; k >= 0; k--) {
    const a = sorted[k]!
    const b = sorted[k + 1]!

    if ((a.beta - target) * (b.beta - target) <= 0) {
      return [a, b]
    }
  }

  return null
}

export type LinkPart = BetaPart & { member: string; capacity: number }

export function linkPart(name: 'm2' | 'm3' | 'm4', log: (line: string) => void): LinkPart {
  const color = colorGroup()
  const member = familyF35(color).find(m => m.name === name)! as LinkMember
  const instruments: BetaPart['instruments'] = {}
  const runs: BetaRun[] = []
  const matches: Match[] = []
  const shapes = FLOORS.map(shape => {
    const graph = cuspGraph({ period: shape.period, floor: shape.floor })
    const field = makeField(graph)

    instruments[shape.name] = instrumentGates(graph, field)

    return { ...shape, field }
  })
  const point = (floor: FloorName, fill: number, role: BetaRun['role']): BetaRun => {
    const shape = shapes.find(s => s.name === floor)!
    const run: BetaRun = { ...strip(runPoint({ field: shape.field, color, member, fill, log })), instrument: floor, role }

    runs.push(run)

    return run
  }

  for (const shape of FLOORS) {
    for (const e of ENERGIES) {
      point(shape.name, e / member.capacity, 'grid')
    }
  }

  const targets = FLOORS.flatMap(shape =>
    runs
      .filter(r => r.role === 'grid' && r.instrument === shape.name && fineGates(r).string)
      .sort((a, b) => a.fill - b.fill)
      .map(r => ({ source: shape.name, sourceFill: r.fill, target: r.beta })),
  )

  for (const { source, sourceFill, target } of targets) {
    const other: FloorName = source === 'I-A' ? 'I-C' : 'I-A'
    const on = (): BetaRun[] => runs.filter(r => r.instrument === other)

    let pair = straddle(on(), target)

    if (pair === null) {
      for (const edge of [EDGE_LOW, EDGE_HIGH]) {
        if (!on().some(r => r.fill === edge)) {
          point(other, edge, 'edge')
        }
      }

      pair = straddle(on(), target)
    }

    let found: BetaRun | null = null
    let bisections = 0

    if (pair !== null) {
      found =
        pair
          .filter(r => within(r.beta, target))
          .sort((a, b) => Math.abs(a.beta - target) - Math.abs(b.beta - target))[0] ?? null

      let [low, high] = pair

      while (found === null && bisections < MAX_BISECTIONS) {
        const run = point(other, (low.fill + high.fill) / 2, 'bisect')

        bisections += 1

        if (within(run.beta, target)) {
          found = run
        } else if ((run.beta - target) * (low.beta - target) > 0) {
          low = run
        } else {
          high = run
        }
      }
    }

    const match: Match = { source, sourceFill, target, other, fill: found?.fill ?? null, beta: found?.beta ?? null, bisections }

    matches.push(match)
    log(`${name} match ${JSON.stringify(match)}`)
  }

  return {
    member: name,
    capacity: member.capacity,
    group: { order: color.group.order, centre: color.centre.length },
    instruments,
    runs,
    matches,
  }
}

// R': two of E-FRC-0319's m1 points, rerun
export type ReferencePart = { runs: RunReading[] }

export const REFERENCE_POINTS: readonly { instrument: FloorName; fill: number }[] = [
  { instrument: 'I-A', fill: 0.14 },
  { instrument: 'I-C', fill: 0.11 },
]

export function referencePart(log: (line: string) => void): ReferencePart {
  const color = colorGroup()
  const m1 = familyF35(color)[0]!
  const runs = REFERENCE_POINTS.map(p => {
    const shape = FLOORS.find(f => f.name === p.instrument)!
    const field = makeField(cuspGraph({ period: shape.period, floor: shape.floor }))

    return { ...strip(runPoint({ field, color, member: m1, fill: p.fill, log })), instrument: p.instrument }
  })

  return { runs }
}

export function referenceHolds(part: ReferencePart, old: BetaPart | null): boolean {
  if (old === null) {
    return false
  }

  return REFERENCE_POINTS.every(p => {
    const a = part.runs.find(r => r.instrument === p.instrument && r.fill === p.fill)
    const b = old.runs.find(r => r.instrument === p.instrument && r.fill === p.fill && r.role === 'grid')

    return (
      a !== undefined &&
      b !== undefined &&
      a.beta === b.beta &&
      a.chi22.value === b.chi22.value &&
      a.chi22.error === b.chi22.error &&
      a.layerPlaquette === b.layerPlaquette
    )
  })
}

export type LinkGrade = {
  member: string
  status: 'pass' | 'fail' | 'partial'
  instruments: boolean
  both: number
  beyond: number
  matched: number
  targets: number
  maxShift: number
  pairs: { target: number; aFill: number; cFill: number; aChi: number; aErr: number; cChi: number; cErr: number; aE: number; cE: number; both: boolean; shift: number }[]
}

export function gradeLink(part: LinkPart): LinkGrade {
  const gates = FLOORS.map(f => part.instruments[f.name]!)
  const instruments =
    part.group.order === 648 &&
    part.group.centre === 3 &&
    gates.every(i2Holds) &&
    gates.every(g => g.classConflicts === 0) &&
    gates.every(g => g.bipartiteConflicts === 0) &&
    part.runs.every(r => r.energyDrift === 0 && r.loopFailures === 0)
  const pairs = matchedPairs(part)
  const both = pairs.filter(p => p.both)
  const beyond = both.filter(p => !p.stable)
  const status: LinkGrade['status'] = !instruments
    ? 'partial'
    : beyond.length > 0
      ? 'fail'
      : both.length >= PASS_PAIRS
        ? 'pass'
        : 'partial'

  return {
    member: part.member,
    status,
    instruments,
    both: both.length,
    beyond: beyond.length,
    matched: pairs.length,
    targets: part.matches.length,
    maxShift: both.length > 0 ? Math.max(...both.map(p => p.shift)) : Number.NaN,
    pairs: pairs.map(p => ({
      target: p.match.target,
      aFill: p.a.fill,
      cFill: p.c.fill,
      aChi: p.a.chi22.value,
      aErr: p.a.chi22.error,
      cChi: p.c.chi22.value,
      cErr: p.c.chi22.error,
      aE: p.a.energyPerLink,
      cE: p.c.energyPerLink,
      both: p.both,
      shift: p.shift,
    })),
  }
}

// m1, from E-FRC-0319: 3 both-confining pairs, largest shift 18.0 percent
export const M1_GRADE = { member: 'm1', status: 'pass' as const, both: 3, maxShift: 0.18 }

// ---------------------------------------------------------------------------------------------------------------
// the selection and the verdict

const fmt = (x: number, d = 3): string => (Number.isFinite(x) ? x.toFixed(d) : 'none')

export function selectVerdict(input: {
  motion: MotionPart
  links: LinkPart[]
  reference: ReferencePart
  old: BetaPart | null
}): Verdict {
  const { motion, links, reference, old } = input
  const mg = motionGates(motion)
  const rPrime = referenceHolds(reference, old)
  const grades = links.map(gradeLink)
  const linkInstruments = grades.every(g => g.instruments)
  const instrumentsHold = mg.all && rPrime && linkInstruments
  const mixers = motion.readings.filter(r => r.name !== 'bare')
  const moving = mixers.filter(r => r.pass).sort((a, b) => b.beats[BEATS - 1]!.msd - a.beats[BEATS - 1]!.msd)
  const binding = [
    M1_GRADE,
    ...grades.filter(g => g.status === 'pass').map(g => ({ member: g.member, status: g.status, both: g.both, maxShift: g.maxShift })),
  ].sort((a, b) => b.both - a.both || a.maxShift - b.maxShift)
  const mixer = moving[0]
  const link = binding[0]
  const status: Verdict['status'] = !instrumentsHold
    ? 'open'
    : mixer !== undefined && link !== undefined
      ? 'pass'
      : 'fail'
  const bare = motion.readings.find(r => r.name === 'bare')!
  const row = (r: MixerReading): string =>
    `${r.name} ${r.pass ? 'MOVES' : 'no'}: W_off ${r.beats.map(b => fmt(b.wOff, 4)).join(' ')}, msd ${r.beats.map(b => fmt(b.msd)).join(' ')}, |mean| ${r.beats.map(b => fmt(b.meanShift)).join(' ')}, layer weight ${r.beats.map(b => fmt(b.layerWeight)).join(' ')}, ball distance ${r.beats.map(b => fmt(b.meanDistance, 2)).join(' ')}, largest shadow ${fmt(r.beats[BEATS - 1]!.maxShadow)}, covariance ratio ${fmt(r.eigenRatio)}`
  const linkRow = (g: LinkGrade): string =>
    `${g.member} ${g.status.toUpperCase()}: ${g.targets} targets, ${g.matched} matched, ${g.both} both-confining, ${g.beyond} beyond 25 percent${g.both > 0 ? `, largest shift ${fmt(g.maxShift)}` : ''}${g.pairs.filter(p => p.both).length > 0 ? ` (${g.pairs.filter(p => p.both).map(p => `beta ${fmt(p.target)}: I-A E ${fmt(p.aE, 2)} chi22 ${fmt(p.aChi)} +- ${fmt(p.aErr)}, I-C E ${fmt(p.cE, 2)} chi22 ${fmt(p.cChi)} +- ${fmt(p.cErr)}, shift ${fmt(p.shift)}`).join('; ')})` : ''}`
  const metrics: Record<string, number> = {
    k0: mg.k0 ? 1 : 0,
    k1: mg.k1 ? 1 : 0,
    k2: mg.k2 ? 1 : 0,
    k3: mg.k3 ? 1 : 0,
    h1: mg.h1 ? 1 : 0,
    c0: mg.c0 ? 1 : 0,
    rPrime: rPrime ? 1 : 0,
    linkInstruments: linkInstruments ? 1 : 0,
    ballExact: motion.exact ? 1 : 0,
    ballCells: motion.cells,
    h1UnitOff: motion.h1.unitOff,
    h1PairOff: motion.h1.pairOff,
    moving: moving.length,
    bindingPass: binding.length,
  }

  for (const r of motion.readings) {
    const p = r.name.replace('-', '')

    metrics[`${p}_wOff4`] = r.beats[BEATS - 1]!.wOff
    metrics[`${p}_msd2`] = r.beats[1]!.msd
    metrics[`${p}_msd4`] = r.beats[BEATS - 1]!.msd
    metrics[`${p}_k1Diff`] = r.check.diff
    metrics[`${p}_k1Mismatches`] = r.check.mismatches
    metrics[`${p}_normOff`] = r.normOff
    metrics[`${p}_pass`] = r.pass ? 1 : 0
  }

  for (const g of grades) {
    metrics[`${g.member}_both`] = g.both
    metrics[`${g.member}_beyond`] = g.beyond
    metrics[`${g.member}_maxShift`] = g.maxShift
    metrics[`${g.member}_pass`] = g.status === 'pass' ? 1 : 0
  }

  const selection =
    status === 'pass'
      ? `SELECTED (a product of two halves): mixer ${mixer!.name}, link ${link!.member}. Motion order ${moving.map(r => r.name).join(', ')}; binding order ${binding.map(b => b.member).join(', ')}`
      : status === 'fail'
        ? `NO PAIR: ${moving.length === 0 ? 'no mixer passes motion' : 'no link member passes binding'}, so a board proposal is withdrawn for this family`
        : 'NOT SELECTED: an instrument gate fails'

  return verdict({
    status,
    claim: `${selection}. A bound moving pair is NOT tested: no rule couples a mixer to a link. MOTION on the exact R = ${BEATS} ball (${motion.cells} docks), one lone love on each of the 24 base-dock slots, beats 1 to ${BEATS}, husk displacement in cusp lattice units: ${motion.readings.map(row).join(' || ')}. BINDING at matched demon beta on the period-4 cusp, floors 1 and 2: m1 PASS (E-FRC-0319, not rerun); ${grades.map(linkRow).join(' || ')}. Instruments ${instrumentsHold ? 'hold' : 'FAIL'} (K0 ${mg.k0}, K1 ${mg.k1}, K2 ${mg.k2}, K3 ${mg.k3}, H1 ${mg.h1}, C0 ${mg.c0} with the bare rule's largest shadow ${fmt(Math.max(...bare.beats.map(b => b.maxShadow)), 4)}, R' ${rPrime}, link gates ${linkInstruments}). Bell, interference, the C, P, CP table and size were not run`,
    metrics,
    control: { c0: mg.c0 ? 1 : 0, rPrime: rPrime ? 1 : 0 },
    notes: `L2. Gates registered before the run, gate 3abdc27af879. Motion grade honeycomb (exact within the ball's horizon), binding grade mirrored. Kernel reads ${motion.readings.map(r => `${r.name} ${r.kernelReads}`).join(', ')}; K1 runs ${motion.readings[0]?.check.runs ?? 0} per member from the base dock and docks ${motion.starts.join(', ')}. Link instruments: ${JSON.stringify(links.map(l => ({ member: l.member, capacity: l.capacity, instruments: l.instruments })))}.`,
  })
}

// ---------------------------------------------------------------------------------------------------------------
// the stored parts (the long run writes them to the deck's tmp/mixer-link-select/)

const tmpRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'tmp')
const folder = join(tmpRoot, 'mixer-link-select')

// dir: the folder under the deck's tmp/ (E-FRC-0320's by default; E-FRC-0321 writes tmp/mixer-link-rerun)
export const partFile = (name: string, dir = 'mixer-link-select'): string => join(tmpRoot, dir, `${name}.json`)

export function readPart<T>(name: string, dir = 'mixer-link-select'): T | null {
  const file = partFile(name, dir)
  const inner = join(file, `${name}.json`)
  const path = existsSync(inner) ? inner : existsSync(file) ? file : null

  return path === null ? null : (JSON.parse(readFileSync(path, 'utf8')) as T)
}

// E-FRC-0319's m1 runs, for R'
export function readOld(): BetaPart | null {
  const file = join(folder, '..', 'demon-link-m1-beta', 'all.json')
  const inner = join(file, 'all.json')
  const path = existsSync(inner) ? inner : existsSync(file) ? file : null

  return path === null ? null : (JSON.parse(readFileSync(path, 'utf8')) as BetaPart)
}

export default experiment({
  id: 'gauge/mixer-link-select',
  code: 'E-FRC-0320',
  title:
    "a board proposal's mixer and link selected in two halves, open by the registered rule (gates fixed before the run): the norm gate K2 (1e-12) failed on the four ring mixers at 1.6e-12 to 3.3e-12, float summing over about 3e5 amplitudes, while the kernel matched the branch code to 1.6e-16; MOTION on the exact R = 4 ball, one lone love on each base-dock slot, beats 1 to 4, husk displacement in cusp lattice units: the line-law control never passes sqrt 2 (largest shadow 1.207), F-G and F-L (identical on a lone vibe) put 0.0126 of the weight past sqrt 2 at beat 4 with msd 0.408 against the control's 0.333 and pass, the four ring mixers put 0.002 there and fail; BINDING at matched demon beta on the period-4 cusp's two floors: m1 passes (E-FRC-0319), m2 partial (2 both-confining pairs, shifts 0.147, 0.035), m3 fails (10 pairs, 3 past 25 percent, largest 0.281), m4 fails (11 pairs, 2 past, largest 0.301); the pair (F-G or F-L, m1) is a product of two halves, and a bound moving pair is not tested",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const log = (line: string): void => console.error(line)

    return selectVerdict({
      motion: motionPart(log),
      links: (['m2', 'm3', 'm4'] as const).map(name => linkPart(name, log)),
      reference: referencePart(log),
      old: readOld(),
    })
  },
})
