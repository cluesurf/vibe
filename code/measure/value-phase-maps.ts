// Maps and readings for the value phase (code/rule/value-phase) on any mesh given as a
// slot table (dock x, slot d -> the neighbouring dock, or -1 past a ball's frontier):
//
//  - orientationOf: the 2-colouring of the dock graph from the base dock (+1 there). On the {3,4,3,4} honeycomb every
//    label transport reverses orientation, so a dock's orientation is (-1)^distance (E-FRC-0272, E-FRC-0274); the
//    colouring's conflicts count the edges that join two docks of one colour (0 exactly when it is an orientation).
//  - labelMap: a map of the mesh that sends slot d to slot g d and the base dock to a chosen dock, extended breadth-first
//    (a dock's neighbour along d goes to the image's neighbour along g d); `conflicts` counts the steps that disagree, 0
//    exactly when the map is an automorphism of the labelled mesh. g a cell symmetry (W(F4) slot map) and image 0 is a
//    cell map; g the identity and image the neighbour along slot a is the left translation by k_a (on a Cayley graph
//    with slots as right multiplication, h x k_d = (h x) k_d keeps every label).
//  - asMirror: such a map in code/measure/locked-parity's Mirror shape, so mirrorConfiguration carries a configuration.
//  - occupationDistance: the total-variation distance between the occupation distributions of two superposed states
//    (each branch's weight |a + b w|^2 / 4^k, summed over branches of one occupation), exact in bigint, read as a float.
//
// NOTHING MOVES: these maps relabel which slot of which dock holds a value.

import {
  IDENTITY_POINTS,
  type Mirror,
} from '@/code/measure/locked-parity'
import {
  norm,
  type Configuration,
  type LockedState,
} from '@/code/rule/doublet-locked-knit'

const SLOTS = 24

export type MeshTable = {
  readonly cells: number
  readonly neighbour: (x: number, d: number) => number
}

export function orientationOf(t: MeshTable): {
  orientation: Int8Array
  conflicts: number
} {
  const orientation = new Int8Array(t.cells)
  const queue = new Int32Array(t.cells)

  orientation[0] = 1
  queue[0] = 0

  let tail = 1
  let conflicts = 0

  for (let head = 0; head < tail; head++) {
    const x = queue[head]!

    for (let d = 0; d < SLOTS; d++) {
      const y = t.neighbour(x, d)

      if (y < 0) {
        continue
      }

      if (orientation[y] === 0) {
        orientation[y] = -orientation[x]!
        queue[tail++] = y
      } else if (orientation[y] === orientation[x]) {
        conflicts++
      }
    }
  }

  return { orientation, conflicts }
}

export function labelMap(
  t: MeshTable,
  g: ArrayLike<number>,
  image0: number,
): { cells: Int32Array; conflicts: number } {
  const cells = new Int32Array(t.cells).fill(-1)
  const queue = new Int32Array(t.cells)

  cells[0] = image0
  queue[0] = 0

  let tail = 1
  let conflicts = 0

  for (let head = 0; head < tail; head++) {
    const x = queue[head]!
    const ix = cells[x]!

    for (let d = 0; d < SLOTS; d++) {
      const y = t.neighbour(x, d)
      const iy = t.neighbour(ix, g[d]!)

      if (y < 0 || iy < 0) {
        conflicts += y < 0 !== iy < 0 ? 1 : 0
        continue
      }

      if (cells[y] === -1) {
        cells[y] = iy
        queue[tail++] = y
      } else if (cells[y] !== iy) {
        conflicts++
      }
    }
  }

  // a map that misses a dock or hits one twice is not an automorphism
  const hit = new Uint8Array(t.cells)

  for (let x = 0; x < t.cells; x++) {
    const y = cells[x]!

    if (y < 0 || hit[y]) {
      conflicts++
    } else {
      hit[y] = 1
    }
  }

  return { cells, conflicts }
}

export function asMirror(
  name: string,
  g: ArrayLike<number>,
  cells: Int32Array,
  det: number,
): Mirror {
  return {
    map: {
      name,
      matrix: [],
      slots: Int32Array.from({ length: SLOTS }, (_, d) => g[d]!),
      huskDet: det,
      bulkDet: det,
    },
    cells,
    points: IDENTITY_POINTS,
  }
}

// the composite a then b (b after a) of two label maps
export function composeMirrors(name: string, a: Mirror, b: Mirror): Mirror {
  return {
    map: {
      name,
      matrix: [],
      slots: Int32Array.from({ length: SLOTS }, (_, d) => b.map.slots[a.map.slots[d]!]!),
      huskDet: a.map.huskDet * b.map.huskDet,
      bulkDet: a.map.bulkDet * b.map.bulkDet,
    },
    cells: Int32Array.from(a.cells, x => b.cells[x]!),
    points: IDENTITY_POINTS,
  }
}

// a configuration's whole key, equal exactly when sameConfiguration (code/rule/doublet-locked-knit) says equal: every
// held slot's index, vibe, point and open bit, and every held store's index, trit, word and open bits
function configurationKey(c: Configuration): string {
  const parts: number[] = []

  for (let i = 0; i < c.vibe.length; i++) {
    const v = c.vibe[i]!

    if (v !== 0) {
      parts.push(i, v, c.point[i]!, c.open[i]!)
    }
  }

  parts.push(-9)

  for (let i = 0; i < c.store.length; i++) {
    const v = c.store[i]!

    if (v !== 0) {
      parts.push(i, v, c.spoint[i]!, c.sopen[i]!)
    }
  }

  return parts.join(',')
}

// sameState (code/measure/locked-parity) by keys: the same configurations with equal amplitudes (a + b w) / 2^k,
// compared exactly, in time linear in the branches rather than quadratic
export function sameStateFast(x: LockedState, y: LockedState): boolean {
  if (x.branches.length !== y.branches.length) {
    return false
  }

  const byKey = new Map<string, { a: bigint; b: bigint; k: number }>()

  for (const b of x.branches) {
    byKey.set(configurationKey(b), b)
  }

  if (byKey.size !== x.branches.length) {
    throw new Error('value-phase-maps: a state holds one configuration twice')
  }

  for (const o of y.branches) {
    const b = byKey.get(configurationKey(o))

    if (!b) {
      return false
    }

    const k = Math.max(b.k, o.k)
    const s1 = 1n << BigInt(k - b.k)
    const s2 = 1n << BigInt(k - o.k)

    if (b.a * s1 !== o.a * s2 || b.b * s1 !== o.b * s2) {
      return false
    }

    byKey.delete(configurationKey(o))
  }

  return byKey.size === 0
}

function occupationKey(c: Configuration): string {
  const parts: number[] = []

  for (let i = 0; i < c.vibe.length; i++) {
    const v = c.vibe[i]!

    if (v !== 0) {
      parts.push(v > 0 ? i : -i - 1)
    }
  }

  for (let i = 0; i < c.store.length; i++) {
    const v = c.store[i]!

    if (v !== 0) {
      parts.push(v > 0 ? 1e9 + i : -1e9 - i)
    }
  }

  return parts.join(',')
}

function occupationWeights(s: LockedState, k: number): Map<string, bigint> {
  const out = new Map<string, bigint>()

  for (const b of s.branches) {
    const w = norm(b.a, b.b) * 4n ** BigInt(k - b.k)
    const key = occupationKey(b)

    out.set(key, (out.get(key) ?? 0n) + w)
  }

  return out
}

export function occupationDistance(x: LockedState, y: LockedState): number {
  const k = Math.max(
    0,
    ...x.branches.map(b => b.k),
    ...y.branches.map(b => b.k),
  )
  const px = occupationWeights(x, k)
  const py = occupationWeights(y, k)
  const keys = new Set([...px.keys(), ...py.keys()])

  let sum = 0n

  for (const key of keys) {
    const d = (px.get(key) ?? 0n) - (py.get(key) ?? 0n)

    sum += d < 0n ? -d : d
  }

  // the weights are over 4^k; the distance is half the L1 sum
  return Number((sum * 1_000_000_000n) / (2n * 4n ** BigInt(k))) / 1e9
}
