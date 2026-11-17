// The 8/25 fear-share ceiling of two roles (OPEN-QTM-18), certified exactly on a stated family of states.
//
// The fear share of a whole is (1 - 1/s) / 2 with s = sum over phase points of |W(x)| (E-QTM-0119, 0121), so the
// ceiling 8/25 for two roles is the statement s <= 25/9. E-QTM-0125 found 25/9 (Strange x Strange) by a 20,000
// start search and held no certificate below Cauchy-Schwarz's 3. A proof over all states is a maximum of a convex
// function, max over the 2^81 sign patterns sigma of lambda_max(M_sigma) / 9 with M_sigma = sum sigma_x A(x),
// and this file does not hold one. It holds an exact certificate on a family:
//
// The family. F is the qutrit Fourier move, F_jk = omega^(jk) / sqrt 3, a Clifford unitary that turns each
// role's grid a quarter turn about the point 0. Family A is every two-role state invariant under F x F (both roles
// turned the same way at once), family B every state invariant under F x conj(F) (opposite ways), and with each
// state every image of it under a two-role Clifford unitary (s is invariant under them, since they permute phase
// points). Strange x Strange lies in both. Equivalently, A and B are the states whose Wigner function is
// invariant under the point permutation the move induces (checked), which has 21 orbits on the 81 points. Such a
// state's sign pattern (sign +1 where W >= 0) is constant on orbits, so it is one of 2^21 patterns, and
// s(rho) = Tr(rho M_sigma) / 9 <= lambda_max(M_sigma) / 9. The certificate: 25 I - M_sigma is positive
// semidefinite, decided exactly over Z[omega] (code/measure/wigner-norm-certificate), for every one of the 2^21
// patterns of each family. The certificate covers more than the family: every state whose sign pattern is
// invariant, whether or not its weights are.
//
// Gates, fixed before the first run of this file:
// G1 exact operators: the 81 two-role phase-point operators have entries in Z[omega] (rounding error under 1e-9),
//    sum to 9 I exactly, and each squares to I exactly
// G2 the families: F induces a permutation of the 9 one-role points that fixes 0 and has order 4; F x F and
//    F x conj(F) induce two different permutations of the 81 points, each with 21 orbits (1 fixed point and 20 of
//    size 4); the Strange x Strange weights are invariant under both
// G3 the certificate: for both families, 25 I - M_sigma is PSD exactly for all 2^21 patterns, and is singular
//    (rank under 9) for the Strange x Strange pattern, so the family's maximum of s is exactly 25/9
// G4 controls of the exact test: one role, 5 I - M_sigma PSD for all 512 patterns and 4 I - M_Strange not PSD;
//    two roles, 24 I - M_(Strange x Strange) not PSD
// G5 the search for a state above the ceiling, outside the family: the sign-pattern ascent of E-QTM-0125 from
//    20,000 new deterministic starts (Weyl, starts 300,000 on) finds none above 25/9 + 1e-9
//
// Depth L1: known phase-space mathematics and an exact finite certificate on a stated family.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  gridWeights,
  operator,
  phasePointOperators,
  tensorOperators,
  type Operator,
} from '@/code/measure/grid-weights'
import { topEigenvector } from '@/code/measure/qutrit-clifford'
import {
  boundMatrix,
  cyclicOrbits,
  exactPhasePoints,
  isPsdExact,
  pointPermutation,
  zwAdd,
  zwIsZero,
  zwMul,
  ZW0,
  type ZwMatrix,
} from '@/code/measure/wigner-norm-certificate'
import { weylUnitVector } from '@/code/tool/weyl'

const SEARCH_STARTS = 20000
const SEARCH_OFFSET = 300000
const MAX_STEPS = 400

type State = { re: number[]; im: number[] }

function signOperator(
  signs: readonly number[],
  points: readonly Operator[],
): Operator {
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

// E-QTM-0125's ascent: alternate the sign pattern of the current W and the top eigenvector, never lowering s
function ascend(start: State, points: readonly Operator[]): number {
  const size = Math.sqrt(
    start.re.reduce(
      (s, x, i) => s + x * x + (start.im[i] ?? 0) ** 2,
      0,
    ),
  )

  let state: State = {
    re: start.re.map(x => x / size),
    im: start.im.map(x => x / size),
  }
  let value = 0

  for (let step = 0; step < MAX_STEPS; step++) {
    const w = gridWeights({ re: state.re, im: state.im, points })
    const current = w.reduce((s, x) => s + Math.abs(x), 0)

    if (step > 0 && current - value < 1e-14) {
      return Math.max(value, current)
    }

    value = current

    const top = topEigenvector(
      signOperator(
        w.map(x => (x >= 0 ? 1 : -1)),
        points,
      ),
    )

    state = { re: top.re, im: top.im }
  }

  return value
}

function product(a: ZwMatrix, b: ZwMatrix): ZwMatrix {
  const n = a.n
  const entries = Array.from({ length: n * n }, () => ZW0)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const x = a.entries[i * n + k]!

      if (zwIsZero(x)) {
        continue
      }

      for (let j = 0; j < n; j++) {
        entries[i * n + j] = zwAdd(
          entries[i * n + j]!,
          zwMul(x, b.entries[k * n + j]!),
        )
      }
    }
  }

  return { n, entries }
}

const isScalar = (m: ZwMatrix, c: bigint): boolean =>
  m.entries.every((e, k) =>
    k % (m.n + 1) === 0 ? e.a === c && e.b === 0n : zwIsZero(e),
  )

function order(pi: readonly number[]): number {
  let power = pi.slice()

  for (let k = 1; k <= 24; k++) {
    if (power.every((y, x) => y === x)) {
      return k
    }

    power = power.map(y => pi[y]!)
  }

  return -1
}

export default experiment({
  id: 'quantum/fear-share-ceiling-certificate',
  code: 'E-QTM-0192',
  title:
    'the 8/25 fear-share ceiling of two roles certified exactly on the states invariant under a joint quarter turn of both role grids (2 x 2^21 sign patterns, exact over Z[omega]), with no state above it from 20,000 new search starts; the ceiling over all states stays unproven',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    // G1 exact operators
    const exact1 = exactPhasePoints(1)
    const exact2 = exactPhasePoints(2)

    let sum2: ZwMatrix = { n: 9, entries: Array.from({ length: 81 }, () => ZW0) }

    for (const a of exact2) {
      sum2 = {
        n: 9,
        entries: sum2.entries.map((e, k) => zwAdd(e, a.entries[k]!)),
      }
    }

    const involutions =
      exact2.filter(a => isScalar(product(a, a), 1n)).length +
      exact1.filter(a => isScalar(product(a, a), 1n)).length
    const g1 = isScalar(sum2, 9n) && involutions === 90

    // G2 the families
    const f = operator(3)

    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        f.re[j * 3 + k] = Math.cos((2 * Math.PI * j * k) / 3) / Math.sqrt(3)
        f.im[j * 3 + k] = Math.sin((2 * Math.PI * j * k) / 3) / Math.sqrt(3)
      }
    }

    const fBar = operator(3)

    fBar.re.set(f.re)
    fBar.im.set(f.im.map(x => -x))

    const float1 = phasePointOperators(1)
    const float2 = phasePointOperators(2)
    const pi1 = pointPermutation(f, float1)
    const piA = pointPermutation(tensorOperators(f, f), float2)
    const piB = pointPermutation(tensorOperators(f, fBar), float2)
    const orbitsA = piA ? cyclicOrbits(piA) : []
    const orbitsB = piB ? cyclicOrbits(piB) : []

    // Strange x Strange in units of 36: W1 = (-2, 1 x 8) / 6 on one role
    const strange1 = Array.from({ length: 9 }, (_, p) => (p === 0 ? -2 : 1))
    const strange2 = Array.from(
      { length: 81 },
      (_, x) => (strange1[Math.floor(x / 9)] ?? 0) * (strange1[x % 9] ?? 0),
    )
    const invariant = (pi: readonly number[] | null): boolean =>
      pi !== null && strange2.every((w, x) => strange2[pi[x]!] === w)
    const shape = (orbits: readonly number[][]): boolean =>
      orbits.length === 21 &&
      orbits.filter(o => o.length === 1).length === 1 &&
      orbits.filter(o => o.length === 4).length === 20

    const g2 =
      pi1 !== null &&
      pi1[0] === 0 &&
      order(pi1) === 4 &&
      piA !== null &&
      piB !== null &&
      piA.join(',') !== piB.join(',') &&
      shape(orbitsA) &&
      shape(orbitsB) &&
      invariant(piA) &&
      invariant(piB)

    // G3 the certificate over each family
    const strangeSigns = strange2.map(w => (w >= 0 ? 1 : -1))
    const certify = (orbits: readonly number[][]) => {
      let held = 0
      let tight = 0

      for (let mask = 0; mask < 2 ** orbits.length; mask++) {
        const signs = new Array<number>(81).fill(1)

        orbits.forEach((o, k) => {
          if ((mask >> k) & 1) {
            for (const x of o) {
              signs[x] = -1
            }
          }
        })

        const r = isPsdExact(boundMatrix({ points: exact2, signs, c: 25n }))

        held += r.psd ? 1 : 0
        tight += r.psd && r.rank < 9 ? 1 : 0
      }

      return { patterns: 2 ** orbits.length, held, tight }
    }

    const familyA = g2 ? certify(orbitsA) : { patterns: 0, held: 0, tight: 0 }
    const familyB = g2 ? certify(orbitsB) : { patterns: 0, held: 0, tight: 0 }
    const strangeAt25 = isPsdExact(
      boundMatrix({ points: exact2, signs: strangeSigns, c: 25n }),
    )
    const g3 =
      familyA.patterns === 2 ** 21 &&
      familyA.held === familyA.patterns &&
      familyB.patterns === 2 ** 21 &&
      familyB.held === familyB.patterns &&
      strangeAt25.psd &&
      strangeAt25.rank < 9

    // G4 controls
    let oneRoleHeld = 0

    for (let mask = 0; mask < 512; mask++) {
      const signs = Array.from({ length: 9 }, (_, p) =>
        (mask >> p) & 1 ? -1 : 1,
      )

      oneRoleHeld += isPsdExact(boundMatrix({ points: exact1, signs, c: 5n }))
        .psd
        ? 1
        : 0
    }

    const oneRoleStrangeAt4 = isPsdExact(
      boundMatrix({
        points: exact1,
        signs: strange1.map(w => (w >= 0 ? 1 : -1)),
        c: 4n,
      }),
    ).psd
    const twoRoleStrangeAt24 = isPsdExact(
      boundMatrix({ points: exact2, signs: strangeSigns, c: 24n }),
    ).psd
    const g4 = oneRoleHeld === 512 && !oneRoleStrangeAt4 && !twoRoleStrangeAt24

    // G5 the search outside the family
    let best = 0
    let above = 0
    let at25 = 0

    for (let k = 0; k < SEARCH_STARTS; k++) {
      const v = weylUnitVector({ dimension: 18, start: SEARCH_OFFSET + k })
      const found = ascend(
        { re: Array.from(v.slice(0, 9)), im: Array.from(v.slice(9, 18)) },
        float2,
      )

      best = Math.max(best, found)
      above += found > 25 / 9 + 1e-9 ? 1 : 0
      at25 += Math.abs(found - 25 / 9) < 1e-9 ? 1 : 0
    }

    const g5 = above === 0

    const status = g1 && g2 && g3 && g4 && g5 ? 'pass' : 'fail'

    return verdict({
      status,
      claim: `on two roles the Wigner norm s is at most 25/9, so the fear share at most 8/25, for every state whose sign pattern is invariant under the joint quarter turn F x F (${familyA.held} of ${familyA.patterns} patterns certified exactly over Z[omega], ${familyA.tight} attaining 25/9) or the opposite turn F x conj(F) (${familyB.held} of ${familyB.patterns}, ${familyB.tight} attaining), and for every Clifford image of such a state; Strange x Strange attains it in both; outside the family the ascent from ${SEARCH_STARTS} new starts reaches ${best.toFixed(9)} (${at25} at 25/9, ${above} above), so no state above 8/25 is known, but the ceiling over all states is not proven here`,
      metrics: {
        gateExactOperators: g1 ? 1 : 0,
        gateFamilies: g2 ? 1 : 0,
        gateCertificate: g3 ? 1 : 0,
        gateControls: g4 ? 1 : 0,
        gateSearch: g5 ? 1 : 0,
        orbitsJointTurn: orbitsA.length,
        orbitsOppositeTurn: orbitsB.length,
        jointTurnPatterns: familyA.patterns,
        jointTurnCertified: familyA.held,
        jointTurnAttaining: familyA.tight,
        oppositeTurnPatterns: familyB.patterns,
        oppositeTurnCertified: familyB.held,
        oppositeTurnAttaining: familyB.tight,
        strangePairRankAt25: strangeAt25.rank,
        searchStarts: SEARCH_STARTS,
        searchBest: best,
        searchAt25Over9: at25,
        searchAbove25Over9: above,
        fearShareCeilingOnFamily: 8 / 25,
      },
      control: {
        oneRolePatternsAt5: oneRoleHeld,
        oneRoleStrangeAt4Psd: oneRoleStrangeAt4 ? 1 : 0,
        twoRoleStrangeAt24Psd: twoRoleStrangeAt24 ? 1 : 0,
        cauchySchwarzTwoRoles: 3,
      },
      notes:
        'L1. Gates fixed before the first run. The certificate is exact (Bareiss elimination over Z[omega], integers only); floats enter only to find which point permutation F induces (checked to 1e-9 against the 81 operators) and in the G5 search. What the certificate does not reach: a state whose sign pattern has no symmetry. A proof over all 2^81 patterns, or a state above 25/9, is what remains of OPEN-QTM-18.',
    })
  },
})
