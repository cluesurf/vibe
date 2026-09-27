// The lapse in the links (E-GRV-0105): E-GRV-0102's husk backed by four shrinking layers, with the lapse 2^-k carried
// INSIDE the link weights as well as the clock (code/rule/open-husk lapseLinks), as Randall-Sundrum's action carries it
// (sqrt(-g) g^ij). E-GRV-0102 found that the warped clock alone cannot reach the static shape (a static field has no
// rate), and derived what would: layer k's lateral and vertical weights times 2^-k and its inertia times 2^k.
//
// THE RULE (code/rule/open-husk lapseLinks, its header gives the full statement): a layer-e link stores its step 2^e
// times finer, so it takes the unlapsed mesh weight's step exactly and the depth is still found by summing F~ / g; a
// layer-e dock's one division is by Q 4^e (warpClock's) of 2^e rho - sum sign F~ 2^(e - e_link), every factor a whole
// number. No new register; exactly reversible; bounded. A VERTICAL link carries its UPPER dock's lapse 2^-k, since the
// midpoint's 2^-(k + 1/2) is not a ratio of integers.
//
// THE DERIVATION, before any run (code/measure/open-husk stackLayers 'lapse_upper' and 'lapse', warpedLayering;
// tmp/lapse-probe1.log, tmp/lapse-probe2.log, theory only, plus a side-16 lapsed stack reversing bit for bit over 512
// beats with 0 wraps):
//  - per husk dock s_k = 6 / 4^k, m_k = 4^-k (so s_k = 6 m_k: every mode runs at c, as with the clock), c_k = 16^-k:
//    RS's e^(-2ky), e^(-4ky) sampled at the upper face of slabs of spacing sqrt 6, k = ln 2 / sqrt 6 = 0.2830 a dock;
//  - THE ZERO MODE'S SHARE of the husk alone's 1/r is s_0 / sum s_k = 256 / 341 = 0.7507 (the vertical weights do not
//    enter it); with the massive modes' tail the c0 - k / r - b / r^3 fit on r = 4 .. 16 reads 0.7542;
//  - THE CORRECTION delta(r) = (F_lapse / F_alone) / (256 / 341) - 1, for the rule's weights: 0.0694, 0.0232, 0.0112 at
//    r = 4, 8, 12, log slope 1.578 on r = 4 .. 8. E-GRV-0102's 'lapse' (the vertical at the midpoint's lapse) was 0.0899,
//    0.0316, 0.0157, slope 1.513: the upper face couples the layers more strongly, so the massive modes are heavier
//    (0.098 .. 0.935 a dock against 0.082 .. 0.787) and the correction smaller. GATED against the rule's own weights;
//    the midpoint's is reported;
//  - AGAINST RS II at k = 0.2830: its 2 / (3 k^2 r^2) in the force form, 1.270, 0.3485, 0.1604 at r = 4, 8, 12, slope
//    1.865, is 18 times the rule's prediction at r = 4 and 14 times at r = 12. WHAT WOULD REACH IT (theory,
//    warpedLayering: the same profile cut into n slabs a doubling at the same k): delta at r = 4 is 0.070, 0.162,
//    0.239, 0.288, 0.315, 0.329 for n = 1, 2, 4, 8, 16, 32 (slope 1.54 falling to 1.30): the coarse layering holds a
//    fifth of its own continuum's correction. And the continuum itself (n = 32) is 0.17, 0.25, 0.31 of RS's scalar
//    1 / (k r)^2 (force form) at r = 4, 8, 12, because k r is only 1.1 .. 3.4 there: in the potential form its
//    delta times (k r)^2 rises 0.20, 0.29, 0.34, 0.39, 0.42, 0.44, 0.45 at r = 4, 8, 12, 20, 30, 45, 60, toward a half
//    of RS's scalar coefficient (a one-sided bulk, and no brane bending, which gives RS's 2/3). So reaching RS's number
//    at r = 4 .. 12 needs both a fine layering (8 or more slabs a doubling, layers of 2^(1/8) the scale, not whole-dock
//    octrees) and distances of k r >> 1 (r >> 3.5 docks).
//  - the front: s_k = 6 m_k, so the rod front (E-GRV-0104's witness) is predicted at c, as on the warped stack.
//
// GATES, fixed before the first run of this file. D 16, three digits, side 64, four shrinking layers, a content-4 source
// at the origin and its sink at the antipode, the Hann average of 2048 beats from zero field, W(r) = -(pi / D) 4 x(r)
// averaged over the six axis docks at r, F(r) = W(r + 1) - W(r) (E-GRV-0102's reading, unchanged):
//  L0 exact and bounded: in both static runs Gauss 0 off on every dock after every beat, no line off the husk, curl 0 on
//     every check, 0 wraps, every remainder in its own window, |step| and |rate| under 3/2, every run reverses bit for bit.
//  L1 the rule solves the lapsed statics: the lapsed stack's force equals the linear solve's (the Laplacian of the link
//     weights times 2^-e, a second method) within 1e-3 at every r = 1 .. 23.
//  L2 the long-range k: W rises at every r = 1 .. 24, and the fitted k over the husk alone's is within 3 percent of the
//     zero mode's 256 / 341 = 0.7507.
//  L3 the correction: delta positive at every r = 1 .. 12, and within 25 percent of the rule's prediction at every
//     r = 4 .. 11. REPORTED: its log slope on r = 4 .. 8 against 1.578, the midpoint's prediction, RS II's size and slope.
//  L4 the front: E-GRV-0104's rod front (the rod of 8 unit docks, the hop after beat 32, 160 beats, d = 2 .. 24 behind
//     it, fitted on d = 4 .. 20) on the lapsed stack reads c within 2 percent and never above 1.02 c, the runs exact
//     (Gauss 0 off, 0 wraps, remainders in window, reversal bit for bit).
// Verdict: pass if L0 to L4 hold; fail otherwise. RS II's shape is REPORTED and not gated: derived far off (above).
//
// FIRST RUN (tmp/lapse-static-run1.log; 408 s, the record): fail on L2 and L3; no gate moved. L0 holds: Gauss 0 off in
// 4,096 beat checks, no line off the husk, curl 0, 0 wraps, every remainder in its window (widest used 38,014 of
// 76,032), largest step 0.452, both runs reverse bit for bit. L1 holds: the lapsed rule's force equals the lapsed
// linear solve's to 7.1e-5, so the rule solves exactly the statics it was built to. L4 holds: the rod front on the
// lapsed stack reads 1.003 c (half 0.982, tenth 1.053), its level behind the front 0.73 .. 0.77 of the husk's height.
// L2 fails: k = 0.03005, 0.7261 of the husk alone's 0.04139 against 256 / 341 = 0.7507, 3.28 percent under against 3
// (the fit of the prediction 0.7542). The force ratio levels at 0.723 .. 0.730 on r = 12 .. 23, not at 0.751. L3 fails
// as a consequence: delta = (ratio / 0.7507) - 1 is 0.204, 0.129, 0.042 at r = 1, 2, 4 against the prediction's 0.235,
// 0.154, 0.069, turns negative from r = 7 and levels at -0.03, the size of the long-range deficit; its log slope cannot
// be read. WHAT IT SAYS: the rule and the linear solve agree to 7e-5, so the deficit is in the PREDICTION, the smooth
// layer model (each layer continuous in its plane, stackModes), against the actual lattice stack on the side-64 torus.
// The same model sat 2.9 percent over the one-clock and warped stacks too (E-GRV-0100, 0102: 0.549 against 0.5655), so it
// is one systematic of the model of about 3 percent in the long-range level, not the lapse; unresolved here (candidates:
// the periodic box, whose images the smooth model omits, and the coarse layers' own lattice, side 4 at the deepest). A
// 3 percent error in the level swamps a correction of 0.02 to 0.07, so on this box the lapse's correction cannot be
// resolved at r >= 5; where it can (r = 1 .. 4) it is 0.6 .. 0.9 of the prediction and 0.03 of RS II's.
//
// Depth L2: a known construction (a massless scalar on a brane backed by a warped layered bulk) run as an integer
// reversible rule on bounded registers. DETERMINISM: every start and source is placed; nothing is drawn. NOTHING MOVES:
// each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fitPowers } from '@/code/measure/husk-coulomb'
import { linearFit } from '@/code/measure/regression'
import { lightSpeed } from '@/code/measure/varying-depth-light'
import { stepRule } from '@/code/rule/step-depth'
import { HUSK_LATERAL, huskOnly, lapseLinks, openMesh, placeOpenLines, type OpenMesh } from '@/code/rule/open-husk'
import { greenSolve, huskDock, layeredModes, newOpenRecord, openContent, openStaticRun, rodFront, stackGreen, stackModes, stackSpeeds, warpedLayering, type OpenRecord } from '@/code/measure/open-husk'

const DEPTH = 16
const LEVELS = 3
const SIDE = 64
const LAYERS = 4
const BEATS = 2048
const CONTENT = 4
const R_MAX = 24
const FIT_R: readonly number[] = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
const SHORT_FROM = 4
const SHORT_TO = 11
const POSITIVE_TO = 12
const SLOPE_R: readonly number[] = [4, 5, 6, 7, 8]
const SAME_TOLERANCE = 1e-3
const FIT_TOLERANCE = 0.03
const SHORT_TOLERANCE = 0.25
const ZERO_MODE_SHARE = 256 / 341
const FRONT_TOLERANCE = 0.02
const NEVER_FASTER = 1.02
const FRONT = { rod: 8, units: 1, hopAt: 32, window: 160, distances: Array.from({ length: 23 }, (_, i) => i + 2), fit: Array.from({ length: 17 }, (_, i) => i + 4) }
const FINE: readonly number[] = [1, 2, 4, 8, 16, 32]

const AXES: readonly (readonly number[])[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]

type Reading = { W: number[]; linear: number[]; offHusk: number }

function read(mesh: OpenMesh, rule: ReturnType<typeof stepRule>, record: OpenRecord): Reading {
  const h = SIDE / 2
  const rho = openContent(mesh, [{ at: [0, 0, 0], units: CONTENT, to: [h, h, h] }])
  const allow = huskOnly(mesh)
  const lines = placeOpenLines(mesh, rho, 1, allow)
  let offHusk = 0

  for (let m = 0; m < mesh.links; m++) if (lines[m] !== 0 && mesh.kind[m] !== HUSK_LATERAL) offHusk++

  const run = openStaticRun(mesh, rule, rho, BEATS, record, allow)
  const green = greenSolve(mesh, rho)
  const scale = -(Math.PI / DEPTH) * CONTENT
  const rs = Array.from({ length: R_MAX }, (_, i) => i + 1)
  const mean = (x: ArrayLike<number>, r: number): number => AXES.reduce((t, a) => t + x[huskDock(mesh, a.map(v => v * r))]!, 0) / AXES.length

  return { W: rs.map(r => scale * mean(run.depth, r)), linear: rs.map(r => scale * mean(green.x, r)), offHusk }
}

const forces = (W: readonly number[]): number[] => W.slice(0, -1).map((w, i) => W[i + 1]! - w)
const logSlope = (d: readonly number[]): number => -linearFit({ xs: SLOPE_R.map(Math.log), ys: SLOPE_R.map(r => Math.log(d[r - 1]!)) }).slope
const worst = (a: readonly number[], b: readonly number[], rs: readonly number[]): number => Math.max(...rs.map(r => Math.abs(a[r - 1]! / b[r - 1]! - 1)))

export default experiment({
  id: 'gravity/lapse-husk-static',
  code: 'E-GRV-0105',
  title:
    "the lapse carried inside the link weights as well as the clock, built as an exact rule (a layer-k step stored 2^k times finer, one division by Q 4^k, no new register), solves its lapsed statics to 7.1e-5 and keeps the pull's front at 1.003 c, but its long-range k is 0.726 of the husk alone's against the zero mode's 256/341 = 0.751, 3.28 percent under against a 3 percent gate, fail on L2 and L3: the smooth layer model sits about 3 percent over the lattice stack here as it did for the one-clock and warped stacks (0.549 against 0.566), and that level error swamps the correction, which reads 0.20, 0.13, 0.04 at r = 1, 2, 4 against the prediction's 0.24, 0.15, 0.07 and turns negative from r = 7; RS II's 2/(3 k^2 r^2) is 18 times the predicted correction at r = 4, and the same profile in 32 slabs a doubling still reaches only a quarter of it there because k r is near 1; exact and bounded, reversal bit for bit",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${(Date.now() - started) / 1000}s`)
    const rule = stepRule(DEPTH, LEVELS)
    const c = lightSpeed(DEPTH)
    const record = newOpenRecord()

    const alone = read(openMesh(SIDE, 0, 'shrink'), rule, record)

    log('alone')

    const mesh = lapseLinks(openMesh(SIDE, LAYERS, 'shrink'))
    const lapsed = read(mesh, rule, record)

    log('lapsed')

    const frontRecord = newOpenRecord()
    const front = rodFront(mesh, rule, FRONT, frontRecord, c)

    log('front')

    // the prediction, from the geometry alone
    const modes = stackModes(mesh.sides, 'lapse_upper')
    const share = modes[0]!.weight * 6
    const midModes = stackModes(mesh.sides, 'lapse')
    const speeds = stackSpeeds(mesh.sides, 'lapse_upper')
    const gAlone = (r: number): number => 1 / (24 * Math.PI * r)
    const rs = Array.from({ length: R_MAX - 1 }, (_, i) => i + 1)
    const ratioOf = (g: (r: number) => number): number[] => rs.map(r => (g(r) - g(r + 1)) / (gAlone(r) - gAlone(r + 1)))
    const deltaOf = (m: typeof modes): number[] => ratioOf(r => stackGreen(m, r)).map(v => v / (m[0]!.weight * 6) - 1)
    const deltaPred = deltaOf(modes)
    const deltaMid = deltaOf(midModes)
    const kRS = Math.LN2 / Math.sqrt(6)
    const deltaRS = rs.map(r => (2 / (3 * kRS * kRS)) * ((3 * r * r + 3 * r + 1) / (r * r * (r + 1) ** 2)))
    const fine = FINE.map(n => {
      const L = warpedLayering(kRS, n, 1e-6)

      return deltaOf(layeredModes(L.stiff, L.conduct))
    })
    const fitOf = (W: readonly number[]): [number, number, number] => fitPowers(FIT_R, FIT_R.map(r => W[r - 1]!), [1, 3]) as [number, number, number]
    const fitRatioPred = fitOf(Array.from({ length: R_MAX }, (_, i) => -stackGreen(modes, i + 1)))[1] / fitOf(Array.from({ length: R_MAX }, (_, i) => -gAlone(i + 1)))[1]

    // the readings
    const kAlone = -fitOf(alone.W)[1]
    const kLapsed = -fitOf(lapsed.W)[1]
    const fAlone = forces(alone.W)
    const fLapsed = forces(lapsed.W)
    const ratio = fLapsed.map((f, i) => f / fAlone[i]!)
    const delta = ratio.map(v => v / share - 1)

    // gates
    const wraps = record.wraps.fWraps + record.wraps.vWraps
    const offHusk = alone.offHusk + lapsed.offHusk
    const l0 = record.gaussOff === 0 && offHusk === 0 && record.curl === 0 && wraps === 0 && record.restOff === 0 && record.maxStep < 1.5 && record.maxRate < 1.5 && record.reversed
    const lapsedVsLinear = worst(fLapsed, forces(lapsed.linear), rs)
    const aloneVsLinear = worst(fAlone, forces(alone.linear), rs)
    const l1 = lapsedVsLinear <= SAME_TOLERANCE
    const rising = lapsed.W.every((w, i) => i === 0 || w > lapsed.W[i - 1]!)
    const fitRatio = kLapsed / kAlone
    const fitOff = Math.abs(fitRatio / ZERO_MODE_SHARE - 1)
    const l2 = rising && fitOff <= FIT_TOLERANCE
    const positive = rs.filter(r => r <= POSITIVE_TO).every(r => delta[r - 1]! > 0)
    const shortR = rs.filter(r => r >= SHORT_FROM && r <= SHORT_TO)
    const shortOff = worst(delta, deltaPred, shortR)
    const l3 = positive && shortOff <= SHORT_TOLERANCE
    const frontRatio = front.speedThird / c
    const frontWraps = frontRecord.wraps.fWraps + frontRecord.wraps.vWraps
    const l4 = Math.abs(frontRatio - 1) <= FRONT_TOLERANCE && frontRatio <= NEVER_FASTER && frontRecord.gaussOff === 0 && frontWraps === 0 && frontRecord.restOff === 0 && frontRecord.reversed && front.reversed
    const slopeMeasured = SLOPE_R.every(r => delta[r - 1]! > 0) ? logSlope(delta) : -1
    const slopePred = logSlope(deltaPred)
    const slopeMid = logSlope(deltaMid)
    const slopeRS = logSlope(deltaRS)
    const midOff = worst(delta, deltaMid, shortR)
    const rsShare = shortR.map(r => delta[r - 1]! / deltaRS[r - 1]!)
    const status = l0 && l1 && l2 && l3 && l4 ? 'pass' : 'fail'
    const f = (v: number): string => v.toPrecision(4)
    const e = (v: number): string => v.toExponential(3)
    const pick = [1, 2, 4, 8, 12, 16, 20, 23]
    const metrics: Record<string, number> = {
      gate_L0: l0 ? 1 : 0,
      gate_L1: l1 ? 1 : 0,
      gate_L2: l2 ? 1 : 0,
      gate_L3: l3 ? 1 : 0,
      gate_L4: l4 ? 1 : 0,
      side: SIDE,
      layers: LAYERS,
      docks: mesh.docks,
      links: mesh.links,
      curvature: kRS,
      zeroModeShare: share,
      zeroModeShareStated: ZERO_MODE_SHARE,
      fitRatioPredicted: fitRatioPred,
      kAlone,
      kLapsed,
      fitRatio,
      fitOff,
      lapsedVsLinear,
      aloneVsLinear,
      shortOff,
      midOff,
      slopeMeasured,
      slopePredicted: slopePred,
      slopeMidpoint: slopeMid,
      slopeRS,
      rsShareLeast: Math.min(...rsShare),
      rsShareMost: Math.max(...rsShare),
      zeroModeSpeed: speeds.zeroMode,
      fastestLayer: Math.max(...speeds.layer),
      frontThirdRatio: frontRatio,
      frontHalfRatio: front.speedHalf / c,
      frontTenthRatio: front.speedTenth / c,
      frontOffset: front.offset,
      runs: record.runs,
      beats: record.beats,
      gaussOff: record.gaussOff,
      gaussChecks: record.gaussChecks,
      curl: record.curl,
      wraps,
      restOff: record.restOff,
      maxStep: record.maxStep,
      maxRate: record.maxRate,
      maxRest: record.maxRest,
      offHusk,
      frontGaussOff: frontRecord.gaussOff,
      frontWraps,
      frontRestOff: frontRecord.restOff,
      seconds: (Date.now() - started) / 1000,
    }

    modes.forEach((m, n) => {
      metrics[`mode${n}_mass`] = m.mass
      metrics[`mode${n}_weightOverZero`] = m.weight / modes[0]!.weight
    })
    rs.forEach(r => {
      metrics[`forceRatio_r${r}`] = ratio[r - 1]!
      metrics[`delta_r${r}`] = delta[r - 1]!
      metrics[`deltaPredicted_r${r}`] = deltaPred[r - 1]!
      metrics[`deltaMidpoint_r${r}`] = deltaMid[r - 1]!
      metrics[`deltaRS_r${r}`] = deltaRS[r - 1]!
    })
    FINE.forEach((n, i) => {
      metrics[`deltaFine${n}_r4`] = fine[i]![3]!
      metrics[`deltaFine${n}_r8`] = fine[i]![7]!
      metrics[`deltaFine${n}_r12`] = fine[i]![11]!
    })
    lapsed.W.forEach((w, i) => (metrics[`Wlapsed_r${i + 1}`] = w))
    front.third.forEach((t, i) => (metrics[`frontThird_d${FRONT.distances[i]}`] = t))

    return verdict({
      status,
      claim: `the bounded depth field on a side-${SIDE} husk backed by ${LAYERS} shrinking layers with the lapse 2^-k inside the link weights and the clock (a layer-k link's step stored 2^k times finer, a layer-k dock dividing by Q 4^k), content lines on the husk to an antipodal sink: Gauss off ${record.gaussOff} in ${record.gaussChecks}, ${offHusk} lines off the husk, curl ${record.curl}, ${wraps} wraps, ${record.restOff} remainders out of window, largest step ${f(record.maxStep)}, reversal ${record.reversed}; its force equals the lapsed linear solve's to ${e(lapsedVsLinear)}; k = ${f(kLapsed)}, ${f(fitRatio)} of the husk alone's ${f(kAlone)} against the zero mode's 256/341 = ${f(ZERO_MODE_SHARE)} (off ${e(fitOff)}; the fit of the prediction ${f(fitRatioPred)}); W ${rising ? 'rises' : 'does NOT rise'} at every r; the correction delta = ${pick.map(r => f(delta[r - 1]!)).join(', ')} at r = ${pick.join(', ')} against the rule's prediction ${pick.map(r => f(deltaPred[r - 1]!)).join(', ')} (off ${e(shortOff)} on r = ${SHORT_FROM} .. ${SHORT_TO}), the midpoint lapse's ${pick.map(r => f(deltaMid[r - 1]!)).join(', ')} (off ${e(midOff)}) and RS II's ${pick.map(r => f(deltaRS[r - 1]!)).join(', ')} (${f(Math.min(...rsShare))} .. ${f(Math.max(...rsShare))} of it on r = 4 .. 11), log slope ${f(slopeMeasured)} (rule ${f(slopePred)}, midpoint ${f(slopeMid)}, RS ${f(slopeRS)}); the same profile cut into 1, 2, 4, 8, 16, 32 slabs a doubling predicts delta(4) = ${fine.map(d => f(d[3]!)).join(', ')}; the rod front reads ${f(frontRatio)} c (half ${f(front.speedHalf / c)}, tenth ${f(front.speedTenth / c)}; zero mode derived ${f(speeds.zeroMode)} c)`,
      metrics,
      control: { aloneVsLinear, kAlone },
      notes: `L2. Gates L0 ${l0}, L1 ${l1} (${e(lapsedVsLinear)}), L2 ${l2} (rising ${rising}, fit off ${e(fitOff)}), L3 ${l3} (positive ${positive}, off ${e(shortOff)}), L4 ${l4} (${f(frontRatio)} c, reversal ${frontRecord.reversed && front.reversed}, Gauss ${frontRecord.gaussOff}, wraps ${frontWraps}, rest off ${frontRecord.restOff}). Husk alone against its linear solve ${e(aloneVsLinear)}. Force ratio r = 1 .. 23: ${ratio.map(f).join(' ')}. delta: ${delta.map(f).join(' ')}. Predicted: ${deltaPred.map(f).join(' ')}. Front third, d = 2 .. 24: ${front.third.map(t => t.toFixed(2)).join(' ')}; plateau ${front.plateau.map(x => x.toFixed(3)).join(' ')}. Widest remainder ${record.maxRest}. Survey ${((Date.now() - started) / 1000).toFixed(1)} s.`,
    })
  },
})
