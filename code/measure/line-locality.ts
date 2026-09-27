// Which dock permutations of the bounce collisions keep every vibe on its own line (E-RLT-0087). EXACT: an exhaustive
// enumeration of dock occupations, integers only.
//
// THE THEOREM THIS CHECKS. Call a dock VACUUM-LIKE when every line it holds is full, and V1 the docks that are
// vacuum-like apart from at most one single line. Suppose (i) the vacuum visits only vacuum-like docks at every
// collision, and (ii) the collision C maps every line of a V1 dock onto itself. Seed one vibe (or flip one slot) on
// line l of the vacuum. Then at every beat the seeded run differs from the vacuum only on the slots and stores of l:
//  - the pair move reads and writes one line at a time, and the stream copies a slot's vibe along its own root;
//  - a dock of the seeded run agrees with the vacuum's on every other line, which the vacuum holds full or empty,
//    so the dock is in V1, where C keeps line l's slots on l and every other line on itself.
// So the lines the seed touches are {l}, and the battery's vacuum line components are 12 exactly, whatever C does on
// docks with two or more singles (the matter-matter meetings). Condition (ii) is exactly "the lone vibe's wake is
// untouched" for the lone bounce collision.
//
// THE CONVERSE, by momentum. Any C that keeps the dock momentum and moves the single of a V1 dock onto another line
// must move a full line's pair: if every full line's two vibes stayed a full line (a pair of momenta s, -s), the rest
// would carry the whole momentum r, and one vibe of momentum r sits on r's line. So a lone vibe changes line only by
// displacing a vacuum pair, which is the vacuum wake E-RLT-0080 to E-RLT-0082 measured.
//
// lineLocality counts, over every occupation of the 12 lines (empty, full, first slot, second slot) with a given
// number of singles, the cases where the collision's permutation carries a held slot onto another line, and how many
// of those move a full line.

import { isometricTable, LINE_FIRSTS, LINE_OF, OPPOSITE, type MomentumTable } from '@/code/rule/isometric-knit'
import { bouncePermutation, type CollisionKind } from '@/code/rule/bounce-pair-knit'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

export type LocalityCount = { cases: number; crossing: number; fullMoved: number; singleMoved: number }

// every occupation with exactly `singles` single lines (the rest empty or full)
export function lineLocality(kind: CollisionKind, singles: number, table: MomentumTable = isometricTable()): LocalityCount {
  const vibe = new Int8Array(24)
  const out = new Int32Array(24)
  let cases = 0
  let crossing = 0
  let fullMoved = 0
  let singleMoved = 0
  const lines = Array.from({ length: 12 }, (_, l) => l)
  const choose = (from: number, k: number, acc: number[], visit: (set: number[]) => void): void => {
    if (acc.length === k) {
      visit(acc)
      return
    }

    for (let i = from; i < 12; i++) choose(i + 1, k, [...acc, i], visit)
  }

  choose(0, singles, [], singleLines => {
    const rest = lines.filter(l => !singleLines.includes(l))

    for (let sides = 0; sides < 1 << singles; sides++) {
      for (let mask = 0; mask < 1 << rest.length; mask++) {
        vibe.fill(0)
        singleLines.forEach((l, i) => {
          vibe[(sides >> i) & 1 ? (LINE_SECONDS[l] as number) : (LINE_FIRSTS[l] as number)] = 1
        })
        rest.forEach((l, i) => {
          if ((mask >> i) & 1) {
            vibe[LINE_FIRSTS[l] as number] = 1
            vibe[LINE_SECONDS[l] as number] = -1
          }
        })

        cases++

        const acts = bouncePermutation(table, kind, vibe, 0, out)

        if (acts === 0) continue

        let crosses = false
        let full = false
        let single = false

        for (let d = 0; d < 24; d++) {
          if (vibe[d] === 0) continue

          if (LINE_OF[out[d] as number] !== LINE_OF[d]) {
            crosses = true

            if (singleLines.includes(LINE_OF[d] as number)) single = true
            else full = true
          }
        }

        crossing += crosses ? 1 : 0
        fullMoved += full ? 1 : 0
        singleMoved += single ? 1 : 0
      }
    }
  })

  return { cases, crossing, fullMoved, singleMoved }
}
