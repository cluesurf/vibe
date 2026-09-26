// Which symmetry groups can force an isotropic viscosity, and what a cold knit on the best frozen-free group
// does (E-RLT-0057).
//
// E-RLT-0051 showed that exact local color and an irreducible period group force at least 8 of the 12 line
// momenta to be kept at every dock. Among its 109 least-rank groups, Q8 (E-RLT-0054, E-RLT-0056) freezes
// four lines one by one; 15 freeze none (tmp probe, confirmed here). A cold vacuum needs no couples, so the
// hot vacuum's reason for Q8 is gone and these 15 are eligible. Rank-2 isotropy (a diffusion tensor, the
// charge response kernel) is forced by any irreducible group. A VISCOSITY is a linear map on the traceless
// symmetric 2-tensors (the shear stresses, 9 dimensions in 4D); it is forced isotropic exactly when the only
// such maps commuting with the group are multiples of one, a commutant of dimension 1, counted here by the
// character formula (mean of chi^2, chi(g) = (tr(g)^2 + tr(g^2)) / 2 - 1). SO(4) and W(F4) give 1, Q8 gives
// 27.
//
// THE BOUND. A commutant of 1 means the 9-dimensional representation is irreducible, so 9 divides the group's
// order, so the group contains a Sylow 3-subgroup of W(F4) (order 1,152 = 2^7 3^2). Every subgroup of W(F4)
// that contains one of the 16 Sylow 3-subgroups is enumerated (adjoining one element at a time from each),
// and its commutant and forced rank computed: that is every candidate for a symmetry-forced isotropic
// viscosity. If every one with commutant 1 has forced rank 12, then no exactly color-local knit can have a
// viscosity that its symmetry makes isotropic and move any momentum between lines at all: viscosity isotropy
// can only be emergent. (The same assumption as E-RLT-0051: the symmetries keep calm.)
//
// THE KNIT. On the frozen-free group chosen by a rule fixed here (the most equivariant moves, then the
// largest order, then the smallest rank-4 spread), a cold knit whose beat is one scattering involution
// (code/rule/cold-scatter: its 24 quads and, where a line involution commutes with the group, 6 rotations),
// with stores and no clock, threshold or counters. Its battery beside the Q8 cold knits of E-RLT-0054 and
// E-RLT-0056 and the combined knit: the glide group found by testing every W(F4) element with tone map +-1,
// its rank-2 and rank-4 spreads, CPT and reversal, the exact laws with local color (side 3), the gas firing
// rate, dressing (sides 7 and 9), the hydrodynamic battery on the husk and in the bulk
// (code/measure/husk-hydro), line and husk connectivity, walls, and the quantum gates of E-RLT-0055.
//
// Gates, fixed before this file ran (the probes had computed the group table, the Sylow enumeration and, for
// this knit, three shears at L = 12: axes01 not decaying, axes12 at nu 0.43, the diagonal fast):
//  T1 at least one group has commutant 1, and every group with commutant 1 has forced rank 12
//  T2 each of the 15 frozen-free groups acts irreducibly (rank-2 spread under 1e-12), has forced rank 8, no
//     frozen line, and a commutant of at least 2
//  K1 the knit commutes with its group (0 failures on 3,000 docks), its glide group contains it, CPT and
//     reversal exact on every dock tested
//  K2 exact E, P, P_E, charge and forced forms at every dock, 0 color leaks, exact reversal over 48 beats
//  K3 every lone support 1 at every beat
//  K4 the husk is hydrodynamic and isotropic, as E-RLT-0056's G6 (shears and sound at L = 12, 16, 20; the
//     combined knit's husk at L = 16 only, as the comparison; sizes cut before any result, for machine load)
//  K5 every quantum gate of E-RLT-0055
//  K6 husk connectivity no worse than the committed knit's on the vacuum, and walls present
// Verdict: pass if all hold; partial if T1, T2, K1, K2, K3 and K5 hold; fail otherwise.
//
// DETERMINISM: no random numbers and no seeds; sampled docks and every gas come from Weyl sequences
// (code/measure/husk-hydro), golden-ratio fills elsewhere; the group theory is exhaustive.
//
// Depth L2: exhaustive group theory, a constructed rule, its physics measured.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { d4BoxMesh, linearMapOf } from '@/code/substrate/d4-box'
import { turningWeave } from '@/code/rule/collision'
import { COMBINED_DEFAULT, combinedCollision } from '@/code/rule/combined-knit'
import { quaternionGroup } from '@/code/rule/quaternion-knit'
import {
  COLD_FIRSTS,
  COLD_OPPOSITE,
  coldQuaternionBeat,
  coldQuaternionBeatBack,
  coldQuaternionCollide,
  coldQuaternionEnergy,
  coldQuaternionMomenta,
  collideDockCopy,
  emptyColdState,
  makeColdQuaternionKnit,
  makeColdQuaternionLattice,
  type ColdQuaternionKnit,
  type ColdQuaternionState,
} from '@/code/rule/cold-quaternion-knit'
import { rotationMaps, scatterMoves } from '@/code/rule/cold-scatter'
import { dockColor } from '@/code/rule/scatter-weave'
import { closure, forcedForms, groupTable, leastRankGroups, rowBasis } from '@/code/measure/color-isotropy-bound'
import { matrixGroupClosure } from '@/code/measure/glide-group'
import { forcedIsotropySpread, unitSamples } from '@/code/measure/coarse-modes'
import { lineSectors, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { coldGas, coldLineSectors, hydroBattery, hydroMetrics, huskComponents, toneGas, weylStream, weylWaveStart } from '@/code/measure/husk-hydro'
import { fearPortReading } from '@/code/measure/fear-port'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const GENERIC = [0.31, -0.74, 0.52, 0.29]
const ROOTS = rootsD4()

const same = (x: ArrayLike<number>, y: ArrayLike<number>): boolean => x.length === y.length && Array.from(x).every((v, i) => v === y[i])

export default experiment({
  id: 'relativity/viscosity-isotropy-bound',
  code: 'E-RLT-0057',
  title: 'which groups can force an isotropic viscosity, and a cold knit on the best frozen-free group',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const table = groupTable()
    const n = table.permutations.length
    const mats = table.permutations.map(p => linearMapOf(p) ?? [])
    const samples = unitSamples(64)
    const trace = (m: number[][]): number => [0, 1, 2, 3].reduce((s, i) => s + (m[i]?.[i] ?? 0), 0)
    const square = (m: number[][]): number[][] => m.map(row => [0, 1, 2, 3].map(j => row.reduce((s, x, k) => s + x * (m[k]?.[j] ?? 0), 0)))
    const chi = mats.map(m => (trace(m) ** 2 + trace(square(m))) / 2 - 1)
    const commutant = (g: readonly number[]): number => g.reduce((s, x) => s + (chi[x] ?? 0) ** 2, 0) / g.length
    const frozenOf = (forms: number[][]): number =>
      Array.from({ length: 12 }, (_, l) => l).filter(l => rowBasis([...forms, Array.from({ length: 12 }, (__, k) => (k === l ? 1 : 0))]).length === forms.length).length

    // THE BOUND
    const all = Array.from({ length: n }, (_, i) => i)
    const order3 = all.filter(x => x !== table.identity && table.multiply[(table.multiply[x * n + x] ?? 0) * n + x] === table.identity)
    const sylow = new Map<string, number[]>()

    for (const a of order3) for (const b of order3) {
      const g = closure(table, [a, b])

      if (g.length === 9) sylow.set(g.join(','), g)
    }

    const sylowRanks = [...sylow.values()].map(g => forcedForms(table, g).length)
    const overgroups = new Map<string, number[]>()
    const queue: { group: number[]; gens: number[] }[] = [...sylow.values()].map(g => ({ group: g, gens: [...g] }))

    for (const q of queue) overgroups.set(q.group.join(','), q.group)

    for (let head = 0; head < queue.length; head++) {
      const { group, gens } = queue[head] ?? { group: [], gens: [] }
      const inside = new Set(group)

      for (const h of all) {
        if (inside.has(h)) continue

        const next = closure(table, [...gens, h])
        const id = next.join(',')

        if (!overgroups.has(id)) {
          overgroups.set(id, next)
          queue.push({ group: next, gens: [...gens, h] })
        }
      }
    }

    const isotropicViscosity = [...overgroups.values()].filter(g => Math.abs(commutant(g) - 1) < 1e-9)
    const isotropicRanks = isotropicViscosity.map(g => forcedForms(table, g).length)
    const t1 = isotropicViscosity.length > 0 && isotropicRanks.every(r => r === 12)
    const leastRank = leastRankGroups(table).groups
    const leastCommutantMin = Math.min(...leastRank.map(commutant))

    // THE 15 FROZEN-FREE GROUPS
    const free = leastRank.filter(g => frozenOf(forcedForms(table, g)) === 0)
    const rows = free.map((g, index) => {
      const perms = g.map(x => [...(table.permutations[x] ?? [])])
      const forms = forcedForms(table, g)
      const rotations = rotationMaps({ permutations: table.permutations, group: perms })
      const set = scatterMoves({ group: perms, forms, rotation: rotations[0] })
      const m = g.map(x => mats[x] ?? [])

      return {
        index,
        group: g,
        perms,
        forms,
        set,
        order: g.length,
        rank: forms.length,
        frozen: frozenOf(forms),
        minus: g.includes(table.minus),
        spread2: forcedIsotropySpread({ group: m, rank: 2, generic: GENERIC, samples }),
        spread4: forcedIsotropySpread({ group: m, rank: 4, generic: GENERIC, samples }),
        commutant: commutant(g),
        moves: set.moves.length,
        rotationMaps: rotations.length,
      }
    })
    const t2 = rows.length === 15 && rows.every(r => r.spread2 < 1e-12 && r.rank === 8 && r.frozen === 0 && r.commutant >= 2 - 1e-9)
    const chosen = [...rows].sort((a, b) => b.moves - a.moves || b.order - a.order || a.spread4 - b.spread4)[0] ?? rows[0]!

    // THE KNIT
    const knitOf = (): ColdQuaternionKnit => makeColdQuaternionKnit({ mode: 'scatter', scatter: chosen.set })
    const rand = weylStream(5)
    const randomDock = () => {
      const fill = rand()
      const vibe = Array.from({ length: 24 }, () => (rand() < fill ? (rand() < 0.5 ? 1 : -1) : 0))

      return { vibe, store: vibe.map(v => (v === 0 ? 0 : rand() < 0.5 ? 0 : Math.floor(rand() * 5))), counter: new Array<number>(6).fill(0) }
    }
    const actOn = (p: readonly number[], tau: number, d: { vibe: ArrayLike<number>; store: ArrayLike<number> }) => {
      const vibe = new Array<number>(24).fill(0)
      const store = new Array<number>(24).fill(0)

      for (let k = 0; k < 24; k++) {
        vibe[p[k] ?? 0] = tau * (d.vibe[k] ?? 0)
        store[p[k] ?? 0] = d.store[k] ?? 0
      }

      return { vibe, store, counter: new Array<number>(6).fill(0) }
    }
    const knit = knitOf()
    let equivariance = 0
    let reversal = 0
    let cpt = 0

    for (let k = 0; k < 3000; k++) {
      const d = randomDock()
      const out = collideDockCopy(knit, d, true)

      for (const g of chosen.perms) {
        const lhs = collideDockCopy(knit, actOn(g, 1, d), true)
        const rhs = actOn(g, 1, out)

        if (!same(lhs.vibe, rhs.vibe) || !same(lhs.store, rhs.store)) equivariance++
      }

      const back = collideDockCopy(knit, out, false)

      if (!same(back.vibe, d.vibe) || !same(back.store, d.store)) reversal++

      const neg = collideDockCopy(knit, { vibe: d.vibe.map(x => -x), store: d.store, counter: d.counter }, false)

      if (!same(neg.vibe, Array.from(out.vibe, x => -x)) || !same(neg.store, out.store)) cpt++
    }

    const states = Array.from({ length: 300 }, randomDock)
    const images = states.map(d => collideDockCopy(knit, d, true))
    const glides: number[] = []

    table.permutations.forEach((p, index) => {
      for (const tau of [1, -1]) {
        if (states.every((d, k) => {
          const lhs = collideDockCopy(knit, actOn(p, tau, d), true)
          const rhs = actOn(p, tau, images[k] ?? d)

          return same(lhs.vibe, rhs.vibe) && same(lhs.store, rhs.store)
        })) glides.push(index)
      }
    })

    const glideMatrices = matrixGroupClosure(glides.map(i => mats[i] ?? []))
    const glideSpread2 = forcedIsotropySpread({ group: glideMatrices, rank: 2, generic: GENERIC, samples })
    const glideSpread4 = forcedIsotropySpread({ group: glideMatrices, rank: 4, generic: GENERIC, samples })
    const containsGroup = chosen.group.every(x => glides.includes(x))

    // exact laws with local color, side 3
    const laws = (() => {
      const mesh = d4BoxMesh({ side: 3 })
      const lattice = makeColdQuaternionLattice(mesh, knitOf())
      const size = mesh.cellCount * 24
      const vibe = Int8Array.from({ length: size }, (_, i) => {
        const u = ((i + 1) * GOLDEN * 1.37) % 1

        return u < 0.3 ? -1 : u < 0.6 ? 0 : 1
      })
      const start: ColdQuaternionState = {
        vibe,
        store: Int32Array.from({ length: size }, (_, i) => (vibe[i] === 0 ? 0 : Math.floor((((i + 7) * GOLDEN * 2.3) % 1) * 5))),
        counter: new Int32Array(mesh.cellCount * 6),
        role: Int8Array.from({ length: size }, (_, i) => Math.floor(((i + 3) * GOLDEN * 1.37 * 9) % 9)),
      }
      const lines = (v: ArrayLike<number>, base: number): number[] => COLD_FIRSTS.map(d => Math.abs(v[base + d] ?? 0) - Math.abs(v[base + (COLD_OPPOSITE[d] ?? 0)] ?? 0))
      const e0 = coldQuaternionEnergy(start)
      const m0 = coldQuaternionMomenta(start)
      const q0 = vibe.reduce((a, b) => a + b, 0)
      let s = start
      let exact = true
      let leaks = 0
      let breaks = 0

      for (let t = 0; t < 48; t++) {
        const a = { vibe: Int8Array.from(s.vibe), store: Int32Array.from(s.store), counter: Int32Array.from(s.counter), role: Int8Array.from(s.role ?? []), token: undefined }

        for (let x = 0; x < mesh.cellCount; x++) {
          const color = dockColor(a.vibe, a.role, x)
          const before = lines(a.vibe, x * 24)

          coldQuaternionCollide(knit, a, x, true)

          const after = lines(a.vibe, x * 24)

          leaks += dockColor(a.vibe, a.role, x) === color ? 0 : 1

          for (const row of chosen.forms) {
            if (Math.abs(row.reduce((acc, c, l) => acc + c * ((after[l] ?? 0) - (before[l] ?? 0)), 0)) > 1e-9) breaks++
          }
        }

        s = coldQuaternionBeat(lattice, s)

        const m = coldQuaternionMomenta(s)

        exact = exact && coldQuaternionEnergy(s) === e0 && s.vibe.reduce((x, y) => x + y, 0) === q0 && m.p.every((x, k) => x === m0.p[k]) && m.pe.every((x, k) => x === m0.pe[k])
      }

      for (let t = 47; t >= 0; t--) s = coldQuaternionBeatBack(lattice, s)

      return { exact, leaks, breaks, reverses: same(s.vibe, start.vibe) && same(s.store, start.store) && same(s.role ?? [], start.role ?? []) }
    })()

    // firing in the gas (fill 0.2, L = 16, 24 beats)
    const gasKnit = knitOf()
    const gas = (() => {
      const side = 16
      const mesh = d4Mesh({ side })
      const lattice = makeColdQuaternionLattice(mesh, gasKnit)
      let s: ColdQuaternionState = { ...emptyColdState(mesh), vibe: weylWaveStart({ mesh, side, geometry: { momentum: [1, 0, 0, 0], wave: [0, 1, 0, 0] }, mode: 1, fill: 0.2, bias: 0.4 }) }

      for (let t = 0; t < 24; t++) s = coldQuaternionBeat(lattice, s)

      return { fired: gasKnit.tally.fired / (mesh.cellCount * 24), blocked: gasKnit.tally.blocked / (mesh.cellCount * 24) }
    })()

    // dressing, sides 7 and 9
    let loneLargest = 0

    for (const side of [7, 9]) {
      const mesh = d4BoxMesh({ side })
      const lattice = makeColdQuaternionLattice(mesh, knitOf())
      const center = Math.floor(side / 2) * (1 + side + side * side + side ** 3)

      for (const tone of [1, -1]) for (const store of [0, 5]) for (let d = 0; d < 24; d++) {
        let s = emptyColdState(mesh)

        s.vibe[center * 24 + d] = tone
        s.store[center * 24 + d] = store

        for (let t = 0; t < 96; t++) {
          s = coldQuaternionBeat(lattice, s)

          let support = 0

          for (let i = 0; i < s.vibe.length; i++) support += s.vibe[i] !== 0 || s.store[i] !== 0 ? 1 : 0

          loneLargest = Math.max(loneLargest, support)
        }
      }
    }

    // connectivity and walls
    const box5 = d4BoxMesh({ side: 5 })
    const vacuumSectors = coldLineSectors(knitOf(), false, box5)
    const denseSectors = coldLineSectors(knitOf(), true, box5)
    const committedRule: ScheduledRule = (o, f) => turningWeave({ opposite: o, forward: f })
    const combinedRule: ScheduledRule = (o, f) => combinedCollision({ spec: COMBINED_DEFAULT, opposite: o, forward: f })
    const committedVacuum = lineSectors(committedRule, false)
    const combinedVacuum = lineSectors(combinedRule, false)
    let vacuum = emptyColdState(box5)
    let vacuumStill = true
    const vacuumLattice = makeColdQuaternionLattice(box5, knitOf())

    for (let t = 0; t < 48; t++) {
      vacuum = coldQuaternionBeat(vacuumLattice, vacuum)
      vacuumStill = vacuumStill && vacuum.vibe.every(x => x === 0)
    }

    const quantum = fearPortReading(knitOf())
    const hydro = hydroBattery(coldGas('frozenFree', knitOf), { sides: [12, 16, 20], soundSides: [12, 16, 20] })
    const combinedHydro = hydroBattery(
      toneGas('combined', side => combinedCollision({ spec: COMBINED_DEFAULT, opposite: meshOpposites(d4Mesh({ side })) })),
      { sides: [16], soundSides: [16] },
    )

    const k1 = equivariance === 0 && containsGroup && reversal === 0 && cpt === 0
    const k2 = laws.exact && laws.leaks === 0 && laws.breaks === 0 && laws.reverses
    const k3 = loneLargest === 1
    const k4 = hydro.husk.every(h => h.law) && hydro.sound.every(s => s.runs.every(r => r.oscillates && r.speed < 1)) && hydro.huskNuSpread <= 1.1 && hydro.energyExact
    const k5 = Object.values(quantum.gates).every(Boolean)
    const k6 = huskComponents(vacuumSectors) <= huskComponents(committedVacuum) && !vacuumStill
    const status = t1 && t2 && k1 && k2 && k3 && k4 && k5 && k6 ? 'pass' : t1 && t2 && k1 && k2 && k3 && k5 ? 'partial' : 'fail'
    const q8 = quaternionGroup()

    void q8
    void ROOTS

    return verdict({
      status,
      claim:
        'every subgroup of W(F4) that forces an isotropic viscosity keeps all 12 line momenta once local color is exact, so an isotropic viscosity can only be emergent; the 15 frozen-free least-rank groups force rank-2 isotropy and no viscosity; the cold knit on the chosen one keeps its symmetry, CPT, every exact law and zero dressing; its husk hydrodynamics, connectivity and quantum gates are as the gate metrics say',
      metrics: {
        sylowSubgroups: sylow.size,
        ...Object.fromEntries([...new Set(sylowRanks)].map(r => [`sylowForcedRank${r}`, sylowRanks.filter(x => x === r).length])),
        overgroupsOfSylow: overgroups.size,
        groupsForcingIsotropicViscosity: isotropicViscosity.length,
        ...Object.fromEntries(isotropicViscosity.map((g, i) => [`isotropicViscosityGroup${i}Order`, g.length])),
        isotropicViscosityGroupsLeastForcedRank: Math.min(...isotropicRanks),
        wf4Commutant: commutant(all),
        leastRankGroups: leastRank.length,
        leastRankGroupsLeastCommutant: leastCommutantMin,
        frozenFreeGroups: rows.length,
        ...Object.fromEntries(rows.flatMap(r => [
          [`free${r.index}Order`, r.order],
          [`free${r.index}Commutant`, r.commutant],
          [`free${r.index}Spread4`, Number(r.spread4.toFixed(4))],
          [`free${r.index}Quads`, r.set.quads],
          [`free${r.index}Rotations`, r.set.rotations],
          [`free${r.index}HoldsMinusOne`, r.minus ? 1 : 0],
        ])),
        frozenFreeLargestSpread2: Math.max(...rows.map(r => r.spread2)),
        chosenGroup: chosen.index,
        chosenOrder: chosen.order,
        chosenQuads: chosen.set.quads,
        chosenRotations: chosen.set.rotations,
        chosenSpread4: chosen.spread4,
        chosenCommutant: chosen.commutant,
        equivarianceFailures: equivariance,
        reversalFailures: reversal,
        cptFailures: cpt,
        glides: glides.length,
        glideGroupOrder: glideMatrices.length,
        glideContainsGroup: containsGroup ? 1 : 0,
        glideSpreadRank2: Number(glideSpread2.toExponential(2)),
        glideSpreadRank4: Number(glideSpread4.toFixed(4)),
        lawsExact: laws.exact ? 1 : 0,
        colorLeaks: laws.leaks,
        forcedFormBreaks: laws.breaks,
        reverses: laws.reverses ? 1 : 0,
        gasMovesFiredPerDockBeat: gas.fired,
        gasDocksBlockedPerDockBeat: gas.blocked,
        loneLargestSupport: loneLargest,
        vacuumStillSoNoWalls: vacuumStill ? 1 : 0,
        vacuumLineComponents: vacuumSectors.length,
        denseLineComponents: denseSectors.length,
        huskVacuumComponents: huskComponents(vacuumSectors),
        huskDenseComponents: huskComponents(denseSectors),
        ...hydroMetrics('free', hydro),
        ...Object.fromEntries(Object.entries(quantum.metrics).map(([k, v]) => [`quantum_${k}`, v])),
        ...Object.fromEntries([t1, t2, k1, k2, k3, k4, k5, k6].map((g, i) => [['T1', 'T2', 'K1', 'K2', 'K3', 'K4', 'K5', 'K6'][i] ?? `g${i}`, g ? 1 : 0])),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        ...hydroMetrics('combined', combinedHydro),
        committedVacuumLineComponents: committedVacuum.length,
        committedHuskVacuumComponents: huskComponents(committedVacuum),
        combinedVacuumLineComponents: combinedVacuum.length,
        combinedHuskVacuumComponents: huskComponents(combinedVacuum),
        ...Object.fromEntries(Object.entries(quantum.control).map(([k, v]) => [`quantum_${k}`, v])),
      },
      notes: 'L2. See the header.',
    })
  },
})
