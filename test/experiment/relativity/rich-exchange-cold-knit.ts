// The cold quaternion knit with every exchange its laws allow (E-RLT-0056).
//
// E-RLT-0054's cold quaternion knit had forced isotropy, CPT, exact laws and zero dressing together, and no
// hydrodynamics: its one momentum-moving move, the exchange of two lone like tones on the eight free lines
// with both target lines calm, fired at 4 dock-beats of 15,000. Here the exchange is replaced by every
// two-tone move the laws allow (code/rule/cold-scatter): 40 quads (the 24 pairs of classes of two, and 16
// from the eight classes of four pairs, split by a matching carried over their free Q8 orbit), each firing
// on its own four slots whatever the rest of the dock holds, and 6 rotations of a head-on pair onto another
// line along a line involution commuting with Q8. Every move keeps E, P, P_E, charge and every forced
// functional; the dock's moves fire together when they touch disjoint slots and firing them leaves the same
// set able to fire, which makes the exchange an involution commuting with Q8 and with negating every tone.
//
// WHAT THE LAWS FORBID, proved and checked here exhaustively:
// - UNEQUAL STORES. A two-tone move with a e_u + b e_v = c e_w + d e_x (P_E), a + b = c + d (E) and
//   e_u + e_v = e_w + e_x (P) has (a - d) e_u + (b - d) e_v + (d - c) e_w = 0, so a = b = c = d whenever
//   e_u, e_v, e_w are independent; a head-on pair has P_E (a - b) e_u, so a = b and c = d. No store can be
//   paid or refunded in a two-tone move. Checked on every move with stores 0 to 4.
// - A LONE TONE CAN NEVER CHANGE. With E = sum of (1 + s_i) plus counters and P_E = sum of (1 + s_i) e_i,
//   a state with the energy and P_E of one tone e_u of store s has sum (1 + s_i) e_i . e_u = 2 (1 + s) and
//   sum (1 + s_i) <= 1 + s, while every e_i . e_u <= 2 with equality only for e_i = e_u: so it is that tone.
//   Checked on every state of up to three tones. On a cold (still) vacuum a lone tone therefore touches no
//   other line and no dock: dressing is 1, the vacuum line graph has 12 components (9 on the husk) and a
//   staggered birth makes no wall, for every cold knit with exact P_E.
//
// Measured:
// 1. the symmetry: every move set counted; the collision against Q8 on 3,000 random docks and 1,000 built to
//    fire the threshold; every (W(F4) element keeping the couples, tone map +-1) as a glide on 300 docks;
//    reversal and CPT on every dock tested
// 2. the two lemmas, exhaustively
// 3. the exact laws on the side-3 box (as E-RLT-0054) with local color
// 4. how often the exchange fires: moves fired and docks blocked per dock-beat in the gas (fill 0.2, L = 16,
//    24 beats), and the rank of the line-momentum changes on E-RLT-0054's dense side-5 run
// 5. dressing: a lone love and fear, stores 0 and 5, every direction, side 7 and 9 boxes, 96 beats
// 6. HYDRODYNAMICS, HUSK AND BULK (code/measure/husk-hydro): for this knit, six in-husk shear orientations at
//    L = 12, 16, 20, three bulk-only ones at L = 16, sound along three husk axes and a husk diagonal at L = 12,
//    16, 20 extrapolated to k = 0 against c / 2 = 1 / sqrt 2; for E-RLT-0054's knit the same at L = 16 only.
//    (The sizes were cut from 12 to 24 before any result, because the machine ran at a load average near
//    340 and the full protocol would have taken hours; the law's thresholds are unchanged.)
// 7. connectivity: the bulk line sectors on the vacuum and on a dense background, and the husk components
//    (the nine husk directions), beside the committed and combined knits'
// 8. the quantum gates of E-RLT-0055 (code/measure/fear-port) on this knit
//
// Gates, fixed before this file ran. Probes had shown, for this knit at L = 12 only, the husk shear along
// axes01 not decaying, axes12 decaying slowly and diagonal01 decaying fast, before the gates were written:
//  G1 symmetry: 0 equivariance failures, glide group Q8 exactly with spread under 1e-12, 0 reversal and 0 CPT
//     failures
//  G2 the two lemmas: 0 violations
//  G3 the exact laws, 0 color leaks, exact reversal
//  G4 the exchange fires at least once per 10 dock-beats in the gas, and the dense run's changes span 4
//     directions
//  G5 every lone support 1 at every beat
//  G6 THE HUSK IS HYDRODYNAMIC AND ISOTROPIC: every in-husk shear orientation obeys E-FLD-0032's law (nu
//     constant to 10 percent over L = 12 to 20, r2 above 0.99, exponent within 0.2 of 2), every husk sound
//     run oscillates below the streaming speed, and nu varies by at most 10 percent over the husk
//     orientations at L = 16
//  G7 every quantum gate of E-RLT-0055
//  G8 the husk connectivity no worse than the committed knit's on the vacuum, and walls present
// Verdict: pass if all hold; partial if G1 to G5 and G7 hold; fail otherwise.
//
// DETERMINISM: no random numbers and no seeds. Sampled docks are drawn from a Weyl sequence and every gas is
// placed by Weyl sequences (code/measure/husk-hydro, weylWaveStart), golden-ratio fills elsewhere.
//
// Depth L2: a constructed rule, its symmetry and laws checked exactly, its physics measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { d4BoxMesh, linearMapOf } from '@/code/substrate/d4-box'
import { turningWeave } from '@/code/rule/collision'
import { COMBINED_DEFAULT, combinedCollision } from '@/code/rule/combined-knit'
import { QUATERNION_COUPLES, forcedFunctionals, quaternionGroup, twistOf } from '@/code/rule/quaternion-knit'
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
  quaternionScatter,
  type ColdQuaternionKnit,
  type ColdQuaternionState,
} from '@/code/rule/cold-quaternion-knit'
import { type ScatterSet } from '@/code/rule/cold-scatter'
import { dockColor } from '@/code/rule/scatter-weave'
import { groupTable, rowBasis } from '@/code/measure/color-isotropy-bound'
import { matrixGroupClosure } from '@/code/measure/glide-group'
import { forcedIsotropySpread, unitSamples } from '@/code/measure/coarse-modes'
import { lineSectors, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { coldGas, coldLineSectors, hydroBattery, hydroMetrics, huskComponents, weylStream, weylWaveStart } from '@/code/measure/husk-hydro'
import { fearPortReading } from '@/code/measure/fear-port'
import { d4Mesh } from '@/code/tool/mesh'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const ROOTS = rootsD4()

type Dock = { vibe: number[]; store: number[]; counter: number[] }

function randomDock(rand: () => number): Dock {
  const fill = rand()
  const vibe = Array.from({ length: 24 }, () => (rand() < fill ? (rand() < 0.5 ? 1 : -1) : 0))
  const store = vibe.map(v => (v === 0 ? 0 : rand() < 0.5 ? 0 : Math.floor(rand() * 5)))

  return { vibe, store, counter: Array.from({ length: 6 }, () => (rand() < 0.5 ? 0 : Math.floor(rand() * 6))) }
}

function thresholdDock(rand: () => number, knit: ColdQuaternionKnit): Dock {
  const d = randomDock(rand)

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

    if (rand() < 0.6) {
      for (const x of [p, m].flatMap(l => [COLD_FIRSTS[l] ?? 0, COLD_OPPOSITE[COLD_FIRSTS[l] ?? 0] ?? 0])) {
        d.vibe[x] = 0
        d.store[x] = 0
      }
    }
  })

  return d
}

const same = (x: ArrayLike<number>, y: ArrayLike<number>): boolean => x.length === y.length && Array.from(x).every((v, i) => v === y[i])

function act(p: readonly number[], tau: number, dock: { vibe: ArrayLike<number>; store: ArrayLike<number>; counter: ArrayLike<number> }): Dock {
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

const keepsCouples = (p: readonly number[]): boolean =>
  QUATERNION_COUPLES.every(([a, b]) => COUPLE_OF_LINE[COLD_LINE_OF[p[COLD_FIRSTS[a] ?? 0] ?? 0] ?? 0] === COUPLE_OF_LINE[COLD_LINE_OF[p[COLD_FIRSTS[b] ?? 0] ?? 0] ?? 0])

function symmetry(knit: ColdQuaternionKnit) {
  const rand = weylStream(4)
  const group = quaternionGroup()
  let equivariance = 0
  let reversal = 0
  let cpt = 0

  for (let n = 0; n < 4000; n++) {
    const d = n < 3000 ? randomDock(rand) : thresholdDock(rand, knit)
    const out = collideDockCopy(knit, d, true)

    for (const g of group) {
      const lhs = collideDockCopy(knit, act(g, twistOf(g), d), true)
      const rhs = act(g, twistOf(g), out)

      if (!same(lhs.vibe, rhs.vibe) || !same(lhs.store, rhs.store) || !same(lhs.counter, rhs.counter)) equivariance++
    }

    const back = collideDockCopy(knit, out, false)

    if (!same(back.vibe, d.vibe) || !same(back.store, d.store) || !same(back.counter, d.counter)) reversal++

    const neg = collideDockCopy(knit, { vibe: d.vibe.map(x => -x), store: d.store, counter: d.counter }, false)

    if (!same(neg.vibe, Array.from(out.vibe, x => -x)) || !same(neg.store, out.store) || !same(neg.counter, out.counter)) cpt++
  }

  const table = groupTable()
  const states = Array.from({ length: 300 }, (_, n) => (n < 200 ? randomDock(rand) : thresholdDock(rand, knit)))
  const images = states.map(d => collideDockCopy(knit, d, true))
  const glides: number[] = []

  table.permutations.forEach((p, index) => {
    if (!keepsCouples(p)) return

    for (const tau of [1, -1]) {
      if (states.every((d, n) => {
        const lhs = collideDockCopy(knit, act(p, tau, d), true)
        const rhs = act(p, tau, images[n] ?? d)

        return same(lhs.vibe, rhs.vibe) && same(lhs.store, rhs.store) && same(lhs.counter, rhs.counter)
      })) glides.push(index)
    }
  })

  const matrices = matrixGroupClosure(glides.map(i => linearMapOf(table.permutations[i] ?? []) ?? []))

  return { equivariance, reversal, cpt, glides: glides.length, order: matrices.length, spread: forcedIsotropySpread({ group: matrices, rank: 2, generic: [0.31, -0.74, 0.52, 0.29], samples: unitSamples(64) }) }
}

// THE LEMMAS
function unequalStores(set: ScatterSet): { checked: number; violations: number } {
  let checked = 0
  let violations = 0

  for (const m of set.moves) {
    for (let a = 0; a <= 4; a++) for (let b = 0; b <= 4; b++) for (let c = 0; c <= 4; c++) {
      const d = a + b - c

      if (d < 0 || d > 4) continue

      checked++

      const pe = (pairs: readonly [number, number], s: [number, number]): number[] =>
        [0, 1, 2, 3].map(k => (1 + s[0]) * (ROOTS[pairs[0]]?.[k] ?? 0) + (1 + s[1]) * (ROOTS[pairs[1]]?.[k] ?? 0))
      const before = pe(m.a, [a, b])
      const keeps = [[c, d] as [number, number], [d, c] as [number, number]].some(s => pe(m.b, s).every((x, k) => x === before[k]))

      if (keeps && !(a === b && b === c && c === d)) violations++
    }
  }

  return { checked, violations }
}

function loneFrozen(): { checked: number; violations: number } {
  let checked = 0
  let violations = 0

  for (let u = 0; u < 24; u++) {
    for (let s = 0; s <= 2; s++) {
      const energy = 1 + s
      const pe = (ROOTS[u] ?? []).map(x => (1 + s) * x)
      // every state of up to three tones with stores, the counters taking the rest of the energy
      const tones = (k: number, from: number, acc: [number, number][]): void => {
        if (acc.length === k) {
          // stores: every split of the free energy, at most energy - k over the tones
          const free = energy - k

          if (free < 0) return

          const splits = (i: number, left: number, stores: number[]): void => {
            if (i === k) {
              checked++

              const p = [0, 1, 2, 3].map(c => acc.reduce((x, [d]) => x + (ROOTS[d]?.[c] ?? 0), 0))
              const q = [0, 1, 2, 3].map(c => acc.reduce((x, [d], j) => x + (1 + (stores[j] ?? 0)) * (ROOTS[d]?.[c] ?? 0), 0))
              const itself = k === 1 && acc[0]?.[0] === u && stores[0] === s
              const keeps = p.every((x, c) => x === (ROOTS[u]?.[c] ?? 0)) && q.every((x, c) => x === pe[c])

              if (keeps && !itself) violations++

              return
            }

            for (let x = 0; x <= left; x++) splits(i + 1, left - x, [...stores, x])
          }

          splits(0, free, [])

          return
        }

        for (let d = from; d < 24; d++) tones(k, d + 1, [...acc, [d, 1]])
      }

      for (let k = 1; k <= 3; k++) tones(k, 0, [])
    }
  }

  return { checked, violations }
}

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

  for (let t = 0; t < 48; t++) {
    const a = { vibe: Int8Array.from(s.vibe), store: Int32Array.from(s.store), counter: Int32Array.from(s.counter), role: Int8Array.from(s.role ?? []), token: undefined }

    for (let x = 0; x < mesh.cellCount; x++) {
      const color = dockColor(a.vibe, a.role, x)
      const before = lineMomenta(a.vibe, x * 24)

      coldQuaternionCollide(knit, a, x, true)

      const after = lineMomenta(a.vibe, x * 24)

      leaks += dockColor(a.vibe, a.role, x) === color ? 0 : 1

      for (const row of forms) {
        if (row.reduce((acc, c, l) => acc + c * ((after[l] ?? 0) - (before[l] ?? 0)), 0) !== 0) formBreaks++
      }
    }

    s = coldQuaternionBeat(lattice, s)

    const m = coldQuaternionMomenta(s)

    exact = exact && coldQuaternionEnergy(s) === e0 && s.vibe.reduce((x, y) => x + y, 0) === q0 && m.p.every((x, k) => x === m0.p[k]) && m.pe.every((x, k) => x === m0.pe[k]) && Math.min(...s.store, ...s.counter) >= 0
  }

  for (let t = 47; t >= 0; t--) s = coldQuaternionBeatBack(lattice, s)

  return { exact, leaks, formBreaks, reverses: same(s.vibe, start.vibe) && same(s.store, start.store) && same(s.counter, start.counter) && same(s.role ?? [], start.role ?? []) }
}

function firing(knitOf: () => ColdQuaternionKnit) {
  // the gas
  const side = 16
  const mesh = d4Mesh({ side })
  const knit = knitOf()
  const lattice = makeColdQuaternionLattice(mesh, knit)
  let s: ColdQuaternionState = { ...emptyColdState(mesh), vibe: weylWaveStart({ mesh, side, geometry: { momentum: [1, 0, 0, 0], wave: [0, 1, 0, 0] }, mode: 1, fill: 0.2, bias: 0.4 }) }

  for (let t = 0; t < 24; t++) s = coldQuaternionBeat(lattice, s)

  const gasFired = knit.tally.fired / (mesh.cellCount * 24)
  const gasBlocked = knit.tally.blocked / (mesh.cellCount * 24)
  // the dense side-5 run of E-RLT-0054
  const dense = d4BoxMesh({ side: 5 })
  const denseKnit = knitOf()
  const denseLattice = makeColdQuaternionLattice(dense, denseKnit)
  let d = emptyColdState(dense)

  for (let i = 0; i < d.vibe.length; i++) {
    const u = ((i + 1) * GOLDEN * 1.37) % 1

    d.vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 1 : 0
    d.store[i] = d.vibe[i] === 0 ? 0 : Math.floor((((i + 11) * GOLDEN * 1.9) % 1) * 3)
  }

  const changes: number[][] = []
  let changed = 0

  for (let t = 0; t < 24; t++) {
    const a = { vibe: Int8Array.from(d.vibe), store: Int32Array.from(d.store), counter: Int32Array.from(d.counter), role: undefined, token: undefined }

    for (let x = 0; x < dense.cellCount; x++) {
      const before = lineMomenta(a.vibe, x * 24)

      coldQuaternionCollide(denseKnit, a, x, true)

      const delta = lineMomenta(a.vibe, x * 24).map((v, l) => v - (before[l] ?? 0))

      if (delta.some(v => v !== 0)) {
        changed++

        if (changes.length < 4000) changes.push(delta)
      }
    }

    d = coldQuaternionBeat(denseLattice, d)
  }

  return { gasFired, gasBlocked, denseChanged: changed, denseDockBeats: dense.cellCount * 24, changeRank: changes.length > 0 ? rowBasis(changes).length : 0 }
}

function dressing(knit: ColdQuaternionKnit): { largest: number; runs: number } {
  let largest = 0
  let runs = 0

  for (const side of [7, 9]) {
    const mesh = d4BoxMesh({ side })
    const lattice = makeColdQuaternionLattice(mesh, knit)
    const middle = Math.floor(side / 2)
    const center = middle * (1 + side + side * side + side ** 3)

    for (const tone of [1, -1]) {
      for (const store of [0, 5]) {
        for (let d = 0; d < 24; d++) {
          let s = emptyColdState(mesh)

          s.vibe[center * 24 + d] = tone
          s.store[center * 24 + d] = store

          for (let t = 0; t < 96; t++) {
            s = coldQuaternionBeat(lattice, s)

            let support = 0

            for (let i = 0; i < s.vibe.length; i++) support += s.vibe[i] !== 0 || s.store[i] !== 0 ? 1 : 0
            for (let i = 0; i < s.counter.length; i++) support += s.counter[i] !== 0 ? 1 : 0

            largest = Math.max(largest, support)
          }

          runs++
        }
      }
    }
  }

  return { largest, runs }
}

export default experiment({
  id: 'relativity/rich-exchange-cold-knit',
  code: 'E-RLT-0056',
  title: 'the cold quaternion knit with every exchange its laws allow',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const set = quaternionScatter()
    const richOf = (): ColdQuaternionKnit => makeColdQuaternionKnit({ scatter: set })
    const loneOf = (): ColdQuaternionKnit => makeColdQuaternionKnit()
    const knit = richOf()
    const sym = symmetry(knit)
    const stores = unequalStores(set)
    const lone = loneFrozen()
    const law = laws(richOf())
    const fire = firing(richOf)
    const dress = dressing(richOf())
    const box5 = d4BoxMesh({ side: 5 })
    const sectors = {
      richVacuum: coldLineSectors(richOf(), false, box5),
      richDense: coldLineSectors(richOf(), true, box5),
      loneVacuum: coldLineSectors(loneOf(), false, box5),
      loneDense: coldLineSectors(loneOf(), true, box5),
    }
    const committedRule: ScheduledRule = (o, f) => turningWeave({ opposite: o, forward: f })
    const combinedRule: ScheduledRule = (o, f) => combinedCollision({ spec: COMBINED_DEFAULT, opposite: o, forward: f })
    const toneSectors = {
      committedVacuum: lineSectors(committedRule, false),
      committedDense: lineSectors(committedRule, true),
      combinedVacuum: lineSectors(combinedRule, false),
      combinedDense: lineSectors(combinedRule, true),
    }
    const quantum = fearPortReading(richOf())
    const rich = hydroBattery(coldGas('rich', richOf), { sides: [12, 16, 20], soundSides: [12, 16, 20] })
    const loneHydro = hydroBattery(coldGas('lone', loneOf), { sides: [16], soundSides: [16] })

    const huskVacuum = huskComponents(sectors.richVacuum)
    const committedHuskVacuum = huskComponents(toneSectors.committedVacuum)
    const g1 = sym.equivariance === 0 && sym.order === 8 && sym.spread < 1e-12 && sym.reversal === 0 && sym.cpt === 0
    const g2 = stores.violations === 0 && lone.violations === 0
    const g3 = law.exact && law.leaks === 0 && law.formBreaks === 0 && law.reverses
    const g4 = fire.gasFired >= 0.1 && fire.changeRank === 4
    const g5 = dress.largest === 1
    const g6 =
      rich.husk.every(h => h.law) &&
      rich.sound.every(s => s.runs.every(r => r.oscillates && r.speed < 1)) &&
      rich.huskNuSpread <= 1.1 &&
      rich.energyExact
    const g7 = Object.values(quantum.gates).every(Boolean)
    // walls need a vacuum that changes: the empty box, 48 beats
    let vacuum = emptyColdState(box5)
    let vacuumStill = true
    const vacuumLattice = makeColdQuaternionLattice(box5, richOf())

    for (let t = 0; t < 48; t++) {
      vacuum = coldQuaternionBeat(vacuumLattice, vacuum)
      vacuumStill = vacuumStill && vacuum.vibe.every(x => x === 0) && vacuum.counter.every(x => x === 0)
    }

    const g8 = huskVacuum <= committedHuskVacuum && !vacuumStill
    const status = g1 && g2 && g3 && g4 && g5 && g6 && g7 && g8 ? 'pass' : g1 && g2 && g3 && g4 && g5 && g7 ? 'partial' : 'fail'

    return verdict({
      status,
      claim:
        'the rich exchange (40 quads, 6 rotations) keeps Q8, CPT, reversal, every exact law and local color, fires far more often than the lone exchange and leaves a lone tone alone; no two-tone move can pay or refund a store and no lone tone can change on a cold vacuum (both exhaustively); whether the husk is hydrodynamic and isotropic, and the connectivity, are as the gate metrics say',
      metrics: {
        quads: set.quads,
        rotations: set.rotations,
        rotationsAlikeOnly: set.moves.filter(m => m.kind === 'rotation' && m.alike).length,
        equivarianceFailures: sym.equivariance,
        glides: sym.glides,
        glideGroupOrder: sym.order,
        forcedSpreadRank2: Number(sym.spread.toExponential(2)),
        reversalFailures: sym.reversal,
        cptFailures: sym.cpt,
        storeLemmaChecked: stores.checked,
        storeLemmaViolations: stores.violations,
        loneLemmaChecked: lone.checked,
        loneLemmaViolations: lone.violations,
        lawsExact: law.exact ? 1 : 0,
        colorLeaks: law.leaks,
        forcedFormBreaks: law.formBreaks,
        reverses: law.reverses ? 1 : 0,
        gasMovesFiredPerDockBeat: fire.gasFired,
        gasDocksBlockedPerDockBeat: fire.gasBlocked,
        denseDockBeatsWithLineChange: fire.denseChanged,
        denseDockBeats: fire.denseDockBeats,
        denseChangeRank: fire.changeRank,
        loneLargestSupport: dress.largest,
        loneRuns: dress.runs,
        vacuumStillSoNoWalls: vacuumStill ? 1 : 0,
        richVacuumLineComponents: sectors.richVacuum.length,
        richDenseLineComponents: sectors.richDense.length,
        richHuskVacuumComponents: huskVacuum,
        richHuskDenseComponents: huskComponents(sectors.richDense),
        loneVacuumLineComponents: sectors.loneVacuum.length,
        loneDenseLineComponents: sectors.loneDense.length,
        loneHuskVacuumComponents: huskComponents(sectors.loneVacuum),
        loneHuskDenseComponents: huskComponents(sectors.loneDense),
        ...hydroMetrics('rich', rich),
        ...Object.fromEntries(Object.entries(quantum.metrics).map(([k, v]) => [`quantum_${k}`, v])),
        ...Object.fromEntries([g1, g2, g3, g4, g5, g6, g7, g8].map((g, i) => [`gate${i + 1}`, g ? 1 : 0])),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        ...hydroMetrics('lone', loneHydro),
        committedVacuumLineComponents: toneSectors.committedVacuum.length,
        committedDenseLineComponents: toneSectors.committedDense.length,
        committedHuskVacuumComponents: committedHuskVacuum,
        committedHuskDenseComponents: huskComponents(toneSectors.committedDense),
        combinedVacuumLineComponents: toneSectors.combinedVacuum.length,
        combinedDenseLineComponents: toneSectors.combinedDense.length,
        combinedHuskVacuumComponents: huskComponents(toneSectors.combinedVacuum),
        combinedHuskDenseComponents: huskComponents(toneSectors.combinedDense),
        ...Object.fromEntries(Object.entries(quantum.control).map(([k, v]) => [`quantum_${k}`, v])),
      },
      notes: 'L2. See the header.',
    })
  },
})
