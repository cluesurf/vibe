// FRONTIER 3 (E-GRV-0162): TRUE L3 TWO-BODY MUTUAL GRAVITATIONAL ATTRACTION, ACTION-REACTION,
// AND STRONG-FIELD EVENT-HORIZON TRAPPING WITH EXACT UNITARY INFORMATION PRESERVATION
// DIRECTLY ON EXACT 4D {3,4,3,4} HONEYCOMB BALLS (R = 2: 481 DOCKS / 11,544 SLOTS,
// R = 3: 8,857 DOCKS / 212,568 SLOTS, ZERO FRONTIER HITS).
//
// Builds directly on the exact 4D {3,4,3,4} infrastructure of E-FND-0187
// (code/measure/honeycomb-ball-coupled-l3.ts), E-GRV-0157 (1/N_D^2 warped cusp gravity,
// G_eff = 0.07716700), E-RLT-0125 (shared warped-column speed c_u = 0.9869161538), and
// E-GRV-0160 (nonlinear isotropic Schwarzschild lapse alpha(r) and conformal factor psi(r)):
//
//   Part 1 -- True L3 Two-Body Mutual Gravitational Attraction & Action-Reaction on Exact R = 3:
//     Seeds two independent localized 24-slot isotropic single-body wavepackets on the exact
//     8,857-dock (212,568-slot) 4D {3,4,3,4} ball at symmetric cusp-husk docks d_A = (-1, 0, 0)
//     and d_B = (+1, 0, 0) (d_ball(0, d_A) = d_ball(0, d_B) = 1, guaranteeing 0 frontier hits
//     through t = 1..2). Evolves BOTH lumps simultaneously under the symmetric Strang-split
//     reversible unitary operator:
//       U_2body = V_half(Phi_post, a_post) * S_4D * V_half(Phi_pre, a_pre)
//     where each V_half is a strictly dock-local unitary (combining pairwise SO(2) gravitational
//     coin tilts across the 12 opposite-displacement pairs of each dock with the scalar potential
//     phase exp(-i (dt/2) m Phi(dock))), computed live from the instantaneous dock densities
//     rho_A, rho_B via the symmetric 1/N_D^2 warped Green's function G_sym(x, y) = G_sym(y, x).
//     Because V_half is dock-local unitary, rho_A and rho_B are identically invariant across each
//     half-kick, making U_2body strictly norm-preserving (<= 1e-14) AND strictly memoryless
//     time-reversible (U_2body^dag U_2body = I to <= 1e-14 with zero stored potentials).
//     Verifies mutual attraction (Delta d_AB < 0, Delta x_A > 0, Delta x_B < 0), exact equal-mass
//     center-of-mass conservation (|Delta x_A + Delta x_B| <= 1e-12), unequal-mass (m_A = 1,
//     m_B = 3) Newton's 3rd law (Delta x_A / (-Delta x_B) = 3.000), G = 0 null control, and
//     > 100x collapse under both exact raw unwarped w(D) = 1 {3,4,3,4} bulk screening and
//     exponential Cheeger screening exp(-m_gap r).
//
//   Part 2 -- True L3 Strong-Field Nonlinear Event-Horizon Trapping & Unitary Information
//     Preservation on Exact R = 3:
//     Places a compact source of Schwarzschild radius r_s = 2 G_eff M / c_u^2 (isotropic horizon
//     r_H = r_s / 4) at dock 0, mapping E-GRV-0160's exact nonlinear isotropic Schwarzschild lapse
//       alpha(r) = (1 - r_s / (4 r)) / (1 + r_s / (4 r)),   psi(r) = 1 + r_s / (4 r),
//       c_rad(r) = c_u * alpha(r) / psi(r)^2
//     onto every dock's 3D cusp-husk radius r(dock) inside the strictly unitary local operator
//       U_horizon(M) = S_4D * U_lapse(alpha) * C_rad(theta)
//     acting across all 12 disjoint radial/transverse pairs of all 8,857 docks with
//     cos(2 theta) = c_u (1 - u_rad^2) + u_rad^2 c_rad(r).
//     Sweeps isotropic horizon compactness chi = r_H / r_0 = r_s / (4 r_0) across
//     {0.0, 0.4, 0.75, 1.0, 1.35} for an outward-launched wavepacket at dock 1 (r_0 = 1.0,
//     d_ball = 1, t = 1..2 beats, 0 frontier hits): proves strict monotonic decrease of radial
//     displacement and group velocity v_r(chi) from +c_u (flat) -> 0 (exact horizon stall at
//     chi = 1.0) -> negative (inward fall inside trapped surface at chi = 1.35), while proving
//     global norm preservation <= 1e-13, purity Tr(rho^2) = 1 (<= 1e-13), exact memoryless
//     U_horizon(M)^dag reversal <= 1e-13 from behind the horizon, and strict orthogonality
//     |<psi_1(t) | psi_2(t)>| <= 1e-13 of orthogonal states launched into the horizon.
//
//   Part 3 -- Exact L3 <-> L2 Convergence Bridge & Hardware Scaling Law:
//     Verifies exact 0 (<= 1e-14) agreement between R = 2 (481 docks) and R = 3 (8,857 docks)
//     inside their shared causal window (t <= 2 from dock 0 and t = 1 from d_ball = 1), certifies
//     < 1% weak-field agreement of both L3 radial light-speed slope and L3 gravitational redshift
//     clock slope against E-GRV-0160's L2 isotropic Schwarzschild prediction, and certifies the
//     exact {3,4,3,4} ball dock counts N_ball(0..3) = [1, 25, 481, 8857] and ~ 18^R scaling
//     (R >= 8 => > 10^10 docks).
//
// NOTHING MOVES: 100% deterministic complex slot-sparse linear algebra, zero Math.random.

import {
  buildBallCuspGeometry,
  complexStateDiffNorm,
  complexStateNormSq,
  makeComplexBranch,
  mergeComplexBranches,
  type BallCuspGeometry,
  type ComplexSparseBranch,
  type ComplexSparseState,
} from '@/code/measure/honeycomb-ball-coupled-l3'
import { EXACT_COLUMN_SHELL_COUNTS } from '@/code/measure/pair-density-gravity-slope'
import {
  buildWarpedGravityTable,
  type WarpedGravityTable,
} from '@/code/measure/unified-coupled-sectors'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  exactCell,
  matrixVector,
  twiceForm,
  type ExactCell,
  type ExactMatrix,
  type ExactVector,
} from '@/code/substrate/coxeter/exact-3434'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { buildExactCusp, CUSP_VERTEX, type ExactCusp } from '@/code/substrate/coxeter/exact-cusp'

const SLOTS = 24
const PAIRS_PER_DOCK = 12
const PRUNE_AMP2 = 1e-30
const OPPOSITE_U8 = Uint8Array.from(OPPOSITE)
const R_VOL = EXACT_COLUMN_SHELL_COUNTS[3] / EXACT_COLUMN_SHELL_COUNTS[2]

// ---------------------------------------------------------------------------------------------------------
// 1. Exact {3,4,3,4} Warped & Raw-Bulk Symmetric Pair Gravity Kernels

type GravityKernelSpec = {
  readonly label: string
  readonly evalG: (r: number) => number
  readonly evalNegDeriv: (r: number) => number
  readonly depthWeight: Float64Array
}

type RawBulkTable = {
  readonly floorF: number
  readonly gByR: Float64Array
  readonly depthWeight: Float64Array
  readonly y0Zero: number
  readonly mGap: number
}

function lateralLinksPerNeighbor(d: number): number {
  if (d === 0) return 1
  if (d === 1) return 10
  return 8 * 5 ** (d - 1)
}

function buildDepthWeightFromCVert(cVert: Float64Array, floorF: number): Float64Array {
  const rRem = new Float64Array(floorF + 1)
  let acc = 0
  for (let d = floorF; d >= 0; d--) {
    acc += 1 / cVert[d]!
    rRem[d] = acc
  }
  const rTotal = rRem[0]!
  const out = new Float64Array(floorF + 1)
  for (let d = 0; d <= floorF; d++) {
    out[d] = rRem[d]! / rTotal
  }
  return out
}

// Exact raw unwarped w(D) = 1 {3,4,3,4} cusp-column Schur complement (1/48 octahedral wedge on side = 32)
function buildRawBulkTable(floorF = 8, maxR = 17): RawBulkTable {
  const nShell = new Float64Array(floorF + 2)
  for (let d = 0; d < EXACT_COLUMN_SHELL_COUNTS.length && d < nShell.length; d++) {
    nShell[d] = EXACT_COLUMN_SHELL_COUNTS[d]!
  }
  for (let d = EXACT_COLUMN_SHELL_COUNTS.length; d < nShell.length; d++) {
    nShell[d] = nShell[d - 1]! * R_VOL
  }

  const cLat = new Float64Array(floorF + 1)
  const cVert = new Float64Array(floorF + 1)
  for (let d = 0; d <= floorF; d++) {
    cLat[d] = lateralLinksPerNeighbor(d)
    cVert[d] = 18 * nShell[d]!
  }

  const schur = (lam: number): number => {
    let y = cLat[floorF]! * lam + cVert[floorF]!
    for (let d = floorF - 1; d >= 0; d--) {
      const cv = cVert[d]!
      y = cLat[d]! * lam + (cv * y) / (cv + y)
    }
    return y
  }

  const y0Zero = schur(0)
  const mGap = Math.sqrt(y0Zero)
  const depthWeight = buildDepthWeightFromCVert(cVert, floorF)

  const side = 32
  const half = side >> 1
  const twoPiOverL = (2 * Math.PI) / side
  const stride = maxR + 1
  const cos1 = new Float64Array(half + 1)
  const mult = new Float64Array(half + 1)
  const cosTable = new Float64Array((half + 1) * stride)

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
        const lam = 2 * (3 - ca - cb - cos1[c]!)
        const gk = 1 / schur(lam)
        const mc = mult[c]!
        const baseC = c * stride
        if (a === b && b === c) {
          const w = gk * ma * ma * ma
          for (let r = 0; r <= maxR; r++) accum[r] = accum[r]! + w * cosTable[baseA + r]!
        } else if (a === b) {
          const w = gk * ma * ma * mc
          for (let r = 0; r <= maxR; r++) {
            accum[r] = accum[r]! + w * (2 * cosTable[baseA + r]! + cosTable[baseC + r]!)
          }
        } else if (b === c) {
          const w = gk * ma * mb * mb
          for (let r = 0; r <= maxR; r++) {
            accum[r] = accum[r]! + w * (cosTable[baseA + r]! + 2 * cosTable[baseB + r]!)
          }
        } else {
          const w = gk * 2 * ma * mb * mc
          for (let r = 0; r <= maxR; r++) {
            accum[r] =
              accum[r]! + w * (cosTable[baseA + r]! + cosTable[baseB + r]! + cosTable[baseC + r]!)
          }
        }
      }
    }
  }

  const vol = side * side * side
  const gByR = new Float64Array(stride)
  for (let r = 0; r <= maxR; r++) {
    gByR[r] = accum[r]! / vol
  }

  return { floorF, gByR, depthWeight, y0Zero, mGap }
}

// Smooth C^1 cubic-Hermite interpolation of E-GRV-0157's exact 1/N_D^2 warped Green's function
function makeWarpedKernel(gravity: WarpedGravityTable): GravityKernelSpec {
  const g = gravity.gWarpedByR
  const maxR = g.length - 1
  const slopes = new Float64Array(g.length)
  slopes[0] = 0
  for (let i = 1; i < maxR; i++) {
    slopes[i] = 0.5 * (g[i + 1]! - g[i - 1]!)
  }
  slopes[maxR] = -gravity.gEff / (maxR * maxR)
  const depthWeight = buildDepthWeightFromCVert(gravity.col.cVert, gravity.floorF)

  const evalG = (r: number): number => {
    if (r <= 1e-12) return g[0]!
    if (r >= maxR) return gravity.gEff / r
    const i = Math.floor(r)
    const t = r - i
    const t2 = t * t
    const t3 = t2 * t
    return (
      (2 * t3 - 3 * t2 + 1) * g[i]! +
      (t3 - 2 * t2 + t) * slopes[i]! +
      (-2 * t3 + 3 * t2) * g[i + 1]! +
      (t3 - t2) * slopes[i + 1]!
    )
  }

  const evalNegDeriv = (r: number): number => {
    if (r <= 1e-12) return 0
    if (r >= maxR) return gravity.gEff / (r * r)
    const i = Math.floor(r)
    const t = r - i
    const t2 = t * t
    const d =
      (6 * t2 - 6 * t) * g[i]! +
      (3 * t2 - 4 * t + 1) * slopes[i]! +
      (-6 * t2 + 6 * t) * g[i + 1]! +
      (3 * t2 - 2 * t) * slopes[i + 1]!
    return Math.max(0, -d)
  }

  return { label: 'warped-1/ND^2', evalG, evalNegDeriv, depthWeight }
}

// Negative control 2A: exact raw unwarped w(D) = 1 {3,4,3,4} Schur complement (log-interpolated)
function makeExactRawSchurKernel(raw: RawBulkTable): GravityKernelSpec {
  const g = raw.gByR
  const maxR = g.length - 1

  const evalG = (r: number): number => {
    if (r <= 1e-12) return g[0]!
    if (r >= maxR) return g[maxR]! * Math.exp(-raw.mGap * (r - maxR))
    const i = Math.floor(r)
    const f = r - i
    return Math.exp(Math.log(g[i]!) * (1 - f) + Math.log(g[i + 1]!) * f)
  }

  const evalNegDeriv = (r: number): number => {
    if (r <= 1e-12) return 0
    if (r >= maxR) return raw.mGap * evalG(r)
    const i = Math.floor(r)
    const f = r - i
    const decay = Math.log(g[i]!) - Math.log(g[i + 1]!)
    return decay * Math.exp(Math.log(g[i]!) * (1 - f) + Math.log(g[i + 1]!) * f)
  }

  return { label: 'raw-unwarped-schur', evalG, evalNegDeriv, depthWeight: raw.depthWeight }
}

// Negative control 2B: explicit exponential Cheeger screening exp(-m_gap * r) with raw depth weight
function makeRawCheegerKernel(gravity: WarpedGravityTable, raw: RawBulkTable): GravityKernelSpec {
  const mGap = raw.mGap
  const g0 = raw.gByR[0]!

  const evalG = (r: number): number => {
    if (r <= 1e-12) return g0
    return (gravity.gEff * Math.exp(-mGap * r)) / Math.max(r, 0.25)
  }

  const evalNegDeriv = (r: number): number => {
    if (r <= 1e-12) return 0
    const rr = Math.max(r, 0.25)
    return gravity.gEff * Math.exp(-mGap * r) * (mGap / rr + 1 / (rr * rr))
  }

  return { label: 'raw-cheeger-exp', evalG, evalNegDeriv, depthWeight: raw.depthWeight }
}

// ---------------------------------------------------------------------------------------------------------
// 2. Canonical Disjoint 12-Pair Partition of All 24 Slots on Every Dock of a 4D {3,4,3,4} Ball

export type DockPairPlan = {
  readonly pairOut: Uint8Array // cells * 12 (ordered so r(y_out) >= r(y_in))
  readonly pairIn: Uint8Array // cells * 12
  readonly pairURad: Float64Array // cells * 12, radial alignment u_rad in [0, 1]
  // Intrinsic half-difference 3D cusp displacement 0.5 * (pos(nb_out) - pos(nb_in)) for every dock & pair
  readonly pairDx: Float64Array // cells * 12
  readonly pairDy: Float64Array // cells * 12
  readonly pairDz: Float64Array // cells * 12
  readonly exactAntiparallelInteriorPairs: number
  readonly totalInteriorPairs: number
}

const toFloatZSqrt2 = ([x, y]: [bigint, bigint]): number => Number(x) + Number(y) * Math.SQRT2

function exactMatrixToFloat(m: ExactMatrix): Float64Array {
  const out = new Float64Array(25)
  for (let i = 0; i < 25; i++) {
    out[i] = Number(m[2 * i]!) + Number(m[2 * i + 1]!) * Math.SQRT2
  }
  return out
}

function exactVectorToFloat(v: ExactVector): Float64Array {
  const out = new Float64Array(5)
  for (let i = 0; i < 5; i++) {
    out[i] = Number(v[2 * i]!) + Number(v[2 * i + 1]!) * Math.SQRT2
  }
  return out
}

function mul5x5(a: Float64Array, b: Float64Array): Float64Array {
  const out = new Float64Array(25)
  for (let i = 0; i < 5; i++) {
    const ai = i * 5
    for (let k = 0; k < 5; k++) {
      const aik = a[ai + k]!
      if (aik === 0) continue
      const bk = k * 5
      for (let j = 0; j < 5; j++) {
        out[ai + j] = out[ai + j]! + aik * b[bk + j]!
      }
    }
  }
  return out
}

function mul5VecInto(m: Float64Array, v: Float64Array, out: Float64Array): void {
  const v0 = v[0]!
  const v1 = v[1]!
  const v2 = v[2]!
  const v3 = v[3]!
  const v4 = v[4]!
  for (let i = 0; i < 5; i++) {
    const mi = i * 5
    out[i] =
      m[mi]! * v0 + m[mi + 1]! * v1 + m[mi + 2]! * v2 + m[mi + 3]! * v3 + m[mi + 4]! * v4
  }
}

function invert3(s: number[][]): number[][] {
  const g = (i: number, j: number): number => s[i]![j]!
  const det =
    g(0, 0) * (g(1, 1) * g(2, 2) - g(1, 2) * g(2, 1)) -
    g(0, 1) * (g(1, 0) * g(2, 2) - g(1, 2) * g(2, 0)) +
    g(0, 2) * (g(1, 0) * g(2, 1) - g(1, 1) * g(2, 0))
  const cof = (i: number, j: number): number => {
    const r = [0, 1, 2].filter(k => k !== i)
    const c = [0, 1, 2].filter(k => k !== j)
    const minor = g(r[0]!, c[0]!) * g(r[1]!, c[1]!) - g(r[0]!, c[1]!) * g(r[1]!, c[0]!)
    return (i + j) % 2 === 0 ? minor : -minor
  }
  return [0, 1, 2].map(i => [0, 1, 2].map(j => cof(j, i) / det))
}

// Deterministic, disjoint 12-pair partition of each dock's 24 slots using EVERY dock's exact
// intrinsic {3,4,3,4} Coxeter frame to obtain all 24 facet-neighbor 3D cusp coordinates (even
// for frontier docks d_ball = R whose neighbors lie at d_ball = R + 1). This makes planR2 and
// planR3 bit-for-bit identical on all 481 docks of R = 2 and guarantees every dock has a
// strictly unitary 24x24 operator independent of ball truncation radius.
export function buildDockPairPlan(
  geom: BallCuspGeometry,
  cusp: ExactCusp,
  cell: ExactCell,
): DockPairPlan {
  const { cells, table, pos, distance, radius } = geom
  const pairOut = new Uint8Array(cells * PAIRS_PER_DOCK)
  const pairIn = new Uint8Array(cells * PAIRS_PER_DOCK)
  const pairURad = new Float64Array(cells * PAIRS_PER_DOCK)
  const pairDx = new Float64Array(cells * PAIRS_PER_DOCK)
  const pairDy = new Float64Array(cells * PAIRS_PER_DOCK)
  const pairDz = new Float64Array(cells * PAIRS_PER_DOCK)
  let exactAntiparallelInteriorPairs = 0
  let totalInteriorPairs = 0

  // Reconstruct each dock's exact 5x5 hyperbolic frame via BFS (matching buildBallCuspGeometry)
  const transportsF = cell.transports.map(exactMatrixToFloat)
  const c0F = exactVectorToFloat(cell.center)
  const cNbF = transportsF.map(tf => {
    const v = new Float64Array(5)
    mul5VecInto(tf, c0F, v)
    return v
  })
  const unitVec = (i: number): ExactVector => {
    const v = new Array<bigint>(10).fill(0n)
    v[2 * i] = 1n
    return v
  }
  const formRow = (target: ExactVector): Float64Array => {
    const row = new Float64Array(5)
    for (let k = 0; k < 5; k++) {
      row[k] = toFloatZSqrt2(twiceForm(unitVec(k), target))
    }
    return row
  }
  const rowV = formRow(CUSP_VERTEX)
  const rowA0 = formRow(unitVec(1))
  const rowA1 = formRow(unitVec(2))
  const rowA2 = formRow(unitVec(3))
  const dot5 = (r: Float64Array, v: Float64Array): number =>
    r[0]! * v[0]! + r[1]! * v[1]! + r[2]! * v[2]! + r[3]! * v[3]! + r[4]! * v[4]!
  const zOf = (c: Float64Array): [number, number, number] => {
    const level = dot5(rowV, c)
    return [dot5(rowA0, c) / level, dot5(rowA1, c) / level, dot5(rowA2, c) / level]
  }
  const z0 = zOf(c0F)
  const shifts = cusp.translations.axes.map(ax => {
    const cShift = exactVectorToFloat(matrixVector(ax.translation, cell.center))
    const z = zOf(cShift)
    return [z[0] - z0[0], z[1] - z0[1], z[2] - z0[2]]
  })
  const Sinv = invert3([0, 1, 2].map(i => [0, 1, 2].map(j => shifts[j]![i]!)))
  const s00 = Sinv[0]![0]!, s01 = Sinv[0]![1]!, s02 = Sinv[0]![2]!
  const s10 = Sinv[1]![0]!, s11 = Sinv[1]![1]!, s12 = Sinv[1]![2]!
  const s20 = Sinv[2]![0]!, s21 = Sinv[2]![1]!, s22 = Sinv[2]![2]!

  const frames: (Float64Array | undefined)[] = new Array(cells)
  const id5 = new Float64Array(25)
  for (let i = 0; i < 5; i++) id5[i * 5 + i] = 1
  frames[0] = id5
  for (let x = 0; x < cells; x++) {
    const fx = frames[x]!
    const base = x * SLOTS
    for (let k = 0; k < SLOTS; k++) {
      const y = table[base + k]!
      if (y >= 0 && frames[y] === undefined) {
        frames[y] = mul5x5(fx, transportsF[k]!)
      }
    }
  }

  const used = new Uint8Array(SLOTS)
  const dxs = new Float64Array(SLOTS)
  const dys = new Float64Array(SLOTS)
  const dzs = new Float64Array(SLOTS)
  const rNbs = new Float64Array(SLOTS)
  const tmpC = new Float64Array(5)

  for (let x = 0; x < cells; x++) {
    used.fill(0)
    const base = x * SLOTS
    const px = pos[3 * x]!
    const py = pos[3 * x + 1]!
    const pz = pos[3 * x + 2]!
    const rx = Math.hypot(px, py, pz)
    const isInterior = distance[x]! < radius
    const fx = frames[x]!

    for (let s = 0; s < SLOTS; s++) {
      const y = table[base + s]!
      let yx: number
      let yy: number
      let yz: number
      if (y >= 0) {
        yx = pos[3 * y]!
        yy = pos[3 * y + 1]!
        yz = pos[3 * y + 2]!
      } else {
        // Exact intrinsic {3,4,3,4} facet neighbor coordinate outside the truncated ball
        mul5VecInto(fx, cNbF[s]!, tmpC)
        const level = dot5(rowV, tmpC)
        const dz0 = dot5(rowA0, tmpC) / level - z0[0]
        const dz1 = dot5(rowA1, tmpC) / level - z0[1]
        const dz2 = dot5(rowA2, tmpC) / level - z0[2]
        yx = s00 * dz0 + s01 * dz1 + s02 * dz2
        yy = s10 * dz0 + s11 * dz1 + s12 * dz2
        yz = s20 * dz0 + s21 * dz1 + s22 * dz2
      }
      dxs[s] = yx - px
      dys[s] = yy - py
      dzs[s] = yz - pz
      rNbs[s] = Math.hypot(yx, yy, yz)
    }

    const found: [number, number][] = []

    // Pass 1: exact opposite 3D cusp displacement pairs
    for (let a = 0; a < SLOTS; a++) {
      if (used[a]) continue
      let bestB = -1
      let bestErr = 1e-6
      for (let b = a + 1; b < SLOTS; b++) {
        if (used[b]) continue
        const err = Math.hypot(dxs[a]! + dxs[b]!, dys[a]! + dys[b]!, dzs[a]! + dzs[b]!)
        if (err < bestErr) {
          bestErr = err
          bestB = b
        }
      }
      if (bestB >= 0) {
        used[a] = 1
        used[bestB] = 1
        found.push([a, bestB])
        if (isInterior) {
          exactAntiparallelInteriorPairs++
          totalInteriorPairs++
        }
      }
    }

    // Pass 2: remaining slots paired by minimum cosine of 3D displacement
    for (let a = 0; a < SLOTS; a++) {
      if (used[a]) continue
      let bestB = -1
      let bestCos = 2
      const na = Math.hypot(dxs[a]!, dys[a]!, dzs[a]!)
      for (let b = a + 1; b < SLOTS; b++) {
        if (used[b]) continue
        const nb = Math.hypot(dxs[b]!, dys[b]!, dzs[b]!)
        const cos =
          (dxs[a]! * dxs[b]! + dys[a]! * dys[b]! + dzs[a]! * dzs[b]!) / (na * nb + 1e-30)
        if (cos < bestCos) {
          bestCos = cos
          bestB = b
        }
      }
      if (bestB < 0) {
        const opp = OPPOSITE_U8[a]!
        bestB = !used[opp] ? opp : a + 1
      }
      used[a] = 1
      used[bestB] = 1
      found.push([a, bestB])
      if (isInterior) totalInteriorPairs++
    }

    const pBase = x * PAIRS_PER_DOCK
    for (let p = 0; p < PAIRS_PER_DOCK; p++) {
      let [a, b] = found[p]!
      if (rNbs[b]! > rNbs[a]!) {
        const tmp = a
        a = b
        b = tmp
      }
      pairOut[pBase + p] = a
      pairIn[pBase + p] = b
      const dvx = 0.5 * (dxs[a]! - dxs[b]!)
      const dvy = 0.5 * (dys[a]! - dys[b]!)
      const dvz = 0.5 * (dzs[a]! - dzs[b]!)
      pairDx[pBase + p] = dvx
      pairDy[pBase + p] = dvy
      pairDz[pBase + p] = dvz
      if (rx > 1e-12) {
        const rHatX = px / rx
        const rHatY = py / rx
        const rHatZ = pz / rx
        const dNorm = Math.hypot(dvx, dvy, dvz)
        pairURad[pBase + p] =
          dNorm > 1e-12
            ? Math.min(1, Math.max(0, (dvx * rHatX + dvy * rHatY + dvz * rHatZ) / dNorm))
            : 0
      } else {
        pairURad[pBase + p] = 0
      }
    }
  }

  return {
    pairOut,
    pairIn,
    pairURad,
    pairDx,
    pairDy,
    pairDz,
    exactAntiparallelInteriorPairs,
    totalInteriorPairs,
  }
}

// ---------------------------------------------------------------------------------------------------------
// 3. Shared Slot-Sparse Single-Vibe Operators & Observables on Exact 4D {3,4,3,4} Balls

type FrontierCounter = { hits: number }

function makeSingleSlotState(dock: number, localSlot: number): ComplexSparseState {
  return {
    branches: [
      makeComplexBranch([{ slot: dock * SLOTS + localSlot, vibe: 1, point: 0, open: 1 }], 1, 0),
    ],
  }
}

function makeIsotropic24State(dock: number): ComplexSparseState {
  const amp = 1 / Math.sqrt(SLOTS)
  return {
    branches: Array.from({ length: SLOTS }, (_, d) =>
      makeComplexBranch([{ slot: dock * SLOTS + d, vibe: 1, point: 0, open: 1 }], amp, 0),
    ),
  }
}

function dockOccupationMap(s: ComplexSparseState): Map<number, number> {
  const out = new Map<number, number>()
  for (let i = 0; i < s.branches.length; i++) {
    const br = s.branches[i]!
    const p = br.re * br.re + br.im * br.im
    if (p <= PRUNE_AMP2) continue
    const dock = (br.slots[0]! / SLOTS) | 0
    out.set(dock, (out.get(dock) ?? 0) + p)
  }
  return out
}

function centroid3D(geom: BallCuspGeometry, s: ComplexSparseState): [number, number, number] {
  const { pos } = geom
  let cx = 0
  let cy = 0
  let cz = 0
  let wSum = 0
  for (let i = 0; i < s.branches.length; i++) {
    const br = s.branches[i]!
    const p = br.re * br.re + br.im * br.im
    const dock = (br.slots[0]! / SLOTS) | 0
    cx += p * pos[3 * dock]!
    cy += p * pos[3 * dock + 1]!
    cz += p * pos[3 * dock + 2]!
    wSum += p
  }
  return wSum > 0 ? [cx / wSum, cy / wSum, cz / wSum] : [0, 0, 0]
}

function meanRadius3D(geom: BallCuspGeometry, s: ComplexSparseState): number {
  const { pos } = geom
  let sum = 0
  let wSum = 0
  for (let i = 0; i < s.branches.length; i++) {
    const br = s.branches[i]!
    const p = br.re * br.re + br.im * br.im
    const dock = (br.slots[0]! / SLOTS) | 0
    sum += p * Math.hypot(pos[3 * dock]!, pos[3 * dock + 1]!, pos[3 * dock + 2]!)
    wSum += p
  }
  return wSum > 0 ? sum / wSum : 0
}

function innerProduct(a: ComplexSparseState, b: ComplexSparseState): [number, number] {
  const mapA = new Map<number, [number, number]>()
  for (let i = 0; i < a.branches.length; i++) {
    const br = a.branches[i]!
    mapA.set(br.slots[0]!, [br.re, br.im])
  }
  let re = 0
  let im = 0
  for (let i = 0; i < b.branches.length; i++) {
    const br = b.branches[i]!
    const av = mapA.get(br.slots[0]!)
    if (!av) continue
    // <a | b> = sum conj(a_i) * b_i
    re += av[0] * br.re + av[1] * br.im
    im += av[0] * br.im - av[1] * br.re
  }
  return [re, im]
}

function applyStream4D(
  geom: BallCuspGeometry,
  s: ComplexSparseState,
  inverse: boolean,
  frontier: FrontierCounter,
): ComplexSparseState {
  const { table } = geom
  const out: ComplexSparseBranch[] = []
  for (let i = 0; i < s.branches.length; i++) {
    const br = s.branches[i]!
    const slot = br.slots[0]!
    const x = (slot / SLOTS) | 0
    const d = slot - x * SLOTS
    let newSlot: number
    if (inverse) {
      const od = OPPOSITE_U8[d]!
      const y = table[x * SLOTS + od]!
      if (y < 0) {
        frontier.hits++
        newSlot = x * SLOTS + od
      } else {
        newSlot = y * SLOTS + d
      }
    } else {
      const y = table[x * SLOTS + d]!
      if (y < 0) {
        frontier.hits++
        newSlot = x * SLOTS + OPPOSITE_U8[d]!
      } else {
        newSlot = y * SLOTS + d
      }
    }
    out.push(makeComplexBranch([{ slot: newSlot, vibe: 1, point: 0, open: 1 }], br.re, br.im))
  }
  return { branches: mergeComplexBranches(out) }
}

// ---------------------------------------------------------------------------------------------------------
// 4. Part 1: True L3 Coupled Two-Body Mutual Attraction & Action-Reaction on Exact 4D Balls

type LiveDockField = {
  readonly phi: number
  readonly ax: number
  readonly ay: number
  readonly az: number
}

// Evaluate live symmetric {3,4,3,4} gravitational potential Phi(x) and field a(x) = -grad Phi(x)
// on every active target dock x from instantaneous source density rhoSrc(y).
function evaluateLivePairField(
  geom: BallCuspGeometry,
  kernel: GravityKernelSpec,
  rhoSrc: Map<number, number>,
  srcMass: number,
  targetDocks: Iterable<number>,
): Map<number, LiveDockField> {
  const out = new Map<number, LiveDockField>()
  const { pos, depth } = geom
  const floorF = kernel.depthWeight.length - 1
  const srcList = [...rhoSrc.entries()]

  for (const x of targetDocks) {
    const px = pos[3 * x]!
    const py = pos[3 * x + 1]!
    const pz = pos[3 * x + 2]!
    const wx = kernel.depthWeight[Math.min(depth[x]!, floorF)]!
    let phi = 0
    let ax = 0
    let ay = 0
    let az = 0
    for (let i = 0; i < srcList.length; i++) {
      const [y, rhoY] = srcList[i]!
      const wy = kernel.depthWeight[Math.min(depth[y]!, floorF)]!
      const dx = pos[3 * y]! - px
      const dy = pos[3 * y + 1]! - py
      const dz = pos[3 * y + 2]! - pz
      const r = Math.hypot(dx, dy, dz)
      const wPair = srcMass * rhoY * wx * wy
      phi -= wPair * kernel.evalG(r)
      if (r > 1e-12) {
        const f = (wPair * kernel.evalNegDeriv(r)) / r
        ax += f * dx
        ay += f * dy
        az += f * dz
      }
    }
    out.set(x, { phi, ax, ay, az })
  }

  return out
}

// Strictly dock-local unitary gravitational half-kick V_half(Phi, a):
//   - Rotates each of the 12 disjoint opposite-displacement pairs (a, b) by SO(2) tilt R_grav(theta),
//     encoding the local gravitational impulse along the pair displacement vector.
//   - Multiplies all 24 slots of dock x by the scalar potential phase exp(-i dt mSelf Phi(x)).
// Because V_half acts purely within each dock's 24-slot unitary subspace, every dock's occupation
// probability rho(x) = sum_{d=0..23} |psi(x, d)|^2 is identically invariant across V_half!
function applyTwoBodyDockUnitary(
  geom: BallCuspGeometry,
  plan: DockPairPlan,
  s: ComplexSparseState,
  fields: Map<number, LiveDockField>,
  dt: number,
  mSelf: number,
  gravScale: number,
  adjoint: boolean,
): ComplexSparseState {
  const byDock = new Map<number, { re: Float64Array; im: Float64Array }>()
  for (let i = 0; i < s.branches.length; i++) {
    const br = s.branches[i]!
    const slot = br.slots[0]!
    const dock = (slot / SLOTS) | 0
    const d = slot - dock * SLOTS
    let buf = byDock.get(dock)
    if (!buf) {
      buf = { re: new Float64Array(SLOTS), im: new Float64Array(SLOTS) }
      byDock.set(dock, buf)
    }
    buf.re[d] = buf.re[d]! + br.re
    buf.im[d] = buf.im[d]! + br.im
  }

  const out: ComplexSparseBranch[] = []
  const sign = adjoint ? -1 : 1
  void geom

  for (const [dock, buf] of byDock) {
    const fld = fields.get(dock)
    const base = dock * SLOTS
    const pBase = dock * PAIRS_PER_DOCK

    if (fld && gravScale !== 0) {
      for (let p = 0; p < PAIRS_PER_DOCK; p++) {
        const a = plan.pairOut[pBase + p]!
        const b = plan.pairIn[pBase + p]!
        const dvx = plan.pairDx[pBase + p]!
        const dvy = plan.pairDy[pBase + p]!
        const dvz = plan.pairDz[pBase + p]!
        const rawEta = gravScale * dt * (fld.ax * dvx + fld.ay * dvy + fld.az * dvz)
        const eta = Math.max(-0.95, Math.min(0.95, rawEta))
        const theta = -0.5 * Math.asin(eta) * sign
        if (theta !== 0) {
          const c = Math.cos(theta)
          const sn = Math.sin(theta)
          const ar = buf.re[a]!
          const ai = buf.im[a]!
          const br2 = buf.re[b]!
          const bi2 = buf.im[b]!
          buf.re[a] = c * ar - sn * br2
          buf.im[a] = c * ai - sn * bi2
          buf.re[b] = sn * ar + c * br2
          buf.im[b] = sn * ai + c * bi2
        }
      }

      const phaseAng = -sign * dt * mSelf * gravScale * fld.phi
      if (phaseAng !== 0) {
        const cp = Math.cos(phaseAng)
        const sp = Math.sin(phaseAng)
        for (let d = 0; d < SLOTS; d++) {
          const r = buf.re[d]!
          const im = buf.im[d]!
          if (r === 0 && im === 0) continue
          buf.re[d] = r * cp - im * sp
          buf.im[d] = r * sp + im * cp
        }
      }
    }

    for (let d = 0; d < SLOTS; d++) {
      const r = buf.re[d]!
      const im = buf.im[d]!
      if (r * r + im * im > PRUNE_AMP2) {
        out.push(makeComplexBranch([{ slot: base + d, vibe: 1, point: 0, open: 1 }], r, im))
      }
    }
  }

  return { branches: out }
}

// Symmetric Strang-split coupled two-body unitary beat U_2body and exact memoryless adjoint U_2body^dag:
//   Forward:  V_half(Phi_post, a_post) * S_4D * V_half(Phi_pre, a_pre)
//   Adjoint:  V_half(Phi_pre, a_pre)^dag * S_4D^dag * V_half(Phi_post, a_post)^dag
function stepTwoBodyStrang(
  geom: BallCuspGeometry,
  plan: DockPairPlan,
  kernel: GravityKernelSpec,
  psiA: ComplexSparseState,
  psiB: ComplexSparseState,
  mA: number,
  mB: number,
  gravScale: number,
  adjoint: boolean,
  frontier: FrontierCounter,
): readonly [ComplexSparseState, ComplexSparseState] {
  const dtHalf = 0.5
  if (!adjoint) {
    const rhoA0 = dockOccupationMap(psiA)
    const rhoB0 = dockOccupationMap(psiB)
    const fldBforA0 = evaluateLivePairField(geom, kernel, rhoB0, mB, rhoA0.keys())
    const fldAforB0 = evaluateLivePairField(geom, kernel, rhoA0, mA, rhoB0.keys())
    let nextA = applyTwoBodyDockUnitary(geom, plan, psiA, fldBforA0, dtHalf, mA, gravScale, false)
    let nextB = applyTwoBodyDockUnitary(geom, plan, psiB, fldAforB0, dtHalf, mB, gravScale, false)

    nextA = applyStream4D(geom, nextA, false, frontier)
    nextB = applyStream4D(geom, nextB, false, frontier)

    const rhoA1 = dockOccupationMap(nextA)
    const rhoB1 = dockOccupationMap(nextB)
    const fldBforA1 = evaluateLivePairField(geom, kernel, rhoB1, mB, rhoA1.keys())
    const fldAforB1 = evaluateLivePairField(geom, kernel, rhoA1, mA, rhoB1.keys())
    nextA = applyTwoBodyDockUnitary(geom, plan, nextA, fldBforA1, dtHalf, mA, gravScale, false)
    nextB = applyTwoBodyDockUnitary(geom, plan, nextB, fldAforB1, dtHalf, mB, gravScale, false)
    return [nextA, nextB]
  } else {
    const rhoA1 = dockOccupationMap(psiA)
    const rhoB1 = dockOccupationMap(psiB)
    const fldBforA1 = evaluateLivePairField(geom, kernel, rhoB1, mB, rhoA1.keys())
    const fldAforB1 = evaluateLivePairField(geom, kernel, rhoA1, mA, rhoB1.keys())
    let prevA = applyTwoBodyDockUnitary(geom, plan, psiA, fldBforA1, dtHalf, mA, gravScale, true)
    let prevB = applyTwoBodyDockUnitary(geom, plan, psiB, fldAforB1, dtHalf, mB, gravScale, true)

    prevA = applyStream4D(geom, prevA, true, frontier)
    prevB = applyStream4D(geom, prevB, true, frontier)

    const rhoA0 = dockOccupationMap(prevA)
    const rhoB0 = dockOccupationMap(prevB)
    const fldBforA0 = evaluateLivePairField(geom, kernel, rhoB0, mB, rhoA0.keys())
    const fldAforB0 = evaluateLivePairField(geom, kernel, rhoA0, mA, rhoB0.keys())
    prevA = applyTwoBodyDockUnitary(geom, plan, prevA, fldBforA0, dtHalf, mA, gravScale, true)
    prevB = applyTwoBodyDockUnitary(geom, plan, prevB, fldAforB0, dtHalf, mB, gravScale, true)
    return [prevA, prevB]
  }
}

// Verify exact 24x24 Frobenius unitarity ||V^dag V - I_24||_F on a dock
function auditTwoBodyDockMatrixUnitarity(
  geom: BallCuspGeometry,
  plan: DockPairPlan,
  dock: number,
  fld: LiveDockField,
  mSelf: number,
  gravScale: number,
): number {
  const fields = new Map<number, LiveDockField>([[dock, fld]])
  const colsRe = Array.from({ length: SLOTS }, () => new Float64Array(SLOTS))
  const colsIm = Array.from({ length: SLOTS }, () => new Float64Array(SLOTS))
  for (let j = 0; j < SLOTS; j++) {
    const res = applyTwoBodyDockUnitary(
      geom,
      plan,
      makeSingleSlotState(dock, j),
      fields,
      0.5,
      mSelf,
      gravScale,
      false,
    )
    for (const br of res.branches) {
      const d = br.slots[0]! - dock * SLOTS
      colsRe[j]![d] = br.re
      colsIm[j]![d] = br.im
    }
  }
  let frobSq = 0
  for (let i = 0; i < SLOTS; i++) {
    for (let j = 0; j < SLOTS; j++) {
      let re = 0
      let im = 0
      for (let k = 0; k < SLOTS; k++) {
        re += colsRe[i]![k]! * colsRe[j]![k]! + colsIm[i]![k]! * colsIm[j]![k]!
        im += colsRe[i]![k]! * colsIm[j]![k]! - colsIm[i]![k]! * colsRe[j]![k]!
      }
      const dr = re - (i === j ? 1 : 0)
      frobSq += dr * dr + im * im
    }
  }
  return Math.sqrt(frobSq)
}

export type TwoBodyRunSummary = {
  readonly label: string
  readonly mA: number
  readonly mB: number
  readonly gravScale: number
  readonly frontierHits: number
  readonly maxNormErr: number
  readonly reversalErr2Beats: number
  readonly dAB0: number
  readonly dAB1: number
  readonly dAB2: number
  readonly deltaDAB1: number
  readonly deltaDAB2: number
  readonly deltaXA1: number
  readonly deltaXB1: number
  readonly deltaXA2: number
  readonly deltaXB2: number
  readonly maxTransverseDrift: number
  readonly comShift1: number
  readonly comShift2: number
  readonly newton3RelErr1: number
  readonly newton3RelErr2: number
  readonly displacementRatio1: number
  readonly displacementRatio2: number
  readonly activeDocksBeat2: number
}

function runTwoBodyCase(
  geom: BallCuspGeometry,
  plan: DockPairPlan,
  kernel: GravityKernelSpec,
  dA: number,
  dB: number,
  label: string,
  mA: number,
  mB: number,
  gravScale: number,
): {
  readonly summary: TwoBodyRunSummary
  readonly stateA1: ComplexSparseState
  readonly stateB1: ComplexSparseState
} {
  const initA = makeIsotropic24State(dA)
  const initB = makeIsotropic24State(dB)
  const cA0 = centroid3D(geom, initA)
  const cB0 = centroid3D(geom, initB)
  const dAB0 = cB0[0] - cA0[0]

  const frontier: FrontierCounter = { hits: 0 }
  const [a1, b1] = stepTwoBodyStrang(geom, plan, kernel, initA, initB, mA, mB, gravScale, false, frontier)
  const [a2, b2] = stepTwoBodyStrang(geom, plan, kernel, a1, b1, mA, mB, gravScale, false, frontier)

  const cA1 = centroid3D(geom, a1)
  const cB1 = centroid3D(geom, b1)
  const cA2 = centroid3D(geom, a2)
  const cB2 = centroid3D(geom, b2)

  // Exact memoryless 2-beat time-reversal back to t = 0
  const revFrontier: FrontierCounter = { hits: 0 }
  const [ra1, rb1] = stepTwoBodyStrang(geom, plan, kernel, a2, b2, mA, mB, gravScale, true, revFrontier)
  const [ra0, rb0] = stepTwoBodyStrang(geom, plan, kernel, ra1, rb1, mA, mB, gravScale, true, revFrontier)
  const reversalErr2Beats = Math.max(
    complexStateDiffNorm(ra0, initA),
    complexStateDiffNorm(rb0, initB),
  )

  const maxNormErr = Math.max(
    Math.abs(complexStateNormSq(a1) - 1),
    Math.abs(complexStateNormSq(b1) - 1),
    Math.abs(complexStateNormSq(a2) - 1),
    Math.abs(complexStateNormSq(b2) - 1),
  )

  const deltaXA1 = cA1[0] - cA0[0]
  const deltaXB1 = cB1[0] - cB0[0]
  const deltaXA2 = cA2[0] - cA0[0]
  const deltaXB2 = cB2[0] - cB0[0]
  const dAB1 = cB1[0] - cA1[0]
  const dAB2 = cB2[0] - cA2[0]

  const maxTransverseDrift = Math.max(
    Math.abs(cA1[1]),
    Math.abs(cA1[2]),
    Math.abs(cB1[1]),
    Math.abs(cB1[2]),
    Math.abs(cA2[1]),
    Math.abs(cA2[2]),
    Math.abs(cB2[1]),
    Math.abs(cB2[2]),
  )

  const comShift1 = Math.abs((mA * deltaXA1 + mB * deltaXB1) / (mA + mB))
  const comShift2 = Math.abs((mA * deltaXA2 + mB * deltaXB2) / (mA + mB))
  const denom1 = mA * Math.abs(deltaXA1) + mB * Math.abs(deltaXB1)
  const denom2 = mA * Math.abs(deltaXA2) + mB * Math.abs(deltaXB2)
  const newton3RelErr1 = denom1 > 1e-20 ? Math.abs(mA * deltaXA1 + mB * deltaXB1) / denom1 : 0
  const newton3RelErr2 = denom2 > 1e-20 ? Math.abs(mA * deltaXA2 + mB * deltaXB2) / denom2 : 0
  const displacementRatio1 = Math.abs(deltaXB1) > 1e-20 ? deltaXA1 / -deltaXB1 : 0
  const displacementRatio2 = Math.abs(deltaXB2) > 1e-20 ? deltaXA2 / -deltaXB2 : 0

  const activeDocks = new Set<number>([
    ...dockOccupationMap(a2).keys(),
    ...dockOccupationMap(b2).keys(),
  ])

  return {
    summary: {
      label,
      mA,
      mB,
      gravScale,
      frontierHits: frontier.hits + revFrontier.hits,
      maxNormErr,
      reversalErr2Beats,
      dAB0,
      dAB1,
      dAB2,
      deltaDAB1: dAB1 - dAB0,
      deltaDAB2: dAB2 - dAB0,
      deltaXA1,
      deltaXB1,
      deltaXA2,
      deltaXB2,
      maxTransverseDrift,
      comShift1,
      comShift2,
      newton3RelErr1,
      newton3RelErr2,
      displacementRatio1,
      displacementRatio2,
      activeDocksBeat2: activeDocks.size,
    },
    stateA1: a1,
    stateB1: b1,
  }
}

// ---------------------------------------------------------------------------------------------------------
// 5. Part 2: True L3 Nonlinear Event-Horizon Trapping & Unitary Information Preservation on Exact R = 3

// Exact E-GRV-0160 nonlinear isotropic Schwarzschild lapse, conformal factor, and coordinate
// radial light speed c_rad(r) = c_u * alpha(r) / psi(r)^2 for isotropic horizon r_H = r_s / 4.
export function isotropicSchwarzschildAtR(
  r: number,
  rH: number,
  cUniversal: number,
): { readonly alpha: number; readonly psi: number; readonly cRad: number } {
  if (rH <= 0) return { alpha: 1, psi: 1, cRad: cUniversal }
  if (r <= 1e-12) return { alpha: -1, psi: 1e6, cRad: -cUniversal }
  const u = rH / r
  const alpha = (1 - u) / (1 + u)
  const psi = 1 + u
  const cRad = (cUniversal * alpha) / (psi * psi)
  return { alpha, psi, cRad }
}

// Local unitary radial-coin + gravitational lapse phase operator on every dock of the 4D ball:
//   Forward:  U_horizon(M) = S_4D * U_lapse(alpha) * C_rad(theta)
//   Adjoint:  U_horizon(M)^dag = C_rad(theta)^dag * U_lapse(alpha)^dag * S_4D^dag
// where on each of the 12 disjoint pairs (outSlot, inSlot) of dock x:
//   C_rad(theta) = [[cos(theta), -i sin(theta)], [-i sin(theta), cos(theta)]] in SU(2),
//   cos(2 theta) = c_u * (1 - u_rad^2) + u_rad^2 * c_rad(r(x)),
//   U_lapse(alpha) = exp(-i omegaClock * alpha(r(x))) * I_24.
function applyHorizonDockCoin(
  geom: BallCuspGeometry,
  plan: DockPairPlan,
  s: ComplexSparseState,
  rH: number,
  cUniversal: number,
  omegaClock: number,
  adjoint: boolean,
): ComplexSparseState {
  const byDock = new Map<number, { re: Float64Array; im: Float64Array }>()
  for (let i = 0; i < s.branches.length; i++) {
    const br = s.branches[i]!
    const slot = br.slots[0]!
    const dock = (slot / SLOTS) | 0
    const d = slot - dock * SLOTS
    let buf = byDock.get(dock)
    if (!buf) {
      buf = { re: new Float64Array(SLOTS), im: new Float64Array(SLOTS) }
      byDock.set(dock, buf)
    }
    buf.re[d] = buf.re[d]! + br.re
    buf.im[d] = buf.im[d]! + br.im
  }

  const out: ComplexSparseBranch[] = []
  const { pos } = geom

  for (const [dock, buf] of byDock) {
    const rx = Math.hypot(pos[3 * dock]!, pos[3 * dock + 1]!, pos[3 * dock + 2]!)
    const met = isotropicSchwarzschildAtR(rx, rH, cUniversal)
    const pBase = dock * PAIRS_PER_DOCK
    const base = dock * SLOTS

    // C_rad(theta) and scalar U_lapse(alpha) commute on each dock; apply adjoint in exact reverse order
    if (adjoint && omegaClock !== 0) {
      const ang = omegaClock * met.alpha
      const cp = Math.cos(ang)
      const sp = Math.sin(ang)
      for (let d = 0; d < SLOTS; d++) {
        const r = buf.re[d]!
        const im = buf.im[d]!
        if (r === 0 && im === 0) continue
        buf.re[d] = r * cp - im * sp
        buf.im[d] = r * sp + im * cp
      }
    }

    for (let p = 0; p < PAIRS_PER_DOCK; p++) {
      const uRad = plan.pairURad[pBase + p]!
      const cEff = cUniversal * (1 - uRad * uRad) + uRad * uRad * met.cRad
      const theta = 0.5 * Math.acos(Math.max(-1, Math.min(1, cEff)))
      const c = Math.cos(theta)
      const sn = adjoint ? -Math.sin(theta) : Math.sin(theta)
      const a = plan.pairOut[pBase + p]!
      const b = plan.pairIn[pBase + p]!
      const ar = buf.re[a]!
      const ai = buf.im[a]!
      const br2 = buf.re[b]!
      const bi2 = buf.im[b]!
      // [[c, -i sn], [-i sn, c]] * [a, b]^T
      buf.re[a] = c * ar + sn * bi2
      buf.im[a] = c * ai - sn * br2
      buf.re[b] = sn * ai + c * br2
      buf.im[b] = -sn * ar + c * bi2
    }

    if (!adjoint && omegaClock !== 0) {
      const ang = -omegaClock * met.alpha
      const cp = Math.cos(ang)
      const sp = Math.sin(ang)
      for (let d = 0; d < SLOTS; d++) {
        const r = buf.re[d]!
        const im = buf.im[d]!
        if (r === 0 && im === 0) continue
        buf.re[d] = r * cp - im * sp
        buf.im[d] = r * sp + im * cp
      }
    }

    for (let d = 0; d < SLOTS; d++) {
      const r = buf.re[d]!
      const im = buf.im[d]!
      if (r * r + im * im > PRUNE_AMP2) {
        out.push(makeComplexBranch([{ slot: base + d, vibe: 1, point: 0, open: 1 }], r, im))
      }
    }
  }

  return { branches: out }
}

function stepHorizonUnitary(
  geom: BallCuspGeometry,
  plan: DockPairPlan,
  s: ComplexSparseState,
  rH: number,
  cUniversal: number,
  omegaClock: number,
  adjoint: boolean,
  frontier: FrontierCounter,
): ComplexSparseState {
  if (!adjoint) {
    const coined = applyHorizonDockCoin(geom, plan, s, rH, cUniversal, omegaClock, false)
    return applyStream4D(geom, coined, false, frontier)
  } else {
    const unstreamed = applyStream4D(geom, s, true, frontier)
    return applyHorizonDockCoin(geom, plan, unstreamed, rH, cUniversal, omegaClock, true)
  }
}

function auditHorizonDockMatrixUnitarity(
  geom: BallCuspGeometry,
  plan: DockPairPlan,
  dock: number,
  rH: number,
  cUniversal: number,
  omegaClock: number,
): number {
  const colsRe = Array.from({ length: SLOTS }, () => new Float64Array(SLOTS))
  const colsIm = Array.from({ length: SLOTS }, () => new Float64Array(SLOTS))
  for (let j = 0; j < SLOTS; j++) {
    const res = applyHorizonDockCoin(
      geom,
      plan,
      makeSingleSlotState(dock, j),
      rH,
      cUniversal,
      omegaClock,
      false,
    )
    for (const br of res.branches) {
      const d = br.slots[0]! - dock * SLOTS
      colsRe[j]![d] = br.re
      colsIm[j]![d] = br.im
    }
  }
  let frobSq = 0
  for (let i = 0; i < SLOTS; i++) {
    for (let j = 0; j < SLOTS; j++) {
      let re = 0
      let im = 0
      for (let k = 0; k < SLOTS; k++) {
        re += colsRe[i]![k]! * colsRe[j]![k]! + colsIm[i]![k]! * colsIm[j]![k]!
        im += colsRe[i]![k]! * colsIm[j]![k]! - colsIm[i]![k]! * colsRe[j]![k]!
      }
      const dr = re - (i === j ? 1 : 0)
      frobSq += dr * dr + im * im
    }
  }
  return Math.sqrt(frobSq)
}

export type HorizonSweepEntry = {
  readonly chi: number // isotropic horizon compactness r_H / r_0 = r_s / (4 r_0)
  readonly rSchwarzschild: number // r_s = 4 r_H = 2 G_eff M / c_u^2
  readonly massM: number
  readonly alphaAtR0: number
  readonly psiAtR0: number
  readonly cRadTheoryAtR0: number
  readonly coinAngle2ThetaRad: number
  // Primary radial probe (Ray A, bulk-coupled radial ray r_0 = 1.0 -> 1.2 / 0.8 -> 1.31 / 0.69, t = 1..2)
  readonly deltaR1: number
  readonly deltaR2: number
  readonly vRadial1: number // normalized radial group velocity deltaR1 / stepDr
  readonly vRadial2: number // 2-beat average radial group velocity
  // Husk-layer radial probe cross-check (Ray B, depth = 0 ray r_0 = 1.0 -> 2.0 / 0.0, t = 1)
  readonly huskDeltaR1: number
  readonly huskVRadial1: number
  // Exact unitary information preservation metrics
  readonly frontierHits: number
  readonly maxNormErr: number
  readonly maxPurityErr: number
  readonly reversalErr2Beats: number
  readonly maxOrthogonalityErr: number
  readonly maxSuperpositionOrthErr: number
}

// ---------------------------------------------------------------------------------------------------------
// 6. Full E-GRV-0162 Runner

export type WeakFieldBridgePoint = {
  readonly uIso: number // r_s / (4 r_0)
  readonly rsOverR0: number // r_s / r_0 = 2 G_eff M / (r_0 c_u^2)
  readonly l3SpeedRatio: number // v_r / c_u measured directly on R = 3
  readonly l2SpeedRatio: number // E-GRV-0160 alpha(r_0) / psi(r_0)^2
  readonly speedAbsDiff: number
  readonly l3RedshiftDrop: number // (omega_flat - omega_curved) / omega_0 from live phase
  readonly l2RedshiftDrop: number // 1 - alpha(r_0) from E-GRV-0160
  readonly redshiftAbsDiff: number
}

export type HardwareScalingRow = {
  readonly radius: number
  readonly exact: boolean
  readonly docks: number
  readonly slots: number
  readonly estStateBytesGB: number
}

export type HoneycombBallL3TwoBodyAndHorizonResult = {
  readonly elapsedSeconds: number
  readonly constants: {
    readonly kEff: number
    readonly gEff: number
    readonly cUniversal: number
    readonly rawBulkY0Zero: number
    readonly rawBulkMGap: number
  }
  readonly geometry: {
    readonly nBall0to3: readonly [number, number, number, number]
    readonly shellCounts0to3: readonly [number, number, number, number]
    readonly r2Cells: number
    readonly r2TotalSlots: number
    readonly r2CoverConflicts: number
    readonly r2CoverMissing: number
    readonly r2OrientationConflicts: number
    readonly r2ChartConsistencyErr: number
    readonly r3Cells: number
    readonly r3TotalSlots: number
    readonly r3CoverConflicts: number
    readonly r3CoverMissing: number
    readonly r3OrientationConflicts: number
    readonly r3ChartConsistencyErr: number
    readonly r3UnitOff: number
    readonly r3PairOff: number
    readonly dA: number
    readonly dB: number
    readonly dBallA: number
    readonly dBallB: number
    readonly initialSeparation: number
  }
  readonly part1TwoBody: {
    readonly dockMatrixUnitarityMaxErr: number
    readonly pairReciprocityMaxErr: number
    readonly equalMass: TwoBodyRunSummary
    readonly unequalMass1to3: TwoBodyRunSummary
    readonly unequalMassLinearResponse: TwoBodyRunSummary
    readonly controlFreeG0: TwoBodyRunSummary
    readonly controlRawSchur: TwoBodyRunSummary
    readonly controlRawCheeger: TwoBodyRunSummary
    readonly rawSchurCollapseFactorBeat1: number
    readonly rawSchurCollapseFactorBeat2: number
    readonly rawCheegerCollapseFactorBeat1: number
    readonly rawCheegerCollapseFactorBeat2: number
  }
  readonly part2Horizon: {
    readonly launchDock: number
    readonly launchR0: number
    readonly omegaClock: number
    readonly dockMatrixUnitarityMaxErr: number
    readonly sweep: readonly HorizonSweepEntry[]
    readonly strictlyMonotonicVRadial1: boolean
    readonly strictlyMonotonicDeltaR1: boolean
    readonly strictlyMonotonicDeltaR2: boolean
    readonly maxRaySpeedDiscrepancy: number
    readonly totalFrontierHits: number
    readonly worstNormErr: number
    readonly worstPurityErr: number
    readonly worstReversalErr: number
    readonly worstOrthogonalityErr: number
    readonly worstSuperpositionOrthErr: number
  }
  readonly part3ConvergenceAndScaling: {
    readonly r2VsR3Origin2BeatDiff: number
    readonly r2VsR3Origin2BeatFrontierHits: number
    readonly r2VsR3TwoBody1BeatDiff: number
    readonly r2VsR3TwoBody1BeatFrontierHits: number
    readonly r2VsR3Horizon1BeatDiff: number
    readonly r2VsR3Horizon1BeatFrontierHits: number
    readonly weakFieldPoints: readonly WeakFieldBridgePoint[]
    readonly weakFieldMaxSpeedDiffVsExactL2: number
    readonly weakFieldMaxRedshiftDiffVsExactL2: number
    readonly l3WeakSpeedSlope: number
    readonly l2WeakSpeedSlope: number
    readonly l3WeakSpeedSlopeRelErr: number
    readonly l3WeakRedshiftSlope: number
    readonly l2WeakRedshiftSlope: number
    readonly l3WeakRedshiftSlopeRelErr: number
    readonly shellRatioS2OverS1: number
    readonly shellRatioS3OverS2: number
    readonly asymptoticShellRatio: number
    readonly scalingTable: readonly HardwareScalingRow[]
    readonly docksAtR8LowerBound: number
    readonly docksAtR10LowerBound: number
  }
}

export function runHoneycombBallL3TwoBodyAndHorizon(): HoneycombBallL3TwoBodyAndHorizonResult {
  const startedMs = Date.now()

  // 0. Parameter-free {3,4,3,4} gravity & speed constants (E-GRV-0157 / E-RLT-0125)
  const gravity = buildWarpedGravityTable(8, 17)
  const rawBulk = buildRawBulkTable(8, 17)
  const cU = gravity.cUniversal
  const gEff = gravity.gEff

  const kernelWarped = makeWarpedKernel(gravity)
  const kernelRawSchur = makeExactRawSchurKernel(rawBulk)
  const kernelRawCheeger = makeRawCheegerKernel(gravity, rawBulk)

  // 1. Exact 4D {3,4,3,4} balls R = 0..3 and exact cusp coordinates (D(dock), x_3D(dock))
  const cusp = buildExactCusp({ period: 2, floor: 3 })
  const cell = exactCell()
  const ballR0 = exactBallMesh({ radius: 0 })
  const ballR1 = exactBallMesh({ radius: 1 })
  const geomR2 = buildBallCuspGeometry(2, cusp, cell)
  const geomR3 = buildBallCuspGeometry(3, cusp, cell)

  const planR2 = buildDockPairPlan(geomR2, cusp, cell)
  const planR3 = buildDockPairPlan(geomR3, cusp, cell)

  const ax0 = cusp.translations.axes[0]!
  const dB = geomR3.table[ax0.slot]! // (+1, 0, 0), d_ball = 1, depth = 0
  const dA = geomR3.table[ax0.partner]! // (-1, 0, 0), d_ball = 1, depth = 0
  const initialSeparation = Math.hypot(
    geomR3.pos[3 * dB]! - geomR3.pos[3 * dA]!,
    geomR3.pos[3 * dB + 1]! - geomR3.pos[3 * dA + 1]!,
    geomR3.pos[3 * dB + 2]! - geomR3.pos[3 * dA + 2]!,
  )

  // -------------------------------------------------------------------------------------------------------
  // PART 1: True L3 Coupled Two-Body Mutual Attraction & Action-Reaction on Exact R = 3 (8,857 docks)
  const equalMassRun = runTwoBodyCase(geomR3, planR3, kernelWarped, dA, dB, 'warped-equal-1:1', 1, 1, 1.0)
  const unequalMassRun = runTwoBodyCase(geomR3, planR3, kernelWarped, dA, dB, 'warped-unequal-1:3', 1, 3, 1.0)
  const unequalLinearRun = runTwoBodyCase(
    geomR3,
    planR3,
    kernelWarped,
    dA,
    dB,
    'warped-unequal-1:3-linear',
    1,
    3,
    1e-4,
  )
  const freeRun = runTwoBodyCase(geomR3, planR3, kernelWarped, dA, dB, 'control-free-G0', 1, 1, 0.0)
  const rawSchurRun = runTwoBodyCase(
    geomR3,
    planR3,
    kernelRawSchur,
    dA,
    dB,
    'control-raw-schur-w1',
    1,
    1,
    1.0,
  )
  const rawCheegerRun = runTwoBodyCase(
    geomR3,
    planR3,
    kernelRawCheeger,
    dA,
    dB,
    'control-raw-cheeger-exp',
    1,
    1,
    1.0,
  )

  // Direct 24x24 operator unitarity & exact pair reciprocity audit on R = 3
  const rhoSingleB = new Map<number, number>([[dB, 1]])
  const rhoSingleA = new Map<number, number>([[dA, 1]])
  const fBatA = evaluateLivePairField(geomR3, kernelWarped, rhoSingleB, 3, [dA]).get(dA)!
  const fAatB = evaluateLivePairField(geomR3, kernelWarped, rhoSingleA, 1, [dB]).get(dB)!
  const dockMatrixUnitarityMaxErrP1 = Math.max(
    auditTwoBodyDockMatrixUnitarity(geomR3, planR3, dA, fBatA, 1, 1.0),
    auditTwoBodyDockMatrixUnitarity(geomR3, planR3, dB, fAatB, 3, 1.0),
  )
  // Exact reciprocity check across depth = 0 and depth = 1 docks: m_A * a_{B->A} + m_B * a_{A->B} = 0
  const rhoMixedA = dockOccupationMap(equalMassRun.stateA1)
  const rhoMixedB = dockOccupationMap(unequalMassRun.stateB1)
  const fldBOnA = evaluateLivePairField(geomR3, kernelWarped, rhoMixedB, 3, rhoMixedA.keys())
  const fldAOnB = evaluateLivePairField(geomR3, kernelWarped, rhoMixedA, 1, rhoMixedB.keys())
  let fTotalAx = 0
  let fTotalAy = 0
  let fTotalAz = 0
  for (const [x, rx] of rhoMixedA) {
    const f = fldBOnA.get(x)!
    fTotalAx += 1 * rx * f.ax
    fTotalAy += 1 * rx * f.ay
    fTotalAz += 1 * rx * f.az
  }
  let fTotalBx = 0
  let fTotalBy = 0
  let fTotalBz = 0
  for (const [y, ry] of rhoMixedB) {
    const f = fldAOnB.get(y)!
    fTotalBx += 3 * ry * f.ax
    fTotalBy += 3 * ry * f.ay
    fTotalBz += 3 * ry * f.az
  }
  const pairReciprocityMaxErr = Math.hypot(
    fTotalAx + fTotalBx,
    fTotalAy + fTotalBy,
    fTotalAz + fTotalBz,
  )

  const rawSchurCollapseFactorBeat1 =
    Math.abs(equalMassRun.summary.deltaDAB1) / Math.abs(rawSchurRun.summary.deltaDAB1)
  const rawSchurCollapseFactorBeat2 =
    Math.abs(equalMassRun.summary.deltaDAB2) / Math.abs(rawSchurRun.summary.deltaDAB2)
  const rawCheegerCollapseFactorBeat1 =
    Math.abs(equalMassRun.summary.deltaDAB1) / Math.abs(rawCheegerRun.summary.deltaDAB1)
  const rawCheegerCollapseFactorBeat2 =
    Math.abs(equalMassRun.summary.deltaDAB2) / Math.abs(rawCheegerRun.summary.deltaDAB2)

  // -------------------------------------------------------------------------------------------------------
  // PART 2: True L3 Nonlinear Event-Horizon Trapping & Unitary Information Preservation on Exact R = 3
  const launchDock = dB // dock 1 at (+1, 0, 0), r_0 = 1.0, d_ball = 1
  const launchR0 = Math.hypot(
    geomR3.pos[3 * launchDock]!,
    geomR3.pos[3 * launchDock + 1]!,
    geomR3.pos[3 * launchDock + 2]!,
  )
  const omegaClock = 0.5

  // Identify exact radial outward/inward slot pairs at launchDock:
  //   Ray A (bulk-coupled radial ray, delta r = +-0.2, stays strictly r > 0 through t = 1..2): slots (0, 1)
  //   Ray B (depth = 0 cusp-husk radial ray, delta r = +-1.0): slots (2, 3)
  let rayAOut = -1
  let rayAIn = -1
  let rayBOut = -1
  let rayBIn = -1
  let rayAStepDr = 0
  let rayBStepDr = 0
  for (let p = 0; p < PAIRS_PER_DOCK; p++) {
    const uRad = planR3.pairURad[launchDock * PAIRS_PER_DOCK + p]!
    if (uRad <= 0.99) continue
    const sOut = planR3.pairOut[launchDock * PAIRS_PER_DOCK + p]!
    const sIn = planR3.pairIn[launchDock * PAIRS_PER_DOCK + p]!
    const yOut = geomR3.table[launchDock * SLOTS + sOut]!
    const rOut = Math.hypot(geomR3.pos[3 * yOut]!, geomR3.pos[3 * yOut + 1]!, geomR3.pos[3 * yOut + 2]!)
    const dr = rOut - launchR0
    if (dr > 0.5) {
      rayBOut = sOut
      rayBIn = sIn
      rayBStepDr = dr
    } else if (dr > 0.05) {
      rayAOut = sOut
      rayAIn = sIn
      rayAStepDr = dr
    }
  }
  if (rayAOut < 0 || rayBOut < 0) {
    throw new Error('honeycomb-ball-l3-two-body-and-horizon: failed to identify radial launch pairs')
  }

  const psiLaunchA = makeSingleSlotState(launchDock, rayAOut)
  const psiOrthInA = makeSingleSlotState(launchDock, rayAIn)
  const psiLaunchB = makeSingleSlotState(launchDock, rayBOut)
  const invSqrt2 = Math.SQRT1_2
  const psiSuperPlus: ComplexSparseState = {
    branches: [
      makeComplexBranch([{ slot: launchDock * SLOTS + rayAOut, vibe: 1, point: 0, open: 1 }], invSqrt2, 0),
      makeComplexBranch([{ slot: launchDock * SLOTS + rayBOut, vibe: 1, point: 0, open: 1 }], invSqrt2, 0),
    ],
  }
  const psiSuperMinus: ComplexSparseState = {
    branches: [
      makeComplexBranch([{ slot: launchDock * SLOTS + rayAOut, vibe: 1, point: 0, open: 1 }], invSqrt2, 0),
      makeComplexBranch([{ slot: launchDock * SLOTS + rayBOut, vibe: 1, point: 0, open: 1 }], -invSqrt2, 0),
    ],
  }

  const chiValues = [0.0, 0.4, 0.75, 1.0, 1.35] as const
  const sweep: HorizonSweepEntry[] = []
  let dockMatrixUnitarityMaxErrP2 = 0
  let totalHorizonFrontierHits = 0
  let worstNormErr = 0
  let worstPurityErr = 0
  let worstReversalErr = 0
  let worstOrthogonalityErr = 0
  let worstSuperpositionOrthErr = 0
  let maxRaySpeedDiscrepancy = 0

  for (const chi of chiValues) {
    const rH = chi * launchR0
    const rSchwarzschild = 4 * rH
    const massM = (rSchwarzschild * cU * cU) / (2 * gEff)
    const met = isotropicSchwarzschildAtR(launchR0, rH, cU)
    const coinAngle2ThetaRad = Math.acos(Math.max(-1, Math.min(1, met.cRad)))

    // Certify exact 24x24 dock matrix unitarity at launchDock and its radial neighbors
    const nbOut = geomR3.table[launchDock * SLOTS + rayAOut]!
    const nbIn = geomR3.table[launchDock * SLOTS + rayAIn]!
    dockMatrixUnitarityMaxErrP2 = Math.max(
      dockMatrixUnitarityMaxErrP2,
      auditHorizonDockMatrixUnitarity(geomR3, planR3, launchDock, rH, cU, omegaClock),
      auditHorizonDockMatrixUnitarity(geomR3, planR3, nbOut, rH, cU, omegaClock),
      auditHorizonDockMatrixUnitarity(geomR3, planR3, nbIn, rH, cU, omegaClock),
    )

    const f: FrontierCounter = { hits: 0 }
    // Ray A: 2 full beats on R = 3 (0 frontier hits)
    const sA1 = stepHorizonUnitary(geomR3, planR3, psiLaunchA, rH, cU, omegaClock, false, f)
    const sA2 = stepHorizonUnitary(geomR3, planR3, sA1, rH, cU, omegaClock, false, f)

    // Orthogonal states evolved through the exact same horizon operator
    const oIn1 = stepHorizonUnitary(geomR3, planR3, psiOrthInA, rH, cU, omegaClock, false, f)
    const oIn2 = stepHorizonUnitary(geomR3, planR3, oIn1, rH, cU, omegaClock, false, f)
    const sB1 = stepHorizonUnitary(geomR3, planR3, psiLaunchB, rH, cU, omegaClock, false, f)
    const sB2 = stepHorizonUnitary(geomR3, planR3, sB1, rH, cU, omegaClock, false, f)

    // Coherent orthogonal superpositions (+ vs -) launched into the horizon
    const sp1 = stepHorizonUnitary(geomR3, planR3, psiSuperPlus, rH, cU, omegaClock, false, f)
    const sp2 = stepHorizonUnitary(geomR3, planR3, sp1, rH, cU, omegaClock, false, f)
    const sm1 = stepHorizonUnitary(geomR3, planR3, psiSuperMinus, rH, cU, omegaClock, false, f)
    const sm2 = stepHorizonUnitary(geomR3, planR3, sm1, rH, cU, omegaClock, false, f)

    // Exact memoryless 2-beat time-reversal back to t = 0 (including behind the horizon at chi = 1.35!)
    const fRev: FrontierCounter = { hits: 0 }
    const revA1 = stepHorizonUnitary(geomR3, planR3, sA2, rH, cU, omegaClock, true, fRev)
    const revA0 = stepHorizonUnitary(geomR3, planR3, revA1, rH, cU, omegaClock, true, fRev)
    const reversalErr2Beats = complexStateDiffNorm(revA0, psiLaunchA)

    const norms = [
      complexStateNormSq(sA1),
      complexStateNormSq(sA2),
      complexStateNormSq(oIn2),
      complexStateNormSq(sB2),
      complexStateNormSq(sp2),
      complexStateNormSq(sm2),
    ]
    const maxNormErr = Math.max(...norms.map(n => Math.abs(n - 1)))
    // Global pure-state purity Tr(rho^2) = (<psi|psi>)^2 for pure state rho = |psi><psi|
    const maxPurityErr = Math.max(...norms.map(n => Math.abs(n * n - 1)))

    const ipIn1 = innerProduct(sA1, oIn1)
    const ipIn2 = innerProduct(sA2, oIn2)
    const ipAB1 = innerProduct(sA1, sB1)
    const ipAB2 = innerProduct(sA2, sB2)
    const maxOrthogonalityErr = Math.max(
      Math.hypot(ipIn1[0], ipIn1[1]),
      Math.hypot(ipIn2[0], ipIn2[1]),
      Math.hypot(ipAB1[0], ipAB1[1]),
      Math.hypot(ipAB2[0], ipAB2[1]),
    )
    const ipSup1 = innerProduct(sp1, sm1)
    const ipSup2 = innerProduct(sp2, sm2)
    const maxSuperpositionOrthErr = Math.max(
      Math.hypot(ipSup1[0], ipSup1[1]),
      Math.hypot(ipSup2[0], ipSup2[1]),
    )

    const deltaR1 = meanRadius3D(geomR3, sA1) - launchR0
    const deltaR2 = meanRadius3D(geomR3, sA2) - launchR0
    const vRadial1 = deltaR1 / rayAStepDr
    const vRadial2 = deltaR2 / (2 * rayAStepDr)

    const huskDeltaR1 = meanRadius3D(geomR3, sB1) - launchR0
    const huskVRadial1 = huskDeltaR1 / rayBStepDr
    maxRaySpeedDiscrepancy = Math.max(maxRaySpeedDiscrepancy, Math.abs(vRadial1 - huskVRadial1))

    const hits = f.hits + fRev.hits
    totalHorizonFrontierHits += hits
    worstNormErr = Math.max(worstNormErr, maxNormErr)
    worstPurityErr = Math.max(worstPurityErr, maxPurityErr)
    worstReversalErr = Math.max(worstReversalErr, reversalErr2Beats)
    worstOrthogonalityErr = Math.max(worstOrthogonalityErr, maxOrthogonalityErr)
    worstSuperpositionOrthErr = Math.max(worstSuperpositionOrthErr, maxSuperpositionOrthErr)

    sweep.push({
      chi,
      rSchwarzschild,
      massM,
      alphaAtR0: met.alpha,
      psiAtR0: met.psi,
      cRadTheoryAtR0: met.cRad,
      coinAngle2ThetaRad,
      deltaR1,
      deltaR2,
      vRadial1,
      vRadial2,
      huskDeltaR1,
      huskVRadial1,
      frontierHits: hits,
      maxNormErr,
      maxPurityErr,
      reversalErr2Beats,
      maxOrthogonalityErr,
      maxSuperpositionOrthErr,
    })
  }

  let strictlyMonotonicVRadial1 = true
  let strictlyMonotonicDeltaR1 = true
  let strictlyMonotonicDeltaR2 = true
  for (let i = 1; i < sweep.length; i++) {
    if (!(sweep[i]!.vRadial1 < sweep[i - 1]!.vRadial1)) strictlyMonotonicVRadial1 = false
    if (!(sweep[i]!.deltaR1 < sweep[i - 1]!.deltaR1)) strictlyMonotonicDeltaR1 = false
    if (!(sweep[i]!.deltaR2 < sweep[i - 1]!.deltaR2)) strictlyMonotonicDeltaR2 = false
  }

  // -------------------------------------------------------------------------------------------------------
  // PART 3: Exact R = 2 vs R = 3 Convergence, L3 <-> L2 Weak-Field Bridge, & Hardware Scaling Law

  // 3A. Exact R = 2 (481 docks) vs R = 3 (8,857 docks) comparison inside shared causal window:
  //   (i) t = 1..2 from dock 0 under U_horizon (strong field rH = 0.75)
  const originStart = makeIsotropic24State(0)
  const fOrigR2: FrontierCounter = { hits: 0 }
  const fOrigR3: FrontierCounter = { hits: 0 }
  const o2Beat1 = stepHorizonUnitary(geomR2, planR2, originStart, 0.75, cU, omegaClock, false, fOrigR2)
  const o2Beat2 = stepHorizonUnitary(geomR2, planR2, o2Beat1, 0.75, cU, omegaClock, false, fOrigR2)
  const o3Beat1 = stepHorizonUnitary(geomR3, planR3, originStart, 0.75, cU, omegaClock, false, fOrigR3)
  const o3Beat2 = stepHorizonUnitary(geomR3, planR3, o3Beat1, 0.75, cU, omegaClock, false, fOrigR3)
  const r2VsR3Origin2BeatDiff = Math.max(
    complexStateDiffNorm(o2Beat1, o3Beat1),
    complexStateDiffNorm(o2Beat2, o3Beat2),
  )
  const r2VsR3Origin2BeatFrontierHits = fOrigR2.hits + fOrigR3.hits

  //   (ii) t = 1 coupled two-body from (dA, dB) (d_ball = 1) on R = 2 vs R = 3
  const fTbR2: FrontierCounter = { hits: 0 }
  const fTbR3: FrontierCounter = { hits: 0 }
  const initA = makeIsotropic24State(dA)
  const initB = makeIsotropic24State(dB)
  const [tb2A, tb2B] = stepTwoBodyStrang(geomR2, planR2, kernelWarped, initA, initB, 1, 3, 1.0, false, fTbR2)
  const [tb3A, tb3B] = stepTwoBodyStrang(geomR3, planR3, kernelWarped, initA, initB, 1, 3, 1.0, false, fTbR3)
  const r2VsR3TwoBody1BeatDiff = Math.max(
    complexStateDiffNorm(tb2A, tb3A),
    complexStateDiffNorm(tb2B, tb3B),
  )
  const r2VsR3TwoBody1BeatFrontierHits = fTbR2.hits + fTbR3.hits

  //   (iii) t = 1 strong-field horizon probe from launchDock (d_ball = 1, chi = 1.35) on R = 2 vs R = 3
  const fHorR2: FrontierCounter = { hits: 0 }
  const fHorR3: FrontierCounter = { hits: 0 }
  const h2Beat1 = stepHorizonUnitary(geomR2, planR2, psiLaunchA, 1.35 * launchR0, cU, omegaClock, false, fHorR2)
  const h3Beat1 = stepHorizonUnitary(geomR3, planR3, psiLaunchA, 1.35 * launchR0, cU, omegaClock, false, fHorR3)
  const r2VsR3Horizon1BeatDiff = complexStateDiffNorm(h2Beat1, h3Beat1)
  const r2VsR3Horizon1BeatFrontierHits = fHorR2.hits + fHorR3.hits

  // 3B. L3 Weak-Field Radial Speed & Redshift Slope vs E-GRV-0160 L2 Prediction (< 1%)
  const weakUValues = [0.0005, 0.001, 0.002, 0.004] as const
  const fWeak: FrontierCounter = { hits: 0 }
  const flatBeat1 = stepHorizonUnitary(geomR3, planR3, psiLaunchA, 0, cU, omegaClock, false, fWeak)
  const outSlotAfterFlat = geomR3.table[launchDock * SLOTS + rayAOut]! * SLOTS + rayAOut
  const ampAt = (st: ComplexSparseState, slot: number): [number, number] => {
    for (const br of st.branches) {
      if (br.slots[0] === slot) return [br.re, br.im]
    }
    return [0, 0]
  }
  const flatAmp = ampAt(flatBeat1, outSlotAfterFlat)
  const flatPhase = Math.atan2(flatAmp[1], flatAmp[0])

  const weakFieldPoints: WeakFieldBridgePoint[] = []
  let weakFieldMaxSpeedDiffVsExactL2 = 0
  let weakFieldMaxRedshiftDiffVsExactL2 = 0

  for (const uIso of weakUValues) {
    const rH = uIso * launchR0
    const rsOverR0 = 4 * uIso
    const st = stepHorizonUnitary(geomR3, planR3, psiLaunchA, rH, cU, omegaClock, false, fWeak)
    const l3SpeedRatio = (meanRadius3D(geomR3, st) - launchR0) / (rayAStepDr * cU)
    const met = isotropicSchwarzschildAtR(launchR0, rH, cU)
    const l2SpeedRatio = met.alpha / (met.psi * met.psi)
    const speedAbsDiff = Math.abs(l3SpeedRatio - l2SpeedRatio)

    const amp = ampAt(st, outSlotAfterFlat)
    const curvedPhase = Math.atan2(amp[1], amp[0])
    let dPhase = curvedPhase - flatPhase
    while (dPhase > Math.PI) dPhase -= 2 * Math.PI
    while (dPhase < -Math.PI) dPhase += 2 * Math.PI
    // Flat phase is -omegaClock * 1, curved phase is -omegaClock * alpha(r_0),
    // so curvedPhase - flatPhase = +omegaClock * (1 - alpha(r_0))
    const l3RedshiftDrop = dPhase / omegaClock
    const l2RedshiftDrop = 1 - met.alpha
    const redshiftAbsDiff = Math.abs(l3RedshiftDrop - l2RedshiftDrop)

    weakFieldMaxSpeedDiffVsExactL2 = Math.max(weakFieldMaxSpeedDiffVsExactL2, speedAbsDiff)
    weakFieldMaxRedshiftDiffVsExactL2 = Math.max(weakFieldMaxRedshiftDiffVsExactL2, redshiftAbsDiff)

    weakFieldPoints.push({
      uIso,
      rsOverR0,
      l3SpeedRatio,
      l2SpeedRatio,
      speedAbsDiff,
      l3RedshiftDrop,
      l2RedshiftDrop,
      redshiftAbsDiff,
    })
  }

  // Extract linear weak-field slopes from the two smallest uIso points (u = 0.0005, 0.001):
  //   c_rad / c_u = 1 - (r_s / r_0) + O((r_s/r_0)^2)  => slope d(1 - v_r/c_u) / d(r_s/r_0) = 1.0
  //   1 - alpha   = (1/2) (r_s / r_0) + O((r_s/r_0)^2) = G_eff M / (r_0 c_u^2) => slope = 1.0
  const wp0 = weakFieldPoints[0]!
  const wp1 = weakFieldPoints[1]!
  const l3WeakSpeedSlope =
    ((1 - wp1.l3SpeedRatio) - (1 - wp0.l3SpeedRatio)) / (wp1.rsOverR0 - wp0.rsOverR0)
  const l2WeakSpeedSlope = 1.0
  const l3WeakSpeedSlopeRelErr = Math.abs(l3WeakSpeedSlope - l2WeakSpeedSlope) / l2WeakSpeedSlope

  const l3WeakRedshiftSlope =
    (wp1.l3RedshiftDrop - wp0.l3RedshiftDrop) / (0.5 * (wp1.rsOverR0 - wp0.rsOverR0))
  const l2WeakRedshiftSlope = 1.0
  const l3WeakRedshiftSlopeRelErr =
    Math.abs(l3WeakRedshiftSlope - l2WeakRedshiftSlope) / l2WeakRedshiftSlope

  // 3C. Exact {3,4,3,4} ball dock counts N_ball(0..3) and ~ 18^R hardware scaling law
  const nBall0to3: readonly [number, number, number, number] = [
    ballR0.cells,
    ballR1.cells,
    geomR2.cells,
    geomR3.cells,
  ]
  const shellCounts0to3: readonly [number, number, number, number] = [
    nBall0to3[0],
    nBall0to3[1] - nBall0to3[0],
    nBall0to3[2] - nBall0to3[1],
    nBall0to3[3] - nBall0to3[2],
  ]
  const shellRatioS2OverS1 = shellCounts0to3[2] / shellCounts0to3[1]
  const shellRatioS3OverS2 = shellCounts0to3[3] / shellCounts0to3[2]
  const asymptoticShellRatio = R_VOL // 6034 / 330 = 18.284848...

  const bytesPerSlotComplex = 16 // Float64 re + im
  const scalingTable: HardwareScalingRow[] = []
  let cumDocks = 0
  let prevShell = 0
  for (let r = 0; r <= 10; r++) {
    let docks: number
    let exact: boolean
    if (r <= 3) {
      docks = nBall0to3[r]!
      prevShell = shellCounts0to3[r]!
      cumDocks = docks
      exact = true
    } else {
      // Conservative lower-bound shell growth using 18x per step (below S(3)/S(2) = 18.37 and R_VOL = 18.28)
      prevShell = prevShell * 18
      cumDocks += prevShell
      docks = cumDocks
      exact = false
    }
    const slots = docks * SLOTS
    const estStateBytesGB = (slots * bytesPerSlotComplex) / 1e9
    scalingTable.push({ radius: r, exact, docks, slots, estStateBytesGB })
  }
  const docksAtR8LowerBound = scalingTable[8]!.docks
  const docksAtR10LowerBound = scalingTable[10]!.docks

  const elapsedSeconds = (Date.now() - startedMs) / 1000

  return {
    elapsedSeconds,
    constants: {
      kEff: gravity.kEff,
      gEff: gravity.gEff,
      cUniversal: gravity.cUniversal,
      rawBulkY0Zero: rawBulk.y0Zero,
      rawBulkMGap: rawBulk.mGap,
    },
    geometry: {
      nBall0to3,
      shellCounts0to3,
      r2Cells: geomR2.cells,
      r2TotalSlots: geomR2.totalSlots,
      r2CoverConflicts: geomR2.coverConflicts,
      r2CoverMissing: geomR2.coverMissing,
      r2OrientationConflicts: geomR2.orientationConflicts,
      r2ChartConsistencyErr: geomR2.chartConsistencyErr,
      r3Cells: geomR3.cells,
      r3TotalSlots: geomR3.totalSlots,
      r3CoverConflicts: geomR3.coverConflicts,
      r3CoverMissing: geomR3.coverMissing,
      r3OrientationConflicts: geomR3.orientationConflicts,
      r3ChartConsistencyErr: geomR3.chartConsistencyErr,
      r3UnitOff: geomR3.unitOff,
      r3PairOff: geomR3.pairOff,
      dA,
      dB,
      dBallA: geomR3.distance[dA]!,
      dBallB: geomR3.distance[dB]!,
      initialSeparation,
    },
    part1TwoBody: {
      dockMatrixUnitarityMaxErr: dockMatrixUnitarityMaxErrP1,
      pairReciprocityMaxErr,
      equalMass: equalMassRun.summary,
      unequalMass1to3: unequalMassRun.summary,
      unequalMassLinearResponse: unequalLinearRun.summary,
      controlFreeG0: freeRun.summary,
      controlRawSchur: rawSchurRun.summary,
      controlRawCheeger: rawCheegerRun.summary,
      rawSchurCollapseFactorBeat1,
      rawSchurCollapseFactorBeat2,
      rawCheegerCollapseFactorBeat1,
      rawCheegerCollapseFactorBeat2,
    },
    part2Horizon: {
      launchDock,
      launchR0,
      omegaClock,
      dockMatrixUnitarityMaxErr: dockMatrixUnitarityMaxErrP2,
      sweep,
      strictlyMonotonicVRadial1,
      strictlyMonotonicDeltaR1,
      strictlyMonotonicDeltaR2,
      maxRaySpeedDiscrepancy,
      totalFrontierHits: totalHorizonFrontierHits,
      worstNormErr,
      worstPurityErr,
      worstReversalErr,
      worstOrthogonalityErr,
      worstSuperpositionOrthErr,
    },
    part3ConvergenceAndScaling: {
      r2VsR3Origin2BeatDiff,
      r2VsR3Origin2BeatFrontierHits,
      r2VsR3TwoBody1BeatDiff,
      r2VsR3TwoBody1BeatFrontierHits,
      r2VsR3Horizon1BeatDiff,
      r2VsR3Horizon1BeatFrontierHits,
      weakFieldPoints,
      weakFieldMaxSpeedDiffVsExactL2,
      weakFieldMaxRedshiftDiffVsExactL2,
      l3WeakSpeedSlope,
      l2WeakSpeedSlope,
      l3WeakSpeedSlopeRelErr,
      l3WeakRedshiftSlope,
      l2WeakRedshiftSlope,
      l3WeakRedshiftSlopeRelErr,
      shellRatioS2OverS1,
      shellRatioS3OverS2,
      asymptoticShellRatio,
      scalingTable,
      docksAtR8LowerBound,
      docksAtR10LowerBound,
    },
  }
}
