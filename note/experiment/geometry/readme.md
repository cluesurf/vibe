# Geometry arena

37 experiments. Codes **[`E-GMT-0001`](../../../test/experiment/geometry/4d-auto-selection.ts)** through **[`E-GMT-0037`](../../../test/experiment/geometry/repeated-loop-drift.ts)**.

## What this arena tests

The geometry arena tests the **substrate itself**. Not the dynamics on it, but the shape of the stage. Vibe commits to one geometry: the hyperbolic honeycomb **{3,4,3,4}** with a 24-direction **D4** coin. This arena asks whether that choice is forced, what exceptional structure it carries, and how it behaves as a space.

The thesis is **everything geometric, no arbitrary constants**. Numbers should fall out of the geometry, not be tuned. So the experiments probe:

- **The dimension window.** Compact hyperbolic crystals exist only in 2, 3, and 4 dimensions. That window is why space is low-dimensional.
- **The exceptional spine.** The 24-cell, its **F4** symmetry of order 1152, the **D4** root system, triality, and how they sit inside the coin.
- **Hyperbolic tessellation.** Coxeter groups, Schlafli symbols, shell growth, horospheres, curvature, and Lorentz-safety.
- **The bulk warp factor.** A single algebraic number (about 18.278) that falls out of the exact shell counts and pins a scale hierarchy with no free parameter.
- **Curvature as a physical fact.** Geodesic divergence, holonomy, and angle deficit measured on the substrate, always against a flat control.

Every deep claim carries a **control** (usually a flat cubic lattice or a degree-preserving scramble) so that a curvature effect is never confused with a lattice artifact. Everything is deterministic.

## Sub-themes

### 1. Dimensional selection and emergent dimension

Why the substrate is 3+1 dimensional, and whether the recovered dimension is stable.

- **[`E-GMT-0009`](../../../test/experiment/geometry/dimension-window.ts)** - compact hyperbolic crystals with finite cells exist only in dimensions 2, 3, 4, none at 5 and above, so finite cells force low dimension.
- **[`E-GMT-0001`](../../../test/experiment/geometry/4d-auto-selection.ts)** - {5,3,4} stays forced in 3D by the bare ternary principle. {3,4,3,4} is the unique clean ideal cubic-cusp H4 candidate but is not forced by that same principle.
- **[`E-GMT-0025`](../../../test/experiment/geometry/why-3plus1.ts)** - the {4,3,4} cusp reads spectral dimension near 3, so spacetime is 3 space plus 1 beat.
- **[`E-GMT-0007`](../../../test/experiment/geometry/cusp-convergence.ts)** - a finite cubic cusp chunk becomes continuum-like (dimension 3, settled) within a few dozen cells.
- **[`E-GMT-0011`](../../../test/experiment/geometry/emergent-dimension.ts)** - emergent dimension is unbiased on flat grids (reads 2, 3, 4 as built) and exponential on curved meshes.
- **[`E-GMT-0016`](../../../test/experiment/geometry/hauptvermutung.ts)** - the recovered dimension is stable near 3 with low spread across random sprinklings (a Hauptvermutung-style invariance).
- **[`E-GMT-0008`](../../../test/experiment/geometry/dimension.ts)** - a 2D smeared path integral stays on near-2-dimensional causal orders.

### 2. The 24-cell, D4, and F4 exceptional spine

The exceptional algebra carried by the 24-direction coin, and what it looks like from inside.

- **[`E-GMT-0026`](../../../test/experiment/geometry/margolus-24-cell-symmetry.ts)** - the 24-direction coin carries the order-1152 F4 symmetry of the 24-cell that the FCHC lattice gas needs for isotropy (Margolus), where naive cubic coins (order 384, 48) do not.
- **[`E-GMT-0032`](../../../test/experiment/geometry/dimensional-shadow.ts)** - the 24 substrate directions project to 3-space as 12 D3 (FCC) roots plus 6 octahedral axes each carrying a two-valued label (24 = 12 + 6x2), so the reduced fourth dimension becomes an internal doublet. A generic projection gives 24 structureless shadows.
- **[`E-GMT-0023`](../../../test/experiment/geometry/self-occlusion-fraction.ts)** - the perceivable fraction of Being is 3/4 (270 degrees) from the bulk-cusp dimensional occlusion, while the 24 centrally-symmetric directions give exactly 1/2 and triality gives 2/3.
- **[`E-GMT-0027`](../../../test/experiment/geometry/mesh-unfolds-exactly.ts)** - the {3,4,3,4} mesh unfolds exactly and deterministically from the single 24-cell by reflection, with integer-exact shell counts 1, 24, 456, 8376, 153192 and two runs agreeing bit for bit.

### 3. The Coxeter engine and tessellation catalog

One machine that builds any regular tiling, and the parameter-free bases.

- **[`E-GMT-0004`](../../../test/experiment/geometry/coxeter-engine.ts)** - one Coxeter engine builds any {p,q} or {p,q,r} by reflecting the fundamental chamber, dedupes coincident chambers, and reads exact facet-adjacency (heptagrid 7, dodecagrid 12). It runs the dodecagrid dynamics.
- **[`E-GMT-0005`](../../../test/experiment/geometry/coxeter-unification.ts)** - the one engine yields all the regular tessellations, and all are Lorentz-safe.
- **[`E-GMT-0021`](../../../test/experiment/geometry/modular-base.ts)** - the parameter-free modular base PSL(2,Z) is Lorentz-safe, continued-fraction addressed by a deterministic Stern-Brocot automaton, with the golden ratio as its central geodesic.
- **[`E-GMT-0014`](../../../test/experiment/geometry/geometry-73.ts)** - the {7,3} heptagrid is 2D hyperbolic with exponential shell growth and degree 7 (the baseline hyperbolic tiling).

### 4. Hyperbolic versus flat signatures

The measurements that tell a curved crystal apart from a flat lattice.

- **[`E-GMT-0010`](../../../test/experiment/geometry/dodecagrid.ts)** - the 3D hyperbolic honeycomb {5,3,4} is Lorentz-safe while a flat cubic lattice is not.
- **[`E-GMT-0006`](../../../test/experiment/geometry/crystal-hidden-hierarchical.ts)** - a hyperbolic crystal reads the same as a random foam to a local observer (hidden), and is tree-like (small bounded Gromov delta), unlike a flat lattice whose delta grows.
- **[`E-GMT-0022`](../../../test/experiment/geometry/nested-structure-534.ts)** - BFS shells on {5,3,4} grow exponentially with a converging ratio and accumulate toward the boundary.
- **[`E-GMT-0012`](../../../test/experiment/geometry/emergent-space-test.ts)** - the {3,4,3,4} flat space self-averages its light cone toward isotropy with scale, while the cubic crystal's anisotropy is systematic and never escapes.

### 5. The horosphere as flat 3D physical space

Physical space is a horosphere slice of the 4D bulk. These pin down how flat it really is.

- **[`E-GMT-0002`](../../../test/experiment/geometry/bulk-dimension-3434.ts)** - the {3,4,3,4} cusp is a flat 3D sheet inside an exponential bulk, so the bulk is 4D and {5,3,4} reads one dimension lower.
- **[`E-GMT-0013`](../../../test/experiment/geometry/exact-horosphere.ts)** - an exact {4,4} square horosphere of {4,4,3} validates the flat-self idealization.
- **[`E-GMT-0018`](../../../test/experiment/geometry/horosphere-flat.ts)** - a Busemann level set of {5,3,4} grows polynomially, a flat 2D sheet inside the curved crystal.
- **[`E-GMT-0019`](../../../test/experiment/geometry/horosphere-reality.ts)** - the {3,4,3,4} horosphere band is intrinsically flat at finite distance, with a spread of cell degrees.
- **[`E-GMT-0017`](../../../test/experiment/geometry/horosphere-3434.ts)** - the generic {3,4,3,4} horosphere band is a thin slab (about 2.5D), not clean flat 3D (the negative on the naive band).
- **[`E-GMT-0015`](../../../test/experiment/geometry/gm-geometry-3434.ts)** - the {3,4,3,4} D4 lattice is flat: polynomial r^4 growth, linear metric, near-zero curvature.

### 6. The warp factor and the renormalization fixed point

One algebraic number falls out of the bulk shell counts and pins a scale hierarchy with no free parameter.

- **[`E-GMT-0003`](../../../test/experiment/geometry/bulk-warp-factor.ts)** - the bulk warp factor is lambda about 18.278 from the exact shells 1, 24, 456, 8376, 153192, algebraic of degree at least 3, with the flat lattice (polynomial growth) the control.
- **[`E-GMT-0028`](../../../test/experiment/geometry/warp-factor-needs-geometry.ts)** - the warp factor is a geometric consequence: it vanishes on a degree-preserving scramble and on the flat lattice (the L2-to-L3 control).
- **[`E-GMT-0029`](../../../test/experiment/geometry/mesh-preferred-factorization.ts)** - the mesh supplies a preferred factorization (compact blocks are internally dense and externally sparse), which a degree-preserving scramble destroys.
- **[`E-GMT-0030`](../../../test/experiment/geometry/renormalization-fixed-point.ts)** - the shell-growth ratio RG-flows (24, 19, 18.37, 18.29) and contracts geometrically to a non-trivial fixed point 18.278, while the flat lattice flows to the trivial fixed point one.
- **[`E-GMT-0031`](../../../test/experiment/geometry/warp-factor-minimal-polynomial.ts)** - the warp factor has an exact cubic closed form: the transfer matrix gives characteristic polynomial lambda^3 - 21 lambda^2 + 51 lambda - 23, whose largest root 18.2787 reproduces shell five and predicts shell six with no enumeration.

### 7. Walking the bulk: curvature and holonomy

Curvature treated as a directly measured physical fact, each against a zero-effect flat control.

- **[`E-GMT-0033`](../../../test/experiment/geometry/horocyclic-step-isometry.ts)** - a physical horospheric step is an exact bulk isometry (every hyperbolic distance preserved) that composes as a group (step t then s equals t+s, inverse returns home), while a naive shear breaks the metric.
- **[`E-GMT-0034`](../../../test/experiment/geometry/geodesic-divergence.ts)** - two straight bulk walks on nearly the same heading separate as sinh(arc length) (exponential rate one, the curvature), while on the flat cusp they separate linearly.
- **[`E-GMT-0035`](../../../test/experiment/geometry/triangle-deficit-walk.ts)** - pacing a bulk triangle gives an angle deficit equal to its area (Gauss-Bonnet), matched by two independent measurements and growing with loop size, while flat legs give zero deficit.
- **[`E-GMT-0036`](../../../test/experiment/geometry/loop-holonomy.ts)** - walking a closed bulk loop rotates the parallel-transported frame by exactly the enclosed area (holonomy equals area to a part in a million), while a flat loop returns the frame unchanged.
- **[`E-GMT-0037`](../../../test/experiment/geometry/repeated-loop-drift.ts)** - repeating a bulk loop accumulates holonomy linearly (N times the single-loop rotation) and returns the frame exactly only at the commensurate meta-period, while a flat loop always returns.

### 8. Spinors and momentum-space from tilings

Spin and band structure read off the tessellation directly.

- **[`E-GMT-0024`](../../../test/experiment/geometry/three-d-spinor-from-73.ts)** - 3D space and a 3D spinor come out of the 2D {7,3} tiling, where the deconstructed extra dimension is the third gamma matrix (uplift of dimension equals uplift of spin).
- **[`E-GMT-0020`](../../../test/experiment/geometry/hyperbolic-bands.ts)** - the PSL(2,7) Cayley-graph spectrum decomposes into irrep bands of dimension 1, 6, 7, 8, hyperbolic momentum-space made concrete.

## What this arena establishes

- **The substrate is not arbitrary.** Finite-cell hyperbolic crystals exist only in dimensions 2, 3, 4, and the cusp of {3,4,3,4} reads spectral dimension 3, so 3+1 spacetime sits inside a hard geometric window rather than being assumed.
- **The 24-cell coin carries exceptional symmetry.** The 24 D4 directions lift by triality to F4 of order 1152, the exact symmetry the FCHC lattice gas needs for isotropy, which the naive cubic coins lack.
- **Physical space is an emergent flat horosphere.** A flat 3D slice sits inside the exponentially-growing 4D bulk, it self-averages toward isotropy and Lorentz-safety, and a flat cubic lattice provably cannot do the same.
- **One number pins a hierarchy with no tuning.** The bulk warp factor is the cubic root of lambda^3 - 21 lambda^2 + 51 lambda - 23 (about 18.278), a renormalization fixed point read straight from exact integer shell counts.
- **Curvature is a measured fact, not an input.** Geodesic divergence (sinh), angle deficit (Gauss-Bonnet), and loop holonomy (rotation equals area) all match closed forms to a part in a million, and all vanish on the flat control.
- **The negatives are reported.** The generic {3,4,3,4} horosphere is a thin ~2.5D slab rather than clean flat 3D, and {3,4,3,4} is a candidate not forced by the bare principle that forces {5,3,4}, both stated plainly.

## License

MIT

## ClueSurf

Part of the ClueSurf project.
