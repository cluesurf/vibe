// POST-NEWTONIAN GENERAL RELATIVITY ON THE {3,4,3,4} 1/N_D^2 WARPED CUSP COLUMN
// (E-GRV-0159, gap B-52; Frontier 6).
//
// Parameter-free {3,4,3,4} foundation:
//   - E-GRV-0157 (pair-density-gravity-slope.ts): exact shell counts N_D = [1, 18, 330, 6034]
//     with parameter-free pair-density warp w(D) = 1 / N_D^2 yields K_eff = 1.0312370835 and
//     Newtonian coupling G_eff = 1 / (4 * pi * K_eff) = 0.07716700 (zero free gravity parameters).
//   - E-RLT-0125 (universal-speed-lock.ts): shared warped-cusp column yields universal limiting
//     speed c_u = sqrt(K_eff / M_eff) = 0.9869161538 docks/beat for spin-2, spin-1, and spin-1/2.
//
// Isotropic warped-cusp PPN metric with Phi(r) = -G_eff * M / r and u(r) = -Phi(r) / c_u^2:
//   ds^2 = -(1 + 2 Phi / c_u^2 + 2 beta_PPN (Phi / c_u^2)^2) c_u^2 dt^2
//          + (1 - 2 gamma_PPN Phi / c_u^2) dx^2
//        = -A(r) c_u^2 dt^2 + B(r) dx^2,
//   A(r) = 1 - 2 u(r) + 2 beta_PPN u(r)^2,   B(r) = 1 + 2 gamma_PPN u(r).
//
// Symmetric temporal + spatial cusp warp has gamma_PPN = 1, beta_PPN = 1 (matching Schwarzschild
// in isotropic coordinates through 1PN). Controls include flat space (M = 0), Newtonian temporal-only
// warp (gamma_PPN = 0, beta_PPN = 1), Newtonian 1/r Kepler, special-relativistic flat Kepler, and
// the raw unwarped {3,4,3,4} bulk screened column (w(D) = 1, F = 12).
//
// Four classic post-Newtonian GR tests:
//   1. Gravitational Clock Redshift: live discrete-time unitary 4-component chiral Weyl/Dirac
//      internal clock at 4 radii r in weak field |Phi|/c_u^2 ~ 1e-3..4e-3, measuring frequency
//      from exact phase winding, verifying norm <= 1e-13 and exact U^dag reversal <= 1e-13.
//   2. Eddington 2x Light Bending: (a) exact 6th-order symplectic null rays in conformal refractive
//      index n(r) = sqrt(B(r) / A(r)), AND (b) live 2D split-step unitary optical wavepacket
//      (k_0 grazing central mass at multiple impact parameters b), separating gamma_PPN = 1
//      (4 G_eff M / (b c_u^2)) from temporal-only gamma_PPN = 0 (2 G_eff M / (b c_u^2), ratio 2.00)
//      and raw unwarped bulk screened control (> 100x collapse).
//   3. Shapiro Time Delay: exact endpoint-to-endpoint (-L, b) -> (+L, b) null geodesic transit
//      delay vs flat 2L / c_u, matching (1 + gamma_PPN) (G_eff M / c_u^3) ln((r1+r2+2L)/(r1+r2-2L))
//      to <= 1% and separating GR (gamma = 1) from temporal-only (gamma = 0) by 2.00x.
//   4. Relativistic Perihelion Precession: exact conformal-time separable 6th-order symplectic
//      geodesic integration of H = -1/2 across e in {0.2, 0.4, 0.6}, verifying energy & angular
//      momentum conservation <= 1e-12, exact multi-orbit backward time reversal <= 1e-11, exact
//      match to Einstein's 6 pi G_eff M / (a (1 - e^2) c_u^2) to <= 1%, zero precession for
//      Newtonian 1/r (<= 1e-10), 1/3 of Einstein for temporal-only metric (gamma = 0, beta = 1,
//      exact Will PPN (2 + 2 gamma - beta)/3 = 1/3), and 1/6 of Einstein for flat-space special-
//      relativistic Kepler (Sommerfeld 1916).
//
// Honest boundary:
//   G_eff and c_u are derived parameter-free from {3,4,3,4}. Once the isotropic cusp warp responds
//   symmetrically (gamma_PPN = 1, beta_PPN = 1), all four classic GR tests hold cleanly. Deriving
//   gamma_PPN = 1 and beta_PPN = 1 from a full nonlinear 4D spin-2 self-interaction on the live
//   {3,4,3,4} honeycomb remains an explicit open target.
//
// DETERMINISM: zero Math.random, pure deterministic floating-point physics.

import { EXACT_COLUMN_SHELL_COUNTS } from '@/code/measure/pair-density-gravity-slope'
import { buildWarpedColumnData } from '@/code/measure/universal-speed-lock'

const R_VOL = EXACT_COLUMN_SHELL_COUNTS[3] / EXACT_COLUMN_SHELL_COUNTS[2]

// -------------------------------------------------------------------------------------------------
// Exact {3,4,3,4} raw unwarped bulk screened column model (control, w(D) = 1, F = 12)
// -------------------------------------------------------------------------------------------------

function lateralLinksPerNeighbor(d: number): number {
  if (d === 0) return 1
  if (d === 1) return 10
  return 8 * 5 ** (d - 1)
}

type RawScreenedBulkModel = {
  readonly floorF: number
  readonly y0Zero: number
  readonly kRaw: number
  readonly muRaw: number
  readonly latticeG1: number
  readonly latticeG6: number
  readonly latticeG8: number
}

function buildRawScreenedBulkModel(floorF: number): RawScreenedBulkModel {
  const nLen = floorF + 2
  const nShell = new Float64Array(nLen)
  for (let d = 0; d < EXACT_COLUMN_SHELL_COUNTS.length && d < nLen; d++) {
    nShell[d] = EXACT_COLUMN_SHELL_COUNTS[d]!
  }
  for (let d = EXACT_COLUMN_SHELL_COUNTS.length; d < nLen; d++) {
    nShell[d] = nShell[d - 1]! * R_VOL
  }

  const cLat = new Float64Array(floorF + 1)
  const cVert = new Float64Array(floorF + 1)
  for (let d = 0; d <= floorF; d++) {
    cLat[d] = lateralLinksPerNeighbor(d)
    cVert[d] = 18 * nShell[d]!
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

  const evalSchur = (lam: number): number => {
    let val = cLat[floorF]! * lam + cVert[floorF]!
    for (let d = floorF - 1; d >= 0; d--) {
      const cv = cVert[d]!
      val = cLat[d]! * lam + (cv * val) / (cv + val)
    }
    return val
  }

  // Exact 1/48 octahedral-wedge lattice G_raw(r) on side = 32 for r = 1, 6, 8 cross-check
  const side = 32
  const half = side >> 1
  const twoPiOverL = (2 * Math.PI) / side
  const cos1 = new Float64Array(half + 1)
  const mult = new Float64Array(half + 1)
  for (let m = 0; m <= half; m++) {
    cos1[m] = Math.cos(twoPiOverL * m)
    mult[m] = m === 0 || m === half ? 1 : 2
  }
  const rs = [1, 6, 8] as const
  const acc = new Float64Array(rs.length)
  for (let a = 0; a <= half; a++) {
    const ca = cos1[a]!
    const ma = mult[a]!
    for (let b = a; b <= half; b++) {
      const cb = cos1[b]!
      const mb = mult[b]!
      for (let c = b; c <= half; c++) {
        const lam = 2 * (3 - ca - cb - cos1[c]!)
        const gk = 1 / evalSchur(lam)
        const mc = mult[c]!
        for (let idx = 0; idx < rs.length; idx++) {
          const r = rs[idx]!
          const caR = Math.cos(twoPiOverL * ((a * r) % side))
          const cbR = Math.cos(twoPiOverL * ((b * r) % side))
          const ccR = Math.cos(twoPiOverL * ((c * r) % side))
          if (a === b && b === c) {
            acc[idx] = acc[idx]! + gk * ma * ma * ma * caR
          } else if (a === b) {
            acc[idx] = acc[idx]! + gk * ma * ma * mc * (2 * caR + ccR)
          } else if (b === c) {
            acc[idx] = acc[idx]! + gk * ma * mb * mb * (caR + 2 * cbR)
          } else {
            acc[idx] = acc[idx]! + gk * 2 * ma * mb * mc * (caR + cbR + ccR)
          }
        }
      }
    }
  }
  const vol = side * side * side

  return {
    floorF,
    y0Zero: y,
    kRaw: dy,
    muRaw: Math.sqrt(y / dy),
    latticeG1: acc[0]! / vol,
    latticeG6: acc[1]! / vol,
    latticeG8: acc[2]! / vol,
  }
}

// -------------------------------------------------------------------------------------------------
// Exact Yoshida 6th-order symmetric symplectic integrator weights (computed algebraically)
// -------------------------------------------------------------------------------------------------

const Y4_A1 = 1 / (2 - Math.cbrt(2))
const Y4_A0 = 1 - 2 * Y4_A1
const Y6_B1 = 1 / (2 - Math.pow(2, 1 / 5))
const Y6_B0 = 1 - 2 * Y6_B1

const S6_WEIGHTS: readonly number[] = [
  Y6_B1 * Y4_A1,
  Y6_B1 * Y4_A0,
  Y6_B1 * Y4_A1,
  Y6_B0 * Y4_A1,
  Y6_B0 * Y4_A0,
  Y6_B0 * Y4_A1,
  Y6_B1 * Y4_A1,
  Y6_B1 * Y4_A0,
  Y6_B1 * Y4_A1,
]

// -------------------------------------------------------------------------------------------------
// Exact radix-2 1D and 2D FFT for live unitary optical wavepacket (Test 2b)
// -------------------------------------------------------------------------------------------------

type FftPlan1D = {
  readonly n: number
  readonly bitRev: Int32Array
  readonly cosFwd: Float64Array
  readonly sinFwd: Float64Array
  readonly cosInv: Float64Array
  readonly sinInv: Float64Array
}

function createFftPlan1D(n: number): FftPlan1D {
  const bits = Math.round(Math.log2(n))
  const bitRev = new Int32Array(n)
  for (let i = 0; i < n; i++) {
    let rev = 0
    let x = i
    for (let b = 0; b < bits; b++) {
      rev = (rev << 1) | (x & 1)
      x >>= 1
    }
    bitRev[i] = rev
  }

  const cosFwd = new Float64Array(n)
  const sinFwd = new Float64Array(n)
  const cosInv = new Float64Array(n)
  const sinInv = new Float64Array(n)

  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1
    const angleStep = (2 * Math.PI) / size
    for (let j = 0; j < half; j++) {
      const ang = angleStep * j
      const c = Math.cos(ang)
      const s = Math.sin(ang)
      cosFwd[half + j] = c
      sinFwd[half + j] = -s
      cosInv[half + j] = c
      sinInv[half + j] = s
    }
  }

  return { n, bitRev, cosFwd, sinFwd, cosInv, sinInv }
}

function fft1DInPlace(
  plan: FftPlan1D,
  re: Float64Array,
  im: Float64Array,
  inverse: boolean,
): void {
  const n = plan.n
  const bitRev = plan.bitRev
  for (let i = 0; i < n; i++) {
    const j = bitRev[i]!
    if (i < j) {
      const tr = re[i]!
      re[i] = re[j]!
      re[j] = tr
      const ti = im[i]!
      im[i] = im[j]!
      im[j] = ti
    }
  }

  const cosT = inverse ? plan.cosInv : plan.cosFwd
  const sinT = inverse ? plan.sinInv : plan.sinFwd

  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1
    for (let start = 0; start < n; start += size) {
      for (let j = 0; j < half; j++) {
        const i0 = start + j
        const i1 = i0 + half
        const wr = cosT[half + j]!
        const wi = sinT[half + j]!
        const ur = re[i0]!
        const ui = im[i0]!
        const vr = re[i1]!
        const vi = im[i1]!
        const tr = wr * vr - wi * vi
        const ti = wr * vi + wi * vr
        re[i0] = ur + tr
        im[i0] = ui + ti
        re[i1] = ur - tr
        im[i1] = ui - ti
      }
    }
  }

  if (inverse) {
    const invN = 1 / n
    for (let i = 0; i < n; i++) {
      re[i] = re[i]! * invN
      im[i] = im[i]! * invN
    }
  }
}

function fft2DInPlace(
  planX: FftPlan1D,
  planY: FftPlan1D,
  re: Float64Array,
  im: Float64Array,
  inverse: boolean,
  lineReX: Float64Array,
  lineImX: Float64Array,
  lineReY: Float64Array,
  lineImY: Float64Array,
): void {
  const nx = planX.n
  const ny = planY.n

  // Transform along y (contiguous rows)
  for (let x = 0; x < nx; x++) {
    const base = x * ny
    for (let y = 0; y < ny; y++) {
      lineReY[y] = re[base + y]!
      lineImY[y] = im[base + y]!
    }
    fft1DInPlace(planY, lineReY, lineImY, inverse)
    for (let y = 0; y < ny; y++) {
      re[base + y] = lineReY[y]!
      im[base + y] = lineImY[y]!
    }
  }

  // Transform along x (strided columns)
  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const idx = x * ny + y
      lineReX[x] = re[idx]!
      lineImX[x] = im[idx]!
    }
    fft1DInPlace(planX, lineReX, lineImX, inverse)
    for (let x = 0; x < nx; x++) {
      const idx = x * ny + y
      re[idx] = lineReX[x]!
      im[idx] = lineImX[x]!
    }
  }
}

// -------------------------------------------------------------------------------------------------
// Metric & refractive-index helpers (isotropic PPN cusp metric)
// -------------------------------------------------------------------------------------------------

type MetricSpec = {
  readonly rg: number // G_eff * M / c_u^2
  readonly gammaPPN: number
  readonly betaPPN: number
  readonly screenedMu: number // 0 for 1/r warped cusp, > 0 for raw unwarped bulk control
  readonly screenedScale: number // 1 for warped cusp, K_eff / K_raw for raw bulk control
  readonly rSoft: number // 0 for point rays/orbits, tiny core softening for 2D wavepacket grid
}

function evalUAndDuDr(spec: MetricSpec, r: number): { readonly u: number; readonly duDr: number } {
  const rs = spec.rSoft > 0 ? Math.hypot(r, spec.rSoft) : r
  const dRsDr = spec.rSoft > 0 ? r / rs : 1
  if (spec.screenedMu > 0) {
    const expTerm = Math.exp(-spec.screenedMu * rs)
    const u = (spec.rg * spec.screenedScale * expTerm) / rs
    const duDrs = -u * (spec.screenedMu + 1 / rs)
    return { u, duDr: duDrs * dRsDr }
  }
  const u = spec.rg / rs
  const duDrs = -u / rs
  return { u, duDr: duDrs * dRsDr }
}

function evalMetric(
  spec: MetricSpec,
  r: number,
): {
  readonly u: number
  readonly a: number
  readonly b: number
  readonly nSq: number
  readonly n: number
  readonly dNSqDr: number
} {
  const { u, duDr } = evalUAndDuDr(spec, r)
  const a = 1 - 2 * u + 2 * spec.betaPPN * u * u
  const b = 1 + 2 * spec.gammaPPN * u
  const daDu = -2 + 4 * spec.betaPPN * u
  const dbDu = 2 * spec.gammaPPN
  const nSq = b / a
  const dNSqDu = (dbDu * a - b * daDu) / (a * a)
  return {
    u,
    a,
    b,
    nSq,
    n: Math.sqrt(nSq),
    dNSqDr: dNSqDu * duDr,
  }
}

// -------------------------------------------------------------------------------------------------
// TEST 1: Gravitational Clock Redshift via live unitary chiral Weyl/Dirac internal clock
// -------------------------------------------------------------------------------------------------

export type RedshiftRadiusEntry = {
  readonly r: number
  readonly phiOverCSq: number
  readonly lapseExact: number
  readonly measuredFreq: number
  readonly maxNormErr: number
  readonly reverseErr: number
}

export type RedshiftPairEntry = {
  readonly r1: number
  readonly r2: number
  readonly measuredFracShift: number // (f(r1) - f(r2)) / f(r2) < 0 for r1 < r2
  readonly exactMetricShift: number // sqrt(g_00(r1) / g_00(r2)) - 1
  readonly weakFieldShift: number // (Phi(r1) - Phi(r2)) / c_u^2
  readonly exactMetricAbsErr: number
  readonly exactMetricRelErr: number
  readonly weakFieldAbsErr: number
  readonly weakFieldRelErr: number
}

export type GravitationalRedshiftResult = {
  readonly massM: number
  readonly omega0: number
  readonly dt: number
  readonly steps: number
  readonly radii: readonly RedshiftRadiusEntry[]
  readonly pairs: readonly RedshiftPairEntry[]
  readonly maxNormErr: number
  readonly maxReverseErr: number
  readonly maxExactMetricAbsErr: number
  readonly maxExactMetricRelErr: number
  readonly maxWeakFieldAbsErr: number
  readonly maxWeakFieldRelErr: number
  readonly flatControlMaxShift: number
  readonly rawBulkControlMaxShift: number
}

function evolveChiralDiracClock(
  lapse: number,
  omega0: number,
  dt: number,
  steps: number,
): {
  readonly measuredFreq: number
  readonly maxNormErr: number
  readonly reverseErr: number
} {
  // 4-component chiral Dirac spinor in Weyl basis:
  //   gamma^0 = sigma_x (x) I_2,  gamma^5 = sigma_z (x) I_2,  Sigma_y = sigma_y (x) I_2.
  // Exact 1-step unitary propagator:
  //   U = exp(-i theta gamma^0) = cos(theta) I_4 - i sin(theta) gamma^0,  theta = omega0 * lapse * dt.
  // Initial state: purely left-handed chiral Weyl spinor psi(0) = (1, 0, 0, 0)^T (norm 1).
  const theta = omega0 * lapse * dt
  const c = Math.cos(theta)
  const s = Math.sin(theta)

  // State arrays: 4 complex components (0,1 = L; 2,3 = R)
  const re = new Float64Array([1, 0, 0, 0])
  const im = new Float64Array([0, 0, 0, 0])

  const stepDirac = (sign: 1 | -1): void => {
    const ss = sign * s
    // Couples (0 <-> 2) and (1 <-> 3) via [[c, -i ss], [-i ss, c]]
    for (let spin = 0; spin < 2; spin++) {
      const iL = spin
      const iR = spin + 2
      const lr = re[iL]!
      const li = im[iL]!
      const rr = re[iR]!
      const ri = im[iR]!
      // (-i ss) * (r + i im) = ss * im - i ss * r
      re[iL] = c * lr + ss * ri
      im[iL] = c * li - ss * rr
      re[iR] = c * rr + ss * li
      im[iR] = c * ri - ss * lr
    }
  }

  const evalChiralPhasor = (): { readonly cz: number; readonly cy: number; readonly normSq: number } => {
    const pL = re[0]! * re[0]! + im[0]! * im[0]! + re[1]! * re[1]! + im[1]! * im[1]!
    const pR = re[2]! * re[2]! + im[2]! * im[2]! + re[3]! * re[3]! + im[3]! * im[3]!
    // <psi| sigma_y (x) I_2 |psi> = 2 Im(psi_L^dag psi_R)
    const imCross =
      re[0]! * im[2]! - im[0]! * re[2]! + (re[1]! * im[3]! - im[1]! * re[3]!)
    return {
      cz: pL - pR,
      cy: -2 * imCross, // Z(n) = cz + i (-2 Im(psi_L^dag psi_R)) = exp(+i 2 n theta)
      normSq: pL + pR,
    }
  }

  let prev = evalChiralPhasor()
  let totalPhase = 0
  let maxNormErr = Math.abs(Math.sqrt(prev.normSq) - 1)

  for (let n = 0; n < steps; n++) {
    stepDirac(1)
    const cur = evalChiralPhasor()
    maxNormErr = Math.max(maxNormErr, Math.abs(Math.sqrt(cur.normSq) - 1))
    // Phase increment atan2(Im(Z_cur * conj(Z_prev)), Re(Z_cur * conj(Z_prev)))
    const dotRe = cur.cz * prev.cz + cur.cy * prev.cy
    const dotIm = cur.cy * prev.cz - cur.cz * prev.cy
    totalPhase += Math.atan2(dotIm, dotRe)
    prev = cur
  }

  // Exact U^dag time reversal for all steps
  for (let n = 0; n < steps; n++) {
    stepDirac(-1)
  }
  const initRe = [1, 0, 0, 0] as const
  let errSq = 0
  for (let i = 0; i < 4; i++) {
    const dr = re[i]! - initRe[i]!
    const di = im[i]!
    errSq += dr * dr + di * di
  }

  return {
    measuredFreq: totalPhase / (2 * Math.PI * steps * dt),
    maxNormErr,
    reverseErr: Math.sqrt(errSq),
  }
}

function runGravitationalRedshift(
  gEff: number,
  cU: number,
  kEff: number,
  rawBulk: RawScreenedBulkModel,
): GravitationalRedshiftResult {
  const massM = 1.0
  const rg = (gEff * massM) / (cU * cU)
  const omega0 = 0.25
  const dt = 0.2
  const steps = 400
  // 4 radii spanning weak-field |Phi|/c_u^2 in [0.99e-3, 3.96e-3]
  const rs = [20, 30, 50, 80] as const

  const specGR: MetricSpec = {
    rg,
    gammaPPN: 1,
    betaPPN: 1,
    screenedMu: 0,
    screenedScale: 1,
    rSoft: 0,
  }
  const specRaw: MetricSpec = {
    rg,
    gammaPPN: 1,
    betaPPN: 1,
    screenedMu: rawBulk.muRaw,
    screenedScale: kEff / rawBulk.kRaw,
    rSoft: 0,
  }

  const radii: RedshiftRadiusEntry[] = []
  let maxNormErr = 0
  let maxReverseErr = 0

  for (const r of rs) {
    const m = evalMetric(specGR, r)
    const lapse = Math.sqrt(m.a)
    const sim = evolveChiralDiracClock(lapse, omega0, dt, steps)
    maxNormErr = Math.max(maxNormErr, sim.maxNormErr)
    maxReverseErr = Math.max(maxReverseErr, sim.reverseErr)
    radii.push({
      r,
      phiOverCSq: -m.u,
      lapseExact: lapse,
      measuredFreq: sim.measuredFreq,
      maxNormErr: sim.maxNormErr,
      reverseErr: sim.reverseErr,
    })
  }

  const pairs: RedshiftPairEntry[] = []
  let maxExactMetricAbsErr = 0
  let maxExactMetricRelErr = 0
  let maxWeakFieldAbsErr = 0
  let maxWeakFieldRelErr = 0

  for (let i = 0; i < radii.length; i++) {
    for (let j = i + 1; j < radii.length; j++) {
      const a = radii[i]!
      const b = radii[j]!
      // Fractional frequency redshift of deeper clock r1 relative to outer clock r2
      const measuredFracShift = (a.measuredFreq - b.measuredFreq) / b.measuredFreq
      const exactMetricShift = a.lapseExact / b.lapseExact - 1
      const weakFieldShift = a.phiOverCSq - b.phiOverCSq
      const exactMetricAbsErr = Math.abs(measuredFracShift - exactMetricShift)
      const exactMetricRelErr = exactMetricAbsErr / Math.abs(exactMetricShift)
      const weakFieldAbsErr = Math.abs(measuredFracShift - weakFieldShift)
      const weakFieldRelErr = weakFieldAbsErr / Math.abs(weakFieldShift)

      maxExactMetricAbsErr = Math.max(maxExactMetricAbsErr, exactMetricAbsErr)
      maxExactMetricRelErr = Math.max(maxExactMetricRelErr, exactMetricRelErr)
      maxWeakFieldAbsErr = Math.max(maxWeakFieldAbsErr, weakFieldAbsErr)
      maxWeakFieldRelErr = Math.max(maxWeakFieldRelErr, weakFieldRelErr)

      pairs.push({
        r1: a.r,
        r2: b.r,
        measuredFracShift,
        exactMetricShift,
        weakFieldShift,
        exactMetricAbsErr,
        exactMetricRelErr,
        weakFieldAbsErr,
        weakFieldRelErr,
      })
    }
  }

  // Flat-space control (lapse = 1 at all radii)
  const flatFreq0 = evolveChiralDiracClock(1, omega0, dt, steps).measuredFreq
  const flatFreq1 = evolveChiralDiracClock(1, omega0, dt, steps).measuredFreq
  const flatControlMaxShift = Math.abs((flatFreq0 - flatFreq1) / flatFreq1)

  // Raw unwarped bulk screened control at r = 20 vs r = 80
  const rawF1 = evolveChiralDiracClock(Math.sqrt(evalMetric(specRaw, 20).a), omega0, dt, steps).measuredFreq
  const rawF2 = evolveChiralDiracClock(Math.sqrt(evalMetric(specRaw, 80).a), omega0, dt, steps).measuredFreq
  const rawBulkControlMaxShift = Math.abs((rawF1 - rawF2) / rawF2)

  return {
    massM,
    omega0,
    dt,
    steps,
    radii,
    pairs,
    maxNormErr,
    maxReverseErr,
    maxExactMetricAbsErr,
    maxExactMetricRelErr,
    maxWeakFieldAbsErr,
    maxWeakFieldRelErr,
    flatControlMaxShift,
    rawBulkControlMaxShift,
  }
}

// -------------------------------------------------------------------------------------------------
// TEST 2 & TEST 3: Exact 6th-order symplectic null rays (K_null = 1/2 |p|^2 - 1/2 n(r)^2 = 0)
// -------------------------------------------------------------------------------------------------

type NullRayState = {
  x: number
  y: number
  px: number
  py: number
  deltaT: number // exact excess coordinate time t - (x - xStart) / c_u, zero cancellation
}

function stepNullVerlet(spec: MetricSpec, cU: number, st: NullRayState, ds: number): void {
  const half = 0.5 * ds

  // Kick 1
  const r0 = Math.hypot(st.x, st.y)
  const m0 = evalMetric(spec, r0)
  const f0 = 0.5 * m0.dNSqDr / r0
  st.px += half * f0 * st.x
  st.py += half * f0 * st.y

  // Drift (px is constant across the drift so delta x = ds * px)
  const pxMid = st.px
  st.x += ds * pxMid
  st.y += ds * st.py

  // Kick 2
  const r1 = Math.hypot(st.x, st.y)
  const m1 = evalMetric(spec, r1)
  const f1 = 0.5 * m1.dNSqDr / r1
  st.px += half * f1 * st.x
  st.py += half * f1 * st.y

  // Exact symmetric update of excess transit time: dt - dx/c_u
  st.deltaT += (half * ((m0.nSq - 1) + (m1.nSq - 1) - 2 * (pxMid - 1))) / cU
}

function stepNullS6(spec: MetricSpec, cU: number, st: NullRayState, ds: number): void {
  for (let i = 0; i < S6_WEIGHTS.length; i++) {
    stepNullVerlet(spec, cU, st, ds * S6_WEIGHTS[i]!)
  }
}

function traceNullRayToX(
  spec: MetricSpec,
  cU: number,
  xStart: number,
  yStart: number,
  angle0: number,
  xTarget: number,
  stepsApprox: number,
): {
  readonly finalState: NullRayState
  readonly maxNullConstraintErr: number
  readonly maxAngMomErr: number
  readonly deflectionRad: number
} {
  const r0 = Math.hypot(xStart, yStart)
  const n0 = evalMetric(spec, r0).n
  const st: NullRayState = {
    x: xStart,
    y: yStart,
    px: n0 * Math.cos(angle0),
    py: n0 * Math.sin(angle0),
    deltaT: 0,
  }

  const l0 = st.x * st.py - st.y * st.px
  const dsBase = (xTarget - xStart) / stepsApprox
  let maxNullConstraintErr = 0
  let maxAngMomErr = 0

  while (st.x < xTarget) {
    const remX = xTarget - st.x
    const estDs = remX / Math.max(0.1, st.px)
    if (estDs <= dsBase) {
      // Exact landing on x = xTarget via Newton refinement on a single S6 step
      let ds = estDs
      const snapX = st.x
      const snapY = st.y
      const snapPx = st.px
      const snapPy = st.py
      const snapDeltaT = st.deltaT
      for (let it = 0; it < 6; it++) {
        st.x = snapX
        st.y = snapY
        st.px = snapPx
        st.py = snapPy
        st.deltaT = snapDeltaT
        stepNullS6(spec, cU, st, ds)
        const err = st.x - xTarget
        if (Math.abs(err) <= 1e-14) break
        ds -= err / st.px
      }
      break
    }
    stepNullS6(spec, cU, st, dsBase)
    const r = Math.hypot(st.x, st.y)
    const nSq = evalMetric(spec, r).nSq
    const kNull = 0.5 * (st.px * st.px + st.py * st.py - nSq)
    maxNullConstraintErr = Math.max(maxNullConstraintErr, Math.abs(kNull))
    const lCur = st.x * st.py - st.y * st.px
    maxAngMomErr = Math.max(maxAngMomErr, Math.abs(lCur - l0) / Math.max(1, Math.abs(l0)))
  }

  // Final check
  const rF = Math.hypot(st.x, st.y)
  const nSqF = evalMetric(spec, rF).nSq
  maxNullConstraintErr = Math.max(
    maxNullConstraintErr,
    Math.abs(0.5 * (st.px * st.px + st.py * st.py - nSqF)),
  )
  const lF = st.x * st.py - st.y * st.px
  maxAngMomErr = Math.max(maxAngMomErr, Math.abs(lF - l0) / Math.max(1, Math.abs(l0)))

  const angleOut = Math.atan2(st.py, st.px)
  const deflectionRad = angle0 - angleOut // positive for inward bending toward origin

  return {
    finalState: st,
    maxNullConstraintErr,
    maxAngMomErr,
    deflectionRad,
  }
}

export type NullRayBendingEntry = {
  readonly b: number
  readonly thetaGR: number
  readonly thetaGRTheory: number
  readonly thetaGRRelErr: number
  readonly extractedGammaPPN: number
  readonly thetaNewt: number
  readonly thetaNewtTheory: number
  readonly thetaNewtRelErr: number
  readonly grToNewtRatio: number
  readonly thetaRawBulk: number
}

// -------------------------------------------------------------------------------------------------
// TEST 2(b): Live 2D split-step unitary optical wavepacket grazing central mass
// -------------------------------------------------------------------------------------------------

export type WavepacketBendingEntry = {
  readonly b: number
  readonly thetaGR: number
  readonly thetaGRTheoryInf: number
  readonly thetaGRTheoryFinite: number
  readonly thetaGRRelErrInf: number
  readonly thetaGRRelErrFinite: number
  readonly extractedGammaPPN: number
  readonly thetaNewt: number
  readonly grToNewtRatio: number
  readonly thetaRawBulk: number
  readonly rawCollapseFactor: number
  readonly maxNormErr: number
  readonly reverseErr: number
}

export type EddingtonLightBendingResult = {
  readonly massM: number
  readonly rayEntries: readonly NullRayBendingEntry[]
  readonly rayMaxGRRelErr: number
  readonly raySlopeVsB: number
  readonly rayMeanGammaPPN: number
  readonly rayMaxNewtRelErr: number
  readonly rayMinGRToNewtRatio: number
  readonly rayMaxGRToNewtRatio: number
  readonly rayMaxNullConstraintErr: number
  readonly rayMaxAngMomErr: number
  readonly rayReverseErr: number
  readonly rayRawCollapseFactorAtB10: number
  readonly waveEntries: readonly WavepacketBendingEntry[]
  readonly waveMaxGRRelErrInf: number
  readonly waveMaxGRRelErrFinite: number
  readonly waveSlopeVsB: number
  readonly waveSlopeFiniteCorrectedVsB: number
  readonly waveMeanGammaPPN: number
  readonly waveMinGRToNewtRatio: number
  readonly waveMaxGRToNewtRatio: number
  readonly waveMaxNormErr: number
  readonly waveMaxReverseErr: number
  readonly waveMinRawCollapseFactor: number
}

function fitLogLogSlope(xs: readonly number[], ys: readonly number[]): number {
  const n = xs.length
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (let i = 0; i < n; i++) {
    const x = Math.log(xs[i]!)
    const y = Math.log(Math.max(1e-300, ys[i]!))
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
  }
  return (n * sxy - sx * sy) / (n * sxx - sx * sx)
}

function runWavepacketBending2D(
  gEff: number,
  cU: number,
  kEff: number,
  rawBulk: RawScreenedBulkModel,
): {
  readonly entries: readonly WavepacketBendingEntry[]
  readonly maxGRRelErrInf: number
  readonly maxGRRelErrFinite: number
  readonly slopeVsB: number
  readonly slopeFiniteCorrectedVsB: number
  readonly meanGammaPPN: number
  readonly minGRToNewtRatio: number
  readonly maxGRToNewtRatio: number
  readonly maxNormErr: number
  readonly maxReverseErr: number
  readonly minRawCollapseFactor: number
} {
  // 2D grid N_x = 512, N_y = 256, dx = dy = 1.0, mass shifted to (0, yMass = -24) so beams at
  // b in {22, 25, 28} pass near y = 0 with > 120 docks of clearance to both transverse boundaries.
  // Mass core softening rSoft = 0.5 is invisible at b >= 22 ((0.5/22)^2 = 5.2e-4).
  // Optical split-step Hamiltonian:
  //   H_2D = c_u |k| + c_u k_0 (1 / n(r) - 1),   n(r) = sqrt(B(r) / A(r))
  // Strictly unitary and exactly time-reversible Strang propagator.
  const nx = 512
  const ny = 256
  const vol = nx * ny
  const cx = nx / 2
  const cy = ny / 2
  const yMass = -24
  const k0 = 2.0
  const sigmaX = 4.5
  const sigmaYWaist = 1.9 // intensity RMS width at x = 0 waist
  const lHalf = 205 // travel x = -205 -> +205 (410 docks; 51-dock margin from x = +-256)
  const steps = 36
  const dt = (2 * lHalf) / (cU * steps)
  const massM = 1.0
  const rg = (gEff * massM) / (cU * cU)

  const planX = createFftPlan1D(nx)
  const planY = createFftPlan1D(ny)
  const lineReX = new Float64Array(nx)
  const lineImX = new Float64Array(nx)
  const lineReY = new Float64Array(ny)
  const lineImY = new Float64Array(ny)

  const kxArr = new Float64Array(nx)
  const kyArr = new Float64Array(ny)
  const twoPiOverNx = (2 * Math.PI) / nx
  const twoPiOverNy = (2 * Math.PI) / ny
  for (let ix = 0; ix < nx; ix++) {
    const s = ix < nx / 2 ? ix : ix - nx
    kxArr[ix] = ix === nx / 2 ? 0 : twoPiOverNx * s
  }
  for (let iy = 0; iy < ny; iy++) {
    const s = iy < ny / 2 ? iy : iy - ny
    kyArr[iy] = iy === ny / 2 ? 0 : twoPiOverNy * s
  }

  const kMag = new Float64Array(vol)
  for (let ix = 0; ix < nx; ix++) {
    const kx = ix === nx / 2 ? Math.PI : kxArr[ix]!
    const kx2 = kx * kx
    const base = ix * ny
    for (let iy = 0; iy < ny; iy++) {
      const ky = iy === ny / 2 ? Math.PI : kyArr[iy]!
      kMag[base + iy] = Math.sqrt(kx2 + ky * ky)
    }
  }

  // Precompute kinetic phase factors for dt/2, dt, and -L/c_u (backward focus to waist at x = 0)
  const makeKinTables = (tStep: number): { readonly c: Float64Array; readonly s: Float64Array } => {
    const cc = new Float64Array(vol)
    const ss = new Float64Array(vol)
    const coeff = -cU * tStep
    for (let i = 0; i < vol; i++) {
      const ang = coeff * kMag[i]!
      cc[i] = Math.cos(ang)
      ss[i] = Math.sin(ang)
    }
    return { c: cc, s: ss }
  }

  const kinHalfFwd = makeKinTables(0.5 * dt)
  const kinFullFwd = makeKinTables(dt)
  const kinHalfRev = makeKinTables(-0.5 * dt)
  const kinFullRev = makeKinTables(-dt)
  const kinBackFocus = makeKinTables(-lHalf / cU)

  const applyKin = (
    re: Float64Array,
    im: Float64Array,
    tab: { readonly c: Float64Array; readonly s: Float64Array },
  ): void => {
    fft2DInPlace(planX, planY, re, im, false, lineReX, lineImX, lineReY, lineImY)
    const cc = tab.c
    const ss = tab.s
    for (let i = 0; i < vol; i++) {
      const rv = re[i]!
      const iv = im[i]!
      const c = cc[i]!
      const s = ss[i]!
      re[i] = c * rv - s * iv
      im[i] = c * iv + s * rv
    }
    fft2DInPlace(planX, planY, re, im, true, lineReX, lineImX, lineReY, lineImY)
  }

  const buildPotTables = (
    spec: MetricSpec,
    tStep: number,
  ): { readonly c: Float64Array; readonly s: Float64Array } => {
    const cc = new Float64Array(vol)
    const ss = new Float64Array(vol)
    const coeff = -cU * k0 * tStep
    for (let ix = 0; ix < nx; ix++) {
      const x = ix - cx
      const base = ix * ny
      for (let iy = 0; iy < ny; iy++) {
        const y = iy - cy - yMass
        const r = Math.hypot(x, y)
        const n = evalMetric(spec, r).n
        const v = 1 / n - 1
        const ang = coeff * v
        cc[base + iy] = Math.cos(ang)
        ss[base + iy] = Math.sin(ang)
      }
    }
    return { c: cc, s: ss }
  }

  const applyPot = (
    re: Float64Array,
    im: Float64Array,
    tab: { readonly c: Float64Array; readonly s: Float64Array },
  ): void => {
    const cc = tab.c
    const ss = tab.s
    for (let i = 0; i < vol; i++) {
      const rv = re[i]!
      const iv = im[i]!
      const c = cc[i]!
      const s = ss[i]!
      re[i] = c * rv - s * iv
      im[i] = c * iv + s * rv
    }
  }

  const specGR: MetricSpec = {
    rg,
    gammaPPN: 1,
    betaPPN: 1,
    screenedMu: 0,
    screenedScale: 1,
    rSoft: 0.5,
  }
  const specNewt: MetricSpec = {
    rg,
    gammaPPN: 0,
    betaPPN: 1,
    screenedMu: 0,
    screenedScale: 1,
    rSoft: 0.5,
  }
  const specRaw: MetricSpec = {
    rg,
    gammaPPN: 1,
    betaPPN: 1,
    screenedMu: rawBulk.muRaw,
    screenedScale: kEff / rawBulk.kRaw,
    rSoft: 0.5,
  }

  const potGRFwd = buildPotTables(specGR, dt)
  const potGRRev = buildPotTables(specGR, -dt)
  const potNewtFwd = buildPotTables(specNewt, dt)
  const potRawFwd = buildPotTables(specRaw, dt)

  const psiRe = new Float64Array(vol)
  const psiIm = new Float64Array(vol)
  const initRe = new Float64Array(vol)
  const initIm = new Float64Array(vol)
  const kRe = new Float64Array(vol)
  const kIm = new Float64Array(vol)

  const initFocusedBeam = (b: number): void => {
    // Initialize waist at (x = 0, y = b) with carrier (k0, 0), then free-backpropagate by -lHalf / cU
    // so the beam starts centered at (-lHalf, b) and focuses right at closest approach x = 0.
    const inv4Sx2 = 1 / (4 * sigmaX * sigmaX)
    const inv4Sy2 = 1 / (4 * sigmaYWaist * sigmaYWaist)
    let normSq = 0
    for (let ix = 0; ix < nx; ix++) {
      const dx = ix - cx
      const ex = Math.exp(-dx * dx * inv4Sx2)
      const ph = k0 * dx
      const cph = Math.cos(ph)
      const sph = Math.sin(ph)
      const base = ix * ny
      for (let iy = 0; iy < ny; iy++) {
        const dy = iy - cy - (yMass + b)
        const amp = ex * Math.exp(-dy * dy * inv4Sy2)
        const rv = amp * cph
        const iv = amp * sph
        psiRe[base + iy] = rv
        psiIm[base + iy] = iv
        normSq += rv * rv + iv * iv
      }
    }
    const invN = 1 / Math.sqrt(normSq)
    for (let i = 0; i < vol; i++) {
      psiRe[i] = psiRe[i]! * invN
      psiIm[i] = psiIm[i]! * invN
    }
    applyKin(psiRe, psiIm, kinBackFocus)
  }

  const measureMomentumAngleAndNorm = (
    re: Float64Array,
    im: Float64Array,
  ): { readonly angleRad: number; readonly normErr: number } => {
    let normSq = 0
    for (let i = 0; i < vol; i++) {
      const rv = re[i]!
      const iv = im[i]!
      normSq += rv * rv + iv * iv
      kRe[i] = rv
      kIm[i] = iv
    }
    fft2DInPlace(planX, planY, kRe, kIm, false, lineReX, lineImX, lineReY, lineImY)
    let wSum = 0
    let kxSum = 0
    let kySum = 0
    for (let ix = 0; ix < nx; ix++) {
      const kx = kxArr[ix]!
      const base = ix * ny
      for (let iy = 0; iy < ny; iy++) {
        const kr = kRe[base + iy]!
        const ki = kIm[base + iy]!
        const p = kr * kr + ki * ki
        wSum += p
        kxSum += p * kx
        kySum += p * kyArr[iy]!
      }
    }
    return {
      angleRad: Math.atan2(-kySum / wSum, kxSum / wSum),
      normErr: Math.abs(Math.sqrt(normSq) - 1),
    }
  }

  const runPropagator = (
    potFwd: { readonly c: Float64Array; readonly s: Float64Array },
    potRev: { readonly c: Float64Array; readonly s: Float64Array } | null,
    b: number,
  ): { readonly deflectionRad: number; readonly maxNormErr: number; readonly reverseErr: number } => {
    initFocusedBeam(b)
    if (potRev) {
      initRe.set(psiRe)
      initIm.set(psiIm)
    }

    // Merged-interior Strang split-step forward
    applyKin(psiRe, psiIm, kinHalfFwd)
    for (let s = 0; s < steps; s++) {
      applyPot(psiRe, psiIm, potFwd)
      applyKin(psiRe, psiIm, s === steps - 1 ? kinHalfFwd : kinFullFwd)
    }

    const res = measureMomentumAngleAndNorm(psiRe, psiIm)
    let reverseErr = 0

    if (potRev) {
      applyKin(psiRe, psiIm, kinHalfRev)
      for (let s = 0; s < steps; s++) {
        applyPot(psiRe, psiIm, potRev)
        applyKin(psiRe, psiIm, s === steps - 1 ? kinHalfRev : kinFullRev)
      }
      let diffSq = 0
      for (let i = 0; i < vol; i++) {
        const dr = psiRe[i]! - initRe[i]!
        const di = psiIm[i]! - initIm[i]!
        diffSq += dr * dr + di * di
      }
      reverseErr = Math.sqrt(diffSq)
    }

    return { deflectionRad: res.angleRad, maxNormErr: res.normErr, reverseErr }
  }

  const bs = [22, 25, 28] as const
  const entries: WavepacketBendingEntry[] = []
  let maxGRRelErrInf = 0
  let maxGRRelErrFinite = 0
  let sumGamma = 0
  let minGRToNewtRatio = Infinity
  let maxGRToNewtRatio = 0
  let maxNormErr = 0
  let maxReverseErr = 0
  let minRawCollapseFactor = Infinity

  for (let idx = 0; idx < bs.length; idx++) {
    const b = bs[idx]!
    // Check exact time-reversal and raw unwarped bulk collapse on the closest impact parameter b = 22
    const gr = runPropagator(potGRFwd, idx === 0 ? potGRRev : null, b)
    const nw = runPropagator(potNewtFwd, null, b)
    const rw = idx === 0 ? runPropagator(potRawFwd, null, b) : null

    const finiteFactor = lHalf / Math.hypot(lHalf, b)
    const thetaGRTheoryInf = (4 * rg) / b
    const thetaGRTheoryFinite = thetaGRTheoryInf * finiteFactor
    const thetaGRRelErrInf = Math.abs(gr.deflectionRad / thetaGRTheoryInf - 1)
    const thetaGRRelErrFinite = Math.abs(gr.deflectionRad / thetaGRTheoryFinite - 1)
    const extractedGammaPPN = (gr.deflectionRad * b) / (2 * rg * finiteFactor) - 1
    const grToNewtRatio = gr.deflectionRad / nw.deflectionRad
    const thetaRawBulk = rw ? rw.deflectionRad : 0
    const rawCollapseFactor = rw
      ? gr.deflectionRad / Math.max(1e-30, Math.abs(rw.deflectionRad))
      : Infinity

    maxGRRelErrInf = Math.max(maxGRRelErrInf, thetaGRRelErrInf)
    maxGRRelErrFinite = Math.max(maxGRRelErrFinite, thetaGRRelErrFinite)
    sumGamma += extractedGammaPPN
    minGRToNewtRatio = Math.min(minGRToNewtRatio, grToNewtRatio)
    maxGRToNewtRatio = Math.max(maxGRToNewtRatio, grToNewtRatio)
    maxNormErr = Math.max(maxNormErr, gr.maxNormErr, nw.maxNormErr, rw ? rw.maxNormErr : 0)
    maxReverseErr = Math.max(maxReverseErr, gr.reverseErr)
    if (rw) {
      minRawCollapseFactor = Math.min(minRawCollapseFactor, rawCollapseFactor)
    }

    entries.push({
      b,
      thetaGR: gr.deflectionRad,
      thetaGRTheoryInf,
      thetaGRTheoryFinite,
      thetaGRRelErrInf,
      thetaGRRelErrFinite,
      extractedGammaPPN,
      thetaNewt: nw.deflectionRad,
      grToNewtRatio,
      thetaRawBulk,
      rawCollapseFactor,
      maxNormErr: Math.max(gr.maxNormErr, nw.maxNormErr, rw ? rw.maxNormErr : 0),
      reverseErr: gr.reverseErr,
    })
  }

  const slopeVsB = fitLogLogSlope(
    bs,
    entries.map(e => e.thetaGR),
  )
  const slopeFiniteCorrectedVsB = fitLogLogSlope(
    bs,
    entries.map(e => e.thetaGR / (lHalf / Math.hypot(lHalf, e.b))),
  )

  return {
    entries,
    maxGRRelErrInf,
    maxGRRelErrFinite,
    slopeVsB,
    slopeFiniteCorrectedVsB,
    meanGammaPPN: sumGamma / entries.length,
    minGRToNewtRatio,
    maxGRToNewtRatio,
    maxNormErr,
    maxReverseErr,
    minRawCollapseFactor,
  }
}

function runEddingtonLightBending(
  gEff: number,
  cU: number,
  kEff: number,
  rawBulk: RawScreenedBulkModel,
): EddingtonLightBendingResult {
  const massM = 1.0
  const rg = (gEff * massM) / (cU * cU)

  const specGR: MetricSpec = {
    rg,
    gammaPPN: 1,
    betaPPN: 1,
    screenedMu: 0,
    screenedScale: 1,
    rSoft: 0,
  }
  const specNewt: MetricSpec = {
    rg,
    gammaPPN: 0,
    betaPPN: 1,
    screenedMu: 0,
    screenedScale: 1,
    rSoft: 0,
  }
  const specRaw: MetricSpec = {
    rg,
    gammaPPN: 1,
    betaPPN: 1,
    screenedMu: rawBulk.muRaw,
    screenedScale: kEff / rawBulk.kRaw,
    rSoft: 0,
  }

  // (a) Exact symplectic null rays across b in {40, 60, 80, 120}, L = 40 * b
  const bs = [40, 60, 80, 120] as const
  const rayEntries: NullRayBendingEntry[] = []
  let rayMaxGRRelErr = 0
  let rayMaxNewtRelErr = 0
  let raySumGamma = 0
  let rayMinGRToNewtRatio = Infinity
  let rayMaxGRToNewtRatio = 0
  let rayMaxNullConstraintErr = 0
  let rayMaxAngMomErr = 0

  for (const b of bs) {
    const lHalf = 40 * b
    const gr = traceNullRayToX(specGR, cU, -lHalf, b, 0, lHalf, 3000)
    const nw = traceNullRayToX(specNewt, cU, -lHalf, b, 0, lHalf, 3000)
    const rw = traceNullRayToX(specRaw, cU, -lHalf, b, 0, lHalf, 1200)

    const thetaGRTheory = (4 * rg) / b
    const thetaNewtTheory = (2 * rg) / b
    const thetaGRRelErr = Math.abs(gr.deflectionRad / thetaGRTheory - 1)
    const thetaNewtRelErr = Math.abs(nw.deflectionRad / thetaNewtTheory - 1)
    const extractedGammaPPN = (gr.deflectionRad * b) / (2 * rg) - 1
    const grToNewtRatio = gr.deflectionRad / nw.deflectionRad

    rayMaxGRRelErr = Math.max(rayMaxGRRelErr, thetaGRRelErr)
    rayMaxNewtRelErr = Math.max(rayMaxNewtRelErr, thetaNewtRelErr)
    raySumGamma += extractedGammaPPN
    rayMinGRToNewtRatio = Math.min(rayMinGRToNewtRatio, grToNewtRatio)
    rayMaxGRToNewtRatio = Math.max(rayMaxGRToNewtRatio, grToNewtRatio)
    rayMaxNullConstraintErr = Math.max(
      rayMaxNullConstraintErr,
      gr.maxNullConstraintErr,
      nw.maxNullConstraintErr,
    )
    rayMaxAngMomErr = Math.max(rayMaxAngMomErr, gr.maxAngMomErr, nw.maxAngMomErr)

    rayEntries.push({
      b,
      thetaGR: gr.deflectionRad,
      thetaGRTheory,
      thetaGRRelErr,
      extractedGammaPPN,
      thetaNewt: nw.deflectionRad,
      thetaNewtTheory,
      thetaNewtRelErr,
      grToNewtRatio,
      thetaRawBulk: rw.deflectionRad,
    })
  }

  // Exact fixed-step backward time reversal test on the b = 40 null ray
  const revL = 1600
  const revB = 40
  const revSteps = 600
  const revDs = (2 * revL) / revSteps
  const revN0 = evalMetric(specGR, Math.hypot(revL, revB)).n
  const revSt: NullRayState = { x: -revL, y: revB, px: revN0, py: 0, deltaT: 0 }
  for (let s = 0; s < revSteps; s++) {
    stepNullS6(specGR, cU, revSt, revDs)
  }
  for (let s = 0; s < revSteps; s++) {
    stepNullS6(specGR, cU, revSt, -revDs)
  }
  const rayReverseErr = Math.max(
    Math.hypot(revSt.x + revL, revSt.y - revB),
    Math.hypot(revSt.px - revN0, revSt.py),
  )

  // Also test raw bulk screened collapse at closer impact parameter b = 10
  const gr10 = traceNullRayToX(specGR, cU, -400, 10, 0, 400, 500)
  const rw10 = traceNullRayToX(specRaw, cU, -400, 10, 0, 400, 500)
  const rayRawCollapseFactorAtB10 =
    gr10.deflectionRad / Math.max(1e-30, Math.abs(rw10.deflectionRad))

  const raySlopeVsB = fitLogLogSlope(
    bs,
    rayEntries.map(e => e.thetaGR),
  )

  // (b) Live 2D split-step unitary optical wavepacket
  const wave = runWavepacketBending2D(gEff, cU, kEff, rawBulk)

  return {
    massM,
    rayEntries,
    rayMaxGRRelErr,
    raySlopeVsB,
    rayMeanGammaPPN: raySumGamma / rayEntries.length,
    rayMaxNewtRelErr,
    rayMinGRToNewtRatio,
    rayMaxGRToNewtRatio,
    rayMaxNullConstraintErr,
    rayMaxAngMomErr,
    rayReverseErr,
    rayRawCollapseFactorAtB10,
    waveEntries: wave.entries,
    waveMaxGRRelErrInf: wave.maxGRRelErrInf,
    waveMaxGRRelErrFinite: wave.maxGRRelErrFinite,
    waveSlopeVsB: wave.slopeVsB,
    waveSlopeFiniteCorrectedVsB: wave.slopeFiniteCorrectedVsB,
    waveMeanGammaPPN: wave.meanGammaPPN,
    waveMinGRToNewtRatio: wave.minGRToNewtRatio,
    waveMaxGRToNewtRatio: wave.maxGRToNewtRatio,
    waveMaxNormErr: wave.maxNormErr,
    waveMaxReverseErr: wave.maxReverseErr,
    waveMinRawCollapseFactor: wave.minRawCollapseFactor,
  }
}

// -------------------------------------------------------------------------------------------------
// TEST 3: Shapiro Time Delay (exact endpoint-to-endpoint (-L, b) -> (+L, b) null geodesic)
// -------------------------------------------------------------------------------------------------

export type ShapiroEntry = {
  readonly b: number
  readonly lHalf: number
  readonly deltaTGR: number
  readonly deltaTGRTheory: number
  readonly grRelErr: number
  readonly deltaTNewt: number
  readonly deltaTNewtTheory: number
  readonly newtRelErr: number
  readonly grToNewtRatio: number
  readonly deltaTRawBulk: number
  readonly endpointErr: number
}

export type ShapiroDelayResult = {
  readonly massM: number
  readonly lHalf: number
  readonly entries: readonly ShapiroEntry[]
  readonly maxGRRelErr: number
  readonly maxNewtRelErr: number
  readonly minGRToNewtRatio: number
  readonly maxGRToNewtRatio: number
  readonly maxEndpointErr: number
  readonly flatControlDelay: number
  readonly minRawCollapseFactor: number
}

function shootEndpointNullRay(
  spec: MetricSpec,
  cU: number,
  lHalf: number,
  b: number,
): { readonly excessDelay: number; readonly endpointErr: number } {
  // Secant method on launch angle theta0 so ray from (-lHalf, b) lands exactly at (+lHalf, b)
  const steps = 1500
  let a0 = 0
  let res0 = traceNullRayToX(spec, cU, -lHalf, b, a0, lHalf, steps)
  let y0 = res0.finalState.y - b
  if (Math.abs(y0) <= 1e-12) {
    return { excessDelay: res0.finalState.deltaT, endpointErr: Math.abs(y0) }
  }

  let a1 = ((1 + spec.gammaPPN) * spec.rg) / b
  if (a1 === 0) a1 = 1e-6
  let res1 = traceNullRayToX(spec, cU, -lHalf, b, a1, lHalf, steps)
  let y1 = res1.finalState.y - b

  for (let it = 0; it < 6; it++) {
    if (Math.abs(y1) <= 1e-12) break
    const denom = y1 - y0
    if (Math.abs(denom) < 1e-30) break
    const a2 = a1 - (y1 * (a1 - a0)) / denom
    a0 = a1
    y0 = y1
    a1 = a2
    res1 = traceNullRayToX(spec, cU, -lHalf, b, a1, lHalf, steps)
    y1 = res1.finalState.y - b
  }

  return { excessDelay: res1.finalState.deltaT, endpointErr: Math.abs(y1) }
}

function runShapiroTimeDelay(
  gEff: number,
  cU: number,
  kEff: number,
  rawBulk: RawScreenedBulkModel,
): ShapiroDelayResult {
  // Weak-field non-caustic regime (b >> Einstein radius sqrt(2 r_g L) = 5.6 docks)
  const massM = 0.2
  const rg = (gEff * massM) / (cU * cU)
  const lHalf = 1000
  const bs = [40, 70, 110] as const

  const specGR: MetricSpec = {
    rg,
    gammaPPN: 1,
    betaPPN: 1,
    screenedMu: 0,
    screenedScale: 1,
    rSoft: 0,
  }
  const specNewt: MetricSpec = {
    rg,
    gammaPPN: 0,
    betaPPN: 1,
    screenedMu: 0,
    screenedScale: 1,
    rSoft: 0,
  }
  const specFlat: MetricSpec = {
    rg: 0,
    gammaPPN: 1,
    betaPPN: 1,
    screenedMu: 0,
    screenedScale: 1,
    rSoft: 0,
  }
  const specRaw: MetricSpec = {
    rg,
    gammaPPN: 1,
    betaPPN: 1,
    screenedMu: rawBulk.muRaw,
    screenedScale: kEff / rawBulk.kRaw,
    rSoft: 0,
  }

  const entries: ShapiroEntry[] = []
  let maxGRRelErr = 0
  let maxNewtRelErr = 0
  let minGRToNewtRatio = Infinity
  let maxGRToNewtRatio = 0
  let maxEndpointErr = 0
  let minRawCollapseFactor = Infinity

  for (const b of bs) {
    const gr = shootEndpointNullRay(specGR, cU, lHalf, b)
    const nw = shootEndpointNullRay(specNewt, cU, lHalf, b)
    const rw = shootEndpointNullRay(specRaw, cU, lHalf, b)

    const deltaTGR = gr.excessDelay
    const deltaTNewt = nw.excessDelay
    const deltaTRawBulk = rw.excessDelay

    const r1 = Math.hypot(lHalf, b)
    const r2 = r1
    const logTerm = Math.log((r1 + r2 + 2 * lHalf) / (r1 + r2 - 2 * lHalf))
    const deltaTGRTheory = ((2 * gEff * massM) / (cU * cU * cU)) * logTerm
    const deltaTNewtTheory = ((1 * gEff * massM) / (cU * cU * cU)) * logTerm

    const grRelErr = Math.abs(deltaTGR / deltaTGRTheory - 1)
    const newtRelErr = Math.abs(deltaTNewt / deltaTNewtTheory - 1)
    const grToNewtRatio = deltaTGR / deltaTNewt
    const endpointErr = Math.max(gr.endpointErr, nw.endpointErr)
    const rawCollapse = deltaTGR / Math.max(1e-30, Math.abs(deltaTRawBulk))

    maxGRRelErr = Math.max(maxGRRelErr, grRelErr)
    maxNewtRelErr = Math.max(maxNewtRelErr, newtRelErr)
    minGRToNewtRatio = Math.min(minGRToNewtRatio, grToNewtRatio)
    maxGRToNewtRatio = Math.max(maxGRToNewtRatio, grToNewtRatio)
    maxEndpointErr = Math.max(maxEndpointErr, endpointErr)
    minRawCollapseFactor = Math.min(minRawCollapseFactor, rawCollapse)

    entries.push({
      b,
      lHalf,
      deltaTGR,
      deltaTGRTheory,
      grRelErr,
      deltaTNewt,
      deltaTNewtTheory,
      newtRelErr,
      grToNewtRatio,
      deltaTRawBulk,
      endpointErr,
    })
  }

  const flatShot = shootEndpointNullRay(specFlat, cU, lHalf, 60)
  const flatControlDelay = Math.abs(flatShot.excessDelay)

  return {
    massM,
    lHalf,
    entries,
    maxGRRelErr,
    maxNewtRelErr,
    minGRToNewtRatio,
    maxGRToNewtRatio,
    maxEndpointErr,
    flatControlDelay,
    minRawCollapseFactor,
  }
}

// -------------------------------------------------------------------------------------------------
// TEST 4: Relativistic Perihelion Precession via exact conformal-time 6th-order symplectic geodesic
// -------------------------------------------------------------------------------------------------

type OrbitModelKind = 'ppn_gr' | 'ppn_temporal_only' | 'newtonian' | 'sr_kepler'

type OrbitState = {
  x: number
  y: number
  px: number
  py: number
}

type OrbitConfig = {
  readonly kind: OrbitModelKind
  readonly gM: number
  readonly cU: number
  readonly cSq: number
  readonly rg: number
  readonly gammaPPN: number
  readonly betaPPN: number
  readonly eSq: number // relativistic E^2 (for ppn_* models) or srE (for sr_kepler)
  readonly energy0: number // exact initial Hamiltonian value for invariant monitoring
}

function evalOrbitPotentialAndForce(
  cfg: OrbitConfig,
  x: number,
  y: number,
): { readonly vEff: number; readonly fx: number; readonly fy: number } {
  const r2 = x * x + y * y
  const r = Math.sqrt(r2)

  if (cfg.kind === 'newtonian') {
    const vEff = -cfg.gM / r
    const coeff = -cfg.gM / (r2 * r)
    return { vEff, fx: coeff * x, fy: coeff * y }
  }

  if (cfg.kind === 'sr_kepler') {
    // Exact flat-space special relativistic mass-shell:
    //   K_SR = 1/2 |p|^2 - 1/2 c_u^2 ((E_SR + rg / r)^2 - 1) = 0
    const u = cfg.rg / r
    const w = cfg.eSq + u // here cfg.eSq stores E_SR = E_tot / (m c_u^2)
    const vEff = -0.5 * cfg.cSq * (w * w - 1)
    // dV/du = -c_u^2 * w, grad(u) = -(u / r^2) q -> F = -grad(V) = +(u / r^2) (dV/du) q
    const coeff = (-cfg.cSq * w * u) / r2
    return { vEff, fx: coeff * x, fy: coeff * y }
  }

  // Exact isotropic PPN metric conformal-time separable geodesic Hamiltonian:
  //   K = B(r) (H + c_u^2 / 2) = 1/2 |p|^2 + 1/2 B(r) c_u^2 (1 - E^2 / A(r)) = 0
  const u = cfg.rg / r
  const a = 1 - 2 * u + 2 * cfg.betaPPN * u * u
  const b = 1 + 2 * cfg.gammaPPN * u
  const daDu = -2 + 4 * cfg.betaPPN * u
  const dbDu = 2 * cfg.gammaPPN
  const invA = 1 / a
  const vEff = 0.5 * b * cfg.cSq * (1 - cfg.eSq * invA)
  const dVDu = 0.5 * cfg.cSq * (dbDu * (1 - cfg.eSq * invA) + b * cfg.eSq * daDu * invA * invA)
  const coeff = (u * dVDu) / r2
  return { vEff, fx: coeff * x, fy: coeff * y }
}

function evalGeodesicEnergyMetric(cfg: OrbitConfig, st: OrbitState): number {
  const { vEff } = evalOrbitPotentialAndForce(cfg, st.x, st.y)
  const kVal = 0.5 * (st.px * st.px + st.py * st.py) + vEff
  if (cfg.kind === 'newtonian') {
    return kVal
  }
  if (cfg.kind === 'sr_kepler') {
    return kVal / cfg.cSq
  }
  // Exact normalized geodesic Hamiltonian H / c_u^2 = K / (B(r) c_u^2) - 1/2 (exact value = -1/2)
  const r = Math.hypot(st.x, st.y)
  const b = 1 + (2 * cfg.gammaPPN * cfg.rg) / r
  return kVal / (b * cfg.cSq) - 0.5
}

function stepOrbitVerlet(cfg: OrbitConfig, st: OrbitState, h: number): void {
  const half = 0.5 * h
  const f0 = evalOrbitPotentialAndForce(cfg, st.x, st.y)
  st.px += half * f0.fx
  st.py += half * f0.fy
  st.x += h * st.px
  st.y += h * st.py
  const f1 = evalOrbitPotentialAndForce(cfg, st.x, st.y)
  st.px += half * f1.fx
  st.py += half * f1.fy
}

function stepOrbitS6(cfg: OrbitConfig, st: OrbitState, h: number): void {
  for (let i = 0; i < S6_WEIGHTS.length; i++) {
    stepOrbitVerlet(cfg, st, h * S6_WEIGHTS[i]!)
  }
}

function buildBoundOrbit(
  kind: OrbitModelKind,
  gEff: number,
  massM: number,
  cU: number,
  a: number,
  e: number,
  gammaPPN: number,
  betaPPN: number,
): { readonly cfg: OrbitConfig; readonly init: OrbitState; readonly l0: number } {
  const gM = gEff * massM
  const cSq = cU * cU
  const rg = gM / cSq
  const rp = a * (1 - e)
  const ra = a * (1 + e)

  let eSq = 0
  let l0 = 0

  if (kind === 'newtonian') {
    l0 = Math.sqrt(gM * a * (1 - e * e))
    const cfgTmp: OrbitConfig = {
      kind,
      gM,
      cU,
      cSq,
      rg,
      gammaPPN: 0,
      betaPPN: 0,
      eSq: 0,
      energy0: -gM / (2 * a),
    }
    const init: OrbitState = { x: rp, y: 0, px: 0, py: l0 / rp }
    return { cfg: cfgTmp, init, l0 }
  }

  if (kind === 'sr_kepler') {
    // Exact turning points rp, ra for (E_SR + rg/r)^2 - 1 = L^2 / (c_u^2 r^2):
    //   rp^2 ((E_SR + up)^2 - 1) = ra^2 ((E_SR + ua)^2 - 1)
    // Quadratic in E_SR: (ra^2 - rp^2) E_SR^2 + 2 rg (ra - rp) E_SR - (ra^2 - rp^2) = 0
    // Wait: ra^2 ua^2 = rg^2 = rp^2 up^2 cancels identically!
    // Dividing by (ra - rp): (ra + rp) E_SR^2 + 2 rg E_SR - (ra + rp) = 0
    const s = ra + rp // = 2a
    const eSR = (-rg + Math.sqrt(rg * rg + s * s)) / s
    const up = rg / rp
    l0 = cU * rp * Math.sqrt((eSR + up) * (eSR + up) - 1)
    const cfg: OrbitConfig = {
      kind,
      gM,
      cU,
      cSq,
      rg,
      gammaPPN: 0,
      betaPPN: 0,
      eSq: eSR,
      energy0: 0,
    }
    const init: OrbitState = { x: rp, y: 0, px: 0, py: l0 / rp }
    return { cfg, init, l0 }
  }

  // Exact turning points rp, ra for isotropic PPN metric:
  //   f_p (E^2 / A_p - 1) = f_a (E^2 / A_a - 1),   f(r) = B(r) r^2
  const up = rg / rp
  const ua = rg / ra
  const ap = 1 - 2 * up + 2 * betaPPN * up * up
  const aa = 1 - 2 * ua + 2 * betaPPN * ua * ua
  const bp = 1 + 2 * gammaPPN * up
  const ba = 1 + 2 * gammaPPN * ua
  const fp = bp * rp * rp
  const fa = ba * ra * ra
  eSq = (fa - fp) / (fa / aa - fp / ap)
  l0 = cU * Math.sqrt(fp * (eSq / ap - 1))

  const cfg: OrbitConfig = {
    kind,
    gM,
    cU,
    cSq,
    rg,
    gammaPPN,
    betaPPN,
    eSq,
    energy0: -0.5,
  }
  const init: OrbitState = { x: rp, y: 0, px: 0, py: l0 / rp }
  return { cfg, init, l0 }
}

function measurePerihelionPrecession(
  cfg: OrbitConfig,
  init: OrbitState,
  l0: number,
  a: number,
  orbits: number,
  stepsPerOrbit: number,
): {
  readonly meanDeltaPhiRad: number
  readonly maxOrbitSpreadRad: number
  readonly maxEnergyErr: number
  readonly maxAngMomErr: number
  readonly multiOrbitReverseErr: number
} {
  const periodApprox = 2 * Math.PI * Math.sqrt((a * a * a) / cfg.gM)
  const h = periodApprox / stepsPerOrbit

  const st: OrbitState = { x: init.x, y: init.y, px: init.px, py: init.py }
  const energyRef = evalGeodesicEnergyMetric(cfg, st)

  let maxEnergyErr = 0
  let maxAngMomErr = 0
  let prevPhi = Math.atan2(st.y, st.x)
  let unwrappedPhi = prevPhi
  let prevVr = st.x * st.px + st.y * st.py

  const perihelionPhis: number[] = [0]
  let totalSteps = 0
  const maxSteps = Math.ceil((orbits + 0.5) * stepsPerOrbit)

  while (perihelionPhis.length <= orbits && totalSteps < maxSteps) {
    const snapX = st.x
    const snapY = st.y
    const snapPx = st.px
    const snapPy = st.py
    const snapUnwrapped = unwrappedPhi

    stepOrbitS6(cfg, st, h)
    totalSteps++

    const eCur = evalGeodesicEnergyMetric(cfg, st)
    const eDenom = cfg.kind === 'newtonian' ? Math.abs(energyRef) : 1
    maxEnergyErr = Math.max(maxEnergyErr, Math.abs(eCur - energyRef) / eDenom)

    const lCur = st.x * st.py - st.y * st.px
    maxAngMomErr = Math.max(maxAngMomErr, Math.abs(lCur - l0) / Math.abs(l0))

    const phi = Math.atan2(st.y, st.x)
    let dPhi = phi - prevPhi
    if (dPhi <= -Math.PI) dPhi += 2 * Math.PI
    if (dPhi > Math.PI) dPhi -= 2 * Math.PI
    unwrappedPhi += dPhi
    prevPhi = phi

    const vr = st.x * st.px + st.y * st.py
    if (prevVr < 0 && vr >= 0 && unwrappedPhi > Math.PI) {
      // Bisect exact perihelion r_dot = x*px + y*py = 0 inside [0, h]
      let lo = 0
      let hi = h
      const probe: OrbitState = { x: snapX, y: snapY, px: snapPx, py: snapPy }
      for (let it = 0; it < 48; it++) {
        const mid = 0.5 * (lo + hi)
        probe.x = snapX
        probe.y = snapY
        probe.px = snapPx
        probe.py = snapPy
        stepOrbitS6(cfg, probe, mid)
        const vMid = probe.x * probe.px + probe.y * probe.py
        if (vMid < 0) {
          lo = mid
        } else {
          hi = mid
        }
      }
      const pPhi = Math.atan2(probe.y, probe.x)
      const snapBase = Math.atan2(snapY, snapX)
      let delta = pPhi - snapBase
      if (delta <= -Math.PI) delta += 2 * Math.PI
      if (delta > Math.PI) delta -= 2 * Math.PI
      perihelionPhis.push(snapUnwrapped + delta)
    }
    prevVr = vr
  }

  const advances: number[] = []
  for (let i = 1; i < perihelionPhis.length; i++) {
    advances.push(perihelionPhis[i]! - perihelionPhis[i - 1]! - 2 * Math.PI)
  }
  const meanDeltaPhiRad = advances.reduce((acc, v) => acc + v, 0) / advances.length
  const maxOrbitSpreadRad = Math.max(...advances) - Math.min(...advances)

  // Exact multi-orbit backward time reversal from the final state back to t = 0
  for (let s = 0; s < totalSteps; s++) {
    stepOrbitS6(cfg, st, -h)
  }
  const posErr = Math.hypot(st.x - init.x, st.y - init.y) / a
  const momErr = Math.hypot(st.px - init.px, st.py - init.py) / (l0 / init.x)
  const multiOrbitReverseErr = Math.max(posErr, momErr)

  return {
    meanDeltaPhiRad,
    maxOrbitSpreadRad,
    maxEnergyErr,
    maxAngMomErr,
    multiOrbitReverseErr,
  }
}

export type PrecessionEccentricityEntry = {
  readonly e: number
  readonly a: number
  readonly deltaPhiGR: number
  readonly deltaPhiEinstein: number
  readonly grRelErr: number
  readonly deltaPhiNewt: number
  readonly deltaPhiTemporalOnly: number
  readonly temporalOnlyRatioToGR: number // exact Will PPN (2 + 2*0 - 1)/3 = 1/3
  readonly deltaPhiSRKepler: number
  readonly srKeplerRatioToGR: number // exact Sommerfeld SR Kepler = 1/6
  readonly energyErr: number
  readonly angMomErr: number
  readonly reverseErr: number
}

export type PerihelionPrecessionResult = {
  readonly massM: number
  readonly semiMajorA: number
  readonly orbitsPerRun: number
  readonly entries: readonly PrecessionEccentricityEntry[]
  readonly maxGRRelErr: number
  readonly maxNewtAbsRad: number
  readonly maxTemporalOnlyRatioErrFromThird: number
  readonly maxSRKeplerRatioErrFromSixth: number
  readonly maxEnergyErr: number
  readonly maxAngMomErr: number
  readonly maxReverseErr: number
}

function runPerihelionPrecession(gEff: number, cU: number): PerihelionPrecessionResult {
  const massM = 1.0
  const semiMajorA = 200
  const orbitsPerRun = 3
  const stepsPerOrbit = 3000
  const eccentricities = [0.2, 0.4, 0.6] as const

  const entries: PrecessionEccentricityEntry[] = []
  let maxGRRelErr = 0
  let maxNewtAbsRad = 0
  let maxTemporalOnlyRatioErrFromThird = 0
  let maxSRKeplerRatioErrFromSixth = 0
  let maxEnergyErr = 0
  let maxAngMomErr = 0
  let maxReverseErr = 0

  for (const e of eccentricities) {
    const grSetup = buildBoundOrbit('ppn_gr', gEff, massM, cU, semiMajorA, e, 1, 1)
    const grRun = measurePerihelionPrecession(
      grSetup.cfg,
      grSetup.init,
      grSetup.l0,
      semiMajorA,
      orbitsPerRun,
      stepsPerOrbit,
    )

    const nwSetup = buildBoundOrbit('newtonian', gEff, massM, cU, semiMajorA, e, 0, 0)
    const nwRun = measurePerihelionPrecession(
      nwSetup.cfg,
      nwSetup.init,
      nwSetup.l0,
      semiMajorA,
      orbitsPerRun,
      stepsPerOrbit,
    )

    const tempSetup = buildBoundOrbit('ppn_temporal_only', gEff, massM, cU, semiMajorA, e, 0, 1)
    const tempRun = measurePerihelionPrecession(
      tempSetup.cfg,
      tempSetup.init,
      tempSetup.l0,
      semiMajorA,
      orbitsPerRun,
      stepsPerOrbit,
    )

    const srSetup = buildBoundOrbit('sr_kepler', gEff, massM, cU, semiMajorA, e, 0, 0)
    const srRun = measurePerihelionPrecession(
      srSetup.cfg,
      srSetup.init,
      srSetup.l0,
      semiMajorA,
      orbitsPerRun,
      stepsPerOrbit,
    )

    const deltaPhiEinstein = (6 * Math.PI * gEff * massM) / (semiMajorA * (1 - e * e) * cU * cU)
    const grRelErr = Math.abs(grRun.meanDeltaPhiRad / deltaPhiEinstein - 1)
    const temporalOnlyRatioToGR = tempRun.meanDeltaPhiRad / grRun.meanDeltaPhiRad
    const srKeplerRatioToGR = srRun.meanDeltaPhiRad / grRun.meanDeltaPhiRad

    maxGRRelErr = Math.max(maxGRRelErr, grRelErr)
    maxNewtAbsRad = Math.max(maxNewtAbsRad, Math.abs(nwRun.meanDeltaPhiRad))
    maxTemporalOnlyRatioErrFromThird = Math.max(
      maxTemporalOnlyRatioErrFromThird,
      Math.abs(temporalOnlyRatioToGR - 1 / 3),
    )
    maxSRKeplerRatioErrFromSixth = Math.max(
      maxSRKeplerRatioErrFromSixth,
      Math.abs(srKeplerRatioToGR - 1 / 6),
    )
    maxEnergyErr = Math.max(
      maxEnergyErr,
      grRun.maxEnergyErr,
      nwRun.maxEnergyErr,
      tempRun.maxEnergyErr,
      srRun.maxEnergyErr,
    )
    maxAngMomErr = Math.max(
      maxAngMomErr,
      grRun.maxAngMomErr,
      nwRun.maxAngMomErr,
      tempRun.maxAngMomErr,
      srRun.maxAngMomErr,
    )
    maxReverseErr = Math.max(
      maxReverseErr,
      grRun.multiOrbitReverseErr,
      nwRun.multiOrbitReverseErr,
      tempRun.multiOrbitReverseErr,
      srRun.multiOrbitReverseErr,
    )

    entries.push({
      e,
      a: semiMajorA,
      deltaPhiGR: grRun.meanDeltaPhiRad,
      deltaPhiEinstein,
      grRelErr,
      deltaPhiNewt: nwRun.meanDeltaPhiRad,
      deltaPhiTemporalOnly: tempRun.meanDeltaPhiRad,
      temporalOnlyRatioToGR,
      deltaPhiSRKepler: srRun.meanDeltaPhiRad,
      srKeplerRatioToGR,
      energyErr: grRun.maxEnergyErr,
      angMomErr: grRun.maxAngMomErr,
      reverseErr: grRun.multiOrbitReverseErr,
    })
  }

  return {
    massM,
    semiMajorA,
    orbitsPerRun,
    entries,
    maxGRRelErr,
    maxNewtAbsRad,
    maxTemporalOnlyRatioErrFromThird,
    maxSRKeplerRatioErrFromSixth,
    maxEnergyErr,
    maxAngMomErr,
    maxReverseErr,
  }
}

// -------------------------------------------------------------------------------------------------
// Main runner: Frontier 6 Post-Newtonian General Relativity (E-GRV-0159)
// -------------------------------------------------------------------------------------------------

export type PostNewtonianGRResult = {
  readonly kEff: number
  readonly gEff: number
  readonly mEff: number
  readonly cUniversal: number
  readonly rawBulkY0: number
  readonly rawBulkKRaw: number
  readonly rawBulkMu: number
  readonly rawBulkLatticeG1: number
  readonly rawBulkLatticeG6: number
  readonly rawBulkLatticeG8: number
  readonly redshift: GravitationalRedshiftResult
  readonly lightBending: EddingtonLightBendingResult
  readonly shapiro: ShapiroDelayResult
  readonly precession: PerihelionPrecessionResult
  readonly elapsedSeconds: number
}

export function runPostNewtonianGR(): PostNewtonianGRResult {
  const t0 = Date.now()

  // Parameter-free {3,4,3,4} constants straight from E-GRV-0157 & E-RLT-0125
  const col = buildWarpedColumnData(16)
  const kEff = col.kEffNeumann
  const gEff = 1 / (4 * Math.PI * kEff)
  const mEff = col.mEff
  const cUniversal = col.cUniversal

  // Exact {3,4,3,4} raw unwarped bulk screened control (w(D) = 1, F = 12)
  const rawBulk = buildRawScreenedBulkModel(12)

  // Four classic post-Newtonian General Relativity tests
  const redshift = runGravitationalRedshift(gEff, cUniversal, kEff, rawBulk)
  const lightBending = runEddingtonLightBending(gEff, cUniversal, kEff, rawBulk)
  const shapiro = runShapiroTimeDelay(gEff, cUniversal, kEff, rawBulk)
  const precession = runPerihelionPrecession(gEff, cUniversal)

  return {
    kEff,
    gEff,
    mEff,
    cUniversal,
    rawBulkY0: rawBulk.y0Zero,
    rawBulkKRaw: rawBulk.kRaw,
    rawBulkMu: rawBulk.muRaw,
    rawBulkLatticeG1: rawBulk.latticeG1,
    rawBulkLatticeG6: rawBulk.latticeG6,
    rawBulkLatticeG8: rawBulk.latticeG8,
    redshift,
    lightBending,
    shapiro,
    precession,
    elapsedSeconds: (Date.now() - t0) / 1000,
  }
}
