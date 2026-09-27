// The warp factor from the Coxeter group itself, and a numerology that fails. E-GMT-0031 read the cubic
// lambda^3 - 21 lambda^2 + 51 lambda - 23 off a cone-type transfer matrix whose completeness was assumed from one
// build. Here the shell series is DERIVED, with no build, from the group [3,4,3,4]:
//
//   a(z) = sum over shells of (docks in the shell) z^n = (1 + z)^3 / (1 - 21 z + 51 z^2 - 23 z^3).
//
// Why. The docks of {3,4,3,4} are the cosets of the 24-cell stabilizer W(F4) = [3,4,3] in W = [3,4,3,4]. A
// facet lies on a mirror of a conjugate of s4, and s4 is conjugate to no other generator (its one neighbor s3
// is joined to it by the even label 4), so the s4-type mirrors are unions of facets, cut no dock, and the facet
// distance of a dock is the number of s4 letters in a reduced word of its coset representative. Weighting only
// the s4 class, Steinberg's formula 1 / W(1/z) = sum over finite parabolics J of (-1)^|J| / W_J(z) gives
// W(z), and a(z) = W(z) / 1152. By hand: 1152 f(z) = 1 - 24/(1+z) + 96/(1+z)^2 - 96/(1+z)^3, whose inversion
// at 1/z is the formula above. The code computes every W_J(z) by breadth over the group, so no Poincare product
// is assumed.
//
// The conjecture tested. lambda + 1/lambda = 55/3, lambda the larger root of 3 x^2 - 55 x + 3. The cubic has no
// rational root (+-1, +-23), so it is irreducible and lambda has degree 3: it satisfies no quadratic over Q, and
// the conjecture is FALSE. Its root 18.27862 sits 8.3e-5 from lambda. The null: a uniform x in [16.5, 20] lies as
// near to some x + 1/x = p/q, q <= 12, with probability about 0.008. A "p < 0.01" coincidence that is provably
// wrong, recorded as the cautionary example beside m_p / m_e and 6 pi^5.
//
// Gates, fixed before the run:
// G1 the precondition: every label joining s4 to another generator is even
// G2 the series is (1 + z)^3 / (1 - 21 z + 51 z^2 - 23 z^3) exactly, after reduction
// G3 it equals the live unfolding (code/substrate/mesh-unfolding) through shell 3, the separately measured
//    153,192 and 2,800,344 (E-GMT-0027, E-GMT-0031), and E-GMT-0031's predicted 51,187,080
// G4 controls on the same code: {4,3,4} gives the cubic lattice's 1, 6, 18, 38, 66 (4 n^2 + 2) and {4,4} gives
//    1, 4, 8, 12, 16
// G5 the cubic: no rational root, discriminant 193,536 = 96^2 x 21 (positive, not a square: three real roots,
//    Galois group S3), roots 18.2787, 2.1308, 0.5905: a Perron number, not Pisot, not Salem, norm 23 (not a unit)
// G6 closed form lambda = 7 + 8 sqrt 2 cos(arccos(11 sqrt 2 / 16) / 3) within 1e-12 of the Newton root
// G7 the boundary share s = (lambda - 1)/lambda = (-lambda^2 + 21 lambda - 28)/23 is the root of
//    23 s^3 - 18 s^2 - 12 s + 8 (residual under 1e-12), and the orbifold Euler characteristic is exactly 1/1152
//    (so the covolume is (4 pi^2 / 3) / 1152 = pi^2 / 864 and a(1) = 1)
// G8 the conjecture: 3 lambda^2 - 55 lambda + 3 is not 0 (it is 0.0045 at lambda) and the palindromic
//    null rate is reported
//
// Depth L2: a closed derivation from the group, checked against the build and two known honeycombs.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { honeycombShellSeries, newtonRoot, seriesCoefficients } from '@/code/algebra/group/coxeter-growth'
import { unfoldMeshShells } from '@/code/substrate/mesh-unfolding'
import { weylPoint } from '@/code/measure/integer-relation'

const LABELS_3434 = [
  [1, 3, 2, 2, 2],
  [3, 1, 4, 2, 2],
  [2, 4, 1, 3, 2],
  [2, 2, 3, 1, 4],
  [2, 2, 2, 4, 1],
]
const LABELS_434 = [
  [1, 4, 2, 2],
  [4, 1, 3, 2],
  [2, 3, 1, 4],
  [2, 2, 4, 1],
]
const LABELS_44 = [
  [1, 4, 2],
  [4, 1, 4],
  [2, 4, 1],
]
// E-GMT-0027 (shell 4) and E-GMT-0031 (shell 5 measured, shell 6 predicted by its recurrence)
const MEASURED_FOUR = 153192n
const MEASURED_FIVE = 2800344n
const PREDICTED_SIX = 51187080n

export default experiment({
  id: 'method/warp-factor-from-the-coxeter-group',
  code: 'E-MTH-0007',
  title:
    'the {3,4,3,4} shell series derived from its Coxeter group with no build, a(z) = (1 + z)^3 / (1 - 21 z + 51 z^2 - 23 z^3), reproduces every measured shell, so the warp factor is exactly the Perron root of the irreducible cubic lambda^3 - 21 lambda^2 + 51 lambda - 23 (Galois group S3, discriminant 96^2 x 21), 7 + 8 sqrt 2 cos(arccos(11 sqrt 2 / 16) / 3), and the conjecture lambda + 1/lambda = 55/3 is false though its root lies 8.3e-5 away (null 0.008)',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const precondition = [0, 1, 2, 3].every(i => LABELS_3434[i]![4]! % 2 === 0)
    const series = honeycombShellSeries(LABELS_3434)
    const expectedNumerator = [1n, 3n, 3n, 1n]
    const expectedDenominator = [1n, -21n, 51n, -23n]
    const formula =
      series.numerator.length === 4 &&
      series.denominator.length === 4 &&
      series.numerator.every((x, i) => x === expectedNumerator[i]) &&
      series.denominator.every((x, i) => x === expectedDenominator[i])
    const shells = seriesCoefficients(series.numerator, series.denominator, 8)
    const live = unfoldMeshShells({ throughShell: 3, maxCells: 12000 })
    const matchesBuild =
      live.every((v, i) => BigInt(v) === shells[i]) && shells[4] === MEASURED_FOUR && shells[5] === MEASURED_FIVE && shells[6] === PREDICTED_SIX

    const cubic = honeycombShellSeries(LABELS_434)
    const cubicShells = seriesCoefficients(cubic.numerator, cubic.denominator, 6)
    const square = honeycombShellSeries(LABELS_44)
    const squareShells = seriesCoefficients(square.numerator, square.denominator, 6)
    const controls =
      cubicShells.every((v, n) => v === (n === 0 ? 1n : BigInt(4 * n * n + 2))) && squareShells.every((v, n) => v === (n === 0 ? 1n : BigInt(4 * n)))

    // the cubic x^3 - 21 x^2 + 51 x - 23, coefficients low to high
    const poly = [-23, 51, -21, 1]
    const at = (x: number): number => poly.reduce((s, c, i) => s + c * x ** i, 0)
    const noRationalRoot = [1, -1, 23, -23].every(x => at(x) !== 0)
    const [A, B, C] = [-21n, 51n, -23n]
    const discriminant = 18n * A * B * C - 4n * A ** 3n * C + A ** 2n * B ** 2n - 4n * B ** 3n - 27n * C ** 2n
    const discriminantForm = discriminant === 96n * 96n * 21n
    const lambda = newtonRoot(poly, 18.3)
    const theta = Math.acos((11 * Math.SQRT2) / 16)
    const roots = [0, 1, 2].map(k => 7 + 8 * Math.SQRT2 * Math.cos((theta - 2 * Math.PI * k) / 3)).sort((p, q) => q - p)
    const trig = roots[0]!
    const perron = roots[0]! > Math.abs(roots[1]!) && roots[0]! > Math.abs(roots[2]!)
    const pisot = Math.abs(roots[1]!) < 1 && Math.abs(roots[2]!) < 1
    const reciprocal = poly.every((c, i) => c === poly[3 - i])
    const closedForm = Math.abs(trig - lambda) < 1e-12 && roots.every(r => Math.abs(at(r)) < 1e-9)

    const share = 1 - 1 / lambda
    const shareResidual = Math.abs(23 * share ** 3 - 18 * share ** 2 - 12 * share + 8)
    const sharePolynomial = Math.abs(share - (-lambda * lambda + 21 * lambda - 28) / 23)
    const euler = series.euler[0] === 1n && series.euler[1] === 1152n
    const atOne = Number(series.numerator.reduce((s, c) => s + c, 0n)) / Number(series.denominator.reduce((s, c) => s + c, 0n))

    // the conjecture and its null
    const quadratic = 3 * lambda * lambda - 55 * lambda + 3
    const quadraticRoot = (55 + Math.sqrt(2989)) / 6
    const nearestPalindromic = (x: number): number => {
      let best = Infinity

      for (let q = 1; q <= 12; q++) {
        const r = Math.round((x + 1 / x) * q) / q

        best = Math.min(best, Math.abs((r + Math.sqrt(r * r - 4)) / 2 - x))
      }

      return best
    }
    const gap = nearestPalindromic(lambda)
    let closer = 0
    const samples = 200000

    // the golden Weyl sequence: deterministic, no seed
    for (let i = 1; i <= samples; i++) {
      closer += nearestPalindromic(16.5 + 3.5 * weylPoint(i)) <= gap ? 1 : 0
    }

    const nullRate = closer / samples
    const refuted = noRationalRoot && Math.abs(quadratic) > 1e-3

    const solved =
      precondition && formula && matchesBuild && controls && noRationalRoot && discriminantForm && perron && !pisot && !reciprocal && closedForm && shareResidual < 1e-12 && sharePolynomial < 1e-12 && euler && Math.abs(atOne - 1) < 1e-15 && refuted

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the shell series of {3,4,3,4} follows from its Coxeter group alone: s4 is conjugate to no other generator, so facet distance is the s4 count, and Steinberg\'s formula with the s4 class weighted gives a(z) = (1 + z)^3 / (1 - 21 z + 51 z^2 - 23 z^3), which reproduces the live unfolding through shell 3, the measured 153,192 and 2,800,344 and the predicted 51,187,080, while the same code gives 4 n^2 + 2 for {4,3,4} and 4 n for {4,4}. The warp factor is the Perron root of an irreducible cubic with Galois group S3 and discriminant 96^2 x 21, lambda = 7 + 8 sqrt 2 cos(arccos(11 sqrt 2 / 16) / 3) = 18.278707774366, with conjugates 2.1308 and 0.5905 (not Pisot, not Salem, norm 23). The boundary share is the root 0.945292 of 23 s^3 - 18 s^2 - 12 s + 8, and the Euler characteristic of the group is exactly 1/1152. The conjecture lambda + 1/lambda = 55/3 is false, a coincidence at 8.3e-5 that a uniform number matches with probability 0.008.',
      metrics: {
        shellFour: Number(shells[4]),
        shellFive: Number(shells[5]),
        shellSix: Number(shells[6]),
        shellSeven: Number(shells[7]),
        warpFactor: Number(lambda.toFixed(12)),
        conjugateMiddle: Number(roots[1]!.toFixed(10)),
        conjugateSmall: Number(roots[2]!.toFixed(10)),
        discriminant: Number(discriminant),
        boundaryShare: Number(share.toFixed(12)),
        eulerDenominator: Number(series.euler[1]),
        quadraticAtLambda: Number(quadratic.toFixed(6)),
        quadraticGap: Number((quadraticRoot - lambda).toExponential(4)),
        palindromicNullRate: nullRate,
      },
      control: {
        cubicLatticeShellFour: Number(cubicShells[4]),
        squareTilingShellFour: Number(squareShells[4]),
        liveShellThree: live[3] ?? -1,
        closedFormGap: Math.abs(trig - lambda),
      },
      notes:
        'L2. The derivation needs one fact about the group, that s4 is alone in its conjugacy class (m34 = 4, the other labels to s4 are 2), and Steinberg\'s formula for infinite Coxeter groups in its multi-parameter form (one weight per class of reflections). This replaces the cone-type assumption of E-GMT-0031 with a proof and confirms its cubic. The numerator (1 + z)^3 makes the recurrence start at shell 4, which is why 8,376 = 21 x 456 - 51 x 24 + 23 + 1: a fit through the seed shells reads a wrong degree, the artifact E-GMT-0031 names. The Euler characteristic 1/1152 gives the orbifold covolume pi^2/864 by Gauss-Bonnet, the known volume of the [3,4,3,4] simplex, so each dock has volume 4 pi^2 / 3. The null for the conjecture is the palindromic family x + 1/x = p/q, q up to 12, over x in [16.5, 20] placed by 200,000 points of the golden Weyl sequence (no seed); the family was named after seeing lambda, so the true look-elsewhere rate is higher. Deterministic.',
    })
  },
})
