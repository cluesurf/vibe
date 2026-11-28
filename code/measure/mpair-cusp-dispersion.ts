// 3D CUSP-HUSK DISPERSION, GROUP SPEED, AND ISOTROPY UNDER M_pair VS BARE LINE LAW
// (E-RLT-0123).
//
// Measures exact 3D cusp-husk motion and Bloch dispersion of an interacting two-love pair under the
// W(F4)-isotropic Pair-Line Mixer M_pair(u) at u = -1 (exact Z[w][1/6]) and u = zeta_18 = e^{i pi/9}
// (exact Z[zeta_9][1/6]) against the bare working-rule line-law control (u = 1):
//
//   1. Exact horospherical cusp projection of the cached R = 3 {3,4,3,4} ball (8,857 docks) onto 3D
//      cusp coordinates (z0, z1, z2) using exactCell() and cuspTranslations() from exact-cusp.ts.
//   2. Real-space R = 3 ball evolution (t = 1..3 beats, split-coin working beat, verified against
//      exact Z[w][1/6] slot-sparse engine sparse-locked-knit):
//      - Bare lone love (24 slots) and bare full-line pair (12 origin lines + 6 layer-neighbor lines):
//        strictly confined to 1D geodesic lines (maxShadow <= sqrt(2), W_off(t) = 0).
//      - M_pair(-1) and M_pair(zeta_18):
//        * Origin full-line pair (0 frontier hits for t = 1..3): exact unitarity, 3D husk MSD(t),
//          2nd & 4th angular moment isotropy (I_2, S_4, I_4 vs pure cubic control), causal speed
//          bound v_max <= 1 dock/beat.
//        * Layer-neighbor full-line pair (starting on x_a = n(0, a) along line l(a) through dock 0):
//          breaks the sqrt(2) line-law barrier at beat 1 (W_off(t) > 0, maxShadow >= 2.0 > sqrt(2))
//          while bare stays identically at W_off = 0.
//   3. Exact 24-state 3D cusp-husk Bloch operator U(k; u) on the infinite floor-0 {3,4,3,4} cusp
//      layer (12 same-dock full-line states + 12 edge states across the 3 positive cubic edges):
//      - Closed and exact unitary (||U^dag U - I|| <= 1e-13) with ZERO truncation; cross-checked
//        directly against real-space sparse-locked-knit on buildExactCusp({ period: 4, floor: 0 }).
//      - Bare (u = 1): every band E_n(k) is completely flat (bandwidth 0, v_g = 0 identically).
//      - M_pair(-1) and M_pair(zeta_18): genuine 3D dispersive bands along (1,0,0), (1,1,0), (1,1,1)
//        with exact small-k leading isotropy, finite O(k^4) cubic anisotropy (compared against a
//        cubic tight-binding control), and strict causal group-speed bound max |v_g| <= 1 dock/beat.
//
// NOTHING MOVES: pure deterministic linear algebra and exact sparse state evolution. Zero Math.random.

import {
  exactCell,
  matrixVector,
  twiceForm,
  type ExactCell,
  type ExactMatrix,
  type ExactVector,
} from '@/code/substrate/coxeter/exact-3434'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import {
  buildExactCusp,
  CUSP_VERTEX,
  cuspTranslations,
  type CuspTranslations,
} from '@/code/substrate/coxeter/exact-cusp'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  currentCoinPlace,
  LINE_SECONDS,
  setCoinPlace,
} from '@/code/rule/coined-locked-knit'
import { BOUNCE_TABLE, bouncePermutation } from '@/code/rule/bounce-pair-knit'
import { pairLineScatterAmps } from '@/code/rule/pair-line-mixer'
import {
  sparseCoinedVetoBeat,
  sparseLockedNorm,
  sparsePairLineMixStateNormalized,
  sparseTablesFromMesh,
  type SparseLockedBranch,
  type SparseLockedState,
} from '@/code/rule/sparse-locked-knit'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'

const SLOTS = 24
const LINES = 12
const SQRT3 = Math.sqrt(3)
const OFF_LINE = Math.SQRT2 + 1e-9
const SUPPORT_TOL = 1e-14

// Complex constants in Z[w][1/2]: w = -1/2 + i sqrt(3)/2
const W_RE = -0.5
const W_IM = SQRT3 / 2
const W2_RE = -0.5
const W2_IM = -SQRT3 / 2
// Half-coin D: keep = (2 + w)/2, cross = -w/2, det = 1 + w
const D_KEEP_RE = 0.75
const D_KEEP_IM = SQRT3 / 4
const D_CROSS_RE = 0.25
const D_CROSS_IM = -SQRT3 / 4
const D_DET_RE = 0.5
const D_DET_IM = SQRT3 / 2
// Full coin C = D^2: keep = (1 + w)/2, cross = (1 - w)/2
const C_KEEP_RE = 0.25
const C_KEEP_IM = SQRT3 / 4
const C_CROSS_RE = 0.75
const C_CROSS_IM = -SQRT3 / 4

export type CuspChartR3 = {
  readonly cells: number
  readonly table: Int32Array
  readonly distance: Int32Array
  readonly pos: Float64Array
  readonly layer: Uint8Array
  readonly layerSlots: readonly number[]
  readonly bulkSlots: readonly number[]
  readonly axes: readonly {
    readonly slot: number
    readonly partner: number
    readonly twistPerm: readonly number[]
  }[]
  readonly unitOff: number
  readonly pairOff: number
  readonly chartConsistencyErr: number
  readonly translationGatesAll: boolean
}

export type RealSpaceBeatReading = {
  readonly beat: number
  readonly norm: number
  readonly normErr: number
  readonly wOff: number
  readonly msd: number
  readonly maxShadow: number
  readonly maxGraphDist: number
  readonly maxGraphSpeed: number
  readonly maxHuskSpeed: number
  readonly layerWeight: number
  readonly distinctDocks: number
  readonly frontierHits: number
  readonly i2Anisotropy: number
  readonly s4Moment: number
  readonly i4Anisotropy: number
}

export type RealSpaceSeries = {
  readonly name: string
  readonly theta: number
  readonly beats: readonly RealSpaceBeatReading[]
  readonly maxNormErr: number
  readonly maxWOff: number
  readonly maxShadow: number
  readonly maxGraphSpeed: number
}

export type BlochDirectionReading = {
  readonly name: string
  readonly unitDir: readonly [number, number, number]
  readonly bandE0: number
  readonly bandEAtSmallK: number
  readonly bandEAtMidK: number
  readonly quadraticCoeff: number
  readonly smallKGroupSpeed: number
  readonly midKGroupSpeed: number
  readonly maxGroupSpeed: number
  readonly bandwidth: number
}

export type BlochDispersionReading = {
  readonly name: string
  readonly theta: number
  readonly maxUnitaryErr: number
  readonly realSpaceCrossCheckErr: number
  readonly maxBandwidth: number
  readonly maxGroupSpeedAllDirs: number
  readonly directions: readonly BlochDirectionReading[]
  readonly tinyKCurvatureSpread: number
  readonly smallKCurvatureSpread: number
  readonly smallKAnisotropyOrder: number
  readonly smallKSpeedSpread: number
  readonly midKSpeedSpread: number
  readonly cubicControlMidKSpeedSpread: number
}

export type MpairCuspDispersionResult = {
  readonly chart: {
    readonly cells: number
    readonly layerSlotsCount: number
    readonly bulkSlotsCount: number
    readonly unitOff: number
    readonly pairOff: number
    readonly chartConsistencyErr: number
    readonly translationGatesAll: boolean
  }
  readonly sparseEngineCheck: {
    readonly bareMaxAmpDiff: number
    readonly mpairNeg1MaxAmpDiff: number
    readonly mpairNeg1BigIntNormExact: boolean
  }
  readonly bareLone: RealSpaceSeries
  readonly bareOriginPair: RealSpaceSeries
  readonly bareSingleLineOriginPair: RealSpaceSeries
  readonly mpairNeg1SingleLineOriginPair: RealSpaceSeries
  readonly mpairZeta18SingleLineOriginPair: RealSpaceSeries
  readonly mpairNeg1OriginPair: RealSpaceSeries
  readonly mpairZeta18OriginPair: RealSpaceSeries
  readonly bareLayerNeighborPair: RealSpaceSeries
  readonly mpairNeg1LayerNeighborPair: RealSpaceSeries
  readonly mpairZeta18LayerNeighborPair: RealSpaceSeries
  readonly cubicAxisS4Control: number
  readonly cubicAxisI4Control: number
  readonly blochBare: BlochDispersionReading
  readonly blochNeg1: BlochDispersionReading
  readonly blochZeta18: BlochDispersionReading
}

// ---- Exact geometry & fast R = 3 horospherical chart ----

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

function symmetricEigen3(m: number[][]): [number, number, number] {
  const p1 = m[0]![1]! ** 2 + m[0]![2]! ** 2 + m[1]![2]! ** 2
  const q = (m[0]![0]! + m[1]![1]! + m[2]![2]!) / 3

  if (p1 <= 1e-30) {
    return [m[0]![0]!, m[1]![1]!, m[2]![2]!].sort((a, b) => a - b) as [
      number,
      number,
      number,
    ]
  }

  const p2 =
    (m[0]![0]! - q) ** 2 +
    (m[1]![1]! - q) ** 2 +
    (m[2]![2]! - q) ** 2 +
    2 * p1
  const p = Math.sqrt(p2 / 6)
  const b = m.map((row, i) => row.map((v, j) => (v - (i === j ? q : 0)) / p))
  const detB =
    b[0]![0]! * (b[1]![1]! * b[2]![2]! - b[1]![2]! * b[2]![1]!) -
    b[0]![1]! * (b[1]![0]! * b[2]![2]! - b[1]![2]! * b[2]![0]!) +
    b[0]![2]! * (b[1]![0]! * b[2]![1]! - b[1]![1]! * b[2]![0]!)
  const r = Math.max(-1, Math.min(1, detB / 2))
  const phi = Math.acos(r) / 3
  const e1 = q + 2 * p * Math.cos(phi)
  const e3 = q + 2 * p * Math.cos(phi + (2 * Math.PI) / 3)

  return [e3, 3 * q - e1 - e3, e1]
}

// Compute the slot permutation of an element h in W(F4) = stab(cell.center).
function twistSlotPermutation(cell: ExactCell, h: ExactMatrix): number[] {
  const keyOf = (v: ExactVector): string => v.join(',')
  const byNormal = new Map<string, number>()

  for (let s = 0; s < SLOTS; s++) {
    byNormal.set(keyOf(cell.normals[cell.faceOfLabel[s]!]!), s)
  }

  const perm: number[] = new Array<number>(SLOTS)

  for (let s = 0; s < SLOTS; s++) {
    const img = matrixVector(h, cell.normals[cell.faceOfLabel[s]!]!)
    const hit = byNormal.get(keyOf(img))

    if (hit === undefined) {
      throw new Error(`mpair-cusp-dispersion: twist failed to map slot ${s}`)
    }

    perm[s] = hit
  }

  return perm
}

export function buildCuspChartR3(
  cell: ExactCell,
  translations: CuspTranslations,
): CuspChartR3 {
  const ball = exactBallMesh({ radius: 3 })
  const cells = ball.cells
  const table = ball.ball.table
  const distance = ball.ball.distance

  // Precompute float64 5x5 matrices for exact transports and Gram rows for horospherical chart
  const transportsF = cell.transports.map(exactMatrixToFloat)
  const c0F = exactVectorToFloat(cell.center)
  const unitVec = (i: number): ExactVector => {
    const v = new Array<bigint>(10).fill(0n)

    v[2 * i] = 1n

    return v
  }

  // Row vectors for 2B(c, v) and 2B(c, a_i) in float64
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
  const level0 = dot5(rowV, c0F)

  // BFS over ball.table to assign exact-to-1e-14 frames and check consistency on all edges
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
          chartConsistencyErr = Math.max(
            chartConsistencyErr,
            Math.abs(cy[i]! - ref[i]!),
          )
        }
      }
    }
  }

  const pos = new Float64Array(cells * 3)
  const layer = new Uint8Array(cells)

  for (let x = 0; x < cells; x++) {
    const c = centers[x]!
    const z = zOfFloat(c)
    const dz0 = z[0] - z0[0]
    const dz1 = z[1] - z0[1]
    const dz2 = z[2] - z0[2]

    for (let i = 0; i < 3; i++) {
      pos[x * 3 + i] =
        Sinv[i]![0]! * dz0 + Sinv[i]![1]! * dz1 + Sinv[i]![2]! * dz2
    }

    layer[x] = Math.abs(dot5(rowV, c) - level0) < 1e-9 ? 1 : 0
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
  const layerSlotSet = new Set(translations.layerSlots)
  const bulkSlots = Array.from({ length: SLOTS }, (_, s) => s).filter(
    s => !layerSlotSet.has(s),
  )
  const axes = translations.axes.map(ax => ({
    slot: ax.slot,
    partner: ax.partner,
    twistPerm: twistSlotPermutation(cell, ax.twist),
  }))

  return {
    cells,
    table,
    distance,
    pos,
    layer,
    layerSlots: [...translations.layerSlots],
    bulkSlots,
    axes,
    unitOff,
    pairOff,
    chartConsistencyErr,
    translationGatesAll: Object.values(translations.gates).every(Boolean),
  }
}

// ---- Fast exact complex Float64 sparse 1-love & 2-love engines (identical to split-coin working rule) ----

type LoneMap = Map<number, [number, number]>
type PairMap = Map<number, [number, number]>

function addAmp(map: Map<number, [number, number]>, key: number, re: number, im: number): void {
  if (Math.abs(re) < 1e-18 && Math.abs(im) < 1e-18) return

  const prev = map.get(key)

  if (prev) {
    prev[0] += re
    prev[1] += im
  } else {
    map.set(key, [re, im])
  }
}

function pruneMap(map: Map<number, [number, number]>): Map<number, [number, number]> {
  const out = new Map<number, [number, number]>()

  for (const [k, v] of map) {
    if (v[0] * v[0] + v[1] * v[1] > 1e-34) {
      out.set(k, v)
    }
  }

  return out
}

// Stream target for global slot idx = dock * 24 + d (reflecting at frontier -1, matching lockedTables).
function streamSlot(
  table: Int32Array,
  slotIdx: number,
  hits: { frontier: number },
): number {
  const dock = Math.floor(slotIdx / SLOTS)
  const d = slotIdx - dock * SLOTS
  const nb = table[dock * SLOTS + d]!

  if (nb < 0) {
    hits.frontier++

    return dock * SLOTS + OPPOSITE[d]!
  }

  return nb * SLOTS + d
}

// Exact 1-love split-coin working beat (identical to bare sparseCoinedVetoBeat('none', 'pass') with split coin)
function stepLoneSplit(
  table: Int32Array,
  state: LoneMap,
  hits: { frontier: number },
): LoneMap {
  const next: LoneMap = new Map()

  for (const [slotIdx, [re, im]] of state) {
    const dock = Math.floor(slotIdx / SLOTS)
    const d = slotIdx - dock * SLOTS
    const opp = dock * SLOTS + OPPOSITE[d]!

    // D * I * D = C: keep = (1 + w)/2, cross = (1 - w)/2
    const kr = re * C_KEEP_RE - im * C_KEEP_IM
    const ki = re * C_KEEP_IM + im * C_KEEP_RE
    const cr = re * C_CROSS_RE - im * C_CROSS_IM
    const ci = re * C_CROSS_IM + im * C_CROSS_RE

    addAmp(next, streamSlot(table, slotIdx, hits), kr, ki)
    addAmp(next, streamSlot(table, opp, hits), cr, ci)
  }

  return pruneMap(next)
}

// Encode unordered 2-love slot pair (s1 < s2) as a unique safe integer key (cells <= 10,000 -> totalSlots <= 240,000,
// key < 240,000 * 240,000 = 5.76e10 << 2^53).
function pairKey(s1: number, s2: number, stride: number): number {
  return s1 < s2 ? s1 * stride + s2 : s2 * stride + s1
}

// Precompute exact two-vibe same-dock collision permutation for 'pass' when two loves occupy distinct lines (singles=2).
const SAME_DOCK_COLLIDE = (() => {
  const out = new Int32Array(SLOTS * SLOTS * 2)
  const vibe = new Int8Array(SLOTS)
  const perm = new Int32Array(SLOTS)

  for (let d1 = 0; d1 < SLOTS; d1++) {
    for (let d2 = 0; d2 < SLOTS; d2++) {
      const idx = (d1 * SLOTS + d2) * 2

      if (d1 === d2 || OPPOSITE[d1] === d2) {
        out[idx] = d1
        out[idx + 1] = d2
        continue
      }

      vibe.fill(0)
      vibe[d1] = 1
      vibe[d2] = 1
      const res = bouncePermutation(BOUNCE_TABLE, 'pass', vibe, 0, perm)

      if (res === 0) {
        out[idx] = d1
        out[idx + 1] = d2
      } else {
        out[idx] = perm[d1]!
        out[idx + 1] = perm[d2]!
      }
    }
  }

  return out
})()

function applyHalfCoinPairs(state: PairMap, stride: number): PairMap {
  const next: PairMap = new Map()

  for (const [key, [re, im]] of state) {
    const s1 = Math.floor(key / stride)
    const s2 = key - s1 * stride
    const x1 = Math.floor(s1 / SLOTS)
    const d1 = s1 - x1 * SLOTS
    const x2 = Math.floor(s2 / SLOTS)
    const d2 = s2 - x2 * SLOTS

    if (x1 === x2 && OPPOSITE[d1] === d2) {
      // Full open line: det(D) = 1 + w
      addAmp(
        next,
        key,
        re * D_DET_RE - im * D_DET_IM,
        re * D_DET_IM + im * D_DET_RE,
      )
      continue
    }

    const opp1 = x1 * SLOTS + OPPOSITE[d1]!
    const opp2 = x2 * SLOTS + OPPOSITE[d2]!
    // Two independent half-full lines: D x D
    const k1r = re * D_KEEP_RE - im * D_KEEP_IM
    const k1i = re * D_KEEP_IM + im * D_KEEP_RE
    const c1r = re * D_CROSS_RE - im * D_CROSS_IM
    const c1i = re * D_CROSS_IM + im * D_CROSS_RE

    addAmp(
      next,
      pairKey(s1, s2, stride),
      k1r * D_KEEP_RE - k1i * D_KEEP_IM,
      k1r * D_KEEP_IM + k1i * D_KEEP_RE,
    )
    addAmp(
      next,
      pairKey(s1, opp2, stride),
      k1r * D_CROSS_RE - k1i * D_CROSS_IM,
      k1r * D_CROSS_IM + k1i * D_CROSS_RE,
    )
    addAmp(
      next,
      pairKey(opp1, s2, stride),
      c1r * D_KEEP_RE - c1i * D_KEEP_IM,
      c1r * D_KEEP_IM + c1i * D_KEEP_RE,
    )
    addAmp(
      next,
      pairKey(opp1, opp2, stride),
      c1r * D_CROSS_RE - c1i * D_CROSS_IM,
      c1r * D_CROSS_IM + c1i * D_CROSS_RE,
    )
  }

  return pruneMap(next)
}

function applyMpair(state: PairMap, stride: number, theta: number): PairMap {
  if (theta === 0) return state

  const { keep, hop } = pairLineScatterAmps(theta)
  const next: PairMap = new Map()

  for (const [key, [re, im]] of state) {
    const s1 = Math.floor(key / stride)
    const s2 = key - s1 * stride
    const x1 = Math.floor(s1 / SLOTS)
    const d1 = s1 - x1 * SLOTS
    const x2 = Math.floor(s2 / SLOTS)
    const d2 = s2 - x2 * SLOTS

    if (x1 !== x2 || OPPOSITE[d1] !== d2) {
      addAmp(next, key, re, im)
      continue
    }

    const l0 = LINE_OF[d1]!
    const base = x1 * SLOTS

    for (let m = 0; m < LINES; m++) {
      const amp = m === l0 ? keep : hop
      const m1 = base + LINE_FIRSTS[m]!
      const m2 = base + LINE_SECONDS[m]!

      addAmp(
        next,
        pairKey(m1, m2, stride),
        re * amp[0] - im * amp[1],
        re * amp[1] + im * amp[0],
      )
    }
  }

  return pruneMap(next)
}

// Exact 2-love split-coin beat with M_pair(e^{i theta}): U = S * D * Y * D * M_pair(theta).
function stepPairSplit(
  table: Int32Array,
  cells: number,
  state: PairMap,
  theta: number,
  hits: { frontier: number },
): PairMap {
  const stride = cells * SLOTS
  const mixed = applyMpair(state, stride, theta)
  const d1State = applyHalfCoinPairs(mixed, stride)

  // Meet + 'pass' collision Y
  const collided: PairMap = new Map()

  for (const [key, [re, im]] of d1State) {
    const s1 = Math.floor(key / stride)
    const s2 = key - s1 * stride
    const x1 = Math.floor(s1 / SLOTS)
    const d1 = s1 - x1 * SLOTS
    const x2 = Math.floor(s2 / SLOTS)
    const d2 = s2 - x2 * SLOTS

    if (x1 === x2 && OPPOSITE[d1] === d2) {
      // Full open line of two identical loves: meeting phase w, 'pass' collision keeps slots
      addAmp(collided, key, re * W_RE - im * W_IM, re * W_IM + im * W_RE)
    } else if (x1 === x2) {
      const cIdx = (d1 * SLOTS + d2) * 2
      const nd1 = SAME_DOCK_COLLIDE[cIdx]!
      const nd2 = SAME_DOCK_COLLIDE[cIdx + 1]!

      addAmp(collided, pairKey(x1 * SLOTS + nd1, x1 * SLOTS + nd2, stride), re, im)
    } else {
      addAmp(collided, key, re, im)
    }
  }

  const d2State = applyHalfCoinPairs(pruneMap(collided), stride)

  // Stream S
  const out: PairMap = new Map()

  for (const [key, [re, im]] of d2State) {
    const s1 = Math.floor(key / stride)
    const s2 = key - s1 * stride
    const ns1 = streamSlot(table, s1, hits)
    const ns2 = streamSlot(table, s2, hits)

    addAmp(out, pairKey(ns1, ns2, stride), re, im)
  }

  return pruneMap(out)
}

// ---- Cross-check fast 2-love sparse engine against exact Z[w][1/6] sparse-locked-knit ----

function bigRatio(n: bigint, d: bigint): number {
  if (n === 0n) return 0

  const neg = n < 0n
  const q = ((neg ? -n : n) << 120n) / d

  return ((neg ? -1 : 1) * Number(q)) / 2 ** 120
}

function sparseStateToPairMap(
  s: SparseLockedState,
  cells: number,
  scalePow6: number,
): PairMap {
  const stride = cells * SLOTS
  const scaleDen = 6n ** BigInt(scalePow6)
  const out: PairMap = new Map()

  for (const br of s.branches) {
    if (br.slots.length !== 2) continue

    const den = scaleDen << BigInt(br.k)
    const a = bigRatio(br.a, den)
    const b = bigRatio(br.b, den)
    const re = a - 0.5 * b
    const im = (b * SQRT3) / 2

    addAmp(out, pairKey(br.slots[0]!, br.slots[1]!, stride), re, im)
  }

  return pruneMap(out)
}

function maxMapDiff(a: PairMap, b: PairMap): number {
  let worst = 0

  for (const key of new Set([...a.keys(), ...b.keys()])) {
    const va = a.get(key) ?? [0, 0]
    const vb = b.get(key) ?? [0, 0]

    worst = Math.max(worst, Math.hypot(va[0] - vb[0], va[1] - vb[1]))
  }

  return worst
}

function makeSparseBranch(slots: number[]): SparseLockedBranch {
  const sorted = [...slots].sort((a, b) => a - b)

  return {
    slots: Int32Array.from(sorted),
    vibe: Int8Array.from(sorted.map(() => 1)),
    point: new Int8Array(sorted.length),
    open: Uint8Array.from(sorted.map(() => 1)),
    storeLines: new Int32Array(0),
    store: new Int8Array(0),
    spoint: new Int8Array(0),
    sopen: new Uint8Array(0),
    a: 1n,
    b: 0n,
    k: 0,
  }
}

function crossCheckSparseEngine(chart: CuspChartR3): {
  bareMaxAmpDiff: number
  mpairNeg1MaxAmpDiff: number
  mpairNeg1BigIntNormExact: boolean
} {
  const m3 = exactBallMesh({ radius: 3 })
  const st3 = sparseTablesFromMesh(m3.mesh, 'pass')
  const stride = chart.cells * SLOTS
  const d0 = LINE_FIRSTS[0]!
  const d0Back = LINE_SECONDS[0]!
  const prev = currentCoinPlace()

  setCoinPlace('split')

  try {
    // (1) Bare 3 beats on R = 3
    let exactBare: SparseLockedState = { branches: [makeSparseBranch([d0, d0Back])] }
    let fastBare: PairMap = new Map([[pairKey(d0, d0Back, stride), [1, 0]]])
    const hitsBare = { frontier: 0 }
    let bareMaxAmpDiff = 0

    for (let t = 0; t < 3; t++) {
      exactBare = sparseCoinedVetoBeat('none', st3, exactBare, t)
      fastBare = stepPairSplit(chart.table, chart.cells, fastBare, 0, hitsBare)
      bareMaxAmpDiff = Math.max(
        bareMaxAmpDiff,
        maxMapDiff(sparseStateToPairMap(exactBare, chart.cells, 0), fastBare),
      )
    }

    // (2) M_pair(-1) 3 beats on R = 3
    let exactMix: SparseLockedState = { branches: [makeSparseBranch([d0, d0Back])] }
    let fastMix: PairMap = new Map([[pairKey(d0, d0Back, stride), [1, 0]]])
    const hitsMix = { frontier: 0 }
    let pow6 = 0
    let mpairNeg1MaxAmpDiff = 0
    let mpairNeg1BigIntNormExact = true

    for (let t = 0; t < 3; t++) {
      const mixed = sparsePairLineMixStateNormalized(exactMix)

      pow6 += mixed.powerOfSix
      exactMix = sparseCoinedVetoBeat('none', st3, mixed.state, t)

      const norm = sparseLockedNorm(exactMix)
      const scaleSq = 6n ** BigInt(2 * pow6)

      mpairNeg1BigIntNormExact &&= norm.total === norm.unit * scaleSq

      fastMix = stepPairSplit(chart.table, chart.cells, fastMix, Math.PI, hitsMix)
      mpairNeg1MaxAmpDiff = Math.max(
        mpairNeg1MaxAmpDiff,
        maxMapDiff(sparseStateToPairMap(exactMix, chart.cells, pow6), fastMix),
      )
    }

    return {
      bareMaxAmpDiff,
      mpairNeg1MaxAmpDiff,
      mpairNeg1BigIntNormExact,
    }
  } finally {
    setCoinPlace(prev)
  }
}

// ---- Angular moments and real-space 3D cusp-husk reading ----

type MomentAccum = {
  norm: number
  wOff: number
  msd: number
  maxShadow: number
  maxGraphDist: number
  layerWeight: number
  docks: Set<number>
  m2: Float64Array // 9 entries
  r4Sum: number
  z4Sum: number
}

function emptyAccum(): MomentAccum {
  return {
    norm: 0,
    wOff: 0,
    msd: 0,
    maxShadow: 0,
    maxGraphDist: 0,
    layerWeight: 0,
    docks: new Set<number>(),
    m2: new Float64Array(9),
    r4Sum: 0,
    z4Sum: 0,
  }
}

function addDockSample(
  acc: MomentAccum,
  chart: CuspChartR3,
  dock: number,
  weight: number,
  rawWeightForSupport: number,
): void {
  const dx = chart.pos[dock * 3]! - chart.pos[0]!
  const dy = chart.pos[dock * 3 + 1]! - chart.pos[1]!
  const dz = chart.pos[dock * 3 + 2]! - chart.pos[2]!
  const s2 = dx * dx + dy * dy + dz * dz
  const s = Math.sqrt(s2)

  acc.norm += weight
  acc.msd += weight * s2
  acc.layerWeight += weight * chart.layer[dock]!

  if (s > OFF_LINE) {
    acc.wOff += weight
  }

  if (rawWeightForSupport > SUPPORT_TOL) {
    acc.docks.add(dock)
    acc.maxShadow = Math.max(acc.maxShadow, s)
    acc.maxGraphDist = Math.max(acc.maxGraphDist, chart.distance[dock]!)
  }

  const d = [dx, dy, dz]

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      acc.m2[i * 3 + j] = acc.m2[i * 3 + j]! + weight * d[i]! * d[j]!
    }
  }

  if (s2 > 1e-18) {
    acc.r4Sum += weight * s2 * s2
    acc.z4Sum += weight * (dx ** 4 + dy ** 4 + dz ** 4)
  }
}

function finalizeAccum(
  acc: MomentAccum,
  beat: number,
  frontierHits: number,
): RealSpaceBeatReading {
  const mat = [0, 1, 2].map(i => [0, 1, 2].map(j => acc.m2[i * 3 + j]!))
  const [eMin, eMid, eMax] = symmetricEigen3(mat)
  const eMean = (eMin + eMid + eMax) / 3
  const i2Anisotropy = eMean > 1e-15 ? (eMax - eMin) / eMean : 0
  // Weighted 4th-order angular moment S_4 = <z_x^4 + z_y^4 + z_z^4> / <|z|^4>:
  // exact SO(3) isotropic value is 3/5 = 0.6; pure 3D cubic axis control is 1.0.
  const s4Moment = acc.r4Sum > 1e-18 ? acc.z4Sum / acc.r4Sum : 0.6
  const i4Anisotropy = Math.abs(s4Moment - 0.6) / 0.4

  return {
    beat,
    norm: acc.norm,
    normErr: Math.abs(acc.norm - 1),
    wOff: acc.wOff,
    msd: acc.msd,
    maxShadow: acc.maxShadow,
    maxGraphDist: acc.maxGraphDist,
    maxGraphSpeed: acc.maxGraphDist / beat,
    maxHuskSpeed: acc.maxShadow / beat,
    layerWeight: acc.layerWeight,
    distinctDocks: acc.docks.size,
    frontierHits,
    i2Anisotropy,
    s4Moment,
    i4Anisotropy,
  }
}

function summarizeSeries(
  name: string,
  theta: number,
  beats: RealSpaceBeatReading[],
): RealSpaceSeries {
  return {
    name,
    theta,
    beats,
    maxNormErr: Math.max(...beats.map(b => b.normErr)),
    maxWOff: Math.max(...beats.map(b => b.wOff)),
    maxShadow: Math.max(...beats.map(b => b.maxShadow)),
    maxGraphSpeed: Math.max(...beats.map(b => b.maxGraphSpeed)),
  }
}

function measureBareLone(chart: CuspChartR3, totalBeats: number): RealSpaceSeries {
  const accs = Array.from({ length: totalBeats }, emptyAccum)
  const hitsPerBeat = new Int32Array(totalBeats)

  for (let slot = 0; slot < SLOTS; slot++) {
    let st: LoneMap = new Map([[slot, [1, 0]]])

    for (let t = 0; t < totalBeats; t++) {
      const hits = { frontier: 0 }

      st = stepLoneSplit(chart.table, st, hits)
      hitsPerBeat[t] = hitsPerBeat[t]! + hits.frontier

      for (const [slotIdx, [re, im]] of st) {
        const w = re * re + im * im
        const dock = Math.floor(slotIdx / SLOTS)

        addDockSample(accs[t]!, chart, dock, w / SLOTS, w)
      }
    }
  }

  return summarizeSeries(
    'bare-lone-love',
    0,
    accs.map((a, idx) => finalizeAccum(a, idx + 1, hitsPerBeat[idx]!)),
  )
}

function measurePairStarts(input: {
  name: string
  chart: CuspChartR3
  theta: number
  starts: readonly (readonly [number, number])[] // list of (globalSlot1, globalSlot2)
  totalBeats: number
}): RealSpaceSeries {
  const { name, chart, theta, starts, totalBeats } = input
  const stride = chart.cells * SLOTS
  const accs = Array.from({ length: totalBeats }, emptyAccum)
  const hitsPerBeat = new Int32Array(totalBeats)
  const invN = 1 / starts.length

  for (const [s1, s2] of starts) {
    let st: PairMap = new Map([[pairKey(s1, s2, stride), [1, 0]]])

    for (let t = 0; t < totalBeats; t++) {
      const hits = { frontier: 0 }

      st = stepPairSplit(chart.table, chart.cells, st, theta, hits)
      hitsPerBeat[t] = hitsPerBeat[t]! + hits.frontier

      for (const [key, [re, im]] of st) {
        const w = re * re + im * im
        const a = Math.floor(key / stride)
        const b = key - a * stride
        const x1 = Math.floor(a / SLOTS)
        const x2 = Math.floor(b / SLOTS)

        // Each vibe contributes half of the branch probability to the single-particle cusp density
        addDockSample(accs[t]!, chart, x1, (0.5 * w) * invN, w)
        addDockSample(accs[t]!, chart, x2, (0.5 * w) * invN, w)
      }
    }
  }

  return summarizeSeries(
    name,
    theta,
    accs.map((a, idx) => finalizeAccum(a, idx + 1, hitsPerBeat[idx]!)),
  )
}

// ---- Exact 24 x 24 3D Cusp-Husk Pair Bloch Operator U(k; theta) ----
//
// Basis (24 states per unit cell on the floor-0 {3,4,3,4} cusp husk Z^3):
//   0..11 : |x, full_l> for lines l = 0..11 of dock x (in x's local twisted frame)
//   12..23: for each positive cubic edge j = 0, 1, 2 (joining x to x + e_j via layer slot a_j at x
//           and layer slot b_j at x + e_j, with h_j(a_j) = -b_j and h_j(b_j) = -a_j):
//           4 cross-dock edge states on edge j:
//             12 + 4*j + 0: |(x, a_j),  (x + e_j, -b_j)>
//             12 + 4*j + 1: |(x, a_j),  (x + e_j,  b_j)>
//             12 + 4*j + 2: |(x, -a_j), (x + e_j, -b_j)>
//             12 + 4*j + 3: |(x, -a_j), (x + e_j,  b_j)>
//
// Under U(k; theta) = S(k) * U_bare_local * M_pair(theta):
//   - M_pair(theta) acts on 0..11 by the 12x12 matrix pairLineMixMatrix(theta), and identity on 12..23.
//   - U_bare_local = D * Y * D acts as w^2 on 0..11 (full lines) and as C x C on each 4-state edge block.
//   - S(k) permutes the 24 basis states with exact Bloch phases e^{+-i k_j} when crossing a unit-cell wall
//     (with Bloch basis |u; k> = (1/sqrt N) sum_x e^{+i k . x} |x, u>):
//       * pure-bulk line l: |full_l> -> |full_l>
//       * husk-bulk line l(a_j): |full_{l(a_j)}> -> edge(j, 0)         (phase 1)
//       * husk-bulk line l(b_j): |full_{l(b_j)}> -> e^{+i k_j} edge(j, 3)
//       * edge(j, 0) -> e^{-i k_j} |full_{l(b_j)}>
//       * edge(j, 3) -> |full_{l(a_j)}>                                (phase 1)
//       * edge(j, 1) -> edge(j, 2)                                     (phase 1)
//       * edge(j, 2) -> edge(j, 1)                                     (phase 1)

export type ComplexMatrix = { re: Float64Array; im: Float64Array; n: number }

export function buildCuspBlochMatrix(
  axes: CuspChartR3['axes'],
  k: readonly [number, number, number],
  theta: number,
): ComplexMatrix {
  const n = 24
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  // Verify the 6 husk-bulk lines are distinct
  const lineOfA = axes.map(ax => LINE_OF[ax.slot]!)
  const lineOfB = axes.map(ax => LINE_OF[ax.partner]!)
  const lineRole = new Int32Array(LINES).fill(-1) // -1 pure bulk; 2*j for a_j; 2*j+1 for b_j

  for (let j = 0; j < 3; j++) {
    lineRole[lineOfA[j]!] = 2 * j
    lineRole[lineOfB[j]!] = 2 * j + 1
  }

  // Step 1: A = U_bare_local * M_pair(theta)
  const aRe = new Float64Array(n * n)
  const aIm = new Float64Array(n * n)
  const { keep, hop } = theta === 0
    ? { keep: [1, 0] as const, hop: [0, 0] as const }
    : pairLineScatterAmps(theta)

  // Full-line block (0..11): w^2 * M_pair(theta)
  for (let row = 0; row < LINES; row++) {
    for (let col = 0; col < LINES; col++) {
      const m = row === col ? keep : hop

      aRe[row * n + col] = W2_RE * m[0] - W2_IM * m[1]
      aIm[row * n + col] = W2_RE * m[1] + W2_IM * m[0]
    }
  }

  // 4-state edge blocks (12 + 4*j .. 12 + 4*j + 3): C x C
  // Indices: bit 1 = dock x slot (0 => a_j, 1 => -a_j); bit 0 = dock x+e_j slot (0 => -b_j, 1 => b_j)
  for (let j = 0; j < 3; j++) {
    const off = LINES + 4 * j

    for (let r = 0; r < 4; r++) {
      const r0 = (r >> 1) & 1
      const r1 = r & 1

      for (let c = 0; c < 4; c++) {
        const c0 = (c >> 1) & 1
        const c1 = c & 1
        const u0r = r0 === c0 ? C_KEEP_RE : C_CROSS_RE
        const u0i = r0 === c0 ? C_KEEP_IM : C_CROSS_IM
        const u1r = r1 === c1 ? C_KEEP_RE : C_CROSS_RE
        const u1i = r1 === c1 ? C_KEEP_IM : C_CROSS_IM

        aRe[(off + r) * n + (off + c)] = u0r * u1r - u0i * u1i
        aIm[(off + r) * n + (off + c)] = u0r * u1i + u0i * u1r
      }
    }
  }

  // Step 2: U = S(k) * A (permute rows with Bloch phases)
  const putRow = (
    dstRow: number,
    srcRow: number,
    phRe: number,
    phIm: number,
  ): void => {
    for (let col = 0; col < n; col++) {
      const xr = aRe[srcRow * n + col]!
      const xi = aIm[srcRow * n + col]!

      re[dstRow * n + col] = phRe * xr - phIm * xi
      im[dstRow * n + col] = phRe * xi + phIm * xr
    }
  }

  for (let l = 0; l < LINES; l++) {
    const role = lineRole[l]!

    if (role < 0) {
      putRow(l, l, 1, 0)
    } else if (role % 2 === 0) {
      const j = role >> 1

      putRow(LINES + 4 * j + 0, l, 1, 0)
    } else {
      const j = role >> 1
      const kj = k[j]!

      putRow(LINES + 4 * j + 3, l, Math.cos(kj), Math.sin(kj))
    }
  }

  for (let j = 0; j < 3; j++) {
    const off = LINES + 4 * j
    const kj = k[j]!

    putRow(lineOfB[j]!, off + 0, Math.cos(-kj), Math.sin(-kj))
    putRow(off + 2, off + 1, 1, 0)
    putRow(off + 1, off + 2, 1, 0)
    putRow(lineOfA[j]!, off + 3, 1, 0)
  }

  return { re, im, n }
}

export function unitaryError(m: ComplexMatrix): number {
  const { re, im, n } = m
  let worst = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < n; k++) {
        const ar = re[k * n + i]!
        const ai = -im[k * n + i]!
        const br = re[k * n + j]!
        const bi = im[k * n + j]!

        sr += ar * br - ai * bi
        si += ar * bi + ai * br
      }

      const target = i === j ? 1 : 0

      worst = Math.max(worst, Math.abs(sr - target), Math.abs(si))
    }
  }

  return worst
}

// Verify that our 24 x 24 Bloch matrix U(k; theta) matches real-space evolution on the exact cached
// floor-0 cusp (buildExactCusp({ period: 4, floor: 0 })) for a Bloch plane wave at k = (pi/2, pi/2, 0).
function verifyBlochAgainstExactCusp(
  axes: CuspChartR3['axes'],
  theta: number,
): number {
  const cusp = buildExactCusp({ period: 4, floor: 0 })
  const cells = cusp.cells // 4^3 = 64 layer docks
  const stride = cells * SLOTS

  // Find each dock's 3D lattice coordinates n = (n0, n1, n2) in [0, 3]^3 and its parity twist
  // h_tot = h_0^{n0} h_1^{n1} h_2^{n2} by BFS over layer edges from dock 0.
  const coords = new Int32Array(cells * 3)
  const visited = new Uint8Array(cells)
  const queue = new Int32Array(cells)

  visited[0] = 1
  let head = 0
  let tail = 1

  const twistPermOfCoords = (n0: number, n1: number, n2: number): number[] => {
    let p = Array.from({ length: SLOTS }, (_, s) => s)
    const bits = [n0 & 1, n1 & 1, n2 & 1]

    for (let j = 0; j < 3; j++) {
      if (bits[j]) {
        const tj = axes[j]!.twistPerm

        p = p.map(s => tj[s]!)
      }
    }

    return p
  }

  while (head < tail) {
    const x = queue[head++]!
    const n0 = coords[x * 3]!
    const n1 = coords[x * 3 + 1]!
    const n2 = coords[x * 3 + 2]!
    // Global slot corresponding to local slot s is twist(n0,n1,n2)[s] (since twists are commuting involutions)
    const perm = twistPermOfCoords(n0, n1, n2)

    for (let j = 0; j < 3; j++) {
      const gPos = perm[axes[j]!.slot]!
      const yPos = cusp.table[x * SLOTS + gPos]!

      if (yPos >= 0 && !visited[yPos]) {
        visited[yPos] = 1
        coords[yPos * 3] = (n0 + (j === 0 ? 1 : 0)) & 3
        coords[yPos * 3 + 1] = (n1 + (j === 1 ? 1 : 0)) & 3
        coords[yPos * 3 + 2] = (n2 + (j === 2 ? 1 : 0)) & 3
        queue[tail++] = yPos
      }

      const gNeg = perm[axes[j]!.partner]!
      const yNeg = cusp.table[x * SLOTS + gNeg]!

      if (yNeg >= 0 && !visited[yNeg]) {
        visited[yNeg] = 1
        coords[yNeg * 3] = (n0 + (j === 0 ? 3 : 0)) & 3
        coords[yNeg * 3 + 1] = (n1 + (j === 1 ? 3 : 0)) & 3
        coords[yNeg * 3 + 2] = (n2 + (j === 2 ? 3 : 0)) & 3
        queue[tail++] = yNeg
      }
    }
  }

  // Test k = (pi/2, pi/2, 0), allowed on period-4 torus!
  // Start with Bloch state |psi_0(k)> = (1/sqrt 64) sum_x e^{i k . n(x)} |x, full_{l0_local}>
  const k: [number, number, number] = [Math.PI / 2, Math.PI / 2, 0]
  const l0 = LINE_OF[axes[0]!.slot]!
  const normFactor = 1 / Math.sqrt(cells)
  let realState: PairMap = new Map()

  for (let x = 0; x < cells; x++) {
    const n0 = coords[x * 3]!
    const n1 = coords[x * 3 + 1]!
    const n2 = coords[x * 3 + 2]!
    const ph = k[0] * n0 + k[1] * n1 + k[2] * n2
    const perm = twistPermOfCoords(n0, n1, n2)
    const g1 = x * SLOTS + perm[LINE_FIRSTS[l0]!]!
    const g2 = x * SLOTS + perm[LINE_SECONDS[l0]!]!

    addAmp(
      realState,
      pairKey(g1, g2, stride),
      normFactor * Math.cos(ph),
      normFactor * Math.sin(ph),
    )
  }

  // Evolve 3 beats on real-space period-4 floor-0 cusp
  const hits = { frontier: 0 }
  const U = buildCuspBlochMatrix(axes, k, theta)
  let vRe = new Float64Array(24)
  let vIm = new Float64Array(24)

  vRe[l0] = 1

  let maxErr = 0

  for (let beat = 1; beat <= 3; beat++) {
    realState = stepPairSplit(cusp.table, cells, realState, theta, hits)

    // Evolve 24-vector by U(k; theta)
    const nRe = new Float64Array(24)
    const nIm = new Float64Array(24)

    for (let r = 0; r < 24; r++) {
      let sr = 0
      let si = 0

      for (let c = 0; c < 24; c++) {
        const ur = U.re[r * 24 + c]!
        const ui = U.im[r * 24 + c]!
        const vr = vRe[c]!
        const vi = vIm[c]!

        sr += ur * vr - ui * vi
        si += ur * vi + ui * vr
      }

      nRe[r] = sr
      nIm[r] = si
    }

    vRe = nRe
    vIm = nIm

    // Reconstruct expected real-space PairMap from Bloch vector (vRe, vIm)
    const expected: PairMap = new Map()

    for (let x = 0; x < cells; x++) {
      const n0 = coords[x * 3]!
      const n1 = coords[x * 3 + 1]!
      const n2 = coords[x * 3 + 2]!
      const ph = k[0] * n0 + k[1] * n1 + k[2] * n2
      const cph = normFactor * Math.cos(ph)
      const sph = normFactor * Math.sin(ph)
      const perm = twistPermOfCoords(n0, n1, n2)

      // 12 full-line states at x
      for (let l = 0; l < LINES; l++) {
        const vr = vRe[l]!
        const vi = vIm[l]!

        if (vr * vr + vi * vi < 1e-32) continue

        const g1 = x * SLOTS + perm[LINE_FIRSTS[l]!]!
        const g2 = x * SLOTS + perm[LINE_SECONDS[l]!]!

        addAmp(expected, pairKey(g1, g2, stride), cph * vr - sph * vi, cph * vi + sph * vr)
      }

      // 12 edge states on positive edges (x, x + e_j)
      for (let j = 0; j < 3; j++) {
        const gPos = perm[axes[j]!.slot]!
        const y = cusp.table[x * SLOTS + gPos]!
        const permY = twistPermOfCoords(
          coords[y * 3]!,
          coords[y * 3 + 1]!,
          coords[y * 3 + 2]!,
        )
        const sX = [perm[axes[j]!.slot]!, perm[OPPOSITE[axes[j]!.slot]!]!]
        const sY = [permY[OPPOSITE[axes[j]!.partner]!]!, permY[axes[j]!.partner]!]

        for (let code = 0; code < 4; code++) {
          const idx = LINES + 4 * j + code
          const vr = vRe[idx]!
          const vi = vIm[idx]!

          if (vr * vr + vi * vi < 1e-32) continue

          const g1 = x * SLOTS + sX[(code >> 1) & 1]!
          const g2 = y * SLOTS + sY[code & 1]!

          addAmp(expected, pairKey(g1, g2, stride), cph * vr - sph * vi, cph * vi + sph * vr)
        }
      }
    }

    maxErr = Math.max(maxErr, maxMapDiff(realState, pruneMap(expected)))
  }

  return maxErr
}

// Compute sorted quasi-energies E_n(k) in (-pi, pi] of U(k; theta).
export function quasiEnergies(m: ComplexMatrix): number[] {
  const ev = complexEigenvalues({ re: m.re, im: m.im, n: m.n })
  const phases = ev.re.map((r, i) => Math.atan2(ev.im[i]!, r))

  phases.sort((a, b) => a - b)

  return phases
}

// Track smooth quasi-energy bands from kappa = 0 outward along a fixed direction by nearest-phase matching
// (minimal modular distance on the circle (-pi, pi], using small steps so bands never cross ambiguously).
export function trackBandsAlongDirection(input: {
  axes: CuspChartR3['axes']
  theta: number
  unitDir: readonly [number, number, number]
  kappas: readonly number[]
}): {
  readonly tracks: number[][] // tracks[band][step] = unwrapped E(kappa)
  readonly maxUnitaryErr: number
} {
  const { axes, theta, unitDir, kappas } = input
  const nBands = 24
  let maxUnitaryErr = 0

  const wrapDiff = (a: number, b: number): number => {
    let d = a - b

    while (d > Math.PI) d -= 2 * Math.PI
    while (d <= -Math.PI) d += 2 * Math.PI

    return d
  }

  const m0 = buildCuspBlochMatrix(axes, [0, 0, 0], theta)

  maxUnitaryErr = Math.max(maxUnitaryErr, unitaryError(m0))

  const e0 = quasiEnergies(m0)
  const tracks: number[][] = e0.map(v => [v])

  for (let step = 1; step < kappas.length; step++) {
    const kap = kappas[step]!
    const m = buildCuspBlochMatrix(
      axes,
      [unitDir[0] * kap, unitDir[1] * kap, unitDir[2] * kap],
      theta,
    )

    maxUnitaryErr = Math.max(maxUnitaryErr, unitaryError(m))

    const cur = quasiEnergies(m)
    // Match current phases to previous step's extrapolated phases via greedy min-distance matching
    const used = new Uint8Array(nBands)
    const pairs: { b: number; c: number; dist: number; diff: number }[] = []

    for (let b = 0; b < nBands; b++) {
      const prev = tracks[b]![step - 1]!
      const prev2 = step >= 2 ? tracks[b]![step - 2]! : prev
      const pred = prev + (prev - prev2)

      for (let c = 0; c < nBands; c++) {
        const diff = wrapDiff(cur[c]!, prev)
        const dist = Math.abs(wrapDiff(cur[c]!, pred))

        pairs.push({ b, c, dist, diff })
      }
    }

    pairs.sort((a, b) => a.dist - b.dist)

    const assigned = new Uint8Array(nBands)

    for (const p of pairs) {
      if (assigned[p.b] || used[p.c]) continue

      assigned[p.b] = 1
      used[p.c] = 1
      tracks[p.b]!.push(tracks[p.b]![step - 1]! + p.diff)
    }
  }

  return { tracks, maxUnitaryErr }
}

function measureBlochDispersion(
  axes: CuspChartR3['axes'],
  name: string,
  theta: number,
): BlochDispersionReading {
  const dirs: readonly { name: string; unitDir: readonly [number, number, number] }[] = [
    { name: '(1,0,0)', unitDir: [1, 0, 0] },
    { name: '(1,1,0)', unitDir: [Math.SQRT1_2, Math.SQRT1_2, 0] },
    { name: '(1,1,1)', unitDir: [1 / SQRT3, 1 / SQRT3, 1 / SQRT3] },
  ]
  const steps = 64
  const kMax = Math.PI
  const dk = kMax / steps
  const kappas = Array.from({ length: steps + 1 }, (_, i) => i * dk)
  // Small-k and mid-k grid indices: kappa_small = 4*dk (~0.1963), kappa_mid = 20*dk (~0.9817)
  const smallIdx = 4
  const midIdx = 20
  const kSmall = kappas[smallIdx]!
  const kMid = kappas[midIdx]!

  let maxUnitaryErr = 0
  let maxBandwidth = 0
  let maxGroupSpeedAllDirs = 0

  // First track all 3 directions so we can pick the single cleanest non-degenerate dispersive band
  // (the band with largest smooth curvature at small k, identical E(0) across all 3 directions!)
  const trackedByDir = dirs.map(d => {
    const res = trackBandsAlongDirection({
      axes,
      theta,
      unitDir: d.unitDir,
      kappas,
    })

    maxUnitaryErr = Math.max(maxUnitaryErr, res.maxUnitaryErr)

    return res.tracks
  })

  // Find global bandwidth and global max group speed across ALL 24 bands & all 3 directions
  for (const tracks of trackedByDir) {
    for (const band of tracks) {
      let lo = Infinity
      let hi = -Infinity

      for (let i = 0; i < band.length; i++) {
        lo = Math.min(lo, band[i]!)
        hi = Math.max(hi, band[i]!)

        if (i > 0) {
          const vg = Math.abs(band[i]! - band[i - 1]!) / dk

          maxGroupSpeedAllDirs = Math.max(maxGroupSpeedAllDirs, vg)
        }
      }

      maxBandwidth = Math.max(maxBandwidth, hi - lo)
    }
  }

  // Pick the unique non-degenerate band (unique E0 with largest |E(kSmall) - E(0)| on (1,0,0))
  const tracks100 = trackedByDir[0]!
  let chosenBand = 0
  let bestCurv = -1

  for (let b = 0; b < 24; b++) {
    const e0 = tracks100[b]![0]!
    // Check if non-degenerate at k = 0 (isolated from adjacent eigenvalues by > 1e-6)
    const sepLo = b > 0 ? Math.abs(e0 - tracks100[b - 1]![0]!) : Infinity
    const sepHi = b < 23 ? Math.abs(tracks100[b + 1]![0]! - e0) : Infinity
    const shift = Math.abs(tracks100[b]![smallIdx]! - e0)

    if (Math.min(sepLo, sepHi) > 1e-6 && shift > bestCurv) {
      bestCurv = shift
      chosenBand = b
    }
  }

  // Fallback if all moving bands are degenerate at k=0: pick largest bandwidth on (1,0,0)
  if (bestCurv <= 1e-12) {
    for (let b = 0; b < 24; b++) {
      const shift = Math.abs(tracks100[b]![smallIdx]! - tracks100[b]![0]!)

      if (shift > bestCurv) {
        bestCurv = shift
        chosenBand = b
      }
    }
  }

  const directions: BlochDirectionReading[] = dirs.map((d, di) => {
    const band = trackedByDir[di]![chosenBand]!
    const e0 = band[0]!
    const eSmall = band[smallIdx]!
    const eMid = band[midIdx]!
    const quadraticCoeff = Math.abs(eSmall - e0) / (kSmall * kSmall)
    const smallKGroupSpeed =
      Math.abs(band[smallIdx + 1]! - band[smallIdx - 1]!) / (2 * dk)
    const midKGroupSpeed =
      Math.abs(band[midIdx + 1]! - band[midIdx - 1]!) / (2 * dk)
    let lo = Infinity
    let hi = -Infinity
    let maxVg = 0

    for (let i = 0; i < band.length; i++) {
      lo = Math.min(lo, band[i]!)
      hi = Math.max(hi, band[i]!)

      if (i > 0) {
        maxVg = Math.max(maxVg, Math.abs(band[i]! - band[i - 1]!) / dk)
      }
    }

    return {
      name: d.name,
      unitDir: d.unitDir,
      bandE0: e0,
      bandEAtSmallK: eSmall,
      bandEAtMidK: eMid,
      quadraticCoeff,
      smallKGroupSpeed,
      midKGroupSpeed,
      maxGroupSpeed: maxVg,
      bandwidth: hi - lo,
    }
  })

  const spreadOf = (vals: number[]): number => {
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length

    return mean > 1e-12 ? (Math.max(...vals) - Math.min(...vals)) / mean : 0
  }

  // Tiny-k (index 1, k = pi/64) vs small-k (index 4, k = pi/16): ratio of 4 in |k| measures exact anisotropy order
  const tinyIdx = 1
  const kTiny = kappas[tinyIdx]!
  const tinyCurvs = dirs.map((_, di) => {
    const band = trackedByDir[di]![chosenBand]!

    return Math.abs(band[tinyIdx]! - band[0]!) / (kTiny * kTiny)
  })
  const tinyKCurvatureSpread = spreadOf(tinyCurvs)
  const smallKCurvatureSpread = spreadOf(directions.map(d => d.quadraticCoeff))
  const smallKAnisotropyOrder =
    tinyKCurvatureSpread > 1e-12 && smallKCurvatureSpread > 1e-12
      ? Math.log(smallKCurvatureSpread / tinyKCurvatureSpread) /
        Math.log(kSmall / kTiny)
      : 0

  // Cubic tight-binding control: E_cubic(k) = 3 - cos kx - cos ky - cos kz,
  // dE/dkappa along unitDir u at kappa = kMid is u_x sin(u_x k) + u_y sin(u_y k) + u_z sin(u_z k)
  const cubicMidSpeeds = dirs.map(d => {
    const [ux, uy, uz] = d.unitDir

    return (
      ux * Math.sin(ux * kMid) +
      uy * Math.sin(uy * kMid) +
      uz * Math.sin(uz * kMid)
    )
  })
  const realSpaceCrossCheckErr = verifyBlochAgainstExactCusp(axes, theta)

  return {
    name,
    theta,
    maxUnitaryErr,
    realSpaceCrossCheckErr,
    maxBandwidth,
    maxGroupSpeedAllDirs,
    directions,
    tinyKCurvatureSpread,
    smallKCurvatureSpread,
    smallKAnisotropyOrder,
    smallKSpeedSpread: spreadOf(directions.map(d => d.smallKGroupSpeed)),
    midKSpeedSpread: spreadOf(directions.map(d => d.midKGroupSpeed)),
    cubicControlMidKSpeedSpread: spreadOf(cubicMidSpeeds),
  }
}

export function runMpairCuspDispersion(): MpairCuspDispersionResult {
  const cell = exactCell()
  const translations = cuspTranslations(cell)
  const chart = buildCuspChartR3(cell, translations)
  const sparseEngineCheck = crossCheckSparseEngine(chart)

  const originLineStarts: [number, number][] = Array.from(
    { length: LINES },
    (_, l) => [LINE_FIRSTS[l]!, LINE_SECONDS[l]!],
  )
  const singleLineStart: [number, number][] = [[LINE_FIRSTS[0]!, LINE_SECONDS[0]!]]

  // Layer-neighbor full-line starts: for each of the 6 layer slots a of dock 0, dock x_a = table[a] sits at
  // cusp position (+-1,0,0), (0,+-1,0), (0,0,+-1), and line {a, OPPOSITE[a]} at x_a is the geodesic line through dock 0.
  const layerNeighborStarts: [number, number][] = chart.layerSlots.map(a => {
    const xa = chart.table[a]!

    return [xa * SLOTS + a, xa * SLOTS + OPPOSITE[a]!]
  })

  const bareLone = measureBareLone(chart, 3)
  const bareOriginPair = measurePairStarts({
    name: 'bare-origin-pair-12lines',
    chart,
    theta: 0,
    starts: originLineStarts,
    totalBeats: 3,
  })
  const bareSingleLineOriginPair = measurePairStarts({
    name: 'bare-origin-pair-single-line',
    chart,
    theta: 0,
    starts: singleLineStart,
    totalBeats: 3,
  })
  const mpairNeg1SingleLineOriginPair = measurePairStarts({
    name: 'mpair-neg1-origin-pair-single-line',
    chart,
    theta: Math.PI,
    starts: singleLineStart,
    totalBeats: 3,
  })
  const mpairZeta18SingleLineOriginPair = measurePairStarts({
    name: 'mpair-zeta18-origin-pair-single-line',
    chart,
    theta: Math.PI / 9,
    starts: singleLineStart,
    totalBeats: 3,
  })
  const mpairNeg1OriginPair = measurePairStarts({
    name: 'mpair-neg1-origin-pair',
    chart,
    theta: Math.PI,
    starts: originLineStarts,
    totalBeats: 3,
  })
  const mpairZeta18OriginPair = measurePairStarts({
    name: 'mpair-zeta18-origin-pair',
    chart,
    theta: Math.PI / 9,
    starts: originLineStarts,
    totalBeats: 3,
  })

  const bareLayerNeighborPair = measurePairStarts({
    name: 'bare-layer-neighbor-pair',
    chart,
    theta: 0,
    starts: layerNeighborStarts,
    totalBeats: 3,
  })
  const mpairNeg1LayerNeighborPair = measurePairStarts({
    name: 'mpair-neg1-layer-neighbor-pair',
    chart,
    theta: Math.PI,
    starts: layerNeighborStarts,
    totalBeats: 3,
  })
  const mpairZeta18LayerNeighborPair = measurePairStarts({
    name: 'mpair-zeta18-layer-neighbor-pair',
    chart,
    theta: Math.PI / 9,
    starts: layerNeighborStarts,
    totalBeats: 3,
  })

  // Pure 3D cubic axis control: 6 unit vectors (+-1,0,0), (0,+-1,0), (0,0,+-1) -> S_4 = 1.0, I_4 = 1.0
  const cubicAxisS4Control = 1.0
  const cubicAxisI4Control = Math.abs(cubicAxisS4Control - 0.6) / 0.4

  // Exact 24 x 24 3D cusp-husk Bloch dispersion
  const blochBare = measureBlochDispersion(chart.axes, 'bare', 0)
  const blochNeg1 = measureBlochDispersion(chart.axes, 'mpair-neg1', Math.PI)
  const blochZeta18 = measureBlochDispersion(
    chart.axes,
    'mpair-zeta18',
    Math.PI / 9,
  )

  return {
    chart: {
      cells: chart.cells,
      layerSlotsCount: chart.layerSlots.length,
      bulkSlotsCount: chart.bulkSlots.length,
      unitOff: chart.unitOff,
      pairOff: chart.pairOff,
      chartConsistencyErr: chart.chartConsistencyErr,
      translationGatesAll: chart.translationGatesAll,
    },
    sparseEngineCheck,
    bareLone,
    bareOriginPair,
    bareSingleLineOriginPair,
    mpairNeg1SingleLineOriginPair,
    mpairZeta18SingleLineOriginPair,
    mpairNeg1OriginPair,
    mpairZeta18OriginPair,
    bareLayerNeighborPair,
    mpairNeg1LayerNeighborPair,
    mpairZeta18LayerNeighborPair,
    cubicAxisS4Control,
    cubicAxisI4Control,
    blochBare,
    blochNeg1,
    blochZeta18,
  }
}
