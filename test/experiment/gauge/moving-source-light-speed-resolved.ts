// Light from a moving source, resolved (E-FRC-0315): the retest of E-FRC-0314 with its two weak readings
// resolved, every gate fixed in this header before the run. Does the husk light leave a moving emitter at its own
// speed c in every direction, or at c - v as the "Matter As Machine" slow-photon rule says (forward at c, backward
// at c - 2v, no backward light once v >= c / 2)?
//
// WHY A RETEST. E-FRC-0314 was OPEN: its fastest source (v / c = 0.622) read the backward front 0.035 c off the
// rest front against a 0.02 c tolerance, and its period behind 1.6 percent off the mesh Doppler against 1 percent,
// with gates written after two speeds had been read. Its two readings were short: the front speed came from two
// detectors only 8 docks apart (a 40-beat baseline, so one beat of half-rise jitter is 0.025 c), and the period
// behind from about 5 rises in 900 beats (so an endpoint ripple of 2 beats is 0.5 to 1.6 percent). Its source moved
// in quarter-dock steps, which E-FRC-0314 named as the ripple's cause. And its front window ahead ran to
// P / 2 + d / c, which for a source moving toward the detector admits the first reversal (emitted at beat P / 2 from
// x = v P / 2, so it arrives at P / 2 + (d - v P / 2) / c).
//
// WHAT CHANGES, nothing shrunk. The husk box is 1024 x 8 x 8 (twice as long), the run 2400 beats (2.67 times), the
// source drives 8 loops (one at every z, so it moves in eighth-dock steps, and at v = 1/8 dock a beat it steps
// 1/8 dock every beat, with no ripple at all), the front detectors are 32 docks apart (+32, +64 ahead, -32, -64
// behind: a 160-beat baseline, 4 times longer), the period behind is read at x = -64 from beat 64 / c + P / 2 to
// the end (12 to 21 rises), and the front window ahead ends at the first reversal's true arrival. Everything else
// is E-FRC-0314's: D 16, 3 shaped levels, cyclic potential, P = 96, one crossing a beat a link, T = 40, 20, 12, 8
// beats a dock (v / c = 0.124, 0.249, 0.414, 0.622), the source a closed y loop current so the light starts empty.
//
// NO WRAP. Light at c covers 482 docks in 2400 beats. The shortest wrapped path to a reading detector is the
// backward light to the period-ahead detector at x = +200 (824 docks), and the forward light to x = -64 (960 docks),
// so a wrapped wave would need 1.7 c to reach any reading. The fastest source reaches x = +192 at beat 1536, where
// the period ahead stops being read.
//
// THE TWO PREDICTIONS (E-FRC-0314's). Vibe's light is a wave on the fixed mesh that reads a source only as a list
// of currents: front at c both ways whatever the source does, period P (1 - v / c) ahead and P (1 + v / c) behind.
// The slow-photon rule: forward front c, backward front max(c - 2v, 0), period behind P (1 - v / c) / (1 - 2v / c).
//
// GATES, fixed before the run (the tolerances are E-FRC-0314's, unchanged):
//  M1 exact: every run keeps every |E~| below q / 2 (the cyclic flux is then exact), and a 200-beat run of the
//     fastest source, undone beat by beat with its currents removed, returns to the empty light exactly
//  M2 the control: at rest the half-rise beats ahead and behind agree to 1e-9 at every distance, and the rest front
//     speed is within 3 percent of c
//  M3 the front: for every moving source the front speeds ahead and behind are within 0.02 c of the rest front speed
//  M4 the period behind: within 1 percent of P (1 + v / c) for every moving source
// Verdict: pass (the light leaves at its own speed, a negative for the slow-photon rule) if M1 to M4 hold; fail (a
// negative for Vibe) if M1 and M2 hold and every backward front speed is within 0.02 c of max(c - 2v, 0) and every
// backward period within 1 percent of the slow-photon period; open if M1 and M2 hold and neither does; partial if M1
// or M2 fails. The period ahead (both models predict P (1 - v / c)) is read and reported, not gated.
//
// WHAT THIS DOES NOT SAY (as E-FRC-0314). A wave on a fixed mesh is source-independent by construction: the rule
// never sees the source's speed. So this confirms what the light is, and decides against the slow-photon rule only
// as a model of this light. Whether a MOVING observer reads c needs detectors built from the rule's own moving
// matter (E-SPN-0126). The source is a prescribed current, not matter.
//
// DETERMINISM: no start is drawn; the only inputs are the fixed schedule and box. Depth L2.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  halfRiseBeat,
  meanUpCrossingPeriod,
  runSheetEmitter,
  type SheetEmitterSpec,
} from '@/code/measure/moving-sheet-emitter'
import { huskLightSpeed } from '@/code/measure/one-light-speed'

const DEPTH = 16
const LEVELS = 3
const PERIOD = 96
const BEATS = 2400
const LENGTH = 1024
const WIDTH = 8
const LOOPS = 8
const STEPS = [40, 20, 12, 8]
const DETECTORS = [32, 64, 200, -32, -64]
const NEAR = 0
const FAR = 1
const AHEAD = 2
const BACK_NEAR = 3
const BACK_FAR = 4
const SPACING = 32

const spec = (stepEvery: number, beats: number): SheetEmitterSpec => ({
  length: LENGTH,
  width: WIDTH,
  depth: DEPTH,
  levels: LEVELS,
  period: PERIOD,
  stepEvery,
  current: 1,
  loops: LOOPS,
  beats,
  detectors: DETECTORS,
})

type Reading = {
  v: number
  rises: number[]
  ahead: number
  behind: number
  periodBehind: number
  crossingsBehind: number
  periodAhead: number
  crossingsAhead: number
  firstNonzero: number[]
  largestFlux: number
}

// the first reversal leaves x = v P / 2 at beat P / 2, so ahead of the source it arrives at P / 2 + (d - v P / 2) / c
const frontWindowEnd = (d: number, v: number, c: number): number =>
  d > 0
    ? PERIOD / 2 + (d - (v * PERIOD) / 2) / c
    : PERIOD / 2 + Math.abs(d) / c

function read(stepEvery: number, c: number): Reading {
  const run = runSheetEmitter(spec(stepEvery, BEATS))
  const v = stepEvery > 0 ? 1 / stepEvery : 0
  const rises = DETECTORS.map((d, k) =>
    halfRiseBeat({
      trace: run.traces[k]!,
      from: 0,
      to: frontWindowEnd(d, v, c),
      fraction: 0.5,
    }),
  )
  const back = Math.abs(DETECTORS[BACK_FAR]!)
  const behind = meanUpCrossingPeriod({
    trace: run.traces[BACK_FAR]!,
    from: Math.floor(back / c + PERIOD / 2),
    to: BEATS,
    band: 0.5,
  })
  const d = DETECTORS[AHEAD]!
  const ahead = meanUpCrossingPeriod({
    trace: run.traces[AHEAD]!,
    from: Math.floor(d / c + PERIOD / 2),
    to: stepEvery > 0 ? Math.min(BEATS, (d - 8) * stepEvery) : BEATS,
    band: 0.5,
  })

  return {
    v,
    rises,
    ahead: SPACING / (rises[FAR]! - rises[NEAR]!),
    behind: SPACING / (rises[BACK_FAR]! - rises[BACK_NEAR]!),
    periodBehind: behind.period,
    crossingsBehind: behind.crossings,
    periodAhead: ahead.period,
    crossingsAhead: ahead.crossings,
    firstNonzero: run.firstNonzero,
    largestFlux: run.largestFlux,
  }
}

export default experiment({
  id: 'gauge/moving-source-light-speed-resolved',
  code: 'E-FRC-0315',
  title:
    'light from a moving source, resolved: the E-FRC-0314 sheet emitter on the husk light (D 16) on a box twice as long, run 2400 beats, stepping in eighth docks, with a 32-dock front baseline and the period behind read over 12 to 21 rises, its gates and tolerances fixed before the run',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const c = huskLightSpeed(DEPTH)
    const q = 2 * DEPTH + 1
    const rest = read(0, c)
    const moving = STEPS.map(T => read(T, c))
    const reverse = runSheetEmitter(spec(STEPS[STEPS.length - 1]!, 200), true)
    const all = [rest, ...moving]
    const reversed = !!reverse.reversed
    const g1 = reversed && all.every(r => r.largestFlux < q / 2)
    const restSpeed = (rest.ahead + rest.behind) / 2
    const g2 =
      [0, 1].every(
        i => Math.abs(rest.rises[i]! - rest.rises[i + 3]!) <= 1e-9,
      ) && Math.abs(restSpeed / c - 1) <= 0.03

    const mediumBehind = (r: Reading): number => PERIOD * (1 + r.v / c)
    const slowBehind = (r: Reading): number =>
      r.v >= c / 2
        ? Number.NaN
        : (PERIOD * (1 - r.v / c)) / (1 - (2 * r.v) / c)
    const slowFront = (r: Reading): number => Math.max(c - 2 * r.v, 0)

    const g3 = moving.every(
      r =>
        Math.abs(r.ahead - restSpeed) <= 0.02 * c &&
        Math.abs(r.behind - restSpeed) <= 0.02 * c,
    )
    const g4 = moving.every(
      r => Math.abs(r.periodBehind / mediumBehind(r) - 1) <= 0.01,
    )
    const slowHolds = moving.every(
      r =>
        Math.abs(r.behind - slowFront(r)) <= 0.02 * c &&
        Math.abs(r.periodBehind / slowBehind(r) - 1) <= 0.01,
    )
    const status = !(g1 && g2)
      ? 'partial'
      : g3 && g4
        ? 'pass'
        : slowHolds
          ? 'fail'
          : 'open'

    const metrics: Record<string, number> = {
      gate_M1: g1 ? 1 : 0,
      gate_M2: g2 ? 1 : 0,
      gate_M3: g3 ? 1 : 0,
      gate_M4: g4 ? 1 : 0,
      lightSpeed: c,
      restFrontOverC: restSpeed / c,
      restFrontAheadOverC: rest.ahead / c,
      restFrontBehindOverC: rest.behind / c,
      restPeriodBehind: rest.periodBehind,
      restCrossingsBehind: rest.crossingsBehind,
      reversed: reversed ? 1 : 0,
      largestFlux: Math.max(...all.map(r => r.largestFlux)),
    }

    DETECTORS.forEach((d, k) => {
      metrics[`causalEdge_d${d}`] = rest.firstNonzero[k]!
    })

    for (const r of moving) {
      const tag = `vOverC${(r.v / c).toFixed(3)}`

      metrics[`frontAheadOverC_${tag}`] = r.ahead / c
      metrics[`frontBehindOverC_${tag}`] = r.behind / c
      metrics[`frontAheadOffOverC_${tag}`] = (r.ahead - restSpeed) / c
      metrics[`frontBehindOffOverC_${tag}`] = (r.behind - restSpeed) / c
      metrics[`slowFrontBehindOverC_${tag}`] = slowFront(r) / c
      metrics[`periodBehind_${tag}`] = r.periodBehind
      metrics[`meshPeriodBehind_${tag}`] = mediumBehind(r)
      metrics[`periodBehindOff_${tag}`] = r.periodBehind / mediumBehind(r) - 1
      metrics[`slowPeriodBehind_${tag}`] = slowBehind(r)
      metrics[`crossingsBehind_${tag}`] = r.crossingsBehind
      metrics[`periodAhead_${tag}`] = r.periodAhead
      metrics[`meshPeriodAhead_${tag}`] = PERIOD * (1 - r.v / c)
      metrics[`crossingsAhead_${tag}`] = r.crossingsAhead
      metrics[`frontShiftOverSlowShift_${tag}`] =
        Math.abs(r.behind - restSpeed) / Math.abs(slowFront(r) - restSpeed)
    }

    metrics.seconds = (Date.now() - started) / 1000

    const line = (f: (r: Reading) => number, digits = 4): string =>
      moving.map(r => f(r).toFixed(digits)).join(', ')

    return verdict({
      status,
      claim: `a sheet emitter on the husk light (D ${DEPTH}, c ${c.toFixed(4)}, box ${LENGTH} x ${WIDTH} x ${WIDTH}, ${BEATS} beats, eighth-dock steps) at rest sends its front at ${(rest.ahead / c).toFixed(4)} c ahead and ${(rest.behind / c).toFixed(4)} c behind; moving at v / c = ${line(r => r.v / c, 3)} the front ahead reads ${line(r => r.ahead / c)} c and behind ${line(r => r.behind / c)} c, where light leaving at c - v would give ${line(r => slowFront(r) / c, 3)} c behind; the period behind reads ${line(r => r.periodBehind, 2)} beats against the mesh Doppler ${line(mediumBehind, 2)} and the slow-photon ${line(slowBehind, 2)} (NaN: no backward light)`,
      metrics,
      control: {
        restFrontAheadOverC: rest.ahead / c,
        restFrontBehindOverC: rest.behind / c,
        restPeriodBehind: rest.periodBehind,
      },
      notes: `L2. Gates M1 ${g1}, M2 ${g2}, M3 ${g3}, M4 ${g4}; the slow-photon reading holds: ${slowHolds}. Front off the rest front, ahead ${line(r => (r.ahead - restSpeed) / c)} c and behind ${line(r => (r.behind - restSpeed) / c)} c (tolerance 0.02 c); period behind off the mesh Doppler ${line(r => 100 * (r.periodBehind / mediumBehind(r) - 1), 2)} percent on ${moving.map(r => r.crossingsBehind).join(', ')} rises (tolerance 1 percent). The backward front moved ${line(r => Math.abs(r.behind - restSpeed) / Math.abs(slowFront(r) - restSpeed), 3)} of the way toward the slow-photon front. Rest half-rise beats ${rest.rises.map(x => x.toFixed(2)).join(', ')} at x = ${DETECTORS.join(', ')}; causal edge (first nonzero integer flux) at beats ${rest.firstNonzero.join(', ')}. Period ahead at x = 200: ${line(r => r.periodAhead, 2)} against the mesh ${line(r => PERIOD * (1 - r.v / c), 2)} on ${moving.map(r => r.crossingsAhead).join(', ')} rises (both models agree there, a check only). The largest flux anywhere is ${metrics.largestFlux!.toFixed(3)} against q / 2 = ${q / 2}. A light on a fixed mesh is source-independent by construction, so this is a consistency reading of the model's light and a falsification of the slow-photon rule as a model of it, not a test of what a moving observer reads. ${metrics.seconds!.toFixed(0)} s.`,
    })
  },
})
