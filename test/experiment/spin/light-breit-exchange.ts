// DOES THE RULE'S OWN LIGHT SUPPLY THE BREIT EXCHANGE THE REGISTER PAIR LACKS? (E-SPN-0218, OPEN-MOT-01). E-SPN-0217
// found the pair's moving clock 2.6 to 4.8 times too fast, 8/3 of its error the instantaneous pull's level-dependent
// inertia, and an extrapolated clock of 0.25 +- 1.65 of relativity's once the Darwin exchange was put back BY HAND at
// strength S = 1. E-MTR-0033 found binding adding 18 to 42 percent of quartic beyond the members' band. This file
// derives S from the light's own operators instead of setting it, and feeds it back into both recorded reads.
//
// WHERE THE LIGHT IS (read before anything was computed here). The pair engine's pull is alpha G(y), G the Green
// function of the husk symbol eps(k) = sum over the 24 husk steps of (1 - cos k . rho) (code/measure/husk-meson
// huskGreenTable, setupFor's table; G(0) is decision 001's on-site value). That symbol is the Coulomb kernel of the
// husk light (code/measure/darwin-exchange, E-FRC-0179, E-FRC-0241): the light's leapfrog on the link columns,
// Lagrangian (1/2) Adot^T G^-1 Adot - (kappa / 2) A^T G^(-1/2) H G^(-1/2) A + J^T G^-1 A - rho phi, dispersion
// 4 sin^2(omega / 2) = kappa lambda(k) per beat, lambda = (2/3) k^2 at long wave, so c_l^2 = 2 kappa / 3. The engine keeps
// only the constraint part (the instantaneous Coulomb pull); the transverse modes are what it leaves out.
//
// DERIVATION (L1 for the steps, L2 for the numbers).
// 1. THE EXCHANGE. In Coulomb gauge one light between currents j1, j2 (Hermitian coordinates j = G^(-1/2) J) is
//    j1^dag (kappa H - 4 sin^2(omega / 2))^+ j2 on the non-gauge modes, plus the instantaneous rho1 rho2 / eps. A moving
//    member's link current is J_h = (g_h / 6)(u_h . v) rho, v its group velocity (E-SPN-0169 G2: the current the
//    light reads IS the group velocity). At omega = 0 the transverse part over the Coulomb part, averaged over v's
//    direction, is X(k) / kappa with X -> 1 at long wave because the transverse eigenvalue is 2/3 k^2 = c_l^2 k^2 /
//    kappa: one Maxwell Lagrangian at the speed the light moves at (E-SPN-0169). The continuum Breit term
//    -(alpha / 2r)(v1 . v2 + (v1 . r-hat)(v2 . r-hat)) is exactly this at X = 1: its velocity average is (2/3) / c^2 of
//    the Coulomb energy (the transverse projector's trace 2 over 3).
// 2. THE FREQUENCY. Each transverse mode's kernel grows as 1 + 4 sin^2(omega / 2) / (kappa lambda) + ...; for a pair
//    moving together at V the light carries omega = V . k, so the correction is (V . k-hat)^2 / c_l^2 = O(V^4 / c^4).
//    At order v^2 / c^2 the one-light exchange is the static transverse kernel alone, and the Coulomb part has no
//    frequency at all (Gauss's law). So the order-v^2 strength is a static property of the light's operators.
// 3. S OF A BOUND LEVEL. For the level's relative density rho(y), S = <transverse> / <Coulomb> (times kappa), in
//    position space S - 1 = sum rho D_T / sum rho G, D_T = FT[(X - 1) / eps] (short-ranged, since X - 1 = -k^2 / 18 +
//    ..., E-SPN-0169), G the engine's own Green function. The level's S is the lattice's correction to the Breit
//    strength; it depends on the level's size, so the 1s and the 2s each get their own (code/measure/breit-exchange).
// 4. THE SPEED. Against the member's speed (c_m^2 = 1/8 per beat, E-SPN-0160) the Breit strength is
//    S_rule = S (c_m / c_l)^2 = S f. The rule does not fix c_l: the adopted trit column has kappa = 2 / (2D + 1),
//    f = 3 (2D + 1) / 32, never 1 (E-FRC-0260), nearest at D = 5 (f = 33/32); the quantum loop light reaches f = 1 at
//    kappa = 3/16, but not at the husk's 3D balance, whose nearest split (c_l = 12/34) has f = 1156/1152 (E-FRC-0261).
//    So S_rule is read on the lights the rule allows, and the light's depth (or split) is the rule's open knob.
// 5. THE CLOCK. E-SPN-0217's decomposition with S_rule per level (code/measure/pair-clock clockDecomposition, S and
//    S2): R_full,n = R_n + (8/3) e_n (1 - S_n) / (2m - e_n), and the same extrapolation in x = (tan m / m - 1) / a_B.
//    These are RE-READS of recorded parts (test/record/E-SPN-0217/clock-verdict.log), not a blind read.
// 6. THE DISPERSION (an estimate, first order). The transverse exchange's energy on a level moving at K is
//    Delta E(K) = (4/3) S_rule E_b (V^2 / c_m^2)(1 + (f / 5) V^2 / c_m^2), V = dE/dK of the level's own fitted band
//    (pair-boost's quartic-fraction model) and the 1/5 the frequency term's angular mean (step 2). Added to the recorded
//    centroids of E-MTR-0033 (test/record/E-MTR-0033/mtr-band-final.log) and refitted: its K^2 part is the Darwin
//    inertia, its K^4 part comes from V's own non-linearity and the frequency term. To first order
//      Delta rho = S E_b / E0 ((16/3) rho / R - (32/15) f / R^2)
//    THE LIMIT OF THIS ESTIMATE: it is one piece of the order-E_b V^4 two-body terms; in the continuum it alone moves rho
//    by about +3.2 E_b / E0 (the control C6), where relativity needs every such term together to give exactly 1. So
//    it can say whether the light's exchange removes an excess of 18 to 42 percent, not settle rho at the percent level.
//
// PREDICTED, before any S was computed (from E-SPN-0169's k^2 law, S - 1 = -<k^2> / 18 with the Coulomb-weighted
// <k^2> of a hydrogenic level, 4 / a^2 for the 1s and 2 / a^2 for the 2s):
//   S_1s - 1 = -2 / (9 a^2): -0.0027, -0.0039, -0.0072 at the binding radii 9.1, 7.5, 5.6 of m 0.284 a_B 12, m 0.380
//   a_B 10, m 0.427 a_B 7.5 (each within 30% of this); the 2s within 1e-3 of 1. S_rule about 1.026 on the trit
//   column at D = 5 and 0.995 on the loop light at kappa = 3/16.
//   THE CLOCK: the Darwin-restored ratio moves by about (8/3)(S_rule - 1) from E-SPN-0217's: extrapolated about 0.32
//   +- 1.65 (D = 5) and 0.24 +- 1.65 (kappa = 3/16), still unresolved. THE DISPERSION: Delta rho about +0.16, +0.20,
//   +0.39 at the three points and about +0.13, +0.19, +0.31 on the members' carried band, so the excess over the carried
//   band GROWS slightly (by 0.03 to 0.08) instead of vanishing: the light's exchange does not account for it.
//
// GATES (fixed with the predictions above, before the first run):
//   W1  THE LIGHT: one gauge mode, |X - 1| <= 1e-6 at |k| 1e-3 and (1 - X) / k^2 within 1% of 1/18 at |k| 1e-2, on
//       the axis, face and body diagonals and a generic direction (E-SPN-0169's L0, L1 re-witnessed)
//   W2  THE FREQUENCY: at |k| 1e-2, omega = 0.1 c_l |k| (kappa 3/16 and 2/11), the velocity-averaged transverse kernel
//       over its static value is 1 / (1 - w) within 1e-6, w = 4 sin^2(omega / 2) / (kappa lambda_T) (only the two
//       transverse modes carry the current), and w within 1e-3 of (omega / c_l |k|)^2
//   C1  ONE OPERATOR: the engine's Green symbol (husk-meson huskSymbol) equals the light's Coulomb symbol
//       (darwin-exchange coulombSymbol) to 1e-12 at 64 momenta
//   C2  THE TRANSFORM: this file's torus transform of 1 / eps reproduces the engine's table G(0) - G(y) at y = (1,0,0),
//       (1,1,0), (2,1,0), (3,2,1) within 1e-5 once the torus background r^2 / (36 L^3) is added (L = 64)
//   C3  CONVERGENCE: S - 1 of every level changes by at most 2% from the side-32 to the side-64 torus
//   C4  E-SPN-0217 REPRODUCED: at S = 1 the recorded per-point Darwin-restored ratios and the extrapolated 0.251 +- 1.652
//       come back within 1e-9
//   C5  E-MTR-0033 REPRODUCED: refitting the recorded centroids gives the recorded rho within 1e-6
//   C6  THE ESTIMATE'S CONTINUUM SIZE (reported): Delta rho on an exactly relativistic band (rho 1, R 1) at each
//       point's E_b
//   N1  NEGATIVE CONTROL: on the trit column at D = 4 (f = 27/32) S_rule fails G_RULE; with the light off (S = 0)
//       clockDecomposition gives back the static class (R_full = R, ratioDarwin = ratio) bit for bit
//   G_S   every level's S within 0.02 of 1, and the 1s's S - 1 within 30% of -2 / (9 a^2) (the k^2 law)
//   G_RULE  |S_rule - 1| < 0.1 for every level, on the trit column at D = 5 and on the loop light at kappa = 3/16
//   X   THE CLOCK (E-SPN-0217's X, unchanged): with S_rule, alpha_inf > 0, |alpha_inf / alpha_SR - 1| < 0.25 and its
//       error at most 0.25, on both lights
//   DX  THE DISPERSION: the light's exchange accounts for the excess if, at all three points, the excess over the
//       carried band (rho' - rho_imp') is within 2 sigma_rho of 0
//   Verdict: fail if W1, W2 or any of C1 to C5, N1 fails, or G_S or G_RULE fails; pass if X and DX also hold;
//   partial otherwise (the light supplies S = 1 up to the lattice's correction, on a light at the member's speed, but
//   the clock is not resolved or the excess is not the light's).
//
// FIRST RUN (2026-10-23, laptop, 23 s; test/record/E-SPN-0218/run/breit-run.sh, test/record/E-SPN-0218/breit-verdict.log):
// FAIL AS REGISTERED, on one clause of a control. No gate moved.
//  - N1 fails on its bit-for-bit clause: with the light off, clockDecomposition's R_full = (R + d) - s comes back 1 ulp
//    off R (2.2e-16) and ratioDarwin 1.2e-14 off ratio at two points (test/record/E-SPN-0218/n1-probe.log, read after
//    the run): floating association, not the physics. N1's other clause (D = 4 fails G_RULE) holds. Read with a 1e-12
//    tolerance N1 holds, and the verdict would be PARTIAL; it stays fail as registered.
//  - THE LIGHT: W1, W2, C1 to C5 hold. The engine's pull and the light's Coulomb kernel are one operator (1.1e-14);
//    X - 1 = 5.7e-8 at |k| 1e-3, (1 - X) / k^2 = 1/18 to 6e-6; the transverse kernel at frequency is exactly 1 / (1 - w)
//    times its static value (8e-14), w = (omega / c_l k)^2 to 2.8e-6. The transform matches the engine's table to 1.9e-9.
//  - S (G_S holds): 1s 0.99709, 0.99569, 0.99183 and 2s 0.99920, 0.99873, 0.99697 at m 0.284 a_B 12, m 0.380 a_B 10,
//    m 0.427 a_B 7.5, at the levels' binding radii 9.12, 7.55, 5.55 (1s) and 12.2, 9.75, 6.42 (2s); the k^2 law gave
//    0.99733, 0.99610, 0.99278 (the lattice sum 9 to 13% further from 1). At a_B instead of the binding radius:
//    0.9983, 0.9976, 0.9956 (1s). Side 32 against 64: the same to 2e-6. 99% of S - 1 comes from |y|^2 <= 2: the
//    lattice's correction to the Breit strength is a contact term (D_T(0) = -0.0143, D_T(1,0,0) = +9.4e-4).
//  - S_rule (G_RULE holds): S on the loop light at kappa = 3/16 (0.992 to 0.999), 1.023 to 1.030 on the trit column at
//    D = 5, 1.0035 S at the 3D balance's nearest split; the negative control, D = 4, gives 0.837 to 0.843.
//  - THE CLOCK (X fails, as predicted): 0.250 +- 1.652 on the loop light (per point -0.37, -2.69, -1.95), 0.333 +-
//    1.652 at D = 5, 0.259 at the balance split, -0.168 at D = 4; the S = 1 read was 0.251 +- 1.652. The derived S
//    moves the clock by (8/3)(S_rule - 1), a twentieth of its error.
//  - THE DISPERSION (DX fails, as predicted in sign): rho 2.192 -> 2.288, 3.241 -> 3.367, 4.488 -> 4.717 on the loop
//    light; the carried band 1.738 -> 1.821, 2.389 -> 2.492, 2.795 -> 2.964; the excess 0.453 -> 0.467, 0.851 ->
//    0.875, 1.693 -> 1.753. The first-order K^4 formula gives +0.162, +0.197, +0.386 (the refit over K 0.2 to 1.0 sees
//    60% of it: the higher orders of V at K 1.0). On an exactly relativistic band the same estimate moves rho by
//    +0.046, +0.039, +0.055 (C6), its own continuum size.
// MEANING. The rule's light gives the Breit exchange by itself: the pull the engine keeps is that light's Coulomb kernel,
// and its transverse kernel is the same Maxwell Lagrangian at the light's own speed, so the order-v^2 strength is 1 up
// to a lattice contact term of -0.3 to -0.8% that falls as 1 / a^2. S = 1 against the MEMBER's speed then holds
// exactly when the light runs at the member's speed, which the rule leaves open (E-FRC-0260): S_rule = (c_m / c_l)^2 S.
// The clock reads that ratio: once resolved, its gate (0.25) allows |(c_m / c_l)^2 - 1| up to about 0.09, which among
// the trit column's depths admits only D = 5 (f 1.031; D = 4 and 6 give 0.844 and 1.219). At the recorded precision the
// clock is unresolved on every light. The light's exchange does not account for the extra quartic: it raises the
// pair's rho and the carried band's alike, and the excess grows by 0.014 to 0.060. The 18 to 42% is the static
// engine's own binding on the lattice, not the missing light.
//
// Depth L2: the husk light's exchange kernels, weighted by hydrogenic densities at the levels' own binding radii,
// and recorded reads re-read; no new engine run. DETERMINISM: no random numbers; torus grids and lattice sums.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { lightCubes, levelS, retardation, speedRatio2, transverseBandShift, tritKappa, cubeAt, type Cube, type LevelKind } from '@/code/measure/breit-exchange'
import { coulombSymbol, darwinRatio } from '@/code/measure/darwin-exchange'
import { infiniteGreenZero } from '@/code/measure/husk-coulomb'
import { huskGreenTable, huskSymbol, type GreenTable } from '@/code/measure/husk-meson'
import { bindingRadius } from '@/code/measure/lattice-pair-inertia'
import { quarticFractionFit, galileanEnergy, relativisticEnergy } from '@/code/measure/pair-boost'
import { clockDecomposition } from '@/code/measure/pair-clock'
import { memberOf } from '@/code/measure/register-track'
import { weightedLinearFit } from '@/code/measure/regression'
import { readVerdictLog } from '@/code/tool/verdict-log'

const RECORD = `${import.meta.dirname}/../../record`
const CLOCK_LOG = `${RECORD}/E-SPN-0217/clock-verdict.log`
const BAND_LOG = `${RECORD}/E-MTR-0033/mtr-band-final.log`
const C_STAR2 = 0.5
const BAND = 0.25
const RULE_BAND = 0.1
const S_BAND = 0.02
const LAW_BAND = 0.3
const CONVERGE = 0.02
const BAND_MOMENTA: readonly number[] = [0.2, 0.35, 0.5, 1]

export const POINTS = [
  { name: 'm0284a12', unit: [-7, 2] as const, aB: 12 },
  { name: 'm0380a10', unit: [-2, 5] as const, aB: 10 },
  { name: 'm0427a7.5', unit: [-5, 1] as const, aB: 7.5 },
] as const

// the lights the rule allows, by (c_m / c_l)^2
export const LIGHTS = [
  { name: 'trit D5', f: speedRatio2(tritKappa(5)), kappa: tritKappa(5) },
  { name: 'loop 3/16', f: speedRatio2(3 / 16), kappa: 3 / 16 },
  { name: 'balance 12/34', f: 1 / 8 / (12 / 34) ** 2, kappa: (3 / 2) * (12 / 34) ** 2 },
  { name: 'trit D4', f: speedRatio2(tritKappa(4)), kappa: tritKappa(4) },
] as const

export type BreitPlan = { L: number; C: number; checkL: number; checkC: number }

export const GATE_PLAN: BreitPlan = { L: 64, C: 24, checkL: 32, checkC: 12 }

const flag = (b: boolean): number => (b ? 1 : 0)
const lattice = (m: number, aB: number): number => (Math.tan(m) / m - 1) / aB
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const DIRS: readonly number[][] = [
  [1, 0, 0],
  [s2, s2, 0],
  [s3, s3, s3],
  [0.29, 0.52, 0.8].map(x => x / Math.hypot(0.29, 0.52, 0.8)),
]

// the light's own checks (W1, W2, C1)
function lightChecks() {
  let gauge = true
  let xGap = 0
  let lawGap = 0

  for (const d of DIRS) {
    const tiny = darwinRatio(d.map(x => x * 1e-3))
    const small = darwinRatio(d.map(x => x * 1e-2))

    gauge &&= tiny.gauge === 1 && small.gauge === 1
    xGap = Math.max(xGap, Math.abs(tiny.X - 1))
    lawGap = Math.max(lawGap, Math.abs(((1 - small.X) / 1e-4) * 18 - 1))
  }

  let retGap = 0
  let speedGap = 0

  for (const kappa of [3 / 16, tritKappa(5)]) {
    for (const d of DIRS) {
      const k = d.map(x => x * 1e-2)
      const omega = 0.1 * Math.sqrt((2 * kappa) / 3) * 1e-2
      const r = retardation(k, kappa, omega)

      retGap = Math.max(retGap, Math.abs((1 + r.relative) * (1 - r.leading) - 1))
      speedGap = Math.max(speedGap, Math.abs(r.leading / 0.01 - 1))
    }
  }

  let symbolGap = 0
  const alpha = [Math.SQRT2 - 1, Math.sqrt(3) - 1, Math.sqrt(5) - 2]

  for (let j = 0; j < 64; j++) {
    const k = alpha.map(a => 2 * Math.PI * (((0.5 + (j + 1) * a) % 1) - 0.5))

    symbolGap = Math.max(symbolGap, Math.abs(huskSymbol(k) - coulombSymbol(k)))
  }

  return { W1: gauge && xGap <= 1e-6 && lawGap <= 0.01, W2: retGap <= 1e-6 && speedGap <= 1e-3, C1: symbolGap <= 1e-12, xGap, lawGap, retGap, speedGap, symbolGap }
}

// C2: the torus transform against the engine's table
function transformCheck(coulomb: Cube, table: GreenTable, L: number): { C2: boolean; gap: number } {
  const side = 2 * table.C + 1
  let gap = 0

  for (const [a, b, c] of [
    [1, 0, 0],
    [1, 1, 0],
    [2, 1, 0],
    [3, 2, 1],
  ] as const) {
    const engine = table.value[a + table.C + side * (b + table.C) + side * side * (c + table.C)]!
    const mine = cubeAt(coulomb, a, b, c) + (a * a + b * b + c * c) / (36 * L ** 3)

    gap = Math.max(gap, Math.abs(mine - engine))
  }

  return { C2: gap <= 1e-5, gap }
}

type Level = { point: string; kind: LevelKind; Eb: number; a: number; aRef: number; S: number; SRef: number; SCheck: number; law: number; coreShare: number }

export function breitRun(plan: BreitPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const clock = readVerdictLog(CLOCK_LOG)
  const band = readVerdictLog(BAND_LOG)

  if (!clock || !band) {
    return verdict({ status: 'open', claim: 'the recorded reads of E-SPN-0217 and E-MTR-0033 are missing', metrics: {} })
  }

  const cm = clock.metrics
  const bm = band.metrics
  const light = lightChecks()

  log('light')

  const G0 = infiniteGreenZero('husk', 64).value
  const table = huskGreenTable(128, 16, G0)

  log('table')

  const main = lightCubes(plan.L, plan.C)
  const check = lightCubes(plan.checkL, plan.checkC)
  const c2 = transformCheck(main.coulomb, table, plan.L)

  log('cubes')

  // ---------------- each level's S ----------------
  const levels: Level[] = []

  for (const p of POINTS) {
    const mb = memberOf(p.unit)

    for (const kind of ['1s', '2s'] as const) {
      const E = cm[`${p.name}_${kind === '1s' ? 'E1' : 'E2'}`]!
      const Eb = 2 * mb.M0 - E
      const n2 = kind === '1s' ? 1 : 4
      const a = bindingRadius(mb.mu, n2 * Eb)
      const s = levelS({ table, transverse: main.transverse, kind, a })
      const sRef = levelS({ table, transverse: main.transverse, kind, a: p.aB })
      const sCheck = levelS({ table, transverse: check.transverse, kind, a })
      const law = kind === '1s' ? -2 / (9 * a * a) : -1 / (9 * a * a)

      levels.push({ point: p.name, kind, Eb, a, aRef: p.aB, S: s.S, SRef: sRef.S, SCheck: sCheck.S, law, coreShare: s.coreShare })
    }
  }

  log('levels')

  const C3 = levels.every(l => Math.abs((l.S - 1) / (l.SCheck - 1) - 1) <= CONVERGE)
  const GS = levels.every(l => Math.abs(l.S - 1) <= S_BAND) && levels.filter(l => l.kind === '1s').every(l => Math.abs((l.S - 1) / l.law - 1) <= LAW_BAND)
  const levelOf = (point: string, kind: LevelKind): Level => levels.find(l => l.point === point && l.kind === kind)!
  const ruleOk = (f: number): boolean => levels.every(l => Math.abs(l.S * f - 1) < RULE_BAND)
  const GRULE = ruleOk(LIGHTS[0].f) && ruleOk(LIGHTS[1].f)

  // ---------------- the clock re-read ----------------
  const clockWith = (f: number | null) => {
    const reads = POINTS.map(p => {
      const mb = memberOf(p.unit)
      const S = f === null ? undefined : levelOf(p.name, '1s').S * f
      const S2 = f === null ? undefined : levelOf(p.name, '2s').S * f
      const E1 = cm[`${p.name}_E1`]!
      const E2 = cm[`${p.name}_E2`]!
      const parts = clockDecomposition({ m: mb.m, M0: mb.M0, E1, E2, R1: cm[`${p.name}_R1`]!, R2: cm[`${p.name}_R2`]!, S, S2 })

      return { p, mb, E1, E2, parts, sigmaR1: cm[`${p.name}_sigmaR1`]!, sigmaR2: cm[`${p.name}_sigmaR2`]! }
    })
    const xs = reads.map(r => lattice(r.mb.m, r.p.aB))
    const g1 = weightedLinearFit({ xs, ys: reads.map(r => r.parts.R1full - 1), errors: reads.map(r => Math.max(1e-6, r.sigmaR1)) })
    const gd = weightedLinearFit({
      xs,
      ys: reads.map(r => r.parts.R1full - r.parts.R2full),
      errors: reads.map(r => Math.max(1e-6, Math.hypot(r.sigmaR1, r.sigmaR2))),
    })
    const Lambda = reads.reduce((s, r) => s + r.E1 / (r.E2 - r.E1), 0) / reads.length
    const ratioInf = 1 - g1.intercept - Lambda * gd.intercept
    const sigmaInf = Math.hypot(g1.interceptError, Lambda * gd.interceptError)
    const X = ratioInf > 0 && Math.abs(ratioInf - 1) < BAND && sigmaInf <= BAND

    return { perPoint: reads.map(r => r.parts.ratioDarwin), ratioInf, sigmaInf, X, reads }
  }

  const unit = clockWith(null)
  const C4 =
    POINTS.every((p, i) => Math.abs(unit.perPoint[i]! - cm[`${p.name}_ratioDarwin`]!) <= 1e-9) &&
    Math.abs(unit.ratioInf - cm.ratioInfDarwin!) <= 1e-9 &&
    Math.abs(unit.sigmaInf - cm.sigmaInfDarwin!) <= 1e-9
  const clocks = LIGHTS.map(l => ({ light: l, ...clockWith(l.f) }))

  // N1: the light off gives the static class back exactly
  const off = POINTS.map(p => {
    const mb = memberOf(p.unit)
    const parts = clockDecomposition({ m: mb.m, M0: mb.M0, E1: cm[`${p.name}_E1`]!, E2: cm[`${p.name}_E2`]!, R1: cm[`${p.name}_R1`]!, R2: cm[`${p.name}_R2`]!, S: 0 })

    return parts.ratioDarwin === parts.ratio && parts.R1full === cm[`${p.name}_R1`]!
  })
  const N1 = !ruleOk(LIGHTS[3].f) && off.every(Boolean)
  const X = clocks[0]!.X && clocks[1]!.X

  log('clock')

  // ---------------- the dispersion estimate ----------------
  const bandWith = (S: number, f: number) =>
    POINTS.map(p => {
      const mb = memberOf(p.unit)
      const E0 = bm[`${p.name}_E0`]!
      const Eb = 2 * mb.M0 - E0
      const a = bm[`${p.name}_a`]!
      const rho = bm[`${p.name}_rho`]!
      const sigma = bm[`${p.name}_sigmaE`]!
      const pts = BAND_MOMENTA.map(K => ({ K, E: bm[`${p.name}_K${K}_c`]! }))
      const refit = quarticFractionFit({ E0, points: pts, a0: a, rho0: rho, sigma })
      const shift = (K: number, b: { a: number; rho: number }) => transverseBandShift({ E0, a: b.a, rho: b.rho, Eb, S, f, K, cStar2: C_STAR2 })
      const moved = quarticFractionFit({ E0, points: pts.map(q => ({ K: q.K, E: q.E + shift(q.K, refit) })), a0: a, rho0: rho, sigma })
      // the members' band carried by the bound state, as its fitted model (rho_imp, R_imp), moved the same way
      const aImp = C_STAR2 / (2 * bm[`${p.name}_Rimp`]! * E0)
      const rhoImp = bm[`${p.name}_rhoImp`]!
      const impModel = (K: number) => galileanEnergy({ E0, a: aImp, K }) - rhoImp * (galileanEnergy({ E0, a: aImp, K }) - relativisticEnergy({ E0, a: aImp, K }))
      const imp = quarticFractionFit({ E0, points: BAND_MOMENTA.map(K => ({ K, E: impModel(K) + shift(K, { a: aImp, rho: rhoImp }) })), a0: aImp, rho0: rhoImp, sigma: 1e-9 })
      // C6: an exactly relativistic band at the same binding
      const aRel = C_STAR2 / (2 * E0)
      const rel = quarticFractionFit({
        E0,
        points: BAND_MOMENTA.map(K => ({ K, E: relativisticEnergy({ E0, a: aRel, K }) + shift(K, { a: aRel, rho: 1 }) })),
        a0: aRel,
        rho0: 1,
        sigma: 1e-9,
      })
      const R = C_STAR2 / (2 * refit.a * E0)
      const analytic = ((S * Eb) / E0) * ((16 / 3) * (refit.rho / R) - ((32 / 15) * f) / (R * R))

      return {
        name: p.name,
        Eb,
        rho: refit.rho,
        recorded: rho,
        sigmaRho: bm[`${p.name}_sigmaRho`]!,
        rhoMoved: moved.rho,
        Rmoved: C_STAR2 / (2 * moved.a * E0),
        rhoImp,
        rhoImpMoved: imp.rho,
        excess: rho - rhoImp,
        excessMoved: moved.rho - imp.rho,
        continuum: rel.rho - 1,
        analytic,
      }
    })

  const bandMain = bandWith(levelOf('m0284a12', '1s').S * LIGHTS[1].f, LIGHTS[1].f)
  // each point at its own 1s S, on the loop light (f = 1) and the trit column at D = 5
  const bandsByLight = LIGHTS.slice(0, 2).map(l => ({
    light: l,
    reads: POINTS.map((p, i) => bandWith(levelOf(p.name, '1s').S * l.f, l.f)[i]!),
  }))
  const C5 = bandMain.every(b => Math.abs(b.rho - b.recorded) <= 1e-6)
  const DX = bandsByLight.every(b => b.reads.every(r => Math.abs(r.excessMoved) <= 2 * r.sigmaRho))

  log('band')

  const W = light.W1 && light.W2 && light.C1 && c2.C2 && C3 && C4 && C5 && N1
  const status: Verdict['status'] = !W || !GS || !GRULE ? 'fail' : X && DX ? 'pass' : 'partial'
  const f4 = (x: number): string => x.toFixed(4)
  const metrics: Record<string, number> = {
    W1: flag(light.W1),
    W2: flag(light.W2),
    C1: flag(light.C1),
    C2: flag(c2.C2),
    C3: flag(C3),
    C4: flag(C4),
    C5: flag(C5),
    N1: flag(N1),
    GS: flag(GS),
    GRULE: flag(GRULE),
    X: flag(X),
    DX: flag(DX),
    xGap: light.xGap,
    lawGap: light.lawGap,
    retGap: light.retGap,
    speedGap: light.speedGap,
    symbolGap: light.symbolGap,
    transformGap: c2.gap,
    orbits: main.orbits,
    D_T0: cubeAt(main.transverse, 0, 0, 0),
    D_T1: cubeAt(main.transverse, 1, 0, 0),
    D_T2: cubeAt(main.transverse, 2, 0, 0),
    D_T4: cubeAt(main.transverse, 4, 0, 0),
    D_T8: cubeAt(main.transverse, 8, 0, 0),
  }

  for (const l of levels) {
    const k = `${l.point}_${l.kind}`

    Object.assign(metrics, {
      [`${k}_Eb`]: l.Eb,
      [`${k}_radius`]: l.a,
      [`${k}_S`]: l.S,
      [`${k}_SaB`]: l.SRef,
      [`${k}_Scheck`]: l.SCheck,
      [`${k}_law`]: 1 + l.law,
      [`${k}_coreShare`]: l.coreShare,
    })
  }

  for (const c of clocks) {
    const k = c.light.name.replace(/[ /]/g, '_')

    metrics[`clock_${k}_f`] = c.light.f
    metrics[`clock_${k}_ratioInf`] = c.ratioInf
    metrics[`clock_${k}_sigmaInf`] = c.sigmaInf
    POINTS.forEach((p, i) => (metrics[`clock_${k}_${p.name}`] = c.perPoint[i]!))
  }

  for (const b of bandsByLight) {
    const k = b.light.name.replace(/[ /]/g, '_')

    for (const r of b.reads) {
      Object.assign(metrics, {
        [`band_${k}_${r.name}_rho`]: r.rho,
        [`band_${k}_${r.name}_rhoMoved`]: r.rhoMoved,
        [`band_${k}_${r.name}_Rmoved`]: r.Rmoved,
        [`band_${k}_${r.name}_rhoImpMoved`]: r.rhoImpMoved,
        [`band_${k}_${r.name}_excess`]: r.excess,
        [`band_${k}_${r.name}_excessMoved`]: r.excessMoved,
        [`band_${k}_${r.name}_analytic`]: r.analytic,
        [`band_${k}_${r.name}_continuum`]: r.continuum,
      })
    }
  }

  const c0 = clocks[0]!
  const c1 = clocks[1]!
  const loopBand = bandsByLight[1]!.reads

  return verdict({
    status,
    claim: `the pair's pull is the husk light's Coulomb kernel (one operator to ${light.symbolGap.toExponential(1)}), and the same light's transverse kernel is one Maxwell Lagrangian at its own speed (X - 1 ${light.xGap.toExponential(1)} at long wave, (1 - X) / k^2 = 1/18 to ${(light.lawGap * 100).toFixed(2)}%), whose frequency dependence starts at (omega / c_l k)^2 (to ${light.retGap.toExponential(1)}), so the order-v^2 exchange is the static transverse kernel and the bound levels' Breit strengths, against the light's own speed, are ${levels.map(l => `${l.kind} ${l.S.toFixed(5)}`).join(', ')} (${POINTS.map(p => p.name).join(', ')}); against the member's speed S_rule = S (c_m / c_l)^2: ${f4(LIGHTS[0].f)} S on the trit column at D = 5, S on the loop light at kappa = 3/16, ${f4(LIGHTS[3].f)} S at D = 4 (G_S ${GS}, G_RULE ${GRULE}); E-SPN-0217's clock re-read with them extrapolates to ${c0.ratioInf.toFixed(3)} +- ${c0.sigmaInf.toFixed(3)} (D = 5) and ${c1.ratioInf.toFixed(3)} +- ${c1.sigmaInf.toFixed(3)} (kappa = 3/16) of relativity's, per point ${c1.perPoint.map(x => x.toFixed(2)).join(', ')} (X ${X}); the exchange's first-order effect on E-MTR-0033's quartic fraction is ${loopBand.map(r => `${r.rho.toFixed(3)} -> ${r.rhoMoved.toFixed(3)} (carried band ${r.rhoImp.toFixed(3)} -> ${r.rhoImpMoved.toFixed(3)}, excess ${r.excess.toFixed(3)} -> ${r.excessMoved.toFixed(3)})`).join('; ')} (DX ${DX}), against ${loopBand.map(r => r.continuum.toFixed(3)).join(', ')} for an exactly relativistic band`,
    metrics,
    control: { C1: flag(light.C1), C2: flag(c2.C2), C3: flag(C3), C4: flag(C4), C5: flag(C5), N1: flag(N1) },
    notes: `L2. Re-reads of recorded parts (${CLOCK_LOG.replace(/.*record\//, 'record/')}, ${BAND_LOG.replace(/.*record\//, 'record/')}), not blind. Levels: ${levels.map(l => `${l.point} ${l.kind} E_b ${l.Eb.toFixed(5)} radius ${l.a.toFixed(2)} S ${l.S.toFixed(6)} (at a_B ${l.SRef.toFixed(6)}, side ${plan.checkL} ${l.SCheck.toFixed(6)}, k^2 law ${(1 + l.law).toFixed(6)}, core share ${l.coreShare.toFixed(3)})`).join('; ')}. Lights: ${LIGHTS.map(l => `${l.name} f ${l.f.toFixed(6)}`).join(', ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'spin/light-breit-exchange',
  code: 'E-SPN-0218',
  title:
    "explores whether the rule's own light, exchanged at its finite speed, supplies the velocity-dependent (Breit) exchange the register pair lacks, fail as registered on a control's bit-for-bit clause (1 ulp), the physics gates holding: the engine's pull is the light's Coulomb kernel and its transverse kernel the same Maxwell Lagrangian at the light's speed, so the bound levels' Breit strength is S = 0.992 to 0.999 (a lattice contact term) against the light's speed and S (c_m / c_l)^2 against the member's, 1 on the loop light at kappa 3/16 and 1.03 on the trit column at D = 5; E-SPN-0217's clock re-read with it is still 0.25 +- 1.65 of relativity's (unresolved), and the exchange raises E-MTR-0033's quartic fraction (2.19 to 2.29, 3.24 to 3.37, 4.49 to 4.72) instead of removing its excess",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return breitRun(GATE_PLAN)
  },
})
