// Frame-covariant meetings of three tokens: which Clifford meetings commute with every change of frame.
//
// E-QTM-0127 found that SUM reads a role exactly but commutes with only 2 of the 216 frame changes, and that
// the commutant of C x C over Sigma(648) is 2-dimensional, so the only two-role meetings that rotate with
// the frame are the fear beat's family. The hypothesis tested here (quantum reference frames, Bartlett,
// Rudolph and Spekkens 2007): the axis a measurement needs is not in the rule but in the STATE of a third
// vibe, so a three-body meeting of system, record and reference can be covariant and still read a role.
//
// The exact classification (code/measure/frame-covariant-meeting, header): a Clifford meeting moves stored
// joint points by an affine symplectic map. Covariance under the diagonal frame change forces the linear
// part to be A (x) 1, A an n x n matrix over F3 on the token index, with A^T W A = W (W = diag of the
// tokens' signs, the stored form) and A 1 = 1, and forces the shift to 0. The form's value on 1 is the
// vibe charge. On a knot (charge 0 mod 3) 1 is isotropic, and on anything else the reflection through 1,
// R = 2 q^(-1) 1 w^T - 1, is covariant.
//
// Predictions, written before any code ran:
//   - the F3 linear commutant of the diagonal SL(2, 3) on n tokens has dimension n^2 (n = 1, 2, 3)
//   - covariant Clifford meetings: LL 2 (1, SWAP), LF 1 (only 1), LLL 6 (the permutations), LLF 4 (1, the
//     swap of the loves, R, R times that swap), and the same for the sign-flipped patterns
//   - so on three tokens a covariant meeting that is not a permutation exists exactly when the triple is
//     NOT a knot: the hypothesis that a covariant measurement needs system + record + reference to sum to 0
//     mod 3 is predicted WRONG, the opposite holds
//   - every found map commutes with all 216 diagonal grid moves on the 729 joint points, keeps the stored
//     form, and keeps the color content Q = sum w_i x_i; SUM x 1 commutes with 2 of 216
//   - the unitary commutants of C x C x C and C x C x C* over Sigma(648) have equal dimension (|chi|^6 on
//     both), larger than SU(3)'s 6 (the qutrit Clifford group is a 2-design and not a 3-design)
//   - R's unitary lift commutes with all 648 elements acting as C x C x C*, not with C x C x C, and moves
//     the 729 phase points of three roles by the permutation R (Gross)
// Probe before the gates (disclosed): tmp/frame-meet-probe.ts printed the counts above, the value 7 of
// both three-token commutants and the four-token counts before this header's gates were written. The gates
// below are the predictions above, unchanged. The readings on 7 (which operator is the seventh) and on four
// tokens were added after the probe and are readings, not gates.
//
// Gates, fixed before the experiment's first run:
//   G1 the F3 linear commutant dimension is 1, 4, 9 for n = 1, 2, 3.
//   G2 the covariant Clifford counts are LL 2, LF 1, FF 2, and for three tokens 6 on LLL and FFF and 4 on
//      each of the six mixed patterns; LLL's are exactly the permutations; each mixed pattern's are exactly
//      {1, the swap of its like pair, R, R times that swap}.
//   G3 every found three-token map, on its pattern: a bijection of the 729 stored joint points, commuting
//      with all 216 diagonal grid moves, keeping B(Fx, Fy) = B(x, y) on all 531,441 pairs and Q at all 729;
//      SUM x 1 (SUM on the first two, the third idle) commutes with exactly 2 of the 216.
//   G4 the knot law on three tokens: a non-permutation covariant Clifford exists on exactly the 6 patterns
//      with charge not 0 mod 3, and on neither knot pattern.
//   G5 the unitary commutant dimensions of C x C and C x C* are 2, and of C x C x C and C x C x C* are equal
//      and larger than 6.
//   G6 R's lift on LLF: unitary to 1e-9, commuting with all 648 elements of C x C x C* to 1e-9, NOT with
//      C x C x C (control), and U A(y) U^dagger = A(S y) at all 729 phase points, S the physical form of R.
// Readings: the seventh dimension of the LLL commutant (the neutral projector P_knot = (1/9) sum_v D(v)^(x3),
// its rank with the 6 permutations, and whether it commutes with the frame on C x C x C and on C x C x C*),
// the rank of the obvious LLF commutant elements, and the four-token counts with their permutation share.
//
// FIRST RUN (2026-09-26, 4.8 s): every gate passes as predicted. F3 linear commutant 1, 4, 9. Covariant
// Cliffords LL 2, LF 1, FF 2, LLL and FFF 6 (the permutations), each mixed pattern 4 with 2 that are not
// permutations (R and R times the like swap). 5,668,704 grid checks, 0 bad; SUM x 1 commutes with 2 of 216.
// Unitary commutants 2 (two tokens) and 7 on both LLL and LLF, above SU(3)'s 6; frame moment 8 is 40. R's
// lift: unitarity 4e-16, commutator with C x C x C* 5.3e-15 on all 648, with C x C x C 1.73, 0 kernel
// mismatches on 729 phase points. Readings: the seventh LLL dimension is the knot projector P_knot =
// (1/9) sum_v D(v)^(x3), trace 3 (the neutral states of three loves), idempotent, commuting with C x C x C
// (2e-15) and not with C x C x C* (0.58), rank 7 with the 6 permutations. The LLF commutant is spanned by
// {1, P12, U_R, U_R P12, P_Phi(1,3), P_Phi(2,3), P_Phi(1,3) P_Phi(2,3)} (rank 7), and rank 5 without R: R
// supplies two of the seven dimensions. Four tokens: LLLL 48 covariant (24 permutations), LLLF 48 (6),
// LLFF, a knot, 36 (4). So the three-token knot law does not extend: a knot of four admits 32 covariant
// Cliffords that are not permutations (and E-QTM-0135 finds some of them measure).
//
// Depth L2: an exact classification (a theorem, checked by complete enumeration) plus its unitary check.
// The husk is not read: frame changes act on roles, never on where a vibe is.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { gridMoves } from '@/code/rule/vibe-weave'
import { phaseMove } from '@/code/rule/fear-weave'
import { sumPermutation } from '@/code/measure/sum-record'
import { displacementOperators } from '@/code/measure/qutrit-clifford'
import { adjointOperator, multiplyOperators, operator, phasePointOperators, tensorOperators, type Operator } from '@/code/measure/grid-weights'
import {
  applyStoredLinear,
  chargeOf,
  characterValues,
  commutatorSize,
  covariantCliffords,
  frameReflection,
  isPermutationMatrix,
  linearCommutantDimension,
  mod3,
  physicalMap,
  pointForm,
  sigma648Elements,
  weilLift,
} from '@/code/measure/frame-covariant-meeting'

const TOLERANCE = 1e-9
const FORM_TABLE = Int8Array.from({ length: 81 }, (_, k) => pointForm(Math.floor(k / 9), k % 9))

const patternsOf = (n: number): number[][] => Array.from({ length: 2 ** n }, (_, k) => Array.from({ length: n }, (__, i) => ((k >> i) & 1 ? -1 : 1)))
const sameMatrix = (a: readonly number[], b: readonly number[]): boolean => a.length === b.length && a.every((x, i) => x === b[i])
const multiply = (a: readonly number[], b: readonly number[], n: number): number[] =>
  Array.from({ length: n * n }, (_, k) => mod3(Array.from({ length: n }, (__, j) => (a[Math.floor(k / n) * n + j] ?? 0) * (b[j * n + (k % n)] ?? 0)).reduce((s, x) => s + x, 0)))
const swapMatrix = (i: number, j: number, n: number): number[] =>
  Array.from({ length: n * n }, (_, k) => {
    const r = Math.floor(k / n)
    const c = k % n
    const image = r === i ? j : r === j ? i : r

    return c === image ? 1 : 0
  })
const identityMatrix = (n: number): number[] => Array.from({ length: n * n }, (_, k) => (Math.floor(k / n) === k % n ? 1 : 0))

// the three stored points of joint index j, most significant first
const splitThree = (j: number): number[] => [Math.floor(j / 81), Math.floor(j / 9) % 9, j % 9]
const joinThree = (p: readonly number[]): number => 81 * (p[0] ?? 0) + 9 * (p[1] ?? 0) + (p[2] ?? 0)

// the rank of a set of operators as vectors, by Gram-Schmidt
function operatorRank(ops: readonly Operator[]): number {
  const basis: { re: Float64Array; im: Float64Array }[] = []

  for (const op of ops) {
    const re = Float64Array.from(op.re)
    const im = Float64Array.from(op.im)

    for (const b of basis) {
      // <b, v> = sum conj(b) v
      let pr = 0
      let pi = 0

      for (let i = 0; i < re.length; i++) {
        pr += (b.re[i] ?? 0) * (re[i] ?? 0) + (b.im[i] ?? 0) * (im[i] ?? 0)
        pi += (b.re[i] ?? 0) * (im[i] ?? 0) - (b.im[i] ?? 0) * (re[i] ?? 0)
      }

      for (let i = 0; i < re.length; i++) {
        re[i] = (re[i] ?? 0) - (pr * (b.re[i] ?? 0) - pi * (b.im[i] ?? 0))
        im[i] = (im[i] ?? 0) - (pr * (b.im[i] ?? 0) + pi * (b.re[i] ?? 0))
      }
    }

    let norm = 0

    for (let i = 0; i < re.length; i++) {
      norm += (re[i] ?? 0) ** 2 + (im[i] ?? 0) ** 2
    }

    if (Math.sqrt(norm) > 1e-7) {
      const s = 1 / Math.sqrt(norm)

      basis.push({ re: re.map(x => x * s), im: im.map(x => x * s) })
    }
  }

  return basis.length
}

// the operator permuting three qutrits: output factor i holds input factor order[i]
function permutationOperator(order: readonly number[]): Operator {
  const u = operator(27)

  for (let j = 0; j < 27; j++) {
    const digits = [Math.floor(j / 9), Math.floor(j / 3) % 3, j % 3]
    const image = 9 * (digits[order[0] ?? 0] ?? 0) + 3 * (digits[order[1] ?? 1] ?? 0) + (digits[order[2] ?? 2] ?? 0)

    u.re[image * 27 + j] = 1
  }

  return u
}

export default experiment({
  id: 'quantum/frame-covariant-meetings',
  code: 'E-QTM-0134',
  title:
    'frame-covariant meetings of three tokens: the Clifford meetings that commute with every change of frame are A (x) 1 with A orthogonal for the tokens\' signs and fixed on the all-ones vector, whose norm is the vibe charge; on a knot of three (LLL) they are only the 6 permutations, and on a love-love-fear triple they add the reflection through the frame direction, the one covariant meeting that is not a permutation',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // G1
    const linear = [1, 2, 3].map(n => linearCommutantDimension(n))

    // G2 and G4
    const counts: Record<string, number> = {}
    let setsBad = 0
    let knotLawBad = 0
    const found = new Map<string, number[][]>()

    for (const n of [2, 3]) {
      for (const signs of patternsOf(n)) {
        const all = covariantCliffords(signs)
        const name = signs.map(w => (w > 0 ? 'L' : 'F')).join('')
        const nonPermutations = all.filter(a => !isPermutationMatrix(a, n)).length

        counts[`covariant_${name}`] = all.length
        counts[`nonPermutation_${name}`] = nonPermutations
        found.set(name, all)

        if (n === 3) {
          const charge = chargeOf(signs)

          knotLawBad += (nonPermutations > 0) === (charge !== 0) ? 0 : 1

          if (charge === 0) {
            setsBad += all.length === 6 && all.every(a => isPermutationMatrix(a, 3)) ? 0 : 1
          } else {
            // the like pair: the two slots whose signs agree
            const odd = signs.findIndex(w => signs.filter(x => x === w).length === 1)
            const [i, j] = [0, 1, 2].filter(k => k !== odd)
            const r = frameReflection(signs)!
            const p = swapMatrix(i ?? 0, j ?? 1, 3)
            const expected = [identityMatrix(3), p, r, multiply(r, p, 3)]

            setsBad += all.length === 4 && expected.every(e => all.some(a => sameMatrix(a, e))) ? 0 : 1
          }
        }
      }
    }

    const countsOk =
      counts.covariant_LL === 2 &&
      counts.covariant_LF === 1 &&
      counts.covariant_FL === 1 &&
      counts.covariant_FF === 2 &&
      patternsOf(3).every(s => counts[`covariant_${s.map(w => (w > 0 ? 'L' : 'F')).join('')}`] === (chargeOf(s) === 0 ? 6 : 4))

    // G3: the grid-level check on 729 stored joint points
    const moves = gridMoves()
    const phaseMoves = moves.act.map(g => phaseMove(g))
    const out = [0, 0, 0]
    let gridBad = 0
    let gridChecks = 0

    for (const signs of patternsOf(3)) {
      const name = signs.map(w => (w > 0 ? 'L' : 'F')).join('')

      for (const a of found.get(name) ?? []) {
        const image = new Int16Array(729)
        const hit = new Uint8Array(729)
        let bad = 0

        for (let j = 0; j < 729; j++) {
          applyStoredLinear(a, splitThree(j), out)
          image[j] = joinThree(out)
          bad += hit[image[j] ?? 0] === 1 ? 1 : 0
          hit[image[j] ?? 0] = 1

          // the color content Q = sum w_i x_i, both components
          const q = (p: readonly number[]): number => {
            let qa = 0
            let qb = 0

            p.forEach((x, i) => {
              qa += (signs[i] ?? 0) * Math.floor(x / 3)
              qb += (signs[i] ?? 0) * (x % 3)
            })

            return 3 * mod3(qa) + mod3(qb)
          }

          bad += q(splitThree(j)) === q(out) ? 0 : 1
        }

        for (const g of phaseMoves) {
          for (let j = 0; j < 729; j++) {
            const moved = joinThree(splitThree(j).map(p => g[p] ?? 0))
            const left = image[moved] ?? 0
            const right = joinThree(splitThree(image[j] ?? 0).map(p => g[p] ?? 0))

            gridChecks++
            bad += left === right ? 0 : 1
          }
        }

        // the stored form on every pair
        const form = (x: number, y: number): number =>
          mod3(
            (signs[0] ?? 0) * (FORM_TABLE[9 * Math.floor(x / 81) + Math.floor(y / 81)] ?? 0) +
              (signs[1] ?? 0) * (FORM_TABLE[9 * (Math.floor(x / 9) % 9) + (Math.floor(y / 9) % 9)] ?? 0) +
              (signs[2] ?? 0) * (FORM_TABLE[9 * (x % 9) + (y % 9)] ?? 0),
          )

        for (let x = 0; x < 729 && bad === 0; x++) {
          for (let y = 0; y < 729; y++) {
            if (form(image[x] ?? 0, image[y] ?? 0) !== form(x, y)) {
              bad++
              break
            }
          }
        }

        gridBad += bad
      }
    }

    // the SUM control: SUM on the first two tokens, the third idle
    const sum = sumPermutation()
    const sumCovariant = phaseMoves.filter(g => {
      for (let j = 0; j < 729; j++) {
        const [x, y, z] = splitThree(j)
        const moved = [g[x ?? 0] ?? 0, g[y ?? 0] ?? 0, g[z ?? 0] ?? 0]
        const s1 = sum[9 * (moved[0] ?? 0) + (moved[1] ?? 0)] ?? 0
        const s0 = sum[9 * (x ?? 0) + (y ?? 0)] ?? 0

        if (s1 !== 9 * (g[Math.floor(s0 / 9)] ?? 0) + (g[s0 % 9] ?? 0)) {
          return false
        }
      }

      return true
    }).length

    // G5: the unitary commutants by characters
    const group = sigma648Elements()
    const chi = characterValues(group)
    const moment = (k: number): number => chi.reduce((s, [re, im]) => s + Math.hypot(re, im) ** k, 0) / group.length
    const commutant2 = moment(4)
    const commutant3 = moment(6)
    // C x C x C* has character chi^2 conj(chi), whose squared modulus is |chi|^6 as well: computed apart
    const commutant3Mixed = chi.reduce((s, [re, im]) => {
      // chi^2 conj chi = |chi|^2 chi
      const m = re * re + im * im

      return s + (m * re) ** 2 + (m * im) ** 2
    }, 0) / group.length

    // G6: R's lift
    const signs = [1, 1, -1]
    const r = frameReflection(signs)!
    const s = physicalMap(r, signs)
    const u = weilLift(s, 3)!
    const uu = multiplyOperators(u, adjointOperator(u))
    let unitarity = 0

    for (let i = 0; i < 27; i++) {
      for (let j = 0; j < 27; j++) {
        unitarity = Math.max(unitarity, Math.hypot((uu.re[i * 27 + j] ?? 0) - (i === j ? 1 : 0), uu.im[i * 27 + j] ?? 0))
      }
    }

    const conjugateOf = (c: Operator): Operator => ({ n: c.n, re: Float64Array.from(c.re), im: Float64Array.from(c.im, x => -x) })
    const mixedFrames = group.map(g => tensorOperators(tensorOperators(g, g), conjugateOf(g)))
    const likeFrames = group.map(g => tensorOperators(tensorOperators(g, g), g))
    const liftMixed = Math.max(...mixedFrames.map(v => commutatorSize(u, v)))
    const liftLike = Math.max(...likeFrames.map(v => commutatorSize(u, v)))
    const points = phasePointOperators(3)
    const ud = adjointOperator(u)
    const physicalImage = (y: number): number => {
      const c = splitThree(y).flatMap(p => [Math.floor(p / 3), p % 3])

      return joinThree(
        [0, 1, 2].map(i => {
          let a = 0
          let b = 0

          for (let k = 0; k < 6; k++) {
            a += (s[2 * i * 6 + k] ?? 0) * (c[k] ?? 0)
            b += (s[(2 * i + 1) * 6 + k] ?? 0) * (c[k] ?? 0)
          }

          return 3 * mod3(a) + mod3(b)
        }),
      )
    }
    let kernelBad = 0

    for (let y = 0; y < 729; y++) {
      const m = multiplyOperators(multiplyOperators(u, points[y]!), ud)
      const target = points[physicalImage(y)]!
      let e = 0

      for (let i = 0; i < 729; i++) {
        e = Math.max(e, Math.hypot((m.re[i] ?? 0) - (target.re[i] ?? 0), (m.im[i] ?? 0) - (target.im[i] ?? 0)))
      }

      kernelBad += e < TOLERANCE ? 0 : 1
    }

    // readings: the seventh dimension of LLL, the neutral projector
    const single = displacementOperators(1)
    const knot = operator(27)

    for (const d of single) {
      const t = tensorOperators(tensorOperators(d, d), d)

      for (let i = 0; i < 729; i++) {
        knot.re[i] = (knot.re[i] ?? 0) + (t.re[i] ?? 0) / 9
        knot.im[i] = (knot.im[i] ?? 0) + (t.im[i] ?? 0) / 9
      }
    }

    const orders = [
      [0, 1, 2],
      [1, 0, 2],
      [0, 2, 1],
      [2, 1, 0],
      [1, 2, 0],
      [2, 0, 1],
    ]
    const permutations = orders.map(permutationOperator)
    const knotSquared = multiplyOperators(knot, knot)
    let knotIdempotent = 0
    let knotTrace = 0

    for (let i = 0; i < 729; i++) {
      knotIdempotent = Math.max(knotIdempotent, Math.hypot((knotSquared.re[i] ?? 0) - (knot.re[i] ?? 0), (knotSquared.im[i] ?? 0) - (knot.im[i] ?? 0)))
    }

    for (let i = 0; i < 27; i++) {
      knotTrace += knot.re[i * 28] ?? 0
    }

    const knotLike = Math.max(...likeFrames.map(v => commutatorSize(knot, v)))
    const knotMixed = Math.max(...mixedFrames.map(v => commutatorSize(knot, v)))
    const lllRank = operatorRank([...permutations, knot])
    const permutationRank = operatorRank(permutations)

    // readings: LLF commutant elements, the singlet projectors of each love with the fear
    const singlet = (love: number): Operator => {
      const p = operator(27)

      // P_Phi on (love, fear 2): |Phi> = sum_j |j j> / sqrt 3 on those two factors, identity on the other
      for (let j = 0; j < 27; j++) {
        for (let k = 0; k < 27; k++) {
          const dj = [Math.floor(j / 9), Math.floor(j / 3) % 3, j % 3]
          const dk = [Math.floor(k / 9), Math.floor(k / 3) % 3, k % 3]
          const other = love === 0 ? 1 : 0

          if (dj[other] === dk[other] && dj[love] === dj[2] && dk[love] === dk[2]) {
            p.re[j * 27 + k] = 1 / 3
          }
        }
      }

      return p
    }
    const p12 = permutationOperator([1, 0, 2])
    const llfCandidates = [permutationOperator([0, 1, 2]), p12, u, multiplyOperators(u, p12), singlet(0), singlet(1), multiplyOperators(singlet(0), singlet(1))]
    const llfCandidatesCommute = Math.max(...llfCandidates.map(c => Math.max(...mixedFrames.map(v => commutatorSize(c, v)))))
    const llfRank = operatorRank(llfCandidates)
    const llfRankWithoutR = operatorRank(llfCandidates.filter((_, i) => i !== 2 && i !== 3))

    // readings: four tokens
    const four: Record<string, number> = {}

    for (const signs4 of [
      [1, 1, 1, 1],
      [1, 1, 1, -1],
      [1, 1, -1, -1],
    ]) {
      const all = covariantCliffords(signs4)
      const name = signs4.map(w => (w > 0 ? 'L' : 'F')).join('')

      four[`four_${name}_charge`] = chargeOf(signs4)
      four[`four_${name}_covariant`] = all.length
      four[`four_${name}_permutations`] = all.filter(a => isPermutationMatrix(a, 4)).length
    }

    const gates = {
      G1: linear[0] === 1 && linear[1] === 4 && linear[2] === 9,
      G2: countsOk && setsBad === 0,
      G3: gridBad === 0 && gridChecks > 0 && sumCovariant === 2,
      G4: knotLawBad === 0,
      G5: Math.abs(commutant2 - 2) < 1e-9 && Math.abs(commutant3 - commutant3Mixed) < 1e-9 && commutant3 > 6 + 1e-9,
      G6: unitarity < TOLERANCE && liftMixed < TOLERANCE && liftLike > 1e-3 && kernelBad === 0,
    }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim: `the covariant Clifford meetings of n tokens are A (x) 1 with A^T W A = W and A 1 = 1 (F3 linear commutant ${linear.join(', ')} for n = 1, 2, 3): LL ${counts.covariant_LL}, LF ${counts.covariant_LF}, LLL ${counts.covariant_LLL} (the permutations), LLF ${counts.covariant_LLF} (with the reflection R through the frame direction), so on three tokens a non-permutation covariant meeting exists exactly when the triple is not a knot; each keeps the stored form and the color content Q at all 729 joint points and commutes with all 216 diagonal grid moves (SUM x 1 with ${sumCovariant}); the unitary commutants are ${commutant2.toFixed(3)} on two tokens and ${commutant3.toFixed(3)} on LLL and LLF, the seventh LLL dimension the neutral projector of a knot, and R lifts to a unitary commuting with all 648 frame changes on C x C x C* (${liftMixed.toExponential(1)}) that moves the 729 phase points by R exactly`,
      metrics: {
        linearCommutant1: linear[0] ?? -1,
        linearCommutant2: linear[1] ?? -1,
        linearCommutant3: linear[2] ?? -1,
        ...counts,
        setsBad,
        knotLawBad,
        gridChecks,
        gridBad,
        sumCovariantOf216: sumCovariant,
        groupOrder: group.length,
        commutantTwo: commutant2,
        commutantThreeLike: commutant3,
        commutantThreeMixed: commutant3Mixed,
        frameMoment8: moment(8),
        liftUnitarityError: unitarity,
        liftCommutatorMixed: liftMixed,
        liftCommutatorLike: liftLike,
        liftKernelMismatches: kernelBad,
        knotProjectorIdempotence: knotIdempotent,
        knotProjectorTrace: knotTrace,
        knotProjectorCommutatorLike: knotLike,
        knotProjectorCommutatorMixed: knotMixed,
        permutationRank,
        permutationsPlusKnotRank: lllRank,
        llfCandidatesMaxCommutator: llfCandidatesCommute,
        llfCandidatesRank: llfRank,
        llfCandidatesRankWithoutR: llfRankWithoutR,
        ...four,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      notes:
        'L2. The classification is exact: covariance forces A (x) 1 by absolute irreducibility of SL(2, 3) on Z3^2 (G1 checks it over F3), and covariantCliffords enumerates every A by backtracking over columns, so the counts are complete. The unitary numbers are floating point (tolerance 1e-9); the commutant dimensions are (1/648) sum |chi|^(2k) over the enumerated 648 elements. Probe before the gates: the counts, the value 7 and the four-token counts were seen in tmp/frame-meet-probe.ts; the gates are the predictions written before it, the readings were added after.',
    })
  },
})
