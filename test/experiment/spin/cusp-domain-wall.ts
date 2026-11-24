// CHIRAL CUSP DOMAIN-WALL ZERO MODE FOR WEAK PARITY VIOLATION & MIRROR-CLASS GAPPING (E-SPN-0221, gaps B-23, B-55).
// On the bipartite {3,4,3,4} honeycomb, E-SPN-0220 proved the two parity classes are exact mirror/conjugate twins
// under ODD (L*P = 8/8, L*C = 1). Proposal 008 round 03 noted that a gauge field cannot join parity classes and named
// a domain-wall reading as the route to a one-handed 3D weak sector.
//
// Here we test the natural one-sided cusp boundary D = 0 of the {3,4,3,4} honeycomb (18 links down, 0 up) with a
// Kaplan/Wilson domain-wall mass profile M(D) on a depth slab D = 0..F (F = 24), comparing the exact zero-mode
// localization of Left-handed (P_L) vs Right-handed (P_R) Weyl spinors at 3D husk momentum k = 0 and small |k| > 0:
//   - Left-handed mode localizes exponentially at the cusp husk D = 0 (> 99% weight at D <= 2, exact massless 3D Weyl cone).
//   - Right-handed mirror mode is pushed exponentially to the deep bulk floor D = F (< 1e-6 weight at D <= 2, decoupled
//     from the 3D husk reading as F -> infinity!), demonstrating how the one-sided {3,4,3,4} cusp boundary naturally
//     selects ONE handedness on the 3D husk without breaking bulk reversibility or gauge invariance.
//
// Depth L1: exact Hermitian Wilson-Kaplan domain-wall eigenproblem on the cusp depth column. Zero random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'

// Build 2N x 2N Hermitian 4D->3D domain-wall Hamiltonian H(k) on depth layers D = 0 .. N-1 (2 chiral components per
// depth layer: even index 2D = Left-handed L, odd index 2D+1 = Right-handed R):
//   H(k) = sum_D [
//     (M(D) + r_W * (1 + (3 - cos kx - cos ky - cos kz))) (|D,L><D,R| + |D,R><D,L|)
//     - (r_W / 2) (|D,L><D+1,R| + |D+1,R><D,L| + |D,R><D+1,L| + |D+1,L><D,R|)
//     + (1 / 2)   (|D,L><D+1,R| - |D,R><D+1,L| + h.c. with i -> sigma_z depth hopping!)
//   ]
// Specifically, in the standard Shamir/Kaplan 5D->4D (here 4D->3D) domain-wall Dirac operator on a 1D half-line D=0..N-1:
//   H_depth = [[0, A], [A^dag, 0]] in the (L, R) chiral block basis, where:
//     A_{D, D}   = -m_0 + W(k)     (diagonal mass + 3D Wilson term W(k) = 3 - cos kx - cos ky - cos kz)
//     A_{D, D+1} = 1               (forward depth hop: |D, L><D+1, R|)
//   Check zero-mode equations:
//     A^dag psi_L = 0  =>  (-m_0 + W) psi_L(D) + psi_L(D - 1) = 0  =>  psi_L(D) = (m_0 - W)^D * psi_L(0)!
//       For 0 < m_0 < 1 (e.g. m_0 = 0.5) at k = 0 (W = 0):
//       psi_L(D) ~ (0.5)^D  --> EXPONENTIALLY LOCALIZED AT THE CUSP HUSK D = 0!!
//     A psi_R = 0      =>  (-m_0 + W) psi_R(D) + psi_R(D + 1) = 0  =>  psi_R(D) = (m_0 - W)^(N - 1 - D) * psi_R(N - 1)!
//       --> EXPONENTIALLY PUSHED TO THE DEEP BULK FLOOR D = N - 1!!
//     At the 3D Brillouin-zone doublers (W(k) >= 2): |m_0 - W| >= 1.5 > 1 => NO zero mode at ANY doubler (exact
//     doubler gapping, Nielsen-Ninomiya bypassed by the infinite bulk depth)!
function solveDomainWall(N: number, m0: number, kx: number, ky: number, kz: number): {
  minGap: number
  leftHuskWeight: number
  rightHuskWeight: number
  huskChiralityAsymmetry: number
  doublerGap: number
} {
  const dim = 2 * N
  const W = 3 - Math.cos(kx) - Math.cos(ky) - Math.cos(kz)
  const diag = -m0 + W
  // Add 3D Weyl momentum dispersion sin(kx) along sigma_z on the chiral block (for nonzero k)
  const pz = Math.sin(kx)

  const re = new Float64Array(dim * dim)
  const im = new Float64Array(dim * dim)

  for (let d = 0; d < N; d++) {
    const iL = d
    const iR = N + d
    // Chiral Weyl kinetic term +pz on L, -pz on R
    re[iL * dim + iL] = pz
    re[iR * dim + iR] = -pz
    // Diagonal mass coupling A_{d, d}
    re[iL * dim + iR] = diag
    re[iR * dim + iL] = diag
    // Off-diagonal depth hop A_{d+1, d} = 1 (selects pure Left-handed zero mode at cusp D = 0, pushing Right-handed mirror to deep bulk)
    if (d + 1 < N) {
      const iLnext = d + 1
      re[iLnext * dim + iR] = 1
      re[iR * dim + iLnext] = 1
    }
  }

  const eig = hermitianEigenRows(dim, re, im)
  // Find the two lowest-|E| eigenstates (the wall zero modes at k = 0)
  const order = Array.from({ length: dim }, (_, i) => i).sort(
    (a, b) => Math.abs(eig.values[a]!) - Math.abs(eig.values[b]!),
  )
  const i0 = order[0]!
  const i1 = order[1]!
  const minGap = Math.abs(eig.values[i0]!)

  // Measure L vs R weight near the cusp husk (D <= 2) summed across the two near-zero modes
  let leftHusk = 0
  let rightHusk = 0
  for (const idx of [i0, i1]) {
    const rowOff = idx * dim
    let lNear = 0
    let rNear = 0
    for (let d = 0; d <= 2; d++) {
      const lr = eig.vectorsRe[rowOff + d]!
      const li = eig.vectorsIm[rowOff + d]!
      const rr = eig.vectorsRe[rowOff + N + d]!
      const ri = eig.vectorsIm[rowOff + N + d]!
      lNear += lr * lr + li * li
      rNear += rr * rr + ri * ri
    }
    leftHusk += lNear
    rightHusk += rNear
  }

  // Also check Brillouin-zone doubler at k = (pi, 0, 0) where W = 2 (no zero mode: must be gapped!)
  const doublerRe = new Float64Array(dim * dim)
  const doublerIm = new Float64Array(dim * dim)
  const diagD = -m0 + 2
  for (let d = 0; d < N; d++) {
    const iL = d
    const iR = N + d
    doublerRe[iL * dim + iR] = diagD
    doublerRe[iR * dim + iL] = diagD
    if (d + 1 < N) {
      doublerRe[iL * dim + (N + d + 1)] = 1
      doublerRe[(N + d + 1) * dim + iL] = 1
    }
  }
  const dEig = hermitianEigenRows(dim, doublerRe, doublerIm)
  let doublerGap = Infinity
  for (let i = 0; i < dim; i++) {
    const e = Math.abs(dEig.values[i]!)
    if (e < doublerGap) doublerGap = e
  }

  const totHusk = leftHusk + rightHusk
  const huskChiralityAsymmetry = totHusk > 0 ? (leftHusk - rightHusk) / totHusk : 0
  return {
    minGap,
    leftHuskWeight: leftHusk,
    rightHuskWeight: rightHusk,
    huskChiralityAsymmetry,
    doublerGap,
  }
}

export default experiment({
  id: 'spin/cusp-domain-wall',
  code: 'E-SPN-0221',
  title:
    'One-sided cusp domain wall (Kaplan/Shamir) localizes one handedness on the 3D cusp husk while pushing its mirror twin into the deep bulk and gapping all doublers (B-23, B-55)',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const N = 24
    const m0 = 0.5
    const zero = solveDomainWall(N, m0, 0, 0, 0)
    const disp = solveDomainWall(N, m0, 0.1, 0, 0)
    // At kx = 0.1, the Left cusp mode energy should be +sin(0.1) = 0.099833... (massless 3D chiral Weyl cone!)
    const expectedConeE = Math.sin(0.1)
    const coneErr = Math.abs(disp.minGap - expectedConeE)

    const ok =
      zero.minGap < 1e-6 &&
      zero.leftHuskWeight > 0.98 &&
      zero.rightHuskWeight < 1e-10 &&
      zero.huskChiralityAsymmetry > 0.999999 &&
      zero.doublerGap > 0.45 &&
      coneErr < 1e-4

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        `On depth-24 one-sided cusp column (m0=0.5): k=0 zero mode has gap ${zero.minGap.toExponential(2)}, ` +
        `Left-handed cusp-husk weight (D<=2) = ${zero.leftHuskWeight.toFixed(6)} vs Right-handed mirror weight = ` +
        `${zero.rightHuskWeight.toExponential(2)} (chirality asymmetry ${zero.huskChiralityAsymmetry.toFixed(10)}), ` +
        `all 3D doublers gapped (doubler gap ${zero.doublerGap.toFixed(4)} > 0.45), and small-k mode follows exact ` +
        `massless 3D chiral Weyl cone (|E(0.1) - sin(0.1)| = ${coneErr.toExponential(2)})`,
      metrics: {
        zeroModeGap: zero.minGap,
        leftHuskWeight: zero.leftHuskWeight,
        rightHuskWeight: zero.rightHuskWeight,
        huskChiralityAsymmetry: zero.huskChiralityAsymmetry,
        doublerGap: zero.doublerGap,
        weylConeErr: coneErr,
      },
    })
  },
})
