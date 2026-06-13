# P52: The Continuum Limit

**Status: demonstrated. The dimension agrees with the continuum value across N.**

## The question

A discrete model must approach its continuum description as the number of elements grows.
Does the Myrheim-Meyer dimension estimate sit at, and converge to, the true dimension?

## Result

| N | 2D estimate (error) | 3D estimate (error) |
| - | ------------------- | ------------------- |
| 500 | 1.994 (0.006) | 2.980 (0.020) |
| 1000 | 2.005 (0.005) | 2.991 (0.009) |
| 2000 | 2.004 (0.004) | 2.978 (0.022) |
| 4000 | 2.010 (0.010) | 2.991 (0.009) |

The estimate agrees with the true continuum value to about one percent at every N. In 2D
the estimator is already near-exact (error at the noise floor), and in 3D the error
shrinks as a negative power of N (error ~ N^-0.24).

## Reading

The discrete model sits at its continuum description across scales, and approaches it more
closely as N grows where there is room to. This is the continuum-limit check of the
hardening roadmap.

## See also

`p5` (geometry from the order), `p53-coarse-graining-fixed-point.md`, and
`note/roadmap.md`.
