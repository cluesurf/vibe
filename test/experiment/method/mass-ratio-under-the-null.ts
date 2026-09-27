// m_p / m_e = 1836.152673426 against the curved crystal's powers of its growth rate, under the pre-registered
// null, with 6 pi^5 as the control the budget must refuse.
//
// The mechanism on offer (E-FRC-0030, E-FRC-0033): a mode localized n shells from the origin of {3,4,3,4}
// overlaps it by lambda^(-c n), c at least 1/2 (the marginal floor, forced by normalizability against the
// lambda^n shell growth) and 1 for a mode bound twice as deep; masses go as the overlap, so mass ratios are
// powers of lambda = 18.2787 (E-MTH-0007). The model has NO ELECTRON (the electron is an open block,
// E-SPN-0051 on) and its proton is a knot of three vibes whose mass the rule has not produced, so every
// assignment below is a STAND-IN structure, named in advance.
//
// THE CANDIDATES, fixed before the comparison (M = 4):
//   P1  proton at the origin, electron a mode three shells out bound at c = 1: lambda^3
//   P2  the same at the marginal floor c = 1/2, five shells out: lambda^(5/2)
//   P3  proton a knot of three constituents at the origin scale, electron two shells out at c = 1: 3 lambda^2
//   P4  the same at the floor, five half-steps: 3 lambda^(5/2)
// P1 and P2 are the two members of the family lambda^(m/2) on either side of the target. The family's own
// null is reported: a log-uniform target lands within relative deviation r of some member with chance
// 2 ln(1 + r) / ln(lambda^(1/2)), since the members are a factor lambda^(1/2) = 4.28 apart.
// CONTROLS, which must be refused:
//   C1  6 pi^5 = 1836.118, the famous near-miss (a gap of 1.1e6 times the ratio's uncertainty)
//   C2  lambda^(31/12), the best exponent with denominator at most 12 FITTED to the target after the fact
//
// THE JUDGE is E-MTH-0021's (code/measure/coupling-candidates). CODATA 2022: 1836.152673426 +- 3.2e-8.
//
// Gates, fixed before the run:
// G1 the instrument: C1 and C2 are refused; C1's budget null at its own gap is at least 0.01 (the budget, not
//    the precision alone, refuses it) while its bare named-form chance, with no look-elsewhere, is reported
//    beside it, the number that would have admitted it
// G2 the hypothesis: at least one of P1 to P4 is identified
// Status: pass only if G1 and G2 hold. The registered outcome is fail on G2.
//
// Depth L2: a discipline instrument on a mechanism that exists (E-FRC-0030) applied to a ratio it was not built
// for: the proton's mass is confinement, not a Yukawa overlap, which is the first reason to expect failure.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { namedFormChance, nullMatchRate } from '@/code/measure/integer-relation'
import { PROTON_ELECTRON, PROTON_ELECTRON_DELTA, judge, targetBudgetHits, warpFactor } from '@/code/measure/coupling-candidates'

const TRIALS = 4
const NULL_SAMPLES = 5000

type Candidate = { readonly name: string; readonly value: number }

export default experiment({
  id: 'method/mass-ratio-under-the-null',
  code: 'E-MTH-0022',
  title:
    'm_p / m_e against the powers of the {3,4,3,4} growth rate under the pre-registered null: lambda^3, lambda^(5/2), 3 lambda^2 and 3 lambda^(5/2), the stand-in structures named in advance, miss 1836.15 by 22 to 233 percent and none is identified, while the budget refuses 6 pi^5 (its null rate 1 at its own gap, though its bare named chance is 2e-4) and a fitted lambda^(31/12)',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const lambda = warpFactor()
    const candidates: Candidate[] = [
      { name: 'P1CubeOfWarp', value: lambda ** 3 },
      { name: 'P2FiveHalves', value: lambda ** 2.5 },
      { name: 'P3ThreeTimesSquare', value: 3 * lambda ** 2 },
      { name: 'P4ThreeTimesFiveHalves', value: 3 * lambda ** 2.5 },
    ]
    // the best exponent p / q, q <= 12, fitted to the target after the fact
    const exponent = Math.log(PROTON_ELECTRON) / Math.log(lambda)
    let fitted = { p: 0, q: 1, gap: Infinity }

    for (let q = 1; q <= 12; q++) {
      const p = Math.round(exponent * q)
      const gap = Math.abs(p / q - exponent)

      if (gap < fitted.gap - 1e-15) {
        fitted = { p, q, gap }
      }
    }

    const controls: Candidate[] = [
      { name: 'C1SixPiFifth', value: 6 * Math.PI ** 5 },
      { name: 'C2FittedExponent', value: lambda ** (fitted.p / fitted.q) },
    ]
    const metrics: Record<string, number> = {}
    const record = (c: Candidate): boolean => {
      const j = judge({ value: c.value, uncertainty: 0, target: PROTON_ELECTRON, delta: PROTON_ELECTRON_DELTA, trials: TRIALS })
      const logGap = Math.abs(Math.log(c.value / PROTON_ELECTRON))

      metrics[`${c.name}Value`] = c.value
      metrics[`${c.name}Relative`] = j.relative
      metrics[`${c.name}BudgetNull`] = j.budgetNull
      metrics[`${c.name}NamedNull`] = j.namedNull
      metrics[`${c.name}FamilyNull`] = Math.min(1, (2 * logGap) / Math.log(Math.sqrt(lambda)))
      metrics[`${c.name}Identified`] = j.identified ? 1 : 0

      return j.identified
    }
    const identified = candidates.filter(record).length
    const controlsRefused = controls.map(record).every(x => !x)
    const sixPiGap = Math.abs(6 * Math.PI ** 5 - PROTON_ELECTRON)
    const sixPiBudget = nullMatchRate(PROTON_ELECTRON, sixPiGap, NULL_SAMPLES)
    const sixPiBare = namedFormChance(PROTON_ELECTRON, sixPiGap)
    const instrument = controlsRefused && sixPiBudget >= 0.01
    const ok = instrument && identified > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the proton-electron mass ratio is not a power of the {3,4,3,4} growth rate in any structure named in advance: lambda^3, lambda^(5/2), 3 lambda^2 and 3 lambda^(5/2) give ${candidates.map(c => c.value.toFixed(1)).join(', ')} against 1836.15, identified: ${identified} of 4; the exponent the target needs, ${exponent.toFixed(4)}, is no shell count, and the instrument refuses 6 pi^5 (budget null ${sixPiBudget.toFixed(3)} at its gap, bare named chance ${sixPiBare.toExponential(1)}) and the fitted lambda^(${fitted.p}/${fitted.q})`,
      metrics: { ...metrics, identifiedCount: identified, warpFactor: lambda, neededExponent: exponent, fittedNumerator: fitted.p, fittedDenominator: fitted.q },
      control: {
        controlsRefused: controlsRefused ? 1 : 0,
        sixPiGapOverDelta: sixPiGap / PROTON_ELECTRON_DELTA,
        sixPiBudgetNullAtGap: sixPiBudget,
        sixPiBareNamedChance: sixPiBare,
        targetBudgetHitsAtOwnPrecision: targetBudgetHits(PROTON_ELECTRON, PROTON_ELECTRON_DELTA),
        targetBudgetNullAtOwnPrecision: nullMatchRate(PROTON_ELECTRON, PROTON_ELECTRON_DELTA, NULL_SAMPLES),
      },
      notes:
        'L2. Deterministic: the null is the golden Weyl sequence. First run, 2026-09-25, fail as registered: 0 of 4 identified. lambda^3 = 6107.1 (+233 percent), lambda^(5/2) = 1428.4 (-22.2 percent), 3 lambda^2 = 1002.3 (-45.4 percent), 3 lambda^(5/2) = 4285.3 (+133 percent), every budget null 1; within the family lambda^(m/2) the nearest member misses by a gap a log-uniform target beats 35 percent of the time. The exponent the target needs is 2.5864, no shell count and not the marginal 5/2. The controls: 6 pi^5 misses by 1.08e6 times the ratio\'s uncertainty and its budget null at its gap is 1.000, while its bare named-form chance is 1.9e-4 (7.5e-4 with the 4 trials): the bare chance alone would have admitted it, the budget refuses it. The fitted lambda^(31/12) = 1819.8 misses by 0.89 percent. Added after the first run, reported and not gated: the target\'s own budget null. At m_p / m_e the x^2 branch of the E-MTH-0010 budget is loose (a tolerance 2 x delta, 1.2e-4, on x^2 = 3.4e6), so 4 budget forms reach the target at its own precision by chance, all one relation, 3 x^2 = 10,114,372 - 3 log 2, and its multiples by 2, 3 and 4: a SEARCHED form could never be admitted here, only one named in advance (whose chance is the named-form chance times M). Why failure was expected: the proton\'s mass is confinement (the string\'s tension times its size), not a Yukawa overlap, so the localization mechanism of E-FRC-0030 is the wrong mechanism for this ratio; the model has neither an electron nor a proton mass to put in its place.',
    })
  },
})
