// IS THE STRING-BOUND MESON HELD ON THE JOINT PATH WHEN ITS BAND IS READ AT ITS OWN SCALE? (E-SPN-0114)
// E-SPN-0113 (test/experiment/spin/meson-joint-limit) ran the love-fear meson (code/measure/string-binding, string only,
// no meeting) on the joint path D = 2 D(n), D(n) from the gap leak exp(-pi m^2/sigma) <= 1e-3, and read the total
// m*/E_rest 1.793, 1.112, 1.024, 1.006, 1.003 at n = 1, 2, 4, 8, 16. Its gates failed at n >= 4 because E-SPN-0112's
// reading rule follows the band in fixed K steps of pi/64 and holds a level only if every consecutive overlap is at
// least 0.99: a light meson's band turns fast across such a step (overlap 0.987, 0.951, 0.827 at n 4, 8, 16). A
// post-run probe (tmp/meson2-probe2.log, no gate) found the overlap at steps pi/128 .. pi/512 rises to 0.998 at n 4
// and 8 and 0.984 at n 16. This file is the clean rerun: the step is DERIVED from the level's own physics before any
// gate is read, and every gate and control is fixed here. note/project/vibe/roadmap/research/remaining-pieces.md, "1".
//
// THE READING RULE (fixed before the first run of this file).
//  THE STEP. A band's block vector turns in K at its quantum metric g: |<psi(K)|psi(K + dK)>| = 1 - g dK^2/2. Two
//  parts are read off the level at K = 0 (code/measure/meson-scaled-step, no fit): the pair's size, Var(d)/4 (the
//  block puts K on love's step, so a pair centred at d/2 carries e^(iKd/2)), and each token's spin, g_B(0)/2 (the lone
//  particle spinor's metric at rest, two tokens each boosted by dK/2; the spinor turns fastest at rest, so the K = 0
//  value bounds it). The step is the largest with g dK^2/2 <= ROTATION = 1e-3, a tenth of the loss the hold allows,
//  shrunk so a whole number of steps covers [0, pi].
//  THE HELD CRITERION. The family is e0 (E-SPN-0113's: the dense e0 at n = 1, 2; the non-relativistic seed settled at
//  the path's D at n >= 4). It is HELD iff its even reading is at least 1/2, its weight at |d| >= N is at most TAIL =
//  1e-3, and every consecutive overlap on the scaled step is at least 0.99 over the band range.
//  THE BAND RANGE, in the level's own momentum scale: K from 0 to K_hold = E_rest (the boost at which a relativistic
//  particle's momentum equals its rest energy, gamma = sqrt 2), capped at pi. E-SPN-0113's range 2 pi/32 = 0.196 is
//  wider than the n = 16 meson's own E_rest (0.157) and a hundredth of the n = 1 one's in its units.
//  THE CURVATURE. m* = 1/E''(0) by a symmetric second difference of half-width CURVE_FRAC E_rest, CURVE_FRAC = 1/64 (for
//  E = sqrt(M^2 + K^2) the relative error of that difference is d^2/(4 M^2) = 6e-5 at every n; E-SPN-0113's fixed 1e-2
//  is 0.4% of M at n = 16). E_rest = 2 pi/(3n) + E(0), E(0) unwrapped against the walk's own zero.
//  THE TOP SPEED. The band followed from K = 0 to pi on the scaled step, stopped at the first step under 0.99; the
//  largest |dE/dK| by a symmetric difference over the steps before the stop.
//
// THE JOINT PATH (E-SPN-0113's): (n, 2 D(n)) = (1, 6), (2, 26), (4, 100), (8, 404), (16, 1612); box 2N.
//
// GATES, fixed before the first run of this file.
//  K1 every path point is held.
//  K2 along the path the total m*/E_rest falls strictly from each n to the next, and is within 1% of 1 at n = 16
//     (every point held).
//  K3 along the path the top group velocity rises strictly from each n to the next, and at every n is within 5% of the
//     lone fine walk's cos m, m = pi/(3n) (every point held).
//  PASS iff K1, K2 and K3.
// CONTROLS (a failed control makes the verdict partial).
//  C1 E-SPN-0113 reproduced at the path points: E(0) to 1e-9 and m*/E_rest on its own reading (half-width 1e-2) to 1e-6
//     relative (tmp/meson2-run1.log's metrics).
//  C2 no drift cost, nothing held: at n = 1, 2 the dense spectrum with the cost off has no particle level with tail at
//     most TAIL; at n >= 4 the seed settled with the cost off has tail above TAIL.
//  C3 the scaled step against pi/64 at n = 1, 2: E-SPN-0113's follow (meson-band followBand) over [0, K_hold] at pi/64
//     and at the scaled step gives the same held verdict, and where both hold, E(K_hold) to 1e-9; the scaled top speed
//     is within 1% of E-SPN-0113's (0.35354, 0.80863).
//  C4 the instruments: the banded block leaks nothing to the odd block (0) and is unitary to 1e-12 at every point.
//  REPORTED, NOT GATED: g and its two parts, the step, the first step's measured loss over the predicted g dK^2/2, the
//  least overlap over the range, where the band breaks, and m* on E-SPN-0113's half-width.
//
// PREDICTED (before run 1). K2 follows E-SPN-0113's totals if K1 holds (1.0026 at n 16 is inside 1%). K3 is expected
// to FAIL at n = 1 and 2: E-SPN-0113 read the n = 1 top speed 0.354 against cos m = 0.500 and n = 2 0.809 against
// 0.866 (6.6% under), both held to near pi, and a smaller step does not change a smooth band's slope. K1 at n = 16 is
// open: tmp/meson2-probe2.log's least overlap stopped rising near 0.984 between pi/256 and pi/512, which is not the
// dK^2 loss a smooth band gives; if that is a narrow crossing rather than a boost, no step rule holds n = 16.
//
// RUN 1 (134 s, tmp/meson3-run1.log, the record): FAIL on K1, K2, K3, every control clean, no gate moved.
//   n   D     g       Var(d)  g_B    step      K_hold  least   breaks at K  loss/pred  m*/E_rest  top     cos m
//   1   6     0.637   1.88    0.333  pi/57     2.413   0.9943  none         0.980      1.7931     0.3535  0.5000
//   2   26    2.753   9.01    1.000  pi/117    1.240   0.9927  3.115        0.970      1.1124     0.8087  0.8660
//   4   100   10.87   36.0    3.73   pi/232    0.628   0.9380  0.244        1.004      1.0238     0.3186  0.9659
//   8   404   43.89   146     14.7   pi/466    0.314   0.9791  0.216        1.142      1.0043     0.5387  0.9914
//   16  1612  175.3   584     58.4   pi/931    0.157   0.9754  0.084        1.065      1.0026     0.4423  0.9979
// The metric estimate is right: the first step's measured loss is 0.97 to 1.14 of the predicted g dK^2/2 at every n,
// so on the scaled step the smooth rotation is 1e-3 per step as designed. What breaks n >= 4 is not the step: the
// band keeps overlap >= 0.99 per step from K = 0 and then drops at ONE step, at K 0.244 (0.39 E_rest) at n 4, 0.216
// (0.69 E_rest) at n 8, 0.084 (0.54 E_rest) at n 16, inside each K_hold. A drop at one K on a step already a quarter
// of the smooth loss bound is a narrow crossing with another level of the block, which is what probe 2's floor near
// 0.984 was. K1 fails at n 4, 8, 16. K2 fails only through K1: the total m*/E_rest on the scaled curvature is 1.7931,
// 1.1124, 1.0238, 1.0043, 1.0026, strictly falling and 0.26% from 1 at n 16 (on E-SPN-0113's 1e-2 reading n 8 is
// 1.0062: the fixed half-width was 3% of that meson's momentum scale). K3 fails at every n: at n 1 and 2 as predicted
// (0.354, 0.809 against 0.500, 0.866, held to K 3.14 and 3.09), and at n >= 4 the held part ends before the band is
// fast (0.319, 0.539, 0.442). Controls: C1 every E(0) exact and every m*/E_rest to 1e-15; C2 no level inside with the
// cost off (least tails 0.42, 0.40, 0.50, 0.50, 0.50); C3 the scaled step and pi/64 both hold n 1 and 2 to K_hold, E
// agrees to 2e-16, the top speed to 9e-5; C4 leak 0, unitarity 7e-16.
//
// Depth L2: lattice Dirac walks bound by a linear string ('t Hooft, Schwinger); the reading rule is the quantum metric
// of a Bloch band. What could fail is whether the meson band is held once it is read at its own scale, and whether its
// inertia over energy and its top speed then approach the lone walk's.
// DETERMINISM: no random numbers. NOTHING MOVES: the coin and the cost write amplitudes on a dock's own line; the
// stream copies. HUSK FIRST: one husk line.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lightN } from '@/code/measure/drift-cost-bloch'
import { meson, pairLevels } from '@/code/measure/string-binding'
import {
  bandCurvature,
  followBand,
  loneTopVelocity,
  nrSeed,
  pairBand,
  readBand,
  settle,
  type BandLevel,
} from '@/code/measure/meson-band'
import {
  bandMetric,
  followHeld,
  scaledStep,
  type BandMetric,
  type HeldTrack,
} from '@/code/measure/meson-scaled-step'

const TAIL = 1e-3
const EVEN = 0.5
const HOLD = 0.99
const ROTATION = 1e-3
const HOLD_RANGE = 1
const CURVE_FRAC = 1 / 64
const OLD_STEP = Math.PI / 64
const OLD_CURVE = 1e-2
const FINES: readonly number[] = [1, 2, 4, 8, 16]
const DENSE_FINES: readonly number[] = [1, 2]
const PATH_K = 2
const BOX = 2
const TOTAL_TOL = 0.01
const V_TOL = 0.05
const V_AGREE = 0.01
const SAME = 1e-9
const REL = 1e-6
const UNITARY = 1e-12
const STATED_PATH: Record<number, number> = {
  1: 6,
  2: 26,
  4: 100,
  8: 404,
  16: 1612,
}
const RECORDED: Record<number, { energy: number; total: number }> = {
  1: { energy: 0.3188654375223234, total: 1.7929929817785346 },
  2: { energy: 0.19314564649226765, total: 1.1123371136062274 },
  4: { energy: 0.10386658008071757, total: 1.0238485455718578 },
  8: { energy: 0.05213891233226967, total: 1.0061989649820842 },
  16: { energy: 0.026185373288082, total: 1.0026312481889854 },
}
const RECORDED_VELOCITY: Record<number, number> = {
  1: 0.35354294409152126,
  2: 0.8086259683792514,
}

type Point = {
  n: number
  D: number
  box: number
  held: boolean
  bandHeld: boolean
  energy: number
  tail: number
  mean: number
  even: number
  metric: BandMetric
  step: number
  kHold: number
  least: number
  brokeAt: number
  firstRatio: number
  mass: number
  massOld: number
  eRest: number
  total: number
  totalOld: number
  top: number
  topAt: number
  heldTo: number
  cosM: number
  lone: number
  residual: number
  leak: number
  unitarity: number
  level: BandLevel
}

const half = (n: number): number => Math.PI / (3 * n)

// E-SPN-0113's derived D(n): the smallest D with N = 2D + 1 >= 9 n^2 ln(1/TAIL)/pi^2
function derivedD(n: number): number {
  const need = (9 * n * n * Math.log(1 / TAIL)) / Math.PI ** 2

  return Math.max(0, Math.ceil((need - 1) / 2))
}

const boxOf = (D: number): number => BOX * lightN(D)

function levelAt(n: number, D: number): BandLevel {
  const m = meson(D, boxOf(D), n)

  if (DENSE_FINES.includes(n)) {
    const e0 = pairLevels(m)
      .levels.filter(l => l.parity === 0)
      .sort((a, b) => a.unwrapped - b.unwrapped)[0]!

    return readBand(m, e0.block, e0.energy, 0)
  }

  return settle(m, nrSeed(m))
}

function readPoint(level: BandLevel, n: number): Point {
  const m = meson(level.D, level.box, n)
  const op = pairBand(m, 0, 0)
  const metric = bandMetric(m, level)
  const step = scaledStep(metric.metric, ROTATION, Math.PI)
  const eRest = 2 * half(n) + level.unwrapped
  const kHold = Math.min(HOLD_RANGE * eRest, Math.PI)
  const track: HeldTrack[] = followHeld(m, level, step, Math.PI, HOLD)
  const broke = track.findIndex((t, s) => s > 0 && t.overlap < HOLD)
  const last = broke === -1 ? track.length - 1 : broke - 1
  const bandHeld = broke === -1 || track[broke - 1]!.K >= kHold - 1e-12

  let least = 1

  for (let s = 1; s < track.length; s++) {
    if (track[s - 1]!.K < kHold - 1e-12) {
      least = Math.min(least, track[s]!.overlap)
    }
  }

  let top = 0
  let topAt = 0

  for (let s = 1; s < last; s++) {
    const v =
      Math.abs(track[s + 1]!.energy - track[s - 1]!.energy) / (2 * step)

    if (v > top) {
      top = v
      topAt = track[s]!.K
    }
  }

  const at = {
    K: 0,
    energy: level.unwrapped,
    overlap: 1,
    residual: level.residual,
    vector: level.block,
  }
  const mass = 1 / bandCurvature(m, at, CURVE_FRAC * eRest)
  const massOld = 1 / bandCurvature(m, at, OLD_CURVE)
  const held = level.even >= EVEN && level.tailN <= TAIL && bandHeld

  return {
    n,
    D: level.D,
    box: level.box,
    held,
    bandHeld,
    energy: level.unwrapped,
    tail: level.tailN,
    mean: level.mean,
    even: level.even,
    metric,
    step,
    kHold,
    least,
    brokeAt: broke === -1 ? -1 : track[broke]!.K,
    firstRatio:
      track.length > 1
        ? (1 - track[1]!.overlap) / ((metric.metric * step * step) / 2)
        : 0,
    mass,
    massOld,
    eRest,
    total: mass / eRest,
    totalOld: massOld / eRest,
    top,
    topAt,
    heldTo: track[last]!.K,
    cosM: Math.cos(half(n)),
    lone: loneTopVelocity(n),
    residual: Math.max(...track.map(t => t.residual)),
    leak: op.leak,
    unitarity: op.unitarity,
    level,
  }
}

export default experiment({
  id: 'spin/meson-scaled-step',
  code: 'E-SPN-0114',
  title:
    'the string-bound love-fear meson on the joint path D = 2 D(n), its band read in K steps set by its own quantum metric (Var(d)/4 + g_B/2, predicted rotation at most 1e-3 per step: pi/57 at n = 1 to pi/931 at n = 16) up to K = E_rest, fails: the metric predicts the measured per-step loss to 0.97 to 1.14, but at n = 4, 8, 16 the band drops under 0.99 at one step (K 0.244, 0.216, 0.084, a narrow crossing, not the step size), so the held gate fails; the total m*/E_rest still falls 1.793, 1.112, 1.024, 1.004, 1.003, and the top speed misses cos m at every n (0.354 against 0.500 at n = 1); E-SPN-0113 reproduced, no cost holds nothing, and the scaled step agrees with pi/64 at n = 1, 2',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const secs = (): number => Math.round((Date.now() - started) / 1000)
    const f3 = (x: number): string => x.toFixed(3)
    const f4 = (x: number): string => x.toFixed(4)
    const e2 = (x: number): string => x.toExponential(2)
    const log = (s: string): void =>
      console.error(`${s}; at ${secs()} s`)
    const show = (p: Point): string =>
      `n ${p.n} D ${p.D} (box ${p.box}): ${p.held ? 'held' : 'NOT held'} E ${f4(p.energy)} tail ${e2(p.tail)} span ${f3(p.mean)} even ${f3(p.even)} g ${f3(p.metric.metric)} (Var(d) ${f3(p.metric.varianceD)}, g_B ${f3(p.metric.spin)}) step pi/${f3(Math.PI / p.step)} K_hold ${f4(p.kHold)} least ${f4(p.least)}${p.brokeAt >= 0 ? ` breaks at K ${f4(p.brokeAt)}` : ''} first-step loss/predicted ${f3(p.firstRatio)} m* ${f4(p.mass)} E_rest ${f4(p.eRest)} m*/E_rest ${f4(p.total)} (1e-2: ${f4(p.totalOld)}) top ${f4(p.top)} at K ${f3(p.topAt)} held to K ${f3(p.heldTo)} cos m ${f4(p.cosM)} residual ${e2(p.residual)}`

    // ---- the path ----
    const path = FINES.map(n => ({ n, D: PATH_K * derivedD(n) }))
    const pathAsStated = path.every(p => p.D === STATED_PATH[p.n])

    log(
      `path ${path.map(p => `(${p.n}, ${p.D})`).join(', ')}; as stated ${pathAsStated}`,
    )

    const points: Point[] = []

    for (const { n, D } of path) {
      const p = readPoint(levelAt(n, D), n)

      points.push(p)
      log(show(p))
    }

    // K1
    const K1 = points.every(p => p.held)
    // K2
    const falls = points.every(
      (p, i) => i === 0 || p.total < points[i - 1]!.total,
    )
    const lastTotal = points[points.length - 1]!.total
    const K2 = K1 && falls && Math.abs(lastTotal - 1) <= TOTAL_TOL
    // K3
    const rises = points.every(
      (p, i) => i === 0 || p.top > points[i - 1]!.top,
    )
    const nearLone = points.every(
      p => Math.abs(p.top / p.cosM - 1) <= V_TOL,
    )
    const K3 = K1 && rises && nearLone

    // ---- controls ----
    // C1: E-SPN-0113 at the path points
    const c1Rows = points.map(p => {
      const r = RECORDED[p.n]!
      const ok =
        Math.abs(p.energy - r.energy) <= SAME &&
        Math.abs(p.totalOld / r.total - 1) <= REL

      return {
        n: p.n,
        D: p.D,
        energy: p.energy,
        totalOld: p.totalOld,
        ok,
      }
    })
    const c1 = c1Rows.every(r => r.ok)

    log(
      `C1 ${c1Rows.map(r => `n ${r.n} D ${r.D}: E ${r.energy} m*/E_rest ${r.totalOld} ${r.ok}`).join('; ')}`,
    )

    // C2: no cost
    const free = points.map(p => {
      const m = meson(p.D, p.box, p.n)

      if (DENSE_FINES.includes(p.n)) {
        const levels = pairLevels(m, false).levels

        return {
          n: p.n,
          D: p.D,
          inside: levels.filter(l => l.tailN <= TAIL).length,
          least: Math.min(...levels.map(l => l.tailN)),
        }
      }

      const l = settle(m, nrSeed(m), undefined, false)

      return {
        n: p.n,
        D: p.D,
        inside: l.tailN <= TAIL ? 1 : 0,
        least: l.tailN,
      }
    })
    const c2 = free.every(f => f.inside === 0)

    log(
      `C2 ${free.map(f => `n ${f.n} D ${f.D} inside ${f.inside} least tail ${e2(f.least)}`).join(', ')}: ${c2}`,
    )

    // C3: the scaled step against pi/64 at n = 1, 2
    const c3Rows = points
      .filter(p => DENSE_FINES.includes(p.n))
      .map(p => {
        const m = meson(p.D, p.box, p.n)
        const old = followBand(m, p.level, [0, p.kHold], OLD_STEP)
        const now = followBand(m, p.level, [0, p.kHold], p.step)
        const oldHeld = old[old.length - 1]!.overlap >= HOLD
        const nowHeld = now[now.length - 1]!.overlap >= HOLD
        const gap = Math.abs(
          old[old.length - 1]!.energy - now[now.length - 1]!.energy,
        )
        const vGap = Math.abs(p.top / RECORDED_VELOCITY[p.n]! - 1)
        const ok =
          oldHeld === nowHeld &&
          (!oldHeld || gap <= SAME) &&
          vGap <= V_AGREE

        return {
          n: p.n,
          oldHeld,
          nowHeld,
          oldLeast: old[old.length - 1]!.overlap,
          nowLeast: now[now.length - 1]!.overlap,
          gap,
          vGap,
          ok,
        }
      })
    const c3 = c3Rows.every(r => r.ok)

    log(
      `C3 ${c3Rows.map(r => `n ${r.n}: pi/64 held ${r.oldHeld} (${f4(r.oldLeast)}), scaled held ${r.nowHeld} (${f4(r.nowLeast)}), E(K_hold) gap ${e2(r.gap)}, top vs E-SPN-0113 ${e2(r.vGap)} ${r.ok}`).join('; ')}`,
    )

    // C4: instruments
    const leak = Math.max(...points.map(p => p.leak))
    const unitarity = Math.max(...points.map(p => p.unitarity))
    const c4 = leak === 0 && unitarity <= UNITARY

    log(`C4 leak ${e2(leak)} unitarity ${e2(unitarity)}: ${c4}`)

    const control = c1 && c2 && c3 && c4 && pathAsStated
    const status = !control
      ? 'partial'
      : K1 && K2 && K3
        ? 'pass'
        : 'fail'
    const metrics: Record<string, number> = {
      K1: K1 ? 1 : 0,
      K2: K2 ? 1 : 0,
      K3: K3 ? 1 : 0,
      control: control ? 1 : 0,
      C1: c1 ? 1 : 0,
      C2: c2 ? 1 : 0,
      C3: c3 ? 1 : 0,
      C4: c4 ? 1 : 0,
      pathAsStated: pathAsStated ? 1 : 0,
      lastTotal,
      leak,
      unitarity,
      seconds: (Date.now() - started) / 1000,
    }

    for (const p of points) {
      const k = `n${p.n}_D${p.D}`

      metrics[`${k}_held`] = p.held ? 1 : 0
      metrics[`${k}_bandHeld`] = p.bandHeld ? 1 : 0
      metrics[`${k}_energy`] = p.energy
      metrics[`${k}_tail`] = p.tail
      metrics[`${k}_mean`] = p.mean
      metrics[`${k}_even`] = p.even
      metrics[`${k}_metric`] = p.metric.metric
      metrics[`${k}_varianceD`] = p.metric.varianceD
      metrics[`${k}_spinMetric`] = p.metric.spin
      metrics[`${k}_step`] = p.step
      metrics[`${k}_kHold`] = p.kHold
      metrics[`${k}_least`] = p.least
      metrics[`${k}_brokeAt`] = p.brokeAt
      metrics[`${k}_firstRatio`] = p.firstRatio
      metrics[`${k}_mass`] = p.mass
      metrics[`${k}_eRest`] = p.eRest
      metrics[`${k}_total`] = p.total
      metrics[`${k}_totalOld`] = p.totalOld
      metrics[`${k}_top`] = p.top
      metrics[`${k}_topAt`] = p.topAt
      metrics[`${k}_heldTo`] = p.heldTo
      metrics[`${k}_cosM`] = p.cosM
      metrics[`${k}_lone`] = p.lone
      metrics[`${k}_residual`] = p.residual
    }

    for (const f of free) {
      metrics[`free_n${f.n}_D${f.D}_least`] = f.least
    }

    for (const r of c3Rows) {
      metrics[`c3_n${r.n}_gap`] = r.gap
      metrics[`c3_n${r.n}_vGap`] = r.vGap
    }

    const g = (x: boolean): string => (x ? 'holds' : 'fails')

    return verdict({
      status,
      claim: `${points.map(show).join('; ')}. K1 ${g(K1)}${
        K1
          ? ''
          : ` (not held: ${points
              .filter(p => !p.held)
              .map(p => `n ${p.n}`)
              .join(', ')})`
      }; K2 ${g(K2)} (total ${points.map(p => f4(p.total)).join(', ')}); K3 ${g(K3)} (top ${points.map(p => f4(p.top)).join(', ')} against cos m ${points.map(p => f4(p.cosM)).join(', ')}). Controls: C1 ${c1}, C2 ${c2}, C3 ${c3}, C4 ${c4}`,
      metrics,
      control: {
        C1: c1 ? 1 : 0,
        C2: c2 ? 1 : 0,
        C3: c3 ? 1 : 0,
        C4: c4 ? 1 : 0,
      },
      notes: `L2. Steps ${points.map(p => `n ${p.n} pi/${f3(Math.PI / p.step)}`).join(', ')}. ${secs()} s.`,
    })
  },
})
