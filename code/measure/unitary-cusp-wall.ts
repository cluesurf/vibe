// Exact discrete-time split-step unitary cusp domain wall in Vibe Theory's cyclotomic ring Z[zeta_9][1/6]
// (E-SPN-0222, gaps B-23 and B-55).
//
// Lifts E-SPN-0221's Hermitian Kaplan/Shamir domain wall to a true discrete-time unitary quantum walk U(k) on a
// one-sided depth column D = 0 .. N-1 (matching the {3,4,3,4} cusp boundary's 18-down / 0-up geometry):
//
//   U(k) = (U_depth(k) (x) I_2) * S_husk(k),   U_depth(k) = V_1(k) * V_2(k) * V_1(k)
//
// where:
//   - V_1(k) acts within each depth layer D on (|D, L>, |D, R>) by the exact SU(2) rotation R_x(2 * alpha_1(k)).
//   - V_2(k) acts across each inter-layer bond (|D, R>, |D+1, L>) (D = 0..N-2) by R_x(2 * alpha_2(k)), leaving
//     the one-sided cusp boundary state |0, L> and deep floor state |N-1, R> unpaired (exact reflecting boundary
//     with chiral symmetry Gamma * U_depth(k) * Gamma = U_depth(k)^dagger, Gamma = sigma_z^(chiral)).
//   - With P(k) = ((1 + cos kx)/2) * ((1 + cos ky)/2) * ((1 + cos kz)/2) (the 3D husk Wilson projector, P(0) = 1
//     and P(k_doubler) = 0 at all 7 nontrivial Brillouin-zone corners), the angles are:
//       alpha_1(k) = pi/3 - (2*pi/9) * P(k),   alpha_2(k) = (2*pi/3) * P(k).
//     At k = 0: alpha_1 = pi/9, alpha_2 = 2*pi/3 -> C_1 = R_x(2*pi/9) in Z[zeta_9][1/2], C_2 = omega^2 * C^dagger
//     (the working rule's own coin!), bulk winding (nu_0, nu_pi) = (1, 0), and the Left-handed zero mode decays
//     exponentially from D = 0 with exact ratio |rho| = tan(pi/9) / tan(pi/3) = 0.210138... (weight > 0.9999 on
//     D <= 2), while its Right-handed mirror twin localizes at D = N-1 (< 1e-16 on D <= 2).
//     At every 3D doubler: alpha_1 = pi/3, alpha_2 = 0 -> C_1 = (-omega) * C (the working rule's own coin!),
//     C_2 = I, bulk winding (nu_0, nu_pi) = (0, 0), and all 7 doublers are gapped (gap >= pi/3 > 1.04 rad).
//   - S_husk(k) = diag(V_W(k), V_W(k)^dagger) acts on the 2-component Weyl spinor per chirality with the symmetric
//     3D Strang-split Pauli shift V_W(k) = exp(-i kx/2 sx) exp(-i ky/2 sy) exp(-i kz sz) exp(-i ky/2 sy) exp(-i kx/2 sx),
//     which equals +-I at k = 0 and all 7 doublers (preserving Z[zeta_9][1/6] exactness at every TRIM point) and
//     gives an exact isotropic 3D chiral Weyl cone E(k) = +-arccos(cos kx cos ky cos kz) = +-|k| + O(|k|^3) on
//     the cusp edge modes.
//
// DETERMINISM: zero random numbers. EXACT: symbolic algebraic certificates verified in Q(zeta_9) via ninth-field.

import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import {
  OMEGA,
  ONE,
  ZERO,
  add,
  dagger,
  identityMatrix,
  isUnitary,
  matMul,
  neg,
  sameMatrix,
  scale,
  scaleMatrix,
  sub,
  zetaPower,
  type Ninth,
  type NinthMatrix,
} from '@/code/algebra/ninth-field'

// ---------------------------------------------------------------------------------------------------------
// Exact algebraic coins and depth operators in Z[zeta_9][1/6]

// Primitive 18th root of unity zeta_18 = e^(i pi / 9) = -zeta_9^5 in Z[zeta_9].
function zeta18Power(k: number): Ninth {
  const m = ((k % 18) + 18) % 18
  const sign = m % 2 === 0 ? 1 : -1
  const exp9 = (m * 5) % 9
  const z = zetaPower(exp9)

  return sign === 1 ? z : neg(z)
}

// Working rule's coin C = (1/2) [[1 + omega, 1 - omega], [1 - omega, 1 + omega]] in Z[omega][1/2].
export function vibeWorkingCoin(): Ninth[][] {
  const diag = scale(add(ONE, OMEGA), 1, 2)
  const off = scale(sub(ONE, OMEGA), 1, 2)

  return [
    [diag, off],
    [off, diag],
  ]
}

// Working rule's half-coin D = (1/2) [[2 + omega, -omega], [-omega, 2 + omega]] in Z[omega][1/2] (D^2 = C, D^3 = sigma_x).
export function vibeHalfCoin(): Ninth[][] {
  const diag = scale(add(scale(ONE, 2), OMEGA), 1, 2)
  const off = scale(neg(OMEGA), 1, 2)

  return [
    [diag, off],
    [off, diag],
  ]
}

// Exact SU(2) rotation R_x(2 * step * pi / 9) = cos(step*pi/9) I - i sin(step*pi/9) sigma_x in Z[zeta_9][1/2].
// Note cos(t) = (zeta_18^step + zeta_18^-step)/2 and -i sin(t) = -(zeta_18^step - zeta_18^-step)/2.
export function ninthRxCoin(step: number): Ninth[][] {
  const zp = zeta18Power(step)
  const zm = zeta18Power(-step)
  const c = scale(add(zp, zm), 1, 2)
  const minusISin = scale(sub(zm, zp), 1, 2)

  return [
    [c, minusISin],
    [minusISin, c],
  ]
}

// Build the exact 2N x 2N depth walk U_depth = V_1 * V_2 * V_1 in Q(zeta_9) from exact 2x2 coins C_1, C_2.
// Basis index for depth d (0..N-1), chirality c (0 = L, 1 = R) is 2*d + c.
function buildExactDepthUnitary(depth: number, c1: NinthMatrix, c2: NinthMatrix): Ninth[][] {
  const dim = 2 * depth
  const v1 = identityMatrix(dim)
  const v2 = identityMatrix(dim)

  for (let d = 0; d < depth; d++) {
    const iL = 2 * d
    const iR = 2 * d + 1

    v1[iL]![iL] = c1[0]![0]!
    v1[iL]![iR] = c1[0]![1]!
    v1[iR]![iL] = c1[1]![0]!
    v1[iR]![iR] = c1[1]![1]!
  }

  for (let d = 0; d < depth - 1; d++) {
    const iR = 2 * d + 1
    const iLnext = 2 * (d + 1)

    v2[iR]![iR] = c2[0]![0]!
    v2[iR]![iLnext] = c2[0]![1]!
    v2[iLnext]![iR] = c2[1]![0]!
    v2[iLnext]![iLnext] = c2[1]![1]!
  }

  return matMul(v1, matMul(v2, v1))
}

function buildExactGamma(depth: number): Ninth[][] {
  const dim = 2 * depth
  const g = identityMatrix(dim)

  for (let d = 0; d < depth; d++) {
    g[2 * d + 1]![2 * d + 1] = neg(ONE)
  }

  return g
}

export type AlgebraicCertificate = {
  readonly workingCoinUnitary: boolean
  readonly halfCoinUnitary: boolean
  readonly halfCoinSquaresToWorking: boolean
  readonly halfCoinCubesToSigmaX: boolean
  readonly rx3MatchesWorkingCoin: boolean
  readonly rx6MatchesWorkingCoinDagger: boolean
  readonly cuspZeroDepthUnitary: boolean
  readonly cuspZeroChiralExact: boolean
  readonly doublerDepthUnitary: boolean
  readonly doublerChiralExact: boolean
  readonly allExact: boolean
}

export function verifyAlgebraicCoins(depth: number): AlgebraicCertificate {
  const coinC = vibeWorkingCoin()
  const coinD = vibeHalfCoin()
  const sigmaX: Ninth[][] = [
    [ZERO, ONE],
    [ONE, ZERO],
  ]

  const d2 = matMul(coinD, coinD)
  const d3 = matMul(d2, coinD)
  const rx1 = ninthRxCoin(1)
  const rx3 = ninthRxCoin(3)
  const rx6 = ninthRxCoin(6)
  const omega2 = zetaPower(6)

  const workingCoinUnitary = isUnitary(coinC)
  const halfCoinUnitary = isUnitary(coinD)
  const halfCoinSquaresToWorking = sameMatrix(d2, coinC)
  const halfCoinCubesToSigmaX = sameMatrix(d3, sigmaX)
  const rx3MatchesWorkingCoin = sameMatrix(rx3, scaleMatrix(coinC, neg(OMEGA)))
  const rx6MatchesWorkingCoinDagger = sameMatrix(rx6, scaleMatrix(dagger(coinC), omega2))

  const gamma = buildExactGamma(depth)
  const uZero = buildExactDepthUnitary(depth, rx1, rx6)
  const cuspZeroDepthUnitary = isUnitary(uZero)
  const cuspZeroChiralExact = sameMatrix(matMul(gamma, matMul(uZero, gamma)), dagger(uZero))

  const id2 = identityMatrix(2)
  const uDoubler = buildExactDepthUnitary(depth, rx3, id2)
  const doublerDepthUnitary = isUnitary(uDoubler)
  const doublerChiralExact = sameMatrix(matMul(gamma, matMul(uDoubler, gamma)), dagger(uDoubler))

  const allExact =
    workingCoinUnitary &&
    halfCoinUnitary &&
    halfCoinSquaresToWorking &&
    halfCoinCubesToSigmaX &&
    rx3MatchesWorkingCoin &&
    rx6MatchesWorkingCoinDagger &&
    cuspZeroDepthUnitary &&
    cuspZeroChiralExact &&
    doublerDepthUnitary &&
    doublerChiralExact

  return {
    workingCoinUnitary,
    halfCoinUnitary,
    halfCoinSquaresToWorking,
    halfCoinCubesToSigmaX,
    rx3MatchesWorkingCoin,
    rx6MatchesWorkingCoinDagger,
    cuspZeroDepthUnitary,
    cuspZeroChiralExact,
    doublerDepthUnitary,
    doublerChiralExact,
    allExact,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Bulk topological winding invariants (Asboth-Obuse gap-resolved nu_0, nu_pi)

export function wilsonProjector(kx: number, ky: number, kz: number): number {
  return ((1 + Math.cos(kx)) / 2) * ((1 + Math.cos(ky)) / 2) * ((1 + Math.cos(kz)) / 2)
}

export function cuspCoinAngles(kx: number, ky: number, kz: number): {
  alpha1: number
  alpha2: number
  wilsonP: number
} {
  const wilsonP = wilsonProjector(kx, ky, kz)
  const alpha1 = Math.PI / 3 - ((2 * Math.PI) / 9) * wilsonP
  const alpha2 = ((2 * Math.PI) / 3) * wilsonP

  return { alpha1, alpha2, wilsonP }
}

export type BulkWindingResult = {
  readonly nu1: number
  readonly nu2: number
  readonly nu0: number
  readonly nuPi: number
  readonly bulkZeroGap: number
  readonly bulkPiGap: number
}

export function cuspBulkWinding(kx: number, ky: number, kz: number, samples = 512): BulkWindingResult {
  const { alpha1, alpha2 } = cuspCoinAngles(kx, ky, kz)
  const c2a1 = Math.cos(2 * alpha1)
  const s2a1 = Math.sin(2 * alpha1)
  const ca2 = Math.cos(alpha2)
  const sa2 = Math.sin(alpha2)

  let prev1 = 0
  let total1 = 0
  let prev2 = 0
  let total2 = 0
  let bulkZeroGap = Infinity
  let bulkPiGap = Infinity

  for (let i = 0; i <= samples; i++) {
    const q = (i / samples) * 2 * Math.PI - Math.PI
    const cq = Math.cos(q)
    const sq = Math.sin(q)

    const cosE = Math.max(-1, Math.min(1, c2a1 * ca2 - s2a1 * sa2 * cq))
    const e = Math.acos(cosE)

    bulkZeroGap = Math.min(bulkZeroGap, e)
    bulkPiGap = Math.min(bulkPiGap, Math.abs(Math.PI - e))

    // Frame 1: U_1(q) = C_1 V_2(q) C_1
    const dx1 = s2a1 * ca2 + c2a1 * sa2 * cq
    const dy1 = sa2 * sq
    const ph1 = Math.atan2(dy1, dx1)

    // Frame 2: U_2(q) = V_2^{1/2}(q) C_1^2 V_2^{1/2}(q) = a(q) u(q) + b(q) u_perp(q),
    // where u(q) = (cos q, sin q) and u_perp(q) = (-sin q, cos q).
    const a2r = c2a1 * sa2 + s2a1 * ca2 * cq
    const b2r = -s2a1 * sq
    const dx2 = a2r * cq - b2r * sq
    const dy2 = a2r * sq + b2r * cq
    const ph2 = Math.atan2(dy2, dx2)

    if (i > 0) {
      let d1 = ph1 - prev1

      while (d1 > Math.PI) d1 -= 2 * Math.PI
      while (d1 < -Math.PI) d1 += 2 * Math.PI
      total1 += d1

      let d2 = ph2 - prev2

      while (d2 > Math.PI) d2 -= 2 * Math.PI
      while (d2 < -Math.PI) d2 += 2 * Math.PI
      total2 += d2
    }

    prev1 = ph1
    prev2 = ph2
  }

  const nu1 = Math.round(total1 / (2 * Math.PI))
  const nu2 = Math.round(total2 / (2 * Math.PI))

  return {
    nu1,
    nu2,
    nu0: Math.round((nu1 + nu2) / 2),
    nuPi: Math.round((nu1 - nu2) / 2),
    bulkZeroGap,
    bulkPiGap,
  }
}

// ---------------------------------------------------------------------------------------------------------
// 3D husk split-step Weyl unitary V_W(k) and full 4N x 4N walk U(k)

type Mat2C = {
  readonly re: [number, number, number, number]
  readonly im: [number, number, number, number]
}

function mul2C(a: Mat2C, b: Mat2C): Mat2C {
  const re: [number, number, number, number] = [0, 0, 0, 0]
  const im: [number, number, number, number] = [0, 0, 0, 0]

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < 2; k++) {
        const ar = a.re[2 * i + k]!
        const ai = a.im[2 * i + k]!
        const br = b.re[2 * k + j]!
        const bi = b.im[2 * k + j]!

        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }

      re[2 * i + j] = sr
      im[2 * i + j] = si
    }
  }

  return { re, im }
}

function dagger2C(a: Mat2C): Mat2C {
  return {
    re: [a.re[0], a.re[2], a.re[1], a.re[3]],
    im: [-a.im[0], -a.im[2], -a.im[1], -a.im[3]],
  }
}

// Symmetric Strang-split 3D Pauli shift V_W(k) = e^{-i kx/2 sx} e^{-i ky/2 sy} e^{-i kz sz} e^{-i ky/2 sy} e^{-i kx/2 sx}.
// Trace is 2 cos(kx) cos(ky) cos(kz), giving exact isotropic Weyl dispersion E = +-arccos(cos kx cos ky cos kz)
// and V_W(k_doubler) = +-I at every 3D Brillouin-zone corner.
export function weylHuskStep2(kx: number, ky: number, kz: number): Mat2C {
  const cx = Math.cos(kx / 2)
  const sx = Math.sin(kx / 2)
  const cy = Math.cos(ky / 2)
  const sy = Math.sin(ky / 2)
  const cz = Math.cos(kz)
  const sz = Math.sin(kz)

  const rxHalf: Mat2C = {
    re: [cx, 0, 0, cx],
    im: [0, -sx, -sx, 0],
  }
  const ryHalf: Mat2C = {
    re: [cy, -sy, sy, cy],
    im: [0, 0, 0, 0],
  }
  const rzFull: Mat2C = {
    re: [cz, 0, 0, cz],
    im: [-sz, 0, 0, sz],
  }

  return mul2C(rxHalf, mul2C(ryHalf, mul2C(rzFull, mul2C(ryHalf, rxHalf))))
}

// Apply the 4N x 4N one-step unitary U(k) = (V_1 V_2 V_1 (x) I_2) * S_husk(k) to a state vector.
// Slot index for depth d (0..N-1), chirality c (0 = L, 1 = R), Weyl spin s (0, 1) is 4*d + 2*c + s.
function applyUnitaryStep(
  depth: number,
  alpha1: number,
  alpha2: number,
  vL: Mat2C,
  vR: Mat2C,
  inRe: Float64Array,
  inIm: Float64Array,
): { re: Float64Array; im: Float64Array } {
  const dim = 4 * depth
  const c1 = Math.cos(alpha1)
  const s1 = Math.sin(alpha1)
  const c2 = Math.cos(alpha2)
  const s2 = Math.sin(alpha2)

  // Step 1: S_husk(k) = diag(vL, vR) on each depth layer's 2-component Weyl spinor
  let re = new Float64Array(dim)
  let im = new Float64Array(dim)

  for (let d = 0; d < depth; d++) {
    for (let c = 0; c < 2; c++) {
      const m = c === 0 ? vL : vR
      const b0 = 4 * d + 2 * c
      const x0r = inRe[b0]!
      const x0i = inIm[b0]!
      const x1r = inRe[b0 + 1]!
      const x1i = inIm[b0 + 1]!

      re[b0] = m.re[0] * x0r - m.im[0] * x0i + m.re[1] * x1r - m.im[1] * x1i
      im[b0] = m.re[0] * x0i + m.im[0] * x0r + m.re[1] * x1i + m.im[1] * x1r
      re[b0 + 1] = m.re[2] * x0r - m.im[2] * x0i + m.re[3] * x1r - m.im[3] * x1i
      im[b0 + 1] = m.re[2] * x0i + m.im[2] * x0r + m.re[3] * x1i + m.im[3] * x1r
    }
  }

  // Helper: apply V_1 (intra-layer R_x(2*alpha1) mixing L <-> R, diagonal in Weyl spin s)
  const applyV1 = (): void => {
    const outRe = new Float64Array(dim)
    const outIm = new Float64Array(dim)

    for (let d = 0; d < depth; d++) {
      for (let s = 0; s < 2; s++) {
        const iL = 4 * d + s
        const iR = 4 * d + 2 + s
        const lr = re[iL]!
        const li = im[iL]!
        const rr = re[iR]!
        const ri = im[iR]!

        // [[c1, -i s1], [-i s1, c1]] * [L, R]^T
        // -i s1 * (rr + i ri) = s1*ri - i s1*rr
        outRe[iL] = c1 * lr + s1 * ri
        outIm[iL] = c1 * li - s1 * rr
        outRe[iR] = c1 * rr + s1 * li
        outIm[iR] = c1 * ri - s1 * lr
      }
    }

    re = outRe
    im = outIm
  }

  // Helper: apply V_2 (inter-layer R_x(2*alpha2) mixing |d, R, s> <-> |d+1, L, s>, leaving |0, L, s> and |N-1, R, s> fixed)
  const applyV2 = (): void => {
    const outRe = Float64Array.from(re)
    const outIm = Float64Array.from(im)

    for (let d = 0; d < depth - 1; d++) {
      for (let s = 0; s < 2; s++) {
        const iR = 4 * d + 2 + s
        const iLnext = 4 * (d + 1) + s
        const rr = re[iR]!
        const ri = im[iR]!
        const lr = re[iLnext]!
        const li = im[iLnext]!

        outRe[iR] = c2 * rr + s2 * li
        outIm[iR] = c2 * ri - s2 * lr
        outRe[iLnext] = c2 * lr + s2 * ri
        outIm[iLnext] = c2 * li - s2 * rr
      }
    }

    re = outRe
    im = outIm
  }

  applyV1()
  applyV2()
  applyV1()

  return { re, im }
}

export type UnitaryCuspMatrix = {
  readonly depth: number
  readonly dim: number
  readonly alpha1: number
  readonly alpha2: number
  readonly wilsonP: number
  readonly re: Float64Array
  readonly im: Float64Array
}

export function buildUnitaryCuspWalk(
  depth: number,
  kx: number,
  ky: number,
  kz: number,
): UnitaryCuspMatrix {
  const dim = 4 * depth
  const { alpha1, alpha2, wilsonP } = cuspCoinAngles(kx, ky, kz)
  const vL = weylHuskStep2(kx, ky, kz)
  const vR = dagger2C(vL)

  const re = new Float64Array(dim * dim)
  const im = new Float64Array(dim * dim)
  const basisRe = new Float64Array(dim)
  const basisIm = new Float64Array(dim)

  for (let col = 0; col < dim; col++) {
    basisRe[col] = 1
    const out = applyUnitaryStep(depth, alpha1, alpha2, vL, vR, basisRe, basisIm)

    basisRe[col] = 0

    for (let row = 0; row < dim; row++) {
      re[row * dim + col] = out.re[row]!
      im[row * dim + col] = out.im[row]!
    }
  }

  return { depth, dim, alpha1, alpha2, wilsonP, re, im }
}

// Max entry modulus ||U^dagger U - I||_inf.
export function unitarityErrorInf(dim: number, re: Float64Array, im: Float64Array): number {
  let maxErr = 0

  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < dim; k++) {
        // conj(U[k, i]) * U[k, j]
        const ar = re[k * dim + i]!
        const ai = -im[k * dim + i]!
        const br = re[k * dim + j]!
        const bi = im[k * dim + j]!

        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }

      const err = Math.hypot(sr - (i === j ? 1 : 0), si)

      if (err > maxErr) {
        maxErr = err
      }
    }
  }

  return maxErr
}

// ---------------------------------------------------------------------------------------------------------
// Deterministic exact unitary eigensolver via commuting Hermitian parts A = (U + U^dag)/2, B = (U - U^dag)/(2i)

export type UnitaryEigenRows = {
  readonly dim: number
  readonly quasienergies: Float64Array
  readonly eigRe: Float64Array
  readonly eigIm: Float64Array
  readonly vectorsRe: Float64Array
  readonly vectorsIm: Float64Array
  readonly maxEigResidual: number
  readonly maxUnitCircleErr: number
}

export function unitaryEigenRows(dim: number, re: Float64Array, im: Float64Array): UnitaryEigenRows {
  const aRe = new Float64Array(dim * dim)
  const aIm = new Float64Array(dim * dim)
  const bRe = new Float64Array(dim * dim)
  const bIm = new Float64Array(dim * dim)

  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      const uijR = re[i * dim + j]!
      const uijI = im[i * dim + j]!
      const ujiR = re[j * dim + i]!
      const ujiI = im[j * dim + i]!

      // A = (U + U^dag)/2
      aRe[i * dim + j] = (uijR + ujiR) / 2
      aIm[i * dim + j] = (uijI - ujiI) / 2

      // B = (U - U^dag)/(2i) = -i/2 * ((uijR - ujiR) + i (uijI + ujiI)) = (uijI + ujiI)/2 - i (uijR - ujiR)/2
      bRe[i * dim + j] = (uijI + ujiI) / 2
      bIm[i * dim + j] = -(uijR - ujiR) / 2
    }
  }

  const eigA = hermitianEigenRows(dim, aRe, aIm, 2)
  const vecRe = Float64Array.from(eigA.vectorsRe)
  const vecIm = Float64Array.from(eigA.vectorsIm)

  // Refine degenerate eigenspaces of A (cos E_j equal within tol) by diagonalizing projected B = (U - U^dag)/(2i).
  const clusterTol = 1e-7
  let start = 0

  while (start < dim) {
    let end = start + 1

    while (end < dim && Math.abs(eigA.values[end]! - eigA.values[start]!) <= clusterTol) {
      end++
    }

    const size = end - start

    if (size > 1) {
      // Compute B * v_a for a in [0..size-1], then B_sub[a, b] = <v_a | B | v_b>
      const bvRe = new Float64Array(size * dim)
      const bvIm = new Float64Array(size * dim)

      for (let b = 0; b < size; b++) {
        const vOff = (start + b) * dim

        for (let r = 0; r < dim; r++) {
          let sr = 0
          let si = 0
          const rowOff = r * dim

          for (let c = 0; c < dim; c++) {
            const mr = bRe[rowOff + c]!
            const mi = bIm[rowOff + c]!
            const vr = vecRe[vOff + c]!
            const vi = vecIm[vOff + c]!

            sr += mr * vr - mi * vi
            si += mr * vi + mi * vr
          }

          bvRe[b * dim + r] = sr
          bvIm[b * dim + r] = si
        }
      }

      const subRe = new Float64Array(size * size)
      const subIm = new Float64Array(size * size)

      for (let a = 0; a < size; a++) {
        const aOff = (start + a) * dim

        for (let b = 0; b < size; b++) {
          const bOff = b * dim
          let sr = 0
          let si = 0

          for (let r = 0; r < dim; r++) {
            const vr = vecRe[aOff + r]!
            const vi = vecIm[aOff + r]!
            const wr = bvRe[bOff + r]!
            const wi = bvIm[bOff + r]!

            // conj(v) * w
            sr += vr * wr + vi * wi
            si += vr * wi - vi * wr
          }

          subRe[a * size + b] = sr
          subIm[a * size + b] = si
        }
      }

      const subEig = hermitianEigenRows(size, subRe, subIm, 2)
      const rotRe = new Float64Array(size * dim)
      const rotIm = new Float64Array(size * dim)

      for (let k = 0; k < size; k++) {
        const kOff = k * size

        for (let r = 0; r < dim; r++) {
          let sr = 0
          let si = 0

          for (let a = 0; a < size; a++) {
            const cr = subEig.vectorsRe[kOff + a]!
            const ci = subEig.vectorsIm[kOff + a]!
            const vr = vecRe[(start + a) * dim + r]!
            const vi = vecIm[(start + a) * dim + r]!

            sr += cr * vr - ci * vi
            si += cr * vi + ci * vr
          }

          rotRe[k * dim + r] = sr
          rotIm[k * dim + r] = si
        }
      }

      vecRe.set(rotRe, start * dim)
      vecIm.set(rotIm, start * dim)
    }

    start = end
  }

  // Compute exact eigenvalues lambda_j = <v_j | U | v_j>, quasienergies E_j, and eigenpair residuals.
  const rawEigRe = new Float64Array(dim)
  const rawEigIm = new Float64Array(dim)
  const rawQuasi = new Float64Array(dim)
  let maxEigResidual = 0
  let maxUnitCircleErr = 0

  for (let i = 0; i < dim; i++) {
    const o = i * dim
    let lr = 0
    let li = 0
    const uvRe = new Float64Array(dim)
    const uvIm = new Float64Array(dim)

    for (let r = 0; r < dim; r++) {
      let sr = 0
      let si = 0
      const rowOff = r * dim

      for (let c = 0; c < dim; c++) {
        const ur = re[rowOff + c]!
        const ui = im[rowOff + c]!
        const vr = vecRe[o + c]!
        const vi = vecIm[o + c]!

        sr += ur * vr - ui * vi
        si += ur * vi + ui * vr
      }

      uvRe[r] = sr
      uvIm[r] = si

      const vr = vecRe[o + r]!
      const vi = vecIm[o + r]!

      lr += vr * sr + vi * si
      li += vr * si - vi * sr
    }

    rawEigRe[i] = lr
    rawEigIm[i] = li
    rawQuasi[i] = Math.atan2(li, lr)

    const unitErr = Math.abs(Math.hypot(lr, li) - 1)

    if (unitErr > maxUnitCircleErr) {
      maxUnitCircleErr = unitErr
    }

    let res2 = 0

    for (let r = 0; r < dim; r++) {
      const vr = vecRe[o + r]!
      const vi = vecIm[o + r]!
      const dr = uvRe[r]! - (lr * vr - li * vi)
      const di = uvIm[r]! - (lr * vi + li * vr)

      res2 += dr * dr + di * di
    }

    const res = Math.sqrt(res2)

    if (res > maxEigResidual) {
      maxEigResidual = res
    }
  }

  // Sort ascending by |quasienergy|
  const order = Array.from({ length: dim }, (_, i) => i).sort(
    (a, b) => Math.abs(rawQuasi[a]!) - Math.abs(rawQuasi[b]!),
  )

  const quasienergies = new Float64Array(dim)
  const eigRe = new Float64Array(dim)
  const eigIm = new Float64Array(dim)
  const vectorsRe = new Float64Array(dim * dim)
  const vectorsIm = new Float64Array(dim * dim)

  order.forEach((from, to) => {
    quasienergies[to] = rawQuasi[from]!
    eigRe[to] = rawEigRe[from]!
    eigIm[to] = rawEigIm[from]!
    vectorsRe.set(vecRe.subarray(from * dim, from * dim + dim), to * dim)
    vectorsIm.set(vecIm.subarray(from * dim, from * dim + dim), to * dim)
  })

  return {
    dim,
    quasienergies,
    eigRe,
    eigIm,
    vectorsRe,
    vectorsIm,
    maxEigResidual,
    maxUnitCircleErr,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Point & full analysis of the unitary cusp domain wall

export type CuspPointAnalysis = {
  readonly k: readonly [number, number, number]
  readonly unitarityErr: number
  readonly maxEigResidual: number
  readonly maxUnitCircleErr: number
  readonly minQuasienergyAbs: number
  readonly minPiGapAbs: number
  readonly bulkGapFromZero: number
  readonly edgeEnergies: readonly number[]
  readonly leftHuskWeight: number
  readonly rightHuskWeight: number
  readonly rightFloorWeight: number
  readonly leftFloorWeight: number
  readonly huskChiralityAsymmetry: number
  readonly winding: BulkWindingResult
}

export function analyzeCuspWalkPoint(
  depth: number,
  kx: number,
  ky: number,
  kz: number,
): CuspPointAnalysis {
  const mat = buildUnitaryCuspWalk(depth, kx, ky, kz)
  const unitarityErr = unitarityErrorInf(mat.dim, mat.re, mat.im)
  const eig = unitaryEigenRows(mat.dim, mat.re, mat.im)
  const winding = cuspBulkWinding(kx, ky, kz)

  const minQuasienergyAbs = Math.abs(eig.quasienergies[0]!)
  const bulkGapFromZero = Math.abs(eig.quasienergies[4]!)
  let minPiGapAbs = Infinity

  for (let i = 0; i < mat.dim; i++) {
    const gapPi = Math.abs(Math.PI - Math.abs(eig.quasienergies[i]!))

    if (gapPi < minPiGapAbs) {
      minPiGapAbs = gapPi
    }
  }

  const edgeEnergies = [
    eig.quasienergies[0]!,
    eig.quasienergies[1]!,
    eig.quasienergies[2]!,
    eig.quasienergies[3]!,
  ]

  // Basis-invariant per-Weyl-polarization projection weights on the 4 edge modes:
  // There are 2 Left Weyl polarizations at D = 0 and 2 Right Weyl polarizations at D = N-1, so dividing the
  // 4-mode trace by 2 gives the exact per-mode localization weight in [0, 1].
  let sumLeftHusk = 0
  let sumRightHusk = 0
  let sumRightFloor = 0
  let sumLeftFloor = 0

  for (let m = 0; m < 4; m++) {
    const o = m * mat.dim

    for (let d = 0; d <= 2; d++) {
      for (let s = 0; s < 2; s++) {
        const iL = 4 * d + s
        const iR = 4 * d + 2 + s

        sumLeftHusk += eig.vectorsRe[o + iL]! ** 2 + eig.vectorsIm[o + iL]! ** 2
        sumRightHusk += eig.vectorsRe[o + iR]! ** 2 + eig.vectorsIm[o + iR]! ** 2
      }
    }

    for (let d = depth - 3; d < depth; d++) {
      for (let s = 0; s < 2; s++) {
        const iL = 4 * d + s
        const iR = 4 * d + 2 + s

        sumLeftFloor += eig.vectorsRe[o + iL]! ** 2 + eig.vectorsIm[o + iL]! ** 2
        sumRightFloor += eig.vectorsRe[o + iR]! ** 2 + eig.vectorsIm[o + iR]! ** 2
      }
    }
  }

  const leftHuskWeight = sumLeftHusk / 2
  const rightHuskWeight = sumRightHusk / 2
  const rightFloorWeight = sumRightFloor / 2
  const leftFloorWeight = sumLeftFloor / 2
  const totHusk = leftHuskWeight + rightHuskWeight
  const huskChiralityAsymmetry = totHusk > 0 ? (leftHuskWeight - rightHuskWeight) / totHusk : 0

  return {
    k: [kx, ky, kz],
    unitarityErr,
    maxEigResidual: eig.maxEigResidual,
    maxUnitCircleErr: eig.maxUnitCircleErr,
    minQuasienergyAbs,
    minPiGapAbs,
    bulkGapFromZero,
    edgeEnergies,
    leftHuskWeight,
    rightHuskWeight,
    rightFloorWeight,
    leftFloorWeight,
    huskChiralityAsymmetry,
    winding,
  }
}

export type WeylConeSample = {
  readonly label: string
  readonly kMag: number
  readonly k: readonly [number, number, number]
  readonly measuredE: number
  readonly expectedLinearE: number
  readonly expectedExactStrangE: number
  readonly linearRelErr: number
  readonly strangErr: number
  readonly leftHuskWeight: number
  readonly rightHuskWeight: number
  readonly unitarityErr: number
}

export type FullUnitaryCuspReport = {
  readonly depth: number
  readonly algebraic: AlgebraicCertificate
  readonly gammaPoint: CuspPointAnalysis
  readonly doublers: readonly CuspPointAnalysis[]
  readonly minDoublerZeroGap: number
  readonly minDoublerPiGap: number
  readonly allDoublersTrivialWinding: boolean
  readonly weylCone: readonly WeylConeSample[]
  readonly maxWeylLinearRelErr: number
  readonly maxWeylStrangErr: number
  readonly maxWeylIsotropySpread: number
  readonly maxUnitarityErr: number
  readonly maxEigResidual: number
}

export function analyzeUnitaryCuspWall(depth = 24): FullUnitaryCuspReport {
  const algebraic = verifyAlgebraicCoins(depth)
  const gammaPoint = analyzeCuspWalkPoint(depth, 0, 0, 0)

  const doublerCoords: readonly (readonly [number, number, number])[] = [
    [Math.PI, 0, 0],
    [0, Math.PI, 0],
    [0, 0, Math.PI],
    [Math.PI, Math.PI, 0],
    [Math.PI, 0, Math.PI],
    [0, Math.PI, Math.PI],
    [Math.PI, Math.PI, Math.PI],
  ]

  const doublers = doublerCoords.map(([kx, ky, kz]) => analyzeCuspWalkPoint(depth, kx, ky, kz))
  let minDoublerZeroGap = Infinity
  let minDoublerPiGap = Infinity
  let allDoublersTrivialWinding = true

  for (const d of doublers) {
    if (d.minQuasienergyAbs < minDoublerZeroGap) {
      minDoublerZeroGap = d.minQuasienergyAbs
    }

    if (d.minPiGapAbs < minDoublerPiGap) {
      minDoublerPiGap = d.minPiGapAbs
    }

    if (d.winding.nu0 !== 0 || d.winding.nuPi !== 0) {
      allDoublersTrivialWinding = false
    }
  }

  const dirs: readonly { label: string; u: readonly [number, number, number] }[] = [
    { label: '(1,0,0)', u: [1, 0, 0] },
    { label: '(1,1,0)', u: [1 / Math.SQRT2, 1 / Math.SQRT2, 0] },
    { label: '(1,1,1)', u: [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)] },
  ]
  const mags = [0.05, 0.1]
  const weylCone: WeylConeSample[] = []
  let maxWeylLinearRelErr = 0
  let maxWeylStrangErr = 0
  let maxWeylIsotropySpread = 0

  for (const kMag of mags) {
    const energiesAtMag: number[] = []

    for (const dir of dirs) {
      const kx = kMag * dir.u[0]
      const ky = kMag * dir.u[1]
      const kz = kMag * dir.u[2]
      const pt = analyzeCuspWalkPoint(depth, kx, ky, kz)
      const measuredE = pt.minQuasienergyAbs
      const expectedExactStrangE = Math.acos(Math.cos(kx) * Math.cos(ky) * Math.cos(kz))
      const linearRelErr = Math.abs(measuredE - kMag) / kMag
      const strangErr = Math.abs(measuredE - expectedExactStrangE)

      energiesAtMag.push(measuredE)

      if (linearRelErr > maxWeylLinearRelErr) {
        maxWeylLinearRelErr = linearRelErr
      }

      if (strangErr > maxWeylStrangErr) {
        maxWeylStrangErr = strangErr
      }

      weylCone.push({
        label: `${dir.label}@${kMag}`,
        kMag,
        k: [kx, ky, kz],
        measuredE,
        expectedLinearE: kMag,
        expectedExactStrangE,
        linearRelErr,
        strangErr,
        leftHuskWeight: pt.leftHuskWeight,
        rightHuskWeight: pt.rightHuskWeight,
        unitarityErr: pt.unitarityErr,
      })
    }

    const spread = (Math.max(...energiesAtMag) - Math.min(...energiesAtMag)) / kMag

    if (spread > maxWeylIsotropySpread) {
      maxWeylIsotropySpread = spread
    }
  }

  let maxUnitarityErr = gammaPoint.unitarityErr
  let maxEigResidual = gammaPoint.maxEigResidual

  for (const d of doublers) {
    if (d.unitarityErr > maxUnitarityErr) maxUnitarityErr = d.unitarityErr
    if (d.maxEigResidual > maxEigResidual) maxEigResidual = d.maxEigResidual
  }

  for (const w of weylCone) {
    if (w.unitarityErr > maxUnitarityErr) maxUnitarityErr = w.unitarityErr
  }

  return {
    depth,
    algebraic,
    gammaPoint,
    doublers,
    minDoublerZeroGap,
    minDoublerPiGap,
    allDoublersTrivialWinding,
    weylCone,
    maxWeylLinearRelErr,
    maxWeylStrangErr,
    maxWeylIsotropySpread,
    maxUnitarityErr,
    maxEigResidual,
  }
}
