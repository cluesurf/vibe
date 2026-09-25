// Is there a color-local rule that dresses no more than the committed one and keeps every other gate?
//
// E-FRC-0125 found the hop-free color weave passes every acceptance gate of the committed rule but one:
// a lone tone's largest support over every direction, 51, 331, 1,319, 2,587 slots in the first four
// periods against the committed 33, 160, 565, 1,508. E-FRC-0124 showed local color needs a hop-free wire
// table, and nothing else in the turning weave's collision touches color, so every schedule on the four
// hop-free tables is color-local. This searches that family (code/rule/color-local-family), every member
// against every gate of E-FRC-0125 with the committed rule, measured in this run, as the reference:
// - tables: the wire table as a sequence over beats, every sequence of period 1, 2, 3, 4, 6 or 8 over
//   the four tables (69,700 distinct)
// - schedule: each constant table, all 720 visiting orders of the swap, palindromic or swap-then-clock,
//   the couples walked out and back, cyclically, or frozen (17,280)
// - turn: each constant table with each of the 384 signed axis permutations as the turn, walked out and
//   back or cyclically (3,072)
// - condition: each constant table, seven swap conditions, palindromic or not (56)
// - couple: a table per couple of the partition, 4^6 (4,096)
// - none: each constant table with no swap, on each walk (12)
// Each member runs structure first (code/measure/weave-acceptance, structuralAcceptance): CPT at a mirror
// phase, a periodic vacuum, line-graph components on the vacuum and on a dense background no more than
// the committed rule's, then the full dressing of a love and a fear, then superposition, reversal and
// charge, and walls for a member whose love dresses no more. So every member whose interaction structure
// is acceptable has its dressing measured, and the search reports the smallest dressing among them.
//
// Controls, each able to fail:
// - the committed table through the same code passes every gate against itself
// - the hop-free color weave is a member (constant bind table, committed schedule) and must read the
//   dressing E-FRC-0125 printed
// - local color is measured, not assumed: on one member from each sweep, with role points carried,
//   48 beats on a dense side-3 box leak no cell's color, and run back restore the start exactly, where
//   the committed table through the same code leaks
// The gate: no member passes every gate, with the controls holding. A member that passes would make this
// fail, and would be the rule to read next.
//
// Depth L1 for the search (exhaustive over a stated family, exact), L2 for what it measures.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  colorLocalBeat,
  colorLocalBeatBack,
  colorLocalCollision,
  colorLocalLeaks,
  colorLocalSpec,
  makeColorLocalWeave,
  PAIR_TABLE,
  type ColorLocalSpec,
} from '@/code/rule/color-local-weave'
import { familySweep, SWEEPS } from '@/code/rule/color-local-family'
import { acceptance, passesAgainst, structuralAcceptance, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { type VibeState } from '@/code/rule/vibe-weave'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const LEAK_BEATS = 48
const HOP_FREE_DRESSING = [51, 331, 1319, 2587]
const BIND_MEMBER = 'condition:bind:lone-away:palindrome'
const LEAK_SAMPLES = [
  'tables:23',
  'schedule:bind-reverse:034152:once:frozen',
  'turn:swap-plus:2:mirror',
  'condition:swap-minus:always:once',
  'couple:012301',
  'none:bind:mirror',
]

const rule = (spec: ColorLocalSpec): ScheduledRule => (opposite, forward) => colorLocalCollision({ spec, opposite, forward })

function dense(slots: number, scale: number): VibeState {
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
  const start = dense(weave.mesh.cellCount * 24, 1.37)

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
  code: 'E-FRC-0136',
  title:
    "no color-local rule in the searched family dresses as little as the committed one while keeping its other gates: of 94,216 schedules on the four hop-free tables, every one whose interaction structure passes (CPT, a periodic vacuum, line-graph components no more than the committed rule's) dresses more in some period, and the smallest dressing among them is printed beside the committed rule's",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const committedSpec = colorLocalSpec({ tables: [PAIR_TABLE] })
    const reference = acceptance(rule(committedSpec))
    const referencePassesItself = passesAgainst(reference, reference, { bothSigns: true })

    const members = SWEEPS.flatMap(sweep => familySweep(sweep))
    const firstFailure = new Map<string, number>()
    const structurePassers: { id: string; love: number[]; fear: number[] }[] = []
    const winners: string[] = []

    let bindDressing: number[] = []

    for (const member of members) {
      const result = structuralAcceptance(rule(member.spec), reference)
      const key = result.failed ?? 'none'

      firstFailure.set(key, (firstFailure.get(key) ?? 0) + 1)

      if (result.love && result.fear) {
        structurePassers.push({ id: member.id, love: result.love.periodLargest, fear: result.fear.periodLargest })
      }

      if (member.id === BIND_MEMBER) {
        bindDressing = result.love?.periodLargest ?? []
      }

      if (!result.failed) {
        winners.push(member.id)
      }
    }

    const bindMatches = bindDressing.length === HOP_FREE_DRESSING.length && bindDressing.every((x, p) => x === HOP_FREE_DRESSING[p])

    // local color on one member of each sweep, and the committed table through the same code
    const bySweep = new Map(members.map(m => [m.id, m.spec]))
    const samples = LEAK_SAMPLES.map(id => colorCheck(bySweep.get(id) ?? committedSpec))
    const committedColor = colorCheck(committedSpec)
    const samplesLocal = samples.every(s => s.leaks === 0 && s.reverses)

    const periods = reference.love.periodLargest.length
    const smallest = Array.from({ length: periods }, (_, p) => Math.min(...structurePassers.map(m => m.love[p] ?? Number.POSITIVE_INFINITY)))
    const ratio = (m: { love: number[] }): number => Math.max(...m.love.map((x, p) => x / (reference.love.periodLargest[p] ?? 1)))
    const closest = [...structurePassers].sort((a, b) => ratio(a) - ratio(b))[0]
    const lastSmallest = [...structurePassers].sort((a, b) => (a.love[periods - 1] ?? 0) - (b.love[periods - 1] ?? 0))[0]
    const belowInEveryPeriod = structurePassers.filter(m => m.love.every((x, p) => x <= (reference.love.periodLargest[p] ?? 0))).length
    const belowInSomePeriod = structurePassers.filter(m => m.love.some((x, p) => x <= (reference.love.periodLargest[p] ?? 0))).length

    const ok = referencePassesItself && bindMatches && samplesLocal && committedColor.leaks > 0 && winners.length === 0

    const perPeriod = (prefix: string, xs: readonly number[]): Record<string, number> =>
      Object.fromEntries(xs.map((x, p) => [`${prefix}Period${p + 1}`, x]))
    const failures = Object.fromEntries([...firstFailure].map(([gate, count]) => [`firstFailure_${gate}`, count]))

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "within the searched family of color-local rules no member meets the committed rule's dressing while passing its other gates: every member whose CPT, vacuum and line-graph components pass dresses a love more than the committed rule in some period, local color is measured exact on a member of every sweep, and the hop-free color weave reads the dressing E-FRC-0125 printed",
      metrics: {
        members: members.length,
        ...Object.fromEntries(SWEEPS.map(s => [`members_${s}`, familySweep(s).length])),
        ...failures,
        structurePassers: structurePassers.length,
        structurePassersBelowInEveryPeriod: belowInEveryPeriod,
        structurePassersBelowInSomePeriod: belowInSomePeriod,
        winners: winners.length,
        ...perPeriod('smallestLove', smallest),
        closestWorstRatio: closest ? ratio(closest) : -1,
        ...perPeriod('closestLove', closest?.love ?? []),
        ...perPeriod('closestFear', closest?.fear ?? []),
        ...perPeriod('smallestLastPeriodMemberLove', lastSmallest?.love ?? []),
        ...perPeriod('hopFreeMemberLove', bindDressing),
        colorLeaksOnSamples: samples.reduce((a, s) => a + s.leaks, 0),
        samplesReverse: samples.every(s => s.reverses) ? 1 : 0,
      },
      control: {
        committedPassesItself: referencePassesItself ? 1 : 0,
        ...perPeriod('committedLove', reference.love.periodLargest),
        ...perPeriod('committedFear', reference.fear.periodLargest),
        committedCptMirrorPhase: reference.cptPhase,
        committedVacuumPeriod: reference.vacuumPeriod,
        committedVacuumLineComponents: reference.vacuumComponents,
        committedDenseLineComponents: reference.denseComponents,
        committedColorLeaks: committedColor.leaks,
      },
      notes: `L1 for the search, exhaustive over the stated family and exact, with no random numbers. The family is the committed schedule's freedoms one or two at a time, not every color-local cellular automaton: the six sweeps vary the tables in time and per couple, the swap order, palindrome, walk, turn element and swap condition, never all at once. The turn sweep uses the 384 signed permutations, not the triality elements of W(F4). The closest member is ${closest?.id ?? 'none'}, the member with the smallest fourth-period dressing is ${lastSmallest?.id ?? 'none'}. Each first failure is counted at the first gate a member fails in the order CPT, vacuum period, vacuum components, dense components, dressing, superposition, reversal, walls. It runs for about an hour.`,
    })
  },
})
