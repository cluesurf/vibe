// A 2T LINK REGISTER ON D4 TRIANGLES: IS THERE A COUPLING WHERE THE STRING STILL CONFINES AND A TIED MEMBER IS NEARLY
// LIGHT (E-SPN-0152)? E-SPN-0151 found that no Z3 plaquette term gives both, because Z3 in 4d has a first-order
// transition, and named the natural non-abelian register: the binary tetrahedral group 2T, the 24 Hurwitz units, which
// ARE the 24 roots. Known caveat: finite subgroups of SU(2) freeze at a first-order transition at weak coupling.
//
// DERIVED BEFORE THE RUN (the machinery: code/measure/hurwitz-gauge).
// 1. THE GROUP. The map 2q = (r0 + r1, r0 - r1, r2 + r3, r2 - r3) sends the 24 roots of D4 onto the 24 Hurwitz units,
//    an isometry up to 1/sqrt2, and they close under quaternion multiplication with every product exact in doubled
//    integers (I1). 7 classes, 7 irreps: 1, 1', 1'' (the quotient 2T / Q8 = Z3, characters w^k), 2 (chi = 2 q0), 2' = 2
//    x 1', 2'' = 2 x 1'', 3 (chi = 4 q0^2 - 1). Every character value lies in Z[w]: 2T's character field is Q(w), the
//    rule's own field.
// 2. WHICH CHARGE A MEMBER CARRIES. The centre of 2T is {1, -1}. The irreps 1, 1', 1'', 3 are trivial on it, and each
//    appears in a power of 3 (3 x 3 = 1 + 1' + 1'' + 3 + 3), so a static charge in any of them is screened by a tube of
//    3-plaquettes: perimeter law. Only 2, 2', 2'' are odd on the centre, and a closed surface carries an even centre
//    charge on every link, so only they can confine. The member carries the 2, the defining spinor, on which the Hurwitz
//    units act by left multiplication. ARITHMETIC: 2 has no unitary 2 x 2 form over Q(w): a traceless anti-Hermitian
//    unit anticommuting with [[0, 1], [-1, 0]] must be s sqrt-3 in one entry and t sqrt-3 in the other with 3 (s^2 +
//    t^2) = 1, and 3 is not a sum of two rational squares. So the complex spinor needs i, outside Z[w]. The REAL form
//    does not: the colour is a real quaternion (C^4 = 2 + 2, the second copy a flavour no gauge piece touches), moved by
//    left multiplication, a 4 x 4 matrix with entries 0, +-1, +-1/2, exact in Z[1/2] (G2a).
// 3. THE BEAT, exact. Per link the register holds one of 24 values. ELECTRIC piece: E = sum_R lambda_R P_R, P_R = (d_R /
//    24) sum_g conj(chi_R(g)) L_g, a class-function convolution, so it commutes with left and right multiplication (Gauss
//    exact). The natural eigenvalues: the Hamiltonian limit of the Wilson transfer matrix (time-like plaquettes, beta_t to
//    infinity) keeps g = 1 and the 8 nearest elements (q0 = 1/2), giving the Cayley-graph Laplacian C_R = sum_s (1 - Re
//    chi_R(s) / d_R) = 0, 12, 12, 4, 10, 10, 8 on 1, 1', 1'', 2, 2', 2'', 3 (2T's own "Casimir", compressed against
//    SU(2)'s 0, 3, 8, 15, 24 ratios). lambda_R = u^(C_R / 2) for a ring unit u. Its entries are Eisenstein integers over
//    24 x 7^k, so the beat is exact in Z[w][1/42], the string's own ring; the 1/3 comes from |2T| = 24 (G2a reads whether
//    any entry needs it). MAGNETIC piece: per triangle mu^(2 - chi_2(U_p)), chi_2 = 2 q0 an integer on 2T, so exact for a
//    ring unit mu, diagonal in the link values, gauge invariant, order-free and covariant. THE EMPTY REGISTER (E = 0, the
//    trivial irrep on every link, uniform over the 24 values) is fixed by the electric piece and NOT by the magnetic
//    piece: one face keeps it with amplitude (1/24) sum_g mu^(2 - chi_2(g)), of modulus below 1 for mu != 1 (G2c, predicted
//    to FAIL, as E-SPN-0151 found for Z3: a Kogut-Susskind magnetic term is never inert on E = 0, for any group).
// 4. THEOREM A SURVIVES NON-COMMUTATIVITY. In the link-value basis the magnetic piece is diagonal and the member's hop is
//    controlled by the link value (colour times L(U), U unchanged), so the two COMMUTE for every group, abelian or not.
//    With the electric piece off the register's distribution over link values never changes, so the member's reduced
//    state is the average of its walk over that fixed distribution, and the magnetic piece only multiplies each
//    background's branch by a phase: the member's reduced state is independent of the magnetic angle (G3a). The group
//    being non-abelian does NOT escape the trap. What escapes it is the electric piece, which commutes with neither, so the
//    magnetic piece acts on the member only through the register's electric dynamics (G3b). From the E = 0 register the
//    member walks the Haar-averaged background: paths w, w' to one dock interfere with weight E[q0(W(w'^-1 w))], 0 whenever
//    some link is run once. For Z3 that is the tree; for 2T also loops a Z3 register erases, the first a triangle run
//    twice (E[q0(g^2)] = -1/2, 2T's spinor is quaternionic). By beat 3 that loop enters only the return to the origin
//    (w a triangle, w' the same triangle backward), so the 2T member at strong coupling is the tree up to a small
//    correction: the interference fraction I(3) is predicted below 0.05 (G3c FAILS).
// 5. THE DIMENSION. The rule's register lives on the D4 bulk and runs in beats: 4 space dimensions plus time, a 5d
//    gauge theory. Pure SU(2) Yang-Mills in 5d has no continuum limit on the lattice: a first-order bulk transition at
//    beta ~ 1.64 separates the confined phase from a Coulomb phase (Creutz 1979), and it persists under anisotropy
//    (Farakos et al., arXiv:1110.4210). So in the bulk no group, 2T, 2I or SU(2), gives a tension that falls continuously
//    to zero: the continuous route exists only for a register in 3 space dimensions plus time, on the husk (READ below).
//    This is prior art, not measured here.
// 6. STRONG COUPLING AND FREEZING, deterministic estimators (no Monte Carlo).
//    HAMILTONIAN (the rule's own setting: H = sum_l C(R_l) / C_2 - y sum_p Re chi_2(U_p), the small-angle limit of the
//    beat). Second order about E = 0: per triangle -y^2 / 3. The static 2-2 string along a line of roots: each of the 8
//    triangles on a string link sends it to 2 x 2 = 1 + 3 (weights 1/4, 3/4) at energies 1 and 1 + C_3 / C_2 = 3, against
//    the vacuum's one excitation at 3, so its energy per link is eps(y) = 1 - 8 (1/4 + 1/4 - 1/3) y^2 = 1 - (4/3) y^2 (SU(2)'s
//    Casimirs would give 1 - 0.97 y^2). Weak coupling for a FINITE group is the frozen state (every U_p = 1): energy per dock
//    -64 y + 12 x 8 / 4 - 12 x 8 x (1/16) / (8 y) = -64 y + 24 - 3 / (4y), the last term one link moved to a nearest
//    element, turning its 8 triangles (cost 8 y). The first-order freezing point is where the frozen branch's ground
//    energy falls below the confined branch's (-32 y^2 / 3 per dock): y_f ~ 0.365, where eps(y_f) ~ 0.82. The string there
//    is still 82% of its strong-coupling tension: 2T FREEZES BEFORE ANY SMALL-TENSION WINDOW (G1b predicted to FAIL). In
//    the frozen phase the link values are pure gauge, the Wilson loop has a perimeter law and the string energy per link
//    jumps to 0. For 2O (6 nearest elements, q0 = 1/sqrt2) the same reads y_f ~ 0.55, eps ~ 0.65; for 2I (12 nearest, q0 =
//    phi/2) the crossing sits near y ~ 1, where the second-order string has gone negative: the series is no longer in
//    control, which is the sign that 2I freezes past the strong-coupling regime (but in 5d the SU(2) bulk transition of
//    point 5 comes first).
//    EUCLIDEAN (Wilson action S = -beta sum_p q0(U_p); ln Z per plaquette). Strong branch: ln a_0 + (closed surfaces per
//    plaquette) ln(sum_R d_R^(2 - F) (a_R / a_0)^F), the sphere sum read by F-fold convolution on the group. Weak branch:
//    beta - ((L - 1) / P) ln |G| + (L / P) ln sum_g exp(-n_p beta (1 - q0(g))). Their crossing is the freezing estimate,
//    exact at the self-dual point for Z2 and Z3 (C1), and calibrated on the 4d hypercubic lattice against Monte Carlo
//    (Hartung et al. 2022 Table IV: Q8 1.15(15), 2T 2.15(15), 2O 3.20(10), 2I 5.70(20); hand estimates 2T ~ 2.15, 2I ~ 5.5).
//    On D4 triangles read as a 4d spacetime (8 triangles per link, 3 tetrahedra per triangle) the tension is sigma = -ln u
//    - 3 u^2 + O(u^4) per triangle: a triangle is replaced by the other three faces of a tetrahedron at cost u^2 (u^4 on
//    squares), so the surface roughens early and the series is short-lived (sigma < 0 by u = 0.5). Hand estimate: 2T
//    freezes there near beta 1.3, u ~ 0.30, sigma ~ 0.93 per triangle: freezing MOVES earlier in beta on triangles, and
//    still falls where the tension is of lattice size.
// 7. SMALLEST EXTENSION (point 3 of the question). 2O (48) needs sqrt2: its units (1 +- i)/sqrt2, characters in Z[sqrt2];
//    2I (120) needs phi = (1 + sqrt5)/2: its units have coordinates in (1/2) Z[phi], its characters in Z[phi], and chi_2 =
//    2 q0 takes the values 0, +-1, +-2, +-phi, +-(phi - 1). The rule's ring would become Z[w, phi][1/210]: the electric
//    projectors carry 1/|2I| = 1/120 (a new 1/5, and 5 = (2 phi - 1)^2), and the magnetic phase exp(-i theta (2 - chi_2))
//    has exponents in Z[phi], so it needs two ring units (one for theta, one for theta phi) instead of one. In 4d Euclidean
//    2I agrees with SU(2) into the scaling region (Petcher-Weingarten 1980, Bhanot-Rebbi 1981); in the 5d bulk it cannot
//    help (point 5).
//
// PREDICTED: G1 FAILS on G1b (2T D4: y_f ~ 0.365, eps(y_f) ~ 0.82 of eps(0)); G2 FAILS on G2c only (the magnetic piece is
// not inert on E = 0), G2a, G2b, G2d hold; G3 FAILS on G3c (I(3) < 0.05) while G3a (the trap, exact) and G3b (the escape
// through the electric piece) hold; G4 not run. Controls and instrument hold.
//
// GATES, fixed before the gate run.
//  G1 GAUGE ONLY, the rule's setting (D4 space, the Hamiltonian estimators of point 6, 2T): G1a the freezing crossing y_f
//     exists in the frozen branch's valid range, and on [0, y_f] (1,001 points) eps(y) is positive and strictly
//     decreasing with the heuristic next-order error (s y^2)^2 at most 0.25 eps; G1b a small tension on the confined
//     branch before freezing: eps(y_f) <= 0.25 eps(0). G1 = G1a and G1b.
//  G2 G2a exact: 2T from the roots closed with every product exact; the electric piece at u = ringUnit(-1, 4) (the light
//     unit) and ringUnit(1, 0) a class function and exactly unitary over Z[w][1/42]; the colour transport a homomorphism
//     and orthogonal, exactly. G2b Gauss: on the toy triangle (code/measure/hurwitz-gauge toyTriangle: 24^3 register values,
//     a coined member on the three docks) the full beat (walk, magnetic at alpha, electric at alpha) commutes with the gauge
//     transformation at each dock by each of the 24 elements, on a Weyl vector, to 1e-12. G2c inert: the E = 0 register's
//     kept weight under one face equals 1 to 1e-12 at mu = alpha. G2d reach: in the path-sum run every dock holding weight
//     at beat t is within t root steps.
//  G3 G3a THE TRAP: on the toy, |[M, W] psi| <= 1e-13 on a Weyl vector, and from the E = 0 register (member at dock A,
//     slot 0, colour 1) the member's reduced state over 6 beats with the magnetic piece alone at alpha, 2 pi/3, pi equals
//     the piece-off state to 1e-11 (first written 1e-13; moved before the gate run, see PROBES). G3b THE ESCAPE: with the electric piece on (alpha), adding the magnetic piece (alpha)
//     moves the reduced state by more than 1e-6. G3c THE MEMBER LEAVES THE TREE at the only coupling this file can
//     reach exactly (strong coupling, the E = 0 register): the 2T path sum at beat 3 (light unit, the member's 24 slots
//     alike, as E-SPN-0151) has I(3) = <P_2T - P_tree, P_D4 - P_tree> / |P_D4 - P_tree|^2 >= 0.5. G3 = G3c (G3a and G3b
//     say where an escape can and cannot come from).
//  G4 only if G1 to G3 hold: not run otherwise.
// CONTROLS (a failure makes the verdict partial). C1 the abelian Z3 reduction: the Z3 path sum equals the tree
//  distribution (sum of |a(w)|^2 per dock) to 1e-14 at beats 1 to 3, and |P_D4 - P_tree| at beat 3 is E-SPN-0151's
//  1.59e-2 (to 1e-4); the Euclidean estimator's crossing for Z2 and Z3 on the 4d hypercubic lattice at their self-dual
//  points (1/2) ln(1 + sqrt2) and (2/3) ln(1 + sqrt3) to 1e-6; the Hamiltonian estimator for Z2 on the cubic lattice
//  (squares, 3 space dimensions) at its self-dual y = 1/2 to 1e-6. C2 the trivial-group reduction: the trivial path sum
//  equals the D4 walk (flux-plaquette d4Walk) at beats 1 to 3 to 1e-13. C3 the witness can see a change: on the toy the
//  electric piece alone moves the reduced state by more than 1e-6.
// INSTRUMENT (a failure makes the verdict partial). I1 2T's 7 irreps orthogonal exactly, its Casimirs 0, 12, 12, 4, 10,
//  10, 8; Q8, 2O, 2I close at 8, 48, 120 and 2 x 2 = 1 + 3 with 3 irreducible for 2T, 2O, 2I. I2 the Euclidean
//  estimator on the 4d hypercubic lattice within 20% of Hartung et al.'s beta_c for Q8, 2T, 2O, 2I. I3 the D4 census: 8
//  triangles per link, 32 per dock, 3 tetrahedra per triangle.
// READ, gating nothing: the Hamiltonian estimators for 2O and 2I on D4 and for every group on the husk (3 axes of 8
//  triangles a link, 6 face diagonals of 6), the Euclidean crossing on D4 triangles and on the 5d hypercubic lattice for
//  each group with u, sigma and the plaquette jump, and the electric piece's denominators.
// Verdict: partial if the instrument or a control fails; pass if G1 to G4 hold; fail otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed (written after the gates above). Three smokes of every code path on a reduced
//  plan (2 path-sum beats, 2 toy beats; tmp/g2t-smoke.log, -smoke2.log, -smoke3.log) and one probe of the Euclidean
//  branches (tmp/g2t-probe1.log). What they found and what changed, none of it a gate threshold except the one named:
//  - the Euclidean crossing search first looked for the lowest root and found none: the two branches cross THREE times
//    (Z2, Z3 and every finite group), because each branch runs out of its range. The weak branch's link gas counts every
//    link as free at small beta; the strong branch's closed-surface term tends to (closed per plaquette) ln |G| at large
//    beta. The search now takes, of all the roots, the one where the larger of the two corrections is least, and prints
//    that correction. It lands on the self-dual points of Z2 and Z3 (0.440687, 0.670035) with corrections 3.4e-3, 3.2e-3.
//  - G3a's reduced-state tolerance was first written 1e-13; the magnetic piece alone read 1.58e-13 at alpha after 2
//    beats (5.2e-14 at 2 pi/3, 0 at pi), which is float accumulation over 13,824 register values per entry (the theorem
//    says 0), not a signal: the commutator itself read 1.8e-16. The tolerance was moved to 1e-11 before the gate run,
//    still 6e9 below the escape the electric piece opens (6.4e-2 at 2 beats) and C3's 0.32.
//  - read in the smokes (not gated, and the gate run recomputes them): 2T on D4 y_f 0.3651, eps(y_f) 0.8222; the
//    calibration Q8 1.2367, 2T 2.1244, 2O 2.9005, 2I 4.7036 against 1.15, 2.15, 3.20, 5.70 (7.5, 1.2, 9.4, 17.5%, the
//    error growing with the group: the estimator has no surface roughening, which matters most for the densest group);
//    the E = 0 register's kept weight under one face 0.629 (alpha), 1/64 (2 pi/3), 1/9 (pi); the electric piece's
//    numerators are all divisible by 3 at both units, so its entries lie in Z[w][1/14]; at beat 2 the three path sums
//    agree exactly (every two paths to one dock arrive in different slots, E-SPN-0151's reason for 3 beats).
//
// FIRST RUN (tmp/g2t-exp-run1.log, 4 s): FAIL on G1 (G1b), G2 (G2c) and G3 (G3c), as predicted; controls and instrument
//  hold. No gate moved after it and none was rerun.
//  - The run reproduced the smokes' shared numbers exactly (same code, same order).
//  - G1 FAILS on G1b. 2T on D4 space, Hamiltonian: the frozen branch's ground energy falls below the confined one's at y_f
//    = 0.3651 (valid from 0.063), where the static string still costs eps = 1 - (4/3) y^2 = 0.8222 a link. G1a holds
//    (positive, strictly decreasing on 1,001 points, heuristic error at most 3.8% of eps).
//        lattice (space)     group   C_2     C_3/C_2   y_f      eps(y_f) a link          next-order guess
//        D4, 8 a link        2T      4       2         0.3651   0.822                    3.2e-2
//        D4                  2O      1.757   2.276     0.5487   0.649                    0.12
//        D4                  2I      2.292   2.412     1.0157   -0.126 (series broken)   1.27
//        husk axis/diag      2T      4       2         0.4442   0.737 / 0.803            6.9e-2 / 3.9e-2
//        husk                2O                        0.6754   0.469 / 0.601            0.28 / 0.16
//        husk                2I                        1.3036   broken                   > 1
//    2T and 2O freeze with the string at 0.65 to 0.82 of its strong-coupling energy: no small-tension window. 2I's
//    crossing lies where the second-order string has already gone through zero, so the strong-coupling series cannot say
//    whether a window opens before it: the estimator's statement is only that 2I freezes beyond the strong-coupling range.
//  - G2 FAILS on G2c only. G2a: the 24 roots close exactly as 2T; the electric piece at the light unit and at alpha is a
//    class function and exactly unitary with denominator 2,823,576 = 24 x 7^6, and every numerator is divisible by 3, so
//    its entries lie in Z[w][1/14]; the colour transport is an exact homomorphism and orthogonal. G2b: the full toy beat
//    commutes with all 72 gauge transformations to 3.5e-16. G2c: the E = 0 register keeps weight 0.629432 under one face at
//    alpha (1/64 at 2 pi/3, 1/9 at pi): not inert. G2d: no weight past t root steps.
//  - G3 FAILS on G3c. G3a (the trap) holds: [M, W] = 1.8e-16 and the magnetic piece alone moves the member's reduced
//    state by 1.6e-13, 5.2e-14, 0 at alpha, 2 pi/3, pi over 6 beats. G3b (the escape) holds: with the electric piece on,
//    adding the magnetic piece moves it by 0.136. G3c: at beat 3 the 2T path sum equals the Z3 tree EXACTLY, I(3) = 0
//    (318,888 path pairs, every one with a nonzero overlap a loop that runs some link once). The prediction (below 0.05)
//    held, its stated mechanism did not: the triangle run twice never reaches the member by beat 3, because two words
//    overlap only in the slot of their common last letter, and a triangle and its reverse end in different letters.
//  - C1: the Z3 path sum equals the tree to 0 at every beat, |P_D4 - P_tree| at beat 3 is 1.59e-2 (E-SPN-0151's), the
//    Euclidean estimator lands on Z2's and Z3's self-dual points (0.440687, 0.670035) and the Hamiltonian on Z2's y = 1/2.
//    C2: the trivial path sum equals the D4 walk to 5.6e-17. C3: the electric piece alone moves the toy member by 0.316.
//  - I2, the Euclidean calibration on the 4d hypercubic lattice: Q8 1.237, 2T 2.124, 2O 2.901, 2I 4.704 against Monte
//    Carlo 1.15(15), 2.15(15), 3.20(10), 5.70(20).
//  - READ, the Euclidean freezing estimate, each group (beta_f, u there, the plaquette jump strong -> weak, sigma = -ln u
//    minus the first decoration, the estimator's own worst correction there):
//        D4 triangles (as 4d)   Q8 0.796, u 0.204, 0.23 -> 0.97, sigma 1.59 - 0.12      correction 5e-3
//                               2T 1.311, u 0.307, 0.38 -> 0.94, sigma 1.18 - 0.28      correction 2.6e-2
//                               2O 1.679, u 0.378, 0.49 -> 0.90, sigma 0.97 - 0.43      correction 5.9e-2
//                               2I 2.199, u 0.464, 0.63 -> 0.83, sigma 0.77 - 0.65      correction 0.13
//        hypercubic 4d          2T 2.124, u 0.46; 2I 4.704
//        hypercubic 5d          Q8 0.944, 2T 1.564 (u 0.357), 2O 2.024, 2I 2.784 (u 0.543)
//    On D4 triangles freezing moves EARLIER in beta than on squares (2T 1.31 against 2.12) and to a SMALLER u (0.31
//    against 0.46): 8 triangles a link price one link flip at 4 beta against 3 beta on squares. Every group jumps in the
//    plaquette by 0.2 to 0.7 there: first order, strongly for the small groups. The first surface correction is a third of
//    the leading tension for 2T and nearly all of it for 2I, so on triangles the strong-coupling tension is only a rough
//    figure at freezing: large for 2T (about 0.9 a triangle), unknown for 2I. In 5d every finite group freezes above SU(2)'s
//    own first-order bulk point (1.64, literature) except Q8 and 2T, so in the bulk it is presumably the bulk transition,
//    not freezing, that ends the confined phase for 2O and 2I (not measured here).
//  - A READ AFTER THE GATE RUN, gating nothing (tmp/g2t-probe2.ts, -probe2.log, 24 s): the same path sums at beat 4
//    (99,606,144 pairs). The triangle-run-twice loops now occur, with 2T kernel -1/2 on all six orientations, yet the 2T
//    distribution still equals the tree to 1.1e-16 (I(4) = 2.6e-17) against |P_D4 - P_tree| = 7.4e-2: the pairs these
//    loops join add nothing to any dock's weight (zero slot overlap or cancellation; the probe did not separate them). The Z3 path sum equals the tree exactly, the trivial one the D4 walk to 2.8e-12. So at strong
//    coupling the non-abelian register is the tree for at least four beats: non-commutativity alone buys nothing.
//
// NEXT. The bulk cannot hold a continuously loosening string for any gauge group (point 5): the register that could must
//  live on the 3d husk, where the time direction makes it 3+1. There 2T and 2O still freeze with the string at 0.47 to
//  0.80 of its strong-coupling energy (the husk rows above), so the candidate is 2I on the husk, whose ring is Z[w, phi]
//  [1/210] and whose magnetic phase needs two units (point 7). The check is gauge-only again, and the tool must change:
//  the strong-coupling series is out of range where 2I freezes, so what is needed is the husk string's energy at 2I's
//  weak-coupling side, read by an exact transfer matrix of a thin husk slab (the 3d cross-section of a few docks, 120
//  values a link, gauge-fixed on a tree) against Wilson loops from the same deterministic transfer matrix. Separately,
//  Theorem A now holds for every group: the magnetic piece never lightens a member by itself, so a tied member becomes
//  light only where the register's own ground state is ordered, which a unitary beat must reach by preparation, not by
//  relaxation (E-SPN-0151 point 5).
//
// Depth L1 (the group, its characters, the commutation theorem) and L2 (strong- and weak-coupling branches of lattice
// gauge theory, the freezing of finite groups). DETERMINISM: no random numbers; Weyl vectors; exact enumeration of loops
// and of group sums. NOTHING MOVES: a link holds a value, the member's colour is rotated by the link it takes.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { d4Walk } from '@/code/measure/flux-plaquette'
import { treeBeat, wordSpace } from '@/code/measure/link-flux'
import { overEmpty, ringUnit, unitAngle, vibeDockExact, vibeShape } from '@/code/measure/swap-string'
import { d4Ball, d4Steps, ROOTS } from '@/code/measure/swap-sector'
import {
  binaryIcosahedral,
  binaryOctahedral,
  cyclicGroup,
  electricExact,
  euclideanBranches,
  euclideanFreezing,
  hamiltonianData,
  hamiltonianFreezing,
  huskVectors,
  hurwitzCasimirs,
  hurwitzCharacters,
  hurwitzExact,
  hypercubicLattice,
  magneticExact,
  memberDistribution,
  quaternionEight,
  spinorExact,
  stringSlope,
  toyBeat,
  toyGauge,
  toyReduced,
  toyTriangle,
  toyWalk,
  toyMagnetic,
  trivialGroup,
  triangleLattice,
  vectorGap,
  weylVector,
  TOY_SIZE,
  type GaugeGroup,
  type PlaquetteLattice,
} from '@/code/measure/hurwitz-gauge'

const LIGHT: readonly [number, number] = [-1, 4]
const ALPHA: readonly [number, number] = [1, 0]
const THETAS: readonly (readonly [string, number, number])[] = [
  ['alpha', 1, 0],
  ['2pi/3', 0, 2],
  ['pi', 0, 3],
]
const CASIMIRS = [0, 12, 12, 4, 10, 10, 8]
const ORDERS: Record<string, number> = { Q8: 8, '2O': 48, '2I': 120 }
const MONTE_CARLO: Record<string, number> = { Q8: 1.15, '2T': 2.15, '2O': 3.2, '2I': 5.7 }
const CALIBRATION = 0.2
const SMALL = 0.25
const ERROR = 0.25
const GRID = 1001
const EXACT_FLOAT = 1e-12
const TRAP = 1e-13
const TRAP_REDUCED = 1e-11
const MOVED = 1e-6
const INTERFERENCE = 0.5
const TREE_SAME = 1e-14
const WALK_SAME = 1e-13
const RECORDED_GAP = 1.59e-2
const RECORDED_GAP_TOLERANCE = 1e-4
const SELF_DUAL = 1e-6
const CENSUS = { perLink: 8, perDock: 32, tetrahedra: 3 }

export type RegisterPlan = { beats: number; toyBeats: number }

export const GATE_PLAN: RegisterPlan = { beats: 3, toyBeats: 6 }

export default experiment({
  id: 'spin/hurwitz-link-register',
  code: 'E-SPN-0152',
  title: 'a 2T link register on D4 triangles (the 24 roots as Hurwitz units) freezes before the string is light, fail (G1, G2c, G3): the beat is exact in Z[w][1/14] with a real-quaternion colour in Z[1/2] and Gauss holds to 3.5e-16, but the magnetic piece commutes with the member hop for every group (member state unchanged to 1.6e-13 at every angle) and moves it only through the electric piece (0.14); from the E = 0 register the 2T member is the Z3 tree exactly at beat 3 (I = 0); the Hamiltonian strong- and weak-coupling branches on D4 cross at y 0.365 where the string still costs 0.822 of its strong-coupling energy a link (2O 0.649, 2I past the series), and the Euclidean estimator, calibrated at 1 to 18% on 4d Monte Carlo freezing points, puts 2T on D4 triangles at beta 1.31 with u 0.31; the bulk is 4+1 dimensional, where SU(2) itself has a first-order transition',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return hurwitzRegisterRun(GATE_PLAN)
  },
})

export function hurwitzRegisterRun(plan: RegisterPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const e2 = (x: number): string => x.toExponential(2)
  const f4 = (x: number): string => x.toFixed(4)

  // ---------------- I1: the groups ----------------
  const h = hurwitzExact()
  const chars = hurwitzCharacters(h)
  const casimirs = hurwitzCasimirs(h, chars)
  const T2 = h.group
  const others: GaugeGroup[] = [quaternionEight(), binaryOctahedral(), binaryIcosahedral()]
  const su2 = [T2, others[1] as GaugeGroup, others[2] as GaugeGroup]
  const hdata = new Map(su2.map(g => [g.name, hamiltonianData(g)]))
  const I1 = chars.orthogonal && casimirs.every((c, k) => Math.abs(c - (CASIMIRS[k] as number)) < 1e-12) && others.every(g => g.order === ORDERS[g.name]) && su2.every(g => (hdata.get(g.name) as { tensorOk: boolean }).tensorOk)

  log(`I1 ${I1}: orthogonal ${chars.orthogonal}, Casimirs ${casimirs.join(',')}, orders ${others.map(g => `${g.name} ${g.order}`).join(', ')}, 2x2=1+3 ${su2.map(g => (hdata.get(g.name) as { tensorOk: boolean }).tensorOk).join(',')}`)

  // ---------------- I3: the D4 census, the husk ----------------
  const D4 = triangleLattice('D4 triangles', ROOTS as number[][])
  const husk = triangleLattice('husk triangles', huskVectors())
  const I3 = D4.plaquettes === CENSUS.perDock && D4.classes.length === 1 && (D4.classes[0] as { perLink: number }).perLink === CENSUS.perLink && D4.decorations === CENSUS.tetrahedra

  log(`I3 ${I3}: D4 ${JSON.stringify(D4)}; husk ${JSON.stringify(husk)}`)

  // ---------------- G2a: exactness ----------------
  const exponents = casimirs.map(c => c / 2)
  const electric = [LIGHT, ALPHA].map(([k, j]) => electricExact(h, chars, exponents, ringUnit(k, j)))
  const spinor = spinorExact(h)
  const muAlpha = magneticExact(h, ringUnit(ALPHA[0], ALPHA[1]))
  const G2a = h.fromRoots && h.closed && h.exactProducts && electric.every(e => e.classFunction && e.unitary) && spinor.homomorphism && spinor.orthogonal

  log(`G2a ${G2a}: roots ${h.fromRoots} closed ${h.closed} exact ${h.exactProducts}; electric ${electric.map(e => `class ${e.classFunction} unitary ${e.unitary} den ${e.den} needs 1/3 ${e.needsThird}`).join('; ')}; spinor ${JSON.stringify(spinor)}`)

  // ---------------- G2c: the E = 0 register under one face ----------------
  const G2c = Math.abs(muAlpha.keptWeight - 1) <= EXACT_FLOAT
  const kept = THETAS.map(([name, k, j]) => ({ name, weight: magneticExact(h, ringUnit(k, j)).keptWeight }))

  log(`G2c ${G2c}: kept weight ${kept.map(x => `${x.name} ${x.weight.toFixed(6)}`).join(', ')}`)

  // ---------------- the toy: G2b, G3a, G3b, C3 ----------------
  const toy = toyTriangle(h)
  const eAlpha = (electric[1] as { float: [number, number][] }).float
  const mAlpha = muAlpha.float
  const weyl = weylVector(TOY_SIZE)
  let gaussGap = 0

  for (let v = 0; v < 3; v++) {
    for (let k = 0; k < 24; k++) {
      const a = toyGauge(toy, v, k, weyl.re, weyl.im)
      const b = toyBeat(toy, { magnetic: mAlpha, electric: eAlpha }, a.re, a.im)
      const c = toyBeat(toy, { magnetic: mAlpha, electric: eAlpha }, weyl.re, weyl.im)
      const d = toyGauge(toy, v, k, c.re, c.im)

      gaussGap = Math.max(gaussGap, vectorGap(b, d))
    }
  }

  const G2b = gaussGap <= EXACT_FLOAT

  log(`G2b ${G2b}: gauge commutation gap ${e2(gaussGap)}`)

  const walked = toyWalk(toy, weyl.re, weyl.im)
  const mw = toyMagnetic(toy, mAlpha, walked.re, walked.im)
  const wmIn = toyMagnetic(toy, mAlpha, weyl.re, weyl.im)
  const wm = toyWalk(toy, wmIn.re, wmIn.im)
  const commutator = vectorGap(mw, wm)
  const start = { re: new Float64Array(TOY_SIZE), im: new Float64Array(TOY_SIZE) }
  const amp = 1 / Math.sqrt(24 * 24 * 24)

  // E = 0 register (uniform), member at dock A, slot 0, colour 1
  for (let r = 0; r < 24 * 24 * 24; r++) start.re[r * 24] = amp

  const reduced = (pieces: { magnetic?: [number, number][]; electric?: [number, number][] }): Float64Array[] => {
    let s = start
    const out: Float64Array[] = []

    for (let t = 0; t < plan.toyBeats; t++) {
      s = toyBeat(toy, pieces, s.re, s.im)
      out.push(toyReduced(s.re, s.im))
    }

    return out
  }
  const gapOf = (a: Float64Array[], b: Float64Array[]): number => Math.max(...a.map((x, t) => Math.max(...x.map((v, k) => Math.abs(v - ((b[t] as Float64Array)[k] as number))))))
  const off = reduced({})
  const magneticOnly = THETAS.map(([name, k, j]) => ({ name, gap: gapOf(reduced({ magnetic: magneticExact(h, ringUnit(k, j)).float }), off) }))
  const electricOnly = reduced({ electric: eAlpha })
  const both = reduced({ electric: eAlpha, magnetic: mAlpha })
  const escape = gapOf(both, electricOnly)
  const c3 = gapOf(electricOnly, off)
  const G3a = commutator <= TRAP && magneticOnly.every(x => x.gap <= TRAP_REDUCED)
  const G3b = escape > MOVED
  const C3 = c3 > MOVED

  log(`G3a ${G3a}: [M, W] ${e2(commutator)}, magnetic alone ${magneticOnly.map(x => `${x.name} ${e2(x.gap)}`).join(', ')}; G3b ${G3b}: escape ${e2(escape)}; C3 ${C3}: electric alone ${e2(c3)}`)

  // ---------------- the path sums: G3c, G2d, C1, C2 ----------------
  const u = ringUnit(LIGHT[0], LIGHT[1])
  const shape = vibeShape(overEmpty(vibeDockExact(1, 0, u), u))
  const table = Float64Array.from([shape.c[0], shape.c[1], shape.beta[0], shape.beta[1]])
  const T = plan.beats
  const ws = wordSpace(T)
  let wre = new Float64Array(ws.words * 24)
  let wim = new Float64Array(ws.words * 24)

  for (let d = 0; d < 24; d++) wre[d] = 1 / Math.sqrt(24)

  const ball = d4Ball(T + 1)
  const np = ball.points.length
  let dre = new Float64Array(np * 24)
  let dim = new Float64Array(np * 24)

  for (let d = 0; d < 24; d++) dre[(ball.index.get('0,0,0,0') as number) * 24 + d] = 1 / Math.sqrt(24)

  const Z3 = cyclicGroup(3)
  const triv = trivialGroup()
  const caches = new Map<string, Map<string, number>>([
    ['2T', new Map()],
    ['Z3', new Map()],
    ['trivial', new Map()],
  ])
  const rows: { t: number; treeGap: number; walkGap: number; reachBad: number; I: number; gap: number; move: number; pairs: number }[] = []

  for (let t = 1; t <= T; t++) {
    const ore = new Float64Array(ws.words * 24)
    const oim = new Float64Array(ws.words * 24)

    treeBeat(ws, table, 0, wre, wim, ore, oim)
    wre = ore
    wim = oim

    const r = d4Walk(table, ball.step, np, dre, dim)

    dre = r.re
    dim = r.im

    const walk = new Map<string, number>()

    for (let p = 0; p < np; p++) {
      let s = 0

      for (let d = 0; d < 24; d++) s += (dre[p * 24 + d] as number) ** 2 + (dim[p * 24 + d] as number) ** 2
      if (s > 0) walk.set((ball.points[p] as number[]).join(','), s)
    }

    const p2 = memberDistribution(ws, wre, wim, T2, caches.get('2T') as Map<string, number>)
    const pz = memberDistribution(ws, wre, wim, Z3, caches.get('Z3') as Map<string, number>)
    const p1 = memberDistribution(ws, wre, wim, triv, caches.get('trivial') as Map<string, number>)
    const keys = new Set([...p2.P.keys(), ...pz.P.keys(), ...p1.P.keys(), ...walk.keys()])
    let treeGap = 0
    let walkGap = 0
    let reachBad = 0
    let dot = 0
    let n2 = 0
    let m2 = 0

    for (const k of keys) {
      const tree = pz.tree.get(k) ?? 0
      const a = (p1.P.get(k) ?? 0) - tree
      const c = (p2.P.get(k) ?? 0) - tree

      treeGap = Math.max(treeGap, Math.abs((pz.P.get(k) ?? 0) - tree))
      walkGap = Math.max(walkGap, Math.abs((p1.P.get(k) ?? 0) - (walk.get(k) ?? 0)))
      if ((p2.P.get(k) ?? 0) > 1e-15 && d4Steps(k.split(',').map(Number)) > t) reachBad++
      dot += a * c
      n2 += a * a
      m2 += c * c
    }

    rows.push({ t, treeGap, walkGap, reachBad, I: n2 > 0 ? dot / n2 : 0, gap: Math.sqrt(n2), move: Math.sqrt(m2), pairs: p2.pairs })
    log(`beat ${t}: pairs ${p2.pairs}, Z3 vs tree ${e2(treeGap)}, trivial vs D4 walk ${e2(walkGap)}, 2T I ${(n2 > 0 ? dot / n2 : 0).toExponential(4)}, |P_D4 - P_tree| ${e2(Math.sqrt(n2))}, |P_2T - P_tree| ${e2(Math.sqrt(m2))}, reach bad ${reachBad}`)
  }

  const last = rows[T - 1] as (typeof rows)[number]
  const G3c = last.I >= INTERFERENCE
  const G2d = rows.every(r => r.reachBad === 0)
  const kernels = [...(caches.get('2T') as Map<string, number>).entries()].filter(([, v]) => v !== 0)

  log(`G3c ${G3c}; G2d ${G2d}; 2T nonzero loop kernels ${JSON.stringify(kernels)}`)

  // ---------------- estimators ----------------
  const sq3 = hypercubicLattice(3)
  const hc4 = hypercubicLattice(4)
  const hc5 = hypercubicLattice(5)
  const Z2 = cyclicGroup(2)
  const z2Cross = euclideanFreezing(Z2, hc4)
  const z3Cross = euclideanFreezing(Z3, hc4)
  const z2Ham = hamiltonianFreezing(Z2, { S: [1], C2: 2, C3: 0, meanSquare: 1, tensorOk: false }, sq3)
  const C1 =
    rows.every(r => r.treeGap <= TREE_SAME) &&
    Math.abs(last.gap - RECORDED_GAP) <= RECORDED_GAP_TOLERANCE &&
    !!z2Cross &&
    Math.abs(z2Cross.beta - Math.log(1 + Math.SQRT2) / 2) <= SELF_DUAL &&
    !!z3Cross &&
    Math.abs(z3Cross.beta - (2 / 3) * Math.log(1 + Math.sqrt(3))) <= SELF_DUAL &&
    !!z2Ham &&
    Math.abs(z2Ham.y - 0.5) <= SELF_DUAL
  const C2 = rows.every(r => r.walkGap <= WALK_SAME)

  log(`C1 ${C1}: Z2 hc4 ${JSON.stringify(z2Cross)}, Z3 hc4 ${JSON.stringify(z3Cross)}, Z2 Hamiltonian cubic ${JSON.stringify(z2Ham)}; C2 ${C2}`)

  const all = [others[0] as GaugeGroup, T2, others[1] as GaugeGroup, others[2] as GaugeGroup]
  const calibration = all.map(g => {
    const c = euclideanFreezing(g, hc4)

    return { name: g.name, beta: c ? c.beta : NaN, mc: MONTE_CARLO[g.name] as number, rel: c ? Math.abs(c.beta - (MONTE_CARLO[g.name] as number)) / (MONTE_CARLO[g.name] as number) : Infinity, cross: c }
  })
  const I2 = calibration.every(c => c.rel <= CALIBRATION)

  log(`I2 ${I2}: ${calibration.map(c => `${c.name} ${f4(c.beta)} vs ${c.mc} (${(100 * c.rel).toFixed(1)}%)`).join(', ')}`)

  const euclid = (L: PlaquetteLattice) =>
    all.map(g => {
      const c = euclideanFreezing(g, L)

      return { name: g.name, ...(c ?? { beta: NaN, u: NaN, plaquetteStrong: NaN, plaquetteWeak: NaN, sigmaLead: NaN, sigmaCorrection: NaN }) }
    })
  const euclidD4 = euclid(D4)
  const euclid5 = euclid(hc5)

  log(`Euclidean D4 ${JSON.stringify(euclidD4)}; 5d ${JSON.stringify(euclid5)}`)

  const ham = (L: PlaquetteLattice) =>
    su2.map(g => {
      const H = hamiltonianData(g)
      const f = hamiltonianFreezing(g, H, L)
      const strings = L.classes.map(c => {
        const s = stringSlope(H, L.perimeter, c.perLink)
        const y = f ? f.y : NaN

        return { perLink: c.perLink, slope: s, eps: 1 - s * y * y, error: (s * y * y) ** 2 }
      })

      return { name: g.name, C2: H.C2, C3: H.C3, y: f ? f.y : NaN, yValid: f ? f.yValid : NaN, strings }
    })
  const hamD4 = ham(D4)
  const hamHusk = ham(husk)

  log(`Hamiltonian D4 ${JSON.stringify(hamD4)}; husk ${JSON.stringify(hamHusk)}`)

  // ---------------- G1 ----------------
  const g1 = hamD4[0] as (typeof hamD4)[number]
  const s1 = (g1.strings[0] as { slope: number }).slope
  let monotone = true
  let positive = true
  let worstError = 0
  let prev = Infinity

  if (Number.isFinite(g1.y)) {
    for (let k = 0; k < GRID; k++) {
      const y = (g1.y * k) / (GRID - 1)
      const eps = 1 - s1 * y * y

      if (eps <= 0) positive = false
      if (k > 0 && !(eps < prev)) monotone = false
      worstError = Math.max(worstError, (s1 * y * y) ** 2 / eps)
      prev = eps
    }
  }

  const epsF = 1 - s1 * g1.y * g1.y
  const G1a = Number.isFinite(g1.y) && positive && monotone && worstError <= ERROR
  const G1b = Number.isFinite(g1.y) && epsF <= SMALL
  const G1 = G1a && G1b

  log(`G1 ${G1}: y_f ${g1.y}, eps(y_f) ${epsF}, positive ${positive}, monotone ${monotone}, worst error ratio ${worstError}`)

  const G2 = G2a && G2b && G2c && G2d
  const G3 = G3c
  const G4 = false
  const instrument = I1 && I2 && I3
  const controls = C1 && C2 && C3
  const status = !instrument || !controls ? 'partial' : G1 && G2 && G3 && G4 ? 'pass' : 'fail'
  const hamText = (rs: typeof hamD4): string => rs.map(r => `${r.name} (C2 ${f4(r.C2)}, C3 ${f4(r.C3)}): y_f ${f4(r.y)} (valid from ${f4(r.yValid)}), ${r.strings.map(s => `eps ${f4(s.eps)} on ${s.perLink}-triangle links (slope ${f4(s.slope)}, error ${e2(s.error)})`).join(', ')}`).join('; ')
  const euclidText = (rs: typeof euclidD4): string => rs.map(r => `${r.name} beta_f ${f4(r.beta)}, u ${f4(r.u)}, plaquette ${f4(r.plaquetteStrong)} -> ${f4(r.plaquetteWeak)}, sigma ${f4(r.sigmaLead)} - ${f4(r.sigmaCorrection)}`).join('; ')

  return verdict({
    status,
    claim: `G1 ${G1} (2T on D4, Hamiltonian: y_f ${f4(g1.y)}, eps(y_f) ${f4(epsF)} of eps(0) 1; G1a ${G1a}, G1b ${G1b}); G2 ${G2} (G2a ${G2a}, G2b ${G2b} gauge gap ${e2(gaussGap)}, G2c ${G2c} kept ${muAlpha.keptWeight.toFixed(6)}, G2d ${G2d}); G3 ${G3} (G3a ${G3a}: [M, W] ${e2(commutator)}, magnetic alone ${magneticOnly.map(x => e2(x.gap)).join(', ')}; G3b ${G3b}: ${e2(escape)}; G3c I(3) ${last.I.toExponential(3)}); G4 not run; controls C1 ${C1} C2 ${C2} C3 ${C3}; instrument I1 ${I1} I2 ${I2} I3 ${I3}`,
    metrics: {
      G1: G1 ? 1 : 0,
      G1a: G1a ? 1 : 0,
      G1b: G1b ? 1 : 0,
      G2: G2 ? 1 : 0,
      G2a: G2a ? 1 : 0,
      G2b: G2b ? 1 : 0,
      G2c: G2c ? 1 : 0,
      G2d: G2d ? 1 : 0,
      G3: G3 ? 1 : 0,
      G3a: G3a ? 1 : 0,
      G3b: G3b ? 1 : 0,
      G3c: G3c ? 1 : 0,
      G4: 0,
      C1: C1 ? 1 : 0,
      C2: C2 ? 1 : 0,
      C3: C3 ? 1 : 0,
      I1: I1 ? 1 : 0,
      I2: I2 ? 1 : 0,
      I3: I3 ? 1 : 0,
      yFreeze: g1.y,
      epsFreeze: epsF,
      interference: last.I,
      gaussGap,
      commutator,
      escape,
      keptWeight: muAlpha.keptWeight,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: C1 ? 1 : 0, C2: C2 ? 1 : 0, C3: C3 ? 1 : 0, instrument: instrument ? 1 : 0 },
    notes: `L1 and L2. Casimirs ${casimirs.join(', ')}; electric denominators ${electric.map(e => `${e.den} (needs 1/3 ${e.needsThird})`).join(', ')} at light and alpha, angles ${[LIGHT, ALPHA].map(([k, j]) => unitAngle(ringUnit(k, j)).toFixed(6)).join(', ')}. Kept weight of E = 0 under one face ${kept.map(x => `${x.name} ${x.weight.toFixed(6)}`).join(', ')}. Toy: gauge gap ${e2(gaussGap)}, [M, W] ${e2(commutator)}, magnetic alone ${magneticOnly.map(x => `${x.name} ${e2(x.gap)}`).join(', ')}, electric alone ${e2(c3)}, electric plus magnetic against electric ${e2(escape)}. Path sums ${rows.map(r => `beat ${r.t}: pairs ${r.pairs}, I ${r.I.toExponential(4)}, |P_D4 - P_tree| ${e2(r.gap)}, |P_2T - P_tree| ${e2(r.move)}, Z3 vs tree ${e2(r.treeGap)}, trivial vs walk ${e2(r.walkGap)}`).join('; ')}. 2T nonzero loop kernels ${JSON.stringify(kernels)}. Calibration (4d hypercubic) ${calibration.map(c => `${c.name} ${f4(c.beta)} vs ${c.mc}`).join(', ')}; Z2 ${z2Cross ? f4(z2Cross.beta) : 'none'}, Z3 ${z3Cross ? f4(z3Cross.beta) : 'none'}, Z2 Hamiltonian ${z2Ham ? f4(z2Ham.y) : 'none'}. Euclidean D4 triangles: ${euclidText(euclidD4)}. Euclidean 5d: ${euclidText(euclid5)}. Euclidean 4d: ${euclidText(calibration.map(c => ({ name: c.name, ...(c.cross ?? { beta: NaN, u: NaN, plaquetteStrong: NaN, plaquetteWeak: NaN, sigmaLead: NaN, sigmaCorrection: NaN }) })))}. Hamiltonian D4: ${hamText(hamD4)}. Hamiltonian husk: ${hamText(hamHusk)}. Euclidean branches at beta 1 on D4 for 2T ${JSON.stringify(euclideanBranches(T2, D4, 1))}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
