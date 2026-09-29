// THE SMALLEST STRING ON THE SWAP-COIN RULE: DOES A COMPOSITE BIND, STAY ONE PARTICLE, AND MOVE AT UP TO c* WITH
// INERTIA E / c*^2? (E-SPN-0146). E-SPN-0145 (swap-many-body) read the swap coin (zeta = -1) and the fermionic 24-slot dock
// mixer as a rule: one limiting speed c* = c/2 for every excitation, gamma = 0, a light isotropic relativistic singlet (R =
// tan(m)/m), an inert sea. What it lacked: nothing binds, because flat links carry no string, so separation costs
// nothing. This file adds the smallest string, a phase per unit of separation read route-free (E-SPN-0131), and asks
// whether a composite then binds, stays one particle, and moves isotropically at up to c* with inertia E_rest / c*^2.
//
// DERIVED BEFORE THE RUN (the machinery: code/measure/swap-string, code/measure/meson-pool).
// 1. WHICH COMPOSITE THE CHARGE REGISTER AND GAUSS ALLOW. The string is Z3 (the drift cost's register mod 3, E-GRV-0127):
//    it ends only on charge, and a closed composite has total charge 0 mod 3.
//    - ON THE LOVE SEA a hole is -1. Its conjugate would be +1, and the only candidate is a fear (-2 = +1 mod 3), which
//      the 'none' veto unmakes at its first collision into a store and two holes (E-SPN-0132 B0, E-SPN-0145 X3b): the sea
//      holds no +1 that lives. TWO HOLES are -2 = +1 mod 3: a Gauss string leaving them has no second end, so a two-hole
//      state is not a closed composite (it is a diquark whose string runs to a third charge). THREE HOLES are 0 mod 3:
//      the Y (Steiner) string, the love sea's smallest composite, a three-body problem in 4d: 13,824 slot triples per
//      pair of relative positions, 1,681^2 pairs within 4 root steps each (3.9e10 amplitudes), against the two-body
//      window below (231,361 x 576 = 1.3e8). Not computable here.
//    - ACROSS THE SEA CHOICE the hole's conjugate is a hole in the fear sea (+1). The two live in two vacua and meet only
//      across a wall: not a local composite.
//    - THE PARTICLE-HOLE IMAGE. A hole on the love sea is a love on the EMPTY mesh exactly (E-SPN-0145 X5a: equal Born
//      weight at every slot and beat). Its C-conjugate there is a fear, and on the empty mesh a fear is a free particle:
//      no sea love shares its line, so nothing unmakes it, and the mixer and the coin read held-or-not, never the value,
//      so its dock matrix IS the love's (checked, I1). So the smallest Z3-neutral composite with the swap coin's one-body
//      kinematics is the LOVE-FEAR MESON ON THE EMPTY MESH: two-body, Gauss-legal, each member the hole's exact image
//      (rest energy m, R = tan(m)/m, c*, 22 flat bands). That is the composite run here.
// 2. THE CONTACT (code/measure/swap-string contactDockExact, read off the rule's pieces). At one dock the mixer leaves a
//    dock of two contents alone, the coin swaps each lone vibe (a love and a fear on one line take det X = -1), and the
//    collision with no veto stores a love and a fear on one line; the store is released at the next collision and the
//    two stream apart. The map is a signed permutation of the 576 contact states (552 slot pairs, 24 stores), and it
//    alternates with the beat's parity (the collision's order), so the beat's period is TWO beats and a level is an
//    eigenvector of U2 = U(1) U(0), its phase per beat half of U2's (code/measure/swap-string readLevel).
// 3. THE STRING. V(y) = d4Steps(x_love - x_fear), the fewest links joining the two docks in the whole mesh (any of the 24
//    roots a link), a store V = 0; a phase e^(-i s V) a beat. It is route-free, so NOT local (E-SPN-0131 point 4): it is
//    read from both charges at once, a stated separation cost, not a register. EXACT IN THE RING: s = sign sigma with
//    e^(-i sigma) the norm-one element w^4 ((3 + w)/(3 + w^2))^3 = (numerator over 343) of Z[w][1/42] (sigma = 0.093556,
//    the angle of E-SPN-0143's k = 3 unit), so a box branch is multiplied by num^V 343^(Vmax - V) with one global scale.
//    It is DIAGONAL, so it moves nothing: the support front is the stream's, one root a beat, and the one-beat
//    displacement U^dag x U - x is the stringless rule's exactly. Its SIGN makes it a cost: the singlet's quasi-energy
//    eps = sign (-(phase - mid)) grows with |K| (code/measure/singlet-kinematics), and e^(-i s V) moves eps by sign s V,
//    so s = sign sigma raises eps with V (confines); the other sign is a hill (C1). A composite has no energy sign of its
//    own, so this is a choice the derivation makes, and C1 shows it matters.
// 4. THE MEMBERS AT m = pi/6. The mixer angle u = w^2 (theta = 4 pi / 3): Z[w][1/6] needs no 1/7 for the mixer (E-SPN-
//    0143 C3's in-ring point). m = pi/6, R_walk = tan(m)/m = 1.102658, inertia tan(m)/c*^2 (c*^2 = 1/2, coordinate units),
//    the singlet at phase -2 pi/3 and its partner (the Dirac lower branch and 11 flat bands) at pi. The light points of
//    E-SPN-0143 (m 0.190 at k = 1, 0.143 at k = 2, 0.047 at k = 3) are out of reach: see 6.
// 5. THE HOLDING REGION, the Schwinger / Klein reading of E-SPN-0113. Non-relativistically the pair's relative motion has
//    mu = tan m and the force F = sigma kappa, kappa = 0.8933 the string length per unit distance averaged over the
//    3-sphere (0.7071 along a root, 1 along an axis; code/measure/swap-string stringKappa), so the scale is l = (2 mu
//    F)^(-1/3) and the 4d s-wave's lowest level is E_b = eps4 F l, eps4 = 2.872097 (the 4d linear well, linearWell; its
//    3d form returns the Airy zero 2.338107). The Klein channel (one member flipped to its partner branch, the string
//    paying the gap) leaks exp(-pi m^2 / (c* sigma)) a passage at the steepest (kappa = 1). HOLD iff pi m^2 / (c* sigma) >=
//    ln(1 / 1e-3), i.e. sigma <= 0.643 m^2, AND the window holds the tail. At (pi/6, 0.093556): l = 2.18 (coordinate),
//    E_b = 0.523, E_rest = 2m + E_b = 1.5705, Schwinger exponent 13.0 (leak 2.2e-6): PREDICTED TO HOLD, at the phase
//    2 mid + (-sign) eps = 2.6180. The tail: the 4d well's turning point is at x = eps4 (V = 5.6) and past it the weight
//    falls faster than exponentially (WKB exp(-(4/3)((V - 5.6) / 1.95)^(3/2))). Read on the probes' levels (below): the
//    weight at V = 7, 8, 9 is 4.3e-2, 1.7e-2, 5.0e-3 on a 10-ball, and the edge absorbs about the edge shell's weight
//    every two beats (1.7e-2 a two-beat on an 8-ball, 1.75e-3 on a 10-ball). Continued with the falling ratio (0.40,
//    0.29, then 0.28, 0.24, 0.2, 0.16), the shell at 15 holds ~1e-6, so over 128 two-beats a 15-ball absorbs ~1e-4 and
//    the window V <= 14 misses ~1e-4: the ball is 15, the window 14 (a 14-ball's ~5e-4 is too near the 1e-3 gate). At
//    (0.190, 0.0936) the exponent is 1.7 (leak 0.18): no hold; at (0.190, 0.006, k = 11) it holds but l = 7.8 and the
//    window is about 25 root steps (a 25-ball holds ~1.8e6 sites x 576). So the holding region the ring and a 15-ball
//    can reach is m >= ~0.3 at sigma = 0.094; pi/6 is the point.
// 6. THE COMPOSITE'S R. To second order in the members' internal momentum a potential model gives 1/M = (c*^2/2m)(1 -
//    (3/4) T/m) (the 4d-averaged Hessian of sqrt(m^2 + c*^2 k^2)) and E_rest = 2m + 3T (the virial theorem for a linear
//    potential, <V> = 2 T), so with the lattice's tan(m): R ~ (2 tan m + 1.5 T) / (2m + 3T), T = E_b / 3. At the point:
//    PREDICTED R = 0.90 (the static string carries energy and no inertia, so R falls below the walk's 1.10). The trend:
//    T/m ~ (sigma / m^2)^(2/3), so on the Schwinger boundary sigma ~ m^2 the binding factor stays near 0.8 while R_walk ->
//    1, and R -> 1 only on a joint path with sigma / m^2 -> 0 and m -> 0 (for example sigma ~ m^3, T/m ~ m^(2/3)), where
//    l ~ (m sigma)^(-1/3) = m^(-4/3) grows past any window run here. Read, not gated: R at sigma = 0.18711 (k = 6),
//    predicted 0.836, to see the dependence on sigma.
// 7. ISOTROPY is symmetry. A nondegenerate level of a W(F4)-covariant beat at K = 0 has a W(F4)-invariant inverse-mass
//    tensor, a scalar (W(F4) acts irreducibly on R^4), and W(F4) has no quartic invariant but (K^2)^2, so the first
//    anisotropy is K^6. The four directions test the instrument and the covariance of the contact and string.
// 8. THE SPEED. By Hellmann-Feynman a level's group velocity is the weight mean of the center-of-mass step (r_l + r_f)/2
//    over its two beats, a point of the 24-cell (at most c); the members' own bands are under c* (E-SPN-0143 U1).
//    PREDICTED: the composite's band stays under c* at every K read. With R < 1 its small-K slope c*/sqrt(R) exceeds c*,
//    so its band must bend below the relativistic form before it can reach c*: a non-Lorentzian composite. THE WEIGHT
//    FRONT: a packet of one band spreads with x/t distributed on the band's group velocities (as E-SPN-0145 X1b read for
//    one hole), so the composite's weight front is its top group speed; the relative coordinate cannot hold a packet's
//    center, so the front is read as that speed at the sampled K (a sample, not a supremum).
// 9. THE VACUUM (Y4). The string reads the charges and the vacuum holds none: its factor is 1 on every vacuum branch,
//    and the vacuum runs as the rule's own (E-SPN-0145 X2): one branch, S^cells (empty mesh) or F^cells (love sea).
//
// PREDICTED: Y1 holds, Y3, Y4 and Y5 hold, Y2 FAILS on R (about 0.90, isotropic to far under 1e-6). Verdict fail on Y2.
//
// GATES, fixed before the gate run. The point: m = pi/6 (u = w^2), sigma = 0.093556 (w^4 ((3 + w)/(3 + w^2))^3) with the
// cost's sign, the ball of string length 15 (231,361 sites x 576 slot pairs), the window V <= 14.
//  Y1 THE LEVEL HOLDS. From the start (both members in their dock's singlet mode, weight exp(-(V/2.5)^1.5)) the filter
//     (Blackman-Harris over S two-beats at the predicted phase: S 256, then S 128 at the read phase) gives the level v.
//     Over 256 beats from v: the weight within the window >= 1 - 1e-3 at every beat, AND the fidelity |<v|psi_t>|^2 >= 1 -
//     1e-3 at every even beat (a beating superposition of two levels of weights p, 1 - p dips to (1 - 2p)^2, so this
//     catches p > 2.5e-4: an eigenlevel, not a superposition).
//  Y2 IT MOVES. E(K) of the level (eps of its phase) at K = kappa u and kappa u / 2, kappa 0.04, along the axis, the face,
//     the body and the generic direction (each by the filter S 64 from the K = 0 level at its phase), the K^2 coefficient
//     by Richardson; isotropic: every direction's within 1e-6 of the axis's (relative); and R = c*^2 / (2 a E_rest) within
//     0.01 of 1 (E_rest = eps(0)).
//  Y3 NO PART EXCEEDS c*. The band followed along the axis and the face to |K| 0.4, 0.8, 1.2 (filter S 64 from the
//     previous point at the extrapolated phase): at every point followed (|lambda2| >= 0.99, residual <= 1e-2) the
//     Hellmann-Feynman speed is at most c* (1 + 1e-6); a point not followed is reported and gates nothing; the first
//     (0.4) must be followed on both directions.
//  Y4 THE VACUUM IS INERT WITH THE STRING ON. The exact rule on the empty box (sides 4 and 8) and the love sea box (side
//     4), 128 beats: every branch holds no charge (the string's factor 1), one branch equal to the vacuum with amplitude
//     S^cells (F^cells) exactly each beat, and the collision's K moves no value on any dock of any beat (a formal
//     permutation of equal values, which the bounce table returns on empty and full docks, changes nothing).
//  Y5 CONTROL, NO STRING, NO BINDING (E-SPN-0145 X4). With sigma = 0, the Y1 procedure at the predicted phase and at the
//     free pair's threshold (eps = 2m) gives no level that holds by Y1's witness.
// INSTRUMENT (a failure makes the verdict partial). I1 the rule's one-vibe matrix on the empty dock equals dockMatrix(4 pi
//  / 3, 2/3, love) to 1e-12, love = fear, both parities alike, shape X (I + beta 1 1^T) to 1e-12, the empty dock's factor
//  S alone, and m, R_walk equal pi/6 and tan(pi/6)/(pi/6) to 1e-9. I2 the contact map is closed and unitary on the 576
//  live states to 1e-12. I3 one beat of the rule (swapMixedBeat) on the side-4 empty box from every contact state and every
//  slot pair one root apart, both parities, equals the meson beat entry for entry to 1e-12, every integer division
//  exact, no stray branch. I4 the threaded beat equals the one-thread beat on a 5-ball at K = (0.3, -0.1, 0.2, 0.05) with
//  the string for 4 beats: entries to 1e-13, absorbed and flow to 1e-12. I5 the string's unit has norm one exactly;
//  linearWell's 3d form is the Airy zero to 1e-5. I6 Hellmann-Feynman against the phase's central difference (K 0.4 +-
//  0.02 along the axis) to 1e-3.
// CONTROLS (a failure makes the verdict partial). C1 the witness can fail with a string on: the hill sign gives no level
//  that holds at the predicted phase. C2 the witness sees a beat: v mixed with 2e-3 of the start's remainder fails the
//  fidelity clause.
// Verdict: partial if the instrument or a control fails; pass if Y1 to Y5 hold; fail otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (tmp/sstr-probe1 .. 6, tmp/sstr-predict). Instrument: the ring table (k 0 to
//  12), ball sizes, the one-vibe matrix against dockMatrix (7e-17), the contact map (a unitary signed permutation, 24
//  stored and 24 released at each parity, the two parities differ), the box against the meson beat (0 differ over 2,304
//  one-beat starts, worst 1e-17), the threaded beat (entries 0 off after a fix: the gather first read through a different
//  intermediate dock than the scatter, so the ball's edge cut other entries; 900 ms a beat on a 12-ball on 8 threads).
//  Physics, seen before these gates were written: (a) with the string's sign unconsidered (e^(-i sigma V), a HILL at
//  this point) the start's weight left a 7-ball, which is what made the sign a derivation (3); (b) the spectral density of
//  the start's autocorrelation on a 7-ball (tmp/sstr-probe3-a.log): with the cost, a ladder at phases 1.199, 1.287,
//  1.379, 1.472 (spacing ~sigma, the members in opposite branches or one in the flat partner multiplet, eps 0.15 to 0.43),
//  and a weak peak at 2.618; with the hill the ladder mirrored about 1.047; with no string a peak at 1.0472 (a singlet
//  and a frozen partner) holding 0.24 of the start; (c) the filter at 2.618 lands on a level at phase 2.61435 (eps
//  1.56715) on an 8-ball and 2.61297 (eps 1.56577) on a 10-ball, the singlet pair's share 0.74, the string profile
//  peaked at V = 3 (10-ball profile over V = 0 .. 10: 9.8e-3 5.4e-2 0.18 0.24 0.22 0.14 8.2e-2 4.3e-2 1.7e-2 5.0e-3
//  1.8e-3), with |lambda2| 0.99134 and 0.99913 (the tail absorbed at the ball's edge, falling tenfold over two steps),
//  which set the 15-ball; the 8-ball's level, watched 256 beats, kept 0.106 (its edge absorbing 1.7e-2 a two-beat).
//  No gate threshold was set by a probe's number except the ball and window (5). A smoke run of every code path on a
//  5-ball (tmp/sstr-smoke.log, 243 s) checked the code, not the physics, and found two reading defects, fixed before
//  the gate run: Y4 counted a dock whenever the bounce table returned a permutation, which it does on every empty dock
//  (1,024 and 16,384 "permuting" dock-beats on the empty boxes, 0 on the love sea); and Y2 subtracted the two-pass K = 0
//  level's energy from one-pass K levels, so the filter's own bias (4.8e-3 on that unconverged 5-ball level) sat in
//  every difference; the K = 0 energy is now read by the same one-pass procedure. Its instrument (I1 to I5) held.
//
// FIRST RUN (tmp/sstr-exp-run1.log, 7,731 s, 12 threads): PARTIAL, on I6 (Hellmann-Feynman against the central
//  difference 4.95e-3 against 1e-3, read on a K = 0.4 level whose residual is 1.0e-2: an impure level, not a code defect;
//  the smoke run's 0.31 on a worse level agrees). Y1, Y2 and Y3 FAIL, Y4 and Y5 hold, C1 and C2 hold, I1 to I5 hold. No
//  gate moved and none was rerun.
//  - Y1 FAILS, and the prediction was wrong about why. The filter lands on a level at eps 1.565757 (predicted 1.5705 by
//    the nonrelativistic 4d well: 0.3 percent), |lambda2| 0.99998329, residual 1.2e-3, singlet share 0.762, stores 2.9e-4,
//    mean string length 3.71. Over 256 beats the window V <= 14 keeps 0.995646 (gate 0.999) and the fidelity falls to
//    0.979730 (gate 0.999). The loss is the level's own |lambda2|: (0.99998329)^256 = 0.99573, the absorbed 4.33e-3. So
//    the level is a RESONANCE of width about 1.7e-5 a beat (1.1e-5 of E_rest), not a bound state, and the vector holds
//    about 1 percent of a second component inside the filter's lobe (the fidelity beat).
//  - WHY, read off the profile (a reading after the run, not a derivation before it): the weight at V = 0 .. 15 is 9.9e-3
//    5.4e-2 0.18 0.25 0.22 0.15 7.9e-2 3.9e-2 1.6e-2 4.9e-3 1.5e-3 5.8e-4 2.7e-4 1.5e-4 7.2e-5 2.5e-5. It falls faster
//    than exponentially to V = 10 (ratios 0.49, 0.41, 0.32, 0.31), as the linear well's tail should, and then FLATTENS to
//    a ratio near 0.5 from V = 11 on: an outgoing tail. The flattening sits at V = 2m / sigma = 11.2, where the string
//    has paid the gap 2m and one member can drop into its partner multiplet. That multiplet is 12-fold at rest: the Dirac
//    lower branch AND 11 flat bands, degenerate with it. The derivation's Schwinger factor exp(-pi m^2 / (c* sigma)) =
//    2e-6 is the Landau-Zener leak through a gap between two dispersive branches; the flat bands touch the lower branch at
//    rest, so the channel into them is not suppressed that way, and the level leaks there. The swap coin's 22 flat bands,
//    which were expected to remove E-SPN-0135's bent family, are themselves the open channel.
//  - Y2 FAILS ON R, isotropic: the K^2 coefficient is 0.1555146602, 0.1555146598, 0.1555146616, 0.1555146605 along the
//    axis, face, body and generic direction (spread 9.5e-9, gate 1e-6, as symmetry says), and R = c*^2 / (2 a E_rest) =
//    1.02670 (gate 1 +- 0.01). The members' own R is 1.102658, so binding pulls R toward 1 (a factor 0.931), in the
//    predicted direction but a third as far (predicted 0.902: the second-order potential model overstates it).
//  - Y3 FAILS AS WRITTEN, every speed under c*: along the axis and the face the band reads eps 1.590171, 1.662594,
//    1.769874 at |K| 0.4, 0.8, 1.2 (the two directions equal to 6e-5) with Hellmann-Feynman speeds 0.168, 0.318, 0.409 c*
//    (0.409 c* at the one followed point, 1.2); the K = 0.4 and 0.8 levels' residuals 1.0e-2 and 1.1e-2 sit just over the
//    follow threshold 1e-2, and the gate required the 0.4 point followed. The band bends below its quadratic form (a K^2
//    alone gives 0.224 at 1.2, read 0.204), so nothing approaches c* in the range read.
//  - Y4 holds: the empty boxes (256 and 4,096 docks) and the love sea box stay one branch at S^cells and F^cells exactly
//    for 128 beats, no charge, no value moved by the collision.
//  - Y5 holds: with no string the filter at the predicted phase lands at eps 1.5522 and keeps 1e-4 in the window
//    (fidelity 0.0000); at the threshold 2m it lands at 1.0892 and keeps 0.0755: nothing binds, as E-SPN-0145 found.
//  - C1 holds: the hill keeps 0.9984 in the window (Bloch oscillation holds the pair near) but its fidelity is 0.1327:
//    no level. C2 holds: 2e-3 of the start's remainder drops the fidelity to 0.976.
//  - Read: at sigma 0.18711 the level sits at eps 1.85592 (predicted 1.8779) with R 2.41705 (predicted 0.836). There the
//    channel of the first bullet opens at 2m / sigma = 5.6, inside the composite (mean V near 3.7 at the weaker string),
//    so the level is mixed with frozen members and carries their inertia; this read was not checked for purity and is
//    not a trend. The trend statement of derivation 6 stands only as a derivation.
//  - Instrument: I1 matrix 7.1e-17, shape exact, empty factor 24 alone, m pi/6, R_walk 1.102658 in all four directions;
//    I2 unitarity 0, 24 stored and 24 released at each parity, the parities differ on 48 of 576 states, the collision's K
//    permutes a love and a fear on two single lines on 336 of 528 ordered pairs; I3 2,304 starts, worst 9.8e-18, 0
//    differ; I4 entries 0, sums 7.3e-14; I5 exact, Airy 2.338107, eps4 2.872097.
// THE NEXT STEP, derived from the failure: the phase string opens the member-into-flat-partner channel at V = 2m /
//  sigma whatever sigma is, because the flat partner is degenerate with the Dirac partner at rest; a phase string only
//  moves where it opens (2m / sigma), and a weaker string moves it out while widening the composite with it (both scale
//  as 1/sigma against l ~ sigma^(-1/3)), so the ratio of the tail's weight at 2m / sigma to the core falls only as the
//  well's tail at 2m / sigma: holding at 1e-3 over 256 beats needs 2m / sigma several l beyond the turning point. Two
//  minimal changes: (a) a MASS string, the mixer angle carrying the cost (theta = pi + 2 m(V)), which widens the members'
//  gap with separation, so no separation makes a flipped member degenerate with the pair; (b) a coin that lifts the 11 flat
//  bands off the Dirac partner at rest while keeping gamma = 0 (E-SPN-0143 found only zeta = -1 gives gamma = 0 for the
//  whole family, so (b) must be a new piece, not another zeta). (a) is the smaller change.
//
// Depth L2: a two-body quantum walk with a linear potential on the D4 lattice, the rule's own dock pieces read exactly
// and checked against the rule on a box; the string is an added separation cost, stated as such. DETERMINISM: no random
// numbers; the start is placed, every level filtered. NOTHING MOVES: the pieces hand values between slots of one dock,
// the stream takes each slot's value one dock along, the string is a phase.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { rootIndex } from '@/code/measure/crossing-lines'
import { centerOf } from '@/code/measure/wall-reading'
import {
  dockMatrix,
  DOCK_ROOTS,
  type CMatrix,
} from '@/code/measure/dock-mixer'
import {
  singletKinematics,
  singletLevel,
} from '@/code/measure/singlet-kinematics'
import { d4Ball, flatBoxTables } from '@/code/measure/swap-sector'
import { ringScale } from '@/code/rule/swap-mixer'
import {
  BOUNCE_TABLE,
  bouncePermutation,
} from '@/code/rule/bounce-pair-knit'
import { LINE_OF } from '@/code/rule/isometric-knit'
import { shareSpace, threadEngine } from '@/code/measure/meson-pool'
import {
  boxCheck,
  boxStarts,
  buildLevel,
  cloneMeson,
  contactDockExact,
  CONTACT_STATES,
  contactUnitarity as unitarityOf,
  emptyFactor,
  levelVelocity,
  linearWell,
  mesonInner,
  mesonSpace,
  mesonStart,
  newFlow,
  normalizeMeson,
  overEmpty,
  readLevel,
  ringUnit,
  serialEngine,
  setMomentum,
  setString,
  singletShare,
  sparseOf,
  STORE_BASE,
  storeWeight,
  stringKappa,
  stringProfile,
  unitAngle,
  unitNormExact,
  vibeDockExact,
  vacuumRun,
  vibeShape,
  watchLevel,
  type MesonEngine,
  type MesonState,
} from '@/code/measure/swap-string'

const C = Math.SQRT2
const C_STAR = C / 2
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GENERIC_RAW = [0.29, 0.52, 0.8, 0]
const GENERIC = GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW))
const DIRECTIONS: readonly { name: string; u: number[] }[] = [
  { name: 'axis', u: [1, 0, 0, 0] },
  { name: 'face', u: [s2, s2, 0, 0] },
  { name: 'body', u: [s3, s3, s3, 0] },
  { name: 'generic', u: GENERIC },
]
// the point: the mixer unit w^2 (k 0, j 4) and the string unit w^4 ((3 + w)/(3 + w^2))^3 (k 3, j 4)
const MIXER: readonly [number, number] = [0, 4]
const STRING: readonly [number, number] = [3, 4]
const STRING_READ: readonly [number, number] = [6, 2]

// the sizes of the run: the gate plan below, and a smaller one a smoke test may pass (disclosed, gates nothing)
export type SwapStringPlan = {
  ball: number
  window: number
  sFirst: number
  sSecond: number
  sMove: number
  holdBeats: number
  threads: number
  vacuumBeats: number
}

export const GATE_PLAN: SwapStringPlan = {
  ball: 15,
  window: 14,
  sFirst: 256,
  sSecond: 128,
  sMove: 64,
  holdBeats: 256,
  threads: 12,
  vacuumBeats: 128,
}

const ELL = 2.5
const HOLD = 1e-3
const KAPPA = 0.04
const ISOTROPY = 1e-6
const R_TOLERANCE = 0.01
const FOLLOW_K: readonly number[] = [0.4, 0.8, 1.2]
const FOLLOW_LAMBDA = 0.99
const FOLLOW_RESIDUAL = 1e-2
const SPEED_TOLERANCE = 1e-6
const FD_H = 0.02
const FD_TOLERANCE = 1e-3
const VACUUM_SIDES: readonly number[] = [4, 8]
const MIX = 2e-3
const POOL = 3
const MATRIX_TOLERANCE = 1e-12
const READ_TOLERANCE = 1e-9
const ENTRY_TOLERANCE = 1e-12
const THREAD_TOLERANCE = 1e-13
const SUM_TOLERANCE = 1e-12
const AIRY_ZERO = 2.338107
const AIRY_TOLERANCE = 1e-5
const KAPPA_GRID = 24
const WELL_L = 24
const WELL_N = 24000
const SCALES: readonly number[] = [0.1, 0.2, 0.3, 0.4, 0.5]
const K_THREAD = [0.3, -0.1, 0.2, 0.05]
const THREAD_BALL = 5
const THREAD_BEATS = 4
const BOX_SIDE = 4
const CHECK_BALL = 3

const flag = (b: boolean): number => (b ? 1 : 0)
const wrap = (x: number): number => Math.atan2(Math.sin(x), Math.cos(x))
const norm4 = (v: readonly number[]): number => Math.hypot(...v)

export default experiment({
  id: 'spin/swap-string-meson',
  code: 'E-SPN-0146',
  title:
    "the smallest string on the swap-coin rule makes a composite that moves isotropically under c* but does not hold, partial (I6 4.95e-3 on an impure level; Y1, Y2, Y3 fail): Z3 and the charge register allow three holes on the love sea (two holes are +1 mod 3, a fear is unmade), so the two-body composite run is its exact particle-hole image, the love-fear meson on the empty mesh, with m = pi/6 (u = w^2) and a route-free phase string sigma 0.093556 in Z[w][1/42] (exact, diagonal, reach unchanged, its sign a derived cost); the rule's dock maps equal the model to 1e-17 on 2,304 box starts; a level sits at eps 1.565757 (predicted 1.5705) but is a resonance, |lambda2| 0.99998, keeping 0.9956 of the window and fidelity 0.980 over 256 beats, its tail flattening at V = 2m/sigma = 11 where a member drops into its 12-fold partner multiplet, whose 11 flat bands are degenerate with the Dirac partner at rest and so escape the Schwinger suppression; it moves isotropically (K^2 coefficient spread 9.5e-9) with R 1.0267 (members 1.1027, predicted 0.902), and its band bends under the quadratic form with speeds 0.17, 0.32, 0.41 c* at K 0.4, 0.8, 1.2; the vacuum stays inert with the string on, no string binds nothing, the hill holds no level; next: a mass string (the mixer angle carrying the cost) so no separation makes a flipped member degenerate",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return swapStringRun(GATE_PLAN)
  },
})

export function swapStringRun(plan: SwapStringPlan): Verdict {
  {
    const started = Date.now()
    const log = (what: string): void =>
      console.error(
        `${what} ${Math.round((Date.now() - started) / 1000)}s`,
      )

    // ---------------- I1: the one-vibe matrix on the empty dock ----------------
    const u = ringUnit(MIXER[0], MIXER[1])
    const theta = unitAngle(u)
    const sUnit = ringUnit(STRING[0], STRING[1])
    const sigma = Math.abs(unitAngle(sUnit))
    const sigmaRead = Math.abs(
      unitAngle(ringUnit(STRING_READ[0], STRING_READ[1])),
    )
    const L0 = vibeDockExact(1, 0, u)
    const L1 = vibeDockExact(1, 1, u)
    const F0 = vibeDockExact(-1, 0, u)
    const F1 = vibeDockExact(-1, 1, u)
    const same = (x: typeof L0, y: typeof L0): boolean =>
      x.k === y.k &&
      x.entries.every((row, i) =>
        row.every(
          (e, j) =>
            e[0] === (y.entries[i] as [bigint, bigint][])[j]![0] &&
            e[1] === (y.entries[i] as [bigint, bigint][])[j]![1],
        ),
      )
    const alike = same(L0, L1) && same(L0, F0) && same(L0, F1)
    const A = overEmpty(L0, u)
    const shape = vibeShape(A)
    const P = dockMatrix(
      theta < 0 ? theta + 2 * Math.PI : theta,
      2 / 3,
      false,
    )

    let matrixGap = 0

    for (let i = 0; i < 576; i++) {
      matrixGap = Math.max(
        matrixGap,
        Math.hypot(A.re[i]! - P.re[i]!, A.im[i]! - P.im[i]!),
      )
    }

    const empty = emptyFactor(u)
    const emptyOk =
      empty.alone &&
      empty.a === ringScale(u) &&
      empty.b === 0n &&
      empty.k === 0
    const PA: CMatrix = { re: A.re, im: A.im }
    const level1 = singletLevel(PA, DOCK_ROOTS, 12)
    const kin = DIRECTIONS.map(d =>
      singletKinematics(PA, DOCK_ROOTS, level1, d.u, SCALES),
    )
    const Rwalk = kin.map(k => (C_STAR * C_STAR) / k.c2)
    const m = level1.m
    const I1 =
      matrixGap <= MATRIX_TOLERANCE &&
      alike &&
      shape.gap <= MATRIX_TOLERANCE &&
      emptyOk &&
      Math.abs(m - Math.PI / 6) <= READ_TOLERANCE &&
      Rwalk.every(
        r =>
          Math.abs(r - Math.tan(Math.PI / 6) / (Math.PI / 6)) <=
          READ_TOLERANCE,
      )

    log('I1')

    // ---------------- I2: the contact map ----------------
    const contact0 = contactDockExact(0, u)
    const contact1 = contactDockExact(1, u)
    const Cf = [overEmpty(contact0, u), overEmpty(contact1, u)]
    const live = [...Array(CONTACT_STATES).keys()].filter(
      i => i >= STORE_BASE || Math.floor(i / 24) !== i % 24,
    )
    const contactUnitarity = Math.max(
      ...Cf.map(M => unitarityOf(M, live)),
    )

    let parityDiffer = 0

    for (const a of live) {
      for (let t = 0; t < CONTACT_STATES; t++) {
        const x = Cf[0]!.re[t * CONTACT_STATES + a]!
        const y = Cf[1]!.re[t * CONTACT_STATES + a]!
        const xi = Cf[0]!.im[t * CONTACT_STATES + a]!
        const yi = Cf[1]!.im[t * CONTACT_STATES + a]!

        if (Math.hypot(x - y, xi - yi) > 1e-15) {
          parityDiffer++
          break
        }
      }
    }

    // how often the collision's K permutes a love and a fear on two single lines of one dock (read)
    const perm = new Int32Array(24)

    let kFires = 0

    for (let l = 0; l < 24; l++) {
      for (let f = 0; f < 24; f++) {
        if (l === f || LINE_OF[l] === LINE_OF[f]) {
          continue
        }

        const v = new Int8Array(24)

        v[l] = 1
        v[f] = -1

        if (
          bouncePermutation(BOUNCE_TABLE, 'pass', v, 0, perm) !== 0 &&
          [...perm].some((x, d) => x !== d)
        ) {
          kFires++
        }
      }
    }

    const contact: [
      ReturnType<typeof sparseOf>,
      ReturnType<typeof sparseOf>,
    ] = [sparseOf(Cf[0]!), sparseOf(Cf[1]!)]
    const I2 = contactUnitarity <= MATRIX_TOLERANCE

    log('I2')

    // ---------------- I3: one beat of the rule on the side-4 empty box against the meson beat ----------------
    const box = flatBoxTables(BOX_SIDE)
    const X = centerOf(BOX_SIDE)
    const B = rootIndex([1, 1, 0, 0])
    const Xf = Math.floor(box.target[X * 24 + B]! / 24)
    const checkSpace = mesonSpace(
      d4Ball(CHECK_BALL),
      shape,
      contact,
      0,
      [0, 0, 0, 0],
    )
    const boxed = boxCheck(
      box,
      boxStarts(live, X, Xf, [-1, -1, 0, 0]),
      checkSpace,
      () => u,
      ENTRY_TOLERANCE,
    )
    const boxWorst = boxed.worst
    const boxDiffer = boxed.differ
    const boxChecked = boxed.checked
    const boxInexact = boxed.inexact
    const boxStray = boxed.stray
    const I3 = boxDiffer === 0 && boxInexact === 0 && boxStray === 0

    log('I3')

    // ---------------- I5: the ring and the solver ----------------
    const I5ring = unitNormExact(sUnit) && unitNormExact(u)
    const airy = linearWell(WELL_L, WELL_N, 0)
    const eps4 = linearWell(WELL_L, WELL_N)
    const I5 = I5ring && Math.abs(airy - AIRY_ZERO) <= AIRY_TOLERANCE

    // ---------------- the prediction (computed here from the derivation's formulas; it gates nothing) ----------------
    const kap = stringKappa(KAPPA_GRID)

    const predict = (
      sg: number,
    ): {
      l: number
      Eb: number
      Erest: number
      schwinger: number
      R: number
    } => {
      const mu = Math.tan(m)
      const F = sg * kap.mean
      const l = (1 / (2 * mu * F)) ** (1 / 3)
      const Eb = eps4 * F * l
      const T = Eb / 3

      return {
        l,
        Eb,
        Erest: 2 * m + Eb,
        schwinger: (Math.PI * m * m) / (C_STAR * sg),
        R: (2 * mu + 1.5 * T) / (2 * m + 3 * T),
      }
    }

    const pred = predict(sigma)
    const predRead = predict(sigmaRead)
    const sign = level1.sign
    const mid = level1.midPhase
    const phaseOf = (eps: number): number => wrap(2 * mid - sign * eps)
    const epsOf = (phase: number): number =>
      sign * -wrap(phase - 2 * mid)

    log('prediction')

    // ---------------- I4: the threaded beat against the one-thread beat ----------------
    let threadGap = 0
    let threadSums = 0

    {
      const sp = shareSpace(
        mesonSpace(
          d4Ball(THREAD_BALL),
          shape,
          contact,
          sign * sigma,
          K_THREAD,
        ),
      )
      const ser = serialEngine(sp)
      const thr = threadEngine(sp, plan.threads, POOL)
      const a = ser.borrow()
      const b = ser.borrow()
      const c = thr.borrow()
      const d = thr.borrow()
      const g = 0.6180339887498949

      for (let k = 0; k < a.re.length; k++) {
        a.re[k] = ((k * g) % 1) - 0.5
        a.im[k] = ((k * g * g) % 1) - 0.5
      }

      c.re.set(a.re)
      c.im.set(a.im)

      for (let t = 0; t < THREAD_BEATS; t++) {
        const f1 = newFlow()
        const f2 = newFlow()
        const l1 = ser.beat(a, b, t, f1)
        const l2 = thr.beat(c, d, t, f2)

        for (let k = 0; k < b.re.length; k++) {
          threadGap = Math.max(
            threadGap,
            Math.abs(b.re[k]! - d.re[k]!),
            Math.abs(b.im[k]! - d.im[k]!),
          )
        }

        threadSums = Math.max(
          threadSums,
          Math.abs(l1 - l2) / Math.max(1, l1),
          Math.abs(f1.weight - f2.weight) / f1.weight,
          ...[0, 1, 2, 3].map(
            k => Math.abs(f1.v[k]! - f2.v[k]!) / f1.weight,
          ),
        )
        a.re.set(b.re)
        a.im.set(b.im)
        c.re.set(d.re)
        c.im.set(d.im)
      }

      thr.close()
    }

    const I4 =
      threadGap <= THREAD_TOLERANCE && threadSums <= SUM_TOLERANCE

    log('I4')

    // ---------------- the engine on the gate ball ----------------
    const ball = d4Ball(plan.ball)
    const space = shareSpace(
      mesonSpace(ball, shape, contact, sign * sigma, [0, 0, 0, 0]),
    )
    const engine: MesonEngine = threadEngine(space, plan.threads, POOL)
    const start = mesonStart(ball, ELL)

    log(`ball ${plan.ball}: ${ball.points.length} sites`)

    // ---------------- Y1: the level holds ----------------
    const first = buildLevel(
      engine,
      start,
      phaseOf(pred.Erest),
      plan.sFirst,
      1,
    )
    const second = buildLevel(
      engine,
      first.v,
      first.read.phase,
      plan.sSecond,
      1,
    )
    const v0 = second.v
    const read0 = second.read
    const hold = watchLevel(engine, v0, plan.holdBeats, plan.window)
    const Y1 =
      hold.leastWindow >= 1 - HOLD && hold.leastFidelity >= 1 - HOLD
    const Erest = epsOf(read0.phase)
    const profile = stringProfile(ball, v0)
    const share = singletShare(ball, v0)
    const stored = storeWeight(ball, v0)
    const meanV = profile.reduce((s, w, V) => s + w * V, 0)

    log('Y1')

    // ---------------- C2: the witness sees a beat ----------------
    let C2 = false
    let c2Fidelity = 1

    {
      const w = cloneMeson(start)
      const o = mesonInner(v0, w)

      for (let k = 0; k < w.re.length; k++) {
        const vr = v0.re[k]!
        const vi = v0.im[k]!

        w.re[k] = w.re[k]! - (o[0] * vr - o[1] * vi)
        w.im[k] = w.im[k]! - (o[0] * vi + o[1] * vr)
      }

      normalizeMeson(w)

      const mix = cloneMeson(v0)

      for (let k = 0; k < mix.re.length; k++) {
        mix.re[k] =
          Math.sqrt(1 - MIX) * v0.re[k]! + Math.sqrt(MIX) * w.re[k]!

        mix.im[k] =
          Math.sqrt(1 - MIX) * v0.im[k]! + Math.sqrt(MIX) * w.im[k]!
      }

      const h = watchLevel(engine, mix, plan.holdBeats, plan.window)

      c2Fidelity = h.leastFidelity
      C2 = h.leastFidelity < 1 - HOLD
    }

    log('C2')

    // ---------------- Y2: the dispersion at small K ----------------
    const energyAt = (
      K: readonly number[],
      from: MesonState,
      phase: number,
      S: number,
    ): {
      eps: number
      v: MesonState
      lambda: number
      residual: number
    } => {
      setMomentum(space, K)

      const lv = buildLevel(engine, from, phase, S, 1)

      return {
        eps: epsOf(lv.read.phase),
        v: lv.v,
        lambda: Math.hypot(...lv.read.lambda2),
        residual: lv.read.residual,
      }
    }

    // the K = 0 energy read by the SAME procedure as every K point (one filter of S_move from v0), so a filter's own
    // bias cancels in the differences
    const zeroMove = energyAt(
      [0, 0, 0, 0],
      v0,
      read0.phase,
      plan.sMove,
    ).eps
    const dispersion = DIRECTIONS.map(d => {
      const e1 = energyAt(
        d.u.map(x => x * KAPPA),
        v0,
        read0.phase,
        plan.sMove,
      )
      const e2 = energyAt(
        d.u.map(x => (x * KAPPA) / 2),
        v0,
        read0.phase,
        plan.sMove,
      )
      const d1 = e1.eps - zeroMove
      const d2 = e2.eps - zeroMove
      const a = (16 * d2 - d1) / (3 * KAPPA * KAPPA)

      log(`Y2 ${d.name}`)

      return {
        name: d.name,
        d1,
        d2,
        a,
        lambda: Math.min(e1.lambda, e2.lambda),
        residual: Math.max(e1.residual, e2.residual),
      }
    })
    const a0 = dispersion[0]!.a
    const isotropy = Math.max(
      ...dispersion.map(x => Math.abs(x.a / a0 - 1)),
    )
    const R = (C_STAR * C_STAR) / (2 * a0 * Erest)
    const Y2 = isotropy <= ISOTROPY && Math.abs(R - 1) <= R_TOLERANCE

    // ---------------- Y3: the band followed to larger K, and its Hellmann-Feynman speed ----------------
    const follow = DIRECTIONS.slice(0, 2).map(d => {
      let from = v0
      let phase = read0.phase

      const points: {
        K: number
        eps: number
        speed: number
        followed: boolean
        lambda: number
        residual: number
      }[] = []

      for (const k of FOLLOW_K) {
        const guess = phaseOf(Erest + a0 * k * k)
        const e = energyAt(
          d.u.map(x => x * k),
          from,
          points.length ? guess : phase,
          plan.sMove,
        )
        const vel = levelVelocity(engine, e.v)
        const followed =
          e.lambda >= FOLLOW_LAMBDA && e.residual <= FOLLOW_RESIDUAL

        points.push({
          K: k,
          eps: e.eps,
          speed: norm4(vel),
          followed,
          lambda: e.lambda,
          residual: e.residual,
        })
        from = e.v
        phase = phaseOf(e.eps)
        log(`Y3 ${d.name} ${k}`)
      }

      return { name: d.name, points }
    })
    const speeds = follow.flatMap(f =>
      f.points.filter(p => p.followed).map(p => p.speed),
    )
    const topSpeed = speeds.length ? Math.max(...speeds) : NaN
    const Y3 =
      follow.every(
        f => (f.points[0] as { followed: boolean }).followed,
      ) && speeds.every(s => s <= C_STAR * (1 + SPEED_TOLERANCE))

    // I6: Hellmann-Feynman against the central difference at K 0.4 along the axis
    let hfGap = NaN

    {
      const k = FOLLOW_K[0]!
      const at = energyAt(
        [k, 0, 0, 0],
        v0,
        phaseOf(Erest + a0 * k * k),
        plan.sMove,
      )
      const vel = levelVelocity(engine, at.v)
      const up = energyAt(
        [k + FD_H, 0, 0, 0],
        at.v,
        phaseOf(at.eps),
        plan.sMove,
      )
      const down = energyAt(
        [k - FD_H, 0, 0, 0],
        at.v,
        phaseOf(at.eps),
        plan.sMove,
      )
      const slope = (up.eps - down.eps) / (2 * FD_H)

      hfGap =
        Math.abs(Math.abs(slope) - Math.abs(vel[0]!)) / Math.abs(slope)
    }

    const I6 = hfGap <= FD_TOLERANCE

    setMomentum(space, [0, 0, 0, 0])
    log('Y3 I6')

    // ---------------- READ: R at the stronger string (k = 6) ----------------
    setString(space, sign * sigmaRead)

    const readLv = buildLevel(
      engine,
      start,
      phaseOf(predRead.Erest),
      plan.sFirst,
      1,
    )
    const readLv2 = buildLevel(
      engine,
      readLv.v,
      readLv.read.phase,
      plan.sSecond,
      1,
    )
    const ErestRead = epsOf(readLv2.read.phase)
    const readA = (() => {
      const zero = energyAt(
        [0, 0, 0, 0],
        readLv2.v,
        readLv2.read.phase,
        plan.sMove,
      ).eps
      const e1 = energyAt(
        [KAPPA, 0, 0, 0],
        readLv2.v,
        readLv2.read.phase,
        plan.sMove,
      )
      const e2 = energyAt(
        [KAPPA / 2, 0, 0, 0],
        readLv2.v,
        readLv2.read.phase,
        plan.sMove,
      )

      setMomentum(space, [0, 0, 0, 0])

      return (
        (16 * (e2.eps - zero) - (e1.eps - zero)) / (3 * KAPPA * KAPPA)
      )
    })()
    const Rread = (C_STAR * C_STAR) / (2 * readA * ErestRead)

    log('read k6')

    // ---------------- Y5: no string ----------------
    setString(space, 0)

    const noString = [pred.Erest, 2 * m].map(eps => {
      const lv = buildLevel(
        engine,
        start,
        phaseOf(eps),
        plan.sSecond,
        1,
      )
      const h = watchLevel(engine, lv.v, plan.holdBeats, plan.window)

      return {
        eps,
        landed: epsOf(lv.read.phase),
        holds: h.leastWindow >= 1 - HOLD && h.leastFidelity >= 1 - HOLD,
        window: h.leastWindow,
        fidelity: h.leastFidelity,
      }
    })
    const Y5 = noString.every(x => !x.holds)

    log('Y5')

    // ---------------- C1: the hill ----------------
    setString(space, -sign * sigma)

    const hill = (() => {
      const lv = buildLevel(
        engine,
        start,
        phaseOf(pred.Erest),
        plan.sSecond,
        1,
      )
      const h = watchLevel(engine, lv.v, plan.holdBeats, plan.window)

      return {
        landed: epsOf(lv.read.phase),
        holds: h.leastWindow >= 1 - HOLD && h.leastFidelity >= 1 - HOLD,
        window: h.leastWindow,
        fidelity: h.leastFidelity,
      }
    })()
    const C1 = !hill.holds

    engine.close()
    log('C1')

    // ---------------- Y4: the vacuum with the string on ----------------
    const vacuum = [
      ...VACUUM_SIDES.map(side => ({ side, sea: 0 })),
      { side: BOX_SIDE, sea: 1 },
    ].map(({ side, sea }) => vacuumRun(u, side, sea, plan.vacuumBeats))
    const Y4 = vacuum.every(
      v => v.exact && v.permutes === 0 && v.charged === 0,
    )

    log('Y4')

    const instrument = I1 && I2 && I3 && I4 && I5 && I6
    const controls = C1 && C2
    const status =
      !instrument || !controls
        ? 'partial'
        : Y1 && Y2 && Y3 && Y4 && Y5
          ? 'pass'
          : 'fail'
    const dispLine = dispersion
      .map(
        x =>
          `${x.name} a ${x.a.toExponential(9)} (d ${x.d1.toExponential(4)}, ${x.d2.toExponential(4)}; |lambda2| >= ${x.lambda.toFixed(6)}, residual <= ${x.residual.toExponential(1)})`,
      )
      .join('; ')
    const followLine = follow
      .map(
        f =>
          `${f.name}: ${f.points.map(p => `K ${p.K} eps ${p.eps.toFixed(6)} speed ${(p.speed / C_STAR).toFixed(6)} c*${p.followed ? '' : ' (not followed)'} (|lambda2| ${p.lambda.toFixed(5)}, residual ${p.residual.toExponential(1)})`).join(', ')}`,
      )
      .join('; ')

    return verdict({
      status,
      claim: `Y1 ${Y1} (level at eps ${Erest.toFixed(6)} against the predicted ${pred.Erest.toFixed(4)}, |lambda2| ${Math.hypot(...read0.lambda2).toFixed(8)}, residual ${read0.residual.toExponential(2)}; over ${plan.holdBeats} beats the window V <= ${plan.window} keeps at least ${hold.leastWindow.toFixed(6)} and the fidelity is at least ${hold.leastFidelity.toFixed(6)}); Y2 ${Y2} (isotropy ${isotropy.toExponential(2)}, R ${R.toFixed(5)} against the predicted ${pred.R.toFixed(3)}); Y3 ${Y3} (top Hellmann-Feynman speed ${(topSpeed / C_STAR).toFixed(6)} c*); Y4 ${Y4}; Y5 ${Y5} (no string: ${noString.map(x => `at eps ${x.eps.toFixed(4)} landed ${x.landed.toFixed(4)}, window ${x.window.toFixed(4)}, fidelity ${x.fidelity.toFixed(4)}`).join('; ')}); controls C1 ${C1} (hill: window ${hill.window.toFixed(4)}, fidelity ${hill.fidelity.toFixed(4)}), C2 ${C2} (mixed start fidelity ${c2Fidelity.toFixed(6)}); read at sigma ${sigmaRead.toFixed(5)}: eps ${ErestRead.toFixed(5)} (predicted ${predRead.Erest.toFixed(4)}), R ${Rread.toFixed(5)} (predicted ${predRead.R.toFixed(3)})`,
      metrics: {
        Y1: flag(Y1),
        Y2: flag(Y2),
        Y3: flag(Y3),
        Y4: flag(Y4),
        Y5: flag(Y5),
        instrument: flag(instrument),
        I1: flag(I1),
        I2: flag(I2),
        I3: flag(I3),
        I4: flag(I4),
        I5: flag(I5),
        I6: flag(I6),
        C1: flag(C1),
        C2: flag(C2),
        m,
        sigma,
        Erest,
        ErestPredicted: pred.Erest,
        lambda2: Math.hypot(...read0.lambda2),
        residual: read0.residual,
        leastWindow: hold.leastWindow,
        leastFidelity: hold.leastFidelity,
        absorbed: hold.absorbed,
        singletShare: share,
        stored,
        meanStringLength: meanV,
        inertiaCoefficient: a0,
        isotropy,
        R,
        RPredicted: pred.R,
        RWalk: Rwalk[0]!,
        topSpeedOverCStar: topSpeed / C_STAR,
        hfGap,
        ErestRead,
        Rread,
        matrixGap,
        contactUnitarity,
        boxWorst,
        threadGap,
        threadSums,
        eps4,
        kappa: kap.mean,
        schwingerExponent: pred.schwinger,
        seconds: (Date.now() - started) / 1000,
      },
      control: {
        C1: flag(C1),
        C2: flag(C2),
        instrument: flag(instrument),
      },
      notes: `L2. The members: m ${m.toFixed(6)}, R_walk ${Rwalk.map(x => x.toFixed(6)).join(' ')} along the four directions, the singlet's midpoint ${mid.toFixed(5)}, sign ${sign}. I1: matrix ${matrixGap.toExponential(2)}, love = fear, parities alike ${alike}, shape c ${shape.c.map(x => x.toFixed(9)).join(',')} beta ${shape.beta.map(x => x.toFixed(9)).join(',')} gap ${shape.gap.toExponential(2)}, empty factor ${empty.a} alone ${empty.alone}. I2: contact unitarity ${contactUnitarity.toExponential(2)}, stored ${contact0.stored} and ${contact1.stored}, released ${contact0.released} and ${contact1.released}, parity differs on ${parityDiffer} of ${live.length} states; the collision's K permutes a love and a fear on two single lines on ${kFires} of 528 ordered pairs. I3: ${boxChecked} one-beat starts, worst ${boxWorst.toExponential(2)}, ${boxDiffer} differ, ${boxInexact} inexact, ${boxStray} stray. I4: entries ${threadGap.toExponential(2)}, sums ${threadSums.toExponential(2)} (${plan.threads} threads). I5: norm exact ${I5ring}, Airy ${airy.toFixed(6)}, eps4 ${eps4.toFixed(6)}. I6: Hellmann-Feynman against the central difference ${hfGap.toExponential(2)}. Prediction: kappa ${kap.mean.toFixed(5)} (${kap.least.toFixed(5)} .. ${kap.most.toFixed(5)}), l ${pred.l.toFixed(3)}, E_b ${pred.Eb.toFixed(4)}, Schwinger exponent ${pred.schwinger.toFixed(2)}; at the read string l ${predRead.l.toFixed(3)}, E_b ${predRead.Eb.toFixed(4)}, exponent ${predRead.schwinger.toFixed(2)}. The level: singlet share ${share.toFixed(4)}, stores ${stored.toExponential(2)}, mean string length ${meanV.toFixed(3)}, profile ${profile.map(x => x.toExponential(2)).join(' ')}; absorbed over the hold ${hold.absorbed.toExponential(2)}. Y2: ${dispLine}. Y3: ${followLine}. Y4: ${vacuum.map(v => `side ${v.side} ${v.sea ? 'love sea' : 'empty'} (${v.cells} docks) exact ${v.exact}, permutes ${v.permutes}, charged ${v.charged}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
    })
  }
}
