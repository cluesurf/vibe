# Holography arena

33 experiments. Codes **[`E-HLG-0001`](../../../test/experiment/holography/area-law.ts)** through **[`E-HLG-0033`](../../../test/experiment/holography/bulk-shortcut-reachability.ts)**.

## What this arena tests

Vibe theory says the physical world is a thin flat **boundary** riding on a 4D hyperbolic **bulk**. The curved bulk is the {3,4,3,4} honeycomb. The flat physical layer is a horosphere shell, the cusp. This arena tests **bulk-boundary duality** on that discrete substrate.

The claims come from real holography. The **area law**: a region's entropy scales with its boundary, not its volume. **Ryu-Takayanagi**: the entanglement of a boundary interval equals the length of the minimal bulk surface anchored on it. **Bulk reconstruction**: the boundary redundantly encodes the bulk, so the bulk survives boundary damage (error-correcting codes, HaPPY tensors). **Entanglement geometry** (Van Raamsdonk): cutting the entanglement across a throat pinches the geometry apart there. **Celestial holography** (Pasterski): the Lorentz group acts as the conformal group on the sphere at infinity.

The engine is fixed. Five base things. A growing hyperbolic crystal, a ternary tone, a reversible conserving local rule, reflection and growth, the arrow. Nothing holographic is postulated. Each test asks whether the signature **emerges** from the geometry, and every deep claim carries a **flat control** where the answer must be no.

## Audit, 2026-08-31

Five results here were regraded from L3 to L2 in the second audit
sitting: `rt-geodesic-3434`, `holographic-3434`, `bulk-to-cusp-rt`,
`p91-holography` and `ryu-takayanagi-73`. Each builds a real hyperbolic
tessellation and compares with a flat lattice, but what it measures is
graph geodesic length and shell fraction, which is hyperbolic geometry
(known), with no rule, no dynamics and no entanglement entropy. They
are the geometric preconditions for an area law and a Ryu-Takayanagi
law, not those laws, and their titles now say so. `area-law` and
`black-hole` are free-fermion entanglement calculations with no mesh
(L2), and `page-curve-from-scrambling` tests an identity every pure
state satisfies (L1). The four L3s that remain (`bulk-nonlocality`,
`growing-code`, `holographic-memory`, `signaling`) run a tone dynamics
on the mesh against a computed control. The wording below predates the
audit where it says "area law" or "Ryu-Takayanagi" for the geometric
results. The audit is `../../audit/2026-08-31-experiment-audit.md`.

## Sub-themes

### 1. Boundary dominance, the area law derived from geometry

The defining signature of a hyperbolic bulk. The outermost shell holds an order-one fraction of all cells, so information lives on the boundary. The flat lattice is the control, its boundary fraction goes to zero.

- **[`E-HLG-0010`](../../../test/experiment/holography/hierarchy-bulk-tree.ts)** - the {3,4,3,4} bulk radial tree is a self-similar hierarchy with constant branching, the holographic RG / MERA direction, depth grows as log of the boundary size.
- **[`E-HLG-0011`](../../../test/experiment/holography/holographic-3434.ts)** - the committed {3,4,3,4} substrate is holographic, the outermost shell holds about 94 percent of all cells (the area law), the holographic scale is the warp factor lambda, against a flat volume-law control.
- **[`E-HLG-0015`](../../../test/experiment/holography/p212-holography.ts)** - a finite-patch shell extraction cannot read a clean holographic screen dimension, the method is confounded (a reported negative).
- **[`E-HLG-0032`](../../../test/experiment/holography/holography-is-derived.ts)** - holography is a derived theorem of the mesh, not a postulate. The non-amenable {3,4,3,4} boundary holds a constant 94.5 percent of the ball, exactly (lambda-1)/lambda set by the warp factor. The amenable flat lattice tends to zero. This dissolves the apparent contradiction with Timeless Dynamics over whether the cusp is a screen.

### 2. Ryu-Takayanagi, entanglement as the bulk geodesic

The entanglement of a boundary interval equals its minimal bulk surface. On a hyperbolic tiling that geodesic dips through the negatively curved interior, so it grows as the log of the interval. The flat control grows linearly, no shortcut.

- **[`E-HLG-0005`](../../../test/experiment/holography/bulk-to-cusp-rt.ts)** - the 3D {5,3,4} and committed 4D {3,4,3,4} bulks carry the RT shortcut S ~ log L to the flat cusp, the flat control is linear. The bulk-to-cusp bridge.
- **[`E-HLG-0016`](../../../test/experiment/holography/p91-holography.ts)** - RT log law, geodesic shortcut, and depth-as-scale, all on the {7,3} crystal.
- **[`E-HLG-0018`](../../../test/experiment/holography/rt-geodesic-3434.ts)** - the RT / geodesic log law on the committed {3,4,3,4}, the bulk radius D ~ log_lambda(cells), a bulk geodesic is about 2 log_lambda of the boundary separation, against a flat polynomial control.
- **[`E-HLG-0019`](../../../test/experiment/holography/ryu-takayanagi-73.ts)** - on {7,3} the boundary-interval entanglement follows the logarithmic RT law, the flat {6,3} control is linear. The cleanest prototype.

### 3. Entanglement area laws and the geometry they build

The precondition emergent gravity and holography rest on. The vacuum of the emergent free-fermion (Dirac) field has an area-law entropy, a thermal state does not. And the entanglement and the geometric connectivity track each other.

- **[`E-HLG-0001`](../../../test/experiment/holography/area-law.ts)** - the emergent field ground state is area-law while a thermal state is volume-law. Massive saturates, massless grows as (c/3) ln L, thermal grows linearly.
- **[`E-HLG-0002`](../../../test/experiment/holography/bethe-gravity.ts)** - the exact Bethe-lattice bulk-mediated boundary correlator is a clean universal power law, the finite-patch artifact removed, validated against a directly-solved finite tree.
- **[`E-HLG-0003`](../../../test/experiment/holography/black-hole.ts)** - a 3D region's entropy scales with its horizon area (l^2), not its volume (l^3), the Bekenstein-Hawking clue.
- **[`E-HLG-0006`](../../../test/experiment/holography/entanglement.ts)** - free-fermion entanglement follows a 1D conformal log law and a 2D area law.
- **[`E-HLG-0021`](../../../test/experiment/holography/entanglement-geometry-covaries.ts)** - emergent entanglement and geometric connectivity across a tunable throat rise and fall together (Van Raamsdonk), while an untouched far bond does not track it. The discriminator is spatial, which cut pinches.

### 4. Bulk nonlocality, the hidden channel beneath physical space

Two points far apart along the flat physical layer are a few hops apart through the bulk, because the hyperbolic interior has a tiny diameter. A real geometric shortcut, and not action at a distance, since the bulk route is itself the graph geodesic.

- **[`E-HLG-0004`](../../../test/experiment/holography/bulk-nonlocality.ts)** - distant surface points are joined by a short hidden path through the bulk, within-surface distance vastly exceeds through-bulk distance.
- **[`E-HLG-0020`](../../../test/experiment/holography/signaling.ts)** - a signal crosses the whole universe through the bulk to a far self, the diameter is about log of the cell count.
- **[`E-HLG-0033`](../../../test/experiment/holography/bulk-shortcut-reachability.ts)** - a far cusp signal arrives through the bulk in logarithmic time, break-even separation six, speedup unbounded to sixty-eight-fold at separation 1024, the bulk route is the graph geodesic (no light-cone violation), the along-cusp route is linear.

### 5. Holographic error-correcting codes, bulk reconstruction and persistence

The boundary redundantly encodes the bulk, so a bulk logical (a self) survives boundary erasure. Classical redundancy, quantum HaPPY perfect tensors, and the growing code. The control is always the threshold, some erasures do destroy the logical.

- **[`E-HLG-0007`](../../../test/experiment/holography/growing-code.ts)** - the growing holographic code raises its erasure threshold with shell age, older history is protected better.
- **[`E-HLG-0008`](../../../test/experiment/holography/happy-code-534.ts)** - the quantum HaPPY [[5,1,3]] perfect code on {5,3,4}, any 2 erasures recover the bulk logical qubit (distance three).
- **[`E-HLG-0009`](../../../test/experiment/holography/happy-tiling-534.ts)** - the HaPPY code tiled on the {5,3,4} bulk tree, the code distance protecting a bulk self grows as 3^depth.
- **[`E-HLG-0012`](../../../test/experiment/holography/holographic-code-534.ts)** - persistence via a classical holographic redundancy code on {5,3,4}, the boundary reconstructs the bulk self after local damage.
- **[`E-HLG-0013`](../../../test/experiment/holography/holographic-memory.ts)** - a spread-encoded bit survives a bounded erasure while a localized blob is destroyed, erasure protection without hole-healing.
- **[`E-HLG-0014`](../../../test/experiment/holography/holography-from-rule.ts)** - the bare reversible rule derives the causal wedge, but the erasure code needs the perfect-tensor constraint (a partial result, the rule gives the causal skeleton only).
- **[`E-HLG-0017`](../../../test/experiment/holography/planar-vs-tree-534.ts)** - the planar tiling loops keep more boundary reachable after a cut than the bulk tree, so the tree model is a conservative lower bound on the planar HaPPY code.

### 6. Celestial holography, the sphere at infinity

The discrete seed of Pasterski's program. The substrate isometries (the bulk boosts) act conformally on the ideal boundary S^3, the seed of the celestial sphere. Cross-ratios are preserved, correlators transform covariantly, and the symmetry closes into the right algebra. Most rest at L1 or L2 as seeds, since a full celestial amplitude would presuppose emergent Lorentzian spacetime the substrate has not built.

- **[`E-HLG-0022`](../../../test/experiment/holography/celestial-conformal-boundary.ts)** - the substrate isometries act conformally on the ideal boundary, the cross-ratio is preserved, a shear control breaks it.
- **[`E-HLG-0023`](../../../test/experiment/holography/celestial-two-point-covariance.ts)** - a boundary two-point function transforms as a celestial correlator under a substrate boost, the conformal factor factorizes exactly.
- **[`E-HLG-0024`](../../../test/experiment/holography/celestial-infinite-symmetry.ts)** - the boundary conformal family is unbounded while the substrate point symmetry is finite, the seed of infinite-dimensional celestial symmetry.
- **[`E-HLG-0025`](../../../test/experiment/holography/celestial-boost-group.ts)** - same-axis boundary boosts compose by adding rapidity, the dilation group the Mellin boost-weight basis diagonalizes.
- **[`E-HLG-0026`](../../../test/experiment/holography/celestial-three-point.ts)** - a boundary three-point of primaries transforms as a celestial three-point, each point carrying its own conformal weight.
- **[`E-HLG-0027`](../../../test/experiment/holography/celestial-symmetry-algebra.ts)** - the boundary conformal symmetry closes into so(4,1), the algebraic seed of the celestial symmetry algebra.
- **[`E-HLG-0028`](../../../test/experiment/holography/celestial-memory-continuity.ts)** - the memory corner is held open, the boundary shift equals the integrated flux by continuity, which is a consistency check and not yet an emergent memory (open).
- **[`E-HLG-0029`](../../../test/experiment/holography/celestial-horosphere-slice.ts)** - the horocyclic projection to the flat boundary chart preserves the conformal cross-ratio, the seed of the hyperbolic slicing.
- **[`E-HLG-0030`](../../../test/experiment/holography/celestial-boost-aberration.ts)** - the emergent boost acts on the celestial sphere by exactly the conformal map the celestial seeds measured, joining the dynamics and kinematics suites.
- **[`E-HLG-0031`](../../../test/experiment/holography/celestial-massless-boundary.ts)** - the celestial sphere is the massless asymptotic boundary of the substrate, and the massless-versus-massive split is boost-invariant.

## What this arena establishes

- The {3,4,3,4} substrate is **holographic by construction**. Boundary dominance is a theorem of the hyperbolic geometry, exactly (lambda-1)/lambda, not a postulate, with the amenable flat lattice as the failing control.
- **Ryu-Takayanagi holds** on the discrete substrate. Boundary-interval entanglement grows as the log of the interval on {7,3}, {5,3,4}, and {3,4,3,4}, and linearly on every flat control.
- The **area law** the whole program needs is a property of the emergent field, ground-state area-law against thermal volume-law, with the Bekenstein-Hawking surface scaling recovered in 3D.
- **Bulk reconstruction works** as an error-correcting code. Classical redundancy and quantum HaPPY perfect tensors both let a bulk self survive boundary erasure, with a real distance threshold as the control.
- The **hidden bulk channel is real and causal**. Far cusp points are close through the bulk, the shortcut is the graph geodesic, and it never outruns the light cone.
- **Celestial holography has a clean discrete seed**. Substrate boosts are boundary conformal maps and the symmetry closes into so(4,1), though the emergent memory and full amplitudes stay open pending emergent Lorentzian spacetime.
- The arena is disciplined about limits. The confounded shell-dimension read (**[`E-HLG-0015`](../../../test/experiment/holography/p212-holography.ts)**), the partial rule-to-code result (**[`E-HLG-0014`](../../../test/experiment/holography/holography-from-rule.ts)**), and the open memory corner (**[`E-HLG-0028`](../../../test/experiment/holography/celestial-memory-continuity.ts)**) are reported as such.
</content>
</invoke>
