// The pair ledger of a lone tone's dressing: what the collision does on the cells a lone tone has
// disturbed, beyond what the vacuum does there.
//
// E-FRC-0137 found that at the end of every period the vacuum born empty is empty again, so the support
// of a lone tone's disturbance is then the number of vibes the seeded run holds, and that equals exactly
// 1 + 2 x (pairs made from calm minus pairs annihilated, beyond the vacuum's own). This counts both, and
// the couple swaps that fired, on a collision family that can tally them (code/rule/color-local-weave).
// The seeded run is followed sparsely (code/measure/lone-dressing), so a cell collides in the ledger only
// while it differs from the vacuum, and the vacuum's own events on those cells are subtracted.

import { type Collision } from '@/code/rule/collision'
import { type Tally } from '@/code/rule/color-local-weave'
import { loneDressing, vacuumCells } from '@/code/measure/lone-dressing'

export type PairLedger = {
  // per period, summed over the directions: the largest support, the net pairs left made at the period's
  // end (cumulative), and the swaps that fired
  readonly largest: number[]
  readonly netPairs: number[]
  readonly swaps: number[]
  // whether support = 1 + 2 x net pairs held at every period end on every direction
  readonly identity: boolean
  // whether the vacuum is empty at every period end
  readonly vacuumEmpty: boolean
  // the cells differing from the vacuum at the end of the first period, over all directions
  readonly firstPeriodCells: Set<number>
}

export function pairLedger(input: {
  neighbours: Int32Array
  tallied: (tally: Tally) => (t: number) => Collision
  cell: number
  period: number
  periods: number
}): PairLedger {
  const { neighbours, tallied, cell, period, periods } = input
  const beats = period * periods
  const plain = tallied({ swaps: 0, made: 0, unmade: 0 })
  const vacuum = vacuumCells({ forward: plain, beats })
  const cellTally: Tally = { swaps: 0, made: 0, unmade: 0 }
  const cellForward = tallied(cellTally)
  const vacuumMade: number[] = []
  const vacuumUnmade: number[] = []
  const vacuumSwaps: number[] = []
  const one = new Int8Array(24)

  for (let t = 0; t < beats; t++) {
    const before = { ...cellTally }

    cellForward(t)(one, 0, 24)
    vacuumMade.push(cellTally.made - before.made)
    vacuumUnmade.push(cellTally.unmade - before.unmade)
    vacuumSwaps.push(cellTally.swaps - before.swaps)
  }

  const largest = Array.from({ length: periods }, () => 0)
  const netPairs = Array.from({ length: periods }, () => 0)
  const swaps = Array.from({ length: periods }, () => 0)
  const firstPeriodCells = new Set<number>()

  let identity = true

  for (let direction = 0; direction < 24; direction++) {
    const tally: Tally = { swaps: 0, made: 0, unmade: 0 }

    let collided = 1
    let last = { ...tally }
    let net = 0

    const run = loneDressing({
      neighbours,
      forward: tallied(tally),
      vacuum,
      cell,
      direction,
      beats,
      watch: (t, live) => {
        const p = Math.floor(t / period)

        net +=
          tally.made - last.made - collided * (vacuumMade[t] ?? 0) - (tally.unmade - last.unmade - collided * (vacuumUnmade[t] ?? 0))
        swaps[p] = (swaps[p] ?? 0) + tally.swaps - last.swaps - collided * (vacuumSwaps[t] ?? 0)
        last = { ...tally }
        collided = live.size

        if (t === period - 1) {
          for (const x of live.keys()) {
            firstPeriodCells.add(x)
          }
        }

        if (t % period === period - 1) {
          let vibes = 0

          for (const state of live.values()) {
            for (const v of state) {
              vibes += v !== 0 ? 1 : 0
            }
          }

          netPairs[p] = (netPairs[p] ?? 0) + net
          identity = identity && vibes === 1 + 2 * net
        }
      },
    })

    run.forEach((b, t) => {
      const p = Math.floor(t / period)

      largest[p] = Math.max(largest[p] ?? 0, b.support)
    })
  }

  const vacuumEmpty = Array.from({ length: periods }, (_, p) => vacuum[(p + 1) * period - 1]?.every(x => x === 0) ?? false).every(Boolean)

  return { largest, netPairs, swaps, identity, vacuumEmpty, firstPeriodCells }
}
