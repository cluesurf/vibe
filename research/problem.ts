// The open problems, each written as a small research project someone could pick up without
// joining anything: the question, what is known, what is not, why it matters, the skills it
// takes, its size, where to start, and the claims it would move.

import type { Problem } from './type'

export const PROBLEMS: Problem[] = [
  {
    id: 'OP-01',
    title: 'carry the signed weight on the knit',
    question:
      'Can the signed weight on the role grid, the loves and fears that write the singlet, run inside the committed knit, and does it give positions a quantum sector as well as roles?',
    known:
      'the bare knit has no amplitudes: defects add exactly as sets (R-FND-0001). The signed weight on the role grid is the quantum part (E-FRC-0120 to E-FRC-0122, E-FRC-0127). The fear weave runs it inside the lattice: quantum in the roles (chances 1/4, 3/4, 1 against 1/4, 3/8, 7/16, CHSH sqrt 7 against 2, E-QTM-0100), and a lone vibe moves ballistically under the one-third turn (exponent 0.997 against 0.497, E-QTM-0103). Grain grows: a knot of 9 x 4^m units is refused at meeting m + 1 (E-QTM-0099)',
    unknown:
      'real weights on positions: streaming permutes the Wigner grid only on a ring of 3 docks, so the weight on a position is complex, not loves and fears (E-QTM-0103). And none of it runs on the committed knit',
    why: 'every quantum result about positions in the program is about an imported walk until this exists',
    skills: [
      'cellular automata',
      'quantum foundations',
      'numerical simulation',
    ],
    scope:
      'open-ended research. A first negative or positive construction is a paper',
    starting: [
      'test/experiment/foundations/rule-has-no-amplitudes.ts',
      'test/experiment/gauge/fear-beat.ts',
      "'t Hooft 2016, The Cellular Automaton Interpretation of Quantum Mechanics",
    ],
    depends: ['R-FND-0001', 'R-FRC-0005'],
    source: 'E-FND-0080, E-FRC-0120 to E-FRC-0122, E-FRC-0127, E-QTM-0099, E-QTM-0100, E-QTM-0103',
  },
  {
    id: 'OP-02',
    title:
      'the three-trit knit: which pair table, and color finer than the N_t = 4 spacing',
    question:
      'Which pair table should the adopted three-trit knit run, given that color is local only on a hop-free table, and can its color group go finer than the N_t = 4 spacing?',
    known:
      'the committed knit carries no SU(3), and coarse-graining brings none back (R-FRC-0003). Color is the role trit, adopted on 2026-09-25. Color is an exact local law only on a hop-free table (E-FRC-0124). The hop-free color weave dresses 1.7 to 2.3 times wider (E-FRC-0125), and the color turn weave, another hop-free table, does not (E-FRC-0136, mechanism E-FRC-0137). Sigma(648) matches SU(3) at N_t = 4 and stops there (E-FRC-0103). Two swap phases give the first finer step, sqrt(1/6) (E-QTM-0101), and the first word closer to T needs 4 (E-QTM-0104)',
    unknown:
      'whether the color turn weave passes the full battery and replaces the committed knit, and how far the swap-phase ladder reaches at a grain the lattice can carry',
    why: 'R-FRC-0006 names the base change local color needs and its price. The three-trit knit is not committed until the price is settled',
    skills: [
      'representation theory',
      'cellular automata',
      'lattice gauge theory',
    ],
    scope: 'a computational search, then the acceptance battery on each candidate',
    starting: [
      'note/experiment/gauge/what-the-base-needs.md',
      'test/experiment/gauge/color-weave-acceptance.ts',
      'test/experiment/gauge/finite-color-groups.ts',
    ],
    depends: ['R-FRC-0003', 'R-FRC-0006'],
    source: 'E-FRC-0103, E-FRC-0124, E-FRC-0125, E-FRC-0136, E-FRC-0137, E-QTM-0101, E-QTM-0104',
  },
  {
    id: 'OP-03',
    title: 'a ground state for a vacuum that flashes',
    question:
      'Can a Z3 phase ride on the vacuum clock, or does the clock rule out the ground state physics needs?',
    known:
      'the empty state is not fixed, because calm and calm make a love and a fear. Under the pair table alone it is a global period-three oscillation (E-FND-0080). Under the committed turning weave, which runs that pair clock inside a 24-beat schedule, it recurs at beat 24 and not before (E-FND-0118). Read as a condensate, the committed knit\'s vacuum has period 24, leaves the same 2 lines empty at all 24 birth phases, and is carried to itself by the knit\'s reversal. It respects only the charge U(1) (2 of 9! two-vibe maps respect SU(2)): a Higgs-like vacuum without a Higgs mechanism. The only free lone vibes are the 2 leading ends of the empty lines (E-FRC-0143)',
    unknown:
      'whether this clock is one the physics can use or a defect of the knit',
    why: 'it changes what a single particle means in the program',
    skills: ['statistical mechanics', 'discrete dynamics'],
    scope: 'a small theoretical question, then one experiment',
    starting: [
      'test/experiment/foundations/rule-has-no-amplitudes.ts',
      'test/experiment/gauge/center-automaton.ts',
    ],
    depends: ['R-FND-0001', 'R-FRC-0002'],
    source: 'E-FND-0080, E-FND-0118, E-FRC-0143',
  },
  {
    id: 'OP-04',
    title: 'routing and search on {3,4,3,4} with finite-size scaling',
    question:
      'Do greedy routing stretch and search radius stay flat on the {3,4,3,4} honeycomb as it grows?',
    known:
      'on {5,4}, stretch 1.002 (R-NVG-0001). On {3,4,3,4}, radius 3 at 750 and 3,000 docks (R-MMR-0001)',
    unknown:
      'the {3,4,3,4} routing at all, and either quantity at more than two sizes',
    why: 'planned paper 2 needs it, and R-NVG-0001 is on the wrong tiling until it exists',
    skills: ['network science', 'hyperbolic geometry', 'TypeScript'],
    scope: 'a small computational investigation',
    starting: [
      'test/experiment/addressing/greedy-walkway.ts',
      'test/experiment/associative/search-latency.ts',
      'Kleinberg 2007. Krioukov et al. 2010',
    ],
    depends: ['R-MMR-0001', 'R-NVG-0001'],
    source: 'E-NVG-0010, E-MMR-0013',
  },
  {
    id: 'OP-05',
    title: 'every L3 result at a second lattice size',
    question:
      'Does each of the 52 L3 verdicts in the catalog hold at 0.5, 1 and 1.5 times its size?',
    known:
      'the perturbation check exists (pnpm check:perturbation). E-MMR-0002 fails at half size',
    unknown: 'which of the others hold',
    why: 'no L3 result should be cited as robust until it does',
    skills: ['TypeScript', 'patience'],
    scope: 'a mechanical pass, one experiment at a time',
    starting: ['task/check-perturbation.ts'],
    depends: [],
    source: 'depth-grades, roadmap item 0012',
  },
  {
    id: 'OP-06',
    title:
      'a control that separates {3,4,3,4} from generic hyperbolic growth',
    question:
      'Which holography result, if any, a generic hyperbolic graph fails and {3,4,3,4} passes?',
    known:
      'the Ryu-Takayanagi experiments measure geodesics against boundary arcs, true of any hyperbolic graph',
    unknown: 'a property specific to this honeycomb',
    why: 'without it the holography set is regraded to L1',
    skills: ['hyperbolic geometry', 'holography'],
    scope: 'a small theoretical and computational investigation',
    starting: ['test/experiment/holography/'],
    depends: ['R-HLG-0001'],
    source: 'roadmap item 0014',
  },
  {
    id: 'OP-07',
    title: 'rerun the even-sided mesh results on odd sides',
    question:
      'Which whole-mesh figures change when d4Mesh has an odd side and is one connected lattice?',
    known: 'an even-sided d4Mesh is two disconnected lattices',
    unknown: 'which reported figures depend on it',
    why: 'a whole-mesh count on two components is a two-component figure',
    skills: ['TypeScript'],
    scope: 'a mechanical pass',
    starting: ['code/tool/mesh.ts, the PARITY note on d4Mesh'],
    depends: ['R-FND-0001'],
    source: 'd4-mesh-parity, roadmap item 0017',
  },
  {
    id: 'OP-08',
    title: 'spin-statistics through the rule',
    question:
      'Does a spinor carry the minus sign under exchange through the committed knit, rather than as an input?',
    known:
      'the committed knit does not carry the spinor sign: the coin directions are a 2T torsor, the turn lifts after four beats to (-1, +1) in SU(2)_L x SU(2)_R, and the palindromic schedule nets +1 where the rejected cyclic one nets -1 (E-SPN-0044). Exclusion lives in the signed weight: the fermion pair on the role grid is 72 loves and 18 fears, every fear on a coincident point, with zero chance of a shared role, while bosons need no fear (E-SPN-0045). E-SPN-0014 computes an identity true of every vector, and its exchange signs were typed',
    unknown: 'a knit that carries the spinor sign, and the sign tied to spin through the knit',
    why: 'the published paper claimed it',
    skills: ['representation theory', 'quantum foundations'],
    scope: 'open research',
    starting: ['test/experiment/spin/fermi-exclusion.ts'],
    depends: ['R-FND-0001'],
    source: 'paper errata, E-SPN-0014, E-SPN-0044, E-SPN-0045',
  },
  {
    id: 'OP-09',
    title: 'a machine-checked proof of the dimension-eight pinch',
    question:
      'Can the pinch be proved from definitions in the formal kernel, rather than checked on integers?',
    known:
      'the kernel proves the norm multiplicative for the complex numbers, quaternions and octonions',
    unknown: 'the converse of Hurwitz, and the pinch as a theorem',
    why: 'R-FND-0002 claims less than "proof-checked" until it exists',
    skills: ['formal proof', 'algebra'],
    scope:
      'a formalization project, with the Hurwitz converse as the known hard part',
    starting: [
      'Baez 2002, The Octonions',
      'Conway and Smith 2003, On Quaternions and Octonions',
    ],
    depends: ['R-FND-0002'],
    source: 'from-nothing hardening plan, tier 3',
  },
  {
    id: 'OP-10',
    title: 'the strong-force results toward the continuum',
    question:
      'Do the 4D SU(3) results hold at three or more couplings, extrapolated, with the Luscher term and zero-temperature string breaking?',
    known: 'one or two couplings each. Only 3D SU(2) is extrapolated',
    unknown:
      'the continuum limits in 4D, the Luscher term, the potential flattening near 1.2 fm',
    why: 'planned paper 1 is stronger with continuum limits',
    skills: ['lattice gauge theory', 'compute'],
    scope: 'boxes of $16^4$ and more, days of compute',
    starting: [
      'note/experiment/gauge/strong-force.md',
      'code/dynamics/gauge-lattice.ts',
    ],
    depends: ['R-FRC-0001', 'R-FRC-0004'],
    source: 'strong-force map, what is still open',
  },
  {
    id: 'OP-11',
    title: 'measure the correlation exponent',
    question:
      'Does the shared-ancestor mechanism imply $C(r) \\sim r^{-\\alpha}$, and what is $\\alpha$ on the committed knit?',
    known:
      'interior distance grows like the logarithm of boundary distance (R-HLG-0002)',
    unknown:
      '$\\alpha$, and whether any correlation is measured at all',
    why: 'turns candidate PC-01 into a quantitative prediction, the first route to a row',
    skills: [
      'hyperbolic geometry',
      'statistical mechanics',
      'numerical simulation',
    ],
    scope: 'a small computational investigation',
    starting: [
      'test/experiment/holography/bulk-shortcut-reachability.ts',
      'Swingle 2012, Entanglement renormalization and holography',
    ],
    depends: ['R-HLG-0002'],
    source: 'E-HLG-0004, E-HLG-0033',
  },
  {
    id: 'OP-12',
    title: 'moving binding in the slot architecture',
    question:
      'Can a bound pair travel in the committed slot architecture, with every slot streaming, under the committed schedule?',
    known:
      'the committed orientation is an open half-space, 1 of the 192 of 4,096 that are (E-FRC-0130). Waiting slots are exact but cannot pay (E-FRC-0132). A bouncing crossing binds and the pair is stuck, 0.7 docks in 600 beats against 34 (E-FRC-0133). Steering on a round robin of all 11 line matchings frees it: 510 of 576 headings give a bound pair that travels (E-FRC-0146, E-FRC-0147), against 88 of 576 on the committed couples. Folded into the 24-beat palindrome, the round robin reaches all 66 pairs of lines and keeps CPT, and a cold meson travels 20 bound on it (E-FRC-0152, E-FRC-0153). But the fold fails the acceptance battery, a lone vibe\'s disturbance growing about tenfold each period (E-FRC-0156), and no steering closes the baryon gap while the meson walks (E-FRC-0157)',
    unknown: 'a schedule that steers and keeps what the committed knit was adopted for, or the choice of matter that waits in docks with paid hops instead',
    why: 'binding on the D4 lattice is shown only with matter that waits in docks or a new schedule',
    skills: ['cellular automata', 'lattice gauge theory'],
    scope: 'a computational search, then the acceptance battery',
    starting: ['test/experiment/gauge/steered-binding.ts', 'test/experiment/gauge/slot-binding.ts'],
    depends: ['R-FRC-0006'],
    source: 'E-FRC-0130, E-FRC-0132, E-FRC-0133, E-FRC-0146, E-FRC-0147, E-FRC-0152, E-FRC-0153, E-FRC-0156, E-FRC-0157',
  },
  {
    id: 'OP-13',
    title: 'momentum with low dressing',
    question: 'Is there a knit that keeps particle momentum and dresses a lone vibe no more than the committed knit?',
    known:
      'the committed knit does not conserve momentum (E-FLD-0020). The hop is 96 percent of the loss (E-FLD-0021). A rule in the family keeps particle momentum exactly iff its table has no hop and each couple keeps both line momenta, and 31 of 1,345 such members pass every structural gate, all dressing more (E-FLD-0022). The momentum weave keeps it at a dressing of 108,080 slots against 1,508 (E-FLD-0023). A four-line scatter block makes line momenta exchange with P exact, and on the head-on turn weave it passes every committed gate, a lone love dressing 33, 133, 369, 900 against 33, 160, 565, 1,508. Local color forces one more invariant than P, the sum of the twelve line momenta (E-FLD-0024). That weave is a kinetic gas: a shear relaxes at a rate independent of wavelength (E-FLD-0025). A wider scattering gives hydrodynamics, nu = 0.47 constant to 6 percent from L = 12 to 24, but no member of six reaches both a constant viscosity and the committed dressing (10,391 against 1,508, E-FLD-0026). Sound needs a kept count: an additive energy and a pair-making vacuum clock exclude each other, and the flip table rings at 0.710 against c / 2 with a vacuum that does not clock (E-FLD-0027). A clock paid from demons keeps both but its wave does not propagate and a lone love avalanches to 89,010 (E-FLD-0028). That dressing is pair creation, not transport (E-FLD-0029). The knit\'s lattice Boltzmann equation predicts its transport with no fitted number (nu 0.474 against 0.469, sound 0.707 against 0.710) and finds two slab invariants (E-FLD-0030), and it follows the knit flow by flow, its Navier-Stokes level converging as L^-2 (E-FLD-0031). A cold vacuum with a kinetic threshold has energy, sound (0.694), a viscosity (nu = 0.56) and a quiet vacuum on one rule, at the cost of the vacuum clock (E-FLD-0032). The fear clock\'s vacuum fluctuates only as the hot flash superposed (E-FLD-0033)',
    unknown: 'hydrodynamics with the committed dressing and a vacuum clock on one rule, or a decision between the vacuum clock and a cold vacuum; and a block that removes the line-sum invariant, which needs at least six vibes in one act',
    why: 'without momentum the knit has no conserved motion for a color charge to ride',
    skills: ['cellular automata', 'lattice gases'],
    scope: 'a computational search, then the acceptance battery',
    starting: ['test/experiment/fluids/scatter-hydrodynamics.ts', 'test/experiment/fluids/cold-vacuum.ts'],
    depends: [],
    source: 'E-FLD-0020 to E-FLD-0033',
  },
  {
    id: 'OP-14',
    title: 'three generations with distinct masses',
    question: 'Which knit breaks the triality among the three triplet copies into three distinct values?',
    known:
      'under the triality weave the three copies are exactly degenerate and exactly conserved. The committed knit splits all three (reach 6.74, 2.74, 1.38). A condensate on one copy gives 1 + 2 (E-FRC-0140, E-FRC-0141)',
    unknown: 'a knit that breaks the triality into a hierarchy of three, and its relation to the warp localization of E-FRC-0030 and E-FRC-0033',
    why: 'the count of three is algebra until a dynamics sets the three apart',
    skills: ['representation theory', 'cellular automata'],
    scope: 'a computational investigation',
    starting: ['test/experiment/gauge/generation-splitting.ts'],
    depends: [],
    source: 'E-FRC-0140, E-FRC-0141',
  },
  {
    id: 'OP-15',
    title: 'dynamical quarks as fermions',
    question: 'Can the dynamical color matter on the Sigma(648) automaton be fermions in a dilute regime, and screen at every separation?',
    known:
      'triplets that hop break the center (<Re P> = 0.0853 against 0.0005) and screen a static pair, but the matter is a classical color vector (the gauge-Higgs form), it condenses (0.998 of sites), no dilute regime exists at this bond scale, and the R = 3 screening gate fails by 3.02 standard errors against a gate of 3 (E-FRC-0138, E-FRC-0139)',
    unknown: 'fermion matter on the automaton, a dilute regime, and the screening gate at half the box',
    why: 'string breaking by dynamical quarks is a reproduction in R-FRC-0001 and not yet a measurement of the base',
    skills: ['lattice gauge theory', 'fermion algorithms'],
    scope: 'a bond and mass grid, then larger boxes',
    starting: ['test/experiment/gauge/finite-color-quarks.ts', 'test/experiment/gauge/finite-color-screening.ts'],
    depends: ['R-FRC-0006'],
    source: 'E-FRC-0138, E-FRC-0139',
  },
  {
    id: 'OP-16',
    title: 'electroweak structure on the knit',
    question: 'Does the knit carry a doublet, a massive vector and Yukawa couplings, and does coarse rotation symmetry return with the chirality kept?',
    known:
      'the knit tells left from right: of 1152 x 6 x 24 candidates it keeps only the identity and C with reversal, and its lone-love response is 4.1 and 4.7 times more self-dual at sides 9 and 13 (E-FRC-0142). The vacuum is a period-24 condensate respecting only the charge U(1), a Higgs-like vacuum without a Higgs mechanism (E-FRC-0143). Coarse rotation symmetry does not return under the committed knit (E-RLT-0045), and its handedness is lattice-scale only (E-RLT-0046, partial). No single emergent metric absorbs the anisotropy (E-RLT-0047). No schedule of the committed architecture restores rotation symmetry. The orbit knit does, with anisotropy at the noise (0.23 and 0.21 against 1.20) and no CPT partner (E-RLT-0048). A palindrome buys CPT back and loses the isotropy (E-RLT-0049), and the scatter block narrows the fork without opening it (E-RLT-0050). Forced isotropy with exact local color costs at least 8 line-momentum invariants, and the quaternion knit, with CPT and forced isotropy, dresses 106,055 against 1,508 by the fourth period (E-RLT-0051). Calm-moving relabelings grow no period group (E-RLT-0052), and the combined knit shows no emergent isotropy to side 25 (anisotropy 0.76, E-RLT-0053)',
    unknown: 'the doublet, a massive vector, Yukawa couplings, and a knit with coarse rotation symmetry, CPT and chirality together: the fork between isotropy by symmetry and CPT with the round robin is open',
    why: 'the Higgs ledger rows stay algebra until one of these is measured',
    skills: ['lattice field theory', 'representation theory'],
    scope: 'open research',
    starting: ['test/experiment/gauge/vacuum-condensate-and-su2.ts', 'test/experiment/relativity/whole-dock-isotropic-knit.ts'],
    depends: [],
    source: 'E-FRC-0142, E-FRC-0143, E-RLT-0045 to E-RLT-0053',
  },
  {
    id: 'OP-17',
    title: 'light on the husk',
    question: 'Does the knit\'s U(1) link sector carry light with 2 polarizations and a 1 / r Coulomb field on the husk, the 3D horosphere surface where physics is read?',
    known:
      'the link sector is exact: Z_8192 angles beside integer flux, stored per link as a modeling choice under test, reversal, Gauss\'s law at every dock and beat, and a frame change in every dock (E-FRC-0164). Its light is measured in the bulk substrate, the D4 box, which is four-dimensional, so 3 polarizations and a 1 / r^2 field there are facts about the substrate, not physics. The cubic torus stands in for the flat 3D surface and gives 2 branches. The estimator counts 2 branches on the D4 box where 3 are expected, reads the photon 13 percent fast, and the Coulomb energy sits 7 to 10 percent high (E-FRC-0165, partial)',
    unknown: 'light with 2 polarizations and a 1 / r field measured on the husk of the {3,4,3,4} tessellation itself, and an estimator that counts branches correctly',
    why: 'physics is read on the husk, and the photon is the first gauge field to check there',
    skills: ['lattice gauge theory', 'hyperbolic geometry'],
    scope: 'a computational measurement on the horosphere surface',
    starting: ['test/experiment/gauge/photon-light.ts', 'test/experiment/gauge/photon-links.ts'],
    depends: ['R-FRC-0006'],
    source: 'E-FRC-0164, E-FRC-0165',
  },
]
