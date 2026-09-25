// Why the hop-free color weave dresses more than the committed rule, measured.
//
// E-FRC-0125 found a lone tone's largest support over every direction at 51, 331, 1,319, 2,587 slots in
// the first four periods under the hop-free table, against 33, 160, 565, 1,508 under the committed one.
// This asks what that number is, what grows it, and which part of the committed table keeps it lower.
// Side-9 D4 box, the lone tone at the center, every one of the 24 directions, 96 beats, the vacuum born
// empty. Every item was run once as a probe (tmp/tally-probe, tmp/cloud-probe, tmp/hop-control) before
// these gates were written, so the gates record what the probes found and could fail only on a change
// to the code, not as a test of a prediction. That is stated here rather than hidden.
//
// 1. The instrument. The sparse count (code/measure/lone-dressing) equals the dense difference of
//    E-FRC-0125 beat by beat, on the committed table's worst direction and on the hop-free table's.
// 2. What the number is. The vacuum is empty at the end of every period, so there the support is the
//    number of vibes the seeded run holds, and it equals exactly 1 + 2 x (pairs made from calm minus
//    pairs annihilated, beyond the vacuum's own), per direction and period. Dressing is pair creation.
// 3. Not reach. By the end of the first period the disturbance already reaches the farthest cell of the
//    box under both tables, so the gate compares how many pairs are left, not how far they went.
// 4. Where growth comes from. With the swap removed (no couple ever swaps) the support never exceeds
//    18 slots under the hop-free table, and no two lines are ever joined (12 line-graph components).
//    Growth needs the swap, which is also what joins the lines.
// 5. Which hop. The committed table is exactly the hop-free transposition (calm <-> (1, -1)) applied
//    after a reflection of the line, the two slots trading places. Controls on the same schedule: the
//    hop kept for one sign only, the hop only on the swapping couple, the hop everywhere but the
//    swapping couple. The committed table dresses least of the six in the fourth period, so the lower
//    dressing needs the reflection for both signs on the five medium wires, and a hop of one sign dresses
//    most of all.
// 6. The trade. Two members of the searched family (E-FRC-0136) on either side: a different turn of the
//    couples dresses about a ninth as much with CPT and the vacuum kept, and joins fewer lines; a
//    different table on two couples joins every line on the vacuum and dresses five times as much.
//
// Depth L2: measurements of constructed rules, with the committed table as the reference.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  colorLocalCollision,
  colorLocalSpec,
  HOP_CONTROL_TABLES,
  HOP_FREE_TABLES,
  keyState,
  PAIR_TABLE,
  stateKey,
  type ColorLocalSpec,
  type Tally,
} from '@/code/rule/color-local-weave'
import { turnElements } from '@/code/rule/color-local-family'
import { loneDressing, neighbourTable, vacuumCells } from '@/code/measure/lone-dressing'
import { lineComponents, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { collide, streamSourceTable } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'
import { d4BoxCell, d4BoxDistance, d4BoxMesh } from '@/code/substrate/d4-box'
import { meshOpposites } from '@/code/tool/mesh'

const SIDE = 9
const PERIOD = 24
const PERIODS = 4
const BEATS = PERIOD * PERIODS
const NO_SWAP_BOUND = 18
const COMMITTED_WORST = 4
const HOP_FREE_WORST = 14

const rule = (spec: ColorLocalSpec): ScheduledRule => (opposite, forward) => colorLocalCollision({ spec, opposite, forward })

type Row = {
  love: number[]
  netPairs: number[]
  swaps: number[]
  identity: boolean
  vacuumEmpty: boolean
  farthest: number
}

export default experiment({
  id: 'gauge/color-local-dressing-mechanism',
  code: 'E-FRC-0137',
  title:
    "why the hop-free color weave dresses more: a lone tone's support at the end of a period is exactly one plus twice the pairs it has left made from calm, the disturbance fills the box within a period under both tables, growth needs the swap, and the committed table's lower dressing needs its line reflection for both signs on the medium wires, while the searched color-local family trades dressing against how many lines interact",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4BoxMesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const neighbours = neighbourTable(mesh)
    const center = d4BoxCell({ coordinates: [4, 4, 4, 4], side: SIDE })
    const distances = new Map<number, number>()
    const distance = (x: number): number => {
      const known = distances.get(x)

      if (known !== undefined) {
        return known
      }

      const d = d4BoxDistance({ a: x, b: center, side: SIDE })

      distances.set(x, d)

      return d
    }

    let boxFarthest = 0

    for (let x = 0; x < mesh.cellCount; x++) {
      boxFarthest = Math.max(boxFarthest, distance(x))
    }

    const tables = [PAIR_TABLE, HOP_FREE_TABLES.bind ?? [], HOP_CONTROL_TABLES['hop-love'] ?? [], HOP_CONTROL_TABLES['hop-fear'] ?? []]
    const specs: Record<string, ColorLocalSpec> = {
      committed: colorLocalSpec({ tables, tableAt: [0] }),
      hopFree: colorLocalSpec({ tables, tableAt: [1] }),
      hopLoveOnly: colorLocalSpec({ tables, tableAt: [2] }),
      hopFearOnly: colorLocalSpec({ tables, tableAt: [3] }),
      hopOnlyOnSwappingCouple: colorLocalSpec({ tables, tableAt: [1], swapTable: 0 }),
      hopAllButSwappingCouple: colorLocalSpec({ tables, tableAt: [0], swapTable: 1 }),
      noSwap: colorLocalSpec({ tables, tableAt: [1], swapAt: [-1] }),
      otherTurn: colorLocalSpec({ tables, tableAt: [1], turn: turnElements()[2] ?? [] }),
      twoCouplesReversed: colorLocalSpec({
        tables: [HOP_FREE_TABLES.bind ?? [], HOP_FREE_TABLES['bind-reverse'] ?? []],
        tableAt: [0],
        coupleTable: [0, 1, 1, 0, 0, 0],
      }),
    }

    const measure = (spec: ColorLocalSpec): Row => {
      const plain = colorLocalCollision({ spec, opposite })
      const vacuum = vacuumCells({ forward: plain, beats: BEATS })
      const cellTally: Tally = { swaps: 0, made: 0, unmade: 0 }
      const cellForward = colorLocalCollision({ spec, opposite, tally: cellTally })
      const vacuumMade: number[] = []
      const vacuumUnmade: number[] = []
      const vacuumSwaps: number[] = []
      const cell = new Int8Array(24)

      for (let t = 0; t < BEATS; t++) {
        const before = { ...cellTally }

        cellForward(t)(cell, 0, 24)
        vacuumMade.push(cellTally.made - before.made)
        vacuumUnmade.push(cellTally.unmade - before.unmade)
        vacuumSwaps.push(cellTally.swaps - before.swaps)
      }

      const love = Array.from({ length: PERIODS }, () => 0)
      const netPairs = Array.from({ length: PERIODS }, () => 0)
      const swaps = Array.from({ length: PERIODS }, () => 0)

      let identity = true
      let farthest = 0

      for (let direction = 0; direction < 24; direction++) {
        const tally: Tally = { swaps: 0, made: 0, unmade: 0 }
        const forward = colorLocalCollision({ spec, opposite, tally })

        let collided = 1
        let last = { ...tally }
        let net = 0

        const run = loneDressing({
          neighbours,
          forward,
          vacuum,
          cell: center,
          direction,
          beats: BEATS,
          watch: (t, live) => {
            const p = Math.floor(t / PERIOD)
            const made = tally.made - last.made - collided * (vacuumMade[t] ?? 0)
            const unmade = tally.unmade - last.unmade - collided * (vacuumUnmade[t] ?? 0)

            net += made - unmade
            swaps[p] = (swaps[p] ?? 0) + tally.swaps - last.swaps - collided * (vacuumSwaps[t] ?? 0)
            last = { ...tally }
            collided = live.size

            if (t === PERIOD - 1) {
              for (const x of live.keys()) {
                farthest = Math.max(farthest, distance(x))
              }
            }

            if (t % PERIOD === PERIOD - 1) {
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
          const p = Math.floor(t / PERIOD)

          love[p] = Math.max(love[p] ?? 0, b.support)
        })
      }

      const vacuumEmpty = Array.from({ length: PERIODS }, (_, p) => vacuum[(p + 1) * PERIOD - 1]?.every(x => x === 0) ?? false).every(Boolean)

      return { love, netPairs, swaps, identity, vacuumEmpty, farthest }
    }

    const rows = Object.fromEntries(Object.entries(specs).map(([name, spec]) => [name, measure(spec)])) as Record<string, Row>
    const row = (name: string): Row => rows[name] ?? { love: [], netPairs: [], swaps: [], identity: false, vacuumEmpty: false, farthest: 0 }

    // 1. the sparse count against the dense difference, beat by beat
    const denseSupport = (spec: ColorLocalSpec, direction: number): number[] => {
      const forward = colorLocalCollision({ spec, opposite })
      const table = streamSourceTable(mesh)
      const step = (will: Will, t: number): Will => {
        const out = new Int8Array(will.data.length)

        collide(will, forward(t))

        for (let i = 0; i < table.length; i++) {
          out[i] = will.data[table[i] ?? 0] ?? 0
        }

        return { mesh, data: out }
      }

      let vac: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      seeded.data[center * 24 + direction] = 1

      const out: number[] = []

      for (let t = 0; t < BEATS; t++) {
        vac = step(vac, t)
        seeded = step(seeded, t)

        let count = 0

        for (let i = 0; i < vac.data.length; i++) {
          count += vac.data[i] === seeded.data[i] ? 0 : 1
        }

        out.push(count)
      }

      return out
    }
    const sparseSupport = (spec: ColorLocalSpec, direction: number): number[] => {
      const forward = colorLocalCollision({ spec, opposite })

      return loneDressing({ neighbours, forward, vacuum: vacuumCells({ forward, beats: BEATS }), cell: center, direction, beats: BEATS }).map(
        b => b.support,
      )
    }
    const agree = (spec: ColorLocalSpec, direction: number): boolean => {
      const a = denseSupport(spec, direction)
      const b = sparseSupport(spec, direction)

      return a.length === b.length && a.every((x, t) => x === b[t])
    }
    const sparseIsDense = agree(specs.committed ?? specs.hopFree!, COMMITTED_WORST) && agree(specs.hopFree ?? specs.committed!, HOP_FREE_WORST)

    // 5. the committed table is the transposition after a reflection of the line
    const plus = HOP_FREE_TABLES['swap-plus'] ?? []
    const reflectThenTranspose = Array.from({ length: 9 }, (_, k) => {
      const [a, b] = keyState(k)
      const committed = PAIR_TABLE[k] ?? [a, b]
      const composed = plus[stateKey(b, a)] ?? [b, a]

      return committed[0] === composed[0] && committed[1] === composed[1]
    }).every(Boolean)

    // 4 and 6. line-graph components on the vacuum and on a dense background
    const components = (name: string): [number, number] => [
      lineComponents(rule(specs[name] ?? specs.committed!), false),
      lineComponents(rule(specs[name] ?? specs.committed!), true),
    ]
    const committedComponents = components('committed')
    const noSwapComponents = components('noSwap')
    const otherTurnComponents = components('otherTurn')
    const twoCouplesComponents = components('twoCouplesReversed')

    const controls = ['hopFree', 'hopLoveOnly', 'hopFearOnly', 'hopOnlyOnSwappingCouple', 'hopAllButSwappingCouple']
    const last = PERIODS - 1
    const committedLeast = controls.every(name => (row('committed').love[last] ?? 0) < (row(name).love[last] ?? 0))
    const measured = ['committed', ...controls, 'otherTurn', 'twoCouplesReversed']

    const ok =
      sparseIsDense &&
      measured.every(name => row(name).identity && row(name).vacuumEmpty) &&
      row('committed').farthest === boxFarthest &&
      row('hopFree').farthest === boxFarthest &&
      Math.max(...row('noSwap').love) <= NO_SWAP_BOUND &&
      noSwapComponents[0] === 12 &&
      reflectThenTranspose &&
      committedLeast &&
      (row('otherTurn').love[last] ?? 0) < (row('committed').love[last] ?? 0) &&
      otherTurnComponents[0] > committedComponents[0] &&
      twoCouplesComponents[0] < committedComponents[0] &&
      (row('twoCouplesReversed').love[last] ?? 0) > (row('committed').love[last] ?? 0)

    const perPeriod = (prefix: string, xs: number[]): Record<string, number> =>
      Object.fromEntries(xs.map((x, p) => [`${prefix}Period${p + 1}`, x]))

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "a lone tone's dressing is pair creation: at every period end its support is exactly one plus twice the net pairs it has left made from calm, the disturbance reaches the farthest cell of the box within one period under both tables, it stays at most 18 slots with no swap, and the committed table, which is the hop-free transposition after a reflection of the line, dresses less than every control that keeps the hop for one sign or on one part of the schedule, while two members of the color-local family show dressing traded against how many lines interact",
      metrics: {
        sparseEqualsDense: sparseIsDense ? 1 : 0,
        pairIdentityEveryDirectionAndPeriod: measured.every(name => row(name).identity) ? 1 : 0,
        vacuumEmptyAtPeriodEnds: measured.every(name => row(name).vacuumEmpty) ? 1 : 0,
        boxFarthest,
        committedFarthestPeriod1: row('committed').farthest,
        hopFreeFarthestPeriod1: row('hopFree').farthest,
        committedIsReflectionThenTransposition: reflectThenTranspose ? 1 : 0,
        ...perPeriod('committedLove', row('committed').love),
        ...perPeriod('committedNetPairs', row('committed').netPairs),
        ...perPeriod('committedSwaps', row('committed').swaps),
        ...perPeriod('hopFreeLove', row('hopFree').love),
        ...perPeriod('hopFreeNetPairs', row('hopFree').netPairs),
        ...perPeriod('hopFreeSwaps', row('hopFree').swaps),
        ...perPeriod('noSwapLove', row('noSwap').love),
        noSwapVacuumComponents: noSwapComponents[0],
        noSwapDenseComponents: noSwapComponents[1],
        committedVacuumComponents: committedComponents[0],
        committedDenseComponents: committedComponents[1],
        ...perPeriod('otherTurnLove', row('otherTurn').love),
        ...perPeriod('otherTurnNetPairs', row('otherTurn').netPairs),
        otherTurnVacuumComponents: otherTurnComponents[0],
        otherTurnDenseComponents: otherTurnComponents[1],
        ...perPeriod('twoCouplesReversedLove', row('twoCouplesReversed').love),
        twoCouplesReversedVacuumComponents: twoCouplesComponents[0],
        twoCouplesReversedDenseComponents: twoCouplesComponents[1],
      },
      control: {
        ...perPeriod('hopLoveOnlyLove', row('hopLoveOnly').love),
        ...perPeriod('hopFearOnlyLove', row('hopFearOnly').love),
        ...perPeriod('hopOnlyOnSwappingCoupleLove', row('hopOnlyOnSwappingCouple').love),
        ...perPeriod('hopAllButSwappingCoupleLove', row('hopAllButSwappingCouple').love),
        ...perPeriod('hopOnlyOnSwappingCoupleNetPairs', row('hopOnlyOnSwappingCouple').netPairs),
        ...perPeriod('hopAllButSwappingCoupleNetPairs', row('hopAllButSwappingCouple').netPairs),
      },
      notes:
        'L2, exact, no random numbers. The gates were written after probes had measured each item, so they record the result rather than test a prediction. The net pair count is pairs made from calm minus pairs annihilated on wires in the seeded run, less the vacuum\'s own on the same cells, summed from beat 0, and the identity with the support holds because the vacuum is empty at every period end. The hop-one-sign and hop-on-part controls break local color and are not candidates. The side-9 box is filled within one period, so dressing here measures how many pairs a lone tone leaves, not how far its cloud reaches.',
    })
  },
})
