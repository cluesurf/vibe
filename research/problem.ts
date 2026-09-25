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
      'the bare knit has no amplitudes: defects add exactly as sets (R-FND-0001). Apart from the knit, the signed weight on the role grid is the quantum part: the singlet is 72 loves and 18 fears on 54 units (E-FRC-0120), the cube-root swap phase moves the weights by an exact kernel in quarters (E-FRC-0121), 8 rounds stay exact with a fear share near 0.3, under the bound of a third (E-FRC-0122), and the swap phase is an exact reversible beat whose gate set closes to su(9) (E-FRC-0127)',
    unknown:
      'whether the weights can ride the knit\'s own streaming, and whether the weight on a position can be real loves and fears',
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
    source: 'E-FND-0080, E-FRC-0120 to E-FRC-0122, E-FRC-0127',
  },
  {
    id: 'OP-02',
    title:
      'the three-trit knit: which pair table, and color finer than the N_t = 4 spacing',
    question:
      'Which pair table should the adopted three-trit knit run, given that color is local only on a hop-free table, and can its color group go finer than the N_t = 4 spacing?',
    known:
      'the committed knit carries no SU(3), and coarse-graining brings none back (R-FRC-0003). Color is the role trit, adopted on 2026-09-25. Color is an exact local law only on a hop-free table (E-FRC-0124), and the hop-free color weave spreads a lone disturbance 1.7 to 2.3 times wider (E-FRC-0125). The classical group Sigma(648) matches SU(3) at the N_t = 4 transition, and on the trajectories measured its spacing stops shrinking there (E-FRC-0103)',
    unknown:
      'a color-local table that passes the dressing gate, and an exact step finer than the classical group',
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
    source: 'E-FRC-0103, E-FRC-0124, E-FRC-0125',
  },
  {
    id: 'OP-03',
    title: 'a ground state for a vacuum that flashes',
    question:
      'Can a Z3 phase ride on the vacuum clock, or does the clock rule out the ground state physics needs?',
    known:
      'the empty state is not fixed, because calm and calm make a love and a fear. Under the pair table alone it is a global period-three oscillation (E-FND-0080). Under the committed turning weave, which runs that pair clock inside a 24-beat schedule, it recurs at beat 24 and not before (E-FND-0118)',
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
    source: 'E-FND-0080, E-FND-0118',
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
      'E-SPN-0014 computes an identity true of every vector, and the exchange signs were typed',
    unknown: 'the dynamical result',
    why: 'the published paper claimed it',
    skills: ['representation theory', 'quantum foundations'],
    scope: 'open research, gated on OP-01',
    starting: ['test/experiment/spin/fermi-exclusion.ts'],
    depends: ['R-FND-0001'],
    source: 'paper errata, E-SPN-0014',
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
]
