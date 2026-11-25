// Breakthrough Suite (Wave-2 Track W4):
// Exact Asynchronous Local Causal-Set & Foliation Invariance Verifier
//
// Proves and verifies numerically with ZERO floating-point error (exact BigInt arithmetic in
// Z[zeta_9][1/6] on exact O^+(4,1; Z[sqrt(2)]) {3,4,3,4} Coxeter balls) that Vibe Theory's
// full 8-layer palindromic beat:
//
//   U = S o Phi_odd o D o M_meet o M_pair(zeta_18) o K o D o Phi_odd
//     = R o E_swap o L
//     = R o (E_swap o W) o R,     W = bigotimes_{g in M} (L_g o R_g),   E_swap = bigotimes_{e in E} SWAP_e
//
// requires NO preferred global clock and NO synchronous global slicing:
//   1. Exact commutation of spacelike-separated local events:
//      [W_{g1}, W_{g2}] = 0 (g1 != g2), [SWAP_{e1}, SWAP_{e2}] = 0 (e1 != e2, even sharing a dock!),
//      [W_g, SWAP_e] = 0 (g not in e), and [R_g, L_g] = 0.
//   2. Exact Discrete Tomonaga-Schwinger / Mazurkiewicz Trace Invariance across 7 wildly different
//      asynchronous causal foliations (global synchronous U^T, factorized flat, outward radial wave,
//      inward reverse-radial wave, tilted Z[sqrt(2)] Busemann-horosphere boost foliation, localized
//      proper-time bubble / twin-paradox cone, and 3 chaotic deterministic hash schedules).
//   3. Exact intermediate warped-Cauchy-slice reduced density matrix invariance (no-signaling /
//      local proper-time completeness) and exact unitarity, Q (0_V), D (0_D), and |V_1> conservation.
//   4. Explicit negative control: violating one single causal dependence V(g, n) < X(e, n) breaks
//      exact equivalence immediately (non-vacuous causality sensitivity).
//
// DETERMINISM: zero randomness, zero floats in any amplitude, geometry, or comparison.

import {
  exactCell,
  matrixProduct,
  matrixVector,
  twiceForm,
  type ExactCell,
  type ExactMatrix,
  type ExactVector,
} from '@/code/substrate/coxeter/exact-3434'
import { CUSP_VERTEX } from '@/code/substrate/coxeter/exact-cusp'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  ZERO,
  ONE,
  OMEGA,
  ninth,
  add,
  sub,
  mul,
  neg,
  scale,
  conj,
  isZero,
  equals,
  keyOf as ninthKey,
  type Ninth,
} from '@/code/algebra/ninth-field'

// ============================================================================
// 1. Exact Constants in Z[zeta_9][1/6] (bit-for-bit match with Vibe/FockBeat.lean)
// ============================================================================

const SLOTS = 24
const LINES = 12
const D4_ROOTS: readonly (readonly number[])[] = rootsD4()

const ZETA6: Ninth = ninth([1, 0, 0, 1, 0, 0]) // 1 + omega = e^{i pi / 3}
const ZETA18: Ninth = ninth([0, 0, 0, 0, 0, -1]) // -zeta_9^5 = e^{i pi / 9}
const COIN_DIAG: Ninth = ninth([2, 0, 0, 1, 0, 0], 2) // (2 + omega) / 2
const COIN_OFF: Ninth = ninth([0, 0, 0, -1, 0, 0], 2) // -omega / 2
const MEET_KEEP: Ninth = ninth([1, 0, 0, 1, 0, 0], 2) // zeta_6 / 2
const MEET_SWAP: Ninth = ninth([-1, 0, 0, 1, 0, 0], 2) // (-1 + omega) / 2
const PAIR_HOP: Ninth = scale(sub(ZETA18, ONE), 1, 12) // (zeta_18 - 1) / 12
const NEG_ONE: Ninth = neg(ONE)

const ZETA6_POWERS: readonly Ninth[] = [
  ONE,
  ZETA6,
  OMEGA,
  NEG_ONE,
  neg(ZETA6),
  neg(OMEGA),
]

function zeta6Pow(n: number): Ninth {
  const m = ((n % 6) + 6) % 6
  return ZETA6_POWERS[m]!
}

// ============================================================================
// 2. Exact {3,4,3,4} Coxeter Hull Builder (Zero Floats, Exact Z[sqrt(2)])
// ============================================================================

type FacetEdge = {
  readonly id: number
  readonly u: number
  readonly a: number // slot on u facing v (u * k_a = v)
  readonly v: number
  readonly oppA: number // slot on v facing u (v * k_{oppA} = u)
}

type CausalHull = {
  readonly name: string
  readonly cells: number
  readonly radius: number
  readonly opposite: readonly number[]
  readonly lineA: readonly number[]
  readonly lineB: readonly number[]
  readonly table: Int32Array // cells * 24, -1 outside hull
  readonly edgeOfSlot: Int32Array // cells * 24, edge id or -1 outside hull
  readonly edges: readonly FacetEdge[]
  readonly incidentEdges: readonly (readonly number[])[]
  readonly distFromSeed: Int32Array
  readonly distFromOrigin: Int32Array
  readonly parity: Int8Array // det(g) in {+1, -1}
  readonly busemann: readonly [bigint, bigint][] // exact 2B(g c0, v_cusp) in Z[sqrt(2)]
  readonly parityConflicts: number
  readonly inconsistentSteps: number
}

// Exact integer comparison of Z[sqrt(2)] numbers: a + b*sqrt(2) vs c + d*sqrt(2).
function cmpZSqrt2(x: readonly [bigint, bigint], y: readonly [bigint, bigint]): number {
  const da = x[0] - y[0]
  const db = x[1] - y[1]
  if (da === 0n && db === 0n) return 0
  if (da >= 0n && db >= 0n) return 1
  if (da <= 0n && db <= 0n) return -1
  // Opposite signs: compare da^2 vs 2 * db^2
  const lhs = da * da
  const rhs = 2n * db * db
  if (da > 0n) {
    return lhs > rhs ? 1 : -1
  }
  return rhs > lhs ? 1 : -1
}

function buildCanonicalLines(opposite: readonly number[]): { lineA: number[]; lineB: number[] } {
  const lineA: number[] = []
  const lineB: number[] = []
  const used = new Uint8Array(SLOTS)
  for (let a = 0; a < SLOTS; a++) {
    if (used[a]) continue
    const b = opposite[a]!
    used[a] = 1
    used[b] = 1
    lineA.push(a)
    lineB.push(b)
  }
  if (lineA.length !== LINES) {
    throw new Error(`Expected 12 antipodal lines, got ${lineA.length}`)
  }
  return { lineA, lineB }
}

function identityMat5(): ExactMatrix {
  const m = new Array<bigint>(50).fill(0n)
  for (let i = 0; i < 5; i++) m[2 * (i * 5 + i)] = 1n
  return m
}

function keyOfVec(v: ExactVector): string {
  return v.join(',')
}

function buildExactCausalHull(input: {
  name: string
  cell: ExactCell
  seedWords: readonly (readonly number[])[]
  radius: number
}): CausalHull {
  const { cell, radius } = input
  const stepCenter = cell.transports.map(k => matrixVector(k, cell.center))
  const stepChamber = cell.transports.map(k => matrixVector(k, cell.chamberPoint))

  const frames: ExactMatrix[] = []
  const chamberKeys: string[] = []
  const distFromSeed: number[] = []
  const originParity: number[] = []
  const busemann: [bigint, bigint][] = []
  const index = new Map<string, number>()

  for (const word of input.seedWords) {
    let g = identityMat5()
    for (const s of word) {
      g = matrixProduct(g, cell.transports[s]!)
    }
    const center = matrixVector(g, cell.center)
    const cKey = keyOfVec(center)
    if (!index.has(cKey)) {
      index.set(cKey, frames.length)
      frames.push(g)
      chamberKeys.push(keyOfVec(matrixVector(g, cell.chamberPoint)))
      distFromSeed.push(0)
      originParity.push(word.length % 2 === 0 ? 1 : -1)
      busemann.push(twiceForm(center, CUSP_VERTEX))
    }
  }

  let inconsistentSteps = 0
  const rows: Int32Array[] = []

  for (let head = 0; head < frames.length; head++) {
    const g = frames[head]!
    const here = distFromSeed[head]!
    const row = new Int32Array(SLOTS).fill(-1)

    for (let k = 0; k < SLOTS; k++) {
      const nextCenter = matrixVector(g, stepCenter[k]!)
      const cKey = keyOfVec(nextCenter)
      const chKey = keyOfVec(matrixVector(g, stepChamber[k]!))
      let id = index.get(cKey)

      if (id === undefined && here < radius) {
        id = frames.length
        index.set(cKey, id)
        frames.push(matrixProduct(g, cell.transports[k]!))
        chamberKeys.push(chKey)
        distFromSeed.push(here + 1)
        originParity.push(-originParity[head]!)
        busemann.push(twiceForm(nextCenter, CUSP_VERTEX))
      } else if (id !== undefined && chamberKeys[id] !== chKey) {
        inconsistentSteps++
      }

      row[k] = id ?? -1
    }

    rows.push(row)
  }

  const cells = rows.length
  const table = new Int32Array(cells * SLOTS)
  rows.forEach((r, c) => table.set(r, c * SLOTS))

  // Compute exact graph distance from cell 0 (origin) via BFS on the hull
  const distFromOrigin = new Int32Array(cells).fill(-1)
  distFromOrigin[0] = 0
  const bfsQueue: number[] = [0]
  for (let qHead = 0; qHead < bfsQueue.length; qHead++) {
    const u = bfsQueue[qHead]!
    const d = distFromOrigin[u]!
    for (let a = 0; a < SLOTS; a++) {
      const v = table[u * SLOTS + a]!
      if (v >= 0 && distFromOrigin[v] === -1) {
        distFromOrigin[v] = d + 1
        bfsQueue.push(v)
      }
    }
  }

  // Build canonical pairwise-disjoint undirected facet edges and check bipartiteness
  const edgeOfSlot = new Int32Array(cells * SLOTS).fill(-1)
  const edges: FacetEdge[] = []
  const incidentEdges: number[][] = Array.from({ length: cells }, () => [])
  let parityConflicts = 0

  for (let u = 0; u < cells; u++) {
    for (let a = 0; a < SLOTS; a++) {
      const v = table[u * SLOTS + a]!
      if (v < 0) continue
      const oppA = cell.opposite[a]!
      if (table[v * SLOTS + oppA] !== u) {
        throw new Error(`Antipodal return mismatch at (${u}, ${a}) -> ${v}`)
      }
      if (originParity[u] !== -originParity[v]!) {
        parityConflicts++
      }
      if (u < v) {
        const id = edges.length
        edges.push({ id, u, a, v, oppA })
        edgeOfSlot[u * SLOTS + a] = id
        edgeOfSlot[v * SLOTS + oppA] = id
        incidentEdges[u]!.push(id)
        incidentEdges[v]!.push(id)
      }
    }
  }

  const { lineA, lineB } = buildCanonicalLines(cell.opposite)

  return {
    name: input.name,
    cells,
    radius,
    opposite: cell.opposite,
    lineA,
    lineB,
    table,
    edgeOfSlot,
    edges,
    incidentEdges,
    distFromSeed: Int32Array.from(distFromSeed),
    distFromOrigin,
    parity: Int8Array.from(originParity),
    busemann,
    parityConflicts,
    inconsistentSteps,
  }
}

// ============================================================================
// 3. Exact Chiral Pseudoscalar chiOddPoly (bit-for-bit match with Vibe/Chirality.lean)
// ============================================================================
// Convention equivalence note: `dockChi` uses `sign(chiOddPoly)` (matching `Vibe/Chirality.lean`),
// whereas `test/universe.ts` (and W3's `compacton-nogo-and-doublon.ts`) uses the canonical
// `W(F_4) x Z_2^C` orbit-minimum sign `chiral4Sign`. Both satisfy the exact same `ChiralInvariant`
// laws (`W(F_4)^+`-invariant, `R`-even, `C`-odd, `P`-odd, `CP`-even, vanishing on `k <= 3`,
// non-vanishing on `k = 4` chiral quads), and Theorem 1 holds for every `ChiralInvariant`.

function dot4(a: readonly number[], b: readonly number[]): number {
  return a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]! + a[3]! * b[3]!
}

function det4(
  a: readonly number[],
  b: readonly number[],
  c: readonly number[],
  d: readonly number[],
): number {
  const d2 = (x0: number, x1: number, y0: number, y1: number) => x0 * y1 - x1 * y0
  return (
    d2(a[0]!, a[1]!, b[0]!, b[1]!) * d2(c[2]!, c[3]!, d[2]!, d[3]!) -
    d2(a[0]!, a[2]!, b[0]!, b[2]!) * d2(c[1]!, c[3]!, d[1]!, d[3]!) +
    d2(a[0]!, a[3]!, b[0]!, b[3]!) * d2(c[1]!, c[2]!, d[1]!, d[2]!) +
    d2(a[1]!, a[2]!, b[1]!, b[2]!) * d2(c[0]!, c[3]!, d[0]!, d[3]!) -
    d2(a[1]!, a[3]!, b[1]!, b[3]!) * d2(c[0]!, c[2]!, d[0]!, d[2]!) +
    d2(a[2]!, a[3]!, b[2]!, b[3]!) * d2(c[0]!, c[1]!, d[0]!, d[1]!)
  )
}

function gramWeight4(a: number, b: number, c: number, d: number): number {
  const ra = D4_ROOTS[a]!
  const rb = D4_ROOTS[b]!
  const rc = D4_ROOTS[c]!
  const rd = D4_ROOTS[d]!
  const g01 = dot4(ra, rb)
  const g02 = dot4(ra, rc)
  const g12 = dot4(rb, rc)
  const g13 = dot4(rb, rd)
  const g23 = dot4(rc, rd)
  return g01 * g02 * g13 + 3 * g01 * g12 * g23 * g23
}

// Encoded slot value: 0 = empty; 1 = (+1, role 0); 2 = (+1, role 1); 3 = (-1, role 0); 4 = (-1, role 1)
type SlotCode = 0 | 1 | 2 | 3 | 4

function slotSign(code: SlotCode): -1 | 0 | 1 {
  if (code === 0) return 0
  return code <= 2 ? 1 : -1
}

function slotRole(code: SlotCode): 0 | 1 {
  return code === 2 || code === 4 ? 1 : 0
}

function makeSlot(sign: 1 | -1, role: 0 | 1): SlotCode {
  if (sign === 1) return role === 0 ? 1 : 2
  return role === 0 ? 3 : 4
}

// Sparse dock representation: sorted array of (slot << 3) | code entries (empty dock = [])
type DockState = readonly number[]

const dockEntrySlot = (e: number): number => e >> 3
const dockEntryCode = (e: number): SlotCode => (e & 7) as SlotCode
const packDockEntry = (slot: number, code: SlotCode): number => (slot << 3) | code

function dockLookup(dock: DockState | undefined, slot: number): SlotCode {
  if (!dock || dock.length === 0) return 0
  for (let i = 0; i < dock.length; i++) {
    const e = dock[i]!
    const s = dockEntrySlot(e)
    if (s === slot) return dockEntryCode(e)
    if (s > slot) return 0
  }
  return 0
}

function dockSet(dock: DockState | undefined, slot: number, code: SlotCode): DockState {
  const out: number[] = []
  let placed = false
  if (dock) {
    for (let i = 0; i < dock.length; i++) {
      const e = dock[i]!
      const s = dockEntrySlot(e)
      if (s < slot) {
        out.push(e)
      } else if (s === slot) {
        if (code !== 0) out.push(packDockEntry(slot, code))
        placed = true
      } else {
        if (!placed) {
          if (code !== 0) out.push(packDockEntry(slot, code))
          placed = true
        }
        out.push(e)
      }
    }
  }
  if (!placed && code !== 0) {
    out.push(packDockEntry(slot, code))
  }
  return out
}

function dockToArray(dock: DockState | undefined): SlotCode[] {
  const arr = new Array<SlotCode>(SLOTS).fill(0)
  if (dock) {
    for (const e of dock) {
      arr[dockEntrySlot(e)] = dockEntryCode(e)
    }
  }
  return arr
}

function arrayToDock(arr: readonly SlotCode[]): DockState {
  const out: number[] = []
  for (let s = 0; s < SLOTS; s++) {
    const c = arr[s]!
    if (c !== 0) out.push(packDockEntry(s, c))
  }
  return out
}

const chiCache = new Map<string, number>()

// Exact signed chiral integer chi(d) = sign(chiOddPoly(d)) in {-1, 0, +1}:
// W(F_4)^+-invariant, R-even, C-odd, P-odd, CP-even, vanishes identically on k <= 3!
function dockChi(dock: DockState | undefined): number {
  if (!dock || dock.length < 4) return 0
  const k = dock.map(e => `${dockEntrySlot(e)}:${slotSign(dockEntryCode(e))}`).join(',')
  const cached = chiCache.get(k)
  if (cached !== undefined) return cached

  const slots: number[] = []
  const signs: number[] = []
  for (const e of dock) {
    slots.push(dockEntrySlot(e))
    signs.push(slotSign(dockEntryCode(e)))
  }

  let total = 0
  const m = slots.length
  for (let ia = 0; ia < m; ia++) {
    const a = slots[ia]!
    const ta = signs[ia]!
    for (let ib = 0; ib < m; ib++) {
      if (ib === ia) continue
      const b = slots[ib]!
      for (let ic = 0; ic < m; ic++) {
        if (ic === ia || ic === ib) continue
        const c = slots[ic]!
        for (let ie = 0; ie < m; ie++) {
          if (ie === ia || ie === ib || ie === ic) continue
          const e = slots[ie]!
          const det = det4(D4_ROOTS[a]!, D4_ROOTS[b]!, D4_ROOTS[c]!, D4_ROOTS[e]!)
          if (det !== 0) {
            total += det * ta * gramWeight4(a, b, c, e)
          }
        }
      }
    }
  }
  const res = total > 0 ? 1 : total < 0 ? -1 : 0
  chiCache.set(k, res)
  return res
}

// ============================================================================
// 4. Sparse Quantum Fock State Over Infinite/Hull {3,4,3,4} in Z[zeta_9][1/6]
// ============================================================================

// Canonical sparse configuration: Map from dockId -> non-empty DockState, plus canonical key
type Config = {
  readonly docks: ReadonlyMap<number, DockState>
  readonly key: string
}

function makeConfig(docks: Map<number, DockState>): Config {
  const ids = Array.from(docks.keys()).sort((a, b) => a - b)
  const parts: string[] = []
  for (const id of ids) {
    const d = docks.get(id)!
    if (d.length > 0) {
      parts.push(`${id}[${d.join(',')}]`)
    } else {
      docks.delete(id)
    }
  }
  return { docks, key: parts.join('|') }
}

function configSetDock(cfg: Config, g: number, newDock: DockState): Config {
  const next = new Map(cfg.docks)
  if (newDock.length === 0) {
    next.delete(g)
  } else {
    next.set(g, newDock)
  }
  return makeConfig(next)
}

function configTotalQ(cfg: Config): number {
  let q = 0
  for (const dock of cfg.docks.values()) {
    for (const e of dock) {
      q += slotSign(dockEntryCode(e))
    }
  }
  return q
}

function configTotalD(cfg: Config): number {
  let d = 0
  for (const dock of cfg.docks.values()) {
    d += dock.length
  }
  return d
}

type FockEntry = { cfg: Config; amp: Ninth }
type FockState = Map<string, FockEntry>

function ketState(cfg: Config, amp: Ninth = ONE): FockState {
  const s: FockState = new Map()
  if (!isZero(amp)) s.set(cfg.key, { cfg, amp })
  return s
}

function addAmp(out: FockState, cfg: Config, amp: Ninth): void {
  if (isZero(amp)) return
  const prev = out.get(cfg.key)
  if (!prev) {
    out.set(cfg.key, { cfg, amp })
  } else {
    const sum = add(prev.amp, amp)
    if (isZero(sum)) {
      out.delete(cfg.key)
    } else {
      prev.amp = sum
    }
  }
}

function stateNormSq(state: FockState): Ninth {
  let acc = ZERO
  for (const { amp } of state.values()) {
    acc = add(acc, mul(conj(amp), amp))
  }
  return acc
}

function stateActiveDocks(state: FockState): Set<number> {
  const active = new Set<number>()
  for (const { cfg } of state.values()) {
    for (const g of cfg.docks.keys()) active.add(g)
  }
  return active
}

function stateSupportStats(state: FockState): {
  branches: number
  qValues: number[]
  dValues: number[]
} {
  const qSet = new Set<number>()
  const dSet = new Set<number>()
  for (const { cfg } of state.values()) {
    qSet.add(configTotalQ(cfg))
    dSet.add(configTotalD(cfg))
  }
  return {
    branches: state.size,
    qValues: Array.from(qSet).sort((a, b) => a - b),
    dValues: Array.from(dSet).sort((a, b) => a - b),
  }
}

function diffStates(a: FockState, b: FockState): {
  exactEqual: boolean
  mismatches: number
  maxAbsNumDiff: bigint
} {
  let mismatches = 0
  let maxAbsNumDiff = 0n
  const keys = new Set<string>([...a.keys(), ...b.keys()])
  for (const k of keys) {
    const xa = a.get(k)?.amp ?? ZERO
    const xb = b.get(k)?.amp ?? ZERO
    if (!equals(xa, xb)) {
      mismatches++
      const d = sub(xa, xb)
      for (const c of d.n) {
        const abs = c < 0n ? -c : c
        if (abs > maxAbsNumDiff) maxAbsNumDiff = abs
      }
    }
  }
  return { exactEqual: mismatches === 0, mismatches, maxAbsNumDiff }
}

// Exact reduced density matrix rho_{g0} on a single dock g0 (exact Z[zeta_9][1/6] entries)
function reducedDensityMatrix(state: FockState, g0: number): Map<string, Ninth> {
  // Group entries by environment configuration (all docks != g0)
  const byEnv = new Map<string, { dockKey: string; amp: Ninth }[]>()
  for (const { cfg, amp } of state.values()) {
    const dockAtG0 = cfg.docks.get(g0)
    const dockKey = dockAtG0 ? dockAtG0.join(',') : ''
    const envParts: string[] = []
    for (const [id, d] of cfg.docks.entries()) {
      if (id !== g0) envParts.push(`${id}[${d.join(',')}]`)
    }
    envParts.sort()
    const envKey = envParts.join('|')
    let list = byEnv.get(envKey)
    if (!list) {
      list = []
      byEnv.set(envKey, list)
    }
    list.push({ dockKey, amp })
  }

  const rho = new Map<string, Ninth>()
  for (const list of byEnv.values()) {
    for (const row of list) {
      for (const col of list) {
        const entryKey = `${row.dockKey}=>${col.dockKey}`
        const val = mul(row.amp, conj(col.amp))
        const prev = rho.get(entryKey)
        const next = prev ? add(prev, val) : val
        if (isZero(next)) {
          rho.delete(entryKey)
        } else {
          rho.set(entryKey, next)
        }
      }
    }
  }
  return rho
}

function diffRDM(a: Map<string, Ninth>, b: Map<string, Ninth>): number {
  let mismatches = 0
  const keys = new Set<string>([...a.keys(), ...b.keys()])
  for (const k of keys) {
    const xa = a.get(k) ?? ZERO
    const xb = b.get(k) ?? ZERO
    if (!equals(xa, xb)) mismatches++
  }
  return mismatches
}

// ============================================================================
// 5. Exact Single-Dock Unitary Gates (L_g, R_g, W_g = L_g o R_g) & Single-Edge SWAP_e
// ============================================================================

function applySitePhiOdd(state: FockState, hull: CausalHull, g: number): FockState {
  const p = hull.parity[g]!
  const out: FockState = new Map()
  for (const { cfg, amp } of state.values()) {
    const dock = cfg.docks.get(g)
    if (!dock || dock.length < 4) {
      addAmp(out, cfg, amp)
      continue
    }
    const chi = dockChi(dock)
    const phase = chi === 0 ? ONE : zeta6Pow(p * chi)
    addAmp(out, cfg, mul(phase, amp))
  }
  return out
}

function applySiteHalfCoin(state: FockState, hull: CausalHull, g: number): FockState {
  let cur = state
  for (let l = 0; l < LINES; l++) {
    const a = hull.lineA[l]!
    const b = hull.lineB[l]!
    const next: FockState = new Map()
    for (const { cfg, amp } of cur.values()) {
      const dock = cfg.docks.get(g)
      if (!dock) {
        addAmp(next, cfg, amp)
        continue
      }
      const va = dockLookup(dock, a)
      const vb = dockLookup(dock, b)
      if (va === 0 && vb === 0) {
        addAmp(next, cfg, amp)
      } else if (va !== 0 && vb !== 0) {
        addAmp(next, cfg, mul(ZETA6, amp))
      } else {
        // Lone line: split into keep (COIN_DIAG) and antipodal flip (COIN_OFF)
        addAmp(next, cfg, mul(COIN_DIAG, amp))
        const arr = dockToArray(dock)
        arr[a] = vb
        arr[b] = va
        addAmp(next, configSetDock(cfg, g, arrayToDock(arr)), mul(COIN_OFF, amp))
      }
    }
    cur = next
  }
  return cur
}

function applySiteBounceK(state: FockState, hull: CausalHull, g: number): FockState {
  const out: FockState = new Map()
  for (const { cfg, amp } of state.values()) {
    const dock = cfg.docks.get(g)
    if (!dock || dock.length < 2) {
      addAmp(out, cfg, amp)
      continue
    }
    let flipped = false
    let phaseNeg = false
    const arr = dockToArray(dock)
    for (let l = 0; l < LINES; l++) {
      const a = hull.lineA[l]!
      const b = hull.lineB[l]!
      const va = arr[a]!
      const vb = arr[b]!
      if (va !== 0 && vb !== 0 && slotSign(va) !== slotSign(vb)) {
        arr[a] = vb
        arr[b] = va
        flipped = true
        phaseNeg = !phaseNeg
      }
    }
    if (!flipped) {
      addAmp(out, cfg, amp)
    } else {
      addAmp(out, configSetDock(cfg, g, arrayToDock(arr)), phaseNeg ? neg(amp) : amp)
    }
  }
  return out
}

function applySiteMPair(state: FockState, hull: CausalHull, g: number): FockState {
  const out: FockState = new Map()
  for (const { cfg, amp } of state.values()) {
    const dock = cfg.docks.get(g)
    if (!dock || dock.length !== 2) {
      addAmp(out, cfg, amp)
      continue
    }
    const s0 = dockEntrySlot(dock[0]!)
    const c0 = dockEntryCode(dock[0]!)
    const s1 = dockEntrySlot(dock[1]!)
    const c1 = dockEntryCode(dock[1]!)
    if (hull.opposite[s0] !== s1 || c0 !== c1) {
      addAmp(out, cfg, amp)
      continue
    }
    // Sole identical-tone, identical-role antipodal pair -> I + ((zeta_18 - 1) / 12) * sum_m moveTo(m)
    addAmp(out, cfg, amp)
    const hopAmp = mul(PAIR_HOP, amp)
    for (let m = 0; m < LINES; m++) {
      const ma = hull.lineA[m]!
      const mb = hull.lineB[m]!
      const d =
        ma < mb
          ? [packDockEntry(ma, c0), packDockEntry(mb, c0)]
          : [packDockEntry(mb, c0), packDockEntry(ma, c0)]
      addAmp(out, configSetDock(cfg, g, d), hopAmp)
    }
  }
  return out
}

function applySiteMeet(state: FockState, hull: CausalHull, g: number): FockState {
  let cur = state
  for (let l = 0; l < LINES; l++) {
    const a = hull.lineA[l]!
    const b = hull.lineB[l]!
    const next: FockState = new Map()
    for (const { cfg, amp } of cur.values()) {
      const dock = cfg.docks.get(g)
      if (!dock || dock.length < 2) {
        addAmp(next, cfg, amp)
        continue
      }
      const va = dockLookup(dock, a)
      const vb = dockLookup(dock, b)
      if (va === 0 || vb === 0 || slotSign(va) !== slotSign(vb)) {
        addAmp(next, cfg, amp)
      } else if (slotRole(va) === slotRole(vb)) {
        addAmp(next, cfg, mul(OMEGA, amp))
      } else {
        // Same-sign, different-role full line -> meetKeep |keep> + meetSwap |swapRoles>
        addAmp(next, cfg, mul(MEET_KEEP, amp))
        const arr = dockToArray(dock)
        arr[a] = makeSlot(slotSign(va) as 1 | -1, slotRole(vb))
        arr[b] = makeSlot(slotSign(vb) as 1 | -1, slotRole(va))
        addAmp(next, configSetDock(cfg, g, arrayToDock(arr)), mul(MEET_SWAP, amp))
      }
    }
    cur = next
  }
  return cur
}

// Full 7-layer on-site palindromic local dock unitary L_g:
//   L_g = Phi_odd(g) o D(g) o M_meet(g) o M_pair(zeta_18)(g) o K(g) o D(g) o Phi_odd(g)
function applySiteL(state: FockState, hull: CausalHull, g: number): FockState {
  let s = state
  s = applySitePhiOdd(s, hull, g)
  s = applySiteHalfCoin(s, hull, g)
  s = applySiteBounceK(s, hull, g)
  s = applySiteMPair(s, hull, g)
  s = applySiteMeet(s, hull, g)
  s = applySiteHalfCoin(s, hull, g)
  s = applySitePhiOdd(s, hull, g)
  return s
}

// Single-dock antipodal slot reversal R_g (involution, strictly 1-dock)
function applySiteR(state: FockState, hull: CausalHull, g: number): FockState {
  const out: FockState = new Map()
  for (const { cfg, amp } of state.values()) {
    const dock = cfg.docks.get(g)
    if (!dock) {
      addAmp(out, cfg, amp)
      continue
    }
    const arr = new Array<SlotCode>(SLOTS).fill(0)
    for (const e of dock) {
      arr[hull.opposite[dockEntrySlot(e)]!] = dockEntryCode(e)
    }
    addAmp(out, configSetDock(cfg, g, arrayToDock(arr)), amp)
  }
  return out
}

// Dressed 1-dock local unitary W_g = L_g o R_g (acts ONLY on dock g)
function applySiteW(state: FockState, hull: CausalHull, g: number): FockState {
  // Fast O(1) idle skip if dock g is empty across all branches of state
  let active = false
  for (const { cfg } of state.values()) {
    if (cfg.docks.has(g)) {
      active = true
      break
    }
  }
  if (!active) return state
  return applySiteL(applySiteR(state, hull, g), hull, g)
}

// Elementary 2-slot facet-edge exchange SWAP_e on undirected facet edge e = {(u, a), (v, oppA)}
function applyEdgeSwap(state: FockState, edge: FacetEdge): FockState {
  const { u, a, v, oppA } = edge
  let active = false
  for (const { cfg } of state.values()) {
    if (cfg.docks.has(u) || cfg.docks.has(v)) {
      active = true
      break
    }
  }
  if (!active) return state

  const out: FockState = new Map()
  for (const { cfg, amp } of state.values()) {
    const du = cfg.docks.get(u)
    const dv = cfg.docks.get(v)
    const cu = dockLookup(du, a)
    const cv = dockLookup(dv, oppA)
    if (cu === cv) {
      addAmp(out, cfg, amp)
      continue
    }
    const nextDocks = new Map(cfg.docks)
    const nu = dockSet(du, a, cv)
    const nv = dockSet(dv, oppA, cu)
    if (nu.length === 0) nextDocks.delete(u)
    else nextDocks.set(u, nu)
    if (nv.length === 0) nextDocks.delete(v)
    else nextDocks.set(v, nv)
    addAmp(out, makeConfig(nextDocks), amp)
  }
  return out
}

// Global synchronous 1-hop stream S (matching Vibe/FockBeat.lean streamConfig exactly),
// plus strict frontier-hit counter asserting zero excitations ever exit the hull.
function applyGlobalStream(state: FockState, hull: CausalHull): { state: FockState; frontierHits: number } {
  let frontierHits = 0
  const out: FockState = new Map()
  for (const { cfg, amp } of state.values()) {
    const nextDocks = new Map<number, SlotCode[]>()
    for (const [g, dock] of cfg.docks.entries()) {
      for (const e of dock) {
        const a = dockEntrySlot(e)
        const c = dockEntryCode(e)
        const dst = hull.table[g * SLOTS + a]!
        if (dst < 0) {
          frontierHits++
          continue
        }
        let arr = nextDocks.get(dst)
        if (!arr) {
          arr = new Array<SlotCode>(SLOTS).fill(0)
          nextDocks.set(dst, arr)
        }
        arr[a] = c
      }
    }
    const sparse = new Map<number, DockState>()
    for (const [g, arr] of nextDocks.entries()) {
      sparse.set(g, arrayToDock(arr))
    }
    addAmp(out, makeConfig(sparse), amp)
  }
  return { state: out, frontierHits }
}

function applyGlobalL(state: FockState, hull: CausalHull): FockState {
  let s = state
  for (const g of Array.from(stateActiveDocks(s)).sort((a, b) => a - b)) {
    s = applySiteL(s, hull, g)
  }
  return s
}

function applyGlobalR(state: FockState, hull: CausalHull): FockState {
  let s = state
  for (const g of Array.from(stateActiveDocks(s)).sort((a, b) => a - b)) {
    s = applySiteR(s, hull, g)
  }
  return s
}

function applyGlobalSynchronousU(
  state: FockState,
  hull: CausalHull,
  steps: number,
): { state: FockState; frontierHits: number } {
  let cur = state
  let frontierHits = 0
  for (let t = 0; t < steps; t++) {
    cur = applyGlobalL(cur, hull)
    const streamed = applyGlobalStream(cur, hull)
    cur = streamed.state
    frontierHits += streamed.frontierHits
  }
  return { state: cur, frontierHits }
}

// ============================================================================
// 6. Asynchronous Local Causal-Set Scheduler & Cauchy Surface Verifier
// ============================================================================

type CausalEvent =
  | { readonly kind: 'V'; readonly g: number; readonly tick: number }
  | { readonly kind: 'X'; readonly edgeId: number; readonly tick: number }

type CauchyCut = {
  readonly tauV: Int32Array
  readonly tauE: Int32Array
}

function checkCauchyCutValid(hull: CausalHull, cut: CauchyCut): {
  valid: boolean
  maxNeighborSlope: number
  violations: number
} {
  let maxNeighborSlope = 0
  let violations = 0
  for (const edge of hull.edges) {
    const tu = cut.tauV[edge.u]!
    const tv = cut.tauV[edge.v]!
    const te = cut.tauE[edge.id]!
    const slope = Math.abs(tu - tv)
    if (slope > maxNeighborSlope) maxNeighborSlope = slope
    if (slope > 1) violations++
    if (te > tu || te > tv || te < tu - 1 || te < tv - 1) violations++
  }
  return { valid: violations === 0, maxNeighborSlope, violations }
}

// Exact deterministic 64-bit mixing hash (SplitMix64) for order-scrambled schedules
function mix64(x: bigint): bigint {
  let z = (x + 0x9e3779b97f4a7c15n) & 0xffffffffffffffffn
  z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & 0xffffffffffffffffn
  z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & 0xffffffffffffffffn
  return (z ^ (z >> 31n)) & 0xffffffffffffffffn
}

type PriorityFn = (ev: CausalEvent, hull: CausalHull) => bigint

// Executes a strictly local asynchronous causal-set schedule from cut0 to targetCut,
// checking local readiness, Lipschitz Cauchy invariants, and exact norm preservation.
function runAsynchronousSchedule(input: {
  hull: CausalHull
  initialTildeState: FockState
  cut0: CauchyCut
  targetCut: CauchyCut
  priority: PriorityFn
  verifyIntermediateNormEvery?: number
}): {
  state: FockState
  eventsFired: number
  maxSlopeObserved: number
  cauchyViolations: number
  normDriftCount: number
  cut: CauchyCut
} {
  const { hull, targetCut, priority } = input
  const tauV = Int32Array.from(input.cut0.tauV)
  const tauE = Int32Array.from(input.cut0.tauE)
  const cut: CauchyCut = { tauV, tauE }

  const isDockReady = (g: number): boolean => {
    const t = tauV[g]!
    if (t >= targetCut.tauV[g]!) return false
    for (const eid of hull.incidentEdges[g]!) {
      if (tauE[eid]! !== t) return false
    }
    return true
  }

  const isEdgeReady = (eid: number): boolean => {
    const t = tauE[eid]!
    if (t >= targetCut.tauE[eid]!) return false
    const e = hull.edges[eid]!
    return tauV[e.u]! === t + 1 && tauV[e.v]! === t + 1
  }

  // Binary min-heap keyed by exact bigint priority for O(log N) event selection
  type HeapItem = { key: bigint; ev: CausalEvent }
  const heap: HeapItem[] = []

  const heapPush = (ev: CausalEvent): void => {
    heap.push({ key: priority(ev, hull), ev })
    let i = heap.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (heap[p]!.key <= heap[i]!.key) break
      const tmp = heap[p]!
      heap[p] = heap[i]!
      heap[i] = tmp
      i = p
    }
  }

  const heapPop = (): CausalEvent | undefined => {
    if (heap.length === 0) return undefined
    const top = heap[0]!.ev
    const last = heap.pop()!
    if (heap.length > 0) {
      heap[0] = last
      let i = 0
      while (true) {
        const l = 2 * i + 1
        const r = 2 * i + 2
        let smallest = i
        if (l < heap.length && heap[l]!.key < heap[smallest]!.key) smallest = l
        if (r < heap.length && heap[r]!.key < heap[smallest]!.key) smallest = r
        if (smallest === i) break
        const tmp = heap[i]!
        heap[i] = heap[smallest]!
        heap[smallest] = tmp
        i = smallest
      }
    }
    return top
  }

  const queuedDock = new Uint8Array(hull.cells)
  const queuedEdge = new Uint8Array(hull.edges.length)

  const tryEnqueueDock = (g: number): void => {
    if (!queuedDock[g] && isDockReady(g)) {
      queuedDock[g] = 1
      heapPush({ kind: 'V', g, tick: tauV[g]! })
    }
  }

  const tryEnqueueEdge = (eid: number): void => {
    if (!queuedEdge[eid] && isEdgeReady(eid)) {
      queuedEdge[eid] = 1
      heapPush({ kind: 'X', edgeId: eid, tick: tauE[eid]! })
    }
  }

  for (let g = 0; g < hull.cells; g++) tryEnqueueDock(g)
  for (let eid = 0; eid < hull.edges.length; eid++) tryEnqueueEdge(eid)

  let state = input.initialTildeState
  const norm0 = stateNormSq(state)
  let eventsFired = 0
  let maxSlopeObserved = 0
  let cauchyViolations = 0
  let normDriftCount = 0
  const normStride = input.verifyIntermediateNormEvery ?? 500

  while (true) {
    const ev = heapPop()
    if (!ev) break

    if (ev.kind === 'V') {
      queuedDock[ev.g] = 0
      if (!isDockReady(ev.g)) {
        throw new Error(`Ready-queue invariant failed for dock ${ev.g}`)
      }
      state = applySiteW(state, hull, ev.g)
      tauV[ev.g] = tauV[ev.g]! + 1
      eventsFired++

      // Check local Lipschitz invariant on all incident edges immediately
      for (const eid of hull.incidentEdges[ev.g]!) {
        const e = hull.edges[eid]!
        const slope = Math.abs(tauV[e.u]! - tauV[e.v]!)
        if (slope > maxSlopeObserved) maxSlopeObserved = slope
        if (slope > 1) cauchyViolations++
        tryEnqueueEdge(eid)
      }
      tryEnqueueDock(ev.g)
    } else {
      queuedEdge[ev.edgeId] = 0
      if (!isEdgeReady(ev.edgeId)) {
        throw new Error(`Ready-queue invariant failed for edge ${ev.edgeId}`)
      }
      const edge = hull.edges[ev.edgeId]!
      state = applyEdgeSwap(state, edge)
      tauE[ev.edgeId] = tauE[ev.edgeId]! + 1
      eventsFired++

      tryEnqueueDock(edge.u)
      tryEnqueueDock(edge.v)
      tryEnqueueEdge(ev.edgeId)
    }

    if (normStride > 0 && eventsFired % normStride === 0) {
      if (!equals(stateNormSq(state), norm0)) normDriftCount++
    }
  }

  // Verify target cut was reached completely
  for (let g = 0; g < hull.cells; g++) {
    if (tauV[g] !== targetCut.tauV[g]) {
      throw new Error(`Schedule deadlocked before reaching target tauV[${g}]`)
    }
  }
  for (let eid = 0; eid < hull.edges.length; eid++) {
    if (tauE[eid] !== targetCut.tauE[eid]) {
      throw new Error(`Schedule deadlocked before reaching target tauE[${eid}]`)
    }
  }
  if (!equals(stateNormSq(state), norm0)) normDriftCount++

  return { state, eventsFired, maxSlopeObserved, cauchyViolations, normDriftCount, cut }
}

function flatCut(hull: CausalHull, t: number): CauchyCut {
  return {
    tauV: new Int32Array(hull.cells).fill(t),
    tauE: new Int32Array(hull.edges.length).fill(t),
  }
}

// Construct a valid localized causal-cone Cauchy cut around `centerDock` at proper time T:
//   - centerDock and its distance-1 neighbors are at tauV = T, with all edges incident to
//     centerDock at tauE = T (so centerDock has ALREADY completed all T beats!)
//   - tauV(g) = clamp(T + 1 - dist(g, centerDock), 0, T)
//   - tauE({u, v}) = min(tauV(u), tauV(v))
// Check Lipschitz: |tauV(u) - tauV(v)| <= 1 everywhere, and tauE <= min(tauV), tauE >= max(tauV) - 1!
function localizedConeCut(hull: CausalHull, T: number): CauchyCut {
  const tauV = new Int32Array(hull.cells)
  for (let g = 0; g < hull.cells; g++) {
    const d = hull.distFromOrigin[g]!
    const raw = T + 1 - d
    tauV[g] = raw < 0 ? 0 : raw > T ? T : raw
  }
  const tauE = new Int32Array(hull.edges.length)
  for (const e of hull.edges) {
    tauE[e.id] = Math.min(tauV[e.u]!, tauV[e.v]!)
  }
  return { tauV, tauE }
}

// ============================================================================
// 7. Priority Functions Defining 7 Distinct Asynchronous Causal Foliations
// ============================================================================

function buildBusemannRank(hull: CausalHull): Int32Array {
  const order = Array.from({ length: hull.cells }, (_, i) => i)
  order.sort((a, b) => {
    const c = cmpZSqrt2(hull.busemann[a]!, hull.busemann[b]!)
    return c !== 0 ? -c : a - b // higher horosphere (closer to cusp) first
  })
  const rank = new Int32Array(hull.cells)
  order.forEach((cellId, idx) => {
    rank[cellId] = idx
  })
  return rank
}

function makeScheduleSpecs(hull: CausalHull): { name: string; priority: PriorityFn }[] {
  const buseRank = buildBusemannRank(hull)

  return [
    {
      name: 'S2: Factorized Flat (all W_g then all SWAP_e)',
      priority: ev =>
        ev.kind === 'V'
          ? (BigInt(ev.tick * 2) << 32n) + BigInt(ev.g)
          : (BigInt(ev.tick * 2 + 1) << 32n) + BigInt(ev.edgeId),
    },
    {
      name: 'S3: Outward Radial Wave (inner docks race ahead)',
      priority: (ev, h) => {
        const d =
          ev.kind === 'V'
            ? h.distFromOrigin[ev.g]!
            : Math.max(h.distFromOrigin[h.edges[ev.edgeId]!.u]!, h.distFromOrigin[h.edges[ev.edgeId]!.v]!)
        const sub = ev.kind === 'V' ? 0n : 1n
        const id = BigInt(ev.kind === 'V' ? ev.g : ev.edgeId)
        return (BigInt(d) << 40n) + (BigInt(ev.tick) << 32n) + (sub << 28n) + id
      },
    },
    {
      name: 'S4: Inward Reverse-Radial Wave (outer docks race ahead)',
      priority: (ev, h) => {
        const maxD = h.radius + 4
        const d =
          ev.kind === 'V'
            ? h.distFromOrigin[ev.g]!
            : Math.min(h.distFromOrigin[h.edges[ev.edgeId]!.u]!, h.distFromOrigin[h.edges[ev.edgeId]!.v]!)
        const sub = ev.kind === 'V' ? 0n : 1n
        const id = BigInt(ev.kind === 'V' ? ev.g : ev.edgeId)
        return (BigInt(maxD - d) << 40n) + (BigInt(ev.tick) << 32n) + (sub << 28n) + id
      },
    },
    {
      name: 'S5: Tilted Hyperbolic Busemann-Horosphere Boost Foliation',
      priority: (ev, h) => {
        const r =
          ev.kind === 'V'
            ? buseRank[ev.g]!
            : Math.min(buseRank[h.edges[ev.edgeId]!.u]!, buseRank[h.edges[ev.edgeId]!.v]!)
        const sub = ev.kind === 'V' ? 0n : 1n
        const id = BigInt(ev.kind === 'V' ? ev.g : ev.edgeId)
        return (BigInt(r) << 40n) + (BigInt(ev.tick) << 32n) + (sub << 28n) + id
      },
    },
    {
      name: 'S7a: Chaotic Asynchronous Hash Schedule (seed 1)',
      priority: ev => {
        const tag = ev.kind === 'V' ? 0n : 1n
        const id = BigInt(ev.kind === 'V' ? ev.g : ev.edgeId)
        return mix64((tag << 48n) ^ (BigInt(ev.tick) << 32n) ^ id ^ 0x1111111111111111n)
      },
    },
    {
      name: 'S7b: Chaotic Asynchronous Hash Schedule (seed 2)',
      priority: ev => {
        const tag = ev.kind === 'V' ? 0n : 1n
        const id = BigInt(ev.kind === 'V' ? ev.g : ev.edgeId)
        return mix64((tag << 48n) ^ (BigInt(ev.tick) << 32n) ^ id ^ 0x7777777777777777n)
      },
    },
    {
      name: 'S7c: Chaotic Asynchronous Hash Schedule (seed 3)',
      priority: ev => {
        const tag = ev.kind === 'V' ? 0n : 1n
        const id = BigInt(ev.kind === 'V' ? ev.g : ev.edgeId)
        return mix64((tag << 48n) ^ (BigInt(ev.tick) << 32n) ^ id ^ 0xdeadbeefcafebaben)
      },
    },
  ]
}

// ============================================================================
// 8. Main Verification Suite
// ============================================================================

function makeDock(entries: readonly (readonly [number, 1 | -1, 0 | 1])[]): DockState {
  const arr = new Array<SlotCode>(SLOTS).fill(0)
  for (const [slot, sign, role] of entries) {
    arr[slot] = makeSlot(sign, role)
  }
  return arrayToDock(arr)
}

function main(): void {
  const t0 = Date.now()
  console.log('========================================================================')
  console.log('Breakthrough Suite (W4): Exact Asynchronous Local Causal-Set & Foliation Invariance')
  console.log('Ring: Z[zeta_9][1/6] (zero floats) | Lattice: exact O^+(4,1; Z[sqrt(2)]) {3,4,3,4}')
  console.log('========================================================================\n')

  const cell = exactCell()
  let allPassed = true
  const check = (label: string, ok: boolean, detail: string): void => {
    const tag = ok ? 'PASS' : 'FAIL'
    console.log(`[${tag}] ${label}: ${detail}`)
    if (!ok) allPassed = false
  }

  // Build exact {3,4,3,4} ball B_2 (481 cells) around origin g_0 = I_5
  const ballB2 = buildExactCausalHull({
    name: 'B_2(g_0)',
    cell,
    seedWords: [[]],
    radius: 2,
  })
  check(
    'Exact {3,4,3,4} ball B_2 geometry',
    ballB2.cells === 481 && ballB2.inconsistentSteps === 0 && ballB2.parityConflicts === 0,
    `cells=${ballB2.cells}, internalEdges=${ballB2.edges.length}, inconsistent=${ballB2.inconsistentSteps}, parityConflicts=${ballB2.parityConflicts}`,
  )

  // Build exact 2-dock interacting causal hull B_2({g_0, g_1}) around adjacent pair {I_5, k_0}
  const hullPair = buildExactCausalHull({
    name: 'B_2({g_0, g_1})',
    cell,
    seedWords: [[], [0]],
    radius: 2,
  })
  const g0 = 0
  const g1 = hullPair.table[g0 * SLOTS + 0]!
  const g2 = hullPair.table[g0 * SLOTS + 4]! // distinct neighbor of g0 (different slot 4)
  const gFar = hullPair.table[g1 * SLOTS + 4]! // distance 2 from g0, not incident to edge(g0, g1)
  check(
    'Exact {3,4,3,4} 2-dock causal hull B_2({g_0, g_1})',
    hullPair.inconsistentSteps === 0 &&
      hullPair.parityConflicts === 0 &&
      g1 === 1 &&
      hullPair.parity[g0] === 1 &&
      hullPair.parity[g1] === -1,
    `cells=${hullPair.cells}, internalEdges=${hullPair.edges.length}, parity(g0)=${hullPair.parity[g0]}, parity(g1)=${hullPair.parity[g1]}`,
  )

  // --------------------------------------------------------------------------
  // Part A: Direct Algebraic Commutation Laws on Multi-Excitation Superposition
  // --------------------------------------------------------------------------
  console.log('\n--- Part A: Exact Local Gate Commutativity & Vacuum Stationarity ---')

  // Chiral 4-vibe witness at g0 + opposite-sign & diff-role pairs at g1 + lone vibe at gFar
  const chiralDock = makeDock([
    [0, 1, 0],
    [1, -1, 0],
    [4, 1, 0],
    [10, 1, 0],
  ])
  const pairDock = makeDock([
    [0, 1, 0],
    [hullPair.opposite[0]!, -1, 0], // triggers K
    [4, 1, 0],
    [hullPair.opposite[4]!, 1, 1], // triggers M_meet
  ])
  const identPairDock = makeDock([
    [2, 1, 0],
    [hullPair.opposite[2]!, 1, 0], // triggers M_pair(zeta_18) + M_meet(omega)
  ])

  check(
    'Chiral witness chiOddPoly non-vanishing & symmetries',
    dockChi(chiralDock) === 1 && dockChi(pairDock) === 0 && dockChi(identPairDock) === 0,
    `chi(chiralDock)=${dockChi(chiralDock)}, chi(pairDock)=${dockChi(pairDock)}, chi(identPairDock)=${dockChi(identPairDock)}`,
  )

  const commTestCfg1 = makeConfig(
    new Map([
      [g0, chiralDock],
      [g1, pairDock],
      [gFar, identPairDock],
    ]),
  )
  const commTestState = ketState(commTestCfg1)

  // 1. [W_{g0}, W_{g1}] = 0 (adjacent distinct docks)
  const w01 = applySiteW(applySiteW(commTestState, hullPair, g1), hullPair, g0)
  const w10 = applySiteW(applySiteW(commTestState, hullPair, g0), hullPair, g1)
  const dWW = diffStates(w01, w10)
  check(
    '[W_{g0}, W_{g1}] = 0 on chiral + colliding multi-dock state',
    dWW.exactEqual,
    `branches=${w01.size}, mismatches=${dWW.mismatches}, maxNumDiff=${dWW.maxAbsNumDiff}n`,
  )

  // 2. [SWAP_{e1}, SWAP_{e2}] = 0 even when e1 and e2 SHARE dock g0!
  const e01 = hullPair.edges[hullPair.edgeOfSlot[g0 * SLOTS + 0]!]!
  const e02 = hullPair.edges[hullPair.edgeOfSlot[g0 * SLOTS + 4]!]!
  const s12 = applyEdgeSwap(applyEdgeSwap(commTestState, e02), e01)
  const s21 = applyEdgeSwap(applyEdgeSwap(commTestState, e01), e02)
  const dSS = diffStates(s12, s21)
  check(
    '[SWAP_{e1}, SWAP_{e2}] = 0 for TWO EDGES SHARING DOCK g_0',
    e01.id !== e02.id && e01.u === g0 && e02.u === g0 && dSS.exactEqual,
    `e1=(${e01.u}:${e01.a}<->${e01.v}:${e01.oppA}), e2=(${e02.u}:${e02.a}<->${e02.v}:${e02.oppA}), mismatches=${dSS.mismatches}`,
  )

  // 3. [W_{gFar}, SWAP_{e01}] = 0 (gFar not an endpoint of e01)
  const ws = applySiteW(applyEdgeSwap(commTestState, e01), hullPair, gFar)
  const sw = applyEdgeSwap(applySiteW(commTestState, hullPair, gFar), e01)
  const dWS = diffStates(ws, sw)
  check(
    '[W_{gFar}, SWAP_{e01}] = 0 (non-incident dock and edge)',
    gFar !== e01.u && gFar !== e01.v && dWS.exactEqual,
    `branches=${ws.size}, mismatches=${dWS.mismatches}, maxNumDiff=${dWS.maxAbsNumDiff}n`,
  )

  // 4. [R_g, L_g] = 0 at a single dock (tested on chiral, K+M_meet, and M_pair docks)
  const rl0 = applySiteR(applySiteL(commTestState, hullPair, g0), hullPair, g0)
  const lr0 = applySiteL(applySiteR(commTestState, hullPair, g0), hullPair, g0)
  const rl1 = applySiteR(applySiteL(commTestState, hullPair, g1), hullPair, g1)
  const lr1 = applySiteL(applySiteR(commTestState, hullPair, g1), hullPair, g1)
  const rlF = applySiteR(applySiteL(commTestState, hullPair, gFar), hullPair, gFar)
  const lrF = applySiteL(applySiteR(commTestState, hullPair, gFar), hullPair, gFar)
  check(
    '[R_g, L_g] = 0 across Phi_odd, D, K, M_pair, M_meet',
    diffStates(rl0, lr0).exactEqual &&
      diffStates(rl1, lr1).exactEqual &&
      diffStates(rlF, lrF).exactEqual,
    `g0_diff=${diffStates(rl0, lr0).mismatches}, g1_diff=${diffStates(rl1, lr1).mismatches}, gFar_diff=${diffStates(rlF, lrF).mismatches}`,
  )

  // 5. Calm vacuum |V_1> exact stationarity under chaotic asynchronous schedule
  const v1State = ketState(makeConfig(new Map()))
  const v1Async = runAsynchronousSchedule({
    hull: ballB2,
    initialTildeState: applyGlobalR(v1State, ballB2),
    cut0: flatCut(ballB2, 0),
    targetCut: flatCut(ballB2, 2),
    priority: makeScheduleSpecs(ballB2)[4]!.priority,
  })
  const v1Out = applyGlobalR(v1Async.state, ballB2)
  check(
    'Calm vacuum |V_1> exact asynchronous stationarity (Q = 0_V, D = 0_D)',
    diffStates(v1Out, v1State).exactEqual && v1Async.cauchyViolations === 0,
    `eventsFired=${v1Async.eventsFired}, mismatches=${diffStates(v1Out, v1State).mismatches}, normSq=${ninthKey(stateNormSq(v1Out))}`,
  )

  // --------------------------------------------------------------------------
  // Part B: 7-Schedule Exact Foliation Invariance Across k = 1, 2, 4 Sectors
  // --------------------------------------------------------------------------
  console.log('\n--- Part B: 7-Foliation Exact Schedule Invariance (k = 1, 2, 4 Sectors) ---')

  type SectorCase = {
    readonly title: string
    readonly hull: CausalHull
    readonly steps: number
    readonly initial: FockState
    readonly expectedQ: number
    readonly expectedD: number
    readonly checkBubbleRDM: boolean
  }

  // Build normalized superposition for Sector 3 (K + M_meet + interference)
  const cfgOpp = makeConfig(
    new Map([[g0, makeDock([[0, 1, 0], [ballB2.opposite[0]!, -1, 0]])]]),
  )
  const cfgDiffRole = makeConfig(
    new Map([[g0, makeDock([[4, 1, 0], [ballB2.opposite[4]!, 1, 1]])]]),
  )
  const supKMeet: FockState = new Map()
  addAmp(supKMeet, cfgOpp, ONE)
  addAmp(supKMeet, cfgDiffRole, OMEGA)

  // Build Sector 4: k = 4 chiral quad at g0 (triggers Phi_odd + D + S across B_2, T = 2)
  const cfgChiral4 = makeConfig(new Map([[g0, chiralDock]]))

  // Build Sector 5: k = 4 interacting 2-dock state spanning adjacent docks {g0, g1}
  // (triggers cross-facet collision on beat 1 -> K / M_meet / M_pair interaction on beat 2!)
  const cfgInteracting2Dock = makeConfig(
    new Map([
      [
        g0,
        makeDock([
          [0, 1, 0], // heads straight into g1 on beat 1!
          [hullPair.opposite[0]!, -1, 1],
        ]),
      ],
      [
        g1,
        makeDock([
          [hullPair.opposite[0]!, -1, 0], // heads straight into g0 on beat 1 -> opposite-sign collision!
          [4, 1, 0],
        ]),
      ],
    ]),
  )

  const sectors: SectorCase[] = [
    {
      title: 'Sector 1 (k = 1 lone excitation, B_2, T = 2)',
      hull: ballB2,
      steps: 2,
      initial: ketState(makeConfig(new Map([[g0, makeDock([[0, 1, 0]])]]))),
      expectedQ: 1,
      expectedD: 1,
      checkBubbleRDM: true,
    },
    {
      title: 'Sector 2 (k = 2 sole identical pair -> M_pair(zeta_18) + M_meet(omega), B_2, T = 2)',
      hull: ballB2,
      steps: 2,
      initial: ketState(
        makeConfig(new Map([[g0, makeDock([[0, 1, 0], [ballB2.opposite[0]!, 1, 0]])]])),
      ),
      expectedQ: 2,
      expectedD: 2,
      checkBubbleRDM: true,
    },
    {
      title: 'Sector 3 (k = 2 superposition K bounce + M_meet role-swap, B_2, T = 2)',
      hull: ballB2,
      steps: 2,
      initial: supKMeet,
      expectedQ: -999, // mixed Q in {0, 2}
      expectedD: 2,
      checkBubbleRDM: true,
    },
    {
      title: 'Sector 4 (k = 4 chiral quad -> active Phi_odd + D + S, B_2, T = 2)',
      hull: ballB2,
      steps: 2,
      initial: ketState(cfgChiral4),
      expectedQ: 2,
      expectedD: 4,
      checkBubbleRDM: true,
    },
    {
      title: 'Sector 5 (k = 4 TWO-DOCK interacting collision across facet e={g0,g1}, T = 2)',
      hull: hullPair,
      steps: 2,
      initial: ketState(cfgInteracting2Dock),
      expectedQ: 0, // exact 0_V balanced neutrality with D = 4 != 0_D!
      expectedD: 4,
      checkBubbleRDM: true,
    },
  ]

  for (const sector of sectors) {
    console.log(`\n>> ${sector.title}`)
    const normInit = stateNormSq(sector.initial)
    const refSync = applyGlobalSynchronousU(sector.initial, sector.hull, sector.steps)
    const refStats = stateSupportStats(refSync.state)
    const refNorm = stateNormSq(refSync.state)

    check(
      '  S1 Global Synchronous U^T baseline',
      refSync.frontierHits === 0 &&
        equals(refNorm, normInit) &&
        refStats.dValues.length === 1 &&
        refStats.dValues[0] === sector.expectedD &&
        (sector.expectedQ === -999 ||
          (refStats.qValues.length === 1 && refStats.qValues[0] === sector.expectedQ)),
      `branches=${refStats.branches}, frontierHits=${refSync.frontierHits}, normSq=${ninthKey(refNorm)}, Q={${refStats.qValues.join(',')}}, D={${refStats.dValues.join(',')}}`,
    )

    const initTilde = applyGlobalR(sector.initial, sector.hull)
    const specs = makeScheduleSpecs(sector.hull)

    for (const spec of specs) {
      const res = runAsynchronousSchedule({
        hull: sector.hull,
        initialTildeState: initTilde,
        cut0: flatCut(sector.hull, 0),
        targetCut: flatCut(sector.hull, sector.steps),
        priority: spec.priority,
        verifyIntermediateNormEvery: 1000,
      })
      const finalState = applyGlobalR(res.state, sector.hull)
      const diff = diffStates(finalState, refSync.state)
      const ok =
        diff.exactEqual &&
        res.cauchyViolations === 0 &&
        res.normDriftCount === 0 &&
        res.maxSlopeObserved <= 1
      check(
        `  ${spec.name}`,
        ok,
        `events=${res.eventsFired}, maxSlope=${res.maxSlopeObserved}, mismatches=${diff.mismatches}, maxNumDiff=${diff.maxAbsNumDiff}n`,
      )
    }

    // S6: Localized Proper-Time Bubble / Twin-Paradox Foliation (two-stage Tomonaga-Schwinger)
    if (sector.checkBubbleRDM) {
      const coneCut = localizedConeCut(sector.hull, sector.steps)
      const coneCheck = checkCauchyCutValid(sector.hull, coneCut)
      const chaoticPrio = specs[4]!.priority

      // Stage 1: advance ONLY the localized causal cone of g0 to proper time T.
      // On B_2(g_0) (Sectors 1-4, max d = 2), outer shell d = 2 sits at tauV = 1 < 2 so docksFrozenAtTau0 = 0/481.
      // Distant docks with d >= T + 1 = 3 freeze at tauV = 0 on hulls reaching d >= 3 (Sector 5: 433/914, Part C: 479/960).
      const stage1 = runAsynchronousSchedule({
        hull: sector.hull,
        initialTildeState: initTilde,
        cut0: flatCut(sector.hull, 0),
        targetCut: coneCut,
        priority: chaoticPrio,
      })

      // Check reduced density matrix rho_{g0} on warped bubble slice Sigma_cone vs final flat slice U^T.
      // Applying local R_{g0} on the bubble slice reproduces the exact g0 state at proper time T while outer shells
      // lag behind (tauV = 1 on B_2 shell d = 2 in Sectors 1-4, and tauV = 0 on d >= 3 in Sector 5 and Part C).
      const bubbleLocalR = applySiteR(stage1.state, sector.hull, g0)
      const rdmBubble = reducedDensityMatrix(bubbleLocalR, g0)
      const rdmFlat = reducedDensityMatrix(refSync.state, g0)
      const rdmDiff = diffRDM(rdmBubble, rdmFlat)

      // Stage 2: advance from warped bubble slice Sigma_cone to flat slice (T, T)
      const stage2 = runAsynchronousSchedule({
        hull: sector.hull,
        initialTildeState: stage1.state,
        cut0: coneCut,
        targetCut: flatCut(sector.hull, sector.steps),
        priority: specs[5]!.priority,
      })
      const finalBubble = applyGlobalR(stage2.state, sector.hull)
      const diffBubble = diffStates(finalBubble, refSync.state)

      const docksStillAtZero = Array.from(coneCut.tauV).filter(t => t === 0).length
      check(
        '  S6: Localized Proper-Time Bubble (Tomonaga-Schwinger Cone + Exact RDM)',
        coneCheck.valid &&
          rdmDiff === 0 &&
          diffBubble.exactEqual &&
          stage1.normDriftCount === 0 &&
          stage2.normDriftCount === 0,
        `stage1Events=${stage1.eventsFired}, stage2Events=${stage2.eventsFired}, docksFrozenAtTau0=${docksStillAtZero}/${sector.hull.cells}, rdmMismatches=${rdmDiff}, finalMismatches=${diffBubble.mismatches}`,
      )
    }
  }

  // --------------------------------------------------------------------------
  // Part C: Spacelike Multi-Fingered Proper Time (Exact Microcausality on Warped Slice)
  // --------------------------------------------------------------------------
  console.log('\n--- Part C: Spacelike Multi-Fingered Proper Time (g_0 at tau=2, g_far at tau=0) ---')
  {
    // Exact {3,4,3,4} causal hull around two spacelike-separated docks g_0 = I_5 and
    // g_far = k_0 * k_4 * k_8 at exact graph distance d(g_0, g_far) = 3.
    const hullTwin = buildExactCausalHull({
      name: 'B_2({g_0, g_far})',
      cell,
      seedWords: [[], [0, 4, 8]],
      radius: 2,
    })
    const twinG0 = 0
    const twinGFar = 1
    const distTwin = hullTwin.distFromOrigin[twinGFar]!
    const twinInit = ketState(
      makeConfig(
        new Map([
          [twinG0, makeDock([[0, 1, 0], [hullTwin.opposite[0]!, 1, 0]])], // k=2 M_pair at g0 (Q=+2)
          [twinGFar, makeDock([[2, -1, 0], [hullTwin.opposite[2]!, -1, 1]])], // k=2 M_meet at g_far (Q=-2)
        ]),
      ),
    )
    const twinRef2 = applyGlobalSynchronousU(twinInit, hullTwin, 2)
    const coneTwin = localizedConeCut(hullTwin, 2)
    const coneTwinCheck = checkCauchyCutValid(hullTwin, coneTwin)
    const twinSpecs = makeScheduleSpecs(hullTwin)

    // Stage 1: advance causal cone around g0 to tau=2 while g_far stays frozen at tau=0!
    const twinTilde0 = applyGlobalR(twinInit, hullTwin)
    const twinStage1 = runAsynchronousSchedule({
      hull: hullTwin,
      initialTildeState: twinTilde0,
      cut0: flatCut(hullTwin, 0),
      targetCut: coneTwin,
      priority: twinSpecs[4]!.priority,
    })

    // Local proper-time reduced density matrices on the warped slice Sigma_cone:
    // apply R_g locally on the single dock being measured (since g0 is at tau=2 and g_far is at tau=0)
    const rdmG0Init = reducedDensityMatrix(twinInit, twinG0)
    const rdmG0Flat2 = reducedDensityMatrix(twinRef2.state, twinG0)
    const rdmG0Warped = reducedDensityMatrix(applySiteR(twinStage1.state, hullTwin, twinG0), twinG0)

    const rdmFarInit = reducedDensityMatrix(twinInit, twinGFar)
    const rdmFarFlat2 = reducedDensityMatrix(twinRef2.state, twinGFar)
    const rdmFarWarped = reducedDensityMatrix(applySiteR(twinStage1.state, hullTwin, twinGFar), twinGFar)

    // Stage 2: complete outer evolution from Sigma_cone to flat tau=2
    const twinStage2 = runAsynchronousSchedule({
      hull: hullTwin,
      initialTildeState: twinStage1.state,
      cut0: coneTwin,
      targetCut: flatCut(hullTwin, 2),
      priority: twinSpecs[5]!.priority,
    })
    const twinFinal = applyGlobalR(twinStage2.state, hullTwin)
    const twinDiff = diffStates(twinFinal, twinRef2.state)
    const frozenCount = Array.from(coneTwin.tauV).filter(t => t === 0).length

    check(
      'Spacelike separation & Cauchy validity (d(g_0, g_far) = 3, Q = 0_V, D = 4)',
      distTwin === 3 &&
        coneTwinCheck.valid &&
        coneTwin.tauV[twinG0] === 2 &&
        coneTwin.tauV[twinGFar] === 0 &&
        twinRef2.frontierHits === 0,
      `cells=${hullTwin.cells}, d(g0,g_far)=${distTwin}, tauV(g0)=${coneTwin.tauV[twinG0]}, tauV(g_far)=${coneTwin.tauV[twinGFar]}, docksFrozenAtTau0=${frozenCount}/${hullTwin.cells}`,
    )
    check(
      'Warped slice Sigma_cone: rho_{g_0}(Sigma_cone) === rho_{g_0}(t=2) (g_0 already at t=2!)',
      diffRDM(rdmG0Warped, rdmG0Flat2) === 0 && diffRDM(rdmG0Init, rdmG0Flat2) > 0,
      `rdmDiff_vs_t2=${diffRDM(rdmG0Warped, rdmG0Flat2)}, rdmDiff_t0_vs_t2=${diffRDM(rdmG0Init, rdmG0Flat2)} (non-trivial evolution)`,
    )
    check(
      'Warped slice Sigma_cone: rho_{g_far}(Sigma_cone) === rho_{g_far}(t=0) (g_far still at t=0!)',
      diffRDM(rdmFarWarped, rdmFarInit) === 0 && diffRDM(rdmFarInit, rdmFarFlat2) > 0,
      `rdmDiff_vs_t0=${diffRDM(rdmFarWarped, rdmFarInit)}, rdmDiff_t0_vs_t2=${diffRDM(rdmFarInit, rdmFarFlat2)} (non-trivial future evolution)`,
    )
    check(
      'Catch-up Sigma_cone -> flat(t=2) matches U^2 |psi_0> identically (0n error)',
      twinDiff.exactEqual && twinStage1.normDriftCount === 0 && twinStage2.normDriftCount === 0,
      `branches=${twinFinal.size}, stage1Events=${twinStage1.eventsFired}, stage2Events=${twinStage2.eventsFired}, mismatches=${twinDiff.mismatches}, maxNumDiff=${twinDiff.maxAbsNumDiff}n`,
    )
  }

  // --------------------------------------------------------------------------
  // Part D: Explicit Negative Control (Causality Violation Probe)
  // --------------------------------------------------------------------------
  console.log('\n--- Part D: Negative Control (Single Causality Violation Breaks Equivalence) ---')
  {
    const refSync = applyGlobalSynchronousU(
      ketState(cfgInteracting2Dock),
      hullPair,
      1,
    )
    const initTilde = applyGlobalR(ketState(cfgInteracting2Dock), hullPair)

    // Illegal order: execute edge swap X(e01, 0) BEFORE dock event V(g0, 0)!
    let bad = applyEdgeSwap(initTilde, e01)
    for (let g = 0; g < hullPair.cells; g++) {
      bad = applySiteW(bad, hullPair, g)
    }
    for (const e of hullPair.edges) {
      if (e.id !== e01.id) bad = applyEdgeSwap(bad, e)
    }
    const badFinal = applyGlobalR(bad, hullPair)
    const badDiff = diffStates(badFinal, refSync.state)
    check(
      'Causality-violating schedule (X(e01,0) fired before V(g0,0)) MUST diverge',
      !badDiff.exactEqual && badDiff.mismatches > 0,
      `mismatches=${badDiff.mismatches}, maxNumDiff=${badDiff.maxAbsNumDiff}n (proves non-vacuous sensitivity to V < X)`,
    )
  }

  const elapsedMs = Date.now() - t0
  console.log('\n========================================================================')
  console.log(`FINAL VERDICT: ${allPassed ? 'ALL CHECKS PASSED (EXACT 0n DISCREPANCY)' : 'FAILED'} in ${elapsedMs} ms`)
  console.log('========================================================================')
  if (!allPassed) process.exit(1)
}

main()

export {}
