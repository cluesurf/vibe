// The warped clock, static (E-GRV-0102): E-GRV-0100's husk backed by four shrinking layers, with the bulk's time warped
// with its scale (code/rule/open-husk warpClock): a layer-k dock is 2^k husk docks across and its proper time runs 2^-k
// as fast as the husk's, so the lapse falls with depth exactly as the spatial scale grows, as in Randall-Sundrum's warp
// (note/project/vibe/roadmap/research/discrete-gravity.md, "The fix: warp the clock with the scale"). E-GRV-0100 read a
// short-range correction of hyperbolic 4-space's shape (log slope 1.16, RS II's 1.87) and E-GRV-0101 a front at 1.26 to
// 1.40 c; the note's claim is that one cause, the unwarped bulk clock, makes both, and that warping it gives RS's shape.
//
// THE SCHEDULE (code/rule/open-husk, its header gives the full statement): every dock beats every husk beat, but a
// layer-k dock's one division is by Q 4^k instead of Q, its remainder carried in a window of Q 4^k values. With
// tau = t / 2^k this is the dock's own equation d^2 x / d tau^2 = kappa (rho - div F) read in husk beats. Exactly
// reversible (nothing is dropped), bounded (the widest window is Q 4^4 = 76,032 values), one leapfrog.
//
// THE DERIVATION, before any run (code/measure/open-husk stackLayers / stackModes / stackSpeeds; tmp/warp-probe1.log):
//  - THE STATIC WEIGHTS DO NOT SEE THE CLOCK. A static field has v = 0 on every dock, so it solves div F = rho with F / g
//    a gradient: L_g x = rho, the weighted Laplacian of the LINK WEIGHTS, whatever divides the rate. The warp changes
//    only the inertia (per husk dock, m_k = 8^-k becomes 2^-k). So the warped stack's static weights are the one-clock
//    stack's: lateral s_k = 6 / 2^k (e^(-ky)), vertical c_k = 8^-k (e^(-3ky)), hyperbolic 4-space's, NOT RS's e^(-2ky),
//    e^(-4ky). In the continuum this is the lapse N entering the wave equation d_t (N^-1 sqrt(g) d_t x) =
//    d_i (N sqrt(g) g^ij d_j x) only OUTSIDE the spatial derivative: RS's static problem has N INSIDE it (sqrt(-g) g^ij
//    carries N), which is the link weights, and a clock cannot reach them.
//  - so the warped zero mode's share of the husk alone's 1/r is the one-clock stack's, 1 / (2 - 2^-4) = 16 / 31 =
//    0.51613, and the massive modes are the same: masses 0.0682, 0.1515, 0.3200, 0.7308 a husk dock, weights 0.0610,
//    0.0994, 0.2193, 0.5578 of the zero mode's. The c0 - k / r - b / r^3 fit on r = 4 .. 16 reads 0.5655 of the husk
//    alone's k, and the correction delta = 0.3634, 0.1793, 0.1124 at r = 4, 8, 12, log slope 1.020 on r = 4 .. 8;
//  - THE CURVATURE LENGTH is the one-clock stack's: isotropy at the husk sets the layer spacing l = sqrt 6 = 2.449 husk
//    docks, k = ln 2 / sqrt 6 = 0.2830 a husk dock (1 / k = 3.534);
//  - AGAINST RS II: its force correction 2 / (3 k^2) (3 r^2 + 3 r + 1) / (r^2 (r + 1)^2) at that k is 1.270, 0.3485,
//    0.1604 at r = 4, 8, 12, log slope 1.865; the warped prediction is 0.29, 0.51, 0.70 of it with slope 1.02. So the
//    clock ALONE IS PREDICTED NOT TO GIVE RS's SHAPE. (RS's own scalar sum, before the brane bending's 2/3, is 1 / (k^2
//    r^2), half again larger.) What would: the lapse inside the link weights too, lateral and vertical of layer k
//    times 2^-k and inertia 2^k ('lapse' in stackLayers, theory only, no rule runs it): zero-mode share 256 / 341 =
//    0.751, delta 0.090, 0.032 at r = 4, 8, log slope 1.51, a twentieth of RS's size at this coarse a layering (spacing
//    2.91, 1 / k = 4.2 husk docks).
//  - what the clock DOES change is the dynamics: s_k = 6 m_k layer by layer, so every mode obeys omega^2 = c^2 (p^2 +
//    mass^2), the zero mode at c exactly (one clock: 1.302 c), each layer's waves at c (one clock: 2^k c). That is
//    E-GRV-0103's question.
//
// THE COMPARISON RUN: the one-clock stack (E-GRV-0100's rule, the same mesh, run here again, not recorded) beside the
// warped one on the same box, and the husk alone as the ratio's denominator (bit for bit E-GRV-0100's husk alone, whose
// k is 0.04139; E-GRV-0100's C0 against E-GRV-0090's 0.0418217 failed on that same number by a hair, so it is reported
// here and not gated again).
//
// DISCLOSED PROBES (instrument only, no W read before the gates were fixed): tmp/warp-probe1.log (the derivation above),
// tmp/warp-probe2.log (a warped side-16 and side-32 stack reverse bit for bit over 256 beats with every remainder in its
// window, 0 wraps; a beat of the side-64 stack costs 40 ms).
//
// GATES, fixed before the first run of this file. D 16, three digits, side 64, four shrinking layers, a content-4 source
// at the origin and its sink at the antipode, the Hann average of 2048 beats from zero field, W(r) = -(pi / D) 4 x(r)
// averaged over the six axis docks at r, F(r) = W(r + 1) - W(r) (E-GRV-0100's reading, unchanged).
//  W0 the derivation's claim, that the clock leaves the statics alone: the warped stack's force equals the one-clock
//     stack's within 1e-3 at every r = 1 .. 23, and each equals the linear solve's (the one L_g) within 1e-3.
//  W1 exact and bounded: in all three runs Gauss 0 off on every dock after every beat, no line off the husk, curl 0 on
//     every check, 0 wraps, every remainder in its own window, |step| and |rate| under 3/2, every run reverses bit for bit.
//  W2 the long-range k: the warped stack's W rises at every r = 1 .. 24, and its fitted k over the husk alone's (c0 - k / r
//     - b / r^3 on r = 4 .. 16) is within 3 percent of the warped prediction's 0.5655 (the zero mode's 16 / 31 with the
//     massive modes' tail). A KNIFE EDGE, stated: W0 predicts E-GRV-0100's static field, whose fit read 2.9 percent off.
//  W3 the correction against the warped prediction: delta(r) = (F_warped / F_alone) / (16 / 31) - 1 positive at every
//     r = 1 .. 23 and within 25 percent of the warped prediction at every r = 4 .. 11. REPORTED: its log slope on r = 4
//     .. 8 against the warped 1.020.
//  W3RS the correction against Randall-Sundrum II: log slope on r = 4 .. 8 within 0.25 of RS's 1.865, and delta within
//     25 percent of RS's at every r = 4 .. 11. PREDICTED TO FAIL (above).
// Verdict: pass if W0 to W3RS hold; fail otherwise.
//
// FIRST RUN (tmp/warp-static-run1.log; 1,046 s, the record): fail on W3RS, as derived; no gate moved. W0 holds: the
// warped stack's force equals the one-clock stack's to 5.0e-5 at every r and the linear solve's to 1.2e-4 (one clock
// 1.6e-4), so the clock leaves the statics alone. W1 holds: Gauss 0 off in 6,144 beat checks, no line off the husk, curl
// 0, 0 wraps, every remainder in its window (widest used 38,008 of 76,032), largest step 0.452, all three runs reverse
// bit for bit. W2 holds on the stated knife edge: k = 0.02272, 0.5489 of the husk alone's 0.04139 against 0.5655, 2.94
// percent off against 3 (the one-clock stack 0.5489 too). W3 holds: delta positive at every r, 0.3375, 0.1504, 0.0826 at
// r = 4, 8, 12 against the prediction's 0.3634, 0.1793, 0.1124, within 24.0 percent on r = 4 .. 11. W3RS fails: log
// slope 1.165 (the one-clock stack's 1.165, the prediction's 1.020) against RS's 1.865, size 0.27 .. 0.54 of RS's on
// r = 4 .. 11 (off by up to 73 percent). Title written after the run.
//
// Depth L2: a known construction (a massless scalar on a brane backed by a layered bulk) run as an integer reversible
// rule on bounded registers, with a comparison run. DETERMINISM: every start and source is placed; nothing is drawn.
// NOTHING MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fitPowers } from '@/code/measure/husk-coulomb'
import { linearFit } from '@/code/measure/regression'
import { stepRule } from '@/code/rule/step-depth'
import {
  HUSK_LATERAL,
  huskOnly,
  openMesh,
  placeOpenLines,
  warpClock,
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
  stackSpeeds,
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
const SHORT_FROM = 4
const SHORT_TO = 11
const SLOPE_R: readonly number[] = [4, 5, 6, 7, 8]
const SAME_TOLERANCE = 1e-3
const FIT_TOLERANCE = 0.03
const SHORT_TOLERANCE = 0.25
const SLOPE_TOLERANCE = 0.25
const RS_TOLERANCE = 0.25

const AXES: readonly (readonly number[])[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

type Reading = { W: number[]; linear: number[]; offHusk: number }

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
  const mean = (x: ArrayLike<number>, r: number): number =>
    AXES.reduce(
      (t, a) =>
        t +
        x[
          huskDock(
            mesh,
            a.map(v => v * r),
          )
        ]!,
      0,
    ) / AXES.length

  return {
    W: rs.map(r => scale * mean(run.depth, r)),
    linear: rs.map(r => scale * mean(green.x, r)),
    offHusk,
  }
}

const forces = (W: readonly number[]): number[] =>
  W.slice(0, -1).map((w, i) => W[i + 1]! - w)
const logSlope = (d: readonly number[]): number =>
  -linearFit({
    xs: SLOPE_R.map(Math.log),
    ys: SLOPE_R.map(r => Math.log(d[r - 1]!)),
  }).slope
const worst = (
  a: readonly number[],
  b: readonly number[],
  rs: readonly number[],
): number =>
  Math.max(...rs.map(r => Math.abs(a[r - 1]! / b[r - 1]! - 1)))

export default experiment({
  id: 'gravity/warp-husk-static',
  code: 'E-GRV-0102',
  title:
    "warping the bulk's clock with its scale leaves the static pull exactly as it was, so the short-range correction keeps hyperbolic 4-space's shape and not Randall-Sundrum II's, fail on W3RS as derived: a static field has no rate, so it solves the link weights' Laplacian whatever divides the rate, and the warped stack's force equals the one-clock stack's to 5.0e-5 and the linear solve's to 1.2e-4; exact and bounded (Gauss 0 off, no line off the husk, curl 0, 0 wraps, every remainder in its window, reversal bit for bit); k is 0.549 of the husk alone's against the prediction's 0.566 (2.9 percent, gate 3); the correction is positive, 0.34 and 0.15 at r = 4 and 8 (within 24 percent of the prediction), log slope 1.16 against RS's 1.87 and 0.27 to 0.54 of RS's size; RS's shape needs the lapse inside the link weights as well (theory: slope 1.51)",
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

    const alone = read(openMesh(SIDE, 0, 'shrink'), rule, record)

    log('alone')

    const one = openMesh(SIDE, LAYERS, 'shrink')
    const oneClock = read(one, rule, record)

    log('one clock')

    const mesh = warpClock(one)
    const warped = read(mesh, rule, record)

    log('warped')

    // the prediction, from the geometry alone
    const modes = stackModes(mesh.sides, 'clock')
    const share = modes[0]!.weight * 6
    const lapseModes = stackModes(mesh.sides, 'lapse')
    const speeds = stackSpeeds(mesh.sides, 'clock')
    const speedsOne = stackSpeeds(mesh.sides, 'none')
    const gAlone = (r: number): number => 1 / (24 * Math.PI * r)
    const rs = Array.from({ length: R_MAX - 1 }, (_, i) => i + 1)
    const ratioOf = (g: (r: number) => number): number[] =>
      rs.map(r => (g(r) - g(r + 1)) / (gAlone(r) - gAlone(r + 1)))
    const deltaPred = ratioOf(r => stackGreen(modes, r)).map(
      v => v / share - 1,
    )
    const lapseShare = lapseModes[0]!.weight * 6
    const deltaLapse = ratioOf(r => stackGreen(lapseModes, r)).map(
      v => v / lapseShare - 1,
    )
    const kRS = Math.LN2 / Math.sqrt(6)
    const deltaRS = rs.map(
      r =>
        (2 / (3 * kRS * kRS)) *
        ((3 * r * r + 3 * r + 1) / (r * r * (r + 1) ** 2)),
    )
    const fitOf = (W: readonly number[]): [number, number, number] =>
      fitPowers(
        FIT_R,
        FIT_R.map(r => W[r - 1]!),
        [1, 3],
      ) as [number, number, number]
    const fitRatioPred =
      fitOf(
        Array.from(
          { length: R_MAX },
          (_, i) => -stackGreen(modes, i + 1),
        ),
      )[1] /
      fitOf(Array.from({ length: R_MAX }, (_, i) => -gAlone(i + 1)))[1]

    // the readings
    const kAlone = -fitOf(alone.W)[1]
    const kWarped = -fitOf(warped.W)[1]
    const kOne = -fitOf(oneClock.W)[1]
    const fAlone = forces(alone.W)
    const fWarped = forces(warped.W)
    const fOne = forces(oneClock.W)
    const ratio = fWarped.map((f, i) => f / fAlone[i]!)
    const delta = ratio.map(v => v / share - 1)
    const deltaOne = fOne.map((f, i) => f / fAlone[i]! / share - 1)

    // gates
    const warpedVsOne = worst(fWarped, fOne, rs)
    const warpedVsLinear = worst(fWarped, forces(warped.linear), rs)
    const oneVsLinear = worst(fOne, forces(oneClock.linear), rs)
    const aloneVsLinear = worst(fAlone, forces(alone.linear), rs)
    const w0 =
      warpedVsOne <= SAME_TOLERANCE &&
      warpedVsLinear <= SAME_TOLERANCE &&
      oneVsLinear <= SAME_TOLERANCE
    const wraps = record.wraps.fWraps + record.wraps.vWraps
    const offHusk = alone.offHusk + oneClock.offHusk + warped.offHusk
    const w1 =
      record.gaussOff === 0 &&
      offHusk === 0 &&
      record.curl === 0 &&
      wraps === 0 &&
      record.restOff === 0 &&
      record.maxStep < 1.5 &&
      record.maxRate < 1.5 &&
      record.reversed
    const rising = warped.W.every(
      (w, i) => i === 0 || w > warped.W[i - 1]!,
    )
    const fitRatio = kWarped / kAlone
    const fitOff = Math.abs(fitRatio / fitRatioPred - 1)
    const w2 = rising && fitOff <= FIT_TOLERANCE
    const positive = delta.every(d => d > 0)
    const shortR = rs.filter(r => r >= SHORT_FROM && r <= SHORT_TO)
    const shortOff = worst(delta, deltaPred, shortR)
    const w3 = positive && shortOff <= SHORT_TOLERANCE
    const slopeMeasured = SLOPE_R.every(r => delta[r - 1]! > 0)
      ? logSlope(delta)
      : -1
    const slopeOne = SLOPE_R.every(r => deltaOne[r - 1]! > 0)
      ? logSlope(deltaOne)
      : -1
    const slopePred = logSlope(deltaPred)
    const slopeRS = logSlope(deltaRS)
    const slopeLapse = logSlope(deltaLapse)
    const rsOff = worst(delta, deltaRS, shortR)
    const w3rs =
      positive &&
      Math.abs(slopeMeasured - slopeRS) <= SLOPE_TOLERANCE &&
      rsOff <= RS_TOLERANCE
    const status = w0 && w1 && w2 && w3 && w3rs ? 'pass' : 'fail'
    const f = (v: number): string => v.toPrecision(4)
    const e = (v: number): string => v.toExponential(3)
    const pick = [1, 2, 4, 8, 12, 16, 20, 23]
    const metrics: Record<string, number> = {
      gate_W0: w0 ? 1 : 0,
      gate_W1: w1 ? 1 : 0,
      gate_W2: w2 ? 1 : 0,
      gate_W3: w3 ? 1 : 0,
      gate_W3RS: w3rs ? 1 : 0,
      side: SIDE,
      layers: LAYERS,
      docks: mesh.docks,
      links: mesh.links,
      layerSpacing: Math.sqrt(6),
      curvature: kRS,
      curvatureLength: 1 / kRS,
      zeroModeShare: share,
      lapseZeroModeShare: lapseShare,
      zeroModeSpeedWarped: speeds.zeroMode,
      zeroModeSpeedOneClock: speedsOne.zeroMode,
      fastestLayerWarped: Math.max(...speeds.layer),
      fastestLayerOneClock: Math.max(...speedsOne.layer),
      fitRatioPredicted: fitRatioPred,
      kAlone,
      kOneClock: kOne,
      kWarped,
      fitRatio,
      fitRatioOneClock: kOne / kAlone,
      fitOff,
      warpedVsOne,
      warpedVsLinear,
      oneVsLinear,
      aloneVsLinear,
      shortOff,
      rsOff,
      slopeMeasured,
      slopeOneClock: slopeOne,
      slopePredicted: slopePred,
      slopeRS,
      slopeLapse,
      runs: record.runs,
      beats: record.beats,
      gaussOff: record.gaussOff,
      gaussChecks: record.gaussChecks,
      curl: record.curl,
      curlChecks: record.curlChecks,
      wraps,
      restOff: record.restOff,
      maxStep: record.maxStep,
      maxRate: record.maxRate,
      maxRest: record.maxRest,
      offHusk,
      seconds: (Date.now() - started) / 1000,
    }

    modes.forEach((m, n) => {
      metrics[`mode${n}_mass`] = m.mass
      metrics[`mode${n}_weightOverZero`] = m.weight / modes[0]!.weight
    })

    rs.forEach(r => {
      metrics[`forceRatio_r${r}`] = ratio[r - 1]!
      metrics[`delta_r${r}`] = delta[r - 1]!
      metrics[`deltaOneClock_r${r}`] = deltaOne[r - 1]!
      metrics[`deltaPredicted_r${r}`] = deltaPred[r - 1]!
      metrics[`deltaRS_r${r}`] = deltaRS[r - 1]!
      metrics[`deltaLapse_r${r}`] = deltaLapse[r - 1]!
    })
    warped.W.forEach((w, i) => (metrics[`Wwarped_r${i + 1}`] = w))

    return verdict({
      status,
      claim: `the bounded depth field on a side-${SIDE} husk backed by ${LAYERS} shrinking layers whose clocks are warped with their scale (a layer-k dock divides by Q 4^k), content lines on the husk to an antipodal sink: Gauss off ${record.gaussOff} in ${record.gaussChecks}, ${offHusk} lines off the husk, curl ${record.curl}, ${wraps} wraps, ${record.restOff} remainders out of their window, largest step ${f(record.maxStep)}, reversal ${record.reversed}; the warped stack's force equals the one-clock stack's to ${e(warpedVsOne)} and the linear solve's to ${e(warpedVsLinear)} (one clock ${e(oneVsLinear)}), so the clock leaves the statics as derived; the warped stack fits k = ${f(kWarped)}, ${f(fitRatio)} of the husk alone's ${f(kAlone)} against the prediction's ${f(fitRatioPred)} (zero mode ${f(share)}), off ${e(fitOff)}; W ${rising ? 'rises' : 'does NOT rise'} at every r; the correction delta = ${pick.map(r => f(delta[r - 1]!)).join(', ')} at r = ${pick.join(', ')} against the warped prediction ${pick.map(r => f(deltaPred[r - 1]!)).join(', ')} (off ${e(shortOff)} at r = ${SHORT_FROM} .. ${SHORT_TO}) and Randall-Sundrum II's ${pick.map(r => f(deltaRS[r - 1]!)).join(', ')} (off ${e(rsOff)}), log slope ${f(slopeMeasured)} on r = 4 .. 8 (warped prediction ${f(slopePred)}, one clock measured ${f(slopeOne)}, RS ${f(slopeRS)}, the lapse in the links too ${f(slopeLapse)})`,
      metrics,
      control: { warpedVsOne, w0: w0 ? 1 : 0 },
      notes: `L2. Gates W0 ${w0}, W1 ${w1}, W2 ${w2} (rising ${rising}, fit off ${e(fitOff)}), W3 ${w3} (positive ${positive}, off ${e(shortOff)}), W3RS ${w3rs} (slope ${f(slopeMeasured)} against ${f(slopeRS)}, size off ${e(rsOff)}). Speeds in c: warped zero mode ${f(speeds.zeroMode)}, layers ${speeds.layer.map(f).join(' ')}; one clock zero mode ${f(speedsOne.zeroMode)}, layers ${speedsOne.layer.map(f).join(' ')}. Husk alone against its linear solve ${e(aloneVsLinear)}. Force ratio warped r = 1 .. 23: ${ratio.map(f).join(' ')}. delta one clock: ${deltaOne.map(f).join(' ')}. delta with the lapse in the links (theory): ${deltaLapse.map(f).join(' ')}, share ${f(lapseShare)}.`,
    })
  },
})
