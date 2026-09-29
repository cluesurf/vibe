// A MASS STRING ON THE SWAP-COIN RULE: DOES CARRYING THE SEPARATION COST IN THE MIXER ANGLE CLOSE THE FLAT-BAND CHANNEL
// THAT MADE E-SPN-0146's COMPOSITE A RESONANCE (E-SPN-0147)? E-SPN-0146 (swap-string-meson) bound the love-fear meson on
// the empty mesh (the exact particle-hole image of a hole pair on the love sea) with the swap coin, the 24-slot mixer at
// member mass m0 = pi/6 and a diagonal PHASE string (sigma = 0.093556 a unit of d4 string length V). A level formed at the
// predicted energy, isotropic to 9.5e-9, R = 1.027, but it leaked (window 0.9956 over 256 beats), its profile flattening
// at V ~ 2 m0 / sigma = 11 where a member drops into its 12-fold partner multiplet. The proposal read from that failure:
// carry the cost in the members' mass, theta = pi + 2 m(V), m growing with V. This file derives what that piece does,
// then runs it with E-SPN-0146's witness.
//
// DERIVED BEFORE THE RUN (the machinery: code/measure/swap-string setMassString, massUnits, radialWell; code/measure/
// meson-pool; energies eps in E-SPN-0146's units, eps = phase - mid0 per member, mid0 = pi + m0 the free member's
// midpoint, a pair's eps the sum; the singlet's eps grows with its mixer angle, so a rising angle is a cost).
// 1. THE PIECE. At every beat both vibes take the one-vibe dock matrix of the mixer unit u(V), V = d4Steps(x_love -
//    x_fear) read before the stream (a store: V = 0), in place of E-SPN-0146's fixed u0 and its phase e^(-i sigma V). The
//    contact map (V = 0) is E-SPN-0146's. IT IS AS NONLOCAL AS THE PHASE STRING'S STAND-IN, AND HAS NO LOCAL READING THE
//    PHASE STRING HAS. A member's dock cannot know V: V is a function of both positions, and its one-beat change
//    d4Steps(y + r) - d4Steps(y) in {-1, 0, 1} depends on the direction of y, so no counter the member carries and updates
//    from its own step can track it. A link field (a chain of string links whose ends move with the members, a unit on
//    each) makes the LENGTH a local sum along the chain, which is what a phase string's local reading is (energy stored
//    on the links, E-SPN-0131 point 4); a mass needs that sum AT the member's dock, which is the whole chain read at one
//    end. A per-dock count the string leaves behind (links ending at a dock) is bounded by 24 and cannot grow with V. So
//    the mass string is a stated separation cost read from both charges at once, like E-SPN-0146's, and strictly less
//    local than the phase string it replaces.
// 2. EXACTNESS AND THE SCHEDULE. The mixer's hop (u - 1)/24 is exact only for u a norm-one element of Z[w][1/42]
//    (E-SPN-0143 point 8): angles k alpha + j pi/3, alpha = arccos(11/14). So m(V) is quantized: u(V) = w^2 rho^min(V,
//    cap), rho = ((3 + w^2)/(3 + w))^6 w^4 (ringUnit(-6, 4), angle tau = 2 sigma = 0.187112, the square of E-SPN-0146's
//    string unit with the cost's sign), cap = 10: m(V) = pi/6 + sigma min(V, 10), from 0.523599 to 1.459159, u(V) exact with
//    denominator 7^(6 min(V, 10)) (7^60 at the cap). The cap is forced: the angle cannot pass theta = 2 pi (m = pi/2),
//    where the mixer is the identity and the singlet falls into the OTHER flat multiplet (see 4). Why tau = 2 sigma and
//    not less: point 5.
// 3. REACH AND THE VACUUM. The piece changes only the mixer's angle; it adds no hop and no move, the stream still takes
//    each vibe one root a beat, so the support front is the stringless rule's. Every member band at every angle is under
//    sin(theta/2) c* <= c* (E-SPN-0143's theorem holds at each fixed theta; a composite's Hellmann-Feynman speed is the
//    weight mean of (r_l + r_f)/2 and is not bounded by c* by any theorem, so Z3 measures it). The vacuum holds no
//    charge, so the piece reads nothing; and at ANY angle an empty dock takes S = 24 den and a full dock 24 num (one
//    branch). On the love sea the angle must be read only at the charges' docks, or the sea takes u(V)^cells. AND THE
//    PARTICLE-HOLE IMAGE BREAKS: a hole's dock matrix is det(m) Z conj(m) Z, det m = u, so on the love sea a mixer angle
//    moves the hole's PARTNER multiplet and leaves the hole-in-z singlet at phase 1 (its mixer eigenvalue is 1: the mode
//    z is emptied). A mass string of this form therefore confines the flipped hole pair and leaves the singlet hole pair
//    free: this run is about the love-fear meson on the empty mesh only.
// 4. THE KEY DERIVATION: WHICH CHANNEL IS OPEN AT WHICH SEPARATION. The one-vibe matrix is X (I + (u - 1) z z^T) (read
//    off the rule, c = 1), z the uniform mode. The mixer acts on z only, so a member's 24 levels split into: S the singlet
//    branch and D its Dirac partner branch (span of P+- z; sin w = cos(m) g(K), g = (1/24) sum_d cos(K . r_d) in [-1/3,
//    1]), and 22 flat levels ORTHOGONAL TO z AT EVERY DOCK, which no angle touches: F- (11, with D at rest, phase pi) and
//    F+ (11, phase 0). In eps (mid0 units), with delta = m(V) - m0 and kmax(m) = pi/2 - m + arcsin(cos(m)/3):
//        S = m0 + 2 delta + k,  k in [0, kmax(m)]      D = -m0 - k      F- = -m0      F+ = pi - m0
//    THE ANGLE IS HALF MASS, HALF POTENTIAL: raising theta by 2 delta raises S by 2 delta and leaves D pinned at rest, so
//    the half-gap (the mass) grows by delta and the midpoint by delta. A pair at total momentum 0 (members at p and -p):
//        SS = 2 m0 + 4 delta + 2k (the bound channel)   SD = 2 delta (frozen: S(p) + D(-p), the kinetic terms cancel)
//        SF- = 2 delta + k    DF+ = pi - 2 m0 - k    DF- = -2 m0 - k    DD = -2 m0 - 2k    SF+ = pi + 2 delta + k
//        F-F- = F+F+ = -2 m0 (mod 2 pi)    F-F+ = pi - 2 m0
//    THE PHASE STRING shifts every channel by sigma V alike, so the flipped channels are unbounded and always reach a
//    level's energy at some V (E-SPN-0146: SF- at sigma V ~ E_L - k, V 11 to 17 on its point, the ball's edge at 15).
//    THE MASS STRING shifts the flipped channels at half the pair's rate (2 delta against 4 delta) or not at all (DF+,
//    DD, DF-, the FF), and m(V) < pi/2 BOUNDS them: every one-flip channel lies at or below pi - 2 m0 (SF- max = m + pi/2 +
//    arcsin(cos(m)/3) - 2 m0, increasing in m, pi - 2 m0 at m = pi/2), SF+ lies in [pi, 2 pi - 2 m0], and DD reaches down to
//    -2 m0 - 2 kmax(m0). So "the gap to the flipped multiplet grows with V" is not what closes the channel: energy is
//    conserved, and a flipped pair can sit at another V. What closes it is that the flipped channels are BOUNDED, because
//    the flipped member's phase is pinned by the mixer's rank-one form, and a level can sit ABOVE them:
//        EVERY FLIPPED CHANNEL IS CLOSED AT EVERY V AND EVERY TOTAL K  iff  pi - 2 m0 < E_L < 2 pi - 2 m0 - 2 kmax(m0)
//    (the gap of all flipped channels mod 2 pi; at total K != 0 the ceiling is max S + max F-, D, the same bound, and the
//    floor 2 min D the same). Two more conditions hold with it: the level's pi image (the beat alternates its contact map
//    with parity, so a level is an eigenvector of U2 and couples through the contact to channels at E_L +- pi) lands in
//    (-2 m0, 0), which is also a gap of every channel; and SS itself cannot come back mod 2 pi (SS <= 2 pi - 2 m0 < E_L + pi).
//    With the cap, SS's floor 2 m0 + 4 delta_cap = 4.79 > E_L: the level is a true bound state of the infinite mesh.
//    At m0 = pi/6: THE GAP IS (2.0944, 2.5559), a binding E_b = E_L - 2 m0 in (1.047, 1.509). The window is nonempty iff
//    m0 > arctan(1/3) = 0.3218 (its width is 2 (m0 - arcsin(cos(m0)/3))). The pure mass string (theta and a phase
//    -delta at each member, midpoint fixed) is WORSE: SD = 0 and SF- = k at every V (a particle and its antiparticle cost
//    nothing whatever their mass), so it is not run.
// 5. THE LEVEL. The NR 4d s-wave (radialWell) in the potential W = 4 delta(V(x)), V = kappa x (kappa = 0.8933, the mean
//    string length per unit distance), with the reduced mass mu(x) = tan m(V(x)) growing as the members do. At tau =
//    sigma (the k = 3 unit) E_b = 0.778 (constant mu 0.831), below the gap's floor 1.047 (flipped channels open near
//    the cap): the gap needs a STRONG string. At tau = 2 sigma: E_b = 1.1946 (constant mu: 1.3187), E_L = 2.2418 IN THE
//    GAP (0.148 above its floor, 0.314 below its top), mean V 2.22, turning point V ~ 3.2. The members' band bends under
//    the quadratic, which lowers E_L; E-SPN-0146's model was 0.3% high at its point and 1.2% high at 2 sigma. At 3 sigma
//    (cap 6) E_b = 1.525 (constant mu 1.728), at or over the top 1.509 (tmp/mstr-predict-1.log, -3.log).
//    So the point: m0 = pi/6, tau = 2 sigma, cap 10, on E-SPN-0146's ball (15) and window (14).
// 6. R. The potential model of E-SPN-0146 with the local mass: inertia c*^2 = 1 / <1 / (2 tan m(V))> + 1.5 T, E_rest = 2
//    m0 + E_b: R = 1.034 (T 0.364, <tan m> 0.907). The mass string's energy is half inertial (point 4), so R sits between
//    the phase string's (under R_walk) and the members' R_walk = 1.1027. PREDICTED R ~ 1.03, outside 1 +- 0.01. THE TREND
//    TOWARD LIGHTER MEMBERS DOES NOT EXIST under this piece: the gap needs m0 > arctan(1/3) (R_walk there 1.036) and a
//    binding E_b > pi - 4 m0 that grows as m0 falls, so a joint path with m0 -> 0 leaves the gap. Not run.
// 7. ISOTROPY is symmetry, as in E-SPN-0146 (V is W(F4)-invariant, so the first anisotropy is K^6).
//
// PREDICTED: Z1 holds (no channel open at E_L at any V; the tail evanescent past V ~ 3), Z3 holds (the gap persists at
// every total K; speeds ~0.37 c* at |K| 1.2), Z4 holds, Z5 holds (the phase string at E-SPN-0146's point leaks again), Z2
// FAILS on R (~1.03, isotropic). Verdict fail on Z2.
//
// GATES, fixed before the gate run. The point as in 5; E-SPN-0146's witness, extended by a tail reading.
//  Z1 A LEVEL HOLDS. From the start (both members in their dock's singlet mode, weight exp(-(V/2)^1.5)) the filter
//     (Blackman-Harris over S two-beats: S 64 at the predicted phase, S 256 at the read phase, S 128 at the read phase)
//     gives the level v. Over 256 beats from v: the weight within V <= 14 >= 1 - 1e-3 at every beat, AND the fidelity
//     |<v|psi_t>|^2 >= 1 - 1e-3 at every even beat, AND no outgoing tail: over the profile's ratios r(V) = w(V + 1)/w(V)
//     from V = 5 while w(V) >= 1e-20, no r(V + 1) > 1.1 r(V), and w(14) + w(15) <= 1e-6.
//  Z2 IT MOVES. E(K) at K = kappa u and kappa u / 2 (kappa 0.04) along the axis, face, body and generic direction (each
//     by the filter S 64 from v at its phase), the K^2 coefficient by Richardson against the K = 0 level read the same way;
//     isotropic: every direction's within 1e-6 of the axis's (relative); and R = c*^2 / (2 a E_rest) within 0.01 of 1.
//  Z3 NO PART EXCEEDS c*. The band followed along the axis and the face to |K| 0.4, 0.8, 1.2 (filter S 128 from the
//     previous point at the extrapolated phase): at every point followed (|lambda2| >= 0.99, residual <= 1e-2) the
//     Hellmann-Feynman speed is at most c* (1 + 1e-6); a point not followed is reported and gates nothing; the 0.4 point
//     must be followed on both directions.
//  Z4 THE VACUUM IS INERT. The exact rule on the empty box (sides 4 and 8) and the love sea box (side 4), 128 beats, at
//     the angles u(0), u(1) and u(cap): one branch equal to the vacuum with amplitude S^cells (F^cells) exactly each beat,
//     no charge, and the collision moves no value on any dock of any beat.
//  Z5 CONTROL, THE PHASE STRING LEAKS AGAIN. With no mass string and E-SPN-0146's phase string (sigma, the cost's sign),
//     E-SPN-0146's procedure (start exp(-(V/2.5)^1.5), S 256 at its predicted phase, S 128 at the read phase) gives a level
//     that FAILS Z1's witness (any clause).
// INSTRUMENT (a failure makes the verdict partial). I1 at every V = 0 .. 10: u(V) has norm one exactly; the rule's
//  one-vibe matrix at u(V) equals dockMatrix(theta(V), 2/3, love) to 1e-12, love = fear, both parities alike, the shape
//  X (I + beta 1 1^T) to 1e-12, the empty dock's factor S alone; m(V) equals the schedule pi/6 + sigma min(V, 10) to
//  1e-9; the K = 0 levels are 12 at -m0, 11 at pi - m0 and S at m0 + 2 delta (to 1e-9: THE PARTNER IS PINNED); at 256
//  grid momenta and K* = (0, pi, 0, pi) 22 levels sit on the two flat values (1e-9), S within the closed range and D
//  within its own (1e-9), S at K* and D at K* at the closed ends (1e-9). I2 the contact map is unitary on the 576 live
//  states to 1e-12. I3 one beat of the rule at u(V) on the side-4 empty box from every contact state (V 0) and every slot
//  pair at V 1 and V 2, both parities, equals the meson beat with the mass string entry for entry to 1e-12, every integer
//  division exact, no stray branch. I4 the threaded beat equals the one-thread beat on a 5-ball with the mass string at K
//  = (0.3, -0.1, 0.2, 0.05) for 4 beats: entries 1e-13, sums 1e-12. I5 radialWell with constant mass and a linear W equals
//  eps4 F l (linearWell) to 1e-6 relative; linearWell's 3d form is the Airy zero to 1e-5. I6 Hellmann-Feynman against the
//  central difference at K 0.4 +- 0.02 along the axis (filter S 128) to 1e-3.
// CONTROLS (a failure makes the verdict partial). C1 the witness can fail with a mass string on: the anti-string (the
//  angle FALLING, u(V) = w^2 rho^-min(V, 10)) gives no level that holds at the predicted phase (S 128, then the witness).
//  C2 the witness sees a beat: v mixed with 2e-3 of the start's remainder fails the fidelity clause.
// READ, gating nothing: the phase string at the SAME pair tension (4 sigma = 0.374224 a link, the k = 12 unit, no mass):
//  derived, its flipped channels meet E_L from V ~ 0.7 to 6.3, all inside the ball, so it hybridizes with flipped members
//  in the core and its hold on this ball says nothing about the infinite mesh (a phase cost wraps at V = 2 pi / (4 sigma)
//  = 16.8). Its eps, window, fidelity, tail and singlet share are printed beside the mass string's.
// Verdict: partial if the instrument or a control fails; pass if Z1 to Z5 hold; fail otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (written after the gates above; no gate moved). tmp/mstr-predict*.log: the
//  schedule's angles, the member bands against the closed form at every V (S and D ranges equal to 4 digits, 22 flats
//  pinned), the gap, the NR levels at tau = sigma, 2 sigma, 3 sigma (point 5). A smoke run of every code path on a
//  6-ball (tmp/mstr-smoke2.log, 339 s; its physics is unconverged and gates nothing) found two code defects, fixed before
//  the gate run: the schedule was built only to the ball's radius, so a small ball lost the cap's unit (a crash in Z4);
//  and I3's V = 2 starts reach V = 4 in one beat, beyond the 3-ball model, which absorbed those branches (all 1,152
//  differed, worst 0.91): the check ball is 4. tmp/mstr-vac.log: the side-8 vacuum at u(10) takes 0.1 s a beat.
//  tmp/mstr-probe1-10.log, the Z1 procedure on a 10-ball: the level at eps 2.265323 (predicted 2.2418), |lambda2|
//  1.00000000, residual 1.5e-11 after the third filter, singlet share 0.686, stores 2.1e-3, held 256 beats with window and
//  fidelity 1.000000 (absorbed 5.0e-9). Its profile over V = 0 .. 10: 1.1e-1 1.7e-1 3.7e-1 2.6e-1 7.8e-2 1.2e-2 9.1e-4
//  3.6e-5 7.6e-7 3.4e-8 2.4e-9, ratios from V = 5: 0.076 0.039 0.021 0.044 0.070, so the tail clause as written counts 2
//  rises there. Read, not derived before the gate: past V ~ 7 the SS channel's evanescence (its floor 2 m0 + 4 delta
//  climbs far above E_L) is outrun by a slower evanescent FLIPPED component, whose ceiling (SF-: 2 delta + kmax, 2.02 at
//  the cap) approaches E_L from below as delta grows, so its decay slows toward the cap. That is a closed channel's
//  tail, not an outgoing one, but the clause cannot tell the two apart by ratios alone; the clause is kept as written,
//  and the gate run's absorbed weight and edge shells are the reading that separates them.
//
// FIRST RUN (tmp/mstr-exp-run1.log, 5,808 s, 12 threads): FAIL on Z1 (the tail clause alone) and Z2 (R). The instrument
//  and both controls hold; Z3, Z4 and Z5 hold. No gate moved and none was rerun.
//  - Z1 FAILS ON ITS TAIL CLAUSE ONLY, and the level is bound. The filter lands on eps 2.265323 (predicted 2.2418, 1.0%
//    low; IN THE GAP (2.0944, 2.5559), 0.171 above its floor), |lambda2| 1.0000000000 (1 + 1.3e-11), residual 1.3e-11,
//    singlet share 0.686, stores 2.1e-3, mean string length 2.06. Over 256 beats the window V <= 14 keeps 1.000000 and the
//    fidelity is 1 - 1.7e-11; the ball's edge absorbed 1.8e-18 in all; w(14) + w(15) = 1.6e-16 (gate 1e-6). The profile
//    over V = 0 .. 15: 1.1e-1 1.7e-1 3.7e-1 2.6e-1 7.8e-2 1.2e-2 9.1e-4 3.6e-5 7.6e-7 3.4e-8 2.5e-9 7.6e-11 7.5e-13 1.1e-14
//    1.6e-16 2.2e-18, ratios from V = 5: 0.076 0.039 0.021 0.045 0.074 0.030 0.010 0.015 0.014 0.014, three rises (7 -> 8,
//    8 -> 9, 11 -> 12). WHY, a reading after the run: the ratio climbs on V 7 to 9 (the flipped component's slower
//    evanescence as its ceiling nears E_L, the probe's reading) and then FALLS to a constant 0.014 past the cap (V > 10),
//    where the potential stops changing and every channel's evanescence has a fixed rate: exponential decay, the bound
//    state's own tail, not an outgoing one. An outgoing tail feeds the edge (E-SPN-0146: 4.3e-3 absorbed, edge shells
//    9.7e-5); this one holds 1.6e-16 there and absorbs 1.8e-18. So the clause as written counted a closed channel's
//    shoulder and the cap's corner as rises: a defect of the clause, recorded as a failure because it is the gate.
//  - Z2 FAILS ON R, isotropic: the K^2 coefficient 0.0703763497, 0.0703763492, 0.0703763498, 0.0703763496 along the four
//    directions (spread 7.8e-9, gate 1e-6), but R = c*^2 / (2 a E_rest) = 1.56813 (predicted 1.034; the members' R_walk
//    1.1027). The prediction was wrong by 0.53. A reading, not a derivation: 31% of the level sits off the singlet slot
//    pattern (share 0.686), the core's admixture of flat members that carry no velocity; E-SPN-0146's level (share 0.762)
//    also read R 0.12 above its model. The model knows the members' local mass and misses that admixture.
//  - Z3 holds: every point followed (|lambda2| 1.00000, residual 2.6e-7 to 3.2e-7) with eps 2.276618, 2.310803, 2.368038
//    at |K| 0.4, 0.8, 1.2 along the axis (the face equal to 3e-5) and speeds 0.080, 0.162, 0.242 c* (predicted ~0.37 c*
//    from the R model). The level stays in the gap at every K read, as derived.
//  - Z4 holds: sides 4 and 8 empty and the side-4 love sea at u(0), u(1), u(10), 128 beats: one branch, exact.
//  - Z5 holds and REPRODUCES E-SPN-0146 bit for bit: eps 1.565757, window 0.995646, fidelity 0.979730, absorbed 4.33e-3,
//    profile flattening past V = 9 (ratios 0.315 0.314 0.377 0.469 0.534), edge shells 9.7e-5.
//  - C1 holds: the anti-string lands at eps 2.2322 and keeps 0.63 of the window with fidelity 0.0056 (its weight rolls
//    out to V 5 to 8). C2 holds: 2e-3 of the start's remainder drops the fidelity to 0.9931.
//  - Read, the phase string at the equal tension (4 sigma): eps 2.369030 (predicted 2.3659), singlet share 0.052, window
//    0.9988 but fidelity 0.0011, |lambda2| 0.99988, residual 1.5e-2, a profile with a bump at V = 12: no level; the
//    filter's vector is a mixture dominated by flipped members, as derived (its flipped channels meet E_L in the core).
//    So at the same pair tension the phase string holds nothing and the mass string holds a clean level: the difference
//    is the form of the cost, not its strength.
//  - Instrument: I1 at all 11 angles (matrices 6e-17 to 2.3e-16, m on the schedule, the partner pinned, 22 flats at every
//    momentum, S and D at their closed ends to 1e-9); I2 unitarity 0; I3 3,456 starts at V 0, 1, 2, worst 1.2e-16, 0 differ,
//    0 inexact, 0 stray; I4 entries 0, sums 1.1e-13; I5 radialWell 0.523310 = eps4 F l, Airy 2.338107; I6 1.1e-5.
// WHETHER (b) IS NEEDED. Not for binding: the level is an eigenlevel to 1e-11 with no loss the ball can see, so the
//  mass string closed the channel that sank E-SPN-0146, and Z1's failure is its tail clause's. (b) is what the R failure
//  points to, for two reasons derived above and read here: the closure window (point 4) exists only for m0 > arctan(1/3)
//  and binding above pi - 4 m0, so this piece cannot make a light composite at all; and the frozen flat admixture (31% of
//  the level) is inertia with no velocity. Concretely (b) must move the 11 F- states off pi at every K while leaving
//  span(P+ z, P- z) (S and D) alone, since that span is what carries gamma = 0. The obvious dock piece, a phase e^(i chi)
//  on each line's X = -1 mode, is a change of the coin's zeta: it moves D with F- and brings gamma back (E-SPN-0143). The
//  span is K-dependent, so a projector onto its complement is not dock-local in general. The candidate to derive first is
//  a second rank-one dock mixer on a fixed X = -1 vector (the line-antisymmetric uniform mode), whose effect on the
//  moving pair is a derivation, not an assumption. Whether any such piece is in the ring, keeps c* and gamma = 0, and
//  leaves the vacuum inert is the next experiment's derivation.
//
// Depth L2: a two-body quantum walk on the D4 lattice with a position-dependent mass, the rule's own dock pieces read
// exactly at every angle and checked against the rule on a box; the mass string is an added separation cost, stated as
// such. DETERMINISM: no random numbers; the start is placed, every level filtered. NOTHING MOVES: the pieces hand values
// between slots of one dock, the stream takes each slot's value one dock along, the string sets the mixer's angle.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { rootIndex } from '@/code/measure/crossing-lines'
import { centerOf } from '@/code/measure/wall-reading'
import { dockMatrix, DOCK_ROOTS, wrap } from '@/code/measure/dock-mixer'
import {
  singletLevel,
  singletKinematics,
} from '@/code/measure/singlet-kinematics'
import { cyclePhases } from '@/code/measure/swap-cone'
import { d4Ball, flatBoxTables } from '@/code/measure/swap-sector'
import { ringScale } from '@/code/rule/swap-mixer'
import { shareSpace, threadEngine } from '@/code/measure/meson-pool'
import {
  boxCheck,
  boxStarts,
  buildLevel,
  cloneMeson,
  contactDockExact,
  contactUnitarity,
  CONTACT_STATES,
  emptyFactor,
  levelVelocity,
  linearWell,
  massShapes,
  massUnits,
  mesonInner,
  mesonSpace,
  mesonStart,
  newFlow,
  normalizeMeson,
  overEmpty,
  profileTail,
  radialWell,
  ringUnit,
  serialEngine,
  setMassString,
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
  vacuumRun,
  vibeDockExact,
  watchLevel,
  type MesonEngine,
  type MesonState,
  type VibeShape,
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
// the point: the base unit w^2 (k 0, j 4), the step ((3 + w^2)/(3 + w))^6 w^4 (k -6, j 4: angle +2 sigma), the cap
const MIXER: readonly [number, number] = [0, 4]
const STEP: readonly [number, number] = [-6, 4]
const ANTI: readonly [number, number] = [6, -4]
const CAP = 10
// E-SPN-0146's phase string (k 3, j 4: |angle| sigma) and the equal-tension read (k 12, j 4: |angle| 4 sigma)
const STRING: readonly [number, number] = [3, 4]
const EQUAL: readonly [number, number] = [12, 4]

export type MassStringPlan = {
  ball: number
  window: number
  sCoarse: number
  sFirst: number
  sSecond: number
  sMove: number
  sFollow: number
  holdBeats: number
  threads: number
  vacuumBeats: number
  vacuumSides: readonly number[]
}

export const GATE_PLAN: MassStringPlan = {
  ball: 15,
  window: 14,
  sCoarse: 64,
  sFirst: 256,
  sSecond: 128,
  sMove: 64,
  sFollow: 128,
  holdBeats: 256,
  threads: 12,
  vacuumBeats: 128,
  vacuumSides: [4, 8],
}

const ELL = 2
const ELL_PHASE = 2.5
const HOLD = 1e-3
const TAIL_FROM = 5
const TAIL_FLOOR = 1e-20
const TAIL_SLACK = 0.1
const EDGE = 1e-6
const KAPPA = 0.04
const ISOTROPY = 1e-6
const R_TOLERANCE = 0.01
const FOLLOW_K: readonly number[] = [0.4, 0.8, 1.2]
const FOLLOW_LAMBDA = 0.99
const FOLLOW_RESIDUAL = 1e-2
const SPEED_TOLERANCE = 1e-6
const FD_H = 0.02
const FD_TOLERANCE = 1e-3
const BOX_SIDE = 4
// a V = 2 start reaches V = 4 in one beat, so the model's ball holds 4 (a 3-ball absorbed those branches: the smoke run)
const CHECK_BALL = 4
const MIX = 2e-3
const POOL = 3
const MATRIX_TOLERANCE = 1e-12
const READ_TOLERANCE = 1e-9
const ENTRY_TOLERANCE = 1e-12
const THREAD_TOLERANCE = 1e-13
const SUM_TOLERANCE = 1e-12
const WELL_TOLERANCE = 1e-6
const AIRY_ZERO = 2.338107
const AIRY_TOLERANCE = 1e-5
const KAPPA_GRID = 24
const WELL_L = 24
const WELL_N = 24000
const RADIAL_L = 22
const RADIAL_N = 20000
const GRID = 4
const K_THREAD = [0.3, -0.1, 0.2, 0.05]
const THREAD_BALL = 5
const THREAD_BEATS = 4

const flag = (b: boolean): number => (b ? 1 : 0)
const norm4 = (v: readonly number[]): number => Math.hypot(...v)
// the top of the singlet branch above its rest level at mass m: g = -1/3 at K* = (0, pi, 0, pi)
const kmaxOf = (m: number): number =>
  Math.PI / 2 - m + Math.asin(Math.cos(m) / 3)

export default experiment({
  id: 'spin/swap-mass-string',
  code: 'E-SPN-0147',
  title:
    'a mass string on the swap-coin rule binds a clean level where the phase string leaked, but R is 1.57, fail (Z1 on its tail clause, Z2): at m0 = pi/6 the mixer angle read from the pair separation, u(V) = w^2 rho^min(V, 10) in Z[w][1/42] (2 sigma a link, m 0.524 to 1.459), is half mass and half potential because the mixer acts on z only and pins the partner at pi, so every flipped channel is bounded by pi - 2 m0 and a level in the gap (2.094, 2.556) is closed to all of them at every separation and momentum (the gap exists only for m0 > arctan(1/3)); the level sits at eps 2.265323 (predicted 2.2418) with |lambda2| 1 + 1.3e-11, holds 256 beats at window 1.000000 and fidelity 1 - 1.7e-11 with 1.8e-18 absorbed, but its evanescent tail climbs on V 7 to 9 before the cap, which the tail clause counts as 3 rises; it is isotropic to 7.8e-9 with R 1.568 (predicted 1.034; 31% frozen flat admixture), moves at up to 0.242 c* at K 1.2, the vacuum stays exact at three angles, E-SPN-0146 reproduces bit for bit, and the phase string at the same tension holds nothing (singlet share 0.05); the rule matches the model on 3,456 box starts; next: a piece lifting the flat multiplet, since this closure needs heavy members and strong binding',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return swapMassStringRun(GATE_PLAN)
  },
})

export function swapMassStringRun(plan: MassStringPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )

  // ---------------- the schedule and I1: every angle's dock matrix, the pinned partner, the bands ----------------
  const units = massUnits(MIXER, STEP, CAP, Math.max(plan.ball, CAP))
  const anti = massUnits(MIXER, ANTI, CAP, Math.max(plan.ball, CAP))
  const u0 = units[0]!
  const sigma = Math.abs(unitAngle(ringUnit(STRING[0], STRING[1])))
  const sigmaEqual = Math.abs(unitAngle(ringUnit(EQUAL[0], EQUAL[1])))
  const tau = unitAngle(ringUnit(STEP[0], STEP[1]))
  const shapes = massShapes(units)
  const antiShapes = massShapes(anti)
  const shape0 = shapes[0]!
  const A0 = overEmpty(vibeDockExact(1, 0, u0), u0)
  const level1 = singletLevel({ re: A0.re, im: A0.im }, DOCK_ROOTS, 12)
  const m0 = level1.m
  const mid = level1.midPhase
  const sign = level1.sign
  const phaseOf = (eps: number): number => wrap(2 * mid - sign * eps)
  const epsOf = (phase: number): number => sign * -wrap(phase - 2 * mid)
  const memberEps = (phase: number): number => sign * -wrap(phase - mid)
  const flatLow = -m0
  const flatHigh = Math.PI - m0
  const grid: number[][] = []

  for (let a = 0; a < GRID; a++) {
    for (let b = 0; b < GRID; b++) {
      for (let c = 0; c < GRID; c++) {
        for (let d = 0; d < GRID; d++) {
          grid.push(
            [a, b, c, d].map(
              i => -Math.PI + (2 * Math.PI * (i + 0.5)) / GRID,
            ),
          )
        }
      }
    }
  }

  const KSTAR = [0, Math.PI, 0, Math.PI]
  const perAngle = units.slice(0, CAP + 1).map((u, V) => {
    const same = (
      x: ReturnType<typeof vibeDockExact>,
      y: ReturnType<typeof vibeDockExact>,
    ): boolean =>
      x.k === y.k &&
      x.entries.every((row, i) =>
        row.every(
          (e, j) =>
            e[0] === (y.entries[i] as [bigint, bigint][])[j]![0] &&
            e[1] === (y.entries[i] as [bigint, bigint][])[j]![1],
        ),
      )
    const L0 = vibeDockExact(1, 0, u)
    const alike =
      same(L0, vibeDockExact(1, 1, u)) &&
      same(L0, vibeDockExact(-1, 0, u)) &&
      same(L0, vibeDockExact(-1, 1, u))
    const A = overEmpty(L0, u)
    const theta = unitAngle(u)
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

    const h = shapes[V]!
    const empty = emptyFactor(u)
    const emptyOk =
      empty.alone &&
      empty.a === ringScale(u) &&
      empty.b === 0n &&
      empty.k === 0
    const lv = singletLevel({ re: A.re, im: A.im }, DOCK_ROOTS, 12)
    const m = lv.m
    const schedule = m0 + (tau / 2) * V
    const delta = m - m0
    const at = (K: readonly number[]): number[] =>
      cyclePhases([{ re: A.re, im: A.im }], DOCK_ROOTS, K).map(
        memberEps,
      )
    const rest = at([0, 0, 0, 0])
    const nearLow = rest.filter(
      e => Math.abs(e - flatLow) <= READ_TOLERANCE,
    ).length
    const nearHigh = rest.filter(
      e => Math.abs(wrap(e - flatHigh)) <= READ_TOLERANCE,
    ).length
    const sRest = rest.filter(
      e => Math.abs(e - (m0 + 2 * delta)) <= READ_TOLERANCE,
    ).length
    const restOk = nearLow === 12 && nearHigh === 11 && sRest === 1
    const sLo = m0 + 2 * delta
    const sHi = sLo + kmaxOf(m)
    const dLo = -m0 - kmaxOf(m)

    let flatMiss = 0
    let bandOut = 0
    let sTop = NaN
    let dBottom = NaN

    for (const K of [...grid, KSTAR]) {
      const e = at(K)
      const moving = e.filter(
        x =>
          Math.abs(x - flatLow) > READ_TOLERANCE &&
          Math.abs(wrap(x - flatHigh)) > READ_TOLERANCE,
      )

      if (e.length - moving.length !== 22 || moving.length !== 2) {
        flatMiss++
        continue
      }

      const [x1, x2] = moving as [number, number]
      const S = wrap(x1 - delta) > 0 ? x1 : x2
      const D = S === x1 ? x2 : x1

      if (
        S < sLo - READ_TOLERANCE ||
        S > sHi + READ_TOLERANCE ||
        D < dLo - READ_TOLERANCE ||
        D > -m0 + READ_TOLERANCE
      ) {
        bandOut++
      }

      if (K === KSTAR) {
        sTop = S
        dBottom = D
      }
    }

    const endsOk =
      Math.abs(sTop - sHi) <= READ_TOLERANCE &&
      Math.abs(dBottom - dLo) <= READ_TOLERANCE
    const ok =
      unitNormExact(u) &&
      matrixGap <= MATRIX_TOLERANCE &&
      alike &&
      h.gap <= MATRIX_TOLERANCE &&
      emptyOk &&
      Math.abs(m - schedule) <= READ_TOLERANCE &&
      restOk &&
      flatMiss === 0 &&
      bandOut === 0 &&
      endsOk

    return {
      V,
      theta,
      m,
      schedule,
      matrixGap,
      alike,
      shapeGap: h.gap,
      emptyOk,
      restOk,
      flatMiss,
      bandOut,
      sTop,
      sHi,
      dBottom,
      dLo,
      ok,
    }
  })
  const I1 = perAngle.every(x => x.ok)
  const Rwalk = DIRECTIONS.map(
    d =>
      (C_STAR * C_STAR) /
      singletKinematics(
        { re: A0.re, im: A0.im },
        DOCK_ROOTS,
        level1,
        d.u,
        [0.1, 0.2, 0.3, 0.4, 0.5],
      ).c2,
  )

  log('I1')

  // ---------------- I2: the contact map (V = 0, u0: E-SPN-0146's) ----------------
  const contact0 = contactDockExact(0, u0)
  const contact1 = contactDockExact(1, u0)
  const Cf = [overEmpty(contact0, u0), overEmpty(contact1, u0)]
  const live = [...Array(CONTACT_STATES).keys()].filter(
    i => i >= STORE_BASE || Math.floor(i / 24) !== i % 24,
  )
  const unitarity = Math.max(...Cf.map(M => contactUnitarity(M, live)))
  const contact: [
    ReturnType<typeof sparseOf>,
    ReturnType<typeof sparseOf>,
  ] = [sparseOf(Cf[0]!), sparseOf(Cf[1]!)]
  const I2 = unitarity <= MATRIX_TOLERANCE

  log('I2')

  // ---------------- I3: one beat of the rule at u(V) on the side-4 empty box against the meson beat ----------------
  const box = flatBoxTables(BOX_SIDE)
  const X = centerOf(BOX_SIDE)
  const Xf1 = Math.floor(
    box.target[X * 24 + rootIndex([1, 1, 0, 0])]! / 24,
  )
  const Xf2 = Math.floor(
    box.target[Xf1 * 24 + rootIndex([1, -1, 0, 0])]! / 24,
  )
  const checkSpace = mesonSpace(
    d4Ball(CHECK_BALL),
    shape0,
    contact,
    0,
    [0, 0, 0, 0],
  )

  setMassString(checkSpace, shapes)

  const unitOf = (V: number): (typeof units)[number] =>
    units[Math.min(V, units.length - 1)]!
  const box1 = boxCheck(
    box,
    boxStarts(live, X, Xf1, [-1, -1, 0, 0]),
    checkSpace,
    unitOf,
    ENTRY_TOLERANCE,
  )
  const box2 = boxCheck(
    box,
    boxStarts([], X, Xf2, [-2, 0, 0, 0]),
    checkSpace,
    unitOf,
    ENTRY_TOLERANCE,
  )
  const I3 =
    box1.differ + box2.differ === 0 &&
    box1.inexact + box2.inexact === 0 &&
    box1.stray + box2.stray === 0

  log('I3')

  // ---------------- I5 and the prediction ----------------
  const kap = stringKappa(KAPPA_GRID)
  const eps4 = linearWell(WELL_L, WELL_N)
  const airy = linearWell(WELL_L, WELL_N, 0)
  const Fphase = sigma * kap.mean
  const lPhase = (1 / (2 * Math.tan(m0) * Fphase)) ** (1 / 3)
  const wellCheck = radialWell(
    x => Fphase * x,
    () => Math.tan(m0),
    WELL_L,
    WELL_N,
  )
  const I5 =
    Math.abs(wellCheck.E / (eps4 * Fphase * lPhase) - 1) <=
      WELL_TOLERANCE &&
    Math.abs(airy - AIRY_ZERO) <= AIRY_TOLERANCE &&
    units.every(unitNormExact)
  const massAt = (x: number): number =>
    m0 + (tau / 2) * Math.min(kap.mean * x, CAP)

  const predictMass = (
    mu: (x: number) => number,
  ): {
    Eb: number
    Erest: number
    T: number
    meanV: number
    R: number
  } => {
    const r = radialWell(
      x => 4 * (massAt(x) - m0),
      mu,
      RADIAL_L,
      RADIAL_N,
    )

    let W = 0
    let V = 0
    let inv = 0

    for (let i = 0; i < r.u.length; i++) {
      const x = (i + 1) * r.h
      const p = r.u[i]! ** 2

      W += p * 4 * (massAt(x) - m0)
      V += p * kap.mean * x
      inv += p / (2 * Math.tan(massAt(x)))
    }

    const T = r.E - W
    const Erest = 2 * m0 + r.E

    return {
      Eb: r.E,
      Erest,
      T,
      meanV: V,
      R: (1 / inv + 1.5 * T) / Erest,
    }
  }

  const pred = predictMass(x => Math.tan(massAt(x)))
  const predConst = predictMass(() => Math.tan(m0))
  const gapLow = Math.PI - 2 * m0
  const gapHigh = 2 * Math.PI - 2 * m0 - 2 * kmaxOf(m0)
  const predPhaseString = 2 * m0 + eps4 * Fphase * lPhase
  const Fequal = sigmaEqual * kap.mean
  const predEqual =
    2 * m0 +
    eps4 * Fequal * (1 / (2 * Math.tan(m0) * Fequal)) ** (1 / 3)

  log('I5 prediction')

  // ---------------- I4: the threaded beat against the one-thread beat, mass string on ----------------
  let threadGap = 0
  let threadSums = 0

  {
    const raw = mesonSpace(
      d4Ball(THREAD_BALL),
      shape0,
      contact,
      0,
      K_THREAD,
    )

    setMassString(raw, shapes)

    const sp = shareSpace(raw)
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

  // ---------------- the engine on the gate ball, the mass string on ----------------
  const ball = d4Ball(plan.ball)
  const space = shareSpace(
    mesonSpace(ball, shape0, contact, 0, [0, 0, 0, 0]),
  )

  setMassString(space, shapes)

  const engine: MesonEngine = threadEngine(space, plan.threads, POOL)
  const start = mesonStart(ball, ELL)

  // the witness: the hold, the fidelity, the tail
  const witness = (
    v: MesonState,
  ): {
    hold: ReturnType<typeof watchLevel>
    profile: number[]
    tail: ReturnType<typeof profileTail>
    holds: boolean
  } => {
    const hold = watchLevel(engine, v, plan.holdBeats, plan.window)
    const profile = stringProfile(ball, v)
    const tail = profileTail(profile, TAIL_FROM, TAIL_FLOOR, TAIL_SLACK)

    return {
      hold,
      profile,
      tail,
      holds:
        hold.leastWindow >= 1 - HOLD &&
        hold.leastFidelity >= 1 - HOLD &&
        tail.rises === 0 &&
        tail.edge <= EDGE,
    }
  }

  log(`ball ${plan.ball}: ${ball.points.length} sites`)

  // ---------------- Z1: the level holds ----------------
  const coarse = buildLevel(
    engine,
    start,
    phaseOf(pred.Erest),
    plan.sCoarse,
    1,
  )
  const first = buildLevel(
    engine,
    coarse.v,
    coarse.read.phase,
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
  const Erest = epsOf(read0.phase)
  const z1 = witness(v0)
  const Z1 = z1.holds
  const share = singletShare(ball, v0)
  const stored = storeWeight(ball, v0)
  const meanV = z1.profile.reduce((s, w, V) => s + w * V, 0)
  const inGap = Erest > gapLow && Erest < gapHigh

  log('Z1')

  // ---------------- C2: the witness sees a beat ----------------
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

    for (let k = 0; k < w.re.length; k++) {
      w.re[k] =
        Math.sqrt(1 - MIX) * v0.re[k]! + Math.sqrt(MIX) * w.re[k]!

      w.im[k] =
        Math.sqrt(1 - MIX) * v0.im[k]! + Math.sqrt(MIX) * w.im[k]!
    }

    c2Fidelity = watchLevel(
      engine,
      w,
      plan.holdBeats,
      plan.window,
    ).leastFidelity
  }

  const C2 = c2Fidelity < 1 - HOLD

  log('C2')

  // ---------------- Z2: the dispersion at small K ----------------
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

    log(`Z2 ${d.name}`)

    return {
      name: d.name,
      d1,
      d2,
      a: (16 * d2 - d1) / (3 * KAPPA * KAPPA),
      lambda: Math.min(e1.lambda, e2.lambda),
      residual: Math.max(e1.residual, e2.residual),
    }
  })
  const a0 = dispersion[0]!.a
  const isotropy = Math.max(
    ...dispersion.map(x => Math.abs(x.a / a0 - 1)),
  )
  const R = (C_STAR * C_STAR) / (2 * a0 * Erest)
  const Z2 = isotropy <= ISOTROPY && Math.abs(R - 1) <= R_TOLERANCE

  // ---------------- Z3: the band followed to larger K ----------------
  const follow = DIRECTIONS.slice(0, 2).map(d => {
    let from = v0

    const points: {
      K: number
      eps: number
      speed: number
      followed: boolean
      lambda: number
      residual: number
    }[] = []

    for (const k of FOLLOW_K) {
      // from the previous point's level, at the phase the small-K band extrapolates to
      const e = energyAt(
        d.u.map(x => x * k),
        from,
        phaseOf(Erest + a0 * k * k),
        plan.sFollow,
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
      log(`Z3 ${d.name} ${k}`)
    }

    return { name: d.name, points }
  })
  const speeds = follow.flatMap(f =>
    f.points.filter(p => p.followed).map(p => p.speed),
  )
  const topSpeed = speeds.length ? Math.max(...speeds) : NaN
  const Z3 =
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
      plan.sFollow,
    )
    const vel = levelVelocity(engine, at.v)
    const up = energyAt(
      [k + FD_H, 0, 0, 0],
      at.v,
      phaseOf(at.eps),
      plan.sFollow,
    )
    const down = energyAt(
      [k - FD_H, 0, 0, 0],
      at.v,
      phaseOf(at.eps),
      plan.sFollow,
    )
    const slope = (up.eps - down.eps) / (2 * FD_H)

    hfGap =
      Math.abs(Math.abs(slope) - Math.abs(vel[0]!)) / Math.abs(slope)
  }

  const I6 = hfGap <= FD_TOLERANCE

  setMomentum(space, [0, 0, 0, 0])
  log('Z3 I6')

  // ---------------- Z5: E-SPN-0146's phase string, no mass string ----------------
  // E-SPN-0146's procedure with the phase string the space holds (no mass string)
  const phaseRun = (
    predicted: number,
  ): {
    eps: number
    lambda: number
    residual: number
    share: number
    w: ReturnType<typeof witness>
  } => {
    const s0 = mesonStart(ball, ELL_PHASE)
    const f = buildLevel(engine, s0, phaseOf(predicted), plan.sFirst, 1)
    const g = buildLevel(engine, f.v, f.read.phase, plan.sSecond, 1)

    return {
      eps: epsOf(g.read.phase),
      lambda: Math.hypot(...g.read.lambda2),
      residual: g.read.residual,
      share: singletShare(ball, g.v),
      w: witness(g.v),
    }
  }

  setMassString(space, [shape0])
  setString(space, sign * sigma)

  const control = phaseRun(predPhaseString)
  const Z5 = !control.w.holds

  log('Z5')

  // ---------------- READ: the phase string at the mass string's pair tension ----------------
  setString(space, sign * sigmaEqual)

  const equal = phaseRun(predEqual)

  log('read equal tension')

  // ---------------- C1: the anti-string (the angle falling with V) ----------------
  setString(space, 0)
  setMassString(space, antiShapes)

  const antiLevel = buildLevel(
    engine,
    start,
    phaseOf(pred.Erest),
    plan.sSecond,
    1,
  )
  const antiWitness = witness(antiLevel.v)
  const C1 = !antiWitness.holds

  engine.close()
  log('C1')

  // ---------------- Z4: the vacuum at the schedule's angles ----------------
  const vacuum = [0, 1, CAP].flatMap(V =>
    [
      ...plan.vacuumSides.map(side => ({ side, sea: 0 })),
      { side: BOX_SIDE, sea: 1 },
    ].map(({ side, sea }) => ({
      V,
      ...vacuumRun(units[V]!, side, sea, plan.vacuumBeats),
    })),
  )
  const Z4 = vacuum.every(
    v => v.exact && v.permutes === 0 && v.charged === 0,
  )

  log('Z4')

  const instrument = I1 && I2 && I3 && I4 && I5 && I6
  const controls = C1 && C2
  const status =
    !instrument || !controls
      ? 'partial'
      : Z1 && Z2 && Z3 && Z4 && Z5
        ? 'pass'
        : 'fail'
  const tailLine = (t: ReturnType<typeof profileTail>): string =>
    `ratios ${t.ratios.map(x => x.toFixed(3)).join(' ')}, rises ${t.rises}, edge ${t.edge.toExponential(2)}`
  const witnessLine = (w: ReturnType<typeof witness>): string =>
    `window ${w.hold.leastWindow.toFixed(6)}, fidelity ${w.hold.leastFidelity.toFixed(6)}, absorbed ${w.hold.absorbed.toExponential(2)}, ${tailLine(w.tail)}; profile ${w.profile.map(x => x.toExponential(2)).join(' ')}`
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
  const angleLine = perAngle
    .map(
      x =>
        `V ${x.V} m ${x.m.toFixed(6)} (sched ${x.schedule.toFixed(6)}) matrix ${x.matrixGap.toExponential(1)} rest ${x.restOk} flat miss ${x.flatMiss} band out ${x.bandOut} S top ${x.sTop.toFixed(6)}/${x.sHi.toFixed(6)} D bottom ${x.dBottom.toFixed(6)}/${x.dLo.toFixed(6)}`,
    )
    .join('; ')

  return verdict({
    status,
    claim: `Z1 ${Z1} (level at eps ${Erest.toFixed(6)} against the predicted ${pred.Erest.toFixed(4)}, in the gap (${gapLow.toFixed(4)}, ${gapHigh.toFixed(4)}) ${inGap}; |lambda2| ${Math.hypot(...read0.lambda2).toFixed(8)}, residual ${read0.residual.toExponential(2)}; ${witnessLine(z1)}); Z2 ${Z2} (isotropy ${isotropy.toExponential(2)}, R ${R.toFixed(5)} against the predicted ${pred.R.toFixed(3)}); Z3 ${Z3} (top Hellmann-Feynman speed ${(topSpeed / C_STAR).toFixed(6)} c*); Z4 ${Z4}; Z5 ${Z5} (the phase string at sigma: eps ${control.eps.toFixed(6)}, ${witnessLine(control.w)}); C1 ${C1} (anti-string: eps ${epsOf(antiLevel.read.phase).toFixed(4)}, window ${antiWitness.hold.leastWindow.toFixed(4)}, fidelity ${antiWitness.hold.leastFidelity.toFixed(4)}), C2 ${C2} (mixed start fidelity ${c2Fidelity.toFixed(6)}); read, the phase string at the equal tension ${sigmaEqual.toFixed(6)}: eps ${equal.eps.toFixed(6)} (predicted ${predEqual.toFixed(4)}), singlet share ${equal.share.toFixed(4)}, ${witnessLine(equal.w)}`,
    metrics: {
      Z1: flag(Z1),
      Z2: flag(Z2),
      Z3: flag(Z3),
      Z4: flag(Z4),
      Z5: flag(Z5),
      instrument: flag(instrument),
      I1: flag(I1),
      I2: flag(I2),
      I3: flag(I3),
      I4: flag(I4),
      I5: flag(I5),
      I6: flag(I6),
      C1: flag(C1),
      C2: flag(C2),
      m0,
      tau,
      mCap: perAngle[CAP]!.m,
      Erest,
      ErestPredicted: pred.Erest,
      gapLow,
      gapHigh,
      inGap: flag(inGap),
      lambda2: Math.hypot(...read0.lambda2),
      residual: read0.residual,
      leastWindow: z1.hold.leastWindow,
      leastFidelity: z1.hold.leastFidelity,
      absorbed: z1.hold.absorbed,
      tailRises: z1.tail.rises,
      tailEdge: z1.tail.edge,
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
      controlEps: control.eps,
      controlWindow: control.w.hold.leastWindow,
      controlFidelity: control.w.hold.leastFidelity,
      equalEps: equal.eps,
      equalWindow: equal.w.hold.leastWindow,
      equalFidelity: equal.w.hold.leastFidelity,
      equalShare: equal.share,
      contactUnitarity: unitarity,
      boxWorst: Math.max(box1.worst, box2.worst),
      threadGap,
      threadSums,
      eps4,
      kappa: kap.mean,
      seconds: (Date.now() - started) / 1000,
    },
    control: {
      C1: flag(C1),
      C2: flag(C2),
      instrument: flag(instrument),
    },
    notes: `L2. The schedule: sigma ${sigma.toFixed(6)}, tau ${tau.toFixed(6)}, cap ${CAP}; the members at V = 0: m ${m0.toFixed(6)}, R_walk ${Rwalk.map(x => x.toFixed(6)).join(' ')}, midpoint ${mid.toFixed(5)}, sign ${sign}. I1 per angle: ${angleLine}. I2: unitarity ${unitarity.toExponential(2)}, stored ${contact0.stored} and ${contact1.stored}, released ${contact0.released} and ${contact1.released}. I3: V 0 and 1: ${box1.checked} starts, worst ${box1.worst.toExponential(2)}, ${box1.differ} differ, ${box1.inexact} inexact, ${box1.stray} stray; V 2: ${box2.checked} starts, worst ${box2.worst.toExponential(2)}, ${box2.differ} differ, ${box2.inexact} inexact, ${box2.stray} stray. I4: entries ${threadGap.toExponential(2)}, sums ${threadSums.toExponential(2)} (${plan.threads} threads). I5: radialWell ${wellCheck.E.toFixed(6)} against eps4 F l ${(eps4 * Fphase * lPhase).toFixed(6)}, Airy ${airy.toFixed(6)}, eps4 ${eps4.toFixed(6)}. I6: ${hfGap.toExponential(2)}. Prediction: E_b ${pred.Eb.toFixed(4)} (constant mass ${predConst.Eb.toFixed(4)}), T ${pred.T.toFixed(4)}, mean V ${pred.meanV.toFixed(3)}, R ${pred.R.toFixed(4)} (constant mass ${predConst.R.toFixed(4)}); the phase string at sigma ${predPhaseString.toFixed(4)}, at the equal tension ${predEqual.toFixed(4)}. The level: coarse read eps ${epsOf(coarse.read.phase).toFixed(5)}, first ${epsOf(first.read.phase).toFixed(5)}; singlet share ${share.toFixed(4)}, stores ${stored.toExponential(2)}, mean string length ${meanV.toFixed(3)}. Z2: ${dispLine}. Z3: ${followLine}. Z5 level: |lambda2| ${control.lambda.toFixed(8)}, residual ${control.residual.toExponential(2)}, singlet share ${control.share.toFixed(4)}. Equal tension level: |lambda2| ${equal.lambda.toFixed(8)}, residual ${equal.residual.toExponential(2)}. C1 profile: ${antiWitness.profile.map(x => x.toExponential(2)).join(' ')}. Z4: ${vacuum.map(v => `u(${v.V}) side ${v.side} ${v.sea ? 'love sea' : 'empty'} exact ${v.exact}, permutes ${v.permutes}, charged ${v.charged}`).join('; ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
