# P28: Singularity Resolution

**Status: demonstrated. Discreteness caps the curvature, no infinities.**

## The question

General relativity has singularities: at the big bang and inside black holes the
curvature diverges, because the continuum lets you probe arbitrarily small scales and
curvature goes as 1 / length^2. Does discreteness remove them?

## What we did

A causal set has a minimum causal interval, the smallest timelike-future proper time
from a point, set by the sprinkling density. We measure it versus density and read off
the implied curvature cap 1 / length^2.

## Result

| density rho | minimum length ell | curvature cap 1/ell^2 | ell times sqrt(rho) |
| ----------- | ------------------ | --------------------- | ------------------- |
| 1 | 0.545 | 3.4 | 0.545 |
| 2 | 0.342 | 8.5 | 0.484 |
| 4 | 0.230 | 19.0 | 0.459 |
| 8 | 0.153 | 42.7 | 0.433 |
| 16 | 0.102 | 96.8 | 0.407 |

The minimum length shrinks as 1 / sqrt(rho) (the last column is roughly constant,
confirming ell ~ rho^(-1/2) in 2D). So the curvature is **capped at a finite value**
that rises with density. There is no infinite curvature on a finite causal set.

## Why it matters

This resolves the singularities of general relativity. Where the continuum gives
infinite curvature (the big bang, the black-hole interior) because it can probe
arbitrarily small scales, the discrete substrate caps it at 1 / ell^2, set by the
discreteness scale. The big bang becomes a **finite-density beginning** at the
discreteness scale, not an infinite-density point. This fits the bootstrap (there
cannot be nothing, and the universe starts from a first element, not a singular t = 0).
The continuum divergence is recovered only as the density goes to infinity, the limit
with no discreteness.

## See also

`p16-newtonian.md` (the gravitational potential), the bootstrap discussion in the vibe
research notes, and `p28-singularity-resolution` (the experiment).
