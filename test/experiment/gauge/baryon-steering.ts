// What a baryon's members do, and whether steering toward the string's junction closes the baryon gap.
//
// E-FRC-0153 bound a meson that walks, but a cold baryon spread 8.1 against E-FRC-0131's 2.7. The baryon
// here is E-FRC-0131's: three loves in a row with fluxes 1 and 2 between them and 3 beyond, a multiple of
// 3 that costs nothing, then its antibaryon. So its middle member has two strings leaving its dock, and the
// question is whether it steers onto the right one.
//
// 1. The mechanism, on side 5, cold (fill 0.02), 600 beats, both baryon starts, with the lone steering of
//    E-FRC-0153: every beat, each love classified by how many of its dock's 24 links carry string (0, 1, or
//    2 and more) and by what it did: stayed in its dock (it bounced), crossed along a string (the string
//    stays), shortened one, or stretched a new one. Also counted, each beat: junctions (docks holding no
//    charge with three or more string links) and the beats the three loves share one dock.
// 2. Steering candidates on side 7, cold, 600 beats, means over E-FRC-0153's 8 meson starts and 2 baryon
//    starts, with the tensionless control:
//    - lone: E-FRC-0153's rule, the baseline
//    - retract: the whole-line trade where exactly one of the charge's slot and the matching slot points
//      along a link whose string the charge would shorten: toward the junction or the member it trails
//    - stretch: the same, marking directions whose crossing would make a new string: away from stretching
//    - line: string read per line (E-FRC-0156, the reading that keeps full-box CPT)
//    Each is its own inverse by the argument of E-FRC-0146 (the condition reads the flux and the charge's
//    sign, and holds before and after the trade).
// Gates, fixed before any side-7 run of these candidates (side-5 probes, tmp/probe-steer-variants, had read
// the cold baryon spread as 9.6 lone, 8.1 line, 15.2 retract):
// - every run keeps Gauss's law and the energy exact and never puts a demon below zero
// - some candidate other than lone brings the cold baryon's mean spread under 5 while its cold meson keeps
//   a mean gap under 4 and travels more than 10
// A failed second gate is the finding: steering toward the junction does not close the baryon gap.
//
// Depth L2: constructed rules against stated gates, exact integers, no random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  copyReflectingState,
  emptyReflectingState,
  makeReflectingSlots,
  reflectBeat,
  reflectEnergy,
  reflectGaussHolds,
  type ReflectingSlots,
  type ReflectingState,
  type SteerWhen,
} from '@/code/rule/reflecting-slots'

const SIDE = 7
const BEATS = 600
const COLD = 0.02
const GOLDEN = (Math.sqrt(5) - 1) / 2
const CANDIDATES: SteerWhen[] = ['lone', 'retract', 'stretch', 'line']
const MESON_STARTS = [
  [5, 14],
  [0, 23],
  [3, 17],
  [9, 2],
  [12, 20],
  [7, 11],
  [18, 6],
  [21, 15],
]
const BARYON_STARTS = [
  [5, 9, 14, 18, 7, 20],
  [0, 3, 12, 21, 6, 17],
]
const MESON = { signs: [1, -1], fluxes: [1] }
const BARYONS = { signs: [1, 1, 1, -1, -1, -1], fluxes: [1, 2, 3, 2, 1] }

const mod3 = (x: number): number => ((x % 3) + 3) % 3
const dist = (a: number[], b: number[]): number => Math.hypot(...a.map((x, i) => x - (b[i] ?? 0)))
const mean = (ps: number[][]): number[] => [0, 1, 2, 3].map(i => ps.reduce((s, p) => s + (p[i] ?? 0), 0) / ps.length)
const average = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)

function start(rule: ReflectingSlots, fill: number, signs: number[], fluxes: number[], slots: number[]): { state: ReflectingState; docks: number[] } {
  const docks = [Math.floor(rule.mesh.cellCount / 2)]

  for (let k = 1; k < signs.length; k++) {
    docks.push(rule.neighbour[(docks[k - 1] ?? 0) * 24] ?? 0)
  }

  const state = emptyReflectingState(rule, 0)

  docks.forEach((x, k) => {
    const i = x * 24 + (slots[k] ?? 0)

    state.vibe[i] = signs[k] ?? 0
    state.sign[i] = signs[k] ?? 0
    state.tag[i] = k + 1
  })
  fluxes.forEach((e, k) => (state.flux[rule.edgeAt[(docks[k] ?? 0) * 24] ?? 0] = e))
  state.demon.set(Int32Array.from({ length: state.demon.length }, (_, l) => (((l + 1) * GOLDEN) % 1 < fill ? 1 : 0)))

  return { state, docks }
}

type Run = { exact: boolean; meanGap: number; meanSpread: number; travel: number }

function run(rule: ReflectingSlots, fill: number, signs: number[], fluxes: number[], slots: number[]): Run {
  const roots = rootsD4()
  const { state, docks } = start(rule, fill, signs, fluxes, slots)
  const at = docks.map((_, k) => (roots[0] ?? []).map(x => x * k))
  const origin = mean(at)
  const e0 = reflectEnergy(rule, state)

  let s = copyReflectingState(state)
  let now = [...docks]
  let exact = true
  let gapSum = 0
  let spreadSum = 0
  let travel = 0

  for (let t = 0; t < BEATS; t++) {
    s = reflectBeat(rule, s, t)
    exact = exact && reflectEnergy(rule, s) === e0 && reflectGaussHolds(rule, state, s) && s.demon.every(x => x >= 0)

    const next = signs.map((_, k) => Math.floor(s.tag.indexOf(k + 1) / 24))

    next.forEach((x, k) => {
      if (x !== now[k]) {
        const d = Array.from({ length: 24 }, (_, i) => i).find(i => rule.neighbour[(now[k] ?? 0) * 24 + i] === x) ?? -1

        at[k] = (at[k] ?? []).map((v, i) => v + (roots[d]?.[i] ?? Number.NaN))
      }
    })
    now = next

    const loves = at.filter((_, k) => (signs[k] ?? 0) > 0)
    const fears = at.filter((_, k) => (signs[k] ?? 0) < 0)

    gapSum += dist(mean(loves), mean(fears))
    spreadSum += Math.max(...loves.map(p => Math.max(...loves.map(q => dist(p, q)))))
    travel = Math.max(travel, dist(mean(at), origin))
  }

  return { exact, meanGap: gapSum / BEATS, meanSpread: spreadSum / BEATS, travel }
}

// the mechanism tally on side 5, cold, lone steering
function mechanism(): Record<string, number> {
  const rule = makeReflectingSlots({ side: 5, mass: 4, tension: 1, turn: false, steer: 'folded', steerWhen: 'lone' })
  const tally: Record<string, number> = {}
  const add = (k: string): void => void (tally[k] = (tally[k] ?? 0) + 1)
  const linkOf = (x: number, d: number): number => {
    const o = rule.opposite[d] ?? d

    return d < o ? (rule.edgeAt[x * 24 + d] ?? 0) : (rule.edgeAt[(rule.neighbour[x * 24 + d] ?? 0) * 24 + o] ?? 0)
  }
  const strings = (s: ReflectingState, x: number): number => Array.from({ length: 24 }, (_, d) => d).filter(d => mod3(s.flux[linkOf(x, d)] ?? 0) !== 0).length

  for (const slots of BARYON_STARTS) {
    let s = copyReflectingState(start(rule, COLD, BARYONS.signs, BARYONS.fluxes, slots).state)

    for (let t = 0; t < BEATS; t++) {
      const before = [1, 2, 3].map(k => Math.floor(s.tag.indexOf(k) / 24))
      const counts = before.map(x => Math.min(2, strings(s, x)))
      const next = reflectBeat(rule, s, t)
      const after = [1, 2, 3].map(k => Math.floor(next.tag.indexOf(k) / 24))

      before.forEach((x, k) => {
        const y = after[k] ?? x
        const key = `strings${counts[k] ?? 0}`

        if (x === y) {
          add(`${key}Stayed`)

          return
        }

        const d = Array.from({ length: 24 }, (_, i) => i).find(i => rule.neighbour[x * 24 + i] === y) ?? 0
        const was = mod3(s.flux[linkOf(x, d)] ?? 0) !== 0
        const is = mod3(next.flux[linkOf(x, d)] ?? 0) !== 0

        add(`${key}${was && !is ? 'Shortened' : !was && is ? 'Stretched' : was && is ? 'Along' : 'Free'}`)
      })

      if (after[0] === after[1] && after[1] === after[2]) {
        add('beatsTogetherInOneDock')
      }

      for (let x = 0; x < rule.mesh.cellCount; x++) {
        let charge = false

        for (let d = 0; d < 24 && !charge; d++) {
          charge = next.vibe[x * 24 + d] !== 0
        }

        if (!charge && strings(next, x) >= 3) {
          add('junctionDockBeats')
        }
      }

      s = next
    }
  }

  return tally
}

export default experiment({
  id: 'gauge/baryon-steering',
  code: 'E-FRC-0157',
  title:
    "no steering tried closes the baryon gap while the meson walks: steering toward the string's junction spreads the baryon further (15.3), steering away from stretching is lone steering exactly, and line steering holds the baryon as tight as E-FRC-0131 (spread 2.6 against 2.7) but stops the meson (travel 1.8); a middle member with two strings mostly bounces in place",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const tally = mechanism()
    const shape = { side: SIDE, mass: 4, turn: false, steer: 'folded' as const }
    const candidates = CANDIDATES.map(when => {
      const rule = makeReflectingSlots({ ...shape, tension: 1, steerWhen: when })

      return {
        when,
        meson: MESON_STARTS.map(slots => run(rule, COLD, MESON.signs, MESON.fluxes, slots)),
        baryon: BARYON_STARTS.map(slots => run(rule, COLD, BARYONS.signs, BARYONS.fluxes, slots)),
      }
    })
    const free = makeReflectingSlots({ ...shape, tension: 0, steerWhen: 'lone' })
    const controlMeson = MESON_STARTS.map(slots => run(free, COLD, MESON.signs, MESON.fluxes, slots))
    const controlBaryon = BARYON_STARTS.map(slots => run(free, COLD, BARYONS.signs, BARYONS.fluxes, slots))

    const exact = [...candidates.flatMap(c => [...c.meson, ...c.baryon]), ...controlMeson, ...controlBaryon].every(r => r.exact)
    const closes = candidates.filter(
      c =>
        c.when !== 'lone' &&
        average(c.baryon.map(r => r.meanSpread)) < 5 &&
        average(c.meson.map(r => r.meanGap)) < 4 &&
        average(c.meson.map(r => r.travel)) > 10,
    )

    const ok = exact && closes.length > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "every run keeps Gauss's law and the energy exact and no demon goes below zero, and some steering other than lone brings the cold baryon's mean spread under 5 while the cold meson keeps a mean gap under 4 and travels more than 10",
      metrics: {
        exact: exact ? 1 : 0,
        candidatesClosingTheGap: closes.length,
        ...Object.fromEntries(
          candidates.flatMap(c => [
            [`${c.when}ColdBaryonSpread`, average(c.baryon.map(r => r.meanSpread))],
            [`${c.when}ColdBaryonTravel`, average(c.baryon.map(r => r.travel))],
            [`${c.when}ColdMesonGap`, average(c.meson.map(r => r.meanGap))],
            [`${c.when}ColdMesonTravel`, average(c.meson.map(r => r.travel))],
          ]),
        ),
        ...Object.fromEntries(Object.entries(tally).map(([k, v]) => [`mechanism${k.charAt(0).toUpperCase()}${k.slice(1)}`, v])),
      },
      control: {
        tensionlessBaryonSpread: average(controlBaryon.map(r => r.meanSpread)),
        tensionlessMesonGap: average(controlMeson.map(r => r.meanGap)),
        tensionlessMesonTravel: average(controlMeson.map(r => r.travel)),
      },
      notes:
        "L2, exact integers, no random numbers. For comparison E-FRC-0131's cold baryon spread was 2.7 and E-FRC-0153's 8.1. The baryon is a chain, not a Y: with whole-number flux and Gauss's law, three strings can meet at an empty dock only as 1, 1 and -2, and the start has none; the junction count says how often one forms. A love crossing a link whose flux is 1 or 2 without making it a multiple of 3 moves along its string at no cost, so the middle member of the chain feels no pull toward either neighbor. Every steering condition here is an involution, so it turns a charge off a marked direction exactly when it would turn one onto it. Two results are identities, not findings: stretch steering is lone steering (a crossing makes a new string exactly where there was none, since a flux of 0 plus or minus 1 is never a multiple of 3), and for the meson retract steering gives lone's numbers. The mechanism tally (side 5, cold, lone): a member with two strings at its dock stayed 418 times and moved 36 (24 along a string, 9 shortening one, 3 stretching), a member with one stayed 1,889 and moved 112; the three loves shared one dock on 167 beats and an empty junction dock appeared on 102 dock-beats. The trade seen across E-FRC-0153, 0156 and here: steering that reads string per slot lets the meson walk and leaves the baryon loose; steering that reads it per line holds the baryon and keeps CPT but stops both from travelling.",
    })
  },
})
