// Why the hop-free color weave dresses more, and the search for a color-local rule that does not.
//
// E-FRC-0125 found the color weave (the committed schedule on the hop-free wire table) passes every
// acceptance gate of the committed rule but one: a lone tone's largest support over every direction,
// 51, 331, 1,319, 2,587 slots in the first four periods against the committed 33, 160, 565, 1,508.
// E-FRC-0124 showed local color needs a hop-free table, and nothing else in the turning weave's
// collision touches color, so every schedule on the four hop-free tables is color-local
// (code/rule/color-local-weave). This file measures what the dressing number is, then searches that
// family against every gate of E-FRC-0125, with the committed turning weave, measured in this run, as the
// reference. Side-9 D4 box for dressing, as E-FRC-0125.
//
// Part 1, the mechanism (code/measure/pair-ledger):
// - the vacuum is empty at the end of every period, and there a lone tone's support is exactly
//   1 + 2 x (pairs made from calm minus pairs annihilated, beyond the vacuum's own), on every direction.
//   Dressing is pair creation
// - under both tables the disturbance reaches the farthest cell of the box within the first period, so
//   the gate compares how many pairs are left, not how far they went
// - with no swap the support never exceeds 18 slots and no two lines are joined: growth needs the swap,
//   which is also the only thing that joins lines
// - the committed wire table is exactly the hop-free transposition (calm <-> (1, -1)) applied after a
//   reflection of the line, and against controls that keep the hop for one sign, or only on the swapping
//   couple, or everywhere but there, the committed table dresses least in the fourth period: its lower
//   dressing needs the reflection of both signs on the five medium wires, the very move that breaks color
//
// Part 2, the search (code/rule/color-local-family), each member structure first (code/measure/
// weave-acceptance, structuralAcceptance): CPT at a mirror phase, a periodic vacuum, line-graph
// components on the vacuum and on a dense background no more than the committed rule's, then a love's
// dressing, then superposition, reversal and charge, and walls. First stage, one freedom at a time:
// - tables: the wire table as a sequence over beats, every sequence of period 1, 2, 3, 4, 6 or 8 (69,616)
// - tables-cpt: every period-8 or period-12 sequence paired the way CPT at the mirror phase needs (4,336)
// - schedule: each constant table, all 720 swap orders, palindromic or not, three walks (17,280)
// - turn: each constant table with each of the 384 signed axis permutations as the turn, two walks (3,072)
// - condition: each constant table, seven swap conditions, palindromic or not (56)
// - couple: a table per couple of the partition (4,096)
// - none: no swap at all (12)
// Second stage, two freedoms together: the turn whose first-stage member came closest to the committed
// dressing, with every swap order and the bind table and its reverse (1,440).
//
// Controls, each able to fail: the committed rule passes against itself; the hop-free member reads the
// dressing E-FRC-0125 printed; local color is measured on one member of each first-stage sweep and on
// the rule the search finds (no cell's color leaks in 48 beats on a dense side-3 box with role points,
// and running back restores the start), where the committed table through the same code leaks; the
// sparse dressing and line-graph counts equal the dense ones of E-FRC-0125.
// The gate: part 1 holds, the controls hold, and the search finds at least one member that passes every
// gate for a love and a fear, with the member E-FRC-0136 takes (code/rule/color-turn-weave) among them.
//
// Depth L1 for the search (exhaustive over each stated sweep, exact), L2 for what it measures.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { turningWeave, type Collision } from '@/code/rule/collision'
import {
  colorLocalBeat,
  colorLocalBeatBack,
  colorLocalCollision,
  colorLocalLeaks,
  colorLocalSpec,
  HOP_CONTROL_TABLES,
  HOP_FREE_TABLES,
  keyState,
  makeColorLocalWeave,
  PAIR_TABLE,
  stateKey,
  type ColorLocalSpec,
} from '@/code/rule/color-local-weave'
import { cptTableSweep, familySweep, SWEEPS, turnScheduleSweep, type FamilyMember } from '@/code/rule/color-local-family'
import { COLOR_TURN_SPEC } from '@/code/rule/color-turn-weave'
import { acceptance, lineComponents, passesAgainst, structuralAcceptance, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { loneDressing, neighbourTable, vacuumCells } from '@/code/measure/lone-dressing'
import { pairLedger } from '@/code/measure/pair-ledger'
import { collide, streamSourceTable } from '@/code/rule/lattice-gas'
import { type VibeState } from '@/code/rule/vibe-weave'
import { makeWill, type Will } from '@/code/tone/will'
import { d4BoxCell, d4BoxDistance, d4BoxMesh } from '@/code/substrate/d4-box'
import { meshOpposites } from '@/code/tool/mesh'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const SIDE = 9
const PERIOD = 24
const PERIODS = 4
const BEATS = PERIOD * PERIODS
const LEAK_BEATS = 48
const NO_SWAP_BOUND = 18
const HOP_FREE_DRESSING = [51, 331, 1319, 2587]
const BIND_MEMBER = 'condition:bind:lone-away:palindrome'
const FOUND_MEMBER = 'turn-schedule:bind:100:305241'
const LEAK_SAMPLES = [
  'tables:23',
  'schedule:bind-reverse:034152:once:frozen',
  'turn:swap-plus:2:mirror',
  'condition:swap-minus:always:once',
  'couple:012301',
  'none:bind:mirror',
  'tables-cpt:230000000023',
]

const rule = (spec: ColorLocalSpec): ScheduledRule => (opposite, forward) => colorLocalCollision({ spec, opposite, forward })

function denseRoles(slots: number, scale: number): VibeState {
  const vibe = new Int8Array(slots)
  const role = new Int8Array(slots)

  for (let i = 0; i < slots; i++) {
    const u = ((i + 1) * GOLDEN * scale) % 1

    vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
    role[i] = Math.floor(((i + 3) * GOLDEN * scale * 9) % 9)
  }

  return { vibe, role, flow: new Int32Array(slots) }
}

// color leaks over 48 beats on a dense side-3 box, and whether running back restores the start
function colorCheck(spec: ColorLocalSpec): { leaks: number; reverses: boolean } {
  const weave = makeColorLocalWeave({ side: 3, spec })
  const start = denseRoles(weave.mesh.cellCount * 24, 1.37)

  let s = start
  let leaks = 0

  for (let t = 0; t < LEAK_BEATS; t++) {
    leaks += colorLocalLeaks(weave, s, t)
    s = colorLocalBeat(weave, s, t)
  }

  for (let t = LEAK_BEATS - 1; t >= 0; t--) {
    s = colorLocalBeatBack(weave, s, t)
  }

  const reverses =
    s.vibe.every((v, i) => v === start.vibe[i]) && s.role.every((v, i) => v === start.role[i]) && s.flow.every((v, i) => v === start.flow[i])

  return { leaks, reverses }
}

export default experiment({
  id: 'gauge/color-local-dressing-search',
  code: 'E-FRC-0137',
  title:
    "why the hop-free color weave dresses more, and a search that finds color-local rules that do not: a lone tone's dressing is pair creation from calm, exactly one plus twice the pairs left, and the committed rule's lower count needs its line reflection, the move that breaks color, while varying the hop-free schedule one freedom at a time finds none that passes every gate and varying the turn and the swap order together finds several",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const mesh = d4BoxMesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const neighbours = neighbourTable(mesh)
    const center = d4BoxCell({ coordinates: [4, 4, 4, 4], side: SIDE })

    // part 1, the mechanism
    const tables = [PAIR_TABLE, HOP_FREE_TABLES.bind ?? [], HOP_CONTROL_TABLES['hop-love'] ?? [], HOP_CONTROL_TABLES['hop-fear'] ?? []]
    const ledgerSpecs: Record<string, ColorLocalSpec> = {
      committed: colorLocalSpec({ tables, tableAt: [0] }),
      hopFree: colorLocalSpec({ tables, tableAt: [1] }),
      hopLoveOnly: colorLocalSpec({ tables, tableAt: [2] }),
      hopFearOnly: colorLocalSpec({ tables, tableAt: [3] }),
      hopOnlyOnSwappingCouple: colorLocalSpec({ tables, tableAt: [1], swapTable: 0 }),
      hopAllButSwappingCouple: colorLocalSpec({ tables, tableAt: [0], swapTable: 1 }),
      noSwap: colorLocalSpec({ tables, tableAt: [1], swapAt: [-1] }),
      found: COLOR_TURN_SPEC,
    }
    const ledgers = Object.fromEntries(
      Object.entries(ledgerSpecs).map(([name, spec]) => [
        name,
        pairLedger({ neighbours, tallied: tally => colorLocalCollision({ spec, opposite, tally }), cell: center, period: PERIOD, periods: PERIODS }),
      ]),
    )
    const ledger = (name: string): (typeof ledgers)[string] =>
      ledgers[name] ?? { largest: [], netPairs: [], swaps: [], identity: false, vacuumEmpty: false, firstPeriodCells: new Set<number>() }

    const boxFarthest = Math.max(...Array.from({ length: mesh.cellCount }, (_, x) => d4BoxDistance({ a: x, b: center, side: SIDE })))
    const farthest = (name: string): number => Math.max(...[...ledger(name).firstPeriodCells].map(x => d4BoxDistance({ a: x, b: center, side: SIDE })))
    const identityEverywhere = Object.keys(ledgers).every(name => ledger(name).identity && ledger(name).vacuumEmpty)
    const boxFilled = farthest('committed') === boxFarthest && farthest('hopFree') === boxFarthest

    const plus = HOP_FREE_TABLES['swap-plus'] ?? []
    const reflectThenTranspose = Array.from({ length: 9 }, (_, k) => {
      const [a, b] = keyState(k)
      const committed = PAIR_TABLE[k] ?? [a, b]
      const composed = plus[stateKey(b, a)] ?? [b, a]

      return committed[0] === composed[0] && committed[1] === composed[1]
    }).every(Boolean)

    const noSwapComponents = lineComponents(rule(ledgerSpecs.noSwap ?? COLOR_TURN_SPEC), false)
    const noSwapBounded = Math.max(...ledger('noSwap').largest) <= NO_SWAP_BOUND && noSwapComponents === 12

    const hopControls = ['hopFree', 'hopLoveOnly', 'hopFearOnly', 'hopOnlyOnSwappingCouple', 'hopAllButSwappingCouple']
    const last = PERIODS - 1
    const committedLeast = hopControls.every(name => (ledger('committed').largest[last] ?? 0) < (ledger(name).largest[last] ?? 0))

    // the sparse dressing count against the dense difference, beat by beat, on the committed rule's worst
    // direction and on the hop-free table's
    const sparseEqualsDense = (spec: ColorLocalSpec, direction: number): boolean => {
      const forward = colorLocalCollision({ spec, opposite })
      const table = streamSourceTable(mesh)
      const step = (will: Will, collision: Collision): Will => {
        const out = new Int8Array(will.data.length)

        collide(will, collision)

        for (let i = 0; i < table.length; i++) {
          out[i] = will.data[table[i] ?? 0] ?? 0
        }

        return { mesh, data: out }
      }

      let vac: Will = makeWill(mesh)
      let seeded: Will = makeWill(mesh)

      seeded.data[center * 24 + direction] = 1

      const dense: number[] = []

      for (let t = 0; t < BEATS; t++) {
        vac = step(vac, forward(t))
        seeded = step(seeded, forward(t))

        let count = 0

        for (let i = 0; i < vac.data.length; i++) {
          count += vac.data[i] === seeded.data[i] ? 0 : 1
        }

        dense.push(count)
      }

      const sparse = loneDressing({ neighbours, forward, vacuum: vacuumCells({ forward, beats: BEATS }), cell: center, direction, beats: BEATS })

      return sparse.every((b, t) => b.support === dense[t])
    }
    const dressingInstrumentExact =
      sparseEqualsDense(ledgerSpecs.committed ?? COLOR_TURN_SPEC, 4) && sparseEqualsDense(ledgerSpecs.hopFree ?? COLOR_TURN_SPEC, 14)

    // part 2, the search, against the committed turning weave
    const committedRule: ScheduledRule = (o, forward) => turningWeave({ opposite: o, forward, table: 'pair' })
    const reference = acceptance(committedRule)
    const referencePassesItself = passesAgainst(reference, reference, { bothSigns: true })
    const ratio = (love: readonly number[]): number => Math.max(...love.map((x, p) => x / (reference.love.periodLargest[p] ?? 1)))

    type Row = { id: string; love: number[]; full: boolean; failed: string }

    const rows: Row[] = []
    const firstFailure = new Map<string, number>()
    const winners: string[] = []
    const bothSignWinners: string[] = []

    const search = (members: readonly FamilyMember[], stage: string): void => {
      for (const member of members) {
        const result = structuralAcceptance(rule(member.spec), reference)
        const key = `${stage}_${result.failed ?? 'none'}`

        firstFailure.set(key, (firstFailure.get(key) ?? 0) + 1)

        if (result.love) {
          rows.push({ id: member.id, love: result.love.periodLargest, full: result.love.overCapAt < 0, failed: result.failed ?? 'none' })
        }

        if (!result.failed) {
          winners.push(member.id)

          if (result.fear && result.fear.periodLargest.every((x, p) => x <= (reference.fear.periodLargest[p] ?? 0))) {
            bothSignWinners.push(member.id)
          }
        }
      }
    }

    const firstStage = [...SWEEPS.flatMap(sweep => familySweep(sweep)), ...cptTableSweep()]

    search(firstStage, 'first')

    const firstStageWinners = winners.length
    const firstRows = rows.filter(r => r.full)
    const closestTurn = firstRows
      .filter(r => r.id.startsWith('turn:') && r.id.endsWith(':mirror'))
      .sort((a, b) => ratio(a.love) - ratio(b.love) || Number(a.id.split(':')[2]) - Number(b.id.split(':')[2]))[0]
    const turnIndex = Number(closestTurn?.id.split(':')[2] ?? -1)
    const secondStage = turnIndex >= 0 ? turnScheduleSweep([turnIndex]) : []

    search(secondStage, 'second')

    // the hop-free member reaches the dressing gate and fails it there, and its full dressing is the one
    // E-FRC-0125 printed
    const bindRow = rows.find(r => r.id === BIND_MEMBER)
    const bindMatches =
      bindRow?.failed === 'dressing' &&
      ledger('hopFree').largest.length === HOP_FREE_DRESSING.length &&
      ledger('hopFree').largest.every((x, p) => x === HOP_FREE_DRESSING[p])
    const foundAmongWinners = bothSignWinners.includes(FOUND_MEMBER)

    // local color, measured on a member of each first-stage sweep and on the found rule
    const specs = new Map([...firstStage, ...secondStage].map(m => [m.id, m.spec]))
    const samples = [...LEAK_SAMPLES.map(id => specs.get(id)), COLOR_TURN_SPEC].map(spec => (spec ? colorCheck(spec) : { leaks: -1, reverses: false }))
    const committedColor = colorCheck(colorLocalSpec({ tables: [PAIR_TABLE] }))
    const samplesLocal = samples.every(s => s.leaks === 0 && s.reverses) && committedColor.leaks > 0

    const componentsExact = [colorLocalSpec({ tables: [PAIR_TABLE] }), COLOR_TURN_SPEC].every(spec =>
      [false, true].every(withDense => lineComponents(rule(spec), withDense) === lineComponents(rule(spec), withDense, { dense: true })),
    )

    const measured = rows.filter(r => r.full)
    const closestFirst = [...firstRows].sort((a, b) => ratio(a.love) - ratio(b.love))[0]
    const smallestFirst = Array.from({ length: PERIODS }, (_, p) => Math.min(...firstRows.map(r => r.love[p] ?? Number.POSITIVE_INFINITY)))

    const ok =
      identityEverywhere &&
      boxFilled &&
      reflectThenTranspose &&
      noSwapBounded &&
      committedLeast &&
      dressingInstrumentExact &&
      referencePassesItself &&
      bindMatches &&
      samplesLocal &&
      componentsExact &&
      bothSignWinners.length > 0 &&
      foundAmongWinners

    const perPeriod = (prefix: string, xs: readonly number[]): Record<string, number> =>
      Object.fromEntries(xs.map((x, p) => [`${prefix}Period${p + 1}`, x]))

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "a lone tone's dressing is the pairs it leaves made from calm, exactly one plus twice their number at every period end, the committed rule's lower count needs the line reflection that breaks color, no hop-free schedule that varies one freedom of the committed one passes every gate, and varying the turn and the swap order together finds color-local rules that pass every gate for a love and a fear, the color turn weave among them",
      metrics: {
        pairIdentityEveryDirectionAndPeriod: identityEverywhere ? 1 : 0,
        boxFarthest,
        committedFarthestPeriod1: farthest('committed'),
        hopFreeFarthestPeriod1: farthest('hopFree'),
        committedIsReflectionThenTransposition: reflectThenTranspose ? 1 : 0,
        dressingInstrumentExact: dressingInstrumentExact ? 1 : 0,
        ...perPeriod('committedNetPairs', ledger('committed').netPairs),
        ...perPeriod('committedSwaps', ledger('committed').swaps),
        ...perPeriod('hopFreeLove', ledger('hopFree').largest),
        ...perPeriod('hopFreeNetPairs', ledger('hopFree').netPairs),
        ...perPeriod('hopFreeSwaps', ledger('hopFree').swaps),
        ...perPeriod('foundLove', ledger('found').largest),
        ...perPeriod('foundNetPairs', ledger('found').netPairs),
        ...perPeriod('foundSwaps', ledger('found').swaps),
        ...perPeriod('noSwapLove', ledger('noSwap').largest),
        noSwapVacuumComponents: noSwapComponents,
        firstStageMembers: firstStage.length,
        ...Object.fromEntries([...SWEEPS.map(s => [`members_${s}`, familySweep(s).length]), ['members_tablesCpt', cptTableSweep().length]]),
        ...Object.fromEntries([...firstFailure].map(([key, count]) => [`firstFailure_${key}`, count])),
        firstStageWinners,
        firstStageDressingMeasured: firstRows.length,
        ...perPeriod('firstStageSmallestLove', smallestFirst),
        firstStageClosestWorstRatio: closestFirst ? ratio(closestFirst.love) : -1,
        ...perPeriod('firstStageClosestLove', closestFirst?.love ?? []),
        secondStageTurn: turnIndex,
        secondStageMembers: secondStage.length,
        winners: winners.length,
        bothSignWinners: bothSignWinners.length,
        dressingMeasured: measured.length,
        foundAmongBothSignWinners: foundAmongWinners ? 1 : 0,
        colorLeaksOnSamples: samples.reduce((a, s) => a + s.leaks, 0),
      },
      control: {
        ...perPeriod('committedLove', reference.love.periodLargest),
        ...perPeriod('committedFear', reference.fear.periodLargest),
        ...perPeriod('hopLoveOnlyLove', ledger('hopLoveOnly').largest),
        ...perPeriod('hopFearOnlyLove', ledger('hopFearOnly').largest),
        ...perPeriod('hopOnlyOnSwappingCoupleLove', ledger('hopOnlyOnSwappingCouple').largest),
        ...perPeriod('hopAllButSwappingCoupleLove', ledger('hopAllButSwappingCouple').largest),
        committedPassesItself: referencePassesItself ? 1 : 0,
        hopFreeMemberFailsAtDressing: bindRow?.failed === 'dressing' ? 1 : 0,
        committedColorLeaks: committedColor.leaks,
        sparseComponentsEqualDense: componentsExact ? 1 : 0,
      },
      notes: `L1 for the search, exhaustive over each stated sweep and exact, with no random numbers. The family is the committed schedule's freedoms one at a time and then two (the turn and the swap order) around the closest first-stage turn, not every color-local automaton. The turn sweep uses the 384 signed permutations, not the triality elements of W(F4). The first stage's closest member is ${closestFirst?.id ?? 'none'}. Winners of the second stage: ${bothSignWinners.join(', ')} pass for both signs, and ${winners.filter(w => !bothSignWinners.includes(w)).join(', ') || 'none'} for a love only. First failures are counted at the first gate failed in the order CPT, vacuum period, vacuum components, dense components, dressing, superposition, reversal, walls, and a love's dressing is followed to 1.5 times the committed one (past that, the member stops and is not on the frontier). Run at scale with task/color-local-dressing-search.ts, the second stage around the other close turns, the closest table sequences and the closest swap orders found more members that pass, with the committed turn among them. The part-1 gates were written after probes had measured each item. It runs for about an hour.`,
    })
  },
})
