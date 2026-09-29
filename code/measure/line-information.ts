// Information on the adopted classical knit, by mesh line: Landauer's principle (E-CMP-0018) and a code the vacuum
// protects (E-CMP-0019).
//
// THE KNIT is E-FND-0146's: the coset-union vacuum under the lone bounce collision L, run by the bounce kernel with the
// exact inverse beat (code/measure/second-law-husk). It is deterministic and bijective.
//
// MESH LINES. A mesh line is a closed cycle of docks along one root pair: the docks x, x + r, x + 2r, ... on the box,
// with the two slots (r and -r) of each dock and the dock's store trit for that pair. Every slot and every store trit
// of the box belongs to exactly one line. The line law (E-SPN-0098, E-RLT-0091) says a lone change stays on its line;
// these readers measure it, they do not assume it.
//
// NO ROUNDING, NO CONTINUITY in the rule: permutations of trits. Reals appear only in the readers. DETERMINISM: every
// placement is a Weyl sequence; nothing is drawn. NOTHING MOVES: the stream copies each slot's vibe one dock along.

import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { type Reduced } from '@/code/measure/living-pair-kernel'
import {
  blockEnergy,
  type ArrowBox,
} from '@/code/measure/second-law-husk'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(
  f => OPPOSITE[f] ?? f,
)

/** For each root, the index l of its line pair (0 .. 11). */
export const PAIR_OF_ROOT: readonly number[] = Array.from(
  { length: 24 },
  (_, d) => {
    const l = LINE_FIRSTS.indexOf(d)

    return l >= 0 ? l : LINE_SECONDS.indexOf(d)
  },
)

export type MeshLineMap = {
  /** the line of each slot, cells * 24 */
  readonly slotLine: Int32Array
  /** the line of each store trit, cells * 12 */
  readonly storeLine: Int32Array
  /** the docks of each line, in order along its first root */
  readonly docks: readonly number[][]
  /** each line's pair index l */
  readonly pair: readonly number[]
  readonly count: number
}

/** Every mesh line of the box, found by walking the kernel's stream targets along each pair's first root. */
export function meshLineMap(box: ArrowBox): MeshLineMap {
  const cells = box.cells
  const onPair = new Int32Array(cells * 12).fill(-1)
  const docks: number[][] = []
  const pair: number[] = []

  for (let l = 0; l < 12; l++) {
    const f = LINE_FIRSTS[l]!

    for (let x = 0; x < cells; x++) {
      if (onPair[x * 12 + l]! >= 0) {
        continue
      }

      const id = docks.length
      const walk: number[] = []

      let y = x

      do {
        onPair[y * 12 + l] = id
        walk.push(y)
        y = Math.floor(box.kernel.target[y * 24 + f]! / 24)
      } while (y !== x)

      docks.push(walk)
      pair.push(l)
    }
  }

  const slotLine = new Int32Array(cells * 24)
  const storeLine = new Int32Array(cells * 12)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24; d++) {
      slotLine[x * 24 + d] = onPair[x * 12 + PAIR_OF_ROOT[d]!]!
    }

    for (let l = 0; l < 12; l++) {
      storeLine[x * 12 + l] = onPair[x * 12 + l]!
    }
  }

  return { slotLine, storeLine, docks, pair, count: docks.length }
}

/** The lines on which two states differ (a vibe, a held vibe's point, a store trit, or a stored unit's point). */
export function differingLines(
  map: MeshLineMap,
  a: Reduced,
  b: Reduced,
): Set<number> {
  const out = new Set<number>()

  for (let i = 0; i < a.vibe.length; i++) {
    if (
      a.vibe[i] !== b.vibe[i] ||
      (a.vibe[i] !== 0 && a.point[i] !== b.point[i])
    ) {
      out.add(map.slotLine[i]!)
    }
  }

  for (let i = 0; i < a.store.length; i++) {
    if (
      a.store[i] !== b.store[i] ||
      (a.store[i] !== 0 && a.spoint[i] !== b.spoint[i])
    ) {
      out.add(map.storeLine[i]!)
    }
  }

  return out
}

/**
 * Whether two states are the same configuration: every vibe and store trit equal, and the point of every held vibe and
 * stored unit equal. A point on an empty slot carries nothing (the inverse beat leaves it stale), so it is not read.
 */
export function sameState(a: Reduced, b: Reduced): boolean {
  for (let i = 0; i < a.vibe.length; i++) {
    if (
      a.vibe[i] !== b.vibe[i] ||
      (a.vibe[i] !== 0 && a.point[i] !== b.point[i])
    ) {
      return false
    }
  }

  for (let i = 0; i < a.store.length; i++) {
    if (
      a.store[i] !== b.store[i] ||
      (a.store[i] !== 0 && a.spoint[i] !== b.spoint[i])
    ) {
      return false
    }
  }

  return true
}

/** The coarse state: the husk block energies, as a key. */
export function coarseKey(box: ArrowBox, s: Reduced): string {
  const e = new Float64Array(box.blocks)

  blockEnergy(box, s, e)

  return Array.from(e).join(',')
}

/** The Shannon entropy (nats) of equally weighted outcomes grouped by key. */
export function keyEntropy(keys: readonly string[]): number {
  const counts = new Map<string, number>()

  for (const k of keys) {
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }

  let h = 0

  for (const c of counts.values()) {
    const p = c / keys.length

    h -= p * Math.log(p)
  }

  return h
}

/** The slot of line `id` at position `k` along it: the dock k steps along, on the pair's first root (second when `back`). */
export function lineSlot(
  map: MeshLineMap,
  id: number,
  k: number,
  back = false,
): number {
  const docks = map.docks[id]!
  const x = docks[((k % docks.length) + docks.length) % docks.length]!
  const l = map.pair[id]!

  return x * 24 + (back ? LINE_SECONDS[l] : LINE_FIRSTS[l])!
}

/** The store trit index of line `id` at position `k` along it. */
export function lineStore(
  map: MeshLineMap,
  id: number,
  k: number,
): number {
  const docks = map.docks[id]!
  const x = docks[((k % docks.length) + docks.length) % docks.length]!

  return x * 12 + map.pair[id]!
}
