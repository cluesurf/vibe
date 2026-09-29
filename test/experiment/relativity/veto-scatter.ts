// THE VETOES ARE NOT A GAP (E-RLT-0106). step-back.md's second route to a quiet vacuum was a gap: make a released pair
// cost something a slow disturbance cannot pay, so it cannot break the vacuum's pairs. The rule already has two gates
// on pair making, code/rule/occupation-veto-knit's 'point' (a pair is unmade only when its two vibes carry equal
// points, the old knit's) and 'occupation' (E-RLT-0100). The question is whether either acts as that gap.
//
// PROBE before this file, disclosed: tmp/veto-gap-probe (side 16, 'pass', coin on, Born path, the registered key,
// which on side 16 does not depend on the beat, E-MTH-0029). With NO mixer, one lone vibe scrambles the whole box under
// 'point' (792, 18,866, 186,469 and 571,453 trits apart at beats 4, 8, 12, 16) and under 'occupation' (248,728 by beat
// 36), and stays at 1 to 4 under 'none' (the working vacuum). The gates below are that finding, read before this file,
// re-read on the full-period key (code/measure/full-key-paths fullPathKey) over three paths, with the old key as the
// control: a rerun of a disclosed finding, not a prediction.
//
// GATES (side 16, 'pass', coin on, Born path, no mixer, one lone love at the center dock's slot 0, 64 beats; the wake is
// the trits apart from the unseeded run under the same veto and key):
//  V1 'none' is quiet: the wake stays at or under 100 on every path.
//  V2 'point' scrambles: the wake passes a twentieth of the slots by beat 64 on every path.
//  V3 'occupation' scrambles, the same way.
//  CONTROL: the old key reproduces the probe's logged 'point' wake at every fourth beat exactly (16 samples). The
//     first run of this file compared against step-back.md's quoted beats (792 at beat 4), which are one sample late
//     against the probe's own log (792 is beat 8), and so read partial; the control now reads the log.
//  Verdict: pass if V1 to V3 hold and the control reproduces; partial if only the control fails; fail otherwise.
//
// WHAT IT MEANS: the working vacuum ('none') is the one transparent setting; a gate on pair making makes the vacuum
// scatter a single vibe, not shield it. The gap route through the rule's existing vetoes is closed. Depth L2.
// DETERMINISM: no random numbers; paths are integer Weyl offsets of the key. NOTHING MOVES.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { centerOf } from '@/code/measure/wall-reading'
import { tritsApart } from '@/code/measure/doublet-locked-readings'
import { contactFresh } from '@/code/measure/occupation-veto-readings'
import { wordVacuum } from '@/code/measure/mixed-vacuum-readings'
import { cloneConfiguration } from '@/code/rule/doublet-locked-knit'
import { type VetoKind } from '@/code/rule/occupation-veto-knit'
import {
  fullPathKey,
  keyedRunner,
  oldPathKey,
  pathOffset,
  wakeGrowth,
  type PathKey,
} from '@/code/measure/full-key-paths'

const SIDE = 16
const BEATS = 64
const PATHS = 3
const QUIET = 100
const VETOES: VetoKind[] = ['none', 'point', 'occupation']
// tmp/veto-gap-probe.log, 'point' with no mixer, every 4 beats (step-back.md quotes 792 to 571,453 as beats 4 to 16;
// the log puts them at beats 8 to 20, and 8 at beat 4)
const PROBE_POINT = [
  8, 792, 18866, 186469, 571453, 630075, 635059, 636524, 636764, 636827,
  637549, 635959, 636072, 635914, 636860, 636477,
]

export default experiment({
  id: 'relativity/veto-scatter',
  code: 'E-RLT-0106',
  title:
    "the rule's own gates on pair making are not a gap, they make one lone vibe scramble the vacuum, pass: with no mixer on three full-key paths (side 16, 'pass', 64 beats) one lone love stays at a wake of at most 27 under 'none' (the working vacuum), passes a twentieth of the slots by beat 15 under 'point' (636,680 or more at beat 64) and by beat 18 under 'occupation' (632,349 or more); the old key reproduces the probe's 'point' wake at all 16 samples",
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const t0 = Date.now()
    const center = centerOf(SIDE)
    const f = contactFresh(SIDE, 'pass', center)
    const vacuum = wordVacuum(f, f.store)
    const start = cloneConfiguration(vacuum)

    start.vibe[center * 24] = 1
    start.open[center * 24] = 1

    const scrambled = (f.cells * 24) / 20

    const wakeOf = (veto: VetoKind, key: PathKey): number[] => {
      const a = keyedRunner(f.tables, vacuum, { key, veto })
      const b = keyedRunner(f.tables, start, { key, veto })
      const wake: number[] = []

      for (let t = 0; t < BEATS; t++) {
        a.beat()
        b.beat()
        wake.push(tritsApart(b.state(), a.state()))
      }

      return wake
    }

    const keys = Array.from({ length: PATHS }, (_, k) =>
      fullPathKey(pathOffset(k)),
    )
    const runs = VETOES.map(veto => ({
      veto,
      wakes: keys.map(key => wakeOf(veto, key)),
    }))
    const oldPoint = wakeOf('point', oldPathKey(f.cells))
    const oldAt = oldPoint.filter((_, t) => t % 4 === 3)
    const control = oldAt.every((v, i) => v === PROBE_POINT[i])
    const of = (veto: VetoKind): number[][] =>
      runs.find(r => r.veto === veto)!.wakes
    const gV1 = of('none').every(w => Math.max(...w) <= QUIET)
    const scrambles = (veto: VetoKind): boolean =>
      of(veto).every(w => w[BEATS - 1]! > scrambled)
    const gV2 = scrambles('point')
    const gV3 = scrambles('occupation')
    const status = !(gV1 && gV2 && gV3)
      ? 'fail'
      : control
        ? 'pass'
        : 'partial'
    const firstAbove = (w: number[]): number =>
      w.findIndex(x => x > scrambled) + 1
    const metrics: Record<string, number> = {
      gate_V1: gV1 ? 1 : 0,
      gate_V2: gV2 ? 1 : 0,
      gate_V3: gV3 ? 1 : 0,
      control: control ? 1 : 0,
      scrambledAbove: scrambled,
    }

    for (const r of runs) {
      metrics[`${r.veto}_maxWake`] = Math.max(...r.wakes.flat())
      metrics[`${r.veto}_leastWake64`] = Math.min(
        ...r.wakes.map(w => w[BEATS - 1]!),
      )

      metrics[`${r.veto}_latestScrambleBeat`] = Math.max(
        ...r.wakes.map(firstAbove),
      )

      metrics[`${r.veto}_growthPath0`] = wakeGrowth(
        r.wakes[0]!,
        QUIET,
        scrambled,
      )
    }

    metrics.seconds = (Date.now() - t0) / 1000

    const every4 = (w: number[]): string =>
      w.filter((_, t) => t % 4 === 3).join(' ')

    return verdict({
      status,
      claim: `one lone love with no mixer on three full-key paths (side ${SIDE}, 'pass', ${BEATS} beats): under 'none' the wake stays at or under ${metrics.none_maxWake}; under 'point' it passes ${scrambled} trits by beat ${metrics.point_latestScrambleBeat} on every path (least at 64: ${metrics.point_leastWake64}); under 'occupation' by beat ${metrics.occupation_latestScrambleBeat} (least ${metrics.occupation_leastWake64}); the old key reproduces the probe's 'point' wake ${oldAt.join(', ')}: ${control}`,
      metrics,
      control: {
        oldPointBeat4: oldAt[0]!,
        oldPointBeat8: oldAt[1]!,
        oldPointBeat12: oldAt[2]!,
        oldPointBeat16: oldAt[3]!,
        oldPointBeat20: oldAt[4]!,
      },
      notes: `L2. V1 ${gV1}, V2 ${gV2}, V3 ${gV3}, control ${control}. Wake every 4 beats, per veto and path: ${runs.map(r => `${r.veto}: ${r.wakes.map(every4).join(' || ')}`).join(' | ')}. Old key 'point': ${every4(oldPoint)}. ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
    })
  },
})
