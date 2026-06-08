# P30: Inflation from Slow-Roll (Derived)

**Status: solved. The two phases emerge from the field, not a hardcoded rate.**

## The fix

The earlier version hardcoded a high spawn rate for the first six generations and a low one after, so
the two phases were the two inputs and the WHY of inflation was never addressed. This version derives
inflation from a slow-rolling inflaton field, integrating its equations of motion.

## Result

Inflaton in V = (1/2) m^2 phi^2, integrated from phi0 = 16 (slow-roll attractor):

| quantity | value |
| -------- | ----- |
| equation of state during inflation | w = -0.995 (near -1, accelerating) |
| e-folds (computed) | 64.6 |
| analytic phi0^2/4 | 64.0 |
| graceful exit (decelerates after slow-roll ends) | YES |

The accelerated phase (many e-folds, w near -1) and the graceful exit both emerge: inflation ends by
itself when the field rolls to where the slow-roll parameter epsilon reaches 1 and the kinetic energy
takes over.

## Reading

Inflation is derived, not assigned. The field slow-rolls while it is large (potential dominates, w
near -1, accelerating through e-folds = phi0^2/4), then ends by itself, a graceful exit, when slow-roll
fails. The two phases and the WHY of the transition come from the field rolling, not a hardcoded rate.

## See also

`p13-cosmology.md`, `p72-nonlinear-einstein.md`.
