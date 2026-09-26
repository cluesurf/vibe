// Is the fear beat outside the Clifford group, and which known non-Clifford gate is it?
//
// E-QTM-0117 found the link moves are the qutrit Clifford group. The fear beat acts where two roles meet, in
// two forms (code/rule/fear-weave):
// - the swap phase U = P_sym + omega P_anti, where like vibes meet (the tokens, already exchanged, feel
//   SWAP U = P_sym - omega P_anti)
// - the singlet phase V = 1 + (omega - 1) P_Phi, where a love meets a fear, Phi = sum_j |j j> / sqrt 3
// Both are two-qutrit gates, so the question is asked of the two-qutrit Clifford group (81 displacements).
//
// Measured:
// 1. Clifford or not: U, SWAP U and V against the 81 two-qutrit displacements. Controls that must pass:
//    SWAP (the swap phase at pi, the fear beat off), SUM, and a local Clifford pair
// 2. the Clifford-hierarchy level, numerically up to 3 (81 x 81 conjugations), and, for V, exactly: V is
//    carried by the Clifford C = (F^dagger x 1) SUM^-1 onto the diagonal gate omega^f(x, y) with f the
//    indicator of (0, 0), f = (1 - x^2)(1 - y^2) over F3. For a diagonal gate G_f, conjugating a
//    displacement gives the displacement times G_(f(x + a) - f(x)), and a Pauli factor does not change the
//    level, so the level of G_f is its degree when the degree is at least 1. The degree is found by
//    interpolation over all 3^9 polynomials with exponents at most 2
// 3. identification by Clifford invariants: the spectrum up to phase (U has eigenvalues 1 six times and
//    omega three times; the qutrit T gate of Howard and Vala, T x 1, has 1, e^(2 pi i/9), e^(-2 pi i/9)
//    three times each), and the Wigner function of the omega-eigenspace projector, which a Clifford only
//    permutes. P_Phi / 1 is a stabilizer state, nonnegative. P_anti / 3 has, in closed form,
//    W(u, v) = (1 - 3 delta_uv) / 54: nine fears of -1/27 on the diagonal, so no Clifford carries P_anti to
//    a diagonal projector and U is not Clifford-equivalent to any diagonal gate
// 4. universality: the Lie algebra of the closure of each gate set, by code/measure/qutrit-clifford
//    closureLieRank (a near-identity power of an infinite-order word, its logarithm, conjugates and
//    brackets). This is a second method beside E-QTM-0101's principal logarithm. Sets:
//    the model's: Sigma(648) on each role and U, with no two-role Clifford (no link supplies one)
//    with SUM added (E-FRC-0127's set), and the color law's: Sigma(648) on each role and V
//    controls: Sigma(648) on each role with SWAP, and with SUM and SWAP (the full Clifford group), both
//    finite, so every candidate word must have finite order and the rank must be 0
//    method check on one qutrit: Sigma(648) with the qutrit T gate gives su(3) (rank 8, Howard and Vala
//    2012), Sigma(648) alone gives 0
//
// Gates, fixed before the first run:
// - U, SWAP U and V are not Clifford; SWAP, SUM and the local pair are
// - V is carried onto diag(omega, 1, ..., 1) by C to 1e-12, and that gate's degree, so level, is 4, with the
//   numeric level of V above 3
// - U is not spectrally T x 1 (nor V); P_anti / 3 has W = (1 - 3 delta_uv) / 54 to 1e-12 with 9 negative
//   points; P_Phi has none
// - rank 80 for the model's set, the SUM set and the color set; rank 0 with every candidate word finite
//   for both controls; rank 8 for Sigma(648) with T and 0 without
//
// First run, 2026-09-25: every gate passed as fixed. Reported: the swap phase and its exchanged form are not
// within level 3 of the hierarchy either (whether they are at any finite level is not settled here); the
// model's set reached rank 80 from the first candidate word at power 252, the color set at power 684.
//
// Depth L1: known quantum-information facts checked on the model's two gates; the identification of V with
// a diagonal level-4 gate is exact, the rest floating point with stated tolerances.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { SU3_SUBGROUPS, QUTRIT_T, FOURIER } from '@/code/algebra/group/su3-subgroups'
import { exchangeOperator, singletPhase, swapPhase } from '@/code/rule/fear-weave'
import {
  adjointOperator,
  identityOperator,
  multiplyOperators,
  operator,
  phasePointOperators,
  tensorOperators,
  type Operator,
} from '@/code/measure/grid-weights'
import {
  cliffordAction,
  cliffordLevel,
  closureLieRank,
  conjugate,
  displacementOperators,
  eigenphases,
  innerProduct,
  operatorFrom3,
  sameSpectrumUpToPhase,
} from '@/code/measure/qutrit-clifford'

const OMEGA = (2 * Math.PI) / 3
const MAX_POWER = 20000
const CONJUGATION_DEPTH = 2

function sumGate(): Operator {
  const u = operator(9)

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      u.re[(3 * a + ((a + b) % 3)) * 9 + (3 * a + b)] = 1
    }
  }

  return u
}

// the Wigner function Tr(rho A(x)) / 9 of a two-qutrit operator
function wigner2(rho: Operator, points: readonly Operator[]): number[] {
  return points.map(a => innerProduct(a, rho)[0] / 9)
}

function projector(vectors: readonly (readonly number[])[]): Operator {
  const out = operator(9)

  for (const v of vectors) {
    const norm = Math.hypot(...v)

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        out.re[i * 9 + j] = (out.re[i * 9 + j] ?? 0) + ((v[i] ?? 0) * (v[j] ?? 0)) / (norm * norm)
      }
    }
  }

  return out
}

// the polynomial degree over F3 of f: Z3^2 -> Z3, the unique interpolant with exponents at most 2
function degreeOverF3(f: (x: number, y: number) => number): number {
  const monomials: [number, number][] = [0, 1, 2].flatMap(i => [0, 1, 2].map(j => [i, j] as [number, number]))

  for (let code = 0; code < 3 ** 9; code++) {
    const c = monomials.map((_, k) => Math.floor(code / 3 ** k) % 3)
    let match = true

    for (let x = 0; x < 3 && match; x++) {
      for (let y = 0; y < 3 && match; y++) {
        const value = monomials.reduce((s, [i, j], k) => s + (c[k] ?? 0) * x ** i * y ** j, 0)

        match = value % 3 === ((f(x, y) % 3) + 3) % 3
      }
    }

    if (match) {
      return monomials.reduce((d, [i, j], k) => ((c[k] ?? 0) !== 0 ? Math.max(d, i + j) : d), 0)
    }
  }

  return -1
}

// the level of the diagonal gate omega^f by finite differences: degree 0 or 1 is a Pauli (level 1),
// otherwise 1 + the largest level of the differences f(x + a) - f(x) over the nine shifts a
function diagonalLevel(f: (x: number, y: number) => number): number {
  const degree = degreeOverF3(f)

  if (degree <= 1) {
    return 1
  }

  let worst = 1

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      worst = Math.max(worst, diagonalLevel((x, y) => f((x + a) % 3, (y + b) % 3) - f(x, y)))
    }
  }

  return 1 + worst
}

export default experiment({
  id: 'quantum/fear-beat-is-magic',
  code: 'E-QTM-0118',
  title:
    'the fear beat is the magic gate: both its forms are outside the two-qutrit Clifford group; the singlet phase a love and a fear feel is Clifford-equivalent to diag(omega, 1, ..., 1), a controlled-controlled phase at level 4 of the Clifford hierarchy; the swap phase two like vibes feel is Clifford-equivalent to no diagonal gate, its omega-eigenspace carrying nine fears; and each, with Sigma(648) on each role, generates all of su(9)',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const d2 = displacementOperators(2)
    const points2 = phasePointOperators(2)
    const one = identityOperator(3)
    const u = swapPhase(OMEGA)
    const swap = exchangeOperator()
    const uToken = multiplyOperators(swap, u)
    const v = singletPhase(OMEGA)
    const sum = sumGate()
    const locals = SU3_SUBGROUPS.sigma648.generators.map(operatorFrom3)
    const localPair = tensorOperators(locals[2] ?? one, locals[3] ?? one)

    // 1. Clifford or not
    const isClifford = (g: Operator): boolean => cliffordAction(g, d2) !== undefined
    const fearClifford = [u, uToken, v].map(isClifford)
    const controlClifford = [swap, sum, localPair].map(isClifford)

    // 2. levels, and V's exact identification
    const levelU = cliffordLevel(u, d2, 3)
    const levelUToken = cliffordLevel(uToken, d2, 3)
    const levelV = cliffordLevel(v, d2, 3)
    const f = (x: number, y: number): number => (x === 0 && y === 0 ? 1 : 0)
    const fDegree = degreeOverF3(f)
    const fLevel = diagonalLevel(f)
    const fourierDagger = adjointOperator(operatorFrom3(FOURIER))
    const c = multiplyOperators(tensorOperators(fourierDagger, one), adjointOperator(sum))
    const moved = conjugate(c, v)
    const diagonal = operator(9)

    for (let i = 0; i < 9; i++) {
      diagonal.re[i * 9 + i] = i === 0 ? Math.cos(OMEGA) : 1
      diagonal.im[i * 9 + i] = i === 0 ? Math.sin(OMEGA) : 0
    }

    let vDistance = 0

    for (let i = 0; i < 81; i++) {
      vDistance = Math.max(vDistance, Math.hypot((moved.re[i] ?? 0) - (diagonal.re[i] ?? 0), (moved.im[i] ?? 0) - (diagonal.im[i] ?? 0)))
    }

    // the level-2 part of the degree argument checked numerically: a degree-2 diagonal gate is Clifford
    const quadratic = operator(9)

    for (let i = 0; i < 9; i++) {
      const x = Math.floor(i / 3)
      const y = i % 3
      const k = (x * y) % 3

      quadratic.re[i * 9 + i] = Math.cos((2 * Math.PI * k) / 3)
      quadratic.im[i * 9 + i] = Math.sin((2 * Math.PI * k) / 3)
    }

    const quadraticLevel = cliffordLevel(quadratic, d2, 3)

    // 3. spectra and the Wigner functions of the omega-eigenspace projectors
    const t1 = tensorOperators(operatorFrom3(QUTRIT_T), one)
    const spectrumU = eigenphases(u)
    const spectrumV = eigenphases(v)
    const spectrumT = eigenphases(t1)
    const uLikeT = sameSpectrumUpToPhase(spectrumU, spectrumT)
    const vLikeT = sameSpectrumUpToPhase(spectrumV, spectrumT)
    const antisymmetric: number[][] = []

    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        const vec = new Array<number>(9).fill(0)

        vec[3 * i + j] = 1
        vec[3 * j + i] = -1
        antisymmetric.push(vec)
      }
    }

    const pAnti = projector(antisymmetric)
    const phi = projector([[1, 0, 0, 0, 1, 0, 0, 0, 1]])
    const wAnti = wigner2({ n: 9, re: pAnti.re.map(x => x / 3), im: pAnti.im.map(x => x / 3) }, points2)
    const wPhi = wigner2(phi, points2)
    let closedFormError = 0

    wAnti.forEach((w, index) => {
      const same = Math.floor(index / 9) === index % 9

      closedFormError = Math.max(closedFormError, Math.abs(w - (same ? -1 / 27 : 1 / 54)))
    })

    const antiNegative = wAnti.filter(w => w < -1e-12).length
    const antiNorm = wAnti.reduce((s, w) => s + Math.abs(w), 0)
    const phiNegative = wPhi.filter(w => w < -1e-12).length

    // 4. universality
    const localTwo = [...locals.map(g => tensorOperators(g, one)), ...locals.map(g => tensorOperators(one, g))]
    const words = (e: number): number[][] => [
      [e, 2],
      [e, 2, 7],
      [e, 1, 6],
      [e, 2, 3, 7],
      [e, 0, 5, 2],
      [e, 1, 2, 5, 6],
      [e, 3, 6, 2],
      [e, 2, 6, 3, 7, 1],
    ]
    const rankOf = (extra: readonly Operator[], e: number) =>
      closureLieRank({ generators: [...localTwo, ...extra], words: words(e), maxPower: MAX_POWER, conjugationDepth: CONJUGATION_DEPTH })
    const model = rankOf([u], 8)
    const withSum = rankOf([u, sum], 8)
    const color = rankOf([v], 8)
    const exchangeControl = rankOf([swap], 8)
    const cliffordControl = rankOf([swap, sum], 8)
    const oneRoleWords = [
      [4, 2],
      [4, 2, 3],
      [4, 1, 2],
      [4, 0, 2, 3],
    ]
    const su3 = closureLieRank({ generators: [...locals, operatorFrom3(QUTRIT_T)], words: oneRoleWords, maxPower: MAX_POWER, conjugationDepth: 3 })
    const su3Control = closureLieRank({ generators: [...locals], words: oneRoleWords.map(w => w.slice(1)), maxPower: MAX_POWER, conjugationDepth: 3 })

    const ok =
      fearClifford.every(x => !x) &&
      controlClifford.every(x => x) &&
      vDistance < 1e-12 &&
      fDegree === 4 &&
      fLevel === 4 &&
      levelV > 3 &&
      quadraticLevel === 2 &&
      !uLikeT &&
      !vLikeT &&
      closedFormError < 1e-12 &&
      antiNegative === 9 &&
      phiNegative === 0 &&
      model.rank === 80 &&
      withSum.rank === 80 &&
      color.rank === 80 &&
      exchangeControl.rank === 0 &&
      exchangeControl.finiteWords === words(8).length &&
      cliffordControl.rank === 0 &&
      cliffordControl.finiteWords === words(8).length &&
      su3.rank === 8 &&
      su3Control.rank === 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the swap phase, its exchanged form and the singlet phase are not Clifford while SWAP, SUM and local Cliffords are; the singlet phase is carried by a Clifford onto diag(omega, 1, ..., 1) (degree 4 over F3, level 4), the swap phase matches the qutrit T gate in no spectrum and its omega-eigenspace has W = (1 - 3 delta) / 54, nine fears, so it is equivalent to no diagonal gate; with Sigma(648) on each role each form reaches all 80 dimensions of su(9), where SWAP and the full Clifford group stay finite, and the method gives su(3) from Sigma(648) and T',
      metrics: {
        swapPhaseClifford: fearClifford[0] ? 1 : 0,
        exchangedSwapPhaseClifford: fearClifford[1] ? 1 : 0,
        singletPhaseClifford: fearClifford[2] ? 1 : 0,
        swapPhaseLevelUpTo3: levelU,
        exchangedSwapPhaseLevelUpTo3: levelUToken,
        singletPhaseLevelUpTo3: levelV,
        singletPhaseToDiagonalDistance: vDistance,
        diagonalGateDegree: fDegree,
        diagonalGateLevel: fLevel,
        quadraticDiagonalLevel: quadraticLevel,
        swapPhaseSpectrumIsT: uLikeT ? 1 : 0,
        singletPhaseSpectrumIsT: vLikeT ? 1 : 0,
        swapPhaseOmegaMultiplicity: spectrumU.filter(x => Math.abs(x - 1 / 3) < 1e-7).length,
        singletPhaseOmegaMultiplicity: spectrumV.filter(x => Math.abs(x - 1 / 3) < 1e-7).length,
        antisymmetricWignerClosedFormError: closedFormError,
        antisymmetricNegativePoints: antiNegative,
        antisymmetricWignerNorm: antiNorm,
        singletProjectorNegativePoints: phiNegative,
        modelSetLieRank: model.rank,
        modelSetWord: model.word,
        modelSetPower: model.power,
        sumSetLieRank: withSum.rank,
        colorSetLieRank: color.rank,
        colorSetPower: color.power,
        su3WithTLieRank: su3.rank,
      },
      control: {
        swapClifford: controlClifford[0] ? 1 : 0,
        sumClifford: controlClifford[1] ? 1 : 0,
        localPairClifford: controlClifford[2] ? 1 : 0,
        exchangeSetLieRank: exchangeControl.rank,
        exchangeSetFiniteWords: exchangeControl.finiteWords,
        cliffordSetLieRank: cliffordControl.rank,
        cliffordSetFiniteWords: cliffordControl.finiteWords,
        candidateWords: words(8).length,
        sigma648AloneLieRank: su3Control.rank,
      },
      notes:
        'L1. Clifford tests are exact up to 1e-8 on 9 x 9 matrices; the hierarchy level is numeric up to 3 and, for the singlet phase, exact by the degree of its diagonal form. The swap phase P_sym + omega P_anti is SWAP^(2/3), exp(i (pi/3)(1 - SWAP)): a fractional power of a Clifford, not a diagonal magic gate. The Lie ranks rest on a near-identity power w^k of an infinite-order word, which lies in the identity component of the closure of <w>, so its logarithm is in the closure\'s algebra; a word is called finite when some power up to 20,000 is a scalar to 1e-7.',
    })
  },
})
