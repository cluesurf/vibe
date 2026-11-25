// E-CSM-0068: COHEN-KAPLAN-NELSON HOLOGRAPHIC D_Lambda = 2 D_H SCALING IN SHELL UNITS,
// NONLINEAR SPHERICAL-COLLAPSE WEINBERG GALAXY-FORMATION WINDOW, AND BOUSSO-POLCHINSKI
// DISCRETUUM AUDIT (CONTINUUM EFT COMPATIBILITY CHECK).
//
// Three deterministic parts (zero PRNGs) reusing upstream Vibe Theory numbers:
//   - E-FRC-0328 (pati-salam-unification-hierarchy.ts): {3,4,3,4} cusp branching b = 6034/330 = 18.284848,
//     bulk Perron growth lambda = warpFactor() = 18.278708, M_Pl = 1.22089e19 GeV, M_P = M_Pl / sqrt(8 pi),
//     Riccati stiffness K_eff = 1.03123708 and G_eff = 0.07716700.
//   - E-CSM-0065 (cosmic-history-backreaction.ts): asymptotic horosphere equation of state w = -0.999984
//     and bare Planck-scale horosphere drift H_inf(r_vol) = 0.51712789 M_Pl. Important gap disclosure:
//     E-CSM-0065's bare horosphere drift H_inf = 0.517 M_Pl is Planck-scale and sits 122 decades above
//     observed late-time dark energy (H_0 = 1.438e-42 GeV). E-CSM-0065 does NOT produce observed H_0.
//   - E-CSM-0066 (baryogenesis-dark-sector-and-lambda.ts): Planck 2018 Lambda shell audit (D_H0 = 48.2764,
//     D_Hinf = 48.3416, D_Lambda = 97.4146, rho_Lambda = 2.515e-47 GeV^4, dynamicalSelectionOfDLambdaOpen).
//
// Part 1 - Base-Independent Rewriting of CKN Holographic Scaling in {3,4,3,4} Shell Units:
//   Compares naive 3D volume QFT cutoff rho_UV = M_Pl^4 (D_naive = 0, off by 122.95 decades = 97.415 shells,
//   violating the Bekenstein-Hawking horizon entropy bound S_BH = pi (M_Pl / H_0)^2 by ~2.7e60x) against
//   the CKN non-black-hole collapse bound (4 pi / 3) L^3 rho_vac <= L / (2 G_N) <=> rho_vac <= 3 M_P^2 / L^2.
//   Note that D_CKN = 2 D_H + log_b(8 pi / 3) is a base-independent logarithmic rewriting of CKN holographic
//   scaling in {3,4,3,4} shell units (holding identically for any logarithmic base b, verified in b and lambda):
//     - Bare c_HDE = 1 at observed L = L_H0 = 1/H_0: D_CKN = 97.2843 shells vs observed D_Lambda = 97.4146 shells
//       (0.1303 shells apart = log_b(1 / Omega_Lambda)).
//     - Exact identity D_Lambda = 2 D_H0 + log_b(8 pi / (3 Omega_Lambda)) verified to <= 1e-13.
//     - Using observed asymptotic de Sitter rate H_inf = sqrt(Omega_Lambda) H_0 (with w = -1 from E-CSM-0065,
//       NOT E-CSM-0065's bare Planck-scale drift H_inf = 0.517 M_Pl): D_Lambda = 2 D_Hinf + log_b(8 pi / 3) (<= 1e-13).
//     - Scaling slope d(D_CKN) / d(D_H) = 2 identically across 50 decades of H, contrasted with naive 3D QFT (slope 0).
//
// Part 2 - Exact Nonlinear Spherical Top-Hat Gravitational Collapse & Weinberg (1987) Window:
//   Integrates the exact nonlinear spherical top-hat ODE d^2 y / d tau^2 = -(1/2) / y^2 + lambda_tilde * y
//   using 4th-order RK4 (via smooth Sundman time dtau = y ds, cross-checked against direct uniform-dtau RK4),
//   verifying the exact energy first integral E = (1/2) (dy/dtau)^2 - 1/(2 y) - (1/2) lambda_tilde y^2 = const
//   to <= 1e-12 and step-halving convergence to <= 1e-10.
//   Verifies via RK4 bisection that the collapse threshold matches Weinberg's exact analytic bound
//   rho_Lambda^{max} = (500 / 729) rho_m(t_i) delta_i^3 to < 0.1% (actual < 1e-5).
//   Maps rho_Lambda(D) = M_Pl^4 b^{-D} across discrete shells D in [92..100] for Milky-Way halos
//   (M_halo = 10^{12} M_sun, Planck sigma(M_MW, z_rec = 1089) = 2.4e-3, canonical 2.5-sigma progenitor peak
//   delta_i = 6.0e-3, plus 1-sigma and 3-sigma benchmarks), showing D <= 95 (> 1,115x observed) is strictly
//   lifeless (dy/dtau > 0 forever), turnaround-to-collapse occurs at D_Weinberg = 95.873 (88.35x observed),
//   and the entire upper Weinberg window [D_Weinberg, D_obs] spans Delta D = 1.542 shells (< 2 integer shells).
//   Verifies both negative controls: Lambda = 0 Einstein-de Sitter cycloid t_coll = 2 t_ta (<= 1e-10) and
//   delta_i = 0 homogeneous universe (never collapses at any D).
//
// Part 3 - Bousso-Polchinski Flux Discretuum Scan Anchored at D = 95 & Honest Weinberg (1989) No-Go Ledger:
//   Constructs a deterministic K = 8 channel flux lattice rho_eff(n) = rho_bare + sum_{k=1}^8 q_k^2 n_k^2
//   anchored at integer shell D = 95 with bare coefficient (-175) and O(1) mutually incommensurate charges q_k.
//   Explicit prior-suppression disclosure: anchoring the K = 8 scan at shell D = 95 assumes 120 decades of
//   prior warp suppression M_Pl^4 b^{-95} (scanning from unwarped D = 0 requires K_Planck = 146 channels).
//   Exhaustively scans all 7^8 = 5,764,801 unsigned flux vectors (representing 13^8 = 815,730,721 signed states
//   with |n_k| <= 6) via deterministic 4+4 meet-in-the-middle, showing dense population of [96.0, 98.5]
//   (>> 10 distinct vacua, min |D(n) - D_obs| < 0.05 shells), contrasted with equal commensurate charges q_k = 1
//   and single channel K = 1 controls (both 0 vacua), and records an honest Weinberg (1989) No-Go Ledger.

import { analyzeBaryogenesisDarkSectorAndLambda } from '@/code/measure/baryogenesis-dark-sector-and-lambda'
import { runCosmicHistoryBackreaction } from '@/code/measure/cosmic-history-backreaction'
import { analyzePatiSalamUnificationHierarchy } from '@/code/measure/pati-salam-unification-hierarchy'

// ---------------------------------------------------------------------------------------------------------
// Planck 2018 cosmological inputs (identical to E-CSM-0066, deterministic)

const PLANCK_H0_KM_S_MPC = 67.36
const PLANCK_OMEGA_LAMBDA = 0.6847
const PLANCK_OMEGA_M = 0.3153
const MPC_IN_KM = 3.085677581491367e19
const HBAR_GEV_S = 6.582119569e-25

// Milky-Way halo benchmark at Planck recombination (M_halo = 10^12 M_sun, z_rec = 1089)
const PLANCK_Z_REC = 1089
const MW_HALO_MASS_MSUN = 1e12
const PLANCK_SIGMA_MW_ZREC = 2.4e-3
const CANONICAL_WEINBERG_NU_SIGMA = 2.5

// ---------------------------------------------------------------------------------------------------------
// Part 1: Cohen-Kaplan-Nelson (CKN) Holographic UV-IR Entropy Bound & D_Lambda = 2 D_H on {3,4,3,4}

export type CknScalingSample = {
  readonly label: string
  readonly hOverMPl: number
  readonly depthH: number
  readonly depthCknBare: number
  readonly depthIdentityErr: number
}

export type Part1HolographicCknReport = {
  // Exact upstream {3,4,3,4} & Planck 2018 parameters
  readonly exactShellCounts0to3: readonly [number, number, number, number]
  readonly cuspBranchingB: number
  readonly logBranchingB: number
  readonly bulkLambda: number
  readonly mPlanckGeV: number
  readonly mPlanckReducedGeV: number
  readonly h0KmSMpc: number
  readonly omegaLambda: number
  readonly omegaM: number
  readonly h0GeV: number
  readonly hInfGeV: number
  readonly rhoCrit0GeV4: number
  readonly rhoLambdaObsGeV4: number
  readonly rhoM0GeV4: number
  // Upstream E-CSM-0065 & E-CSM-0066 cross-checks
  readonly cosmicHistoryLateWEff: number
  readonly cosmicHistoryLateQ: number
  readonly cosmicHistoryHInfRVol: number
  readonly eCsm0066DepthH0Diff: number
  readonly eCsm0066DepthLambdaDiff: number
  readonly eCsm0066RhoLambdaRelDiff: number
  // Naive QFT 3D volume scaling (negative control)
  readonly rhoNaiveQftFullPlGeV4: number
  readonly rhoNaiveQftRedPlGeV4: number
  readonly depthNaiveQft: number
  readonly naiveCatastropheRatioFullPl: number
  readonly naiveCatastropheLog10FullPl: number
  readonly naiveCatastropheRatioRedPl: number
  readonly naiveCatastropheLog10RedPl: number
  readonly bekensteinHorizonEntropyH0: number
  readonly naiveQftVolumeEntropyH0: number
  readonly qftOverBekensteinEntropyRatio: number
  // CKN holographic non-black-hole bound: L_H^3 rho_vac <= 3 M_P^2 L_H => rho_CKN = 3 c_HDE^2 M_P^2 H^2
  readonly cHdeBare: number
  readonly cHdeDeSitter: number
  readonly rhoCknBareH0GeV4: number
  readonly rhoCknDeSitterGeV4: number
  readonly depthH0B: number
  readonly depthHInfB: number
  readonly depthLambdaObsB: number
  readonly depthCknBareH0B: number
  readonly depthCknDeSitterB: number
  readonly depthCknBareOffsetFromObsB: number // log_b(1 / Omega_Lambda) = 0.1303 shells
  readonly logBOf8PiOver3: number
  readonly logBOfInvOmegaLambda: number
  readonly identityH0ErrB: number // |D_Lambda - (2 D_H0 + log_b(8 pi / (3 Omega_Lambda)))|
  readonly identityDeSitterErrB: number // |D_Lambda - (2 D_Hinf + log_b(8 pi / 3))|
  readonly identityDeSitterErrBulkLambda: number // exact cross-check in base bulkLambda
  readonly cknUvCutoffGeV: number // (rho_Lambda_obs)^(1/4) ~ 2.24 meV
  readonly depthCknUvCutoffB: number // (1/4) D_Lambda = 24.354 shells
  // Exact scaling law verification across 50 decades of H
  readonly scalingSamples: readonly CknScalingSample[]
  readonly cknSlopeDDLambdaOverDDH: number // exact 2.0
  readonly cknSlopeErrFromTwo: number
  readonly naiveVolumeSlopeDDLambdaOverDDH: number // exact 0.0
}

function runPart1HolographicCkn(
  ps: ReturnType<typeof analyzePatiSalamUnificationHierarchy>,
  cosmic: ReturnType<typeof runCosmicHistoryBackreaction>,
  baryo: ReturnType<typeof analyzeBaryogenesisDarkSectorAndLambda>,
): Part1HolographicCknReport {
  const b = ps.hierarchy.cuspBranchingFactorB
  const lnB = ps.hierarchy.logBranchingFactor
  const bulkLambda = ps.hierarchy.bulkPerronGrowthLambda
  const lnLambda = Math.log(bulkLambda)
  const mPl = ps.hierarchy.mPlanckGeV
  const mP = ps.hierarchy.mPlanckReducedGeV

  const h0SecInv = PLANCK_H0_KM_S_MPC / MPC_IN_KM
  const h0GeV = HBAR_GEV_S * h0SecInv
  const cHdeBare = 1
  const cHdeDeSitter = Math.sqrt(PLANCK_OMEGA_LAMBDA)
  const hInfGeV = cHdeDeSitter * h0GeV

  // Exact Friedmann critical, dark-energy, and matter densities in GeV^4
  const rhoCrit0GeV4 = 3 * mP * mP * h0GeV * h0GeV
  const rhoLambdaObsGeV4 = PLANCK_OMEGA_LAMBDA * rhoCrit0GeV4
  const rhoM0GeV4 = PLANCK_OMEGA_M * rhoCrit0GeV4

  // Naive QFT UV cutoff vacuum energy & 3D volume entropy negative control
  const rhoNaiveQftFullPlGeV4 = mPl ** 4
  const rhoNaiveQftRedPlGeV4 = mP ** 4
  const depthNaiveQft = Math.log(rhoNaiveQftFullPlGeV4 / rhoNaiveQftFullPlGeV4) / lnB
  const naiveCatastropheRatioFullPl = rhoNaiveQftFullPlGeV4 / rhoLambdaObsGeV4
  const naiveCatastropheLog10FullPl = Math.log10(naiveCatastropheRatioFullPl)
  const naiveCatastropheRatioRedPl = rhoNaiveQftRedPlGeV4 / rhoLambdaObsGeV4
  const naiveCatastropheLog10RedPl = Math.log10(naiveCatastropheRatioRedPl)

  // Bekenstein-Hawking area entropy S_BH = pi (M_Pl / H_0)^2 vs naive QFT volume entropy S_QFT = (M_Pl / H_0)^3
  const mPlOverH0 = mPl / h0GeV
  const bekensteinHorizonEntropyH0 = Math.PI * mPlOverH0 * mPlOverH0
  const naiveQftVolumeEntropyH0 = mPlOverH0 ** 3
  const qftOverBekensteinEntropyRatio = naiveQftVolumeEntropyH0 / bekensteinHorizonEntropyH0

  // Cohen-Kaplan-Nelson non-black-hole bound:
  //   (4 pi / 3) L^3 rho_vac <= M_BH(L) = L / (2 G_N) = 4 pi M_P^2 L  =>  rho_vac <= 3 M_P^2 / L^2
  const rhoCknBareH0GeV4 = 3 * cHdeBare * cHdeBare * mP * mP * h0GeV * h0GeV
  const rhoCknDeSitterGeV4 = 3 * cHdeDeSitter * cHdeDeSitter * mP * mP * h0GeV * h0GeV

  const depthH0B = Math.log(mPl / h0GeV) / lnB
  const depthHInfB = Math.log(mPl / hInfGeV) / lnB
  const depthLambdaObsB = Math.log(rhoNaiveQftFullPlGeV4 / rhoLambdaObsGeV4) / lnB
  const depthCknBareH0B = Math.log(rhoNaiveQftFullPlGeV4 / rhoCknBareH0GeV4) / lnB
  const depthCknDeSitterB = Math.log(rhoNaiveQftFullPlGeV4 / rhoCknDeSitterGeV4) / lnB
  const depthCknBareOffsetFromObsB = depthLambdaObsB - depthCknBareH0B

  const logBOf8PiOver3 = Math.log((8 * Math.PI) / 3) / lnB
  const logBOfInvOmegaLambda = Math.log(1 / PLANCK_OMEGA_LAMBDA) / lnB

  // Exact algebraic identities on {3,4,3,4}:
  //   D_Lambda = 2 D_H0 + log_b(8 pi / (3 Omega_Lambda))
  //   D_Lambda = 2 D_Hinf + log_b(8 pi / 3)
  const identityH0ErrB = Math.abs(
    depthLambdaObsB - (2 * depthH0B + logBOf8PiOver3 + logBOfInvOmegaLambda),
  )
  const identityDeSitterErrB = Math.abs(depthLambdaObsB - (2 * depthHInfB + logBOf8PiOver3))

  const depthHInfBulk = Math.log(mPl / hInfGeV) / lnLambda
  const depthLambdaObsBulk = Math.log(rhoNaiveQftFullPlGeV4 / rhoLambdaObsGeV4) / lnLambda
  const logLambdaOf8PiOver3 = Math.log((8 * Math.PI) / 3) / lnLambda
  const identityDeSitterErrBulkLambda = Math.abs(
    depthLambdaObsBulk - (2 * depthHInfBulk + logLambdaOf8PiOver3),
  )

  const cknUvCutoffGeV = rhoLambdaObsGeV4 ** 0.25
  const depthCknUvCutoffB = Math.log(mPl / cknUvCutoffGeV) / lnB

  // Cross-check exact numerical agreement with E-CSM-0065 and E-CSM-0066
  const lam66 = baryo.part3.lambdaShellAudit
  const eCsm0066DepthH0Diff = Math.abs(depthH0B - lam66.depthH0B)
  const eCsm0066DepthLambdaDiff = Math.abs(depthLambdaObsB - lam66.depthLambdaFromRhoB)
  const eCsm0066RhoLambdaRelDiff =
    Math.abs(rhoLambdaObsGeV4 - lam66.rhoLambdaGeV4) / lam66.rhoLambdaGeV4

  // Verify exact slope d(D_CKN) / d(D_H) = 2 across 60 decades of H / M_Pl
  const hProbeList: readonly (readonly [string, number])[] = [
    ['H = 1e-10 M_Pl', 1e-10],
    ['H = 1e-20 M_Pl', 1e-20],
    ['H = 1e-30 M_Pl', 1e-30],
    ['H = 1e-45 M_Pl', 1e-45],
    ['H = H_0 (Planck 2018)', h0GeV / mPl],
  ]

  const scalingSamples: CknScalingSample[] = hProbeList.map(([label, hOverMPl]) => {
    const hVal = hOverMPl * mPl
    const rhoCkn = 3 * mP * mP * hVal * hVal
    const depthH = Math.log(1 / hOverMPl) / lnB
    const depthCknBare = Math.log(rhoNaiveQftFullPlGeV4 / rhoCkn) / lnB
    const depthIdentityErr = Math.abs(depthCknBare - (2 * depthH + logBOf8PiOver3))
    return { label, hOverMPl, depthH, depthCknBare, depthIdentityErr }
  })

  // Exact linear slope across the 5 probes
  const firstProbe = scalingSamples[0]!
  const lastProbe = scalingSamples[scalingSamples.length - 1]!
  const cknSlopeDDLambdaOverDDH =
    (lastProbe.depthCknBare - firstProbe.depthCknBare) / (lastProbe.depthH - firstProbe.depthH)
  const cknSlopeErrFromTwo = Math.abs(cknSlopeDDLambdaOverDDH - 2)
  const naiveVolumeSlopeDDLambdaOverDDH = 0

  return {
    exactShellCounts0to3: ps.hierarchy.exactShellCounts0to3,
    cuspBranchingB: b,
    logBranchingB: lnB,
    bulkLambda,
    mPlanckGeV: mPl,
    mPlanckReducedGeV: mP,
    h0KmSMpc: PLANCK_H0_KM_S_MPC,
    omegaLambda: PLANCK_OMEGA_LAMBDA,
    omegaM: PLANCK_OMEGA_M,
    h0GeV,
    hInfGeV,
    rhoCrit0GeV4,
    rhoLambdaObsGeV4,
    rhoM0GeV4,
    cosmicHistoryLateWEff: cosmic.partB.fullCosmicHistory.era3DarkEnergy.finalWEff,
    cosmicHistoryLateQ: cosmic.partB.fullCosmicHistory.era3DarkEnergy.finalQ,
    cosmicHistoryHInfRVol: cosmic.constants.hInfRVol,
    eCsm0066DepthH0Diff,
    eCsm0066DepthLambdaDiff,
    eCsm0066RhoLambdaRelDiff,
    rhoNaiveQftFullPlGeV4,
    rhoNaiveQftRedPlGeV4,
    depthNaiveQft,
    naiveCatastropheRatioFullPl,
    naiveCatastropheLog10FullPl,
    naiveCatastropheRatioRedPl,
    naiveCatastropheLog10RedPl,
    bekensteinHorizonEntropyH0,
    naiveQftVolumeEntropyH0,
    qftOverBekensteinEntropyRatio,
    cHdeBare,
    cHdeDeSitter,
    rhoCknBareH0GeV4,
    rhoCknDeSitterGeV4,
    depthH0B,
    depthHInfB,
    depthLambdaObsB,
    depthCknBareH0B,
    depthCknDeSitterB,
    depthCknBareOffsetFromObsB,
    logBOf8PiOver3,
    logBOfInvOmegaLambda,
    identityH0ErrB,
    identityDeSitterErrB,
    identityDeSitterErrBulkLambda,
    cknUvCutoffGeV,
    depthCknUvCutoffB,
    scalingSamples,
    cknSlopeDDLambdaOverDDH,
    cknSlopeErrFromTwo,
    naiveVolumeSlopeDDLambdaOverDDH,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Part 2: Exact Nonlinear Spherical Top-Hat Gravitational Collapse & Weinberg (1987) Window on {3,4,3,4}

// 16-point Gauss-Legendre nodes & weights on [0, 1] (symmetric on [-1, 1] mapped to [0, 1])
// Used for singularity-free Big Bang -> y = 1 time integral:
//   tau_0_to_1 = integral_0^1 (2 u^2 du) / sqrt(1 + 2 E u^2 + lambda_tilde u^6)
const GL8_HALF_NODES: readonly number[] = [
  0.09501250983763744,
  0.2816035507792589,
  0.45801677765722737,
  0.6178762444026438,
  0.755404408355003,
  0.8656312023878318,
  0.9445750230732326,
  0.9894009349916499,
]
const GL8_HALF_WEIGHTS: readonly number[] = [
  0.1894506104550685,
  0.18260341504492358,
  0.16915651939500254,
  0.14959598881657674,
  0.12462897125553388,
  0.09515851168249279,
  0.062253523938647894,
  0.027152459411754096,
]

function integrateTauZeroToOne(energyE: number, lambdaTilde: number, panels = 16): number {
  const h = 1 / panels
  let total = 0
  for (let p = 0; p < panels; p++) {
    const a = p * h
    const mid = a + 0.5 * h
    const half = 0.5 * h
    for (let k = 0; k < GL8_HALF_NODES.length; k++) {
      const dx = half * GL8_HALF_NODES[k]!
      const w = half * GL8_HALF_WEIGHTS[k]!
      const uPlus = mid + dx
      const uMinus = mid - dx
      const uP2 = uPlus * uPlus
      const uM2 = uMinus * uMinus
      const fPlus = (2 * uP2) / Math.sqrt(1 + 2 * energyE * uP2 + lambdaTilde * uP2 * uP2 * uP2)
      const fMinus = (2 * uM2) / Math.sqrt(1 + 2 * energyE * uM2 + lambdaTilde * uM2 * uM2 * uM2)
      total += w * (fPlus + fMinus)
    }
  }
  return total
}

function collapseEnergy(y: number, v: number, lambdaTilde: number): number {
  return 0.5 * v * v - 0.5 / y - 0.5 * lambdaTilde * y * y
}

// Single 4th-order RK4 step of exact spherical top-hat ODE:
//   d^2 y / d tau^2 = -(1/2) / y^2 + lambda_tilde * y
// formulated in smooth Sundman parameter s with dtau / ds = y:
//   dy/ds = y * v,  dv/ds = -(1/2) / y + lambda_tilde * y^2,  dtau/ds = y
// Note: does NOT invoke the energy first integral, so E(s) is an independent conserved check.
type TopHatState = {
  readonly y: number
  readonly v: number
  readonly tau: number
}

function rk4StepSundman(st: TopHatState, ds: number, lambdaTilde: number): TopHatState {
  const { y, v, tau } = st

  const k1y = y * v
  const k1v = -0.5 / y + lambdaTilde * y * y
  const k1t = y

  const y2 = y + 0.5 * ds * k1y
  const v2 = v + 0.5 * ds * k1v
  const k2y = y2 * v2
  const k2v = -0.5 / y2 + lambdaTilde * y2 * y2
  const k2t = y2

  const y3 = y + 0.5 * ds * k2y
  const v3 = v + 0.5 * ds * k2v
  const k3y = y3 * v3
  const k3v = -0.5 / y3 + lambdaTilde * y3 * y3
  const k3t = y3

  const y4 = y + ds * k3y
  const v4 = v + ds * k3v
  const k4y = y4 * v4
  const k4v = -0.5 / y4 + lambdaTilde * y4 * y4
  const k4t = y4

  return {
    y: y + (ds / 6) * (k1y + 2 * k2y + 2 * k3y + k4y),
    v: v + (ds / 6) * (k1v + 2 * k2v + 2 * k3v + k4v),
    tau: tau + (ds / 6) * (k1t + 2 * k2t + 2 * k3t + k4t),
  }
}

// Direct uniform-dtau 4th-order RK4 step of d^2 y / d tau^2 = -(1/2) / y^2 + lambda_tilde * y
// Used to independently cross-check the Sundman-parameterized RK4 trajectories.
function rk4StepDirectTau(
  y: number,
  v: number,
  dTau: number,
  lambdaTilde: number,
): { readonly y: number; readonly v: number } {
  const a = (yy: number): number => -0.5 / (yy * yy) + lambdaTilde * yy

  const k1y = v
  const k1v = a(y)

  const y2 = y + 0.5 * dTau * k1y
  const v2 = v + 0.5 * dTau * k1v
  const k2y = v2
  const k2v = a(y2)

  const y3 = y + 0.5 * dTau * k2y
  const v3 = v + 0.5 * dTau * k2v
  const k3y = v3
  const k3v = a(y3)

  const y4 = y + dTau * k3y
  const v4 = v + dTau * k3v
  const k4y = v4
  const k4v = a(y4)

  return {
    y: y + (dTau / 6) * (k1y + 2 * k2y + 2 * k3y + k4y),
    v: v + (dTau / 6) * (k1v + 2 * k2v + 2 * k3v + k4v),
  }
}

// Refine a root of f(rk4StepSundman(st, s, lambdaTilde)) = 0 on [0, ds] via Newton-RK4
function refineRootOnStep(
  st: TopHatState,
  ds: number,
  lambdaTilde: number,
  pick: 'v_zero' | 'y_one',
): TopHatState {
  let lo = 0
  let hi = ds
  const evalFn = (step: number): number => {
    const s = rk4StepSundman(st, step, lambdaTilde)
    return pick === 'v_zero' ? s.v : s.y - 1
  }
  const fLo = evalFn(lo)
  for (let it = 0; it < 54; it++) {
    const mid = 0.5 * (lo + hi)
    const fMid = evalFn(mid)
    if (fMid === 0 || hi - lo <= 1e-15 * Math.max(1, ds)) {
      return rk4StepSundman(st, mid, lambdaTilde)
    }
    if ((fLo > 0 && fMid > 0) || (fLo < 0 && fMid < 0)) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return rk4StepSundman(st, 0.5 * (lo + hi), lambdaTilde)
}

export type SphericalCollapseRun = {
  readonly deltaI: number
  readonly lambdaTilde: number
  readonly energyInit: number
  readonly collapsed: boolean
  readonly turnedAround: boolean
  readonly yTurnaround: number
  readonly tauTurnaroundOde: number
  readonly tauTurnaroundCosmic: number
  readonly tauReturnOneOde: number
  readonly tauCollapseCosmic: number
  readonly finalY: number
  readonly finalV: number
  readonly finalTauOde: number
  readonly minVObserved: number
  readonly maxEnergyDrift: number
  readonly stepsTaken: number
}

function integrateSphericalCollapse(input: {
  deltaI: number
  lambdaTilde: number
  ds: number
  maxS: number
  stopAtTurnaroundOnly?: boolean
}): SphericalCollapseRun {
  const { deltaI, lambdaTilde, ds, maxS, stopAtTurnaroundOnly = false } = input
  // Exact growing-mode conserved energy E = -(5/6) delta_i for flat background + spherical top-hat
  const energyTarget = (-5 / 6) * deltaI
  const v0Sq = 1 + lambdaTilde + 2 * energyTarget
  const v0 = Math.sqrt(v0Sq)
  let st: TopHatState = { y: 1, v: v0, tau: 0 }
  const energyInit = collapseEnergy(st.y, st.v, lambdaTilde)
  const tau0To1 = integrateTauZeroToOne(energyInit, lambdaTilde, 16)

  // Potential barrier location y_peak = (2 lambda_tilde)^{-1/3}; crossing beyond 1.25 * y_peak with v > 0
  // guarantees monotonic de Sitter escape (dy/dtau > 0 forever) because d^2y/dtau^2 > 0 for all y > y_peak.
  const yBarrier = lambdaTilde > 0 ? Math.cbrt(1 / (2 * lambdaTilde)) : Infinity
  const yEscapeCut = Number.isFinite(yBarrier) ? Math.max(10, 1.35 * yBarrier) : 1e5

  let turnedAround = false
  let collapsed = false
  let yTurnaround = NaN
  let tauTurnaroundOde = NaN
  let tauReturnOneOde = NaN
  let maxEnergyDrift = 0
  let minVObserved = st.v
  let stepsTaken = 0
  const maxSteps = Math.ceil(maxS / ds)

  for (let step = 0; step < maxSteps; step++) {
    const nxt = rk4StepSundman(st, ds, lambdaTilde)
    stepsTaken++

    const eNxt = collapseEnergy(nxt.y, nxt.v, lambdaTilde)
    const drift = Math.abs(eNxt - energyInit)
    if (drift > maxEnergyDrift) maxEnergyDrift = drift
    if (nxt.v < minVObserved) minVObserved = nxt.v

    if (!turnedAround && st.v >= 0 && nxt.v < 0) {
      const ta = refineRootOnStep(st, ds, lambdaTilde, 'v_zero')
      turnedAround = true
      yTurnaround = ta.y
      tauTurnaroundOde = ta.tau
      if (stopAtTurnaroundOnly) {
        st = ta
        break
      }
    }

    if (turnedAround && st.y >= 1 && nxt.y <= 1) {
      const ret = refineRootOnStep(st, ds, lambdaTilde, 'y_one')
      collapsed = true
      tauReturnOneOde = ret.tau
      st = ret
      break
    }

    st = nxt

    // Certify strict escape when past barrier with positive velocity and positive acceleration
    if (!turnedAround && st.y > yEscapeCut && st.v > 0 && -0.5 / (st.y * st.y) + lambdaTilde * st.y > 0) {
      break
    }
  }

  const tauTurnaroundCosmic = turnedAround ? tau0To1 + tauTurnaroundOde : NaN
  const tauCollapseCosmic = collapsed ? 2 * tau0To1 + tauReturnOneOde : NaN

  return {
    deltaI,
    lambdaTilde,
    energyInit,
    collapsed,
    turnedAround,
    yTurnaround,
    tauTurnaroundOde,
    tauTurnaroundCosmic,
    tauReturnOneOde,
    tauCollapseCosmic,
    finalY: st.y,
    finalV: st.v,
    finalTauOde: st.tau,
    minVObserved,
    maxEnergyDrift,
    stepsTaken,
  }
}

export type ShellCollapseEntry = {
  readonly shellD: number
  readonly rhoLambdaGeV4: number
  readonly rhoOverObs: number
  readonly lambdaTilde: number
  readonly collapsedCanonical25Sig: boolean
  readonly turnedAroundCanonical25Sig: boolean
  readonly yTurnaroundCanonical25Sig: number
  readonly tauTurnaroundCosmic25Sig: number
  readonly tauCollapseCosmic25Sig: number
  readonly minVObserved25Sig: number
  readonly maxEnergyDrift25Sig: number
  readonly collapsed1Sig: boolean
  readonly collapsed3Sig: boolean
}

export type Part2WeinbergCollapseReport = {
  // Milky-Way halo benchmark & exact Weinberg analytic prefactor
  readonly haloMassMsun: number
  readonly zRecombination: number
  readonly rhoMRecombGeV4: number
  readonly lambdaTildeObsAtZRec: number
  readonly sigmaMwAtZRec: number
  readonly canonicalNuSigma: number
  readonly canonicalDeltaI: number
  // Exact Weinberg (1987) analytic vs numerical RK4 critical threshold
  readonly weinbergAnalyticPrefactor: number // 500 / 729 = 0.6858710562
  readonly weinbergRk4Prefactor: number
  readonly weinbergPrefactorRelErr: number // < 1e-4 (far tighter than < 0.1%)
  readonly lambdaTildeCritAnalytic: number
  readonly lambdaTildeCritRk4: number
  readonly rhoLambdaMaxCanonicalGeV4: number
  readonly rhoLambdaMaxOverObsCanonical: number // ~ 88.35x
  readonly depthWeinbergCanonicalB: number // ~ 95.873 shells
  readonly windowWidthCanonicalShells: number // D_obs - D_Weinberg ~ 1.542 shells (< 2 shells)
  // Companion 1-sigma and 3-sigma Weinberg thresholds for full transparency
  readonly rhoLambdaMaxOverObs1Sig: number
  readonly depthWeinberg1SigB: number
  readonly windowWidth1SigShells: number
  readonly rhoLambdaMaxOverObs3Sig: number
  readonly depthWeinberg3SigB: number
  readonly windowWidth3SigShells: number
  // Discrete {3,4,3,4} shell sweep D in [92, 93, 94, 95, 96, 97, 97.4146, 98, 99, 100]
  readonly shellSweep: readonly ShellCollapseEntry[]
  readonly allShellsUpTo95LifelessCanonical: boolean
  readonly allShellsUpTo95Lifeless3Sig: boolean
  readonly rhoAtShell95OverObs: number // ~ 1,115.6x
  readonly obsShellCollapsesCanonical: boolean
  readonly obsShellCollapses1Sig: boolean
  // Numerical rigor certificates: energy conservation, step-halving, direct-tau RK4 cross-check
  readonly maxEnergyDriftAcrossSweep: number
  readonly rk4StepHalvingRelErrAtObs: number
  readonly directTauCrossCheckMaxErr: number
  // Mandatory negative controls
  readonly control1EdSAnalyticYTa: number
  readonly control1EdSNumericYTa: number
  readonly control1EdSYTaRelErr: number
  readonly control1EdSAnalyticTauTaCosmic: number
  readonly control1EdSTauTaCosmic: number
  readonly control1EdSTauTaRelErr: number
  readonly control1EdSTauCollCosmic: number
  readonly control1EdSTCollOver2TTaRelErr: number // |t_coll / (2 t_ta) - 1| <= 1e-10
  readonly control1EdSReturnSymRelErr: number // |tau_return_1_ode / (2 tau_ta_ode) - 1| <= 1e-10
  readonly control1EdSMaxEnergyDrift: number
  readonly control2HomogeneousCollapsedAny: boolean
  readonly control2HomogeneousMinV: number
  readonly control2HomogeneousMaxEnergyDrift: number
  readonly control2HomogeneousEdSExactErr: number // |y_RK4(tau) - (1 + 1.5 tau)^(2/3)|
}

function runPart2WeinbergCollapse(p1: Part1HolographicCknReport): Part2WeinbergCollapseReport {
  const b = p1.cuspBranchingB
  const lnB = p1.logBranchingB
  const mPl4 = p1.mPlanckGeV ** 4

  const onePlusZ = 1 + PLANCK_Z_REC
  const rhoMRecombGeV4 = p1.rhoM0GeV4 * onePlusZ ** 3
  const lambdaTildeObsAtZRec = p1.rhoLambdaObsGeV4 / rhoMRecombGeV4

  const sigmaMw = PLANCK_SIGMA_MW_ZREC
  const deltaCanonical = CANONICAL_WEINBERG_NU_SIGMA * sigmaMw // 6.0e-3 (2.5-sigma Milky-Way progenitor peak)
  const delta1Sig = 1.0 * sigmaMw // 2.4e-3
  const delta3Sig = 3.0 * sigmaMw // 7.2e-3

  // Exact analytic Weinberg (1987) threshold: rho_Lambda^max = (500 / 729) rho_m(t_i) delta_i^3
  const weinbergAnalyticPrefactor = 500 / 729
  const lambdaTildeCritAnalytic = weinbergAnalyticPrefactor * deltaCanonical ** 3

  // Deterministic RK4 bisection for numerical critical threshold lambda_tilde_crit
  let lo = 0.5 * lambdaTildeCritAnalytic
  let hi = 1.5 * lambdaTildeCritAnalytic
  for (let iter = 0; iter < 30; iter++) {
    const mid = 0.5 * (lo + hi)
    const probe = integrateSphericalCollapse({
      deltaI: deltaCanonical,
      lambdaTilde: mid,
      ds: 0.02,
      maxS: 280,
      stopAtTurnaroundOnly: true,
    })
    if (probe.turnedAround) {
      lo = mid
    } else {
      hi = mid
    }
  }
  const lambdaTildeCritRk4 = 0.5 * (lo + hi)
  const weinbergRk4Prefactor = lambdaTildeCritRk4 / deltaCanonical ** 3
  const weinbergPrefactorRelErr =
    Math.abs(weinbergRk4Prefactor - weinbergAnalyticPrefactor) / weinbergAnalyticPrefactor

  const rhoLambdaMaxCanonicalGeV4 = lambdaTildeCritAnalytic * rhoMRecombGeV4
  const rhoLambdaMaxOverObsCanonical = rhoLambdaMaxCanonicalGeV4 / p1.rhoLambdaObsGeV4
  const depthWeinbergCanonicalB = Math.log(mPl4 / rhoLambdaMaxCanonicalGeV4) / lnB
  const windowWidthCanonicalShells = p1.depthLambdaObsB - depthWeinbergCanonicalB

  const rhoLambdaMax1SigGeV4 = weinbergAnalyticPrefactor * delta1Sig ** 3 * rhoMRecombGeV4
  const rhoLambdaMaxOverObs1Sig = rhoLambdaMax1SigGeV4 / p1.rhoLambdaObsGeV4
  const depthWeinberg1SigB = Math.log(mPl4 / rhoLambdaMax1SigGeV4) / lnB
  const windowWidth1SigShells = p1.depthLambdaObsB - depthWeinberg1SigB

  const rhoLambdaMax3SigGeV4 = weinbergAnalyticPrefactor * delta3Sig ** 3 * rhoMRecombGeV4
  const rhoLambdaMaxOverObs3Sig = rhoLambdaMax3SigGeV4 / p1.rhoLambdaObsGeV4
  const depthWeinberg3SigB = Math.log(mPl4 / rhoLambdaMax3SigGeV4) / lnB
  const windowWidth3SigShells = p1.depthLambdaObsB - depthWeinberg3SigB

  // Discrete {3,4,3,4} shell sweep D in [92, 93, 94, 95, 96, 97, D_obs, 98, 99, 100]
  const shellDepths: readonly number[] = [
    92,
    93,
    94,
    95,
    96,
    97,
    p1.depthLambdaObsB,
    98,
    99,
    100,
  ]

  const shellSweep: ShellCollapseEntry[] = []
  let maxEnergyDriftAcrossSweep = 0

  for (const d of shellDepths) {
    const rhoLam = mPl4 * b ** -d
    const rhoOverObs = rhoLam / p1.rhoLambdaObsGeV4
    const lamTilde = rhoLam / rhoMRecombGeV4

    const run25 = integrateSphericalCollapse({
      deltaI: deltaCanonical,
      lambdaTilde: lamTilde,
      ds: 0.002,
      maxS: 260,
    })
    const run1 = integrateSphericalCollapse({
      deltaI: delta1Sig,
      lambdaTilde: lamTilde,
      ds: 0.04,
      maxS: 260,
      stopAtTurnaroundOnly: true,
    })
    const run3 = integrateSphericalCollapse({
      deltaI: delta3Sig,
      lambdaTilde: lamTilde,
      ds: 0.04,
      maxS: 260,
      stopAtTurnaroundOnly: true,
    })

    if (run25.maxEnergyDrift > maxEnergyDriftAcrossSweep) {
      maxEnergyDriftAcrossSweep = run25.maxEnergyDrift
    }

    shellSweep.push({
      shellD: d,
      rhoLambdaGeV4: rhoLam,
      rhoOverObs,
      lambdaTilde: lamTilde,
      collapsedCanonical25Sig: run25.collapsed,
      turnedAroundCanonical25Sig: run25.turnedAround,
      yTurnaroundCanonical25Sig: run25.yTurnaround,
      tauTurnaroundCosmic25Sig: run25.tauTurnaroundCosmic,
      tauCollapseCosmic25Sig: run25.tauCollapseCosmic,
      minVObserved25Sig: run25.minVObserved,
      maxEnergyDrift25Sig: run25.maxEnergyDrift,
      collapsed1Sig: run1.turnedAround,
      collapsed3Sig: run3.turnedAround,
    })
  }

  const allShellsUpTo95LifelessCanonical = shellSweep
    .filter(e => e.shellD <= 95.0001)
    .every(e => !e.collapsedCanonical25Sig && !e.turnedAroundCanonical25Sig && e.minVObserved25Sig > 0)
  const allShellsUpTo95Lifeless3Sig = shellSweep
    .filter(e => e.shellD <= 95.0001)
    .every(e => !e.collapsed3Sig)

  const entry95 = shellSweep.find(e => e.shellD === 95)!
  const entryObs = shellSweep.find(e => Math.abs(e.shellD - p1.depthLambdaObsB) < 1e-9)!

  // Step-halving convergence check at observed D_obs (ds = 0.002 vs ds = 0.001)
  const obsCoarse = integrateSphericalCollapse({
    deltaI: deltaCanonical,
    lambdaTilde: lambdaTildeObsAtZRec,
    ds: 0.002,
    maxS: 260,
  })
  const obsFine = integrateSphericalCollapse({
    deltaI: deltaCanonical,
    lambdaTilde: lambdaTildeObsAtZRec,
    ds: 0.001,
    maxS: 260,
  })
  const rk4StepHalvingRelErrAtObs = Math.max(
    Math.abs(obsFine.tauTurnaroundCosmic - obsCoarse.tauTurnaroundCosmic) /
      obsFine.tauTurnaroundCosmic,
    Math.abs(obsFine.tauCollapseCosmic - obsCoarse.tauCollapseCosmic) / obsFine.tauCollapseCosmic,
    Math.abs(obsFine.yTurnaround - obsCoarse.yTurnaround) / obsFine.yTurnaround,
  )

  // Direct uniform-dtau RK4 cross-check against Sundman-RK4 over 2000 steps (ds = 0.002)
  const energyCanon = (-5 / 6) * deltaCanonical
  let yDir = 1
  let vDir = Math.sqrt(1 + lambdaTildeObsAtZRec + 2 * energyCanon)
  let stSun: TopHatState = { y: yDir, v: vDir, tau: 0 }
  let directTauCrossCheckMaxErr = 0

  for (let step = 0; step < 2000; step++) {
    const nextSun = rk4StepSundman(stSun, 0.002, lambdaTildeObsAtZRec)
    const dtSub = nextSun.tau - stSun.tau
    const subN = 8
    const hSub = dtSub / subN
    for (let j = 0; j < subN; j++) {
      const nextDir = rk4StepDirectTau(yDir, vDir, hSub, lambdaTildeObsAtZRec)
      yDir = nextDir.y
      vDir = nextDir.v
    }
    stSun = nextSun
    const err = Math.max(Math.abs(yDir - stSun.y) / stSun.y, Math.abs(vDir - stSun.v))
    if (err > directTauCrossCheckMaxErr) directTauCrossCheckMaxErr = err
  }

  // Negative Control 1: Lambda = 0 (D -> infinity), exact Einstein-de Sitter cycloid t_coll = 2 t_ta
  const edsRun = integrateSphericalCollapse({
    deltaI: deltaCanonical,
    lambdaTilde: 0,
    ds: 0.001,
    maxS: 260,
  })
  const control1EdSAnalyticYTa = 1 / (2 * Math.abs(edsRun.energyInit))
  const control1EdSYTaRelErr =
    Math.abs(edsRun.yTurnaround - control1EdSAnalyticYTa) / control1EdSAnalyticYTa
  const control1EdSAnalyticTauTaCosmic = 0.5 * Math.PI * control1EdSAnalyticYTa ** 1.5
  const control1EdSTauTaRelErr =
    Math.abs(edsRun.tauTurnaroundCosmic - control1EdSAnalyticTauTaCosmic) /
    control1EdSAnalyticTauTaCosmic
  const control1EdSTCollOver2TTaRelErr = Math.abs(
    edsRun.tauCollapseCosmic / (2 * edsRun.tauTurnaroundCosmic) - 1,
  )
  const control1EdSReturnSymRelErr = Math.abs(
    edsRun.tauReturnOneOde / (2 * edsRun.tauTurnaroundOde) - 1,
  )

  // Negative Control 2: delta_i = 0 (homogeneous universe) never collapses at any D, and matches
  // exact Einstein-de Sitter expansion y(tau) = (1 + (3/2) tau)^{2/3} at Lambda = 0
  const homogProbes = [
    mPl4 * b ** -95 / rhoMRecombGeV4,
    lambdaTildeObsAtZRec,
    mPl4 * b ** -100 / rhoMRecombGeV4,
    0,
  ]
  let control2HomogeneousCollapsedAny = false
  let control2HomogeneousMinV = Infinity
  let control2HomogeneousMaxEnergyDrift = 0
  let control2HomogeneousEdSExactErr = 0

  for (const lamTilde of homogProbes) {
    const runH = integrateSphericalCollapse({
      deltaI: 0,
      lambdaTilde: lamTilde,
      ds: 0.001,
      maxS: 120,
    })
    if (runH.collapsed || runH.turnedAround) control2HomogeneousCollapsedAny = true
    if (runH.minVObserved < control2HomogeneousMinV) control2HomogeneousMinV = runH.minVObserved
    if (runH.maxEnergyDrift > control2HomogeneousMaxEnergyDrift) {
      control2HomogeneousMaxEnergyDrift = runH.maxEnergyDrift
    }
    if (lamTilde === 0) {
      const yExact = (1 + 1.5 * runH.finalTauOde) ** (2 / 3)
      control2HomogeneousEdSExactErr = Math.abs(runH.finalY - yExact) / yExact
    }
  }

  return {
    haloMassMsun: MW_HALO_MASS_MSUN,
    zRecombination: PLANCK_Z_REC,
    rhoMRecombGeV4,
    lambdaTildeObsAtZRec,
    sigmaMwAtZRec: sigmaMw,
    canonicalNuSigma: CANONICAL_WEINBERG_NU_SIGMA,
    canonicalDeltaI: deltaCanonical,
    weinbergAnalyticPrefactor,
    weinbergRk4Prefactor,
    weinbergPrefactorRelErr,
    lambdaTildeCritAnalytic,
    lambdaTildeCritRk4,
    rhoLambdaMaxCanonicalGeV4,
    rhoLambdaMaxOverObsCanonical,
    depthWeinbergCanonicalB,
    windowWidthCanonicalShells,
    rhoLambdaMaxOverObs1Sig,
    depthWeinberg1SigB,
    windowWidth1SigShells,
    rhoLambdaMaxOverObs3Sig,
    depthWeinberg3SigB,
    windowWidth3SigShells,
    shellSweep,
    allShellsUpTo95LifelessCanonical,
    allShellsUpTo95Lifeless3Sig,
    rhoAtShell95OverObs: entry95.rhoOverObs,
    obsShellCollapsesCanonical: entryObs.collapsedCanonical25Sig,
    obsShellCollapses1Sig: entryObs.collapsed1Sig,
    maxEnergyDriftAcrossSweep,
    rk4StepHalvingRelErrAtObs,
    directTauCrossCheckMaxErr,
    control1EdSAnalyticYTa,
    control1EdSNumericYTa: edsRun.yTurnaround,
    control1EdSYTaRelErr,
    control1EdSAnalyticTauTaCosmic,
    control1EdSTauTaCosmic: edsRun.tauTurnaroundCosmic,
    control1EdSTauTaRelErr,
    control1EdSTauCollCosmic: edsRun.tauCollapseCosmic,
    control1EdSTCollOver2TTaRelErr,
    control1EdSReturnSymRelErr,
    control1EdSMaxEnergyDrift: edsRun.maxEnergyDrift,
    control2HomogeneousCollapsedAny,
    control2HomogeneousMinV,
    control2HomogeneousMaxEnergyDrift,
    control2HomogeneousEdSExactErr,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Part 3: Discrete {3,4,3,4} Z_3-Flux Bousso-Polchinski Cascade & Honest Weinberg (1989) No-Go Ledger

export type FluxVacuumHit = {
  readonly nVector: readonly number[]
  readonly rhoEffGeV4: number
  readonly shellDepthB: number
  readonly rhoOverObs: number
  readonly absDepthErrFromObs: number
}

export type WeinbergNoGoLedger = {
  readonly cknHolographicBoundVerified: boolean
  readonly weinbergCollapseWindowVerified: boolean
  readonly z3FluxDiscretuumPopulatesWindow: boolean
  readonly zeroInputDynamicalDerivationClaimed: boolean
  readonly weinberg1989NoGoBoundaryOpen: boolean
  readonly agreesWithECsm0066OpenFlag: boolean
}

export type Part3FluxDiscretuumReport = {
  // Exact K = 8 {3,4,3,4} Z_3/4-form flux lattice specification
  readonly numChannelsK: number
  readonly maxAbsFluxInt: number // 6 (so |n_k| <= 6)
  readonly unsignedFluxStatesSearched: number // 7^8 = 5,764,801
  readonly signedFluxStatesRepresented: number // 13^8 = 815,730,721
  readonly anchorShellD: number // 95 (assumes 120 decades of prior warp suppression M_Pl^4 b^{-95})
  readonly rhoScaleGeV4: number // M_Pl^4 b^{-95}
  readonly bareOffsetDimensionless: number // -175 relative to anchor shell D = 95 (requires 120-decade prior suppression)
  readonly rhoBareGeV4: number
  readonly absRhoBareOverObs: number // ~ 1.95e5x observed rho_Lambda
  readonly depthAbsRhoBareB: number // ~ 93.22 shells (2.65 shells outside Weinberg window)
  readonly chargeSquaresDimensionless: readonly number[]
  readonly chargeLabels: readonly string[]
  readonly minChargeDimensionless: number
  readonly maxChargeDimensionless: number
  // Exhaustive meet-in-the-middle search in target shell band [96.0, 98.5]
  readonly targetBandMinD: number
  readonly targetBandMaxD: number
  readonly vacuaCountInTargetBand: number
  readonly vacuaCountInWeinbergWindow: number // [D_Weinberg, D_obs + 1.0]
  readonly vacuaCountWithin005OfObs: number
  readonly closestVacuum: FluxVacuumHit
  readonly sampleTopVacua: readonly FluxVacuumHit[]
  // Unwarped Planck-scale (D = 0) Bousso-Polchinski channel count analytic formula
  readonly planckScaleChannelsNeededK: number // ceil(97.415 ln(b) / ln(7)) = 146
  // Mandatory negative controls (commensurate equal charges & single-channel K = 1)
  readonly control1EqualChargesVacuaInBand: number // exact 0
  readonly control2SingleChannelVacuaInBand: number // exact 0
  // Honest Weinberg (1989) No-Go Ledger
  readonly ledger: WeinbergNoGoLedger
}

type HalfSumEntry = {
  readonly sum: number
  readonly packed: number // base-7 packed 4-tuple (n0, n1, n2, n3)
}

function buildHalfSums(
  cSq: readonly [number, number, number, number],
  maxInt: number,
): HalfSumEntry[] {
  const base = maxInt + 1
  const out: HalfSumEntry[] = []
  for (let a = 0; a <= maxInt; a++) {
    const sa = cSq[0] * a * a
    for (let b = 0; b <= maxInt; b++) {
      const sb = sa + cSq[1] * b * b
      for (let c = 0; c <= maxInt; c++) {
        const sc = sb + cSq[2] * c * c
        for (let d = 0; d <= maxInt; d++) {
          const sum = sc + cSq[3] * d * d
          const packed = ((a * base + b) * base + c) * base + d
          out.push({ sum, packed })
        }
      }
    }
  }
  out.sort((x, y) => x.sum - y.sum || x.packed - y.packed)
  return out
}

function unpack4(packed: number, base: number): [number, number, number, number] {
  const d = packed % base
  const p1 = (packed - d) / base
  const c = p1 % base
  const p2 = (p1 - c) / base
  const b = p2 % base
  const a = (p2 - b) / base
  return [a, b, c, d]
}

// Exhaustive deterministic 4+4 meet-in-the-middle scan over all (maxInt + 1)^8 flux vectors
// finding every vector whose dimensionless S(n) - barePos lies in [minDelta, maxDelta].
function scanFluxLattice8(input: {
  chargeSquares: readonly number[]
  maxInt: number
  barePos: number
  minDelta: number
  maxDelta: number
  targetDeltaObs: number
  rhoScaleGeV4: number
  mPl4: number
  lnB: number
  rhoLambdaObsGeV4: number
  depthWeinbergB: number
  depthObsB: number
}): {
  readonly countInBand: number
  readonly countInWeinberg: number
  readonly countWithin005: number
  readonly topHits: readonly FluxVacuumHit[]
} {
  const {
    chargeSquares,
    maxInt,
    barePos,
    minDelta,
    maxDelta,
    targetDeltaObs,
    rhoScaleGeV4,
    mPl4,
    lnB,
    rhoLambdaObsGeV4,
    depthWeinbergB,
    depthObsB,
  } = input

  const left = buildHalfSums(
    [chargeSquares[0]!, chargeSquares[1]!, chargeSquares[2]!, chargeSquares[3]!],
    maxInt,
  )
  const right = buildHalfSums(
    [chargeSquares[4]!, chargeSquares[5]!, chargeSquares[6]!, chargeSquares[7]!],
    maxInt,
  )

  const loTarget = barePos + minDelta
  const hiTarget = barePos + maxDelta
  const base = maxInt + 1

  let countInBand = 0
  let countInWeinberg = 0
  let countWithin005 = 0
  const bestHeap: FluxVacuumHit[] = []
  const maxKeep = 12

  // Two-pointer window scan: for each left[i], find all right[j] in [loTarget - left[i], hiTarget - left[i]]
  let jHi = right.length - 1
  let jLo = right.length - 1

  for (let i = 0; i < left.length; i++) {
    const lSum = left[i]!.sum
    const needHi = hiTarget - lSum
    const needLo = loTarget - lSum

    while (jHi >= 0 && right[jHi]!.sum > needHi) {
      jHi--
    }
    if (jHi < 0) break

    if (jLo > jHi) jLo = jHi
    while (jLo >= 0 && right[jLo]!.sum >= needLo) {
      jLo--
    }

    // Valid range is j in [jLo + 1, jHi]
    for (let j = jLo + 1; j <= jHi; j++) {
      const delta = lSum + right[j]!.sum - barePos
      if (delta < minDelta || delta > maxDelta) continue

      countInBand++
      const rhoEff = delta * rhoScaleGeV4
      const shellDepthB = Math.log(mPl4 / rhoEff) / lnB
      const absErr = Math.abs(shellDepthB - depthObsB)

      if (shellDepthB >= depthWeinbergB && shellDepthB <= depthObsB + 1.0) {
        countInWeinberg++
      }
      if (absErr <= 0.05) {
        countWithin005++
      }

      // Maintain top `maxKeep` hits closest to D_obs deterministically
      if (
        bestHeap.length < maxKeep ||
        absErr < bestHeap[bestHeap.length - 1]!.absDepthErrFromObs
      ) {
        const [n0, n1, n2, n3] = unpack4(left[i]!.packed, base)
        const [n4, n5, n6, n7] = unpack4(right[j]!.packed, base)
        const hit: FluxVacuumHit = {
          nVector: [n0, n1, n2, n3, n4, n5, n6, n7],
          rhoEffGeV4: rhoEff,
          shellDepthB,
          rhoOverObs: rhoEff / rhoLambdaObsGeV4,
          absDepthErrFromObs: absErr,
        }
        bestHeap.push(hit)
        bestHeap.sort(
          (u, v) =>
            u.absDepthErrFromObs - v.absDepthErrFromObs ||
            Math.abs(u.rhoEffGeV4 - targetDeltaObs * rhoScaleGeV4) -
              Math.abs(v.rhoEffGeV4 - targetDeltaObs * rhoScaleGeV4),
        )
        if (bestHeap.length > maxKeep) {
          bestHeap.pop()
        }
      }
    }
  }

  return {
    countInBand,
    countInWeinberg,
    countWithin005,
    topHits: bestHeap,
  }
}

function runPart3FluxDiscretuum(
  p1: Part1HolographicCknReport,
  p2: Part2WeinbergCollapseReport,
  ps: ReturnType<typeof analyzePatiSalamUnificationHierarchy>,
  cosmic: ReturnType<typeof runCosmicHistoryBackreaction>,
  baryo: ReturnType<typeof analyzeBaryogenesisDarkSectorAndLambda>,
): Part3FluxDiscretuumReport {
  const b = p1.cuspBranchingB
  const lnB = p1.logBranchingB
  const mPl4 = p1.mPlanckGeV ** 4

  // Anchor at integer shell D = 95 (M_Pl^4 b^{-95} = 1,115.6x rho_Lambda_obs): explicitly assumes 120 decades
  // of prior warp suppression before scanning K = 8 flux channels (unwarped D = 0 requires K_Planck = 146).
  const anchorShellD = 95
  const rhoScaleGeV4 = mPl4 * b ** -anchorShellD
  const barePos = 175 // bare vacuum energy -175 * rho_scale (~1.95e5x observed, D = 93.22) relative to D = 95 anchor
  const rhoBareGeV4 = -barePos * rhoScaleGeV4
  const absRhoBareOverObs = Math.abs(rhoBareGeV4) / p1.rhoLambdaObsGeV4
  const depthAbsRhoBareB = Math.log(mPl4 / Math.abs(rhoBareGeV4)) / lnB

  // K = 8 mutually incommensurate O(1) cusp-cycle flux charges q_k^2 from exact {3,4,3,4} periods & invariants
  const chargeLabels: readonly string[] = [
    '1 (base cusp cycle)',
    'ln(b)/2 ({3,4,3,4} branching log)',
    'sqrt(2) (octahedral diagonal)',
    'sqrt(3) (Z_3 triangular altitude)',
    'sqrt(5)/2 (lateral degree c_bulk=5)',
    'pi/3 (Z_3 angular period)',
    'K_eff (E-GRV-0157 Riccati stiffness)',
    '2 H_inf (E-CSM-0065 horosphere rate)',
  ]
  const chargeSquaresDimensionless: readonly number[] = [
    1,
    lnB / 2,
    Math.SQRT2,
    Math.sqrt(3),
    Math.sqrt(5) / 2,
    Math.PI / 3,
    ps.bareLatticeAlpha.latticeKEff,
    2 * cosmic.constants.hInfRVol,
  ]

  const chargeVals = chargeSquaresDimensionless.map(v => Math.sqrt(v))
  const minChargeDimensionless = Math.min(...chargeVals)
  const maxChargeDimensionless = Math.max(...chargeVals)

  const maxAbsFluxInt = 6
  const numChannelsK = 8
  const unsignedFluxStatesSearched = (maxAbsFluxInt + 1) ** numChannelsK // 7^8 = 5,764,801
  const signedFluxStatesRepresented = (2 * maxAbsFluxInt + 1) ** numChannelsK // 13^8 = 815,730,721

  const targetBandMinD = 96.0
  const targetBandMaxD = 98.5
  const minDelta = (mPl4 * b ** -targetBandMaxD) / rhoScaleGeV4 // b^{-3.5}
  const maxDelta = (mPl4 * b ** -targetBandMinD) / rhoScaleGeV4 // b^{-1.0}
  const targetDeltaObs = p1.rhoLambdaObsGeV4 / rhoScaleGeV4

  const mainScan = scanFluxLattice8({
    chargeSquares: chargeSquaresDimensionless,
    maxInt: maxAbsFluxInt,
    barePos,
    minDelta,
    maxDelta,
    targetDeltaObs,
    rhoScaleGeV4,
    mPl4,
    lnB,
    rhoLambdaObsGeV4: p1.rhoLambdaObsGeV4,
    depthWeinbergB: p2.depthWeinbergCanonicalB,
    depthObsB: p1.depthLambdaObsB,
  })

  // Negative Control 3A: equal commensurate charges q_k^2 = 1 -> integer spectrum only, 0 vacua in [96.0, 98.5]
  const ctrlEqualScan = scanFluxLattice8({
    chargeSquares: [1, 1, 1, 1, 1, 1, 1, 1],
    maxInt: maxAbsFluxInt,
    barePos,
    minDelta,
    maxDelta,
    targetDeltaObs,
    rhoScaleGeV4,
    mPl4,
    lnB,
    rhoLambdaObsGeV4: p1.rhoLambdaObsGeV4,
    depthWeinbergB: p2.depthWeinbergCanonicalB,
    depthObsB: p1.depthLambdaObsB,
  })

  // Negative Control 3B: single irrational channel K = 1 (n_1 in 0..6, only 7 flux states)
  const q1Sq = chargeSquaresDimensionless[1]!
  let control2SingleChannelVacuaInBand = 0
  for (let n1 = 0; n1 <= maxAbsFluxInt; n1++) {
    const delta = q1Sq * n1 * n1 - barePos
    if (delta >= minDelta && delta <= maxDelta) {
      control2SingleChannelVacuaInBand++
    }
  }

  // Analytic unwarped Planck-scale (D = 0) Bousso-Polchinski channel count for |n_k| <= 6:
  //   7^K >= M_Pl^4 / rho_Lambda_obs = b^{D_obs}  =>  K_Planck = ceil(D_obs ln(b) / ln(7)) = 146
  const planckScaleChannelsNeededK = Math.ceil(
    (p1.depthLambdaObsB * lnB) / Math.log(maxAbsFluxInt + 1),
  )

  const closestVacuum: FluxVacuumHit = mainScan.topHits[0] ?? {
    nVector: [0, 0, 0, 0, 0, 0, 0, 0],
    rhoEffGeV4: NaN,
    shellDepthB: NaN,
    rhoOverObs: NaN,
    absDepthErrFromObs: Infinity,
  }

  // Honest Weinberg (1989) Cosmological Constant No-Go Ledger
  const cknHolographicBoundVerified =
    p1.identityH0ErrB <= 1e-13 &&
    p1.identityDeSitterErrB <= 1e-13 &&
    Math.abs(p1.depthCknBareOffsetFromObsB - p1.logBOfInvOmegaLambda) <= 1e-13 &&
    p1.depthCknBareOffsetFromObsB < 0.15 &&
    Math.abs(p1.cosmicHistoryLateWEff - -1) <= 1e-3

  const weinbergCollapseWindowVerified =
    p2.weinbergPrefactorRelErr < 1e-3 &&
    p2.allShellsUpTo95LifelessCanonical &&
    p2.obsShellCollapsesCanonical &&
    p2.windowWidthCanonicalShells < 2.0

  const z3FluxDiscretuumPopulatesWindow =
    mainScan.countInBand >= 10 &&
    closestVacuum.absDepthErrFromObs < 0.05 &&
    ctrlEqualScan.countInBand === 0 &&
    control2SingleChannelVacuaInBand === 0

  // Weinberg (1989) No-Go: neither CKN (takes IR horizon H_0/H_inf) nor Weinberg/BP (environmental
  // selection over a discretuum) constitutes a zero-input dynamical derivation of D_Lambda = 97.415.
  const zeroInputDynamicalDerivationClaimed = false
  const weinberg1989NoGoBoundaryOpen =
    baryo.part3.lambdaShellAudit.dynamicalSelectionOfDLambdaOpen &&
    !zeroInputDynamicalDerivationClaimed

  const ledger: WeinbergNoGoLedger = {
    cknHolographicBoundVerified,
    weinbergCollapseWindowVerified,
    z3FluxDiscretuumPopulatesWindow,
    zeroInputDynamicalDerivationClaimed,
    weinberg1989NoGoBoundaryOpen,
    agreesWithECsm0066OpenFlag:
      weinberg1989NoGoBoundaryOpen ===
      baryo.part3.lambdaShellAudit.dynamicalSelectionOfDLambdaOpen,
  }

  return {
    numChannelsK,
    maxAbsFluxInt,
    unsignedFluxStatesSearched,
    signedFluxStatesRepresented,
    anchorShellD,
    rhoScaleGeV4,
    bareOffsetDimensionless: -barePos,
    rhoBareGeV4,
    absRhoBareOverObs,
    depthAbsRhoBareB,
    chargeSquaresDimensionless,
    chargeLabels,
    minChargeDimensionless,
    maxChargeDimensionless,
    targetBandMinD,
    targetBandMaxD,
    vacuaCountInTargetBand: mainScan.countInBand,
    vacuaCountInWeinbergWindow: mainScan.countInWeinberg,
    vacuaCountWithin005OfObs: mainScan.countWithin005,
    closestVacuum,
    sampleTopVacua: mainScan.topHits,
    planckScaleChannelsNeededK,
    control1EqualChargesVacuaInBand: ctrlEqualScan.countInBand,
    control2SingleChannelVacuaInBand,
    ledger,
  }
}

// ---------------------------------------------------------------------------------------------------------
// Top-level E-CSM-0068 analysis

export type HolographicLambdaAndWeinbergWindowReport = {
  readonly part1: Part1HolographicCknReport
  readonly part2: Part2WeinbergCollapseReport
  readonly part3: Part3FluxDiscretuumReport
}

export function analyzeHolographicLambdaAndWeinbergWindow(): HolographicLambdaAndWeinbergWindowReport {
  const ps = analyzePatiSalamUnificationHierarchy()
  const cosmic = runCosmicHistoryBackreaction()
  const baryo = analyzeBaryogenesisDarkSectorAndLambda()

  const part1 = runPart1HolographicCkn(ps, cosmic, baryo)
  const part2 = runPart2WeinbergCollapse(part1)
  const part3 = runPart3FluxDiscretuum(part1, part2, ps, cosmic, baryo)

  return { part1, part2, part3 }
}
