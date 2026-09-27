// The cold quaternion knit: the quaternion knit's forced isotropy on a cold vacuum with a kinetic threshold.
//
// E-RLT-0051 built the quaternion knit, the one knit shape left once exact local color and forced rank-2
// isotropy are both asked for: one collision at every dock and beat, commuting with Q8, CPT exact. Its
// vacuum clocks (calm couples make like pairs out of nothing every three beats), and a lone tone breaks that
// clock and dresses without bound (289, 7,219, 68,735, 106,055 at side 9). E-FLD-0032 showed that a COLD
// vacuum, where a pair is made only from kinetic energy two head-on tones bring, cannot dress by
// construction. code/rule/cold-quaternion-knit puts the two together: stores on tones, counters on couples
// (empty in the vacuum), the couple clock paid by first return, the lone-pair exchange with equal stores, and
// a threshold on the four couples of the first Q8 orbit, each paid by a like pair head on on its own payer
// line of the second orbit, two units a tone.
//
// Measured on this one rule (every number exact unless it is a fit):
// 1. STRUCTURE. The Q8-equivariant payer maps (every one), and for each the full collision (tones, stores,
//    counters) against every element of Q8 with its tone twist on 4,000 stream-sampled dock states and 2,000 states
//    built to fire the threshold; the 'plain' sign rule as the control. Then every (W(F4) element keeping the
//    couple partition, tone map +-1) tested as a glide (C g = g C) and as a reversal (C g = g C^-1) on 300
//    states: the glide group, its forced rank-2 spread, CPT at the identity coin map. Beside it the rank-4
//    spread and the dimension of the linear maps on traceless symmetric 2-tensors that commute with Q8
//    (27 by the character count; 1 for SO(4)): Q8 forces rank-2 isotropy and nothing at rank 4, which is
//    where a viscosity lives.
// 2. EXACT LAWS on the side-3 box (dense tones, stores 0 to 4, counters 0 to 3, role points, 48 beats): E, P,
//    P_E, charge, every forced line functional at every dock, no store or counter below zero, no dock whose
//    color content changes, and exact reversal of tones, stores, counters and role points.
// 3. THE MOMENTUM INVARIANTS: the rank of the forced functionals, the lines they freeze one by one, and the
//    rank of the line-momentum changes seen on a dense side-5 run (the free directions).
// 4. THE THRESHOLD: two like tones head on through the center of a side-7 box on every line, both signs,
//    stores (0, 0), (1, 1), (1, 3) below, (2, 2), (2, 5), (3, 3) above; a love and a fear head on at (3, 3).
// 5. THE COLD VACUUM AND DRESSING: the empty box never changes (side 5, 48 beats); a lone love and a lone fear,
//    stores 0 and 5, every direction, at sides 7, 9 and 11 for four periods of 24 beats: the support (slots
//    whose tone or store differs, plus counters that differ) at every beat. Unbounded: the difference engine
//    (code/compute/difference-engine) run on the lone tone's cold collision (stores and counters asserted to
//    stay 0) for 200 beats, every direction and sign, with the reach against sqrt 2 t; and a sparse engine for
//    the whole state (checked against the dense box) on a head-on pair above threshold and on a dense blob of
//    25 docks with stores 0 to 3 for 400 beats, support against energy.
// 6. THE BATTERY of E-FRC-0125, each item as there, for this knit, the committed knit and the combined knit
//    (E-FRC-0159): vacuum period, line components on the vacuum and on a dense background (side 5), worst
//    superposition defect (side 11), walls (side 9), travel (side 13), dressing (above).
// 7. SOUND AND VISCOSITY as E-FLD-0032 measures them (d4Mesh, fill 0.2, every store 0, counters empty): sound
//    at L = 12, 16, 20, 24 (144 beats) with the speed extrapolated to k = 0, along axis 2 and the diagonal;
//    the shear at L = 12, 16, 20, 24 and L = 20 mode 2 (60 beats), and at L = 16 along six orientations, two
//    pairs of which Q8 maps onto each other (found by the run from the group's matrices); the share of the
//    final shear amplitude on the frozen lines; the exchange switched off at L = 16 as the control.
// 8. THE LONG-WAVE RESPONSE, BULK AND HUSK (code/measure/husk-response). The bulk kernel of E-RLT-0045 at side
//    9 over 1, 4 and 16 start times and at side 13 over 1 and 4, for this knit, the hot quaternion knit, the
//    combined knit and the committed knit, and its restriction to each of the 12 husk orientations (the
//    hyperplanes perpendicular to the 24-cell's vertex directions), after the husk's labels were read off the
//    real {3,4,3,4} cusp layer (radius-3 ball): the bulk is the substrate, the husk the physical world.
//
// Gates, fixed before this file ran. A timing probe had shown two shear runs (L = 12 and 16) not decaying
// before the gates were written; the hydrodynamic gates are E-FLD-0032's unchanged.
//  G1 structure: 4 payer maps; with the twisted sign rule 0 equivariance failures for every map, with the
//     plain rule some; the threshold fires in the built states.
//  G2 the glide group is Q8 exactly (8 elements), its rank-2 spread under 1e-12, CPT at the identity coin map.
//  G3 the exact laws, 0 color leaks, exact reversal.
//  G4 the forced functionals have rank 8 and the observed changes span the other 4.
//  G5 no pair below threshold or from a love and a fear; pairs above; energy exact in every threshold run.
//  G6 the cold vacuum still; every lone support 1 at every beat on every box; the unbounded lone tone's
//     support 1 and reach sqrt 2 t at every beat; the sparse engine equal to the dense box; blob support never
//     above its energy.
//  G7 E-FLD-0032's hydrodynamics: every sound run oscillates below streaming; nu constant to 10 percent over
//     L = 12 to 24 with r2 above 0.99 and the exponent within 0.2 of 2; energy exact in every run.
//  G8 isotropy from the symmetry: every Q8-related pair of shear orientations has nu within 10 percent.
//  G9 the bulk response anisotropy at side 9 after 16 starts below the combined knit's and below this knit's
//     own single-start value; the same for the mean husk anisotropy.
//  G10 the battery against the committed knit: line components no more (vacuum and dense), superposition
//     exact, walls quantized and present, travel no less, dressing no more in any period for either sign.
// Verdict: pass if every gate holds; partial if the constructed rule's gates (G1 to G6) hold and some
// physics or battery gate fails; fail otherwise.
//
// Depth L2: a constructed rule, its symmetries and laws checked exactly, its physics measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { d4BoxCell, d4BoxCoordinates, d4BoxDistance, d4BoxMesh, linearMapOf } from '@/code/substrate/d4-box'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { type Collision, turningWeave } from '@/code/rule/collision'
import { COMBINED_DEFAULT, combinedCollision } from '@/code/rule/combined-knit'
import { QUATERNION_COUPLES, forcedFunctionals, quaternionGroup, quaternionKnit, twistOf } from '@/code/rule/quaternion-knit'
import {
  COLD_FIRSTS,
  COLD_LINE_OF,
  COLD_OPPOSITE,
  COUPLE_OF_LINE,
  coldQuaternionBeat,
  coldQuaternionBeatBack,
  coldQuaternionCollide,
  coldQuaternionEnergy,
  coldQuaternionMomenta,
  collideDockCopy,
  emptyColdState,
  makeColdQuaternionKnit,
  makeColdQuaternionLattice,
  payerMaps,
  type ColdQuaternionKnit,
  type ColdQuaternionState,
} from '@/code/rule/cold-quaternion-knit'
import { dockColor } from '@/code/rule/scatter-weave'
import { groupTable, rowBasis } from '@/code/measure/color-isotropy-bound'
import { matrixGroupClosure } from '@/code/measure/glide-group'
import { forcedIsotropySpread, unitSamples } from '@/code/measure/coarse-modes'
import { acceptance, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { clockAmplitude } from '@/code/measure/clock-amplitude'
import { makeDifferenceEngine, ROOT_STEPS } from '@/code/compute/difference-engine'
import { dampedCosineFit, momentumWaveAmplitude, momentumWaveStart, type WaveGeometry } from '@/code/measure/momentum-transport'
import { decayRateFit } from '@/code/measure/shear-mode'
import { linearFit } from '@/code/measure/regression'
import { slopeError } from '@/code/measure/charge-mode'
import { coldResponse, toneResponse, type ResponseReading } from '@/code/measure/husk-response'
import { buildHyperbolicBall, cuspLayer, labelledCoin } from '@/code/substrate/coxeter/label-transport'
import { makeWeyl } from '@/code/tool/weyl'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const GENERIC = [0.31, -0.74, 0.52, 0.29]
const PERIOD = 24
const ROOTS = rootsD4()

// ---------------------------------------------------------------------------------------------------------
// the docks the symmetry checks read: values from the Kronecker stream of code/tool/weyl (no generator,
// no seed; the start picks which equidistributed stream is read). Until 2026-09-26 this was a local
// linear congruential sequence.

function sequence(start: number): () => number {
  const stream = makeWeyl({ start })

  return () => stream.next()
}

type Dock = { vibe: number[]; store: number[]; counter: number[] }

function sampledDock(rand: () => number): Dock {
  const fill = rand()
  const vibe = Array.from({ length: 24 }, () => (rand() < fill ? (rand() < 0.5 ? 1 : -1) : 0))
  const store = vibe.map(v => (v === 0 ? 0 : rand() < 0.5 ? 0 : Math.floor(rand() * 5)))
  const counter = Array.from({ length: 6 }, () => (rand() < 0.5 ? 0 : Math.floor(rand() * 6)))

  return { vibe, store, counter }
}

// a dock built so the threshold can fire: payer lines holding like pairs with stores, couples calm or made
function thresholdDock(rand: () => number, knit: ColdQuaternionKnit): Dock {
  const d = sampledDock(rand)

  knit.payers.forEach((line, c) => {
    if (line < 0) return

    const s = rand() < 0.5 ? 1 : -1
    const first = COLD_FIRSTS[line] ?? 0
    const second = COLD_OPPOSITE[first] ?? 0

    d.vibe[first] = s
    d.vibe[second] = s
    d.store[first] = 1 + Math.floor(rand() * 4)
    d.store[second] = 1 + Math.floor(rand() * 4)

    const [p, m] = QUATERNION_COUPLES[c] ?? [0, 0]
    const slots = [p, m].flatMap(l => [COLD_FIRSTS[l] ?? 0, COLD_OPPOSITE[COLD_FIRSTS[l] ?? 0] ?? 0])

    if (rand() < 0.6) {
      for (const x of slots) {
        d.vibe[x] = 0
        d.store[x] = 0
      }
    }
  })

  return d
}

const same = (x: ArrayLike<number>, y: ArrayLike<number>): boolean => x.length === y.length && Array.from(x).every((v, i) => v === y[i])

// a coin map (root permutation p, tone map tau) on one dock; counters follow the couples when p keeps the
// couple partition
function act(p: readonly number[], tau: number, dock: Dock | { vibe: ArrayLike<number>; store: ArrayLike<number>; counter: ArrayLike<number> }): Dock {
  const vibe = new Array<number>(24).fill(0)
  const store = new Array<number>(24).fill(0)
  const counter = new Array<number>(6).fill(0)

  for (let d = 0; d < 24; d++) {
    vibe[p[d] ?? 0] = tau * (dock.vibe[d] ?? 0)
    store[p[d] ?? 0] = dock.store[d] ?? 0
  }

  QUATERNION_COUPLES.forEach(([line], c) => {
    counter[COUPLE_OF_LINE[COLD_LINE_OF[p[COLD_FIRSTS[line] ?? 0] ?? 0] ?? 0] ?? 0] = dock.counter[c] ?? 0
  })

  return { vibe, store, counter }
}

function keepsCouples(p: readonly number[]): boolean {
  return QUATERNION_COUPLES.every(([a, b]) => {
    const la = COLD_LINE_OF[p[COLD_FIRSTS[a] ?? 0] ?? 0] ?? 0
    const lb = COLD_LINE_OF[p[COLD_FIRSTS[b] ?? 0] ?? 0] ?? 0

    return COUPLE_OF_LINE[la] === COUPLE_OF_LINE[lb]
  })
}

function structure() {
  const maps = payerMaps()
  const group = quaternionGroup()
  const rand = sequence(20260925)
  const perMap = maps.map(payers => {
    const failures = { twisted: 0, plain: 0 }
    let fired = 0

    for (const signRule of ['twisted', 'plain'] as const) {
      const knit = makeColdQuaternionKnit({ payers, signRule })

      for (let n = 0; n < 6000; n++) {
        const d = n < 4000 ? sampledDock(rand) : thresholdDock(rand, knit)
        const out = collideDockCopy(knit, d, true)

        if (signRule === 'twisted' && n >= 4000) {
          const noThreshold = collideDockCopy(makeColdQuaternionKnit({ payers, signRule, threshold: false }), d, true)

          fired += same(noThreshold.vibe, out.vibe) && same(noThreshold.store, out.store) ? 0 : 1
        }

        for (const g of group) {
          const lhs = collideDockCopy(knit, act(g, twistOf(g), d), true)
          const rhs = act(g, twistOf(g), out)

          if (!same(lhs.vibe, rhs.vibe) || !same(lhs.store, rhs.store) || !same(lhs.counter, rhs.counter)) failures[signRule]++
        }
      }
    }

    return { failures, fired }
  })

  // every glide and reversal among the elements that keep the couples
  const table = groupTable()
  const knit = makeColdQuaternionKnit()
  const states = Array.from({ length: 300 }, (_, n) => (n < 200 ? sampledDock(rand) : thresholdDock(rand, knit)))
  const images = states.map(d => collideDockCopy(knit, d, true))
  const glides: { p: number; tau: number }[] = []
  const reversals: { p: number; tau: number }[] = []

  table.permutations.forEach((p, index) => {
    if (!keepsCouples(p)) return

    for (const tau of [1, -1]) {
      const glide = states.every((d, n) => {
        const lhs = collideDockCopy(knit, act(p, tau, d), true)
        const rhs = act(p, tau, images[n] ?? d)

        return same(lhs.vibe, rhs.vibe) && same(lhs.store, rhs.store) && same(lhs.counter, rhs.counter)
      })
      const reversal = states.every(d => {
        const lhs = collideDockCopy(knit, act(p, tau, d), true)
        const rhs = act(p, tau, collideDockCopy(knit, d, false))

        return same(lhs.vibe, rhs.vibe) && same(lhs.store, rhs.store) && same(lhs.counter, rhs.counter)
      })

      if (glide) glides.push({ p: index, tau })
      if (reversal) reversals.push({ p: index, tau })
    }
  })

  const glideMatrices = matrixGroupClosure(glides.map(e => linearMapOf(table.permutations[e.p] ?? []) ?? []))
  const samples = unitSamples(64)
  const spread2 = forcedIsotropySpread({ group: glideMatrices, rank: 2, generic: GENERIC, samples })
  const spread4 = forcedIsotropySpread({ group: glideMatrices, rank: 4, generic: GENERIC, samples })
  // the real commutant of the group on traceless symmetric 2-tensors, by characters: chi(g) =
  // (tr(g)^2 + tr(g^2)) / 2 - 1, dimension = mean of chi^2 (every irreducible piece here is of real type or
  // counted by its real commutant, which the mean of chi^2 gives for real representations)
  const trace = (m: number[][]): number => (m[0]?.[0] ?? 0) + (m[1]?.[1] ?? 0) + (m[2]?.[2] ?? 0) + (m[3]?.[3] ?? 0)
  const square = (m: number[][]): number[][] => m.map((row, i) => row.map((_, j) => row.reduce((s, x, k) => s + x * (m[k]?.[j] ?? 0), 0)))
  const chi = glideMatrices.map(m => (trace(m) ** 2 + trace(square(m))) / 2 - 1)
  const commutant = chi.reduce((s, x) => s + x * x, 0) / Math.max(1, chi.length)
  const cpt = reversals.some(e => e.p === table.identity && e.tau === -1)

  return { maps, perMap, glides, reversals, glideOrder: glideMatrices.length, spread2, spread4, commutant, cpt, table }
}

// ---------------------------------------------------------------------------------------------------------
// 2 and 3. exact laws, local color, the momentum invariants

function lineMomenta(vibe: ArrayLike<number>, base: number): number[] {
  return COLD_FIRSTS.map(d => Math.abs(vibe[base + d] ?? 0) - Math.abs(vibe[base + (COLD_OPPOSITE[d] ?? 0)] ?? 0))
}

function laws(knit: ColdQuaternionKnit) {
  const mesh = d4BoxMesh({ side: 3 })
  const lattice = makeColdQuaternionLattice(mesh, knit)
  const n = mesh.cellCount * 24
  const vibe = Int8Array.from({ length: n }, (_, i) => {
    const u = ((i + 1) * GOLDEN * 1.37) % 1

    return u < 0.3 ? -1 : u < 0.6 ? 0 : 1
  })
  const start: ColdQuaternionState = {
    vibe,
    store: Int32Array.from({ length: n }, (_, i) => (vibe[i] === 0 ? 0 : Math.floor((((i + 7) * GOLDEN * 2.3) % 1) * 5))),
    counter: Int32Array.from({ length: mesh.cellCount * 6 }, (_, i) => Math.floor((((i + 5) * GOLDEN * 3.1) % 1) * 4)),
    role: Int8Array.from({ length: n }, (_, i) => Math.floor(((i + 3) * GOLDEN * 1.37 * 9) % 9)),
  }
  const forms = forcedFunctionals()
  const e0 = coldQuaternionEnergy(start)
  const m0 = coldQuaternionMomenta(start)
  const q0 = vibe.reduce((a, b) => a + b, 0)
  let s = start
  let exact = true
  let leaks = 0
  let formBreaks = 0
  let lowest = 0
  let made = 0

  for (let t = 0; t < 48; t++) {
    const a = { vibe: Int8Array.from(s.vibe), store: Int32Array.from(s.store), counter: Int32Array.from(s.counter), role: Int8Array.from(s.role ?? []), token: undefined }

    for (let x = 0; x < mesh.cellCount; x++) {
      const colorBefore = dockColor(a.vibe, a.role, x)
      const before = lineMomenta(a.vibe, x * 24)

      coldQuaternionCollide(knit, a, x, true)

      const after = lineMomenta(a.vibe, x * 24)

      leaks += dockColor(a.vibe, a.role, x) === colorBefore ? 0 : 1

      for (const row of forms) {
        if (row.reduce((acc, c, l) => acc + c * ((after[l] ?? 0) - (before[l] ?? 0)), 0) !== 0) formBreaks++
      }
    }

    const tones = s.vibe.reduce((c, v) => c + Math.abs(v), 0)

    s = coldQuaternionBeat(lattice, s)
    made += Math.max(0, s.vibe.reduce((c, v) => c + Math.abs(v), 0) - tones)

    const m = coldQuaternionMomenta(s)

    exact =
      exact &&
      coldQuaternionEnergy(s) === e0 &&
      s.vibe.reduce((x, y) => x + y, 0) === q0 &&
      m.p.every((x, k) => x === m0.p[k]) &&
      m.pe.every((x, k) => x === m0.pe[k])
    lowest = Math.min(lowest, ...s.counter, ...s.store)
  }

  for (let t = 47; t >= 0; t--) {
    s = coldQuaternionBeatBack(lattice, s)
  }

  const reverses = same(s.vibe, start.vibe) && same(s.store, start.store) && same(s.counter, start.counter) && same(s.role ?? [], start.role ?? [])

  return { exact, leaks, formBreaks, lowest, made, reverses }
}

function invariants(knit: ColdQuaternionKnit) {
  const forms = forcedFunctionals()
  const rank = rowBasis(forms).length
  const frozen = Array.from({ length: 12 }, (_, l) => l).filter(l => rowBasis([...forms, Array.from({ length: 12 }, (__, k) => (k === l ? 1 : 0))]).length === rank)
  // the changes seen on a dense side-5 run
  const mesh = d4BoxMesh({ side: 5 })
  const lattice = makeColdQuaternionLattice(mesh, knit)
  let s = emptyColdState(mesh)

  for (let i = 0; i < s.vibe.length; i++) {
    const u = ((i + 1) * GOLDEN * 1.37) % 1

    s.vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 1 : 0
    s.store[i] = s.vibe[i] === 0 ? 0 : Math.floor((((i + 11) * GOLDEN * 1.9) % 1) * 3)
  }

  const changes: number[][] = []
  let changed = 0

  for (let t = 0; t < 24; t++) {
    const a = { vibe: Int8Array.from(s.vibe), store: Int32Array.from(s.store), counter: Int32Array.from(s.counter), role: undefined, token: undefined }

    for (let x = 0; x < mesh.cellCount; x++) {
      const before = lineMomenta(a.vibe, x * 24)

      coldQuaternionCollide(knit, a, x, true)

      const after = lineMomenta(a.vibe, x * 24)
      const delta = after.map((v, l) => v - (before[l] ?? 0))

      if (delta.some(v => v !== 0)) {
        changed++

        if (changes.length < 4000) changes.push(delta)
      }
    }

    s = coldQuaternionBeat(lattice, s)
  }

  return { rank, frozen, observedRank: changes.length > 0 ? rowBasis(changes).length : 0, changed }
}

// ---------------------------------------------------------------------------------------------------------
// 4. the threshold

function thresholds(knit: ColdQuaternionKnit) {
  const side = 7
  const mesh = d4BoxMesh({ side })
  const lattice = makeColdQuaternionLattice(mesh, knit)
  const center = d4BoxCell({ coordinates: [3, 3, 3, 3], side })
  const cases = [
    { name: 'like00', signs: [1, 1], stores: [0, 0] },
    { name: 'like11', signs: [1, 1], stores: [1, 1] },
    { name: 'like13', signs: [1, 1], stores: [1, 3] },
    { name: 'like22', signs: [1, 1], stores: [2, 2] },
    { name: 'like25', signs: [1, 1], stores: [2, 5] },
    { name: 'like33', signs: [1, 1], stores: [3, 3] },
    { name: 'loveFear33', signs: [1, -1], stores: [3, 3] },
  ]

  return cases.map(c => {
    let pairs = 0
    let runs = 0
    let energyExact = true
    const lines = new Set<number>()

    for (let l = 0; l < 12; l++) {
      for (const sign of [1, -1]) {
        const d = COLD_FIRSTS[l] ?? 0
        const o = COLD_OPPOSITE[d] ?? 0
        let s = emptyColdState(mesh)

        s.vibe[mesh.neighbour(center, o) * 24 + d] = sign * (c.signs[0] ?? 1)
        s.store[mesh.neighbour(center, o) * 24 + d] = c.stores[0] ?? 0
        s.vibe[mesh.neighbour(center, d) * 24 + o] = sign * (c.signs[1] ?? 1)
        s.store[mesh.neighbour(center, d) * 24 + o] = c.stores[1] ?? 0

        const e0 = coldQuaternionEnergy(s)
        let top = 0

        for (let t = 0; t < 4; t++) {
          s = coldQuaternionBeat(lattice, s)
          top = Math.max(top, s.vibe.reduce((x, v) => x + Math.abs(v), 0))
        }

        runs++

        if (top > 2) {
          pairs++
          lines.add(l)
        }

        energyExact = energyExact && coldQuaternionEnergy(s) === e0
      }
    }

    return { ...c, pairs, runs, energyExact, lines: lines.size }
  })
}

// ---------------------------------------------------------------------------------------------------------
// 5. the cold vacuum, dressing on boxes, and the unbounded lattice

type SparseDock = { coords: number[]; vibe: Int8Array; store: Int32Array; counter: Int32Array }

// the whole cold state on only the docks that differ from the empty vacuum (every slot, store and counter
// zero, the same at every beat since nothing is made from it): on the unbounded lattice (side undefined) or
// on d4BoxMesh's box, wrapping
function sparseRun(input: { knit: ColdQuaternionKnit; side?: number; seed: SparseDock[]; beats: number; watch: (t: number, docks: Map<string, SparseDock>) => void }): void {
  const { knit, side } = input
  const wrap = (x: number): number => (side === undefined ? x : ((x % side) + side) % side)
  const key = (c: readonly number[]): string => c.join(',')
  let docks = new Map(input.seed.map(d => [key(d.coords.map(wrap)), { ...d, coords: d.coords.map(wrap) }]))

  for (let t = 0; t < input.beats; t++) {
    const next = new Map<string, SparseDock>()
    const at = (coords: number[]): SparseDock => {
      const k = key(coords)
      let d = next.get(k)

      if (!d) {
        d = { coords, vibe: new Int8Array(24), store: new Int32Array(24), counter: new Int32Array(6) }
        next.set(k, d)
      }

      return d
    }

    for (const dock of docks.values()) {
      const a = { vibe: dock.vibe, store: dock.store, counter: dock.counter, role: undefined, token: undefined }

      coldQuaternionCollide(knit, a, 0, true)

      if (a.counter.some(x => x !== 0)) at(dock.coords).counter.set(a.counter)

      for (let d = 0; d < 24; d++) {
        if (a.vibe[d] === 0) continue

        const step = ROOT_STEPS[d] ?? [0, 0, 0, 0]
        const target = at(dock.coords.map((x, k) => wrap(x + (step[k] ?? 0))))

        target.vibe[d] = a.vibe[d] ?? 0
        target.store[d] = a.store[d] ?? 0
      }
    }

    docks = next
    input.watch(t + 1, docks)
  }
}

function sparseSupport(docks: Map<string, SparseDock>): { slots: number; docks: number; energy: number } {
  let slots = 0
  let energy = 0

  for (const d of docks.values()) {
    for (let i = 0; i < 24; i++) {
      if (d.vibe[i] !== 0) {
        slots++
        energy += 1 + (d.store[i] ?? 0)
      }
    }

    for (let c = 0; c < 6; c++) {
      slots += d.counter[c] !== 0 ? 1 : 0
      energy += d.counter[c] ?? 0
    }
  }

  return { slots, docks: docks.size, energy }
}

function coldVacuum(knit: ColdQuaternionKnit) {
  const mesh = d4BoxMesh({ side: 5 })
  const lattice = makeColdQuaternionLattice(mesh, knit)
  let s = emptyColdState(mesh)
  let still = true

  for (let t = 0; t < 48; t++) {
    s = coldQuaternionBeat(lattice, s)
    still = still && s.vibe.every(x => x === 0) && s.store.every(x => x === 0) && s.counter.every(x => x === 0)
  }

  return still
}

// the dense box against the sparse engine, on a 25-dock blob at side 7 for 24 beats
function sparseMatchesDense(knit: ColdQuaternionKnit, blob: SparseDock[]): boolean {
  const side = 7
  const mesh = d4BoxMesh({ side })
  const lattice = makeColdQuaternionLattice(mesh, knit)
  let s = emptyColdState(mesh)

  for (const d of blob) {
    const x = d4BoxCell({ coordinates: d.coords, side })

    s.vibe.set(d.vibe, x * 24)
    s.store.set(d.store, x * 24)
    s.counter.set(d.counter, x * 6)
  }

  let ok = true

  sparseRun({
    knit,
    side,
    seed: blob.map(d => ({ coords: [...d.coords], vibe: Int8Array.from(d.vibe), store: Int32Array.from(d.store), counter: Int32Array.from(d.counter) })),
    beats: 24,
    watch: (_, docks) => {
      s = coldQuaternionBeat(lattice, s)

      const dense = { vibe: new Int8Array(s.vibe.length), store: new Int32Array(s.store.length), counter: new Int32Array(s.counter.length) }

      for (const d of docks.values()) {
        const x = d4BoxCell({ coordinates: d.coords, side })

        dense.vibe.set(d.vibe, x * 24)
        dense.store.set(d.store, x * 24)
        dense.counter.set(d.counter, x * 6)
      }

      ok = ok && same(dense.vibe, s.vibe) && same(dense.store, s.store) && same(dense.counter, s.counter)
    },
  })

  return ok
}

function blobSeed(center: readonly number[], salt: number): SparseDock[] {
  const out: SparseDock[] = []
  const offsets = [[0, 0, 0, 0], ...ROOT_STEPS]

  offsets.forEach((step, n) => {
    const vibe = new Int8Array(24)
    const store = new Int32Array(24)

    for (let d = 0; d < 24; d++) {
      const u = ((n * 24 + d + 1) * GOLDEN * salt) % 1

      vibe[d] = u < 0.25 ? -1 : u < 0.5 ? 1 : 0
      store[d] = vibe[d] === 0 ? 0 : Math.floor((((n * 24 + d + 3) * GOLDEN * 1.7) % 1) * 4)
    }

    out.push({ coords: center.map((x, k) => x + (step[k] ?? 0)), vibe, store, counter: new Int32Array(6) })
  })

  return out
}

function dressing(knit: ColdQuaternionKnit) {
  const boxes = [7, 9, 11].map(side => {
    const middle = Math.floor(side / 2)
    const periodLargest = { love: [0, 0, 0, 0], fear: [0, 0, 0, 0] }
    let allOne = true

    for (const tone of [1, -1]) {
      for (const store of [0, 5]) {
        for (let d = 0; d < 24; d++) {
          const vibe = new Int8Array(24)
          const stores = new Int32Array(24)

          vibe[d] = tone
          stores[d] = store

          sparseRun({
            knit,
            side,
            seed: [{ coords: [middle, middle, middle, middle], vibe, store: stores, counter: new Int32Array(6) }],
            beats: 4 * PERIOD,
            watch: (t, docks) => {
              const support = sparseSupport(docks).slots
              const list = tone > 0 ? periodLargest.love : periodLargest.fear
              const p = Math.floor((t - 1) / PERIOD)

              list[p] = Math.max(list[p] ?? 0, support)
              allOne = allOne && support === 1
            },
          })
        }
      }
    }

    return { side, periodLargest, allOne }
  })

  // the difference engine on the lone tone's cold collision: stores and counters asserted to stay 0
  const empty = new Int32Array(24)
  const emptyCounters = new Int32Array(6)
  let assertionHeld = true
  const loneCollision: Collision = (slots, base) => {
    const out = collideDockCopy(knit, { vibe: slots.subarray(base, base + 24), store: empty, counter: emptyCounters }, true)

    if (out.store.some(x => x !== 0) || out.counter.some(x => x !== 0)) assertionHeld = false

    slots.set(out.vibe, base)
  }
  let unboundedSupportOne = true
  let reachExact = true
  let unboundedRuns = 0

  for (const tone of [1, -1]) {
    for (let d = 0; d < 24; d++) {
      const engine = makeDifferenceEngine({ forward: () => loneCollision })
      const state = new Int8Array(24)

      state[d] = tone
      engine.set([0, 0, 0, 0], state)

      for (let t = 1; t <= 200; t++) {
        engine.step()

        const support = engine.support()

        unboundedSupportOne = unboundedSupportOne && support.slots === 1
        reachExact = reachExact && Math.abs(engine.reach([0, 0, 0, 0]) - Math.SQRT2 * t) < 1e-9
      }

      unboundedRuns++
    }
  }

  // above threshold on the unbounded lattice: a like pair head on a payer line with stores 2, arriving
  const payerLine = knit.payers.find(l => l >= 0) ?? 4
  const pd = COLD_FIRSTS[payerLine] ?? 0
  const po = COLD_OPPOSITE[pd] ?? 0
  const pairSeed: SparseDock[] = [
    { coords: (ROOT_STEPS[po] ?? [0, 0, 0, 0]).map(x => x), vibe: Int8Array.from({ length: 24 }, (_, i) => (i === pd ? 1 : 0)), store: Int32Array.from({ length: 24 }, (_, i) => (i === pd ? 2 : 0)), counter: new Int32Array(6) },
    { coords: (ROOT_STEPS[pd] ?? [0, 0, 0, 0]).map(x => x), vibe: Int8Array.from({ length: 24 }, (_, i) => (i === po ? 1 : 0)), store: Int32Array.from({ length: 24 }, (_, i) => (i === po ? 2 : 0)), counter: new Int32Array(6) },
  ]
  const pair = { peakTones: 0, finalTones: 0, supportAboveEnergy: 0, energy: 0 }

  sparseRun({
    knit,
    seed: pairSeed,
    beats: 400,
    watch: (t, docks) => {
      const s = sparseSupport(docks)
      let tones = 0

      for (const d of docks.values()) tones += d.vibe.reduce((c, v) => c + Math.abs(v), 0)

      pair.peakTones = Math.max(pair.peakTones, tones)
      pair.finalTones = tones
      pair.energy = s.energy
      pair.supportAboveEnergy += s.slots > s.energy ? 1 : 0
    },
  })

  const blob = { peakSlots: 0, finalSlots: 0, peakDocks: 0, finalDocks: 0, energy: 0, supportAboveEnergy: 0, energyChanges: 0, slotsAt: [] as number[] }
  let blobEnergy = -1

  sparseRun({
    knit,
    seed: blobSeed([0, 0, 0, 0], 1.37),
    beats: 400,
    watch: (t, docks) => {
      const s = sparseSupport(docks)

      blobEnergy = blobEnergy < 0 ? s.energy : blobEnergy
      blob.energyChanges += s.energy === blobEnergy ? 0 : 1
      blob.peakSlots = Math.max(blob.peakSlots, s.slots)
      blob.peakDocks = Math.max(blob.peakDocks, s.docks)
      blob.finalSlots = s.slots
      blob.finalDocks = s.docks
      blob.energy = s.energy
      blob.supportAboveEnergy += s.slots > s.energy ? 1 : 0

      if ([25, 50, 100, 200, 400].includes(t)) blob.slotsAt.push(s.slots)
    },
  })

  const matches = sparseMatchesDense(knit, blobSeed([3, 3, 3, 3], 2.11))

  return { boxes, assertionHeld, unboundedSupportOne, reachExact, unboundedRuns, pair, blob, matches }
}

// ---------------------------------------------------------------------------------------------------------
// 6. the battery items for the cold knit, each as weave-acceptance computes it for a tone-only knit

function coldBattery(knit: ColdQuaternionKnit) {
  // line components, vacuum and dense (side 5, 24 beats, every direction flipped at the center)
  const components = (dense: boolean): number => {
    const mesh = d4BoxMesh({ side: 5 })
    const lattice = makeColdQuaternionLattice(mesh, knit)
    const center = 2 * (1 + 5 + 25 + 125)
    const background = emptyColdState(mesh)

    if (dense) {
      for (let i = 0; i < background.vibe.length; i++) {
        const u = ((i + 1) * GOLDEN * 1.37) % 1

        background.vibe[i] = u < 0.2 ? -1 : u < 0.8 ? 0 : 1
      }
    }

    const parent = Array.from({ length: 12 }, (_, i) => i)
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x] ?? x)))

    for (let direction = 0; direction < 24; direction++) {
      let a: ColdQuaternionState = { ...background, vibe: Int8Array.from(background.vibe), store: Int32Array.from(background.store), counter: Int32Array.from(background.counter) }
      let b: ColdQuaternionState = { ...a, vibe: Int8Array.from(a.vibe), store: Int32Array.from(a.store), counter: Int32Array.from(a.counter) }
      const slot = center * 24 + direction
      const touched = new Set<number>()

      b.vibe[slot] = b.vibe[slot] === 1 ? -1 : 1

      for (let t = 0; t < PERIOD; t++) {
        a = coldQuaternionBeat(lattice, a)
        b = coldQuaternionBeat(lattice, b)

        for (let i = 0; i < a.vibe.length; i++) {
          if (a.vibe[i] !== b.vibe[i] || a.store[i] !== b.store[i]) touched.add(COLD_LINE_OF[i % 24] ?? 0)
        }
      }

      for (const line of touched) parent[find(line)] = find(COLD_LINE_OF[direction] ?? 0)
    }

    return new Set(Array.from({ length: 12 }, (_, i) => find(i))).size
  }

  // superposition: the clock amplitude of two seeds against the sum of each (side 11, 6 beats)
  const superposition = (): number => {
    const mesh = d4BoxMesh({ side: 11 })
    const lattice = makeColdQuaternionLattice(mesh, knit)
    const seeds = [d4BoxCell({ coordinates: [1, 1, 1, 1], side: 11 }), d4BoxCell({ coordinates: [6, 6, 6, 6], side: 11 })]
    const branch = (cells: number[]): [number, number][] => {
      let vac = emptyColdState(mesh)
      let seeded = emptyColdState(mesh)
      const out: [number, number][] = []

      for (const c of cells) seeded.vibe[c * 24] = 1

      for (let t = 0; t < 6; t++) {
        vac = coldQuaternionBeat(lattice, vac)
        seeded = coldQuaternionBeat(lattice, seeded)

        const x = clockAmplitude({ mesh, data: seeded.vibe })
        const y = clockAmplitude({ mesh, data: vac.vibe })

        out.push([x[0] - y[0], x[1] - y[1]])
      }

      return out
    }
    const a = branch([seeds[0] ?? 0])
    const b = branch([seeds[1] ?? 0])
    const joint = branch(seeds)

    return Math.max(...joint.map((j, t) => Math.hypot(j[0] - (a[t]?.[0] ?? 0) - (b[t]?.[0] ?? 0), j[1] - (a[t]?.[1] ?? 0) - (b[t]?.[1] ?? 0))))
  }

  // walls: docks with first coordinate at least 5 born one beat late (side 9, 8 periods)
  const walls = (): { quantized: boolean; settledMax: number } => {
    const side = 9
    const mesh = d4BoxMesh({ side })
    const lattice = makeColdQuaternionLattice(mesh, knit)
    let staggered = emptyColdState(mesh)
    let uniform = emptyColdState(mesh)
    const wall: number[] = []

    for (let t = 0; t < 8 * PERIOD; t++) {
      if (t < 1) {
        // the early docks collide, the late ones only stream
        const a = { vibe: Int8Array.from(staggered.vibe), store: Int32Array.from(staggered.store), counter: Int32Array.from(staggered.counter), role: undefined, token: undefined }

        for (let x = 0; x < mesh.cellCount; x++) {
          if ((d4BoxCoordinates({ cell: x, side })[0] ?? 0) < 5) coldQuaternionCollide(knit, a, x, true)
        }

        const vibe = new Int8Array(a.vibe.length)
        const store = new Int32Array(a.store.length)

        for (let i = 0; i < vibe.length; i++) {
          vibe[lattice.target[i] ?? 0] = a.vibe[i] ?? 0
          store[lattice.target[i] ?? 0] = a.store[i] ?? 0
        }

        staggered = { vibe, store, counter: a.counter }
      } else {
        staggered = coldQuaternionBeat(lattice, staggered)
      }

      uniform = coldQuaternionBeat(lattice, uniform)

      let diff = 0

      for (let i = 0; i < uniform.vibe.length; i++) diff += uniform.vibe[i] === staggered.vibe[i] ? 0 : 1

      wall.push(diff)
    }

    const settled = wall.slice(3 * PERIOD)

    return { quantized: settled.every(x => x % 9 ** 3 === 0), settledMax: Math.max(...settled) }
  }

  // travel: how far a lone love's disturbance reaches in 6 beats (side 13)
  const travel = (): { travellers: number; meanReach: number } => {
    const side = 13
    const mesh = d4BoxMesh({ side })
    const lattice = makeColdQuaternionLattice(mesh, knit)
    const center = d4BoxCell({ coordinates: [6, 6, 6, 6], side })
    const reaches = Array.from({ length: 24 }, (_, direction) => {
      let s = emptyColdState(mesh)

      s.vibe[center * 24 + direction] = 1

      for (let t = 0; t < 6; t++) s = coldQuaternionBeat(lattice, s)

      let farthest = 0

      for (let x = 0; x < mesh.cellCount; x++) {
        for (let d = 0; d < 24; d++) {
          if (s.vibe[x * 24 + d] !== 0) {
            farthest = Math.max(farthest, d4BoxDistance({ a: x, b: center, side }))
            break
          }
        }
      }

      return farthest
    })

    return { travellers: reaches.filter(r => r >= (Math.SQRT2 * 6) / 2).length, meanReach: reaches.reduce((a, b) => a + b, 0) / reaches.length }
  }

  const wall = walls()
  const moving = travel()

  return {
    vacuumPeriod: 1,
    vacuumComponents: components(false),
    denseComponents: components(true),
    additivityWorst: superposition(),
    wallQuantized: wall.quantized,
    wallMax: wall.settledMax,
    travellers: moving.travellers,
    meanReach: moving.meanReach,
  }
}

// ---------------------------------------------------------------------------------------------------------
// 7. sound and viscosity

const ORIENTATIONS: readonly (readonly [string, WaveGeometry])[] = [
  ['axes01', { momentum: [1, 0, 0, 0], wave: [0, 1, 0, 0] }],
  ['axes23', { momentum: [0, 0, 1, 0], wave: [0, 0, 0, 1] }],
  ['axes12', { momentum: [0, 1, 0, 0], wave: [0, 0, 1, 0] }],
  ['axes30', { momentum: [0, 0, 0, 1], wave: [1, 0, 0, 0] }],
  ['diagonal01', { momentum: [1, 1, 0, 0], wave: [1, -1, 0, 0] }],
  ['diagonal23', { momentum: [0, 0, 1, 1], wave: [0, 0, 1, -1] }],
]

// pairs of orientations one element of the group maps onto the other, up to the sign of each vector
function relatedPairs(group: readonly (readonly (readonly number[])[])[]): [string, string][] {
  const apply = (g: readonly (readonly number[])[], v: readonly number[]): number[] => g.map(row => row.reduce((s, x, k) => s + x * (v[k] ?? 0), 0))
  const parallel = (a: readonly number[], b: readonly number[]): boolean => a.every((x, k) => Math.abs(x - (b[k] ?? 0)) < 1e-9) || a.every((x, k) => Math.abs(x + (b[k] ?? 0)) < 1e-9)
  const out: [string, string][] = []

  ORIENTATIONS.forEach(([a, ga], i) => {
    ORIENTATIONS.forEach(([b, gb], j) => {
      if (j <= i) return

      if (group.some(g => parallel(apply(g, ga.momentum), gb.momentum) && parallel(apply(g, ga.wave), gb.wave))) out.push([a, b])
    })
  })

  return out
}

function wave(knit: ColdQuaternionKnit, side: number, geometry: WaveGeometry, beats: number, mode = 1) {
  const mesh = d4Mesh({ side })
  const lattice = makeColdQuaternionLattice(mesh, knit)
  const will = momentumWaveStart({ mesh, side, geometry, mode, fill: 0.2, bias: 0.4, salt: 7 })
  let s: ColdQuaternionState = { ...emptyColdState(mesh), vibe: will.data }
  const e0 = coldQuaternionEnergy(s)
  const series = [momentumWaveAmplitude({ will: { mesh, data: s.vibe }, side, geometry, mode })]

  for (let t = 0; t < beats; t++) {
    s = coldQuaternionBeat(lattice, s)
    series.push(momentumWaveAmplitude({ will: { mesh, data: s.vibe }, side, geometry, mode }))
  }

  // the share of the final amplitude carried on the frozen lines (the frozen frame)
  const frozenData = Int8Array.from(s.vibe, (v, i) => (FROZEN_LINES.has(COLD_LINE_OF[i % 24] ?? 0) ? v : 0))
  const frozen = momentumWaveAmplitude({ will: { mesh, data: frozenData }, side, geometry, mode })
  const k = (2 * Math.PI * mode * Math.hypot(...geometry.wave)) / side
  const counters = s.counter.reduce((a, b) => a + b, 0)
  const stores = s.store.reduce((a, b) => a + b, 0)

  return { side, k, series, energyExact: coldQuaternionEnergy(s) === e0, counterShare: counters / e0, storeShare: stores / e0, frozenShare: frozen / (series[series.length - 1] || 1) }
}

const FROZEN_LINES = new Set<number>()

function sound(knit: ColdQuaternionKnit, side: number, geometry: WaveGeometry = { momentum: [1, 0, 0, 0], wave: [1, 0, 0, 0] }) {
  const w = wave(knit, side, geometry, 144)
  const s0 = w.series[0] ?? 1
  const fit = dampedCosineFit({ series: w.series.map(x => x / s0) })

  return { ...w, speed: fit.omega / w.k, gamma: fit.gamma, r2: fit.r2, oscillates: fit.omega > fit.gamma && fit.r2 > 0.9 }
}

function shear(knit: ColdQuaternionKnit, side: number, geometry: WaveGeometry = { momentum: [1, 0, 0, 0], wave: [0, 1, 0, 0] }, mode = 1) {
  const w = wave(knit, side, geometry, 60, mode)
  const fit = decayRateFit({ series: w.series })
  const s0 = w.series[0] ?? 1

  return { ...w, mode, gamma: fit.gamma, r2: fit.r2, nu: fit.gamma / (w.k * w.k), finalShare: (w.series[w.series.length - 1] ?? 0) / s0 }
}

// ---------------------------------------------------------------------------------------------------------
// 8. the husk's labels on the real honeycomb

function huskLabels() {
  const coin = labelledCoin()
  const ball = buildHyperbolicBall({ coin, radius: 3 })
  const layer = cuspLayer({ coin, skinRadius: 3 })
  const inLayer = new Set(layer.skin.keys())
  const plus = [0, 1, 4, 5, 8, 9].join('.')
  const minus = [2, 3, 6, 7, 10, 11].join('.')
  let complete = 0
  let plusCells = 0
  let minusCells = 0

  for (let c = 0; c < ball.cells; c++) {
    if (!inLayer.has(ball.keys[c] ?? '')) continue

    const labels: number[] = []
    let whole = true

    for (let k = 0; k < 24; k++) {
      const n = ball.mesh.neighbour(c, k)

      if (n >= ball.cells) whole = false
      else if (inLayer.has(ball.keys[n] ?? '')) labels.push(k)
    }

    if (!whole) continue

    complete++
    plusCells += labels.join('.') === plus ? 1 : 0
    minusCells += labels.join('.') === minus ? 1 : 0
  }

  // the six labels of each set are the roots r with r . n = 1 for n = e1 (plus) or -e1 (minus)
  const facetsOk = [plus, minus].every((set, i) => set.split('.').map(Number).every(k => (ROOTS[k]?.[0] ?? 0) === (i === 0 ? 1 : -1)))

  return { complete, plusCells, minusCells, facetsOk }
}

// ---------------------------------------------------------------------------------------------------------

export default experiment({
  id: 'relativity/cold-quaternion-knit',
  code: 'E-RLT-0054',
  title:
    'the cold quaternion knit keeps CPT, forced isotropy and every exact law and dresses nothing, but has no hydrodynamics: Q8 is its glide group exactly (rank-2 spread 1.25e-15) on tones, stores and counters, a lone tone stays one slot at sides 7, 9, 11 and for 200 beats on the unbounded lattice, pairs are made only when two like tones each bring two units, and the long-wave anisotropy is noise falling to 0.33 in the bulk and 0.28 on the husk (combined knit 0.80 and 0.69); but the exchange almost never fires (4 dock-beats of 15,000, one free momentum direction seen of four), so an axis shear does not decay at all (nu -0.003 to -0.019, r2 under 0.04), and the vacuum has 12 line components and no walls',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const knit = makeColdQuaternionKnit()
    const s = structure()
    const law = laws(knit)
    const inv = invariants(knit)

    inv.frozen.forEach(l => FROZEN_LINES.add(l))

    const threshold = thresholds(knit)
    const still = coldVacuum(knit)
    const dress = dressing(knit)
    const battery = coldBattery(knit)
    const committedRule: ScheduledRule = (o, f) => turningWeave({ opposite: o, forward: f })
    const combinedRule: ScheduledRule = (o, f) => combinedCollision({ spec: COMBINED_DEFAULT, opposite: o, forward: f })
    const committed = acceptance(committedRule)
    const combined = acceptance(combinedRule)

    // sound and viscosity
    const sounds = [12, 16, 20, 24].map(side => sound(knit, side))
    const extrapolation = linearFit({ xs: sounds.map(x => x.k * x.k), ys: sounds.map(x => x.speed) })
    const soundDirections = [
      { name: 'axis0', ...(sounds[1] ?? sound(knit, 16)) },
      { name: 'axis2', ...sound(knit, 16, { momentum: [0, 0, 1, 0], wave: [0, 0, 1, 0] }) },
      { name: 'diagonal01', ...sound(knit, 22, { momentum: [1, 1, 0, 0], wave: [1, 1, 0, 0] }) },
    ]
    const speedSpread = Math.max(...soundDirections.map(x => x.speed)) / Math.min(...soundDirections.map(x => x.speed))
    const shears = [12, 16, 20, 24].map(side => shear(knit, side))
    const modeTwo = shear(knit, 20, undefined, 2)
    const allShears = [...shears, modeTwo]
    const xs = allShears.map(r => Math.log(r.k))
    const ys = allShears.map(r => Math.log(Math.max(1e-12, r.gamma)))
    const exponentFit = linearFit({ xs, ys })
    const exponentError = slopeError(xs, ys, exponentFit.slope, exponentFit.intercept)
    const nus = shears.map(r => r.nu)
    const nuSpread = Math.min(...nus) > 0 ? Math.max(...nus) / Math.min(...nus) : Number.POSITIVE_INFINITY
    const oriented = ORIENTATIONS.map(([name, geometry]) => ({ name, ...(name === 'axes01' ? (shears[1] ?? shear(knit, 16)) : shear(knit, 16, geometry)) }))
    const q8 = matrixGroupClosure(quaternionGroup().map(g => linearMapOf(g) ?? []))
    const pairs = relatedPairs(q8)
    const nuOf = (name: string): number => oriented.find(o => o.name === name)?.nu ?? 0
    const pairRatios = pairs.map(([a, b]) => nuOf(a) / nuOf(b))
    const orientedPositive = oriented.every(o => o.nu > 0)
    const anisotropy = orientedPositive ? Math.max(...oriented.map(o => o.nu)) / Math.min(...oriented.map(o => o.nu)) : Number.NaN
    const exchangeOff = shear(makeColdQuaternionKnit({ exchange: false }), 16)

    // the long-wave response, bulk and husk
    const opposite9 = meshOpposites(d4Mesh({ side: 9 }))
    const opposite13 = meshOpposites(d4Mesh({ side: 13 }))
    const responses: Record<string, { nine: ResponseReading; thirteen: ResponseReading }> = {
      cold: { nine: coldResponse({ side: 9, knit, starts: 16 }), thirteen: coldResponse({ side: 13, knit, starts: 4 }) },
      hot: { nine: toneResponse({ side: 9, schedule: quaternionKnit({ opposite: opposite9 }), starts: 16 }), thirteen: toneResponse({ side: 13, schedule: quaternionKnit({ opposite: opposite13 }), starts: 4 }) },
      combined: {
        nine: toneResponse({ side: 9, schedule: combinedCollision({ spec: COMBINED_DEFAULT, opposite: opposite9 }), starts: 16 }),
        thirteen: toneResponse({ side: 13, schedule: combinedCollision({ spec: COMBINED_DEFAULT, opposite: opposite13 }), starts: 4 }),
      },
      committed: { nine: toneResponse({ side: 9, schedule: turningWeave({ opposite: opposite9 }), starts: 16 }), thirteen: toneResponse({ side: 13, schedule: turningWeave({ opposite: opposite13 }), starts: 4 }) },
    }
    const husk = huskLabels()

    // gates
    const g1 = s.maps.length === 4 && s.perMap.every(m => m.failures.twisted === 0 && m.failures.plain > 0 && m.fired > 0)
    const g2 = s.glideOrder === 8 && s.glides.length === 8 && s.spread2 < 1e-12 && s.cpt
    const g3 = law.exact && law.leaks === 0 && law.formBreaks === 0 && law.lowest >= 0 && law.reverses
    const g4 = inv.rank === 8 && inv.observedRank === 4
    const below = threshold.filter(r => r.name === 'like00' || r.name === 'like11' || r.name === 'like13' || r.name === 'loveFear33')
    const above = threshold.filter(r => r.name === 'like22' || r.name === 'like25' || r.name === 'like33')
    const g5 = threshold.every(r => r.energyExact) && below.every(r => r.pairs === 0) && above.every(r => r.pairs > 0)
    const g6 =
      still &&
      dress.boxes.every(b => b.allOne) &&
      dress.assertionHeld &&
      dress.unboundedSupportOne &&
      dress.reachExact &&
      dress.matches &&
      dress.blob.supportAboveEnergy === 0 &&
      dress.blob.energyChanges === 0 &&
      dress.pair.supportAboveEnergy === 0
    const everyRun = [...sounds, ...soundDirections, ...allShears, ...oriented, exchangeOff]
    const g7 =
      everyRun.every(r => r.energyExact) &&
      sounds.every(x => x.oscillates && x.speed < 1) &&
      nuSpread <= 1.1 &&
      shears.every(r => r.r2 > 0.99) &&
      Math.abs(exponentFit.slope - 2) <= 0.2
    const g8 = pairs.length > 0 && pairRatios.every(r => r > 0 && Math.abs(r - 1) <= 0.1)
    const cold9 = responses.cold?.nine
    const combined9 = responses.combined?.nine
    const g9 =
      (cold9?.bulk[2] ?? 9) < (combined9?.bulk[2] ?? 0) &&
      (cold9?.bulk[2] ?? 9) < (cold9?.bulk[0] ?? 0) &&
      (cold9?.huskMean[2] ?? 9) < (combined9?.huskMean[2] ?? 0) &&
      (cold9?.huskMean[2] ?? 9) < (cold9?.huskMean[0] ?? 0)
    const dressNoMore = (x: number[], y: readonly number[]): boolean => x.every((v, p) => v <= (y[p] ?? 0))
    const box9 = dress.boxes.find(b => b.side === 9)
    const g10items = {
      vacuumComponents: battery.vacuumComponents <= committed.vacuumComponents,
      denseComponents: battery.denseComponents <= committed.denseComponents,
      superposition: battery.additivityWorst < 1e-9,
      walls: battery.wallQuantized && battery.wallMax > 0,
      travel: battery.travellers >= committed.travellers,
      dressingLove: dressNoMore(box9?.periodLargest.love ?? [], committed.love.periodLargest),
      dressingFear: dressNoMore(box9?.periodLargest.fear ?? [], committed.fear.periodLargest),
    }
    const g10 = Object.values(g10items).every(Boolean)
    const built = g1 && g2 && g3 && g4 && g5 && g6
    const status = built && g7 && g8 && g9 && g10 ? 'pass' : built ? 'partial' : 'fail'

    const metrics: Record<string, number> = {
      payerMaps: s.maps.length,
      ...Object.fromEntries(s.perMap.flatMap((m, i) => [
        [`map${i}TwistedFailures`, m.failures.twisted],
        [`map${i}PlainFailures`, m.failures.plain],
        [`map${i}ThresholdFiredOf2000`, m.fired],
      ])),
      glides: s.glides.length,
      glideGroupOrder: s.glideOrder,
      reversals: s.reversals.length,
      cptAtIdentity: s.cpt ? 1 : 0,
      forcedSpreadRank2: Number(s.spread2.toExponential(2)),
      forcedSpreadRank4: Number(s.spread4.toExponential(2)),
      commutantOnTracelessSymmetric: s.commutant,
      lawsExact: law.exact ? 1 : 0,
      colorLeaks: law.leaks,
      forcedFormBreaks: law.formBreaks,
      lowestStoreOrCounter: law.lowest,
      tonesMadeInLawRun: law.made,
      reverses: law.reverses ? 1 : 0,
      forcedRank: inv.rank,
      frozenLines: inv.frozen.length,
      ...Object.fromEntries(inv.frozen.map((l, i) => [`frozenLine${i}`, l])),
      observedChangeRank: inv.observedRank,
      dockBeatsWithLineChange: inv.changed,
      ...Object.fromEntries(threshold.flatMap(r => [
        [`threshold_${r.name}_pairs`, r.pairs],
        [`threshold_${r.name}_lines`, r.lines],
      ])),
      thresholdRunsEach: threshold[0]?.runs ?? 0,
      coldVacuumStill: still ? 1 : 0,
      ...Object.fromEntries(dress.boxes.flatMap(b => [
        ...b.periodLargest.love.map((x, p) => [`loveSide${b.side}Period${p + 1}`, x]),
        ...b.periodLargest.fear.map((x, p) => [`fearSide${b.side}Period${p + 1}`, x]),
      ])),
      unboundedRuns: dress.unboundedRuns,
      unboundedSupportAlwaysOne: dress.unboundedSupportOne ? 1 : 0,
      unboundedReachIsSqrt2T: dress.reachExact ? 1 : 0,
      unboundedStoresAndCountersStayZero: dress.assertionHeld ? 1 : 0,
      sparseMatchesDense: dress.matches ? 1 : 0,
      pairAboveThresholdPeakTones: dress.pair.peakTones,
      pairAboveThresholdFinalTones: dress.pair.finalTones,
      pairAboveThresholdEnergy: dress.pair.energy,
      blobEnergy: dress.blob.energy,
      blobPeakSlots: dress.blob.peakSlots,
      blobPeakDocks: dress.blob.peakDocks,
      blobFinalSlots: dress.blob.finalSlots,
      blobFinalDocks: dress.blob.finalDocks,
      ...Object.fromEntries(dress.blob.slotsAt.map((x, i) => [`blobSlotsAtBeat${[25, 50, 100, 200, 400][i]}`, x])),
      vacuumPeriod: battery.vacuumPeriod,
      vacuumComponents: battery.vacuumComponents,
      denseComponents: battery.denseComponents,
      additivityWorst: battery.additivityWorst,
      wallQuantized: battery.wallQuantized ? 1 : 0,
      wallMax: battery.wallMax,
      travellers: battery.travellers,
      meanReach: battery.meanReach,
      speedAtZeroK: extrapolation.intercept,
      halfC: Math.SQRT1_2,
      speedSpread,
      nuSpreadL12to24: nuSpread,
      nuMean: nus.reduce((a, b) => a + b, 0) / nus.length,
      exponent: exponentFit.slope,
      exponentError,
      viscosityAnisotropy: anisotropy,
      q8RelatedOrientationPairs: pairs.length,
      ...Object.fromEntries(pairs.map(([a, b], i) => [`nuRatio_${a}_${b}`, pairRatios[i] ?? 0])),
      huskCompleteLayerCells: husk.complete,
      huskCellsPlusE1: husk.plusCells,
      huskCellsMinusE1: husk.minusCells,
      huskFacetsAreRootsOnTheVertex: husk.facetsOk ? 1 : 0,
      seconds: (Date.now() - started) / 1000,
    }

    sounds.forEach(x => {
      metrics[`soundSpeedL${x.side}`] = x.speed
      metrics[`soundGammaL${x.side}`] = x.gamma
      metrics[`soundR2L${x.side}`] = x.r2
      metrics[`soundOscillatesL${x.side}`] = x.oscillates ? 1 : 0
      metrics[`counterShareSoundL${x.side}`] = x.counterShare
      metrics[`storeShareSoundL${x.side}`] = x.storeShare
    })
    soundDirections.forEach(x => (metrics[`soundSpeed_${x.name}`] = x.speed))
    allShears.forEach(r => {
      metrics[`nuL${r.side}M${r.mode}`] = r.nu
      metrics[`gammaL${r.side}M${r.mode}`] = r.gamma
      metrics[`r2L${r.side}M${r.mode}`] = r.r2
      metrics[`finalShearShareL${r.side}M${r.mode}`] = r.finalShare
      metrics[`frozenShareOfFinalShearL${r.side}M${r.mode}`] = r.frozenShare
    })
    oriented.forEach(o => {
      metrics[`nu_${o.name}`] = o.nu
      metrics[`r2_${o.name}`] = o.r2
      metrics[`finalShearShare_${o.name}`] = o.finalShare
    })

    for (const [name, r] of Object.entries(responses)) {
      r.nine.bulk.forEach((x, i) => (metrics[`${name}BulkSide9Over${[1, 4, 16][i]}`] = x))
      r.nine.huskMean.forEach((x, i) => (metrics[`${name}HuskMeanSide9Over${[1, 4, 16][i]}`] = x))
      r.nine.huskMax.forEach((x, i) => (metrics[`${name}HuskMaxSide9Over${[1, 4, 16][i]}`] = x))
      r.thirteen.bulk.forEach((x, i) => (metrics[`${name}BulkSide13Over${[1, 4][i]}`] = x))
      r.thirteen.huskMean.forEach((x, i) => (metrics[`${name}HuskMeanSide13Over${[1, 4][i]}`] = x))
      r.nine.husk.forEach((x, i) => (metrics[`${name}HuskSide9Normal${i}`] = x))
      metrics[`${name}IsotropicSizeSide9`] = r.nine.isotropicSize
    }

    Object.entries(g10items).forEach(([k, v]) => (metrics[`battery_${k}`] = v ? 1 : 0))
    ;[g1, g2, g3, g4, g5, g6, g7, g8, g9, g10].forEach((g, i) => (metrics[`gate${i + 1}`] = g ? 1 : 0))

    return verdict({
      status,
      claim:
        'the cold quaternion knit commutes with Q8 on its whole state and has Q8 as its glide group with CPT at the identity coin map, keeps energy, P, P_E, charge, every forced functional and local color exactly and reverses exactly, makes pairs only when two like tones each bring two units, keeps the empty vacuum still and a lone tone alone at every size and on the unbounded lattice; the hydrodynamic, isotropy, response and battery gates are as the gate metrics say',
      metrics,
      control: {
        committedVacuumPeriod: committed.vacuumPeriod,
        committedVacuumComponents: committed.vacuumComponents,
        committedDenseComponents: committed.denseComponents,
        committedAdditivityWorst: committed.additivityWorst,
        committedWallQuantized: committed.wallQuantized ? 1 : 0,
        committedWallMax: committed.wallMax,
        committedTravellers: committed.travellers,
        committedCptPhase: committed.cptPhase,
        ...Object.fromEntries(committed.love.periodLargest.map((x, p) => [`committedLoveSide9Period${p + 1}`, x])),
        ...Object.fromEntries(committed.fear.periodLargest.map((x, p) => [`committedFearSide9Period${p + 1}`, x])),
        combinedVacuumPeriod: combined.vacuumPeriod,
        combinedVacuumComponents: combined.vacuumComponents,
        combinedDenseComponents: combined.denseComponents,
        combinedAdditivityWorst: combined.additivityWorst,
        combinedWallQuantized: combined.wallQuantized ? 1 : 0,
        combinedWallMax: combined.wallMax,
        combinedTravellers: combined.travellers,
        combinedCptPhase: combined.cptPhase,
        combinedReverses: combined.reverses ? 1 : 0,
        ...Object.fromEntries(combined.love.periodLargest.map((x, p) => [`combinedLoveSide9Period${p + 1}`, x])),
        ...Object.fromEntries(combined.fear.periodLargest.map((x, p) => [`combinedFearSide9Period${p + 1}`, x])),
        exchangeOffNuL16: exchangeOff.nu,
        exchangeOffR2L16: exchangeOff.r2,
        exchangeOffFinalShearShareL16: exchangeOff.finalShare,
        coldScatterWeaveViscosityAnisotropy: 12,
      },
      notes:
        'L2, exact, no random numbers (the Kronecker stream of code/tool/weyl for the symmetry checks since 2026-09-26, a linear congruential sequence before it, golden-ratio fills elsewhere). See the header for the gates. THE PAYERS: Q8 permutes the six couples in orbits of 4 and 2; a couple of the second orbit has a stabilizer that fixes no line, so only the first orbit can have one payer line, and 4 equivariant bijections onto the second orbit\'s lines exist; the made state must carry the frame\'s tone twist (the plain sign fails Q8). THE FROZEN LINES: the forced functionals fix four line momenta one by one (lines 0, 1, 10, 11, the frame e1 +- e2, e3 +- e4), so no collision of any Q8 knit with exact local color moves momentum on those lines. But that is not what stops the shear: the share of the final shear amplitude on the frozen lines is 0.03 or less. The four free directions are open in principle and nearly closed in practice, because the one move that uses them, the exchange, needs exactly two lone tones on the eight free lines, alike, of equal store, with both target lines calm: on a dense side-5 run it fired at 4 dock-beats of 15,000 and the changes spanned 1 direction of 4 (G4 fails on this, the forced rank itself is 8 as proved). With the exchange switched off the L = 16 shear reads the same (nu -0.0065, 0.63 of the amplitude left after 60 beats, against -0.0073 and 0.64 with it on). So every line momentum is conserved in practice, axis shears keep 0.64 to 0.69 of their amplitude, the diagonal shears fall to 0.08 by phase mixing of free streaming rather than by collisions (nu 2.34 and 2.40, r2 0.91), and sound runs at 0.93 to 0.95 (extrapolated 0.928 against c / 2 = 0.707, near the streaming speed, 0.63 on the diagonal). G8 passes on numbers (ratios 1.053, 1.019, 0.976 for the three Q8-related pairs) but for the axis pairs those are ratios of two non-decaying fits, so it shows the symmetry acting on the runs, not an isotropic viscosity. Q8 forces nothing at rank 4 (spread 0.235, commutant 27 on traceless symmetric tensors, against 1 for SO(4)), so an isotropic viscosity would not follow from the symmetry even if one existed. THE BATTERY: dressing 1 in every period at every side (committed 33, 160, 565, 1,508), travel 24 of 24 (committed 12), superposition exact, dense components 1, but vacuum components 12 (committed 3, combined 2: a lone tone on a cold vacuum meets nothing, as E-FLD-0032 found) and no walls (a still vacuum has no clock to stagger). The dense blob (25 docks, energy 762) spreads to 300 free-streaming tones by beat 25 and stays there; a head-on pair above threshold makes its four tones and nothing more. The husk reading is the bulk kernel restricted to hyperplanes perpendicular to the 24-cell\'s vertex directions, on the flat D4 model of the cusp (code/measure/husk-response); the real cusp layer\'s six in-layer facets were read off the radius-3 {3,4,3,4} ball, alternating between the roots with first entry +1 and -1 because the antipodal transport reverses orientation from cell to cell. Bulk and husk agree: the cold knit reads 1.09, 0.60, 0.33 (bulk) and 0.92, 0.51, 0.28 (husk mean) over 1, 4, 16 starts at side 9, falling as noise does, and 0.65, 0.35 and 0.55, 0.30 at side 13; the combined knit stays at 0.84, 0.80, 0.80 (bulk) and 0.72, 0.69, 0.69 (husk mean, 0.48 to 0.88 across the 12 husks), the committed knit at 1.60, 1.23, 1.18 and 1.35, 1.05, 1.01. A structural bulk anisotropy survives onto every husk, a little smaller.',
    })
  },
})
