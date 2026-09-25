// Moving binding on a schedule the knit could adopt, and what closing the gap to E-FRC-0131 takes.
//
// E-FRC-0147 bound and moved a pair in the reflecting slots with steering on a cyclic round robin of all
// line pairs. E-FRC-0152 found the schedule a knit could carry instead: the round robin folded into the
// 24-beat palindrome, with lone steering (two lines traded whole where together they hold exactly one
// charge), which keeps CPT at the dock level and leaves the vacuum untouched. This runs that rule
// (code/rule/reflecting-slots with steer 'folded' and steerWhen 'lone', STEER below) against E-FRC-0131.
//
// What the mechanism suggested, tried on side 5 only (tmp/probe-steer-variants, means over the 8 meson
// starts and 2 baryon starts below, 600 beats, fills 0.02 / 0.1 / 0.35):
// - the fold itself, slot or lone steering: meson gap 1.29 / 3.89 / 15.3, travel 20 / 6.5 / 29, baryon
//   spread 9.6 to 10.6 cold. The cyclic round robin of E-FRC-0147: gap 1.14, travel 33, spread 16 cold
// - demons led across the ends of strings (stringLead): gap 1.23, travel 20, spread 7.6 cold
// - demons moving two links a beat: gap 1.23, travel 21, spread 9.0 cold
// - steering any two slots whose vibes differ, so both members of a baryon's pairs can turn: identical to
//   slot steering on the meson, spread 10.5 cold
// None closes the baryon gap, and none but the cyclic schedule raises travel. Averaging over starts made
// the meson's gap rise with the fill at the three fills probed. That probe is the only data seen before the
// gates below were written; no side-7 run of any of these had been made.
//
// Side-7 D4 box, mass 4, tension 1, 600 beats, the demon energy set by the share of links holding one unit.
// Every number is a mean over fixed starting headings: the meson over 8 pairs of headings (MESON_STARTS),
// the baryon beside its antibaryon over 2 sets (BARYON_STARTS), so one start's luck cannot decide a gate.
// Positions followed by tag, hop by hop, unwrapped, in D4 units.
//
// Gates, fixed before any side-7 data:
// - every run keeps Gauss's law and the energy exact on every beat and never puts a demon below zero, and
//   the first start at every fill reverses to the bit
// - bound when cold: the mean meson gap under 4 and under a tenth of the no-tension control's
// - moving when cold: the mean meson travel more than 17, half of E-FRC-0131's 34
// - the baryon holds when cold: mean spread under a tenth of the control's, and travels more than 5
// - melting is monotone: the mean meson gap rises at every step of the 6 fills, and the hottest is more
//   than ten times the coldest
// Reported, not gated: the baryon spread against E-FRC-0131's 2.7, and at the coldest fill the cyclic round
// robin, string-led demons, two-link demons and differ steering, on the same starts.
//
// Depth L2: a constructed rule on the D4 lattice against stated gates, exact integers, no random numbers.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  copyReflectingState,
  emptyReflectingState,
  makeReflectingSlots,
  reflectBeat,
  reflectBeatBack,
  reflectEnergy,
  reflectGaussHolds,
  type ReflectingSlots,
} from '@/code/rule/reflecting-slots'

const SIDE = 7
const BEATS = 600
const FILLS = [0.02, 0.05, 0.1, 0.2, 0.35, 0.5]
const GOLDEN = (Math.sqrt(5) - 1) / 2
const STEER = { steer: 'folded', steerWhen: 'lone' } as const
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

type Run = { exact: boolean; reverses: boolean; meanGap: number; meanSpread: number; travel: number }

const dist = (a: number[], b: number[]): number => Math.hypot(...a.map((x, i) => x - (b[i] ?? 0)))
const mean = (ps: number[][]): number[] => [0, 1, 2, 3].map(i => ps.reduce((s, p) => s + (p[i] ?? 0), 0) / ps.length)
const average = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)

function run(input: { rule: ReflectingSlots; fill: number; signs: number[]; fluxes: number[]; slots: number[]; reverse: boolean }): Run {
  const { rule, fill, signs, fluxes, slots } = input
  const roots = rootsD4()
  const docks = [Math.floor(rule.mesh.cellCount / 2)]

  for (let k = 1; k < signs.length; k++) {
    docks.push(rule.neighbour[(docks[k - 1] ?? 0) * 24] ?? 0)
  }

  const start = emptyReflectingState(rule, 0)

  docks.forEach((x, k) => {
    const slot = x * 24 + (slots[k] ?? 0)

    start.vibe[slot] = signs[k] ?? 0
    start.sign[slot] = signs[k] ?? 0
    start.tag[slot] = k + 1
  })
  fluxes.forEach((e, k) => (start.flux[rule.edgeAt[(docks[k] ?? 0) * 24] ?? 0] = e))
  start.demon.set(Int32Array.from({ length: start.demon.length }, (_, l) => (((l + 1) * GOLDEN) % 1 < fill ? 1 : 0)))

  const at = docks.map((_, k) => (roots[0] ?? []).map(x => x * k))
  const origin = mean(at)
  const e0 = reflectEnergy(rule, start)

  let s = copyReflectingState(start)
  let now = [...docks]
  let exact = true
  let gapSum = 0
  let spreadSum = 0
  let travel = 0

  for (let t = 0; t < BEATS; t++) {
    s = reflectBeat(rule, s, t)
    exact = exact && reflectEnergy(rule, s) === e0 && reflectGaussHolds(rule, start, s) && s.demon.every(x => x >= 0)

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

  let reverses = true

  if (input.reverse) {
    for (let t = BEATS - 1; t >= 0; t--) {
      s = reflectBeatBack(rule, s, t)
    }

    reverses =
      s.vibe.every((v, i) => v === start.vibe[i]) &&
      s.sign.every((v, i) => v === start.sign[i]) &&
      s.tag.every((v, i) => v === start.tag[i]) &&
      s.flux.every((v, i) => v === start.flux[i]) &&
      s.demon.every((v, i) => v === start.demon[i])
  }

  return { exact, reverses, meanGap: gapSum / BEATS, meanSpread: spreadSum / BEATS, travel }
}

// the meson and baryon means over the fixed starts, at one fill
function over(rule: ReflectingSlots, fill: number, reverseFirst: boolean): { meson: Run[]; baryon: Run[] } {
  return {
    meson: MESON_STARTS.map((slots, k) => run({ rule, fill, ...MESON, slots, reverse: reverseFirst && k === 0 })),
    baryon: BARYON_STARTS.map((slots, k) => run({ rule, fill, ...BARYONS, slots, reverse: reverseFirst && k === 0 })),
  }
}

export default experiment({
  id: 'gauge/knit-binding',
  code: 'E-FRC-0153',
  title:
    "moving binding on a schedule a knit could adopt: with lone steering on the round robin folded into the 24-beat palindrome, a meson and a baryon bind when cold and melt as the demons warm, averaged over fixed starting headings against a no-tension control and E-FRC-0131, with string-led demons, faster demons and differ steering tried and none closing the gap",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const shape = { side: SIDE, mass: 4, turn: false }
    const bound = makeReflectingSlots({ ...shape, tension: 1, ...STEER })
    const free = makeReflectingSlots({ ...shape, tension: 0, ...STEER })
    const cold = FILLS[0] ?? 0.02

    const scan = FILLS.map(fill => ({ fill, ...over(bound, fill, true) }))
    const control = over(free, cold, true)
    const alternatives = {
      cyclicRoundRobin: makeReflectingSlots({ ...shape, tension: 1, steer: 'round-robin', steerWhen: 'slot' }),
      stringLed: makeReflectingSlots({ ...shape, tension: 1, ...STEER, stringLead: true }),
      twoLinkDemons: makeReflectingSlots({ ...shape, tension: 1, ...STEER, demonSpeed: 2 }),
      differSteering: makeReflectingSlots({ ...shape, tension: 1, steer: 'folded', steerWhen: 'differ' }),
    }
    const tried = Object.entries(alternatives).map(([name, rule]) => ({ name, ...over(rule, cold, false) }))

    const gap = (runs: Run[]): number => average(runs.map(r => r.meanGap))
    const travel = (runs: Run[]): number => average(runs.map(r => r.travel))
    const spread = (runs: Run[]): number => average(runs.map(r => r.meanSpread))
    const coldest = scan[0]!
    const hottest = scan[scan.length - 1]!
    const gaps = scan.map(s => gap(s.meson))
    const all = [...scan.flatMap(s => [...s.meson, ...s.baryon]), ...control.meson, ...control.baryon, ...tried.flatMap(t => [...t.meson, ...t.baryon])]
    const exact = all.every(r => r.exact && r.reverses)
    const monotone = gaps.every((g, i) => i === 0 || g > (gaps[i - 1] ?? Infinity))

    const ok =
      exact &&
      gap(coldest.meson) < 4 &&
      gap(coldest.meson) < gap(control.meson) / 10 &&
      travel(coldest.meson) > 17 &&
      spread(coldest.baryon) < spread(control.baryon) / 10 &&
      travel(coldest.baryon) > 5 &&
      monotone &&
      gap(hottest.meson) > 10 * gap(coldest.meson)

    const key = (fill: number): string => String(fill).replace('.', '_')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "every run keeps Gauss's law and the energy exact and never puts a demon below zero, and the first starts reverse to the bit; at the coldest fill the mean meson gap over 8 starts is under 4 and under a tenth of the no-tension control's while it travels more than 17, the baryon's mean spread is under a tenth of its control's while it travels more than 5, and the mean meson gap rises at every step of 6 fills to more than ten times the coldest",
      metrics: {
        exactAndReversible: exact ? 1 : 0,
        meltingMonotone: monotone ? 1 : 0,
        ...Object.fromEntries(
          scan.flatMap(s => [
            [`mesonMeanGapFill${key(s.fill)}`, gap(s.meson)],
            [`mesonTravelFill${key(s.fill)}`, travel(s.meson)],
            [`baryonSpreadFill${key(s.fill)}`, spread(s.baryon)],
            [`baryonTravelFill${key(s.fill)}`, travel(s.baryon)],
            [`baryonAntibaryonGapFill${key(s.fill)}`, gap(s.baryon)],
          ]),
        ),
        coldMesonStartsTravellingOver17: coldest.meson.filter(r => r.travel > 17).length,
        mesonStarts: MESON_STARTS.length,
        baryonStarts: BARYON_STARTS.length,
      },
      control: {
        tensionlessMesonMeanGap: gap(control.meson),
        tensionlessMesonTravel: travel(control.meson),
        tensionlessBaryonSpread: spread(control.baryon),
        tensionlessBaryonTravel: travel(control.baryon),
        ...Object.fromEntries(
          tried.flatMap(t => [
            [`${t.name}ColdMesonMeanGap`, gap(t.meson)],
            [`${t.name}ColdMesonTravel`, travel(t.meson)],
            [`${t.name}ColdBaryonSpread`, spread(t.baryon)],
          ]),
        ),
      },
      notes:
        "L2, exact integers, no random numbers. Distances in D4 units (a root has length sqrt 2), unwrapped hop by hop. For comparison, E-FRC-0131 recorded at its coldest fill a meson gap of 1.72 travelling 34 against 122 with no tension, and a baryon spread of 2.7 against 228, melting between the fills 0.05 and 0.1; E-FRC-0147 (the cyclic round robin, one start) read 1.87 travelling 13 and a spread of 10.8. Lone and slot steering are the same rule for a meson, whose members never share a line. The rule here is the one E-FRC-0152 found a knit could carry; the acceptance battery on that schedule is not run.",
    })
  },
})
