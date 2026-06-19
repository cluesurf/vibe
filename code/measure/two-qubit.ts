// Entanglement measures of a pure two-qubit state, given as length-4 real/imag amplitude arrays
// in the basis |00>, |01>, |10>, |11>. The concurrence (an entanglement monotone, 1 for a
// maximally entangled state, 0 for a product state) and the Horodecki maximal CHSH value (the
// largest Bell-CHSH a state can give, 2 sqrt 2 at the Tsirelson bound) the entanglement-Bell
// experiment reads off the dynamics-produced state.

import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { makeDense } from '@/code/algebra/linear/dense'

type Cx = { re: number; im: number }
const cx = (re: number, im = 0): Cx => ({ re, im })

// 2x2 Pauli matrices as complex, keyed by name.
const PAULI: Record<string, Cx[][]> = {
  I: [
    [cx(1), cx(0)],
    [cx(0), cx(1)],
  ],
  X: [
    [cx(0), cx(1)],
    [cx(1), cx(0)],
  ],
  Y: [
    [cx(0), cx(0, -1)],
    [cx(0, 1), cx(0)],
  ],
  Z: [
    [cx(1), cx(0)],
    [cx(0), cx(-1)],
  ],
}

// Kronecker product of two 2x2 complex matrices into a 4x4 complex matrix.
function kron(a: Cx[][], b: Cx[][]): Cx[][] {
  const out: Cx[][] = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => cx(0)),
  )
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      for (let k = 0; k < 2; k++) {
        for (let l = 0; l < 2; l++) {
          const x = a[i]![j]!
          const y = b[k]![l]!
          out[i * 2 + k]![j * 2 + l] = cx(
            x.re * y.re - x.im * y.im,
            x.re * y.im + x.im * y.re,
          )
        }
      }
    }
  }

  return out
}

// Expectation <psi| O |psi> of a 4x4 Hermitian operator O on the state (re, im), real part.
function expect(O: Cx[][], re: Float64Array, im: Float64Array): number {
  let accRe = 0
  for (let m = 0; m < 4; m++) {
    let oRe = 0
    let oIm = 0
    for (let n = 0; n < 4; n++) {
      oRe += O[m]![n]!.re * re[n]! - O[m]![n]!.im * im[n]!
      oIm += O[m]![n]!.re * im[n]! + O[m]![n]!.im * re[n]!
    }

    accRe += re[m]! * oRe + im[m]! * oIm
  }

  return accRe
}

// The 3x3 spin correlation matrix T_ij = <sigma_i (x) sigma_j> of the two-qubit state, with
// i, j over X, Y, Z.
export function twoQubitCorrelationMatrix(input: {
  re: Float64Array
  im: Float64Array
}): number[][] {
  const { re, im } = input
  const axes = ['X', 'Y', 'Z']
  const t: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      t[i]![j] = expect(
        kron(PAULI[axes[i]!]!, PAULI[axes[j]!]!),
        re,
        im,
      )
    }
  }

  return t
}

// The Horodecki maximal CHSH value from a spin correlation matrix T: form M = T^T T and take
// 2 sqrt(s1 + s2) where s1, s2 are its two largest eigenvalues. This is the largest CHSH the
// state can yield (above 2 = Bell violation, 2 sqrt 2 = Tsirelson).
export function horodeckiMaxChsh(
  t: ReadonlyArray<ReadonlyArray<number>>,
): number {
  const m = makeDense({ rows: 3, cols: 3 })
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let s = 0
      for (let k = 0; k < 3; k++) {
        s += (t[k]![i] ?? 0) * (t[k]![j] ?? 0)
      }

      m.data[i * 3 + j] = s
    }
  }

  const eig = eigSymmetric({ matrix: m }) // ascending
  const s1 = eig.values[2] ?? 0
  const s2 = eig.values[1] ?? 0

  return 2 * Math.sqrt(Math.max(0, s1 + s2))
}

// The concurrence of a pure two-qubit state, C = 2 |a00 a11 - a01 a10| (complex amplitudes).
// An entanglement monotone: 1 for a maximally entangled (Bell) state, 0 for a product state.
export function twoQubitConcurrence(input: {
  re: Float64Array
  im: Float64Array
}): number {
  const { re, im } = input
  const a00 = cx(re[0]!, im[0]!)
  const a11 = cx(re[3]!, im[3]!)
  const a01 = cx(re[1]!, im[1]!)
  const a10 = cx(re[2]!, im[2]!)
  const p1 = {
    re: a00.re * a11.re - a00.im * a11.im,
    im: a00.re * a11.im + a00.im * a11.re,
  }
  const p2 = {
    re: a01.re * a10.re - a01.im * a10.im,
    im: a01.re * a10.im + a01.im * a10.re,
  }
  const dRe = p1.re - p2.re
  const dIm = p1.im - p2.im

  return 2 * Math.sqrt(dRe * dRe + dIm * dIm)
}
