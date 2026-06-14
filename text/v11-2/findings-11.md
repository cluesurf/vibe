# Findings 11, The Reflection Machinery and the Bulk-to-Cusp

How the whole infinite mesh is generated, addressed, and sliced into our flat 3D world, all from reflections in the
walls of one chamber. This is the engine behind growth, addressing, and the cusp, and it is grounded in the studied
mathematics of cusped hyperbolic manifolds. Companion to `findings.md`. Cite `\cite{pollard2026vibetest}`, with
Margenstern for the addressing and the Ratcliffe-Tschantz census for the cusp grounding.

## The mesh is a reflection group

The honeycomb is a Coxeter group, generated entirely by REFLECTIONS in the walls of a single fundamental chamber.
Reflect that chamber across each wall to reach its neighbors, reflect those across theirs, and the orbit fills all of
space. Every large structure in the crystal is built by COMPOSING reflections, and the master principle is that a
product of reflections is classified by how its mirrors meet, and that classification picks the structure. An even
number of reflections preserves orientation (rotations, translations), an odd number reverses it (reflections,
glides). Why it matters, the entire mesh, infinite and intricate, is the deterministic output of a few mirrors, so
its generation needs no stored map and no design beyond the chamber.

## The three engines of growth

Two mirrors meet in exactly three ways, and each builds a different structure, the geometric vocabulary of the whole
crystal.

| two mirrors | compose to | builds | example |
| --- | --- | --- | --- |
| CROSSING (at angle pi/m) | a ROTATION by 2pi/m (finite order m) | a rosette or rotational column, m copies around an axis | gears, n-fold petals |
| ULTRAPARALLEL (share a perpendicular) | a TRANSLATION along that geodesic (infinite order) | a geodesic line of docks, a long thin tube | a quasi-1D wire, the spine of a tube |
| ASYMPTOTIC (meet only at infinity) | a PARABOLIC, a limit rotation about a boundary point | a horocycle in 2D, a HOROSPHERE in 3D, intrinsically FLAT | the flat Euclidean sheet where physics lives |

Higher products give mixed motions, a glide (reflection plus translation) builds a staggered strip (where staggered
fermions naturally live), and a screw (rotation plus translation along the axis) builds a helix, the natural way to
make a handed, twisting structure like a double helix. The cleanest way to see it is by the fixed points on the
boundary at infinity, two boundary fixed points give a LINE, one gives a FLAT SHEET, an interior axis gives a
ROTATION. Why it matters, the kind of structure (a wire, a flat sheet, a spiral) is selected purely by how its
mirrors meet, so the substrate has a finite grammar of buildable forms.

## The flat layer, our space is a horosphere

The parabolic engine is the important one. A horosphere, the surface a parabolic motion sweeps, is intrinsically FLAT
(Euclidean) even though it sits inside curved hyperbolic space. So the flat space where Lorentz invariance and the
relativistic field theory should live is a HOROSPHERICAL slice of the curved bulk. In the committed `{3,4,3,4}` this
slice is exact, the cusp cross-section is the cubic honeycomb `{4,3,4}`, ordinary 3D space. In a cocompact crystal
like `{5,3,4}` (whose cells are finite, so it has no true cusp) the flat sheet is extracted instead as a Busemann
level set and verified flat (effective dimension about 2 there), with a periodic flat lattice recovered by
coarse-graining the aperiodic cells on it. Why it matters, the flatness of our 3D world is not assumed, it is the
intrinsic geometry of a horosphere in the 4D crystal, the one slice that is Euclidean.

## Grounded in real mathematics, cusped hyperbolic 4-manifolds

The bulk-to-cusp claim is a studied theorem, not invented language. For an n-dimensional finite-volume hyperbolic
manifold, each cusp cross-section is a flat (n-1)-manifold, exactly one dimension lower and Euclidean.

| bulk | cusp cross-section |
| --- | --- |
| hyperbolic 3-manifold | a flat 2D torus (the standard knot-complement picture) |
| hyperbolic 4-manifold | a compact flat 3-manifold (our case) |
| hyperbolic 5-manifold | a compact flat 4-manifold |

And the connection to the substrate is direct, the famous Ratcliffe-Tschantz census of minimal-volume cusped
arithmetic hyperbolic 4-manifolds contains 1171 examples built by face-pairings of the IDEAL 24-CELL, the same object
the `{3,4,3,4}` substrate is built from. There are exactly six orientable compact flat 3-manifolds that occur as
such cusp cross-sections. Why it matters, the project's central geometric claim, a 4D hyperbolic bulk with a flat 3D
cusp built from 24-cells, is precisely the setting of an established research area, so the substrate sits inside
known geometric topology rather than beside it.

## Exact addressing, a chamber is a word

The crystal is generated and addressed by the Coxeter WORD PROBLEM, exactly and coordinate-free. A coordinate engine
that names each chamber by its rounded position works to moderate depth but eventually fails, in hyperbolic space the
cells crowd exponentially near the boundary (distinct cells round to the same key) and floating-point error
accumulates over long reflection paths. The exact replacement names each chamber by a WORD in the reflection
generators (like `s_2 s_0 s_1 s_2`) and dedupes by its NORMAL FORM. The standard normal form is ShortLex, the
shortest word with ties broken lexicographically, one per chamber.

Two facts make this work. Tits' theorem, two reduced words name the same chamber exactly when one reaches the other
by BRAID MOVES alone (swapping an alternating run `s_i s_j s_i ... -> s_j s_i s_j ...`), and any word shortens to a
reduced one by cancellation (`s_i s_i` deletes), so word equality is decidable in finite steps. And Brink-Howlett,
every Coxeter group is AUTOMATIC, the set of normal-form words is a regular language recognized by a finite-state
machine (the canonical automaton), so a finite machine enumerates the infinite crystal exactly, one word per
chamber, with no dedup, no floats, and no crowding. Neighbors are found by appending a generator and re-normalizing.
This generalizes the Fibonacci / Zeckendorf addressing used in 2D to EVERY crystal, including the 3D and 4D cases
where a hand-built Fibonacci scheme does not directly apply. The implemented word engine enumerates finite Coxeter
groups to their exact order (A2 = 6, B2 = 8, I2(7) = 14, A3 = 24, B3 = 48, H3 = 120) and gives the exact facet counts
of the crystals (heptagrid 7, pentagrid 5, dodecagrid 12), coordinate-free. Why it matters, an infinite universe is
enumerated, addressed, and routed EXACTLY by a finite machine on integer words, reproducible bit-for-bit, which is
what makes the substrate computable, navigable, and trustworthy at any depth.

## The two engines, when to use which

The coordinate engine (rounded Poincare positions) is for building and DRAWING the crystal to moderate depth where
you want positions to visualize, fast and correct to a few thousand cells. The word engine (ShortLex normal forms)
is for EXACT combinatorics, deep generations, large scale, routing, and reproducibility, slower to set up but exact
and unbounded. They are complementary, the picture from coordinates, the exact deep structure from words. Why it
matters, the theory has both a way to see the crystal and a way to compute it exactly, and the exact one scales
without limit.

## Where to look (code and experiments)

- The reflection generation and the three engines: `code/substrate/coxeter/engine.ts` (the coordinate engine),
  and the structure notes `theory-v0.7.0/notes/.../coxeter-reflection-structures.md`,
  `how-reflection-generates-the-mesh.md`.
- The flat horospherical layer: the horosphere builder and the cusp-is-cubic result,
  `theory-v0.7.0/notes/.../why-the-cusp-is-cubic.md`, `asymptotic-euclidean-on-horospheres.md`.
- The cusp grounding: `theory-v0.7.0/notes/.../cusped-hyperbolic-manifolds.md` (the Ratcliffe-Tschantz census, the
  flat-(n-1)-cusp theorem).
- The exact word engine: `code/substrate/coxeter/word.ts` (experiment P87), with the word-problem write-up
  `theory-v0.7.0/notes/.../coxeter-word-problem.md`, and the Fibonacci-addressing tie in `addressing/*`.