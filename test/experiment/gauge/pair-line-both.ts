// E-FRC-0218. The line's paid string with pairs born in both orientations: does it sample the mod-3 measure, and
// does its static residual between two static mesons (STAND-INS for nucleons) come out as E-FRC-0188's exact
// one-meson exchange when read from the rule's own histories?
//
// E-FRC-0189 found that the E-FRC-0129 line rule samples not the mod-3 measure E-FRC-0188 solved but its own ordered
// one: the pair move is (0, 0) -> (1, -1) only, so pairs are born love-left, charges never pass, and the integer flux
// stays at least 0 (charge density and paid fraction half the transfer matrix's). THE CHANGE (code/rule/pair-line):
// the pair move's orientation alternates with the beat, (0, 0) <-> (1, -1) on even beats and (0, 0) <-> (-1, 1) on
// odd ones. Each half-step stays an involution, energy and Gauss's law are untouched, and a love and a fear can now
// trade places (+- annihilates, -+ is born), so the integer flux is free to go below 0. The mod-3 measure counts the
// integer flux paths with steps 0, +1, -1 and weight x^([E mod 3 != 0]) y^([step != 0]), and every mod-3 path is
// exactly one such integer path, so an unrestricted integer flux IS the mod-3 measure (on the ring, in the sector of
// no net winding, which only changes a global constraint).
//
// A. THE MEASURE, at E-FRC-0189's coupling (mass 2, tension 3, capacity 14, q = 0.35): a ring of 4,096 cells, 16
//    mesons seeded, 100,000 settling beats, 800,000 beats read every 4th. Control: the same start under the old rule
//    (every pair love-left, code/rule/pair-line with both = false, which is code/rule/string-line to the bit).
// B. THE STATIC RESIDUAL, at a light coupling where it is large enough to read (mass 1, tension 1, capacity 6,
//    q = 0.5, chosen by the probe below before any residual was measured): a ring of 16,384 cells, 1,024 mesons
//    seeded, 20,000 settling beats, 400,000 beats read every 4th. The static mesons are read without pinning
//    (code/measure/pair-line-run): the pair correlation of the pattern [love, fear] on neighboring cells equals
//    Z_AB Z_0 / (Z_A Z_B) of the measure exactly, so its excess over the translation reference is E-FRC-0188's
//    connected ratio C(gap), which the exact transfer matrix gives at the demons' beta.
//
// Gates, fixed before the first run:
// G0 energy and Gauss's law exact on every 64th read and the last, in every run; each rule reverses exactly over
//    2,000 beats; the old-rule mode reproduces code/rule/string-line stringBeat bit for bit over 2,000 beats; in A the
//    new rule's integer flux goes below 0 (charges pass)
// G1 A, THE NEW RULE SAMPLES THE MOD-3 MEASURE: charge density and paid fraction within 5 percent of the transfer
//    matrix at the demons' beta, the meson profile at d = 1, 2, 3 within 10 percent each, and its rate over d = 1 to 5
//    within 5 percent of ln(lambda0 / x) (E-FRC-0189's gates, unchanged)
// G2 A, CONTROL: the old rule's charge density is NOT within 5 percent of the transfer matrix
// G3 B, ONE-MESON EXCHANGE FROM THE RULE: the new rule's C(gap) for two love-left static mesons is positive at more
//    than 3 errors at gaps 0 and 1, and at gaps 0, 1 and 2 lies within 3 errors of the exact transfer-matrix value at
//    the run's beta (errors: the spread of the 20 batch ratios, and of the exact value over the 20 batch betas, in
//    quadrature)
// Pass: all four. Partial: G0, G1 and G2 (the rule samples the mod-3 measure) with G3 failing. Fail: otherwise.
// Reported: the flipped pair (love-left with fear-left), the old rule's residual in B, the measured ratios
// C(gap) / C(gap + 1) against the exact ones and ln(lambda0 / lambda1), the halves of each run.
//
// DISCLOSED: a probe (tmp/py-probe-line.ts, tmp/py-probe-line.log) ran both rules for 40,000 beats at four couplings
// and printed each run's beta, charge density and paid fraction against the transfer matrix, and the EXACT predicted
// residuals, no measured residual. It showed that 128 seeded mesons in 4,096 cells at mass 2, tension 3 had not
// relaxed in 40,000 beats (charge density twice the prediction), which set A's 16 seeds and long settle, and that the
// predicted contact residual is 2e-3 there and 4e-2 at mass 1, tension 1, which set B's coupling. A smoke run of the
// reading code (tmp/py-probe-line-smoke.ts, 22,000 beats of A's setup) printed its time, exactness, reversal and flux
// range only.
//
// Depth L2: a constructed rule's dynamics against its own exact measure, with stand-in nucleons.
//
// The first run, recorded as it came out (178.9 s, tmp/frc0218.log): fail, on G1 and G3; G0 and G2 pass.
// A: the new rule's charges pass (integer flux -2 to 2, the old rule's never below 0), but at beta 1.027 its charge
// density is 0.655 of the transfer matrix's, paid fraction 0.670, profile 0.64, 1.06, 0.80 at d = 1 to 3 (rate 3.255
// against 3.082), and the density FALLS between the run's halves (2.32e-3, then 1.86e-3, against 3.19e-3): the dilute
// line has not relaxed in 900,000 beats, since its demons trade energy only through the few charges; the old rule reads
// 0.471 (G2). B: at mass 1, tension 1 (beta 0.936, x = y = 0.392) BOTH rules read the mod-3 densities, the new at
// 0.996 (charges) and 0.994 (paid), the old at 0.992: where matter is dense the old rule's level is not pinned either
// (its flux stays at least 0 but the mod-3 local statistics are reached). The new rule's static residual is 4.04e-2
// +- 7.5e-4, 1.01e-2 +- 7.6e-4, 2.9e-4 +- 6.2e-4 at gaps 0, 1, 2 against the exact 4.28e-2, 1.05e-2, 2.67e-3: gap 1
// agrees (0.5 errors), gaps 0 and 2 miss by 3.1 and 3.8 errors, and every far gap reads NEGATIVE, -2.3e-3 +- 7e-4 at
// gaps 5 and 6 where the exact value is 5e-5 and 2e-5, in the flipped pair and the old rule too. REPORTED, NOT GATED,
// a reading after the run: shifted up by that far offset (2.3e-3), the new rule reads 4.27e-2, 1.24e-2, 2.6e-3 at gaps
// 0, 1, 2 against 4.28e-2, 1.05e-2, 2.67e-3. The offset's source is not identified; the per-read translation reference
// can only shift g - 1 by about the integral of C over the ring (1e-5 here), so it is a long-range correlation the
// rule's slow energy transport leaves in place, not the estimator's sum rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { stringBeat, type StringLine, type StringState } from '@/code/rule/string-line'
import { pairLineBeat } from '@/code/rule/pair-line'
import { unitDemonBeta } from '@/code/dynamics/finite-kinetic'
import { modThreePredictions, pairLineRun, pairLineStart, type PairLineRun, type PairLineSetup } from '@/code/measure/pair-line-run'

const MEASURE: PairLineSetup = { cells: 4096, mass: 2, tension: 3, capacity: 14, q: 0.35, seeds: 16, settle: 100000, beats: 800000, every: 4, batches: 20, profile: 5, gaps: 6 }
const RESIDUAL: PairLineSetup = { cells: 16384, mass: 1, tension: 1, capacity: 6, q: 0.5, seeds: 1024, settle: 20000, beats: 400000, every: 4, batches: 20, profile: 5, gaps: 6 }
const CHECK_BEATS = 2000
const DENSITY_TOLERANCE = 0.05
const PROFILE_TOLERANCE = 0.1
const RATE_TOLERANCE = 0.05
const SIGMAS = 3
const RESIDUAL_GAPS = [0, 1, 2]

type Reading = {
  beta: number
  x: number
  y: number
  charges: number
  paid: number
  profile: number[]
  profileRate: number
  same: { value: number; error: number }[]
  flipped: { value: number; error: number }[]
  halves: [number, number]
}

function read(run: PairLineRun, setup: PairLineSetup): Reading {
  const b = run.batches
  const reads = b.reduce((a, x) => a + x.reads, 0)
  const cells = setup.cells
  const beta = unitDemonBeta({ meanDemon: b.reduce((a, x) => a + x.demon, 0) / (reads * cells), capacity: setup.capacity })
  const profile = Array.from({ length: setup.profile + 1 }, (_, d) => b.reduce((a, x) => a + (x.profile[d] as number), 0) / (reads * cells))
  const points = profile.map((v, d) => ({ d, v })).filter(p => p.d >= 1 && p.v > 0)
  const mx = points.reduce((a, p) => a + p.d, 0) / points.length
  const my = points.reduce((a, p) => a + Math.log(p.v), 0) / points.length
  const slope = points.reduce((a, p) => a + (p.d - mx) * (Math.log(p.v) - my), 0) / points.reduce((a, p) => a + (p.d - mx) ** 2, 0)
  const connected = (which: 'same' | 'flipped'): { value: number; error: number }[] =>
    Array.from({ length: setup.gaps + 1 }, (_, gap) => {
      const real = b.reduce((a, x) => a + (x[which][gap] as number), 0)
      const reference = b.reduce((a, x) => a + (which === 'same' ? x.sameReference : x.flippedReference), 0)
      const ratios = b.map(x => (x[which][gap] as number) / (which === 'same' ? x.sameReference : x.flippedReference))
      const mean = ratios.reduce((a, v) => a + v, 0) / ratios.length
      const spread = Math.sqrt(ratios.reduce((a, v) => a + (v - mean) ** 2, 0) / (ratios.length - 1))

      return { value: real / reference - 1, error: spread / Math.sqrt(ratios.length) }
    })
  const half = Math.floor(b.length / 2)
  const densityOf = (list: typeof b): number => list.reduce((a, x) => a + x.charges, 0) / (list.reduce((a, x) => a + x.reads, 0) * cells)

  return {
    beta,
    x: Math.exp(-beta * setup.tension),
    y: Math.exp(-beta * setup.mass),
    charges: b.reduce((a, x) => a + x.charges, 0) / (reads * cells),
    paid: b.reduce((a, x) => a + x.paid, 0) / (reads * cells),
    profile,
    profileRate: -slope,
    same: connected('same'),
    flipped: connected('flipped'),
    halves: [densityOf(b.slice(0, half)), densityOf(b.slice(half))],
  }
}

// the exact C(gap) at each batch's own beta: its spread is the temperature's share of the error
function exactSpread(run: PairLineRun, setup: PairLineSetup): number[] {
  const values = run.batches.map(x => {
    const beta = unitDemonBeta({ meanDemon: x.demon / (x.reads * setup.cells), capacity: setup.capacity })

    return modThreePredictions({ x: Math.exp(-beta * setup.tension), y: Math.exp(-beta * setup.mass), profile: 1, gaps: setup.gaps }).same
  })

  return Array.from({ length: setup.gaps + 1 }, (_, gap) => {
    const v = values.map(list => list[gap] as number)
    const mean = v.reduce((a, x) => a + x, 0) / v.length

    return Math.sqrt(v.reduce((a, x) => a + (x - mean) ** 2, 0) / (v.length - 1)) / Math.sqrt(v.length)
  })
}

// the old-rule mode against code/rule/string-line, bit for bit
function oldRuleAgrees(setup: PairLineSetup, beats: number): boolean {
  const start = pairLineStart(setup)
  const line: StringLine = { cells: setup.cells, mass: setup.mass, tension: setup.tension, capacity: setup.capacity }
  const mine = { vibe: Int8Array.from(start.vibe), flux: Int32Array.from(start.flux), demon: Int32Array.from(start.demon) }
  const scratch = new Int32Array(setup.cells)

  let reference: StringState = { vibe: Int8Array.from(start.vibe), flux: Int32Array.from(start.flux), demon: Int32Array.from(start.demon) }

  for (let t = 0; t < beats; t++) {
    reference = stringBeat(line, reference, t)
    pairLineBeat(line, mine, t, false, scratch)

    if (!mine.vibe.every((v, i) => v === reference.vibe[i]) || !mine.flux.every((v, i) => v === reference.flux[i]) || !mine.demon.every((v, i) => v === reference.demon[i])) {
      return false
    }
  }

  return true
}

export default experiment({
  id: 'gauge/pair-line-both',
  code: 'E-FRC-0218',
  title:
    "the line's paid string with pairs born in both orientations: does it sample the mod-3 measure E-FRC-0188 solved, and does the rule's own static residual between two static mesons (stand-ins for nucleons) come out as the exact one-meson exchange",
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const agrees = oldRuleAgrees(MEASURE, CHECK_BEATS)
    const newA = pairLineRun({ setup: MEASURE, both: true, reverseCheck: CHECK_BEATS })
    const oldA = pairLineRun({ setup: MEASURE, both: false, reverseCheck: CHECK_BEATS })
    const newB = pairLineRun({ setup: RESIDUAL, both: true, reverseCheck: CHECK_BEATS })
    const oldB = pairLineRun({ setup: RESIDUAL, both: false, reverseCheck: CHECK_BEATS })
    const nA = read(newA, MEASURE)
    const oA = read(oldA, MEASURE)
    const nB = read(newB, RESIDUAL)
    const oB = read(oldB, RESIDUAL)
    const predict = (r: Reading, setup: PairLineSetup): ReturnType<typeof modThreePredictions> => modThreePredictions({ x: r.x, y: r.y, profile: setup.profile, gaps: setup.gaps })
    const pnA = predict(nA, MEASURE)
    const poA = predict(oA, MEASURE)
    const pnB = predict(nB, RESIDUAL)
    const poB = predict(oB, RESIDUAL)
    const spreadB = exactSpread(newB, RESIDUAL)
    const within = (a: number, b: number, tolerance: number): boolean => Number.isFinite(a) && b > 0 && Math.abs(a / b - 1) < tolerance
    const g0 =
      agrees &&
      [newA, oldA, newB, oldB].every(r => r.exact && r.reverses) &&
      newA.lowestFlux < 0
    const g1 =
      within(nA.charges, pnA.charges, DENSITY_TOLERANCE) &&
      within(nA.paid, pnA.paid, DENSITY_TOLERANCE) &&
      [1, 2, 3].every(d => within(nA.profile[d] as number, pnA.profile[d] as number, PROFILE_TOLERANCE)) &&
      within(nA.profileRate, pnA.profileRate, RATE_TOLERANCE)
    const g2 = !within(oA.charges, poA.charges, DENSITY_TOLERANCE)
    const g3 =
      [0, 1].every(gap => (nB.same[gap]?.value ?? 0) > SIGMAS * (nB.same[gap]?.error ?? Infinity)) &&
      RESIDUAL_GAPS.every(gap => {
        const m = nB.same[gap] as { value: number; error: number }

        return Math.abs(m.value - (pnB.same[gap] as number)) < SIGMAS * Math.hypot(m.error, spreadB[gap] as number)
      })
    const status = g0 && g1 && g2 && g3 ? 'pass' : g0 && g1 && g2 ? 'partial' : 'fail'
    const metrics: Record<string, number> = {
      measureBeta: nA.beta,
      measureX: nA.x,
      measureY: nA.y,
      chargeDensity: nA.charges,
      chargeDensityPredicted: pnA.charges,
      chargeOverPredicted: nA.charges / pnA.charges,
      paidFraction: nA.paid,
      paidFractionPredicted: pnA.paid,
      paidOverPredicted: nA.paid / pnA.paid,
      profileRate: nA.profileRate,
      profileRatePredicted: pnA.profileRate,
      chargeDensityFirstHalf: nA.halves[0],
      chargeDensitySecondHalf: nA.halves[1],
      lowestFluxNewRule: newA.lowestFlux,
      highestFluxNewRule: newA.highestFlux,
      lowestFluxOldRule: oldA.lowestFlux,
      oldRuleBeta: oA.beta,
      oldRuleChargeOverPredicted: oA.charges / poA.charges,
      oldRulePaidOverPredicted: oA.paid / poA.paid,
      residualBeta: nB.beta,
      residualX: nB.x,
      residualY: nB.y,
      residualChargeOverPredicted: nB.charges / pnB.charges,
      residualPaidOverPredicted: nB.paid / pnB.paid,
      exchangeRatePredicted: pnB.exchangeRate,
      oldRuleResidualBeta: oB.beta,
      oldRuleResidualChargeOverPredicted: oB.charges / poB.charges,
      oldRuleLowestFluxResidual: oldB.lowestFlux,
      newRuleLowestFluxResidual: newB.lowestFlux,
      gateExact: g0 ? 1 : 0,
      gateModThreeMeasure: g1 ? 1 : 0,
      gateOldRuleControl: g2 ? 1 : 0,
      gateOneMesonExchange: g3 ? 1 : 0,
    }

    for (let d = 1; d <= MEASURE.profile; d++) {
      metrics[`mesonProfileD${d}OverPredicted`] = (nA.profile[d] as number) / (pnA.profile[d] as number)
    }

    for (let gap = 0; gap <= RESIDUAL.gaps; gap++) {
      metrics[`sameGap${gap}`] = nB.same[gap]?.value as number
      metrics[`sameGap${gap}Error`] = nB.same[gap]?.error as number
      metrics[`sameGap${gap}Exact`] = pnB.same[gap] as number
      metrics[`sameGap${gap}ExactSpread`] = spreadB[gap] as number
      metrics[`flippedGap${gap}`] = nB.flipped[gap]?.value as number
      metrics[`flippedGap${gap}Error`] = nB.flipped[gap]?.error as number
      metrics[`flippedGap${gap}Exact`] = pnB.flipped[gap] as number
      metrics[`oldRuleSameGap${gap}`] = oB.same[gap]?.value as number
      metrics[`oldRuleSameGap${gap}Error`] = oB.same[gap]?.error as number
      metrics[`oldRuleSameGap${gap}ExactModThree`] = poB.same[gap] as number
    }

    for (let gap = 0; gap < RESIDUAL.gaps; gap++) {
      metrics[`sameRatioLogGap${gap}`] = Math.log((nB.same[gap]?.value as number) / (nB.same[gap + 1]?.value as number))
      metrics[`sameRatioLogGap${gap}Exact`] = Math.log((pnB.same[gap] as number) / (pnB.same[gap + 1] as number))
    }

    return verdict({
      status,
      claim: `with pairs born in both orientations the line's charges pass (lowest integer flux ${newA.lowestFlux}); at E-FRC-0189's coupling (beta ${nA.beta.toFixed(4)}) its charge density is ${(nA.charges / pnA.charges).toFixed(4)}, its paid fraction ${(nA.paid / pnA.paid).toFixed(4)} and its meson profile ${[1, 2, 3].map(d => ((nA.profile[d] as number) / (pnA.profile[d] as number)).toFixed(3)).join(', ')} of the mod-3 transfer matrix's, profile rate ${nA.profileRate.toFixed(3)} against ${pnA.profileRate.toFixed(3)}, where the old rule reads ${(oA.charges / poA.charges).toFixed(3)}; at mass 1, tension 1 (beta ${nB.beta.toFixed(4)}) the rule's own static-meson residual is ${RESIDUAL_GAPS.map(g => `${(nB.same[g]?.value as number).toExponential(3)} +- ${(nB.same[g]?.error as number).toExponential(1)}`).join(', ')} at gaps 0, 1, 2 against the exact ${RESIDUAL_GAPS.map(g => (pnB.same[g] as number).toExponential(3)).join(', ')}`,
      metrics,
      control: {
        oldRuleChargeOverPredicted: oA.charges / poA.charges,
        oldRuleSameGap0: oB.same[0]?.value as number,
      },
      notes:
        'L2. Exact integers and exact reversal, no random numbers: seeds at golden Weyl positions, demons from the silver Weyl sequence through the truncated law q^d. The static mesons are read as the pair correlation of the [love, fear] pattern, which equals the connected ratio of two static mesons in the measure exactly (a charged free cell weighs y, a static one 1). The ring keeps its net charge at exactly 0 where the transfer matrix\'s trace counts every multiple of 3, a global constraint whose share of a local reading falls as one over the ring length. Nothing moves: a pattern is read afresh from each snapshot.',
    })
  },
})
