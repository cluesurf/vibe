# P62: The Dimension Window (Why the Crystal Substrate Is Low-Dimensional)

**Status: solved. Compact regular hyperbolic crystals exist only in dimensions 2, 3, 4.**

## The question

Is the substrate's three-dimensional spatial form a choice or a constraint? The construction is
fully general: a regular hyperbolic honeycomb can be written in any dimension. So why three, and
is the model robust about it?

## What we did

A regular honeycomb {p1, ..., pk} tiles a k-dimensional space, and its type is read from the
signature of the Schlafli (Gram) matrix of its reflection group: positive definite is spherical
(a finite polytope), positive semidefinite is Euclidean (tiles flat space), one negative
eigenvalue (signature (k,1)) is hyperbolic (tiles H^k). It is COMPACT (a real crystal with finite
cells) when both its cell (drop the last entry) and its vertex figure (drop the first) are
spherical. We classify by the leading principal minors and enumerate all symbols.

The classifier passes spot-checks: {7,3} hyperbolic, {6,3} Euclidean, {3,3} spherical, {5,3,4}
hyperbolic, {4,3,4} Euclidean, {4,3,3} spherical.

## Result

Compact regular hyperbolic honeycombs (finite-celled crystals) by spatial dimension:

| space | count | examples |
| ----- | ----- | -------- |
| H^2 | infinitely many | all {p,q} with 1/p + 1/q < 1/2 |
| H^3 | 4 | {3,5,3}, {4,3,5}, {5,3,4}, {5,3,5} |
| H^4 | 5 | {3,3,3,5}, {4,3,3,5}, {5,3,3,3}, {5,3,3,4}, {5,3,3,5} |
| H^5 | 0 | none |
| H^6 and above | 0 | none |

These counts reproduce the known mathematical classification exactly. The four in H^3 are the
icosahedral honeycomb {3,5,3}, the order-5 cubic honeycomb {4,3,5}, the order-4 dodecahedral
honeycomb {5,3,4} (the dodecagrid the model uses, P45), and the order-5 dodecahedral honeycomb
{5,3,5}. The five in H^4 are {3,3,3,5}, {4,3,3,5}, {5,3,3,3}, {5,3,3,4}, and {5,3,3,5}. Compact
regular hyperbolic honeycombs exist only in dimensions 2, 3, and 4, and vanish at 5 and above.
Beyond dimension 4 one can still build paracompact honeycombs, whose cells reach out to ideal
vertices at infinity, but no finite-celled crystal exists.

## Why finite cells, when the mesh is endless

There is a subtlety worth stating plainly. The word compact here describes the CELLS, not the
whole tiling. A compact regular honeycomb tiles all of infinite hyperbolic space with infinitely
many cells, but each cell is a finite, closed polytope meeting only finitely many neighbors. So
two different kinds of infinity must be kept apart:

- **The extent of the mesh is unbounded.** The honeycomb fills all of H^n with endlessly many
  cells, and the model's mesh grows forever (P56). In extent it is effectively infinite.
- **Each cell is finite.** Every vibe has a finite, local neighborhood, a bounded number of
  notes (the committed model's degree is about ten). It is closed and small.

The model needs both at once, and that is exactly what a compact honeycomb provides: an
unbounded, ever-growing tiling made of finite, local cells. This is why we require the compact
(finite-celled) honeycombs and not the paracompact ones. A paracompact honeycomb has cells with
ideal vertices at infinity, which would mean a vibe with an unbounded, non-local neighborhood, a
single cell that never closes. That breaks the model's locality (every vibe relates to a finite
handful of neighbors, no action at a distance). So the requirement is not that the universe be
finite, it is that it be made of finite, local pieces while extending without bound. That
requirement is what forces the dimension into {2, 3, 4}, since above four there is no way to fill
hyperbolic space with finite local cells at all.

## Reading

The substrate is not bound to three dimensions by fiat, and it is not free to be any dimension
either. The construction is general, but requiring a real crystal with finite cells forces the
spatial dimension into the narrow window {2, 3, 4}. Above four, no compact regular hyperbolic
honeycomb exists, so a finite-celled crystal substrate cannot be built there. Three-dimensional
space (four-dimensional spacetime) sits inside this window.

This makes the model robust about dimension. Earlier work simply chose three dimensions to match
observation (P45, the dodecagrid {5,3,4}). P62 turns "why not an arbitrary n-dimensional
construction" into a computed constraint: the crystal only exists low, never high. Among the
three allowed dimensions, why three specifically (rather than two or four) is the remaining
dimension-selection question, which standard physics arguments bear on (stable gravitational
orbits and clean wave propagation favor three spatial dimensions), and which the growth-rule
dimension work (P38) aims to settle from inside the model.

## See also

`p45-dodecagrid.md` (the 3D crystal {5,3,4}), `p47-coxeter-unification.md` (the one machine
behind all of them), `p38-emergent-spatial-geometry.md` (deriving the dimension from growth), and
`note/roadmap.md`.
