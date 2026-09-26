// Forced couplings against 1 / 137.035999177, under the pre-registered null. E-MTH-0020 showed the committed
// coupling is chosen (alpha^-1 = 12 D sqrt(4 pi K N / 3) / e^2). This asks where a coupling could be FORCED,
// derives each candidate's value from its mechanism first, and only then compares.
//
// THE CANDIDATES, fixed before any comparison (the formulas are the code below; M = 16 for look-elsewhere):
//   A0  the committed rule on the side-12 husk box, electron = three vibes: 12 D sqrt(4 pi K N / 3) / 9,
//       K = 80, N = 8192, D = 12 (E-MTH-0020). Not a forced value: the reference point
//   A1  electric-magnetic self-duality of compact U(1) at unit charge, e^2 = 2 pi (hbar = 1): alpha^-1 = 2
//   A2  self-duality at the Z3 minimal charge e / 3 (Dirac: (e / 3) g = 2 pi, g = e / 3): alpha^-1 = 2 / 9
//   A3  the Z3 center gauge theory at its self-dual point, Villain beta = 3 / (2 pi): alpha^-1 = 4 pi beta = 6
//   A4  the model's own critical point: the thermal D4 bulk's beta_c from E-MTH-0023, 1 / e^2 = 2 beta on D4:
//       alpha^-1 = 8 pi beta_c, carrying E-MTH-0023's uncertainty (BULK)
//   A5  the hypercubic Wilson critical point, a STAND-IN for a husk transition the model has not measured:
//       beta_c = 1.0111331 (Arnold, Lippert, Neuhaus, Schilling 2003), alpha^-1 = 4 pi beta_c
//   A6, A7    A4, A5 run across one warp shell as a power: times lambda = 18.2787 (E-MTH-0007)
//   A8, A9    A4, A5 run across one shell as Randall-Sundrum's logarithm (1 / g4^2 = (depth) / g5^2 with the
//             depth ln of the warp): times ln lambda
//   A10, A11  A4, A5 diluted by the warped column of E-MTH-0020 (layer j weighs lambda^-j, the shell's share of
//             the ball, E-FRC-0177 s = 1): times the column depth sum lambda^-j = lambda / (lambda - 1)
//   A12, A13  the same with the layer's linear size (s = 1/3): times 1 / (1 - lambda^(-1/3))
//   A14 the light-speed ratio (the Bohr speed is alpha c): alpha = c_photon / v_walk with c_photon = 0.20225
//       (E-FRC-0179 at the committed kappa) and v_walk = 1 / sqrt 2, the fear walk's top speed (E-MTH-0010):
//       alpha^-1 = v_walk / c_photon
//   A15 the trit link: the angle resolved only to the Z3 center (N = 3), one sheet (D = 1), kappa at the
//       stability bound 1/4 (c = sqrt(1/6)), electron = three vibes: alpha^-1 = 12 x 3 x sqrt(1/6) / 9
// Two CONTROLS, famous numerology that must be refused: 4 pi^3 + pi^2 + pi = 137.0363 and Wyler's
// (9 / 8 pi^4)(pi^5 / 2^4 5!)^(1/4), alpha^-1 = 137.0361.
//
// THE JUDGE (code/measure/coupling-candidates, fixed before the run): a candidate is identified only by a
// match within 3 sigma of the combined precision, or, if it carries a measured uncertainty u, by landing
// within 2 u with both null rates under 0.01 at that tolerance: the E-MTH-0010 budget null (5,000 golden
// Weyl points) and the named-form chance times M = 16.
//
// Gates, fixed before the run:
// G1 the instrument: both controls are refused, and the target has no budget form at its own precision
// G2 the hypothesis: at least one candidate A1 to A15 is identified
// Status: pass only if G1 and G2 hold. The expected, and registered, outcome is fail on G2.
//
// DISCLOSED BEFORE THE RUN: while choosing the candidates, the E-FRC-0173 bracket (beta_c between 0.54 and
// 0.68) was multiplied by 4 pi lambda by hand and gave 124 to 156, around 137. The warp candidates were in the
// roadmap's list before that product was seen, and none was added or dropped for it; the D4 normalization
// (8 pi, not 4 pi) was then derived from the root pairs and moves A6 to about 2 x 137. A4's value comes from
// E-MTH-0023, which ran after this list was written; its number is entered below as a cited input.
//
// Depth L2: a discipline instrument applied to mechanisms, each derived, with its null.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { nullMatchRate } from '@/code/measure/integer-relation'
import { INVERSE_ALPHA, INVERSE_ALPHA_DELTA, NULL_SAMPLES, judge, targetBudgetHits, warpFactor } from '@/code/measure/coupling-candidates'

// E-MTH-0023, first run: the thermal D4 bulk's critical beta and its uncertainty (cited input)
const BETA_C_BULK = 0.6355123173066486
const BETA_C_BULK_UNCERTAINTY = 0.021145088405902512
const HYPERCUBIC_BETA_C = 1.0111331
const HYPERCUBIC_BETA_C_UNCERTAINTY = 2.1e-6
const K = 80
const N = 8192
const HUSK_BOX_DEPTH = 12
const TRIALS = 16

type Candidate = { readonly name: string; readonly value: number; readonly uncertainty: number }

export default experiment({
  id: 'method/alpha-candidates-under-the-null',
  code: 'E-MTH-0021',
  title:
    'forced couplings against 1/137.036 under the pre-registered null: self-duality, the Z3 center, the model\'s own critical point and the hypercubic one, each run across the warp by a power, a logarithm or a warped column, the light-speed ratio and a trit link, fifteen mechanisms derived before comparison, none identified, with the known numerology 4 pi^3 + pi^2 + pi and Wyler\'s formula refused as controls',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const lambda = warpFactor()
    const kappa = (2 * Math.PI * K) / N
    const cPhoton = Math.sqrt((2 * kappa) / 3)
    const bulk = 8 * Math.PI * BETA_C_BULK
    const bulkU = 8 * Math.PI * BETA_C_BULK_UNCERTAINTY
    const cube = 4 * Math.PI * HYPERCUBIC_BETA_C
    const cubeU = 4 * Math.PI * HYPERCUBIC_BETA_C_UNCERTAINTY
    const column1 = lambda / (lambda - 1)
    const columnThird = 1 / (1 - lambda ** (-1 / 3))
    const candidates: Candidate[] = [
      { name: 'A0CommittedRule', value: (12 * HUSK_BOX_DEPTH * Math.sqrt((4 * Math.PI * K * N) / 3)) / 9, uncertainty: 0 },
      { name: 'A1SelfDual', value: (4 * Math.PI) / (2 * Math.PI), uncertainty: 0 },
      { name: 'A2SelfDualThirds', value: (4 * Math.PI) / (9 * 2 * Math.PI), uncertainty: 0 },
      { name: 'A3CenterSelfDual', value: 4 * Math.PI * (3 / (2 * Math.PI)), uncertainty: 0 },
      { name: 'A4BulkCritical', value: bulk, uncertainty: bulkU },
      { name: 'A5HypercubicCritical', value: cube, uncertainty: cubeU },
      { name: 'A6BulkCriticalTimesWarp', value: bulk * lambda, uncertainty: bulkU * lambda },
      { name: 'A7HypercubicTimesWarp', value: cube * lambda, uncertainty: cubeU * lambda },
      { name: 'A8BulkCriticalLogWarp', value: bulk * Math.log(lambda), uncertainty: bulkU * Math.log(lambda) },
      { name: 'A9HypercubicLogWarp', value: cube * Math.log(lambda), uncertainty: cubeU * Math.log(lambda) },
      { name: 'A10BulkCriticalWarpedColumn', value: bulk * column1, uncertainty: bulkU * column1 },
      { name: 'A11HypercubicWarpedColumn', value: cube * column1, uncertainty: cubeU * column1 },
      { name: 'A12BulkCriticalColumnThird', value: bulk * columnThird, uncertainty: bulkU * columnThird },
      { name: 'A13HypercubicColumnThird', value: cube * columnThird, uncertainty: cubeU * columnThird },
      { name: 'A14LightSpeedRatio', value: Math.SQRT1_2 / cPhoton, uncertainty: 0 },
      { name: 'A15TritLink', value: (12 * 3 * Math.sqrt(1 / 6)) / 9, uncertainty: 0 },
    ]
    const controls: Candidate[] = [
      { name: 'C1FourPiCubedPlus', value: 4 * Math.PI ** 3 + Math.PI ** 2 + Math.PI, uncertainty: 0 },
      { name: 'C2Wyler', value: 1 / ((9 / (8 * Math.PI ** 4)) * ((Math.PI ** 5) / (16 * 120)) ** 0.25), uncertainty: 0 },
    ]
    const metrics: Record<string, number> = {}
    const record = (c: Candidate): boolean => {
      const j = judge({ value: c.value, uncertainty: c.uncertainty, target: INVERSE_ALPHA, delta: INVERSE_ALPHA_DELTA, trials: TRIALS })

      metrics[`${c.name}Value`] = c.value
      metrics[`${c.name}Uncertainty`] = c.uncertainty
      metrics[`${c.name}Relative`] = j.relative
      metrics[`${c.name}BudgetNull`] = j.budgetNull
      metrics[`${c.name}NamedNull`] = j.namedNull
      metrics[`${c.name}Identified`] = j.identified ? 1 : 0

      return j.identified
    }
    const identified = candidates.slice(1).filter(record).length

    record(candidates[0]!)

    const controlsRefused = controls.map(record).every(x => !x)
    const targetHits = targetBudgetHits(INVERSE_ALPHA, INVERSE_ALPHA_DELTA)
    const instrument = controlsRefused && targetHits === 0 && Number.isFinite(bulk)
    const ok = instrument && identified > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `no forced coupling in the model gives 1/137.036: of 15 mechanisms derived before comparison (self-duality at unit and third charge, the Z3 center's self-dual point, the model's bulk critical point and the hypercubic one, each run across one warp shell as a power, a logarithm and two warped columns, the light-speed ratio, a trit link), identified under the pre-registered null: ${identified} of 15, while the instrument refuses 4 pi^3 + pi^2 + pi and Wyler's formula`,
      metrics: { ...metrics, identifiedCount: identified, warpFactor: lambda, lightSpeed: cPhoton },
      control: {
        controlsRefused: controlsRefused ? 1 : 0,
        targetBudgetHitsAtOwnPrecision: targetHits,
        targetBudgetNullAtOwnPrecision: nullMatchRate(INVERSE_ALPHA, INVERSE_ALPHA_DELTA, NULL_SAMPLES),
        trials: TRIALS,
      },
      notes:
        'L2. Deterministic: the null is the golden Weyl sequence. First run, 2026-09-25, fail, on G2 as registered and on part of G1, which is disclosed. G2: 0 of 15 identified, every budget and named null 1; the nearest are the log-warp bulk critical point 46.4 +- 1.5 (-66 percent) and the hypercubic critical point times the warp 232.25 (+69 percent); the bulk critical point times the warp, the product hand-estimated at 124 to 156 before the list was fixed, is 291.95 +- 9.7 (+113 percent) once the D4 normalization 1 / e^2 = 2 beta and the measured beta_c = 0.6355 +- 0.0211 (E-MTH-0023) enter. The committed rule (A0) is 26,510 per electron charge on the side-12 husk box. G1: both controls are refused (4 pi^3 + pi^2 + pi misses by 2.2e-6 relative, Wyler by 6.1e-7, each a named chance of 4e-4 and 1e-4 with 16 trials, and each with a budget null of 1 at its gap), but the gate\'s second clause, no budget form at the target\'s own precision, FAILED: one form reaches it, 8 x^2 = 150,233 - 3 log 2 (error 6e-7 in x, inside 2.1e-8 relative of x^2), and the budget null at that precision is 0.12. The clause was an expectation, not a property of the budget: at alpha^-1 the x^2 branch has a tolerance of 5.8e-6 on 18,779, loose enough that a random number in the window is hit 12 percent of the time. So the budget cannot certify a searched form for alpha at any precision CODATA reaches, and only a value named in advance can count, which is how every candidate here was entered.',
    })
  },
})
