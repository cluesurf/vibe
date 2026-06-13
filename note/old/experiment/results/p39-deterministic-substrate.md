# P39: A Non-Random Substrate

**Status: demonstrated. A deterministic, non-arbitrary mesh is as Lorentz-safe as the random one.**

## The question

The substrate was a RANDOM hyperbolic graph, and the randomness was load-bearing: it is
what keeps the mesh Lorentz-safe where a lattice is not (P27). But the framework rejects
true randomness. Can a DETERMINISTIC, non-arbitrary placement be just as Lorentz-safe?

## What we did

Built the **golden-angle hyperbolic sunflower**: the radius is the exact hyperbolic-area
inverse-CDF at stratified heights, and the angle is the golden angle (the most irrational
rotation, the lowest-discrepancy aperiodic placement). No random numbers. Measured it
against the random sprinkle on the same isotropy and reach tests. See
`note/deterministic-substrate.md` for the full spec and the ranked alternatives.

## Result

| substrate | mean degree | Lorentz anisotropy | exponential reach |
| --------- | ----------- | ------------------ | ----------------- |
| random sprinkle | 10.6 | 0.070 | yes |
| deterministic sunflower | 9.1 | **0.049** | yes |

The deterministic sunflower is **as isotropic as the random sprinkle, or better** (lower
anisotropy), with the same exponential reach, and no randomness at all. It is also
non-arbitrary: the golden angle is the unique optimum for spreading points evenly with no
preferred direction, not one choice among many.

## Honest reading

The substrate does not need randomness. A deterministic, non-arbitrary, low-discrepancy
placement is just as Lorentz-safe. The remaining frontier is to get the same isotropy
from a deterministic GROWTH rule (the framework-native answer), not a static placement.

## See also

`note/deterministic-substrate.md` (the spec), `p3-study`, `p27-lorentz-violation`, and
`p39-deterministic-substrate` (the experiment).
