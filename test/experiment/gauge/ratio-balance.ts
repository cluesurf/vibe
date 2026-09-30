// THE SPLIT BY ITS RATIO ALONE (E-FRC-0270). Follow-up to E-FRC-0269 for OPEN-LGT-02 and OPEN-LGT-12. E-FRC-0269
// narrowed the husk light's split to two readings of one set of fills, the average (0.4613818) and the worst
// register (0.4146386), and asked the ladder's exact quantum light which one Planck picks. It could not say: the
// Planck departure jumped by up to 2.4 times between neighboring exact splits, and 0269 read that as "it follows
// each split's root M, not its ratio". This file asks for a Planck statistic that depends on rho alone, measures its
// spread, and asks at what N the two predictions separate by more than that spread.
//
// DERIVED BEFORE THE GATE RUN.
// 1. ONE OPERATOR PER RATIO (a theorem). The drift's phase is 2 pi (c E mod M) / M and the force's 2 pi (r E mod M)
//    / M, so the beat depends on c / M = s / 2N and r / M = f / 2N only. With s f = 2 / N that is rho = f / s alone.
//    Every exact split of one ratio is a multiple (k c, k r, k w, k M) of the least one, because rho = 2 N w^2 / c^2
//    fixes c / w. So route (a), "Planck averaged over all exact splits that share one ratio", averages copies of ONE
//    operator and is void, and 0269's reading is corrected: the departure is already a function of rho alone. What
//    0269 saw is that function's own fine structure, at spacings finer than its scan (code/measure/ratio-balance).
// 2. WHERE THE FINE STRUCTURE COMES FROM (argued, one probe disclosed below). A Floquet level's energy is its phase
//    plus whole turns, and the turns are read from the harmonic invariant energy (code/measure/quantum-ladder
//    `unwrapped`). A level whose harmonic reading and phase differ by about pi switches its turn as rho moves, and its
//    Boltzmann weight jumps by e^(2 pi / T). The levels that do this are the ones near a seam, where the harmonic
//    reading fails, which are the same levels that carry the Planck departure. So the jump is multiplicative and of
//    order one on the departure itself, at every N: it does not become small against the signal as N grows unless
//    the seam levels' readings sharpen.
// 3. THE SPREAD, AND WHAT SEPARATION NEEDS. Near its optimum the departure is A_e e^(-E_e) + A_B e^(-E_B) with
//    E_e ~ rho^(-1/2) and E_B ~ rho^(1/2) (the Gaussian tails of E-FRC-0269 point 3), so a jitter J on the
//    prefactors moves ln rho* by about 2 acosh(J) / E. The readings differ by ln(6/5) = 0.182 in R = rho*(3) /
//    rho*(2) (the worst register 5/6, the average 1). R lands nearer one reading than the other when its error is
//    below half that, 0.0912. With both boxes' spreads S_3 and S_2 (standard deviations of ln rho*), the pair
//    SEPARATES when 2 sqrt(S_3^2 + S_2^2) < ln(6/5) / 2. The Gaussian-tail model (read, not gated) also moves the
//    finite-N optimum itself: ln(count) / E toward fewer registers, which pushes the 2-square box down and R toward 1.
// 4. THE STATISTIC. |departure| at T = x omega_min on a grid of 241 ratios uniform in ln rho from 1.6 to 4.2 (step
//    0.0040). The 10 sub-grids of every 10th point sample the ratios at E-FRC-0269's density (step 0.040), each
//    shifted. On each sub-grid the optimum is the argmin of a running median over 5 of its points (a window of 0.16
//    in ln rho, route (a) done over neighboring RATIOS, since same-ratio splits are one operator). The spread S is
//    the standard deviation of ln rho* over the 10 sub-grids, and rho*(L) the geometric mean. The raw argmin
//    (median over 1 point, 0269's statistic) is read beside it.
// 5. WHY NO SPARSE SPECTRUM REACHES FURTHER (argued; the folding is read). The thermal sum needs every level's
//    unwrapped energy, whose turn is read from its eigenvector, so it is not a function of U and no stochastic trace
//    or kernel polynomial method of U computes it. A phase-targeted Lanczos (shift-invert about the vacuum's phase)
//    cannot isolate the low levels either: every level whose energy is above 2 pi folds onto the circle, so at the
//    gated temperatures, where the levels that hold the thermal weight reach past 2 pi, their phases cover the
//    whole circle among N^L others. So the reach is dense diagonalization by momentum sector, as E-FRC-0269's:
//    60 s for one (13, 3) spectrum (tmp/qb-time2.log), cost N^9 on L = 3, so one hour reaches (N/13)^9 = 60, and a
//    factor 8 from symmetries not yet used (charge conjugation, reflection, the sector's stabilizer) gives 480:
//    N_REACH = 25, the largest odd N with (N / 13)^9 <= 480.
// 6. WHAT IS FREE: nothing. The grid, the sub-grid stride, the median width, the temperatures (x = 1 and 2 gated,
//    4 read), the boxes (2 squares at N = 9, 11, 13, 17, 21, 25, 29, 3 squares at N = 9 and 11), the separation
//    criterion and N_REACH are fixed here. 137, 3/8 and 9/20 appear nowhere.
//
// GATES, fixed before the gate run:
// Q1 ONE OPERATOR PER RATIO: on (9, 3) the exact split nearest 3 (code/measure/quantum-balance splitNearFraction,
//    q <= 30) and its double give Planck ratios equal within 1e-12 at x = 1 and 2, and on (13, 2) the real-ratio beat
//    reproduces the exact beat at every split of E-FRC-0269's scan within 1e-10 at x = 2, and 0269's printed
//    departures at 3.3163 (-0.028560160471771567), 3.3696 (-0.03421909035009807) and 3.4956 (-0.08223772749045133)
//    within 1e-10
// Q2 THE SPREAD FALLS: at each gated x the least squares fit ln S_2 = a + b ln N over the seven 2-square boxes has
//    b < 0
// Q3 SEPARATES AT REACH: some pair (N, 3 squares), N = 9 or 11, at a gated x has 2 sqrt(S_3^2 + S_2^2) < ln(6/5)/2
// Q4 PICKS ONE: every separating pair-temperature has R nearer one reading in log distance (|ln R - ln 5/6| against
//    |ln R|), and all of them the same one
// N_SEP, the estimate: lambda = the largest S_3 / S_2 measured (at least 1); the 2-square spread a separating pair
//    needs is S* = ln(6/5) / (4 sqrt(1 + lambda^2)); N_sep = (S* e^(-a))^(1/b) at each gated x when b < 0, else
//    infinite, and the estimate is the smaller of the two.
// Status: pass if Q1, Q3 and Q4 hold (the reading picked is reported, and set beside E-FRC-0269's frozen
// prediction, the worst register). partial if Q1 holds, Q3 does not, and N_sep <= N_REACH: the next box separates
// and runs densely. fail otherwise: Q1 fails, or N_sep > N_REACH, the clean negative (no box a dense method
// reaches separates the readings, and no sparse method computes the statistic).
// READ: per box and x, rho*(L), S, the raw argmin's spread, the least smoothed departure and E = -ln of it, R per
// pair, the model's optimum and R (code/measure/ratio-balance tailOptimum), and on (11, 3) at rho = 3 the energy
// below which all but 1e-9 of the thermal weight lies at x = 2, in turns of 2 pi.
//
// Depth L2: exact Floquet spectra of the model's quantum loop light on finite ladder boxes, thermal sums in doubles.
// The 3D quantum light of OPEN-LGT-12 is not built.
//
// PROBES, disclosed. tmp/qr-probe1-13x2.log printed the real-ratio departure on (13, 2) on this grid (and exact
// against real at three splits, equal to every printed digit), so Q1 (b) was seen, and the (13, 2) curve at
// x = 0.5, 1, 2 was seen: plateaus with jumps. tmp/qr-probe2a.log diffed the levels across one jump (2.878 to 2.889
// on (13, 2)): one level moved, harmonic reading 7.14, phase 4.00, a difference of 3.14. tmp/qr-model1.log printed
// the Gaussian-tail model's optima. No spread, sub-grid optimum or 3-square departure was computed before the gate
// run.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  ladderOmegaMin,
  ladderSpecOf,
  planckRatios,
  splitNearFraction,
  type ExactSplit,
} from '@/code/measure/quantum-balance'
import {
  departureGrid,
  meanOf,
  offsetOptima,
  powerFit,
  ratioGrid,
  ratioSpec,
  runningMedian,
  standardDeviation,
  tailOptimum,
} from '@/code/measure/ratio-balance'
import {
  oneQuantumBand,
  unwrapped,
} from '@/code/measure/quantum-ladder'

const GRID = ratioGrid(1.6, 4.2, 240)
const STRIDE = 10
const WIDTH = 5
const GATED_X = [1, 2]
const READ_X = [4]
const TWO_SQUARE = [9, 11, 13, 17, 21, 25, 29]
const THREE_SQUARE = [9, 11]
const HALF_GAP = Math.log(6 / 5) / 2
const N_REACH = 25

/** E-FRC-0269's printed (13, 2) departures at x = 2. */
const E0269: readonly [number, number][] = [
  [3.316326530612245, -0.028560160471771567],
  [3.3696, -0.03421909035009807],
  [3.4955555555555557, -0.08223772749045133],
]

type Box = {
  /** per x (gated then read): ln rho* of each sub-grid, smoothed and raw */
  smooth: number[][]
  raw: number[][]
  least: number[]
}

function study(n: number, L: number): Box {
  const xs = [...GATED_X, ...READ_X]
  const w0 = ladderOmegaMin(n)
  const grid = departureGrid(
    n,
    L,
    GRID,
    xs.map(x => x * w0),
  )

  return {
    smooth: grid.map(d =>
      offsetOptima(d, STRIDE, WIDTH).map(i => Math.log(GRID[i]!)),
    ),
    raw: grid.map(d =>
      offsetOptima(d, STRIDE, 1).map(i => Math.log(GRID[i]!)),
    ),
    least: grid.map(d => {
      let best = Infinity

      for (let o = 0; o < STRIDE; o++) {
        const sub: number[] = []

        for (let i = o; i < d.length; i += STRIDE) {
          sub.push(Math.abs(d[i]!))
        }

        best = Math.min(best, ...runningMedian(sub, WIDTH))
      }

      return best
    }),
  }
}

function scanSplits(n: number): ExactSplit[] {
  const out: ExactSplit[] = []
  const seen = new Set<string>()

  for (let p = 16; p <= 42; p++) {
    const s = splitNearFraction(n, [p, 10], 30)
    const key = `${s.drift}/${s.force}/${s.w}`

    if (!seen.has(key)) {
      seen.add(key)
      out.push(s)
    }
  }

  return out.sort((a, b) => a.ratio - b.ratio)
}

export function ratioBalanceRun(): Verdict {
  const started = Date.now()
  const metrics: Record<string, number> = {}
  const xs = [...GATED_X, ...READ_X]

  // Q1 (a): one ratio, two roots
  const least = splitNearFraction(9, [3, 1], 30)
  const doubled: ExactSplit = {
    ...least,
    root: 2 * least.root,
    drift: 2 * least.drift,
    force: 2 * least.force,
    w: 2 * least.w,
  }
  const w9 = ladderOmegaMin(9)
  const ta = planckRatios(ladderSpecOf(9, 3, least), [w9, 2 * w9]).ratios
  const tb = planckRatios(ladderSpecOf(9, 3, doubled), [w9, 2 * w9]).ratios
  const sameRatio = Math.max(...ta.map((v, i) => Math.abs(v - tb[i]!)))

  metrics.q1SplitRatio = least.ratio
  metrics.q1SplitRoot = least.root
  metrics.q1SameRatioGap = sameRatio

  // Q1 (b): real against exact on 0269's (13, 2) scan, and 0269's printed values
  const w13 = ladderOmegaMin(13)

  let realGap = 0
  let printedGap = 0

  for (const split of scanSplits(13)) {
    const exact = planckRatios(ladderSpecOf(13, 2, split), [2 * w13])
      .ratios[0]!
    const real = planckRatios(ratioSpec(13, 2, split.ratio), [2 * w13])
      .ratios[0]!

    realGap = Math.max(realGap, Math.abs(exact - real))

    for (const [rho, dep] of E0269) {
      if (Math.abs(split.ratio - rho) < 1e-9) {
        printedGap = Math.max(printedGap, Math.abs(exact - 1 - dep))
      }
    }
  }

  metrics.q1RealGap = realGap
  metrics.q1PrintedGap = printedGap

  const q1 = sameRatio <= 1e-12 && realGap <= 1e-10 && printedGap <= 1e-10

  // the boxes
  const two = new Map<number, Box>()
  const three = new Map<number, Box>()

  for (const n of TWO_SQUARE) {
    two.set(n, study(n, 2))
  }

  for (const n of THREE_SQUARE) {
    three.set(n, study(n, 3))
  }

  const record = (tag: string, box: Box, n: number, L: number): void => {
    xs.forEach((x, j) => {
      const t = `${tag}_x${x}`
      const T = x * ladderOmegaMin(n)

      metrics[`rhoStar_${t}`] = Math.exp(meanOf(box.smooth[j]!))
      metrics[`spread_${t}`] = standardDeviation(box.smooth[j]!)
      metrics[`rhoStarRaw_${t}`] = Math.exp(meanOf(box.raw[j]!))
      metrics[`spreadRaw_${t}`] = standardDeviation(box.raw[j]!)
      metrics[`leastDeparture_${t}`] = box.least[j]!
      metrics[`E_${t}`] = -Math.log(box.least[j]!)
      metrics[`modelRhoStar_${t}`] = tailOptimum(n, L, T)
    })
  }

  for (const [n, box] of two) {
    record(`N${n}_L2`, box, n, 2)
  }

  for (const [n, box] of three) {
    record(`N${n}_L3`, box, n, 3)
  }

  // Q2 and N_sep
  let lambda = 1

  for (const n of THREE_SQUARE) {
    for (const x of GATED_X) {
      const s2 = metrics[`spread_N${n}_L2_x${x}`]!
      const s3 = metrics[`spread_N${n}_L3_x${x}`]!

      if (s2 > 0) {
        lambda = Math.max(lambda, s3 / s2)
      }
    }
  }

  metrics.lambda = lambda

  const target = Math.log(6 / 5) / (4 * Math.sqrt(1 + lambda * lambda))

  metrics.targetSpread = target

  let q2 = true
  let nSep = Infinity

  for (const x of GATED_X) {
    const ss = TWO_SQUARE.map(n =>
      Math.max(metrics[`spread_N${n}_L2_x${x}`]!, 1e-6),
    )
    const { a, b } = powerFit(TWO_SQUARE, ss)
    const sep = b < 0 ? (target * Math.exp(-a)) ** (1 / b) : Infinity

    metrics[`fitA_x${x}`] = a
    metrics[`fitB_x${x}`] = b
    metrics[`nSep_x${x}`] = Number.isFinite(sep) ? sep : -1
    q2 &&= b < 0
    nSep = Math.min(nSep, sep)
  }

  metrics.nSep = Number.isFinite(nSep) ? nSep : -1
  metrics.nReach = N_REACH

  // Q3, Q4: the pairs
  let q3 = false
  const picks: string[] = []

  for (const n of THREE_SQUARE) {
    xs.forEach(x => {
      const t2 = `N${n}_L2_x${x}`
      const t3 = `N${n}_L3_x${x}`
      const R = metrics[`rhoStar_${t3}`]! / metrics[`rhoStar_${t2}`]!
      const err =
        2 *
        Math.hypot(metrics[`spread_${t3}`]!, metrics[`spread_${t2}`]!)
      const separates = err < HALF_GAP
      const nearerWorst =
        Math.abs(Math.log(R) - Math.log(5 / 6)) < Math.abs(Math.log(R))
      const T = x * ladderOmegaMin(n)

      metrics[`R_N${n}_x${x}`] = R
      metrics[`Rraw_N${n}_x${x}`] =
        metrics[`rhoStarRaw_${t3}`]! / metrics[`rhoStarRaw_${t2}`]!
      metrics[`Rerror_N${n}_x${x}`] = err
      metrics[`separates_N${n}_x${x}`] = separates ? 1 : 0
      metrics[`nearerWorst_N${n}_x${x}`] = nearerWorst ? 1 : 0
      metrics[`modelR_N${n}_x${x}`] = tailOptimum(n, 3, T) / tailOptimum(n, 2, T)

      if (GATED_X.includes(x) && separates) {
        q3 = true
        picks.push(nearerWorst ? 'worst' : 'average')
      }
    })
  }

  const q4 = q3 && picks.every(p => p === picks[0])
  const picked = q4 ? picks[0]! : 'none'

  metrics.picksWorst = picks.filter(p => p === 'worst').length
  metrics.picksAverage = picks.filter(p => p === 'average').length

  // READ: the folding, on (11, 3) at rho = 3, x = 2
  {
    const { levels } = oneQuantumBand(ratioSpec(11, 3, 3))
    const { energies } = unwrapped(levels)
    const T = 2 * ladderOmegaMin(11)
    const sorted = [...energies].sort((a, b) => a - b)
    const e0 = sorted[0]!
    const weights = sorted.map(e => Math.exp(-(e - e0) / T))
    const total = weights.reduce((a, b) => a + b, 0)

    let tail = total
    let cut = sorted.length - 1

    for (let i = 0; i < sorted.length; i++) {
      tail -= weights[i]!

      if (tail / total < 1e-9) {
        cut = i
        break
      }
    }

    metrics.foldEnergyTurns = sorted[cut]! / (2 * Math.PI)
    metrics.foldLevelsNeeded = cut + 1
    metrics.foldLevels = sorted.length
  }

  const gates = { Q1: q1, Q2: q2, Q3: q3, Q4: q4 }

  for (const [k, v] of Object.entries(gates)) {
    metrics[`gate${k}`] = v ? 1 : 0
  }

  metrics.seconds = (Date.now() - started) / 1000

  const status =
    q1 && q3 && q4
      ? 'pass'
      : q1 && !q3 && nSep <= N_REACH
        ? 'partial'
        : 'fail'

  const spreads = GATED_X.map(
    x =>
      `x ${x}: ${TWO_SQUARE.map(n => metrics[`spread_N${n}_L2_x${x}`]!.toFixed(3)).join(', ')}`,
  ).join('; ')
  const rs = THREE_SQUARE.flatMap(n =>
    GATED_X.map(
      x =>
        `N ${n} x ${x}: ${metrics[`R_N${n}_x${x}`]!.toFixed(3)} (error ${metrics[`Rerror_N${n}_x${x}`]!.toFixed(3)})`,
    ),
  ).join(', ')

  return verdict({
    status,
    claim: `the ladder's quantum light is one operator per split ratio (same-ratio splits agree to ${sameRatio.toExponential(1)}, the real-ratio beat matches E-FRC-0269's exact splits to ${realGap.toExponential(1)}), so its Planck departure is a function of rho alone; the split-to-split spread of the Planck-optimal ratio on the 2-square boxes N = 9 to 29 is ${spreads}; R = rho*(3) / rho*(2) is ${rs} against a separation of ${HALF_GAP.toFixed(4)}; ${q3 ? `the separating pairs pick the ${picked === 'worst' ? 'worst register' : picked === 'average' ? 'average' : 'readings inconsistently'}` : `no pair separates, and the 2-square spreads extrapolate to separation at N = ${Number.isFinite(nSep) ? nSep.toFixed(0) : 'never'} against a dense reach of ${N_REACH}`}`,
    metrics,
    control: {
      spreadN29L2x1: metrics.spread_N29_L2_x1!,
      spreadN29L2x2: metrics.spread_N29_L2_x2!,
      rhoStarN29L2x2: metrics.rhoStar_N29_L2_x2!,
    },
    notes: `L2, deterministic (dense Floquet spectra at 241 real ratios per box, no draw). Gates: ${JSON.stringify(gates)}. The 3D quantum light is not built.`,
  })
}

export default experiment({
  id: 'gauge/ratio-balance',
  code: 'E-FRC-0270',
  title:
    "the light's split by its ratio alone: the ladder's quantum light is one operator per split ratio, so its Planck departure depends on rho alone; its split-to-split spread against the separation of the worst-register and average readings, on boxes of 2 and 3 squares, and the N at which the two would separate",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return ratioBalanceRun()
  },
})
