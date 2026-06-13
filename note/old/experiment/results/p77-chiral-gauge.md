# P77: Chiral Gauge Theory (Obstruction and Partial Resolution)

**Status: partial. The obstruction and the vector resolution are shown. The full chiral theory is open.**

## The question

P8 gave a vector gauge theory (confinement, the index theorem, the chiral condensate). A
genuinely chiral gauge theory, where left and right couple differently, is hard on any discrete
substrate, by the Nielsen-Ninomiya theorem.

## Result

| d | naive species (2^d) | net chirality | species after a Wilson term |
| - | ------------------- | ------------- | --------------------------- |
| 1 | 2 | 0 | 1 |
| 2 | 4 | 0 | 1 |
| 3 | 8 | 0 | 1 |
| 4 | 16 | 0 | 1 |

A naive lattice fermion is not one species but 2^d, the extra doublers at the corners of momentum
space, carrying opposite chiralities that sum to zero, so a single chiral fermion cannot be
isolated. A Wilson term gives the doublers a large mass and leaves exactly one light species.

## Reading

This is an honest partial. The doubling and its chirality cancellation are the Nielsen-Ninomiya
obstruction, a fact about discrete space in general, not a flaw of the model. The Wilson term
leaves one species, which is what makes the vector gauge theory of P8 work, and the
Ginsparg-Wilson and overlap construction (Neuberger) restores an exact lattice chiral symmetry on
top of that. What remains open, here as in lattice physics generally, is the genuinely chiral
gauge theory, coupling one handedness to the gauge field with gauge invariance and anomaly
cancellation. We mark it open rather than claim it.

## See also

`p8-gauge-fields.md`, `p23-gauge-from-action.md`, `p25-electroweak.md`.
