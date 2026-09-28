// DOES A SMALL-ANGLE BEAT KEEP THE ORDERED 2I VACUUM PRETHERMALLY ON A HUSK PATCH (E-SPN-0154)? E-SPN-0153 found that 2I
// on the husk x beat reaches SU(2)'s scaling region before it freezes (the equilibrium string exists in a bounded
// register, ring Z[w, phi][1/210]) and that no ordered register state is KEPT by the beat. The theorem that remains is
// prethermal: Abanin, De Roeck, Ho and Huveneers 2017 (and Else, Bauer and Nayak 2017) prove that a Floquet drive of a
// bounded local register with small beat angle delta heats at a rate at most exp(-c / delta), so the ground state of its
// effective Hamiltonian survives for exp(c / delta) beats. This file asks it on the largest patch whose 2I register can be
// evolved exactly. The machinery is code/measure/prethermal-patch.
//
// DERIVED BEFORE THE RUN.
// 1. THE PATCH. A single husk triangle has one loop: its register is the 9 class functions of the holonomy (E-SPN-0153's
//    one face), and its only Wilson loop is the plaquette. Two triangles on a shared link (the RHOMBUS: 4 docks, 5
//    links, loops 2) hold the first non-plaquette loop, the rhombus boundary. The regular husk TETRAHEDRON, docks 0,
//    (1,1,0), (1,0,1), (0,1,1), pairwise one face diagonal apart (6 husk links, 4 equilateral husk triangles), is the
//    smallest CLOSED patch: every link sits on two plaquettes, as every link of the husk does (on 6 to 8 there), and it
//    holds the perimeter-4 loop 0 -> 1 -> 2 -> 3 -> 0 besides its 4 plaquettes. Loops b1 = links - docks + 1 = 3.
//    GAUGE FIXING: the breadth-first tree from dock 0 (the star 01, 02, 03 on the tetrahedron) is set to the identity, so
//    a configuration is the values (x, y, z) on links 12, 13, 23: 120^3 = 1,728,000 gauge-fixed values. The tree links'
//    electric pieces become moves of x, y, z (link 01: x, y -> h x, h y; link 02: x -> x h^-1, z -> h z; link 03:
//    y, z -> y h^-1, z h^-1), the plaquettes read x, y, z and x z y^-1. What Gauss leaves is one global conjugation
//    (-1 is central, so it acts as A5 of order 60): the Gauss sector is the conjugation orbits, (1/120) sum_g |C(g)|^3 =
//    sum over classes of |C|^2 = 2 x 120^2 + 4 x 10^2 + 2 x 6^2 + 4^2 = 29,288 states (rhombus 296, triangle 9). The
//    tetrahedron's 24 dock permutations (S4) commute with H and the beat, and the ground state of a Hamiltonian sits in
//    the symmetric sector if it is unique there and lies below every other sector (checked: the sector's ground energy
//    against Lanczos on the whole 29,288-state Gauss sector): the symmetric sector has 1,589 states (rhombus 150 under
//    its 4 automorphisms, triangle 9), small enough to hold the beat DENSE and diagonalize it exactly.
// 2. THE HAMILTONIAN, EXACT PIECES. H = H_E + r H_B. H_E = sum over links of n_R on the link's irrep, n_R = d_R^2 - 1
//    (E-SPN-0153's integer exponents: 0, 3, 8, 15, 24, 35 for spins 0 to 5/2, 3 and 8 for 2' and 3', 15 for the 4 of
//    A5), so H_E has an INTEGER spectrum. H_B = sum over triangles of n_B(U_p), n_B = 5 (2 - a) - 8 b where chi_2(U_p)
//    = a + b phi: one integer class function, 8/5 the Fibonacci approximant of phi, so n_B / 5 is Wilson's 2 - chi_2 to
//    within 5% and increases with it (0, 2, 5, 7, 10, 13, 15, 18, 20 on q0 = 1, 0.809, 0.5, 0.309, 0, -0.309, -0.5,
//    -0.809, -1). This replaces E-SPN-0153's two-unit magnetic phase by ONE unit, a legitimate class function but not
//    Wilson's, stated as that.
// 3. THE BEAT. w = e^(i theta) a norm-one element of Z[w][1/7], F = E(theta) M(2 r theta) E(theta) (Strang), E = prod_l
//    sum_R w^(n_R) P_R (P_R = (d_R / 120) chi_R *, exact in Z[w, phi][1/210]), M = prod_p w^(2 r n_B(U_p)). Every factor
//    is a ring element; F = exp(i 2 theta (H + O(theta^2))): Strang's odd orders vanish, so the effective Hamiltonian TO
//    FIRST ORDER in delta = 2 |theta| is H itself, and the second order is -(delta^2 / 24) [H_E, [H_E, r H_B]] -
//    (delta^2 / 12) [r H_B, [H_E, r H_B]] up to sign convention. THE SMALL-ANGLE FAMILY: ringUnit(k, j) = w^j ((3 +
//    w)^2 / 7)^k has angle k theta1 + j pi / 3 with theta1 = 2 arg(3 + w) = 2 atan(sqrt3 / 5) = 0.66694; (3 + w) / (3 +
//    w^2) has 7 in its denominator, so it is not an algebraic integer, not a root of unity, and theta1 / pi is irrational:
//    the angles are dense (Weyl), and every target delta has a least k with |2 angle - delta| <= 2% of delta. Those are
//    the ladder's exact units. The survival is the same for theta and -theta (H is real, so F(-theta) is F(theta)'s
//    complex conjugate).
// 4. THE PREPARED STATE AND THE MEASUREMENT. psi0 = the ground state of H on the sector (unique, checked by its gap). F
//    is complex symmetric and unitary, so Re F and Im F commute and F has REAL orthonormal eigenvectors: those of Re F +
//    t Im F (t = 0.618..., a cluster re-split with sqrt2 - 1), each checked by its residual. From F = sum_n e^(i phi_n)
//    u_n u_n^T the fidelity f(N) = |<psi0|F^N psi0>|^2, the absorbed fraction Q(N) = (<H>_N - E0) / (Einf - E0) (Einf = Tr
//    H / 1589, the sector's infinite temperature) and their running means over beats 1..N are closed forms, at any N.
//    THE SURVIVAL TIME tau(delta) is the first beat on the grid (1, then 10 a decade to 1e9) where the running-mean
//    fidelity falls to 1/2 (infinity if never): an exponential decay at rate Gamma gives tau = 1.59 / Gamma.
// 5. THE COUPLING, BY A RULE FIXED BEFORE ANY DYNAMICS WAS SEEN: r in {1, 2, 4, 8} whose ground state has the mean
//    triangle plaquette <q0> nearest q* = 0.820, the one-loop least plaquette at 2I's husk freezing point (E-SPN-0153
//    H2). The probe read 0.484, 0.640, 0.748, 0.856, so r = 8: an ordered vacuum at the freezing edge's plaquette.
// 6. THE PREDICTION (ADHH, counted). A beat can hand the register one quantum omega = 2 pi / delta only through a
//    process of m >= omega / J local moves, J the local bandwidth, each order costing a factor e^(-kappa), kappa of order
//    1 to 4 (the Magnus terms fall as (delta J / 2 pi)^m / m!). So ln tau = kappa 2 pi / (J delta) + const: the slope c
//    lies in [2 pi / J_hi, 8 pi / J_lo], J_lo = max(max n_R, r max n_B) = max(35, 160) = 160 (one term) and J_hi = 35 +
//    2 x 160 = 355 (a link's electric term and its two faces): c in [0.0177, 0.157]. ON THIS PATCH the prediction is
//    CUT by finite size: the sector spectrum of H has width W = 669.2 (read), so below delta_W = 2 pi / W = 0.0094 nothing
//    folds and psi0 is kept to 1 - O(delta^4) forever, and above it the Floquet spectrum is discrete (1,589 levels): a
//    resonance mixes psi0 with a level at E0 + m omega by an amount bounded by (V / spacing)^2 rather than draining it.
//    So the golden-rule decay that ADHH bounds needs V above the level spacing, which fails before exp(c / delta) can be
//    followed far: PREDICTED, K1 FAILS on the count (fewer than 4 ladder points with 1 < tau < infinity) or on the fit,
//    with tau rising from about one beat at delta ~ 1 to infinity near 1 / delta ~ 30 to 100; the long-time leak 1 - fbar
//    (READ) is the finite-size stand-in, predicted to fall roughly as exp(-2 c / delta).
// 7. K4, THE STRING, IS OUT OF REACH ON ANY EXACT PATCH. Every pair of the tetrahedron's docks is one link apart, so a
//    static pair has one separation only, and short-distance (Coulomb-like, ordered) and long-distance (linear) behavior
//    cannot be told apart. The smallest husk patch holding separations 1, 2, 3 with a plaquette surface spanning each is
//    a strip of 6 triangles along 4 docks of a line (8 docks, 13 links, loops 6): its Gauss sector holds sum over
//    classes of |C|^5 = 49,766,816,576 states (READ), 7 orders of magnitude past the 29,288 here. And at the coupling of
//    E-SPN-0153's window (sigma a^2 about 1e-18) the linear regime begins near 1 / sqrt(sigma) ~ 1e9 links. So K4 is
//    reported as undecidable here, with those sizes.
//
// GATES, fixed before the gate run. Tetrahedron, 2I, r = 8, the ladder 1 / delta in {1, 2, 3, 4, 6, 8, 12, 16, 24, 32,
// 48, 64, 96, 128, 160} (from the strong beat to past delta_W).
//  K1 PRETHERMAL SURVIVAL. Among ladder points with 1 < tau < infinity there are at least 4, spanning a factor at least
//     2 in 1 / delta; the least-squares line ln tau = a + c / delta through them misses no point by more than ln 3; and c
//     lies in [2 pi / J_hi, 8 pi / J_lo] = [0.0177, 0.157].
//  K2 CONTROLS. (a) At the strong beat (1 / delta = 1) the state heats to the sector's infinite temperature: the long-
//     time absorbed fraction in [0.8, 1.2] and tau <= 4. (b) The trivial group on the same patch keeps everything: the
//     beat is the number 1 (Re F = 1, Im F = 0 exactly) and f = 1 at every grid beat exactly. (c) The commuting beat (r
//     = 0: F = E(2 theta) exactly) keeps its ground state at 1 / delta = 1, 8, 64: f >= 1 - 1e-10 at every grid beat and
//     tau = infinity. (c) can fail: a mis-assembled beat, or a basis that does not diagonalize H_E, shows there.
//  K3 EXACTNESS. (a) Exact: 2I's characters in Z[phi] (integers a, b), constant on classes, sum_R d_R chi_R = 120
//     delta_1, chi_R * chi_S = delta_RS (120 / d_R) chi_R (so every electric piece is exactly unitary and a class
//     function for any norm-one w), every ladder unit of norm exactly 1 (bigints), n_B integral. (b) Exact Gauss and
//     symmetry: every symmetric sector's row read from a second representative has the same (link, class, sector) counts,
//     and H_B is constant on every sector at every one of the 1,728,000 configurations. (c) Measured: the sector H_E's
//     spectrum integral to 1e-9 and H_E symmetric to 1e-12; the sector ground energy equal to Lanczos on the whole Gauss
//     sector to 1e-8; at every ladder point every |lambda_n| = 1 to 1e-10 and every residual |F u - lambda u| <= 1e-8;
//     the beat applied LINK BY LINK on all 1,728,000 gauge-fixed configurations for 3 beats at 1 / delta = 8 agrees with
//     the sector's dense beat to 1e-9 with the residual Gauss defect (conjugation) <= 1e-12 after every beat, and the
//     register's <H> of psi0 equals the sector's E0 to 1e-8; and on the
//     UNFIXED register of Q8 (8^6 = 262,144 configurations, every link free), 5 beats at 1 / delta = 4 keep the Gauss
//     law at every dock to 1e-12 after every beat and agree with the gauge-fixed evolution to 1e-12.
//  K4 (only if K1) the string on the largest affordable patch: undecidable here (point 7), reported with the sizes.
// Verdict: partial if K2 or K3 fails; fail if K1 fails; open if K1 holds (K4 undecidable on any exact patch).
//
// READ, gating nothing: the rhombus and triangle ladders (the size trend), the rhombus at r 1, 2, 4, 8, the long-time
// fidelity and absorbed fraction at every point and the line through ln(1 - fbar), the ground-state Wilson loops
// (triangle and perimeter 4), the energy-based time (running-mean Q reaching 1/4).
//
// PROBES BEFORE THE GATE RUN, disclosed. tmp/prt-probe1.log: the patches, the sector counts (orbits equal to Burnside on
// all three), the exact checks, the ground states at r 1, 2, 4, 8 (sector ground equal to Gauss-sector Lanczos to the
// printed digits), the coupling rule's reading (r = 8), and the cost of one Floquet decomposition at 1 / delta = 10 (23
// s, residual 4e-10, unitarity 4e-14); its survival was computed but NOT printed. The ladder was extended to 1 / delta =
// 160 after the probe read W = 669 at r = 8, so that it runs past delta_W; no survival value had been seen. One smoke of
// the whole run on the short ladder 1, 4, 8, 64 with one cross beat and one unfixed beat (tmp/prt-smoke.log), written
// AFTER the gates above: tau 1, 1, 1, infinity (fbar 1.8e-3, 1.8e-3, 1.9e-3, 0.905), every control and exactness check
// holding. No gate, threshold or ladder point moved after it.
//
// FIRST RUN (tmp/prt-exp-run1.log, 884 s): PARTIAL, on an instrument threshold. K1, K2, K3a and K3b hold, and so do every
//  cross-check of K3c except one: at 1 / delta = 5.93 the largest Floquet residual |F u - lambda u| is 1.3e-8 against
//  the gate's 1e-8 (every other ladder point 1.2e-10 to 5.3e-9; least phase gap there 1.1e-4, so it is the QL solver's
//  accuracy in a crowded stretch of the spectrum, at a point where tau = 1 and fbar = 1.9e-3 either way). The gate is not
//  moved and the run is not repeated: the verdict is partial. Against the prediction, K1 HOLDS.
//  - Structure: triangle, rhombus and tetrahedron all husk; Gauss sectors 9, 296, 29,288 (equal to Burnside); symmetric
//    sectors 9, 150, 1,589; every row equal from a second representative, n_B constant on all 1,728,000 configurations,
//    H_E integral to 1.9e-12. Coupling rule: <q0> 0.484, 0.640, 0.748, 0.856 at r 1, 2, 4, 8, so r = 8 (perimeter-4 loop
//    0.356, 0.544, 0.678, 0.798); sector ground energies equal Gauss-sector Lanczos (r 8: E0 103.171174, gap 17.24, W
//    669.2, Einf 441.16).
//  - K1, the tetrahedron at r = 8 (tau: running-mean fidelity to 1/2; fbar and Qbar the long-time fidelity and absorbed
//    fraction):
//        1/delta    k     tau    fbar      Qbar
//        1.02       29    1      1.8e-3    0.999
//        2.00       64    1      1.9e-3    0.998
//        2.96       39    1      1.8e-3    0.999
//        4.04       52    1      1.8e-3    0.999
//        5.93      154    1      1.9e-3    0.999
//        7.88       58    1      1.9e-3    0.999
//        11.85      77    1      2.2e-3    0.997
//        16.29     639    3      1.2e-2    0.983
//        23.55     135    10     2.0e-2    0.968
//        32.29     493    40     0.100     0.921
//        48.60    1545    40     0.054     0.862
//        64.16    1578    inf    0.905     0.109
//        96.24    1052    inf    0.9989    6.2e-4
//        125.50   1209    inf    0.9997    1.8e-4
//        158.62    168    inf    0.9999    6.6e-5
//    Four finite points (16.3 to 48.6, span 2.98); ln tau = 0.346 + 0.0778 / delta, worst miss 0.83 (ln 3 = 1.10); c =
//    0.0778 inside [0.0177, 0.157]. The state is lost within one beat for 1 / delta <= 11.9 (fbar = 1 / 520, the sector's
//    infinite temperature), survives 3 to 40 beats from 16 to 49, and is KEPT from 64 on, with the leak 1 - fbar falling
//    0.096, 1.1e-3, 3.2e-4, 1.2e-4. The keeping sets in at 1 / delta near 55, where delta J_lo = pi (one local term's
//    bandwidth fits in a quasi-energy zone), far above delta_W = 2 pi / W (1 / delta_W 106.5): what keeps the state is
//    the local bound ADHH use, not the whole patch's spectrum fitting in the zone. The fit is honest but thin: four points,
//    the last two both at the grid value 40 (the grid holds 10 beats a decade), and the step from 40 beats to infinity
//    between 48.6 and 64.2 is the discrete-spectrum cut the derivation predicted. The prediction that K1 would fail on the
//    count was WRONG by one point.
//  - READ: the leak on the kept side, ln(1 - fbar) against 1 / delta, slope -0.068 (-2c would be -0.156), worst miss
//    1.29: not a clean exponential. The energy time (running-mean Q to 1/4) tracks tau: 3, 8, 16, 20.
//  - K2: at 1 / delta 1.02 Qbar 0.9987 and tau 1; the trivial group's beat is the number 1 and f = 1 at every beat; the
//    commuting beat (r = 0) keeps its ground state at 1 / delta 1, 8, 64 with least f 1 - 1e-13 (reading 1.0000000000001).
//  - K3c otherwise: the link-by-link beat on all 1,728,000 configurations agrees with the sector's dense beat to 2.1e-15
//    over 3 beats at 1 / delta 7.88, conjugation defect 1.0e-16 after each, fidelities equal to the Floquet closed form
//    to 3.8e-15, <H> of psi0 on the register 103.171174257 against 103.171174258; on the unfixed Q8 register (262,144
//    configurations) the Gauss defect at every dock is 2.2e-17 after 5 beats and the unfixed and fixed evolutions agree
//    to 5.1e-16; every |lambda| = 1 to 2.7e-13.
//  - READ, the size trend at r = 8 (the first ladder point that is kept): triangle 1 / delta 11.9 (9 states), rhombus
//    23.5 (150 states; tau 79 at 16.3), tetrahedron 64.2 (1,589 states). A larger patch heats down to a smaller delta, as
//    more states give the golden rule a denser set of final levels. The rhombus at r 1, 2, 4 is kept from 5.9, 11.9, 16.3:
//    the threshold moves with the local bandwidth r max n_B = 20, 40, 80 (and 160 at r 8), as ADHH's omega / J says.
//  - K4: the tetrahedron holds one separation; the 6-loop strip's Gauss sector is 49,766,816,576 states.
//
// NEXT. On a finite exact patch a small-angle 2I beat does keep the ordered vacuum: from 1 / delta near 55 on (r = 8), with
//  a leak of 1e-4 at 1 / delta 159 and a lifetime growing as exp(0.078 / delta) over the range where it is finite. That is
//  the prethermal route E-SPN-0153 left, now shown on the register itself, with the caveat that a 4-point fit on a
//  1,589-state sector is not the thermodynamic-limit statement ADHH prove. Three steps toward a light member bound by the
//  2I string moving in 3d with R -> 1. (1) The rate on a larger register: the honest test of exp(c / delta) needs a patch
//  whose spectrum is quasi-continuous, which exact dense evolution cannot reach (29,288 Gauss states is the ceiling here);
//  a Krylov evolution of the whole Gauss sector of a 4-loop patch (about 1.7e6 orbits) at 1 / delta 16 to 64 is the next
//  measurement. (2) The beat the rule actually has: here delta is a free small angle, while the vibe mixer fixes the
//  beat's angle (c* = c / 2) and E-SPN-0153 found the estimator invalid by xi 2; the question is whether the rule's own
//  angle falls on the kept side of 1 / delta near 55 for a coupling whose plaquette is ordered. (3) The member: put a
//  static 2 at two docks of the kept vacuum and read the energy against separation on a strip, which needs K4's patch and
//  so a truncation or a tensor-network state, since exact enumeration stops at one separation.
//
// Depth L2 (lattice gauge theory's Hamiltonian limit and Floquet prethermalization, reproduced on an exact finite-group
// register; the beat is the vibe ring's, but the register is a hand-built lattice gauge theory, not the rule). DETERMINISM:
// no random numbers; the ladder is the least k per target; the Lanczos start is the Weyl stream. NOTHING MOVES: a link
// holds a value, a plaquette reads the product around it.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { binaryIcosahedral, conjugacyClasses, quaternionEight, trivialGroup, type GaugeGroup } from '@/code/measure/hurwitz-gauge'
import { icosianCharacters } from '@/code/measure/gauge-window'
import {
  applyLink,
  beatGrid,
  cayleyKernel,
  conjugationDefect,
  cvecGap,
  cvecInner,
  electricBasis,
  electricKernel,
  exactCharacterAlgebra,
  fixedFromFree,
  floquetOf,
  freeBeat,
  freeFromFixed,
  freeGaussDefect,
  freeRegisterOf,
  gaussGround,
  groundOf,
  huskRhombus,
  huskTetrahedron,
  huskTriangle,
  lineFit,
  linkUnitary,
  loopMean,
  magneticExponents,
  magneticTable,
  registerBeat,
  registerEnergy,
  registerOf,
  sectorModel,
  sectorsOf,
  sectorToRegister,
  smallAngleUnits,
  survivalOf,
  type CVec,
  type ElectricBasis,
  type Ground,
  type Patch,
  type Register,
  type SectorModel,
  type Sectors,
  type SmallUnit,
  type Survival,
} from '@/code/measure/prethermal-patch'

const Q_STAR = 0.82
const COUPLINGS = [1, 2, 4, 8]
const LADDER = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160]
const UNIT_TOLERANCE = 0.02
const K_MAX = 50000
const GRID_TOP = 1e9
const PER_DECADE = 10
const MIN_POINTS = 4
const MIN_SPAN = 2
const FIT_MISS = Math.log(3)
const KAPPA_LO = 1
const KAPPA_HI = 4
const HEAT_LO = 0.8
const HEAT_HI = 1.2
const HEAT_TAU = 4
const STRONG = 1
const COMMUTING_AT = [1, 8, 64]
const KEPT = 1e-10
const INTEGER = 1e-9
const SYMMETRIC = 1e-12
const GROUND_SAME = 1e-8
const UNITARY = 1e-10
const EIGEN_RESIDUAL = 1e-8
const CROSS = 1e-9
const GAUSS = 1e-12
const ENERGY_SAME = 1e-8
const FREE_SAME = 1e-12
const CROSS_AT = 8
const CROSS_BEATS = 3
const FREE_AT = 4
const FREE_BEATS = 5
const LANCZOS = 80

export type PatchPlan = { ladder: number[]; couplings: number[]; crossBeats: number; freeBeats: number; gridTop: number; perDecade: number }

export const GATE_PLAN: PatchPlan = { ladder: LADDER, couplings: COUPLINGS, crossBeats: CROSS_BEATS, freeBeats: FREE_BEATS, gridTop: GRID_TOP, perDecade: PER_DECADE }

export default experiment({
  id: 'spin/icosian-prethermal-patch',
  code: 'E-SPN-0154',
  title:
    'a small-angle 2I beat keeps the ordered vacuum of a husk tetrahedron prethermally, partial (one Floquet residual 1.3e-8 against its 1e-8 gate): on the exact register (1,728,000 gauge-fixed values, 29,288 Gauss states, 1,589 symmetric) with integer electric and magnetic exponents and exact small-angle ring units of Z[w][1/7], at the coupling whose plaquette is 0.856 (r 8), the prepared ground state is lost in one beat for 1/delta up to 12, survives 3, 10, 40, 40 beats at 1/delta 16, 24, 32, 49 (ln tau = 0.35 + 0.078/delta, worst miss 0.83, slope inside the predicted 0.018 to 0.157), and is kept from 1/delta 64 (leak 0.096, then 1e-3 to 1e-4), where delta times one term bandwidth is near pi, far above the whole-patch fold 1/delta 107; the strong beat heats to infinite temperature (0.999), the commuting beat keeps to 1e-13, the trivial group is exactly 1; the link-by-link beat matches the sector to 2e-15 with Gauss to 1e-16, and on the unfixed Q8 register Gauss holds at every dock to 2e-17; the smaller patches are kept from larger delta (triangle 12, rhombus 24); the string needs separations the tetrahedron lacks (a 6-loop strip has 5.0e10 Gauss states)',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return prethermalRun(GATE_PLAN)
  },
})

type Built = { patch: Patch; reg: Register; sec: Sectors; model: SectorModel; basis: ElectricBasis }

function build(g: GaugeGroup, patch: Patch, classes: number[][], eH: Float64Array, nB: Int32Array): Built {
  const reg = registerOf(g, patch, classes)
  const sec = sectorsOf(reg)
  const model = sectorModel(reg, sec, eH, nB)
  const basis = electricBasis(model)

  return { patch, reg, sec, model, basis }
}

type Row = { inv: number; unit: SmallUnit; sv: Survival; residual: number; unitarity: number; clusters: number }

function ladderRows(b: Built, gr: Ground, units: readonly SmallUnit[], r: number, grid: readonly number[]): Row[] {
  return units.map(unit => {
    const fl = floquetOf(b.model, b.basis, unit.theta, r)
    const sv = survivalOf(fl, gr, grid)

    return { inv: 1 / unit.delta, unit, sv, residual: fl.residual, unitarity: fl.unitarity, clusters: fl.clusters }
  })
}

// the sector state (electric basis, complex) after N dense beats, spread over the register
function denseBeats(b: Built, theta: number, r: number, gr: Ground, N: number): { states: CVec[]; fidelity: number[] } {
  const n = b.model.n
  const fl = floquetOf(b.model, b.basis, theta, r)
  let re = Float64Array.from(gr.psiE)
  let im = new Float64Array(n)
  const states: CVec[] = []
  const fidelity: number[] = []

  for (let t = 1; t <= N; t++) {
    const nr = new Float64Array(n)
    const ni = new Float64Array(n)

    for (let i = 0; i < n; i++) {
      let sr = 0
      let si = 0

      for (let j = 0; j < n; j++) {
        const a = fl.Fre[i * n + j] as number
        const c = fl.Fim[i * n + j] as number

        sr += a * (re[j] as number) - c * (im[j] as number)
        si += a * (im[j] as number) + c * (re[j] as number)
      }

      nr[i] = sr
      ni[i] = si
    }

    re = nr
    im = ni

    let or = 0
    let oi = 0

    for (let i = 0; i < n; i++) {
      or += (gr.psiE[i] as number) * (re[i] as number)
      oi += (gr.psiE[i] as number) * (im[i] as number)
    }

    fidelity.push(or * or + oi * oi)

    // back to the sector basis: V psi'
    const sr = new Float64Array(n)
    const si = new Float64Array(n)

    for (let i = 0; i < n; i++) {
      let a = 0
      let c = 0

      for (let j = 0; j < n; j++) {
        a += (b.basis.V[i * n + j] as number) * (re[j] as number)
        c += (b.basis.V[i * n + j] as number) * (im[j] as number)
      }

      sr[i] = a
      si[i] = c
    }

    const R = sectorToRegister(b.reg, b.sec, sr)
    const I = sectorToRegister(b.reg, b.sec, si)

    states.push({ re: R.re, im: I.re })
  }

  return { states, fidelity }
}

const fmt = (x: number): string => (x === Infinity ? 'inf' : Number.isInteger(x) ? String(x) : x.toPrecision(4))

export function prethermalRun(plan: PatchPlan): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)
  const grid = beatGrid(plan.gridTop, plan.perDecade)

  // ---------------- the group and the exact algebra (K3a) ----------------
  const g = binaryIcosahedral()
  const classes = conjugacyClasses(g)
  const chars = icosianCharacters(g)
  const nR = chars.dims.map(d => d * d - 1)
  const eH = electricKernel(g, chars, nR)
  const nB = magneticExponents(g)

  if (!nB) throw new Error('E-SPN-0154: 2I magnetic exponents not integral')

  const tet = build(g, huskTetrahedron(), classes, eH, nB)
  const exact = exactCharacterAlgebra(g, chars, tet.reg.classOf)
  const units = smallAngleUnits(plan.ladder.map(x => 1 / x), K_MAX, UNIT_TOLERANCE)
  const unitsExact = units.every(u => u.exact)
  const K3a = exact.integral && exact.classConstant && exact.completeness && exact.idempotents && unitsExact

  log(`K3a ${K3a}: ${JSON.stringify(exact)}; units exact ${unitsExact}: ${units.map(u => `1/${fmt(1 / u.target)} k ${u.k} j ${u.j} delta ${u.delta.toFixed(6)}`).join(', ')}`)

  // ---------------- the patches and K3b ----------------
  const rho = build(g, huskRhombus(), classes, eH, nB)
  const tri = build(g, huskTriangle(), classes, eH, nB)
  const K3b = [tet, rho, tri].every(b => b.model.rowsEqual && b.model.magneticConstant)

  for (const b of [tri, rho, tet]) log(`${b.patch.name}: husk ${b.patch.husk}, docks ${b.patch.docks.length}, links ${b.patch.links.length}, triangles ${b.patch.triangles.length}, loops ${b.reg.digits}, gauge-fixed ${b.reg.size}, Gauss sector ${b.sec.orbits}, automorphisms ${b.sec.automorphisms.length}, symmetric sector ${b.sec.n}; rows equal ${b.model.rowsEqual}, n_B constant ${b.model.magneticConstant}, H_E asymmetry ${b.model.asymmetry.toExponential(2)}, integer error ${b.basis.integerError.toExponential(2)}`)

  // ---------------- the coupling rule and the ground states ----------------
  const walk4 = [[0, 1, 2, 3]]
  const grounds = plan.couplings.map(r => {
    const gr = groundOf(tet.model, tet.basis, r)
    const lanczos = gaussGround(tet.reg, tet.sec, eH, nB, r, LANCZOS)

    return { r, gr, lanczos, plaquette: loopMean(tet.reg, tet.sec, gr.psi, tet.patch.triangles), loop4: loopMean(tet.reg, tet.sec, gr.psi, walk4) }
  })
  const chosen = grounds.reduce((best, x) => (Math.abs(x.plaquette - Q_STAR) < Math.abs(best.plaquette - Q_STAR) ? x : best))
  const r = chosen.r
  const gr = chosen.gr
  const groundSame = grounds.every(x => Math.abs(x.gr.E0 - x.lanczos) <= GROUND_SAME)

  log(`coupling rule: ${grounds.map(x => `r ${x.r}: E0 ${x.gr.E0.toFixed(6)} (Gauss-sector Lanczos ${x.lanczos.toFixed(6)}), gap ${(x.gr.E1 - x.gr.E0).toFixed(4)}, Einf ${x.gr.Einf.toFixed(3)}, W ${x.gr.spread.toFixed(2)}, <q0> triangle ${x.plaquette.toFixed(4)}, perimeter 4 ${x.loop4.toFixed(4)}`).join('; ')} -> r = ${r}`)

  // ---------------- the main ladder (K1, K2a, K3c) ----------------
  const rows = ladderRows(tet, gr, units, r, grid)
  const maxNR = Math.max(...nR)
  const maxNB = Math.max(...nB)
  const perLinkFaces = Math.max(...tet.patch.links.map(([a, b]) => tet.patch.triangles.filter(t => t.includes(a) && t.includes(b)).length))
  const Jlo = Math.max(maxNR, r * maxNB)
  const Jhi = maxNR + perLinkFaces * r * maxNB
  const cLo = (KAPPA_LO * 2 * Math.PI) / Jhi
  const cHi = (KAPPA_HI * 2 * Math.PI) / Jlo
  const deltaW = (2 * Math.PI) / gr.spread
  const rowText = (w: Row): string =>
    `1/delta ${w.inv.toFixed(2)} (k ${w.unit.k}): tau ${fmt(w.sv.tau)}, tau_E ${fmt(w.sv.tauEnergy)}, fbar ${w.sv.fidelityMean.toExponential(3)}, 1 - fbar ${(1 - w.sv.fidelityMean).toExponential(3)}, Qbar ${w.sv.absorbedMean.toExponential(3)}, f(10) ${fmt(w.sv.fidelity[w.sv.grid.indexOf(10)] as number)}, f(1e3) ${fmt(w.sv.fidelity[w.sv.grid.indexOf(1000)] as number)}, f(1e6) ${fmt(w.sv.fidelity[w.sv.grid.indexOf(1000000)] as number)}, components ${w.sv.components}, least gap ${w.sv.leastGap.toExponential(2)}, residual ${w.residual.toExponential(1)}, |lambda| - 1 ${w.unitarity.toExponential(1)}`

  for (const w of rows) log(`tetrahedron r ${r}: ${rowText(w)}`)

  const finite = rows.filter(w => w.sv.tau > 1 && w.sv.tau < Infinity)
  const fit = finite.length >= 2 ? lineFit(finite.map(w => w.inv), finite.map(w => Math.log(w.sv.tau))) : null
  const span = finite.length ? Math.max(...finite.map(w => w.inv)) / Math.min(...finite.map(w => w.inv)) : 0
  const K1 = finite.length >= MIN_POINTS && span >= MIN_SPAN && !!fit && fit.worst <= FIT_MISS && fit.c >= cLo && fit.c <= cHi

  log(`K1 ${K1}: finite points ${finite.length} (1/delta ${finite.map(w => w.inv.toFixed(2)).join(', ')}), span ${span.toFixed(2)}, fit ${fit ? `c ${fit.c.toFixed(5)} a ${fit.a.toFixed(3)} worst miss ${fit.worst.toFixed(3)}` : 'none'} against [${cLo.toFixed(4)}, ${cHi.toFixed(4)}] (J ${Jlo} to ${Jhi}); delta_W ${deltaW.toFixed(5)} (1/delta_W ${(1 / deltaW).toFixed(1)})`)

  // the long-time leak, READ
  const leakRows = rows.filter(w => 1 - w.sv.fidelityMean > 1e-12 && w.sv.tau === Infinity)
  const leakFit = leakRows.length >= 2 ? lineFit(leakRows.map(w => w.inv), leakRows.map(w => Math.log(1 - w.sv.fidelityMean))) : null

  log(`READ leak on the kept side: ${leakRows.length} points, ln(1 - fbar) slope ${leakFit ? leakFit.c.toFixed(5) : 'none'} (predicted about -2c), worst miss ${leakFit ? leakFit.worst.toFixed(3) : 'none'}`)

  // ---------------- K2 ----------------
  const strong = rows[plan.ladder.indexOf(STRONG)] as Row
  const K2a = strong.sv.absorbedMean >= HEAT_LO && strong.sv.absorbedMean <= HEAT_HI && strong.sv.tau <= HEAT_TAU
  const triv = trivialGroup()
  const trivClasses = conjugacyClasses(triv)
  const trivNB = magneticExponents(triv) as Int32Array
  const tv = build(triv, huskTetrahedron(), trivClasses, cayleyKernel(triv), trivNB)
  const tvGround = groundOf(tv.model, tv.basis, r)
  const tvF = floquetOf(tv.model, tv.basis, strong.unit.theta, r)
  const tvS = survivalOf(tvF, tvGround, grid)
  const K2b = tv.model.n === 1 && tvF.Fre[0] === 1 && tvF.Fim[0] === 0 && tvS.fidelity.every(f => f === 1) && tvS.fidelityRun.every(f => f === 1)

  log(`K2a ${K2a}: strong beat Qbar ${strong.sv.absorbedMean.toFixed(4)}, tau ${fmt(strong.sv.tau)}; K2b ${K2b}: trivial sector n ${tv.model.n}, F ${tvF.Fre[0]} + ${tvF.Fim[0]} i, f always 1 ${tvS.fidelity.every(f => f === 1)}`)

  const commuting = COMMUTING_AT.map(inv => {
    const unit = units[plan.ladder.indexOf(inv)] as SmallUnit
    const g0 = groundOf(tet.model, tet.basis, 0)
    const fl = floquetOf(tet.model, tet.basis, unit.theta, 0)
    const sv = survivalOf(fl, g0, grid)

    return { inv, least: Math.min(...sv.fidelity), tau: sv.tau }
  })
  const K2c = commuting.every(c => c.least >= 1 - KEPT && c.tau === Infinity)
  const K2 = K2a && K2b && K2c

  log(`K2c ${K2c}: commuting beat ${commuting.map(c => `1/delta ${c.inv}: least f ${c.least.toFixed(14)}, tau ${fmt(c.tau)}`).join('; ')}`)

  // ---------------- K3c: measured exactness and the cross-checks ----------------
  const integral = [tet, rho, tri].every(b => b.basis.integerError <= INTEGER && b.model.asymmetry <= SYMMETRIC)
  const ladderExact = rows.every(w => w.unitarity <= UNITARY && w.residual <= EIGEN_RESIDUAL)
  const crossUnit = units[plan.ladder.indexOf(CROSS_AT)] as SmallUnit
  const dense = denseBeats(tet, crossUnit.theta, r, gr, plan.crossBeats)
  const crossSv = rows[plan.ladder.indexOf(CROSS_AT)] as Row
  const u = linkUnitary(g, eH, crossUnit.theta)
  const hBt = magneticTable(tet.reg, nB)
  let reg: CVec = sectorToRegister(tet.reg, tet.sec, gr.psi)
  const reg0 = { re: Float64Array.from(reg.re), im: Float64Array.from(reg.im) }
  const e0Register = registerEnergy(tet.reg, eH, hBt, r, reg)
  let crossGap = 0
  let crossGauss = 0
  let crossFid = 0

  for (let t = 1; t <= plan.crossBeats; t++) {
    reg = registerBeat(tet.reg, u, hBt, crossUnit.theta, r, reg)
    crossGap = Math.max(crossGap, cvecGap(reg, dense.states[t - 1] as CVec))
    crossGauss = Math.max(crossGauss, conjugationDefect(tet.reg, reg))

    const [or, oi] = cvecInner(reg0, reg)

    crossFid = Math.max(crossFid, Math.abs(or * or + oi * oi - (dense.fidelity[t - 1] as number)), Math.abs((dense.fidelity[t - 1] as number) - (crossSv.sv.fidelity[t - 1] as number)))
    log(`cross beat ${t}: register vs sector ${cvecGap(reg, dense.states[t - 1] as CVec).toExponential(2)}, Gauss defect ${conjugationDefect(tet.reg, reg).toExponential(2)}, f ${(or * or + oi * oi).toFixed(12)} (dense ${(dense.fidelity[t - 1] as number).toFixed(12)}, Floquet ${(crossSv.sv.fidelity[t - 1] as number).toFixed(12)})`)
  }

  const crossOk = crossGap <= CROSS && crossGauss <= GAUSS && crossFid <= CROSS && Math.abs(e0Register - gr.E0) <= ENERGY_SAME

  log(`register energy of psi0 ${e0Register.toFixed(9)} against E0 ${gr.E0.toFixed(9)}; link unitary integer error ${u.integerError.toExponential(2)}`)

  // Q8, unfixed
  const q8 = quaternionEight()
  const q8Classes = conjugacyClasses(q8)
  const q8NB = magneticExponents(q8) as Int32Array
  const q8eH = cayleyKernel(q8)
  const q8b = build(q8, huskTetrahedron(), q8Classes, q8eH, q8NB)
  const q8g = groundOf(q8b.model, q8b.basis, r)
  const q8Unit = units[plan.ladder.indexOf(FREE_AT)] as SmallUnit
  const q8u = linkUnitary(q8, q8eH, q8Unit.theta)
  const q8hB = magneticTable(q8b.reg, q8NB)
  const free = freeRegisterOf(q8, q8b.patch)
  let fixed: CVec = sectorToRegister(q8b.reg, q8b.sec, q8g.psi)
  let freeState = freeFromFixed(free, q8b.reg, fixed)
  let freeGauss = freeGaussDefect(free, freeState)
  let freeGap = cvecGap(fixedFromFree(free, q8b.reg, freeState), fixed)

  for (let t = 1; t <= plan.freeBeats; t++) {
    fixed = registerBeat(q8b.reg, q8u, q8hB, q8Unit.theta, r, fixed)
    freeState = freeBeat(free, q8u, q8NB, q8Unit.theta, r, freeState)
    freeGauss = Math.max(freeGauss, freeGaussDefect(free, freeState))
    freeGap = Math.max(freeGap, cvecGap(fixedFromFree(free, q8b.reg, freeState), fixed))
  }

  const [q8o] = cvecInner(fixed, sectorToRegister(q8b.reg, q8b.sec, q8g.psi))
  const freeOk = freeGauss <= GAUSS && freeGap <= FREE_SAME

  log(`Q8 unfixed: ${free.size} configurations, sector n ${q8b.sec.n}, integer error ${Math.max(q8b.basis.integerError, q8u.integerError).toExponential(2)}, Gauss defect at every dock ${freeGauss.toExponential(2)}, unfixed vs fixed ${freeGap.toExponential(2)}, overlap after ${plan.freeBeats} beats ${q8o.toFixed(6)}`)

  const K3c = integral && groundSame && ladderExact && crossOk && freeOk
  const K3 = K3a && K3b && K3c

  log(`K3 ${K3}: a ${K3a}, b ${K3b}, c ${K3c} (integral ${integral}, ground ${groundSame}, ladder ${ladderExact}, cross ${crossOk}: gap ${crossGap.toExponential(2)} Gauss ${crossGauss.toExponential(2)} fidelity ${crossFid.toExponential(2)}, unfixed ${freeOk})`)

  // ---------------- READ: the size trend, the couplings on the rhombus ----------------
  const reads: string[] = []

  for (const b of [rho, tri]) {
    const g1 = groundOf(b.model, b.basis, r)
    const rr = ladderRows(b, g1, units, r, grid)

    reads.push(`${b.patch.name} r ${r} (n ${b.sec.n}, W ${g1.spread.toFixed(1)}): ${rr.map(w => `${w.inv.toFixed(1)}: tau ${fmt(w.sv.tau)} fbar ${w.sv.fidelityMean.toExponential(2)} Qbar ${w.sv.absorbedMean.toExponential(2)}`).join('; ')}`)
    log(`READ ${reads[reads.length - 1]}`)
  }

  for (const rc of plan.couplings.filter(x => x !== r)) {
    const g1 = groundOf(rho.model, rho.basis, rc)
    const rr = ladderRows(rho, g1, units, rc, grid)

    reads.push(`rhombus r ${rc}: ${rr.map(w => `${w.inv.toFixed(1)}: tau ${fmt(w.sv.tau)} fbar ${w.sv.fidelityMean.toExponential(2)}`).join('; ')}`)
    log(`READ ${reads[reads.length - 1]}`)
  }

  // K4 sizes: the Gauss sector of a 6-loop patch, sum over classes |C|^(loops - 1)... (1/|G|) sum_g |C(g)|^6
  let strip = 0n

  for (const cl of classes) strip += BigInt(cl.length) * BigInt(g.order / cl.length) ** 6n
  strip /= BigInt(g.order)

  const K4 = false

  log(`K4 not decidable: the tetrahedron holds one pair separation; a 6-loop strip's Gauss sector ${strip} states`)

  const status = !K2 || !K3 ? 'partial' : !K1 ? 'fail' : 'open'

  return verdict({
    status,
    claim: `K1 ${K1} (${finite.length} ladder points with finite tau > 1, fit ${fit ? `c ${fit.c.toFixed(4)} worst ${fit.worst.toFixed(2)}` : 'none'} against [${cLo.toFixed(4)}, ${cHi.toFixed(4)}]); K2 ${K2} (strong Qbar ${strong.sv.absorbedMean.toFixed(3)}, tau ${fmt(strong.sv.tau)}; trivial ${K2b}; commuting ${K2c}); K3 ${K3} (a ${K3a}, b ${K3b}, c ${K3c}); K4 undecidable (one separation; the 6-loop strip has ${strip} Gauss states); r ${r}, <q0> ${chosen.plaquette.toFixed(4)}, W ${gr.spread.toFixed(1)}`,
    metrics: {
      K1: K1 ? 1 : 0,
      K2: K2 ? 1 : 0,
      K3: K3 ? 1 : 0,
      K4: K4 ? 1 : 0,
      coupling: r,
      plaquette: chosen.plaquette,
      sectorStates: tet.sec.n,
      gaussStates: tet.sec.orbits,
      finitePoints: finite.length,
      slope: fit ? fit.c : NaN,
      slopeLo: cLo,
      slopeHi: cHi,
      strongAbsorbed: strong.sv.absorbedMean,
      crossGap,
      freeGauss,
      seconds: (Date.now() - started) / 1000,
    },
    control: { K2a: K2a ? 1 : 0, K2b: K2b ? 1 : 0, K2c: K2c ? 1 : 0, K3: K3 ? 1 : 0 },
    notes: `L2. Tetrahedron r ${r}: ${rows.map(rowText).join(' | ')}. ${reads.join(' | ')}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
