// Light from a moving source (E-FRC-0314): does the husk light leave a moving emitter at its own speed c in every
// direction, or at c - v as the "Matter As Machine" model's slow-photon rule says (light leaves its source at
// c - v in every direction, measured in absolute time, so forward at c and backward at 2v - c)?
//
// THE TWO PREDICTIONS, written before any run. The mesh is the model's absolute frame. Vibe's light is the
// trit-column light read on the husk (code/rule/trit-husk-shaped, the integer form, D 16, 3 shaped levels,
// cyclic potential), a wave on the fixed mesh whose long-wave speed is c = sqrt(4 / (3 (2D + 1))) = 0.2010 docks
// a beat (E-MTR-0023). It reads a source only as a list of currents, so it predicts a front at c both ways
// whatever the source does, and a Doppler period P (1 - v / c) ahead and P (1 + v / c) behind. The slow-photon
// rule predicts the forward front at c, the backward front at c - 2v (no backward light at all once v >= c / 2),
// a forward period P (1 - v / c) like the mesh's, and a backward period P (1 - v / c) / (1 - 2 v / c), because
// its whole light sphere moves with the source. Front at c is a negative for that model; a backward front that
// picks up v is a negative for Vibe.
//
// THE EMITTER (code/measure/moving-sheet-emitter, a STAND-IN with a prescribed path). A sheet of closed y loop
// current on a husk box 512 x 8 x 8, 4 loops at z = 0, 2, 4, 6, one crossing a beat on each loop link, its sign
// flipping every 48 beats (P = 96, a wavelength of 19.3 docks, long against a dock). It moves along +x at
// v = 1 / T docks a beat, T = 40, 20, 12, 8 (v / c = 0.124, 0.249, 0.414, 0.622), its plane part in quarter-dock
// steps; the control is the same sheet at rest. A closed loop carries no charge, so the light starts empty and
// every flux read was emitted. Detectors are whole layers at x = +8, +16, +48 ahead and -8, -16, -24 behind the
// start, each reading the layer-averaged shadow flux E~_y (the plane part).
//
// READINGS. The FRONT: the interpolated beat at which |E~_y| first reaches half its largest value before the
// first reversal can arrive (window [0, P/2 + |d| / c)), and the front speed 8 / (t(16) - t(8)) ahead and behind,
// so the half-rise offset cancels. The PERIOD: the mean spacing of the rises through zero (hysteresis half the
// window's peak) at x = -24 from beat 24 / c + P / 2 to the end, and at x = +48 until the source is 8 docks away.
// The causal edge: the first beat any integer flux numerator on a detector layer is nonzero.
//
// PROBE BEFORE THE GATES, disclosed (tmp/frc314-probe1.ts). The first form (box 256 x 2 x 2, whole-dock steps)
// read the fronts at c but its whole-dock steps added a ripple that broke the period reading, so the source was
// given quarter-dock steps on a wider box (the plane sector is exact at any width). On that form, rest: front
// 0.9856 c both ways, period 95.97; v / c = 0.124: front ahead 0.9881 c, behind 0.9890 c, period behind 108.3
// against 107.9 (mesh) and 112.0 (slow photons). The gates were written after those two speeds were read; the
// probe went on to v / c = 0.249, 0.415, 0.622 after they were written, and they were not moved (it read the
// backward front 0.988, 0.984, 1.021 c and the period behind 118.9, 137.1, 158.2, so M3 and M4 were expected to
// miss their tolerances at the fastest source).
//
// FIRST RUN (2026-10-19, 953 s): OPEN. M1 and M2 hold (the run reverses exactly, flux at most 4.10 against
// q / 2 = 16.5; at rest the front reads 0.9856 c both ways, bit for bit). M3 misses at one point: the backward
// front reads 0.9890, 0.9884, 0.9844, 1.0206 c at v / c = 0.124 .. 0.622, the last 0.035 c off the rest front
// against a 0.02 c tolerance (the front ahead 0.9881, 0.9722, 0.9674, 0.9744 c). M4 misses at two: the period
// behind reads 108.28, 118.92, 137.12, 158.24 against the mesh Doppler 107.94, 119.88, 135.80, 155.70 (0.3,
// 0.8, 1.0, 1.6 percent) against a 1 percent tolerance. The slow-photon rule misses by far more: its backward
// front 0.751, 0.503, 0.171, 0 c and period 111.9, 143.5, 329.0, none. The backward front moved 0.015, 0.006,
// 0.001, 0.036 of the way toward the slow-photon front. So the light keeps its own speed within 3.6 percent of
// the shift the slow-photon rule needs at every speed, a negative for that rule, and the pre-registered tight
// tolerances miss at the fastest source, which is the open part (the half-rise and crossing readings carry a
// ripple from the source's quarter-dock steps that grows with speed; not shown, not fixed).
//
// Gates:
//  M1 exact: every run keeps every |E~| below q / 2 (the cyclic flux is then exact), and a 200-beat run of the
//     fastest source, undone beat by beat with its currents removed, returns to the empty light exactly
//  M2 the control: at rest the half-rise beats ahead and behind agree to 1e-9 at every distance, and the rest
//     front speed is within 3 percent of c
//  M3 the front: for every moving source the front speeds ahead and behind are within 0.02 c of the rest front
//     speed
//  M4 the period behind: within 1 percent of P (1 + v / c) for every moving source
// Verdict: pass (the light leaves at its own speed, a negative for the slow-photon rule) if M1 to M4 hold; fail (a
// negative for Vibe) if M1 and M2 hold and every backward front speed is within 0.02 c of max(c - 2v, 0) and
// every backward period within 1 percent of the slow-photon period; open if M1 and M2 hold and neither does;
// partial if M1 or M2 fails.
//
// WHAT THIS DOES NOT SAY. A wave on a fixed mesh is source-independent by construction: the rule never sees the
// source's speed. So M3 and M4 confirm what the light is, and decide against the slow-photon rule only as a
// model of this light. They say nothing about whether a MOVING observer reads c, which is what relativity
// asks and the mesh frame makes nontrivial: that needs detectors built from the rule's own moving matter, which
// on the working rule cannot leave its lines (E-SPN-0126). The source is a prescribed current, not matter.
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
const BEATS = 900
const STEPS = [40, 20, 12, 8]
const DETECTORS = [8, 16, 48, -8, -16, -24]
const NEAR = 0
const FAR = 1
const AHEAD = 2
const BACK_NEAR = 3
const BACK_FAR = 4
const BEHIND = 5
const SPACING = 8

const spec = (stepEvery: number, beats: number): SheetEmitterSpec => ({
  length: 512,
  width: 8,
  depth: DEPTH,
  levels: LEVELS,
  period: PERIOD,
  stepEvery,
  current: 1,
  loops: 4,
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

function read(stepEvery: number, c: number): Reading {
  const run = runSheetEmitter(spec(stepEvery, BEATS))
  const v = stepEvery > 0 ? 1 / stepEvery : 0
  const rises = DETECTORS.map((d, k) =>
    halfRiseBeat({
      trace: run.traces[k]!,
      from: 0,
      to: PERIOD / 2 + Math.abs(d) / c,
      fraction: 0.5,
    }),
  )
  const behind = meanUpCrossingPeriod({
    trace: run.traces[BEHIND]!,
    from: Math.floor(Math.abs(DETECTORS[BEHIND]!) / c + PERIOD / 2),
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
  id: 'gauge/moving-source-light-speed',
  code: 'E-FRC-0314',
  title:
    'light from a moving source, open: a sheet emitter on the husk light (D 16) moving at 0.124 to 0.622 c sends its front behind at 0.989, 0.988, 0.984, 1.021 c (rest 0.986 c) where light leaving at c - v would give 0.751, 0.503, 0.171, 0 c, and its period behind reads 108.3 to 158.2 beats within 0.3 to 1.6 percent of the mesh Doppler P (1 + v / c) against the slow-photon 111.9, 143.5, 329.0, none: a negative for the slow-photon rule, with the pre-registered 0.02 c and 1 percent tolerances missed at the fastest source',
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
    const g1 =
      reversed &&
      all.every(r => r.largestFlux < q / 2)
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
      restPeriodBehind: rest.periodBehind,
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
      metrics[`slowFrontBehindOverC_${tag}`] = slowFront(r) / c
      metrics[`periodBehind_${tag}`] = r.periodBehind
      metrics[`meshPeriodBehind_${tag}`] = mediumBehind(r)
      metrics[`slowPeriodBehind_${tag}`] = slowBehind(r)
      metrics[`periodAhead_${tag}`] = r.periodAhead
      metrics[`meshPeriodAhead_${tag}`] = PERIOD * (1 - r.v / c)
      metrics[`crossingsAhead_${tag}`] = r.crossingsAhead
      // how far the backward front moved from the rest front, as a share of the move the slow-photon rule needs
      metrics[`frontShiftOverSlowShift_${tag}`] =
        Math.abs(r.behind - restSpeed) / Math.abs(slowFront(r) - restSpeed)
    }

    metrics.seconds = (Date.now() - started) / 1000

    const line = (f: (r: Reading) => number, digits = 4): string =>
      moving.map(r => f(r).toFixed(digits)).join(', ')

    return verdict({
      status,
      claim: `a sheet emitter on the husk light (D ${DEPTH}, c ${c.toFixed(4)}) at rest sends its front at ${(rest.ahead / c).toFixed(4)} c ahead and ${(rest.behind / c).toFixed(4)} c behind; moving at v / c = ${line(r => r.v / c, 3)} the front ahead reads ${line(r => r.ahead / c)} c and behind ${line(r => r.behind / c)} c, where light leaving at c - v would give ${line(r => slowFront(r) / c, 3)} c behind; the period behind reads ${line(r => r.periodBehind, 2)} beats against the mesh Doppler ${line(mediumBehind, 2)} and the slow-photon ${line(slowBehind, 2)} (NaN: no backward light)`,
      metrics,
      control: {
        restFrontAheadOverC: rest.ahead / c,
        restFrontBehindOverC: rest.behind / c,
        restPeriodBehind: rest.periodBehind,
      },
      notes: `L2. Gates M1 ${g1}, M2 ${g2}, M3 ${g3}, M4 ${g4}; the slow-photon reading holds: ${slowHolds}. The backward front moved ${line(r => Math.abs(r.behind - restSpeed) / Math.abs(slowFront(r) - restSpeed), 3)} of the way from the rest front toward the slow-photon front, by source speed. Rest half-rise beats ${rest.rises.map(x => x.toFixed(2)).join(', ')} at x = ${DETECTORS.join(', ')}; the rule's causal edge (first nonzero integer flux) at beats ${rest.firstNonzero.join(', ')}, the same for every source speed (${moving.map(r => r.firstNonzero.join('/')).join('; ')}). Period ahead at x = 48: ${line(r => r.periodAhead, 2)} against the mesh ${line(r => PERIOD * (1 - r.v / c), 2)} on ${moving.map(r => r.crossingsAhead).join(', ')} rises (both models predict the same period ahead, so it is a check, not a test). The front reads about 1.5 percent under c at rest by this half-rise method, the dispersion of the square wave's short harmonics; the moving runs are judged against the rest run, not against c. The largest flux anywhere is ${metrics.largestFlux!.toFixed(3)} against q / 2 = ${q / 2}: a moving sheet leaves a static winding flux on the layers it crossed, which the cyclic flux holds. A light on a fixed mesh is source-independent by construction, so this is a consistency reading of the model's light and a falsification of the slow-photon rule as a model of it, not a test of what a moving observer reads. ${metrics.seconds!.toFixed(0)} s.`,
    })
  },
})
