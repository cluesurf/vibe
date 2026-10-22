// Light from a moving source, with a period reader that cannot skip (E-FRC-0316): the retest of E-FRC-0315 with
// only its period reader changed, every gate fixed in this header before the run.
//
// WHY. E-FRC-0315 (OPEN) held its front gate at every speed but read the period behind at v / c = 0.622 as 190.71
// beats against the mesh Doppler 155.70. Diagnosed after that run: its hysteresis band was half of the WHOLE record's
// largest |E~|, the trace's envelope grows through the run (about 1.0 to 1.2 early, 1.4 to 1.7 late) with a fast ripple
// of about 13 beats riding on it late, so two early rises stayed under the band and one counted spacing was three
// periods. The rises it kept were 155.75 apart.
//
// THE NEW READER (code/measure/moving-sheet-emitter envelopeRisePeriod), fixed here. Its two lengths come from the
// source's own period P = 96, not from any reading: the trace is smoothed by a centered boxcar of 25 beats (about
// P / 4, odd, no phase shift; it passes a period of 96 to 156 beats at 0.89 to 0.96 of its amplitude and cuts a
// 13-beat ripple to 0.04), and a rise needs the smoothed trace to go from below -h(t) to above +h(t), h(t) half
// the largest |y| over the trailing 2 P = 192 beats, so the band follows the local envelope. Every period behind
// expected here is under 192 beats, so the trailing window always holds a full cycle. The rise's time is the last
// interpolated zero crossing on the way up, the period the mean spacing. Disclosed: the 25-beat smoothing was chosen
// knowing E-FRC-0315's diagnosis (a ripple of about 13 beats); no trace was read with this reader before this header.
// E-FRC-0315 saved no trace, so no post-hoc re-read of it is possible; none is made.
//
// EVERYTHING ELSE IS E-FRC-0315's: box 1024 x 8 x 8, D 16, 3 shaped levels, cyclic potential, P = 96, one crossing a
// beat a link on 8 loops (eighth-dock steps), T = 40, 20, 12, 8 beats a dock (v / c = 0.124, 0.249, 0.415, 0.622),
// 2400 beats, detectors +32, +64, +200, -32, -64, the half-rise front reading with the reversal-corrected window, the
// period behind read at x = -64 from beat 64 / c + P / 2 to the end, the period ahead at x = +200 (read, not gated).
//
// GATES, fixed before the run (tolerances E-FRC-0315's):
//  M1 exact: every run keeps every |E~| below q / 2, and a 200-beat run of the fastest source, undone beat by beat
//     with its currents removed, returns to the empty light exactly
//  M2 the control: at rest the half-rise beats ahead and behind agree to 1e-9 at every distance, and the rest front
//     speed is within 3 percent of c
//  M3 the front: for every moving source the front speeds ahead and behind are within 0.02 c of the rest front speed
//  M4 the period behind (the new reader): within 1 percent of P (1 + v / c) for every moving source
//  M5 the reader skips nothing: for every moving source and at rest, every spacing of the rises behind lies within
//     0.75 to 1.25 times their median (a skipped rise doubles a spacing, a spurious one halves it), on at least 8 rises
// Verdict: pass if M1 to M5 hold; fail (a negative for Vibe) if M1, M2 and M5 hold and every backward front speed is
// within 0.02 c of max(c - 2v, 0) and every backward period within 1 percent of the slow-photon period; partial if M1,
// M2 or M5 fails (the instrument or the reader is not sound); open otherwise.
//
// RUNTIME, estimated before the run: E-FRC-0315 took 8,278 s on one thread on the loaded machine; the new reader adds
// well under a second.
//
// WHAT THIS DOES NOT SAY (as E-FRC-0314 and E-FRC-0315). A wave on a fixed mesh is source-independent by
// construction, so this confirms what the light is and decides against the slow-photon rule only as a model of this
// light, not what a moving observer reads (E-SPN-0126). The source is a prescribed current, not matter.
//
// FIRST RUN (2026-10-21, tmp/frc316-run.log, 5,394 s, one thread): PASS. Every gate holds; nothing moved.
//  - M1: exact reversal, largest flux 6.30 against 16.5. M2: rest front 0.9943 c, ahead and behind equal.
//  - M3: front off the rest front ahead +0.00002, -0.0004, +0.0012, +0.0072 c, behind +0.0003, +0.0011, +0.0024,
//    -0.0009 c at v / c = 0.124, 0.249, 0.415, 0.622 (the same front readings as E-FRC-0315, bit for bit).
//  - M4: period behind 107.98, 119.95, 135.84, 155.84 beats against the mesh Doppler 107.94, 119.88, 135.80, 155.70
//    (+0.041, +0.062, +0.029, +0.091 percent); the slow-photon rule predicts 111.89, 143.52, 328.96 and none. At rest
//    96.02 against 96.
//  - M5: on 21 (rest), 18, 16, 15, 13 rises, every spacing within 0.982 to 1.007 of its median: no rise skipped, none
//    spurious. The fastest source's 190.71 in E-FRC-0315 was its reader.
//
// DETERMINISM: no start is drawn; the only inputs are the fixed schedule and box. Depth L2.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  envelopeRisePeriod,
  halfRiseBeat,
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
const SMOOTH = 25
const WINDOW = 2 * PERIOD
const BAND = 0.5
const SPACING_LOW = 0.75
const SPACING_HIGH = 1.25
const LEAST_RISES = 8

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
  spacingsBehind: number[]
  periodAhead: number
  crossingsAhead: number
  firstNonzero: number[]
  largestFlux: number
}

const frontWindowEnd = (d: number, v: number, c: number): number =>
  d > 0
    ? PERIOD / 2 + (d - (v * PERIOD) / 2) / c
    : PERIOD / 2 + Math.abs(d) / c

const median = (xs: readonly number[]): number => {
  const s = [...xs].sort((a, b) => a - b)
  const n = s.length

  return n % 2 ? s[(n - 1) / 2]! : (s[n / 2 - 1]! + s[n / 2]!) / 2
}

// every spacing within [0.75, 1.25] x the median, on at least LEAST_RISES rises
const noSkip = (r: Reading): boolean => {
  const m = median(r.spacingsBehind)

  return (
    r.crossingsBehind >= LEAST_RISES &&
    r.spacingsBehind.every(x => x >= SPACING_LOW * m && x <= SPACING_HIGH * m)
  )
}

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
  const behind = envelopeRisePeriod({
    trace: run.traces[BACK_FAR]!,
    from: Math.floor(back / c + PERIOD / 2),
    to: BEATS,
    smooth: SMOOTH,
    window: WINDOW,
    band: BAND,
  })
  const d = DETECTORS[AHEAD]!
  const ahead = envelopeRisePeriod({
    trace: run.traces[AHEAD]!,
    from: Math.floor(d / c + PERIOD / 2),
    to: stepEvery > 0 ? Math.min(BEATS, (d - 8) * stepEvery) : BEATS,
    smooth: SMOOTH,
    window: WINDOW,
    band: BAND,
  })

  return {
    v,
    rises,
    ahead: SPACING / (rises[FAR]! - rises[NEAR]!),
    behind: SPACING / (rises[BACK_FAR]! - rises[BACK_NEAR]!),
    periodBehind: behind.period,
    crossingsBehind: behind.crossings,
    spacingsBehind: behind.spacings,
    periodAhead: ahead.period,
    crossingsAhead: ahead.crossings,
    firstNonzero: run.firstNonzero,
    largestFlux: run.largestFlux,
  }
}

export default experiment({
  id: 'gauge/moving-source-light-speed-envelope',
  code: 'E-FRC-0316',
  title:
    'light from a moving source, pass with a period reader that cannot skip (gates fixed before the run): the E-FRC-0315 emitter at 0.124 to 0.622 c sends its front within 0.0072 c of the rest front both ways (the slow-photon rule needs 0.751 to 0 c behind) and its period behind reads 107.98, 119.95, 135.84, 155.84 beats against the mesh Doppler 107.94, 119.88, 135.80, 155.70 (within 0.091 percent), every rise spacing within 0.982 to 1.007 of its median, a negative for light leaving its source at c - v',
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
    const g5 = all.every(noSkip)
    const slowHolds = moving.every(
      r =>
        Math.abs(r.behind - slowFront(r)) <= 0.02 * c &&
        Math.abs(r.periodBehind / slowBehind(r) - 1) <= 0.01,
    )
    const status = !(g1 && g2 && g5)
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
      gate_M5: g5 ? 1 : 0,
      lightSpeed: c,
      restFrontOverC: restSpeed / c,
      restPeriodBehind: rest.periodBehind,
      restCrossingsBehind: rest.crossingsBehind,
      reversed: reversed ? 1 : 0,
      largestFlux: Math.max(...all.map(r => r.largestFlux)),
    }

    for (const r of moving) {
      const tag = `vOverC${(r.v / c).toFixed(3)}`
      const m = median(r.spacingsBehind)

      metrics[`frontAheadOffOverC_${tag}`] = (r.ahead - restSpeed) / c
      metrics[`frontBehindOffOverC_${tag}`] = (r.behind - restSpeed) / c
      metrics[`periodBehind_${tag}`] = r.periodBehind
      metrics[`meshPeriodBehind_${tag}`] = mediumBehind(r)
      metrics[`periodBehindOff_${tag}`] = r.periodBehind / mediumBehind(r) - 1
      metrics[`slowPeriodBehind_${tag}`] = slowBehind(r)
      metrics[`crossingsBehind_${tag}`] = r.crossingsBehind
      metrics[`spacingLowOverMedian_${tag}`] = Math.min(...r.spacingsBehind) / m
      metrics[`spacingHighOverMedian_${tag}`] = Math.max(...r.spacingsBehind) / m
      metrics[`periodAhead_${tag}`] = r.periodAhead
      metrics[`meshPeriodAhead_${tag}`] = PERIOD * (1 - r.v / c)
    }

    metrics.seconds = (Date.now() - started) / 1000

    const line = (f: (r: Reading) => number, digits = 4): string =>
      moving.map(r => f(r).toFixed(digits)).join(', ')

    return verdict({
      status,
      claim: `the E-FRC-0315 emitter (D ${DEPTH}, c ${c.toFixed(4)}, box ${LENGTH} x ${WIDTH} x ${WIDTH}, ${BEATS} beats) at v / c = ${line(r => r.v / c, 3)}: front off the rest front (${(restSpeed / c).toFixed(4)} c) ahead ${line(r => (r.ahead - restSpeed) / c)} c and behind ${line(r => (r.behind - restSpeed) / c)} c; the period behind by the envelope reader ${line(r => r.periodBehind, 2)} beats against the mesh Doppler ${line(mediumBehind, 2)} and the slow-photon ${line(slowBehind, 2)} (NaN: no backward light), at rest ${rest.periodBehind.toFixed(2)} against ${PERIOD}`,
      metrics,
      control: {
        restFrontOverC: restSpeed / c,
        restPeriodBehind: rest.periodBehind,
      },
      notes: `L2. Gates M1 ${g1}, M2 ${g2}, M3 ${g3}, M4 ${g4}, M5 ${g5}; the slow-photon reading holds: ${slowHolds}. Period behind off the mesh Doppler ${line(r => 100 * (r.periodBehind / mediumBehind(r) - 1), 3)} percent on ${moving.map(r => r.crossingsBehind).join(', ')} rises (rest ${rest.crossingsBehind}); spacings behind over their median ${all.map(r => `[${Math.min(...r.spacingsBehind).toFixed(1)}..${Math.max(...r.spacingsBehind).toFixed(1)}] / ${median(r.spacingsBehind).toFixed(2)}`).join('; ')}. Spacings behind (rest first) ${all.map(r => r.spacingsBehind.map(x => x.toFixed(1)).join(' ')).join(' | ')}. Period ahead at x = 200: ${line(r => r.periodAhead, 2)} against the mesh ${line(r => PERIOD * (1 - r.v / c), 2)} on ${moving.map(r => r.crossingsAhead).join(', ')} rises. Largest flux ${metrics.largestFlux!.toFixed(3)} against q / 2 = ${q / 2}. ${metrics.seconds!.toFixed(0)} s.`,
    })
  },
})
