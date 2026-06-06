# P15: The Entanglement Area Law (Holography Rung)

**Status: validated (one rung). Full holography is a long road.**

## The question

Holography (AdS/CFT) ties bulk geometry to boundary entropy, and black-hole entropy
scales as area, not volume. Does the entanglement entropy of a region in the mesh's
ground state follow the right scaling: a conformal log law in 1D and an area law in
2D?

## What we did

Take the half-filled free-fermion ground state of the hopping Hamiltonian on the mesh
(fill the lowest half of the modes, the Fermi sea). Form the two-point correlation
matrix, restrict it to a region, and compute the entanglement entropy from the
restricted correlation eigenvalues. Scan the region size.

## Result

- **1D ring:** the entropy of a block of length L grows as S ~ a * ln(L) with
  **a = 0.323**, matching the conformal prediction c/3 = 0.333 for central charge
  **c = 1** (the free-fermion universality class). The famous 1D log law, recovered.
- **2D torus:** the entropy of an l x l block grows with the **boundary l (slope
  1.74)**, and a boundary (area) law fits better than a volume (l^2) law. **Area
  beats volume.**

So the ground-state entanglement lives on the **boundary** of a region, not in its
bulk: the conformal log law in 1D, and the area law in 2D.

## Why it matters

Entropy set by boundaries rather than volumes is the signature behind holography and
black-hole thermodynamics (the Bekenstein-Hawking area law). Seeing it emerge from
the free-field ground state on the mesh is the first holographic rung, and it sits
naturally with the hyperbolic (AdS-like) commitment of the substrate (P3).

## Honest reading

This is the entanglement-scaling rung, and it is clean (the 1D c = 1 log law and the
2D area law are textbook free-fermion results, here reproduced on the mesh). It is not
the holographic correspondence itself: a bulk-boundary dictionary, the
Ryu-Takayanagi minimal-surface formula, and black-hole entropy from horizon area are
the long road ahead. We have the area law, not yet holography.

## See also

`p3-both-worlds.md` (the hyperbolic, AdS-like substrate), and
`note/questions/next-version.md` (P15).
