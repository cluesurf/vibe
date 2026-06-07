# Open Questions

The load-bearing open problems of the Vibe Theory discrete-spacetime program, as
they stand now that the `vibe-test` testbed exists and the first experiments have
run. Each question links to the experiment that probes it and its current status.

This folder is the working, code-aware record of the open problems: what we can now
measure, what we have found, and what is still open. Findings are in
`note/experiment/results/`.

## Status at a glance

| Question | Experiment | Status |
|---|---|---|
| P1. A local, bounded-below Hamiltonian | `p1-hamiltonian`, `p1-locality`, `p1-law`, `p1-emergent` | **resolved**: a trilemma for the CA log, solved by the emergent-mesh Hamiltonian (Laplacian) |
| P2. A dynamics that favors manifold-like order | `p2-exact`, `p2-uniform`, `p2-tempering`, `p12-free-energy` | **solved at scale**: first-order transition, smeared action makes manifold spacetime a stable phase at N=128, and the free-energy crossing (P12) shows it DOMINATES above a finite coupling (large-N beta-star scaling open) |
| P3. Addressing versus Lorentz | `p3-study`, `validation`, `p3-growth` | **candidate solved**: all three at once, navigability 100 percent, and stable under mesh growth |
| P4. The monist spinor and chirality | `p4-spinor`, `p4-topology`, `p4-chirality` | **validated**: zero modes = Betti sum, overlap operator threads the chirality wall |
| P5. The Hauptvermutung | `p5-hauptvermutung`, `validation` | **validated** sharp in dimension and proper time, proof still open |
| P6. A computable 2D path integral | `p6-dimension`, `p2-uniform` | **solved at scale**: 2D specialisation of P2, the stable manifold phase is genuinely 2D (MM dimension 2.0-2.1) |
| P7. Quantum from a classical base | `p7-bell`, `p7-naturalness`, `p7-alignment`, `p7-dynamics` | quantified: aligned bits not bits, and in a natural mesh the violation decays with separation (the residual tension) |
| P8. One gauge field and one charged fermion | `p8-confinement`, `p8-index`, `p8-schwinger`, `p8-su2-condensate` | **validated** A-C, index theorem, Schwinger condensate, and the SU(2) (non-Abelian) condensate rung |
| P9. Experience | `p9-integration` | only the structural correlates, by design |
| P10. Cosmological constant | `p10-cosmological-constant` | progress: smeared action tames the fluctuation problem so the implied Lambda shrinks with volume (everpresent-like), exact exponent open |
| P11. Lorentz invariance of the dynamics | `p11-lorentz-dynamics` | clarified: rotational invariance emerges in the IR on both lattice and random mesh, the clean substrate distinction is P3 |
| P12. Free-energy crossing (closes P2) | `p12-free-energy`, `p12-wang-landau` | **measured**: Wang-Landau gives a crossing beta-star about 0.14, roughly N-independent. Manifold spacetime DOMINATES the sum over histories above it (N=64+ compute-bound) |
| P13. Arrow of time and cosmology | `p13-cosmology`, `p13-expansion`, `p13-growth-expansion` | arrow validated. Expansion **demonstrated** both from a de Sitter geometry and **emerging from a pure local growth rule** (net birth > 1, rate = 1+q). Fully emergent spatial geometry still open |
| P14. Mass and the spectral gap | `p14-mass` | **validated** (one rung): a mass term gives gap = m and the relativistic dispersion E^2 = p^2 + m^2 |
| P15. Entanglement area law (holography) | `p15-entanglement` | **validated** (one rung): 1D conformal log law (c = 1) and 2D area law (boundary beats volume) |
| P16. Newtonian limit (gravity) | `p16-newtonian` | **validated** (one rung): the static potential is confining in 1D, log in 2D, Newtonian 1/r in 3D (R^2 0.997) |
| P17. Quantum coherence (quantum) | `p17-quantum-walk` | **validated** (one rung): a quantum walk is ballistic (t) vs classical diffusive (sqrt t), interference on the mesh |
| P18. Dark matter | `p18-dark-matter` | **mechanism shown**: nonlocal gravity flattens the rotation curve (ratio 0.23 local vs 1.29 nonlocal), no dark particle |
| P19. Dark energy in 4D | `p19-dark-energy-4d` | 4D action-fluctuation scaling measured. Sharp action has the fluctuation problem, everpresent shrinking needs the 4D smeared kernel (shown in 2D, P10) |
| P20. The photon | `p20-photon` | **validated**: the free U(1) gauge field is massless, gauge-invariant, two transverse polarizations |
| P21. The graviton | `p21-graviton` | **validated**: massless spin-2, two transverse-traceless polarizations (a massive spin-2 has five) |
| P22. The Higgs | `p22-higgs` | **validated**: spontaneous symmetry breaking gives a nonzero vacuum value and a photon mass (g v)^2 |
| P23. Gauge operator from the action | `p23-gauge-from-action` | **validated**: the Maxwell (photon) operator is the small-field limit of the Wilson gauge action, not put in by hand |
| P24. Graviton from the action | `p24-graviton-from-action` | **validated**: the linearized Einstein operator (second variation of the action) is diffeo-invariant with two massless spin-2 modes |
| P25. Electroweak breaking | `p25-electroweak` | **validated**: a Higgs doublet breaks SU(2) x U(1) to U(1)_EM, reproducing the W, Z masses and the Weinberg angle |
| P26. Swerves (observational) | `p26-swerves` | **demonstrated**: a particle on a causal set undergoes momentum diffusion (rapidity variance grows with proper time), a distinctive signature with no continuum analogue |
| P27. Lorentz violation (observational) | `p27-lorentz-violation` | **distinctive**: a lattice has energy-dependent LIV, the random sprinkling is Lorentz-safe (no preferred frame), so the framework predicts the observed null LIV |
| P28. Singularity resolution | `p28-singularity-resolution` | **demonstrated**: discreteness gives a minimum length, so curvature is capped at a finite value (no big-bang or black-hole infinity) |
| P29. Dark energy in 4D (smeared) | `p29-dark-energy-smeared` | progress: the 4D smeared kernel tames the fluctuation (implied Lambda exponent 0.16 to 0.06, the everpresent direction), full shrinking needs the dynamical model |
| P30. Inflation | `p30-inflation` | **demonstrated**: a time-varying birth rate gives a burst of rapid expansion (4.2 e-folds) with a graceful exit, no inflaton put in by hand |
| P31. Quantum formalism | `p31-quantum-formalism` | down-payment: unitarity (norm conserved), interference (amplitudes add), and a conserved Born probability. Deriving why |psi|^2 is open |
| P32. Einstein equations | `p32-einstein-equations` | down-payment: the Einstein tensor is transverse (conservation built in), reduces to Newton (static), and propagates a massless graviton at the speed of light |
| P33. Black-hole entropy | `p33-black-hole` | **demonstrated**: entanglement entropy scales with horizon area, not volume (Bekenstein-Hawking S = A/4) |
| P34. Capstone (the model run end-to-end) | `p34-capstone` | **demonstrated**: one growing random hyperbolic mesh with the ternary signed-majority rule yields Lorentz-safe geometry, exponential reach, convergent ternary dynamics, the bounded-below local Hamiltonian, and the arrow, all at once |
| P35. Contact with data | `p35-contact-with-data` | **the framework meets observation**: the everpresent Lambda matches the observed dark energy to order of magnitude (ratio 0.53), no linear Lorentz violation (confirmed by GRB timing), the swerve below current bounds |
| P36. The model DSL | `p36-dsl`, `code/model/vibe.ts` | **a tool**: the committed model in a few fluent lines (vibe()...), prints at a glance, builds, runs, reads off the physics, and a one-word swap expresses the lattice (Lorentz-violating) variant |
| P37. One rule, propagation | `p37-one-rule-propagation` | **demonstrated**: the ternary rule itself carries a strict causal light-cone (one hop per beat), the signal sector from the one dynamics |
| P38. Emergent spatial geometry | `p38-emergent-spatial-geometry` | progress: a coexisting slice has a definite spatial dimension below spacetime, rising by ~1 from 2D to 3D (the d-1 trend), absolute value biased low |
| P39. Non-random substrate | `p39-deterministic-substrate`, `code/substrate/hyperbolic-graph.ts` | **demonstrated**: the deterministic golden-angle sunflower is as Lorentz-safe as the random sprinkle (anisotropy 0.049 vs 0.070), exponential reach, no randomness |
| P40. Non-random substrate family | `p40-non-random-substrates` | **demonstrated**: the sunflower, Halton disc, and regular {7,3} and {5,4} tilings are all Lorentz-safe (only the flat lattice is not). Curvature, not disorder, buys Lorentz safety |
| P41. Margenstern tilings surveyed | `p41-margenstern-tilings` | **demonstrated**: both Margenstern families, {p,4} (5,6,8) and {p,3} (7,8,9), are Lorentz-safe with exponential reach. See also the Fibonacci-coordinate and universality notes |
| P42. Fibonacci-tree navigation | `p42-fibonacci-navigation` | **demonstrated**: routing by tree-address arithmetic on the heptagrid delivers 100% exactly, locally, and efficiently (mean stretch 1.35), so the tilings are Lorentz-safe AND exactly addressable |
| P43. Freedom and choice | `p43-freedom-choice` | **solved structurally**: a choice is determined (reproduces, not random) yet jointly authored by self and urge, self-authored with agency scaling by structure, and computationally irreducible (settles over beats, not one-step) |
| P44. Computational universality | `p44-universality` | **demonstrated**: the signed-majority rule realizes NAND (functionally complete), builds a correct full adder, and expresses the universal Rule 110, so with the addressable tilings the substrate is Turing-complete |
| P45. Dodecagrid {5,3,4} (3D honeycomb) | `p45-dodecagrid` | **demonstrated**: Margensterns 3D hyperbolic honeycomb of right-angled dodecahedra is Lorentz-safe (anisotropy 0.075) with exponential reach, while a flat cubic lattice is not. Curvature scrambles direction in 3D too |
| P46. Dynamical everpresent Lambda | `p46-everpresent-dynamical` | **solved**: the conjugate-volume model gives delta-Lambda ~ V^-0.5 (the everpresent shrinking), closing the dark-energy direction the static action only approached (P19 +0.16, P29 +0.06, P46 -0.50) |
| P47. Coxeter unification | `p47-coxeter-unification` | **demonstrated**: {7,3}, {5,4}, {8,3}, {6,4}, and {5,3,4} all come from one generator (coxeterTessellation) by changing the Schlafli symbol, all Lorentz-safe. The base is the reflection-group principle, not a chosen tiling |
| P48. The modular base | `p48-modular-base` | **demonstrated**: the parameter-free modular group PSL(2,Z) tessellation is Lorentz-safe, generated by the deterministic Stern-Brocot automaton, addressed by continued fractions, with the golden ratio as its central geodesic |
| P49. Crystal hidden and hierarchical | `p49-crystal-hidden-hierarchical` | **demonstrated**: a hyperbolic crystal is indistinguishable from a random foam by a local observer (both unlike a flat lattice) and is tree-like (Gromov delta 1.5 vs 19.0), so order at the base is undetectable from inside and natively hierarchical |
| P50. Golden ratio and order-with-freedom | `p50-golden-and-free` | **demonstrated**: phi agrees from three independent sources (continued fraction, Fibonacci, pentagon geometry), and the ordered crystal dynamics is determined yet computationally irreducible, reconciling order and freedom |
| P51. The full integer ladder | `p51-full-ladder` | **demonstrated**: one pipeline builds the canonical base end to end, from integer generator data, through a deterministic automaton, to the tessellation, to the vibe model running on it, Lorentz-safe and reproducible, for the modular group and the {7,3} and {5,4} crystals |
| P52. The continuum limit | `p52-continuum-limit` | **demonstrated**: the dimension estimate agrees with the continuum value to about one percent at all N (2D and 3D), shrinking as a negative power of N where there is room |
| P53. Coarse-graining fixed point | `p53-coarse-graining-fixed-point` | **demonstrated**: the dimension is invariant under repeated decimation, so the continuum dimension is a renormalization fixed point, stable at every scale |
| P54. Large-N hardening (performance) | `p54-large-n-hardening` | **demonstrated**: a sampled O(N) dimension estimator agrees with the exact one and reaches N = 100000, where the continuum-limit error keeps shrinking, hardening the continuum claim at scale |
| P55. One rule, all sectors | `p55-one-rule-all-sectors` | **demonstrated** (bosonic): one mesh built by the rule and the single emergent operator on it yield the matter (spectrum), force (static potential), and radiation (light-cone) sectors in one run. Fermionic and gauge sectors are the remaining integration |
| P56. The eternal ladder | `p56-eternal-ladder` | **demonstrated**: the integer ladder grows without bound (modular and {7,3}), stays Lorentz-safe at every stage, and the committed model runs on the growing substrate at every stage |
| P57. Recursion (higher vibes) | `p57-recursion` | **demonstrated** (structural): a mesh coarse-grains to a higher vibe that is a derived aggregate of the micro-tones (no stored layer), the same kind of object (ternary, Lorentz-safe), stable because the micro-self is, towering to another level. The emergent macro-rule is partial, the open frontier |

The next-version problem set (P10 to P17) is in `next-version.md`. The broader
frontiers, including the dark sector (P18, P19) and the field-coverage map (P20), are
in `frontiers.md`.

## The questions

### P1. Can a local rule have a bounded-below Hamiltonian that is also local?

Now characterised as a **trilemma**. A scan of reversible rules shows the
principal (minimal-energy) Hamiltonian is nonlocal for every nontrivial rule, with
range growing as the system grows. But an explicit **local branch** exists for
commuting-gate rules (H = sum of block logs), with bounded locality length and a
bounded-below spectrum. Putting these together: **local, bounded below, and
information-propagating cannot all three hold at once** for a reversible CA's own
log. **Resolved** by not using the log at all: the emergent-mesh Hamiltonian (the
graph Laplacian) is local (range 1, size-independent), bounded below (spectrum from
0), and propagating (finite-speed lightcone) all at once (see
`note/experiment/results/p1-law.md` and `p1-emergent`). The rule builds the
geometry (P2), and the quantum dynamics is the local operator on it. The rule and
emergent time are distinct objects.

### P2. What dynamics makes manifold-like causal sets dominate?

Progress. The sharp Benincasa-Dowker action fails (it drives the ensemble to
layered Kleitman-Rothschild orders, height ratio 0.29, dimension 3.45). The
**smeared** action fixes it: with a nonlocal kernel that averages over about
1/eps order-layers, the ensemble becomes near-2-dimensional and non-layered
(height ratio about 1, dimension about 2 to 2.7), close to a true 2D sprinkling,
robustly across smearing scales eps in [0.8, 0.99] and at two sizes
(`p2-dynamics.md`). And warm-start runs show the manifold phase is a **stable
basin**: started from a sprinkling, the smeared dynamics keeps the height ratio at
about 1.9 across all beta, started from a layered order it climbs from 0.35 toward
1.0, and the sharp action erodes the manifold start from 1.89 to 1.51
(`p2-transition.md`). The decisive step was a **correct uniform-measure sampler**
(single-pair toggle, accept only if still transitive), validated exactly against
enumeration. It reaches the large-N entropic regime (at beta = 0 the layered
Kleitman-Rothschild orders take over by N = 64) and demonstrates a **first-order
transition** at N = 128: the smeared action makes manifold-like spacetime a stable
phase that coexists with the layered phase (a warm sprinkling start stays manifold
at beta >= 1, a cold start stays layered), where at beta = 0 only the layered phase
is stable (`p2-uniform.md`). So the dynamics makes a stable spacetime phase that decays
without the action, the key step for Vibe Theory. **Remaining nuance:** the
free-energy crossing that says which phase strictly dominates at a given coupling, by
thermodynamic integration or tempering across the barrier.

### P3. Can one substrate have reach, Lorentz invariance, and navigation at once?

The most Vibe-Theory-specific question, and the one where we made the most
progress. A connected hyperbolic random graph (mean degree about 11) has
exponential reach, near-zero anisotropy (Lorentz-safe), and 98 percent
greedy-routing success, all at once. See
`note/experiment/results/p3-both-worlds.md`. The candidate answer: you do not
choose between a computable mesh and a relativistic one. You trade exact Fibonacci
addressing for greedy geometric routing on a random, Lorentz-safe, exponentially
reaching graph. Routing reaches 100 percent with backtracking, and the property is
now shown to **survive growth**: across an eightfold expansion of the mesh at
constant density (radius 5.7 to 7.8), reach, Lorentz isotropy, and navigability all
persist (`note/experiment/results/p3-growth.md`). **Remaining:** a microscopic
one-node-at-a-time growth rule coupled to causal graph dynamics.

### P4. Is the spinor built from vibes, and is its spin topological?

Yes, and the spin is topological, and the chirality wall is threaded. The
Kahler-Dirac zero modes are built entirely from cell tones (monism holds), and
their count equals the surface Betti sum: disk 1, cylinder 2, torus 4, validated
exactly. And the chirality wall (Nielsen-Ninomiya) is now threaded: the **overlap
operator** gives a single fermion species with **exact lattice chiral symmetry**
(Ginsparg-Wilson residual 6e-16, machine zero) and no doublers, where the naive
operator has 4 doublers and Wilson removes them only by breaking chiral symmetry
(see `note/experiment/results/p4-chirality.md`). **Remaining open:** coupling the
chiral overlap fermion to the confining SU(2) field of Stage C (a lattice chiral
gauge theory, an active research problem), and the 4D case.

### P5. Is the recovered geometry unique (the Hauptvermutung)?

Eight sprinklings of the same spacetime recover the dimension with standard
deviation under 0.05. Strong empirical support that the continuum approximation of
a causal set is essentially unique. The conjecture itself is unproven (it is open
in the literature too). **Next:** check the variance of distances and curvature,
not just dimension, and attempt the converse (no single order matching two
different spacetimes).

### P6. Can the Lorentzian sum over histories be made computable?

Yes, and it lands on 2D orders. P6 is the 2D specialisation of P2, and the P2
apparatus (the 2D smeared action, the correct uniform-measure sampler) is already
2D. So P6 inherits the P2 first-order transition, and the stable manifold phase is
genuinely 2-dimensional: warm-started from a 2D sprinkling at scale, its
Myrheim-Meyer dimension sits at 2.0 to 2.1 (N = 64 to 128), confirmed by the
small-N exact enumeration too (`p6-dimension.md`, `p2-uniform.md`). The earlier
non-2D result (dimension 3.26) used the broken sampler and is superseded.
**Remaining:** shares P2's free-energy crossing and the continuum-limit proof (B1).

### P7. Can a classical discrete base reproduce quantum statistics?

The deepest question for the framework, and we turned it into a number. With
independent settings the local model respects the classical CHSH bound (S near 1).
As the settings are correlated with the hidden state, S climbs through the bound 2,
past the quantum Tsirelson bound, to the algebraic maximum 4. So superdeterminism
CAN fake (and exceed) quantum correlations, and the cost is quantified: a given
amount of statistical-independence violation buys a given amount of CHSH
violation. The naturalness question is now made precise. Determinism (monism, no
hidden state) makes violation possible: it denies the statistical-independence
assumption that blocks local hidden variables, so at full shared-past fraction the
aligned model reaches the quantum value and beyond. But a **generic** shared past
gives no violation (the random-correlation control stays near classical at every
sharing fraction). So monism opens the door, but the mesh must produce the
**specific aligned** correlation, not just any correlation. And from dynamics: in a
natural causal mesh the shared past of spacelike measurements shrinks with
separation, so the violation DECAYS with separation (S falls from 4 to classical
over a couple of correlation lengths), whereas quantum violation is
separation-independent (`note/experiment/results/p7-naturalness.md`). **Remaining
open:** whether any natural mesh evades this decay without fine-tuning, the contested
heart of superdeterminism.

### P8. Can we get one gauge field and one charged fermion?

Yes, for Stages A, B, and C, plus the index theorem. A U(1) gauge field couples to
the Kahler-Dirac fermion (charged spectrum shift, Aharonov-Bohm phase linear in
charge). 3D SU(2) lattice gauge theory **confines**: the string tension (Creutz
ratio) is positive at every coupling and falls from 1.32 to 0.40 as beta rises,
the Wilson area law of the strong force (`p8-confinement.md`). And the chiral
overlap fermion **sees gauge topology exactly**: in a U(1) background of charge Q,
its index equals -Q exactly, an integer, the lattice Atiyah-Singer index theorem
(`p8-index.md`). And in a DYNAMICAL gauge field (the 2D Schwinger model) a chiral
condensate forms from the anomaly: zero in the free theory, nonzero and growing
with the gauge coupling (`p8-schwinger.md`). So the chiral fermion now feels the
field, its topology, and forms a condensate. And the non-Abelian rung is reached: a chiral
overlap fermion in a dynamical SU(2) field also forms a condensate (zero free,
nonzero gauged, `p8-su2-condensate.md`). **Remaining open:** the precise Schwinger
condensate value, and the genuinely open Weyl-projected chiral gauge theory and the
Standard Model content (Stage E).

### P9. What is the relationship between structure and experience?

We can locate the structural correlates of a self (a well-screened, well-
integrated region) but not experience itself. This is the framework's own
distinctive claim and the honest boundary of what physics can deliver. **Next:**
sharpen the integration measure and state precisely what it does and does not
capture.

## Where to push next

Now that P1, P3 (navigability), P4 (topology and chirality), P5, P7, and P8
(Stages A, B, C including SU(2) confinement) are validated, the open frontier in
priority order:

1. **Chiral gauge theory** (Stage D into E): the index theorem is done (the chiral
   fermion sees gauge topology, index = -Q). Next is the dynamical and non-Abelian
   coupling: the overlap fermion in the fluctuating SU(2) field (the fermion
   determinant, the chiral condensate), then the full chiral projection. This is
   the real path toward the Standard Model and is genuinely hard (lattice chiral
   gauge theory is an open research problem), so even partial progress is
   significant.
2. **P2 / P6 free-energy crossing**: the correct uniform sampler now shows a
   first-order transition (manifold spacetime is a stable phase at scale). The
   remaining refinement is which phase strictly dominates at a given coupling, by
   thermodynamic integration or tempering across the barrier, plus finite-size
   scaling. The hard part (a stable manifold phase from the dynamics) is done.
3. **P3 microscopic growth rule**: the both-worlds property already survives an
   expanding mesh at constant density. The refinement is a one-node-at-a-time local
   attachment rule coupled to causal graph dynamics.
4. **P7 alignment from dynamics**: determinism makes violation possible, but the
   correlation must be aligned, not generic. The open step is to derive an aligned
   setting-state correlation from actual mesh dynamics, which would complete the
   quantum link.
