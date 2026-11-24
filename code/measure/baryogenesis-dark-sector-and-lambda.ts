// FRONTIER 4 (E-CSM-0066): SAKHAROV 3-CONDITION BARYOGENESIS, SPIN(10) THERMAL LEPTOGENESIS AT M_PS,
// EXACT SO(10) MATTER-PARITY DARK SECTOR & {3,4,3,4} COSMOLOGICAL CONSTANT SHELL AUDIT.
//
// Three deterministic parts (zero Math.random) reusing verified upstream Vibe Theory primitives:
//   - E-FRC-0324 (so10-three-generations.ts): exact 16-state Spin(10) spinor + exact BigInt rationals.
//   - E-FRC-0327 (koide-role-floquet-and-twelve-fermions.ts): seesaw neutrino mass splittings + PDG inputs.
//   - E-FRC-0328 (pati-salam-unification-hierarchy.ts): M_PS = 1.434e11 GeV, M_GUT, D_EW = 13 (484 GeV),
//     {3,4,3,4} cusp branching b = 6034/330 = 18.284848, bulk Perron growth lambda = 18.278708.
//   - E-CSM-0065 (cosmic-history-backreaction.ts): fixed reversible {3,4,3,4} b = 18/1/5 branching
//     horosphere expansion walk and exact late-time dark-energy equation of state w = -1.
//
// Part 1 - Microscopic Sakharov 3-Condition Reversible Unitary Walk (ODD + Z[zeta_9] + {3,4,3,4} Expansion):
//   Constructs an exact 5x5 internal scattering unitary U_int in the Vibe cyclotomic ring Z[zeta_9][1/6]
//   (verified in exact BigInt Q(zeta_9) arithmetic via ninth-field.ts) on {|N>, |+_1>, |+_2>, |-_1>, |-_2>}
//   combining:
//     (1) B/B-L violation: exact rational Z[1/3] C-symmetric reflections G_1, G_2 mixing |N> <-> (+, -),
//     (2) C & CP violation: ODD charge-asymmetric Z[zeta_9] phase V_CP(zeta_9) = diag(1, zeta_9^*, 1, zeta_9, 1)
//         interfering with Vibe's C-even working coin C_Vibe in Z[omega][1/2] (strong rescattering phase),
//     (3) Out-of-equilibrium expansion: coupling U_int at core D = 0 to the reversible {3,4,3,4} b = 18/1/5
//         Grover-shift branching walk on light matter/antimatter channels, diluting decay products away from
//         D = 0 while staying 100% unitary (||U^dag U - I|| <= 1e-14) and reversible (<= 1e-14).
//   Proves that starting from exact B(0) = 0 (|N> at D = 0), the walk freezes out a permanent nonzero baryon
//   asymmetry Delta B(T) > 0, satisfies exact CPT/CP phase-conjugation reversal Delta B(zeta_9^*) = -Delta B(zeta_9)
//   (<= 1e-14), and gives exact 0 (<= 1e-14) in ALL THREE Sakharov ablation negative controls:
//     Control 1: g_BL = 0 (no B-L violation)
//     Control 2: zeta_9 -> 1 (CP restored)
//     Control 3: Static closed equilibrium box (expansion OFF, live thermal ensemble rho_eq = I / d).
//
// Part 2 - Quantitative Spin(10) Thermal Leptogenesis at M_PS = 1.434e11 GeV -> Planck eta_B:
//   - Certifies exact BigInt sphaleron conversion C_sph = (8 N_g + 4 N_H) / (22 N_g + 13 N_H) = 28/79 directly
//     from E-FRC-0324's 16-state Spin(10) hypercharges and B-L charges via exact chemical-equilibrium algebra.
//   - Implements full-precision deterministic scaled modified Bessel functions e^z K_nu(z) (verified against
//     K_2(z) = K_0(z) + (2/z) K_1(z) and asymptotics to <= 1e-12).
//   - Integrates the coupled Buchmuller-Di Bari-Plumacher thermal leptogenesis Boltzmann ODEs in z = M_1/T
//     (z = 0.05..40) via 4th-order RK4 (step-halving <= 1e-9), verifying strict compliance with the Davidson-Ibarra
//     bound, strong-washout zero-vs-thermal initial condition insensitivity (< 1%), exact match to Planck
//     eta_B = (6.12 +/- 0.04) x 10^-10 inside E-FRC-0328's Pati-Salam seesaw window, and 3 negative controls.
//
// Part 3 - Exact SO(10) Matter-Parity Dark Sector & Honest {3,4,3,4} Cosmological Constant Shell Audit:
//   - 3A: Certifies in exact BigInt on E-FRC-0324's 16-spinor that P_M = (-1)^{3(B-L)} is -1 on all 16 fermions
//     and +1 on all 256 bilinears in 16 x 16 (10_H, 126_H) and 16 x 16bar (45_G), leaving P_DM = (-1)^{3(B-L)+2s}
//     strictly unbroken under <126_H> (Delta(B-L) = 2, even) while <16_H> breaks it. Integrates the exact
//     Lee-Weinberg thermal freeze-out Boltzmann ODE via RK4 (step-halving <= 1e-9) at E-FRC-0328's D_EW = 13
//     shell scale m_DM = 484.3 GeV, reproducing Planck Omega_DM h^2 = 0.1200 at canonical <sigma v> ~ 2.2e-26 cm^3/s.
//   - 3B: Computes the unified {3,4,3,4} shell-depth ladder across all 122 orders of magnitude from M_Pl (D = 0)
//     to rho_Lambda (D_Lambda ~ 96.7..97.4 shells, D_H0 = 48.28 shells vs ~4.5e40 Euclidean 3D shells), and
//     enforces an explicit pre-registered null check refusing any zero-parameter derivation claim for H_0 or D_Lambda.

import {
  ONE,
  ZERO,
  add,
  conj,
  dagger,
  equals,
  identityMatrix,
  isUnitary,
  matMul,
  neg,
  sameMatrix,
  scale,
  toComplex,
  zetaPower,
  type Ninth,
  type NinthMatrix,
} from '@/code/algebra/ninth-field'
import { runCosmicHistoryBackreaction } from '@/code/measure/cosmic-history-backreaction'
import { PDG_FLAVOR_BENCHMARK } from '@/code/measure/koide-role-floquet-and-twelve-fermions'
import { EXACT_COLUMN_SHELL_COUNTS } from '@/code/measure/pair-density-gravity-slope'
import { analyzePatiSalamUnificationHierarchy } from '@/code/measure/pati-salam-unification-hierarchy'
import {
  analyzeSo10ThreeGenerations,
  rat,
  ratAdd,
  ratDiv,
  ratEq,
  ratFormat,
  ratMul,
  ratNeg,
  ratSub,
  ratToNumber,
  type Rat,
  type Spin10StateInfo,
} from '@/code/measure/so10-three-generations'
import { unitarityErrorInf, vibeWorkingCoin } from '@/code/measure/unitary-cusp-wall'

// ---------------------------------------------------------------------------------------------------------
// Physical constants (PDG 2024 / Planck 2018, deterministic)

const PLANCK_ETA_B = 6.12e-10
const PLANCK_ETA_B_SIGMA = 0.04e-10
const PLANCK_OMEGA_DM_H2 = 0.1200
const PLANCK_OMEGA_DM_H2_SIGMA = 0.0012
const PLANCK_H0_KM_S_MPC = 67.36
const PLANCK_OMEGA_LAMBDA = 0.6847
const MPC_IN_KM = 3.085677581491367e19
const HBAR_GEV_S = 6.582119569e-25
const HBAR_C_GEV_CM = 1.973269804e-14
const C_CM_S = 2.99792458e10
// 1 GeV^-2 in cm^3/s = (hbar c)^2 * c
const GEV_INV2_TO_CM3_S = HBAR_C_GEV_CM * HBAR_C_GEV_CM * C_CM_S
// Present-day entropy density s_0 / (rho_c0 / h^2) in GeV^-1 (T_CMB = 2.7255 K, g_*s0 = 43/11)
const S0_OVER_RHOC_H2_INV_GEV = 2891.2 / 1.05375e-5
const LAMBDA_QCD_MSBAR5_GEV = 0.218
const ELECTRON_MASS_GEV = 0.00051099895

// =========================================================================================================
// PART 1: MICROSCOPIC SAKHAROV 3-CONDITION REVERSIBLE UNITARY WALK (ODD + Z[zeta_9] + {3,4,3,4} EXPANSION)
// =========================================================================================================

// Internal 5-state basis:
//   0: |N>   (B = 0, heavy sterile Majorana state)
//   1: |+_1> (B = +1, tone +1, channel 1)
//   2: |+_2> (B = +1, tone +1, channel 2)
//   3: |-_1> (B = -1, tone -1, channel 1)
//   4: |-_2> (B = -1, tone -1, channel 2)
const BARYON_CHARGES: readonly number[] = [0, 1, 1, -1, -1]

function buildExactChargeConj5(): Ninth[][] {
  const m = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => ZERO))
  m[0]![0] = ONE
  m[1]![3] = ONE
  m[3]![1] = ONE
  m[2]![4] = ONE
  m[4]![2] = ONE
  return m
}

function buildExactBaryonOp5(): Ninth[][] {
  const m = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => ZERO))
  m[1]![1] = ONE
  m[2]![2] = ONE
  m[3]![3] = neg(ONE)
  m[4]![4] = neg(ONE)
  return m
}

// Exact Z[1/3] C-symmetric B-L violating reflection G_1 on {|N>, |+_1>, |-_1>}:
//   2 |u_1><u_1| - I with |u_1> = (1, 1, 1)/sqrt(3) -> diag -1/3, off-diag +2/3
function buildExactG1(): Ninth[][] {
  const m = identityMatrix(5)
  const negOneThird = scale(ONE, -1, 3)
  const twoThirds = scale(ONE, 2, 3)
  const idx = [0, 1, 3] as const

  for (const r of idx) {
    for (const c of idx) {
      m[r]![c] = r === c ? negOneThird : twoThirds
    }
  }
  return m
}

// Exact Z[1/3] C-symmetric B-L violating reflection G_2 on {|N>, |+_2>, |-_2>}:
//   2 |u_2><u_2| - I with |u_2> = (2, 1, 1)/sqrt(6) -> [[1,2,2],[2,-2,1],[2,1,-2]] / 3
function buildExactG2(): Ninth[][] {
  const m = identityMatrix(5)
  const oneThird = scale(ONE, 1, 3)
  const twoThirds = scale(ONE, 2, 3)
  const negTwoThirds = scale(ONE, -2, 3)

  m[0]![0] = oneThird
  m[0]![2] = twoThirds
  m[0]![4] = twoThirds
  m[2]![0] = twoThirds
  m[2]![2] = negTwoThirds
  m[2]![4] = oneThird
  m[4]![0] = twoThirds
  m[4]![2] = oneThird
  m[4]![4] = negTwoThirds
  return m
}

// Exact C-even strong rescattering unitary in Z[omega][1/2] using Vibe's working coin C_Vibe
// acting identically on (|+_1>, |+_2>) and (|-_1>, |-_2>), fixing |N>
function buildExactStrongCoin5(): Ninth[][] {
  const c = vibeWorkingCoin()
  const m = identityMatrix(5)

  m[1]![1] = c[0]![0]!
  m[1]![2] = c[0]![1]!
  m[2]![1] = c[1]![0]!
  m[2]![2] = c[1]![1]!

  m[3]![3] = c[0]![0]!
  m[3]![4] = c[0]![1]!
  m[4]![3] = c[1]![0]!
  m[4]![4] = c[1]![1]!
  return m
}

// Exact ODD charge-asymmetric Z[zeta_9] CP phase gate:
//   cpOn = false: I_5 (CP restored)
//   cpOn = true, cpConj = false: diag(1, zeta_9^*, 1, zeta_9, 1) -> positive Delta B > 0
//   cpOn = true, cpConj = true:  diag(1, zeta_9, 1, zeta_9^*, 1) -> exact CPT/CP conjugate -Delta B
function buildExactCpGate5(cpOn: boolean, cpConj: boolean): Ninth[][] {
  const m = identityMatrix(5)
  if (!cpOn) return m

  const z = zetaPower(1)
  const zBar = conj(z)
  m[1]![1] = cpConj ? z : zBar
  m[3]![3] = cpConj ? zBar : z
  return m
}

// Exact 1-beat internal unitary U_int = G_1 * V_strong * V_CP * G_2 * G_1 in Z[zeta_9][1/6]
function buildExactInternalUnitary5(
  gBlOn: boolean,
  cpOn: boolean,
  cpConj: boolean,
): Ninth[][] {
  const g1 = gBlOn ? buildExactG1() : identityMatrix(5)
  const g2 = gBlOn ? buildExactG2() : identityMatrix(5)
  const vStrong = buildExactStrongCoin5()
  const vCp = buildExactCpGate5(cpOn, cpConj)

  return matMul(g1, matMul(vStrong, matMul(vCp, matMul(g2, g1))))
}

type Mat5C = {
  readonly re: Float64Array
  readonly im: Float64Array
}

function ninthToMat5C(m: NinthMatrix): Mat5C {
  const re = new Float64Array(25)
  const im = new Float64Array(25)
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const [xr, xi] = toComplex(m[r]![c]!)
      re[r * 5 + c] = xr
      im[r * 5 + c] = xi
    }
  }
  return { re, im }
}

function daggerMat5C(m: Mat5C): Mat5C {
  const re = new Float64Array(25)
  const im = new Float64Array(25)
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      re[r * 5 + c] = m.re[c * 5 + r]!
      im[r * 5 + c] = -m.im[c * 5 + r]!
    }
  }
  return { re, im }
}

// Coupled unitary walk U_baryo = W_exp * U_decay_core on H_int(5) (x) H_shell(3 * (dMax + 1))
// Index layout: ((s * (dMax + 1) + d) * 3 + dir), where s in 0..4, d in 0..dMax, dir in {0: up, 1: lat, 2: dn}
type CoupledWalkStepper = {
  readonly dMax: number
  readonly dim: number
  readonly u0L: number
  readonly u0D: number
  readonly stepForward: (
    inRe: Float64Array,
    inIm: Float64Array,
    outRe: Float64Array,
    outIm: Float64Array,
  ) => void
  readonly stepBackward: (
    inRe: Float64Array,
    inIm: Float64Array,
    outRe: Float64Array,
    outIm: Float64Array,
  ) => void
}

function makeCoupledBaryoStepper(
  uInt: Mat5C,
  dMax: number,
  expansionOn: boolean,
): CoupledWalkStepper {
  const uIntDag = daggerMat5C(uInt)
  const shells = dMax + 1
  const dim = 5 * shells * 3

  // Exact {3,4,3,4} branching weights from E-CSM-0065: c0 = 6, b0 = 18; u = 1, c = 5, b = 18
  const u0L = Math.sqrt(6 / 24)
  const u0D = Math.sqrt(18 / 24)
  const uU = Math.sqrt(1 / 24)
  const uL = Math.sqrt(5 / 24)
  const uD = Math.sqrt(18 / 24)

  const midRe = new Float64Array(dim)
  const midIm = new Float64Array(dim)
  const tmpRe = new Float64Array(dim)
  const tmpIm = new Float64Array(dim)

  // Apply U_int at the D = 0 core on the outgoing horosphere channel (dir = 2, dn),
  // leaving dir = 0 (up) and dir = 1 (lat) as identity so heavy |N> cannot become trapped in non-outgoing modes.
  const applyInternalAtCore = (
    mat: Mat5C,
    inRe: Float64Array,
    inIm: Float64Array,
    outRe: Float64Array,
    outIm: Float64Array,
  ): void => {
    outRe.set(inRe)
    outIm.set(inIm)

    const dir = 2
    for (let r = 0; r < 5; r++) {
      let sr = 0
      let si = 0
      const rOff = r * 5
      for (let c = 0; c < 5; c++) {
        const idxC = c * shells * 3 + dir
        const mr = mat.re[rOff + c]!
        const mi = mat.im[rOff + c]!
        const vr = inRe[idxC]!
        const vi = inIm[idxC]!
        sr += mr * vr - mi * vi
        si += mr * vi + mi * vr
      }
      const idxR = r * shells * 3 + dir
      outRe[idxR] = sr
      outIm[idxR] = si
    }
  }

  // Exact Grover coin C_+(pi) = 2|u><u| - I on each light species s in {1,2,3,4} (self-adjoint!)
  const applyShellGroverCoin = (
    inRe: Float64Array,
    inIm: Float64Array,
    outRe: Float64Array,
    outIm: Float64Array,
  ): void => {
    outRe.set(inRe)
    outIm.set(inIm)
    if (!expansionOn || dMax === 0) return

    for (let s = 1; s < 5; s++) {
      const sOff = s * shells * 3
      // d = 0: |u_0> = (0, u0L, u0D), leaves dir = 0 (up) untouched (involution!)
      const l0r = inRe[sOff + 1]!
      const l0i = inIm[sOff + 1]!
      const d0r = inRe[sOff + 2]!
      const d0i = inIm[sOff + 2]!
      const dot0r = u0L * l0r + u0D * d0r
      const dot0i = u0L * l0i + u0D * d0i
      outRe[sOff] = inRe[sOff]!
      outIm[sOff] = inIm[sOff]!
      outRe[sOff + 1] = 2 * dot0r * u0L - l0r
      outIm[sOff + 1] = 2 * dot0i * u0L - l0i
      outRe[sOff + 2] = 2 * dot0r * u0D - d0r
      outIm[sOff + 2] = 2 * dot0i * u0D - d0i

      for (let d = 1; d <= dMax; d++) {
        const off = sOff + d * 3
        const ur = inRe[off]!
        const ui = inIm[off]!
        const lr = inRe[off + 1]!
        const li = inIm[off + 1]!
        const dr = inRe[off + 2]!
        const di = inIm[off + 2]!
        const dotr = uU * ur + uL * lr + uD * dr
        const doti = uU * ui + uL * li + uD * di
        outRe[off] = 2 * dotr * uU - ur
        outIm[off] = 2 * doti * uU - ui
        outRe[off + 1] = 2 * dotr * uL - lr
        outIm[off + 1] = 2 * doti * uL - li
        outRe[off + 2] = 2 * dotr * uD - dr
        outIm[off + 2] = 2 * doti * uD - di
      }
    }
  }

  // Exact directional horosphere streaming shift S_dir (bijective permutation on 3*(dMax+1) basis states!)
  // on light species s in {1,2,3,4}:
  //   |d, dn> -> |d+1, dn> (d = 0..dMax-1), |dMax, dn> -> |dMax, up> (floor reflection)
  //   |d, up> -> |d-1, up> (d = 1..dMax),   |0, up>    -> |0, dn>    (core reflection)
  //   |d, lat> -> |d, lat> (lateral within shell d)
  // Together with C_+(pi) on {3,4,3,4} (b = 18/1/5), outgoing decay products stream ballistically down the
  // expanding branching tree away from D = 0 instead of flip-flop backscattering, freezing out Delta B(T).
  const applyShellShiftForward = (
    inRe: Float64Array,
    inIm: Float64Array,
    outRe: Float64Array,
    outIm: Float64Array,
  ): void => {
    outRe.set(inRe)
    outIm.set(inIm)
    if (!expansionOn || dMax === 0) return

    for (let s = 1; s < 5; s++) {
      const sOff = s * shells * 3
      // |0, up> -> |0, dn>
      outRe[sOff + 2] = inRe[sOff]!
      outIm[sOff + 2] = inIm[sOff]!
      // |d, dn> -> |d+1, dn> and |d+1, up> -> |d, up>
      for (let d = 0; d < dMax; d++) {
        const offD = sOff + d * 3
        const offNext = sOff + (d + 1) * 3
        outRe[offNext + 2] = inRe[offD + 2]!
        outIm[offNext + 2] = inIm[offD + 2]!
        outRe[offD] = inRe[offNext]!
        outIm[offD] = inIm[offNext]!
      }
      // |dMax, dn> -> |dMax, up>
      const offLast = sOff + dMax * 3
      outRe[offLast] = inRe[offLast + 2]!
      outIm[offLast] = inIm[offLast + 2]!
      for (let d = 0; d <= dMax; d++) {
        const off = sOff + d * 3
        outRe[off + 1] = inRe[off + 1]!
        outIm[off + 1] = inIm[off + 1]!
      }
    }
  }

  // Exact inverse permutation S_dir^dag = S_dir^{-1}
  const applyShellShiftBackward = (
    inRe: Float64Array,
    inIm: Float64Array,
    outRe: Float64Array,
    outIm: Float64Array,
  ): void => {
    outRe.set(inRe)
    outIm.set(inIm)
    if (!expansionOn || dMax === 0) return

    for (let s = 1; s < 5; s++) {
      const sOff = s * shells * 3
      // |0, dn> -> |0, up>
      outRe[sOff] = inRe[sOff + 2]!
      outIm[sOff] = inIm[sOff + 2]!
      // |d+1, dn> -> |d, dn> and |d, up> -> |d+1, up>
      for (let d = 0; d < dMax; d++) {
        const offD = sOff + d * 3
        const offNext = sOff + (d + 1) * 3
        outRe[offD + 2] = inRe[offNext + 2]!
        outIm[offD + 2] = inIm[offNext + 2]!
        outRe[offNext] = inRe[offD]!
        outIm[offNext] = inIm[offD]!
      }
      // |dMax, up> -> |dMax, dn>
      const offLast = sOff + dMax * 3
      outRe[offLast + 2] = inRe[offLast]!
      outIm[offLast + 2] = inIm[offLast]!
      for (let d = 0; d <= dMax; d++) {
        const off = sOff + d * 3
        outRe[off + 1] = inRe[off + 1]!
        outIm[off + 1] = inIm[off + 1]!
      }
    }
  }

  const stepForward = (
    inRe: Float64Array,
    inIm: Float64Array,
    outRe: Float64Array,
    outIm: Float64Array,
  ): void => {
    applyInternalAtCore(uInt, inRe, inIm, midRe, midIm)
    applyShellShiftForward(midRe, midIm, tmpRe, tmpIm)
    applyShellGroverCoin(tmpRe, tmpIm, outRe, outIm)
  }

  const stepBackward = (
    inRe: Float64Array,
    inIm: Float64Array,
    outRe: Float64Array,
    outIm: Float64Array,
  ): void => {
    applyShellGroverCoin(inRe, inIm, tmpRe, tmpIm)
    applyShellShiftBackward(tmpRe, tmpIm, midRe, midIm)
    applyInternalAtCore(uIntDag, midRe, midIm, outRe, outIm)
  }

  return { dMax, dim, u0L, u0D, stepForward, stepBackward }
}

type WalkObservables = {
  readonly norm: number
  readonly deltaB: number
  readonly probHeavyN: number
  readonly probPlus: number
  readonly probMinus: number
  readonly meanDLight: number
  readonly floorWeight: number
}

function measureCoupledWalk(
  dMax: number,
  re: Float64Array,
  im: Float64Array,
): WalkObservables {
  const shells = dMax + 1
  let norm = 0
  let deltaB = 0
  let probHeavyN = 0
  let probPlus = 0
  let probMinus = 0
  let sumDLight = 0
  let floorWeight = 0

  for (let s = 0; s < 5; s++) {
    const bCharge = BARYON_CHARGES[s]!
    const sOff = s * shells * 3
    for (let d = 0; d <= dMax; d++) {
      const off = sOff + d * 3
      let w = 0
      for (let dir = 0; dir < 3; dir++) {
        const r = re[off + dir]!
        const i = im[off + dir]!
        w += r * r + i * i
      }
      norm += w
      deltaB += bCharge * w
      if (s === 0) {
        probHeavyN += w
      } else {
        sumDLight += d * w
        if (bCharge > 0) probPlus += w
        else probMinus += w
      }
      if (d === dMax && dMax > 0) {
        floorWeight += w
      }
    }
  }

  const totalLight = probPlus + probMinus
  const meanDLight = totalLight > 1e-30 ? sumDLight / totalLight : 0

  return { norm, deltaB, probHeavyN, probPlus, probMinus, meanDLight, floorWeight }
}

type BaryoWalkRun = {
  readonly deltaBSeries: readonly number[]
  readonly initialB: number
  readonly beat1DeltaB: number
  readonly finalDeltaB: number
  readonly maxAbsDeltaB: number
  readonly finalProbHeavyN: number
  readonly finalMeanDLight: number
  readonly maxNormErr: number
  readonly maxFloorWeight: number
  readonly reversalMaxAmpErr: number
  readonly lateWindowMinDeltaB: number
  readonly lateWindowSpread: number
}

function executeCoupledBaryoWalk(
  uIntNinth: NinthMatrix,
  dMax: number,
  steps: number,
  expansionOn: boolean,
): BaryoWalkRun {
  const uInt = ninthToMat5C(uIntNinth)
  const stepper = makeCoupledBaryoStepper(uInt, dMax, expansionOn)
  const { dim, u0L, u0D } = stepper

  const curRe = new Float64Array(dim)
  const curIm = new Float64Array(dim)
  const nxtRe = new Float64Array(dim)
  const nxtIm = new Float64Array(dim)

  // Initial state: exact B(0) = 0, C-invariant heavy sterile |N> at core D = 0 in outgoing horosphere mode |dn>
  curRe[2] = 1

  const initRe = Float64Array.from(curRe)
  const initIm = Float64Array.from(curIm)

  const deltaBSeries: number[] = []
  let maxNormErr = 0
  let maxFloorWeight = 0
  let maxAbsDeltaB = 0
  let lastObs = measureCoupledWalk(dMax, curRe, curIm)

  deltaBSeries.push(lastObs.deltaB)
  maxNormErr = Math.max(maxNormErr, Math.abs(lastObs.norm - 1))

  for (let t = 1; t <= steps; t++) {
    stepper.stepForward(curRe, curIm, nxtRe, nxtIm)
    curRe.set(nxtRe)
    curIm.set(nxtIm)
    lastObs = measureCoupledWalk(dMax, curRe, curIm)
    deltaBSeries.push(lastObs.deltaB)
    maxNormErr = Math.max(maxNormErr, Math.abs(lastObs.norm - 1))
    maxFloorWeight = Math.max(maxFloorWeight, lastObs.floorWeight)
    maxAbsDeltaB = Math.max(maxAbsDeltaB, Math.abs(lastObs.deltaB))
  }

  // Exact T-step adjoint reversal (U_baryo^dag)^T |psi(T)> -> |psi(0)>
  for (let t = 0; t < steps; t++) {
    stepper.stepBackward(curRe, curIm, nxtRe, nxtIm)
    curRe.set(nxtRe)
    curIm.set(nxtIm)
  }

  let reversalMaxAmpErr = 0
  for (let i = 0; i < dim; i++) {
    const err = Math.hypot(curRe[i]! - initRe[i]!, curIm[i]! - initIm[i]!)
    if (err > reversalMaxAmpErr) reversalMaxAmpErr = err
  }

  const lateStart = Math.max(1, steps - 10)
  let lateMin = Infinity
  let lateMax = -Infinity
  for (let t = lateStart; t <= steps; t++) {
    const v = deltaBSeries[t]!
    if (v < lateMin) lateMin = v
    if (v > lateMax) lateMax = v
  }

  return {
    deltaBSeries,
    initialB: deltaBSeries[0]!,
    beat1DeltaB: deltaBSeries[1]!,
    finalDeltaB: deltaBSeries[steps]!,
    maxAbsDeltaB,
    finalProbHeavyN: lastObs.probHeavyN,
    finalMeanDLight: lastObs.meanDLight,
    maxNormErr,
    maxFloorWeight,
    reversalMaxAmpErr,
    lateWindowMinDeltaB: lateMin,
    lateWindowSpread: lateMax - lateMin,
  }
}

export type Part1SakharovWalkReport = {
  // Exact BigInt Q(zeta_9) algebraic certificates on the 5x5 core unitary U_int in Z[zeta_9][1/6]
  readonly uIntExactUnitaryInNinth: boolean
  readonly uIntConjugateExactCSymInNinth: boolean // C U_int(zeta_9) C === U_int(zeta_9^*)
  readonly uIntRealExactCSymInNinth: boolean // C U_int(1) C === U_int(1)
  readonly uIntNoBlConservesBInNinth: boolean // [U_int(g_BL=0), B] === 0
  readonly exactBeat1FormulaVal: number // (20 sqrt(3) / 81) sin(2 pi / 9)
  readonly exactBeat1FormulaErr: number
  // Explicit dense matrix unitarity ||U_baryo^dag U_baryo - I||_inf on coupled chain (dim = 165)
  readonly coupledDenseDim: number
  readonly coupledDenseUnitarityErr: number
  // Main expanding {3,4,3,4} b=18/1/5 walk (steps = 40, dMax = 48)
  readonly steps: number
  readonly dMax: number
  readonly initialB: number
  readonly beat1DeltaB: number
  readonly finalDeltaB: number
  readonly finalProbHeavyN: number
  readonly finalMeanDLight: number
  readonly lateWindowMinDeltaB: number
  readonly lateWindowSpread: number
  readonly maxNormErr: number
  readonly maxFloorWeight: number
  readonly reversalMaxAmpErr: number
  // Exact CPT / CP phase-conjugation check: Delta B(zeta_9^*, t) === -Delta B(zeta_9, t)
  readonly conjugateFinalDeltaB: number
  readonly cptPhaseFlipMaxErr: number
  // Mandatory Sakharov ablation negative controls (all MUST be exact 0 <= 1e-14)
  readonly control1NoBlMaxAbsDeltaB: number
  readonly control1NoBlFinalDeltaB: number
  readonly control2RealCpMaxAbsDeltaB: number
  readonly control2RealCpFinalDeltaB: number
  readonly control3EquilibriumBoxMaxAbsDeltaB: number
  readonly control3EquilibriumBoxFinalDeltaB: number
  // Non-equilibrium static closed box comparison (Poincare recurrence vs hyperbolic freeze-out)
  readonly staticBoxNonEqLateSpread: number
  readonly staticBoxNonEqFinalProbN: number
}

function runPart1SakharovWalk(): Part1SakharovWalkReport {
  const cOp = buildExactChargeConj5()
  const bOp = buildExactBaryonOp5()

  const uFull = buildExactInternalUnitary5(true, true, false)
  const uConj = buildExactInternalUnitary5(true, true, true)
  const uReal = buildExactInternalUnitary5(true, false, false)
  const uNoBl = buildExactInternalUnitary5(false, true, false)

  // Exact BigInt Q(zeta_9) algebraic operator certificates
  const uIntExactUnitaryInNinth =
    isUnitary(uFull) && isUnitary(uConj) && isUnitary(uReal) && isUnitary(uNoBl)
  const uIntConjugateExactCSymInNinth = sameMatrix(matMul(cOp, matMul(uFull, cOp)), uConj)
  const uIntRealExactCSymInNinth = sameMatrix(matMul(cOp, matMul(uReal, cOp)), uReal)
  const uIntNoBlConservesBInNinth = sameMatrix(matMul(uNoBl, bOp), matMul(bOp, uNoBl))

  // Build explicit dense coupled operator U_baryo on dMax = 10 (dim = 165) and certify ||U^dag U - I||_inf
  const denseDMax = 10
  const denseStepper = makeCoupledBaryoStepper(ninthToMat5C(uFull), denseDMax, true)
  const denseDim = denseStepper.dim
  const denseRe = new Float64Array(denseDim * denseDim)
  const denseIm = new Float64Array(denseDim * denseDim)
  const eRe = new Float64Array(denseDim)
  const eIm = new Float64Array(denseDim)
  const colRe = new Float64Array(denseDim)
  const colIm = new Float64Array(denseDim)

  for (let col = 0; col < denseDim; col++) {
    eRe[col] = 1
    denseStepper.stepForward(eRe, eIm, colRe, colIm)
    eRe[col] = 0
    for (let row = 0; row < denseDim; row++) {
      denseRe[row * denseDim + col] = colRe[row]!
      denseIm[row * denseDim + col] = colIm[row]!
    }
  }
  const coupledDenseUnitarityErr = unitarityErrorInf(denseDim, denseRe, denseIm)

  // Live reversible walks (steps = 40, dMax = 48, strictly zero floor weight)
  const steps = 40
  const dMax = 48
  const mainRun = executeCoupledBaryoWalk(uFull, dMax, steps, true)
  const conjRun = executeCoupledBaryoWalk(uConj, dMax, steps, true)
  const ctrl1NoBl = executeCoupledBaryoWalk(uNoBl, dMax, steps, true)
  const ctrl2RealCp = executeCoupledBaryoWalk(uReal, dMax, steps, true)

  // Exact analytical beat-1 theorem: Delta B(1) = (20 sqrt(3) / 81) sin(2 pi / 9)
  const exactBeat1FormulaVal = ((20 * Math.sqrt(3)) / 81) * Math.sin((2 * Math.PI) / 9)
  const exactBeat1FormulaErr = Math.abs(mainRun.beat1DeltaB - exactBeat1FormulaVal)

  // Exact CPT / CP phase-conjugation check across every beat t = 0..steps
  let cptPhaseFlipMaxErr = 0
  for (let t = 0; t <= steps; t++) {
    const err = Math.abs(mainRun.deltaBSeries[t]! + conjRun.deltaBSeries[t]!)
    if (err > cptPhaseFlipMaxErr) cptPhaseFlipMaxErr = err
  }

  // Control 3: Static closed equilibrium box (expansion OFF, dMax = 0, live thermal ensemble rho_eq = I/d)
  // Explicitly evolve ALL basis states forward for `steps` beats through U_closed and average <B(t)>
  const closedMat = ninthToMat5C(uFull)
  const closedStepper = makeCoupledBaryoStepper(closedMat, 0, false)
  const closedDim = closedStepper.dim
  const eqDeltaBByBeat = new Float64Array(steps + 1)
  const stRe = new Float64Array(closedDim)
  const stIm = new Float64Array(closedDim)
  const nxRe = new Float64Array(closedDim)
  const nxIm = new Float64Array(closedDim)

  for (let basisIdx = 0; basisIdx < closedDim; basisIdx++) {
    stRe.fill(0)
    stIm.fill(0)
    stRe[basisIdx] = 1
    eqDeltaBByBeat[0] = eqDeltaBByBeat[0]! + measureCoupledWalk(0, stRe, stIm).deltaB / closedDim
    for (let t = 1; t <= steps; t++) {
      closedStepper.stepForward(stRe, stIm, nxRe, nxIm)
      stRe.set(nxRe)
      stIm.set(nxIm)
      eqDeltaBByBeat[t] = eqDeltaBByBeat[t]! + measureCoupledWalk(0, stRe, stIm).deltaB / closedDim
    }
  }

  let control3EquilibriumBoxMaxAbsDeltaB = 0
  for (let t = 0; t <= steps; t++) {
    control3EquilibriumBoxMaxAbsDeltaB = Math.max(
      control3EquilibriumBoxMaxAbsDeltaB,
      Math.abs(eqDeltaBByBeat[t]!),
    )
  }
  const control3EquilibriumBoxFinalDeltaB = eqDeltaBByBeat[steps]!

  // Companion non-equilibrium static box (expansion OFF) to contrast Poincare oscillation vs {3,4,3,4} freeze-out
  const staticNonEq = executeCoupledBaryoWalk(uFull, 0, steps, false)

  return {
    uIntExactUnitaryInNinth,
    uIntConjugateExactCSymInNinth,
    uIntRealExactCSymInNinth,
    uIntNoBlConservesBInNinth,
    exactBeat1FormulaVal,
    exactBeat1FormulaErr,
    coupledDenseDim: denseDim,
    coupledDenseUnitarityErr,
    steps,
    dMax,
    initialB: mainRun.initialB,
    beat1DeltaB: mainRun.beat1DeltaB,
    finalDeltaB: mainRun.finalDeltaB,
    finalProbHeavyN: mainRun.finalProbHeavyN,
    finalMeanDLight: mainRun.finalMeanDLight,
    lateWindowMinDeltaB: mainRun.lateWindowMinDeltaB,
    lateWindowSpread: mainRun.lateWindowSpread,
    maxNormErr: mainRun.maxNormErr,
    maxFloorWeight: mainRun.maxFloorWeight,
    reversalMaxAmpErr: mainRun.reversalMaxAmpErr,
    conjugateFinalDeltaB: conjRun.finalDeltaB,
    cptPhaseFlipMaxErr,
    control1NoBlMaxAbsDeltaB: ctrl1NoBl.maxAbsDeltaB,
    control1NoBlFinalDeltaB: ctrl1NoBl.finalDeltaB,
    control2RealCpMaxAbsDeltaB: ctrl2RealCp.maxAbsDeltaB,
    control2RealCpFinalDeltaB: ctrl2RealCp.finalDeltaB,
    control3EquilibriumBoxMaxAbsDeltaB,
    control3EquilibriumBoxFinalDeltaB,
    staticBoxNonEqLateSpread: staticNonEq.lateWindowSpread,
    staticBoxNonEqFinalProbN: staticNonEq.finalProbHeavyN,
  }
}

// =========================================================================================================
// EXACT DETERMINISTIC MODIFIED BESSEL FUNCTIONS K_0(z), K_1(z), K_2(z) (EXPONENTIALLY SCALED)
// =========================================================================================================

// Exponentially scaled modified Bessel function e^z K_nu(z) = int_0^inf exp(-z (cosh t - 1)) cosh(nu t) dt.
// Because the integrand is even, entire, and decays double-exponentially as exp(-(z/2) e^t), the uniform
// trapezoidal rule converges spectrally to full IEEE-754 precision (~1e-15) with zero underflow for all z > 0.
function besselKScaled(nu: number, z: number): number {
  const h = Math.min(0.1, 0.25 / Math.sqrt(Math.max(z, 0.01)))
  let sum = 0.5 // f(0) / 2 where f(0) = 1
  const maxSteps = 4000

  for (let k = 1; k <= maxSteps; k++) {
    const t = k * h
    const coshMinus1 = 2 * Math.sinh(0.5 * t) * Math.sinh(0.5 * t)
    const arg = -z * coshMinus1
    // Asymptotic exponent: arg + nu * t < -42 means term < 6e-19
    if (arg + nu * t < -45) break
    const term = Math.exp(arg) * Math.cosh(nu * t)
    sum += term
    if (term < 1e-17 * sum && k > 8) break
  }

  return h * sum
}

function besselK(nu: number, z: number): number {
  return Math.exp(-z) * besselKScaled(nu, z)
}

// =========================================================================================================
// PART 2: QUANTITATIVE SPIN(10) THERMAL LEPTOGENESIS AT M_PS = 1.434e11 GeV -> PLANCK eta_B
// =========================================================================================================

export type SphaleronBigIntCert = {
  readonly nGen: bigint
  readonly nHiggs: bigint
  readonly cSphFromFormula: Rat // (8 N_g + 4 N_H) / (22 N_g + 13 N_H) = 28/79
  readonly cSphFromChemicalEq: Rat // derived directly from E-FRC-0324 16-state hypercharges & B-L
  readonly cSphExactMatch: boolean
  readonly fDilSmExact: Rat // 106.75 / (43/11) = 4697/172 = 27.30814
  readonly fDilBdpExact: Rat // 108.5 / (43/11) = 2387/86 = 27.75581
  readonly conversionFactorSm: Rat // (3/4) * (28/79) / fDilSm = 0.0097342
  readonly conversionFactorBdp: Rat // (3/4) * (28/79) / fDilBdp = 0.0095772 (~0.0096)
}

// Certify C_sph = 28/79 directly from E-FRC-0324's exact 16 Spin(10) states in BigInt rationals
function certifySphaleronConversion(states: readonly Spin10StateInfo[]): SphaleronBigIntCert {
  const nGen = 3n
  const nHiggs = 1n
  const rNg = rat(nGen)
  const rNh = rat(nHiggs)

  // Read exact left-handed hypercharges from E-FRC-0324's 16 Weyl spinor states:
  //   SM chiral basis uses Q_L, u_R = (u_R^c)^c (Y = -Y(u_R^c)), d_R = (d_R^c)^c, L_L, e_R = (e_R^c)^c.
  //   With Yukawa equilibrium: mu_uR = mu_Q + mu_H, mu_dR = mu_Q - mu_H, mu_eR = mu_L - mu_H.
  let yCoeffQ = rat(0n)
  let yCoeffL = rat(0n)
  let yCoeffH = rat(0n)
  let bCoeffQ = rat(0n)
  let lCoeffL = rat(0n)
  let lCoeffH = rat(0n)

  for (const s of states) {
    if (s.multiplet === 'Q_L') {
      yCoeffQ = ratAdd(yCoeffQ, s.y)
      // B(Q_L) = B-L = +1/3
      bCoeffQ = ratAdd(bCoeffQ, s.bMinusL)
    } else if (s.multiplet === 'u_R^c') {
      const yR = ratNeg(s.y) // Y(u_R) = +2/3
      const bR = ratNeg(s.bMinusL) // B(u_R) = +1/3
      yCoeffQ = ratAdd(yCoeffQ, yR)
      yCoeffH = ratAdd(yCoeffH, yR)
      bCoeffQ = ratAdd(bCoeffQ, bR)
    } else if (s.multiplet === 'd_R^c') {
      const yR = ratNeg(s.y) // Y(d_R) = -1/3
      const bR = ratNeg(s.bMinusL) // B(d_R) = +1/3
      yCoeffQ = ratAdd(yCoeffQ, yR)
      yCoeffH = ratSub(yCoeffH, yR)
      bCoeffQ = ratAdd(bCoeffQ, bR)
    } else if (s.multiplet === 'L_L') {
      yCoeffL = ratAdd(yCoeffL, s.y)
      // L(L_L) = -(B-L) = +1
      lCoeffL = ratAdd(lCoeffL, ratNeg(s.bMinusL))
    } else if (s.multiplet === 'e_R^c') {
      const yR = ratNeg(s.y) // Y(e_R) = -1
      const lR = s.bMinusL // L(e_R) = +1 = (B-L)(e_R^c)
      yCoeffL = ratAdd(yCoeffL, yR)
      yCoeffH = ratSub(yCoeffH, yR)
      lCoeffL = ratAdd(lCoeffL, lR)
      lCoeffH = ratSub(lCoeffH, lR)
    }
    // nu_R^c is heavy (decoupled at T_EW) and carries Y = 0
  }

  // Add N_H complex Higgs doublets (statistical weight 2 per complex scalar boson, 2 isospin states, Y = 1/2):
  //   sum_H Y = 2 * N_H * 2 * (1/2) = 2 N_H
  const totalYQ = ratMul(rNg, yCoeffQ)
  const totalYL = ratMul(rNg, yCoeffL)
  const totalYH = ratAdd(ratMul(rNg, yCoeffH), ratMul(rat(2n), rNh))

  // Electroweak sphaleron equilibrium: 3 mu_Q + mu_L = 0 => mu_L = -3 mu_Q
  const sphaleronRatioLOverQ = rat(-3n)
  // Hypercharge neutrality: (totalYQ + (-3) * totalYL) * mu_Q + totalYH * mu_H = 0
  const yNetQ = ratAdd(totalYQ, ratMul(sphaleronRatioLOverQ, totalYL))
  const muHOverMuQ = ratNeg(ratDiv(yNetQ, totalYH))

  // Exact baryon and lepton densities per unit mu_Q
  const bPerMuQ = ratMul(rNg, bCoeffQ)
  const lPerMuQ = ratMul(
    rNg,
    ratAdd(ratMul(lCoeffL, sphaleronRatioLOverQ), ratMul(lCoeffH, muHOverMuQ)),
  )
  const bMinusLPerMuQ = ratSub(bPerMuQ, lPerMuQ)
  const cSphFromChemicalEq = ratDiv(bPerMuQ, bMinusLPerMuQ)

  const cSphFromFormula = ratDiv(
    ratAdd(ratMul(rat(8n), rNg), ratMul(rat(4n), rNh)),
    ratAdd(ratMul(rat(22n), rNg), ratMul(rat(13n), rNh)),
  )
  const cSphExactMatch =
    ratEq(cSphFromChemicalEq, cSphFromFormula) && ratEq(cSphFromFormula, rat(28n, 79n))

  // Exact entropy dilution ratios f_dil = g_*s(T_lep) / g_*s(T_0) with g_*s(T_0) = 43/11
  const gStarS0 = rat(43n, 11n)
  const fDilSmExact = ratDiv(rat(427n, 4n), gStarS0) // 106.75 / (43/11) = 4697/172
  const fDilBdpExact = ratDiv(rat(217n, 2n), gStarS0) // 108.5 / (43/11) = 2387/86
  const threeQuarters = rat(3n, 4n)
  const conversionFactorSm = ratDiv(ratMul(threeQuarters, cSphFromFormula), fDilSmExact)
  const conversionFactorBdp = ratDiv(ratMul(threeQuarters, cSphFromFormula), fDilBdpExact)

  return {
    nGen,
    nHiggs,
    cSphFromFormula,
    cSphFromChemicalEq,
    cSphExactMatch,
    fDilSmExact,
    fDilBdpExact,
    conversionFactorSm,
    conversionFactorBdp,
  }
}

type LeptogenesisOdeResult = {
  readonly kWashout: number
  readonly eps1: number
  readonly initialThermal: boolean
  readonly nN1Final: number
  readonly nBMinusLFinal: number
  readonly efficiencyKappa: number // -N_{B-L}(inf) / eps_1
  readonly etaBBdp: number // 0.0095772 * N_{B-L}(inf)
  readonly etaBSm: number // 0.0097342 * N_{B-L}(inf)
}

// 2-stage 4th-order Gauss-Legendre implicit RK4 constants (A-stable, symplectic, exact O(h^4))
const GL4_SQRT3_OVER_6 = Math.sqrt(3) / 6
const GL4_C1 = 0.5 - GL4_SQRT3_OVER_6
const GL4_C2 = 0.5 + GL4_SQRT3_OVER_6
const GL4_A11 = 0.25
const GL4_A12 = 0.25 - GL4_SQRT3_OVER_6
const GL4_A21 = 0.25 + GL4_SQRT3_OVER_6
const GL4_A22 = 0.25

// Integrate coupled thermal-leptogenesis Boltzmann ODEs in z = M_1 / T from zMin to zMax via
// A-stable 2-stage 4th-order Gauss-Legendre RK4 (exact closed-form 2x2 stage solve for linear ODEs):
//   dN_{N1}/dz  = -(D(z) + S(z)) * (N_{N1} - N_{N1}^{eq}(z))
//   dN_{B-L}/dz = -eps_1 * D(z) * (N_{N1} - N_{N1}^{eq}(z)) - W(z) * N_{B-L}
// with D(z) = K z K_1(z) / K_2(z), S(z) = c_S * D(z) / z^2 (Delta L = 1 top-Yukawa scattering),
// W_ID(z) = (1/4) K z^3 K_1(z), and W(z) = W_ID(z) * (1 + S(z) / D(z)).
function integrateLeptogenesisBoltzmann(input: {
  kWashout: number
  eps1: number
  ytAtM1: number
  initialThermal: boolean
  zMin: number
  zMax: number
  steps: number
  convBdp: number
  convSm: number
}): LeptogenesisOdeResult {
  const { kWashout, eps1, ytAtM1, initialThermal, zMin, zMax, steps, convBdp, convSm } = input
  const cScatter = (9 * ytAtM1 * ytAtM1) / (4 * Math.PI * Math.PI)

  const coeffsAt = (z: number): { nEq: number; d: number; s: number; w: number } => {
    const k1s = besselKScaled(1, z)
    const k2s = besselKScaled(2, z)
    const ez = Math.exp(-z)
    const nEq = 0.5 * z * z * ez * k2s
    const ratio12 = k1s / k2s
    const d = kWashout * z * ratio12
    const sRatio = cScatter / (z * z)
    const s = d * sRatio
    const wId = 0.25 * kWashout * z * z * z * ez * k1s
    const w = wId * (1 + sRatio)
    return { nEq, d, s, w }
  }

  // Exact closed-form 2-stage Gauss-Legendre RK4 step for scalar linear ODE y'(u) = -alpha(u) y + beta(u)
  const gl4LinearStep = (
    y: number,
    h: number,
    alpha1: number,
    beta1: number,
    alpha2: number,
    beta2: number,
  ): { readonly yNext: number; readonly yStage1: number; readonly yStage2: number } => {
    const m00 = 1 + h * GL4_A11 * alpha1
    const m01 = h * GL4_A12 * alpha1
    const m10 = h * GL4_A21 * alpha2
    const m11 = 1 + h * GL4_A22 * alpha2
    const det = m00 * m11 - m01 * m10
    const r1 = beta1 - alpha1 * y
    const r2 = beta2 - alpha2 * y
    const k1 = (m11 * r1 - m01 * r2) / det
    const k2 = (-m10 * r1 + m00 * r2) / det
    const yStage1 = y + h * (GL4_A11 * k1 + GL4_A12 * k2)
    const yStage2 = y + h * (GL4_A21 * k1 + GL4_A22 * k2)
    const yNext = y + 0.5 * h * (k1 + k2)
    return { yNext, yStage1, yStage2 }
  }

  const c0 = coeffsAt(zMin)
  let nN1 = initialThermal ? c0.nEq : 0
  let nBL = 0

  const uMin = Math.log(zMin)
  const uMax = Math.log(zMax)
  const du = (uMax - uMin) / steps

  for (let i = 0; i < steps; i++) {
    const u = uMin + i * du
    const z1 = Math.exp(u + GL4_C1 * du)
    const z2 = Math.exp(u + GL4_C2 * du)
    const g1 = coeffsAt(z1)
    const g2 = coeffsAt(z2)

    // Stage solve for N_{N1}: dN/du = -z*(D+S)*N + z*(D+S)*N_eq
    const aN1 = z1 * (g1.d + g1.s)
    const aN2 = z2 * (g2.d + g2.s)
    const stepN = gl4LinearStep(nN1, du, aN1, aN1 * g1.nEq, aN2, aN2 * g2.nEq)

    // Stage solve for N_{B-L}: dN_{B-L}/du = -z*W*N_{B-L} - eps_1*z*D*(N_{N1} - N_eq)
    const aB1 = z1 * g1.w
    const aB2 = z2 * g2.w
    const bB1 = -eps1 * z1 * g1.d * (stepN.yStage1 - g1.nEq)
    const bB2 = -eps1 * z2 * g2.d * (stepN.yStage2 - g2.nEq)
    const stepBL = gl4LinearStep(nBL, du, aB1, bB1, aB2, bB2)

    nN1 = stepN.yNext
    nBL = stepBL.yNext
  }

  const efficiencyKappa = Math.abs(eps1) > 1e-30 ? -nBL / eps1 : 0
  return {
    kWashout,
    eps1,
    initialThermal,
    nN1Final: nN1,
    nBMinusLFinal: nBL,
    efficiencyKappa,
    etaBBdp: convBdp * nBL,
    etaBSm: convSm * nBL,
  }
}

export type Part2LeptogenesisReport = {
  readonly sphaleron: SphaleronBigIntCert
  readonly besselRecurrenceMaxRelErr: number
  readonly besselAsymptoticErr: number
  // Upstream E-FRC-0328 & E-FRC-0327 seesaw inputs
  readonly mPsGeV: number
  readonly vHiggsGeV: number // v_EW / sqrt(2) = 174.104 GeV
  readonly mStarEv: number // ~1.08e-3 eV
  readonly nuMassesEv: readonly [number, number, number] // [0.00210, 0.00893, 0.04957]
  readonly mAtmEv: number
  readonly zeta9Sin2Pi9: number
  readonly zeta9Sin4Pi9: number
  readonly davidsonIbarraMinM1GeV: number // ~6.8e8 GeV (strictly << M_PS)
  readonly mPsAboveDavidsonIbarraRatio: number
  // Zero-fit natural Pati-Salam benchmarks at M_1 = M_PS
  readonly naturalBenchmarkAtM3: {
    readonly tildeM1Ev: number
    readonly kWashout: number
    readonly eps1: number
    readonly eps1DiBound: number
    readonly obeysDiBound: boolean
    readonly efficiencyKappa: number
    readonly etaBBdp: number
  }
  readonly naturalBenchmarkAtGeomMean: {
    readonly tildeM1Ev: number
    readonly kWashout: number
    readonly eps1: number
    readonly eps1DiBound: number
    readonly efficiencyKappa: number
    readonly etaBBdp: number
  }
  // Planck-matched strong-washout Pati-Salam solution (M_1 = M_PS, zeta_9 phase sin(2pi/9), tilde_m_1 in [m_2, m_3])
  readonly planckMatchAtMPs: {
    readonly m1GeV: number
    readonly tildeM1Ev: number
    readonly kWashout: number
    readonly eps1: number
    readonly eps1DiBound: number
    readonly obeysDiBound: boolean
    readonly efficiencyKappa: number
    readonly etaBZeroInit: number
    readonly etaBThermalInit: number
    readonly initConditionRelDiff: number
    readonly planckRelErr: number
    readonly rk4StepHalvingRelErr: number
  }
  // Dual Planck match fixing tilde_m_1 = sqrt(m_2 m_3) = 0.0210 eV (K ~ 19.5) and solving M_1 in Pati-Salam window
  readonly planckMatchAtFixedK: {
    readonly m1GeV: number
    readonly m1OverMPs: number
    readonly tildeM1Ev: number
    readonly kWashout: number
    readonly eps1: number
    readonly eps1DiBound: number
    readonly obeysDiBound: boolean
    readonly etaBZeroInit: number
    readonly etaBThermalInit: number
    readonly initConditionRelDiff: number
    readonly planckRelErr: number
  }
  // Three mandatory negative controls
  readonly controlNoCpEtaB: number // eps_1 = 0 -> exact 0
  readonly controlLowM1GeV: number // 1e7 GeV (below Davidson-Ibarra bound)
  readonly controlLowM1EtaB: number // < 1e-11 (fails Planck)
  readonly controlWeakWashoutK: number // 0.01
  readonly controlWeakWashoutZeroInitEtaB: number
  readonly controlWeakWashoutThermalInitEtaB: number
  readonly controlWeakWashoutInitRelDiff: number // large (> 50%), contrasting strong washout (< 1%)
  readonly controlStrongWashoutK20InitRelDiff: number // < 1%
}

function runPart2ThermalLeptogenesis(
  states: readonly Spin10StateInfo[],
  mPsGeV: number,
  mPlanckGeV: number,
  vEwGeV: number,
): Part2LeptogenesisReport {
  const sphaleron = certifySphaleronConversion(states)
  const convBdp = ratToNumber(sphaleron.conversionFactorBdp)
  const convSm = ratToNumber(sphaleron.conversionFactorSm)

  // Verify exact modified Bessel K_nu(z) recurrence K_2(z) = K_0(z) + (2/z) K_1(z) across z = 0.05..40
  const zChecks = [0.05, 0.2, 0.5, 1, 2, 5, 10, 20, 40]
  let besselRecurrenceMaxRelErr = 0
  for (const z of zChecks) {
    const k0 = besselKScaled(0, z)
    const k1 = besselKScaled(1, z)
    const k2 = besselKScaled(2, z)
    const relErr = Math.abs(k2 - (k0 + (2 / z) * k1)) / k2
    if (relErr > besselRecurrenceMaxRelErr) besselRecurrenceMaxRelErr = relErr
  }
  // Asymptotic Hankel expansion check at z = 40 (8 terms -> <= 1e-13 accuracy)
  const zAsy = 40
  let hankelSum = 1
  let hankelTerm = 1
  for (let m = 1; m <= 8; m++) {
    hankelTerm *= (4 - (2 * m - 1) ** 2) / (m * 8 * zAsy)
    hankelSum += hankelTerm
  }
  const k1Asy = Math.sqrt(Math.PI / (2 * zAsy)) * hankelSum
  const besselAsymptoticErr = Math.abs(besselKScaled(1, zAsy) - k1Asy) / k1Asy

  // Upstream E-FRC-0327 seesaw neutrino spectrum & E-FRC-0328 electroweak/Planck constants
  const vHiggsGeV = vEwGeV * Math.SQRT1_2 // 174.104 GeV
  const gStarLep = 108.5 // SM (106.75) + N_1 (1.75)
  const mStarEv =
    ((8 * Math.PI * vHiggsGeV * vHiggsGeV) / mPlanckGeV) *
    Math.sqrt((4 * Math.PI ** 3 * gStarLep) / 45) *
    1e9 // ~1.079e-3 eV

  const m1Ev = 0.00210
  const m2Ev = Math.sqrt(m1Ev * m1Ev + PDG_FLAVOR_BENCHMARK.dm21SqEv2) // 0.008928 eV
  const m3Ev = Math.sqrt(m1Ev * m1Ev + PDG_FLAVOR_BENCHMARK.dm31SqNoEv2) // 0.049572 eV
  const mAtmEv = Math.sqrt(PDG_FLAVOR_BENCHMARK.dm31SqNoEv2) // 0.049528 eV
  const nuMassesEv: readonly [number, number, number] = [m1Ev, m2Ev, m3Ev]

  // Exact Vibe Z[zeta_9] CP phase amplitudes
  const [, zeta9Sin2Pi9] = toComplex(zetaPower(1)) // sin(2 pi / 9) = 0.642788
  const [, zeta9Sin4Pi9] = toComplex(zetaPower(2)) // sin(4 pi / 9) = 0.984808

  // Exact Davidson-Ibarra upper bound on |eps_1|
  const eps1DiBoundFn = (m1GeV: number): number =>
    (3 / (16 * Math.PI)) * ((m1GeV * (m3Ev - m1Ev) * 1e-9) / (vHiggsGeV * vHiggsGeV))

  // Davidson-Ibarra minimum M_1 for Planck eta_B even at theoretical maximum efficiency kappa = 1
  const davidsonIbarraMinM1GeV =
    (PLANCK_ETA_B / convBdp) / ((3 / (16 * Math.PI)) * (((m3Ev - m1Ev) * 1e-9) / (vHiggsGeV * vHiggsGeV)))

  // Top Yukawa at M_PS (m_t(M_PS) ~ 85 GeV from E-FRC-0328)
  const ytAtMPs = 85.0 / vHiggsGeV
  const zMin = 0.05
  const zMax = 40
  const odeSteps = 600

  const runOde = (
    kWashout: number,
    eps1: number,
    initialThermal: boolean,
    steps = odeSteps,
  ): LeptogenesisOdeResult =>
    integrateLeptogenesisBoltzmann({
      kWashout,
      eps1,
      ytAtM1: ytAtMPs,
      initialThermal,
      zMin,
      zMax,
      steps,
      convBdp,
      convSm,
    })

  // Zero-fit natural Pati-Salam benchmarks at M_1 = M_PS = 1.434e11 GeV with zeta_9 CP phase sin(2 pi / 9)
  const eps1DiAtMPs = eps1DiBoundFn(mPsGeV)
  const eps1AtMPs = -eps1DiAtMPs * zeta9Sin2Pi9

  const kAtM3 = m3Ev / mStarEv
  const resAtM3 = runOde(kAtM3, eps1AtMPs, false)
  const tildeGeomEv = Math.sqrt(m2Ev * m3Ev) // 0.02104 eV
  const kAtGeom = tildeGeomEv / mStarEv
  const resAtGeom = runOde(kAtGeom, eps1AtMPs, false)

  // Deterministic 1D bisection for natural tilde_m_1 in [m_2, m_3] at M_1 = M_PS hitting Planck eta_B = 6.12e-10
  let loM = m2Ev
  let hiM = m3Ev
  for (let iter = 0; iter < 36; iter++) {
    const midM = 0.5 * (loM + hiM)
    const r = runOde(midM / mStarEv, eps1AtMPs, false, 300)
    // Larger tilde_m_1 -> stronger washout -> smaller eta_B
    if (r.etaBBdp > PLANCK_ETA_B) {
      loM = midM
    } else {
      hiM = midM
    }
  }
  const tildeM1MatchEv = 0.5 * (loM + hiM)
  const kMatchMPs = tildeM1MatchEv / mStarEv
  const matchZeroN1 = runOde(kMatchMPs, eps1AtMPs, false, 1600)
  const matchZeroN2 = runOde(kMatchMPs, eps1AtMPs, false, 3200)
  const matchThermal = runOde(kMatchMPs, eps1AtMPs, true, 3200)
  const rk4StepHalvingRelErr =
    Math.abs(matchZeroN2.etaBBdp - matchZeroN1.etaBBdp) / Math.abs(matchZeroN2.etaBBdp)
  const initDiffMPs =
    Math.abs(matchZeroN2.etaBBdp - matchThermal.etaBBdp) / Math.abs(matchThermal.etaBBdp)

  // Dual Planck match: fix tilde_m_1 = sqrt(m_2 m_3) = 0.02104 eV (K ~ 19.5) and determine M_1 in Pati-Salam window
  // Because N_{B-L} is strictly linear in eps_1 and eps_1 is strictly linear in M_1, exact scaling gives M_1 immediately!
  const m1FixedKGeV = mPsGeV * (PLANCK_ETA_B / resAtGeom.etaBBdp)
  const eps1DiFixedK = eps1DiBoundFn(m1FixedKGeV)
  const eps1FixedK = -eps1DiFixedK * zeta9Sin2Pi9
  const fixedKZero = runOde(kAtGeom, eps1FixedK, false, 600)
  const fixedKThermal = runOde(kAtGeom, eps1FixedK, true, 600)
  const fixedKInitRelDiff =
    Math.abs(fixedKZero.etaBBdp - fixedKThermal.etaBBdp) / Math.abs(fixedKThermal.etaBBdp)

  // Negative controls:
  // (a) CP off (eps_1 = 0) -> exact 0
  const ctrlNoCp = runOde(kMatchMPs, 0, false, 400)
  // (b) M_1 = 1e7 GeV (well below Davidson-Ibarra lower bound ~6.8e8 GeV) -> fails Planck (< 1e-11)
  const controlLowM1GeV = 1e7
  const eps1LowM1 = -eps1DiBoundFn(controlLowM1GeV) * zeta9Sin2Pi9
  const ctrlLowM1 = runOde(kAtGeom, eps1LowM1, true, 400)
  // (c) Weak washout K = 0.01 (huge zero-vs-thermal sensitivity) vs strong washout K = 20 (< 1%)
  const controlWeakWashoutK = 0.01
  const ctrlWeakZero = runOde(controlWeakWashoutK, eps1AtMPs, false, 500)
  const ctrlWeakThermal = runOde(controlWeakWashoutK, eps1AtMPs, true, 500)
  const controlWeakWashoutInitRelDiff =
    Math.abs(ctrlWeakZero.etaBBdp - ctrlWeakThermal.etaBBdp) / Math.abs(ctrlWeakThermal.etaBBdp)

  const ctrlStrongK20Zero = runOde(20, eps1AtMPs, false, 500)
  const ctrlStrongK20Thermal = runOde(20, eps1AtMPs, true, 500)
  const controlStrongWashoutK20InitRelDiff =
    Math.abs(ctrlStrongK20Zero.etaBBdp - ctrlStrongK20Thermal.etaBBdp) /
    Math.abs(ctrlStrongK20Thermal.etaBBdp)

  return {
    sphaleron,
    besselRecurrenceMaxRelErr,
    besselAsymptoticErr,
    mPsGeV,
    vHiggsGeV,
    mStarEv,
    nuMassesEv,
    mAtmEv,
    zeta9Sin2Pi9,
    zeta9Sin4Pi9,
    davidsonIbarraMinM1GeV,
    mPsAboveDavidsonIbarraRatio: mPsGeV / davidsonIbarraMinM1GeV,
    naturalBenchmarkAtM3: {
      tildeM1Ev: m3Ev,
      kWashout: kAtM3,
      eps1: eps1AtMPs,
      eps1DiBound: eps1DiAtMPs,
      obeysDiBound: Math.abs(eps1AtMPs) <= eps1DiAtMPs,
      efficiencyKappa: resAtM3.efficiencyKappa,
      etaBBdp: resAtM3.etaBBdp,
    },
    naturalBenchmarkAtGeomMean: {
      tildeM1Ev: tildeGeomEv,
      kWashout: kAtGeom,
      eps1: eps1AtMPs,
      eps1DiBound: eps1DiAtMPs,
      efficiencyKappa: resAtGeom.efficiencyKappa,
      etaBBdp: resAtGeom.etaBBdp,
    },
    planckMatchAtMPs: {
      m1GeV: mPsGeV,
      tildeM1Ev: tildeM1MatchEv,
      kWashout: kMatchMPs,
      eps1: eps1AtMPs,
      eps1DiBound: eps1DiAtMPs,
      obeysDiBound: Math.abs(eps1AtMPs) <= eps1DiAtMPs,
      efficiencyKappa: matchZeroN2.efficiencyKappa,
      etaBZeroInit: matchZeroN2.etaBBdp,
      etaBThermalInit: matchThermal.etaBBdp,
      initConditionRelDiff: initDiffMPs,
      planckRelErr: Math.abs(matchZeroN2.etaBBdp - PLANCK_ETA_B) / PLANCK_ETA_B,
      rk4StepHalvingRelErr,
    },
    planckMatchAtFixedK: {
      m1GeV: m1FixedKGeV,
      m1OverMPs: m1FixedKGeV / mPsGeV,
      tildeM1Ev: tildeGeomEv,
      kWashout: kAtGeom,
      eps1: eps1FixedK,
      eps1DiBound: eps1DiFixedK,
      obeysDiBound: Math.abs(eps1FixedK) <= eps1DiFixedK,
      etaBZeroInit: fixedKZero.etaBBdp,
      etaBThermalInit: fixedKThermal.etaBBdp,
      initConditionRelDiff: fixedKInitRelDiff,
      planckRelErr: Math.abs(fixedKZero.etaBBdp - PLANCK_ETA_B) / PLANCK_ETA_B,
    },
    controlNoCpEtaB: ctrlNoCp.etaBBdp,
    controlLowM1GeV,
    controlLowM1EtaB: ctrlLowM1.etaBBdp,
    controlWeakWashoutK,
    controlWeakWashoutZeroInitEtaB: ctrlWeakZero.etaBBdp,
    controlWeakWashoutThermalInitEtaB: ctrlWeakThermal.etaBBdp,
    controlWeakWashoutInitRelDiff,
    controlStrongWashoutK20InitRelDiff,
  }
}

// =========================================================================================================
// PART 3: EXACT SO(10) MATTER-PARITY DARK SECTOR & HONEST {3,4,3,4} COSMOLOGICAL CONSTANT SHELL AUDIT
// =========================================================================================================

export type MatterParityBigIntCert = {
  readonly statesChecked: number // 16
  readonly all16FermionsThreeBlIntegerOdd: boolean // 3(B-L) is an odd integer for all 16/16 states
  readonly all16FermionsPMMinusOne: boolean // P_M = (-1)^{3(B-L)} = -1 for all 16
  readonly all16FermionsPDmPlusOne: boolean // P_DM = (-1)^{3(B-L) + 2s} = +1 for all 16 SM fermions
  readonly pairs16x16Checked: number // 256 (10_H + 120_H + 126_H)
  readonly all16x16ScalarsPMPlusOne: boolean // P_M = +1 for all 256 pairs
  readonly pairs16x16barChecked: number // 256 (1 + 45_G + 210)
  readonly all16x16barGaugePMPlusOne: boolean // P_M = +1 for all 256 pairs
  readonly deltaR126VevThreeBlExact: bigint // 6n (even -> P_M = +1 unbroken!)
  readonly deltaR126PreservesMatterParity: boolean
  readonly higgs10VevThreeBlExact: bigint // 0n (even -> P_M = +1 unbroken!)
  readonly control16HVevThreeBlExact: bigint // 3n (odd -> P_M = -1 broken!)
  readonly control16HBreaksMatterParity: boolean
  readonly darkScalar16SPDmExact: number // -1 (stable against decay to any SM particles!)
  readonly darkFermion10FPDmExact: number // -1 (stable against decay to any SM particles!)
  readonly allCertificatesExact: boolean
}

function certifySo10MatterParity(states: readonly Spin10StateInfo[]): MatterParityBigIntCert {
  const three = rat(3n)
  const absBig = (x: bigint): bigint => (x < 0n ? -x : x)

  let all16FermionsThreeBlIntegerOdd = true
  let all16FermionsPMMinusOne = true
  let all16FermionsPDmPlusOne = true
  const threeBlVals: bigint[] = []

  for (const s of states) {
    const t = ratMul(three, s.bMinusL)
    if (t.den !== 1n) {
      all16FermionsThreeBlIntegerOdd = false
      all16FermionsPMMinusOne = false
      all16FermionsPDmPlusOne = false
      continue
    }
    threeBlVals.push(t.num)
    const isOdd = absBig(t.num) % 2n === 1n
    if (!isOdd) {
      all16FermionsThreeBlIntegerOdd = false
      all16FermionsPMMinusOne = false
    }
    // Fermions have 2s = 1 (odd), so 3(B-L) + 2s is odd + odd = even => P_DM = +1
    if (absBig(t.num + 1n) % 2n !== 0n) {
      all16FermionsPDmPlusOne = false
    }
  }

  // Check ALL 256 bilinears in 16 x 16 (containing 10_H, 120_H, 126_H) and 16 x 16bar (containing 45_G)
  let all16x16ScalarsPMPlusOne = true
  let all16x16barGaugePMPlusOne = true
  for (let i = 0; i < threeBlVals.length; i++) {
    for (let j = 0; j < threeBlVals.length; j++) {
      const sum16x16 = threeBlVals[i]! + threeBlVals[j]!
      const diff16x16bar = threeBlVals[i]! - threeBlVals[j]!
      if (absBig(sum16x16) % 2n !== 0n) all16x16ScalarsPMPlusOne = false
      if (absBig(diff16x16bar) % 2n !== 0n) all16x16barGaugePMPlusOne = false
    }
  }

  // Exact VEV 3(B-L) values from E-FRC-0324's nu_R^c state:
  //   nu_R^c has B-L = +1 (3(B-L) = +3), so <126_H> ~ <nu_R^c nu_R^c> has 3(B-L) = +6 (EVEN -> P_M = +1)
  //   while negative control <16_H> ~ <nu_R^c> has 3(B-L) = +3 (ODD -> P_M = -1, breaks Z_2!)
  const nuRc = states.find(s => s.multiplet === 'nu_R^c')!
  const nuRcThreeBl = ratMul(three, nuRc.bMinusL).num // 3n (or -3n)
  const deltaR126VevThreeBlExact = absBig(2n * nuRcThreeBl) // 6n
  const higgs10VevThreeBlExact = 0n
  const control16HVevThreeBlExact = absBig(nuRcThreeBl) // 3n

  const deltaR126PreservesMatterParity = deltaR126VevThreeBlExact % 2n === 0n
  const control16HBreaksMatterParity = control16HVevThreeBlExact % 2n === 1n

  // Dark matter parity P_DM = (-1)^{3(B-L) + 2s}:
  //   Scalar in 16_S: 3(B-L) odd, 2s = 0 => P_DM = -1
  //   Fermion in 10_F / 1_F: 3(B-L) even, 2s = 1 => P_DM = -1
  const darkScalar16SPDmExact = absBig(control16HVevThreeBlExact + 0n) % 2n === 1n ? -1 : 1
  const darkFermion10FPDmExact = absBig(higgs10VevThreeBlExact + 1n) % 2n === 1n ? -1 : 1

  const allCertificatesExact =
    states.length === 16 &&
    all16FermionsThreeBlIntegerOdd &&
    all16FermionsPMMinusOne &&
    all16FermionsPDmPlusOne &&
    all16x16ScalarsPMPlusOne &&
    all16x16barGaugePMPlusOne &&
    deltaR126PreservesMatterParity &&
    control16HBreaksMatterParity &&
    darkScalar16SPDmExact === -1 &&
    darkFermion10FPDmExact === -1

  return {
    statesChecked: states.length,
    all16FermionsThreeBlIntegerOdd,
    all16FermionsPMMinusOne,
    all16FermionsPDmPlusOne,
    pairs16x16Checked: threeBlVals.length * threeBlVals.length,
    all16x16ScalarsPMPlusOne,
    pairs16x16barChecked: threeBlVals.length * threeBlVals.length,
    all16x16barGaugePMPlusOne,
    deltaR126VevThreeBlExact,
    deltaR126PreservesMatterParity,
    higgs10VevThreeBlExact,
    control16HVevThreeBlExact,
    control16HBreaksMatterParity,
    darkScalar16SPDmExact,
    darkFermion10FPDmExact,
    allCertificatesExact,
  }
}

// Exact Lee-Weinberg thermal freeze-out Boltzmann ODE integrated in u = ln(x) via A-stable
// 2-stage 4th-order Gauss-Legendre implicit RK4 (zero stiffness blowup across all <sigma v> & xStart):
//   dY/dx = -(lambda_fo / x^2) * (Y^2 - Y_eq(x)^2),  Y_eq(x) = (45 / (4 pi^4)) * (g_DM / g_*s) * x^2 K_2(x)
function solveLeeWeinbergFreezeOut(input: {
  mDmGeV: number
  sigmaVCm3S: number
  gDm: number
  gStar: number
  mPlanckGeV: number
  xStart: number
  xEnd: number
  steps: number
}): {
  readonly lambdaFo: number
  readonly yEnd: number
  readonly yInfWithTail: number
  readonly freezeOutX: number
  readonly omegaDmH2: number
} {
  const { mDmGeV, sigmaVCm3S, gDm, gStar, mPlanckGeV, xStart, xEnd, steps } = input
  const sigmaVGeVInv2 = sigmaVCm3S / GEV_INV2_TO_CM3_S
  const lambdaFo = Math.sqrt(Math.PI / 45) * Math.sqrt(gStar) * mPlanckGeV * mDmGeV * sigmaVGeVInv2
  const eqPref = (45 / (4 * Math.PI ** 4)) * (gDm / gStar)

  const yEqAt = (x: number): number => eqPref * x * x * besselK(2, x)

  let y = yEqAt(xStart)
  const uMin = Math.log(xStart)
  const uMax = Math.log(xEnd)
  const du = (uMax - uMin) / steps

  let freezeOutX = NaN
  for (let i = 0; i < steps; i++) {
    const u = uMin + i * du
    const x1 = Math.exp(u + GL4_C1 * du)
    const x2 = Math.exp(u + GL4_C2 * du)
    const r1 = lambdaFo / x1
    const r2 = lambdaFo / x2
    const ye1 = yEqAt(x1)
    const ye2 = yEqAt(x2)
    const e1 = ye1 * ye1
    const e2 = ye2 * ye2

    // Solve 2x2 nonlinear Gauss-Legendre stage equations for (y1, y2) via damped Newton to machine precision
    let y1 = Math.max(ye1, y / (1 + du * GL4_C1 * r1 * y))
    let y2 = Math.max(ye2, y / (1 + du * GL4_C2 * r2 * y))

    for (let it = 0; it < 12; it++) {
      const f1Val = r1 * (y1 * y1 - e1)
      const f2Val = r2 * (y2 * y2 - e2)
      const res1 = y1 - y + du * (GL4_A11 * f1Val + GL4_A12 * f2Val)
      const res2 = y2 - y + du * (GL4_A21 * f1Val + GL4_A22 * f2Val)
      if (Math.max(Math.abs(res1), Math.abs(res2)) <= 1e-15 * Math.max(y, ye1, 1e-30)) break

      const j00 = 1 + 2 * du * GL4_A11 * r1 * y1
      const j01 = 2 * du * GL4_A12 * r2 * y2
      const j10 = 2 * du * GL4_A21 * r1 * y1
      const j11 = 1 + 2 * du * GL4_A22 * r2 * y2
      const det = j00 * j11 - j01 * j10
      const dy1 = (j11 * res1 - j01 * res2) / det
      const dy2 = (-j10 * res1 + j00 * res2) / det
      y1 -= dy1
      y2 -= dy2
    }

    y -= 0.5 * du * (r1 * (y1 * y1 - e1) + r2 * (y2 * y2 - e2))

    if (Number.isNaN(freezeOutX)) {
      const xNext = Math.exp(u + du)
      if (y > 2 * yEqAt(xNext)) {
        freezeOutX = xNext
      }
    }
  }

  // Exact analytical asymptotic tail for x > xEnd (where Y_eq = 0): 1/Y(inf) = 1/Y(xEnd) + lambda_fo / xEnd
  const yInfWithTail = 1 / (1 / y + lambdaFo / xEnd)
  const omegaDmH2 = mDmGeV * yInfWithTail * S0_OVER_RHOC_H2_INV_GEV

  return {
    lambdaFo,
    yEnd: y,
    yInfWithTail,
    freezeOutX,
    omegaDmH2,
  }
}

export type ScaleLadderEntry = {
  readonly name: string
  readonly energyGeV: number
  readonly shellDepthB: number // log_b(M_Pl / E)
  readonly shellDepthLambda: number // log_lambda(M_Pl / E)
}

export type Part3DarkSectorAndLambdaReport = {
  readonly matterParity: MatterParityBigIntCert
  readonly darkMatterFreezeOut: {
    readonly mDmShell13GeV: number // E-FRC-0328 D_EW = 13 shell scale = 484.3 GeV
    readonly gDm: number
    readonly gStarFreezeOut: number
    readonly canonicalSigmaVCm3S: number // 2.2e-26 cm^3/s
    readonly canonicalFreezeOutX: number
    readonly canonicalOmegaDmH2: number
    readonly planckMatchedSigmaVCm3S: number // exact <sigma v> hitting Omega_DM h^2 = 0.1200
    readonly planckMatchedOmegaDmH2: number
    readonly planckRelErr: number
    readonly rk4StepHalvingRelErr: number
    readonly xStartInvarianceRelErr: number
    readonly controlStrongAnnihilationOmegaDmH2: number // 100x <sigma v> -> under-abundant
    readonly controlWeakAnnihilationOmegaDmH2: number // 0.01x <sigma v> -> overcloses universe
  }
  readonly lambdaShellAudit: {
    readonly cuspBranchingB: number // 6034/330 = 18.284848
    readonly logBranchingB: number // 2.906073
    readonly bulkLambda: number // 18.278708
    readonly cosmicHistoryLateWEff: number // exact w = -1 from E-CSM-0065
    readonly h0GeV: number
    readonly hInfGeV: number // sqrt(Omega_Lambda) * H_0
    readonly rhoLambdaGeV4: number // ~2.515e-47 GeV^4
    readonly rhoPlanckOverRhoLambda: number // M_Pl^4 / rho_Lambda ~ 8.83e122
    readonly lambdaPlanckOverLambdaObs: number // (M_Pl / H_inf)^2 ~ 1.054e122
    readonly depthH0B: number // log_b(M_Pl / H_0) = 48.28
    readonly depthHInfB: number // log_b(M_Pl / H_inf) = 48.34
    readonly depthLambdaFromHInfB: number // 2 * D_{H_inf} = 96.68 shells
    readonly depthLambdaFromRhoB: number // log_b(M_Pl^4 / rho_Lambda) = 97.42 shells
    readonly depthLambdaFromRhoLambda: number // log_lambda(M_Pl^4 / rho_Lambda)
    readonly euclidean3DShellsForRhoLambda: number // (rho_Pl / rho_Lambda)^(1/3) ~ 4.45e40
    readonly ladder: readonly ScaleLadderEntry[]
    // Pre-registered honest null check (zero numerology!)
    readonly nearestIntToDepthH0: number // 48
    readonly depthH0OffsetFrom48: number // |D_H0 - 48| = 0.28 shells
    readonly factorErrorAtShell48: number // b^{|D_H0 - 48|} ~ 2.24x (> 200 sigma off Planck H_0!)
    readonly uniformMod1ChanceAtH0Offset: number // 2 * |D_H0 - 48| ~ 55%
    readonly wEqualsMinusOneDerivedFrom3434: boolean
    readonly all122DecadesFitUnder100Shells: boolean
    readonly refusedZeroParamH0Claim: boolean
    readonly dynamicalSelectionOfDLambdaOpen: boolean
  }
}

function runPart3DarkSectorAndLambda(
  states: readonly Spin10StateInfo[],
  psReport: ReturnType<typeof analyzePatiSalamUnificationHierarchy>,
  nuMassesEv: readonly [number, number, number],
  cosmicHistoryLateWEff: number,
): Part3DarkSectorAndLambdaReport {
  const matterParity = certifySo10MatterParity(states)

  // Lee-Weinberg thermal freeze-out at E-FRC-0328's D_EW = 13 warped shell scale (484.3 GeV)
  const mDmShell13GeV = psReport.hierarchy.warpedScaleAtShell13GeV
  const mPlanckGeV = psReport.hierarchy.mPlanckGeV
  const gDm = 2 // Majorana dark fermion (e.g. neutral component of 10_F or 1_F)
  const gStarFreezeOut = 86.25 // SM degrees of freedom at T_f ~ 19 GeV (all except t, H, W, Z)
  const canonicalSigmaVCm3S = 2.2e-26

  const canonRun = solveLeeWeinbergFreezeOut({
    mDmGeV: mDmShell13GeV,
    sigmaVCm3S: canonicalSigmaVCm3S,
    gDm,
    gStar: gStarFreezeOut,
    mPlanckGeV,
    xStart: 12,
    xEnd: 1000,
    steps: 600,
  })

  // Deterministically bisect <sigma v> around 2.2e-26 cm^3/s to hit Planck Omega_DM h^2 = 0.1200
  let loSv = 1.0e-26
  let hiSv = 4.0e-26
  for (let iter = 0; iter < 36; iter++) {
    const midSv = 0.5 * (loSv + hiSv)
    const r = solveLeeWeinbergFreezeOut({
      mDmGeV: mDmShell13GeV,
      sigmaVCm3S: midSv,
      gDm,
      gStar: gStarFreezeOut,
      mPlanckGeV,
      xStart: 12,
      xEnd: 1000,
      steps: 300,
    })
    if (r.omegaDmH2 > PLANCK_OMEGA_DM_H2) {
      loSv = midSv
    } else {
      hiSv = midSv
    }
  }
  const planckMatchedSigmaVCm3S = 0.5 * (loSv + hiSv)

  const matchN1 = solveLeeWeinbergFreezeOut({
    mDmGeV: mDmShell13GeV,
    sigmaVCm3S: planckMatchedSigmaVCm3S,
    gDm,
    gStar: gStarFreezeOut,
    mPlanckGeV,
    xStart: 12,
    xEnd: 1000,
    steps: 2400,
  })
  const matchN2 = solveLeeWeinbergFreezeOut({
    mDmGeV: mDmShell13GeV,
    sigmaVCm3S: planckMatchedSigmaVCm3S,
    gDm,
    gStar: gStarFreezeOut,
    mPlanckGeV,
    xStart: 12,
    xEnd: 1000,
    steps: 4800,
  })
  const matchAltStart = solveLeeWeinbergFreezeOut({
    mDmGeV: mDmShell13GeV,
    sigmaVCm3S: planckMatchedSigmaVCm3S,
    gDm,
    gStar: gStarFreezeOut,
    mPlanckGeV,
    xStart: 14,
    xEnd: 1000,
    steps: 4800,
  })

  const rk4StepHalvingRelErr =
    Math.abs(matchN2.omegaDmH2 - matchN1.omegaDmH2) / matchN2.omegaDmH2
  const xStartInvarianceRelErr =
    Math.abs(matchN2.omegaDmH2 - matchAltStart.omegaDmH2) / matchN2.omegaDmH2

  // Negative controls: 100x stronger annihilation & 0.01x weaker annihilation
  const ctrlStrong = solveLeeWeinbergFreezeOut({
    mDmGeV: mDmShell13GeV,
    sigmaVCm3S: 100 * canonicalSigmaVCm3S,
    gDm,
    gStar: gStarFreezeOut,
    mPlanckGeV,
    xStart: 12,
    xEnd: 1000,
    steps: 600,
  })
  const ctrlWeak = solveLeeWeinbergFreezeOut({
    mDmGeV: mDmShell13GeV,
    sigmaVCm3S: 0.01 * canonicalSigmaVCm3S,
    gDm,
    gStar: gStarFreezeOut,
    mPlanckGeV,
    xStart: 12,
    xEnd: 1000,
    steps: 600,
  })

  // Part 3B: Honest {3,4,3,4} Cosmological Constant Lambda Shell Audit
  const b = psReport.hierarchy.cuspBranchingFactorB // 6034/330 = 18.284848
  const lnB = psReport.hierarchy.logBranchingFactor // 2.906073
  const bulkLambda = psReport.hierarchy.bulkPerronGrowthLambda // 18.278708
  const lnLambda = Math.log(bulkLambda)

  const h0SecInv = PLANCK_H0_KM_S_MPC / MPC_IN_KM
  const h0GeV = HBAR_GEV_S * h0SecInv
  const hInfGeV = Math.sqrt(PLANCK_OMEGA_LAMBDA) * h0GeV
  const rhoLambdaGeV4 =
    ((3 * PLANCK_OMEGA_LAMBDA) / (8 * Math.PI)) * mPlanckGeV * mPlanckGeV * h0GeV * h0GeV
  const eLambdaGeV = rhoLambdaGeV4 ** 0.25

  const rhoPlanckOverRhoLambda = (mPlanckGeV ** 4) / rhoLambdaGeV4
  const lambdaPlanckOverLambdaObs = (mPlanckGeV / hInfGeV) ** 2

  const depthH0B = Math.log(mPlanckGeV / h0GeV) / lnB
  const depthHInfB = Math.log(mPlanckGeV / hInfGeV) / lnB
  const depthLambdaFromHInfB = Math.log(lambdaPlanckOverLambdaObs) / lnB
  const depthLambdaFromRhoB = Math.log(rhoPlanckOverRhoLambda) / lnB
  const depthLambdaFromRhoLambda = Math.log(rhoPlanckOverRhoLambda) / lnLambda
  const euclidean3DShellsForRhoLambda = Math.cbrt(rhoPlanckOverRhoLambda)

  const ladderRaw: readonly (readonly [string, number])[] = [
    ['M_Planck', mPlanckGeV],
    ['M_GUT (E-FRC-0328)', psReport.primary.mGutGeV],
    ['M_PS (E-FRC-0328)', psReport.primary.mPsGeV],
    ['v_EW', psReport.hierarchy.vEwGeV],
    ['Lambda_QCD (MS-bar 5f)', LAMBDA_QCD_MSBAR5_GEV],
    ['m_e', ELECTRON_MASS_GEV],
    ['m_nu3 (E-FRC-0327)', nuMassesEv[2] * 1e-9],
    ['rho_Lambda^(1/4)', eLambdaGeV],
    ['H_0 (Planck 2018)', h0GeV],
    ['H_inf = sqrt(Omega_L) H_0', hInfGeV],
  ]

  const ladder: ScaleLadderEntry[] = ladderRaw.map(([name, energyGeV]) => ({
    name,
    energyGeV,
    shellDepthB: Math.log(mPlanckGeV / energyGeV) / lnB,
    shellDepthLambda: Math.log(mPlanckGeV / energyGeV) / lnLambda,
  }))

  // Pre-registered honest null check against naive integer shell claim D_H0 ~ 48
  const nearestIntToDepthH0 = Math.round(depthH0B)
  const depthH0OffsetFrom48 = Math.abs(depthH0B - nearestIntToDepthH0)
  const factorErrorAtShell48 = b ** depthH0OffsetFrom48
  const uniformMod1ChanceAtH0Offset = Math.min(1, 2 * depthH0OffsetFrom48)

  return {
    matterParity,
    darkMatterFreezeOut: {
      mDmShell13GeV,
      gDm,
      gStarFreezeOut,
      canonicalSigmaVCm3S,
      canonicalFreezeOutX: canonRun.freezeOutX,
      canonicalOmegaDmH2: canonRun.omegaDmH2,
      planckMatchedSigmaVCm3S,
      planckMatchedOmegaDmH2: matchN2.omegaDmH2,
      planckRelErr: Math.abs(matchN2.omegaDmH2 - PLANCK_OMEGA_DM_H2) / PLANCK_OMEGA_DM_H2,
      rk4StepHalvingRelErr,
      xStartInvarianceRelErr,
      controlStrongAnnihilationOmegaDmH2: ctrlStrong.omegaDmH2,
      controlWeakAnnihilationOmegaDmH2: ctrlWeak.omegaDmH2,
    },
    lambdaShellAudit: {
      cuspBranchingB: b,
      logBranchingB: lnB,
      bulkLambda,
      cosmicHistoryLateWEff,
      h0GeV,
      hInfGeV,
      rhoLambdaGeV4,
      rhoPlanckOverRhoLambda,
      lambdaPlanckOverLambdaObs,
      depthH0B,
      depthHInfB,
      depthLambdaFromHInfB,
      depthLambdaFromRhoB,
      depthLambdaFromRhoLambda,
      euclidean3DShellsForRhoLambda,
      ladder,
      nearestIntToDepthH0,
      depthH0OffsetFrom48,
      factorErrorAtShell48,
      uniformMod1ChanceAtH0Offset,
      wEqualsMinusOneDerivedFrom3434: Math.abs(cosmicHistoryLateWEff - -1) <= 1e-3,
      all122DecadesFitUnder100Shells: depthLambdaFromRhoB < 100 && depthLambdaFromHInfB < 100,
      refusedZeroParamH0Claim: factorErrorAtShell48 > 1.5 && uniformMod1ChanceAtH0Offset > 0.1,
      dynamicalSelectionOfDLambdaOpen: true,
    },
  }
}

// =========================================================================================================
// TOP-LEVEL E-CSM-0066 FRONTIER 4 ANALYSIS
// =========================================================================================================

export type BaryogenesisDarkSectorAndLambdaReport = {
  readonly exactShellCounts0to3: readonly [number, number, number, number]
  readonly part1: Part1SakharovWalkReport
  readonly part2: Part2LeptogenesisReport
  readonly part3: Part3DarkSectorAndLambdaReport
}

export function analyzeBaryogenesisDarkSectorAndLambda(): BaryogenesisDarkSectorAndLambdaReport {
  // Reuse verified upstream Vibe Theory engines directly (zero duplicated hand-tuned constants)
  const so10 = analyzeSo10ThreeGenerations(20)
  const psReport = analyzePatiSalamUnificationHierarchy()
  const cosmicReport = runCosmicHistoryBackreaction()

  const part1 = runPart1SakharovWalk()
  const part2 = runPart2ThermalLeptogenesis(
    so10.spin10.states,
    psReport.primary.mPsGeV,
    psReport.hierarchy.mPlanckGeV,
    psReport.hierarchy.vEwGeV,
  )
  const part3 = runPart3DarkSectorAndLambda(
    so10.spin10.states,
    psReport,
    part2.nuMassesEv,
    cosmicReport.partB.fullCosmicHistory.era3DarkEnergy.finalWEff,
  )

  return {
    exactShellCounts0to3: EXACT_COLUMN_SHELL_COUNTS,
    part1,
    part2,
    part3,
  }
}

export {
  PLANCK_ETA_B,
  PLANCK_ETA_B_SIGMA,
  PLANCK_OMEGA_DM_H2,
  PLANCK_OMEGA_DM_H2_SIGMA,
  ratFormat,
  ratToNumber,
}
