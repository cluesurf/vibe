// IS THE LIGHT'S SPLIT FREE OR FIXED, AND WHAT DOES IT DO TO ONE SPEED AND TO ALPHA? (E-FRC-0261). E-FRC-0260 found
// the husk light, matter and the graviton share one exact speed sqrt 2 / 4 (kappa = 3/16) on the quantum loop light
// at the split rho = f / s = 3, and never at the husk's 3D balance rho = 3/8. This file settles where the split
// comes from, whether one exact speed and the balance can hold together, and what alpha is at each.
//
// DERIVED BEFORE THE GATE RUN (no probe was run; the arithmetic below was done by hand while writing this).
// 1. WHERE THE SPLIT COMES FROM. The classical light fixes only kappa = s f (E-FRC-0207); the split is the quantum
//    light's (E-FRC-0230, 0242). E-FRC-0234 derived and measured on the ladder the one law that fixes it, a VIRIAL
//    identity: in any stationary state s sum_links <e^2> = f sum_plaquettes <B^2>, whatever the occupations. So the
//    average link column and the average plaquette column fill alike, and reach their seams at +-D at the same
//    temperature, exactly when rho = (link columns) / (plaquette columns): the balance. On the ladder that is 3
//    links per square (two rails and a rung), rho = 3; on the single column, 2. E-FRC-0242 carried the count to the
//    3D trit bulk: 12 links and 32 triangles per bulk dock, rho = 3/8, "carried over, NOT measured in 3D".
//    SO THE SPLIT IS NOT A SYMMETRY AND NOT FORCED BY THE RULE: the rule runs at any integer split (the classical
//    light, Gauss, gauge, the polarizations, stability and the Coulomb SHAPE depend on kappa alone, E-FRC-0251 P3).
//    It is fixed by a physical requirement, Planck to the highest temperature, and a split off the balance pays in
//    Planck: E-FRC-0251 measured the 3D-balance split on the LADDER (8 times off the ladder's balance) at 0.61 of
//    Planck at T = omega_min. A chosen criterion, measured to matter, with one right answer per lattice.
//    The 3D count has an ambiguity: bulk registers (12 / 32 = 3/8) or distinct husk columns (9 link directions,
//    20 triangles: 9/20), or the mixed readings 12/20 and 9/32. Point 3 holds for every one of them.
// 2. RHO = 3 IS CONSISTENT WITH EVERYTHING THE LIGHT HOLDS EXCEPT THE HUSK'S BALANCE. Gauss's law, gauge invariance,
//    the two polarizations, stability (kappa lambda <= 3 < 4 at kappa = 3/16, E-FRC-0260), reversibility and the
//    husk Coulomb shape 1/(24 pi r) (E-FRC-0241, no kappa in it) are split-free. The Coulomb COEFFICIENT is the
//    drift's: C = s / (12 N) (E-FRC-0242's shift theorem), so at rho = 3, s = 1/4 at kappa = 3/16. On the ladder,
//    whose balance IS 3, rho = 3 is the right split; on the 3D husk it is 8 times off the balance (link columns fill
//    8 times faster than face columns, so their seams arrive at about sqrt 8 times lower temperature).
// 3. BOTH TOGETHER, A THEOREM. kappa = c r / m^2 = 3/16 and rho = r / c give c^2 rho = 3 m^2 / 16, so rho / 3 =
//    (m / 4c)^2: exact one speed at a balanced split needs the balance to be 3 times a rational square. 3 is (the
//    ladder, which is why E-FRC-0260 found it). 3/8 (1/8), 9/20 (3/20), 3/5 (1/5), 9/32 (3/32) and 2 (2/3) are not.
//    So on the 3D husk exact one speed and the balance CANNOT both hold, under every count.
// 4. BUT THE BALANCE MEETS ONE SPEED AS A LIMIT OF THE REGISTER. At rho = 3/8 (c = 8t, r = 3t) the speed is 4t / m,
//    rational, and sqrt 2 / 4 is irrational, so never exactly. Take t = p, m = 16q for a Pell pair p^2 - 2q^2 = +-1:
//    16 c r - 3 m^2 = 384 (p^2 - 2 q^2), so the squared speed is 1/8 (1 +- 1/(2 q^2)) EXACTLY and the speed misses by
//    about 1/(4 q^2). s = p / (2q), about 0.707, and f = 3p / (16q), both below 1. So the 0.17 percent of E-FRC-0260
//    was its m <= 64 search, not a floor: q = 12 (m = 192) gives 0.17 percent, q = 70 (m = 1,120) 5e-5, q = 408
//    (m = 6,528) 1.5e-6, and matching light to matter within 1e-18 needs q > 5e8, a register m > 8e9. One speed is
//    then not a law of the balanced light but a limit, reached as the register grows, like the e^(4 pi) register
//    of the black holes: a size the model has to have.
// 5. ALPHA IS UNTOUCHED BY ONE SPEED. alpha = s / (12 N c) (E-FRC-0250, the static coefficient over the light's
//    speed), with s = sqrt(kappa / rho) and c = sqrt(2 kappa / 3), is sqrt(3 / (2 rho)) / (12 N): kappa cancels. So
//    choosing kappa = 3/16 changes nothing in alpha; the split and the depth set it. At the 3D balance alpha stays
//    1 / (6 (2D + 1)), the adopted form; at rho = 3 it is 1 / (12 sqrt 2 (2D + 1)), which is E-FRC-0242's "rho = 3"
//    form exactly (it was written at kappa = 2 / N, and kappa does not enter), already tested there for D <= 200.
// 6. THE PREDICTION TEST, frozen here before any number is computed by code. Formula: 1/alpha = 12 N sqrt(2 rho / 3),
//    N = 2D + 1. Admissible set: every integer D from 1 to 10,000 (the loop light is stable at kappa = 3/16 at every
//    N, E-FRC-0260, so no depth is excluded), at rho = 3 (the exact one-speed split) and rho = 3/8 (the husk's
//    balance). Target 137.035999177 (CODATA 2022). The claim a hit would carry is judged by the null of E-MTH-0010:
//    a line A N over odd N lands within a relative eps of T by chance with probability about eps T / A (the
//    fraction of the spacing 2A that the window 2 eps T covers). Predicted: no D within 1e-3 at either split
//    (hand arithmetic while writing point 5: 137.036 / (12 sqrt 2) = 8.07 and 137.036 / 6 = 22.84, neither near an
//    odd integer). Nothing is claimed from a value of D either way (E-MTH-0024: no number-only identification of
//    alpha is admissible).
// 7. READ, gating nothing: E-FRC-0240's golden-rule form alpha = 1 / (2 N sqrt rho) is defined through a STAND-IN
//    atom's dipole; against the Coulomb form it is larger by 2 sqrt 6 = sqrt 24 at every rho and N (1 / (2 N sqrt rho)
//    over sqrt(3 / (2 rho)) / (12 N) = 12 / (2 sqrt(3/2)) = sqrt 24). The model carries two alphas that differ by
//    sqrt 24; the Coulomb one is the one defined as the energy between two charges over the light's speed.
//
// PREDICTED: every gate holds, and the verdict is PARTIAL: the split is fixed by the virial balance (a Planck
// criterion, not a symmetry); exact one speed and the husk's balance cannot hold together under any count; the
// balance meets one speed as a limit of the register, to 1/(4 q^2) at m = 16q; alpha does not depend on kappa and
// no depth gives 137.036 at either split.
//
// GATES, fixed before the gate run:
// O1 COUNTS: the trit bulk (side 4, D 2) holds 12 links and 32 triangles per bulk dock, the husk 9 link directions
//    of total weight 12 and 20 triangles of total multiplicity 32 per husk dock (integers, exact)
// O2 JOINT THEOREM: of the balances 3/8, 9/20, 3/5, 9/32, 2 and 3, only 3 is 3 times a rational square (integer
//    test), and the integer search 16 c r = 3 m^2, b r = a c, m <= 256 finds splits for 3 and none for the others
// O3 PELL LADDER: for every Pell pair with q <= 10^9 the split (8p, 3p, 16q) has 8 r = 3 c, s and f at most 1, and
//    its squared-speed miss is exactly (p^2 - 2q^2) / (2 q^2) (BigInt identity); and no m <= 10^6 has 128 t^2 = m^2
//    for the t nearest m / (8 sqrt 2) or its neighbours
// W1 SPLIT-FREE LIGHT (the ladder, a STAND-IN for the husk's quantum light): at N = 25 the one-quantum band at kappa
//    = 3/16 equals the classical leapfrog's omega within 1e-3 for the rho = 3 split (m = 4, c = 1, r = 3) and within
//    1e-2 for the split nearest 3/8
// W2 COULOMB COEFFICIENT at rho = 3: a stand-in static charge shifts the ground by (pi s / N) E* within 1e-3, both
//    sectors' ground overlaps >= 0.5, at N = 13, 17, 25 (C = s / (12 N) with s = 1/4)
// W3 THE BALANCE MATTERS: at T = omega_min the rho = 3 split's departure from Planck is below the nearest-3/8
//    split's at N = 17, 21, 25 (on the ladder 3 is the balance and 3/8 is 8 times off it)
// A1 CONTROL (the old alpha): sqrt(3 / (2 * 3/8)) / (12 N) === 1 / (6 N) bit for bit for D = 1 .. 200, and E-FRC-0242's
//    alphaOfRatio(D, 3/8) within 4e-16 relative of it
// A2 CONTROL (E-FRC-0260): at kappa = 3/16 the least register is m = 4 with drifts {1, 3} for every odd N = 5 .. 49,
//    and the balance's nearest speed with m <= 64 is 12/34
// A3 KAPPA-FREE: s / (12 N c) equals sqrt(3 / (2 rho)) / (12 N) within 1e-14 relative at kappa = 3/16, 3/8 and 2 / N,
//    rho = 3 and 3/8, N = 9, 25, 101
// P1 PREDICTION: no D in 1 .. 10,000 puts 1/alpha within 1e-3 relative of 137.035999177 at rho = 3 or at rho = 3/8
// READ: the nearest D and its miss per split, the null's chance per split, the golden-rule form at each split and
// its ratio to the Coulomb form, the Planck ratios, the register m needed for a miss below 1e-18.
// Status: partial if every gate holds (derived: a no-go for exactness at the husk's balance, a limit, no alpha);
// fail otherwise.
//
// Depth L2: integer existence, exact identities, and the model's quantum light on a ladder of husk squares (a
// stand-in for the 3D husk's quantum light, which does not fit in memory); no start family (every claim is about
// every start or about the rule's constants).
//
// FIRST RUN 2026-09-28 (tmp/lso-exp-run1.log, 38 s): PARTIAL as predicted, all ten gates held, no gate moved, no
// probe run before it. Counts 12 / 32 bulk, 9 directions of weight 12 and 20 triangles of multiplicity 32 on the
// husk. Only rho = 3 is 3 times a rational square (64 joint splits to m = 256; 0 for 3/8, 9/20, 3/5, 9/32, 2).
// 24 Pell pairs to q = 1e9, every one exact; squared-speed miss 3.5e-3 at m = 192, 1.0e-4 at m = 1,120, 3.0e-6 at
// m = 6,528; a miss below 1e-18 needs m = 8.69e9; 0 exact speeds at the balance to m = 1e6. Ladder at kappa = 3/16:
// rho = 3 band 3.4e-9 from the classical light, shift 1.000304, 0.999998, 1.000000 of (pi s / N) E* (s = 1/4,
// overlaps 0.94), Planck at omega_min 0.99953, 0.99981, 0.99996 against the near-3/8 split's 0.885, 0.948, 0.892.
// alpha free of kappa to 2.2e-16. P1: nearest at rho = 3 is D = 4, 1/alpha = 152.735 (11.5 percent); at rho = 3/8
// it is D = 11, 1/alpha = 6 * 23 = 138 exactly (0.70 percent), outside the frozen 1e-3 window, and the null puts
// SOME depth within 0.70 percent with chance about 0.0070 * 137 / 3 = 0.32 at that line's spacing (2 * 6 per unit
// of D), so nothing is claimed. The golden-rule form is sqrt 24 = 4.898979 times the Coulomb form at every split
// (nearest 1/alpha 135.100 at D = 19 for rho = 3, 135.947 at D = 55 for 3/8, both outside the window).

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { classicalOmega, type LadderSpec } from '@/code/rule/plaquette-ladder'
import type { Split } from '@/code/rule/loop-ring'
import { oneQuantumBand, planck, thermalEnergy, unwrapped } from '@/code/measure/quantum-ladder'
import { alphaOfRatio, staticShift } from '@/code/measure/split-coulomb'
import { loopSplits, nearestRatio } from '@/code/measure/one-light-split'
import {
  alphaCoulomb,
  alphaGoldenRule,
  alphaOfBalance,
  isThreeRationalSquare,
  jointSplits,
  nearestDepth,
  pellPairs,
  pellSplit,
  registerCounts,
} from '@/code/measure/light-split-origin'

/** The one-speed coupling, 2 kappa / 3 = 1/8 in D4 coordinates (E-FRC-0260). */
const KAPPA = 3 / 16

/** The inverse fine-structure constant, CODATA 2022. */
const TARGET = 137.035999177

/** The prediction's window and admissible depths, frozen in the header. */
const WINDOW = 1e-3
const MAX_DEPTH = 10000

/** The balances point 3 tests, as [a, b] for a / b. */
const BALANCES: readonly (readonly [number, number])[] = [
  [3, 8],
  [9, 20],
  [3, 5],
  [9, 32],
  [2, 1],
  [3, 1],
]

const PLANCK_BOXES = [17, 21, 25]
const SHIFT_BOXES = [13, 17, 25]

const specOf = (n: number, L: number, split: Split): LadderSpec => ({ n, plaquettes: L, root: split.root, drift: split.drift, force: split.force })

/** The exact one-speed split at the ladder's balance: m = 4, c = 1, r = 3. */
const rhoThree = (n: number): Split => loopSplits(n, 3, 16, 64).find(s => s.w === 4 && s.force === 3 * s.drift)!

/** The one-speed split nearest the husk's 3D balance 3/8. */
const nearBalance3D = (n: number): Split => nearestRatio(loopSplits(n, 3, 16, 64), [3, 8])

function planckAt(spec: LadderSpec, x: number): { ratio: number; worstBand: number } {
  const { band, levels } = oneQuantumBand(spec)
  const { energies } = unwrapped(levels)
  const omegas = band.map(b => b.omega)
  const T = x * Math.min(...omegas)
  let worstBand = 0

  for (const b of band) worstBand = Math.max(worstBand, Math.abs(b.omega - classicalOmega(KAPPA, b.k, 2)))

  return { ratio: thermalEnergy(energies, T) / omegas.reduce((acc, w) => acc + planck(w, T), 0), worstBand }
}

export function lightSplitOriginRun(): Verdict {
  const started = Date.now()
  const metrics: Record<string, number> = {}

  // O1
  const counts = registerCounts()
  const o1 =
    counts.bulkLinks === 12 &&
    counts.bulkTriangles === 32 &&
    counts.huskLinkDirections === 9 &&
    counts.huskLinkWeight === 12 &&
    counts.huskTriangles === 20 &&
    counts.huskTriangleMultiplicity === 32

  for (const [k, v] of Object.entries(counts)) metrics[`count_${k}`] = v

  // O2
  let o2 = true

  for (const [a, b] of BALANCES) {
    const square = isThreeRationalSquare(a, b)
    const found = jointSplits(a, b, 256).length
    const expected = a === 3 && b === 1

    metrics[`balance_${a}_${b}_threeSquare`] = square ? 1 : 0
    metrics[`balance_${a}_${b}_jointSplits`] = found
    o2 &&= square === expected && found > 0 === expected
  }

  // O3
  let o3 = true
  let pellCount = 0
  let registerFor1e18 = 0n

  for (const pair of pellPairs(1_000_000_000n)) {
    const split = pellSplit(pair)
    const sign = pair.p * pair.p - 2n * pair.q * pair.q

    o3 &&= sign === 1n || sign === -1n
    o3 &&= 8n * split.r === 3n * split.c
    o3 &&= split.c <= split.m && split.r <= split.m
    o3 &&= split.missNum * 2n * pair.q * pair.q === sign * split.missDen
    pellCount++

    // relative speed miss about 1 / (4 q^2): the first q with 4 q^2 > 1e18
    if (registerFor1e18 === 0n && 4n * pair.q * pair.q > 1_000_000_000_000_000_000n) registerFor1e18 = split.m
  }

  let exactSpeed = 0

  for (let m = 1; m <= 1_000_000; m++) {
    const t0 = Math.round(m / (8 * Math.SQRT2))

    for (const t of [t0 - 1, t0, t0 + 1]) if (t > 0 && 128 * t * t === m * m) exactSpeed++
  }

  o3 &&= exactSpeed === 0
  metrics.pellPairs = pellCount
  metrics.registerForMiss1e18 = Number(registerFor1e18)
  metrics.exactSpeedAtBalance = exactSpeed

  for (const q of [12n, 70n, 408n]) {
    const pair = pellPairs(q).find(x => x.q === q)!
    const split = pellSplit(pair)

    metrics[`pellMissSquared_q${q}`] = Number(split.missNum) / Number(split.missDen)
    metrics[`pellRegister_q${q}`] = Number(split.m)
  }

  // W1, W3
  let w1 = true
  let w3 = true

  for (const n of PLANCK_BOXES) {
    const three = planckAt(specOf(n, 2, rhoThree(n)), 1)
    const near = planckAt(specOf(n, 2, nearBalance3D(n)), 1)
    const split = nearBalance3D(n)

    metrics[`planckRho3_N${n}`] = three.ratio
    metrics[`planckNear3over8_N${n}`] = near.ratio
    metrics[`near3over8Ratio_N${n}`] = split.force / split.drift
    metrics[`near3over8M_N${n}`] = split.w
    w3 &&= Math.abs(three.ratio - 1) < Math.abs(near.ratio - 1)

    if (n === 25) {
      metrics.bandWorstRho3 = three.worstBand
      metrics.bandWorstNear3over8 = near.worstBand
      w1 = three.worstBand <= 1e-3 && near.worstBand <= 1e-2
    }
  }

  for (const x of [0.25, 0.5]) metrics[`planckRho3_N25_T${x}`] = planckAt(specOf(25, 2, rhoThree(25)), x).ratio

  // W2
  let w2 = true

  for (const n of SHIFT_BOXES) {
    const r = staticShift(n, 2, rhoThree(n))

    metrics[`shiftRatioRho3_N${n}`] = r.ratio
    metrics[`shiftS_N${n}`] = r.s
    metrics[`shiftOverlaps_N${n}`] = Math.min(r.overlap0, r.overlap1)
    w2 &&= Math.abs(r.ratio - 1) < 1e-3 && r.overlap0 >= 0.5 && r.overlap1 >= 0.5 && Math.abs(r.s - 0.25) < 1e-12
  }

  // A1
  let a1 = true
  let a1Worst = 0

  for (let d = 1; d <= 200; d++) {
    const n = 2 * d + 1

    a1 &&= alphaOfBalance(n, 3 / 8) === 1 / (6 * n)
    a1Worst = Math.max(a1Worst, Math.abs(alphaOfRatio(d, 3 / 8) * 6 * n - 1))
  }

  a1 &&= a1Worst <= 4e-16
  metrics.oldFormWorst = a1Worst

  // A2
  let a2 = true

  for (let n = 5; n <= 49; n += 2) {
    const splits = loopSplits(n, 3, 16, 64)
    const least = Math.min(...splits.map(s => s.w))

    a2 &&=
      least === 4 &&
      splits
        .filter(s => s.w === least)
        .map(s => s.drift)
        .sort((a, b) => a - b)
        .join(',') === '1,3'
  }

  let near = { t: 0, m: 0, gap: Infinity }

  for (let m = 1; m <= 64; m++) {
    for (let t = 1; 8 * t <= m; t++) {
      const gap = Math.abs((4 * t) / m - Math.SQRT2 / 4)

      if (gap < near.gap) near = { t, m, gap }
    }
  }

  a2 &&= 4 * near.t * 34 === 12 * near.m
  metrics.e0260NearestT = near.t
  metrics.e0260NearestM = near.m

  // A3
  let a3Worst = 0

  for (const n of [9, 25, 101]) {
    for (const rho of [3, 3 / 8]) {
      for (const kappa of [KAPPA, 3 / 8, 2 / n]) a3Worst = Math.max(a3Worst, Math.abs(alphaCoulomb(n, rho, kappa) / alphaOfBalance(n, rho) - 1))
    }
  }

  const a3 = a3Worst < 1e-14

  metrics.kappaFreeWorst = a3Worst

  // P1 and the reads
  const forms: Record<string, (n: number) => number> = {
    rho3: n => alphaOfBalance(n, 3),
    rho3over8: n => alphaOfBalance(n, 3 / 8),
  }
  let p1 = true

  for (const [name, form] of Object.entries(forms)) {
    const best = nearestDepth(form, TARGET, MAX_DEPTH)
    const slope = 1 / form(1) // 1/alpha = slope * N

    metrics[`nearestD_${name}`] = best.d
    metrics[`nearestInverse_${name}`] = best.inverse
    metrics[`nearestMiss_${name}`] = best.miss
    metrics[`nullChance_${name}`] = (WINDOW * TARGET) / slope
    p1 &&= best.miss >= WINDOW
  }

  for (const [name, rho] of [
    ['rho3', 3],
    ['rho3over8', 3 / 8],
  ] as const) {
    const best = nearestDepth(n => alphaGoldenRule(n, rho), TARGET, MAX_DEPTH)

    metrics[`goldenNearestD_${name}`] = best.d
    metrics[`goldenNearestInverse_${name}`] = best.inverse
    metrics[`goldenNearestMiss_${name}`] = best.miss
    metrics[`goldenOverCoulomb_${name}`] = alphaGoldenRule(25, rho) / alphaOfBalance(25, rho)
  }

  const gates = { O1: o1, O2: o2, O3: o3, W1: w1, W2: w2, W3: w3, A1: a1, A2: a2, A3: a3, P1: p1 }

  for (const [k, v] of Object.entries(gates)) metrics[`gate${k}`] = v ? 1 : 0

  metrics.seconds = (Date.now() - started) / 1000

  const f = (x: number | undefined, digits = 6): string => (x ?? Number.NaN).toFixed(digits)

  return verdict({
    status: Object.values(gates).every(Boolean) ? 'partial' : 'fail',
    claim: `the light's split is fixed by E-FRC-0234's virial balance, rho = link columns over plaquette columns, a Planck criterion and not a symmetry (the rule runs at any split); the 3D count is 12/32 = 3/8 (bulk registers) or 9/20 (distinct husk columns); exact one speed (kappa = 3/16) at a balanced split needs rho / 3 to be a rational square, true for the ladder's 3 and for none of 3/8, 9/20, 3/5, 9/32, 2, so on the husk exact one speed and the balance cannot hold together; the balance meets one speed as a limit of the register, the Pell splits (8p, 3p, 16q) missing the squared speed by exactly 1/(2 q^2) (${pellCount} pairs to q = 1e9; a miss below 1e-18 needs m = ${metrics.registerForMiss1e18!.toExponential(2)}); alpha = sqrt(3 / (2 rho)) / (12 N) does not depend on kappa (to ${a3Worst.toExponential(1)}), so one speed leaves 1 / (6 (2D + 1)) unchanged at the balance, and no D to 10,000 puts 1/alpha within 1e-3 of 137.036 at rho = 3 (nearest D = ${metrics.nearestD_rho3}, ${f(metrics.nearestInverse_rho3, 3)}, miss ${f(metrics.nearestMiss_rho3, 4)}) or rho = 3/8 (D = ${metrics.nearestD_rho3over8}, ${f(metrics.nearestInverse_rho3over8, 3)}, miss ${f(metrics.nearestMiss_rho3over8, 4)}); on the ladder at kappa = 3/16 the rho = 3 split is the classical light to ${(metrics.bandWorstRho3 ?? 0).toExponential(1)}, shifts a stand-in charge by ${SHIFT_BOXES.map(n => f(metrics[`shiftRatioRho3_N${n}`], 6)).join(', ')} of (pi s / N) E*, and holds Planck at T = omega_min to ${PLANCK_BOXES.map(n => f(metrics[`planckRho3_N${n}`], 5)).join(', ')} against the near-3/8 split's ${PLANCK_BOXES.map(n => f(metrics[`planckNear3over8_N${n}`], 5)).join(', ')}`,
    metrics,
    control: {
      oldFormWorst: a1Worst,
      e0260NearestM: near.m,
      kappaFreeWorst: a3Worst,
    },
    notes: `L2, deterministic (integers and BigInt for every existence claim; the ladder's exact factors read in doubles; no draw). Gates: ${JSON.stringify(gates)}. The ladder is a STAND-IN for the 3D husk's quantum light. Predicted partial. E-FRC-0240's golden-rule alpha is sqrt 24 times the Coulomb alpha at every split (read ${f(metrics.goldenOverCoulomb_rho3, 6)}): two definitions, the Coulomb one the energy between charges over the light's speed.`,
  })
}

export default experiment({
  id: 'gauge/light-split-origin',
  code: 'E-FRC-0261',
  title:
    "where the light's split comes from and what it does to one speed and to alpha, partial as derived: the split is fixed by the virial balance (link columns over plaquette columns, a Planck criterion, not a symmetry; 3/8 or 9/20 on the 3D husk, 3 on the ladder); exact one speed at a balanced split needs the balance to be 3 times a rational square, so on the husk the two cannot both hold under any count; the balance meets one speed as a limit of the register, the Pell splits missing it by 1/(2 q^2); alpha = sqrt(3 / (2 rho)) / (12 N) is free of kappa, so one speed leaves alpha unchanged, and no depth gives 137.036 at either split",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return lightSplitOriginRun()
  },
})
