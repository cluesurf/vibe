// E-GRV-0093's slab under the headroom medium (E-GRV-0126). E-GRV-0093's spanned light kept its shadow invariant to
// 3e-10 on a uniform depth and drifted 3.8 percent on the radion's slab, because a link's remainder is read in its
// triangle's radix and at a depth step two triangles disagree (exact would need a counter of modulus
// lcm(q_P, Q_l, Q_l') q_P). E-GRV-0122's headroom light (code/rule/depth-span-light makeHeadroomSpanMedium) carries every
// link's remainder in ONE fixed radix R = q0 C, with the rate k / C as a multiplier, so no step asks a radix question.
// Does the same slab, placed as rooms, keep its energy?
//
// THE ENERGY GATED (code/measure/headroom-slab headroomEnergy, derived in its header before any run): the headroom rule's
// shadow runs the leapfrog a'' = -K C^T G C W a (K = diag(k_l), G = diag(n_P p k_P / M)), self-adjoint in W K^(-1), and
// its kept energy is
//   I = sum_l w_l k_l e~_l^2 + sum_P (n_P p k_P / M) b_P(a~_(t+1)) b_P(a~_(t+2)),    b = C W a~
// the electromagnetic energy of a medium of permittivity C / k_l and permeability C / k_P. It is the energy E-GRV-0122's
// rule conserves; E-GRV-0122 did not read it (its gates were the redshift, the trap and the weak field), so this is the
// first reading. Beside it, spanEnergy's formula on the same states (every rate weight left out) is reported, to show
// the kept energy is not any quadratic form that happens to hold.
//
// THE SLAB. E-GRV-0093's exactly: the radion's field on the 256 x 2 x 2 line (the sheet at x = 90, content 1 per dock),
// depth D = D0 + the half-level count, the plane packet (amplitude 12, 16 half steps) at x = 40, detectors 60, 80, 100,
// 120, window 3,600 beats, energy read every 64 beats. E-GRV-0093's light ran at index q / q0 per dock; the headroom
// light runs at C / k with k <= C, and the sink side of the field is shallower than D0, so full room goes to the ring's
// least count q_top: k = round(C q_top / q), C = 243 (E-GRV-0122's register), and the reference room at D0 is
// k0 = round(C q_top / q0), where E-GRV-0093's uniform run sat. Each depth step is a boundary between two regions of
// different room. (The first launch placed k = round(C q0 / q) and was refused at construction, a room of 277 > C on the
// sink side; nothing was read.) The resolution is D0 = 16 everywhere. A link or triangle reads the smaller room of its
// docks, so the interval [x, x + 1] runs at min(k_x, k_x+1); with c_ref = c0 k0 / C the eikonal delay is
// sum (k0 / k - 1) / c_ref over the 60 intervals from x = 60 to 120, and the Newtonian count uses matter's clock at each
// interval's room, sqrt(k / k0) closed, and MEASURED by E-GRV-0122's room matter (rest term 3, amplitude 100000, 8192
// beats) at every room the path holds and at k0. The delay is the slab run's detector span less the reference run's (the
// same line at room k0 everywhere).
//
// GATES, fixed before the gated run (the one probe, tmp/slab-probe1.log, ran the energy formula on a 64-dock line with
// one room step 243 | 162 and 243 | 81 over 1,024 beats, not this slab: the kept energy held to 2e-14, the unweighted
// formula drifted 0.27 and 0.97; it compared nothing to a gate):
//  D1 the slab run's kept energy I drifts at most 1e-8 relative (the largest |I_t / I_0 - 1| over every reading) over
//     E-GRV-0093's run length, 3,600 beats, against E-GRV-0093's 3.8 percent.
//  D2 the slab run and the reference run reverse bit for bit with 0 wraps (angle, field, potential) and 0 Gauss
//     violations.
//  D3 the bending: 2 (measured delay / eikonal) (closed count / measured-clock count), the light's index exponent over
//     matter's measured rest exponent on this staircase, within 1 percent of 2, the value E-GRV-0122's headroom rule
//     gives (its bending 1.9985).
//  K  control: E-GRV-0093's own medium (makeSpanMedium on the same slab, same packet, detectors and window) run here
//     reproduces its drift, 3.8 percent at two figures (0.0375 .. 0.0385).
// Verdict: partial if K fails (the instrument does not reproduce the problem); pass if D1, D2 and D3 hold; fail
// otherwise.
//
// GATED RUN (tmp/slab-run2.log, the record, 91 s): FAIL on D3, no gate moved. q_top 23, k0 169, rooms 130 .. 243, 20
// room steps on the ring, 4 between the detectors (143 | 136 | 130 | 136 | 143).
//  - D1 holds: the kept energy drifts 2.86e-14 over 3,600 beats (the reference run 2.75e-14), against the control's
//    3.839e-2. spanEnergy's unweighted formula on the same slab states drifts 5.39e-2, so the kept energy is not a
//    quadratic form that holds for free.
//  - D2 holds: both runs reverse bit for bit, 0 wraps, 0 Gauss violations.
//  - K holds: E-GRV-0093's own medium, run here, drifts 0.038393333871800106, E-GRV-0093's value to every digit.
//  - D3 FAILS, and the failure is this file's instrument, not the light: delayed 195.1 beats against the eikonal 605.4,
//    bending 0.644. The window was E-GRV-0093's 3,600 beats, sized for a light at c0, but the reference here runs at
//    c0 k0 / C = 0.695 c0: the slab's packet reached x = 120 at 3,593.7, inside the window's last 7 beats, so its
//    half-maximum centroid there was cut short. The rest rates match their closed values to 4e-7, so the clock count
//    (270.0 beats) equals the closed one (269.9).
// POST READING (written after the gated run; gating nothing, the verdict stays the gated run's): headroomSlabPost runs the
// reference and the slab over the window scaled by C / k0 (5,177 beats), the same distance in the reference light's
// own time (tmp/slab-run3.log). The slab's packet now reaches x = 120 at 4,006.4 (the reference's arrivals unchanged),
// the delay is 607.8 beats against the eikonal 605.4 (0.4 percent over, where E-GRV-0093's was 0.7), the factor with
// matter's measured clock 2.251 (closed 2.243), bending 2.0069, within D3's 1 percent; the kept energy still drifts
// 2.9e-14 and both runs are exact. D3 would pass on a window fitted to this light, but that window was chosen after
// seeing the failure, so the verdict stays fail.
//
// Depth L2: the headroom rule is a change made by hand (E-GRV-0122), the radion slab machinery added by hand
// (E-GRV-0079), and the kept energy follows from the rule's linear form by construction. What this shows is that the
// integer rule realizes that form across real depth steps, where E-GRV-0093's did not: a check of the rule, not a
// prediction of the model. DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES: each value
// takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  energyDrift,
  SPAN_LENS_WINDOW,
} from '@/code/measure/depth-span'
import {
  headroomSlabPost,
  headroomSlabSurvey,
  SLAB_BASE,
  SLAB_EVERY,
  type HeadroomRun,
} from '@/code/measure/headroom-slab'
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
  id: 'gravity/headroom-slab',
  code: 'E-GRV-0126',
  title:
    "the headroom light keeps its energy across E-GRV-0093's depth steps, but the gated bending read a cut window, fail on D3: on the radion's slab placed as rooms (C 243, reference 169 at D0, rooms 130 .. 143 on the path, 4 steps between the detectors) the kept energy of the rate-weighted leapfrog drifts 2.9e-14 over 3,600 beats against the control's 3.8393 percent (E-GRV-0093's own medium, reproduced to every digit), the unweighted form drifts 5.4 percent, both runs reverse bit for bit with 0 wraps; the bending read 0.644 because the slower reference light reached the far detector in the window's last 7 beats; a post reading over the scaled window, gating nothing, gives delay 607.8 against the eikonal 605.4 and bending 2.0069",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = headroomSlabSurvey(what => console.error(what))
    const n = LENS_DETECTORS.length - 1
    const kept = energyDrift(s.lens.energy)
    const keptFlat = energyDrift(s.uniform.energy)
    const unweighted = energyDrift(s.lens.unweighted)
    const controlDrift = energyDrift(s.control.energy)
    const closedFactor = s.eikonalDelay / s.closedCount
    const factor = s.measuredDelay / s.clockCount
    const bending = (2 * factor) / closedFactor
    const d1 = kept <= ENERGY_GATE
    const d2 = exact(s.lens) && exact(s.uniform)
    const d3 = Math.abs(bending / 2 - 1) <= BEND_TOLERANCE
    const k = controlDrift >= CONTROL_LOW && controlDrift < CONTROL_HIGH
    const status = !k ? 'partial' : d1 && d2 && d3 ? 'pass' : 'fail'
    const f = (x: number): string => x.toPrecision(6)
    const e = (x: number): string => x.toExponential(3)
    const restExact = s.rest.every(r => r.reversed)
    // the post reading (gating nothing): the delay over the window scaled by C / k0
    const post = headroomSlabPost(s, what => console.error(what))
    const postFactor = post.measuredDelay / s.clockCount
    const postBending = (2 * postFactor) / closedFactor
    const postKept = energyDrift(post.lens.energy)
    const metrics: Record<string, number> = {
      gate_D1: d1 ? 1 : 0,
      gate_D2: d2 ? 1 : 0,
      gate_D3: d3 ? 1 : 0,
      control_K: k ? 1 : 0,
      keptDrift: kept,
      keptDriftFlat: keptFlat,
      unweightedDrift: unweighted,
      controlDrift,
      controlWraps: wrapsOf(s.control),
      controlReversed: s.control.reversed ? 1 : 0,
      slabWraps: wrapsOf(s.lens),
      slabGauss: s.lens.gauss,
      flatWraps: wrapsOf(s.uniform),
      flatGauss: s.uniform.gauss,
      measuredDelay: s.measuredDelay,
      eikonalDelay: s.eikonalDelay,
      closedCount: s.closedCount,
      clockCount: s.clockCount,
      closedFactor,
      factorMeasuredClock: factor,
      factorClosedClock: s.measuredDelay / s.closedCount,
      bending,
      restExact: restExact ? 1 : 0,
      postWindow: post.window,
      postDelay: post.measuredDelay,
      postFactorMeasuredClock: postFactor,
      postBending,
      postKeptDrift: postKept,
      postKeptDriftFlat: energyDrift(post.uniform.energy),
      postExact: exact(post.lens) && exact(post.uniform) ? 1 : 0,
      steps: s.steps,
      pathSteps: s.pathSteps,
      roomLow: Math.min(...s.room),
      roomReference: s.reference,
      countTop: s.top,
      base: SLAB_BASE,
      window: SPAN_LENS_WINDOW,
      every: SLAB_EVERY,
      seconds: s.seconds,
    }

    return verdict({
      status,
      claim: `on E-GRV-0093's slab placed as rooms (C = ${SLAB_BASE}, rooms ${Math.min(...s.room)} .. ${Math.max(...s.room)}, reference ${s.reference} at D0, ${s.steps} room steps on the ring, ${s.pathSteps} between the detectors), the headroom light's kept energy drifts ${e(kept)} over ${SPAN_LENS_WINDOW} beats (gate ${ENERGY_GATE}), against the control's ${e(controlDrift)} on E-GRV-0093's own medium; spanEnergy's unweighted formula on the same states drifts ${e(unweighted)}; the slab and reference runs reverse ${s.lens.reversed && s.uniform.reversed} with ${wrapsOf(s.lens) + wrapsOf(s.uniform)} wraps and ${s.lens.gauss + s.uniform.gauss} Gauss violations; the light is delayed ${f(s.measuredDelay)} beats against its eikonal ${f(s.eikonalDelay)}, a factor ${f(factor)} of the Newtonian count with matter's measured clock (${f(s.clockCount)} beats; closed ${f(s.closedCount)}, closed factor ${f(closedFactor)}), bending ${f(bending)} (gate 2 within ${BEND_TOLERANCE * 100} percent), read on a window that cut the far detector's passage short; POST reading over ${post.window} beats (gating nothing): delayed ${f(post.measuredDelay)}, factor ${f(postFactor)}, bending ${f(postBending)}, kept energy drift ${e(postKept)}`,
      metrics,
      control: {
        controlDrift,
        controlReversed: s.control.reversed ? 1 : 0,
      },
      notes: `L2. D1 ${d1}, D2 ${d2}, D3 ${d3}, K ${k}. Arrivals reference ${s.uniform.arrival.map(x => x.toFixed(2)).join(' ')}, slab ${s.lens.arrival.map(x => x.toFixed(2)).join(' ')}, control ${s.control.arrival.map(x => x.toFixed(2)).join(' ')} at x = ${LENS_DETECTORS.join(', ')} (${n} gaps). Kept energy I_0 ${s.lens.energy[0]!.toExponential(9)}, reference run's drift ${e(keptFlat)}. Control wraps ${wrapsOf(s.control)}, reversed ${s.control.reversed}, gauss ${s.control.gauss}. Interval rooms ${s.intervals.map(iv => iv.k).join(' ')}. Rest rates (room: measured / closed) ${s.rest.map(r => `${r.k}: ${r.rate.toExponential(6)} / ${r.closed.toExponential(6)}`).join('; ')}, reversed ${restExact}. Post arrivals reference ${post.uniform.arrival.map(x => x.toFixed(2)).join(' ')}, slab ${post.lens.arrival.map(x => x.toFixed(2)).join(' ')}; post exact ${exact(post.lens) && exact(post.uniform)}, post ${post.seconds.toFixed(1)} s. Runs ${s.uniform.seconds.toFixed(1)} s, ${s.lens.seconds.toFixed(1)} s, control ${s.control.seconds.toFixed(1)} s; survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
