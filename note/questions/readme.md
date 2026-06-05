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
| P1. A local, bounded-below Hamiltonian | `p1-hamiltonian` | partial: bounded below shown, locality of H still open |
| P2. A dynamics that favors manifold-like order | `p2-dynamics` | **open**: the action does not concentrate on manifold-like orders |
| P3. Addressing versus Lorentz | `p3-study` | **candidate answer**: connected hyperbolic random graph hits all three |
| P4. The monist spinor | `p4-spinor` | partial: one zero mode found, topology link still open |
| P5. The Hauptvermutung | `p5-hauptvermutung` | empirically holds (std under 0.05), proof open |
| P6. A computable 2D path integral | `p6-path-integral` | runs, but does not yet land on 2D manifold-like orders |
| P7. Quantum from a classical base | `p7-bell` | mechanism quantified: the superdeterminism cost curve |
| P8. One gauge field and one charged fermion | `p8-gauge-fermion` | machinery runs (Stage A and B), charge check still open |
| P9. Experience | `p9-integration` | only the structural correlates, by design |

## The questions

### P1. Can a local rule have a bounded-below Hamiltonian that is also local?

The reversible rule gives a Hamiltonian that is bounded below (it is a
permutation, so energies live in a bounded interval). The remaining question is
whether that Hamiltonian is **local**, a sum of bounded-range terms. We measure
the former; we do not yet measure the latter. **Next:** add a Pauli-expansion
locality profile of the Hamiltonian, and test whether information loss
(equivalence classes) buys both locality and a stable vacuum, as 't Hooft
conjectures.

### P2. What dynamics makes manifold-like causal sets dominate?

The hardest open problem, and the experiment confirms it is open. Under the
Benincasa-Dowker action, manifold-likeness FALLS as the coupling rises: the
sampler moves toward action-minimizing orders that are less, not more,
manifold-like. A naive local action plus a Euclidean weight does not solve the
"most causal sets are not manifold-like" problem. **Next:** a nonlocal action
with a tuned smearing scale (the Goldilocks window between too-local and
too-nonlocal), and larger sizes. This is shared frontier with the whole
causal-set community.

### P3. Can one substrate have reach, Lorentz invariance, and navigation at once?

The most Vibe-Theory-specific question, and the one where we made the most
progress. A connected hyperbolic random graph (mean degree about 11) has
exponential reach, near-zero anisotropy (Lorentz-safe), and 98 percent
greedy-routing success, all at once. See
`note/experiment/results/p3-both-worlds.md`. The candidate answer: you do not
choose between a computable mesh and a relativistic one. You trade exact Fibonacci
addressing for greedy geometric routing on a random, Lorentz-safe, exponentially
reaching graph. **Open sub-questions:** push routing toward 100 percent with a
backtracking or landmark fallback, test it on a growing and rewiring graph (not
just a static one), and measure the routing stretch.

### P4. Is the spinor built from vibes, and is its spin topological?

The Kahler-Dirac operator on a 2D mesh has exactly one zero mode, every component
of which is a cell tone, so the spinor is built from the substrate (monism holds).
The open part is the **topological reading**: is the zero-mode count a property of
the mesh topology (the Bombelli and Friedman-Sorkin "spin from topology" idea)?
**Next:** vary the mesh topology (genus, defects) and check whether the zero-mode
count tracks it, and run the belt-trick holonomy test for 720-degree periodicity.
The chirality wall (a single chiral fermion, fermion doubling) remains the deeper
barrier.

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
violation. **Open:** whether a *natural* deterministic mesh produces the required
setting-state correlation without it being put in by hand, and whether the
emergent statistics can match the quantum reconstruction axioms. This is the
make-or-break question for the classical-base reading of v3.

### P8. Can we get one gauge field and one charged fermion?

A U(1) gauge field on the mesh, relaxed by the Wilson heat bath, coupled to a
Kahler-Dirac operator: the machinery runs (Stage A and B of the gauge ladder).
**Open:** confirm the charge by comparing the charged spectrum to the uncharged
one and measuring an Aharonov-Bohm phase, then climb toward non-Abelian gauge and
the chirality wall (Stage C and D). The full Standard Model (Stage E) remains far
off.

### P9. What is the relationship between structure and experience?

We can locate the structural correlates of a self (a well-screened, well-
integrated region) but not experience itself. This is the framework's own
distinctive claim and the honest boundary of what physics can deliver. **Next:**
sharpen the integration measure and state precisely what it does and does not
capture.

## Where to push next

In priority order, by leverage:

1. **P3 sub-questions** (routing fallback, growing graph, stretch): the most
   vibe-specific, with momentum and a candidate answer to harden.
2. **P2 / P6 dynamics** (nonlocal action, Goldilocks window): the central shared
   open problem, where progress is hardest but most valuable.
3. **P7 naturalness** (does the setting-state correlation arise on its own): the
   make-or-break test for the classical base.
4. **P4 topology** and **P8 charge**: the inner-structure thread, concrete and
   incremental.
