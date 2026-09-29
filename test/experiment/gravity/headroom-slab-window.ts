// E-GRV-0126 rerun on a window set in advance by the headroom light's own speed (E-GRV-0128).
//
// WHY THIS RERUN EXISTS. E-GRV-0126 (gravity/headroom-slab) put E-GRV-0093's radion slab under the headroom medium and
// failed only on D3, the bending (0.644). The cause was its instrument: it kept E-GRV-0093's 3,600-beat window, sized for
// a light at the full-room speed c0, but the headroom reference light runs at c0 k0 / C = c0 169 / 243, so the slab's
// packet reached the far detector (x = 120) at 3,593.7, in the window's last 7 beats, and its half-maximum centroid
// there was cut short. A post reading over the window scaled by C / k0 (5,177 beats) gave bending 2.0069, but that
// window was chosen after seeing the failure, so it could not count and E-GRV-0126's verdict stays fail. This file
// fixes the window BEFORE its one run, by a rule, and gates on that.
//
// THE WINDOW (code/measure/headroom-slab-window slabWindow), set by the light's own speed and not fitted:
//   window = ceil(3600 C / k0) + 64
// E-GRV-0093's 3,600 beats in the reference light's own time (C / k0 the ratio of c0 to c_ref), plus a margin of one
// energy reading (SLAB_EVERY 64) so the kept energy is read at least once past the scaled time. At C 243, k0 169 that is
// 5,177 + 64 = 5,241 beats. The rule reads C, k0 and E-GRV-0093's window, never an arrival. The -x half's earliest
// eikonal arrival at x = 120 round the ring is reported beside it (gating nothing), so a reader can check the window
// stays short of the wrap.
//
// EVERYTHING ELSE IS E-GRV-0126's (code/measure/headroom-slab headroomSlabSurvey, reused): C 243, D0 16, rooms
// k = round(C q_top / q), reference k0 at D0, the packet (amplitude 12, 16 half steps at x = 40), detectors 60, 80, 100,
// 120, energy read every 64 beats, matter's measured rest rate per room (rest term 3, amplitude 100000, 8192 beats), the
// eikonal delay sum (k0 / k - 1) / c_ref and the Newtonian counts. The survey's own 3,600-beat runs are its record and
// are not read here except for the control.
//
// GATES, E-GRV-0126's exactly, none moved; D1, D2 and D3 read on the new window's runs:
//  D1 the slab run's kept energy I drifts at most 1e-8 relative (largest |I_t / I_0 - 1| over every reading).
//  D2 the slab run and the reference run reverse bit for bit with 0 wraps (angle, field, potential) and 0 Gauss
//     violations.
//  D3 the bending, 2 (measured delay / eikonal) (closed count / measured-clock count), within 1 percent of 2.
//  K  control: E-GRV-0093's own medium on the same slab, packet, detectors and its own 3,600-beat window drifts 3.8
//     percent at two figures (0.0375 .. 0.0385).
// Verdict: partial if K fails; pass if D1, D2 and D3 hold; fail otherwise.
//
// GATED RUN (tmp/slab2-run1.log, the one run, 143 s; the log prints E-GRV-0127, the code this file held until another
// file claimed it first, renumbered after the run with nothing else changed): PASS, no gate moved. Window 5,241 beats; the -x half's eikonal
// wrap to x = 120 falls at 6,535.8 beats on the slab (7,232.3 on the reference), past the window.
//  - D1 holds: the kept energy drifts 2.86e-14 over 5,241 beats (the reference run 3.29e-14); the unweighted formula on
//    the same states drifts 5.39e-2.
//  - D2 holds: both runs reverse bit for bit, 0 wraps, 0 Gauss violations.
//  - D3 holds: the slab's packet reaches x = 120 at 4,006.4 of 5,241 (the reference at 3,299.3); delayed 607.8 beats
//    against the eikonal 605.4, factor 2.2512 with matter's measured clock (269.998 beats; closed 269.855, closed factor
//    2.2434), bending 2.00693.
//  - K holds: E-GRV-0093's own medium drifts 0.038393333871800106, its value to every digit.
// These are E-GRV-0126's post-reading numbers to every printed digit: the post window (5,177) and this one (5,241) both
// hold the far passage whole, so the 64 beats of margin change no arrival.
//
// Depth L2, as E-GRV-0126: the headroom rule is a change made by hand (E-GRV-0122), the slab machinery added by hand
// (E-GRV-0079), and the kept energy follows from the rule's linear form. A check of the rule on real depth steps, not a
// prediction of the model. DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value
// takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  energyDrift,
  SPAN_LENS_WINDOW,
} from '@/code/measure/depth-span'
import {
  headroomSlabSurvey,
  SLAB_BASE,
  SLAB_EVERY,
  type HeadroomRun,
} from '@/code/measure/headroom-slab'
import {
  headroomSlabWindow,
  SLAB_WINDOW_MARGIN,
} from '@/code/measure/headroom-slab-window'
import { LENS_DETECTORS } from '@/code/measure/radion'

const ENERGY_GATE = 1e-8
const BEND_TOLERANCE = 0.01
const CONTROL_LOW = 0.0375
const CONTROL_HIGH = 0.0385

const wrapsOf = (r: {
  wraps: { angle: number; field: number; potential: number }
}): number => r.wraps.angle + r.wraps.field + r.wraps.potential
const exact = (r: HeadroomRun): boolean =>
  r.reversed && r.gauss === 0 && wrapsOf(r) === 0

export default experiment({
  id: 'gravity/headroom-slab-window',
  code: 'E-GRV-0128',
  title:
    "on a window fixed in advance by the headroom light's own speed, E-GRV-0126's slab bends light by 2.0069, pass: ceil(3600 C / k0) + 64 = 5,241 beats (C 243, k0 169; the -x half wraps to the far detector only at 6,536), the slab's packet reaches x = 120 at 4,006, delayed 607.8 beats against the eikonal 605.4, bending 2.00693 with matter's measured clock (gate 2 within 1 percent); the kept energy drifts 2.9e-14 (gate 1e-8) against the control's 3.8393 percent, E-GRV-0093's own medium reproduced to every digit, the unweighted form 5.4 percent; both runs reverse bit for bit with 0 wraps and 0 Gauss violations; E-GRV-0126's gates unchanged",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = headroomSlabSurvey(what => console.error(what))
    const w = headroomSlabWindow(s, what => console.error(what))
    const n = LENS_DETECTORS.length - 1
    const kept = energyDrift(w.lens.energy)
    const keptFlat = energyDrift(w.uniform.energy)
    const unweighted = energyDrift(w.lens.unweighted)
    const controlDrift = energyDrift(s.control.energy)
    const closedFactor = s.eikonalDelay / s.closedCount
    const factor = w.measuredDelay / s.clockCount
    const bending = (2 * factor) / closedFactor
    const d1 = kept <= ENERGY_GATE
    const d2 = exact(w.lens) && exact(w.uniform)
    const d3 = Math.abs(bending / 2 - 1) <= BEND_TOLERANCE
    const k = controlDrift >= CONTROL_LOW && controlDrift < CONTROL_HIGH
    const status = !k ? 'partial' : d1 && d2 && d3 ? 'pass' : 'fail'
    const f = (x: number): string => x.toPrecision(6)
    const e = (x: number): string => x.toExponential(3)
    const restExact = s.rest.every(r => r.reversed)
    const metrics: Record<string, number> = {
      gate_D1: d1 ? 1 : 0,
      gate_D2: d2 ? 1 : 0,
      gate_D3: d3 ? 1 : 0,
      control_K: k ? 1 : 0,
      window: w.window,
      windowMargin: SLAB_WINDOW_MARGIN,
      windowBase: SPAN_LENS_WINDOW,
      wrapArrivalSlab: w.wrapSlab,
      wrapArrivalReference: w.wrapReference,
      keptDrift: kept,
      keptDriftFlat: keptFlat,
      unweightedDrift: unweighted,
      controlDrift,
      controlWraps: wrapsOf(s.control),
      controlReversed: s.control.reversed ? 1 : 0,
      slabWraps: wrapsOf(w.lens),
      slabGauss: w.lens.gauss,
      flatWraps: wrapsOf(w.uniform),
      flatGauss: w.uniform.gauss,
      farArrivalSlab: w.lens.arrival[n]!,
      farArrivalReference: w.uniform.arrival[n]!,
      measuredDelay: w.measuredDelay,
      eikonalDelay: s.eikonalDelay,
      closedCount: s.closedCount,
      clockCount: s.clockCount,
      closedFactor,
      factorMeasuredClock: factor,
      factorClosedClock: w.measuredDelay / s.closedCount,
      bending,
      restExact: restExact ? 1 : 0,
      steps: s.steps,
      pathSteps: s.pathSteps,
      roomLow: Math.min(...s.room),
      roomReference: s.reference,
      countTop: s.top,
      base: SLAB_BASE,
      every: SLAB_EVERY,
      seconds: s.seconds + w.seconds,
    }

    return verdict({
      status,
      claim: `on E-GRV-0093's slab placed as rooms (C = ${SLAB_BASE}, rooms ${Math.min(...s.room)} .. ${Math.max(...s.room)}, reference ${s.reference} at D0, ${s.pathSteps} room steps between the detectors), over the window fixed in advance by the light's own speed, ceil(${SPAN_LENS_WINDOW} C / k0) + ${SLAB_WINDOW_MARGIN} = ${w.window} beats (the -x half's eikonal wrap to x = ${LENS_DETECTORS[n]} at ${f(w.wrapSlab)} beats on the slab, ${f(w.wrapReference)} on the reference), the headroom light's kept energy drifts ${e(kept)} (gate ${ENERGY_GATE}), against the control's ${e(controlDrift)} on E-GRV-0093's own medium; the unweighted formula drifts ${e(unweighted)}; the slab and reference runs reverse ${w.lens.reversed && w.uniform.reversed} with ${wrapsOf(w.lens) + wrapsOf(w.uniform)} wraps and ${w.lens.gauss + w.uniform.gauss} Gauss violations; the far detector sees the slab's packet at ${f(w.lens.arrival[n]!)} of ${w.window}; the light is delayed ${f(w.measuredDelay)} beats against its eikonal ${f(s.eikonalDelay)}, a factor ${f(factor)} of the Newtonian count with matter's measured clock (${f(s.clockCount)} beats; closed ${f(s.closedCount)}, closed factor ${f(closedFactor)}), bending ${f(bending)} (gate 2 within ${BEND_TOLERANCE * 100} percent)`,
      metrics,
      control: {
        controlDrift,
        controlReversed: s.control.reversed ? 1 : 0,
      },
      notes: `L2. D1 ${d1}, D2 ${d2}, D3 ${d3}, K ${k}. Window ${w.window} = ceil(${SPAN_LENS_WINDOW} x ${SLAB_BASE} / ${s.reference}) + ${SLAB_WINDOW_MARGIN}, fixed before the run. Arrivals reference ${w.uniform.arrival.map(x => x.toFixed(2)).join(' ')}, slab ${w.lens.arrival.map(x => x.toFixed(2)).join(' ')}, control (3,600 beats) ${s.control.arrival.map(x => x.toFixed(2)).join(' ')} at x = ${LENS_DETECTORS.join(', ')} (${n} gaps). Kept energy I_0 ${w.lens.energy[0]!.toExponential(9)}, reference run's drift ${e(keptFlat)}. Control wraps ${wrapsOf(s.control)}, reversed ${s.control.reversed}, gauss ${s.control.gauss}. Interval rooms ${s.intervals.map(iv => iv.k).join(' ')}. Rest rates (room: measured / closed) ${s.rest.map(r => `${r.k}: ${r.rate.toExponential(6)} / ${r.closed.toExponential(6)}`).join('; ')}, reversed ${restExact}. Runs ${w.uniform.seconds.toFixed(1)} s, ${w.lens.seconds.toFixed(1)} s; survey ${s.seconds.toFixed(1)} s (its 3,600-beat runs feed only the control).`,
    })
  },
})
