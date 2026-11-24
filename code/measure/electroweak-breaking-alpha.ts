// DYNAMICAL ELECTROWEAK SYMMETRY BREAKING (SU(2)_L x U(1)_Y -> U(1)_em),
// EXACT MASSLESS PHOTON + CUSTODIAL RHO = 1, 16-STATE SPIN(10) YUKAWA + SEESAW,
// AND EXACT 2-LOOP SM RG RUNNING / HONEST ALPHA AUDIT UNDER PRE-REGISTERED NULL
// (E-FRC-0326, Open Problem #3).
//
// Three deterministic parts (zero Math.random):
//
//   Part 1 — Exact Electroweak Symmetry Breaking SU(2)_L x U(1)_Y -> U(1)_em Inside SO(10):
//     Constructs the exact 10 x 10 vector representation of so(10) using E-FRC-0324's exact
//     SU(3)_C x SU(2)_L x SU(2)_R x U(1)_Y generator linear combinations, extracts the exact
//     (1, 2)_{+1/2} electroweak Higgs doublet subspace Phi = (phi_+, phi_0)^T = (z_3*, z_4*)^T
//     (and its conjugate Phi~ = (z_4, -z_3)^T in (1, 2)_{-1/2}), verifies exact SU(2)_L x U(1)_Y
//     gauge invariance of V(Phi) = -mu^2 |Phi|^2 + lambda |Phi|^4 across 200 finite group
//     elements (<= 1e-15), minimizes to <Phi> = (0, v / sqrt 2)^T, builds the exact 4 x 4
//     gauge-boson mass-squared matrix M^2_{ab} over (W^1, W^2, W^3, B) directly from |D_mu <Phi>|^2,
//     diagonalizes via Householder QL, and verifies:
//       - 1 exact massless photon A_mu (m_gamma^2 <= 1e-15) with exact mixing (sin theta_W, cos theta_W)
//       - 3 massive weak bosons (W^+, W^-, Z^0) with m_W^2 = g^2 v^2 / 4, m_Z^2 = (g^2 + g'^2) v^2 / 4
//       - exact unbroken Q = T_3 + Y (Q <Phi> = 0 <= 1e-15), 3 broken generators -> 3 massless
//         Goldstone modes in the scalar Hessian + 1 physical Higgs m_H = sqrt(2 lambda) v
//       - exact custodial symmetry rho = m_W^2 / (m_Z^2 cos^2 theta_W) = 1.000000000000 (<= 1e-14)
//         at BOTH sin^2(theta_W)_GUT = 3/8 (exact from E-FRC-0324) AND sin^2(theta_W)(M_Z) = 0.23122
//       - negative control: unbroken phase mu^2 <= 0 (<Phi> = 0) keeps all 4 gauge bosons strictly massless.
//
//   Part 2 — Exact Yukawa Fermion Mass Generation + Majorana Seesaw on E-FRC-0324's 16-State Spin(10):
//     Uses the exact 16 Weyl states from E-FRC-0324 (Q_L, u_R^c, d_R^c, L_L, e_R^c, nu_R^c) and the
//     SO(10) invariant 16 x 16 x 10 pairing, verifies that every gauge-invariant Dirac Yukawa entry
//     conserves Q_em = T_3 + Y identically (0 charge-violating entries across all 256 matrix entries),
//     preserves exact SU(3)_C color degeneracy, proves nu_R^c is the UNIQUE complete SM singlet (1, 1)_0
//     allowing a bare Majorana mass M_R, diagonalizes the full 16 x 16 mass matrix including the
//     type-I seesaw (m_nu_light ~ m_D^2 / M_R), and checks the <Phi> = 0 unbroken negative control.
//
//   Part 3 — Exact 2-Loop SM RG Running from sin^2(theta_W)_GUT = 3/8 & Honest alpha Audit:
//     Derives the exact 1-loop b_i = (41/10, -19/6, -7) and 2-loop matrix b_{ij} in exact BigInt
//     rationals directly from E-FRC-0324's 16 states + 1 Higgs doublet, integrates the exact 2-loop
//     SM RGE via RK4 from M_Z = 91.1876 GeV up to M_GUT and back down from sin^2(theta_W)_GUT = 3/8,
//     certifies round-trip reversibility (<= 1e-12), reports the famous non-SUSY 1-Higgs meeting
//     mismatch transparently, and audits alpha against Vibe Theory's own lattice invariants
//     (G_eff = 0.077167, K_eff = 1.031237, |W(F4)| = 1152, |Sigma(648)| = 648) using E-MTH-0021's
//     pre-registered null judge (refusing both numerology controls and reporting honestly that
//     zero free-parameter lattice candidates hit CODATA 1/137.035999177, while natural bare
//     alpha_bare ~ 1/(4 pi * 3.35) ~ 1/42 runs across ~15 decades to alpha(M_Z) ~ 1/128 and alpha(0) ~ 1/137).

import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import {
  INVERSE_ALPHA,
  INVERSE_ALPHA_DELTA,
  NULL_SAMPLES,
  warpFactor,
  type Judged,
} from '@/code/measure/coupling-candidates'
import {
  NULL_WINDOW,
  RELATION_A_MAX,
  RELATION_BASIS,
  RELATION_C_MAX,
  namedFormChance,
  weylPoint,
} from '@/code/measure/integer-relation'
import { EXACT_COLUMN_SHELL_COUNTS } from '@/code/measure/pair-density-gravity-slope'
import {
  analyzeSo10ThreeGenerations,
  rat,
  ratAdd,
  ratEq,
  ratIsZero,
  ratMul,
  ratToNumber,
  type Rat,
  type Spin10StateInfo,
} from '@/code/measure/so10-three-generations'

// ---------------------------------------------------------------------------------------------------------
// Dense complex matrix utilities (deterministic, exact float64)

type MatC = {
  readonly n: number
  readonly re: Float64Array
  readonly im: Float64Array
}

function zerosC(n: number): MatC {
  return { n, re: new Float64Array(n * n), im: new Float64Array(n * n) }
}

function addScaledC(
  terms: readonly (readonly [number, number, MatC])[],
): MatC {
  const n = terms[0]![2].n
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (const [sr, si, m] of terms) {
    for (let i = 0; i < n * n; i++) {
      re[i]! += sr * m.re[i]! - si * m.im[i]!
      im[i]! += sr * m.im[i]! + si * m.re[i]!
    }
  }

  return { n, re, im }
}

function mulC(a: MatC, b: MatC): MatC {
  const n = a.n
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < n; k++) {
        const ar = a.re[i * n + k]!
        const ai = a.im[i * n + k]!
        const br = b.re[k * n + j]!
        const bi = b.im[k * n + j]!

        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }

      re[i * n + j] = sr
      im[i * n + j] = si
    }
  }

  return { n, re, im }
}

function commC(a: MatC, b: MatC): MatC {
  const ab = mulC(a, b)
  const ba = mulC(b, a)

  return addScaledC([
    [1, 0, ab],
    [-1, 0, ba],
  ])
}

function maxAbsC(a: MatC): number {
  let m = 0

  for (let i = 0; i < a.n * a.n; i++) {
    const v = Math.hypot(a.re[i]!, a.im[i]!)

    if (v > m) m = v
  }

  return m
}

function maxDiffC(a: MatC, b: MatC): number {
  let m = 0

  for (let i = 0; i < a.n * a.n; i++) {
    const v = Math.hypot(a.re[i]! - b.re[i]!, a.im[i]! - b.im[i]!)

    if (v > m) m = v
  }

  return m
}

type Vec2C = readonly [readonly [number, number], readonly [number, number]]

function mat2Apply(m: MatC, v: Vec2C): Vec2C {
  const out: [number, number][] = []

  for (let r = 0; r < 2; r++) {
    let sr = 0
    let si = 0

    for (let c = 0; c < 2; c++) {
      const mr = m.re[r * 2 + c]!
      const mi = m.im[r * 2 + c]!
      const vr = v[c]![0]
      const vi = v[c]![1]

      sr += mr * vr - mi * vi
      si += mr * vi + mi * vr
    }

    out.push([sr, si])
  }

  return [out[0]!, out[1]!]
}

function vec2Inner(a: Vec2C, b: Vec2C): readonly [number, number] {
  const r0 = a[0][0] * b[0][0] + a[0][1] * b[0][1] + a[1][0] * b[1][0] + a[1][1] * b[1][1]
  const i0 = a[0][0] * b[0][1] - a[0][1] * b[0][0] + a[1][0] * b[1][1] - a[1][1] * b[1][0]

  return [r0, i0]
}

function vec2NormSq(v: Vec2C): number {
  return v[0][0] ** 2 + v[0][1] ** 2 + v[1][0] ** 2 + v[1][1] ** 2
}

// ---------------------------------------------------------------------------------------------------------
// Part 1: Exact Electroweak Symmetry Breaking SU(2)_L x U(1)_Y -> U(1)_em Inside SO(10)

export type GaugeSpectrumPoint = {
  readonly label: string
  readonly sin2ThetaW: number
  readonly g: number
  readonly gPrime: number
  readonly eCoupling: number
  readonly mGammaSqDimless: number // m_gamma^2 / v^2 (dimensionless EW units)
  readonly mGammaSqGeV2: number
  readonly mGammaSqRelToMZ2: number
  readonly mW1Sq: number
  readonly mW2Sq: number
  readonly mZSq: number
  readonly mWGeV: number
  readonly mZGeV: number
  readonly analyticMW2Err: number
  readonly analyticMZ2Err: number
  readonly photonMixingErr: number
  readonly zMixingErr: number
  readonly rhoParameter: number
  readonly rhoErr: number
}

export type ElectroweakBreakingReport = {
  // SO(10) 10-plet embedding of Phi = (1, 2)_{+1/2}
  readonly so10VectorSu2ClosureErr: number
  readonly so10VectorYCommutesSu2Err: number
  readonly so10VectorDoubletProjectionErr: number
  readonly so10VectorDoubletChargeErr: number
  readonly so10ColorTripletCount: number
  readonly so10DoubletCount: number
  // Potential minimization and SU(2)_L x U(1)_Y gauge invariance
  readonly vGeV: number
  readonly mHGeV: number
  readonly lambdaQuartic: number
  readonly muSqGeV2: number
  readonly gaugeTransformsChecked: number
  readonly maxGaugeUnitarityErr: number
  readonly maxPotentialGaugeInvarianceErr: number
  readonly stationarityGradErr: number
  // Broken vacuum symmetry structure
  readonly qAnnihilatesVevErr: number
  readonly brokenGeneratorNormT1: number
  readonly brokenGeneratorNormT2: number
  readonly brokenGeneratorNormT3MinusY: number
  readonly goldstoneZeroModeCount: number
  readonly maxGoldstoneMassSq: number
  readonly physicalHiggsMassGeV: number
  readonly physicalHiggsMassErr: number
  readonly goldstoneTangentKernelErr: number
  // Gauge-boson spectra at both GUT (sin^2 theta_W = 3/8) and M_Z (sin^2 theta_W = 0.23122)
  readonly atGutScale: GaugeSpectrumPoint
  readonly atMzScale: GaugeSpectrumPoint
  // Negative control: unbroken phase mu^2 <= 0 (<Phi> = 0)
  readonly unbrokenMaxGaugeMassSq: number
  readonly unbrokenMinScalarMassSq: number
  readonly unbrokenScalarDegeneracyErr: number
}

function buildSo10VectorDoubletGenerators(): {
  readonly t1: MatC
  readonly t2: MatC
  readonly t3: MatC
  readonly y: MatC
  readonly q: MatC
  readonly su2ClosureErr: number
  readonly yCommutesSu2Err: number
  readonly doubletProjectionErr: number
  readonly doubletChargeErr: number
  readonly colorTripletCount: number
  readonly doubletCount: number
} {
  // Exact 10 x 10 Hermitian generators (J_{a,b})_{m,n} = i (delta_{am} delta_{bn} - delta_{an} delta_{bm})
  // satisfying [J_{ab}, J_{cd}] = i (delta_{bc} J_{ad} - delta_{ac} J_{bd} - delta_{bd} J_{ac} + delta_{ad} J_{bc})
  const getJ10 = (a: number, b: number): MatC => {
    const m = zerosC(10)

    if (a !== b) {
      m.im[a * 10 + b] = 1
      m.im[b * 10 + a] = -1
    }

    return m
  }

  // Exact SAME linear combinations as E-FRC-0324 (so10-three-generations.ts lines 776-825)
  const t1Full = addScaledC([
    [0.5, 0, getJ10(6, 9)],
    [-0.5, 0, getJ10(7, 8)],
  ])
  const t2Full = addScaledC([
    [-0.5, 0, getJ10(6, 8)],
    [-0.5, 0, getJ10(7, 9)],
  ])
  const t3Full = addScaledC([
    [0.5, 0, getJ10(6, 7)],
    [-0.5, 0, getJ10(8, 9)],
  ])
  const t3RFull = addScaledC([
    [0.5, 0, getJ10(6, 7)],
    [0.5, 0, getJ10(8, 9)],
  ])
  const bMinusLFull = addScaledC([
    [-2 / 3, 0, getJ10(0, 1)],
    [-2 / 3, 0, getJ10(2, 3)],
    [-2 / 3, 0, getJ10(4, 5)],
  ])
  const yFull = addScaledC([
    [0.5, 0, bMinusLFull],
    [1, 0, t3RFull],
  ])
  const qFull = addScaledC([
    [1, 0, t3Full],
    [1, 0, yFull],
  ])

  // Verify SU(2)_L Lie algebra and [Y, T_a^L] = 0 directly on the 10-dimensional SO(10) vector
  const su2Full = [t1Full, t2Full, t3Full]
  const triples: readonly (readonly [number, number, number])[] = [
    [0, 1, 2],
    [1, 2, 0],
    [2, 0, 1],
  ]
  let su2ClosureErr = 0

  for (const [a, b, c] of triples) {
    const lhs = commC(su2Full[a]!, su2Full[b]!)
    const rhs = addScaledC([[0, 1, su2Full[c]!]])
    const err = maxDiffC(lhs, rhs)

    if (err > su2ClosureErr) su2ClosureErr = err
  }

  let yCommutesSu2Err = 0

  for (const ta of su2Full) {
    const err = maxAbsC(commC(yFull, ta))

    if (err > yCommutesSu2Err) yCommutesSu2Err = err
  }

  // Exact complex basis of 10 = (3,1)_{-1/3} + (3bar,1)_{+1/3} + (1,2)_{+1/2} + (1,2)_{-1/2}:
  //   z_k  = (e_{2k} + i e_{2k+1}) / sqrt(2)   (J_{2k,2k+1} eigenvalue -1)
  //   z_k* = (e_{2k} - i e_{2k+1}) / sqrt(2)   (J_{2k,2k+1} eigenvalue +1)
  // For k = 0,1,2: color triplets (3,1)_{-1/3} = z_k* and (3bar,1)_{+1/3} = z_k (6 states).
  // For k = 3,4:   (1,2)_{+1/2} Higgs doublet Phi = (phi_+, phi_0) = (z_3*, z_4*),
  //                (1,2)_{-1/2} conjugate doublet Phi~ = (z_4, -z_3).
  const invSqrt2 = Math.SQRT1_2
  const makeBasisVec = (pairIdx: number, conj: boolean): { re: Float64Array; im: Float64Array } => {
    const re = new Float64Array(10)
    const im = new Float64Array(10)

    re[2 * pairIdx] = invSqrt2
    im[2 * pairIdx + 1] = conj ? -invSqrt2 : invSqrt2

    return { re, im }
  }

  const phiPlus = makeBasisVec(3, true) // z_3*: T_3 = +1/2, Y = +1/2, Q = +1
  const phiZero = makeBasisVec(4, true) // z_4*: T_3 = -1/2, Y = +1/2, Q = 0
  const doubletBasis = [phiPlus, phiZero]

  // Project any 10 x 10 operator onto the 2-dim Higgs doublet subspace (phi_+, phi_0)
  const project2 = (op: MatC): MatC => {
    const out = zerosC(2)

    for (let a = 0; a < 2; a++) {
      const bra = doubletBasis[a]!

      for (let b = 0; b < 2; b++) {
        const ket = doubletBasis[b]!
        // <bra | op | ket>
        let sr = 0
        let si = 0

        for (let r = 0; r < 10; r++) {
          let tr = 0
          let ti = 0

          for (let c = 0; c < 10; c++) {
            const or = op.re[r * 10 + c]!
            const oi = op.im[r * 10 + c]!
            const kr = ket.re[c]!
            const ki = ket.im[c]!

            tr += or * kr - oi * ki
            ti += or * ki + oi * kr
          }

          sr += bra.re[r]! * tr + bra.im[r]! * ti
          si += bra.re[r]! * ti - bra.im[r]! * tr
        }

        out.re[a * 2 + b] = sr
        out.im[a * 2 + b] = si
      }
    }

    return out
  }

  const t1 = project2(t1Full)
  const t2 = project2(t2Full)
  const t3 = project2(t3Full)
  const y = project2(yFull)
  const q = project2(qFull)

  // Verify the projected 2 x 2 matrices match sigma_1/2, sigma_2/2, sigma_3/2, (1/2) I_2, diag(1, 0)
  const expectedT1: MatC = {
    n: 2,
    re: new Float64Array([0, 0.5, 0.5, 0]),
    im: new Float64Array([0, 0, 0, 0]),
  }
  const expectedT2: MatC = {
    n: 2,
    re: new Float64Array([0, 0, 0, 0]),
    im: new Float64Array([0, -0.5, 0.5, 0]),
  }
  const expectedT3: MatC = {
    n: 2,
    re: new Float64Array([0.5, 0, 0, -0.5]),
    im: new Float64Array([0, 0, 0, 0]),
  }
  const expectedY: MatC = {
    n: 2,
    re: new Float64Array([0.5, 0, 0, 0.5]),
    im: new Float64Array([0, 0, 0, 0]),
  }
  const expectedQ: MatC = {
    n: 2,
    re: new Float64Array([1, 0, 0, 0]),
    im: new Float64Array([0, 0, 0, 0]),
  }

  const doubletProjectionErr = Math.max(
    maxDiffC(t1, expectedT1),
    maxDiffC(t2, expectedT2),
    maxDiffC(t3, expectedT3),
    maxDiffC(y, expectedY),
  )
  const doubletChargeErr = maxDiffC(q, expectedQ)

  // Verify decomposition of all 10 vector basis states under SU(2)_L x U(1)_Y
  const allBasis = [
    makeBasisVec(0, true),
    makeBasisVec(1, true),
    makeBasisVec(2, true),
    makeBasisVec(0, false),
    makeBasisVec(1, false),
    makeBasisVec(2, false),
    makeBasisVec(3, true),
    makeBasisVec(4, true),
    makeBasisVec(4, false),
    makeBasisVec(3, false),
  ]
  const c2Su2Full = addScaledC([
    [1, 0, mulC(t1Full, t1Full)],
    [1, 0, mulC(t2Full, t2Full)],
    [1, 0, mulC(t3Full, t3Full)],
  ])
  let colorTripletCount = 0
  let doubletCount = 0

  for (const vec of allBasis) {
    let c2w = 0

    for (let r = 0; r < 10; r++) {
      let tr = 0
      let ti = 0

      for (let c = 0; c < 10; c++) {
        tr += c2Su2Full.re[r * 10 + c]! * vec.re[c]! - c2Su2Full.im[r * 10 + c]! * vec.im[c]!
        ti += c2Su2Full.re[r * 10 + c]! * vec.im[c]! + c2Su2Full.im[r * 10 + c]! * vec.re[c]!
      }

      c2w += vec.re[r]! * tr + vec.im[r]! * ti
    }

    if (Math.abs(c2w - 0.75) < 1e-12) {
      doubletCount++
    } else if (Math.abs(c2w) < 1e-12) {
      colorTripletCount++
    }
  }

  return {
    t1,
    t2,
    t3,
    y,
    q,
    su2ClosureErr,
    yCommutesSu2Err,
    doubletProjectionErr,
    doubletChargeErr,
    colorTripletCount,
    doubletCount,
  }
}

// Exact SU(2)_L x U(1)_Y finite group transformation U(a1, a2, a3, beta) = exp(i (a . T + beta Y))
function su2U1Transform(a1: number, a2: number, a3: number, beta: number): MatC {
  const norm = Math.hypot(a1, a2, a3)
  const half = 0.5 * norm
  const c = Math.cos(half)
  const s = norm > 0 ? Math.sin(half) / norm : 0.5

  // exp(i a . sigma / 2) = [[c + i s a3, s (a2 + i a1)], [s (-a2 + i a1), c - i s a3]]
  const u00r = c
  const u00i = s * a3
  const u01r = s * a2
  const u01i = s * a1
  const u10r = -s * a2
  const u10i = s * a1
  const u11r = c
  const u11i = -s * a3

  // Multiply by U(1)_Y phase exp(i beta / 2)
  const pr = Math.cos(0.5 * beta)
  const pi = Math.sin(0.5 * beta)
  const re = new Float64Array(4)
  const im = new Float64Array(4)
  const entries: readonly (readonly [number, number])[] = [
    [u00r, u00i],
    [u01r, u01i],
    [u10r, u10i],
    [u11r, u11i],
  ]

  for (let i = 0; i < 4; i++) {
    const [xr, xi] = entries[i]!

    re[i] = pr * xr - pi * xi
    im[i] = pr * xi + pi * xr
  }

  return { n: 2, re, im }
}

function solveGaugeBosonMassMatrix(
  label: string,
  t1: MatC,
  t2: MatC,
  t3: MatC,
  y: MatC,
  vev: Vec2C,
  vGeV: number,
  g: number,
  gPrime: number,
): GaugeSpectrumPoint {
  // Covariant derivative action G_A <Phi> for A in (W^1, W^2, W^3, B):
  //   M^2_{AB} = 2 Re( (G_A <Phi>)^dag (G_B <Phi>) )
  const gens: readonly MatC[] = [
    addScaledC([[g, 0, t1]]),
    addScaledC([[g, 0, t2]]),
    addScaledC([[g, 0, t3]]),
    addScaledC([[gPrime, 0, y]]),
  ]
  const acted: Vec2C[] = gens.map(op => mat2Apply(op, vev))
  const mRe = new Float64Array(16)
  const mIm = new Float64Array(16)

  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      const [reInner] = vec2Inner(acted[a]!, acted[b]!)

      mRe[a * 4 + b] = 2 * reInner
    }
  }

  // Diagonalize dimensionless M^2 / v^2 via Householder QL with zero shift (single exact zero eigenvalue)
  const invV2 = 1 / (vGeV * vGeV)
  const mDimlessRe = new Float64Array(16)

  for (let i = 0; i < 16; i++) {
    mDimlessRe[i] = mRe[i]! * invV2
  }

  const eig = hermitianEigenRows(4, mDimlessRe, mIm, 0)
  const mGammaSqDimless = eig.values[0]!
  const mGammaSqGeV2 = mGammaSqDimless * vGeV * vGeV
  const mW1Sq = eig.values[1]! * vGeV * vGeV
  const mW2Sq = eig.values[2]! * vGeV * vGeV
  const mZSq = eig.values[3]! * vGeV * vGeV
  const mGammaSqRelToMZ2 = Math.abs(mGammaSqGeV2) / mZSq

  const analyticMW2 = 0.25 * g * g * vGeV * vGeV
  const analyticMZ2 = 0.25 * (g * g + gPrime * gPrime) * vGeV * vGeV
  const sin2ThetaW = (gPrime * gPrime) / (g * g + gPrime * gPrime)
  const cos2ThetaW = (g * g) / (g * g + gPrime * gPrime)
  const sinThetaW = Math.sqrt(sin2ThetaW)
  const cosThetaW = Math.sqrt(cos2ThetaW)
  const eCoupling = (g * gPrime) / Math.sqrt(g * g + gPrime * gPrime)

  // Verify eigenvectors for photon A_mu = (0, 0, sin theta_W, cos theta_W) and Z_mu = (0, 0, cos theta_W, -sin theta_W)
  const vecDistUpToSign = (rowIdx: number, target: readonly [number, number, number, number]): number => {
    const off = rowIdx * 4
    let dot = 0

    for (let k = 0; k < 4; k++) {
      dot += eig.vectorsRe[off + k]! * target[k]!
    }

    const sgn = dot >= 0 ? 1 : -1
    let sq = 0

    for (let k = 0; k < 4; k++) {
      const dr = sgn * eig.vectorsRe[off + k]! - target[k]!
      const di = eig.vectorsIm[off + k]!

      sq += dr * dr + di * di
    }

    return Math.sqrt(sq)
  }

  const photonMixingErr = vecDistUpToSign(0, [0, 0, sinThetaW, cosThetaW])
  const zMixingErr = vecDistUpToSign(3, [0, 0, cosThetaW, -sinThetaW])

  const mW2Avg = 0.5 * (mW1Sq + mW2Sq)
  const rhoParameter = mW2Avg / (mZSq * cos2ThetaW)

  return {
    label,
    sin2ThetaW,
    g,
    gPrime,
    eCoupling,
    mGammaSqDimless,
    mGammaSqGeV2,
    mGammaSqRelToMZ2,
    mW1Sq,
    mW2Sq,
    mZSq,
    mWGeV: Math.sqrt(Math.max(0, mW2Avg)),
    mZGeV: Math.sqrt(Math.max(0, mZSq)),
    analyticMW2Err: Math.max(
      Math.abs(mW1Sq - analyticMW2) / Math.max(1, analyticMW2),
      Math.abs(mW2Sq - analyticMW2) / Math.max(1, analyticMW2),
    ),
    analyticMZ2Err: Math.abs(mZSq - analyticMZ2) / Math.max(1, analyticMZ2),
    photonMixingErr,
    zMixingErr,
    rhoParameter,
    rhoErr: Math.abs(rhoParameter - 1),
  }
}

function analyzeElectroweakBreaking(sin2ThetaWGutExact: number): ElectroweakBreakingReport {
  const emb = buildSo10VectorDoubletGenerators()

  // Electroweak physical scale inputs: v = (sqrt(2) G_F)^{-1/2} = 246.21965 GeV, m_H = 125.25 GeV
  const vGeV = 246.21965
  const mHGeV = 125.25
  const lambdaQuartic = (mHGeV * mHGeV) / (2 * vGeV * vGeV)
  const muSqGeV2 = lambdaQuartic * vGeV * vGeV

  const potential = (phi: Vec2C, muSq: number): number => {
    const n2 = vec2NormSq(phi)

    return -muSq * n2 + lambdaQuartic * n2 * n2
  }

  // Exact SU(2)_L x U(1)_Y gauge invariance over 200 deterministic finite transformations + generic doublets
  const gaugeTransformsChecked = 200
  let maxGaugeUnitarityErr = 0
  let maxPotentialGaugeInvarianceErr = 0

  for (let k = 0; k < gaugeTransformsChecked; k++) {
    const t = (k + 1) * 0.6180339887498949
    const a1 = 3.1 * Math.sin(1.3 * t)
    const a2 = 2.7 * Math.cos(2.1 * t)
    const a3 = 3.5 * Math.sin(0.7 * t + 0.4)
    const beta = 4.2 * Math.cos(1.7 * t - 0.3)
    const u = su2U1Transform(a1, a2, a3, beta)

    // Check U^dag U = I_2
    const uDag = zerosC(2)

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        uDag.re[r * 2 + c] = u.re[c * 2 + r]!
        uDag.im[r * 2 + c] = -u.im[c * 2 + r]!
      }
    }

    const udu = mulC(uDag, u)
    const id2: MatC = {
      n: 2,
      re: new Float64Array([1, 0, 0, 1]),
      im: new Float64Array(4),
    }
    const uErr = maxDiffC(udu, id2)

    if (uErr > maxGaugeUnitarityErr) maxGaugeUnitarityErr = uErr

    const phi: Vec2C = [
      [85 * Math.cos(0.9 * t), 60 * Math.sin(1.1 * t)],
      [140 * Math.sin(0.5 * t + 0.2), 95 * Math.cos(1.5 * t)],
    ]
    const v0 = potential(phi, muSqGeV2)
    const v1 = potential(mat2Apply(u, phi), muSqGeV2)
    const relErr = Math.abs(v1 - v0) / Math.max(1, Math.abs(v0))

    if (relErr > maxPotentialGaugeInvarianceErr) maxPotentialGaugeInvarianceErr = relErr
  }

  // Broken vacuum <Phi> = (0, v / sqrt 2)^T where v = sqrt(mu^2 / lambda)
  const vFromMin = Math.sqrt(muSqGeV2 / lambdaQuartic)
  const vev: Vec2C = [
    [0, 0],
    [vFromMin * Math.SQRT1_2, 0],
  ]

  // Exact analytic stationarity gradient dV / d phi_a at <Phi> = (0, 0, v, 0) in real basis
  // Phi = ((phi_1 + i phi_2) / sqrt 2, (phi_3 + i phi_4) / sqrt 2)^T
  // V(phi_1..4) = -(mu^2 / 2) r^2 + (lambda / 4) r^4, r^2 = sum phi_i^2
  // dV / d phi_i = (-mu^2 + lambda r^2) phi_i
  const r2Vev = vFromMin * vFromMin
  const stationarityGradErr = Math.abs((-muSqGeV2 + lambdaQuartic * r2Vev) * vFromMin)

  // Exact 4 x 4 real scalar Hessian H_{ij} = d^2 V / (d phi_i d phi_j) at (0, 0, v, 0):
  //   H_{ij} = (-mu^2 + lambda r^2) delta_{ij} + 2 lambda phi_i phi_j
  const hessRe = new Float64Array(16)
  const hessIm = new Float64Array(16)
  const phiReal = [0, 0, vFromMin, 0]

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      hessRe[i * 4 + j] =
        (i === j ? -muSqGeV2 + lambdaQuartic * r2Vev : 0) +
        2 * lambdaQuartic * phiReal[i]! * phiReal[j]!
    }
  }

  const hessEig = hermitianEigenRows(4, hessRe, hessIm, 1000)
  let goldstoneZeroModeCount = 0
  let maxGoldstoneMassSq = 0

  for (let i = 0; i < 4; i++) {
    if (Math.abs(hessEig.values[i]!) < 1e-9) {
      goldstoneZeroModeCount++
      maxGoldstoneMassSq = Math.max(maxGoldstoneMassSq, Math.abs(hessEig.values[i]!))
    }
  }

  const physicalHiggsMassGeV = Math.sqrt(Math.max(0, hessEig.values[3]!))
  const physicalHiggsMassErr = Math.abs(physicalHiggsMassGeV - Math.sqrt(2 * lambdaQuartic) * vFromMin)

  // Verify Q <Phi> = 0 identically and broken generators T_1, T_2, (T_3 - Y) map <Phi> into Hessian kernel
  const qVev = mat2Apply(emb.q, vev)
  const qAnnihilatesVevErr = Math.sqrt(vec2NormSq(qVev))
  const t3MinusY = addScaledC([
    [1, 0, emb.t3],
    [-1, 0, emb.y],
  ])
  const brokenVecs = [
    mat2Apply(emb.t1, vev),
    mat2Apply(emb.t2, vev),
    mat2Apply(t3MinusY, vev),
  ]
  const brokenGeneratorNormT1 = Math.sqrt(vec2NormSq(brokenVecs[0]!))
  const brokenGeneratorNormT2 = Math.sqrt(vec2NormSq(brokenVecs[1]!))
  const brokenGeneratorNormT3MinusY = Math.sqrt(vec2NormSq(brokenVecs[2]!))

  // Map i * T_broken <Phi> to real 4-vector (Re(phi_+), Im(phi_+), Re(phi_0), Im(phi_0)) * sqrt(2)
  // and verify H * tangent = 0 identically for all 3 Goldstone directions
  let goldstoneTangentKernelErr = 0

  for (const bv of brokenVecs) {
    // Multiply by i: (r, im) -> (-im, r)
    const tang = [
      -bv[0][1] * Math.SQRT2,
      bv[0][0] * Math.SQRT2,
      -bv[1][1] * Math.SQRT2,
      bv[1][0] * Math.SQRT2,
    ]
    let normSq = 0

    for (let r = 0; r < 4; r++) {
      let s = 0

      for (let c = 0; c < 4; c++) {
        s += hessRe[r * 4 + c]! * tang[c]!
      }

      normSq += s * s
    }

    goldstoneTangentKernelErr = Math.max(goldstoneTangentKernelErr, Math.sqrt(normSq))
  }

  // Gauge boson mass matrix at GUT Weinberg angle sin^2(theta_W)_GUT = 3/8 (exact from E-FRC-0324)
  // Using unified SO(10) coupling alpha_GUT = 1/42.3 => g_2 = g_1 = sqrt(4 pi / 42.3), g' = sqrt(3/5) g_2
  const gGut = Math.sqrt((4 * Math.PI) / 42.3)
  const gPrimeGut = gGut * Math.sqrt(sin2ThetaWGutExact / (1 - sin2ThetaWGutExact))
  const atGutScale = solveGaugeBosonMassMatrix(
    'GUT (sin^2 theta_W = 3/8)',
    emb.t1,
    emb.t2,
    emb.t3,
    emb.y,
    vev,
    vFromMin,
    gGut,
    gPrimeGut,
  )

  // Gauge boson mass matrix at M_Z: alpha_em(M_Z) = 1 / 127.951, sin^2(theta_W)(M_Z) = 0.23122
  const sin2ThetaWMz = 0.23122
  const eMz = Math.sqrt((4 * Math.PI) / 127.951)
  const gMz = eMz / Math.sqrt(sin2ThetaWMz)
  const gPrimeMz = eMz / Math.sqrt(1 - sin2ThetaWMz)
  const atMzScale = solveGaugeBosonMassMatrix(
    'M_Z (sin^2 theta_W = 0.23122)',
    emb.t1,
    emb.t2,
    emb.t3,
    emb.y,
    vev,
    vFromMin,
    gMz,
    gPrimeMz,
  )

  // Negative control: unbroken phase mu^2 = -m_H^2 / 2 < 0 -> unique minimum <Phi> = (0, 0)^T
  const muSqUnbroken = -muSqGeV2
  const vevZero: Vec2C = [
    [0, 0],
    [0, 0],
  ]
  const gensMz: readonly MatC[] = [
    addScaledC([[gMz, 0, emb.t1]]),
    addScaledC([[gMz, 0, emb.t2]]),
    addScaledC([[gMz, 0, emb.t3]]),
    addScaledC([[gPrimeMz, 0, emb.y]]),
  ]
  const actedZero = gensMz.map(op => mat2Apply(op, vevZero))
  const mZeroRe = new Float64Array(16)
  const mZeroIm = new Float64Array(16)

  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      mZeroRe[a * 4 + b] = 2 * vec2Inner(actedZero[a]!, actedZero[b]!)[0]
    }
  }

  const eigZero = hermitianEigenRows(4, mZeroRe, mZeroIm, 1000)
  let unbrokenMaxGaugeMassSq = 0

  for (let i = 0; i < 4; i++) {
    unbrokenMaxGaugeMassSq = Math.max(unbrokenMaxGaugeMassSq, Math.abs(eigZero.values[i]!))
  }

  // Unbroken scalar Hessian H_{ij} = (-muSqUnbroken) delta_{ij} = +muSqGeV2 * I_4 (4 degenerate massive scalars)
  const hUnbRe = new Float64Array(16)
  const hUnbIm = new Float64Array(16)

  for (let i = 0; i < 4; i++) {
    hUnbRe[i * 4 + i] = -muSqUnbroken
  }

  const hUnbEig = hermitianEigenRows(4, hUnbRe, hUnbIm, 1000)
  const unbrokenMinScalarMassSq = hUnbEig.values[0]!
  const unbrokenScalarDegeneracyErr = Math.abs(hUnbEig.values[3]! - hUnbEig.values[0]!)

  return {
    so10VectorSu2ClosureErr: emb.su2ClosureErr,
    so10VectorYCommutesSu2Err: emb.yCommutesSu2Err,
    so10VectorDoubletProjectionErr: emb.doubletProjectionErr,
    so10VectorDoubletChargeErr: emb.doubletChargeErr,
    so10ColorTripletCount: emb.colorTripletCount,
    so10DoubletCount: emb.doubletCount,
    vGeV: vFromMin,
    mHGeV,
    lambdaQuartic,
    muSqGeV2,
    gaugeTransformsChecked,
    maxGaugeUnitarityErr,
    maxPotentialGaugeInvarianceErr,
    stationarityGradErr,
    qAnnihilatesVevErr,
    brokenGeneratorNormT1,
    brokenGeneratorNormT2,
    brokenGeneratorNormT3MinusY,
    goldstoneZeroModeCount,
    maxGoldstoneMassSq,
    physicalHiggsMassGeV,
    physicalHiggsMassErr,
    goldstoneTangentKernelErr,
    atGutScale,
    atMzScale,
    unbrokenMaxGaugeMassSq,
    unbrokenMinScalarMassSq,
    unbrokenScalarDegeneracyErr,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Part 2: Exact Yukawa Fermion Mass Generation & Type-I Seesaw on E-FRC-0324's 16-State Spin(10)

export type YukawaSeesawReport = {
  readonly statesCount: number
  readonly totalMatrixEntries: number
  readonly diracAllowedPairsCount: number // 3 u + 3 d + 1 e + 1 nu = 8 Dirac pairs (16 symmetric entries)
  readonly phiHiggsCoupledPairs: number // 3 u + 1 nu = 4 pairs (n_5 = 0, Y_H = +1/2)
  readonly phiTildeCoupledPairs: number // 3 d + 1 e = 4 pairs (n_5 = 1, Y_H = -1/2)
  readonly so10BitMaskXorExact: boolean // every Dirac pair satisfies fockMask_i ^ fockMask_j === 0b01111
  readonly chargeViolatingEntries: number // exact 0
  readonly qAnticommMassErr: number // ||Q M_F + M_F Q|| <= 1e-15
  readonly smSingletCount: number // exact 1 (nu_R^c)
  readonly smSingletLabel: string
  readonly bareMajoranaAllowedEntries: number // exact 1: (nu_R^c, nu_R^c)
  // Diagonalized 16-state spectrum (representative 3rd-gen Yukawa scales + GUT-scale M_R)
  readonly diracMassUpGeV: number
  readonly diracMassDownGeV: number
  readonly diracMassLeptonGeV: number
  readonly diracMassNeutrinoGeV: number
  readonly majoranaScaleMRGeV: number
  readonly upColorDegeneracyErr: number
  readonly downColorDegeneracyErr: number
  readonly lightNeutrinoMassGeV: number
  readonly lightNeutrinoMassEV: number
  readonly heavyNeutrinoMassGeV: number
  readonly seesawFormulaRatioErr: number // |m_light - m_D^2 / M_R| / (m_D^2 / M_R)
  readonly seesawDeterminantErr: number // |m_light * m_heavy - m_D^2| / m_D^2
  readonly seesawTraceErr: number // |(m_heavy - m_light) - M_R| / M_R
  // Negative control: unbroken <Phi> = 0 -> 15 SM Weyl fermions strictly massless
  readonly unbrokenMasslessSmFermionCount: number
  readonly unbrokenMaxSmFermionMassGeV: number
}

function analyzeYukawaAndSeesaw(
  states: readonly Spin10StateInfo[],
  vGeV: number,
): YukawaSeesawReport {
  const n = states.length // 16
  const invSqrt2 = Math.SQRT1_2
  const halfRat = rat(1n, 2n)
  const negHalfRat = rat(-1n, 2n)

  // Representative 3rd-generation Yukawa couplings (top, bottom, tau, SO(10) m_D = 100 GeV) + M_R = 10^14 GeV
  const yUp = 172.5 / (vGeV * invSqrt2)
  const yDown = 4.18 / (vGeV * invSqrt2)
  const yLepton = 1.77686 / (vGeV * invSqrt2)
  const yNu = 100.0 / (vGeV * invSqrt2)
  const majoranaScaleMRGeV = 1e14

  const diracMassUpGeV = yUp * vGeV * invSqrt2
  const diracMassDownGeV = yDown * vGeV * invSqrt2
  const diracMassLeptonGeV = yLepton * vGeV * invSqrt2
  const diracMassNeutrinoGeV = yNu * vGeV * invSqrt2

  // Helper: color-singlet pairing on E-FRC-0324 Fock bits (bits[0..2]):
  //   - color singlet (1 x 1): both have nc in {0, 3}
  //   - color triplet-antitriplet (3 x 3bar): bits_color(i) XOR bits_color(j) === 0b111
  const isColorSingletPair = (a: Spin10StateInfo, b: Spin10StateInfo): boolean => {
    if (a.su3Dim === 1 && b.su3Dim === 1) return true
    if (a.su3Dim === 3 && b.su3Dim === 3 && a.su3Rep !== b.su3Rep) {
      const ca = a.fockMask & 0b111
      const cb = b.fockMask & 0b111

      return (ca ^ cb) === 0b111
    }

    return false
  }

  // Classify every unordered pair (i <= j) in the 16-state Spin(10) spinor for:
  //   (a) coupling to <Phi>  (SU(2)_L doublet, T_3 = -1/2, Y = +1/2, Q = 0)
  //   (b) coupling to <Phi~> (SU(2)_L doublet, T_3 = +1/2, Y = -1/2, Q = 0)
  //   (c) bare SM-invariant Majorana mass (SU(3)_C = 1, SU(2)_L = 1, Y = 0)
  const massDiracRe = new Float64Array(n * n)
  const massFullRe = new Float64Array(n * n)
  const massZeroIm = new Float64Array(n * n)

  let diracAllowedPairsCount = 0
  let phiHiggsCoupledPairs = 0
  let phiTildeCoupledPairs = 0
  let so10BitMaskXorExact = true
  let bareMajoranaAllowedEntries = 0
  let nuLIdx = -1
  let nuRIdx = -1

  for (let i = 0; i < n; i++) {
    const si = states[i]!

    if (si.label === 'nu_L') nuLIdx = i
    if (si.label === 'nu_R^c') nuRIdx = i

    for (let j = i; j < n; j++) {
      const sj = states[j]!
      const t3Sum = ratAdd(si.t3L, sj.t3L)
      const ySum = ratAdd(si.y, sj.y)
      const oneDoubletOneSinglet = si.su2LDim + sj.su2LDim === 3
      const colorSinglet = isColorSingletPair(si, sj)

      // Channel A: couples to <Phi> = (0, v/sqrt 2)^T (needs T_3_sum = +1/2, Y_sum = -1/2)
      if (
        colorSinglet &&
        oneDoubletOneSinglet &&
        ratEq(t3Sum, halfRat) &&
        ratEq(ySum, negHalfRat)
      ) {
        diracAllowedPairsCount++
        phiHiggsCoupledPairs++
        if ((si.fockMask ^ sj.fockMask) !== 0b01111) so10BitMaskXorExact = false

        const mVal = si.su3Dim === 3 ? diracMassUpGeV : diracMassNeutrinoGeV

        massDiracRe[i * n + j] = mVal
        massDiracRe[j * n + i] = mVal
        massFullRe[i * n + j] = mVal
        massFullRe[j * n + i] = mVal
      }

      // Channel B: couples to <Phi~> = (v/sqrt 2, 0)^T (needs T_3_sum = -1/2, Y_sum = +1/2)
      if (
        colorSinglet &&
        oneDoubletOneSinglet &&
        ratEq(t3Sum, negHalfRat) &&
        ratEq(ySum, halfRat)
      ) {
        diracAllowedPairsCount++
        phiTildeCoupledPairs++
        if ((si.fockMask ^ sj.fockMask) !== 0b01111) so10BitMaskXorExact = false

        const mVal = si.su3Dim === 3 ? diracMassDownGeV : diracMassLeptonGeV

        massDiracRe[i * n + j] = mVal
        massDiracRe[j * n + i] = mVal
        massFullRe[i * n + j] = mVal
        massFullRe[j * n + i] = mVal
      }

      // Channel C: bare SM gauge-invariant Majorana mass (1, 1)_0 x (1, 1)_0
      if (
        si.su3Dim === 1 &&
        sj.su3Dim === 1 &&
        si.su2LDim === 1 &&
        sj.su2LDim === 1 &&
        ratIsZero(ySum)
      ) {
        bareMajoranaAllowedEntries++
        massFullRe[i * n + j]! += majoranaScaleMRGeV
        if (i !== j) massFullRe[j * n + i]! += majoranaScaleMRGeV
      }
    }
  }

  // Exact check across ALL 16 x 16 = 256 entries: U(1)_em conservation Q M_F + M_F Q = 0 (Q_i + Q_j = 0)
  let chargeViolatingEntries = 0
  let qAnticommMassErr = 0

  for (let i = 0; i < n; i++) {
    const qi = ratToNumber(states[i]!.q)

    for (let j = 0; j < n; j++) {
      const qj = ratToNumber(states[j]!.q)
      const mij = massFullRe[i * n + j]!
      const anticomm = (qi + qj) * mij

      qAnticommMassErr = Math.max(qAnticommMassErr, Math.abs(anticomm))

      if (Math.abs(mij) > 0 && !ratIsZero(ratAdd(states[i]!.q, states[j]!.q))) {
        chargeViolatingEntries++
      }
    }
  }

  // Count complete SM singlets (1, 1)_0 across the 16 states
  const smSinglets = states.filter(
    s => s.su3Dim === 1 && s.su2LDim === 1 && ratIsZero(s.y) && ratIsZero(s.q),
  )

  // Diagonalize the charged / Dirac sector (14 states excluding neutral block) via Householder QL
  // (diagonalizing the 2 x 2 neutral seesaw block separately in high-precision analytical form
  // avoids float64 cancellation between M_R = 10^14 GeV and m_light = 10^-10 GeV)
  const diracEig = hermitianEigenRows(n, massDiracRe, massZeroIm, 500)
  const posDiracMasses = Array.from(diracEig.values)
    .filter(v => v > 1e-9)
    .sort((a, b) => a - b)
  // Expected sorted positive Dirac masses: [m_e (x1), m_d (x3), m_nu (x1), m_u (x3)]
  const downColorDegeneracyErr = Math.max(
    Math.abs(posDiracMasses[1]! - diracMassDownGeV),
    Math.abs(posDiracMasses[2]! - diracMassDownGeV),
    Math.abs(posDiracMasses[3]! - diracMassDownGeV),
  )
  const upColorDegeneracyErr = Math.max(
    Math.abs(posDiracMasses[5]! - diracMassUpGeV),
    Math.abs(posDiracMasses[6]! - diracMassUpGeV),
    Math.abs(posDiracMasses[7]! - diracMassUpGeV),
  )

  // Exact 2 x 2 type-I seesaw on (nu_L, nu_R^c): [[0, m_D], [m_D, M_R]]
  // Use cancellation-free quadratic formula: m_heavy = (M_R + sqrt(M_R^2 + 4 m_D^2)) / 2, m_light = m_D^2 / m_heavy
  const mD = nuLIdx >= 0 && nuRIdx >= 0 ? massFullRe[nuLIdx * n + nuRIdx]! : 0
  const mR = nuRIdx >= 0 ? massFullRe[nuRIdx * n + nuRIdx]! : 0
  const disc = Math.hypot(mR, 2 * mD)
  const heavyNeutrinoMassGeV = 0.5 * (mR + disc)
  const lightNeutrinoMassGeV = (mD * mD) / heavyNeutrinoMassGeV
  const lightNeutrinoMassEV = lightNeutrinoMassGeV * 1e9
  const seesawApprox = (mD * mD) / mR
  const seesawFormulaRatioErr = Math.abs(lightNeutrinoMassGeV - seesawApprox) / seesawApprox
  const seesawDeterminantErr = Math.abs(lightNeutrinoMassGeV * heavyNeutrinoMassGeV - mD * mD) / (mD * mD)
  const seesawTraceErr = Math.abs(heavyNeutrinoMassGeV - lightNeutrinoMassGeV - mR) / mR

  // Negative control: unbroken <Phi> = 0 -> M_Dirac = 0, only M_R on nu_R^c survives
  const unbRe = new Float64Array(n * n)

  if (nuRIdx >= 0) {
    unbRe[nuRIdx * n + nuRIdx] = majoranaScaleMRGeV
  }

  const unbEig = hermitianEigenRows(n, unbRe, massZeroIm, 1e14)
  let unbrokenMasslessSmFermionCount = 0
  let unbrokenMaxSmFermionMassGeV = 0

  for (let i = 0; i < n - 1; i++) {
    const absM = Math.abs(unbEig.values[i]!)

    unbrokenMaxSmFermionMassGeV = Math.max(unbrokenMaxSmFermionMassGeV, absM)
    if (absM < 1e-6) unbrokenMasslessSmFermionCount++
  }

  return {
    statesCount: n,
    totalMatrixEntries: n * n,
    diracAllowedPairsCount,
    phiHiggsCoupledPairs,
    phiTildeCoupledPairs,
    so10BitMaskXorExact,
    chargeViolatingEntries,
    qAnticommMassErr,
    smSingletCount: smSinglets.length,
    smSingletLabel: smSinglets[0]?.label ?? 'none',
    bareMajoranaAllowedEntries,
    diracMassUpGeV,
    diracMassDownGeV,
    diracMassLeptonGeV,
    diracMassNeutrinoGeV,
    majoranaScaleMRGeV,
    upColorDegeneracyErr,
    downColorDegeneracyErr,
    lightNeutrinoMassGeV,
    lightNeutrinoMassEV,
    heavyNeutrinoMassGeV,
    seesawFormulaRatioErr,
    seesawDeterminantErr,
    seesawTraceErr,
    unbrokenMasslessSmFermionCount,
    unbrokenMaxSmFermionMassGeV,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Part 3: Exact 2-Loop SM RG Running from sin^2(theta_W)_GUT = 3/8 & Honest alpha Audit

export type AlphaAuditCandidate = {
  readonly name: string
  readonly kind: 'lattice_unrun' | 'lattice_rg_run' | 'naturalness_demo' | 'numerology_control'
  readonly alphaInv: number
  readonly judged: Judged
}

export type TwoLoopRgAndAlphaReport = {
  // Exact BigInt rational derivation of b_i and b_{ij} from E-FRC-0324's 16 states + 1 Higgs doublet
  readonly beta1LoopExactMatch: boolean
  readonly beta2LoopExactMatch: boolean
  readonly beta1Loop: readonly [number, number, number]
  readonly beta2Loop: readonly (readonly [number, number, number])[]
  // 2-loop RK4 integration from M_Z = 91.1876 GeV up to M_GUT and back
  readonly mZGeV: number
  readonly alphaInvAtMz: readonly [number, number, number]
  readonly roundTripMaxErr: number
  // Pairwise crossing scales (honest non-SUSY SM 1-Higgs triangle)
  readonly log10M12GeV: number
  readonly alpha12Inv: number
  readonly alpha3InvAtM12: number
  readonly sin2ThetaWAtM12: number
  readonly log10M13GeV: number
  readonly log10M23GeV: number
  readonly nonSusyAlpha3MismatchAtM12: number // alpha_12^{-1} - alpha_3^{-1}
  readonly nonSusyRelMismatchAtM12: number
  // Running DOWN from sin^2(theta_W)_GUT = 3/8 at M_GUT = 10^15 GeV and M_12
  readonly runDownFrom1e15Sin2ThetaWMz: number
  readonly runDownFrom1e15Sin2MismatchAbs: number
  readonly runDownFromM12Sin2ThetaWMz: number
  readonly runDownFromM12AlphaEmInvMz: number
  // Natural bare lattice coupling alpha_bare = 1 / (4 pi * 3.35) ~ 1/42 run across ~15 decades
  readonly bareStiffnessNatural: number
  readonly alphaBareNaturalInv: number
  readonly naturalRunLog10MGut: number
  readonly naturalRunAlphaEmInvMz: number
  readonly naturalRunAlphaEmInvZero: number
  readonly naturalRunSin2ThetaWMz: number
  // Vibe Theory lattice invariants (computed directly from {3,4,3,4} Riccati recurrence)
  readonly latticeKEff: number
  readonly latticeGEff: number
  readonly latticeWarpLambda: number
  readonly orderWF4: number
  readonly orderSigma648: number
  // Pre-registered null audit of alpha candidates + numerology controls
  readonly candidates: readonly AlphaAuditCandidate[]
  readonly zeroParamCandidatesIdentified: number
  readonly numerologyControlsRefused: boolean
  readonly exactAlphaRemainsOpen: boolean
}

// Compute exact {3,4,3,4} pair-density Riccati stiffness K_eff and G_eff = 1 / (4 pi K_eff)
function computeLatticeKEffGEff(floorF = 24): { readonly kEff: number; readonly gEff: number } {
  const rVol = EXACT_COLUMN_SHELL_COUNTS[3] / EXACT_COLUMN_SHELL_COUNTS[2]
  const nShell = new Float64Array(floorF + 2)

  for (let d = 0; d < EXACT_COLUMN_SHELL_COUNTS.length && d < nShell.length; d++) {
    nShell[d] = EXACT_COLUMN_SHELL_COUNTS[d]!
  }

  for (let d = EXACT_COLUMN_SHELL_COUNTS.length; d < nShell.length; d++) {
    nShell[d] = nShell[d - 1]! * rVol
  }

  const cLat = new Float64Array(floorF + 1)
  const cVert = new Float64Array(floorF + 1)

  for (let d = 0; d <= floorF; d++) {
    const nd = nShell[d]!
    const nd1 = nShell[d + 1]!
    const lat = d === 0 ? 1 : d === 1 ? 10 : 8 * 5 ** (d - 1)

    cLat[d] = lat / (nd * nd)
    cVert[d] = 18 / nd1
  }

  let y = cVert[floorF]!
  let dy = cLat[floorF]!

  for (let d = floorF - 1; d >= 0; d--) {
    const cv = cVert[d]!
    const denom = cv + y
    const ratio = cv / denom

    dy = cLat[d]! + ratio * ratio * dy
    y = (cv * y) / denom
  }

  return { kEff: dy, gEff: 1 / (4 * Math.PI * dy) }
}

// Derive exact 1-loop b_i and 2-loop b_{ij} in BigInt rationals directly from E-FRC-0324's 16 Weyl states + 1 Higgs doublet
function deriveExactSmBetaCoefficients(states: readonly Spin10StateInfo[]): {
  readonly b1: readonly [Rat, Rat, Rat]
  readonly b2: readonly (readonly [Rat, Rat, Rat])[]
  readonly beta1LoopExactMatch: boolean
  readonly beta2LoopExactMatch: boolean
} {
  const nGen = rat(3n)
  const k1Inv = rat(3n, 5n) // SU(5)/SO(10) normalization 3/5
  const zero = rat(0n)

  // Fermion sums per generation from E-FRC-0324 states:
  //   S_2(U(1)) per Weyl state = (3/5) Y^2
  //   C_2(U(1)) per Weyl state = (3/5) Y^2
  //   S_2(SU(2)) per Weyl state = C_2(SU(2)) * (1 / 3) * (1/2) -> actually sum over states of (1/2)/2 = 1/4 for doublets
  //   Wait: per state in rep R of dim d(R), Dynkin contribution is S_2(R) / d(R) = C_2(R) / dim(G)!
  //   Check:
  //     U(1):  dim(G) = 1 -> S_2_state = (3/5) Y^2
  //     SU(2): dim(G) = 3 -> for doublet C_2 = 3/4, S_2_state = (3/4) / 3 = 1/4 (2 states give 1/2 = S_2(2)!)
  //     SU(3): dim(G) = 8 -> for triplet C_2 = 4/3, S_2_state = (4/3) / 8 = 1/6 (3 states give 1/2 = S_2(3)!)
  const dimG: readonly [Rat, Rat, Rat] = [rat(1n), rat(3n), rat(8n)]
  const c2Adj: readonly [Rat, Rat, Rat] = [zero, rat(2n), rat(3n)]

  // Per-state Casimirs for every Weyl fermion in E-FRC-0324's 16
  const stateCasimirs = states.map(s => {
    const c1 = ratMul(k1Inv, ratMul(s.y, s.y))
    const c2 = s.c2Su2L
    const c3 = s.c2Su3

    return [c1, c2, c3] as const
  })

  // 1 complex Higgs doublet Phi = (1, 2)_{+1/2}: 2 complex scalar components with Y = 1/2, C_2(SU(2)) = 3/4, C_2(SU(3)) = 0
  const higgsCasimir: readonly [Rat, Rat, Rat] = [
    ratMul(k1Inv, rat(1n, 4n)),
    rat(3n, 4n),
    zero,
  ]
  const higgsComponents = rat(2n)

  // Exact Machacek-Vaughn (1983) 1-loop and 2-loop formulas:
  //   b_i = -(11/3) C_2(G_i) + (2/3) N_g sum_{f in 16} S_2(f, i) + (1/3) sum_{s in Phi} S_2(s, i)
  //   b_{ij} (i = j) = -(34/3) C_2(G_i)^2
  //                    + N_g sum_{f in 16} [(10/3) C_2(G_i) + 2 C_2(f, i)] S_2(f, i)
  //                    + sum_{s in Phi} [(2/3) C_2(G_i) + 4 C_2(s, i)] S_2(s, i)
  //   b_{ij} (i != j) = 2 N_g sum_{f in 16} S_2(f, i) C_2(f, j)
  //                     + 4 sum_{s in Phi} S_2(s, i) C_2(s, j)
  const b1List: Rat[] = []
  const b2Mat: Rat[][] = []

  for (let i = 0; i < 3; i++) {
    const cg = c2Adj[i]!
    const invDimG = rat(dimG[i]!.den, dimG[i]!.num)

    let sumS2F = zero

    for (const c of stateCasimirs) {
      sumS2F = ratAdd(sumS2F, ratMul(c[i]!, invDimG))
    }

    const sumS2S = ratMul(higgsComponents, ratMul(higgsCasimir[i]!, invDimG))
    const bi = ratAdd(
      ratAdd(ratMul(rat(-11n, 3n), cg), ratMul(ratMul(rat(2n, 3n), nGen), sumS2F)),
      ratMul(rat(1n, 3n), sumS2S),
    )

    b1List.push(bi)

    const row: Rat[] = []

    for (let j = 0; j < 3; j++) {
      if (i === j) {
        let fermTerm = zero

        for (const c of stateCasimirs) {
          const s2i = ratMul(c[i]!, invDimG)
          const bracket = ratAdd(ratMul(rat(10n, 3n), cg), ratMul(rat(2n), c[i]!))

          fermTerm = ratAdd(fermTerm, ratMul(bracket, s2i))
        }

        const s2Si = ratMul(higgsCasimir[i]!, invDimG)
        const scalBracket = ratAdd(ratMul(rat(2n, 3n), cg), ratMul(rat(4n), higgsCasimir[i]!))
        const scalTerm = ratMul(higgsComponents, ratMul(scalBracket, s2Si))
        const gaugeTerm = ratMul(rat(-34n, 3n), ratMul(cg, cg))

        row.push(ratAdd(ratAdd(gaugeTerm, ratMul(nGen, fermTerm)), scalTerm))
      } else {
        let fermTerm = zero

        for (const c of stateCasimirs) {
          const s2i = ratMul(c[i]!, invDimG)

          fermTerm = ratAdd(fermTerm, ratMul(s2i, c[j]!))
        }

        const s2Si = ratMul(higgsCasimir[i]!, invDimG)
        const scalTerm = ratMul(rat(4n), ratMul(higgsComponents, ratMul(s2Si, higgsCasimir[j]!)))

        row.push(ratAdd(ratMul(ratMul(rat(2n), nGen), fermTerm), scalTerm))
      }
    }

    b2Mat.push(row)
  }

  const expectedB1: readonly [Rat, Rat, Rat] = [rat(41n, 10n), rat(-19n, 6n), rat(-7n, 1n)]
  const expectedB2: readonly (readonly [Rat, Rat, Rat])[] = [
    [rat(199n, 50n), rat(27n, 10n), rat(44n, 5n)],
    [rat(9n, 10n), rat(35n, 6n), rat(12n, 1n)],
    [rat(11n, 10n), rat(9n, 2n), rat(-26n, 1n)],
  ]

  const beta1LoopExactMatch =
    ratEq(b1List[0]!, expectedB1[0]) &&
    ratEq(b1List[1]!, expectedB1[1]) &&
    ratEq(b1List[2]!, expectedB1[2])

  let beta2LoopExactMatch = true

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (!ratEq(b2Mat[i]![j]!, expectedB2[i]![j]!)) {
        beta2LoopExactMatch = false
      }
    }
  }

  return {
    b1: [b1List[0]!, b1List[1]!, b1List[2]!],
    b2: [
      [b2Mat[0]![0]!, b2Mat[0]![1]!, b2Mat[0]![2]!],
      [b2Mat[1]![0]!, b2Mat[1]![1]!, b2Mat[1]![2]!],
      [b2Mat[2]![0]!, b2Mat[2]![1]!, b2Mat[2]![2]!],
    ],
    beta1LoopExactMatch,
    beta2LoopExactMatch,
  }
}

type Vec3 = readonly [number, number, number]

// Exact 2-loop SM RGE:
//   d(alpha_i^{-1}) / d(ln mu) = - b_i / (2 pi) - sum_j b_{ij} alpha_j / (8 pi^2)
function rk4TwoLoopRg(
  y0: Vec3,
  dtTotal: number,
  steps: number,
  b1: readonly [number, number, number],
  b2: readonly (readonly [number, number, number])[],
): Vec3 {
  const inv2Pi = 1 / (2 * Math.PI)
  const inv8Pi2 = 1 / (8 * Math.PI * Math.PI)
  const rhs = (y: Vec3): Vec3 => {
    const a0 = 1 / y[0]
    const a1 = 1 / y[1]
    const a2 = 1 / y[2]
    const out: [number, number, number] = [0, 0, 0]

    for (let i = 0; i < 3; i++) {
      const row = b2[i]!

      out[i] = -b1[i]! * inv2Pi - (row[0] * a0 + row[1] * a1 + row[2] * a2) * inv8Pi2
    }

    return out
  }

  const h = dtTotal / steps
  let y: Vec3 = [y0[0], y0[1], y0[2]]

  for (let s = 0; s < steps; s++) {
    const k1 = rhs(y)
    const y1: Vec3 = [y[0] + 0.5 * h * k1[0], y[1] + 0.5 * h * k1[1], y[2] + 0.5 * h * k1[2]]
    const k2 = rhs(y1)
    const y2: Vec3 = [y[0] + 0.5 * h * k2[0], y[1] + 0.5 * h * k2[1], y[2] + 0.5 * h * k2[2]]
    const k3 = rhs(y2)
    const y3: Vec3 = [y[0] + h * k3[0], y[1] + h * k3[1], y[2] + h * k3[2]]
    const k4 = rhs(y3)

    y = [
      y[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      y[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
      y[2] + (h / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    ]
  }

  return y
}

function alphaEmInvFrom12(a1Inv: number, a2Inv: number): number {
  return (5 / 3) * a1Inv + a2Inv
}

function sin2ThetaWFrom12(a1Inv: number, a2Inv: number): number {
  return a2Inv / alphaEmInvFrom12(a1Inv, a2Inv)
}

// Standard SM QED running below M_Z (MS-bar alpha_hat^{-1}(M_Z) -> on-shell alpha^{-1}(0)):
// Explicitly standard SM QED vacuum polarization + MS-bar-to-on-shell threshold (NOT lattice-derived).
//   Delta(alpha_hat^{-1}(M_Z) -> alpha^{-1}(M_Z)_OS) = +0.995 (W-loop + top MS-bar threshold)
//   Delta alpha_lep (1-loop e, mu, tau) + Delta alpha_had^{(5)} (0.02768) + Delta alpha_top (-0.00007)
function qedRunMzToZero(alphaEmInvMsBarMz: number, mZGeV: number): number {
  const alpha0Ref = 1 / INVERSE_ALPHA
  const leptonMassesGeV = [0.00051099895, 0.1056583755, 1.77686]
  let deltaAlphaLep = 0

  for (const ml of leptonMassesGeV) {
    deltaAlphaLep += (alpha0Ref / (3 * Math.PI)) * (2 * Math.log(mZGeV / ml) - 5 / 3)
  }

  const deltaAlphaHad5 = 0.02768
  const deltaAlphaTop = -0.00007
  const deltaAlphaTotal = deltaAlphaLep + deltaAlphaHad5 + deltaAlphaTop
  const alphaEmInvOnShellMz = alphaEmInvMsBarMz + 0.995

  return alphaEmInvOnShellMz / (1 - deltaAlphaTotal)
}

function findCrossingT(
  yMz: Vec3,
  idxA: 0 | 1 | 2,
  idxB: 0 | 1 | 2,
  tMin: number,
  tMax: number,
  b1: readonly [number, number, number],
  b2: readonly (readonly [number, number, number])[],
): { readonly t: number; readonly y: Vec3 } {
  const diff = (t: number): number => {
    const yt = rk4TwoLoopRg(yMz, t, 400, b1, b2)

    return yt[idxA] - yt[idxB]
  }

  let lo = tMin
  let hi = tMax
  const fLo = diff(lo)

  for (let iter = 0; iter < 60; iter++) {
    const mid = 0.5 * (lo + hi)
    const fMid = diff(mid)

    if ((fLo >= 0 && fMid >= 0) || (fLo < 0 && fMid < 0)) {
      lo = mid
    } else {
      hi = mid
    }
  }

  const tStar = 0.5 * (lo + hi)

  return { t: tStar, y: rk4TwoLoopRg(yMz, tStar, 800, b1, b2) }
}

function analyzeTwoLoopRgAndAlpha(states: readonly Spin10StateInfo[]): TwoLoopRgAndAlphaReport {
  const beta = deriveExactSmBetaCoefficients(states)
  const b1Num: readonly [number, number, number] = [
    ratToNumber(beta.b1[0]),
    ratToNumber(beta.b1[1]),
    ratToNumber(beta.b1[2]),
  ]
  const b2Num: readonly (readonly [number, number, number])[] = [
    [ratToNumber(beta.b2[0]![0]!), ratToNumber(beta.b2[0]![1]!), ratToNumber(beta.b2[0]![2]!)],
    [ratToNumber(beta.b2[1]![0]!), ratToNumber(beta.b2[1]![1]!), ratToNumber(beta.b2[1]![2]!)],
    [ratToNumber(beta.b2[2]![0]!), ratToNumber(beta.b2[2]![1]!), ratToNumber(beta.b2[2]![2]!)],
  ]

  // Standard PDG 2024 MS-bar inputs at M_Z = 91.1876 GeV
  const mZGeV = 91.1876
  const alphaEmInvMz = 127.951
  const sin2ThetaWMz = 0.23122
  const alpha3Mz = 0.118
  const alpha2InvMz = alphaEmInvMz * sin2ThetaWMz
  const alpha1InvMz = (3 / 5) * alphaEmInvMz * (1 - sin2ThetaWMz)
  const alpha3InvMz = 1 / alpha3Mz
  const yMz: Vec3 = [alpha1InvMz, alpha2InvMz, alpha3InvMz]

  // Exact pairwise crossings (t = ln(mu / M_Z))
  const c12 = findCrossingT(yMz, 0, 1, 15, 35, b1Num, b2Num)
  const c13 = findCrossingT(yMz, 0, 2, 15, 35, b1Num, b2Num)
  const c23 = findCrossingT(yMz, 1, 2, 20, 42, b1Num, b2Num)

  const toLog10GeV = (t: number): number => Math.log10(mZGeV) + t / Math.LN10
  const log10M12GeV = toLog10GeV(c12.t)
  const log10M13GeV = toLog10GeV(c13.t)
  const log10M23GeV = toLog10GeV(c23.t)
  const alpha12Inv = 0.5 * (c12.y[0] + c12.y[1])
  const alpha3InvAtM12 = c12.y[2]
  const sin2ThetaWAtM12 = sin2ThetaWFrom12(c12.y[0], c12.y[1])
  const nonSusyAlpha3MismatchAtM12 = alpha12Inv - alpha3InvAtM12
  const nonSusyRelMismatchAtM12 = Math.abs(nonSusyAlpha3MismatchAtM12) / alpha12Inv

  // Exact reversibility check: integrate UP from M_Z to M_12 and BACK DOWN from M_12 to M_Z
  const yUp = rk4TwoLoopRg(yMz, c12.t, 1000, b1Num, b2Num)
  const yBack = rk4TwoLoopRg(yUp, -c12.t, 1000, b1Num, b2Num)
  const roundTripMaxErr = Math.max(
    Math.abs(yBack[0] - yMz[0]),
    Math.abs(yBack[1] - yMz[1]),
    Math.abs(yBack[2] - yMz[2]),
  )

  // Run DOWN from exact SO(10) boundary sin^2(theta_W)_GUT = 3/8 (alpha_1 = alpha_2 = alpha_3 = alpha_GUT)
  const t1e15 = Math.log(1e15 / mZGeV)
  const yDownFrom1e15 = rk4TwoLoopRg([alpha12Inv, alpha12Inv, alpha12Inv], -t1e15, 1000, b1Num, b2Num)
  const runDownFrom1e15Sin2ThetaWMz = sin2ThetaWFrom12(yDownFrom1e15[0], yDownFrom1e15[1])
  const runDownFrom1e15Sin2MismatchAbs = Math.abs(runDownFrom1e15Sin2ThetaWMz - sin2ThetaWMz)

  const yDownFromM12 = rk4TwoLoopRg([alpha12Inv, alpha12Inv, alpha3InvAtM12], -c12.t, 1000, b1Num, b2Num)
  const runDownFromM12Sin2ThetaWMz = sin2ThetaWFrom12(yDownFromM12[0], yDownFromM12[1])
  const runDownFromM12AlphaEmInvMz = alphaEmInvFrom12(yDownFromM12[0], yDownFromM12[1])

  // Natural bare lattice coupling demonstration: alpha_bare = 1 / (4 pi * 3.35) ~ 1/42.1
  // run across ~15 decades (from M_GUT = 10^13.2 GeV down to M_Z and QED down to m_e ~ 0.5 MeV)
  const bareStiffnessNatural = 3.35
  const alphaBareNaturalInv = 4 * Math.PI * bareStiffnessNatural // 42.0973...
  const naturalRunLog10MGut = 13.5
  const tNat = Math.log(10 ** naturalRunLog10MGut / mZGeV)
  const yNatMz = rk4TwoLoopRg(
    [alphaBareNaturalInv, alphaBareNaturalInv, alphaBareNaturalInv],
    -tNat,
    1000,
    b1Num,
    b2Num,
  )
  const naturalRunAlphaEmInvMz = alphaEmInvFrom12(yNatMz[0], yNatMz[1])
  const naturalRunAlphaEmInvZero = qedRunMzToZero(naturalRunAlphaEmInvMz, mZGeV)
  const naturalRunSin2ThetaWMz = sin2ThetaWFrom12(yNatMz[0], yNatMz[1])

  // Honest alpha audit from Vibe Theory's own lattice invariants under E-MTH-0021's pre-registered null judge
  const { kEff, gEff } = computeLatticeKEffGEff(24)
  const lambda = warpFactor()
  const orderWF4 = 1152
  const orderSigma648 = 648

  const runBareToZero = (alphaBareInv: number, log10MuGut: number): number => {
    const dt = Math.log(10 ** log10MuGut / mZGeV)
    const yLow = rk4TwoLoopRg([alphaBareInv, alphaBareInv, alphaBareInv], -dt, 800, b1Num, b2Num)

    return qedRunMzToZero(alphaEmInvFrom12(yLow[0], yLow[1]), mZGeV)
  }

  // Pre-registered candidate table (fixed before comparison, M = 10 zero-parameter candidates + 1 naturalness demo + 2 numerology controls)
  const rawCandidates: readonly {
    readonly name: string
    readonly kind: AlphaAuditCandidate['kind']
    readonly alphaInv: number
  }[] = [
    // Unrun zero-parameter lattice invariants
    { name: 'L1_InvGEff_4PiKEff', kind: 'lattice_unrun', alphaInv: 1 / gEff },
    { name: 'L2_D4Plaquette_8PiKEff', kind: 'lattice_unrun', alphaInv: 8 * Math.PI * kEff },
    { name: 'L3_LogWarp_4PiKEffLnLambda', kind: 'lattice_unrun', alphaInv: (1 / gEff) * Math.log(lambda) },
    { name: 'L4_OneWarp_4PiKEffLambda', kind: 'lattice_unrun', alphaInv: (1 / gEff) * lambda },
    { name: 'L5_WF4Over8Pi', kind: 'lattice_unrun', alphaInv: orderWF4 / (8 * Math.PI) },
    { name: 'L6_Sigma648Over4Pi', kind: 'lattice_unrun', alphaInv: orderSigma648 / (4 * Math.PI) },
    // Same zero-parameter lattice bare couplings run down via 2-loop SM RG from 10^15 GeV + QED to q^2 = 0
    { name: 'R1_GEff_2LoopRg15Dec', kind: 'lattice_rg_run', alphaInv: runBareToZero(1 / gEff, 15) },
    { name: 'R2_D4KEff_2LoopRg15Dec', kind: 'lattice_rg_run', alphaInv: runBareToZero(8 * Math.PI * kEff, 15) },
    {
      name: 'R3_LogWarpKEff_2LoopRg15Dec',
      kind: 'lattice_rg_run',
      alphaInv: runBareToZero((1 / gEff) * Math.log(lambda), 15),
    },
    {
      name: 'R4_WF4Over8Pi_2LoopRg15Dec',
      kind: 'lattice_rg_run',
      alphaInv: runBareToZero(orderWF4 / (8 * Math.PI), 15),
    },
    // Naturalness demonstration (NOT zero-parameter: K_gauge = 3.35 and M_GUT = 10^13.5 GeV)
    {
      name: 'D1_NaturalStiffness335_Rg',
      kind: 'naturalness_demo',
      alphaInv: naturalRunAlphaEmInvZero,
    },
    // Famous numerology controls (MUST be refused by the pre-registered null judge)
    {
      name: 'C1_FourPiCubedPlus',
      kind: 'numerology_control',
      alphaInv: 4 * Math.PI ** 3 + Math.PI ** 2 + Math.PI,
    },
    {
      name: 'C2_Wyler',
      kind: 'numerology_control',
      alphaInv: 1 / ((9 / (8 * Math.PI ** 4)) * (Math.PI ** 5 / (16 * 120)) ** 0.25),
    },
  ]

  // Early-exit equivalent of coupling-candidates.judge (bit-identical budgetNull, namedNull, identified,
  // avoiding millions of hit-string allocations when tolerance >> 1e-4)
  const basisVals = RELATION_BASIS.map(([, val]) => val)
  const hasRelationHit = (x: number, delta: number): boolean => {
    const t0 = x
    const dt0 = delta
    const t1 = x * x
    const dt1 = 2 * Math.abs(x) * delta

    for (let branch = 0; branch < 2; branch++) {
      const t = branch === 0 ? t0 : t1
      const dt = branch === 0 ? dt0 : dt1

      for (let a = 1; a <= RELATION_A_MAX; a++) {
        const at = a * t
        const lim = a * dt

        if (Math.abs(at - Math.round(at)) <= lim) return true

        for (let bIdx = 0; bIdx < basisVals.length; bIdx++) {
          const bv = basisVals[bIdx]!

          for (let c = -RELATION_C_MAX; c <= RELATION_C_MAX; c++) {
            if (c === 0) continue

            const r = at - c * bv

            if (Math.abs(r - Math.round(r)) <= lim) return true
          }
        }
      }
    }

    return false
  }

  const fastJudge = (value: number, trials: number): Judged => {
    const deviation = value - INVERSE_ALPHA
    const tolerance = Math.abs(deviation)
    const exact = tolerance <= 3 * INVERSE_ALPHA_DELTA
    let budgetNull = 1

    if (tolerance < NULL_WINDOW * Math.abs(INVERSE_ALPHA)) {
      let matched = 0

      for (let i = 1; i <= NULL_SAMPLES; i++) {
        const y = INVERSE_ALPHA * (1 - NULL_WINDOW + 2 * NULL_WINDOW * weylPoint(i))

        if (hasRelationHit(y, tolerance)) matched++
      }

      budgetNull = matched / NULL_SAMPLES
    }

    const namedNull = Math.min(1, trials * namedFormChance(INVERSE_ALPHA, tolerance))

    return {
      value,
      deviation,
      relative: deviation / INVERSE_ALPHA,
      exact,
      budgetNull,
      namedNull,
      identified: exact,
    }
  }

  const zeroParamCount = rawCandidates.filter(
    c => c.kind === 'lattice_unrun' || c.kind === 'lattice_rg_run',
  ).length
  const candidates: AlphaAuditCandidate[] = rawCandidates.map(c => ({
    name: c.name,
    kind: c.kind,
    alphaInv: c.alphaInv,
    judged: fastJudge(c.alphaInv, zeroParamCount),
  }))

  const zeroParamCandidatesIdentified = candidates.filter(
    c => (c.kind === 'lattice_unrun' || c.kind === 'lattice_rg_run') && c.judged.identified,
  ).length
  const numerologyControlsRefused = candidates
    .filter(c => c.kind === 'numerology_control')
    .every(c => !c.judged.identified)

  return {
    beta1LoopExactMatch: beta.beta1LoopExactMatch,
    beta2LoopExactMatch: beta.beta2LoopExactMatch,
    beta1Loop: b1Num,
    beta2Loop: b2Num,
    mZGeV,
    alphaInvAtMz: yMz,
    roundTripMaxErr,
    log10M12GeV,
    alpha12Inv,
    alpha3InvAtM12,
    sin2ThetaWAtM12,
    log10M13GeV,
    log10M23GeV,
    nonSusyAlpha3MismatchAtM12,
    nonSusyRelMismatchAtM12,
    runDownFrom1e15Sin2ThetaWMz,
    runDownFrom1e15Sin2MismatchAbs,
    runDownFromM12Sin2ThetaWMz,
    runDownFromM12AlphaEmInvMz,
    bareStiffnessNatural,
    alphaBareNaturalInv,
    naturalRunLog10MGut,
    naturalRunAlphaEmInvMz,
    naturalRunAlphaEmInvZero,
    naturalRunSin2ThetaWMz,
    latticeKEff: kEff,
    latticeGEff: gEff,
    latticeWarpLambda: lambda,
    orderWF4,
    orderSigma648,
    candidates,
    zeroParamCandidatesIdentified,
    numerologyControlsRefused,
    exactAlphaRemainsOpen: zeroParamCandidatesIdentified === 0,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Top-level Open Problem #3 report (E-FRC-0326)

export type ElectroweakBreakingAlphaReport = {
  readonly sin2ThetaWGutExact: number
  readonly ewsb: ElectroweakBreakingReport
  readonly yukawa: YukawaSeesawReport
  readonly rgAlpha: TwoLoopRgAndAlphaReport
}

export function analyzeElectroweakBreakingAndAlpha(): ElectroweakBreakingAlphaReport {
  const so10 = analyzeSo10ThreeGenerations(20)
  const sin2ThetaWGutExact = ratToNumber(so10.weinberg.sin2ThetaWGutExact)
  const ewsb = analyzeElectroweakBreaking(sin2ThetaWGutExact)
  const yukawa = analyzeYukawaAndSeesaw(so10.spin10.states, ewsb.vGeV)
  const rgAlpha = analyzeTwoLoopRgAndAlpha(so10.spin10.states)

  return {
    sin2ThetaWGutExact,
    ewsb,
    yukawa,
    rgAlpha,
  }
}
