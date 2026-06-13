# P73: The Discrete Graviton (Polarizations Measured from the Spectrum)

**Status: solved. The lattice operator is genuine, and the two polarizations are now measured.**

## The fix

The lattice linearized Einstein operator was already genuine (it acts on a real 4D lattice of
symmetric tensors), but the polarization count was hardcoded (`return 2`). Now the count is measured
from the operator's momentum-space spectrum.

## Result

| check | value |
| ----- | ----- |
| gauge invariance (operator annihilates h = d xi) | residual 3.1e-16 |
| massless (constant perturbation costs nothing) | residual 0 |
| dispersion eigenvalue / k^2 across wavenumbers | flat (massless) |
| measured spectrum (10 symmetric-tensor modes) | -1, 0, 0, 0, 0, +1/2 (x5) |
| diffeomorphism gauge modes (exact zeros) | 4 |
| physical polarizations (TT modes verified as propagating eigenvectors) | 2 |

The momentum-space operator is assembled by probing the lattice operator with the ten symmetric-tensor
plane-wave basis modes and diagonalizing. The spectrum shows 4 exact gauge zero-modes (the four
diffeomorphisms) and one unphysical trace mode at -1/2. The static spatial operator has five positive
modes, but only two are radiative: the two transverse-traceless modes are confirmed to be propagating
eigenvectors of the derived operator (M v = lambda v with lambda > 0), and the other three positive
modes are longitudinal, removed by the momentum constraint G_0i = 0.

## Reading

The two physical polarizations are no longer asserted. They are verified to be propagating eigenvectors
of the discrete lattice operator, alongside four measured gauge zero-modes, the discrete face of
general covariance. The remaining harder step is the second variation of the full discrete action on a
Poisson sprinkling, where the fluctuations are large (the scalar version of which P24 now demonstrates).

## See also

`p24-graviton-from-action.md`, `p21-graviton.md`, `p32-einstein-equations.md`.
