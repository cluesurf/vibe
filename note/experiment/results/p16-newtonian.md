# P16: The Newtonian Limit (Gravity, First Rung)

**Status: validated (one rung). Gravity is a long road.**

## The question

The gravitational action makes spacetime a stable phase (P2). A theory of gravity
also needs the weak-field potential. The static potential of a source is the Green's
function of the emergent Laplacian, the solution of the Poisson equation on the mesh.
In the continuum it falls as 1/r^(d-2) in d spatial dimensions: linear (confining) in
1D, logarithmic in 2D, and 1/r (Newtonian) in 3D. Does the mesh reproduce this?

## What we did

Solve the Poisson equation L phi = (a unit charge minus a uniform background) on a
cubic lattice by conjugate gradient (the zero mode projected out). Fit the potential
profile phi(r) against the expected form in each dimension, with a constant offset to
absorb the finite-box term.

## Result

| dimension | expected form | fit | quality |
| --------- | ------------- | --- | ------- |
| 1D | linear (confining) | a = -0.249 | R^2 = 0.94 |
| 2D | logarithmic | a = -0.129 | R^2 = 0.98 |
| 3D | Newtonian 1/r | best of three forms | R^2 = 0.9965 |

In 3D the 1/r (Newtonian) form is the clear best fit (R^2 = 0.9965), beating 1/r^2
(0.92) and logarithmic (0.90). The emergent static potential matches the continuum
Green's function in every dimension: **confining in 1D, logarithmic in 2D, and
Newtonian (1/r) in 3D**.

## Honest reading

This is the weak-field (Newtonian-potential) rung, and it is clean. It is not the
theory of gravity. The Einstein equations as equations of motion, a propagating spin-
2 graviton, and black-hole dynamics are all ahead. The potential here is also the
Green's function of any massless field, so this establishes the right dimensional form
of the static potential, the limit gravity must reproduce, not gravity's full
nonlinear dynamics. Gravity is at its onset (see the v3 paper).

## See also

`p2-uniform.md` and the gravity section of the v3 paper (the action), and
`note/questions/next-version.md` (P16).
