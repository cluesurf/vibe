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
| P1. A local, bounded-below Hamiltonian | `p1-hamiltonian`, `validation` | **validated** local rule + bounded-below H (H-locality still open) |
| P2. A dynamics that favors manifold-like order | `p2-study`, `p2-epsilon` | **candidate progress**: the smeared action produces near-2D, non-layered ensembles |
| P3. Addressing versus Lorentz | `p3-study`, `validation` | **candidate solved**: all three at once, navigability validated to 100 percent |
| P4. The monist spinor | `p4-spinor`, `p4-topology` | **validated**: zero modes = Betti sum (spin from topology) |
| P5. The Hauptvermutung | `p5-hauptvermutung`, `validation` | **validated** sharp in dimension and proper time, proof still open |
| P6. A computable 2D path integral | `p6-path-integral` | runs, but does not yet land on 2D manifold-like orders |
| P7. Quantum from a classical base | `p7-bell` | mechanism quantified: the superdeterminism cost curve |
| P8. One gauge field and one charged fermion | `p8-gauge-fermion`, `validation` | **validated** Stages A and B: charge couples to the fermion |
| P9. Experience | `p9-integration` | only the structural correlates, by design |

## The questions

### P1. Can a local rule have a bounded-below Hamiltonian that is also local?

The reversible rule gives a Hamiltonian that is bounded below (it is a
permutation, so energies live in a bounded interval). The remaining question is
whether that Hamiltonian is **local**, a sum of bounded-range terms. We measure
the former, we do not yet measure the latter. **Next:** add a Pauli-expansion
locality profile of the Hamiltonian, and test whether information loss
(equivalence classes) buys both locality and a stable vacuum, as 't Hooft
conjectures.

### P2. What dynamics makes manifold-like causal sets dominate?

Progress. The sharp Benincasa-Dowker action fails (it drives the ensemble to
layered Kleitman-Rothschild orders, height ratio 0.29, dimension 3.45). The
**smeared** action fixes it: with a nonlocal kernel that averages over about
1/eps order-layers, the ensemble becomes near-2-dimensional and non-layered
(height ratio about 1, dimension about 2 to 2.7), close to a true 2D sprinkling,
robustly across smearing scales eps in [0.8, 0.99] and at two sizes. There is a
genuine Goldilocks window: too little smearing gives layered orders, too much
gives near-1D chains, intermediate-to-high gives manifold-like orders. See
`note/experiment/results/p2-dynamics.md`. **Remaining:** push to hundreds of
elements to confirm the full phase transition, and add a cluster or warm-started
Monte Carlo move so stiff actions do not freeze.

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

Yes, and the spin is topological. The Kahler-Dirac zero modes are built entirely
from cell tones (monism holds), and their count equals the surface Betti sum:
disk 1, cylinder 2, torus 4, validated exactly (see
`note/experiment/results/validation.md`). So the spinor's zero modes are a
topological invariant of the mesh, the Bombelli and Friedman-Sorkin "spin from
topology" reading. **Remaining open:** the chirality wall, a single chiral
fermion without doublers (Nielsen-Ninomiya), which is the deeper barrier toward
the Standard Model.

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

Yes, for Stages A and B. A U(1) gauge field on the mesh couples to the
Kahler-Dirac fermion: under a real flux the charged low spectrum differs from the
free one, and the Aharonov-Bohm phase scales linearly with charge (validated, see
`note/experiment/results/validation.md`). **Remaining open:** non-Abelian gauge
and confinement (Stage C), the chirality wall (Stage D), and the full Standard
Model content (Stage E), which remains far off.

### P9. What is the relationship between structure and experience?

We can locate the structural correlates of a self (a well-screened, well-
integrated region) but not experience itself. This is the framework's own
distinctive claim and the honest boundary of what physics can deliver. **Next:**
sharpen the integration measure and state precisely what it does and does not
capture.

## Where to push next

Now that P1, P3 (navigability), P4 (topology), P5, P7, and P8 (Stages A and B)
are validated, the open frontier in priority order:

1. **P2 / P6 dynamics at scale**: the smeared action now selects manifold-like
   orders at the testbed scale. Push to hundreds of elements with a cluster or
   warm-started Monte Carlo to confirm the full phase transition. The mechanism
   is found; the remaining work is scale and sampler quality.
2. **P3 on a growing graph**: lift the both-worlds result from a static graph to a
   growing and rewiring one (couple to causal graph dynamics), moving from
   kinematics to dynamics.
3. **P4 chirality** (Stage D) and **P8 non-Abelian gauge** (Stage C): the climb
   past the validated basics toward the Standard Model, gated by the
   Nielsen-Ninomiya chirality wall.
4. **P7 naturalness** (does the setting-state correlation arise on its own): the
   make-or-break test for the classical base.
