// The strongest objections the program has met or found in its own audits, each with the
// measurement behind it and whether it stands against the program as it is today.
//
//   stands    the objection is correct about the program today
//   answered  an experiment with a computed control now meets it, and is named
//   open      no experiment yet decides it

import type { Objection } from './type'

export const OBJECTIONS: Objection[] = [
  {
    objection:
      'the committed knit is a classical permutation with no amplitudes, so every quantum-walk result is imported',
    measured:
      'under the pair table the empty state flashes with period 3 (the committed turning weave recurs at beat 24, E-FND-0118), a seeded defect stays within 2 slots over 4 beats, and two defects add with 0 overlap, where a coined walk spreads to 5 sites with cross term 0.357. The signed weight on the role grid carries a quantum part (72 loves and 18 fears in the singlet, E-FRC-0120, an exact beat closing to su(9), E-FRC-0127), measured apart from the knit',
    verdict: 'stands',
    source: 'E-FND-0080, R-FND-0001, R-FRC-0005',
  },
  {
    objection:
      'SU(3) color is absent from the committed knit, including under coarse-graining',
    measured:
      '2 of 9 u(3) generators kept, 1 of 995,328 schedule symmetries, 0 of 32 triangles inside a block, and 84 to 88 percent of the breaking kept at the whole-mesh scale',
    verdict: 'stands',
    source: 'E-FRC-0093 to E-FRC-0097, R-FRC-0003',
  },
  {
    objection:
      'the classical color group of the adopted three-trit model does not reach the continuum',
    measured:
      'with a Re Tr U^2 term Sigma(648) matches SU(3) at the N_t = 4 transition (chi(2, 2) 0.375 against 0.378, chi(3, 3) 0.262 against 0.278), and on the trajectories measured its spacing stops shrinking there',
    verdict: 'stands',
    source: 'E-FRC-0103, R-FRC-0006',
  },
  {
    objection:
      'goal-directed movement is not produced by the base rule',
    measured:
      'the bare rule drifts -0.3748 toward a resource on one side and +0.3749 toward one on the other, no consistent approach, while the added valence layer shows a differential of 24.381',
    verdict: 'stands',
    source: 'E-SLF-0154',
  },
  {
    objection: 'the committed knit does not conserve momentum',
    measured:
      'charge is conserved at every beat of every run, while the charge-signed momentum along x drifts by 830 over 48 beats from a hash start',
    verdict: 'stands',
    source: 'E-FLD-0020',
  },
  {
    objection:
      'a knot alone is not bound, and under the committed orientation a lone color cannot come back',
    measured:
      'under the committed knit a color-neutral triple reaches as far in 6 beats as one of its members alone, 8.5 against 8.5, so nothing binds it (E-FRC-0111). Color-local moves keep a lone vibe in its sign class, and the committed class is one of the 192 of 4,096 line orientations that form an open half-space (E-FRC-0130). Binding is shown only with a paid string, on a line and on the D4 lattice with matter that waits in docks (E-FRC-0129, E-FRC-0131)',
    verdict: 'stands',
    source: 'E-FRC-0111, E-FRC-0130, R-FRC-0006',
  },
  {
    objection: 'willpower is added as a scalar, not derived',
    measured:
      'the decision model takes willpower, foresight and the field as added abstract scalars, threshold 4',
    verdict: 'stands',
    source: 'E-SLF-0150',
  },
  {
    objection: 'attractor memory fails on the bare reversible rule',
    measured:
      'recall 0 on the bare rule against 1 on a dissipative Hopfield layer, chance 0.167, 6 patterns, 256 docks',
    verdict: 'stands',
    source: 'E-MMR-0007',
  },
  {
    objection:
      'the Ryu-Takayanagi results measure known hyperbolic geometry, not entanglement',
    measured:
      'the experiments compare graph geodesic length to boundary arc on hyperbolic graphs, with no dynamics',
    verdict: 'stands',
    source: 'depth-grades regrade to L2, open problem OP-06',
  },
  {
    objection:
      'the published papers labeled results more strongly than the code supports',
    measured:
      '9 passages, listed as errata with what each cited experiment does',
    verdict: 'stands',
    source: 'the 2026-08-31 audit, the papers page',
  },
  {
    objection:
      'the greedy-routing result is labeled {3,4,3,4} but runs on the {5,4} plane tiling',
    measured:
      'the experiment builds hyperbolicTiling({ p: 5, q: 4 }), at most 2,500 vertices',
    verdict: 'stands',
    source: 'E-NVG-0010, R-NVG-0001, open problem OP-04',
  },
  {
    objection:
      'the dimension-eight pinch is described as proof-checked, but the kernel checks it only on integers',
    measured:
      'the formal pinch file holds integer spot checks. The converse of Hurwitz is not a checked proof',
    verdict: 'stands',
    source: 'R-FND-0002, open problem OP-09',
  },
  {
    objection:
      'the lattice QCD reproductions say nothing about the program',
    measured:
      'they rest on the Wilson action and a seeded sampler, and on none of the five assumptions',
    verdict: 'stands',
    source: 'R-FRC-0001, the claim graph',
  },
]
