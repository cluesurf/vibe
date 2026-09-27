// The slab lens at a FIXED RESOLUTION (E-GRV-0099): E-GRV-0093's lens run again with the spanned light's resolution
// held at the baseline D0 = 16 everywhere (windows 4 D0 and 2 D0, field modulus 4 D0) and only its divisors (the kick's
// q_P^2, the span's Q_l) reading the radion's own depth profile (code/rule/depth-span-light makeMetricSpanMedium). This
// is the minimal-coupling fix for E-FRC-0256's alpha problem (run for alpha in E-FRC-0257): does the light still bend
// by general relativity's 2 once the gauge structure no longer reads gravity?
//
// THE PREDICTION, derived before the run. The light's speed and index read only the divisors: on a uniform metric the
// shadow runs A~'' = -(n p / q_m^2) C^T C W A~, c = 2 / (q_m sqrt 3), index q_m / q0, an impedance-matched medium
// (E-GRV-0092 (1), (2)) whatever D0 is. Matter (the span lump) reads only the metric: rest rate q_m^(-1/2). So alpha =
// beta = 1/2 and f = 2, the closed value on this staircase 2.243, as E-GRV-0093. Sharper: the resolution is read only
// where a value crosses a window (an angle's wrap, a field's centering), and E-GRV-0093's lens and uniform runs made 0
// wraps at the smaller windows 4 D (D down to 11 on the slab); the fixed windows are wider on every column shallower
// than D0 and narrower on the deeper ones (D up to 21), where the packet (amplitude 12) sits far inside 64. So the
// fixed light's runs should equal E-GRV-0093's value for value (every detector trace, weight and invariant), and its
// factor be E-GRV-0093's 2.258 exactly. If that holds, the fix leaves the bending untouched by construction here, and
// what it changes is how matter reads the light (E-FRC-0257) and the gauge map's agreement with the windows.
//
// THE READINGS are E-GRV-0093's (code/measure/depth-span spanLensSurvey, re-run here for its controls): the slab, the
// plane packet at x = 40, arrivals at x = 60, 80, 100, 120 by the half-maximum centroid of A + r / Q, the delay between
// 60 and 120 (lens minus uniform) in 3,600 beats, the closed count with the lump's closed pull, the span lumps' fall,
// and the control waves (the old husk light, the clock-only wave, the metric wave).
//
// Gates, fixed before the run (no probe of this file):
//  L1 instrument: the fixed light's uniform and lens runs reverse bit for bit with 0 Gauss violations and 0 wraps; the
//     span lumps and the radion field reverse bit for bit.
//  L2 eikonal: the fixed light's delay within 2 percent of the eikonal (419.16 beats).
//  L3 the instrument tells 1 from 2 (E-GRV-0093's S3, a consistency re-read of its controls): the clock control's
//     closed-pull factor within 5 percent of its closed value and the metric control's within 5 percent of its own.
//  L4 THE DECIDING GATE: the fixed light's closed-pull factor within 10 percent of general relativity's closed value on
//     this staircase (2.243), and nearer the metric control's factor than the clock control's.
//  L5 the derivation's sharp form: the fixed light's uniform and lens runs equal E-GRV-0093's (the unfixed light's)
//     value for value on every detector's arrival and weight and every invariant reading.
// Verdict: partial if L1 or L3 fails; pass if L2, L4 and L5 hold; fail otherwise.
//
// FIRST RUN (tmp/fixed-lens-run1.log, 198 s, the record): pass, no gate moved. L1: both runs reversed, 0 Gauss, 0
// wraps; lumps and field reversed. L2: 422.031 beats against the eikonal 419.156. L3: the controls 1.091 (clock) and
// 2.338 (metric). L4: 2.2582 against 2.2428 closed (weak-field 2.0137). L5: every arrival (577.9211 .. 2784.6435),
// weight and invariant equal E-GRV-0093's. The slab's invariant drift is E-GRV-0092's 3.84 percent (the boundary radix
// choice, unchanged by the fix). Title written after the run.
//
// Depth L2: the light is the husk rule with a change made by hand on a stand-in medium, the lumps and control waves
// are stand-ins, the radion machinery added by hand (E-GRV-0079). This checks that the fixed-resolution integer rule
// realizes the metric its divisors give. DETERMINISM: every start and source is placed; nothing is drawn. NOTHING
// MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { energyDrift } from '@/code/measure/depth-span'
import { fixedLensSurvey, FIXED_RESOLUTION } from '@/code/measure/fixed-resolution'
import { LENS_DETECTORS } from '@/code/measure/radion'

export default experiment({
  id: 'gravity/fixed-resolution-lens',
  code: 'E-GRV-0099',
  title:
    "holding the spanned light's resolution fixed leaves its bending by general relativity's 2 unchanged, pass: with the angle windows and field modulus at D0 = 16 everywhere and only the divisors reading the radion's slab (depth 11 .. 21), the light is delayed 422.03 beats against its eikonal 419.16, a factor 2.258 of Newton's count with the lump's closed pull (closed 2.243, weak-field 2.014), beside the general-relativity control wave's 2.338 and the clock-only control's 1.091; its uniform and lens runs equal E-GRV-0093's value for value (every arrival, weight and invariant; 0 wraps, reversed, Gauss exact), because the rule reads the resolution only where a value crosses a window and none does here; the span lumps' fall is still not alike (factor 3.64 with their measured pull)",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = fixedLensSurvey(what => console.error(what))
    const b = s.base
    const { husk, clock, metric } = b.arena
    const closed = (r: typeof clock): number => r.measuredDelay / r.closedCountDelay
    const wraps = [s.uniform, s.lens].reduce((a, r) => a + r.wraps.angle + r.wraps.field + r.wraps.potential, 0)
    const l1 = s.uniform.reversed && s.lens.reversed && s.uniform.gauss === 0 && s.lens.gauss === 0 && wraps === 0 && b.fall.every(f => f.reversed) && b.arena.field.reversed
    const within = (x: number, want: number, tol: number): boolean => Math.abs(x / want - 1) <= tol
    const l2 = within(s.measuredDelay, b.eikonalDelay, 0.02)
    const l3 = within(closed(clock), clock.closedFactor, 0.05) && within(closed(metric), metric.closedFactor, 0.05)
    const l4 = within(s.factorClosedPull, metric.closedFactor, 0.1) && Math.abs(s.factorClosedPull - closed(metric)) < Math.abs(s.factorClosedPull - closed(clock))
    const l5 = s.sameAsUnfixed.uniform && s.sameAsUnfixed.lens
    const status = !l1 || !l3 ? 'partial' : l2 && l4 && l5 ? 'pass' : 'fail'
    const weak = (2 * s.factorClosedPull) / b.closedFactor
    const f = (x: number): string => x.toPrecision(6)
    const e = (x: number): string => x.toExponential(3)
    const metrics: Record<string, number> = {
      gate_L1: l1 ? 1 : 0,
      gate_L2: l2 ? 1 : 0,
      gate_L3: l3 ? 1 : 0,
      gate_L4: l4 ? 1 : 0,
      gate_L5: l5 ? 1 : 0,
      resolution: FIXED_RESOLUTION,
      fixedDelay: s.measuredDelay,
      unfixedDelay: b.measuredDelay,
      eikonal: b.eikonalDelay,
      closedCount: b.closedCountDelay,
      fixedFactorClosedPull: s.factorClosedPull,
      fixedFactorMeasuredPull: s.factor,
      unfixedFactorClosedPull: b.factorClosedPull,
      closedFactor: b.closedFactor,
      weakFactor: weak,
      oldHuskFactorClosedPull: closed(husk),
      clockFactorClosedPull: closed(clock),
      metricFactorClosedPull: closed(metric),
      lensDrift: energyDrift(s.lens.energy),
      uniformDrift: energyDrift(s.uniform.energy),
      wraps,
      sameUniform: s.sameAsUnfixed.uniform ? 1 : 0,
      sameLens: s.sameAsUnfixed.lens ? 1 : 0,
      seconds: s.seconds,
    }

    return verdict({
      status,
      claim: `with the resolution held at D0 = ${FIXED_RESOLUTION} and only the divisors reading the radion's depth, the spanned light is delayed ${f(s.measuredDelay)} beats between x = ${LENS_DETECTORS[0]} and ${LENS_DETECTORS[LENS_DETECTORS.length - 1]} against its eikonal ${f(b.eikonalDelay)}; against the Newtonian count with the lump's closed pull that is a factor ${f(s.factorClosedPull)} (closed ${f(b.closedFactor)}, weak-field reading ${f(weak)}), beside the unfixed light's ${f(b.factorClosedPull)}, the general-relativity control wave's ${f(closed(metric))} and the clock-only control's ${f(closed(clock))} (the old husk light ${f(closed(husk))}); the fixed runs equal the unfixed ones value for value: uniform ${s.sameAsUnfixed.uniform}, lens ${s.sameAsUnfixed.lens}; ${wraps} wraps; with the span lumps' measured pull (${f(b.pullScale)} of the ray law) the factor is ${f(s.factor)}`,
      metrics,
      control: { clockFactor: closed(clock), metricFactor: closed(metric), oldHuskFactor: closed(husk), unfixedFactor: b.factorClosedPull },
      notes: `L2. Gates L1 ${l1}, L2 ${l2}, L3 ${l3}, L4 ${l4}, L5 ${l5}. Fixed arrivals uniform ${s.uniform.arrival.map(x => x.toFixed(4)).join(' ')}, lens ${s.lens.arrival.map(x => x.toFixed(4)).join(' ')}; unfixed uniform ${b.uniform.arrival.map(x => x.toFixed(4)).join(' ')}, lens ${b.lens.arrival.map(x => x.toFixed(4)).join(' ')} at x = ${LENS_DETECTORS.join(', ')}. Shadow invariant drift: uniform ${e(energyDrift(s.uniform.energy))}, lens ${e(energyDrift(s.lens.energy))}. Runs ${s.uniform.seconds.toFixed(1)} s and ${s.lens.seconds.toFixed(1)} s; survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
