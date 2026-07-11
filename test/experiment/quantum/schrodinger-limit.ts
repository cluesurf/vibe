// The Schrodinger equation as the nonrelativistic limit of the emergent Dirac walk, measured from
// the dynamics. The walk's dispersion is cos(omega) = cos(mass) cos(k). Near zero momentum this
// becomes omega = mass + k squared over (2 tan mass): a rest energy plus the Schrodinger kinetic
// term k squared over twice an effective mass. So the nonrelativistic quantum particle emerges
// from the walk with effective mass tan(mass), which converges to the bare mass in the continuum
// limit (tan of mass goes to mass), the same discrete-versus-continuum structure as the tunneling
// law (E-QTM-0056): the discrete theory carries an exact refinement of the continuum formula.
//
// The frequency is measured from the dynamics itself: a momentum mode is evolved by the actual
// walk step and its frequency extracted by the exact two-frequency linear-prediction identity on
// the autocorrelation, no dispersion formula assumed. Measured: omega(k) matches the exact
// dispersion to machine precision, the small-k fit gives the effective mass tan(mass) (five point
// seven percent away from the continuum value at mass 0.4, converging as the mass shrinks), and
// the quadratic (Schrodinger) form fits at small k.
//
// The control is the massless walk: no gap, omega = k exactly (linear, relativistic, no quadratic
// regime), so the Schrodinger form is specifically the payoff of the mass gap, matching the
// physics (a massless particle has no nonrelativistic limit).
//
// Depth L2. It reproduces the Schrodinger dispersion from the substrate walk dynamics with the
// exact discrete effective mass tan(mass), converging to the continuum, against the massless
// control. Known physics reproduced, with the discrete refinement feeding the same prediction
// family as the tunneling law.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { omegaFromDynamics } from '@/code/dynamics/walk-dispersion'

const MASS = 0.4
const SMALL_K = [0.01, 0.02, 0.05]

export default experiment({
  id: 'quantum/schrodinger-limit',
  code: 'E-QTM-0060',
  title:
    'the walk dynamics gives omega = mass + k^2/(2 tan mass) at small k, the Schrodinger dispersion with exact discrete effective mass tan(mass) converging to the continuum mass, while the massless walk stays linear',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the dynamics-measured dispersion matches the exact form to machine precision
    let worstDispersionError = 0

    for (const k of [0.05, 0.1, 0.2, 0.5]) {
      const measured = omegaFromDynamics({ k, mass: MASS })
      const exact = Math.acos(Math.cos(MASS) * Math.cos(k))

      worstDispersionError = Math.max(
        worstDispersionError,
        Math.abs(measured - exact),
      )
    }

    // the effective mass from the small-k quadratic fit
    const restFrequency = omegaFromDynamics({ k: 0, mass: MASS })
    const effectiveMasses = SMALL_K.map(
      k =>
        (k * k) /
        (2 * (omegaFromDynamics({ k, mass: MASS }) - restFrequency)),
    )

    const discreteEffectiveMass = Math.tan(MASS)
    const worstMassError = Math.max(
      ...effectiveMasses.map(
        mass =>
          Math.abs(mass - discreteEffectiveMass) /
          discreteEffectiveMass,
      ),
    )

    // the discrete effective mass differs from the continuum bare mass measurably
    const continuumGapPercent =
      (100 * (discreteEffectiveMass - MASS)) / MASS

    // and converges to it as the mass shrinks (continuum limit)
    const gapAtSmallMass = Math.abs(Math.tan(0.04) - 0.04) / 0.04

    const converges =
      gapAtSmallMass <
      Math.abs(discreteEffectiveMass - MASS) / MASS / 50

    // CONTROL: the massless walk is exactly linear, no quadratic regime
    let worstMasslessError = 0

    for (const k of SMALL_K) {
      worstMasslessError = Math.max(
        worstMasslessError,
        Math.abs(omegaFromDynamics({ k, mass: 0 }) - k),
      )
    }

    const dispersionExact = worstDispersionError < 1e-9
    const schrodingerForm = worstMassError < 0.01
    const masslessLinear = worstMasslessError < 1e-9

    const ok =
      dispersionExact && schrodingerForm && masslessLinear && converges

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the mode frequency measured from the walk dynamics matches cos omega = cos mass cos k to machine precision, and at small momentum takes the Schrodinger form omega = mass + k^2/(2 m_eff) with the effective mass matching tan(mass) to under one percent, an exact discrete refinement sitting five point seven percent above the continuum bare mass at mass 0.4 and converging to it as the mass shrinks (the continuum limit recovered), while the massless walk is exactly linear with no quadratic regime, so the nonrelativistic quantum particle emerges from the substrate walk with a measurable discrete correction in the same prediction family as the tunneling law',
      metrics: {
        worstDispersionError: Number(
          worstDispersionError.toExponential(2),
        ),
        effectiveMassMeasured: Number(effectiveMasses[0]!.toFixed(5)),
        effectiveMassDiscrete: Number(discreteEffectiveMass.toFixed(5)),
        continuumMass: MASS,
        continuumGapPercent: Number(continuumGapPercent.toFixed(1)),
      },
      // CONTROL: the massless walk is exactly linear, no Schrodinger regime without a gap.
      control: {
        worstMasslessError: Number(worstMasslessError.toExponential(2)),
      },
      notes:
        'Schrodinger dispersion from the walk dynamics via the exact linear-prediction identity, effective mass tan(mass). The discrete-versus-continuum discriminator pairs with the tunneling law (E-QTM-0056).',
    })
  },
})
