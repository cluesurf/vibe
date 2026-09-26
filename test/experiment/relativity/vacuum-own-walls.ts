// Walls measured against the hub vacuum's OWN ideal, the redefined wall gate (E-RLT-0090).
//
// THE DECISION (user, 2026-09-26). The wall gate of E-FRC-0159's battery (E-RLT-0082 wallsQuantized, E-RLT-0087 W)
// compared a half-late vacuum with the uniformly born one and asked for whole sheets of side^3 docks: the ideal of a
// UNIFORM vacuum. The oriented hub vacuum has built-in dock-to-dock structure that is not a wall, and it is cold and
// still in the sense that a dock's history repeats every 6 beats. New rule: compute the ideal wall pattern FOR THIS
// VACUUM, from its own symmetry, and measure how far the actual pattern departs from it.
//
// THE CLOSED RULE (code/measure/coset-walls, written before any run of this file). Gamma is the rule's symmetry:
// W(F4) about a dock, the translations, charge conjugation C and time shifts by the schedule's period (2 beats). The
// GROUND MANIFOLD is M = Gamma V, the orbit of the vacuum's trit history. A dock's history is its 36 trits over one
// aligned window of W = 6 beats (the vacuum period); S(x) is the set of ground states whose history at x equals the
// run's. A dock with S(x) empty is a DEFECT; an edge (one per line, 12 per dock) is a WALL when both ends are explained
// and no one ground state explains both. A difference a symmetry of the vacuum explains is one ground state at both
// ends, so it is never a wall. The IDEAL of a domain assignment D (dock -> ground state) is the reading of the history
// in which every dock holds its own ground state: it is computed from M and D alone, never from the run it grades.
// The DEPARTURE of a run is the docks x with D(x) not in S(x) plus the symmetric difference of its wall edges and the
// ideal's, over the denominators (docks, 12 edges per dock).
//
// THE HUB VACUUM'S M, derived and then counted (tmp/wall90-probe1, disclosed). The oriented store is kept by a point
// group of 576 elements (E-RLT-0080: 2T and one more element, no C) and by the 4 D4 translations and nothing smaller,
// and no time shift by 2 or 4 beats is a spatial symmetry of it. So Gamma / Sigma has |W(F4)| 2 3 [D4 : 4 D4] / 576 =
// 1,152 x 2 x 3 x 256 / 576 = 3,072 ground states on any box of side divisible by 4: 4 spatial point cosets (the
// identity, C, the index-2 coset of the 576 group, and that coset with C) times 3 time phases times 256 translations.
// The late-born vacuum of the old gate is one of them: it equals the vacuum 2 beats AHEAD, the time coset s = 2.
// A uniform vacuum (every dock the same history) has every ground state translation-invariant, so S(x) depends only on
// x's history, two docks share a ground state exactly when their histories agree, and the new walls ARE the uniform
// walls: the rule reduces to the old reading there (control P2). A still, empty vacuum (the cold quaternion knits of
// E-RLT-0054, 0056, 0057) is fixed by every element of Gamma: M has ONE element, no domain can differ from another,
// and gate B is not evaluable there, by construction.
//
// SETUP. The lone bounce knit L (code/rule/bounce-pair-knit 'lone', its kernel code/measure/bounce-pair-kernel), the
// oriented hub vacuum anchored so dock 0 stores line 0 (E-RLT-0087's convention). M is computed from the vacuum run on a
// SIDE-8 box restricted to the side-4 period cell; every graded run is on a SIDE-12 box (sheet 1,728, E-RLT-0087's),
// settled windows beats 72 to 191 (20 windows of 6). Each of E-MTH-0028's 17 link starts builds its own weave, layout,
// kernels and M. Six domain cases, each a slab of the six layers with first coordinate >= 6 against the vacuum:
//   time      the half-late vacuum of the old gate (the slab born one beat late = the time coset s = 2)
//   C, g, gC  the three nontrivial spatial point cosets, planted as the slab's store replaced by its image
//   r0, 2r0   the slab's store translated by the root r_0 and by 2 r_0 (hub lattice moved, and hubs onto hubs)
//
// Gates, fixed before the first run of this file:
//  A  on every start, the hub vacuum run alone on side 12 reads 0 defects, 0 walls and 0 docks outside the vacuum's
//     own ground state (the M of the side-8 run, so this is a real test of the side-12 run) at every settled window, while
//     the old uniform reading of the same run reads more than 0 (the built-in structure the old gate counted)
//  P1 (default start) for each of the six cases, the reader on the ideal patchwork reads exactly the wall computed by
//     the independent brute-force path (every rep, every translation, no bitsets), the same edge set, 0 defects, and
//     more than 0 walls; a stabilizer element's image of the store equals the store (0 units differ); one flipped trit
//     in the vacuum reads at least 1 defect or wall. If the coset walls read 0 or equal a stabilizer's, the controls do
//     not separate and the gate is uninformative
//  P2 (default start) on the uniform one-line vacuum, the vacuum alone reads 0 walls under both readers, and on its
//     half-late ideal patchwork the new wall edges equal the uniform reading's edge for edge, the docks outside the
//     reference ground state are exactly the docks the old ideal difference touches, and that count is whole sheets
//  B  on every start, for all six cases, the departure is 0 at every settled window (the walls match the ideal)
//  C  on every start, for all six cases, at every settled window no dock 3 or more roots from the interface departs
//     from its domain's ground state (the wall is bounded and the vacuum does not melt; denominator: those docks)
// Verdict: partial if A, P1 or P2 fails (the instrument); otherwise pass if B and C hold on all 17 starts, fail if B
// fails on all 17, partial otherwise.
//
// Reported, not gated: E-RLT-0087's old reading beside each (the trits the half-late run differs from the uniformly
// born one, whole sheets or not), the old uniform wall count of every run, the K and B collisions on the time case
// (default start), the one-line vacuum's own runs, and M's counts per start.
//
// PREDICTED before the first run (from E-RLT-0087: under L the half-late interface's strays never die, 39,000 to
// 42,000 excitation trits on 68 to 79 percent of docks): A, P1, P2 hold; B and C FAIL on the time case on every start;
// the spatial cases are not predicted beyond "an interface whose stores break condition (Z) makes strays".
//
// DISCLOSED: two probes before this file (tmp/wall90-probe1, tmp/wall90-probe2): the vacuum periods (6), U(t) = V(t + 2),
// M's counts (3,072 on the hub vacuum, 72 on the one-line vacuum), that the rule realizes the three spatial cosets
// (0 mismatching beats of 60, side 8), and the reader's controls on the default start (the six patchwork walls 20,736,
// 1,620, 2,592, 1,188, 1,404 and 12,960 equal to the brute force edge for edge; the vacuum alone 0 walls against 248,832
// uniform ones). No run of a walled state was made before this file.
//
// FIRST RUN (168 s): fail, recorded as is, no gate moved; title written after the run. A, P1 and P2 hold on every
// start (the controls separate: coset patchworks 1,188 to 20,736 walls equal to the brute force edge for edge, a
// stabilizer image 0 units different, one flipped trit 1 defect; the one-line vacuum reduces exactly to the uniform
// reading, 20,736 walls both ways and 6 whole sheets). B fails on all 17 starts and C on all 17, for two different
// reasons. (1) The four spatial cosets that keep the hub LATTICE (C, g, gC, translation 2 r0) form a FROZEN wall at
// exactly the ideal place: 432 docks (2 interfaces x 216) depart, every one at distance 1, none in the bulk, the same
// number at all 20 windows and on all 17 starts; they read as DEFECTS (0 wall edges), because a dock that sees both
// domains holds neither history. So the departure equals the ideal wall edges replaced by their end docks: the wall is
// one dock thick and does not move, but it is not an edge between two ground states, which is what B as written
// demands. (2) The time coset (the old half-late wall) and the translation r0 (hubs moved onto units) melt the box:
// 16,847 to 16,848 and 20,567 to 20,647 departing docks of 20,736, the bulk 5,616 and about 6,870 of 6,912. K and B
// collisions read the same on the time case. The old reading of the time case: 39,158 to 44,615 trits, not whole
// sheets. The cold still vacuum has 1 ground state: B is not evaluable there.
// SECOND RUN: the same code with three REPORTED metrics added after the first run started (link slots and layout
// points differing per start, distinct departure series, the cell docks the vacuum never touches, the last from
// E-RLT-0089's note on the 64 husk columns no vacuum pair streams through); every gate number compared identical.
// The starts vary (16 of 16 non-default members differ on 495,316 to 497,664 of 497,664 link slots and 42,410 to
// 45,531 layout points; 3 distinct time-case departure series), and 48 of the 256 cell docks (the three norm-4 classes
// of D4 / 2 D4, 16 each) are never touched by the vacuum: they carry no coset and never witness a wall. That is a count
// of BULK docks per period cell, not E-RLT-0089's count of husk columns, which is a different projection.
//
// Depth L2. DETERMINISM: fixed starts (E-MTH-0028's family), fixed slabs, exact trit comparisons, no draw.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { makeColorWeave } from '@/code/rule/color-weave'
import { separatedLayout } from '@/code/rule/living-pair-knit'
import { type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { bounceRunner, collideBounce, makeBounceKernel, type BounceKernel } from '@/code/measure/bounce-pair-kernel'
import { cloneReduced, type Reduced } from '@/code/measure/living-pair-kernel'
import { d4BoxCell, d4BoxCoordinates, d4Coordinates } from '@/code/substrate/d4-box'
import { coinData, orientedHubStore, uniformStore, type CoinData } from '@/code/measure/varying-vacuum'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { startFamily, withStart } from '@/code/measure/start-ensemble'
import {
  boxGeometry,
  bruteForceWalls,
  cell4,
  dockTypes,
  edgeDifference,
  frameOf,
  groundManifold,
  idealTypes,
  imageTypes,
  readCase,
  readWindow,
  restrictToCell,
  stateId,
  storeImage,
  translationsBetween,
  TypeBook,
  type BoxGeometry,
  type CaseReading,
  type Cell4,
  type Frame,
  type GroundManifold,
} from '@/code/measure/coset-walls'

const SIDE = 12
const SMALL = 8
const W = 6
const FROM = 72
const TO = 192
const R0 = d4Coordinates(rootsD4()[LINE_FIRSTS[0] as number] as number[])
const CASES = ['time', 'C', 'g', 'gC', 'r0', '2r0'] as const

type CaseName = (typeof CASES)[number]
type Machine = { kernel: BounceKernel; layout: Int8Array; box: BoxGeometry; links: Int16Array }

const hubOf = (side: number): number[] => d4BoxCoordinates({ cell: 0, side }).map((v, k) => v - (R0[k] as number))
const cellOfVector = (v: readonly number[]): number => d4BoxCell({ coordinates: v.map(x => ((x % 4) + 4) % 4), side: 4 })

function machine(side: number, kind: CollisionKind): Machine {
  const weave = makeColorWeave({ side, table: 'bind' })
  const kernel = makeBounceKernel(weave, kind)

  return { kernel, layout: separatedLayout(weave), box: boxGeometry(side, kernel.target), links: Int16Array.from(weave.links) }
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

// the frames of beats from .. from + W - 1 only (a side-12 run keeps no more than one window)
function windowFrames(mc: Machine, store: Int8Array, from: number): Frame[] {
  const run = bounceRunner(mc.kernel, emptyState(mc, store))
  const out: Frame[] = []

  while (run.time() < from + W) {
    if (run.time() >= from) out.push(frameOf(run.state()))

    run.beat()
  }

  return out
}

// the least period of a frame list from beat `from` (0 if none up to 24)
function periodOf(h: readonly Frame[], from: number): number {
  const same = (a: Frame, b: Frame): boolean => a.vibe.every((v, i) => v === b.vibe[i]) && a.store.every((v, i) => v === b.store[i])

  for (let p = 1; p <= 24; p++) {
    let ok = true

    for (let t = from; t + p < h.length && ok; t++) ok = same(h[t] as Frame, h[t + p] as Frame)

    if (ok) return p
  }

  return 0
}

// the half-late start: beat 0's collision on the early docks only, streamed; run from phase 1 (E-RLT-0082's walls)
function halfLate(mc: Machine, store: Int8Array, late: (x: number) => boolean): ReturnType<typeof bounceRunner> {
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

// the uniformly born vacuum brought to beat 1 (the old gate's reference)
function uniformFromOne(mc: Machine, store: Int8Array): ReturnType<typeof bounceRunner> {
  const run = bounceRunner(mc.kernel, emptyState(mc, store))

  run.beat()

  return run
}

type Manifold = { m: GroundManifold; periodV: number; lateIsAhead2: boolean; timeRep: { rep: number; tau: number }; emptyCellDocks: number }

// M from the side-8 vacuum restricted to the cell; the late-born vacuum (V two beats ahead) is the second base
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
  // is the late-born vacuum V two beats ahead (checked on the side-8 run itself)
  const U = halfLate(mc8, store8, () => true)
  let lateIsAhead2 = true

  while (U.time() < 60) {
    const t = U.time()
    const v = h[t + 2] as Frame
    const u = U.state()

    lateIsAhead2 = lateIsAhead2 && v.vibe.every((x, i) => x === u.vibe[i]) && v.store.every((x, i) => x === u.store[i])
    U.beat()
  }

  // the cell docks the vacuum never touches (no vibe and no store in the window): they carry no coset information
  const zero = book.lookup(new Int8Array(W * 36))
  const emptyCellDocks = tV.reduce((n, k) => n + (k === zero ? 1 : 0), 0)

  return { m, periodV, lateIsAhead2, timeRep: m.baseRep[1] as { rep: number; tau: number }, emptyCellDocks }
}

type Planted = { name: CaseName; rep: number; tau: number; store?: Int8Array }

// the six cases' inside ground states and (for the spatial ones) the planted store on the side-12 box
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

function runCase(man: Manifold, mc: Machine, store12: Int8Array, c: Planted, inside: (x: number) => boolean, withOld: boolean): CaseReading {
  const rep = Int32Array.from({ length: mc.box.cells }, (_, x) => (inside(x) ? c.rep : 0))
  const tau = Int32Array.from({ length: mc.box.cells }, (_, x) => (inside(x) ? c.tau : 0))

  if (c.name === 'time') {
    return readCase({ m: man.m, box: mc.box, run: halfLate(mc, store12, inside), rep, tau, from: FROM, to: TO, reference: withOld ? uniformFromOne(mc, store12) : undefined })
  }

  return readCase({ m: man.m, box: mc.box, run: bounceRunner(mc.kernel, emptyState(mc, c.store as Int8Array)), rep, tau, from: FROM, to: TO })
}

type MemberResult = {
  name: string
  states: number
  reps: number
  pointStabilizer: number
  periodV: number
  lateIsAhead2: boolean
  aDefects: number
  aWalls: number
  aUniform: number
  cases: Record<CaseName, CaseReading>
  emptyCellDocks: number
  linksDiffer: number
  layoutDiffers: number
}

export default experiment({
  id: 'relativity/vacuum-own-walls',
  code: 'E-RLT-0090',
  title:
    "walls measured against the hub vacuum's own ideal, the coset wall gate, fail on all 17 starts: the vacuum's ground manifold is exact (3,072 ground states, 12 point cosets of the 576-element stabilizer times 256 translations; the old half-late vacuum is the vacuum two beats ahead), the vacuum alone reads 0 walls where the uniform ideal reads 248,832, the reader equals an independent brute force on six planted coset domains and reduces exactly to the old reading on a uniform vacuum; but no run matches its ideal: the four cosets that keep the hub lattice (C, g, gC, 2 r0) freeze into a one-dock-thick wall exactly at the ideal place (432 defect docks, none in the bulk, the same at every window and start), while the time coset (the old wall) and the r0 translation melt the box (16,848 and about 20,600 of 20,736 docks depart)",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const coins = coinData(groupTable())
    const cell = cell4(coins)
    const members = startFamily(16)
    const results: MemberResult[] = []
    const late = (box: BoxGeometry): ((x: number) => boolean) => {
      const layer = Int32Array.from({ length: box.cells }, (_, x) => d4BoxCoordinates({ cell: x, side: box.side })[0] ?? 0)

      return x => (layer[x] as number) >= Math.ceil(box.side / 2)
    }
    let p1 = false
    let p2 = false
    // E-RLT-0089's warning: a cached weave reads one start 17 times. Each member builds its own weave here; these
    // count, per member, the side-12 link slots and layout points that differ from the committed start's
    let defaultLinks: Int16Array | undefined
    let defaultLayout: Int8Array | undefined
    const extra: Record<string, number> = {}
    const text: string[] = []

    for (const member of members) {
      withStart(member, () => {
        const mc8 = machine(SMALL, 'lone')
        const mc = machine(SIDE, 'lone')
        const man = manifoldOf(coins, cell, orientedHubStore(coins, SMALL, hubOf(SMALL)), mc8)
        const store12 = orientedHubStore(coins, SIDE, hubOf(SIDE))
        const inside = late(mc.box)
        // A: the vacuum alone, every settled window (one domain, the vacuum itself)
        const zeros = new Int32Array(mc.box.cells)
        const alone = readCase({ m: man.m, box: mc.box, run: bounceRunner(mc.kernel, emptyState(mc, store12)), rep: zeros, tau: zeros, from: FROM, to: TO })
        const aDefects = alone.defects.reduce((s, x) => s + x, 0)
        const aWalls = alone.actualWalls.reduce((s, x) => s + x, 0) + alone.departureDocks.reduce((s, x) => s + x, 0)
        const aUniform = Math.min(...alone.uniformWalls)

        const planted = plantedCases(coins, man, store12, inside)
        const cases = Object.fromEntries(planted.map(c => [c.name, runCase(man, mc, store12, c, inside, true)])) as Record<CaseName, CaseReading>

        results.push({
          name: member.name,
          states: man.m.states,
          reps: man.m.reps.length,
          pointStabilizer: man.m.pointStabilizer[0] as number,
          periodV: man.periodV,
          lateIsAhead2: man.lateIsAhead2,
          aDefects,
          aWalls,
          aUniform,
          cases,
          emptyCellDocks: man.emptyCellDocks,
          linksDiffer: defaultLinks ? mc.links.reduce((n, v, i) => n + (v !== defaultLinks![i] ? 1 : 0), 0) : 0,
          layoutDiffers: defaultLayout ? mc.layout.reduce((n, v, i) => n + (v !== defaultLayout![i] ? 1 : 0), 0) : 0,
        })

        defaultLinks ??= mc.links
        defaultLayout ??= mc.layout

        if (member.name !== 'integer+0') return

        // P1: the reader against the brute force on each ideal patchwork, a stabilizer element, one flipped trit
        const p1Parts: string[] = []
        let p1ok = true

        for (const c of planted) {
          const rep = Int32Array.from({ length: mc.box.cells }, (_, x) => (inside(x) ? c.rep : 0))
          const tau = Int32Array.from({ length: mc.box.cells }, (_, x) => (inside(x) ? c.tau : 0))
          const types = idealTypes(man.m, mc.box, rep, tau)
          const r = readWindow(man.m, mc.box, types)
          const b = bruteForceWalls(man.m, mc.box, types)
          const differ = edgeDifference(r.wallEdges, b.edges)

          p1ok = p1ok && r.walls === b.walls && differ === 0 && r.defects === 0 && b.defects === 0 && r.walls > 0
          p1Parts.push(`${c.name} ${r.walls} (brute ${b.walls}, edge sets differ ${differ}, uniform ${r.uniformWalls})`)
          extra[`P1_${c.name}_walls`] = r.walls
          extra[`P1_${c.name}_bruteWalls`] = b.walls
          extra[`P1_${c.name}_uniformWalls`] = r.uniformWalls
        }

        // a non-identity point element that keeps V (up to a translation): its image of the side-12 store
        const base = man.m.reps[0]!.types
        const cache = new Map<string, number>()
        let stabilizerDiffer = -1
        let stabilizerElement = ''

        for (let g = 0; g < coins.table.permutations.length && stabilizerDiffer < 0; g++) {
          if (g === coins.table.identity) continue

          const img = imageTypes(coins, cell, man.m.book, base, { g, c: 1, s: 0 }, cache)
          const t = translationsBetween(cell, img, base)

          if (t.length === 0) continue

          const image = storeImage(coins, SIDE, store12, g, 1, cell.coords[t[0] as number] as number[])

          stabilizerDiffer = image.reduce((n, v, i) => n + (v !== store12[i] ? 1 : 0), 0)
          stabilizerElement = `g ${g}, translation ${cell.coords[t[0] as number]!.join(' ')}`
        }

        // one flipped trit: the vacuum's window with one vibe of the center dock negated at one beat
        const flipped = windowFrames(mc, store12, FROM)
        const center = d4BoxCell({ coordinates: [6, 6, 6, 6], side: SIDE })
        let flipAt = -1

        for (let d = 0; d < 24 && flipAt < 0; d++) if (flipped[1]!.vibe[center * 24 + d] !== 0) flipAt = d

        if (flipAt < 0) flipAt = 0

        flipped[1]!.vibe[center * 24 + flipAt] = flipped[1]!.vibe[center * 24 + flipAt] === 0 ? 1 : -(flipped[1]!.vibe[center * 24 + flipAt] as number)

        const flip = readWindow(man.m, mc.box, dockTypes(man.m.book, flipped, mc.box.cells, false))

        p1 = p1ok && stabilizerDiffer === 0 && flip.defects + flip.walls > 0
        extra.P1_stabilizerUnitsDiffer = stabilizerDiffer
        extra.P1_flipDefects = flip.defects
        extra.P1_flipWalls = flip.walls
        text.push(`P1 (default start): ${p1Parts.join('; ')}; stabilizer element (${stabilizerElement}) store units differing ${stabilizerDiffer}; one flipped trit reads ${flip.defects} defects and ${flip.walls} walls.`)

        // P2: the uniform one-line vacuum
        const line8 = uniformStore(SMALL ** 4, [0])
        const line12 = uniformStore(mc.box.cells, [0])
        const lineMan = manifoldOf(coins, cell, line8, mc8)
        const lineAlone = readWindow(lineMan.m, mc.box, dockTypes(lineMan.m.book, windowFrames(mc, line12, FROM), mc.box.cells, false))
        const repL = Int32Array.from({ length: mc.box.cells }, (_, x) => (inside(x) ? lineMan.timeRep.rep : 0))
        const tauL = Int32Array.from({ length: mc.box.cells }, (_, x) => (inside(x) ? lineMan.timeRep.tau : 0))
        const lineTypes = idealTypes(lineMan.m, mc.box, repL, tauL)
        const reference = Int32Array.from({ length: mc.box.cells }, () => stateId(lineMan.m, 0, 0))
        const lineIdeal = readWindow(lineMan.m, mc.box, lineTypes, reference)
        const vTypes = idealTypes(lineMan.m, mc.box, new Int32Array(mc.box.cells), new Int32Array(mc.box.cells))
        let outside = 0
        let setsDiffer = 0

        for (let x = 0; x < mc.box.cells; x++) {
          const out = (lineIdeal.holds as Uint8Array)[x] === 0
          const oldTouches = lineTypes[x] !== vTypes[x]

          outside += out ? 1 : 0
          setsDiffer += out !== oldTouches ? 1 : 0
        }

        const newVsUniform = edgeDifference(lineIdeal.wallEdges, lineIdeal.uniformEdges)
        const sheet = SIDE ** 3

        p2 = lineAlone.walls === 0 && lineAlone.uniformWalls === 0 && lineAlone.defects === 0 && newVsUniform === 0 && setsDiffer === 0 && outside % sheet === 0 && outside > 0
        extra.P2_lineStates = lineMan.m.states
        extra.P2_lineAloneWalls = lineAlone.walls
        extra.P2_lineAloneUniformWalls = lineAlone.uniformWalls
        extra.P2_idealWalls = lineIdeal.walls
        extra.P2_idealUniformWalls = lineIdeal.uniformWalls
        extra.P2_edgeSetsDiffer = newVsUniform
        extra.P2_outsideReference = outside
        extra.P2_outsideSetsDiffer = setsDiffer

        // the one-line vacuum's own half-late run, read both ways (reported)
        const lineRun = readCase({ m: lineMan.m, box: mc.box, run: halfLate(mc, line12, inside), rep: repL, tau: tauL, from: FROM, to: TO, reference: uniformFromOne(mc, line12) })

        extra.line_departureMax = Math.max(...lineRun.departureDocks.map((d, i) => d + (lineRun.edgeDifference[i] as number)))
        extra.line_oldTritsMax = Math.max(...lineRun.oldTrits)
        extra.line_oldWholeSheets = lineRun.oldTrits.every(n => n % sheet === 0) ? 1 : 0
        text.push(
          `P2 (default start, one-line vacuum, ${lineMan.m.states} ground states): alone ${lineAlone.walls} walls, ${lineAlone.uniformWalls} uniform; half-late ideal ${lineIdeal.walls} walls against ${lineIdeal.uniformWalls} uniform (edge sets differ ${newVsUniform}), ${outside} docks outside the reference ground state (${outside / sheet} sheets; differ from the old difference's docks on ${setsDiffer}). Its half-late RUN: departure ${range(lineRun.departureDocks)} docks and ${range(lineRun.edgeDifference)} edges, old trits ${range(lineRun.oldTrits)} (whole sheets ${extra.line_oldWholeSheets === 1}).`,
        )

        // the other two collisions on the time case (reported)
        for (const kind of ['isometric', 'bounce'] as CollisionKind[]) {
          const other = machine(SIDE, kind)
          const time = planted[0] as Planted
          const rep = Int32Array.from({ length: other.box.cells }, (_, x) => (inside(x) ? time.rep : 0))
          const tau = Int32Array.from({ length: other.box.cells }, (_, x) => (inside(x) ? time.tau : 0))
          const r = readCase({ m: man.m, box: other.box, run: halfLate(other, store12, inside), rep, tau, from: FROM, to: TO })

          extra[`${kind}_time_departureDocksMax`] = Math.max(...r.departureDocks)
          extra[`${kind}_time_bulkDepartureMax`] = Math.max(...r.bulkDeparture)
          text.push(`${kind === 'isometric' ? 'K' : 'B'} on the time case (default start): departure ${range(r.departureDocks)} docks, ${range(r.edgeDifference)} edges, bulk ${range(r.bulkDeparture)} of ${r.bulkDocks}.`)
        }

        // the still, empty vacuum: one ground state
        const coldBook = new TypeBook(W)
        const cold = groundManifold(coins, cell, coldBook, [new Int32Array(256).fill(coldBook.intern(new Int8Array(W * 36)))], [0, 2, 4])

        extra.coldGroundStates = cold.states
      })
    }

    const gateA = results.every(r => r.aDefects === 0 && r.aWalls === 0 && r.aUniform > 0)
    const departs = (c: CaseReading): number => Math.max(...c.departureDocks.map((d, i) => d + (c.edgeDifference[i] as number)))
    const bOn = results.map(r => CASES.every(n => departs(r.cases[n]) === 0))
    const cOn = results.map(r => CASES.every(n => Math.max(...r.cases[n].bulkDeparture) === 0))
    const gateB = bOn.every(Boolean)
    const gateC = cOn.every(Boolean)
    const status = !(gateA && p1 && p2) ? 'partial' : gateB && gateC ? 'pass' : bOn.every(b => !b) ? 'fail' : 'partial'
    const def = results[0] as MemberResult
    const metrics: Record<string, number> = {
      gateA: gateA ? 1 : 0,
      gateP1: p1 ? 1 : 0,
      gateP2: p2 ? 1 : 0,
      gateB: gateB ? 1 : 0,
      gateC: gateC ? 1 : 0,
      startsB: bOn.filter(Boolean).length,
      startsC: cOn.filter(Boolean).length,
      starts: results.length,
      groundStates: def.states,
      pointCosets: def.reps,
      pointStabilizer: def.pointStabilizer,
      vacuumPeriod: def.periodV,
      lateIsTwoAhead: results.every(r => r.lateIsAhead2) ? 1 : 0,
      aloneUniformWallsMin: Math.min(...results.map(r => r.aUniform)),
      emptyCellDocks: def.emptyCellDocks,
      startsWithOtherLinks: results.filter(r => r.linksDiffer > 0).length,
      linksDifferMin: Math.min(...results.slice(1).map(r => r.linksDiffer)),
      startsWithOtherLayout: results.filter(r => r.layoutDiffers > 0).length,
      distinctTimeDepartures: new Set(results.map(r => r.cases.time.departureDocks.join(','))).size,
      edges: SIDE ** 4 * 12,
      docks: SIDE ** 4,
      ...extra,
    }

    for (const n of CASES) {
      const c = def.cases[n]

      metrics[`${n}_idealWalls`] = c.idealWalls
      metrics[`${n}_departureDocksMax`] = Math.max(...c.departureDocks)
      metrics[`${n}_departureDocksLast`] = c.departureDocks[c.departureDocks.length - 1] as number
      metrics[`${n}_edgeDifferenceMax`] = Math.max(...c.edgeDifference)
      metrics[`${n}_actualWallsMax`] = Math.max(...c.actualWalls)
      metrics[`${n}_defectsMax`] = Math.max(...c.defects)
      metrics[`${n}_bulkDepartureMax`] = Math.max(...c.bulkDeparture)
      metrics[`${n}_bulkDocks`] = c.bulkDocks
      metrics[`${n}_farthest`] = c.farthest
      metrics[`${n}_uniformWallsMax`] = Math.max(...c.uniformWalls)
      metrics[`${n}_departureDocksMaxOverStarts`] = Math.max(...results.map(r => Math.max(...r.cases[n].departureDocks)))
      metrics[`${n}_departureDocksMinOverStarts`] = Math.min(...results.map(r => Math.min(...r.cases[n].departureDocks)))
    }

    metrics.time_oldTritsMin = Math.min(...def.cases.time.oldTrits)
    metrics.time_oldTritsMax = Math.max(...def.cases.time.oldTrits)
    metrics.time_oldWholeSheets = def.cases.time.oldTrits.every(n => n % SIDE ** 3 === 0) ? 1 : 0
    metrics.seconds = (Date.now() - started) / 1000

    const caseText = (r: MemberResult): string =>
      CASES.map(n => {
        const c = r.cases[n]

        return `${n}: ideal ${c.idealWalls} walls; departure ${range(c.departureDocks)} docks and ${range(c.edgeDifference)} edges (walls ${range(c.actualWalls)}, defects ${range(c.defects)}), bulk ${range(c.bulkDeparture)} of ${c.bulkDocks}, farthest ${c.farthest}, uniform walls ${range(c.uniformWalls)}`
      }).join('; ')

    return verdict({
      status,
      claim: `the hub vacuum's own ideal: ${def.states} ground states (${def.reps} point cosets x 256 translations); the vacuum alone reads ${def.aWalls} walls against ${def.aUniform} under the uniform ideal; the walls ${gateB ? 'match' : 'do not match'} the coset ideal (B on ${bOn.filter(Boolean).length} of ${results.length} starts) and ${gateC ? 'stay' : 'do not stay'} within 2 roots of the interface (C on ${cOn.filter(Boolean).length} of ${results.length})`,
      metrics,
      notes: `L2. Gates: A ${gateA}, P1 ${p1}, P2 ${p2}, B ${gateB} (${bOn.filter(Boolean).length} of ${results.length} starts), C ${gateC} (${cOn.filter(Boolean).length} of ${results.length}). Per start (ground states, point stabilizer, period, late = V two ahead, alone defects/walls/uniform): ${results.map(r => `${r.name} ${r.states}/${r.pointStabilizer}/${r.periodV}/${r.lateIsAhead2}/${r.aDefects}/${r.aWalls}/${r.aUniform}`).join(', ')}. The starts really vary (E-RLT-0089's cached-weave warning): link slots differing from the committed start on side 12 per member ${results.map(r => r.linksDiffer).join(', ')}, layout points ${results.map(r => r.layoutDiffers).join(', ')}; distinct time-case departure series ${new Set(results.map(r => r.cases.time.departureDocks.join(','))).size} of ${results.length}. Cell docks the vacuum never touches (no vibe, no store; E-RLT-0089's columns no vacuum pair streams through): ${def.emptyCellDocks} of 256, each explained by every ground state empty there, so it never witnesses a wall and departs only when a stray reaches it. Default start cases, side ${SIDE} (${SIDE ** 4} docks, ${SIDE ** 4 * 12} edges): ${caseText(def)}. Old reading of the time case (trits against the uniformly born run): ${range(def.cases.time.oldTrits)} (whole sheets ${metrics.time_oldWholeSheets === 1}). ${text.join(' ')} Cold still vacuum: ${extra.coldGroundStates} ground state. Departure docks per case over the starts (min..max): ${CASES.map(n => `${n} ${metrics[`${n}_departureDocksMinOverStarts`]}..${metrics[`${n}_departureDocksMaxOverStarts`]}`).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})

function range(xs: readonly number[]): string {
  return xs.length === 0 ? 'none' : `${Math.min(...xs)}..${Math.max(...xs)}`
}
