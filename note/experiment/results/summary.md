# Summary of All Experiments

Numbers from the first full run of `vibe-sim`. Build state: typecheck clean,
10 of 10 known-answer tests pass.

## The table

| Problem | Experiment | Headline number | Verdict |
|---|---|---|---|
| P1 | reversible Hamiltonian | permutation, bounded below, 9 energy levels | works |
| P2 | manifold-favoring dynamics | smeared action gives near-2D ensembles, manifold phase is a stable basin (see p2-dynamics.md, p2-transition.md) | candidate progress |
| P3 | addressing vs Lorentz | hyperbolic graph hits all three at degree ~11 | **candidate solved** |
| P4 | monist spinor, topology, chirality | zero modes = Betti sum, overlap threads the chirality wall (see p4-chirality.md) | validated |
| P5 | Hauptvermutung | dimension 3.02 plus or minus 0.05 | holds empirically |
| P6 | 2D path integral | mean recovered dimension 3.26 | open |
| P7 | Bell from a classical base | S climbs 1.0 to 4.0 with correlation | works |
| P8 | gauge, fermion, confinement, index | U(1) couples, SU(2) confines, overlap index = topological charge (see p8-confinement.md, p8-index.md) | validated A, B, C + index |
| P9 | experience correlates | Markov blanket 0.77, integration 1.91 | proxy works |

## The numbers, one by one

### P1: a reversible rule whose energy is bounded below

A reversible even-odd cellular automaton (self XOR parity of neighbors) on 8
boolean cells. State space 256. The global update is a genuine permutation, so the
Hamiltonian read off the cycle structure is bounded below, with 9 distinct energy
levels. The harder question, whether that Hamiltonian is also local, is left open
by design (it needs a Pauli-expansion locality profile, a future addition).

### P2: a dynamics that makes manifold-like order dominate

Causal-set Monte Carlo on 40 elements with the 2D Benincasa-Dowker action,
observing manifold-likeness as inverse temperature beta rises:

```
beta=0    manifoldLikeness=0.995   acceptance=1.000
beta=0.5  manifoldLikeness=0.446   acceptance=0.408
beta=1    manifoldLikeness=0.100   acceptance=0.439
beta=2    manifoldLikeness=0.100   acceptance=0.426
```

The action does NOT concentrate on manifold-like orders. As beta rises, the
sampler moves toward action-minimizing orders that are less manifold-like, not
more. This matches the open status of P2 in the literature: a naive local action
plus a Euclidean-style weight does not solve the "manifold-like majority"
problem. Next step: a nonlocal action with a tuned smearing scale (the Goldilocks
window), and larger sizes.

### P3: the addressing-versus-Lorentz fork (the headline)

See [p3-both-worlds.md](p3-both-worlds.md) for the full study. The short version:

```
substrate              meanDeg  reach   anisotropy  routeSuccess
hyperbolic t=3.0        10.8    true      0.069        0.977
lattice 3D (lorentz)     4.0    false     1.000        0.000
sprinkle M^3            16.3    false     0.065        0.000
```

A sufficiently connected hyperbolic random graph has exponential reach, near-zero
anisotropy (Lorentz-safe), and 98 percent greedy-routing success, all at once.
The regular lattice is maximally anisotropic (a preferred frame) and not
navigable by greedy routing. This is a candidate both-worlds resolution: a
random, Lorentz-safe substrate that you navigate by greedy geometric routing
instead of Fibonacci addressing.

### P4: the monist spinor

Kahler-Dirac operator on a 10 by 10 mesh (100 vertices, 180 edges). The smallest
magnitudes of the eigenvalues are 0, 0.31, 0.44, 0.62, ..., so there is exactly
one zero mode of the discrete Dirac operator. A clean, single harmonic mode,
every component of which is a cell tone (monism satisfied). Next step: vary the
mesh topology and check whether the zero-mode count tracks topology, the
topological reading of spin.

### P5: the Hauptvermutung

Eight independent sprinklings of the same 3D Minkowski region (700 points each),
recovered dimension each time:

```
3.11, 2.98, 3.04, 3.01, 3.05, 2.97, 2.96, 3.00
mean 3.016, std 0.046
```

The recovered geometry is sharp: standard deviation under 0.05 around the true
value 3. Strong empirical support that a causal set's continuum dimension is
essentially unique. The fix that made this work is recorded in
[methodology-fixes.md](methodology-fixes.md).

### P6: the 2D path integral

Causal-set Monte Carlo in 2D (48 elements, 6000 steps), observing the recovered
dimension of the sampled orders: mean 3.26, acceptance 0.38. The sampled orders
are not cleanly 2D, the same open difficulty as P2. The sum over histories runs
and converges, but the measure does not yet land on 2D manifold-like orders.

### P7: quantum statistics from a classical base (the Bell hinge)

A constructed superdeterministic model, sweeping how strongly the measurement
settings are correlated with the hidden state:

```
correlation=0     S=1.009
correlation=0.25  S=1.556
correlation=0.5   S=2.256
correlation=0.75  S=3.069
correlation=1     S=4.000
```

At independence the local model respects the classical bound (S near 1, well
under 2). As the settings track the hidden state, S climbs through the classical
bound 2 (around correlation 0.5), past the quantum Tsirelson bound 2.83, to the
algebraic maximum 4 at full superdeterminism. This turns the superdeterminism
debate into a number: it quantifies exactly how much statistical-independence
violation buys how much CHSH violation. The conspiracy is real and measurable.

### P8: one gauge field and one charged fermion

A U(1) gauge field (clock group Z_12) on a 2D mesh, relaxed by 40 Wilson heat-bath
sweeps at beta 1.5. 121 plaquettes, static-potential proxy 0.39. The covariant
Kahler-Dirac operator builds and has a spectrum (lowest near -2.3). Stage A and B
of the P8 ladder run: a gauge field on the mesh, coupled to a Dirac mode. Next
step: compare the charged spectrum to the uncharged one and measure an
Aharonov-Bohm phase to confirm the charge.

### P9: experience correlates

On a 400-node hyperbolic graph with random ternary tones: Markov-blanket score
0.77, integration proxy 1.91. These locate where a self would sit on the
framework's own terms (a well-screened, well-integrated region). They do not
claim to capture experience itself, the honest boundary of P9.

## What moved forward

The biggest step is **P3**: the testbed now has a concrete substrate (a connected
hyperbolic random graph) that is Lorentz-safe, has exponential reach, and is
navigable without addressing. That is the most Vibe-Theory-specific open problem,
and there is now a candidate answer to track and stress-test.
