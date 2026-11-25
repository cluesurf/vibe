// EXACT UNSCREENED 1/r SLOPE, GEOMETRIC NEWTON COUPLING G_eff, AND INVERSE-SQUARE 2-BODY FORCE
// FROM PARAMETER-FREE PAIR-DENSITY WARP w(D) = 1 / N_D^2 (= l^-6) ON THE {3,4,3,4} CUSP COLUMN
// (E-GRV-0157, gaps B-52, m-10; follow-up to E-GRV-0156).
//
// Why E-GRV-0156 saw a raw log-log slope of -1.82 on side = 16:
//   Subtracting G(L/2 = 8) on a small L = 16 periodic box turns 1/r into 1/r - 1/8, which drops steeply to 0 at r = 8.
//
// Here we solve the exact same parameter-free pair-density warped cusp column (N_D = 1, 18, 330, 6034;
// canonical unaliased single-face lateral links [1, 4, 20, 100], cumulative 5^D = [1, 5, 25, 125], matching
// Vibe/Geometry.lean and E-FND-0185; w(D) = 1 / N_D^2) on large periodic 3D husks (side = 32 and side = 64) using a fast exact 1/48 octahedral-wedge
// momentum sum (0 <= ix <= iy <= iz <= side/2), WITHOUT subtracting G(L/2). Instead we apply the exact periodic
// simple-cubic finite-size relation for -Delta G_per = delta - 1/L^3:
//   G_inf(r) = G_per(r) + c_M / (K_eff * L) - r^2 / (6 * K_eff * L^3) + O(r^4 / L^5),
//   c_M = 2.83729747948549 / (4 * pi)
// and compare G_warped(r) directly against BOTH:
//   (a) the exact infinite-volume 3D simple cubic lattice Green's function G_3D(r) / K_eff (cross-checked against
//       Watson's exact G_3D(0) = 0.252731009858663 and besselLatticeGreen), AND
//   (b) the continuum Newtonian law 1 / (4 * pi * K_eff * r) = G_eff / r and inverse-square force F(r) ~ 1 / r^2
//       in the far-field regime r >= 6 where the discrete cubic-lattice quadrupole UV term (1 / (4 r^2) along (r,0,0),
//       +8.15% at r = 1 and +7.79% at r = 2 even for exact G_3D) falls below 1%.
//
// NOTHING MOVES: pure deterministic floating-point Schur complement + 1/48 octahedral-wedge Fourier sum. Zero RNG.

import { besselLatticeGreen } from '@/code/measure/cusp-green'

// Exact {3,4,3,4} cusp per-column shell dock counts at depths D = 0..3 (E-RLT-0122, E-GRV-0156)
export const EXACT_COLUMN_SHELL_COUNTS = [1, 18, 330, 6034] as const
const R_VOL = EXACT_COLUMN_SHELL_COUNTS[3] / EXACT_COLUMN_SHELL_COUNTS[2]

// Exact simple-cubic Wigner / Madelung constant: alpha_M = 2.83729747948549..., c_M = alpha_M / (4 * pi)
const WIGNER_SIMPLE_CUBIC = 2.83729747948549
export const MADELUNG_C_M = WIGNER_SIMPLE_CUBIC / (4 * Math.PI)

// Exact Watson triple integral for the massless simple cubic lattice Green's function at the origin: G_3D(0,0,0)
export const WATSON_G3D_ZERO = 0.252731009858663

type ColumnModel = {
  readonly floorF: number
  readonly warped: boolean
  readonly cLat: Float64Array
  readonly cVert: Float64Array
  readonly resistanceToFloor: number
  readonly y0Zero: number
  readonly kEff: number
  readonly gEff: number
}

// Canonical unaliased single-face {4,3,4} cusp lateral inter-column links per cubic neighbor at depth d:
//   d = 0: 1 link per cubic neighbor (6 total)
//   d >= 1: 4 * 5^(d - 1) links -> sequence [1, 4, 20, 100, ...], cumulative 5^D = [1, 5, 25, 125, ...]
// Matches Vibe/Geometry.lean (cuspLateralLinks / thm5_cusp_lateral_cumulative) and E-FND-0185.
export function singleFaceLateralLinksPerNeighbor(d: number): number {
  if (d === 0) return 1
  return 4 * 5 ** (d - 1)
}

// Aliased period = 2 torus control lateral link count (double-counts opposite faces on period = 2):
//   d = 0: 1, d = 1: 10, d >= 2: 8 * 5^(d - 1) -> sequence [1, 10, 40, 200, ...], cumulative 2 * 5^D
export function period2TorusLateralLinksPerNeighbor(d: number): number {
  if (d === 0) return 1
  if (d === 1) return 10
  return 8 * 5 ** (d - 1)
}

function buildColumnModel(floorF: number, warped: boolean, aliasedPeriod2 = false): ColumnModel {
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
  let resistanceToFloor = 0
  const latFn = aliasedPeriod2
    ? period2TorusLateralLinksPerNeighbor
    : singleFaceLateralLinksPerNeighbor

  for (let d = 0; d <= floorF; d++) {
    const nd = nShell[d]!
    const nd1 = nShell[d + 1]!
    if (warped) {
      // w(d) = 1 / N(d)^2 (= l^-6); geometric mean sqrt(w(d) w(d+1)) = 1 / (N(d) N(d+1))
      cLat[d] = latFn(d) / (nd * nd)
      cVert[d] = 18 / nd1
    } else {
      cLat[d] = latFn(d)
      cVert[d] = 18 * nd
    }
    resistanceToFloor += 1 / cVert[d]!
  }

  // Exact value Y_0(0) and exact first derivative K_eff = dY_0 / d(lambda)|_{lambda = 0}
  // from differentiating the Riccati recurrence analytically
  let y = cVert[floorF]!
  let dy = cLat[floorF]!
  for (let d = floorF - 1; d >= 0; d--) {
    const cv = cVert[d]!
    const denom = cv + y
    const ratio = cv / denom
    dy = cLat[d]! + ratio * ratio * dy
    y = (cv * y) / denom
  }

  return {
    floorF,
    warped,
    cLat,
    cVert,
    resistanceToFloor,
    y0Zero: y,
    kEff: dy,
    gEff: 1 / (4 * Math.PI * dy),
  }
}

function schurAtLambda(model: ColumnModel, lam: number): number {
  const { floorF, cLat, cVert } = model
  let y = cLat[floorF]! * lam + cVert[floorF]!
  for (let d = floorF - 1; d >= 0; d--) {
    const cv = cVert[d]!
    y = cLat[d]! * lam + (cv * y) / (cv + y)
  }
  return y
}

// Fast exact 1/48 octahedral-wedge 3D momentum sum for G(r, 0, 0), r = 0..maxR.
// Exploits full O_h symmetry (permutations and sign flips of kx, ky, kz) on an even side L.
function solveWedgeAlongX(
  side: number,
  maxR: number,
  evalGk: (lam: number) => number,
  skipZero: boolean,
  madelungShift: number,
): { readonly values: number[]; readonly wedgePoints: number; readonly orbitWeightSum: number } {
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
  let wedgePoints = 0
  let orbitWeightSum = 0

  for (let a = 0; a <= half; a++) {
    const ca = cos1[a]!
    const ma = mult[a]!
    const baseA = a * stride
    for (let b = a; b <= half; b++) {
      const cb = cos1[b]!
      const mb = mult[b]!
      const baseB = b * stride
      for (let c = b; c <= half; c++) {
        if (skipZero && a === 0 && b === 0 && c === 0) continue
        wedgePoints++
        const lam = 2 * (3 - ca - cb - cos1[c]!)
        const gk = evalGk(lam)
        const mc = mult[c]!
        const baseC = c * stride

        if (a === b && b === c) {
          const w = ma * ma * ma
          orbitWeightSum += w
          const gkw = gk * w
          for (let r = 0; r <= maxR; r++) {
            accum[r] = accum[r]! + gkw * cosTable[baseA + r]!
          }
        } else if (a === b) {
          const w = ma * ma * mc
          orbitWeightSum += 3 * w
          const gkw = gk * w
          for (let r = 0; r <= maxR; r++) {
            accum[r] = accum[r]! + gkw * (2 * cosTable[baseA + r]! + cosTable[baseC + r]!)
          }
        } else if (b === c) {
          const w = ma * mb * mb
          orbitWeightSum += 3 * w
          const gkw = gk * w
          for (let r = 0; r <= maxR; r++) {
            accum[r] = accum[r]! + gkw * (cosTable[baseA + r]! + 2 * cosTable[baseB + r]!)
          }
        } else {
          const w = 2 * ma * mb * mc
          orbitWeightSum += 3 * w
          const gkw = gk * w
          for (let r = 0; r <= maxR; r++) {
            accum[r] =
              accum[r]! + gkw * (cosTable[baseA + r]! + cosTable[baseB + r]! + cosTable[baseC + r]!)
          }
        }
      }
    }
  }

  const vol = side * side * side
  const values = new Array<number>(stride)
  for (let r = 0; r <= maxR; r++) {
    values[r] = accum[r]! / vol + madelungShift
  }

  return { values, wedgePoints, orbitWeightSum }
}

// Subtract the exact neutralizing-background torus term r^2 / (6 * K_eff * L^3) so finite-size error drops to O(r^4 / L^5)
function removeTorusBackground(
  madelungValues: readonly number[],
  side: number,
  kEff: number,
): number[] {
  const denom = 6 * kEff * side * side * side
  return madelungValues.map((v, r) => v - (r * r) / denom)
}

// Naive full L^3 momentum sum (used only on small L = 16 as an exact cross-check of the 1/48 wedge reduction)
function solveFullAlongX(
  side: number,
  maxR: number,
  evalGk: (lam: number) => number,
  skipZero: boolean,
  madelungShift: number,
): number[] {
  const twoPiOverL = (2 * Math.PI) / side
  const cosTable = Float64Array.from({ length: side }, (_, i) => Math.cos(twoPiOverL * i))
  const accum = new Float64Array(maxR + 1)

  for (let ix = 0; ix < side; ix++) {
    const cx = cosTable[ix]!
    for (let iy = 0; iy < side; iy++) {
      const cy = cosTable[iy]!
      for (let iz = 0; iz < side; iz++) {
        if (skipZero && ix === 0 && iy === 0 && iz === 0) continue
        const lam = 2 * (3 - cx - cy - cosTable[iz]!)
        const gk = evalGk(lam)
        for (let r = 0; r <= maxR; r++) {
          accum[r] = accum[r]! + gk * cosTable[(ix * r) % side]!
        }
      }
    }
  }

  const vol = side * side * side
  const values = new Array<number>(maxR + 1)
  for (let r = 0; r <= maxR; r++) {
    values[r] = accum[r]! / vol + madelungShift
  }
  return values
}

// Ordinary least-squares log-log slope over pairs (r, value(r))
function fitLogLogSlope(rs: readonly number[], vals: readonly number[]): number {
  const n = rs.length
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (let i = 0; i < n; i++) {
    const x = Math.log(rs[i]!)
    const y = Math.log(Math.max(1e-300, vals[i]!))
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
  }
  return (n * sxy - sx * sy) / (n * sxx - sx * sx)
}

export type FloorConvergenceEntry = {
  readonly floorF: number
  readonly resistanceToFloor: number
  readonly kEff: number
  readonly gEff: number
  readonly gWarpedR1: number
  readonly gWarpedR5: number
  readonly gWarpedR10: number
}

export type PairDensityGravitySlopeResult = {
  // Exact 1/48 wedge verification & infinite-lattice reference checks
  readonly wedgePoints64: number
  readonly orbitCountOk64: boolean
  readonly wedgeVsFullMaxErr16: number
  readonly watsonOriginRelErr64: number
  readonly besselMassiveCheckRelErr: number

  // Geometric stiffness & Newton coupling convergence across floors F = 6, 9, 12, 16
  readonly floorConvergence: readonly FloorConvergenceEntry[]
  readonly kEffInfiniteSeries: number
  readonly kEffF12: number
  readonly kEffF16: number
  readonly kEffDiffF16VsF12: number
  readonly gEffF16: number
  readonly maxFieldDiffF16VsF12: number

  // Side 32 vs Side 64 finite-size convergence (Madelung-only & background-corrected)
  readonly gWarpedMadelung32: readonly number[] // r = 0..13
  readonly gWarpedMadelung64: readonly number[] // r = 0..13
  readonly gWarpedInf32: readonly number[] // r = 0..13
  readonly gWarpedInf64: readonly number[] // r = 0..13
  readonly gCubic3DInf64: readonly number[] // r = 0..13, G_3D(r) / K_eff reference
  readonly maxRelDiffSide32Vs64MadelungR1to6: number
  readonly maxRelDiffSide32Vs64InfR1to6: number

  // Exact 1/r slopes on side = 64 (F = 16) vs exact 3D simple cubic lattice reference
  readonly slope1to8Side64: number
  readonly slope1to8Cubic3D64: number
  readonly slope2to10Side64: number
  readonly slope2to10Cubic3D64: number
  readonly slope3to10Madelung64: number
  readonly slope4to12Madelung64: number
  readonly slope4to12Inf64: number
  readonly slope6to12Inf64: number

  // Flatness: (a) against exact 3D cubic lattice G_3D(r)/K_eff across r = 2..10,
  //           (b) against continuum 1/(4*pi*K_eff*r) across far-field r = 6..12 (and full r = 2..10)
  readonly ratioToCubicLatticeR2to10: readonly number[]
  readonly maxLatticeMatchErrR2to10: number
  readonly normalizedProductR2to12: readonly number[] // 4 * pi * K_eff * r * G_warped_inf(r) for r = 2..12
  readonly maxContinuumFlatnessErrR6to12: number

  // 2-body pair-overlap potential V_12(r) = -G_warped(r) and inverse-square force F(r)
  readonly potentialV12R1to12: readonly number[]
  readonly strictlyMonotonicAttraction: boolean
  readonly forceCtrMagnitudeR2to12: readonly number[] // |F_ctr(r)| = (V(r+1) - V(r-1)) / 2
  readonly forceMidMagnitudeR1to12: readonly number[] // |F_mid(r+1/2)| = V(r+1) - V(r)
  readonly forceSlopeCtrR2to9: number
  readonly forceSlopeCtrCubic3DR2to9: number
  readonly forceSlopeCtrR6to12: number
  readonly forceSlopeMidR5to12: number
  readonly maxForceLatticeMatchErrR2to10: number

  // Control: aliased period = 2 torus comparison ([1, 10, 40, 200] -> K_eff = 1.031237, G_eff = 0.077167)
  readonly period2TorusComparison: {
    readonly kEffF16: number
    readonly gEffF16: number
    readonly kEffRelShiftVsCanonical: number
  }

  // Control: unweighted raw bulk w(D) = 1 on exact same side = 64 grid (F = 12)
  readonly rawResistanceF12: number
  readonly rawHuskG1: number
  readonly rawHuskG2: number
  readonly rawHuskG5: number
  readonly rawRatio2to1: number
  readonly rawRatio5to1: number
}

export function runPairDensityGravitySlope(): PairDensityGravitySlopeResult {
  const maxR = 13

  // 1. Floor convergence across F = 6, 9, 12, 16 on side = 64
  const floors = [6, 9, 12, 16] as const
  const floorConvergence: FloorConvergenceEntry[] = []
  let modelF12!: ColumnModel
  let modelF16!: ColumnModel
  let gWarpedMadelung64F12: number[] = []
  let gWarpedMadelung64F16: number[] = []
  let wedgePoints64 = 0
  let orbitCountOk64 = false

  for (const f of floors) {
    const model = buildColumnModel(f, true)
    const madelung = MADELUNG_C_M / (model.kEff * 64)
    const sol = solveWedgeAlongX(64, maxR, lam => 1 / schurAtLambda(model, lam), true, madelung)
    floorConvergence.push({
      floorF: f,
      resistanceToFloor: model.resistanceToFloor,
      kEff: model.kEff,
      gEff: model.gEff,
      gWarpedR1: sol.values[1]!,
      gWarpedR5: sol.values[5]!,
      gWarpedR10: sol.values[10]!,
    })
    if (f === 12) {
      modelF12 = model
      gWarpedMadelung64F12 = sol.values
    }
    if (f === 16) {
      modelF16 = model
      gWarpedMadelung64F16 = sol.values
      wedgePoints64 = sol.wedgePoints
      orbitCountOk64 = sol.orbitWeightSum === 64 * 64 * 64 - 1
    }
  }

  // Exact infinite-floor analytical sum K_inf = sum_{d=0}^infty cLat(d)
  let kEffInfiniteSeries = 0
  for (let d = 0; d <= 16; d++) {
    kEffInfiniteSeries += modelF16.cLat[d]!
  }

  const kEffDiffF16VsF12 = Math.abs(modelF16.kEff - modelF12.kEff)
  let maxFieldDiffF16VsF12 = 0
  for (let r = 1; r <= 10; r++) {
    maxFieldDiffF16VsF12 = Math.max(
      maxFieldDiffF16VsF12,
      Math.abs(gWarpedMadelung64F16[r]! - gWarpedMadelung64F12[r]!),
    )
  }

  // 2. Verify 1/48 octahedral-wedge solver against naive full L^3 sum on side = 16
  const madelung16 = MADELUNG_C_M / (modelF16.kEff * 16)
  const wedge16 = solveWedgeAlongX(
    16,
    6,
    lam => 1 / schurAtLambda(modelF16, lam),
    true,
    madelung16,
  )
  const full16 = solveFullAlongX(
    16,
    6,
    lam => 1 / schurAtLambda(modelF16, lam),
    true,
    madelung16,
  )
  let wedgeVsFullMaxErr16 = 0
  for (let r = 0; r <= 6; r++) {
    wedgeVsFullMaxErr16 = Math.max(
      wedgeVsFullMaxErr16,
      Math.abs(wedge16.values[r]! - full16[r]!),
    )
  }

  // 3. Solve side = 32 (F = 16) and compute background-corrected infinite-volume estimators
  const madelung32 = MADELUNG_C_M / (modelF16.kEff * 32)
  const gWarpedMadelung32 = solveWedgeAlongX(
    32,
    maxR,
    lam => 1 / schurAtLambda(modelF16, lam),
    true,
    madelung32,
  ).values
  const gWarpedInf32 = removeTorusBackground(gWarpedMadelung32, 32, modelF16.kEff)
  const gWarpedInf64 = removeTorusBackground(gWarpedMadelung64F16, 64, modelF16.kEff)

  let maxRelDiffSide32Vs64MadelungR1to6 = 0
  let maxRelDiffSide32Vs64InfR1to6 = 0
  for (let r = 1; r <= 6; r++) {
    maxRelDiffSide32Vs64MadelungR1to6 = Math.max(
      maxRelDiffSide32Vs64MadelungR1to6,
      Math.abs(gWarpedMadelung32[r]! - gWarpedMadelung64F16[r]!) / gWarpedMadelung64F16[r]!,
    )
    maxRelDiffSide32Vs64InfR1to6 = Math.max(
      maxRelDiffSide32Vs64InfR1to6,
      Math.abs(gWarpedInf32[r]! - gWarpedInf64[r]!) / gWarpedInf64[r]!,
    )
  }

  // 4. Exact 3D simple cubic lattice Green's function reference G_3D(r) on side = 64
  //    Cross-check G_3D(0) against Watson's exact triple integral, and cross-check massive wedge vs besselLatticeGreen.
  const cubic64Madelung = solveWedgeAlongX(64, maxR, lam => 1 / lam, true, MADELUNG_C_M / 64).values
  const watsonOriginRelErr64 = Math.abs(cubic64Madelung[0]! - WATSON_G3D_ZERO) / WATSON_G3D_ZERO

  const massiveWedge64 = solveWedgeAlongX(64, 4, lam => 1 / (1 + lam), false, 0).values
  const massiveBesselR2 = besselLatticeGreen(7, 2, 0, 0)
  const besselMassiveCheckRelErr =
    Math.abs(massiveWedge64[2]! - massiveBesselR2) / massiveBesselR2

  const cubic64Inf = removeTorusBackground(cubic64Madelung, 64, 1)
  const gCubic3DInf64 = cubic64Inf.map(v => v / modelF16.kEff)

  // 5. Log-log slopes and flatness
  const range = (a: number, b: number): number[] =>
    Array.from({ length: b - a + 1 }, (_, i) => a + i)
  const rs1to8 = range(1, 8)
  const rs2to10 = range(2, 10)
  const rs3to10 = range(3, 10)
  const rs4to12 = range(4, 12)
  const rs6to12 = range(6, 12)
  const rs2to12 = range(2, 12)

  const slope1to8Side64 = fitLogLogSlope(
    rs1to8,
    rs1to8.map(r => gWarpedInf64[r]!),
  )
  const slope1to8Cubic3D64 = fitLogLogSlope(
    rs1to8,
    rs1to8.map(r => gCubic3DInf64[r]!),
  )
  const slope2to10Side64 = fitLogLogSlope(
    rs2to10,
    rs2to10.map(r => gWarpedInf64[r]!),
  )
  const slope2to10Cubic3D64 = fitLogLogSlope(
    rs2to10,
    rs2to10.map(r => gCubic3DInf64[r]!),
  )
  const slope3to10Madelung64 = fitLogLogSlope(
    rs3to10,
    rs3to10.map(r => gWarpedMadelung64F16[r]!),
  )
  const slope4to12Madelung64 = fitLogLogSlope(
    rs4to12,
    rs4to12.map(r => gWarpedMadelung64F16[r]!),
  )
  const slope4to12Inf64 = fitLogLogSlope(
    rs4to12,
    rs4to12.map(r => gWarpedInf64[r]!),
  )
  const slope6to12Inf64 = fitLogLogSlope(
    rs6to12,
    rs6to12.map(r => gWarpedInf64[r]!),
  )

  const ratioToCubicLatticeR2to10 = rs2to10.map(r => gWarpedInf64[r]! / gCubic3DInf64[r]!)
  const maxLatticeMatchErrR2to10 = Math.max(
    ...ratioToCubicLatticeR2to10.map(v => Math.abs(v - 1)),
  )

  const normalizedProductR2to12 = rs2to12.map(
    r => 4 * Math.PI * modelF16.kEff * r * gWarpedInf64[r]!,
  )
  const maxContinuumFlatnessErrR6to12 = Math.max(
    ...rs6to12.map(r => Math.abs(4 * Math.PI * modelF16.kEff * r * gWarpedInf64[r]! - 1)),
  )

  // 6. Exact 2-body pair-overlap potential V_12(r) = -G_warped(r) and inverse-square force F(r)
  const potentialV12R1to12: number[] = []
  for (let r = 1; r <= 12; r++) {
    potentialV12R1to12.push(-gWarpedInf64[r]!)
  }
  let strictlyMonotonicAttraction = true
  for (let i = 0; i < potentialV12R1to12.length - 1; i++) {
    if (!(potentialV12R1to12[i + 1]! > potentialV12R1to12[i]!)) {
      strictlyMonotonicAttraction = false
    }
  }

  // Centered difference |F_ctr(r)| = (V(r + 1) - V(r - 1)) / 2 = (G(r - 1) - G(r + 1)) / 2 for r = 2..12
  const forceCtrMagnitudeR2to12: number[] = []
  const cubicForceCtrMagnitudeR2to12: number[] = []
  for (let r = 2; r <= 12; r++) {
    forceCtrMagnitudeR2to12.push((gWarpedInf64[r - 1]! - gWarpedInf64[r + 1]!) / 2)
    cubicForceCtrMagnitudeR2to12.push((gCubic3DInf64[r - 1]! - gCubic3DInf64[r + 1]!) / 2)
  }

  // Half-integer midpoint difference |F_mid(r + 1/2)| = V(r + 1) - V(r) = G(r) - G(r + 1) for r = 1..12
  const forceMidMagnitudeR1to12: number[] = []
  for (let r = 1; r <= 12; r++) {
    forceMidMagnitudeR1to12.push(gWarpedInf64[r]! - gWarpedInf64[r + 1]!)
  }

  const rs2to9 = range(2, 9)
  const rs5to12 = range(5, 12)
  const forceSlopeCtrR2to9 = fitLogLogSlope(
    rs2to9,
    rs2to9.map(r => forceCtrMagnitudeR2to12[r - 2]!),
  )
  const forceSlopeCtrCubic3DR2to9 = fitLogLogSlope(
    rs2to9,
    rs2to9.map(r => cubicForceCtrMagnitudeR2to12[r - 2]!),
  )
  const forceSlopeCtrR6to12 = fitLogLogSlope(
    rs6to12,
    rs6to12.map(r => forceCtrMagnitudeR2to12[r - 2]!),
  )
  const forceSlopeMidR5to12 = fitLogLogSlope(
    rs5to12.map(r => r + 0.5),
    rs5to12.map(r => forceMidMagnitudeR1to12[r - 1]!),
  )

  let maxForceLatticeMatchErrR2to10 = 0
  for (let r = 2; r <= 10; r++) {
    const fw = forceCtrMagnitudeR2to12[r - 2]!
    const fc = cubicForceCtrMagnitudeR2to12[r - 2]!
    maxForceLatticeMatchErrR2to10 = Math.max(
      maxForceLatticeMatchErrR2to10,
      Math.abs(fw / fc - 1),
    )
  }

  // 7. Control: unweighted raw bulk w(D) = 1 on exact same side = 64 grid (F = 12), plus aliased period = 2 torus control
  const period2ModelF16 = buildColumnModel(16, true, true)
  const period2TorusComparison = {
    kEffF16: period2ModelF16.kEff,
    gEffF16: period2ModelF16.gEff,
    kEffRelShiftVsCanonical: Math.abs(period2ModelF16.kEff - modelF16.kEff) / modelF16.kEff,
  }
  const rawModel = buildColumnModel(12, false)
  const raw64 = solveWedgeAlongX(
    64,
    6,
    lam => 1 / schurAtLambda(rawModel, lam),
    false,
    0,
  ).values
  const rawHuskG1 = raw64[1]!
  const rawHuskG2 = raw64[2]!
  const rawHuskG5 = raw64[5]!

  return {
    wedgePoints64,
    orbitCountOk64,
    wedgeVsFullMaxErr16,
    watsonOriginRelErr64,
    besselMassiveCheckRelErr,
    floorConvergence,
    kEffInfiniteSeries,
    kEffF12: modelF12.kEff,
    kEffF16: modelF16.kEff,
    kEffDiffF16VsF12,
    gEffF16: modelF16.gEff,
    maxFieldDiffF16VsF12,
    gWarpedMadelung32,
    gWarpedMadelung64: gWarpedMadelung64F16,
    gWarpedInf32,
    gWarpedInf64,
    gCubic3DInf64,
    maxRelDiffSide32Vs64MadelungR1to6,
    maxRelDiffSide32Vs64InfR1to6,
    slope1to8Side64,
    slope1to8Cubic3D64,
    slope2to10Side64,
    slope2to10Cubic3D64,
    slope3to10Madelung64,
    slope4to12Madelung64,
    slope4to12Inf64,
    slope6to12Inf64,
    ratioToCubicLatticeR2to10,
    maxLatticeMatchErrR2to10,
    normalizedProductR2to12,
    maxContinuumFlatnessErrR6to12,
    potentialV12R1to12,
    strictlyMonotonicAttraction,
    forceCtrMagnitudeR2to12,
    forceMidMagnitudeR1to12,
    forceSlopeCtrR2to9,
    forceSlopeCtrCubic3DR2to9,
    forceSlopeCtrR6to12,
    forceSlopeMidR5to12,
    maxForceLatticeMatchErrR2to10,
    period2TorusComparison,
    rawResistanceF12: rawModel.resistanceToFloor,
    rawHuskG1,
    rawHuskG2,
    rawHuskG5,
    rawRatio2to1: rawHuskG2 / rawHuskG1,
    rawRatio5to1: rawHuskG5 / rawHuskG1,
  }
}
