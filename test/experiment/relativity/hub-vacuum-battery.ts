// The living-pair knit on the ORIENTED HUB VACUUM through E-FRC-0159's battery, gate for gate, beside the combined knit
// H, and its husk transport (E-RLT-0082).
//
// STATUS (2026-09-26): partial at the default integer link start since the frame fix (E-RLT-0088; fail before it).
// The X1 instrument gate fails because the swap-phase control reads 0 at the battery's own frame once the comoving
// own points are carried, so the verdict on the knit is not reached. The husk transport is isotropic at first order
// and 14 of 14 quantum gates pass, but against H 3 gates newly fail and the wake fills every box. The 3,670
// frame-covariance mismatches first registered were specific to the retired golden start. Not run over E-MTH-0028's
// start family.
//
// THE CANDIDATE, and why this one. E-RLT-0080 and E-RLT-0081 read three vacua that break W(F4) in their state:
//  - the one-line vacuum (E-RLT-0079): thin, plane-filling wake (266 trits per period on side 9), transport UNIAXIAL;
//  - the frame (E-RLT-0081): transport isotropic at rank 2 only (charge, trace, sound exponents near 2, shear 0.15),
//    wake fills the box (78,559);
//  - the oriented hub vacuum (E-RLT-0080): point group of 576 elements, which forces what W(F4) forces at these orders
//    (the husk scalars through k^4 and the shear at leading order), first-order transport 4.00, 4.09, 4.02, 2.02; wake
//    fills the box (8,896 on side 8, 2.2 trits per dock).
// The target is 0 new failures, isotropic transport and a bounded wake. No candidate has the wake. The oriented hub
// vacuum is the only one with isotropic transport, so it is the best candidate for the other two, and this file asks the
// whole battery of it, to state exactly which gates the isotropic vacuum costs.
//
// THE RULE: code/rule/living-pair-knit, schedule 'alternate', the neutral veto, unchanged. THE VACUUM: code/measure/
// varying-vacuum orientedHubStore, period 4 D4, anchored so the dock an item seeds stores line 0.
//
// THE BATTERY: code/measure/varying-living-battery, E-RLT-0079's battery with the store per dock and the box sides moved
// to multiples of 4 (the vacuum's period): 3 -> 4 (quantum, box items, vacuum period), 5 -> 8 (reversal, components),
// 7, 9, 11 -> 8, 12, 16 (dressing), 9 -> 12 (walls), 11 -> 12 (superposition), 13 -> 16 (travel). THE REFERENCE: the
// committed knit (turningWeave, 'pair') and H (the head-on turn base with the scatter block, unfolded, E-FRC-0159) are
// measured at the SAME sides by referenceAcceptance. H's gate list is rebuilt from those numbers the way E-FRC-0159
// builds it (every item against the committed knit, dressing per period); H's box and quantum gates, which are exact
// properties of the rule measured on E-FRC-0159's side-3 box, are taken from that run (all pass). Decided before any
// number of this file was read.
//
// THE HUSK TRANSPORT: the cell average of the vacuum's per-dock collision matrices at E-RLT-0079's oriented background
// (code/measure/varying-transport averagedMatrices): the first-order medium. The exact periodic transport is forced by the
// point group (E-RLT-0080 D5), not computed.
//
// Gates, fixed before the first run:
//  X0 the kernel agrees with livingBeat bit for bit on the side-4 box for 48 beats: the golden fill with the hub store,
//     with the one-line store and with no store, and E-RLT-0067's Kronecker start, the veto acting in each
//  X1 the battery's controls hold on both quantum runs (fear beat on and off)
//  XT the averaged matrices commute with all 1,152 coin maps to 1e-10, hold all 24 oriented roots, keep 6 invariants
//  C  the adoption condition, E-RLT-0070's: (a) no gate that H passes at these sides fails here, and (b) every quantum
//     gate passes with the fear beat on; a gate that cannot be evaluated counts as failing
//  HT the averaged husk transport: charge, trace and sound exponents at least 3.5 and the shear 2 +- 0.5
// Verdict: pass if X0, X1, XT, C and HT hold; fail if X0, X1 and XT hold and C or HT does not; partial otherwise.
//
// PREDICTED before running: HT holds (E-RLT-0080 D7 read the same matrices). C FAILS on the six dressing gates (the
// wake fills the box, E-RLT-0080's W). The quantum gates are not predicted: the hub vacuum's vacuum vibes meet as two
// loves or two fears at a hub (no veto is ever needed), so its vacuum pair meets like tokens where the one-line vacuum's
// met a love and a fear. Walls, components and superposition are not predicted.
//
// Reported, not gated: the trade table (gate: H here / E-RLT-0079's one-line vacuum at the old sides / here), the
// committed and H numbers at the new sides, the coin-map ledger.
//
// DISCLOSED: E-RLT-0080's wake (side 8) and run are the only numbers of this vacuum seen before this file.
//
// FIRST RUN (184.2 s): fail, recorded as is. X0, X1, XT, HT hold; C fails on superposition, walls, loveDressingSide16
// and frameCommutesMatter (3,670 mismatches with the fear beat on, 0 with it off, the vacuum pair 0). Not predicted:
// the dressing gates at sides 8 and 12 and fear 16 do not count, because H itself fails them at these sides (H 23, 62,
// 158, 263 against the committed 28, 75, 129, 214 on side 8), so the even-side reference is looser than the old one.
// CAVEAT on frameCommutesMatter: H's quantum gates were taken from E-FRC-0159's side-3 run, not remeasured on side 4, so
// this failure is against an assumed H; the one-line vacuum passed it on side 3. Title rewritten after the run.
//
// Depth L2. DETERMINISM: golden and dense fills, Kronecker starts (Weyl orbits), fixed frames and layouts, no draw.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { turningWeave } from '@/code/rule/collision'
import { combinedCollision } from '@/code/rule/combined-knit'
import { HEAD_TURN_SPEC } from '@/code/rule/scatter-weave'
import { isometricTable, LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { makeLivingKnit } from '@/code/rule/living-pair-knit'
import { livingKernelAgreement } from '@/code/measure/living-pair-kernel'
import { goldenFill } from '@/code/measure/candidate-kernel'
import { storeStart } from '@/code/measure/token-store-gates'
import { sparseLivingState } from '@/code/measure/sparse-living-vacuum'
import { coinMapLedger, cptAtCollision } from '@/code/measure/living-pair-battery'
import { type Dressing, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { d4BoxCoordinates, d4Coordinates } from '@/code/substrate/d4-box'
import { coinData, orientedHubStore, uniformStore } from '@/code/measure/varying-vacuum'
import { averagedMatrices, equivarianceDefect, readTransport } from '@/code/measure/varying-transport'
import {
  additivityWorst,
  boxGates,
  dressing,
  EVEN_SIDES,
  layoutOf,
  lineComponents,
  quantum,
  referenceAcceptance,
  reversalAndCharge,
  travel,
  vacuumPeriod,
  walls,
  weaveOf,
  type LivingDressing,
  type QuantumRun,
  type VaryingVacuum,
} from '@/code/measure/varying-living-battery'

const ROOTS = rootsD4()
const SIDES = EVEN_SIDES
const [D1, D2, D3] = SIDES.dressing as [number, number, number]
const CLASSICAL_GATES = [
  'reverses',
  'chargeKept',
  'cptAtMirrorPhase',
  'vacuumPeriodic',
  'vacuumComponentsNoMore',
  'denseComponentsNoMore',
  'superposition',
  'wallsQuantized',
  `loveDressingSide${D2}`,
  `fearDressingSide${D2}`,
  `loveDressingSide${D1}`,
  `fearDressingSide${D1}`,
  `loveDressingSide${D3}`,
  `fearDressingSide${D3}`,
  'boxReverses',
  'boxChargeKept',
  'noColorLeak',
  'frameCommutes',
  'momentumKept',
  'lineMomentaExchanged',
]
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
]
// H's box and quantum gates on E-FRC-0159's side-3 box (all pass)
const BOX_GATES = ['boxReverses', 'boxChargeKept', 'noColorLeak', 'frameCommutes', 'momentumKept', 'lineMomentaExchanged']
// E-RLT-0079's one-line vacuum at the old sides: the gates it newly failed against H
const ONE_LINE_NEWLY_FAILING = ['vacuumComponentsNoMore', 'wallsQuantized', 'loveDressingSide9', 'loveDressingSide7', 'fearDressingSide7', 'loveDressingSide11']
// the old gate each new one replaces, for the trade table
const OLD_NAME: Record<string, string> = {
  [`loveDressingSide${D1}`]: 'loveDressingSide7',
  [`fearDressingSide${D1}`]: 'fearDressingSide7',
  [`loveDressingSide${D2}`]: 'loveDressingSide9',
  [`fearDressingSide${D2}`]: 'fearDressingSide9',
  [`loveDressingSide${D3}`]: 'loveDressingSide11',
  [`fearDressingSide${D3}`]: 'fearDressingSide11',
}
const H_SPEC = { base: HEAD_TURN_SPEC, fold: false, scatter: true, mirror: 23, steer: false } as const

const noMore = (xs: readonly number[], ref: readonly number[]): boolean => xs.every((x, p) => x <= (ref[p] ?? 0))

export default experiment({
  id: 'relativity/hub-vacuum-battery',
  code: 'E-RLT-0082',
  title:
    "the living-pair knit on the oriented hub vacuum through E-FRC-0159's battery at sides divisible by 4, partial at the default integer start since the frame fix (E-RLT-0088; fail before it): with the comoving own points carried by the frame change, the swap-phase control reads 0 at the battery's own frame, so the X1 instrument gate fails and the verdict on the knit is not reached (partial marks an instrument that could not fire, not a knit that came closer); its first-order husk transport is isotropic (charge 4.00, trace 4.09, sound 4.02, shear 2.02) and 14 of 14 quantum gates pass (CHSH 2.552), but against H at the same sides 3 gates newly fail: superposition, walls (44,637 trits, not whole sheets) and the side-16 love dressing (140,272 trits in the first period, committed 29); the wake fills every box (8,930, 44,684, 140,272 trits in the first period on sides 8, 12, 16); the matter pair's frame-covariance failure first registered here (3,670 mismatches on side 4) was specific to the retired golden start and reads 0 at the default integer start under either frame change (E-RLT-0088)",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const table = groupTable()
    const coins = coinData(table)
    const r0 = d4Coordinates(ROOTS[LINE_FIRSTS[0] as number] as number[])
    const hubFor = (side: number, anchor: number): number[] => d4BoxCoordinates({ cell: anchor, side }).map((v, k) => v - (r0[k] as number))
    const HUB: VaryingVacuum = { key: 'hub', store: (side, anchor) => orientedHubStore(coins, side, hubFor(side, anchor)) }

    // X0
    const q = SIDES.q
    const wq = weaveOf(q)
    const cellsQ = wq.mesh.cellCount
    const knitQ = makeLivingKnit(wq)
    const agreements = [HUB.store(q, 0), uniformStore(cellsQ, [0]), new Int8Array(cellsQ * 12)].map(store =>
      livingKernelAgreement({ knit: knitQ, start: sparseLivingState({ ...goldenFill(cellsQ * 24, 1.37), store, layout: layoutOf(q) }), beats: 48 }),
    )

    agreements.push(livingKernelAgreement({ knit: knitQ, start: storeStart(cellsQ, 11), beats: 48 }))

    const x0 = agreements.every(a => a.mismatches === 0 && a.vetoed > 0)

    log('x0')

    // the references at the new sides
    const committedRule: ScheduledRule = (opposite, forward) => turningWeave({ opposite, forward, table: 'pair' })
    const hRule: ScheduledRule = (opposite, forward) => combinedCollision({ spec: H_SPEC, opposite, forward })
    const committed = referenceAcceptance(committedRule, SIDES)

    log('committed')

    const h = referenceAcceptance(hRule, SIDES)

    log('H')

    const dressingGates = (love: readonly { periodLargest: number[] }[], fear: readonly { periodLargest: number[] }[]): Record<string, boolean> =>
      Object.fromEntries(
        SIDES.dressing.flatMap((side, i) => [
          [`loveDressingSide${side}`, noMore(love[i]?.periodLargest ?? [], committed.love[i]?.periodLargest ?? [])],
          [`fearDressingSide${side}`, noMore(fear[i]?.periodLargest ?? [], committed.fear[i]?.periodLargest ?? [])],
        ]),
      )
    const hGates: Record<string, boolean> = {
      reverses: h.reverses || !committed.reverses,
      chargeKept: h.chargeKept || !committed.chargeKept,
      cptAtMirrorPhase: h.cptPhase >= 0 || committed.cptPhase < 0,
      vacuumPeriodic: h.vacuumPeriod > 0 || committed.vacuumPeriod <= 0,
      vacuumComponentsNoMore: h.vacuumComponents <= committed.vacuumComponents,
      denseComponentsNoMore: h.denseComponents <= committed.denseComponents,
      superposition: h.additivityWorst < 1e-9 || committed.additivityWorst >= 1e-9,
      wallsQuantized: (h.wallQuantized && h.wallMax > 0) || !(committed.wallQuantized && committed.wallMax > 0),
      ...dressingGates(h.love, h.fear),
      ...Object.fromEntries(BOX_GATES.map(g => [g, true])),
      ...Object.fromEntries(QUANTUM_GATES.map(g => [g, true])),
    }

    // the candidate, classical
    const rc = reversalAndCharge(HUB, SIDES.reversal)
    const cpt = cptAtCollision()
    const period = vacuumPeriod(HUB, SIDES.q)
    const vac = lineComponents(HUB, false, SIDES.components)
    const dense = lineComponents(HUB, true, SIDES.components)

    log('components')

    const additivity = additivityWorst(HUB, SIDES.additivity)
    const wall = walls(HUB, SIDES.walls)

    log('walls')

    const loves: LivingDressing[] = []
    const fears: LivingDressing[] = []

    for (const side of SIDES.dressing) {
      loves.push(dressing(HUB, side, 1))
      fears.push(dressing(HUB, side, -1))
      log(`dressing ${side}`)
    }

    const moving = travel(HUB, SIDES.travel)
    const box = boxGates(HUB, SIDES.q)

    log('travel, box')

    const gatesClassical: Record<string, boolean> = {
      reverses: rc.reverses,
      chargeKept: rc.chargeKept,
      cptAtMirrorPhase: cpt.phase >= 0,
      vacuumPeriodic: period > 0,
      vacuumComponentsNoMore: vac.trits <= committed.vacuumComponents,
      denseComponentsNoMore: dense.trits <= committed.denseComponents,
      superposition: additivity < 1e-9,
      wallsQuantized: wall.quantized && wall.settledMax > 0,
      ...dressingGates(loves, fears),
      boxReverses: box.boxReverses === 1,
      boxChargeKept: box.boxChargeKept === 1,
      noColorLeak: box.boxColorLeaks === 0,
      frameCommutes: box.boxFrameMismatch === 0,
      momentumKept: box.pDrift === 0,
      lineMomentaExchanged: (box.lineMomentumDrift ?? 0) > 0,
    }

    // the candidate, quantum
    const runs: Record<string, QuantumRun> = { on: quantum(HUB, 'on', SIDES.q), off: quantum(HUB, 'off', SIDES.q) }

    log('quantum')

    const ledger = coinMapLedger()

    // the transport
    const averaged = averagedMatrices({ table: isometricTable(), store: HUB.store(4, 0), cells: 256, permutations: table.permutations })
    const defect = Math.max(equivarianceDefect(averaged.even, table.permutations), equivarianceDefect(averaged.odd, table.permutations))
    const transport = readTransport([averaged.even, averaged.odd])
    const t3 = transport.three
    const xt = defect < 1e-10 && averaged.carriers === 24 && transport.invariants === 6
    const ht = (t3.charge ?? 0) >= 3.5 && (t3.trace ?? 0) >= 3.5 && (t3.sound ?? 0) >= 3.5 && Math.abs((t3.shear ?? 0) - 2) <= 0.5

    log('transport')

    const x1 = (runs.on?.metrics.controlsHold ?? 0) === 1 && (runs.off?.metrics.controlsHold ?? 0) === 1
    const gatesHere: Record<string, boolean> = { ...gatesClassical, ...(runs.on?.gates ?? {}) }
    const newlyFailing = Object.keys(hGates).filter(g => hGates[g] && !gatesHere[g])
    const newlyPassing = Object.keys(hGates).filter(g => !hGates[g] && gatesHere[g])
    const quantumFailing = QUANTUM_GATES.filter(g => !(runs.on?.gates[g] ?? false))
    const failsOnlyOn = QUANTUM_GATES.filter(g => (runs.off?.gates[g] ?? false) && !(runs.on?.gates[g] ?? false))
    const unevaluable = runs.on?.unevaluable ?? []
    const condition = newlyFailing.length === 0 && quantumFailing.length === 0
    const instruments = x0 && x1 && xt
    const status = instruments ? (condition && ht ? 'pass' : 'fail') : 'partial'
    const list = (xs: readonly string[]): string => (xs.length > 0 ? xs.join(', ') : 'none')
    const per = (xs: readonly number[] | undefined): string => (xs ?? []).join(', ')
    const flatten = (prefix: string, record: Record<string, number | boolean>): Record<string, number> =>
      Object.fromEntries(Object.entries(record).map(([k, v]) => [`${prefix}_${k}`, typeof v === 'boolean' ? (v ? 1 : 0) : v]))
    const dressingNumbers = (prefix: string, love: readonly (Dressing | LivingDressing)[], fear: readonly (Dressing | LivingDressing)[]): Record<string, number> =>
      Object.fromEntries(
        SIDES.dressing.flatMap((side, i) => [
          ...(love[i]?.periodLargest ?? []).map((x, p) => [`${prefix}Side${side}LovePeriod${p + 1}`, x] as const),
          ...(fear[i]?.periodLargest ?? []).map((x, p) => [`${prefix}Side${side}FearPeriod${p + 1}`, x] as const),
        ]),
      )
    const trade = CLASSICAL_GATES.concat(QUANTUM_GATES)
      .map(g => {
        const old = OLD_NAME[g] ?? g

        return `${g} H ${hGates[g] ? 'pass' : 'fail'} / 0079 (${old}) ${ONE_LINE_NEWLY_FAILING.includes(old) ? 'fail' : 'as H'} / here ${gatesHere[g] ? 'pass' : 'fail'}`
      })
      .join('; ')
    const m = runs.on?.metrics ?? {}

    return verdict({
      status: status as 'pass' | 'fail' | 'partial',
      claim: `the living-pair knit on the oriented hub vacuum ${condition ? 'works' : 'does not work'} with everything by E-FRC-0159's rule at sides ${SIDES.q}, ${SIDES.reversal}, ${SIDES.dressing.join(', ')}: against H at the same sides ${newlyFailing.length} gates newly fail (${list(newlyFailing)}) and ${newlyPassing.length} newly pass; ${quantumFailing.length} of 14 quantum gates fail with the fear beat on (CHSH ${(m.chsh ?? 0).toFixed(3)}); the lone-love wake per period is ${per(loves[1]?.periodLargest)} trits on side ${D2} (committed ${per(committed.love[1]?.periodLargest)}); the first-order husk transport is charge ${t3.charge?.toFixed(2)}, trace ${t3.trace?.toFixed(2)}, sound ${t3.sound?.toFixed(2)}, shear ${t3.shear?.toFixed(2)}`,
      metrics: {
        worksWithEverything: condition ? 1 : 0,
        newlyFailingVsH: newlyFailing.length,
        newlyPassingVsH: newlyPassing.length,
        quantumGatesFailingOn: quantumFailing.length,
        quantumUnevaluable: unevaluable.length,
        failsOnlyWithFearOn: failsOnlyOn.length,
        kernelMismatchBeats: agreements.reduce((s, a) => s + a.mismatches, 0),
        kernelVetoes: agreements.reduce((s, a) => s + a.vetoed, 0),
        ...flatten('here_gate', gatesClassical),
        ...flatten('H_gate', hGates),
        ...flatten('box', box),
        cptFailures: cpt.failures,
        vacuumPeriod: period,
        vacuumComponents: vac.trits,
        vacuumComponentsVibes: vac.vibes,
        denseComponents: dense.trits,
        additivityWorst: additivity,
        wallQuantized: wall.quantized ? 1 : 0,
        wallSettledMax: wall.settledMax,
        wallSettledMaxVibes: wall.settledMaxVibes,
        travellers: moving.travellers,
        travelFullSpeed: moving.fullSpeed,
        travelMeanReach: moving.meanReach,
        protectedSpecies: loves[1]?.protectedSpecies ?? -1,
        straightLoves: loves[1]?.straight ?? -1,
        ...dressingNumbers('here', loves, fears),
        ...dressingNumbers('committed', committed.love, committed.fear),
        ...dressingNumbers('H', h.love, h.fear),
        committedVacuumComponents: committed.vacuumComponents,
        committedDenseComponents: committed.denseComponents,
        committedWallMax: committed.wallMax,
        committedWallQuantized: committed.wallQuantized ? 1 : 0,
        committedVacuumPeriod: committed.vacuumPeriod,
        committedAdditivity: committed.additivityWorst,
        HVacuumComponents: h.vacuumComponents,
        HDenseComponents: h.denseComponents,
        HWallMax: h.wallMax,
        HWallQuantized: h.wallQuantized ? 1 : 0,
        HVacuumPeriod: h.vacuumPeriod,
        HAdditivity: h.additivityWorst,
        ...flatten('on_gate', runs.on?.gates ?? {}),
        ...flatten('off_gate', runs.off?.gates ?? {}),
        ...flatten('on', runs.on?.metrics ?? {}),
        ...flatten('off', runs.off?.metrics ?? {}),
        coinMapsKept: ledger.kept,
        transportDefect: defect,
        transportCarriers: averaged.carriers,
        transportInvariants: transport.invariants,
        ...Object.fromEntries(['charge', 'trace', 'sound', 'shear'].map(qq => [`transport_${qq}_exponent3`, t3[qq] ?? Number.NaN])),
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        ...dressingNumbers('committedControl', committed.love.slice(0, 1), committed.fear.slice(0, 1)),
      },
      notes: `L2. Gates: X0 ${x0}, X1 ${x1}, XT ${xt}, C ${condition}, HT ${ht}. Sides: quantum and box ${SIDES.q}, reversal ${SIDES.reversal}, components ${SIDES.components}, reference vacuum period ${SIDES.vacuum}, superposition ${SIDES.additivity}, walls ${SIDES.walls}, dressing ${SIDES.dressing.join(', ')}, travel ${SIDES.travel}. Newly failing against H: ${list(newlyFailing)}. Newly passing: ${list(newlyPassing)}. Quantum gates failing with the fear beat on: ${list(quantumFailing)}; not evaluable: ${list(unevaluable)}; failing only with the fear beat on: ${list(failsOnlyOn)}. Hub vacuum: period ${period}, line components ${vac.trits} (${vac.vibes}) and ${dense.trits}, superposition ${additivity.toExponential(2)}, wall ${wall.settledMax} trits (quantized ${wall.quantized}), dressing per period (love; fear) ${SIDES.dressing.map((s, i) => `side ${s}: ${per(loves[i]?.periodLargest)}; ${per(fears[i]?.periodLargest)}`).join(' | ')}, travel ${moving.fullSpeed} of 24 at full speed (${moving.travellers} at half), protected species ${loves[1]?.protectedSpecies}. Committed at these sides: components ${committed.vacuumComponents} and ${committed.denseComponents}, wall ${committed.wallMax} (quantized ${committed.wallQuantized}), dressing ${SIDES.dressing.map((s, i) => `side ${s}: ${per(committed.love[i]?.periodLargest)}; ${per(committed.fear[i]?.periodLargest)}`).join(' | ')}. H at these sides: components ${h.vacuumComponents} and ${h.denseComponents}, wall ${h.wallMax} (quantized ${h.wallQuantized}), dressing ${SIDES.dressing.map((s, i) => `side ${s}: ${per(h.love[i]?.periodLargest)}; ${per(h.fear[i]?.periodLargest)}`).join(' | ')}. Quantum (side ${SIDES.q}): vacuum pair kind ${m.vacuumPairKind}, ${m.vacuumMeetings} meetings in 480 beats, fears at most ${m.vacuumFearsMax}, chances ${m.chanceAfterMeeting1?.toFixed(4)}, ${m.chanceAfterMeeting2?.toFixed(4)}, ${m.chanceAfterMeeting3?.toFixed(4)} against the stand-in's ${m.standIn1?.toFixed(4)}, ${m.standIn2?.toFixed(4)}, ${m.standIn3?.toFixed(4)}, CHSH ${m.chsh?.toFixed(3)} (stand-in ${m.chshStandIn?.toFixed(3)}), matter CHSH ${m.matterChsh?.toFixed(3)}. Coin maps kept by the rule ${ledger.kept}. Transport (first order): defect ${defect.toExponential(2)}, ${averaged.carriers} oriented roots, ${transport.invariants} invariants, charge ${t3.charge?.toFixed(2)}, trace ${t3.trace?.toFixed(2)}, sound ${t3.sound?.toFixed(2)}, shear ${t3.shear?.toFixed(2)}. TRADE TABLE (gate: H at these sides / E-RLT-0079's one-line vacuum at the old sides / here): ${trade}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
