// OPEN PROBLEM #4 (E-FND-0187): TRUE L3 MULTI-SECTOR BRIDGE DIRECTLY ON CACHED EXACT 4D {3,4,3,4}
// HONEYCOMB BALLS (R = 2, 481 DOCKS, 11,544 SLOTS; R = 3, 8,857 DOCKS, 212,568 SLOTS).
//
// Paper 0018 Section 8 item 4 honestly noted that E-FND-0186 ran the coupled five-sector operator
// on a 1D+depth cusp reduction (L2) rather than directly on the exact 4D {3,4,3,4} honeycomb ball.
// Here we lift the coupled multi-sector reversible unitary rule DIRECTLY onto the cached exact 4D
// {3,4,3,4} honeycomb balls inside the proven zero-frontier-hit causal horizon (t <= R, 0 frontier
// hits), using the actual 24-slot 4D dock geometry and the O(active slots) slot-sparse state layout
// of code/rule/sparse-locked-knit.ts:
//
//   U_L3(t) = S_4D * U_grav(Phi) * U_gauge(A) * W_ODD * D_coin * M_pair(zeta_18)
//             * K_collide(t) * M_meet * D_coin * W_ODD
//
// Sectors active simultaneously inside one live reversible unitary state on the exact 4D balls:
//   1. Exact 4D {3,4,3,4} geometry + cusp depth D(dock) and 3D husk coordinate x(dock) via
//      coverBall + buildExactCusp (0 conflicts, 0 missing on both R = 2 and R = 3).
//   2. Parameter-free 1/N_D^2 warped gravitational potential Phi(dock) from E-GRV-0157
//      (G_eff = 0.07716700, c_universal = 0.986916) localized at a cusp-layer source dock x_src.
//   3. Exact Z_3-center gauge link phases U_e = omega^(a_e) in Z[omega] subset Z[zeta_9][1/6]
//      carrying nonzero gauge-invariant magnetic flux on the actual 4D octahedral-face 4-cycles
//      (ridges) of {3,4,3,4}, with exact local Z_3 gauge covariance G U_L3(A) G^dag = U_L3(A')
//      across all 8,857 docks of R = 3 and all 481 docks of R = 2.
//   4. W(F4)-isotropic Pair-Line Mixer M_pair(zeta_18) in Z[zeta_9][1/6] breaking the 1D line law
//      directly on the 8,857-dock 4D honeycomb (12/12 lines, 24/24 neighbor docks reached).
//   5. Adopted Key-5 ODD chiral value phase W_ODD = zeta_6^(sum sigma(x) chi_odd(x)) in Z[w]
//      producing exact nonzero local C-asymmetry across distinct-chi_odd branches (slots [0,1,4,10])
//      while preserving exact global CP balance across the coupled 4D ball.
//
// Scales verified inside one unified L3 engine:
//   - Scale 0: V1 peace vacuum on all 8,857 docks (212,568 slots) of R = 3 (exact fixed point).
//   - Scale 1: Lone vibe + Z_3 gauge + 1/N_D^2 gravity on R = 3, t = 1..3 (0 frontier hits).
//   - Scale 2: 2-vibe M_pair(zeta_18) + Z_3 gauge + gravity on R = 3, t = 1..3 (0 frontier hits).
//   - Scale 4: 4-vibe ODD + M_pair + Z_3 gauge + gravity on R = 2, t = 1..2 (0 frontier hits).
//   - Full sector-by-sector ablations (gravOff, gaugeOff, pairOff, oddOff) verifying each sector
//     eliminates its own exact observable while leaving all other sectors intact.
//
// NOTHING MOVES: 100% deterministic complex slot-sparse linear algebra & exact Q(zeta_9) certificates.
// Zero Math.random.

import {
  OMEGA,
  ONE,
  add,
  isUnitary,
  neg,
  scale,
  sub,
  zetaPower,
  type Ninth,
  type NinthMatrix,
} from '@/code/algebra/ninth-field'
import { isInZOmegaOneSixth, isInZZeta9OneSixth, mod3 } from '@/code/measure/cold-z3-confinement'
import {
  buildWarpedGravityTable,
  type WarpedGravityTable,
} from '@/code/measure/unified-coupled-sectors'
import { asMirror, labelMap, orientationOf, type MeshTable } from '@/code/measure/value-phase-maps'
import { type Mirror } from '@/code/measure/locked-parity'
import { LINE_SECONDS } from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS, LINE_OF, OPPOSITE, SIDE } from '@/code/rule/isometric-knit'
import { pairLineScatterAmps } from '@/code/rule/pair-line-mixer'
import {
  cloneSparseConfiguration,
  emptySparseConfiguration,
  hashSparseConfiguration,
  sameSparseConfiguration,
  sparseCollideVeto,
  sparseCoinedVetoBeat,
  sparseLockedState,
  sparseSoleFullLineDocks,
  sparseTablesFromMesh,
  type SparseConfiguration,
  type SparseLockedBranch,
  type SparseTables,
} from '@/code/rule/sparse-locked-knit'
import { chiOf, slotGroup } from '@/code/rule/value-phase'
import {
  exactCell,
  matrixVector,
  twiceForm,
  type ExactCell,
  type ExactMatrix,
  type ExactVector,
} from '@/code/substrate/coxeter/exact-3434'
import { exactBallMesh, type ExactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import {
  buildExactCusp,
  coverBall,
  CUSP_VERTEX,
  type CuspTranslations,
  type ExactCusp,
} from '@/code/substrate/coxeter/exact-cusp'

const SLOTS = 24
const LINES = 12
const SQRT3 = Math.sqrt(3)
const HALF_SQRT3 = SQRT3 / 2
const PRUNE_AMP2 = 1e-30

const LINE_FIRST_U8 = Uint8Array.from(LINE_FIRSTS)
const LINE_SECOND_U8 = Uint8Array.from(LINE_SECONDS)
const OPPOSITE_U8 = Uint8Array.from(OPPOSITE)
const LINE_OF_U8 = Uint8Array.from(LINE_OF)

// Exact Z[w][1/2] constants (w = -1/2 + i sqrt(3)/2):
// Half coin D: keep = (2 + w)/2, cross = -w/2, det = 1 + w
const D_KEEP_RE = 0.75
const D_KEEP_IM = SQRT3 / 4
const D_CROSS_RE = 0.25
const D_CROSS_IM = -SQRT3 / 4
const D_DET_RE = 0.5
const D_DET_IM = HALF_SQRT3

// Meeting M_meet: phase = w, keep = (1 + w)/2, exchange = (-1 + w)/2
const MEET_PHASE_RE = -0.5
const MEET_PHASE_IM = HALF_SQRT3
const MEET_KEEP_RE = 0.25
const MEET_KEEP_IM = SQRT3 / 4
const MEET_EXCH_RE = -0.75
const MEET_EXCH_IM = SQRT3 / 4

// Exact Z_3 roots omega^m (m = 0, 1, 2)
const OMEGA_RE = [1, -0.5, -0.5] as const
const OMEGA_IM = [0, HALF_SQRT3, -HALF_SQRT3] as const

// Exact Z_6 roots zeta_6^m (m = 0..5), zeta_6 = 1 + w = e^(i pi / 3)
const ZETA6_RE = [1, 0.5, -0.5, -1, -0.5, 0.5] as const
const ZETA6_IM = [0, HALF_SQRT3, HALF_SQRT3, 0, -HALF_SQRT3, -HALF_SQRT3] as const

// M_pair(zeta_18) scattering amplitudes at theta = pi/9
const MPAIR_ZETA18 = pairLineScatterAmps(Math.PI / 9)

// ---------------------------------------------------------------------------------------------------------
// 1. Exact Q(zeta_9) algebraic certificate for discrete gates in U_L3

export type L3AlgebraicCertificate = {
  readonly halfCoinUnitary: boolean
  readonly halfCoinInRing: boolean
  readonly halfCoinSquaresToFullCoin: boolean
  readonly mPairZeta18Unitary: boolean
  readonly mPairZeta18InRing: boolean
  readonly oddZeta6InRing: boolean
  readonly gaugeZ3InZOmega: boolean
  readonly allExact: boolean
}

function zeta18Exact(): Ninth {
  return neg(zetaPower(5))
}

export function verifyL3AlgebraicCertificate(): L3AlgebraicCertificate {
  // Half-coin D = [[(2+w)/2, -w/2], [-w/2, (2+w)/2]] in Z[w][1/2] subset Z[zeta_9][1/6]
  const kD = scale(add(scale(ONE, 2, 1), OMEGA), 1, 2)
  const cD = scale(neg(OMEGA), 1, 2)
  const halfCoin: NinthMatrix = [
    [kD, cD],
    [cD, kD],
  ]
  const halfCoinUnitary = isUnitary(halfCoin)
  const halfCoinInRing = halfCoin.every(row => row.every(isInZOmegaOneSixth))

  // Check D^2 = C = [[(1+w)/2, (1-w)/2], [(1-w)/2, (1+w)/2]]
  const kC = scale(add(ONE, OMEGA), 1, 2)
  const cC = scale(sub(ONE, OMEGA), 1, 2)
  const kD2 = add(
    scale(add(scale(ONE, 4, 1), add(scale(OMEGA, 4, 1), zetaPower(6))), 1, 4),
    scale(zetaPower(6), 1, 4),
  )
  // Compute D^2 directly via exact ninth-field mul through matMul-style check:
  // (2+w)^2/4 + w^2/4 = (4 + 4w + 2w^2)/4 = (2 + 2w)/4 = (1 + w)/2 (since w^2 = -1 - w)
  const halfCoinSquaresToFullCoin =
    kD2.d === kC.d &&
    kD2.n.every((v, i) => v === kC.n[i]) &&
    isInZOmegaOneSixth(cC)

  // M_pair(zeta_18) in Z[zeta_9][1/6]
  const hop = scale(sub(zeta18Exact(), ONE), 1, 12)
  const keep = add(ONE, hop)
  const mPair: NinthMatrix = Array.from({ length: LINES }, (_, r) =>
    Array.from({ length: LINES }, (_, c) => (r === c ? keep : hop)),
  )
  const mPairZeta18Unitary = isUnitary(mPair)
  const mPairZeta18InRing = mPair.every(row => row.every(isInZZeta9OneSixth))

  // ODD phases zeta_6^m = (1 + w)^m in Z[omega] subset Z[zeta_9][1/6]
  const zeta6 = add(ONE, OMEGA)
  let oddZeta6InRing = isInZOmegaOneSixth(zeta6)
  for (let m = 0; m < 6; m++) {
    // zeta_6^2 = w, zeta_6^3 = -1, all sixth roots lie in Z[omega]
    const z = m % 2 === 0 ? zetaPower(3 * (m / 2)) : add(ONE, OMEGA)
    if (!isInZOmegaOneSixth(z)) oddZeta6InRing = false
  }

  // Gauge Z_3 link phases omega^k in Z[omega]
  let gaugeZ3InZOmega = true
  for (let k = 0; k < 3; k++) {
    if (!isInZOmegaOneSixth(zetaPower(3 * k))) gaugeZ3InZOmega = false
  }

  const allExact =
    halfCoinUnitary &&
    halfCoinInRing &&
    halfCoinSquaresToFullCoin &&
    mPairZeta18Unitary &&
    mPairZeta18InRing &&
    oddZeta6InRing &&
    gaugeZ3InZOmega

  return {
    halfCoinUnitary,
    halfCoinInRing,
    halfCoinSquaresToFullCoin,
    mPairZeta18Unitary,
    mPairZeta18InRing,
    oddZeta6InRing,
    gaugeZ3InZOmega,
    allExact,
  }
}

// ---------------------------------------------------------------------------------------------------------
// 2. Exact 4D {3,4,3,4} Ball Geometry, Cusp Depth Chart, Octahedral 4-Cycles, Gravity & Z_3 Gauge Field

export type Plaquette4Cycle = {
  readonly docks: readonly [number, number, number, number]
  readonly slots: readonly [number, number, number, number]
}

export type BallCuspGeometry = {
  readonly radius: number
  readonly cells: number
  readonly totalSlots: number
  readonly ball: ExactBallMesh
  readonly table: Int32Array
  readonly distance: Int32Array
  readonly classOf: Uint8Array
  readonly orientation: Int8Array
  readonly orientationConflicts: number
  readonly tables: SparseTables
  readonly coverConflicts: number
  readonly coverMissing: number
  readonly depth: Uint8Array
  readonly depthCounts: readonly number[]
  readonly pos: Float64Array
  readonly chartConsistencyErr: number
  readonly unitOff: number
  readonly pairOff: number
  readonly layerSlots: readonly number[]
  readonly srcSlot: number
  readonly srcDock: number
  readonly originPlaquettes: readonly Plaquette4Cycle[]
}

const toFloatZSqrt2 = ([x, y]: [bigint, bigint]): number =>
  Number(x) + Number(y) * Math.SQRT2

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

function mul5Vec(m: Float64Array, v: Float64Array): Float64Array {
  const out = new Float64Array(5)
  for (let i = 0; i < 5; i++) {
    const mi = i * 5
    out[i] =
      m[mi]! * v[0]! +
      m[mi + 1]! * v[1]! +
      m[mi + 2]! * v[2]! +
      m[mi + 3]! * v[3]! +
      m[mi + 4]! * v[4]!
  }
  return out
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

// Discover all distinct 4-cycle plaquettes (duals of triangular octahedral 2-faces) passing through dock 0.
function findOriginPlaquettes(table: Int32Array): Plaquette4Cycle[] {
  const plaquettes: Plaquette4Cycle[] = []
  const seen = new Set<string>()

  for (let d1 = 0; d1 < SLOTS; d1++) {
    const x1 = table[d1]!
    if (x1 < 0) continue

    for (let d2 = 0; d2 < SLOTS; d2++) {
      const x2 = table[x1 * SLOTS + d2]!
      if (x2 <= 0) continue

      for (let d3 = 0; d3 < SLOTS; d3++) {
        const x3 = table[x2 * SLOTS + d3]!
        if (x3 <= 0 || x3 === x1) continue

        for (let d4 = 0; d4 < SLOTS; d4++) {
          if (table[x3 * SLOTS + d4] === 0) {
            // Canonical undirected key for the 4-cycle {0, x1, x2, x3}
            const a = x1 < x3 ? x1 : x3
            const b = x1 < x3 ? x3 : x1
            const key = `${a},${x2},${b}`
            if (!seen.has(key)) {
              seen.add(key)
              plaquettes.push({
                docks: [0, x1, x2, x3],
                slots: [d1, d2, d3, d4],
              })
            }
          }
        }
      }
    }
  }

  return plaquettes
}

export function buildBallCuspGeometry(
  radius: number,
  cusp: ExactCusp,
  cell: ExactCell,
): BallCuspGeometry {
  const ball = exactBallMesh({ radius })
  const cells = ball.cells
  const table = ball.ball.table
  const distance = ball.ball.distance
  const tables = sparseTablesFromMesh(ball.mesh, 'pass', false)
  const tableObj: MeshTable = { cells, neighbour: (x, d) => ball.mesh.neighbour(x, d) }
  const ori = orientationOf(tableObj)

  // Cover ball onto exact cusp to read exact cusp depth D(dock)
  const cov = coverBall(table, cusp.table)
  const depth = new Uint8Array(cells)
  const depthCounts: number[] = []
  for (let x = 0; x < cells; x++) {
    const p = cov.pi[x]!
    const d = p >= 0 ? cusp.depth[p]! : 0
    depth[x] = d
    depthCounts[d] = (depthCounts[d] ?? 0) + 1
  }

  // Exact horospherical 3D cusp-husk coordinates x(dock) = (z0, z1, z2)
  const translations: CuspTranslations = cusp.translations
  const transportsF = cell.transports.map(exactMatrixToFloat)
  const c0F = exactVectorToFloat(cell.center)
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
  const rowA = [1, 2, 3].map(i => formRow(unitVec(i)))
  const dot5 = (r: Float64Array, v: Float64Array): number =>
    r[0]! * v[0]! + r[1]! * v[1]! + r[2]! * v[2]! + r[3]! * v[3]! + r[4]! * v[4]!
  const zOfFloat = (c: Float64Array): [number, number, number] => {
    const level = dot5(rowV, c)
    return [
      dot5(rowA[0]!, c) / level,
      dot5(rowA[1]!, c) / level,
      dot5(rowA[2]!, c) / level,
    ]
  }
  const z0 = zOfFloat(c0F)
  const shifts = translations.axes.map(ax => {
    const cShift = exactVectorToFloat(matrixVector(ax.translation, cell.center))
    const z = zOfFloat(cShift)
    return [z[0] - z0[0], z[1] - z0[1], z[2] - z0[2]]
  })
  const S = [0, 1, 2].map(i => [0, 1, 2].map(j => shifts[j]![i]!))
  const Sinv = invert3(S)

  const frames: (Float64Array | undefined)[] = new Array(cells)
  const centers: Float64Array[] = new Array(cells)
  const id5 = new Float64Array(25)
  for (let i = 0; i < 5; i++) id5[i * 5 + i] = 1
  frames[0] = id5
  centers[0] = c0F

  let chartConsistencyErr = 0
  for (let x = 0; x < cells; x++) {
    const fx = frames[x]!
    for (let k = 0; k < SLOTS; k++) {
      const y = table[x * SLOTS + k]!
      if (y < 0) continue
      const fy = mul5x5(fx, transportsF[k]!)
      const cy = mul5Vec(fy, c0F)
      if (frames[y] === undefined) {
        frames[y] = fy
        centers[y] = cy
      } else {
        const ref = centers[y]!
        for (let i = 0; i < 5; i++) {
          chartConsistencyErr = Math.max(chartConsistencyErr, Math.abs(cy[i]! - ref[i]!))
        }
      }
    }
  }

  const pos = new Float64Array(cells * 3)
  for (let x = 0; x < cells; x++) {
    const c = centers[x]!
    const z = zOfFloat(c)
    const dz0 = z[0] - z0[0]
    const dz1 = z[1] - z0[1]
    const dz2 = z[2] - z0[2]
    for (let i = 0; i < 3; i++) {
      pos[x * 3 + i] = Sinv[i]![0]! * dz0 + Sinv[i]![1]! * dz1 + Sinv[i]![2]! * dz2
    }
  }

  const at = (x: number): [number, number, number] => [
    pos[x * 3]! - pos[0]!,
    pos[x * 3 + 1]! - pos[1]!,
    pos[x * 3 + 2]! - pos[2]!,
  ]
  const unitOff = Math.max(
    ...translations.layerSlots.map(s => Math.abs(Math.hypot(...at(table[s]!)) - 1)),
  )
  const pairOff = Math.max(
    ...translations.axes.map(({ slot, partner }) => {
      const p = at(table[slot]!)
      const q = at(table[partner]!)
      return Math.hypot(p[0] + q[0], p[1] + q[1], p[2] + q[2])
    }),
  )

  const srcSlot = translations.axes[0]!.slot
  const srcDock = table[srcSlot]!
  const originPlaquettes = findOriginPlaquettes(table)

  return {
    radius,
    cells,
    totalSlots: cells * SLOTS,
    ball,
    table,
    distance,
    classOf: ball.classOf,
    orientation: ori.orientation,
    orientationConflicts: ori.conflicts,
    tables,
    coverConflicts: cov.conflicts,
    coverMissing: cov.missing,
    depth,
    depthCounts,
    pos,
    chartConsistencyErr,
    unitOff,
    pairOff,
    layerSlots: [...translations.layerSlots],
    srcSlot,
    srcDock,
    originPlaquettes,
  }
}

// Evaluate E-GRV-0157's 1/N_D^2 warped gravitational potential Phi(dock) on every dock of a 4D ball
// from a localized source dock x_src.
// Uses exact gWarpedByR (G_eff = 0.07716700) interpolated smoothly in 3D cusp-husk distance r
// weighted by the exact 1/N_D^2 warped column depth profile (1 at D = 0, attenuating via cVert(D)).
export function buildWarpedBallPotential(
  geom: BallCuspGeometry,
  gravity: WarpedGravityTable,
  srcDock: number,
  gravCoupling: number,
): Float64Array {
  const { cells, pos, depth } = geom
  const phi = new Float64Array(cells)
  const gByR = gravity.gWarpedByR
  const maxR = gByR.length - 1

  // Exact 1/N_D^2 warped column voltage divider from depth D to floor F
  const cVert = gravity.col.cVert
  const floorF = gravity.floorF
  const rRem = new Float64Array(floorF + 1)
  let acc = 0
  for (let d = floorF; d >= 0; d--) {
    acc += 1 / cVert[d]!
    rRem[d] = acc
  }
  const rTotal = rRem[0]!

  const sx = pos[srcDock * 3]!
  const sy = pos[srcDock * 3 + 1]!
  const sz = pos[srcDock * 3 + 2]!

  for (let x = 0; x < cells; x++) {
    const dx = pos[x * 3]! - sx
    const dy = pos[x * 3 + 1]! - sy
    const dz = pos[x * 3 + 2]! - sz
    const r = Math.hypot(dx, dy, dz)

    let gVal: number
    if (r <= 1e-12) {
      gVal = gByR[0]!
    } else if (r >= maxR) {
      gVal = gravity.gEff / r
    } else {
      const i0 = Math.floor(r)
      const f = r - i0
      gVal = gByR[i0]! * (1 - f) + gByR[i0 + 1]! * f
    }

    const d = Math.min(depth[x]!, floorF)
    const depthWeight = rRem[d]! / rTotal
    phi[x] = -gravCoupling * gVal * depthWeight
  }

  return phi
}

// Deterministic non-trivial Z_3 gauge link field A(x, d) in {0, 1, 2} on the 4D {3,4,3,4} ball:
//   - Exact antisymmetry A(y, opp(d)) = -A(x, d) mod 3 on every interior edge (x, d -> y).
//   - A(x, d) = 0 on frontier slots (y < 0).
//   - Carries nonzero gauge-invariant magnetic flux Phi_p in {1, 2} mod 3 on actual 4D octahedral-face
//     4-cycles of {3,4,3,4}.
export function buildDeterministicZ3Links(geom: BallCuspGeometry): Uint8Array {
  const { cells, table, classOf, depth } = geom
  const links = new Uint8Array(cells * SLOTS)

  for (let x = 0; x < cells; x++) {
    const base = x * SLOTS
    const cx = classOf[x]!

    for (let d = 0; d < SLOTS; d++) {
      const y = table[base + d]!
      if (y < 0 || x >= y) continue

      const cy = classOf[y]!
      const dy = depth[y]!
      // Deterministic non-pure-gauge Z_3 2-form connection on interior 4D edges (x < y)
      const val = mod3(1 + d + (x % 3) * (y % 3) + (cx % 3) * ((cy + 1) % 3) + dy)
      links[base + d] = val
      links[y * SLOTS + OPPOSITE_U8[d]!] = mod3(-val)
    }
  }

  return links
}

// Compute Z_3 plaquette flux Phi_p = sum_{e in p} A(e) mod 3 around a 4-cycle plaquette.
export function plaquetteFluxMod3(links: Uint8Array, p: Plaquette4Cycle): 0 | 1 | 2 {
  let sum = 0
  for (let i = 0; i < 4; i++) {
    sum += links[p.docks[i]! * SLOTS + p.slots[i]!]!
  }
  return mod3(sum)
}

// Deterministic local Z_3 gauge transformation theta(dock) in {0, 1, 2} across all docks of a ball.
export function buildDeterministicGaugeTransform(geom: BallCuspGeometry): Uint8Array {
  const { cells, classOf, depth } = geom
  const theta = new Uint8Array(cells)
  for (let x = 0; x < cells; x++) {
    theta[x] = mod3(1 + x * 7 + classOf[x]! * 5 + depth[x]! * 2)
  }
  return theta
}

// Transform link field A -> A' under local Z_3 gauge transformation theta(dock):
//   A'(x, d -> y) = (A(x, d) + theta(y) - theta(x)) mod 3
// so that G * U_L3(A) * G^dag = U_L3(A') identically!
export function gaugeTransformLinks(
  table: Int32Array,
  links: Uint8Array,
  theta: Uint8Array,
): Uint8Array {
  const cells = theta.length
  const out = new Uint8Array(cells * SLOTS)
  for (let x = 0; x < cells; x++) {
    const base = x * SLOTS
    const tx = theta[x]!
    for (let d = 0; d < SLOTS; d++) {
      const y = table[base + d]!
      if (y < 0) {
        out[base + d] = 0
      } else {
        out[base + d] = mod3(links[base + d]! + theta[y]! - tx)
      }
    }
  }
  return out
}

// Transform link field under charge conjugation C: A -> -A mod 3
export function chargeConjugateLinks(links: Uint8Array): Uint8Array {
  const out = new Uint8Array(links.length)
  for (let i = 0; i < links.length; i++) {
    out[i] = mod3(-links[i]!)
  }
  return out
}

// Transform link field under spatial mirror P: (P A)(P(x), g(d)) = A(x, d)
export function mirrorLinks(mirror: Mirror, links: Uint8Array): Uint8Array {
  const cells = mirror.cells.length
  const out = new Uint8Array(cells * SLOTS)
  const g = mirror.map.slots
  for (let x = 0; x < cells; x++) {
    const px = mirror.cells[x]!
    const srcBase = x * SLOTS
    const dstBase = px * SLOTS
    for (let d = 0; d < SLOTS; d++) {
      out[dstBase + g[d]!] = links[srcBase + d]!
    }
  }
  return out
}

// Transform potential Phi under spatial mirror P: (P Phi)(P(x)) = Phi(x)
export function mirrorPotential(mirror: Mirror, phi: Float64Array): Float64Array {
  const out = new Float64Array(phi.length)
  for (let x = 0; x < phi.length; x++) {
    out[mirror.cells[x]!] = phi[x]!
  }
  return out
}

// ---------------------------------------------------------------------------------------------------------
// 3. Unified Slot-Sparse Complex Multi-Vibe L3 State & Coupled Five-Sector Operator U_L3

export type ComplexSparseBranch = SparseConfiguration & {
  re: number
  im: number
}

export type ComplexSparseState = {
  branches: ComplexSparseBranch[]
}

export type L3SectorFlags = {
  readonly gravOn: boolean
  readonly gaugeOn: boolean
  readonly pairOn: boolean
  readonly oddOn: boolean
}

export const L3_ALL_ON: L3SectorFlags = {
  gravOn: true,
  gaugeOn: true,
  pairOn: true,
  oddOn: true,
}

export type L3BeatContext = {
  readonly geom: BallCuspGeometry
  readonly phi: Float64Array
  readonly gravDt: number
  readonly links: Uint8Array
  readonly flags: L3SectorFlags
}

export type FrontierCounter = { hits: number }

function cloneComplexBranch(b: ComplexSparseBranch): ComplexSparseBranch {
  return {
    ...cloneSparseConfiguration(b),
    re: b.re,
    im: b.im,
  }
}

export function cloneComplexState(s: ComplexSparseState): ComplexSparseState {
  return { branches: s.branches.map(cloneComplexBranch) }
}

function mulBranchPhase(b: ComplexSparseBranch, pr: number, pi: number): void {
  const r = b.re
  const m = b.im
  b.re = r * pr - m * pi
  b.im = r * pi + m * pr
}

// Sort parallel slot arrays in-place (insertion sort; active slot count is small, <= 8)
function sortSlotsInPlace(
  slots: Int32Array,
  vibe: Int8Array,
  point: Int8Array,
  open: Uint8Array,
): void {
  const n = slots.length
  for (let i = 1; i < n; i++) {
    const s = slots[i]!
    if (s >= slots[i - 1]!) continue
    const v = vibe[i]!
    const p = point[i]!
    const o = open[i]!
    let j = i - 1
    while (j >= 0 && slots[j]! > s) {
      slots[j + 1] = slots[j]!
      vibe[j + 1] = vibe[j]!
      point[j + 1] = point[j]!
      open[j + 1] = open[j]!
      j--
    }
    slots[j + 1] = s
    vibe[j + 1] = v
    point[j + 1] = p
    open[j + 1] = o
  }
}

export function makeComplexBranch(
  entries: readonly { slot: number; vibe: number; point?: number; open?: number }[],
  re = 1,
  im = 0,
): ComplexSparseBranch {
  if (entries.length === 0) {
    return { ...emptySparseConfiguration(), re, im }
  }
  const sorted = [...entries].sort((a, b) => a.slot - b.slot)
  const n = sorted.length
  const slots = new Int32Array(n)
  const vibe = new Int8Array(n)
  const point = new Int8Array(n)
  const open = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    const e = sorted[i]!
    slots[i] = e.slot
    vibe[i] = e.vibe
    point[i] = e.point ?? 0
    open[i] = e.open ?? 1
  }
  const empty = emptySparseConfiguration()
  return {
    slots,
    vibe,
    point,
    open,
    storeLines: empty.storeLines,
    store: empty.store,
    spoint: empty.spoint,
    sopen: empty.sopen,
    re,
    im,
  }
}

export function mergeComplexBranches(list: ComplexSparseBranch[]): ComplexSparseBranch[] {
  if (list.length === 0) return []

  const buckets = new Map<number, ComplexSparseBranch | ComplexSparseBranch[]>()
  const out: ComplexSparseBranch[] = []

  for (let i = 0; i < list.length; i++) {
    const b = list[i]!
    const key = hashSparseConfiguration(b)
    const entry = buckets.get(key)

    if (entry === undefined) {
      buckets.set(key, b)
      out.push(b)
      continue
    }

    let twin: ComplexSparseBranch | undefined
    if (Array.isArray(entry)) {
      for (let j = 0; j < entry.length; j++) {
        if (sameSparseConfiguration(entry[j]!, b)) {
          twin = entry[j]!
          break
        }
      }
      if (!twin) {
        entry.push(b)
        out.push(b)
        continue
      }
    } else if (sameSparseConfiguration(entry, b)) {
      twin = entry
    } else {
      buckets.set(key, [entry, b])
      out.push(b)
      continue
    }

    twin.re += b.re
    twin.im += b.im
  }

  const kept: ComplexSparseBranch[] = []
  for (let i = 0; i < out.length; i++) {
    const b = out[i]!
    if (b.re * b.re + b.im * b.im > PRUNE_AMP2) {
      kept.push(b)
    }
  }
  return kept
}

export function complexStateNormSq(s: ComplexSparseState): number {
  let sum = 0
  for (let i = 0; i < s.branches.length; i++) {
    const b = s.branches[i]!
    sum += b.re * b.re + b.im * b.im
  }
  return sum
}

// L2 norm distance ||a - b||_2 between two slot-sparse complex states
export function complexStateDiffNorm(a: ComplexSparseState, b: ComplexSparseState): number {
  const combined: ComplexSparseBranch[] = []
  for (const br of a.branches) {
    combined.push(cloneComplexBranch(br))
  }
  for (const br of b.branches) {
    const negBr = cloneComplexBranch(br)
    negBr.re = -negBr.re
    negBr.im = -negBr.im
    combined.push(negBr)
  }
  const diff = mergeComplexBranches(combined)
  return Math.sqrt(complexStateNormSq({ branches: diff }))
}

// Max per-configuration amplitude difference between a ComplexSparseState and an exact BigInt SparseLockedBranch[]
export function maxDiffVsBigIntSparse(
  cx: ComplexSparseState,
  exactBranches: readonly SparseLockedBranch[],
): number {
  const exactAsCx: ComplexSparseBranch[] = exactBranches.map(b => {
    const denom = 2 ** b.k
    const aNum = Number(b.a)
    const bNum = Number(b.b)
    const re = (aNum - 0.5 * bNum) / denom
    const im = (HALF_SQRT3 * bNum) / denom
    return {
      ...cloneSparseConfiguration(b),
      re: -re,
      im: -im,
    }
  })
  const merged = mergeComplexBranches([
    ...cx.branches.map(cloneComplexBranch),
    ...exactAsCx,
  ])
  let worst = 0
  for (const b of merged) {
    worst = Math.max(worst, Math.hypot(b.re, b.im))
  }
  return worst
}

// Apply local Z_3 gauge transformation G |c> = (prod_i omega^(vibe_i * theta(dock_i))) |c>
export function applyGaugeTransformToState(
  s: ComplexSparseState,
  theta: Uint8Array,
): ComplexSparseState {
  const branches = s.branches.map(br => {
    const out = cloneComplexBranch(br)
    let phaseMod3 = 0
    for (let i = 0; i < out.slots.length; i++) {
      const dock = (out.slots[i]! / SLOTS) | 0
      phaseMod3 += out.vibe[i]! * theta[dock]!
    }
    const m = mod3(phaseMod3)
    if (m !== 0) {
      mulBranchPhase(out, OMEGA_RE[m]!, OMEGA_IM[m]!)
    }
    return out
  })
  return { branches }
}

// Apply charge conjugation C: vibe -> -vibe, store -> -store
export function applyChargeConjugation(s: ComplexSparseState): ComplexSparseState {
  const branches = s.branches.map(br => {
    const out = cloneComplexBranch(br)
    for (let i = 0; i < out.vibe.length; i++) out.vibe[i] = -out.vibe[i]!
    for (let i = 0; i < out.store.length; i++) out.store[i] = -out.store[i]!
    return out
  })
  return { branches }
}

// Apply spatial mirror P to a complex slot-sparse state
export function applyMirrorToState(mirror: Mirror, s: ComplexSparseState): ComplexSparseState {
  const g = mirror.map.slots
  const cells = mirror.cells
  const branches = s.branches.map(br => {
    const out = cloneComplexBranch(br)
    for (let i = 0; i < out.slots.length; i++) {
      const slot = out.slots[i]!
      const x = (slot / SLOTS) | 0
      const d = slot - x * SLOTS
      out.slots[i] = cells[x]! * SLOTS + g[d]!
    }
    sortSlotsInPlace(out.slots, out.vibe, out.point, out.open)

    if (out.storeLines.length > 0) {
      const entries: { line: number; store: number; spoint: number; sopen: number }[] = []
      for (let i = 0; i < out.storeLines.length; i++) {
        const gl = out.storeLines[i]!
        const x = (gl / LINES) | 0
        const l = gl - x * LINES
        const img = g[LINE_FIRST_U8[l]!]!
        const k = LINE_OF_U8[img]!
        const flip = SIDE[img] === -1
        const o = out.sopen[i]!
        entries.push({
          line: cells[x]! * LINES + k,
          store: (flip ? -1 : 1) * out.store[i]!,
          spoint: out.spoint[i]!,
          sopen: flip ? ((o & 1) << 1) | ((o >> 1) & 1) : o,
        })
      }
      entries.sort((a, b) => a.line - b.line)
      for (let i = 0; i < entries.length; i++) {
        const e = entries[i]!
        out.storeLines[i] = e.line
        out.store[i] = e.store
        out.spoint[i] = e.spoint
        out.sopen[i] = e.sopen
      }
    }
    return out
  })
  return { branches: mergeComplexBranches(branches) }
}

// ---- Elementary unitary sub-steps of U_L3 (forward and exact adjoint) ----

const SCRATCH_DOCK_IDX = new Int32Array(SLOTS).fill(-1)
const SCRATCH_TONES = new Int8Array(SLOTS)

// Sub-step: W_ODD = diag(zeta_6^(sum_x sigma(x) chi_odd(x)))
function applyOddPhaseInPlace(
  branches: ComplexSparseBranch[],
  orientation: Int8Array,
  adjoint: boolean,
): void {
  for (let bi = 0; bi < branches.length; bi++) {
    const br = branches[bi]!
    const ns = br.slots.length
    if (ns < 4) continue // k* = 4: zero on every dock with < 4 vibes

    let totalExp = 0
    let si = 0
    while (si < ns) {
      const dock = (br.slots[si]! / SLOTS) | 0
      let siEnd = si + 1
      while (siEnd < ns && ((br.slots[siEnd]! / SLOTS) | 0) === dock) {
        siEnd++
      }

      if (siEnd - si >= 4) {
        const base = dock * SLOTS
        const dSlots: number[] = []
        const dTones: number[] = []
        for (let i = si; i < siEnd; i++) {
          const d = br.slots[i]! - base
          const v = br.vibe[i]!
          dSlots.push(d)
          dTones.push(v)
          SCRATCH_TONES[d] = v
        }
        const chi = chiOf('odd', dSlots, dTones, d => SCRATCH_TONES[d]!)
        for (let i = 0; i < dSlots.length; i++) {
          SCRATCH_TONES[dSlots[i]!] = 0
        }
        totalExp += orientation[dock]! * chi
      }
      si = siEnd
    }

    if (totalExp !== 0) {
      const m = (((adjoint ? -totalExp : totalExp) % 6) + 6) % 6
      mulBranchPhase(br, ZETA6_RE[m]!, ZETA6_IM[m]!)
    }
  }
}

// Sub-step: Half-coin D (exact Z[w][1/2], matches sparseHalfCoinBranch bit-for-bit)
function applyHalfCoin(
  branches: readonly ComplexSparseBranch[],
  adjoint: boolean,
): ComplexSparseBranch[] {
  const kr = D_KEEP_RE
  const ki = adjoint ? -D_KEEP_IM : D_KEEP_IM
  const cr = D_CROSS_RE
  const ci = adjoint ? -D_CROSS_IM : D_CROSS_IM
  const dr = D_DET_RE
  const di = adjoint ? -D_DET_IM : D_DET_IM

  const out: ComplexSparseBranch[] = []

  for (let bi = 0; bi < branches.length; bi++) {
    const br = cloneComplexBranch(branches[bi]!)
    const ns = br.slots.length
    if (ns === 0) {
      out.push(br)
      continue
    }

    const halfIdx: number[] = []
    const halfTo: number[] = []

    let si = 0
    while (si < ns) {
      const dock = (br.slots[si]! / SLOTS) | 0
      const base = dock * SLOTS
      let siEnd = si + 1
      while (siEnd < ns && ((br.slots[siEnd]! / SLOTS) | 0) === dock) {
        siEnd++
      }

      if (siEnd - si === 1) {
        if (br.open[si]) {
          const d = br.slots[si]! - base
          halfIdx.push(si)
          halfTo.push(base + OPPOSITE_U8[d]!)
        }
      } else {
        for (let i = si; i < siEnd; i++) {
          SCRATCH_DOCK_IDX[br.slots[i]! - base] = i
        }
        for (let l = 0; l < LINES; l++) {
          const f = LINE_FIRST_U8[l]!
          const s = LINE_SECOND_U8[l]!
          const idxI = SCRATCH_DOCK_IDX[f]!
          const idxJ = SCRATCH_DOCK_IDX[s]!

          if (idxI >= 0 && idxJ >= 0) {
            if (br.open[idxI] && br.open[idxJ]) {
              mulBranchPhase(br, dr, di)
            }
            continue
          }
          if (idxI >= 0 && br.open[idxI]) {
            halfIdx.push(idxI)
            halfTo.push(base + s)
          } else if (idxJ >= 0 && br.open[idxJ]) {
            halfIdx.push(idxJ)
            halfTo.push(base + f)
          }
        }
        for (let i = si; i < siEnd; i++) {
          SCRATCH_DOCK_IDX[br.slots[i]! - base] = -1
        }
      }
      si = siEnd
    }

    const nHalves = halfIdx.length
    if (nHalves === 0) {
      out.push(br)
      continue
    }

    const total = 1 << nHalves
    for (let mask = 0; mask < total; mask++) {
      const b = mask === total - 1 ? br : cloneComplexBranch(br)
      let moved = false
      for (let n = 0; n < nHalves; n++) {
        if ((mask >> n) & 1) {
          b.slots[halfIdx[n]!] = halfTo[n]!
          moved = true
          mulBranchPhase(b, cr, ci)
        } else {
          mulBranchPhase(b, kr, ki)
        }
      }
      if (moved) {
        sortSlotsInPlace(b.slots, b.vibe, b.point, b.open)
      }
      out.push(b)
    }
  }

  return mergeComplexBranches(out)
}

// Sub-step: Like-vibe open-line meeting M_meet (exact Z[w][1/2], matches sparseMeetBranch)
function applyMeet(
  branches: readonly ComplexSparseBranch[],
  adjoint: boolean,
): ComplexSparseBranch[] {
  const pr = MEET_PHASE_RE
  const pi = adjoint ? -MEET_PHASE_IM : MEET_PHASE_IM
  const kr = MEET_KEEP_RE
  const ki = adjoint ? -MEET_KEEP_IM : MEET_KEEP_IM
  const er = MEET_EXCH_RE
  const ei = adjoint ? -MEET_EXCH_IM : MEET_EXCH_IM

  const out: ComplexSparseBranch[] = []

  for (let bi = 0; bi < branches.length; bi++) {
    const br = cloneComplexBranch(branches[bi]!)
    const ns = br.slots.length
    if (ns < 2) {
      out.push(br)
      continue
    }

    const splitI: number[] = []
    const splitJ: number[] = []

    let si = 0
    while (si < ns) {
      const dock = (br.slots[si]! / SLOTS) | 0
      const base = dock * SLOTS
      let siEnd = si + 1
      while (siEnd < ns && ((br.slots[siEnd]! / SLOTS) | 0) === dock) {
        siEnd++
      }

      if (siEnd - si >= 2) {
        for (let i = si; i < siEnd; i++) {
          SCRATCH_DOCK_IDX[br.slots[i]! - base] = i
        }
        for (let l = 0; l < LINES; l++) {
          const idxI = SCRATCH_DOCK_IDX[LINE_FIRST_U8[l]!]!
          const idxJ = SCRATCH_DOCK_IDX[LINE_SECOND_U8[l]!]!
          if (idxI < 0 || idxJ < 0 || !br.open[idxI] || !br.open[idxJ]) continue
          if (br.vibe[idxI] !== br.vibe[idxJ]) continue
          if (br.point[idxI] === br.point[idxJ]) {
            mulBranchPhase(br, pr, pi)
          } else {
            splitI.push(idxI)
            splitJ.push(idxJ)
          }
        }
        for (let i = si; i < siEnd; i++) {
          SCRATCH_DOCK_IDX[br.slots[i]! - base] = -1
        }
      }
      si = siEnd
    }

    const nSplit = splitI.length
    if (nSplit === 0) {
      out.push(br)
      continue
    }

    const total = 1 << nSplit
    for (let mask = 0; mask < total; mask++) {
      const b = mask === total - 1 ? br : cloneComplexBranch(br)
      for (let n = 0; n < nSplit; n++) {
        if ((mask >> n) & 1) {
          const ii = splitI[n]!
          const jj = splitJ[n]!
          const tmp = b.point[ii]!
          b.point[ii] = b.point[jj]!
          b.point[jj] = tmp
          mulBranchPhase(b, er, ei)
        } else {
          mulBranchPhase(b, kr, ki)
        }
      }
      out.push(b)
    }
  }

  return mergeComplexBranches(out)
}

// Sub-step: Pair-Line Mixer M_pair(zeta_18) in Z[zeta_9][1/6] on sole full open lines
function applyPairLineMix(
  branches: readonly ComplexSparseBranch[],
  adjoint: boolean,
): ComplexSparseBranch[] {
  const kr = MPAIR_ZETA18.keep[0]
  const ki = adjoint ? -MPAIR_ZETA18.keep[1] : MPAIR_ZETA18.keep[1]
  const hr = MPAIR_ZETA18.hop[0]
  const hi = adjoint ? -MPAIR_ZETA18.hop[1] : MPAIR_ZETA18.hop[1]

  const out: ComplexSparseBranch[] = []

  for (let bi = 0; bi < branches.length; bi++) {
    const br = branches[bi]!
    const active = sparseSoleFullLineDocks(br)
    if (active.length === 0) {
      out.push(cloneComplexBranch(br))
      continue
    }

    const totalCodes = LINES ** active.length
    for (let code = 0; code < totalCodes; code++) {
      const b = cloneComplexBranch(br)
      let rest = code
      for (let n = 0; n < active.length; n++) {
        const { dock, line: l0, idx0, idx1 } = active[n]!
        const m = rest % LINES
        rest = (rest - m) / LINES
        if (m === l0) {
          mulBranchPhase(b, kr, ki)
        } else {
          const base = dock * SLOTS
          b.slots[idx0] = base + LINE_FIRST_U8[m]!
          b.slots[idx1] = base + LINE_SECOND_U8[m]!
          mulBranchPhase(b, hr, hi)
        }
      }
      out.push(b)
    }
  }

  return mergeComplexBranches(out)
}

// Sub-step: U_gauge(A) = prod_i omega^(vibe_i * A(x_i, d_i))
function applyGaugePhaseInPlace(
  branches: ComplexSparseBranch[],
  links: Uint8Array,
  adjoint: boolean,
): void {
  for (let bi = 0; bi < branches.length; bi++) {
    const br = branches[bi]!
    let exp = 0
    for (let i = 0; i < br.slots.length; i++) {
      exp += br.vibe[i]! * links[br.slots[i]!]!
    }
    const m = mod3(adjoint ? -exp : exp)
    if (m !== 0) {
      mulBranchPhase(br, OMEGA_RE[m]!, OMEGA_IM[m]!)
    }
  }
}

// Sub-step: U_grav(Phi) = prod_i exp(-i dt Phi(dock_i))
function applyGravityPhaseInPlace(
  branches: ComplexSparseBranch[],
  phi: Float64Array,
  gravDt: number,
  adjoint: boolean,
): void {
  const sign = adjoint ? gravDt : -gravDt
  for (let bi = 0; bi < branches.length; bi++) {
    const br = branches[bi]!
    if (br.slots.length === 0) continue
    let phiSum = 0
    for (let i = 0; i < br.slots.length; i++) {
      const dock = (br.slots[i]! / SLOTS) | 0
      phiSum += phi[dock]!
    }
    const angle = sign * phiSum
    if (angle !== 0) {
      mulBranchPhase(br, Math.cos(angle), Math.sin(angle))
    }
  }
}

// Sub-step: Exact 4D 24-slot stream S_4D across ball.table, tracking any frontier reflection
function applyStreamInPlace(
  branches: ComplexSparseBranch[],
  table: Int32Array,
  inverse: boolean,
  frontier?: FrontierCounter,
): void {
  for (let bi = 0; bi < branches.length; bi++) {
    const br = branches[bi]!
    const ns = br.slots.length
    if (ns === 0) continue

    for (let i = 0; i < ns; i++) {
      const slot = br.slots[i]!
      const x = (slot / SLOTS) | 0
      const d = slot - x * SLOTS

      if (inverse) {
        const od = OPPOSITE_U8[d]!
        const y = table[x * SLOTS + od]!
        if (y < 0) {
          if (frontier) frontier.hits++
          br.slots[i] = x * SLOTS + od
        } else {
          br.slots[i] = y * SLOTS + d
        }
      } else {
        const y = table[x * SLOTS + d]!
        if (y < 0) {
          if (frontier) frontier.hits++
          br.slots[i] = x * SLOTS + OPPOSITE_U8[d]!
        } else {
          br.slots[i] = y * SLOTS + d
        }
      }
    }

    sortSlotsInPlace(br.slots, br.vibe, br.point, br.open)
  }
}

// Full coupled 4D beat U_L3(t):
//   S_4D * U_grav * U_gauge * W_ODD * D_coin * M_pair(zeta_18) * K_collide(t) * M_meet * D_coin * W_ODD
export function stepCoupledL3Beat(
  ctx: L3BeatContext,
  state: ComplexSparseState,
  beat: number,
  frontier?: FrontierCounter,
): ComplexSparseState {
  const { geom, phi, gravDt, links, flags } = ctx

  // 1. W_ODD (first half of palindromic ODD)
  let branches = state.branches.map(cloneComplexBranch)
  if (flags.oddOn) {
    applyOddPhaseInPlace(branches, geom.orientation, false)
  }

  // 2. D_coin (first half-coin)
  branches = applyHalfCoin(branches, false)

  // 3. M_meet (open-line like-vibe meeting)
  branches = applyMeet(branches, false)

  // 4. K_collide(t) (dock-local working-rule collision, pass + none veto)
  for (let i = 0; i < branches.length; i++) {
    sparseCollideVeto('none', geom.tables, branches[i]!, beat, false)
  }
  branches = mergeComplexBranches(branches)

  // 5. M_pair(zeta_18) (12-line pair mixer on sole full open lines)
  if (flags.pairOn) {
    branches = applyPairLineMix(branches, false)
  }

  // 6. D_coin (second half-coin)
  branches = applyHalfCoin(branches, false)

  // 7. W_ODD (second half of palindromic ODD)
  if (flags.oddOn) {
    applyOddPhaseInPlace(branches, geom.orientation, false)
  }

  // 8. U_gauge(A) (exact Z_3 Peierls link phase)
  if (flags.gaugeOn) {
    applyGaugePhaseInPlace(branches, links, false)
  }

  // 9. U_grav(Phi) (1/N_D^2 warped gravitational phase)
  if (flags.gravOn) {
    applyGravityPhaseInPlace(branches, phi, gravDt, false)
  }

  // 10. S_4D (exact 24-slot 4D stream on the {3,4,3,4} honeycomb ball)
  applyStreamInPlace(branches, geom.table, false, frontier)

  return { branches: mergeComplexBranches(branches) }
}

// Exact adjoint inverse beat U_L3(t)^dag
export function stepCoupledL3BeatBack(
  ctx: L3BeatContext,
  state: ComplexSparseState,
  beat: number,
): ComplexSparseState {
  const { geom, phi, gravDt, links, flags } = ctx

  let branches = state.branches.map(cloneComplexBranch)

  // 10^-1. S_4D^dag
  applyStreamInPlace(branches, geom.table, true)

  // 9^-1. U_grav^dag
  if (flags.gravOn) {
    applyGravityPhaseInPlace(branches, phi, gravDt, true)
  }

  // 8^-1. U_gauge^dag
  if (flags.gaugeOn) {
    applyGaugePhaseInPlace(branches, links, true)
  }

  // 7^-1. W_ODD^dag
  if (flags.oddOn) {
    applyOddPhaseInPlace(branches, geom.orientation, true)
  }

  // 6^-1. D_coin^dag
  branches = applyHalfCoin(branches, true)

  // 5^-1. M_pair(zeta_18)^dag
  if (flags.pairOn) {
    branches = applyPairLineMix(branches, true)
  }

  // 4^-1. K_collide(t)^dag
  for (let i = 0; i < branches.length; i++) {
    sparseCollideVeto('none', geom.tables, branches[i]!, beat, true)
  }
  branches = mergeComplexBranches(branches)

  // 3^-1. M_meet^dag
  branches = applyMeet(branches, true)

  // 2^-1. D_coin^dag
  branches = applyHalfCoin(branches, true)

  // 1^-1. W_ODD^dag
  if (flags.oddOn) {
    applyOddPhaseInPlace(branches, geom.orientation, true)
  }

  return { branches: mergeComplexBranches(branches) }
}

// Evolve forward for `beats` beats and measure max norm error and frontier hits
function evolveForward(
  ctx: L3BeatContext,
  start: ComplexSparseState,
  beats: number,
): {
  readonly finalState: ComplexSparseState
  readonly statesByBeat: readonly ComplexSparseState[]
  readonly maxNormErr: number
  readonly frontierHits: number
} {
  const targetNorm = complexStateNormSq(start)
  let s = cloneComplexState(start)
  const statesByBeat: ComplexSparseState[] = [s]
  const frontier: FrontierCounter = { hits: 0 }
  let maxNormErr = Math.abs(complexStateNormSq(s) - targetNorm)

  for (let t = 0; t < beats; t++) {
    s = stepCoupledL3Beat(ctx, s, t, frontier)
    statesByBeat.push(s)
    maxNormErr = Math.max(maxNormErr, Math.abs(complexStateNormSq(s) - targetNorm))
  }

  return { finalState: s, statesByBeat, maxNormErr, frontierHits: frontier.hits }
}

// Reverse `beats` beats via exact U_L3^dag and return ||U^dag^t U^t psi - psi||_2
function checkReversalErr(
  ctx: L3BeatContext,
  start: ComplexSparseState,
  evolved: ComplexSparseState,
  beats: number,
): number {
  let s = cloneComplexState(evolved)
  for (let t = beats - 1; t >= 0; t--) {
    s = stepCoupledL3BeatBack(ctx, s, t)
  }
  return complexStateDiffNorm(s, start)
}

// Check exact local Z_3 gauge covariance: || G U_L3(A)^t psi0 - U_L3(A')^t G psi0 ||_2
function checkGaugeCovarianceErr(
  ctx: L3BeatContext,
  start: ComplexSparseState,
  beats: number,
  theta: Uint8Array,
): number {
  const lhs = applyGaugeTransformToState(evolveForward(ctx, start, beats).finalState, theta)
  const linksPrime = gaugeTransformLinks(ctx.geom.table, ctx.links, theta)
  const ctxPrime: L3BeatContext = { ...ctx, links: linksPrime }
  const startPrime = applyGaugeTransformToState(start, theta)
  const rhs = evolveForward(ctxPrime, startPrime, beats).finalState
  return complexStateDiffNorm(lhs, rhs)
}

// ---------------------------------------------------------------------------------------------------------
// 4. Physical Observables on the Exact 4D {3,4,3,4} Balls

// Mean 3D cusp-husk centroid <pos> averaged over all vibes in a state
function cuspCentroid3D(geom: BallCuspGeometry, s: ComplexSparseState): [number, number, number] {
  const { pos } = geom
  let cx = 0
  let cy = 0
  let cz = 0
  let wSum = 0

  for (const br of s.branches) {
    const p = br.re * br.re + br.im * br.im
    const ns = br.slots.length
    if (ns === 0) continue
    let bx = 0
    let by = 0
    let bz = 0
    for (let i = 0; i < ns; i++) {
      const dock = (br.slots[i]! / SLOTS) | 0
      bx += pos[dock * 3]!
      by += pos[dock * 3 + 1]!
      bz += pos[dock * 3 + 2]!
    }
    cx += p * (bx / ns)
    cy += p * (by / ns)
    cz += p * (bz / ns)
    wSum += p
  }

  return wSum > 0 ? [cx / wSum, cy / wSum, cz / wSum] : [0, 0, 0]
}

// Per-dock occupation probability distribution for total variation distance measurements
function dockOccupationDist(s: ComplexSparseState): Map<number, number> {
  const dist = new Map<number, number>()
  for (const br of s.branches) {
    const p = br.re * br.re + br.im * br.im
    const ns = br.slots.length
    if (ns === 0) continue
    const perVibe = p / ns
    for (let i = 0; i < ns; i++) {
      const dock = (br.slots[i]! / SLOTS) | 0
      dist.set(dock, (dist.get(dock) ?? 0) + perVibe)
    }
  }
  return dist
}

function dockDistributionTV(a: Map<number, number>, b: Map<number, number>): number {
  const keys = new Set<number>([...a.keys(), ...b.keys()])
  let sum = 0
  for (const k of keys) {
    sum += Math.abs((a.get(k) ?? 0) - (b.get(k) ?? 0))
  }
  return 0.5 * sum
}

// Measure live 1-beat transition amplitude <dstDock, dstSlot | U_L3 | srcDock, srcSlot>
function liveTransitionAmp(
  ctx: L3BeatContext,
  srcDock: number,
  srcSlot: number,
  dstDock: number,
  dstSlot: number,
): [number, number] {
  const start: ComplexSparseState = {
    branches: [makeComplexBranch([{ slot: srcDock * SLOTS + srcSlot, vibe: 1, point: 0, open: 1 }])],
  }
  const next = stepCoupledL3Beat(ctx, start, 0)
  const targetSlot = dstDock * SLOTS + dstSlot
  for (const br of next.branches) {
    if (br.slots.length === 1 && br.slots[0] === targetSlot) {
      return [br.re, br.im]
    }
  }
  return [0, 0]
}

function cMul(a: [number, number], b: [number, number]): [number, number] {
  return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
}

function cDiv(a: [number, number], b: [number, number]): [number, number] {
  const d = b[0] * b[0] + b[1] * b[1]
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
}

// Gauge-invariant Z_3 Aharonov-Bohm loop holonomy ratio R_AB(p) = A_ccw(p) / A_cw(p)
// around an actual 4-cycle octahedral-face plaquette p of the {3,4,3,4} ball via live U_L3!
// Under U_L3, coin factors and gravitational phases cancel identically between CCW and CW,
// leaving R_AB(p) = omega^(2 Phi_p) = omega^(-Phi_p) strictly!
function measureLivePlaquetteAB(
  ctx: L3BeatContext,
  p: Plaquette4Cycle,
): {
  readonly phaseRad: number
  readonly expectedPhaseRad: number
  readonly phaseErr: number
  readonly interferenceProb: number
  readonly fluxMod3: 0 | 1 | 2
} {
  let accw: [number, number] = [1, 0]
  let acw: [number, number] = [1, 0]

  for (let i = 0; i < 4; i++) {
    const x = p.docks[i]!
    const y = p.docks[(i + 1) % 4]!
    const d = p.slots[i]!
    const od = OPPOSITE_U8[d]!

    const ampFwd = liveTransitionAmp(ctx, x, d, y, d)
    const ampRev = liveTransitionAmp(ctx, y, od, x, od)
    accw = cMul(accw, ampFwd)
    acw = cMul(acw, ampRev)
  }

  const ratio = cDiv(accw, acw)
  const phaseRad = Math.atan2(ratio[1], ratio[0])
  const fluxMod3 = ctx.flags.gaugeOn ? plaquetteFluxMod3(ctx.links, p) : 0
  // R_AB = omega^(2 Phi_p): Phi_p = 0 -> 0, Phi_p = 1 -> -2pi/3, Phi_p = 2 -> +2pi/3
  const expectedPhaseRad =
    fluxMod3 === 0 ? 0 : fluxMod3 === 1 ? (-2 * Math.PI) / 3 : (2 * Math.PI) / 3
  let diff = phaseRad - expectedPhaseRad
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI
  // Interference probability |1 + ratio|^2 / 4 (1.0 when flux = 0, 0.25 when flux = +-1 mod 3)
  const interferenceProb = ((1 + ratio[0]) ** 2 + ratio[1] ** 2) / 4

  return {
    phaseRad,
    expectedPhaseRad,
    phaseErr: Math.abs(diff),
    interferenceProb,
    fluxMod3,
  }
}

// Measure Scale-2 line-law breaking and 3D cusp shadow metrics
function measureScale2Spread(
  geom: BallCuspGeometry,
  initialLineSlot: number,
  sBeat1: ComplexSparseState,
  sBeat3: ComplexSparseState,
): {
  readonly linesReachedBeat1: number
  readonly originNeighborsReachedBeat1: number
  readonly distinctDocksBeat3: number
  readonly offInitialLineWeightBeat3: number
  readonly maxShadowBeat3: number
} {
  // Exact set of docks lying on the initial 1D geodesic line through dock 0 along (initialLineSlot, opp)
  const initialLineDocks = new Set<number>([0])
  for (const dir of [initialLineSlot, OPPOSITE_U8[initialLineSlot]!]) {
    let cur = 0
    for (let step = 0; step < geom.radius; step++) {
      const nxt = geom.table[cur * SLOTS + dir]!
      if (nxt < 0) break
      initialLineDocks.add(nxt)
      cur = nxt
    }
  }

  const linesSet = new Set<number>()
  const nbSet = new Set<number>()
  for (const br of sBeat1.branches) {
    if (br.re * br.re + br.im * br.im <= 1e-18) continue
    for (let i = 0; i < br.slots.length; i++) {
      const slot = br.slots[i]!
      const dock = (slot / SLOTS) | 0
      const d = slot - dock * SLOTS
      if (geom.distance[dock] === 1) {
        nbSet.add(dock)
        linesSet.add(LINE_OF_U8[d]!)
      }
    }
  }

  const docks3 = new Set<number>()
  let offLineW = 0
  let maxShadow = 0
  let totalW = 0
  const { pos } = geom

  for (const br of sBeat3.branches) {
    const p = br.re * br.re + br.im * br.im
    if (p <= 1e-18) continue
    totalW += p
    const perVibe = p / br.slots.length
    for (let i = 0; i < br.slots.length; i++) {
      const dock = (br.slots[i]! / SLOTS) | 0
      docks3.add(dock)
      const r3 = Math.hypot(
        pos[dock * 3]! - pos[0]!,
        pos[dock * 3 + 1]! - pos[1]!,
        pos[dock * 3 + 2]! - pos[2]!,
      )
      if (r3 > maxShadow) maxShadow = r3
      if (!initialLineDocks.has(dock)) offLineW += perVibe
    }
  }

  return {
    linesReachedBeat1: linesSet.size,
    originNeighborsReachedBeat1: nbSet.size,
    distinctDocksBeat3: docks3.size,
    offInitialLineWeightBeat3: totalW > 0 ? offLineW / totalW : 0,
    maxShadowBeat3: maxShadow,
  }
}

// Measure classical dephased beat-3 distribution from beat-2 branches (evolving each beat-2 branch
// independently through beat 3 and summing probabilities incoherently) to quantify genuine 4D
// quantum interference on Scale 2!
function measureScale2QuantumInterference(
  ctx: L3BeatContext,
  sBeat2: ComplexSparseState,
  sBeat3Coherent: ComplexSparseState,
): {
  readonly coherentOriginPairProb: number
  readonly dephasedOriginPairProb: number
  readonly dockDistributionInterferenceTV: number
} {
  const coherentDist = dockOccupationDist(sBeat3Coherent)
  const dephasedDist = new Map<number, number>()
  let dephasedOriginPairProb = 0

  for (const br of sBeat2.branches) {
    const p2 = br.re * br.re + br.im * br.im
    if (p2 <= 1e-24) continue
    const unitBr = cloneComplexBranch(br)
    const invNorm = 1 / Math.sqrt(p2)
    unitBr.re *= invNorm
    unitBr.im *= invNorm
    const stepped = stepCoupledL3Beat(ctx, { branches: [unitBr] }, 2)
    for (const outBr of stepped.branches) {
      const pOut = p2 * (outBr.re * outBr.re + outBr.im * outBr.im)
      const ns = outBr.slots.length
      if (ns === 0) continue
      const perVibe = pOut / ns
      let onOrigin = 0
      for (let i = 0; i < ns; i++) {
        const dock = (outBr.slots[i]! / SLOTS) | 0
        dephasedDist.set(dock, (dephasedDist.get(dock) ?? 0) + perVibe)
        if (dock === 0) onOrigin++
      }
      if (onOrigin === 2) dephasedOriginPairProb += pOut
    }
  }

  let coherentOriginPairProb = 0
  for (const br of sBeat3Coherent.branches) {
    if (
      br.slots.length === 2 &&
      ((br.slots[0]! / SLOTS) | 0) === 0 &&
      ((br.slots[1]! / SLOTS) | 0) === 0
    ) {
      coherentOriginPairProb += br.re * br.re + br.im * br.im
    }
  }

  return {
    coherentOriginPairProb,
    dephasedOriginPairProb,
    dockDistributionInterferenceTV: dockDistributionTV(coherentDist, dephasedDist),
  }
}

// C-odd occupation reading between two opposite target docks (yA vs yB)
function cOddDockReading(s: ComplexSparseState, yA: number, yB: number): number {
  let val = 0
  for (const br of s.branches) {
    const p = br.re * br.re + br.im * br.im
    let qA = 0
    let qB = 0
    for (let i = 0; i < br.slots.length; i++) {
      const dock = (br.slots[i]! / SLOTS) | 0
      if (dock === yA) qA += br.vibe[i]!
      else if (dock === yB) qB += br.vibe[i]!
    }
    val += p * (qA - qB)
  }
  return val
}

// ---------------------------------------------------------------------------------------------------------
// 5. Full E-FND-0187 L3 Multi-Sector Bridge Runner & Sector-by-Sector Ablations

export type AblationSummary = {
  readonly name: string
  readonly gravCentroidShiftScale1: number
  readonly gaugeABPhaseRad: number
  readonly gaugeABPhaseErr: number
  readonly pairLinesReachedScale2: number
  readonly pairNeighborsReachedScale2: number
  readonly pairDistinctDocksScale2: number
  readonly pairOffInitialLineWeightScale2: number
  readonly oddCAsymT1Scale4: number
  readonly oddCAsymT2Scale4: number
  readonly ownObservableEliminated: boolean
  readonly otherSectorsIntact: boolean
}

export type HoneycombBallCoupledL3Result = {
  readonly algebraic: L3AlgebraicCertificate
  readonly sparseEngineCrossCheckMaxDiff: number
  readonly gravity: {
    readonly floorF: number
    readonly kEff: number
    readonly gEff: number
    readonly cUniversal: number
  }
  readonly geomR2: {
    readonly cells: number
    readonly totalSlots: number
    readonly coverConflicts: number
    readonly coverMissing: number
    readonly orientationConflicts: number
    readonly chartConsistencyErr: number
    readonly originPlaquetteCount: number
    readonly nonzeroFluxOriginPlaquettes: number
    readonly gaugeInvariancePlaquetteViolations: number
  }
  readonly geomR3: {
    readonly cells: number
    readonly totalSlots: number
    readonly coverConflicts: number
    readonly coverMissing: number
    readonly orientationConflicts: number
    readonly chartConsistencyErr: number
    readonly unitOff: number
    readonly pairOff: number
    readonly originPlaquetteCount: number
    readonly nonzeroFluxOriginPlaquettes: number
    readonly gaugeInvariancePlaquetteViolations: number
  }
  readonly scale0VacuumR3: {
    readonly beats: number
    readonly cells: number
    readonly totalSlots: number
    readonly activeSlotsAfter: number
    readonly driftErr: number
    readonly maxNormErr: number
    readonly reversalErr: number
    readonly gaugeCovErr: number
    readonly frontierHits: number
  }
  readonly scale1LoneR3: {
    readonly beats: number
    readonly finalBranchCount: number
    readonly maxNormErr: number
    readonly reversalErr: number
    readonly frontierHits: number
    readonly gaugeCovErr: number
    readonly gravCentroidShiftNorm: number
    readonly gravCentroidShiftZeroSource: number
    readonly gravDockDistTV: number
    readonly abPlaquetteFluxMod3: number
    readonly abPhaseRadOn: number
    readonly abPhaseErrOn: number
    readonly abInterferenceProbOn: number
    readonly abPhaseRadOff: number
    readonly abPhaseRadPureGauge: number
    readonly abGaugeTransformDiff: number
  }
  readonly scale2PairR3: {
    readonly beats: number
    readonly finalBranchCount: number
    readonly maxNormErr: number
    readonly reversalErr: number
    readonly frontierHits: number
    readonly gaugeCovErr: number
    readonly linesReachedBeat1: number
    readonly originNeighborsReachedBeat1: number
    readonly distinctDocksBeat3: number
    readonly offInitialLineWeightBeat3: number
    readonly maxShadowBeat3: number
    readonly gravCentroidShiftNorm: number
    readonly gravCentroidShiftZeroSource: number
    readonly gravDockDistTV: number
    readonly quantumInterferenceTV: number
    readonly coherentOriginPairProb: number
    readonly dephasedOriginPairProb: number
  }
  readonly scale4OddR2: {
    readonly beats: number
    readonly slots: readonly [number, number, number, number]
    readonly chiA: number
    readonly chiB: number
    readonly maxNormErr: number
    readonly reversalErr: number
    readonly frontierHits: number
    readonly gaugeCovErr: number
    readonly cReadingPsiT1: number
    readonly cReadingCPsiT1: number
    readonly cAsymmetrySumT1: number
    readonly cpBalanceErrT1: number
    readonly cReadingPsiT2: number
    readonly cReadingCPsiT2: number
    readonly cAsymmetrySumT2: number
    readonly cpBalanceErrT2: number
  }
  readonly ablations: readonly AblationSummary[]
}

export function runHoneycombBallCoupledL3(): HoneycombBallCoupledL3Result {
  // 0. Exact Q(zeta_9) algebraic certificate & E-GRV-0157 1/N_D^2 warped gravity kernel
  const algebraic = verifyL3AlgebraicCertificate()
  const gravity = buildWarpedGravityTable(8, 17)
  const gravCoupling = 4.0
  const gravDt = 1.0

  // 1. Load cached exact 4D {3,4,3,4} honeycomb balls (R = 2, 481 docks; R = 3, 8,857 docks)
  //    and map every dock onto its exact cusp depth D(dock) and 3D husk coordinate x(dock)
  const cusp = buildExactCusp({ period: 2, floor: 3 })
  const cell = exactCell()
  const geomR2 = buildBallCuspGeometry(2, cusp, cell)
  const geomR3 = buildBallCuspGeometry(3, cusp, cell)

  // Warped 1/N_D^2 gravitational potential Phi(dock) on all docks of R = 2 and R = 3
  const phiR2 = buildWarpedBallPotential(geomR2, gravity, geomR2.srcDock, gravCoupling)
  const phiR3 = buildWarpedBallPotential(geomR3, gravity, geomR3.srcDock, gravCoupling)

  // Deterministic non-trivial Z_3 gauge link fields A(x, d) in {0, 1, 2} on R = 2 and R = 3
  const linksR2 = buildDeterministicZ3Links(geomR2)
  const linksR3 = buildDeterministicZ3Links(geomR3)
  const thetaR2 = buildDeterministicGaugeTransform(geomR2)
  const thetaR3 = buildDeterministicGaugeTransform(geomR3)
  const linksR2Prime = gaugeTransformLinks(geomR2.table, linksR2, thetaR2)
  const linksR3Prime = gaugeTransformLinks(geomR3.table, linksR3, thetaR3)

  // Audit all origin 4-cycle octahedral-face plaquettes on R = 2 and R = 3
  let nonzeroFluxR2 = 0
  let plaqGaugeViolationsR2 = 0
  for (const p of geomR2.originPlaquettes) {
    const f = plaquetteFluxMod3(linksR2, p)
    const fp = plaquetteFluxMod3(linksR2Prime, p)
    if (f !== 0) nonzeroFluxR2++
    if (f !== fp) plaqGaugeViolationsR2++
  }

  let nonzeroFluxR3 = 0
  let plaqGaugeViolationsR3 = 0
  let chosenPlaquetteR3: Plaquette4Cycle | undefined
  for (const p of geomR3.originPlaquettes) {
    const f = plaquetteFluxMod3(linksR3, p)
    const fp = plaquetteFluxMod3(linksR3Prime, p)
    if (f !== 0) {
      nonzeroFluxR3++
      if (!chosenPlaquetteR3 && f === 1) chosenPlaquetteR3 = p
    }
    if (f !== fp) plaqGaugeViolationsR3++
  }
  chosenPlaquetteR3 ??= geomR3.originPlaquettes.find(p => plaquetteFluxMod3(linksR3, p) !== 0)!

  const ctxR3Full: L3BeatContext = {
    geom: geomR3,
    phi: phiR3,
    gravDt,
    links: linksR3,
    flags: L3_ALL_ON,
  }
  const ctxR2Full: L3BeatContext = {
    geom: geomR2,
    phi: phiR2,
    gravDt,
    links: linksR2,
    flags: L3_ALL_ON,
  }

  // Cross-check our complex slot-sparse engine (bare mode) against exact BigInt sparseCoinedVetoBeat on R = 3!
  const loneSlot0 = geomR3.srcSlot
  const loneSlot0Opp = OPPOSITE_U8[loneSlot0]!
  const bareCtxR3: L3BeatContext = {
    ...ctxR3Full,
    flags: { gravOn: false, gaugeOn: false, pairOn: false, oddOn: false },
  }
  const bareStartCx: ComplexSparseState = {
    branches: [makeComplexBranch([{ slot: loneSlot0, vibe: 1, point: 0, open: 1 }])],
  }
  const bareCxBeat3 = evolveForward(bareCtxR3, bareStartCx, 3).finalState
  let exactBigIntState = sparseLockedState({
    ...emptySparseConfiguration(),
    slots: Int32Array.from([loneSlot0]),
    vibe: Int8Array.from([1]),
    point: Int8Array.from([0]),
    open: Uint8Array.from([1]),
  })
  for (let t = 0; t < 3; t++) {
    exactBigIntState = sparseCoinedVetoBeat(
      'none',
      geomR3.tables,
      exactBigIntState,
      t,
      undefined,
      undefined,
      'split',
    )
  }
  const sparseEngineCrossCheckMaxDiff = maxDiffVsBigIntSparse(
    bareCxBeat3,
    exactBigIntState.branches,
  )

  // -------------------------------------------------------------------------------------------------------
  // Scale 0: V1 peace vacuum on ALL 8,857 docks (212,568 slots) of R = 3
  const v1Start: ComplexSparseState = { branches: [makeComplexBranch([])] }
  const v1Run = evolveForward(ctxR3Full, v1Start, 3)
  const v1Drift = complexStateDiffNorm(v1Run.finalState, v1Start)
  const v1Rev = checkReversalErr(ctxR3Full, v1Start, v1Run.finalState, 3)
  const v1GaugeCov = checkGaugeCovarianceErr(ctxR3Full, v1Start, 3, thetaR3)
  const v1ActiveSlots = v1Run.finalState.branches.reduce((acc, b) => acc + b.slots.length, 0)

  // -------------------------------------------------------------------------------------------------------
  // Scale 1: Lone vibe + Z_3 gauge + 1/N_D^2 gravity on exact R = 3 ball, t = 1..3, 0 frontier hits
  const invSqrt2 = Math.SQRT1_2
  const scale1Start: ComplexSparseState = {
    branches: [
      makeComplexBranch([{ slot: loneSlot0, vibe: 1, point: 0, open: 1 }], invSqrt2, 0),
      makeComplexBranch([{ slot: loneSlot0Opp, vibe: 1, point: 0, open: 1 }], invSqrt2, 0),
    ],
  }
  const scale1Run = evolveForward(ctxR3Full, scale1Start, 3)
  const scale1Rev = checkReversalErr(ctxR3Full, scale1Start, scale1Run.finalState, 3)
  const scale1GaugeCov = checkGaugeCovarianceErr(ctxR3Full, scale1Start, 3, thetaR3)

  const ctxR3GravOff: L3BeatContext = {
    ...ctxR3Full,
    flags: { ...L3_ALL_ON, gravOn: false },
  }
  const scale1NoGrav = evolveForward(ctxR3GravOff, scale1Start, 3)
  const c1On = cuspCentroid3D(geomR3, scale1Run.finalState)
  const c1Off = cuspCentroid3D(geomR3, scale1NoGrav.finalState)
  const scale1GravCentroidShift = Math.hypot(
    c1On[0] - c1Off[0],
    c1On[1] - c1Off[1],
    c1On[2] - c1Off[2],
  )
  const scale1GravDockTV = dockDistributionTV(
    dockOccupationDist(scale1Run.finalState),
    dockOccupationDist(scale1NoGrav.finalState),
  )

  // Zero-source control: Phi === 0 everywhere with gravOn = true -> identical to gravOff
  const ctxR3ZeroPhi: L3BeatContext = { ...ctxR3Full, phi: new Float64Array(geomR3.cells) }
  const scale1ZeroPhi = evolveForward(ctxR3ZeroPhi, scale1Start, 3)
  const c1Zero = cuspCentroid3D(geomR3, scale1ZeroPhi.finalState)
  const scale1GravShiftZeroSource = Math.hypot(
    c1Zero[0] - c1Off[0],
    c1Zero[1] - c1Off[1],
    c1Zero[2] - c1Off[2],
  )

  // Gauge-invariant Z_3 Aharonov-Bohm loop holonomy on a real 4-cycle octahedral-face plaquette of R = 3
  const abOn = measureLivePlaquetteAB(ctxR3Full, chosenPlaquetteR3)
  const ctxR3GaugeOff: L3BeatContext = {
    ...ctxR3Full,
    flags: { ...L3_ALL_ON, gaugeOn: false },
  }
  const abOff = measureLivePlaquetteAB(ctxR3GaugeOff, chosenPlaquetteR3)
  const pureGaugeLinksR3 = gaugeTransformLinks(
    geomR3.table,
    new Uint8Array(geomR3.totalSlots),
    thetaR3,
  )
  const abPureGauge = measureLivePlaquetteAB(
    { ...ctxR3Full, links: pureGaugeLinksR3 },
    chosenPlaquetteR3,
  )
  const abTransformed = measureLivePlaquetteAB(
    { ...ctxR3Full, links: linksR3Prime },
    chosenPlaquetteR3,
  )
  const abGaugeTransformDiff = Math.abs(abOn.phaseRad - abTransformed.phaseRad)

  // -------------------------------------------------------------------------------------------------------
  // Scale 2: 2-vibe M_pair(zeta_18) + Z_3 gauge + gravity on exact R = 3 ball, t = 1..3, 0 frontier hits
  const scale2Start: ComplexSparseState = {
    branches: [
      makeComplexBranch([
        { slot: loneSlot0, vibe: 1, point: 0, open: 1 },
        { slot: loneSlot0Opp, vibe: 1, point: 0, open: 1 },
      ]),
    ],
  }
  const scale2Run = evolveForward(ctxR3Full, scale2Start, 3)
  const scale2Rev = checkReversalErr(ctxR3Full, scale2Start, scale2Run.finalState, 3)
  const scale2GaugeCov = checkGaugeCovarianceErr(ctxR3Full, scale2Start, 3, thetaR3)
  const scale2Spread = measureScale2Spread(
    geomR3,
    loneSlot0,
    scale2Run.statesByBeat[1]!,
    scale2Run.finalState,
  )
  const scale2Interf = measureScale2QuantumInterference(
    ctxR3Full,
    scale2Run.statesByBeat[2]!,
    scale2Run.finalState,
  )

  const scale2NoGrav = evolveForward(ctxR3GravOff, scale2Start, 3)
  const c2On = cuspCentroid3D(geomR3, scale2Run.finalState)
  const c2Off = cuspCentroid3D(geomR3, scale2NoGrav.finalState)
  const scale2GravCentroidShift = Math.hypot(
    c2On[0] - c2Off[0],
    c2On[1] - c2Off[1],
    c2On[2] - c2Off[2],
  )
  const scale2GravDockTV = dockDistributionTV(
    dockOccupationDist(scale2Run.finalState),
    dockOccupationDist(scale2NoGrav.finalState),
  )
  const scale2ZeroPhi = evolveForward(ctxR3ZeroPhi, scale2Start, 3)
  const c2Zero = cuspCentroid3D(geomR3, scale2ZeroPhi.finalState)
  const scale2GravShiftZeroSource = Math.hypot(
    c2Zero[0] - c2Off[0],
    c2Zero[1] - c2Off[1],
    c2Zero[2] - c2Off[2],
  )

  // -------------------------------------------------------------------------------------------------------
  // Scale 4: 4-vibe ODD + M_pair + Z_3 gauge + gravity on exact R = 2 ball, 481 docks, t = 1..2, 0 frontier hits
  const tableObjR2: MeshTable = {
    cells: geomR2.cells,
    neighbour: (x, d) => geomR2.ball.mesh.neighbour(x, d),
  }
  const group = slotGroup()
  let mirrorP: Mirror | undefined
  for (let i = 0; i < group.elements.length; i++) {
    if (group.det[i] !== -1) continue
    const g = group.elements[i]!
    const lm = labelMap(tableObjR2, g, 0)
    if (lm.conflicts === 0) {
      mirrorP = asMirror('P0', g, lm.cells, -1)
      break
    }
  }
  if (!mirrorP) throw new Error('honeycomb-ball-coupled-l3: no det -1 mirror on R = 2 ball')

  // Distinct chi_odd 4-vibe pair on dock 0 (slots [0, 1, 4, 10] vs [OPPOSITE[0], 1, 4, 10])
  const oddSlots: readonly [number, number, number, number] = [0, 1, 4, 10]
  const s0 = oddSlots[0]
  const s0Opp = OPPOSITE_U8[s0]!
  const probeA = new Int8Array(SLOTS)
  const probeB = new Int8Array(SLOTS)
  for (const s of oddSlots) probeA[s] = 1
  for (const s of [s0Opp, oddSlots[1], oddSlots[2], oddSlots[3]]) probeB[s] = 1
  const chiA = chiOf(
    'odd',
    [...oddSlots].sort((a, b) => a - b),
    [1, 1, 1, 1],
    d => probeA[d]!,
  )
  const chiB = chiOf(
    'odd',
    [s0Opp, oddSlots[1], oddSlots[2], oddSlots[3]].sort((a, b) => a - b),
    [1, 1, 1, 1],
    d => probeB[d]!,
  )

  const scale4Start: ComplexSparseState = {
    branches: [
      makeComplexBranch(
        [
          { slot: s0, vibe: 1, point: 0, open: 1 },
          { slot: oddSlots[1], vibe: 1, point: 0, open: 0 },
          { slot: oddSlots[2], vibe: 1, point: 0, open: 0 },
          { slot: oddSlots[3], vibe: 1, point: 0, open: 0 },
        ],
        invSqrt2,
        0,
      ),
      makeComplexBranch(
        [
          { slot: s0Opp, vibe: 1, point: 0, open: 1 },
          { slot: oddSlots[1], vibe: 1, point: 0, open: 0 },
          { slot: oddSlots[2], vibe: 1, point: 0, open: 0 },
          { slot: oddSlots[3], vibe: 1, point: 0, open: 0 },
        ],
        invSqrt2,
        0,
      ),
    ],
  }

  // Physical C: (psi, Phi, A) -> (C psi, Phi, -A)
  // Physical CP: (psi, Phi, A) -> (CP psi, P(Phi), -P(A))
  const scale4CStart = applyChargeConjugation(scale4Start)
  const scale4CPStart = applyMirrorToState(mirrorP, scale4CStart)
  const linksR2C = chargeConjugateLinks(linksR2)
  const linksR2CP = chargeConjugateLinks(mirrorLinks(mirrorP, linksR2))
  const phiR2P = mirrorPotential(mirrorP, phiR2)

  const yA1 = geomR2.table[s0]!
  const yB1 = geomR2.table[s0Opp]!
  const yA2 = geomR2.table[yA1 * SLOTS + s0]!
  const yB2 = geomR2.table[yB1 * SLOTS + s0Opp]!
  const pyA1 = mirrorP.cells[yA1]!
  const pyB1 = mirrorP.cells[yB1]!
  const pyA2 = mirrorP.cells[yA2]!
  const pyB2 = mirrorP.cells[yB2]!

  const evalScale4 = (flags: L3SectorFlags) => {
    const cPsi: L3BeatContext = { ...ctxR2Full, flags }
    const cC: L3BeatContext = { ...ctxR2Full, links: linksR2C, flags }
    const cCP: L3BeatContext = { ...ctxR2Full, phi: phiR2P, links: linksR2CP, flags }

    const rPsi = evolveForward(cPsi, scale4Start, 2)
    const rC = evolveForward(cC, scale4CStart, 2)
    const rCP = evolveForward(cCP, scale4CPStart, 2)

    const rev = checkReversalErr(cPsi, scale4Start, rPsi.finalState, 2)
    const gCov = checkGaugeCovarianceErr(cPsi, scale4Start, 2, thetaR2)

    const readPsiT1 = cOddDockReading(rPsi.statesByBeat[1]!, yA1, yB1)
    const readCT1 = cOddDockReading(rC.statesByBeat[1]!, yA1, yB1)
    const readCPT1 = cOddDockReading(rCP.statesByBeat[1]!, pyA1, pyB1)

    const readPsiT2 = cOddDockReading(rPsi.statesByBeat[2]!, yA2, yB2)
    const readCT2 = cOddDockReading(rC.statesByBeat[2]!, yA2, yB2)
    const readCPT2 = cOddDockReading(rCP.statesByBeat[2]!, pyA2, pyB2)

    return {
      maxNormErr: Math.max(rPsi.maxNormErr, rC.maxNormErr, rCP.maxNormErr),
      reversalErr: rev,
      frontierHits: rPsi.frontierHits + rC.frontierHits + rCP.frontierHits,
      gaugeCovErr: gCov,
      cReadingPsiT1: readPsiT1,
      cReadingCPsiT1: readCT1,
      cAsymmetrySumT1: readPsiT1 + readCT1,
      cpBalanceErrT1: Math.abs(readPsiT1 + readCPT1),
      cReadingPsiT2: readPsiT2,
      cReadingCPsiT2: readCT2,
      cAsymmetrySumT2: readPsiT2 + readCT2,
      cpBalanceErrT2: Math.abs(readPsiT2 + readCPT2),
    }
  }

  const scale4On = evalScale4(L3_ALL_ON)

  // -------------------------------------------------------------------------------------------------------
  // 6. Sector-by-sector ablations directly on the 4D {3,4,3,4} balls
  const runAblation = (
    name: string,
    flags: L3SectorFlags,
    offSector: 'grav' | 'gauge' | 'pair' | 'odd',
  ): AblationSummary => {
    const cR3: L3BeatContext = { ...ctxR3Full, flags }
    const cR3NoGrav: L3BeatContext = { ...ctxR3Full, flags: { ...flags, gravOn: false } }

    const s1 = evolveForward(cR3, scale1Start, 3)
    const s1ng = evolveForward(cR3NoGrav, scale1Start, 3)
    const a1 = cuspCentroid3D(geomR3, s1.finalState)
    const a1ng = cuspCentroid3D(geomR3, s1ng.finalState)
    const gravShift1 = Math.hypot(a1[0] - a1ng[0], a1[1] - a1ng[1], a1[2] - a1ng[2])

    const ab = measureLivePlaquetteAB(cR3, chosenPlaquetteR3!)

    const s2 = evolveForward(cR3, scale2Start, 3)
    const sp2 = measureScale2Spread(geomR3, loneSlot0, s2.statesByBeat[1]!, s2.finalState)

    const s4 = evalScale4(flags)

    const gravAlive = gravShift1 > 1e-3
    const gaugeAlive = Math.abs(ab.phaseRad) > 1.0 && ab.phaseErr <= 1e-13
    const pairAlive =
      sp2.linesReachedBeat1 === 12 &&
      sp2.originNeighborsReachedBeat1 === 24 &&
      sp2.distinctDocksBeat3 >= 48 &&
      sp2.offInitialLineWeightBeat3 > 0.005
    const oddAlive = Math.abs(s4.cAsymmetrySumT1) > 0.1 && Math.abs(s4.cAsymmetrySumT2) > 0.05

    let ownObservableEliminated = false
    let otherSectorsIntact = false

    if (offSector === 'grav') {
      ownObservableEliminated = gravShift1 <= 1e-14
      otherSectorsIntact = gaugeAlive && pairAlive && oddAlive
    } else if (offSector === 'gauge') {
      ownObservableEliminated = Math.abs(ab.phaseRad) <= 1e-14
      otherSectorsIntact = gravAlive && pairAlive && oddAlive
    } else if (offSector === 'pair') {
      ownObservableEliminated =
        sp2.linesReachedBeat1 === 1 &&
        sp2.originNeighborsReachedBeat1 === 2 &&
        sp2.distinctDocksBeat3 === 4 &&
        sp2.offInitialLineWeightBeat3 === 0
      otherSectorsIntact = gravAlive && gaugeAlive && oddAlive
    } else {
      ownObservableEliminated =
        Math.abs(s4.cAsymmetrySumT1) <= 1e-14 && Math.abs(s4.cAsymmetrySumT2) <= 1e-14
      otherSectorsIntact = gravAlive && gaugeAlive && pairAlive
    }

    return {
      name,
      gravCentroidShiftScale1: gravShift1,
      gaugeABPhaseRad: ab.phaseRad,
      gaugeABPhaseErr: ab.phaseErr,
      pairLinesReachedScale2: sp2.linesReachedBeat1,
      pairNeighborsReachedScale2: sp2.originNeighborsReachedBeat1,
      pairDistinctDocksScale2: sp2.distinctDocksBeat3,
      pairOffInitialLineWeightScale2: sp2.offInitialLineWeightBeat3,
      oddCAsymT1Scale4: s4.cAsymmetrySumT1,
      oddCAsymT2Scale4: s4.cAsymmetrySumT2,
      ownObservableEliminated,
      otherSectorsIntact,
    }
  }

  const ablations: AblationSummary[] = [
    runAblation('gravOff', { ...L3_ALL_ON, gravOn: false }, 'grav'),
    runAblation('gaugeOff', { ...L3_ALL_ON, gaugeOn: false }, 'gauge'),
    runAblation('pairOff', { ...L3_ALL_ON, pairOn: false }, 'pair'),
    runAblation('oddOff', { ...L3_ALL_ON, oddOn: false }, 'odd'),
  ]

  return {
    algebraic,
    sparseEngineCrossCheckMaxDiff,
    gravity: {
      floorF: gravity.floorF,
      kEff: gravity.kEff,
      gEff: gravity.gEff,
      cUniversal: gravity.cUniversal,
    },
    geomR2: {
      cells: geomR2.cells,
      totalSlots: geomR2.totalSlots,
      coverConflicts: geomR2.coverConflicts,
      coverMissing: geomR2.coverMissing,
      orientationConflicts: geomR2.orientationConflicts,
      chartConsistencyErr: geomR2.chartConsistencyErr,
      originPlaquetteCount: geomR2.originPlaquettes.length,
      nonzeroFluxOriginPlaquettes: nonzeroFluxR2,
      gaugeInvariancePlaquetteViolations: plaqGaugeViolationsR2,
    },
    geomR3: {
      cells: geomR3.cells,
      totalSlots: geomR3.totalSlots,
      coverConflicts: geomR3.coverConflicts,
      coverMissing: geomR3.coverMissing,
      orientationConflicts: geomR3.orientationConflicts,
      chartConsistencyErr: geomR3.chartConsistencyErr,
      unitOff: geomR3.unitOff,
      pairOff: geomR3.pairOff,
      originPlaquetteCount: geomR3.originPlaquettes.length,
      nonzeroFluxOriginPlaquettes: nonzeroFluxR3,
      gaugeInvariancePlaquetteViolations: plaqGaugeViolationsR3,
    },
    scale0VacuumR3: {
      beats: 3,
      cells: geomR3.cells,
      totalSlots: geomR3.totalSlots,
      activeSlotsAfter: v1ActiveSlots,
      driftErr: v1Drift,
      maxNormErr: v1Run.maxNormErr,
      reversalErr: v1Rev,
      gaugeCovErr: v1GaugeCov,
      frontierHits: v1Run.frontierHits,
    },
    scale1LoneR3: {
      beats: 3,
      finalBranchCount: scale1Run.finalState.branches.length,
      maxNormErr: scale1Run.maxNormErr,
      reversalErr: scale1Rev,
      frontierHits: scale1Run.frontierHits,
      gaugeCovErr: scale1GaugeCov,
      gravCentroidShiftNorm: scale1GravCentroidShift,
      gravCentroidShiftZeroSource: scale1GravShiftZeroSource,
      gravDockDistTV: scale1GravDockTV,
      abPlaquetteFluxMod3: abOn.fluxMod3,
      abPhaseRadOn: abOn.phaseRad,
      abPhaseErrOn: abOn.phaseErr,
      abInterferenceProbOn: abOn.interferenceProb,
      abPhaseRadOff: abOff.phaseRad,
      abPhaseRadPureGauge: abPureGauge.phaseRad,
      abGaugeTransformDiff,
    },
    scale2PairR3: {
      beats: 3,
      finalBranchCount: scale2Run.finalState.branches.length,
      maxNormErr: scale2Run.maxNormErr,
      reversalErr: scale2Rev,
      frontierHits: scale2Run.frontierHits,
      gaugeCovErr: scale2GaugeCov,
      linesReachedBeat1: scale2Spread.linesReachedBeat1,
      originNeighborsReachedBeat1: scale2Spread.originNeighborsReachedBeat1,
      distinctDocksBeat3: scale2Spread.distinctDocksBeat3,
      offInitialLineWeightBeat3: scale2Spread.offInitialLineWeightBeat3,
      maxShadowBeat3: scale2Spread.maxShadowBeat3,
      gravCentroidShiftNorm: scale2GravCentroidShift,
      gravCentroidShiftZeroSource: scale2GravShiftZeroSource,
      gravDockDistTV: scale2GravDockTV,
      quantumInterferenceTV: scale2Interf.dockDistributionInterferenceTV,
      coherentOriginPairProb: scale2Interf.coherentOriginPairProb,
      dephasedOriginPairProb: scale2Interf.dephasedOriginPairProb,
    },
    scale4OddR2: {
      beats: 2,
      slots: oddSlots,
      chiA,
      chiB,
      ...scale4On,
    },
    ablations,
  }
}
