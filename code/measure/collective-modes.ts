// Instruments for reading a COLLECTIVE excitation of a vacuum on the husk rather than one vibe (E-SPN-0157). A line
// holds a lone vibe forever (the line law, E-SPN-0098), and on the true mesh a line's husk shadow is bounded
// (E-SPN-0156), so any husk particle must be a pattern of many vibes. These pieces read such patterns. Each is general.
//
// - lineLocalCollide: the rule's collision with K removed. On a dock holding at most one single line it IS the rule's
//   collision (the pair move, then B through coinPiece, in the rule's alternating order). On a dock holding two or more
//   single lines, where the rule applies K = w_P to the whole dock, it applies only B's action on the FULL lines (each
//   full line turns, or keeps its slots on 'pass' when its two vibes are alike) and leaves every single where it is.
//   So no vibe ever changes line: the control in which a collective mode must split into line beams.
// - dockVectors: every dock of the flat D4 box as its exact D4 lattice vector (4 integers), the husk reading taking the
//   first three (code/measure/causal-components boxHusk's columns).
// - classLines: the mesh lines of one slot class d, each walked from its lowest dock along r_d through the rule's own
//   stream table, with every dock's line and its position along it.
// - huskFourier: the Fourier amplitude of a dock field at the husk wave vector 2 pi m / side (m integer, m3 = 0), read
//   through the exact integer phase (m . v) mod side.
// - lineDisplacement: a run against its vacuum on one class: the charge the run adds, as a histogram over signed
//   positions along each class-d line relative to that line's start (exact integers), the lines whose added tone is
//   not the given one, and every slot or store off the class that differs from the vacuum.
// - classWave, packetMoments, perpendicularShare: the class average of the 24 one-line laws, read as a husk plane
//   wave, as the moments of a husk packet, and the share of classes a wave vector cannot move.
//
// DETERMINISM: no random numbers; every reading is exact integers until the final cosine or ratio. NOTHING MOVES: each
// reading compares values the stream took.

import { type Configuration, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { coinPiece, pairPiece } from '@/code/rule/occupation-veto-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { d4BoxCoordinates, d4Vector } from '@/code/substrate/d4-box-integer'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] as number)

// ---- the collision with K removed ----

function singleLines(c: Configuration, base: number): number {
  let singles = 0

  for (let l = 0; l < 12; l++) {
    const a = c.vibe[base + (LINE_FIRSTS[l] as number)] !== 0
    const b = c.vibe[base + (LINE_SECONDS[l] as number)] !== 0

    if (a !== b) singles++
  }

  return singles
}

function swapSlots(c: Configuration, i: number, j: number): void {
  const v = c.vibe[i] as number
  const p = c.point[i] as number
  const o = c.open[i] as number

  c.vibe[i] = c.vibe[j] as number
  c.point[i] = c.point[j] as number
  c.open[i] = c.open[j] as number
  c.vibe[j] = v
  c.point[j] = p
  c.open[j] = o
}

// B's action on the full lines of one dock alone: every full line turns, or on 'pass' keeps its slots when alike
function fullLinesOnly(tables: LockedTables, c: Configuration, x: number): void {
  const base = x * 24

  for (let l = 0; l < 12; l++) {
    const i = base + (LINE_FIRSTS[l] as number)
    const j = base + (LINE_SECONDS[l] as number)
    const a = c.vibe[i] as number
    const b = c.vibe[j] as number

    if (a === 0 || b === 0) continue
    if (tables.collision === 'pass' && a === b) continue
    swapSlots(c, i, j)
  }
}

export type LineLocalTally = { kDocks: number }

export function lineLocalCollide(tally?: LineLocalTally): (tables: LockedTables, c: Configuration, beat: number) => void {
  return (tables, c, beat) => {
    if (tables.collision === 'isometric') throw new Error('lineLocalCollide: the isometric contact has no B to keep')

    const order = collisionOrder('alternate', beat)

    for (let x = 0; x < tables.cells; x++) {
      for (const piece of order) {
        if (piece === 'P') {
          pairPiece('none', c, x)
          continue
        }

        if (singleLines(c, x * 24) <= 1) coinPiece(tables, c, x)
        else {
          if (tally) tally.kDocks++
          fullLinesOnly(tables, c, x)
        }
      }
    }
  }
}

// ---- the flat box's docks and its husk plane waves ----

export function dockVectors(cells: number, side: number): Int32Array {
  const out = new Int32Array(cells * 4)

  for (let x = 0; x < cells; x++) out.set(d4Vector(d4BoxCoordinates({ cell: x, side })), x * 4)

  return out
}

// (m . v) mod side, exact
export function phaseIndex(m: readonly number[], vectors: Int32Array, x: number, side: number): number {
  let s = 0

  for (let a = 0; a < 4; a++) s += (m[a] ?? 0) * (vectors[x * 4 + a] as number)

  return ((s % side) + side) % side
}

// the Fourier amplitude sum_x f(x) e^(-i 2 pi (m . v_x) / side) of a dock field
export function huskFourier(field: ArrayLike<number>, vectors: Int32Array, m: readonly number[], side: number): [number, number] {
  const cos = Float64Array.from({ length: side }, (_, p) => Math.cos((2 * Math.PI * p) / side))
  const sin = Float64Array.from({ length: side }, (_, p) => Math.sin((2 * Math.PI * p) / side))
  let re = 0
  let im = 0

  for (let x = 0; x < field.length; x++) {
    const f = field[x] as number

    if (f === 0) continue

    const p = phaseIndex(m, vectors, x, side)

    re += f * (cos[p] as number)
    im -= f * (sin[p] as number)
  }

  return [re, im]
}

// the charge (sum of vibes) and the content (vibes plus two per stored unit) of every dock
export function dockCharge(c: Configuration, cells: number): Int32Array {
  const out = new Int32Array(cells)

  for (let i = 0; i < c.vibe.length; i++) {
    const v = c.vibe[i] as number

    if (v !== 0) out[(i / 24) | 0]! += v
  }

  return out
}

export function dockContent(c: Configuration, cells: number): Int32Array {
  const out = new Int32Array(cells)

  for (let i = 0; i < c.vibe.length; i++) if (c.vibe[i] !== 0) out[(i / 24) | 0]!++
  for (let i = 0; i < c.store.length; i++) if (c.store[i] !== 0) out[(i / 12) | 0]! += 2

  return out
}

// ---- the lines of one class ----

export type ClassLines = {
  readonly slot: number
  readonly count: number
  readonly length: number
  // per line, its start dock (the lowest dock on it)
  readonly start: Int32Array
  // per dock, the line of this class through it and its position along r_d from the line's start
  readonly line: Int32Array
  readonly position: Int32Array
}

export function classLines(tables: LockedTables, slot: number): ClassLines {
  const cells = tables.cells
  const line = new Int32Array(cells).fill(-1)
  const position = new Int32Array(cells)
  const starts: number[] = []
  let length = -1

  for (let x = 0; x < cells; x++) {
    if ((line[x] as number) >= 0) continue

    const id = starts.length
    let y = x
    let j = 0

    starts.push(x)

    while ((line[y] as number) < 0) {
      line[y] = id
      position[y] = j++
      y = Math.floor((tables.target[y * 24 + slot] as number) / 24)
    }

    if (y !== x) throw new Error(`classLines: the class-${slot} line from dock ${x} does not close on itself`)
    if (length >= 0 && j !== length) throw new Error('classLines: lines of one class have different lengths')
    length = j
  }

  return { slot, count: starts.length, length, start: Int32Array.from(starts), line, position }
}

// the signed position of a dock along its line, in [-length/2, length/2)
export const signedPosition = (lines: ClassLines, x: number): number => {
  const j = lines.position[x] as number

  return j < lines.length / 2 ? j : j - lines.length
}

export type LineDisplacement = {
  // per signed position (index s + length/2), the charge the run adds there, summed over every line
  readonly histogram: Int32Array
  // lines whose added tone is not `tone`
  readonly lineMisses: number
  // slots and stores off the class's dock lines where the run and the vacuum differ
  readonly offClass: number
}

export function lineDisplacement(input: { run: Configuration; vacuum: Configuration; lines: ClassLines; tone: number }): LineDisplacement {
  const { run, vacuum, lines, tone } = input
  const slot = lines.slot
  const other = OPPOSITE[slot] as number
  const classLine = LINE_OF[slot] as number
  const histogram = new Int32Array(lines.length)
  const perLine = new Int32Array(lines.count)
  const half = lines.length / 2
  let offClass = 0

  for (let x = 0; x < lines.line.length; x++) {
    const base = x * 24
    const added = (run.vibe[base + slot] as number) - (vacuum.vibe[base + slot] as number) + (run.vibe[base + other] as number) - (vacuum.vibe[base + other] as number)

    if (added !== 0) {
      histogram[signedPosition(lines, x) + half]! += added
      perLine[lines.line[x] as number]! += added
    }

    for (let d = 0; d < 24; d++) if (d !== slot && d !== other && run.vibe[base + d] !== vacuum.vibe[base + d]) offClass++
    for (let l = 0; l < 12; l++) if (l !== classLine && run.store[x * 12 + l] !== vacuum.store[x * 12 + l]) offClass++
  }

  let lineMisses = 0

  for (const t of perLine) if (t !== tone) lineMisses++

  return { histogram, lineMisses, offClass }
}

// ---- the class average ----

// the share of the 24 roots a husk wave vector m is perpendicular to (those classes never move a plane wave)
export function perpendicularShare(m: readonly number[], roots: readonly (readonly number[])[]): number {
  return roots.filter(r => r.reduce((s, v, a) => s + v * (m[a] ?? 0), 0) === 0).length / roots.length
}

// the husk plane wave of the class average: (1/24) sum_d sum_s p_d(s) e^(-i 2 pi (m . r_d) s / side), p_d(s) the
// normalized one-line distribution of class d (index s + length/2), `lengthOf` the line length
export function classWave(distributions: readonly Float64Array[], roots: readonly (readonly number[])[], m: readonly number[], side: number): [number, number] {
  let re = 0
  let im = 0

  distributions.forEach((p, d) => {
    const k = roots[d]!.reduce((s, v, a) => s + v * (m[a] ?? 0), 0)
    const half = p.length / 2

    for (let i = 0; i < p.length; i++) {
      const angle = (2 * Math.PI * k * (i - half)) / side

      re += (p[i] as number) * Math.cos(angle)
      im -= (p[i] as number) * Math.sin(angle)
    }
  })

  return [re / distributions.length, im / distributions.length]
}

export type PacketMoments = {
  // the 3 x 3 husk second-moment tensor, row by row
  readonly second: number[]
  // along a unit husk direction n: <(n . x)^2>, <(n . x)^4>, and the kurtosis ratio <(n . x)^4> / (3 <(n . x)^2>^2)
  readonly along: (n: readonly number[]) => { m2: number; m4: number; kurtosis: number }
}

// the husk moments of a packet made of the classes `use` (default all 24), each weighted equally, from their one-line
// distributions; a displacement s along class d is s r_d, read on the husk (the first three coordinates)
export function packetMoments(distributions: readonly Float64Array[], roots: readonly (readonly number[])[], use?: readonly number[]): PacketMoments {
  const classes = use ?? distributions.map((_, d) => d)
  const moment = (d: number, power: number): number => {
    const p = distributions[d]!
    const half = p.length / 2
    let s = 0

    for (let i = 0; i < p.length; i++) s += (p[i] as number) * (i - half) ** power

    return s
  }
  const m2 = classes.map(d => moment(d, 2))
  const m4 = classes.map(d => moment(d, 4))
  const second: number[] = []

  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) second.push(classes.reduce((s, d, k) => s + (m2[k] as number) * (roots[d]![a] as number) * (roots[d]![b] as number), 0) / classes.length)

  return {
    second,
    along: n => {
      const dot = (d: number): number => roots[d]!.slice(0, 3).reduce((s, v, a) => s + v * (n[a] ?? 0), 0)
      const q2 = classes.reduce((s, d, k) => s + (m2[k] as number) * dot(d) ** 2, 0) / classes.length
      const q4 = classes.reduce((s, d, k) => s + (m4[k] as number) * dot(d) ** 4, 0) / classes.length

      return { m2: q2, m4: q4, kurtosis: q4 / (3 * q2 * q2) }
    },
  }
}

// the mean signed displacement of one class's charge along its line
export function meanDisplacement(p: Float64Array): number {
  const half = p.length / 2
  let s = 0

  for (let i = 0; i < p.length; i++) s += (p[i] as number) * (i - half)

  return s
}
