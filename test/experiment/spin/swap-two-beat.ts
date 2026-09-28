// CAN A TWO-BEAT SCHEDULE LIFT THE SWAP COIN'S 22 FLAT BANDS OUT OF A LIGHT COMPOSITE'S WAY? (E-SPN-0159). Under the
// candidate rule (the love sea, the 24-slot fermionic dock mixer, the swap coin, the ring Z[w][1/42]) one-body motion is
// exact and relativistic at c* = c / 2, but each member has 22 flat bands, and every binding tried (phase string, mass
// string, static Coulomb) fails for light members because the bound level sits inside a flat-band continuum. E-SPN-0148
// proved that no dock-local piece moves the odd flats alone (the band sum of the stream times a fixed dock matrix has no
// constant Fourier term) and named the escape: two different dock pieces on alternating beats. This file derives what a
// two-beat schedule can and cannot do, runs the nearest exact one, and censuses the whole covariant family.
//
// DERIVED BEFORE THE RUN (machinery: code/measure/two-beat, code/measure/swap-cone cycleMatrix, code/measure/odd-phase
// covariantProjectors; K in D4 coordinates, c = sqrt 2, c* = 1 / sqrt 2; eps from the S-D midpoint, signed so S rests at
// +M; M the cycle's half gap, m = M / 2 per beat).
// 1. THE CYCLE. A W(F4)-covariant dock piece after the coin is P = X G, G = sum_k e^(i phi_k) Pi_k over the five
//    invariant projectors (Pi1 uniform, Pi2, Pi9 even; Pi4 the vector a . r, Pi8 odd; ranks 1, 2, 9, 4, 8). Every such G
//    commutes with X (X is the action of -1, which is in W(F4)), and T(K) X = T(K/2) X T(K/2)^dag, so with T the stream
//        U(K) = T P2 T P1 = (T X) G2 (T X) G1 = T G2 T^dag G1     (EXACT; I1).
//    With G1 = 1 the cycle is conjugate to G2 at every K: every band is flat (the coin's bounce undoes the stream in two
//    beats). All motion is the pieces' failure to commute with the stream: U = G2 G1 - i [K . R, G2] G1 + O(K^2),
//    R = diag(r_d). So a light singlet needs strong contrast on BOTH beats (probe 4 found a search that froze every band
//    by dropping beat 1's mixer and so passed a bare census; the family scan therefore keeps R = tan m / m).
// 2. THE BAND SUM KEEPS A CONSTANT TERM. tr U = sum_(d,e) e^(-i K . (r_d - r_e)) (G2)_de (G1)_ed, whose constant term is
//    sum_d (G2)_dd (G1)_dd = (1/24) (sum_k n_k e^(i b_k)) (sum_k n_k e^(i a_k)), n = (1, 2, 9, 4, 8), a and b the two
//    beats' phases ((Pi_k)_dd = n_k / 24: W(F4) is transitive on the roots). E-SPN-0148's escape is real: at K = 0
//    U = G2 G1, so each projector's rest phase rho_k = a_k + b_k is free (I2).
// 3. WHAT A LIGHT COMPOSITE NEEDS (the channel census). The composite at total K = 0 sits at 2 M - B; every pair of bands
//    at q and -q gives a two-member continuum e_a(q) + e_b(q), and the level is a true bound state only if none reaches
//    (2 M - B, 2 M). So (i) a FLAT band at eps f is harmless iff f is in [M, 3 M - B) or within min(M, pi - Smax) of
//    pi + 2 M (Smax the singlet's top); (ii) a band resting at D's eps -M is harmless only if it FALLS at least as fast as S
//    rises, f(q) <= 2 M - B - s(q) at every q; (iii) D + D's wrap needs Smax < pi - M. The doubled one-beat puts all 22
//    flats at D's rest (eps -M): S + flat opens at s = 3 M below m = (pi + E_b) / 4, E-SPN-0155's census, which the cycle
//    census reproduces to the digit (C2 heavy, C3 light).
// 4. THE PIN (L1). The singlet's first-order partner is Pi4 alone (multiplying by a coordinate of r maps constants to
//    linear functions). A light singlet with R -> 1 needs that partner within 2 M at rest, so Pi4 rests at D's phase;
//    Pi4 is irreducible, so a covariant piece acts on it by one phase: THREE TRANSVERSE Pi4 STATES REST AT D'S PHASE,
//    eps -M, IN EVERY COVARIANT SCHEDULE OF ANY PERIOD. By 3 (ii) they must fall with D.
// 5. THEY CANNOT. At first order the transverse states couple only to Pi9 (K . r times a . r with a perp K is a traceless
//    quadratic: its mean is 12 K . a / 24 = 0). The roots are a 4-design, sum_d r_a r_b r_c r_e = 4 (d_ab d_ce + d_ac d_be
//    + d_ae d_bc) (integers, I5), so for unit Pi4 vectors (a . r) / sqrt 12 multiplication by K^ . r puts weight 1/2 on
//    Pi1 and 1/2 on Pi9 for the longitudinal one and 1/3 on Pi9 for a transverse one. In the continuum cluster (every
//    sector resting within O(M) of the midpoint; H = M diag(x) + K . A, couplings c14, c49, c98, c28 on the degree chain
//    1 - 4 - 9 - 8 - 2) the Pi4 block of A^dag A is diag((c14^2 + c49^2) / 2, c49^2 / 3 three times).
//    (a) FAR SECTORS (L1): if Pi9 rests Delta >> M from D, the transverse states stay at -M + O(K^2 / Delta) while S
//        rises, and S + transverse reaches 2 M at s = 3 M, c* q = sqrt 8 M: B* = 0. (The cluster model with c14 alone:
//        S = sqrt(1 + p^2 / 2), first crossing at p = 4, C5.)
//    (b) ONE SPEED FOR ALL (L1): if every band pair had S's dispersion, A^dag A = c*^2 on the odd sectors and its Pi4 block
//        would be scalar, (c14^2 + c49^2) / 2 = c49^2 / 3: impossible. The pinned states cannot be copies of D.
//    (c) THE GENERAL CLUSTER (not proved): N1 scans it, x2, x9, x8 in [-6, 6], c49, c98, c28 in [0, 3], c14 = 1, each of
//        the three couplings on or off (off: that sector far). PREDICTED: B* = 0 at every point.
//    SO FOR LIGHT MEMBERS NO COVARIANT SCHEDULE, OF TWO BEATS OR ANY PERIOD, CLOSES THE S + TRANSVERSE CHANNEL. The period
//    is not the obstruction: W(F4) covariance on a scalar-plus-vector slot content is.
// 6. THE ALTERNATIVE FRAMING, a label that hides the flats. (i) No irrep label can: at a generic q the stabilizer in
//    W(F4) is trivial, so a channel S(q) (x) F(-q) summed over the orbit is induced from the trivial group, the regular
//    representation, and holds every irrep, the composite's included. (ii) One exact invariant exists and is not enough:
//    under a pair interaction that reaches each member only through its dock's uniform mode z (a separation-dependent
//    mixer angle, E-SPN-0147's mass string) the both-flat sector F (x) F, F = {z^dag psi_x = 0 and z^dag (S X psi)_x = 0
//    at every dock}, is invariant off contact: the interaction is the identity there and S X keeps F. That closes F-F-
//    and F+F+ dynamically but not S (x) F (the other member's mixer depends on this member's position, a multiplication
//    that breaks F), and S + F- is the open channel. A Coulomb phase (E-SPN-0155) keeps not even F (x) F. (Argued, not
//    run here.) So the route pursued is the schedule, and the answer is 4 and 5.
// 7. THE CANDIDATE: the nearest exact two-beat, from pieces already exact, Pauli-blocked and vacuum-checked: beat A the
//    ring mixer u and the coin (code/rule/swap-mixer), beat B the mixer u, the odd-octet phase v = ringUnit(2, 0) and the
//    coin (code/rule/odd-phase), at the light point u = ringUnit(-1, 4) (m 0.190126, E-SPN-0148's lighter in-ring
//    member). Derived: rho = (2 theta, 0, 0, 0, arg v): K = 0 multiplets 1 + 8 + 15 (S; the octet at arg v = 1.333893,
//    eps 0.953641, inside the flat-safe window (M, 3 M) = (0.380252, 1.140756); D, the transverse Pi4, Pi2 and Pi9 at 0).
//    WHERE THE FLATS GO: when beat A is the mixer alone (G1 = 1 on z^perp), every eigenspace E of G2 with phase lambda and
//    dimension d leaves z^perp inter T E, of dimension at least d - 1, FIXED at lambda (U psi = T G2 T^dag psi = lambda psi):
//    a mixer-only beat keeps at least 24 - (number of distinct phases of G2) - 1 bands flat, wherever the other beat's
//    phases put them. Here: 14 flat at 0 (D's rest; 15 - 1) and 7 flat at arg v (8 - 1), and only S, D and one octet
//    combination move. (The derivation first said the octet disperses; the smoke run, tmp/twob-smoke.log, read 7 of it
//    flat at arg v, and this count was corrected before the gate run.) So the piece LIFTS 7 flats into the safe window
//    and leaves 14 AT D'S REST, the 3 pinned transverse Pi4 states and the 11 of Pi2 and Pi9 that no exact piece here
//    touches. gamma = 0 (the Pi9-Pi4 phase is untouched on both beats; Pi8 is not in the massless pair's K^2 term),
//    R = tan m / m and the singlet isotropic (Pi8 enters the singlet past K^4), speed under c* (probe 6: 0.915 c*,
//    massless 0.989 c*). Census: B* = 0, the first crossing S near 3 M against a flat at -M, at |q| near 0.8 (per beat on
//    the axis arccos(cos m g) = 3 m, g = (1 + cos q) / 2, at q = 0.775).
// 8. WHAT A SCHEDULE DOES TO gamma, c* AND THE SINGLET. The rest phases and the beat split are free, but gamma is not the
//    one-beat's cot((pi + phi9 - phi4) / 2) / 8 averaged over the beats (probe 5, in gamma / c*: Pi9 phases (0.2, 0) give
//    -5.5e-8 with Pi9 moved off D; (0.5, -0.1) give +0.0220 against the average's -0.0181), so a Pi9 phase on beat 1 alone keeps
//    gamma = 0 by giving Pi4 no Pi9 contrast at first order, which is exactly what leaves the transverse states flat.
//    Speeds: no theorem past the moving pair; measured (F1 d).
// 9. THE NEXT ESCAPE. The pin is that the singlet's partner is a VECTOR (Pi4) under W(F4): its transverse partners have
//    no Clifford structure to move with it (5 b). Dirac's way is a SPINOR partner space, where the states degenerate with
//    D at rest are spin partners with D's own dispersion: an ideal Dirac multiplet passes this census with B* = 2 (C4).
//    So the next escape is members carrying a 2T (spin) register with dock pieces covariant under the double cover acting
//    as Clifford generators, H = M beta + K . alpha, {alpha_i, alpha_j} = 2 delta_ij, i.e. a piece that couples the
//    singlet's partner to spinor, not vector, content; a dock-local piece on the 24 slots alone cannot (5 b).
//
// PREDICTED: F1 holds (a to e; 14 flats at D's rest and 7 at arg v), F2 holds, F3 FAILS (the candidate's census B* = 0; no schedule of the family keeping R has
// B* > 0; the hold is not run), F4 FAILS (no level to read), N1 holds (B* = 0 at every cluster point). The instrument and
// every control hold. Verdict fail: no two-beat schedule lifts the flats for a light composite, by the pin.
//
// GATES, fixed before the gate run.
//  F1 ONE BODY, the candidate at the light point (and its massless twin u = -1): (a) EXACT: u and v norm one exactly;
//     the rule's one-vibe matrices of both beats (love and fear, both collision parities) equal the covariant model X
//     (e^(i theta) Pi1 + Pi2 + Pi9 + Pi4 + [v] Pi8) to 1e-12; (b) FLATS AS DERIVED: K = 0 multiplets 1 + 8 + 15, and over
//     64 Weyl momenta exactly two flat levels (to 1e-8): 14 bands at phase 0 (D's rest) and 7 at arg v; (c) gamma: the
//     massless twin's pair (four directions, kappa 0.01) |gamma| / c* <= 1e-9 and |c0 / c* - 1| <= 1e-9; (d) SPEED: the
//     top Hellmann-Feynman speed over 4,096 Weyl momenta and 20 radial ones at most c* (1 + 1e-6), massive and massless;
//     (e) THE SINGLET: along the four directions |R - tan m / m| <= 1e-9 and the K^2 coefficients within 1e-6 of the
//     axis's (relative).
//  F2 THE VACUUM IS INERT, K NEVER FIRES: the exact rule alternating the two beats (code/measure/two-beat twoBeatVacuum)
//     on the empty box (sides 4 and 8) and the love sea (side 4), 128 beats, at the light point, at m = pi/6
//     (ringUnit(0, 4)) and at u = -1: one branch equal to the vacuum with each beat's exact amplitude, no charge, and the
//     collision moves no value.
//  F3 THE CHANNELS CLOSE FOR A LIGHT MEMBER (m 0.190126): (a) the candidate's census (4 directions x 600 steps to 3 pi,
//     256 Weyl momenta) has B* >= 1e-3; or (b) some schedule of the covariant family (16,384 Weyl points: rho = (2 M, t2,
//     t9, 0, t8), beat 1 (a1, a2, a9, 0, a8), beat 2 rho - a) that keeps R = tan m / m to 1e-3 along the axis and the
//     generic direction has B* >= 1e-3 (3 directions x 300 steps); AND for such a schedule the level of E-SPN-0147's mass
//     string holds under E-SPN-0148's witness H. The hold is run only for a schedule passing (a) or (b); if one passes,
//     this run cannot decide F3 and the verdict is partial.
//  F4 R FOR THAT COMPOSITE, against the static model (2 tan m + (5/3) E_b) / (2 m - E_b) (E-SPN-0155 point 4: a static
//     potential cannot give R = 1; the Darwin term's (8/3) E_b is what is missing) and trending toward R_walk: read only
//     on a level from F3; with none, F4 fails.
//  N1 THE CLUSTER NO-GO (5 c): 8 x 1,024 Weyl points of the continuum cluster model (3 directions, p to 29.7 in 149
//     steps): B* = 0 at every point.
// INSTRUMENT (a failure makes the verdict partial). I1 the cycle identity T P2 T P1 = T G2 T^dag G1 (G = X P) for the
//  candidate and three family schedules, 64 momenta, 1e-12. I2 the zone mean of tr U on a 4^4 grid equals the constant
//  term (1/24)(sum n e^(i b))(sum n e^(i a)) to 1e-12, and the eigenvalue sum's mean to 1e-10, on the same four. I3 the
//  doubled one-beat's cycle phases are twice the one-beat's, matched, on 64 momenta to 1e-12. I4 the cycle's massless
//  pair reader on the doubled massless one-beat equals the one-beat's masslessPair (c0 and gamma) to 1e-9. I5 the
//  4-design identity exactly over the 256 index quadruples, and the cluster model's Pi4 block read to 1e-12 (with c14
//  alone: 1/2 and 0; with c49 alone: 1/2 and 1/3).
// CONTROLS (a failure makes the verdict partial). C1 THE ONE-BEAT SCHEDULE REPRODUCES E-SPN-0143 BIT FOR BIT: at theta*
//  m* === 0.04677803444110118, top / c === 0.48817847622126725, R === 1.0007300338253453 (and the one-beat CYCLE's fit
//  gives the same R), c0 / c === 0.5000000000011358; its in-ring schedule (pi, 4 pi/3) through the cycle code: per-beat m
//  === 0.26179938779914924, R === 1.1026577908486987, top / c === 0.4037221140226534 (tmp/univ-exp-run2.log). C2 THE
//  CENSUS CAN PASS: the doubled one-beat at the heavy member (ringUnit(1, 4), m 0.857072) has no crossing and B* / 2
//  within 1e-3 of E-SPN-0155's per-beat distance to the nearest channel (E and E + pi). C3 THE CENSUS CAN FAIL: the
//  doubled one-beat at the light point has crossings. C4 THE CLUSTER CENSUS CAN PASS: the ideal Dirac multiplet has no
//  crossing and B* = 2 to 1e-9. C5 IT SEES THE FAR-SECTOR CROSSING WHERE DERIVED: x = (1, -1, -1, -1, -1), c14 alone:
//  first crossing within one step of p = 4.
// READ, gating nothing: R1 gamma of two-beat Pi9 splits (probe 5's table). R2 the candidate's and the doubled one-beat's
//  census at m = pi/6 (E-SPN-0155's light member).
// Verdict: partial if the instrument or a control fails, or F3's census passes (the hold undecided); pass if F1 to F4
// hold; fail otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (no gate moved after them). tmp/twob-probe1.log: the doubled one-beat census at
//  four masses (heavy B* / 2 0.2867 = E-SPN-0155's DF+ and DD distances; light crossings), which fixed the crossing
//  detector after a first version missed a crossing that landed exactly on a grid point. tmp/twob-probe2-*.log: the
//  cluster census on hand points and a Weyl scan (the gate's N1 plan, larger). tmp/twob-probe3-smoke.log: an
//  unconstrained Weyl scan at the heavy point, every schedule B* = 0. tmp/twob-probe4-*.log: a pattern search (probe
//  only): at pi/6 the doubled one-beat is a local minimum of the crossing count (5); unconstrained, four endpoints reached
//  B* > 0 (0.749, 0.587, 2.3e-4 at the light point, 2.07 at pi/6), every one by draining a beat's mixer contrast (a1
//  near 0 or 2 pi), freezing the singlet: tmp/twob-probe8.log reads their R as 455, 27, -35 and 98 against tan m / m
//  1.012 and 1.103 (point 1), which set F3 (b)'s R constraint; the R-constrained search ends with 41 or more crossings
//  from every start. tmp/twob-probe5.log: the gamma
//  table of point 8. tmp/twob-probe6.log: the candidate on the model (1 + 8 + 15, 14 flat at 0, R - tan m / m 1.4e-12,
//  gamma / c* 1.2e-11, top 0.915 and 0.989 c*, census 116 crossings). tmp/twob-probe7-019.log: 1,024 Weyl schedules at
//  the light point, 21 keep R, all 21 with B* = 0 (which sized F3 (b) at 16,384). tmp/twob-smoke.log: every code path on
//  a small plan (9 s; unconverged, gating nothing): the instrument and C2 to C5 hold (heavy B* / 2 0.286695 against
//  E-SPN-0155's 0.286695; Dirac B* 2 - 5e-14; far first crossing 4.186 at step 0.199), C1 matches every recorded float
//  but top / c, which needs the gate's 4,096 momenta, and F1 (b) read 7 flat octet states (point 7's correction).
//
// FIRST RUN (tmp/twob-exp-run1.log, 869 s): FAIL on F3 and F4, as predicted. The instrument and all five controls hold.
//  F1, F2 and N1 hold. No gate moved and none was rerun.
//  - F1: the rule's matrices equal the model to 1.1e-16; multiplets 1 + 8 + 15; exactly 14 flat at 0 (D's rest) and 7
//    at arg v = 1.333893 on 64 momenta; massless pair c0 = c* to 1e-10, |gamma| / c* at most 1.2e-11; top speed 0.927182 c*
//    massive and 0.99999994 c* massless (reached as K -> 0); R - tan m / m at most 1.4e-12 (tan m / m 1.012226), K^2
//    coefficients isotropic to 1.3e-12.
//  - F2: sides 4 and 8 empty and the side-4 love sea, at the light point, pi/6 and u = -1, 128 beats alternating the two
//    beats: one branch, exact amplitude every beat, no charge, no permutation.
//  - F3 FAILS: the candidate's census has 116 crossings, the first at |q| 0.770 between S at eps 1.148 (3 M = 1.141)
//    and a flat at -0.380 = -M, as derived (point 7). Of 16,384 family schedules 314 keep R = tan m / m to 1e-3 (worst
//    9.9e-4) and all 314 have B* = 0. The hold was not run.
//  - F4 FAILS: no level to read.
//  - N1: 8,192 of 8,192 cluster points with B* = 0 (probe 2's larger scan: 16,000 of 16,000).
//  - C1 holds bit for bit (m, top / c, R one-beat and as a one-beat cycle, c0 / c; the (pi, 4 pi/3) schedule's m, R and
//    top / c). C2: B* / 2 0.286695 against E-SPN-0155's 0.286695, no crossing. C3: 168 crossings. C4: Dirac B* 2 - 5e-14.
//    C5: first crossing 4.186 against 4 (step 0.199).
//  - R1: gamma / c* of Pi9 splits (0.2, 0) -5.5e-8, (0.2, -0.2) -6.7e-13, (0.2, 0.3) -0.0213, (0.5, -0.1) +0.0220 against
//    the one-beat average -0.0089, 0, -0.0222, -0.0182. R2 at pi/6: the candidate 63 crossings, the doubled one-beat 51.
// NEXT. The period is not the obstruction and neither is the ring: the pinned transverse Pi4 states are. The escape is
//  a spinor partner space (point 9): members with a 2T register and pieces acting as Clifford generators, the structure
//  C4 shows passing this census, or a link-level piece that breaks the degree ladder of point 5. A two-beat schedule
//  keeps value as an exact lever on the other flats: one exact odd-octet beat lifted 7 into the safe window at no cost to
//  gamma, R, c* or the vacuum.
//
// Depth L1 (the cycle identity, the band sum, the pin and the Clifford obstruction are mathematics) and L2 (the band
// kinematics of a coined two-beat walk, read off the rule's exact pieces; the cluster scan is numerical evidence).
// DETERMINISM: no random numbers; Weyl sequences, grids and fixed paths. NOTHING MOVES: the pieces hand values between
// slots of one dock, the stream takes each slot's value one dock along.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { bandAt, dockMatrix, DOCK_ROOTS, eigenphases, wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { masslessPair, singletKinematics, singletLevel, weylMomenta } from '@/code/measure/singlet-kinematics'
import { cycleMatrix, cycleMultiplets, cyclePhases, cycleSinglet, fastestCycleBand, ringAngle, type Eis } from '@/code/measure/swap-cone'
import { covariantDock, covariantProjectors } from '@/code/measure/odd-phase'
import { channelGap, pairChannels } from '@/code/measure/husk-meson'
import { overEmpty, ringUnit, unitAngle, unitNormExact, vibeDockExact } from '@/code/measure/swap-string'
import { clusterCensus, clusterMatrix, covariantPhases, cycleFlats, cycleMasslessPair, diracFamily, familyCensus, frameR, pairCensus, radialPaths, restFrame, twoBeatVacuum, type Census } from '@/code/measure/two-beat'
import { OPPOSITE } from '@/code/rule/isometric-knit'

const C = Math.SQRT2
const C_STAR = Math.SQRT1_2
const s2 = Math.SQRT1_2
const s3 = 1 / Math.sqrt(3)
const GENERIC_RAW = [0.29, 0.52, 0.8, 0]
const GENERIC = GENERIC_RAW.map(x => x / Math.hypot(...GENERIC_RAW))
const DIRS: readonly number[][] = [[1, 0, 0, 0], [s2, s2, 0, 0], [s3, s3, s3, 0], GENERIC]
const SCAN_DIRS: readonly number[][] = [[1, 0, 0, 0], [s3, s3, s3, 0], GENERIC]
const RADII: readonly number[] = [1e-3, 1e-2, 0.1, 0.3, 1]
const SCALES: readonly number[] = [0.1, 0.2, 0.3, 0.4, 0.5]
// the light point, E-SPN-0148's lighter in-ring member; pi/6; the massless twin; the heavy member (E-SPN-0155); the
// candidate's odd-octet unit
const LIGHT: readonly [number, number] = [-1, 4]
const SIXTH: readonly [number, number] = [0, 4]
const MASSLESS: readonly [number, number] = [0, 3]
const HEAVY: readonly [number, number] = [1, 4]
const OCTET: readonly [number, number] = [2, 0]
// E-SPN-0143's recorded floats (tmp/univ-exp-run2.log) and its ring prime
const PRIME: Eis = [3n, 1n]
const REC = { mStar: 0.04677803444110118, topOverC: 0.48817847622126725, RStar: 1.0007300338253453, c0OverC: 0.5000000000011358, schedM: 0.26179938779914924, schedR: 1.1026577908486987, schedTopOverC: 0.4037221140226534 }
const SWAP_N = 2 / 3
const MATRIX_TOLERANCE = 1e-12
const FLAT_TOLERANCE = 1e-8
const GAMMA_TOLERANCE = 1e-9
const SPEED_TOLERANCE = 1e-6
const R_EXACT = 1e-9
const ISOTROPY = 1e-6
const R_KEEP = 1e-3
const WINDOW = 1e-3
const PAIR_KAPPA = 0.01
const IDENTITY_TOLERANCE = 1e-12
const TRACE_TOLERANCE = 1e-12
const SUM_TOLERANCE = 1e-10
const PAIR_READER = 1e-9
const C2_TOLERANCE = 1e-3
const DIRAC_TOLERANCE = 1e-9
const GRID = 4
const GRID_OFFSET = [0.1, 0.2, 0.3, 0.4]
const N_SECTOR = [1, 2, 9, 4, 8]

export type TwoBeatPlan = { momenta: number; flatSample: number; censusSteps: number; scanSteps: number; family: number; cluster: number; clusterSteps: number; clusterP: number; vacuumBeats: number; vacuumSides: readonly number[]; checkMomenta: number }

export const GATE_PLAN: TwoBeatPlan = { momenta: 4096, flatSample: 64, censusSteps: 600, scanSteps: 300, family: 16384, cluster: 1024, clusterSteps: 149, clusterP: 29.7, vacuumBeats: 128, vacuumSides: [4, 8], checkMomenta: 64 }

const flag = (b: boolean): number => (b ? 1 : 0)
const R = DOCK_ROOTS

export default experiment({
  id: 'spin/swap-two-beat',
  code: 'E-SPN-0159',
  title:
    'no covariant two-beat schedule (of any period) closes the flat-band channel for a light composite, fail (F3, F4): the cycle is exactly T G2 T^dag G1, so the band sum keeps a constant term and every projector rest phase is free, but the singlet partner D rests in the irreducible vector Pi4, pinning three transverse states at D rest in every covariant schedule, and by the 4-design identity their only first-order partner Pi9 carries them at most sqrt(2/3) of the longitudinal speed, so S + transverse reaches the threshold (proved for far sectors and for one common speed, 8,192 of 8,192 continuum cluster points and 314 of 314 R-keeping lattice schedules at m 0.190126 open); the exact candidate (ring mixer, then mixer plus odd-octet phase, Z[w][1/42]) keeps gamma to 1e-11, R = tan m/m to 1e-12, isotropy to 1e-12, every speed under c* and the vacuum exact, and lifts 7 flats into the safe window while 14 stay at D rest; the one-beat schedule reproduces E-SPN-0143 bit for bit; the next escape is a spinor (Clifford) partner space, which an ideal Dirac multiplet shows passes the census',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return swapTwoBeatRun(GATE_PLAN)
  },
})

// the Weyl points of the family (7 parameters: t2, t9, t8, a1, a2, a9, a8), additive recurrence on 1 / phi_8^k
function familyPoints(count: number, M: number): { a: number[]; b: number[] }[] {
  let phi = 1.5

  for (let i = 0; i < 64; i++) phi = phi - (phi ** 8 - phi - 1) / (8 * phi ** 7 - 1)

  const alpha = [1, 2, 3, 4, 5, 6, 7].map(k => 1 / phi ** k)

  return Array.from({ length: count }, (_, j) => {
    const u = alpha.map(x => 2 * Math.PI * (((0.5 + (j + 1) * x) % 1) - 0.5))
    const rho = [2 * M, u[0] as number, u[1] as number, 0, u[2] as number]
    const a = [u[3] as number, u[4] as number, u[5] as number, 0, u[6] as number]

    return { a, b: rho.map((r, k) => r - (a[k] as number)) }
  })
}

// the Weyl points of the cluster scan (6 parameters: x2, x9, x8, c49, c98, c28), on 1 / phi_7^k
function clusterPoints(count: number, pattern: number): { x: number[]; c: number[] }[] {
  let phi = 1.5

  for (let i = 0; i < 64; i++) phi = phi - (phi ** 7 - phi - 1) / (7 * phi ** 6 - 1)

  const alpha = [1, 2, 3, 4, 5, 6].map(k => 1 / phi ** k)

  return Array.from({ length: count }, (_, j) => {
    const u = alpha.map(a => (0.5 + (j + 1) * a) % 1)

    return {
      x: [1, -6 + 12 * (u[0] as number), -6 + 12 * (u[1] as number), -1, -6 + 12 * (u[2] as number)],
      c: [1, pattern & 1 ? 3 * (u[3] as number) : 0, pattern & 2 ? 3 * (u[4] as number) : 0, pattern & 4 ? 3 * (u[5] as number) : 0],
    }
  })
}

// G = X P for a covariant dock matrix P = X G (row-major [to][from]; X sends slot d to its opposite)
function uncoin(P: CMatrix): CMatrix {
  const re = new Float64Array(576)
  const im = new Float64Array(576)

  for (let i = 0; i < 24; i++) {
    const o = OPPOSITE[i] as number

    for (let j = 0; j < 24; j++) {
      re[i * 24 + j] = P.re[o * 24 + j] as number
      im[i * 24 + j] = P.im[o * 24 + j] as number
    }
  }

  return { re, im }
}

// T G2 T^dag G1 at K
function conjugatedCycle(G1: CMatrix, G2: CMatrix, K: readonly number[]): CMatrix {
  const ph = R.map(r => -r.reduce((s, x, k) => s + x * (K[k] as number), 0))
  const re = new Float64Array(576)
  const im = new Float64Array(576)
  // A = T G2 T^dag: A_ij = e^(i (ph_i - ph_j)) G2_ij
  const Ar = new Float64Array(576)
  const Ai = new Float64Array(576)

  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 24; j++) {
      const t = (ph[i] as number) - (ph[j] as number)
      const c = Math.cos(t)
      const s = Math.sin(t)
      const gr = G2.re[i * 24 + j] as number
      const gi = G2.im[i * 24 + j] as number

      Ar[i * 24 + j] = c * gr - s * gi
      Ai[i * 24 + j] = c * gi + s * gr
    }
  }

  for (let i = 0; i < 24; i++) {
    for (let k = 0; k < 24; k++) {
      const ar = Ar[i * 24 + k] as number
      const ai = Ai[i * 24 + k] as number

      for (let j = 0; j < 24; j++) {
        const br = G1.re[k * 24 + j] as number
        const bi = G1.im[k * 24 + j] as number

        re[i * 24 + j]! += ar * br - ai * bi
        im[i * 24 + j]! += ar * bi + ai * br
      }
    }
  }

  return { re, im }
}

// the zone mean of tr U and of the eigenvalue sum over a G^4 grid, against the derived constant term
function bandSum(Ps: readonly CMatrix[], a: readonly number[], b: readonly number[]): { trace: number; sum: number } {
  const sa = a.reduce<[number, number]>((s, x, k) => [s[0] + (N_SECTOR[k] as number) * Math.cos(x), s[1] + (N_SECTOR[k] as number) * Math.sin(x)], [0, 0])
  const sb = b.reduce<[number, number]>((s, x, k) => [s[0] + (N_SECTOR[k] as number) * Math.cos(x), s[1] + (N_SECTOR[k] as number) * Math.sin(x)], [0, 0])
  const want: [number, number] = [(sa[0] * sb[0] - sa[1] * sb[1]) / 24, (sa[0] * sb[1] + sa[1] * sb[0]) / 24]
  let tr: [number, number] = [0, 0]
  let ev: [number, number] = [0, 0]
  let n = 0

  for (let i0 = 0; i0 < GRID; i0++) {
    for (let i1 = 0; i1 < GRID; i1++) {
      for (let i2 = 0; i2 < GRID; i2++) {
        for (let i3 = 0; i3 < GRID; i3++) {
          const K = [i0, i1, i2, i3].map((j, k) => (2 * Math.PI * j) / GRID + (GRID_OFFSET[k] as number))
          const U = cycleMatrix(Ps, R, K)
          const e = complexEigenvalues({ re: U.re, im: U.im, n: 24 })

          for (let d = 0; d < 24; d++) tr = [tr[0] + (U.re[d * 24 + d] as number), tr[1] + (U.im[d * 24 + d] as number)]
          e.re.forEach((x, k) => {
            ev = [ev[0] + x, ev[1] + (e.im[k] as number)]
          })
          n++
        }
      }
    }
  }

  return { trace: Math.hypot(tr[0] / n - want[0], tr[1] / n - want[1]), sum: Math.hypot(ev[0] / n - want[0], ev[1] / n - want[1]) }
}

// the doubled one-beat's cycle phases against twice the one-beat's, matched greedily on the circle
function doubledGap(P: CMatrix, K: readonly number[]): number {
  const one = eigenphases(P, R, K).map(x => wrap(2 * x))
  const two = cyclePhases([P, P], R, K)
  const used = new Uint8Array(24)
  let worst = 0

  for (const x of two) {
    let best = -1

    for (let j = 0; j < 24; j++) if (!used[j] && (best < 0 || Math.abs(wrap(x - (one[j] as number))) < Math.abs(wrap(x - (one[best] as number))))) best = j
    used[best] = 1
    worst = Math.max(worst, Math.abs(wrap(x - (one[best] as number))))
  }

  return worst
}

export function swapTwoBeatRun(plan: TwoBeatPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const p = covariantProjectors()
  const uL = ringUnit(LIGHT[0], LIGHT[1])
  const u6 = ringUnit(SIXTH[0], SIXTH[1])
  const uZ = ringUnit(MASSLESS[0], MASSLESS[1])
  const uH = ringUnit(HEAVY[0], HEAVY[1])
  const v = ringUnit(OCTET[0], OCTET[1])
  const thetaL = unitAngle(uL)
  const theta6 = unitAngle(u6)
  const thetaH = unitAngle(uH)
  const alpha = unitAngle(v)
  const mOf = (theta: number): number => wrap(theta - Math.PI) / 2
  const mL = mOf(thetaL)
  const m6 = mOf(theta6)
  const mH = mOf(thetaH)
  const radial = DIRS.flatMap(u => RADII.map(r => u.map(x => x * r)))
  const weyl = weylMomenta(plan.momenta)
  const check = weylMomenta(plan.checkMomenta)
  const candidate = (theta: number): CMatrix[] => [covariantDock(p, [theta, 0, 0, 0, 0]), covariantDock(p, [theta, 0, 0, 0, alpha])]
  const PL = candidate(thetaL)
  const PZ = candidate(Math.PI)
  const censusPaths = radialPaths(DIRS, 3 * Math.PI, plan.censusSteps)
  const scanPaths = radialPaths(SCAN_DIRS, 3 * Math.PI, plan.scanSteps)

  // ---------------- C1: E-SPN-0143 bit for bit ----------------
  const star = ringAngle(PRIME, 3)
  const thetaStar = Math.PI + star.delta
  const P0 = dockMatrix(Math.PI, SWAP_N, true)
  const c0 = masslessPair(P0, R, 13, DIRS[0] as number[], PAIR_KAPPA).c0
  const mainMomenta = [...weyl, ...radial]
  const sideMomenta = [...weyl.slice(0, 1024), ...radial]
  let starTop = 0

  for (const hole of [true, false]) {
    const P = dockMatrix(thetaStar, SWAP_N, hole)

    for (const K of mainMomenta) starTop = Math.max(starTop, ...bandAt(P, R, K).velocity.map(x => Math.hypot(...x)))
  }

  const PS = dockMatrix(thetaStar, SWAP_N, true)
  const levelS = singletLevel(PS, R, 12)
  const starR = (c0 * c0) / singletKinematics(PS, R, levelS, DIRS[0] as number[], SCALES).c2
  const starCycleR = (c0 * c0) / cycleSinglet([PS], R, DIRS[0] as number[], SCALES).c2
  const schedule = [dockMatrix(Math.PI, SWAP_N, true), dockMatrix((4 * Math.PI) / 3, SWAP_N, true)]
  const schedTop = fastestCycleBand(schedule, R, sideMomenta).speed
  const schedFit = cycleSinglet(schedule, R, DIRS[0] as number[], SCALES)
  const c1 = {
    m: levelS.m,
    top: starTop / C,
    R: starR,
    cycleR: starCycleR,
    c0: c0 / C,
    schedM: schedFit.m,
    schedR: (c0 * c0) / schedFit.c2,
    schedTop: schedTop / C,
  }
  const C1 = c1.m === REC.mStar && c1.top === REC.topOverC && c1.R === REC.RStar && c1.cycleR === REC.RStar && c1.c0 === REC.c0OverC && c1.schedM === REC.schedM && c1.schedR === REC.schedR && c1.schedTop === REC.schedTopOverC

  log('C1')

  // ---------------- I1, I2: the cycle identity and the band sum ----------------
  const fam = familyPoints(plan.family, 2 * mL)
  const idSchedules: { name: string; a: number[]; b: number[] }[] = [{ name: 'candidate', a: [thetaL, 0, 0, 0, 0], b: [thetaL, 0, 0, 0, alpha] }, ...fam.slice(0, 3).map((x, i) => ({ name: `family ${i}`, ...x }))]
  let identityGap = 0
  const sums = idSchedules.map(s => {
    const Ps = [covariantDock(p, s.a), covariantDock(p, s.b)]
    const G1 = uncoin(Ps[0] as CMatrix)
    const G2 = uncoin(Ps[1] as CMatrix)

    for (const K of check) {
      const A = cycleMatrix(Ps, R, K)
      const B = conjugatedCycle(G1, G2, K)

      for (let i = 0; i < 576; i++) identityGap = Math.max(identityGap, Math.hypot((A.re[i] as number) - (B.re[i] as number), (A.im[i] as number) - (B.im[i] as number)))
    }

    return { name: s.name, ...bandSum(Ps, s.a, s.b) }
  })
  const I1 = identityGap <= IDENTITY_TOLERANCE
  const I2 = sums.every(s => s.trace <= TRACE_TOLERANCE && s.sum <= SUM_TOLERANCE)

  log('I1 I2')

  // ---------------- I3, I4: the doubled one-beat ----------------
  const oneL = covariantDock(p, [thetaL, 0, 0, 0, 0])
  const doubled = Math.max(...check.map(K => doubledGap(oneL, K)))
  const I3 = doubled <= IDENTITY_TOLERANCE
  const oneZ = covariantDock(p, [Math.PI, 0, 0, 0, 0])
  const readers = DIRS.map(u => {
    const a = masslessPair(oneZ, R, 13, u, PAIR_KAPPA)
    const b = cycleMasslessPair([oneZ, oneZ], 0, u, PAIR_KAPPA)

    return Math.max(Math.abs(a.c0 - b.c0), Math.abs(a.gamma - b.gamma))
  })
  const I4 = readers.every(x => x <= PAIR_READER)

  log('I3 I4')

  // ---------------- I5: the 4-design identity and the Pi4 block ----------------
  let design = true

  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      for (let c = 0; c < 4; c++) {
        for (let e = 0; e < 4; e++) {
          const sum = R.reduce((s, r) => s + (r[a] as number) * (r[b] as number) * (r[c] as number) * (r[e] as number), 0)
          const want = 4 * ((a === b ? 1 : 0) * (c === e ? 1 : 0) + (a === c ? 1 : 0) * (b === e ? 1 : 0) + (a === e ? 1 : 0) * (b === c ? 1 : 0))

          if (sum !== want) design = false
        }
      }
    }
  }

  const blockOf = (c: readonly number[], u: readonly number[], w: readonly number[]): number => {
    const A = clusterMatrix(p, [0, 0, 0, 0, 0], c, u)
    const e = R.map(r => r.reduce((s, x, k) => s + x * (w[k] as number), 0) / Math.sqrt(12))
    const Ae = A.map(row => row.reduce((s, x, j) => s + x * (e[j] as number), 0))

    return Ae.reduce((s, x) => s + x * x, 0)
  }
  const unit = (w: readonly number[]): number[] => w.map(x => x / Math.hypot(...w))
  const Kh = GENERIC
  // a direction perpendicular to the generic one
  const perp = unit([0.52, -0.29, 0, 0.1].map((x, k) => x - (GENERIC[k] as number) * [0.52, -0.29, 0, 0.1].reduce((s, y, j) => s + y * (GENERIC[j] as number), 0)))
  const block = {
    oneL: blockOf([1, 0, 0, 0], Kh, Kh),
    oneT: blockOf([1, 0, 0, 0], Kh, perp),
    nineL: blockOf([0, 1, 0, 0], Kh, Kh),
    nineT: blockOf([0, 1, 0, 0], Kh, perp),
  }
  const I5 = design && Math.abs(block.oneL - 0.5) <= MATRIX_TOLERANCE && Math.abs(block.oneT) <= MATRIX_TOLERANCE && Math.abs(block.nineL - 0.5) <= MATRIX_TOLERANCE && Math.abs(block.nineT - 1 / 3) <= MATRIX_TOLERANCE

  log('I5')

  // ---------------- F1: the candidate, one body ----------------
  let ruleGap = 0

  for (const [u, theta] of [
    [uL, thetaL],
    [uZ, Math.PI],
  ] as const) {
    const models = candidate(theta)

    for (const vibe of [1, -1] as const) {
      for (const beat of [0, 1]) {
        const A = overEmpty(vibeDockExact(vibe, beat, u), u)
        const B = overEmpty(vibeDockExact(vibe, beat, u, v), u, v)

        for (let i = 0; i < 576; i++) {
          ruleGap = Math.max(ruleGap, Math.hypot((A.re[i] as number) - ((models[0] as CMatrix).re[i] as number), (A.im[i] as number) - ((models[0] as CMatrix).im[i] as number)))
          ruleGap = Math.max(ruleGap, Math.hypot((B.re[i] as number) - ((models[1] as CMatrix).re[i] as number), (B.im[i] as number) - ((models[1] as CMatrix).im[i] as number)))
        }
      }
    }
  }

  const F1a = unitNormExact(uL) && unitNormExact(uZ) && unitNormExact(v) && ruleGap <= MATRIX_TOLERANCE
  const restL = covariantPhases(PL, p)
  const multiplets = cycleMultiplets(PL, R)
  const sizes = multiplets.map(x => x.size).sort((a, b) => a - b).join('+')
  const flats = cycleFlats(PL, check.slice(0, plan.flatSample), FLAT_TOLERANCE)
  const flatAt = (phase: number): number => flats.filter(f => Math.abs(wrap(f.phase - phase)) <= FLAT_TOLERANCE).reduce((s, f) => s + f.count, 0)
  const F1b = sizes === '1+8+15' && flats.length === 2 && flatAt(0) === 14 && flatAt(alpha) === 7
  const pairs = DIRS.map(u => cycleMasslessPair(PZ, 0, u, PAIR_KAPPA))
  const F1c = pairs.every(x => Math.abs(x.gamma) / C_STAR <= GAMMA_TOLERANCE && Math.abs(x.c0 / C_STAR - 1) <= GAMMA_TOLERANCE)

  log('F1 a b c')

  const top = fastestCycleBand(PL, R, mainMomenta).speed / C_STAR
  const topZ = fastestCycleBand(PZ, R, mainMomenta).speed / C_STAR
  const F1d = top <= 1 + SPEED_TOLERANCE && topZ <= 1 + SPEED_TOLERANCE

  log('F1 d')

  const frameL = restFrame(restL[0] as number, restL[3] as number, 2 * mL)
  const fits = DIRS.map(u => frameR(PL, frameL, restL[0] as number, u, C_STAR, SCALES))
  const tanL = Math.tan(mL) / mL
  const isotropy = Math.max(...fits.map(x => Math.abs(x.c2 / (fits[0] as { c2: number }).c2 - 1)))
  const F1e = fits.every(x => Math.abs(x.R - tanL) <= R_EXACT) && isotropy <= ISOTROPY
  const F1 = F1a && F1b && F1c && F1d && F1e
  const octetEps = frameL.sign * -wrap((restL[4] as number) - frameL.mid)

  log('F1 e')

  // ---------------- F2: the vacuum ----------------
  const vacuum = [
    { name: 'light', u: uL },
    { name: 'pi/6', u: u6 },
    { name: 'massless', u: uZ },
  ].flatMap(x => [...plan.vacuumSides.map(side => ({ side, sea: 0 })), { side: 4, sea: 1 }].map(({ side, sea }) => ({ name: x.name, ...twoBeatVacuum(x.u, v, side, sea, plan.vacuumBeats) })))
  const F2 = vacuum.every(x => x.exact && x.permutes === 0 && x.charged === 0)

  log('F2')

  // ---------------- F3: the channels at the light point ----------------
  const censusL = pairCensus(PL, frameL, censusPaths, weyl.slice(0, 256))
  const F3a = censusL.Bstar >= WINDOW

  log('F3 a')

  const rWalk = tanL
  let familyValid = 0
  let familyOpen = 0
  let familyBest = 0
  let familyRWorst = 0

  for (const s of fam) {
    const Ps = [covariantDock(p, s.a), covariantDock(p, s.b)]
    const f = restFrame(4 * mL, 0, 2 * mL)
    const Rs = [SCAN_DIRS[0], SCAN_DIRS[2]].map(u => frameR(Ps, f, 4 * mL, u as number[], C_STAR, SCALES).R)

    if (Rs.some(x => !(Math.abs(x / rWalk - 1) <= R_KEEP))) continue
    familyValid++
    familyRWorst = Math.max(familyRWorst, ...Rs.map(x => Math.abs(x / rWalk - 1)))

    const c = pairCensus(Ps, f, scanPaths, [])

    if (c.Bstar === 0) familyOpen++
    familyBest = Math.max(familyBest, c.Bstar)
  }

  const F3b = familyBest >= WINDOW
  const censusPasses = F3a || F3b
  // the hold is run only for a schedule passing (a) or (b); none is expected, and one passing leaves F3 undecided here
  const F3 = false

  log('F3 b')

  // ---------------- F4: R of a composite (needs a level from F3) ----------------
  const F4 = false

  // ---------------- N1: the cluster scan ----------------
  let clusterPoints_ = 0
  let clusterOpen = 0
  let clusterBest = { Bstar: 0, x: [] as number[], c: [] as number[] }

  for (let pattern = 0; pattern < 8; pattern++) {
    for (const q of clusterPoints(plan.cluster, pattern)) {
      const r = clusterCensus(p, q.x, q.c, SCAN_DIRS, plan.clusterP, plan.clusterSteps)

      clusterPoints_++
      if (r.Bstar === 0) clusterOpen++
      if (r.Bstar > clusterBest.Bstar) clusterBest = { Bstar: r.Bstar, x: q.x, c: q.c }
    }
  }

  const N1 = clusterOpen === clusterPoints_

  log('N1')

  // ---------------- controls C2 to C5 ----------------
  const oneH = covariantDock(p, [thetaH, 0, 0, 0, 0])
  const restH = covariantPhases([oneH, oneH], p)
  const censusH = pairCensus([oneH, oneH], restFrame(restH[0] as number, restH[3] as number, 2 * mH), censusPaths, weyl.slice(0, 256))
  const heavyGap = Math.min(channelGap(2 * mH, pairChannels(mH), ['SS']).distance, channelGap(2 * mH + Math.PI, pairChannels(mH), ['SS']).distance)
  const C2 = censusH.crossings === 0 && Math.abs(censusH.Bstar / 2 - heavyGap) <= C2_TOLERANCE
  const restD = covariantPhases([oneL, oneL], p)
  const censusD = pairCensus([oneL, oneL], restFrame(restD[0] as number, restD[3] as number, 2 * mL), censusPaths, [])
  const C3 = censusD.crossings > 0
  const dirac = diracFamily(SCAN_DIRS)
  const diracCensus = familyCensus(dirac.B, dirac.As, plan.clusterP, plan.clusterSteps)
  const C4 = diracCensus.crossings === 0 && Math.abs(diracCensus.Bstar - 2) <= DIRAC_TOLERANCE
  const far = clusterCensus(p, [1, -1, -1, -1, -1], [1, 0, 0, 0], SCAN_DIRS, plan.clusterP, plan.clusterSteps)
  const step = plan.clusterP / plan.clusterSteps
  const C5 = far.crossings > 0 && Math.abs(far.first - 4) <= step

  log('C2 to C5')

  // ---------------- reads ----------------
  const gammaTable = [
    [0.2, 0],
    [0.2, -0.2],
    [0.2, 0.3],
    [0.5, -0.1],
  ].map(([b1, b2]) => {
    const Ps = [covariantDock(p, [Math.PI, 0, b1 as number, 0, 0]), covariantDock(p, [Math.PI, 0, b2 as number, 0, 0])]
    const r = cycleMasslessPair(Ps, 0, DIRS[0] as number[], PAIR_KAPPA)

    return { b1: b1 as number, b2: b2 as number, gamma: r.gamma / C_STAR, size: r.size, average: (1 / Math.tan((Math.PI + (b1 as number)) / 2) / 8 + 1 / Math.tan((Math.PI + (b2 as number)) / 2) / 8) / 2 / C_STAR }
  })
  const P6 = candidate(theta6)
  const rest6 = covariantPhases(P6, p)
  const census6 = pairCensus(P6, restFrame(rest6[0] as number, rest6[3] as number, 2 * m6), censusPaths, [])
  const one6 = covariantDock(p, [theta6, 0, 0, 0, 0])
  const rest6d = covariantPhases([one6, one6], p)
  const census6d = pairCensus([one6, one6], restFrame(rest6d[0] as number, rest6d[3] as number, 2 * m6), censusPaths, [])

  log('reads')

  const instrument = I1 && I2 && I3 && I4 && I5
  const controls = C1 && C2 && C3 && C4 && C5
  const status = !instrument || !controls || censusPasses ? 'partial' : F1 && F2 && F3 && F4 ? 'pass' : 'fail'
  const censusLine = (c: Census): string => `B* ${c.Bstar.toExponential(3)}, crossings ${c.crossings}, first crossing at |q| ${c.first.q.toFixed(4)} (pair eps ${c.first.pair.map(x => x.toFixed(4)).join(', ')}), nearest below at |q| ${Math.hypot(...c.at).toFixed(4)} (pair ${c.pair.map(x => x.toFixed(4)).join(', ')})`

  return verdict({
    status,
    claim: `F1 ${F1} (a ${F1a}, b ${F1b}: multiplets ${sizes}, flats ${flats.map(f => `${f.phase.toFixed(9)}x${f.count}`).join(' ')}; c ${F1c}; d ${F1d}: top ${top.toFixed(6)} c*, massless ${topZ.toFixed(6)} c*; e ${F1e}); F2 ${F2}; F3 ${F3} (a ${F3a}: ${censusLine(censusL)}; b ${F3b}: ${familyValid} of ${plan.family} keep R, ${familyOpen} of them B* = 0, best ${familyBest.toExponential(3)}; hold not run); F4 ${F4} (no level); N1 ${N1} (${clusterOpen} of ${clusterPoints_} with B* = 0, best ${clusterBest.Bstar.toExponential(3)}); controls C1 ${C1} C2 ${C2} C3 ${C3} C4 ${C4} C5 ${C5}`,
    metrics: {
      F1: flag(F1),
      F1a: flag(F1a),
      F1b: flag(F1b),
      F1c: flag(F1c),
      F1d: flag(F1d),
      F1e: flag(F1e),
      F2: flag(F2),
      F3: flag(F3),
      F3a: flag(F3a),
      F3b: flag(F3b),
      F4: flag(F4),
      N1: flag(N1),
      instrument: flag(instrument),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      I4: flag(I4),
      I5: flag(I5),
      C1: flag(C1),
      C2: flag(C2),
      C3: flag(C3),
      C4: flag(C4),
      C5: flag(C5),
      mLight: mL,
      octetEps,
      ruleGap,
      top,
      topMassless: topZ,
      gammaMax: Math.max(...pairs.map(x => Math.abs(x.gamma) / C_STAR)),
      RdefectMax: Math.max(...fits.map(x => Math.abs(x.R - tanL))),
      isotropy,
      censusBstar: censusL.Bstar,
      censusCrossings: censusL.crossings,
      firstCrossingQ: censusL.first.q,
      familyValid,
      familyOpen,
      familyBest,
      familyRWorst,
      clusterPoints: clusterPoints_,
      clusterOpen,
      clusterBest: clusterBest.Bstar,
      heavyBstarHalf: censusH.Bstar / 2,
      heavyGap,
      lightDoubledCrossings: censusD.crossings,
      diracBstar: diracCensus.Bstar,
      farFirst: far.first,
      identityGap,
      doubled,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: flag(C1), C2: flag(C2), C3: flag(C3), C4: flag(C4), C5: flag(C5), instrument: flag(instrument) },
    notes: `L1 and L2. Units: light u = ringUnit(${LIGHT.join(', ')}) m ${mL.toFixed(6)}, pi/6 m ${m6.toFixed(6)}, heavy m ${mH.toFixed(6)}, v = ringUnit(${OCTET.join(', ')}) arg ${alpha.toFixed(6)}. C1: m ${c1.m}, top/c ${c1.top}, R ${c1.R}, cycle R ${c1.cycleR}, c0/c ${c1.c0}; schedule m ${c1.schedM}, R ${c1.schedR}, top/c ${c1.schedTop}. I1: identity gap ${identityGap.toExponential(2)}; I2: ${sums.map(s => `${s.name} trace ${s.trace.toExponential(1)} sum ${s.sum.toExponential(1)}`).join('; ')}; I3: doubled gap ${doubled.toExponential(2)}; I4: readers ${readers.map(x => x.toExponential(1)).join(' ')}; I5: design ${design}, Pi4 block c14 ${block.oneL.toFixed(12)} / ${block.oneT.toExponential(1)}, c49 ${block.nineL.toFixed(12)} / ${block.nineT.toFixed(12)}. F1: rule against model ${ruleGap.toExponential(2)}; rest ${restL.map(x => x.toFixed(6)).join(' ')}; multiplets ${multiplets.map(x => `${x.center.toFixed(6)}x${x.size}`).join(' ')}; octet eps ${octetEps.toFixed(6)} (window ${frameL.M.toFixed(6)} to ${(3 * frameL.M).toFixed(6)}); massless pair ${pairs.map(x => `size ${x.size} c0/c* ${(x.c0 / C_STAR).toFixed(10)} gamma/c* ${(x.gamma / C_STAR).toExponential(2)}`).join(', ')}; R - tan m/m ${fits.map(x => (x.R - tanL).toExponential(2)).join(' ')} (tan m/m ${tanL.toFixed(9)}), K^2 coefficients ${fits.map(x => x.c2.toFixed(12)).join(' ')}. F2: ${vacuum.map(x => `${x.name} side ${x.side} ${x.sea ? 'sea' : 'empty'} exact ${x.exact} permutes ${x.permutes} charged ${x.charged}`).join('; ')}. F3 (b): R kept worst ${familyRWorst.toExponential(2)}. N1: best ${clusterBest.Bstar.toExponential(3)} at x ${clusterBest.x.map(x => x.toFixed(3)).join(' ')} c ${clusterBest.c.map(x => x.toFixed(3)).join(' ')}. C2: heavy ${censusLine(censusH)}, B*/2 ${(censusH.Bstar / 2).toFixed(6)} against E-SPN-0155's ${heavyGap.toFixed(6)}. C3: light doubled ${censusLine(censusD)}. C4: Dirac B* ${diracCensus.Bstar}, crossings ${diracCensus.crossings}. C5: far first crossing p ${far.first.toFixed(4)} (step ${step.toFixed(4)}). R1 gamma/c* of Pi9 splits (b1, b2): ${gammaTable.map(g => `(${g.b1}, ${g.b2}) size ${g.size} gamma ${g.gamma.toExponential(3)} one-beat average ${g.average.toExponential(3)}`).join('; ')}. R2 pi/6: candidate ${censusLine(census6)}; doubled one-beat ${censusLine(census6d)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
