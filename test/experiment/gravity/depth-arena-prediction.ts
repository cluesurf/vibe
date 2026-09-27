// The depth arena, predicted (E-GRV-0088): if the husk's depth D per column is a real register of the base (the radion
// of E-GRV-0079, sourced by content with the count coupling), and depth sets the arena everything moves in, what
// light-bending factor does the model's own machinery predict, with no fitted parameter, and does a slow lump fall
// alike per unit content in the depth field?
//
// THE DERIVATION (written before any run of this file).
// (1) Where depth enters the light. In the husk rule (code/rule/trit-column, code/measure/varying-depth-light) D enters
//     the linear dynamics at ONE place: each triangle's counter is the sum of its column's D trits, range q = 2D + 1,
//     and the kick divides by it (kappa = 2p / q). The link metric W, the multiplicities n_P and p hold no D (the
//     windows 4D and 2D act only at a wrap). So the light runs q A'' = -2p M_h A: an inertia q per column and a
//     stiffness that knows no depth, a medium with permittivity proportional to q and permeability 1, speed
//     c(D) = 2 / sqrt(3q) and index n = sqrt(q / q0) (measured by E-GRV-0070 to 4e-4).
// (2) What a ray can see. A static isotropic metric ds^2 = -N^2 dt^2 + a^2 dx^2 gives light the speed N / a, and
//     Maxwell's equations in it are a medium with permittivity = permeability = a / N. Rays see only n = a / N, one
//     number: light alone cannot split the arena into its time part and its space part. (The husk light's medium,
//     permittivity q and permeability 1, is not any metric's: its impedance varies, so it reflects at a depth gradient
//     where a metric's light would not. For rays this is invisible.)
// (3) What splits it is matter. A slow lump's phase advances at its rest rate, which is N times the far rate, so it
//     falls as g = -c^2 grad ln N: the pull reads the time part alone. With N = (q / q0)^(-alpha) and
//     a = (q / q0)^beta, the light fixes alpha + beta = 1/2. Newton's falling-light count takes n_N = 1 - Phi / c^2
//     with Phi = c^2 ln N, so n_N - 1 = alpha dq / q0, while the light has n - 1 = (alpha + beta) dq / q0. The
//     bending factor is f = (alpha + beta) / alpha = 1 / (2 alpha). General relativity: alpha = beta = 1/4, f = 2
//     (g_tt = -(1 - 2 Phi), g_xx = 1 + 2 Phi, equal parts). A clock-only medium: alpha = 1/2, beta = 0, f = 1.
//     Nordstrom (a = N, conformally flat): n = 1, f = 0.
// (4) What the rule gives. Clause (ii) of the proposal, "a deeper column takes more beats to cross", applied to matter
//     by the machinery that applies it to the light, is a field whose update divides by the same column count: the
//     clock form of code/rule/depth-clock-wave (inertia 9q, the light's link metric as stiffness, a rest term m that
//     does not read depth). Its rest rate is sqrt(m / 9q), so alpha = 1/2. Clause (i), "a husk step across a deeper
//     column is longer", has NO element in the rule: no link weight reads depth, so beta = 0. THE PREDICTION: f = 1,
//     Newton's count, not general relativity's 2. It holds for every m (the pull is -c^2 grad ln N whatever m, up to
//     the leapfrog's 1 / (1 - m / 36q)), so the fall is universal by construction of the arena, and it does not
//     depend on the coupling: the depth per content scales both halves together, and f is set by alpha alone.
// (5) The coupling is a count. b = a in code/rule/trit-radion: A x = rho, so a column's depth outflow in the light's
//     link metric equals its content, one depth level per unit of content, and one level is one bulk dock of the
//     column (a column of depth D holds D bulk docks, code/rule/trit-column). This is E-GRV-0080's b / a = 1. There,
//     b / a meant the depth per content in levels over this value, and the Newtonian count took matter's pull from a
//     SEPARATE energy -(pi / D) x per unit content (G_hand = 1 / (24 D), the light's Coulomb strength), so its factor
//     was (b / a) 4D / (3 pi q0^2) = 0.00624 (b / a) at D 16 in weak field (0.00582 read), and general relativity's 2
//     needed b / a = 320 (344 from the reading, E-GRV-0084). In the arena there is no separate matter coupling: the
//     pull is the clock's, g = (c0^2 / 2) grad ln q = c0^2 grad x / q0, so Newton's constant is
//     G_N = c0^2 (b / a) / (24 pi q0) = 1 / (18 pi q0^2) = 1.624e-5 husk steps^3 per content per beat^2 at b / a = 1,
//     exactly 0.00624 of G_hand. That ratio IS E-GRV-0080's factor: measured against the clock's own pull, the same
//     light gives 1. THE COUNT FIXES G, NOT THE FACTOR. No free parameter remains in f; G_N has none either once the
//     count is b = a; the inertia per content is the lump's own (a wave's), not a stand-in.
// (6) What would give 2 (reported, not run here; E-GRV-0089 runs its positive control): the depth must also set the
//     step. If the link weight of the light across a column divided by its count too (a husk step across a deeper
//     column longer by q), the light's speed would fall as 1 / q, not 1 / sqrt(q), while the clock stays: alpha = 1/2,
//     beta = 1/2, f = 2. That is the metric form of code/rule/depth-clock-wave, the scalar wave of
//     ds^2 = -(q0 / q) dt^2 + (q / q0) dx^2. It contradicts c(D) as E-GRV-0070 measured it, so it is a new rule for
//     the light, not a reading of the present one.
//
// THE READINGS (gates fixed before the gated run; the disclosed probe tmp/arena-probe.ts ran the lump on a UNIFORM
// depth only: g = -3.8e-10 and 1e-17 where the answer is 0, energy drift under 1e-5, exact reversal, and the rest
// rates 0.1005462 and 0.2013475 at D 16 against the leapfrog's closed forms to 2e-8):
//  P0 instrument: the husk light on the line at D = 16, 20, 24, 28 reverses bit for bit with 0 Gauss violations and
//     no wrap; every lump run and the radion field reverse bit for bit.
//  P1 the prediction: the light's speed over D = 16 .. 28 (40 / (t(100) - t(60)), E-GRV-0070's reader) fits
//     c ~ q^s with s within 0.01 of -1/2, and the clock lump's rest rate (the uniform lump's zero crossings over 4096
//     beats, m = 3 and 12) fits q^r with r within 0.01 of -1/2 for both; the factor predicted from the two read
//     exponents, f = s / r, is within 0.03 of 1. GATE: f is a number with no fitted parameter.
//  P2 fall alike: in the radion's own depth field (the slab of E-GRV-0080's C3: a sheet of content 1 per dock at
//     x = 90 on the 256 x 2 x 2 line, depth 16 + the half-level count of the Hann-averaged field, 11 .. 21), a lump at
//     rest at x = 154 (where the depth falls toward +x) of m = 3, amplitude 1e5 and of m = 12, amplitude 3e5 (a
//     different rest rate and nine times the energy), 480 beats, energy centroid fitted to x0 + v0 t + g t^2 / 2.
//     GATES: both g < 0 (toward the sheet, the deep side), alike to 3 percent, each within 10 percent of its lattice
//     ray-law prediction; the same m = 12 lump at x = 48 (where the depth rises toward +x) has g > 0 within 10
//     percent of its prediction. CONTROLS: the column form (rest term m q, rest rate the same at every depth) at
//     x = 154, and the clock lump on a uniform depth, each |g| under 5 percent of the m = 12 prediction.
//  REPORTED: G_N from the count and its ratio to G_hand; the lattice and continuum predictions; energy drifts.
// Verdict: pass if P1 and P2 hold; partial if P0 fails; fail otherwise.
//
// FIRST RUN (tmp/grv88-run1.log, 20 s, the record): fail on P2, no gate moved. P0 and P1 hold: the light's speed goes
// as q^-0.4992 (1.0002 to 1.0037 of c(D)), the clock lump's rest rate as q^-0.5003 and q^-0.5013 (the leapfrog's
// closed form to 2e-7), so the predicted factor is 0.9958 and 0.9977 from the read exponents, closed form 1: the
// model predicts NEWTON'S COUNT, not general relativity's 2. P2: both lumps fall toward the deep side (-8.83e-5 and
// -8.45e-5 per beat squared) but at 0.911 and 0.867 of the lattice prediction, alike only to 4.5 percent (gate 3),
// the heavy one outside its 10 percent; the mirrored lump falls the other way at 0.909 of its prediction; the column
// control reads 1.9e-7 (0.2 percent of the pull) and the uniform depth 1e-17. G_N = 1.624e-5 = 0.006236 of the
// hand-set pull. POST RUN (tmp/arena-post88.ts, read by no gate): fitted over beats 0 .. 120 the two lumps fall at
// 0.954 and 0.956 of the prediction (alike to 0.2 percent), and the mirror at 0.961; over later windows the fall
// weakens, faster for the larger rest term (beats 240 .. 480: 0.879 and 0.786; 240 .. 960: 0.736 and 0.526). The
// likely reason, not established: a lump near k = 0 is a long wave on an integer staircase (a depth step every 12
// docks), so it reflects off the steps where the ray law assumes a smooth slope, and more so the larger its rest
// rate. The universality is then a ray-limit property, and the fall-alike gate asked it of a wave outside that limit.
// Title written after the run.
//
// Depth L2: the arena reading is a derivation checked on a stand-in lump (the matter field is given by hand, as
// E-GRV-0077's inertia was), on a radion that is itself machinery added by hand (E-GRV-0079). DETERMINISM: every start
// and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { LIGHT_DEPTHS, predictionSurvey, REST_TERMS } from '@/code/measure/depth-arena'
import { RADION_DEPTH } from '@/code/measure/radion'
import { lightSpeed } from '@/code/measure/varying-depth-light'

export default experiment({
  id: 'gravity/depth-arena-prediction',
  code: 'E-GRV-0088',
  title:
    "a depth register that sets the arena predicts Newton's light-bending count 1, not general relativity's 2, because the rule spends all of the light's slowing on its clock and none on its step, fail on P2's fall: the husk light's speed goes as q^-0.499 and a lump whose update divides by the same column count has its rest rate go as q^-0.500, so the factor from the read exponents is 0.996 with no fitted parameter (closed form 1); the count coupling b = a fixes G_N = 1.62e-5, which is 0.0062 of the hand-set pull and is exactly E-GRV-0080's factor, so the coupling sets G and never the factor; in the radion's own slab two lumps with different rest rates and nine times the energy fall toward depth at 0.911 and 0.867 of the ray law, alike to 4.5 percent against a 3 percent gate, a mirrored lump falls the other way and a column-counted rest term does not fall (0.2 percent); over the first 120 beats they fall at 0.954 and 0.956, alike to 0.2 percent, and the fall weakens later as the slow wave meets the integer depth steps",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const s = predictionSurvey(what => console.error(what))
    const q0 = 2 * RADION_DEPTH + 1
    const c0 = lightSpeed(RADION_DEPTH)

    const instrument = s.light.every(l => l.run.reversed && l.run.gauss === 0 && l.run.wraps.angle + l.run.wraps.field + l.run.wraps.potential === 0) && s.rest.every(r => r.reversed) && [...s.fall, s.uniform, s.column, s.mirror].every(f => f.reversed) && s.field.reversed

    // P1
    const factor = s.lightSlope / s.restSlope[1]!
    const factorLight = s.lightSlope / s.restSlope[0]!
    const p1 = Math.abs(s.lightSlope + 0.5) <= 0.01 && s.restSlope.every(r => Math.abs(r + 0.5) <= 0.01) && Math.abs(factor - 1) <= 0.03 && Math.abs(factorLight - 1) <= 0.03

    // P2
    const [light, heavy] = s.fall as [(typeof s.fall)[0], (typeof s.fall)[0]]
    const alike = Math.abs(light.g / heavy.g - 1)
    const near = (g: number, want: number): boolean => Math.abs(g / want - 1) <= 0.1
    const scale = Math.abs(heavy.gPredicted)
    const p2 =
      light.g < 0 &&
      heavy.g < 0 &&
      alike <= 0.03 &&
      near(light.g, light.gPredicted) &&
      near(heavy.g, heavy.gPredicted) &&
      s.mirror.g > 0 &&
      near(s.mirror.g, s.mirror.gPredicted) &&
      Math.abs(s.column.g) <= 0.05 * scale &&
      Math.abs(s.uniform.g) <= 0.05 * scale

    const gArena = 1 / (18 * Math.PI * q0 * q0)
    const gHand = 1 / (24 * RADION_DEPTH)
    const status = !instrument ? 'partial' : p1 && p2 ? 'pass' : 'fail'
    const f = (x: number): string => x.toPrecision(6)
    const e = (x: number): string => x.toExponential(3)
    const metrics: Record<string, number> = {
      gate_P1: p1 ? 1 : 0,
      gate_P2: p2 ? 1 : 0,
      instrument: instrument ? 1 : 0,
      lightSlope: s.lightSlope,
      restSlope_m3: s.restSlope[0]!,
      restSlope_m12: s.restSlope[1]!,
      predictedFactor: factor,
      predictedFactorLight: factorLight,
      closedFactor: 1,
      gLight: light.g,
      gLightPredicted: light.gPredicted,
      gLightContinuum: light.gContinuum,
      gHeavy: heavy.g,
      gHeavyPredicted: heavy.gPredicted,
      gHeavyContinuum: heavy.gContinuum,
      alike,
      gMirror: s.mirror.g,
      gMirrorPredicted: s.mirror.gPredicted,
      gColumn: s.column.g,
      gColumnPredicted: s.column.gPredicted,
      gUniform: s.uniform.g,
      driftLight: light.energyDrift,
      driftHeavy: heavy.energyDrift,
      newtonArena: gArena,
      newtonHand: gHand,
      newtonRatio: gArena / gHand,
      couplingCount: 1,
      c0,
      seconds: s.seconds,
    }

    s.light.forEach(l => {
      metrics[`lightSpeed_D${l.depth}`] = l.speed
      metrics[`lightSpeedOverClosed_D${l.depth}`] = l.speed / l.closed
    })
    s.rest.forEach(r => {
      metrics[`restRate_m${r.m}_D${r.depth}`] = r.rate
      metrics[`restRateOverClosed_m${r.m}_D${r.depth}`] = r.rate / r.closed
    })

    return verdict({
      status,
      claim: `the husk light's speed over D = ${LIGHT_DEPTHS.join(', ')} goes as q^${f(s.lightSlope)} (q = 2D + 1) and the clock lump's rest rate as q^${f(s.restSlope[0]!)} and q^${f(s.restSlope[1]!)} (m = ${REST_TERMS.join(', ')}), so depth enters the light only through its clock and the predicted bending factor is ${f(factor)} (closed form 1, Newton's count; general relativity 2, Nordstrom 0), with no fitted parameter; in the radion's own depth field a lump of m = 3 and one of m = 12 with nine times the energy fall toward the deep side at ${e(light.g)} and ${e(heavy.g)} per beat squared (alike to ${e(alike)}, lattice predictions ${e(light.gPredicted)} and ${e(heavy.gPredicted)}), the mirrored lump at ${e(s.mirror.g)} (predicted ${e(s.mirror.gPredicted)}), the column-counted rest term at ${e(s.column.g)} and the uniform depth at ${e(s.uniform.g)}; the count coupling b = a gives G_N = ${e(gArena)}, ${f(gArena / gHand)} of the hand-set radion pull`,
      metrics,
      control: { gColumn: s.column.g, gUniform: s.uniform.g, gMirror: s.mirror.g },
      notes: `L2. Gates P1 ${p1}, P2 ${p2}; instrument ${instrument}. Light speeds over c(D): ${s.light.map(l => f(l.speed / l.closed)).join(', ')}. Rest rates over the leapfrog's closed form: ${s.rest.map(r => `m ${r.m} D ${r.depth} ${f(r.rate / r.closed)}`).join('; ')}. Field depth along x (every 8): ${s.field.depth.filter((_, i) => i % 8 === 0).join(' ')}. Lump fits r2 ${[light, heavy, s.mirror].map(x => f(x.fitR2)).join(', ')}, v0 ${[light, heavy, s.mirror, s.column, s.uniform].map(x => e(x.v0)).join(', ')}, energy drift ${[light, heavy, s.mirror, s.column, s.uniform].map(x => e(x.energyDrift)).join(', ')}; centroid of the m = 12 lump at beats 0, 120, 240, 360, 480: ${[0, 120, 240, 360, 480].map(t => heavy.centroid[t]!.toFixed(3)).join(', ')}. Survey ${s.seconds.toFixed(1)} s.`,
    })
  },
})
