# P11: Emergent Rotational Invariance of the Dynamics

**Status: clarified (an honest, instructive result).**

## The question

P3 showed the substrate has no preferred frame. Does the emergent DYNAMICS propagate
isotropically? The expectation was that a regular lattice has a faceted, preferred-
axis wavefront while a random mesh restores isotropy, the rotational analogue of
Lorentz invariance.

## What we did

Evolve a localized perturbation under the emergent wave operator (the graph
Laplacian) on a random geometric mesh and on a square lattice. Measure the systematic
angular anisotropy of the wavefront, the strongest preferred-axis Fourier harmonic of
the intensity in an annulus, averaging the random mesh over realizations so disorder
noise (which has no preferred direction) cancels.

## Result

| substrate | systematic anisotropy |
| --------- | --------------------- |
| random geometric mesh | 0.110 (10 realizations, mostly disorder noise) |
| square lattice | 0.069 |

Both are small. The premise was wrong in an instructive way.

## What it means

The low-energy (long-wavelength) wavefront is approximately isotropic on **both**
substrates. This is the standard lattice-field-theory fact: **rotational and Lorentz
invariance EMERGE in the infrared even on a lattice**. The Laplacian's long-wavelength
dispersion is isotropic to leading order, and anisotropy is a lattice-scale (UV)
effect that is irrelevant at long wavelength. So the lattice is isotropic in the IR,
and the random mesh's residual 0.110 is disorder noise, not a systematic frame.

Two honest consequences:

- The emergent dynamics is Lorentz-isotropic at low energy **regardless of substrate
  regularity**, consistent with observation (no Lorentz violation seen at accessible
  energies). Discreteness threatens Lorentz invariance only at the Planck (UV) scale.
- This real-space test does **not** sharply separate lattice from random, because both
  are IR-isotropic. The clean substrate-level Lorentz distinction lives in P3 (link-
  direction isotropy), not in the IR dynamics. The cleaner dynamical probe is the
  short-wavelength dispersion relation, which is a future refinement.

## See also

`p3-both-worlds.md` (substrate-level Lorentz isotropy), `p1-law.md` (the emergent
Laplacian), and `note/questions/next-version.md` (P11).
