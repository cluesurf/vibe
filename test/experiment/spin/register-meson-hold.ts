// DOES A LIGHT REGISTER MESON HOLD, AND MOVE? (E-SPN-0162). E-SPN-0160 gave members an 8-component Clifford register
// (Cl+(4)), made the singlet's partner a Clifford partner D, and closed the channel census for a light member (m 0.190126)
// for the first time: B* = 2M, the Dirac value. It did not run a bound pair. This file binds two such members with a
// string, derives which strings keep the pair's dynamics exact on a small space, runs the one that does, and reads
// whether the level holds, moves isotropically, and what its inertia is.
//
// DERIVED BEFORE THE RUN (code/measure/register-meson; per cycle of two beats; c = sqrt 2 per beat; a member's eps
// from the midpoint pi, S at +M, M = 2m; a pair's eps its cycle phase mod 2 pi, S S at rest 2M; the light point u =
// ringUnit(-1, 4), M0 = 0.380251).
// 1. THE MOVING BLOCK IS EXACT FOR ANY FIELD OF ANGLES, BUT NOT FOR E-SPN-0147's MASS STRING. One member's space is W (+)
//    F, W = S + T D (16 states a momentum), F = W^perp, and the cycle U = T G2 T^dag G1 keeps W and is the identity on F
//    for ANY dock-dependent mixer angle (G1 changes only S components, which are dock-local; T G2 T^dag only T D ones).
//    For a pair, E-SPN-0147's mass string gives each member the unit u(V), V the D4 string length between the two
//    members' docks: member 2's piece is then conditioned on member 1's POSITION, and a position projector P_x1 does not
//    keep W1 (T D_y spans the neighbours of y). So under the member mass string the flats couple to the moving block at
//    first order in the string angle, and the pair needs the full 192^2 = 36,864 states a relative site. At a point where
//    every channel is closed (probe 1: angle 0.0936 a unit, cap 5) its NR level has mean string length 3.3 and a quarter
//    of its weight past V = 4, which needs a ball of radius 7 or more: about 10,000 relative sites and 6 GB a state
//    vector. It is not run. A STRING BUILT ONLY FROM THE SECTOR PROJECTORS IS EXACT: a V-dependent phase on Q_S (x) Q_S in
//    beat 1 and on Q_D (x) Q_D in beat 2 maps into S (x) S and T D (x) T D, both inside W (x) W, and is the identity on F
//    (x) anything, so W (x) W is invariant and the flats never couple, at any separation (256 states a relative site). It
//    is the member mass string's action on the S S pair (u^2 e^(i tau V), the same pair phase) with the cross sectors (one
//    member in S, the other not) left at the free unit. THIS FILE RUNS THAT STRING, the singlet-pair string, with the unit
//    rho = ringUnit(-9, 6) (angle tau = 0.280668 a unit of V) and cap 8: the S S pair takes u^2 rho^min(V, 8) in beat 1,
//    the D D pair conj(u)^2 conj(rho)^min(V, 8) in beat 2 (C symmetry), all in Z[w][1/42].
// 2. THE CHANNELS, AT EVERY SEPARATION (the coordinator's point: a crossing can appear only at large V). Inside W (x) W,
//    with Smax the S band's top (g at most 0.3668, E-SPN-0160: Smax = 0.838 at M0):
//      S S at V:   [2 M0 + tau min(V, 8), 2 Smax + tau min(V, 8)]        rises with V, then a plateau from V = 8
//      D D at V:   [-2 Smax - tau min(V, 8), -2 M0 - tau min(V, 8)]      falls with V, then a plateau
//      S D, D S:   within [-(Smax - M0), Smax - M0] = [-0.458, 0.458] at every total K (no string acts on them)
//    and the flat channels, EXACTLY DECOUPLED (point 1), sit at S F = pi + [M0, Smax], D F = [pi - Smax, pi - M0], F F =
//    2 pi, with no V dependence (no string acts on them). A level at E_L with every channel at distance at least delta
//    from it (mod 2 pi) at every V is a true bound state of the infinite mesh. THE CAP IS WHAT CLOSES D D: without it the
//    D D band falls through E_L - 2 pi at V* = (2 pi - E_L - 2 Smax) / tau = 9.4 (an exact crossing at large separation,
//    tunnelled into from the core, long-lived but not exact); with cap 8, tau cap = 2.245 < 2 pi - E_L - 2 Smax = 2.64.
//    A crossing does not come back past the cap: every channel is constant for V >= 8. SO THE CAP IS A FINITE-DEPTH
//    WELL, NOT CONFINEMENT: past V = 8 the S S channel sits at 2 M0 + 8 tau = 3.00 and higher, above E_L, so the level is
//    bound below a plateau and a pair given more than E_L's distance to the plateau would separate. This is the price
//    E-SPN-0161 names: a string that keeps rising (confinement) meets the D D ladder at some V*, and one that stops
//    rising (this) closes every channel and does not confine. E-SPN-0147's member mass string avoids the ladder the same
//    way and for the same reason: its angle is capped below pi/2, so every flipped channel is bounded (its point 4), and
//    it does not confine either. Reading the separation nonlocally is not what saves it: the cap is. The flat channels
//    themselves can never be met here, since W (x) W never couples to them (point 1), which is the register's gain over
//    the slot rule: E-SPN-0161's static color sources are the flats, and under the singlet-pair string they carry no
//    amplitude at any V.
// 3. THE LEVEL (NR 4d s-wave, radialWell, W = tau min(kappa x, 8), constant member inertia 2 tan(M0 / 2) per member):
//    E_b = 1.245, E_L = 2.005, mean V 2.96, P(V > 7) 1.7e-3, P(V > 9) 3.4e-5 (tmp/rmh-probe2.log). The lattice level
//    sits near 1.98 (probes 3 and 5). So the ball is radius 9, reaching past the cap (8), where every channel is
//    constant, to the uncapped V* (9.4) within a step; the H1 scan runs the channels to V = 40 analytically.
// 4. R, AND WHY NOT 1. The string acts on the S S pair as a potential, not a mass: the members' inertia does not change
//    with V. The composite's inertia (energy units) is 2 I + 1.5 T (I = 2 tan(M0/2) a member, T the relative kinetic
//    energy; 1.5 = 1 + 2/d in 4d: a free relativistic pair's P^2 coefficient) against E_L = 2 M0 + T + <W>, so R = (2 I +
//    1.5 T) / E_L = 0.69 at the NR level: BELOW 1, because potential energy carries no inertia here. E-SPN-0147's member
//    mass string is the mirror (the members get heavier with V: R above 1, 1.03 predicted there, 1.568 read with flat
//    admixture). No instantaneous string of either form gives R = 1; in 4d a scalar share of 3/4 would, at NR order,
//    which is a tuning and is not run. A binding with R = 1 needs the field's own transverse exchange (E-SPN-0155's
//    missing (8/3) E_b). PREDICTED R 0.69, gated against 1 +- 0.01: PREDICTED TO FAIL.
// 5. ISOTROPY: V is W(F4)-invariant and the members are, so the K^2 coefficient is the same along every direction.
//
// PREDICTED: H0 holds (the reduction is the rule), H1 holds (margin 0.33, the D F band), H2 holds (the level holds 128
// beats), H3 holds (isotropic), H4 FAILS (R 0.69). Verdict fail on H4, with the hold the first for a light member.
// (The verdict came as predicted and the hold did; R came at 34.65, on the other side of 1: see FIRST RUN.)
//
// GATES, fixed before the gate run.
//  H0 THE WITNESS (the full rule): the full 192 x 192 pair rule on a radius-4 ball (the pieces with the string, the swap
//     coin, the stream, beat by beat) against the coordinate cycle lifted into it, one cycle, at K = 0 and K = (0.31,
//     -0.17, 0.52, 0.08): from an S (x) S start at y = 0 over the whole ball (entries 1e-12, full weight = lifted weight =
//     coordinate norm to 1e-10 relative), and from a generic start (every block, Weyl values) within 2 steps (entries
//     1e-12); the coordinate norm conserved to 1e-12 relative.
//  H1 THE CHANNELS AT EVERY SEPARATION: with the level's read E_L and Smax from g's largest value (a scan), every channel
//     of point 2 at every V = 0 .. 40 at distance at least 0.1 from E_L mod 2 pi (the S S band below the cap is the well,
//     not a channel, and counts only from V = 8); and the uncapped D D crossing V* read.
//  H2 THE HOLD: the level (filter from the start exp(-(V/2.5)^1.5) in S (x) S with the registers paired by delta, the
//     W(F4)-symmetric sector: S 64 at the predicted phase, S 256 and S 1024 at the read phase) with |lambda| >= 1 - 1e-6
//     and residual <= 1e-3; over 64 cycles (128 beats, E-SPN-0155's heavy probe) from it: THE LEAK, the norm's change (the
//     ball's edge drops coordinates, which in the Gram metric can move the norm either way) at most 1e-3 in size; the
//     fidelity |<v | psi_t>|^2 at least 1 - 1e-2 at every cycle (the
//     residual's own dephasing is allowed for: a level held but not isolated keeps its norm and loses fidelity, a leaking
//     one loses both); and no weight at the edge: the profile's last shell (V = 9) at most 1e-6.
//  H3 IT MOVES ISOTROPICALLY: E(K) at K = kappa u and kappa u / 2 (kappa 0.04) along the axis and the generic direction,
//     and E(0), each by a filter S 256 from v at E_L (the base read the same way as the shifts), the K^2 coefficient a by
//     Richardson: the two within 1e-3 (relative). (A true eigenlevel of this W(F4)-symmetric problem is exactly isotropic
//     at K^2, point 5; 1e-3 allows for the residual.)
//  H4 R: R = c*^2 / (2 a E_L), c*^2 = 1/2 a cycle (c* = c/4 a beat), within 0.01 of 1.
// INSTRUMENT (a failure makes the verdict partial). I1 the member coordinates' 16 phases equal E-SPN-0160's derived band
//  (pi +- E(K), 8 each) and the full 192-mode cycle's 16 moving phases at 5 momenta to 1e-12. I2 the member R from the
//  coordinates equals tan m / m to 1e-6 (Richardson at kappa 0.02).
// CONTROLS (a failure makes the verdict partial). C1 THE HOLD CAN FAIL: with no string (tau = 0) the same start and
//  filters at E_L do not hold: the norm lost over 64 cycles above 1e-3, or the fidelity below 1 - 1e-3. C2 THE WITNESS
//  SEES THE STRING'S FORM: the full rule with E-SPN-0147's member mass string (each member u e^(i tau V / 2)) differs
//  from the lifted coordinate cycle by more than 1e-6 after one cycle from the S (x) S start.
// READ, gating nothing: the level's block shares (S S, S D, D S, D D) and profile, the member-mass-string witness gap, the
//  NR prediction beside every reading. (The speed at |K| 0.4 was planned as a read and dropped with the gate plan's
//  change, for time: two more 256 filters.)
// Verdict: fail if H0, H1, H2, H3 or H4 fails; partial if the instrument or a control fails; pass if all hold.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/rmh-probe1.log: the ring's small angles (0.0060,
//  0.0875, 0.0936, 0.0996, 0.1871, 0.1931, 0.2807), the member mass string's channel map and NR levels (clean only at
//  angle 0.094 to 0.100 with cap 5 or 6, mean V 3.1 to 3.3; at 0.187 the D F band sweeps through E_L between V 2.8 and
//  4.0). tmp/rmh-probe2.log: the member coordinates against the derived band (8.9e-16) and the full cycle (1.8e-15), the
//  member R (1.0122261 against tan m/m 1.0122261), the singlet-pair string's NR table (point 3's numbers), the engine
//  (radius 8, 21,025 sites, 2.0 s a cycle). tmp/rmh-probe3-witness.log: a first witness that compared beyond the region
//  where a truncated full ball is exact (gap 2.3e-5, the coordinates reaching 4 steps in a cycle past a radius-3
//  coordinate ball); tmp/rmh-probe4.log: the witness where it is exact, all four comparisons at 4.6e-17 to 9.7e-17.
//  tmp/rmh-probe3-level.log: the level on a radius-8 ball from register (0, 0): phase 1.9703, 1.9292, 1.9198 after
//  filters 64, 128, 128, residual 2.5e-2, 16 cycles lost 1.1e-9 (no leak) with fidelity 0.860 (not isolated).
//  tmp/rmh-probe5.log: from the symmetric start on a radius-9 ball: phase 1.97090, 1.97228, 1.97947 after 64, 256, 256,
//  residual 9.6e-3, shares 0.905 / 0.047 / 0.047 / 0.002, profile peaked at V 4 (0.78), 3.1e-7 at V 9; 16 cycles lost
//  -2e-10, fidelity 0.978. These fixed the gate plan above (radius 9, a 1024 filter, residual 1e-3, the fidelity 1e-2
//  against a separate leak gate, isotropy 1e-3 on two directions with the base read like the shifts), before the gate
//  run. tmp/rmh-hold-smoke.log: every code path on a small plan (radius 5, filters 16 and 16, 219 s; unconverged, gating
//  nothing): H0 exact (4.6e-17 to 9.7e-17), I1 1.8e-15, I2, C1 and C2 (the member mass string off the lifted cycle by
//  7.7e-4) held. It found two defects in the gates as first written, fixed before the gate run: H1 counted the S S band
//  inside the core (above the level at V 4, where it is the forbidden side of the well) as a channel; and the leak read
//  "lost <= 1e-3", where the edge's drops in the Gram metric read -6.8e-6 (a gain) at radius 5's 3% edge shell, so the
//  gate reads the change's size.
//
// FIRST RUN (tmp/rmh-hold-run1.log, 8,140 s): FAIL on H4 alone, as predicted, but with R far on the OTHER side of 1
//  (34.65 against the predicted 0.69). H0 to H3, the instrument and both controls hold. No gate moved and none was rerun.
//  - H0: the full 192 x 192 rule and the lifted coordinate cycle agree to 4.6e-17 (S S, whole ball) and 9.7e-17
//    (generic, within 2) at both momenta; weights equal to 12 digits; the coordinate norm kept to 4e-14.
//  - H1: least margin 0.325, the D F band at V 0 (E_L 1.979 against pi - Smax = 2.304); Smax 0.8378; the uncapped D D
//    crossing would sit at V* 9.37, past the cap, so the cap is what closes it (point 2).
//  - H2: E_L 1.978945 (NR 2.0054, 1.3% low), |lambda| 1 + 6e-12, residual 8.1e-7; over 64 cycles (128 beats) the norm
//    changed by -8.0e-10 and the fidelity never fell below 1 - 4.0e-10; the edge shell (V 9) 2.0e-7. THE FIRST LIGHT
//    COMPOSITE THAT HOLDS ON THIS PROGRAM'S RULES: members at m 0.190126, where every slot-rule binding leaked. Shares:
//    S S 0.917, S D and D S 0.041 each, D D 0.001; profile by V 0 .. 9: 1.2e-4 3.0e-3 1.7e-2 8.6e-2 8.4e-1 5.0e-2 3.0e-3
//    1.2e-4 5.4e-6 2.0e-7 (the shells grow as V^3, so the peak at V 4 is the shell count times a smooth s-wave).
//  - H3: a 0.0036456469 (axis) and 0.0036456488 (generic), isotropic to 5.0e-7.
//  - H4 FAILS: R = c*^2 / (2 a E_L) = 34.65. The free pair's edge has a = a_member / 2 = 0.329 a cycle (R 1.012), so the
//    bound pair's centre moves 90 times less readily than two free members. A READING AFTER THE RUN, not a derivation:
//    the NR model (point 3) takes the centre's inertia to be the members' sum, which holds in the continuum; here the
//    string's step per unit of V (0.281 a cycle) is comparable to the member's band width (Smax - M0 = 0.458), the
//    strong-coupling lattice regime, where a bound pair's centre moves only in higher order (each member's hop to its
//    partner D leaves the S S well for the S D sector near eps 0, 2 away, with no string there), as a tightly bound
//    pair on a lattice does (hopping t^2 / U). The binding and the spatial profile follow the NR model (E_L within 1.3%);
//    the inertia does not. So the same obstruction holds from the other side: potential energy does not become inertia,
//    and here the string's lattice form adds inertia the continuum would not have. A string weak against the band
//    width (tau << 0.46 a unit, mean V ~ 1 / tau) is where the NR R (below 1) should appear, on boxes far larger than
//    radius 9.
//  - I1 1.8e-15; I2 member R 1.012226137 against tan m / m 1.012226057.
//  - C1: with no string the same filters give a state whose fidelity falls to 0.596 in 64 cycles (norm kept to 1.2e-7:
//    in 64 cycles the free pair has not reached the edge), so the witness sees an unbound pair. C2: E-SPN-0147's member
//    mass string moves the lifted cycle off the coordinates by 7.7e-4 in one cycle: it does not keep W (x) W, as point 1
//    derived, and its flats would couple.
// NEXT. (1) A string weak against the band width on a larger box (radius 20 or more: the engine is linear in sites,
//  2.9 s a cycle at radius 9), to see R cross from 35 toward the continuum's value. (2) Neither R = 35 nor the NR 0.69
//  is 1: a binding with inertia equal to energy needs a field that carries its own momentum (E-SPN-0155's transverse
//  exchange), which on the register rule is the next piece to build. (3) Confinement: a string that keeps rising meets
//  the D D ladder at V* (9.4 here), E-SPN-0161's point, so a confined light register meson is long-lived, not exact,
//  unless something lifts the D D sector's slope.
//
// Depth L2 (a two-body quantum walk of register members on the D4 mesh, in the exact coordinates of its invariant block,
// witnessed against the full rule). DETERMINISM: no random numbers; the start is placed, every level filtered, Weyl
// values for the generic witness start. NOTHING MOVES: the pieces hand values between slots and register components of
// one dock, the stream takes each slot's value one dock along, the string sets a phase on the pair's singlet sector.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { wrap } from '@/code/measure/dock-mixer'
import { cyclePhases } from '@/code/measure/swap-cone'
import { ringUnit, unitAngle, radialWell, stringKappa } from '@/code/measure/swap-string'
import { diracPhase, partnerProjector48, REGISTER_ROOTS, registerPiece, scaled, singletProjector24, structureVector, weylDirections } from '@/code/measure/spinor-register'
import {
  blockShares,
  clonePair,
  filterPair,
  fullBeat,
  fullGap,
  fullRule,
  inner,
  lift,
  memberCycle,
  newPair,
  normalizePair,
  norm2,
  pairCycle,
  pairEngine,
  profile,
  readLevel,
  relBall,
  sStart,
  type PairParams,
  type PairState,
} from '@/code/measure/register-meson'

const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GENERIC_RAW = [0.29, 0.52, 0.8, 0]
const GENERIC = GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW))
const DIRS: readonly number[][] = [[1, 0, 0, 0], GENERIC]

void s2
void s3
const WITNESS_K: readonly number[][] = [
  [0, 0, 0, 0],
  [0.31, -0.17, 0.52, 0.08],
]
const LIGHT: readonly [number, number] = [-1, 4]
const STRING: readonly [number, number] = [-9, 6]
const CAP = 8
const C_STAR2 = 0.5
const ENTRY = 1e-12
const WEIGHT = 1e-10
const NORM = 1e-12
const MARGIN = 0.1
const LAMBDA = 1e-6
const RESIDUAL = 1e-3
const LOST = 1e-3
const FIDELITY = 1e-2
const EDGE = 1e-6
const KAPPA = 0.04
const ISOTROPY = 1e-3
const R_TOLERANCE = 0.01
const MEMBER_GAP = 1e-6
const I1_TOLERANCE = 1e-12
const I2_TOLERANCE = 1e-6
const HOLD_CYCLES = 64
const V_SCAN = 40
const ELL = 2.5

export type HoldPlan = { radius: number; witness: boolean; filters: readonly number[]; kFilter: number; hold: number; gScan: number }

export const GATE_PLAN: HoldPlan = { radius: 9, witness: true, filters: [64, 256, 1024], kFilter: 256, hold: HOLD_CYCLES, gScan: 2000 }

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'spin/register-meson-hold',
  code: 'E-SPN-0162',
  title:
    'a light register meson holds exactly but is 35 times too heavy, fail (H4): two members at m 0.190126 carrying the Cl+(4) register, bound by a string on the pair\'s singlet sector alone (u^2 rho^min(V, 8) on S S, its conjugate on D D), evolve exactly inside the 16 x 16 moving block (witnessed against the full 192 x 192 rule to 1e-16, where E-SPN-0147\'s member mass string is off by 7.7e-4 and couples the flats); every channel is closed at every separation, the cap closing the D D ladder that an uncapped string would meet at V 9.4, so the pair is bound in a finite well and not confined; the level at eps 1.978945 (NR 2.005) holds 128 beats with the norm kept to 8e-10 and fidelity 1 - 4e-10, isotropic to 5e-7, but R = 34.65 (NR 0.69): in this strong-coupling lattice regime the bound pair\'s centre moves 90 times less readily than two free members',

  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return registerMesonHoldRun(GATE_PLAN)
  },
})

const unitValue = (angle: number): [number, number] => [Math.cos(angle), Math.sin(angle)]

// the weyl-sequence generic start at y = 0 (every block, or S (x) S only)
function witnessStart(ballIndex: Map<string, number>, s: PairState, only: number): void {
  const at = ballIndex.get('0,0,0,0') as number
  let w = 0.5

  for (let k = 0; k < only; k++) {
    w = (w + 0.6180339887498949) % 1
    s.re[at * 256 + k] = w - 0.5
    w = (w + 0.4142135623730951) % 1
    s.im[at * 256 + k] = w - 0.5
  }
}

export function registerMesonHoldRun(plan: HoldPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const theta = unitAngle(ringUnit(LIGHT[0], LIGHT[1]))
  const u = unitValue(theta)
  const M0 = wrap(theta - Math.PI)
  const tau = unitAngle(ringUnit(STRING[0], STRING[1]))

  // ---------------- I1, I2: the member coordinates ----------------
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]
  const phasesOf = (K: readonly number[], w: [number, number] = u): number[] => {
    const m = memberCycle(w, K)
    const e = complexEigenvalues({ re: m.re, im: m.im, n: 16 })

    return e.re.map((x, i) => Math.atan2(e.im[i] as number, x)).sort((a, b) => a - b)
  }
  let i1 = 0

  for (const K of [[0, 0, 0, 0], [0.3, 0.1, -0.2, 0.05], [1.1, -0.7, 0.4, 0.9], [2.5, 0.3, 0.3, -1.2], [0.01, 0, 0, 0]]) {
    const ph = phasesOf(K)
    const E = diracPhase(K, M0)
    const want = [...Array(8).fill(wrap(Math.PI + E)), ...Array(8).fill(wrap(Math.PI - E))].sort((a, b) => a - b)
    const full = cyclePhases(Ps, REGISTER_ROOTS, K)
      .filter(x => Math.abs(wrap(x)) > 1e-7)
      .sort((a, b) => a - b)

    i1 = Math.max(i1, ...ph.map((x, i) => Math.abs(wrap(x - (want[i] as number)))), full.length === 16 ? Math.max(...full.map((x, i) => Math.abs(wrap(x - (ph[i] as number))))) : 99)
  }

  const sEps = (k: number): number => phasesOf([k, 0, 0, 0]).map(x => wrap(x - Math.PI)).reduce((b, x) => (Math.abs(x - M0) < Math.abs(b - M0) ? x : b))
  const aMember = (4 * ((sEps(0.01) - M0) / 0.01 ** 2) - (sEps(0.02) - M0) / 0.02 ** 2) / 3
  const RMember = C_STAR2 / (2 * aMember * M0)
  const tanOver = Math.tan(M0 / 2) / (M0 / 2)
  const I1 = i1 <= I1_TOLERANCE
  const I2 = Math.abs(RMember - tanOver) <= I2_TOLERANCE

  log('I1 I2')

  // ---------------- H0, C2: the witness ----------------
  const witness: { K: number[]; kind: string; gap: number; weights: number[]; norms: number[] }[] = []
  let memberGap = 0

  if (plan.witness) {
    const coord = relBall(6)
    const full = relBall(4)

    for (const K of WITNESS_K) {
      for (const kind of ['SS', 'generic'] as const) {
        const params: PairParams = { u, tau, cap: CAP, K }
        const e = pairEngine(coord, params)
        const s = newPair(coord)

        witnessStart(coord.index, s, kind === 'SS' ? 64 : 256)

        const n0 = norm2(e, s)
        const before = lift(coord, s, full, K)
        const memberBefore = kind === 'SS' && K === WITNESS_K[0] ? lift(coord, s, full, K) : null

        pairCycle(e, s)

        const n1 = norm2(e, s)
        const want = lift(coord, s, full, K)
        const rule = fullRule(full, params)
        const two = fullBeat(rule, fullBeat(rule, before, 1), 2)
        const g = fullGap(full, two, want, kind === 'SS' ? Infinity : 2)

        witness.push({ K: [...K], kind, gap: g.worst, weights: [g.weightA, g.weightB], norms: [n0, n1] })
        if (memberBefore) {
          const memberRule = fullRule(full, { ...params, member: true })
          const m2 = fullBeat(memberRule, fullBeat(memberRule, memberBefore, 1), 2)

          memberGap = fullGap(full, m2, want).worst
        }
        log(`witness ${kind} ${K.join(',')}`)
      }
    }
  }

  const H0 =
    plan.witness &&
    witness.every(w => w.gap <= ENTRY && Math.abs((w.norms[1] as number) / (w.norms[0] as number) - 1) <= NORM) &&
    witness.filter(w => w.kind === 'SS').every(w => Math.abs((w.weights[0] as number) / (w.weights[1] as number) - 1) <= WEIGHT && Math.abs((w.weights[1] as number) / (w.norms[1] as number) - 1) <= WEIGHT)
  const C2 = plan.witness && memberGap > MEMBER_GAP

  // ---------------- the NR prediction ----------------
  const kappa = stringKappa(12).mean
  const Imember = 2 * Math.tan(M0 / 2)
  const nr = radialWell(
    x => tau * Math.min(kappa * x, CAP),
    () => Imember,
    30,
    12000,
  )
  let nrW = 0

  for (let i = 0; i < nr.u.length; i++) nrW += (nr.u[i] as number) ** 2 * tau * Math.min(kappa * (i + 1) * nr.h, CAP)

  const nrT = nr.E - nrW
  const nrEL = 2 * M0 + nr.E
  const nrR = (2 * Imember + 1.5 * nrT) / nrEL

  // ---------------- H2: the level and the hold ----------------
  const ball = relBall(plan.radius)
  const params0: PairParams = { u, tau, cap: CAP, K: [0, 0, 0, 0] }
  const e0 = pairEngine(ball, params0)
  const start = sStart(ball, ELL)

  normalizePair(e0, start)

  const buildLevel = (e: typeof e0, from: PairState, guess: number, filters: readonly number[]): { v: PairState; read: ReturnType<typeof readLevel> } => {
    let v = from
    let phase = guess
    let read = readLevel(e, from)

    for (const S of filters) {
      v = filterPair(e, v, phase, S)
      normalizePair(e, v)
      read = readLevel(e, v)
      phase = read.phase
    }

    return { v, read }
  }
  const level = buildLevel(e0, start, nrEL, plan.filters)
  const EL = level.read.phase
  const lambdaAbs = Math.hypot(...level.read.lambda)

  log(`level ${EL}`)

  const hold = (e: typeof e0, v: PairState): { lost: number; least: number } => {
    const s = clonePair(v)
    const n0 = norm2(e, v)
    let least = 1

    for (let c = 1; c <= plan.hold; c++) {
      pairCycle(e, s)

      const [fr, fi] = inner(e, v, s)

      least = Math.min(least, (fr * fr + fi * fi) / (n0 * n0))
    }

    return { lost: 1 - norm2(e, s) / n0, least }
  }
  const held = hold(e0, level.v)
  const prof = profile(e0, level.v)
  const profTotal = prof.reduce((a, b) => a + b, 0)
  const edge = (prof[plan.radius] as number) / profTotal
  const shares = blockShares(e0, level.v)
  const H2 = lambdaAbs >= 1 - LAMBDA && level.read.residual <= RESIDUAL && Math.abs(held.lost) <= LOST && held.least >= 1 - FIDELITY && edge <= EDGE

  log('H2')

  // ---------------- H1: the channels at every separation ----------------
  let gMax = 0

  for (const w of weylDirections(plan.gScan)) for (let k = 0.05; k < 3.2; k += 0.05) gMax = Math.max(gMax, Math.hypot(...structureVector(w.map(x => x * k))) / 2)

  const Smax = Math.acos(Math.cos(M0) - 2 * Math.cos(M0 / 2) ** 2 * gMax * gMax)
  const distance = (lo: number, hi: number): number => {
    // the distance of E_L from the band [lo, hi] mod 2 pi (0 if inside)
    let best = Infinity

    for (const shift of [-2 * Math.PI, 0, 2 * Math.PI]) {
      const x = EL + shift

      best = Math.min(best, x < lo ? lo - x : x > hi ? x - hi : 0)
    }

    return best
  }
  let margin = Infinity
  let marginAt = ''

  for (let V = 0; V <= V_SCAN; V++) {
    const w = tau * Math.min(V, CAP)
    const bands: [string, number, number][] = [
      ['SS', 2 * M0 + w, 2 * Smax + w],
      ['DD', -2 * Smax - w, -2 * M0 - w],
      ['SD', -(Smax - M0), Smax - M0],
      ['SF', Math.PI + M0, Math.PI + Smax],
      ['DF', Math.PI - Smax, Math.PI - M0],
      ['FF', 2 * Math.PI, 2 * Math.PI],
    ]

    for (const [name, lo, hi] of bands) {
      // below the cap the S S band is the well itself (allowed in the core, forbidden past the turning point), not a
      // channel to infinity; it is one only where it stays for good, at V at or past the cap
      if (name === 'SS' && V < CAP) continue

      const d = distance(lo, hi)

      if (d < margin) {
        margin = d
        marginAt = `${name} at V ${V}`
      }
    }
  }

  const vStar = (2 * Math.PI - EL - 2 * Smax) / tau
  const H1 = margin >= MARGIN

  log('H1')

  // ---------------- H3, H4: it moves ----------------
  const eAt = (K: number[]): number => {
    const e = pairEngine(ball, { ...params0, K })
    const v = filterPair(e, level.v, EL, plan.kFilter)

    normalizePair(e, v)

    return readLevel(e, v).phase
  }
  const base = eAt([0, 0, 0, 0])
  const coefficients = DIRS.map(d => {
    const e1 = eAt(d.map(x => x * KAPPA))
    const e2 = eAt(d.map(x => (x * KAPPA) / 2))
    const a1 = (e1 - base) / KAPPA ** 2
    const a2 = (e2 - base) / (KAPPA / 2) ** 2

    return (4 * a2 - a1) / 3
  })
  const a0 = coefficients[0] as number
  const isotropy = Math.max(...coefficients.map(a => Math.abs(a / a0 - 1)))
  const R = C_STAR2 / (2 * a0 * base)
  const H3 = isotropy <= ISOTROPY
  const H4 = Math.abs(R - 1) <= R_TOLERANCE
  const vAt = NaN

  log('H3 H4')

  // ---------------- C1: no string ----------------
  const eFree = pairEngine(ball, { ...params0, tau: 0 })
  const free = buildLevel(eFree, start, EL, [plan.filters[0] as number])
  const heldFree = hold(eFree, free.v)
  const C1 = Math.abs(heldFree.lost) > LOST || heldFree.least < 1 - FIDELITY

  log('C1')

  const instrument = I1 && I2
  const controls = C1 && C2
  const hard = H0 && H1 && H2 && H3 && H4
  const status = !(H0 && H1 && H2 && H3 && H4) ? 'fail' : !instrument || !controls ? 'partial' : 'pass'

  void hard

  return verdict({
    status,
    claim: `H0 ${H0} (${witness.map(w => `${w.kind} K ${w.K.join(',')}: gap ${w.gap.toExponential(2)}, weights ${w.weights.map(x => x.toFixed(12)).join('/')}, norm ${w.norms.map(x => x.toFixed(12)).join(' -> ')}`).join('; ')}); H1 ${H1} (least margin ${margin.toFixed(4)} at ${marginAt}; Smax ${Smax.toFixed(6)}; uncapped D D crossing V* ${vStar.toFixed(3)}); H2 ${H2} (E_L ${EL.toFixed(6)} (NR ${nrEL.toFixed(4)}), |lambda| ${lambdaAbs.toFixed(10)}, residual ${level.read.residual.toExponential(2)}, lost ${held.lost.toExponential(2)} over ${plan.hold} cycles, least fidelity ${held.least.toFixed(10)}, edge shell ${edge.toExponential(2)}); H3 ${H3} (a ${coefficients.map(a => a.toFixed(10)).join(' ')}, isotropy ${isotropy.toExponential(2)}); H4 ${H4} (R ${R.toFixed(6)}, NR ${nrR.toFixed(4)}); instrument I1 ${I1} (${i1.toExponential(2)}) I2 ${I2} (member R ${RMember.toFixed(9)} vs ${tanOver.toFixed(9)}); controls C1 ${C1} (no string: lost ${heldFree.lost.toExponential(2)}, least fidelity ${heldFree.least.toFixed(6)}) C2 ${C2} (member mass string gap ${memberGap.toExponential(2)})`,
    metrics: {
      H0: flag(H0),
      H1: flag(H1),
      H2: flag(H2),
      H3: flag(H3),
      H4: flag(H4),
      I1: flag(I1),
      I2: flag(I2),
      C1: flag(C1),
      C2: flag(C2),
      EL,
      lambdaAbs,
      residual: level.read.residual,
      lost: held.lost,
      leastFidelity: held.least,
      edge,
      margin,
      vStar,
      isotropy,
      R,
      nrR,
      nrEL,
      speedAt04: vAt,
      memberGap,
      shareSS: shares[0] as number,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2), instrument: flag(instrument) },
    notes: `L2. Light m ${(M0 / 2).toFixed(6)} (M0 ${M0.toFixed(6)}), string angle ${tau.toFixed(6)} a unit of V, cap ${CAP}, ball ${plan.radius} (${ball.points.length} sites). Level: block shares S S ${shares.map(x => x.toFixed(4)).join(' ')} (S S, S D, D S, D D), profile ${prof.map(x => (x / profTotal).toExponential(1)).join(' ')}. NR: E_b ${nr.E.toFixed(4)}, T ${nrT.toFixed(4)}, W ${nrW.toFixed(4)}. Speed at |K| 0.4 (axis, a beat) ${vAt.toFixed(6)} (c/4 = ${(Math.SQRT2 / 4).toFixed(6)}). g max ${gMax.toFixed(6)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
