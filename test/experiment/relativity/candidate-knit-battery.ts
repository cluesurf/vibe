// The candidate knit through E-FRC-0159's battery, gate for gate, beside the combined knit (E-RLT-0070).
//
// THE CANDIDATE: the pair-making isometric knit with the store that returns the unmade pair's tokens and the neutral
// veto (code/rule/token-store-knit, 'returned-neutral'; E-RLT-0067). It keeps W(F4), CPT, reversal, charge, momentum,
// energy, pair creation, a clocking vacuum, bounded dressing, exact held color, role covariance with open tokens, the
// fermion number and the one omega. The user's adoption condition for any change to the knit is E-FRC-0158/0159's:
// it is adopted only if it "works with everything". The comoving fear beat was adopted on exactly this battery
// (E-SPN-0063: 0 new failures). This file asks the same of the candidate.
//
// THE REFERENCE. E-FRC-0159 as rerun on 2026-09-26 under the adopted comoving fear beat and the exact Eisenstein
// kernels (the file as it stands; its run log is tmp/adopt-after.jsonl, 03:25, 862 s). Its gate values for the three
// configurations H (unfolded), HF (folded) and HFL (folded, lone steering) are copied below as constants, with the
// committed rule's numbers the classical gates compare against. The comparison is made against H, the configuration
// on which every quantum gate and all but two classical gates pass; HF and HFL are listed beside it.
//
// HOW EACH ITEM IS ASKED OF THE CANDIDATE: code/measure/candidate-battery (the battery's box, fill, beat count and
// comparison per item). Decided before any number: the items are asked on the HOT vacuum (every line's store +1 in
// its own orientation, the clocking vacuum the candidate is proposed with), the cold vacuum reported beside it; a
// difference is counted in trits (vibes and store trits, both the classical state), vibes alone reported beside it;
// the fills carry the vacuum's store and one point per stored unit. The quantum items run the adopted law exactly as
// the battery does (advanceWhole, comoving, frames on, exact kernels, own points from the origin); the frame change
// also moves the classical points, because the candidate's veto reads them (the combined knit's classical layer does
// not, so the battery never needed to).
//
// PREDICTED BEFORE RUNNING (derived from the rule, not measured):
//  (i) the hot vacuum holds no vibe between beats (its pairs are made and unmade inside one collision, E-RLT-0069), and
//      the knit records a meeting only between two held slots before the collision, so no two tokens meet in the
//      vacuum: the battery's vacuum pair does not exist, and the gates read on it (the vacuum knot's purity and fear
//      share, the frame change on the vacuum, the vacuum storage, interference on flat links, CHSH) cannot be
//      evaluated. They are counted as failing, and the same readings are taken on the matter pair beside them
//  (ii) a lone vibe goes straight on both vacua (E-RLT-0069 H2): every direction travels at full speed
//  (iii) on the hot vacuum a lone vibe writes a wake in the store (E-RLT-0064: up to 82 trits per 24 beats), which the
//      trit count sees as dressing: the first period's support should exceed the committed rule's 33
//  (iv) the rule keeps all 1,152 coin maps, the orientation-reversing ones included, so it has no handedness
//      (E-FRC-0142's reading): the lone-love response has no antisymmetric part
//  (v) W(F4) holds the D4 triality, so no A2 plane splits the three copies (E-FRC-0141's reading)
//
// Gates, fixed before the first run:
//  X0 the kernel the large-box items run on agrees with storeBeat bit for bit on the side-3 box for 48 beats, on the
//     golden fill with the hot, the cold and the -1 store and on E-RLT-0067's Kronecker start, with the veto acting
//  X1 the battery's controls hold on the candidate's quantum runs, both modes: the committed table flips token signs,
//     the swap phase at love-fear meetings breaks the frame change (on the vacuum pair, or when there is none on the
//     most-met dock-0 pair with a love-fear meeting in the search run, since the swap phase changes only love-fear
//     meetings), with the fear beat off every chance is 1, and the dephased stand-in's CHSH is at most 2
//  C  the adoption condition, E-FRC-0159's rule carried to the candidate: (a) no gate that H passes fails on the
//     candidate, and (b) every quantum gate passes on the candidate with the fear beat on. A gate the candidate cannot
//     evaluate counts as failing, and is listed as such
// Verdict: pass if X0, X1 and C hold; fail if X0 and X1 hold and C does not; partial otherwise.
//
// Reported, not gated: the cold vacuum's classical items; the gates that fail on the candidate only with the fear beat
// on (the battery's rule (a) within the candidate); the matter-pair substitutes for the vacuum-pair readings; the
// Standard Model readings of the committed knit (handedness E-FRC-0142, the vacuum E-FRC-0143, the generations
// E-FRC-0140/0141): the coin maps kept and their orientation, the lone-love response's self-dual and anti-self-dual
// parts, the A2 planes that split the copies and the ones whose triality keeps the hot vacuum.
//
// DISCLOSED: two probes ran before the first run of this file. tmp/cand-probe-kernel.ts checked the kernel against
// storeBeat (0 mismatching beats on the three golden starts and the Kronecker start, the X0 instrument), and
// tmp/cand-probe-timing.ts ran every item once printing only elapsed times (no value was printed or read).
//
// Depth L2. DETERMINISM: the battery's golden and dense fills, Kronecker starts, fixed frames, no draw. The husk is
// not read here (a battery of bulk rule properties, stated as such); its transport is E-RLT-0071 and E-RLT-0072.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  additivityWorst,
  boxGates,
  coinMapLedger,
  cptAtCollision,
  dressing,
  generationCopies,
  lineComponents,
  loneResponse,
  quantum,
  reversalAndCharge,
  travel,
  vacuumPeriod,
  walls,
  weaveOf,
  type CandidateDressing,
  type QuantumRun,
} from '@/code/measure/candidate-battery'
import { fullState, goldenFill, kernelAgreement } from '@/code/measure/candidate-kernel'
import { storeStart } from '@/code/measure/token-store-gates'

// ---- the reference: E-FRC-0159 rerun 2026-09-26 (comoving beat, exact kernels), tmp/adopt-after.jsonl ----

const COMMITTED = {
  vacuumComponents: 3,
  denseComponents: 1,
  side9Love: [33, 160, 565, 1508],
  side9Fear: [27, 163, 581, 1501],
  side7Love: [33, 131, 420, 1204],
  side7Fear: [27, 135, 474, 1385],
  side11Love: [33, 209, 755, 2241],
  side11Fear: [27, 218, 824, 2390],
  travelFullSpeed: 9,
  travelHalfOrMore: 12,
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
const HF_GATES: Record<string, boolean> = {
  ...passAll(CLASSICAL_GATES),
  vacuumPeriodic: false,
  vacuumComponentsNoMore: false,
  loveDressingSide9: false,
  fearDressingSide9: false,
  loveDressingSide7: false,
  fearDressingSide7: false,
  loveDressingSide11: false,
  fearDressingSide11: false,
  ...passAll(QUANTUM_GATES),
}
const H_NUMBERS: Record<string, number> = {
  vacuumPeriod: 24,
  vacuumComponents: 2,
  denseComponents: 1,
  wallSettledMax: 97686,
  travellers: 15,
  side9LovePeriod1: 33,
  side9LovePeriod4: 900,
  side9FearPeriod1: 33,
  chsh: 2.552284749830797,
  fearShareMax: 0.30419788073080384,
  chiralRatioSide9: 1,
  generationPlanesSplit: 16,
}

const noMore = (xs: readonly number[], ref: readonly number[]): boolean => xs.every((x, p) => x <= (ref[p] ?? 0))

type Classical = { gates: Record<string, boolean>; numbers: Record<string, number>; love9: CandidateDressing; fear9: CandidateDressing }

function classicalOn(tau: number): Classical {
  const rc = reversalAndCharge(tau)
  const cpt = cptAtCollision()
  const period = vacuumPeriod(tau)
  const vac = lineComponents(tau, false)
  const dense = lineComponents(tau, true)
  const additivity = additivityWorst(tau)
  const wall = walls(tau)
  const side = (s: number, tone: number): CandidateDressing => dressing(tau, s, tone)
  const love9 = side(9, 1)
  const fear9 = side(9, -1)
  const love7 = side(7, 1)
  const fear7 = side(7, -1)
  const love11 = side(11, 1)
  const fear11 = side(11, -1)
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
      ...periods('side7Love', love7.periodLargest),
      ...periods('side7Fear', fear7.periodLargest),
      ...periods('side11Love', love11.periodLargest),
      ...periods('side11Fear', fear11.periodLargest),
    },
  }
}

// the readings E-RLT-0073 cites, computed once per process
let cached: { status: string; metrics: Record<string, number>; newlyFailing: string[]; newlyPassing: string[]; unevaluable: string[] } | undefined

export function candidateBattery(): { status: string; claim: string; metrics: Record<string, number>; control: Record<string, number>; notes: string; newlyFailing: string[]; newlyPassing: string[]; unevaluable: string[] } {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

  // X0
  const w3 = weaveOf(3)
  const slots3 = w3.mesh.cellCount * 24
  const agreements = [
    ...[1, 0, -1].map(tau => kernelAgreement({ weave: w3, start: fullState({ ...goldenFill(slots3, 1.37), tau }), beats: 48 })),
    kernelAgreement({ weave: w3, start: storeStart(w3.mesh.cellCount, 11), beats: 48 }),
  ]
  const x0 = agreements.every(a => a.mismatches === 0) && agreements.every(a => a.vetoed > 0)

  log('x0')

  const hot = classicalOn(1)

  log('classical hot')

  const cold = classicalOn(0)

  log('classical cold')

  const runs: Record<string, QuantumRun> = { on: quantum(1, 'on'), off: quantum(1, 'off') }

  log('quantum')

  const ledger = coinMapLedger()
  const responseHot = loneResponse(1)
  const responseCold = loneResponse(0)
  const generations = generationCopies(hot.love9, hot.fear9)
  const generationsCold = generationCopies(cold.love9, cold.fear9)

  log('readings')

  const x1 = (runs.on?.metrics.controlsHold ?? 0) === 1 && (runs.off?.metrics.controlsHold ?? 0) === 1
  const candidateGates: Record<string, boolean> = { ...hot.gates, ...(runs.on?.gates ?? {}) }
  const newlyFailing = Object.keys(H_GATES).filter(g => H_GATES[g] && !candidateGates[g])
  const newlyPassing = Object.keys(H_GATES).filter(g => !H_GATES[g] && candidateGates[g])
  const newlyFailingVsHF = Object.keys(HF_GATES).filter(g => HF_GATES[g] && !candidateGates[g])
  const quantumFailing = QUANTUM_GATES.filter(g => !(runs.on?.gates[g] ?? false))
  const failsOnlyOn = QUANTUM_GATES.filter(g => (runs.off?.gates[g] ?? false) && !(runs.on?.gates[g] ?? false))
  const unevaluable = runs.on?.unevaluable ?? []
  const condition = newlyFailing.length === 0 && quantumFailing.length === 0
  const status = x0 && x1 ? (condition ? 'pass' : 'fail') : 'partial'
  const flatten = (prefix: string, record: Record<string, number | boolean>): Record<string, number> =>
    Object.fromEntries(Object.entries(record).map(([k, v]) => [`${prefix}_${k}`, typeof v === 'boolean' ? (v ? 1 : 0) : v]))
  const metrics: Record<string, number> = {
    worksWithEverything: condition ? 1 : 0,
    newlyFailingVsH: newlyFailing.length,
    newlyPassingVsH: newlyPassing.length,
    newlyFailingVsHF: newlyFailingVsHF.length,
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
    seconds: (Date.now() - started) / 1000,
  }
  const control: Record<string, number> = {
    ...Object.fromEntries(Object.entries(H_NUMBERS).map(([k, v]) => [`H_${k}`, v])),
    ...flatten('H_gate', H_GATES),
    committedSide9LovePeriod1: COMMITTED.side9Love[0] ?? 0,
    committedTravelFullSpeed: COMMITTED.travelFullSpeed,
  }

  cached = { status, metrics, newlyFailing, newlyPassing, unevaluable }

  const m = metrics
  const list = (xs: readonly string[]): string => (xs.length > 0 ? xs.join(', ') : 'none')

  return {
    status,
    newlyFailing,
    newlyPassing,
    unevaluable,
    claim: `the candidate knit ${condition ? 'works' : 'does not work'} with everything by E-FRC-0159's rule: against the combined knit H (comoving beat, exact kernels) ${newlyFailing.length} gates newly fail (${list(newlyFailing)}) and ${newlyPassing.length} newly pass (${list(newlyPassing)}); ${quantumFailing.length} of 14 quantum gates fail with the fear beat on, ${unevaluable.length} of them because the hot vacuum holds no meeting (its pairs live inside one collision); on the matter pair the substitutes read CHSH ${m.on_matterChsh?.toFixed(3)} (stand-in ${m.on_matterChshStandIn?.toFixed(3)}) and interference ${m.on_matterInterferenceBeyondStandIn ? 'beyond' : 'not beyond'} the stand-in; the rule keeps ${m.coinMapsKept} coin maps (${m.orientationReversingKept} of ${m.orientationReversing} orientation-reversing), so it has no handedness, and ${m.generationPlanesSplit} of ${m.generationPlanes} A2 planes split the three copies`,
    metrics,
    control,
    notes: `L2. Gates: X0 ${x0}, X1 ${x1}, C ${condition}. Newly failing against H: ${list(newlyFailing)}. Newly passing against H: ${list(newlyPassing)}. Newly failing against HF: ${list(newlyFailingVsHF)}. Quantum gates failing with the fear beat on: ${list(quantumFailing)}; of these not evaluable (no vacuum pair): ${list(unevaluable)}. Failing only with the fear beat on (within the candidate): ${list(failsOnlyOn)}. Hot vacuum (trits; vibes beside): vacuum period ${m.hot_vacuumPeriod} (H 24), line components ${m.hot_vacuumComponents} (${m.hot_vacuumComponentsVibes}) on the vacuum and ${m.hot_denseComponents} (${m.hot_denseComponentsVibes}) on the dense fill (committed 3 and 1), wall ${m.hot_wallSettledMax} trits (${m.hot_wallSettledMaxVibes} vibes; H 97,686), side-9 love dressing per period ${[1, 2, 3, 4].map(p => m[`hot_side9LovePeriod${p}`]).join(', ')} trits, ${[1, 2, 3, 4].map(p => m[`hot_side9LoveVibesPeriod${p}`]).join(', ')} vibes (committed 33, 160, 565, 1,508; H 33, 133, 369, 900), travel ${m.hot_travelFullSpeed} of 24 at full speed (committed 9, H ${H_NUMBERS.travellers} at half or more), straight lone loves ${m.hot_straightLoves} and fears ${m.hot_straightFears} of 24. Cold vacuum: period ${m.cold_vacuumPeriod}, components ${m.cold_vacuumComponents} and ${m.cold_denseComponents}, wall ${m.cold_wallSettledMax}, side-9 love dressing ${[1, 2, 3, 4].map(p => m[`cold_side9LovePeriod${p}`]).join(', ')}. The lone-love response (hot): self-dual ${m.loneResponseSelfDualHot?.toExponential(1)}, anti-self-dual ${m.loneResponseAntiSelfDualHot?.toExponential(1)}; the committed knit reads 4.1 and 4.7 times more self-dual (E-FRC-0142), H reads 1.00. A2 planes whose triality keeps the hot vacuum: ${m.generationPlanesKeepingHot} of ${m.generationPlanes}; planes splitting on the cold vacuum ${m.generationPlanesSplitCold}. FIRST RUN (41.7 s): partial, X1 failing, recorded as is. X1 fails because the candidate's box gives the controls almost nothing to read, not because a control disagreed: the hot vacuum holds no meeting (prediction (i) held), and on the golden matter fill the 24 open dock-0 tokens met only ${m.on_dockMeetings} times in 240 beats (${m.on_dockLoveFearPairs} pairs with a love-fear meeting), the chosen matter pair twice in 480; so the swap-phase control's pair did not meet within its 48-beat frame run (0 mismatches, nothing to break) and no pair met on flat links within 60 beats (no fear-off chance to read). This sparsity is itself a finding (its cause is not measured here; a candidate is that held vibes keep entering the store and only the stored tokens come back out, so few token pairs meet twice). Prediction (iii) held with a twist: the hot-vacuum wake is 82 trits in every period on the side-9 box (it saturates on the torus in the first period and stays), bounded but above the committed rule's 33 in the first period, while the vibe count stays 1 (a lone vibe is bare). Prediction (v) was WRONG on the hot vacuum: a lone vibe's wake depends on how its root sits against the store's orientation, and only the 1 plane whose triality keeps the hot vacuum leaves the copies degenerate, so 15 of 16 split there (0 of 16 on the cold vacuum, as predicted).`,
  }
}

export function candidateBatteryCached(): { status: string; metrics: Record<string, number>; newlyFailing: string[]; newlyPassing: string[]; unevaluable: string[] } {
  return cached ?? candidateBattery()
}

export default experiment({
  id: 'relativity/candidate-knit-battery',
  code: 'E-RLT-0070',
  title:
    "the candidate knit through E-FRC-0159's battery, partial (the controls had too few meetings to read): against the combined knit H it newly fails 10 gates and newly passes none; 6 quantum gates cannot be evaluated because the hot vacuum holds no meeting (its pairs live inside one collision), the matter pair's CHSH reads 2.361 against the stand-in's 2.000, the hot-vacuum wake dresses a bare lone vibe with 82 store trits (committed 33 in the first period), every lone vibe travels straight at full speed (24 of 24), the rule keeps all 576 orientation-reversing coin maps (no handedness), and the wake splits the three copies on 15 of 16 A2 planes on the hot vacuum and 0 on the cold",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = candidateBattery()

    return verdict({ status: r.status as 'pass' | 'fail' | 'partial', claim: r.claim, metrics: r.metrics, control: r.control, notes: r.notes })
  },
})
