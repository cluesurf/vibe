// THREE HOLES OF THE REGISTER SEA ON THE L = 6 TORUS: DOES A TEMPERATURE RESOLVE? (E-FND-0165). OPEN-CSM-13 asks for
// a temperature. E-FND-0162 found three holes on the L = 4 torus relaxing inside an energy shell and keeping their band,
// but no temperature: five band levels leave the density of states too lumpy. E-FND-0163's sorted store holds three
// holes on L = 6 in 3.6e7 amplitudes. This file asks whether a temperature resolves there, and whether the occupation
// is Fermi-Dirac.
//
// DERIVED BEFORE THE GATE RUN (tmp/tp-levels, tmp/tp-free-shells: exact counts, no dynamics; probes disclosed below).
// 1. THE LEVELS (L1). One hole in the positive-phase band has cycle phase pi - E(q). L = 4: 5 levels, 0.380 to 0.813,
//    over 40, 24, 32, 24 and 8 of 128 classes. L = 6: 11 levels, 0.380, 0.406, 0.431, 0.477, 0.519, 0.577, 0.630,
//    0.711, 0.726, 0.813 and 0.826, over 40, 96, 96, 96, 64, 24, 96, 48, 32, 32 and 24 of 648 classes; the mean over
//    classes is 0.543, so three up-band holes at infinite temperature sit at delta = -1.630.
// 2. WHAT A FIT NEEDS (L1). The read is the late up-band occupation per class, averaged over each level's classes, n_l.
//    A Gibbs form ln n_l = a - beta E_l has two parameters: L = 4 leaves 3 degrees of freedom on 5 points (the top level 8
//    classes), L = 6 leaves 9 on 11, each level at least 24 classes. So L = 6 can test the form and L = 4 barely can.
// 3. THREE HOLES ARE NOT A BATH, SO THE FREE SHELL IS NOT THE PREDICTION (L1, exact counts). If the free band energy
//    delta = -sum E were kept sharply, the one-hole marginal would be n(E) ~ Omega_2(delta + E), the two-hole count at
//    the rest, which is EMPTY above E = -delta - 2 E_min: at delta = -1.218 (window 0.05) levels 4 to 10 are empty (7 of
//    11), at delta = -2.365 levels 0 to 6 are. A Gibbs occupation has no empty level. So a Gibbs form with every level
//    filled cannot come from the free band energy; it can only come from the pair pieces' energy acting as part of the
//    bath, as E-FND-0162 found (no free window reproduced its levels). Near the middle (delta -1.630) the free marginal
//    is flat (beta 0.10 +- 0.45 at window 0.05), so a shell there cannot show a slope: the gate starts sit away from it.
// 4. FERMI-DIRAC CANNOT BE TOLD FROM GIBBS HERE (L1). Three holes over 648 classes of 4 band states fill f ~ 1.2e-3 a
//    mode. ln(1 / f - 1) differs from -ln f by about f, below 3e-3, far under any fit residual. The holes are fermions by
//    construction (the store is antisymmetric, E-FND-0163), and the occupation's shape cannot show it at this filling.
//    The difference of the two fits' residuals is read, not gated.
// 5. PREDICTED (after the probes below): the occupation follows a Gibbs form in E with every level filled; beta is set
//    by the start's energy, positive for a low shell and negative for a high one; two starts of one free delta with
//    different level content reach one beta. PASS. It could fail on T2 if the energy that sets beta is not the free
//    delta (item 3 says the band energy alone is not kept), or on T1 if a start's own memory spreads to other levels.
// 6. WHAT IT IS NOT. The 4d torus, not the husk (L2 at most); three holes, not a subsystem and a bath; one half, one
//    tone, one flavor, the register rule. No ledger row can become held from it.
//
// PROBES BEFORE THE GATE RUN, disclosed; they shaped item 5 and set every threshold. tmp/tp-probe1 (the shell '3,4,6',
//  pick 0, 64 cycles): 3.4 s a cycle; the up-band occupation spreads over every level by cycle 8, with a recurrence
//  toward the start's levels near cycle 24, so the late window is long (65 to 128). tmp/tp-probe2 (pick 0 of three
//  shells, 128 cycles, late 65 to 128 every 2): '0,1,2' (delta -1.218) fills all 11 levels, falling from 6.5e-3 to
//  1.8e-3 a class, Gibbs beta 2.78 +- 0.19, rms 0.076 against the flat line's 0.385, the up-band holes' mean E rising
//  from 0.406 to 0.498 (so the free band energy is not what is kept), Fermi-Dirac's rms above Gibbs' by 1.0e-4;
//  '3,4,6' (delta -1.626, next to infinite temperature) beta 0.57 +- 0.15, rms 0.062 against a flat 0.099, with the
//  start's own levels still 5 to 10 percent above the line; '8,9,10' (delta -2.365) beta -3.44 +- 0.36, rms 0.148
//  against 0.490, rising from 2.0e-3 to 9.9e-3 a class with the start's three top levels well above the rest, the
//  up-band holes' mean E falling from 0.789 to 0.622 and the upper-band fraction down to 0.694. tmp/tp-l4-fit: the same fit on
//  E-FND-0162's registered L = 4 level occupations reads beta 1.18 +- 0.31 (P1, delta -1.385) and -0.70 +- 0.27 (P4,
//  delta -1.780) on 3 degrees of freedom, so L = 4 had a slope too, too coarse to test a form. tmp/tp-refit (the same
//  probe logs, the start's own levels left out of the fit): '0,1,2' beta 2.36 +- 0.23, rms 0.065 against a flat 0.282,
//  its own levels 1.23, 1.19 and 1.14 times the line; '3,4,6' 0.57 +- 0.06, rms 0.023; '8,9,10' -2.49 +- 0.30, rms 0.074
//  against 0.265, its own levels 1.70, 1.57 and 1.89 times the line. So the start's levels carry a memory the others do
//  not, and the gate reads the temperature on the levels the start left empty, where any weight arrived by relaxation.
//  tmp/tp-probe2 on the gate's four shells (pick 0 of each, not the gate's picks), the start's levels left out: '0,1,2'
//  2.36 +- 0.23 and '1,1,1' (delta -1.219) 2.65 +- 0.12, 0.29 apart; '6,7,9' (delta -2.154) -2.07 +- 0.21 and '4,9,10'
//  (delta -2.158) -2.01 +- 0.25, 0.06 apart; every rms 0.046 to 0.073. The T2 tolerance, 0.5, is about twice the
//  combined error of two such fits.
//
// THE RUN. The L = 6 torus, three holes in half + at total momentum 0, E-SPN-0175's rule as in E-FND-0162 (the member
// mixers at ringUnit(-1, 4), the sector string ringUnit(-2, 1) a unit of V, cap 8, the sector contact v^2 with v =
// ringUnit(2, 0), hole angles reversed), 128 cycles, the late window cycles 65 to 128 read every 2, on the native kernel
// (E-FND-0163's store). Each start is a Slater determinant of three up-band eigenvectors (the first of bandVectors) at
// distinct momentum classes summing to 0, named by the multiset of their levels and a pick in the enumeration a < b < c
// with c the rest. Two shells, each with two starts of one free delta and different level content: low, A1 '0,1,2' pick
// 300 (delta -1.2179) and A2 '1,1,1' pick 100 (-1.2194); high, B1 '6,7,9' pick 200 (-2.1536) and B2 '4,9,10' pick 100
// (-2.1583). None is a probe's start (the probes took pick 0).
//
// GATES, fixed before the gate run. n_l is the late up-band occupation per class at level l; the fit is ln n_l = a -
// beta E_l on the levels the start left empty, each weighted by its class count; rms is the weighted RMS residual of
// ln n, flat the same for beta = 0 (infinite temperature), and beta's error is scaled by the residual.
//  T1 A TEMPERATURE RESOLVES: for every start, rms <= 0.10, rms <= 0.5 flat, and |beta| >= 4 times its error (probes:
//     rms 0.023 to 0.074, 0.23 to 0.28 of flat, |beta| 8.5 to 10 errors).
//  T2 ONE TEMPERATURE PER ENERGY: in each shell the two starts' betas differ by at most 0.5.
//  T3 A THERMOMETER: the low shell's mean beta exceeds the high shell's by at least 2.0 (probes: 2.36 at delta -1.218
//     against -2.49 at delta -2.365).
// CONTROL (a failure makes the verdict partial at best). CF the free rule from A1's start moves no band-resolved
//  occupation by more than 1e-10 over 8 cycles (no relaxation, so no fit: the occupation stays on three classes).
// INSTRUMENT (a failure makes the verdict partial at best). I1 every norm within 1e-10; I2 the tie antisymmetry at the
//  last cycle within 1e-13.
// READ, gating nothing: the fit on every level, the start's own levels over the line (its memory), the Fermi-Dirac fit
//  and its rms against Gibbs', the upper-band fraction, the up-band holes' mean E against the start's, the down band's
//  occupation, and the free shell at each start's delta (window 0.05) with its empty levels.
// Verdict: fail if T1, T2 or T3 fails; partial if all hold and the control or the instrument fails; pass otherwise.
//
// FIRST RUN (tmp/tb-gate-E-FND-0165.log, 1,456 s): PARTIAL. Every physics gate and the control pass; the instrument
// fails, and the diagnosis is below. No gate moved and none was rerun. The smoke before it (6 cycles,
// tmp/tb-smoke-E-FND-0165.log) failed T1 and T2 on its unrelaxed window and changed nothing.
//  - T1: on the levels each start left empty, A1 beta 2.662 +- 0.139 (rms 0.040, flat 0.312), A2 2.647 +- 0.121 (0.046,
//    0.356), B1 -1.990 +- 0.150 (0.042, 0.233), B2 -2.012 +- 0.249 (0.072, 0.247). A Gibbs form in the band level, with
//    every level filled, where the free shell leaves 7 of 11 levels empty (A) or 3 of 11 (B).
//  - T2: one free delta, two level contents, one temperature: 2.662 and 2.647 (0.015 apart), -1.990 and -2.012 (0.022).
//  - T3: the low shell at 2.654, the high one at -2.001: a thermometer, with a negative temperature above the middle
//    of a bounded band.
//  - CF: the free rule moves no band-resolved occupation, 5.0e-14.
//  - I1 FAILS (norm 5.7e-10 against 1e-10) and I2 FAILS (tie antisymmetry 8.6e-7 against 1e-13). Diagnosed after the
//    run (tmp/tp-diag.ts, tmp/tp-diag.log: A1's start in the store and in the dense engine side by side on L = 6, both
//    on the native kernel, stopped at cycle 80): the store equals the dense engine to 3.8e-17 at cycle 16, and the gap
//    then grows with the store's tie violation, which rises about 1.25 times a cycle (5.1e-18, 1.7e-16, 5.2e-15,
//    2.2e-13, 8.9e-12 at cycles 16 to 80, the amplitude gap half of it each time), toward the 8.6e-7 the gate read at
//    cycle 128. The momentum occupation stays with the dense engine's to 9.8e-16 at cycle 80. So the redundant entries a
//    tie row keeps (both orders of two holes at one momentum) are not held antisymmetric by the steps and grow at L = 6,
//    where the direct-sum Fourier transform rounds; at L = 4, whose radix-4 twiddles are exact, E-FND-0164 read 3.4e-18
//    after 48 cycles. It moves no fitted number at the digits reported (the growth extrapolates to 1e-6 in an amplitude,
//    against occupations near 3e-3 a class read to 3 digits), but it is a defect of the store, not rounding, and the
//    instrument was right to fail. The fix is a projection of the tie rows onto their antisymmetric part each cycle, not
//    made here: it changes the store every registered run uses.
//  - Read. A2 and B2 read the same fits as the probes' pick 0 of their shells to every printed digit, so those starts
//    are images of the probes' under a symmetry of the torus (as E-FND-0162's P1 and P2 were); A1 and B1 are not. The
//    start's own levels sit 1.02 to 1.22 times the line; on every level the fits read 2.77, 2.85, -2.08 and -2.24. The
//    up-band holes' mean E moves toward the band's middle, 0.406 to 0.499 and 0.497 (A), 0.718 to 0.585 and 0.590 (B), and the upper-band
//    fraction is 0.884 (A) and 0.732 (B): the band energy is not what is kept, the pair pieces' energy is part of it.
//    Fermi-Dirac's rms is above Gibbs' by 1.4e-5 to 7.3e-5: indistinguishable at this filling, as derived.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  partnerProjector48,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { torus } from '@/code/measure/register-sea'
import {
  bandLevels,
  bandVectors,
  freeShell,
  holeFrame,
  pairAngles,
  type HoleFrame,
} from '@/code/measure/register-holes'
import {
  bandBasis,
  sortedBandOccupation,
  sortedCycle,
  sortedEngine,
  sortedNorm,
  sortedSlater,
  sortedTies,
  sortedUp,
  type SortedEngine,
} from '@/code/measure/register-sorted-holes'
import {
  fermiFit,
  gibbsFit,
  levelOccupation,
  withoutLevels,
  type LevelFit,
} from '@/code/measure/level-temperature'

const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-2, 1]
const VERTEX: readonly [number, number] = [2, 0]
const CAP = 8
const MODES = 4
const FIT_RMS = 0.1
const FIT_GAIN = 0.5
const RESOLVED = 4
const SAME_BETA = 0.5
const APART_BETA = 2
const FREE_TOL = 1e-10
const NORM_TOL = 1e-10
const TIE_TOL = 1e-13

export type Start = { name: string; key: string; pick: number }

export type TemperaturePlan = {
  L: number
  cycles: number
  lateFrom: number
  every: number
  // two shells, each with two starts of one band energy and different level content
  low: readonly [Start, Start]
  high: readonly [Start, Start]
  freeCycles: number
  threads: number
}

export const GATE_PLAN: TemperaturePlan = {
  L: 6,
  cycles: 128,
  lateFrom: 65,
  every: 2,
  low: [
    { name: 'A1', key: '0,1,2', pick: 300 },
    { name: 'A2', key: '1,1,1', pick: 100 },
  ],
  high: [
    { name: 'B1', key: '6,7,9', pick: 200 },
    { name: 'B2', key: '4,9,10', pick: 100 },
  ],
  freeCycles: 8,
  threads: 12,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/register-temperature',
  code: 'E-FND-0165',
  title:
    'three holes of the register sea on the L = 6 torus reach a temperature, partial (every physics gate passes, the instrument fails): with 11 band levels the relaxed occupation is a Gibbs form in the band level on the levels the start left empty (rms 0.040 to 0.072 in the log, the flat line 0.233 to 0.356), two starts of one band energy with different level content read one beta (2.662 and 2.647; -1.990 and -2.012 above the band\'s middle, a negative temperature), and every level fills where a kept free band energy would leave 7 of 11 empty, so the pair pieces act as the bath; Fermi-Dirac cannot be told from Gibbs at a filling of 1.2e-3 (1e-5 in rms); the free rule moves nothing (5.0e-14); the store\'s redundant tie entries grow 1.25 times a cycle at L = 6 (8.6e-7 at cycle 128), a defect that moves no reported digit',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerTemperatureRun(GATE_PLAN)
  },
})

const unit = (kj: readonly [number, number]): [number, number] => {
  const th = unitAngle(ringUnit(kj[0], kj[1]))

  return [Math.cos(th), Math.sin(th)]
}

// the triples of distinct momentum classes summing to 0 whose band levels form the multiset `key` (comma separated level
// indices, 0 the lowest E), in the engine's order
export function levelTriples(fr: HoleFrame, lev: Int32Array, key: string): number[][] {
  const F = fr.fourier
  const N = F.N
  const want = key.split(',').map(Number).sort((a, b) => a - b).join(',')
  const out: number[][] = []

  for (let a = 0; a < N; a++) {
    for (let b = a + 1; b < N; b++) {
      const c = F.sum[F.neg[a]! * N + F.neg[b]!]!

      if (c > b && [lev[a]!, lev[b]!, lev[c]!].sort((x, y) => x - y).join(',') === want) {
        out.push([a, b, c])
      }
    }
  }

  return out
}

type Run = {
  name: string
  js: number[]
  delta: number
  up: number
  late: Float64Array
  // the Gibbs fit on the levels the start left empty (gated), and on every level (read)
  gibbs: LevelFit
  gibbsAll: LevelFit
  fermi: LevelFit
  // the start's own levels, and each one's late occupation over the fitted line
  own: number[]
  memory: number[]
  perClass: number[]
  meanE: number
  drift: number
  ties: number
}

export function registerTemperatureRun(plan: TemperaturePlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const u = unit(LIGHT)
  const sAng = unitAngle(ringUnit(STRING[0], STRING[1]))
  const vAng = unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const T = torus(plan.L)
  const fr = holeFrame(T, Ps, 8)
  const F = fr.fourier
  const N = F.N
  const E = bandLevels(fr)
  const levels = [...new Set([...E].map(x => x.toFixed(6)))].sort()
  const lev = Int32Array.from(E, x => levels.indexOf(x.toFixed(6)))
  const angle = pairAngles(T, -sAng, CAP, -2 * vAng)
  const e: SortedEngine = sortedEngine(fr, 3, 0, { backend: 'native', threads: plan.threads })
  const basis = bandBasis(e)
  const show = (js: number[]): string => js.map(j => `(${F.ints[j]!.join(',')})`).join(' ')
  const startOf = (st: Start): number[] => levelTriples(fr, lev, st.key)[st.pick]!

  const relax = (st: Start): Run => {
    const js = startOf(st)
    const s = sortedSlater(e, js, js.map(j => bandVectors(fr, j).up[0]!))
    const late = new Float64Array(2 * N)

    let up = 0
    let reads = 0
    let drift = 0

    for (let c = 1; c <= plan.cycles; c++) {
      sortedCycle(e, { angle }, s)

      if (c >= plan.lateFrom && (c - plan.lateFrom) % plan.every === 0) {
        sortedBandOccupation(e, s, basis).forEach((x, j) => (late[j]! += x))
        up += sortedUp(e, s)
        reads++
        drift = Math.max(drift, Math.abs(sortedNorm(e, s) - 1))
      }
    }

    late.forEach((x, j) => (late[j] = x / reads))

    const upOcc = late.subarray(0, N)
    const o = levelOccupation(E, upOcc)
    // the fit reads the levels the start left empty; the start's own levels carry its memory, read against the line
    const own = [...new Set(js.map(j => lev[j]!))]
    const rest = withoutLevels(o, own)
    const gibbs = gibbsFit(rest)
    const run: Run = {
      name: st.name,
      js,
      delta: -js.reduce((a, j) => a + E[j]!, 0),
      up: up / reads,
      late,
      gibbs,
      gibbsAll: gibbsFit(o),
      fermi: fermiFit(rest, MODES),
      memory: own.map(l => o.perClass[l]! / Math.exp(gibbs.intercept - gibbs.beta * o.levels[l]!)),
      own,
      perClass: o.perClass,
      meanE: upOcc.reduce((a, x, j) => a + x * E[j]!, 0) / upOcc.reduce((a, x) => a + x, 0),
      drift,
      ties: sortedTies(e, s),
    }

    log(`${st.name} ${st.key} ${show(js)} delta ${run.delta.toFixed(4)}: up ${run.up.toFixed(4)} beta ${run.gibbs.beta.toFixed(4)} +- ${run.gibbs.betaError.toFixed(4)} rms ${run.gibbs.rms.toFixed(4)} flat ${run.gibbs.flatRms.toFixed(4)}`)

    return run
  }

  // ---- CF: the free rule moves nothing ----
  let freeGap = 0

  {
    const js = startOf(plan.low[0])
    const s = sortedSlater(e, js, js.map(j => bandVectors(fr, j).up[0]!))
    const start = sortedBandOccupation(e, s, basis)

    for (let c = 1; c <= plan.freeCycles; c++) {
      sortedCycle(e, { angle: null }, s)
      sortedBandOccupation(e, s, basis).forEach((x, j) => (freeGap = Math.max(freeGap, Math.abs(x - start[j]!))))
    }
  }

  log(`CF free rule: largest occupation change ${freeGap.toExponential(2)}`)

  const low = plan.low.map(relax)
  const high = plan.high.map(relax)
  const runs = [...low, ...high]
  const fits = runs.every(
    r =>
      r.gibbs.rms <= FIT_RMS &&
      r.gibbs.rms <= FIT_GAIN * r.gibbs.flatRms &&
      Math.abs(r.gibbs.beta) >= RESOLVED * r.gibbs.betaError,
  )
  const betaLow = (low[0]!.gibbs.beta + low[1]!.gibbs.beta) / 2
  const betaHigh = (high[0]!.gibbs.beta + high[1]!.gibbs.beta) / 2
  const T1 = fits
  const T2 =
    Math.abs(low[0]!.gibbs.beta - low[1]!.gibbs.beta) <= SAME_BETA &&
    Math.abs(high[0]!.gibbs.beta - high[1]!.gibbs.beta) <= SAME_BETA
  const T3 = betaLow - betaHigh >= APART_BETA
  const CF = freeGap <= FREE_TOL
  const I1 = runs.every(r => r.drift <= NORM_TOL)
  const I2 = runs.every(r => r.ties <= TIE_TOL)
  const hard = T1 && T2 && T3
  const status = !hard ? 'fail' : !CF || !I1 || !I2 ? 'partial' : 'pass'
  const metrics: Record<string, number> = {
    T1: flag(T1),
    T2: flag(T2),
    T3: flag(T3),
    CF: flag(CF),
    I1: flag(I1),
    I2: flag(I2),
    betaLow,
    betaHigh,
    freeGap,
    normDrift: Math.max(...runs.map(r => r.drift)),
    ties: Math.max(...runs.map(r => r.ties)),
    seconds: (Date.now() - started) / 1000,
  }

  runs.forEach(r => {
    metrics[`beta_${r.name}`] = r.gibbs.beta
    metrics[`betaError_${r.name}`] = r.gibbs.betaError
    metrics[`rms_${r.name}`] = r.gibbs.rms
    metrics[`flatRms_${r.name}`] = r.gibbs.flatRms
    metrics[`fermiRmsMinusGibbs_${r.name}`] = r.fermi.rms - r.gibbs.rms
    metrics[`up_${r.name}`] = r.up
    metrics[`delta_${r.name}`] = r.delta
    metrics[`meanE_${r.name}`] = r.meanE
    metrics[`betaAllLevels_${r.name}`] = r.gibbsAll.beta
    metrics[`rmsAllLevels_${r.name}`] = r.gibbsAll.rms
    metrics[`memory_${r.name}`] = Math.max(...r.memory)
  })

  // ---- reads: the free shell each start's delta would give if the free band energy were kept (window 0.05) ----
  const shellRead = runs.map(r => {
    const sh = freeShell(fr, E, 3, 0, r.delta, 0.05, 3)
    const o = levelOccupation(E, sh.occupation)

    return `${r.name} ${o.perClass.filter(x => x === 0).length} of ${o.levels.length} levels empty`
  })
  const fit = (r: Run): string =>
    `${r.name} beta ${r.gibbs.beta.toFixed(3)} +- ${r.gibbs.betaError.toFixed(3)} (rms ${r.gibbs.rms.toFixed(4)}, flat ${r.gibbs.flatRms.toFixed(4)})`
  const per = (r: Run): string => `${r.name} ${r.perClass.map(x => x.toExponential(3)).join(' ')}`
  const mem = (r: Run): string =>
    `${r.name} ${r.own.map((l, i) => `level ${l} ${r.memory[i]!.toFixed(3)}`).join(', ')}; every level beta ${r.gibbsAll.beta.toFixed(3)} rms ${r.gibbsAll.rms.toFixed(4)}`

  return verdict({
    status,
    claim: `T1 ${T1} (the late up-band occupation by level, on the levels each start left empty, against a Gibbs form: ${runs.map(fit).join('; ')}); T2 ${T2} (one free delta, two level contents: low ${low[0]!.gibbs.beta.toFixed(3)} and ${low[1]!.gibbs.beta.toFixed(3)}, high ${high[0]!.gibbs.beta.toFixed(3)} and ${high[1]!.gibbs.beta.toFixed(3)}); T3 ${T3} (low shell ${betaLow.toFixed(3)} against high ${betaHigh.toFixed(3)}); control CF ${CF} (the free rule moves no occupation: ${freeGap.toExponential(2)}); instrument I1 ${I1} (${metrics.normDrift!.toExponential(2)}) I2 ${I2} (${metrics.ties!.toExponential(2)})`,
    metrics,
    control: { CF: flag(CF), instrument: flag(I1 && I2) },
    notes: `L2: few-body relaxation of a Floquet rule read against the textbook occupation forms, the free rule as control. The 4d torus L ${plan.L} (${levels.length} band levels ${levels.join(' ')}), three holes in one half at total momentum 0, one tone, one flavor, not the husk and not a subsystem with a bath: no ledger row is held. Starts (free delta = -sum E): ${runs.map(r => `${r.name} ${show(r.js)} ${r.delta.toFixed(4)}`).join('; ')}. Late upper-band fraction ${runs.map(r => `${r.name} ${r.up.toFixed(4)}`).join(', ')}; mean E of the up-band holes ${runs.map(r => `${r.name} ${r.meanE.toFixed(4)} (start ${(-r.delta / 3).toFixed(4)})`).join(', ')}. Late up-band occupation per class by level: ${runs.map(per).join('; ')}. Fermi-Dirac against Gibbs, rms difference ${runs.map(r => `${r.name} ${(r.fermi.rms - r.gibbs.rms).toExponential(2)}`).join(', ')} (a filling near 1e-3 cannot tell them apart). The start's own levels over the fitted line (its memory): ${runs.map(mem).join('; ')}. The free shell at each start's delta: ${shellRead.join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
