// A bound pair that travels in the committed slot architecture: the reflecting slots of E-FRC-0133 with
// steering (E-FRC-0146), against E-FRC-0131's target.
//
// E-FRC-0133 bound a meson in slots that all move every beat, but the cold pair was stuck: a charge only
// ever flew straight or bounced back, so the two members never shared a heading, and every way out of their
// cell cost a unit of tension a cold demon rarely holds. Three candidates were tried (tmp/probe-carry,
// tmp/probe-carry-trace, tmp/probe-walk-starts):
// - a store carried by each charge, refilled from the link demons every few beats: the meson stayed stuck
//   (travel 2.3 to 5.9 in 600 beats at every contact period tried, 1, 4 and 16)
// - demons that move two or three links per beat: stuck (travel 0.7 to 5.9)
// - the mechanism, read off the trace: a pair walks when both members head along their string. The one in
//   front pays to stretch it, the one behind is paid for shortening it, and the demon it paid moves one link
//   along with the pair and pays the next stretch. With no turning, the only starts that walk are the two
//   where both head along the string line (2 of 576 starting headings, all 576 bound)
// So a charge must be able to turn onto its string. Steering does that: on couples of lines, a charge trades
// slots where exactly one of the two links it could point along carries string. On the turning weave's own
// couples only 5 of the 12 lines are ever coupled to the string's line, and 88 of the 576 starts walked in
// 300 beats (the 10 by 10 block of headings on those lines). Coupling every pair of lines in turn (the round
// robin of 11 matchings) is the rule measured here, as STEER. Its probe over the same 576 starts read 510
// walking, all 576 bound, median travel 19 in 300 beats. That probe is the only data seen before the gates
// below were written; the side-7 runs had not been run.
//
// Side-7 D4 box, mass 4, tension 1, 600 beats, the demon energy set by the share of links holding one unit,
// with a no-tension control. The seeds are E-FRC-0133's (a meson with the love heading direction 5 and the
// fear heading 14, and a baryon beside its antibaryon), so the members start on different lines and no
// motion is put in by hand. Positions followed by tag, hop by hop, unwrapped, in D4 units.
//
// Gates, fixed before this file first ran:
// - every run keeps Gauss's law and the energy exact on every beat, never puts a demon below zero, and
//   reverses to the bit
// - E-FRC-0131's target at the coldest fill: the meson's mean gap under 4 and under a tenth of the control's
//   while it travels more than 10, the baryon's spread under a tenth of the control's while it travels more
//   than 5
// - melting: the meson's mean gap at the hottest fill more than ten times the coldest
// - robustness: on side 5, cold, 300 beats, from all 576 pairs of starting headings, more than half are
//   bound (mean gap under 4) and travel more than 10
// Reported, not gated: the carried store with steering (contact every beat, and none). The same start scan
// under the turning weave's couples is the probe's 88 of 576, and is not rerun here to keep the run short.
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
  type Steer,
} from '@/code/rule/reflecting-slots'

const SIDE = 7
const BEATS = 600
const FILLS = [0.02, 0.05, 0.1, 0.2, 0.35, 0.5]
const STEER: Steer = 'round-robin'
const SCAN_SIDE = 5
const SCAN_BEATS = 300
const GOLDEN = (Math.sqrt(5) - 1) / 2
const MESON = { signs: [1, -1], fluxes: [1], slots: [5, 14] }
const BARYONS = { signs: [1, 1, 1, -1, -1, -1], fluxes: [1, 2, 3, 2, 1], slots: [5, 9, 14, 18, 7, 20] }

type Seed = { signs: number[]; fluxes: number[]; slots: number[] }

type Run = { exact: boolean; reverses: boolean; meanGap: number; meanSpread: number; travel: number }

const dist = (a: number[], b: number[]): number => Math.hypot(...a.map((x, i) => x - (b[i] ?? 0)))
const mean = (ps: number[][]): number[] => [0, 1, 2, 3].map(i => ps.reduce((s, p) => s + (p[i] ?? 0), 0) / ps.length)

function run(input: { rule: ReflectingSlots; fill: number; seed: Seed; beats: number; reverse: boolean }): Run {
  const { rule, fill, seed, beats } = input
  const roots = rootsD4()
  const cells = [Math.floor(rule.mesh.cellCount / 2)]

  for (let k = 1; k < seed.signs.length; k++) {
    cells.push(rule.neighbour[(cells[k - 1] ?? 0) * 24] ?? 0)
  }

  const start = emptyReflectingState(rule, 0)

  cells.forEach((c, k) => {
    const slot = c * 24 + (seed.slots[k] ?? 0)

    start.vibe[slot] = seed.signs[k] ?? 0
    start.sign[slot] = seed.signs[k] ?? 0
    start.tag[slot] = k + 1
  })
  seed.fluxes.forEach((e, k) => (start.flux[rule.edgeAt[(cells[k] ?? 0) * 24] ?? 0] = e))
  start.demon.set(Int32Array.from({ length: start.demon.length }, (_, l) => (((l + 1) * GOLDEN) % 1 < fill ? 1 : 0)))

  const at = cells.map((_, k) => (roots[0] ?? []).map(x => x * k))
  const origin = mean(at)
  const e0 = reflectEnergy(rule, start)

  let s = copyReflectingState(start)
  let now = [...cells]
  let exact = true
  let gapSum = 0
  let spreadSum = 0
  let travel = 0

  for (let t = 0; t < beats; t++) {
    s = reflectBeat(rule, s, t)
    exact = exact && reflectEnergy(rule, s) === e0 && reflectGaussHolds(rule, start, s) && s.demon.every(x => x >= 0) && s.store.every(x => x >= 0)

    const next = seed.signs.map((_, k) => Math.floor(s.tag.indexOf(k + 1) / 24))

    next.forEach((cell, k) => {
      if (cell !== now[k]) {
        const d = Array.from({ length: 24 }, (_, i) => i).find(i => rule.neighbour[(now[k] ?? 0) * 24 + i] === cell) ?? -1

        at[k] = (at[k] ?? []).map((x, i) => x + (roots[d]?.[i] ?? Number.NaN))
      }
    })
    now = next

    const loves = at.filter((_, k) => (seed.signs[k] ?? 0) > 0)
    const fears = at.filter((_, k) => (seed.signs[k] ?? 0) < 0)

    gapSum += dist(mean(loves), mean(fears))
    spreadSum += Math.max(...loves.map(p => Math.max(...loves.map(q => dist(p, q)))))
    travel = Math.max(travel, dist(mean(at), origin))
  }

  let reverses = true

  if (input.reverse) {
    for (let t = beats - 1; t >= 0; t--) {
      s = reflectBeatBack(rule, s, t)
    }

    reverses =
      s.vibe.every((v, i) => v === start.vibe[i]) &&
      s.sign.every((v, i) => v === start.sign[i]) &&
      s.tag.every((v, i) => v === start.tag[i]) &&
      s.flux.every((v, i) => v === start.flux[i]) &&
      s.demon.every((v, i) => v === start.demon[i]) &&
      s.store.every((v, i) => v === start.store[i])
  }

  return { exact, reverses, meanGap: gapSum / beats, meanSpread: spreadSum / beats, travel }
}

// every pair of starting headings for a meson, cold: how many are bound and travel
function scan(steer: Steer): { walking: number; bound: number; starts: number } {
  const rule = makeReflectingSlots({ side: SCAN_SIDE, mass: 4, tension: 1, turn: false, steer })

  let walking = 0
  let bound = 0

  for (let a = 0; a < 24; a++) {
    for (let b = 0; b < 24; b++) {
      const r = run({ rule, fill: FILLS[0] ?? 0.02, seed: { signs: [1, -1], fluxes: [1], slots: [a, b] }, beats: SCAN_BEATS, reverse: false })

      bound += r.meanGap < 4 ? 1 : 0
      walking += r.meanGap < 4 && r.travel > 10 ? 1 : 0
    }
  }

  return { walking, bound, starts: 576 }
}

export default experiment({
  id: 'gauge/steered-binding',
  code: 'E-FRC-0147',
  title:
    'a bound pair travels in the committed slot architecture once a charge can steer onto its string: the reflecting slots with steering against E-FRC-0131, a meson and a baryon over a scan of demon energies with a no-tension control, and the carried store that did not free it',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const shape = { side: SIDE, mass: 4, turn: false, steer: STEER }
    const bound = makeReflectingSlots({ ...shape, tension: 1 })
    const free = makeReflectingSlots({ ...shape, tension: 0 })
    const cold = FILLS[0] ?? 0.02
    const hot = FILLS[FILLS.length - 1] ?? 0.5

    const fills = FILLS.map(fill => ({
      fill,
      meson: run({ rule: bound, fill, seed: MESON, beats: BEATS, reverse: true }),
      baryon: run({ rule: bound, fill, seed: BARYONS, beats: BEATS, reverse: true }),
    }))
    const coldest = fills[0]!
    const hottest = fills[fills.length - 1]!
    const mesonControl = run({ rule: free, fill: cold, seed: MESON, beats: BEATS, reverse: true })
    const baryonControl = run({ rule: free, fill: cold, seed: BARYONS, beats: BEATS, reverse: true })

    const carried = [1, 0].map(contact => {
      const rule = makeReflectingSlots({ ...shape, tension: 1, carry: true, contact })

      return {
        contact,
        cold: run({ rule, fill: cold, seed: MESON, beats: BEATS, reverse: true }),
        hot: run({ rule, fill: hot, seed: MESON, beats: BEATS, reverse: true }),
      }
    })

    const starts = scan(STEER)

    const all = [...fills.flatMap(f => [f.meson, f.baryon]), mesonControl, baryonControl, ...carried.flatMap(c => [c.cold, c.hot])]
    const exact = all.every(r => r.exact && r.reverses)

    const ok =
      exact &&
      coldest.meson.meanGap < 4 &&
      coldest.meson.meanGap < mesonControl.meanGap / 10 &&
      coldest.meson.travel > 10 &&
      coldest.baryon.meanSpread < baryonControl.meanSpread / 10 &&
      coldest.baryon.travel > 5 &&
      hottest.meson.meanGap > 10 * coldest.meson.meanGap &&
      starts.walking > starts.starts / 2

    const key = (fill: number): string => String(fill).replace('.', '_')

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "every run keeps Gauss's law and the energy exact, never puts a demon below zero and reverses to the bit; at the coldest fill the steered meson's mean gap is under 4 and under a tenth of the no-tension control's while it travels more than 10, the baryon's spread is under a tenth of its control's while it travels more than 5, the hottest meson's gap is more than ten times the coldest, and more than half of all 576 starting headings give a cold meson that is bound and travels",
      metrics: {
        exactAndReversible: exact ? 1 : 0,
        ...Object.fromEntries(
          fills.flatMap(f => [
            [`mesonMeanGapFill${key(f.fill)}`, f.meson.meanGap],
            [`mesonTravelFill${key(f.fill)}`, f.meson.travel],
            [`baryonSpreadFill${key(f.fill)}`, f.baryon.meanSpread],
            [`baryonTravelFill${key(f.fill)}`, f.baryon.travel],
            [`baryonAntibaryonGapFill${key(f.fill)}`, f.baryon.meanGap],
          ]),
        ),
        startsBoundAndTravelling: starts.walking,
        startsBound: starts.bound,
        startsTried: starts.starts,
      },
      control: {
        tensionlessMesonMeanGap: mesonControl.meanGap,
        tensionlessMesonTravel: mesonControl.travel,
        tensionlessBaryonSpread: baryonControl.meanSpread,
        tensionlessBaryonTravel: baryonControl.travel,
        ...Object.fromEntries(
          carried.flatMap(c => [
            [`carriedContact${c.contact}ColdMesonMeanGap`, c.cold.meanGap],
            [`carriedContact${c.contact}ColdMesonTravel`, c.cold.travel],
            [`carriedContact${c.contact}HotMesonMeanGap`, c.hot.meanGap],
            [`carriedContact${c.contact}HotMesonTravel`, c.hot.travel],
          ]),
        ),
      },
      notes:
        "L2, exact integers, no random numbers. Distances in D4 units (a root has length sqrt 2), unwrapped hop by hop. For comparison, E-FRC-0131 recorded at its coldest fill a meson mean gap of 1.72 while travelling 34, against 122 with no tension, and a baryon spread of 2.7 against 228; E-FRC-0133's unsteered reflecting slots read a cold meson gap of 0.17 while travelling 0.7. The steered pair walks because the energy the rear member releases rides the streaming demon to the front one: the pair carries its own string energy, where the cold bath could not pay it. Weaker than E-FRC-0131 in three places, reported as measured: the cold meson travels 13 against 34 (its no-tension control's midpoint travels 28), clearing the gate of 10 by little; the cold baryon spreads 10.8 against 2.7, still under a tenth of its control's 382; and neither gap nor travel is monotone in the fill (the meson travels 4.4 at 0.1, and its gap reads 15.4 at 0.2, 11.3 at 0.35, 36.7 at 0.5), so the melting lies between the fills 0.1 and 0.2 without a clean curve. The carried store, with steering: trading with the bath every beat freezes the cold meson (travel 1.4), since each trade hands the unit a pair was about to use to the link behind it, while with no contact at all the meson walks (gap 1.34, travel 47) at every fill alike, since its energy never meets the bath. So a store isolates a pair from the temperature rather than letting it trade with it.",
    })
  },
})
