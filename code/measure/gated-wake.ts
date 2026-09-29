// The wake gated by occupancy: the mesh grows more slowly where it is full (E-GRV-0066, the rule and where growth sits
// in the dynamics; E-GRV-0067, its reading near a crowd on the husk).
//
// WHERE GROWTH IS TODAY. The adopted knit runs on the closed D4 box (code/substrate/d4-box-integer, side^4 docks, periods
// side D4): its stream is a permutation of the box's slots, and nothing in the beat reads when or whether a dock was born.
// The growth of the mesh (the wake, E-CSM-0007, E-GMT-0027) is computed apart from the knit, as the shells of a graph
// unfolding from one cell, and takes no state. So the husk dynamics never sees growth.
//
// THE GATED WAKE, the simplest rule of the idea, on the substrate the knit runs on:
//   1. the wake starts at one seed dock, born at beat 0
//   2. a born dock x OPENS at beat born(x) + 1 + w(E(x)), and every neighbor along the 24 roots that is not yet born is
//      born at the earliest beat any born neighbor opens onto it
//   3. w(E) = max(0, E - 32), with E the dock's energy (held slots + 2 per stored unit, the knit's own conserved energy):
//      E-GRV-0060's law L(E) = 1 + max(0, E - 32) read as a wait, so a dock at the vacuum's energy (at most 24) opens at
//      once and a full dock (48) waits 16 beats
// With every w = 0 this is the plain wake: a dock is born at its graph distance from the seed. The rule is integer,
// local and deterministic, reads |trit| only (charge-blind by construction), and is irreversible by design: a born dock
// is never unborn (E-CSM-0007). It changes nothing in the knit.
//
// The occupancy a dock is read at is a SNAPSHOT (the field the caller passes), a disclosed stand-in: the knit cannot run
// on a region that is still growing without an edge rule (the region's edge slots take from docks that do not exist yet,
// counted by openEdgeSlots), and the knit cannot bind a crowd (E-SPN-0067), so the crowd's occupancy is imposed.
//
// NO ROUNDING in the rule: integer beats and waits. Reals only in the readers. DETERMINISM: no draw anywhere.

import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  d4Coordinates,
  d4Vector,
} from '@/code/substrate/d4-box-integer'

const ROOT_STEPS = rootsD4().map(d4Coordinates)
const modulo = (x: number, m: number): number => ((x % m) + m) % m

export const WAKE_THRESHOLD = 32

export function wakeWait(energy: number): number {
  return Math.max(0, energy - WAKE_THRESHOLD)
}

// the dock one root step along from dock x on the box of this side (the box index c1 + L c2 + L^2 c3 + L^3 c4)
export function rootNeighbor(
  x: number,
  root: number,
  side: number,
): number {
  const s = ROOT_STEPS[root]!

  let out = 0
  let rest = x
  let scale = 1

  for (let k = 0; k < 4; k++) {
    const c = rest % side

    rest = Math.floor(rest / side)
    out += modulo(c + s[k]!, side) * scale
    scale *= side
  }

  return out
}

// per dock: its husk column (v1, v2, v3) mod side, as an index a + side b + side^2 z (the arrowBox convention)
export function huskColumns(side: number): Int32Array {
  const cells = side ** 4
  const out = new Int32Array(cells)

  for (let x = 0; x < cells; x++) {
    let rest = x

    const c: number[] = []

    for (let k = 0; k < 4; k++) {
      c.push(rest % side)
      rest = Math.floor(rest / side)
    }

    const v = d4Vector(c)

    out[x] =
      modulo(v[0]!, side) +
      side * modulo(v[1]!, side) +
      side * side * modulo(v[2]!, side)
  }

  return out
}

// the gated wake: the birth beat of every dock, from `seed` born at 0, with each dock's wait (Dial's buckets, integers)
export function gatedWake(
  side: number,
  wait: Int32Array,
  seed: number,
): Int32Array {
  const cells = side ** 4
  const born = new Int32Array(cells).fill(-1)
  const tentative = new Int32Array(cells).fill(0x7fffffff)
  const buckets: number[][] = [[seed]]

  tentative[seed] = 0

  for (let b = 0; b < buckets.length; b++) {
    const list = buckets[b]

    if (!list) {
      continue
    }

    for (const x of list) {
      if (born[x] !== -1 || tentative[x] !== b) {
        continue
      }

      born[x] = b

      const open = b + 1 + wait[x]!

      for (let r = 0; r < 24; r++) {
        const y = rootNeighbor(x, r, side)

        if (born[y] !== -1 || tentative[y]! <= open) {
          continue
        }

        tentative[y] = open

        let bucket = buckets[open]

        if (!bucket) {
          bucket = []
          buckets[open] = bucket
        }

        bucket.push(y)
      }
    }

    buckets[b] = []
  }

  return born
}

// how many docks are born at each beat, from a birth field (the shell counts of the wake)
export function shellCounts(born: Int32Array): number[] {
  const out: number[] = []

  for (const b of born) {
    if (b >= 0) {
      out[b] = (out[b] ?? 0) + 1
    }
  }

  return Array.from(out, v => v ?? 0)
}

// the knit on a grown region: slots of a born dock whose stream source (the slot whose value the plain stream brings
// here) lies in a dock not yet born at beat t. Zero only if the region is closed under the stream.
export function openEdgeSlots(
  source: Int32Array,
  born: Int32Array,
  t: number,
): number {
  let open = 0

  for (let slot = 0; slot < source.length; slot++) {
    const x = (slot / 24) | 0
    const bx = born[x]!

    if (bx < 0 || bx > t) {
      continue
    }

    const y = (source[slot]! / 24) | 0
    const by = born[y]!

    if (by < 0 || by > t) {
      open++
    }
  }

  return open
}

// the husk ball of columns within `radius` of `center` (min image), at full depth: per dock 1 if in it
export function huskBall(
  columns: Int32Array,
  side: number,
  radius: number,
  center: readonly number[],
): Uint8Array {
  const ring = (d: number): number => {
    const m = modulo(d, side)

    return m > side / 2 ? m - side : m
  }

  return Uint8Array.from(columns, c => {
    const p = [
      c % side,
      Math.floor(c / side) % side,
      Math.floor(c / (side * side)),
    ]

    return p.reduce(
      (acc, v, i) => acc + ring(v - center[i]!) ** 2,
      0,
    ) <=
      radius * radius
      ? 1
      : 0
  })
}
