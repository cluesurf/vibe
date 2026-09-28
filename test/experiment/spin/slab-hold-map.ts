// A HOLDING MAP FOR THREE HOLES ON THE SLAB: WHERE, IN STRING TENSION AND MIXER ANGLE, DOES THE COMPOSITE HOLD
// (E-SPN-0139)? note/research/vibe/roadmap/remaining-pieces.md, "Three holes on a 2d slab (E-SPN-0135)", "The
// Pauli-blocked mixer (E-SPN-0130)", "1, the joint limit (E-SPN-0113)"; discrete-gravity.md, the Klein note under
// "the contact restored (E-SPN-0108)" and "the string sets the coin (E-SPN-0109)". E-SPN-0135 found three holes bound
// by the route-free Steiner string at pi/7 a link unbind under the frame mixer at every angle down to 14 deg. The lead:
// the Klein effect. This file derives when the composite should hold, maps it over (sigma, theta) on the slab, and, if
// no joint path holds, tries a bag.
//
// DERIVED BEFORE THE RUN (code/measure/slab-hold-map header).
// 1. THE KLEIN GAP. On one line a hole is a Dirac walk of mass m0 = pi/3 (cos w = cos m0 cos k): bands 60 deg wide,
//    gaps 2 m0 = 120 deg. The mixer lifts only the dock's uniform slot mode, by theta, and at K = 0 that mode is a sum
//    of the two lines' band-edge states, so it enters the gap: the lone hole's smallest gap in the slab is
//    2 pi/3 - theta (tmp/holdmap-probe1.log, the 4 x 4 Bloch beat on a 48 x 48 K grid: 105.5 deg at 14.36, 90.5 at
//    28.96, 59.5 at 60, closed at the working 120). Its Dirac mass is m(theta) = pi/3 - theta/2. So the mixer does not
//    make the hole light at small theta (m falls 12% at 14 deg); it makes it MASSLESS at the working angle.
// 2. THE HOLDING CONDITION. A phase potential of slope sigma = pi/N (N = 2 D + 1) confines no Dirac particle: every
//    level is a resonance emptied by Landau-Zener (Schwinger) passage through the gap, exp(-pi m^2/sigma) =
//    exp(-N m(theta)^2) per passage. E-SPN-0113's reading, no fitted constant: held iff N m(theta)^2 >= ln(1/TAIL) =
//    6.908. THE DERIVED BOUNDARY is sigma_c(theta) = pi m(theta)^2 / 6.908, a parabola in theta that is 0.4986 at theta
//    0 (E-SPN-0113's N >= 6.30) and vanishes as (2 pi/3 - theta)^2 at the working angle. Its exponent: sigma_c scales as
//    m(theta)^2, so N_c = 6.908 / m^2 and d ln N_c / d ln m = -2. On the grid (tmp/holdmap-predict.log, exponent and its
//    ratio to 6.908):
//         rate   theta     D 1          D 2          D 3                D 6
//         0      0         3.29 no      5.48 no      7.68 (1.11) HELD   14.26 HELD
//         1/64   7.17 deg  2.91 no      4.85 no      6.79 (0.98) edge   12.60 HELD
//         1/32   10.14     2.76 no      4.60 no      6.43 (0.93) no     11.95 HELD
//         1/16   14.36     2.55 no      4.25 no      5.95 (0.86) no     11.05 HELD
//         1/8    20.36     2.27 no      3.78 no      5.29 no            9.83 HELD
//         1/4    28.96     1.89 no      3.16 no      4.42 no            8.21 (1.19) HELD
//    So D 3 holds at rate 0 only (D 3 at 1/64 is within 5% of the boundary and is not gated), D 6 holds at every rate,
//    D 1 and 2 nowhere, and rate 3 at no D (m = 0). DISCLOSED: E-SPN-0135 had already run the D 3 column at rates 1/16
//    and up (all failing) when this was derived, so that column is consistent, not blind. The blind parts are D 1, 2,
//    6 and the rates 1/64, 1/32.
// 3. THE WINDOW. The level must also fit the w = 12 window with tail (V >= 10) under 1e-3. The one-line level's
//    shells fall about a decade per two links at D 3 (E-SPN-0135 C0: 3.3e-5 at V 10); the Airy decay exponent scales as
//    sigma^(1/2), so at D 6 (sigma 7/13 as large) the weight at V 10 is about 5e-4: predicted to fit, by a factor of
//    two only. A D 6 failure with the tail rising from beat 1 is the window's, not Klein's.
// 4. THE JOINT PATH AND ITS INERTIA. The joint path is a chain of held points with the rate strictly falling toward 0
//    and D never falling (sigma never rising): along it m(theta)^2/sigma only grows. The Klein model predicts the D 6
//    column is such a path (5 points). But as theta -> 0 at fixed sigma, a hole reaches the other line only through the
//    mixer, so the composite's inertia ACROSS the line grows without bound, and along the line it is the one-line
//    trio's (m*/E_rest 73 at D 3). So M3 is predicted to FAIL on any path here: theta -> 0 is the wrong limit for
//    inertia. Unlike E-SPN-0113, where the constituents became light (the fine coin), m0 = pi/3 is fixed, and the only
//    thing that lowers the Dirac mass is the mixer angle, which the holding condition pushes the other way.
// 5. THE BAG (step 3 of the task, run only if M2 fails). The string raises the Dirac mass inside: the mixer runs at
//    rate `inside` on every hole of a configuration with V > 0 and at the working rate 3 where V = 0
//    (code/measure/slab-hold-map bagStep). A lone hole has V = 0 always, so it is E-SPN-0130's free hole bit for bit;
//    a composite's members see m(inside). Predicted: with inside 1/16 it holds where the grid's (D, 1/16) holds, i.e. at
//    D 6 and not at D 3. A stand-in caveat, stated: in the rule a lone hole carries a Z3 charge and drags a string
//    (E-SPN-0109's objection); the three-body window has no string for one hole.
//
// THE READING. E-SPN-0135's procedure (code/measure/slab-holes holdLevel, window w = 12 absorbing, dominant Ritz level
// over 120 beats, held iff fidelity >= 0.99 AND tail (escaped + weight at V >= 10) <= 1e-3 at every one of 128 beats),
// with ONE change fixed before the run: the level is FOLLOWED in the rate. At each D the start at rate 0 is
// E-SPN-0104's level at that D (coined-line-bloch lineLightest, box 12) carried by G onto both lines; at each later
// rate the start is the level vector read at the rate before. E-SPN-0135's dominant readings from the placed start had
// start weights 0.04 to 0.80 and residuals 0.48 to 0.99 (not levels); a followed start is the nearest level. The
// placed start at (D 3, 1/16) is re-run as a check on the instrument. Tensors: code/measure/slab-holes slabTensor at
// kappa pi/32, 240 beats, as E-SPN-0135 H2. One-line curvature c1(D): Richardson (kappa pi/64, 240 beats) of the
// line window's level.
//
// GATES, fixed before the run.
//  M1 THE SHAPE. On every grid point whose exponent is not within 5% of 6.908, held equals the Klein prediction (23 of
//     the 24 points, 4 D x 6 rates counting rate 0, the D 3 at 1/64 point excluded). Measured boundary exponent reported: at
//     each rate the boundary N_c is the geometric mean of the largest failing and the smallest holding N when both
//     exist; p is the least-squares slope of ln N_c on ln m(theta) over those rates (predicted -2); NaN if fewer than
//     two rates have an interior boundary.
//  M2 THE PATH. The longest joint path (code/measure/slab-hold-map longestJointPath) over the held points with rate > 0
//     has at least 3 points, and at every one of them the 2 x 2 tensor's eigenvalues have one sign and each is at
//     least 0.1 |c1(D)| / 2 in size (E-SPN-0135 H2's share). The tensor and isotropy lambda_min/lambda_max at the best
//     held point (highest least fidelity) are reported.
//  M3 THE INERTIA (only if M2). Along the path, toward the joint limit (rate falling), m*/E_rest (m* = 1 / |mean
//     eigenvalue|, E_rest = |the level's Ritz energy|, E-SPN-0135's convention) falls strictly, and its last value is
//     nearer the lone hole's value at that rate (read the same way) than its first.
//  B  THE BAG (only if M2 fails). B1 held at D 3 or D 6; B2 at a held D the tensor passes M2's test; B3 the lone hole
//     under the bag beat equals the free beat at rate 3 bit for bit over 16 beats and its tensor equals the free one.
// CONTROLS (a failed control makes the verdict partial).
//  CR rate 0 reproduces E-SPN-0135's one-line level: at D 3, rate 0, the slab level holds and its energy equals
//     E-SPN-0135's C0 energy 0.3300172637259596 to 1e-9.
//  CC the cost off reproduces E-SPN-0135's contact-bound level: at rate 0, the placed D 3 start, least fidelity and
//     largest tail equal E-SPN-0135's 0.9999986380622382 and 6.114256105783575e-6 to 1e-9 relative.
// CHECKS: held + escaped = 1 to 1e-10 and antisymmetry to 1e-12 at the end of every hold; the placed start at (3, 1/16)
//  reproduces E-SPN-0135's least fidelity 0.6892365250233201 to 1e-9 relative; the bag beat with inside = outside
//  equals slabBeat bit for bit on one beat of a slab state.
// Verdict: partial if a control or check fails; pass if M1, M2 and M3 hold; fail otherwise. The bag is its own gate B,
// reported in the claim.
//
// FIRST RUN (tmp/holdmap-exp-run1.log, 989 s): FAIL, no gate moved. Every control and check holds: CR (E
// 0.330017263726011 against 0.3300172637259596), CC (0.9999986380622382 and 6.114256105783575e-6, equal), the placed
// (3, 1/16) start reproduces E-SPN-0135's 0.6892365250233201 exactly, norm 8.9e-13, antisymmetry 2.2e-13, the bag at
// equal rates equals slabBeat bit for bit.
//  - M1 FAILS, 5 of 23 gated points. Held: D 3 and D 6 at rate 0 only. The Klein model is right on D 1, D 2 and D 3
//    (D 2 at rate 0 misses by the tail alone, 5.4e-3 against its predicted exp(-5.48) = 4.2e-3) and wrong on every D 6
//    point with the mixer on: least fidelity 0.897, 0.147, 0.425, 0.079, 0.0055 and largest tail 0.060, 0.21, 0.36,
//    0.54, 0.70 at rates 1/64 to 1/4. The boundary exponent is not readable (one rate has an interior boundary).
//  - READ, NOT GATED: the weaker string does WORSE under the mixer, the opposite of Klein. At rate 1/64 the tail is
//    0.29 (D 1), 0.077 (D 2), 3.3e-3 (D 3), 0.060 (D 6): D 3, the strongest string that holds at rate 0, is nearest to
//    holding (fidelity 0.929, the knife point not gated). So the mixer's leak is not Zener passage through the gap,
//    which the weaker string suppresses. It is a perturbation of amplitude about theta/4 per beat against a binding
//    whose energy scale shrinks as sigma^(2/3), and holding would need theta small against that scale: the boundary
//    should run theta_c rising with sigma, not falling. Not derived before the run, so it is a lead, not a result.
//  - M2 FAILS: no held point with the mixer on, so no path and no tensor. M3 fails with it (not read).
//  - B FAILS on B1: inside 1/16, outside 3. D 3 least fidelity 0.856, tail 0.020 (the grid's (3, 1/16) is 0.715 and
//    0.026, so the bag helps a little), D 6 0.468 and 0.349. B3 holds: the lone hole under the bag is the free hole at
//    rate 3 bit for bit (gap 0, tensor gap 0). So the bag keeps the free hole free and does not hold the composite,
//    because at 1/16 the inside angle is already one that does not hold.
//  - AN INSTRUMENT ODDITY, gating nothing: c1(D) read 19.86, -0.0177, 0.635, -0.0358 at D 1, 2, 3, 6, where E-SPN-0135
//    read 0.0415 at D 3 on the reflecting box. On the absorbing window the dominant Ritz level at K = +-pi/64 is not
//    always the K = 0 level, so these are not the band's curvature. c1 enters only M2's threshold, never read here.
//
// Depth L2: a stand-in (floats, the holes' beat derived from the rule's pieces, the register replaced by the Steiner
// length, the geometry cut to a slab), with a derived prediction that could fail and controls that can fail.
// DETERMINISM: no random numbers; every start is placed or followed. NOTHING MOVES: the cost is a phase, the coin, the
// contact and the mixer hand values between slots of one dock, the stream takes each value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLightest, wholeBasis, type LineSector } from '@/code/measure/coined-line-bloch'
import { ritzLevels, type Ritz } from '@/code/measure/frame-meson'
import {
  addSlab,
  emptyState,
  energyAtSlab,
  holdLevel,
  normalizedSlab,
  placeLine,
  richardsonCurvature,
  slabBeat,
  slabSpace,
  slabTensor,
  thetaOfRate,
  type SlabHold,
  type SlabSpace,
  type SlabSpec,
  type SlabState,
} from '@/code/measure/slab-holes'
import { bagStep, freeStep, holdLevelBy, kleinMass, kleinPrediction, longestJointPath, tensorBy } from '@/code/measure/slab-hold-map'

const CUT = 12
const DS = [1, 2, 3, 6]
const RATES = [0, 1 / 64, 1 / 32, 1 / 16, 1 / 8, 1 / 4]
const RITZ_T = 120
const CURVE_T = 240
const HOLD_BEATS = 128
const FIDELITY = 0.99
const TAIL = 1e-3
const TAIL_FROM = 10
const KAPPA_SLAB = Math.PI / 32
const KAPPA_LINE = Math.PI / 64
const KNIFE = 0.05
const PATH_MIN = 3
const CURVE_SHARE = 0.1
const WORKING = 3
const BAG_INSIDE = 1 / 16
const BAG_DS = [3, 6]
const LONE_KAPPA = 0.01
const LONE_BEATS = 16
const C0_ENERGY = 0.3300172637259596
const C0_SAME = 1e-9
const CN_FIDELITY = 0.9999986380622382
const CN_TAIL = 6.114256105783575e-6
const PLACED_FIDELITY = 0.6892365250233201
const RECORD_SAME = 1e-9
const NORM_SAME = 1e-10
const ANTI_SAME = 1e-12

type C = [number, number]
type Point = { D: number; rate: number; hold: SlabHold; predicted: boolean; margin: number; exponent: number }
type Tensor = ReturnType<typeof slabTensor>

const ritz = (c: readonly C[]): Ritz[] => ritzLevels(c)

export default experiment({
  id: 'spin/slab-hold-map',
  code: 'E-SPN-0139',
  title:
    "a holding map for three holes on the slab over string tension (pi/3, pi/5, pi/7, pi/13 a link) and mixer rate (0, 1/64 to 1/4) does not follow the Klein-gap criterion N m(theta)^2 >= ln 1000 (m = pi/3 - theta/2, the lone hole's measured slab gap 2 pi/3 - theta), fail (M1, M2, B): the composite holds only with the mixer off (D 3 and D 6), the criterion is right on D 1 to 3 and wrong on all 5 D 6 points with the mixer on (least fidelity 0.90 to 0.0055, tail 0.06 to 0.70), and the weaker string does worse (tail at rate 1/64: 0.29, 0.077, 3.3e-3, 0.060 at D 1, 2, 3, 6), so the leak is not Zener passage; no joint path, no tensor; a bag (inside rate 1/16, outside the working 3) keeps the lone hole free bit for bit but holds nothing (D 3 fidelity 0.856, tail 0.020); E-SPN-0135's one-line and contact-bound levels reproduced exactly",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
    const holdInput = { ritzBeats: RITZ_T, holdBeats: HOLD_BEATS, fidelity: FIDELITY, tail: TAIL, tailFrom: TAIL_FROM, ritz }
    const base: SlabSpec = { holes: 3, axes: 2, cut: CUT, rate: 0, D: 3, cost: 'steiner', boundary: 'absorb' }
    const slab = slabSpace(base)
    const lineW = slabSpace({ ...base, axes: 1 })
    const at = (space: SlabSpace, over: Partial<SlabSpec>): SlabSpace => ({ ...space, spec: { ...space.spec, ...over } })
    const holds: SlabHold[] = []
    const keep = (h: SlabHold): SlabHold => (holds.push(h), h)
    const drop = (h: SlabHold): void => {
      h.vector = emptyState({ ...slab, configs: 0 })
    }

    // ---- the grid ----
    const points: Point[] = []
    const c1: Record<number, number> = {}
    const lineHeld: Record<number, SlabHold> = {}
    let placed316: SlabHold | undefined
    let cc: SlabHold | undefined

    for (const D of DS) {
      const sector: LineSector = { flavors: [0, 0, 0], statistics: 'fermion', D, box: CUT, unit: 0 }
      const basis = lineBasis(sector)
      const level = lineLightest(basis, wholeBasis(basis)).lightest
      const entries = basis.configs.map((ts, i) => ({ ts, amp: [level.cre[i] as number, level.cim[i] as number] as C }))
      const placed = (): SlabState => normalizedSlab(addSlab(placeLine(slab, 0, entries), placeLine(slab, 1, entries)))

      // the one-line window's level and its curvature c1(D)
      const lw = at(lineW, { D })
      const lh = keep(holdLevel(lw, normalizedSlab(placeLine(lw, 0, entries)), holdInput))

      lineHeld[D] = lh
      c1[D] = richardsonCurvature(K => energyAtSlab(lw, [K, 0], lh.vector, CURVE_T, ritz), KAPPA_LINE).curvature
      log(`D ${D} level, line c1 ${c1[D]}`)

      let start = placed()

      for (const rate of RATES) {
        const h = keep(holdLevel(at(slab, { D, rate }), start, holdInput))
        const pr = kleinPrediction(D, rate, TAIL)

        points.push({ D, rate, hold: h, predicted: pr.held, margin: pr.margin, exponent: pr.exponent })
        start = h.vector
        log(`D ${D} rate ${rate}: held ${h.held} min fidelity ${h.minFidelity} max tail ${h.maxTail} E ${h.level.energy} weight ${h.level.weight}`)
      }

      if (D === 3) {
        placed316 = keep(holdLevel(at(slab, { D, rate: 1 / 16 }), placed(), holdInput))
        drop(placed316)
        cc = keep(holdLevel(at(slab, { D, rate: 0, cost: 'none' }), placed(), holdInput))
        drop(cc)
        log('D 3 checks')
      }

      // free the vectors no later step can read: only a held point with rate > 0 (a path candidate) and the bag's
      // starts are kept
      for (const p of points) if (p.D === D && !(p.hold.held && p.rate > 0) && !(p.rate === BAG_INSIDE && BAG_DS.includes(D))) drop(p.hold)
    }

    const heldPositive = points.filter(p => p.hold.held && p.rate > 0)
    const path = longestJointPath(heldPositive)

    // ---- M1 ----
    const gated = points.filter(p => Math.abs(p.margin - 1) >= KNIFE)
    const disagree = gated.filter(p => p.hold.held !== p.predicted)
    const M1 = disagree.length === 0
    const boundary: { rate: number; Nc: number; m: number }[] = []

    for (const rate of RATES) {
      const col = points.filter(p => p.rate === rate)
      const fails = col.filter(p => !p.hold.held).map(p => 2 * p.D + 1)
      const holdsN = col.filter(p => p.hold.held).map(p => 2 * p.D + 1)

      if (fails.length === 0 || holdsN.length === 0) continue

      const lo = Math.max(...fails.filter(n => n < Math.min(...holdsN)), -Infinity)
      const hi = Math.min(...holdsN)

      if (Number.isFinite(lo)) boundary.push({ rate, Nc: Math.sqrt(lo * hi), m: kleinMass(thetaOfRate(rate)) })
    }

    let exponent = Number.NaN

    if (boundary.length >= 2) {
      const xs = boundary.map(b => Math.log(b.m))
      const ys = boundary.map(b => Math.log(b.Nc))
      const mx = xs.reduce((a, b) => a + b, 0) / xs.length
      const my = ys.reduce((a, b) => a + b, 0) / ys.length
      const sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0)

      exponent = sxx > 0 ? xs.reduce((a, x, k) => a + (x - mx) * ((ys[k] as number) - my), 0) / sxx : Number.NaN
    }

    log('M1')

    // ---- M2 and M3 ----
    const tensors = new Map<Point, Tensor>()

    for (const p of path) {
      tensors.set(p, slabTensor(at(slab, { D: p.D, rate: p.rate }), p.hold.vector, KAPPA_SLAB, CURVE_T, ritz))
      log(`tensor D ${p.D} rate ${p.rate}`)
    }

    const passes = (t: Tensor, D: number): boolean => {
      const [a, b] = t.eigen as [number, number]

      return a !== 0 && Math.sign(a) === Math.sign(b) && Math.abs(a) >= (CURVE_SHARE * Math.abs(c1[D] as number)) / 2 && Math.abs(b) >= (CURVE_SHARE * Math.abs(c1[D] as number)) / 2
    }
    const passing = path.filter(p => passes(tensors.get(p) as Tensor, p.D))
    const M2 = path.length >= PATH_MIN && passing.length === path.length
    const best = path.length ? path.reduce((a, b) => (b.hold.minFidelity > a.hold.minFidelity ? b : a)) : undefined
    const bestTensor = best ? tensors.get(best) : undefined
    const isotropy = bestTensor ? Math.min(...bestTensor.eigen.map(Math.abs)) / Math.max(...bestTensor.eigen.map(Math.abs)) : Number.NaN

    // the lone hole at each rate: tensor and energy
    const loneSpace = slabSpace({ holes: 1, axes: 2, cut: 0, rate: 0, D: 3, cost: 'steiner', boundary: 'absorb' })
    const loneRaw = emptyState(loneSpace)

    ;[1, 1, -1, -1].forEach((a, k) => (loneRaw.re[k] = a))

    const loneStart = normalizedSlab(loneRaw)
    const loneAt = new Map<number, Tensor>()

    for (const rate of [...RATES.filter(r => r > 0), WORKING]) loneAt.set(rate, slabTensor(at(loneSpace, { rate }), loneStart, LONE_KAPPA, RITZ_T, ritz))

    const ratioOf = (t: Tensor): number => 1 / Math.abs((t.eigen[0]! + t.eigen[1]!) / 2) / Math.abs(t.energy)
    const along = path.map(p => ({ p, ratio: ratioOf(tensors.get(p) as Tensor), lone: ratioOf(loneAt.get(p.rate) as Tensor) }))
    const falls = along.every((x, k) => k === 0 || x.ratio < (along[k - 1] as { ratio: number }).ratio)
    const nearer = along.length >= 2 && Math.abs(along[along.length - 1]!.ratio - along[along.length - 1]!.lone) < Math.abs(along[0]!.ratio - along[0]!.lone)
    const M3 = M2 && falls && nearer

    log('M2 M3')

    // ---- the bag, only if M2 fails ----
    const bag: { D: number; hold: SlabHold; tensor?: Tensor }[] = []
    let loneBagGap = Number.NaN
    let loneBagTensorGap = Number.NaN
    let bagSameGap = Number.NaN

    if (!M2) {
      for (const D of BAG_DS) {
        const space = at(slab, { D })
        const from = points.find(p => p.D === D && p.rate === BAG_INSIDE) as Point
        const h = keep(holdLevelBy(space, bagStep(space, BAG_INSIDE, WORKING), from.hold.vector, holdInput))
        const t = h.held ? tensorBy(bagStep(space, BAG_INSIDE, WORKING), h.vector, KAPPA_SLAB, CURVE_T, ritz) : undefined

        bag.push({ D, hold: h, tensor: t })
        log(`bag D ${D}: held ${h.held} min fidelity ${h.minFidelity} max tail ${h.maxTail}`)
      }

      // the lone hole under the bag and under the free mixer at the working rate
      const lw = at(loneSpace, { rate: WORKING })
      const bs = bagStep(lw, BAG_INSIDE, WORKING)
      const fs = freeStep(lw)
      let a: SlabState = { re: Float64Array.from(loneStart.re), im: Float64Array.from(loneStart.im) }
      let b: SlabState = { re: Float64Array.from(loneStart.re), im: Float64Array.from(loneStart.im) }

      loneBagGap = 0
      for (let t = 0; t < LONE_BEATS; t++) {
        a = bs([0.3, -0.2], a, { escaped: 0 })
        b = fs([0.3, -0.2], b, { escaped: 0 })
        for (let k = 0; k < a.re.length; k++) loneBagGap = Math.max(loneBagGap, Math.abs((a.re[k] as number) - (b.re[k] as number)), Math.abs((a.im[k] as number) - (b.im[k] as number)))
      }

      const lt = tensorBy(bs, loneStart, LONE_KAPPA, RITZ_T, ritz)
      const ft = loneAt.get(WORKING) as Tensor

      loneBagTensorGap = Math.max(...lt.eigen.map((x, k) => Math.abs(x - (ft.eigen[k] as number))))
      log('bag lone')
    }

    // the bag beat with inside = outside against slabBeat, one beat of a D 3 slab level (the rate 1/16 vector)
    {
      const space = at(slab, { D: 3, rate: 1 / 16 })
      const v = (points.find(p => p.D === 3 && p.rate === 1 / 16) as Point).hold.vector
      const a = bagStep(space, 1 / 16, 1 / 16)([0.1, 0.05], { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }, { escaped: 0 })
      const b = slabBeat(space, [0.1, 0.05], { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }, { escaped: 0 })

      bagSameGap = 0
      for (let k = 0; k < a.re.length; k++) bagSameGap = Math.max(bagSameGap, Math.abs((a.re[k] as number) - (b.re[k] as number)), Math.abs((a.im[k] as number) - (b.im[k] as number)))
    }

    const bagHeld = bag.filter(x => x.hold.held)
    const B1 = bagHeld.length > 0
    const B2 = bagHeld.some(x => x.tensor !== undefined && passes(x.tensor, x.D))
    const B3 = loneBagGap === 0 && loneBagTensorGap <= 1e-12
    const B = !M2 && B1 && B2 && B3

    // ---- controls and checks ----
    const r03 = points.find(p => p.D === 3 && p.rate === 0) as Point
    const CR = r03.hold.held && Math.abs(r03.hold.level.energy - C0_ENERGY) <= C0_SAME
    const ccHold = cc as SlabHold
    const CC = Math.abs(ccHold.minFidelity - CN_FIDELITY) <= RECORD_SAME * CN_FIDELITY && Math.abs(ccHold.maxTail - CN_TAIL) <= RECORD_SAME * CN_TAIL
    const p316 = placed316 as SlabHold
    const placedGap = Math.abs(p316.minFidelity - PLACED_FIDELITY) / PLACED_FIDELITY
    const normGap = Math.max(...holds.map(h => h.normGap))
    const antiGap = Math.max(...holds.map(h => h.antisymmetry))
    const checked = normGap <= NORM_SAME && antiGap <= ANTI_SAME && placedGap <= RECORD_SAME && bagSameGap === 0
    const status = !CR || !CC || !checked ? 'partial' : M1 && M2 && M3 ? 'pass' : 'fail'

    // ---- report ----
    const deg = (r: number): string => `${((thetaOfRate(r) * 180) / Math.PI).toFixed(2)}`
    const rateName = (r: number): string => (r === 0 ? '0' : `1/${Math.round(1 / r)}`)
    const tensorText = (t: Tensor | undefined): string => (t ? `[[${t.tensor.map(r => r.map(x => x.toFixed(6)).join(', ')).join('], [')}]] eigen ${t.eigen.map(x => x.toFixed(6)).join(', ')} E ${t.energy.toFixed(6)}` : 'not read')
    const cellText = (p: Point): string => `D ${p.D} rate ${rateName(p.rate)} (${deg(p.rate)} deg): ${p.hold.held ? 'HELD' : 'not held'} (predicted ${p.predicted ? 'held' : 'not'}, exponent ${p.exponent.toFixed(3)}, ratio ${p.margin.toFixed(3)}${Math.abs(p.margin - 1) < KNIFE ? ', edge, not gated' : ''}) least fidelity ${p.hold.minFidelity.toFixed(5)} largest tail ${p.hold.maxTail.toExponential(2)} E ${p.hold.level.energy.toFixed(6)} start weight ${p.hold.level.weight.toFixed(4)} residual ${p.hold.level.residual.toExponential(2)} mean Steiner ${p.hold.meanSteiner.toFixed(3)} off one line ${p.hold.offLine.toFixed(4)}`
    const heldMap = DS.map(D => `D ${D}: ${RATES.map(r => ((points.find(p => p.D === D && p.rate === r) as Point).hold.held ? 'H' : '-')).join('')}`).join(', ')
    const predictedMap = DS.map(D => `D ${D}: ${RATES.map(r => ((points.find(p => p.D === D && p.rate === r) as Point).predicted ? 'H' : '-')).join('')}`).join(', ')

    const metrics: Record<string, number> = {
      M1: M1 ? 1 : 0,
      M2: M2 ? 1 : 0,
      M3: M3 ? 1 : 0,
      B: B ? 1 : 0,
      B1: B1 ? 1 : 0,
      B2: B2 ? 1 : 0,
      B3: B3 ? 1 : 0,
      control_CR: CR ? 1 : 0,
      control_CC: CC ? 1 : 0,
      checked: checked ? 1 : 0,
      gatedPoints: gated.length,
      disagreements: disagree.length,
      boundaryExponent: exponent,
      boundaryExponentPredicted: -2,
      boundaryRates: boundary.length,
      pathLength: path.length,
      pathPassing: passing.length,
      isotropy,
      normGap,
      antiGap,
      placedGap,
      bagSameGap,
      loneBagGap,
      loneBagTensorGap,
      ccMinFidelity: ccHold.minFidelity,
      ccMaxTail: ccHold.maxTail,
      r03Energy: r03.hold.level.energy,
      seconds: (Date.now() - started) / 1000,
    }

    for (const p of points) {
      const key = `D${p.D}r${rateName(p.rate).replace('/', '_')}`

      metrics[`${key}Held`] = p.hold.held ? 1 : 0
      metrics[`${key}MinFidelity`] = p.hold.minFidelity
      metrics[`${key}MaxTail`] = p.hold.maxTail
    }
    for (const D of DS) metrics[`c1D${D}`] = c1[D] as number
    for (const x of along) {
      const key = `path_D${x.p.D}r${rateName(x.p.rate).replace('/', '_')}`
      const t = tensors.get(x.p) as Tensor

      metrics[`${key}EigenMin`] = t.eigen[0] as number
      metrics[`${key}EigenMax`] = t.eigen[1] as number
      metrics[`${key}Ratio`] = x.ratio
      metrics[`${key}LoneRatio`] = x.lone
    }
    for (const x of bag) {
      metrics[`bagD${x.D}Held`] = x.hold.held ? 1 : 0
      metrics[`bagD${x.D}MinFidelity`] = x.hold.minFidelity
      metrics[`bagD${x.D}MaxTail`] = x.hold.maxTail
      if (x.tensor) {
        metrics[`bagD${x.D}EigenMin`] = x.tensor.eigen[0] as number
        metrics[`bagD${x.D}EigenMax`] = x.tensor.eigen[1] as number
      }
    }

    return verdict({
      status,
      claim: `three holes on the slab (w ${CUT}, Steiner string pi/N, N 3 5 7 13; mixer rates 0 to 1/4): held ${heldMap} against the Klein-gap prediction ${predictedMap} (M1 ${M1}, ${disagree.length} of ${gated.length} gated points disagree; boundary exponent ${Number.isNaN(exponent) ? 'not readable' : exponent.toFixed(3)} against -2); joint path ${path.map(p => `(${p.D}, ${rateName(p.rate)})`).join(' ') || 'none'} with ${passing.length} tensors passing (M2 ${M2}), best ${tensorText(bestTensor)} isotropy ${Number.isNaN(isotropy) ? 'not read' : isotropy.toFixed(4)}; m*/E_rest along it ${along.map(x => x.ratio.toFixed(3)).join(', ') || 'not read'} against the lone hole ${along.map(x => x.lone.toFixed(3)).join(', ') || '-'} (M3 ${M3}); bag inside ${rateName(BAG_INSIDE)} outside ${WORKING}: ${bag.map(x => `D ${x.D} ${x.hold.held ? 'held' : 'not held'} (fidelity ${x.hold.minFidelity.toFixed(4)}, tail ${x.hold.maxTail.toExponential(2)})`).join(', ') || 'not run'}, lone hole free ${B3} (B ${B}); CR ${CR}, CC ${CC}`,
      metrics,
      control: { r03Energy: r03.hold.level.energy, ccMinFidelity: ccHold.minFidelity, ccMaxTail: ccHold.maxTail, placedMinFidelity: p316.minFidelity },
      notes: `L2. Grid: ${points.map(cellText).join('; ')}. Line c1: ${DS.map(D => `D ${D} ${c1[D]} (line level held ${lineHeld[D]!.held}, tail ${lineHeld[D]!.maxTail.toExponential(2)})`).join(', ')}. Boundary: ${boundary.map(b => `rate ${rateName(b.rate)} N_c ${b.Nc.toFixed(3)} m ${b.m.toFixed(4)}`).join(', ') || 'no interior boundary'}. Path tensors: ${path.map(p => `(${p.D}, ${rateName(p.rate)}) ${tensorText(tensors.get(p))}`).join('; ') || 'none'}. Lone hole: ${[...loneAt.entries()].map(([r, t]) => `rate ${rateName(r)} ${tensorText(t)}`).join('; ')}. Bag: ${bag.map(x => `D ${x.D} held ${x.hold.held} fidelity ${x.hold.minFidelity} tail ${x.hold.maxTail} E ${x.hold.level.energy} weight ${x.hold.level.weight} residual ${x.hold.level.residual} mean Steiner ${x.hold.meanSteiner} tensor ${tensorText(x.tensor)}`).join('; ') || 'not run'}; lone under the bag: beat gap ${loneBagGap}, tensor gap ${loneBagTensorGap}. Checks: norm ${normGap.toExponential(2)}, antisymmetry ${antiGap.toExponential(2)}, placed (3, 1/16) least fidelity ${p316.minFidelity} (gap ${placedGap.toExponential(2)}), bag = free at equal rates ${bagSameGap}. CC: ${ccHold.minFidelity}, ${ccHold.maxTail}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  },
})
