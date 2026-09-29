// E-SPN-0169: THE MODEL'S OWN LIGHT COUPLED TO THE REGISTER MEMBER, AND THE TRANSVERSE (DARWIN) EXCHANGE THAT TAKES A
// BOUND PAIR'S R FROM THE STATIC VALUE BACK TO THE MEMBER'S OWN tan m / m.
//
// THE QUESTION. E-SPN-0155 derived that a static pull gives R ~ (2 tan m + (5/3) E_b) / (2m - E_b), heavier than its
// energy by (8/3) E_b, the transverse (Darwin) exchange a real field carries; E-SPN-0162 bound a light register meson
// exactly on a static string with R = 34.65. Does coupling E-SPN-0160's register member to the husk light (minimal
// coupling, with back-action) supply the Darwin term, with the sign and the size that take R to the Lorentz value?
//
// DERIVATION (written before the gate run; probe 1, disclosed below, read the light's kernels first).
//
// 1. THE COUPLING. The register member's stream takes slot d along its root r_d. Minimal coupling puts the husk light's
//    link angle on that step as a Peierls phase e^(-i q A . r_d) (E-FRC-0252's construction, the light's integer compact
//    angle): it multiplies ALL 8 register components of the slot alike, so it is register-blind, keeps J (E-SPN-0165) and
//    every projector, and is W(F4) covariant (the phase follows the root). On a uniform field it is exactly the shift
//    K -> K + qA of the stream's Bloch phase: S(K) D_A P = S(K + A) P, so the coupled band IS the free band shifted, and
//    c/4 (sqrt 2 / 4 on the husk, E-SPN-0167), gamma = 0 and R = tan m / m are kept exactly (gate G1). BACK-ACTION: the
//    member sources the light through the coupling J^T G^(-1) A, with J the member's link current, and the current that
//    coupling reads is -dE/dA = dE/dK, the member's group velocity (gate G2). With the continuity of that current, the
//    coupling is gauge invariant under A -> A + G grad chi, so Gauss's law holds with the member as charge. THE RING:
//    the Peierls phase needs zeta_n for the angle's period n (E-FRC-0252 used n = 1024), and the register pieces live
//    in Z[w][1/42]; both sit in Z[zeta_(3n)][1/42] (3n = 3072 for n = 1024), so nothing of the register's exactness is
//    lost, only the ring grows by the angle's roots of unity.
//
// 2. THE LIGHT'S TWO KERNELS (code/measure/darwin-exchange). The husk light's Lagrangian (1/2) Adot^T G^(-1) Adot -
//    (kappa/2) A^T G^(-1/2) H G^(-1/2) A + J^T G^(-1) A - rho phi gives a Coulomb kernel 1/eps(k) (E-FRC-0241) and a
//    transverse kernel (1/kappa) G^(-1/2) H^+ G^(-1/2). A charge moving with velocity v has the link current J_h =
//    (g_h / 6)(u_h . v) rho. The velocity-averaged ratio X(k) = (1/3) sum_i b_i^dag H^+ b_i eps(k) tends to 2 / (3
//    beta) at long wave, beta the transverse eigenvalue over k^2, and the light's own speed c^2 = kappa beta (E-FRC-0179:
//    beta = 2/3) makes X -> 1 EXACTLY: the magnetostatics and the electrostatics are one Maxwell Lagrangian at the speed
//    the light propagates at. Then the averaged transverse exchange is (2/3) / c^2 of the Coulomb one, the Darwin
//    term's (the transverse projector has trace 2). PREDICTED: gauge modes 1, two degenerate transverse modes with
//    lambda / k^2 -> 2/3 isotropically, X -> 1 at every direction.
//
// 3. THE DARWIN INERTIA. Two members of opposite charge moving together at V exchange, at order V^2 / c^2, the Darwin
//    Lagrangian -(e^2 / (8 pi c^2)) V^2 <(1 + (V-hat . r-hat)^2) / r>; averaged over directions that is -(2/3) |<V_C>|
//    V^2 / c^2 x S, S the bound state's weighted mean of X (S -> 1 as the state grows). With the virial |<V_C>| = 2
//    E_b, the inertia gains -(8/3) S E_b (c_member / c_light)^2. So
//      R_full = (2 tan m + (5/3) E_b - (8/3) S E_b (c_m / c_l)^2) / (2m - E_b)
//    THE SIGN is the one E-SPN-0155 asked for: the static pull leaves the pair (8/3) E_b too heavy, and the transverse
//    exchange between opposite charges moving together lowers the inertia by exactly that at S = 1 and one speed. There
//    R_full = (2 tan m - E_b) / (2m - E_b), and R_full - tan m / m = E_b (tan m - m) / (m (2m - E_b)): the binding's
//    excess over the member's own R is removed to FIRST order in E_b, leaving a second-order lattice remainder. R -> 1
//    then needs light members (tan m / m -> 1, E-SPN-0160) and one speed (c_m = c_l, E-FRC-0260 at kappa = 3/16;
//    E-FRC-0261 shows it only as a register-size limit at the balanced split).
//
// 4. THE SMALLEST SYSTEM THAT DECIDES IT. Two register members and the quantum husk light together are out of reach: on a
//    side-8 husk torus the pair's moving block is 8^3 x 256 relative states and the light 4,608 link columns of 2D + 1
//    values each; even truncated to one exchanged transverse quantum it is about 6e8 amplitudes. The Darwin term is
//    exactly the one-quantum exchange at order V^2 / c^2, which is linear response of the light to the member's current,
//    so it is decided by the light's two static kernels (step 2) weighted by the bound state's density. THE STATE: a
//    Gaussian relative density of width sigma (separable, so exact on the torus), whose continuum S is exactly 1; S - 1 is
//    then purely the lattice's correction. PREDICTED (from probe 1's k^2 law, X = 1 - k^2 / 18 + ...): S rises to 1 as
//    sigma grows, S - 1 following the weighted mean k^2 with a constant coefficient.
//
// 5. APPLIED to E-SPN-0155's own bound heavy member (the rule's reading at a_c 3: E 1.67655404, R 1.436549, mean radius
//    5.726; m 0.857072, R_walk = tan m / m 1.347262): E_b = 2m - E = 0.037590, the Gaussian of the same mean radius has
//    sigma = 5.726 sqrt(pi) / 2 = 5.075, and PREDICTED: S about 0.99, the Darwin term removing 0.88 (+-0.02) of the
//    static excess R_static - R_walk, the rest the second-order remainder plus (8/3) E_b (1 - S). The speed ratio is read
//    two ways: one speed (kappa = 3/16 loop light, E-FRC-0260) and the trit column at D = 5 ((c_m / c_l)^2 = 1.03125).
//
// GATES (pre-registered; tolerances set after probe 1, disclosed):
//   G1 coupling exact     the Peierls-coupled cycle at (K, A) equals the free cycle at K + A to 1e-12, 64 husk momenta x
//                         3 fields, on E-SPN-0160's light register schedule
//   G2 back-action        the current the light reads, dE/dA by central difference (h 1e-5), equals the group velocity
//                         (cycleBand's Hellmann-Feynman) to 1e-6 at 8 momenta
//   L0 light              1 gauge mode at every k read; the two lowest nonzero eigenvalues degenerate to 1e-6 relative
//                         and lambda / k^2 within 1e-5 of 2/3 at |k| 1e-2 in 4 directions
//   L1 Maxwell            |X - 1| <= 1e-6 at |k| 1e-3 in 4 directions; the k^2 coefficient (1 - X) / k^2 at |k| 1e-2
//                         equal across the 4 directions to 1% (isotropic)
//   L2 bound state        S(sigma) increasing over sigma 2, 3, 4, 5 (sides 16, 24, 32, 40), S(5) >= 0.98, and
//                         (S - 1) / <k^2> equal at sigma 3, 4, 5 to 10%
//   P1 Darwin             at E-SPN-0155's heavy state the Darwin term removes >= 0.80 of the static excess (one speed)
//   P2 sign               R_full < R_static at every speed ratio read, and R_full >= R_walk (the excess is removed, not
//                         overshot, at first order)
// CONTROLS:
//   C1  E-SPN-0155's static formula reproduces its own rule reading at a_c 3 within 2% (tolerance set after reading its
//       gate log, disclosed)
//   C2  light off (E_b = 0): R_full = R_static = tan m / m exactly
//   C3  transverse off (S = 0): R_full = R_static bit for bit
//   C4  E-SPN-0160 reproduced: the uncoupled schedule's R = tan m / m to 1e-9 in 4 directions
//   C5  E-FRC-0241's Coulomb operator: eps(k) / k^2 within 1e-6 of 6 at |k| 1e-3
// READ, gating nothing: the light register member (m 0.190126) at E_b 0.005, 0.01, 0.02 with S = 1 and one speed.
//
// PREDICTED VERDICT: PARTIAL. The coupling is exact and the light's kernels are Maxwell's at its own speed, so the
// transverse exchange supplies the Darwin inertia with the right sign and size, and on E-SPN-0155's bound state it
// removes about 0.88 of the static excess, leaving R at the member's own tan m / m to second order. Not run: the two
// members and the quantum light as one dynamics (step 4), and a light register pair bound by the Coulomb pull (the
// light Coulomb member leaks on the swap-coin rule, E-SPN-0155; the register closes the census, E-SPN-0160, but no
// Coulomb hold on the register exists yet).
//
// PROBES, disclosed: tmp/dar-probe1.log (the light's eigenvalues and X at |k| 1e-3 to 2 in 4 directions, S at sigma 1,
// 2, 3), before any gate was fixed. It showed lambda / k^2 = 0.666665 at |k| 1e-2, X = 1 - k^2 / 18 + ..., and S 0.855,
// 0.959, 0.982. The gates' tolerances were set from it.
//
// SMOKE (tmp/dar-smoke.log, 13 s): every path on the small plan, all as predicted; nothing changed after it.
//
// FIRST RUN (tmp/dar-exp-run1.log, 64 s): PARTIAL, as predicted, every gate and control held. G1 the coupled cycle is
// the shifted free cycle to 2.2e-15; G2 the current the light reads is the group velocity to 7.8e-11; L0 1 gauge mode,
// transverse lambda / k^2 = 2/3 to 1.9e-6, the pair degenerate to 1.6e-11; L1 |X - 1| 5.7e-8 at |k| 1e-3, X = 1 -
// 0.055555 k^2 isotropic to 3.9e-6; L2 S 0.95945, 0.98217, 0.99001, 0.99362 at sigma 2 to 5, (S - 1) / <k^2> equal to
// 1.4%; on E-SPN-0155's heavy state (E_b 0.037590, sigma 5.075, S 0.99377) R static 1.41484 -> 1.35542 at one speed
// (1.35356 on the D = 5 column) against tan m / m 1.347262, removing 0.879 of the excess (P1, P2); C1 the static
// formula at 0.985 of the rule's 1.436549. Read: the light register member at E_b 0.005, 0.01, 0.02 goes from static
// 1.04792, 1.08458, 1.16095 to 1.01239, 1.01256, 1.01290 against its tan m / m 1.012226.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { boundStateS, coulombSymbol, darwinR, darwinRatio, huskModes, staticR } from '@/code/measure/darwin-exchange'
import { frameRN, partnerProjector48, REGISTER_ROOTS, registerPiece, scaled, singletProjector24 } from '@/code/measure/spinor-register'
import { cycleBand, cyclePhases } from '@/code/measure/swap-cone'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { restFrame } from '@/code/measure/two-beat'

const C_QUARTER = Math.SQRT2 / 4
const LIGHT: readonly [number, number] = [-1, 4]
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GENERIC_RAW = [0.29, 0.52, 0.8]
const GENERIC = GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW))
const DIRS3: readonly number[][] = [[1, 0, 0], [s2, s2, 0], [s3, s3, s3], GENERIC]
const SCALES: readonly number[] = [0.1, 0.2, 0.3, 0.4, 0.5]
const FIELDS: readonly number[][] = [
  [0.03, 0, 0, 0],
  [0.02, -0.05, 0.01, 0],
  [-0.11, 0.07, 0.13, 0],
]
const CURRENT_STEP = 1e-5

// E-SPN-0155's heavy member and its rule reading at a_c 3 (tmp/coul-exp-run1.log)
const HEAVY_M = 0.857072
const HEAVY_E = 1.67655404
const HEAVY_R_RULE = 1.436549
const HEAVY_MEAN_R = 5.726

// the trit column's depth for the second speed ratio: c_l^2 = 2 kappa / 3, kappa = 2 / (2D + 1)
const COLUMN_DEPTH = 5

export type DarwinPlan = { momenta: number; currentMomenta: number; sigmas: readonly number[]; heavySide: number }

export const GATE_PLAN: DarwinPlan = { momenta: 64, currentMomenta: 8, sigmas: [2, 3, 4, 5], heavySide: 40 }

export const SMOKE_PLAN: DarwinPlan = { momenta: 8, currentMomenta: 2, sigmas: [2, 3], heavySide: 24 }

const flag = (b: boolean): number => (b ? 1 : 0)

// the husk momenta (K4 = 0) of a Weyl sequence on the square [-pi, pi)^3, deterministic
function huskMomenta(count: number): number[][] {
  const alpha = [Math.SQRT2 - 1, Math.sqrt(3) - 1, Math.sqrt(5) - 2]

  return Array.from({ length: count }, (_, j) => [...alpha.map(a => 2 * Math.PI * (((0.5 + (j + 1) * a) % 1) - 0.5)), 0])
}

// the Peierls coupling: each row of P (the slot the value is taken to) times e^(-i A . r_row), on all 8 register
// components alike
function peierls(P: CMatrix, A: readonly number[]): CMatrix {
  const n = REGISTER_ROOTS.length
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let r = 0; r < n; r++) {
    const root = REGISTER_ROOTS[r] as readonly number[]
    const ph = -root.reduce((s, x, i) => s + x * (A[i] ?? 0), 0)
    const c = Math.cos(ph)
    const s = Math.sin(ph)

    for (let q = 0; q < n; q++) {
      const a = P.re[r * n + q] as number
      const b = P.im[r * n + q] as number

      re[r * n + q] = c * a - s * b
      im[r * n + q] = c * b + s * a
    }
  }

  return { re, im }
}

const sortedGap = (a: number[], b: number[]): number => {
  const x = [...a].sort((p, q) => p - q)
  const y = [...b].sort((p, q) => p - q)

  return Math.max(...x.map((v, i) => Math.abs(wrap(v - (y[i] as number)))))
}

export function darwinRun(plan: DarwinPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

  // ---------------- the member: E-SPN-0160's light register schedule ----------------
  const u = ringUnit(LIGHT[0], LIGHT[1])
  const theta = unitAngle(u)
  const m = wrap(theta - Math.PI) / 2
  const M = 2 * m
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const P: CMatrix[] = [registerPiece(qS, [Math.cos(theta), Math.sin(theta)]), registerPiece(qD, [Math.cos(theta), -Math.sin(theta)])]

  // C4: E-SPN-0160 reproduced
  const frame = restFrame(theta, -theta, M)
  const fits = DIRS3.map(d => frameRN(P, frame, theta, [...d, 0], C_QUARTER, SCALES, REGISTER_ROOTS))
  const tanRatio = Math.tan(m) / m
  const C4 = fits.every(f => Math.abs(f.R - tanRatio) <= 1e-9)

  log('C4')

  // ---------------- G1: the coupling is the shift K -> K + A ----------------
  const momenta = huskMomenta(plan.momenta)
  let g1Gap = 0

  for (const A of FIELDS) {
    const coupled = P.map(x => peierls(x, A))

    for (const K of momenta) g1Gap = Math.max(g1Gap, sortedGap(cyclePhases(coupled, REGISTER_ROOTS, K), cyclePhases(P, REGISTER_ROOTS, K.map((x, i) => x + (A[i] ?? 0)))))
  }

  const G1 = g1Gap <= 1e-12

  log('G1')

  // ---------------- G2: the current the light reads is the group velocity ----------------
  let g2Gap = 0

  for (const K of momenta.slice(0, plan.currentMomenta).map(k => k.map(x => x * 0.3))) {
    const band = cycleBand(P, REGISTER_ROOTS, K)
    // the S band's eigenphase: the one nearest pi + E on the upper branch (theta's side); its eigenvector's velocity
    const target = band.phase.reduce((b, p, j) => (Math.abs(wrap(p - theta)) < Math.abs(wrap((band.phase[b] as number) - theta)) ? j : b), 0)
    const phase0 = band.phase[target] as number
    const hf = band.velocity[target] as number[]
    const fd = [0, 1, 2].map(i => {
      const read = (s: number): number => {
        const A = [0, 0, 0, 0]

        A[i] = s * CURRENT_STEP

        return cyclePhases(
          P.map(x => peierls(x, A)),
          REGISTER_ROOTS,
          K,
        ).reduce((b, p) => (Math.abs(wrap(p - phase0)) < Math.abs(wrap(b - phase0)) ? p : b))
      }

      // E = -phase / beats per beat; dE/dA_i
      return -wrap(read(1) - read(-1)) / (2 * CURRENT_STEP) / P.length
    })

    g2Gap = Math.max(g2Gap, ...fd.map((x, i) => Math.abs(x - (hf[i] ?? 0))))
  }

  const G2 = g2Gap <= 1e-6

  log('G2')

  // ---------------- L0, L1, C5: the light's kernels ----------------
  const smallK = 1e-2
  const tinyK = 1e-3
  let gaugeOk = true
  let degeneracy = 0
  let betaGap = 0
  let xGap = 0
  const coefficients: number[] = []

  for (const d of DIRS3) {
    for (const r of [tinyK, smallK]) {
      const k = d.map(x => x * r)
      const modes = huskModes(k)
      const x = darwinRatio(k)

      if (x.gauge !== 1) gaugeOk = false
      if (r === smallK) {
        const [a, b] = x.transverse as [number, number]

        degeneracy = Math.max(degeneracy, Math.abs(a / b - 1))
        betaGap = Math.max(betaGap, Math.abs(a / (r * r) - 2 / 3), Math.abs(b / (r * r) - 2 / 3))
        coefficients.push((1 - x.X) / (r * r))
      } else {
        xGap = Math.max(xGap, Math.abs(x.X - 1))
        void modes
      }
    }
  }

  const coefficientSpread = Math.max(...coefficients.map(c => Math.abs(c / (coefficients[0] as number) - 1)))
  const L0 = gaugeOk && degeneracy <= 1e-6 && betaGap <= 1e-5
  const L1 = xGap <= 1e-6 && coefficientSpread <= 0.01
  const epsGap = Math.max(...DIRS3.map(d => Math.abs(coulombSymbol(d.map(x => x * tinyK)) / (tinyK * tinyK) - 6)))
  const C5 = epsGap <= 1e-6

  log('L0, L1, C5')

  // ---------------- L2: the bound state's S ----------------
  const states = plan.sigmas.map(sigma => ({ sigma, ...boundStateS(sigma, 8 * sigma) }))
  const rising = states.every((s, i) => i === 0 || s.S > (states[i - 1] as { S: number }).S)
  const lawRatios = states.slice(1).map(s => (s.S - 1) / s.meanK2)
  const lawSpread = Math.max(...lawRatios.map(x => Math.abs(x / (lawRatios[0] as number) - 1)))
  const last = states[states.length - 1] as { S: number }
  const L2 = rising && last.S >= 0.98 && lawSpread <= 0.1

  log('L2')

  // ---------------- P1, P2 and the controls on E-SPN-0155's heavy state ----------------
  const Eb = 2 * HEAVY_M - HEAVY_E
  const sigmaHeavy = (HEAVY_MEAN_R * Math.sqrt(Math.PI)) / 2
  const heavy = boundStateS(sigmaHeavy, plan.heavySide)
  const walk = Math.tan(HEAVY_M) / HEAVY_M
  const rStatic = staticR(HEAVY_M, Eb)
  const kappa = 2 / (2 * COLUMN_DEPTH + 1)
  const columnRatio2 = C_QUARTER ** 2 / ((2 * kappa) / 3)
  const rOne = darwinR(HEAVY_M, Eb, heavy.S, 1)
  const rColumn = darwinR(HEAVY_M, Eb, heavy.S, columnRatio2)
  const removed = (rStatic - rOne) / (rStatic - walk)
  const P1 = removed >= 0.8
  const P2 = rOne < rStatic && rColumn < rStatic && rOne >= walk && rColumn >= walk
  const C1 = Math.abs(rStatic / HEAVY_R_RULE - 1) <= 0.02
  const C2 = darwinR(HEAVY_M, 0, heavy.S, 1) === staticR(HEAVY_M, 0) && Math.abs(staticR(HEAVY_M, 0) - walk) <= 1e-15
  const C3 = darwinR(HEAVY_M, Eb, 0, 1) === rStatic

  // read: the light register member
  const lightReads = [0.005, 0.01, 0.02].map(e => ({ Eb: e, rStatic: staticR(m, e), rFull: darwinR(m, e, 1, 1) }))

  log('P, C')

  const gates = { G1, G2, L0, L1, L2, P1, P2 }
  const controls = { C1, C2, C3, C4, C5 }
  const all = Object.values(gates).every(Boolean) && Object.values(controls).every(Boolean)
  const f = (x: number, d = 6): string => x.toFixed(d)

  return verdict({
    status: all ? 'partial' : 'fail',
    claim: `the register member couples to the husk light exactly (the Peierls phase is register-blind and is the shift K -> K + A to ${g1Gap.toExponential(1)}, the current the light reads is the group velocity to ${g2Gap.toExponential(1)}), and the light's transverse and Coulomb kernels are one Maxwell Lagrangian at its own speed (1 gauge mode, transverse lambda / k^2 = 2/3 to ${betaGap.toExponential(1)}, X -> 1 to ${xGap.toExponential(1)}, X = 1 - ${f(coefficients[0] as number, 5)} k^2 isotropic to ${coefficientSpread.toExponential(1)}), so the transverse exchange supplies the Darwin inertia -(8/3) S E_b with S ${states.map(s => `${f(s.S, 5)} (sigma ${s.sigma})`).join(', ')}; on E-SPN-0155's bound heavy state (E_b ${f(Eb, 6)}, S ${f(heavy.S, 5)}) it takes R from the static ${f(rStatic, 5)} to ${f(rOne, 5)} at one speed (${f(rColumn, 5)} on the D = 5 trit column) against the member's own tan m / m ${f(walk, 6)}, removing ${f(removed, 3)} of the binding's excess; not run: the two members and the quantum light as one dynamics, and a light register pair held by the Coulomb pull`,
    metrics: {
      G1: flag(G1),
      G2: flag(G2),
      L0: flag(L0),
      L1: flag(L1),
      L2: flag(L2),
      P1: flag(P1),
      P2: flag(P2),
      g1Gap,
      g2Gap,
      betaGap,
      degeneracy,
      xGap,
      k2Coefficient: coefficients[0] as number,
      coefficientSpread,
      ...Object.fromEntries(states.map(s => [`S_sigma${s.sigma}`, s.S])),
      ...Object.fromEntries(states.map(s => [`meanK2_sigma${s.sigma}`, s.meanK2])),
      lawSpread,
      heavyEb: Eb,
      heavySigma: sigmaHeavy,
      heavyS: heavy.S,
      rWalk: walk,
      rStatic,
      rOneSpeed: rOne,
      rColumn,
      columnRatio2,
      removed,
      ...Object.fromEntries(lightReads.flatMap(r => [
        [`lightStatic_Eb${r.Eb}`, r.rStatic],
        [`lightFull_Eb${r.Eb}`, r.rFull],
      ])),
    },
    control: { C1: flag(C1), C2: flag(C2), C3: flag(C3), C4: flag(C4), C5: flag(C5), staticOverRule: rStatic / HEAVY_R_RULE, epsGap, tanRatio },
    notes: `L2, deterministic (Weyl momenta, torus grids, separable Gaussian densities; no draw). Gates ${JSON.stringify(gates)}, controls ${JSON.stringify(controls)}. Member: light register u = ringUnit(${LIGHT.join(', ')}) m ${f(m, 6)}, R ${fits.map(x => f(x.R, 12)).join(' ')} against tan m/m ${f(tanRatio, 12)}. The Darwin reduction is the one-quantum exchange at order V^2 / c^2 (linear response of the light to the member's current), weighted by a Gaussian relative density whose continuum S is exactly 1. Light register member (read, S = 1, one speed): ${lightReads.map(r => `E_b ${r.Eb}: static ${f(r.rStatic, 5)}, full ${f(r.rFull, 5)}`).join('; ')} (tan m/m ${f(tanRatio, 6)}). ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'spin/darwin-exchange',
  code: 'E-SPN-0169',
  title:
    "the model's own light coupled to the register member supplies the Darwin inertia, partial: the Peierls coupling is register-blind, exact, gauge covariant and reads the member's group velocity as its current; the husk light's transverse and Coulomb kernels are one Maxwell Lagrangian at its own speed (transverse lambda / k^2 = 2/3, the velocity-averaged ratio X -> 1 isotropically, X = 1 - k^2 / 18 + ...), so a bound pair's transverse exchange lowers its inertia by (8/3) S E_b (c_m / c_l)^2 with S -> 1 as the state grows; on E-SPN-0155's bound heavy state that removes most of the static excess and leaves R at the member's own tan m / m to second order; the two-member quantum dynamics is not run",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return darwinRun(GATE_PLAN)
  },
})
