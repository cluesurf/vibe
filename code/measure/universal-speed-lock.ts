// UNIVERSAL LIMITING SPEED c_light = c_matter = c_grav ON THE WARPED {3,4,3,4} CUSP COLUMN
// VS GW170817 (6e-15 BOUND) (E-RLT-0125).
//
// Physics & mathematical structure:
//   1. Negative control (decoupled layers fail GW170817 by 12 orders of magnitude):
//      From E-GRV-0157, the {3,4,3,4} cusp column with parameter-free pair-density warp w(D) = 1 / N_D^2
//      (N_D = 1, 18, 330, 6034, then geometric ratio R_VOL = 6034/330; canonical unaliased single-face
//      lateral links per cubic neighbor [1, 4, 20, 100] = 1, 4*5^(D-1), matching Vibe/Geometry.lean and
//      E-FND-0185) has total lateral stiffness K_eff = sum c_lat(D) = 1.0125321220... and total
//      depth-column inertia M_eff = sum N_D * w(D) = sum 1/N_D = 1.0587611742..., giving warped graviton
//      speed c_grav = sqrt(K_eff / M_eff) = 0.9779246684... docks/beat. By contrast, a raw unwarped D = 0
//      husk Weyl fermion / photon (E-SPN-0222 weylHuskStep2) propagates at c_raw = 1.0000 docks/beat.
//      The resulting mismatch |c_grav / c_raw - 1| = 0.022075 (~2.21%) exceeds GW170817's 6e-15 bound by
//      more than 12 orders of magnitude: light, matter, and gravity CANNOT ride on uncoupled kinetic metrics.
//
//   2. Shared warped-cusp column universality (c_light = c_matter = c_grav to <= 1e-15 < 6e-15):
//      Putting all three physical species on the EXACT SAME {3,4,3,4} 1/N_D^2 warped cusp column
//      (reflecting Neumann floor at D = F, matching E-SPN-0222's unpaired boundary condition):
//        L_warp(k) = L_vert + lambda(k) * diag(c_lat(0..F)),   M_warp = diag(m_0..m_F),
//        lambda(k) = 2 * (3 - cos kx - cos ky - cos kz) = |q(k)|^2,  q_j = 2 sin(k_j / 2):
//      (a) Spin-2 metric graviton: full 6(F+1) x 6(F+1) symmetric spatial metric operator in Voigt basis
//          projected onto the 2 transverse-traceless polarizations E_+(q), E_x(q) (verified symmetric,
//          traceless, transverse, orthonormal),
//      (b) Spin-1 Maxwell photon: full 3(F+1) x 3(F+1) complex Hermitian lattice curl-curl operator
//          I_3 (x) L_vert + (|d|^2 I_3 - d d^dagger) (x) C_lat with d_j = 1 - e^{-i k_j}, cleanly
//          separating 1 longitudinal pure-gauge zero mode (curl A = 0) from 2 degenerate transverse
//          physical photon polarizations (d^dagger A = 0),
//      (c) Spin-1/2 chiral Weyl fermion: full 2(F+1) x 2(F+1) complex Hermitian square-root Weyl
//          Hamiltonian D_Weyl(k) = Sigma_hat(k) (x) H_warp(k)^{1/2} on the exact same warped column
//          measure H_warp(k) = M_warp^{-1/2} L_warp(k) M_warp^{-1/2}, whose square equals I_2 (x) H_warp(k)
//          and yields exact +-omega(k) opposite-helicity Weyl cones.
//      Because all three share the exact same warped column operator, all three lock onto the universal
//      speed c_universal = sqrt(K_eff / M_eff) to <= 1e-15 across (1,0,0), (1,1,0), (1,1,1), with 3D
//      rotational isotropy <= 1e-10, floor independence |c(16) - c(12)| <= 1e-14, and ZERO extra light
//      Horava scalar mode (unique k = 0 zero mode, all bulk KK excitations gapped at m_KK > 3.2 > 0.5).
//
//   3. Exact discrete-time unitary wave evolution & symplectic leapfrog:
//      Both the 1-beat unitary wave propagator U_warp(k) = exp(-i H_1st(k)) and the CFL-stable
//      discrete-time symplectic leapfrog U_leap(k) preserve unitarity and norm/energy to <= 1e-14,
//      satisfy strict causality c_universal = 0.977925... < 1 dock/beat (canonical single-face K_eff = 1.012532), and match E-GRV-0157's static
//      Riccati stiffness K_eff to <= 1e-14.
//
// DETERMINISM: zero random numbers; pure deterministic floating-point linear algebra.

import {
  EXACT_COLUMN_SHELL_COUNTS,
  period2TorusLateralLinksPerNeighbor,
  singleFaceLateralLinksPerNeighbor,
} from '@/code/measure/pair-density-gravity-slope'
import { weylHuskStep2 } from '@/code/measure/unitary-cusp-wall'

const R_VOL = EXACT_COLUMN_SHELL_COUNTS[3] / EXACT_COLUMN_SHELL_COUNTS[2]

export const GW170817_BOUND = 6e-15

export type WarpedColumnData = {
  readonly floorF: number
  readonly dim: number
  readonly nShell: Float64Array
  readonly w: Float64Array
  readonly cLat: Float64Array
  readonly cVert: Float64Array
  readonly mass: Float64Array
  readonly vLatSq: Float64Array
  readonly kEffNeumann: number
  readonly kEffRiccatiDirichlet: number
  readonly mEff: number
  readonly cUniversal: number
  readonly v0: Float64Array
  // Exact symmetric tridiagonal H_vert = M^{-1/2} L_vert M^{-1/2} (size dim x dim)
  readonly hVertDiag: Float64Array
  readonly hVertOff: Float64Array
  readonly hVertDirectMaxDiff: number
  // Orthonormal depth basis Q = [v_0, Q_perp] (col-major: Q[row * dim + col])
  readonly qBasis: Float64Array
  readonly kkEigs: Float64Array
  readonly aLatQ: Float64Array
  readonly qOrthoErr: number
  readonly hVertDiagErr: number
  readonly zeroModeMaxErr: number
  readonly zeroModeCount: number
  readonly mKKMin: number
  readonly mKKMax: number
}

type HermitianEigenResult = {
  readonly values: Float64Array
  // eigenvectors as columns: vecRe[row * n + col]
  readonly vecRe: Float64Array
  readonly vecIm: Float64Array
  readonly sweepsUsed: number
}

// Rutishauser/Wilkinson complex Hermitian cyclic Jacobi eigensolver with Demmel-Veselic relative
// convergence criterion, preserving 16-digit relative accuracy on tiny eigenvalues (1e-10..1e-12)
// even when coupled to O(27) bulk Kaluza-Klein modes.
function hermitianJacobiEigen(
  n: number,
  inRe: Float64Array,
  inIm: Float64Array,
  maxSweeps = 120,
): HermitianEigenResult {
  const ar = Float64Array.from(inRe)
  const ai = Float64Array.from(inIm)
  const vr = new Float64Array(n * n)
  const vi = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    vr[i * n + i] = 1
  }

  let sweepsUsed = 0

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    sweepsUsed = sweep + 1
    let rotated = false

    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const apqR = ar[p * n + q]!
        const apqI = ai[p * n + q]!
        const mag = Math.hypot(apqR, apqI)
        if (mag === 0) continue

        const app = ar[p * n + p]!
        const aqq = ar[q * n + q]!
        const absP = Math.abs(app)
        const absQ = Math.abs(aqq)
        const minDiag = Math.min(absP, absQ)
        const maxDiag = Math.max(absP, absQ)
        const thresh =
          minDiag > 0
            ? 2e-16 * Math.sqrt(minDiag * maxDiag)
            : maxDiag > 0
              ? 2e-16 * maxDiag
              : 1e-300

        if (mag <= thresh) continue

        rotated = true

        // Phase u = apq / |apq| so u^* apq = |apq| (real positive)
        const ur = apqR / mag
        const ui = apqI / mag

        // Exact Rutishauser tangent t minimizing rounding on graded diagonals
        const tau = (aqq - app) / (2 * mag)
        const t =
          tau >= 0
            ? 1 / (tau + Math.hypot(1, tau))
            : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t)
        const s = t * c
        // Complex rotation entry: s_c = s * u (applied to column q -> p), s_c^* = s * u^*
        const scr = s * ur
        const sci = s * ui

        // Exact diagonal updates without catastrophic cancellation
        ar[p * n + p] = app - t * mag
        ar[q * n + q] = aqq + t * mag
        ai[p * n + p] = 0
        ai[q * n + q] = 0
        ar[p * n + q] = 0
        ai[p * n + q] = 0
        ar[q * n + p] = 0
        ai[q * n + p] = 0

        // Update remaining rows/columns k != p, q under A' = J^dagger A J where
        //   J_{pp} = c, J_{qq} = c, J_{pq} = s * u, J_{qp} = -s * u^*
        // Column update on row k:
        //   a'[k, p] = c * a[k, p] - s * u^* * a[k, q]
        //   a'[k, q] = s * u * a[k, p] + c * a[k, q]
        for (let k = 0; k < n; k++) {
          if (k === p || k === q) continue
          const kpR = ar[k * n + p]!
          const kpI = ai[k * n + p]!
          const kqR = ar[k * n + q]!
          const kqI = ai[k * n + q]!

          // u^* * a[k, q] = (ur - i ui) * (kqR + i kqI)
          const nkpR = c * kpR - (scr * kqR + sci * kqI)
          const nkpI = c * kpI - (scr * kqI - sci * kqR)

          // u * a[k, p] = (ur + i ui) * (kpR + i kpI)
          const nkqR = c * kqR + (scr * kpR - sci * kpI)
          const nkqI = c * kqI + (scr * kpI + sci * kpR)

          ar[k * n + p] = nkpR
          ai[k * n + p] = nkpI
          ar[p * n + k] = nkpR
          ai[p * n + k] = -nkpI

          ar[k * n + q] = nkqR
          ai[k * n + q] = nkqI
          ar[q * n + k] = nkqR
          ai[q * n + k] = -nkqI
        }

        // Accumulate eigenvectors V <- V * J
        for (let k = 0; k < n; k++) {
          const vkpR = vr[k * n + p]!
          const vkpI = vi[k * n + p]!
          const vkqR = vr[k * n + q]!
          const vkqI = vi[k * n + q]!

          vr[k * n + p] = c * vkpR - (scr * vkqR + sci * vkqI)
          vi[k * n + p] = c * vkpI - (scr * vkqI - sci * vkqR)
          vr[k * n + q] = c * vkqR + (scr * vkpR - sci * vkpI)
          vi[k * n + q] = c * vkqI + (scr * vkpI + sci * vkpR)
        }
      }
    }

    if (!rotated) break
  }

  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => ar[a * n + a]! - ar[b * n + b]!,
  )
  const values = new Float64Array(n)
  const vecRe = new Float64Array(n * n)
  const vecIm = new Float64Array(n * n)

  for (let j = 0; j < n; j++) {
    const col = order[j]!
    values[j] = ar[col * n + col]!
    for (let r = 0; r < n; r++) {
      vecRe[r * n + j] = vr[r * n + col]!
      vecIm[r * n + j] = vi[r * n + col]!
    }
  }

  return { values, vecRe, vecIm, sweepsUsed }
}

function realSymmetricJacobiEigen(
  n: number,
  inMat: Float64Array,
  maxSweeps = 120,
): { readonly values: Float64Array; readonly vectors: Float64Array; readonly sweepsUsed: number } {
  const zeroIm = new Float64Array(n * n)
  const res = hermitianJacobiEigen(n, inMat, zeroIm, maxSweeps)
  return { values: res.values, vectors: res.vecRe, sweepsUsed: res.sweepsUsed }
}

// Build the exact {3,4,3,4} warped cusp column model and its k = 0 spectral decomposition.
// Defaults to canonical unaliased single-face lateral links [1, 4, 20, 100]; set aliasedPeriod2 = true
// only for the period = 2 torus comparison control ([1, 10, 40, 200]).
export function buildWarpedColumnData(floorF: number, aliasedPeriod2 = false): WarpedColumnData {
  const dim = floorF + 1
  const nShell = new Float64Array(floorF + 2)
  for (let d = 0; d < EXACT_COLUMN_SHELL_COUNTS.length && d < nShell.length; d++) {
    nShell[d] = EXACT_COLUMN_SHELL_COUNTS[d]!
  }
  for (let d = EXACT_COLUMN_SHELL_COUNTS.length; d < nShell.length; d++) {
    nShell[d] = nShell[d - 1]! * R_VOL
  }

  const w = new Float64Array(dim)
  const cLat = new Float64Array(dim)
  const cVert = new Float64Array(floorF + 1)
  const mass = new Float64Array(dim)
  const vLatSq = new Float64Array(dim)
  const latFn = aliasedPeriod2
    ? period2TorusLateralLinksPerNeighbor
    : singleFaceLateralLinksPerNeighbor

  let kEffNeumann = 0
  let mEff = 0

  for (let d = 0; d <= floorF; d++) {
    const nd = nShell[d]!
    const nd1 = nShell[d + 1]!
    const wd = 1 / (nd * nd)
    const latCount = latFn(d)

    w[d] = wd
    cLat[d] = latCount * wd
    cVert[d] = 18 / nd1
    mass[d] = nd * wd // = 1 / N_d
    vLatSq[d] = latCount / nd // = c_lat(d) / m_d

    kEffNeumann += cLat[d]!
    mEff += mass[d]!
  }

  // Exact E-GRV-0157 Riccati Schur complement K_eff (Dirichlet floor at D = F + 1)
  let y = cVert[floorF]!
  let dy = cLat[floorF]!
  for (let d = floorF - 1; d >= 0; d--) {
    const cv = cVert[d]!
    const denom = cv + y
    const ratio = cv / denom
    dy = cLat[d]! + ratio * ratio * dy
    y = (cv * y) / denom
  }
  const kEffRiccatiDirichlet = dy
  const cUniversal = Math.sqrt(kEffNeumann / mEff)

  // Analytical exact normalized zero mode v_0[d] = sqrt(m_d / M_eff)
  const v0 = new Float64Array(dim)
  for (let d = 0; d < dim; d++) {
    v0[d] = Math.sqrt(mass[d]! / mEff)
  }

  // Exact symmetric tridiagonal H_vert = M^{-1/2} L_vert M^{-1/2} (reflecting Neumann floor: bonds d = 0..F-1)
  // Computed via exact cancelled ratios N_d / N_{d+1} AND cross-checked against direct M^{-1/2} L_vert M^{-1/2}.
  const hVertDiag = new Float64Array(dim)
  const hVertOff = new Float64Array(floorF)
  const hVertDense = new Float64Array(dim * dim)
  let hVertDirectMaxDiff = 0

  for (let d = 0; d < dim; d++) {
    const upTerm = d > 0 ? 18 : 0 // c_vert(d-1) / m_d = (18 / N_d) / (1 / N_d) = 18
    const downTerm = d < floorF ? (18 * nShell[d]!) / nShell[d + 1]! : 0 // c_vert(d) / m_d
    hVertDiag[d] = upTerm + downTerm
    hVertDense[d * dim + d] = hVertDiag[d]!

    const directDiag =
      ((d > 0 ? cVert[d - 1]! : 0) + (d < floorF ? cVert[d]! : 0)) / mass[d]!
    hVertDirectMaxDiff = Math.max(hVertDirectMaxDiff, Math.abs(hVertDiag[d]! - directDiag))

    if (d < floorF) {
      const off = -18 * Math.sqrt(nShell[d]! / nShell[d + 1]!)
      hVertOff[d] = off
      hVertDense[d * dim + (d + 1)] = off
      hVertDense[(d + 1) * dim + d] = off

      const directOff = -cVert[d]! / Math.sqrt(mass[d]! * mass[d + 1]!)
      hVertDirectMaxDiff = Math.max(hVertDirectMaxDiff, Math.abs(off - directOff))
    }
  }

  // Diagonalize H_vert at k = 0 to check the full depth-column spectrum (Horava zero-mode check + KK gap)
  const eig0 = realSymmetricJacobiEigen(dim, hVertDense)
  const zeroModeThreshold = 1e-8
  let zeroModeCount = 0
  for (let i = 0; i < dim; i++) {
    if (Math.abs(eig0.values[i]!) < zeroModeThreshold) {
      zeroModeCount++
    }
  }
  const zeroModeMaxErr = Math.abs(eig0.values[0]!)
  const mKKMin = Math.sqrt(Math.max(0, eig0.values[1]!))
  const mKKMax = Math.sqrt(Math.max(0, eig0.values[dim - 1]!))

  // Build exact orthonormal depth basis Q = [v_0, u_1, ..., u_F]:
  // Column 0 is the exact analytical zero mode v_0; columns 1..F are the KK eigenvectors
  // re-orthogonalized against v_0 (modified Gram-Schmidt, twice) so Q^T H_vert Q = diag(0, E_1..E_F)
  // with ZERO cancellation error in row/col 0.
  const qBasis = new Float64Array(dim * dim)
  for (let r = 0; r < dim; r++) {
    qBasis[r * dim + 0] = v0[r]!
  }
  for (let c = 1; c < dim; c++) {
    const col = new Float64Array(dim)
    for (let r = 0; r < dim; r++) {
      col[r] = eig0.vectors[r * dim + c]!
    }
    for (let pass = 0; pass < 2; pass++) {
      for (let prev = 0; prev < c; prev++) {
        let dot = 0
        for (let r = 0; r < dim; r++) {
          dot += qBasis[r * dim + prev]! * col[r]!
        }
        for (let r = 0; r < dim; r++) {
          col[r] = col[r]! - dot * qBasis[r * dim + prev]!
        }
      }
      let nrm2 = 0
      for (let r = 0; r < dim; r++) {
        nrm2 += col[r]! * col[r]!
      }
      const inv = 1 / Math.sqrt(nrm2)
      for (let r = 0; r < dim; r++) {
        col[r] = col[r]! * inv
      }
    }
    for (let r = 0; r < dim; r++) {
      qBasis[r * dim + c] = col[r]!
    }
  }

  // Verify Q^T Q = I and Q^T H_vert Q = diag(0, E_1..E_F)
  let qOrthoErr = 0
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let dot = 0
      for (let r = 0; r < dim; r++) {
        dot += qBasis[r * dim + i]! * qBasis[r * dim + j]!
      }
      qOrthoErr = Math.max(qOrthoErr, Math.abs(dot - (i === j ? 1 : 0)))
    }
  }

  const kkEigs = new Float64Array(dim)
  kkEigs[0] = 0
  let hVertDiagErr = 0
  for (let i = 0; i < dim; i++) {
    // Compute H_vert * q_i
    const hq = new Float64Array(dim)
    for (let r = 0; r < dim; r++) {
      let s = hVertDiag[r]! * qBasis[r * dim + i]!
      if (r > 0) s += hVertOff[r - 1]! * qBasis[(r - 1) * dim + i]!
      if (r < floorF) s += hVertOff[r]! * qBasis[(r + 1) * dim + i]!
      hq[r] = s
    }
    for (let j = 0; j < dim; j++) {
      let val = 0
      for (let r = 0; r < dim; r++) {
        val += qBasis[r * dim + j]! * hq[r]!
      }
      if (i === j && i > 0) {
        kkEigs[i] = val
      } else {
        hVertDiagErr = Math.max(hVertDiagErr, Math.abs(val))
      }
    }
  }

  // Precompute A_lat_Q = Q^T * diag(vLatSq) * Q (exact symmetric matrix; A_lat_Q[0,0] = K_eff / M_eff)
  const aLatQ = new Float64Array(dim * dim)
  for (let i = 0; i < dim; i++) {
    for (let j = i; j < dim; j++) {
      let s = 0
      for (let r = 0; r < dim; r++) {
        s += qBasis[r * dim + i]! * vLatSq[r]! * qBasis[r * dim + j]!
      }
      aLatQ[i * dim + j] = s
      aLatQ[j * dim + i] = s
    }
  }

  return {
    floorF,
    dim,
    nShell,
    w,
    cLat,
    cVert,
    mass,
    vLatSq,
    kEffNeumann,
    kEffRiccatiDirichlet,
    mEff,
    cUniversal,
    v0,
    hVertDiag,
    hVertOff,
    hVertDirectMaxDiff,
    qBasis,
    kkEigs,
    aLatQ,
    qOrthoErr,
    hVertDiagErr,
    zeroModeMaxErr,
    zeroModeCount,
    mKKMin,
    mKKMax,
  }
}

// Build orthonormal triad (u, e1, e2) in R^3 for unit propagation vector u = q / |q|
function buildTransverseTriad(q: readonly [number, number, number]): {
  readonly qNorm: number
  readonly u: readonly [number, number, number]
  readonly e1: readonly [number, number, number]
  readonly e2: readonly [number, number, number]
} {
  const qNorm = Math.hypot(q[0], q[1], q[2])
  const u: [number, number, number] = [q[0] / qNorm, q[1] / qNorm, q[2] / qNorm]

  // Deterministic reference vector least aligned with u
  const ref: [number, number, number] =
    Math.abs(u[0]) <= Math.abs(u[1]) && Math.abs(u[0]) <= Math.abs(u[2])
      ? [1, 0, 0]
      : Math.abs(u[1]) <= Math.abs(u[2])
        ? [0, 1, 0]
        : [0, 0, 1]

  const dot = ref[0] * u[0] + ref[1] * u[1] + ref[2] * u[2]
  const raw1: [number, number, number] = [
    ref[0] - dot * u[0],
    ref[1] - dot * u[1],
    ref[2] - dot * u[2],
  ]
  const n1 = Math.hypot(raw1[0], raw1[1], raw1[2])
  const e1: [number, number, number] = [raw1[0] / n1, raw1[1] / n1, raw1[2] / n1]

  // e2 = u x e1
  const e2: [number, number, number] = [
    u[1] * e1[2] - u[2] * e1[1],
    u[2] * e1[0] - u[0] * e1[2],
    u[0] * e1[1] - u[1] * e1[0],
  ]

  return { qNorm, u, e1, e2 }
}

// Build exact 6x6 symmetric-tensor TT projector P_TT(q) in Voigt basis
// (h_xx, h_yy, h_zz, sqrt(2) h_xy, sqrt(2) h_xz, sqrt(2) h_yz) and verify TT identities.
function buildSpin2TTProjector(q: readonly [number, number, number]): {
  readonly pTT: Float64Array
  readonly ttIdentityErr: number
} {
  const { qNorm, e1, e2 } = buildTransverseTriad(q)
  const invSqrt2 = 1 / Math.SQRT2

  // 3x3 symmetric tensors E_+ and E_x
  const ePlus = new Float64Array(9)
  const eCross = new Float64Array(9)
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      ePlus[a * 3 + b] = invSqrt2 * (e1[a]! * e1[b]! - e2[a]! * e2[b]!)
      eCross[a * 3 + b] = invSqrt2 * (e1[a]! * e2[b]! + e2[a]! * e1[b]!)
    }
  }

  // Verify symmetry, tracelessness, transversality (E * u = 0), and Frobenius orthonormality
  let ttIdentityErr = 0
  const tensors = [ePlus, eCross] as const
  for (let p = 0; p < 2; p++) {
    const E = tensors[p]!
    const tr = E[0]! + E[4]! + E[8]!
    ttIdentityErr = Math.max(ttIdentityErr, Math.abs(tr))
    for (let a = 0; a < 3; a++) {
      let eq = 0
      for (let b = 0; b < 3; b++) {
        ttIdentityErr = Math.max(ttIdentityErr, Math.abs(E[a * 3 + b]! - E[b * 3 + a]!))
        eq += E[a * 3 + b]! * (q[b]! / qNorm)
      }
      ttIdentityErr = Math.max(ttIdentityErr, Math.abs(eq))
    }
    for (let r = 0; r < 2; r++) {
      const F = tensors[r]!
      let ip = 0
      for (let idx = 0; idx < 9; idx++) {
        ip += E[idx]! * F[idx]!
      }
      ttIdentityErr = Math.max(ttIdentityErr, Math.abs(ip - (p === r ? 1 : 0)))
    }
  }

  // Convert E_+, E_x to orthonormal 6-vectors in Voigt basis
  const toVoigt = (E: Float64Array): Float64Array =>
    Float64Array.from([
      E[0]!,
      E[4]!,
      E[8]!,
      Math.SQRT2 * E[1]!,
      Math.SQRT2 * E[2]!,
      Math.SQRT2 * E[5]!,
    ])

  const vPlus = toVoigt(ePlus)
  const vCross = toVoigt(eCross)

  // P_TT = vPlus vPlus^T + vCross vCross^T
  const pTT = new Float64Array(36)
  for (let a = 0; a < 6; a++) {
    for (let b = 0; b < 6; b++) {
      pTT[a * 6 + b] = vPlus[a]! * vPlus[b]! + vCross[a]! * vCross[b]!
    }
  }

  return { pTT, ttIdentityErr }
}

export type DirectionSpeciesResult = {
  readonly label: string
  readonly k: readonly [number, number, number]
  readonly kMag: number
  readonly lambdaK: number
  // Spin-2 graviton (full 6*(F+1) symmetric metric operator)
  readonly cGrav: number
  readonly gravDegeneracyErr: number
  readonly gravGaugeZeroEigMax: number
  readonly gravTTIdentityErr: number
  readonly gravTTPurityErr: number
  // Spin-1 Maxwell photon (full 3*(F+1) complex Hermitian lattice curl-curl operator)
  readonly cLight: number
  readonly lightDegeneracyErr: number
  readonly lightGaugeZeroEig: number
  readonly lightGaugeLongitudinalErr: number
  readonly lightTransversalityErr: number
  // Spin-1/2 chiral Weyl fermion (full 2*(F+1) complex Hermitian square-root Weyl operator)
  readonly cMatter: number
  readonly matterChiralSymErr: number
  readonly matterSquareMatchErr: number
  readonly matterHelicityErr: number
  // Pairwise fractional speed differences
  readonly gravVsLightRelDiff: number
  readonly matterVsLightRelDiff: number
  readonly gravVsMatterRelDiff: number
}

// Solve all three full multi-component operators (spin-2 graviton, spin-1 Maxwell photon, spin-1/2
// chiral Weyl fermion) on the EXACT SAME warped {3,4,3,4} column at momentum k.
function solveAllThreeSpeciesAtK(
  col: WarpedColumnData,
  label: string,
  k: readonly [number, number, number],
): DirectionSpeciesResult {
  const dim = col.dim
  const [kx, ky, kz] = k
  const kMag = Math.hypot(kx, ky, kz)

  // Real half-link momentum q_j = 2 sin(k_j / 2) and complex link difference d_j = 1 - e^{-i k_j}
  const q: [number, number, number] = [
    2 * Math.sin(kx / 2),
    2 * Math.sin(ky / 2),
    2 * Math.sin(kz / 2),
  ]
  const lambdaK = q[0] * q[0] + q[1] * q[1] + q[2] * q[2]
  const qNorm = Math.sqrt(lambdaK)

  const dRe = [1 - Math.cos(kx), 1 - Math.cos(ky), 1 - Math.cos(kz)] as const
  const dIm = [Math.sin(kx), Math.sin(ky), Math.sin(kz)] as const
  const dNormSq =
    dRe[0] * dRe[0] +
    dIm[0] * dIm[0] +
    dRe[1] * dRe[1] +
    dIm[1] * dIm[1] +
    dRe[2] * dRe[2] +
    dIm[2] * dIm[2]
  const dNorm = Math.sqrt(dNormSq)

  // Shared scalar column operator H_warp_Q(k) = diag(0, E_1..E_F) + lambda(k) * A_lat_Q
  const hWarpQ = new Float64Array(dim * dim)
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      hWarpQ[i * dim + j] = (i === j ? col.kkEigs[i]! : 0) + lambdaK * col.aLatQ[i * dim + j]!
    }
  }

  // -----------------------------------------------------------------------------------------------
  // (a) SPIN-2 METRIC GRAVITON: full 6*(F+1) x 6*(F+1) symmetric tensor operator in Voigt basis
  //     H_grav(k) = I_6 (x) diag(0, E_1..E_F) + (lambda(k) * P_TT(q)) (x) A_lat_Q
  //     Parameter-free linearized Einstein-Fierz-Pauli form (exact parallel to Maxwell):
  //     4 longitudinal/trace gauge zero modes (modes 0..3) + 2 physical TT spin-2 gravitons (modes 4, 5).
  const { pTT, ttIdentityErr: gravTTIdentityErr } = buildSpin2TTProjector(q)
  const dim6 = 6 * dim
  const hGrav = new Float64Array(dim6 * dim6)

  for (let a = 0; a < 6; a++) {
    for (let b = 0; b < 6; b++) {
      const pAB = pTT[a * 6 + b]!
      for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
          const vert = a === b && i === j ? col.kkEigs[i]! : 0
          hGrav[(a * dim + i) * dim6 + (b * dim + j)] = vert + lambdaK * pAB * col.aLatQ[i * dim + j]!
        }
      }
    }
  }

  const eigGrav = realSymmetricJacobiEigen(dim6, hGrav)
  // Modes 0..3 are the 4 pure-gauge / trace zero modes; modes 4 and 5 are the 2 physical TT gravitons.
  let gravGaugeZeroEigMax = 0
  for (let m = 0; m < 4; m++) {
    gravGaugeZeroEigMax = Math.max(gravGaugeZeroEigMax, Math.abs(eigGrav.values[m]!))
  }
  const omegaGrav0 = Math.sqrt(Math.max(0, eigGrav.values[4]!))
  const omegaGrav1 = Math.sqrt(Math.max(0, eigGrav.values[5]!))
  const cGrav = omegaGrav0 / kMag
  const gravDegeneracyErr = Math.abs(omegaGrav1 - omegaGrav0) / omegaGrav0

  // Verify the 2 physical modes (4, 5) are 100% in the spin-2 TT subspace: ||(I - P_TT) (x) I * psi||
  let gravTTPurityErr = 0
  for (let m = 4; m < 6; m++) {
    let leakSq = 0
    for (let a = 0; a < 6; a++) {
      for (let i = 0; i < dim; i++) {
        let proj = 0
        for (let b = 0; b < 6; b++) {
          proj += pTT[a * 6 + b]! * eigGrav.vectors[(b * dim + i) * dim6 + m]!
        }
        const diff = eigGrav.vectors[(a * dim + i) * dim6 + m]! - proj
        leakSq += diff * diff
      }
    }
    gravTTPurityErr = Math.max(gravTTPurityErr, Math.sqrt(leakSq))
  }

  // -----------------------------------------------------------------------------------------------
  // (b) SPIN-1 MAXWELL PHOTON: full 3*(F+1) x 3*(F+1) complex Hermitian lattice curl-curl operator
  //     H_Maxwell(k) = I_3 (x) diag(0, E_1..E_F) + (|d|^2 I_3 - d d^dagger) (x) A_lat_Q
  const dim3 = 3 * dim
  const hMaxRe = new Float64Array(dim3 * dim3)
  const hMaxIm = new Float64Array(dim3 * dim3)

  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      // K_Maxwell[a, b] = |d|^2 delta_{ab} - d_a * conj(d_b)
      const kRe = (a === b ? dNormSq : 0) - (dRe[a]! * dRe[b]! + dIm[a]! * dIm[b]!)
      const kIm = -(dIm[a]! * dRe[b]! - dRe[a]! * dIm[b]!)

      for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
          const vert = a === b && i === j ? col.kkEigs[i]! : 0
          const alat = col.aLatQ[i * dim + j]!
          hMaxRe[(a * dim + i) * dim3 + (b * dim + j)] = vert + kRe * alat
          hMaxIm[(a * dim + i) * dim3 + (b * dim + j)] = kIm * alat
        }
      }
    }
  }

  const eigMax = hermitianJacobiEigen(dim3, hMaxRe, hMaxIm)
  // Mode 0 is the exact longitudinal pure-gauge zero mode (curl A = 0); modes 1 & 2 are the 2
  // physical transverse photon polarizations (d^dagger A = 0).
  const lightGaugeZeroEig = Math.abs(eigMax.values[0]!)
  const omegaLight1 = Math.sqrt(Math.max(0, eigMax.values[1]!))
  const omegaLight2 = Math.sqrt(Math.max(0, eigMax.values[2]!))
  const cLight = omegaLight1 / kMag
  const lightDegeneracyErr = Math.abs(omegaLight2 - omegaLight1) / omegaLight1

  // Compute longitudinal projection norm ||(d^dagger / |d|) A|| over depth layers for modes 0, 1, 2
  const longitudinalFrac = (modeIdx: number): number => {
    let lonSq = 0
    for (let i = 0; i < dim; i++) {
      let sRe = 0
      let sIm = 0
      for (let a = 0; a < 3; a++) {
        const vr = eigMax.vecRe[(a * dim + i) * dim3 + modeIdx]!
        const vi = eigMax.vecIm[(a * dim + i) * dim3 + modeIdx]!
        // conj(d_a) * v_a = (dRe - i dIm) * (vr + i vi)
        sRe += dRe[a]! * vr + dIm[a]! * vi
        sIm += dRe[a]! * vi - dIm[a]! * vr
      }
      lonSq += (sRe * sRe + sIm * sIm) / dNormSq
    }
    return Math.sqrt(lonSq)
  }

  const lightGaugeLongitudinalErr = Math.abs(1 - longitudinalFrac(0))
  const lightTransversalityErr = Math.max(longitudinalFrac(1), longitudinalFrac(2))

  // -----------------------------------------------------------------------------------------------
  // (c) SPIN-1/2 CHIRAL WEYL FERMION: full 2*(F+1) x 2*(F+1) complex Hermitian square-root operator
  //     D_Weyl(k) = Sigma_hat(k) (x) H_warp_Q(k)^{1/2},  Sigma_hat(k) = (q . sigma) / |q|
  const eigCol = realSymmetricJacobiEigen(dim, hWarpQ)
  const rWarpQ = new Float64Array(dim * dim)
  for (let i = 0; i < dim; i++) {
    for (let j = i; j < dim; j++) {
      let s = 0
      for (let m = 0; m < dim; m++) {
        const root = Math.sqrt(Math.max(0, eigCol.values[m]!))
        s += eigCol.vectors[i * dim + m]! * root * eigCol.vectors[j * dim + m]!
      }
      rWarpQ[i * dim + j] = s
      rWarpQ[j * dim + i] = s
    }
  }

  // Helicity matrix Sigma_hat(k) = (q_x sigma_x + q_y sigma_y + q_z sigma_z) / |q|
  const ux = q[0] / qNorm
  const uy = q[1] / qNorm
  const uz = q[2] / qNorm
  const sigRe = [uz, ux, ux, -uz] as const
  const sigIm = [0, -uy, uy, 0] as const

  const dim2 = 2 * dim
  const dWeylRe = new Float64Array(dim2 * dim2)
  const dWeylIm = new Float64Array(dim2 * dim2)
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < 2; b++) {
      const sr = sigRe[a * 2 + b]!
      const si = sigIm[a * 2 + b]!
      for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
          const rw = rWarpQ[i * dim + j]!
          dWeylRe[(a * dim + i) * dim2 + (b * dim + j)] = sr * rw
          dWeylIm[(a * dim + i) * dim2 + (b * dim + j)] = si * rw
        }
      }
    }
  }

  // Verify exact operator identity: ||D_Weyl(k)^2 - I_2 (x) H_warp_Q(k)||_inf
  let matterSquareMatchErr = 0
  for (let row = 0; row < dim2; row++) {
    const a = Math.floor(row / dim)
    const i = row % dim
    for (let c = 0; c < dim2; c++) {
      const b = Math.floor(c / dim)
      const j = c % dim
      let sr = 0
      let si = 0
      for (let t = 0; t < dim2; t++) {
        const xr = dWeylRe[row * dim2 + t]!
        const xi = dWeylIm[row * dim2 + t]!
        const yr = dWeylRe[t * dim2 + c]!
        const yi = dWeylIm[t * dim2 + c]!
        sr += xr * yr - xi * yi
        si += xr * yi + xi * yr
      }
      const target = a === b ? hWarpQ[i * dim + j]! : 0
      matterSquareMatchErr = Math.max(matterSquareMatchErr, Math.hypot(sr - target, si))
    }
  }

  const eigWeyl = hermitianJacobiEigen(dim2, dWeylRe, dWeylIm)
  // Ascending spectrum: negative branches at 0..dim-1, positive branches at dim..2*dim-1.
  // Lowest-magnitude pair is indices (dim - 1) (-omega_0) and dim (+omega_0).
  const omegaMatterNeg = eigWeyl.values[dim - 1]!
  const omegaMatterPos = eigWeyl.values[dim]!
  const cMatter = omegaMatterPos / kMag
  const matterChiralSymErr = Math.abs(omegaMatterPos + omegaMatterNeg) / omegaMatterPos

  // Verify exact helicities <psi | Sigma_hat(k) (x) I | psi> = -1 (neg mode) and +1 (pos mode)
  const helicityOf = (modeIdx: number): number => {
    let val = 0
    for (let i = 0; i < dim; i++) {
      const v0r = eigWeyl.vecRe[i * dim2 + modeIdx]!
      const v0i = eigWeyl.vecIm[i * dim2 + modeIdx]!
      const v1r = eigWeyl.vecRe[(dim + i) * dim2 + modeIdx]!
      const v1i = eigWeyl.vecIm[(dim + i) * dim2 + modeIdx]!
      // <v | Sigma_hat | v> = uz*(|v0|^2 - |v1|^2) + 2*ux*Re(v0^* v1) + 2*uy*Im(v0^* v1)
      const c01r = v0r * v1r + v0i * v1i
      const c01i = v0r * v1i - v0i * v1r
      val += uz * (v0r * v0r + v0i * v0i - (v1r * v1r + v1i * v1i)) + 2 * ux * c01r + 2 * uy * c01i
    }
    return val
  }

  const helNeg = helicityOf(dim - 1)
  const helPos = helicityOf(dim)
  const matterHelicityErr = Math.max(Math.abs(helNeg + 1), Math.abs(helPos - 1))

  return {
    label,
    k,
    kMag,
    lambdaK,
    cGrav,
    gravDegeneracyErr,
    gravGaugeZeroEigMax,
    gravTTIdentityErr,
    gravTTPurityErr,
    cLight,
    lightDegeneracyErr,
    lightGaugeZeroEig,
    lightGaugeLongitudinalErr,
    lightTransversalityErr,
    cMatter,
    matterChiralSymErr,
    matterSquareMatchErr,
    matterHelicityErr,
    gravVsLightRelDiff: Math.abs(cGrav - cLight) / cLight,
    matterVsLightRelDiff: Math.abs(cMatter - cLight) / cLight,
    gravVsMatterRelDiff: Math.abs(cGrav - cMatter) / cMatter,
  }
}

export type UnitaryWaveCheckResult = {
  readonly probeK: readonly [number, number, number]
  readonly uWarpUnitarityErr: number
  readonly uWarpNormDrift1Beat: number
  readonly uWarpNormDrift10Beats: number
  readonly uWarpNormDrift100Beats: number
  readonly uWarpNormDrift1000Beats: number
  readonly uWarpSpeedAtSmallK: number
  readonly uWarpSpeedRelErrVsUniversal: number
  readonly leapfrogDt: number
  readonly leapfrogMaxStabilityRatio: number // dt^2 * E_max / 4 (must be < 1)
  readonly uLeapUnitarityErr: number
  readonly leapfrogEnergyDrift100Steps: number
  readonly leapfrogEnergyDrift600Steps: number
  readonly leapfrogSpeedAtSmallK: number
  readonly leapfrogSpeedRelErrVsUniversal: number
  readonly staticStiffnessDiffVsEGrv0157: number
  readonly cSqMVsEGrv0157Diff: number
  readonly strictlyCausal: boolean
}

// Test 3: Exact 1-beat discrete-time unitary propagator U_warp(k) = exp(-i H_1st(k)) AND
// CFL-stable symplectic leapfrog U_leap(k) built directly from (L_warp(k), M_warp).
function runUnitaryWaveChecks(col: WarpedColumnData, kSmall: number): UnitaryWaveCheckResult {
  const dim = col.dim
  const dim2 = 2 * dim

  // Helper: build exact 2(F+1) x 2(F+1) 1-beat unitary wave propagator
  //   U_warp(k) = exp(-i [[0, R], [R, 0]]) = [[cos(R), -i sin(R)], [-i sin(R), cos(R)]]
  // and exact 2(F+1) x 2(F+1) symplectic leapfrog unitary
  //   U_leap(k) = [[I - 2A, 2i sqrt(A(I - A))], [2i sqrt(A(I - A)), I - 2A]], A = (dt^2 / 4) H
  const buildUnitaryPair = (
    lam: number,
    dt: number,
  ): {
    readonly uWarpRe: Float64Array
    readonly uWarpIm: Float64Array
    readonly uLeapRe: Float64Array
    readonly uLeapIm: Float64Array
    readonly omega0: number
    readonly eMax: number
  } => {
    const hQ = new Float64Array(dim * dim)
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        hQ[i * dim + j] = (i === j ? col.kkEigs[i]! : 0) + lam * col.aLatQ[i * dim + j]!
      }
    }
    const eig = realSymmetricJacobiEigen(dim, hQ)
    const omega0 = Math.sqrt(Math.max(0, eig.values[0]!))
    const eMax = eig.values[dim - 1]!

    // Polish orthogonality of V via one modified Gram-Schmidt pass so U_warp and U_leap have zero
    // singular-value bias at machine precision.
    const vecs = Float64Array.from(eig.vectors)
    for (let c = 0; c < dim; c++) {
      for (let prev = 0; prev < c; prev++) {
        let dot = 0
        for (let r = 0; r < dim; r++) {
          dot += vecs[r * dim + prev]! * vecs[r * dim + c]!
        }
        for (let r = 0; r < dim; r++) {
          vecs[r * dim + c] = vecs[r * dim + c]! - dot * vecs[r * dim + prev]!
        }
      }
      let n2 = 0
      for (let r = 0; r < dim; r++) {
        n2 += vecs[r * dim + c]! * vecs[r * dim + c]!
      }
      const inv = 1 / Math.sqrt(n2)
      for (let r = 0; r < dim; r++) {
        vecs[r * dim + c] = vecs[r * dim + c]! * inv
      }
    }

    const uWarpRe = new Float64Array(dim2 * dim2)
    const uWarpIm = new Float64Array(dim2 * dim2)
    const uLeapRe = new Float64Array(dim2 * dim2)
    const uLeapIm = new Float64Array(dim2 * dim2)

    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        let cosS = 0
        let sinS = 0
        let leapC = 0
        let leapS = 0

        for (let m = 0; m < dim; m++) {
          const em = Math.max(0, eig.values[m]!)
          const om = Math.sqrt(em)
          const w = vecs[i * dim + m]! * vecs[j * dim + m]!
          cosS += w * Math.cos(om)
          sinS += w * Math.sin(om)

          const aVal = (dt * dt * em) / 4
          leapC += w * (1 - 2 * aVal)
          leapS += w * (2 * Math.sqrt(Math.max(0, aVal * (1 - aVal))))
        }

        // U_warp = [[cos(R), -i sin(R)], [-i sin(R), cos(R)]]
        uWarpRe[i * dim2 + j] = cosS
        uWarpRe[(dim + i) * dim2 + (dim + j)] = cosS
        uWarpIm[i * dim2 + (dim + j)] = -sinS
        uWarpIm[(dim + i) * dim2 + j] = -sinS

        // U_leap = [[I - 2A, 2i sqrt(A(I-A))], [2i sqrt(A(I-A)), I - 2A]]
        uLeapRe[i * dim2 + j] = leapC
        uLeapRe[(dim + i) * dim2 + (dim + j)] = leapC
        uLeapIm[i * dim2 + (dim + j)] = leapS
        uLeapIm[(dim + i) * dim2 + j] = leapS
      }
    }

    return { uWarpRe, uWarpIm, uLeapRe, uLeapIm, omega0, eMax }
  }

  const unitarityInfErr = (n: number, re: Float64Array, im: Float64Array): number => {
    let maxErr = 0
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let sr = 0
        let si = 0
        for (let r = 0; r < n; r++) {
          const ar = re[r * n + i]!
          const ai = -im[r * n + i]!
          const br = re[r * n + j]!
          const bi = im[r * n + j]!
          sr += ar * br - ai * bi
          si += ar * bi + ai * br
        }
        maxErr = Math.max(maxErr, Math.hypot(sr - (i === j ? 1 : 0), si))
      }
    }
    return maxErr
  }

  // Macroscopic oblique probe momentum where both massless & KK modes actively oscillate
  const probeK: [number, number, number] = [0.1, 0.07, 0.05]
  const lamProbe =
    2 * (3 - Math.cos(probeK[0]) - Math.cos(probeK[1]) - Math.cos(probeK[2]))
  const leapfrogDt = 1 / 6
  const probeOps = buildUnitaryPair(lamProbe, leapfrogDt)

  const uWarpUnitarityErr = unitarityInfErr(dim2, probeOps.uWarpRe, probeOps.uWarpIm)
  const uLeapUnitarityErr = unitarityInfErr(dim2, probeOps.uLeapRe, probeOps.uLeapIm)

  // Check worst-case BZ corner (pi, pi, pi) where lambda = 12 for CFL stability
  const bzCornerOps = buildUnitaryPair(12, leapfrogDt)
  const leapfrogMaxStabilityRatio = (leapfrogDt * leapfrogDt * bzCornerOps.eMax) / 4

  // Evolve deterministic multi-mode normalized state psi(0) under U_warp(k_probe) for 1,000 beats
  let psiRe = new Float64Array(dim2)
  let psiIm = new Float64Array(dim2)
  let initNorm2 = 0
  for (let i = 0; i < dim2; i++) {
    psiRe[i] = Math.cos(0.7 * i + 0.3) / (1 + 0.2 * i)
    psiIm[i] = Math.sin(1.1 * i - 0.5) / (1 + 0.2 * i)
    initNorm2 += psiRe[i]! * psiRe[i]! + psiIm[i]! * psiIm[i]!
  }
  const invNorm = 1 / Math.sqrt(initNorm2)
  for (let i = 0; i < dim2; i++) {
    psiRe[i] = psiRe[i]! * invNorm
    psiIm[i] = psiIm[i]! * invNorm
  }

  let uWarpNormDrift1Beat = 0
  let uWarpNormDrift10Beats = 0
  let uWarpNormDrift100Beats = 0
  let uWarpNormDrift1000Beats = 0
  for (let step = 0; step < 1000; step++) {
    const nextRe = new Float64Array(dim2)
    const nextIm = new Float64Array(dim2)
    let n2 = 0
    for (let r = 0; r < dim2; r++) {
      let sr = 0
      let si = 0
      const off = r * dim2
      for (let c = 0; c < dim2; c++) {
        const ur = probeOps.uWarpRe[off + c]!
        const ui = probeOps.uWarpIm[off + c]!
        const vr = psiRe[c]!
        const vi = psiIm[c]!
        sr += ur * vr - ui * vi
        si += ur * vi + ui * vr
      }
      nextRe[r] = sr
      nextIm[r] = si
      n2 += sr * sr + si * si
    }
    psiRe = nextRe
    psiIm = nextIm
    const drift = Math.abs(n2 - 1)
    if (step === 0) {
      uWarpNormDrift1Beat = drift
    }
    if (step < 10) {
      uWarpNormDrift10Beats = Math.max(uWarpNormDrift10Beats, drift)
    }
    if (step < 100) {
      uWarpNormDrift100Beats = Math.max(uWarpNormDrift100Beats, drift)
    }
    uWarpNormDrift1000Beats = Math.max(uWarpNormDrift1000Beats, drift)
  }

  // Run explicit discrete-time symplectic leapfrog directly in the ORIGINAL depth basis D = 0..F:
  //   u(t + dt) = 2 u(t) - u(t - dt) - dt^2 * H_warp(k_probe) * u(t)
  // where H_warp(k) = H_vert + lambda(k) * diag(vLatSq) is exact tridiagonal!
  // Exact conserved symplectic energy:
  //   E_symp(t) = (1/2) * (||v||^2 + u(t)^T H u(t) - (dt^2 / 4) v^T H v)
  //   with v(t + dt/2) = (u(t + dt) - u(t)) / dt, u_mid = (u(t + dt) + u(t)) / 2?
  //   Equivalently in exact shadow-Hamiltonian form for leapfrog (u_n, v_{n+1/2}):
  //   E_symp = (1/2) * (v_{n+1/2}^T v_{n+1/2} + u_n^T H u_{n+1})  <-- EXACT discrete invariant!
  const applyHOrig = (x: Float64Array): Float64Array => {
    const y = new Float64Array(dim)
    for (let d = 0; d < dim; d++) {
      let s = (col.hVertDiag[d]! + lamProbe * col.vLatSq[d]!) * x[d]!
      if (d > 0) s += col.hVertOff[d - 1]! * x[d - 1]!
      if (d < col.floorF) s += col.hVertOff[d]! * x[d + 1]!
      y[d] = s
    }
    return y
  }

  let uPrev = new Float64Array(dim)
  const vHalfInit = new Float64Array(dim)
  for (let d = 0; d < dim; d++) {
    uPrev[d] = col.v0[d]! + 0.15 * Math.cos(0.9 * d + 0.2) / (1 + d)
    vHalfInit[d] = 0.05 * Math.sin(0.6 * d + 0.4) / (1 + d)
  }
  let uCurr = new Float64Array(dim)
  for (let d = 0; d < dim; d++) {
    uCurr[d] = uPrev[d]! + leapfrogDt * vHalfInit[d]!
  }

  const leapfrogInvariant = (u0: Float64Array, u1: Float64Array): number => {
    const hu1 = applyHOrig(u1)
    let vSq = 0
    let uHu = 0
    for (let d = 0; d < dim; d++) {
      const vd = (u1[d]! - u0[d]!) / leapfrogDt
      vSq += vd * vd
      uHu += u0[d]! * hu1[d]!
    }
    return 0.5 * (vSq + uHu)
  }

  const e0 = leapfrogInvariant(uPrev, uCurr)
  let leapfrogEnergyDrift100Steps = 0
  let leapfrogEnergyDrift600Steps = 0

  for (let step = 0; step < 600; step++) {
    const hu = applyHOrig(uCurr)
    const uNext = new Float64Array(dim)
    for (let d = 0; d < dim; d++) {
      uNext[d] = 2 * uCurr[d]! - uPrev[d]! - leapfrogDt * leapfrogDt * hu[d]!
    }
    uPrev = uCurr
    uCurr = uNext
    const eNow = leapfrogInvariant(uPrev, uCurr)
    const relDrift = Math.abs(eNow - e0) / Math.abs(e0)
    if (step < 100) {
      leapfrogEnergyDrift100Steps = Math.max(leapfrogEnergyDrift100Steps, relDrift)
    }
    leapfrogEnergyDrift600Steps = Math.max(leapfrogEnergyDrift600Steps, relDrift)
  }

  // Long-wavelength discrete-time phase speeds at small k = (kSmall, 0, 0)
  const lamSmall = 4 * Math.sin(kSmall / 2) ** 2
  const smallOps = buildUnitaryPair(lamSmall, leapfrogDt)
  // For U_warp(k) = exp(-i H_1st), eigenphase is theta_0 = omega_0
  const uWarpSpeedAtSmallK = smallOps.omega0 / kSmall
  // For U_leap(k), eigenphase is theta_leap = 2 * arcsin((dt / 2) * omega_0)
  const thetaLeap = 2 * Math.asin((leapfrogDt / 2) * smallOps.omega0)
  const leapfrogSpeedAtSmallK = thetaLeap / (leapfrogDt * kSmall)

  const uWarpSpeedRelErrVsUniversal =
    Math.abs(uWarpSpeedAtSmallK - col.cUniversal) / col.cUniversal
  const leapfrogSpeedRelErrVsUniversal =
    Math.abs(leapfrogSpeedAtSmallK - col.cUniversal) / col.cUniversal

  const staticStiffnessDiffVsEGrv0157 = Math.abs(col.kEffNeumann - col.kEffRiccatiDirichlet)
  const cSqMVsEGrv0157Diff = Math.abs(
    col.cUniversal * col.cUniversal * col.mEff - col.kEffRiccatiDirichlet,
  )

  return {
    probeK,
    uWarpUnitarityErr,
    uWarpNormDrift1Beat,
    uWarpNormDrift10Beats,
    uWarpNormDrift100Beats,
    uWarpNormDrift1000Beats,
    uWarpSpeedAtSmallK,
    uWarpSpeedRelErrVsUniversal,
    leapfrogDt,
    leapfrogMaxStabilityRatio,
    uLeapUnitarityErr,
    leapfrogEnergyDrift100Steps,
    leapfrogEnergyDrift600Steps,
    leapfrogSpeedAtSmallK,
    leapfrogSpeedRelErrVsUniversal,
    staticStiffnessDiffVsEGrv0157,
    cSqMVsEGrv0157Diff,
    strictlyCausal: col.cUniversal < 1,
  }
}

export type UniversalSpeedLockResult = {
  // Test 1: Decoupled negative control vs GW170817
  readonly kEffF16: number
  readonly kEffRiccatiF16: number
  readonly mEffF16: number
  readonly cGravWarpedAnalytical: number
  readonly cRawUnwarpedWeyl: number
  readonly decoupledMismatchFrac: number
  readonly decoupledViolationFactorVsGW170817: number
  readonly naiveLinearDiracSpeed: number
  readonly naiveLinearDiracMismatchFrac: number

  // Test 2: Shared warped-cusp column universality (F = 16 and floor check F = 12)
  readonly kSmall: number
  readonly directionsF16: readonly DirectionSpeciesResult[]
  readonly maxGravVsLightRelDiff: number
  readonly maxMatterVsLightRelDiff: number
  readonly maxGravVsMatterRelDiff: number
  readonly maxSpeciesRelDiff: number
  readonly gravIsotropySpread: number
  readonly lightIsotropySpread: number
  readonly matterIsotropySpread: number
  readonly maxIsotropySpread: number

  // Floor independence F = 12 vs F = 16
  readonly cUniversalF12: number
  readonly cUniversalF16: number
  readonly floorDiffGravF16VsF12: number
  readonly floorDiffLightF16VsF12: number
  readonly floorDiffMatterF16VsF12: number
  readonly maxFloorDiffF16VsF12: number

  // Horava extra-scalar check & depth-column integrity at k = 0
  readonly zeroModeCountF16: number
  readonly zeroModeMaxErrF16: number
  readonly mKKMinF16: number
  readonly mKKMaxF16: number
  readonly hVertDirectMaxDiffF16: number
  readonly qOrthoErrF16: number
  readonly hVertDiagErrF16: number

  // Worst-case operator & polarization integrity checks across all directions
  readonly maxGravDegeneracyErr: number
  readonly maxGravGaugeZeroEig: number
  readonly maxGravTTIdentityErr: number
  readonly maxGravTTPurityErr: number
  readonly maxLightDegeneracyErr: number
  readonly maxLightGaugeZeroEig: number
  readonly maxLightGaugeLongitudinalErr: number
  readonly maxLightTransversalityErr: number
  readonly maxMatterChiralSymErr: number
  readonly maxMatterSquareMatchErr: number
  readonly maxMatterHelicityErr: number

  // Control: aliased period = 2 torus comparison ([1, 10, 40, 200] -> K_eff = 1.031237, c_u = 0.986916)
  readonly period2TorusComparison: {
    readonly kEffF16: number
    readonly gEffF16: number
    readonly cUniversalF16: number
    readonly cUniversalRelShiftVsCanonical: number
  }

  // Test 3: Exact discrete-time unitary wave equation & symplectic leapfrog
  readonly unitaryCheck: UnitaryWaveCheckResult
}

export function runUniversalSpeedLock(): UniversalSpeedLockResult {
  const colF16 = buildWarpedColumnData(16)
  const colF12 = buildWarpedColumnData(12)
  const colPeriod2F16 = buildWarpedColumnData(16, true)
  const period2TorusComparison = {
    kEffF16: colPeriod2F16.kEffNeumann,
    gEffF16: 1 / (4 * Math.PI * colPeriod2F16.kEffNeumann),
    cUniversalF16: colPeriod2F16.cUniversal,
    cUniversalRelShiftVsCanonical:
      Math.abs(colPeriod2F16.cUniversal - colF16.cUniversal) / colF16.cUniversal,
  }

  // Test 1: Unwarped D = 0 husk Weyl fermion speed directly from E-SPN-0222 weylHuskStep2.
  // Use atan2(sin E, cos E) to avoid float64 acos(1 - x) cancellation near E = 0.
  const kSmall = 1e-5
  const vw = weylHuskStep2(kSmall, 0, 0)
  const cosE = 0.5 * (vw.re[0] + vw.re[3])
  const sinE = Math.hypot(vw.im[1], vw.re[1], vw.im[0])
  const cRawUnwarpedWeyl = Math.atan2(sinE, cosE) / kSmall

  const cGravWarpedAnalytical = colF16.cUniversal
  const decoupledMismatchFrac = Math.abs(cGravWarpedAnalytical / cRawUnwarpedWeyl - 1)
  const decoupledViolationFactorVsGW170817 = decoupledMismatchFrac / GW170817_BOUND

  // Bonus negative control: naive site-local linear velocity <v_0 | V_lat | v_0> (Cauchy-Schwarz gap)
  let naiveLinearDiracSpeed = 0
  for (let d = 0; d < colF16.dim; d++) {
    naiveLinearDiracSpeed += (colF16.mass[d]! * Math.sqrt(colF16.vLatSq[d]!)) / colF16.mEff
  }
  const naiveLinearDiracMismatchFrac =
    Math.abs(naiveLinearDiracSpeed - cGravWarpedAnalytical) / cGravWarpedAnalytical

  // Test 2: Shared warped-cusp column universality across (1,0,0), (1,1,0), (1,1,1) at F = 16
  const invSqrt2 = 1 / Math.SQRT2
  const invSqrt3 = 1 / Math.sqrt(3)
  const dirSpecs: readonly { readonly label: string; readonly k: readonly [number, number, number] }[] =
    [
      { label: '(1,0,0)', k: [kSmall, 0, 0] },
      { label: '(1,1,0)', k: [kSmall * invSqrt2, kSmall * invSqrt2, 0] },
      { label: '(1,1,1)', k: [kSmall * invSqrt3, kSmall * invSqrt3, kSmall * invSqrt3] },
    ]

  const directionsF16 = dirSpecs.map(d => solveAllThreeSpeciesAtK(colF16, d.label, d.k))
  const axisF12 = solveAllThreeSpeciesAtK(colF12, '(1,0,0)', [kSmall, 0, 0])
  const axisF16 = directionsF16[0]!

  const maxGravVsLightRelDiff = Math.max(...directionsF16.map(d => d.gravVsLightRelDiff))
  const maxMatterVsLightRelDiff = Math.max(...directionsF16.map(d => d.matterVsLightRelDiff))
  const maxGravVsMatterRelDiff = Math.max(...directionsF16.map(d => d.gravVsMatterRelDiff))
  const maxSpeciesRelDiff = Math.max(
    maxGravVsLightRelDiff,
    maxMatterVsLightRelDiff,
    maxGravVsMatterRelDiff,
  )

  const spreadOf = (vals: readonly number[]): number => {
    const lo = Math.min(...vals)
    const hi = Math.max(...vals)
    return (hi - lo) / lo
  }

  const gravIsotropySpread = spreadOf(directionsF16.map(d => d.cGrav))
  const lightIsotropySpread = spreadOf(directionsF16.map(d => d.cLight))
  const matterIsotropySpread = spreadOf(directionsF16.map(d => d.cMatter))
  const maxIsotropySpread = Math.max(gravIsotropySpread, lightIsotropySpread, matterIsotropySpread)

  const floorDiffGravF16VsF12 = Math.abs(axisF16.cGrav - axisF12.cGrav)
  const floorDiffLightF16VsF12 = Math.abs(axisF16.cLight - axisF12.cLight)
  const floorDiffMatterF16VsF12 = Math.abs(axisF16.cMatter - axisF12.cMatter)
  const maxFloorDiffF16VsF12 = Math.max(
    floorDiffGravF16VsF12,
    floorDiffLightF16VsF12,
    floorDiffMatterF16VsF12,
  )

  // Test 3: Exact discrete-time unitary wave equation & symplectic leapfrog
  const unitaryCheck = runUnitaryWaveChecks(colF16, kSmall)

  return {
    kEffF16: colF16.kEffNeumann,
    kEffRiccatiF16: colF16.kEffRiccatiDirichlet,
    mEffF16: colF16.mEff,
    cGravWarpedAnalytical,
    cRawUnwarpedWeyl,
    decoupledMismatchFrac,
    decoupledViolationFactorVsGW170817,
    naiveLinearDiracSpeed,
    naiveLinearDiracMismatchFrac,
    kSmall,
    directionsF16,
    maxGravVsLightRelDiff,
    maxMatterVsLightRelDiff,
    maxGravVsMatterRelDiff,
    maxSpeciesRelDiff,
    gravIsotropySpread,
    lightIsotropySpread,
    matterIsotropySpread,
    maxIsotropySpread,
    cUniversalF12: colF12.cUniversal,
    cUniversalF16: colF16.cUniversal,
    floorDiffGravF16VsF12,
    floorDiffLightF16VsF12,
    floorDiffMatterF16VsF12,
    maxFloorDiffF16VsF12,
    zeroModeCountF16: colF16.zeroModeCount,
    zeroModeMaxErrF16: colF16.zeroModeMaxErr,
    mKKMinF16: colF16.mKKMin,
    mKKMaxF16: colF16.mKKMax,
    hVertDirectMaxDiffF16: colF16.hVertDirectMaxDiff,
    qOrthoErrF16: colF16.qOrthoErr,
    hVertDiagErrF16: colF16.hVertDiagErr,
    maxGravDegeneracyErr: Math.max(...directionsF16.map(d => d.gravDegeneracyErr)),
    maxGravGaugeZeroEig: Math.max(...directionsF16.map(d => d.gravGaugeZeroEigMax)),
    maxGravTTIdentityErr: Math.max(...directionsF16.map(d => d.gravTTIdentityErr)),
    maxGravTTPurityErr: Math.max(...directionsF16.map(d => d.gravTTPurityErr)),
    maxLightDegeneracyErr: Math.max(...directionsF16.map(d => d.lightDegeneracyErr)),
    maxLightGaugeZeroEig: Math.max(...directionsF16.map(d => d.lightGaugeZeroEig)),
    maxLightGaugeLongitudinalErr: Math.max(...directionsF16.map(d => d.lightGaugeLongitudinalErr)),
    maxLightTransversalityErr: Math.max(...directionsF16.map(d => d.lightTransversalityErr)),
    maxMatterChiralSymErr: Math.max(...directionsF16.map(d => d.matterChiralSymErr)),
    maxMatterSquareMatchErr: Math.max(...directionsF16.map(d => d.matterSquareMatchErr)),
    maxMatterHelicityErr: Math.max(...directionsF16.map(d => d.matterHelicityErr)),
    period2TorusComparison,
    unitaryCheck,
  }
}
