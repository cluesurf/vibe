// The magic-square corner E8 carries a modular form: its lattice theta series is the Eisenstein
// series E4. The substrate's division-algebra ladder tops out at E8 (E-FND-0061), and the E8 lattice
// has a striking number-theoretic fingerprint: the count of lattice vectors of squared length 2n is
// exactly 240 times the sum of the cubes of the divisors of n. The generating function of those
// counts is the weight-four Eisenstein series, a modular form, so a genuine integer sequence with a
// modular symmetry sits inside the substrate's top structure, not by numerology but by direct
// enumeration.
//
// Measured by direct enumeration of the E8 lattice (the integer coset with even coordinate sum and
// the half-integer coset with even coordinate sum): the number of vectors of squared length 2, 4,
// and 6 is 240, 2160, and 6720, matching 240 times the sum-of-cubes-of-divisors of 1, 2, and 3
// exactly. The first coefficient 240 is the E8 root count (the kissing number), and the whole series
// is the Eisenstein series E4.
//
// The control is a wrong divisor power: the same counts do not match 240 times the sum of the
// divisors (sigma_1) or of their squares (sigma_2), so the cubes are the specific and correct power,
// the modular weight four fixing the exponent, not a fit.
//
// Depth L1. It confirms the known identity that the E8 theta series is the Eisenstein series E4 (the
// vector counts are 240 times sigma_3) by direct lattice enumeration, against wrong-power controls,
// so a real modular-form integer sequence lives in the substrate's magic-square corner. Known number
// theory, made explicit on vibe's committed top lattice.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  e8ThetaCoefficient,
  sigmaCubes,
} from '@/code/measure/number-structure'

const SHELLS = [1, 2, 3]

export default experiment({
  id: 'foundations/e8-theta-eisenstein',
  code: 'E-FND-0069',
  title:
    'the E8 lattice vector count at squared length 2n equals 240 times the sum of cubes of divisors of n (240, 2160, 6720) by direct enumeration, so the magic-square corner theta series is the Eisenstein series E4, while wrong divisor powers do not match',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // the theta coefficients equal 240 * sigma_3 exactly
    let worstError = 0

    for (const n of SHELLS) {
      const counted = e8ThetaCoefficient(2 * n)
      const predicted = 240 * sigmaCubes(n)

      worstError = Math.max(worstError, Math.abs(counted - predicted))
    }

    // the first coefficient is the E8 kissing number 240
    const kissing = e8ThetaCoefficient(2)

    // CONTROL: the wrong divisor powers (sigma_1, sigma_2) do not match
    const sigmaOne = (n: number): number => {
      let sum = 0

      for (let d = 1; d <= n; d++) {
        if (n % d === 0) {
          sum += d
        }
      }

      return sum
    }

    const sigmaTwo = (n: number): number => {
      let sum = 0

      for (let d = 1; d <= n; d++) {
        if (n % d === 0) {
          sum += d * d
        }
      }

      return sum
    }

    const wrongPowerMatches =
      e8ThetaCoefficient(4) === 240 * sigmaOne(2) ||
      e8ThetaCoefficient(4) === 240 * sigmaTwo(2)

    const thetaIsEisenstein = worstError === 0
    const firstIsKissing = kissing === 240

    const ok = thetaIsEisenstein && firstIsKissing && !wrongPowerMatches

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'by direct enumeration of the E8 lattice the number of vectors of squared length two, four, and six is two hundred forty, two thousand one hundred sixty, and six thousand seven hundred twenty, matching two hundred forty times the sum of the cubes of the divisors of one, two, and three exactly, so the E8 theta series is the weight-four Eisenstein series E4 (a modular form) with its first coefficient the E8 kissing number two hundred forty, a real modular-form integer sequence living in the substrate magic-square corner, while two hundred forty times the sum of the divisors or of their squares does not match, so the cube power is the specific correct exponent fixed by the modular weight, not a fit',
      metrics: {
        theta2: e8ThetaCoefficient(2),
        theta4: e8ThetaCoefficient(4),
        theta6: e8ThetaCoefficient(6),
        predicted6: 240 * sigmaCubes(3),
        worstError,
      },
      // CONTROL: wrong divisor powers do not reproduce the counts.
      control: { wrongPowerMatches: wrongPowerMatches ? 1 : 0 },
      notes:
        'E8 theta series = Eisenstein E4 (counts = 240 sigma_3), by enumeration. A modular-form integer sequence in the magic-square corner (E-FND-0061), the kissing number 240 its first coefficient. Complements the codes-under-the-lattices result (E-FND-0067).',
    })
  },
})
