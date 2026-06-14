# Findings 9, The Concepts You Need, a Primer

A compact primer of the mathematics behind the findings, geometry first, then algebra, then the recurring physics
terms. Each entry is a quick gloss and a mental image, enough that a smart non-specialist follows the rest without
stalling, not a textbook. Use these for the inline glosses in the paper.

## The geometry

- TILING and HONEYCOMB. A tiling fills a surface with repeated shapes (a bathroom floor). A honeycomb does the same
  in 3D or higher (cells packed with no gaps). The mesh is a 4D honeycomb.
- SCHLAFLI SYMBOL. A short code for a regular tiling, `{p, q}` means p-sided faces, q around each corner, and longer
  symbols `{p, q, r, ...}` extend it to higher dimensions. `{4, 4}` is the checkerboard, `{3, 4, 3, 4}` is the mesh.
- POLYTOPE, CELL, FACET, VERTEX FIGURE. A polytope is a shape with flat sides in any dimension (a polygon in 2D, a
  polyhedron in 3D, a 4-polytope in 4D). Its facets are the highest-dimensional faces (a polyhedron's facets are its
  polygons). The vertex figure is the small shape you see looking out from one corner. The mesh's docks are 24-cells,
  and the vertex figure of the whole mesh is the cubic honeycomb, ordinary 3D space.
- THE THREE CURVATURES and the ANGLE DEFECT. Space comes in three flavors, spherical (curves shut, like a ball's
  surface), flat (Euclidean, a tabletop), and hyperbolic (curves open, a saddle or a ruffled lettuce leaf). Which
  one a tiling lives in is fixed by the angle defect, whether the corners add up to less than, exactly, or more than
  a full turn, the sign of `(p-2)(q-2) - 4` for `{p, q}`.
- POINCARE DISK. The standard picture of hyperbolic space, an infinite world drawn inside a finite disk, where
  shapes shrink as they approach the rim so infinitely many fit, the way an Escher print tiles a circle.
- GEODESIC. The straightest possible path, a great-circle arc on a sphere, a straight line on a plane, a curving arc
  in the disk. Distances and entanglement laws are measured along geodesics.
- DUAL and SELF-DUAL. Swap a polytope's vertices for its faces and you get its dual (the cube and octahedron are
  duals). The 24-cell is its own dual, a rare self-symmetry that no other 4-polytope has.
- THE REGULAR 4-POLYTOPES. Four dimensions has six, including the 5-cell (the simplex), the tesseract (the
  hypercube), the 16-cell (the cross-polytope), and the 24-CELL, which is unique to 4D and has no analog in any other
  dimension.
- BULK, CUSP, HOROSPHERE, BOUNDARY. The bulk is the curved interior of the space. The boundary is its edge at
  infinity. A cusp is a point on that boundary where the space funnels, and a horosphere (a horocycle in 2D) is a
  limiting flat slice sitting at the cusp. In the mesh, the bulk is 4D and the cusp is a flat 3D horosphere, our
  ordinary space.
- SPECTRAL DIMENSION. The effective dimension a random walker feels (how fast it spreads), which can differ from the
  raw dimension. The mesh's cusp measures spectral dimension 3, its bulk about 4.
- LATTICE, SPHERE PACKING, KISSING NUMBER. A lattice is a regular grid of points. Sphere packing asks how densely
  equal balls fill space. The kissing number is how many balls can touch one central ball. In 4D the densest lattice
  is D4, with kissing number 24, the 24 directions of the dock.

## The algebra and symmetry

- SYMMETRY GROUP. The full set of moves (rotations, reflections) that leave a shape looking the same, with a size
  called its order. The dock's symmetry group is F4, order 1152.
- ROOT SYSTEM and D4. A root system is a highly symmetric set of vectors that builds a Lie symmetry, the spokes of
  the symmetry. D4 is the 4D root system whose 24 roots are exactly the dock's 24 directions, the vectors
  `(±1, ±1, 0, 0)`.
- COXETER DIAGRAM, COXETER and WEYL GROUPS. A Coxeter diagram is a tiny graph of dots and bonds that encodes a
  symmetry by reflections, and closing those reflections generates the Coxeter group (the Weyl group is the rotation
  part). The mesh's diagram is four dots bonded 3-4-3.
- QUATERNIONS, HURWITZ, 2T. Quaternions are four-dimensional numbers that multiply (an extension of the complex
  numbers used for 3D rotations). The Hurwitz quaternions are the whole-number ones, and their 24 units of size 1
  form the binary tetrahedral group 2T (order 24), which IS the 24-cell as a multiplication table.
- SPINOR, DOUBLE COVER, the BELT TRICK. A spinor is an object that needs a 720-degree turn, not 360, to come home,
  the electron's defining oddity (the belt or plate trick shows it physically). The double cover is the two-to-one
  wrapping that encodes this, `2pi = -1` and `4pi = +1`, and it sits exactly inside the finite group 2T.
- TRIALITY and `8v + 8s + 8c`. The symmetry SO(8) has a rare extra threefold symmetry, triality, that rotates its
  three 8-dimensional pieces, a vector `8v` and two spinors `8s` and `8c`. The dock's 24 directions split exactly
  this way, which is where bosons, fermions, and the count three come from.
- LIE GROUPS, REPRESENTATIONS, WEIGHTS. A Lie group is a continuous symmetry (rotations of a sphere), written in
  capitals (SO(10), SU(5), F4, E8). A representation is a way the symmetry acts on a space of states, and a weight is
  a state's label under it. Grand unification is the chain `D4 -> F4 -> E6 -> E7 -> E8` and the embedding into
  SO(10).
- OCTONIONS and the JORDAN ALGEBRA. Octonions are eight-dimensional numbers, the last and strangest number system
  (multiplication that does not even associate). The exceptional Jordan algebra J3(O) is the 3-by-3 octonion
  Hermitian matrices, dimension 27, forced to rank 3, the structure behind the three generations.
- BIJECTION, PERMUTATION, REVERSIBILITY. A bijection pairs every input with exactly one output, a permutation is a
  bijection on a finite set (a reshuffle), and a dynamics built from one is exactly reversible, you can run it
  backward and recover the start. The knit is a permutation, so the universe is reversible.

## Shape and topology

- TOPOLOGICAL WINDING and CHARGE. Winding counts how many times a field wraps around as you circle a structure, a
  whole number that no smooth change can alter (you cannot unwind a knotted loop without cutting). A topological
  charge is such a protected integer, the basis of a self's identity.
- HOMOTOPY and BETTI NUMBERS. Homotopy classifies shapes by which loops can be shrunk to a point, and Betti numbers
  count the independent holes (a donut has one). The spinor's zero modes equal the Betti sum, the field counts the
  holes.
- SOLITON, SKYRMION, DEFECT. A soliton is a self-reinforcing lump that holds its shape as it moves (a standing
  wave that does not spread). A Skyrmion is a soliton whose stability is topological (a protected twist in a
  direction field). A defect is a point where a field cannot be smoothed out (a cowlick in hair). The self's body is
  this kind of protected lump.

## The recurring physics and computing terms

- CELLULAR AUTOMATON and LATTICE GAS, COLLIDE-STREAM. A cellular automaton updates every cell by a local rule each
  step (Conway's Life). A lattice gas is one where tokens move and collide on a grid, updated as collide-then-stream,
  which is exactly the knit.
- DISPERSION `omega(k)` and the EXPONENT `z`. The dispersion relates a wave's frequency to its wavelength. A linear
  `omega = c k` is a massless relativistic particle (`z = 1`), a quadratic one is diffusive (`z = 2`), and which you
  get decides whether you have light or just spreading.
- LORENTZ INVARIANCE and the LIGHT CONE. Lorentz invariance is the symmetry of special relativity, no preferred
  frame and a universal speed limit, drawn as a light cone (the reachable region per unit time). On the mesh it is
  one dock per beat.
- POINCARE RECURRENCE. A finite reversible system eventually returns arbitrarily near its start, so a closed world
  only cycles and can hold no lasting self.
- RENORMALIZATION, COARSE-GRAINING, FIXED POINT. Coarse-graining blurs fine detail to see the larger pattern
  (squinting at a photo). Renormalization tracks how the rule changes as you do this, and a fixed point is where it
  stops changing, the reason physics looks consistent across scales.
- CASIMIR EFFECT. Two plates in a fluctuating vacuum are pushed together because the vacuum is thinner between them,
  a shadow-pressure attraction, which is how a self binds.
- HOLOGRAPHY, AdS-CFT, RYU-TAKAYANAGI, ERROR-CORRECTING CODE. Holography says a region's full content lives on its
  boundary. AdS-CFT is the known example, Ryu-Takayanagi gives the entanglement as a boundary geodesic, and the
  bulk-boundary map behaves as a quantum error-correcting code (redundant storage that survives damage).
- GAUGE FIELD, WILSON LOOP, AHARONOV-BOHM. A gauge field is a force field with a local redundancy of description
  (electromagnetism). A Wilson loop measures the flux it encloses, and the Aharonov-Bohm effect is a charge feeling
  that flux even where the field is zero.
- DIRAC OPERATOR, CLIFFORD ALGEBRA, CHIRALITY, FERMION DOUBLING. The Dirac operator governs a relativistic
  electron, built on a Clifford algebra (gamma matrices whose squares give the metric). Chirality is a particle's
  handedness, and fermion doubling is the lattice curse of getting unwanted extra copies, which the mesh avoids.
- BELL, CHSH, TSIRELSON. Bell tests measure correlations that no local-hidden-variable theory can fake, scored by
  the CHSH number, capped classically at 2 and quantum-mechanically at the Tsirelson bound `2 sqrt 2`, which the mesh
  reaches.
- BORN RULE. The quantum rule that a state's probability is its amplitude SQUARED, the one probabilistic axiom, here
  forced by additivity.
- MARKOV BLANKET. The boundary that statistically screens a thing's inside from its outside, the formal mark of an
  individual, which a self satisfies.
- INTEGRATED INFORMATION. A measure of how much a whole is more than its parts (irreducible cause-effect structure),
  proposed as a correlate of consciousness, high for a self and near zero for a random bag.
- SAKHAROV CONDITIONS. The three requirements for a universe to end up with more matter than antimatter, all three
  found necessary in the model's baryogenesis.

## Where to look

These concepts are exercised throughout, the geometry in `findings-1.md`, the algebra and spin in `findings-1.md` and
`findings-4.md`, the topology and selves in `findings-3.md`, and the physics terms in `findings-4.md` and
`findings-5.md`. The substrate comparison that motivates the geometry choices is `findings-8.md`.