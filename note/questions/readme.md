# Open Questions

The load-bearing open problems of the Vibe Theory discrete-spacetime program, as
they stand now that the `vibe-sim` testbed exists and the first experiments have
run. Each question links to the experiment that probes it and its current status.

For the full problem statements and attack plans see the monorepo spec at
`note/research/vibe/research/open-problems-and-how-to-solve-them.md`. This folder
is the working, code-aware version: what we can now measure, what we have found,
and what is still open.

## Status at a glance

| Question | Experiment | Status |
|---|---|---|
| P1. A local, bounded-below Hamiltonian | `p1-hamiltonian`, `p1-locality`, `p1-law`, `p1-emergent` | **resolved**: a trilemma for the CA log, solved by the emergent-mesh Hamiltonian (Laplacian) |
| P2. A dynamics that favors manifold-like order | `p2-exact`, `p2-uniform`, `p2-tempering` | **solved at scale**: first-order transition, smeared action makes manifold spacetime a stable phase at N=128 (free-energy crossing remains) |
| P3. Addressing versus Lorentz | `p3-study`, `validation`, `p3-growth` | **candidate solved**: all three at once, navigability 100 percent, and stable under mesh growth |
| P4. The monist spinor and chirality | `p4-spinor`, `p4-topology`, `p4-chirality` | **validated**: zero modes = Betti sum, overlap operator threads the chirality wall |
| P5. The Hauptvermutung | `p5-hauptvermutung`, `validation` | **validated** sharp in dimension and proper time, proof still open |
| P6. A computable 2D path integral | `p6-path-integral` | runs, but does not yet land on 2D manifold-like orders |
| P7. Quantum from a classical base | `p7-bell`, `p7-naturalness`, `p7-alignment` | mechanism quantified, naturalness made precise: the currency is aligned bits, not bits (refines Hall) |
| P8. One gauge field and one charged fermion | `p8-gauge-fermion`, `validation`, `p8-confinement`, `p8-index` | **validated** A, B, C plus the index theorem: charge couples, SU(2) confines, index = topological charge |
| P9. Experience | `p9-integration` | only the structural correlates, by design |

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
is stable (`p2-uniform.md`). So the dynamics PRODUCES a stable spacetime phase, the
prize for Vibe Theory. **Remaining nuance:** the free-energy crossing that says
which phase strictly dominates at a given coupling, by thermodynamic integration or
tempering across the barrier.

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

The 2D Monte Carlo runs and converges, but the sampled orders are not cleanly 2D
(recovered dimension 3.26). The sum over histories is computable in the
Euclidean-style reweighting, but the measure does not yet land on 2D manifold-like
orders, the same difficulty as P2. **Next:** restrict to genuinely 2D-favoring
actions, and benchmark against known 2D continuum results.

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
**specific aligned** correlation, not just any correlation (see
`note/experiment/results/p7-naturalness.md`). **Remaining open:** derive an aligned
setting-state correlation from actual mesh dynamics. That would complete the
quantum link.

### P8. Can we get one gauge field and one charged fermion?

Yes, for Stages A, B, and C, plus the index theorem. A U(1) gauge field couples to
the Kahler-Dirac fermion (charged spectrum shift, Aharonov-Bohm phase linear in
charge). 3D SU(2) lattice gauge theory **confines**: the string tension (Creutz
ratio) is positive at every coupling and falls from 1.32 to 0.40 as beta rises,
the Wilson area law of the strong force (`p8-confinement.md`). And the chiral
overlap fermion **sees gauge topology exactly**: in a U(1) background of charge Q,
its index equals -Q exactly, an integer, the lattice Atiyah-Singer index theorem
(`p8-index.md`). **Remaining open:** coupling the chiral fermion to the dynamical
and non-Abelian field (the full chiral gauge theory, an active research problem)
and the Standard Model content (Stage E).

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
