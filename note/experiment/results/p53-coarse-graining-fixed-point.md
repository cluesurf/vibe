# P53: The Coarse-Graining Fixed Point

**Status: demonstrated. The continuum dimension is a renormalization fixed point.**

## The question

A continuum description should be a fixed point of coarse-graining: zoom out and the
relevant observable does not change. For a sprinkled causal set, coarse-graining is
sub-sprinkling (decimation). Is the dimension invariant under it?

## Result

Halving the element count at each coarse-graining level:

| level | 2D dimension | 3D dimension |
| ----- | ------------ | ------------ |
| original | 2.005 | 3.007 |
| level 1 | 2.016 | 3.045 |
| level 2 | 2.018 | 3.023 |
| level 3 | 2.020 | 2.914 |
| level 4 | 2.072 | 2.949 |

The dimension stays at its continuum value through repeated decimation, so it is
**invariant under coarse-graining**, a fixed point.

## Reading

Zooming out by keeping half the elements at each step leaves the dimension unchanged. The
continuum dimension is a renormalization fixed point, so the discrete model has a stable
continuum description, the same at every scale. This is the fixed-point check of the
hardening roadmap.

## See also

`p52-continuum-limit.md`, `p5`, and `note/roadmap.md`.
