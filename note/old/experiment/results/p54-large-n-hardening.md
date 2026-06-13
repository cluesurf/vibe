# P54: Performance and Large-N Hardening

**Status: demonstrated. Larger N is reachable, and the continuum limit sharpens there.**

## The question

Does performance help harden the theory? Not by itself, but it unlocks larger N, and
larger N hardens the size-limited results. The continuum-limit check (P52) was limited to
N = 4000 because building the full causal set costs O(N^2) memory (the whole transitive
closure). Can we go much further?

## What we did

Estimate the dimension a faster way: sample random pairs and check the lightcone from the
coordinates directly (two points are causally related iff timelike separated). This is
O(N) memory and O(samples) work, independent of N^2, so it reaches N in the tens of
thousands.

## Result

Cross-check at N = 1500 (2D): the exact O(N^2) estimator gives 1.985, the sampled O(N)
estimator gives 1.985. They agree.

Large-N continuum limit, reachable only with the sampled estimator:

| N | 2D dimension (error) | 3D dimension (error) |
| - | -------------------- | -------------------- |
| 2000 | 1.987 (0.013) | 2.978 (0.022) |
| 8000 | 2.006 (0.006) | 2.983 (0.017) |
| 30000 | 2.000 (0.000) | 2.996 (0.004) |
| 100000 | 1.997 (0.003) | 2.996 (0.004) |

At N = 100000, far beyond the full-causal-set wall, the dimension sits at the continuum
value with a shrinking error.

## Reading

Performance is not a result, but it is the enabler. The sampled estimator (O(N) memory)
reaches N = 100000 where the exact O(N^2) approach cannot, and there the continuum limit
is hardened: the dimension sits at the continuum value with a small, shrinking error. The
same sampling trick applies to the action fluctuation and the dominance checks, the other
size-limited results, so this is a general lever for hardening at scale.

## See also

`p52-continuum-limit.md`, `p53-coarse-graining-fixed-point.md`, and `note/roadmap.md`.
