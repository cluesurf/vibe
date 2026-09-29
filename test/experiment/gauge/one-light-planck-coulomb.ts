// Planck and Coulomb at the coupling that gives c = 1/2 (E-FRC-0251). E-FRC-0250 shows c = 1/2 is kappa = 3/8, that
// the quantum loop light reaches it exactly at every column depth (M = 2 N m, m = 4j, c r = 6 j^2), and that the 3D
// husk light is UNSTABLE there (its top curl-curl eigenvalue is 16, so kappa <= 1/4). The plaquette ladder (K <= 6)
// is stable at kappa = 3/8, so this file asks the one question the ladder can answer: with the depth no longer
// setting c, do the column's Planck law and the charge's Coulomb coupling survive? It is a STAND-IN for the husk,
// which cannot run at this kappa at all.
//
// PREDICTIONS, derived before any run.
//   Planck: the column's capacity is the Bohr-Sommerfeld ellipse, (pi N / 4) sqrt(kappa K (1 - kappa K / 4)) /
//   max(s K, f) states per mode (code/measure/quantum-ladder ellipseStates). At a balanced split this is (pi N / 4)
//   sqrt(1 - kappa K / 4): the depth N still sets the capacity, kappa only trims it, by 0.90 on the k = 0 mode
//   (K = 2) and 0.66 on k = pi (K = 6) at kappa = 3/8 against 0.98 and 0.94 at kappa = 2/N, N = 25. So Planck is
//   kept, a little worse than at kappa = 2 / N, and still converging in N. The exact balance f / s = 3 (links per
//   square) is unreachable at kappa = 3/8 (s would be 1/sqrt 8); the nearest integer split is used.
//   Coulomb: the static shift is the drift's alone, (pi s / N) E* (E-FRC-0242's shift theorem), so the coefficient
//   is C = s / (12 N) and alpha = s / (12 N c) = s / (6 N) at c = 1/2. The form (s / 24) sqrt(3 kappa / 2) = s / 32
//   would be a shift kappa N / 2 times larger (2.4 to 4.7 here) and is refused.
//   The shape of the husk potential, 1/(24 pi r) with no 1/r^3 (E-FRC-0241), is the husk Laplacian's Green's
//   function and holds no kappa at all: kept by construction, and not re-run here.
//
// Gates, fixed before the first run (no probe of these quantities was run):
// P1 Planck: with the kappa = 3/8 split nearest f / s = 3, the thermal energy of all a box's levels is within 1e-3
//    of sum_k omega_k / (e^(omega_k / T) - 1) at T / omega_min = 1/4, 1/2, 1 on (N, L) = (21, 2) and (25, 2)
// P2 the column depth: the departure from Planck at T = omega_min falls strictly over N = 17, 21, 25
// P3 split-free light: at N = 25 the one-quantum band equals the classical leapfrog's omega(k) at kappa = 3/8 within
//    1e-3 for the split nearest 3 and within 1e-2 for the 3D balance f / s = 3/8 (s = 1)
// Q1 Coulomb: a STAND-IN static charge's shift is (pi s / N) E* within 1e-3 for the split nearest 3 and 1e-2 for
//    f / s = 3/8, at N = 13, 17, 25 on two squares, both sectors' ground overlaps >= 0.5
// Q2 the kappa = 2/N form refused: |shift / ((pi s / N) E*) - kappa N / 2| > 0.5 in every case of Q1
// Reported: the kappa = 2/N column split of E-FRC-0234 on the same boxes (Planck ratios), both splits' shares and
// alpha = s / (6 N), and the hot box at 2 and 4 omega_min.
// Status: pass if all five hold; partial if P1 and Q1 hold; fail otherwise.
//
// Depth L2: the model's quantum light rule on a ladder of husk squares at a coupling the 3D husk cannot hold; the
// result bears on the husk only through E-FRC-0250's refusal.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  classicalOmega,
  type LadderSpec,
} from '@/code/rule/plaquette-ladder'
import { splitNear, type Split } from '@/code/rule/loop-ring'
import {
  oneQuantumBand,
  planck,
  thermalEnergy,
  unwrapped,
} from '@/code/measure/quantum-ladder'
import { realMinimum, staticShift } from '@/code/measure/split-coulomb'
import {
  loopSplits,
  nearestRatio,
} from '@/code/measure/one-light-split'

const KAPPA = 3 / 8
const PLANCK_BOXES = [17, 21, 25]
const SHIFT_BOXES = [13, 17, 25]
const T_OVER_OMEGA = [1 / 4, 1 / 2, 1, 2, 4]

const specOf = (n: number, L: number, split: Split): LadderSpec => ({
  n,
  plaquettes: L,
  root: split.root,
  drift: split.drift,
  force: split.force,
})
const nearThree = (n: number): Split =>
  nearestRatio(loopSplits(n, 3, 8, 32), [3, 1])
const balanced3D = (n: number): Split =>
  loopSplits(n, 3, 8, 64).find(s => 8 * s.force === 3 * s.drift)!

function planckStudy(spec: LadderSpec): {
  ratios: Record<string, number>
  band: { k: number; omega: number }[]
  omegaMin: number
} {
  const { band, levels } = oneQuantumBand(spec)
  const { energies } = unwrapped(levels)
  const omegas = band.map(b => b.omega)
  const wmin = Math.min(...omegas)
  const ratios: Record<string, number> = {}

  for (const x of T_OVER_OMEGA) {
    const T = x * wmin

    ratios[`T${x}`] =
      thermalEnergy(energies, T) /
      omegas.reduce((acc, w) => acc + planck(w, T), 0)
  }

  return {
    ratios,
    band: band.map(b => ({ k: b.k, omega: b.omega })),
    omegaMin: wmin,
  }
}

export default experiment({
  id: 'gauge/one-light-planck-coulomb',
  code: 'E-FRC-0251',
  title:
    "Planck and Coulomb at kappa = 3/8, the coupling that gives c = 1/2, on the plaquette ladder's quantum light (a STAND-IN: the 3D husk light is unstable there, E-FRC-0250), fail on P1 and Q1: the static shift is still the drift's (pi s / N) E*, so alpha = s / (6N), 1 / (6 (2D + 1)) at s = 1 and never s / 32, but a hot box sits 2e-3 to 2e-2 below Planck at T = omega_min, four orders worse than at kappa = 2/N, converging in N; the s = 1 split's shift converges in N too (1.045 to 0.998)",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const metrics: Record<string, number> = {}

    let p1 = true
    let p3 = true
    let q1 = true
    let q2 = true

    const deficits: number[] = []

    for (const n of PLANCK_BOXES) {
      const split = nearThree(n)
      const spec = specOf(n, 2, split)
      const box = planckStudy(spec)
      const ref = planckStudy(specOf(n, 2, splitNear(n, 3)))

      metrics[`splitM_N${n}`] = split.w
      metrics[`splitDrift_N${n}`] = split.drift
      metrics[`splitForce_N${n}`] = split.force
      metrics[`splitRatio_N${n}`] = split.force / split.drift
      metrics[`omegaMin_N${n}`] = box.omegaMin
      metrics[`referenceOmegaMin_N${n}`] = ref.omegaMin

      for (const x of T_OVER_OMEGA) {
        metrics[`planckRatio_N${n}_T${x}`] = box.ratios[`T${x}`]!
        metrics[`referencePlanckRatio_N${n}_T${x}`] =
          ref.ratios[`T${x}`]!

        if (n >= 21 && x <= 1) {
          p1 &&= Math.abs(box.ratios[`T${x}`]! - 1) <= 1e-3
        }
      }

      deficits.push(Math.abs(box.ratios.T1! - 1))

      if (n === 25) {
        let worst = 0

        for (const b of box.band) {
          worst = Math.max(
            worst,
            Math.abs(b.omega - classicalOmega(KAPPA, b.k, 2)),
          )
        }

        metrics.bandWorst_nearThree_N25 = worst
        p3 &&= worst <= 1e-3

        const bal = planckStudy(specOf(n, 2, balanced3D(n)))

        let worstBal = 0

        for (const b of bal.band) {
          worstBal = Math.max(
            worstBal,
            Math.abs(b.omega - classicalOmega(KAPPA, b.k, 2)),
          )
        }

        metrics.bandWorst_balanced3D_N25 = worstBal
        p3 &&= worstBal <= 1e-2

        for (const x of T_OVER_OMEGA) {
          metrics[`balanced3DPlanckRatio_N25_T${x}`] =
            bal.ratios[`T${x}`]!
        }
      }
    }

    const p2 =
      deficits[0]! > deficits[1]! && deficits[1]! > deficits[2]!

    metrics.planckDeficitT1_N17 = deficits[0]!
    metrics.planckDeficitT1_N21 = deficits[1]!
    metrics.planckDeficitT1_N25 = deficits[2]!

    for (const n of SHIFT_BOXES) {
      for (const [tag, split, tol] of [
        ['nearThree', nearThree(n), 1e-3],
        ['balanced3D', balanced3D(n), 1e-2],
      ] as const) {
        const r = staticShift(n, 2, split)
        const wrong = (KAPPA * n) / 2

        metrics[`shiftRatio_${tag}_N${n}`] = r.ratio
        metrics[`shiftS_${tag}_N${n}`] = r.s
        metrics[`shiftF_${tag}_N${n}`] = r.f
        metrics[`shiftOverlap0_${tag}_N${n}`] = r.overlap0
        metrics[`shiftOverlap1_${tag}_N${n}`] = r.overlap1
        metrics[`shiftSigma2_${tag}_N${n}`] = r.sigma2
        metrics[`shiftResidual_${tag}_N${n}`] = r.residual
        metrics[`wrongFormFactor_N${n}`] = wrong
        metrics[`inverseAlpha_${tag}_N${n}`] = (6 * n) / r.s
        q1 &&=
          Math.abs(r.ratio - 1) < tol &&
          r.overlap0 >= 0.5 &&
          r.overlap1 >= 0.5
        q2 &&= Math.abs(r.ratio - wrong) > 0.5
      }
    }

    metrics.eStarTwoSquares = realMinimum(2, 1)

    const gates = { P1: p1, P2: p2, P3: p3, Q1: q1, Q2: q2 }

    for (const [k, v] of Object.entries(gates)) {
      metrics[`gate${k}`] = v ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    const status = Object.values(gates).every(Boolean)
      ? 'pass'
      : p1 && q1
        ? 'partial'
        : 'fail'

    return verdict({
      status,
      claim: `at kappa = 3/8 on the ladder (a STAND-IN, the husk cannot hold it) a hot box's departure from Planck at T = omega_min is ${deficits.map(d => d.toExponential(2)).join(', ')} over N = 17, 21, 25 (kappa = 2/N: ${PLANCK_BOXES.map(n => Math.abs((metrics[`referencePlanckRatio_N${n}_T1`] ?? 0) - 1).toExponential(2)).join(', ')}); the band is the classical kappa = 3/8 leapfrog within ${(metrics.bandWorst_nearThree_N25 ?? 0).toExponential(2)} (${(metrics.bandWorst_balanced3D_N25 ?? 0).toExponential(2)} with s = 1); a static charge shifts the ground by ${SHIFT_BOXES.map(n => (metrics[`shiftRatio_nearThree_N${n}`] ?? 0).toFixed(6)).join(', ')} (split near 3) and ${SHIFT_BOXES.map(n => (metrics[`shiftRatio_balanced3D_N${n}`] ?? 0).toFixed(6)).join(', ')} (s = 1) of (pi s / N) E*, against the kappa = 2/N form's ${SHIFT_BOXES.map(n => (metrics[`wrongFormFactor_N${n}`] ?? 0).toFixed(2)).join(', ')}: alpha = s / (6N), 1 / (6 (2D + 1)) at s = 1`,
      metrics,
      control: {
        referencePlanckDeficitN25: Math.abs(
          (metrics.referencePlanckRatio_N25_T1 ?? 0) - 1,
        ),
        wrongFormFactorN25: metrics.wrongFormFactor_N25 ?? 0,
      },
      notes: `L2, deterministic (exact factors read in doubles, eigenvectors by the repo's solvers; no draw). Gates: ${JSON.stringify(gates)}. A STAND-IN for the husk: E-FRC-0250 shows the 3D husk light is unstable at kappa = 3/8 (growth 2 and 2 + sqrt 3 per beat on its massive branches), so nothing here says Planck or Coulomb hold for a 3D light at c = 1/2. The husk Coulomb shape (E-FRC-0241) holds no kappa and was not re-run. FIRST RUN 2026-09-26 (tmp/frc0251.log, 78 s), FAIL on P1 and Q1, recorded as is, no gate moved. P1: at T = omega_min the kappa = 3/8 boxes (split m = 8, c = 3, r = 8, f / s = 8/3, the nearest to 3) read 0.9833, 0.9953, 0.9977 of Planck at N = 17, 21, 25 against 0.99997, 0.9999996, 0.9999998 for E-FRC-0234's kappa = 2/N split; at T = omega_min / 2 they hold 8.8e-5, 1.0e-5, 4.8e-6, so the gate misses from T = omega_min on. P2 holds (the deficit falls with N). P3 holds (band 2.2e-8, s = 1 split 5.0e-4). The Bohr-Sommerfeld capacity trim predicted before the run (0.66 to 0.90) does NOT account for four orders; a hypothesis written after the run, NOT tested: the quantum is 0.896 rad per beat against 0.40 at kappa = 2/N, so a given occupation sits nearer the 2 pi fold of a discrete-time rule. The 3D balance split (s = 1, f = 3/8) is the ladder's wrong balance and holds only 0.61 of Planck at omega_min. Q1: the split near 3 reads 0.99960, 0.99946, 1.0000010 of (pi s / N) E* (inside 1e-3); the s = 1 split reads 1.0453, 1.0134, 0.9980 (register spread 0.35 to 0.68), so it misses 1e-2 at N = 13 and 17 and converges in N, as the classical split did in E-FRC-0242. Q2 holds: the kappa = 2/N form would read 2.44, 3.19, 4.69, so C = s / (12 N) and alpha = s / (12 N c), which is s / (6N) at c = 1/2.`,
    })
  },
})
