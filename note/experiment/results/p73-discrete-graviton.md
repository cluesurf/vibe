# P73: The Fully-Discrete Graviton

**Status: solved. The discrete graviton operator is a massless spin-2 field.**

## The question

P24 gave the graviton operator in the continuum limit. Build it directly on a discrete
lattice and show it is a massless spin-2 field.

## Result

The discrete linearized Einstein operator (finite differences on a periodic lattice) has the
three defining properties:

- **Gauge invariant.** It annihilates any pure-gauge perturbation h = d xi + (d xi)^T to
  machine precision (residual 3e-16). This is the spin-2 gauge symmetry, the discrete face of
  general covariance, and it protects the masslessness. (Consistent central differences are
  required, so the same-axis second difference is the central difference squared.)
- **Massless.** No mass term: a constant perturbation costs nothing (residual 0), and a plane
  wave costs an amount proportional to k^2, with the dispersion eigenvalue / k^2 flat across
  wavenumbers (0.500, 0.500, 0.500), so the dispersion passes through the origin.
- **Spin two.** Exactly two transverse-traceless polarizations, the two graviton helicities.

## Reading

The graviton is built directly on the lattice, not taken from the continuum. The discrete
operator's gauge invariance keeps it massless, its dispersion runs through the origin so it
moves at the speed of light, and it carries the two helicities of a massless spin-2 field.
The remaining harder step is the second variation of the full discrete action on a Poisson
sprinkling, where the fluctuations are large.

## See also

`p24-graviton.md` (the continuum-limit operator), `p32-einstein-equations.md`, `p72-nonlinear-einstein.md`.
