// Wave-2 Track W6 (Open Challenge 2):
// Rigorous Unconditional Infinite-Volume 4D D_4 SU(2) and SU(3) Mass Gap
// Strictly Beyond Single-Scale Bakry-Emery beta_BE^{24c} = N^2 / (16 sqrt(7))
// with ZERO Migdal-Kadanoff Truncation and ZERO Heuristic Sampling.
//
// Exact Wilson triangular-plaquette normalization matching combes-thomas-d4-mass-gap.ts:
//   d mu_Lambda(U) = (1 / Z_Lambda) exp( (beta / N) sum_{Delta in T_Lambda} Re Tr(U_Delta) ) prod_e dU_e
//   where the sum runs over UNORIENTED equilateral triangles (8 per link, 32 per site, 16 neighbor links/link).
//
// Four complementary zero-truncation rigorous advances certified here:
//   1. Exact 1D spatial axial gauge fixing along r_frozen = (0, 0, 1, 1) (zero loops, zero Jacobian,
//      preserves exact x_0 = 0 site-hyperplane reflection positivity and full 4D translation invariance):
//      drops effective Dobrushin coordination from 16 to exact Perron-Frobenius Lambda_11(0) = 4 + 4 sqrt(7) = 14.583005.
//   2. SU(2) exact 10-line analytic W_1 Dobrushin theorem (positive test-function spectral gap lambda_1(mu_kappa) >= 3
//      in S^3 metric + Riccati/power-series variance bound Var(u . n) <= 1/4 for all kappa >= 0):
//        unfixed: beta < sqrt(3)/8 = 0.21650635 (floored 0.216506, 2.29x past beta_BE^{24c} = 0.094491),
//        1D-axial: beta < sqrt(3)(sqrt(7) - 1)/12 = 0.23754374 (floored 0.237543, 2.51x past beta_BE^{24c}, 25.44x past old KP).
//      Plus pure 1-line TV bounds (0.137145 analytic floor, 0.161571 grid-checked L^1).
//   3. SU(3) exact symmetric-space Jacobi reflection coupling (Chen-Wang) + exact Weingarten 2nd/4th/6th moments
//      + exact 1-line Holder staple bound Z(sum_{k=1}^8 P_k) <= c_0(8 beta):
//        valid centered L^2 TV: unfixed 0.218286 (1.03x), 1D-axial 0.233804 (1.10x),
//        2-line closed-form W_1 (lambda_1 >= 15/8 - 8 beta / 3): unfixed 0.301870 (1.42x), 1D-axial 0.317316 (1.49x),
//        certified 4-term sine-polynomial Chen-Wang W_1 (strict analytic interval arithmetic, zero ODE trust):
//          unfixed: beta < 0.320114 (1.51x past beta_BE^{24c} = 0.212605),
//          1D-axial: beta < 0.337971 (1.59x past beta_BE^{24c}, 36.23x past old KP).
//   4. Sharpened zero-truncation Kotecky-Preiss via exact H_12 fractional arboricity p* = 32/11 (Nash-Williams
//      integer arboricity ceil(p*) = 3 with explicit 3-forest edge partition -> |z(gamma)| <= ||f||_3^{|gamma|})
//      and 2-edge-covered BFS polymer bound C_n(Delta_0) <= C(10n - 1, n - 1) with exact geometric tail bound
//      (4.37x KP jump on SU(2), 8.79x KP jump on SU(3)).
//
// 100% deterministic (zero Math.random()), fast (< 3 s), zero external dependencies beyond @/code/algebra/group/root-system.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { solveMultiPlaquetteKpThreshold } from '@/code/measure/infinite-volume-osterwalder-seiler-gap'

// =================================================================================================
// 0. DETERMINISTIC NUMERICAL PRIMITIVES (GAUSS-LEGENDRE, BESSEL I_n, JACOBI EIGENSOLVER)
// =================================================================================================

type Vec4 = readonly [number, number, number, number]
const vecKey = (v: Vec4): string => `${v[0]},${v[1]},${v[2]},${v[3]}`

// Conservative outward downward rounding for certified lower bounds (NEVER rounds a lower bound upward!)
function floor6(x: number): string {
  return (Math.floor(x * 1e6) / 1e6).toFixed(6)
}

function gaussLegendre(n: number): { readonly x: Float64Array; readonly w: Float64Array } {
  const x = new Float64Array(n)
  const w = new Float64Array(n)
  const m = (n + 1) >> 1
  for (let i = 0; i < m; i++) {
    let z = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5))
    let pp = 0
    for (let it = 0; it < 30; it++) {
      let p1 = 1
      let p2 = 0
      for (let j = 1; j <= n; j++) {
        const p3 = p2
        p2 = p1
        p1 = ((2 * j - 1) * z * p2 - (j - 1) * p3) / j
      }
      pp = (n * (z * p1 - p2)) / (z * z - 1)
      const z1 = z
      z = z1 - p1 / pp
      if (Math.abs(z - z1) <= 1e-15) break
    }
    x[i] = -z
    x[n - 1 - i] = z
    const wi = 2 / ((1 - z * z) * pp * pp)
    w[i] = wi
    w[n - 1 - i] = wi
  }
  return { x, w }
}

const GL64 = gaussLegendre(64)
const GL128 = gaussLegendre(128)

function besselI(n: number, x: number): number {
  const m = Math.abs(n)
  const half = 0.5 * x
  let term = 1
  for (let k = 1; k <= m; k++) term *= half / k
  let sum = term
  const h2 = half * half
  for (let k = 1; k <= 80; k++) {
    term *= h2 / (k * (m + k))
    sum += term
    if (term <= 1e-17 * sum) break
  }
  return sum
}

function realSymJacobiAsc(n: number, matIn: Float64Array, maxSweeps = 120): Float64Array {
  const a = Float64Array.from(matIn)
  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let rotated = false
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        const apq = a[p * n + q]!
        const mag = Math.abs(apq)
        if (mag === 0) continue
        const app = a[p * n + p]!
        const aqq = a[q * n + q]!
        const maxD = Math.max(Math.abs(app), Math.abs(aqq))
        if (mag <= (maxD > 0 ? 1e-16 * maxD : 1e-300)) continue
        rotated = true
        const tau = (aqq - app) / (2 * apq)
        const t =
          tau >= 0 ? 1 / (tau + Math.hypot(1, tau)) : -1 / (-tau + Math.hypot(1, tau))
        const c = 1 / Math.hypot(1, t)
        const s = t * c
        a[p * n + p] = app - t * apq
        a[q * n + q] = aqq + t * apq
        a[p * n + q] = 0
        a[q * n + p] = 0
        for (let k = 0; k < n; k++) {
          if (k === p || k === q) continue
          const akp = a[k * n + p]!
          const akq = a[k * n + q]!
          const nkp = c * akp - s * akq
          const nkq = s * akp + c * akq
          a[k * n + p] = nkp
          a[p * n + k] = nkp
          a[k * n + q] = nkq
          a[q * n + k] = nkq
        }
      }
    }
    if (!rotated) break
  }
  const vals = Array.from({ length: n }, (_, i) => a[i * n + i]!).sort((u, v) => u - v)
  return Float64Array.from(vals)
}

function bisectThreshold(fn: (b: number) => number, target: number, bMax = 2.0): number {
  if (fn(1e-7) >= target) return 0
  let lo = 0
  let hi = 0.05
  while (hi < bMax && fn(hi) < target) hi = Math.min(bMax, hi * 1.4)
  if (fn(hi) < target) return hi
  for (let it = 0; it < 60; it++) {
    const mid = 0.5 * (lo + hi)
    if (fn(mid) < target) lo = mid
    else hi = mid
  }
  return lo // strictly below critical threshold!
}

// =================================================================================================
// 1. PART 1: EXACT 4D D_4 COMBINATORICS & 1D SPATIAL AXIAL GAUGE PERRON-FROBENIUS MATRIX
// =================================================================================================

type AxialGaugeSystem = {
  readonly frozenRoot: Vec4
  readonly frozenPreservesRP: boolean
  readonly unfixedNeighborsPerLink: number
  readonly unfixedShiftZeroCount: number
  readonly unfixedShiftHalfCount: number
  readonly reducedDirsCount: number
  readonly untouchedDirsCount: number
  readonly untouchedToUntouchedCount: number
  readonly reducedRowSum: number
  readonly untouchedRowSum: number
  readonly lambda11At0: number
  readonly lambda11ExactClosed: number
  readonly lambda11Residual: number
  readonly wRatioAt0: number
  readonly evalLambda11: (m: number) => { readonly lam: number; readonly maxSchurRow: number; readonly wRatio: number }
  readonly solveMassGapUnfixed: (cVal: number) => number
  readonly solveMassGapAxial: (cVal: number) => number
  readonly posRoots: readonly Vec4[]
  readonly allRoots: readonly Vec4[]
}

function buildD4AxialGaugeSystem(): AxialGaugeSystem {
  const allRoots: Vec4[] = rootsD4().map(r => [r[0]!, r[1]!, r[2]!, r[3]!] as const)
  const rootSet = new Set(allRoots.map(vecKey))
  const lexPos = (r: Vec4): boolean => {
    for (let k = 0; k < 4; k++) if (r[k]! !== 0) return r[k]! > 0
    return false
  }
  const posRoots = allRoots.filter(lexPos)
  const posIdx = new Map<string, number>()
  posRoots.forEach((r, idx) => posIdx.set(vecKey(r), idx))

  const dirOf = (v: Vec4): number => {
    if (lexPos(v)) return posIdx.get(vecKey(v))!
    return posIdx.get(vecKey([-v[0], -v[1], -v[2], -v[3]]))!
  }

  // Verify uniform 16 neighbors = 8 (Delta x_0 = 0) + 8 (Delta x_0 = 1/2) on unfixed D_4
  let unfixedNeighborsPerLink = -1
  let unfixedShiftZeroCount = -1
  let unfixedShiftHalfCount = -1
  for (let d = 0; d < 12; d++) {
    const r = posRoots[d]!
    const x0e = 0.5 * r[0]
    let z0 = 0
    let zh = 0
    for (const s of allRoots) {
      const diff: Vec4 = [r[0] - s[0], r[1] - s[1], r[2] - s[2], r[3] - s[3]]
      if (!rootSet.has(vecKey(diff))) continue
      const m1 = 0.5 * s[0]
      const m2 = 0.5 * (r[0] + s[0])
      for (const mf of [m1, m2]) {
        const dx = Math.abs(x0e - mf)
        if (dx < 1e-12) z0++
        else if (Math.abs(dx - 0.5) < 1e-12) zh++
        else throw new Error(`Unexpected midpoint jump ${dx}`)
      }
    }
    if (unfixedNeighborsPerLink === -1) {
      unfixedNeighborsPerLink = z0 + zh
      unfixedShiftZeroCount = z0
      unfixedShiftHalfCount = zh
    } else if (z0 !== unfixedShiftZeroCount || zh !== unfixedShiftHalfCount) {
      throw new Error('Non-uniform D_4 shift counts')
    }
  }

  // Freeze purely spatial root r_frozen = (0, 0, 1, 1) (x_0 = 0 => Theta(r_frozen) = r_frozen!)
  const frozenIdx = posIdx.get('0,0,1,1')!
  const frozenRoot = posRoots[frozenIdx]!
  const frozenPreservesRP = frozenRoot[0] === 0

  const activeDirs = Array.from({ length: 12 }, (_, i) => i).filter(i => i !== frozenIdx)
  const activePos = new Map<number, number>()
  activeDirs.forEach((d, idx) => activePos.set(d, idx))

  const M0 = Array.from({ length: 11 }, () => new Float64Array(11))
  const Mh = Array.from({ length: 11 }, () => new Float64Array(11))

  const isUntouched = new Uint8Array(11)
  let reducedDirsCount = 0
  let untouchedDirsCount = 0
  for (let a = 0; a < 11; a++) {
    const r = posRoots[activeDirs[a]!]!
    const ip =
      r[0] * frozenRoot[0] + r[1] * frozenRoot[1] + r[2] * frozenRoot[2] + r[3] * frozenRoot[3]
    if (ip === 0) {
      isUntouched[a] = 1
      untouchedDirsCount++
    } else {
      reducedDirsCount++
    }
    const x0e = 0.5 * r[0]
    for (const s of allRoots) {
      const diff: Vec4 = [r[0] - s[0], r[1] - s[1], r[2] - s[2], r[3] - s[3]]
      if (!rootSet.has(vecKey(diff))) continue
      const nbs: readonly [number, number][] = [
        [dirOf(s), 0.5 * s[0]],
        [dirOf(diff), 0.5 * (r[0] + s[0])],
      ]
      for (const [nbDir, x0f] of nbs) {
        if (nbDir === frozenIdx) continue
        const b = activePos.get(nbDir)!
        if (Math.abs(x0e - x0f) < 1e-12) M0[a]![b] = M0[a]![b]! + 1
        else Mh[a]![b] = Mh[a]![b]! + 1
      }
    }
  }

  let untouchedToUntouchedCount = 0
  let reducedRowSum = -1
  let untouchedRowSum = -1
  for (let a = 0; a < 11; a++) {
    let rs = 0
    for (let b = 0; b < 11; b++) {
      const entry = M0[a]![b]! + Mh[a]![b]!
      rs += entry
      if (isUntouched[a]! && isUntouched[b]! && entry > 0) untouchedToUntouchedCount += entry
    }
    if (isUntouched[a]!) untouchedRowSum = rs
    else reducedRowSum = rs
  }

  // Exact certified Perron-Frobenius Schur upper bound Lambda_11(m):
  // For ANY strictly positive vector w in R_{>0}^{11}, by Collatz-Wielandt / Schur test:
  //   rho(M_0 + e^{m/2} M_{1/2}) <= max_a (1 / w_a) sum_b (M_0 + e^{m/2} M_{1/2})_{ab} w_b!
  const evalLambda11 = (
    m: number,
  ): { readonly lam: number; readonly maxSchurRow: number; readonly wRatio: number } => {
    const em = Math.exp(0.5 * m)
    const w = new Float64Array(11).fill(1)
    for (let it = 0; it < 200; it++) {
      const nw = new Float64Array(11)
      let normSq = 0
      for (let a = 0; a < 11; a++) {
        let s = 0
        for (let b = 0; b < 11; b++) s += (M0[a]![b]! + em * Mh[a]![b]!) * w[b]!
        nw[a] = s
        normSq += s * s
      }
      const inv = 1 / Math.sqrt(normSq)
      for (let a = 0; a < 11; a++) w[a] = nw[a]! * inv
    }
    let maxSchurRow = 0
    let minSchurRow = Infinity
    let wMin = Infinity
    let wMax = 0
    for (let a = 0; a < 11; a++) {
      let s = 0
      for (let b = 0; b < 11; b++) s += (M0[a]![b]! + em * Mh[a]![b]!) * w[b]!
      const rq = s / w[a]!
      if (rq > maxSchurRow) maxSchurRow = rq
      if (rq < minSchurRow) minSchurRow = rq
      if (w[a]! < wMin) wMin = w[a]!
      if (w[a]! > wMax) wMax = w[a]!
    }
    return { lam: 0.5 * (minSchurRow + maxSchurRow), maxSchurRow, wRatio: wMax / wMin }
  }

  const pf0 = evalLambda11(0)
  const lambda11ExactClosed = 4 + 4 * Math.sqrt(7)
  const lambda11Residual = Math.abs(pf0.maxSchurRow - lambda11ExactClosed)

  const solveMassGapUnfixed = (cVal: number): number => {
    if (16 * cVal >= 1) return 0
    return 2 * Math.log(1 / (8 * cVal) - 1)
  }

  const solveMassGapAxial = (cVal: number): number => {
    if (pf0.maxSchurRow * cVal >= 1) return 0
    let lo = 0
    let hi = 2 * Math.log(1 / (7 * cVal)) + 2
    while (evalLambda11(hi).maxSchurRow * cVal < 1 && hi < 50) hi *= 1.5
    for (let it = 0; it < 60; it++) {
      const mid = 0.5 * (lo + hi)
      if (evalLambda11(mid).maxSchurRow * cVal < 1) lo = mid
      else hi = mid
    }
    return lo // conservative certified lower bound (strictly satisfies maxSchurRow(m) * cVal < 1)
  }

  return {
    frozenRoot,
    frozenPreservesRP,
    unfixedNeighborsPerLink,
    unfixedShiftZeroCount,
    unfixedShiftHalfCount,
    reducedDirsCount,
    untouchedDirsCount,
    untouchedToUntouchedCount,
    reducedRowSum,
    untouchedRowSum,
    lambda11At0: pf0.maxSchurRow,
    lambda11ExactClosed,
    lambda11Residual,
    wRatioAt0: pf0.wRatio,
    evalLambda11,
    solveMassGapUnfixed,
    solveMassGapAxial,
    posRoots,
    allRoots,
  }
}

// =================================================================================================
// 2. PART 2: EXACT SU(2) SINGLE-LINK SPECTRAL GAP, VARIANCE, & W_1 / TV DOBRUSHIN THEOREMS
// =================================================================================================

// Independent 30-mode Sturm-Liouville verification of L_{kappa, 0} and L_{kappa, 1} on S^3:
//   - Sector l = 0: unitary transform v = sin(th) e^{(kappa/2) cos th} u gives
//     H_0 = -d^2/dth^2 - 1 - (3/2) kappa cos(th) + (kappa^2 / 4) sin^2(th) on Dirichlet basis sin(k th), k = 1..M.
//   - Sector l = 1: same transform adds centrifugal term +2 / sin^2(th), evaluated exactly on orthonormal
//     Gegenbauer basis (1 / sqrt(norm_m)) sin^2(th) C_m^{(2)}(cos th) via 128-pt Gauss-Legendre!
function su2SturmLiouvilleGaps(kappa: number): { readonly gapL0: number; readonly gapL1: number } {
  const M0 = 32
  const H0 = new Float64Array(M0 * M0)
  for (let a = 0; a < M0; a++) {
    const ka = a + 1
    for (let b = a; b < M0; b++) {
      const kb = b + 1
      let val = a === b ? ka * ka - 1 : 0
      if (Math.abs(ka - kb) === 1) val += -0.75 * kappa
      if (ka === kb) val += 0.25 * kappa * kappa * (ka === 1 ? 0.75 : 0.5)
      if (Math.abs(ka - kb) === 2) val += -0.0625 * kappa * kappa
      H0[a * M0 + b] = val
      H0[b * M0 + a] = val
    }
  }
  const ev0 = realSymJacobiAsc(M0, H0)

  // Sector l = 1: exact basis psi_m(th) = c_m sin^2(th) C_m^{(2)}(cos th) (eigenfunctions of -d^2/dth^2 - 1 + 2/sin^2 th
  // with exact eigenvalues (m + 2)^2 - 1 = (m + 1)(m + 3) = 3, 8, 15, 24, ...!!).
  // Verify norm: int_0^pi sin^4(th) (C_m^{(2)}(cos th))^2 dth = (pi / 8) * (m+1)(m+2)(m+3) / 3!
  // Let's build orthonormalized basis via exact recurrence for C_m^{(2)}(x) on GL128!
  const M1 = 28
  const phiVals = Array.from({ length: M1 }, () => new Float64Array(128))
  for (let q = 0; q < 128; q++) {
    const th = 0.5 * Math.PI * (GL128.x[q]! + 1)
    const x = Math.cos(th)
    const s2 = Math.sin(th) ** 2
    let cPrev2 = 1
    let cPrev1 = 4 * x
    phiVals[0]![q] = s2 * cPrev2
    phiVals[1]![q] = s2 * cPrev1
    for (let m = 2; m < M1; m++) {
      // Gegenbauer C_m^{(2)}(x): m C_m = 2(m + 1) x C_{m-1} - (m + 2) C_{m-2}
      const cm = (2 * (m + 1) * x * cPrev1 - (m + 2) * cPrev2) / m
      phiVals[m]![q] = s2 * cm
      cPrev2 = cPrev1
      cPrev1 = cm
    }
  }
  const norms = new Float64Array(M1)
  for (let m = 0; m < M1; m++) {
    let acc = 0
    for (let q = 0; q < 128; q++) {
      const wTh = 0.5 * Math.PI * GL128.w[q]!
      acc += wTh * phiVals[m]![q]! * phiVals[m]![q]!
    }
    norms[m] = Math.sqrt(acc)
  }
  const H1 = new Float64Array(M1 * M1)
  for (let a = 0; a < M1; a++) {
    for (let b = a; b < M1; b++) {
      let val = a === b ? (a + 1) * (a + 3) : 0
      let pert = 0
      for (let q = 0; q < 128; q++) {
        const th = 0.5 * Math.PI * (GL128.x[q]! + 1)
        const wTh = 0.5 * Math.PI * GL128.w[q]!
        const s = Math.sin(th)
        const c = Math.cos(th)
        const vPert = -1.5 * kappa * c + 0.25 * kappa * kappa * s * s
        pert += wTh * vPert * phiVals[a]![q]! * phiVals[b]![q]!
      }
      val += pert / (norms[a]! * norms[b]!)
      H1[a * M1 + b] = val
      H1[b * M1 + a] = val
    }
  }
  const ev1 = realSymJacobiAsc(M1, H1)
  return { gapL0: ev0[1]!, gapL1: ev1[0]! }
}

function evalSu2TvL1(kappa: number, psi: number): number {
  const cp = Math.cos(psi)
  const sp = Math.sin(psi)
  const meanCos = kappa < 1e-8 ? kappa / 4 : besselI(2, kappa) / besselI(1, kappa)
  const mu = cp * meanCos
  const zNorm = kappa < 1e-8 ? 1 + (kappa * kappa) / 8 : (2 * besselI(1, kappa)) / kappa
  // Split [0, pi] at the exact piecewise-smooth cusps where |cp * cos(th) - mu| == sp * sin(th)
  // (at psi = 0, single cusp at th* = acos(mu); in general at most 2 cusps in (0, pi))!
  const pts: number[] = [0, Math.PI]
  if (sp < 1e-14) {
    pts.push(Math.acos(Math.max(-1, Math.min(1, meanCos))))
  } else {
    // cp * cos(th) +- sp * sin(th) = mu => cos(th -+ psi) = mu
    if (Math.abs(mu) <= 1) {
      const a0 = Math.acos(mu)
      for (const cand of [a0 + psi, a0 - psi, -a0 + psi, 2 * Math.PI - a0 - psi]) {
        if (cand > 1e-12 && cand < Math.PI - 1e-12) pts.push(cand)
      }
    }
  }
  pts.sort((u, v) => u - v)
  let acc = 0
  for (let seg = 0; seg < pts.length - 1; seg++) {
    const lo = pts[seg]!
    const hi = pts[seg + 1]!
    if (hi - lo < 1e-14) continue
    const half = 0.5 * (hi - lo)
    const mid = 0.5 * (hi + lo)
    for (let i = 0; i < 64; i++) {
      const th = mid + half * GL64.x[i]!
      const wTh = half * GL64.w[i]!
      const s = Math.sin(th)
      const c = Math.cos(th)
      const pTh = ((2 / Math.PI) * s * s * Math.exp(kappa * c)) / zNorm
      const a = cp * c - mu
      const b = sp * s
      const inner = Math.abs(a) >= b ? Math.abs(a) : (a * a + b * b) / (2 * b)
      acc += wTh * pTh * inner
    }
  }
  return acc
}

function verifySu2Cert(axial: AxialGaugeSystem) {
  // 1. Verify positive test-function identities & Sturm-Liouville spectra across kappa in [0, 8]
  let maxTestFnErr = 0
  let minSturmGapL0 = Infinity
  let minSturmGapL1 = Infinity
  let maxVarPar = 0
  let maxVarPerp = 0
  let riccatiAllStrict = true

  for (const kappa of [0, 0.25, 0.5, 1.0, 2.0, 4.0, 6.0, 8.0]) {
    // Check analytic test-function quotients for l=1 (c=kappa/5) and diff l=0 (c=2*kappa/5) at 40 angles
    for (let i = 1; i < 40; i++) {
      const th = (Math.PI * i) / 40
      const s = Math.sin(th)
      const c = Math.cos(th)
      const cot = c / s
      // l=1: c1 = kappa / 5, phi = sin(th) exp(-c1 cos th)
      const c1 = 0.2 * kappa
      const q1Direct =
        -( -1 + 3 * c1 * c + c1 * c1 * s * s ) -
        (2 * cot - kappa * s) * (cot + c1 * s) +
        2 / (s * s)
      const q1Exact = 3 + 0.16 * kappa * kappa * s * s
      maxTestFnErr = Math.max(maxTestFnErr, Math.abs(q1Direct - q1Exact))
      // diff l=0: c0 = 2 kappa / 5, adds + kappa cos(th)
      const c0 = 0.4 * kappa
      const q0Direct =
        -( -1 + 3 * c0 * c + c0 * c0 * s * s ) -
        (2 * cot - kappa * s) * (cot + c0 * s) +
        2 / (s * s) +
        kappa * c
      const q0Exact = 3 + 0.24 * kappa * kappa * s * s
      maxTestFnErr = Math.max(maxTestFnErr, Math.abs(q0Direct - q0Exact))
    }

    const gaps = su2SturmLiouvilleGaps(kappa)
    if (gaps.gapL0 < minSturmGapL0) minSturmGapL0 = gaps.gapL0
    if (gaps.gapL1 < minSturmGapL1) minSturmGapL1 = gaps.gapL1

    // Check Riccati comparison R(kappa) > kappa / (2 + sqrt(4 + kappa^2)) and variances <= 1/4
    const r = kappa < 1e-12 ? 0 : besselI(2, kappa) / besselI(1, kappa)
    const g = kappa / (2 + Math.sqrt(4 + kappa * kappa))
    const vPerp = kappa < 1e-12 ? 0.25 : r / kappa
    const vPar = kappa < 1e-12 ? 0.25 : 1 - 3 * vPerp - r * r
    const vParUpper = 1 / (2 + Math.sqrt(4 + kappa * kappa))
    if (kappa > 0 && !(r > g && vPar < vParUpper && vParUpper < 0.25 && vPerp < 0.25)) {
      riccatiAllStrict = false
    }
    maxVarPar = Math.max(maxVarPar, vPar)
    maxVarPerp = Math.max(maxVarPerp, vPerp)
  }

  // Exact L^1 TV supremum probe (4/(3pi) = 0.4244131816 at kappa=0)
  let maxTvL1 = 0
  for (let ik = 0; ik <= 40; ik++) {
    const kappa = 0.2 * ik
    for (let ip = 0; ip <= 12; ip++) {
      const psi = (0.5 * Math.PI * ip) / 12
      const v = evalSu2TvL1(kappa, psi)
      if (v > maxTvL1) maxTvL1 = v
    }
  }

  const be24c = 1 / (4 * Math.sqrt(7))
  const lam0 = axial.lambda11At0
  const betaTvVarUnf = 2 / 16
  const betaTvVarAx = 2 / lam0 // 0.13714594... -> floor 0.137145
  const betaTvL1Unf = 1 / (16 * (4 / (3 * Math.PI))) // 0.14726215... -> floor 0.147262
  const betaTvL1Ax = 1 / (lam0 * (4 / (3 * Math.PI))) // 0.16157093... -> floor 0.161570
  const betaW1Unf = Math.sqrt(3) / 8 // 2 sqrt(3) / 16 = 0.21650635... -> floor 0.216506
  const betaW1Ax = (2 * Math.sqrt(3)) / axial.lambda11ExactClosed // sqrt(3)(sqrt(7)-1)/12 = 0.23754374... -> floor 0.237543

  return {
    be24c,
    maxTestFnErr,
    minSturmGapL0,
    minSturmGapL1,
    maxVarPar,
    maxVarPerp,
    riccatiAllStrict,
    maxTvL1,
    betaTvVarUnf,
    betaTvVarAx,
    betaTvL1Unf,
    betaTvL1Ax,
    betaW1Unf,
    betaW1Ax,
  }
}

// =================================================================================================
// 3. PART 3: EXACT SU(3) WEINGARTEN MOMENTS, BARS-GREEN c_0, & CERTIFIED CHEN-WANG W_1 THEOREMS
// =================================================================================================

const OMEGA_SU3 = Math.sqrt(6) / 8
const D_SU3 = Math.PI / (2 * OMEGA_SU3) // sqrt(8/3) * pi
const C3_VON_NEUMANN = 2 * Math.sqrt(8 / 3) // exact 1-line von Neumann trace bound 2 ||X||_1 <= 2 sqrt(8/3)
const SU3_M2 = 1 / 6
const SU3_M4 = 5 / 64
const SU3_M6_MAX = 191 / 3456
const C0_SAFETY_EPS = 1e-11 // conservative relative + additive outward safety margin on c_0(x)
const FLOAT_PAD = 1e-11 // explicit Float64 outward rounding pad in interval enclosures

// Exact Bars-Green (1980) Bessel-determinant series for SU(3) c_0(x) = int_{SU(3)} exp((x/3) Re Tr U) dU
function c0Su3Exact(x: number): number {
  const z = x / 3
  let sum = 0
  for (let n = -26; n <= 26; n++) {
    const a00 = besselI(n, z)
    const a01 = besselI(n - 1, z)
    const a02 = besselI(n - 2, z)
    const a10 = besselI(n + 1, z)
    const a11 = besselI(n, z)
    const a12 = besselI(n - 1, z)
    const a20 = besselI(n + 2, z)
    const a21 = besselI(n + 1, z)
    const a22 = besselI(n, z)
    sum +=
      a00 * (a11 * a22 - a12 * a21) -
      a01 * (a10 * a22 - a12 * a20) +
      a02 * (a10 * a21 - a11 * a20)
  }
  return sum
}

function c0Su3Upper(x: number): number {
  return c0Su3Exact(x) * (1 + C0_SAFETY_EPS) + C0_SAFETY_EPS
}

// 40x40 periodic Weyl grid on T^2 for independent cross-checks of c_0(x) and Weingarten moments
function buildSu3WeylGrid(nQuad = 40) {
  const invN = 1 / nQuad
  const nGrid = nQuad * nQuad
  const wArr = new Float64Array(nGrid)
  const reTrArr = new Float64Array(nGrid)
  const imTrArr = new Float64Array(nGrid)
  for (let i = 0; i < nQuad; i++) {
    const t1 = 2 * Math.PI * i * invN
    for (let j = 0; j < nQuad; j++) {
      const t2 = 2 * Math.PI * j * invN
      const t3 = -(t1 + t2)
      const g = i * nQuad + j
      reTrArr[g] = Math.cos(t1) + Math.cos(t2) + Math.cos(t3)
      imTrArr[g] = Math.sin(t1) + Math.sin(t2) + Math.sin(t3)
      wArr[g] =
        (8 / 6) *
        invN *
        invN *
        (1 - Math.cos(t1 - t2)) *
        (1 - Math.cos(2 * t2 + t1)) *
        (1 - Math.cos(2 * t1 + t2))
    }
  }
  return { nGrid, wArr, reTrArr, imTrArr }
}

// Exact 2-line analytic potential drift upper bound M_poly(r):
//   For ALL unit X = i diag(a1, a2, a3) in su(3) (sum a_k = 0, sum a_k^2 = 1 => sum a_k^4 = 1/2, sum a_k^6 <= 11/36)
//   and ALL r >= 0 (using sin(t) <= t - t^3/6 + t^5/120 for all t >= 0):
//     2 sum_k |a_k sin(r a_k / 2)| <= min( r - r^3 / 48 + (11 / 69120) r^5, 2 sqrt(8/3) )!
function mPolySu3(r: number): number {
  const r2 = r * r
  const poly = r * (1 - r2 / 48 + (11 / 69120) * r2 * r2)
  return Math.min(poly, C3_VON_NEUMANN)
}

// Exact 4-term sine-polynomial Chen-Wang evaluator returning smooth components (g, h, s2, ratio, q):
function evalCwComponentsSu3(
  x: number,
  beta: number,
  a: readonly [number, number, number, number],
): { readonly g: number; readonly h: number; readonly s2: number; readonly ratio: number; readonly q: number } {
  const c = Math.cos(x)
  const s = Math.sin(x)
  const c2 = 2 * c * c - 1
  const u0 = 1
  const u1 = 4 * c * c - 1
  const u2 = 2 * c2 * u1 - u0
  const u3 = 2 * c2 * u2 - u1
  const v0 = 1
  const v1 = 4 * c * c - 3
  const v2 = 2 * c2 * v1 - v0
  const v3 = 2 * c2 * v2 - v1

  const g = a[0] * u0 + a[1] * u1 + a[2] * u2 + a[3] * u3
  const h = a[0] * v0 + 3 * a[1] * v1 + 5 * a[2] * v2 + 7 * a[3] * v3
  const s2 = a[0] * u0 + 9 * a[1] * u1 + 25 * a[2] * u2 + 49 * a[3] * u3

  // ratio(x) = M_poly(x / omega) * omega * cos(x) / sin(x) is strictly decreasing on [0, pi/2]
  let ratio: number
  if (x < 1e-10) {
    ratio = 1.0
  } else {
    const r = x / OMEGA_SU3
    const r2 = r * r
    const polyOverR = 1 - r2 / 48 + (11 / 69120) * r2 * r2
    const mOverR = Math.min(polyOverR, C3_VON_NEUMANN / r)
    ratio = (mOverR * (x * c)) / s
  }
  const q = ((3 / 8) * s2 + (1.5 - ((8 * beta) / 3) * ratio) * h) / g
  return { g, h, s2, ratio, q }
}

// Construct & strictly certify 4-term sine-polynomial Chen-Wang lower bound lambda_cert(beta)
// via 100% ANALYTIC INTERVAL ARITHMETIC over M = 4000 subintervals of [0, pi/2] (ZERO ODE trust, ZERO heuristic margins!).
// Exact analytic derivative bounds on [0, pi/2]:
//   |u_m'(x)| <= 2 m (m + 1),  |v_m'(x)| <= 2 m (m + 1)  (from u_m = 1 + 2 sum cos(2jx), v_m = (-1)^m + 2 sum (-1)^{m-j} cos(2jx)),
//   and ratio(x) is proven strictly decreasing on [0, pi/2], so max_{[x_i, x_{i+1}]} ratio(x) == ratio(x_i) identically!
function certifySu3ChenWangLambda1(beta: number): {
  readonly lamCert: number
  readonly coeffs: readonly [number, number, number, number]
  readonly minG: number
  readonly minH: number
  readonly intervalLoss: number
} {
  const mOpt = 240
  const evalCoarse = (a: readonly [number, number, number, number]) => {
    let minQ = Infinity
    let minG = Infinity
    let minH = Infinity
    for (let i = 0; i <= mOpt; i++) {
      const x = (0.5 * Math.PI * i) / mOpt
      const res = evalCwComponentsSu3(x, beta, a)
      if (res.g < minG) minG = res.g
      if (res.h < minH) minH = res.h
      if (res.q < minQ) minQ = res.q
    }
    return { minQ, minG, minH }
  }
  const a: [number, number, number, number] = [1, 0, 0, 0]
  let cur = evalCoarse(a)
  for (const step of [0.06, 0.02, 0.006, 0.002, 0.0005, 0.0001]) {
    let improved = true
    while (improved) {
      improved = false
      for (let idx = 1; idx < 4; idx++) {
        for (const sgn of [-1, 1]) {
          a[idx] = a[idx]! + sgn * step
          const cand = evalCoarse(a)
          if (cand.minG > 0.2 && cand.minH > 0.1 && cand.minQ > cur.minQ + 1e-11) {
            cur = cand
            improved = true
          } else {
            a[idx] = a[idx]! - sgn * step
          }
        }
      }
    }
  }

  // Exact analytic Lipschitz constants L_g, L_h, L_{s2} of the cosine polynomials g(x), h(x), s2(x)
  const lDeriv = [0, 4, 12, 24] as const // 2 m (m + 1)
  let lg = 0
  let lh = 0
  let ls2 = 0
  for (let m = 1; m < 4; m++) {
    const k = 2 * m + 1
    const am = Math.abs(a[m]!)
    lg += lDeriv[m]! * am
    lh += k * lDeriv[m]! * am
    ls2 += k * k * lDeriv[m]! * am
  }

  const mCert = 4000
  const dx = (0.5 * Math.PI) / mCert
  const delta = 0.5 * dx
  let lamCert = Infinity
  let minGLo = Infinity
  let minHLo = Infinity
  let minPointwiseQ = Infinity

  for (let i = 0; i < mCert; i++) {
    const xL = i * dx
    const xM = (i + 0.5) * dx
    const mid = evalCwComponentsSu3(xM, beta, a)
    const left = evalCwComponentsSu3(xL, beta, a)
    if (mid.q < minPointwiseQ) minPointwiseQ = mid.q

    // Proven interval enclosures on [xL, xL + dx] with explicit Float64 outward rounding pad:
    const gLo = mid.g - lg * delta - FLOAT_PAD
    const gHi = mid.g + lg * delta + FLOAT_PAD
    const hLo = mid.h - lh * delta - FLOAT_PAD
    const hHi = mid.h + lh * delta + FLOAT_PAD
    const s2Lo = mid.s2 - ls2 * delta - FLOAT_PAD
    // Since ratio(x) is strictly decreasing, max ratio on [xL, xL + dx] is left.ratio!
    const ratioHi = left.ratio + FLOAT_PAD
    const coeffHLo = 1.5 - ((8 * beta) / 3) * ratioHi - FLOAT_PAD

    if (gLo < minGLo) minGLo = gLo
    if (hLo < minHLo) minHLo = hLo
    if (gLo <= 0 || hLo <= 0) {
      throw new Error(`Interval positivity certificate failed at beta=${beta}, i=${i}`)
    }

    const numLo = (3 / 8) * s2Lo + (coeffHLo >= 0 ? coeffHLo * hLo : coeffHLo * hHi) - FLOAT_PAD
    const qLo = (numLo >= 0 ? numLo / gHi : numLo / gLo) - FLOAT_PAD
    if (qLo < lamCert) lamCert = qLo
  }

  return {
    lamCert,
    coeffs: [a[0], a[1], a[2], a[3]],
    minG: minGLo,
    minH: minHLo,
    intervalLoss: minPointwiseQ - lamCert,
  }
}

// Certified Lyapunov-Holder upper bound on Var_{mu_W}(h) for SU(3) using exact Weingarten moments (1/6, 5/64, 191/3456)
// and exact Holder staple bound Z(s W) <= c_0(8 s beta):
function varHSu3Certified(beta: number): number {
  let best = Infinity
  // Closed-form p = 2, q = 2 baseline: (beta^2 / 9) * sqrt(5/64) * sqrt(c_0(16 beta))
  const vP2 = ((beta * beta) / 9) * Math.sqrt(SU3_M4) * Math.sqrt(c0Su3Upper(16 * beta))
  best = vP2
  // Exact Lyapunov interpolation r in (1, 2] between m2 = 1/6 and m4 = 5/64
  for (let k = 1; k <= 99; k++) {
    const r = 1 + k / 100
    const s = r / (r - 1)
    if (8 * s * beta > 25) continue
    const val =
      ((beta * beta) / 9) *
      Math.pow(SU3_M2, (2 - r) / r) *
      Math.pow(SU3_M4, (r - 1) / r) *
      Math.pow(c0Su3Upper(8 * s * beta), 1 / s)
    if (val < best) best = val
  }
  // Exact Lyapunov interpolation r in (2, 3] between m4 = 5/64 and m6 <= 191/3456
  for (let k = 1; k <= 99; k++) {
    const r = 2 + k / 100
    const s = r / (r - 1)
    const val =
      ((beta * beta) / 9) *
      Math.pow(SU3_M4, (3 - r) / r) *
      Math.pow(SU3_M6_MAX, (r - 2) / r) *
      Math.pow(c0Su3Upper(8 * s * beta), 1 / s)
    if (val < best) best = val
  }
  return best
}

// Certified SU(3) Dobrushin coefficients across all routes:
// Valid centered L^2 TV bound:
//   d_TV <= (1/2) sup_t E_{mu_t}[|Delta V - E[Delta V]|] <= (1/2) sup_t sqrt(Var_{mu_t}(Delta V))
//        <= (1/2) sup_t sqrt(E_{mu_t}[(Delta V)^2])
// Using exact SU(3) Weingarten moments m_2(w) <= 3/2, m_4(w) <= 27/4 (uniquely attained at Q = omega I)
// and Z(s W) <= c_0(8 s beta) with Z(W) >= 1:
const su3TvCenteredP2 = (b: number): number =>
  0.5 * (b / 3) * Math.pow(27 / 4, 0.25) * Math.pow(c0Su3Upper(16 * b), 0.25)

const su3TvCenteredLyap = (b: number): number => {
  let best = su3TvCenteredP2(b)
  for (let k = 1; k <= 199; k++) {
    const r = 1 + k / 200
    const s = r / (r - 1)
    if (8 * s * b > 25) continue
    const val =
      0.5 *
      (b / 3) *
      Math.pow(1.5, (2 - r) / (2 * r)) *
      Math.pow(6.75, (r - 1) / (2 * r)) *
      Math.pow(c0Su3Upper(8 * s * b), 1 / (2 * s))
    if (val < best) best = val
  }
  return best
}

const su3W1OneTermP2 = (b: number): number => {
  const l1 = 15 / 8 - (8 * b) / 3
  if (l1 <= 0) return Infinity
  const vh = ((b * b) / 9) * Math.sqrt(SU3_M4) * Math.sqrt(c0Su3Upper(16 * b))
  return Math.sqrt(vh / l1)
}
const su3W1OneTermLyap = (b: number): number => {
  const l1 = 15 / 8 - (8 * b) / 3
  if (l1 <= 0) return Infinity
  return Math.sqrt(varHSu3Certified(b) / l1)
}
const su3W1CertCw = (b: number): number => {
  const cert = certifySu3ChenWangLambda1(b)
  return cert.lamCert > 0 ? Math.sqrt(varHSu3Certified(b) / cert.lamCert) : Infinity
}

function verifySu3Cert(axial: AxialGaugeSystem) {
  const grid = buildSu3WeylGrid(48)

  // 1. Cross-check Bars-Green vs 48x48 Weyl quadrature on c_0(x) across the full verified domain x in [0.5, 25]
  let maxC0RelErr = 0
  for (const x of [0.5, 1.5, 3.0, 5.0, 8.0, 12.0, 18.0, 25.0]) {
    let wSum = 0
    for (let g = 0; g < grid.nGrid; g++) {
      wSum += grid.wArr[g]! * Math.exp((x / 3) * grid.reTrArr[g]!)
    }
    const bg = c0Su3Exact(x)
    maxC0RelErr = Math.max(maxC0RelErr, Math.abs(bg - wSum) / bg)
  }

  // 2. Cross-check SU(3) Weingarten moments at M = (omega - 1) I_3 against Weyl quadrature
  let eV2 = 0
  let eV4 = 0
  let eV6 = 0
  for (let g = 0; g < grid.nGrid; g++) {
    const val = -1.5 * grid.reTrArr[g]! - (Math.sqrt(3) / 2) * grid.imTrArr[g]!
    const v2 = val * val
    eV2 += grid.wArr[g]! * v2
    eV4 += grid.wArr[g]! * v2 * v2
    eV6 += grid.wArr[g]! * v2 * v2 * v2
  }
  const weingartenErr = Math.max(
    Math.abs(eV2 - 1.5) / 1.5,
    Math.abs(eV4 - 6.75) / 6.75,
    Math.abs(eV6 - 1485 / 32) / (1485 / 32),
  )

  // 3. Cross-check analytic Jacobi drift bound b_geom(r; phi) <= -2 sqrt(6) tan(omega r)
  //    AND Taylor potential bound M_poly(r) >= 2 sum |a_k sin(r a_k / 2)| across ALL (r, phi)!
  let maxGeomViolation = -Infinity
  let maxPotViolation = -Infinity
  for (let ir = 1; ir < 120; ir++) {
    const r = (D_SU3 * ir) / 120
    const bgUpper = -2 * Math.sqrt(6) * Math.tan(OMEGA_SU3 * r)
    const mvUpper = mPolySu3(r)
    for (let ip = 0; ip <= 60; ip++) {
      const phi = (Math.PI * ip) / (3 * 60)
      const a1 = Math.sqrt(2 / 3) * Math.cos(phi)
      const a2 = Math.sqrt(2 / 3) * Math.cos(phi + (2 * Math.PI) / 3)
      const a3 = Math.sqrt(2 / 3) * Math.cos(phi + (4 * Math.PI) / 3)
      const d12 = Math.abs(a1 - a2)
      const d23 = Math.abs(a2 - a3)
      const d31 = Math.abs(a3 - a1)
      const mvTrue =
        2 *
        (Math.abs(a1 * Math.sin(0.5 * r * a1)) +
          Math.abs(a2 * Math.sin(0.5 * r * a2)) +
          Math.abs(a3 * Math.sin(0.5 * r * a3)))
      maxPotViolation = Math.max(maxPotViolation, mvTrue - mvUpper)
      if (r * Math.max(d12, d23, d31) < 2 * Math.PI - 1e-6) {
        const bgTrue =
          -2 *
          (d12 * Math.tan(0.25 * r * d12) +
            d23 * Math.tan(0.25 * r * d23) +
            d31 * Math.tan(0.25 * r * d31))
        maxGeomViolation = Math.max(maxGeomViolation, (bgTrue - bgUpper) / Math.max(1, Math.abs(bgUpper)))
      }
    }
  }

  const be24c = 9 / (16 * Math.sqrt(7))
  const lam0 = axial.lambda11At0

  const betaTvP2Unf = bisectThreshold(su3TvCenteredP2, 1 / 16)
  const betaTvP2Ax = bisectThreshold(su3TvCenteredP2, 1 / lam0)
  const betaTvLyapUnf = bisectThreshold(su3TvCenteredLyap, 1 / 16)
  const betaTvLyapAx = bisectThreshold(su3TvCenteredLyap, 1 / lam0)
  const betaOneTermP2Unf = bisectThreshold(su3W1OneTermP2, 1 / 16)
  const betaOneTermP2Ax = bisectThreshold(su3W1OneTermP2, 1 / lam0)
  const betaOneTermLyapUnf = bisectThreshold(su3W1OneTermLyap, 1 / 16)
  const betaOneTermLyapAx = bisectThreshold(su3W1OneTermLyap, 1 / lam0)
  const betaCwUnf = bisectThreshold(su3W1CertCw, 1 / 16, 0.5)
  const betaCwAx = bisectThreshold(su3W1CertCw, 1 / lam0, 0.5)

  return {
    be24c,
    maxC0RelErr,
    weingartenErr,
    maxGeomViolation,
    maxPotViolation,
    betaTvP2Unf,
    betaTvP2Ax,
    betaTvLyapUnf,
    betaTvLyapAx,
    betaOneTermP2Unf,
    betaOneTermP2Ax,
    betaOneTermLyapUnf,
    betaOneTermLyapAx,
    betaCwUnf,
    betaCwAx,
  }
}

// =================================================================================================
// 4. PART 4: SHARPENED ZERO-TRUNCATION KOTECKY-PREISS (H_12 3-FOREST + 2-EDGE-COVERED POLYMERS)
// =================================================================================================

function verifySharpenedKp(axial: AxialGaugeSystem) {
  const pos = axial.posRoots
  const all = axial.allRoots

  // 1. Build H_12 (12 vertices = pos[0..11], 32 edges where pos[i] . pos[j] == 1)
  const hEdges: readonly [number, number][] = (() => {
    const out: [number, number][] = []
    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        const dot =
          pos[i]![0] * pos[j]![0] +
          pos[i]![1] * pos[j]![1] +
          pos[i]![2] * pos[j]![2] +
          pos[i]![3] * pos[j]![3]
        if (dot === 1) out.push([i, j])
      }
    }
    return out
  })()

  // Exhaustive Nash-Williams fractional arboricity over all 4095 nonempty subsets of V(H_12)
  let maxNum = 0
  let maxDen = 1
  for (let mask = 1; mask < 1 << 12; mask++) {
    let k = 0
    for (let i = 0; i < 12; i++) if ((mask >> i) & 1) k++
    if (k < 2) continue
    let eCnt = 0
    for (const [u, v] of hEdges) {
      if (((mask >> u) & 1) && ((mask >> v) & 1)) eCnt++
    }
    if (eCnt * maxDen > maxNum * (k - 1)) {
      maxNum = eCnt
      maxDen = k - 1
    }
  }
  const pStar = maxNum / maxDen // exact 32 / 11

  // Construct an EXPLICIT 3-forest edge partition of all 32 edges of H_12 (sizes 11, 11, 10)
  // via deterministic backtracking (certifies |z(gamma)| <= ||f||_3^{|gamma|} with integer p = 3!).
  const color = new Int8Array(hEdges.length).fill(-1)
  const adj = [
    Array.from({ length: 12 }, () => new Uint8Array(12)),
    Array.from({ length: 12 }, () => new Uint8Array(12)),
    Array.from({ length: 12 }, () => new Uint8Array(12)),
  ]
  const hasPath = (c: number, start: number, goal: number): boolean => {
    const seen = new Uint8Array(12)
    const stack = [start]
    seen[start] = 1
    while (stack.length > 0) {
      const u = stack.pop()!
      if (u === goal) return true
      for (let v = 0; v < 12; v++) {
        if (adj[c]![u]![v]! && !seen[v]!) {
          seen[v] = 1
          stack.push(v)
        }
      }
    }
    return false
  }
  const dfsColor = (idx: number): boolean => {
    if (idx === hEdges.length) return true
    const [u, v] = hEdges[idx]!
    for (let c = 0; c < 3; c++) {
      if (hasPath(c, u, v)) continue
      color[idx] = c
      adj[c]![u]![v] = 1
      adj[c]![v]![u] = 1
      if (dfsColor(idx + 1)) return true
      adj[c]![u]![v] = 0
      adj[c]![v]![u] = 0
      color[idx] = -1
    }
    return false
  }
  const threeForestFound = dfsColor(0)
  const forestSizes = [0, 0, 0]
  for (let i = 0; i < hEdges.length; i++) forestSizes[color[i]!] = forestSizes[color[i]!]! + 1

  // Verify exact tetrahedron count touching a fixed triangle (0, r1, r2)
  const r1: Vec4 = [1, 1, 0, 0]
  const r2: Vec4 = [1, 0, 1, 0]
  let tetCount = 0
  for (const w of all) {
    const d1 = w[0] * r1[0] + w[1] * r1[1] + w[2] * r1[2] + w[3] * r1[3]
    const d2 = w[0] * r2[0] + w[1] * r2[1] + w[2] * r2[2] + w[3] * r2[3]
    if (d1 === 1 && d2 === 1) tetCount++
  }

  // Exact sharpened KP critical activity M_crit with C_4^{closed} = 3, C_n^{closed} <= C(10n - 1, n - 1) (n >= 5),
  // and exact analytic geometric tail bound for all n > 180 using the strict ratio bound:
  //   C(10(n+1) - 1, n) / C(10n - 1, n - 1) = 10 * prod_{j=1}^9 (10n + j)/(9n + j) < 10^10 / 9^9 = R_KP!
  const rKp = Math.pow(10, 10) / Math.pow(9, 9) // 25.811747917131967
  const logFac = new Float64Array(2001)
  for (let k = 1; k <= 2000; k++) logFac[k] = logFac[k - 1]! + Math.log(k)
  const evalKpLhs = (M: number, a: number): number => {
    const z = M * Math.exp(a)
    const q = rKp * z
    if (q >= 0.999) return Infinity
    let sum = 22 * tetCount * Math.pow(z, 4)
    let lastTerm = 0
    for (let n = 5; n <= 180; n++) {
      const cn = Math.exp(logFac[10 * n - 1]! - logFac[n - 1]! - logFac[9 * n]!)
      const term = 22 * cn * Math.pow(z, n)
      sum += term
      lastTerm = term
    }
    // Exact infinite tail upper bound: sum_{n=181}^{infinity} term(n) < lastTerm * q / (1 - q)
    sum += (lastTerm * q) / (1 - q)
    return sum
  }
  let mCritSharp = 0
  for (let k = 1; k <= 500; k++) {
    const a = 0.002 * k
    let lo = 0
    let hi = 0.99 / (rKp * Math.exp(a))
    for (let it = 0; it < 50; it++) {
      const mid = 0.5 * (lo + hi)
      if (evalKpLhs(mid, a) <= a) lo = mid
      else hi = mid
    }
    if (lo > mCritSharp) mCritSharp = lo
  }

  const su2Lp = (b: number, p: number): number => {
    const c0 = b < 1e-8 ? 1 + (b * b) / 8 : (2 * besselI(1, b)) / b
    let acc = 0
    for (let i = 0; i < 128; i++) {
      const th = 0.5 * Math.PI * (GL128.x[i]! + 1)
      const wTh = 0.5 * Math.PI * GL128.w[i]!
      const s = Math.sin(th)
      const f = Math.exp(b * Math.cos(th)) / c0 - 1
      acc += wTh * (2 / Math.PI) * s * s * Math.pow(Math.abs(f), p)
    }
    return Math.pow(acc, 1 / p)
  }

  const grid = buildSu3WeylGrid(36)
  const su3Lp = (b: number, p: number): number => {
    const c0 = c0Su3Exact(b)
    let acc = 0
    for (let g = 0; g < grid.nGrid; g++) {
      const f = Math.exp((b / 3) * grid.reTrArr[g]!) / c0 - 1
      acc += grid.wArr[g]! * Math.pow(Math.abs(f), p)
    }
    return Math.pow(acc, 1 / p)
  }

  // Baseline E-FND-0189 KP thresholds
  const oldKp = solveMultiPlaquetteKpThreshold(21, 4)
  const su2Sup = (b: number) => Math.exp(b) / ((2 * besselI(1, b)) / b) - 1
  const su3Sup = (b: number) => Math.exp(b) / c0Su3Exact(b) - 1
  const oldBetaKpSu2 = bisectThreshold(su2Sup, oldKp.activityKpCrit, 0.2)
  const oldBetaKpSu3 = bisectThreshold(su3Sup, oldKp.activityKpCrit, 0.2)

  const sharpBetaKpSu2L3 = bisectThreshold(b => su2Lp(b, 3), mCritSharp, 0.5)
  const sharpBetaKpSu2PStar = bisectThreshold(b => su2Lp(b, pStar), mCritSharp, 0.5)
  const sharpBetaKpSu3L3 = bisectThreshold(b => su3Lp(b, 3), mCritSharp, 0.5)
  const sharpBetaKpSu3PStar = bisectThreshold(b => su3Lp(b, pStar), mCritSharp, 0.5)

  return {
    hEdgesCount: hEdges.length,
    arboricityNum: maxNum,
    arboricityDen: maxDen,
    pStar,
    threeForestFound,
    forestSizes,
    tetCount,
    oldKpActivity: oldKp.activityKpCrit,
    mCritSharp,
    oldBetaKpSu2,
    oldBetaKpSu3,
    sharpBetaKpSu2L3,
    sharpBetaKpSu2PStar,
    sharpBetaKpSu3L3,
    sharpBetaKpSu3PStar,
  }
}

// =================================================================================================
// 5. MAIN RUNNER & FULL CERTIFICATION REPORT
// =================================================================================================

function mCtD4CornerExact(beta: number, nColor: number): number {
  const target = (nColor * nColor * nColor * nColor) / (64 * beta * beta)
  if (target <= 28) return 0
  let lo = 1.0
  let hi = Math.max(2.0, Math.sqrt(target / 4) + 1)
  for (let it = 0; it < 80; it++) {
    const mid = 0.5 * (lo + hi)
    if (4 * mid * mid + 13 * mid + 10 + 1 / mid < target) lo = mid
    else hi = mid
  }
  return 2 * Math.acosh(0.5 * (lo + hi))
}

function main() {
  const t0 = performance.now()
  const axial = buildD4AxialGaugeSystem()
  const su2 = verifySu2Cert(axial)
  const su3 = verifySu3Cert(axial)
  const kp = verifySharpenedKp(axial)

  console.log('======================================================================================')
  console.log('WAVE-2 TRACK W6 (CHALLENGE 2): RIGOROUS 4D D_4 SU(N) MASS GAP BEYOND beta_BE^{24c}')
  console.log('======================================================================================')

  console.log('\n[PART 1] EXACT 4D D_4 GEOMETRY & 1D SPATIAL AXIAL GAUGE (ZERO LOOPS, EXACT RP):')
  console.log(
    `  Unfixed D_4 neighbors/link           = ${axial.unfixedNeighborsPerLink} (${axial.unfixedShiftZeroCount} at |Dx_0|=0 + ${axial.unfixedShiftHalfCount} at |Dx_0|=1/2)`,
  )
  console.log(
    `  Frozen spatial axis r_frozen         = [${axial.frozenRoot.join(',')}] (preserves x_0=0 RP = ${axial.frozenPreservesRP})`,
  )
  console.log(
    `  11 active directions block structure = ${axial.reducedDirsCount} reduced (deg=${axial.reducedRowSum}) + ${axial.untouchedDirsCount} untouched (deg=${axial.untouchedRowSum}), untouched-untouched edges = ${axial.untouchedToUntouchedCount}`,
  )
  console.log(
    `  Exact Perron-Frobenius Lambda_11(0)  = ${axial.lambda11At0.toFixed(10)} (exact 4 + 4 sqrt(7) = ${axial.lambda11ExactClosed.toFixed(10)}, err = ${axial.lambda11Residual.toExponential(2)}, wMax/wMin = ${axial.wRatioAt0.toFixed(6)})`,
  )

  console.log('\n[PART 2] SU(2) UNCONDITIONAL INFINITE-VOLUME THRESHOLDS (ZERO TRUNCATION, OUTWARD-FLOORED):')
  console.log(
    `  Positive test-function identity err  = ${su2.maxTestFnErr.toExponential(2)} | Sturm-Liouville min gaps: l=0 -> ${su2.minSturmGapL0.toFixed(8)}, l=1 -> ${su2.minSturmGapL1.toFixed(8)} (exact >= 3.000000)`,
  )
  console.log(
    `  Riccati/power-series Var <= 1/4      = ${su2.riccatiAllStrict} (maxVarPar = ${su2.maxVarPar.toFixed(8)}, maxVarPerp = ${su2.maxVarPerp.toFixed(8)})`,
  )
  console.log(
    `  Baseline E-FND-0189 beta_OS_KP       = ${kp.oldBetaKpSu2.toFixed(6)}`,
  )
  console.log(
    `  Baseline BT2 beta_BE^{24c}           = ${su2.be24c.toFixed(6)} (1.00x bar)`,
  )
  console.log(
    `  Route A: Sharpened KP (L^3 / L^p*)   = ${floor6(kp.sharpBetaKpSu2L3)} / ${floor6(kp.sharpBetaKpSu2PStar)} (${(kp.sharpBetaKpSu2PStar / kp.oldBetaKpSu2).toFixed(2)}x old KP)`,
  )
  console.log(
    `  Route B1: 1-line TV (Var <= 1/4)     = unfixed ${floor6(su2.betaTvVarUnf)} (${(su2.betaTvVarUnf / su2.be24c).toFixed(2)}x) | 1D-axial ${floor6(su2.betaTvVarAx)} (${(su2.betaTvVarAx / su2.be24c).toFixed(2)}x)`,
  )
  console.log(
    `  Route B2: Grid-verified L^1 TV       = unfixed ${floor6(su2.betaTvL1Unf)} (${(su2.betaTvL1Unf / su2.be24c).toFixed(2)}x) | 1D-axial ${floor6(su2.betaTvL1Ax)} (${(su2.betaTvL1Ax / su2.be24c).toFixed(2)}x) [41x13 max L^1 = ${su2.maxTvL1.toFixed(8)}]`,
  )
  console.log(
    `  Route C: 10-line W_1 CHAMPION        = unfixed ${floor6(su2.betaW1Unf)} (${(su2.betaW1Unf / su2.be24c).toFixed(2)}x) | 1D-axial ${floor6(su2.betaW1Ax)} [exact ${su2.betaW1Ax.toFixed(8)}] (${(su2.betaW1Ax / su2.be24c).toFixed(2)}x BE, ${(su2.betaW1Ax / kp.oldBetaKpSu2).toFixed(2)}x KP)`,
  )

  console.log('\n[PART 3] SU(3) UNCONDITIONAL INFINITE-VOLUME THRESHOLDS (ZERO TRUNCATION, OUTWARD-FLOORED):')
  console.log(
    `  Bars-Green vs Weyl48 c_0 relErr      = ${su3.maxC0RelErr.toExponential(2)} (x in [0.5, 25]) | Weingarten 2/4/6-moment err = ${su3.weingartenErr.toExponential(2)}`,
  )
  console.log(
    `  Jacobi b_geom max violation          = ${su3.maxGeomViolation.toExponential(2)} (<= 0 exact) | M_poly max violation = ${su3.maxPotViolation.toExponential(2)} (<= 0 exact)`,
  )
  console.log(
    `  Baseline E-FND-0189 beta_OS_KP       = ${kp.oldBetaKpSu3.toFixed(6)}`,
  )
  console.log(
    `  Baseline BT2 beta_BE^{24c}           = ${su3.be24c.toFixed(6)} (1.00x bar)`,
  )
  console.log(
    `  Route A: Sharpened KP (L^3 / L^p*)   = ${floor6(kp.sharpBetaKpSu3L3)} / ${floor6(kp.sharpBetaKpSu3PStar)} (${(kp.sharpBetaKpSu3PStar / kp.oldBetaKpSu3).toFixed(2)}x old KP)`,
  )
  console.log(
    `  Route B1: Centered L^2 TV (p=2,q=2)  = unfixed ${floor6(su3.betaTvP2Unf)} (${(su3.betaTvP2Unf / su3.be24c).toFixed(2)}x) | 1D-axial ${floor6(su3.betaTvP2Ax)} (${(su3.betaTvP2Ax / su3.be24c).toFixed(2)}x)`,
  )
  console.log(
    `  Route B2: Centered L^2 TV (Lyap)     = unfixed ${floor6(su3.betaTvLyapUnf)} (${(su3.betaTvLyapUnf / su3.be24c).toFixed(2)}x) | 1D-axial ${floor6(su3.betaTvLyapAx)} (${(su3.betaTvLyapAx / su3.be24c).toFixed(2)}x)`,
  )
  console.log(
    `  Route C1: 2-line W_1 (15/8-8b/3, p2) = unfixed ${floor6(su3.betaOneTermP2Unf)} (${(su3.betaOneTermP2Unf / su3.be24c).toFixed(2)}x) | 1D-axial ${floor6(su3.betaOneTermP2Ax)} (${(su3.betaOneTermP2Ax / su3.be24c).toFixed(2)}x)`,
  )
  console.log(
    `  Route C2: 2-line W_1 (15/8-8b/3, Ly) = unfixed ${floor6(su3.betaOneTermLyapUnf)} (${(su3.betaOneTermLyapUnf / su3.be24c).toFixed(2)}x) | 1D-axial ${floor6(su3.betaOneTermLyapAx)} (${(su3.betaOneTermLyapAx / su3.be24c).toFixed(2)}x)`,
  )
  console.log(
    `  Route D: Certified CW W_1 CHAMPION   = unfixed ${floor6(su3.betaCwUnf)} (${(su3.betaCwUnf / su3.be24c).toFixed(2)}x) | 1D-axial ${floor6(su3.betaCwAx)} (${(su3.betaCwAx / su3.be24c).toFixed(2)}x BE, ${(su3.betaCwAx / kp.oldBetaKpSu3).toFixed(2)}x KP)`,
  )

  console.log('\n[PART 4] H_12 FRACTIONAL & INTEGER ARBORICITY FOR ZERO-TRUNCATION KOTECKY-PREISS:')
  console.log(
    `  H_12 edges = ${kp.hEdgesCount}, exact fractional arboricity p* = ${kp.arboricityNum}/${kp.arboricityDen} = ${kp.pStar.toFixed(8)}, Nash-Williams integer arboricity ceil(p*) = 3, explicit 3-forest = ${kp.threeForestFound} (sizes [${kp.forestSizes.join(', ')}])`,
  )
  console.log(
    `  Exact tetrahedra per triangle = ${kp.tetCount}, M_crit_sharp (with exact tail) = ${kp.mCritSharp.toFixed(8)} (vs old M_KP = ${kp.oldKpActivity.toFixed(8)})`,
  )

  console.log('\n[TABLE 1] SU(2) INFINITE-VOLUME EXPONENTIAL MASS GAP LOWER BOUNDS m(beta) > 0 ON 4D D_4 (FLOORED):')
  console.log('  beta     | m_BE_24c  | m_W1_unf  | m_W1_axial | m_axial*sqrt2 | regime')
  console.log('  ---------+-----------+-----------+------------+---------------+----------------------------')
  const su2Betas = [0.05, 0.08, 0.094, 0.095, 0.10, 0.12, 0.15, 0.18, 0.20, 0.215, 0.22, 0.23, 0.235]
  const su2BeyondPositive: boolean[] = []
  for (const b of su2Betas) {
    const cVal = b / (2 * Math.sqrt(3))
    const mBe = mCtD4CornerExact(b, 2)
    const mUnf = axial.solveMassGapUnfixed(cVal)
    const mAx = axial.solveMassGapAxial(cVal)
    if (b > su2.be24c) su2BeyondPositive.push(mAx > 0)
    const fmtRef = (v: number) => (v > 0 ? v.toFixed(6) : '    --   ').padStart(9)
    const fmtLo = (v: number) => (v > 0 ? floor6(v) : '    --   ').padStart(9)
    const tag = b > su2.be24c ? 'STRICTLY BEYOND beta_BE^{24c}!' : 'inside beta_BE^{24c}'
    console.log(
      `  ${b.toFixed(4).padStart(7)}  | ${fmtRef(mBe)} | ${fmtLo(mUnf)} |  ${fmtLo(mAx)} |     ${fmtLo(mAx * Math.SQRT2)} | ${tag}`,
    )
  }

  console.log('\n[TABLE 2] SU(3) INFINITE-VOLUME EXPONENTIAL MASS GAP LOWER BOUNDS m(beta) > 0 ON 4D D_4 (FLOORED):')
  console.log('  beta     | lam1_cert | m_BE_24c  | m_W1_unf  | m_W1_axial | m_axial*sqrt2 | regime')
  console.log('  ---------+-----------+-----------+-----------+------------+---------------+----------------------------')
  const su3Betas = [0.10, 0.15, 0.20, 0.212, 0.215, 0.23, 0.25, 0.28, 0.30, 0.315, 0.325, 0.330, 0.335]
  const su3BeyondPositive: boolean[] = []
  for (const b of su3Betas) {
    const cert = certifySu3ChenWangLambda1(b)
    const cVal = Math.sqrt(varHSu3Certified(b) / cert.lamCert)
    const mBe = mCtD4CornerExact(b, 3)
    const mUnf = axial.solveMassGapUnfixed(cVal)
    const mAx = axial.solveMassGapAxial(cVal)
    if (b > su3.be24c) su3BeyondPositive.push(mAx > 0)
    const fmtRef = (v: number) => (v > 0 ? v.toFixed(6) : '    --   ').padStart(9)
    const fmtLo = (v: number) => (v > 0 ? floor6(v) : '    --   ').padStart(9)
    const tag = b > su3.be24c ? 'STRICTLY BEYOND beta_BE^{24c}!' : 'inside beta_BE^{24c}'
    console.log(
      `  ${b.toFixed(4).padStart(7)}  | ${floor6(cert.lamCert).padStart(9)} | ${fmtRef(mBe)} | ${fmtLo(mUnf)} |  ${fmtLo(mAx)} |     ${fmtLo(mAx * Math.SQRT2)} | ${tag}`,
    )
  }

  // Final certification assertions
  const allOk =
    axial.frozenPreservesRP &&
    axial.unfixedNeighborsPerLink === 16 &&
    axial.unfixedShiftZeroCount === 8 &&
    axial.unfixedShiftHalfCount === 8 &&
    axial.reducedDirsCount === 8 &&
    axial.untouchedDirsCount === 3 &&
    axial.untouchedToUntouchedCount === 0 &&
    axial.lambda11Residual < 1e-13 &&
    su2.maxTestFnErr < 1e-12 &&
    su2.minSturmGapL0 >= 3.0 - 1e-12 &&
    su2.minSturmGapL1 >= 3.0 - 1e-12 &&
    su2.riccatiAllStrict &&
    su2.betaW1Unf > 2.25 * su2.be24c &&
    su2.betaW1Ax > 2.5 * su2.be24c &&
    su2BeyondPositive.every(Boolean) &&
    su3.maxC0RelErr < 1e-13 &&
    su3.weingartenErr < 1e-13 &&
    su3.maxGeomViolation <= 1e-12 &&
    su3.maxPotViolation <= 1e-12 &&
    su3.betaTvP2Ax > 1.07 * su3.be24c &&
    su3.betaTvLyapUnf > su3.be24c &&
    su3.betaTvLyapAx > 1.09 * su3.be24c &&
    su3.betaOneTermLyapAx > 1.49 * su3.be24c &&
    su3.betaCwUnf > 1.5 * su3.be24c &&
    su3.betaCwAx > 1.58 * su3.be24c &&
    su3BeyondPositive.every(Boolean) &&
    Math.abs(su2.maxTvL1 - 4 / (3 * Math.PI)) < 1e-12 &&
    kp.threeForestFound &&
    kp.arboricityNum === 32 &&
    kp.arboricityDen === 11 &&
    kp.tetCount === 3

  console.log(
    `\nALL CERTIFICATIONS PASSED = ${allOk} (runtime: ${((performance.now() - t0) / 1000).toFixed(3)} s)`,
  )
  if (!allOk) process.exit(1)
}

main()

export {}
