# P84: A Genuine Lorentz (Boost) Invariance Test

**Status: solved. Replaces the spatial-rotation proxy with a real boost test.**

## Why this exists

The earlier "Lorentz-safe" results (P27 and the substrate surveys) measured only the angular
isotropy of spatial link directions. That is rotational isotropy, not Lorentz invariance, which is
about boosts. This experiment is the genuine boost test, and the older claims should be read as
"spatially isotropic" with this as the real Lorentz check.

## The idea

The boost parameter of a timelike causal link a to b is its rapidity, eta = atanh(dx/dt). A boost by
xi shifts every rapidity by xi (rapidities add). So a structure with no preferred frame has a
rapidity distribution that is flat (translation-invariant in rapidity), and one with a preferred
frame has a peaked distribution. A Poisson sprinkling of Minkowski space is Lorentz invariant in
distribution, so its causal-link rapidities should be broad and flat. A regular lattice has a rest
frame, so its timelike links pile up at rapidity 0.

## Result

| structure | rapidity flatness (normalized entropy) | rapidity spread |
| --------- | -------------------------------------- | --------------- |
| sprinkle (Poisson) | 0.999 | 2.16 |
| lattice | 0.000 | 0.000 |

The sprinkle's causal-link rapidity distribution is essentially flat (entropy 0.999 of the maximum):
no preferred boost, no preferred frame. The lattice's timelike covering links all sit at rapidity 0
(its rest frame). Applying an actual Lorentz boost of rapidity 1.0 to the sprinkle coordinates leaves
the distribution shape unchanged (flatness 0.999 to 1.000, change 0.000), confirming boost
covariance.

## Reading

This is a real Lorentz statement: a flat rapidity distribution is invariance under boosts
(translations in rapidity), and the sprinkle has it while the lattice does not. It is the test the
earlier rotation-only "Lorentz safety" claims should have used. Scope: it is demonstrated in 1+1
dimensions on a finite causal diamond, with a central time band to suppress boundary bias.

## See also

`p27-lorentz-violation.md` (the spatial-rotation proxy this replaces), `p11-lorentz.md`.
