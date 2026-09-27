// The most magic state of n roles, which sets the fear-share ceiling (1 - 1 / s_max(n)) / 2 (E-QTM-0121).
//
// s(psi) = sum over the 9^n phase points of |W(x)|, W(x) = <psi| A(x) |psi> / 3^n, and s_max(n) its maximum over
// pure states of n qutrits (roles). E-QTM-0121 found s_max(2) >= 25/9 by search (the Strange state on both roles)
// and asked for a proof, or a state above it, and the n-role formula. This file:
//
// 1. one role: all 2^9 sign patterns, s_max(1) = 5/3 exactly (the Strange state), the base case.
// 2. two roles: the sign-pattern ascent (s = max over sign patterns sigma of the top eigenvalue of
//    sum sigma_x A(x) / 9; alternate the signs of the current W and the top eigenvector, which never lowers s)
//    from 20,000 golden Weyl starts (weylUnitVector, starts 50,000 on), plus the Strange x Strange and the
//    antisymmetric pair.
// 3. what can be proved, stated: s is multiplicative on products (W of a product is the product of the W's,
//    so the absolute sums multiply), checked exactly in whole units on all 21 x 21 products of the enumerated
//    one-role pure states (the 12 stabilizer states, W = 1/3 on a line, and the 9 Strange states); so
//    s_max(n + m) >= s_max(n) s_max(m), and by Fekete's lemma s_max(n)^(1/n) rises to its limit c, the magic
//    rate per role. Cauchy-Schwarz with sum W^2 = 3^-n gives s_max(n) <= 3^(n/2), so c <= sqrt 3.
// 4. three roles, REPORTED, NOT GATED: the ascent from 300 Weyl starts (70,000 on). Disclosed: a probe of this
//    section (tmp/qtm123-probe-three.ts, 8 and then 300 starts) ran before these gates were written, and found
//    4.7739 > 125/27 = (5/3)^3, so the product formula (5/3)^n that E-QTM-0121's report offered as the n-role
//    formula is false at n = 3, and nothing about n = 3 is gated here.
//
// Gates, fixed before the first run of this file:
// G1 the one-role exhaustive maximum is 5/3 to 1e-12
// G2 on two roles the largest value found is 25/9 to 1e-9, and no start exceeds 25/9 by more than 1e-9
// G3 s is exactly multiplicative on all 441 enumerated products
// G4 a certified upper bound on s_max(2) equal to 25/9. This file has none: the only certified bound it holds
//    is Cauchy-Schwarz, 3. G4 is written down so that the status says what is missing, and it fails
//
// Depth L1: known phase-space mathematics, a deterministic search, and one exact identity.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { gridWeights, operator, phasePointOperators, type Operator } from '@/code/measure/grid-weights'
import { hermitianSpectrum, topEigenvector } from '@/code/measure/qutrit-clifford'
import { weylUnitVector } from '@/code/tool/weyl'

const TWO_STARTS = 20000
const THREE_STARTS = 300
const MAX_STEPS = 400

type State = { re: number[]; im: number[] }

function signOperator(signs: readonly number[], points: readonly Operator[]): Operator {
  const n = points[0]?.n ?? 1
  const out = operator(n)

  points.forEach((a, p) => {
    const s = (signs[p] ?? 0) / n

    for (let i = 0; i < n * n; i++) {
      out.re[i] = (out.re[i] ?? 0) + s * (a.re[i] ?? 0)
      out.im[i] = (out.im[i] ?? 0) + s * (a.im[i] ?? 0)
    }
  })

  return out
}

function ascend(start: State, points: readonly Operator[]): number {
  const size = Math.sqrt(start.re.reduce((s, x, i) => s + x * x + (start.im[i] ?? 0) ** 2, 0))
  let state: State = { re: start.re.map(x => x / size), im: start.im.map(x => x / size) }
  let value = 0

  for (let step = 0; step < MAX_STEPS; step++) {
    const w = gridWeights({ re: state.re, im: state.im, points })
    const current = w.reduce((s, x) => s + Math.abs(x), 0)

    if (step > 0 && current - value < 1e-14) {
      return Math.max(value, current)
    }

    value = current

    const top = topEigenvector(signOperator(w.map(x => (x >= 0 ? 1 : -1)), points))

    state = { re: top.re, im: top.im }
  }

  return value
}

// the 21 enumerated one-role pure states in whole units on the 9 phase points (index 3 a + b)
function oneRoleStates(): bigint[][] {
  const out: bigint[][] = []

  // the 12 lines of Z3^2: directions (1, 0), (0, 1), (1, 1), (1, 2), three offsets each
  for (const [da, db] of [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ] as const) {
    const seen = new Set<string>()

    for (let p = 0; p < 9; p++) {
      const line = [0, 1, 2].map(t => 3 * ((Math.floor(p / 3) + t * da) % 3) + ((p % 3) + t * db) % 3).sort((x, y) => x - y)
      const key = line.join(',')

      if (seen.has(key)) continue
      seen.add(key)
      out.push(Array.from({ length: 9 }, (_, q) => (line.includes(q) ? 1n : 0n)))
    }
  }

  // the 9 Strange states: -1/3 at one point, 1/6 at the other eight, in units of 6
  for (let p = 0; p < 9; p++) {
    out.push(Array.from({ length: 9 }, (_, q) => (q === p ? -2n : 1n)))
  }

  return out
}

const absSum = (w: readonly bigint[]): bigint => w.reduce((s, x) => s + (x < 0n ? -x : x), 0n)
const sum = (w: readonly bigint[]): bigint => w.reduce((s, x) => s + x, 0n)

export default experiment({
  id: 'quantum/most-magic-roles',
  code: 'E-QTM-0125',
  title:
    'the most magic state of n roles: 5/3 for one role exactly, 25/9 for two by a 20,000-start deterministic search that nothing exceeds but not proven (the certified bound is 3), and the product formula (5/3)^n fails at three roles, where an entangled state reaches 4.7739 above 125/27, so the magic rate per role lies between 1.684 and sqrt 3 and the fear-share ceiling rises toward 1/2',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    // 1. one role
    const points1 = phasePointOperators(1)
    let exhaustive = 0

    for (let mask = 0; mask < 512; mask++) {
      const signs = Array.from({ length: 9 }, (_, p) => ((mask >> p) & 1 ? -1 : 1))
      const spectrum = hermitianSpectrum(signOperator(signs, points1))

      exhaustive = Math.max(exhaustive, spectrum[spectrum.length - 1] ?? 0)
    }

    // 2. two roles
    const points2 = phasePointOperators(2)
    const s = Math.SQRT1_2
    const strange = [0, s, -s]
    const strangeStrange: State = {
      re: Array.from({ length: 9 }, (_, i) => (strange[Math.floor(i / 3)] ?? 0) * (strange[i % 3] ?? 0)),
      im: new Array<number>(9).fill(0),
    }
    const antisymmetric: State = { re: [0, s, 0, -s, 0, 0, 0, 0, 0], im: new Array<number>(9).fill(0) }
    const structured = [ascend(strangeStrange, points2), ascend(antisymmetric, points2)]
    const found: number[] = []

    for (let k = 0; k < TWO_STARTS; k++) {
      const v = weylUnitVector({ dimension: 18, start: 50000 + k })

      found.push(ascend({ re: Array.from(v.slice(0, 9)), im: Array.from(v.slice(9, 18)) }, points2))
    }

    const best2 = Math.max(...found, ...structured)
    const at25 = found.filter(x => Math.abs(x - 25 / 9) < 1e-9).length
    const above25 = found.filter(x => x > 25 / 9 + 1e-9).length
    const secondBest = Math.max(...found.filter(x => x < 25 / 9 - 1e-6))

    // 3. multiplicativity on products, exact
    const ones = oneRoleStates()
    let products = 0
    let multiplicative = 0

    for (const u of ones) {
      for (const v of ones) {
        const product = u.flatMap(x => v.map(y => x * y))

        products++
        multiplicative += absSum(product) * sum(u) * sum(v) === absSum(u) * absSum(v) * sum(product) ? 1 : 0
      }
    }

    // 4. three roles, reported
    const points3 = phasePointOperators(3)
    const found3: number[] = []

    for (let k = 0; k < THREE_STARTS; k++) {
      const v = weylUnitVector({ dimension: 54, start: 70000 + k })

      found3.push(ascend({ re: Array.from(v.slice(0, 27)), im: Array.from(v.slice(27, 54)) }, points3))
    }

    const best3 = Math.max(...found3)
    const at3 = found3.filter(x => Math.abs(x - best3) < 1e-9).length
    const above125 = found3.filter(x => x > 125 / 27 + 1e-9).length
    const rateLower = Math.max(5 / 3, Math.sqrt(best2), Math.cbrt(best3))
    const share = (x: number): number => (1 - 1 / x) / 2

    const g1 = Math.abs(exhaustive - 5 / 3) < 1e-12
    const g2 = Math.abs(best2 - 25 / 9) < 1e-9 && above25 === 0
    const g3 = multiplicative === products
    const certifiedUpper2 = 3
    const g4 = certifiedUpper2 <= 25 / 9 + 1e-12
    const status = g1 && g2 && g3 ? (g4 ? 'pass' : 'partial') : 'fail'

    return verdict({
      status,
      claim: `one role's largest Wigner norm is 5/3 over all 512 sign patterns; on two roles the ascent from ${TWO_STARTS} deterministic starts reaches ${best2.toFixed(9)} = 25/9 from ${at25} and exceeds it from ${above25}, the next local maximum ${secondBest.toFixed(6)}, but no certificate below Cauchy-Schwarz's 3 is held, so 25/9 and the fear-share ceiling 8/25 stay conjectures; the norm is exactly multiplicative on all ${products} enumerated products, so s_max(n)^(1/n) rises to a limit, and on three roles ${at3} of ${THREE_STARTS} starts reach ${best3.toFixed(6)}, above the product (5/3)^3 = 4.6296 (${above125} starts exceed it): the n-role formula is not (5/3)^n, the rate per role lies in [${rateLower.toFixed(5)}, ${Math.sqrt(3).toFixed(5)}], and the ceiling (1 - 1/s_max(n)) / 2 is at least ${share(best3).toFixed(4)} at three roles and tends to 1/2`,
      metrics: {
        oneRoleExhaustive: exhaustive,
        twoRoleBest: best2,
        twoRoleStartsAt25Over9: at25,
        twoRoleStartsAbove25Over9: above25,
        twoRoleSecondLocalMaximum: secondBest,
        twoRoleStarts: TWO_STARTS,
        strangeStrangeAscent: structured[0] ?? 0,
        antisymmetricAscent: structured[1] ?? 0,
        productsChecked: products,
        productsMultiplicative: multiplicative,
        threeRoleBest: best3,
        threeRoleStartsAtBest: at3,
        threeRoleStartsAboveProduct: above125,
        threeRoleStarts: THREE_STARTS,
        magicRateLowerBound: rateLower,
        magicRateUpperBound: Math.sqrt(3),
        fearShareCeilingOneRole: share(5 / 3),
        fearShareCeilingTwoRolesConjectured: share(25 / 9),
        fearShareCeilingThreeRolesAtLeast: share(best3),
        fearShareBoundThreeRolesCauchySchwarz: share(3 ** 1.5),
        certifiedUpperBoundTwoRoles: certifiedUpper2,
      },
      control: {
        productTwoRoles: 25 / 9,
        productThreeRoles: 125 / 27,
        cauchySchwarzTwoRoles: 3,
        cauchySchwarzThreeRoles: 3 ** 1.5,
      },
      notes:
        'L1. G4 fails by design of what is known: the maximum over pure states of a sum of absolute values is a convex maximization, which a search bounds from below and only a certificate over all 2^81 sign patterns bounds from above; none is held. The three-role maximizer the ascent reaches (tmp/qtm123-probe-three-best.ts) has W = -1/27 at one point, the least any three-qutrit W can be (the -1 eigenvector of that A(x)), 287 negative points, and every one-role marginal of Wigner norm 1 (no one-role magic at all): its magic is all in the correlations, which is why no product reaches it. Its value is reported as a number; no closed form is claimed (the E-MTH-0010 rule), and 4.7739 was seen before this file was written (see the header). Consequence for the fear weave: a whole of three or more open roles can hold a larger fear share than any product of Strange states, up to at least 0.395 at three roles against the Cauchy-Schwarz 0.404. First run, 2026-09-26 (172 s beside another job): partial, gates unchanged, G1 to G3 pass and G4 fails as written. Two roles: 175 of 20,000 starts reach 25/9, none exceeds it, the next local maximum is 2.7338. Three roles: 4 of 300 starts reach 4.773927, 12 exceed 125/27.',
    })
  },
})
