// EMERGENT COSMOLOGICAL EXPANSION a(t), H(t), q(t), w_eff(t) FROM A FINITE DISTURBANCE SPREADING
// IN THE FIXED INFINITE {3,4,3,4} HONEYCOMB WITHOUT MESH GROWTH (E-CSM-0064, gaps B-18, B-42).
//
// Under Proposal 003 (adopted), the {3,4,3,4} honeycomb is FIXED and INFINITE (no irreversible mesh growth).
// Yet when a finite, low-entropy disturbance starts at the cusp layer (D = 0) and propagates into the calm
// bulk V1 under the exact reversible unitary walk (split coin + F-G frame mixer / M_pair pair mixer), the
// exponential horosphere branching of {3,4,3,4} (exact per-column shell counts N_D = 1, 18, 330, 6034; every
// active frame at D >= 1 has identically 1 upward link and 7 downward links, with zero [0,0] or [-1,-1]
// geodesic lines anywhere in the cusp) drives a ballistic mean-depth drift <D(t)> ~ v_D * t into deeper,
// exponentially larger horospheres.
//
// Part A (Exact short-horizon verification on cached {3,4,3,4} meshes, t = 0..3 beats, zero frontier hits):
//   - Cached exact cusp (period = 2, floor = 3; 51,064 docks, loads in ~5 ms) and cached exact R = 3 ball
//     (8,857 docks, zero periodic wraparound, verified via coverBall with 0 conflicts and 0 missing edges).
//   - Evolves localized dock-0 disturbances under bare split-coin, F-G(pi), F-G(4pi/9), and 2-love M_pair(-1),
//     measuring exact unitarity (normErr <= 1e-13), <D(t)>, exact horosphere volume <V(t)> = sum_D P(D,t) N_D,
//     and effective 3D scale factor a(t) = <V(t)>^{1/3}.
//   - Runs exact adjoint U^dag for 3 beats to verify exact reversibility (<D_back> <= 1e-13, ampErr <= 1e-13):
//     apparent expansion happens inside a 100% reversible, fixed-mesh unitary rule from a low-entropy seed.
//
// Part B (Long-time radial-depth unitary walk, t = 0..40 beats, zero floor reflection):
//   - Part B1: Exact infinite 7-ary frame-tree causal Green's-function solver for {3,4,3,4} (bare, F-G(pi),
//     F-G(4pi/9)), matching Part A's 51,064-dock exact cusp to < 1e-12 at t = 0..3 and evolving to t = 40
//     with exact unitarity (normErr <= 1e-13) and zero floor truncation.
//   - Part B2: Explicit 1D unitary depth-projected Grover walk on the b = 18 down / 1 up / 5 lateral
//     branching tree (D_max = 60, zero floor reflection, explicit 40-beat U^dag reversibility check) vs
//     flat cubic control (b = 1 down / 1 up / 4 lateral, N_D = 1 -> a(t) = 1, H(t) = 0 identically).
//   - Measures v_D = d<D>/dt > 0, effective 3D scale factor a(t) = exp((ln b / 3) * <D(t)>) ~ exp(H t),
//     positive Hubble rate H = (ln b / 3) * v_D, deceleration parameter q(t) = -1 - dH/H^2 -> -1 (and raw
//     central finite difference q_fd -> -1 / cosh^2(H/2)), and effective equation of state w_eff -> -1.
//
// NOTHING MOVES: deterministic Float64 unitary linear algebra on exact cached Coxeter geometry. Zero Math.random.

import { buildExactCusp, coverBall } from '@/code/substrate/coxeter/exact-cusp'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { LINE_FIRSTS, LINE_OF, OPPOSITE } from '@/code/rule/isometric-knit'
import { FRAME_OF_SLOT, FRAME_SLOTS, LINE_SECONDS } from '@/code/rule/coined-locked-knit'
import { BOUNCE_TABLE, bouncePermutation } from '@/code/rule/bounce-pair-knit'
import { pairLineScatterAmps } from '@/code/rule/pair-line-mixer'

const SLOTS = 24
const LINES = 12
const SQRT3 = Math.sqrt(3)
const PRUNE_AMP2 = 1e-28

// Exact Z[w][1/2] constants (w = -1/2 + i sqrt(3)/2):
const W_RE = -0.5
const W_IM = SQRT3 / 2
// Half-coin D: keep = (2 + w)/2, cross = -w/2, det(D) = 1 + w
const D_KEEP_RE = 0.75
const D_KEEP_IM = SQRT3 / 4
const D_CROSS_RE = 0.25
const D_CROSS_IM = -SQRT3 / 4
const D_DET_RE = 0.5
const D_DET_IM = SQRT3 / 2
// Full coin C = D^2 on lone open line: keep = (1 + w)/2, cross = (1 - w)/2
const C_KEEP_RE = 0.25
const C_KEEP_IM = SQRT3 / 4
const C_CROSS_RE = 0.75
const C_CROSS_IM = -SQRT3 / 4

type C2 = [number, number]
type SparseMap = Map<number, C2>

const cAdd = (a: C2, b: C2): C2 => [a[0] + b[0], a[1] + b[1]]
const cMul = (a: C2, b: C2): C2 => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cConjMul = (a: C2, b: C2): C2 => [a[0] * b[0] + a[1] * b[1], a[0] * b[1] - a[1] * b[0]]
const cAbs2 = (a: C2): number => a[0] * a[0] + a[1] * a[1]

export type CuspGeometryAudit = {
  readonly cuspCells: number
  readonly ballCells: number
  readonly coverConflicts: number
  readonly coverMissing: number
  readonly shellCountsD0to3: readonly [number, number, number, number]
  readonly cumulativeD0to3: readonly [number, number, number, number]
  readonly horosphereScaleD0to3: readonly [number, number, number, number]
  readonly asymptoticVolRatio: number
  readonly allD0Frames026: boolean
  readonly allBulkUpFrames107: boolean
  readonly zeroUpOrLatSelfLines: boolean
}

export type ExactBeatReading = {
  readonly beat: number
  readonly normErr: number
  readonly pDepth: readonly [number, number, number, number]
  readonly meanD: number
  readonly meanV: number
  readonly scaleA: number
}

export type PartARuleResult = {
  readonly name: string
  readonly beats: readonly ExactBeatReading[]
  readonly maxNormErr: number
  readonly forwardFrontierHits: number
  readonly reversedMeanD: number
  readonly reversedMaxAmpDiff: number
}

export type LongTimeCosmologySeries = {
  readonly name: string
  readonly branchingB: number
  readonly steps: number
  readonly maxNormErr: number
  readonly floorWeightAtMaxD: number
  readonly matchPartAMaxErr: number
  readonly reversedMeanD: number
  readonly reversedMaxAmpDiff: number
  readonly meanDAt10: number
  readonly meanDAt20: number
  readonly meanDAt30: number
  readonly meanDAt40: number
  readonly scaleAAt10: number
  readonly scaleAAt20: number
  readonly scaleAAt30: number
  readonly scaleAAt40: number
  readonly fitVelocityD: number
  readonly fitR2LinearD: number
  readonly hubbleFromFit: number
  readonly hubbleLateMean: number
  readonly qLogLateMean: number
  readonly qLogFinalWindowStd: number
  readonly wEffLateMean: number
  readonly qFdLateMean: number
  readonly qFdDeSitterBenchmark: number
  readonly qFdBenchmarkRelErr: number
  readonly hubbleAsympVolRatio: number
}

export type HorosphereCosmologyResult = {
  readonly geometry: CuspGeometryAudit
  readonly partA: {
    readonly cuspBare: PartARuleResult
    readonly cuspFgPi: PartARuleResult
    readonly cuspFg4Pi9: PartARuleResult
    readonly cuspMpairSingleLine: PartARuleResult
    readonly cuspMpairUniform: PartARuleResult
    readonly ballBare: PartARuleResult
    readonly ballFgPi: PartARuleResult
    readonly ballBareMaxDepthDiff: number
    readonly ballFgPiWavefrontDiffT2: number
    readonly ballFgPiWavefrontDiffT3: number
  }
  readonly partB: {
    readonly exactTreeBare: LongTimeCosmologySeries
    readonly exactTreeFgPi: LongTimeCosmologySeries
    readonly exactTreeFg4Pi9: LongTimeCosmologySeries
    readonly groverBranchingB18: LongTimeCosmologySeries
    readonly flatCubicControlB1: LongTimeCosmologySeries
  }
}

// ---- Sparse map helpers ----

function addSparse(map: SparseMap, key: number, re: number, im: number): void {
  const prev = map.get(key)

  if (prev) {
    prev[0] += re
    prev[1] += im
  } else {
    map.set(key, [re, im])
  }
}

function pruneSparse(map: SparseMap): SparseMap {
  const out: SparseMap = new Map()

  for (const [k, v] of map) {
    if (v[0] * v[0] + v[1] * v[1] > PRUNE_AMP2) {
      out.set(k, v)
    }
  }

  return out
}

function maxSparseDiff(a: SparseMap, b: SparseMap): number {
  let worst = 0

  for (const k of new Set([...a.keys(), ...b.keys()])) {
    const va = a.get(k) ?? [0, 0]
    const vb = b.get(k) ?? [0, 0]

    worst = Math.max(worst, Math.hypot(va[0] - vb[0], va[1] - vb[1]))
  }

  return worst
}

// ---- Exact cusp geometry audit ----

function auditCuspGeometry(): {
  audit: CuspGeometryAudit
  cusp: ReturnType<typeof buildExactCusp>
  ball: ReturnType<typeof exactBallMesh>
  ballDepth: Uint8Array
  nD: readonly [number, number, number, number]
} {
  const cusp = buildExactCusp({ period: 2, floor: 3 })
  const ball = exactBallMesh({ radius: 3 })
  const cov = coverBall(ball.ball.table, cusp.table)
  const ballDepth = new Uint8Array(ball.cells)

  for (let x = 0; x < ball.cells; x++) {
    ballDepth[x] = cusp.depth[cov.pi[x]!]!
  }

  const nD: [number, number, number, number] = [
    cusp.depthCounts[0]! / 8,
    cusp.depthCounts[1]! / 8,
    cusp.depthCounts[2]! / 8,
    cusp.depthCounts[3]! / 8,
  ]
  const cum: [number, number, number, number] = [
    nD[0],
    nD[0] + nD[1],
    nD[0] + nD[1] + nD[2],
    nD[0] + nD[1] + nD[2] + nD[3],
  ]
  const scaleD: [number, number, number, number] = [
    Math.cbrt(nD[0]),
    Math.cbrt(nD[1]),
    Math.cbrt(nD[2]),
    Math.cbrt(nD[3]),
  ]

  let allD0Frames026 = true
  let allBulkUpFrames107 = true
  let zeroUpOrLatSelfLines = true

  for (let x = 0; x < cusp.cells; x++) {
    const d = cusp.depth[x]!
    const base = x * SLOTS

    // Check every frame's (up, lat, dn) counts
    const fCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0]

    for (let s = 0; s < SLOTS; s++) {
      const y = cusp.table[base + s]!
      const dy = y < 0 ? 1 : cusp.depth[y]! - d
      const f = FRAME_OF_SLOT[s]!

      fCounts[f * 3 + (dy + 1)] = fCounts[f * 3 + (dy + 1)]! + 1
    }

    if (d === 0) {
      for (let f = 0; f < 3; f++) {
        if (
          fCounts[f * 3] !== 0 ||
          fCounts[f * 3 + 1] !== 2 ||
          fCounts[f * 3 + 2] !== 6
        ) {
          allD0Frames026 = false
        }
      }
    } else {
      for (let f = 0; f < 3; f++) {
        const up = fCounts[f * 3]!
        const lat = fCounts[f * 3 + 1]!
        const dn = fCounts[f * 3 + 2]!

        if (up > 0 && (up !== 1 || lat !== 0 || dn !== 7)) {
          allBulkUpFrames107 = false
        }
      }
    }

    // Check every geodesic line (s, opp(s)): at least one end must go strictly deeper (dy = +1)
    for (const s of LINE_FIRSTS) {
      const o = OPPOSITE[s]!
      const y1 = cusp.table[base + s]!
      const y2 = cusp.table[base + o]!
      const dy1 = y1 < 0 ? 1 : cusp.depth[y1]! - d
      const dy2 = y2 < 0 ? 1 : cusp.depth[y2]! - d

      if (dy1 !== 1 && dy2 !== 1) {
        zeroUpOrLatSelfLines = false
      }
    }
  }

  return {
    audit: {
      cuspCells: cusp.cells,
      ballCells: ball.cells,
      coverConflicts: cov.conflicts,
      coverMissing: cov.missing,
      shellCountsD0to3: nD,
      cumulativeD0to3: cum,
      horosphereScaleD0to3: scaleD,
      asymptoticVolRatio: nD[3] / nD[2],
      allD0Frames026,
      allBulkUpFrames107,
      zeroUpOrLatSelfLines,
    },
    cusp,
    ball,
    ballDepth,
    nD,
  }
}

// ---- Part A: Exact lone-vibe split-coin + F-G(theta) evolution ----

function applyFgLone(state: SparseMap, theta: number, adjoint: boolean): SparseMap {
  const ur = Math.cos(adjoint ? -theta : theta)
  const ui = Math.sin(adjoint ? -theta : theta)
  const hopR = (ur - 1) / 8
  const hopI = ui / 8
  const keepR = 1 + hopR
  const keepI = hopI
  const next: SparseMap = new Map()

  for (const [slotIdx, [re, im]] of state) {
    const dock = Math.floor(slotIdx / SLOTS)
    const d = slotIdx - dock * SLOTS
    const fs = FRAME_SLOTS[FRAME_OF_SLOT[d]!]!

    for (let q = 0; q < 8; q++) {
      const td = fs[q]!
      const ar = td === d ? keepR : hopR
      const ai = td === d ? keepI : hopI

      addSparse(next, dock * SLOTS + td, re * ar - im * ai, re * ai + im * ar)
    }
  }

  return pruneSparse(next)
}

function applyCoinLone(state: SparseMap, adjoint: boolean): SparseMap {
  const kr = C_KEEP_RE
  const ki = adjoint ? -C_KEEP_IM : C_KEEP_IM
  const cr = C_CROSS_RE
  const ci = adjoint ? -C_CROSS_IM : C_CROSS_IM
  const next: SparseMap = new Map()

  for (const [slotIdx, [re, im]] of state) {
    const dock = Math.floor(slotIdx / SLOTS)
    const d = slotIdx - dock * SLOTS
    const opp = dock * SLOTS + OPPOSITE[d]!

    addSparse(next, slotIdx, re * kr - im * ki, re * ki + im * kr)
    addSparse(next, opp, re * cr - im * ci, re * ci + im * cr)
  }

  return pruneSparse(next)
}

function applyStreamLone(
  table: Int32Array,
  state: SparseMap,
  adjoint: boolean,
  hits: { frontier: number },
): SparseMap {
  const next: SparseMap = new Map()

  for (const [slotIdx, [re, im]] of state) {
    const dock = Math.floor(slotIdx / SLOTS)
    const d = slotIdx - dock * SLOTS
    const dir = adjoint ? OPPOSITE[d]! : d
    const nb = table[dock * SLOTS + dir]!
    let target: number

    if (nb < 0) {
      hits.frontier++
      target = dock * SLOTS + OPPOSITE[d]!
    } else {
      target = nb * SLOTS + d
    }

    addSparse(next, target, re, im)
  }

  return pruneSparse(next)
}

function stepLone(
  table: Int32Array,
  state: SparseMap,
  mixTheta: number | null,
  adjoint: boolean,
  hits: { frontier: number },
): SparseMap {
  if (!adjoint) {
    let cur = mixTheta !== null ? applyFgLone(state, mixTheta, false) : state

    cur = applyCoinLone(cur, false)

    return applyStreamLone(table, cur, false, hits)
  }

  let cur = applyStreamLone(table, state, true, hits)

  cur = applyCoinLone(cur, true)

  return mixTheta !== null ? applyFgLone(cur, mixTheta, true) : cur
}

function measureLone(
  state: SparseMap,
  depthArr: Uint8Array,
  nD: readonly [number, number, number, number],
  beat: number,
): ExactBeatReading {
  const p: [number, number, number, number] = [0, 0, 0, 0]
  let norm = 0

  for (const [slotIdx, [re, im]] of state) {
    const w = re * re + im * im
    const d = depthArr[Math.floor(slotIdx / SLOTS)]!

    norm += w
    p[d] = p[d]! + w
  }

  let meanD = 0
  let meanV = 0

  for (let d = 0; d < 4; d++) {
    meanD += d * p[d]!
    meanV += p[d]! * nD[d]!
  }

  return {
    beat,
    normErr: Math.abs(norm - 1),
    pDepth: p,
    meanD,
    meanV,
    scaleA: Math.cbrt(meanV),
  }
}

function runPartALone(
  name: string,
  table: Int32Array,
  depthArr: Uint8Array,
  nD: readonly [number, number, number, number],
  mixTheta: number | null,
): PartARuleResult {
  const init: SparseMap = new Map()
  const amp0 = 1 / Math.sqrt(SLOTS)

  for (let d = 0; d < SLOTS; d++) {
    init.set(d, [amp0, 0])
  }

  let cur: SparseMap = new Map(init)
  const beats: ExactBeatReading[] = [measureLone(cur, depthArr, nD, 0)]
  const fwdHits = { frontier: 0 }

  for (let t = 1; t <= 3; t++) {
    cur = stepLone(table, cur, mixTheta, false, fwdHits)
    beats.push(measureLone(cur, depthArr, nD, t))
  }

  const bwdHits = { frontier: 0 }

  for (let t = 0; t < 3; t++) {
    cur = stepLone(table, cur, mixTheta, true, bwdHits)
  }

  const backRead = measureLone(cur, depthArr, nD, 0)

  return {
    name,
    beats,
    maxNormErr: Math.max(...beats.map(b => b.normErr)),
    forwardFrontierHits: fwdHits.frontier,
    reversedMeanD: backRead.meanD,
    reversedMaxAmpDiff: maxSparseDiff(init, cur),
  }
}

// ---- Part A: Exact 2-love M_pair(-1) + split-coin evolution on exact cusp ----

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

function pairKey(s1: number, s2: number, stride: number): number {
  return s1 < s2 ? s1 * stride + s2 : s2 * stride + s1
}

function applyHalfCoinPairs(state: SparseMap, stride: number, adjoint: boolean): SparseMap {
  const kr = D_KEEP_RE
  const ki = adjoint ? -D_KEEP_IM : D_KEEP_IM
  const cr = D_CROSS_RE
  const ci = adjoint ? -D_CROSS_IM : D_CROSS_IM
  const dr = D_DET_RE
  const di = adjoint ? -D_DET_IM : D_DET_IM
  const next: SparseMap = new Map()

  for (const [key, [re, im]] of state) {
    const s1 = Math.floor(key / stride)
    const s2 = key - s1 * stride
    const x1 = Math.floor(s1 / SLOTS)
    const d1 = s1 - x1 * SLOTS
    const x2 = Math.floor(s2 / SLOTS)
    const d2 = s2 - x2 * SLOTS

    if (x1 === x2 && OPPOSITE[d1] === d2) {
      addSparse(next, key, re * dr - im * di, re * di + im * dr)
      continue
    }

    const opp1 = x1 * SLOTS + OPPOSITE[d1]!
    const opp2 = x2 * SLOTS + OPPOSITE[d2]!
    const k1r = re * kr - im * ki
    const k1i = re * ki + im * kr
    const c1r = re * cr - im * ci
    const c1i = re * ci + im * cr

    addSparse(next, pairKey(s1, s2, stride), k1r * kr - k1i * ki, k1r * ki + k1i * kr)
    addSparse(next, pairKey(s1, opp2, stride), k1r * cr - k1i * ci, k1r * ci + k1i * cr)
    addSparse(next, pairKey(opp1, s2, stride), c1r * kr - c1i * ki, c1r * ki + c1i * kr)
    addSparse(next, pairKey(opp1, opp2, stride), c1r * cr - c1i * ci, c1r * ci + c1i * cr)
  }

  return pruneSparse(next)
}

function applyMpair(
  state: SparseMap,
  stride: number,
  theta: number,
  adjoint: boolean,
): SparseMap {
  if (theta === 0) return state

  const { keep, hop } = pairLineScatterAmps(adjoint ? -theta : theta)
  const next: SparseMap = new Map()

  for (const [key, [re, im]] of state) {
    const s1 = Math.floor(key / stride)
    const s2 = key - s1 * stride
    const x1 = Math.floor(s1 / SLOTS)
    const d1 = s1 - x1 * SLOTS
    const x2 = Math.floor(s2 / SLOTS)
    const d2 = s2 - x2 * SLOTS

    if (x1 !== x2 || OPPOSITE[d1] !== d2) {
      addSparse(next, key, re, im)
      continue
    }

    const l0 = LINE_OF[d1]!
    const base = x1 * SLOTS

    for (let m = 0; m < LINES; m++) {
      const amp = m === l0 ? keep : hop
      const m1 = base + LINE_FIRSTS[m]!
      const m2 = base + LINE_SECONDS[m]!

      addSparse(
        next,
        pairKey(m1, m2, stride),
        re * amp[0] - im * amp[1],
        re * amp[1] + im * amp[0],
      )
    }
  }

  return pruneSparse(next)
}

function applyCollidePairs(state: SparseMap, stride: number, adjoint: boolean): SparseMap {
  const wr = W_RE
  const wi = adjoint ? -W_IM : W_IM
  const next: SparseMap = new Map()

  for (const [key, [re, im]] of state) {
    const s1 = Math.floor(key / stride)
    const s2 = key - s1 * stride
    const x1 = Math.floor(s1 / SLOTS)
    const d1 = s1 - x1 * SLOTS
    const x2 = Math.floor(s2 / SLOTS)
    const d2 = s2 - x2 * SLOTS

    if (x1 === x2 && OPPOSITE[d1] === d2) {
      addSparse(next, key, re * wr - im * wi, re * wi + im * wr)
    } else if (x1 === x2) {
      const cIdx = (d1 * SLOTS + d2) * 2
      const nd1 = SAME_DOCK_COLLIDE[cIdx]!
      const nd2 = SAME_DOCK_COLLIDE[cIdx + 1]!

      addSparse(next, pairKey(x1 * SLOTS + nd1, x1 * SLOTS + nd2, stride), re, im)
    } else {
      addSparse(next, key, re, im)
    }
  }

  return pruneSparse(next)
}

function applyStreamPairs(
  table: Int32Array,
  state: SparseMap,
  stride: number,
  adjoint: boolean,
  hits: { frontier: number },
): SparseMap {
  const next: SparseMap = new Map()
  const moveSlot = (slotIdx: number): number => {
    const dock = Math.floor(slotIdx / SLOTS)
    const d = slotIdx - dock * SLOTS
    const dir = adjoint ? OPPOSITE[d]! : d
    const nb = table[dock * SLOTS + dir]!

    if (nb < 0) {
      hits.frontier++

      return dock * SLOTS + OPPOSITE[d]!
    }

    return nb * SLOTS + d
  }

  for (const [key, [re, im]] of state) {
    const s1 = Math.floor(key / stride)
    const s2 = key - s1 * stride

    addSparse(next, pairKey(moveSlot(s1), moveSlot(s2), stride), re, im)
  }

  return pruneSparse(next)
}

function stepPairs(
  table: Int32Array,
  stride: number,
  state: SparseMap,
  theta: number,
  adjoint: boolean,
  hits: { frontier: number },
): SparseMap {
  if (!adjoint) {
    let s = applyMpair(state, stride, theta, false)

    s = applyHalfCoinPairs(s, stride, false)
    s = applyCollidePairs(s, stride, false)
    s = applyHalfCoinPairs(s, stride, false)

    return applyStreamPairs(table, s, stride, false, hits)
  }

  let s = applyStreamPairs(table, state, stride, true, hits)

  s = applyHalfCoinPairs(s, stride, true)
  s = applyCollidePairs(s, stride, true)
  s = applyHalfCoinPairs(s, stride, true)

  return applyMpair(s, stride, theta, true)
}

function measurePairs(
  state: SparseMap,
  stride: number,
  depthArr: Uint8Array,
  nD: readonly [number, number, number, number],
  beat: number,
): ExactBeatReading {
  const p: [number, number, number, number] = [0, 0, 0, 0]
  let norm = 0

  for (const [key, [re, im]] of state) {
    const w = re * re + im * im
    const s1 = Math.floor(key / stride)
    const s2 = key - s1 * stride
    const d1 = depthArr[Math.floor(s1 / SLOTS)]!
    const d2 = depthArr[Math.floor(s2 / SLOTS)]!

    norm += w
    p[d1] = p[d1]! + 0.5 * w
    p[d2] = p[d2]! + 0.5 * w
  }

  let meanD = 0
  let meanV = 0

  for (let d = 0; d < 4; d++) {
    meanD += d * p[d]!
    meanV += p[d]! * nD[d]!
  }

  return {
    beat,
    normErr: Math.abs(norm - 1),
    pDepth: p,
    meanD,
    meanV,
    scaleA: Math.cbrt(meanV),
  }
}

function runPartAPairs(
  name: string,
  table: Int32Array,
  cells: number,
  depthArr: Uint8Array,
  nD: readonly [number, number, number, number],
  initLines: readonly number[],
  theta: number,
): PartARuleResult {
  const stride = cells * SLOTS
  const init: SparseMap = new Map()
  const amp0 = 1 / Math.sqrt(initLines.length)

  for (const l of initLines) {
    init.set(pairKey(LINE_FIRSTS[l]!, LINE_SECONDS[l]!, stride), [amp0, 0])
  }

  let cur: SparseMap = new Map(init)
  const beats: ExactBeatReading[] = [measurePairs(cur, stride, depthArr, nD, 0)]
  const fwdHits = { frontier: 0 }

  for (let t = 1; t <= 3; t++) {
    cur = stepPairs(table, stride, cur, theta, false, fwdHits)
    beats.push(measurePairs(cur, stride, depthArr, nD, t))
  }

  const bwdHits = { frontier: 0 }

  for (let t = 0; t < 3; t++) {
    cur = stepPairs(table, stride, cur, theta, true, bwdHits)
  }

  const backRead = measurePairs(cur, stride, depthArr, nD, 0)

  return {
    name,
    beats,
    maxNormErr: Math.max(...beats.map(b => b.normErr)),
    forwardFrontierHits: fwdHits.frontier,
    reversedMeanD: backRead.meanD,
    reversedMaxAmpDiff: maxSparseDiff(init, cur),
  }
}

// ---- Cosmological diagnostics helper ----

function analyzeCosmologySeries(input: {
  name: string
  branchingB: number
  asymptoticVolRatio: number
  meanD: readonly number[]
  maxNormErr: number
  floorWeightAtMaxD: number
  matchPartAMaxErr: number
  reversedMeanD: number
  reversedMaxAmpDiff: number
}): LongTimeCosmologySeries {
  const { meanD, branchingB, asymptoticVolRatio } = input
  const steps = meanD.length - 1
  const lnB3 = Math.log(branchingB) / 3
  const scaleA = meanD.map(d => Math.exp(lnB3 * d))

  // Linear OLS fit of <D(t)> over t = 15..steps for asymptotic ballistic drift rate v_D
  const fitStart = 15
  const nFit = steps - fitStart + 1
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0

  for (let t = fitStart; t <= steps; t++) {
    const y = meanD[t]!

    sx += t
    sy += y
    sxx += t * t
    sxy += t * y
  }

  const fitVelocityD = (nFit * sxy - sx * sy) / (nFit * sxx - sx * sx)
  const meanY = sy / nFit
  const intercept = (sy - fitVelocityD * sx) / nFit
  let ssTot = 0
  let ssRes = 0

  for (let t = fitStart; t <= steps; t++) {
    const y = meanD[t]!
    const pred = intercept + fitVelocityD * t

    ssTot += (y - meanY) * (y - meanY)
    ssRes += (y - pred) * (y - pred)
  }

  const fitR2LinearD = ssTot > 1e-30 ? 1 - ssRes / ssTot : 1
  const hubbleFromFit = lnB3 * fitVelocityD
  const hubbleAsympVolRatio = (Math.log(asymptoticVolRatio) / 3) * fitVelocityD

  // Instantaneous Hubble rate H(t) = ln(a(t+1)/a(t)) = (ln b / 3) * (<D(t+1)> - <D(t)>)
  // Exact continuum de Sitter identity with zero discretization bias on exact exp(H t):
  //   q_log(t) = -1 - dH(t) / H(t)^2,  w_eff(t) = (2 q_log(t) - 1) / 3
  // Also compute raw central finite-difference q_fd(t) = -a(t) * d2a(t) / da(t)^2, whose exact
  // discrete value on a(t) = exp(H t) is -1 / cosh^2(H / 2).
  if (branchingB <= 1) {
    return {
      name: input.name,
      branchingB,
      steps,
      maxNormErr: input.maxNormErr,
      floorWeightAtMaxD: input.floorWeightAtMaxD,
      matchPartAMaxErr: input.matchPartAMaxErr,
      reversedMeanD: input.reversedMeanD,
      reversedMaxAmpDiff: input.reversedMaxAmpDiff,
      meanDAt10: meanD[10]!,
      meanDAt20: meanD[20]!,
      meanDAt30: meanD[30]!,
      meanDAt40: meanD[40]!,
      scaleAAt10: scaleA[10]!,
      scaleAAt20: scaleA[20]!,
      scaleAAt30: scaleA[30]!,
      scaleAAt40: scaleA[40]!,
      fitVelocityD,
      fitR2LinearD,
      hubbleFromFit: 0,
      hubbleLateMean: 0,
      qLogLateMean: 0,
      qLogFinalWindowStd: 0,
      wEffLateMean: 0,
      qFdLateMean: 0,
      qFdDeSitterBenchmark: 0,
      qFdBenchmarkRelErr: 0,
      hubbleAsympVolRatio: 0,
    }
  }

  const winStart = 20
  const winEnd = steps - 2
  const hVals: number[] = []
  const qLogVals: number[] = []
  const qFdVals: number[] = []

  // Central log-Hubble H_c(t) = (1/2) ln(a(t+1)/a(t-1)) = (ln b / 3) * (<D(t+1)> - <D(t-1)>) / 2
  // Central dH_c(t) = (H_c(t+1) - H_c(t-1)) / 2
  const hCentral = (t: number): number => 0.5 * lnB3 * (meanD[t + 1]! - meanD[t - 1]!)

  for (let t = winStart; t <= winEnd; t++) {
    const ht = hCentral(t)
    const dht = 0.5 * (hCentral(t + 1) - hCentral(t - 1))
    const qLog = -1 - dht / (ht * ht)
    const da = 0.5 * (scaleA[t + 1]! - scaleA[t - 1]!)
    const d2a = scaleA[t + 1]! - 2 * scaleA[t]! + scaleA[t - 1]!
    const qFd = -(scaleA[t]! * d2a) / (da * da)

    hVals.push(ht)
    qLogVals.push(qLog)
    qFdVals.push(qFd)
  }

  const avg = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length
  const hubbleLateMean = avg(hVals)
  const qLogLateMean = avg(qLogVals)
  const qLogVar = avg(qLogVals.map(v => (v - qLogLateMean) * (v - qLogLateMean)))
  const qLogFinalWindowStd = Math.sqrt(qLogVar)
  const wEffLateMean = (2 * qLogLateMean - 1) / 3
  const qFdLateMean = avg(qFdVals)
  const cHalf = Math.cosh(0.5 * hubbleLateMean)
  const qFdDeSitterBenchmark = -1 / (cHalf * cHalf)
  const qFdBenchmarkRelErr =
    Math.abs(qFdLateMean - qFdDeSitterBenchmark) / Math.abs(qFdDeSitterBenchmark)

  return {
    name: input.name,
    branchingB,
    steps,
    maxNormErr: input.maxNormErr,
    floorWeightAtMaxD: input.floorWeightAtMaxD,
    matchPartAMaxErr: input.matchPartAMaxErr,
    reversedMeanD: input.reversedMeanD,
    reversedMaxAmpDiff: input.reversedMaxAmpDiff,
    meanDAt10: meanD[10]!,
    meanDAt20: meanD[20]!,
    meanDAt30: meanD[30]!,
    meanDAt40: meanD[40]!,
    scaleAAt10: scaleA[10]!,
    scaleAAt20: scaleA[20]!,
    scaleAAt30: scaleA[30]!,
    scaleAAt40: scaleA[40]!,
    fitVelocityD,
    fitR2LinearD,
    hubbleFromFit,
    hubbleLateMean,
    qLogLateMean,
    qLogFinalWindowStd,
    wEffLateMean,
    qFdLateMean,
    qFdDeSitterBenchmark,
    qFdBenchmarkRelErr,
    hubbleAsympVolRatio,
  }
}

// ---- Part B1: Exact infinite 7-ary frame-tree solver for {3,4,3,4} cusp (t = 0..40) ----

function buildFrameLocal3x3(weights: readonly [number, number, number], mixTheta: number | null): C2[][] {
  const uVec = weights.map(w => Math.sqrt(w / 8))
  const G: C2[][] = [0, 1, 2].map(i =>
    [0, 1, 2].map(j => {
      if (mixTheta === null) return i === j ? [1, 0] : [0, 0]

      const ur = Math.cos(mixTheta) - 1
      const ui = Math.sin(mixTheta)
      const p = uVec[i]! * uVec[j]!

      return [(i === j ? 1 : 0) + ur * p, ui * p]
    }),
  )
  const C: C2[][] = [
    [
      [C_KEEP_RE, C_KEEP_IM],
      [C_CROSS_RE, C_CROSS_IM],
      [0, 0],
    ],
    [
      [C_CROSS_RE, C_CROSS_IM],
      [C_KEEP_RE, C_KEEP_IM],
      [0, 0],
    ],
    [
      [0, 0],
      [0, 0],
      [1, 0],
    ],
  ]

  return [0, 1, 2].map(i =>
    [0, 1, 2].map(j => {
      let s: C2 = [0, 0]

      for (let k = 0; k < 3; k++) {
        s = cAdd(s, cMul(C[i]![k]!, G[k]![j]!))
      }

      return s
    }),
  )
}

function matVec3(M: C2[][], v: readonly [C2, C2, C2]): [C2, C2, C2] {
  return [0, 1, 2].map(i => {
    let s: C2 = [0, 0]

    for (let j = 0; j < 3; j++) {
      s = cAdd(s, cMul(M[i]![j]!, v[j]!))
    }

    return s
  }) as [C2, C2, C2]
}

// Solves the exact infinite {3,4,3,4} frame tree (D = 0 has (2 lat, 2 dn_L, 4 dn_P); every D >= 1 has
// (1 up, 1 dn_axis, 6 dn_trans)) via the exact causal subtree return kernel and rank-2 Gram propagation.
function runExactInfiniteFrameTree(
  name: string,
  steps: number,
  mixTheta: number | null,
  partARef: PartARuleResult,
  asymptoticVolRatio: number,
): LongTimeCosmologySeries {
  const M0 = buildFrameLocal3x3([2, 2, 4], mixTheta)
  const M1 = buildFrameLocal3x3([1, 1, 6], mixTheta)

  // Step 1: Exact causal return kernel ret[tau] for a unit pulse injected into D >= 1 in state |dn_axis>
  const subIn: [C2, C2, C2][] = []
  const subOut: [C2, C2, C2][] = []
  const ret: C2[] = []

  for (let tau = 0; tau <= steps; tau++) {
    let inUp: C2 = [0, 0]
    const inAxis: C2 = tau === 0 ? [1, 0] : [0, 0]
    let inTrans: C2 = [0, 0]

    for (let k = 0; k <= tau - 2; k++) {
      const r = ret[tau - 2 - k]!

      inUp = cAdd(inUp, cMul(r, subOut[k]![1]))
      inTrans = cAdd(inTrans, cMul(r, subOut[k]![2]))
    }

    const vIn: [C2, C2, C2] = [inUp, inAxis, inTrans]
    const vOut = matVec3(M1, vIn)

    subIn.push(vIn)
    subOut.push(vOut)
    ret.push(vOut[0])
  }

  // Step 2: Exact D = 0 evolution from the uniform 24-slot initial state (1/2, 1/2, 1/sqrt(2))
  const d0In: [C2, C2, C2][] = []
  const d0Out: [C2, C2, C2][] = []

  for (let t = 0; t <= steps; t++) {
    let inL: C2 = t === 0 ? [0.5, 0] : [0, 0]
    const inDL: C2 = t === 0 ? [0.5, 0] : d0Out[t - 1]![0]
    let inDP: C2 = t === 0 ? [Math.SQRT1_2, 0] : [0, 0]

    for (let k = 0; k <= t - 2; k++) {
      const r = ret[t - 2 - k]!

      inL = cAdd(inL, cMul(r, d0Out[k]![1]))
      inDP = cAdd(inDP, cMul(r, d0Out[k]![2]))
    }

    const vIn: [C2, C2, C2] = [inL, inDL, inDP]
    const vOut = matVec3(M0, vIn)

    d0In.push(vIn)
    d0Out.push(vOut)
  }

  // Step 3: Exact depth distribution P[t][D] via rank-2 Gram matrix propagation G_d(s1, s2)
  const T1 = steps + 1
  const idx = (i: number, j: number): number => i * T1 + j

  let gRe = new Float64Array(T1 * T1)
  let gIm = new Float64Array(T1 * T1)

  for (let s1 = 0; s1 < T1; s1++) {
    for (let s2 = 0; s2 < T1; s2++) {
      let sr = 0
      let si = 0

      for (let c = 0; c < 3; c++) {
        const p = cConjMul(subIn[s1]![c]!, subIn[s2]![c]!)

        sr += p[0]
        si += p[1]
      }

      gRe[idx(s1, s2)] = sr
      gIm[idx(s1, s2)] = si
    }
  }

  const pTable: number[][] = Array.from({ length: T1 }, () => new Array<number>(T1).fill(0))

  for (let t = 0; t < T1; t++) {
    pTable[t]![0] = cAbs2(d0In[t]![0]) + cAbs2(d0In[t]![1]) + cAbs2(d0In[t]![2])
  }

  const m1Re = new Float64Array(T1 * T1)
  const m1Im = new Float64Array(T1 * T1)
  const m2Re = new Float64Array(T1 * T1)
  const m2Im = new Float64Array(T1 * T1)

  for (let D = 1; D <= steps; D++) {
    for (let t = D; t <= steps; t++) {
      let sum = 0
      const maxK = t - D

      for (const c of [1, 2] as const) {
        for (let k1 = 0; k1 <= maxK; k1++) {
          const b1r = d0Out[k1]![c][0]
          const b1i = d0Out[k1]![c][1]
          const j1 = t - 1 - k1

          for (let k2 = 0; k2 <= maxK; k2++) {
            const b2r = d0Out[k2]![c][0]
            const b2i = d0Out[k2]![c][1]
            const j2 = t - 1 - k2
            const wr = b1r * b2r + b1i * b2i
            const wi = b1r * b2i - b1i * b2r
            const gr = gRe[idx(j1, j2)]!
            const gi = gIm[idx(j1, j2)]!

            sum += wr * gr - wi * gi
          }
        }
      }

      pTable[t]![D] = sum
    }

    if (D === steps) break

    m1Re.fill(0)
    m1Im.fill(0)
    m2Re.fill(0)
    m2Im.fill(0)

    for (let s1 = D; s1 < T1; s1++) {
      const maxK1 = s1 - D

      for (let k1 = 0; k1 <= maxK1; k1++) {
        const a1r = subOut[k1]![1][0]
        const a1i = -subOut[k1]![1][1]
        const a2r = subOut[k1]![2][0]
        const a2i = -subOut[k1]![2][1]
        const rOff = (s1 - 1 - k1) * T1
        const oOff = s1 * T1

        for (let j2 = D - 1; j2 < T1 - 1; j2++) {
          const gr = gRe[rOff + j2]!
          const gi = gIm[rOff + j2]!

          m1Re[oOff + j2] = m1Re[oOff + j2]! + a1r * gr - a1i * gi
          m1Im[oOff + j2] = m1Im[oOff + j2]! + a1r * gi + a1i * gr
          m2Re[oOff + j2] = m2Re[oOff + j2]! + a2r * gr - a2i * gi
          m2Im[oOff + j2] = m2Im[oOff + j2]! + a2r * gi + a2i * gr
        }
      }
    }

    const nextRe = new Float64Array(T1 * T1)
    const nextIm = new Float64Array(T1 * T1)

    for (let s1 = D; s1 < T1; s1++) {
      const oOff = s1 * T1

      for (let s2 = D; s2 < T1; s2++) {
        const maxK2 = s2 - D
        let sr = 0
        let si = 0

        for (let k2 = 0; k2 <= maxK2; k2++) {
          const j2 = s2 - 1 - k2
          const a1r = subOut[k2]![1][0]
          const a1i = subOut[k2]![1][1]
          const a2r = subOut[k2]![2][0]
          const a2i = subOut[k2]![2][1]
          const x1r = m1Re[oOff + j2]!
          const x1i = m1Im[oOff + j2]!
          const x2r = m2Re[oOff + j2]!
          const x2i = m2Im[oOff + j2]!

          sr += x1r * a1r - x1i * a1i + x2r * a2r - x2i * a2i
          si += x1r * a1i + x1i * a1r + x2r * a2i + x2i * a2r
        }

        nextRe[oOff + s2] = sr
        nextIm[oOff + s2] = si
      }
    }

    gRe = nextRe
    gIm = nextIm
  }

  let maxNormErr = 0
  const meanD: number[] = []

  for (let t = 0; t <= steps; t++) {
    let norm = 0
    let md = 0

    for (let d = 0; d <= t; d++) {
      const w = pTable[t]![d]!

      norm += w
      md += d * w
    }

    maxNormErr = Math.max(maxNormErr, Math.abs(norm - 1))
    meanD.push(md)
  }

  let matchPartAMaxErr = 0

  for (let t = 0; t <= 3; t++) {
    const refP = partARef.beats[t]!.pDepth

    for (let d = 0; d < 4; d++) {
      matchPartAMaxErr = Math.max(matchPartAMaxErr, Math.abs(pTable[t]![d]! - refP[d]!))
    }
  }

  return analyzeCosmologySeries({
    name,
    branchingB: 18,
    asymptoticVolRatio,
    meanD,
    maxNormErr,
    floorWeightAtMaxD: 0,
    matchPartAMaxErr,
    reversedMeanD: partARef.reversedMeanD,
    reversedMaxAmpDiff: partARef.reversedMaxAmpDiff,
  })
}

// ---- Part B2: Explicit 1D unitary depth-projected branching-tree Grover walk + flat cubic control ----

function runBranchingGroverWalk(input: {
  name: string
  dMax: number
  steps: number
  c0: number
  b0: number
  uBulk: number
  cBulk: number
  bBulk: number
  asymptoticVolRatio: number
}): LongTimeCosmologySeries {
  const { dMax, steps, c0, b0, uBulk, cBulk, bBulk } = input
  const deg0 = c0 + b0
  const degBulk = uBulk + cBulk + bBulk

  const u0L = Math.sqrt(c0 / deg0)
  const u0D = Math.sqrt(b0 / deg0)
  const uU = Math.sqrt(uBulk / degBulk)
  const uL = Math.sqrt(cBulk / degBulk)
  const uD = Math.sqrt(bBulk / degBulk)

  const up = new Float64Array(dMax + 1)
  const lat = new Float64Array(dMax + 1)
  const dn = new Float64Array(dMax + 1)

  lat[0] = u0L
  dn[0] = u0D

  const initLat0 = lat[0]
  const initDn0 = dn[0]

  const applyCoin = (
    inU: Float64Array,
    inL: Float64Array,
    inD: Float64Array,
    outU: Float64Array,
    outL: Float64Array,
    outD: Float64Array,
  ): void => {
    const dot0 = u0L * inL[0]! + u0D * inD[0]!

    outU[0] = 0
    outL[0] = 2 * dot0 * u0L - inL[0]!
    outD[0] = 2 * dot0 * u0D - inD[0]!

    for (let d = 1; d <= dMax; d++) {
      const dot = uU * inU[d]! + uL * inL[d]! + uD * inD[d]!

      outU[d] = 2 * dot * uU - inU[d]!
      outL[d] = 2 * dot * uL - inL[d]!
      outD[d] = 2 * dot * uD - inD[d]!
    }
  }

  const applyFlipFlop = (
    inU: Float64Array,
    inL: Float64Array,
    inD: Float64Array,
    outU: Float64Array,
    outL: Float64Array,
    outD: Float64Array,
  ): void => {
    outU.fill(0)
    outL.fill(0)
    outD.fill(0)

    for (let d = 0; d < dMax; d++) {
      outU[d + 1] = inD[d]!
      outD[d] = inU[d + 1]!
    }

    outD[dMax] = inD[dMax]!

    for (let d = 0; d <= dMax; d++) {
      outL[d] = inL[d]!
    }
  }

  const tmpU = new Float64Array(dMax + 1)
  const tmpL = new Float64Array(dMax + 1)
  const tmpD = new Float64Array(dMax + 1)

  const meanD: number[] = []
  let maxNormErr = 0
  let floorWeightAtMaxD = 0

  for (let t = 0; t <= steps; t++) {
    let norm = 0
    let md = 0

    for (let d = 0; d <= dMax; d++) {
      const w = up[d]! * up[d]! + lat[d]! * lat[d]! + dn[d]! * dn[d]!

      norm += w
      md += d * w
    }

    maxNormErr = Math.max(maxNormErr, Math.abs(norm - 1))
    floorWeightAtMaxD = Math.max(
      floorWeightAtMaxD,
      up[dMax]! * up[dMax]! + lat[dMax]! * lat[dMax]! + dn[dMax]! * dn[dMax]!,
    )
    meanD.push(md)

    if (t === steps) break

    applyCoin(up, lat, dn, tmpU, tmpL, tmpD)
    applyFlipFlop(tmpU, tmpL, tmpD, up, lat, dn)
  }

  // Exact 40-beat adjoint reversal: U = S_ff * G, both involutions -> U^dag = G * S_ff
  for (let t = 0; t < steps; t++) {
    applyFlipFlop(up, lat, dn, tmpU, tmpL, tmpD)
    applyCoin(tmpU, tmpL, tmpD, up, lat, dn)
  }

  let reversedMeanD = 0
  let reversedMaxAmpDiff = 0

  for (let d = 0; d <= dMax; d++) {
    const w = up[d]! * up[d]! + lat[d]! * lat[d]! + dn[d]! * dn[d]!

    reversedMeanD += d * w
    const expU = 0
    const expL = d === 0 ? initLat0 : 0
    const expD = d === 0 ? initDn0 : 0

    reversedMaxAmpDiff = Math.max(
      reversedMaxAmpDiff,
      Math.abs(up[d]! - expU),
      Math.abs(lat[d]! - expL),
      Math.abs(dn[d]! - expD),
    )
  }

  return analyzeCosmologySeries({
    name: input.name,
    branchingB: bBulk,
    asymptoticVolRatio: input.asymptoticVolRatio,
    meanD,
    maxNormErr,
    floorWeightAtMaxD,
    matchPartAMaxErr: 0,
    reversedMeanD,
    reversedMaxAmpDiff,
  })
}

export function runHorosphereCosmology(): HorosphereCosmologyResult {
  const { audit, cusp, ball, ballDepth, nD } = auditCuspGeometry()

  // Part A: Exact cached cusp (51,064 docks) + R = 3 ball (8,857 docks), t = 0..3 beats
  const cuspBare = runPartALone('cusp-bare', cusp.table, cusp.depth, nD, null)
  const cuspFgPi = runPartALone('cusp-fg-pi', cusp.table, cusp.depth, nD, Math.PI)
  const cuspFg4Pi9 = runPartALone('cusp-fg-4pi9', cusp.table, cusp.depth, nD, (4 * Math.PI) / 9)

  // Single layer-crossing line at dock 0 for M_pair(-1) so M_pair actively scatters across all 12 lines
  const layerLine0 = LINE_OF[cusp.translations.layerSlots[0]!]!
  const cuspMpairSingleLine = runPartAPairs(
    'cusp-mpair-neg1-single-line',
    cusp.table,
    cusp.cells,
    cusp.depth,
    nD,
    [layerLine0],
    Math.PI,
  )
  const allTwelveLines = Array.from({ length: LINES }, (_, i) => i)
  const cuspMpairUniform = runPartAPairs(
    'cusp-mpair-neg1-uniform-12',
    cusp.table,
    cusp.cells,
    cusp.depth,
    nD,
    allTwelveLines,
    Math.PI,
  )

  const ballBare = runPartALone('ball-r3-bare', ball.ball.table, ballDepth, nD, null)
  const ballFgPi = runPartALone('ball-r3-fg-pi', ball.ball.table, ballDepth, nD, Math.PI)

  let ballBareMaxDepthDiff = 0

  for (let t = 0; t <= 3; t++) {
    for (let d = 0; d < 4; d++) {
      ballBareMaxDepthDiff = Math.max(
        ballBareMaxDepthDiff,
        Math.abs(cuspBare.beats[t]!.pDepth[d]! - ballBare.beats[t]!.pDepth[d]!),
      )
    }
  }

  const ballFgPiWavefrontDiffT2 = Math.abs(
    cuspFgPi.beats[2]!.pDepth[2]! - ballFgPi.beats[2]!.pDepth[2]!,
  )
  const ballFgPiWavefrontDiffT3 = Math.abs(
    cuspFgPi.beats[3]!.pDepth[3]! - ballFgPi.beats[3]!.pDepth[3]!,
  )

  // Part B: Long-time radial-depth unitary evolution (t = 0..40 beats, zero floor reflection)
  const steps = 40
  const exactTreeBare = runExactInfiniteFrameTree(
    'exact-tree-bare',
    steps,
    null,
    cuspBare,
    audit.asymptoticVolRatio,
  )
  const exactTreeFgPi = runExactInfiniteFrameTree(
    'exact-tree-fg-pi',
    steps,
    Math.PI,
    cuspFgPi,
    audit.asymptoticVolRatio,
  )
  const exactTreeFg4Pi9 = runExactInfiniteFrameTree(
    'exact-tree-fg-4pi9',
    steps,
    (4 * Math.PI) / 9,
    cuspFg4Pi9,
    audit.asymptoticVolRatio,
  )

  const groverBranchingB18 = runBranchingGroverWalk({
    name: 'grover-tree-b18-u1-c5',
    dMax: 60,
    steps,
    c0: 6,
    b0: 18,
    uBulk: 1,
    cBulk: 5,
    bBulk: 18,
    asymptoticVolRatio: audit.asymptoticVolRatio,
  })

  // Flat cubic control (3D cubic lattice column: 1 down, 1 up, 4 lateral -> b = 1, N_D = 1, a(t) = 1, H = 0)
  const flatCubicControlB1 = runBranchingGroverWalk({
    name: 'flat-cubic-control-b1',
    dMax: 60,
    steps,
    c0: 4,
    b0: 1,
    uBulk: 1,
    cBulk: 4,
    bBulk: 1,
    asymptoticVolRatio: 1,
  })

  return {
    geometry: audit,
    partA: {
      cuspBare,
      cuspFgPi,
      cuspFg4Pi9,
      cuspMpairSingleLine,
      cuspMpairUniform,
      ballBare,
      ballFgPi,
      ballBareMaxDepthDiff,
      ballFgPiWavefrontDiffT2,
      ballFgPiWavefrontDiffT3,
    },
    partB: {
      exactTreeBare,
      exactTreeFgPi,
      exactTreeFg4Pi9,
      groverBranchingB18,
      flatCubicControlB1,
    },
  }
}
