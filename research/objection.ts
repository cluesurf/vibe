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
      'the committed rule is a classical permutation with no amplitudes, so every quantum-walk result is imported',
    measured:
      'the empty state flashes with period 3, a seeded defect stays within 2 slots over 4 beats, and two defects add with 0 overlap, where a coined walk spreads to 5 sites with cross term 0.357',
    verdict: 'stands',
    source: 'E-FND-0080, R-FND-0001',
  },
  {
    objection: 'SU(3) colour is absent from the rule, including under coarse-graining',
    measured:
      '2 of 9 u(3) generators kept, 1 of 995,328 schedule symmetries, 0 of 32 triangles inside a block, and 84 to 88 percent of the breaking kept at the whole-mesh scale',
    verdict: 'stands',
    source: 'E-FRC-0093 to E-FRC-0097, R-FRC-0003',
  },
  {
    objection: 'goal-directed movement is not produced by the base rule',
    measured:
      'the bare rule drifts -0.3748 toward a resource on one side and +0.3749 toward one on the other, no consistent approach, while the added valence layer shows a differential of 24.381',
    verdict: 'stands',
    source: 'E-SLF-0154',
  },
  {
    objection: 'willpower is added as a scalar, not derived',
    measured: 'the decision model takes willpower, foresight and the field as added abstract scalars, threshold 4',
    verdict: 'stands',
    source: 'E-SLF-0150',
  },
  {
    objection: 'attractor memory fails on the bare reversible rule',
    measured: 'recall 0 on the bare rule against 1 on a dissipative Hopfield layer, chance 0.167, 6 patterns, 256 cells',
    verdict: 'stands',
    source: 'E-MMR-0007',
  },
  {
    objection: 'the Ryu-Takayanagi results measure known hyperbolic geometry, not entanglement',
    measured: 'the experiments compare graph geodesic length to boundary arc on hyperbolic graphs, with no dynamics',
    verdict: 'stands',
    source: 'depth-grades regrade to L2, open problem OP-06',
  },
  {
    objection: 'the published papers labelled results more strongly than the code supports',
    measured: '9 passages, listed as errata with what each cited experiment does',
    verdict: 'stands',
    source: 'the 2026-08-31 audit, the papers page',
  },
  {
    objection: 'the greedy-routing result is labelled {3,4,3,4} but runs on the {5,4} plane tiling',
    measured: 'the experiment builds hyperbolicTiling({ p: 5, q: 4 }), at most 2,500 vertices',
    verdict: 'stands',
    source: 'E-NVG-0010, R-NVG-0001, open problem OP-04',
  },
  {
    objection: 'the dimension-eight pinch is described as proof-checked, but the kernel checks it only on integers',
    measured: 'the formal pinch file holds integer spot checks. The converse of Hurwitz is not a checked proof',
    verdict: 'stands',
    source: 'R-FND-0002, open problem OP-09',
  },
  {
    objection: 'the lattice QCD reproductions say nothing about the program',
    measured: 'they rest on the Wilson action and a seeded sampler, and on none of the five assumptions',
    verdict: 'stands',
    source: 'R-FRC-0001, the claim graph',
  },
]
