# P20: The Photon (the Free U(1) Gauge Field)

**Status: validated. Massless, gauge-invariant, two transverse polarizations.**

## The question

The U(1) gauge field is already in the testbed as the force that couples to matter
(P8: the covariant Dirac operator, the index theorem, the Aharonov-Bohm phase). What
was missing is the FREE photon: the gauge field's own propagation. Is it a proper
massless, gauge-invariant photon?

## What we did

The photon is the small fluctuation of the gauge field, governed by the lattice
Maxwell action S = (1/2) sum over plaquettes of F^2, where F is the curl of the link
field. We build the Maxwell (curl-curl) operator on a periodic 3D lattice, diagonalise
it, and read off the spectrum (omega^2 per mode).

## Result

| L | links (dof) | gauge zero modes | physical modes | min physical omega^2 | massive (Proca) min |
| - | ----------- | ---------------- | -------------- | -------------------- | ------------------- |
| 3 | 81 | 29 | 52 | 3.00 | 1.00 |
| 4 | 192 | 66 | 126 | 2.00 | 1.00 |
| 5 | 375 | 127 | 248 | 1.38 | 1.00 |

Three photon facts come straight out:

- **Gauge invariance.** About one third of the modes (the gradient, longitudinal
  directions) are EXACT zero modes, the photon's gauge freedom. The physical modes are
  the other two thirds, the **two transverse polarizations**.
- **Massless.** The smallest physical omega^2 shrinks as the lattice grows (3.00,
  2.00, 1.38 for L = 3, 4, 5, exactly 4 sin^2(pi/L)), so the lowest momentum 2pi/L
  falls and the photon has no gap: omega goes to zero as the momentum does.
- **Contrast.** A mass term (Proca) gives a fixed gap (min omega^2 = m^2 = 1),
  independent of L. The free gauge field is massless, a massive vector is not.

## Reading

The photon is fully present: the U(1) gauge field couples to matter (P8) and
propagates as a massless, gauge-invariant, two-polarization field. Combined with the
scalar field (the graph Laplacian, P16) and the fermions (Dirac and overlap, P4, P14),
the testbed now carries scalar, spinor, and vector (gauge) fields. The fields still to
add are the **graviton** (a propagating spin-2 mode, P16) and a **Higgs scalar** (with
symmetry breaking).

## See also

`note/experiment/results/p8-confinement.md` (the gauge field coupling to matter),
`p16-newtonian.md` (the scalar field), and `p20-photon` (the experiment).
