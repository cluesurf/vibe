// The love-fear middle rung's true CHSH maximum, by Jordan's lemma (E-QTM-0165).
//
// The ledger row is open: E-QTM-0140 read the middle color knot (Schmidt weights (4 + sqrt 15) / 9, 1/9,
// (4 - sqrt 15) / 9, e2 = 1/9, e3 = 1/729) at (8 + 2 sqrt 21 + 2 sqrt 35 - 2 sqrt 15) / 9 = 2.3613 by the
// Schmidt-aligned block formula, and called that a lower bound because a 1,500-start see-saw on the same pure knot
// reached 2.3848. E-QTM-0132 had proven the formula is the maximum (code/measure/pure-chsh, pureChshExact). The
// two cannot both stand. The routes map (A, the middle rung's true maximum, Jordan blocks) asks for the exact
// maximum by Jordan's lemma, and names the kill: an exact optimum below 2.3848 means the see-saw found a value the
// algebra cannot reach, an instrument fault.
//
// THE ARGUMENT, restated. Alice's two ±1 observables split C^3 into a plane S and a line E on which both act
// (Jordan 1875; Masanes 2006 for CHSH); Bob's into T and F. The Bell operator is block diagonal on S x T, S x F,
// E x T, E x F, so CHSH is the sum of the blocks' values on the pieces of psi. On S x T it is a two-qubit CHSH
// operator, at most 2 sqrt((a + b)^2 + 4 a b) on a piece whose coefficient matrix has squared singular values a,
// b (Horodecki, Horodecki, Horodecki 1995). On each other block one side is a sign, so the block is a sign times
// at most 2 times its weight. Hence CHSH <= 2 sqrt((a + b)^2 + 4 a b) + 2 (1 - a - b), increasing in a and in b,
// and a compression's singular values sit below the whole's (a <= p1, b <= p2). The bound is met by the aligned
// blocks. So
//   CHSH_max = 2 sqrt((p1 + p2)^2 + 4 p1 p2) + 2 p3.
//
// HYPOTHESES, written before the first run:
//   H  the exact maximum is J = (8 + 2 sqrt 21 + 2 sqrt 35 - 2 sqrt 15) / 9 = 2.36128..., the aligned value,
//      and the see-saw's 2.3848 is an instrument fault (the route's kill, read as predicted)
//   P  falsifier: a pair of observables verified to be ±1 (|A^2 - 1| and |A - A^dagger| below 1e-12), whose
//      CHSH computed by the independent closed-form trace norm exceeds J by more than 1e-9. The Jordan argument
//      above would then be wrong
//   R  ring membership (routes map, third route): J lies in Q(sqrt 15, sqrt 21), degree 4 over Q, while the
//      knot's Schmidt weights generate only Q(sqrt 15). So J is NOT in the field of the knot's weights
// GATES, fixed before the first run:
//   G0 the weights are the knot's: e1 = 1, e2 = 1/9, e3 = 1/729 exactly (E-QTM-0140's integers)
//   G1 exact algebra in Z[sqrt 15, sqrt 21]: (p1 + p2)^2 + 4 p1 p2 = (56 + 14 sqrt 15) / 81 = ((sqrt 21 +
//      sqrt 35) / 9)^2, so J is the closed form above
//   G2 J's minimal polynomial over Q is computed exactly as the product over the four field conjugates (every
//      coefficient's irrational part exactly 0), has degree 4, and J is its root to 1e-12
//   G3 attainment: the aligned Horodecki settings, read directly as <psi|B|psi>, give J to 1e-12
//   G4 the independent instrument (code/measure/jordan-chsh: Jordan pairs that are ±1 by construction, Bob's
//      best answer by the closed-form trace norm) never exceeds J + 1e-12 over a deterministic pattern search
//      from 64 Weyl starts per sign pair, and reaches J - 1e-9; its cubic eigenvalues are right on three
//      matrices with known spectra
// Verdict: fail if a gate fails or P is met; pass otherwise. Reported: the old see-saws rerun at 1,500 starts
// (pureSeeSaw on the Schmidt form, densitySeeSaw on the Schmidt density and on a locally rotated copy), their
// largest values, and for pureSeeSaw the involution defect of the observables it returns and their value under
// the independent trace norm, which is where an excess would be traced.
//
// FIRST RUN, 2026-10-01 (tmp/qx-jordan-run1.log, 41 s): pass, every gate as fixed, H and R as predicted, P not
// met. J = 2.361260473744, minimal polynomial 6561 x^4 - 23328 x^3 - 14904 x^2 + 123840 x - 106160 (y = 9 J - 8:
// y^4 - 568 y^2 + 6720 y - 20144). The Jordan search reaches J + 2e-15. The old see-saws do NOT reproduce
// 2.3848: pureSeeSaw (its observables ±1 to 4e-16, its value confirmed by the closed-form trace norm),
// densitySeeSaw on the Schmidt density and on a locally rotated copy all read J to 5e-15 at 1,500 starts. Every
// see-saw here returns contractions, so none can pass the true maximum of a normalized state; the 2.3848 was
// therefore read on some other state than this knot (not recorded in the tree), and the prediction "an
// instrument fault in the see-saw" is replaced by "a reading of a different object". The ledger's 2.3848 is
// withdrawn as a value of this knot.
//
// DETERMINISM: no random number; Weyl starts. Depth L1: an exact algebraic fact about one knot of the rule,
// with an independent floating witness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  densitySeeSaw,
  pureChshExact,
  pureSeeSaw,
  type Complex3,
  type Density9,
} from '@/code/measure/pure-chsh'
import {
  chshDirect,
  chshOfAlice,
  hermitianEigenvalues,
  identityC3,
  involutionDefect,
  jordanSearch,
  zeroC3,
  type C3,
} from '@/code/measure/jordan-chsh'

const SEARCH_STARTS = 64
const SEESAW_STARTS = 1500

// Z[sqrt 15, sqrt 21] on the basis 1, sqrt 15, sqrt 21, sqrt 35
type Q4 = [bigint, bigint, bigint, bigint]

function q4mul(x: Q4, y: Q4): Q4 {
  const [a0, a1, a2, a3] = x
  const [b0, b1, b2, b3] = y

  // 15 15 = 15, 15 21 = 3 sqrt35, 15 35 = 5 sqrt21, 21 21 = 21, 21 35 = 7 sqrt15, 35 35 = 35
  return [
    a0 * b0 + 15n * a1 * b1 + 21n * a2 * b2 + 35n * a3 * b3,
    a0 * b1 + a1 * b0 + 7n * (a2 * b3 + a3 * b2),
    a0 * b2 + a2 * b0 + 5n * (a1 * b3 + a3 * b1),
    a0 * b3 + a3 * b0 + 3n * (a1 * b2 + a2 * b1),
  ]
}

const q4add = (x: Q4, y: Q4): Q4 => [
  x[0] + y[0],
  x[1] + y[1],
  x[2] + y[2],
  x[3] + y[3],
]
const q4eq = (x: Q4, y: Q4): boolean => x.every((v, k) => v === y[k])
const q4value = (x: Q4): number =>
  Number(x[0]) +
  Number(x[1]) * Math.sqrt(15) +
  Number(x[2]) * Math.sqrt(21) +
  Number(x[3]) * Math.sqrt(35)

// the conjugate with sqrt 15 -> s sqrt 15, sqrt 21 -> t sqrt 21
const q4conj = (x: Q4, s: bigint, t: bigint): Q4 => [
  x[0],
  s * x[1],
  t * x[2],
  s * t * x[3],
]

// prod over the four conjugates of (x - y), a polynomial whose coefficients must be rational
function minimalPolynomial(y: Q4): bigint[] {
  let poly: Q4[] = [[1n, 0n, 0n, 0n]]

  for (const [s, t] of [
    [1n, 1n],
    [-1n, 1n],
    [1n, -1n],
    [-1n, -1n],
  ] as const) {
    const root = q4conj(y, s, t)
    const minus: Q4 = [-root[0], -root[1], -root[2], -root[3]]
    const next: Q4[] = Array.from({ length: poly.length + 1 }, () => [
      0n,
      0n,
      0n,
      0n,
    ])

    poly.forEach((c, k) => {
      next[k + 1] = q4add(next[k + 1]!, c)
      next[k] = q4add(next[k]!, q4mul(c, minus))
    })

    poly = next
  }

  return poly.map(c => {
    if (c[1] !== 0n || c[2] !== 0n || c[3] !== 0n) {
      throw new Error('a coefficient of the minimal polynomial is not rational')
    }

    return c[0]
  })
}

// m(9 x - 8), made primitive
function substitute(m: readonly bigint[]): bigint[] {
  let out: bigint[] = [0n]
  let power: bigint[] = [1n]

  const linear = [-8n, 9n]

  m.forEach(c => {
    const term = power.map(x => x * c)

    out = Array.from({ length: Math.max(out.length, term.length) }, (_, k) =>
      (out[k] ?? 0n) + (term[k] ?? 0n),
    )

    power = Array.from({ length: power.length + 1 }, (_, k) =>
      (power[k] ?? 0n) * linear[0]! + (power[k - 1] ?? 0n) * linear[1]!,
    )
  })

  const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? a : gcd(b, a % b))
  const g = out.reduce((a, b) => gcd(a, b < 0n ? -b : b), 0n)

  return out.map(x => x / g)
}

function fromComplex3(a: Complex3): C3 {
  return { re: Array.from(a.re), im: Array.from(a.im) }
}

// psi = (U (x) V) sum sqrt(p_k) |k k>, as a Density9
function densityOf(p: readonly number[], u: C3, v: C3): Density9 {
  const psiRe = new Array<number>(9).fill(0)
  const psiIm = new Array<number>(9).fill(0)

  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const w = Math.sqrt(p[k]!)
        const ur = u.re[3 * i + k]!
        const ui = u.im[3 * i + k]!
        const vr = v.re[3 * j + k]!
        const vi = v.im[3 * j + k]!

        psiRe[3 * i + j] = psiRe[3 * i + j]! + w * (ur * vr - ui * vi)
        psiIm[3 * i + j] = psiIm[3 * i + j]! + w * (ur * vi + ui * vr)
      }
    }
  }

  const re = new Float64Array(81)
  const im = new Float64Array(81)

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      re[r * 9 + c] = psiRe[r]! * psiRe[c]! + psiIm[r]! * psiIm[c]!
      im[r * 9 + c] = psiIm[r]! * psiRe[c]! - psiRe[r]! * psiIm[c]!
    }
  }

  return { re, im }
}

function fourier(phase: number): C3 {
  const m = zeroC3()

  for (let j = 0; j < 3; j++) {
    for (let k = 0; k < 3; k++) {
      const angle = (2 * Math.PI * j * k) / 3 + phase * k * k

      m.re[3 * j + k] = Math.cos(angle) / Math.sqrt(3)
      m.im[3 * j + k] = Math.sin(angle) / Math.sqrt(3)
    }
  }

  return m
}

export default experiment({
  id: 'quantum/middle-rung-jordan',
  code: 'E-QTM-0165',
  title:
    "the love-fear middle rung's true CHSH maximum is the aligned value (8 + 2 sqrt 21 + 2 sqrt 35 - 2 sqrt 15) / 9 = 2.36126, by Jordan's lemma, pass: a root of 6561 x^4 - 23328 x^3 - 14904 x^2 + 123840 x - 106160, in Q(sqrt 15, sqrt 21) and so outside the knot's own field Q(sqrt 15); an independent search over exact Jordan pairs and every see-saw in the package at 1,500 starts reach it to 5e-15 and never pass it, so the recorded 2.3848 is not a value this knot can give",
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    // the weights over 9: p1 = (4 + sqrt 15) / 9, p2 = 1/9, p3 = (4 - sqrt 15) / 9
    const w1: Q4 = [4n, 1n, 0n, 0n]
    const w2: Q4 = [1n, 0n, 0n, 0n]
    const w3: Q4 = [4n, -1n, 0n, 0n]
    // G0: e1 = 9 / 9, e2 = 81 * (1/9) / 81, e3 = 729 * (1/729) / 729
    const e1 = q4add(q4add(w1, w2), w3)
    const e2 = q4add(q4add(q4mul(w1, w2), q4mul(w1, w3)), q4mul(w2, w3))
    const e3 = q4mul(q4mul(w1, w2), w3)
    const g0 =
      q4eq(e1, [9n, 0n, 0n, 0n]) &&
      q4eq(e2, [9n, 0n, 0n, 0n]) &&
      q4eq(e3, [1n, 0n, 0n, 0n])

    // G1: 81 ((p1 + p2)^2 + 4 p1 p2) = (w1 + w2)^2 + 4 w1 w2, and (sqrt 21 + sqrt 35)^2
    const sum = q4add(w1, w2)
    const inside = q4add(q4mul(sum, sum), q4mul([4n, 0n, 0n, 0n], q4mul(w1, w2)))
    const root: Q4 = [0n, 0n, 1n, 1n]
    const g1 =
      q4eq(inside, [56n, 14n, 0n, 0n]) && q4eq(q4mul(root, root), inside)

    // J = (2 (sqrt 21 + sqrt 35) + 2 (4 - sqrt 15)) / 9 = (8 + y) / 9
    const y: Q4 = [0n, -2n, 2n, 2n]
    const jordan = (8 + q4value(y)) / 9
    const p = [
      (4 + Math.sqrt(15)) / 9,
      1 / 9,
      (4 - Math.sqrt(15)) / 9,
    ]
    const formula = pureChshExact(p)

    // G2
    const yPoly = minimalPolynomial(y)
    const jPoly = substitute(yPoly)
    const evaluate = (poly: readonly bigint[], x: number): number =>
      poly.reduceRight((acc, c) => acc * x + Number(c), 0)
    const scaleOf = jPoly.reduce((s, c) => s + Math.abs(Number(c)), 0)
    const g2 =
      jPoly.length === 5 &&
      Math.abs(evaluate(jPoly, jordan)) / scaleOf < 1e-12 &&
      // y is moved by every nontrivial automorphism (each of its sqrt coordinates is nonzero), so its orbit
      // has four elements and the product is the minimal polynomial
      y[1] !== 0n &&
      y[2] !== 0n &&
      y[3] !== 0n

    // G3: the aligned settings, read directly
    const a01 = p[0]! + p[1]!
    const t = Math.atan2(2 * Math.sqrt(p[0]! * p[1]!), a01)
    const zBlock = identityC3()

    zBlock.re[4] = -1

    const xBlock = zeroC3()

    xBlock.re[1] = 1
    xBlock.re[3] = 1
    xBlock.re[8] = 1

    const bob = (s: number): C3 => ({
      re: zBlock.re.map(
        (z, k) =>
          (k === 8 ? 1 : Math.cos(t) * z) +
          (k === 8 ? 0 : s * Math.sin(t) * (xBlock.re[k] ?? 0)),
      ),
      im: new Array<number>(9).fill(0),
    })
    const attained = chshDirect(p, [zBlock, xBlock], [bob(1), bob(-1)])
    const g3 = Math.abs(attained - jordan) < 1e-12

    // G4: the method check on known spectra, then the search
    const known: [C3, number[]][] = [
      [
        { re: [2, 1, 0, 1, 2, 0, 0, 0, -1], im: new Array<number>(9).fill(0) },
        [-1, 1, 3],
      ],
      [
        {
          re: [1, 0, 0, 0, 1, 0, 0, 0, 5],
          im: [0, 1, 0, -1, 0, 0, 0, 0, 0],
        },
        [0, 2, 5],
      ],
      [
        { re: [0.5, 0, 0, 0, -0.25, 0, 0, 0, 0.75], im: new Array<number>(9).fill(0) },
        [-0.25, 0.5, 0.75],
      ],
    ]
    const methodError = Math.max(
      ...known.map(([m, spectrum]) => {
        const got = hermitianEigenvalues(m).sort((a, b) => a - b)

        return Math.max(...got.map((x, k) => Math.abs(x - spectrum[k]!)))
      }),
    )
    const search = jordanSearch(p, SEARCH_STARTS)
    const g4 =
      methodError < 1e-12 &&
      search.value <= jordan + 1e-12 &&
      search.value >= jordan - 1e-9

    // the old instruments, rerun
    const pure = pureSeeSaw(p, SEESAW_STARTS)
    const pureA0 = fromComplex3(pure.a0)
    const pureA1 = fromComplex3(pure.a1)
    const pureDefect = Math.max(
      involutionDefect(pureA0),
      involutionDefect(pureA1),
    )
    const pureIndependent = chshOfAlice(p, pureA0, pureA1)
    const diagonal = densitySeeSaw(
      densityOf(p, identityC3(), identityC3()),
      SEESAW_STARTS,
    )
    const rotated = densitySeeSaw(
      densityOf(p, fourier(0.3), fourier(1.1)),
      SEESAW_STARTS,
    )
    // P: a verified ±1 pair above J by more than 1e-9, from any instrument that returns its observables
    const falsified =
      search.value > jordan + 1e-9 ||
      (pureDefect < 1e-12 && pureIndependent > jordan + 1e-9)
    const ok = g0 && g1 && g2 && g3 && g4 && !falsified

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: ok
        ? `the middle rung's exact CHSH maximum is (8 + 2 sqrt 21 + 2 sqrt 35 - 2 sqrt 15) / 9 = ${jordan.toFixed(12)}, a root of ${jPoly.map((c, k) => `${c} x^${k}`).join(' + ')}, in Q(sqrt 15, sqrt 21) and not in the knot's own field Q(sqrt 15); an independent search over exact Jordan pairs reaches ${search.value.toFixed(12)} and never more; the old see-saws reread at 1,500 starts give ${pure.value.toFixed(6)} (pure), ${diagonal.toFixed(6)} and ${rotated.toFixed(6)} (density)`
        : 'a gate failed or a verified pair exceeds the Jordan bound',
      metrics: {
        jordanMaximum: jordan,
        pureChshExactFormula: formula,
        attainedAligned: attained,
        searchBest: search.value,
        searchMinusJordan: search.value - jordan,
        minimalPolynomialDegree: jPoly.length - 1,
        pureSeeSaw: pure.value,
        pureSeeSawObservableDefect: pureDefect,
        pureSeeSawIndependentValue: pureIndependent,
        densitySeeSawDiagonal: diagonal,
        densitySeeSawRotated: rotated,
        seeSawExcessOverJordan: Math.max(pure.value, diagonal, rotated) - jordan,
        registeredSeeSaw: 2.3848,
      },
      control: {
        weightsAreTheKnot: g0 ? 1 : 0,
        closedFormExact: g1 ? 1 : 0,
        minimalPolynomialExact: g2 ? 1 : 0,
        attainment: g3 ? 1 : 0,
        cubicMethodError: methodError,
        searchBounded: g4 ? 1 : 0,
      },
      notes: `L1. Minimal polynomial of y = 9 J - 8 = 2 (sqrt 21 + sqrt 35 - sqrt 15): ${yPoly.join(', ')} (lowest first); of J: ${jPoly.join(', ')}. The search's best signs ${search.signs.join(', ')}.`,
    })
  },
})
