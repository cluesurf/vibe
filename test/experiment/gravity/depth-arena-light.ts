// The depth arena, measured (E-GRV-0089): the husk light run through the radion's own depth field, its delay read
// against the eikonal and against the Newtonian count built from a slow lump's MEASURED fall in the same field. This is
// the deciding experiment of note/project/vibe/roadmap/research/discrete-gravity.md Part 5b option 1: it passes if light is
// delayed by 2 times the count (general relativity) and fails at 1 (a clock-only arena) or 0 (Nordstrom).
//
// THE PREDICTION (E-GRV-0088's header, derived before either run): depth enters the husk light only through its
// inertia q = 2D + 1, so the light's index sqrt(q / q0) is ALL clock and no step (alpha = 1/2, beta = 0), and a lump
// whose update divides by the same count falls with the clock's pull: the factor is 1, whatever the coupling. General
// relativity's 2 needs the depth to set the step as well (the metric form of code/rule/depth-clock-wave).
//
// THE GEOMETRY: A SLAB, not a point lens. A point lump's depth is the half-level count of (b / a) M / (24 pi r), which
// reaches half a level only inside r = M / (12 pi): 0.74 docks for E-GRV-0080's M = 28, and 18 docks (the Fresnel scale
// sqrt(16 x 20) = 17.9 of E-GRV-0075's 16-dock packet read 20 docks behind its lens) would need M = 679 in one dock.
// So the deep region of any lump this box holds is under one column, far inside one Fresnel zone: no ray regime. A
// plane wave through a planar lens is one-dimensional and has no Fresnel scale, so the lens is E-GRV-0080's C3 slab
// (code/measure/depth-arena, header): a sheet of content 1 per dock at x = 90, its sink 128 away, on the 256 x 2 x 2
// line, with the count coupling b = a. The reading is the delay between x = 60 and 120, lens run minus uniform run.
//
// THE COUNT. The lump (the clock form, m = 3 and 12, as E-GRV-0088's P2, at x = 154) falls at g; the count's potential
// is ln N = -(1/2) ln(q / q0) scaled by the measured over the predicted fall, and the count's delay is the sum over
// x = 60 .. 119 of (n_N - 1) / c0 with n_N - 1 = -ln N (first order in the potential, as E-GRV-0080's). The factor is
// the light's measured delay over the count's. On this staircase (depth 17 .. 21 on the path, q / q0 up to 1.30) the
// factors are not the weak-field 1 and 2 exactly: the closed values, eikonal over closed count, are printed and gated.
//
// THE CONTROLS, which make a reading of 1 mean something: the same field, the same count machinery, and two light
// waves whose answer is known, each the massless (m = 0) wave of a form of code/rule/depth-clock-wave, placed as a
// 16-dock bump at rest at x = 40 and read by the half-maximum centroid of its energy density at x = 60 and 120:
//   clock   inertia q, stiffness fixed: the husk light's own depth law (index sqrt(q / q0)), against the clock lump
//   metric  the scalar wave of ds^2 = -(q0 / q) dt^2 + (q / q0) dx^2 (index q / q0, time and space parts equal),
//           against the metric form's own lump (m = 3, 12): general relativity's structure, which must read 2
//
// Gates, fixed before the gated run (the disclosed probe tmp/arena-probe.ts ran the lump on a uniform depth only):
//  L1 instrument: the radion field, both husk light runs, the four wave runs and every lump run reverse bit for bit;
//     the husk runs keep 0 Gauss violations and make no wrap.
//  L2 eikonal: the husk light's delay within 2 percent of its eikonal sum of 1 / c(D) - 1 / c0; each control wave's
//     delay within 5 percent of its own eikonal (sqrt(q / q0) - 1 and q / q0 - 1, over c0).
//  L3 the instrument tells 1 from 2: the clock control's factor within 5 percent of its closed value and the metric
//     control's within 5 percent of its own (their ratio is about 2).
//  L4 THE DECIDING GATE: the husk light's factor within 10 percent of the metric control's closed value (general
//     relativity's 2 on this staircase).
// Verdict: partial if L1 or L3 fails (the instrument cannot tell the two); pass if L2 and L4 hold; fail otherwise.
// Reported: the husk light's factor against the clock-only closed value (the prediction), the weak-field 1 and 2, the
// lumps' measured over predicted falls, every arrival.
//
// FIRST RUN (tmp/grv89-run1.log, 15 s, the record): partial on L3, fail on L4, no gate moved. L1 holds (everything
// reversed, 0 Gauss, 0 wraps); L2 holds: the husk light is delayed 34.474 beats against its eikonal 34.431 (it
// reproduces E-GRV-0080's C3 to every printed digit, the same field at b = a), the clock wave 35.50 against 34.43, the
// metric wave 76.06 against 72.97. L3 FAILS ON THE COUNT, NOT ON THE LIGHT: the lumps fall at 0.889 (clock) and 0.851
// (metric) of their predicted pull, the undershoot E-GRV-0088 found, and dividing by it inflates every factor by 1.12
// to 1.17: clock control 1.227 against closed 1.058, metric control 2.746 against 2.243. L4: the husk light reads
// 1.192 against general relativity's 2.243 on this staircase. The two controls still differ by a factor 2.24, and the
// husk light sits with the clock control (1.192 against 1.227), not the metric one. With the CLOSED pull in the count
// (32.53 beats, a post-run reading of printed numbers, read by no gate) the husk light's factor is 1.060 against the
// clock-only 1.058, the clock wave 1.091, the metric wave 2.338 against 2.243. Either way the light bends by Newton's
// count, and the 2 is not there. Title written after the run.
//
// Depth L2: the light is the model's husk rule with the radion's depth; the lump and the two control waves are
// stand-ins given by hand; the radion itself is machinery added by hand (E-GRV-0079). DETERMINISM: every start and
// source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lightSurvey } from '@/code/measure/depth-arena'
import { LENS_DETECTORS, RADION_DEPTH } from '@/code/measure/radion'

const FRESNEL = Math.sqrt(16 * 20)
const LUMP_28 = 28

export default experiment({
  id: 'gravity/depth-arena-light',
  code: 'E-GRV-0089',
  title:
    "the husk light through the radion's own depth bends by Newton's count, not general relativity's 2, partial on L3 (the lump's measured pull, not the light) and fail on L4: through the slab at count coupling b = a the light is delayed 34.474 beats against its eikonal 34.431, and against a slow lump's measured fall in the same field that is 1.19 of Newton's count, next to the clock-only control's 1.23 and far from the equal-time-and-space control's 2.75 (closed values 1.058 and 2.243 on this staircase; with the closed pull the light reads 1.060); the control fails its own 5 percent gate because the lumps fall at only 0.89 and 0.85 of the ray law, but the two controls still differ by a factor 2.24; a point lens was out of reach, since a lump of 28 deepens under one column against a Fresnel scale of 17.9 docks",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = lightSurvey(what => console.error(what))
    const { husk, clock, metric } = s
    const wraps =
      s.huskU0.wraps.angle +
      s.huskU0.wraps.field +
      s.huskU0.wraps.potential +
      s.huskLens.wraps.angle +
      s.huskLens.wraps.field +
      s.huskLens.wraps.potential
    const falls = [...husk.fall, ...metric.fall]
    const instrument =
      s.field.reversed &&
      husk.reversed &&
      clock.reversed &&
      metric.reversed &&
      wraps === 0 &&
      falls.every(f => f.reversed)
    const within = (x: number, want: number, tol: number): boolean =>
      Math.abs(x / want - 1) <= tol

    const l2 =
      within(husk.measuredDelay, husk.eikonalDelay, 0.02) &&
      within(clock.measuredDelay, clock.eikonalDelay, 0.05) &&
      within(metric.measuredDelay, metric.eikonalDelay, 0.05)
    const l3 =
      within(clock.factor, clock.closedFactor, 0.05) &&
      within(metric.factor, metric.closedFactor, 0.05)
    const l4 = within(husk.factor, metric.closedFactor, 0.1)
    const status =
      !instrument || !l3 ? 'partial' : l2 && l4 ? 'pass' : 'fail'
    // the weak-field reading: the factor over the clock-only closed value is how far the light is from 1 in units of
    // this staircase's nonlinearity; times the clock form's weak value 1
    const weak = husk.factor / husk.closedFactor
    const f = (x: number): string => x.toPrecision(6)
    const e = (x: number): string => x.toExponential(3)
    const metrics: Record<string, number> = {
      gate_L2: l2 ? 1 : 0,
      gate_L3: l3 ? 1 : 0,
      gate_L4: l4 ? 1 : 0,
      instrument: instrument ? 1 : 0,
      depth: RADION_DEPTH,
      huskDelay: husk.measuredDelay,
      huskEikonal: husk.eikonalDelay,
      huskCount: husk.countDelay,
      huskFactor: husk.factor,
      huskClosedFactor: husk.closedFactor,
      huskWeakFactor: weak,
      clockDelay: clock.measuredDelay,
      clockEikonal: clock.eikonalDelay,
      clockFactor: clock.factor,
      clockClosedFactor: clock.closedFactor,
      metricDelay: metric.measuredDelay,
      metricEikonal: metric.eikonalDelay,
      metricCount: metric.countDelay,
      metricFactor: metric.factor,
      metricClosedFactor: metric.closedFactor,
      closedCount: husk.closedCountDelay,
      clockPullScale: husk.pullScale,
      metricPullScale: metric.pullScale,
      wraps,
      fresnel: FRESNEL,
      pointLensDeepRadius: LUMP_28 / (12 * Math.PI),
      pointLensContentForFresnel: 12 * Math.PI * FRESNEL,
      seconds: s.seconds,
    }

    falls.forEach(x => {
      metrics[`fall_${x.form}_m${x.m}`] = x.g
      metrics[`fallPredicted_${x.form}_m${x.m}`] = x.gPredicted
    })

    return verdict({
      status,
      claim: `through the radion's own slab (depth ${Math.min(...s.field.depth)} .. ${Math.max(...s.field.depth)}, count coupling b = a) the husk light is delayed ${f(husk.measuredDelay)} beats between x = ${LENS_DETECTORS[0]} and ${LENS_DETECTORS[LENS_DETECTORS.length - 1]} against its eikonal ${f(husk.eikonalDelay)}; a slow lump in the same field falls at ${f(husk.pullScale)} of its predicted clock pull, so the Newtonian count is ${f(husk.countDelay)} beats and the light's factor is ${f(husk.factor)}, against ${f(husk.closedFactor)} for a clock-only arena (1 in weak field) and ${f(metric.closedFactor)} for equal time and space parts (2 in weak field); the controls read ${f(clock.factor)} (clock form, closed ${f(clock.closedFactor)}) and ${f(metric.factor)} (metric form, closed ${f(metric.closedFactor)})`,
      metrics,
      control: {
        clockFactor: clock.factor,
        metricFactor: metric.factor,
      },
      notes: `L2. Gates L2 ${l2}, L3 ${l3}, L4 ${l4}; instrument ${instrument}. Husk arrivals uniform ${husk.uniformArrivals.map(x => x.toFixed(2)).join(' ')}, lens ${husk.arrivals.map(x => x.toFixed(2)).join(' ')}; clock wave uniform ${clock.uniformArrivals.map(x => x.toFixed(2)).join(' ')}, lens ${clock.arrivals.map(x => x.toFixed(2)).join(' ')}; metric wave uniform ${metric.uniformArrivals.map(x => x.toFixed(2)).join(' ')}, lens ${metric.arrivals.map(x => x.toFixed(2)).join(' ')} at x = ${LENS_DETECTORS.join(', ')}. Falls (measured, predicted): ${falls.map(x => `${x.form} m ${x.m} ${e(x.g)} ${e(x.gPredicted)}`).join('; ')}. Depth along x (every 8): ${s.field.depth.filter((_, i) => i % 8 === 0).join(' ')}. A point lump of M = ${LUMP_28} is deeper than half a level only inside r = ${f(LUMP_28 / (12 * Math.PI))}; the Fresnel scale is ${f(FRESNEL)}. Survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
