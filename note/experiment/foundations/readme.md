# Foundations

The **foundations** arena is the "from nothing to the mesh" program. It tests the base axioms and shows how much structure follows from the fewest assumptions.

The claim is a chain. Start from the seed, that anything exists and a difference once made cannot vanish. Read that seed as a condition on dynamics and it forces a **reversible conserving local rule** (the knit). Ask for the smallest alphabet with a vacuum and a mirror and it forces the **ternary tone**. Ask for a reversible composition that supports fermions and it pinches the dimension to **eight** (the octonions). The octonions carry triality, triality forces **D4**, D4 gives the **24-cell dock** and the **{3,4,3,4} mesh**. From there the arena derives the arrow of time, exact reversibility and record-preservation, emergent quantum unitarity, and the Standard Model content.

Each experiment enumerates a finite candidate space in full and counts the survivors, so the canonical numbers (3, 8, 24, 81, 10395, 1152) come out of the computation rather than being asserted. Most carry a negative control, a deliberately broken rule where the property should fail, confirming the test can say NO.

69 experiments, grouped below into nine sub-themes. Every code appears once.

## The ternary tone

The atom of distinction. The smallest integer alphabet that admits a vacuum and a charge mirror, and why its three is not the triality three.

- **[`E-FND-0045`](../../../test/experiment/foundations/tone-is-forced.ts)** - exhaustive over every subset of {-3..3}, the unique smallest set with a vacuum (a 0) and a mirror (negation closure) is {-1,0,+1}, size three. Vacuum alone forces size one, mirror alone size two.
- **[`E-FND-0038`](../../../test/experiment/foundations/ternary-and-4d-forced.ts)** - the ternary tone (vacuum plus charge conjugation) and the four dimensions (the unique triality D4) are each forced by a short natural requirement.
- **[`E-FND-0039`](../../../test/experiment/foundations/ternary-not-triality.ts)** - the ternary three (vacuum plus pair, symmetry Z2, partition 1+2) is NOT the triality three (symmetric triple, S3, partition 3), so the tone stays the irreducible atom and does not fold into the octonion pinch.
- **[`E-FND-0068`](../../../test/experiment/foundations/charge-conjugation-symmetry.ts)** - the base ternary is exactly charge-conjugation symmetric (a configuration and its sign-flip mirror), so plus and minus carry no give-versus-restrain asymmetry. A hand-made asymmetric rule is caught.

## The one reversible conserving rule

The knit is the single local law. These experiments show it conserves charge and momentum, runs backward exactly, and is forced unique by symmetry.

- **[`E-FND-0013`](../../../test/experiment/foundations/directional-rule.ts)** - the directional lattice-gas conserves total charge and runs backward exactly, on both the 2D square reference and the 24-direction D4 coin.
- **[`E-FND-0008`](../../../test/experiment/foundations/conserved-dynamics.ts)** - conserved exchange on the {5,3,4} crystal keeps the total charge Q exact while charge diffuses, pumps, and pairs (hop, share, polarize).
- **[`E-FND-0028`](../../../test/experiment/foundations/knit-rule-forced.ts)** - the knit is one of 10395 matchings by conservation alone, but the crystallographic B4 (verified order-192 on the lines) forces it UNIQUE along a descending curve 10395 to 75 to 3 to 1, while the full F4 (triality) admits ZERO, so the knit respects B4 but breaks triality.
- **[`E-FND-0059`](../../../test/experiment/foundations/b4-maximal-collision-symmetry.ts)** - B4 is the maximal symmetry ANY collision law can have, by exhaustive stabilizer scan the max stabilizer in F4 is exactly B4 (order 192), attained by exactly three laws (one per generation frame).
- **[`E-FND-0046`](../../../test/experiment/foundations/beat-computes-on-mesh.ts)** - the knit (collide then stream, applied synchronously) conserves charge exactly and is reversible bit for bit on the {3,4,3,4} mesh. An erasing rule conserves neither.
- **[`E-FND-0060`](../../../test/experiment/foundations/reversibility-is-the-seed.ts)** - reversibility is not a premise but the seed applied to dynamics. "A difference cannot vanish" means no two states merge, which is injectivity, which on a finite set is reversibility. The lossy rule is what the seed forbids.
- **[`E-FND-0030`](../../../test/experiment/foundations/lattice-gas-reversible-logic.ts)** - the knit is conservative reversible logic in the Toffoli-Fredkin-Bennett-Landauer sense, no fan-out, a conserved token census, an invertible step. A lossy rule fails all three (Landauer-dissipative).
- **[`E-FND-0014`](../../../test/experiment/foundations/doi-peliti-check.ts)** - the rule is a spin-1, charge-conserving reversible exchange model, verified from the exact 9-state single-edge matrix, satisfying detailed balance (Doi-Peliti check).
- **[`E-FND-0011`](../../../test/experiment/foundations/cpt-theorem.ts)** - the discrete CPT theorem, the reversible knit has C, P, and T symmetries and the combined CPT is a symmetry of the dynamics. The CP-without-T case is the control that fails.
- **[`E-FND-0073`](../../../test/experiment/foundations/metric-free-continuity.ts)** - the continuity law holds with exactly zero residual over partitions that carry no geometry at all (single cells, index-interleaved, integer-scrambled, digit-parity), which are verified to carry real flux, so conservation reads only adjacency and orientation and never a coordinate or a distance. This is the lattice form of Herbert's refactored primitive that continuity sits logically below geometry. A lossy rule breaks it on every one of the same partitions.
- **[`E-FND-0074`](../../../test/experiment/foundations/arp-separation.ts)** - conservation, recoverability and persistence are three independent gates, with a witness for each gap: a sorting rule conserves charge to the integer while destroying which direction carried which tone (conserving but not recoverable), and the reversible knit loses all local structure while reversing bit for bit (recoverable but not persistent). Measured at two mesh sizes, with the exact Poincare recurrence reported rather than averaged away.

## Exact reversibility, records, and the arrow

Reversibility preserves records but carries no arrow. The arrow is the wake, the monotone growth of the mesh. This closes the bridge to Timeless Dynamics.

- **[`E-FND-0049`](../../../test/experiment/foundations/record-preserving-paths.ts)** - the reversible knit is a record-preserving path (forward then inverse recovers the start bit for bit), while a lossy rule destroys the record, the condition Timeless Dynamics builds emergent time on.
- **[`E-FND-0048`](../../../test/experiment/foundations/emergent-time-distinguishability.ts)** - the fixed-mesh knit is NOT emergent time. Read by occupancy (not the cancelling net charge) a packet traces a recurrent closed loop with near-maximal per-step distance, far from a geodesic, so it carries no arrow.
- **[`E-FND-0051`](../../../test/experiment/foundations/record-accumulating-wake.ts)** - the wake IS emergent time, the record-accumulating path. As the honeycomb unfolds the record count rises with growing increments (24, 456, 8376) and the Fisher-Rao arc length accumulates monotonically. The fixed-mesh knit only preserves a bounded record set.
- **[`E-FND-0055`](../../../test/experiment/foundations/recurrence-forces-wake.ts)** - the wake is forced as the escape from Poincare recurrence. A reversible rule is a bijection on a finite mesh, so every state recurs (measured periods 12, 132, 60), which bounds accumulated distinction, so unbounded accumulation needs growth, which is the wake.
- **[`E-FND-0052`](../../../test/experiment/foundations/record-phase-scale-distinct.ts)** - vibe keeps record-phase (time) and scale-flow (connectivity) distinct. Scale is static geometry (ball size from radius), time is dynamics (the knit and the growing wake), two structures, so emergent time is not circular.
- **[`E-FND-0057`](../../../test/experiment/foundations/chentsov-forced-distinguishability.ts)** - the distinguishability readout is pinned in two parts. The measured necessary condition (24-cell relabeling invariance, which Fisher-Rao passes and ad-hoc weighted measures fail) plus Chentsov uniqueness (cited), so the fragile hand-weighted readouts are killed.
- **[`E-FND-0072`](../../../test/experiment/foundations/recordability-capacity-ceiling.ts)** - a recording window records at most its Shannon capacity ln(B). As the input fine complexity rises the coarse-window recorded distinguishability saturates at ln(B) while the input keeps climbing (the TD cool-star spectral plateau), the ceiling scales as ln(B) with window size, and injected excess spills out conserved under the committed rule while a lossy rule loses it, instantiating TD recordability capacity c(q) >= phi(q) + nu on the substrate.
- **[`E-FND-0002`](../../../test/experiment/foundations/arrow-from-integer-order.ts)** - the arrow is the order of the INTEGERS, the unique ordered discrete normed ring. The discrete Cayley-Dickson rings all carry an i with i squared negative and cannot be ordered, so the one integer axis is time and the imaginary axes are not.
- **[`E-FND-0003`](../../../test/experiment/foundations/arrow-from-real-order.ts)** - the continuum sibling, the arrow is the order of the reals (the unique ordered division algebra), time is the one real axis (ordered), space the seven imaginary axes (unordered).

## From determinism to quantum

A deterministic reversible base produces emergent quantum mechanics, unitary on the right space, with a built complex unit and quantum speed limits.

- **[`E-FND-0056`](../../../test/experiment/foundations/configuration-unitarity-quantum.ts)** - the deterministic reversible knit is UNITARY on configuration space. A bijection induces a permutation matrix (U dagger U equals identity) that preserves the L2 norm of a superposition over a finite orbit. A lossy rule fails injectivity, so it is not unitary.
- **[`E-FND-0053`](../../../test/experiment/foundations/directional-phase-quantum-emergent.ts)** - the raw directional structure does NOT supply a quantum amplitude, its occupation L2 norm oscillates under the knit (not unitary), while net charge is conserved exactly. Complexification to an amplitude is an emergent step.
- **[`E-FND-0062`](../../../test/experiment/foundations/complex-structure-from-distinction.ts)** - the emergent complex unit i is built from the signed tone distinction and the beat alone (Kauffman iterant, the alternation [+1,-1] gives an element squaring to minus the identity), with a tone-alphabet control.
- **[`E-FND-0063`](../../../test/experiment/foundations/quantum-speed-limit-saturation.ts)** - the emergent Dirac quantum walk saturates the Margolus-Levitin and Mandelstam-Tamm speed limits, so the substrate computes at the quantum speed limit set by its energy.
- **[`E-FND-0065`](../../../test/experiment/foundations/emergent-no-cloning.ts)** - the emergent quantum forbids cloning of non-orthogonal states while allowing distinguishable ones (emergent superinformation), the no-cloning theorem from the reversible rule preserving inner products.
- **[`E-FND-0064`](../../../test/experiment/foundations/conservation-exactness-sweep.ts)** - self persistence rises with conservation exactness (perfect at zero leak, collapsing as conservation breaks), a deterministic rebuttal of the randomness-necessary claim, measured as a curve.

## The pinch to dimension eight

Reversibility caps the dimension at eight, triality (and monism) floors it there. The octonions are the forced pinch-point, not a free seed.

- **[`E-FND-0017`](../../../test/experiment/foundations/dynamics-forces-octonions.ts)** - the dynamics forces the octonions. Reversibility (no zero divisors) caps the tower at dimension eight, fermions with triality require dimension eight, they meet at exactly eight, so the base is one root, the reversible dynamics.
- **[`E-FND-0033`](../../../test/experiment/foundations/monism-forces-eight.ts)** - monism (the vector a tone moves along equals the spinor matter occupies) forces dimension eight uniquely (vector dim n equals half-spinor dim 2^(n/2-1) only at n=8). Three generations emerge as the faces 8v, 8s, 8c, an output not an input.
- **[`E-FND-0050`](../../../test/experiment/foundations/triality-forces-eight.ts)** - triality forces the floor at eight independently of the maximal-differentiation premise. Only D4 (so(8), vector dimension eight) among the D_n and A families carries order-three triality, so eight is pinched from both ends by theorems.
- **[`E-FND-0035`](../../../test/experiment/foundations/octonion-base-generator.ts)** - the base substrate and the three generations descend from the octonions (the unique maximal division algebra) by triality, the chain octonions to D4 to the 24-cell to {3,4,3,4}, each link a computed fact.
- **[`E-FND-0047`](../../../test/experiment/foundations/octonion-real-form-commitment.ts)** - vibe commits to the division octonions (no zero divisors, compact G2), so it cannot host Gogberashvili split-octonion zero-divisor particles. The sedenion level (where zero divisors first appear) is the control.

## The substrate forced

The 24-cell dock and its {3,4,3,4} mesh are forced from the tone by several independent routes, and sit over classical error-correcting codes.

- **[`E-FND-0044`](../../../test/experiment/foundations/cell-is-forced.ts)** - the 24-cell from integer arithmetic. The ternary tone on four slots gives 81 words partitioned 1+8+24+32+16, and among the stepping shells only the 24 spans a self-dual polytope (facet enumeration, the 16-cell and tesseract fail) carrying the belt-trick spinor.
- **[`E-FND-0005`](../../../test/experiment/foundations/base-uniqueness-theorem.ts)** - the base uniqueness theorem. Over all six regular 4-polytopes the 24-cell is the unique simultaneous pass of self-dual, crystallographic, and triality-carrying, so the dock is forced.
- **[`E-FND-0007`](../../../test/experiment/foundations/coin-algebra.ts)** - the 24 coin directions are the D4 roots, equal to the binary tetrahedral group, splitting into three triality classes of eight (a vector and two spinors), the spin algebra.
- **[`E-FND-0023`](../../../test/experiment/foundations/generator-algebraic.ts)** - the 24 Hurwitz quaternions are the group 2T with a genuine spinor (a nonsplit double cover), the algebraic generator route.
- **[`E-FND-0024`](../../../test/experiment/foundations/generator-information.ts)** - the 24-cell dock is the norm-2 shell of {-1,0,+1}^4, the geometry read straight off the tone (information route).
- **[`E-FND-0022`](../../../test/experiment/foundations/generator-growth.ts)** - the dock is the optimal 4D kissing shell, so greedy densest growth is forced to the 24 directions (growth route), with the open tail that a generic energy minimization does not self-assemble it.
- **[`E-FND-0025`](../../../test/experiment/foundations/generator-selection.ts)** - D4 is the unique simple root system with triality (Dynkin symmetry S3), so crystallographic plus triality plus self-dual plus rank-4 forces the {3,4,3,4} dock (selection route).
- **[`E-FND-0004`](../../../test/experiment/foundations/auto-selection.ts)** - ternary vertices (q=3) plus minimal eternal closure force {5,3,4}, the dodecahedron reaching a compact hyperbolic honeycomb at the tightest r=4, so the golden 5 emerges rather than being assumed.
- **[`E-FND-0067`](../../../test/experiment/foundations/codes-under-the-lattices.ts)** - the committed D4 (24 directions) and E8 are Construction A lifts of the parity code [4,3,2] and the Hamming code [8,4,4], root counts 24 and 240 by enumeration, so the geometric ladder is a code ladder.
- **[`E-FND-0061`](../../../test/experiment/foundations/magic-square-from-ladder.ts)** - the Freudenthal-Tits magic square from the division-algebra ladder, D4 and E8 on one grid with the octonion corner E8 of dimension 248.

## The Standard Model from the seed

Matter, force, the Higgs, and the generation count all descend from the same octonion tower.

- **[`E-FND-0020`](../../../test/experiment/foundations/fermions-from-octonions.ts)** - one generation of Standard-Model fermions from the complexified octonions, with exact color and charges 0, 1/3, 2/3, 1, the Furey construction (three ladder operators, an eight-state Fock space).
- **[`E-FND-0021`](../../../test/experiment/foundations/gauge-group-from-octonions.ts)** - the gauge group SU(3)xSU(2)xU(1) (dims 8+3+1=12) descends from the tower, U(1) from the complexes, SU(2) from the quaternions, SU(3) from the octonion automorphism G2.
- **[`E-FND-0027`](../../../test/experiment/foundations/higgs-from-octonions.ts)** - the Higgs is the quaternionic SU(2) doublet (the internal connection between chiralities), forced by custodial rho=1, completing the Standard Model from the octonion seed.
- **[`E-FND-0054`](../../../test/experiment/foundations/three-generations-cosets.ts)** - three generations are the cosets of B4 in F4, the index [F4:B4]=1152/384=3, a triality element cyclically permutes them, so the knit breaking triality is what makes exactly three, the count forced by the index.

## The full derivation and end-to-end models

The whole chain run as one program, and the committed model run end to end so the pieces are one system, not a pile of one-offs.

- **[`E-FND-0043`](../../../test/experiment/foundations/forced-derivation-ladder.ts)** - the from-nothing derivation as one chain, seven rungs (tone, arrow, eight, census, cell, mesh, law) each recomputing its canonical number by exhaustive enumeration, with the residual leap map stated rather than glossed.
- **[`E-FND-0006`](../../../test/experiment/foundations/capstone.ts)** - the capstone, the committed model runs end to end with every emergent structure read off the same mesh and the same dynamics.
- **[`E-FND-0040`](../../../test/experiment/foundations/unified-model.ts)** - one mesh and one rule produce conservation, life, a finite lightcone, reversibility, memory, and spatial coherence together in one run.
- **[`E-FND-0036`](../../../test/experiment/foundations/one-rule-all-sectors.ts)** - matter, static force, and radiation are three faces of one operator (the graph Laplacian) on one mesh grown by one rule.
- **[`E-FND-0015`](../../../test/experiment/foundations/dsl.ts)** - the model DSL builds the committed model in a few lines and expresses the Lorentz-violating lattice variant by swapping one option.
- **[`E-FND-0018`](../../../test/experiment/foundations/emergent.ts)** - the emergent-mesh Hamiltonian (the graph Laplacian) is local and bounded below at once, beating the reversible-CA trilemma by defining energy on the emergent mesh, not the microscopic step.
- **[`E-FND-0026`](../../../test/experiment/foundations/hamiltonian.ts)** - a reversible cellular automaton gives a permutation Hamiltonian whose spectrum, read off the cycle structure, is bounded below.
- **[`E-FND-0031`](../../../test/experiment/foundations/law.ts)** - scanning reversible rules for a local bounded-below Hamiltonian, measuring the Pauli locality length at two sizes to tell local rules from scramblers.
- **[`E-FND-0032`](../../../test/experiment/foundations/locality.ts)** - the Pauli locality profile of a reversible Hamiltonian (H = i log U expanded in the Pauli basis), validated by a provable control.
- **[`E-FND-0042`](../../../test/experiment/foundations/validation.ts)** - a consolidated validation battery, the reversible even-odd rule is local with a bounded interaction radius, completing per-problem checks.

## Controls, limits, and substrate-generality

Negative controls, the no-fine-tuning signature, the absolute conservation limits, the flat cusp, and the same rule ported across substrates.

- **[`E-FND-0010`](../../../test/experiment/foundations/controls-battery.ts)** - a negative-control battery, each property test catches a deliberately broken rule (reversibility, flatness, parity, gauge), because a test that cannot fail proves nothing.
- **[`E-FND-0012`](../../../test/experiment/foundations/design-signature.ts)** - the rich regime is broad and robust across the rule's rates, so there is no fine-tuning signature and a designer is dispensable.
- **[`E-FND-0001`](../../../test/experiment/foundations/absolute-limits.ts)** - net charge cannot be minted and the lightcone cannot be outrun at ANY coarse-graining level, the two absolute limits that pass up every codec.
- **[`E-FND-0016`](../../../test/experiment/foundations/dynamics-73.ts)** - the directional rule on the {7,3} cell graph conserves charge exactly and gives a z=1 lightcone, and the perception rule churns to a steady state (ported result).
- **[`E-FND-0037`](../../../test/experiment/foundations/s534-dynamics.ts)** - the directional rule streams and conserves charge exactly on the {5,3,4} bulk, the wave churns, and the U(1) Gauss law holds, all positive, the framework fully solvable there.
- **[`E-FND-0009`](../../../test/experiment/foundations/continuum-limit.ts)** - the Myrheim-Meyer dimension estimate converges to the continuum value with shrinking error as N grows.
- **[`E-FND-0029`](../../../test/experiment/foundations/large-n-hardening.ts)** - the sampled dimension estimator matches exact enumeration and sharpens at large N, hardening the continuum claim past N in the tens of thousands.
- **[`E-FND-0019`](../../../test/experiment/foundations/exact.ts)** - exact Boltzmann averages over every causal set on six elements, removing all sampling doubt from the manifold-fraction question.
- **[`E-FND-0041`](../../../test/experiment/foundations/uniform.ts)** - the uniform-measure sampler reproduces the exact manifold fraction at small size, then scales to test whether the smeared action recovers the manifold phase.
- **[`E-FND-0058`](../../../test/experiment/foundations/cusp-observer-stability.ts)** - observers live on the flat cusp by a stability theorem, degree-controlled a packet on the curved bulk disperses over exponentially more cells than on the flat cusp, so bound states persist only on the cusp.
- **[`E-FND-0066`](../../../test/experiment/foundations/event-symmetry-gauge.ts)** - a relational observable is invariant under event relabeling (event symmetry as gauge) but changes under adjacency rewiring (geometry is physical), the Gibbs event-symmetry test.
- **[`E-FND-0034`](../../../test/experiment/foundations/naturalness.ts)** - an aligned shared past violates CHSH while a generic one does not, the naturalness check on where the quantum setting-state correlation comes from.

## What this arena establishes

- **The base is few things.** A ternary tone, one reversible conserving local rule, and the seed that a difference cannot vanish. Reversibility and the wake are the seed restated, not extra premises.
- **The numbers are derived, not fitted.** 3 (the tone), 8 (the dimension), 24 (the cell), 81 (the census), 10395 to 1 (the law), and 3 (the generations) each fall out of an exhaustive enumeration with the survivor counted.
- **The dock is forced many ways.** The 24-cell / {3,4,3,4} substrate is reached independently from the tone shell, a binary code, the Hurwitz quaternions, densest packing, triality selection, and the full 4-polytope battery.
- **The arrow is separate from the mechanism.** The knit is exactly reversible and carries no arrow. Time is the wake, the record-accumulating growth forced by the escape from Poincare recurrence.
- **Quantum is emergent, not put in.** A deterministic reversible base is unitary on configuration space, builds its own complex unit, saturates the quantum speed limits, and forbids cloning.
- **The Standard Model descends from the seed.** The gauge group, one fermion generation, the Higgs, and the count of three generations all come off the octonion tower the reversible dynamics forces.

## License

MIT

## ClueSurf

Part of the ClueSurf project.
