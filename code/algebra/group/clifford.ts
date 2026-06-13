// Clifford algebra: the Pauli matrices, the 3+1D Dirac gamma matrices, and the spin
// generators. This is the spinor machinery, the gamma matrices satisfy the Clifford relation
// {gamma_mu, gamma_nu} = 2 eta_mu_nu, and the spin generators are the su(2) algebra the
// {3,4,3,4} coin already carries through its quaternions (the binary tetrahedral group 2T).
// Complex 2x2 and 4x4 matrices over the shared complex type.

import { type Complex, complex, cAdd, cMul, cScale } from '@/code/algebra/linear/complex'

export type ComplexMatrix = Complex[][]

const c = (re: number, im: number): Complex => complex({ re, im })
const ZERO = c(0, 0)

export function cmZero(rows: number, columns: number): ComplexMatrix {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => ZERO))
}

export function cmIdentity(size: number): ComplexMatrix {
  const matrix = cmZero(size, size)
  for (let index = 0; index < size; index++) matrix[index]![index] = c(1, 0)
  return matrix
}

export function cmMultiply(left: ComplexMatrix, right: ComplexMatrix): ComplexMatrix {
  const rows = left.length
  const inner = right.length
  const columns = right[0]!.length
  const out = cmZero(rows, columns)
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      let sum = ZERO
      for (let index = 0; index < inner; index++) sum = cAdd(sum, cMul(left[row]![index]!, right[index]![column]!))
      out[row]![column] = sum
    }
  }
  return out
}

export function cmAdd(left: ComplexMatrix, right: ComplexMatrix): ComplexMatrix {
  return left.map((row, rowIndex) => row.map((value, columnIndex) => cAdd(value, right[rowIndex]![columnIndex]!)))
}

export function cmScale(matrix: ComplexMatrix, scalar: number): ComplexMatrix {
  return matrix.map((row) => row.map((value) => cScale(value, scalar)))
}

export function cmCommutator(left: ComplexMatrix, right: ComplexMatrix): ComplexMatrix {
  return cmAdd(cmMultiply(left, right), cmScale(cmMultiply(right, left), -1))
}

export function cmAntiCommutator(left: ComplexMatrix, right: ComplexMatrix): ComplexMatrix {
  return cmAdd(cmMultiply(left, right), cmMultiply(right, left))
}

export function cmIsScalar(matrix: ComplexMatrix, scalar: Complex, tolerance = 1e-9): boolean {
  return matrix.every((row, rowIndex) =>
    row.every((value, columnIndex) => {
      const target = rowIndex === columnIndex ? scalar : ZERO
      return Math.abs(value.re - target.re) < tolerance && Math.abs(value.im - target.im) < tolerance
    }),
  )
}

// The Pauli matrices [sigma0 = I, sigma1, sigma2, sigma3], the su(2) generators (also the
// quaternion units up to a factor of i, the algebra the 24-direction coin carries).
export function pauli(): ComplexMatrix[] {
  return [
    [[c(1, 0), ZERO], [ZERO, c(1, 0)]],
    [[ZERO, c(1, 0)], [c(1, 0), ZERO]],
    [[ZERO, c(0, -1)], [c(0, 1), ZERO]],
    [[c(1, 0), ZERO], [ZERO, c(-1, 0)]],
  ]
}

// assemble a 4x4 from four 2x2 blocks [[a, b], [c, d]]
const block = (a: ComplexMatrix, b: ComplexMatrix, cc: ComplexMatrix, d: ComplexMatrix): ComplexMatrix => [
  [a[0]![0]!, a[0]![1]!, b[0]![0]!, b[0]![1]!],
  [a[1]![0]!, a[1]![1]!, b[1]![0]!, b[1]![1]!],
  [cc[0]![0]!, cc[0]![1]!, d[0]![0]!, d[0]![1]!],
  [cc[1]![0]!, cc[1]![1]!, d[1]![0]!, d[1]![1]!],
]

// The 3+1D Dirac gamma matrices in the Dirac basis. They satisfy {gamma_mu, gamma_nu} = 2 eta_mu_nu
// with eta = diag(1, -1, -1, -1).
export function diracGamma(): ComplexMatrix[] {
  const [identity, sigma1, sigma2, sigma3] = pauli()
  const zero2 = cmZero(2, 2)
  const minus = (matrix: ComplexMatrix): ComplexMatrix => cmScale(matrix, -1)
  return [
    block(identity!, zero2, zero2, minus(identity!)), // gamma0
    block(zero2, sigma1!, minus(sigma1!), zero2), // gamma1
    block(zero2, sigma2!, minus(sigma2!), zero2), // gamma2
    block(zero2, sigma3!, minus(sigma3!), zero2), // gamma3
  ]
}

// The Minkowski metric diag(1, -1, -1, -1).
export const minkowski = [1, -1, -1, -1]

// The Dirac Hamiltonian H(p) = alpha . p + beta m, in the Dirac basis H = [[m, sigma.p], [sigma.p, -m]].
// It squares to (m^2 + |p|^2) times the identity, so its eigenvalues are plus or minus the relativistic energy.
export function diracHamiltonian(input: { px: number; py: number; pz: number; mass: number }): ComplexMatrix {
  const [identity, sigma1, sigma2, sigma3] = pauli()
  const sigmaDotP = cmAdd(
    cmAdd(cmScale(sigma1!, input.px), cmScale(sigma2!, input.py)),
    cmScale(sigma3!, input.pz),
  )
  const massBlock = cmScale(identity!, input.mass)
  return block(massBlock, sigmaDotP, sigmaDotP, cmScale(massBlock, -1))
}

// The spin generator about the z axis, S_3 = (i/4)[gamma1, gamma2] = (1/2) diag(sigma3, sigma3),
// eigenvalues plus or minus one half. Twice it, diag(sigma3, sigma3), squares to the identity, so
// a 2pi rotation exp(i 2pi S_3) equals minus the identity, the spinor double-cover sign.
export function spinGeneratorZ(): ComplexMatrix {
  const sigma3 = pauli()[3]!
  const zero2 = cmZero(2, 2)
  const half = cmScale(sigma3, 0.5)
  return block(half, zero2, zero2, half) // (1/2) diag(sigma3, sigma3)
}

// A Clifford rotor for a rotation by `angle` in the plane of the unit bivector B
// (B^2 = -1): rotor = cos(angle/2) I + sin(angle/2) B = exp((angle/2) B). Acting by
// left multiplication it rotates a spinor (period 4pi, so angle = 2pi gives -I),
// and by conjugation R v R^{-1} it rotates a vector (period 2pi). `size` is the
// matrix dimension (4 for the Dirac gammas).
export function cliffordRotor(input: { angle: number; bivector: ComplexMatrix; size: number }): ComplexMatrix {
  const { angle, bivector, size } = input
  return cmAdd(cmScale(cmIdentity(size), Math.cos(angle / 2)), cmScale(bivector, Math.sin(angle / 2)))
}

// The Coxeter edge rotor n_i n_j for a relation of order m, built from two unit spacelike
// Coxeter normals at angle pi(m-1)/m in the gamma1-gamma2 plane. Its m-th power is a 2pi
// rotation (minus one on a spinor), its 2m-th power a 4pi rotation (plus one), realizing the
// spinor double cover on a {p,q,r} honeycomb edge loop where m cells meet.
export function coxeterEdgeRotor(m: number): ComplexMatrix {
  const gamma = diracGamma()
  const angle = (Math.PI * (m - 1)) / m
  const normalI = gamma[1]!
  const normalJ = cmAdd(cmScale(gamma[1]!, Math.cos(angle)), cmScale(gamma[2]!, Math.sin(angle)))
  return cmMultiply(normalI, normalJ)
}

// Real part of the normalised trace (1/size) Re tr(M), the scalar component of a
// Clifford-algebra element (the cos(angle/2) part of a rotor).
export function cmScalarTrace(matrix: ComplexMatrix): number {
  let s = 0
  for (let i = 0; i < matrix.length; i++) s += matrix[i]![i]!.re
  return s / matrix.length
}

// A complex matrix raised to a non-negative integer power by repeated multiply.
export function cmPower(matrix: ComplexMatrix, exponent: number): ComplexMatrix {
  let result = cmIdentity(matrix.length)
  for (let step = 0; step < exponent; step++) result = cmMultiply(result, matrix)
  return result
}

// The Frobenius norm of a complex matrix, sqrt(sum |entry|^2). Zero only for the zero matrix,
// so it is a scalar witness that a commutator (a non-abelian self-interaction) is nonvanishing.
export function cmFrobeniusNorm(matrix: ComplexMatrix): number {
  let sum = 0
  for (const row of matrix) for (const value of row) sum += value.re * value.re + value.im * value.im
  return Math.sqrt(sum)
}

// Entrywise equality of two complex matrices within a tolerance.
export function cmEquals(left: ComplexMatrix, right: ComplexMatrix, tolerance = 1e-9): boolean {
  return left.every((row, rowIndex) =>
    row.every((value, columnIndex) => {
      const target = right[rowIndex]![columnIndex]!
      return Math.abs(value.re - target.re) < tolerance && Math.abs(value.im - target.im) < tolerance
    }),
  )
}
