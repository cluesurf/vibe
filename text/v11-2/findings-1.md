# Findings 1, The Mathematics and Geometry

The structural spine. Every geometric and algebraic fact the theory rests on, with the math behind it and why each
matters. Companion to `findings.md` (the per-experiment ledger), here the emphasis is the structure itself. Cite
`\cite{pollard2026vibetest}` on computed claims. Terminology, a dock is one cell of the honeycomb, its 24 directions
are sites, the law is the knit, a vibe IS the experience and its tone is the quality of that experience.

## Curvature and the angle defect

A regular tessellation has a Schläfli symbol, a short list like `{p,q}` or `{p,q,r}` giving how many edges meet a
face and how faces meet around an edge. One number decides everything, the angle defect. For `{p,q}` the sign of
`(p-2)(q-2) - 4` selects the geometry, negative is spherical (curves shut, a closed ball), zero is Euclidean (flat),
positive is hyperbolic (curves open, infinite branching room). This is a theorem, not a survey, three curvatures and
no fourth. Spherical space holds only the 5 Platonic solids, Euclidean only 3 regular tilings, hyperbolic infinitely
many. Why it matters, the model's whole arena is fixed by a single inequality, and the hyperbolic side is the only
one with room to grow exponentially, which is what later gives holography.

## Why hyperbolic, the exponential reach

In flat space a ball of radius `n` holds about `n^d` docks, the surface a vanishing fraction. In hyperbolic space the
count grows EXPONENTIALLY in `n`, so almost every dock is on the rim, the boundary is comparable to the whole. That
single fact is the seed of three later results, branching room for an unbounded navigable tree, a boundary that
encodes the bulk (holography), and a tiny graph diameter (any two docks joined in `O(log n)` hops). Flat space has
none of these. Why it matters, the geometry is not decoration, it is what makes memory, navigation, and holography
possible at all.

## Dimensions, why four is the ceiling

Compact regular hyperbolic honeycombs exist only in dimensions 2, 3, and 4. H2 has infinitely many, H3 has 4, H4 has
5, and H5 and above have NONE. Four is the top floor. The regular polytope count tells the same story, the plane has
infinitely many regular polygons, 3D has 5 (the Platonic solids), 4D has 6, and every dimension from 5 up has only 3
(simplex, hypercube, cross-polytope). The 24-cell, a regular 4-polytope with 24 octahedral facets, is UNIQUE to four
dimensions, it has no analog above or below. Why it matters, the substrate sits in the one dimension rich enough to
hold the 24-cell and high enough to top out the honeycomb ladder, this is not tuned, it is forced by counting.

## The committed substrate, {3,4,3,4}

The mesh is the `{3,4,3,4}` honeycomb in 4D hyperbolic space, growing, one of the five compact H4 honeycombs. Its
docks are 24-cells, each meeting 24 neighbors across its 24 octahedral facets. Its vertex figure, the shape seen
looking out from a corner, is the `{4,3,4}` cubic honeycomb, which is ordinary 3D space. So the flat 3D world we live
in is literally the cross-section of the 4D crystal at its boundary. The interior is the bulk (4D), the boundary is
the cusp (a flat 3D horosphere, a limiting flat slice at an ideal point). The cusp's spectral dimension measures to
3, the bulk's to about 4. The fourth bulk direction reads as time, growth proceeds along it. Why it matters, 3+1
spacetime is not assumed, it is the bulk-and-cusp split of one 4D crystal, with space the flat cusp and time the
growth axis.

## The dock, the 24-cell, four faces of one object

The 24 sites of a dock are the SAME 24 points written four ways, and the coincidence is the heart of the theory.

- As VECTORS, the 24 are the D4 root system, every `(±1, ±1, 0, 0)` and its coordinate permutations.
- As a SHELL of the tone, the 24 are exactly the squared-length-2 layer of `{-1, 0, +1}^4`, the four-tone direction
  space. The shells of four tones ARE the regular 4-polytopes, length 1 is the 16-cell (8 points), length 2 is the
  24-CELL (24), length 3 a 32-point figure, length 4 the tesseract (16). The 24 sites emerge from the tone itself.
- As QUATERNIONS, the 24 are the unit Hurwitz quaternions, the integer quaternions of norm 1, which form the binary
  tetrahedral group 2T of order 24.
- As a PACKING, the 24 are the kissing directions of D4, the densest lattice in 4D, each sphere touching 24 others.

Four independent constructions, one 24-cell. The 24-cell is also SELF-DUAL, its own dual polytope, a symmetry no
other nontrivial 4-polytope has. Why it matters, the dock is not an arbitrary 24-fold object, it is a convergence
point that vectors, tones, quaternions, and sphere-packing all force, so the geometry is close to inevitable.

## Spin from a finite group, the double cover

Because the 24 sites form the group 2T, spin-half lives in a finite multiplication table with no continuum. A 2pi
turn maps to `-1` and a 4pi turn back to `+1`, exactly, the genuine non-split 2-to-1 double cover, confirmed in 2T
(the 24-cell), in 2I (the icosian group, order 120 over 60), and in SL(2,7) (order 336 over 168). The spinor overlap
runs as `cos(theta/2)` with period 4pi, the vector overlap as `cos(theta)` with period 2pi. Why it matters, the
electron's defining oddity, that you must turn it twice to bring it home, sits inside a 24-row table, no real numbers
required, the single hardest thing to put on a lattice.

## The symmetry tower and triality

The dock's symmetries nest, 2T (order 24, the sites as a group) sits inside the Weyl group W(D4) (order 192, the
reflections) inside F4 (order 1152, the full automorphisms). The arithmetic is exact, `1152 = 192 x 6`, and the
extra factor of 6 is the symmetric group S3, the TRIALITY of D4, its outer automorphism that rotates the three
8-dimensional representations into each other. The base symmetry is FINITE, order 1152, the continuous groups of
physics appear only as an emergent limit, F4 anisotropy measured at 0.03 in the ultraviolet relaxes below 0.02 in the
infrared, SO(4) restored. Why it matters, the symmetry that becomes relativity is a finite object you could print on
a page, and triality, that rare factor of 6, is exactly the threefold structure physics needs for three families of
matter.

## The triality split, bosons, fermions, and the count three

Under triality the 24 sites split as `8v + 8s + 8c`, a vector octet and two spinor octets. Under a 2pi rotation the
8v returns to `+1` (a boson) and the 8s and 8c go to `-1` (fermions). So the two kinds of matter, force-carriers and
matter-particles, are just the triality pieces of the 24 directions. The threefold symmetry also points at three
GENERATIONS of matter, the D4 long roots are the 24 roots of F4, and the exceptional Jordan algebra J3(O) (3-by-3
Hermitian octonion matrices, dimension 27) is forced to rank 3, with an exact S3 permuting its three primitive
slots. Honesty, the COUNT three is forced by the geometry, but the three slots come out DEGENERATE (same trace, rank,
and norm), so splitting them into three different masses is unproven, this is Boyle's conjecture and the program's
boldest open bet. The naive reading is a vector plus two chiralities of ONE generation. Why it matters, the number
three, the most stubborn fact of the particle zoo, is structurally present, and where it comes from is the cleanest
open question in the theory.

## The exceptional chain and the golden polytopes

The dock's algebra sits at the foot of the exceptional Lie chain, `D4 -> F4 -> E6 -> E7 -> E8`, the ladder that
unifies the largest symmetries known. Alongside it, the 600-cell and 120-cell (the golden 4-polytopes, built on the
golden ratio) carry the icosian group 2I, the finer double cover. Why it matters, the substrate is not an isolated
toy, it is the seed of the richest symmetry structures in mathematics, which is where grand unification later comes
from for free.

## Tessellations, what is general and what is special

A single battery ran across the whole catalog, 45 regular hyperbolic tessellations cataloged, 42 buildable by the
engine. The result is a clean two-tier picture. MATTER is generic, the Kahler-Dirac fermion (forms under the
operator `d + delta`, the simplest way to put spin on any lattice) propagates on ALL 42. Clean SPIN is rare, the
native 24-cell / D4 spinor structure appears on only 7 of the 42, the [3,4,3]-faceted ones (`{3,4,3,4}`, `{4,3,4,3}`, and
five 5D pentacombs). The committed `{3,4,3,4}` is FLAT (zero Ricci curvature, polynomial growth at the cusp), so it
trades curvature for spin. Its cousin the 5D pentacomb `{3,4,3,3,4}` carries BOTH the 24-cell substructure and
curvature (Lorentzian Gram matrix, growth ratio 1.55), resolving the spin-versus-curvature trade that no 4D
substrate can. Why it matters, the framework is substrate-general (matter rides anywhere), the special physics is
substrate-specific (clean spin needs the 24-cell), and the model is anti-anthropic, the substrate is picked by
mathematics, not tuned for observers.

## Growth, the layer-by-layer counts

Counting docks ring by ring (verified to two million docks) gives a clean signature of the curvature.

| honeycomb | per-ring dock counts | growth rate | recurrence |
| --- | --- | --- | --- |
| `{7,3}` (2D) | 1, 7, 21, 56, 147, 385, 1008, 2639 | about 2.62 | `a(n) = 3 a(n-1) - a(n-2)` |
| `{5,3,4}` (3D) | 1, 12, 102, 812, 6402, 50412, 396902, 3124812 | about 7.87 | `a(n) = 9 a(n-1) - 9 a(n-2) + a(n-3)` |
| `{3,4,3,4}` (4D) | 1, 24, 456, 8376, ... | about 18.28 (Perron) | closed form OPEN |

The rate is the dominant root (the Perron eigenvalue) of the recurrence, and it grows with dimension, the deeper the
bulk the faster the branching. The `{7,3}` rate ties to the golden ratio through its lower faces. The `{3,4,3,4}`
closed-form recurrence is a genuine open problem, the rate is measured cleanly but not yet derived. Why it matters,
exponential growth is the engine of every later capability, and the per-ring counts are the fingerprint that tells
the curvature at a glance.

## Addressing and navigation, an infinite space with no map

Every dock gets a unique address in `O(log n)` symbols, decode-invertible, with no two cousins on the same ring
sharing one. On `{3,4,3,4}` this is D4-coordinate addressing through a deterministic K=2 confluence transducer (a
small finite-state machine that resolves which child is which), reconstructing neighbors to better than 99 percent at
30k and 80k docks. On `{7,3}` and `{5,3,4}` it is Margenstern's Fibonacci tree-addressing in child-ordinal ShortLex
digits (least-significant-first ordering of which-child-at-each-step). Greedy routing, always step to the neighbor
nearest the target, delivers 100 percent on `{7,3}` at stretch under 3, over 90 percent on `{5,3,4}` at stretch
under 2, and on `{3,4,3,4}` at stretch 1.004 verified to two million docks. The neighbor graph is generated on
demand from the address formula alone, byte-for-byte identical to the stored graph at billion scale, no adjacency
list kept. The modular group PSL(2,Z) addresses by continued fractions, its Fibonacci convergents hitting the golden
ratio to better than 1e-4. Why it matters, an infinite universe is fully navigable with no stored map, addresses are
short, routing is near-perfect, and the whole adjacency structure is a formula, which is what makes the geometry
usable as a computer and a memory.

## The geometric facts that carry the rest

Three results to hold in mind, because everything downstream leans on them. The 24-cell is the convergence of
vectors, tones, quaternions, and packing, so the dock is forced not chosen. The 2T double cover puts spin-half in a
finite table, so fermions need no continuum. Hyperbolic exponential growth gives branching room, a tiny diameter,
and a boundary that holds the bulk, so memory, navigation, and holography all follow from one curvature sign. The
geometry is the argument.

## Where to look (code and experiments)

For the reader who wants the source. Experiment ids are `category/name` under `deck/vibe/test/experiment/`, code
modules under `deck/vibe/code/`.

- Curvature, dimensions, polytopes, the geometry theorems: `geometry/geometries`, `geometry/dimensions`,
  `geometry/polytopes`, `geometry/symmetries`.
- The substrate selection and the 45/42/7 battery, the pentacomb: `substrate-survey/*` (the full catalog),
  `geometry/tessellations`.
- The 24-cell, D4 roots, 2T, F4, triality, the double cover: `foundations/coin-algebra`,
  `spin/spinor-triality`, `spin/sp1-spin-double-cover`, `spin/rotation-2pi`, and the algebra in
  `code/algebra/group/root-system.ts`, `code/algebra/octonion.ts`, `code/algebra/jordan.ts`.
- The mesh, the 24 directions and their opposite map, the D4 coordinate: `code/tool/mesh.ts` (`d4Mesh`, `rootsD4`).
- The four-trit shells equal the 4-polytopes: `theory-v0.7.0/paper/the-geometry-of-the-direction-field.md`.
- Growth counts and rates: `code/substrate/*`, the growth battery (verified to 2M docks).
- Addressing and routing: `addressing/addressing-3434`, `code/substrate/coxeter/addressing-3434`, plus
  `addressing/*` and the word-engine / lazy-neighbors checks.
