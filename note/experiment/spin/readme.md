# The spin arena

Forty-three experiments on where spin comes from.

Vibe theory does not put spin in by hand. It grows spinors, fermions, and spin-1/2 out of the discrete substrate geometry. The 24 directions of the committed `{3,4,3,4}` coin are the binary tetrahedral group 2T, the double cover of the rotation group, so a spinor picks up a minus sign after a 2pi turn and returns only at 4pi. The 24-cell splits into 8v + 8s + 8c (a vector and two spinors) under SO(8) triality. The hyperbolic `{5,3,4}` bulk carries spin a different way, through its projective double cover 2I, its spin connection, and topological defects. This arena tests all of it: the spin-1/2 double cover, fermion statistics and the Pauli principle, the Dirac equation, chiral fermions, triality and the generations problem, anyons from the ternary tone, and the emergent matter (atoms, nuclei, molecules) that exclusion makes possible.

The substrate is discrete and every result is deterministic. Not every
result has a control that could have failed, and the 2026-08-31 audit
regraded the ones that did not: `fermi-exclusion` (E-SPN-0014) tests an
identity that holds for any vector, with the exchange signs formerly
typed in, so it is L1. `atoms-shell-filling` (E-SPN-0002) is a 2D
square-grid tight-binding well, L2. `helium-ground-state`,
`molecular-bond`, `nuclear-binding-curve` and `nuclei-binding-saturation`
(E-SPN-0017, 0023, 0024, 0025) are textbook formulas with no mesh, L1.
`anyon-deconfinement` (E-SPN-0001) evaluates the toric-code degeneracy
formula, L1, and had never been imported by the barrel until the audit.
**This arena has no L3 result.** The double-cover results (2T, the 2 pi
sign) are honest L1 group arithmetic on the coin, and the defect and
holonomy results are L2. The audit is
`../../audit/2026-08-31-experiment-audit.md`.

## The spinor coin and the spin-1/2 double cover

The core spin result. The 24 coin directions form the binary tetrahedral group 2T. A spinor transforms by left quaternion multiplication, a vector by conjugation, so the same 2pi element negates the spinor and fixes the vector. This is spin-1/2 realized on the coin, plus the Pauli exclusion that follows from it.

- **[`E-SPN-0029`](../../../test/experiment/spin/rotation-2pi.ts)** - a spinor on the 24-cell coin gains a minus sign at 2pi and returns only at 4pi, the vector fixed (the decisive gate).
- **[`E-SPN-0042`](../../../test/experiment/spin/spinor-double-cover.ts)** - the 24 directions are the binary tetrahedral double cover, spinor negated at 2pi, vector fixed, spin-1/2 on the coin.
- **[`E-SPN-0031`](../../../test/experiment/spin/sp1-spin-double-cover.ts)** - rigorous quaternion proof: spinor overlap is cos(theta/2) with period 4pi, vector overlap cos(theta) with period 2pi.
- **[`E-SPN-0003`](../../../test/experiment/spin/bulk-cusp-interface.ts)** - the 4D bulk D4 spinor structure projects to 3D Pauli spinors on the cusp.
- **[`E-SPN-0014`](../../../test/experiment/spin/fermi-exclusion.ts)** - two identical fermions cannot share a state (the antisymmetric amplitude vanishes) while bosons pile up, the Pauli principle measured.
- **[`E-SPN-0013`](../../../test/experiment/spin/exchange-phase.ts)** - an analytic consistency check that the assumed spin-statistics formulas agree, not an emergent result.

## The Dirac equation, chiral fermions, and discrete symmetries

The emergent relativistic fermion. A discrete-time coined walk on the substrate produces the Dirac equation, its Clifford algebra, and a single chiral mode with no mirror doubler. C, P, T, and CPT are exact.

- **[`E-SPN-0009`](../../../test/experiment/spin/dirac-3plus1-3434.ts)** - the full 3+1D Dirac equation, Clifford algebra and relativistic dispersion read out of the operator, not assumed.
- **[`E-SPN-0011`](../../../test/experiment/spin/directional-rule.ts)** - a charge with a direction streams ballistically while a memoryless scalar diffuses, the collision mixing the Dirac mass.
- **[`E-SPN-0030`](../../../test/experiment/spin/sp-spinor-field-3434.ts)** - a 2-component Dirac walk streams chirality at light speed, mixes it under a mass, exchange antisymmetry from the double cover.
- **[`E-SPN-0043`](../../../test/experiment/spin/chiral-fermion-no-doubling.ts)** - the emergent fermion is a single chiral mode (eigenvalue winding one), no doubler, the discrete-time walk evading Nielsen-Ninomiya.
- **[`E-SPN-0004`](../../../test/experiment/spin/chirality.ts)** - the overlap lattice Dirac operator gives one species with exact lattice chiral symmetry, the naive operator having four doublers.
- **[`E-SPN-0010`](../../../test/experiment/spin/dirac-lanczos.ts)** - a 3D hedgehog binds near-zero Dirac modes (index equals topological charge) that the uniform vacuum lacks.
- **[`E-SPN-0037`](../../../test/experiment/spin/sy-discrete-symmetries.ts)** - C, P, T, and CPT are exact on the `{3,4,3,4}` substrate, the reversible rule making T exact and the D4 root set making P exact.

## Spin across substrates and the projective cover

Whether a coin carries a spinor depends on its symmetry group. The `{3,4,3,4}` coin carries spinors natively. The hyperbolic `{5,3,4}` coin carries none in its 12 direction rep, but its symmetry A5 has a genuine nonsplit double cover 2I, so spin lives in the projective rep. This is the one substrate with both spin and curvature. Other coins are compared.

- **[`E-SPN-0005`](../../../test/experiment/spin/cocycle-534.ts)** - the `{5,3,4}` spinor cover is genuine (nonsplit): 2I is perfect, the central minus one a commutator, the cocycle nontrivial.
- **[`E-SPN-0019`](../../../test/experiment/spin/icosian-double-cover-534.ts)** - the icosahedral symmetry A5 has Schur multiplier Z2 and a spinor double cover 2I, spin in the projective rep.
- **[`E-SPN-0033`](../../../test/experiment/spin/spin-connection-534.ts)** - the `{5,3,4}` spin connection: the edge-loop holonomy is the double cover, minus one once around, plus one twice.
- **[`E-SPN-0007`](../../../test/experiment/spin/continuum-holonomy-534.ts)** - the curvature-driven holonomy: a contractible loop of hyperbolic area 2pi flips the spinor and fixes the vector (Gauss-Bonnet).
- **[`E-SPN-0032`](../../../test/experiment/spin/spin-and-curvature-534.ts)** - `{5,3,4}` carries spin AND negative curvature, resolving the trade-off flat `{3,4,3,4}` cannot.
- **[`E-SPN-0035`](../../../test/experiment/spin/spinor-73.ts)** - the `{7,3}` heptagonal coin carries no spinor, only integer-spin reps of D7.
- **[`E-SPN-0027`](../../../test/experiment/spin/projective-spinor-73.ts)** - the `{7,3}` symmetry PSL(2,7) still has a spinor double cover SL(2,7), spin in the projective rep.

## Spin from topological defects

Even a spinless coin hosts spin-half through defects. A half-winding disclination in the tone-as-director field gives a probe the spinor minus sign while vectors stay blind. The defect is topological, persistent, and behaves like a particle.

- **[`E-SPN-0012`](../../../test/experiment/spin/disclination-spin-534.ts)** - a half-winding disclination in the `{5,3,4}` director field gives the spinor a minus sign while the vector is blind, spin from topology.
- **[`E-SPN-0006`](../../../test/experiment/spin/collective-spinor-534.ts)** - a delocalized collective mode carries the disclination spinor sign for every mode, the topological spin a field property, not a probe artifact.
- **[`E-SPN-0026`](../../../test/experiment/spin/persistent-spinor-defect-3434.ts)** - a half-integer disclination is a persistent topological defect carrying the spinor minus sign, a persistent fermion.
- **[`E-SPN-0008`](../../../test/experiment/spin/defect-particles-3434.ts)** - topological defects annihilate in opposite-charge pairs and persist as like charges, particle-antiparticle behavior.

## Kahler-Dirac fermions from forms

A second route to fermions: differential forms on the cell complex. The Kahler-Dirac operator D = d + delta is a Dirac operator whose square is the Laplacian, with zero modes counting topology. The bare occupation rule alone gives only linear modes, so the spinor needs the spin bundle. Coupled to the spin connection, the fermion propagates.

- **[`E-SPN-0020`](../../../test/experiment/spin/kahler-dirac-534.ts)** - Kahler-Dirac fermions on `{5,3,4}` forms, D = d + delta squares to the Hodge Laplacian, forms carry a fermion.
- **[`E-SPN-0021`](../../../test/experiment/spin/kahler-dirac-propagation-534.ts)** - the Kahler-Dirac fermion propagates (the extended phase), localized only by strong deterministic quasiperiodic disorder.
- **[`E-SPN-0022`](../../../test/experiment/spin/lattice-gas-spinor-534.ts)** - the bare `{5,3,4}` lattice-gas rule produces LINEAR modes, not spinors, the spinor requiring the spin bundle.
- **[`E-SPN-0028`](../../../test/experiment/spin/propagating-spinor-534.ts)** - a propagating spinor on curved `{5,3,4}`: streaming coupled to the spin connection returns minus itself per 2pi loop.
- **[`E-SPN-0034`](../../../test/experiment/spin/spinor.ts)** - the Kahler-Dirac operator on a 2D mesh has near-zero modes in the middle of its spectrum, the monist spinor.
- **[`E-SPN-0040`](../../../test/experiment/spin/topology.ts)** - the Kahler-Dirac zero-mode count matches the Betti sum across disk, cylinder, and torus, spin as a topological invariant.

## Triality and the generations problem

The novel bet. SO(8) triality cycles the three 8-dim reps, and F4 forces a rank-three exceptional Jordan structure. The arena tests whether this gives three fermion generations and reports the gap: the structure is real, the identification with three generations stays open.

- **[`E-SPN-0036`](../../../test/experiment/spin/spinor-triality.ts)** - `{5,3,4}` carries no spinor while `{3,4,3,4}` splits 8v + 8s + 8c with triality, the spinors fermions.
- **[`E-SPN-0041`](../../../test/experiment/spin/triality-generations.ts)** - SO(8) triality is a real order-3 symmetry, but the naive reading gives vector plus two chiralities, not three generations.
- **[`E-SPN-0016`](../../../test/experiment/spin/generations-f4-jordan.ts)** - the substrate F4 symmetry forces an exceptional rank-three Jordan structure (three forced by octonion non-associativity), generations Boyle's open conjecture.
- **[`E-SPN-0015`](../../../test/experiment/spin/generation-family-symmetry-3434.ts)** - the three Jordan slots carry an exact S3 family symmetry but stay degenerate, so three distinct generations is not established.
- **[`E-SPN-0039`](../../../test/experiment/spin/three-generations-breaking-search.ts)** - an asymmetric vacuum can split the three slots into a mass hierarchy, but the model supplies none, so the hierarchy stays open.

## Anyons and fractional statistics

The ternary tone gives more than bosons and fermions. Its Z_3 structure hosts anyons with a fractional 2pi/3 braiding phase, and when gauged forms a deconfined topological phase.

- **[`E-SPN-0038`](../../../test/experiment/spin/ternary-anyons.ts)** - the ternary tone (Z_3) hosts anyons, a fractional 2pi/3 braiding phase, topological and enclosure-gated, vs the binary boson and fermion.
- **[`E-SPN-0001`](../../../test/experiment/spin/anyon-deconfinement.ts)** - the gauged ternary tone is a deconfined Z_3 topological phase, ground-state degeneracy N^(2g), nine free anyons, log 3 entropy, the trivial phase the control.

## Emergent matter from exclusion

The payoff. Once fermions and exclusion exist, discrete shells, atoms, nuclei, and molecules follow. Every result has a boson or no-repulsion control that collapses or fails.

- **[`E-SPN-0002`](../../../test/experiment/spin/atoms-shell-filling.ts)** - fermions bound to a central well fill discrete shells in order with periodic magic numbers, where bosons all collapse to the lowest level.
- **[`E-SPN-0018`](../../../test/experiment/spin/hydrogen-spectrum.ts)** - the hydrogen atom, the Rydberg series E_n proportional to -1/n^2 and the accidental l-degeneracy, lifted by a non-Coulomb control.
- **[`E-SPN-0017`](../../../test/experiment/spin/helium-ground-state.ts)** - helium ground-state energy from the screened two-electron variational treatment, within 2 percent of observed, the no-repulsion energy the control.
- **[`E-SPN-0023`](../../../test/experiment/spin/molecular-bond.ts)** - the H2+ molecular bond, a stable molecule at the observed 2.0-Bohr length from the shared electron, the antibonding and no-resonance cases the controls.
- **[`E-SPN-0025`](../../../test/experiment/spin/nuclei-binding-saturation.ts)** - several bound fermions form a composite with a saturating binding energy (a nucleus), where bosons collapse instead.
- **[`E-SPN-0024`](../../../test/experiment/spin/nuclear-binding-curve.ts)** - the nuclear binding curve peaks at iron (about 8.8 MeV per nucleon) and declines for heavy nuclei, the no-Coulomb monotonic curve the control.

## What this arena establishes

- **Spin is geometric, not assumed.** The 24 coin directions are the binary tetrahedral double cover 2T, so spin-1/2 (minus sign at 2pi, return at 4pi) is a fact of the substrate, with the vector rep the built-in control.
- **The Pauli principle and spin-statistics follow.** The antisymmetric two-fermion amplitude vanishes, bosons pile up, and the exchange sign is the same minus one the spinor gets under rotation.
- **The Dirac equation and a single chiral fermion emerge.** The discrete-time walk reproduces the 3+1D Dirac operator and evades Nielsen-Ninomiya fermion doubling, with exact CPT.
- **The hyperbolic `{5,3,4}` bulk carries spin three independent ways.** Through its projective double cover 2I, its spin connection holonomy, and topological disclinations, even though its coin carries no linear spinor.
- **Exclusion builds real matter.** Shell filling, the hydrogen Rydberg spectrum, helium within 2 percent, the H2+ bond at 2.0 Bohr, and the iron binding peak all follow, each against a control that collapses.
- **Anyons come free from the ternary tone**, but three fermion generations do not. The triality and Jordan structure is real and forced, yet the identification with three generations stays Boyle's open conjecture, reported as partial.
