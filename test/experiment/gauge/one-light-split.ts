// One light speed from the matter coin: which coupling gives the husk light c = 1/2, the locked token's top speed
// (E-FRC-0250). The locked token's top group velocity is exactly 1/2 per beat (E-FRC-0246), the husk photon's is
// c = sqrt(2 kappa / 3) (E-MTR-0023). The proposal (solutions map, section 3): set the light by the matter coin.
//
// THE THEOREM, derived before any run (code/measure/one-light-split has the algebra):
//   (1) c depends on kappa = s f alone; the split ratio rho = f / s never enters. So c = 1/2 is kappa = 3/8.
//   (2) the trit column light has kappa = 2 p / (2D + 1): 16 p = 3 (2D + 1) has no solution (even against odd).
//   (3) the quantum loop light has kappa = c r / m^2 (M = 2 N m): kappa = 3/8 exactly when m = 4j and c r = 6 j^2,
//       at every N. The 3D register balance rho = 3/8 is reachable (m = 8, c = 8, r = 3: s = 1); the ladder's
//       rho = 3 and the single column's rho = 2 are not (c^2 = 2 j^2, 3 j^2).
//   (4) the husk light is the leapfrog 2 - 2 cos omega = kappa lambda on the husk curl-curl, whose top eigenvalue
//       is the bulk's 16 (reached at k = (pi, 0, pi)). It is stable only for kappa <= 1/4, where c <= 1/sqrt 6.
//       At kappa = 3/8 the six massive husk branches (lambda = 12 at k = 0) grow by 2 per beat and the top mode by
//       2 + sqrt 3. So NO stable husk light has c = 1/2, whatever the split and the depth.
//   (5) under the adopted depth relation kappa = 2 / (2D + 1) the light is stable only from D = 4 (32 <= 4 (2D + 1)),
//       so D = 1, 2, 3 are unstable on the husk, D = 2 (the depth nearest c = 1/2) among them.
//
// Gates, fixed before the first run (a probe, tmp/one-speed-probe.ts, located the husk's top eigenvalue 16 at
// (pi, 0, pi) and the six k = 0 eigenvalues at 12 on a 16^3 grid before these gates were written; that is (4)'s
// input, disclosed):
// L1 no (p, D) with D <= 1000, 1 <= p <= 2D + 1 has 2 p / (2D + 1) = 3/8 (integer comparison)
// L2 for every odd N = 5 .. 49 the loop light has kappa = 3/8 splits with m <= 64, every one with m = 0 mod 4, one
//    with r / c = 3/8 exactly (8 r = 3 c), none with r = 3 c or r = 2 c
// L3 the husk curl-curl's top over a 16^3 grid is 16 within 1e-9, the husk intertwines with the bulk (defect below
//    1e-12 on the grid), the bulk's top over an 8^4 grid is at most 16 + 1e-9, and at k = 0 the husk holds six
//    eigenvalues at 12 within 1e-9
// L4 the leapfrog's growth at kappa = 3/8 is 2 + sqrt 3 (lambda = 16) and 2 (lambda = 12) within 1e-12, and at the
//    edge kappa = 1/4 it is 1 on lambda = 16
// L5 the husk photon at kappa = 3/8 has long-wave speed 1/2 within 1e-6 in all 13 directions (|k| = 1e-3): the
//    symbol does give c = 1/2, it is the massive branches that refuse it
// C1 (control: the adopted relation at any split) c(D) = sqrt(4 / (3 (2D + 1))) misses 1/2 by more than 0.01 at every
//    D = 1 .. 10,000
// C2 (control: the stable depths) kappa lambda_max <= 4 fails exactly at D = 1, 2, 3 among D = 1 .. 64
// C3 (control: the ladder stand-in) the ladder (K <= 6) and the ring (K <= 4) are stable at kappa = 3/8, so the
//    refusal is the husk's, and E-FRC-0251's ladder runs cannot see it
// Reported: the photon's top group velocity over the 13 directions at kappa = 2/9 (D = 4) and 1/4, and the alpha
// forms at c = 1/2.
// Status: pass if every gate and control holds; fail otherwise.
//
// Depth L2: exact integer existence and the husk operator's spectrum, read on the husk; a theorem with its
// controls, no start family (the claim is about every start).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { curlCurl } from '@/code/rule/plaquette-ladder'
import {
  HUSK_DIRECTIONS,
  gridTop,
  huskEigen,
  leapfrogGrowth,
  loopSplits,
  photonTopVelocity,
  tritSolutions,
} from '@/code/measure/one-light-split'

export default experiment({
  id: 'gauge/one-light-split',
  code: 'E-FRC-0250',
  title:
    "no stable husk light moves at the locked token's top speed: c = sqrt(2 kappa / 3) is set by kappa = s f alone, so c = 1/2 is kappa = 3/8, which the trit column light cannot reach at any depth (16 p = 3 (2D + 1), even against odd) and the quantum loop light reaches at every depth (m = 4j, c r = 6 j^2), but the husk curl-curl's top eigenvalue 16 makes every husk light with kappa > 1/4 unstable, so c <= 1/sqrt 6 < 1/2 and the locked token outruns every stable husk light's long-wave speed",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const metrics: Record<string, number> = {}
    const KAPPA = 3 / 8

    // L1
    const trit = tritSolutions(3, 8, 1000)
    const l1 = trit.length === 0

    metrics.tritSolutions = trit.length

    // nearest trit coupling to 3/8 with D <= 1000 and p <= 2D + 1, and the nearest at p = 1
    let nearestGap = Infinity
    let nearestP = 0
    let nearestD = 0

    for (let d = 1; d <= 1000; d++) {
      const q = 2 * d + 1

      for (let p = 1; p <= q; p++) {
        const gap = Math.abs((2 * p) / q - KAPPA)

        if (gap < nearestGap) {
          nearestGap = gap
          nearestP = p
          nearestD = d
        }
      }
    }

    metrics.tritNearestKappaGap = nearestGap
    metrics.tritNearestP = nearestP
    metrics.tritNearestD = nearestD

    // L2
    let l2 = true
    let loopCount = 0

    for (let n = 5; n <= 49; n += 2) {
      const splits = loopSplits(n, 3, 8, 64)

      loopCount += splits.length
      l2 &&= splits.length > 0
      l2 &&= splits.every(s => s.w % 4 === 0)
      l2 &&= splits.some(s => 8 * s.force === 3 * s.drift)
      l2 &&= splits.every(
        s => s.force !== 3 * s.drift && s.force !== 2 * s.drift,
      )
    }

    const balanced = loopSplits(25, 3, 8, 64).find(
      s => 8 * s.force === 3 * s.drift,
    )!

    metrics.loopSplitsN5to49 = loopCount
    metrics.balancedM = balanced.w
    metrics.balancedDrift = balanced.drift
    metrics.balancedForce = balanced.force
    metrics.balancedShareS = balanced.drift / balanced.w
    metrics.balancedShareF = balanced.force / balanced.w

    // L3
    const husk = gridTop(16, 3)
    const bulk = gridTop(8, 4)
    const atZero = huskEigen([0, 0, 0]).values
    const twelves = atZero.filter(v => Math.abs(v - 12) < 1e-9).length
    const corner = huskEigen([Math.PI, 0, Math.PI]).values
    const l3 =
      Math.abs(husk.top - 16) < 1e-9 &&
      husk.intertwining < 1e-12 &&
      bulk.top <= 16 + 1e-9 &&
      twelves === 6

    metrics.huskTop = husk.top
    metrics.huskTopAt0 = husk.at[0] ?? 0
    metrics.huskTopAt1 = husk.at[1] ?? 0
    metrics.huskTopAt2 = husk.at[2] ?? 0
    metrics.huskCornerTop = corner[corner.length - 1] ?? 0
    metrics.huskIntertwining = husk.intertwining
    metrics.bulkTop = bulk.top
    metrics.huskMassiveAtZero = twelves

    // L4
    const top = husk.top
    const kappaStable = 4 / 16
    const g16 = leapfrogGrowth(KAPPA * 16)
    const g12 = leapfrogGrowth(KAPPA * 12)
    const gEdge = leapfrogGrowth(kappaStable * 16)
    const l4 =
      Math.abs(g16 - (2 + Math.sqrt(3))) < 1e-12 &&
      Math.abs(g12 - 2) < 1e-12 &&
      gEdge === 1

    metrics.growthTop = g16
    metrics.growthMassiveZero = g12
    metrics.growthEdge = gEdge
    metrics.kappaStableMax = 4 / top
    metrics.lightSpeedStableMax = Math.sqrt((2 * (4 / top)) / 3)
    metrics.matterOverLightAtEdge = 0.5 / Math.sqrt((2 * (4 / top)) / 3)

    // L5
    let l5 = true
    let worstSpeed = 0

    for (const dir of HUSK_DIRECTIONS) {
      const norm = Math.hypot(...dir)
      const t = 1e-3
      const v = huskEigen(dir.map(x => (x / norm) * t)).values
      const c = Math.sqrt(KAPPA * (v[1] ?? 0)) / t

      worstSpeed = Math.max(worstSpeed, Math.abs(c - 0.5))
      l5 &&= Math.abs(c - 0.5) < 1e-6
    }

    metrics.longWaveSpeedWorst = worstSpeed

    // C1
    let minGap = Infinity
    let minGapD = 0

    for (let d = 1; d <= 10000; d++) {
      const gap = Math.abs(Math.sqrt(4 / (3 * (2 * d + 1))) - 0.5)

      if (gap < minGap) {
        minGap = gap
        minGapD = d
      }
    }

    const c1 = minGap > 0.01

    metrics.depthRelationMinGap = minGap
    metrics.depthRelationMinGapD = minGapD

    // C2: kappa lambda_max = 32 / (2D + 1) <= 4 in integers: 32 <= 4 (2D + 1)
    const unstable: number[] = []

    for (let d = 1; d <= 64; d++) {
      if (32 > 4 * (2 * d + 1)) {
        unstable.push(d)
      }
    }

    const c2 =
      unstable.length === 3 && unstable[0] === 1 && unstable[2] === 3

    metrics.unstableDepths = unstable.length
    metrics.lightSpeedAtD4 = Math.sqrt(4 / 27)

    // C3
    const ladderTop = KAPPA * curlCurl(Math.PI, 2)
    const ringTop = KAPPA * 4
    const c3 =
      ladderTop <= 4 && ringTop <= 4 && leapfrogGrowth(ladderTop) === 1

    metrics.ladderTopKappaK = ladderTop
    metrics.ringTopKappaK = ringTop

    // reported: the photon's top group velocity (two lowest nonzero branches) over 13 directions
    for (const [tag, kappa] of [
      ['D4', 2 / 9],
      ['edge', 1 / 4],
    ] as const) {
      let best = 0

      for (const dir of HUSK_DIRECTIONS) {
        best = Math.max(best, photonTopVelocity(kappa, dir))
      }

      metrics[`photonTopGroupVelocity_${tag}`] = best
    }

    // the alpha forms at c = 1/2 (N = 2D + 1): s / (12 N c) = s / (6 N), 1 / (6 N) at s = 1
    for (const d of [4, 16, 49]) {
      metrics[`inverseAlphaAtHalf_s1_D${d}`] = 6 * (2 * d + 1)
    }

    metrics.inverseAlphaWrongForm_s1 = 32

    const gates = {
      L1: l1,
      L2: l2,
      L3: l3,
      L4: l4,
      L5: l5,
      C1: c1,
      C2: c2,
      C3: c3,
    }

    for (const [k, v] of Object.entries(gates)) {
      metrics[`gate${k}`] = v ? 1 : 0
    }

    metrics.seconds = (Date.now() - started) / 1000

    return verdict({
      status: Object.values(gates).every(Boolean) ? 'pass' : 'fail',
      claim: `c = 1/2 is kappa = 3/8 at any split; the trit column light has no (p, D) there (nearest ${nearestGap.toExponential(2)} off at p = ${nearestP}, D = ${nearestD}), the loop light has it at every N (the balanced 3D split m = ${balanced.w}, c = ${balanced.drift}, r = ${balanced.force}: s = 1, f = 3/8); but the husk curl-curl tops at ${husk.top.toFixed(12)} (bulk ${bulk.top.toFixed(12)}), so a husk light is stable only at kappa <= 1/4 and c <= ${metrics.lightSpeedStableMax.toFixed(6)}, and at kappa = 3/8 its massive branches grow ${g12.toFixed(6)} and ${g16.toFixed(6)} per beat; under kappa = 2 / (2D + 1) the depths D = ${unstable.join(', ')} are unstable, and matter's 1/2 is ${metrics.matterOverLightAtEdge.toFixed(4)} times the fastest stable long-wave light; the photon's top group velocity is ${metrics.photonTopGroupVelocity_D4!.toFixed(4)} at D = 4 and ${metrics.photonTopGroupVelocity_edge!.toFixed(4)} at kappa = 1/4`,
      metrics,
      control: {
        depthRelationMinGap: minGap,
        unstableDepths: unstable.length,
        ladderTopKappaK: ladderTop,
      },
      notes: `L2, deterministic (integer existence; the spectra by the repo's Hermitian solver on fixed grids; no draw). Gates: ${JSON.stringify(gates)}. The proposal was "the split chosen so c = 1/2"; the split ratio does not enter c, so the only knob is kappa, and the husk refuses kappa = 3/8 by stability, not by arithmetic alone. FIRST RUN 2026-09-26 (tmp/frc0250.log, 14 s), PASS on all eight. The husk top is reached at (pi, pi, 0) on the grid (and at (pi, 0, pi), 15.999999999999998). The photon's top group velocity equals its long-wave c at D = 4 and kappa = 1/4 (0.38490, 0.40825): no photon signal outruns c there, so the gap to 1/2 is a gap in the front speed too.`,
    })
  },
})
