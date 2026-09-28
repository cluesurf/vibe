// A 2I LINK REGISTER ON THE HUSK: IS THERE A WINDOW BETWEEN CONFINEMENT AND FREEZING WHERE THE STRING IS LIGHT, AND CAN
// THE BEAT KEEP A REGISTER STATE THAT USES IT (E-SPN-0153)? E-SPN-0152 moved the register to the 3d husk (3+1), because in
// the 4+1 bulk even SU(2) has a first-order bulk transition, and found 2T and 2O freezing there with a heavy string. 2I
// froze past the reach of its strong-coupling series, so its fate on the husk was undecided. This file decides it with a
// deterministic weak-coupling estimator calibrated where the answer is known, and then asks the dynamical question.
//
// DERIVED BEFORE THE RUN (the machinery: code/measure/gauge-window).
// 1. THE LATTICE. The husk is the cubic lattice with the 6 axes and the 12 face diagonals (the D4 roots projected to 3d,
//    E-SPN-0152, code/measure/photon-husk): 9 link types a dock. Its triangles are {x, x + u, x + v} with u, v, v - u
//    husk vectors: 12 a dock with two axis links and a diagonal (area 1/2) and 8 with three diagonals (equilateral, side
//    sqrt2, area sqrt3/2), 20 in all. The register's time is the beat, so the Euclidean lattice is the husk times a time
//    direction: 10 link types (9 spatial, 1 temporal), the 20 triangles and one temporal square per husk link, 29
//    plaquettes a dock. An axis link sits on 8 triangles and 2 squares, a diagonal on 6 and 2, a temporal link on 18
//    squares (I1). Classical limit: a field B gives sum over the triangles of (B . A_p)^2 = |B|^2 (the 12 half squares)
//    plus 2 |B|^2 (the 8 equilaterals, normals the 4 body diagonals), 3 |B|^2 a dock, and the squares give 5 tau^2 |E|^2
//    (sum over the 9 links of l l^T = 5 I). With every plaquette at one beta the continuum limit is isotropic when the
//    time step is tau0 = sqrt(3/5) axis links, and then 1 / (2 g^2) = beta kappa / 8 with kappa = 3 / tau0 = sqrt15 =
//    3.873 (the hypercubic lattice has kappa = 1, beta = 4 / g^2). A spatial weight 1 / xi and a temporal weight xi with
//    tau = tau0 / xi keep that limit and walk toward the Hamiltonian (xi large), READ at xi 2 and 4.
// 2. THE TRANSFER MATRIX IS UNAFFORDABLE AT EVERY SLAB THAT CAN HOLD A STRING. The beat transfer matrix acts on gauge-
//    invariant functions of the spatial links of a periodic slab of V docks: 9V links, a maximal tree fixes V - 1, and the
//    residual global conjugation leaves (1 / 120) sum_g |C(g)|^(8V + 1) states. The thinnest slab (V = 1, all 9 links
//    self-loops) holds (1 / 120) sum_g |C(g)|^9 = 8.6e16 states (READ exactly), 1.4 EB of amplitudes, and it carries no
//    spatial string at all: a string needs 2 docks along it, V = 2 and about 120^16 = 1.8e33. The character basis is a
//    change of basis with the same count, and truncating it to low spins is no longer 2I. A transfer along a space
//    direction has a 2d slab times time as its cross-section: the same count. So the thinnest slab is out of reach by 20
//    orders of magnitude and more. The strong-coupling series is out of range too (E-SPN-0152: the husk's second-order
//    string is already negative where 2I freezes). THE TOOL USED is therefore the weak-coupling side, exact as a sum:
//    the one-loop (Gaussian) free energy of SU(2) on this lattice against the frozen branch of 2I. That is an estimate
//    whose error is calibrated on the hypercubic lattice (H1, I3, I4), not a transfer matrix.
// 3. THE FREEZING ESTIMATE. Near weak coupling a finite subgroup G of SU(2) lives on one of two branches. SU(2)-like:
//    link fluctuations wide against G's spacing, so sums over G are Haar integrals, and at one loop ln Z / docks =
//    beta sum_p w_p - f ln(16 pi^2) + (3/2) f ln(8 pi / beta) + (3/2) c_L, f = links - 1 the transverse modes a dock,
//    16 pi^2 the Haar volume near 1 in the coordinates a (U = exp(i a . sigma / 2), 1 - q0 = |a|^2 / 8), and c_L = <2 ln
//    |g(k)|^2 - ln det(M(k) + g g^dagger)> over the zone (M the plaquettes' curl-curl, g the gradient, the gauge orbit's
//    Jacobian in the first term). Frozen: pure gauge plus single links moved off it, ln Z / docks = beta sum_p w_p - f ln
//    |G| + sum_l ln sum_x exp(-beta n_l (1 - q0(x))). They cross where f ln(|G| / 16 pi^2) + (3/2) f ln(8 pi / beta) +
//    (3/2) c_L = the dilute gas, so, the gas aside, beta_f = 8 pi (|G| / 16 pi^2)^(2/3) e^(c_L / f): the group size enters
//    only through |G|^(2/3), the lattice only through c_L / f. On the hypercubic lattice c_L = -(d - 2) <ln k^2> = -2 x
//    2.00 in 4d (a scalar zone sum, I1), so beta_f(2I) = 25.13 x 0.833 x 0.264 = 5.5 against Hartung et al. 2022's
//    5.70(20), 2T 1.9 against 2.15, 2O 3.0 against 3.20 (the estimator runs low, least for the largest group, where the
//    Gaussian branch is most valid). This is Bhanot and Rebbi's 1981 entropy argument made exact at one loop by the zone
//    sum. On the husk the triangles are small against the continuum unit: at a given plaquette fluctuation the husk sits
//    at a weaker continuum coupling (predicted about 0.4 of the hypercubic g^2), so freezing, which happens at a set
//    plaquette fluctuation, lands at a much weaker continuum coupling there.
// 4. THE TENSION AT FREEZING. Below freezing 2I is SU(2) (Petcher and Weingarten 1980, Bhanot and Rebbi 1981, to all
//    orders of the strong-coupling series below spin 3), and 4d SU(2) confines at every coupling with sigma a^2 -> 0
//    continuously as beta -> infinity (asymptotic freedom; prior art, not measured here). SU(2)'s tension on the husk at
//    coupling beta is read from the hypercubic one at the beta whose tadpole-improved coupling g_TI^2 = 4 / (beta
//    kappa_TI) is the same (Lepage and Mackenzie 1993: kappa with each plaquette weighted by u0^perimeter, u0 the one-loop
//    mean link from the plaquettes), and again at the matched BARE coupling (4 / (beta kappa)): two matchings whose spread
//    measures the matching error. The hypercubic sigma a^2 is Monte Carlo (the table below, a sqrt(sigma) at beta 2.3 to
//    2.85 as recalled from Fingberg, Heller and Karsch 1993 and Lucini and Teper 2001, good to about 5%), extended above
//    2.85 by two-loop scaling in g_TI (I4 reads that step's own error inside the table). R = sigma a^2 tau0 / (-ln u(beta))
//    is the tension on a temporal square against the leading strong-coupling tension there (u = <q0> of 2I in the weight
//    e^(beta q0)). The chain's validity figure is the largest one-loop plaquette deficit at freezing. PREDICTED on the
//    husk: beta_f(2I) about 2.8 with deficits at most 0.18, g_TI^2 about 0.43, matched hypercubic beta about 10 (bare 11),
//    so R about 1e-10 or less: A WIDE WINDOW, far wider than 2I's on the hypercubic lattice (matched beta 5.4). 2T on the
//    husk freezes near beta 0.96 with one-loop deficits near 0.5, outside the estimator's range (read, undecided).
// 5. EXACT ARITHMETIC FOR 2I. Its 120 units have coordinates in (1/2) Z[phi], phi = (1 + sqrt5) / 2, and its nine
//    characters take values in Z[phi] (I2 checks every value, a + b phi with a, b integers). The electric projectors P_R =
//    (d_R / 120) sum_g chi_R(g) L_g carry 1 / 120 = 1 / (2^3 3 5), so with ring units over 7^k the beat is exact in Z[w,
//    phi][1/210]. Two things change against 2T. (a) The Cayley-graph Casimirs C_R = sum over the 12 nearest units of (1 -
//    chi_R(s) / d_R) lie in Z[phi], not Z (READ), so lambda_R = u^(C_R / 2) is not a ring element: the exact electric
//    piece takes integer exponents n_R (here n_R = d_R^2 - 1 = 4 j (j + 1), a conjugate taking its partner's), a
//    legitimate class-function electric term that is not the Cayley one. (b) The magnetic phase mu^(2 - chi_2(U_p)) has
//    chi_2 = a + b phi, so it needs two ring units, one for a and one for b, and their angles cannot stand in the exact
//    ratio phi: the exact magnetic term is theta_1 (2 - a) + theta_2 b, a class function but not Wilson's. Carry, never
//    round: neither is rounded to Z. The estimates above are for the Wilson form, the equilibrium question.
// 6. WHAT THE BEAT CAN KEEP (Q2). A kept state is one the beat F = E M maps to itself (an eigenvector) or an ensemble
//    that commutes with F. (a) The only gauge-invariant product state over links is the E = 0 register (a link state
//    invariant under left and right multiplication is constant): E keeps it and M does not, each face keeps it with
//    weight |(1 / 120) sum_g e^(-i theta (2 - chi_2(g)))|^2 < 1 (E-SPN-0152 G2c, now for 2I), so over the lattice its
//    kept weight is that to the number of faces, 0. Its plaquette is 0 anyway (the Haar mean of q0). (b) The flat
//    register (every U_p = 1, the gauge average of pure gauges) is ordered (plaquette 1) and M keeps it exactly, but E
//    moves it: a link at a definite value keeps it with amplitude e(1) = (1 / 120) sum_R d_R^2 lambda_R, of modulus below
//    1 whenever some lambda_R differs from lambda_1, so over the lattice its kept weight is 0. (c) THEOREM B FOR ANY
//    GROUP: in the flat sector every holonomy is g_y g_x^-1, a function of the endpoints, so a static pair's state and its
//    energy depend on the endpoints only locally: the tension is exactly 0. Flat order and tension exclude each other, for
//    any finite group, as for Z3 (E-SPN-0151). (d) What is needed is a state ordered at short distance and disordered at
//    long distance (the continuum vacuum). For a Hamiltonian that is the ground state. A beat is a product of non-
//    commuting local unitaries (a Floquet circuit), whose eigenvectors on a large lattice are expected to look like the
//    maximally mixed register locally (Floquet ETH: D'Alessio and Rigol 2014, Lazarides, Das and Moessner 2014), which
//    is the E = 0 register, the tree again. That is a conjecture, not a theorem, and this file does not prove it. What IS
//    a theorem (Abanin, De Roeck, Ho and Huveneers 2017; Else, Bauer and Nayak 2017): for BOUNDED local registers and a
//    beat whose local angle delta is small, the heating rate is at most exp(-c / delta), so the ground state of the
//    Floquet-Magnus Hamiltonian (to leading order the Kogut-Susskind H) is kept to that rate for exp(c / delta) beats. The
//    bounded register is exactly the hypothesis that theorem needs, and small-angle ring units exist exactly. So the
//    prediction: H3 FAILS for the exact candidates (a) and (b), and the route that remains is prethermal, not exact. READ:
//    on ONE face (the whole register is then a class function of the holonomy, 9 dimensional for 2I) the beat's
//    eigenvectors are computed exactly: a few-body register does keep ordered eigenvectors, which says nothing about the
//    infinite lattice.
//
// PREDICTED: H1 holds (2I hypercubic 5.4 against 5.70, 5%; the window criterion there says yes); H2 HOLDS (husk beta_f
// about 2.8, R far below 0.25 by either matching); H3 FAILS (no exact candidate kept); H4 not run. C1, C2, C3 hold.
//
// GATES, fixed before the gate run. The zone on N^4 = 16^4 midpoints, xi = 1.
//  H1 CALIBRATION. On the 4d hypercubic lattice the freezing estimate of 2I is within 10% of Hartung et al.'s 5.70, AND
//     the window criterion below, applied to 2I on the hypercubic lattice (ref = itself), says yes.
//  THE WINDOW CRITERION (for group G on lattice L): beta_f = the freezing estimate; VALID when the largest one-loop
//     plaquette deficit at beta_f is at most 0.25 and the dilute gas at most 0.25 a link; WINDOW when, at beta_f, 4 R_TI <=
//     0.25 and 4 R_bare <= 0.25 (the factor 4 is a Lambda-ratio error of 2 between the lattices, squared); CONTINUOUS when
//     the SU(2)-like branch stays above the frozen branch at every beta on a 0.01 grid from beta_w (the first beta where
//     R_TI <= 0.25) to beta_f, so the window is ended only by freezing. Yes = valid and window and continuous.
//  H2 on the husk times the beat, 2I: the window criterion says yes.
//  H3 (only if H2) a kept ordered state: one of the exact candidates (the E = 0 register, the flat register) is kept to
//     1e-12 per face and per link (kept weight and flat survival equal to 1) at the ring units of E-SPN-0152 (electric
//     light unit ringUnit(-1, 4), magnetic alpha ringUnit(1, 0)), with plaquette at least the one-loop least plaquette at
//     2I's husk freezing point.
//  H4 (only if H3) a tied member light in it with positive tension: not run otherwise.
// CONTROLS (a failure makes the verdict partial). C1 E-SPN-0152's Hamiltonian estimator on the husk reproduces its
//  record: 2T y_f 0.4442 (to 5e-5) with eps 0.737 on axis links and 0.803 on diagonals (to 5e-4), 2O 0.6754, 2I 1.3036.
//  C2 the trivial group: the window criterion says no (no confined phase), and a tied member in the trivial register is
//  the free D4 walk (E-SPN-0152's path sum against flux-plaquette d4Walk, beats 1 to 3, to 1e-13). C3 the criterion can
//  say no: Q8 and 2T on the hypercubic lattice (known to freeze before the scaling region) both get no.
// INSTRUMENT (a failure makes the verdict partial). I1 the census (10 link types, 20 triangles and 9 squares a dock,
//  per-link counts 10, 8, 18), the continuum tensor isotropic at xi = 1 (K = sqrt15 I to 1e-12), the zone sums: no
//  Cholesky failure, the equipartition sum rule sum_p w_p k_p = links - 1 to 1e-9, c_L converged (N 12 against 16) to
//  1e-3, and the hypercubic c_L equal to -2 <ln k^2> from an independent scalar zone sum on the same grid to 1e-9. I2 2I's
//  nine characters orthogonal to 1e-12 with every value in Z[phi]. I3 the freezing estimate of 2T and 2O on the
//  hypercubic lattice within 20% of Hartung et al.'s 2.15 and 3.20. I4 SU(2) scaling: two-loop scaling in g_TI from the
//  table's 2.85 entry gives a sqrt(sigma) at 2.5 within 30% of the table's.
// READ, gating nothing: the transfer-matrix state counts, 2I's Cayley Casimirs, the freezing estimate and the window
//  readings for every group on both lattices, the husk at xi 2 and 4, the one-face Floquet eigenvectors, Q8's hypercubic
//  freezing estimate against Hartung's 1.15.
// Verdict: partial if the instrument or a control fails; pass if H1 to H4 hold; fail otherwise.
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/g2i-probe1.log (written before the gates): the zone data and freezing
//  estimates on both lattices at N 8, 12, 16. It found two bugs, fixed before the gates: the husk's link list took all 18
//  vectors instead of one per pair (a key compared a 4-vector with a 3-vector), and the crossing search took the FIRST
//  crossing, which for 2I on the hypercubic lattice is a spurious one at beta 0.18 where the frozen branch's link gas is
//  not dilute (sum ln z 15.4); it now takes the last crossing. After the fixes it read the calibration numbers the gates
//  then name: hypercubic Q8 0.884, 2T 1.834, 2O 2.897, 2I 5.400; husk 2I 2.818. So H1's value was SEEN before its 10%
//  tolerance was written; the tolerance is Hartung's own error (0.2, 3.5%) plus the low bias the derivation predicted.
//  Two smokes of the whole run at N 8 (tmp/g2i-smoke.log, -smoke2.log): the first hung in the matching bisection when a
//  one-loop plaquette went negative (Q8 on the husk, deficit above 1), fixed to return NaN; and 2I's ninth irrep was
//  first built as the Galois conjugate of spin 3/2, which is spin 3/2 itself (its character is rational), so I2 read an
//  orthogonality error of 1. The ninth irrep is 2 x 2', the 4 of A5. No threshold moved.
//
// FIRST RUN (tmp/g2i-exp-run1.log, 5 s): FAIL on H3, as predicted. H1, H2, every control and the instrument hold. No gate
//  moved after it and none was rerun.
//  - I1: the husk census is 10 link types, 20 triangles and 9 squares a dock, 10, 8 and 18 plaquettes a link; K =
//    sqrt15 I to 2.3e-16. Zone sums (N 16): hypercubic c_L -3.99943 (N 12: -3.99946), equal to -2 <ln k^2> from the scalar
//    sum to the last digit; husk c_L -17.33606 (N 12: -17.33609); equipartition 3 and 9 to 5e-14; no Cholesky failure.
//    The husk's one-loop plaquette constants k_p: 0.2961, 0.3378 (the two triangle kinds), 0.2754, 0.3197 (the two
//    square kinds).
//  - I2: 2I's nine irreps orthogonal to 2.7e-16, every value in Z[phi]. Cayley Casimirs 0, 2.2918, 5.5279, 9, 12, 14,
//    15.7082, 14.4721, 15 (1, 2, 3, 4, 5, 6, 2', 3', 4 of A5): four of them irrational (12 - 6 phi and its kin), as point
//    5 said.
//  - H1 and I3, the hypercubic calibration (freezing estimate against Hartung et al.; one-loop deficit there):
//        group   estimate   Hartung     off      deficit   window criterion
//        Q8      0.884      1.15(15)   -23.2%    0.85      no (invalid)
//        2T      1.834      2.15(15)   -14.7%    0.41      no (invalid, below the scaling table)
//        2O      2.897      3.20(10)    -9.5%    0.26      no (invalid by 0.009; R 5.4e-3)
//        2I      5.400      5.70(20)    -5.3%    0.14      YES, R 2.8e-8
//    The estimator runs low by an amount that shrinks with the group, as derived. H1 holds.
//  - I4: two-loop scaling in g_TI from the table's 2.85 gives a sqrt(sigma)(2.5) 0.150 against 0.183 (-18.4%), the
//    known asymptotic-scaling violation, well inside the stated tolerance and irrelevant at R near 1e-18.
//  - H2 HOLDS. 2I on the husk x beat: beta_f 2.8183, one-loop plaquettes there 0.842, 0.820, 0.853, 0.830 (deficit at
//    most 0.180), dilute gas 0.106 a link. g_TI^2 0.443 (bare 0.366): matched hypercubic beta 9.77 (bare 10.92), where
//    SU(2)'s sigma a^2 is 8.9e-19 (bare 2.1e-21), so R = 1.6e-18 (bare 3.8e-21) against the strong-coupling -ln u 0.603 on
//    a temporal square of area tau0 = 1.095. No earlier crossing between the window's entry and freezing. 2I on the husk
//    freezes at a continuum coupling 0.44 of its hypercubic one (g_TI^2 0.443 against 0.87), exactly the mechanism of
//    point 3: the small triangles hold the plaquette fluctuation at a weaker continuum coupling. The window's ENTRY
//    (beta_w 0.89, where R_TI first falls to 0.25) sits where the one-loop deficit is about 0.5, so it is only a rough
//    marker; the gate rests on the freezing edge, where the chain is valid.
//        husk, xi 1   beta_f   deficit   matched TI (bare)   R_TI      verdict
//        Q8           0.466    1.09      none (1.81)         none      no (invalid)
//        2T           0.956    0.53      2.58 (3.70)         1.5e-2    no (invalid: undecided)
//        2O           1.503    0.34      4.69 (5.82)         3.5e-7    no (invalid: undecided)
//        2I           2.818    0.18      9.77 (10.92)        1.6e-18   YES
//    2T and 2O land OUTSIDE the estimator's range (one-loop deficit 0.53 and 0.34 at their freezing), so this file does
//    not decide them; their matched couplings, if trusted, would put even 2T past the hypercubic scaling onset, which
//    E-SPN-0152's second-order Hamiltonian estimate (a heavy string, 0.74 to 0.80) contradicts. Neither tool is reliable
//    there. For 2I both matchings and the one-loop validity agree.
//  - C1: E-SPN-0152's Hamiltonian record reproduced: 2T y_f 0.4442 with eps 0.7369 (axis) and 0.8027 (diagonal), 2O
//    0.6754, 2I 1.3036 (where its string is -0.86 and -0.39: the series broken). C2: the trivial group has no window (its
//    'freezing' at 0.125 is the Gaussian branch's own edge, with a strong-coupling tension of 0), and its tied member is
//    the D4 walk to 5.6e-17. C3: Q8 and 2T on the hypercubic lattice get no.
//  - H3 FAILS. The flat register keeps a link at its value with amplitude |e(1)| = 0.813058 a beat (n_R = d_R^2 - 1 at the
//    light unit), so over a lattice of links its kept weight is 0.661 to the number of links. The E = 0 register keeps
//    weight 0.629614 a face at alpha (2T had 0.629432) and has plaquette 0 (Haar <q0> 9e-19) against q* 0.820. Neither
//    exact candidate is kept.
//  - READ, the one-face register (9 class functions): F unitary to 4.4e-16; its eigenvectors have <q0(h)> from -0.502 to
//    0.456, weight on h = 1 at most 0.31. At these ring units (the magnetic angle alpha is strong coupling for one face)
//    even the few-body register has no eigenvector near flat, so the finite-cluster loophole does not appear here either.
//  - READ toward the Hamiltonian limit: at xi 2, 2I freezes at beta 3.17 with deficit 0.44, at xi 4 at 2.80 with deficit
//    1.13 (the spatial triangles, at weight 1 / xi, fluctuate past the one-loop range, while the temporal links freeze).
//    Invalid both: THIS ESTIMATOR DECIDES THE WINDOW ONLY FOR THE ISOTROPIC LATTICE (xi = 1), not for a beat much
//    shorter than a link. Where the bare matching can be read it stays deep (matched 12.3 and 10.8).
//  - READ, the transfer matrix: the thinnest slab holds exactly 85,996,339,603,424,768 gauge-invariant states (8.6e16),
//    the two-dock slab 3.7e33, as point 2 said.
//
// NEXT. The equilibrium question is answered for the isotropic husk x beat: 2I has a wide window there (freezing at a
//  continuum coupling where SU(2)'s tension is 1e-18 of its strong-coupling value), so bounded registers are enough and no
//  continuous group is needed; the model's "bounded registers, exact arithmetic" principle is not in conflict with a
//  light-and-confined string. Two things stay open. (1) The anisotropy: the rule's beat against its link is fixed by the
//  mixer (c* = c/2), and this estimator loses validity by xi 2. A two-loop Gaussian branch, or the one-loop branch with
//  separate spatial and temporal plaquette couplings tuned to the rule's c*, is the next estimator. (2) THE DYNAMICAL
//  GAP, now the whole problem: no exact candidate state is kept (H3), Theorem B holds for every finite group (flat order
//  means zero tension), and a generic Floquet beat is expected to keep only locally maximally mixed states. The route that
//  is a theorem is prethermal: at small beat angle delta a bounded-register beat keeps the ground state of its Floquet-
//  Magnus Hamiltonian to a heating rate exp(-c / delta) (Abanin, De Roeck, Ho and Huveneers 2017). The next experiment:
//  on the largest cluster whose register can be evolved exactly (the husk tetrahedron, 4 docks and 6 links, 120^3
//  gauge-fixed values for 2I, 24^3 for 2T), measure how the survival of the prepared ground state of H_E + H_B falls with
//  delta and with beats, against the ADHH form, with small-angle ring units exact in Z[w, phi][1/210]. H4 (the tied
//  member's spectrum) waits for a kept state.
//
// Depth L2 (lattice gauge theory: finite-group freezing, one-loop free energies, tadpole matching) and L1 (2I's
// characters, the husk census). DETERMINISM: no random numbers anywhere; every zone sum is a midpoint sum on an N^4 torus
// of momenta (exact for that torus, the limit read by raising N); the one-face eigenvectors are exact linear algebra.
// NOTHING MOVES: a link holds a value, a plaquette reads the product around it.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { d4Walk } from '@/code/measure/flux-plaquette'
import { treeBeat, wordSpace } from '@/code/measure/link-flux'
import { overEmpty, ringUnit, unitAngle, vibeDockExact, vibeShape } from '@/code/measure/swap-string'
import { d4Ball } from '@/code/measure/swap-sector'
import {
  binaryIcosahedral,
  binaryOctahedral,
  conjugacyClasses,
  hamiltonianData,
  hamiltonianFreezing,
  huskVectors,
  hurwitzExact,
  memberDistribution,
  nearest,
  quaternionEight,
  stringSlope,
  triangleLattice,
  trivialGroup,
  type GaugeGroup,
} from '@/code/measure/hurwitz-gauge'
import {
  cayleyCasimirs,
  continuumTensor,
  emptyKeptWeight,
  faceFloquet,
  flatSurvival,
  freezingPoint,
  frozenBranch,
  gaussianBranch,
  gaussianData,
  huskTimeGauge,
  hypercubicGauge,
  hypercubicTension,
  icosianCharacters,
  plaquetteMeans,
  plaquettesPerLink,
  tadpoleCoupling,
  tensionReading,
  twoLoop,
  type GaugeLattice,
  type GaussianData,
  type Reference,
  type ScalingTable,
  type TensionReading,
} from '@/code/measure/gauge-window'

const HARTUNG: Record<string, number> = { Q8: 1.15, '2T': 2.15, '2O': 3.2, '2I': 5.7 }
// SU(2), Wilson action, hypercubic: a sqrt(sigma) against beta (Fingberg, Heller and Karsch 1993; Lucini and Teper 2001;
// as recalled, about 5%)
const SU2_TABLE: ScalingTable = [
  { beta: 2.3, sqrtSigma: 0.369 },
  { beta: 2.4, sqrtSigma: 0.266 },
  { beta: 2.5, sqrtSigma: 0.1834 },
  { beta: 2.6, sqrtSigma: 0.1326 },
  { beta: 2.7, sqrtSigma: 0.0993 },
  { beta: 2.85, sqrtSigma: 0.063 },
]
const CALIBRATION = 0.1
const CALIBRATION_OTHERS = 0.2
const SCALING = 0.3
const WINDOW = 0.25
const MATCH_ERROR = 4
const DEFICIT = 0.25
const DILUTE = 0.25
const GRID_STEP = 0.01
const KEPT = 1e-12
const SUM_RULE = 1e-9
const CONVERGED = 1e-3
const SCALAR_SAME = 1e-9
const ORTHOGONAL = 1e-12
const ISOTROPIC = 1e-12
const WALK_SAME = 1e-13
const RECORD = { y: { '2T': 0.4442, '2O': 0.6754, '2I': 1.3036 } as Record<string, number>, epsAxis: 0.737, epsDiagonal: 0.803 }
const RECORD_Y = 5e-5
const RECORD_EPS = 5e-4
const CENSUS = { links: 10, triangles: 20, squares: 9, perLink: [10, 8, 18] }
const LIGHT: readonly [number, number] = [-1, 4]
const ALPHA: readonly [number, number] = [1, 0]

export type WindowPlan = { N: number; checkN: number; readN: number; xis: number[]; memberBeats: number }

export const GATE_PLAN: WindowPlan = { N: 16, checkN: 12, readN: 12, xis: [2, 4], memberBeats: 3 }

export default experiment({
  id: 'spin/icosian-husk-window',
  code: 'E-SPN-0153',
  title: 'a 2I link register on the husk has a wide window before it freezes, but no exact register state the beat keeps can use it, fail (H3): the transfer matrix is out of reach (8.6e16 states on the thinnest slab), so freezing is read from the one-loop SU(2) branch against the frozen branch, calibrated on the hypercubic lattice (2I 5.40 against Monte Carlo 5.70, 2T and 2O at 15 and 10%); on the husk x beat (isotropic, 29 plaquettes a dock) 2I freezes at beta 2.818 with one-loop deficit 0.18, at a tadpole-matched hypercubic beta 9.77 (bare 10.9), where the tension is 1.6e-18 of its strong-coupling value; 2I characters lie in Z[phi], so the exact beat lives in Z[w, phi][1/210] with integer electric exponents and a two-unit magnetic phase; the flat register (tension exactly 0 in the flat sector for any group) keeps a link at 0.813 a beat and the E = 0 register keeps a face at 0.630, so neither is kept; the estimator loses validity toward the Hamiltonian limit (deficit 0.44 at xi 2); E-SPN-0152 reproduced, the trivial group has no window',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return icosianWindowRun(GATE_PLAN)
  },
})

type Criterion = { group: string; lattice: string; beta: number; valid: boolean; window: boolean; continuous: boolean; yes: boolean; betaW: number; reading: TensionReading | null; dilutePerLink: number }

// the window criterion of the header, for group g on lattice L (G its zone data) against the hypercubic reference
function criterion(g: GaugeGroup, L: GaugeLattice, G: GaussianData, ref: Reference): Criterion {
  const f = freezingPoint(g, L, G)

  if (!f) return { group: g.name, lattice: L.name, beta: NaN, valid: false, window: false, continuous: false, yes: false, betaW: NaN, reading: null, dilutePerLink: NaN }

  const reading = tensionReading(L, G, ref, g, f.beta)
  const dilutePerLink = f.dilute / L.links.length
  const valid = reading.deficit <= DEFICIT && dilutePerLink <= DILUTE
  const window = MATCH_ERROR * reading.ratioTI <= WINDOW && MATCH_ERROR * reading.ratioBare <= WINDOW
  let betaW = NaN

  for (let k = 1; k * GRID_STEP < f.beta; k++) {
    const b = k * GRID_STEP

    if (plaquetteMeans(L, G, b).some(q => !(q > 0))) continue
    if (tensionReading(L, G, ref, g, b).ratioTI <= WINDOW) {
      betaW = b
      break
    }
  }

  let continuous = Number.isFinite(betaW)

  for (let b = betaW; continuous && b < f.beta - GRID_STEP / 2; b += GRID_STEP) if (frozenBranch(g, L, b).value - gaussianBranch(G, b) >= 0) continuous = false

  return { group: g.name, lattice: L.name, beta: f.beta, valid, window, continuous, yes: valid && window && continuous, betaW, reading, dilutePerLink }
}

export function icosianWindowRun(plan: WindowPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const e2 = (x: number): string => x.toExponential(2)
  const f4 = (x: number): string => x.toFixed(4)

  // ---------------- groups ----------------
  const T2 = hurwitzExact().group
  const I2g = binaryIcosahedral()
  const O2 = binaryOctahedral()
  const Q8 = quaternionEight()
  const triv = trivialGroup()
  const groups = [Q8, T2, O2, I2g]

  // ---------------- I1: census, continuum, zone sums ----------------
  const hc = hypercubicGauge(4)
  const husk = huskTimeGauge(1)
  const kinds = { triangles: husk.plaquettes.filter(p => p.kind === 'triangle').length, squares: husk.plaquettes.filter(p => p.kind === 'temporal square').length }
  const perLink = [...new Set(plaquettesPerLink(husk).count)].sort((a, b) => b - a)
  const censusOk = husk.links.length === CENSUS.links && kinds.triangles === CENSUS.triangles && kinds.squares === CENSUS.squares && JSON.stringify(perLink) === JSON.stringify([...CENSUS.perLink].sort((a, b) => b - a))
  const iso = continuumTensor(husk)
  const isoOk = iso.anisotropy <= ISOTROPIC && Math.abs(iso.kappa - Math.sqrt(15)) <= ISOTROPIC

  log(`census ${censusOk}: links ${husk.links.length}, ${JSON.stringify(kinds)}, per link ${perLink.join('/')}; continuum kappa ${iso.kappa} (sqrt15 ${Math.sqrt(15)}), anisotropy ${e2(iso.anisotropy)}`)

  const Ghc = gaussianData(hc, plan.N)
  const GhcCheck = gaussianData(hc, plan.checkN)
  const Gh = gaussianData(husk, plan.N)
  const GhCheck = gaussianData(husk, plan.checkN)

  // the independent scalar zone sum <ln k^2> on the same midpoint grid
  let scalar = 0

  for (let t = 0; t < plan.N ** 4; t++) {
    let r = t
    let k2 = 0

    for (let a = 0; a < 4; a++) {
      k2 += 4 * Math.sin((Math.PI * ((r % plan.N) + 0.5)) / plan.N) ** 2
      r = Math.floor(r / plan.N)
    }

    scalar += Math.log(k2)
  }

  scalar /= plan.N ** 4

  const zoneOk =
    [Ghc, GhcCheck, Gh, GhCheck].every(G => G.failures === 0 && Math.abs(G.equipartition - (G.links - 1)) <= SUM_RULE) &&
    Math.abs(Ghc.cL - GhcCheck.cL) <= CONVERGED &&
    Math.abs(Gh.cL - GhCheck.cL) <= CONVERGED &&
    Math.abs(Ghc.cL + 2 * scalar) <= SCALAR_SAME
  const I1 = censusOk && isoOk && zoneOk

  log(`I1 ${I1}: hypercubic cL ${Ghc.cL} (N ${plan.checkN}: ${GhcCheck.cL}), -2 <ln k^2> ${-2 * scalar}; husk cL ${Gh.cL} (N ${plan.checkN}: ${GhCheck.cL}); equipartition ${[Ghc, Gh].map(G => `${G.equipartition} of ${G.links - 1}`).join(', ')}; least pivots ${e2(Ghc.leastPivot)}, ${e2(Gh.leastPivot)}; kappa_p husk ${[...new Set(Gh.kappaP.map(x => x.toFixed(5)))].join(' ')}`)

  // ---------------- I2: 2I's characters ----------------
  const chars = icosianCharacters(I2g)
  const I2 = chars.dims.length === 9 && chars.orthogonality <= ORTHOGONAL && chars.integral
  const casimirs = cayleyCasimirs(I2g, chars, nearest(I2g))

  log(`I2 ${I2}: 2I irreps ${chars.names.join(' ')}, orthogonality ${e2(chars.orthogonality)}, integral in Z[phi] ${chars.integral}; Cayley Casimirs ${casimirs.map(c => c.toFixed(4)).join(' ')}`)

  // ---------------- the reference and I4 ----------------
  const ref: Reference = { lattice: hc, data: Ghc, table: SU2_TABLE }
  const gRef = (b: number): number => tadpoleCoupling(hc, Ghc, b).g2
  const last = SU2_TABLE[SU2_TABLE.length - 1] as { beta: number; sqrtSigma: number }
  const at25 = SU2_TABLE.find(r => r.beta === 2.5) as { beta: number; sqrtSigma: number }
  const predicted25 = last.sqrtSigma * (twoLoop(gRef(2.5)) / twoLoop(gRef(last.beta)))
  const I4 = Math.abs(predicted25 - at25.sqrtSigma) / at25.sqrtSigma <= SCALING

  log(`I4 ${I4}: two-loop g_TI from ${last.beta} predicts a sqrt(sigma)(2.5) ${f4(predicted25)} against ${at25.sqrtSigma} (${(100 * (predicted25 / at25.sqrtSigma - 1)).toFixed(1)}%); hypercubic sigma a^2 at 2.5 by the function ${hypercubicTension(SU2_TABLE, 2.5, gRef)}`)

  // ---------------- H1, I3, C3: the hypercubic lattice ----------------
  const hcCrit = groups.map(g => criterion(g, hc, Ghc, ref))
  const hcOf = (name: string): Criterion => hcCrit.find(c => c.group === name) as Criterion
  const rel = (name: string): number => Math.abs(hcOf(name).beta - (HARTUNG[name] as number)) / (HARTUNG[name] as number)
  const H1 = rel('2I') <= CALIBRATION && hcOf('2I').yes
  const I3 = rel('2T') <= CALIBRATION_OTHERS && rel('2O') <= CALIBRATION_OTHERS
  const C3 = !hcOf('Q8').yes && !hcOf('2T').yes
  const critText = (c: Criterion): string =>
    `${c.group} on ${c.lattice}: beta_f ${f4(c.beta)}, valid ${c.valid} (deficit ${c.reading ? f4(c.reading.deficit) : 'none'}, dilute a link ${f4(c.dilutePerLink)}), R_TI ${c.reading ? e2(c.reading.ratioTI) : 'none'} (matched beta ${c.reading ? f4(c.reading.matchTI) : 'none'}), R_bare ${c.reading ? e2(c.reading.ratioBare) : 'none'} (matched ${c.reading ? f4(c.reading.matchBare) : 'none'}), beta_w ${f4(c.betaW)}, continuous ${c.continuous}, window ${c.window}: ${c.yes ? 'YES' : 'no'}`

  log(`H1 ${H1}, I3 ${I3}, C3 ${C3}: ${hcCrit.map(c => `${critText(c)} [Hartung ${HARTUNG[c.group]}, ${(100 * (c.beta / (HARTUNG[c.group] as number) - 1)).toFixed(1)}%]`).join('; ')}`)

  // ---------------- H2: the husk ----------------
  const huskCrit = groups.map(g => criterion(g, husk, Gh, ref))
  const h2i = huskCrit.find(c => c.group === '2I') as Criterion
  const H2 = h2i.yes

  log(`H2 ${H2}: ${huskCrit.map(critText).join('; ')}`)

  // plaquettes at 2I's husk freezing point
  const plaqF = Number.isFinite(h2i.beta) ? plaquetteMeans(husk, Gh, h2i.beta) : []
  const qStar = plaqF.length ? Math.min(...plaqF) : NaN

  log(`one-loop plaquettes at 2I's husk freezing ${[...new Set(plaqF.map(q => q.toFixed(4)))].join(' ')}; q* ${f4(qStar)}; reading ${JSON.stringify(h2i.reading)}`)

  // ---------------- C2: the trivial group ----------------
  const trivCrit = criterion(triv, husk, Gh, ref)
  const u = ringUnit(LIGHT[0], LIGHT[1])
  const shape = vibeShape(overEmpty(vibeDockExact(1, 0, u), u))
  const table = Float64Array.from([shape.c[0], shape.c[1], shape.beta[0], shape.beta[1]])
  const ws = wordSpace(plan.memberBeats)
  let wre = new Float64Array(ws.words * 24)
  let wim = new Float64Array(ws.words * 24)

  for (let d = 0; d < 24; d++) wre[d] = 1 / Math.sqrt(24)

  const ball = d4Ball(plan.memberBeats + 1)
  let dre = new Float64Array(ball.points.length * 24)
  let dim = new Float64Array(ball.points.length * 24)

  for (let d = 0; d < 24; d++) dre[(ball.index.get('0,0,0,0') as number) * 24 + d] = 1 / Math.sqrt(24)

  let walkGap = 0
  const cache = new Map<string, number>()

  for (let t = 1; t <= plan.memberBeats; t++) {
    const ore = new Float64Array(ws.words * 24)
    const oim = new Float64Array(ws.words * 24)

    treeBeat(ws, table, 0, wre, wim, ore, oim)
    wre = ore
    wim = oim

    const r = d4Walk(table, ball.step, ball.points.length, dre, dim)

    dre = r.re
    dim = r.im

    const p1 = memberDistribution(ws, wre, wim, triv, cache)

    for (let p = 0; p < ball.points.length; p++) {
      let s = 0

      for (let d = 0; d < 24; d++) s += (dre[p * 24 + d] as number) ** 2 + (dim[p * 24 + d] as number) ** 2

      const k = (ball.points[p] as number[]).join(',')

      walkGap = Math.max(walkGap, Math.abs((p1.P.get(k) ?? 0) - s))
    }
  }

  const C2 = !trivCrit.yes && walkGap <= WALK_SAME

  log(`C2 ${C2}: ${critText(trivCrit)}; trivial member against the D4 walk ${e2(walkGap)}`)

  // ---------------- C1: E-SPN-0152's Hamiltonian record on the husk ----------------
  const huskTri = triangleLattice('husk triangles', huskVectors())
  const ham = [T2, O2, I2g].map(g => {
    const H = hamiltonianData(g)
    const f = hamiltonianFreezing(g, H, huskTri)
    const y = f ? f.y : NaN
    const eps = huskTri.classes.map(c => 1 - stringSlope(H, huskTri.perimeter, c.perLink) * y * y)

    return { name: g.name, y, eps, perLink: huskTri.classes.map(c => c.perLink) }
  })
  const h2t = ham[0] as { y: number; eps: number[]; perLink: number[] }
  const axis = h2t.perLink.indexOf(8)
  const diag = h2t.perLink.indexOf(6)
  const C1 =
    ham.every(r => Math.abs(r.y - (RECORD.y[r.name] as number)) <= RECORD_Y) && Math.abs((h2t.eps[axis] as number) - RECORD.epsAxis) <= RECORD_EPS && Math.abs((h2t.eps[diag] as number) - RECORD.epsDiagonal) <= RECORD_EPS

  log(`C1 ${C1}: ${ham.map(r => `${r.name} y_f ${f4(r.y)} eps ${r.eps.map(f4).join('/')} (per link ${r.perLink.join('/')})`).join('; ')}`)

  // ---------------- H3: exact kept candidates ----------------
  const thetaE = unitAngle(u)
  const thetaM = unitAngle(ringUnit(ALPHA[0], ALPHA[1]))
  const n = chars.dims.map(d => d * d - 1)
  const lambda = n.map(k => [Math.cos(k * thetaE), Math.sin(k * thetaE)] as [number, number])
  const survival = flatSurvival(chars, I2g.order, lambda)
  const keptEmpty = emptyKeptWeight(I2g, thetaM)
  const flatKept = Math.abs(survival - 1) <= KEPT
  const emptyKept = Math.abs(keptEmpty - 1) <= KEPT
  // plaquettes: the flat register 1, the E = 0 register the Haar mean of q0
  const haarQ0 = I2g.q0.reduce((s, x) => s + x, 0) / I2g.order
  const H3 = H2 && ((flatKept && 1 >= qStar) || (emptyKept && haarQ0 >= qStar))
  const classes = conjugacyClasses(I2g)
  const face = faceFloquet(I2g, chars, classes, lambda, thetaM)
  const order = face.q0.map((q, i) => ({ q, id: face.identity[i] as number, phase: face.phases[i] as number })).sort((a, b) => b.q - a.q)

  log(`H3 ${H3}: flat survival a link ${survival.toFixed(12)} (kept ${flatKept}), E = 0 kept weight a face ${keptEmpty.toFixed(12)} (kept ${emptyKept}), Haar <q0> ${e2(haarQ0)}, q* ${f4(qStar)}; one face: F unitary to ${e2(face.unitarity)}, eigenvectors by <q0(h)> ${order.map(o => `${f4(o.q)} (h = 1 weight ${f4(o.id)})`).join(', ')}`)

  // ---------------- READ: the anisotropic husk, the transfer-matrix count ----------------
  const xiReads = plan.xis.map(xi => {
    const L = huskTimeGauge(xi)
    const G = gaussianData(L, plan.readN)

    return { xi, cL: G.cL, rows: [T2, I2g].map(g => criterion(g, L, G, ref)) }
  })

  log(`READ xi: ${xiReads.map(x => `xi ${x.xi} (cL ${f4(x.cL)}): ${x.rows.map(critText).join('; ')}`).join(' | ')}`)

  let count = 0n
  let count2 = 0n

  for (const cl of classes) {
    const centralizer = BigInt(I2g.order / cl.length)

    count += BigInt(cl.length) * centralizer ** 9n
    count2 += BigInt(cl.length) * centralizer ** 17n
  }

  count /= BigInt(I2g.order)
  count2 /= BigInt(I2g.order)

  log(`READ transfer matrix: V = 1 slab ${count} states (${Number(count).toExponential(3)}), V = 2 ${Number(count2).toExponential(3)}`)

  // ---------------- verdict ----------------
  const H4 = false
  const instrument = I1 && I2 && I3 && I4
  const controls = C1 && C2 && C3
  const status = !instrument || !controls ? 'partial' : H1 && H2 && H3 && H4 ? 'pass' : 'fail'
  const r = h2i.reading

  return verdict({
    status,
    claim: `H1 ${H1} (2I hypercubic beta_f ${f4(hcOf('2I').beta)} vs 5.70, window ${hcOf('2I').yes}); H2 ${H2} (2I on the husk x beat: beta_f ${f4(h2i.beta)}, deficit ${r ? f4(r.deficit) : 'none'}, matched hypercubic beta ${r ? f4(r.matchTI) : 'none'} (bare ${r ? f4(r.matchBare) : 'none'}), R ${r ? e2(r.ratioTI) : 'none'} (bare ${r ? e2(r.ratioBare) : 'none'}), window from beta ${f4(h2i.betaW)}); H3 ${H3} (flat survival a link ${survival.toFixed(6)}, E = 0 kept a face ${keptEmpty.toFixed(6)}); H4 not run; controls C1 ${C1} C2 ${C2} C3 ${C3}; instrument I1 ${I1} I2 ${I2} I3 ${I3} I4 ${I4}`,
    metrics: {
      H1: H1 ? 1 : 0,
      H2: H2 ? 1 : 0,
      H3: H3 ? 1 : 0,
      H4: 0,
      C1: C1 ? 1 : 0,
      C2: C2 ? 1 : 0,
      C3: C3 ? 1 : 0,
      I1: I1 ? 1 : 0,
      I2: I2 ? 1 : 0,
      I3: I3 ? 1 : 0,
      I4: I4 ? 1 : 0,
      betaFreezeHypercubic: hcOf('2I').beta,
      betaFreezeHusk: h2i.beta,
      matchedBeta: r ? r.matchTI : NaN,
      ratio: r ? r.ratioTI : NaN,
      flatSurvival: survival,
      emptyKept: keptEmpty,
      seconds: (Date.now() - started) / 1000,
    },
    control: { C1: C1 ? 1 : 0, C2: C2 ? 1 : 0, C3: C3 ? 1 : 0, instrument: instrument ? 1 : 0 },
    notes: `L2 and L1. Hypercubic: ${hcCrit.map(critText).join('; ')}. Husk x beat: ${huskCrit.map(critText).join('; ')}. Trivial: ${critText(trivCrit)}. xi reads: ${xiReads.map(x => `xi ${x.xi}: ${x.rows.map(critText).join('; ')}`).join(' | ')}. cL hypercubic ${Ghc.cL}, husk ${Gh.cL}. 2I Cayley Casimirs ${casimirs.map(c => c.toFixed(4)).join(' ')}. Hamiltonian record ${ham.map(h => `${h.name} ${f4(h.y)}`).join(', ')}. One face eigenvectors <q0> ${order.map(o => f4(o.q)).join(' ')}. Transfer matrix V = 1 ${count}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
