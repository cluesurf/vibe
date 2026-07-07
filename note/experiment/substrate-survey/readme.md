# Substrate Survey

Thirty comparative experiments that ask the geometry question directly. **Why {3,4,3,4} and not another lattice?**

The rest of the suite runs on the committed substrate. This arena runs the same tests on **rival substrates**: 2D hyperbolic tilings, 3D honeycombs, the {5,3,4} dodecagrid, the {7,3} heptagrid, 5D pentacombs, the flat lattice, closed manifolds. Each rival is scored on the prerequisites for physics: reversibility, Lorentz-safety, the right physical-space dimension, crystallographic directions (a gauge group), and a spinor coin (matter with the correct sign under a 2pi turn).

The finding is a sorting. **The dynamics port to almost every hyperbolic lattice.** The rule conserves charge, the light cone is ballistic, waves churn, the holographic correlator is clean 1/r^2 on nearly all of them. What does **not** port is the physics content. The physical-space dimension is wrong on every rival, the icosahedral and heptagonal coins carry no root system, and the D4 spinor sectors appear in **exactly** the 24-cell-faceted tessellations. {3,4,3,4} is the one lattice that clears every row at once.

These are the negative controls for the whole program. The {5,3,4} no-spinor result is what makes the {3,4,3,4} spinor result mean something.

## Dimension and Schlafli-symbol sweeps

The Schlafli symbol fixes the physical-space dimension (one below the bulk). Sweep the dimension, watch the target 3D appear only at rank 4.

- **E-SBT-0001** - 2D hyperbolic {p,q} tilings. All give a 1D horocycle, the most degenerate case. {6,4} and {4,6} are crystallographic AND compact but still 1D with no spinor.
- **E-SBT-0002** - 3D hyperbolic honeycombs. All give 2D physical space. Compact regulars all contain a 5 (non-crystallographic), the crystallographic ones are paracompact, so 3D never delivers compact-and-crystallographic together.
- **E-SBT-0003** - 4D regular honeycombs. All give 3D physical space, the observed dimension. {3,4,3,4} is the unique 24-cell-faceted (D4) one, paracompact with the flat cubic {4,3,4} cusp.
- **E-SBT-0005** - 5D crystallographic honeycombs (3s and 4s only). All overshoot to 4D physical space and lose compactness (paracompact, beyond the H^4 limit).
- **E-SBT-0013** - one generic front-end classifies and builds any regular honeycomb 2D to 4D with correct facet degrees, flags unbuildable cases, never silently degenerates. {3,4,3,4} builds with 24 facets and the cubic vertex figure.

## The comparative scoreboards

Run one battery across many substrates at once, so every substrate is measured identically and is directly comparable.

- **E-SBT-0008** - the same full validation battery (geometry, crystallography, spinor coin, rule, electromagnetism, holography, gravity, isotropy, cosmology, selves) on one substrate per dimension. Only {3,4,3,4} scores on every physics row.
- **E-SBT-0029** - one battery across the whole regular hyperbolic catalog. Matter (a Kahler-Dirac fermion) propagates on every buildable tessellation, so matter is universal to hyperbolic geometry. The spinor coin appears in exactly the 24-cell-faceted few (the 4D {3,4,3,4}, {4,3,4,3}, and the 5D pentacombs).

## Substrate-neutral prerequisites and controls

The prerequisites a substrate must satisfy before any physics claim, tested against nulls (the flat lattice, an all-boundary patch).

- **E-SBT-0016** - a family of non-random substrates. Every hyperbolic substrate is Lorentz-safe (isotropic, no preferred frame) while the flat lattice is not. Hyperbolic curvature, not disorder, buys Lorentz-safety.
- **E-SBT-0014** - the full Margenstern {p,4} and {p,3} tiling families. All are Lorentz-safe with exponential reach, confirming the curvature-not-disorder prediction across both families.
- **E-SBT-0006** - a boundary-free closed hyperbolic lattice (the Cayley graph of PSL(2,7)). Removes the all-boundary confound of a finite patch so bulk spectra are measured with zero edge artifact.
- **E-SBT-0007** - which substrate supports compact low-leak selves. Flat and square horospheres do (boundary fraction falls as a region grows), the hyperbolic bulk does not (almost all boundary at every size). The isoperimetric reason the self experiments use the flat layer.
- **E-SBT-0012** - from integer generator data, a deterministic automaton grows a group, emits the tessellation, and runs the model on it. The whole chain from the integers to the lived Lorentz-safe substrate is one continuous construction, no randomness.
- **E-SBT-0009** - the smeared Benincasa-Dowker action on causal sets approaches the 2D manifold reference in a smearing window, confirmed at two sizes. The continuum-manifold prerequisite is real, not a small-N artifact.

## The {7,3} heptagrid suite (2D bulk, 1D physical space)

The most degenerate rival. Everything general ports, all the physics content is missing.

- **E-SBT-0026** - the directional rule ports to the 2D {7,3} heptagrid, conserving charge exactly and churning. (Degree 7 is 1 mod 3, so the mod-3 wave invariant differs, charge still conserves.)
- **E-SBT-0027** - the holographic correlator, cosmology, and 7-fold isotropy port to {7,3}. The difference: physical-space gravity is 1D, so the potential is linear and confining, not 1/r.
- **E-SBT-0028** - the 7 directions of {7,3} are non-crystallographic (measured), so no root-system gauge and 1D physical space. Even more degenerate than {5,3,4}.

## The {5,3,4} dodecagrid and {4,3,4} cusp (3D bulk, 2D physical space)

The nearest rival and the primary control. The framework is fully solvable here, often easier, but the physics does not port. This is precisely why {3,4,3,4} was chosen over it.

- **E-SBT-0004** - the framework ports to {5,3,4} (3D bulk, clean 1/r^2 correlator), the control that isolates what needs {3,4,3,4}.
- **E-SBT-0025** - the 12 icosahedral directions of {5,3,4} are non-crystallographic (measured), so no root-system gauge and no spinor. Physical space would be 2D with no fundamental spin or gauge group.
- **E-SBT-0010** - the exact {5,3,4} modular-fingerprint engine matches the float engine, exceeds the ~15.5k float precision wall, and round-trips through disk. Cohesive memory works on the real geometry.
- **E-SBT-0015** - the perception dynamics on a million-node 12-regular hyperbolic proxy for {5,3,4} conserve charge, create life from peace, and hold a dynamic balance at scale, in feasible time.
- **E-SBT-0021** - the {5,3,4} behaviours port to the {4,3,4} cubic cusp: a z=1 light cone, churn from a seed, and self-annihilation on contact.

## The {5,3,3,3,3} 5D suite (5D bulk, 4D physical space, over-dimensional)

The over-dimensional non-crystallographic rival. Framework ports, dimension and coin are wrong.

- **E-SBT-0022** - the directional rule ports to the 5D {5,3,3,3,3} bulk, conserving charge and churning.
- **E-SBT-0023** - the holographic correlator and cosmology port to {5,3,3,3,3}, but physical-space gravity is 4D (1/r^2 potential, over-dimensional), not 1/r.
- **E-SBT-0024** - the {5,3,3,3,3} bulk builds as a 5D hyperbolic graph. Over-dimensional (4D physical space) and the leading 5 makes the coin non-crystallographic, so no spinor.

## The 5D D4 pentacomb (spin AND curvature together)

The spin-versus-curvature trade resolved. {3,4,3,4} has the spinor coin but is flat. {5,3,4} is curved but its coin carries no spinor. The pentacomb {3,4,3,3,4} has both, the 24-cell directions on a genuinely curved 5D bulk.

- **E-SBT-0017** - the 5D pentacomb has a genuine hyperbolic embedding. Greedy routing on the H^5 metric delivers and collapses when the coordinates are scrambled, so the mesh is backed by real 5D geometry, not only a combinatorial graph.
- **E-SBT-0018** - the pentacomb is a curved mesh (grows faster than a flat honeycomb) that runs the reversible charge-conserving rule directly on its real generated geometry.
- **E-SBT-0019** - a fermion propagates on the 5D D4 pentacomb. The clean fermion spreads while a deterministic quasiperiodic potential traps it (the localization control). The substrate carries the spinor coin AND curvature AND a propagating fermion together.
- **E-SBT-0020** - the pentacomb {3,4,3,3,4} carries the D4 spinor directions AND negative curvature, so spin plus curvature come from the bare rule with no added field.

## What only {3,4,3,4} has (the D4 coin foundations)

The exclusive properties, the reason the committed substrate is privileged.

- **E-SBT-0011** - the D4 lattice-gas rule closes on 24 neighbours and is exactly reversible (integer arithmetic, forward then inverse is identity), conserving particle count and momentum.
- **E-SBT-0030** - one 24-direction substrate splits into 8v + 8s + 8c. Under one 2pi rotation the 8v vector sector returns to +1 (a boson, the photon candidate) while the 8s and 8c spinor sectors go to -1 (fermions). One structure carries the gauge boson and both fermion sectors, not built separately.

## What this arena establishes

- **The dynamics are substrate-general, the physics is not.** The reversible conserving rule, the ballistic light cone, and the clean 1/r^2 holographic correlator port to nearly every hyperbolic lattice. They select nothing on their own.
- **Only rank 4 gives 3D physical space.** 2D bulk gives 1D, 3D gives 2D, 5D gives 4D. The 4D honeycombs are the only family that lands on the observed dimension.
- **The spinor coin is exactly the 24-cell facet.** Measured across the whole catalog, the D4 spinor sectors appear in precisely the 24-cell-faceted tessellations and nowhere else. The icosahedral {5,3,4} coin and the heptagonal {7,3} coin are non-crystallographic, so no root-system gauge and no spinor.
- **Curvature buys Lorentz-safety, the flat lattice fails it.** Every hyperbolic substrate is isotropic with no preferred frame, the flat lattice has a strong one. Curvature, not disorder, is the source.
- **{3,4,3,4} is the only lattice that clears every row at once.** 3D physical space, crystallographic D4 directions, the spinor coin, exact reversibility, Lorentz-safety, and a single 24-direction structure that carries a boson sector and two fermion sectors together.
- **The rivals are the controls.** {5,3,4} with no spinor, {7,3} with 1D gravity, {5,3,3,3,3} over-dimensional, the flat lattice with a preferred frame. Each is a case that gives NO where {3,4,3,4} gives YES, which is what makes the YES a result.
