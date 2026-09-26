// The choice between the two color-local knit candidates, pre-registered.
//
// PRE-REGISTERED RULE, written into this header on 2026-09-25 before any new number on the second
// candidate was seen (its side-9 love and fear dressing were already known from the E-FRC-0137 search:
// love 29, 71, 89, 86 and fear 27, 49, 64, 72, and the color turn weave's at sides 7, 9 and 11 from
// E-FRC-0136). The candidates:
//   A. the color turn weave (code/rule/color-turn-weave): bind table, turn index 100 of
//      color-local-family's turnElements, swap order 3, 0, 5, 2, 4, 1
//   B. turn-schedule:bind-reverse:103:130542: the bind table's reverse (calm -> (-1, 1) -> (1, -1) ->
//      calm), turn index 103, swap order 1, 3, 0, 5, 4, 2
// Step 1, eligibility. A candidate is eligible when it passes every gate of E-FRC-0136 against the
// committed turning weave: reversal, charge, CPT at a mirror phase, the vacuum's period, line-graph
// components on the vacuum and on a dense background no more than the committed rule's, superposition,
// sheet-quantized walls, a love's and a fear's dressing no more than the committed rule's in each of four
// periods at sides 7, 9 and 11, and color exact cell by cell (no leak, reversal with roles, Gauss, frame).
// Step 2, the choice. Among eligible candidates, the one with the lowest worst-period dressing ratio
// (the largest over sign in {love, fear}, side in {7, 9, 11} and period in {1..4} of the candidate's
// largest support divided by the committed rule's) is chosen.
// Step 3, ties. If the ratios are equal to 1e-12, fewer line-graph components on the vacuum wins, then
// more travellers (6 beats, side 13), then A.
// Step 4. If neither is eligible, none is chosen, and the verdict fails.
// Nothing else (travel, protected species, the characterization of E-FRC-0149) enters the choice.
//
// Depth L2: two constructed rules measured against fixed gates, and a choice by a stated rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { turningWeave } from '@/code/rule/collision'
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
import { COLOR_TURN_SPEC } from '@/code/rule/color-turn-weave'
import { turnScheduleSweep } from '@/code/rule/color-local-family'
import { gaussHolds, type VibeState } from '@/code/rule/vibe-weave'
import { acceptance, dressing, passesAgainst, type Acceptance, type ScheduledRule } from '@/code/measure/weave-acceptance'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const SIDES = [7, 9, 11]
const TIE = 1e-12
const CANDIDATE_B = 'turn-schedule:bind-reverse:103:130542'

const rule = (spec: ColorLocalSpec): ScheduledRule => (opposite, forward) => colorLocalCollision({ spec, opposite, forward })
const committedRule: ScheduledRule = (opposite, forward) => turningWeave({ opposite, forward, table: 'pair' })

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

const same = (a: VibeState, b: VibeState): boolean =>
  a.vibe.every((v, i) => v === b.vibe[i]) && a.role.every((v, i) => v === b.role[i]) && a.flow.every((v, i) => v === b.flow[i])

// color exact cell by cell: leaks, reversal with roles, Gauss, and a frame change in every cell
function colorExact(spec: ColorLocalSpec): { leaks: number; ok: boolean } {
  const weave = makeColorLocalWeave({ side: 3, spec })
  const { mesh, moves } = weave
  const slots = mesh.cellCount * 24
  const start = denseRoles(slots, 1.37)

  let s = start
  let leaks = 0
  let gauss = true

  for (let t = 0; t < 48; t++) {
    leaks += colorLocalLeaks(weave, s, t)
    s = colorLocalBeat(weave, s, t)
    gauss = gauss && gaussHolds(weave, start, s)
  }

  for (let t = 47; t >= 0; t--) {
    s = colorLocalBeatBack(weave, s, t)
  }

  const reverses = same(s, start)
  const frame = Array.from({ length: mesh.cellCount }, (_, x) => Math.floor((((x + 11) * GOLDEN * 5.9) % 1) * moves.act.length))
  const gaugedLinks = new Int16Array(weave.links.length)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < 24; d++) {
      gaugedLinks[x * 24 + d] = moves.compose(
        moves.compose(frame[mesh.neighbour(x, d)] ?? moves.identity, weave.links[x * 24 + d] ?? moves.identity),
        moves.inverse[frame[x] ?? moves.identity] ?? moves.identity,
      )
    }
  }

  const gauged = { ...weave, links: gaugedLinks }
  const gaugeRoles = (state: VibeState): VibeState => ({
    ...state,
    role: Int8Array.from(state.role, (p, i) => moves.act[frame[Math.floor(i / 24)] ?? moves.identity]?.[p] ?? 0),
  })

  let a = denseRoles(slots, 2.11)
  let b = gaugeRoles(a)
  let frameFree = true

  for (let t = 0; t < 24; t++) {
    a = colorLocalBeat(weave, a, t)
    b = colorLocalBeat(gauged, b, t)
    frameFree = frameFree && same(gaugeRoles(a), b)
  }

  return { leaks, ok: leaks === 0 && reverses && gauss && frameFree }
}

type Measured = {
  battery: Acceptance
  bySide: { side: number; love: number[]; fear: number[] }[]
  color: { leaks: number; ok: boolean }
}

function measure(scheduled: ScheduledRule, spec: ColorLocalSpec | undefined): Measured {
  const battery = acceptance(scheduled)
  const bySide = SIDES.map(side =>
    side === 9
      ? { side, love: battery.love.periodLargest, fear: battery.fear.periodLargest }
      : { side, love: dressing(scheduled, { side, tone: 1 }).periodLargest, fear: dressing(scheduled, { side, tone: -1 }).periodLargest },
  )

  return { battery, bySide, color: spec ? colorExact(spec) : { leaks: -1, ok: false } }
}

export default experiment({
  id: 'gauge/color-knit-choice',
  code: 'E-FRC-0148',
  title:
    'the choice between the two color-local knit candidates by a rule written before the numbers: eligibility on every gate of E-FRC-0136 at sides 7, 9 and 11 for both signs, then the lowest worst-period dressing ratio against the committed rule',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const specB = turnScheduleSweep([103]).find(m => m.id === CANDIDATE_B)?.spec
    const committed = measure(committedRule, undefined)
    const candidates = [
      { name: 'A', measured: measure(rule(COLOR_TURN_SPEC), COLOR_TURN_SPEC) },
      { name: 'B', measured: specB ? measure(rule(specB), specB) : undefined },
    ]

    const scored = candidates.map(({ name, measured }) => {
      if (!measured) {
        return { name, eligible: false, ratio: Number.POSITIVE_INFINITY, measured }
      }

      const dressedNoMore = measured.bySide.every((s, i) => {
        const ref = committed.bySide[i]

        return s.love.every((x, p) => x <= (ref?.love[p] ?? 0)) && s.fear.every((x, p) => x <= (ref?.fear[p] ?? 0))
      })
      const eligible = passesAgainst(measured.battery, committed.battery, { bothSigns: true }) && dressedNoMore && measured.color.ok
      const ratio = Math.max(
        ...measured.bySide.flatMap((s, i) => {
          const ref = committed.bySide[i]

          return [
            ...s.love.map((x, p) => x / (ref?.love[p] ?? 1)),
            ...s.fear.map((x, p) => x / (ref?.fear[p] ?? 1)),
          ]
        }),
      )

      return { name, eligible, ratio, measured }
    })

    const eligible = scored.filter(s => s.eligible)
    const chosen = [...eligible].sort((x, y) => {
      if (Math.abs(x.ratio - y.ratio) > TIE) {
        return x.ratio - y.ratio
      }

      const cx = x.measured?.battery.vacuumComponents ?? 99
      const cy = y.measured?.battery.vacuumComponents ?? 99

      if (cx !== cy) {
        return cx - cy
      }

      const tx = x.measured?.battery.travellers ?? 0
      const ty = y.measured?.battery.travellers ?? 0

      return ty !== tx ? ty - tx : x.name.localeCompare(y.name)
    })[0]

    // which step of the rule decided: 1 the ratio, 2 the vacuum components, 3 the travellers, 4 the default
    const [first, second] = eligible
    const decidedBy =
      eligible.length < 2 || !first || !second
        ? 0
        : Math.abs(first.ratio - second.ratio) > TIE
          ? 1
          : (first.measured?.battery.vacuumComponents ?? 0) !== (second.measured?.battery.vacuumComponents ?? 0)
            ? 2
            : (first.measured?.battery.travellers ?? 0) !== (second.measured?.battery.travellers ?? 0)
              ? 3
              : 4
    const perSide = (prefix: string, m: Measured | undefined): Record<string, number> =>
      Object.fromEntries(
        (m?.bySide ?? []).flatMap(s => [
          ...s.love.map((x, p) => [`${prefix}Side${s.side}LovePeriod${p + 1}`, x] as const),
          ...s.fear.map((x, p) => [`${prefix}Side${s.side}FearPeriod${p + 1}`, x] as const),
        ]),
      )
    const battery = (prefix: string, m: Measured | undefined): Record<string, number> => {
      const b = m?.battery

      return {
        [`${prefix}Reverses`]: b?.reverses ? 1 : 0,
        [`${prefix}ChargeKept`]: b?.chargeKept ? 1 : 0,
        [`${prefix}CptMirrorPhase`]: b?.cptPhase ?? -1,
        [`${prefix}VacuumPeriod`]: b?.vacuumPeriod ?? 0,
        [`${prefix}VacuumLineComponents`]: b?.vacuumComponents ?? -1,
        [`${prefix}DenseLineComponents`]: b?.denseComponents ?? -1,
        [`${prefix}AdditivityWorst`]: b?.additivityWorst ?? -1,
        [`${prefix}WallQuantized`]: b?.wallQuantized ? 1 : 0,
        [`${prefix}WallSettledMax`]: b?.wallMax ?? -1,
        [`${prefix}Travellers`]: b?.travellers ?? -1,
        [`${prefix}MeanReach`]: b?.meanReach ?? -1,
        [`${prefix}ProtectedSpecies`]: b?.love.protectedSpecies ?? -1,
        [`${prefix}ColorLeaks`]: m?.color.leaks ?? -1,
      }
    }
    const a = scored[0]
    const b = scored[1]

    return verdict({
      status: chosen ? 'pass' : 'fail',
      claim: `by the rule written before the numbers, candidate ${chosen?.name ?? 'none'} is chosen as the color-local knit, decided at step ${decidedBy} of the rule: ${a?.eligible ? 'A is eligible' : 'A is not eligible'} with worst dressing ratio ${a?.ratio.toFixed(3)}, ${b?.eligible ? 'B is eligible' : 'B is not eligible'} with worst dressing ratio ${b?.ratio.toFixed(3)}`,
      metrics: {
        decidedByStep: decidedBy,
        chosenIsA: chosen?.name === 'A' ? 1 : 0,
        chosenIsB: chosen?.name === 'B' ? 1 : 0,
        aEligible: a?.eligible ? 1 : 0,
        bEligible: b?.eligible ? 1 : 0,
        aWorstRatio: a?.ratio ?? -1,
        bWorstRatio: b?.ratio ?? -1,
        ...battery('a', a?.measured),
        ...battery('b', b?.measured),
        ...perSide('a', a?.measured),
        ...perSide('b', b?.measured),
      },
      control: {
        ...battery('committed', committed),
        ...perSide('committed', committed),
      },
      notes:
        'L2, exact, no random numbers. The rule is in the header and was fixed before the second candidate was run at sides 7 and 11 or through the full battery. The side-9 dressing of both candidates was known from E-FRC-0137 before the rule was written, and it is stated there. The worst ratio is taken over both signs, all three sides and all four periods, so it is the gate margin at its tightest. What the run showed about the rule itself: the ratio is degenerate. A lone fear\'s first-period support is 27 under both candidates and under the committed rule, at every side, so both worst ratios are exactly 1 and the ratio cannot separate them. Both have 2 vacuum line components, so the choice fell to the third step, travellers, 16 against 15. The choice stands as registered. It is not the choice the later periods would make: B dresses far less from period 2 on (side 9 love 29, 71, 89, 86 against A\'s 31, 115, 265, 507, and at side 11 96 against 569 in period 4). A rule that compares the periods after the first would pick B, and that rule was not the one registered.',
    })
  },
})
