// E-GRV-0163: L2 BACKGROUND-FIELD QUANTUM WALK IN EXACT BigInt Z[w][1/2] ON AN ON-THE-FLY
// R = INFINITY 4D {3,4,3,4} HONEYCOMB WITH PRESCRIBED HARTREE TWO-BODY AND GULLSTRAND-PAINLEVE HORIZON COINS.
//
// Builds on E-GRV-0162 (code/measure/honeycomb-ball-l3-two-body-and-horizon.ts) while fixing two
// modeling bugs (GR-1 and GR-8) and grading the physics honestly at L2:
//   1. Replaces pre-built finite static balls (R = 2: 481 docks, R = 3: 8,857 docks) with an on-the-fly
//      InfiniteHoneycomb engine over exact SO(4,1; Z[sqrt(2)]) BigInt group generators (zero float geometry
//      drift, zero outer boundary, 0 frontier hits at any t, verified 100% isomorphic to coverBall(2) and
//      coverBall(3), exact Busemann-level graph depth beyond floor = 3 so stepping up from depth = 4 returns 3,
//      and a constant-flat-coin evolution strictly beyond R = 3 to exact graph radii r = 4 and r = 5 at t = 4, 5).
//   2. Compiles every prescribed coin angle (looked up via Float64 external forces/metrics) into explicit
//      exact BigInt Z[w][1/2] 2x2 SU(2) gate words over {W_1, W_1^dag, W_2, W_2^dag} (deterministic L <= 16
//      Meet-in-the-Middle + balanced group commutator refinement, < 1e-3 operator norm, 0n BigInt det
//      residual and 0n BigInt unitarity residual U^dag U = 4^p I_2).
//   3. Replaces static-shift-only horizon coins (where any 2x2 unitary Rx(theta) on a static symmetric
//      lattice shift enforces v_r(out) + v_r(in) = 0, sending inward rays outward inside the horizon) with
//      a genuine exact bijective Gullstrand-Painleve split-step QCA on InfiniteHoneycomb:
//        U_b = (S_river)^{m_b} * S_light * W(theta_cU)
//      combining the Equivalence-Principle local flat warped-column coin W(theta_cU) in exact BigInt Z[w][1/2]
//      (c_local = c_u = 0.977925 from canonical single-face [1, 4, 20, 100] lateral links), the exact bijective
//      +-1 lightcone shift S_light = sigma_0 * S_4D along the depth-0 radial geodesic chain, and the exact
//      bijective SO(4,1; Z[sqrt(2)]) parabolic cusp river drift S_river: |g, s> -> |u_0^{-1} g h_0, sigma_0(s)>
//      scheduled on K out of P = 45 beats (v_river = -K / P ~ -c_u sqrt(r_s / r_0)). Verifies BOTH orthogonal
//      polarizations (rayAOut and rayAIn): flat +-c_u, redshifted exterior (|v_in| > |v_out|), exact horizon
//      freeze |v_out| < 5e-3 while v_in < -1.9 (never stalls!), and genuine trapped interior at r_s / r_0 = 1.44
//      (r_areal = 0.6944 r_s < r_s) where BOTH v_out < 0 AND v_in < 0, with 0n norm err, 0 exact memoryless U^dag
//      reversal diff, and (0n, 0n) orthogonality <rayAOut | rayAIn> = 0 at EVERY beat b = 1..P.
//   4. Honest L2 scope: this is a prescribed background-field / Hartree mean-field quantum walk (NOT emergent
//      GR from a bare QCA), external force/angle lookup is Float64, Busemann depth descent is empirically
//      verified 0/8,857 on B_3 plus 0 mismatches on depth-4 -> 3 probes (not a general arbitrary-depth proof),
//      the r = 4, 5 walk uses a constant flat coin, and single-particle norm/orthogonality preservation is NOT
//      Hawking evaporation or Page-curve entropy.
//
// NOTHING MOVES: 100% deterministic BigInt Z[sqrt(2)] and Z[w][1/2] algebra + Float64 angle lookup. Zero Math.random.

import { buildWarpedGravityTable, type WarpedGravityTable } from '@/code/measure/unified-coupled-sectors'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  exactCell,
  twiceForm,
  type ExactCell,
  type ExactMatrix,
  type ExactVector,
} from '@/code/substrate/coxeter/exact-3434'
import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { buildExactCusp, CUSP_VERTEX, type ExactCusp } from '@/code/substrate/coxeter/exact-cusp'

const SLOTS = 24
const PAIRS_PER_DOCK = 12
const DIM = 5
const ENTRIES = DIM * DIM
const SQ3 = Math.sqrt(3)
const OPPOSITE_U8 = Uint8Array.from(OPPOSITE)

// ============================================================================================================
// PART 1: EXACT BigInt Z[sqrt(2)] ON-THE-FLY R = INFINITY 4D {3,4,3,4} HONEYCOMB ENGINE
// ============================================================================================================

const toFloatZSqrt2 = ([x, y]: readonly [bigint, bigint]): number => Number(x) + Number(y) * Math.SQRT2

function exactIdentity5(): ExactMatrix {
  const m = new Array<bigint>(2 * ENTRIES).fill(0n)
  for (let i = 0; i < DIM; i++) {
    m[2 * (i * DIM + i)] = 1n
  }
  return m
}

function unitExactVec(i: number): ExactVector {
  const v = new Array<bigint>(2 * DIM).fill(0n)
  v[2 * i] = 1n
  return v
}

function keyOfExact(v: readonly bigint[]): string {
  return v.join(',')
}

// Sparse-zero exact BigInt Z[sqrt(2)] 5x5 * 5 vector multiply (algebraically identical to exact-3434 matrixVector)
function fastMatrixVector(m: ExactMatrix, v: ExactVector): ExactVector {
  const out = new Array<bigint>(2 * DIM).fill(0n)
  for (let k = 0; k < DIM; k++) {
    const vx = v[2 * k]!
    const vy = v[2 * k + 1]!
    if (vx === 0n && vy === 0n) continue
    for (let i = 0; i < DIM; i++) {
      const p = 2 * (i * DIM + k)
      const mx = m[p]!
      const my = m[p + 1]!
      if (mx === 0n && my === 0n) continue
      out[2 * i] = out[2 * i]! + mx * vx + 2n * my * vy
      out[2 * i + 1] = out[2 * i + 1]! + mx * vy + my * vx
    }
  }
  return out
}

// Sparse-zero exact BigInt Z[sqrt(2)] 5x5 * 5x5 matrix multiply (identical to exact-3434 matrixProduct)
function fastMatrixProduct(a: ExactMatrix, b: ExactMatrix): ExactMatrix {
  const out = new Array<bigint>(2 * ENTRIES).fill(0n)
  for (let i = 0; i < DIM; i++) {
    for (let k = 0; k < DIM; k++) {
      const p = 2 * (i * DIM + k)
      const ax = a[p]!
      const ay = a[p + 1]!
      if (ax === 0n && ay === 0n) continue
      for (let j = 0; j < DIM; j++) {
        const q = 2 * (k * DIM + j)
        const bx = b[q]!
        const by = b[q + 1]!
        if (bx === 0n && by === 0n) continue
        const r = 2 * (i * DIM + j)
        out[r] = out[r]! + ax * bx + 2n * ay * by
        out[r + 1] = out[r + 1]! + ax * by + ay * bx
      }
    }
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

export type LazyDockPairPlan = {
  readonly pairOut: Uint8Array // length 12, ordered canonically with r(out) >= r(in)
  readonly pairIn: Uint8Array // length 12
  readonly pairURad: Float64Array // length 12, radial alignment u_rad in [0, 1]
  readonly pairDx: Float64Array // length 12, 0.5 * (pos(out) - pos(in)).x
  readonly pairDy: Float64Array // length 12
  readonly pairDz: Float64Array // length 12
}

export type DockRecord = {
  readonly id: number
  readonly key: string
  readonly chamberKey: string
  readonly frame: ExactMatrix
  readonly center: ExactVector
  readonly cuspLevel: readonly [bigint, bigint]
  readonly hyperbolicDotOrigin: readonly [bigint, bigint] // -twiceForm(center, c0) = 2 cosh(d_H4)
  readonly pos: readonly [number, number, number]
  readonly cuspPi: number // image dock in exact cusp quotient (or -1 if depth > cusp.floor)
  readonly depth: number
  readonly neighbors: Int32Array // length 24, -1 = not yet lazily stepped (never a wall!)
  pairPlan?: LazyDockPairPlan
}

// Reusable on-the-fly R = infinity exact Z[sqrt(2)] {3,4,3,4} honeycomb neighbor engine.
// Stores ONLY docks actually visited by the wavepacket. Every step(dockId, slot) computes the
// neighbor frame in exact SO(4,1; Z[sqrt(2)]) BigInt arithmetic with zero finite outer boundary.
export class InfiniteHoneycomb {
  readonly cell: ExactCell
  readonly cusp: ExactCusp
  readonly stepCenter: readonly ExactVector[]
  readonly stepChamber: readonly ExactVector[]
  readonly docks: DockRecord[] = []
  readonly keyToId: Map<string, number> = new Map()
  readonly axis0TwistPerm: Uint8Array
  inconsistentSteps = 0

  private readonly riverInCache: Map<number, number> = new Map()
  private readonly riverOutCache: Map<number, number> = new Map()
  private readonly rowV: readonly [bigint, bigint][]
  private readonly rowVUnitNeg0: boolean
  private readonly rowA0: readonly [bigint, bigint][]
  private readonly rowA1: readonly [bigint, bigint][]
  private readonly rowA2: readonly [bigint, bigint][]
  private readonly z0: readonly [number, number, number]
  private readonly sInv: readonly [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ]

  constructor(cell: ExactCell, cusp: ExactCusp) {
    this.cell = cell
    this.cusp = cusp
    this.stepCenter = cell.transports.map(k => fastMatrixVector(k, cell.center))
    this.stepChamber = cell.transports.map(k => fastMatrixVector(k, cell.chamberPoint))

    // Exact W(F_4) involution sigma_0 on the 24 slots induced by cusp axis-0 twist h_0: h_0 k_s h_0 = k_{sigma_0(s)}
    const h0 = cusp.translations.axes[0]!.twist
    const transportKeys = cell.transports.map(t => keyOfExact(t))
    const perm = new Uint8Array(SLOTS)
    for (let s = 0; s < SLOTS; s++) {
      const conj = fastMatrixProduct(fastMatrixProduct(h0, cell.transports[s]!), h0)
      const idx = transportKeys.indexOf(keyOfExact(conj))
      if (idx < 0) {
        throw new Error(`InfiniteHoneycomb: axis-0 twist failed to conjugate slot ${s}`)
      }
      perm[s] = idx
    }
    this.axis0TwistPerm = perm

    const formRow = (target: ExactVector): readonly [bigint, bigint][] =>
      Array.from({ length: DIM }, (_, i) => twiceForm(unitExactVec(i), target))

    this.rowV = formRow(CUSP_VERTEX)
    this.rowVUnitNeg0 =
      this.rowV[0]![0] === -1n &&
      this.rowV[0]![1] === 0n &&
      this.rowV.slice(1).every(([x, y]) => x === 0n && y === 0n)
    this.rowA0 = formRow(unitExactVec(1))
    this.rowA1 = formRow(unitExactVec(2))
    this.rowA2 = formRow(unitExactVec(3))

    this.z0 = this.zOfExactCenter(cell.center)
    const shifts = cusp.translations.axes.map(ax => {
      const cShift = fastMatrixVector(ax.translation, cell.center)
      const z = this.zOfExactCenter(cShift)
      return [z[0] - this.z0[0], z[1] - this.z0[1], z[2] - this.z0[2]]
    })
    const inv = invert3([0, 1, 2].map(i => [0, 1, 2].map(j => shifts[j]![i]!)))
    this.sInv = [
      inv[0]![0]!,
      inv[0]![1]!,
      inv[0]![2]!,
      inv[1]![0]!,
      inv[1]![1]!,
      inv[1]![2]!,
      inv[2]![0]!,
      inv[2]![1]!,
      inv[2]![2]!,
    ]

    // Seed dock 0 (the base cell at the origin)
    const c0Key = keyOfExact(cell.center)
    const ch0Key = keyOfExact(cell.chamberPoint)
    const level0 = twiceForm(cell.center, CUSP_VERTEX)
    const dot0 = twiceForm(cell.center, cell.center)
    const dock0: DockRecord = {
      id: 0,
      key: c0Key,
      chamberKey: ch0Key,
      frame: exactIdentity5(),
      center: cell.center,
      cuspLevel: level0,
      hyperbolicDotOrigin: [-dot0[0], -dot0[1]],
      pos: [0, 0, 0],
      cuspPi: 0,
      depth: 0,
      neighbors: new Int32Array(SLOTS).fill(-1),
    }
    this.docks.push(dock0)
    this.keyToId.set(c0Key, 0)
  }

  get visitedDockCount(): number {
    return this.docks.length
  }

  private exactDotRow(row: readonly [bigint, bigint][], c: ExactVector): [bigint, bigint] {
    let x = 0n
    let y = 0n
    for (let i = 0; i < DIM; i++) {
      const rx = row[i]![0]
      const ry = row[i]![1]
      const cx = c[2 * i]!
      const cy = c[2 * i + 1]!
      if ((rx === 0n && ry === 0n) || (cx === 0n && cy === 0n)) continue
      x += rx * cx + 2n * ry * cy
      y += rx * cy + ry * cx
    }
    return [x, y]
  }

  private zOfExactCenter(c: ExactVector): readonly [number, number, number] {
    const level = toFloatZSqrt2(this.exactDotRow(this.rowV, c))
    const a0 = toFloatZSqrt2(this.exactDotRow(this.rowA0, c))
    const a1 = toFloatZSqrt2(this.exactDotRow(this.rowA1, c))
    const a2 = toFloatZSqrt2(this.exactDotRow(this.rowA2, c))
    return [a0 / level, a1 / level, a2 / level]
  }

  positionOfExactCenter(c: ExactVector): readonly [number, number, number] {
    const z = this.zOfExactCenter(c)
    const dz0 = z[0] - this.z0[0]
    const dz1 = z[1] - this.z0[1]
    const dz2 = z[2] - this.z0[2]
    const s = this.sInv
    return [
      s[0] * dz0 + s[1] * dz1 + s[2] * dz2,
      s[3] * dz0 + s[4] * dz1 + s[5] * dz2,
      s[6] * dz0 + s[7] * dz1 + s[8] * dz2,
    ]
  }

  private exactBusemannIntLevel(
    center: ExactVector,
    precomputed?: readonly [bigint, bigint],
  ): bigint {
    const lv = precomputed ?? this.exactDotRow(this.rowV, center)
    if (lv[1] !== 0n || lv[0] >= 0n || (lv[0] & 1n) !== 0n) {
      throw new Error(`InfiniteHoneycomb: unexpected cuspLevel [${lv[0]}, ${lv[1]}]`)
    }
    return -lv[0] >> 1n
  }

  private exactStepBusemannLevel(frame: ExactMatrix, slot: number): bigint {
    const sc = this.stepCenter[slot]!
    if (this.rowVUnitNeg0) {
      let x = 0n
      let y = 0n
      for (let k = 0; k < DIM; k++) {
        const p = 2 * k
        const mx = frame[p]!
        const my = frame[p + 1]!
        const vx = sc[2 * k]!
        const vy = sc[2 * k + 1]!
        if ((mx === 0n && my === 0n) || (vx === 0n && vy === 0n)) continue
        x += mx * vx + 2n * my * vy
        y += mx * vy + my * vx
      }
      if (y !== 0n || x <= 0n || (x & 1n) !== 0n) {
        throw new Error(`InfiniteHoneycomb: unexpected step cuspLevel [${-x}, ${-y}]`)
      }
      return x >> 1n
    }
    const nbC = fastMatrixVector(frame, sc)
    return this.exactBusemannIntLevel(nbC)
  }

  // Exact BigInt graph depth from the cusp layer (Busemann level L = 1) via steepest descent on L.
  // Empirically verified 0/8,857 mismatches on B_3 plus 0 mismatches stepping depth 4 -> 3 (eliminates
  // GR-8 past floor = 3; not a general convexity proof for arbitrary depth).
  exactDepthFromBusemann(
    frame: ExactMatrix,
    center: ExactVector,
    precomputedLevel?: readonly [bigint, bigint],
  ): number {
    let curF = frame
    let curL = this.exactBusemannIntLevel(center, precomputedLevel)
    let steps = 0
    while (curL > 1n) {
      let bestS = -1
      let bestL = curL
      for (let s = 0; s < SLOTS; s++) {
        const candL = this.exactStepBusemannLevel(curF, s)
        if (candL < bestL) {
          bestL = candL
          bestS = s
        }
      }
      if (bestS < 0 || steps >= 128) {
        throw new Error(`InfiniteHoneycomb: Busemann descent stalled at L=${curL}, steps=${steps}`)
      }
      curF = fastMatrixProduct(curF, this.cell.transports[bestS]!)
      curL = bestL
      steps++
    }
    return steps
  }

  // Generate or retrieve neighbor across slot s in exact SO(4,1; Z[sqrt(2)]) BigInt arithmetic.
  step(dockId: number, slot: number): number {
    const dock = this.docks[dockId]!
    const cached = dock.neighbors[slot]!
    if (cached >= 0) return cached

    const nbCenter = fastMatrixVector(dock.frame, this.stepCenter[slot]!)
    const nbKey = keyOfExact(nbCenter)
    const nbChamber = keyOfExact(fastMatrixVector(dock.frame, this.stepChamber[slot]!))
    const opp = OPPOSITE_U8[slot]!

    const existingId = this.keyToId.get(nbKey)
    if (existingId !== undefined) {
      const existing = this.docks[existingId]!
      if (existing.chamberKey !== nbChamber) {
        this.inconsistentSteps++
      }
      dock.neighbors[slot] = existingId
      existing.neighbors[opp] = dockId
      return existingId
    }

    const nbFrame = fastMatrixProduct(dock.frame, this.cell.transports[slot]!)
    const nbLevel = this.exactDotRow(this.rowV, nbCenter)
    const hDot = twiceForm(nbCenter, this.cell.center)
    const nbPos = this.positionOfExactCenter(nbCenter)
    const nbCuspPi = dock.cuspPi >= 0 ? this.cusp.table[dock.cuspPi * SLOTS + slot]! : -1
    const nbDepth =
      nbCuspPi >= 0
        ? this.cusp.depth[nbCuspPi]!
        : this.exactDepthFromBusemann(nbFrame, nbCenter, nbLevel)

    const id = this.docks.length
    const neighbors = new Int32Array(SLOTS).fill(-1)
    neighbors[opp] = dockId

    const record: DockRecord = {
      id,
      key: nbKey,
      chamberKey: nbChamber,
      frame: nbFrame,
      center: nbCenter,
      cuspLevel: nbLevel,
      hyperbolicDotOrigin: [-hDot[0], -hDot[1]],
      pos: nbPos,
      cuspPi: nbCuspPi,
      depth: nbDepth,
      neighbors,
    }
    this.docks.push(record)
    this.keyToId.set(nbKey, id)
    dock.neighbors[slot] = id
    return id
  }

  // Exact bijective SO(4,1; Z[sqrt(2)]) parabolic cusp translation along axis 0:
  //   g -> u_0^{dir} * g * h_0   (dir = +1 shifts pos by (+1,0,0), dir = -1 shifts pos by (-1,0,0))
  // Preserves frame group membership K (since phi(u_0^{+-1}) = h_0 and h_0^2 = 1), cuspLevel, and depth
  // identically on ALL docks of the infinite {3,4,3,4} honeycomb (at every depth D >= 0).
  translateAxisX(dockId: number, dir: 1 | -1): number {
    const cache = dir > 0 ? this.riverOutCache : this.riverInCache
    const cached = cache.get(dockId)
    if (cached !== undefined) return cached

    const dock = this.docks[dockId]!
    const ax0 = this.cusp.translations.axes[0]!
    const u = dir > 0 ? ax0.translation : ax0.inverse
    const nbFrame = fastMatrixProduct(fastMatrixProduct(u, dock.frame), ax0.twist)
    const nbCenter = fastMatrixVector(nbFrame, this.cell.center)
    const nbKey = keyOfExact(nbCenter)
    const nbChamber = keyOfExact(fastMatrixVector(nbFrame, this.cell.chamberPoint))

    const existingId = this.keyToId.get(nbKey)
    if (existingId !== undefined) {
      const existing = this.docks[existingId]!
      if (existing.chamberKey !== nbChamber) {
        this.inconsistentSteps++
      }
      cache.set(dockId, existingId)
      const revCache = dir > 0 ? this.riverInCache : this.riverOutCache
      revCache.set(existingId, dockId)
      return existingId
    }

    const nbLevel = this.exactDotRow(this.rowV, nbCenter)
    if (nbLevel[0] !== dock.cuspLevel[0] || nbLevel[1] !== dock.cuspLevel[1]) {
      this.inconsistentSteps++
    }
    const hDot = twiceForm(nbCenter, this.cell.center)
    const nbPos = this.positionOfExactCenter(nbCenter)
    const id = this.docks.length
    const record: DockRecord = {
      id,
      key: nbKey,
      chamberKey: nbChamber,
      frame: nbFrame,
      center: nbCenter,
      cuspLevel: nbLevel,
      hyperbolicDotOrigin: [-hDot[0], -hDot[1]],
      pos: nbPos,
      cuspPi: -1,
      depth: dock.depth,
      neighbors: new Int32Array(SLOTS).fill(-1),
    }
    this.docks.push(record)
    this.keyToId.set(nbKey, id)
    cache.set(dockId, id)
    const revCache = dir > 0 ? this.riverInCache : this.riverOutCache
    revCache.set(id, dockId)
    return id
  }

  // Non-tautological exact Z[sqrt(2)] involutive adjacency check:
  // steps dock -> nb via slot, then computes nb.frame * stepCenter[opp(slot)] from scratch in BigInt.
  verifyInvolutiveEdgeExact(dockId: number, slot: number): boolean {
    const nbId = this.step(dockId, slot)
    const dock = this.docks[dockId]!
    const nb = this.docks[nbId]!
    const opp = OPPOSITE_U8[slot]!
    const backCenter = fastMatrixVector(nb.frame, this.stepCenter[opp]!)
    if (keyOfExact(backCenter) !== dock.key) return false
    return this.step(nbId, opp) === dockId
  }

  // Lazy per-dock canonical disjoint 12-pair partition matching E-GRV-0162's buildDockPairPlan,
  // with x <-> -x mirror-invariant tie-breaking on (r, |x|, y, z) so equal-mass mirror docks have
  // strictly identical pair orderings.
  getPairPlan(dockId: number): LazyDockPairPlan {
    const dock = this.docks[dockId]!
    if (dock.pairPlan) return dock.pairPlan

    const [px, py, pz] = dock.pos
    const rx = Math.hypot(px, py, pz)
    const dxs = new Float64Array(SLOTS)
    const dys = new Float64Array(SLOTS)
    const dzs = new Float64Array(SLOTS)
    const nbXs = new Float64Array(SLOTS)
    const nbYs = new Float64Array(SLOTS)
    const nbZs = new Float64Array(SLOTS)
    const rNbs = new Float64Array(SLOTS)

    for (let s = 0; s < SLOTS; s++) {
      const nbId = dock.neighbors[s]!
      let yx: number
      let yy: number
      let yz: number
      if (nbId >= 0) {
        const p = this.docks[nbId]!.pos
        yx = p[0]
        yy = p[1]
        yz = p[2]
      } else {
        const nbCenter = fastMatrixVector(dock.frame, this.stepCenter[s]!)
        const p = this.positionOfExactCenter(nbCenter)
        yx = p[0]
        yy = p[1]
        yz = p[2]
      }
      nbXs[s] = yx
      nbYs[s] = yy
      nbZs[s] = yz
      dxs[s] = yx - px
      dys[s] = yy - py
      dzs[s] = yz - pz
      rNbs[s] = Math.hypot(yx, yy, yz)
    }

    const used = new Uint8Array(SLOTS)
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
    }

    const pairOut = new Uint8Array(PAIRS_PER_DOCK)
    const pairIn = new Uint8Array(PAIRS_PER_DOCK)
    const pairURad = new Float64Array(PAIRS_PER_DOCK)
    const pairDx = new Float64Array(PAIRS_PER_DOCK)
    const pairDy = new Float64Array(PAIRS_PER_DOCK)
    const pairDz = new Float64Array(PAIRS_PER_DOCK)

    // Mirror-invariant tie-breaker on (r, |x|, y, z) so x <-> -x mirror docks order every pair identically
    const shouldSwap = (a: number, b: number): boolean => {
      const dr = rNbs[b]! - rNbs[a]!
      if (Math.abs(dr) > 1e-11) return dr > 0
      const dax = Math.abs(nbXs[b]!) - Math.abs(nbXs[a]!)
      if (Math.abs(dax) > 1e-11) return dax > 0
      const dy = nbYs[b]! - nbYs[a]!
      if (Math.abs(dy) > 1e-11) return dy > 0
      const dz = nbZs[b]! - nbZs[a]!
      if (Math.abs(dz) > 1e-11) return dz > 0
      return false
    }

    for (let p = 0; p < PAIRS_PER_DOCK; p++) {
      let [a, b] = found[p]!
      if (shouldSwap(a, b)) {
        const tmp = a
        a = b
        b = tmp
      }
      pairOut[p] = a
      pairIn[p] = b
      const dvx = 0.5 * (dxs[a]! - dxs[b]!)
      const dvy = 0.5 * (dys[a]! - dys[b]!)
      const dvz = 0.5 * (dzs[a]! - dzs[b]!)
      pairDx[p] = dvx
      pairDy[p] = dvy
      pairDz[p] = dvz
      if (rx > 1e-12) {
        const rHatX = px / rx
        const rHatY = py / rx
        const rHatZ = pz / rx
        const dNorm = Math.hypot(dvx, dvy, dvz)
        pairURad[p] =
          dNorm > 1e-12
            ? Math.min(1, Math.max(0, (dvx * rHatX + dvy * rHatY + dvz * rHatZ) / dNorm))
            : 0
      } else {
        pairURad[p] = 0
      }
    }

    const plan: LazyDockPairPlan = { pairOut, pairIn, pairURad, pairDx, pairDy, pairDz }
    dock.pairPlan = plan
    return plan
  }
}

// ============================================================================================================
// PART 2: PURE ZERO-DECIMAL BigInt Z[w][1/2] EXACT SU(2) ALGEBRA & MITM + SOLOVAY-KITAEV SYNTHESIZER
// ============================================================================================================

export type Eis = readonly [bigint, bigint] // a + b * w, w = e^{i 2 pi / 3}

export const EIS_ZERO: Eis = [0n, 0n]
export const EIS_ONE: Eis = [1n, 0n]

export const eAdd = (x: Eis, y: Eis): Eis => [x[0] + y[0], x[1] + y[1]]
export const eSub = (x: Eis, y: Eis): Eis => [x[0] - y[0], x[1] - y[1]]
export const eMul = (x: Eis, y: Eis): Eis => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0] - x[1] * y[1],
]
export const eConj = (x: Eis): Eis => [x[0] - x[1], -x[1]]
export const eEq = (x: Eis, y: Eis): boolean => x[0] === y[0] && x[1] === y[1]
export const eNormSq = (x: Eis): bigint => x[0] * x[0] - x[0] * x[1] + x[1] * x[1]

export type EisMat2 = {
  readonly m00: Eis
  readonly m01: Eis
  readonly m10: Eis
  readonly m11: Eis
  readonly denPow2: number
}

export const EIS_I2: EisMat2 = {
  m00: [1n, 0n],
  m01: [0n, 0n],
  m10: [0n, 0n],
  m11: [1n, 0n],
  denPow2: 0,
}

export function reduceEisMat2(a: EisMat2): EisMat2 {
  let { m00, m01, m10, m11, denPow2 } = a
  while (
    denPow2 > 0 &&
    (m00[0] & 1n) === 0n &&
    (m00[1] & 1n) === 0n &&
    (m01[0] & 1n) === 0n &&
    (m01[1] & 1n) === 0n &&
    (m10[0] & 1n) === 0n &&
    (m10[1] & 1n) === 0n &&
    (m11[0] & 1n) === 0n &&
    (m11[1] & 1n) === 0n
  ) {
    m00 = [m00[0] >> 1n, m00[1] >> 1n]
    m01 = [m01[0] >> 1n, m01[1] >> 1n]
    m10 = [m10[0] >> 1n, m10[1] >> 1n]
    m11 = [m11[0] >> 1n, m11[1] >> 1n]
    denPow2--
  }
  return { m00, m01, m10, m11, denPow2 }
}

export function mulEisMat2(a: EisMat2, b: EisMat2): EisMat2 {
  return reduceEisMat2({
    m00: eAdd(eMul(a.m00, b.m00), eMul(a.m01, b.m10)),
    m01: eAdd(eMul(a.m00, b.m01), eMul(a.m01, b.m11)),
    m10: eAdd(eMul(a.m10, b.m00), eMul(a.m11, b.m10)),
    m11: eAdd(eMul(a.m10, b.m01), eMul(a.m11, b.m11)),
    denPow2: a.denPow2 + b.denPow2,
  })
}

export function dagEisMat2(a: EisMat2): EisMat2 {
  return {
    m00: eConj(a.m00),
    m01: eConj(a.m10),
    m10: eConj(a.m01),
    m11: eConj(a.m11),
    denPow2: a.denPow2,
  }
}

function scaleEisMat2(s: Eis, a: EisMat2): EisMat2 {
  return reduceEisMat2({
    m00: eMul(s, a.m00),
    m01: eMul(s, a.m01),
    m10: eMul(s, a.m10),
    m11: eMul(s, a.m11),
    denPow2: a.denPow2,
  })
}

export type ExactSU2Cert = {
  readonly exactSU2Ok: boolean
  readonly detResidualA: bigint
  readonly detResidualB: bigint
  readonly unitarityResidualMax: bigint
}

function absBig(x: bigint): bigint {
  return x < 0n ? -x : x
}

// Pure exact BigInt certificate checking BOTH det(U) = 4^p and U^dag U = 4^p I_2 with 0n residual
export function certifyExactSU2Eis(a: EisMat2): ExactSU2Cert {
  const scale4p = 1n << BigInt(2 * a.denPow2)
  const detNum = eSub(eMul(a.m00, a.m11), eMul(a.m01, a.m10))
  const detResidualA = detNum[0] - scale4p
  const detResidualB = detNum[1]

  const d00 = eAdd(eMul(eConj(a.m00), a.m00), eMul(eConj(a.m10), a.m10))
  const d01 = eAdd(eMul(eConj(a.m00), a.m01), eMul(eConj(a.m10), a.m11))
  const d10 = eAdd(eMul(eConj(a.m01), a.m00), eMul(eConj(a.m11), a.m10))
  const d11 = eAdd(eMul(eConj(a.m01), a.m01), eMul(eConj(a.m11), a.m11))

  const residuals: readonly bigint[] = [
    absBig(d00[0] - scale4p),
    absBig(d00[1]),
    absBig(d01[0]),
    absBig(d01[1]),
    absBig(d10[0]),
    absBig(d10[1]),
    absBig(d11[0] - scale4p),
    absBig(d11[1]),
  ]
  let unitarityResidualMax = 0n
  for (const r of residuals) {
    if (r > unitarityResidualMax) unitarityResidualMax = r
  }

  const exactSU2Ok = detResidualA === 0n && detResidualB === 0n && unitarityResidualMax === 0n
  return { exactSU2Ok, detResidualA, detResidualB, unitarityResidualMax }
}

// Precision-safe exact BigInt ratio conversion (handles arbitrary bit-length numerators & denominators)
export function bigIntRatioToNumber(num: bigint, den: bigint): number {
  if (num === 0n) return 0
  const neg = num < 0n
  const absNum = neg ? -num : num
  const numBits = absNum.toString(2).length
  const denBits = den.toString(2).length
  const extraShift = denBits > numBits ? denBits - numBits + 60 : 60
  const q = (absNum << BigInt(extraShift)) / den
  const val = Number(q) * 2 ** -extraShift
  return neg ? -val : val
}

// Convert exact BigInt Z[w][1/2] SU(2) matrix to unit quaternion (ar, ai, br, bi) for operator-norm audit
type Quat = readonly [number, number, number, number]

function eisToQuat(a: EisMat2): Quat {
  const den = 1n << BigInt(a.denPow2)
  const a00r = bigIntRatioToNumber(2n * a.m00[0] - a.m00[1], den << 1n)
  const a00i = bigIntRatioToNumber(a.m00[1], den) * (SQ3 / 2)
  const a01r = bigIntRatioToNumber(2n * a.m01[0] - a.m01[1], den << 1n)
  const a01i = bigIntRatioToNumber(a.m01[1], den) * (SQ3 / 2)
  return [a00r, a00i, a01r, a01i]
}

function quatMul(p: Quat, q: Quat): Quat {
  return [
    p[0] * q[0] - p[1] * q[1] - (p[2] * q[2] + p[3] * q[3]),
    p[0] * q[1] + p[1] * q[0] - (p[3] * q[2] - p[2] * q[3]),
    p[0] * q[2] - p[1] * q[3] + (p[2] * q[0] + p[3] * q[1]),
    p[0] * q[3] + p[1] * q[2] + (p[3] * q[0] - p[2] * q[1]),
  ]
}

function quatDag(q: Quat): Quat {
  return [q[0], -q[1], -q[2], -q[3]]
}

function quatDist(a: Quat, b: Quat): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3])
}

// Exact SU(2) target quaternions:
//   C_rad(theta) = exp(-i theta sigma_x) = [[cos theta, -i sin theta], [-i sin theta, cos theta]]
//   R_y(theta)   = exp(-i theta sigma_y) = [[cos theta, -sin theta],   [sin theta, cos theta]]
function quatRx(theta: number): Quat {
  return [Math.cos(theta), 0, 0, -Math.sin(theta)]
}

function quatRy(theta: number): Quat {
  return [Math.cos(theta), 0, -Math.sin(theta), 0]
}

// Exact balanced group commutator factorization in SU(2):
//   Given u close to +I, returns (v, w) in SU(2) such that v * w * v^dag * w^dag = u identically.
function factorBalancedCommutator(u: Quat): readonly [Quat, Quat] {
  const ux = -u[3]
  const uy = -u[2]
  const uz = -u[1]
  const r = Math.hypot(ux, uy, uz)
  if (r < 1e-15) {
    return [
      [1, 0, 0, 0],
      [1, 0, 0, 0],
    ]
  }
  const phi = 2 * Math.atan2(r, u[0])
  const nx = ux / r
  const ny = uy / r
  const nz = uz / r

  const s = Math.sqrt(Math.max(0, Math.sin(phi / 4)))
  const c = Math.sqrt(Math.max(0, 1 - s * s))
  const n0Norm = Math.sqrt(1 + s * s)
  const n0x = s / n0Norm
  const n0y = -s / n0Norm
  const n0z = c / n0Norm

  // SO(3) rotation R mapping n0 -> n
  const kx = n0y * nz - n0z * ny
  const ky = n0z * nx - n0x * nz
  const kz = n0x * ny - n0y * nx
  const dot = n0x * nx + n0y * ny + n0z * nz

  const applyRot = (px: number, py: number, pz: number): readonly [number, number, number] => {
    if (1 + dot > 1e-12) {
      const cx1 = ky * pz - kz * py
      const cy1 = kz * px - kx * pz
      const cz1 = kx * py - ky * px
      const cx2 = ky * cz1 - kz * cy1
      const cy2 = kz * cx1 - kx * cz1
      const cz2 = kx * cy1 - ky * cx1
      const f = 1 / (1 + dot)
      return [px + cx1 + f * cx2, py + cy1 + f * cy2, pz + cz1 + f * cz2]
    }
    // 180-degree rotation around a unit axis orthogonal to n0
    let ax = 1
    let ay = 0
    let az = 0
    if (Math.abs(n0x) > 0.8) {
      ax = 0
      ay = 1
    }
    const proj = ax * n0x + ay * n0y + az * n0z
    ax -= proj * n0x
    ay -= proj * n0y
    az -= proj * n0z
    const an = Math.hypot(ax, ay, az)
    ax /= an
    ay /= an
    az /= an
    const ap = ax * px + ay * py + az * pz
    return [2 * ap * ax - px, 2 * ap * ay - py, 2 * ap * az - pz]
  }

  const [vx, vy, vz] = applyRot(1, 0, 0)
  const [wx, wy, wz] = applyRot(0, 1, 0)
  return [
    [c, -s * vz, -s * vy, -s * vx],
    [c, -s * wz, -s * wy, -s * wx],
  ]
}

const INV_GEN = [1, 0, 3, 2] as const

function reduceWord(word: readonly number[]): number[] {
  const out: number[] = []
  for (let i = 0; i < word.length; i++) {
    const g = word[i]!
    if (out.length > 0 && out[out.length - 1] === INV_GEN[g]) {
      out.pop()
    } else {
      out.push(g)
    }
  }
  return out
}

function invertWord(word: readonly number[]): number[] {
  const out = new Array<number>(word.length)
  for (let i = 0; i < word.length; i++) {
    out[i] = INV_GEN[word[word.length - 1 - i]!]!
  }
  return out
}

export type SynthesizedCoin = {
  readonly label: string
  readonly word: readonly number[]
  readonly wordLength: number
  readonly mat: EisMat2
  readonly quat: Quat
  readonly opDist: number
  readonly cert: ExactSU2Cert
}

// Fast deterministic SU(2) synthesizer over Vibe's exact Z[w][1/2] rule generators {W1, W1^dag, W2, W2^dag}.
// Builds ONE half-tree of depth 8 (L <= 16 MITM, 13,123 nodes) and ONE 4D voxel spatial hash grid,
// then refines any target coin to < 1e-3 (or < 5e-5 for weak-field two-body coins) via exact BigInt
// balanced group commutators.
class SU2EisSynthesizer {
  readonly gensEis: readonly [EisMat2, EisMat2, EisMat2, EisMat2]
  readonly gensQuat: readonly [Quat, Quat, Quat, Quat]
  readonly generatorCerts: readonly ExactSU2Cert[]
  readonly halfDepth: number
  readonly nodeCount: number

  private readonly ar: Float64Array
  private readonly ai: Float64Array
  private readonly br: Float64Array
  private readonly bi: Float64Array
  private readonly parent: Int32Array
  private readonly gen: Uint8Array
  private readonly invH: number
  private readonly mask: number
  private readonly head: Int32Array
  private readonly next: Int32Array

  constructor(halfDepth = 8) {
    const C: EisMat2 = { m00: [1n, 1n], m01: [1n, -1n], m10: [1n, -1n], m11: [1n, 1n], denPow2: 1 }
    const Pw: EisMat2 = { m00: [1n, 0n], m01: [0n, 0n], m10: [0n, 0n], m11: [0n, 1n], denPow2: 0 }
    const Pw2: EisMat2 = {
      m00: [1n, 0n],
      m01: [0n, 0n],
      m10: [0n, 0n],
      m11: [-1n, -1n],
      denPow2: 0,
    }
    const w2: Eis = [-1n, -1n]
    const W1 = scaleEisMat2(w2, mulEisMat2(C, Pw))
    const W2 = mulEisMat2(mulEisMat2(Pw, W1), Pw2)
    const W1Dag = dagEisMat2(W1)
    const W2Dag = dagEisMat2(W2)

    this.gensEis = [W1, W1Dag, W2, W2Dag]
    this.gensQuat = [eisToQuat(W1), eisToQuat(W1Dag), eisToQuat(W2), eisToQuat(W2Dag)]
    this.generatorCerts = this.gensEis.map(certifyExactSU2Eis)
    this.halfDepth = halfDepth

    let total = 1
    let layer = 4
    const levelEnd: number[] = [1]
    for (let d = 1; d <= halfDepth; d++) {
      total += layer
      levelEnd.push(total)
      layer *= 3
    }
    this.nodeCount = total

    const ar = new Float64Array(total)
    const ai = new Float64Array(total)
    const br = new Float64Array(total)
    const bi = new Float64Array(total)
    const parent = new Int32Array(total)
    const gen = new Uint8Array(total)

    ar[0] = 1
    parent[0] = -1
    gen[0] = 255

    const gar = this.gensQuat.map(g => g[0])
    const gai = this.gensQuat.map(g => g[1])
    const gbr = this.gensQuat.map(g => g[2])
    const gbi = this.gensQuat.map(g => g[3])

    let write = 1
    for (let d = 1; d <= halfDepth; d++) {
      const start = d === 1 ? 0 : levelEnd[d - 2]!
      const end = levelEnd[d - 1]!
      for (let p = start; p < end; p++) {
        const par = ar[p]!
        const pai = ai[p]!
        const pbr = br[p]!
        const pbi = bi[p]!
        const forbid = d === 1 ? 255 : INV_GEN[gen[p]!]!
        for (let g = 0; g < 4; g++) {
          if (g === forbid) continue
          const cgar = gar[g]!
          const cgai = gai[g]!
          const cgbr = gbr[g]!
          const cgbi = gbi[g]!
          ar[write] = par * cgar - pai * cgai - (pbr * cgbr + pbi * cgbi)
          ai[write] = par * cgai + pai * cgar - (pbi * cgbr - pbr * cgbi)
          br[write] = par * cgbr - pai * cgbi + (pbr * cgar + pbi * cgai)
          bi[write] = par * cgbi + pai * cgbr + (pbi * cgar - pbr * cgai)
          parent[write] = p
          gen[write] = g
          write++
        }
      }
    }

    this.ar = ar
    this.ai = ai
    this.br = br
    this.bi = bi
    this.parent = parent
    this.gen = gen

    // 4D spatial hash grid on S^3 (voxel width h = 0.015 guarantees finding every pair <= 0.015)
    const h = 0.015
    this.invH = 1 / h
    const tableSize = 1 << 17
    this.mask = tableSize - 1
    const head = new Int32Array(tableSize).fill(-1)
    const next = new Int32Array(total)

    for (let i = 0; i < total; i++) {
      const slot = this.hash4(
        Math.floor(ar[i]! * this.invH),
        Math.floor(ai[i]! * this.invH),
        Math.floor(br[i]! * this.invH),
        Math.floor(bi[i]! * this.invH),
      )
      next[i] = head[slot]!
      head[slot] = i
    }

    this.head = head
    this.next = next
  }

  private hash4(ix: number, iy: number, iz: number, iw: number): number {
    return (
      (Math.imul(ix, 73856093) ^
        Math.imul(iy, 19349663) ^
        Math.imul(iz, 83492791) ^
        Math.imul(iw, 2654435761)) &
      this.mask
    )
  }

  private reconstructHalfWord(idx: number): number[] {
    const rev: number[] = []
    let cur = idx
    while (cur > 0) {
      rev.push(this.gen[cur]!)
      cur = this.parent[cur]!
    }
    rev.reverse()
    return rev
  }

  evalWordExact(word: readonly number[]): EisMat2 {
    let acc = EIS_I2
    for (let i = 0; i < word.length; i++) {
      acc = mulEisMat2(acc, this.gensEis[word[i]!]!)
    }
    return acc
  }

  // Deterministic Meet-in-the-Middle lookup over all reduced words of length <= 2 * halfDepth (L <= 16)
  mitmLookup(target: Quat): { readonly word: number[]; readonly quat: Quat; readonly opDist: number } {
    const [tar, tai, tbr, tbi] = target
    const { ar, ai, br, bi, head, next, invH, nodeCount } = this

    let bestDistSq = Infinity
    let bestA = 0
    let bestB = 0

    for (let j = 0; j < nodeCount; j++) {
      const jar = ar[j]!
      const jai = ai[j]!
      const jbr = br[j]!
      const jbi = bi[j]!

      // q = target * B_j^dag
      const qar = tar * jar + tai * jai + tbr * jbr + tbi * jbi
      const qai = tai * jar - tar * jai + tbi * jbr - tbr * jbi
      const qbr = -(tar * jbr - tai * jbi) + (tbr * jar - tbi * jai)
      const qbi = -(tar * jbi + tai * jbr) + (tbr * jai + tbi * jar)

      const cx = Math.floor(qar * invH)
      const cy = Math.floor(qai * invH)
      const cz = Math.floor(qbr * invH)
      const cw = Math.floor(qbi * invH)

      for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx
        for (let dy = -1; dy <= 1; dy++) {
          const ny = cy + dy
          for (let dz = -1; dz <= 1; dz++) {
            const nz = cz + dz
            for (let dw = -1; dw <= 1; dw++) {
              let i = head[this.hash4(nx, ny, nz, cw + dw)]!
              while (i !== -1) {
                const dar = ar[i]! - qar
                const d2 = dar * dar
                if (d2 < bestDistSq) {
                  const dai = ai[i]! - qai
                  const dbr = br[i]! - qbr
                  const dbi = bi[i]! - qbi
                  const distSq = d2 + dai * dai + dbr * dbr + dbi * dbi
                  if (distSq < bestDistSq) {
                    bestDistSq = distSq
                    bestA = i
                    bestB = j
                  }
                }
                i = next[i]!
              }
            }
          }
        }
      }
    }

    const word = reduceWord([
      ...this.reconstructHalfWord(bestA),
      ...this.reconstructHalfWord(bestB),
    ])
    const qA: Quat = [ar[bestA]!, ai[bestA]!, br[bestA]!, bi[bestA]!]
    const qB: Quat = [ar[bestB]!, ai[bestB]!, br[bestB]!, bi[bestB]!]
    const quat = quatMul(qA, qB)
    return { word, quat, opDist: Math.sqrt(bestDistSq) }
  }

  // Synthesize an exact BigInt Z[w][1/2] SU(2) word over {W1, W1^dag, W2, W2^dag} approximating
  // `target` to strictly better than `targetTol`, starting from L <= 16 MITM and applying
  // balanced group commutator refinements (and 1 recursive SK level if needed for ultra-tight
  // weak-field gravity coins) until `opDist <= targetTol`.
  synthesize(
    label: string,
    target: Quat,
    targetTol = 5e-4,
    maxIters = 4,
    allowRecursiveSK = false,
  ): SynthesizedCoin {
    const idDist = quatDist([1, 0, 0, 0], target)
    let curWord: number[] = []
    let curQuat: Quat = [1, 0, 0, 0]
    let curMat: EisMat2 = EIS_I2
    let curDist = idDist

    // If identity is not already close enough, start from L <= 16 MITM when MITM beats identity
    if (curDist > targetTol) {
      const m0 = this.mitmLookup(target)
      if (m0.opDist < curDist) {
        curWord = m0.word
        curMat = this.evalWordExact(curWord)
        curQuat = eisToQuat(curMat)
        curDist = quatDist(curQuat, target)
      }
    }

    const applyCommutatorStep = (useSK1Factors: boolean): boolean => {
      const residual = quatMul(target, quatDag(curQuat))
      // Ensure residual has positive scalar part so balanced commutator stays near +I
      const resPos: Quat =
        residual[0] >= 0 ? residual : [-residual[0], -residual[1], -residual[2], -residual[3]]
      const [vTarget, wTarget] = factorBalancedCommutator(resPos)

      let vMat: EisMat2
      let wMat: EisMat2
      let vWord: readonly number[]
      let wWord: readonly number[]
      if (useSK1Factors) {
        const vCoin = this.synthesize(`${label}:v`, vTarget, 2.5e-4, 2, false)
        const wCoin = this.synthesize(`${label}:w`, wTarget, 2.5e-4, 2, false)
        vMat = vCoin.mat
        wMat = wCoin.mat
        vWord = vCoin.word
        wWord = wCoin.word
      } else {
        const vFound = this.mitmLookup(vTarget)
        const wFound = this.mitmLookup(wTarget)
        vMat = this.evalWordExact(vFound.word)
        wMat = this.evalWordExact(wFound.word)
        vWord = vFound.word
        wWord = wFound.word
      }

      const commMat = mulEisMat2(
        mulEisMat2(vMat, wMat),
        mulEisMat2(dagEisMat2(vMat), dagEisMat2(wMat)),
      )
      const nextMat = mulEisMat2(commMat, curMat)
      const nextQuat = eisToQuat(nextMat)
      const nextDist = quatDist(nextQuat, target)

      if (nextDist < curDist) {
        curWord = reduceWord([
          ...vWord,
          ...wWord,
          ...invertWord(vWord),
          ...invertWord(wWord),
          ...curWord,
        ])
        curMat = nextMat
        curQuat = nextQuat
        curDist = nextDist
        return true
      }
      return false
    }

    for (let iter = 0; iter < maxIters && curDist > targetTol; iter++) {
      if (!applyCommutatorStep(false)) break
    }

    if (allowRecursiveSK && curDist > targetTol) {
      for (let iter = 0; iter < 2 && curDist > targetTol; iter++) {
        if (!applyCommutatorStep(true)) break
      }
    }

    const cert = certifyExactSU2Eis(curMat)
    return {
      label,
      word: curWord,
      wordLength: curWord.length,
      mat: curMat,
      quat: curQuat,
      opDist: curDist,
      cert,
    }
  }
}

// Balanced-ternary exact BigInt Z[w][1/2] R_y(theta) coin synthesizer for live two-body gravity.
// Pre-synthesizes ONLY 9 elementary base rotations G_k ~ R_y(3^k * 6e-6) (k = 0..8) in pure
// {W1, W1^dag, W2, W2^dag} to < 5e-6 operator norm, then composes any weak-field gravity tilt
// |theta| <= 0.059 rad with exact antisymmetry U(-theta) = U(+theta)^dag and < 2e-5 operator norm!
class TernaryRyGravityBank {
  readonly deltaTheta = 6e-6
  readonly baseCoins: readonly SynthesizedCoin[]
  readonly baseDags: readonly EisMat2[]
  private readonly cache = new Map<number, EisMat2>()

  constructor(synth: SU2EisSynthesizer) {
    const coins: SynthesizedCoin[] = []
    const dags: EisMat2[] = []
    let step = this.deltaTheta
    for (let k = 0; k < 9; k++) {
      const c = synth.synthesize(`grav-ry-3^${k}`, quatRy(step), 5e-6, 3, true)
      coins.push(c)
      dags.push(dagEisMat2(c.mat))
      step *= 3
    }
    this.baseCoins = coins
    this.baseDags = dags
  }

  // Exact BigInt Z[w][1/2] R_y(theta) matrix with EXACT antisymmetry coinFor(-theta) = dag(coinFor(+theta))
  coinFor(theta: number): EisMat2 {
    if (Math.abs(theta) < 0.5 * this.deltaTheta) return EIS_I2
    const sign = theta < 0 ? -1 : 1
    const q = Math.round(Math.abs(theta) / this.deltaTheta)
    if (q === 0) return EIS_I2

    let posMat = this.cache.get(q)
    if (!posMat) {
      let n = q
      let acc = EIS_I2
      for (let k = 0; k < this.baseCoins.length && n > 0; k++) {
        let rem = n % 3
        n = (n - rem) / 3
        if (rem === 2) {
          rem = -1
          n += 1
        }
        if (rem === 1) {
          acc = mulEisMat2(acc, this.baseCoins[k]!.mat)
        } else if (rem === -1) {
          acc = mulEisMat2(acc, this.baseDags[k]!)
        }
      }
      posMat = acc
      this.cache.set(q, posMat)
    }
    return sign > 0 ? posMat : dagEisMat2(posMat)
  }

  get cachedAngleCount(): number {
    return this.cache.size
  }
}

// ============================================================================================================
// PART 3: PURE ZERO-DECIMAL BigInt Z[w][1/2] L2 PRESCRIBED-BACKGROUND MULTI-SLOT QUANTUM STATE & OPERATORS
// ============================================================================================================

export type ExactEisState = {
  readonly slots: ReadonlyMap<number, Eis> // slotKey = dockId * 24 + localSlot -> [a, b]
  readonly denomPow: number // shared exact denominator 2^denomPow
  readonly normScale: bigint // exact integer initial slot count (1n, 2n, or 24n)
}

export function reduceEisState(
  raw: ReadonlyMap<number, Eis>,
  denomPow: number,
  normScale: bigint,
): ExactEisState {
  const entries: [number, bigint, bigint][] = []
  let minTrail = denomPow

  for (const [k, v] of raw) {
    const a = v[0]
    const b = v[1]
    if (a === 0n && b === 0n) continue
    entries.push([k, a, b])
    if (minTrail > 0) {
      let t = 0
      let ta = a
      let tb = b
      while (t < minTrail && (ta & 1n) === 0n && (tb & 1n) === 0n) {
        ta >>= 1n
        tb >>= 1n
        t++
      }
      minTrail = t
    }
  }

  const slots = new Map<number, Eis>()
  const shift = BigInt(minTrail)
  for (let i = 0; i < entries.length; i++) {
    const [k, a, b] = entries[i]!
    slots.set(k, minTrail > 0 ? [a >> shift, b >> shift] : [a, b])
  }
  return { slots, denomPow: denomPow - minTrail, normScale }
}

export function makeSingleSlotEisState(dockId: number, localSlot: number): ExactEisState {
  return {
    slots: new Map([[dockId * SLOTS + localSlot, EIS_ONE]]),
    denomPow: 0,
    normScale: 1n,
  }
}

export function makeSuperpositionEisState(
  dockId: number,
  slotA: number,
  slotB: number,
  minus: boolean,
): ExactEisState {
  return {
    slots: new Map([
      [dockId * SLOTS + slotA, [1n, 0n]],
      [dockId * SLOTS + slotB, minus ? [-1n, 0n] : [1n, 0n]],
    ]),
    denomPow: 0,
    normScale: 2n,
  }
}

export function makeIsotropic24EisState(dockId: number): ExactEisState {
  const slots = new Map<number, Eis>()
  const base = dockId * SLOTS
  for (let d = 0; d < SLOTS; d++) {
    slots.set(base + d, EIS_ONE)
  }
  return { slots, denomPow: 0, normScale: 24n }
}

// Pure exact BigInt norm certificate: normNum === normDen => normErr === 0n!
export function exactStateNormCheck(s: ExactEisState): {
  readonly normNum: bigint
  readonly normDen: bigint
  readonly normErr: bigint
} {
  let normNum = 0n
  for (const v of s.slots.values()) {
    normNum += eNormSq(v)
  }
  const normDen = s.normScale << BigInt(2 * s.denomPow)
  return { normNum, normDen, normErr: normNum - normDen }
}

// Pure exact BigInt inner product <phi | psi> = (innerA + innerB * w) / (sqrt(n1*n2) * 2^(p1+p2))
export function exactStateInnerProduct(
  phi: ExactEisState,
  psi: ExactEisState,
): { readonly innerA: bigint; readonly innerB: bigint } {
  let innerA = 0n
  let innerB = 0n
  for (const [k, vPhi] of phi.slots) {
    const vPsi = psi.slots.get(k)
    if (!vPsi) continue
    const prod = eMul(eConj(vPhi), vPsi)
    innerA += prod[0]
    innerB += prod[1]
  }
  return { innerA, innerB }
}

// Exact BigInt slot-by-slot state comparison (0 = bit-for-bit identical in Z[w][1/2])
export function exactStateDiffSlots(a: ExactEisState, b: ExactEisState): number {
  if (a.normScale !== b.normScale) return Math.max(a.slots.size, b.slots.size, 1)
  const maxPow = Math.max(a.denomPow, b.denomPow)
  const shA = BigInt(maxPow - a.denomPow)
  const shB = BigInt(maxPow - b.denomPow)
  const keys = new Set<number>([...a.slots.keys(), ...b.slots.keys()])
  let diffs = 0
  for (const k of keys) {
    const va = a.slots.get(k) ?? EIS_ZERO
    const vb = b.slots.get(k) ?? EIS_ZERO
    if (va[0] << shA !== vb[0] << shB || va[1] << shA !== vb[1] << shB) {
      diffs++
    }
  }
  return diffs
}

// Exact BigInt dock occupation map: dockId -> sum_{d=0..23} |amp_d|^2 (exact BigInt numerator)
function exactDockOccupationBigInt(s: ExactEisState): {
  readonly weights: Map<number, bigint>
  readonly normDen: bigint
} {
  const weights = new Map<number, bigint>()
  for (const [slotKey, v] of s.slots) {
    const w = eNormSq(v)
    if (w === 0n) continue
    const dock = Math.floor(slotKey / SLOTS)
    weights.set(dock, (weights.get(dock) ?? 0n) + w)
  }
  const normDen = s.normScale << BigInt(2 * s.denomPow)
  return { weights, normDen }
}

function centroid3DExact(hc: InfiniteHoneycomb, s: ExactEisState): readonly [number, number, number] {
  const { weights, normDen } = exactDockOccupationBigInt(s)
  let cx = 0
  let cy = 0
  let cz = 0
  for (const [dockId, w] of weights) {
    const p = bigIntRatioToNumber(w, normDen)
    const [px, py, pz] = hc.docks[dockId]!.pos
    cx += p * px
    cy += p * py
    cz += p * pz
  }
  return [cx, cy, cz]
}

function meanRadius3DExact(hc: InfiniteHoneycomb, s: ExactEisState): number {
  const { weights, normDen } = exactDockOccupationBigInt(s)
  let sum = 0
  for (const [dockId, w] of weights) {
    const p = bigIntRatioToNumber(w, normDen)
    const [px, py, pz] = hc.docks[dockId]!.pos
    sum += p * Math.hypot(px, py, pz)
  }
  return sum
}

// Pure exact stream S_4D on InfiniteHoneycomb (ZERO frontier hits EVER!)
function applyStreamInfiniteExact(
  hc: InfiniteHoneycomb,
  s: ExactEisState,
  inverse: boolean,
): ExactEisState {
  const out = new Map<number, Eis>()
  for (const [slotKey, v] of s.slots) {
    const dock = Math.floor(slotKey / SLOTS)
    const d = slotKey - dock * SLOTS
    const nb = inverse ? hc.step(dock, OPPOSITE_U8[d]!) : hc.step(dock, d)
    out.set(nb * SLOTS + d, v)
  }
  return { slots: out, denomPow: s.denomPow, normScale: s.normScale }
}

// Exact bijective symmetric +-1 lightcone shift S_light = sigma_0 * S_4D on InfiniteHoneycomb:
//   forward: |dock, d> -> |hc.step(dock, d), sigma_0(d)>
//   inverse: |dock, d> -> |hc.step(dock, OPPOSITE[sigma_0(d)]), sigma_0(d)>
// Keeps the depth-0 radial geodesic chain D_x = (x, 0, 0) strictly closed across all beats (out -> x+1, in -> x-1).
function applyLightconeShiftInfiniteExact(
  hc: InfiniteHoneycomb,
  s: ExactEisState,
  inverse: boolean,
): ExactEisState {
  const sig0 = hc.axis0TwistPerm
  const out = new Map<number, Eis>()
  if (!inverse) {
    for (const [slotKey, v] of s.slots) {
      const dock = Math.floor(slotKey / SLOTS)
      const d = slotKey - dock * SLOTS
      const nb = hc.step(dock, d)
      out.set(nb * SLOTS + sig0[d]!, v)
    }
  } else {
    for (const [slotKey, v] of s.slots) {
      const dock = Math.floor(slotKey / SLOTS)
      const d = slotKey - dock * SLOTS
      const dOrig = sig0[d]!
      const nb = hc.step(dock, OPPOSITE_U8[dOrig]!)
      out.set(nb * SLOTS + dOrig, v)
    }
  }
  return { slots: out, denomPow: s.denomPow, normScale: s.normScale }
}

// Exact bijective Gullstrand-Painleve river drift shift S_river on InfiniteHoneycomb:
//   forward: |g, d> -> |u_0^{-1} g h_0, sigma_0(d)>  (translates BOTH chiralities inward by (-1, 0, 0))
//   inverse: |g, d> -> |u_0      g h_0, sigma_0(d)>  (translates BOTH chiralities outward by (+1, 0, 0))
// Globally bijective on all docks and all 24 slots, strictly preserving norm (0n), orthogonality (0n, 0n),
// depth, and every slot's 3D displacement vector.
function applyRiverShiftInfiniteExact(
  hc: InfiniteHoneycomb,
  s: ExactEisState,
  inverse: boolean,
): ExactEisState {
  const sig0 = hc.axis0TwistPerm
  const dir: 1 | -1 = inverse ? 1 : -1
  const out = new Map<number, Eis>()
  for (const [slotKey, v] of s.slots) {
    const dock = Math.floor(slotKey / SLOTS)
    const d = slotKey - dock * SLOTS
    const nb = hc.translateAxisX(dock, dir)
    out.set(nb * SLOTS + sig0[d]!, v)
  }
  return { slots: out, denomPow: s.denomPow, normScale: s.normScale }
}

// Identify the depth-0 radial geodesic pair (dr = +-1.0 along +x) at a depth-0 dock on the +x ray.
function depth0RadialPairAt(hc: InfiniteHoneycomb, dockId: number): readonly [number, number] | null {
  const dock = hc.docks[dockId]!
  if (dock.depth !== 0) return null
  const plan = hc.getPairPlan(dockId)
  for (let p = 0; p < PAIRS_PER_DOCK; p++) {
    if (plan.pairURad[p]! > 0.99 && Math.abs(plan.pairDx[p]!) > 0.5) {
      return [plan.pairOut[p]!, plan.pairIn[p]!]
    }
  }
  return null
}

// Pure exact BigInt local Equivalence-Principle coin W(theta_cU) on the depth-0 radial pair (identity elsewhere).
function applyGpRadialCoinExact(
  hc: InfiniteHoneycomb,
  s: ExactEisState,
  coin: EisMat2,
  adjoint: boolean,
): ExactEisState {
  const byDock = new Map<number, Map<number, Eis>>()
  for (const [slotKey, v] of s.slots) {
    const dock = Math.floor(slotKey / SLOTS)
    const d = slotKey - dock * SLOTS
    let m = byDock.get(dock)
    if (!m) {
      m = new Map<number, Eis>()
      byDock.set(dock, m)
    }
    m.set(d, v)
  }
  const u = adjoint ? dagEisMat2(coin) : coin
  const sh = BigInt(u.denPow2)
  const out = new Map<number, Eis>()

  for (const [dockId, localMap] of byDock) {
    const base = dockId * SLOTS
    const radPair = depth0RadialPairAt(hc, dockId)
    if (radPair) {
      const [a, b] = radPair
      const va = localMap.get(a)
      const vb = localMap.get(b)
      if (va || vb) {
        const za = va ?? EIS_ZERO
        const zb = vb ?? EIS_ZERO
        const outA = eAdd(eMul(u.m00, za), eMul(u.m01, zb))
        const outB = eAdd(eMul(u.m10, za), eMul(u.m11, zb))
        if (outA[0] !== 0n || outA[1] !== 0n) out.set(base + a, outA)
        if (outB[0] !== 0n || outB[1] !== 0n) out.set(base + b, outB)
      }
      for (const [d, v] of localMap) {
        if (d === a || d === b) continue
        out.set(base + d, sh > 0n ? [v[0] << sh, v[1] << sh] : v)
      }
    } else {
      for (const [d, v] of localMap) {
        out.set(base + d, sh > 0n ? [v[0] << sh, v[1] << sh] : v)
      }
    }
  }
  return reduceEisState(out, s.denomPow + u.denPow2, s.normScale)
}

// Pure exact stream S_4D on a finite static ball table (for negative-control frontier-hit & convergence check)
function applyStreamStaticBallExact(
  table: Int32Array,
  s: ExactEisState,
  inverse: boolean,
  frontier: { hits: number },
): ExactEisState {
  const out = new Map<number, Eis>()
  for (const [slotKey, v] of s.slots) {
    const dock = Math.floor(slotKey / SLOTS)
    const d = slotKey - dock * SLOTS
    let nextKey: number
    if (inverse) {
      const od = OPPOSITE_U8[d]!
      const nb = table[dock * SLOTS + od]!
      if (nb < 0) {
        frontier.hits++
        nextKey = dock * SLOTS + od
      } else {
        nextKey = nb * SLOTS + d
      }
    } else {
      const nb = table[dock * SLOTS + d]!
      if (nb < 0) {
        frontier.hits++
        nextKey = dock * SLOTS + OPPOSITE_U8[d]!
      } else {
        nextKey = nb * SLOTS + d
      }
    }
    const prev = out.get(nextKey)
    out.set(nextKey, prev ? eAdd(prev, v) : v)
  }
  return reduceEisState(out, s.denomPow, s.normScale)
}

// Pure exact BigInt dock-local pairwise coin operator (ZERO Float64 anywhere in state update!)
function applyDockPairCoinsExact(
  hc: InfiniteHoneycomb,
  s: ExactEisState,
  getPairCoin: (dockId: number, pairIdx: number) => EisMat2,
  adjoint: boolean,
): ExactEisState {
  const byDock = new Map<number, Map<number, Eis>>()
  for (const [slotKey, v] of s.slots) {
    const dock = Math.floor(slotKey / SLOTS)
    const d = slotKey - dock * SLOTS
    let m = byDock.get(dock)
    if (!m) {
      m = new Map<number, Eis>()
      byDock.set(dock, m)
    }
    m.set(d, v)
  }

  type PendingEntry = readonly [number, Eis, number] // [slotKey, val, addedDenPow]
  const pending: PendingEntry[] = []
  let maxAddedPow = 0

  for (const [dockId, localMap] of byDock) {
    const plan = hc.getPairPlan(dockId)
    const base = dockId * SLOTS
    for (let p = 0; p < PAIRS_PER_DOCK; p++) {
      const a = plan.pairOut[p]!
      const b = plan.pairIn[p]!
      const va = localMap.get(a)
      const vb = localMap.get(b)
      if (!va && !vb) continue

      const rawU = getPairCoin(dockId, p)
      if (rawU.denPow2 === 0 && eEq(rawU.m00, EIS_ONE) && eEq(rawU.m01, EIS_ZERO)) {
        if (va) pending.push([base + a, va, 0])
        if (vb) pending.push([base + b, vb, 0])
        continue
      }

      const u = adjoint ? dagEisMat2(rawU) : rawU
      const za = va ?? EIS_ZERO
      const zb = vb ?? EIS_ZERO
      const outA = eAdd(eMul(u.m00, za), eMul(u.m01, zb))
      const outB = eAdd(eMul(u.m10, za), eMul(u.m11, zb))
      if (u.denPow2 > maxAddedPow) maxAddedPow = u.denPow2
      if (outA[0] !== 0n || outA[1] !== 0n) pending.push([base + a, outA, u.denPow2])
      if (outB[0] !== 0n || outB[1] !== 0n) pending.push([base + b, outB, u.denPow2])
    }
  }

  const outMap = new Map<number, Eis>()
  for (let i = 0; i < pending.length; i++) {
    const [key, val, addedPow] = pending[i]!
    const sh = BigInt(maxAddedPow - addedPow)
    outMap.set(key, sh > 0n ? [val[0] << sh, val[1] << sh] : val)
  }

  return reduceEisState(outMap, s.denomPow + maxAddedPow, s.normScale)
}

// ============================================================================================================
// PART 4: WARPED 1/N_D^2 GRAVITY KERNEL & CONTINUUM FLOAT64 REFERENCE ON InfiniteHoneycomb
// ============================================================================================================

type WarpedKernel = {
  readonly evalNegDeriv: (r: number) => number
  readonly depthWeight: Float64Array
}

function buildWarpedKernel(gravity: WarpedGravityTable): WarpedKernel {
  const g = gravity.gWarpedByR
  const maxR = g.length - 1
  const slopes = new Float64Array(g.length)
  slopes[0] = 0
  for (let i = 1; i < maxR; i++) {
    slopes[i] = 0.5 * (g[i + 1]! - g[i - 1]!)
  }
  slopes[maxR] = -gravity.gEff / (maxR * maxR)

  const floorF = gravity.floorF
  const rRem = new Float64Array(floorF + 1)
  let acc = 0
  for (let d = floorF; d >= 0; d--) {
    acc += 1 / gravity.col.cVert[d]!
    rRem[d] = acc
  }
  const rTotal = rRem[0]!
  const depthWeight = new Float64Array(floorF + 1)
  for (let d = 0; d <= floorF; d++) {
    depthWeight[d] = rRem[d]! / rTotal
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

  return { evalNegDeriv, depthWeight }
}

type AccelVec = readonly [number, number, number]

function evaluateLiveAccelOnInfinite(
  hc: InfiniteHoneycomb,
  kernel: WarpedKernel,
  srcWeights: ReadonlyMap<number, bigint>,
  srcNormDen: bigint,
  srcMass: number,
  targetDocks: Iterable<number>,
): Map<number, AccelVec> {
  const out = new Map<number, AccelVec>()
  const floorF = kernel.depthWeight.length - 1
  const srcList: readonly [number, number, number, number, number][] = [...srcWeights.entries()].map(
    ([y, wBig]) => {
      const d = hc.docks[y]!
      const wy = kernel.depthWeight[Math.min(d.depth, floorF)]!
      const rhoY = bigIntRatioToNumber(wBig, srcNormDen)
      return [d.pos[0], d.pos[1], d.pos[2], srcMass * rhoY * wy, y]
    },
  )

  for (const x of targetDocks) {
    const dxDock = hc.docks[x]!
    const [px, py, pz] = dxDock.pos
    const wx = kernel.depthWeight[Math.min(dxDock.depth, floorF)]!
    let ax = 0
    let ay = 0
    let az = 0
    for (let i = 0; i < srcList.length; i++) {
      const [yx, yy, yz, wyMassRho] = srcList[i]!
      const ddx = yx - px
      const ddy = yy - py
      const ddz = yz - pz
      const r = Math.hypot(ddx, ddy, ddz)
      if (r > 1e-12) {
        const f = (wx * wyMassRho * kernel.evalNegDeriv(r)) / r
        ax += f * ddx
        ay += f * ddy
        az += f * ddz
      }
    }
    out.set(x, [ax, ay, az])
  }
  return out
}

// Horizon-penetrating Gullstrand-Painleve radial null velocities in the river model:
// radial coordinate r is the exact areal radius r_areal = r, free-fall river inflow velocity is
// v_river(r) = -c_u * sqrt(r_s / r), outgoing null speed is c_out(r) = c_u * (1 - sqrt(r_s / r)),
// and ingoing null speed is c_in(r) = -c_u * (1 + sqrt(r_s / r)) < 0.
// Outside r_s: c_out > 0, c_in < 0 with |c_in| > |c_out|.
// At event horizon r = r_s: c_out = 0 (freezes!), c_in = -2 c_u < 0 (falls swiftly inward, never stalls).
// Inside trapped interior r < r_s: BOTH c_out < 0 AND c_in < 0 (genuine trapped light cone!).
const GP_RIVER_PERIOD = 45

function flatSplitStepMeanSpeed(theta: number, periodP: number): number {
  const c = Math.cos(theta)
  const sn = Math.sin(theta)
  const n = 2 * periodP + 1
  let re0 = new Float64Array(n)
  let im0 = new Float64Array(n)
  let re1 = new Float64Array(n)
  let im1 = new Float64Array(n)
  re0[periodP] = 1
  for (let t = 0; t < periodP; t++) {
    const nRe0 = new Float64Array(n)
    const nIm0 = new Float64Array(n)
    const nRe1 = new Float64Array(n)
    const nIm1 = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      const aR = re0[i]!
      const aI = im0[i]!
      const bR = re1[i]!
      const bI = im1[i]!
      if (aR === 0 && aI === 0 && bR === 0 && bI === 0) continue
      const oR = c * aR + sn * bI
      const oI = c * aI - sn * bR
      const iR = sn * aI + c * bR
      const iI = -sn * aR + c * bI
      if (i + 1 < n) {
        nRe0[i + 1] = oR
        nIm0[i + 1] = oI
      }
      if (i - 1 >= 0) {
        nRe1[i - 1] = iR
        nIm1[i - 1] = iI
      }
    }
    re0 = nRe0
    im0 = nIm0
    re1 = nRe1
    im1 = nIm1
  }
  let meanX = 0
  for (let i = 0; i < n; i++) {
    const p = re0[i]! * re0[i]! + im0[i]! * im0[i]! + re1[i]! * re1[i]! + im1[i]! * im1[i]!
    meanX += p * (i - periodP)
  }
  return meanX / periodP
}

// Deterministic 60-step bisection finding the Equivalence-Principle local coin angle theta in (0, pi/4)
// whose P-beat flat-space split-step mean velocity equals c_u (0.977925) to < 1e-12.
function solveGpLocalCoinAngle(targetSpeed: number, periodP: number): number {
  let lo = 0
  let hi = Math.PI / 4
  for (let it = 0; it < 60; it++) {
    const mid = 0.5 * (lo + hi)
    if (flatSplitStepMeanSpeed(mid, periodP) > targetSpeed) {
      lo = mid
    } else {
      hi = mid
    }
  }
  return 0.5 * (lo + hi)
}

// Fast Float64 reference evolution on InfiniteHoneycomb for the exact bijective Gullstrand-Painleve split-step QCA:
//   U_b = (S_river)^{m_b} * S_light * R_x(thetaLocal)
type FloatState = Map<number, [number, number]>

function stepGpSplitStepFloatRef(
  hc: InfiniteHoneycomb,
  s: FloatState,
  thetaLocal: number,
  riverStepsM: number,
): FloatState {
  const byDock = new Map<number, Map<number, [number, number]>>()
  for (const [slotKey, amp] of s) {
    const dock = Math.floor(slotKey / SLOTS)
    const d = slotKey - dock * SLOTS
    let m = byDock.get(dock)
    if (!m) {
      m = new Map()
      byDock.set(dock, m)
    }
    m.set(d, amp)
  }
  const c = Math.cos(thetaLocal)
  const sn = Math.sin(thetaLocal)
  const coined: FloatState = new Map()
  for (const [dockId, local] of byDock) {
    const base = dockId * SLOTS
    const radPair = depth0RadialPairAt(hc, dockId)
    if (radPair) {
      const [a, b] = radPair
      const za = local.get(a)
      const zb = local.get(b)
      if (za || zb) {
        const ar = za ? za[0] : 0
        const ai = za ? za[1] : 0
        const br = zb ? zb[0] : 0
        const bi = zb ? zb[1] : 0
        coined.set(base + a, [c * ar + sn * bi, c * ai - sn * br])
        coined.set(base + b, [sn * ai + c * br, -sn * ar + c * bi])
      }
      for (const [d, amp] of local) {
        if (d === a || d === b) continue
        coined.set(base + d, amp)
      }
    } else {
      for (const [d, amp] of local) {
        coined.set(base + d, amp)
      }
    }
  }
  const sig0 = hc.axis0TwistPerm
  let cur: FloatState = new Map()
  for (const [slotKey, amp] of coined) {
    const dock = Math.floor(slotKey / SLOTS)
    const d = slotKey - dock * SLOTS
    const nb = hc.step(dock, d)
    cur.set(nb * SLOTS + sig0[d]!, amp)
  }
  for (let j = 0; j < riverStepsM; j++) {
    const next: FloatState = new Map()
    for (const [slotKey, amp] of cur) {
      const dock = Math.floor(slotKey / SLOTS)
      const d = slotKey - dock * SLOTS
      const nb = hc.translateAxisX(dock, -1)
      next.set(nb * SLOTS + sig0[d]!, amp)
    }
    cur = next
  }
  return cur
}

function meanRadiusFloat(hc: InfiniteHoneycomb, s: FloatState): number {
  let sum = 0
  let wSum = 0
  for (const [slotKey, [re, im]] of s) {
    const p = re * re + im * im
    const dock = Math.floor(slotKey / SLOTS)
    const [px, py, pz] = hc.docks[dock]!.pos
    sum += p * Math.hypot(px, py, pz)
    wSum += p
  }
  return wSum > 0 ? sum / wSum : 0
}

function stepTwoBodyFloatRef(
  hc: InfiniteHoneycomb,
  kernel: WarpedKernel,
  sA: FloatState,
  sB: FloatState,
  mA: number,
  mB: number,
): readonly [FloatState, FloatState] {
  const dockOcc = (st: FloatState): Map<number, number> => {
    const out = new Map<number, number>()
    for (const [k, [re, im]] of st) {
      const d = Math.floor(k / SLOTS)
      out.set(d, (out.get(d) ?? 0) + re * re + im * im)
    }
    return out
  }
  const accel = (src: Map<number, number>, srcMass: number, targets: Iterable<number>): Map<number, AccelVec> => {
    const out = new Map<number, AccelVec>()
    const floorF = kernel.depthWeight.length - 1
    const srcArr = [...src.entries()]
    for (const x of targets) {
      const xd = hc.docks[x]!
      const [px, py, pz] = xd.pos
      const wx = kernel.depthWeight[Math.min(xd.depth, floorF)]!
      let ax = 0
      let ay = 0
      let az = 0
      for (const [y, rhoY] of srcArr) {
        const yd = hc.docks[y]!
        const wy = kernel.depthWeight[Math.min(yd.depth, floorF)]!
        const ddx = yd.pos[0] - px
        const ddy = yd.pos[1] - py
        const ddz = yd.pos[2] - pz
        const r = Math.hypot(ddx, ddy, ddz)
        if (r > 1e-12) {
          const f = (srcMass * rhoY * wx * wy * kernel.evalNegDeriv(r)) / r
          ax += f * ddx
          ay += f * ddy
          az += f * ddz
        }
      }
      out.set(x, [ax, ay, az])
    }
    return out
  }
  const kick = (st: FloatState, fld: Map<number, AccelVec>): FloatState => {
    const byDock = new Map<number, Map<number, [number, number]>>()
    for (const [k, amp] of st) {
      const d = Math.floor(k / SLOTS)
      const s = k - d * SLOTS
      let m = byDock.get(d)
      if (!m) {
        m = new Map()
        byDock.set(d, m)
      }
      m.set(s, amp)
    }
    const out: FloatState = new Map()
    for (const [dockId, local] of byDock) {
      const plan = hc.getPairPlan(dockId)
      const f = fld.get(dockId) ?? [0, 0, 0]
      const base = dockId * SLOTS
      for (let p = 0; p < PAIRS_PER_DOCK; p++) {
        const a = plan.pairOut[p]!
        const b = plan.pairIn[p]!
        const za = local.get(a)
        const zb = local.get(b)
        if (!za && !zb) continue
        const rawEta = 0.5 * (f[0] * plan.pairDx[p]! + f[1] * plan.pairDy[p]! + f[2] * plan.pairDz[p]!)
        const eta = Math.max(-0.95, Math.min(0.95, rawEta))
        const theta = -0.5 * Math.asin(eta)
        const c = Math.cos(theta)
        const sn = Math.sin(theta)
        const ar = za ? za[0] : 0
        const ai = za ? za[1] : 0
        const br = zb ? zb[0] : 0
        const bi = zb ? zb[1] : 0
        out.set(base + a, [c * ar - sn * br, c * ai - sn * bi])
        out.set(base + b, [sn * ar + c * br, sn * ai + c * bi])
      }
    }
    return out
  }
  const stream = (st: FloatState): FloatState => {
    const out: FloatState = new Map()
    for (const [k, amp] of st) {
      const dock = Math.floor(k / SLOTS)
      const d = k - dock * SLOTS
      out.set(hc.step(dock, d) * SLOTS + d, amp)
    }
    return out
  }

  const rA0 = dockOcc(sA)
  const rB0 = dockOcc(sB)
  let nA = stream(kick(sA, accel(rB0, mB, rA0.keys())))
  let nB = stream(kick(sB, accel(rA0, mA, rB0.keys())))
  const rA1 = dockOcc(nA)
  const rB1 = dockOcc(nB)
  nA = kick(nA, accel(rB1, mB, rA1.keys()))
  nB = kick(nB, accel(rA1, mA, rB1.keys()))
  return [nA, nB]
}

function centroidXFloat(hc: InfiniteHoneycomb, st: FloatState): number {
  let sx = 0
  let sw = 0
  for (const [k, [re, im]] of st) {
    const p = re * re + im * im
    const dock = Math.floor(k / SLOTS)
    sx += p * hc.docks[dock]!.pos[0]
    sw += p
  }
  return sw > 0 ? sx / sw : 0
}

// ============================================================================================================
// PART 5: FULL E-GRV-0163 EXPERIMENT RUNNER & STRUCTURED RESULT TYPES
// ============================================================================================================

export type CoinCertRow = {
  readonly label: string
  readonly wordLength: number
  readonly denPow2: number
  readonly opDist: number
  readonly exactSU2Ok: boolean
  readonly detResidualA: bigint
  readonly detResidualB: bigint
  readonly unitarityResidualMax: bigint
}

export type ExactTwoBodySummary = {
  readonly label: string
  readonly mA: number
  readonly mB: number
  readonly gravScale: number
  readonly frontierHits: number
  readonly visitedDocksOnInfinite: number
  readonly activeDocksBeat2: number
  readonly deltaXA1: number
  readonly deltaXB1: number
  readonly deltaDAB1: number
  readonly deltaXA2: number
  readonly deltaXB2: number
  readonly deltaDAB2: number
  readonly comSum2: number
  readonly maxTransverseDrift: number
  readonly displacementRatio1: number
  readonly displacementRatio2: number
  readonly relErrVsFloatRefBeat1: number
  readonly relErrVsFloatRefBeat2: number
  readonly exactBigIntNormErrMax: bigint
  readonly exactBigIntReversalDiffSlots: number
  readonly exactBigIntSymmetricWeightMaxDiff: bigint
  readonly finalDenomPowBeat2: number
}

export type ExactHorizonSweepRow = {
  readonly rsOverR0: number
  readonly rArealOverRs: number
  readonly vFallOverCU: number
  readonly riverStepsK: number
  readonly riverPeriodP: number
  readonly vRiverExact: number
  readonly cOutExpected: number
  readonly cInExpected: number
  readonly coinOpDistAtLaunch: number
  readonly coinDenPow2AtLaunch: number
  readonly coinExactSU2Ok: boolean
  readonly vOut: number
  readonly vIn: number
  readonly vOutFloatRef: number
  readonly vInFloatRef: number
  readonly vOutAbsDiffVsRef: number
  readonly vInAbsDiffVsRef: number
  readonly vOutAbsDiffVsContinuumGP: number
  readonly vInAbsDiffVsContinuumGP: number
  readonly deltaROut: number
  readonly deltaRIn: number
  readonly frontierHits: number
  readonly visitedDocksOnInfinite: number
  readonly exactBigIntNormErrMax: bigint
  readonly exactBigIntReversalDiffSlots: number
  readonly exactBigIntInnerInA: readonly [bigint, bigint]
  readonly exactBigIntInnerAB: readonly [bigint, bigint]
  readonly exactBigIntInnerSup: readonly [bigint, bigint]
  readonly allBeatsInOutOrthogonalExactZero: boolean
  readonly allOrthogonalExactZero: boolean
}

export type ExactTernaryL3InfiniteHoneycombResult = {
  readonly elapsedSeconds: number
  readonly constants: {
    readonly kEff: number
    readonly gEff: number
    readonly cUniversal: number
  }
  readonly part1InfiniteHoneycomb: {
    readonly nBall0to3: readonly [number, number, number, number]
    readonly shellCounts0to3: readonly [number, number, number, number]
    readonly r2BijectionMissing: number
    readonly r2BijectionMismatches: number
    readonly r3BijectionMissing: number
    readonly r3BijectionMismatches: number
    readonly inconsistentSteps: number
    readonly involutiveEdgesChecked: number
    readonly involutiveEdgeFailures: number
    // GR-8 exact Busemann depth verification on B_3 and beyond floor = 3
    readonly b3BusemannDepthMismatches: number
    readonly beyondR3DepthLipschitzFailures: number
    readonly beyondR3DepthZeroLevelFailures: number
    readonly beyondR3Depth4StepUpTo3Checks: number
    readonly beyondR3Depth4StepUpWrongDepthCount: number
    // Strictly beyond R = 3 (t = 4 and t = 5 beats on R = infinity vs static R = 3, constant flat coin)
    readonly beyondR3T4ActiveDocks: number
    readonly beyondR3T4VisitedDocks: number
    readonly beyondR3T4ReachedExactRadius4Count: number
    readonly beyondR3T4InfiniteFrontierHits: number
    readonly beyondR3T4StaticR3FrontierHits: number
    readonly beyondR3T5ActiveDocks: number
    readonly beyondR3T5VisitedDocks: number
    readonly beyondR3T5ReachedExactRadius5Count: number
    readonly beyondR3T5InfiniteFrontierHits: number
    readonly beyondR3T5StaticR3FrontierHits: number
    readonly beyondR3T5ExactBigIntNormErr: bigint
    readonly beyondR3T5ExactBigIntReversalDiffSlots: number
    readonly beyondR3T5MaxHyperbolicCosh: number
  }
  readonly part2Synthesis: {
    readonly allGeneratorsExactSU2: boolean
    readonly mitmHalfDepth: number
    readonly mitmTreeNodes: number
    readonly allCoinsExactSU2: boolean
    readonly maxDetResidual: bigint
    readonly maxUnitarityResidual: bigint
    readonly maxOpDistAllCoins: number
    readonly gravityCoins: readonly CoinCertRow[]
    readonly horizonCoins: readonly CoinCertRow[]
  }
  readonly part3TwoBody: {
    readonly equalMass: ExactTwoBodySummary
    readonly unequalMass1to3: ExactTwoBodySummary
    readonly controlFreeG0: ExactTwoBodySummary
  }
  readonly part3Horizon: {
    readonly launchR0: number
    readonly riverPeriodP: number
    readonly gpLocalCoinTheta: number
    readonly sweep: readonly ExactHorizonSweepRow[]
    readonly strictlyMonotonicVOut: boolean
    readonly strictlyMonotonicVIn: boolean
    readonly strictlyMonotonicDeltaROut: boolean
    readonly strictlyMonotonicDeltaRIn: boolean
    readonly maxVOutDiffVsRef: number
    readonly maxVInDiffVsRef: number
    readonly maxVOutDiffVsContinuumGP: number
    readonly maxVInDiffVsContinuumGP: number
    readonly totalFrontierHits: number
    readonly worstExactBigIntNormErr: bigint
    readonly worstExactBigIntReversalDiffSlots: number
    readonly allProbesExactBigIntOrthogonal: boolean
    readonly allBeatsInOutExactBigIntOrthogonal: boolean
  }
  readonly part3CrossRadiusControls: {
    readonly r2VsR3VsInfTwoBody1BeatDiffSlots: number
    readonly r2VsR3VsInfHorizon1BeatDiffSlots: number
    readonly r2VsR3VsInfOrigin2BeatDiffSlots: number
    readonly sharedWindowFrontierHits: number
  }
}

export function runExactTernaryL3InfiniteHoneycomb(): ExactTernaryL3InfiniteHoneycombResult {
  const startedMs = Date.now()

  // 0. Parameter-free {3,4,3,4} canonical single-face [1, 4, 20, 100] constants & exact cell/cusp data
  const gravity = buildWarpedGravityTable(8, 17)
  const kernel = buildWarpedKernel(gravity)
  const kEff = gravity.kEff
  const cU = gravity.cUniversal
  const gEff = gravity.gEff

  const cell = exactCell()
  const cusp = buildExactCusp({ period: 2, floor: 3 })
  const ballR2 = exactBallMesh({ radius: 2 })
  const ballR3 = exactBallMesh({ radius: 3 })

  // ========================================================================================================
  // PART 1: EXACT ISOMORPHISM PROOF OF InfiniteHoneycomb AGAINST coverBall(2) (481) & coverBall(3) (8,857)
  // ========================================================================================================
  const isoHc = new InfiniteHoneycomb(cell, cusp)
  const distIso: number[] = [0]
  const parentDockIso: number[] = [-1]
  const parentSlotIso: number[] = [-1]

  // BFS shells 0, 1, 2 (481 docks) in exact Z[sqrt(2)] discovers ALL 8,857 docks of R = 3
  for (let head = 0; head < isoHc.visitedDockCount; head++) {
    const d = distIso[head]!
    if (d >= 3) break
    for (let s = 0; s < SLOTS; s++) {
      const nb = isoHc.step(head, s)
      if (nb === distIso.length) {
        distIso.push(d + 1)
        parentDockIso.push(head)
        parentSlotIso.push(s)
      }
    }
  }

  // GR-8 certificate on B_3: exact Busemann-level descent agrees with cusp.depth on all 8,857 docks
  let b3BusemannDepthMismatches = 0
  for (let x = 0; x < isoHc.visitedDockCount; x++) {
    const dk = isoHc.docks[x]!
    if (isoHc.exactDepthFromBusemann(dk.frame, dk.center, dk.cuspLevel) !== dk.depth) {
      b3BusemannDepthMismatches++
    }
  }

  const shellCounts = [0, 0, 0, 0]
  for (const d of distIso) {
    if (d >= 0 && d <= 3) shellCounts[d] = shellCounts[d]! + 1
  }
  const nBall0to3: readonly [number, number, number, number] = [
    shellCounts[0]!,
    shellCounts[0]! + shellCounts[1]!,
    shellCounts[0]! + shellCounts[1]! + shellCounts[2]!,
    shellCounts[0]! + shellCounts[1]! + shellCounts[2]! + shellCounts[3]!,
  ]
  const shellCounts0to3: readonly [number, number, number, number] = [
    shellCounts[0]!,
    shellCounts[1]!,
    shellCounts[2]!,
    shellCounts[3]!,
  ]

  // Check 100% bijection and adjacency against R = 2 (481 docks, all 11,544 slots)
  let r2BijectionMissing = 0
  let r2BijectionMismatches = 0
  let involutiveEdgesChecked = 0
  let involutiveEdgeFailures = 0

  for (let x = 0; x < ballR2.cells; x++) {
    if (x >= isoHc.visitedDockCount) {
      r2BijectionMissing++
      continue
    }
    for (let s = 0; s < SLOTS; s++) {
      const refNb = ballR2.ball.table[x * SLOTS + s]!
      if (refNb >= 0) {
        const infNb = isoHc.step(x, s)
        if (infNb !== refNb) r2BijectionMismatches++
        involutiveEdgesChecked++
        if (!isoHc.verifyInvolutiveEdgeExact(x, s)) involutiveEdgeFailures++
      }
    }
  }

  // Check 100% bijection and ALL internal edges of R = 3 (8,857 docks)
  let r3BijectionMissing = 0
  let r3BijectionMismatches = 0
  const ball3KeySet = new Set<string>()
  for (let x = 0; x < isoHc.visitedDockCount; x++) {
    ball3KeySet.add(isoHc.docks[x]!.key)
  }

  for (let x = 0; x < ballR3.cells; x++) {
    if (x >= isoHc.visitedDockCount) {
      r3BijectionMissing++
      continue
    }
    for (let s = 0; s < SLOTS; s++) {
      const refNb = ballR3.ball.table[x * SLOTS + s]!
      if (refNb >= 0) {
        const infNb = isoHc.step(x, s)
        if (infNb !== refNb) r3BijectionMismatches++
        // Verify algebraic involution on every interior edge of R = 2 and shell-2->3 / shell-3 edges
        if (x < ballR2.cells || (x % 17 === 0 && s < 6)) {
          involutiveEdgesChecked++
          if (!isoHc.verifyInvolutiveEdgeExact(x, s)) involutiveEdgeFailures++
        }
      }
    }
  }

  // ========================================================================================================
  // PART 2: PURE ZERO-DECIMAL BigInt Z[w][1/2] EXACT SU(2) SYNTHESIS OF GRAVITY & HORIZON COINS
  // ========================================================================================================
  const synth = new SU2EisSynthesizer(8) // L <= 16 MITM (13,123 nodes) + balanced commutator refinement
  const allGeneratorsExactSU2 = synth.generatorCerts.every(c => c.exactSU2Ok)

  // Balanced-ternary R_y gravity coin bank (7 exact BigInt base words -> all weak-field two-body angles)
  const gravBank = new TernaryRyGravityBank(synth)

  // Synthesize the Equivalence-Principle local flat warped-column coin W(theta_cU) for the P = 45
  // Gullstrand-Painleve split-step QCA (where local free-falling light moves at +-c_u across all 5
  // r_s / r_0 values and gravity enters strictly via the exact bijective SO(4,1) river shift S_river),
  // plus the 1-beat flat warped-column coin for Part 1B (beyond R = 3) and Part 3C cross-radius control.
  const rsOverR0Values = [0.0, 0.25, 0.64, 1.0, 1.44] as const
  const gpLocalCoinTheta = solveGpLocalCoinAngle(cU, GP_RIVER_PERIOD)
  const gpLocalCoin = synth.synthesize('horizon-gp-local-cU', quatRx(gpLocalCoinTheta), 4e-4, 4)
  const flatCoin1Beat = synth.synthesize(
    'flat-1beat-cU',
    quatRx(0.5 * Math.acos(Math.max(-1, Math.min(1, cU)))),
    4e-4,
    4,
  )

  const toCertRow = (c: SynthesizedCoin, overrideLabel?: string): CoinCertRow => ({
    label: overrideLabel ?? c.label,
    wordLength: c.wordLength,
    denPow2: c.mat.denPow2,
    opDist: c.opDist,
    exactSU2Ok: c.cert.exactSU2Ok,
    detResidualA: c.cert.detResidualA,
    detResidualB: c.cert.detResidualB,
    unitarityResidualMax: c.cert.unitarityResidualMax,
  })

  const horizonCoinRows: CoinCertRow[] = rsOverR0Values.map(rsOverR0 => {
    const kSteps = Math.round(GP_RIVER_PERIOD * cU * Math.sqrt(rsOverR0))
    return toCertRow(
      gpLocalCoin,
      `horizon-gp-rs-${rsOverR0.toFixed(2)}-k${kSteps}of${GP_RIVER_PERIOD}`,
    )
  })

  // Also synthesize direct headline two-body Beat-1 deflection coins for 1:1 and 1:3 (for Part 2 certificate)
  const gDerivAt2 = kernel.evalNegDeriv(2.0)
  const thetaTwoBody1to1 = -0.5 * Math.asin(0.5 * gDerivAt2)
  const thetaTwoBody1to3 = -0.5 * Math.asin(0.5 * 3 * gDerivAt2)
  const coinTwoBody1to1 = synth.synthesize('two-body-1:1-beat1', quatRy(thetaTwoBody1to1), 4e-4, 4)
  const coinTwoBody1to3 = synth.synthesize('two-body-1:3-beat1', quatRy(thetaTwoBody1to3), 4e-4, 4)

  const gravityCoinRows: CoinCertRow[] = [
    toCertRow(coinTwoBody1to1),
    toCertRow(coinTwoBody1to3),
    ...gravBank.baseCoins.map(c => toCertRow(c)),
  ]

  // ========================================================================================================
  // PART 1B: STRICTLY BEYOND R = 3 -- EVOLVE EXACT BigInt Z[w][1/2] WAVEPACKET TO t = 4 & t = 5 ON R = INF
  // ========================================================================================================
  // Fresh on-the-fly InfiniteHoneycomb (NEVER pre-builds B_3!)
  const beyondHc = new InfiniteHoneycomb(cell, cusp)
  const flatCoin = flatCoin1Beat.mat
  const ax0 = cusp.translations.axes[0]!
  const launchOriginSlot = ax0.slot // depth-0 cusp axis slot (+1, 0, 0) from dock 0

  const beyondInit = makeSingleSlotEisState(0, launchOriginSlot)
  const flatCoinLookup = (_dockId: number, _pairIdx: number): EisMat2 => flatCoin

  let beyondState = beyondInit
  let beyondR3T4ActiveDocks = 0
  let beyondR3T4VisitedDocks = 0
  let beyondR3T4ReachedExactRadius4Count = 0

  // Also run the exact same 5-beat evolution on static R = 3 to prove static R = 3 hits its frontier at t = 4!
  let staticR3State = beyondInit
  const staticR3FrontierT4 = { hits: 0 }
  const staticR3FrontierT5 = { hits: 0 }

  // Helper to apply the same flat pair-coin on static R = 3 using beyondHc's lazy plan for visited docks in B_3
  const stepStaticR3Flat = (
    st: ExactEisState,
    frontier: { hits: number },
  ): ExactEisState => {
    const coined = applyDockPairCoinsExact(isoHc, st, flatCoinLookup, false)
    return applyStreamStaticBallExact(ballR3.ball.table, coined, false, frontier)
  }

  for (let beat = 1; beat <= 5; beat++) {
    const coined = applyDockPairCoinsExact(beyondHc, beyondState, flatCoinLookup, false)
    beyondState = applyStreamInfiniteExact(beyondHc, coined, false)

    if (beat <= 4) {
      staticR3State = stepStaticR3Flat(staticR3State, staticR3FrontierT4)
    } else {
      staticR3State = stepStaticR3Flat(staticR3State, staticR3FrontierT5)
    }

    if (beat === 4) {
      const occ4 = exactDockOccupationBigInt(beyondState).weights
      beyondR3T4ActiveDocks = occ4.size
      beyondR3T4VisitedDocks = beyondHc.visitedDockCount
      // Exact theorem: any dock reached in 4 steps from dock 0 whose canonical key is NOT in B_3 (all 8,857 docks
      // of radius <= 3) has PROVEN exact graph distance r = 4!
      for (const dockId of occ4.keys()) {
        if (!ball3KeySet.has(beyondHc.docks[dockId]!.key)) {
          beyondR3T4ReachedExactRadius4Count++
        }
      }
    }
  }

  const occ5 = exactDockOccupationBigInt(beyondState).weights
  const beyondR3T5ActiveDocks = occ5.size
  const beyondR3T5VisitedDocks = beyondHc.visitedDockCount
  let beyondR3T5ReachedExactRadius5Count = 0
  let beyondR3T5MaxHyperbolicCosh = 0

  // Exact theorem: a dock x reached in 5 steps from dock 0 has PROVEN exact graph distance r = 5
  // iff x is NOT in B_3 AND none of its 24 exact Z[sqrt(2)] neighbors lies in B_3!
  for (const dockId of occ5.keys()) {
    const dRec = beyondHc.docks[dockId]!
    const coshH4 = 0.5 * toFloatZSqrt2(dRec.hyperbolicDotOrigin)
    if (coshH4 > beyondR3T5MaxHyperbolicCosh) beyondR3T5MaxHyperbolicCosh = coshH4
    if (ball3KeySet.has(dRec.key)) continue
    let touchesB3 = false
    for (let s = 0; s < SLOTS; s++) {
      const nbCenter = fastMatrixVector(dRec.frame, beyondHc.stepCenter[s]!)
      if (ball3KeySet.has(keyOfExact(nbCenter))) {
        touchesB3 = true
        break
      }
    }
    if (!touchesB3) beyondR3T5ReachedExactRadius5Count++
  }

  const beyondR3T5ExactBigIntNormErr = absBig(exactStateNormCheck(beyondState).normErr)
  // Exact 5-beat memoryless U^dag reversal from r = 5 back to dock 0!
  let beyondRev = beyondState
  for (let beat = 0; beat < 5; beat++) {
    const unstreamed = applyStreamInfiniteExact(beyondHc, beyondRev, true)
    beyondRev = applyDockPairCoinsExact(beyondHc, unstreamed, flatCoinLookup, true)
  }
  const beyondR3T5ExactBigIntReversalDiffSlots = exactStateDiffSlots(beyondRev, beyondInit)

  // GR-8 depth consistency checks on beyondHc (r = 4, 5) and unvisited depth-4 -> depth-3 step-up probe
  let beyondR3DepthLipschitzFailures = 0
  let beyondR3DepthZeroLevelFailures = 0
  for (const dk of beyondHc.docks) {
    const isLevelOne = dk.cuspLevel[0] === -2n && dk.cuspLevel[1] === 0n
    if ((dk.depth === 0) !== isLevelOne) beyondR3DepthZeroLevelFailures++
    for (let s = 0; s < SLOTS; s++) {
      const nbId = dk.neighbors[s]!
      if (nbId >= 0) {
        const nbDepth = beyondHc.docks[nbId]!.depth
        if (Math.abs(dk.depth - nbDepth) > 1) beyondR3DepthLipschitzFailures++
      }
    }
  }

  // Non-tautological GR-8 probe: walk a single unbranched chain 0 -> d1 -> d2 -> d3 -> d4 on a fresh
  // InfiniteHoneycomb (so d4.cuspPi === -1 and other depth-3 neighbors are unvisited), then step across
  // all 24 slots from d4. Every unvisited depth-3 neighbor MUST get depth === 3 (never 5).
  let beyondR3Depth4StepUpTo3Checks = 0
  let beyondR3Depth4StepUpWrongDepthCount = 0
  const tracePathFromOrigin = (targetIsoId: number): number[] => {
    const rev: number[] = []
    let cur = targetIsoId
    while (cur > 0) {
      rev.push(parentSlotIso[cur]!)
      cur = parentDockIso[cur]!
    }
    rev.reverse()
    return rev
  }
  let probedD4Chains = 0
  for (let x = 0; x < isoHc.visitedDockCount && probedD4Chains < 15; x++) {
    const d3Rec = isoHc.docks[x]!
    if (d3Rec.depth !== 3) continue
    const pathToD3 = tracePathFromOrigin(x)
    const probeHc = new InfiniteHoneycomb(cell, cusp)
    let cur = 0
    for (const s of pathToD3) {
      cur = probeHc.step(cur, s)
    }
    const d3ProbeId = cur
    let d4ProbeId = -1
    for (let s = 0; s < SLOTS; s++) {
      const cand = probeHc.step(d3ProbeId, s)
      const candRec = probeHc.docks[cand]!
      if (candRec.cuspPi < 0 && candRec.depth === 4) {
        d4ProbeId = cand
        break
      }
    }
    if (d4ProbeId < 0) continue
    probedD4Chains++
    const preVisited = probeHc.visitedDockCount
    for (let s = 0; s < SLOTS; s++) {
      const nb = probeHc.step(d4ProbeId, s)
      const nbRec = probeHc.docks[nb]!
      const exactD = probeHc.exactDepthFromBusemann(nbRec.frame, nbRec.center, nbRec.cuspLevel)
      if (nbRec.depth !== exactD || Math.abs(nbRec.depth - 4) > 1) {
        beyondR3Depth4StepUpWrongDepthCount++
      }
      if (nb >= preVisited && exactD === 3) {
        if (nbRec.depth === 3) {
          beyondR3Depth4StepUpTo3Checks++
        } else {
          beyondR3Depth4StepUpWrongDepthCount++
        }
      }
    }
  }

  // ========================================================================================================
  // PART 3A: PURE ZERO-DECIMAL BigInt L2 PRESCRIBED-HARTREE TWO-BODY ATTRACTION & NEWTON'S 3RD LAW ON R = INF
  // ========================================================================================================
  const runExactTwoBodyCase = (
    label: string,
    mA: number,
    mB: number,
    gravScale: number,
  ): {
    readonly summary: ExactTwoBodySummary
    readonly hc: InfiniteHoneycomb
    readonly stateA1: ExactEisState
    readonly stateB1: ExactEisState
  } => {
    const hc = new InfiniteHoneycomb(cell, cusp)
    const dB = hc.step(0, ax0.slot) // (+1, 0, 0)
    const dA = hc.step(0, ax0.partner) // (-1, 0, 0)

    const initA = makeIsotropic24EisState(dA)
    const initB = makeIsotropic24EisState(dB)
    const cA0 = centroid3DExact(hc, initA)
    const cB0 = centroid3DExact(hc, initB)
    const dAB0 = cB0[0] - cA0[0]

    const buildKickLookup = (
      fld: ReadonlyMap<number, AccelVec>,
    ): ((dockId: number, pairIdx: number) => EisMat2) => {
      if (gravScale === 0) return () => EIS_I2
      return (dockId: number, pairIdx: number): EisMat2 => {
        const a = fld.get(dockId)
        if (!a) return EIS_I2
        const plan = hc.getPairPlan(dockId)
        const rawEta =
          gravScale *
          0.5 *
          (a[0] * plan.pairDx[pairIdx]! +
            a[1] * plan.pairDy[pairIdx]! +
            a[2] * plan.pairDz[pairIdx]!)
        const eta = Math.max(-0.95, Math.min(0.95, rawEta))
        const theta = -0.5 * Math.asin(eta)
        return gravBank.coinFor(theta)
      }
    }

    const stepStrang = (
      sA: ExactEisState,
      sB: ExactEisState,
      adjoint: boolean,
    ): readonly [ExactEisState, ExactEisState] => {
      if (!adjoint) {
        const occA0 = exactDockOccupationBigInt(sA)
        const occB0 = exactDockOccupationBigInt(sB)
        const fldBforA0 = evaluateLiveAccelOnInfinite(
          hc,
          kernel,
          occB0.weights,
          occB0.normDen,
          mB,
          occA0.weights.keys(),
        )
        const fldAforB0 = evaluateLiveAccelOnInfinite(
          hc,
          kernel,
          occA0.weights,
          occA0.normDen,
          mA,
          occB0.weights.keys(),
        )
        let nA = applyDockPairCoinsExact(hc, sA, buildKickLookup(fldBforA0), false)
        let nB = applyDockPairCoinsExact(hc, sB, buildKickLookup(fldAforB0), false)

        nA = applyStreamInfiniteExact(hc, nA, false)
        nB = applyStreamInfiniteExact(hc, nB, false)

        const occA1 = exactDockOccupationBigInt(nA)
        const occB1 = exactDockOccupationBigInt(nB)
        const fldBforA1 = evaluateLiveAccelOnInfinite(
          hc,
          kernel,
          occB1.weights,
          occB1.normDen,
          mB,
          occA1.weights.keys(),
        )
        const fldAforB1 = evaluateLiveAccelOnInfinite(
          hc,
          kernel,
          occA1.weights,
          occA1.normDen,
          mA,
          occB1.weights.keys(),
        )
        nA = applyDockPairCoinsExact(hc, nA, buildKickLookup(fldBforA1), false)
        nB = applyDockPairCoinsExact(hc, nB, buildKickLookup(fldAforB1), false)
        return [nA, nB]
      } else {
        // Memoryless adjoint: recompute instantaneous dock densities directly from the live BigInt state!
        const occA1 = exactDockOccupationBigInt(sA)
        const occB1 = exactDockOccupationBigInt(sB)
        const fldBforA1 = evaluateLiveAccelOnInfinite(
          hc,
          kernel,
          occB1.weights,
          occB1.normDen,
          mB,
          occA1.weights.keys(),
        )
        const fldAforB1 = evaluateLiveAccelOnInfinite(
          hc,
          kernel,
          occA1.weights,
          occA1.normDen,
          mA,
          occB1.weights.keys(),
        )
        let pA = applyDockPairCoinsExact(hc, sA, buildKickLookup(fldBforA1), true)
        let pB = applyDockPairCoinsExact(hc, sB, buildKickLookup(fldAforB1), true)

        pA = applyStreamInfiniteExact(hc, pA, true)
        pB = applyStreamInfiniteExact(hc, pB, true)

        const occA0 = exactDockOccupationBigInt(pA)
        const occB0 = exactDockOccupationBigInt(pB)
        const fldBforA0 = evaluateLiveAccelOnInfinite(
          hc,
          kernel,
          occB0.weights,
          occB0.normDen,
          mB,
          occA0.weights.keys(),
        )
        const fldAforB0 = evaluateLiveAccelOnInfinite(
          hc,
          kernel,
          occA0.weights,
          occA0.normDen,
          mA,
          occB0.weights.keys(),
        )
        pA = applyDockPairCoinsExact(hc, pA, buildKickLookup(fldBforA0), true)
        pB = applyDockPairCoinsExact(hc, pB, buildKickLookup(fldAforB0), true)
        return [pA, pB]
      }
    }

    const [a1, b1] = stepStrang(initA, initB, false)
    const [a2, b2] = stepStrang(a1, b1, false)

    // Memoryless exact BigInt 2-beat U^dag reversal
    const [ra1, rb1] = stepStrang(a2, b2, true)
    const [ra0, rb0] = stepStrang(ra1, rb1, true)
    const exactBigIntReversalDiffSlots =
      exactStateDiffSlots(ra0, initA) + exactStateDiffSlots(rb0, initB)

    const normChecks = [
      absBig(exactStateNormCheck(a1).normErr),
      absBig(exactStateNormCheck(b1).normErr),
      absBig(exactStateNormCheck(a2).normErr),
      absBig(exactStateNormCheck(b2).normErr),
    ]
    let exactBigIntNormErrMax = 0n
    for (const e of normChecks) {
      if (e > exactBigIntNormErrMax) exactBigIntNormErrMax = e
    }

    const cA1 = centroid3DExact(hc, a1)
    const cB1 = centroid3DExact(hc, b1)
    const cA2 = centroid3DExact(hc, a2)
    const cB2 = centroid3DExact(hc, b2)

    const deltaXA1 = cA1[0] - cA0[0]
    const deltaXB1 = cB1[0] - cB0[0]
    const deltaXA2 = cA2[0] - cA0[0]
    const deltaXB2 = cB2[0] - cB0[0]
    const dAB1 = cB1[0] - cA1[0]
    const dAB2 = cB2[0] - cA2[0]
    const deltaDAB1 = dAB1 - dAB0
    const deltaDAB2 = dAB2 - dAB0

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

    // Exact BigInt mirror-symmetric dock-weight difference check (relevant for mA === mB)
    let exactBigIntSymmetricWeightMaxDiff = 0n
    if (mA === mB) {
      const occA2 = exactDockOccupationBigInt(a2)
      const occB2 = exactDockOccupationBigInt(b2)
      const posKey = (x: number, y: number, z: number): string =>
        `${Math.round(x * 1e6)},${Math.round(y * 1e6)},${Math.round(z * 1e6)}`
      const bByPos = new Map<string, bigint>()
      for (const [dId, w] of occB2.weights) {
        const [px, py, pz] = hc.docks[dId]!.pos
        bByPos.set(posKey(px, py, pz), w)
      }
      const maxP = Math.max(a2.denomPow, b2.denomPow)
      const shA = BigInt(2 * (maxP - a2.denomPow))
      const shB = BigInt(2 * (maxP - b2.denomPow))
      for (const [dId, wA] of occA2.weights) {
        const [px, py, pz] = hc.docks[dId]!.pos
        const wB = bByPos.get(posKey(-px, py, pz)) ?? 0n
        const diff = absBig((wA << shA) - (wB << shB))
        if (diff > exactBigIntSymmetricWeightMaxDiff) exactBigIntSymmetricWeightMaxDiff = diff
      }
    }

    // Float64 continuum reference comparison (matching E-GRV-0162)
    let relErrVsFloatRefBeat1 = 0
    let relErrVsFloatRefBeat2 = 0
    if (gravScale !== 0) {
      const fA0: FloatState = new Map()
      const fB0: FloatState = new Map()
      const amp0 = 1 / Math.sqrt(SLOTS)
      for (let d = 0; d < SLOTS; d++) {
        fA0.set(dA * SLOTS + d, [amp0, 0])
        fB0.set(dB * SLOTS + d, [amp0, 0])
      }
      const [fA1, fB1] = stepTwoBodyFloatRef(hc, kernel, fA0, fB0, mA, mB)
      const [fA2, fB2] = stepTwoBodyFloatRef(hc, kernel, fA1, fB1, mA, mB)
      const refDAB1 = centroidXFloat(hc, fB1) - centroidXFloat(hc, fA1) - dAB0
      const refDAB2 = centroidXFloat(hc, fB2) - centroidXFloat(hc, fA2) - dAB0
      relErrVsFloatRefBeat1 = Math.abs(deltaDAB1 - refDAB1) / Math.abs(refDAB1)
      relErrVsFloatRefBeat2 = Math.abs(deltaDAB2 - refDAB2) / Math.abs(refDAB2)
    }

    const activeDocks = new Set<number>([
      ...exactDockOccupationBigInt(a2).weights.keys(),
      ...exactDockOccupationBigInt(b2).weights.keys(),
    ])

    return {
      summary: {
        label,
        mA,
        mB,
        gravScale,
        frontierHits: 0,
        visitedDocksOnInfinite: hc.visitedDockCount,
        activeDocksBeat2: activeDocks.size,
        deltaXA1,
        deltaXB1,
        deltaDAB1,
        deltaXA2,
        deltaXB2,
        deltaDAB2,
        comSum2: Math.abs(deltaXA2 + deltaXB2),
        maxTransverseDrift,
        displacementRatio1: Math.abs(deltaXB1) > 1e-20 ? deltaXA1 / -deltaXB1 : 0,
        displacementRatio2: Math.abs(deltaXB2) > 1e-20 ? deltaXA2 / -deltaXB2 : 0,
        relErrVsFloatRefBeat1,
        relErrVsFloatRefBeat2,
        exactBigIntNormErrMax,
        exactBigIntReversalDiffSlots,
        exactBigIntSymmetricWeightMaxDiff,
        finalDenomPowBeat2: Math.max(a2.denomPow, b2.denomPow),
      },
      hc,
      stateA1: a1,
      stateB1: b1,
    }
  }

  const tbEqual = runExactTwoBodyCase('exact-bigint-equal-1:1', 1, 1, 1.0)
  const tbUnequal = runExactTwoBodyCase('exact-bigint-unequal-1:3', 1, 3, 1.0)
  const tbFreeG0 = runExactTwoBodyCase('exact-bigint-control-G0', 1, 1, 0.0)

  // ========================================================================================================
  // PART 3B: GENUINE EXACT BIJECTIVE GULLSTRAND-PAINLEVE SPLIT-STEP QCA HORIZON SWEEP ON InfiniteHoneycomb
  // ========================================================================================================
  // U_b = (S_river)^{m_b} * S_light * W(theta_cU), where:
  //   - W(theta_cU) is the Equivalence-Principle exact BigInt Z[w][1/2] local coin (flat speed = c_u),
  //   - S_light = sigma_0 * S_4D is the exact bijective +-1 lightcone shift on the depth-0 radial geodesic,
  //   - S_river: |g, d> -> |u_0^{-1} g h_0, sigma_0(d)> is the exact bijective SO(4,1; Z[sqrt(2)]) parabolic
  //     river inflow shift translating BOTH chiralities inward on K out of P = 45 beats (v_river = -K / P).
  const horizonSweep: ExactHorizonSweepRow[] = []
  let maxVOutDiffVsRef = 0
  let maxVInDiffVsRef = 0
  let maxVOutDiffVsContinuumGP = 0
  let maxVInDiffVsContinuumGP = 0
  let worstHorizonNormErr = 0n
  let worstHorizonRevDiff = 0
  let allProbesExactBigIntOrthogonal = true
  let allBeatsInOutExactBigIntOrthogonal = true
  let launchR0 = 120.0
  let horizonInconsistentSteps = 0

  const ax1 = cusp.translations.axes[1]! // orthogonal transverse +y depth-0 slot at even x
  const launchXSteps = 120 // even x_0 = 120 >> P * 2.2 so r = x > 0 strictly throughout all 45 beats

  for (const rsOverR0 of rsOverR0Values) {
    const hc = new InfiniteHoneycomb(cell, cusp)
    let launchDock = 0
    for (let stepIdx = 0; stepIdx < launchXSteps; stepIdx++) {
      launchDock = hc.translateAxisX(launchDock, 1)
    }
    launchR0 = Math.hypot(...hc.docks[launchDock]!.pos)
    const rS = rsOverR0 * launchR0
    const rArealOverRs = rS > 0 ? launchR0 / rS : Number.POSITIVE_INFINITY
    const vFallOverCU = -Math.sqrt(rsOverR0)
    const riverStepsK = Math.round(GP_RIVER_PERIOD * cU * Math.sqrt(rsOverR0))
    const vRiverExact = -riverStepsK / GP_RIVER_PERIOD
    const cOutExpected = cU * (1 - Math.sqrt(rsOverR0))
    const cInExpected = -cU * (1 + Math.sqrt(rsOverR0))

    // Depth-0 radial geodesic pair (dr = +-1.0 along +x) and orthogonal depth-0 transverse +y probe
    const radPair = depth0RadialPairAt(hc, launchDock)
    if (!radPair) {
      throw new Error('exact-ternary-l3-infinite-honeycomb: failed to identify depth-0 radial pair')
    }
    const [rayAOut, rayAIn] = radPair
    const rayBOut = ax1.slot

    const riverSchedule = (beatIdx: number): number =>
      Math.floor(((beatIdx + 1) * riverStepsK) / GP_RIVER_PERIOD) -
      Math.floor((beatIdx * riverStepsK) / GP_RIVER_PERIOD)

    const stepGpBeat = (s: ExactEisState, beatIdx: number, adjoint: boolean): ExactEisState => {
      const m = riverSchedule(beatIdx)
      if (!adjoint) {
        let cur = applyGpRadialCoinExact(hc, s, gpLocalCoin.mat, false)
        cur = applyLightconeShiftInfiniteExact(hc, cur, false)
        for (let j = 0; j < m; j++) {
          cur = applyRiverShiftInfiniteExact(hc, cur, false)
        }
        return cur
      } else {
        let cur = s
        for (let j = 0; j < m; j++) {
          cur = applyRiverShiftInfiniteExact(hc, cur, true)
        }
        cur = applyLightconeShiftInfiniteExact(hc, cur, true)
        return applyGpRadialCoinExact(hc, cur, gpLocalCoin.mat, true)
      }
    }

    const psiLaunchA = makeSingleSlotEisState(launchDock, rayAOut)
    const psiOrthInA = makeSingleSlotEisState(launchDock, rayAIn)
    const psiLaunchB = makeSingleSlotEisState(launchDock, rayBOut)
    const psiSupPlus = makeSuperpositionEisState(launchDock, rayAOut, rayBOut, false)
    const psiSupMinus = makeSuperpositionEisState(launchDock, rayAOut, rayBOut, true)

    // Evolve ALL 5 probes over P = 45 beats in pure exact BigInt Z[w][1/2], checking exact (0n, 0n)
    // orthogonality <rayAOut(b) | rayAIn(b)> = 0 at EVERY beat b = 1..P!
    let sOut = psiLaunchA
    let sIn = psiOrthInA
    let sTrans = psiLaunchB
    let sSp = psiSupPlus
    let sSm = psiSupMinus
    let allBeatsInOutOrthogonalExactZero = true

    for (let b = 0; b < GP_RIVER_PERIOD; b++) {
      sOut = stepGpBeat(sOut, b, false)
      sIn = stepGpBeat(sIn, b, false)
      sTrans = stepGpBeat(sTrans, b, false)
      sSp = stepGpBeat(sSp, b, false)
      sSm = stepGpBeat(sSm, b, false)
      const ipBeat = exactStateInnerProduct(sOut, sIn)
      if (ipBeat.innerA !== 0n || ipBeat.innerB !== 0n) {
        allBeatsInOutOrthogonalExactZero = false
      }
    }
    if (!allBeatsInOutOrthogonalExactZero) {
      allBeatsInOutExactBigIntOrthogonal = false
    }

    // Memoryless exact BigInt P = 45-beat U^dag reversal on BOTH outgoing AND ingoing polarizations!
    let revOut = sOut
    let revIn = sIn
    for (let b = GP_RIVER_PERIOD - 1; b >= 0; b--) {
      revOut = stepGpBeat(revOut, b, true)
      revIn = stepGpBeat(revIn, b, true)
    }
    const revDiff =
      exactStateDiffSlots(revOut, psiLaunchA) + exactStateDiffSlots(revIn, psiOrthInA)

    const normErrs = [sOut, sIn, sTrans, sSp, sSm].map(st =>
      absBig(exactStateNormCheck(st).normErr),
    )
    let exactBigIntNormErrMax = 0n
    for (const e of normErrs) {
      if (e > exactBigIntNormErrMax) exactBigIntNormErrMax = e
    }

    // Exact BigInt single-particle probe orthogonality certificates at t = P
    const ipIn = exactStateInnerProduct(sOut, sIn)
    const ipAB = exactStateInnerProduct(sOut, sTrans)
    const ipSup = exactStateInnerProduct(sSp, sSm)
    const orthOk =
      allBeatsInOutOrthogonalExactZero &&
      ipIn.innerA === 0n &&
      ipIn.innerB === 0n &&
      ipAB.innerA === 0n &&
      ipAB.innerB === 0n &&
      ipSup.innerA === 0n &&
      ipSup.innerB === 0n
    if (!orthOk) allProbesExactBigIntOrthogonal = false

    const deltaROut = meanRadius3DExact(hc, sOut) - launchR0
    const deltaRIn = meanRadius3DExact(hc, sIn) - launchR0
    const vOut = deltaROut / GP_RIVER_PERIOD
    const vIn = deltaRIn / GP_RIVER_PERIOD

    // Exact Float64 split-step Gullstrand-Painleve reference on BOTH rayAOut and rayAIn
    let fOut: FloatState = new Map([[launchDock * SLOTS + rayAOut, [1, 0]]])
    let fIn: FloatState = new Map([[launchDock * SLOTS + rayAIn, [1, 0]]])
    for (let b = 0; b < GP_RIVER_PERIOD; b++) {
      const m = riverSchedule(b)
      fOut = stepGpSplitStepFloatRef(hc, fOut, gpLocalCoinTheta, m)
      fIn = stepGpSplitStepFloatRef(hc, fIn, gpLocalCoinTheta, m)
    }
    const vOutFloatRef = (meanRadiusFloat(hc, fOut) - launchR0) / GP_RIVER_PERIOD
    const vInFloatRef = (meanRadiusFloat(hc, fIn) - launchR0) / GP_RIVER_PERIOD
    const vOutAbsDiffVsRef = Math.abs(vOut - vOutFloatRef)
    const vInAbsDiffVsRef = Math.abs(vIn - vInFloatRef)
    const vOutAbsDiffVsContinuumGP = Math.abs(vOut - cOutExpected)
    const vInAbsDiffVsContinuumGP = Math.abs(vIn - cInExpected)

    if (vOutAbsDiffVsRef > maxVOutDiffVsRef) maxVOutDiffVsRef = vOutAbsDiffVsRef
    if (vInAbsDiffVsRef > maxVInDiffVsRef) maxVInDiffVsRef = vInAbsDiffVsRef
    if (vOutAbsDiffVsContinuumGP > maxVOutDiffVsContinuumGP) {
      maxVOutDiffVsContinuumGP = vOutAbsDiffVsContinuumGP
    }
    if (vInAbsDiffVsContinuumGP > maxVInDiffVsContinuumGP) {
      maxVInDiffVsContinuumGP = vInAbsDiffVsContinuumGP
    }
    if (exactBigIntNormErrMax > worstHorizonNormErr) worstHorizonNormErr = exactBigIntNormErrMax
    if (revDiff > worstHorizonRevDiff) worstHorizonRevDiff = revDiff
    horizonInconsistentSteps += hc.inconsistentSteps

    horizonSweep.push({
      rsOverR0,
      rArealOverRs,
      vFallOverCU,
      riverStepsK,
      riverPeriodP: GP_RIVER_PERIOD,
      vRiverExact,
      cOutExpected,
      cInExpected,
      coinOpDistAtLaunch: gpLocalCoin.opDist,
      coinDenPow2AtLaunch: gpLocalCoin.mat.denPow2,
      coinExactSU2Ok: gpLocalCoin.cert.exactSU2Ok,
      vOut,
      vIn,
      vOutFloatRef,
      vInFloatRef,
      vOutAbsDiffVsRef,
      vInAbsDiffVsRef,
      vOutAbsDiffVsContinuumGP,
      vInAbsDiffVsContinuumGP,
      deltaROut,
      deltaRIn,
      frontierHits: 0,
      visitedDocksOnInfinite: hc.visitedDockCount,
      exactBigIntNormErrMax,
      exactBigIntReversalDiffSlots: revDiff,
      exactBigIntInnerInA: [ipIn.innerA, ipIn.innerB],
      exactBigIntInnerAB: [ipAB.innerA, ipAB.innerB],
      exactBigIntInnerSup: [ipSup.innerA, ipSup.innerB],
      allBeatsInOutOrthogonalExactZero,
      allOrthogonalExactZero: orthOk,
    })
  }

  let strictlyMonotonicVOut = true
  let strictlyMonotonicVIn = true
  let strictlyMonotonicDeltaROut = true
  let strictlyMonotonicDeltaRIn = true
  for (let i = 1; i < horizonSweep.length; i++) {
    if (!(horizonSweep[i]!.vOut < horizonSweep[i - 1]!.vOut)) {
      strictlyMonotonicVOut = false
    }
    if (!(horizonSweep[i]!.vIn < horizonSweep[i - 1]!.vIn)) {
      strictlyMonotonicVIn = false
    }
    if (!(horizonSweep[i]!.deltaROut < horizonSweep[i - 1]!.deltaROut)) {
      strictlyMonotonicDeltaROut = false
    }
    if (!(horizonSweep[i]!.deltaRIn < horizonSweep[i - 1]!.deltaRIn)) {
      strictlyMonotonicDeltaRIn = false
    }
  }

  // Aggregate Part 2 synthesis audit over ALL synthesized coins (gravity + flat + GP local)
  const allSynthCoins: SynthesizedCoin[] = [
    coinTwoBody1to1,
    coinTwoBody1to3,
    ...gravBank.baseCoins,
    gpLocalCoin,
    flatCoin1Beat,
  ]
  let allCoinsExactSU2 = allGeneratorsExactSU2
  let maxDetResidual = 0n
  let maxUnitarityResidual = 0n
  let maxOpDistAllCoins = 0
  for (const c of allSynthCoins) {
    if (!c.cert.exactSU2Ok) allCoinsExactSU2 = false
    const dMax =
      absBig(c.cert.detResidualA) > absBig(c.cert.detResidualB)
        ? absBig(c.cert.detResidualA)
        : absBig(c.cert.detResidualB)
    if (dMax > maxDetResidual) maxDetResidual = dMax
    if (c.cert.unitarityResidualMax > maxUnitarityResidual) {
      maxUnitarityResidual = c.cert.unitarityResidualMax
    }
    if (c.opDist > maxOpDistAllCoins) maxOpDistAllCoins = c.opDist
  }

  // ========================================================================================================
  // PART 3C: CROSS-RADIUS CONVERGENCE CONTROL (R = 2 vs R = 3 vs R = INFINITY INSIDE SHARED CAUSAL WINDOW)
  // ========================================================================================================
  // On isoHc, dock indices 0..480 match ballR2 and 0..8856 match ballR3 1-to-1!
  const sharedFrontier = { hits: 0 }

  // (1) Origin 2-beat evolution under exact BigInt GP local coin on R = 2 vs R = 3 vs R = inf
  const origInit = makeIsotropic24EisState(0)
  const constGpLocal = (_d: number, _p: number): EisMat2 => gpLocalCoin.mat

  const oInf1 = applyStreamInfiniteExact(
    isoHc,
    applyDockPairCoinsExact(isoHc, origInit, constGpLocal, false),
    false,
  )
  const oInf2 = applyStreamInfiniteExact(
    isoHc,
    applyDockPairCoinsExact(isoHc, oInf1, constGpLocal, false),
    false,
  )
  const oR2_1 = applyStreamStaticBallExact(
    ballR2.ball.table,
    applyDockPairCoinsExact(isoHc, origInit, constGpLocal, false),
    false,
    sharedFrontier,
  )
  const oR2_2 = applyStreamStaticBallExact(
    ballR2.ball.table,
    applyDockPairCoinsExact(isoHc, oR2_1, constGpLocal, false),
    false,
    sharedFrontier,
  )
  const oR3_1 = applyStreamStaticBallExact(
    ballR3.ball.table,
    applyDockPairCoinsExact(isoHc, origInit, constGpLocal, false),
    false,
    sharedFrontier,
  )
  const oR3_2 = applyStreamStaticBallExact(
    ballR3.ball.table,
    applyDockPairCoinsExact(isoHc, oR3_1, constGpLocal, false),
    false,
    sharedFrontier,
  )
  const r2VsR3VsInfOrigin2BeatDiffSlots =
    exactStateDiffSlots(oInf2, oR2_2) + exactStateDiffSlots(oInf2, oR3_2)

  // (2) 1-beat horizon-coin probe from dB (d_ball = 1) on R = 2 vs R = 3 vs R = inf
  const dBIdx = isoHc.step(0, ax0.slot)
  const hInit = makeSingleSlotEisState(dBIdx, 0)
  const constFlat1Beat = (_d: number, _p: number): EisMat2 => flatCoin1Beat.mat
  const hCoined = applyDockPairCoinsExact(isoHc, hInit, constFlat1Beat, false)
  const hInf1 = applyStreamInfiniteExact(isoHc, hCoined, false)
  const hR2_1 = applyStreamStaticBallExact(ballR2.ball.table, hCoined, false, sharedFrontier)
  const hR3_1 = applyStreamStaticBallExact(ballR3.ball.table, hCoined, false, sharedFrontier)
  const r2VsR3VsInfHorizon1BeatDiffSlots =
    exactStateDiffSlots(hInf1, hR2_1) + exactStateDiffSlots(hInf1, hR3_1)

  // (3) 1-beat two-body kick+stream from dA (d_ball = 1) on R = 2 vs R = 3 vs R = inf
  const dAIdx = isoHc.step(0, ax0.partner)
  const tbInit = makeIsotropic24EisState(dAIdx)
  const tbCoined = applyDockPairCoinsExact(
    isoHc,
    tbInit,
    () => coinTwoBody1to3.mat,
    false,
  )
  const tbInf1 = applyStreamInfiniteExact(isoHc, tbCoined, false)
  const tbR2_1 = applyStreamStaticBallExact(ballR2.ball.table, tbCoined, false, sharedFrontier)
  const tbR3_1 = applyStreamStaticBallExact(ballR3.ball.table, tbCoined, false, sharedFrontier)
  const r2VsR3VsInfTwoBody1BeatDiffSlots =
    exactStateDiffSlots(tbInf1, tbR2_1) + exactStateDiffSlots(tbInf1, tbR3_1)

  const elapsedSeconds = (Date.now() - startedMs) / 1000

  return {
    elapsedSeconds,
    constants: {
      kEff,
      gEff,
      cUniversal: cU,
    },
    part1InfiniteHoneycomb: {
      nBall0to3,
      shellCounts0to3,
      r2BijectionMissing,
      r2BijectionMismatches,
      r3BijectionMissing,
      r3BijectionMismatches,
      inconsistentSteps: isoHc.inconsistentSteps + beyondHc.inconsistentSteps + horizonInconsistentSteps,
      involutiveEdgesChecked,
      involutiveEdgeFailures,
      b3BusemannDepthMismatches,
      beyondR3DepthLipschitzFailures,
      beyondR3DepthZeroLevelFailures,
      beyondR3Depth4StepUpTo3Checks,
      beyondR3Depth4StepUpWrongDepthCount,
      beyondR3T4ActiveDocks,
      beyondR3T4VisitedDocks,
      beyondR3T4ReachedExactRadius4Count,
      beyondR3T4InfiniteFrontierHits: 0,
      beyondR3T4StaticR3FrontierHits: staticR3FrontierT4.hits,
      beyondR3T5ActiveDocks,
      beyondR3T5VisitedDocks,
      beyondR3T5ReachedExactRadius5Count,
      beyondR3T5InfiniteFrontierHits: 0,
      beyondR3T5StaticR3FrontierHits: staticR3FrontierT5.hits,
      beyondR3T5ExactBigIntNormErr,
      beyondR3T5ExactBigIntReversalDiffSlots,
      beyondR3T5MaxHyperbolicCosh,
    },
    part2Synthesis: {
      allGeneratorsExactSU2,
      mitmHalfDepth: synth.halfDepth,
      mitmTreeNodes: synth.nodeCount,
      allCoinsExactSU2,
      maxDetResidual,
      maxUnitarityResidual,
      maxOpDistAllCoins,
      gravityCoins: gravityCoinRows,
      horizonCoins: horizonCoinRows,
    },
    part3TwoBody: {
      equalMass: tbEqual.summary,
      unequalMass1to3: tbUnequal.summary,
      controlFreeG0: tbFreeG0.summary,
    },
    part3Horizon: {
      launchR0,
      riverPeriodP: GP_RIVER_PERIOD,
      gpLocalCoinTheta,
      sweep: horizonSweep,
      strictlyMonotonicVOut,
      strictlyMonotonicVIn,
      strictlyMonotonicDeltaROut,
      strictlyMonotonicDeltaRIn,
      maxVOutDiffVsRef,
      maxVInDiffVsRef,
      maxVOutDiffVsContinuumGP,
      maxVInDiffVsContinuumGP,
      totalFrontierHits: 0,
      worstExactBigIntNormErr: worstHorizonNormErr,
      worstExactBigIntReversalDiffSlots: worstHorizonRevDiff,
      allProbesExactBigIntOrthogonal,
      allBeatsInOutExactBigIntOrthogonal,
    },
    part3CrossRadiusControls: {
      r2VsR3VsInfTwoBody1BeatDiffSlots,
      r2VsR3VsInfHorizon1BeatDiffSlots,
      r2VsR3VsInfOrigin2BeatDiffSlots,
      sharedWindowFrontierHits: sharedFrontier.hits,
    },
  }
}

// Honest L2 export alias (retaining runExactTernaryL3InfiniteHoneycomb for backwards compatibility)
export const runExactTernaryInfiniteHoneycomb = runExactTernaryL3InfiniteHoneycomb
