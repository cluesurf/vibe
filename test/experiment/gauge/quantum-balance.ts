// WHAT A QUANTUM LIGHT'S SEAMS BALANCE (E-FRC-0269). OPEN-LGT-12 asks for the light's own quantum sector on the
// whole husk: one quantum traveling massless in 3D, with matter coupled through the register's Clifford
// generators. OPEN-LGT-02 (which split the husk's light has: 3/8, 9/20 or 0.4614) now waits on it, because
// E-FRC-0265 showed the trit rule has a seam on the magnetic side only, so E-FRC-0234's balance (link columns and
// plaquette columns reach their seams at one temperature) is not defined for it. The split lives only in a light
// with a seam on each side, which is a quantum Z_N light. This file asks what such a light can decide about the
// split, and measures the one thing it adds, on the one quantum light that runs exactly (the ladder).
//
// DERIVED BEFORE THE GATE RUN.
// 1. ONE MODULUS. In the quantum loop light (code/rule/loop-ring, the ladder's and ring's) a link's flux is a
//    relation of the loop registers of its plaquettes, e = S - C^T U, and the drift reads bal(e), the link seam.
//    A sum of registers is read mod one number only if they share it, so every plaquette touching one link shares
//    its modulus, and the plaquette angle B, the conjugate of U, shares it too. On the husk the link graph joined
//    through shared triangles is connected, so ONE N reaches every register. This is E-FRC-0265's "a gauge group
//    is one group", made a statement about the husk's incidence. The column weights are not free either: w (1 on
//    an axis, 2 on a diagonal) and n_P (1 or 2) are the husk light as the bulk's depth zero mode (E-FRC-0179,
//    0262), and at order k^2 cubic symmetry makes the light isotropic with or without them, so isotropy does not
//    pick them (argued, not gated).
// 2. THE HARMONIC BALANCE IS ALREADY KNOWN. Below the seams each mode is a leapfrog whose stationary states keep
//    s K <|m_k|^2> = f <|B_k|^2> (E-FRC-0234's virial), whatever the occupation. In the regime where registers
//    reach their seams (T of order N^2, far above every omega, which is at most pi), every mode holds T and the
//    register fills are E-FRC-0262's projector diagonals: <e_l^2> = (T/s) pi_l / w_l, <B_P^2> = (T/f) Pi_P / n_P.
//    So a quantum light adds no new fill. What it adds is the seam, and the question the seam decides is WHICH
//    STATISTIC of the fills is balanced. Two readings:
//    - the average (E-FRC-0234, 0262): f / s = mean(Pi / n) / mean(pi / w). The ladder 3, the husk 0.4613818
//    - the worst register (minimax): f / s = max(Pi / n) / max(pi / w), the split at which the most-filled link
//      class and the most-filled plaquette class fill alike. The ladder's Brillouin value is 1 / (1 - 1/sqrt 3)
//      = 2.366; on the husk max(Pi / n) / max(pi / w) = 0.347800 / 0.838803 = 0.41464 (the n_P = 1 triangles
//      against the axis links, E-FRC-0262's class fills)
// 3. THE PREDICTION (argued): minimax. Planck fails when probability reaches a seam, and a register with variance
//    sigma^2 puts weight about exp(-N^2 / (8 sigma^2)) there, so the first departure is set by the register of
//    largest variance on each side, and the split that keeps Planck to the highest temperature equalizes the
//    largest link variance and the largest plaquette variance. As N grows this is exactly the minimax split. At
//    finite N the number of registers at the maximum shifts the optimum by about ln(count) / (N^2 / 8 sigma^2).
// 4. THE TEST BED. On a ladder box of L squares (periodic, momenta 2 pi j / L) the fills, derived by hand:
//      L = 2   rails 1/3, rung 1/3, plaquette 1   average 3, minimax 3      (the two readings AGREE)
//      L = 3   rails 3/10, rung 2/5, plaquette 1  average 3, minimax 5/2
//      L = 4   rails 7/24, rung 5/12, plaquette 1 average 3, minimax 12/5
//    The average reading is 3 on every box (the rank argument). The Planck-optimal split rho*(N, L, T) is measured
//    by scanning exact splits. The finite-N shift of point 3 is common to boxes of one N and T, so the test is the
//    ratio R = rho*(L) / rho*(2) at one N and T: the average reading predicts R = 1, the minimax reading predicts
//    5/6 (L = 3) and 4/5 (L = 4). The L = 2 box is the control inside the ratio: a box where both readings say 3.
//    The shift does not cancel fully: L = 2 has three link registers at the maximum per square, L = 3 and 4 one
//    (the rung), so the L = 2 optimum is pushed down more, which biases R TOWARD 1, against the prediction.
// 5. WHAT IS FREE: nothing. The scan (targets 16/10 .. 42/10, the exact split nearest each, q <= 30), the
//    temperatures (T = x omega_min(N), omega_min = arccos(1 - 2/N), x = 2 and 4 gated, 1 and 8 read), the boxes and
//    the readings compared are fixed here. No constant is targeted: 137, 3/8 and 9/20 appear nowhere in a gate.
//
// GATES, fixed before the gate run:
// H1 ONE MODULUS: on the husk box of side 4 (code/rule/trit-column's trit bulk) the husk links joined through
//    shared husk triangles form one component, and every husk link lies in an n_P = 2 triangle
// H2 THE HUSK READINGS: the husk light's fills on the g = 24 grid (code/measure/husk-balance) reproduce E-FRC-0262's
//    first run: rho_avg = 0.461381849 within 1e-9, and the class fills 0.838803, 0.456966, 0.347800, 0.217400
//    within 1e-6. The minimax reading is computed from the same fills
// B1 BOX FILLS: the ladder light's fills at the box momenta (offset 0) are the table of point 4 within 1e-12
// P1 RESOLVED: on every box and at x = 2 and 4 the scan's least Planck departure |ratio - 1| is not at either
//    end of the scan
// P2 THE READING: on every pair (N, L) and at x = 2 and 4, R = rho*(L) / rho*(2) is nearer the minimax value than
//    1, in log distance: |ln R - ln r_mm| < |ln R|
// Status: pass if every gate holds (minimax, as predicted); partial if H1, H2, B1 and P1 hold and P2 holds on at
// least half of its pair-temperatures but not all; fail otherwise. A P2 on fewer than half is the prediction
// failing: then the average reading stands.
// READ: rho* per box and T with its departure, the departures at the splits nearest 3 and nearest the box's
// minimax, R per pair, the L = 2 optimum against 3 (the finite-N shift), the scanned ratios, and on the husk the
// split each reading gives and E-FRC-0261's frozen alpha test at the minimax reading (not gated).
//
// Depth L2: the exact Floquet spectrum of the model's quantum loop light (Kogut-Susskind Z_N on husk squares,
// every factor exact over Z[zeta_M]) on finite boxes, thermal sums in doubles. The 3D quantum light of OPEN-LGT-12
// is not built here: its gauge-invariant space is about N^(8 V) on V husk docks, beyond dense diagonalization at
// any box with a bulk. The husk's split under each reading is carried from the ladder by the argument of point 3,
// not measured in 3D.
//
// PROBES, disclosed. tmp/qb-smoke.log and tmp/qb-splits.log printed the split density (24 to 27 distinct exact
// splits in the scan at N = 7 .. 15, q <= 30) and the husk register graph (576 links, 1,280 triangles, one
// component, every link in an n_P = 2 triangle, 384 of 576 in an n_P = 1 triangle: the six diagonal directions),
// so H1 was seen before it was gated. tmp/qb-time*.log timed one spectrum per box at a split near 6, far from
// every candidate. No Planck ratio was printed before the gate run.
//
// FIRST RUN 2026-09-29 (tmp/qb-gate-run1.log, 3,507 s): FAIL, no gate moved. H1, H2 and B1 held: one component of
// 576 husk links, every link in an n_P = 2 triangle; the husk readings 0.4613818491 (average, E-FRC-0262 to 1e-10)
// and 0.4146386 (minimax); the box fills exactly as tabled. P1 failed: at N = 9, L = 2 the least departure sits at
// the top of the scan (4.195) at x = 2 and 4. P2 failed, 2 of 8 nearer minimax: R = 0.934 and 0.934 (N 9), 0.889 and
// 1.151 (N 11), 1.016 and 1.016 (N 13) on L = 3, 0.781 and 1.038 (N 7) on L = 4, at x = 2 and 4. WHY IT DOES NOT
// RESOLVE, read from the curves: the Planck departure is not a smooth function of the split's ratio. Neighboring
// exact splits differ by up to a factor of 2.4 (N 13, L 2, x 2: -0.034 at 3.370 and -0.082 at 3.496), while the whole
// scan spans -0.029 to -0.082, so the argmin follows each split's arithmetic (its root M), not its ratio. And at x = 2
// the departures are already 3 to 14 percent, far past the onset the Gaussian-tail argument is about. The control
// shows it too: on L = 2, where both readings say 3, the optimum lands at 3.82, 2.27, 3.32 and 2.71 (N 11, 11, 13 and
// 7) and at the scan's end at N 9. READ, not gated: at x = 1 all four R are below 1 (0.854, 0.706, 0.753, 0.565),
// the minimax side, with the same jaggedness. alpha at the minimax reading: nearest D = 10, 132.492, 3.3 percent
// off, nothing claimed.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  huskRegisterGraph,
  ladderOmegaMin,
  ladderSpecOf,
  planckRatios,
  splitNearFraction,
  type ExactSplit,
} from '@/code/measure/quantum-balance'
import {
  averageFills,
  balances,
  huskLight,
  ladderLight,
} from '@/code/measure/husk-balance'
import {
  alphaOfBalance,
  nearestDepth,
} from '@/code/measure/light-split-origin'

/** The scan: the exact split nearest p / 10 for p = 16 .. 42, q <= 30, duplicates dropped. */
const SCAN_FROM = 16
const SCAN_TO = 42
const Q_MAX = 30

/** Temperatures in units of omega_min: gated, then read. */
const GATED_X = [2, 4]
const READ_X = [1, 8]

/** The pairs: each N is run at L = 2 and at the listed L. */
const PAIRS: readonly { n: number; L: number }[] = [
  { n: 9, L: 3 },
  { n: 11, L: 3 },
  { n: 13, L: 3 },
  { n: 7, L: 4 },
]

/** Point 4's table: [rail, rail, rung] fills and the minimax reading, per box. */
const BOX_FILLS: Record<number, { links: number[]; minimax: number }> = {
  2: { links: [1 / 3, 1 / 3, 1 / 3], minimax: 3 },
  3: { links: [3 / 10, 3 / 10, 2 / 5], minimax: 5 / 2 },
  4: { links: [7 / 24, 7 / 24, 5 / 12], minimax: 12 / 5 },
}

/** E-FRC-0262's first run, as printed. */
const E0262 = {
  average: 0.461381849,
  classes: [0.838803, 0.456966, 0.3478, 0.2174],
}

/** E-FRC-0261's frozen alpha test, unchanged. */
const TARGET = 137.035999177
const WINDOW = 1e-3
const MAX_DEPTH = 10000

const mean = (xs: number[]): number =>
  xs.reduce((a, b) => a + b, 0) / xs.length

function scanSplits(n: number): ExactSplit[] {
  const out: ExactSplit[] = []
  const seen = new Set<string>()

  for (let p = SCAN_FROM; p <= SCAN_TO; p++) {
    const s = splitNearFraction(n, [p, 10], Q_MAX)
    const key = `${s.drift}/${s.force}/${s.w}`

    if (!seen.has(key)) {
      seen.add(key)
      out.push(s)
    }
  }

  return out.sort((a, b) => a.ratio - b.ratio)
}

type Scan = {
  ratios: number[]
  /** departure |ratio - 1| per x (gated then read), per split */
  departure: number[][]
  /** the signed Planck ratio minus 1, the same layout */
  signed: number[][]
}

function scanBox(n: number, L: number, splits: ExactSplit[]): Scan {
  const xs = [...GATED_X, ...READ_X]
  const w0 = ladderOmegaMin(n)
  const departure = xs.map(() => [] as number[])
  const signed = xs.map(() => [] as number[])

  for (const split of splits) {
    const { ratios } = planckRatios(
      ladderSpecOf(n, L, split),
      xs.map(x => x * w0),
    )

    ratios.forEach((r, j) => {
      departure[j]!.push(Math.abs(r - 1))
      signed[j]!.push(r - 1)
    })
  }

  return { ratios: splits.map(s => s.ratio), departure, signed }
}

const argmin = (xs: number[]): number =>
  xs.reduce((best, x, i) => (x < xs[best]! ? i : best), 0)

const nearestIndex = (xs: number[], v: number): number =>
  argmin(xs.map(x => Math.abs(Math.log(x / v))))

export function quantumBalanceRun(): Verdict {
  const started = Date.now()
  const metrics: Record<string, number> = {}

  // H1
  const graph = huskRegisterGraph(4)

  metrics.huskLinks = graph.links
  metrics.huskTriangles = graph.triangles
  metrics.huskComponents = graph.components
  metrics.huskLinksInTwo = graph.withTwo
  metrics.huskLinksInOne = graph.withOne

  const h1 = graph.components === 1 && graph.withTwo === graph.links

  // H2
  const husk = huskLight()
  const hf = balances(averageFills(husk.light, 24, husk), husk)
  const classes = [
    mean(hf.linkFill.slice(0, 3)),
    mean(hf.linkFill.slice(3)),
    mean(hf.plaquetteFill.filter((_, t) => husk.n[t] === 1)),
    mean(hf.plaquetteFill.filter((_, t) => husk.n[t] === 2)),
  ]
  const huskMinimax =
    Math.max(...hf.plaquetteFill) / Math.max(...hf.linkFill)

  metrics.huskAverage = hf.average
  metrics.huskMinimax = huskMinimax
  classes.forEach((c, k) => (metrics[`huskClass${k}`] = c))

  const h2 =
    Math.abs(hf.average - E0262.average) <= 1e-9 &&
    classes.every((c, k) => Math.abs(c - E0262.classes[k]!) <= 1e-6)

  // B1
  const ladder = ladderLight()

  let b1 = true

  for (const L of [2, 3, 4]) {
    const f = balances(averageFills(ladder.light, L, ladder, 0), ladder)
    const want = BOX_FILLS[L]!

    f.linkFill.forEach((x, l) => {
      metrics[`boxL${L}_link${l}`] = x
      b1 &&= Math.abs(x - want.links[l]!) <= 1e-12
    })
    metrics[`boxL${L}_plaquette`] = f.plaquetteFill[0]!
    b1 &&= Math.abs(f.plaquetteFill[0]! - 1) <= 1e-12
    metrics[`boxL${L}_average`] = f.average
    metrics[`boxL${L}_minimax`] =
      f.plaquetteFill[0]! / Math.max(...f.linkFill)
  }

  // the scans
  let p1 = true
  let p2Held = 0
  let p2Count = 0

  const reference = new Map<number, Scan>()

  for (const { n, L } of PAIRS) {
    const splits = scanSplits(n)

    metrics[`scanSize_N${n}`] = splits.length

    if (!reference.has(n)) {
      reference.set(n, scanBox(n, 2, splits))
    }

    const base = reference.get(n)!
    const box = scanBox(n, L, splits)
    const rMm = BOX_FILLS[L]!.minimax / 3

    ;[...GATED_X, ...READ_X].forEach((x, j) => {
      for (const [scan, l] of [
        [base, 2],
        [box, L],
      ] as const) {
        const i = argmin(scan.departure[j]!)
        const tag = `N${n}_L${l}_x${x}`

        metrics[`optimum_${tag}`] = scan.ratios[i]!
        metrics[`departure_${tag}`] = scan.departure[j]![i]!
        metrics[`signedAtOptimum_${tag}`] = scan.signed[j]![i]!
        metrics[`signedAtEnds_${tag}_low`] = scan.signed[j]![0]!
        metrics[`signedAtEnds_${tag}_high`] =
          scan.signed[j]![scan.ratios.length - 1]!
        metrics[`departureAt3_${tag}`] =
          scan.departure[j]![nearestIndex(scan.ratios, 3)]!
        metrics[`departureAtMinimax_${tag}`] =
          scan.departure[j]![
            nearestIndex(scan.ratios, BOX_FILLS[l]!.minimax)
          ]!

        if (GATED_X.includes(x)) {
          p1 &&= i > 0 && i < scan.ratios.length - 1
          scan.signed[j]!.forEach(
            (v, k) => (metrics[`curve_${tag}_${k}`] = v),
          )
        }
      }

      const R =
        metrics[`optimum_N${n}_L${L}_x${x}`]! /
        metrics[`optimum_N${n}_L2_x${x}`]!
      const nearer =
        Math.abs(Math.log(R) - Math.log(rMm)) < Math.abs(Math.log(R))

      metrics[`R_N${n}_L${L}_x${x}`] = R
      metrics[`nearerMinimax_N${n}_L${L}_x${x}`] = nearer ? 1 : 0

      if (GATED_X.includes(x)) {
        p2Count++
        p2Held += nearer ? 1 : 0
      }
    })

    box.ratios.forEach((r, i) => (metrics[`scan_N${n}_${i}`] = r))
  }

  const p2 = p2Held === p2Count

  metrics.p2Held = p2Held
  metrics.p2Count = p2Count

  // READ: alpha at the husk's minimax reading, E-FRC-0261's frozen test unchanged
  const best = nearestDepth(
    n => alphaOfBalance(n, huskMinimax),
    TARGET,
    MAX_DEPTH,
  )
  const slope = 1 / alphaOfBalance(1, huskMinimax)

  metrics.alphaMinimaxNearestD = best.d
  metrics.alphaMinimaxInverse = best.inverse
  metrics.alphaMinimaxMiss = best.miss
  metrics.alphaMinimaxNullWindow = (WINDOW * TARGET) / slope

  const gates = { H1: h1, H2: h2, B1: b1, P1: p1, P2: p2 }

  for (const [k, v] of Object.entries(gates)) {
    metrics[`gate${k}`] = v ? 1 : 0
  }

  metrics.seconds = (Date.now() - started) / 1000

  const status = Object.values(gates).every(Boolean)
    ? 'pass'
    : h1 && h2 && b1 && p1 && 2 * p2Held >= p2Count
      ? 'partial'
      : 'fail'

  const rs = PAIRS.flatMap(({ n, L }) =>
    GATED_X.map(
      x =>
        `N ${n} L ${L} x ${x}: ${metrics[`R_N${n}_L${L}_x${x}`]!.toFixed(3)}`,
    ),
  ).join(', ')

  return verdict({
    status,
    claim: `on the ladder's exact quantum light the Planck-optimal split, relative to the L = 2 box where both readings give 3, is R = ${rs} (minimax predicts 5/6 on L = 3 and 4/5 on L = 4, the average 1): ${p2Held} of ${p2Count} nearer minimax. On the husk one modulus reaches every register (${graph.components} component), and the two readings give ${hf.average.toFixed(7)} (average) and ${huskMinimax.toFixed(5)} (minimax)`,
    metrics,
    control: {
      boxL2Minimax: metrics.boxL2_minimax!,
      boxL2Average: metrics.boxL2_average!,
    },
    notes: `L2, deterministic (exact splits, dense Floquet spectra, no draw). Gates: ${JSON.stringify(gates)}. The 3D quantum light is not built; the husk's split under each reading is carried from the ladder by argument.`,
  })
}

export default experiment({
  id: 'gauge/quantum-balance',
  code: 'E-FRC-0269',
  title:
    "what a quantum light's seams balance: one modulus reaches every husk register and the harmonic fills are E-FRC-0262's, so a quantum light decides only which statistic of the fills its seams balance; measured on the ladder's exact quantum light by the Planck-optimal split against a box where the average and the worst-register readings agree",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return quantumBalanceRun()
  },
})
