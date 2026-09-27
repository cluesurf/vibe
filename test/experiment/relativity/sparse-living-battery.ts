// The living-pair knit on the SPARSE living vacuum through E-FRC-0159's battery, gate for gate, beside the combined
// knit H, and its husk transport (E-RLT-0079).
//
// STATUS (2026-09-26): partial at the default integer link start since the frame fix (E-RLT-0088; fail before it).
// The X1 instrument gate fails because the swap-phase control reads 0 at the battery's own frame once the comoving
// own points are carried, so the verdict on the knit is not reached. All 14 quantum gates pass, but against H 6 gates
// newly fail and the husk transport is uniaxial at leading order. Not run over E-MTH-0028's start family.
//
// THE RULE: code/rule/living-pair-knit, schedule 'alternate', unchanged (E-RLT-0074, E-RLT-0075). THE VACUUM: the
// sparse living vacuum of E-RLT-0077, one line (line 0) stored on every dock with the separated layout, the simplest
// pattern that meets the derived condition (Z) and runs the exact period-6 cycle. The cold vacuum (no store) is read
// beside it as before.
//
// THE REFERENCE AND THE RULE OF ADOPTION: E-RLT-0070's and E-RLT-0075's, unchanged (E-FRC-0159 rerun 2026-09-26 under
// the comoving fear beat and the exact kernels, configuration H; constants copied from E-RLT-0075's file). The items
// are code/measure/sparse-living-battery: E-RLT-0075's battery with the store pattern in place of the one store trit,
// every other item and transcription change as E-RLT-0075 fixed them.
//
// THE HUSK TRANSPORT (the second question). E-RLT-0075's exact 72-index singlet linearization reads a product
// background with ONE store law on every line, the maximum-entropy background (rho 2/3, every store value 1/3), which
// does not see the vacuum at all: at that background this rule's exponents are E-RLT-0075's by construction, and they
// are reported as the reference. What the sparse vacuum changes is the ORIENTATION: its stored line picks the root of
// line 0. So the transport is read a second time at an ORIENTED background (code/measure/sparse-living-vacuum's
// orientedLinearization, the same chain construction with a store law per line): rho 2/3, equal points 1/9, line 0's
// store law half the vacuum's (+1) and half uniform, [2/3, 1/6, 1/6], every other line's half the vacuum's (0) and
// half uniform, [1/6, 1/6, 2/3]. This choice is made before any number of it is seen.
// DERIVED before running: the oriented background keeps only the 48 coin maps that fix the root r of line 0, and those
// keep the rank-two tensor r r^T, so nothing forces the husk charge diffusion, the momentum-sector trace or the sound
// isotropic at leading order: the prediction is a uniaxial medium, exponents near 0 where the symmetric background gives
// 4, unless the orientation fails to reach the linear transport (E-RLT-0070 found the full hot vacuum's orientation
// reached no husk coefficient at leading order).
//
// Gates, fixed before the first run:
//  X0 the kernel agrees with livingBeat bit for bit on the side-3 box for 48 beats, on the golden fill with the one-line
//     store, the all-line store and no store, and on E-RLT-0067's Kronecker start, the veto acting
//  X1 the battery's controls hold on both quantum runs (E-RLT-0070's X1)
//  XT the linearizations: orientedLinearization with every line on one law reproduces livingLinearization at the
//     symmetric background to 1e-12 in both collisions; each oriented collision matrix agrees with a 200,000-dock
//     oriented Kronecker estimate from the full rule to 0.02, commutes with the 48 coin maps fixing line 0's root to
//     1e-10 and not with all 1,152 (defect above 1e-6); each period map keeps exactly 6 invariants
//  C  the adoption condition, E-RLT-0070's: (a) no gate that H passes fails here, and (b) every quantum gate passes with
//     the fear beat on; a gate that cannot be evaluated counts as failing
//  HT the husk transport at the ORIENTED background: charge, trace and sound exponents at least 3.5 and the shear 2 +-
//     0.5, each over the three longest rungs (E-RLT-0075's reading)
// Verdict: pass if X0, X1, XT, C and HT hold; fail if X0, X1 and XT hold and C or HT does not; partial otherwise.
//
// PREDICTED before running: C fails on the four dressing gates (E-RLT-0077's G5 reason: the lone love's 60-degree wake
// is flat near 250 trits per period, above the committed 33 and 160; sides 7 and 11 likewise); the quantum gates pass as
// on E-RLT-0075 (the vacuum pair is again a line-0 unit of dock 0, with the same meetings); HT fails (uniaxial).
//
// Reported, not gated: the symmetric-background exponents (E-RLT-0075's reference), the oriented anisotropies per rung,
// the cold vacuum's classical items, the dressing per period against the committed knit, the Standard Model readings
// (the coin maps kept, the lone-love response on the one-line vacuum, the A2 planes splitting the copies), and the trade
// table against H, E-RLT-0070's candidate and E-RLT-0075's full living vacuum.
//
// DISCLOSED: E-RLT-0075's post-run probes of the one-line vacuum's wake (tmp/live-probe3.ts, live-probe4.ts) are the
// only numbers of this vacuum's battery seen before this file.
//
// FIRST RUN (110.3 s): fail, recorded as is (X0, X1, XT hold; C and HT fail, as predicted, with one unpredicted
// failure: vacuumComponentsNoMore, 4 line components on the vacuum against the committed 3). Title rewritten after the
// run; no logic changed. The trade table's E-RLT-0070 and E-RLT-0075 columns are read from their newly-failing lists.
//
// Depth L2. DETERMINISM: the battery's golden and dense fills, Kronecker starts and docks (Weyl orbits), fixed frames
// and layouts, golden-spiral directions, no draw.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  additivityWorst,
  boxGates,
  dressing,
  layoutOf,
  lineComponents,
  quantum,
  reversalAndCharge,
  travel,
  vacuumPeriod,
  walls,
  weaveOf,
  type LivingDressing,
  type QuantumRun,
} from '@/code/measure/sparse-living-battery'
import { coinMapLedger, cptAtCollision, generationCopies, loneResponse } from '@/code/measure/living-pair-battery'
import { goldenFill } from '@/code/measure/candidate-kernel'
import { livingKernelAgreement } from '@/code/measure/living-pair-kernel'
import { makeLivingKnit } from '@/code/rule/living-pair-knit'
import { storeStart } from '@/code/measure/token-store-gates'
import { isometricTable, LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { STORE_N, UNIFORM, type Background } from '@/code/measure/token-store-linearization'
import { livingLinearization } from '@/code/measure/living-pair-linearization'
import { pairEquivarianceDefect } from '@/code/measure/pair-knit-linearization'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { invariantsOf, readStoreTransport, storeExponents, storeSpectrum, type Named, type Space } from '@/code/measure/store-transport'
import { huskDirections } from '@/code/measure/husk-transport-order'
import { ALL_LINES, boxStore, ONE_LINE, orientedLinearization, sampledOrientedLinearization, sparseLivingState, type Law, type StorePattern } from '@/code/measure/sparse-living-vacuum'

// ---- the reference: E-FRC-0159 rerun 2026-09-26 (comoving beat, exact kernels), copied from E-RLT-0075 ----

const COMMITTED = {
  vacuumComponents: 3,
  denseComponents: 1,
  side9Love: [33, 160, 565, 1508],
  side9Fear: [27, 163, 581, 1501],
  side7Love: [33, 131, 420, 1204],
  side7Fear: [27, 135, 474, 1385],
  side11Love: [33, 209, 755, 2241],
  side11Fear: [27, 218, 824, 2390],
}
const CLASSICAL_GATES = [
  'reverses',
  'chargeKept',
  'cptAtMirrorPhase',
  'vacuumPeriodic',
  'vacuumComponentsNoMore',
  'denseComponentsNoMore',
  'superposition',
  'wallsQuantized',
  'loveDressingSide9',
  'fearDressingSide9',
  'loveDressingSide7',
  'fearDressingSide7',
  'loveDressingSide11',
  'fearDressingSide11',
  'boxReverses',
  'boxChargeKept',
  'noColorLeak',
  'frameCommutes',
  'momentumKept',
  'lineMomentaExchanged',
] as const
const QUANTUM_GATES = [
  'tokenSignsKept',
  'knotsPure',
  'fearShareUnderThird',
  'fearsMade',
  'reversesInFixedUnits',
  'loveMinusFearKept',
  'frameCommutesVacuum',
  'frameCommutesMatter',
  'storageVacuum',
  'storageMatter',
  'storageGrower',
  'kernelsUnital',
  'interferenceBeyondStandIn',
  'chshAbove2',
] as const
const passAll = (names: readonly string[]): Record<string, boolean> => Object.fromEntries(names.map(n => [n, true]))
const H_GATES: Record<string, boolean> = { ...passAll(CLASSICAL_GATES), fearDressingSide9: false, fearDressingSide11: false, ...passAll(QUANTUM_GATES) }
// E-RLT-0070's candidate: the gates it newly failed against H
const CANDIDATE_NEWLY_FAILING = [
  'loveDressingSide9',
  'loveDressingSide7',
  'fearDressingSide7',
  'loveDressingSide11',
  'knotsPure',
  'fearShareUnderThird',
  'frameCommutesVacuum',
  'storageVacuum',
  'interferenceBeyondStandIn',
  'chshAbove2',
]
// E-RLT-0075's full living vacuum: the gates it newly failed against H (its log, tmp/live-living-pair-battery.log)
const LIVING_NEWLY_FAILING = ['superposition', 'wallsQuantized', 'loveDressingSide9', 'loveDressingSide7', 'fearDressingSide7', 'loveDressingSide11']

const noMore = (xs: readonly number[], ref: readonly number[]): boolean => xs.every((x, p) => x <= (ref[p] ?? 0))

type Classical = { gates: Record<string, boolean>; numbers: Record<string, number>; love9: LivingDressing; fear9: LivingDressing }

function classicalOn(pattern: StorePattern, log: (what: string) => void): Classical {
  const rc = reversalAndCharge(pattern)
  const cpt = cptAtCollision()
  const period = vacuumPeriod(pattern)
  const vac = lineComponents(pattern, false)
  const dense = lineComponents(pattern, true)

  log('  components')

  const additivity = additivityWorst(pattern)
  const wall = walls(pattern)

  log('  walls')

  const love9 = dressing(pattern, 9, 1)
  const fear9 = dressing(pattern, 9, -1)
  const love7 = dressing(pattern, 7, 1)
  const fear7 = dressing(pattern, 7, -1)

  log('  dressing 9, 7')

  const love11 = dressing(pattern, 11, 1)
  const fear11 = dressing(pattern, 11, -1)

  log('  dressing 11')

  const moving = travel(pattern)
  const box = boxGates(pattern)
  const gates: Record<string, boolean> = {
    reverses: rc.reverses,
    chargeKept: rc.chargeKept,
    cptAtMirrorPhase: cpt.phase >= 0,
    vacuumPeriodic: period > 0,
    vacuumComponentsNoMore: vac.trits <= COMMITTED.vacuumComponents,
    denseComponentsNoMore: dense.trits <= COMMITTED.denseComponents,
    superposition: additivity < 1e-9,
    wallsQuantized: wall.quantized && wall.settledMax > 0,
    loveDressingSide9: noMore(love9.periodLargest, COMMITTED.side9Love),
    fearDressingSide9: noMore(fear9.periodLargest, COMMITTED.side9Fear),
    loveDressingSide7: noMore(love7.periodLargest, COMMITTED.side7Love),
    fearDressingSide7: noMore(fear7.periodLargest, COMMITTED.side7Fear),
    loveDressingSide11: noMore(love11.periodLargest, COMMITTED.side11Love),
    fearDressingSide11: noMore(fear11.periodLargest, COMMITTED.side11Fear),
    boxReverses: box.boxReverses === 1,
    boxChargeKept: box.boxChargeKept === 1,
    noColorLeak: box.boxColorLeaks === 0,
    frameCommutes: box.boxFrameMismatch === 0,
    momentumKept: box.pDrift === 0,
    lineMomentaExchanged: (box.lineMomentumDrift ?? 0) > 0,
  }
  const periods = (prefix: string, xs: readonly number[]): Record<string, number> => Object.fromEntries(xs.map((x, p) => [`${prefix}Period${p + 1}`, x]))

  return {
    gates,
    love9,
    fear9,
    numbers: {
      ...box,
      cptFailures: cpt.failures,
      cptCases: cpt.cases,
      vacuumPeriod: period,
      vacuumComponents: vac.trits,
      vacuumComponentsVibes: vac.vibes,
      denseComponents: dense.trits,
      denseComponentsVibes: dense.vibes,
      additivityWorst: additivity,
      wallQuantized: wall.quantized ? 1 : 0,
      wallSettledMax: wall.settledMax,
      wallSettledMaxVibes: wall.settledMaxVibes,
      travellers: moving.travellers,
      travelFullSpeed: moving.fullSpeed,
      travelMeanReach: moving.meanReach,
      protectedSpecies: love9.protectedSpecies,
      straightLoves: love9.straight,
      straightFears: fear9.straight,
      ...periods('side9Love', love9.periodLargest),
      ...periods('side9Fear', fear9.periodLargest),
      ...periods('side9LoveVibes', love9.periodLargestVibes),
      ...periods('side9FearVibes', fear9.periodLargestVibes),
      ...periods('side7Love', love7.periodLargest),
      ...periods('side7Fear', fear7.periodLargest),
      ...periods('side11Love', love11.periodLargest),
      ...periods('side11Fear', fear11.periodLargest),
    },
  }
}

// ---- the husk transport ----

const ROOTS = rootsD4()
const N = STORE_N
const LADDER = [4, 8, 16, 32, 64, 128, 256]
const SPACE: Space = { n: N, roots: Array.from({ length: N }, (_, i) => (i < 48 ? ROOTS[i >> 1] : undefined)) }
const NAMED: Named = {
  charge: Float64Array.from({ length: N }, (_, i) => (i < 48 ? (i % 2 === 0 ? 1 : -1) : 0)),
  momentumAlong: u => Float64Array.from({ length: N }, (_, i) => (i < 48 ? (ROOTS[i >> 1] as number[]).reduce((s, x, k) => s + x * (u[k] ?? 0), 0) : 0)),
}
const STORED_LAW: Law = [2 / 3, 1 / 6, 1 / 6]
const EMPTY_LAW: Law = [1 / 6, 1 / 6, 2 / 3]
const ORIENTED: Background = { rho: 2 / 3, store: [1 / 3, 1 / 3, 1 / 3], equal: 1 / 9 }

const worstOf = (a: Float64Array, b: Float64Array): number => {
  let w = 0

  for (let i = 0; i < a.length; i++) w = Math.max(w, Math.abs((a[i] as number) - (b[i] as number)))

  return w
}

type TransportRead = { metrics: Record<string, number>; three: Record<string, number>; invariants: number }

function readTransport(matrices: Float64Array[], prefix: string): TransportRead {
  const invariants = invariantsOf(SPACE, matrices)
  const s = storeSpectrum(SPACE, NAMED, matrices, invariants)
  const kc = Math.sqrt(s.gap / s.dMax)
  const reading = readStoreTransport({ space: SPACE, named: NAMED, matrices, invariants, ks: LADDER.map(r => kc / r), directions: huskDirections(24) })
  const five = storeExponents(reading, 5)
  const three: Record<string, number> = {}
  const metrics: Record<string, number> = { [`${prefix}_invariants`]: invariants.length, [`${prefix}_kc`]: kc }

  for (const q of ['charge', 'trace', 'sound', 'shear']) {
    const c = reading.series[q] ?? []

    three[q] = Math.log((c[0] ?? 1) / (c[2] ?? 1)) / Math.log(4)
    metrics[`${prefix}_husk_${q}_exponent3`] = three[q] as number
    metrics[`${prefix}_husk_${q}_exponent5`] = five[q]?.slope ?? Number.NaN
    metrics[`${prefix}_husk_${q}_mean`] = reading.means[q] ?? Number.NaN
    c.forEach((a, rung) => {
      metrics[`${prefix}_husk_${q}_anisotropy_rung${LADDER[rung]}`] = a
    })
  }

  return { metrics, three, invariants: invariants.length }
}

function transport(): { metrics: Record<string, number>; xt: boolean; ht: boolean; list: string; symmetricList: string } {
  const table = isometricTable()
  const permutations = weylF4DirectionPermutations({ directions: ROOTS })
  const f0 = LINE_FIRSTS[0] as number
  const stabilizer = permutations.filter(g => g[f0] === f0)
  const uniformLaws: Law[] = LINE_FIRSTS.map(() => UNIFORM.store)
  const laws: Law[] = LINE_FIRSTS.map((_, l) => (ONE_LINE[l] === 1 ? STORED_LAW : EMPTY_LAW))
  const even = livingLinearization({ table, background: UNIFORM, mode: 'PK' })
  const odd = livingLinearization({ table, background: UNIFORM, mode: 'KP' })
  const evenCheck = orientedLinearization({ table, background: UNIFORM, mode: 'PK', laws: uniformLaws })
  const oddCheck = orientedLinearization({ table, background: UNIFORM, mode: 'KP', laws: uniformLaws })
  const orientedEven = orientedLinearization({ table, background: ORIENTED, mode: 'PK', laws })
  const orientedOdd = orientedLinearization({ table, background: ORIENTED, mode: 'KP', laws })
  const knit = makeLivingKnit(weaveOf(3))
  const sampledEven = sampledOrientedLinearization({ knit, background: ORIENTED, laws, samples: 200_000, t: 0 })
  const sampledOdd = sampledOrientedLinearization({ knit, background: ORIENTED, laws, samples: 200_000, t: 1 })
  const symmetric = readTransport([even, odd], 'symmetric')
  const oriented = readTransport([orientedEven, orientedOdd], 'oriented')
  const stabilizerDefect = Math.max(pairEquivarianceDefect(orientedEven, stabilizer), pairEquivarianceDefect(orientedOdd, stabilizer))
  const fullDefect = Math.max(pairEquivarianceDefect(orientedEven, permutations), pairEquivarianceDefect(orientedOdd, permutations))
  const metrics: Record<string, number> = {
    reproduceEven: worstOf(evenCheck, even),
    reproduceOdd: worstOf(oddCheck, odd),
    sampledEvenWorst: worstOf(sampledEven, orientedEven),
    sampledOddWorst: worstOf(sampledOdd, orientedOdd),
    stabilizerSize: stabilizer.length,
    stabilizerDefect,
    fullDefect,
    ...symmetric.metrics,
    ...oriented.metrics,
  }
  const xt =
    (metrics.reproduceEven ?? 1) < 1e-12 &&
    (metrics.reproduceOdd ?? 1) < 1e-12 &&
    (metrics.sampledEvenWorst ?? 1) < 0.02 &&
    (metrics.sampledOddWorst ?? 1) < 0.02 &&
    stabilizer.length === 48 &&
    stabilizerDefect < 1e-10 &&
    fullDefect > 1e-6 &&
    symmetric.invariants === 6 &&
    oriented.invariants === 6
  const t = oriented.three
  const ht = (t.charge ?? 0) >= 3.5 && (t.trace ?? 0) >= 3.5 && (t.sound ?? 0) >= 3.5 && Math.abs((t.shear ?? 0) - 2) <= 0.5
  const fmt = (r: Record<string, number>): string => ['charge', 'trace', 'sound', 'shear'].map(q => `${q} ${(r[q] ?? Number.NaN).toFixed(2)}`).join(', ')

  return { metrics, xt, ht, list: fmt(oriented.three), symmetricList: fmt(symmetric.three) }
}

export default experiment({
  id: 'relativity/sparse-living-battery',
  code: 'E-RLT-0079',
  title:
    "the living-pair knit on the one-line living vacuum through E-FRC-0159's battery, partial at the default integer start since the frame fix (E-RLT-0088; fail before it): with the comoving own points carried by the frame change, the swap-phase control reads 0 at the battery's own frame, so the X1 instrument gate fails and the verdict on the knit is not reached (partial marks an instrument that could not fire, not a knit that came closer); all 14 quantum gates pass (CHSH 2.552) and superposition returns, but against the combined knit H 6 gates newly fail (the four dressing gates, walls, and vacuum line components 4 against 3), and at a background oriented like the vacuum the husk transport is uniaxial at leading order (charge and trace anisotropy exponents 0.02, sound 0.70, shear 0.18; charge anisotropy flat at 4.1e-3), where the maximum-entropy background, which does not see the vacuum, keeps 4.00, 4.11, 4.04 and 2.03",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // X0
    const w3 = weaveOf(3)
    const cells3 = w3.mesh.cellCount
    const slots3 = cells3 * 24
    const knit3 = makeLivingKnit(w3)
    const agreements = [
      ...[ONE_LINE, ALL_LINES, ALL_LINES.map(() => 0)].map(pattern =>
        livingKernelAgreement({ knit: knit3, start: sparseLivingState({ ...goldenFill(slots3, 1.37), store: boxStore(cells3, pattern), layout: layoutOf(3) }), beats: 48 }),
      ),
      livingKernelAgreement({ knit: knit3, start: storeStart(cells3, 11), beats: 48 }),
    ]
    const x0 = agreements.every(a => a.mismatches === 0) && agreements.every(a => a.vetoed > 0)

    log('x0')

    const hot = classicalOn(ONE_LINE, log)

    log('classical one-line')

    const cold = classicalOn(ALL_LINES.map(() => 0), log)

    log('classical cold')

    const runs: Record<string, QuantumRun> = { on: quantum(ONE_LINE, 'on'), off: quantum(ONE_LINE, 'off') }

    log('quantum')

    const ledger = coinMapLedger()
    const responseSparse = loneResponse(ONE_LINE)
    const generations = generationCopies(hot.love9, hot.fear9)

    log('readings')

    const tr = transport()

    log('transport')

    const x1 = (runs.on?.metrics.controlsHold ?? 0) === 1 && (runs.off?.metrics.controlsHold ?? 0) === 1
    const gatesHere: Record<string, boolean> = { ...hot.gates, ...(runs.on?.gates ?? {}) }
    const newlyFailing = Object.keys(H_GATES).filter(g => H_GATES[g] && !gatesHere[g])
    const newlyPassing = Object.keys(H_GATES).filter(g => !H_GATES[g] && gatesHere[g])
    const quantumFailing = QUANTUM_GATES.filter(g => !(runs.on?.gates[g] ?? false))
    const failsOnlyOn = QUANTUM_GATES.filter(g => (runs.off?.gates[g] ?? false) && !(runs.on?.gates[g] ?? false))
    const fixedFromCandidate = CANDIDATE_NEWLY_FAILING.filter(g => gatesHere[g])
    const fixedFromLiving = LIVING_NEWLY_FAILING.filter(g => gatesHere[g])
    const brokenAgainstLiving = newlyFailing.filter(g => !LIVING_NEWLY_FAILING.includes(g))
    const unevaluable = runs.on?.unevaluable ?? []
    const condition = newlyFailing.length === 0 && quantumFailing.length === 0
    const instruments = x0 && x1 && tr.xt
    const status = instruments ? (condition && tr.ht ? 'pass' : 'fail') : 'partial'
    const flatten = (prefix: string, record: Record<string, number | boolean>): Record<string, number> =>
      Object.fromEntries(Object.entries(record).map(([k, v]) => [`${prefix}_${k}`, typeof v === 'boolean' ? (v ? 1 : 0) : v]))
    const metrics: Record<string, number> = {
      worksWithEverything: condition ? 1 : 0,
      newlyFailingVsH: newlyFailing.length,
      newlyPassingVsH: newlyPassing.length,
      candidateFailuresFixed: fixedFromCandidate.length,
      livingFailuresFixed: fixedFromLiving.length,
      newFailuresAgainstLiving: brokenAgainstLiving.length,
      quantumGatesFailingOn: quantumFailing.length,
      quantumUnevaluable: unevaluable.length,
      failsOnlyWithFearOn: failsOnlyOn.length,
      kernelMismatchBeats: agreements.reduce((s, a) => s + a.mismatches, 0),
      kernelVetoes: agreements.reduce((s, a) => s + a.vetoed, 0),
      ...flatten('sparse_gate', hot.gates),
      ...flatten('sparse', hot.numbers),
      ...flatten('cold_gate', cold.gates),
      ...flatten('cold', cold.numbers),
      ...flatten('on_gate', runs.on?.gates ?? {}),
      ...flatten('off_gate', runs.off?.gates ?? {}),
      ...flatten('on', runs.on?.metrics ?? {}),
      ...flatten('off', runs.off?.metrics ?? {}),
      coinMapsKept: ledger.kept,
      orientationReversingKept: ledger.orientationReversingKept,
      orientationReversing: ledger.orientationReversing,
      loneResponseSelfDualSparse: responseSparse.selfDual,
      loneResponseAntiSelfDualSparse: responseSparse.antiSelfDual,
      loneResponseTraceSparse: responseSparse.symmetricTrace,
      generationPlanes: generations.planes,
      generationPlanesSplit: generations.split,
      ...flatten('transport', tr.metrics),
      seconds: (Date.now() - started) / 1000,
    }
    const m = metrics
    const list = (xs: readonly string[]): string => (xs.length > 0 ? xs.join(', ') : 'none')
    const per = (prefix: string): string => [1, 2, 3, 4].map(p => m[`${prefix}Period${p}`]).join(', ')
    const trade = CLASSICAL_GATES.concat(QUANTUM_GATES as unknown as typeof CLASSICAL_GATES)
      .map(g => `${g} H ${H_GATES[g] ? 'pass' : 'fail'} / 0070 ${CANDIDATE_NEWLY_FAILING.includes(g) ? 'fail' : H_GATES[g] ? 'pass' : 'fail'} / 0075 ${LIVING_NEWLY_FAILING.includes(g) ? 'fail' : H_GATES[g] ? 'pass' : 'fail'} / here ${gatesHere[g] ? 'pass' : 'fail'}`)
      .join('; ')

    return verdict({
      status: status as 'pass' | 'fail' | 'partial',
      claim: `the living-pair knit on the one-line living vacuum ${condition ? 'works' : 'does not work'} with everything by E-FRC-0159's rule: against the combined knit H ${newlyFailing.length} gates newly fail (${list(newlyFailing)}) and ${newlyPassing.length} newly pass; of E-RLT-0075's 6 it clears ${fixedFromLiving.length} (${list(fixedFromLiving)}); ${quantumFailing.length} of 14 quantum gates fail with the fear beat on; the vacuum pair is ${m.on_vacuumPairKind === 1 ? 'a line of place tokens' : m.on_vacuumPairKind === 0 ? 'a line of slot tokens' : 'absent'}, CHSH ${m.on_chsh?.toFixed(3)}; the lone-love wake per period on side 9 is ${per('sparse_side9Love')} trits (committed 33, 160, 565, 1,508); husk transport at the symmetric background ${tr.symmetricList}, at the oriented background ${tr.list}`,
      metrics,
      control: {
        committedSide9LovePeriod1: COMMITTED.side9Love[0] ?? 0,
        committedSide9LovePeriod4: COMMITTED.side9Love[3] ?? 0,
        candidateNewlyFailing: CANDIDATE_NEWLY_FAILING.length,
        livingNewlyFailing: LIVING_NEWLY_FAILING.length,
        ...flatten('H_gate', H_GATES),
      },
      notes: `L2. Gates: X0 ${x0}, X1 ${x1}, XT ${tr.xt}, C ${condition}, HT ${tr.ht}. Newly failing against H: ${list(newlyFailing)}. Newly passing: ${list(newlyPassing)}. Broken here that E-RLT-0075 kept: ${list(brokenAgainstLiving)}. Quantum gates failing with the fear beat on: ${list(quantumFailing)}; not evaluable: ${list(unevaluable)}; failing only with the fear beat on: ${list(failsOnlyOn)}. One-line vacuum (trits; vibes beside): period ${m.sparse_vacuumPeriod}, line components ${m.sparse_vacuumComponents} (${m.sparse_vacuumComponentsVibes}) and ${m.sparse_denseComponents} (${m.sparse_denseComponentsVibes}), superposition ${m.sparse_additivityWorst?.toExponential(2)}, wall ${m.sparse_wallSettledMax} trits (quantized ${m.sparse_wallQuantized}), side-9 love per period ${per('sparse_side9Love')} trits and ${per('sparse_side9LoveVibes')} vibes, fear ${per('sparse_side9Fear')} (committed 27, 163, 581, 1,501), side 7 love ${per('sparse_side7Love')} fear ${per('sparse_side7Fear')}, side 11 love ${per('sparse_side11Love')} fear ${per('sparse_side11Fear')}, travel ${m.sparse_travelFullSpeed} of 24 at full speed (${m.sparse_travellers} at half or more), straight lone loves ${m.sparse_straightLoves}. Cold: period ${m.cold_vacuumPeriod}, side-9 love ${per('cold_side9Love')}. Quantum: vacuum pair ${m.on_vacuumPairFirst}, ${m.on_vacuumPairSecond}, ${m.on_vacuumMeetings} meetings in 480 beats, fears at most ${m.on_vacuumFearsMax}, chances ${m.on_chanceAfterMeeting1?.toFixed(4)}, ${m.on_chanceAfterMeeting2?.toFixed(4)}, ${m.on_chanceAfterMeeting3?.toFixed(4)} against the stand-in's ${m.on_standIn1?.toFixed(4)}, ${m.on_standIn2?.toFixed(4)}, ${m.on_standIn3?.toFixed(4)}; matter CHSH ${m.on_matterChsh?.toFixed(3)}. Coin maps kept by the rule ${m.coinMapsKept}. Lone-love response on the one-line vacuum: self-dual ${m.loneResponseSelfDualSparse?.toExponential(2)}, anti-self-dual ${m.loneResponseAntiSelfDualSparse?.toExponential(2)}, trace ${m.loneResponseTraceSparse?.toFixed(2)}. A2 planes splitting the copies ${m.generationPlanesSplit} of ${m.generationPlanes}. Transport: reproduction ${m.transport_reproduceEven?.toExponential(1)} and ${m.transport_reproduceOdd?.toExponential(1)}, oriented sampled ${m.transport_sampledEvenWorst?.toFixed(4)} and ${m.transport_sampledOddWorst?.toFixed(4)}, stabilizer ${m.transport_stabilizerSize} defect ${m.transport_stabilizerDefect?.toExponential(1)}, full-group defect ${m.transport_fullDefect?.toExponential(2)}, invariants ${m.transport_symmetric_invariants} and ${m.transport_oriented_invariants}; symmetric ${tr.symmetricList}; oriented ${tr.list}; oriented charge anisotropy per rung ${LADDER.map(r => m[`transport_oriented_husk_charge_anisotropy_rung${r}`]?.toExponential(2)).join(', ')}. TRADE TABLE (gate: H / E-RLT-0070 / E-RLT-0075 / here): ${trade}. ${m.seconds?.toFixed(0)} s.`,
    })
  },
})
