// The acceptance battery on the color turn weave, a color-local rule that dresses no more than the
// committed one.
//
// E-FRC-0125 found the color weave (the committed schedule on the hop-free table) passes every gate of
// the committed rule but dressing: 51, 331, 1,319, 2,587 slots against 33, 160, 565, 1,508. The search of
// E-FRC-0137 kept the hop-free table and varied the schedule. The color turn weave
// (code/rule/color-turn-weave) changes two choices of the color weave: the turn that precesses the
// couples (an involution that swaps the first two axes and reverses the third, where the committed turn
// has order four) and the order the palindromic swap visits the couples (3, 0, 5, 2, 4, 1 and back).
// Gates, fixed before this run, each item run on this rule and on the committed turning weave by the same
// code (code/measure/weave-acceptance, E-FRC-0125's battery):
//
// 1. Reversal and charge (side 5), CPT at a mirror phase, the empty vacuum's period (side 7), line-graph
//    components on the vacuum and on a dense background no more than the committed rule's (side 5), exact
//    superposition (side 11), sheet-quantized walls (side 9): at least as good as the committed rule
//    wherever it passes.
// 2. Dressing: a lone love's largest support over all 24 directions no larger than the committed rule's
//    in each of four periods (side 9), the gate E-FRC-0125 failed. Asked here of a lone fear as well,
//    which E-FRC-0125 did not ask, because the committed rule is not charge symmetric in dressing (a love
//    reads 33 and a fear 27 in the first period) and a gate asked of one sign could pass by favoring it.
// 3. Robustness: the same dressing comparison on side-7 and side-11 boxes, both signs.
// 4. Color exact as a local law: on a dense side-3 box with role points, 48 beats leak no cell's color,
//    run back restore the start exactly, Gauss's law holds at every cell on every beat, and a change of
//    role frame in every cell commutes with the rule. The committed table through the same code leaks.
// 5. The instruments: the sparse dressing count equals the dense difference beat by beat on this rule's
//    worst direction, and the sparse line-graph counts equal the dense ones.
// Controls: the color weave through the same battery must fail the dressing gate as E-FRC-0125 found
// (51, 331, 1,319, 2,587), and the committed rule must pass against itself.
// Reported, not gated: travel over 6 beats (side 13) and protected species.
//
// Depth L2: a constructed rule measured against stated gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { turningWeave, type Collision } from '@/code/rule/collision'
import { COLOR_TURN_SPEC, colorTurnWeave } from '@/code/rule/color-turn-weave'
import {
  colorLocalBeat,
  colorLocalBeatBack,
  colorLocalLeaks,
  colorLocalSpec,
  makeColorLocalWeave,
  PAIR_TABLE,
  type ColorLocalSpec,
} from '@/code/rule/color-local-weave'
import { gaussHolds, type VibeState } from '@/code/rule/vibe-weave'
import { acceptance, dressing, lineComponents, passesAgainst, type Dressing, type ScheduledRule } from '@/code/measure/weave-acceptance'
import { loneDressing, neighbourTable, vacuumCells } from '@/code/measure/lone-dressing'
import { collide, streamSourceTable } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'
import { d4BoxCell, d4BoxMesh } from '@/code/substrate/d4-box'
import { meshOpposites } from '@/code/tool/mesh'

const GOLDEN = (Math.sqrt(5) - 1) / 2
const COLOR_BEATS = 48
const FRAME_BEATS = 24
const DRESSING_SIDE = 9
const ROBUST_SIDES = [7, 11]
const BEATS = 96
const HOP_FREE_DRESSING = [51, 331, 1319, 2587]

const committedRule: ScheduledRule = (opposite, forward) => turningWeave({ opposite, forward, table: 'pair' })
const colorWeaveRule: ScheduledRule = (opposite, forward) => turningWeave({ opposite, forward, table: 'bind' })
const turnRule: ScheduledRule = (opposite, forward) => colorTurnWeave({ opposite, forward })

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

// item 4: color leaks, reversal, Gauss and the frame change on a side-3 box with role points
function colorExact(spec: ColorLocalSpec): { leaks: number; reverses: boolean; gauss: boolean; frameFree: boolean } {
  const weave = makeColorLocalWeave({ side: 3, spec })
  const { mesh, moves } = weave
  const slots = mesh.cellCount * 24
  const start = denseRoles(slots, 1.37)

  let s = start
  let leaks = 0
  let gauss = true

  for (let t = 0; t < COLOR_BEATS; t++) {
    leaks += colorLocalLeaks(weave, s, t)
    s = colorLocalBeat(weave, s, t)
    gauss = gauss && gaussHolds(weave, start, s)
  }

  for (let t = COLOR_BEATS - 1; t >= 0; t--) {
    s = colorLocalBeatBack(weave, s, t)
  }

  const reverses = same(s, start)

  // a change of role frame in every cell, links changed to match (as E-FRC-0124)
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

  for (let t = 0; t < FRAME_BEATS; t++) {
    a = colorLocalBeat(weave, a, t)
    b = colorLocalBeat(gauged, b, t)
    frameFree = frameFree && same(gaugeRoles(a), b)
  }

  return { leaks, reverses, gauss, frameFree }
}

// item 5: the dense difference of E-FRC-0125 against the sparse count, beat by beat, one direction
function denseMatchesSparse(rule: ScheduledRule, direction: number): boolean {
  const mesh = d4BoxMesh({ side: DRESSING_SIDE })
  const opposite = meshOpposites(mesh)
  const forward = rule(opposite, true)
  const table = streamSourceTable(mesh)
  const center = d4BoxCell({ coordinates: [4, 4, 4, 4], side: DRESSING_SIDE })
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

  const sparse = loneDressing({
    neighbours: neighbourTable(mesh),
    forward,
    vacuum: vacuumCells({ forward, beats: BEATS }),
    cell: center,
    direction,
    beats: BEATS,
  }).map(b => b.support)

  return dense.every((x, t) => x === sparse[t])
}

const noMore = (a: Dressing, b: Dressing): boolean => a.periodLargest.every((x, p) => x <= (b.periodLargest[p] ?? 0))

export default experiment({
  id: 'gauge/color-turn-weave-acceptance',
  code: 'E-FRC-0136',
  title:
    "a color-local rule passes every acceptance gate of the committed rule, dressing included: the color turn weave, the hop-free table with a different turn of the couples and swap order, keeps reversal, charge, CPT, the vacuum's period, fewer line-graph components, superposition and sheet-quantized walls, and a lone love and a lone fear dress no more than under the committed rule in every period at sides 7, 9 and 11, with color exact cell by cell",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const committed = acceptance(committedRule)
    const turn = acceptance(turnRule)
    const colorWeave = acceptance(colorWeaveRule)

    const passes = passesAgainst(turn, committed, { bothSigns: true })
    const committedPassesItself = passesAgainst(committed, committed, { bothSigns: true })
    const colorWeaveFails = !passesAgainst(colorWeave, committed) && colorWeave.love.periodLargest.every((x, p) => x === HOP_FREE_DRESSING[p])

    const robust = ROBUST_SIDES.map(side => {
      const turnLove = dressing(turnRule, { side, tone: 1 })
      const turnFear = dressing(turnRule, { side, tone: -1 })
      const committedLove = dressing(committedRule, { side, tone: 1 })
      const committedFear = dressing(committedRule, { side, tone: -1 })

      return { side, turnLove, turnFear, committedLove, committedFear, ok: noMore(turnLove, committedLove) && noMore(turnFear, committedFear) }
    })

    const turnColor = colorExact(COLOR_TURN_SPEC)
    const committedColor = colorExact(colorLocalSpec({ tables: [PAIR_TABLE] }))
    const colorOk = turnColor.leaks === 0 && turnColor.reverses && turnColor.gauss && turnColor.frameFree && committedColor.leaks > 0

    const worst = turn.love.perDirection.indexOf(Math.max(...turn.love.perDirection))
    const instrumentsExact =
      denseMatchesSparse(turnRule, worst) &&
      [false, true].every(withDense => lineComponents(turnRule, withDense) === lineComponents(turnRule, withDense, { dense: true }))

    const ok = passes && committedPassesItself && colorWeaveFails && robust.every(r => r.ok) && colorOk && instrumentsExact

    const perPeriod = (prefix: string, xs: readonly number[]): Record<string, number> =>
      Object.fromEntries(xs.map((x, p) => [`${prefix}Period${p + 1}`, x]))

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "the color turn weave, color-local and hop-free, does at least as well as the committed rule on every acceptance item it passes, and a lone love and a lone fear dress no more than under the committed rule in each of four periods on boxes of side 7, 9 and 11, where the color weave on the committed schedule fails the same gate as E-FRC-0125 found",
      metrics: {
        reverses: turn.reverses ? 1 : 0,
        chargeConserved: turn.chargeKept ? 1 : 0,
        cptMirrorPhase: turn.cptPhase,
        vacuumPeriod: turn.vacuumPeriod,
        vacuumLineComponents: turn.vacuumComponents,
        denseLineComponents: turn.denseComponents,
        additivityWorst: turn.additivityWorst,
        wallQuantized: turn.wallQuantized ? 1 : 0,
        wallSettledMax: turn.wallMax,
        ...perPeriod('loveLargestSupport', turn.love.periodLargest),
        ...perPeriod('fearLargestSupport', turn.fear.periodLargest),
        ...Object.fromEntries(robust.flatMap(r => [
          ...Object.entries(perPeriod(`side${r.side}Love`, r.turnLove.periodLargest)),
          ...Object.entries(perPeriod(`side${r.side}Fear`, r.turnFear.periodLargest)),
        ])),
        worstSupportGrowth: turn.love.worstGrowth,
        protectedSpecies: turn.love.protectedSpecies,
        travellers: turn.travellers,
        meanReach: turn.meanReach,
        colorLeaks: turnColor.leaks,
        colorReversesWithRoles: turnColor.reverses ? 1 : 0,
        gaussEveryCellEveryBeat: turnColor.gauss ? 1 : 0,
        frameFree: turnColor.frameFree ? 1 : 0,
        instrumentsExact: instrumentsExact ? 1 : 0,
      },
      control: {
        committedPassesItself: committedPassesItself ? 1 : 0,
        committedCptMirrorPhase: committed.cptPhase,
        committedVacuumPeriod: committed.vacuumPeriod,
        committedVacuumLineComponents: committed.vacuumComponents,
        committedDenseLineComponents: committed.denseComponents,
        committedWallSettledMax: committed.wallMax,
        ...perPeriod('committedLove', committed.love.periodLargest),
        ...perPeriod('committedFear', committed.fear.periodLargest),
        ...Object.fromEntries(robust.flatMap(r => [
          ...Object.entries(perPeriod(`committedSide${r.side}Love`, r.committedLove.periodLargest)),
          ...Object.entries(perPeriod(`committedSide${r.side}Fear`, r.committedFear.periodLargest)),
        ])),
        committedProtectedSpecies: committed.love.protectedSpecies,
        committedTravellers: committed.travellers,
        committedMeanReach: committed.meanReach,
        committedColorLeaks: committedColor.leaks,
        colorWeaveFailsDressing: colorWeaveFails ? 1 : 0,
        ...perPeriod('colorWeaveLove', colorWeave.love.periodLargest),
        ...perPeriod('colorWeaveFear', colorWeave.fear.periodLargest),
        freeReach: Math.SQRT2 * 6,
      },
      notes:
        'L2, exact, no random numbers. The rule was found by the search of E-FRC-0137, which also found other members that pass (a different table sequence on the committed turn with another swap order, among them), so this is one color-local rule that passes, not the only one. The gates are the comparative gates of E-FRC-0125, with the fear\'s dressing and the side-7 and side-11 boxes added. The dressing numbers at all three sides were seen in a probe (tmp/robust-probe) before these gates were fixed, so the robustness item records a measurement rather than testing a prediction. Travel and protected species are reported, not gated. What it does not show: that the rule keeps the committed rule\'s other results (the kick law, the Sakharov mechanism, the counting weights), none of which this battery asks.',
    })
  },
})
