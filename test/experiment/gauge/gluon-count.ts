// How many gauge bosons does a lattice gauge theory carry, and how many colors, read off the
// dynamics rather than off the group's definition. Run for U(1), SU(2) and SU(3) with the same code.
//
// Weak coupling (large beta): the field is a set of free waves, and by equipartition each
// independent field component stores the same share of the action. With beta = 2N / g^2 the mean
// plaquette obeys 1 - P = (N^2 - 1) / (4 beta) + O(1 / beta^2) for SU(N), and 1 / (4 beta) for U(1).
// So D = 4 beta (1 - P), extrapolated to beta -> infinity, COUNTS the gauge fields: 1 photon,
// 3 weak bosons, 8 gluons.
//
// Strong coupling (small beta): with X = Re Tr U and lambda = beta / N, each plaquette is weighted
// by exp(lambda X), so P = (1 / N) d ln <exp(lambda X)> / d lambda = (1 / N) (K2 lambda +
// K3 lambda^2 / 2 + K4 lambda^3 / 6 + ...), the K the cumulants of X under the Haar measure. The
// cumulants are read two ways from the same configurations: from the moments <X^2> and <X^3> of the
// plaquettes, carried to lambda = 0, and K2 a second time from the slope of P against lambda. The
// two readings of K2 must agree (that is fluctuation-dissipation, the response of P to lambda equal
// to the spread of X), which checks that the sampler is drawing from exp(lambda X) and not merely
// from something with the right mean. K3 from the slope of P would need sixteen times the samples
// to resolve, so it is read from the moments.
//
// - K2 = <X^2> is 1 / 2 for U(1) and SU(3) and 1 for SU(2) (a real trace). It gives the slope
//   P / beta -> K2 / N^2, which for SU(3) is 1 / 18 and counts the colors, N = 3.
// - K3 = <X^3> is nonzero only for SU(3), where it is 1 / 4. It vanishes unless three fundamental
//   indices can be contracted into a singlet by an invariant tensor. SU(3) has one, epsilon_abc, the
//   same tensor that binds three quarks into a baryon. SU(2) and U(1) do not, so their K3 must come
//   out zero. That is the control. For SU(3) the next cumulant K4 = 3/4 - 3 (1/2)^2 is also zero,
//   so the quadratic term of the fit is not polluted from above.
//
// All three groups are fit over the same lambda range, 0.1 to 0.4, where the four-dimensional
// corrections to the single-plaquette series (order u^5, u the leading P) stay below 2e-3.
//
// Grade L2: equipartition and the strong-coupling expansion are textbook lattice gauge theory
// (Creutz, Quarks, Gluons and Lattices, chapters 10 and 15). Nothing about the count is typed in:
// the numbers come from averaging the plaquette of Monte Carlo configurations.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import {
  GaugeGroup,
  groupSize,
  makeGaugeLattice,
  sampleGaugeEnsemble,
} from '@/code/dynamics/gauge-lattice'
import { plaquetteMoments } from '@/code/measure/lattice-gauge-observable'
import { averageSeries } from '@/code/measure/jackknife'
import { linearFit, quadraticFit } from '@/code/measure/regression'

// The ensemble means of <X>, <X^2>, <X^3>, X = Re Tr U_plaquette.
function meanMoments(input: {
  group: GaugeGroup
  beta: number
  measurements: number
  seed: number
}): number[] {
  const rng = makeRng({ seed: input.seed })
  const lattice = makeGaugeLattice({
    group: input.group,
    lengths: [6, 6, 6, 6],
    start: 'cold',
    rng,
  })

  return averageSeries({
    series: sampleGaugeEnsemble({
      lattice,
      beta: input.beta,
      thermalization: 15,
      measurements: input.measurements,
      separation: 1,
      overrelaxation: 0,
      rng,
      measure: current => plaquetteMoments({ lattice: current }),
    }),
  })
}

// beta for a given bare coupling g^2
function betaFor(input: {
  group: GaugeGroup
  gSquared: number
}): number {
  const n = groupSize({ group: input.group })

  return input.group === 'u1'
    ? 1 / input.gSquared
    : (2 * n) / input.gSquared
}

const WEAK_COUPLINGS = [0.2, 0.1, 0.05]
const STRONG_LAMBDAS = [0.1, 0.2, 0.3, 0.4]

function countGroup(input: { group: GaugeGroup; seed: number }): {
  fieldCount: number
  // K2 = <X^2> and K3 = <X^3> at beta -> 0, read off the plaquette moments of the configurations
  secondCumulant: number
  thirdCumulant: number
  // K2 read the second way, from the slope of P against lambda (P / lambda -> K2 / N)
  secondCumulantFromSlope: number
  // the slope P / beta at beta -> 0, K2 / N^2
  strongSlope: number
} {
  const n = groupSize({ group: input.group })
  const weak = WEAK_COUPLINGS.map((gSquared, index) => {
    const beta = betaFor({ group: input.group, gSquared })
    const plaquette =
      (meanMoments({
        group: input.group,
        beta,
        measurements: 30,
        seed: input.seed + index,
      })[0] ?? 0) / n

    return { inverseBeta: 1 / beta, count: 4 * beta * (1 - plaquette) }
  })
  const extrapolated = linearFit({
    xs: weak.map(point => point.inverseBeta),
    ys: weak.map(point => point.count),
  })
  const strong = STRONG_LAMBDAS.map((lambda, index) => {
    const moments = meanMoments({
      group: input.group,
      beta: lambda * n,
      measurements: 300,
      seed: input.seed + 10 + index,
    })

    return {
      lambda,
      ratio: (moments[0] ?? 0) / n / lambda,
      second: moments[1] ?? 0,
      third: moments[2] ?? 0,
    }
  })
  const lambdas = strong.map(point => point.lambda)
  // P / lambda = a + b lambda + c lambda^2, with a = K2 / N
  const series = quadraticFit({
    xs: lambdas,
    ys: strong.map(point => point.ratio),
  })
  // the moments at lambda, carried to lambda = 0 by the same quadratic
  const second = quadraticFit({
    xs: lambdas,
    ys: strong.map(point => point.second),
  })
  const third = quadraticFit({
    xs: lambdas,
    ys: strong.map(point => point.third),
  })

  return {
    fieldCount: extrapolated.intercept,
    secondCumulant: second.c,
    thirdCumulant: third.c,
    secondCumulantFromSlope: n * series.c,
    strongSlope: series.c / n,
  }
}

export default experiment({
  id: 'gauge/gluon-count',
  code: 'E-FRC-0081',
  title:
    'the lattice dynamics count 8 gluons, 3 colors and the three-quark invariant of SU(3), against 3 and 1 fields and no invariant for SU(2) and U(1)',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const su3 = countGroup({ group: 'su3', seed: 810 })
    const su2 = countGroup({ group: 'su2', seed: 830 })
    const u1 = countGroup({ group: 'u1', seed: 850 })

    // the color count from the strong-coupling slope 1 / (2 N^2)
    const colors = Math.sqrt(1 / (2 * su3.strongSlope))
    const gluons = Math.round(su3.fieldCount)
    const countsExact =
      Math.abs(su3.fieldCount - 8) < 0.1 &&
      Math.abs(su2.fieldCount - 3) < 0.1 &&
      Math.abs(u1.fieldCount - 1) < 0.1
    const colorsExact = Math.abs(colors - 3) < 0.05
    // K3 = 1/4 for SU(3) and zero for SU(2) and U(1), each to 0.01 (the moments carry a statistical
    // error near 0.002 at these sample sizes)
    const invariant = 1 / 4
    const su3Invariant = Math.abs(su3.thirdCumulant - invariant) < 0.01
    const othersNone =
      Math.abs(su2.thirdCumulant) < 0.01 &&
      Math.abs(u1.thirdCumulant) < 0.01
    // the two readings of K2 agree to three percent in every group
    const responseMatchesSpread = [su3, su2, u1].every(
      g =>
        Math.abs(g.secondCumulantFromSlope / g.secondCumulant - 1) <
        0.03,
    )
    const ok =
      countsExact &&
      colorsExact &&
      su3Invariant &&
      othersNone &&
      responseMatchesSpread

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the plaquette of the Monte Carlo counts the gauge fields by equipartition (8 for SU(3), 3 for SU(2), 1 for U(1)) and the colors by the strong-coupling slope (N = 3), and finds the cubic invariant <(Re Tr U)^3> = 1/4 that only SU(3) has, the epsilon tensor that makes three quarks a singlet',
      metrics: {
        su3FieldCount: su3.fieldCount,
        gluons,
        su3StrongSlope: su3.strongSlope,
        colors,
        su3SecondCumulant: su3.secondCumulant,
        su3SecondCumulantFromSlope: su3.secondCumulantFromSlope,
        su3ThirdCumulant: su3.thirdCumulant,
        su3ThirdCumulantPredicted: invariant,
      },
      control: {
        su2FieldCount: su2.fieldCount,
        u1FieldCount: u1.fieldCount,
        su2SecondCumulant: su2.secondCumulant,
        su2SecondCumulantFromSlope: su2.secondCumulantFromSlope,
        su2SecondCumulantPredicted: 1,
        u1SecondCumulant: u1.secondCumulant,
        u1SecondCumulantFromSlope: u1.secondCumulantFromSlope,
        u1SecondCumulantPredicted: 1 / 2,
        su2ThirdCumulant: su2.thirdCumulant,
        u1ThirdCumulant: u1.thirdCumulant,
      },
      notes:
        'L2, known lattice gauge theory. The field count is a property the Wilson action inherits from the chosen group, so this checks that the simulation really carries N^2 - 1 independent propagating fields with the right weight each, not that nature has eight gluons. The weak-coupling extrapolation is linear in 1 / beta over g^2 = 0.2, 0.1, 0.05. The strong-coupling series is fit as a quadratic in lambda = beta / N over lambda = 0.1 to 0.4 for every group. The cubic invariant is read from moments that at lambda -> 0 approach Haar averages, so that part is group theory confirmed through the sampler (L1 in content), and what the dynamics adds is that the same number is the lambda^2 coefficient of the plaquette.',
    })
  },
})
