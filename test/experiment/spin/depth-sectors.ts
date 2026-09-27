// Why the husk cannot thermalize alone: the depth step is a symmetry of the knit, so the gas splits into
// closed depth sectors, one per divisor of the box depth, and the husk is the smallest.
//
// E-SPN-0048 found a depth-uniform fill frozen at 7 times the Fermi-Dirac Fano factor on the side-7 box and
// named the reason: the cold weave commutes with the depth step w -> w + 1. This experiment makes that exact
// and counts what it conserves.
//
// DERIVED BEFORE THE RUN. T4 (the depth step) commutes with the beat, so for every m dividing the side S the
// states with T4^m s = s are carried into themselves: a closed sector. For a LINEAR rule each depth momentum
// k4 would be conserved separately (S sectors); the cold weave is not linear, so what survives is the
// lattice of depth periods, one sector per divisor of S, the states whose depth Fourier content lies on the
// multiples of S / m. On S = 9 that is three: period 1 (k4 = 0 only, the husk), period 3 (k4 in 0, 3, 6)
// and everything. A state of period m is S / m copies of an m-layer gas, so if that gas reaches the
// exclusive-slot equilibrium of E-SPN-0050 each husk mode counts every vibe S / m times and
//   Fano(period m) = (S / m) (1 - n / g),
// 9 times and 3 times the Fermi-Dirac value here. Any content off the sector breaks it: a single flipped
// slot has content at every k4, so the gas should leave every sector and relax to 1 - n / g.
//
// THE BOX: code/tool/mesh's d4Mesh of side 9 (6,561 docks, 157,464 slots; a probe timed 18 ms a beat),
// the E-FLD-0032 cold weave as E-SPN-0048 builds it, density 0.4, stores 0 to 2, Weyl fills
// (code/measure/husk-bath periodicFill): period 1, period 3, one draw per slot (spread), and period 1 with
// one slot of dock 0 flipped (seeded). 1,500 beats; the window is beats 1,000 to 1,500, every 5th.
//
// Gates, fixed before the first run:
//   G1 the symmetry, exact: for the spread state after 20 beats and the six beats after, beat(T4 s) =
//      T4 beat(s) in every slot, store and line counter (0 failures).
//   G2 the sectors are closed and distinct: the period-1 run keeps 0 slots off its T4 image at every
//      sampled beat, the period-3 run keeps 0 off its T4^3 image and more than 0 off its T4 image.
//   G3 the husk Fano in the window, per class (axis, diagonal): period 1 within 5 percent of 9 (1 - n / g),
//      period 3 within 5 percent of 3 (1 - n / g), spread within 0.05 of 1 - n / g.
//   G4 any off-sector content relaxes: the seeded run ends with more than half its slots off their T4 image
//      and its window Fano within 0.05 of 1 - n / g in both classes.
//   G5 energy and charge exact in every run.
// Reported: the beat at which the seeded run's T4 mismatch first passes half the slots, the fills, and the
// number of closed sectors (the divisors of 9).
//
// Depth L2: a symmetry theorem measured on the knit's own gas, read on the husk.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { coldBeat, makeColdWeave, type ColdState, type ColdWeave } from '@/code/rule/cold-weave'
import { colorLocalCollision } from '@/code/rule/color-local-weave'
import { cptMirrorPhase } from '@/code/measure/weave-acceptance'
import { HEAD_TURN_SPEC, scatterSchedule, type ScatterWeaveSpec } from '@/code/rule/scatter-weave'
import { depthMismatch, depthShift, huskClass, makeHuskTally, periodicFill, sampleHusk, stateCharge, stateEnergy, type HuskClass } from '@/code/measure/husk-bath'

const SIDE = 9
const BEATS = 1500
const FROM = 1000
const EVERY = 5

function coldSpec(): ScatterWeaveSpec {
  const mirror = cptMirrorPhase((o, f) => colorLocalCollision({ spec: HEAD_TURN_SPEC, opposite: o, forward: f }))

  return { base: HEAD_TURN_SPEC, mirror, sets: scatterSchedule({ partitions: 2, pairs: 3 }), condition: 'matched' }
}

type Run = { classes: HuskClass[]; offSector: number; offShift1: number; halfBeat: number; energyExact: boolean; chargeExact: boolean; finalOffShift1: number }

function run(weave: ColdWeave, start: ColdState, period: number): Run {
  let s = start
  const e0 = stateEnergy(s)
  const q0 = stateCharge(s)
  const tally = makeHuskTally(SIDE)
  const slots = s.vibe.length + s.demon.length
  let offSector = 0
  let offShift1 = 0
  let halfBeat = -1

  for (let t = 0; t < BEATS; t++) {
    s = coldBeat(weave, s, t)

    const beat = t + 1

    if (beat % EVERY === 0) {
      if (period > 0) {
        offSector = Math.max(offSector, depthMismatch(s, SIDE, period))
      }

      const m1 = depthMismatch(s, SIDE, 1)

      offShift1 = Math.max(offShift1, m1)

      if (halfBeat < 0 && m1 > slots / 2) {
        halfBeat = beat
      }

      if (beat > FROM) {
        sampleHusk(tally, s.vibe)
      }
    }
  }

  return {
    classes: [huskClass(tally, 0), huskClass(tally, 1)],
    offSector,
    offShift1,
    halfBeat,
    finalOffShift1: depthMismatch(s, SIDE, 1),
    energyExact: stateEnergy(s) === e0,
    chargeExact: stateCharge(s) === q0,
  }
}

export default experiment({
  id: 'spin/depth-sectors',
  code: 'E-SPN-0056',
  title:
    'the husk is a closed depth sector, fail as gated on one threshold (the equilibrium share of slots off their depth image is 49 percent, the gate asked for more than half): the cold weave commutes exactly with the depth step, so on the side-9 box the gas splits into one closed sector per divisor of 9 (depth period 1, 3, 9), a period-m fill relaxes inside its sector to (9 / m) times the Fermi-Dirac Fano factor, and a single flipped slot, which has content at every depth momentum, takes the depth-uniform fill out of the husk sector to the full Fermi-Dirac value',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const weave = makeColdWeave({ mesh: d4Mesh({ side: SIDE }), spec: coldSpec() })

    // G1
    let s = periodicFill({ side: SIDE, period: 0 })

    for (let t = 0; t < 20; t++) {
      s = coldBeat(weave, s, t)
    }

    let commuteFailures = 0

    for (let t = 20; t < 26; t++) {
      const a = depthShift(coldBeat(weave, s, t), SIDE, 1)
      const b = coldBeat(weave, depthShift(s, SIDE, 1), t)
      const same = a.vibe.every((v, i) => v === b.vibe[i]) && a.store.every((v, i) => v === b.store[i]) && a.demon.every((v, i) => v === b.demon[i])

      commuteFailures += same ? 0 : 1
      s = coldBeat(weave, s, t)
    }

    const uniform = run(weave, periodicFill({ side: SIDE, period: 1 }), 1)
    const period3 = run(weave, periodicFill({ side: SIDE, period: 3 }), 3)
    const spread = run(weave, periodicFill({ side: SIDE, period: 0 }), 0)
    const seeded = run(weave, periodicFill({ side: SIDE, period: 1, seed: true }), 0)
    const slots = s.vibe.length + s.demon.length
    const ratio = (r: Run, c: number): number => (r.classes[c]?.fano ?? 0) / (r.classes[c]?.fermi ?? 1)

    const g1 = commuteFailures === 0
    const g2 = uniform.offSector === 0 && period3.offSector === 0 && period3.offShift1 > 0
    const g3 = [0, 1].every(c => Math.abs(ratio(uniform, c) / 9 - 1) <= 0.05 && Math.abs(ratio(period3, c) / 3 - 1) <= 0.05 && Math.abs((spread.classes[c]?.fano ?? 0) - (spread.classes[c]?.fermi ?? 0)) <= 0.05)
    const g4 = seeded.finalOffShift1 > slots / 2 && [0, 1].every(c => Math.abs((seeded.classes[c]?.fano ?? 0) - (seeded.classes[c]?.fermi ?? 0)) <= 0.05)
    const g5 = [uniform, period3, spread, seeded].every(r => r.energyExact && r.chargeExact)
    const gates = { G1: g1, G2: g2, G3: g3, G4: g4, G5: g5 }
    const ok = Object.values(gates).every(Boolean)
    const metrics: Record<string, number> = { commuteFailures, slotsAndCounters: slots, closedSectors: [1, 3, 9].length }

    for (const [name, r] of [
      ['uniform', uniform],
      ['period3', period3],
      ['spread', spread],
      ['seeded', seeded],
    ] as const) {
      ;['axis', 'diagonal'].forEach((label, c) => {
        const x = r.classes[c]!

        metrics[`${name}_${label}Fano`] = Number(x.fano.toPrecision(6))
        metrics[`${name}_${label}FermiDirac`] = Number(x.fermi.toPrecision(6))
        metrics[`${name}_${label}FanoOverFermi`] = Number((x.fano / x.fermi).toPrecision(6))
        metrics[`${name}_${label}Fill`] = Number(x.fill.toPrecision(6))
        metrics[`${name}_${label}TvBinomial`] = Number(x.tvBinomial.toPrecision(4))
      })
      metrics[`${name}_maxOffOwnSector`] = r.offSector
      metrics[`${name}_maxOffDepthStep`] = r.offShift1
      metrics[`${name}_finalOffDepthStep`] = r.finalOffShift1
      metrics[`${name}_beatHalfOffDepthStep`] = r.halfBeat
      metrics[`${name}_energyExact`] = r.energyExact ? 1 : 0
      metrics[`${name}_chargeExact`] = r.chargeExact ? 1 : 0
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the cold weave commutes with the depth step exactly, so the side-9 gas has three closed sectors (depth period 1, 3 and 9): a period-m fill stays in its sector and its husk Fano factor settles at (9 / m) times the Fermi-Dirac value, and one flipped slot, content at every depth momentum, carries the depth-uniform fill out of the husk sector to the Fermi-Dirac value',
      metrics: { ...metrics, ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])) },
      notes:
        'L2. FIRST RUN (2026-09-26, 119 s), gates as fixed: G1, G2, G3, G5 pass, G4 fails, status fail. THE SECTORS HOLD AS DERIVED: the beat commutes with the depth step on every slot, store and counter (0 failures in 6 beats); the depth-uniform fill never leaves period 1 and the period-3 fill never leaves period 3 (0 slots off at every sampled beat) though 118,000 slots differ from their one-step image; and the husk Fano factor over its Fermi-Dirac value is 8.94 and 9.00 for period 1 (predicted 9), 2.96 and 2.98 for period 3 (predicted 3), 0.991 for the spread fill (predicted 1). So each closed sector relaxes INSIDE itself to the exclusive-slot equilibrium of an m-layer gas, counted 9 / m times by the column sum. G4 FAILS ON ITS OWN THRESHOLD, NOT ON RELAXATION: the seeded run (one slot of the depth-uniform fill flipped) reaches Fano 0.503 and 0.504 against Fermi-Dirac 0.511 and 0.510 (passing that half) and ends with 116,958 of 236,196 slots and counters off their depth-step image, but the gate asked for more than half, and the equilibrium itself sits below half: the spread fill ends at 116,515 (49.3 percent), the seeded one at 49.5 percent. The threshold was set without estimating the equilibrium mismatch, which for a fill near 0.49 per slot with three store levels is just under one half. For the same reason the reported beat at which the mismatch passes half is -1 in every run, so the seeded run\'s relaxation time was not measured here (it had relaxed by beat 1,000). What this settles: a single flipped slot, which has content at every depth momentum, is enough to take the gas out of the husk sector, and the husk sector (k4 = 0 alone) cannot relax to the husk\'s own equilibrium because it is 9 copies of one 3D gas. The count of closed sectors is the number of divisors of the depth side (3 on side 9); a linear rule would conserve every k4 separately (9).',
    })
  },
})
