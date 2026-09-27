// The spanned light through the radion's own depth (E-GRV-0093): E-GRV-0089's slab lens run again with the husk light
// changed so a link's stiffness reads the depth it spans (code/rule/depth-span-light, E-GRV-0092). E-GRV-0089 found
// the unchanged light delayed by Newton's count (1.060 with the closed pull), next to a clock-only control wave (1.091)
// and far from a general-relativity control wave (2.338, closed value 2.243). Does the changed light now read 2?
//
// THE PREDICTION (E-GRV-0092's header, derived before either run): the spanned light is an impedance-matched medium of
// index q / q0, so its eikonal delay is sum (s - 1) / c0 with s = q / q0 and c0 = 2 / (q0 sqrt 3); its matter (the
// span lump: the same change made to the stand-in's links, a rest term that reads no depth) keeps the clock's rest rate
// q^(-1/2) and falls by the clock alone, at its own wave speed, which is the light's. So alpha = beta = 1/2 and the
// factor is 2 in weak field; on this staircase (depth 17 .. 21 on the path, q / q0 up to 1.30) its closed value is
// sum (s - 1) / sum ln(s) / 2 = 2.243, the metric control's own closed value, because the index is the same q / q0.
//
// THE READINGS. As E-GRV-0089: the slab (a sheet of content 1 per dock at x = 90 on the 256 x 2 x 2 line, its sink 128
// away, count coupling b = a, the radion Hann-averaged, depth D0 + the half-level count), the plane packet (amplitude
// 12, 16 half steps) at x = 40, arrivals at x = 60, 80, 100, 120 by the half-maximum centroid of the exact link angle
// A + r / Q, the delay between 60 and 120, lens run minus uniform run, in a window of 3,600 beats (620 times
// c_old / c_new = sqrt 33, rounded up, so the packet's front clears x = 120 with its delay and the -x half does not
// come round). The count: the closed count sum (1/2) ln(s) / c0 over x = 60 .. 119 (THE PULL CORRECTED AS E-GRV-0089's
// POST READING DID: the lump's pull taken at its ray law, since the lumps fall short of it on this staircase for a
// reason in the lump, not the light, E-GRV-0088's post run), and beside it the count with the span lumps' measured
// pull (m = 3 and 12 at x = 154, 480 beats, as E-GRV-0088). The controls are E-GRV-0089's own runs, re-run: the old
// husk light, the clock-only wave and the metric wave, each against its closed-pull count.
//
// Gates, fixed before the gated run (no probe of this file; the rule's disclosed probe ran a uniform depth only):
//  S1 instrument: the spanned light's uniform and lens runs reverse bit for bit with 0 Gauss violations and 0 wraps;
//     the span lumps and the radion field reverse bit for bit.
//  S2 eikonal: the spanned light's delay within 2 percent of its eikonal.
//  S3 the instrument tells 1 from 2 (closed pull): the clock control's factor within 5 percent of its closed value and
//     the metric control's within 5 percent of its own. THIS RE-READS E-GRV-0089's CONTROL RUNS, whose closed-pull
//     factors (1.091, 2.338 against 1.058, 2.243) were printed before this file was written: it is a consistency
//     gate on the instrument, not new evidence.
//  S4 THE DECIDING GATE: the spanned light's closed-pull factor within 10 percent of general relativity's closed
//     value on this staircase (2.243), and nearer the metric control's factor than the clock control's.
// Verdict: partial if S1 or S3 fails; pass if S2 and S4 hold; fail otherwise.
// Reported: the factor with the span lumps' measured pull, the weak-field reading (the factor over the closed value,
// times 2), the old light's factor beside it, every arrival, the slab's shadow-invariant drift.
//
// FIRST RUN (tmp/span-lens-run1.log, 118 s, the record): pass, no gate moved. S1 holds (both runs reversed, 0 Gauss,
// 0 wraps; lumps and field reversed). S2: delayed 422.03 beats against the eikonal 419.16 (0.7 percent over). S3: the
// controls read 1.091 (clock, closed 1.058) and 2.338 (metric, closed 2.243), as E-GRV-0089's post reading. S4: the
// spanned light's closed-pull factor is 2.258 against general relativity's closed 2.243 on this staircase (weak-field
// reading 2.014), next to the metric control's 2.338, where the unchanged light, re-run beside it, reads 1.060.
// AN HONEST NEGATIVE ON THE MATTER SIDE, gated by nothing: the span lumps fall toward depth but at only 0.855 (m = 3)
// and 0.384 (m = 12) of their ray law over 480 beats, NOT ALIKE (a factor 2.2 apart, where E-GRV-0088's clock lumps
// were 4.5 percent apart), so the factor with their measured pull is 3.64, not 2. The span lump's waves run sqrt(33)
// slower than the clock lump's, so 480 beats is a far shorter reach in its own units while its rest rate is the same;
// why the heavier lump falls less than half its ray law is not established here. The light's side of the 2 is
// shown; a universal fall of the matter this light implies is not. Title written after the run.
//
// Depth L2: the light is the husk rule with a change made by hand on a stand-in medium, the lump and the control waves
// are stand-ins given by hand, and the radion is machinery added by hand (E-GRV-0079). What this can show is that the
// integer rule, on the model's own depth field, realizes the metric the change was built to give, boundary carries
// and all: a factor near 2 here is a consistency result, not a prediction the model made. DETERMINISM: every start
// and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { energyDrift, spanLensSurvey, SPAN_LENS_WINDOW } from '@/code/measure/depth-span'
import { LENS_DETECTORS } from '@/code/measure/radion'

export default experiment({
  id: 'gravity/depth-span-lens',
  code: 'E-GRV-0093',
  title:
    "the spanned husk light bends by general relativity's 2 through the radion's own slab, pass on the light, with the matter's fall not alike: delayed 422.0 beats against its eikonal 419.2, it reads 2.258 of Newton's count with the lump's closed pull (closed value 2.243 on this staircase, weak-field reading 2.014), beside the general-relativity control wave's 2.338 and far from the clock-only control's 1.091 and the unchanged light's 1.060; but the lumps that carry the same change fall at only 0.855 and 0.384 of their ray law, a factor 2.2 apart, so with their measured pull the factor is 3.64, and the universal fall this light needs is not shown",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = spanLensSurvey(what => console.error(what))
    const { husk, clock, metric } = s.arena
    const closed = (r: typeof clock): number => r.measuredDelay / r.closedCountDelay
    const wraps = [s.uniform, s.lens].reduce((a, r) => a + r.wraps.angle + r.wraps.field + r.wraps.potential, 0)
    const instrument = s.uniform.reversed && s.lens.reversed && s.uniform.gauss === 0 && s.lens.gauss === 0 && wraps === 0 && s.fall.every(f => f.reversed) && s.arena.field.reversed
    const within = (x: number, want: number, tol: number): boolean => Math.abs(x / want - 1) <= tol
    const s2 = within(s.measuredDelay, s.eikonalDelay, 0.02)
    const s3 = within(closed(clock), clock.closedFactor, 0.05) && within(closed(metric), metric.closedFactor, 0.05)
    const s4 = within(s.factorClosedPull, metric.closedFactor, 0.1) && Math.abs(s.factorClosedPull - closed(metric)) < Math.abs(s.factorClosedPull - closed(clock))
    const status = !instrument || !s3 ? 'partial' : s2 && s4 ? 'pass' : 'fail'
    const weak = (2 * s.factorClosedPull) / s.closedFactor
    const f = (x: number): string => x.toPrecision(6)
    const e = (x: number): string => x.toExponential(3)
    const metrics: Record<string, number> = {
      gate_S2: s2 ? 1 : 0,
      gate_S3: s3 ? 1 : 0,
      gate_S4: s4 ? 1 : 0,
      instrument: instrument ? 1 : 0,
      spanDelay: s.measuredDelay,
      spanEikonal: s.eikonalDelay,
      spanClosedCount: s.closedCountDelay,
      spanFactorClosedPull: s.factorClosedPull,
      spanFactorMeasuredPull: s.factor,
      spanPullScale: s.pullScale,
      spanClosedFactor: s.closedFactor,
      spanWeakFactor: weak,
      oldHuskFactorClosedPull: closed(husk),
      clockFactorClosedPull: closed(clock),
      clockClosedFactor: clock.closedFactor,
      metricFactorClosedPull: closed(metric),
      metricClosedFactor: metric.closedFactor,
      lensDrift: energyDrift(s.lens.energy),
      uniformDrift: energyDrift(s.uniform.energy),
      wraps,
      window: SPAN_LENS_WINDOW,
      seconds: s.seconds,
    }

    s.fall.forEach(x => {
      metrics[`fall_span_m${x.m}`] = x.g
      metrics[`fallPredicted_span_m${x.m}`] = x.gPredicted
    })

    return verdict({
      status,
      claim: `through the radion's own slab the spanned light is delayed ${f(s.measuredDelay)} beats between x = ${LENS_DETECTORS[0]} and ${LENS_DETECTORS[LENS_DETECTORS.length - 1]} against its eikonal ${f(s.eikonalDelay)}; against the Newtonian count with the lump's closed pull (${f(s.closedCountDelay)} beats) that is a factor ${f(s.factorClosedPull)} (closed ${f(s.closedFactor)}, weak-field reading ${f(weak)}), next to the general-relativity control wave's ${f(closed(metric))} (closed ${f(metric.closedFactor)}) and far from the clock-only control's ${f(closed(clock))} (closed ${f(clock.closedFactor)}) and the unchanged husk light's ${f(closed(husk))}; with the span lumps' measured pull (${f(s.pullScale)} of the ray law) the factor is ${f(s.factor)}`,
      metrics,
      control: { clockFactor: closed(clock), metricFactor: closed(metric), oldHuskFactor: closed(husk) },
      notes: `L2. Gates S2 ${s2}, S3 ${s3}, S4 ${s4}; instrument ${instrument}. Spanned arrivals uniform ${s.uniform.arrival.map(x => x.toFixed(2)).join(' ')}, lens ${s.lens.arrival.map(x => x.toFixed(2)).join(' ')} at x = ${LENS_DETECTORS.join(', ')}. Span falls (measured, predicted): ${s.fall.map(x => `m ${x.m} ${e(x.g)} ${e(x.gPredicted)}`).join('; ')}. Shadow invariant drift: uniform ${e(energyDrift(s.uniform.energy))}, lens ${e(energyDrift(s.lens.energy))}. Old husk light delay ${f(husk.measuredDelay)}, clock wave ${f(clock.measuredDelay)}, metric wave ${f(metric.measuredDelay)} (old c0 units). Runs ${s.uniform.seconds.toFixed(1)} s and ${s.lens.seconds.toFixed(1)} s; survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
