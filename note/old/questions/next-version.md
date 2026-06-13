# Next-Version Problems (P10 onward)

P1 through P9 covered the conceptual core: a stable spacetime phase, spin from
topology, confinement, the index theorem, the Bell mechanism, dimension
uniqueness, the law as an emergent-mesh Hamiltonian. The next version pushes toward
a theory of the world: cosmology, the Lorentz invariance of the dynamics (not just
the substrate), which phase actually dominates, the arrow of time, mass, and
holography. Here is the set, prioritized by impact times reachability, with how to
attack each.

## P10. The cosmological constant (Sorkin's everpresent Lambda)

**Why.** This is the one place causal set theory made a real, quantitative
cosmological prediction. The spacetime volume V is realized as the discrete element
count N, which Poisson-fluctuates as sqrt(V). Lambda is conjugate to V, so it
inherits a fluctuation Delta-Lambda ~ 1 / sqrt(V). Plugging the observed 4-volume
of the universe in Planck units gives a Lambda of the observed dark-energy order of
magnitude. If our mesh shows the underlying sqrt(V) scaling, it connects to dark
energy.

**How.** Sprinkle N points into a fixed region at several N, many realizations.
Measure the fluctuation of the discrete action (and of a volume estimator read from
the order) across realizations, and fit its scaling exponent in N. The everpresent
model predicts the action fluctuation scales as sqrt(V) so the implied Lambda
fluctuation scales as 1 / sqrt(V). Report the exponent and the dark-energy
consequence honestly (we test the scaling, the prediction itself is Sorkin's).

## P11. Lorentz invariance of the dynamics

**Why.** P3 showed the substrate has no preferred frame and P5 showed the geometry
is sharp, but neither shows that the DYNAMICS is Lorentz-invariant. A regular
lattice has anisotropic propagation (a faceted lightcone, preferred axes). A random
sprinkling should propagate isotropically. This is the property lattices cannot
have and sprinklings restore, and it is foundational for the model to carry real
physics.

**How.** Build the emergent wave operator (the graph Laplacian) on a random
geometric graph and on a regular lattice. Evolve a localized perturbation and
measure the angular isotropy of the wavefront, binning amplitude by direction using
the embedding coordinates. Rotational isotropy is the Euclidean analog of Lorentz
invariance, which the lattice breaks and the random mesh restores. Report the
angular variation for each.

## P12. The free-energy crossing (closing P2)

**Why.** P2 showed two phases coexist (a first-order signature), but not which one
strictly dominates the sum over histories. Closing this upgrades "spacetime is a
stable phase" to "spacetime is the dominant phase for couplings above some beta
star."

**How.** This needs large N where the layered phase dominates the entropy at
beta = 0, so enumeration will not reach it. Combine the correct uniform-measure
move with parallel tempering so configurations cross the barrier, and measure the
equilibrium manifold fraction versus beta, locating the jump at beta star. An
incremental action update (the changed pair only) makes the move fast enough. This
is the heaviest of the set and is genuine research-grade work.

## P13. The arrow of time and cosmology from growth

**Why.** The mesh grows (eternal expansion), and classical sequential growth is
intrinsically time-asymmetric. Does that growth produce an expanding, manifold-like
universe with an entropy arrow? This is where the expansion commitment becomes
cosmology.

**How.** Generate orders by classical sequential growth, measure the recovered
dimension and the growth of the order with time, and an entropy measure along the
growth. Look for a manifold-like expanding regime and monotone entropy increase.
We have the growth machinery already.

## P14. Mass and the spectral gap

**Why.** The matter so far is massless. Real particles have mass. The v2 reading is
that mass is the rest-frame oscillation rate of the internal clock-tone.

**How.** Add an internal clock-tone (a finite Z_q value advancing per beat) or a
condensate-induced term to the Dirac operator, and measure a spectral gap that
behaves like a mass. Relate the gap to the clock frequency. Medium difficulty.

## A standing caveat: quantum and gravity are only at their onset

Two of the rungs already touched are not nearly finished, and the next version
should treat them as long roads, not solved ground.

- **Quantum is just beginning.** P7 showed that Bell-style correlations can come
  from the deterministic mesh, and quantified the cost. But Bell correlations are
  not the full quantum formalism. The Born rule, complex amplitudes, unitarity, the
  measurement problem, and a derivation of the quantum reconstruction axioms are all
  ahead. We have the hinge, not the machine.
- **Gravity is just beginning.** We exhibit the discrete gravitational action and
  show it makes a smooth geometry a stable phase. But an action is not the field
  equations. The Einstein equations as equations of motion, a propagating graviton,
  black-hole dynamics, and the Newtonian limit are all ahead. We have the action,
  not the theory of gravity.

These two are the deepest and longest parts of the program. The two goals below name
their next concrete rungs, and they should be expected to take many versions.

## P16. Gravitational field equations and the graviton

**Why.** The gravitational action (P2, gravity) is only the starting point. A theory
of gravity needs the equations of motion (a discrete analogue of the Einstein
equations), a propagating spin-2 excitation (the graviton), the Newtonian limit, and
eventually black-hole dynamics. This is a long road, named here so the program does
not mistake the action for the theory.

**How.** Vary the discrete action to get the equations of motion on the mesh, look
for a transverse spin-2 mode in the spectrum of perturbations around a flat
sprinkling, and check the weak-field limit reproduces an inverse-distance potential.
Each step is its own substantial problem.

## P17. The quantum formalism, beyond Bell

**Why.** P7 gave the correlation hinge. The full quantum theory needs the Born rule
(probabilities as squared amplitudes), complex amplitudes and unitarity, and an
account of measurement, ideally derived rather than assumed. This is the deepest
open problem in the whole program and should be expected to take many versions.

**How.** Build a quantum-walk or quantum-cellular-automaton layer on the mesh, where
amplitudes are emergent from the finite clock-tones, and test whether interference,
the Born rule, and unitary evolution arise in the large-scale limit. Engage the
't Hooft Cellular Automaton Interpretation directly, since P1 already gives a
bounded-below emergent Hamiltonian to build on. Expect partial results at best.

## P15. Holographic area law and entanglement entropy

**Why.** The hyperbolic commitment is AdS-like, and AdS/CFT ties bulk geometry to
boundary entropy, with black-hole entropy scaling as area. If the mesh shows an
entanglement area law (and a logarithmic correction in 2D), it connects to
holography and black-hole thermodynamics.

**How.** Take the free-field ground state of the Laplacian or Dirac on the mesh,
restrict to a region, and compute the entanglement entropy of the reduced state.
Check the scaling with region size: an area law (boundary, not volume) in higher
dimensions, a logarithm in 2D, and the hyperbolic boundary scaling on the
hyperbolic mesh. Reachable through the correlation-matrix method for free fields.

## Priority and plan

Tier 1, reachable and high impact, solve first: **P10 (cosmological constant)** and
**P11 (Lorentz invariance of the dynamics)**. Tier 1 but heavy: **P12** (closes P2).
Tier 2: **P13 (cosmology), P14 (mass), P15 (holography)**. We begin with P10 and
P11.
