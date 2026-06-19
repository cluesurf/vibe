// Lattice fermions and the chirality wall (P4 / P8 Stage D). In 2D, spinors are
// 2-component and the gamma matrices are Pauli matrices. We build the naive,
// Wilson, and overlap Dirac operators in momentum space and measure doubling and
// the Ginsparg-Wilson relation. The overlap operator is the ideal resolution of
// Nielsen-Ninomiya: one species and exact lattice chiral symmetry.
// See note/questions/p4-chirality-spec.md.

import {
  Complex,
  cAdd,
  cMul,
  cScale,
  cConj,
  cAbs2,
} from '@/code/algebra/linear/complex'
import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

// Positive-energy branch of the 1D lattice Dirac Hamiltonian at momentum k and mass
// m: H(k) = [[m, sin k], [sin k, -m]], a real symmetric 2x2 whose eigenvalues are
// +/- sqrt(m^2 + sin^2 k). The gap at k = 0 is m (the rest energy) and the small-k
// dispersion is omega^2 = k^2 + m^2 (relativistic). Computed from the matrix
// eigenvalues rather than the closed form.
export function latticeDiracEnergy1d(input: {
  k: number
  m: number
}): number {
  const h = makeDense({ rows: 2, cols: 2 })
  h.data[0] = input.m
  h.data[1] = Math.sin(input.k)
  h.data[2] = Math.sin(input.k)
  h.data[3] = -input.m
  const eig = eigSymmetric({ matrix: h })
  return Math.max(eig.values[0] ?? 0, eig.values[1] ?? 0)
}

// A 2x2 complex matrix in row-major fields.
export interface Mat2 {
  readonly m00: Complex
  readonly m01: Complex
  readonly m10: Complex
  readonly m11: Complex
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

export const PAULI_X: Mat2 = {
  m00: ZERO,
  m01: ONE,
  m10: ONE,
  m11: ZERO,
}
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
export const IDENTITY2: Mat2 = {
  m00: ONE,
  m01: ZERO,
  m10: ZERO,
  m11: ONE,
}
// 2D gamma matrices: gamma1 = sigma_x, gamma2 = sigma_y, gamma5 = sigma_z.
export const GAMMA5: Mat2 = PAULI_Z

export function matAdd(a: Mat2, b: Mat2): Mat2 {
  return {
    m00: cAdd(a.m00, b.m00),
    m01: cAdd(a.m01, b.m01),
    m10: cAdd(a.m10, b.m10),
    m11: cAdd(a.m11, b.m11),
  }
}

export function matScaleReal(a: Mat2, s: number): Mat2 {
  return {
    m00: cScale(a.m00, s),
    m01: cScale(a.m01, s),
    m10: cScale(a.m10, s),
    m11: cScale(a.m11, s),
  }
}

export function matScaleComplex(a: Mat2, z: Complex): Mat2 {
  return {
    m00: cMul(a.m00, z),
    m01: cMul(a.m01, z),
    m10: cMul(a.m10, z),
    m11: cMul(a.m11, z),
  }
}

export function matMul(a: Mat2, b: Mat2): Mat2 {
  return {
    m00: cAdd(cMul(a.m00, b.m00), cMul(a.m01, b.m10)),
    m01: cAdd(cMul(a.m00, b.m01), cMul(a.m01, b.m11)),
    m10: cAdd(cMul(a.m10, b.m00), cMul(a.m11, b.m10)),
    m11: cAdd(cMul(a.m10, b.m01), cMul(a.m11, b.m11)),
  }
}

export function matDagger(a: Mat2): Mat2 {
  return {
    m00: cConj(a.m00),
    m01: cConj(a.m10),
    m10: cConj(a.m01),
    m11: cConj(a.m11),
  }
}

export function matFrobenius(a: Mat2): number {
  return Math.sqrt(
    cAbs2(a.m00) + cAbs2(a.m01) + cAbs2(a.m10) + cAbs2(a.m11),
  )
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
  const offDiag2 = cAbs2(h.m01)
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
  return matAdd(
    matScaleReal(IDENTITY2, alpha),
    matScaleReal(traceless, beta / s),
  )
}

// Smallest singular value of D: sqrt of the smallest eigenvalue of D^dagger D.
export function minSingularValue(d: Mat2): number {
  const m = matMul(matDagger(d), d)
  const a = m.m00.re
  const dd = m.m11.re
  const t = (a + dd) / 2
  const diff = (a - dd) / 2
  const s = Math.sqrt(diff * diff + cAbs2(m.m01))
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
  const dw = wilsonDirac2D({
    k1: input.k1,
    k2: input.k2,
    m: 0,
    r: input.r,
  })
  const shifted = matAdd(dw, matScaleReal(IDENTITY2, -input.m0))
  const hW = matMul(GAMMA5, shifted)
  const v = hermitianSign(hW)
  return matAdd(IDENTITY2, matMul(GAMMA5, v))
}

// The corners of the d-dimensional Brillouin zone, k_mu in {0, pi}: the 2^d points
// where a naive massless lattice fermion has a Dirac zero (a doubled species). Just
// the vertices of the unit hypercube scaled by pi.
export function brillouinZoneCorners(dimension: number): number[][] {
  let out: number[][] = [[]]
  for (let axis = 0; axis < dimension; axis++) {
    const next: number[][] = []
    for (const corner of out) {
      next.push([...corner, 0])
      next.push([...corner, Math.PI])
    }
    out = next
  }
  return out
}

// The naive-fermion doubler census in d dimensions. Each Brillouin-zone corner is a
// species; its chirality is the product of sign(cos k_mu) (+1 at 0, -1 at pi), and the
// Wilson term lifts every corner with one or more pi-components, so only the all-zero
// corner stays light. Returns the naive species count (2^d), the net chirality (zero by
// Nielsen-Ninomiya), and the count of corners the Wilson term leaves massless.
export function latticeFermionDoublers(dimension: number): {
  naiveSpecies: number
  netChirality: number
  wilsonSpecies: number
} {
  const corners = brillouinZoneCorners(dimension)
  let netChirality = 0
  let wilsonSpecies = 0
  for (const corner of corners) {
    let chirality = 1
    let piCount = 0
    for (const k of corner) {
      chirality *= Math.cos(k) >= 0 ? 1 : -1
      if (Math.abs(k - Math.PI) < 1e-9) piCount += 1
    }
    netChirality += chirality
    if (piCount === 0) wilsonSpecies += 1
  }
  return { naiveSpecies: corners.length, netChirality, wilsonSpecies }
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
