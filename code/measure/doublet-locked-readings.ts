// Readings of the doublet-locked knit (code/rule/doublet-locked-knit, E-RLT-0097 to E-RLT-0099). MEASUREMENT: the rule
// runs in exact integers; floats appear only in the role vectors, the Wigner weights and the CHSH values read here.
//
// WHAT IS HERE
//  - the coset-union vacuum (code/measure/dense-hub) as a configuration of the locked rule, on a fresh weave under the
//    current link start;
//  - PATHS of the all-open rule: the all-open state is a sum over histories, one term per choice at every like meeting
//    of two vibes with different points (keep, weight 1/4, or exchange, weight 3/4). A path fixes every choice by a key
//    (beat, dock, line) through an integer Weyl rate (silver, 27145 / 2^16), so two runs that meet at the same key make
//    the same choice. Thresholds: 0 (keep always: the old knit's history, the lightest term), 65536 (exchange always:
//    the heaviest single term), 49152 (exchange at the Born rate 3/4). A path is ONE term of the sum, never the state:
//    what a path shows about an occupation-level law that holds on every term holds for the state; a path that departs
//    from the old history shows the state has weight off that history only together with the exact weights of the terms;
//  - the conserved laws of a configuration, the lone wake along a path, and a wall read along paths (code/measure/
//    union-walls readWall, line for line, with the three runs on one path);
//  - the role facts of the lock: the doublet's stabilizer states, the lock's two moving states (the eigenvectors of a Q8
//    element's Weil image on the doublet), their Wigner weights; the line-stabilizer twirls (Schur, anticommutation);
//  - the register CHSH of a two-vibe locked knot, and an id-tracking run of the OLD rule for the old whole's records.
//
// NOTHING MOVES: every reading compares values the stream copied.

import { makeColorWeave, type ColorWeave } from '@/code/rule/color-weave'
import { separatedLayout } from '@/code/rule/living-pair-knit'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { bouncePermutation, BOUNCE_TABLE } from '@/code/rule/bounce-pair-knit'
import { collisionOrder } from '@/code/rule/living-pair-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { cloneConfiguration, collideConfiguration, lockedTables, streamConfiguration, type Configuration, type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'
import { baseHub, storeOfKind } from '@/code/measure/dense-hub'
import { type BeatRecord } from '@/code/rule/fear-weave'
import { type Replay } from '@/code/measure/causal-components'
import { weilLifts, liftOf, phasePointMatrix, displacementMatrix, type GridMatrix } from '@/code/algebra/weil-representation'
import { unitRotations } from '@/code/measure/token-gates'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)
const ROOTS = rootsD4()

// ---- the vacuum on a fresh weave ----

export type LockedFresh = { readonly weave: ColorWeave; readonly tables: LockedTables; readonly store: Int8Array; readonly layout: Int8Array; readonly cells: number; readonly side: number; readonly hub: number[] }

export function lockedFresh(side: number, anchor = 0, links?: Int16Array): LockedFresh {
  const weave = makeColorWeave({ side, table: 'bind' })
  const hub = baseHub(side, anchor)

  return { weave, tables: lockedTables(weave, 'lone', links), store: storeOfKind('union', side, hub), layout: separatedLayout(weave), cells: weave.mesh.cellCount, side, hub }
}

// the vacuum as a configuration: no vibe in a slot, every unit in its store at its layout point; `open` 'all' opens
// every stored pair (the physical rule), 'none' none (the old knit)
export function vacuumConfiguration(f: { cells: number; store: Int8Array; layout: Int8Array }, open: 'all' | 'none', spoint?: Int8Array): Configuration {
  const lines = f.cells * 12

  return {
    vibe: new Int8Array(f.cells * 24),
    point: new Int8Array(f.cells * 24),
    open: new Uint8Array(f.cells * 24),
    store: Int8Array.from(f.store),
    spoint: Int8Array.from(spoint ?? f.layout),
    sopen: new Uint8Array(lines).fill(open === 'all' ? 3 : 0),
  }
}

// ---- paths of the all-open rule ----

export const SILVER_RATE = 27145
export const THRESHOLD_KEEP = 0
export const THRESHOLD_EXCHANGE = 65536
export const THRESHOLD_BORN = 49152

export const exchangeAt = (threshold: number, cells: number, t: number, x: number, l: number): boolean => ((((t * cells + x) * 12 + l) * SILVER_RATE + 12345) % 65536) < threshold

export type PathTally = { likeMeetings: number; equalPoints: number; exchanged: number; unlikeMeetings: number; made: number; unmade: number; vetoed: number }

export const newPathTally = (): PathTally => ({ likeMeetings: 0, equalPoints: 0, exchanged: 0, unlikeMeetings: 0, made: 0, unmade: 0, vetoed: 0 })

// the like meetings at beat t on a configuration (every vibe treated as open), exchanged where the path says so; the
// same set of exchanges undoes itself (the occupation and the set of unequal-point meetings are unchanged by it)
export function pathMeet(tables: LockedTables, c: Configuration, threshold: number, t: number, tally?: PathTally): void {
  for (let x = 0; x < tables.cells; x++) {
    const base = x * 24

    for (let l = 0; l < 12; l++) {
      const i = base + (LINE_FIRSTS[l] as number)
      const j = base + (LINE_SECONDS[l] as number)
      const vi = c.vibe[i] as number
      const vj = c.vibe[j] as number

      if (vi === 0 || vj === 0) continue

      if (vi !== vj) {
        if (tally) tally.unlikeMeetings++
        continue
      }

      if (tally) tally.likeMeetings++

      if (c.point[i] === c.point[j]) {
        if (tally) tally.equalPoints++
        continue
      }

      if (!exchangeAt(threshold, tables.cells, t, x, l)) continue

      const p = c.point[i] as number

      c.point[i] = c.point[j] as number
      c.point[j] = p
      if (tally) tally.exchanged++
    }
  }
}

export type PathRunner = { state: () => Configuration; time: () => number; beat: (tally?: PathTally) => void; back: () => void }

// the stream of a configuration into another, in place (the rule's streamConfiguration, without allocation)
export function streamInto(tables: LockedTables, a: Configuration, b: Configuration): void {
  b.vibe.fill(0)

  for (let slot = 0; slot < a.vibe.length; slot++) {
    const v = a.vibe[slot] as number

    if (v === 0) continue

    const to = tables.target[slot] as number

    b.vibe[to] = v
    b.point[to] = tables.move[slot * 9 + (a.point[slot] as number)] as number
    b.open[to] = a.open[slot] as number
  }

  b.store.set(a.store)
  b.spoint.set(a.spoint)
  b.sopen.set(a.sopen)
}

export function pathRunner(tables: LockedTables, start: Configuration, threshold: number, phase = 0): PathRunner {
  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)
  let t = phase
  const col = { made: 0, unmade: 0, vetoed: 0, likeMeetings: 0, splitMeetings: 0, phaseMeetings: 0, unlikeMeetings: 0, merged: 0 }

  return {
    state: () => a,
    time: () => t,
    beat: (tally?: PathTally) => {
      pathMeet(tables, a, threshold, t, tally)
      col.made = 0
      col.unmade = 0
      col.vetoed = 0
      collideConfiguration(tables, a, t, false, col)

      if (tally) {
        tally.made += col.made
        tally.unmade += col.unmade
        tally.vetoed += col.vetoed
      }

      streamInto(tables, a, b)

      const swap = a

      a = b
      b = swap
      t++
    },
    back: () => {
      t--
      streamConfiguration(tables, a, true)
      collideConfiguration(tables, a, t, true)
      pathMeet(tables, a, threshold, t)
    },
  }
}

// a path as a replay for code/measure/causal-components causalRun (the stream target must be the tables' own)
export function pathReplay(tables: LockedTables, start: Configuration, threshold: number): Replay & { state: () => Configuration } {
  let c = cloneConfiguration(start)

  return {
    cells: tables.cells,
    state: () => c,
    collide(t) {
      pathMeet(tables, c, threshold, t)
      collideConfiguration(tables, c, t, false)
    },
    vibes: () => c.vibe,
    carried: () => undefined,
    stream(target) {
      if (target !== tables.target) {
        for (let i = 0; i < target.length; i++) if (target[i] !== tables.target[i]) throw new Error('a path replays through its own stream only')
      }

      streamConfiguration(tables, c, false)
    },
    snapshot() {
      const out = new Int32Array(c.vibe.length * 2 + c.store.length * 2)

      for (let i = 0; i < c.vibe.length; i++) {
        out[i] = c.vibe[i] as number
        out[c.vibe.length + i] = c.vibe[i] !== 0 ? (c.point[i] as number) : 0
      }

      for (let i = 0; i < c.store.length; i++) {
        out[2 * c.vibe.length + i] = c.store[i] as number
        out[2 * c.vibe.length + c.store.length + i] = c.store[i] !== 0 ? (c.spoint[i] as number) : 0
      }

      return out
    },
  }
}

// ---- conserved laws: charge, count (vibes plus two per stored unit), occupation momentum (4 integers) ----

export function laws(c: Configuration): number[] {
  let charge = 0
  let count = 0
  const p = [0, 0, 0, 0]

  for (let i = 0; i < c.vibe.length; i++) {
    const v = c.vibe[i] as number

    if (v === 0) continue
    charge += v
    count++

    const r = ROOTS[i % 24] as number[]

    for (let k = 0; k < 4; k++) p[k]! += r[k] as number
  }

  for (let i = 0; i < c.store.length; i++) count += c.store[i] !== 0 ? 2 : 0

  return [charge, count, ...p]
}

// the vibe and store trits where two configurations differ (code/measure/living-pair-kernel tritDifference)
export function tritsApart(a: Configuration, b: Configuration): number {
  let n = 0

  for (let i = 0; i < a.vibe.length; i++) n += a.vibe[i] !== b.vibe[i] ? 1 : 0
  for (let i = 0; i < a.store.length; i++) n += a.store[i] !== b.store[i] ? 1 : 0

  return n
}

export function sameOccupation(a: Configuration, b: Configuration): boolean {
  return tritsApart(a, b) === 0
}

// the configuration's point data equal too (vibe, point on held slots, store, spoint on held lines)
export function samePoints(a: Configuration, b: Configuration): boolean {
  for (let i = 0; i < a.vibe.length; i++) if (a.vibe[i] !== b.vibe[i] || (a.vibe[i] !== 0 && a.point[i] !== b.point[i])) return false
  for (let i = 0; i < a.store.length; i++) if (a.store[i] !== b.store[i] || (a.store[i] !== 0 && a.spoint[i] !== b.spoint[i])) return false

  return true
}

// ---- the lone wake along a path (E-RLT-0084's B6, E-RLT-0093's wakeReading, with the path's keyed choices) ----

// the vacuum's path history, one configuration per beat after the stream (a lockstep reference)
export function pathTrack(tables: LockedTables, vacuum: Configuration, threshold: number, beats: number): { states: Configuration[]; tally: PathTally } {
  const v = pathRunner(tables, vacuum, threshold)
  const tally = newPathTally()
  const states: Configuration[] = []

  for (let t = 0; t < beats; t++) {
    v.beat(tally)
    states.push(cloneConfiguration(v.state()))
  }

  return { states, tally }
}

export function pathWake(input: { tables: LockedTables; vacuum: Configuration; track: readonly Configuration[]; seedSlot: number; tone: number; threshold: number; beats: number }): { worst: number[]; offLine: number } {
  const { tables, vacuum, track, seedSlot, tone, threshold, beats } = input
  const start = cloneConfiguration(vacuum)

  start.vibe[seedSlot] = tone
  start.open[seedSlot] = 1

  const s = pathRunner(tables, start, threshold)
  const line = LINE_OF[seedSlot % 24] as number
  const worst = [0, 0, 0, 0]
  let offLine = 0

  for (let t = 0; t < beats; t++) {
    s.beat()

    const a = s.state()
    const b = track[t] as Configuration
    const trits = tritsApart(a, b)
    const period = Math.floor(t / 24)

    worst[period] = Math.max(worst[period] ?? 0, trits)

    for (let i = 0; i < a.vibe.length; i++) if (a.vibe[i] !== b.vibe[i] && LINE_OF[i % 24] !== line) offLine++
    for (let i = 0; i < a.store.length; i++) if (a.store[i] !== b.store[i] && i % 12 !== line) offLine++
  }

  return { worst, offLine }
}

// ---- a wall along paths (code/measure/union-walls readWall, line for line, the three runs on one path) ----

export type PathWallReading = { readonly windows: number; readonly endDocks: number; readonly departing: number[]; readonly outside: number[]; readonly outsideColumns: number[]; readonly grew: number[]; readonly frozen: boolean; readonly passes: boolean }

export function readPathWall(input: {
  tables: LockedTables
  layout: Int8Array
  store: Int8Array
  image: Int8Array
  inside: Uint8Array
  column: Int32Array
  columns: number
  from: number
  to: number
  window: number
  threshold: number
}): PathWallReading {
  const { tables, layout, store, image, inside, column, columns, from, to, window, threshold } = input
  const cells = tables.cells
  const planted = Int8Array.from(store)

  for (let x = 0; x < cells; x++) if (inside[x]) planted.set(image.subarray(x * 12, x * 12 + 12), x * 12)

  const f = { cells, layout }
  const P = pathRunner(tables, vacuumConfiguration({ ...f, store: planted }, 'all'), threshold)
  const A = pathRunner(tables, vacuumConfiguration({ ...f, store }, 'all'), threshold)
  const B = pathRunner(tables, vacuumConfiguration({ ...f, store: image }, 'all'), threshold)
  const end = new Uint8Array(cells)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24; d++) {
      const y = ((tables.target[x * 24 + d] as number) / 24) | 0

      if (inside[x] !== inside[y]) {
        end[x] = 1
        end[y] = 1
      }
    }
  }

  const notOwn = new Uint8Array(cells)
  const out = { departing: [] as number[], outside: [] as number[], outsideColumns: [] as number[], grew: [] as number[] }
  let previous: Uint8Array | undefined
  let frozen = true
  let windows = 0
  const scratch = new Uint8Array(columns)

  for (let t = 0; t < to; t++) {
    if (t >= from) {
      if ((t - from) % window === 0) notOwn.fill(0)

      const p = P.state()
      const a = A.state()
      const b = B.state()

      for (let x = 0; x < cells; x++) {
        if (notOwn[x]) continue

        const own = inside[x] ? b : a
        let d = 0

        for (let k = 0; k < 24 && !d; k++) if (p.vibe[x * 24 + k] !== own.vibe[x * 24 + k]) d = 1
        for (let l = 0; l < 12 && !d; l++) if (p.store[x * 12 + l] !== own.store[x * 12 + l]) d = 1

        notOwn[x] = d
      }

      if ((t - from) % window === window - 1) {
        windows++

        let n = 0
        let outside = 0
        let grew = 0

        scratch.fill(0)

        for (let x = 0; x < cells; x++) {
          if (!notOwn[x]) continue

          n++
          if (!end[x]) {
            outside++
            scratch[column[x] as number] = 1
          }
          if (previous && !previous[x]) grew++
        }

        if (previous) for (let x = 0; x < cells && frozen; x++) frozen = previous[x] === notOwn[x]

        out.departing.push(n)
        out.outside.push(outside)
        out.outsideColumns.push(scratch.reduce((s, v) => s + v, 0))
        if (previous) out.grew.push(grew)
        previous = Uint8Array.from(notOwn)
      }
    }

    P.beat()
    A.beat()
    B.beat()
  }

  let endCount = 0

  for (let x = 0; x < cells; x++) endCount += end[x] as number

  return { windows, endDocks: endCount, ...out, frozen, passes: out.outside.every(v => v === 0) && out.grew.every(v => v === 0) }
}

// ---- the role facts of the lock (measurement: floats) ----

export type RoleVector = { re: number[]; im: number[] }

const applyMatrix = (m: { re: Float64Array; im: Float64Array }, v: RoleVector): RoleVector => {
  const re = [0, 0, 0]
  const im = [0, 0, 0]

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      re[i]! += (m.re[i * 3 + j] ?? 0) * (v.re[j] as number) - (m.im[i * 3 + j] ?? 0) * (v.im[j] as number)
      im[i]! += (m.re[i * 3 + j] ?? 0) * (v.im[j] as number) + (m.im[i * 3 + j] ?? 0) * (v.re[j] as number)
    }
  }

  return { re, im }
}

export const overlap = (a: RoleVector, b: RoleVector): [number, number] => {
  let re = 0
  let im = 0

  for (let i = 0; i < 3; i++) {
    re += (a.re[i] as number) * (b.re[i] as number) + (a.im[i] as number) * (b.im[i] as number)
    im += (a.re[i] as number) * (b.im[i] as number) - (a.im[i] as number) * (b.re[i] as number)
  }

  return [re, im]
}

// W(a, b) = <v| A(a, b) |v> / 3 at phase index 3 a + b
export function wignerOf(v: RoleVector): number[] {
  const out: number[] = []

  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) out.push(overlap(v, applyMatrix(phasePointMatrix(3, a, b), v))[0] / 3)

  return out
}

const SCALAR: RoleVector = { re: [0, Math.SQRT1_2, -Math.SQRT1_2], im: [0, 0, 0] }
const DOUBLET_0: RoleVector = { re: [1, 0, 0], im: [0, 0, 0] }
const DOUBLET_1: RoleVector = { re: [0, Math.SQRT1_2, Math.SQRT1_2], im: [0, 0, 0] }

export const scalarLine = (): RoleVector => SCALAR

// the qutrit's 12 stabilizer states (the Clifford orbit of |0>), and those inside the parity-even doublet
export function stabilizerStates(): { all: RoleVector[]; doublet: RoleVector[] } {
  const lift = weilLifts(3)[0]!
  const zero: RoleVector = { re: [1, 0, 0], im: [0, 0, 0] }
  const all: RoleVector[] = []

  for (const e of lift.elements) {
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        const v = applyMatrix(displacementMatrix(3, a, b), applyMatrix(e.unitary, zero))

        if (!all.some(s => Math.hypot(...overlap(s, v)) > 1 - 1e-9)) all.push(v)
      }
    }
  }

  return { all, doublet: all.filter(s => Math.hypot(...overlap(SCALAR, s)) < 1e-9) }
}

// the order-4 elements of SL(2, 3) (the six of Q8 other than +-1)
export function orderFourGrids(): GridMatrix[] {
  const out: GridMatrix[] = []

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      for (let c = 0; c < 3; c++) {
        for (let d = 0; d < 3; d++) {
          if ((a * d - b * c + 9) % 3 !== 1) continue

          const m2 = [(a * a + b * c) % 3, (a * b + b * d) % 3, (c * a + d * c) % 3, (c * b + d * d) % 3]

          if (m2[0] === 2 && m2[1] === 0 && m2[2] === 0 && m2[3] === 2) out.push([a, b, c, d])
        }
      }
    }
  }

  return out
}

// the eigenvectors of a Q8 element's Weil image on the doublet: the lock's two moving states for the husk axis that
// element keeps (E-SPN-0081's generator is proportional to it on the doublet), with the image's leak off the doublet
export function lockStates(grid: GridMatrix): { plus: RoleVector; minus: RoleVector; leak: number } {
  const lift = weilLifts(3)[0]!
  const u = liftOf(lift, grid)!
  const cols = [applyMatrix(u, DOUBLET_0), applyMatrix(u, DOUBLET_1)]
  const leak = Math.max(Math.hypot(...overlap(SCALAR, cols[0]!)), Math.hypot(...overlap(SCALAR, cols[1]!)))
  const p = overlap(DOUBLET_0, cols[0]!)
  const q = overlap(DOUBLET_0, cols[1]!)
  const r = overlap(DOUBLET_1, cols[0]!)
  const s = overlap(DOUBLET_1, cols[1]!)
  const cm = (x: [number, number], y: [number, number]): [number, number] => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
  const tr: [number, number] = [p[0] + s[0], p[1] + s[1]]
  const det: [number, number] = [cm(p, s)[0] - cm(q, r)[0], cm(p, s)[1] - cm(q, r)[1]]
  const disc: [number, number] = [cm(tr, tr)[0] - 4 * det[0], cm(tr, tr)[1] - 4 * det[1]]
  const mod = Math.hypot(...disc)
  const arg = Math.atan2(disc[1], disc[0])
  const root: [number, number] = [Math.sqrt(mod) * Math.cos(arg / 2), Math.sqrt(mod) * Math.sin(arg / 2)]
  const vectorFor = (lam: [number, number]): RoleVector => {
    let x: [number, number] = q
    let y: [number, number] = [lam[0] - p[0], lam[1] - p[1]]

    if (Math.hypot(...x) + Math.hypot(...y) < 1e-9) {
      x = [lam[0] - s[0], lam[1] - s[1]]
      y = r
    }

    const v: RoleVector = {
      re: [0, 1, 2].map(i => x[0] * (DOUBLET_0.re[i] as number) + y[0] * (DOUBLET_1.re[i] as number)),
      im: [0, 1, 2].map(i => x[1] * (DOUBLET_0.re[i] as number) + y[1] * (DOUBLET_1.re[i] as number)),
    }
    const n = Math.sqrt(overlap(v, v)[0])

    return { re: v.re.map(t => t / n), im: v.im.map(t => t / n) }
  }
  const lams: [number, number][] = [
    [(tr[0] + root[0]) / 2, (tr[1] + root[1]) / 2],
    [(tr[0] - root[0]) / 2, (tr[1] - root[1]) / 2],
  ]
  const [first, second] = lams[0]![1] >= lams[1]![1] ? [lams[0]!, lams[1]!] : [lams[1]!, lams[0]!]

  return { plus: vectorFor(first), minus: vectorFor(second), leak }
}

// the line-stabilizer twirl of E-SPN-0081 H7 (the units keeping a husk axis, sign -1 where they reverse it), on the
// role as doublet (+) scalar, applied to a 3 x 3 operator; the doublet block of the image of every basis operator
type M3 = { re: Float64Array; im: Float64Array }

function roleRho(spin: readonly (readonly [number, number])[]): M3 {
  const m: M3 = { re: new Float64Array(9), im: new Float64Array(9) }

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      m.re[i * 3 + j] = spin[i * 2 + j]![0]
      m.im[i * 3 + j] = spin[i * 2 + j]![1]
    }
  }

  m.re[8] = 1

  return m
}

function mulM(a: M3, b: M3): M3 {
  const re = new Float64Array(9)
  const im = new Float64Array(9)

  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 3; k++) {
      for (let j = 0; j < 3; j++) {
        re[i * 3 + j] = re[i * 3 + j]! + a.re[i * 3 + k]! * b.re[k * 3 + j]! - a.im[i * 3 + k]! * b.im[k * 3 + j]!
        im[i * 3 + j] = im[i * 3 + j]! + a.re[i * 3 + k]! * b.im[k * 3 + j]! + a.im[i * 3 + k]! * b.re[k * 3 + j]!
      }
    }
  }

  return { re, im }
}

function daggerM(a: M3): M3 {
  const re = new Float64Array(9)
  const im = new Float64Array(9)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      re[i * 3 + j] = a.re[j * 3 + i]!
      im[i * 3 + j] = -a.im[j * 3 + i]!
    }
  }

  return { re, im }
}

// signed: the stream's twirl (sign -1 on units reversing the axis); unsigned: a coin's (commuting with every unit)
export function axisTwirl(axis: number, signed: boolean, x: M3): M3 {
  const units = unitRotations().filter(u => Math.abs(Math.abs(u.rotation.matrix[3 * axis + axis]!) - 1) < 1e-9)
  const out: M3 = { re: new Float64Array(9), im: new Float64Array(9) }

  for (const { rotation } of units) {
    const r = roleRho(rotation.spin as unknown as readonly (readonly [number, number])[])
    const s = signed ? rotation.matrix[3 * axis + axis]! : 1
    const moved = mulM(mulM(r, x), daggerM(r))

    for (let i = 0; i < 9; i++) {
      out.re[i] = out.re[i]! + (s * moved.re[i]!) / units.length
      out.im[i] = out.im[i]! + (s * moved.im[i]!) / units.length
    }
  }

  return out
}

export const basisOperator = (entry: number, imaginary: boolean): M3 => {
  const m: M3 = { re: new Float64Array(9), im: new Float64Array(9) }

  ;(imaginary ? m.im : m.re)[entry] = 1

  return m
}

// the stream generator of a husk axis: the twirl image of the doublet's (0, 0) entry (a nonzero image when the lock
// exists), scaled to unit Frobenius norm
export function axisGenerator(axis: number): M3 {
  let best: M3 | undefined
  let bestNorm = 0

  for (let e = 0; e < 9; e++) {
    for (const imaginary of [false, true]) {
      const y = axisTwirl(axis, true, basisOperator(e, imaginary))
      const n = y.re.reduce((s, v) => s + v * v, 0) + y.im.reduce((s, v) => s + v * v, 0)

      if (n > bestNorm) {
        bestNorm = n
        best = y
      }
    }
  }

  const scale = 1 / Math.sqrt(bestNorm)

  return { re: best!.re.map(v => v * scale), im: best!.im.map(v => v * scale) }
}

export const multiply3 = mulM

// ---- the register CHSH of a two-vibe locked knot ----

// the Hermitian eigenvalues of M M^dagger for a complex n x m matrix (rows, columns), through the real symmetric
// 2n x 2n form and cyclic Jacobi
export function schmidtWeights(re: number[][], im: number[][]): number[] {
  const n = re.length
  const m = re[0]?.length ?? 0
  const hr: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  const hi: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < m; k++) {
        const ar = re[i]![k]!
        const ai = im[i]![k]!
        const br = re[j]![k]!
        const bi = -im[j]![k]!

        hr[i]![j]! += ar * br - ai * bi
        hi[i]![j]! += ar * bi + ai * br
      }
    }
  }

  const z: number[][] = Array.from({ length: 2 * n }, () => new Array<number>(2 * n).fill(0))

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      z[i]![j] = hr[i]![j]!
      z[i + n]![j + n] = hr[i]![j]!
      z[i]![j + n] = -hi[i]![j]!
      z[i + n]![j] = hi[i]![j]!
    }
  }

  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0

    for (let p = 0; p < 2 * n; p++) for (let q = p + 1; q < 2 * n; q++) off += z[p]![q]! ** 2
    if (off < 1e-30) break

    for (let p = 0; p < 2 * n; p++) {
      for (let q = p + 1; q < 2 * n; q++) {
        const apq = z[p]![q]!

        if (Math.abs(apq) < 1e-300) continue

        const theta = (z[q]![q]! - z[p]![p]!) / (2 * apq)
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const s = t * c

        for (let k = 0; k < 2 * n; k++) {
          const kp = z[k]![p]!
          const kq = z[k]![q]!

          z[k]![p] = c * kp - s * kq
          z[k]![q] = s * kp + c * kq
        }

        for (let k = 0; k < 2 * n; k++) {
          const pk = z[p]![k]!
          const qk = z[q]![k]!

          z[p]![k] = c * pk - s * qk
          z[q]![k] = s * pk + c * qk
        }
      }
    }
  }

  // every eigenvalue of the real form comes twice
  const values = z.map((row, i) => row[i]!).sort((a, b) => b - a)

  return values.filter((_, i) => i % 2 === 0)
}

// the pairing bound on CHSH of a pure bipartite state from its Schmidt weights: the two largest in one qubit block,
// 2 sqrt(1 + 4 l1 l2 / (l1 + l2)^2) (l1 + l2), the next two in another, a lone one adding 2 l; exact for two weights
export function chshFromWeights(weights: readonly number[]): number {
  const w = [...weights].filter(x => x > 1e-15).sort((a, b) => b - a)
  let total = 0

  for (let i = 0; i < w.length; i += 2) {
    const a = w[i] as number
    const b = w[i + 1] ?? 0
    const s = a + b

    total += b > 0 ? 2 * s * Math.sqrt(1 + (4 * a * b) / (s * s)) : 2 * a
  }

  return total
}

// the two-vibe knot of a locked state across two slots: every branch must hold the same occupation; the registers are
// the points on the two slots; returns the Schmidt weights and the CHSH bound, or undefined when the occupations differ
export function registerKnot(s: LockedState, slotA: number, slotB: number): { weights: number[]; chsh: number; branches: number } | undefined {
  const first = s.branches[0]

  if (!first) return undefined
  for (const b of s.branches) if (!sameOccupation(b, first)) return undefined

  const re: number[][] = Array.from({ length: 9 }, () => new Array<number>(9).fill(0))
  const im: number[][] = Array.from({ length: 9 }, () => new Array<number>(9).fill(0))
  const half = Math.sqrt(3) / 2

  for (const b of s.branches) {
    const x = Number(b.a)
    const y = Number(b.b)
    const d = 2 ** b.k
    // (a + b w) / 2^k with w = -1/2 + i sqrt(3)/2
    const ar = (x - y / 2) / d
    const ai = (y * half) / d
    const pa = b.point[slotA] as number
    const pb = b.point[slotB] as number

    re[pa]![pb]! += ar
    im[pa]![pb]! += ai
  }

  const weights = schmidtWeights(re, im)
  const total = weights.reduce((u, v) => u + v, 0)
  const normalized = weights.map(v => v / total)

  return { weights: normalized.filter(v => v > 1e-15), chsh: chshFromWeights(normalized), branches: s.branches.length }
}

// ---- an id-tracking run of the OLD rule (no meetings), for the old whole's records ----

export type IdRun = { state: () => Configuration; ids: () => Int32Array; beat: () => BeatRecord }

// the old knit on a configuration, with a token name riding with each vibe (sid: two per line for a stored pair),
// recording the meetings of two named vibes (before the collision) and each named vibe's link crossing, as fear-weave's
// BeatRecord; `named` gives the starting names of the stored pairs (line -> [first, second]) that are open
export function idRun(tables: LockedTables, weave: ColorWeave, start: Configuration, named: ReadonlyMap<number, readonly [number, number]>): IdRun {
  let c = cloneConfiguration(start)
  let id = new Int32Array(c.vibe.length).fill(-1)
  const sid = new Int32Array(c.store.length * 2).fill(-1)
  let t = 0

  for (const [line, [a, b]] of named) {
    sid[2 * line] = a
    sid[2 * line + 1] = b
  }

  const PERM2 = new Int32Array(24)
  const SI = new Int32Array(24)
  const SV2 = new Int8Array(24)
  const SP2 = new Int8Array(24)

  return {
    state: () => c,
    ids: () => id,
    beat: () => {
      const meetings: [number, number][] = []
      const signs: [number, number][] = []
      const crossings: [number, number][] = []

      for (let x = 0; x < tables.cells; x++) {
        for (let l = 0; l < 12; l++) {
          const i = x * 24 + (LINE_FIRSTS[l] as number)
          const j = x * 24 + (LINE_SECONDS[l] as number)

          if (c.vibe[i] === 0 || c.vibe[j] === 0 || (id[i] as number) < 0 || (id[j] as number) < 0) continue
          meetings.push([id[i] as number, id[j] as number])
          signs.push([c.vibe[i] as number, c.vibe[j] as number])
        }
      }

      for (let x = 0; x < tables.cells; x++) {
        for (const piece of collisionOrder('alternate', t)) {
          if (piece === 'P') {
            for (let l = 0; l < 12; l++) {
              const i = x * 24 + (LINE_FIRSTS[l] as number)
              const j = x * 24 + (LINE_SECONDS[l] as number)
              const a = c.vibe[i] as number
              const b = c.vibe[j] as number
              const line = x * 12 + l
              const tau = c.store[line] as number

              if (tau === 0) {
                if (a === 0 || b !== -a) continue
                if (tables.veto && c.point[i] !== c.point[j]) continue
                c.vibe[i] = 0
                c.vibe[j] = 0
                c.store[line] = a
                c.spoint[line] = c.point[i] as number
                sid[2 * line] = id[i] as number
                sid[2 * line + 1] = id[j] as number
                id[i] = -1
                id[j] = -1
              } else if (a === 0 && b === 0) {
                const p = c.spoint[line] as number

                c.vibe[i] = tau
                c.vibe[j] = -tau
                c.point[i] = p
                c.point[j] = p
                id[i] = sid[2 * line] as number
                id[j] = sid[2 * line + 1] as number
                sid[2 * line] = -1
                sid[2 * line + 1] = -1
                c.store[line] = 0
              }
            }
          } else {
            const base = x * 24
            const kind = bouncePermutation(BOUNCE_TABLE, tables.collision, c.vibe, base, PERM2)

            if (kind === 0) continue

            for (let d = 0; d < 24; d++) {
              const to = PERM2[d] as number

              SV2[to] = c.vibe[base + d] as number
              SP2[to] = c.point[base + d] as number
              SI[to] = id[base + d] as number
            }

            for (let d = 0; d < 24; d++) {
              c.vibe[base + d] = SV2[d] as number
              c.point[base + d] = SP2[d] as number
              id[base + d] = SI[d] as number
            }
          }
        }
      }

      const next = new Int32Array(id.length).fill(-1)

      for (let slot = 0; slot < id.length; slot++) {
        if (c.vibe[slot] === 0) continue
        next[tables.target[slot] as number] = id[slot] as number
        if ((id[slot] as number) >= 0) crossings.push([id[slot] as number, weave.links[slot] ?? weave.moves.identity])
      }

      id = next
      c = cloneConfiguration(c)
      streamConfiguration(tables, c, false)
      t++

      return { meetings, crossings, signs }
    },
  }
}
