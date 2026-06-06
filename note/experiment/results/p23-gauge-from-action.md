# P23: The Gauge Operator Derived from the Action

**Status: validated. The photon kinetic operator is the small-field limit of the Wilson action.**

## The question

P20 built the photon (Maxwell) operator by hand. Does it instead FOLLOW from the
discrete gauge action of P8, rather than being assumed?

## What we did

The Wilson gauge action is S = sum over plaquettes of [1 - cos(theta_plaquette)],
where theta_plaquette is the curl of the link angles. For small fields, 1 - cos(x)
goes to x^2 / 2, so S goes to (1/2) sum of theta_plaquette^2, the Maxwell action whose
Hessian is the curl-curl (photon) operator. We shrink the field and compare.

## Result

| field scale eps | Wilson action / Maxwell action |
| --------------- | ------------------------------ |
| 0.50 | 0.926 |
| 0.20 | 0.988 |
| 0.10 | 0.997 |
| 0.05 | 0.999 |
| 0.02 | 0.99988 |

The ratio converges to one as the field shrinks, so the lattice gauge action reduces
to the Maxwell action in the small-fluctuation limit. The resulting operator is the
massless curl-curl (smallest physical omega^2 = 2.0 at L = 4, shrinking with L, P20).

So the photon kinetic operator is **derived** from the discrete gauge action, not put
in by hand: the photon is the small excitation of the Wilson-action gauge field.

## See also

`p20-photon.md` (the photon operator), `p8-confinement.md` (the Wilson action), and
`p23-gauge-from-action` (the experiment).
