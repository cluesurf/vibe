// One generation of Standard-Model fermions from the complexified octonions (the Furey / Dixon / Gunaydin-Gursey
// construction). The octonion left-multiplications form a Clifford algebra, and its minimal spinor (a fermionic Fock
// space of three modes) holds exactly one generation of quarks and leptons with their correct color and electric
// charges. This builds it.
//
//   - The octonion imaginary units, acting by left multiplication, are seven 8-by-8 real matrices that square to minus
//     the identity and anticommute, the generators of the Clifford algebra Cl(0,7).
//   - Taking six of them in pairs and complexifying gives three fermionic ladder operators a_1, a_2, a_3 satisfying
//     {a_i, a_j-dagger} = delta_ij and {a_i, a_j} = 0, the canonical anticommutation relations of three fermion modes.
//   - The Fock space of three fermion modes has eight states, occupied by zero, one, two, or three modes, with
//     multiplicities one, three, three, one (the color singlet, triplet, anti-triplet, singlet).
//   - The electric charge is one third of the number operator, Q = (1/3)(N_1 + N_2 + N_3), so the eight states have
//     charges zero, one third (three times), two thirds (three times), and one, exactly the magnitudes of the
//     neutrino, the down-type quarks (three colors), the up-type quarks (three colors), and the electron. The
//     conjugate ideal gives the antiparticles, sixteen states, one full generation.

import { cayleyMultiply } from '@/code/measure/division-algebra'

type ComplexMatrix = { re: number[][]; im: number[][] }

const zero8 = (): number[][] =>
  Array.from({ length: 8 }, () => new Array<number>(8).fill(0))

// the left-multiplication matrix of the octonion imaginary unit e_a, x -> e_a * x
function leftMultiplication(a: number): number[][] {
  const m = zero8()
  for (let j = 0; j < 8; j++) {
    const basis = new Array<number>(8).fill(0)
    basis[j] = 1
    const unit = new Array<number>(8).fill(0)
    unit[a] = 1
    const product = cayleyMultiply(unit, basis)
    for (let i = 0; i < 8; i++) m[i]![j] = product[i]!
  }
  return m
}

const complex = (re: number[][], im: number[][]): ComplexMatrix => ({
  re,
  im,
})

function multiply(a: ComplexMatrix, b: ComplexMatrix): ComplexMatrix {
  const re = zero8()
  const im = zero8()
  for (let i = 0; i < 8; i++)
    for (let k = 0; k < 8; k++) {
      const ar = a.re[i]![k]!
      const ai = a.im[i]![k]!
      if (ar === 0 && ai === 0) continue
      const reRow = re[i]!
      const imRow = im[i]!
      const bRe = b.re[k]!
      const bIm = b.im[k]!
      for (let j = 0; j < 8; j++) {
        reRow[j] = (reRow[j] ?? 0) + ar * bRe[j]! - ai * bIm[j]!
        imRow[j] = (imRow[j] ?? 0) + ar * bIm[j]! + ai * bRe[j]!
      }
    }
  return complex(re, im)
}

function addMatrices(...matrices: ComplexMatrix[]): ComplexMatrix {
  const re = zero8()
  const im = zero8()
  for (const m of matrices)
    for (let i = 0; i < 8; i++) {
      const reRow = re[i]!
      const imRow = im[i]!
      for (let j = 0; j < 8; j++) {
        reRow[j] = (reRow[j] ?? 0) + m.re[i]![j]!
        imRow[j] = (imRow[j] ?? 0) + m.im[i]![j]!
      }
    }
  return complex(re, im)
}

function scaleMatrix(a: ComplexMatrix, s: number): ComplexMatrix {
  return complex(
    a.re.map(r => r.map(v => v * s)),
    a.im.map(r => r.map(v => v * s)),
  )
}

function dagger(a: ComplexMatrix): ComplexMatrix {
  const re = zero8()
  const im = zero8()
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) {
      re[i]![j] = a.re[j]![i]!
      im[i]![j] = -a.im[j]![i]!
    }
  return complex(re, im)
}

const identity8: ComplexMatrix = complex(
  zero8().map((row, i) => row.map((_, j) => (i === j ? 1 : 0))),
  zero8(),
)

function isZeroMatrix(a: ComplexMatrix): boolean {
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++)
      if (
        Math.abs(a.re[i]![j]!) > 1e-9 ||
        Math.abs(a.im[i]![j]!) > 1e-9
      )
        return false
  return true
}

function isIdentityMatrix(a: ComplexMatrix): boolean {
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) {
      const want = i === j ? 1 : 0
      if (
        Math.abs(a.re[i]![j]! - want) > 1e-9 ||
        Math.abs(a.im[i]![j]!) > 1e-9
      )
        return false
    }
  return true
}

const anticommutator = (
  a: ComplexMatrix,
  b: ComplexMatrix,
): ComplexMatrix => addMatrices(multiply(a, b), multiply(b, a))

const trace = (a: ComplexMatrix): number => {
  let t = 0
  for (let i = 0; i < 8; i++) t += a.re[i]![i]!
  return t
}

// build one generation from the octonions, return the structural facts
export function octonionFermionGeneration(): {
  leftMultsAreClifford: boolean
  ladderRelationsHold: boolean
  numberOperatorTrace: number
  spectrumQuantized: boolean
  multiplicities: number[]
  electricCharges: number[]
} {
  const left = [
    null,
    ...[1, 2, 3, 4, 5, 6, 7].map(leftMultiplication),
  ] as (number[][] | null)[]

  // the left-multiplications form Cl(0,7), each squares to -I and they anticommute
  let leftMultsAreClifford = true
  for (let a = 1; a <= 7; a++) {
    const real = complex(left[a]!, zero8())
    const square = multiply(real, real)
    if (!isZeroMatrix(addMatrices(square, identity8)))
      leftMultsAreClifford = false // L^2 = -I
  }
  for (let a = 1; a <= 7 && leftMultsAreClifford; a++)
    for (let b = a + 1; b <= 7; b++) {
      const anti = anticommutator(
        complex(left[a]!, zero8()),
        complex(left[b]!, zero8()),
      )
      if (!isZeroMatrix(anti)) leftMultsAreClifford = false
    }

  // three fermionic ladder operators, a_k = (1/2)(L_{2k-1} + i L_{2k})
  const ladder = [1, 2, 3].map(k =>
    scaleMatrix(complex(left[2 * k - 1]!, left[2 * k]!), 0.5),
  )

  // the canonical anticommutation relations
  let ladderRelationsHold = true
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      const withDagger = anticommutator(ladder[i]!, dagger(ladder[j]!))
      if (i === j) {
        if (!isIdentityMatrix(withDagger)) ladderRelationsHold = false
      } else if (!isZeroMatrix(withDagger)) ladderRelationsHold = false
      if (!isZeroMatrix(anticommutator(ladder[i]!, ladder[j]!)))
        ladderRelationsHold = false
    }

  // the number operator N = sum a_k-dagger a_k, the charge Q = N/3
  const number = addMatrices(...ladder.map(a => multiply(dagger(a), a)))
  const numberOperatorTrace = Math.round(trace(number) * 1000) / 1000

  // the spectrum is in {0,1,2,3}, checked by the minimal polynomial N(N-1)(N-2)(N-3) = 0
  const shift = (s: number): ComplexMatrix =>
    addMatrices(number, scaleMatrix(identity8, -s))
  const minimalPolynomial = multiply(
    multiply(multiply(number, shift(1)), shift(2)),
    shift(3),
  )
  const spectrumQuantized = isZeroMatrix(minimalPolynomial)

  // the multiplicity of eigenvalue k is the trace of the projector P_k = product over m != k of (N - m)/(k - m)
  const multiplicities: number[] = []
  for (let k = 0; k <= 3; k++) {
    let projector = identity8
    for (let m = 0; m <= 3; m++)
      if (m !== k)
        projector = multiply(
          projector,
          scaleMatrix(shift(m), 1 / (k - m)),
        )
    multiplicities.push(Math.round(trace(projector)))
  }
  // the electric charges, Q = k/3 for the occupied-mode count k
  const electricCharges = [0, 1, 2, 3].map(k => k / 3)

  return {
    leftMultsAreClifford,
    ladderRelationsHold,
    numberOperatorTrace,
    spectrumQuantized,
    multiplicities,
    electricCharges,
  }
}
