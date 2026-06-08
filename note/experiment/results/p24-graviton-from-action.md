# P24: The Graviton Operator Derived from the Action

**Status: solved. The operator is derived, not typed in, two genuine ways.**

## The fix

The earlier version typed in the linearized Einstein operator's momentum-space formula. This version
derives it from the action.

## A. The d'Alembertian from the discrete (Benincasa-Dowker) action on a sprinkling

The smeared Benincasa-Dowker d'Alembertian B_eps is built only from the causal order of a Poisson
sprinkling of 2D Minkowski space (no metric, no coordinates in the operator, just who precedes whom
and how many elements lie between). In the mean it recovers the field d'Alembertian box = -d_t^2 +
d_x^2. We show its Lorentzian signature robustly with a paired test on the SAME sprinkling (so the
geometric fluctuations cancel):

| quantity | value |
| -------- | ----- |
| box(time-concentrated) - box(space-concentrated) | 141.6 +/- 3.5 |
| continuum value | 177.8 |
| robustly positive (Lorentzian signature) | YES (about 40 sigma) |

The raw BD operator has large, genuine fluctuations (a known feature), so we use Sorkin's smeared
operator and the paired difference. The kinetic operator of the field action emerges from the
discrete substrate.

## B. The spin-2 graviton operator via Christoffel to Ricci to Einstein

The linearized graviton operator is built through the geometric pipeline (linearized Christoffel,
then Ricci, then the Einstein combination), not typed as a formula. From the derived operator, two
facts come out with no transverse-traceless projector imposed:

| momentum k | physical modes | eigenvalue | diffeomorphism residual |
| ---------- | -------------- | ---------- | ----------------------- |
| (0,0,1) | 2 | 0.50 = (1/2)k^2 | 0 |
| (1,1,1) | 2 | 1.50 = (1/2)k^2 | 1.4e-16 |
| (2,1,3) | 2 | 7.00 = (1/2)k^2 | 0 |

Pure-gauge perturbations h = k xi + xi k are annihilated (diffeomorphism invariance, residual at
machine zero), and the physical spectrum is exactly two massless modes at (1/2)|k|^2, the two
graviton polarizations, with the eigenvalue shrinking to zero with |k| (massless).

## Reading

The kinetic operator is no longer typed in. The scalar d'Alembertian emerges from the causal order of
a sprinkling through the Benincasa-Dowker operator, and the spin-2 graviton operator is built through
the geometric pipeline, out of which diffeomorphism invariance and exactly two massless polarizations
come for free. P32 now verifies the contracted Bianchi identity on this derived operator.

## See also

`p32-einstein-equations.md`, `p21-graviton.md`, `p73-discrete-graviton.md`, `p16-newtonian.md`.
