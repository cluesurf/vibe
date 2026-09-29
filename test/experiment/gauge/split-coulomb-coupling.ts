// The coupling of a charge to the husk light, as a closed form in the depth and the drift/force split (E-FRC-0242).
//
// THE CLOSED FORM, written before any run. The classical light fixes only kappa = s f = 2 / (2D + 1) (E-FRC-0207);
// the quantum light's column is a Weyl pair of N = 2D + 1 values (E-FRC-0230), which fixes hbar, and splits kappa
// between the drift s (the phase pi s / N per unit of e^2) and the force f. A static charge's longitudinal flux
// holds the husk Green's function 1 / (24 pi r) (E-FRC-0241) times the drift's phase per unit of 1/2 e^2, 2 pi s / N:
//   C = s / (12 N) = s kappa / 24,    c = sqrt(2 kappa / 3) (split-free, E-FRC-0212, 0235),
//   alpha = C / c = (s / 24) sqrt(3 kappa / 2)
// - the classical light's split (s = 1): alpha = sqrt(3 / (2D + 1)) / 24, E-FRC-0212's sqrt(3 (2D + 1)) / (48 D) to
//   O(1/D) (0212 counts the angle column as 2D, the quantum light's flux column holds 2D + 1): alpha ~ D^(-1/2)
// - a split with f / s = rho: s = sqrt(kappa / rho) and alpha = kappa sqrt(3 / (2 rho)) / 24: alpha ~ D^(-1). E-FRC-0234
//   found the balance at rho = links per square; the trit bulk holds 12 links and 32 triangles per bulk dock (and
//   the husk 20 triangles per dock with multiplicities summing to 32), so rho = 3/8 there and alpha = kappa / 12 =
//   1 / (6 (2D + 1)) EXACTLY RATIONAL. That the husk's 3D balance sits at the register count is E-FRC-0234's ladder
//   result carried over, NOT measured in 3D here.
// THE SHIFT THEOREM (code/measure/split-coulomb): in the quantum light a static charge shifts every quasi-energy by
// (pi s / N) E* (E* the real minimum of the flux's square) only when the loop registers are wide enough in m to
// take a fractional translation; their spread sigma_m^2 grows as sqrt(f / s) N / (2 pi). With the classical split
// sigma_m^2 stays near 0.2 at every N, so the registers are pinned near integers and the static energy is NOT the
// drift times the Coulomb form: the charge's coupling is a Coulomb coupling only when the force carries its share.
// (AS WRITTEN BEFORE THE RUN. The run refuted "at every N": see the notes.)
//
// THE TEST, on the only quantum light the model has (code/rule/loop-ring: the plaquette ladder's exact factors, a
// strip of husk squares, NOT the 3D husk), a STAND-IN static charge pair across rung 0 (x = 1 on its flux): the
// ground quasi-energy of sector x = 1 less that of x = 0 (each ground the Floquet eigenvector of largest overlap
// with its sector's harmonic vacuum), against (pi s / N) E*, E* = 2/3 on two squares and 3/5 on three.
//
// Gates, fixed before the first run. Probes before this file (tmp/coul-probe3..4.log) at N = 9 and 11 on two squares,
// boxes these gates do not use: the least-generator-energy choice of ground failed there (Floquet mixing), and the
// overlap choice read the shift at 1.015 and 1.0002 of the prediction for f / s near 3, 0.991 and 0.990 for the
// drift-carried split, 1.22 and 1.13 for the classical split. Tolerances were set knowing those numbers:
// Q1 f / s near 3 (splitNear): |shift / predicted - 1| < 1e-3 on two squares at N = 13, 17, 21, 25 and < 5e-3 on three
//    squares at N = 11, both sectors' ground overlaps >= 0.5
// Q2 the drift-carried split (s = 2 / N, f = 1): |shift / predicted - 1| < 2e-2 on two squares at N = 13 .. 25
// Q3 the classical split (s = 1, f = 2 / N): shift / predicted - 1 > 0.05 on two squares at N = 13 .. 25 and on three
//    squares at N = 11 (the registers' rounding shows)
// Q4 the register count: the trit bulk (side 4, D 2) holds 20 husk triangles per husk dock, their multiplicities sum
//    to 32 per dock, and 32 bulk triangles per bulk dock (so rho = 12 / 32 = 3/8)
// Q5 no numerology (E-MTH-0010): no integer D in 1 .. 200 puts 1 / alpha within 1e-3 (relative) of 137.036 in any of
//    the three closed forms (s = 1; rho = 3; rho = 3/8). Nothing is claimed from a value of D.
// Status: pass if all five hold; fail otherwise.
//
// Depth L2: a closed form for the coupling with its mechanism measured on the model's quantum light (a ladder of
// husk squares, a stand-in charge). HUSK: the coefficient's Green's function is the 3D husk's (E-FRC-0241); the
// quantum measurement is on a strip of husk squares because no 3D quantum light fits in memory. The start family
// does not enter.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { splitNear } from '@/code/rule/loop-ring'
import { makeTritLight } from '@/code/rule/trit-column'
import {
  alphaOfRatio,
  alphaOfShare,
  classicalSplit,
  driftCarriedSplit,
  realMinimum,
  staticShift,
  type StaticShift,
} from '@/code/measure/split-coulomb'

const TWO_SQUARES = [13, 17, 21, 25]
const THREE_SQUARES = 11

export default experiment({
  id: 'gauge/split-coulomb-coupling',
  code: 'E-FRC-0242',
  title:
    "the coupling of a charge to the husk light in closed form: C = s kappa / 24 with s the drift's share of kappa, so alpha = (s / 24) sqrt(3 kappa / 2), sqrt(3 / (2D + 1)) / 24 with the classical light's split and kappa sqrt(3 / (2 rho)) / 24 with a balanced split f / s = rho (1 / (6 (2D + 1)) at the trit bulk's register count rho = 3/8); on the quantum light's own rule a static charge shifts the ground by exactly the drift times the Coulomb form when the force carries its share (to 5e-9 at N = 25), while the classical split's integer registers add an excess that falls with column depth (0.17 to 0.045 over N = 13 to 25), fail on that one clause, whose registered premise (a depth-independent excess) was wrong",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const metrics: Record<string, number> = {}

    const record = (tag: string, r: StaticShift): void => {
      metrics[`${tag}_s`] = r.s
      metrics[`${tag}_f`] = r.f
      metrics[`${tag}_shift`] = r.shift
      metrics[`${tag}_predicted`] = r.predicted
      metrics[`${tag}_ratio`] = r.ratio
      metrics[`${tag}_integerRatio`] = r.integerRatio
      metrics[`${tag}_overlap0`] = r.overlap0
      metrics[`${tag}_overlap1`] = r.overlap1
      metrics[`${tag}_nextOverlap`] = r.nextOverlap
      metrics[`${tag}_sigma2`] = r.sigma2
      metrics[`${tag}_residual`] = r.residual
      metrics[`${tag}_seconds`] = r.seconds
    }

    let q1 = true
    let q2 = true
    let q3 = true

    for (const n of TWO_SQUARES) {
      const sq = staticShift(n, 2, splitNear(n, 3))
      const dr = staticShift(n, 2, driftCarriedSplit(n))
      const cl = staticShift(n, 2, classicalSplit(n))

      record(`square_N${n}_L2`, sq)
      record(`drift_N${n}_L2`, dr)
      record(`classical_N${n}_L2`, cl)
      q1 =
        q1 &&
        Math.abs(sq.ratio - 1) < 1e-3 &&
        sq.overlap0 >= 0.5 &&
        sq.overlap1 >= 0.5
      q2 = q2 && Math.abs(dr.ratio - 1) < 2e-2
      q3 = q3 && cl.ratio - 1 > 0.05
    }

    const sq3 = staticShift(
      THREE_SQUARES,
      3,
      splitNear(THREE_SQUARES, 3),
    )
    const cl3 = staticShift(
      THREE_SQUARES,
      3,
      classicalSplit(THREE_SQUARES),
    )

    record(`square_N${THREE_SQUARES}_L3`, sq3)
    record(`classical_N${THREE_SQUARES}_L3`, cl3)
    q1 =
      q1 &&
      Math.abs(sq3.ratio - 1) < 5e-3 &&
      sq3.overlap0 >= 0.5 &&
      sq3.overlap1 >= 0.5
    q3 = q3 && cl3.ratio - 1 > 0.05
    metrics.eStarTwoSquares = realMinimum(2, 1)
    metrics.eStarThreeSquares = realMinimum(3, 1)

    // Q4: the register count on the trit bulk
    const bulk = makeTritLight({ side: 4, depth: 2, form: 'wave' }).bulk
    const huskTrianglesPerDock = bulk.huskTriangles / bulk.huskDocks
    const multiplicityPerDock =
      Array.from(bulk.multiplicity).reduce((s, v) => s + v, 0) /
      bulk.huskDocks
    const bulkTrianglesPerDock = bulk.triangles / bulk.docks
    const q4 =
      huskTrianglesPerDock === 20 &&
      multiplicityPerDock === 32 &&
      bulkTrianglesPerDock === 32

    metrics.huskTrianglesPerDock = huskTrianglesPerDock
    metrics.multiplicityPerDock = multiplicityPerDock
    metrics.bulkTrianglesPerDock = bulkTrianglesPerDock
    metrics.bulkLinksPerDock = bulk.links / bulk.docks

    // the closed forms at the depths the ledger uses, and Q5
    const forms: Record<string, (d: number) => number> = {
      classical: d => alphaOfShare(d, 1),
      rho3: d => alphaOfRatio(d, 3),
      rho3over8: d => alphaOfRatio(d, 3 / 8),
    }

    for (const d of [11, 16, 32, 64]) {
      for (const [name, form] of Object.entries(forms)) {
        metrics[`inverseAlpha_${name}_D${d}`] = 1 / form(d)
      }
    }

    let nearest = Infinity
    let q5 = true

    for (const form of Object.values(forms)) {
      for (let d = 1; d <= 200; d++) {
        const rel = Math.abs(1 / form(d) / 137.036 - 1)

        nearest = Math.min(nearest, rel)
        q5 = q5 && rel >= 1e-3
      }
    }

    metrics.nearestRelativeTo137 = nearest

    const gates = { Q1: q1, Q2: q2, Q3: q3, Q4: q4, Q5: q5 }

    for (const [k, v] of Object.entries(gates)) {
      metrics[`gate${k}`] = v ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    const ratios = (prefix: string): string =>
      TWO_SQUARES.map(n =>
        (metrics[`${prefix}_N${n}_L2_ratio`] ?? 0).toFixed(5),
      ).join(', ')

    return verdict({
      status: Object.values(gates).every(Boolean) ? 'pass' : 'fail',
      claim: `a static charge on the quantum light's own rule (a ladder of husk squares, a STAND-IN pair across one rung) shifts the ground by ${ratios('square')} of the drift times the Coulomb form (pi s / N) E* at N = ${TWO_SQUARES.join(', ')} with f / s near 3 (${sq3.ratio.toFixed(5)} on three squares), ${ratios('drift')} with the drift-carried split, and ${ratios('classical')} (${cl3.ratio.toFixed(4)} on three squares) with the classical light's split, whose registers sit near integers (spread ${(metrics.classical_N25_L2_sigma2 ?? 0).toFixed(3)} against ${(metrics.square_N25_L2_sigma2 ?? 0).toFixed(2)}); so C = s kappa / 24 and alpha = (s / 24) sqrt(3 kappa / 2): ${(metrics.inverseAlpha_classical_D16 ?? 0).toFixed(2)} (classical split), ${(metrics.inverseAlpha_rho3_D16 ?? 0).toFixed(1)} (rho = 3), ${(metrics.inverseAlpha_rho3over8_D16 ?? 0).toFixed(0)} (rho = 3/8, 1/alpha = 6 (2D + 1)) for 1/alpha at D = 16; no integer depth is within ${nearest.toExponential(2)} of 137.036`,
      metrics,
      control: {
        classicalRatioN25: metrics.classical_N25_L2_ratio ?? 0,
        integerRatioTwoSquares:
          metrics.classical_N25_L2_integerRatio ?? 0,
      },
      notes: `L2, deterministic (exact factors read in doubles, the eigenvectors by the repo's Hermitian solver; no draw). Gates: ${JSON.stringify(gates)}. FIRST RUN 2026-09-26 (tmp/frc0242.log, 245 s), FAIL on Q3 alone, recorded as is, no gate moved. Q1 holds sharply: f / s near 3 reads 0.99987, 0.9999993, 0.99999999, 0.999999995 of (pi s / N) E* at N = 13 .. 25 (0.99984 on three squares at N = 11), overlaps 0.92 to 0.98; the drift-carried split 0.9968 to 1.0001. Q3's premise was wrong: the classical split's register spread is NOT constant in N (sigma_m^2 0.226, 0.259, 0.288, 0.314 at N = 13, 17, 21, 25), and its excess over the Coulomb form falls with it, 0.172, 0.104, 0.064, 0.045 (1.272 on three squares at N = 11, sigma_m^2 0.199), about as exp(-15 sigma_m^2) (fitted after the run, against the theorem's exp(-2 pi^2 sigma_m^2) = exp(-19.7 sigma_m^2)); N = 25 read 1.045, under the 1.05 gate. So the classical split does NOT refuse the Coulomb coupling: it converges to it slowly in the column depth, where the balanced split is exact already at N = 13. The ground identification at classical N = 21 had overlap 0.58 in sector 0 (the gate on overlaps applies to Q1 only). Title rewritten after the run to say this; no logic changed.`,
    })
  },
})
