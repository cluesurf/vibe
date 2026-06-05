// Lattice fermions and the chirality wall (P4 / P8 Stage D). In 2D, spinors are
// 2-component and the gamma matrices are Pauli matrices. We build the naive,
// Wilson, and overlap Dirac operators in momentum space and measure doubling and
// the Ginsparg-Wilson relation. The overlap operator is the ideal resolution of
// Nielsen-Ninomiya: one species and exact lattice chiral symmetry.
// See note/questions/p4-chirality-spec.md.

import { Complex } from '~/linalg/complex'

// A 2x2 complex matrix in row-major fields.
export interface Mat2 {
  readonly m00: Complex
  readonly m01: Complex
  readonly m10: Complex
  readonly m11: Complex
}

function cadd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im }
}

function cmul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }
}

function cscale(a: Complex, s: number): Complex {
  return { re: a.re * s, im: a.im * s }
}

function cconj(a: Complex): Complex {
  return { re: a.re, im: -a.im }
}

function cabs2(a: Complex): number {
  return a.re * a.re + a.im * a.im
}

const ZERO: Complex = { re: 0, im: 0 }
const ONE: Complex = { re: 1, im: 0 }
const I_UNIT: Complex = { re: 0, im: 1 }

export function mat2(input: {
  m00: Complex
  m01: Complex
  m10: Complex
  m11: Complex
}): Mat2 {
  return input
}

export const PAULI_X: Mat2 = { m00: ZERO, m01: ONE, m10: ONE, m11: ZERO }
export const PAULI_Y: Mat2 = {
  m00: ZERO,
  m01: { re: 0, im: -1 },
  m10: I_UNIT,
  m11: ZERO,
}
export const PAULI_Z: Mat2 = {
  m00: ONE,
  m01: ZERO,
  m10: ZERO,
  m11: { re: -1, im: 0 },
}
export const IDENTITY2: Mat2 = { m00: ONE, m01: ZERO, m10: ZERO, m11: ONE }
// 2D gamma matrices: gamma1 = sigma_x, gamma2 = sigma_y, gamma5 = sigma_z.
export const GAMMA5: Mat2 = PAULI_Z

export function matAdd(a: Mat2, b: Mat2): Mat2 {
  return {
    m00: cadd(a.m00, b.m00),
    m01: cadd(a.m01, b.m01),
    m10: cadd(a.m10, b.m10),
    m11: cadd(a.m11, b.m11),
  }
}

export function matScaleReal(a: Mat2, s: number): Mat2 {
  return {
    m00: cscale(a.m00, s),
    m01: cscale(a.m01, s),
    m10: cscale(a.m10, s),
    m11: cscale(a.m11, s),
  }
}

export function matScaleComplex(a: Mat2, z: Complex): Mat2 {
  return {
    m00: cmul(a.m00, z),
    m01: cmul(a.m01, z),
    m10: cmul(a.m10, z),
    m11: cmul(a.m11, z),
  }
}

export function matMul(a: Mat2, b: Mat2): Mat2 {
  return {
    m00: cadd(cmul(a.m00, b.m00), cmul(a.m01, b.m10)),
    m01: cadd(cmul(a.m00, b.m01), cmul(a.m01, b.m11)),
    m10: cadd(cmul(a.m10, b.m00), cmul(a.m11, b.m10)),
    m11: cadd(cmul(a.m10, b.m01), cmul(a.m11, b.m11)),
  }
}

export function matDagger(a: Mat2): Mat2 {
  return {
    m00: cconj(a.m00),
    m01: cconj(a.m10),
    m10: cconj(a.m01),
    m11: cconj(a.m11),
  }
}

export function matFrobenius(a: Mat2): number {
  return Math.sqrt(cabs2(a.m00) + cabs2(a.m01) + cabs2(a.m10) + cabs2(a.m11))
}

// The matrix sign of a 2x2 Hermitian matrix, in closed form. Write H = t I + N
// with N traceless Hermitian and eigenvalues t +/- s. Then
// sign(H) = alpha I + (beta / s) (H - t I), with alpha and beta from the signs of
// t +/- s. sign(H)^2 = I exactly when s > 0, which is what makes the overlap
// operator satisfy Ginsparg-Wilson.
export function hermitianSign(h: Mat2): Mat2 {
  const a = h.m00.re
  const d = h.m11.re
  const t = (a + d) / 2
  const diff = (a - d) / 2
  const offDiag2 = cabs2(h.m01)
  const s = Math.sqrt(diff * diff + offDiag2)
  if (s < 1e-14) {
    const sgn = t > 0 ? 1 : t < 0 ? -1 : 0
    return matScaleReal(IDENTITY2, sgn)
  }
  const sPlus = Math.sign(t + s)
  const sMinus = Math.sign(t - s)
  const alpha = (sPlus + sMinus) / 2
  const beta = (sPlus - sMinus) / 2
  const traceless = matAdd(h, matScaleReal(IDENTITY2, -t))
  return matAdd(matScaleReal(IDENTITY2, alpha), matScaleReal(traceless, beta / s))
}

// Smallest singular value of D: sqrt of the smallest eigenvalue of D^dagger D.
export function minSingularValue(d: Mat2): number {
  const m = matMul(matDagger(d), d)
  const a = m.m00.re
  const dd = m.m11.re
  const t = (a + dd) / 2
  const diff = (a - dd) / 2
  const s = Math.sqrt(diff * diff + cabs2(m.m01))
  return Math.sqrt(Math.max(0, t - s))
}

// The Ginsparg-Wilson residual: || {D, gamma5} - D gamma5 D ||. Zero for the
// overlap operator (exact lattice chiral symmetry), nonzero otherwise.
export function ginspargWilsonResidual(d: Mat2): number {
  const anti = matAdd(matMul(d, GAMMA5), matMul(GAMMA5, d))
  const cubic = matMul(matMul(d, GAMMA5), d)
  return matFrobenius(matAdd(anti, matScaleReal(cubic, -1)))
}

// The naive lattice Dirac operator in 2D: i (sin k1 sigma_x + sin k2 sigma_y).
export function naiveDirac2D(input: { k1: number; k2: number }): Mat2 {
  const part = matAdd(
    matScaleReal(PAULI_X, Math.sin(input.k1)),
    matScaleReal(PAULI_Y, Math.sin(input.k2)),
  )
  return matScaleComplex(part, I_UNIT)
}

// The Wilson Dirac operator: naive plus (m + r (2 - cos k1 - cos k2)) I.
export function wilsonDirac2D(input: {
  k1: number
  k2: number
  m: number
  r: number
}): Mat2 {
  const mass =
    input.m + input.r * (2 - Math.cos(input.k1) - Math.cos(input.k2))
  return matAdd(
    naiveDirac2D({ k1: input.k1, k2: input.k2 }),
    matScaleReal(IDENTITY2, mass),
  )
}

// The Neuberger overlap operator: D = I + gamma5 sign(H_W), with the Wilson
// kernel H_W = gamma5 (D_W(m=0) - m0). For 0 < m0 < 2r this keeps the physical
// mode massless and lifts the doublers, and satisfies Ginsparg-Wilson exactly.
export function overlapDirac2D(input: {
  k1: number
  k2: number
  m0: number
  r: number
}): Mat2 {
  const dw = wilsonDirac2D({ k1: input.k1, k2: input.k2, m: 0, r: input.r })
  const shifted = matAdd(dw, matScaleReal(IDENTITY2, -input.m0))
  const hW = matMul(GAMMA5, shifted)
  const v = hermitianSign(hW)
  return matAdd(IDENTITY2, matMul(GAMMA5, v))
}

// Scan a Brillouin-zone grid (which includes k = 0 and k = pi when n is even) and
// return the species count (grid points where the smallest singular value is near
// zero) and the worst Ginsparg-Wilson residual.
export function scanBrillouin(input: {
  operator: (k: { k1: number; k2: number }) => Mat2
  gridSize: number
  zeroTolerance?: number
}): { species: number; gwResidualMax: number } {
  const n = input.gridSize
  const tol = input.zeroTolerance ?? 1e-6
  let species = 0
  let gwResidualMax = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const k1 = (2 * Math.PI * i) / n
      const k2 = (2 * Math.PI * j) / n
      const d = input.operator({ k1, k2 })
      if (minSingularValue(d) < tol) {
        species += 1
      }
      const residual = ginspargWilsonResidual(d)
      if (residual > gwResidualMax) {
        gwResidualMax = residual
      }
    }
  }
  return { species, gwResidualMax }
}
