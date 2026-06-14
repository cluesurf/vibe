# Findings 8, The Geometry Ladder and the Substrate Comparison

Why hyperbolic, why four dimensions, and why `{3,4,3,4}` in particular, told by walking the whole ladder from a flat
checkerboard up to the 5D pentacomb. The comparison IS the argument, a single experiment battery ran across every
buildable tessellation, and the pattern it found is the case for the substrate. Companion to `findings.md`. Cite
`\cite{pollard2026vibetest}`, with Margenstern for hyperbolic cellular automata and Ryu-Takayanagi for the
holography control.

## The ladder at a glance

| substrate | curvature | dim | degree | growth of a ball | the familiar picture |
| --- | --- | --- | --- | --- | --- |
| checkerboard `{4,4}` | flat | 2 | 4 | `~ r^2` (polynomial) | a chessboard, Conway's Game of Life |
| hexagonal `{6,3}` | flat | 2 | 6 (or 3) | `~ r^2` | a honeycomb, the FHP fluid lattice |
| soccerball | spherical | 2 | 3 | bounded, then CLOSES | a buckyball, 12 pentagons and 20 hexagons |
| `{7,3}` heptagrid | hyperbolic | 2 | 7 | `~ 2.62^r` | a Poincare-disk tiling, ever-finer to the rim |
| `{5,3,4}` dodecagrid | hyperbolic | 3 | 12 | `~ 7.87^r` | dodecahedral cells filling curved 3D |
| `{3,4,3,4}` | hyperbolic | 4 | 24 | `~ 18.28^r` | 24-cells filling curved 4D, with a flat 3D cusp |
| `{3,4,3,3,4}` pentacomb | hyperbolic | 5 | richer | `~ 1.55^r` ring ratio | the 5D cousin carrying both spin and curvature |

The whole point of the table is the third column from the right, ball growth, which is polynomial on the flat and
spherical rows and EXPONENTIAL on every hyperbolic row, and that single difference decides everything downstream.

## Why flat is no good, the checkerboard and the honeycomb

A flat lattice is where computation already lives. Conway's Game of Life runs on the checkerboard and is universal,
the model reproduces it on the cusp, so flat space can compute. But flat space gives nothing extra and fails the
physics. Its ball grows only as `r^2`, so the surface is a vanishing fraction of the volume, there is no branching
room for an unbounded navigable tree, no boundary that encodes the bulk (no holography), and no tiny diameter. It is
ANISOTROPIC, a square lattice has preferred axes, so it FAILS the Lorentz test (4th-moment anisotropy above 0.6, and
the model's flat control is EXCLUDED by the gamma-ray-burst bound that the hyperbolic substrate passes). There is a
flat-space precedent for the lesson, the square lattice gas (HPP) gives anisotropic fluid flow while the hexagonal
lattice gas (FHP) recovers isotropic hydrodynamics, geometry already decides isotropy in 2D, and the hyperbolic
substrate is what does it in 4D. On the flat layer a self even reproduces by FISSION (thin necks exist), where the
curved bulk suppresses it. Why it matters, flat space can compute but cannot host relativity, holography, or the
branching memory the theory needs, so it is ruled out for the substrate while remaining the right home for dense
arrays and the flat cusp.

## Why spherical is no good, the soccerball

A spherical tiling, the soccerball (the truncated icosahedron, 12 pentagons and 20 hexagons, the buckyball C60) being
the familiar one, curves SHUT. It is finite and closed, a ball of growing radius runs out of space and wraps back on
itself. A finite, closed, reversible system suffers Poincare recurrence, the state returns arbitrarily near its
start, so no pattern can settle and NO SELF can form (the same churn the closed-torus control shows). There is no
room to grow, no open edge to act as a bath, no arrow. Why it matters, spherical space forbids the one thing the
theory most needs, an open growing world that can hold a self, so it is ruled out at the root.

## Why hyperbolic was chosen

Hyperbolic space is the only one of the three curvatures that grows EXPONENTIALLY, and that one property delivers the
whole wishlist at once. Branching room for an unbounded tree of knowledge. A boundary comparable to the bulk, which
is holography. A graph diameter of `O(log n)`, so any two docks are a few hops apart. And Lorentz safety, EVERY
hyperbolic substrate tested keeps the anisotropy under 0.1 (`{7,3}`, `{5,4}`, `{6,4}`, `{8,4}`, `{8,3}`, `{9,3}`, and
even random Poisson, Halton, and sunflower sprinkles), while the flat lattice fails above 0.6. Hyperbolic geometry,
not fine-tuning, is what makes relativity possible. Why it matters, the choice of curvature is forced by what the
theory must support, and only the negatively curved side supports it.

## The hyperbolic line, dock by dock

`{7,3}`, the 2D heptagrid (degree 7). The cleanest teaching case and the cleanest holography testbed. Growth is the
near-golden rate 2.62 with the Fibonacci recurrence `a(n) = 3 a(n-1) - a(n-2)`, and addressing is Margenstern's
Fibonacci tree (Zeckendorf strings in the classic presentation, child-ordinal digits in implementation), with
greedy routing delivering 100 percent at low stretch. It carries the Ryu-Takayanagi entanglement law, entropy
following the geodesic LOG of the interval, where the flat `{6,3}` control gives a linear law that fails, the strong
form of a holography test. But it is non-crystallographic with no spinor, and its cusp is a 1D horocycle, so its
physical space is 1D and its gravity is linear. Why it matters, `{7,3}` shows the framework and holography in their
simplest form, and is the control that proves the holographic law is real.

`{5,3,4}`, the 3D dodecagrid (12 icosahedral directions). The framework ports cleanly, the rule, exact conservation,
reversibility, the `z = 1` light cone, Bethe-lattice `1/r^2` gravity, the HaPPY holographic code, de Sitter
cosmology, and the radial-tree hierarchy all run. But it FAILS the matter physics, decisively, and that failure is
the control that singles out `{3,4,3,4}`. Its 12 directions split as `1 + 3 + 3' + 5` with NO spinor (they are
golden-ratio, non-crystallographic), so no fermions. The 12 are not a root system, so no SO(8) or SO(10) gauge. Its
cusp is a 2D horosphere, so gravity there is logarithmic, not `1/r`. Why it matters, `{5,3,4}` proves the framework
is substrate-general while showing exactly what a substrate needs for matter, the things it lacks.

`{3,4,3,4}`, the committed 4D substrate. It is the one that has all three properties the others lack at once. It is
CRYSTALLOGRAPHIC (integer D4 coordinates), so it has clean addressing and a root system. It is SPINOR-CARRYING (its
24 directions are the D4 roots, the group 2T, with `2pi = -1`), so it holds electrons. And its cusp is the FLAT 3D
cubic honeycomb `{4,3,4}`, ordinary 3D space, so gravity is `1/r` and spacetime is `3+1`. Its docks are 24-cells, its
growth rate is 18.28. The cost is that it is FLAT (zero Ricci, polynomial cusp growth), so it trades bulk curvature
for spin, and it cannot carry full holographic curvature in the way `{5,3,4}` does. Why it matters, `{3,4,3,4}` is
the unique 4D substrate that carries spin AND a flat 3D world AND a root system, which is the thesis, the matter
physics is `{3,4,3,4}`-specific even though the framework is general.

`{3,4,3,3,4}`, the 5D pentacomb. The honest richer cousin. It contains the `[3,4,3]` 24-cell substructure, so it
carries the `8s` and `8c` spinors and the fermion propagates, AND it is genuinely curved (a Lorentzian Gram matrix,
ring growth ratio 1.55). So it resolves the spin-versus-curvature trade that no 4D substrate can, the one cousin with
both at once. Why it matters, it shows the trade-off `{3,4,3,4}` makes is not a wall, a 5D substrate has both, which
keeps the door open to holography with spin.

## The cross-tessellation battery, the pattern that is the argument

One experiment battery ran across the whole catalog, 45 regular hyperbolic tessellations cataloged, 42 buildable. The
result splits cleanly into general and special. MATTER is general, the Kahler-Dirac fermion (the `d + delta`
construction, the most robust way to put spin on any lattice) propagates on ALL 42. Clean SPIN is special, the native
24-cell / D4 spinor structure appears on only 7 of the 42, the `[3,4,3]`-faceted ones, namely `{3,4,3,4}`, `{4,3,4,3}`,
and five 5D pentacombs. Lorentz safety is general across the hyperbolic rows (anisotropy under 0.1) and absent on the
flat ones (above 0.6). Symmetry restoration holds, F4 anisotropy relaxing from 0.03 in the ultraviolet to under 0.02
in the infrared with SO(4) restored. Why it matters, the battery is the decisive evidence, the framework is
substrate-general (the rule, conservation, reversibility, the light cone, holography, gravity, cosmology, and matter
all port), while the clean spin that lets the standard model live is rare and specific to the 24-cell substrates, so
the substrate is selected by mathematics, not tuned for observers.

## The one-line reading of the ladder

Flat space can compute but gives no relativity, no holography, no branching memory, and lets selves fission.
Spherical space closes and recurs, so it cannot hold a self at all. Hyperbolic space grows exponentially, which buys
relativity, holography, a tiny diameter, and branching memory in one stroke, and among the hyperbolic substrates
`{3,4,3,4}` is the unique 4D one that also carries spin and a flat 3D world, with the 5D pentacomb as the cousin that
adds curvature back. The comparison is the argument.

## Where to look (code and experiments)

- The full catalog and the battery: `substrate-survey/*` (the 45-cataloged, 42-buildable sweep, fermion on all 42,
  spinor on 7), `geometry/tessellations`, `geometry/dimensions`, `geometry/geometries`.
- Flat and spherical contrasts and Lorentz safety: `relativity/lorentz-violation` (flat fails, sprinklings safe),
  `relativity/isotropy-24dir`, `selves/fission-flat-layer` (fission on flat, suppressed in bulk).
- `{7,3}`: `holography/ryu-takayanagi-73` (log law vs flat `{6,3}` control), `computation/computation-73`,
  `addressing/*` (Fibonacci tree-addressing), `gravity/s73-physics`.
- `{5,3,4}`: `spin/spinor-triality` (the `1+3+3'+5` no-spinor split), `holography/happy-code-534`,
  `holography/holographic-code-534`, `gravity/braneworld`, `computation/reversible-universality` (the comparative
  case).
- `{3,4,3,4}` and the pentacomb: `spin/spinor-triality` (the `8v+8s+8c` split), `relativity/symmetry-restoration-3434`,
  and the pentacomb entries in `substrate-survey/*`. Summary in
  `theory-v0.7.0/paper/final-specification/02-the-mesh-and-the-coin.md` and the substrate comparison notes.