// Vibe-to-Hameroff bridge (Orch-OR): the deterministic reconstruction of Penrose's
// objective-reduction collapse time. Penrose ends a superposition after t = h-bar / E_G,
// with E_G the gravitational self-energy of the mass separation, an energy-time relation:
// the collapse fires when the accumulated phase difference between the two branches reaches
// order one, E_G t ~ h-bar. Penrose adds this as a stochastic collapse rate on top of
// quantum gravity. Vibe adds no rate. It shows the same energy-time law fall out of its
// emergent quantum for free.
//
// On the substrate's emergent Dirac quantum walk, two positive-energy momentum eigenstates
// (energies from the emergent dispersion cos(omega) = cos(mass) cos(k)) are superposed and
// evolved by the committed reversible rule. The survival probability P(t) = |<psi0|psi(t)>|^2
// falls to zero (the state becomes orthogonal to its start, the dephasing complete) and
// revives, oscillating at exactly the energy gap dE = |omega1 - omega2|, so the
// orthogonalization (collapse) time is t = pi / dE. This is the energy-time uncertainty
// relation, of which Penrose OR is the gravitational instance.
//
// Two independent measurements make it non-circular. First, the dephasing rate read off the
// survival curve by a discrete Fourier transform (a dynamical quantity) equals the emergent
// dispersion gap (a kinematic quantity) to a fraction of a percent, so the collapse time is
// genuinely set by the emergent energy gap, not put in by hand. Second, the survival
// probability actually reaches zero, so the state fully orthogonalizes, and the
// orthogonalization time times the gap is pi across a sweep of momentum pairs.
//
// The control is a SINGLE eigenmode (zero energy gap): its survival probability stays at one
// forever, it never dephases, so the collapse is driven by the energy gap and by nothing
// else. As the gap goes to zero the collapse time pi / dE diverges, exactly Penrose's
// h-bar / E_G with E_G going to zero.
//
// Depth L2. It reproduces the energy-time collapse relation on the substrate's emergent
// quantum, with the gap measured two independent ways and a zero-gap control, and reads it
// against Orch-OR. It is a deterministic reconstruction of the structure of Penrose OR, not
// a claim that OR is a real stochastic process.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { diracTwoModeSurvival } from '@/code/dynamics/quantum-walk'
import { dominantBinAngularFrequency } from '@/code/measure/dominant-frequency'

const SIZE = 400
const MASS = 0.5
const BEATS = 2000
const PAIRS: [number, number][] = [
  [20, 40],
  [20, 60],
  [16, 80],
  [24, 56],
  [30, 50],
  [10, 70],
]

// the interpolated location of the first minimum of a series (sub-beat precision)
function firstMinimumTime(series: number[]): number {
  for (let t = 1; t < series.length - 1; t++) {
    if (series[t]! <= series[t - 1]! && series[t]! <= series[t + 1]!) {
      const a = series[t - 1]!
      const b = series[t]!
      const c = series[t + 1]!
      const denominator = a - 2 * b + c
      const offset =
        Math.abs(denominator) < 1e-12
          ? 0
          : (0.5 * (a - c)) / denominator

      return t + offset
    }
  }

  return series.length
}

export default experiment({
  id: 'quantum/energy-time-collapse-law',
  code: 'E-QTM-0051',
  title:
    'the emergent quantum dephasing (collapse) time is set by the energy gap, t = pi / dE, the deterministic reconstruction of Penrose OR t = h-bar / E_G (Hameroff bridge)',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    let maxGapError = 0
    let minSurvivalReached = Infinity
    let maxProductError = 0
    let sumProduct = 0

    const perPair: Record<string, number> = {}

    for (const [indexA, indexB] of PAIRS) {
      const { survival, dispersionGap } = diracTwoModeSurvival({
        indexA,
        indexB,
        size: SIZE,
        mass: MASS,
        beats: BEATS,
      })

      // the dephasing rate read off the survival curve (dynamics) vs the dispersion gap
      const measuredGap = dominantBinAngularFrequency(survival)
      const gapError = Math.abs(measuredGap / dispersionGap - 1)

      // the survival reaches zero (full orthogonality) and its first minimum sits at pi/dE
      const minSurvival = Math.min(...survival)
      const orthogonalizationTime = firstMinimumTime(survival)
      const product = orthogonalizationTime * dispersionGap

      maxGapError = Math.max(maxGapError, gapError)
      minSurvivalReached = Math.min(minSurvivalReached, minSurvival)
      maxProductError = Math.max(
        maxProductError,
        Math.abs(product - Math.PI),
      )
      sumProduct += product
      perPair[`gap_${indexA}_${indexB}`] = Number(
        dispersionGap.toFixed(4),
      )

      perPair[`product_${indexA}_${indexB}`] = Number(
        product.toFixed(4),
      )
    }

    const meanProduct = sumProduct / PAIRS.length

    // control: a single eigenmode (zero gap) never dephases, survival stays at one
    const single = diracTwoModeSurvival({
      indexA: 30,
      indexB: 30,
      size: SIZE,
      mass: MASS,
      beats: BEATS,
    })

    const singleModeMinSurvival = Math.min(...single.survival)

    const gapMatches = maxGapError < 0.01
    const fullyOrthogonalizes = minSurvivalReached < 0.05
    const productIsPi = maxProductError < 0.3
    const controlNoDephasing = singleModeMinSurvival > 0.9
    const ok =
      gapMatches &&
      fullyOrthogonalizes &&
      productIsPi &&
      controlNoDephasing

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the emergent Dirac quantum walk a two-mode superposition dephases at exactly the emergent dispersion energy gap: the dephasing rate read off the survival curve matches the dispersion gap to under one percent, the survival probability reaches zero (full orthogonality), and the orthogonalization time times the gap is pi across a sweep of momentum pairs, so the collapse time is t = pi / dE, the deterministic reconstruction of Penrose OR t = h-bar / E_G, while a single eigenmode with zero gap never dephases',
      metrics: {
        pairs: PAIRS.length,
        maxGapError: Number(maxGapError.toExponential(2)),
        minSurvivalReached: Number(minSurvivalReached.toExponential(2)),
        meanOrthogonalizationProduct: Number(meanProduct.toFixed(4)),
        maxProductError: Number(maxProductError.toFixed(4)),
        piTarget: Number(Math.PI.toFixed(4)),
        ...perPair,
      },
      // CONTROL: a single eigenmode (zero energy gap) never dephases, so the collapse is
      // driven by the energy gap; as the gap goes to zero the collapse time diverges.
      control: {
        singleModeMinSurvival: Number(singleModeMinSurvival.toFixed(4)),
      },
      notes:
        'Hameroff / Penrose Orch-OR bridge (author-bridges/stuart-hameroff.md, point 9). The gap is measured two independent ways (survival-curve DFT and the dispersion) to keep it non-circular. This reconstructs the energy-time structure of Penrose OR from the emergent quantum, with no stochastic collapse rate.',
    })
  },
})
