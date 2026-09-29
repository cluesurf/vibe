// CAN THE HUSK LIGHT MOVE AT THE REGISTER'S ONE SPEED? (E-FRC-0260). Under the Clifford register matter and the
// graviton share one limiting speed (E-SPN-0160, E-GRV-0145). The husk light has to share it too, or there are two
// speeds. This file fixes the units, finds every exact coupling that gives the light that speed, and measures it.
//
// DERIVED BEFORE THE GATE RUN.
// 1. THE UNITS. E-SPN-0160 works in D4 coordinates: the stream moves one root, length c = sqrt 2, a beat, K is the D4
//    wave vector, and per beat e^2 = m^2 + c0^2 |K|^2 with c0^2 = 1/8 exactly, c0 = sqrt 2 / 4 = c / 4. The husk light
//    lives on the same bulk links (code/rule/photon-links, photonLatticeD4) and the husk reads the bulk's k4 = 0 block
//    (code/measure/photon-husk), so its wave vector is (k1, k2, k3, 0) in THE SAME coordinates, and the husk docks are
//    Z^3 in them (the husk quotient, E-SPN-0155: the D4 mesh with depth period 2). Its leapfrog steps once a beat
//    (E-FRC-0207 runs it bit for bit on the rule's trits), and 2 - 2 cos omega = kappa lambda(k) with lambda = (2/3) |k|^2
//    at long wave, so c_L^2 = 2 kappa / 3 in coordinates per beat. So the register's c / 4 is sqrt 2 / 4 = 0.35355 on
//    the husk's own scale, NOT 0.25: "c" is the root's length, sqrt 2, not one dock. One speed is exactly
//    2 kappa / 3 = 1/8, that is kappa = 3/16.
// 2. THE TRIT COLUMN LIGHT CANNOT (a theorem). Its coupling is kappa = 2 p / (2D + 1), p a positive integer (E-FRC-0207,
//    E-FRC-0250). kappa = 3/16 needs 32 p = 3 (2D + 1): even against odd, no solution at any p and D, and no integer drift
//    factor changes the parity. More sharply, every trit column kappa has 2-adic valuation at least 1 and 3/16 has -4.
//    Under the adopted relation (p = 1) the nearest depth is D = 5, kappa = 2/11, c_L 1.5 percent slow.
// 3. THE QUANTUM LOOP LIGHT CAN, AT EVERY N (a theorem). Its coupling is kappa = c r / m^2 with integer drift c, force r,
//    and root M = 2 N m (code/rule/loop-ring, E-FRC-0250). kappa = 3/16 needs 16 c r = 3 m^2, so 16 | m^2, m = 4j and
//    c r = 3 j^2, at every N: the depth no longer sets the speed. The least is m = 4 with (c, r) = (1, 3) or (3, 1).
// 4. BUT NOT AT THE 3D BALANCE (a theorem). The split ratio rho = r / c is 3 j^2 / c^2 on these splits. rho = 3 (the
//    ladder's balance, E-FRC-0234, 0242) is reached (c = j, r = 3j: s = 1/4, f = 3/4 at m = 4). The husk's own 3D
//    balance rho = 3/8 (E-FRC-0242: 12 links over 32 triangles a bulk dock, which gives alpha = 1 / (6 (2D + 1))) is
//    never reached: with 8 r = 3 c, c = 8t, r = 3t, kappa = 24 t^2 / m^2 and c_L = 4t / m, a RATIONAL speed, while
//    sqrt 2 / 4 is irrational. So on the husk's own balance one speed holds only approximately (m <= 64: 12/34,
//    0.17 percent slow), and exactly only if the light's split is not the 3D balance.
// 5. STABILITY. The husk curl-curl tops at 16 (E-FRC-0250), so a husk light is stable for kappa <= 1/4. kappa = 3/16
//    gives kappa lambda <= 3 < 4: stable, every branch on the unit circle. The register's speed, 0.35355, sits below the
//    stable cap 1/sqrt 6 = 0.40825, so the old refusal (matter at the slot rule's top outrunning every stable light,
//    E-FRC-0250) does not apply to the register rule.
// 6. THE LIMITING SPEED. The photon's top group velocity is its long-wave speed (E-FRC-0250 at D = 4 and kappa = 1/4),
//    so at kappa = 3/16 no photon signal outruns sqrt 2 / 4 and the light's limiting speed is the register's.
//
// PREDICTED: every gate below holds, and the verdict is PARTIAL: one speed is exact on the quantum loop light at
// kappa = 3/16, stable and isotropic, but only at a split that is not the husk's 3D balance, and never on the adopted
// trit column light. Whether the split is free (a knob) or fixed is the question this leaves.
//
// GATES, fixed before the gate run (probe 1, tmp/osq-probe1.log, read the husk's long-wave lambda / |k|^2 = 2/3 and
// the long-wave speed at kappa = 3/16 on 13 directions, the top group velocity, the adopted relation's depths 3 to 7
// and the 3D balance's nearest split before these were written; disclosed):
// U1 UNITS: on 13 husk directions the long-wave lambda_1 / |k|^2 and lambda_2 / |k|^2 are 2/3 within 1e-6 (so
//    c_L^2 = 2 kappa / 3 in D4 coordinates per beat, the coordinates of E-SPN-0160's c0^2 = 1/8)
// L1 TRIT: no (p, D), D <= 10,000, 1 <= p <= 2D + 1, with 32 p = 3 (2D + 1) (integer comparison)
// L2 LOOP: for every odd N = 5 .. 49 splits with 16 c r = 3 m^2 exist with m <= 64, every one has m = 0 mod 4, the
//    least m is 4 with exactly the drifts {1, 3}, one has r = 3c (rho = 3), none has 8 r = 3 c (rho = 3/8)
// L3 BALANCE: for every m <= 64 and t with 8t <= m, 4t / m differs from sqrt 2 / 4 (squared: 128 t^2 != m^2 in
//    integers, the irrationality made finite)
// L4 STABLE: kappa lambda = 3 on the husk's top 16 and 2.25 on the six k = 0 branches at 12, the leapfrog's growth
//    there 1 (on the unit circle)
// L5 SPEED: at kappa = 3/16 the long-wave speed is sqrt 2 / 4 within 1e-6 on all 13 directions, and the photon's top
//    group velocity over them is at most sqrt 2 / 4 (1 + 1e-6)
// C1 (control, E-FRC-0250) the husk top over a 16^3 grid is 16 within 1e-9, and the photon's top group velocity is
//    0.38490 at kappa = 2/9 (D = 4) and 0.40825 at kappa = 1/4, within 1e-4
// C2 (control, E-FRC-0212, 0235) at kappa = 2/33 (D = 16) the long-wave speed is sqrt(2 kappa / 3) within 1e-6 on all 13
//    directions
// C3 (control, the reading this corrects) at kappa = 3/32, where c_L = 1/4 (the register's speed misread in dock units),
//    the long-wave speed is 0.25 within 1e-6 and differs from sqrt 2 / 4 by more than 0.1: the units decide the match
// READ, gating nothing: the adopted relation's nearest depths, the 3D balance's nearest split with its miss.
// Status: partial if every gate and control holds (derived: exact only off the 3D balance); fail otherwise.
//
// Depth L2: integer existence and the husk operator's spectrum, read on the husk; a theorem with its controls, no
// start family (the claim is about every start).
//
// FIRST RUN 2026-09-28 (tmp/osq-exp-run1.log, 8 s): PARTIAL as predicted, all nine gates held, no gate moved.
// lambda / |k|^2 = 2/3 to 2.1e-8; 0 trit solutions to D = 10,000; 3,772 loop splits over N = 5 .. 49, least m = 4;
// the 3D balance's nearest m <= 64 is 12/34, 0.173 percent slow; long-wave speed sqrt 2 / 4 to 5.6e-9 on 13
// directions, top group velocity 0.9999956 of it; husk top 16, D = 4 top 0.38490, kappa = 1/4 top 0.40825; the
// adopted relation's nearest depth D = 5 is 1.53 percent slow.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  HUSK_DIRECTIONS,
  gridTop,
  huskEigen,
  leapfrogGrowth,
  loopSplits,
  photonTopVelocity,
} from '@/code/measure/one-light-split'

/** The register's one speed on the husk, in D4 coordinates per beat: c / 4 with c = sqrt 2 (E-SPN-0160). */
const TARGET = Math.SQRT2 / 4

/** The coupling that gives it: 2 kappa / 3 = 1/8. */
const KAPPA = 3 / 16

/** The long-wave step along a direction, and the tolerances. */
const LONG_WAVE = 1e-3
const SPEED_TOLERANCE = 1e-6

/** The long-wave speed sqrt(kappa lambda_1) / t and lambda_1, lambda_2 over |k|^2 along one direction. */
function longWave(
  kappa: number,
  dir: readonly number[],
): { speed: number; ratio1: number; ratio2: number } {
  const norm = Math.hypot(...dir)
  const v = huskEigen(dir.map(x => (x / norm) * LONG_WAVE)).values
  const t2 = LONG_WAVE * LONG_WAVE

  return {
    speed: Math.sqrt(kappa * (v[1] ?? 0)) / LONG_WAVE,
    ratio1: (v[1] ?? 0) / t2,
    ratio2: (v[2] ?? 0) / t2,
  }
}

export function registerLightSpeedRun(): Verdict {
  const started = Date.now()
  const metrics: Record<string, number> = {}

  // U1
  let u1 = true
  let unitWorst = 0

  for (const dir of HUSK_DIRECTIONS) {
    const w = longWave(KAPPA, dir)

    unitWorst = Math.max(
      unitWorst,
      Math.abs(w.ratio1 - 2 / 3),
      Math.abs(w.ratio2 - 2 / 3),
    )
  }

  u1 = unitWorst < 1e-6
  metrics.unitRatioWorst = unitWorst

  // L1
  let tritCount = 0

  for (let d = 1; d <= 10000; d++) {
    const q = 2 * d + 1

    for (let p = 1; p <= q; p++) {
      if (32 * p === 3 * q) {
        tritCount++
      }
    }
  }

  const l1 = tritCount === 0

  metrics.tritSolutions = tritCount

  // L2
  let l2 = true
  let loopCount = 0

  for (let n = 5; n <= 49; n += 2) {
    const splits = loopSplits(n, 3, 16, 64)
    const least = Math.min(...splits.map(s => s.w))
    const leastDrifts = splits
      .filter(s => s.w === least)
      .map(s => s.drift)
      .sort((a, b) => a - b)

    loopCount += splits.length
    l2 &&= splits.length > 0
    l2 &&= splits.every(s => s.w % 4 === 0)
    l2 &&= least === 4 && leastDrifts.join(',') === '1,3'
    l2 &&= splits.some(s => s.force === 3 * s.drift)
    l2 &&= splits.every(s => 8 * s.force !== 3 * s.drift)
  }

  metrics.loopSplitsN5to49 = loopCount

  // L3: 128 t^2 = m^2 would make (4t / m)^2 = 1/8
  let l3 = true
  let nearest = { t: 0, m: 0, gap: Infinity }

  for (let m = 1; m <= 64; m++) {
    for (let t = 1; 8 * t <= m; t++) {
      l3 &&= 128 * t * t !== m * m

      const gap = Math.abs((4 * t) / m - TARGET)

      if (gap < nearest.gap) {
        nearest = { t, m, gap }
      }
    }
  }

  metrics.balanceNearestT = nearest.t
  metrics.balanceNearestM = nearest.m
  metrics.balanceNearestSpeed = (4 * nearest.t) / nearest.m
  metrics.balanceNearestMissPercent =
    ((4 * nearest.t) / nearest.m / TARGET - 1) * 100

  // L4
  const g16 = leapfrogGrowth(KAPPA * 16)
  const g12 = leapfrogGrowth(KAPPA * 12)
  const l4 =
    KAPPA * 16 === 3 && KAPPA * 12 === 2.25 && g16 === 1 && g12 === 1

  metrics.kappaLambdaTop = KAPPA * 16
  metrics.growthTop = g16
  metrics.growthMassiveZero = g12

  // L5
  let speedWorst = 0
  let topVelocity = 0

  for (const dir of HUSK_DIRECTIONS) {
    speedWorst = Math.max(
      speedWorst,
      Math.abs(longWave(KAPPA, dir).speed - TARGET),
    )
    topVelocity = Math.max(topVelocity, photonTopVelocity(KAPPA, dir))
  }

  const l5 =
    speedWorst < SPEED_TOLERANCE &&
    topVelocity <= TARGET * (1 + SPEED_TOLERANCE)

  metrics.longWaveSpeedWorst = speedWorst
  metrics.topGroupVelocity = topVelocity
  metrics.topOverTarget = topVelocity / TARGET

  // C1
  const husk = gridTop(16, 3)

  let topD4 = 0
  let topEdge = 0

  for (const dir of HUSK_DIRECTIONS) {
    topD4 = Math.max(topD4, photonTopVelocity(2 / 9, dir))
    topEdge = Math.max(topEdge, photonTopVelocity(1 / 4, dir))
  }

  const c1 =
    Math.abs(husk.top - 16) < 1e-9 &&
    Math.abs(topD4 - 0.3849) < 1e-4 &&
    Math.abs(topEdge - 0.40825) < 1e-4

  metrics.huskTop = husk.top
  metrics.photonTopD4 = topD4
  metrics.photonTopEdge = topEdge

  // C2
  const kappa16 = 2 / 33

  let c2Worst = 0

  for (const dir of HUSK_DIRECTIONS) {
    c2Worst = Math.max(
      c2Worst,
      Math.abs(
        longWave(kappa16, dir).speed - Math.sqrt((2 * kappa16) / 3),
      ),
    )
  }

  const c2 = c2Worst < SPEED_TOLERANCE

  metrics.depth16SpeedWorst = c2Worst

  // C3
  let c3Worst = 0

  for (const dir of HUSK_DIRECTIONS) {
    c3Worst = Math.max(
      c3Worst,
      Math.abs(longWave(3 / 32, dir).speed - 0.25),
    )
  }

  const c3 = c3Worst < SPEED_TOLERANCE && TARGET - 0.25 > 0.1

  metrics.quarterDockSpeedWorst = c3Worst
  metrics.quarterDockMiss = TARGET - 0.25

  // READ: the adopted relation kappa = 2 / (2D + 1), depths 3 to 7
  for (let d = 3; d <= 7; d++) {
    metrics[`adoptedMissPercentD${d}`] =
      (Math.sqrt(4 / (3 * (2 * d + 1))) / TARGET - 1) * 100
  }

  const gates = {
    U1: u1,
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
    status: Object.values(gates).every(Boolean) ? 'partial' : 'fail',
    claim: `in D4 coordinates per beat the register's one speed is c / 4 = sqrt 2 / 4 = ${TARGET.toFixed(6)} (not 0.25: c is the root's length) and the husk light's is sqrt(2 kappa / 3) (lambda / |k|^2 = 2/3 to ${unitWorst.toExponential(1)} on 13 directions), so one speed is kappa = 3/16; the trit column light never has it (32 p = 3 (2D + 1), even against odd, 0 solutions to D = 10,000; nearest adopted depth D = 5 at ${metrics.adoptedMissPercentD5!.toFixed(2)} percent), the quantum loop light has it at every N (16 c r = 3 m^2, m = 4j, c r = 3 j^2; least m = 4, drifts 1 and 3; ${loopCount} splits over N = 5 .. 49) with the ladder's balance rho = 3 (s = 1/4, f = 3/4) but never with the husk's 3D balance rho = 3/8, whose speed 4t / m is rational (nearest ${metrics.balanceNearestSpeed.toFixed(6)}, ${metrics.balanceNearestMissPercent.toFixed(3)} percent, at m = ${nearest.m}); at kappa = 3/16 the husk light is stable (kappa lambda at most 3, growth 1), isotropic (long-wave speed sqrt 2 / 4 to ${speedWorst.toExponential(1)} on 13 directions) and its top group velocity is ${metrics.topOverTarget.toFixed(7)} of sqrt 2 / 4, so the register's speed sits under the stable cap 1/sqrt 6 and the old refusal does not apply`,
    metrics,
    control: {
      huskTop: husk.top,
      photonTopD4: topD4,
      photonTopEdge: topEdge,
      depth16SpeedWorst: c2Worst,
      quarterDockSpeedWorst: c3Worst,
    },
    notes: `L2, deterministic (integer existence; the husk spectrum by the repo's Hermitian solver on fixed directions and a fixed 16^3 grid; no draw). Gates: ${JSON.stringify(gates)}. Predicted partial: exact one speed needs a split other than the 3D balance.`,
  })
}

export default experiment({
  id: 'gauge/register-light-speed',
  code: 'E-FRC-0260',
  title:
    "the husk light at the register's one speed, partial: in D4 coordinates per beat the register's c / 4 is sqrt 2 / 4 and the husk light's speed is sqrt(2 kappa / 3), so one speed is kappa = 3/16, stable (kappa lambda at most 3) and isotropic on the husk; the trit column light never reaches it (32 p = 3 (2D + 1), even against odd), the quantum loop light reaches it at every depth (m = 4j, c r = 3 j^2) with the ladder's balance rho = 3 but never with the husk's 3D balance rho = 3/8, whose speed 4t / m is rational; the register's speed sits under the stable cap 1/sqrt 6, so the old refusal of one speed does not apply to the register rule",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerLightSpeedRun()
  },
})
