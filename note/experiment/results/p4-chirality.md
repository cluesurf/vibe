# P4 / Stage D: Threading the Chirality Wall

The deepest concrete blocker toward the Standard Model was the chirality wall: the
Nielsen-Ninomiya theorem forbids a single chiral fermion on a naive lattice, since
it forces doublers. We implemented the three standard responses in 2D momentum
space and confirmed that the **overlap operator threads the needle**: one fermion
species with exact lattice chiral symmetry, no doublers.

Reproduce: `npx tsx code/experiment/p4-chirality.ts`.

## The setup

In 2D, spinors are 2-component and the gamma matrices are Pauli matrices. For each
momentum on a Brillouin-zone grid that includes the special points 0 and pi:

- **naive** D(k) = i (sin k1 sigma_x + sin k2 sigma_y).
- **Wilson** D(k) = naive + (r (2 - cos k1 - cos k2)) I.
- **overlap** D(k) = I + gamma5 sign(H_W), with H_W = gamma5 (D_Wilson - m0), the
  2x2 hermitian sign in closed form, and 0 < m0 < 2r.

We count **species** (grid points where the smallest singular value of D is near
zero, the massless modes) and the **Ginsparg-Wilson residual** (the norm of
{D, gamma5} - D gamma5 D, which is zero for an exact lattice chiral symmetry).

## The result

```
operator   species   GW residual    reading
naive          4      2.83e+0        doubled (2^2 = 4)
wilson         1      1.13e+1        one species, chiral symmetry broken
overlap        1      6.3e-16        one species, exact chiral symmetry
```

Three clean, exact outcomes:

1. **Naive: four doublers.** The dispersion vanishes at all four corners
   (0,0), (0,pi), (pi,0), (pi,pi), giving 2^2 = 4 species. Its GW residual is large
   because it satisfies the stronger naive chiral symmetry {D, gamma5} = 0, which
   is exactly why Nielsen-Ninomiya forces it to double.
2. **Wilson: one species, but chiral symmetry broken.** The Wilson term lifts the
   three doublers, leaving one light mode. But its GW residual is large (11.3): the
   Wilson term explicitly breaks chiral symmetry. Doublers gone, chirality lost.
3. **Overlap: one species and exact chiral symmetry.** One light mode AND a GW
   residual of 6.3e-16, machine zero. The overlap operator satisfies the
   Ginsparg-Wilson relation exactly (because sign(H_W)^2 = 1), giving an exact
   lattice chiral symmetry with no doublers.

## What this validates

**The chirality wall has a clean resolution, and the overlap operator is it.** A
single chiral fermion species with exact lattice chiral symmetry exists on the
mesh, threading the Nielsen-Ninomiya no-go theorem. This is the hard part of Stage
D, the step that the gauge-and-matter ladder was blocked on. Two known-answer
tests guard it: the naive operator has exactly 4 doublers, and the overlap
operator has exactly 1 species with a GW residual below 1e-9.

## Honest caveats

- **Free fields in 2D momentum space.** This is the clean, exact demonstration of
  the doubler count and the Ginsparg-Wilson property. It is not yet the overlap
  operator on a position-space mesh coupled to the SU(2) gauge field of Stage C.
  That coupling (a chiral gauge theory) is the next step and is genuinely hard:
  chiral gauge theories on the lattice are still an active research problem.
- **2D, not 4D.** The same construction works in 4D (4-component spinors, 16
  doublers, the overlap built from the 4D Wilson kernel), which is the
  physically relevant case and a clean extension.
- **Index / anomaly not measured.** The overlap operator's index (the
  Atiyah-Singer index on the lattice) is the next thing one would compute to show
  the chiral anomaly. We measured the species count and the GW relation, which are
  the core of the wall.

## Status

P4 / Stage D moves from **open** to **threaded**: the overlap operator gives a
single chiral fermion with exact lattice chiral symmetry. The remaining ladder is
coupling this chiral fermion to the confining SU(2) field (a lattice chiral gauge
theory) and the full Standard Model content (Stage E), which remain ahead.

## See also

`p8-confinement.md` (Stage C), `note/questions/p4-chirality-spec.md` (the plan),
`testbed/08-path-to-gauge-and-matter.md` (the full ladder).
