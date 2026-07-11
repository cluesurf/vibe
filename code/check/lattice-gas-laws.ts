// The conservative-logic laws of the directional lattice gas, as reusable checks. The knit is a stream (a
// gather along the precomputed stream table) followed by a per-cell collision. These functions read off the
// two structural laws Toffoli and Fredkin require of a conservative reversible cellular rule: the stream
// routes with no fan-out (every slot is read exactly once, a permutation) and the tone alphabet census is a
// conserved multiset. Reusable by any experiment that needs to assert conservation or run a lossy control.

import { Mesh } from '@/code/tool/mesh'
import { streamSourceTable } from '@/code/rule/lattice-gas'

// True when the stream's gather table is a permutation of the slots: every input slot is read by exactly one
// output slot. This is Toffoli's no-fan-out (conservative routing). On a periodic mesh the neighbour map is a
// bijection, so this holds exactly. On a mesh with leaking boundaries it fails, which is the discriminator.
export function streamIsPermutation(mesh: Mesh): boolean {
  const table = streamSourceTable(mesh)
  const seen = new Uint8Array(table.length)

  for (const source of table) {
    if (source < 0 || source >= table.length || seen[source])
      return false

    seen[source] = 1
  }

  return true
}

// The census of the ternary tone alphabet over every slot: how many minus, zero, and plus tones. A collision
// that only permutes tones within a cell (and a stream that only permutes slots across cells) leaves this
// census exactly fixed, so it is the conserved multiset. A lossy collision changes it.
export function toneCensus(tone: Int8Array): {
  minus: number
  zero: number
  plus: number
} {
  let minus = 0
  let zero = 0
  let plus = 0

  for (const value of tone) {
    if (value < 0) minus += 1
    else if (value > 0) plus += 1
    else zero += 1
  }

  return { minus, zero, plus }
}

// True when two tone censuses are identical (the conserved multiset is unchanged).
export function censusEqual(
  a: { minus: number; zero: number; plus: number },
  b: { minus: number; zero: number; plus: number },
): boolean {
  return a.minus === b.minus && a.zero === b.zero && a.plus === b.plus
}
