# Quantum arena

**67 experiments.** Codes `E-QTM-0001` through `E-QTM-0067`. Files in `test/experiment/quantum/`.

## What this arena tests

Vibe theory treats the quantum as **emergent, not fundamental**. The base is a discrete, deterministic, reversible rule on a hyperbolic mesh. Quantum behavior is what that substrate looks like after **lossy coarse-graining**. Apparent randomness is lost fine detail. Interference is the sum over an amplitude that the lattice already carries. Measurement is deterministic **settling** plus loss of the fine phase to an open edge. Entanglement is a correlation fixed in a **shared past**, not a signal sent now. Born-rule weights are the conserved norm concentrating on the typical branch.

This arena asks whether those emergent quantum features actually fall out of the five base things, where they only reproduce known quantum math, and where the story is still open. Grades follow the depth rubric. **L1** confirms known mathematics. **L2** reproduces a known physics construction on this substrate. **L3** is a measured, controlled, novel consequence of the base rule. Many results here are candid L1 and L2, labeled as such.

## Sub-themes

### 1. Substrate-to-quantum bridge: the walk, dispersion, and single-particle laws

The lattice walk is unitary and ballistic. From it emerge the Dirac and Schrodinger dispersion, an S-matrix, uncertainty, tunneling, and the Aharonov-Bohm phase.

- **E-QTM-0004** - the unitary rule interferes and yields a genuine Born probability.
- **E-QTM-0022** - unitarity, the Born rule, and interference of amplitudes together on the substrate.
- **E-QTM-0023** - the quantum walk spreads ballistically while a classical walk only diffuses.
- **E-QTM-0024** - the unitary completion of the walk is relativistic and reflection-positive.
- **E-QTM-0053** - the emergent Dirac walk gives a unitary two-channel S-matrix (transmission plus reflection sum to one), while a lossy walk leaks probability.
- **E-QTM-0056** - sub-gap tunneling decays exponentially at the exact discrete walk rate, off the continuum Dirac rate by 17 percent and converging to it, a hardware-testable prediction.
- **E-QTM-0059** - every Gaussian packet saturates sigma_x sigma_p = 1/2 exactly, a flat-top packet sits far above the bound.
- **E-QTM-0060** - the walk recovers the Schrodinger dispersion with exact discrete effective mass tan(mass), the massless walk stays linear.
- **E-QTM-0062** - the ring spectrum shifts periodically with threaded flux (one flux quantum), a global phase changes nothing, the Aharonov-Bohm effect on the walk.

### 2. Born-rule statistics and the emergent complex structure

Where the |amplitude|^2 weights, the imaginary unit, and the continuous phase come from without being inserted.

- **E-QTM-0005** - given the amplitude-equals-sqrt-count postulate, additivity of disjoint outcomes makes exponent 2 the unique self-consistent power, p = 1 and p = 3 rejected (branch counting).
- **E-QTM-0012** - the Born rule DERIVED from envariance: equal-amplitude entangled outcomes are swap-symmetric hence equiprobable, unequal ones fine-grain to the equal case, giving |amplitude|^2, with a symmetry-free product-state control.
- **E-QTM-0046** - given the orthogonal rotation coin, the quadratic intensity is the only conserved measure among the candidates, a non-orthogonal coin control breaks the conservation.
- **E-QTM-0067** - the conserved norm concentrates branch weight on the Born frequency while branch counting concentrates at one half for every state and breaks under unitary refinement.
- **E-QTM-0041** - quantum-walk interference emerges from a purely real two-component walk, so the effective i is the rotation between the lattice forward and backward slots.
- **E-QTM-0047** - the continuous U(1) phase emerges from the discrete coin (about 126 distinct values), the degenerate coin collapses the field to one phase.

### 3. Entanglement, Bell/CHSH, and nonlocality

Genuine two-part correlations no classical theory can match, reached from the exchange dynamics, plus contextuality and the temporal Bell test.

- **E-QTM-0001** - aligned bits, not bare bits, buy a CHSH violation.
- **E-QTM-0002** - an engineered superdeterministic model climbs CHSH past 2 as setting-state correlation rises.
- **E-QTM-0003** - the local CHSH bound is 2 and the quantum value is 2 sqrt 2, the restated gap.
- **E-QTM-0011** - the exchange dynamics produces a maximally entangled state and violates CHSH at the Tsirelson bound, a product-state control gives concurrence 0.
- **E-QTM-0038** - the Tsirelson bound follows from anticommutation in any qubit theory, and the {3,4,3,4} coin quaternion units supply the anticommuting pair, so the quantum maximum is available without tuning.
- **E-QTM-0057** - the emergent singlet violates CHSH at Tsirelson while Alice's marginal is exactly independent of Bob's setting (no signaling), a signaling toy is caught by the same test.
- **E-QTM-0058** - the Bell violation is monogamous: a Tsirelson pair forces the third party to zero, the squared sum stays below 8, a GHZ control holds classical correlation in both pairs.
- **E-QTM-0061** - the GHZ state gives the exact all-versus-nothing signs while no local assignment satisfies the four constraints, absent on a product state.
- **E-QTM-0007** - the Peres-Mermin square reaches quantum value 6 against the noncontextual bound 4 on the cell spin algebra.
- **E-QTM-0015** - a coherent qubit reaches the Leggett-Garg value 3/2, violating the macrorealist bound 1 (the temporal Bell test).
- **E-QTM-0027** - diverged-but-related subsystems correlate through shared ancestry with no link, the correlation tracking divergence (synchronicity).

### 4. The superdeterminism and shared-past mechanism

The arena's largest cluster. It asks how a spacelike Bell correlation can be real yet carry no action at a distance. The answer is a **common cause in the shared past**, and curvature of the {3,4,3,4} bulk controls how far it reaches.

- **E-QTM-0010** - in a natural mesh the CHSH violation decays with separation, unlike flat quantum mechanics.
- **E-QTM-0029** - measured: curvature collapses the local shared past with separation, so a spacelike Bell correlation needs a seed-anchored common cause.
- **E-QTM-0030** - run from a seed, the rule preserves a seed-anchored spacelike correlation but manufactures none from a local seed.
- **E-QTM-0031** - the bulk shared past is bulk-mediated not boundary-mediated, an candid negative for the spatial-holographic escape, leaving the past-boundary seed.
- **E-QTM-0032** - on a genuine 20k-cell hyperbolic tessellation shell growth is exponential and the local shared past collapses, confirming the curvature mechanism on the committed substrate.
- **E-QTM-0033** - the measured shared past sets a critical separation for the quantum value, smaller on the curved substrate, the violation contingent on settings aligned with the shared past.
- **E-QTM-0034** - the shared past is exponential in bulk distance but only power-law in physical cusp distance, inheriting the holographic shortcut, no shortcut in the flat control.
- **E-QTM-0035** - through the bulk shortcut the Tsirelson violation is reachable out to an exponentially larger physical distance than on the flat substrate, with no action at a distance.
- **E-QTM-0036** - on the expanding bulk the common ancestor recedes to the origin as distance grows, so the only distance-independent shared past is the shared origin.
- **E-QTM-0037** - a point in the common future of two spacelike past points correlates them (a connected three-point signal), a causally-disconnected future point gives exactly zero.
- **E-QTM-0039** - on a genuine {7,3} tessellation the shared past is exponential in bulk distance and bulk distance is logarithmic in physical distance, composing to a power law, so E-QTM-0034 is not a tree artifact.
- **E-QTM-0040** - the classical two-ended correlation is causal but washes out with a larger future boundary, so the strong flat correlation must come from the emergent quantum layer.
- **E-QTM-0042** - near distance the model Bell violation is exactly Tsirelson (matching every lab test), beyond a crossover it declines as a power law in physical distance while quantum mechanics stays flat, a falsifiable cosmological-scale signature.

### 5. Measurement, settling, and decoherence

The measurement story: a definite record forms by deterministic settling at an open edge, coherence is lost to the wake without a collapse postulate, and the definite outcome survives noise. Selection among symmetric alternatives is the acknowledged open problem.

- **E-QTM-0016** - measurement as deterministic settling: the open edge forms a definite irreversible record, the closed system stays coherent (Loschmidt echo recovers it exactly).
- **E-QTM-0019** - a drain coupled along one axis writes the record along that axis and not the orthogonal one, an axis-selection consistency result for the pointer basis.
- **E-QTM-0043** - the single outcome is deterministic, but SELECTION among symmetric alternatives is not provided by the reversible rule (symmetric drains hold the pointer at zero), the same no-spontaneous-breaking obstruction as the three generations.
- **E-QTM-0044** - the selection obstruction is resolved in principle by spontaneous symmetry breaking: below a critical point an infinitesimal bias selects a branch and susceptibility diverges, and the model has such a transition.
- **E-QTM-0045** - the sharp either-or is demonstrated at the emergent-self layer in a nucleation toy: a seed below the critical radius dies, above it persists as a definite localized self, the tie to the committed rule staying open.
- **E-QTM-0049** - the definite outcome persists while coherence is destroyed across a size sweep, so vibe reaches the Orch-OR destination with no coherence bill (Hameroff bridge).
- **E-QTM-0050** - the definite outcome survives thermal noise, the warm prong of the Tegmark objection (Hameroff bridge).
- **E-QTM-0051** - the emergent dephasing (collapse) time is set by the energy gap, t = pi/dE, the deterministic reconstruction of Penrose OR.
- **E-QTM-0065** - fresh-environment collisions give exact exponential Lindblad decay while a reused environment revives, Markovianity from causal freshness.
- **E-QTM-0066** - the copy chain turns a micro superposition into a macroscopic record: coherence decays exponentially, a 20-cell fragment carries the full pointer, ten disjoint fragments each suffice (redundant objectivity).

### 6. Reversibility, ontology, and quantum codes

The base rule is an exact reversible permutation. That underwrites purification, an ontological beable basis, and the smallest quantum error-detecting codes.

- **E-QTM-0008** - no persistent charge circulation around closed loops.
- **E-QTM-0020** - the reversible knit realizes purification: a mixed local marginal is the recoverable view of a pure reversible whole (Chiribella, D'Ariano), a lossy control fails to recover.
- **E-QTM-0026** - local detailed balance holds at all arrow rates.
- **E-QTM-0052** - the reversible rule permutes the microstates (finite recurrence plus injectivity, a beable cycle) while a lossy rule never recurs, the t Hooft ontological basis.
- **E-QTM-0054** - the classical codes under D4 and E8 lift by CSS to the [[4,2,2]] and [[8,3,2]] quantum codes exactly, a non-nested pair anticommutes, the quantum-code ladder from the geometric ladder.
- **E-QTM-0055** - the conserved charge is a stabilizer check: single-site errors are detected at the exact beat with zero false positives, a leaky rule fires with no error.

### 7. Reflection positivity, the quantum field, and the vacuum

The field-theoretic side: whether the substrate is reflection-positive (a genuine quantum field), its vacuum structure, and the path integral. Several results are candid negatives locating RP at the emergent flat layer, not the raw scaffold.

- **E-QTM-0009** - the deterministic field is long-range and reflection-positive.
- **E-QTM-0013** - the field is generically massive on flat too, the rule not the geometry causes it.
- **E-QTM-0014** - the field is massive on the emergent flat layer too (horosphere dynamics).
- **E-QTM-0017** - spatial reflection positivity belongs to the emergent flat layer, not the scaffold.
- **E-QTM-0021** - the vacuum is field-like with virtual pairs and a causal cone.
- **E-QTM-0025** - in the massive regime spatial reflection positivity is undecided (an candid open).
- **E-QTM-0028** - the beat-autocorrelation Hankel is positive semidefinite within noise (time reflection positivity).
- **E-QTM-0018** - a 2D Lorentzian causal-set path integral recovers a mean dimension near two.
- **E-QTM-0048** - one memory-kernel width carries a packet from ballistic (the quantum end) to diffusive (the gravity end), Leizerman's one-dial QM-to-gravity map.

### 8. Many-body exchange statistics

Bosons, fermions, Pauli exclusion, and bound states from the exchange structure of the walk.

- **E-QTM-0006** - two attracting particles form a true bound state with discrete levels.
- **E-QTM-0063** - bosons never coincide at the balanced splitter (permanent zero, the Hong-Ou-Mandel dip), fermions always do (determinant one), distinguishable particles sit at one half.
- **E-QTM-0064** - the N-fermion amplitude is the Slater determinant of propagator entries (matched to brute force), exact Pauli exclusion and unit norm at six particles, bosons bunch by the permanent.

## What this arena establishes

- **The single-particle quantum laws are reproducible on the substrate.** The unitary ballistic walk yields the Dirac and Schrodinger dispersion, uncertainty, an S-matrix, tunneling, and the Aharonov-Bohm phase, mostly at L1 and L2 with lossy controls.
- **The Born rule is reachable three independent ways.** Branch-counting additivity, envariance, and norm concentration all land |amplitude|^2, each with a control that fails, and the imaginary unit and continuous phase emerge from the real coin rather than being inserted.
- **Nonlocality is real but carries no action at a distance.** The emergent singlet hits Tsirelson while marginals stay setting-independent, the violation is monogamous, and GHZ and contextuality reproduce exactly.
- **Spacelike Bell correlations come from a shared past, and curvature sets their reach.** The largest cluster shows the {3,4,3,4} bulk shortcut lets the Tsirelson violation reach exponentially larger physical distances, with a falsifiable power-law decay beyond a crossover that quantum mechanics does not predict.
- **Measurement is deterministic settling plus loss to an open edge.** A definite record forms and holds, coherence leaks to the wake with no collapse law, and the outcome survives decoherence and thermal noise. Selection among symmetric alternatives stays the acknowledged open problem, resolved only in principle by symmetry breaking.
- **Reversibility underwrites the information-theoretic and code structure.** Purification, the ontological beable basis, and the [[4,2,2]] and [[8,3,2]] quantum codes follow from the exact reversible permutation, with lossy and non-nested controls that fail.

## Completeness

All 67 experiments **E-QTM-0001** through **E-QTM-0067** appear exactly once above. Counts by sub-theme: 9 + 6 + 11 + 13 + 10 + 6 + 9 + 3 = 67.
