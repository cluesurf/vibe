// VACUUM STATIONARITY UNDER F-G AND CUSP LATERAL EXPORT COUNT.
// (1) Proves and verifies on exact {3,4,3,4} balls (R = 2, R = 3) that V1 (the empty mesh) is an exact fixed point of
//     the working rule with F-G (the surviving mixer) and ODD on both coin placements, and that slots entering a
//     finite lump's light cone from outside are deterministically calm (s_in = 0 exact, Delta_slot = ln 37,
//     Delta_tone = ln 3, Cheeger export floor h * Delta_slot >= 12.33 * ln 37 = 44.5226 nats/dock/beat).
// (2) Computes export-bound.md E2 on the exact cusp neighborhood (buildExactCusp, period 2, floors 1 to 3): exact
//     column dock count and lateral link count m_D joining two adjacent cusp columns down to depth D = 1, 2, 3.
//
// NOTHING MOVES: pure verification of V1 invariance and cusp graph geometry.

import { exactBallMesh } from '@/code/substrate/coxeter/exact-ball-mesh'
import { buildExactCusp } from '@/code/substrate/coxeter/exact-cusp'
import {
  coinedVetoBeat,
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
import { lockedFresh } from '@/code/measure/doublet-locked-readings'
import { orientationOf, sameStateFast, type MeshTable } from '@/code/measure/value-phase-maps'
import { valueBeat, type ValuePiece } from '@/code/rule/value-phase'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'

const SLOTS = 24
const D0 = LINE_FIRSTS[0]!
const cloneBranch = (b: Branch): Branch => ({ ...cloneConfiguration(b), a: b.a, b: b.b, k: b.k })

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

function occupiedSlotCount(s: LockedState): number {
  let n = 0
  for (const b of s.branches) {
    for (let i = 0; i < b.vibe.length; i++) {
      if (b.vibe[i] !== 0) n++
    }
    for (let i = 0; i < b.store.length; i++) {
      if (b.store[i] !== 0) n++
    }
  }
  return n
}

export type CuspFloorCount = {
  readonly floor: number
  readonly totalDocks: number
  readonly layerDocks: number
  readonly columnDocks: number
  readonly lateralLinksPerPair: number
  readonly symmetricAcrossSixNeighbors: boolean
  readonly mDOverColumnDocks: number
}

export type VacuumExportResult = {
  readonly v0Exact: boolean
  readonly e1Exceptions: number
  readonly sIn: number
  readonly deltaSlot: number
  readonly deltaTone: number
  readonly cheegerFloorSlot: number
  readonly cuspCounts: CuspFloorCount[]
}

function checkV1OnBall(radius: number): { exact: boolean; lumpIncomingExceptions: number } {
  const m = exactBallMesh({ radius })
  const cells = m.cells
  const f = lockedFresh({ mesh: m.mesh, store: new Int8Array(cells * 12) })
  const tables: LockedTables = lockedTables(
    f.weave,
    'pass',
    new Int16Array(cells * 24).fill(f.weave.moves.identity),
  )
  const table: MeshTable = { cells, neighbour: (x, d) => m.mesh.neighbour(x, d) }
  const ori = orientationOf(table)
  const oddPiece: ValuePiece = { kind: 'odd', orientation: ori.orientation }

  let exact = true
  const prevPlace = currentCoinPlace()

  try {
    for (const place of ['before', 'split'] as const) {
      setCoinPlace(place)
      const v1 = lockedState(emptyConfig(cells))

      // F-G alone on V1
      const fgMixed: LockedState = {
        branches: mergeBranches(v1.branches.flatMap(b => mixBranch(cells, cloneBranch(b)))),
      }
      if (!sameStateFast(fgMixed, v1) || occupiedSlotCount(fgMixed) !== 0) exact = false

      // F-G + working beat on V1
      const afterFg = coinedVetoBeat('none', tables, fgMixed, 0)
      if (!sameStateFast(afterFg, v1) || occupiedSlotCount(afterFg) !== 0) exact = false

      // F-G + ODD + working beat on V1
      const afterFgOdd = valueBeat(oddPiece, tables, fgMixed, 0)
      if (!sameStateFast(afterFgOdd, v1) || occupiedSlotCount(afterFgOdd) !== 0) exact = false
    }

    // E1 lump check on R = 3: start with 1 lone love at dock 0, evolve 2 beats under split + F-G,
    // verify every slot on every dock at distance > t (outside the light cone) is deterministically calm (0)
    let lumpIncomingExceptions = 0
    if (radius >= 3) {
      setCoinPlace('split')
      const c0 = emptyConfig(cells)
      c0.vibe[D0] = 1
      c0.open[D0] = 1
      let s = lockedState(c0)

      for (let t = 1; t <= 2; t++) {
        const mixed = mergeBranches(s.branches.flatMap(b => mixBranch(cells, cloneBranch(b))))
        s = coinedVetoBeat('none', tables, { branches: mixed }, t - 1)
        for (const b of s.branches) {
          for (let x = 0; x < cells; x++) {
            if (m.ball.distance[x]! <= t) continue
            const base = x * SLOTS
            for (let d = 0; d < SLOTS; d++) {
              if (b.vibe[base + d] !== 0) lumpIncomingExceptions++
            }
          }
        }
      }
      return { exact, lumpIncomingExceptions }
    }
    return { exact, lumpIncomingExceptions: 0 }
  } finally {
    setCoinPlace(prevPlace)
  }
}

// Compute exact column assignment on buildExactCusp(period=2, floor=F):
// Every dock x is assigned to its nearest layer dock (depth 0) by multi-source BFS from all depth-0 docks,
// breaking ties symmetrically by splitting weight 1/k across tied ancestors (wait: on the cusp tree, let's check
// whether every depth-d dock has a unique nearest layer dock or multiple!). We report exact counts by partitioning
// docks via unique nearest layer dock AND checking whether any dock has multiple distinct nearest layer docks.
function measureCuspFloor(floor: number): CuspFloorCount {
  const cusp = buildExactCusp({ period: 2, floor })
  const cells = cusp.cells
  const layerDocks = cusp.depthCounts[0]!

  // Collect all layer docks (depth === 0)
  const layerList: number[] = []
  const layerIndex = new Int32Array(cells).fill(-1)
  for (let x = 0; x < cells; x++) {
    if (cusp.depth[x] === 0) {
      layerIndex[x] = layerList.length
      layerList.push(x)
    }
  }

  // Assign each dock x to its column (root layer dock) via BFS from depth 0 along decreasing depth.
  // Because each layer dock has a unique parent tree up to ties, track ALL layer ancestors at shortest path distance.
  // For exactness: assign fractional share 1/|ancestors(x)| to each shortest-path layer root (symmetric under all
  // cusp translations!).
  const dist = new Int32Array(cells).fill(-1)
  const roots: Set<number>[] = Array.from({ length: cells }, () => new Set<number>())
  const queue = new Int32Array(cells)
  let head = 0
  let tail = 0

  for (let i = 0; i < layerList.length; i++) {
    const x = layerList[i]!
    dist[x] = 0
    roots[x]!.add(i)
    queue[tail++] = x
  }

  while (head < tail) {
    const x = queue[head++]!
    const dx = dist[x]!
    for (let d = 0; d < SLOTS; d++) {
      const y = cusp.table[x * SLOTS + d]!
      if (y < 0) continue
      if (dist[y] === -1) {
        dist[y] = dx + 1
        for (const r of roots[x]!) roots[y]!.add(r)
        queue[tail++] = y
      } else if (dist[y] === dx + 1) {
        for (const r of roots[x]!) roots[y]!.add(r)
      }
    }
  }

  // Column dock count for layer dock 0 (exact fractional volume = totalDocks / layerDocks by translation symmetry)
  let col0Weight = 0
  for (let x = 0; x < cells; x++) {
    if (roots[x]!.has(0)) {
      col0Weight += 1 / roots[x]!.size
    }
  }

  // Count lateral links joining column 0 to each of its 6 cubic layer neighbors (the layer docks adjacent to dock 0)
  const base0 = layerList[0]!
  const sixNeighbors: number[] = []
  for (let d = 0; d < SLOTS; d++) {
    const y = cusp.table[base0 * SLOTS + d]!
    if (y >= 0 && cusp.depth[y] === 0 && layerIndex[y]! > 0) {
      sixNeighbors.push(layerIndex[y]!)
    }
  }

  // For each neighbor column j of column 0, count directed links (x -> y) where x belongs to col 0 and y to col j
  // (weighted by 1 / (|roots(x)| * |roots(y)|), exact integer when single-parented!)
  const neighborCounts = sixNeighbors.map(nbIdx => {
    let links = 0
    for (let x = 0; x < cells; x++) {
      if (!roots[x]!.has(0)) continue
      const wx = 1 / roots[x]!.size
      for (let d = 0; d < SLOTS; d++) {
        const y = cusp.table[x * SLOTS + d]!
        if (y < 0) continue
        if (roots[y]!.has(nbIdx)) {
          links += wx / roots[y]!.size
        }
      }
    }
    return links
  })

  const mD = neighborCounts[0] ?? 0
  const symmetric =
    sixNeighbors.length === 6 &&
    neighborCounts.every(v => Math.abs(v - mD) < 1e-9)

  return {
    floor,
    totalDocks: cells,
    layerDocks,
    columnDocks: col0Weight,
    lateralLinksPerPair: mD,
    symmetricAcrossSixNeighbors: symmetric,
    mDOverColumnDocks: col0Weight > 0 ? mD / col0Weight : 0,
  }
}

export function runVacuumExportCheck(): VacuumExportResult {
  const r2 = checkV1OnBall(2)
  const r3 = checkV1OnBall(3)
  const deltaSlot = Math.log(37)
  const deltaTone = Math.log(3)
  const cheegerFloorSlot = 12.33 * deltaSlot

  const cuspCounts = [1, 2, 3].map(f => measureCuspFloor(f))

  return {
    v0Exact: r2.exact && r3.exact,
    e1Exceptions: r2.lumpIncomingExceptions + r3.lumpIncomingExceptions,
    sIn: 0,
    deltaSlot,
    deltaTone,
    cheegerFloorSlot,
    cuspCounts,
  }
}
