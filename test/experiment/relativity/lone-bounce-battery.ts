// The lone bounce knit on the oriented hub vacuum through E-FRC-0159's battery at sides divisible by 4, against the
// combined knit H REMEASURED at the same sides, with the EXACT periodic husk transport (E-RLT-0085).
//
// THE CANDIDATE. The rule: code/rule/bounce-pair-knit, collision 'lone' (E-RLT-0084: the full lines turn as -1 and
// nothing else moves on a dock holding at most one single line, the isometric map elsewhere), the pair move once per
// beat on alternate sides, the store that returns its tokens, the neutral veto. The vacuum: the oriented hub
// (code/measure/varying-vacuum orientedHubStore, period 4 D4, the least vacuum whose point group forces isotropic husk
// transport, E-RLT-0080), unstaggered (E-RLT-0083: the stagger changes nothing under this collision). Anchored so the
// dock an item seeds stores line 0, as in E-RLT-0082.
//
// THE BATTERY: code/measure/bounce-battery, E-RLT-0082's battery item for item with the collision a parameter, and one
// instrument change decided before this file ran: the frame change of the quantum items carries each coordinate's own
// point (carryCoordinate), as E-FRC-0159's battery does under the adopted comoving fear beat. varying-living-battery
// (and sparse-living-battery, living-pair-battery, candidate-battery) use moveCoordinate, which leaves the own points
// behind, so their frame change is not a frame change of the comoving rule: a probe before this file found that
// E-RLT-0082's 3,670 frameCommutesMatter mismatches on the isometric hub become 0 with the own points carried. That
// probe also found the swap-phase control reads 0 on the hub vacuum pair once the own points are carried (the hub's
// vacuum pairs meet as two loves or two fears, and the control changes only the love-fear kernel), so the control is
// read on the vacuum pair only when it meets as a love and a fear, and otherwise on the matter pair that does.
//
// THE REFERENCE, REMEASURED. H (the head-on turn base with the scatter block, unfolded, E-FRC-0159) and the committed
// knit are measured at the SAME sides by referenceAcceptance; H's box and quantum gates, which E-RLT-0082 took from
// E-FRC-0159's side-3 run, are REMEASURED here on the side-4 box (code/measure/combined-even-battery, E-FRC-0159's
// items with the side a parameter, checked against side 3 first).
//
// THE TRANSPORT, EXACT. code/measure/bounce-transport readPeriodicTransport: every dock of the side-4 period cell with its
// own exact collision matrices (E-RLT-0084's linearization carried to its oriented root), a Bloch wave through the
// periodic medium, its slow modes by subspace iteration at kc / 4 and kc / 16 in 16 husk directions (the 13 symmetric
// ones and 3 golden ones), kc the first-order reading's crossover. The cell folds the D4 gas's 12 exact staggered
// invariants onto k = 0, so the physical modes are selected by their cell-uniform content (threshold 0.25; on a uniform
// medium this reproduces the 72-index modes, the XP check). The cell average (first order, E-RLT-0082's reading) is
// reported beside it, and the same periodic reading of the isometric hub is the control.
//
// Gates, fixed before the first run:
//  X0 the kernel agrees with bounceBeat bit for bit on the side-4 box for 48 beats (hub, one-line, no store, Kronecker)
//  X1 the battery's controls hold on both quantum runs (fear beat on and off)
//  X2 the side-parametrized H battery reproduces E-FRC-0159 at side 3: all 14 quantum gates pass with the fear beat
//     on, the controls hold, the box gates pass
//  XP the periodic reader reproduces the 72-index slow modes on the uniform medium (charge decay to 1e-9 relative at
//     kc / 4 on the first axis, content at least 0.99)
//  C  the adoption condition: (a) no gate that H passes at these sides (box and quantum gates on side 4) fails here,
//     and (b) every quantum gate passes with the fear beat on
//  HT the exact periodic husk transport: charge, trace and sound exponents at least 3.5 and the shear 2 +- 0.5
// Verdict: pass if X0, X1, X2, XP, C and HT hold; fail if the X gates hold and C or HT does not; partial otherwise.
//
// PREDICTED before running: the dressing gates pass (E-RLT-0084's wake), the 14 quantum gates pass (a probe), the
// periodic charge exponent at least 3.5 (the point group forces it and the charge mode stays clean). NOT predicted:
// superposition, walls, the line components, travel, and the periodic trace and shear, where the probe saw the
// transverse momentum mix with the folded staggered modes (6 modes at content 0.51 on the first axis).
//
// Reported, not gated: the trade table (gate: H here / E-RLT-0082's hub vacuum / here), the committed and H numbers, the
// first-order transport, the periodic control on the isometric hub, and E-RLT-0082's frame reading reproduced.
//
// DISCLOSED: probes before this file measured the wake, the quantum items at side 4 (for the lone and the isometric hub
// and for H at sides 3 and 4), the uniform periodic check and one periodic hub solve.
//
// FIRST RUN (1,432 s): partial, recorded as is, no gate moved. X0, X2, XP hold. X1 FAILS: the swap-phase control reads 0
// on the vacuum pair once the frame change carries the own points (a probe had shown it, and the file's rule to read it
// on the vacuum pair when that pair meets as a love and a fear did not avoid it: the pair does meet so, and still reads
// 0), so the frame-covariance gates have no working negative control here; H's side-4 run keeps its control. C fails on
// vacuumComponentsNoMore (12 against the committed 3) and wallsQuantized (44,691 trits, not whole sheets), both predicted
// as unknown; the 14 quantum gates and every dressing gate pass. HT fails on the trace (0.06) and shear (-0.26); the
// isometric hub, whose point group forces both isotropic (E-RLT-0080), reads -0.06 and -0.82 with the same reader, and
// 5 to 8 modes per direction pass the content threshold with contents down to 0.51: the transverse momentum mixes with
// the 12 folded staggered invariants and the reader does not separate them. The charge (content 0.995) and sound are
// clean: 4.00 and 4.01 on the exact periodic medium. Title written after the run.
//
// Depth L2. DETERMINISM: golden and dense fills, Kronecker starts, Weyl start vectors (code/tool/weyl), fixed frames and
// layouts, no draw.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { groupTable } from '@/code/measure/color-isotropy-bound'
import { turningWeave } from '@/code/rule/collision'
import { combinedCollision } from '@/code/rule/combined-knit'
import { HEAD_TURN_SPEC } from '@/code/rule/scatter-weave'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { makeBounceKnit, type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { bounceKernelAgreement } from '@/code/measure/bounce-pair-kernel'
import { bounceLinearization } from '@/code/measure/bounce-linearization'
import { cellAverage, cellFamilies, dockMatrices, periodicMedium, periodicSlowModes, readPeriodicTransport, repeated } from '@/code/measure/bounce-transport'
import { goldenFill } from '@/code/measure/candidate-kernel'
import { storeStart } from '@/code/measure/token-store-gates'
import { sparseLivingState } from '@/code/measure/sparse-living-vacuum'
import { coinMapLedger, cptAtCollision } from '@/code/measure/living-pair-battery'
import { type Dressing, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { d4BoxCoordinates, d4Coordinates } from '@/code/substrate/d4-box'
import { coinData, orientedHubStore, uniformStore } from '@/code/measure/varying-vacuum'
import { equivarianceDefect, NAMED, ORIENTED, readTransport, SPACE } from '@/code/measure/varying-transport'
import { familiesOf, invariantsOf, slowModes } from '@/code/measure/store-transport'
import { huskDirections } from '@/code/measure/husk-transport-order'
import { EVEN_SIDES, layoutOf, referenceAcceptance, weaveOf } from '@/code/measure/varying-living-battery'
import { combinedBoxGates, combinedQuantum } from '@/code/measure/combined-even-battery'
import { additivityWorst, boxGates, dressing, lineComponents, quantum, reversalAndCharge, travel, vacuumPeriod, walls, type LivingDressing, type QuantumRun, type VaryingVacuum } from '@/code/measure/bounce-battery'
import { weyl } from '@/code/tool/weyl'

const ROOTS = rootsD4()
const SIDES = EVEN_SIDES
const [D1, D2, D3] = SIDES.dressing as [number, number, number]
const KIND: CollisionKind = 'lone'
const THRESHOLD = 0.25
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
// E-RLT-0082's hub vacuum (isometric map) at these sides: the gates it newly failed against its assumed H
const HUB_0082_NEWLY_FAILING = ['superposition', 'wallsQuantized', `loveDressingSide${D3}`, 'frameCommutesMatter']
const H_SPEC = { base: HEAD_TURN_SPEC, fold: false, scatter: true, mirror: 23, steer: false } as const

const noMore = (xs: readonly number[], ref: readonly number[]): boolean => xs.every((x, p) => x <= (ref[p] ?? 0))
const boxGateOf = (box: Record<string, number>): Record<string, boolean> => ({
  boxReverses: box.boxReverses === 1,
  boxChargeKept: box.boxChargeKept === 1,
  noColorLeak: box.boxColorLeaks === 0,
  frameCommutes: box.boxFrameMismatch === 0,
  momentumKept: box.pDrift === 0,
  lineMomentaExchanged: (box.lineMomentumDrift ?? 0) > 0,
})

export default experiment({
  id: 'relativity/lone-bounce-battery',
  code: 'E-RLT-0085',
  title:
    "the lone bounce knit on the oriented hub vacuum through E-FRC-0159's battery at sides divisible by 4, against H remeasured there, partial (the swap-phase control reads 0 once the own points are carried): all 14 quantum gates pass (CHSH 2.552), and the wake is bounded by the committed dressing at every side (13 to 28 trits per period on sides 8 to 16, committed up to 1,830), so the dressing gates newly pass on 5 counts; 2 gates newly fail, both structural: the vacuum's 12 lines stay 12 line components (committed 3), because the collision that keeps a lone vibe from scattering the vacuum also keeps it on its own line, and walls do not quantize (44,691 trits); the exact periodic husk transport keeps the charge and sound isotropic through k^4 (exponents 4.00, 4.01) but the trace and shear read 0.06 and -0.26, as do the isometric hub's (-0.06, -0.82), where the point group forces isotropy: the reader does not resolve them",
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
    const HUB: VaryingVacuum = { key: 'hub', collision: KIND, store: (side, anchor) => orientedHubStore(coins, side, hubFor(side, anchor)) }
    const HUB_K: VaryingVacuum = { key: 'hub', collision: 'isometric', store: HUB.store }

    // X0
    const q = SIDES.q
    const wq = weaveOf(q)
    const cellsQ = wq.mesh.cellCount
    const knitQ = makeBounceKnit(wq, 'alternate', true, KIND)
    const agreements = [HUB.store(q, 0), uniformStore(cellsQ, [0]), new Int8Array(cellsQ * 12)].map(store =>
      bounceKernelAgreement({ knit: knitQ, start: sparseLivingState({ ...goldenFill(cellsQ * 24, 1.37), store, layout: layoutOf(q) }), beats: 48 }),
    )

    agreements.push(bounceKernelAgreement({ knit: knitQ, start: storeStart(cellsQ, 11), beats: 48 }))

    const x0 = agreements.every(a => a.mismatches === 0 && a.vetoed > 0)

    log('x0')

    // X2 and the references
    const hSide3 = { on: combinedQuantum(H_SPEC, 'on', 3), off: combinedQuantum(H_SPEC, 'off', 3), box: boxGateOf(combinedBoxGates(H_SPEC, 3)) }
    const x2 = QUANTUM_GATES.every(g => hSide3.on.gates[g]) && hSide3.on.metrics.controlsHold === 1 && hSide3.off.metrics.controlsHold === 1 && Object.values(hSide3.box).every(Boolean)
    const hSide4 = { on: combinedQuantum(H_SPEC, 'on', q), off: combinedQuantum(H_SPEC, 'off', q), box: boxGateOf(combinedBoxGates(H_SPEC, q)) }

    log('H quantum')

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
      ...hSide4.box,
      ...Object.fromEntries(QUANTUM_GATES.map(g => [g, hSide4.on.gates[g] ?? false])),
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
      // the collision-level charge conjugation of the living-pair knit (E-RLT-0082's reading); B's own is E-RLT-0084's B2
      cptAtMirrorPhase: cpt.phase >= 0,
      vacuumPeriodic: period > 0,
      vacuumComponentsNoMore: vac.trits <= committed.vacuumComponents,
      denseComponentsNoMore: dense.trits <= committed.denseComponents,
      superposition: additivity < 1e-9,
      wallsQuantized: wall.quantized && wall.settledMax > 0,
      ...dressingGates(loves, fears),
      ...boxGateOf(box),
    }

    // the candidate, quantum; and E-RLT-0082's frame reading reproduced (the isometric hub, own points left behind)
    const runs: Record<string, QuantumRun> = { on: quantum(HUB, 'on', SIDES.q), off: quantum(HUB, 'off', SIDES.q) }
    const k0082Moved = quantum(HUB_K, 'on', SIDES.q, false)
    const k0082Carried = quantum(HUB_K, 'on', SIDES.q, true)

    log('quantum')

    const ledger = coinMapLedger()

    // the transport: the cell average, the exact periodic medium, and its uniform check
    const hubCell = orientedHubStore(coins, 4, [0, 0, 0, 0])
    const docks = dockMatrices({ kind: KIND, store: hubCell, cells: 256, permutations: table.permutations })
    const averaged = [cellAverage(docks.even), cellAverage(docks.odd)]
    const averageDefect = Math.max(equivarianceDefect(averaged[0]!, table.permutations), equivarianceDefect(averaged[1]!, table.permutations))
    const first = readTransport(averaged)
    const kc = first.kc
    const invariants = invariantsOf(SPACE, [...new Set([...docks.even, ...docks.odd])])
    const directions = huskDirections(3)
    const block = 6 + 12 + 8
    const extra = (b: number): Float64Array => Float64Array.from({ length: 256 * 72 }, (_, i) => weyl(i + 1 + b * 7919, 0.6180339887498949) - 0.5)
    const mesh4 = weaveOf(4).mesh

    log('first order')

    // XP: the uniform medium through the periodic reader
    const uniformLaws = Array.from({ length: 12 }, () => [1 / 3, 1 / 3, 1 / 3] as const)
    const u = [bounceLinearization({ kind: KIND, background: ORIENTED, mode: 'BP', laws: uniformLaws }), bounceLinearization({ kind: KIND, background: ORIENTED, mode: 'PB', laws: uniformLaws })]
    const uInvariants = invariantsOf(SPACE, u)
    const axis = directions[0] as number[]
    const axisFamilies = familiesOf(SPACE, NAMED, axis, uInvariants)
    const reference72 = slowModes(SPACE, u, axis.map(x => (x * kc) / 4), 6, axisFamilies).find(m => m.family === 'charge')
    const uniformPeriodic = periodicSlowModes({
      medium: periodicMedium(mesh4, Array.from({ length: 256 }, () => u[0]!), Array.from({ length: 256 }, () => u[1]!)),
      k: axis.map(x => (x * kc) / 4),
      start: [...uInvariants.map(v => repeated(v, 256)), ...Array.from({ length: block - 6 }, (_, b) => extra(b))],
      count: 6,
      families: cellFamilies(axisFamilies, 256),
    })
    const uniformCharge = uniformPeriodic.modes.filter(m => m.family === 'charge').reduce((best, m) => (m.content > best.content ? m : best), { gamma: 0, omega: 0, family: 'none', share: 0, content: -1 })
    const xp = reference72 !== undefined && Math.abs(uniformCharge.gamma - reference72.gamma) <= 1e-9 * reference72.gamma && uniformCharge.content >= 0.99

    log('xp')

    const periodic = readPeriodicTransport({ medium: periodicMedium(mesh4, docks.even, docks.odd), invariants, named: NAMED, space: SPACE, kc, directions, block, threshold: THRESHOLD, extra, log })

    log('periodic lone')

    const docksK = dockMatrices({ kind: 'isometric', store: hubCell, cells: 256, permutations: table.permutations })
    const periodicK = readPeriodicTransport({ medium: periodicMedium(mesh4, docksK.even, docksK.odd), invariants, named: NAMED, space: SPACE, kc, directions, block, threshold: THRESHOLD, extra })

    log('periodic isometric')

    const t3 = periodic.three
    const ht = (t3.charge ?? 0) >= 3.5 && (t3.trace ?? 0) >= 3.5 && (t3.sound ?? 0) >= 3.5 && Math.abs((t3.shear ?? 0) - 2) <= 0.5
    const x1 = (runs.on?.metrics.controlsHold ?? 0) === 1 && (runs.off?.metrics.controlsHold ?? 0) === 1
    const gatesHere: Record<string, boolean> = { ...gatesClassical, ...(runs.on?.gates ?? {}) }
    const newlyFailing = Object.keys(hGates).filter(g => hGates[g] && !gatesHere[g])
    const newlyPassing = Object.keys(hGates).filter(g => !hGates[g] && gatesHere[g])
    const quantumFailing = QUANTUM_GATES.filter(g => !(runs.on?.gates[g] ?? false))
    const condition = newlyFailing.length === 0 && quantumFailing.length === 0
    const instruments = x0 && x1 && x2 && xp
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
      .map(g => `${g} H ${hGates[g] ? 'pass' : 'fail'} / 0082 ${HUB_0082_NEWLY_FAILING.includes(g) ? 'fail' : 'as H'} / here ${gatesHere[g] ? 'pass' : 'fail'}`)
      .join('; ')
    const m = runs.on?.metrics ?? {}
    const transportNumbers = (prefix: string, r: { three: Record<string, number>; means: Record<string, number> }): Record<string, number> =>
      Object.fromEntries(['charge', 'trace', 'sound', 'shear'].flatMap(qq => [[`${prefix}_${qq}_exponent3`, r.three[qq] ?? Number.NaN], [`${prefix}_${qq}_mean`, r.means[qq] ?? Number.NaN]]))
    const fmt = (r: { three: Record<string, number> }): string => ['charge', 'trace', 'sound', 'shear'].map(qq => `${qq} ${r.three[qq]?.toFixed(2)}`).join(', ')

    return verdict({
      status: status as 'pass' | 'fail' | 'partial',
      claim: `the lone bounce knit on the oriented hub vacuum ${condition ? 'works' : 'does not work'} with everything by E-FRC-0159's rule at sides ${SIDES.q}, ${SIDES.reversal}, ${SIDES.dressing.join(', ')}: against H remeasured at the same sides ${newlyFailing.length} gates newly fail (${list(newlyFailing)}) and ${newlyPassing.length} newly pass; ${quantumFailing.length} of 14 quantum gates fail with the fear beat on (CHSH ${(m.chsh ?? 0).toFixed(3)}); the lone-love wake per period is ${per(loves[1]?.periodLargest)} trits on side ${D2} (committed ${per(committed.love[1]?.periodLargest)}); the exact periodic husk transport exponents are ${fmt(periodic)} (first order ${fmt(first)})`,
      metrics: {
        worksWithEverything: condition ? 1 : 0,
        newlyFailingVsH: newlyFailing.length,
        newlyPassingVsH: newlyPassing.length,
        quantumGatesFailingOn: quantumFailing.length,
        kernelMismatchBeats: agreements.reduce((s, a) => s + a.mismatches, 0),
        kernelVetoes: agreements.reduce((s, a) => s + a.vetoed, 0),
        ...flatten('here_gate', gatesClassical),
        ...flatten('H_gate', hGates),
        ...flatten('box', box),
        ...flatten('Hside4_on', hSide4.on.metrics),
        ...flatten('Hside3_on_gate', hSide3.on.gates),
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
        committedAdditivity: committed.additivityWorst,
        HVacuumComponents: h.vacuumComponents,
        HDenseComponents: h.denseComponents,
        HWallMax: h.wallMax,
        HWallQuantized: h.wallQuantized ? 1 : 0,
        HAdditivity: h.additivityWorst,
        ...flatten('on_gate', runs.on?.gates ?? {}),
        ...flatten('off_gate', runs.off?.gates ?? {}),
        ...flatten('on', runs.on?.metrics ?? {}),
        isometricHubFrameMatterMoved: k0082Moved.metrics.frameMismatchMatter ?? -1,
        isometricHubFrameMatterCarried: k0082Carried.metrics.frameMismatchMatter ?? -1,
        coinMapsKept: ledger.kept,
        averageDefect,
        ...transportNumbers('first', first),
        firstCrossoverK: kc,
        ...transportNumbers('periodic', periodic),
        periodicIterations: periodic.iterations,
        periodicWorstChange: periodic.worstChange,
        periodicChargeContent: periodic.chargeContent,
        periodicPhysicalModesMin: Math.min(...periodic.physicalCounts),
        periodicPhysicalModesMax: Math.max(...periodic.physicalCounts),
        periodicPhysicalContentMin: Math.min(...periodic.physicalContents),
        ...transportNumbers('periodicIsometric', periodicK),
        periodicIsometricPhysicalModesMax: Math.max(...periodicK.physicalCounts),
        periodicIsometricPhysicalContentMin: Math.min(...periodicK.physicalContents),
        xpUniformCharge: uniformCharge.gamma,
        xpReferenceCharge: reference72?.gamma ?? -1,
        xpContent: uniformCharge.content,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        ...dressingNumbers('committedControl', committed.love.slice(0, 1), committed.fear.slice(0, 1)),
        isometricHubFrameMatterMoved: k0082Moved.metrics.frameMismatchMatter ?? -1,
      },
      notes: `L2. Gates: X0 ${x0}, X1 ${x1}, X2 ${x2}, XP ${xp}, C ${condition}, HT ${ht}. Sides: quantum and box ${SIDES.q}, reversal ${SIDES.reversal}, components ${SIDES.components}, superposition ${SIDES.additivity}, walls ${SIDES.walls}, dressing ${SIDES.dressing.join(', ')}, travel ${SIDES.travel}. Newly failing against H (remeasured): ${list(newlyFailing)}. Newly passing: ${list(newlyPassing)}. Quantum gates failing with the fear beat on: ${list(quantumFailing)}. H on side 4: quantum failing with the fear beat on ${list(QUANTUM_GATES.filter(g => !hSide4.on.gates[g]))}, box ${JSON.stringify(hSide4.box)}, CHSH ${hSide4.on.metrics.chsh?.toFixed(4)}; H on side 3 (X2): quantum failing ${list(QUANTUM_GATES.filter(g => !hSide3.on.gates[g]))}, CHSH ${hSide3.on.metrics.chsh?.toFixed(4)}. Hub vacuum under the lone bounce knit: period ${period}, line components ${vac.trits} (${vac.vibes}) and ${dense.trits}, superposition ${additivity.toExponential(2)}, wall ${wall.settledMax} trits (quantized ${wall.quantized}), dressing per period (love; fear) ${SIDES.dressing.map((s, i) => `side ${s}: ${per(loves[i]?.periodLargest)}; ${per(fears[i]?.periodLargest)}`).join(' | ')}, travel ${moving.fullSpeed} of 24 at full speed (${moving.travellers} at half), protected species ${loves[1]?.protectedSpecies}. Committed at these sides: components ${committed.vacuumComponents} and ${committed.denseComponents}, wall ${committed.wallMax} (quantized ${committed.wallQuantized}), dressing ${SIDES.dressing.map((s, i) => `side ${s}: ${per(committed.love[i]?.periodLargest)}; ${per(committed.fear[i]?.periodLargest)}`).join(' | ')}. H at these sides: components ${h.vacuumComponents} and ${h.denseComponents}, wall ${h.wallMax} (quantized ${h.wallQuantized}), superposition ${h.additivityWorst.toExponential(2)}, dressing ${SIDES.dressing.map((s, i) => `side ${s}: ${per(h.love[i]?.periodLargest)}; ${per(h.fear[i]?.periodLargest)}`).join(' | ')}. Quantum (side ${SIDES.q}): vacuum pair kind ${m.vacuumPairKind}, ${m.vacuumMeetings} meetings, fears at most ${m.vacuumFearsMax}, CHSH ${m.chsh?.toFixed(3)} (stand-in ${m.chshStandIn?.toFixed(3)}), matter CHSH ${m.matterChsh?.toFixed(3)}, swap control ${m.frameMismatchSwapControl} (on the vacuum pair ${m.controlOnVacuumPair}). E-RLT-0082's frame reading reproduced: the isometric hub's matter pair with the own points left behind ${k0082Moved.metrics.frameMismatchMatter} mismatches, carried ${k0082Carried.metrics.frameMismatchMatter}. Coin maps kept (the living-pair knit's ledger) ${ledger.kept}. Transport, first order (cell average, 37 husk directions): defect ${averageDefect.toExponential(2)}, ${fmt(first)}, crossover ${kc.toFixed(4)}, means ${JSON.stringify(first.means)}. Exact periodic (side-4 cell, ${directions.length} husk directions, kc/4 and kc/16, block ${block}, content threshold ${THRESHOLD}): ${fmt(periodic)}, anisotropy ${JSON.stringify(periodic.anisotropy)}, means ${JSON.stringify(periodic.means)}, charge content at least ${periodic.chargeContent.toFixed(3)}, physical modes per direction ${Math.min(...periodic.physicalCounts)} to ${Math.max(...periodic.physicalCounts)} with content at least ${Math.min(...periodic.physicalContents).toFixed(3)}, ${periodic.iterations} iterations, worst last change ${periodic.worstChange.toExponential(2)}. Periodic control, the isometric hub: ${fmt(periodicK)}, anisotropy ${JSON.stringify(periodicK.anisotropy)}, means ${JSON.stringify(periodicK.means)}, physical modes up to ${Math.max(...periodicK.physicalCounts)}. XP: uniform charge decay ${uniformCharge.gamma.toExponential(8)} against the 72-index ${reference72?.gamma.toExponential(8)}, content ${uniformCharge.content.toFixed(4)}. TRADE TABLE (gate: H at these sides, remeasured / E-RLT-0082's hub under the isometric map / here): ${trade}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
