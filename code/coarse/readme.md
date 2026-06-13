# code/coarse

The coarse-graining engine, the reusable algorithms and data structures for the renormalization tower of
selves (the multi-level-selves plan, rungs E2 to E6). The idea is the standard physics move, simulate the
exact micro rule only in windows, learn the effective rule of the next level up, run that on macro-units, and
stack levels. The micro is the ground truth that validates each level. The effective rules are the
compression that buys the scale.

## The modules

| file | role |
| --- | --- |
| `macro-unit` | a `MacroUnit` (one self, with members and observables), `extractUnits`, the `coarseLabels` map, and the per-level compression `meanUnitSize` |
| `transition-matrix` | the Markov-state model, `countMatrix`, `rowStochastic`, `transitionEigenvalues` (a self-contained symmetric Jacobi solver on the reversibilized matrix), `spectralGap`, `impliedTimescale`. A clean level shows a slow mode. |
| `causal-emergence` | Hoel `effectiveInformation` and `coarseGrainTpm`, measured on a real transition matrix, not a hand-built funnel |
| `validator` | the `commutingSquareError` (coarse-then-evolve versus evolve-then-coarse) and `mostProbableNext`, the simplest learned effective rule |
| `level-stack` | the `Level` and `effectiveVibeCount` accounting (N_top times C to the L) and `isCleanLevel` |

## How it is exercised

The experiments live in `test/experiment/selves/coarse-*` and `renormalization-tower`, with the shared micro
source `coarse-self-trajectory`. They emerge a self on the flat horosphere, run the conserving beat, and feed
the trajectory through this engine. Each is graded honestly, the spectral gap and commuting square and
effective-information measures are L2 method checks with controls, the tower is an L1 accounting. A genuine
L3 emergent-level claim from the pure base rule is the target of the full tower, not yet established.

## Honest position

The engine measures, it does not impose. A level is real only if it shows a spectral gap, a coarse map with a
small commuting-square error, and a causal-emergence or blanket signal. Where the measured dynamics shows no
such structure (for example no effective-information gain for free self diffusion), that is reported as an
honest negative, not forced.
