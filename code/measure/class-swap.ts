// PARITY-CLASS SWAP SYMMETRY ON THE EXACT {3,4,3,4} BALL (item vibe-roadmap-board-0051, gap B-55).
// Builds a partial label translation L mapping dock 0 to a facet neighbor y0 (which swaps bipartite parity classes
// and reverses geometric orientation) across the interior sub-ball B(0, r) -> B(y0, r) inside an exact ball of radius
// r + 1. Composes L with cell mirrors P (det -1 W(F4) slot maps), charge conjugation C, CP, motion reversal T, and
// CPT, and tests exact commutation in Z[w][1/2] with the bare working rule, working rule + ODD, and working rule + F-G.
//
// NOTHING MOVES: pure symmetry maps and exact state comparisons on the honeycomb ball.

import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import {
  coinedVetoBeat,
  coinedVetoBeatBack,
  currentCoinPlace,
  mixBranch,
  setCoinPlace,
  type CoinPlace,
} from '@/code/rule/coined-locked-knit'
import {
  cloneConfiguration,
  lockedState,
  lockedTables,
  mergeBranches,
  type Branch,
  type Configuration,
  type LockedState,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  chargeConjugate,
  mapState,
  mirrorConfiguration,
  motionReversal,
  type Mirror,
} from '@/code/measure/locked-parity'
import {
  asMirror,
  orientationOf,
  sameStateFast,
  type MeshTable,
} from '@/code/measure/value-phase-maps'
import {
  slotGroup,
  valueBeat,
  valueBeatBack,
  type ValuePiece,
} from '@/code/rule/value-phase'
import { lockedFresh } from '@/code/measure/doublet-locked-readings'

const SLOTS = 24
const D0 = LINE_FIRSTS[0]!
const D0_BACK = OPPOSITE[D0]!

export type PartialMap = {
  // dock map on the ball (-1 outside the mapped domain)
  readonly cells: Int32Array
  // slot permutation g (length 24)
  readonly slots: Int32Array
  // determinant of the slot map (+1 or -1)
  readonly det: number
  // number of mapped docks
  readonly mapped: number
  // number of edge disagreements inside the interior domain
  readonly conflicts: number
  // number of interior docks whose orientation did not flip under the map
  readonly sameClassCount: number
}

// Build the partial automorphism sending dock 0 -> image0 and slot d -> g[d] over the interior ball of radius `innerRadius`
export function partialLabelMap(input: {
  table: MeshTable
  orientation: Int8Array
  slots: ArrayLike<number>
  det: number
  image0: number
  innerRadius: number
}): PartialMap {
  const { table, orientation, slots, det, image0, innerRadius } = input
  const cells = new Int32Array(table.cells).fill(-1)
  const dist = new Int32Array(table.cells).fill(-1)
  const queue = new Int32Array(table.cells)

  cells[0] = image0
  dist[0] = 0
  queue[0] = 0

  let head = 0
  let tail = 1
  let conflicts = 0
  let sameClassCount = 0

  while (head < tail) {
    const x = queue[head++]!
    const dx = dist[x]!
    const ix = cells[x]!

    if (orientation[ix] !== -orientation[x]!) {
      sameClassCount++
    }

    if (dx >= innerRadius) {
      continue
    }

    for (let d = 0; d < SLOTS; d++) {
      const y = table.neighbour(x, d)
      const iy = table.neighbour(ix, slots[d]!)

      if (y < 0 || iy < 0) {
        conflicts++
        continue
      }

      if (cells[y] === -1) {
        cells[y] = iy
        dist[y] = dx + 1
        queue[tail++] = y
      } else if (cells[y] !== iy) {
        conflicts++
      }
    }
  }

  // Verify injectivity on the mapped subset
  const hit = new Uint8Array(table.cells)
  for (let i = 0; i < tail; i++) {
    const iy = cells[queue[i]!]!
    if (hit[iy]) {
      conflicts++
    } else {
      hit[iy] = 1
    }
  }

  return {
    cells,
    slots: Int32Array.from({ length: SLOTS }, (_, d) => slots[d]!),
    det,
    mapped: tail,
    conflicts,
    sameClassCount,
  }
}

export function applyPartialMapConfig(m: PartialMap, c: Configuration): Configuration {
  const n = m.cells.length
  const out: Configuration = {
    vibe: new Int8Array(n * 24),
    point: new Int8Array(n * 24),
    open: new Uint8Array(n * 24),
    store: new Int8Array(n * 12),
    spoint: new Int8Array(n * 12),
    sopen: new Uint8Array(n * 12),
  }

  for (let x = 0; x < n; x++) {
    const base = x * 24
    let hasVibe = false
    for (let d = 0; d < 24; d++) {
      if (c.vibe[base + d] !== 0) {
        hasVibe = true
        break
      }
    }
    let hasStore = false
    for (let l = 0; l < 12; l++) {
      if (c.store[x * 12 + l] !== 0) {
        hasStore = true
        break
      }
    }
    if (!hasVibe && !hasStore) continue

    const y = m.cells[x]!
    if (y < 0) {
      throw new Error(`class-swap: occupied dock ${x} lies outside the partial map domain`)
    }

    const mirror: Mirror = asMirror('partial', m.slots, m.cells, m.det)
    const yBase = y * 24
    for (let d = 0; d < 24; d++) {
      const v = c.vibe[base + d]!
      if (v !== 0) {
        const gd = m.slots[d]!
        out.vibe[yBase + gd] = v
        out.point[yBase + gd] = c.point[base + d]!
        out.open[yBase + gd] = c.open[base + d]!
      }
    }
    if (hasStore) {
      // Delegate store remapping through the exact library mirrorConfiguration on one-dock-clean map
      const single = mirrorConfiguration(mirror, c)
      return single
    }
  }

  return out
}

export function applyPartialMapState(m: PartialMap, s: LockedState): LockedState {
  // Check whether any store is occupied; if all mapped docks are valid we can use mirrorConfiguration safely
  const mirror: Mirror = asMirror('partial', m.slots, m.cells, m.det)
  return mapState(s, c => {
    for (let x = 0; x < m.cells.length; x++) {
      if (m.cells[x]! >= 0) continue
      const base = x * 24
      for (let d = 0; d < 24; d++) {
        if (c.vibe[base + d] !== 0) {
          throw new Error(`class-swap: occupied dock ${x} left mapped domain`)
        }
      }
      for (let l = 0; l < 12; l++) {
        if (c.store[x * 12 + l] !== 0) {
          throw new Error(`class-swap: stored dock ${x} left mapped domain`)
        }
      }
    }
    return mirrorConfiguration(mirror, c)
  })
}

export type RuleKind = 'bare' | 'odd' | 'fg'

export type SymmetryVerdict = {
  readonly rule: RuleKind
  readonly place: CoinPlace
  readonly start: string
  readonly L: boolean
  readonly LP_kept: number
  readonly LP_total: number
  readonly LC: boolean
  readonly LCP_kept: number
  readonly LCP_total: number
  readonly LT: boolean
  readonly LPT_kept: number
  readonly LPT_total: number
  readonly LCT: boolean
  readonly LCPT_kept: number
  readonly LCPT_total: number
  readonly reversible: boolean
  readonly frontierHits: number
}

export type ClassSwapResult = {
  readonly ballCells: number
  readonly mappedDocks: number
  readonly mapConflicts: number
  readonly sameClassCount: number
  readonly orientationConflicts: number
  readonly rows: SymmetryVerdict[]
}

const cloneBranch = (b: Branch): Branch => ({ ...cloneConfiguration(b), a: b.a, b: b.b, k: b.k })

function countFrontierHits(s: LockedState, dist: Int32Array, maxAllowed: number): number {
  let hits = 0
  for (const b of s.branches) {
    for (let x = 0; x < dist.length; x++) {
      if (dist[x]! <= maxAllowed) continue
      const base = x * 24
      for (let d = 0; d < 24; d++) {
        if (b.vibe[base + d] !== 0) hits++
      }
      for (let l = 0; l < 12; l++) {
        if (b.store[x * 12 + l] !== 0) hits++
      }
    }
  }
  return hits
}

function emptyConfig(cells: number): Configuration {
  return {
    vibe: new Int8Array(cells * 24),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }
}

function makeStart(cells: number, entries: readonly [number, number, number, number][]): Configuration {
  const c = emptyConfig(cells)
  for (const [x, d, tone, point] of entries) {
    c.vibe[x * 24 + d] = tone
    c.point[x * 24 + d] = point
    c.open[x * 24 + d] = 1
  }
  return c
}

// Run the full 3 rules x 2 coin placements x 4 starts x 8 symmetry composites check on exactBallMesh(3)
export function runClassSwapSymmetry(): ClassSwapResult {
  const m = exactBallMesh({ radius: 3 })
  const cells = m.cells
  const f = lockedFresh({ mesh: m.mesh, store: new Int8Array(cells * 12) })
  const tables: LockedTables = lockedTables(
    f.weave,
    'pass',
    new Int16Array(cells * 24).fill(f.weave.moves.identity),
  )
  const table: MeshTable = { cells, neighbour: (x, d) => m.mesh.neighbour(x, d) }
  const ori = orientationOf(table)
  const y0 = m.mesh.neighbour(0, D0)
  const idSlots = Int32Array.from({ length: SLOTS }, (_, d) => d)

  // Map B(0, 2) -> B(y0, 2) inside B(0, 3) (all 1-beat outputs stay in B(0, 1) -> B(y0, 1) strictly inside B(0, 2)!)
  const mapL = partialLabelMap({
    table,
    orientation: ori.orientation,
    slots: idSlots,
    det: 1,
    image0: y0,
    innerRadius: 2,
  })

  // Select 8 det -1 cell mirrors P from W(F4) (same count as E-FRC-0321)
  const group = slotGroup()
  const detNeg: Int8Array[] = []
  for (let i = 0; i < group.elements.length && detNeg.length < 8; i++) {
    if (group.det[i] === -1) detNeg.push(group.elements[i]!)
  }
  const mapsLP = detNeg.map(slots =>
    partialLabelMap({
      table,
      orientation: ori.orientation,
      slots,
      det: -1,
      image0: y0,
      innerRadius: 2,
    }),
  )

  const oddPiece: ValuePiece = { kind: 'odd', orientation: ori.orientation }

  // 4 starts at dock 0: L1 (lone love), K (unequal-point like pair), P2 (love+fear pair), X1 (4-vibe chiral cluster)
  const starts: readonly [string, Configuration][] = [
    ['L1', makeStart(cells, [[0, D0, 1, 0]])],
    ['K', makeStart(cells, [[0, D0, 1, 0], [0, D0_BACK, 1, 1]])],
    ['P2', makeStart(cells, [[0, D0, 1, 0], [0, D0_BACK, -1, 0]])],
    // X1: E-FND-0178 / E-FND-0179 4-vibe chiral dock cluster where ODD fires and coin/collision do not commute
    ['X1', (() => {
      const c = emptyConfig(cells)
      // open love on slot 0, closed loves on slots 1, 4, 16 (same X1 start as E-FND-0179!)
      const items: [number, number, number][] = [
        [0, 1, 1],
        [1, 1, 0],
        [4, 1, 0],
        [16, 1, 0],
      ]
      for (const [d, tone, open] of items) {
        c.vibe[d] = tone
        c.open[d] = open
      }
      return c
    })()],
  ]

  const stepOf = (rule: RuleKind, s: LockedState, beat: number): LockedState => {
    if (rule === 'bare') return coinedVetoBeat('none', tables, s, beat)
    if (rule === 'odd') return valueBeat(oddPiece, tables, s, beat)
    const mixed = mergeBranches(s.branches.flatMap(b => mixBranch(cells, cloneBranch(b))))
    return coinedVetoBeat('none', tables, { branches: mixed }, beat)
  }

  const backOf = (rule: RuleKind, s: LockedState, beat: number): LockedState => {
    if (rule === 'bare') return coinedVetoBeatBack('none', tables, s, beat)
    if (rule === 'odd') return valueBeatBack(oddPiece, tables, s, beat)
    const unbeat = coinedVetoBeatBack('none', tables, s, beat)
    // F-G is an involution (G^2 = I)
    const unmixed = mergeBranches(unbeat.branches.flatMap(b => mixBranch(cells, cloneBranch(b))))
    return { branches: unmixed }
  }

  // Test unitary operator M: U M s === M U s
  const commutesUnitary = (rule: RuleKind, applyM: (s: LockedState) => LockedState, s0: LockedState): boolean => {
    const lhs = stepOf(rule, applyM(s0), 0)
    const rhs = applyM(stepOf(rule, s0, 0))
    return sameStateFast(lhs, rhs)
  }

  // Test antiunitary time-reversal operator M*T (T = motionReversal(tables, s) = K S R, maps U -> U^-1 via
  // U^-1 M T s === M T U s at beat 0)
  const commutesAntiunitary = (
    rule: RuleKind,
    applyM: (s: LockedState) => LockedState,
    s0: LockedState,
  ): boolean => {
    const lhs = backOf(rule, applyM(motionReversal(tables, s0)), 0)
    const rhs = applyM(motionReversal(tables, stepOf(rule, s0, 0)))
    return sameStateFast(lhs, rhs)
  }

  const rows: SymmetryVerdict[] = []
  const prevPlace = currentCoinPlace()

  try {
    for (const place of ['before', 'split'] as const) {
      setCoinPlace(place)
      for (const rule of ['bare', 'odd', 'fg'] as const) {
        for (const [name, c0] of starts) {
          const s0 = lockedState(c0)
          const s1 = stepOf(rule, s0, 0)
          const sBack = backOf(rule, s1, 0)
          const reversible = sameStateFast(sBack, s0)

          const sL0 = applyPartialMapState(mapL, s0)
          const sL1 = stepOf(rule, sL0, 0)
          const frontierHits =
            countFrontierHits(s1, m.ball.distance, 2) + countFrontierHits(sL1, m.ball.distance, 2)

          const opL = (s: LockedState): LockedState => applyPartialMapState(mapL, s)
          const opC = (s: LockedState): LockedState => mapState(s, chargeConjugate)
          const opLC = (s: LockedState): LockedState => opL(opC(s))

          const keepL = commutesUnitary(rule, opL, s0)
          const keepLC = commutesUnitary(rule, opLC, s0)
          const keepLT = commutesAntiunitary(rule, opL, s0)
          const keepLCT = commutesAntiunitary(rule, opLC, s0)

          let lpKept = 0
          let lcpKept = 0
          let lptKept = 0
          let lcptKept = 0

          for (const mp of mapsLP) {
            const opLP = (s: LockedState): LockedState => applyPartialMapState(mp, s)
            const opLCP = (s: LockedState): LockedState => opLP(opC(s))
            if (commutesUnitary(rule, opLP, s0)) lpKept++
            if (commutesUnitary(rule, opLCP, s0)) lcpKept++
            if (commutesAntiunitary(rule, opLP, s0)) lptKept++
            if (commutesAntiunitary(rule, opLCP, s0)) lcptKept++
          }

          rows.push({
            rule,
            place,
            start: name,
            L: keepL,
            LP_kept: lpKept,
            LP_total: mapsLP.length,
            LC: keepLC,
            LCP_kept: lcpKept,
            LCP_total: mapsLP.length,
            LT: keepLT,
            LPT_kept: lptKept,
            LPT_total: mapsLP.length,
            LCT: keepLCT,
            LCPT_kept: lcptKept,
            LCPT_total: mapsLP.length,
            reversible,
            frontierHits,
          })
        }
      }
    }
  } finally {
    setCoinPlace(prevPlace)
  }

  return {
    ballCells: cells,
    mappedDocks: mapL.mapped,
    mapConflicts: mapL.conflicts + mapsLP.reduce((a, b) => a + b.conflicts, 0),
    sameClassCount: mapL.sameClassCount + mapsLP.reduce((a, b) => a + b.sameClassCount, 0),
    orientationConflicts: ori.conflicts,
    rows,
  }
}
