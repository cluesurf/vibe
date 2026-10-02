// A PAIRING GAP FROM THE CONTACT ANGLE (E-FND-0173). Route J4a (roadmap routes/gravity-cosmos-heat-classical.md, the
// superconductivity row, line 675; ledger row "superconductivity, superfluidity, condensation", stand-in, E-FLD-0007).
// Hartree-Fock keeps no pair correlations; its pairing version can. This file builds a BCS state on the register rule's
// own band, takes the rule's own contact phases as the pair potential, and solves the gap equation at three fillings.
// The route names it a new piece, a pairing mean field on the register rule. So the file keeps two things apart:
//
//   THE RULE (exact, nothing chosen here). E-SPN-0175's many-body register rule as in E-FND-0161/0162/0166: the member
//   mixers at the light unit ringUnit(-1, 4), the sector contact v^2 with v = ringUnit(2, 0), hole angles reversed. One
//   hole moves on the 8 moving states a momentum of one half (E-FND-0161's frame; the 176 flats a momentum are exact
//   spectators: they never meet a pair piece, so they are left out exactly). Beat 1's pair piece multiplies two holes that
//   both sit in S at one site by e^(i phi); beat 2's multiplies two that both sit in D at one site by e^(-i phi)
//   (E-SPN-0175's reversal, register-holes' pairPhases sign -1), phi = -2 theta_v = -2.66779 for holes.
//   THE READING (the new piece, chosen here). (a) The free cycle's Floquet Hamiltonian h(q) = i log(-A2 A1) on the 8
//   moving states (the eigenphases sit near pi; -U moves them near 0, a constant pi a hole). (b) A phase e^(i phi) on a
//   contact pair is e^(-i H) with H = -phi n_a n_b (principal branch, |phi| < pi), and to first order in the cycle the two
//   beats' pieces add: H_eff = h + g_S sum_x sum_{a<b} n_Sa n_Sb + g_D sum_x sum_{a<b} n_Da n_Db, with
//   g_S = -phi = +2.668 (repulsive) and g_D = +phi = -2.668 (attractive); D is carried to beat 1's frame by A1(q).
//   (c) BCS: Delta_ab = g <s_b s_a> on each channel's six contact pairs, Bogoliubov-de Gennes at zero temperature, the
//   grand potential Omega(Delta) compared with Omega(0). Hartree and Fock shifts are left out (they move mu). The string
//   part of the pair piece (0.287 a unit of V) is left out of the pair potential, as the route asks (contact only).
//
// DERIVED BEFORE THE GATE RUN (code/measure/register-pairing; probes disclosed below).
// 1. THE CONTACT IS ONE PHASE WITH TWO SIGNS (L1). Beat 2 takes the conjugate phase, so on the principal branch the rule's
//    contact is repulsive in S and attractive in D, of equal size 2 theta_v = 2.668 a cycle. This is E-SPN-0092's pair of
//    contacts on the knit (the like contact w, -2 pi/3, under pass; -w, +pi/3, under the bounce: u = +1 and u = -1 differ
//    by a pair sign, i.e. by pi) carried by one rule at once, one sign a beat. The branch is not fixed by the rule: a pair
//    phase is defined mod 2 pi, and the other consistent branch (phi -> phi + 2 pi on beat 1, its conjugate on beat 2)
//    gives g_S = -3.615, g_D = +3.615. Under either branch exactly one channel attracts; which one, and how strongly, is
//    the reading's choice. (A Floquet rule has no ground state, so "lowest energy" is itself the reading.)
// 2. A REPULSIVE CONTACT ALONE CANNOT PAIR (L1, the control's known answer). H_int = g sum B^dag B with B_ab = s_b s_a. For
//    any Delta, E_0(lambda), the BdG ground energy of H_0 + lambda (Delta^* B + h.c.), is concave and even in lambda (the
//    phase rotation c -> i c maps Delta -> -Delta), so dE_0/dlambda at 1 is <= 0: Re sum Delta^* <B> <= 0. A solution
//    Delta = g <B> with every g > 0 gives sum g |<B>|^2 <= 0, so Delta = 0. On the rule's band with S alone (C1) the gap
//    equation must return 0 at every filling; with D present nothing forbids a gap.
// 3. THE D CHANNEL PAIRS AT EVERY FILLING (L2, expected). An on-site attraction pairs any band whose states carry weight
//    in the channel; on a finite torus there is no Cooper log, so the test is |g| chi > 1, and |g_D| = 2.668 is six times
//    the upper band's width (0.380 to 0.813 at L = 4, 0.380 to 0.826 at L = 6). That is the strong-coupling side of
//    Nozieres and Schmitt-Rink: the flat-band limit gives Delta_01 = Delta_23 = (|g| / 2) sqrt(4 nu (1 - nu)), a norm
//    sqrt 2 |g| / 2 = 1.89 at nu = 1/2, which the probes' 1.80 to 1.81 sit near. The gap is a binding scale of order |g|,
//    not a coherence scale: whether the pairs move (and so whether this is a superconductor) is not read here.
// 4. FILLING. The fraction of the 8 moving states a momentum (one half) that holes occupy: 1/2 fills the lower band, so
//    0.625, 0.75, 0.875 put a quarter, a half and three quarters of the upper band (4 states a momentum) under holes. At
//    strong coupling mu moves with Delta, so each filling is held by solving the number equation with the gap equation
//    (secant on mu, each gap solve warm-started), as Nozieres and Schmitt-Rink do.
//
// PROBES BEFORE THE GATES, disclosed (tmp/pg-*): pg-probe1 (L = 4 frame: unitary 4.3e-15, the cycle's trace -7.43 at
//  q = 0, so the band sits near pi); pg-probe2 (Jacobi residual 2.3e-15; the flat band gives 1.0000 and 0.86603 against
//  1 and 0.86603; the L = 4 band levels +-0.380 ... +-0.813, ten distinct); pg-probe3 (plain mixing: a repulsive flat
//  band at mix 0.5 oscillates instead of returning 0, so the solver mixes at 0.3 with Anderson; rule Delta_D 1.77 to
//  1.81 at mu 0.41 to 0.79); pg-probe4 (Anderson alone settled the attractive flat band on its unstable Delta = 0, so 40
//  plain steps come first; at L = 4, mu = 0.5: rule |Delta_S| 0.047, |Delta_D| 1.807, BdG gap 0.668 against the normal
//  0.053, Omega lowered by 0.914; S alone 4.6e-12; D alone 1.804; the sign flip |Delta_S| 1.21; the other branch
//  |Delta_S| 2.08; filling 0.75 held at mu 0.5125 in 5 secant steps; at mu = 0, inside the Dirac gap, the rule still
//  pairs, 1.585, and the filling moves from 0.5 to 0.635); pg-probe5 (L = 6, mu = 0.5: frame 46 s, |Delta_S| 5.6e-10,
//  |Delta_D| 1.807, gap 0.680, 380 iterations, 339 s). The probe values of Delta_S differ between L = 4 (0.047) and
//  L = 6 (6e-10): the paired state has a degenerate family (internal rotations of the D pair), and S is read, not gated.
//  SMOKE (tmp/pg-smoke.log, this file at one filling, 0.75, with the size read at L = 4): every path ran, pass on that
//  filling (mu 0.5125, |Delta_D| 1.8074, gap 0.672 against 0.046, C1 2.7e-12, I1 at 8e-12), and exposed one weakness:
//  the both-channel solve started cold at the same mu did not converge in 600 steps (residual 4.8e-2, |Delta_D| 1.907),
//  while the secant's warm-started solves did. The gated solves are all warm-started or single-channel, and the size
//  read is now warm-started from L = 4's solution. No gate or threshold was moved.
//
// HYPOTHESES AND GATES, fixed before the gate run. L = 4 for the gates, one half, total momentum 0 pairs (q, -q).
//  I1 INSTRUMENT: the frame unitary and the sector states inside the moving span within 1e-12; the Floquet logarithm's
//     residual at most 1e-12 with every eigenphase inside (-pi/2, pi/2) (cos > 0); every BdG eigen residual at most
//     1e-10; every gated gap solve converged (max |g <B> - Delta| at most 1e-9) and every fixed-filling solve within 1e-8
//     of its filling; the textbook flat band through the same solver: |Delta| = sqrt(U^2 / 4 - mu^2) within 1e-9 at
//     (U, mu) = (-2, 0.5) and (-1, 0.2), and |Delta| at most 1e-9 at (+2, 0.3).
//  C1 CONTROL (the instrument reads the zero outcome on the rule's own band): the S channel alone (g_S = +2.668, the
//     repulsive half of the rule's contact) returns |Delta| at most 1e-8 at all three fillings' mu, from a seed of 0.2.
//  H1 THE ROUTE'S HYPOTHESIS: with the rule's contact as the pair potential (both channels, principal branch), at each of
//     the three fillings the gap equation has a solution with the larger channel's |Delta| at least 1e-3, a BdG gap at
//     least twice the normal state's at the same mu, and Omega(Delta) below Omega(0).
//  P1 THE ROUTE'S KILL: no nonzero gap at any filling (every filling's |Delta| at most 1e-8).
// VERDICT: fail if P1 fires; pass if H1, I1 and C1 hold; partial otherwise (a gap at some fillings only, or an
//  instrument or control miss).
// READ, gating nothing: Delta_S and Delta_D at each filling and their mu; D alone; the sign flip (g_S = -2.668,
//  g_D = +2.668: the members' reading, angles not reversed); the other branch (g_S = -3.615, g_D = +3.615); mu = 0 inside
//  the Dirac gap (an insulating normal state); the L = 6 torus at the half-filling mu of L = 4.
//
// WHAT THIS CAN AND CANNOT SHOW. It can show whether a BCS mean field built on the rule's band, with the rule's contact
// phases as the only pair potential, pairs, and which channel does it. It cannot show that the register rule
// superconducts: the first-order reading of a cycle whose contact phase (2.668) is not small against pi is not a
// controlled expansion; the branch is a choice (both branches pair, item 1); the mean field is not the exact many-hole
// state (E-FND-0166's exact two-hole pairs bind and do not move, band at most 0.032 a cycle); the gap here is a binding
// scale, and the pairs' mobility, the stiffness and any off-diagonal long-range order (J4b) are not read; the string is
// left out; one half, one tone, one flavor, the 4d torus, not the husk. No ledger row moves from a mean field. L2.
//
// FIRST RUN 2026-10-02 (tmp/pg-run1.log, 329 s): PARTIAL, H1 missed on one clause at one filling, a defect of the gate's
// design recorded here and not rerun. P1 does not fire: the gap equation has a nonzero solution at every filling.
//  - H1: filling 0.625 at mu -0.0475 (6 secant steps): |Delta_S| 0.061, |Delta_D| 1.544, Omega lowered by 0.2825, BdG gap
//    0.3351 against the normal state's 0.3327 at that mu: the ratio clause (at least 2) FAILS. Filling 0.75 at mu 0.5125:
//    |Delta_S| 0.047, |Delta_D| 1.807, gap 0.6725 against 0.0457, Omega lowered by 0.914. Filling 0.875 at mu 1.1247:
//    |Delta_S| 1.2e-10, |Delta_D| 1.589, gap 0.8482 against 0.3120, Omega lowered by 0.318. So H1 holds at 0.75 and 0.875.
//    The defect: at strong coupling the number equation moves mu out of the band (into the Dirac gap at 0.625, above the
//    band top 0.813 at 0.875), so the normal state at the paired mu is an insulator and its gap is no reference for a
//    gap opened by pairing. That mu leaves the band is itself the strong-coupling (Bose) side of Nozieres and
//    Schmitt-Rink, which item 3 named but the gate did not foresee. The order parameter and the energy clauses hold at
//    all three fillings.
//  - C1: the repulsive S contact alone returns 4.7e-13, 2.7e-12, 6.6e-12 at the three mu (the concavity theorem's 0).
//  - I1: frame 4.3e-15, sector 8.7e-16, log 4.1e-15 (min cos 0.6875), eigen 6.8e-15, convergence 9.7e-12, fillings within
//    5e-10, the textbook flat band within 8.2e-12 (0.866025403784 and 0.458257569504; 9.4e-13 for U > 0).
//  - Reads at mu 0.5125: D alone |Delta_D| 1.805, gap 0.684 (the pairing is the D channel's; S adds 0.047 and costs
//    little); the sign flip (members' reading) pairs in S, 1.212, gap 0.093; the other branch pairs in S, 2.076, gap
//    0.115, with D at 1.5e-10; at mu 0 (inside the Dirac gap) the rule pairs anyway, 1.585, and the filling moves from 0.5
//    to 0.635; on L = 6 (648 momenta, warm-started) |Delta_D| 1.811, |Delta_S| 0.048, gap 0.671 against 0.0066: the
//    pairing does not depend on the box.
//  Read plainly: in this mean field the register rule's contact pairs holes at every filling tried, through the attractive
//  half of its contact (beat 2's D phase on the principal branch, S on the other), at a gap of order the contact angle
//  itself; the reading is uncontrolled at that strength, and a pair band (E-FND-0166: at most 0.032 a cycle) says the
//  pairs are heavy, so superconductivity is not shown.

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
import { holeFrame } from '@/code/measure/register-holes'
import {
  flatBandProblem,
  registerBand,
  solveGap,
  solveGapAtFilling,
  type GapSolution,
  type PairProblem,
  type SolveOptions,
} from '@/code/measure/register-pairing'

const LIGHT: readonly [number, number] = [-1, 4]
const VERTEX: readonly [number, number] = [2, 0]
const FRAME_TOL = 1e-12
const LOG_TOL = 1e-12
const EIG_TOL = 1e-10
const CONVERGED = 1e-9
const FILL_TOL = 1e-8
const TEXTBOOK_TOL = 1e-9
const ZERO = 1e-8
const NONZERO = 1e-3
const GAP_RATIO = 2

export type PairingPlan = {
  L: number
  fillings: readonly number[]
  // the secant's two starting mu for each filling
  starts: readonly (readonly [number, number])[]
  readL: number | null
  solve: SolveOptions
  maxMu: number
}

export const GATE_PLAN: PairingPlan = {
  L: 4,
  fillings: [0.625, 0.75, 0.875],
  starts: [
    [0.42, 0.45],
    [0.5, 0.52],
    [0.6, 0.65],
  ],
  readL: 6,
  solve: {
    seed: 0.2,
    seedIndex: 7,
    maxIter: 600,
    tol: 1e-11,
    mix: 0.3,
    memory: 6,
    plain: 40,
  },
  maxMu: 24,
}

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'foundations/register-pairing-gap',
  code: 'E-FND-0173',
  title:
    "a BCS mean field on the register rule's band, with the rule's contact phases as the pair potential, pairs at all three fillings, partial (the gap gate's normal-state reference fails at filling 0.625, where the number equation moves mu into the Dirac gap and the normal state is already gapped, 0.335 against 0.333): beat 1's contact repels in S and beat 2's conjugate attracts in D (g = +-2.668 on the principal branch), the D channel pairs at strong coupling (|Delta_D| 1.54, 1.81, 1.59 at fillings 0.625, 0.75, 0.875, Omega lowered by 0.28 to 0.91, BdG gap 0.672 against 0.046 normal at 0.75, mu outside the band at 0.625 and 0.875: the Bose side), the repulsive S contact alone gives 0 (6.6e-12, as concavity demands), and the other branch pairs in S instead; a first-order reading of a cycle whose contact phase is not small, and the pairs' mobility is not read",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerPairingRun(GATE_PLAN)
  },
})

const maxNorm = (s: GapSolution): number => Math.max(...s.norm)

export function registerPairingRun(plan: PairingPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )
  const th = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u: [number, number] = [Math.cos(th), Math.sin(th)]
  const Ps = [
    registerPiece(scaled(singletProjector24(), 24), u),
    registerPiece(scaled(partnerProjector48(), 48), [u[0], -u[1]]),
  ]
  const phi = -2 * unitAngle(ringUnit(VERTEX[0], VERTEX[1]))
  const gS = -phi
  const gD = phi
  const o = plan.solve

  let eigWorst = 0
  let convWorst = 0

  const track = (s: GapSolution): GapSolution => {
    eigWorst = Math.max(eigWorst, s.residual)
    convWorst = Math.max(convWorst, s.change)

    return s
  }

  const normal = (P: PairProblem, mu: number): GapSolution =>
    track(solveGap(P, mu, { ...o, seed: 0, maxIter: 0 }))

  // ---------------- I1 part: the textbook flat band through the same solver ----------------
  const textbook = (
    [
      [-2, 0.5],
      [-1, 0.2],
      [2, 0.3],
    ] as const
  ).map(([U, mu]) => {
    const s = track(
      solveGap(flatBandProblem(4, U), mu, { ...o, pairsUsed: 1 }),
    )
    const expect =
      U < 0 && Math.abs(mu) < -U / 2
        ? Math.sqrt((U * U) / 4 - mu * mu)
        : 0

    return {
      U,
      mu,
      delta: s.norm[0]!,
      expect,
      error: Math.abs(s.norm[0]! - expect),
    }
  })
  const textbookOk = textbook.every(t => t.error <= TEXTBOOK_TOL)

  log(
    `textbook flat band: ${textbook.map(t => `U ${t.U} mu ${t.mu}: ${t.delta.toPrecision(12)} (expect ${t.expect.toPrecision(12)})`).join('; ')}`,
  )

  // ---------------- the band ----------------
  const fr = holeFrame(torus(plan.L), Ps, 8)
  const band = registerBand(fr, gS, gD)
  const P = band.problem
  const frameOk =
    band.checks.frameUnitary <= FRAME_TOL &&
    band.checks.sectorOutside <= FRAME_TOL
  const logOk =
    band.checks.floquetResidual <= LOG_TOL && band.checks.minCos > 0
  const levels = band.levels
    .flatMap(x => Array.from(x))
    .sort((a, b) => a - b)

  log(
    `frame L ${plan.L}: unitary ${band.checks.frameUnitary.toExponential(2)}, sector ${band.checks.sectorOutside.toExponential(2)}, log ${band.checks.floquetResidual.toExponential(2)}, min cos ${band.checks.minCos.toFixed(4)}; levels ${levels[0]!.toFixed(4)} .. ${levels[levels.length - 1]!.toFixed(4)}`,
  )

  // ---------------- H1: the rule at three fillings ----------------
  const rule = plan.fillings.map((f, i) => {
    const s = solveGapAtFilling(P, f, plan.starts[i]!, {
      ...o,
      fillTol: FILL_TOL / 10,
      maxMu: plan.maxMu,
    })

    track(s)

    const z = normal(P, s.mu)
    const out = {
      filling: f,
      mu: s.mu,
      reached: s.filling,
      muSteps: s.muSteps,
      dS: s.norm[0]!,
      dD: s.norm[1]!,
      gap: s.gap,
      gap0: z.gap,
      fill0: z.filling,
      dOmega: s.omega - z.omega,
      iterations: s.iterations,
      delta: s.delta,
    }

    log(
      `H1 filling ${f}: mu ${out.mu.toFixed(6)} (${out.muSteps} steps, filling ${out.reached.toFixed(10)}), |Delta_S| ${out.dS.toExponential(3)}, |Delta_D| ${out.dD.toFixed(5)}, gap ${out.gap.toFixed(5)} against ${out.gap0.toFixed(5)}, dOmega ${out.dOmega.toFixed(5)}`,
    )

    return out
  })
  const fillOk = rule.every(
    r => Math.abs(r.reached - r.filling) <= FILL_TOL,
  )
  const paired = rule.map(
    r =>
      Math.max(r.dS, r.dD) >= NONZERO &&
      r.gap >= GAP_RATIO * r.gap0 &&
      r.dOmega < 0,
  )
  const H1 = paired.every(Boolean)
  const P1 = rule.every(r => Math.max(r.dS, r.dD) <= ZERO)

  // ---------------- C1: the repulsive S channel alone ----------------
  const sOnly: PairProblem = {
    ...P,
    channels: [
      { ...P.channels[0]!, g: gS },
      { ...P.channels[1]!, g: 0 },
    ],
  }
  const control = rule.map(r => track(solveGap(sOnly, r.mu, o)))
  const C1 = control.every(s => maxNorm(s) <= ZERO)

  log(
    `C1 S alone: ${control.map(s => maxNorm(s).toExponential(2)).join(', ')}`,
  )

  // ---------------- reads ----------------
  const muHalf = rule[Math.floor(rule.length / 2)]!.mu

  const variant = (
    name: string,
    a: number,
    b: number,
    mu: number,
  ): {
    name: string
    mu: number
    dS: number
    dD: number
    gap: number
    dOmega: number
    filling: number
    change: number
  } => {
    const Q: PairProblem = {
      ...P,
      channels: [
        { ...P.channels[0]!, g: a },
        { ...P.channels[1]!, g: b },
      ],
    }
    const s = solveGap(Q, mu, o)
    const z = solveGap(Q, mu, { ...o, seed: 0, maxIter: 0 })
    const out = {
      name,
      mu,
      dS: s.norm[0]!,
      dD: s.norm[1]!,
      gap: s.gap,
      dOmega: s.omega - z.omega,
      filling: s.filling,
      change: s.change,
    }

    log(
      `read ${name} at mu ${mu.toFixed(4)}: |Delta_S| ${out.dS.toExponential(3)}, |Delta_D| ${out.dD.toExponential(3)}, gap ${out.gap.toFixed(5)}, dOmega ${out.dOmega.toFixed(5)}, filling ${out.filling.toFixed(4)} (residual ${out.change.toExponential(1)})`,
    )

    return out
  }

  const reads = [
    variant('D alone', 0, gD, muHalf),
    variant('sign flip', -gS, -gD, muHalf),
    variant('other branch', gS - 2 * Math.PI, gD + 2 * Math.PI, muHalf),
    variant('rule at mu 0', gS, gD, 0),
  ]

  let large: {
    L: number
    dS: number
    dD: number
    gap: number
    gap0: number
    filling: number
    change: number
    seconds: number
  } | null = null

  if (plan.readL !== null) {
    const t0 = Date.now()
    const frL = holeFrame(torus(plan.readL), Ps, 8)
    const bL = registerBand(frL, gS, gD)
    // warm-started from L = 4's solution at the same mu (Delta is a per-site amplitude, so it carries between tori)
    const s = solveGap(bL.problem, muHalf, {
      ...o,
      start: rule[Math.floor(rule.length / 2)]!.delta,
    })
    const z = solveGap(bL.problem, muHalf, {
      ...o,
      seed: 0,
      maxIter: 0,
    })

    large = {
      L: plan.readL,
      dS: s.norm[0]!,
      dD: s.norm[1]!,
      gap: s.gap,
      gap0: z.gap,
      filling: s.filling,
      change: s.change,
      seconds: (Date.now() - t0) / 1000,
    }

    log(
      `read L ${plan.readL} at mu ${muHalf.toFixed(4)}: |Delta_S| ${large.dS.toExponential(3)}, |Delta_D| ${large.dD.toFixed(5)}, gap ${large.gap.toFixed(5)} against ${large.gap0.toFixed(5)}, filling ${large.filling.toFixed(4)} (residual ${large.change.toExponential(1)})`,
    )
  }

  const eigOk = eigWorst <= EIG_TOL
  const convOk = convWorst <= CONVERGED
  const I1 = frameOk && logOk && eigOk && convOk && fillOk && textbookOk
  const status = P1 ? 'fail' : H1 && I1 && C1 ? 'pass' : 'partial'
  const metrics: Record<string, number> = {
    H1: flag(H1),
    P1: flag(P1),
    C1: flag(C1),
    I1: flag(I1),
    phi,
    gS,
    gD,
    frameUnitary: band.checks.frameUnitary,
    sectorOutside: band.checks.sectorOutside,
    floquetResidual: band.checks.floquetResidual,
    minCos: band.checks.minCos,
    eigWorst,
    convWorst,
    textbookWorst: Math.max(...textbook.map(t => t.error)),
    controlWorst: Math.max(...control.map(maxNorm)),
    bandMin: levels[0]!,
    bandMax: levels[levels.length - 1]!,
    seconds: (Date.now() - started) / 1000,
  }

  rule.forEach(r => {
    const k = String(r.filling)

    metrics[`mu_${k}`] = r.mu
    metrics[`deltaS_${k}`] = r.dS
    metrics[`deltaD_${k}`] = r.dD
    metrics[`gap_${k}`] = r.gap
    metrics[`gapNormal_${k}`] = r.gap0
    metrics[`dOmega_${k}`] = r.dOmega
  })

  reads.forEach(r => {
    const k = r.name.replace(/ /g, '_')

    metrics[`read_${k}_deltaS`] = r.dS
    metrics[`read_${k}_deltaD`] = r.dD
    metrics[`read_${k}_gap`] = r.gap
    metrics[`read_${k}_filling`] = r.filling
  })

  if (large) {
    metrics.readL_deltaS = large.dS
    metrics.readL_deltaD = large.dD
    metrics.readL_gap = large.gap
    metrics.readL_gapNormal = large.gap0
  }

  return verdict({
    status,
    claim: `H1 ${H1} (the rule's contact as the pair potential, g_S ${gS.toFixed(4)} repulsive and g_D ${gD.toFixed(4)} attractive on the principal branch: ${rule.map(r => `filling ${r.filling} at mu ${r.mu.toFixed(4)}: |Delta_S| ${r.dS.toExponential(2)}, |Delta_D| ${r.dD.toFixed(4)}, BdG gap ${r.gap.toFixed(4)} against ${r.gap0.toFixed(4)} normal, dOmega ${r.dOmega.toFixed(4)}`).join('; ')}); P1 ${P1}; control C1 ${C1} (S alone ${control.map(s => maxNorm(s).toExponential(2)).join(', ')}); instrument I1 ${I1} (frame ${band.checks.frameUnitary.toExponential(1)}, log ${band.checks.floquetResidual.toExponential(1)}, eigen ${eigWorst.toExponential(1)}, convergence ${convWorst.toExponential(1)}, textbook ${metrics.textbookWorst!.toExponential(1)})`,
    metrics,
    control: { C1: flag(C1), instrument: flag(I1) },
    notes: `L2: a BCS (Bogoliubov-de Gennes) mean field on the register rule's one-hole Floquet band, the first-order sum of the two beats' contact pieces as the pair potential; a reading, not the rule. The 4d torus L ${plan.L} (${P.h.length} momenta), one half, 8 moving states a momentum, flats left out exactly. Reads at mu ${muHalf.toFixed(4)}: ${reads.map(r => `${r.name}: |Delta_S| ${r.dS.toExponential(2)}, |Delta_D| ${r.dD.toExponential(2)}, gap ${r.gap.toFixed(4)}, dOmega ${r.dOmega.toFixed(4)}, filling ${r.filling.toFixed(4)}`).join('; ')}${large ? `; L ${large.L}: |Delta_S| ${large.dS.toExponential(2)}, |Delta_D| ${large.dD.toFixed(4)}, gap ${large.gap.toFixed(4)} against ${large.gap0.toFixed(4)}, ${large.seconds.toFixed(0)} s` : ''}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
