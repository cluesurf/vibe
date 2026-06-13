# P10: The Cosmological Constant (Everpresent Lambda)

**Status: progress, qualitative.**

## The question

Causal set theory's one quantitative cosmological prediction is Sorkin's everpresent
Lambda. Spacetime volume V is realized as the element count N. Lambda is conjugate to
V. So Lambda inherits the Poisson volume fluctuation, delta-Lambda ~ 1/sqrt(V), which
at the observed 4-volume gives the dark-energy magnitude. We test the scaling that
underlies it: how does the discrete action fluctuation scale with volume?

## What we did

Sprinkle N points into a fixed 2D Minkowski region, 30 realizations per size, for
N = 64, 128, 256, 512. Measure the standard deviation of the Benincasa-Dowker action
across realizations, sharp and smeared, and fit the scaling exponent. Since the
action estimates Lambda times V, delta-Lambda ~ delta-S / N, so delta-Lambda scales
as N^(exponent - 1).

## Result

| action | std(S) scaling | implied delta-Lambda |
| ------ | -------------- | -------------------- |
| sharp BD | N^1.47 | N^+0.47 (grows with volume) |
| smeared BD | N^0.71 | N^-0.29 (shrinks with volume) |

- The **sharp action has the fluctuation problem**: its fluctuation grows faster than
  the volume, so the implied Lambda would grow with the size of the universe. Bad.
- The **smeared action tames it**: the implied Lambda **decreases** with volume
  (N^-0.29), the qualitative signature of the everpresent Lambda, a small and
  shrinking Lambda for a large universe. The smeared fluctuation is also about 60
  times smaller than the sharp one at N = 512.

## Honest reading

The smearing converts the fluctuation problem into the right qualitative behaviour
(Lambda shrinks as the universe grows). The exact Sorkin exponent of -0.5 is not
recovered at these sizes. The measured -0.29 reflects 2D, finite size, and the
smearing scale, and a clean -0.5 is an open refinement (larger N, 4D, a tuned
smearing). The analytic basis of the prediction (number-volume Poisson conjugacy)
is Sorkin's. What we add is that the smeared dynamics fluctuation is consistent with
a decreasing Lambda rather than the divergent one the sharp action gives.

The cosmological consequence, taken from the everpresent model: at the observed
4-volume of about 10^244 Planck units, delta-Lambda ~ 1/sqrt(V) ~ 10^-122 in Planck
units, the observed dark-energy scale.

## See also

`p2-uniform.md` (the smeared action and the manifold phase), the gravity reading in
the v3 paper, and `note/questions/next-version.md` (P10).
