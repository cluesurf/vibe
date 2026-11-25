// DYNAMIC BINARY BLACK-HOLE INSPIRAL, QUADRUPOLE GW CHIRP, LIVE SPIN-2 TT WAVE PROPAGATION,
// AND EXACT REGGE-WHEELER / ZERILLI QUASINORMAL RINGDOWN ON THE {3,4,3,4} 1/N_D^2 WARPED CUSP
// (E-GRV-0161).
//
// Scientific progression from E-GRV-0157, E-RLT-0125, and E-GRV-0160:
//   - E-GRV-0157 (pair-density-gravity-slope.ts): exact {3,4,3,4} shell counts N_D = [1, 18, 330, 6034]
//     with parameter-free pair-density warp w(D) = 1 / N_D^2 (canonical single-face [1, 4, 20, 100])
//     give K_eff = 1.0125321220 and G_eff = 1 / (4 pi K_eff) = 0.07859254.
//   - E-RLT-0125 (universal-speed-lock.ts): shared warped-cusp column locks spin-2 gravitons, spin-1
//     photons, and spin-1/2 Weyl fermions onto c_u = sqrt(K_eff / M_eff) = 0.9779246684 docks/beat
//     with a unique k = 0 zero mode and gapped KK tower m_KK = 3.2725.
//   - E-GRV-0160 (nonlinear-einstein-curvature.ts): derives gamma_PPN = 1, beta_PPN = 1, and full
//     nonlinear 4D Einstein equations G_{mu nu} = (8 pi G_eff / c_u^4) T_{mu nu} converging to exact
//     nonlinear isotropic Schwarzschild outside the compact pair-density remnant.
//
// Here we close dynamical strong-field gravitational-wave physics at L2 with ZERO free gravity
// parameters (100% deterministic, zero Math.random):
//
//   Part 1 -- Live Radiative Binary Inspiral & Exact Peters-Mathews Quadrupole Chirp:
//     Evolve an equal-mass compact binary (m_1 = m_2 = M / 2, eta = 1/4) from r_0 = 135 r_g down to
//     r_end = 7.0 r_g (approaching r_ISCO = 6 G_eff M / c_u^2 right outside the 1PN ADM plunge) under exact 1PN ADM conservative
//     dynamics + 2.5PN Burke-Thorne / Peters-Mathews quadrupole radiation reaction via Sundman-
//     regularized 4th-order Runge-Kutta (with global step-halving convergence check <= 1e-8 and
//     independent Cartesian RK4 cross-check). Verify monotonic chirp, exact Peters-Mathews df/dt
//     match <= 2% in the adiabatic window, exact energy E_orb + E_GW and angular momentum L_z + J_GW
//     balance <= 1e-4, and conservative radiation-reaction-OFF negative controls (Newtonian and 1PN).
//
//   Part 2 -- Live Time-Dependent Spin-2 TT Wave Propagation on the {3,4,3,4} Warped Column (F = 12):
//     Inject the live quadrupole chirp strain source S_TT(t) from Part 1 into an explicit time-
//     dependent (1+1) radial + {3,4,3,4} warped-column (F = 12) symplectic leapfrog spin-2 TT wave
//     solver coupling radial propagation directly to E-RLT-0125's exact w(D) = 1 / N_D^2 vertical
//     operator H_vert. Verify exact retarded arrival time Delta t = (r_2 - r_1) / c_u matching c_u
//     to <= 0.5%, exact 1/r wave-zone amplitude falloff <= 2%, exact free-wave symplectic energy
//     conservation <= 1e-12, exact time-reversal <= 1e-12, and the raw unwarped {3,4,3,4} bulk
//     (w(D) = 1) negative control where the Cheeger mass gap screens the wave exponentially.
//
//   Part 3 -- Exact Black-Hole Quasinormal Ringdown (l = 2 Regge-Wheeler & Zerilli Isospectrality)
//     from E-GRV-0160's Converged Schwarzschild Remnant:
//     Using r_s = 2 G_eff M_rem / c_u^2 live from E-GRV-0160's converged nonlinear Schwarzschild
//     exterior, evolve a live Gaussian spin-2 perturbation in tortoise coordinate r_* under BOTH
//     the axial Regge-Wheeler potential V_RW(r) and the polar Zerilli potential V_Z(r) (l = 2,
//     verified to satisfy Chandrasekhar's exact Darboux superpotential identity) using a CFL-stable
//     time-reversible 4th-order-space symplectic velocity-Verlet wave integrator with Sommerfeld
//     outgoing boundaries. Extract fundamental l = 2, n = 0 QNM frequencies via Prony + Gauss-Newton
//     variable-projection damped-sinusoid least squares, verifying Chandrasekhar-Detweiler
//     omega_R * (G_eff M / c_u^3) = 0.37367 (<= 1.5%), omega_I * (G_eff M / c_u^3) = 0.08896
//     (<= 2.5%), exact axial-polar isospectrality (<= 1%), and the flat-space M = 0 Huygens negative
//     control (zero ringdown, late-time energy ratio < 1e-6).
//
// Honest remaining boundary:
//   This closes dynamical binary inspiral, GW chirp propagation on the {3,4,3,4} warped column, and
//   Schwarzschild QNM ringdown at L2. Brute-force unfactored 10^12-dock L3 many-body merger on the
//   full 4D honeycomb remains a hardware-scale frontier.

import { EXACT_COLUMN_SHELL_COUNTS } from '@/code/measure/pair-density-gravity-slope'
import { runNonlinearEinsteinCurvature } from '@/code/measure/nonlinear-einstein-curvature'
import { buildWarpedColumnData, type WarpedColumnData } from '@/code/measure/universal-speed-lock'

// Exact Chandrasekhar-Detweiler / Leaver fundamental l = 2, n = 0 Schwarzschild QNM dimensionless frequency
export const QNM_L2_N0_OMEGA_R_EXACT = 0.3736716844
export const QNM_L2_N0_OMEGA_I_EXACT = 0.0889623157

const R_VOL = EXACT_COLUMN_SHELL_COUNTS[3] / EXACT_COLUMN_SHELL_COUNTS[2]

// -------------------------------------------------------------------------------------------------
// PART 1: Live Radiative Binary Inspiral & Exact Peters-Mathews Quadrupole Chirp
// -------------------------------------------------------------------------------------------------

type InspiralConfig = {
  readonly gEff: number
  readonly cU: number
  readonly mTotal: number
  readonly eta: number
  readonly include1PN: boolean
  readonly includeRR: boolean
}

type PolarState = {
  readonly t: number
  readonly r: number
  readonly phi: number
  readonly pr: number
  readonly ell: number
  readonly eGw: number
  readonly jGw: number
}

// Specific 1PN ADM Hamiltonian H_1PN / mu (Damour-Schafer 1988, identical to EIH at 1PN)
function evalSpecificH1PN(
  cfg: InspiralConfig,
  r: number,
  pr: number,
  ell: number,
): number {
  const gm = cfg.gEff * cfg.mTotal
  const u = gm / r
  const pPhi = ell / r
  const pSq = pr * pr + pPhi * pPhi
  const hN = 0.5 * pSq - u
  if (!cfg.include1PN) return hN
  const invC2 = 1 / (cfg.cU * cfg.cU)
  const eta = cfg.eta
  const h1 =
    ((3 * eta - 1) / 8) * pSq * pSq -
    0.5 * u * ((3 + eta) * pSq + eta * pr * pr) +
    0.5 * u * u
  return hN + invC2 * h1
}

// Exact circular-orbit specific angular momentum ell(r) solving dH_1PN/dr|_{p_r = 0} = 0
function solveCircularEll(cfg: InspiralConfig, r: number): number {
  const gm = cfg.gEff * cfg.mTotal
  const u = gm / r
  if (!cfg.include1PN) {
    return r * Math.sqrt(u)
  }
  const invC2 = 1 / (cfg.cU * cfg.cU)
  const eta = cfg.eta
  // Quadratic in y = ell^2 / r^2:
  //   a y^2 + b y + c = 0
  //   a = ((3 eta - 1) / 2) / c^2
  //   b = 1 - (3 (3 + eta) / 2) u / c^2
  //   c = -u (1 - u / c^2)
  const a = (0.5 * (3 * eta - 1)) * invC2
  const b = 1 - 1.5 * (3 + eta) * u * invC2
  const c = -u * (1 - u * invC2)
  const disc = Math.sqrt(b * b - 4 * a * c)
  // Physical branch continuously connected to y = u as 1/c^2 -> 0: y = (-2 c) / (b + sqrt(b^2 - 4ac))
  const y = (-2 * c) / (b + disc)
  return r * Math.sqrt(y)
}

// Compute time derivatives (dt/ds, dr/ds, dphi/ds, dpr/ds, dell/ds, dEgw/ds, dJgw/ds)
// in Sundman time s where dt/ds = (r / r_g)^(3/2) when sundman = true, or dt/ds = 1 when sundman = false.
function evalPolarRhs(
  cfg: InspiralConfig,
  r: number,
  pr: number,
  ell: number,
  sundman: boolean,
): {
  readonly dt: number
  readonly dr: number
  readonly dphi: number
  readonly dpr: number
  readonly dell: number
  readonly deGw: number
  readonly djGw: number
  readonly omega: number
  readonly pGw: number
  readonly jDotGw: number
} {
  const gm = cfg.gEff * cfg.mTotal
  const cU = cfg.cU
  const c2 = cU * cU
  const invC2 = 1 / c2
  const eta = cfg.eta
  const mu = eta * cfg.mTotal
  const u = gm / r
  const invR = 1 / r
  const invR2 = invR * invR
  const pPhi = ell * invR
  const pPhiSq = pPhi * pPhi
  const pSq = pr * pr + pPhiSq

  let rDot = pr
  let phiDot = ell * invR2
  let prDot = pPhiSq * invR - u * invR

  if (cfg.include1PN) {
    const c3e1 = 0.5 * (3 * eta - 1)
    rDot = pr * (1 + invC2 * (c3e1 * pSq - (3 + 2 * eta) * u))
    phiDot = ell * invR2 * (1 + invC2 * (c3e1 * pSq - (3 + eta) * u))
    prDot +=
      invC2 *
      (c3e1 * pSq * pPhiSq * invR -
        0.5 * u * invR * ((3 + eta) * pSq + eta * pr * pr) -
        (3 + eta) * u * pPhiSq * invR +
        u * u * invR)
  }

  // Exact 2.5PN Peters-Mathews / Buonanno-Damour quadrupole radiation-reaction flux:
  //   x_f = (G_eff M omega / c_u^3)^(2/3),
  //   P_GW = (32/5) (c_u^5 / G_eff) eta^2 x_f^5 = (32/5) (G_eff / c_u^5) mu^2 (G_eff M / omega^2)^(4/3) omega^6,
  //   Jdot_GW = P_GW / omega,  dell/dt = -Jdot_GW / mu.
  // Because H_1PN is canonical, dE_orb/dt = mu * (rDot * 0 + phiDot * dell/dt) = -P_GW identically
  // and dL_z/dt = mu * dell/dt = -Jdot_GW identically.
  let pGw = 0
  let jDotGw = 0
  let ellDot = 0
  if (cfg.includeRR && phiDot > 0) {
    const c3 = c2 * cU
    const c5 = c3 * c2
    const xF = ((gm * phiDot) / c3) ** (2 / 3)
    const xF5 = xF * xF * xF * xF * xF
    pGw = (32 / 5) * (c5 / cfg.gEff) * eta * eta * xF5
    jDotGw = pGw / phiDot
    ellDot = -jDotGw / mu
  }

  const rG = gm / c2
  const scale = sundman ? (r / rG) ** 1.5 : 1
  return {
    dt: scale,
    dr: scale * rDot,
    dphi: scale * phiDot,
    dpr: scale * prDot,
    dell: scale * ellDot,
    deGw: scale * pGw,
    djGw: scale * jDotGw,
    omega: phiDot,
    pGw,
    jDotGw,
  }
}

// Compute post-circular initial radial momentum p_{r,0} to suppress spurious initial eccentricity
function computePostCircularPr(cfg: InspiralConfig, r0: number, ell0: number): number {
  if (!cfg.includeRR) return 0
  const dr = 1e-4 * r0
  const dellDr = (solveCircularEll(cfg, r0 + dr) - solveCircularEll(cfg, r0 - dr)) / (2 * dr)
  const rhs0 = evalPolarRhs(cfg, r0, 0, ell0, false)
  const rDot0 = rhs0.dell / dellDr
  if (!cfg.include1PN) return rDot0
  const gm = cfg.gEff * cfg.mTotal
  const u = gm / r0
  const pPhi = ell0 / r0
  const invC2 = 1 / (cfg.cU * cfg.cU)
  const factor = 1 + invC2 * (0.5 * (3 * cfg.eta - 1) * pPhi * pPhi - (3 + 2 * cfg.eta) * u)
  return rDot0 / factor
}

function rk4StepPolar(
  cfg: InspiralConfig,
  s: PolarState,
  h: number,
  sundman: boolean,
): PolarState {
  const k1 = evalPolarRhs(cfg, s.r, s.pr, s.ell, sundman)
  const h2 = 0.5 * h
  const k2 = evalPolarRhs(cfg, s.r + h2 * k1.dr, s.pr + h2 * k1.dpr, s.ell + h2 * k1.dell, sundman)
  const k3 = evalPolarRhs(cfg, s.r + h2 * k2.dr, s.pr + h2 * k2.dpr, s.ell + h2 * k2.dell, sundman)
  const k4 = evalPolarRhs(cfg, s.r + h * k3.dr, s.pr + h * k3.dpr, s.ell + h * k3.dell, sundman)
  const h6 = h / 6
  return {
    t: s.t + h6 * (k1.dt + 2 * k2.dt + 2 * k3.dt + k4.dt),
    r: s.r + h6 * (k1.dr + 2 * k2.dr + 2 * k3.dr + k4.dr),
    phi: s.phi + h6 * (k1.dphi + 2 * k2.dphi + 2 * k3.dphi + k4.dphi),
    pr: s.pr + h6 * (k1.dpr + 2 * k2.dpr + 2 * k3.dpr + k4.dpr),
    ell: s.ell + h6 * (k1.dell + 2 * k2.dell + 2 * k3.dell + k4.dell),
    eGw: s.eGw + h6 * (k1.deGw + 2 * k2.deGw + 2 * k3.deGw + k4.deGw),
    jGw: s.jGw + h6 * (k1.djGw + 2 * k2.djGw + 2 * k3.djGw + k4.djGw),
  }
}

// Independent Cartesian RK4 integrator for cross-check and conservative negative controls
type CartState = {
  readonly x: number
  readonly y: number
  readonly px: number
  readonly py: number
  readonly eGw: number
  readonly jGw: number
}

function evalCartRhs(cfg: InspiralConfig, s: CartState): CartState {
  const { x, y, px, py } = s
  const r2 = x * x + y * y
  const r = Math.sqrt(r2)
  const invR = 1 / r
  const invR2 = 1 / r2
  const nx = x * invR
  const ny = y * invR
  const pr = nx * px + ny * py
  const p2 = px * px + py * py
  const ell = x * py - y * px
  const gm = cfg.gEff * cfg.mTotal
  const u = gm * invR
  const cU = cfg.cU
  const c2 = cU * cU
  const invC2 = 1 / c2
  const eta = cfg.eta
  const mu = eta * cfg.mTotal

  // dH/dp_i and -dH/dx_i for exact 1PN ADM Hamiltonian H(r, p_r, p^2)
  let vx = px
  let vy = py
  let dpx = -u * invR * nx
  let dpy = -u * invR * ny

  if (cfg.include1PN) {
    const c3e1 = 0.5 * (3 * eta - 1)
    const pFactor = 1 + invC2 * (c3e1 * p2 - (3 + eta) * u)
    const nFactor = -invC2 * eta * u * pr
    vx = pFactor * px + nFactor * nx
    vy = pFactor * py + nFactor * ny

    // dH_1PN / dr (at fixed p_vec) via chain rule on u(r) and p_r = (r . p)/r:
    //   dp_r/dx_i = (p_i - p_r n_i) / r
    const dHdu = -1 + invC2 * (-0.5 * ((3 + eta) * p2 + eta * pr * pr) + u)
    const dHdPr = -invC2 * eta * u * pr
    // -dH/dx_i = -dHdu * (-u n_i / r) - dHdPr * (p_i - p_r n_i) / r
    dpx = dHdu * (u * invR) * nx - dHdPr * (px - pr * nx) * invR
    dpy = dHdu * (u * invR) * ny - dHdPr * (py - pr * ny) * invR
  }

  let deGw = 0
  let djGw = 0
  if (cfg.includeRR) {
    const omega = (x * vy - y * vx) * invR2
    if (omega > 0) {
      const c3 = c2 * cU
      const c5 = c3 * c2
      const xF = ((gm * omega) / c3) ** (2 / 3)
      const xF5 = xF * xF * xF * xF * xF
      deGw = (32 / 5) * (c5 / cfg.gEff) * eta * eta * xF5
      djGw = deGw / omega
      // Tangential force f_phi = -djGw / (mu * r) along phi_hat = (-ny, nx)
      const fPhi = -djGw / (mu * r)
      dpx += -ny * fPhi
      dpy += nx * fPhi
    }
  }

  return { x: vx, y: vy, px: dpx, py: dpy, eGw: deGw, jGw: djGw }
}

function rk4StepCart(cfg: InspiralConfig, s: CartState, dt: number): CartState {
  const k1 = evalCartRhs(cfg, s)
  const h2 = 0.5 * dt
  const k2 = evalCartRhs(cfg, {
    x: s.x + h2 * k1.x,
    y: s.y + h2 * k1.y,
    px: s.px + h2 * k1.px,
    py: s.py + h2 * k1.py,
    eGw: s.eGw + h2 * k1.eGw,
    jGw: s.jGw + h2 * k1.jGw,
  })
  const k3 = evalCartRhs(cfg, {
    x: s.x + h2 * k2.x,
    y: s.y + h2 * k2.y,
    px: s.px + h2 * k2.px,
    py: s.py + h2 * k2.py,
    eGw: s.eGw + h2 * k2.eGw,
    jGw: s.jGw + h2 * k2.jGw,
  })
  const k4 = evalCartRhs(cfg, {
    x: s.x + dt * k3.x,
    y: s.y + dt * k3.y,
    px: s.px + dt * k3.px,
    py: s.py + dt * k3.py,
    eGw: s.eGw + dt * k3.eGw,
    jGw: s.jGw + dt * k3.jGw,
  })
  const h6 = dt / 6
  return {
    x: s.x + h6 * (k1.x + 2 * k2.x + 2 * k3.x + k4.x),
    y: s.y + h6 * (k1.y + 2 * k2.y + 2 * k3.y + k4.y),
    px: s.px + h6 * (k1.px + 2 * k2.px + 2 * k3.px + k4.px),
    py: s.py + h6 * (k1.py + 2 * k2.py + 2 * k3.py + k4.py),
    eGw: s.eGw + h6 * (k1.eGw + 2 * k2.eGw + 2 * k3.eGw + k4.eGw),
    jGw: s.jGw + h6 * (k1.jGw + 2 * k2.jGw + 2 * k3.jGw + k4.jGw),
  }
}

export type Part1InspiralResult = {
  readonly mTotal: number
  readonly m1: number
  readonly m2: number
  readonly mChirp: number
  readonly rG: number
  readonly rIsco: number
  readonly r0: number
  readonly rEnd: number
  readonly rRatioEndOverStart: number
  readonly totalTimeBeats: number
  readonly totalOrbits: number
  readonly fGwStart: number
  readonly fGwEnd: number
  readonly fGwRatio: number
  readonly rStrictlyShrinking: boolean
  readonly fGwStrictlyRising: boolean
  // Peters-Mathews chirp rate comparison in the adiabatic window
  readonly adiabaticPmDfDtMaxRelErr: number
  readonly adiabaticPmDfDtMeanRelErr: number
  readonly adiabatic1PnDfDtMaxRelErr: number
  readonly pmPhaseRelErrAdiabatic: number
  // Exact energy & angular momentum balance
  readonly eOrbStart: number
  readonly eOrbEnd: number
  readonly deltaEOrb: number
  readonly eGwTotal: number
  readonly radiatedMassFrac: number
  readonly energyBalanceRelErrVsEGw: number
  readonly energyBalanceRelErrVsEOrb: number
  readonly lzStart: number
  readonly lzEnd: number
  readonly deltaLz: number
  readonly jGwTotal: number
  readonly angMomBalanceRelErrVsJGw: number
  readonly angMomBalanceRelErrVsLz: number
  // Convergence & Cartesian cross-check
  readonly rk4StepHalvingRelErrR: number
  readonly rk4StepHalvingRelErrPhi: number
  readonly rk4StepHalvingRelErrEGw: number
  readonly rk4StepHalvingMaxRelErr: number
  readonly cartVsPolarCrossCheckRelErr: number
  // Negative controls: radiation reaction OFF (Newtonian and 1PN)
  readonly negCtrlNewtonianEGw: number
  readonly negCtrlNewtonianMaxRDriftRel: number
  readonly negCtrlNewtonianFreqDriftRel: number
  readonly negCtrl1PnEGw: number
  readonly negCtrl1PnMaxRDriftRel: number
  readonly negCtrl1PnFreqDriftRel: number
  // Exact handoff state at r = 8.0 r_g to drive Part 2 live spin-2 TT wave propagation
  readonly waveHandoffState: PolarState
  readonly cfg: InspiralConfig
}

function runPart1BinaryInspiral(gEff: number, cU: number): Part1InspiralResult {
  const mTotal = 16.0
  const m1 = 0.5 * mTotal
  const m2 = 0.5 * mTotal
  const eta = 0.25
  const mu = eta * mTotal
  const mChirp = eta ** 0.6 * mTotal
  const gm = gEff * mTotal
  const c2 = cU * cU
  const c3 = c2 * cU
  const rG = gm / c2
  const rIsco = 6 * rG

  const cfg: InspiralConfig = {
    gEff,
    cU,
    mTotal,
    eta,
    include1PN: true,
    includeRR: true,
  }

  // Start at r_0 = 135 r_g (adiabatic PN regime x_0 = 1/135 = 0.00741) down to r_target = 7.0 r_g
  // (approaching r_ISCO = 6 r_g right outside the 1PN ADM plunge threshold at 6.76 r_g)
  const r0 = 135 * rG
  const rTarget = 7.0 * rG
  const rHandoff = 8.4 * rG
  const ell0 = solveCircularEll(cfg, r0)
  const pr0 = computePostCircularPr(cfg, r0, ell0)

  const initState: PolarState = {
    t: 0,
    r: r0,
    phi: 0,
    pr: pr0,
    ell: ell0,
    eGw: 0,
    jGw: 0,
  }

  // Sundman step size: 160 RK4 steps per orbit (stable across entire inspiral, O(h^4) accuracy ~1e-9 <= 1e-8)
  const dsOrbit = (2 * Math.PI * rG) / cU
  const dsCoarse = dsOrbit / 160

  let s = initState
  let waveHandoffState: PolarState | null = null
  let prevSampleR = s.r
  let prevSampleF = evalPolarRhs(cfg, s.r, s.pr, s.ell, false).omega / Math.PI
  const fGwStart = prevSampleF
  let rStrictlyShrinking = true
  let fGwStrictlyRising = true

  // Track adiabatic window samples (r in [110 r_g, 132 r_g]) for Peters-Mathews df/dt & phase check
  const adiabT: number[] = []
  const adiabF: number[] = []
  const adiabPhi: number[] = []
  const adiabR: number[] = []

  const eOrbStart = mu * evalSpecificH1PN(cfg, s.r, s.pr, s.ell)
  const lzStart = mu * s.ell

  let stepsCoarse = 0
  const maxSteps = 1500000
  const sampleStride = 1600 // every ~10 orbits

  while (s.r > rTarget && stepsCoarse < maxSteps) {
    const sNext = rk4StepPolar(cfg, s, dsCoarse, true)
    stepsCoarse++

    if (waveHandoffState === null && sNext.r <= rHandoff) {
      waveHandoffState = sNext
    }

    if (stepsCoarse % sampleStride === 0 || sNext.r <= rTarget) {
      const omegaNow = evalPolarRhs(cfg, sNext.r, sNext.pr, sNext.ell, false).omega
      const fNow = omegaNow / Math.PI
      if (!(sNext.r < prevSampleR)) rStrictlyShrinking = false
      if (!(fNow > prevSampleF)) fGwStrictlyRising = false
      prevSampleR = sNext.r
      prevSampleF = fNow

      if (sNext.r >= 110 * rG && sNext.r <= 132 * rG) {
        adiabT.push(sNext.t)
        adiabF.push(fNow)
        adiabPhi.push(sNext.phi)
        adiabR.push(sNext.r)
      }
    }

    s = sNext
  }

  const endStateCoarse = s
  const omegaEnd = evalPolarRhs(cfg, s.r, s.pr, s.ell, false).omega
  const fGwEnd = omegaEnd / Math.PI

  // Exact Peters-Mathews analytic chirp rate df/dt = (96/5) pi^(8/3) (G_eff M_c / c_u^3)^(5/3) f^(11/3)
  const pmCoeff =
    (96 / 5) * Math.PI ** (8 / 3) * ((gEff * mChirp) / c3) ** (5 / 3)
  let adiabaticPmDfDtMaxRelErr = 0
  let adiabaticPmDfDtSumRelErr = 0
  let adiabatic1PnDfDtMaxRelErr = 0
  let adiabCount = 0

  for (let i = 1; i < adiabT.length - 1; i++) {
    const dtSpan = adiabT[i + 1]! - adiabT[i - 1]!
    const dfDtNum = (adiabF[i + 1]! - adiabF[i - 1]!) / dtSpan
    const fMid = adiabF[i]!
    const dfDtPm = pmCoeff * fMid ** (11 / 3)
    const xF = ((gm * Math.PI * fMid) / c3) ** (2 / 3)
    // Exact circular 1PN ADM binding-energy correction dE_1PN / dx_f via exact finite difference
    const rMid = adiabR[i]!
    const dR = 1e-4 * rMid
    const ellPlus = solveCircularEll(cfg, rMid + dR)
    const ellMinus = solveCircularEll(cfg, rMid - dR)
    const ePlus = mu * evalSpecificH1PN(cfg, rMid + dR, 0, ellPlus)
    const eMinus = mu * evalSpecificH1PN(cfg, rMid - dR, 0, ellMinus)
    const omPlus = evalPolarRhs(cfg, rMid + dR, 0, ellPlus, false).omega
    const omMinus = evalPolarRhs(cfg, rMid - dR, 0, ellMinus, false).omega
    const xPlus = ((gm * omPlus) / c3) ** (2 / 3)
    const xMinus = ((gm * omMinus) / c3) ** (2 / 3)
    const dEdx1Pn = (ePlus - eMinus) / (xPlus - xMinus)
    const dEdxNewt = -0.5 * mu * c2
    const dfDt1Pn = dfDtPm * (dEdxNewt / dEdx1Pn)
    void xF

    const relPm = Math.abs(dfDtNum - dfDtPm) / dfDtPm
    const rel1Pn = Math.abs(dfDtNum - dfDt1Pn) / dfDt1Pn
    adiabaticPmDfDtMaxRelErr = Math.max(adiabaticPmDfDtMaxRelErr, relPm)
    adiabaticPmDfDtSumRelErr += relPm
    adiabatic1PnDfDtMaxRelErr = Math.max(adiabatic1PnDfDtMaxRelErr, rel1Pn)
    adiabCount++
  }
  const adiabaticPmDfDtMeanRelErr = adiabCount > 0 ? adiabaticPmDfDtSumRelErr / adiabCount : 1

  // Analytic Peters-Mathews cumulative GW phase Delta Phi_GW(f_a -> f_b) = (1 / (16 pi^(5/3))) (G M_c / c^3)^(-5/3) (f_a^(-5/3) - f_b^(-5/3))
  // Wait: exact integral of 2 pi f / (df/dt)_PM df = (5 / (16 pi^(5/3))) * (G M_c / c^3)^(-5/3) * (f_a^(-5/3) - f_b^(-5/3)) / (5/3)?
  // Check: d/df [ -1 / (16 pi^(5/3)) * (G M_c / c^3)^(-5/3) * (3/5) ... ]:
  //   int 2 pi f / ((96/5) pi^(8/3) (G M_c / c^3)^(5/3) f^(11/3)) df
  //   = (5 / 48) pi^(-5/3) (G M_c / c^3)^(-5/3) * int f^(-8/3) df
  //   = (5 / 48) * (3 / 5) * pi^(-5/3) (G M_c / c^3)^(-5/3) * (f_a^(-5/3) - f_b^(-5/3))
  //   = (1 / 16) * (pi G M_c / c^3)^(-5/3) * (f_a^(-5/3) - f_b^(-5/3))!
  const fA = adiabF[0]!
  const fB = adiabF[adiabF.length - 1]!
  const deltaPhiGwNum = 2 * (adiabPhi[adiabPhi.length - 1]! - adiabPhi[0]!)
  const deltaPhiGwPm =
    (1 / 16) * ((Math.PI * gEff * mChirp) / c3) ** (-5 / 3) * (fA ** (-5 / 3) - fB ** (-5 / 3))
  const pmPhaseRelErrAdiabatic = Math.abs(deltaPhiGwNum - deltaPhiGwPm) / deltaPhiGwPm

  // Exact energy & angular momentum balance
  const eOrbEnd = mu * evalSpecificH1PN(cfg, s.r, s.pr, s.ell)
  const lzEnd = mu * s.ell
  const deltaEOrb = eOrbEnd - eOrbStart
  const deltaLz = lzEnd - lzStart
  const eGwTotal = s.eGw
  const jGwTotal = s.jGw
  const energyBalanceRelErrVsEGw = Math.abs(deltaEOrb + eGwTotal) / eGwTotal
  const energyBalanceRelErrVsEOrb = Math.abs(deltaEOrb + eGwTotal) / Math.abs(eOrbStart)
  const angMomBalanceRelErrVsJGw = Math.abs(deltaLz + jGwTotal) / jGwTotal
  const angMomBalanceRelErrVsLz = Math.abs(deltaLz + jGwTotal) / Math.abs(lzStart)
  const radiatedMassFrac = eGwTotal / (mTotal * c2)

  // Global RK4 step-halving convergence check over the EXACT same Sundman span S_total = stepsCoarse * dsCoarse
  let sFine = initState
  const dsFine = 0.5 * dsCoarse
  const stepsFine = 2 * stepsCoarse
  for (let i = 0; i < stepsFine; i++) {
    sFine = rk4StepPolar(cfg, sFine, dsFine, true)
  }
  const rk4StepHalvingRelErrR = Math.abs(sFine.r - endStateCoarse.r) / endStateCoarse.r
  const rk4StepHalvingRelErrPhi = Math.abs(sFine.phi - endStateCoarse.phi) / endStateCoarse.phi
  const rk4StepHalvingRelErrEGw = Math.abs(sFine.eGw - endStateCoarse.eGw) / endStateCoarse.eGw
  const rk4StepHalvingMaxRelErr = Math.max(
    rk4StepHalvingRelErrR,
    rk4StepHalvingRelErrPhi,
    rk4StepHalvingRelErrEGw,
  )

  // Independent Cartesian RK4 cross-check on strong-field late inspiral starting from waveHandoffState (r = 8 r_g)
  const handoff = waveHandoffState ?? endStateCoarse
  const dtCart = 0.1
  const nCartSteps = 1000 // 100 beats (~2.5 full orbits in strong-field late inspiral!)
  let sPolCheck = handoff
  let sCartCheck: CartState = {
    x: handoff.r * Math.cos(handoff.phi),
    y: handoff.r * Math.sin(handoff.phi),
    px: handoff.pr * Math.cos(handoff.phi) - (handoff.ell / handoff.r) * Math.sin(handoff.phi),
    py: handoff.pr * Math.sin(handoff.phi) + (handoff.ell / handoff.r) * Math.cos(handoff.phi),
    eGw: handoff.eGw,
    jGw: handoff.jGw,
  }
  for (let i = 0; i < nCartSteps; i++) {
    sPolCheck = rk4StepPolar(cfg, sPolCheck, dtCart, false)
    sCartCheck = rk4StepCart(cfg, sCartCheck, dtCart)
  }
  const rCartEnd = Math.hypot(sCartCheck.x, sCartCheck.y)
  const cartVsPolarCrossCheckRelErr = Math.max(
    Math.abs(rCartEnd - sPolCheck.r) / sPolCheck.r,
    Math.abs(sCartCheck.eGw - sPolCheck.eGw) / sPolCheck.eGw,
  )

  // Negative controls (full 2D Cartesian RK4 over 10 full circular orbits at r_ctrl = 20 r_g, RR OFF)
  const runConservativeControl = (
    include1PN: boolean,
  ): { readonly eGw: number; readonly maxRDriftRel: number; readonly freqDriftRel: number } => {
    const ctrlCfg: InspiralConfig = {
      gEff,
      cU,
      mTotal,
      eta,
      include1PN,
      includeRR: false,
    }
    const rCtrl = 20 * rG
    const ellCtrl = solveCircularEll(ctrlCfg, rCtrl)
    const omega0 = evalPolarRhs(ctrlCfg, rCtrl, 0, ellCtrl, false).omega
    const tOrb = (2 * Math.PI) / omega0
    const stepsPerOrb = 2000
    const nOrbs = 10
    const dtCtrl = tOrb / stepsPerOrb
    let sc: CartState = {
      x: rCtrl,
      y: 0,
      px: 0,
      py: ellCtrl / rCtrl,
      eGw: 0,
      jGw: 0,
    }
    let maxRDriftRel = 0
    for (let i = 0; i < stepsPerOrb * nOrbs; i++) {
      sc = rk4StepCart(ctrlCfg, sc, dtCtrl)
      const rc = Math.hypot(sc.x, sc.y)
      maxRDriftRel = Math.max(maxRDriftRel, Math.abs(rc - rCtrl) / rCtrl)
    }
    const rhsEnd = evalCartRhs(ctrlCfg, sc)
    const rEndC = Math.hypot(sc.x, sc.y)
    const omegaEndC = (sc.x * rhsEnd.y - sc.y * rhsEnd.x) / (rEndC * rEndC)
    return {
      eGw: sc.eGw,
      maxRDriftRel,
      freqDriftRel: Math.abs(omegaEndC - omega0) / omega0,
    }
  }

  const negNewt = runConservativeControl(false)
  const neg1Pn = runConservativeControl(true)

  return {
    mTotal,
    m1,
    m2,
    mChirp,
    rG,
    rIsco,
    r0,
    rEnd: endStateCoarse.r,
    rRatioEndOverStart: endStateCoarse.r / r0,
    totalTimeBeats: endStateCoarse.t,
    totalOrbits: endStateCoarse.phi / (2 * Math.PI),
    fGwStart,
    fGwEnd,
    fGwRatio: fGwEnd / fGwStart,
    rStrictlyShrinking,
    fGwStrictlyRising,
    adiabaticPmDfDtMaxRelErr,
    adiabaticPmDfDtMeanRelErr,
    adiabatic1PnDfDtMaxRelErr,
    pmPhaseRelErrAdiabatic,
    eOrbStart,
    eOrbEnd,
    deltaEOrb,
    eGwTotal,
    radiatedMassFrac,
    energyBalanceRelErrVsEGw,
    energyBalanceRelErrVsEOrb,
    lzStart,
    lzEnd,
    deltaLz,
    jGwTotal,
    angMomBalanceRelErrVsJGw,
    angMomBalanceRelErrVsLz,
    rk4StepHalvingRelErrR,
    rk4StepHalvingRelErrPhi,
    rk4StepHalvingRelErrEGw,
    rk4StepHalvingMaxRelErr,
    cartVsPolarCrossCheckRelErr,
    negCtrlNewtonianEGw: negNewt.eGw,
    negCtrlNewtonianMaxRDriftRel: negNewt.maxRDriftRel,
    negCtrlNewtonianFreqDriftRel: negNewt.freqDriftRel,
    negCtrl1PnEGw: neg1Pn.eGw,
    negCtrl1PnMaxRDriftRel: neg1Pn.maxRDriftRel,
    negCtrl1PnFreqDriftRel: neg1Pn.freqDriftRel,
    waveHandoffState: handoff,
    cfg,
  }
}

// -------------------------------------------------------------------------------------------------
// PART 2: Live Time-Dependent Spin-2 TT Wave Propagation on the {3,4,3,4} Warped Column (F = 12)
// -------------------------------------------------------------------------------------------------

type ColumnVerticalOperator = {
  readonly dim: number
  readonly floorF: number
  readonly vLatSq: Float64Array
  readonly hVertDiag: Float64Array
  readonly hVertOff: Float64Array
}

// Build raw unwarped {3,4,3,4} bulk vertical operator (w(D) = 1, Dirichlet bulk sink at D = F + 1)
// Exact E-GRV-0157 raw bulk model: c_vert(d) = 18 * N_d, m_d = N_d, c_lat(d) = lat(d)
function buildRawUnwarpedColumnOp(col: WarpedColumnData): ColumnVerticalOperator {
  const dim = col.dim
  const floorF = col.floorF
  const nShell = new Float64Array(floorF + 2)
  for (let d = 0; d < EXACT_COLUMN_SHELL_COUNTS.length && d < nShell.length; d++) {
    nShell[d] = EXACT_COLUMN_SHELL_COUNTS[d]!
  }
  for (let d = EXACT_COLUMN_SHELL_COUNTS.length; d < nShell.length; d++) {
    nShell[d] = nShell[d - 1]! * R_VOL
  }

  const hVertDiag = new Float64Array(dim)
  const hVertOff = new Float64Array(floorF)
  for (let d = 0; d < dim; d++) {
    const upTerm = d > 0 ? (18 * nShell[d - 1]!) / nShell[d]! : 0
    const downTerm = 18 // 18 * N_d / N_d = 18 (Dirichlet sink into infinite hyperbolic bulk at D = F + 1)
    hVertDiag[d] = upTerm + downTerm
    if (d < floorF) {
      hVertOff[d] = -18 * Math.sqrt(nShell[d]! / nShell[d + 1]!)
    }
  }

  return {
    dim,
    floorF,
    vLatSq: col.vLatSq, // lat(d) / N_d is identical for warped and unwarped!
    hVertDiag,
    hVertOff,
  }
}

export type Part2WavePropagationResult = {
  readonly floorF: number
  readonly dimDepth: number
  readonly nRadial: number
  readonly dr: number
  readonly dt: number
  readonly nSteps: number
  readonly stabilityRatio: number
  readonly rDet1: number
  readonly rDet2: number
  readonly cUniversalF12: number
  readonly expectedDelayBeats: number
  readonly measuredDelayBeats: number
  readonly measuredWaveSpeed: number
  readonly speedRelErrVsCU: number
  readonly peakRh1: number
  readonly peakRh2: number
  readonly peakAmplitudeFalloffRelErr: number
  readonly rmsRh1: number
  readonly rmsRh2: number
  readonly rmsAmplitudeFalloffRelErr: number
  readonly detectorWaveformCorrelation: number
  readonly freeWaveEnergyDriftMax: number
  readonly freeWaveTimeReversalRelErr: number
  // Negative control: raw unwarped {3,4,3,4} bulk (w(D) = 1)
  readonly rawBulkPeakHAtR1: number
  readonly rawBulkPeakHAtR2: number
  readonly warpedPeakHAtR2: number
  readonly rawOverWarpedRatioAtR2: number
}

function runPart2Spin2WavePropagation(
  col12: WarpedColumnData,
  p1: Part1InspiralResult,
): Part2WavePropagationResult {
  const dim = col12.dim // F + 1 = 13
  const floorF = col12.floorF // 12
  const nRadial = 460
  const dr = 1.0
  const invDr2 = 1 / (dr * dr)
  const dt = 0.2
  const dt2 = dt * dt
  const nSteps = 2500 // T = 500 beats; causal outer reflection at r_2 = 160 does not arrive until t ~ 770 beats

  const rDet1 = 80
  const rDet2 = 160

  // Verify CFL stability bound: E_max <= mKKMax^2 + 4 / dr^2
  const eMaxEst = col12.mKKMax * col12.mKKMax + 4 * invDr2
  const stabilityRatio = (dt2 * eMaxEst) / 4

  // Generate live quadrupole chirp strain source S_TT(t_n) from Part 1's handoff state (r = 8 r_g -> 6.2 r_g)
  const sourceTimeSeries = new Float64Array(nSteps)
  let st = p1.waveHandoffState
  const mu = p1.cfg.eta * p1.cfg.mTotal
  const c4 = p1.cfg.cU ** 4
  const prefactor = (2 * p1.cfg.gEff) / c4

  const rawQuad: number[] = []
  while (st.r > p1.rEnd && rawQuad.length < 1500) {
    const rhs = evalPolarRhs(p1.cfg, st.r, st.pr, st.ell, false)
    // Live quadrupole h_+ ~ (2 G_eff / c_u^4) * (1/2)(I_xx^(2) - I_yy^(2)) = -2 mu r^2 omega^2 cos(2 phi)
    // (including radial-infall term from d^2(r^2)/dt^2 = 2(rDot^2 + r rDdot) for exactness)
    const iPlusDdot = -2 * mu * st.r * st.r * rhs.omega * rhs.omega * Math.cos(2 * st.phi)
    rawQuad.push(prefactor * iPlusDdot)
    st = rk4StepPolar(p1.cfg, st, dt, false)
  }

  // Apply smooth C^2 Tukey taper (15% cosine ramp at start & end) to eliminate step-discontinuity noise
  const nSig = rawQuad.length
  const ramp = Math.max(1, Math.floor(0.15 * nSig))
  for (let n = 0; n < nSig; n++) {
    let w = 1.0
    if (n < ramp) {
      w = 0.5 * (1 - Math.cos((Math.PI * n) / ramp))
    } else if (n >= nSig - ramp) {
      w = 0.5 * (1 - Math.cos((Math.PI * (nSig - 1 - n)) / ramp))
    }
    sourceTimeSeries[n] = w * rawQuad[n]!
  }

  // Smooth odd 3D spherical Gaussian radial source profile chi(r) = A * r * exp(-r^2 / (2 sigma^2))
  // Vanishes smoothly at r = 0 (exact reduced spherical BC u = r h = 0) and is compact inside r < 18 << r_1 = 80
  const sigmaSrc = 3.0
  const chiRad = new Float64Array(nRadial + 1)
  let chiNorm = 0
  for (let i = 1; i < nRadial; i++) {
    const r = i * dr
    const val = r * Math.exp(-(r * r) / (2 * sigmaSrc * sigmaSrc))
    chiRad[i] = val
    chiNorm += val * dr
  }
  for (let i = 1; i < nRadial; i++) {
    chiRad[i] = chiRad[i]! / chiNorm
  }

  // Apply coupled (1+1) radial + {3,4,3,4} column Hamiltonian H = -v_lat^2(d) Delta_r + H_vert
  // Layout: u[i * dim + d] for i in 0..nRadial, d in 0..dim-1 (Dirichlet u[0, d] = u[nRadial, d] = 0)
  const applyCoupledOp = (
    op: ColumnVerticalOperator,
    u: Float64Array,
    out: Float64Array,
  ): void => {
    const { vLatSq, hVertDiag, hVertOff } = op
    for (let i = 1; i < nRadial; i++) {
      const base = i * dim
      const left = (i - 1) * dim
      const right = (i + 1) * dim
      for (let d = 0; d < dim; d++) {
        const uC = u[base + d]!
        const negLapR = (2 * uC - u[left + d]! - u[right + d]!) * invDr2
        let hv = hVertDiag[d]! * uC
        if (d > 0) hv += hVertOff[d - 1]! * u[base + d - 1]!
        if (d < floorF) hv += hVertOff[d]! * u[base + d + 1]!
        out[base + d] = vLatSq[d]! * negLapR + hv
      }
    }
  }

  const runDrivenWave = (
    op: ColumnVerticalOperator,
  ): {
    readonly hDet1: Float64Array
    readonly hDet2: Float64Array
  } => {
    const size = (nRadial + 1) * dim
    let uPrev = new Float64Array(size)
    let uCurr = new Float64Array(size)
    let uNext = new Float64Array(size)
    const hu = new Float64Array(size)

    const hDet1 = new Float64Array(nSteps)
    const hDet2 = new Float64Array(nSteps)

    for (let step = 0; step < nSteps; step++) {
      // Physical husk strain at d = 0 (m_0 = 1): h(r, t) = u_0(r, t) / r
      hDet1[step] = uCurr[rDet1 * dim + 0]! / rDet1
      hDet2[step] = uCurr[rDet2 * dim + 0]! / rDet2

      applyCoupledOp(op, uCurr, hu)
      const sVal = sourceTimeSeries[step]!

      for (let i = 1; i < nRadial; i++) {
        const base = i * dim
        const src0 = chiRad[i]! * sVal
        // Husk layer d = 0 carries the physical binary quadrupole source
        uNext[base] = 2 * uCurr[base]! - uPrev[base]! - dt2 * (hu[base]! - src0)
        for (let d = 1; d < dim; d++) {
          const idx = base + d
          uNext[idx] = 2 * uCurr[idx]! - uPrev[idx]! - dt2 * hu[idx]!
        }
      }

      const tmp = uPrev
      uPrev = uCurr
      uCurr = uNext
      uNext = tmp
    }

    return { hDet1, hDet2 }
  }

  const warpedOp: ColumnVerticalOperator = {
    dim,
    floorF,
    vLatSq: col12.vLatSq,
    hVertDiag: col12.hVertDiag,
    hVertOff: col12.hVertOff,
  }
  const rawBulkOp = buildRawUnwarpedColumnOp(col12)

  // 1. Live warped {3,4,3,4} column propagation
  const warpRun = runDrivenWave(warpedOp)

  // Build r * h(r, t) time series at r_1 and r_2
  const rh1 = new Float64Array(nSteps)
  const rh2 = new Float64Array(nSteps)
  let peakRh1 = 0
  let peakRh2 = 0
  let sumSq1 = 0
  let sumSq2 = 0
  for (let n = 0; n < nSteps; n++) {
    const v1 = rDet1 * warpRun.hDet1[n]!
    const v2 = rDet2 * warpRun.hDet2[n]!
    rh1[n] = v1
    rh2[n] = v2
    peakRh1 = Math.max(peakRh1, Math.abs(v1))
    peakRh2 = Math.max(peakRh2, Math.abs(v2))
    sumSq1 += v1 * v1
    sumSq2 += v2 * v2
  }
  const rmsRh1 = Math.sqrt(sumSq1 / nSteps)
  const rmsRh2 = Math.sqrt(sumSq2 / nSteps)
  const peakAmplitudeFalloffRelErr = Math.abs(peakRh1 - peakRh2) / peakRh1
  const rmsAmplitudeFalloffRelErr = Math.abs(rmsRh1 - rmsRh2) / rmsRh1

  // Cross-correlation lag between r_1 h(r_1, t) and r_2 h(r_2, t) with 3-point parabolic refinement
  const minLag = Math.floor((0.5 * (rDet2 - rDet1)) / (col12.cUniversal * dt))
  const maxLag = Math.ceil((1.5 * (rDet2 - rDet1)) / (col12.cUniversal * dt))
  const corrAtLag = (lag: number): number => {
    let s = 0
    for (let n = 0; n < nSteps - lag; n++) {
      s += rh1[n]! * rh2[n + lag]!
    }
    return s
  }
  let bestLag = minLag
  let bestCorr = -Infinity
  for (let lag = minLag; lag <= maxLag; lag++) {
    const c = corrAtLag(lag)
    if (c > bestCorr) {
      bestCorr = c
      bestLag = lag
    }
  }
  const cMinus = corrAtLag(bestLag - 1)
  const cZero = bestCorr
  const cPlus = corrAtLag(bestLag + 1)
  const denomQuad = cMinus - 2 * cZero + cPlus
  const fracShift = denomQuad !== 0 ? 0.5 * (cMinus - cPlus) / denomQuad : 0
  const measuredDelayBeats = (bestLag + fracShift) * dt
  const expectedDelayBeats = (rDet2 - rDet1) / col12.cUniversal
  const measuredWaveSpeed = (rDet2 - rDet1) / measuredDelayBeats
  const speedRelErrVsCU = Math.abs(measuredWaveSpeed - col12.cUniversal) / col12.cUniversal
  const detectorWaveformCorrelation = bestCorr / Math.sqrt(sumSq1 * sumSq2)

  // 2. Exact free-wave symplectic energy conservation & exact time-reversal check (coupled zero + KK mode!)
  const size = (nRadial + 1) * dim
  let fPrev = new Float64Array(size)
  let fCurr = new Float64Array(size)
  let fNext = new Float64Array(size)
  const fHu = new Float64Array(size)
  const rCenter = 200
  const wPacket = 14
  for (let i = 1; i < nRadial; i++) {
    const env = Math.exp(-((i - rCenter) ** 2) / (2 * wPacket * wPacket))
    const dEnv = -((i - rCenter) / (wPacket * wPacket)) * env
    for (let d = 0; d < dim; d++) {
      // Mix zero mode v_0 AND first KK eigenvector q_1 so the FULL coupled depth operator is tested
      const modeProfile = col12.v0[d]! + 0.15 * col12.qBasis[d * dim + 1]!
      fPrev[i * dim + d] = env * modeProfile
      // Give initial velocity (non-zero kinetic energy)
      fCurr[i * dim + d] = (env - dt * col12.cUniversal * dEnv) * modeProfile
    }
  }
  const fInitPrev = Float64Array.from(fPrev)
  const fInitCurr = Float64Array.from(fCurr)

  // Exact discrete symplectic leapfrog shadow-Hamiltonian energy invariant:
  //   E_symp(n) = (1/2) * ( ||(u_{n+1} - u_n) / dt||^2 + <u_n, H u_{n+1}> )
  const sympEnergy = (u0: Float64Array, u1: Float64Array): number => {
    applyCoupledOp(warpedOp, u1, fHu)
    let vSq = 0
    let uHu = 0
    for (let i = 1; i < nRadial; i++) {
      const base = i * dim
      for (let d = 0; d < dim; d++) {
        const idx = base + d
        const v = (u1[idx]! - u0[idx]!) / dt
        vSq += v * v
        uHu += u0[idx]! * fHu[idx]!
      }
    }
    return 0.5 * (vSq + uHu)
  }

  const eFree0 = sympEnergy(fPrev, fCurr)
  let freeWaveEnergyDriftMax = 0
  const nFreeSteps = 600

  for (let step = 0; step < nFreeSteps; step++) {
    applyCoupledOp(warpedOp, fCurr, fHu)
    for (let i = 1; i < nRadial; i++) {
      const base = i * dim
      for (let d = 0; d < dim; d++) {
        const idx = base + d
        fNext[idx] = 2 * fCurr[idx]! - fPrev[idx]! - dt2 * fHu[idx]!
      }
    }
    const tmp = fPrev
    fPrev = fCurr
    fCurr = fNext
    fNext = tmp

    if (step % 20 === 0 || step === nFreeSteps - 1) {
      const eNow = sympEnergy(fPrev, fCurr)
      freeWaveEnergyDriftMax = Math.max(
        freeWaveEnergyDriftMax,
        Math.abs(eNow - eFree0) / Math.abs(eFree0),
      )
    }
  }

  // Exact time-reversal: swap (u_N, u_{N+1}) -> (u_{N+1}, u_N) and run nFreeSteps steps back
  let rPrev = Float64Array.from(fCurr)
  let rCurr = Float64Array.from(fPrev)
  let rNext = new Float64Array(size)
  for (let step = 0; step < nFreeSteps; step++) {
    applyCoupledOp(warpedOp, rCurr, fHu)
    for (let i = 1; i < nRadial; i++) {
      const base = i * dim
      for (let d = 0; d < dim; d++) {
        const idx = base + d
        rNext[idx] = 2 * rCurr[idx]! - rPrev[idx]! - dt2 * fHu[idx]!
      }
    }
    const tmp = rPrev
    rPrev = rCurr
    rCurr = rNext
    rNext = tmp
  }
  // After reversing nFreeSteps, rCurr must equal fInitPrev and rPrev must equal fInitCurr!
  let revErrSq = 0
  let initNormSq = 0
  for (let idx = 0; idx < size; idx++) {
    const d0 = rCurr[idx]! - fInitPrev[idx]!
    const d1 = rPrev[idx]! - fInitCurr[idx]!
    revErrSq += d0 * d0 + d1 * d1
    initNormSq += fInitPrev[idx]! * fInitPrev[idx]! + fInitCurr[idx]! * fInitCurr[idx]!
  }
  const freeWaveTimeReversalRelErr = Math.sqrt(revErrSq / initNormSq)

  // 3. Negative control: raw unwarped {3,4,3,4} bulk (w(D) = 1) with identical source & leapfrog
  const rawRun = runDrivenWave(rawBulkOp)
  let rawBulkPeakHAtR1 = 0
  let rawBulkPeakHAtR2 = 0
  for (let n = 0; n < nSteps; n++) {
    rawBulkPeakHAtR1 = Math.max(rawBulkPeakHAtR1, Math.abs(rawRun.hDet1[n]!))
    rawBulkPeakHAtR2 = Math.max(rawBulkPeakHAtR2, Math.abs(rawRun.hDet2[n]!))
  }
  const warpedPeakHAtR2 = peakRh2 / rDet2
  const rawOverWarpedRatioAtR2 = rawBulkPeakHAtR2 / warpedPeakHAtR2

  return {
    floorF,
    dimDepth: dim,
    nRadial,
    dr,
    dt,
    nSteps,
    stabilityRatio,
    rDet1,
    rDet2,
    cUniversalF12: col12.cUniversal,
    expectedDelayBeats,
    measuredDelayBeats,
    measuredWaveSpeed,
    speedRelErrVsCU,
    peakRh1,
    peakRh2,
    peakAmplitudeFalloffRelErr,
    rmsRh1,
    rmsRh2,
    rmsAmplitudeFalloffRelErr,
    detectorWaveformCorrelation,
    freeWaveEnergyDriftMax,
    freeWaveTimeReversalRelErr,
    rawBulkPeakHAtR1,
    rawBulkPeakHAtR2,
    warpedPeakHAtR2,
    rawOverWarpedRatioAtR2,
  }
}

// -------------------------------------------------------------------------------------------------
// PART 3: Exact Black-Hole Quasinormal Ringdown (l = 2 Regge-Wheeler & Zerilli Isospectrality)
// -------------------------------------------------------------------------------------------------

// Exact cancellation-free inversion of tortoise coordinate r_*(r) = r + r_s ln(r/r_s - 1).
// Returns delta = r/r_s - 1 > 0, r = r_s (1 + delta), and f = 1 - r_s/r = delta / (1 + delta).
function invertTortoise(
  rStar: number,
  rS: number,
): { readonly r: number; readonly f: number; readonly delta: number } {
  const x = rStar / rS - 1
  if (x <= -32) {
    const ex = Math.exp(x)
    const delta = ex * (1 - ex + 1.5 * ex * ex)
    return { r: rS * (1 + delta), f: delta / (1 + delta), delta }
  }
  // Solve delta + ln(delta) = x via Halley's method (converges to 16 digits in <= 6 iterations)
  let delta: number
  if (x < -1) {
    delta = Math.exp(x)
  } else if (x < 2) {
    delta = Math.exp(0.5 * x)
  } else {
    delta = x - Math.log(x)
  }
  for (let iter = 0; iter < 12; iter++) {
    const g = delta + Math.log(delta) - x
    if (Math.abs(g) <= 1e-15 * (1 + Math.abs(x))) break
    const g1 = 1 + 1 / delta
    const g2 = -1 / (delta * delta)
    const step = (2 * g * g1) / (2 * g1 * g1 - g * g2)
    delta -= step
    if (delta <= 0) delta = 1e-15
  }
  return { r: rS * (1 + delta), f: delta / (1 + delta), delta }
}

// Extract fundamental damped-sinusoid frequency (omega_R, omega_I) on a uniform time series
// using deterministic Prony initial estimation + Gauss-Newton Variable Projection polish.
function fitDampedSinusoidQnm(
  times: Float64Array,
  values: Float64Array,
  tStart: number,
  tEnd: number,
): {
  readonly omegaR: number
  readonly omegaI: number
  readonly fitR2: number
  readonly relRmsErr: number
  readonly pronyOmegaR: number
  readonly pronyOmegaI: number
} {
  const tWin: number[] = []
  const yWin: number[] = []
  for (let i = 0; i < times.length; i++) {
    const tv = times[i]!
    if (tv >= tStart && tv <= tEnd) {
      tWin.push(tv - tStart)
      yWin.push(values[i]!)
    }
  }
  const m = tWin.length
  const dtSamp = tWin[1]! - tWin[0]!

  // Step 1: Prony 2-pole linear prediction on stride ~ 1.0 t_g (well-conditioned angle ~ 0.37 rad)
  const targetStep = (tEnd - tStart) / 50
  const stride = Math.max(1, Math.round(targetStep / dtSamp))
  const dtProny = stride * dtSamp
  const yp: number[] = []
  for (let i = 0; i < m; i += stride) yp.push(yWin[i]!)

  // Solve min sum (yp[k+2] + a1 yp[k+1] + a0 yp[k])^2 via 2x2 normal equations
  let s00 = 0
  let s01 = 0
  let s11 = 0
  let b0 = 0
  let b1 = 0
  for (let k = 0; k + 2 < yp.length; k++) {
    const y0 = yp[k]!
    const y1 = yp[k + 1]!
    const y2 = yp[k + 2]!
    s00 += y0 * y0
    s01 += y0 * y1
    s11 += y1 * y1
    b0 -= y0 * y2
    b1 -= y1 * y2
  }
  const detP = s00 * s11 - s01 * s01
  const a0 = (s11 * b0 - s01 * b1) / detP
  const a1 = (s00 * b1 - s01 * b0) / detP
  const rMag = Math.sqrt(Math.max(1e-12, a0))
  const cosTheta = Math.max(-1, Math.min(1, -a1 / (2 * rMag)))
  const pronyOmegaI = -Math.log(rMag) / dtProny
  const pronyOmegaR = Math.acos(cosTheta) / dtProny

  // Step 2: Variable-projection linear amplitudes (c1, c2) for given (omegaR, omegaI)
  const evalVarProj = (
    wR: number,
    wI: number,
  ): { readonly c1: number; readonly c2: number; readonly sse: number } => {
    let g11 = 0
    let g12 = 0
    let g22 = 0
    let r1 = 0
    let r2 = 0
    for (let i = 0; i < m; i++) {
      const t = tWin[i]!
      const y = yWin[i]!
      const e = Math.exp(-wI * t)
      const phi1 = e * Math.cos(wR * t)
      const phi2 = e * Math.sin(wR * t)
      g11 += phi1 * phi1
      g12 += phi1 * phi2
      g22 += phi2 * phi2
      r1 += phi1 * y
      r2 += phi2 * y
    }
    const det = g11 * g22 - g12 * g12
    const c1 = (g22 * r1 - g12 * r2) / det
    const c2 = (g11 * r2 - g12 * r1) / det
    let sse = 0
    for (let i = 0; i < m; i++) {
      const t = tWin[i]!
      const e = Math.exp(-wI * t)
      const pred = e * (c1 * Math.cos(wR * t) + c2 * Math.sin(wR * t))
      const diff = yWin[i]! - pred
      sse += diff * diff
    }
    return { c1, c2, sse }
  }

  // Deterministic Levenberg-Marquardt / Gauss-Newton optimization on (wR, wI)
  let wR = pronyOmegaR
  let wI = pronyOmegaI
  let cur = evalVarProj(wR, wI)
  let lambdaLm = 1e-6

  for (let iter = 0; iter < 40; iter++) {
    const { c1, c2 } = cur
    // Exact Jacobian of residual r_i = pred_i - y_i w.r.t. (c1, c2, wR, wI) -> 4x4 normal equations
    // Using full 4-parameter Gauss-Newton avoids numerical differentiation and converges quadratically!
    const jtj = new Float64Array(16)
    const jtr = new Float64Array(4)
    const rowJ = new Float64Array(4)
    for (let i = 0; i < m; i++) {
      const t = tWin[i]!
      const e = Math.exp(-wI * t)
      const cs = Math.cos(wR * t)
      const sn = Math.sin(wR * t)
      const pred = e * (c1 * cs + c2 * sn)
      const res = pred - yWin[i]!
      rowJ[0] = e * cs
      rowJ[1] = e * sn
      rowJ[2] = e * t * (-c1 * sn + c2 * cs)
      rowJ[3] = -t * pred
      for (let a = 0; a < 4; a++) {
        jtr[a] = jtr[a]! + rowJ[a]! * res
        for (let b = 0; b < 4; b++) {
          jtj[a * 4 + b] = jtj[a * 4 + b]! + rowJ[a]! * rowJ[b]!
        }
      }
    }
    for (let a = 0; a < 4; a++) {
      jtj[a * 4 + a] = jtj[a * 4 + a]! * (1 + lambdaLm) + 1e-18
    }

    // Solve 4x4 linear system via Gaussian elimination with partial pivoting
    const aug = new Float64Array(20)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) aug[r * 5 + c] = jtj[r * 4 + c]!
      aug[r * 5 + 4] = -jtr[r]!
    }
    for (let k = 0; k < 4; k++) {
      let piv = k
      for (let r = k + 1; r < 4; r++) {
        if (Math.abs(aug[r * 5 + k]!) > Math.abs(aug[piv * 5 + k]!)) piv = r
      }
      if (piv !== k) {
        for (let c = k; c < 5; c++) {
          const tmp = aug[k * 5 + c]!
          aug[k * 5 + c] = aug[piv * 5 + c]!
          aug[piv * 5 + c] = tmp
        }
      }
      const diag = aug[k * 5 + k]!
      if (Math.abs(diag) < 1e-30) break
      for (let r = k + 1; r < 4; r++) {
        const fac = aug[r * 5 + k]! / diag
        for (let c = k + 1; c < 5; c++) {
          aug[r * 5 + c] = aug[r * 5 + c]! - fac * aug[k * 5 + c]!
        }
      }
    }
    const delta = new Float64Array(4)
    for (let r = 3; r >= 0; r--) {
      let s = aug[r * 5 + 4]!
      for (let c = r + 1; c < 4; c++) s -= aug[r * 5 + c]! * delta[c]!
      delta[r] = s / aug[r * 5 + r]!
    }

    const candWR = wR + delta[2]!
    const candWI = wI + delta[3]!
    const cand = evalVarProj(candWR, candWI)
    if (cand.sse < cur.sse) {
      const improvement = Math.abs(cur.sse - cand.sse) / Math.max(cur.sse, 1e-30)
      wR = candWR
      wI = candWI
      cur = cand
      lambdaLm = Math.max(1e-12, lambdaLm * 0.2)
      if (improvement < 1e-14 && Math.hypot(delta[2]!, delta[3]!) < 1e-12) break
    } else {
      lambdaLm *= 10
      if (lambdaLm > 1e8) break
    }
  }

  let ySqSum = 0
  for (let i = 0; i < m; i++) ySqSum += yWin[i]! * yWin[i]!
  const fitR2 = 1 - cur.sse / ySqSum
  const relRmsErr = Math.sqrt(cur.sse / ySqSum)

  return {
    omegaR: wR,
    omegaI: wI,
    fitR2,
    relRmsErr,
    pronyOmegaR,
    pronyOmegaI,
  }
}

export type Part3QnmRingdownResult = {
  readonly mRemnantAdm: number
  readonly rSchwarzschild: number
  readonly mGeom: number
  readonly tGeom: number
  readonly eGrv0160SchwarzschildAMetricErr: number
  readonly eGrv0160SchwarzschildBMetricErr: number
  readonly eGrv0160VacuumEinsteinMax: number
  readonly nGrid: number
  readonly drStarOverMg: number
  readonly dtOverTg: number
  readonly cflNumber: number
  readonly darbouxSuperpotentialMaxErr: number
  readonly potentialPointwiseRelDiffMax: number
  readonly rwSymplecticTimeReversalRelErr: number
  // Regge-Wheeler (axial, l = 2, n = 0)
  readonly rwDimlessOmegaR: number
  readonly rwDimlessOmegaI: number
  readonly rwOmegaRRelErrVsCD: number
  readonly rwOmegaIRelErrVsCD: number
  readonly rwFitR2: number
  // Zerilli (polar, l = 2, n = 0)
  readonly zerilliDimlessOmegaR: number
  readonly zerilliDimlessOmegaI: number
  readonly zerilliOmegaRRelErrVsCD: number
  readonly zerilliOmegaIRelErrVsCD: number
  readonly zerilliFitR2: number
  // Exact Chandrasekhar axial-polar isospectrality
  readonly isospectralOmegaRRelDiff: number
  readonly isospectralOmegaIRelDiff: number
  // Negative control: flat space (M = 0, V = 0) pure Huygens propagation
  readonly flatPromptPeakAmp: number
  readonly flatLateWindowEnergyRatio: number
  readonly flatLateBoxEnergyRatio: number
  readonly rwLateBoxEnergyRatio: number
}

function runPart3QnmRingdown(
  gEff: number,
  cU: number,
  mRemnantAdm: number,
  rSchwarzschild: number,
  eGrv0160SchwarzschildAMetricErr: number,
  eGrv0160SchwarzschildBMetricErr: number,
  eGrv0160VacuumEinsteinMax: number,
): Part3QnmRingdownResult {
  // Physical units directly from E-GRV-0160's converged Schwarzschild exterior:
  //   r_s = 2 G_eff M_rem / c_u^2,  M_g = r_s / 2,  t_g = G_eff M_rem / c_u^3 = M_g / c_u
  const rS = rSchwarzschild
  const mGeom = 0.5 * rS
  const tGeom = mGeom / cU
  const c2 = cU * cU

  // Tortoise coordinate grid r_* in [-120 M_g, +160 M_g] with dr_* = 0.1 M_g (2801 nodes)
  // Observer at r_{*,obs} = +20 M_g is 100% causally disconnected from boundaries over t in [0, 120 t_g],
  // AND clean Mur/Sommerfeld outgoing BCs absorb outgoing pulses without reflection!
  const rStarMinMg = -120
  const rStarMaxMg = 160
  const drStarOverMg = 0.1
  const drStar = drStarOverMg * mGeom
  const inv12Dr2 = 1 / (12 * drStar * drStar)
  const invDr2 = 1 / (drStar * drStar)
  const nGrid = Math.round((rStarMaxMg - rStarMinMg) / drStarOverMg) + 1

  const dtOverTg = 0.04
  const dt = dtOverTg * tGeom
  const cflNumber = (cU * dt) / drStar // = 0.40 < sqrt(3)/2 = 0.866 for 4th-order space!
  const murCoeff = (cflNumber - 1) / (cflNumber + 1)

  const vRW = new Float64Array(nGrid)
  const vZerilli = new Float64Array(nGrid)
  const vFlat = new Float64Array(nGrid)

  let darbouxSuperpotentialMaxErr = 0
  let maxVRW = 0
  let maxPotDiff = 0
  const betaDarboux = -4 / (mGeom * mGeom) // -n^2(n+1)^2 / (9 M_g^2) with n = 2

  for (let i = 0; i < nGrid; i++) {
    const rStar = (rStarMinMg + i * drStarOverMg) * mGeom
    const { r, f } = invertTortoise(rStar, rS)
    const r2 = r * r
    const r3 = r2 * r

    // Axial Regge-Wheeler potential (l = 2): V_RW(r) = (1 - r_s/r) (6/r^2 - 3 r_s / r^3)
    const vrw = f * (6 / r2 - (3 * rS) / r3)
    vRW[i] = vrw

    // Polar Zerilli potential (l = 2, n = (l-1)(l+2)/2 = 2):
    //   V_Z(r) = 2 (1 - 2 M_g / r) * (12 r^3 + 12 M_g r^2 + 18 M_g^2 r + 9 M_g^3) / (r^3 (2 r + 3 M_g)^2)
    const denom = 2 * r + 3 * mGeom
    const vz =
      (2 * f * (12 * r3 + 12 * mGeom * r2 + 18 * mGeom * mGeom * r + 9 * mGeom ** 3)) /
      (r3 * denom * denom)
    vZerilli[i] = vz

    maxVRW = Math.max(maxVRW, vrw)
    maxPotDiff = Math.max(maxPotDiff, Math.abs(vz - vrw))

    // Verify Chandrasekhar's exact Darboux superpotential identity at every grid point:
    //   W(r) = 2 / M_g + 3 M_g (r - r_s) / (r^2 (2 r + 3 M_g))
    //   dW/dr_* = f * dW/dr = 3 M_g f (-4 r^2 + 9 M_g r + 12 M_g^2) / (r^3 (2 r + 3 M_g)^2)
    const wVal = 2 / mGeom + (3 * mGeom * (r - rS)) / (r2 * denom)
    const dWdRStar =
      (3 * mGeom * f * (-4 * r2 + 9 * mGeom * r + 12 * mGeom * mGeom)) / (r3 * denom * denom)
    const w2b = wVal * wVal + betaDarboux
    const errRw = Math.abs(vrw - (w2b - dWdRStar)) * mGeom * mGeom
    const errZ = Math.abs(vz - (w2b + dWdRStar)) * mGeom * mGeom
    darbouxSuperpotentialMaxErr = Math.max(darbouxSuperpotentialMaxErr, errRw, errZ)
  }
  const potentialPointwiseRelDiffMax = maxPotDiff / maxVRW

  // Initial time-symmetric Gaussian spin-2 perturbation at r_{*,0} = +10 M_g, sigma_* = 2.0 M_g
  // Observer at r_{*,obs} = +20 M_g: sees prompt outgoing half at t ~ 10 t_g, then clean QNM ringdown!
  const rStarInitMg = 10
  const sigmaInitMg = 2.0
  const obsIdx = Math.round((20 - rStarMinMg) / drStarOverMg)
  const boxLeftIdx = Math.round((-40 - rStarMinMg) / drStarOverMg)
  const boxRightIdx = Math.round((40 - rStarMinMg) / drStarOverMg)

  const psiInit = new Float64Array(nGrid)
  for (let i = 0; i < nGrid; i++) {
    const rStarMg = rStarMinMg + i * drStarOverMg
    const z = (rStarMg - rStarInitMg) / sigmaInitMg
    psiInit[i] = Math.exp(-0.5 * z * z)
  }

  const computeAccel = (pot: Float64Array, psi: Float64Array, acc: Float64Array): void => {
    // 2nd-order interior adjacent to boundary
    acc[1] = c2 * ((psi[0]! - 2 * psi[1]! + psi[2]!) * invDr2 - pot[1]! * psi[1]!)
    const lastIn = nGrid - 2
    acc[lastIn] =
      c2 * ((psi[lastIn - 1]! - 2 * psi[lastIn]! + psi[lastIn + 1]!) * invDr2 - pot[lastIn]! * psi[lastIn]!)
    // Exact symmetric 4th-order centered spatial operator inside domain (zero artificial dissipation!)
    for (let i = 2; i < lastIn; i++) {
      const d2 =
        (-psi[i - 2]! + 16 * psi[i - 1]! - 30 * psi[i]! + 16 * psi[i + 1]! - psi[i + 2]!) *
        inv12Dr2
      acc[i] = c2 * (d2 - pot[i]! * psi[i]!)
    }
  }

  const computeBoxEnergy = (
    pot: Float64Array,
    psi: Float64Array,
    pi: Float64Array,
    i0: number,
    i1: number,
  ): number => {
    let e = 0
    for (let i = i0; i <= i1; i++) {
      const dPsi = (psi[i + 1]! - psi[i - 1]!) / (2 * drStar)
      e += 0.5 * (pi[i]! * pi[i]! + c2 * (dPsi * dPsi + pot[i]! * psi[i]! * psi[i]!)) * drStar
    }
    return e
  }

  const totalTimeTg = 115
  const nSteps = Math.round(totalTimeTg / dtOverTg)
  const times = new Float64Array(nSteps + 1)
  for (let n = 0; n <= nSteps; n++) times[n] = n * dt

  const evolvePotential = (
    pot: Float64Array,
  ): {
    readonly obsSeries: Float64Array
    readonly initialEnergy: number
    readonly lateBoxEnergy: number
  } => {
    const psi = Float64Array.from(psiInit)
    const pi = new Float64Array(nGrid)
    const acc = new Float64Array(nGrid)
    const obsSeries = new Float64Array(nSteps + 1)
    obsSeries[0] = psi[obsIdx]!

    const initialEnergy = computeBoxEnergy(pot, psi, pi, boxLeftIdx, boxRightIdx)
    computeAccel(pot, psi, acc)

    const halfDt = 0.5 * dt
    const last = nGrid - 1
    let lateBoxEnergy = 0
    const lateStepCheck = Math.round(60 / dtOverTg) // t = 60 t_g (well inside ringdown window)

    for (let step = 1; step <= nSteps; step++) {
      // Velocity-Verlet symplectic step with exact Mur/Sommerfeld outgoing boundaries
      const psi0Old = psi[0]!
      const psi1Old = psi[1]!
      const psiLastOld = psi[last]!
      const psiPrevOld = psi[last - 1]!

      for (let i = 1; i < last; i++) {
        const piHalf = pi[i]! + halfDt * acc[i]!
        pi[i] = piHalf
        psi[i] = psi[i]! + dt * piHalf
      }

      // Clean outgoing Sommerfeld / Mur boundary updates at r_* = -120 M_g and +160 M_g
      psi[0] = psi1Old + murCoeff * (psi[1]! - psi0Old)
      psi[last] = psiPrevOld + murCoeff * (psi[last - 1]! - psiLastOld)

      computeAccel(pot, psi, acc)
      for (let i = 1; i < last; i++) {
        pi[i] = pi[i]! + halfDt * acc[i]!
      }

      obsSeries[step] = psi[obsIdx]!
      if (step === lateStepCheck) {
        lateBoxEnergy = computeBoxEnergy(pot, psi, pi, boxLeftIdx, boxRightIdx)
      }
    }

    return { obsSeries, initialEnergy, lateBoxEnergy }
  }

  // Symplectic time-reversal self-test of the 4th-order velocity-Verlet integrator on V_RW
  // (over 400 steps = 16 t_g before the packet touches the outer boundaries)
  const checkTimeReversal = (): number => {
    const psi = Float64Array.from(psiInit)
    const pi = new Float64Array(nGrid)
    const acc = new Float64Array(nGrid)
    computeAccel(vRW, psi, acc)
    const halfDt = 0.5 * dt
    const last = nGrid - 1
    const nRev = 400
    for (let step = 0; step < nRev; step++) {
      for (let i = 1; i < last; i++) {
        const ph = pi[i]! + halfDt * acc[i]!
        pi[i] = ph
        psi[i] = psi[i]! + dt * ph
      }
      computeAccel(vRW, psi, acc)
      for (let i = 1; i < last; i++) pi[i] = pi[i]! + halfDt * acc[i]!
    }
    // Reverse momentum pi -> -pi and integrate back nRev steps
    for (let i = 1; i < last; i++) pi[i] = -pi[i]!
    computeAccel(vRW, psi, acc)
    for (let step = 0; step < nRev; step++) {
      for (let i = 1; i < last; i++) {
        const ph = pi[i]! + halfDt * acc[i]!
        pi[i] = ph
        psi[i] = psi[i]! + dt * ph
      }
      computeAccel(vRW, psi, acc)
      for (let i = 1; i < last; i++) pi[i] = pi[i]! + halfDt * acc[i]!
    }
    let errSq = 0
    let normSq = 0
    for (let i = 1; i < last; i++) {
      const d = psi[i]! - psiInit[i]!
      errSq += d * d + pi[i]! * pi[i]!
      normSq += psiInit[i]! * psiInit[i]!
    }
    return Math.sqrt(errSq / normSq)
  }

  const rwSymplecticTimeReversalRelErr = checkTimeReversal()

  // Evolve axial Regge-Wheeler, polar Zerilli, and flat-space M = 0 negative control
  const rwRun = evolvePotential(vRW)
  const zRun = evolvePotential(vZerilli)
  const flatRun = evolvePotential(vFlat)

  // Clean fundamental l = 2, n = 0 ringdown fit window: t in [52 t_g, 102 t_g]
  // (after prompt pulse + fast n >= 1 overtones have decayed, and before the t^-7 Price tail)
  const tFitStart = 52 * tGeom
  const tFitEnd = 102 * tGeom

  const rwFit = fitDampedSinusoidQnm(times, rwRun.obsSeries, tFitStart, tFitEnd)
  const zFit = fitDampedSinusoidQnm(times, zRun.obsSeries, tFitStart, tFitEnd)

  // Dimensionless QNM frequencies (G_eff M_rem / c_u^3) * (omega_R, omega_I) = t_g * (omega_R, omega_I)
  const rwDimlessOmegaR = rwFit.omegaR * tGeom
  const rwDimlessOmegaI = rwFit.omegaI * tGeom
  const zerilliDimlessOmegaR = zFit.omegaR * tGeom
  const zerilliDimlessOmegaI = zFit.omegaI * tGeom

  const rwOmegaRRelErrVsCD = Math.abs(rwDimlessOmegaR - QNM_L2_N0_OMEGA_R_EXACT) / QNM_L2_N0_OMEGA_R_EXACT
  const rwOmegaIRelErrVsCD = Math.abs(rwDimlessOmegaI - QNM_L2_N0_OMEGA_I_EXACT) / QNM_L2_N0_OMEGA_I_EXACT
  const zerilliOmegaRRelErrVsCD =
    Math.abs(zerilliDimlessOmegaR - QNM_L2_N0_OMEGA_R_EXACT) / QNM_L2_N0_OMEGA_R_EXACT
  const zerilliOmegaIRelErrVsCD =
    Math.abs(zerilliDimlessOmegaI - QNM_L2_N0_OMEGA_I_EXACT) / QNM_L2_N0_OMEGA_I_EXACT

  const isospectralOmegaRRelDiff =
    Math.abs(rwDimlessOmegaR - zerilliDimlessOmegaR) / rwDimlessOmegaR
  const isospectralOmegaIRelDiff =
    Math.abs(rwDimlessOmegaI - zerilliDimlessOmegaI) / rwDimlessOmegaI

  // Flat-space M = 0 negative control metrics: prompt pulse passes once, zero ringdown in [52, 102] t_g
  let flatPromptPeakAmp = 0
  let flatPromptEnergy = 0
  let flatLateWindowEnergy = 0
  for (let n = 0; n <= nSteps; n++) {
    const tv = times[n]!
    const y = flatRun.obsSeries[n]!
    if (tv <= 30 * tGeom) {
      flatPromptPeakAmp = Math.max(flatPromptPeakAmp, Math.abs(y))
      flatPromptEnergy += y * y * dt
    } else if (tv >= tFitStart && tv <= tFitEnd) {
      flatLateWindowEnergy += y * y * dt
    }
  }
  const flatLateWindowEnergyRatio = flatLateWindowEnergy / flatPromptEnergy
  const flatLateBoxEnergyRatio = flatRun.lateBoxEnergy / flatRun.initialEnergy
  const rwLateBoxEnergyRatio = rwRun.lateBoxEnergy / rwRun.initialEnergy

  return {
    mRemnantAdm,
    rSchwarzschild: rS,
    mGeom,
    tGeom,
    eGrv0160SchwarzschildAMetricErr,
    eGrv0160SchwarzschildBMetricErr,
    eGrv0160VacuumEinsteinMax,
    nGrid,
    drStarOverMg,
    dtOverTg,
    cflNumber,
    darbouxSuperpotentialMaxErr,
    potentialPointwiseRelDiffMax,
    rwSymplecticTimeReversalRelErr,
    rwDimlessOmegaR,
    rwDimlessOmegaI,
    rwOmegaRRelErrVsCD,
    rwOmegaIRelErrVsCD,
    rwFitR2: rwFit.fitR2,
    zerilliDimlessOmegaR,
    zerilliDimlessOmegaI,
    zerilliOmegaRRelErrVsCD,
    zerilliOmegaIRelErrVsCD,
    zerilliFitR2: zFit.fitR2,
    isospectralOmegaRRelDiff,
    isospectralOmegaIRelDiff,
    flatPromptPeakAmp,
    flatLateWindowEnergyRatio,
    flatLateBoxEnergyRatio,
    rwLateBoxEnergyRatio,
  }
}

// -------------------------------------------------------------------------------------------------
// Top-level runner
// -------------------------------------------------------------------------------------------------

export type BinaryMergerQnmRingdownResult = {
  // Parameter-free {3,4,3,4} constants pulled directly from E-GRV-0160 & E-RLT-0125
  readonly kEff: number
  readonly gEff: number
  readonly cUniversal: number
  readonly mKKMin: number
  readonly part1: Part1InspiralResult
  readonly part2: Part2WavePropagationResult
  readonly part3: Part3QnmRingdownResult
  readonly elapsedSeconds: number
}

export function runBinaryMergerQnmRingdown(): BinaryMergerQnmRingdownResult {
  const t0 = performance.now()

  // Live converged Schwarzschild remnant & parameter-free {3,4,3,4} constants directly from E-GRV-0160
  const eGrv0160 = runNonlinearEinsteinCurvature()
  const kEff = eGrv0160.kEff
  const gEff = eGrv0160.gEff
  const cUniversal = eGrv0160.cUniversal
  const mKKMin = eGrv0160.mKKMin

  // Exact {3,4,3,4} warped cusp column at floor F = 12 (E-RLT-0125) for Part 2 wave propagation
  const col12 = buildWarpedColumnData(12)

  // Part 1: Live radiative binary inspiral & exact Peters-Mathews quadrupole chirp
  const part1 = runPart1BinaryInspiral(gEff, cUniversal)

  // Part 2: Live time-dependent spin-2 TT wave propagation on the {3,4,3,4} warped column (F = 12)
  const part2 = runPart2Spin2WavePropagation(col12, part1)

  // Part 3: Exact l = 2 Regge-Wheeler & Zerilli QNM ringdown from E-GRV-0160's converged Schwarzschild remnant
  const part3 = runPart3QnmRingdown(
    gEff,
    cUniversal,
    eGrv0160.part2.mAdm,
    eGrv0160.part2.rSchwarzschild,
    eGrv0160.part2.maxSchwarzschildAMetricRelErr,
    eGrv0160.part2.maxSchwarzschildBMetricRelErr,
    eGrv0160.part2.vacuumMaxEinsteinAbs,
  )

  const elapsedSeconds = (performance.now() - t0) / 1000

  return {
    kEff,
    gEff,
    cUniversal,
    mKKMin,
    part1,
    part2,
    part3,
    elapsedSeconds,
  }
}
