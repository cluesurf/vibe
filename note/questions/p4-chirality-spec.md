# P4 / P8 Stage D Spec: the chirality wall

The deepest concrete blocker toward the Standard Model. This is the plan to climb
it, and which solution to implement.

## The wall

A naive lattice Dirac operator has the momentum-space form D(k) = i sum_mu
gamma_mu sin(k_mu). The dispersion sin(k_mu) vanishes not only at k = 0 but also
at every Brillouin-zone corner where each k_mu is 0 or pi. In d dimensions that is
**2^d zeros, hence 2^d fermion species (doublers)** instead of one. The
**Nielsen-Ninomiya theorem** makes this unavoidable: a lattice Dirac operator that
is local, translation invariant, hermitian, and has an exact chiral symmetry
(anticommutes with gamma5) MUST come with equal numbers of left- and right-handed
doublers, so the net chirality is zero. You cannot put a single chiral (Weyl)
fermion on a naive lattice. The Standard Model is chiral, so this is a wall.

## The resolutions

1. **Wilson fermions.** Add a momentum-dependent term r sum_mu (1 - cos k_mu) to
   the operator. It vanishes at k = 0 (the physical mode) but is large at the
   doubler corners, lifting the 2^d - 1 doublers to the cutoff. Result: one light
   species. Cost: the Wilson term **explicitly breaks chiral symmetry**. Good for
   removing doublers, bad for chirality.
2. **Staggered (Kogut-Susskind).** Spread the spinor components over the corners of
   a hypercube, reducing 2^d doublers to 2^(d/2) tastes, keeping a remnant chiral
   symmetry. Reduces but does not eliminate doubling.
3. **Domain-wall.** Add a fifth dimension. A chiral zero mode binds to each wall,
   left on one, right on the other. A single chiral fermion lives on a wall. Clean
   but heavier.
4. **Overlap / Ginsparg-Wilson (the ideal).** Build a Dirac operator D that
   satisfies the Ginsparg-Wilson relation {D, gamma5} = D gamma5 D. This is the
   loophole in Nielsen-Ninomiya: instead of giving up chirality, you give up the
   assumption that chiral symmetry is the naive {D, gamma5} = 0. The GW relation
   defines a modified, exact lattice chiral symmetry (Luscher), with **no
   doublers**, at the cost of a mild nonlocality. The Neuberger overlap operator
   D = 1 + gamma5 sign(H_W), built from the Wilson kernel H_W = gamma5 (D_W - m0),
   satisfies it exactly because sign(H_W)^2 = 1.

## Why overlap is the ideal solution

It is the only one of the four that gives **a single species AND an exact lattice
chiral symmetry at once**. Wilson kills doublers but breaks chirality. Staggered
keeps partial chirality but keeps doublers. Domain-wall works but needs an extra
dimension. Overlap threads the needle: it is the precise, modern resolution of the
Nielsen-Ninomiya theorem, and the cleanest thing to demonstrate.

## The plan to implement and validate

Work in **momentum space** with free fields, where everything is small per-k
matrices and the answers are exact (no Monte Carlo noise). In 2D, spinors are
2-component and the gamma matrices are Pauli matrices (gamma1 = sigma1,
gamma2 = sigma2, gamma5 = sigma3). For each momentum k on a Brillouin-zone grid
that includes the special points 0 and pi:

- **naive** D(k) = i (sin k1 sigma1 + sin k2 sigma2).
- **Wilson** D(k) = naive + (m + r(2 - cos k1 - cos k2)) I, with m = 0.
- **overlap** D(k) = I + gamma5 sign(H_W(k)), H_W = gamma5 (D_W - m0), with the
  Wilson kernel D_W and 0 < m0 < 2r. The 2x2 hermitian sign is closed form.

Then measure two things over the grid:

- **species count**: the number of grid points where the smallest singular value
  of D(k) is near zero (the massless modes). Prediction: naive 4, Wilson 1,
  overlap 1.
- **Ginsparg-Wilson residual**: the max over the grid of the norm of
  {D, gamma5} - D gamma5 D. Prediction: overlap about 0 (exact GW chiral
  symmetry), Wilson large (broken), naive large (it anticommutes with gamma5, the
  naive symmetry, which is exactly why it is doubled).

The ideal result is the overlap row: **one species and a zero GW residual**, a
single fermion with exact lattice chiral symmetry, threading Nielsen-Ninomiya.

## What this does and does not deliver

Delivers: a validated demonstration, on the testbed, that the chirality wall has a
clean resolution, and which one is ideal. This is the entry to Stage D.

Does not deliver: interacting chiral gauge theory (coupling the overlap fermion to
the SU(2) field of Stage C), nor the full Standard Model (Stage E). Those remain
ahead. But "a single chiral fermion species with exact lattice chiral symmetry" is
the hard part of the wall, and that is what we implement.

## See also

`note/experiment/results/p8-confinement.md` (Stage C), and
`testbed/08-path-to-gauge-and-matter.md` (the full ladder) in the monorepo.
