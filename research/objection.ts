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
      'the knit moves positions by a classical permutation with no amplitudes, so every quantum-walk result is imported',
    measured:
      'under the pair table the empty state flashes with period 3 (the turning weave recurs at beat 24, E-FND-0118), a seeded defect stays within 2 slots over 4 beats, and two defects add with 0 overlap, where a coined walk spreads to 5 sites with cross term 0.357. The signed weight on the role grid carries a quantum part (72 loves and 18 fears in the singlet, E-FRC-0120, an exact beat closing to su(9), E-FRC-0127), and it runs in the adopted knit as the fear beat (E-FRC-0159, E-SPN-0063). That gives the roles amplitudes. The positions stay classical, the stream reading slots and never writing back (E-SPN-0081), so every walk result about positions is still imported',
    verdict: 'stands',
    source: 'E-FND-0080, E-FRC-0159, E-SPN-0063, E-SPN-0081, R-FND-0001, R-FRC-0005',
  },
  {
    objection:
      'the knit carries no color, including under coarse-graining',
    measured:
      'true of the turning weave, the knit before 2026-09-25: 2 of 9 u(3) generators kept, 1 of 995,328 schedule symmetries, 0 of 32 triangles inside a block, and 84 to 88 percent of the breaking kept at the whole-mesh scale. The adopted three-trit knit carries the classical color group Sigma(648) on its links: all 648 elements act as its 216 grid moves (E-QTM-0117), a change of frame in every dock commutes with the rule (E-FRC-0117), and 0 of 3,888 dock-beats change held color while 1,994 pairs are made (E-RLT-0067). It is a finite group, not the continuous SU(3), which is the next objection',
    verdict: 'answered',
    source: 'E-FRC-0093 to E-FRC-0097, E-QTM-0117, E-FRC-0117, E-RLT-0067, R-FRC-0003',
  },
  {
    objection:
      'the classical color group of the adopted three-trit model does not reach the continuum',
    measured:
      'with a Re Tr U^2 term Sigma(648) matches SU(3) at the N_t = 4 transition (chi(2, 2) 0.375 against 0.378, chi(3, 3) 0.262 against 0.278), and on the trajectories measured its spacing stops shrinking there. No finite subgroup of SU(3) contains Sigma(648) properly, so any gate outside it generates a dense subgroup, a theorem (L5), and the fear beat with Sigma(648) on each role generates all of su(9) (E-QTM-0118). But the steps come slowly: the first word closer to the qutrit T gate than any classical element needs 4 fear beats, 0.362 against 0.395 (E-QTM-0104)',
    verdict: 'stands',
    source: 'E-FRC-0103, E-QTM-0104, E-QTM-0118, R-FRC-0003, R-FRC-0006',
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
    objection: 'the knit does not conserve momentum',
    measured:
      'true of the turning weave: charge is conserved at every beat of every run, while the charge-signed momentum along x drifts by 830 over 48 beats from a hash start. The hop is 96 percent of the loss, and create, flip and annihilate move no particle momentum (E-FLD-0021). A rule in that family keeps it only with no hop, and every such rule dresses more (E-FLD-0022), the momentum weave at 108,080 slots against 1,508 (E-FLD-0023). The adopted knit keeps it: the isometric collision is an exact involution keeping charge, count and momentum on 21,152 docks (E-RLT-0061), and the lone bounce collision keeps momentum with a lone vibe\'s wake of 13 to 21 trits per period (E-RLT-0084)',
    verdict: 'answered',
    source: 'E-FLD-0020 to E-FLD-0026, E-RLT-0061, E-RLT-0084',
  },
  {
    objection:
      'a knot alone is not bound, and the knit binds nothing',
    measured:
      'under the turning weave a color-neutral triple reaches as far in 6 beats as one of its members alone, 8.5 against 8.5, so nothing binds it (E-FRC-0111), and its orientation is one of the 192 of 4,096 that form an open half-space, so a lone color cannot come back (E-FRC-0130). The adopted knit cannot bind either: its positions are classical, and two vibes cost exactly 2 over the vacuum at every separation on 17 of 17 link starts (E-SPN-0068). Binding is shown only with a paid string, on a line and on the D4 lattice with matter that waits in docks (E-FRC-0129, E-FRC-0131), and in discrete time only a counted string binds, on stand-in tokens (E-SPN-0074 to E-SPN-0078)',
    verdict: 'stands',
    source: 'E-FRC-0111, E-FRC-0130, E-FRC-0131, E-SPN-0068, E-SPN-0074, R-FRC-0006',
  },
  {
    objection: 'spin one half is not carried by the knit',
    measured:
      'the turning weave\'s turn lifts after four beats to (-1, +1) in SU(2)_L x SU(2)_R, and its palindromic schedule nets +1 over its period (E-SPN-0044). The role carries spin one half: under the 2 pi turn every role is a doublet and a scalar (E-SPN-0051, E-SPN-0054), and with every role locked into its doublet turn sign and exchange sign agree on every charge-one state (E-SPN-0071, stand-in tokens). But the adopted knit copies all 24 roots at once, so its copies commute and the spin never enters the band (E-SPN-0083). The doublet-locked stream that would carry it was adopted on 2026-09-26 and is not built',
    verdict: 'open',
    source: 'E-SPN-0044, E-SPN-0051, E-SPN-0054, E-SPN-0071, E-SPN-0083, open problem OP-08',
  },
  {
    objection: 'dropping the hop for local color spreads a lone disturbance about twice as wide',
    measured:
      'the color weave dresses 1.7 to 2.3 times wider than the turning weave (E-FRC-0125). The color turn weave, another hop-free table, keeps color exact dock by dock and dresses no more than the committed knit in every period at sides 7, 9 and 11 (love 31, 115, 265, 507 against 33, 160, 565, 1,508 at side 9). Its full battery passes for both signs at sides 7, 9 and 11, and a rule written before the numbers chooses it (E-FRC-0148). The answer is a comparison at one box size, not a bound: those supports are capped by the side-9 box, and on an unbounded lattice most lone vibes dress without bound under the committed knit as under the color-local ones (E-CMP-0015)',
    verdict: 'answered',
    source: 'E-FRC-0125, E-FRC-0136, E-FRC-0137, E-FRC-0148, E-CMP-0015',
  },
  {
    objection: 'a lone vibe dresses the vacuum without bound',
    measured:
      'the bounded dressing read in E-FRC-0125 and E-FRC-0136 was the side-9 box, which caps the support at its volume. The difference engine runs the knit exactly on an unbounded lattice: there most lone vibes dress without bound, growing about as t^5, and only 7 of 24 directions on the committed knit and 8 of 24 on the combined knit recur exactly, shifted, as travelers the stream keeps copying (E-CMP-0015). In the viscous scatter weave the dressing is pair creation, a front of new pairs at the vibe speed sqrt 2 (E-FLD-0029). On the adopted knit\'s lone bounce collision the wake stays on the vibe\'s own line, 13 to 22 trits per period at sides 8 and 12, and 0 trits off it (E-RLT-0084, E-RLT-0093), measured in boxes and not yet on an unbounded lattice',
    verdict: 'open',
    source: 'E-CMP-0015, E-CMP-0016, E-FLD-0029, E-RLT-0084, E-RLT-0093',
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
