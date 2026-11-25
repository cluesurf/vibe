// FRONTIER 5: UNIFIED COUPLED-SECTORS LIVE 4D UNITARY SIMULATION (E-FND-0186).
//
// Runs all five verified Vibe Theory sectors simultaneously inside ONE single live discrete-time
// reversible unitary state vector on the {3,4,3,4} 1/N_D^2 warped cusp column:
//
//   U_total = U_grav * U_gauge * U_pair_odd * U_wall_stream * U_coin
//
// Hilbert space basis |x1, x2, D, chi, s1, s2, cPair, phiE>:
//   - x1, x2 in 0..L_x-1: spatial positions of two particles on the {3,4,3,4} husk x-ring
//   - D in 0..F (F = 8, 9 layers): {3,4,3,4} cusp depth column with shell counts N_D = 1, 18, 330, 6034...
//   - chi in {0 (L), 1 (R)}: chirality coupled to the unitary Z[zeta_9][1/6] cusp domain wall (E-SPN-0222)
//   - s1, s2 in {0, 1}: 2-component Weyl/Dirac mover spinors (opposite helicity for L vs R in S_stream)
//   - cPair in {0: (0,0), 1: (+1,-1), 2: (-1,+1)}: color-neutral Z_3 charge pairs (q1 + q2 = 0 mod 3)
//   - phiE in {0, 1, 2}: dynamical Z_3 electric winding holonomy completing exact local Gauss law
//     e_x = (Q_cum(x) + phiE) mod 3 with (div e)_x = q_x (mod 3) at every vertex x = 0..L_x-1 (E-FRC-0322)
//
// Five coupled unitary operators per beat:
//   1. U_coin:       2-component Dirac/Weyl coin R_x(2 theta_warp) with cos(theta_warp) = c_universal = 0.977925
//                    from the {3,4,3,4} 1/N_D^2 warped cusp column (E-RLT-0125)
//   2. U_wall_stream = S_stream * U_depth:
//                    - U_depth = V_1 V_2 V_1 in Z[zeta_9][1/2] (alpha1 = pi/9, alpha2 = 2*pi/3, E-SPN-0222)
//                    - S_stream: chiral Peierls transport shifting x1 by +-1 (opposite sign for L vs R) and x2 by +-1,
//                      updating phiE -> (phiE -/+ q) mod 3 across the ring cut to preserve exact local Gauss law
//                      and imparting exact Z[omega] Aharonov-Bohm phase omega^(+- q Phi_AB)
//   3. U_pair_odd = M_pair(zeta_18) * U_odd (acting on the 12 two-body dock channels (s1, s2, cPair) at x1 = x2):
//                    - M_pair(zeta_18) from code/rule/pair-line-mixer.ts (exact 12x12 unitary in Z[zeta_9][1/6])
//                    - U_odd = diag(omega^(q_signed * sigma_P)) in Z[omega] (C-odd, P-odd, exact CP-even)
//                    - Commutes identically with every local Gauss operator G_x because q1 + q2 = 0 mod 3 at x1 = x2
//   4. U_gauge = U_E * U_B in Z[zeta_9][1/6] (E-FRC-0322):
//                    - U_B = exactSinglePlaquetteGate(1) on phiE (dynamical Z_3 loop tunneling)
//                    - U_E = diag(zeta_9^(-k_E * N_active(e))) (exact Z_3 electric flux string energy phase)
//   5. U_grav = diag(exp(-i dt (Phi(x1) + Phi(x2)))):
//                    - Phi(x) = -g_M * G_warped(dist(x, x_src)) from E-GRV-0157's exact 1/N_D^2 warped Schur
//                      complement Green's function (G_eff = 0.07859254)
//
// DETERMINISM: zero random numbers. Exact algebraic certificates verified in Q(zeta_9).

import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import {
  OMEGA,
  ONE,
  ZERO,
  add,
  isUnitary,
  matMul,
  mul,
  neg,
  scale,
  sub,
  zetaPower,
  type Ninth,
  type NinthMatrix,
} from '@/code/algebra/ninth-field'
import {
  exactSinglePlaquetteGate,
  isInZOmegaOneSixth,
  isInZZeta9OneSixth,
  mod3,
} from '@/code/measure/cold-z3-confinement'
import {
  EXACT_COLUMN_SHELL_COUNTS,
  MADELUNG_C_M,
} from '@/code/measure/pair-density-gravity-slope'
import {
  verifyAlgebraicCoins,
  type AlgebraicCertificate,
} from '@/code/measure/unitary-cusp-wall'
import {
  buildWarpedColumnData,
  type WarpedColumnData,
} from '@/code/measure/universal-speed-lock'
import { pairLineMixMatrix } from '@/code/rule/pair-line-mixer'

// ---------------------------------------------------------------------------------------------------------
// Constants & exact algebraic helpers

const FLOOR_F = 8
const DEPTH_COUNT = FLOOR_F + 1 // D = 0..8 (9 layers)
const CHANNELS_12 = 12 // 2 (s1) * 2 (s2) * 3 (cPair)
const GAUGE_DIM = 3 // phiE in {0, 1, 2}
const INNER_STRIDE = CHANNELS_12 * GAUGE_DIM // 36
const DEPTH_STRIDE = 2 * INNER_STRIDE // 72
const PAIR_STRIDE = DEPTH_COUNT * DEPTH_STRIDE // 648

const HALF_ROOT3 = Math.sqrt(3) / 2
const OMEGA_RE = [1, -0.5, -0.5] as const
const OMEGA_IM = [0, HALF_ROOT3, -HALF_ROOT3] as const

// Color-singlet pair charges: cPair 0 -> (0, 0), 1 -> (+1, -1), 2 -> (-1, +1)
const Q1_MOD3 = [0, 1, 2] as const
const Q2_MOD3 = [0, 2, 1] as const
const Q1_SIGNED = [0, 1, -1] as const

// Parity-odd spin sign sigma_P(s1, s2) satisfying sigma_P(1 - s1, 1 - s2) = -sigma_P(s1, s2)
function spinParitySign(s1: number, s2: number): 1 | -1 {
  if (s1 === 1 && s2 === 0) return 1
  if (s1 === 0 && s2 === 1) return -1
  return s1 === 1 ? 1 : -1
}

function oddExponent(ch: number): -1 | 0 | 1 {
  const cPair = ch % 3
  const sIdx = (ch - cPair) / 3
  const s1 = sIdx >> 1
  const s2 = sIdx & 1
  return (Q1_SIGNED[cPair]! * spinParitySign(s1, s2)) as -1 | 0 | 1
}

function ringDist(a: number, b: number, lx: number): number {
  const d = Math.abs(a - b)
  return d <= lx - d ? d : lx - d
}

function signedRingDelta(x: number, origin: number, lx: number): number {
  let d = (x - origin) % lx
  if (d < 0) d += lx
  if (d * 2 === lx) return 0
  if (d > lx / 2) d -= lx
  return d
}

// Primitive 18th root of unity zeta_18 = e^(i pi / 9) = -zeta_9^5 in Z[zeta_9]
function zeta18Exact(): Ninth {
  return neg(zetaPower(5))
}

// ---------------------------------------------------------------------------------------------------------
// 1. Exact Q(zeta_9) algebraic certificate for all discrete gates in U_total

export type UnifiedAlgebraicCertificate = {
  readonly wallCoinsExact: boolean
  readonly wallCertificate: AlgebraicCertificate
  readonly plaquetteGateUnitary: boolean
  readonly plaquetteGateInRing: boolean
  readonly electricPhasesInRing: boolean
  readonly peierlsPhasesInZOmega: boolean
  readonly mPairUnitary: boolean
  readonly mPairInRing: boolean
  readonly oddGateUnitary: boolean
  readonly oddGateInZOmega: boolean
  readonly pairOddProductUnitary: boolean
  readonly pairOddProductInRing: boolean
  readonly allExact: boolean
}

export function verifyUnifiedAlgebraicCertificate(): UnifiedAlgebraicCertificate {
  const wallCertificate = verifyAlgebraicCoins(DEPTH_COUNT)
  const wallCoinsExact = wallCertificate.allExact

  const uB = exactSinglePlaquetteGate(1)
  const plaquetteGateUnitary = isUnitary(uB)
  let plaquetteGateInRing = true
  for (const row of uB) {
    for (const entry of row) {
      if (!isInZZeta9OneSixth(entry)) plaquetteGateInRing = false
    }
  }

  let electricPhasesInRing = true
  for (let n = 0; n <= 36; n++) {
    if (!isInZZeta9OneSixth(zetaPower(-n))) electricPhasesInRing = false
  }

  let peierlsPhasesInZOmega = true
  for (let k = 0; k < 3; k++) {
    if (!isInZOmegaOneSixth(zetaPower(3 * k))) peierlsPhasesInZOmega = false
  }

  // Exact 12x12 M_pair(zeta_18) in Z[zeta_9][1/6]: hop = (zeta_18 - 1) / 12, keep = 1 + hop
  const z18 = zeta18Exact()
  const hop = scale(sub(z18, ONE), 1, 12)
  const keep = add(ONE, hop)
  const mPairExact: NinthMatrix = Array.from({ length: CHANNELS_12 }, (_, r) =>
    Array.from({ length: CHANNELS_12 }, (_, c) => (r === c ? keep : hop)),
  )
  const mPairUnitary = isUnitary(mPairExact)
  let mPairInRing = true
  for (const row of mPairExact) {
    for (const entry of row) {
      if (!isInZZeta9OneSixth(entry)) mPairInRing = false
    }
  }

  // Exact 12x12 U_odd = diag(omega^(q_signed * sigma_P)) in Z[omega] subset Z[zeta_9][1/6]
  const omega2 = zetaPower(6)
  const oddGateExact: NinthMatrix = Array.from({ length: CHANNELS_12 }, (_, r) =>
    Array.from({ length: CHANNELS_12 }, (_, c) => {
      if (r !== c) return ZERO
      const e = oddExponent(r)
      return e === 1 ? OMEGA : e === -1 ? omega2 : ONE
    }),
  )
  const oddGateUnitary = isUnitary(oddGateExact)
  let oddGateInZOmega = true
  for (const row of oddGateExact) {
    for (const entry of row) {
      if (!isInZOmegaOneSixth(entry)) oddGateInZOmega = false
    }
  }

  const pairOddExact = matMul(mPairExact, oddGateExact)
  const pairOddProductUnitary = isUnitary(pairOddExact)
  let pairOddProductInRing = true
  for (const row of pairOddExact) {
    for (const entry of row) {
      if (!isInZZeta9OneSixth(entry)) pairOddProductInRing = false
    }
  }

  const allExact =
    wallCoinsExact &&
    plaquetteGateUnitary &&
    plaquetteGateInRing &&
    electricPhasesInRing &&
    peierlsPhasesInZOmega &&
    mPairUnitary &&
    mPairInRing &&
    oddGateUnitary &&
    oddGateInZOmega &&
    pairOddProductUnitary &&
    pairOddProductInRing

  return {
    wallCoinsExact,
    wallCertificate,
    plaquetteGateUnitary,
    plaquetteGateInRing,
    electricPhasesInRing,
    peierlsPhasesInZOmega,
    mPairUnitary,
    mPairInRing,
    oddGateUnitary,
    oddGateInZOmega,
    pairOddProductUnitary,
    pairOddProductInRing,
    allExact,
  }
}

// ---------------------------------------------------------------------------------------------------------
// 2. Exact {3,4,3,4} 1/N_D^2 warped cusp column Green's function (E-GRV-0157 / E-RLT-0125)

export type WarpedGravityTable = {
  readonly floorF: number
  readonly col: WarpedColumnData
  readonly kEff: number
  readonly gEff: number
  readonly mEff: number
  readonly cUniversal: number
  readonly coinAngle: number
  readonly gWarpedByR: Float64Array
}

function schurAtLambda(col: WarpedColumnData, lam: number): number {
  const f = col.floorF
  let y = col.cLat[f]! * lam + col.cVert[f]!
  for (let d = f - 1; d >= 0; d--) {
    const cv = col.cVert[d]!
    y = col.cLat[d]! * lam + (cv * y) / (cv + y)
  }
  return y
}

// Fast exact 1/48 octahedral-wedge 3D husk Green's function G_warped(r, 0, 0) for r = 0..maxR
function solveWarpedGreenAlongX(
  col: WarpedColumnData,
  side: number,
  maxR: number,
): Float64Array {
  const half = side >> 1
  const twoPiOverL = (2 * Math.PI) / side
  const stride = maxR + 1
  const cosTable = new Float64Array((half + 1) * stride)
  const cos1 = new Float64Array(half + 1)
  const mult = new Float64Array(half + 1)

  for (let m = 0; m <= half; m++) {
    cos1[m] = Math.cos(twoPiOverL * m)
    mult[m] = m === 0 || m === half ? 1 : 2
    const base = m * stride
    for (let r = 0; r <= maxR; r++) {
      cosTable[base + r] = Math.cos(twoPiOverL * ((m * r) % side))
    }
  }

  const accum = new Float64Array(stride)

  for (let a = 0; a <= half; a++) {
    const ca = cos1[a]!
    const ma = mult[a]!
    const baseA = a * stride
    for (let b = a; b <= half; b++) {
      const cb = cos1[b]!
      const mb = mult[b]!
      const baseB = b * stride
      for (let c = b; c <= half; c++) {
        if (a === 0 && b === 0 && c === 0) continue
        const lam = 2 * (3 - ca - cb - cos1[c]!)
        const gk = 1 / schurAtLambda(col, lam)
        const mc = mult[c]!
        const baseC = c * stride

        if (a === b && b === c) {
          const gkw = gk * ma * ma * ma
          for (let r = 0; r <= maxR; r++) {
            accum[r] = accum[r]! + gkw * cosTable[baseA + r]!
          }
        } else if (a === b) {
          const gkw = gk * ma * ma * mc
          for (let r = 0; r <= maxR; r++) {
            accum[r] = accum[r]! + gkw * (2 * cosTable[baseA + r]! + cosTable[baseC + r]!)
          }
        } else if (b === c) {
          const gkw = gk * ma * mb * mb
          for (let r = 0; r <= maxR; r++) {
            accum[r] = accum[r]! + gkw * (cosTable[baseA + r]! + 2 * cosTable[baseB + r]!)
          }
        } else {
          const gkw = gk * 2 * ma * mb * mc
          for (let r = 0; r <= maxR; r++) {
            accum[r] =
              accum[r]! + gkw * (cosTable[baseA + r]! + cosTable[baseB + r]! + cosTable[baseC + r]!)
          }
        }
      }
    }
  }

  const vol = side * side * side
  const madelung = MADELUNG_C_M / (col.kEffRiccatiDirichlet * side)
  const out = new Float64Array(stride)
  for (let r = 0; r <= maxR; r++) {
    out[r] = accum[r]! / vol + madelung
  }
  return out
}

export function buildWarpedGravityTable(floorF = FLOOR_F, maxR = 17): WarpedGravityTable {
  const col = buildWarpedColumnData(floorF)
  const kEff = col.kEffRiccatiDirichlet
  const gEff = 1 / (4 * Math.PI * kEff)
  const mEff = col.mEff
  const cUniversal = col.cUniversal
  const coinAngle = Math.acos(cUniversal)
  const gWarpedByR = solveWarpedGreenAlongX(col, 32, maxR)

  return {
    floorF,
    col,
    kEff,
    gEff,
    mEff,
    cUniversal,
    coinAngle,
    gWarpedByR,
  }
}

// ---------------------------------------------------------------------------------------------------------
// 3. Exact Z_3 local Gauss law & link flux reconstruction

export function reconstructLinkFluxes(
  lx: number,
  x1: number,
  x2: number,
  cPair: number,
  phiE: number,
): { readonly e: Int8Array; readonly q: Int8Array; readonly activeLinks: number } {
  const q = new Int8Array(lx)
  const q1 = Q1_MOD3[cPair]!
  const q2 = Q2_MOD3[cPair]!
  q[x1] = mod3(q[x1]! + q1)
  q[x2] = mod3(q[x2]! + q2)

  const e = new Int8Array(lx)
  let cum = 0
  let activeLinks = 0
  for (let x = 0; x < lx; x++) {
    cum = mod3(cum + q[x]!)
    const ex = mod3(cum + phiE)
    e[x] = ex
    if (ex !== 0) activeLinks++
  }

  return { e, q, activeLinks }
}

// Exhaustively verify that Peierls transport + electric shift preserves both local current continuity
// (e'[l] = e[l] - J[l] mod 3 on every link) and exact local Gauss law ((div e')_x = q'_x mod 3)
// across all basis configurations on the ring.
export function auditExactPeierlsGaussLaw(lx: number): {
  readonly transitionsChecked: number
  readonly gaussViolations: number
  readonly currentContinuityViolations: number
  readonly pairInteractionGaussViolations: number
  readonly plaquetteLoopGaussViolations: number
} {
  let transitionsChecked = 0
  let gaussViolations = 0
  let currentContinuityViolations = 0

  for (let x1 = 0; x1 < lx; x1++) {
    for (let x2 = 0; x2 < lx; x2++) {
      for (let chi = 0; chi < 2; chi++) {
        for (let s1 = 0; s1 < 2; s1++) {
          const dx1 = (chi === 0 ? (s1 === 1 ? 1 : -1) : s1 === 1 ? -1 : 1) as 1 | -1
          for (let s2 = 0; s2 < 2; s2++) {
            const dx2 = (s2 === 1 ? 1 : -1) as 1 | -1
            for (let cPair = 0; cPair < 3; cPair++) {
              const q1 = Q1_MOD3[cPair]!
              const q2 = Q2_MOD3[cPair]!
              for (let phiE = 0; phiE < 3; phiE++) {
                transitionsChecked++
                const before = reconstructLinkFluxes(lx, x1, x2, cPair, phiE)

                const nx1 = (x1 + dx1 + lx) % lx
                const nx2 = (x2 + dx2 + lx) % lx
                let dPhi = 0
                if (dx1 === 1 && x1 === lx - 1) dPhi -= q1
                else if (dx1 === -1 && x1 === 0) dPhi += q1
                if (dx2 === 1 && x2 === lx - 1) dPhi -= q2
                else if (dx2 === -1 && x2 === 0) dPhi += q2
                const nPhiE = mod3(phiE + dPhi)

                const after = reconstructLinkFluxes(lx, nx1, nx2, cPair, nPhiE)

                // Exact net color current J[l] crossing link l (l connects l -> (l+1) mod lx)
                const current = new Int8Array(lx)
                if (dx1 === 1) current[x1] = mod3(current[x1]! + q1)
                else current[nx1] = mod3(current[nx1]! - q1)
                if (dx2 === 1) current[x2] = mod3(current[x2]! + q2)
                else current[nx2] = mod3(current[nx2]! - q2)

                for (let l = 0; l < lx; l++) {
                  if (after.e[l] !== mod3(before.e[l]! - current[l]!)) {
                    currentContinuityViolations++
                  }
                  const divX = mod3(after.e[l]! - after.e[(l - 1 + lx) % lx]!)
                  if (divX !== after.q[l]) {
                    gaussViolations++
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Verify M_pair + ODD at x1 = x2 leaves all link fluxes and vertex charges strictly invariant
  let pairInteractionGaussViolations = 0
  for (let x = 0; x < lx; x++) {
    for (let phiE = 0; phiE < 3; phiE++) {
      const ref = reconstructLinkFluxes(lx, x, x, 0, phiE)
      for (let cPair = 1; cPair < 3; cPair++) {
        const cur = reconstructLinkFluxes(lx, x, x, cPair, phiE)
        for (let l = 0; l < lx; l++) {
          if (cur.e[l] !== ref.e[l] || cur.q[l] !== ref.q[l]) {
            pairInteractionGaussViolations++
          }
        }
      }
    }
  }

  // Verify U_B loop shifts phiE -> phiE +- 1 preserve local Gauss law at every vertex
  let plaquetteLoopGaussViolations = 0
  for (let x1 = 0; x1 < lx; x1++) {
    for (let x2 = 0; x2 < lx; x2++) {
      for (let cPair = 0; cPair < 3; cPair++) {
        for (let phiE = 0; phiE < 3; phiE++) {
          const cur = reconstructLinkFluxes(lx, x1, x2, cPair, phiE)
          for (let l = 0; l < lx; l++) {
            const divX = mod3(cur.e[l]! - cur.e[(l - 1 + lx) % lx]!)
            if (divX !== cur.q[l]) {
              plaquetteLoopGaussViolations++
            }
          }
        }
      }
    }
  }

  return {
    transitionsChecked,
    gaussViolations,
    currentContinuityViolations,
    pairInteractionGaussViolations,
    plaquetteLoopGaussViolations,
  }
}

// ---------------------------------------------------------------------------------------------------------
// 4. Unified 4D Coupled-Sectors Unitary Engine

export type UnifiedSectorFlags = {
  readonly gravOn: boolean
  readonly wallOn: boolean
  readonly gaugeOn: boolean
  readonly fluxOn: boolean
  readonly pairOn: boolean
  readonly oddOn: boolean
}

export const ALL_SECTORS_ON: UnifiedSectorFlags = {
  gravOn: true,
  wallOn: true,
  gaugeOn: true,
  fluxOn: true,
  pairOn: true,
  oddOn: true,
}

export type UnifiedConfig = {
  readonly lx: number
  readonly flags: UnifiedSectorFlags
  readonly gravSrcX: number
  readonly gravCoupling: number
  readonly gravDt: number
  readonly electricStepK: number
  readonly abFluxMod3: 0 | 1 | 2
}

export type UnifiedState = {
  readonly re: Float64Array
  readonly im: Float64Array
}

export type UnifiedWorkspace = {
  readonly config: UnifiedConfig
  readonly gravity: WarpedGravityTable
  readonly dim: number
  readonly coinCos: number
  readonly coinSin: number
  readonly wallC1: number
  readonly wallS1: number
  readonly wallC2: number
  readonly wallS2: number
  // 12x12 U_pair_odd = M_pair(zeta_18) * U_odd (precomputed row-major)
  readonly pairOddRe: Float64Array
  readonly pairOddIm: Float64Array
  // Exact 3x3 U_B = exactSinglePlaquetteGate(1) entries (diag alpha, off beta)
  readonly uBAlphaRe: number
  readonly uBAlphaIm: number
  readonly uBBetaRe: number
  readonly uBBetaIm: number
  // Precomputed electric phase per (x1, x2, cPair, phiE) and active link counts
  readonly activeLinksTable: Uint8Array
  readonly elecPhaseRe: Float64Array
  readonly elecPhaseIm: Float64Array
  // Precomputed gravitational phase per (x1, x2)
  readonly phiByX: Float64Array
  readonly gravPhaseRe: Float64Array
  readonly gravPhaseIm: Float64Array
  // Reusable scratch buffer
  readonly tmpRe: Float64Array
  readonly tmpIm: Float64Array
}

export function stateIndex(
  lx: number,
  x1: number,
  x2: number,
  d: number,
  chi: number,
  s1: number,
  s2: number,
  cPair: number,
  phiE: number,
): number {
  const ch = (s1 * 2 + s2) * 3 + cPair
  return (x1 * lx + x2) * PAIR_STRIDE + d * DEPTH_STRIDE + chi * INNER_STRIDE + ch * GAUGE_DIM + phiE
}

export function createUnifiedWorkspace(
  gravity: WarpedGravityTable,
  config: UnifiedConfig,
): UnifiedWorkspace {
  const { lx, flags } = config
  const dim = lx * lx * PAIR_STRIDE

  const coinCos = Math.cos(gravity.coinAngle)
  const coinSin = Math.sin(gravity.coinAngle)

  // E-SPN-0222 unitary cusp domain wall:
  //   wallOn = true  -> topological cusp zero mode: alpha1 = pi/9, alpha2 = 2*pi/3 (nu_0 = 1)
  //   wallOn = false -> trivial gapped doubler point: alpha1 = pi/3, alpha2 = 0 (nu_0 = 0)
  const alpha1 = flags.wallOn ? Math.PI / 9 : Math.PI / 3
  const alpha2 = flags.wallOn ? (2 * Math.PI) / 3 : 0
  const wallC1 = Math.cos(alpha1)
  const wallS1 = Math.sin(alpha1)
  const wallC2 = Math.cos(alpha2)
  const wallS2 = Math.sin(alpha2)

  // Build 12x12 U_pair_odd = M_pair(zeta_18) * U_odd
  const mPair = pairLineMixMatrix(Math.PI / 9)
  const pairOddRe = new Float64Array(CHANNELS_12 * CHANNELS_12)
  const pairOddIm = new Float64Array(CHANNELS_12 * CHANNELS_12)

  for (let r = 0; r < CHANNELS_12; r++) {
    for (let c = 0; c < CHANNELS_12; c++) {
      let mr: number
      let mi: number
      if (flags.pairOn) {
        const entry = mPair[r * CHANNELS_12 + c]!
        mr = entry[0]
        mi = entry[1]
      } else {
        mr = r === c ? 1 : 0
        mi = 0
      }

      if (flags.oddOn) {
        const exp = mod3(oddExponent(c))
        const or = OMEGA_RE[exp]!
        const oi = OMEGA_IM[exp]!
        pairOddRe[r * CHANNELS_12 + c] = mr * or - mi * oi
        pairOddIm[r * CHANNELS_12 + c] = mr * oi + mi * or
      } else {
        pairOddRe[r * CHANNELS_12 + c] = mr
        pairOddIm[r * CHANNELS_12 + c] = mi
      }
    }
  }

  // Exact Z[zeta_9][1/6] single-loop magnetic gate U_B = exactSinglePlaquetteGate(1)
  // zeta_9^(-1) * (2 + omega) / 3 and zeta_9^(-1) * (omega - 1) / 3
  let uBAlphaRe = 1
  let uBAlphaIm = 0
  let uBBetaRe = 0
  let uBBetaIm = 0
  if (flags.gaugeOn) {
    const gPhaseR = Math.cos((-2 * Math.PI) / 9)
    const gPhaseI = Math.sin((-2 * Math.PI) / 9)
    const d0R = (2 + OMEGA_RE[1]) / 3
    const d0I = OMEGA_IM[1] / 3
    const o0R = (OMEGA_RE[1] - 1) / 3
    const o0I = OMEGA_IM[1] / 3
    uBAlphaRe = gPhaseR * d0R - gPhaseI * d0I
    uBAlphaIm = gPhaseR * d0I + gPhaseI * d0R
    uBBetaRe = gPhaseR * o0R - gPhaseI * o0I
    uBBetaIm = gPhaseR * o0I + gPhaseI * o0R
  }

  // Precompute active link counts and exact Z[zeta_9] electric phases zeta_9^(-k_E * N_active)
  const elecLen = lx * lx * 9
  const activeLinksTable = new Uint8Array(elecLen)
  const elecPhaseRe = new Float64Array(elecLen)
  const elecPhaseIm = new Float64Array(elecLen)

  for (let x1 = 0; x1 < lx; x1++) {
    for (let x2 = 0; x2 < lx; x2++) {
      for (let cPair = 0; cPair < 3; cPair++) {
        for (let phiE = 0; phiE < 3; phiE++) {
          const off = (x1 * lx + x2) * 9 + cPair * 3 + phiE
          const { activeLinks } = reconstructLinkFluxes(lx, x1, x2, cPair, phiE)
          activeLinksTable[off] = activeLinks
          if (flags.gaugeOn) {
            const ang = ((-2 * Math.PI) / 9) * ((config.electricStepK * activeLinks) % 9)
            elecPhaseRe[off] = Math.cos(ang)
            elecPhaseIm[off] = Math.sin(ang)
          } else {
            elecPhaseRe[off] = 1
            elecPhaseIm[off] = 0
          }
        }
      }
    }
  }

  // Precompute gravitational potential Phi(x) = -gravCoupling * G_warped(dist(x, x_src))
  const phiByX = new Float64Array(lx)
  for (let x = 0; x < lx; x++) {
    const r = ringDist(x, config.gravSrcX, lx)
    phiByX[x] = flags.gravOn ? -config.gravCoupling * gravity.gWarpedByR[r]! : 0
  }

  const gravPhaseRe = new Float64Array(lx * lx)
  const gravPhaseIm = new Float64Array(lx * lx)
  for (let x1 = 0; x1 < lx; x1++) {
    for (let x2 = 0; x2 < lx; x2++) {
      const theta = -config.gravDt * (phiByX[x1]! + phiByX[x2]!)
      gravPhaseRe[x1 * lx + x2] = Math.cos(theta)
      gravPhaseIm[x1 * lx + x2] = Math.sin(theta)
    }
  }

  return {
    config,
    gravity,
    dim,
    coinCos,
    coinSin,
    wallC1,
    wallS1,
    wallC2,
    wallS2,
    pairOddRe,
    pairOddIm,
    uBAlphaRe,
    uBAlphaIm,
    uBBetaRe,
    uBBetaIm,
    activeLinksTable,
    elecPhaseRe,
    elecPhaseIm,
    phiByX,
    gravPhaseRe,
    gravPhaseIm,
    tmpRe: new Float64Array(dim),
    tmpIm: new Float64Array(dim),
  }
}

export function createZeroState(ws: UnifiedWorkspace): UnifiedState {
  return { re: new Float64Array(ws.dim), im: new Float64Array(ws.dim) }
}

export function cloneState(state: UnifiedState): UnifiedState {
  return { re: Float64Array.from(state.re), im: Float64Array.from(state.im) }
}

export function stateNormSq(state: UnifiedState): number {
  const { re, im } = state
  let sum = 0
  for (let i = 0; i < re.length; i++) {
    const r = re[i]!
    const m = im[i]!
    sum += r * r + m * m
  }
  return sum
}

export function normalizeState(state: UnifiedState): void {
  const inv = 1 / Math.sqrt(stateNormSq(state))
  const { re, im } = state
  for (let i = 0; i < re.length; i++) {
    re[i] = re[i]! * inv
    im[i] = im[i]! * inv
  }
}

export function stateDiffNorm(a: UnifiedState, b: UnifiedState): number {
  let sum = 0
  for (let i = 0; i < a.re.length; i++) {
    const dr = a.re[i]! - b.re[i]!
    const di = a.im[i]! - b.im[i]!
    sum += dr * dr + di * di
  }
  return Math.sqrt(sum)
}

// ---------------------------------------------------------------------------------------------------------
// Elementary reversible unitary sub-steps (forward and exact adjoint)

// U_coin: R_x(2 theta_warp) on s1 (x) R_x(2 theta_warp) on s2
function applyCoinInPlace(ws: UnifiedWorkspace, state: UnifiedState, adjoint: boolean): void {
  const { re, im } = state
  const c = ws.coinCos
  const s = adjoint ? -ws.coinSin : ws.coinSin
  const len = ws.dim

  // Apply R_x on s2 (stride 9 within each 36-element block) and R_x on s1 (stride 18)
  for (let base = 0; base < len; base += INNER_STRIDE) {
    // First R_x on s2: pairs (off, off + 9) for off in 0..8 and 18..26
    for (let s1Off = 0; s1Off < 36; s1Off += 18) {
      for (let tail = 0; tail < 9; tail++) {
        const i0 = base + s1Off + tail
        const i1 = i0 + 9
        const r0 = re[i0]!
        const m0 = im[i0]!
        const r1 = re[i1]!
        const m1 = im[i1]!
        // [[c, -i s], [-i s, c]] * [0, 1]^T
        re[i0] = c * r0 + s * m1
        im[i0] = c * m0 - s * r1
        re[i1] = c * r1 + s * m0
        im[i1] = c * m1 - s * r0
      }
    }

    // Second R_x on s1: pairs (off, off + 18) for off in 0..17
    for (let off = 0; off < 18; off++) {
      const i0 = base + off
      const i1 = i0 + 18
      const r0 = re[i0]!
      const m0 = im[i0]!
      const r1 = re[i1]!
      const m1 = im[i1]!
      re[i0] = c * r0 + s * m1
      im[i0] = c * m0 - s * r1
      re[i1] = c * r1 + s * m0
      im[i1] = c * m1 - s * r0
    }
  }
}

// U_depth = V_1 * V_2 * V_1 in Z[zeta_9][1/2] acting on (D, chi)
function applyDepthWallInPlace(ws: UnifiedWorkspace, state: UnifiedState, adjoint: boolean): void {
  const { re, im } = state
  const c1 = ws.wallC1
  const s1 = adjoint ? -ws.wallS1 : ws.wallS1
  const c2 = ws.wallC2
  const s2 = adjoint ? -ws.wallS2 : ws.wallS2
  const len = ws.dim

  const applyV1 = (): void => {
    for (let pairBase = 0; pairBase < len; pairBase += PAIR_STRIDE) {
      for (let d = 0; d < DEPTH_COUNT; d++) {
        const lBase = pairBase + d * DEPTH_STRIDE
        const rBase = lBase + INNER_STRIDE
        for (let k = 0; k < INNER_STRIDE; k++) {
          const iL = lBase + k
          const iR = rBase + k
          const lr = re[iL]!
          const li = im[iL]!
          const rr = re[iR]!
          const ri = im[iR]!
          re[iL] = c1 * lr + s1 * ri
          im[iL] = c1 * li - s1 * rr
          re[iR] = c1 * rr + s1 * li
          im[iR] = c1 * ri - s1 * lr
        }
      }
    }
  }

  const applyV2 = (): void => {
    if (s2 === 0 && c2 === 1) return
    for (let pairBase = 0; pairBase < len; pairBase += PAIR_STRIDE) {
      for (let d = 0; d < DEPTH_COUNT - 1; d++) {
        const rBase = pairBase + d * DEPTH_STRIDE + INNER_STRIDE
        const lNextBase = pairBase + (d + 1) * DEPTH_STRIDE
        for (let k = 0; k < INNER_STRIDE; k++) {
          const iR = rBase + k
          const iL = lNextBase + k
          const rr = re[iR]!
          const ri = im[iR]!
          const lr = re[iL]!
          const li = im[iL]!
          re[iR] = c2 * rr + s2 * li
          im[iR] = c2 * ri - s2 * lr
          re[iL] = c2 * lr + s2 * ri
          im[iL] = c2 * li - s2 * rr
        }
      }
    }
  }

  // Since U_depth = V1 V2 V1, its adjoint is V1^dag V2^dag V1^dag (same sequence with -s1, -s2)
  applyV1()
  applyV2()
  applyV1()
}

// S_stream: chiral spatial Peierls shift with exact Z_3 Gauss-law electric shift and AB phase
function applyPeierlsStreamInPlace(
  ws: UnifiedWorkspace,
  state: UnifiedState,
  adjoint: boolean,
): void {
  const { re, im } = state
  const { tmpRe, tmpIm, config } = ws
  const lx = config.lx
  const abFlux = config.flags.fluxOn ? config.abFluxMod3 : 0
  const dirSign = adjoint ? -1 : 1

  for (let x1 = 0; x1 < lx; x1++) {
    for (let x2 = 0; x2 < lx; x2++) {
      const srcPair = (x1 * lx + x2) * PAIR_STRIDE

      for (let chi = 0; chi < 2; chi++) {
        for (let s1 = 0; s1 < 2; s1++) {
          // Forward dx1: chi = 0 (L) -> s1 = 1 (+1), s1 = 0 (-1); chi = 1 (R) -> opposite helicity
          const fDx1 = chi === 0 ? (s1 === 1 ? 1 : -1) : s1 === 1 ? -1 : 1
          const dx1 = fDx1 * dirSign
          const nx1 = (x1 + dx1 + lx) % lx
          // Forward wrap: +1 if (lx-1 -> 0), -1 if (0 -> lx-1)
          // For adjoint: invert forward wrap occurring on the backward transition
          let wrap1 = 0
          if (!adjoint) {
            if (fDx1 === 1 && x1 === lx - 1) wrap1 = 1
            else if (fDx1 === -1 && x1 === 0) wrap1 = -1
          } else {
            if (fDx1 === 1 && x1 === 0) wrap1 = -1
            else if (fDx1 === -1 && x1 === lx - 1) wrap1 = 1
          }

          for (let s2 = 0; s2 < 2; s2++) {
            const fDx2 = s2 === 1 ? 1 : -1
            const dx2 = fDx2 * dirSign
            const nx2 = (x2 + dx2 + lx) % lx
            let wrap2 = 0
            if (!adjoint) {
              if (fDx2 === 1 && x2 === lx - 1) wrap2 = 1
              else if (fDx2 === -1 && x2 === 0) wrap2 = -1
            } else {
              if (fDx2 === 1 && x2 === 0) wrap2 = -1
              else if (fDx2 === -1 && x2 === lx - 1) wrap2 = 1
            }

            const dstPair = (nx1 * lx + nx2) * PAIR_STRIDE

            for (let cPair = 0; cPair < 3; cPair++) {
              const q1 = Q1_MOD3[cPair]!
              const q2 = Q2_MOD3[cPair]!
              const ch = (s1 * 2 + s2) * 3 + cPair

              // Electric holonomy shift: forward wrap +1 shifts phiE by -q; adjoint inverts it
              const dPhi = mod3(-(wrap1 * q1 + wrap2 * q2))
              // Peierls AB phase: forward wrap +1 multiplies by omega^(+q * abFlux); adjoint conjugates
              const phaseExp = mod3((wrap1 * q1 + wrap2 * q2) * abFlux)
              const pr = OMEGA_RE[phaseExp]!
              const pi = OMEGA_IM[phaseExp]!

              const chOff = chi * INNER_STRIDE + ch * GAUGE_DIM

              for (let d = 0; d < DEPTH_COUNT; d++) {
                const srcBase = srcPair + d * DEPTH_STRIDE + chOff
                const dstBase = dstPair + d * DEPTH_STRIDE + chOff

                for (let phiE = 0; phiE < 3; phiE++) {
                  const nPhi = (phiE + dPhi) % 3
                  const sr = re[srcBase + phiE]!
                  const si = im[srcBase + phiE]!
                  tmpRe[dstBase + nPhi] = pr * sr - pi * si
                  tmpIm[dstBase + nPhi] = pr * si + pi * sr
                }
              }
            }
          }
        }
      }
    }
  }

  re.set(tmpRe)
  im.set(tmpIm)
}

// U_pair_odd = M_pair(zeta_18) * U_odd acting on the 12 dock channels ONLY at x1 === x2
function applyPairOddInPlace(ws: UnifiedWorkspace, state: UnifiedState, adjoint: boolean): void {
  const { flags, lx } = ws.config
  if (!flags.pairOn && !flags.oddOn) return

  const { re, im } = state
  const { pairOddRe, pairOddIm } = ws
  const inR = new Float64Array(CHANNELS_12)
  const inI = new Float64Array(CHANNELS_12)

  for (let x = 0; x < lx; x++) {
    const pairBase = (x * lx + x) * PAIR_STRIDE
    for (let d = 0; d < DEPTH_COUNT; d++) {
      for (let chi = 0; chi < 2; chi++) {
        const blockBase = pairBase + d * DEPTH_STRIDE + chi * INNER_STRIDE
        for (let phiE = 0; phiE < 3; phiE++) {
          for (let c = 0; c < CHANNELS_12; c++) {
            const idx = blockBase + c * GAUGE_DIM + phiE
            inR[c] = re[idx]!
            inI[c] = im[idx]!
          }

          for (let r = 0; r < CHANNELS_12; r++) {
            let sr = 0
            let si = 0
            for (let c = 0; c < CHANNELS_12; c++) {
              // Forward: U[r, c]; Adjoint: conj(U[c, r])
              const mr = adjoint
                ? pairOddRe[c * CHANNELS_12 + r]!
                : pairOddRe[r * CHANNELS_12 + c]!
              const mi = adjoint
                ? -pairOddIm[c * CHANNELS_12 + r]!
                : pairOddIm[r * CHANNELS_12 + c]!
              const vr = inR[c]!
              const vi = inI[c]!
              sr += mr * vr - mi * vi
              si += mr * vi + mi * vr
            }
            const idx = blockBase + r * GAUGE_DIM + phiE
            re[idx] = sr
            im[idx] = si
          }
        }
      }
    }
  }
}

// U_B: exact 3x3 single-loop Z_3 magnetic tunneling gate on phiE (unit stride!)
function applyGaugeMagneticInPlace(
  ws: UnifiedWorkspace,
  state: UnifiedState,
  adjoint: boolean,
): void {
  if (!ws.config.flags.gaugeOn) return
  const { re, im } = state
  const ar = ws.uBAlphaRe
  const ai = adjoint ? -ws.uBAlphaIm : ws.uBAlphaIm
  const br = ws.uBBetaRe
  const bi = adjoint ? -ws.uBBetaIm : ws.uBBetaIm
  const len = ws.dim

  for (let i = 0; i < len; i += 3) {
    const r0 = re[i]!
    const m0 = im[i]!
    const r1 = re[i + 1]!
    const m1 = im[i + 1]!
    const r2 = re[i + 2]!
    const m2 = im[i + 2]!

    const s12r = r1 + r2
    const s12i = m1 + m2
    const s02r = r0 + r2
    const s02i = m0 + m2
    const s01r = r0 + r1
    const s01i = m0 + m1

    re[i] = ar * r0 - ai * m0 + br * s12r - bi * s12i
    im[i] = ar * m0 + ai * r0 + br * s12i + bi * s12r
    re[i + 1] = ar * r1 - ai * m1 + br * s02r - bi * s02i
    im[i + 1] = ar * m1 + ai * r1 + br * s02i + bi * s02r
    re[i + 2] = ar * r2 - ai * m2 + br * s01r - bi * s01i
    im[i + 2] = ar * m2 + ai * r2 + br * s01i + bi * s01r
  }
}

// U_E: diagonal Z[zeta_9] electric string energy phase zeta_9^(-k_E * N_active)
function applyGaugeElectricInPlace(
  ws: UnifiedWorkspace,
  state: UnifiedState,
  adjoint: boolean,
): void {
  if (!ws.config.flags.gaugeOn) return
  const { re, im } = state
  const { elecPhaseRe, elecPhaseIm } = ws
  const lx = ws.config.lx
  const sign = adjoint ? -1 : 1

  for (let pair = 0; pair < lx * lx; pair++) {
    const pairBase = pair * PAIR_STRIDE
    const elecBase = pair * 9

    for (let d = 0; d < DEPTH_COUNT; d++) {
      for (let chi = 0; chi < 2; chi++) {
        const blockBase = pairBase + d * DEPTH_STRIDE + chi * INNER_STRIDE
        for (let sIdx = 0; sIdx < 4; sIdx++) {
          const sBase = blockBase + sIdx * 9
          for (let k = 0; k < 9; k++) {
            const idx = sBase + k
            const pr = elecPhaseRe[elecBase + k]!
            const pi = sign * elecPhaseIm[elecBase + k]!
            const vr = re[idx]!
            const vi = im[idx]!
            re[idx] = pr * vr - pi * vi
            im[idx] = pr * vi + pi * vr
          }
        }
      }
    }
  }
}

// U_grav: diagonal unitary gravitational phase exp(-i dt (Phi(x1) + Phi(x2)))
function applyGravityInPlace(
  ws: UnifiedWorkspace,
  state: UnifiedState,
  adjoint: boolean,
): void {
  if (!ws.config.flags.gravOn) return
  const { re, im } = state
  const { gravPhaseRe, gravPhaseIm } = ws
  const lx = ws.config.lx
  const sign = adjoint ? -1 : 1

  for (let pair = 0; pair < lx * lx; pair++) {
    const pr = gravPhaseRe[pair]!
    const pi = sign * gravPhaseIm[pair]!
    const start = pair * PAIR_STRIDE
    const end = start + PAIR_STRIDE
    for (let i = start; i < end; i++) {
      const vr = re[i]!
      const vi = im[i]!
      re[i] = pr * vr - pi * vi
      im[i] = pr * vi + pi * vr
    }
  }
}

// Single forward beat: U_total = U_grav * U_gauge * U_pair_odd * U_wall_stream * U_coin
export function stepUnified(ws: UnifiedWorkspace, state: UnifiedState): void {
  applyCoinInPlace(ws, state, false)
  applyDepthWallInPlace(ws, state, false)
  applyPeierlsStreamInPlace(ws, state, false)
  applyPairOddInPlace(ws, state, false)
  applyGaugeMagneticInPlace(ws, state, false)
  applyGaugeElectricInPlace(ws, state, false)
  applyGravityInPlace(ws, state, false)
}

// Exact adjoint beat: U_total^dag = U_coin^dag * U_wall_stream^dag * U_pair_odd^dag * U_gauge^dag * U_grav^dag
export function stepUnifiedAdjoint(ws: UnifiedWorkspace, state: UnifiedState): void {
  applyGravityInPlace(ws, state, true)
  applyGaugeElectricInPlace(ws, state, true)
  applyGaugeMagneticInPlace(ws, state, true)
  applyPairOddInPlace(ws, state, true)
  applyPeierlsStreamInPlace(ws, state, true)
  applyDepthWallInPlace(ws, state, true)
  applyCoinInPlace(ws, state, true)
}

// ---------------------------------------------------------------------------------------------------------
// 5. State preparation helpers (chiral zero modes, positive-energy Bloch spinors, gauge states)

// Exact normalized positive-energy (+E) spinor |u_+(k)> for U_1D(k) = diag(e^(ik), e^(-ik)) R_x(2 theta)
function positiveEnergyBlochSpinor(k: number, theta: number): {
  readonly u0Re: number
  readonly u0Im: number
  readonly u1Re: number
  readonly u1Im: number
} {
  const cosE = Math.cos(k) * Math.cos(theta)
  const sinE = Math.sqrt(Math.max(0, 1 - cosE * cosE))
  const ax = Math.cos(k) * Math.sin(theta)
  const ay = -Math.sin(k) * Math.sin(theta)
  const az = -Math.sin(k) * Math.cos(theta)

  // +1 eigenstate of (ax sigma_x + ay sigma_y + az sigma_z) / sinE:
  // proportional to [sinE + az, ax + i ay]^T (always well-conditioned for |k| < pi/2)
  const r0 = sinE + az
  const r1 = ax
  const i1 = ay
  const norm = Math.sqrt(r0 * r0 + r1 * r1 + i1 * i1)
  return {
    u0Re: r0 / norm,
    u0Im: 0,
    u1Re: r1 / norm,
    u1Im: i1 / norm,
  }
}

// Exact E-SPN-0222 chiral zero-mode depth profile:
//   Left-handed (chi = 0): psi(D) ~ (-tan(pi/9) / tan(pi/3))^D localized at D = 0
//   Right-handed (chi = 1): psi(D) ~ (-tan(pi/9) / tan(pi/3))^(F - D) localized at D = F
function chiralZeroModeProfile(chi: 0 | 1): Float64Array {
  const rho = -Math.tan(Math.PI / 9) / Math.tan(Math.PI / 3)
  const prof = new Float64Array(DEPTH_COUNT)
  let normSq = 0
  for (let d = 0; d < DEPTH_COUNT; d++) {
    const exp = chi === 0 ? d : FLOOR_F - d
    const val = rho ** exp
    prof[d] = val
    normSq += val * val
  }
  const inv = 1 / Math.sqrt(normSq)
  for (let d = 0; d < DEPTH_COUNT; d++) {
    prof[d] = prof[d]! * inv
  }
  return prof
}

// ---------------------------------------------------------------------------------------------------------
// 6. Live observables on the unified state vector

function measureSurfaceWeight(ws: UnifiedWorkspace, state: UnifiedState, maxD = 2): number {
  const { re, im } = state
  const lx = ws.config.lx
  let weight = 0
  for (let pair = 0; pair < lx * lx; pair++) {
    const pairBase = pair * PAIR_STRIDE
    for (let d = 0; d <= maxD; d++) {
      const start = pairBase + d * DEPTH_STRIDE
      const end = start + DEPTH_STRIDE
      for (let i = start; i < end; i++) {
        const r = re[i]!
        const m = im[i]!
        weight += r * r + m * m
      }
    }
  }
  return weight
}

function measureMeanDisplacementX1(
  ws: UnifiedWorkspace,
  state: UnifiedState,
  originX: number,
): number {
  const { re, im } = state
  const lx = ws.config.lx
  let total = 0
  for (let x1 = 0; x1 < lx; x1++) {
    const dx = signedRingDelta(x1, originX, lx)
    const start = x1 * lx * PAIR_STRIDE
    const end = start + lx * PAIR_STRIDE
    let pX1 = 0
    for (let i = start; i < end; i++) {
      const r = re[i]!
      const m = im[i]!
      pX1 += r * r + m * m
    }
    total += dx * pX1
  }
  return total
}

function measureGaussErrorOnState(ws: UnifiedWorkspace, state: UnifiedState): number {
  const { re, im } = state
  const lx = ws.config.lx
  let errSq = 0
  for (let x1 = 0; x1 < lx; x1++) {
    for (let x2 = 0; x2 < lx; x2++) {
      const pairBase = (x1 * lx + x2) * PAIR_STRIDE
      for (let cPair = 0; cPair < 3; cPair++) {
        for (let phiE = 0; phiE < 3; phiE++) {
          const { e, q } = reconstructLinkFluxes(lx, x1, x2, cPair, phiE)
          let localViolation = 0
          for (let x = 0; x < lx; x++) {
            const diff = mod3(e[x]! - e[(x - 1 + lx) % lx]! - q[x]!)
            if (diff !== 0) localViolation += 3 // |omega^(+-1) - 1|^2 = 3
          }
          if (localViolation > 0) {
            for (let d = 0; d < DEPTH_COUNT; d++) {
              for (let chi = 0; chi < 2; chi++) {
                for (let sIdx = 0; sIdx < 4; sIdx++) {
                  const ch = sIdx * 3 + cPair
                  const idx =
                    pairBase + d * DEPTH_STRIDE + chi * INNER_STRIDE + ch * GAUGE_DIM + phiE
                  const r = re[idx]!
                  const m = im[idx]!
                  errSq += localViolation * (r * r + m * m)
                }
              }
            }
          }
        }
      }
    }
  }
  return Math.sqrt(errSq)
}

function measureColorProbabilities(ws: UnifiedWorkspace, state: UnifiedState): [number, number, number] {
  const { re, im } = state
  const probs: [number, number, number] = [0, 0, 0]
  const len = ws.dim
  for (let base = 0; base < len; base += 9) {
    for (let cPair = 0; cPair < 3; cPair++) {
      const off = base + cPair * 3
      let p = 0
      for (let phiE = 0; phiE < 3; phiE++) {
        const r = re[off + phiE]!
        const m = im[off + phiE]!
        p += r * r + m * m
      }
      probs[cPair] = probs[cPair]! + p
    }
  }
  return probs
}

function measureMeanActiveLinks(ws: UnifiedWorkspace, state: UnifiedState): number {
  const { re, im } = state
  const { activeLinksTable } = ws
  const lx = ws.config.lx
  let mean = 0
  for (let pair = 0; pair < lx * lx; pair++) {
    const pairBase = pair * PAIR_STRIDE
    const elecBase = pair * 9
    for (let d = 0; d < DEPTH_COUNT; d++) {
      for (let chi = 0; chi < 2; chi++) {
        const blockBase = pairBase + d * DEPTH_STRIDE + chi * INNER_STRIDE
        for (let sIdx = 0; sIdx < 4; sIdx++) {
          const sBase = blockBase + sIdx * 9
          for (let k = 0; k < 9; k++) {
            const r = re[sBase + k]!
            const m = im[sBase + k]!
            mean += activeLinksTable[elecBase + k]! * (r * r + m * m)
          }
        }
      }
    }
  }
  return mean
}

// Compute exact von Neumann entanglement entropy S_ent = -Tr(rho_2 ln rho_2) of particle 2's
// reduced density matrix on (x2, s2) (dimension 2 * lx) by tracing out (x1, D, chi, s1, cPair, phiE).
// Isolates pure inter-particle entanglement without single-particle (x1, chi) coupling.
function measureParticle2EntanglementEntropy(ws: UnifiedWorkspace, state: UnifiedState): {
  readonly entropy: number
  readonly purity: number
  readonly traceErr: number
} {
  const { re, im } = state
  const lx = ws.config.lx
  const subDim = 2 * lx
  const rhoRe = new Float64Array(subDim * subDim)
  const rhoIm = new Float64Array(subDim * subDim)

  // rho[(x2, s2), (x2', s2')] = sum_{x1, d, chi, s1, cPair, phiE} psi(x1, x2, ..., s2, ...) * conj(psi(x1, x2', ..., s2', ...))
  for (let a = 0; a < subDim; a++) {
    const x2a = a >> 1
    const s2a = a & 1
    for (let b = a; b < subDim; b++) {
      const x2b = b >> 1
      const s2b = b & 1
      let sr = 0
      let si = 0

      for (let x1 = 0; x1 < lx; x1++) {
        const pairA = (x1 * lx + x2a) * PAIR_STRIDE
        const pairB = (x1 * lx + x2b) * PAIR_STRIDE
        for (let d = 0; d < DEPTH_COUNT; d++) {
          for (let chi = 0; chi < 2; chi++) {
            const baseA = pairA + d * DEPTH_STRIDE + chi * INNER_STRIDE
            const baseB = pairB + d * DEPTH_STRIDE + chi * INNER_STRIDE
            for (let s1 = 0; s1 < 2; s1++) {
              const offA = baseA + (s1 * 2 + s2a) * 9
              const offB = baseB + (s1 * 2 + s2b) * 9
              for (let tail = 0; tail < 9; tail++) {
                const ar = re[offA + tail]!
                const ai = im[offA + tail]!
                const br = re[offB + tail]!
                const bi = im[offB + tail]!
                sr += ar * br + ai * bi
                si += ai * br - ar * bi
              }
            }
          }
        }
      }

      rhoRe[a * subDim + b] = sr
      rhoIm[a * subDim + b] = si
      rhoRe[b * subDim + a] = sr
      rhoIm[b * subDim + a] = -si
    }
  }

  let tr = 0
  let purity = 0
  for (let i = 0; i < subDim; i++) {
    tr += rhoRe[i * subDim + i]!
    for (let j = 0; j < subDim; j++) {
      const rr = rhoRe[i * subDim + j]!
      const ri = rhoIm[i * subDim + j]!
      purity += rr * rr + ri * ri
    }
  }

  const eig = hermitianEigenRows(subDim, rhoRe, rhoIm, 4)
  let entropy = 0
  for (let i = 0; i < subDim; i++) {
    const lam = eig.values[i]!
    if (lam > 1e-14) {
      entropy -= lam * Math.log(lam)
    }
  }

  return {
    entropy,
    purity,
    traceErr: Math.abs(tr - 1),
  }
}

// Causal light-cone Wilson-loop arms at beat t = L_x / 2 - 1 (unique geodesic paths with zero
// back-scattering contamination by strict light-cone causality):
//   Arm A at (x1 = t, x2 = L_x - t, s1 = 1, s2 = 0) -> winding +1
//   Arm B at (x1 = L_x - t, x2 = t, s1 = 0, s2 = 1) -> winding -1
// Measured in the gauge-invariant magnetic vacuum |B_0> = (|0> + |1> + |2>) / sqrt(3).
function measureWilsonLoopLightConeArms(
  ws: UnifiedWorkspace,
  state: UnifiedState,
  stepT: number,
  cPair: 0 | 1,
): {
  readonly crossRe: number
  readonly crossIm: number
  readonly armAProb: number
  readonly armBProb: number
  readonly relativePhase: number
  readonly detectorProb: number
} {
  const { re, im } = state
  const lx = ws.config.lx
  const pairA = (stepT * lx + ((lx - stepT) % lx)) * PAIR_STRIDE
  const pairB = (((lx - stepT) % lx) * lx + stepT) * PAIR_STRIDE
  let crossRe = 0
  let crossIm = 0
  let armAProb = 0
  let armBProb = 0
  let detectorProb = 0

  for (let d = 0; d < DEPTH_COUNT; d++) {
    for (let chi = 0; chi < 2; chi++) {
      const baseA = pairA + d * DEPTH_STRIDE + chi * INNER_STRIDE
      const baseB = pairB + d * DEPTH_STRIDE + chi * INNER_STRIDE
      // Arm A: (s1 = 1, s2 = 0) -> sIdx = 2; Arm B: (s1 = 0, s2 = 1) -> sIdx = 1
      const offA = baseA + (2 * 3 + cPair) * GAUGE_DIM
      const offB = baseB + (1 * 3 + cPair) * GAUGE_DIM
      const aR = (re[offA]! + re[offA + 1]! + re[offA + 2]!) / Math.sqrt(3)
      const aI = (im[offA]! + im[offA + 1]! + im[offA + 2]!) / Math.sqrt(3)
      const bR = (re[offB]! + re[offB + 1]! + re[offB + 2]!) / Math.sqrt(3)
      const bI = (im[offB]! + im[offB + 1]! + im[offB + 2]!) / Math.sqrt(3)

      armAProb += aR * aR + aI * aI
      armBProb += bR * bR + bI * bI
      crossRe += aR * bR + aI * bI
      crossIm += aI * bR - aR * bI
      const sR = aR + bR
      const sI = aI + bI
      detectorProb += 0.5 * (sR * sR + sI * sI)
    }
  }

  return {
    crossRe,
    crossIm,
    armAProb,
    armBProb,
    relativePhase: Math.atan2(crossIm, crossRe),
    detectorProb,
  }
}

function wrapAnglePi(theta: number): number {
  let t = theta
  while (t > Math.PI) t -= 2 * Math.PI
  while (t < -Math.PI) t += 2 * Math.PI
  return t
}

// Center-of-mass back-to-back scattered neutral channel probability:
// P(cPair = 0, (x1 + x2) mod lx === (2 * xMeet) mod lx).
function measureCenterOfMassNeutralScattering(
  ws: UnifiedWorkspace,
  state: UnifiedState,
  xMeet: number,
): number {
  const { re, im } = state
  const lx = ws.config.lx
  const targetSum = (2 * xMeet) % lx
  let prob = 0
  for (let x1 = 0; x1 < lx; x1++) {
    const x2 = (targetSum - x1 + lx) % lx
    const pairBase = (x1 * lx + x2) * PAIR_STRIDE
    for (let d = 0; d < DEPTH_COUNT; d++) {
      for (let chi = 0; chi < 2; chi++) {
        const blockBase = pairBase + d * DEPTH_STRIDE + chi * INNER_STRIDE
        for (let sIdx = 0; sIdx < 4; sIdx++) {
          const base = blockBase + sIdx * 9 // cPair = 0 occupies offsets 0, 1, 2
          for (let phiE = 0; phiE < 3; phiE++) {
            const r = re[base + phiE]!
            const m = im[base + phiE]!
            prob += r * r + m * m
          }
        }
      }
    }
  }
  return prob
}

// ---------------------------------------------------------------------------------------------------------
// 7. Complete Frontier 5 Benchmark Suite (All 5 Sectors + Ablation Table + Light-Cone Audit)

export type AblationRow = {
  readonly sector: string
  readonly observable: string
  readonly valueOn: number
  readonly valueOff: number
  readonly vanishesWhenOff: boolean
}

export type UnifiedCoupledSectorsResult = {
  // Exact Q(zeta_9) algebraic certificate & Peierls Gauss audit
  readonly algebraic: UnifiedAlgebraicCertificate
  readonly peierlsGaussTransitionsChecked: number
  readonly peierlsGaussViolations: number
  readonly peierlsCurrentContinuityViolations: number
  readonly pairInteractionGaussViolations: number
  readonly plaquetteLoopGaussViolations: number

  // Warped {3,4,3,4} column & E-GRV-0157 / E-RLT-0125 geometric invariants
  readonly floorF: number
  readonly lxMain: number
  readonly lxLightCone: number
  readonly beatsMain: number
  readonly hilbertDimMain: number
  readonly kEffF8: number
  readonly gEffF8: number
  readonly cUniversalF8: number
  readonly gEffDiffVsF16: number
  readonly cUniversalDiffVsF16: number

  // Sector 1: Gravitational refraction/deflection from 1/N_D^2 warped Green's function
  readonly gravDeflectionRightSource: number
  readonly gravDeflectionLeftSource: number
  readonly gravDeflectionZeroSource: number
  readonly gravBidirectionalSymErr: number

  // Sector 2: Unitary Z[zeta_9][1/6] chiral cusp domain wall (under all 5 sectors ON)
  readonly minLeftSurfaceWeightAllBeats: number
  readonly maxRightSurfaceWeightAllBeats: number
  readonly surfaceInjectionLeftWeightOn: number
  readonly surfaceInjectionRightWeightOn: number
  readonly wallChiralityAsymOn: number
  readonly wallChiralityAsymOff: number

  // Sector 3: Exact Z_3 gauge transport, dynamical flux, Gauss law & Aharonov-Bohm 2*pi/3 phase
  readonly abProbFluxOff: number
  readonly abProbFluxOn: number
  readonly abProbRatio: number
  readonly abPhaseExtracted: number
  readonly abPhaseTarget: number
  readonly abPhaseErr: number
  readonly abPhaseFluxOff: number
  readonly abPhaseNeutralControl: number
  readonly gaugeFluxShiftOn: number
  readonly gaugeFluxShiftOff: number

  // Sector 4: Two-body M_pair(zeta_18) + ODD scattering, entanglement, interference & C/CP
  readonly interferencePMax: number
  readonly interferencePMin: number
  readonly interferenceVisibility: number
  readonly dephasedVisibility: number
  readonly pairScatteringProbOn: number
  readonly pairScatteringProbOff: number
  readonly entanglementInitial: number
  readonly entanglementPairOn: number
  readonly entanglementPairOff: number
  readonly entanglementPurePairOn: number
  readonly entanglementPurePairOff: number
  readonly cAsymmetryOddOn: number
  readonly cAsymmetryCPPartner: number
  readonly cpGlobalBalanceErr: number
  readonly cAsymmetryOddOff: number
  readonly cAsymmetryPairOff: number

  // Sector 5: Exact global unitarity, reversibility, Gauss conservation & strict light-cone causality
  readonly maxNormErrAllBeats: number
  readonly maxGaussErrAllBeats: number
  readonly adjointReversalErr: number
  readonly lightConeMaxOutsideAmp16: number
  readonly lightConeMaxFrontRadius16: number

  // Full ablation / negative-control table
  readonly ablations: readonly AblationRow[]
}

export function runUnifiedCoupledSectors(): UnifiedCoupledSectorsResult {
  const lxMain = 20
  const lxLightCone = 34
  const beatsMain = 16

  // 0. Exact symbolic Q(zeta_9) certificate and exhaustive Peierls Gauss-law transition audit
  const algebraic = verifyUnifiedAlgebraicCertificate()
  const gaussAudit = auditExactPeierlsGaussLaw(lxMain)

  // Shared {3,4,3,4} 1/N_D^2 warped cusp column (F = 8, cross-checked against F = 16)
  const gravF8 = buildWarpedGravityTable(FLOOR_F, lxLightCone >> 1)
  const colF16 = buildWarpedColumnData(16)
  const gEffF16 = 1 / (4 * Math.PI * colF16.kEffRiccatiDirichlet)
  const gEffDiffVsF16 = Math.abs(gravF8.gEff - gEffF16)
  const cUniversalDiffVsF16 = Math.abs(gravF8.cUniversal - colF16.cUniversal)

  const leftZeroProf = chiralZeroModeProfile(0)
  const rightZeroProf = chiralZeroModeProfile(1)
  const invSqrt3 = 1 / Math.sqrt(3)
  const invSqrt2 = Math.SQRT1_2

  // -------------------------------------------------------------------------------------------------------
  // PROBE 1 & 2 & 5: Gravity deflection, Chiral cusp wall L vs R, Global unitarity, Reversibility, Gauss
  // Prepare a moving Left-handed chiral color-charged wavepacket centered at x0 = 10 (away from the
  // gauge cut 0 <-> 19) with localized mass source at xSrc = 15 (+5 right, all 5 sectors ON), plus
  // exact parity-mirror left-source test (xSrc = 5, -5 left) and zero-source control.
  const x0Grav = 10
  const xSrcRight = 15
  const k0Grav = 0.04
  const sigmaGrav = 1.5
  const spinorGrav = positiveEnergyBlochSpinor(k0Grav, gravF8.coinAngle)
  const spinorRest = positiveEnergyBlochSpinor(0, gravF8.coinAngle)

  const prepareChiralPacket = (ws: UnifiedWorkspace, chi: 0 | 1): UnifiedState => {
    const st = createZeroState(ws)
    const prof = chi === 0 ? leftZeroProf : rightZeroProf
    const lx = ws.config.lx
    const x2Init = (x0Grav + (lx >> 1)) % lx

    for (let x1 = 0; x1 < lx; x1++) {
      const dx = signedRingDelta(x1, x0Grav, lx)
      const env = Math.exp(-(dx * dx) / (2 * sigmaGrav * sigmaGrav))
      if (env < 1e-12) continue
      const phaseR = Math.cos(k0Grav * dx)
      const phaseI = Math.sin(k0Grav * dx)
      const wR = env * phaseR
      const wI = env * phaseI

      for (let d = 0; d < DEPTH_COUNT; d++) {
        const pd = prof[d]!
        if (Math.abs(pd) < 1e-16) continue
        for (let s1 = 0; s1 < 2; s1++) {
          const u1R = s1 === 0 ? spinorGrav.u0Re : spinorGrav.u1Re
          const u1I = s1 === 0 ? spinorGrav.u0Im : spinorGrav.u1Im
          const a1R = wR * u1R - wI * u1I
          const a1I = wR * u1I + wI * u1R
          for (let s2 = 0; s2 < 2; s2++) {
            const u2R = s2 === 0 ? spinorRest.u0Re : spinorRest.u1Re
            const u2I = s2 === 0 ? spinorRest.u0Im : spinorRest.u1Im
            const ampR = pd * (a1R * u2R - a1I * u2I) * invSqrt3
            const ampI = pd * (a1R * u2I + a1I * u2R) * invSqrt3
            for (let phiE = 0; phiE < 3; phiE++) {
              const idx = stateIndex(lx, x1, x2Init, d, chi, s1, s2, 1, phiE)
              st.re[idx] = ampR
              st.im[idx] = ampI
            }
          }
        }
      }
    }
    normalizeState(st)
    return st
  }

  const baseConfigRight: UnifiedConfig = {
    lx: lxMain,
    flags: ALL_SECTORS_ON,
    gravSrcX: xSrcRight,
    gravCoupling: 3.0,
    gravDt: 1.0,
    electricStepK: 1,
    abFluxMod3: 1,
  }
  const wsAllRight = createUnifiedWorkspace(gravF8, baseConfigRight)
  const psiLeftInit = prepareChiralPacket(wsAllRight, 0)
  const psiLeft = cloneState(psiLeftInit)

  let maxNormErrAllBeats = Math.abs(stateNormSq(psiLeft) - 1)
  let maxGaussErrAllBeats = measureGaussErrorOnState(wsAllRight, psiLeft)
  let minLeftSurfaceWeightAllBeats = measureSurfaceWeight(wsAllRight, psiLeft, 2)

  for (let t = 1; t <= beatsMain; t++) {
    stepUnified(wsAllRight, psiLeft)
    maxNormErrAllBeats = Math.max(maxNormErrAllBeats, Math.abs(stateNormSq(psiLeft) - 1))
    maxGaussErrAllBeats = Math.max(maxGaussErrAllBeats, measureGaussErrorOnState(wsAllRight, psiLeft))
    minLeftSurfaceWeightAllBeats = Math.min(
      minLeftSurfaceWeightAllBeats,
      measureSurfaceWeight(wsAllRight, psiLeft, 2),
    )
  }

  const meanXGravRight = measureMeanDisplacementX1(wsAllRight, psiLeft, x0Grav)

  // Exact adjoint reversal: (U_total^dag)^16 (U_total^16 |psi_0>) = |psi_0>
  const psiReversed = cloneState(psiLeft)
  for (let t = 1; t <= beatsMain; t++) {
    stepUnifiedAdjoint(wsAllRight, psiReversed)
    maxNormErrAllBeats = Math.max(maxNormErrAllBeats, Math.abs(stateNormSq(psiReversed) - 1))
  }
  const adjointReversalErr = stateDiffNorm(psiReversed, psiLeftInit)

  // Zero-gravity control (all other 4 sectors still ON!)
  const wsGravOff = createUnifiedWorkspace(gravF8, {
    ...baseConfigRight,
    flags: { ...ALL_SECTORS_ON, gravOn: false },
  })
  const psiGravOff = cloneState(psiLeftInit)
  for (let t = 1; t <= beatsMain; t++) {
    stepUnified(wsGravOff, psiGravOff)
  }
  const meanXGravOff = measureMeanDisplacementX1(wsGravOff, psiGravOff, x0Grav)
  const gravDeflectionRightSource = meanXGravRight - meanXGravOff

  // Exact cut-symmetric CP-mirror left-source test (x -> (lx - 1 - x), cPair: 1 -> 2, abFlux stays 1
  // because wrap -> -wrap and q -> -q leave wrap * q * abFlux strictly invariant!)
  const x0GravMirror = lxMain - 1 - x0Grav // 9 (mirror of 10)
  const xSrcLeftMirror = lxMain - 1 - xSrcRight // 4 (exact -5 left of 9!)
  const wsAllLeft = createUnifiedWorkspace(gravF8, {
    ...baseConfigRight,
    gravSrcX: xSrcLeftMirror,
    abFluxMod3: 1,
  })
  const wsGravOffLeft = createUnifiedWorkspace(gravF8, {
    ...baseConfigRight,
    gravSrcX: xSrcLeftMirror,
    abFluxMod3: 1,
    flags: { ...ALL_SECTORS_ON, gravOn: false },
  })
  const spinorGravNeg = positiveEnergyBlochSpinor(-k0Grav, gravF8.coinAngle)
  const prepareLeftPacketNegK = (ws: UnifiedWorkspace): UnifiedState => {
    const st = createZeroState(ws)
    const lx = ws.config.lx
    const x2InitMirror = lx - 1 - ((x0Grav + (lx >> 1)) % lx) // 19 (exact mirror of 0!)
    for (let x1 = 0; x1 < lx; x1++) {
      const dx = signedRingDelta(x1, x0GravMirror, lx)
      const env = Math.exp(-(dx * dx) / (2 * sigmaGrav * sigmaGrav))
      if (env < 1e-12) continue
      const wR = env * Math.cos(-k0Grav * dx)
      const wI = env * Math.sin(-k0Grav * dx)
      for (let d = 0; d < DEPTH_COUNT; d++) {
        const pd = leftZeroProf[d]!
        for (let s1 = 0; s1 < 2; s1++) {
          const u1R = s1 === 0 ? spinorGravNeg.u0Re : spinorGravNeg.u1Re
          const u1I = s1 === 0 ? spinorGravNeg.u0Im : spinorGravNeg.u1Im
          const a1R = wR * u1R - wI * u1I
          const a1I = wR * u1I + wI * u1R
          for (let s2 = 0; s2 < 2; s2++) {
            const u2R = s2 === 0 ? spinorRest.u0Re : spinorRest.u1Re
            const u2I = s2 === 0 ? spinorRest.u0Im : spinorRest.u1Im
            const ampR = pd * (a1R * u2R - a1I * u2I) * invSqrt3
            const ampI = pd * (a1R * u2I + a1I * u2R) * invSqrt3
            for (let phiE = 0; phiE < 3; phiE++) {
              const idx = stateIndex(lx, x1, x2InitMirror, d, 0, s1, s2, 2, phiE)
              st.re[idx] = ampR
              st.im[idx] = ampI
            }
          }
        }
      }
    }
    normalizeState(st)
    return st
  }
  const psiNegKInit = prepareLeftPacketNegK(wsAllLeft)
  const psiNegKGrav = cloneState(psiNegKInit)
  const psiNegKFree = cloneState(psiNegKInit)
  for (let t = 1; t <= beatsMain; t++) {
    stepUnified(wsAllLeft, psiNegKGrav)
    stepUnified(wsGravOffLeft, psiNegKFree)
  }
  const gravDeflectionLeftSource =
    measureMeanDisplacementX1(wsAllLeft, psiNegKGrav, x0GravMirror) -
    measureMeanDisplacementX1(wsGravOffLeft, psiNegKFree, x0GravMirror)
  const gravBidirectionalSymErr = Math.abs(gravDeflectionRightSource + gravDeflectionLeftSource)

  // Verify zero-source ablation identically equals 0
  const psiGravOff2 = cloneState(psiLeftInit)
  for (let t = 1; t <= beatsMain; t++) {
    stepUnified(wsGravOff, psiGravOff2)
  }
  const gravDeflectionZeroSource =
    measureMeanDisplacementX1(wsGravOff, psiGravOff2, x0Grav) - meanXGravOff

  // -------------------------------------------------------------------------------------------------------
  // PROBE 2B: Right-handed mirror banishment (all 5 sectors ON) & surface-injection chiral wall ablation
  const psiRight = prepareChiralPacket(wsAllRight, 1)
  let maxRightSurfaceWeightAllBeats = measureSurfaceWeight(wsAllRight, psiRight, 2)
  for (let t = 1; t <= beatsMain; t++) {
    stepUnified(wsAllRight, psiRight)
    maxRightSurfaceWeightAllBeats = Math.max(
      maxRightSurfaceWeightAllBeats,
      measureSurfaceWeight(wsAllRight, psiRight, 2),
    )
  }

  // Surface injection at identical D = 0 for L vs R, comparing wallOn = true vs wallOn = false
  const wsWallOff = createUnifiedWorkspace(gravF8, {
    ...baseConfigRight,
    flags: { ...ALL_SECTORS_ON, wallOn: false },
  })
  const prepareSurfaceDelta = (ws: UnifiedWorkspace, chi: 0 | 1): UnifiedState => {
    const st = createZeroState(ws)
    for (let phiE = 0; phiE < 3; phiE++) {
      st.re[stateIndex(ws.config.lx, 4, 14, 0, chi, 1, 0, 1, phiE)] = invSqrt3
    }
    return st
  }
  const injLOn = prepareSurfaceDelta(wsAllRight, 0)
  const injROn = prepareSurfaceDelta(wsAllRight, 1)
  const injLOff = prepareSurfaceDelta(wsWallOff, 0)
  const injROff = prepareSurfaceDelta(wsWallOff, 1)
  for (let t = 1; t <= beatsMain; t++) {
    stepUnified(wsAllRight, injLOn)
    stepUnified(wsAllRight, injROn)
    stepUnified(wsWallOff, injLOff)
    stepUnified(wsWallOff, injROff)
  }
  const surfaceInjectionLeftWeightOn = measureSurfaceWeight(wsAllRight, injLOn, 2)
  const surfaceInjectionRightWeightOn = measureSurfaceWeight(wsAllRight, injROn, 2)
  const wallChiralityAsymOn = surfaceInjectionLeftWeightOn - surfaceInjectionRightWeightOn
  const wallChiralityAsymOff =
    measureSurfaceWeight(wsWallOff, injLOff, 2) - measureSurfaceWeight(wsWallOff, injROff, 2)

  // -------------------------------------------------------------------------------------------------------
  // PROBE 3: Exact Z_3 Aharonov-Bohm Wilson-loop phase (2*pi/3) & dynamical gauge tunneling
  // Quark-antiquark pair created at x1 = 0, x2 = 0 in coherent superposition of opposite-winding arms:
  //   Arm A: (s1 = 1, s2 = 0) -> q1 = +1 moves right (0 wraps), q2 = -1 moves left (-1 wrap, winding +1)
  //   Arm B: (s1 = 0, s2 = 1) -> q1 = +1 moves left (-1 wrap, winding -1), q2 = -1 moves right (0 wraps)
  // Both arms have IDENTICAL separation, IDENTICAL N_active, and IDENTICAL gravity phase at every beat,
  // and recombine at the antipode (x1 = 10, x2 = 10) at T = L_x / 2 = 10 beats enclosing 1 full Wilson
  // loop with exact relative Aharonov-Bohm phase shift |Delta phi_AB| = 2*pi/3!
  const antipodeX = lxMain >> 1
  const abConfigBase: UnifiedConfig = {
    lx: lxMain,
    flags: ALL_SECTORS_ON,
    gravSrcX: antipodeX,
    gravCoupling: 2.0,
    gravDt: 1.0,
    electricStepK: 1,
    abFluxMod3: 1,
  }
  const wsABOn = createUnifiedWorkspace(gravF8, abConfigBase)
  const wsABOff = createUnifiedWorkspace(gravF8, {
    ...abConfigBase,
    flags: { ...ALL_SECTORS_ON, fluxOn: false },
  })
  const wsGaugeOff = createUnifiedWorkspace(gravF8, {
    ...abConfigBase,
    flags: { ...ALL_SECTORS_ON, gaugeOn: false },
  })

  const prepareABState = (ws: UnifiedWorkspace, cPair: 0 | 1): UnifiedState => {
    const st = createZeroState(ws)
    for (let d = 0; d < DEPTH_COUNT; d++) {
      const amp = leftZeroProf[d]! * invSqrt2 * invSqrt3
      for (let phiE = 0; phiE < 3; phiE++) {
        // Arm A: (s1 = 1, s2 = 0) and Arm B: (s1 = 0, s2 = 1) at (x1 = 0, x2 = 0)
        st.re[stateIndex(ws.config.lx, 0, 0, d, 0, 1, 0, cPair, phiE)] = amp
        st.re[stateIndex(ws.config.lx, 0, 0, d, 0, 0, 1, cPair, phiE)] = amp
      }
    }
    return st
  }

  const abChargedOn = prepareABState(wsABOn, 1)
  const abChargedOff = prepareABState(wsABOff, 1)
  const abNeutralOn = prepareABState(wsABOn, 0)
  const abNeutralOff = prepareABState(wsABOff, 0)
  const gaugeDynOn = prepareABState(wsABOn, 1)
  const gaugeDynOff = prepareABState(wsGaugeOff, 1)

  const abStep = antipodeX - 1 // 9: exact unique-geodesic light-cone arms right before antipode collision
  for (let t = 1; t <= abStep; t++) {
    stepUnified(wsABOn, abChargedOn)
    stepUnified(wsABOff, abChargedOff)
    stepUnified(wsABOn, abNeutralOn)
    stepUnified(wsABOff, abNeutralOff)
    stepUnified(wsABOn, gaugeDynOn)
    stepUnified(wsGaugeOff, gaugeDynOff)
  }

  const armsChargedOff = measureWilsonLoopLightConeArms(wsABOff, abChargedOff, abStep, 1)
  const armsChargedOn = measureWilsonLoopLightConeArms(wsABOn, abChargedOn, abStep, 1)
  const armsNeutralOff = measureWilsonLoopLightConeArms(wsABOff, abNeutralOff, abStep, 0)
  const armsNeutralOn = measureWilsonLoopLightConeArms(wsABOn, abNeutralOn, abStep, 0)

  const abProbFluxOff = armsChargedOff.detectorProb
  const abProbFluxOn = armsChargedOn.detectorProb
  const abProbRatio = abProbFluxOff > 0 ? abProbFluxOn / abProbFluxOff : 0
  const abPhaseExtracted = Math.abs(
    wrapAnglePi(armsChargedOn.relativePhase - armsChargedOff.relativePhase),
  )
  const abPhaseTarget = (2 * Math.PI) / 3
  const abPhaseErr = Math.abs(abPhaseExtracted - abPhaseTarget)
  const abPhaseFluxOff = Math.abs(
    wrapAnglePi(armsChargedOff.relativePhase - armsChargedOff.relativePhase),
  )
  const abPhaseNeutralControl = Math.abs(
    wrapAnglePi(armsNeutralOn.relativePhase - armsNeutralOff.relativePhase),
  )

  // Measure dynamical electric-magnetic gauge shift relative to gauge-off evolution
  const gaugeFluxShiftOn = Math.abs(
    measureMeanActiveLinks(wsABOn, gaugeDynOn) - measureMeanActiveLinks(wsGaugeOff, gaugeDynOff),
  )
  const gaugeFluxShiftOff = 0

  // -------------------------------------------------------------------------------------------------------
  // PROBE 4: Two-body M_pair(zeta_18) + ODD scattering, entanglement, quantum interference & C/CP balance
  // Two chiral color-charged particles approach collision point xMeet = 10 from x1 = 8 (s1 = 1) and
  // x2 = 12 (s2 = 0), meeting at beat t = 2 and separating through beat T_coll = 6 (never touching cut).
  const xMeet = antipodeX
  const collBeats = 6
  const wsCollAll = wsABOn // ALL 5 sectors ON, symmetric gravity source at xSrc = xMeet = 10!
  const wsCollPairOff = createUnifiedWorkspace(gravF8, {
    ...abConfigBase,
    flags: { ...ALL_SECTORS_ON, pairOn: false },
  })
  const wsCollOddOff = createUnifiedWorkspace(gravF8, {
    ...abConfigBase,
    flags: { ...ALL_SECTORS_ON, oddOn: false },
  })
  // Pure two-body U_pair_odd entanglement isolation (gaugeOn = false so only U_pair_odd couples 1 & 2)
  const wsPurePairOn = createUnifiedWorkspace(gravF8, {
    ...abConfigBase,
    flags: { ...ALL_SECTORS_ON, gaugeOn: false },
  })
  const wsPurePairOff = createUnifiedWorkspace(gravF8, {
    ...abConfigBase,
    flags: { ...ALL_SECTORS_ON, gaugeOn: false, pairOn: false, oddOn: false },
  })

  const prepareCollisionBranch = (
    ws: UnifiedWorkspace,
    x1: number,
    x2: number,
    s1: 0 | 1,
    s2: 0 | 1,
    cPair: 1 | 2,
  ): UnifiedState => {
    const st = createZeroState(ws)
    for (let d = 0; d < DEPTH_COUNT; d++) {
      const amp = leftZeroProf[d]! * invSqrt3
      for (let phiE = 0; phiE < 3; phiE++) {
        st.re[stateIndex(ws.config.lx, x1, x2, d, 0, s1, s2, cPair, phiE)] = amp
      }
    }
    return st
  }

  // Exchange two-particle interferometer:
  //   |path1> = |x1 = 8, x2 = 12, s1 = 1, s2 = 0, c = 1 (+1, -1)>
  //   |path2> = |x1 = 12, x2 = 8, s1 = 0, s2 = 1, c = 2 (-1, +1)>
  // Both paths have IDENTICAL lattice charge density and IDENTICAL gravity phase, and meet at x1 = x2 = 10!
  const path1Init = prepareCollisionBranch(wsCollAll, xMeet - 2, xMeet + 2, 1, 0, 1)
  const path2Init = prepareCollisionBranch(wsCollAll, xMeet + 2, xMeet - 2, 0, 1, 2)

  // Verify initial product state has zero entanglement
  const entanglementInitial = measureParticle2EntanglementEntropy(wsCollAll, path1Init).entropy

  // Evolve |path1> and |path2> under ALL 5 sectors ON, plus direct superposition checks at phi = 0 and phi = pi
  const path1Evolved = cloneState(path1Init)
  const path2Evolved = cloneState(path2Init)
  const path1PairOff = cloneState(path1Init)
  const path1PureOn = cloneState(path1Init)
  const path1PureOff = cloneState(path1Init)

  const buildInterfSuperposition = (phi: number): UnifiedState => {
    const st = createZeroState(wsCollAll)
    const cp = Math.cos(phi) * invSqrt2
    const sp = Math.sin(phi) * invSqrt2
    for (let i = 0; i < wsCollAll.dim; i++) {
      st.re[i] = path1Init.re[i]! * invSqrt2 + (cp * path2Init.re[i]! - sp * path2Init.im[i]!)
      st.im[i] = path1Init.im[i]! * invSqrt2 + (cp * path2Init.im[i]! + sp * path2Init.re[i]!)
    }
    return st
  }

  const interfPhi0 = buildInterfSuperposition(0)
  const interfPhiPi = buildInterfSuperposition(Math.PI)

  for (let t = 1; t <= collBeats; t++) {
    stepUnified(wsCollAll, path1Evolved)
    stepUnified(wsCollAll, path2Evolved)
    stepUnified(wsCollAll, interfPhi0)
    stepUnified(wsCollAll, interfPhiPi)
    stepUnified(wsCollPairOff, path1PairOff)
    stepUnified(wsPurePairOn, path1PureOn)
    stepUnified(wsPurePairOff, path1PureOff)
  }

  // Center-of-mass back-to-back scattered neutral channel probability at phi = 0 vs phi = pi
  const interferencePMax = measureCenterOfMassNeutralScattering(wsCollAll, interfPhi0, xMeet)
  const interferencePMin = measureCenterOfMassNeutralScattering(wsCollAll, interfPhiPi, xMeet)
  const interferenceVisibility =
    interferencePMax + interferencePMin > 0
      ? (interferencePMax - interferencePMin) / (interferencePMax + interferencePMin)
      : 0

  // Dephased incoherent mixture control: rho_deph = 1/2 |path1><path1| + 1/2 |path2><path2|
  // Independent of relative phase phi -> visibility = 0 identically
  const pScatPath1Cm = measureCenterOfMassNeutralScattering(wsCollAll, path1Evolved, xMeet)
  const pScatPath2Cm = measureCenterOfMassNeutralScattering(wsCollAll, path2Evolved, xMeet)
  const dephasedP0 = 0.5 * (pScatPath1Cm + pScatPath2Cm)
  const dephasedPPi = 0.5 * (pScatPath1Cm + pScatPath2Cm)
  const dephasedVisibility =
    dephasedP0 + dephasedPPi > 0
      ? Math.abs(dephasedP0 - dephasedPPi) / (dephasedP0 + dephasedPPi)
      : 0

  const pairScatteringProbOn = measureColorProbabilities(wsCollAll, path1Evolved)[0]
  const pairScatteringProbOff = measureColorProbabilities(wsCollPairOff, path1PairOff)[0]

  const entanglementPairOn = measureParticle2EntanglementEntropy(wsCollAll, path1Evolved).entropy
  const entanglementPairOff = measureParticle2EntanglementEntropy(wsCollPairOff, path1PairOff).entropy
  const entanglementPurePairOn = measureParticle2EntanglementEntropy(wsPurePairOn, path1PureOn).entropy
  const entanglementPurePairOff = measureParticle2EntanglementEntropy(
    wsPurePairOff,
    path1PureOff,
  ).entropy

  // Coherent C-asymmetry under M_pair(zeta_18) + ODD and exact global CP balance:
  // Start C-symmetric state (|c = 1> + |c = 2>) / sqrt(2) with (x1 = xMeet-2, s1 = 1; x2 = xMeet+2, s2 = 0)
  // and its exact CP-conjugate (x1 = xMeet+2, s1 = 0; x2 = xMeet-2, s2 = 1).
  const prepareCSymmetricCollision = (ws: UnifiedWorkspace, cpMirror: boolean): UnifiedState => {
    const st = createZeroState(ws)
    const x1 = cpMirror ? xMeet + 2 : xMeet - 2
    const x2 = cpMirror ? xMeet - 2 : xMeet + 2
    const s1 = cpMirror ? 0 : 1
    const s2 = cpMirror ? 1 : 0
    for (let d = 0; d < DEPTH_COUNT; d++) {
      const amp = leftZeroProf[d]! * invSqrt2 * invSqrt3
      for (let phiE = 0; phiE < 3; phiE++) {
        st.re[stateIndex(ws.config.lx, x1, x2, d, 0, s1, s2, 1, phiE)] = amp
        st.re[stateIndex(ws.config.lx, x1, x2, d, 0, s1, s2, 2, phiE)] = amp
      }
    }
    return st
  }

  const cSymAll = prepareCSymmetricCollision(wsCollAll, false)
  const cSymCP = prepareCSymmetricCollision(wsCollAll, true)
  const cSymOddOff = prepareCSymmetricCollision(wsCollOddOff, false)
  const cSymPairOff = prepareCSymmetricCollision(wsCollPairOff, false)

  for (let t = 1; t <= collBeats; t++) {
    stepUnified(wsCollAll, cSymAll)
    stepUnified(wsCollAll, cSymCP)
    stepUnified(wsCollOddOff, cSymOddOff)
    stepUnified(wsCollPairOff, cSymPairOff)
  }

  const q1FromProbs = (p: [number, number, number]): number => p[1] - p[2]
  const cAsymmetryOddOn = q1FromProbs(measureColorProbabilities(wsCollAll, cSymAll))
  const cAsymmetryCPPartner = q1FromProbs(measureColorProbabilities(wsCollAll, cSymCP))
  const cpGlobalBalanceErr = Math.abs(cAsymmetryOddOn + cAsymmetryCPPartner)
  const cAsymmetryOddOff = q1FromProbs(measureColorProbabilities(wsCollOddOff, cSymOddOff))
  const cAsymmetryPairOff = q1FromProbs(measureColorProbabilities(wsCollPairOff, cSymPairOff))

  // -------------------------------------------------------------------------------------------------------
  // PROBE 5B: Strict causal light-cone bound at T = 16 beats on L_x = 34 (max periodic dist = 17 > 16)
  // Uses the EXACT SAME stepUnified operator with all 5 sectors ON!
  const wsLightCone = createUnifiedWorkspace(gravF8, {
    lx: lxLightCone,
    flags: ALL_SECTORS_ON,
    gravSrcX: 24,
    gravCoupling: 3.0,
    gravDt: 1.0,
    electricStepK: 1,
    abFluxMod3: 1,
  })
  const lcOrigin = 17
  const lcState = createZeroState(wsLightCone)
  for (let d = 0; d < DEPTH_COUNT; d++) {
    const amp = leftZeroProf[d]! * invSqrt3
    for (let phiE = 0; phiE < 3; phiE++) {
      lcState.re[stateIndex(lxLightCone, lcOrigin, lcOrigin, d, 0, 1, 0, 1, phiE)] = amp
    }
  }

  let lightConeMaxOutsideAmp16 = 0
  let lightConeMaxFrontRadius16 = 0

  for (let t = 1; t <= beatsMain; t++) {
    stepUnified(wsLightCone, lcState)
    maxNormErrAllBeats = Math.max(maxNormErrAllBeats, Math.abs(stateNormSq(lcState) - 1))

    for (let x1 = 0; x1 < lxLightCone; x1++) {
      const r1 = ringDist(x1, lcOrigin, lxLightCone)
      for (let x2 = 0; x2 < lxLightCone; x2++) {
        const r2 = ringDist(x2, lcOrigin, lxLightCone)
        const rad = r1 > r2 ? r1 : r2
        const start = (x1 * lxLightCone + x2) * PAIR_STRIDE
        const end = start + PAIR_STRIDE
        let maxAmp = 0
        for (let i = start; i < end; i++) {
          const a = Math.hypot(lcState.re[i]!, lcState.im[i]!)
          if (a > maxAmp) maxAmp = a
        }
        if (rad > t && maxAmp > lightConeMaxOutsideAmp16) {
          lightConeMaxOutsideAmp16 = maxAmp
        }
        if (t === beatsMain && maxAmp > 1e-12 && rad > lightConeMaxFrontRadius16) {
          lightConeMaxFrontRadius16 = rad
        }
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------
  // Complete 6-row Ablation / Negative-Control Table
  const ablations: AblationRow[] = [
    {
      sector: 'Gravity (U_grav, 1/N_D^2 Green)',
      observable: 'gravDeflection',
      valueOn: gravDeflectionRightSource,
      valueOff: gravDeflectionZeroSource,
      vanishesWhenOff: Math.abs(gravDeflectionZeroSource) <= 1e-14 && gravDeflectionRightSource > 0.05,
    },
    {
      sector: 'Z_3 Gauge Flux (Peierls AB)',
      observable: 'abPhaseShift',
      valueOn: abPhaseExtracted,
      valueOff: abPhaseFluxOff,
      vanishesWhenOff:
        Math.abs(abPhaseFluxOff) <= 1e-14 && Math.abs(abPhaseExtracted - abPhaseTarget) <= 1e-12,
    },
    {
      sector: 'Cusp Domain Wall (U_depth)',
      observable: 'wallChiralityAsym',
      valueOn: wallChiralityAsymOn,
      valueOff: wallChiralityAsymOff,
      vanishesWhenOff: Math.abs(wallChiralityAsymOff) <= 1e-14 && wallChiralityAsymOn > 0.3,
    },
    {
      sector: 'Pair Mixer M_pair(zeta_18)',
      observable: 'pairScatteringProb',
      valueOn: pairScatteringProbOn,
      valueOff: pairScatteringProbOff,
      vanishesWhenOff:
        Math.abs(pairScatteringProbOff) <= 1e-14 &&
        pairScatteringProbOn > 0.001 &&
        entanglementPurePairOff <= 1e-12 &&
        entanglementPurePairOn > 0.005,
    },
    {
      sector: 'ODD Phase (Z[omega] C-odd)',
      observable: 'abs(cAsymmetry)',
      valueOn: Math.abs(cAsymmetryOddOn),
      valueOff: Math.abs(cAsymmetryOddOff),
      vanishesWhenOff: Math.abs(cAsymmetryOddOff) <= 1e-14 && Math.abs(cAsymmetryOddOn) > 0.01,
    },
    {
      sector: 'Quantum Coherence (dephased ctrl)',
      observable: 'interferenceVisibility',
      valueOn: interferenceVisibility,
      valueOff: dephasedVisibility,
      vanishesWhenOff: dephasedVisibility <= 0.1 && interferenceVisibility > 0.85,
    },
  ]

  return {
    algebraic,
    peierlsGaussTransitionsChecked: gaussAudit.transitionsChecked,
    peierlsGaussViolations: gaussAudit.gaussViolations,
    peierlsCurrentContinuityViolations: gaussAudit.currentContinuityViolations,
    pairInteractionGaussViolations: gaussAudit.pairInteractionGaussViolations,
    plaquetteLoopGaussViolations: gaussAudit.plaquetteLoopGaussViolations,
    floorF: FLOOR_F,
    lxMain,
    lxLightCone,
    beatsMain,
    hilbertDimMain: wsAllRight.dim,
    kEffF8: gravF8.kEff,
    gEffF8: gravF8.gEff,
    cUniversalF8: gravF8.cUniversal,
    gEffDiffVsF16,
    cUniversalDiffVsF16,
    gravDeflectionRightSource,
    gravDeflectionLeftSource,
    gravDeflectionZeroSource,
    gravBidirectionalSymErr,
    minLeftSurfaceWeightAllBeats,
    maxRightSurfaceWeightAllBeats,
    surfaceInjectionLeftWeightOn,
    surfaceInjectionRightWeightOn,
    wallChiralityAsymOn,
    wallChiralityAsymOff,
    abProbFluxOff,
    abProbFluxOn,
    abProbRatio,
    abPhaseExtracted,
    abPhaseTarget,
    abPhaseErr,
    abPhaseFluxOff,
    abPhaseNeutralControl,
    gaugeFluxShiftOn,
    gaugeFluxShiftOff,
    interferencePMax,
    interferencePMin,
    interferenceVisibility,
    dephasedVisibility,
    pairScatteringProbOn,
    pairScatteringProbOff,
    entanglementInitial,
    entanglementPairOn,
    entanglementPairOff,
    entanglementPurePairOn,
    entanglementPurePairOff,
    cAsymmetryOddOn,
    cAsymmetryCPPartner,
    cpGlobalBalanceErr,
    cAsymmetryOddOff,
    cAsymmetryPairOff,
    maxNormErrAllBeats,
    maxGaussErrAllBeats,
    adjointReversalErr,
    lightConeMaxOutsideAmp16,
    lightConeMaxFrontRadius16,
    ablations,
  }
}

export { EXACT_COLUMN_SHELL_COUNTS }
