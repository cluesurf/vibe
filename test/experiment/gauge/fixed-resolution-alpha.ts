// Alpha at a FIXED RESOLUTION (E-FRC-0257): the minimal-coupling fix for E-FRC-0256's alpha problem. E-FRC-0256 read
// alpha_local = sqrt(3) / (48 D) on the spanned light: one number D sets the gauge field's RESOLUTION (the angle's
// window 4D, and so the Peierls root zeta_(4D), hbar = D / pi in the light's units) and its METRIC (the kick's divisor
// q^2 and the span's Q), so alpha reads the gravitational depth with k = 2.10. General relativity keeps the two apart:
// the gauge structure is the same everywhere and gravity enters through the metric alone. This experiment runs that.
//
// THE CHANGE (code/rule/depth-span-light makeMetricSpanMedium). The windows 4 D0 (axis) and 2 D0 (diagonal) and the
// field modulus 4 D0 at a baseline D0 everywhere; the kick's q_P = 2 D_m(P) + 1, M_P = q_P^2 and the span's
// Q_l = D_m(y) + D_m(z) + 1 read a metric depth D_m(x). spanBeat and spanBeatBack are unchanged (they read windows and
// divisors from separate arrays); matter reads the angle through zeta_(4 D0). Here D0 = 16 and D_m = 8, 12, 16, 24, 32
// (q_m = 17 .. 65), uniform in each run.
//
// DERIVED BEFORE ANY RUN (the rule's header has the full argument):
//  (1) Gauss survives: the flux S - C^T U is untouched. Reversal survives: each inverse uses its own divisor alone
//      (Q_l for the link, M_P for a kick level, n_P (M_P - 1) / 2 for the potential), never a relation between a
//      divisor and a window; q_m is odd for integer D_m, so every centered window exists.
//  (2) Gauge covariance survives and IMPROVES: a wrap moves the field by w_l times the window, 4 D0 on every link,
//      the field modulus of every triangle, so the gauge map commutes with wraps everywhere. On the unfixed light over a
//      varying depth a wrap on a link whose start column differs from its triangle's moves the field by 4 D_l, not a
//      multiple of 4 D_P: covariant only while nothing crosses a window. Tested with a WIDE map (eta in -16 .. 16,
//      axis shifts to 64) that makes gauged angles cross their windows at the start, on the radion's slab.
//  (3) What breaks: the counters (range q_m^2) and the link remainders (range Q_m) are no longer columns of the
//      D0-deep bulk (code/rule/trit-column: "a counter IS its column's value"). They must be registers of the metric,
//      held apart from the column. The rule does not need them to be columns; the trit-column reading of the light
//      loses that property for the divisors, and keeps it for the angle (a column of 2 D0 trits, window 4 D0).
//  (4) The resolution is read only where a value crosses a window. So on a uniform metric D_m, with no crossing, the
//      fixed light IS E-GRV-0092's light at depth D_m bit for bit (q replaced by q_m, the resolution unread): the
//      Coulomb growth Phi is the unfixed light's value for value. Predicted here at every D_m (E-FRC-0256's spanned
//      runs made 0 wraps and 0 crossings from D 4).
//  (5) alpha_local = kappa0 K / (24 pi c) with kappa0 = 2 pi / (4 D0), K = 2 / Q_m, c = 2 / (q_m sqrt 3):
//        alpha_local = (2 pi / 4 D0)(2 / q_m) / (24 pi 2 / (q_m sqrt 3)) = sqrt(3) / (48 D0) = 1/443.41 at D0 = 16,
//      FLAT in the metric depth: k_alpha = 0. hbar in the light's units is D0 / pi = 5.093 at every D_m. The local
//      clock and ruler are the span lump's (matter reads only the metric: rest rate q_m^(-1/2), Compton length
//      q_m^(-1/2) docks) and cancel from alpha as E-FRC-0256 showed. The unfixed light, same readings: sqrt(3) /
//      (48 D_m) = 1/221.7, 1/332.6, 1/443.4, 1/665.1, 1/886.8.
//  (6) The bending factor is untouched: the light's speed and index read only the divisors (index q_m / q0) and matter
//      only the metric (clock q_m^(-1/2)), so alpha = beta = 1/2 and f = 2 (run in E-GRV-0099).
// Because of (4), this is a CONSISTENCY result: the fix moves the root a charge reads with, and alpha flat follows
// from E-FRC-0256's measured flat product once hbar stops reading the depth. What could fail: the rule with a divisor
// that is not its column's count (reversal, Gauss, wraps), the reading's error across q_m = 17 .. 65 at a fixed
// window, and the covariance through wraps, which the unfixed light is predicted to lose.
//
// Gates, fixed before the run (no probe of this file):
//  M0 the local units: the span lump's rest rate and Compton length go as q_m^(-1/2) over D_m 8 .. 32 (log-log slopes
//     within EXPONENT_TOLERANCE, E-FRC-0256's), every matter run reversed.
//  M1 alpha_local flat in the metric depth: at every r, alpha_local(D_m) / alpha_local(D_m = D0) within FLAT_TOLERANCE
//     (1e-3, E-FRC-0256's: thirty times the largest D-dependent reading error measured on these lights, 3.2e-5) of 1
//     at every D_m.
//  M2 the fix changes nothing where the metric is the baseline: at D_m = D0 every r's alpha_local equals the unfixed
//     light's at D 16 (E-FRC-0256's rule and reading, rerun here) to 1e-12 relative.
//  M3 exact: every fixed and unfixed pair run reverses bit for bit, keeps Gauss on every beat, makes 0 wraps; the wide
//     gauge map on the fixed light over the radion's slab puts 0 on every plaquette, crosses windows at the start, and
//     is covariant on 256 of 256 beats.
//  C  the control, a real variation and a test that can say no: the unfixed light's alpha_local(D_m) / alpha_local(16)
//     within CONTROL_TOLERANCE (1e-3) of 16 / D_m at every r (E-FRC-0256's 1 / D), and the wide map on the unfixed
//     light over the same slab covariant on fewer than 256 beats.
// Verdict: partial if M0 or M3 fails; pass if M1, M2 and C hold; fail otherwise.
//
// FIRST RUN (tmp/fixed-alpha-run1.log, 39.5 s, the record): pass, no gate moved. M0: rest rate q_m^-0.5004, Compton
// length q_m^-0.5005, every matter run reversed. M1: alpha_local 0.00225527449 (1/443.4) at every D_m and r, worst
// spread 2.8e-8, each within 2.9e-8 of sqrt(3) / (48 D0); k_alpha 7.0e-9. M2: at D_m = D0 the fixed medium's alpha
// equals the unfixed rule's exactly (difference 0). M3: all 30 pair runs reversed, Gauss exact, 0 wraps, 0 turns; the
// wide map crossed 2,120 windows and is covariant on 256 of 256 beats, plaquette 0. C: the unfixed light reads 16 / D_m
// of its D 16 value to 2.8e-8 (k_alpha 2.066), and under the wide map is covariant on 0 of 256 beats (2,221 crossed).
// The Coulomb growth Phi of the fixed and unfixed light is equal value for value in 15 of 15 runs, as (4) said: the
// flat alpha comes entirely from the charge's root zeta_(4 D0), the light itself being unchanged. hbar_invariant
// 5.09296 at every D_m (unfixed: 2.546, 3.820, 5.093, 7.639, 10.186 = D_m / pi). Title written after the run.
//
// Depth L2: a change made by hand to a stand-in medium (no variable-depth bulk exists); its alpha follows from (4) and
// (5), so this checks the integer rule and the reading, not the model. The metric depth here is placed uniform, not
// found from a gravity field. DETERMINISM: every start is placed; nothing is drawn.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { logLogSlope } from '@/code/measure/regression'
import {
  CONTROL_TOLERANCE,
  EXPONENT_TOLERANCE,
  FLAT_TOLERANCE,
  LOCAL_SEPARATIONS,
  type LocalAlpha,
} from '@/code/measure/local-alpha'
import {
  FIXED_METRIC_DEPTHS,
  FIXED_RESOLUTION,
  fixedAlphaSurvey,
} from '@/code/measure/fixed-resolution'
import { GAUGE_BEATS } from '@/code/measure/depth-span'

const SAME_TOLERANCE = 1e-12

export default experiment({
  id: 'gauge/fixed-resolution-alpha',
  code: 'E-FRC-0257',
  title:
    "holding the gauge field's resolution fixed and letting only the metric divisors read depth makes alpha flat in local units, pass (a consistency result): with the angle windows and Peierls root at D0 = 16 and the kick's and span's divisors at metric depths 8 .. 32 (q_m 17 .. 65), alpha_local reads 1/443.4 at every metric depth, flat to 2.8e-8, sqrt(3) / (48 D0) to 2.9e-8, hbar in the light's units D0 / pi = 5.093 throughout, so k_alpha = 7e-9 where the unfixed light (resolution tied to the metric) reads 1/221.7 .. 1/886.8 = 1/D_m and k_alpha = 2.07; the light's Coulomb growth is the unfixed light's value for value in 15 of 15 runs (the rule reads the resolution only at a window crossing, and none occurs), every run reversed with Gauss exact and 0 wraps, and a gauge map that crosses 2,120 windows on the radion's slab is covariant on 256 of 256 beats, where the unfixed light over the same slab is covariant on 0 (its wraps move a boundary triangle's field by 4 D_l, not a multiple of its 4 D_P); the counters and remainders are then registers of the metric, not columns of the bulk",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = fixedAlphaSurvey(what => console.error(what))
    const d0 = FIXED_RESOLUTION
    const q = (d: number): number => 2 * d + 1
    const qs = FIXED_METRIC_DEPTHS.map(q)
    const of = (list: LocalAlpha[], d: number, r: number): LocalAlpha =>
      list.find(a => a.pair.depth === d && a.pair.r === r)!
    const restSlope = logLogSlope(
      qs,
      s.units.map(u => u.rest),
    )
    const comptonSlope = logLogSlope(
      qs,
      s.units.map(u => u.compton),
    )
    const m0 =
      Math.abs(restSlope + 0.5) <= EXPONENT_TOLERANCE &&
      Math.abs(comptonSlope + 0.5) <= EXPONENT_TOLERANCE &&
      s.units.every(u => u.reversed)
    const flat = LOCAL_SEPARATIONS.flatMap(r =>
      FIXED_METRIC_DEPTHS.map(
        d =>
          of(s.fixed, d, r).alphaLocal / of(s.fixed, d0, r).alphaLocal -
          1,
      ),
    )
    const m1 = flat.every(v => Math.abs(v) <= FLAT_TOLERANCE)
    const same = LOCAL_SEPARATIONS.map(
      r =>
        of(s.fixed, d0, r).alphaLocal /
          of(s.unfixed, d0, r).alphaLocal -
        1,
    )
    const m2 = same.every(v => Math.abs(v) <= SAME_TOLERANCE)
    const runs = [...s.fixed, ...s.unfixed].map(a => a.pair)
    const gf = s.gaugeFixed
    const gu = s.gaugeUnfixed
    const m3 =
      runs.every(p => p.reversed && p.gauss === 0 && p.wraps === 0) &&
      gf.plaquette === 0 &&
      gf.crossed > 0 &&
      gf.covariantBeats === GAUGE_BEATS
    const controlOff = LOCAL_SEPARATIONS.flatMap(r =>
      FIXED_METRIC_DEPTHS.map(
        d =>
          of(s.unfixed, d, r).alphaLocal /
            of(s.unfixed, d0, r).alphaLocal /
            (d0 / d) -
          1,
      ),
    )
    const c =
      controlOff.every(v => Math.abs(v) <= CONTROL_TOLERANCE) &&
      gu.covariantBeats < GAUGE_BEATS
    const status =
      !m0 || !m3 ? 'partial' : m1 && m2 && c ? 'pass' : 'fail'
    const mean = (list: LocalAlpha[], d: number): number =>
      LOCAL_SEPARATIONS.reduce(
        (acc, r) => acc + of(list, d, r).alphaLocal,
        0,
      ) / LOCAL_SEPARATIONS.length
    // d ln alpha / d (Phi / c^2) = -2 d ln alpha / d ln q (E-FRC-0256)
    const kFixed =
      -2 *
      logLogSlope(
        qs,
        FIXED_METRIC_DEPTHS.map(d => mean(s.fixed, d)),
      )
    const kUnfixed =
      -2 *
      logLogSlope(
        qs,
        FIXED_METRIC_DEPTHS.map(d => mean(s.unfixed, d)),
      )
    const phiSame = FIXED_METRIC_DEPTHS.flatMap(d =>
      LOCAL_SEPARATIONS.map(
        r =>
          of(s.fixed, d, r).pair.phi === of(s.unfixed, d, r).pair.phi,
      ),
    ).filter(Boolean).length
    const worst = (list: number[]): number =>
      Math.max(...list.map(v => Math.abs(v)))
    const metrics: Record<string, number> = {
      gate_M0: m0 ? 1 : 0,
      gate_M1: m1 ? 1 : 0,
      gate_M2: m2 ? 1 : 0,
      gate_M3: m3 ? 1 : 0,
      gate_C: c ? 1 : 0,
      restSlope,
      comptonSlope,
      kAlpha_fixed: kFixed,
      kAlpha_unfixed: kUnfixed,
      flatWorst: worst(flat),
      sameWorst: worst(same),
      controlWorst: worst(controlOff),
      phiSameAsUnfixed: phiSame,
      gaugeFixedBeats: gf.covariantBeats,
      gaugeFixedCrossed: gf.crossed,
      gaugeFixedPlaquette: gf.plaquette,
      gaugeUnfixedBeats: gu.covariantBeats,
      gaugeUnfixedCrossed: gu.crossed,
      seconds: s.seconds,
    }

    for (const [name, list] of [
      ['fixed', s.fixed],
      ['unfixed', s.unfixed],
    ] as const) {
      for (const a of list) {
        const tag = `${name}_Dm${a.pair.depth}_r${a.pair.r}`

        metrics[`alphaLocal_${tag}`] = a.alphaLocal
        metrics[`alphaOverClosed_${tag}`] = a.alphaLocal / a.alphaClosed
        metrics[`hbarInvariant_${tag}`] = a.hbarInvariant
        metrics[`growthOff_${tag}`] = a.pair.phi / a.pair.phiStatic - 1
        metrics[`turns_${tag}`] = a.pair.turns
      }
    }

    for (const u of s.units) {
      metrics[`rest_Dm${u.depth}`] = u.rest
      metrics[`compton_Dm${u.depth}`] = u.compton
      metrics[`cLocal_Dm${u.depth}`] = u.cLocal
    }

    const f = (v: number, n = 4): string => v.toFixed(n)
    const e = (v: number): string => v.toExponential(2)
    const inv = (v: number): string => `1/${(1 / v).toFixed(1)}`
    const row = (list: LocalAlpha[]): string =>
      FIXED_METRIC_DEPTHS.map(
        d => `D_m ${d} ${inv(mean(list, d))}`,
      ).join(', ')
    const all = [...s.fixed, ...s.unfixed]

    return verdict({
      status,
      claim: `at a fixed resolution D0 = ${d0} (windows 4 D0, Peierls root zeta_${4 * d0}) and uniform metric depths ${FIXED_METRIC_DEPTHS.join(', ')} (q_m ${qs.join(', ')}) the spanned light's alpha in local units reads ${row(s.fixed)}, flat to ${e(worst(flat))} (k_alpha = ${f(kFixed, 5)}), each ${f(Math.min(...s.fixed.map(a => a.alphaLocal / a.alphaClosed)), 6)} to ${f(Math.max(...s.fixed.map(a => a.alphaLocal / a.alphaClosed)), 6)} of sqrt(3) / (48 D0), hbar in the light's units ${f(Math.min(...s.fixed.map(a => a.hbarInvariant)))} to ${f(Math.max(...s.fixed.map(a => a.hbarInvariant)))} (D0 / pi = ${f(d0 / Math.PI)}); at D_m = D0 it equals the unfixed light's to ${e(worst(same))}; the unfixed light (resolution tied to the metric) reads ${row(s.unfixed)}, within ${e(worst(controlOff))} of 1 / D_m (k_alpha = ${f(kUnfixed, 3)}); the Coulomb growth is the unfixed light's value for value in ${phiSame} of ${s.fixed.length} runs; every pair run reversed with Gauss exact and 0 wraps; on the radion's slab (depth ${s.slabDepths.min} .. ${s.slabDepths.max}) a wide gauge map crossing ${gf.crossed} windows at the start is covariant on ${gf.covariantBeats} of ${GAUGE_BEATS} beats on the fixed light and ${gu.covariantBeats} on the unfixed one (${gu.crossed} crossed); the local units: rest rate q_m^${f(restSlope)}, Compton length q_m^${f(comptonSlope)}`,
      metrics,
      control: {
        controlWorst: worst(controlOff),
        kAlphaUnfixed: kUnfixed,
        gaugeUnfixedBeats: gu.covariantBeats,
      },
      notes: `L2. Gates M0 ${m0}, M1 ${m1}, M2 ${m2}, M3 ${m3}, C ${c}. Per reading (light D_m r: alpha_local, over closed, growth off static, turns, wraps): ${all.map((a, i) => `${i < s.fixed.length ? 'fixed' : 'unfixed'} ${a.pair.depth} ${a.pair.r}: ${e(a.alphaLocal)}, ${f(a.alphaLocal / a.alphaClosed, 6)}, ${e(a.pair.phi / a.pair.phiStatic - 1)}, ${a.pair.turns}, ${a.pair.wraps}`).join('; ')}. Units (D_m: rest over closed, Compton, c_local): ${s.units.map(u => `${u.depth}: ${f(u.rest / u.restClosed, 7)}, ${f(u.compton)}, ${f(u.cLocal)}`).join('; ')}. Gauge (fixed, unfixed): plaquette ${gf.plaquette}, ${gu.plaquette}; links shifted ${gf.shifted}, ${gu.shifted}. Largest relax residual ${e(Math.max(...all.map(a => a.pair.residual)))}. Survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
