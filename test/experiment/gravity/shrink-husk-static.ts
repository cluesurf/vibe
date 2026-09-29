// The shrinking husk, static (E-GRV-0100): the bounded depth field of E-GRV-0090 on a husk backed by layers that SHRINK
// inward, the {3,4,3,4}'s own orientation seen from its husk (the outermost shell holds 94 percent of the docks,
// E-HLG-0011) and Randall-Sundrum II's: the bulk behind each patch of husk has finite volume, so the zero mode stays on
// the husk and the pull should stay 1/r there, with a short-range correction from the bulk
// (note/research/vibe/roadmap/discrete-gravity.md, Part 5c.1, after E-GRV-0094 and 0095).
//
// THE GEOMETRY: code/rule/open-husk with growth 'shrink'. Layer 0 is the husk, E-GRV-0090's mesh (nine out-links a
// dock, g = 2 on an axis and 1 on a face diagonal), a periodic cube of side 64. Below it FOUR layers of sides 32, 16, 8, 4
// (each 1/8 the docks of the one above, the side halving), every one the same nine-link mesh at its own spacing, and each
// dock joined by one vertical link (g = 1) to the dock of the next layer that contains it: 299,584 docks and 2,995,776
// links, the bounded registers of E-GRV-0090 on every one (a line trit and a step of a trit and three base-297 digits a
// link, a rate and a remainder a dock). No depth and no content is stored anywhere; the depth is found by summing F / g
// from dock 0 along a fixed tree. No floor and no ground: the stack is finite and closed.
//
// THE CURVATURE LENGTH, from the halving alone: a scale factor 2 a layer. The stack's action per husk dock is
// sum_k [ (6 / 2^k) |grad x_k|^2 + 8^-k (x_k - x_k+1)^2 ], which is the continuum sum dy [ A e^(-ky) |grad x|^2 +
// B e^(-3ky) (d_y x)^2 ] sampled at layer spacing l with A l = 6 and B / l = 1; isotropic at the husk (A = B) sets l =
// sqrt 6 = 2.449 husk docks a layer, so k = ln 2 / sqrt 6 = 0.2830 a husk dock, a curvature length 1 / k = 3.534 husk
// docks (1.44 layer spacings; the {3,4,3,4}'s shell ratio 18.28 gives 1.03).
//
// CONTENT LINES stay on the husk (placed over the husk's lateral links only, code/rule/open-husk huskOnly: no line
// enters the bulk, counted) and run out from the source. On a closed torus they must close, so the source's 4 units
// end on a sink of 4 at the ANTIPODE (32, 32, 32). WHY the antipode and not a uniform background (which integer lines
// cannot hold): around the antipode the torus Green's function is even with Laplacian 1 / (sigma V), so the sink's
// potential near the source is a constant plus -|d|^2 / (6 sigma V), which cancels exactly the uniform background's
// +|d|^2 / (6 sigma V) that the periodic box would otherwise add: the source sees its own field plus a constant to
// fourth order in r / 64, and the constant is fitted. The husk alone on the same torus with the same sink (the control)
// carries the same far-field images, so every comparison below is stack against husk on one box.
//
// RINGING: the reading is static, the Hann-weighted average of 2048 beats from zero field (E-GRV-0090's method);
// radiation returns around the husk in 64 / c(16) = 318 beats, so the average runs over some six returns of the
// slowest husk mode and averages them out rather than outrunning them. The linear solve (a second method, conjugate
// gradients on the same mesh) is read beside it. Experiment 2 (E-GRV-0101) reads a front, and there the window is
// shorter than the return.
//
// PREDICTIONS, derived before any run from the geometry alone (code/measure/open-husk stackModes: each layer smooth in
// its plane, discrete in depth; tmp/rs-probe1.log is the same derivation, no rule run):
//  - the zero mode's share of the husk alone's 1/r is s_0 / sum s_k = 1 / (2 - 2^-4) = 16 / 31 = 0.51613 (0.5 for an
//    endless stack; E-GRV-0094's 0.57 was this for two layers, 1 / 1.75), so k = 0.0418217 x 0.51613 = 0.021586;
//  - the bulk adds four massive modes, masses 0.068, 0.152, 0.320, 0.731 a husk dock, weights 0.061, 0.099, 0.219,
//    0.558 of the zero mode's: W = -(k / r) (1 + sum w_n e^(-m_n r)), a correction that is POSITIVE (the pull is
//    stronger at short range) and has no free number (the link weights and the halving fix all of it);
//  - AGAINST RANDALL-SUNDRUM II: the RS correction is 2 / (3 k^2 r^2) = 8.33 / r^2 here. The stack does NOT have RS's
//    shape. Every dock beats once a beat, so the bulk's time is not warped: the static weights run e^(-ky) laterally and
//    e^(-3ky) vertically (the static slice of hyperbolic 4-space), where RS's static problem carries the redshift and
//    runs e^(-2ky) and e^(-4ky) (AdS_5). The endless stack's correction therefore falls as about 0.93 / r, not as
//    1 / r^2 (layered model at 20 layers: 0.058 at r = 16, 0.029 at r = 32), and at r = 4 it is 0.19 of the zero mode
//    where RS says 0.52. Four layers cut it off past about 1 / 0.068 = 15 docks, which by coincidence brings it near
//    RS's number at r = 16 .. 24 (0.031, 0.015 against 0.033, 0.015);
//  - a c0 - k / r - b / r^3 fit on r = 4 .. 16 reads the stack's k at 0.5655 of the husk alone's, not 0.516, because
//    the correction is not 1 / r^2.
//
// DISCLOSED PROBES (instrument only, no W read from the rule or the linear solve before the gates were fixed):
// tmp/rs-probe1.log (the layered prediction above), tmp/rs-probe2.log (sizes, a beat 111 ms on the stack and 58 ms on
// the husk alone, every placed line on the husk, stackModes equal to the probe).
//
// GATES, fixed before the first run of this file. D 16, three digits, side 64, four shrinking layers, a content-4
// source at the origin and its sink at the antipode, the Hann average of 2048 beats from zero field. W(r) = -(pi / D) 4
// x(r), x the found depth, averaged over the six axis docks at distance r (the octree makes +x and -x differ: they are
// reported apart); the force F(r) = W(r + 1) - W(r).
//  C0 CONTROL (the method): the husk alone (no layer) on the same torus with the same sink, fitted c0 - k / r - b / r^3
//     on r = 4 .. 16, gives k within 1 percent of E-GRV-0090's 0.0418217.
//  R1 exact and bounded: in both runs Gauss 0 off on every dock of husk and bulk after every beat, no line off the husk,
//     curl 0 on every check (the depth single valued), 0 wraps, every register in its window, every run reverses bit
//     for bit.
//  R2 the long-range law is the zero mode's 1/r: W rises at every r = 1 .. 24 (attraction); the stack's fitted k over
//     the husk alone's (the same fit, the same range) is within 3 percent of the layered prediction's 0.5655; and the
//     force ratio F_stack / F_alone is within 3 percent of the layered prediction at every r = 12 .. 23 (3.4 to 6.5
//     curvature lengths, where it is 16 / 31 times 1.03 .. 1.12).
//  R3 the short-range correction: delta(r) = (F_stack / F_alone) / (16 / 31) - 1 is positive at every r = 1 .. 23 (RS's
//     sign), and within 25 percent of the layered prediction's at every r = 4 .. 11. REPORTED: delta against RS II's
//     force correction 2 / (3 k^2) (r^2 + r (r + 1) + (r + 1)^2) / (r^2 (r + 1)^2) with k = ln 2 / sqrt 6, and the
//     log-log slope of delta on r = 4 .. 8 (layered 1.02, RS 1.85).
// Verdict: pass if R1 to R3 hold with the control C0; partial if C0 fails; fail otherwise.
//
// FIRST RUN (tmp/grv97-run1.log, run as E-GRV-0097 and renumbered to E-GRV-0100 before registering, the codes having
// been taken meanwhile; 551 s, the record): partial, no gate moved. C0 FAILS by a hair: the husk alone fits k =
// 0.04139, 1.04 percent under E-GRV-0090's 0.0418217 against a 1 percent gate (the continuum's 16 / 384 = 0.041667 is
// 0.67 percent above it; the fit here is one source and an antipodal sink on r = 4 .. 16, E-GRV-0090's a pair on r = 2 ..
// 6). R1 holds: Gauss 0 off on 4,096 beat checks over every dock, 0 lines off the husk, curl 0, 0 wraps, largest step
// 0.452, both runs reverse bit for bit; the rule's force equals the linear solve's to 2.9e-4. R2 FAILS by a hair: W
// rises at every r, the fitted k is 0.02272, 0.5489 of the husk alone's against the layered 0.5655 (2.9 percent, inside
// 3), but the long-range force ratio runs 2 .. 3 percent under the layered prediction at every r >= 8 (0.5588, 0.5418,
// 0.5318, 0.5277 at r = 12, 16, 20, 23 against 0.5741, 0.5563, 0.5455, 0.5398; worst 3.08 percent against 3), falling
// toward the zero mode's 16 / 31 = 0.5161 faster than the smooth-plane layers predict. R3 holds: the correction is
// positive at every r = 1 .. 23 (RS's sign) and within 24 percent of the layered prediction on r = 4 .. 11 (0.3375,
// 0.1504 at r = 4, 8 against 0.3634, 0.1793), measured a little under it everywhere; its log slope on r = 4 .. 8 is
// 1.16 (layered 1.02, RS 1.87), and it is 0.27, 0.43, 0.54 of Randall-Sundrum II's 1.270, 0.3485, 0.1604 at r = 4, 8,
// 12: the shape is the one-clock stack's, not RS's. Title written after the run.
//
// Depth L2: a known construction (a massless scalar on a brane backed by a finite hyperbolic bulk, the
// Randall-Sundrum II shape) run as an integer reversible rule on bounded registers, with a control. DETERMINISM: every
// start and source is placed; nothing is drawn. NOTHING MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fitPowers } from '@/code/measure/husk-coulomb'
import { stepRule } from '@/code/rule/step-depth'
import {
  HUSK_LATERAL,
  huskOnly,
  openMesh,
  placeOpenLines,
  type OpenMesh,
} from '@/code/rule/open-husk'
import {
  greenSolve,
  huskDock,
  newOpenRecord,
  openContent,
  openStaticRun,
  stackGreen,
  stackModes,
  type OpenRecord,
} from '@/code/measure/open-husk'

const DEPTH = 16
const LEVELS = 3
const SIDE = 64
const LAYERS = 4
const BEATS = 2048
const CONTENT = 4
const R_MAX = 24
const FIT_R: readonly number[] = [
  4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
]
const LONG_FROM = 12
const SHORT_FROM = 4
const SHORT_TO = 11
const SLOPE_R: readonly number[] = [4, 5, 6, 7, 8]
const RECORDED_0090_K = 0.0418217
const CONTROL_TOLERANCE = 0.01
const FIT_TOLERANCE = 0.03
const LONG_TOLERANCE = 0.03
const SHORT_TOLERANCE = 0.25

const AXES: readonly (readonly number[])[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

type Reading = {
  W: number[]
  plus: number[]
  minus: number[]
  linear: number[]
  offHusk: number
  iterations: number
}

function read(
  mesh: OpenMesh,
  rule: ReturnType<typeof stepRule>,
  record: OpenRecord,
): Reading {
  const h = SIDE / 2
  const rho = openContent(mesh, [
    { at: [0, 0, 0], units: CONTENT, to: [h, h, h] },
  ])
  const allow = huskOnly(mesh)
  const lines = placeOpenLines(mesh, rho, 1, allow)

  let offHusk = 0

  for (let m = 0; m < mesh.links; m++) {
    if (lines[m] !== 0 && mesh.kind[m] !== HUSK_LATERAL) {
      offHusk++
    }
  }

  const run = openStaticRun(mesh, rule, rho, BEATS, record, allow)
  const green = greenSolve(mesh, rho)
  const scale = -(Math.PI / DEPTH) * CONTENT
  const rs = Array.from({ length: R_MAX }, (_, i) => i + 1)
  const at = (
    x: ArrayLike<number>,
    r: number,
    axis: readonly number[],
  ): number =>
    x[
      huskDock(
        mesh,
        axis.map(v => v * r),
      )
    ]!
  const mean = (x: ArrayLike<number>, r: number): number =>
    AXES.reduce((t, a) => t + at(x, r, a), 0) / AXES.length

  return {
    W: rs.map(r => scale * mean(run.depth, r)),
    plus: rs.map(r => scale * at(run.depth, r, AXES[0]!)),
    minus: rs.map(r => scale * at(run.depth, r, AXES[1]!)),
    linear: rs.map(r => scale * mean(green.x, r)),
    offHusk,
    iterations: green.iterations,
  }
}

const forces = (W: readonly number[]): number[] =>
  W.slice(0, -1).map((w, i) => W[i + 1]! - w)

const slopeOf = (
  ys: readonly number[],
  xs: readonly number[],
): number => {
  const mx = xs.reduce((a, v) => a + v, 0) / xs.length
  const my = ys.reduce((a, v) => a + v, 0) / ys.length

  return (
    xs.reduce((a, v, i) => a + (v - mx) * (ys[i]! - my), 0) /
    xs.reduce((a, v) => a + (v - mx) ** 2, 0)
  )
}

export default experiment({
  id: 'gravity/shrink-husk-static',
  code: 'E-GRV-0100',
  title:
    "a husk backed by four shrinking layers keeps a long-range 1/r pull near the zero mode's share, with a positive short-range correction that falls as about 1/r and not as Randall-Sundrum II's 1/r^2, partial: exact and bounded (Gauss 0 off, no line off the husk, curl 0, 0 wraps, reversal bit for bit), the stack's fitted k is 0.02272, 0.549 of the husk alone's against the layered prediction's 0.566 and the zero mode's 16/31 = 0.516, but its long-range force runs 2 to 3 percent under the layered prediction (worst 3.08 against a 3 percent gate) and the control's husk-alone k is 0.04139, 1.04 percent under E-GRV-0090's 0.0418217 (gate 1); the correction is positive at every r and within 24 percent of the layered prediction on r = 4 .. 11 (0.34 and 0.15 at r = 4 and 8), log slope 1.16 against the layered 1.02 and RS's 1.87, a quarter to a half of RS's size there, because every dock beats one clock and the bulk's time is not warped",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const rule = stepRule(DEPTH, LEVELS)
    const record = newOpenRecord()

    // the control: the husk alone
    const alone = read(openMesh(SIDE, 0, 'shrink'), rule, record)

    log('alone')

    const mesh = openMesh(SIDE, LAYERS, 'shrink')
    const stack = read(mesh, rule, record)

    log('stack')

    // the prediction
    const modes = stackModes(mesh.sides)
    const share = modes[0]!.weight * 6
    const gAlone = (r: number): number => 1 / (24 * Math.PI * r)
    const gStack = (r: number): number => stackGreen(modes, r)
    const rs = Array.from({ length: R_MAX - 1 }, (_, i) => i + 1)
    const ratioPred = rs.map(
      r => (gStack(r) - gStack(r + 1)) / (gAlone(r) - gAlone(r + 1)),
    )
    const deltaPred = ratioPred.map(v => v / share - 1)
    const kRS = Math.LN2 / Math.sqrt(6)
    const deltaRS = rs.map(
      r =>
        (2 / (3 * kRS * kRS)) *
        ((r * r + r * (r + 1) + (r + 1) ** 2) / (r * r * (r + 1) ** 2)),
    )
    const fitOf = (W: readonly number[]): [number, number, number] =>
      fitPowers(
        FIT_R,
        FIT_R.map(r => W[r - 1]!),
        [1, 3],
      ) as [number, number, number]
    const fitPred = fitOf(
      Array.from({ length: R_MAX }, (_, i) => -gStack(i + 1)),
    )
    const fitPredAlone = fitOf(
      Array.from({ length: R_MAX }, (_, i) => -gAlone(i + 1)),
    )
    const fitRatioPred = fitPred[1] / fitPredAlone[1]

    // the readings
    const [c0Alone, c1Alone, c3Alone] = fitOf(alone.W)
    const [c0Stack, c1Stack, c3Stack] = fitOf(stack.W)
    const kAlone = -c1Alone
    const kStack = -c1Stack
    const fAlone = forces(alone.W)
    const fStack = forces(stack.W)
    const ratio = fStack.map((f, i) => f / fAlone[i]!)
    const delta = ratio.map(v => v / share - 1)
    const linearAgree = Math.max(
      ...[
        ...forces(alone.linear).map((f, i) =>
          Math.abs(fAlone[i]! / f - 1),
        ),
        ...forces(stack.linear).map((f, i) =>
          Math.abs(fStack[i]! / f - 1),
        ),
      ],
    )

    // gates
    const control =
      Math.abs(kAlone / RECORDED_0090_K - 1) <= CONTROL_TOLERANCE
    const wraps = record.wraps.fWraps + record.wraps.vWraps
    const r1 =
      record.gaussOff === 0 &&
      alone.offHusk === 0 &&
      stack.offHusk === 0 &&
      record.curl === 0 &&
      wraps === 0 &&
      record.maxStep < 1.5 &&
      record.maxRate < 1.5 &&
      record.maxRest <= rule.h &&
      record.reversed
    const rising = stack.W.every(
      (w, i) => i === 0 || w > stack.W[i - 1]!,
    )
    const fitRatio = kStack / kAlone
    const fitOff = Math.abs(fitRatio / fitRatioPred - 1)
    const longOff = Math.max(
      ...rs
        .filter(r => r >= LONG_FROM)
        .map(r => Math.abs(ratio[r - 1]! / ratioPred[r - 1]! - 1)),
    )
    const r2 =
      rising && fitOff <= FIT_TOLERANCE && longOff <= LONG_TOLERANCE
    const positive = delta.every(d => d > 0)
    const shortOff = Math.max(
      ...rs
        .filter(r => r >= SHORT_FROM && r <= SHORT_TO)
        .map(r => Math.abs(delta[r - 1]! / deltaPred[r - 1]! - 1)),
    )
    const r3 = positive && shortOff <= SHORT_TOLERANCE
    const lg = (xs: readonly number[]): number[] => xs.map(Math.log)
    const slope = (d: readonly number[]): number =>
      -slopeOf(lg(SLOPE_R.map(r => d[r - 1]!)), lg(SLOPE_R))
    const slopeMeasured = delta
      .slice(SLOPE_R[0]! - 1, SLOPE_R[SLOPE_R.length - 1])
      .every(d => d > 0)
      ? slope(delta)
      : -1
    const slopePred = slope(deltaPred)
    const slopeRS = slope(deltaRS)
    const status = !control
      ? 'partial'
      : r1 && r2 && r3
        ? 'pass'
        : 'fail'
    const f = (v: number): string => v.toPrecision(4)
    const e = (v: number): string => v.toExponential(3)
    const metrics: Record<string, number> = {
      gate_C0: control ? 1 : 0,
      gate_R1: r1 ? 1 : 0,
      gate_R2: r2 ? 1 : 0,
      gate_R3: r3 ? 1 : 0,
      side: SIDE,
      layers: LAYERS,
      docks: mesh.docks,
      links: mesh.links,
      layerSpacing: Math.sqrt(6),
      curvatureLength: 1 / kRS,
      zeroModeShare: share,
      kPredicted: RECORDED_0090_K * share,
      fitRatioPredicted: fitRatioPred,
      kAlone,
      kStack,
      fitRatio,
      fitOff,
      longOff,
      shortOff,
      slopeMeasured,
      slopePredicted: slopePred,
      slopeRS,
      linearAgree,
      runs: record.runs,
      beats: record.beats,
      gaussOff: record.gaussOff,
      gaussChecks: record.gaussChecks,
      curl: record.curl,
      curlChecks: record.curlChecks,
      wraps,
      maxStep: record.maxStep,
      maxRate: record.maxRate,
      maxRest: record.maxRest,
      offHusk: alone.offHusk + stack.offHusk,
      seconds: (Date.now() - started) / 1000,
    }

    modes.forEach((m, n) => {
      metrics[`mode${n}_mass`] = m.mass
      metrics[`mode${n}_weightOverZero`] = m.weight / modes[0]!.weight
    })

    rs.forEach(r => {
      metrics[`forceRatio_r${r}`] = ratio[r - 1]!
      metrics[`forceRatioPredicted_r${r}`] = ratioPred[r - 1]!
      metrics[`delta_r${r}`] = delta[r - 1]!
      metrics[`deltaPredicted_r${r}`] = deltaPred[r - 1]!
      metrics[`deltaRS_r${r}`] = deltaRS[r - 1]!
    })
    stack.W.forEach((w, i) => (metrics[`Wstack_r${i + 1}`] = w))
    alone.W.forEach((w, i) => (metrics[`Walone_r${i + 1}`] = w))

    const pick = [1, 2, 4, 8, 12, 16, 20, 23]

    return verdict({
      status,
      claim: `the bounded depth field on a side-${SIDE} husk backed by ${LAYERS} shrinking layers (sides ${mesh.sides.join(', ')}; layer spacing sqrt 6, curvature length ${f(1 / kRS)} husk docks), content lines on the husk to an antipodal sink: Gauss off ${record.gaussOff} in ${record.gaussChecks}, ${alone.offHusk + stack.offHusk} lines off the husk, curl ${record.curl}, ${wraps} wraps, largest step ${f(record.maxStep)}, reversal ${record.reversed}; the husk alone fits k = ${f(kAlone)} (E-GRV-0090 ${RECORDED_0090_K}); the stack fits k = ${f(kStack)}, ${f(fitRatio)} of the husk's against the layered prediction's ${f(fitRatioPred)} and the zero mode's ${f(share)} (k ${f(RECORDED_0090_K * share)}); W ${rising ? 'rises' : 'does NOT rise'} at every r; the force ratio to the husk alone is ${pick.map(r => `${f(ratio[r - 1]!)} (${f(ratioPred[r - 1]!)})`).join(', ')} at r = ${pick.join(', ')} (predicted in brackets), within ${e(longOff)} at r = ${LONG_FROM} .. 23; the correction delta = ${pick.map(r => f(delta[r - 1]!)).join(', ')} against the layered ${pick.map(r => f(deltaPred[r - 1]!)).join(', ')} (within ${e(shortOff)} at r = ${SHORT_FROM} .. ${SHORT_TO}) and Randall-Sundrum II's ${pick.map(r => f(deltaRS[r - 1]!)).join(', ')}, log slope ${f(slopeMeasured)} on r = 4 .. 8 (layered ${f(slopePred)}, RS ${f(slopeRS)}); the rule's force equals the linear solve's to ${e(linearAgree)}`,
      metrics,
      control: { kAlone, control: control ? 1 : 0 },
      notes: `L2. Gates C0 ${control}, R1 ${r1}, R2 ${r2} (rising ${rising}, fit ratio off ${e(fitOff)}, long range off ${e(longOff)}), R3 ${r3} (positive ${positive}, short range off ${e(shortOff)}). Fits c0 - k/r - b/r^3 on r = 4 .. 16: alone c0 ${e(c0Alone)} k ${e(kAlone)} b ${e(-c3Alone)}; stack c0 ${e(c0Stack)} k ${e(kStack)} b ${e(-c3Stack)}. Stack W +x ${stack.plus.slice(0, 8).map(e).join(' ')}; -x ${stack.minus.slice(0, 8).map(e).join(' ')}. Modes (mass, weight over zero mode): ${modes.map(m => `${m.mass.toFixed(4)}:${(m.weight / modes[0]!.weight).toFixed(4)}`).join(' ')}. Force ratio r = 1 .. 23: ${ratio.map(f).join(' ')}; predicted ${ratioPred.map(f).join(' ')}. Linear solve iterations ${alone.iterations}, ${stack.iterations}.`,
    })
  },
})
