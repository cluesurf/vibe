// The living-pair knit through E-FRC-0159's battery, gate for gate, beside the combined knit, and its husk transport
// (E-RLT-0075).
//
// STATUS (2026-09-26): partial at the default integer link start since the frame fix (E-RLT-0088; fail before it).
// The X1 instrument gate fails because the swap-phase control reads 0 at the battery's own frame once the comoving
// own points are carried, so the verdict on the knit is not reached. All 14 quantum gates pass and the husk transport
// is isotropic, but against H 6 gates newly fail and the box melts. Not run over E-MTH-0028's start family.
//
// THE RULE: code/rule/living-pair-knit, schedule 'alternate' (E-RLT-0074): the candidate knit of E-RLT-0070 (the pair-
// making isometric knit, the store that returns the unmade pair's tokens, the neutral veto) with the pair move applied
// once per beat, before the coin map on even beats and after it on odd ones. Its hot vacuum has period 6 and every
// vacuum pair streams two beats and meets its partner again, so the fear beat acts in the vacuum.
//
// THE REFERENCE AND THE RULE OF ADOPTION: E-RLT-0070's, unchanged (E-FRC-0159 as rerun 2026-09-26 under the adopted
// comoving fear beat and the exact kernels, configuration H; the constants below are copied from E-RLT-0070's file).
// The items are code/measure/living-pair-battery: E-RLT-0070's transcription with the beat replaced and four changes
// the living vacuum forces, named in that file's header and decided before any number was read (the vacuum run as the
// reference, the separated layout on every state, the vacuum pair searched among slot tokens then place tokens, the
// lone-love response read as the run's charge displacement against the vacuum run).
//
// THE HUSK TRANSPORT (the second question). E-RLT-0071's exact 72-index singlet linearization at the symmetric
// background, carried to the two collisions (code/measure/living-pair-linearization: the chain construction with the
// order of P and K a parameter), and the two-beat period map S A_(P K) then S A_(K P). Both collisions commute with
// W(F4), so the period map does, and the scalar law k^4 and the shear k^2 are forced by symmetry as in E-RLT-0065; the
// measurement adds whether the slow modes stay charge, energy and momentum. The husk is read (the ladder along husk
// directions, x4 = 0), the bulk not.
//
// PREDICTED BEFORE RUNNING (derived, not measured):
//  (i) the vacuum pair exists (place tokens, E-RLT-0074 G6) and meets every 3 beats, so the six quantum gates E-RLT-0070
//      could not evaluate become evaluable
//  (ii) the hot vacuum is dense (every dock full on the beats between making and unmaking), and a lone vibe in a full
//      dock changes its momentum away from 0, so K is no longer -1 there and the vacuum's vibes scatter: the wake is
//      expected to spread, and the dressing may well exceed the committed 33 in the first period (the gate decides)
//  (iii) the rule keeps all 1,152 coin maps, so the dock-level response has no handedness (E-RLT-0076 asks it fully)
//  (iv) the transport exponents: charge, trace and sound k^4, shear k^2, by symmetry
//
// Gates, fixed before the first run:
//  X0 the kernel agrees with livingBeat bit for bit on the side-3 box for 48 beats, on the golden fill with the hot,
//     cold and -1 store and on E-RLT-0067's Kronecker start, the veto acting
//  X1 the battery's controls hold on both quantum runs (E-RLT-0070's X1)
//  XT the linearization: its 'PKP' mode reproduces E-RLT-0071's storeLinearization to 1e-10; each collision's matrix
//     agrees with a 200,000-dock Kronecker estimate from the full rule (tokens, places, points) to 0.02 and commutes
//     with all 1,152 coin maps to 1e-10; the two-beat period map keeps exactly 6 invariants
//  C  the adoption condition, E-RLT-0070's: (a) no gate that H passes fails here, and (b) every quantum gate passes
//     with the fear beat on; a gate that cannot be evaluated counts as failing
//  HT the husk transport: charge, trace and sound exponents at least 3.5 and the shear 2 +- 0.5, each read over the
//     three longest rungs (k_c / 4 to k_c / 16), since E-RLT-0071 found the five-rung charge fit straddling the rounding
//     floor (disclosed: that choice is made knowing E-RLT-0071's instrument limit, before any number of this rule)
// Verdict: pass if X0, X1, XT, C and HT hold; fail if X0, X1 and XT hold and C or HT does not; partial otherwise.
//
// Reported, not gated: the cold vacuum's classical items, the dressing per period in trits and in vibes against the
// committed 33, 160, 565, 1,508, the matter-pair substitutes, the Standard Model readings (the coin maps kept, the
// lone-love response on the hot and cold vacua, the A2 planes splitting the copies), and the five-rung fits beside the
// three-rung ones.
//
// DISCLOSED: tmp/live-probe1.ts (the kernel against the rule on four side-3 starts, and the vacuum's period and counts)
// ran before this file was written; no battery number was computed before it.
//
// FIRST RUN (123 s): fail, recorded as is (C fails on six classical gates; X0, X1, XT and HT hold). AFTER THE FIRST RUN,
// outside the verdict and outside this file, two probes looked at the melt (tmp/live-probe3.ts, tmp/live-probe4.ts):
// the wake of one lone love on side 9 per beat is 19, 36, 60, 127, 344, 1,637, 5,089, 6,959, 17,228 trits, and the
// melt depends on how many lines per dock the vacuum stores: with a unit on one line only, a lone love orthogonal to
// it stays bare (1 trit), one along it wakes 13 to 17 trits and one at 60 degrees about 250, bounded over four periods;
// with two orthogonal lines the largest wake is about 4,450, bounded; with all twelve the box melts. Titles and notes
// were rewritten after the run; no logic changed.
//
// Depth L2. DETERMINISM: the battery's golden and dense fills, Kronecker starts and docks, fixed frames and layouts,
// golden-spiral directions, no draw.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  additivityWorst,
  boxGates,
  coinMapLedger,
  cptAtCollision,
  dressing,
  generationCopies,
  layoutOf,
  lineComponents,
  loneResponse,
  quantum,
  reversalAndCharge,
  travel,
  vacuumPeriod,
  walls,
  weaveOf,
  type LivingDressing,
  type QuantumRun,
} from '@/code/measure/living-pair-battery'
import { goldenFill } from '@/code/measure/candidate-kernel'
import { livingKernelAgreement } from '@/code/measure/living-pair-kernel'
import { livingState, makeLivingKnit } from '@/code/rule/living-pair-knit'
import { storeStart } from '@/code/measure/token-store-gates'
import { isometricTable, LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { storeLinearization, STORE_N, UNIFORM } from '@/code/measure/token-store-linearization'
import { livingLinearization, sampledLivingLinearization } from '@/code/measure/living-pair-linearization'
import { pairEquivarianceDefect } from '@/code/measure/pair-knit-linearization'
import { weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { invariantsOf, readStoreTransport, storeExponents, storeSpectrum, type Named, type Space } from '@/code/measure/store-transport'
import { huskDirections } from '@/code/measure/husk-transport-order'

// ---- the reference: E-FRC-0159 rerun 2026-09-26 (comoving beat, exact kernels), copied from E-RLT-0070 ----

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

const noMore = (xs: readonly number[], ref: readonly number[]): boolean => xs.every((x, p) => x <= (ref[p] ?? 0))

type Classical = { gates: Record<string, boolean>; numbers: Record<string, number>; love9: LivingDressing; fear9: LivingDressing }

function classicalOn(tau: number, log: (what: string) => void): Classical {
  const rc = reversalAndCharge(tau)
  const cpt = cptAtCollision()
  const period = vacuumPeriod(tau)
  const vac = lineComponents(tau, false)
  const dense = lineComponents(tau, true)

  log(`  components ${tau}`)

  const additivity = additivityWorst(tau)
  const wall = walls(tau)

  log(`  walls ${tau}`)

  const love9 = dressing(tau, 9, 1)
  const fear9 = dressing(tau, 9, -1)
  const love7 = dressing(tau, 7, 1)
  const fear7 = dressing(tau, 7, -1)

  log(`  dressing 9, 7 ${tau}`)

  const love11 = dressing(tau, 11, 1)
  const fear11 = dressing(tau, 11, -1)

  log(`  dressing 11 ${tau}`)

  const moving = travel(tau)
  const box = boxGates(tau)
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

const worstOf = (a: Float64Array, b: Float64Array): number => {
  let w = 0

  for (let i = 0; i < a.length; i++) w = Math.max(w, Math.abs((a[i] as number) - (b[i] as number)))

  return w
}

function transport(): { metrics: Record<string, number>; xt: boolean; ht: boolean; list: string } {
  const table = isometricTable()
  const permutations = weylF4DirectionPermutations({ directions: ROOTS })
  const reference = storeLinearization({ table, background: UNIFORM })
  const palindrome = livingLinearization({ table, background: UNIFORM, mode: 'PKP' })
  const even = livingLinearization({ table, background: UNIFORM, mode: 'PK' })
  const odd = livingLinearization({ table, background: UNIFORM, mode: 'KP' })
  const knit = makeLivingKnit(weaveOf(3))
  const sampledEven = sampledLivingLinearization({ knit, background: UNIFORM, samples: 200_000, t: 0 })
  const sampledOdd = sampledLivingLinearization({ knit, background: UNIFORM, samples: 200_000, t: 1 })
  const matrices = [even, odd]
  const invariants = invariantsOf(SPACE, matrices)
  const s = storeSpectrum(SPACE, NAMED, matrices, invariants)
  const kc = Math.sqrt(s.gap / s.dMax)
  const reading = readStoreTransport({ space: SPACE, named: NAMED, matrices, invariants, ks: LADDER.map(r => kc / r), directions: huskDirections(24) })
  const five = storeExponents(reading, 5)
  const three = (q: string): number => {
    const c = reading.series[q] ?? []

    return Math.log((c[0] ?? 1) / (c[2] ?? 1)) / Math.log(4)
  }
  const defects = [pairEquivarianceDefect(even, permutations), pairEquivarianceDefect(odd, permutations)]
  const metrics: Record<string, number> = {
    palindromeWorst: worstOf(palindrome, reference),
    sampledEvenWorst: worstOf(sampledEven, even),
    sampledOddWorst: worstOf(sampledOdd, odd),
    equivarianceDefectEven: defects[0] ?? 1,
    equivarianceDefectOdd: defects[1] ?? 1,
    invariants: invariants.length,
    unitEigenvalues: s.unitEigenvalues,
    kc,
  }

  for (const q of ['charge', 'trace', 'sound', 'shear']) {
    metrics[`husk_${q}_exponent3`] = three(q)
    metrics[`husk_${q}_exponent5`] = five[q]?.slope ?? Number.NaN
    metrics[`husk_${q}_error5`] = five[q]?.error ?? Number.NaN
    metrics[`husk_${q}_mean`] = reading.means[q] ?? Number.NaN
    ;(reading.series[q] ?? []).forEach((a, rung) => {
      metrics[`husk_${q}_anisotropy_rung${LADDER[rung]}`] = a
    })
  }

  const xt =
    (metrics.palindromeWorst ?? 1) < 1e-10 &&
    (metrics.sampledEvenWorst ?? 1) < 0.02 &&
    (metrics.sampledOddWorst ?? 1) < 0.02 &&
    defects.every(d => d < 1e-10) &&
    invariants.length === 6
  const ht = three('charge') >= 3.5 && three('trace') >= 3.5 && three('sound') >= 3.5 && Math.abs(three('shear') - 2) <= 0.5
  const list = ['charge', 'trace', 'sound', 'shear'].map(q => `${q} ${three(q).toFixed(2)} (five-rung ${(five[q]?.slope ?? Number.NaN).toFixed(2)} +- ${(five[q]?.error ?? Number.NaN).toFixed(2)})`).join(', ')

  return { metrics, xt, ht, list }
}

export default experiment({
  id: 'relativity/living-pair-battery',
  code: 'E-RLT-0075',
  title:
    "the living-pair knit through E-FRC-0159's battery, partial at the default integer start since the frame fix (E-RLT-0088; fail before it): with the comoving own points carried by the frame change, the swap-phase control reads 0 at the battery's own frame, so the X1 instrument gate fails and the verdict on the knit is not reached (partial marks an instrument that could not fire, not a knit that came closer); all 14 quantum gates pass (the vacuum pair is a line of dock 0's store tokens meeting every 3 beats, CHSH 2.552, H's value) and the husk transport stays isotropic (charge 4.00, trace 4.11, sound 4.04 over the three longest rungs, shear 2.03), but against the combined knit H 6 gates newly fail (the four dressing gates, superposition, walls): the hot vacuum is full on every beat between making and unmaking, one lone vibe breaks its timing and the wake multiplies beat by beat (19, 36, 60, 127, 344, 1,637 trits over the first six) until the box melts (179,854 trits in the first period on side 9, committed 33)",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // X0
    const w3 = weaveOf(3)
    const slots3 = w3.mesh.cellCount * 24
    const knit3 = makeLivingKnit(w3)
    const agreements = [
      ...[1, 0, -1].map(tau => livingKernelAgreement({ knit: knit3, start: livingState({ ...goldenFill(slots3, 1.37), tau, layout: layoutOf(3) }), beats: 48 })),
      livingKernelAgreement({ knit: knit3, start: storeStart(w3.mesh.cellCount, 11), beats: 48 }),
    ]
    const x0 = agreements.every(a => a.mismatches === 0) && agreements.every(a => a.vetoed > 0)

    log('x0')

    const hot = classicalOn(1, log)

    log('classical hot')

    const cold = classicalOn(0, log)

    log('classical cold')

    const runs: Record<string, QuantumRun> = { on: quantum(1, 'on'), off: quantum(1, 'off') }

    log('quantum')

    const ledger = coinMapLedger()
    const allPlus = LINE_FIRSTS.map(() => 1)
    const responseHot = loneResponse(allPlus)
    const responseCold = loneResponse(LINE_FIRSTS.map(() => 0))
    const generations = generationCopies(hot.love9, hot.fear9)
    const generationsCold = generationCopies(cold.love9, cold.fear9)

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
    const brokenAgainstCandidate = newlyFailing.filter(g => !CANDIDATE_NEWLY_FAILING.includes(g))
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
      newFailuresAgainstCandidate: brokenAgainstCandidate.length,
      quantumGatesFailingOn: quantumFailing.length,
      quantumUnevaluable: unevaluable.length,
      failsOnlyWithFearOn: failsOnlyOn.length,
      kernelMismatchBeats: agreements.reduce((s, a) => s + a.mismatches, 0),
      kernelVetoes: agreements.reduce((s, a) => s + a.vetoed, 0),
      ...flatten('hot_gate', hot.gates),
      ...flatten('hot', hot.numbers),
      ...flatten('cold_gate', cold.gates),
      ...flatten('cold', cold.numbers),
      ...flatten('on_gate', runs.on?.gates ?? {}),
      ...flatten('off_gate', runs.off?.gates ?? {}),
      ...flatten('on', runs.on?.metrics ?? {}),
      ...flatten('off', runs.off?.metrics ?? {}),
      coinMapsKept: ledger.kept,
      orientationReversingKept: ledger.orientationReversingKept,
      orientationReversing: ledger.orientationReversing,
      loneResponseSelfDualHot: responseHot.selfDual,
      loneResponseAntiSelfDualHot: responseHot.antiSelfDual,
      loneResponseTraceHot: responseHot.symmetricTrace,
      loneResponseSelfDualCold: responseCold.selfDual,
      loneResponseAntiSelfDualCold: responseCold.antiSelfDual,
      generationPlanes: generations.planes,
      generationPlanesSplit: generations.split,
      generationPlanesKeepingHot: generations.planesKeepingHot,
      generationPlanesSplitCold: generationsCold.split,
      ...flatten('transport', tr.metrics),
      seconds: (Date.now() - started) / 1000,
    }
    const m = metrics
    const list = (xs: readonly string[]): string => (xs.length > 0 ? xs.join(', ') : 'none')
    const per = (prefix: string): string => [1, 2, 3, 4].map(p => m[`${prefix}Period${p}`]).join(', ')

    return verdict({
      status: status as 'pass' | 'fail' | 'partial',
      claim: `the living-pair knit ${condition ? 'works' : 'does not work'} with everything by E-FRC-0159's rule: against the combined knit H ${newlyFailing.length} gates newly fail (${list(newlyFailing)}) and ${newlyPassing.length} newly pass; of E-RLT-0070's 10 it clears ${fixedFromCandidate.length} (${list(fixedFromCandidate)}) and it breaks ${brokenAgainstCandidate.length} the candidate kept (${list(brokenAgainstCandidate)}); ${quantumFailing.length} of 14 quantum gates fail with the fear beat on (${unevaluable.length} unevaluable); the vacuum pair is ${m.on_vacuumPairKind === 1 ? 'a line of place tokens' : m.on_vacuumPairKind === 0 ? 'a line of slot tokens' : 'absent'}, CHSH ${m.on_chsh?.toFixed(3)} (stand-in ${m.on_chshStandIn?.toFixed(3)}); the hot-vacuum dressing per period is ${per('hot_side9Love')} trits (committed 33, 160, 565, 1,508); husk transport ${tr.list}`,
      metrics,
      control: {
        committedSide9LovePeriod1: COMMITTED.side9Love[0] ?? 0,
        committedSide9LovePeriod4: COMMITTED.side9Love[3] ?? 0,
        candidateNewlyFailing: CANDIDATE_NEWLY_FAILING.length,
        ...flatten('H_gate', H_GATES),
      },
      notes: `L2. Gates: X0 ${x0}, X1 ${x1}, XT ${tr.xt}, C ${condition}, HT ${tr.ht}. Newly failing against H: ${list(newlyFailing)}. Newly passing: ${list(newlyPassing)}. Quantum gates failing with the fear beat on: ${list(quantumFailing)}; not evaluable: ${list(unevaluable)}; failing only with the fear beat on: ${list(failsOnlyOn)}. Hot vacuum (trits; vibes beside): period ${m.hot_vacuumPeriod}, line components ${m.hot_vacuumComponents} (${m.hot_vacuumComponentsVibes}) and ${m.hot_denseComponents} (${m.hot_denseComponentsVibes}), superposition ${m.hot_additivityWorst?.toExponential(2)}, wall ${m.hot_wallSettledMax} trits (${m.hot_wallSettledMaxVibes} vibes, quantized ${m.hot_wallQuantized}), side-9 love dressing per period ${per('hot_side9Love')} trits and ${per('hot_side9LoveVibes')} vibes, fear ${per('hot_side9Fear')} (committed 27, 163, 581, 1,501), side 7 love ${per('hot_side7Love')} fear ${per('hot_side7Fear')}, side 11 love ${per('hot_side11Love')} fear ${per('hot_side11Fear')}, travel ${m.hot_travelFullSpeed} of 24 at full speed (${m.hot_travellers} at half or more), straight lone loves ${m.hot_straightLoves}. Cold vacuum: period ${m.cold_vacuumPeriod}, components ${m.cold_vacuumComponents} and ${m.cold_denseComponents}, wall ${m.cold_wallSettledMax}, side-9 love dressing ${per('cold_side9Love')}. Quantum on the vacuum pair: ${m.on_vacuumMeetings} meetings in 480 beats, fears at most ${m.on_vacuumFearsMax}, fear share at most ${m.on_vacuumFearShareMax?.toFixed(4)}, chances after the first three flat-link meetings ${m.on_chanceAfterMeeting1?.toFixed(4)}, ${m.on_chanceAfterMeeting2?.toFixed(4)}, ${m.on_chanceAfterMeeting3?.toFixed(4)} against the stand-in's ${m.on_standIn1?.toFixed(4)}, ${m.on_standIn2?.toFixed(4)}, ${m.on_standIn3?.toFixed(4)}; matter pair CHSH ${m.on_matterChsh?.toFixed(3)}. Coin maps kept ${m.coinMapsKept} (${m.orientationReversingKept} of ${m.orientationReversing} orientation-reversing). Lone-love response on the hot vacuum: self-dual ${m.loneResponseSelfDualHot?.toExponential(2)}, anti-self-dual ${m.loneResponseAntiSelfDualHot?.toExponential(2)}; cold ${m.loneResponseSelfDualCold?.toExponential(1)} and ${m.loneResponseAntiSelfDualCold?.toExponential(1)}. A2 planes splitting the copies: ${m.generationPlanesSplit} of ${m.generationPlanes} hot, ${m.generationPlanesSplitCold} cold. Transport: 'PKP' against E-RLT-0071 ${m.transport_palindromeWorst?.toExponential(1)}, sampled ${m.transport_sampledEvenWorst?.toFixed(4)} and ${m.transport_sampledOddWorst?.toFixed(4)}, equivariance ${m.transport_equivarianceDefectEven?.toExponential(1)} and ${m.transport_equivarianceDefectOdd?.toExponential(1)}, ${m.transport_invariants} invariants, k_c ${m.transport_kc?.toFixed(3)}; magnitudes at the longest rung: charge D ${m.transport_husk_charge_mean?.toFixed(3)}, shear ${m.transport_husk_shear_mean?.toFixed(3)}, sound ${m.transport_husk_sound_mean?.toFixed(3)} (E-RLT-0071's candidate 0.468, 0.931, 0.342). ${m.seconds?.toFixed(0)} s.`,
    })
  },
})
