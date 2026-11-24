// STRONG CP PROBLEM (|theta_bar| < 10^{-10}), SO(10) PECCEI-QUINN U(1)_PQ INSIDE 10_H + 126bar_H,
// EXACT BIGINT E/N = 8/3 ANOMALY RATIO, LIVE QCD AXION RELAXATION AT f_a ~ M_PS (E-FRC-0328),
// AND COSMOLOGICAL MISALIGNMENT DARK MATTER OMEGA_a h^2
// (E-FRC-0331, Frontier 5).
//
// Three deterministic parts (zero Math.random, exact BigInt rationals + RK4 ODE with step-halving):
//
//   Part 1 - Exact BigInt Strong-CP & Peccei-Quinn Anomaly Certification on E-FRC-0324's 48 Fermions:
//     - Assigns exact BigInt U(1)_PQ charges q_PQ(16) = +1, q_PQ(10_H) = -2, q_PQ(126bar_H) = -2 and
//       certifies exact U(1)_PQ invariance of EVERY Yukawa coupling 16 * 16 * 10_H and 16 * 16 * 126bar_H
//       (Q_L u_R^c H_u, Q_L d_R^c H_d, L_L e_R^c H_d, L_L nu_R^c H_u, nu_R^c nu_R^c Delta_R^0),
//       exact prohibition of the conjugate 16 * 16 * 10_H^* coupling (charge +4 != 0), and exact
//       invariance of the scalar portal (10_H)^2 (126_H)^2 linking electroweak and Pati-Salam phases.
//     - Sums directly in exact BigInt rationals over E-FRC-0324's 16 Weyl states per generation and
//       3 x 16 = 48 Weyl states across 3 generations:
//         * Color anomaly N = Tr_{48}((T_a^c)^2 q_PQ) = 2 N_g = 6 (2 per generation)
//         * Electromagnetic anomaly E = Tr_{48}(Q^2 q_PQ) = (16/3) N_g = 16 (16/3 per generation)
//         * Exact ratio E / N = (16/3) / 2 = 8/3 identically for ALL N_g >= 1, identical to
//           1 / sin^2(theta_W)_GUT = 8/3!
//         * Exact Spin(10) center Z = exp(i (pi/2) X) with X = 3(B-L) - 4 T_3^R === 1 (mod 4) on all
//           16 states, proving U(1)_PQ cap Spin(10) acts as -1 on (10_H, 126bar_H) and quotients the
//           physical domain-wall number from N_DW = 6 (unquotiented) to N_DW = 3 (minimal Z_2-quotiented).
//         * Chiral-perturbation axion-photon coupling C_{a gamma gamma} = E/N - 1.92 = 0.746667.
//     - Audits the Z[zeta_9] strong-CP tension using E-FRC-0327's quark parameters: verifies that
//       Hermitian M_q = S_q^2 cancels arg det(M_u M_d) at tree level (while leaving bare theta_0 open),
//       whereas SO(10)-required complex symmetric Yukawas (16_i * 16_j symmetric, carrying delta_u,
//       delta_d, and Z[zeta_9] CP phase zeta_9^7) produce |theta_Yukawa| = |arg det(M_u M_d)| ~ O(1)
//       >> 10^{-10}, violating the neutron EDM limit by > 10^9x without Peccei-Quinn relaxation.
//
//   Part 2 - Chiral QCD Potential, Dynamical Relaxation ODE, Axion Mass at M_PS, and Misalignment DM:
//     - Constructs the exact 2-flavor chiral QCD axion potential
//         V(theta_bar) = -m_pi^2 f_pi^2 sqrt(1 - (4 m_u m_d / (m_u + m_d)^2) sin^2(theta_bar / 2)),
//       verifying exact curvature chi_top = (m_u m_d / (m_u + m_d)^2) m_pi^2 f_pi^2 (chi_top^{1/4}
//       matching lattice QCD 75.5 MeV within 0.7%) and unique global minimum at theta_bar = 0.
//     - Integrates the live cosmological axion oscillator ODE
//         a'' + 3 H(t) a' + m_a(T)^2 f_a sin(a / f_a) = 0
//       with temperature-dependent dilute-instanton-gas mass m_a(T) = m_a(0) / sqrt(1 + (T / T_QCD)^{2n})
//       (n = 4, T_QCD = 150 MeV) via 2-stage RK4 with explicit step-halving convergence <= 1e-9,
//       cross-checked against the exact analytic Bessel harmonic invariant J_inf / theta_i^2 =
//       (3 * 2^{4/3} / pi) * Gamma(13/12)^2 = 2.2111. Proves theta_bar(t) relaxes from arbitrary O(1)
//       bare theta_0 + theta_Yukawa in [-pi, pi] to < 10^{-18} today (both cosmic average ~10^{-22}
//       and local Milky Way halo ~3.8e-19, > 2e8x below the neutron EDM limit 10^{-10}).
//     - Ties the PQ breaking scale directly to E-FRC-0328's 2-loop Pati-Salam scale M_PS = 1.434e11 GeV:
//         * f_a = M_PS     = 1.434e11 GeV -> m_a =  39.68 micro-eV, |g_{a gamma gamma}| = 6.05e-15 GeV^{-1}
//         * f_a = M_PS / 3 = 4.780e10 GeV -> m_a = 119.05 micro-eV, |g_{a gamma gamma}| = 1.81e-14 GeV^{-1}
//         * f_a = M_PS / 6 = 2.390e10 GeV -> m_a = 238.10 micro-eV, |g_{a gamma gamma}| = 3.63e-14 GeV^{-1}
//       Every benchmark lies squarely inside the live 10..400 micro-eV haloscope search window
//       (MADMAX / ALPHA / ADMX-high-freq / ORGAN), safely above SN1987A (f_a > 4e8 GeV), and safely
//       below overclosure (f_a <= 10^{12} GeV), achieving Omega_a h^2 = 0.120 naturally at O(1) theta_i.
//
//   Part 3 - Three Negative Controls & Honest PQ Quality Boundary Audit:
//     - Control 1 (No PQ axion, bare Z[zeta_9] SO(10) quark phase): |d_n| > 10^9x above 1.8e-26 e cm.
//     - Control 2 (f_a = M_GUT = 7.95e15 GeV at theta_i = 1.0): severely overcloses (Omega_a h^2 >> 100),
//       requiring extreme fine-tuning theta_i ~ 4e-3 << 1.
//     - Control 3 (Wrong E/N = 0 KSVZ-neutral vs SO(10) E/N = 8/3): 2.57x separation in |C_{a gamma gamma}|
//       (6.61x in haloscope power).
//     - Honest open boundary: quantifies the gravitational PQ quality problem (Planck-suppressed
//       operators require discrete gauge protection up to dimension d >= 11..12) and pre-inflationary
//       domain-wall / CMB isocurvature bound H_inf < H_inf^max ~ 9e6 GeV.

import { toComplex, zetaPower } from '@/code/algebra/ninth-field'
import { INVERSE_ALPHA } from '@/code/measure/coupling-candidates'
import {
  analyzeKoideRoleFloquetAndTwelveFermions,
  PDG_FLAVOR_BENCHMARK,
} from '@/code/measure/koide-role-floquet-and-twelve-fermions'
import { EXACT_COLUMN_SHELL_COUNTS } from '@/code/measure/pair-density-gravity-slope'
import { analyzePatiSalamUnificationHierarchy } from '@/code/measure/pati-salam-unification-hierarchy'
import {
  analyzeSo10ThreeGenerations,
  rat,
  ratAdd,
  ratDiv,
  ratEq,
  ratFormat,
  ratIsZero,
  ratMul,
  ratSub,
  ratToNumber,
  type Rat,
  type Spin10StateInfo,
} from '@/code/measure/so10-three-generations'

// ---------------------------------------------------------------------------------------------------------
// Physical constants (PDG 2024 / CODATA 2022 / Planck 2018 / Lattice QCD, deterministic)

const ALPHA_EM_ZERO = 1 / INVERSE_ALPHA
const M_PLANCK_GEV = 1.22089e19
const M_PLANCK_REDUCED_GEV = M_PLANCK_GEV / Math.sqrt(8 * Math.PI)

// Chiral QCD and lattice QCD axion constants (PDG 2024 & Grilli di Cortona et al. JHEP 01 (2016) 034)
const M_PI0_MEV = 134.9768
const F_PI_MEV = 92.1
const M_U_MEV = PDG_FLAVOR_BENCHMARK.upQuarksMeV[0] // 2.16 MeV
const M_D_MEV = PDG_FLAVOR_BENCHMARK.downQuarksMeV[0] // 4.67 MeV
const CHI_TOP_NLO_QUARTER_MEV = 75.5 // Borsanyi et al. (2016) / Grilli di Cortona et al. (2016): 75.5(5) MeV
const MA_FA_PREFACTOR_UEV_AT_1E12 = 5.691 // m_a = 5.691 micro-eV * (10^{12} GeV / f_a)
const C_AGAMMA_CHPT_MODEL_INDEP = 1.92 // NLO ChPT model-independent contribution 1.92(4)
const T_QCD_GEV = 0.15 // Dilute-instanton-gas crossover reference T_QCD = 150 MeV
const INSTANTON_POWER_N = 4 // Lattice-QCD / DIGA exponent m_a(T) ~ (T_QCD / T)^4

// Neutron EDM constants (Abel et al. PRL 124 (2020) 081803; Dragos et al. PRC 103 (2021) 015202)
const NEDM_COEFF_E_CM = 1.5e-16 // |d_n| ~ 1.5e-16 * |theta_bar| e cm
const NEDM_EXP_LIMIT_E_CM = 1.8e-26 // 90% CL upper bound |d_n| < 1.8e-26 e cm
const THETA_BAR_EXP_LIMIT = 1.0e-10 // Standard strong-CP bound |theta_bar| < 1e-10

// Cosmological constants (Planck 2018 & PDG 2024)
const T_CMB_GEV = 2.7255 * 8.617333262e-14 // 2.34865e-13 GeV
const G_STAR_S_TODAY = 3.938 // Photons + 3 neutrinos with N_eff = 3.044
const H100_GEV = 2.133119e-42 // 100 km/s/Mpc in GeV
const RHO_CRIT_OVER_H2_GEV4 = 3 * H100_GEV * H100_GEV * M_PLANCK_REDUCED_GEV * M_PLANCK_REDUCED_GEV
const OMEGA_DM_H2_PLANCK = 0.12
const HBAR_C_GEV_CM = 1.973269804e-14
const RHO_DM_LOCAL_GEV_CM3 = 0.3 // Local Milky Way halo dark-matter density 0.3 GeV / cm^3
const RHO_DM_LOCAL_GEV4 = RHO_DM_LOCAL_GEV_CM3 * HBAR_C_GEV_CM ** 3
const UEV_TO_GHZ = 1e-6 / (4.135667696e-15 * 1e9) // 0.2417989242 GHz per micro-eV
const PLANCK_AS = 2.1e-9
const PLANCK_BETA_ISO_MAX = 0.038

// Experimental QCD axion window and astrophysical bounds
const SN1987A_MIN_FA_GEV = 4.0e8 // Astrophysical cooling bound f_a > 4e8 GeV (m_a < 15 meV)
const OVERCLOSURE_MAX_FA_GEV = 1.0e12 // Classical O(1) misalignment overclosure scale
const HALOSCOPE_MIN_MA_UEV = 10.0 // Live experimental high-mass QCD axion window [10, 400] micro-eV
const HALOSCOPE_MAX_MA_UEV = 400.0

// ---------------------------------------------------------------------------------------------------------
// Part 1A: Exact BigInt U(1)_PQ Charges, Yukawa Invariance, and E/N = 8/3 Anomaly Certificate

export type YukawaPqCheck = {
  readonly operator: string
  readonly chargeSum: Rat
  readonly invariantExact: boolean
}

export type PqAnomalyCertificate = {
  readonly qPq16: Rat // +1
  readonly qPq10H: Rat // -2
  readonly qPq126BarH: Rat // -2
  readonly qPq126H: Rat // +2 (conjugate of 126bar_H)
  readonly yukawaChecks: readonly YukawaPqCheck[]
  readonly allAllowedYukawasInvariantExact: boolean
  readonly conjugate10HStarCharge: Rat // +4 (forbidden!)
  readonly conjugate10HStarForbiddenExact: boolean
  readonly scalarPortalCharge: Rat // 2 * q(10_H) + 2 * q(126_H) = 0
  readonly scalarPortalInvariantExact: boolean
  // Exact BigInt anomaly traces directly over E-FRC-0324's 16 (1 gen) and 48 (3 gen) Weyl states
  readonly coloredStates1Gen: number // 12
  readonly totalStates1Gen: number // 16
  readonly totalStates3Gen: number // 48
  readonly nColor1Gen: Rat // Tr_16((T_a^c)^2 q_PQ) = 2
  readonly nColor3Gen: Rat // 2 N_g = 6
  readonly eEm1Gen: Rat // Tr_16(Q^2 q_PQ) = 16/3
  readonly eEm3Gen: Rat // (16/3) N_g = 16
  readonly trT3LSq1Gen: Rat // 2
  readonly eOverNExact: Rat // 8/3
  readonly invSin2ThetaWGutExact: Rat // 8/3
  readonly eOverNEqualsInvSin2ThetaWGutExact: boolean
  readonly eOverNConstantAcrossNg1To5Exact: boolean
  // Exact Spin(10) Z_4 center quotient reducing N_DW from 6 to 3
  readonly spin10CenterXMod4AllOneExact: boolean // X = 3(B-L) - 4 T_3^R === 1 (mod 4) on all 16 states
  readonly domainWallNumberUnquotiented: number // 6 = 2 N_g
  readonly domainWallNumberMinimalZ2Quotient: number // 3 = N_g
  // Chiral-perturbation axion-photon coupling C_{a gamma gamma}
  readonly cAgammaChptModelIndep: number // 1.92
  readonly cAgammaLoChptCheck: number // (2/3)(4 m_d + m_u) / (m_u + m_d) ~ 2.034
  readonly cAgammaSo10: number // 8/3 - 1.92 = 0.7466667
}

function certifySo10PecceiQuinnAnomalies(
  states: readonly Spin10StateInfo[],
  sin2ThetaWGutExact: Rat,
): PqAnomalyCertificate {
  const zero = rat(0n)
  const qPq16 = rat(1n)
  const qPq10H = rat(-2n)
  const qPq126BarH = rat(-2n)
  const qPq126H = rat(2n)

  const checkOp = (operator: string, charges: readonly Rat[]): YukawaPqCheck => {
    let sum = zero

    for (const q of charges) {
      sum = ratAdd(sum, q)
    }

    return { operator, chargeSum: sum, invariantExact: ratIsZero(sum) }
  }

  const yukawaChecks: readonly YukawaPqCheck[] = [
    checkOp('16 * 16 * 10_H (SO(10) Dirac Yukawa)', [qPq16, qPq16, qPq10H]),
    checkOp('16 * 16 * 126bar_H (SO(10) Majorana + GJ Yukawa)', [qPq16, qPq16, qPq126BarH]),
    checkOp('Q_L * u_R^c * H_u', [qPq16, qPq16, qPq10H]),
    checkOp('Q_L * d_R^c * H_d', [qPq16, qPq16, qPq10H]),
    checkOp('L_L * e_R^c * H_d', [qPq16, qPq16, qPq10H]),
    checkOp('L_L * nu_R^c * H_u', [qPq16, qPq16, qPq10H]),
    checkOp('nu_R^c * nu_R^c * Delta_R^0 (seesaw + PQ VEV)', [qPq16, qPq16, qPq126BarH]),
  ]

  const allAllowedYukawasInvariantExact = yukawaChecks.every(y => y.invariantExact)

  // Forbidden conjugate coupling 16 * 16 * 10_H^* carries PQ charge 1 + 1 + 2 = +4 != 0
  const conjugate10HStarCharge = ratAdd(ratAdd(qPq16, qPq16), rat(2n))
  const conjugate10HStarForbiddenExact = ratEq(conjugate10HStarCharge, rat(4n))

  // Scalar portal (10_H)^2 (126_H)^2 linking electroweak bidoublet phase to Pati-Salam PQ phase
  const scalarPortalCharge = ratAdd(ratMul(rat(2n), qPq10H), ratMul(rat(2n), qPq126H))
  const scalarPortalInvariantExact = ratIsZero(scalarPortalCharge)

  // Sum color and electromagnetic PQ anomalies directly over E-FRC-0324's 16 chiral Weyl states.
  // For each state s in 16, C_2(SU(3)_C) / dim(SU(3)_C) = (4/3) / 8 = 1/6 for color triplets/antitriplets
  // and 0 for color singlets, summing to exact Dynkin index Tr_16((T_a^c)^2 q_PQ) = 12 * (1/6) = 2!
  const invDimSu3 = rat(1n, 8n)
  let coloredStates1Gen = 0
  let nColor1Gen = zero
  let eEm1Gen = zero
  let trT3LSq1Gen = zero
  let spin10CenterXMod4AllOneExact = true

  for (const s of states) {
    if (s.su3Dim === 3) {
      coloredStates1Gen++
    }

    const s2ColorState = ratMul(s.c2Su3, invDimSu3)

    nColor1Gen = ratAdd(nColor1Gen, ratMul(s2ColorState, qPq16))
    eEm1Gen = ratAdd(eEm1Gen, ratMul(ratMul(s.q, s.q), qPq16))
    trT3LSq1Gen = ratAdd(trT3LSq1Gen, ratMul(s.t3L, s.t3L))

    // Exact Spin(10) Cartan U(1)_X generator: X = 3(B-L) - 4 T_3^R.
    // Must be an integer congruent to 1 (mod 4) on EVERY state of the chiral 16!
    const xCharge = ratSub(ratMul(rat(3n), s.bMinusL), ratMul(rat(4n), s.t3R))

    if (xCharge.den !== 1n) {
      spin10CenterXMod4AllOneExact = false
    } else {
      const mod4 = ((xCharge.num % 4n) + 4n) % 4n

      if (mod4 !== 1n) {
        spin10CenterXMod4AllOneExact = false
      }
    }
  }

  const nGen3 = rat(3n)
  const nColor3Gen = ratMul(nGen3, nColor1Gen) // exact 6
  const eEm3Gen = ratMul(nGen3, eEm1Gen) // exact 16
  const eOverNExact = ratDiv(eEm3Gen, nColor3Gen) // exact 8/3
  const invSin2ThetaWGutExact = ratDiv(rat(1n), sin2ThetaWGutExact) // exact 8/3
  const eOverNEqualsInvSin2ThetaWGutExact =
    ratEq(eOverNExact, rat(8n, 3n)) && ratEq(eOverNExact, invSin2ThetaWGutExact)

  // Certify E / N === 8/3 identically across N_g = 1, 2, 3, 4, 5 in exact BigInt rationals
  let eOverNConstantAcrossNg1To5Exact = true

  for (let ng = 1n; ng <= 5n; ng++) {
    const nNg = ratMul(rat(ng), nColor1Gen)
    const eNg = ratMul(rat(ng), eEm1Gen)

    if (!ratEq(ratDiv(eNg, nNg), rat(8n, 3n))) {
      eOverNConstantAcrossNg1To5Exact = false
    }
  }

  // Unquotiented domain-wall number: N_DW = |2 * N_color_3gen| / |q_PQ(126bar_H)| = 12 / 2 = 6.
  // Because Spin(10) gauge center Z = exp(i (pi/2) X) acts as +i on 16 and -1 on (10_H, 126bar_H),
  // a half-period shift of Delta_R^0 -> -Delta_R^0 is a pure Spin(10) gauge transformation,
  // quotienting U(1)_PQ by Z_2 and reducing minimal physical N_DW from 6 to 3!
  const domainWallNumberUnquotiented = Number(
    ratToNumber(ratDiv(ratMul(rat(2n), nColor3Gen), rat(2n))),
  )
  const domainWallNumberMinimalZ2Quotient = spin10CenterXMod4AllOneExact
    ? domainWallNumberUnquotiented / 2
    : domainWallNumberUnquotiented

  const cAgammaLoChptCheck = (2 / 3) * ((4 * M_D_MEV + M_U_MEV) / (M_U_MEV + M_D_MEV))
  const cAgammaSo10 = ratToNumber(eOverNExact) - C_AGAMMA_CHPT_MODEL_INDEP

  return {
    qPq16,
    qPq10H,
    qPq126BarH,
    qPq126H,
    yukawaChecks,
    allAllowedYukawasInvariantExact,
    conjugate10HStarCharge,
    conjugate10HStarForbiddenExact,
    scalarPortalCharge,
    scalarPortalInvariantExact,
    coloredStates1Gen,
    totalStates1Gen: states.length,
    totalStates3Gen: 3 * states.length,
    nColor1Gen,
    nColor3Gen,
    eEm1Gen,
    eEm3Gen,
    trT3LSq1Gen,
    eOverNExact,
    invSin2ThetaWGutExact,
    eOverNEqualsInvSin2ThetaWGutExact,
    eOverNConstantAcrossNg1To5Exact,
    spin10CenterXMod4AllOneExact,
    domainWallNumberUnquotiented,
    domainWallNumberMinimalZ2Quotient,
    cAgammaChptModelIndep: C_AGAMMA_CHPT_MODEL_INDEP,
    cAgammaLoChptCheck,
    cAgammaSo10,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Part 1B: Exact Z[zeta_9] Quark Yukawa Strong-CP Tension Audit from E-FRC-0327

type Mat3C = {
  readonly re: Float64Array
  readonly im: Float64Array
}

function mul3C(a: Mat3C, b: Mat3C): Mat3C {
  const re = new Float64Array(9)
  const im = new Float64Array(9)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < 3; k++) {
        const ar = a.re[i * 3 + k]!
        const ai = a.im[i * 3 + k]!
        const br = b.re[k * 3 + j]!
        const bi = b.im[k * 3 + j]!

        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }

      re[i * 3 + j] = sr
      im[i * 3 + j] = si
    }
  }

  return { re, im }
}

function det3C(m: Mat3C): readonly [number, number] {
  const c = (r: number, k: number): readonly [number, number] => [
    m.re[r * 3 + k]!,
    m.im[r * 3 + k]!,
  ]
  const cm = (
    a: readonly [number, number],
    b: readonly [number, number],
  ): readonly [number, number] => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
  const cs = (
    a: readonly [number, number],
    b: readonly [number, number],
  ): readonly [number, number] => [a[0] - b[0], a[1] - b[1]]
  const ca = (
    a: readonly [number, number],
    b: readonly [number, number],
  ): readonly [number, number] => [a[0] + b[0], a[1] + b[1]]

  const m00 = cs(cm(c(1, 1), c(2, 2)), cm(c(1, 2), c(2, 1)))
  const m01 = cs(cm(c(1, 0), c(2, 2)), cm(c(1, 2), c(2, 0)))
  const m02 = cs(cm(c(1, 0), c(2, 1)), cm(c(1, 1), c(2, 0)))

  return ca(cs(cm(c(0, 0), m00), cm(c(0, 1), m01)), cm(c(0, 2), m02))
}

function wrapAnglePi(theta: number): number {
  let x = ((theta + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI

  if (x <= -Math.PI) x += 2 * Math.PI

  return x
}

function buildWarpedKoideHermitian3C(
  weightsW: readonly [number, number, number],
  delta: number,
  vScale: number,
): Mat3C {
  const re = new Float64Array(9)
  const im = new Float64Array(9)
  const cRe = (Math.SQRT2 / 2) * Math.cos(delta)
  const cIm = (Math.SQRT2 / 2) * Math.sin(delta)

  for (let k = 0; k < 3; k++) {
    const next = (k + 1) % 3
    const wk = weightsW[k]!
    const wn = weightsW[next]!

    re[k * 3 + k] = vScale * wk * wk
    re[next * 3 + k] = vScale * wn * wk * cRe
    im[next * 3 + k] = vScale * wn * wk * cIm
    re[k * 3 + next] = vScale * wk * wn * cRe
    im[k * 3 + next] = -vScale * wk * wn * cIm
  }

  return { re, im }
}

// SO(10)-symmetric complex Yukawa square-root texture (16_i * 16_j is symmetric in generation indices):
//   (S_q^sym)_{kk} = v_q w_k^2, (S_q^sym)_{ij} = (S_q^sym)_{ji} = v_q w_i w_j (sqrt(2)/2) e^{i delta_q}
// Optionally dresses off-diagonal symmetric entries with E-FRC-0327's F4 (1/sqrt(2)) Z[zeta_9] coupling.
function buildSo10SymmetricQuarkMatrix(
  weightsW: readonly [number, number, number],
  delta: number,
  vScale: number,
  misCouplings?: readonly [number, number, number],
  zeta9Exps?: readonly [number, number, number],
  includeZeta9Phase = true,
): Mat3C {
  const sRe = new Float64Array(9)
  const sIm = new Float64Array(9)
  const cRe = (Math.SQRT2 / 2) * Math.cos(delta)
  const cIm = (Math.SQRT2 / 2) * Math.sin(delta)

  for (let i = 0; i < 3; i++) {
    const wi = weightsW[i]!

    sRe[i * 3 + i] = vScale * wi * wi

    for (let j = i + 1; j < 3; j++) {
      const wj = weightsW[j]!
      const vr = vScale * wi * wj * cRe
      const vi = vScale * wi * wj * cIm

      sRe[i * 3 + j] = vr
      sIm[i * 3 + j] = vi
      sRe[j * 3 + i] = vr
      sIm[j * 3 + i] = vi
    }
  }

  // M_q = (S_q^sym)^2 is strictly complex symmetric: ((S^sym)^2)^T = (S^sym)^2
  const m = mul3C({ re: sRe, im: sIm }, { re: sRe, im: sIm })

  if (misCouplings && zeta9Exps) {
    const pairs: readonly (readonly [number, number, number])[] = [
      [0, 1, 0],
      [1, 2, 1],
      [0, 2, 2],
    ]
    const f4 = 1 / Math.SQRT2

    for (const [r, c, idx] of pairs) {
      const g = misCouplings[idx]!
      const exp = zeta9Exps[idx]!
      const [zr, zi] = includeZeta9Phase ? toComplex(zetaPower(exp)) : [1, 0]
      const fr = 1 + f4 * g * zr
      const fi = f4 * g * zi
      const baseR = m.re[r * 3 + c]!
      const baseI = m.im[r * 3 + c]!
      const nr = baseR * fr - baseI * fi
      const ni = baseR * fi + baseI * fr

      m.re[r * 3 + c] = nr
      m.im[r * 3 + c] = ni
      m.re[c * 3 + r] = nr
      m.im[c * 3 + r] = ni
    }
  }

  return m
}

function matrixSymmetryErr(m: Mat3C): number {
  let err = 0

  for (let r = 0; r < 3; r++) {
    for (let c = r + 1; c < 3; c++) {
      err = Math.max(
        err,
        Math.hypot(m.re[r * 3 + c]! - m.re[c * 3 + r]!, m.im[r * 3 + c]! - m.im[c * 3 + r]!),
      )
    }
  }

  return err
}

export type StrongCpTensionAudit = {
  readonly eFrc0327DownEta: number
  readonly eFrc0327DownDeltaRad: number
  readonly eFrc0327UpEta: number
  readonly eFrc0327UpDeltaRad: number
  readonly eFrc0327CkmJarlskog: number
  readonly eFrc0327Zeta9Exps: readonly [number, number, number]
  readonly so10MuSymmetryErr: number
  readonly so10MdSymmetryErr: number
  readonly thetaYukawaSo10MuRad: number
  readonly thetaYukawaSo10MdRad: number
  readonly thetaYukawaSo10FullRad: number // arg det(M_u^SO(10) M_d^SO(10)) in (-pi, pi]
  readonly thetaYukawaZeta9OnlyRad: number // Isolating ONLY the Z[zeta_9] phase zeta_9^7 (delta_u = delta_d = 0)
  readonly thetaYukawaHermitianRad: number // Exact 0 for Hermitian S_q^2 (leaves bare theta_0 unconstrained)
  readonly thetaYukawaRealControlRad: number // Exact 0 when all complex phases are turned off
  readonly nedmWithoutPqFullECm: number
  readonly nedmWithoutPqZeta9OnlyECm: number
  readonly nedmViolationFactorFull: number // |d_n| / 1.8e-26 >> 10^8
  readonly nedmViolationFactorZeta9Only: number
  readonly requiresStrongCpMechanism: boolean
}

function auditZeta9StrongCpTension(): StrongCpTensionAudit {
  const flavor = analyzeKoideRoleFloquetAndTwelveFermions()
  const p2 = flavor.part2
  const staggeredShells: readonly [number, number, number] = [
    EXACT_COLUMN_SHELL_COUNTS[0],
    EXACT_COLUMN_SHELL_COUNTS[2],
    EXACT_COLUMN_SHELL_COUNTS[3],
  ]

  const weightsFromEta = (eta: number): readonly [number, number, number] => [
    Math.pow(staggeredShells[0], -0.5 * eta),
    Math.pow(staggeredShells[1], -0.5 * eta),
    Math.pow(staggeredShells[2], -0.5 * eta),
  ]

  const wUp = weightsFromEta(p2.upQuarks.eta)
  const wDown = weightsFromEta(p2.downQuarks.eta)
  const vUp = p2.upQuarks.vScaleMeVHalf
  const vDown = p2.downQuarks.vScaleMeVHalf
  const deltaUp = p2.upQuarks.deltaRad
  const deltaDown = p2.downQuarks.deltaRad
  const misCouplings = p2.ckm.misalignmentCouplings
  const zeta9Exps = p2.ckm.zeta9PhaseExps

  // 1. Full SO(10)-symmetric complex Yukawas carrying E-FRC-0327's quark phases & zeta_9^7 CP phase
  const mUpSo10 = buildSo10SymmetricQuarkMatrix(wUp, deltaUp, vUp)
  const mDownSo10 = buildSo10SymmetricQuarkMatrix(
    wDown,
    deltaDown,
    vDown,
    misCouplings,
    zeta9Exps,
    true,
  )
  const detUpSo10 = det3C(mUpSo10)
  const detDownSo10 = det3C(mDownSo10)
  const thetaYukawaSo10MuRad = Math.atan2(detUpSo10[1], detUpSo10[0])
  const thetaYukawaSo10MdRad = Math.atan2(detDownSo10[1], detDownSo10[0])
  const thetaYukawaSo10FullRad = wrapAnglePi(thetaYukawaSo10MuRad + thetaYukawaSo10MdRad)

  // 2. Isolate ONLY the Z[zeta_9] weak-CP phase zeta_9^7 (delta_u = delta_d = 0)
  const mUpZeta9Only = buildSo10SymmetricQuarkMatrix(wUp, 0, vUp)
  const mDownZeta9Only = buildSo10SymmetricQuarkMatrix(
    wDown,
    0,
    vDown,
    misCouplings,
    zeta9Exps,
    true,
  )
  const detUpZ9 = det3C(mUpZeta9Only)
  const detDownZ9 = det3C(mDownZeta9Only)
  const thetaYukawaZeta9OnlyRad = wrapAnglePi(
    Math.atan2(detUpZ9[1], detUpZ9[0]) + Math.atan2(detDownZ9[1], detDownZ9[0]),
  )

  // 3. Hermitian S_q^2 comparison: compute arg det(S_u^2 S_d^2) = 2 arg det(S_u) + 2 arg det(S_d)
  //    to avoid squaring the up-quark condition number (m_t / m_u ~ 10^5 -> 10^10)
  const sUpHerm = buildWarpedKoideHermitian3C(wUp, deltaUp, vUp)
  const sDownHerm = buildWarpedKoideHermitian3C(wDown, deltaDown, vDown)
  const detSuHerm = det3C(sUpHerm)
  const detSdHerm = det3C(sDownHerm)
  const thetaYukawaHermitianRad = wrapAnglePi(
    2 * Math.atan2(detSuHerm[1], detSuHerm[0]) + 2 * Math.atan2(detSdHerm[1], detSdHerm[0]),
  )

  // 4. Real-phase control (delta_u = delta_d = 0 and zeta_9 -> 1) -> arg det = 0 identically
  const mUpReal = buildSo10SymmetricQuarkMatrix(wUp, 0, vUp)
  const mDownReal = buildSo10SymmetricQuarkMatrix(wDown, 0, vDown, misCouplings, zeta9Exps, false)
  const detReal = det3C(mul3C(mUpReal, mDownReal))
  const thetaYukawaRealControlRad = Math.atan2(detReal[1], detReal[0])

  const nedmWithoutPqFullECm = NEDM_COEFF_E_CM * Math.abs(thetaYukawaSo10FullRad)
  const nedmWithoutPqZeta9OnlyECm = NEDM_COEFF_E_CM * Math.abs(thetaYukawaZeta9OnlyRad)
  const nedmViolationFactorFull = nedmWithoutPqFullECm / NEDM_EXP_LIMIT_E_CM
  const nedmViolationFactorZeta9Only = nedmWithoutPqZeta9OnlyECm / NEDM_EXP_LIMIT_E_CM

  return {
    eFrc0327DownEta: p2.downQuarks.eta,
    eFrc0327DownDeltaRad: deltaDown,
    eFrc0327UpEta: p2.upQuarks.eta,
    eFrc0327UpDeltaRad: deltaUp,
    eFrc0327CkmJarlskog: p2.ckm.jarlskogCP,
    eFrc0327Zeta9Exps: zeta9Exps,
    so10MuSymmetryErr: matrixSymmetryErr(mUpSo10),
    so10MdSymmetryErr: matrixSymmetryErr(mDownSo10),
    thetaYukawaSo10MuRad,
    thetaYukawaSo10MdRad,
    thetaYukawaSo10FullRad,
    thetaYukawaZeta9OnlyRad,
    thetaYukawaHermitianRad,
    thetaYukawaRealControlRad,
    nedmWithoutPqFullECm,
    nedmWithoutPqZeta9OnlyECm,
    nedmViolationFactorFull,
    nedmViolationFactorZeta9Only,
    requiresStrongCpMechanism:
      Math.abs(thetaYukawaSo10FullRad) > THETA_BAR_EXP_LIMIT &&
      Math.abs(thetaYukawaZeta9OnlyRad) > THETA_BAR_EXP_LIMIT &&
      nedmViolationFactorFull > 1e8,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Part 2A: Exact Two-Flavor Chiral QCD Axion Potential & Vafa-Witten Minimization

export type ChiralAxionPotentialReport = {
  readonly zRatioMuOverMd: number
  readonly kappaChiral: number // 4 m_u m_d / (m_u + m_d)^2
  readonly chiTopLoMeV4: number
  readonly chiTopLoQuarterMeV: number // ~76.03 MeV (within 0.7% of lattice QCD 75.5 MeV)
  readonly chiTopNloQuarterMeV: number // 75.5 MeV
  readonly chiTopQuarterRelDiffFromLatticePct: number
  readonly numericCurvatureAtZeroMeV4: number
  readonly curvatureAnalyticVsNumericRelErr: number
  readonly potentialAtZeroMeV4: number
  readonly potentialAtPiMeV4: number
  readonly barrierHeightMeV4: number
  readonly minConvergedMaxAbsTheta: number // Max |theta_min| across 4 arbitrary initial guesses
  readonly uniqueGlobalMinimumAtZero: boolean
}

function chiralPotentialMeV4(theta: number, kappa: number): number {
  const s = Math.sin(0.5 * theta)

  return -M_PI0_MEV * M_PI0_MEV * F_PI_MEV * F_PI_MEV * Math.sqrt(Math.max(0, 1 - kappa * s * s))
}

function chiralPotentialShiftMeV4(theta: number, kappa: number): number {
  // Cancellation-free form of V(theta) - V(0) = m_pi^2 f_pi^2 (1 - sqrt(1 - kappa sin^2(theta/2)))
  const s = Math.sin(0.5 * theta)
  const ks2 = kappa * s * s

  return (M_PI0_MEV * M_PI0_MEV * F_PI_MEV * F_PI_MEV * ks2) / (1 + Math.sqrt(Math.max(0, 1 - ks2)))
}

function chiralPotentialDerivMeV4(theta: number, kappa: number): number {
  const s = Math.sin(0.5 * theta)
  const root = Math.sqrt(Math.max(1e-30, 1 - kappa * s * s))

  return (M_PI0_MEV * M_PI0_MEV * F_PI_MEV * F_PI_MEV * kappa * Math.sin(theta)) / (4 * root)
}

function analyzeChiralAxionPotential(thetaYukawa: number): ChiralAxionPotentialReport {
  const zRatioMuOverMd = M_U_MEV / M_D_MEV
  const kappaChiral = (4 * M_U_MEV * M_D_MEV) / (M_U_MEV + M_D_MEV) ** 2
  const chiTopLoMeV4 =
    ((M_U_MEV * M_D_MEV) / (M_U_MEV + M_D_MEV) ** 2) * M_PI0_MEV * M_PI0_MEV * F_PI_MEV * F_PI_MEV
  const chiTopLoQuarterMeV = Math.pow(chiTopLoMeV4, 0.25)
  const chiTopQuarterRelDiffFromLatticePct =
    ((chiTopLoQuarterMeV - CHI_TOP_NLO_QUARTER_MEV) / CHI_TOP_NLO_QUARTER_MEV) * 100

  // 4th-order central finite-difference curvature check at theta = 0 using cancellation-free shift
  const h = 1e-3
  const dv0 = chiralPotentialShiftMeV4(0, kappaChiral)
  const dv1 = chiralPotentialShiftMeV4(h, kappaChiral)
  const dv2 = chiralPotentialShiftMeV4(2 * h, kappaChiral)
  const numericCurvatureAtZeroMeV4 = (-2 * dv2 + 32 * dv1 - 30 * dv0) / (12 * h * h)
  const curvatureAnalyticVsNumericRelErr =
    Math.abs(numericCurvatureAtZeroMeV4 - chiTopLoMeV4) / chiTopLoMeV4

  const potentialAtZeroMeV4 = chiralPotentialMeV4(0, kappaChiral)
  const potentialAtPiMeV4 = chiralPotentialMeV4(Math.PI, kappaChiral)
  const barrierHeightMeV4 = potentialAtPiMeV4 - potentialAtZeroMeV4

  // Deterministic damped Newton / gradient minimization from 4 distinct O(1) bare angles
  const starts = [-2.9, -1.7, thetaYukawa, 2.6]
  let minConvergedMaxAbsTheta = 0

  for (const th0 of starts) {
    let th = wrapAnglePi(th0)

    for (let iter = 0; iter < 60; iter++) {
      const g = chiralPotentialDerivMeV4(th, kappaChiral)

      if (Math.abs(g) < 1e-24) break

      // Exact second derivative for Newton step when in convex basin, damped gradient descent otherwise
      const eps = 1e-6
      const h2 =
        (chiralPotentialDerivMeV4(th + eps, kappaChiral) -
          chiralPotentialDerivMeV4(th - eps, kappaChiral)) /
        (2 * eps)

      if (h2 > 0.1 * chiTopLoMeV4) {
        th = wrapAnglePi(th - g / h2)
      } else {
        th = wrapAnglePi(th - 0.5 * (g / chiTopLoMeV4))
      }
    }

    minConvergedMaxAbsTheta = Math.max(minConvergedMaxAbsTheta, Math.abs(th))
  }

  // Verify V(theta) > V(0) across a dense deterministic grid on [-pi, pi] \ {0}
  let uniqueGlobalMinimumAtZero = minConvergedMaxAbsTheta < 1e-14

  for (let i = -360; i <= 360; i++) {
    if (i === 0) continue

    const th = (i / 360) * Math.PI

    if (!(chiralPotentialMeV4(th, kappaChiral) > potentialAtZeroMeV4)) {
      uniqueGlobalMinimumAtZero = false
    }
  }

  return {
    zRatioMuOverMd,
    kappaChiral,
    chiTopLoMeV4,
    chiTopLoQuarterMeV,
    chiTopNloQuarterMeV: CHI_TOP_NLO_QUARTER_MEV,
    chiTopQuarterRelDiffFromLatticePct,
    numericCurvatureAtZeroMeV4,
    curvatureAnalyticVsNumericRelErr,
    potentialAtZeroMeV4,
    potentialAtPiMeV4,
    barrierHeightMeV4,
    minConvergedMaxAbsTheta,
    uniqueGlobalMinimumAtZero,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Part 2B: Smooth SM Relativistic Degrees of Freedom g_*(T) & Live RK4 Cosmological Axion Oscillator ODE

// Exact thermal phase-space integral ratio rho(m/T) / rho(0) for bosonic (-1) or fermionic (+1) species
function thermalEnergyFraction(massOverT: number, fermionic: boolean): number {
  if (massOverT <= 1e-5) return 1
  if (massOverT >= 35) return 0

  const nPts = 32
  const yMax = 16
  const dy = yMax / nPts
  const sign = fermionic ? 1 : -1
  let sum = 0

  for (let i = 0; i < nPts; i++) {
    const y = (i + 0.5) * dy
    const e = Math.hypot(y, massOverT)

    if (e > 50) continue

    sum += (y * y * e) / (Math.exp(e) + sign)
  }

  const norm = fermionic ? (7 / 8) * (Math.PI ** 4 / 15) : Math.PI ** 4 / 15

  return Math.min(1, (sum * dy) / norm)
}

// Deterministic SM effective relativistic degrees of freedom g_*(T) with smooth lattice-QCD crossover
function smRelativisticDof(tGeV: number): { readonly gStar: number; readonly gStarS: number } {
  const fQgp = 0.5 * (1 + Math.tanh(Math.log(tGeV / 0.155) / 0.25))

  // Electroweak bosons & leptons
  let gB = 2 // photon
  gB += 6 * thermalEnergyFraction(80.379 / tGeV, false) // W+-
  gB += 3 * thermalEnergyFraction(91.1876 / tGeV, false) // Z0
  gB += 1 * thermalEnergyFraction(125.25 / tGeV, false) // Higgs

  let gF = 6 // 3 left-handed neutrinos (plus antineutrinos)
  gF += 4 * thermalEnergyFraction(0.000511 / tGeV, true) // e
  gF += 4 * thermalEnergyFraction(0.10566 / tGeV, true) // mu
  gF += 4 * thermalEnergyFraction(1.77686 / tGeV, true) // tau

  // Hadronic vs deconfined quark-gluon plasma
  const gQgpB = 16 // gluons
  const gQgpF =
    24 * thermalEnergyFraction(0.004 / tGeV, true) + // u, d
    12 * thermalEnergyFraction(0.0934 / tGeV, true) + // s
    12 * thermalEnergyFraction(1.27 / tGeV, true) + // c
    12 * thermalEnergyFraction(4.18 / tGeV, true) + // b
    12 * thermalEnergyFraction(172.69 / tGeV, true) // t
  const gPionB = 3 * thermalEnergyFraction(0.138 / tGeV, false)

  const gTotal = gB + fQgp * gQgpB + (1 - fQgp) * gPionB + (7 / 8) * (gF + fQgp * gQgpF)

  // Above neutrino decoupling (T > 1 MeV), g_* and g_*S are equal to within < 1%
  return { gStar: gTotal, gStarS: gTotal }
}

function hubbleRadGeV(tGeV: number): number {
  const { gStar } = smRelativisticDof(tGeV)

  return Math.sqrt((Math.PI * Math.PI * gStar) / 90) * ((tGeV * tGeV) / M_PLANCK_REDUCED_GEV)
}

// Smooth C^infinity dilute-instanton-gas axion mass m_a(T) = m_a(0) / sqrt(1 + (T / T_QCD)^{2n})
function axionMassZeroGeV(fAGeV: number): number {
  return (MA_FA_PREFACTOR_UEV_AT_1E12 * 1e-15 * 1e12) / fAGeV
}

function axionMassAtTGeV(tGeV: number, mA0GeV: number): number {
  const r = tGeV / T_QCD_GEV

  return mA0GeV / Math.sqrt(1 + Math.pow(r, 2 * INSTANTON_POWER_N))
}

// Solve 3 H(T_osc) = m_a(T_osc) deterministically via bisection to <= 1e-14 relative tolerance
function solveOscillationTempGeV(fAGeV: number): {
  readonly tOscGeV: number
  readonly hOscGeV: number
  readonly mAOscGeV: number
  readonly gStarOsc: number
  readonly gStarSOsc: number
} {
  const mA0GeV = axionMassZeroGeV(fAGeV)
  let logLo = -5 // 1e-5 GeV
  let logHi = 4 // 1e4 GeV

  for (let iter = 0; iter < 80; iter++) {
    const mid = 0.5 * (logLo + logHi)
    const t = Math.pow(10, mid)
    const lhs = 3 * hubbleRadGeV(t)
    const rhs = axionMassAtTGeV(t, mA0GeV)

    if (lhs < rhs) {
      logLo = mid
    } else {
      logHi = mid
    }
  }

  const tOscGeV = Math.pow(10, 0.5 * (logLo + logHi))
  const { gStar, gStarS } = smRelativisticDof(tOscGeV)
  const hOscGeV = hubbleRadGeV(tOscGeV)
  const mAOscGeV = axionMassAtTGeV(tOscGeV, mA0GeV)

  return { tOscGeV, hOscGeV, mAOscGeV, gStarOsc: gStar, gStarSOsc: gStarS }
}

export type AxionOdeRunResult = {
  readonly fAGeV: number
  readonly thetaInitialRad: number
  readonly tOscGeV: number
  readonly gStarOsc: number
  readonly xEnd: number
  readonly thetaAtXEnd: number
  readonly adiabaticInvariantJ: number
  readonly rk4StepHalvingErrTheta: number
  readonly rk4StepHalvingErrJ: number
  readonly omegaAH2: number
  readonly thetaCosmicTodayAmp: number
  readonly thetaLocalHaloAmp: number
  readonly nedmLocalOscECm: number
}

// 2-stage 4th-order Runge-Kutta integration of the live cosmological axion oscillator ODE:
//   Stage 1 (x in [x_0, x_mid]): theta'' + (2/x) theta' + omega(x)^2 sin(theta) = 0
//   Stage 2 (z = (1/2) x^6 in [z_mid, z_end]): d^2 theta/dz^2 + (7/(6z)) d theta/dz + (omega(x)/(3 x^5))^2 sin(theta) = 0
// With exact non-singular transformation from Stage 1 to Stage 2 and explicit step-halving convergence check.
function integrateAxionOscillator(
  fAGeV: number,
  thetaInit: number,
  stepsStage1: number,
  stepsStage2: number,
): {
  readonly thetaEnd: number
  readonly dThetaDzEnd: number
  readonly xEnd: number
  readonly jAdiabatic: number
  readonly osc: ReturnType<typeof solveOscillationTempGeV>
} {
  const osc = solveOscillationTempGeV(fAGeV)
  const mA0GeV = axionMassZeroGeV(fAGeV)
  const invMAOsc = 1 / osc.mAOscGeV

  const omegaOfX = (x: number): number => 3 * x * axionMassAtTGeV(osc.tOscGeV / x, mA0GeV) * invMAOsc

  // Stage 1: x from x0 = 0.05 to xMid = 1.2 (analytic series initialization exact to < 1e-15)
  const x0 = 0.05
  const xMid = 1.2
  const h1 = (xMid - x0) / stepsStage1
  const sinInit = Math.sin(thetaInit)
  let th = thetaInit - (3 / 52) * sinInit * Math.pow(x0, 12)
  let v = -(36 / 52) * sinInit * Math.pow(x0, 11) // d theta / dx

  const accX = (x: number, angle: number, vel: number): number => {
    const w = omegaOfX(x)

    return -(2 / x) * vel - w * w * Math.sin(angle)
  }

  for (let i = 0; i < stepsStage1; i++) {
    const x = x0 + i * h1
    const xm = x + 0.5 * h1
    const xn = x + h1

    const k1Th = v
    const k1V = accX(x, th, v)

    const k2Th = v + 0.5 * h1 * k1V
    const k2V = accX(xm, th + 0.5 * h1 * k1Th, k2Th)

    const k3Th = v + 0.5 * h1 * k2V
    const k3V = accX(xm, th + 0.5 * h1 * k2Th, k3Th)

    const k4Th = v + h1 * k3V
    const k4V = accX(xn, th + h1 * k3Th, k4Th)

    th += (h1 / 6) * (k1Th + 2 * k2Th + 2 * k3Th + k4Th)
    v += (h1 / 6) * (k1V + 2 * k2V + 2 * k3V + k4V)
  }

  // Exact transition to phase-uniform coordinate z = (1/2) x^6 (dz/dx = 3 x^5)
  const zMid = 0.5 * Math.pow(xMid, 6)
  const zEnd = 120.0 // xEnd = (240)^(1/6) = 2.493 -> ~19 full oscillations, adiabatic invariant locked
  const h2 = (zEnd - zMid) / stepsStage2
  let vz = v / (3 * Math.pow(xMid, 5)) // d theta / dz

  const accZ = (z: number, angle: number, velZ: number): number => {
    const x = Math.pow(2 * z, 1 / 6)
    const ratio = omegaOfX(x) / (3 * Math.pow(x, 5))

    return -(7 / (6 * z)) * velZ - ratio * ratio * Math.sin(angle)
  }

  for (let i = 0; i < stepsStage2; i++) {
    const z = zMid + i * h2
    const zm = z + 0.5 * h2
    const zn = z + h2

    const k1Th = vz
    const k1V = accZ(z, th, vz)

    const k2Th = vz + 0.5 * h2 * k1V
    const k2V = accZ(zm, th + 0.5 * h2 * k1Th, k2Th)

    const k3Th = vz + 0.5 * h2 * k2V
    const k3V = accZ(zm, th + 0.5 * h2 * k2Th, k3Th)

    const k4Th = vz + h2 * k3V
    const k4V = accZ(zn, th + h2 * k3Th, k4Th)

    th += (h2 / 6) * (k1Th + 2 * k2Th + 2 * k3Th + k4Th)
    vz += (h2 / 6) * (k1V + 2 * k2V + 2 * k3V + k4V)
  }

  const xEnd = Math.pow(2 * zEnd, 1 / 6)
  const wEnd = omegaOfX(xEnd)
  const vEnd = vz * 3 * Math.pow(xEnd, 5) // d theta / dx at xEnd
  // Exact comoving adiabatic invariant J(x) = x^2 (theta')^2 / (2 omega) + x^2 omega (1 - cos theta)
  const jAdiabatic =
    (xEnd * xEnd * vEnd * vEnd) / (2 * wEnd) + xEnd * xEnd * wEnd * (1 - Math.cos(th))

  return { thetaEnd: th, dThetaDzEnd: vz, xEnd, jAdiabatic, osc }
}

function runAxionCosmologyOde(
  fAGeV: number,
  thetaInit: number,
  checkStepHalving: boolean,
): AxionOdeRunResult {
  const s1 = checkStepHalving ? 800 : 600
  const s2 = checkStepHalving ? 48000 : 14000
  const coarse = integrateAxionOscillator(fAGeV, thetaInit, s1, s2)
  let fine = coarse
  let rk4StepHalvingErrTheta = 0
  let rk4StepHalvingErrJ = 0

  if (checkStepHalving) {
    fine = integrateAxionOscillator(fAGeV, thetaInit, 2 * s1, 2 * s2)
    rk4StepHalvingErrTheta = Math.abs(fine.thetaEnd - coarse.thetaEnd)
    rk4StepHalvingErrJ = Math.abs(fine.jAdiabatic - coarse.jAdiabatic)
  }

  const mA0GeV = axionMassZeroGeV(fAGeV)
  const sOscGeV3 =
    ((2 * Math.PI * Math.PI) / 45) * fine.osc.gStarSOsc * Math.pow(fine.osc.tOscGeV, 3)
  const sTodayGeV3 = ((2 * Math.PI * Math.PI) / 45) * G_STAR_S_TODAY * Math.pow(T_CMB_GEV, 3)

  // Conserved comoving yield Y_a = n_a / s = H(T_osc) * f_a^2 * J_inf / s(T_osc)
  const yA = (fine.osc.hOscGeV * fAGeV * fAGeV * fine.jAdiabatic) / sOscGeV3
  const rhoATodayGeV4 = mA0GeV * yA * sTodayGeV3
  const omegaAH2 = rhoATodayGeV4 / RHO_CRIT_OVER_H2_GEV4

  // Today's residual CP-violating oscillation amplitude:
  //   rho_a = (1/2) m_a(0)^2 f_a^2 theta_amp^2 => theta_amp = sqrt(2 rho_a) / (m_a(0) f_a)
  const maFaGeV2 = mA0GeV * fAGeV
  const thetaCosmicTodayAmp = Math.sqrt(Math.max(0, 2 * rhoATodayGeV4)) / maFaGeV2
  const thetaLocalHaloAmp = Math.sqrt(2 * RHO_DM_LOCAL_GEV4) / maFaGeV2
  const nedmLocalOscECm = NEDM_COEFF_E_CM * thetaLocalHaloAmp

  return {
    fAGeV,
    thetaInitialRad: thetaInit,
    tOscGeV: fine.osc.tOscGeV,
    gStarOsc: fine.osc.gStarOsc,
    xEnd: fine.xEnd,
    thetaAtXEnd: fine.thetaEnd,
    adiabaticInvariantJ: fine.jAdiabatic,
    rk4StepHalvingErrTheta,
    rk4StepHalvingErrJ,
    omegaAH2,
    thetaCosmicTodayAmp,
    thetaLocalHaloAmp,
    nedmLocalOscECm,
  }
}

// Fast deterministic bisection solver for the misalignment angle theta_i* giving exact Omega_a h^2 = 0.120
function solveMisalignmentAngleForTargetDm(fAGeV: number, targetOmegaH2: number): {
  readonly thetaStarRad: number
  readonly omegaH2AtStar: number
} {
  let lo = 1e-6
  let hi = Math.PI - 1e-4

  // Use lightweight 400 / 3500 steps during bisection, then confirm with full resolution
  const evalFast = (th: number): number => {
    const res = integrateAxionOscillator(fAGeV, th, 300, 3000)
    const mA0GeV = axionMassZeroGeV(fAGeV)
    const sOsc =
      ((2 * Math.PI * Math.PI) / 45) * res.osc.gStarSOsc * Math.pow(res.osc.tOscGeV, 3)
    const s0 = ((2 * Math.PI * Math.PI) / 45) * G_STAR_S_TODAY * Math.pow(T_CMB_GEV, 3)
    const yA = (res.osc.hOscGeV * fAGeV * fAGeV * res.jAdiabatic) / sOsc

    return (mA0GeV * yA * s0) / RHO_CRIT_OVER_H2_GEV4
  }

  for (let iter = 0; iter < 32; iter++) {
    const mid = 0.5 * (lo + hi)

    if (evalFast(mid) < targetOmegaH2) {
      lo = mid
    } else {
      hi = mid
    }
  }

  const thetaStarRad = 0.5 * (lo + hi)
  const full = runAxionCosmologyOde(fAGeV, thetaStarRad, false)

  return { thetaStarRad, omegaH2AtStar: full.omegaAH2 }
}

// ---------------------------------------------------------------------------------------------------------
// Part 2C: Pati-Salam Axion Benchmarks & Experimental Window Audit

export type AxionBenchmarkPoint = {
  readonly label: string
  readonly domainWallDivisor: number
  readonly fAGeV: number
  readonly mAUeV: number
  readonly frequencyGHz: number
  readonly absGAgammaGeVInv: number
  readonly safeAboveSn1987A: boolean
  readonly safeBelowOverclosure: boolean
  readonly inLiveHaloscopeWindow: boolean // 10..400 micro-eV
  readonly omegaAH2AtTheta1: number
  readonly omegaAH2AtRmsTheta: number // theta_i = pi / sqrt(3) = 1.8138 rad
  readonly thetaStarForPlanckDmRad: number // exact theta_i* giving Omega_a h^2 = 0.120
  readonly omegaAH2AtThetaStar: number
  readonly preInflationaryMaxHInfGeV: number // Planck 2018 CMB isocurvature bound
}

function buildAxionBenchmark(
  label: string,
  domainWallDivisor: number,
  fAGeV: number,
  cAgamma: number,
): AxionBenchmarkPoint {
  const mAUeV = (MA_FA_PREFACTOR_UEV_AT_1E12 * 1e12) / fAGeV
  const frequencyGHz = mAUeV * UEV_TO_GHZ
  const absGAgammaGeVInv = (ALPHA_EM_ZERO / (2 * Math.PI * fAGeV)) * Math.abs(cAgamma)
  const safeAboveSn1987A = fAGeV > SN1987A_MIN_FA_GEV
  const safeBelowOverclosure = fAGeV <= OVERCLOSURE_MAX_FA_GEV
  const inLiveHaloscopeWindow = mAUeV >= HALOSCOPE_MIN_MA_UEV && mAUeV <= HALOSCOPE_MAX_MA_UEV

  const runTheta1 = runAxionCosmologyOde(fAGeV, 1.0, false)
  const runThetaRms = runAxionCosmologyOde(fAGeV, Math.PI / Math.sqrt(3), false)
  const dmSolved = solveMisalignmentAngleForTargetDm(fAGeV, OMEGA_DM_H2_PLANCK)

  // Planck 2018 pre-inflationary CDM isocurvature bound at Omega_a = Omega_DM:
  //   H_inf < pi * f_a * theta_i* * sqrt(beta_iso * A_s / (1 - beta_iso))
  const isoFactor = Math.sqrt((PLANCK_BETA_ISO_MAX * PLANCK_AS) / (1 - PLANCK_BETA_ISO_MAX))
  const preInflationaryMaxHInfGeV = Math.PI * fAGeV * dmSolved.thetaStarRad * isoFactor

  return {
    label,
    domainWallDivisor,
    fAGeV,
    mAUeV,
    frequencyGHz,
    absGAgammaGeVInv,
    safeAboveSn1987A,
    safeBelowOverclosure,
    inLiveHaloscopeWindow,
    omegaAH2AtTheta1: runTheta1.omegaAH2,
    omegaAH2AtRmsTheta: runThetaRms.omegaAH2,
    thetaStarForPlanckDmRad: dmSolved.thetaStarRad,
    omegaAH2AtThetaStar: dmSolved.omegaH2AtStar,
    preInflationaryMaxHInfGeV,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Part 3: Negative Controls & Honest Gravitational PQ-Quality Audit

export type PqQualityDimensionRow = {
  readonly dimension: number
  readonly deltaThetaPlanckFull: number
  readonly deltaThetaPlanckReduced: number
  readonly safeAtFullPlanck: boolean
}

export type NegativeControlsAndBoundaryReport = {
  // Control 1: No PQ axion (bare SO(10) Z[zeta_9] quark phase violates nEDM by > 10^8x)
  readonly control1NoPqThetaRad: number
  readonly control1NoPqNedmECm: number
  readonly control1NoPqViolationFactor: number
  // Control 2: f_a = M_GUT (from E-FRC-0328) with theta_i = 1.0 overcloses universe severely
  readonly control2MGutGeV: number
  readonly control2MGutAxionMassUeV: number
  readonly control2MGutOmegaAH2AtTheta1: number
  readonly control2MGutOverclosureFactor: number
  readonly control2MGutRequiredThetaStarRad: number
  readonly control2FineTuningRatioVsMPs: number
  // Control 3: Wrong E/N = 0 (KSVZ-neutral) vs SO(10) E/N = 8/3 haloscope discriminator
  readonly control3Ksvz0ENExact: Rat
  readonly control3Ksvz0CAgamma: number
  readonly control3So10CAgamma: number
  readonly control3CouplingSeparationRatio: number // |C_KSVZ0 / C_SO10| = 2.5714x
  readonly control3HaloscopePowerRatio: number // ratio^2 = 6.612x
  readonly control3Ksvz0GAgammaAtMPsGeVInv: number
  readonly control3So10GAgammaAtMPsGeVInv: number
  // Honest open boundary: gravitational PQ quality problem (Planck-suppressed operators)
  readonly pqQualityTableAtVpqMPs: readonly PqQualityDimensionRow[]
  readonly pqQualityMinSafeDimAtMPsFullPl: number // d >= 12 for v_PQ = M_PS, c_d = 1
  readonly pqQualityMinSafeDimAtMPsOver3FullPl: number // d >= 11 for f_a = M_PS / 3
  readonly pqQualityProblemRemainsOpen: boolean
  readonly postInflationaryDomainWallProblemNote: boolean
}

function computePqQualityMinDim(vPqGeV: number, mPlanckGeV: number): {
  readonly rows: readonly PqQualityDimensionRow[]
  readonly minSafeDim: number
} {
  const chiTopGeV4 = Math.pow(CHI_TOP_NLO_QUARTER_MEV * 1e-3, 4)
  const vOverRoot2 = vPqGeV / Math.SQRT2
  const rows: PqQualityDimensionRow[] = []
  let minSafeDim = 99

  for (let d = 5; d <= 14; d++) {
    const dtFull = (2 * Math.pow(vOverRoot2, d)) / (chiTopGeV4 * Math.pow(mPlanckGeV, d - 4))
    const dtRed =
      (2 * Math.pow(vOverRoot2, d)) / (chiTopGeV4 * Math.pow(M_PLANCK_REDUCED_GEV, d - 4))
    const safeAtFullPlanck = dtFull < THETA_BAR_EXP_LIMIT

    if (safeAtFullPlanck && minSafeDim === 99) {
      minSafeDim = d
    }

    rows.push({
      dimension: d,
      deltaThetaPlanckFull: dtFull,
      deltaThetaPlanckReduced: dtRed,
      safeAtFullPlanck,
    })
  }

  return { rows, minSafeDim }
}

// ---------------------------------------------------------------------------------------------------------
// Top-level E-FRC-0331 report

export type StrongCpAxionAndPqWindowReport = {
  // Upstream E-FRC-0328 Pati-Salam and GUT scales (zero hardcoded values)
  readonly eFrc0328MPsGeV: number
  readonly eFrc0328MGutGeV: number
  readonly eFrc0328Log10MPsGeV: number
  readonly eFrc0328Log10MGutGeV: number
  // Part 1: Exact BigInt SO(10) Peccei-Quinn anomaly certification & Z[zeta_9] strong-CP audit
  readonly pqAnomaly: PqAnomalyCertificate
  readonly strongCpTension: StrongCpTensionAudit
  // Part 2: Chiral potential, live RK4 dynamical relaxation, and Pati-Salam axion benchmarks
  readonly chiralPotential: ChiralAxionPotentialReport
  readonly harmonicBesselAnalyticJCoeff: number // (3 * 2^{4/3} / pi) * Gamma(13/12)^2 = 2.2111
  readonly harmonicOdeNumericJCoeff: number // Live RK4 check at theta_i = 1e-3
  readonly harmonicAnalyticVsOdeRelErr: number
  readonly relaxationRuns: readonly AxionOdeRunResult[]
  readonly relaxationMaxStepHalvingErrTheta: number
  readonly relaxationMaxStepHalvingErrJ: number
  readonly relaxationMaxCosmicThetaToday: number
  readonly relaxationMaxLocalHaloThetaToday: number
  readonly benchmarkFaAtMPs: AxionBenchmarkPoint
  readonly benchmarkFaAtMPsOver3: AxionBenchmarkPoint
  readonly benchmarkFaAtMPsOver6: AxionBenchmarkPoint
  readonly allThreeBenchmarksInWindowAndSafe: boolean
  // Part 3: Negative controls & honest PQ quality open boundary
  readonly controlsAndBoundary: NegativeControlsAndBoundaryReport
}

export function analyzeStrongCpAxionAndPqWindow(): StrongCpAxionAndPqWindowReport {
  // Reuse verified E-FRC-0324 Spin(10) states and E-FRC-0328 2-loop SO(10) -> Pati-Salam scales
  const so10 = analyzeSo10ThreeGenerations(20)
  const ps = analyzePatiSalamUnificationHierarchy()
  const mPsGeV = ps.primary.mPsGeV
  const mGutGeV = ps.primary.mGutGeV

  // Part 1A: Exact BigInt PQ charges, Yukawa invariance, and E/N = 8/3 certification
  const pqAnomaly = certifySo10PecceiQuinnAnomalies(
    so10.spin10.states,
    so10.weinberg.sin2ThetaWGutExact,
  )

  // Part 1B: Z[zeta_9] strong-CP tension audit from E-FRC-0327 quark matrices
  const strongCpTension = auditZeta9StrongCpTension()

  // Part 2A: Exact 2-flavor chiral QCD axion potential & global minimum at theta_bar = 0
  const chiralPotential = analyzeChiralAxionPotential(strongCpTension.thetaYukawaSo10FullRad)

  // Part 2B: Cross-check live RK4 ODE against exact Bessel harmonic invariant J / theta_i^2
  // Lanczos / exact Gamma(13/12) = 0.9585826842140632 (computed deterministically via Lanczos!)
  const gamma13Over12 = lanczosGamma(13 / 12)
  const harmonicBesselAnalyticJCoeff =
    ((3 * Math.pow(2, 4 / 3)) / Math.PI) * gamma13Over12 * gamma13Over12
  const harmonicRun = runAxionCosmologyOde(mPsGeV, 1e-3, true)
  const harmonicOdeNumericJCoeff = harmonicRun.adiabaticInvariantJ / (1e-3 * 1e-3)
  const harmonicAnalyticVsOdeRelErr =
    Math.abs(harmonicOdeNumericJCoeff - harmonicBesselAnalyticJCoeff) / harmonicBesselAnalyticJCoeff

  // Live cosmological relaxation ODE from 4 distinct O(1) bare initial angles including theta_Yukawa
  const initialAngles = [
    strongCpTension.thetaYukawaSo10FullRad,
    -2.5,
    1.0,
    2.8,
  ]
  const relaxationRuns = initialAngles.map(th => runAxionCosmologyOde(mPsGeV, th, true))
  const relaxationMaxStepHalvingErrTheta = Math.max(
    harmonicRun.rk4StepHalvingErrTheta,
    ...relaxationRuns.map(r => r.rk4StepHalvingErrTheta),
  )
  const relaxationMaxStepHalvingErrJ = Math.max(
    harmonicRun.rk4StepHalvingErrJ,
    ...relaxationRuns.map(r => r.rk4StepHalvingErrJ),
  )
  const relaxationMaxCosmicThetaToday = Math.max(...relaxationRuns.map(r => r.thetaCosmicTodayAmp))
  const relaxationMaxLocalHaloThetaToday = Math.max(...relaxationRuns.map(r => r.thetaLocalHaloAmp))

  // Part 2C: Live Pati-Salam axion benchmarks f_a in {M_PS, M_PS/3, M_PS/6}
  const benchmarkFaAtMPs = buildAxionBenchmark('f_a = M_PS', 1, mPsGeV, pqAnomaly.cAgammaSo10)
  const benchmarkFaAtMPsOver3 = buildAxionBenchmark(
    'f_a = M_PS / 3 (minimal Z_2-quotiented N_DW = 3)',
    3,
    mPsGeV / 3,
    pqAnomaly.cAgammaSo10,
  )
  const benchmarkFaAtMPsOver6 = buildAxionBenchmark(
    'f_a = M_PS / 6 (unquotiented N_DW = 6)',
    6,
    mPsGeV / 6,
    pqAnomaly.cAgammaSo10,
  )
  const allThreeBenchmarksInWindowAndSafe = [
    benchmarkFaAtMPs,
    benchmarkFaAtMPsOver3,
    benchmarkFaAtMPsOver6,
  ].every(b => b.safeAboveSn1987A && b.safeBelowOverclosure && b.inLiveHaloscopeWindow)

  // Part 3: Three negative controls & gravitational PQ-quality audit
  const gutRunTheta1 = runAxionCosmologyOde(mGutGeV, 1.0, false)
  const gutDmSolved = solveMisalignmentAngleForTargetDm(mGutGeV, OMEGA_DM_H2_PLANCK)
  const control2MGutAxionMassUeV = (MA_FA_PREFACTOR_UEV_AT_1E12 * 1e12) / mGutGeV

  const control3Ksvz0ENExact = rat(0n)
  const control3Ksvz0CAgamma = ratToNumber(control3Ksvz0ENExact) - C_AGAMMA_CHPT_MODEL_INDEP
  const control3So10CAgamma = pqAnomaly.cAgammaSo10
  const control3CouplingSeparationRatio =
    Math.abs(control3Ksvz0CAgamma) / Math.abs(control3So10CAgamma)
  const control3HaloscopePowerRatio = control3CouplingSeparationRatio ** 2
  const control3Ksvz0GAgammaAtMPsGeVInv =
    (ALPHA_EM_ZERO / (2 * Math.PI * mPsGeV)) * Math.abs(control3Ksvz0CAgamma)
  const control3So10GAgammaAtMPsGeVInv = benchmarkFaAtMPs.absGAgammaGeVInv

  const pqQualMPs = computePqQualityMinDim(mPsGeV, M_PLANCK_GEV)
  const pqQualMPsOver3 = computePqQualityMinDim(mPsGeV / 3, M_PLANCK_GEV)

  const controlsAndBoundary: NegativeControlsAndBoundaryReport = {
    control1NoPqThetaRad: strongCpTension.thetaYukawaSo10FullRad,
    control1NoPqNedmECm: strongCpTension.nedmWithoutPqFullECm,
    control1NoPqViolationFactor: strongCpTension.nedmViolationFactorFull,
    control2MGutGeV: mGutGeV,
    control2MGutAxionMassUeV,
    control2MGutOmegaAH2AtTheta1: gutRunTheta1.omegaAH2,
    control2MGutOverclosureFactor: gutRunTheta1.omegaAH2 / OMEGA_DM_H2_PLANCK,
    control2MGutRequiredThetaStarRad: gutDmSolved.thetaStarRad,
    control2FineTuningRatioVsMPs:
      benchmarkFaAtMPs.thetaStarForPlanckDmRad / gutDmSolved.thetaStarRad,
    control3Ksvz0ENExact,
    control3Ksvz0CAgamma,
    control3So10CAgamma,
    control3CouplingSeparationRatio,
    control3HaloscopePowerRatio,
    control3Ksvz0GAgammaAtMPsGeVInv,
    control3So10GAgammaAtMPsGeVInv,
    pqQualityTableAtVpqMPs: pqQualMPs.rows,
    pqQualityMinSafeDimAtMPsFullPl: pqQualMPs.minSafeDim,
    pqQualityMinSafeDimAtMPsOver3FullPl: pqQualMPsOver3.minSafeDim,
    pqQualityProblemRemainsOpen: true,
    postInflationaryDomainWallProblemNote: pqAnomaly.domainWallNumberMinimalZ2Quotient > 1,
  }

  return {
    eFrc0328MPsGeV: mPsGeV,
    eFrc0328MGutGeV: mGutGeV,
    eFrc0328Log10MPsGeV: ps.primary.log10MPsGeV,
    eFrc0328Log10MGutGeV: ps.primary.log10MGutGeV,
    pqAnomaly,
    strongCpTension,
    chiralPotential,
    harmonicBesselAnalyticJCoeff,
    harmonicOdeNumericJCoeff,
    harmonicAnalyticVsOdeRelErr,
    relaxationRuns,
    relaxationMaxStepHalvingErrTheta,
    relaxationMaxStepHalvingErrJ,
    relaxationMaxCosmicThetaToday,
    relaxationMaxLocalHaloThetaToday,
    benchmarkFaAtMPs,
    benchmarkFaAtMPsOver3,
    benchmarkFaAtMPsOver6,
    allThreeBenchmarksInWindowAndSafe,
    controlsAndBoundary,
  }
}

// Standard 9-coefficient Lanczos approximation for Gamma(z), exact to < 1e-14 for Re(z) > 0.5
function lanczosGamma(z: number): number {
  const g = 7
  const p = [
    0.9999999999998099,
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9.984369578019572e-6,
    1.5056327351493116e-7,
  ]
  const zm = z - 1
  let x = p[0]!

  for (let i = 1; i < p.length; i++) {
    x += p[i]! / (zm + i)
  }

  const t = zm + g + 0.5

  return Math.sqrt(2 * Math.PI) * Math.pow(t, zm + 0.5) * Math.exp(-t) * x
}

export { rat, ratEq, ratFormat, ratToNumber }
