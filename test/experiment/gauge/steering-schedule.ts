// Can steering live inside a schedule the knit could adopt? The candidate knit is the color turn weave
// (code/rule/color-turn-weave, E-FRC-0136). Steering (E-FRC-0146) turns a charge onto its string, and a
// bound pair walks only when every line can meet the line its string runs along (E-FRC-0147: on the
// committed turning weave's couples 88 of 576 starts walked, on a round robin of all line pairs 510).
//
// 1. Which pairs of lines a schedule ever couples. A knit precesses one partition of the 12 lines by a turn,
//    a symmetry of the box, walking out and back over its powers. Counted:
//    - the color turn weave's own couples, and the committed turning weave's
//    - for every element of the 384 signed axis permutations and of all 1,152 of W(F4) acting on the lines,
//      and every one of the 10,395 partitions as a start, the pairs the powers of that element reach
//    Covering all 66 pairs takes at least 11 partitions (each couples 6), so a turn must act on the lines
//    with order at least 11.
// 2. The smallest change that reaches all 12 lines: the round robin, whose turn is the circle-method
//    rotation (lines 0 to 10 cycled, 11 fixed), folded into the knit's 24-beat palindrome (out over 12
//    powers and back). It keeps the color turn weave's table and swap order (code/rule/steered-knit).
// 3. Whether the schedule can be the knit's and not a binding-only add-on (code/rule/steered-knit, steering
//    run as S K S around the knit's collision on the same couples, with flux carried on the links):
//    - CPT at the dock level: negation with time reversal at a mirror phase, 300 dock states per beat, each
//      with a fixed pattern of string directions, for both schedules, unsteered and under both steerings
//    - the vacuum from empty on side 3, 288 beats: its period with the flux, and exact reversal
//    - the knit part of the folded schedule stays color-local (colorLocalLeaks on a dense start)
//    Two steerings are compared: E-FRC-0146's slot steering, and lone steering, which trades two lines whole
//    only where together they hold exactly one charge, so it never touches a line holding a pair.
// Gates, fixed before running: the color turn weave's couples reach fewer than 66 pairs, no power of any
// symmetry of either group reaches 66, the folded round robin reaches all 66 in 24 beats, CPT holds at some
// mirror phase for every schedule and steering, lone steering leaves the vacuum's period and reversal
// exactly as unsteered for both schedules, slot steering changes it (the control), and the folded knit
// leaks no color.
//
// Depth L1 for the counting (exact, exhaustive), L2 for the rules.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { permutationOrder, weylF4DirectionPermutations } from '@/code/measure/coin-symmetry'
import { turnElements } from '@/code/rule/color-local-family'
import { COLOR_TURN_SPEC } from '@/code/rule/color-turn-weave'
import { colorLocalLeaks, colorLocalSpec, makeColorLocalWeave } from '@/code/rule/color-local-weave'
import { BIND_MOVE_FORWARD } from '@/code/rule/collision'
import {
  couplesCovered,
  foldRoundRobin,
  knitBeat,
  knitBeatBack,
  knitDock,
  makeSteeredKnit,
  type KnitSteer,
  type KnitState,
  type SteeredKnit,
} from '@/code/rule/steered-knit'
import { type ColorLocalSpec } from '@/code/rule/color-local-weave'

const VACUUM_BEATS = 288
const GOLDEN = (Math.sqrt(5) - 1) / 2

function matchings(rest: number[]): number[][][] {
  if (rest.length === 0) {
    return [[]]
  }

  const [a, ...others] = rest

  return others.flatMap((b, i) => matchings([...others.slice(0, i), ...others.slice(i + 1)]).map(m => [[a ?? 0, b], ...m]))
}

// the most pairs of lines the powers of any element of a group reach from any start
function bestCover(group: readonly (readonly number[])[], starts: readonly number[][][]): { best: number; maxOrder: number } {
  let best = 0
  let maxOrder = 0

  for (const g of group) {
    const order = permutationOrder({ permutation: g })

    maxOrder = Math.max(maxOrder, order)

    for (const start of starts) {
      const seen = new Set<number>()

      let current = start

      for (let k = 0; k < order; k++) {
        current.forEach(([a, b]) => seen.add(Math.min(a ?? 0, b ?? 0) * 12 + Math.max(a ?? 0, b ?? 0)))
        current = current.map(([a, b]) => [g[a ?? 0] ?? 0, g[b ?? 0] ?? 0])
      }

      best = Math.max(best, seen.size)
    }
  }

  return { best, maxOrder }
}

function cptPhase(knit: SteeredKnit): number {
  for (let c = 0; c < 24; c++) {
    let holds = true

    for (let t = 0; t < 24 && holds; t++) {
      const mirror = (((c - t) % 24) + 24) % 24

      for (let n = 0; n < 300 && holds; n++) {
        const v = Int8Array.from({ length: 24 }, (_, i) => (n % 2 === 0 && (n + i) % 5 !== 0 ? 0 : ((n * 31 + i * 7 + ((n * i) % 5)) % 3) - 1))
        const string = (d: number): boolean => (n * 13 + d * 5) % 7 < 3
        const rhs = Int8Array.from(v)
        const lhs = Int8Array.from(v, x => -x)

        knitDock({ knit, slots: rhs, base: 0, string, t, forward: true })
        knitDock({ knit, slots: lhs, base: 0, string, t: mirror, forward: false })
        holds = lhs.every((x, k) => -x === rhs[k])
      }
    }

    if (holds) {
      return c
    }
  }

  return -1
}

function vacuum(knit: SteeredKnit): { period: number; firstEmpty: number; reverses: boolean } {
  const states: string[] = []

  let s: KnitState = { vibe: new Int8Array(knit.mesh.cellCount * 24), flux: new Int32Array(knit.edges.length) }
  let firstEmpty = -1

  for (let t = 0; t < VACUUM_BEATS; t++) {
    states.push(`${s.vibe.join('')}|${s.flux.join(',')}`)
    s = knitBeat(knit, s, t)
    firstEmpty = firstEmpty < 0 && s.vibe.every(v => v === 0) ? t + 1 : firstEmpty
  }

  let back = s

  for (let t = VACUUM_BEATS - 1; t >= 0; t--) {
    back = knitBeatBack(knit, back, t)
  }

  let period = 0

  for (let p = 1; p <= VACUUM_BEATS / 2 && period === 0; p++) {
    period = states.every((x, t) => t + p >= states.length || x === states[t + p]) ? p : 0
  }

  return { period, firstEmpty, reverses: back.vibe.every(v => v === 0) && back.flux.every(v => v === 0) }
}

function leaks(spec: ColorLocalSpec): number {
  const weave = makeColorLocalWeave({ side: 3, spec })
  const slots = weave.mesh.cellCount * 24
  const state = {
    vibe: Int8Array.from({ length: slots }, (_, i) => {
      const u = ((i + 1) * GOLDEN * 1.37) % 1

      return u < 0.2 ? -1 : u < 0.8 ? 0 : 1
    }),
    role: Int8Array.from({ length: slots }, (_, i) => Math.floor(((i + 3) * GOLDEN * 9 * 1.37) % 9)),
    flow: new Int32Array(slots),
  }

  let total = 0

  for (let t = 0; t < 24; t++) {
    total += colorLocalLeaks(weave, state, t)
  }

  return total
}

export default experiment({
  id: 'gauge/steering-schedule',
  code: 'E-FRC-0152',
  title:
    "steering needs a schedule in which every line meets every other, and no knit that precesses one partition by a symmetry of the box has one: the color turn weave's couples reach 12 of 66 pairs and no power of any of the 1,152 symmetries reaches more than 36, while a round robin folded into the 24-beat palindrome reaches all 66, keeps CPT, and with lone steering leaves the vacuum exactly as it was",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const roots = rootsD4()
    const index = new Map(roots.map((r, i) => [r.join(','), i]))
    const lines: [number, number][] = []

    roots.forEach((r, d) => {
      const o = index.get(r.map(x => -x).join(',')) ?? d

      if (d < o) {
        lines.push([d, o])
      }
    })

    const lineOf = (d: number): number => lines.findIndex(([a, b]) => a === d || b === d)
    const f4 = weylF4DirectionPermutations({ directions: roots }).map(p => lines.map(([a]) => lineOf(p[a] ?? 0)))
    const starts = matchings(Array.from({ length: 12 }, (_, i) => i))
    const signed = bestCover(turnElements(), starts)
    const weyl = bestCover(f4, starts)

    const colorTurnCover = couplesCovered(COLOR_TURN_SPEC, 24)
    const committedCover = couplesCovered(colorLocalSpec({ tables: [BIND_MOVE_FORWARD] }), 24)
    const folded = foldRoundRobin(COLOR_TURN_SPEC)
    const foldedCover = couplesCovered(folded, 24)

    const steers: KnitSteer[] = [false, 'slot', 'lone']
    const runs = [
      { name: 'colorTurn', spec: COLOR_TURN_SPEC },
      { name: 'folded', spec: folded },
    ].flatMap(({ name, spec }) =>
      steers.map(steer => {
        const knit = makeSteeredKnit({ side: 3, spec, steer })

        return { name, steer, cpt: cptPhase(knit), vacuum: vacuum(knit) }
      }),
    )
    const find = (name: string, steer: KnitSteer): (typeof runs)[number] => runs.find(r => r.name === name && r.steer === steer) ?? runs[0]!
    const foldedLeaks = leaks(folded)

    const loneKeepsVacuum = ['colorTurn', 'folded'].every(
      n => find(n, 'lone').vacuum.period === find(n, false).vacuum.period && find(n, false).vacuum.period > 0 && find(n, 'lone').vacuum.reverses,
    )
    const slotChangesVacuum = ['colorTurn', 'folded'].every(n => find(n, 'slot').vacuum.period !== find(n, false).vacuum.period)

    const ok =
      colorTurnCover < 66 &&
      signed.best < 66 &&
      weyl.best < 66 &&
      foldedCover === 66 &&
      runs.every(r => r.cpt >= 0 && r.vacuum.reverses) &&
      loneKeepsVacuum &&
      slotChangesVacuum &&
      foldedLeaks === 0

    const metric = (name: string, steer: KnitSteer): [string, number][] => {
      const r = find(name, steer)
      const key = `${name}${steer === false ? 'Unsteered' : steer === 'slot' ? 'SlotSteered' : 'LoneSteered'}`

      return [
        [`${key}CptPhase`, r.cpt],
        [`${key}VacuumPeriod`, r.vacuum.period],
        [`${key}VacuumFirstEmpty`, r.vacuum.firstEmpty],
      ]
    }

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "the color turn weave's couples reach fewer than 66 pairs of lines, no power of any symmetry of the box does, the round robin folded into the 24-beat palindrome reaches all 66, CPT holds at a mirror phase for both schedules unsteered and steered, lone steering leaves the vacuum's period and exact reversal as they were while slot steering changes them, and the folded knit leaks no color",
      metrics: {
        colorTurnPairsCoupled: colorTurnCover,
        foldedRoundRobinPairsCoupled: foldedCover,
        linePairs: 66,
        signedTurnBestPairs: signed.best,
        signedTurnMaxOrderOnLines: signed.maxOrder,
        weylF4BestPairs: weyl.best,
        weylF4MaxOrderOnLines: weyl.maxOrder,
        startsTried: starts.length,
        ...Object.fromEntries(['colorTurn', 'folded'].flatMap(n => steers.flatMap(s => metric(n, s)))),
        foldedColorLeaks: foldedLeaks,
        vacuumReverses: runs.every(r => r.vacuum.reverses) ? 1 : 0,
      },
      control: {
        committedTurningWeavePairsCoupled: committedCover,
        vacuumBeats: VACUUM_BEATS,
      },
      notes:
        "L1 for the counts, exact. The largest order any symmetry of the box has on the 12 lines is 6 (the central inversion fixes every line, so an element of order 12 acts with order 6), and 6 partitions couple at most 36 pairs, so no knit built as one partition precessed by one symmetry can let every line meet every other; the bound is met. The round robin's turn is not a symmetry of the box, which is the price: the schedule is no longer carried to itself by a lattice symmetry with a time shift. Folding it changes the vacuum: its period with the flux is 72 and the empty state first recurs at beat 36, where the color turn weave's are 24 and 6. CPT is checked at the dock level with fixed string patterns, as E-FRC-0125 checks the knit, not on a full box with evolving flux. Slot steering fires on the vacuum's own pairs, whose strings are on every link, and so breaks its periodicity; lone steering never fires on a line holding a pair. The acceptance battery (E-FRC-0125, 0136: dressing, walls, travel, universality) has not been run on the folded schedule.",
    })
  },
})
