// The spanned light, its rule and its prediction (E-GRV-0092): E-GRV-0088 and 0089 found the husk light reads depth
// as inertia only (the kick divides by q = 2D + 1, no link weight reads depth), a clock-only medium with alpha = 1/2,
// beta = 0 and a bending factor 1. A deeper column has more docks, which is more to MOVE (inertia q, in the rule) AND
// more to SPAN (a link across deeper columns is longer and couples more weakly: stiffness 1 / q, missing). This file
// adds the second (code/rule/depth-span-light) and asks whether the rule stays exact, and what it predicts.
//
// THE CHANGE (code/rule/depth-span-light, header). A link joining columns y and z reads their mean count Q_l =
// (q_y + q_z) / 2 = D_y + D_z + 1 (symmetric in its ends, q on a uniform medium, an integer for any depths), and its
// register takes the flux divided by Q_l, the remainder carried in the link: (A_l, r_l) are the digits of
// A2_l = Q_l A_l + r_l, which takes the flux S - C^T U whole each beat. The kick reads the field of A + r / Q with each
// remainder in the triangle's own radix, n_P p (q_P B_P + (C W r)_P), divided by q_P^2 in E-FRC-0214's three shaped
// levels. The division sits on the DRIFT so the gauge map is the old one (axis angles by 2 d eta, diagonals by d eta),
// and the field C W A the kick reads is untouched by it.
//
// THE DERIVATION (written before any run of this file).
// (1) Uniform medium. The shadow runs A~'' = -(n p / q^2) C^T C W A~: kappa = 2 p / q^2, so c = sqrt(2 kappa / 3) =
//     2 / (q sqrt 3), c ~ q^(-1), index n = q / q0 (the old light: q^(-1/2), index sqrt(q / q0)).
// (2) Varying medium. With K = n p / q on triangles and W / Q on links the light is Maxwell's in a medium of
//     permittivity AND permeability proportional to q (the old rule: one of them only). A static isotropic metric
//     ds^2 = -N^2 dt^2 + a^2 dx^2 is exactly such a medium with permittivity = permeability = a / N (E-GRV-0088 (2)),
//     so the light fixes a / N = q / q0: with N = (q / q0)^(-alpha), a = (q / q0)^beta, alpha + beta = 1. The medium
//     is impedance matched (the old one was not), so a depth gradient reflects nothing to first order.
// (3) What matter reads. Matter is E-GRV-0088's stand-in lump (code/rule/depth-clock-wave), with the SAME change made
//     to its links: the span form, 9 q X'' = -(2 / q) A X - m X, inertia q, stiffness 2 / q, a rest term that reads no
//     depth (integer form: inertia 9 q^2, stiffness 2, rest term m q, each dock dividing by its own count). Its rest
//     rate is acos(1 - m / 18 q) ~ sqrt(m / 9q), the clock form's: N = (q / q0)^(-1/2), alpha = 1/2. The rest term
//     reads no link, so the change cannot reach the clock: at k = 0 the ray law's u_0 = m / (36 q) holds no stiffness.
// (4) Does the fall still read only the clock? The lattice ray law (code/measure/depth-arena) gives
//     g = -(3 a / Q)(d ln u_0 / dx) / (1 - u_0) = (c_m^2 / 2) d ln q / dx / (1 - u_0) = -c_m^2 grad ln N / (1 - u_0)
//     with c_m^2 = 6 a / Q = 4 / (3 q^2): the pull is the clock's gradient, and the speed that converts it is the
//     span lump's own wave speed, which equals the spanned light's at every depth. So the Newtonian count
//     n_N - 1 = -ln N = (1/2) ln (q / q0) is unchanged in form. (E-GRV-0088's clock lump is NOT this light's matter:
//     its waves run at 2 / sqrt(3 q), sqrt(q) = 5.7 times this light at D 16, so a count from it would read a matter
//     faster than light.)
// (5) So alpha = beta = 1/2: clock q^(-1/2), space step q^(1/2), and f = (alpha + beta) / alpha = 2. In weak field the
//     light's index minus 1 is dq / q0, the count's is dq / (2 q0), twice. On a staircase with q / q0 up to 1.3 the
//     closed factor is sum (s - 1) / sum ln(s) / 2, s = q / q0, which is 2.243 on E-GRV-0089's slab, exactly the
//     metric control's closed value (the spanned light's index IS q / q0).
// (6) What the change leaves alone: Gauss (the flux S - C^T U), the gauge map and the plaquette field, the angle
//     windows and the field modulus, the multiplicities, p. What it costs: a remainder per link (a counter of range
//     Q_l, a column of D_y + D_z + 1 states) and counters of range q^2 (two columns of D trits) per level.
//
// Gates, fixed before the gated run (the disclosed probe tmp/span-probe.ts ran the rule on a UNIFORM depth 16 only:
// one level reversed bit for bit with 0 Gauss and 0 wraps, speed 1.0004 of 2 / (q sqrt 3), invariant drift 2.8e-4
// over 2,287 beats; three levels the same speed, reversal, Gauss and wraps, drift 1.6e-10, 42 s a run):
//  R1 exact: on the uniform line (D 16 .. 28, the four speed runs) and on E-GRV-0089's slab (the uniform D 16 run and
//     the lens run) every run reverses bit for bit, keeps 0 Gauss violations on every beat and makes no wrap; the
//     gauge map puts 0 on every plaquette and the gauged run equals the ungauged plus the map on every link, every
//     other array equal, on all 256 beats of the uniform D 16 line and of the slab.
//  R2 speed: the plane packet's speed 40 / (t(100) - t(60)) at D = 16, 20, 24, 28 fits c ~ q^s (least squares on logs)
//     with s within 0.01 of -1, and each speed within 1 percent of 2 / (q sqrt 3).
//  R3 stable: kappa lambda_max <= 4 with lambda_max = 16 (the husk's top, E-FRC-0250) and the local
//     kappa = 2 p / (q_P min Q_l) of every triangle of every medium run (the smallest depth anywhere is the slab's
//     11), and no growth: the slab's lens run ends with its invariant within 5 percent of its start.
//  R4 energy: every uniform run's shadow invariant, read every 64 beats, stays within 1e-8 of its start (relative;
//     the carry residual is at most 1 / (2 M^3) per triangle a beat, M = q^2, so three levels leave it far below).
//  R5 the prediction from measured exponents: the span lump's rest rate (m = 3 and 12, 4096 beats, D 16 .. 28)
//     fits q^r with each r within 0.01 of -1/2, and f = s / r (for both r) is within 0.03 of 2. No fitted parameter.
// Verdict: partial if R1 fails; pass if R2 .. R5 hold; fail otherwise.
// CONTROL: the unchanged light, run here by E-GRV-0088's own survey on the same depths (speed q^(-1/2), factor 1):
// the same readers must give 1 there and 2 here.
// Reported: the slab's invariant drift (the boundary radix choice), each speed over closed, the rest rates over their
// closed form, the stability margin, and what the change touches (the notes).
//
// FIRST RUN (tmp/span-rule-run1.log, 216 s, the record): pass, no gate moved. R1: every run reversed bit for bit, 0
// Gauss violations, 0 wraps; the gauge map puts 0 on every plaquette, moves 6,488 slab links, and the gauged runs are
// covariant on 256 of 256 beats on the uniform line and on the slab. R2: c ~ q^-0.999985, each speed 1.00037 to
// 1.00049 of 2 / (q sqrt 3) (the unchanged light, same reader: q^-0.49918). R3: kappa lambda_max at most 0.0605 of the
// bound 4 (smallest depth 11); the slab's invariant ends 3.77e-2 from its start. R4: uniform drifts 1.6e-11 to
// 3.0e-10. R5: the span lump's rest rate goes as q^-0.50033 and q^-0.50131 (within 2.5e-7 of its closed form), so
// the factor from the read exponents is 1.9987 and 1.9948 (the unchanged light's, by E-GRV-0088's survey rerun here:
// 0.9958). THE ONE NUMBER NOT NEAR ITS IDEAL: the slab's invariant drifts 3.8 percent, against 3e-10 on a uniform
// depth. That is the boundary choice (a link's remainder read in the triangle's radix, header of the rule), bounded
// and gated only as no growth; it is what an exact boundary would remove. Title written after the run.
//
// WHAT ELSE THE CHANGE TOUCHES (argued, not run). Coulomb: a static charge's flux S - C^T U solves div e = rho with
// C W Q^(-1) e = 0, which on a uniform depth is the old flux exactly (the same 1/r field, E-FRC-0241's Green
// function), but the angle a hop reads grows by e / q a beat, not e, so the force on a test charge falls by q (33 at
// D 16) and the field energy per flux by q: the 1/r^2 shape stays, the strength (and any alpha read from it) does not.
// E-FRC-0252 (matter reads the light): the Peierls phase reads the integer angle A, which the gauge map still moves
// by 2 d eta and d eta, so the coupling stays exact and covariant; but a weak field now lives q times longer in the
// remainder r before it moves A, so its 512-beat run would see about 1/33 of the push, and a reading of A + r / Q
// needs a finer root of unity. Planck: the light's modes keep their shape with omega scaled by 1 / sqrt(q) (kappa
// 2 / q^2), so a thermal count holds as before in form, with q^(3/2) more modes per unit frequency and a cutoff
// sqrt(q) lower; E-FRC-0230's column quantization (2D + 1 phase points per mode) would now see a counter of range
// q^2. To recheck: E-FRC-0241 and 0252 rerun on spanBeat at the same D (0252 with q times the beats), and the Planck
// experiments (E-FRC-0225, 0230, 0232) rerun with kappa = 2 / q^2.
//
// Depth L2: a rule change made BY HAND to a stand-in medium (code/measure/varying-depth-light: no variable-depth
// bulk exists), whose prediction f = 2 follows from its construction; the runs check that the integer rule realizes
// that linear algebra exactly, not that the model produced it. DETERMINISM: every start is placed; nothing is drawn.
// NOTHING MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { energyDrift, GAUGE_BEATS, spanRuleSurvey, SPAN_DEPTHS } from '@/code/measure/depth-span'
import { predictionSurvey, REST_TERMS } from '@/code/measure/depth-arena'

const TOL4 = 1e-8

export default experiment({
  id: 'gravity/depth-span-rule',
  code: 'E-GRV-0092',
  title:
    "a husk light whose link stiffness reads the depth it spans stays exact and predicts general relativity's light-bending factor 2, pass: dividing each link's step by the mean count of the two columns it joins, the remainder carried in the link and the kick in three shaped levels, the light reverses bit for bit with 0 Gauss violations and 0 wraps on uniform depths 16 .. 28 and on the radion's slab, is gauge covariant under the unchanged gauge map on 256 of 256 beats on both, and keeps its shadow invariant to 3e-10 on a uniform depth (3.8 percent on the slab, where a boundary link is read in its triangle's radix); its speed goes as q^-0.99999 against the unchanged light's q^-0.499, and matter given the same change keeps the clock's rest rate q^-0.500 and q^-0.501, so the factor from the read exponents is 1.999 and 1.995 (the unchanged light's 0.996); the prediction follows from the change by construction (permittivity and permeability both proportional to the column count), so this checks the integer rule, not the model",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = spanRuleSurvey(what => console.error(what))
    const old = predictionSurvey(what => console.error(what))
    const runs = [...s.speeds.map(x => x.run), s.lens.uniform, s.lens.lens]
    const wraps = runs.reduce((a, r) => a + r.wraps.angle + r.wraps.field + r.wraps.potential, 0)
    const gauges = [s.uniformGauge, s.lensGauge]
    const r1 = runs.every(r => r.reversed && r.gauss === 0) && wraps === 0 && gauges.every(g => g.plaquette === 0 && g.covariantBeats === GAUGE_BEATS)
    const r2 = Math.abs(s.speedSlope + 1) <= 0.01 && s.speeds.every(x => Math.abs(x.speed / x.closed - 1) <= 0.01)
    const lensDrift = energyDrift(s.lens.lens.energy)
    const lensEnd = Math.abs(s.lens.lens.energy[s.lens.lens.energy.length - 1]! / s.lens.lens.energy[0]! - 1)
    const r3 = s.stability <= 4 && lensEnd <= 0.05
    const uniformDrifts = [...s.speeds.map(x => energyDrift(x.run.energy)), energyDrift(s.lens.uniform.energy)]
    const r4 = uniformDrifts.every(d => d <= TOL4)
    const factors = s.restSlope.map(r => s.speedSlope / r)
    const r5 = s.restSlope.every(r => Math.abs(r + 0.5) <= 0.01) && factors.every(f => Math.abs(f - 2) <= 0.03) && s.rest.every(r => r.reversed)
    const status = !r1 ? 'partial' : r2 && r3 && r4 && r5 ? 'pass' : 'fail'
    const f = (x: number): string => x.toPrecision(6)
    const e = (x: number): string => x.toExponential(2)
    const metrics: Record<string, number> = {
      gate_R1: r1 ? 1 : 0,
      gate_R2: r2 ? 1 : 0,
      gate_R3: r3 ? 1 : 0,
      gate_R4: r4 ? 1 : 0,
      gate_R5: r5 ? 1 : 0,
      speedSlope: s.speedSlope,
      restSlope_m3: s.restSlope[0]!,
      restSlope_m12: s.restSlope[1]!,
      factor_m3: factors[0]!,
      factor_m12: factors[1]!,
      closedFactor: 2,
      stability: s.stability,
      minDepth: s.minDepth,
      wraps,
      uniformGaugeBeats: s.uniformGauge.covariantBeats,
      lensGaugeBeats: s.lensGauge.covariantBeats,
      gaugeShiftedLinks: s.lensGauge.shifted,
      uniformDriftMax: Math.max(...uniformDrifts),
      lensDrift,
      lensEnd,
      seconds: s.seconds,
    }

    s.speeds.forEach(x => {
      metrics[`speed_D${x.depth}`] = x.speed
      metrics[`speedOverClosed_D${x.depth}`] = x.speed / x.closed
      metrics[`drift_D${x.depth}`] = energyDrift(x.run.energy)
    })
    s.rest.forEach(r => {
      metrics[`restRate_m${r.m}_D${r.depth}`] = r.rate
      metrics[`restRateOverClosed_m${r.m}_D${r.depth}`] = r.rate / r.closed
    })

    return verdict({
      status,
      claim: `the spanned light (a link's stiffness divided by the mean count of the two columns it joins, carried in the link, three shaped levels) reverses bit for bit with 0 Gauss violations and ${wraps} wraps on the uniform line at D = ${SPAN_DEPTHS.join(', ')} and on E-GRV-0089's slab, and is gauge covariant on ${s.uniformGauge.covariantBeats} and ${s.lensGauge.covariantBeats} of ${GAUGE_BEATS} beats (uniform, slab); its speed goes as q^${f(s.speedSlope)} (${s.speeds.map(x => f(x.speed / x.closed)).join(', ')} of 2 / (q sqrt 3)); the span lump's rest rate goes as q^${f(s.restSlope[0]!)} and q^${f(s.restSlope[1]!)} (m = ${REST_TERMS.join(', ')}), so the predicted bending factor from the read exponents is ${factors.map(f).join(' and ')} (closed form 2, general relativity's), with no fitted parameter; kappa lambda_max at most ${f(s.stability)} of the bound 4; the shadow invariant drifts at most ${e(Math.max(...uniformDrifts))} on a uniform depth and ${e(lensDrift)} on the slab`,
      metrics,
      control: { oldLightSlope: old.lightSlope, oldFactor: old.lightSlope / old.restSlope[1]! },
      notes: `L2. Gates R1 ${r1}, R2 ${r2}, R3 ${r3}, R4 ${r4}, R5 ${r5}. Control, the unchanged light by E-GRV-0088's survey on the same depths: speed q^${f(old.lightSlope)}, factor ${f(old.lightSlope / old.restSlope[1]!)}. Arrivals (t60, t100) per depth: ${s.speeds.map(x => `D ${x.depth} ${x.run.arrival.map(a => a.toFixed(2)).join(' ')}`).join('; ')}. Rest rates over closed: ${s.rest.map(r => `m ${r.m} D ${r.depth} ${f(r.rate / r.closed)}`).join('; ')}. Uniform drifts ${uniformDrifts.map(e).join(', ')}; slab drift ${e(lensDrift)}, end ${e(lensEnd)}. Run seconds ${runs.map(r => r.seconds.toFixed(1)).join(', ')}. Survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
