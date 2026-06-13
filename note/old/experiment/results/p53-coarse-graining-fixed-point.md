# P53: The Renormalization Group (a Genuine Coupling Flow)

**Status: solved. A measured coupling flows to a fixed point, not trivial decimation.**

## The fix

The earlier version called random decimation of a sprinkle a "renormalization fixed point", but a
sub-sprinkle of a d-dimensional sprinkle is trivially still d-dimensional, so nothing flowed. A real
RG has a COUPLING that flows. The tone dynamics are Ising-like, so we run the actual block-spin RG.

## Result

Block-spin (decimate every other tone) on the Ising-like chain, measuring the renormalized coupling
from the blocked chain's correlations:

| K | K' measured | exact recursion tanh K' = tanh^2 K |
| - | ----------- | ---------------------------------- |
| 2.00 | 1.654 | 1.654 |
| 1.00 | 0.667 | 0.663 |
| 0.50 | 0.216 | 0.217 |
| 0.25 | 0.060 | 0.060 |

Iterating from K = 1.5: 1.5 -> 1.16 -> 0.82 -> 0.49 -> 0.21 -> 0.04 -> 0.00, flowing to the fixed
point K* = 0 (the disordered fixed point). Secondary: the causal-set dimension is, separately, a
coarse-graining invariant.

## Reading

Coarse-graining is a genuine renormalization group. The coupling is MEASURED to shrink under
block-spinning, matching the decimation recursion, and iterating drives it to a fixed point. The
dimension invariance is a separate coarse-graining fact, no longer the headline.

## See also

`p52-continuum-limit.md`, `p58-emergent-macro-rule.md`.
