// Walls with a core, the restated wall gate B' (E-RLT-0092). MEASUREMENT: every count is an exact integer and every
// comparison an exact comparison of trits. No rule code: the runs use code/measure/bounce-pair-kernel unchanged.
//
// THE RESTATEMENT (user, 2026-09-26, made AFTER E-RLT-0090's numbers, disclosed). E-RLT-0090 graded a run against
// its vacuum's own ideal (code/measure/coset-walls) and asked for ZERO departure. The four spatial cosets that keep
// the hub lattice froze into a wall at exactly the ideal place whose boundary docks hold neither side's history. B'
// allows that and nothing else: a wall may have a core, and the core may sit only on the ideal wall's END DOCKS.
//
//   E           the end docks of the ideal's wall edges (both ends of every edge the ideal reads as a wall)
//   departing   the docks x with D(x) not in S(x) (defects included), plus both ends of every edge in the symmetric
//               difference of the run's wall edges and the ideal's
//   B'          at every settled window, departing is a subset of E, and the departing set never grows from one
//               window to the next (departing(w + 1) is a subset of departing(w))
//
// THE HUSK. A husk dock is a column of bulk docks (code/measure/causal-components boxHusk: the bulk dock with vector
// v lies over (v0, v1, v2) mod side). The husk reading of B' is the number of columns holding a departing dock outside
// E, over the side^3 columns. A column holds one exactly when the bulk count is positive, so the husk and bulk
// verdicts agree by construction and only the numbers differ. The coarser husk reading, departing COLUMNS outside
// E's columns, is reported beside.
//
// THE CORE, described. At the last settled window, every dock of E with D(x) not in S(x) is a core dock (a departing
// dock of E that holds its own ground state departs only as the end of a changed edge: it is counted, not described).
// Its history (W beats of
// 24 vibes and 12 stores) is compared trit by trit with the two ground states that meet there: its OWN domain's and
// the OTHER domain's, each read at that dock. A trit is QUIET (both sides agree and the run agrees), NOVEL (both agree,
// the run differs), OWN or OTHER (the sides disagree and the run takes that side's value), or NEITHER (the sides
// disagree and the run takes the third value).
//
// The setup (machine, the half-late start, the ground manifold, the six planted cases) is E-RLT-0090's, copied here
// unchanged because that experiment does not export it (its file is not edited). Each member of the start family
// builds its own weave inside withStart (makeColorWeave, never weaveOf or hubSetup, which cache per side).

import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { makeColorWeave } from '@/code/rule/color-weave'
import { separatedLayout } from '@/code/rule/living-pair-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { bounceRunner, collideBounce, makeBounceKernel, type BounceKernel } from '@/code/measure/bounce-pair-kernel'
import { cloneReduced, type Reduced } from '@/code/measure/living-pair-kernel'
import { d4BoxCell, d4BoxCoordinates, d4Coordinates } from '@/code/substrate/d4-box'
import { orientedHubStore, type CoinData } from '@/code/measure/varying-vacuum'
import { boxHusk } from '@/code/measure/causal-components'
import { withStart, type StartMember } from '@/code/measure/start-ensemble'
import {
  boxGeometry,
  distanceToInterface,
  dockTypes,
  frameOf,
  groundManifold,
  idealTypes,
  readWindow,
  restrictToCell,
  stateId,
  storeImage,
  TypeBook,
  type BoxGeometry,
  type Cell4,
  type Frame,
  type GroundManifold,
  type Reading,
} from '@/code/measure/coset-walls'

export const SIDE = 12
export const SMALL = 8
export const W = 6
export const FROM = 72
export const TO = 192
export const CASES = ['time', 'C', 'g', 'gC', 'r0', '2r0'] as const
export const LATTICE_KEEPING: readonly CaseName[] = ['C', 'g', 'gC', '2r0']

export type CaseName = (typeof CASES)[number]

const R0 = d4Coordinates(rootsD4()[LINE_FIRSTS[0] as number] as number[])

// ---- E-RLT-0090's setup, copied ----

export type Machine = {
  readonly kernel: BounceKernel
  readonly layout: Int8Array
  readonly box: BoxGeometry
  readonly links: Int16Array
  // the husk column of every bulk dock, the number of columns, and the box's step errors (0 on a sound box)
  readonly column: Int32Array
  readonly columns: number
  readonly stepErrors: number
  // every neighbor of a dock: the 12 forward (line l) then the 12 backward
  readonly adjacent: Int32Array
}

const hubOf = (side: number): number[] => d4BoxCoordinates({ cell: 0, side }).map((v, k) => v - (R0[k] as number))
const cellOfVector = (v: readonly number[]): number => d4BoxCell({ coordinates: v.map(x => ((x % 4) + 4) % 4), side: 4 })

export function machine(side: number, kind: CollisionKind): Machine {
  const weave = makeColorWeave({ side, table: 'bind' })
  const kernel = makeBounceKernel(weave, kind)
  const box = boxGeometry(side, kernel.target)
  const husk = boxHusk(weave.mesh, side)
  const adjacent = new Int32Array(box.cells * 24)

  for (let x = 0; x < box.cells; x++) {
    for (let l = 0; l < 12; l++) {
      const y = box.neighbour[x * 12 + l] as number

      adjacent[x * 24 + l] = y
      adjacent[y * 24 + 12 + l] = x
    }
  }

  return { kernel, layout: separatedLayout(weave), box, links: Int16Array.from(weave.links), column: husk.column, columns: husk.columns, stepErrors: husk.stepErrors, adjacent }
}

const emptyState = (mc: Machine, store: Int8Array): Reduced => ({
  vibe: new Int8Array(mc.box.cells * 24),
  point: new Int8Array(mc.box.cells * 24),
  store: Int8Array.from(store),
  spoint: Int8Array.from(mc.layout),
})

function frames(mc: Machine, store: Int8Array, beats: number): Frame[] {
  const run = bounceRunner(mc.kernel, emptyState(mc, store))
  const out: Frame[] = [frameOf(run.state())]

  for (let t = 1; t < beats; t++) {
    run.beat()
    out.push(frameOf(run.state()))
  }

  return out
}

function periodOf(h: readonly Frame[], from: number): number {
  const same = (a: Frame, b: Frame): boolean => a.vibe.every((v, i) => v === b.vibe[i]) && a.store.every((v, i) => v === b.store[i])

  for (let p = 1; p <= 24; p++) {
    let ok = true

    for (let t = from; t + p < h.length && ok; t++) ok = same(h[t] as Frame, h[t + p] as Frame)

    if (ok) return p
  }

  return 0
}

type Runner = ReturnType<typeof bounceRunner>

// the half-late start: beat 0's collision on the early docks only, streamed; run from phase 1 (E-RLT-0082's walls)
function halfLate(mc: Machine, store: Int8Array, late: (x: number) => boolean): Runner {
  const a = emptyState(mc, store)

  for (let x = 0; x < mc.box.cells; x++) if (!late(x)) collideBounce(mc.kernel, a, x, 0)

  const b = cloneReduced(a)

  b.vibe.fill(0)

  for (let slot = 0; slot < a.vibe.length; slot++) {
    const v = a.vibe[slot] as number

    if (v === 0) continue

    b.vibe[mc.kernel.target[slot] as number] = v
    b.point[mc.kernel.target[slot] as number] = (mc.kernel.move[slot] as Int8Array)[a.point[slot] as number] as number
  }

  return bounceRunner(mc.kernel, b, 1)
}

export type Manifold = { m: GroundManifold; periodV: number; lateIsAhead2: boolean; timeRep: { rep: number; tau: number } }

function manifoldOf(coins: CoinData, cell: Cell4, store8: Int8Array, mc8: Machine): Manifold {
  const h = frames(mc8, store8, 72)
  const periodV = periodOf(h, 24)
  const book = new TypeBook(W)
  const early = restrictToCell(h.slice(48, 48 + W), SMALL)
  const late = restrictToCell(h.slice(50, 50 + W), SMALL)

  if (!early.periodic || !late.periodic) throw new Error('the vacuum is not 4 D4 periodic')

  const tV = dockTypes(book, early.frames, 256, true)
  const tU = dockTypes(book, late.frames, 256, true)
  const m = groundManifold(coins, cell, book, [tV, tU], [0, 2, 4])
  const U = halfLate(mc8, store8, () => true)
  let lateIsAhead2 = true

  while (U.time() < 60) {
    const t = U.time()
    const v = h[t + 2] as Frame
    const u = U.state()

    lateIsAhead2 = lateIsAhead2 && v.vibe.every((x, i) => x === u.vibe[i]) && v.store.every((x, i) => x === u.store[i])
    U.beat()
  }

  return { m, periodV, lateIsAhead2, timeRep: m.baseRep[1] as { rep: number; tau: number } }
}

type Planted = { name: CaseName; rep: number; tau: number; store?: Int8Array }

function plantedCases(coins: CoinData, man: Manifold, store12: Int8Array, inside: (x: number) => boolean): Planted[] {
  const { m } = man
  const identity = coins.table.identity
  const spatial = m.reps.map((r, j) => ({ r, j })).filter(({ r, j }) => j > 0 && r.base === 0 && r.element.s === 0)
  const find = (pred: (g: number, c: number) => boolean): number => spatial.find(({ r }) => pred(r.element.g, r.element.c))?.j ?? -1
  const jC = find((g, c) => g === identity && c === -1)
  const jg = find((g, c) => g !== identity && c === 1)
  const jgC = find((g, c) => g !== identity && c === -1)
  const patch = (image: Int8Array): Int8Array => {
    const out = Int8Array.from(store12)

    for (let x = 0; x < store12.length / 12; x++) if (inside(x)) out.set(image.subarray(x * 12, x * 12 + 12), x * 12)

    return out
  }
  const spatialCase = (name: CaseName, j: number): Planted => {
    const e = (m.reps[j] as { element: { g: number; c: number } }).element

    return { name, rep: j, tau: 0, store: patch(storeImage(coins, SIDE, store12, e.g, e.c, [0, 0, 0, 0])) }
  }

  if (jC < 0 || jg < 0 || jgC < 0 || spatial.length !== 3) throw new Error(`expected 3 spatial point cosets, found ${spatial.length}`)

  return [
    { name: 'time', rep: man.timeRep.rep, tau: man.timeRep.tau },
    spatialCase('C', jC),
    spatialCase('g', jg),
    spatialCase('gC', jgC),
    { name: 'r0', rep: 0, tau: cellOfVector(R0), store: patch(storeImage(coins, SIDE, store12, identity, 1, R0)) },
    { name: '2r0', rep: 0, tau: cellOfVector(R0.map(v => 2 * v)), store: patch(storeImage(coins, SIDE, store12, identity, 1, R0.map(v => 2 * v))) },
  ]
}

// ---- B': the departing set, the end docks, the growth ----

// both ends of every edge the reading marks
export function endDocksOf(box: BoxGeometry, edges: Uint8Array): Uint8Array {
  const out = new Uint8Array(box.cells)

  for (let e = 0; e < edges.length; e++) {
    if (edges[e] !== 1) continue

    out[Math.floor(e / 12)] = 1
    out[box.neighbour[e] as number] = 1
  }

  return out
}

// D(x) not in S(x), plus both ends of every edge where the run's walls and the ideal's differ
export function departingOf(box: BoxGeometry, r: Reading, ideal: Reading): Uint8Array {
  const out = new Uint8Array(box.cells)
  const holds = r.holds as Uint8Array

  for (let x = 0; x < box.cells; x++) out[x] = holds[x] === 1 ? 0 : 1

  for (let e = 0; e < r.wallEdges.length; e++) {
    if (r.wallEdges[e] === ideal.wallEdges[e]) continue

    out[Math.floor(e / 12)] = 1
    out[box.neighbour[e] as number] = 1
  }

  return out
}

export type Grade = { outside: number[]; grew: number[]; departing: number[]; passes: boolean }

// B' over a list of windows, each given as its dock types
export function gradeTypes(m: GroundManifold, box: BoxGeometry, assigned: Int32Array, ideal: Reading, end: Uint8Array, windows: readonly Int32Array[]): Grade {
  const out: Grade = { outside: [], grew: [], departing: [], passes: true }
  let previous: Uint8Array | undefined

  for (const types of windows) {
    const dep = departingOf(box, readWindow(m, box, types, assigned), ideal)
    let n = 0
    let outside = 0
    let grew = 0

    for (let x = 0; x < box.cells; x++) {
      if (dep[x] !== 1) continue

      n++
      outside += end[x] === 1 ? 0 : 1
      grew += previous && previous[x] !== 1 ? 1 : 0
    }

    out.departing.push(n)
    out.outside.push(outside)
    if (previous) out.grew.push(grew)
    previous = dep
  }

  out.passes = out.outside.every(v => v === 0) && out.grew.every(v => v === 0)

  return out
}

// the dock types with each marked dock's history made one trit different, to a history no ground state holds
export function plantDefects(book: TypeBook, types: Int32Array, mask: Uint8Array): { types: Int32Array; planted: number; unplantable: number } {
  const out = Int32Array.from(types)
  let planted = 0
  let unplantable = 0

  for (let x = 0; x < types.length; x++) {
    if (mask[x] !== 1) continue

    const content = Int8Array.from(book.contents[types[x] as number] as Int8Array)
    let done = false

    for (let i = 0; i < content.length && !done; i++) {
      const was = content[i] as number

      content[i] = was === 0 ? 1 : -was

      if (book.lookup(content) === -1) done = true
      else content[i] = was
    }

    if (done) {
      out[x] = -1
      planted++
    } else unplantable++
  }

  return { types: out, planted, unplantable }
}

export type Controls = {
  readonly endDocks: number
  readonly clean: Grade
  readonly fullCore: Grade
  readonly oneAway: Grade
  readonly deep: Grade
  readonly thick: Grade
  readonly growing: Grade
  readonly growingFromClean: Grade
  readonly shrinking: Grade
  readonly thickExtra: number
  readonly deepDistance: number
  readonly unplantable: number
  readonly informative: boolean
}

// The controls of B', on one case's ideal patchwork, fixed before the first run: the clean ideal and a full one-dock
// core (every end dock a defect) pass; a defect one dock from the core, a defect deep in a domain and a core two docks
// thick fail; a core that grows between windows fails and one that shrinks passes.
export function controlsOf(m: GroundManifold, mc: Machine, rep: Int32Array, tau: Int32Array): Controls {
  const box = mc.box
  const assigned = Int32Array.from({ length: box.cells }, (_, x) => stateId(m, rep[x] as number, tau[x] as number))
  const types = idealTypes(m, box, rep, tau)
  const ideal = readWindow(m, box, types, assigned)
  const end = endDocksOf(box, ideal.wallEdges)
  const dist = distanceToInterface(box, assigned)
  const ring = new Uint8Array(box.cells)

  for (let x = 0; x < box.cells; x++) {
    if (end[x] !== 1) continue

    for (let k = 0; k < 24; k++) {
      const y = mc.adjacent[x * 24 + k] as number

      if (end[y] !== 1) ring[y] = 1
    }
  }

  const oneAway = new Uint8Array(box.cells)
  const firstRing = ring.indexOf(1)

  if (firstRing >= 0) oneAway[firstRing] = 1

  let deepest = 0

  for (let x = 0; x < box.cells; x++) deepest = Math.max(deepest, dist[x] as number)

  const deep = new Uint8Array(box.cells)
  const deepAt = (() => {
    for (let x = 0; x < box.cells; x++) if ((dist[x] as number) === deepest && end[x] !== 1) return x

    return -1
  })()

  if (deepAt >= 0) deep[deepAt] = 1

  const thick = Uint8Array.from(end, (v, x) => (v === 1 || ring[x] === 1 ? 1 : 0))
  const half = new Uint8Array(box.cells)
  let alternate = 0

  for (let x = 0; x < box.cells; x++) {
    if (end[x] !== 1) continue

    half[x] = alternate % 2 === 0 ? 1 : 0
    alternate++
  }

  const plant = (mask: Uint8Array): { types: Int32Array; unplantable: number } => plantDefects(m.book, types, mask)
  const full = plant(end)
  const halfCore = plant(half)
  const one = plant(oneAway)
  const deepP = plant(deep)
  const thickP = plant(thick)
  const grade = (ws: Int32Array[]): Grade => gradeTypes(m, box, assigned, ideal, end, ws)
  const clean = grade([types, types])
  const fullCore = grade([full.types, full.types])
  const oneG = grade([one.types])
  const deepG = grade([deepP.types])
  const thickG = grade([thickP.types])
  const growing = grade([halfCore.types, full.types])
  // added after the first run (disclosed): a core that grows from nothing (the clean ideal, then the full core). The
  // half-core version above cannot grow where half of E already makes every dock of E depart (r0: every dock of E is
  // the end of an ideal wall edge to a planted dock), so it is kept as a reported reading and no longer gated
  const growingFromClean = grade([types, full.types])
  const shrinking = grade([full.types, halfCore.types])
  const unplantable = full.unplantable + halfCore.unplantable + one.unplantable + deepP.unplantable + thickP.unplantable
  let thickExtra = 0

  for (let x = 0; x < box.cells; x++) thickExtra += ring[x] as number

  const informative =
    clean.passes && fullCore.passes && !oneG.passes && !deepG.passes && !thickG.passes && !growingFromClean.passes && shrinking.passes && firstRing >= 0 && deepAt >= 0 && deepest >= 3 && unplantable === 0

  let endDocks = 0

  for (let x = 0; x < box.cells; x++) endDocks += end[x] as number

  return { endDocks, clean, fullCore, oneAway: oneG, deep: deepG, thick: thickG, growing, growingFromClean, shrinking, thickExtra, deepDistance: deepest, unplantable, informative }
}

// ---- one run graded under B', with its core described ----

export type CoreContent = {
  readonly docks: number
  // core docks in the inside domain and in the outside one
  readonly inside: number
  readonly outside: number
  // husk: the columns holding a core dock, and the most core docks one column holds (its column sum)
  readonly columns: number
  readonly columnMax: number
  readonly trits: number
  readonly quiet: number
  readonly novel: number
  readonly own: number
  readonly other: number
  readonly neither: number
  // per dock: trits differing from its own ground state and from the other one (min and max over the core)
  readonly ownDiffMin: number
  readonly ownDiffMax: number
  readonly otherDiffMin: number
  readonly otherDiffMax: number
  // split by kind: trits differing from own and other among vibes and among stores
  readonly vibeOwnDiff: number
  readonly storeOwnDiff: number
  readonly vibeOtherDiff: number
  readonly storeOtherDiff: number
  // core docks whose stores equal their own ground state's, and whose vibes do
  readonly storeEqualsOwn: number
  readonly vibeEqualsOwn: number
  readonly vibeEqualsOther: number
  // core docks holding no vibe at all over the window
  readonly silent: number
  // distinct core histories, and core docks whose history changed between the first settled window and the last
  readonly histories: number
  readonly changed: number
  // departing docks of E that hold their own ground state (they depart only as ends of a changed edge), and how many
  // of them equal it trit for trit (all of them, by the definition of S)
  readonly edgeOnly: number
  readonly edgeOnlyExact: number
}

export type CoreReading = {
  readonly windows: number
  readonly idealWalls: number
  readonly endDocks: number
  readonly endColumns: number
  readonly bulkDocks: number
  // E-RLT-0090's strict reading, per window: docks with D(x) not in S(x), edge difference, and its C
  readonly strictDocks: number[]
  readonly edgeDifference: number[]
  readonly bulkDeparture: number[]
  // B': the departing docks, those outside E (bulk), the husk columns holding one, and the growth
  readonly departing: number[]
  readonly outside: number[]
  readonly outsideColumns: number[]
  readonly departingColumnsOutsideEnd: number[]
  readonly grew: number[]
  readonly shrank: number[]
  // departing docks 3 or more roots from the interface (C read on the departing set, beside)
  readonly bulkDepartingEdge: number[]
  readonly core: CoreContent
}

type Side = { rep: number; tau: number }

function contentAt(frames: readonly Frame[], x: number, into: Int8Array): void {
  for (let b = 0; b < frames.length; b++) {
    const f = frames[b] as Frame

    for (let d = 0; d < 24; d++) into[b * 36 + d] = f.vibe[x * 24 + d] as number
    for (let l = 0; l < 12; l++) into[b * 36 + 24 + l] = f.store[x * 12 + l] as number
  }
}

export function readCore(input: { m: GroundManifold; mc: Machine; run: Runner; inside: Uint8Array; outer: Side; inner: Side; from: number; to: number }): CoreReading {
  const { m, mc, run, inside, outer, inner, from, to } = input
  const box = mc.box
  const rep = Int32Array.from({ length: box.cells }, (_, x) => (inside[x] === 1 ? inner.rep : outer.rep))
  const tau = Int32Array.from({ length: box.cells }, (_, x) => (inside[x] === 1 ? inner.tau : outer.tau))
  const assigned = Int32Array.from({ length: box.cells }, (_, x) => stateId(m, rep[x] as number, tau[x] as number))
  const ownTypes = idealTypes(m, box, rep, tau)
  const otherTypes = idealTypes(
    m,
    box,
    Int32Array.from({ length: box.cells }, (_, x) => (inside[x] === 1 ? outer.rep : inner.rep)),
    Int32Array.from({ length: box.cells }, (_, x) => (inside[x] === 1 ? outer.tau : inner.tau)),
  )
  const ideal = readWindow(m, box, ownTypes, assigned)
  const end = endDocksOf(box, ideal.wallEdges)
  const dist = distanceToInterface(box, assigned)
  const isBulk = (x: number): boolean => (dist[x] as number) === -1 || (dist[x] as number) >= 3
  const endColumn = new Uint8Array(mc.columns)
  let endDocks = 0
  let bulkDocks = 0

  for (let x = 0; x < box.cells; x++) {
    bulkDocks += isBulk(x) ? 1 : 0

    if (end[x] !== 1) continue

    endDocks++
    endColumn[mc.column[x] as number] = 1
  }

  const series = {
    strictDocks: [] as number[],
    edgeDifference: [] as number[],
    bulkDeparture: [] as number[],
    departing: [] as number[],
    outside: [] as number[],
    outsideColumns: [] as number[],
    departingColumnsOutsideEnd: [] as number[],
    grew: [] as number[],
    shrank: [] as number[],
    bulkDepartingEdge: [] as number[],
  }
  const scratchA = new Uint8Array(mc.columns)
  const scratchB = new Uint8Array(mc.columns)
  let window: Frame[] = []
  let first: Frame[] | undefined
  let last: Frame[] = []
  let previous: Uint8Array | undefined
  let dep = new Uint8Array(box.cells)
  let lastHolds = new Uint8Array(box.cells)

  if (from % W !== 0) throw new Error('windows must start at a multiple of W')

  while (run.time() < to) {
    if (run.time() >= from) {
      window.push(frameOf(run.state()))

      if (window.length === W) {
        const r = readWindow(m, box, dockTypes(m.book, window, box.cells, false), assigned)

        dep = departingOf(box, r, ideal)
        scratchA.fill(0)
        scratchB.fill(0)

        let strict = 0
        let bulkC = 0
        let n = 0
        let outside = 0
        let grew = 0
        let shrank = 0
        let bulkEdge = 0

        for (let x = 0; x < box.cells; x++) {
          const holds = (r.holds as Uint8Array)[x] === 1

          strict += holds ? 0 : 1
          bulkC += !holds && isBulk(x) ? 1 : 0

          if (previous && previous[x] === 1 && dep[x] !== 1) shrank++

          if (dep[x] !== 1) continue

          n++
          bulkEdge += isBulk(x) ? 1 : 0
          grew += previous && previous[x] !== 1 ? 1 : 0

          const c = mc.column[x] as number

          if (end[x] !== 1) {
            outside++
            scratchA[c] = 1
          }

          if (endColumn[c] !== 1) scratchB[c] = 1
        }

        let edgeDiff = 0

        for (let e = 0; e < r.wallEdges.length; e++) edgeDiff += r.wallEdges[e] !== ideal.wallEdges[e] ? 1 : 0

        series.strictDocks.push(strict)
        series.edgeDifference.push(edgeDiff)
        series.bulkDeparture.push(bulkC)
        series.departing.push(n)
        series.outside.push(outside)
        series.outsideColumns.push(scratchA.reduce((s, v) => s + v, 0))
        series.departingColumnsOutsideEnd.push(scratchB.reduce((s, v) => s + v, 0))
        series.bulkDepartingEdge.push(bulkEdge)

        if (previous) {
          series.grew.push(grew)
          series.shrank.push(shrank)
        }

        previous = dep
        lastHolds = r.holds as Uint8Array
        first ??= window
        last = window
        window = []
      }
    }

    run.beat()
  }

  // the core at the last settled window
  const len = W * 36
  const runC = new Int8Array(len)
  const firstC = new Int8Array(len)
  const coreBook = new TypeBook(W)
  const coreColumn = new Int32Array(mc.columns)
  const core = {
    docks: 0,
    inside: 0,
    outside: 0,
    trits: 0,
    quiet: 0,
    novel: 0,
    own: 0,
    other: 0,
    neither: 0,
    ownDiffMin: Number.POSITIVE_INFINITY,
    ownDiffMax: 0,
    otherDiffMin: Number.POSITIVE_INFINITY,
    otherDiffMax: 0,
    vibeOwnDiff: 0,
    storeOwnDiff: 0,
    vibeOtherDiff: 0,
    storeOtherDiff: 0,
    storeEqualsOwn: 0,
    vibeEqualsOwn: 0,
    vibeEqualsOther: 0,
    silent: 0,
    changed: 0,
  }

  let edgeOnly = 0
  let edgeOnlyExact = 0

  for (let x = 0; x < box.cells; x++) {
    if (dep[x] !== 1 || end[x] !== 1) continue

    contentAt(last, x, runC)

    // a dock that departs only as the end of a changed edge holds its own ground state (D(x) in S(x)): counted and
    // checked, not described
    if (lastHolds[x] === 1) {
      const own = m.book.contents[ownTypes[x] as number] as Int8Array
      let same = true

      for (let i = 0; i < len && same; i++) same = runC[i] === own[i]

      edgeOnly++
      edgeOnlyExact += same ? 1 : 0
      continue
    }

    contentAt(first as Frame[], x, firstC)
    coreBook.intern(runC)

    const own = m.book.contents[ownTypes[x] as number] as Int8Array
    const other = m.book.contents[otherTypes[x] as number] as Int8Array
    let ownDiff = 0
    let otherDiff = 0
    let storeOwn = 0
    let vibeOwn = 0
    let vibeOther = 0
    let vibes = 0
    let changed = false

    for (let i = 0; i < len; i++) {
      const v = runC[i] as number
      const a = own[i] as number
      const b = other[i] as number
      const isVibe = i % 36 < 24

      changed = changed || v !== firstC[i]
      vibes += isVibe && v !== 0 ? 1 : 0

      if (a === b) {
        if (v === a) core.quiet++
        else core.novel++
      } else if (v === a) core.own++
      else if (v === b) core.other++
      else core.neither++

      if (v !== a) {
        ownDiff++
        if (isVibe) vibeOwn++
        else storeOwn++
      }

      if (v !== b) {
        otherDiff++
        if (isVibe) vibeOther++
      }
    }

    core.docks++
    core.inside += inside[x] === 1 ? 1 : 0
    core.outside += inside[x] === 1 ? 0 : 1
    core.trits += len
    core.ownDiffMin = Math.min(core.ownDiffMin, ownDiff)
    core.ownDiffMax = Math.max(core.ownDiffMax, ownDiff)
    core.otherDiffMin = Math.min(core.otherDiffMin, otherDiff)
    core.otherDiffMax = Math.max(core.otherDiffMax, otherDiff)
    core.vibeOwnDiff += vibeOwn
    core.storeOwnDiff += storeOwn
    core.vibeOtherDiff += vibeOther
    core.storeOtherDiff += otherDiff - vibeOther
    core.storeEqualsOwn += storeOwn === 0 ? 1 : 0
    core.vibeEqualsOwn += vibeOwn === 0 ? 1 : 0
    core.vibeEqualsOther += vibeOther === 0 ? 1 : 0
    core.silent += vibes === 0 ? 1 : 0
    core.changed += changed ? 1 : 0
    coreColumn[mc.column[x] as number] = (coreColumn[mc.column[x] as number] as number) + 1
  }

  let columns = 0
  let columnMax = 0

  for (let c = 0; c < mc.columns; c++) {
    columns += (coreColumn[c] as number) > 0 ? 1 : 0
    columnMax = Math.max(columnMax, coreColumn[c] as number)
  }

  if (core.docks === 0) {
    core.ownDiffMin = 0
    core.otherDiffMin = 0
  }

  let endColumns = 0

  for (let c = 0; c < mc.columns; c++) endColumns += endColumn[c] as number

  return {
    windows: series.departing.length,
    idealWalls: ideal.walls,
    endDocks,
    endColumns,
    bulkDocks,
    ...series,
    core: { ...core, columns, columnMax, histories: coreBook.size, edgeOnly, edgeOnlyExact },
  }
}

// ---- one member of the start family ----

export type MemberReading = {
  readonly name: string
  readonly states: number
  readonly reps: number
  readonly periodV: number
  readonly lateIsAhead2: boolean
  readonly stepErrors: number
  readonly columns: number
  readonly alone: CoreReading
  readonly cases: Record<CaseName, CoreReading>
  readonly controls?: Record<CaseName, Controls>
  readonly links: Int16Array
  readonly layout: Int8Array
}

export function readMember(coins: CoinData, cell: Cell4, member: StartMember, withControls: boolean, only?: readonly CaseName[]): MemberReading {
  return withStart(member, () => {
    const mc8 = machine(SMALL, 'lone')
    const mc = machine(SIDE, 'lone')
    const man = manifoldOf(coins, cell, orientedHubStore(coins, SMALL, hubOf(SMALL)), mc8)
    const store12 = orientedHubStore(coins, SIDE, hubOf(SIDE))
    const layer = Int32Array.from({ length: mc.box.cells }, (_, x) => d4BoxCoordinates({ cell: x, side: SIDE })[0] ?? 0)
    const isInside = (x: number): boolean => (layer[x] as number) >= Math.ceil(SIDE / 2)
    const inside = Uint8Array.from({ length: mc.box.cells }, (_, x) => (isInside(x) ? 1 : 0))
    const none = new Uint8Array(mc.box.cells)
    const vacuum = { rep: 0, tau: 0 }
    const alone = readCore({ m: man.m, mc, run: bounceRunner(mc.kernel, emptyState(mc, store12)), inside: none, outer: vacuum, inner: vacuum, from: FROM, to: TO })
    const planted = plantedCases(coins, man, store12, isInside).filter(c => !only || only.includes(c.name))
    const cases = {} as Record<CaseName, CoreReading>
    const controls = {} as Record<CaseName, Controls>

    for (const c of planted) {
      const run = c.name === 'time' ? halfLate(mc, store12, isInside) : bounceRunner(mc.kernel, emptyState(mc, c.store as Int8Array))

      cases[c.name] = readCore({ m: man.m, mc, run, inside, outer: vacuum, inner: { rep: c.rep, tau: c.tau }, from: FROM, to: TO })

      if (withControls) {
        const rep = Int32Array.from(inside, v => (v === 1 ? c.rep : 0))
        const tau = Int32Array.from(inside, v => (v === 1 ? c.tau : 0))

        controls[c.name] = controlsOf(man.m, mc, rep, tau)
      }
    }

    return {
      name: member.name,
      states: man.m.states,
      reps: man.m.reps.length,
      periodV: man.periodV,
      lateIsAhead2: man.lateIsAhead2,
      stepErrors: mc.stepErrors,
      columns: mc.columns,
      alone,
      cases,
      controls: withControls ? controls : undefined,
      links: mc.links,
      layout: mc.layout,
    }
  })
}
