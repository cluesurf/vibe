# Quantum arena

**92 experiments.** Codes [`E-QTM-0001`](../../../test/experiment/quantum/alignment.ts) through [`E-QTM-0092`](../../../test/experiment/quantum/lyapunov-recordability-ceiling.ts). Files in `test/experiment/quantum/`.

## What this arena tests

Vibe theory treats the quantum as **emergent, not fundamental**. The base is a discrete, deterministic, reversible rule on a hyperbolic mesh. Quantum behavior is what that substrate looks like after **lossy coarse-graining**. Apparent randomness is lost fine detail. Interference is the sum over an amplitude that the lattice already carries. Measurement is deterministic **settling** plus loss of the fine phase to an open edge. Entanglement is a correlation fixed in a **shared past**, not a signal sent now. Born-rule weights are the conserved norm concentrating on the typical branch.

This arena asks whether those emergent quantum features actually fall out of the five base things, where they only reproduce known quantum math, and where the story is still open. Grades follow the depth rubric. **L1** confirms known mathematics. **L2** reproduces a known physics construction on this substrate. **L3** is a measured, controlled, novel consequence of the base rule. Many results here are L1 and L2, labeled as such.

## Audit, 2026-08-31

Read this before the sub-themes. Every "walk" result below runs the
hand-written coined Dirac walk in `code/dynamics/coined-dirac-walk`, not
the lattice-gas rule. The rule is a permutation of ternary slots with no
amplitude, and `foundations/rule-has-no-amplitudes` (E-FND-0080)
measures that directly: its vacuum is a period-three flash, a seeded
tone is a classical defect that neither spreads nor superposes. So the
thirteen results this readme used to grade L3 (tunneling, zitterbewegung,
Klein, Bloch, Aubry-Andre, Jackiw-Rebbi, winding, cyclotron, the three
bulk-boundary results, the Page curve, and the exchange-gate Bell
result) are L2 or L1: correct reproductions of known quantum-walk and
Hilbert-space physics, with prior art named in their notes, and
`substrates: 'any'`. **This arena has no L3 result.** The honest map of
what is covered, on what object, is `../quantum-coverage.md`, and the
audit is `../../audit/2026-08-31-experiment-audit.md`. The wording
below ("emerges from the substrate", "the exchange dynamics") predates
the audit. On 2026-08-31 every bullet whose experiment has no substrate or rule in its import graph was reworded to name the model it runs on, so a bullet that still says "the rule" or "the substrate" is one whose file imports them.

## Sub-themes

### 1. The coined walk, dispersion, and single-particle laws

The coined walk (a model, see the audit block above) is unitary and ballistic. On it the Dirac and Schrodinger dispersion, an S-matrix, uncertainty, tunneling, and the Aharonov-Bohm phase are reproduced.

- **[`E-QTM-0004`](../../../test/experiment/quantum/born-interference.ts)** - the unitary walk model interferes and yields a genuine Born probability.
- **[`E-QTM-0022`](../../../test/experiment/quantum/quantum-formalism.ts)** - unitarity, the Born rule, and interference of amplitudes together on the walk model, not the rule.
- **[`E-QTM-0023`](../../../test/experiment/quantum/quantum-walk.ts)** - the quantum walk spreads ballistically while a classical walk only diffuses.
- **[`E-QTM-0024`](../../../test/experiment/quantum/quantum-walk-field.ts)** - the unitary completion of the walk is relativistic and reflection-positive.
- **[`E-QTM-0053`](../../../test/experiment/quantum/emergent-s-matrix.ts)** - the coined Dirac walk model gives a unitary two-channel S-matrix (transmission plus reflection sum to one), while a lossy walk leaks probability.
- **[`E-QTM-0056`](../../../test/experiment/quantum/tunneling-law.ts)** - sub-gap tunneling decays exponentially at the exact discrete walk rate, off the continuum Dirac rate by 17 percent and converging to it, a hardware-testable prediction.
- **[`E-QTM-0059`](../../../test/experiment/quantum/uncertainty-principle.ts)** - every Gaussian packet saturates sigma_x sigma_p = 1/2 exactly, a flat-top packet sits far above the bound.
- **[`E-QTM-0060`](../../../test/experiment/quantum/schrodinger-limit.ts)** - the walk recovers the Schrodinger dispersion with exact discrete effective mass tan(mass), the massless walk stays linear.
- **[`E-QTM-0062`](../../../test/experiment/quantum/flux-period.ts)** - the ring spectrum shifts periodically with threaded flux (one flux quantum), a global phase changes nothing, the Aharonov-Bohm effect on the walk.

### 2. Born-rule statistics and the complex structure

Where the |amplitude|^2 weights, the imaginary unit, and the continuous phase come from without being inserted.

- **[`E-QTM-0005`](../../../test/experiment/quantum/born-rule.ts)** - given the amplitude-equals-sqrt-count postulate, additivity of disjoint outcomes makes exponent 2 the unique self-consistent power, p = 1 and p = 3 rejected (branch counting).
- **[`E-QTM-0012`](../../../test/experiment/quantum/envariance-born.ts)** - the Born rule DERIVED from envariance: equal-amplitude entangled outcomes are swap-symmetric hence equiprobable, unequal ones fine-grain to the equal case, giving |amplitude|^2, with a symmetry-free product-state control.
- **[`E-QTM-0046`](../../../test/experiment/quantum/born-weight-from-conservation.ts)** - given the orthogonal rotation coin, the quadratic intensity is the only conserved measure among the candidates, a non-orthogonal coin control breaks the conservation.
- **[`E-QTM-0067`](../../../test/experiment/quantum/born-norm-concentration.ts)** - the conserved norm concentrates branch weight on the Born frequency while branch counting concentrates at one half for every state and breaks under unitary refinement.
- **[`E-QTM-0041`](../../../test/experiment/quantum/emergent-imaginary-unit.ts)** - quantum-walk interference emerges from a purely real two-component walk, so the effective i is the rotation between the lattice forward and backward slots.
- **[`E-QTM-0047`](../../../test/experiment/quantum/continuous-phase-from-discrete-coin.ts)** - the continuous U(1) phase emerges from the discrete coin (about 126 distinct values), the degenerate coin collapses the field to one phase.

### 3. Entanglement, Bell/CHSH, and nonlocality

Genuine two-part correlations no classical theory can match, reached in Hilbert-space models (not from the rule), plus contextuality and the temporal Bell test.

- **[`E-QTM-0001`](../../../test/experiment/quantum/alignment.ts)** - aligned bits, not bare bits, buy a CHSH violation.
- **[`E-QTM-0002`](../../../test/experiment/quantum/bell.ts)** - an engineered superdeterministic model climbs CHSH past 2 as setting-state correlation rises.
- **[`E-QTM-0003`](../../../test/experiment/quantum/bell-nonlocality.ts)** - the local CHSH bound is 2 and the quantum value is 2 sqrt 2, the restated gap.
- **[`E-QTM-0011`](../../../test/experiment/quantum/entanglement-bell.ts)** - the exchange-gate model (a Hilbert-space toy, not the rule) produces a maximally entangled state and violates CHSH at the Tsirelson bound, a product-state control gives concurrence 0.
- **[`E-QTM-0038`](../../../test/experiment/quantum/tsirelson-forced-by-coin.ts)** - the Tsirelson bound follows from anticommutation in any qubit theory, and the {3,4,3,4} coin quaternion units supply the anticommuting pair, so the quantum maximum is available without tuning.
- **[`E-QTM-0057`](../../../test/experiment/quantum/no-signaling-nonlocality.ts)** - the model singlet violates CHSH at Tsirelson while Alice's marginal is exactly independent of Bob's setting (no signaling), a signaling toy is caught by the same test.
- **[`E-QTM-0058`](../../../test/experiment/quantum/chsh-monogamy.ts)** - the Bell violation is monogamous: a Tsirelson pair forces the third party to zero, the squared sum stays below 8, a GHZ control holds classical correlation in both pairs.
- **[`E-QTM-0061`](../../../test/experiment/quantum/ghz-paradox.ts)** - the GHZ state gives the exact all-versus-nothing signs while no local assignment satisfies the four constraints, absent on a product state.
- **[`E-QTM-0007`](../../../test/experiment/quantum/contextuality-peres-mermin.ts)** - the Peres-Mermin square reaches quantum value 6 against the noncontextual bound 4 on the cell spin algebra.
- **[`E-QTM-0015`](../../../test/experiment/quantum/leggett-garg.ts)** - a coherent qubit reaches the Leggett-Garg value 3/2, violating the macrorealist bound 1 (the temporal Bell test).
- **[`E-QTM-0027`](../../../test/experiment/quantum/synchronicity.ts)** - diverged-but-related subsystems correlate through shared ancestry with no link, the correlation tracking divergence (synchronicity).

### 4. The superdeterminism and shared-past mechanism

The arena's largest cluster. It asks how a spacelike Bell correlation can be real yet carry no action at a distance. The answer is a **common cause in the shared past**, and curvature of the {3,4,3,4} bulk controls how far it reaches.

- **[`E-QTM-0010`](../../../test/experiment/quantum/dynamics.ts)** - in a natural mesh the CHSH violation decays with separation, unlike flat quantum mechanics.
- **[`E-QTM-0029`](../../../test/experiment/quantum/shared-past-curvature.ts)** - measured: curvature collapses the local shared past with separation, so a spacelike Bell correlation needs a seed-anchored common cause.
- **[`E-QTM-0030`](../../../test/experiment/quantum/seed-correlation-dynamics.ts)** - run from a seed, the rule preserves a seed-anchored spacelike correlation but manufactures none from a local seed.
- **[`E-QTM-0031`](../../../test/experiment/quantum/boundary-shared-past.ts)** - the bulk shared past is bulk-mediated not boundary-mediated, a negative for the spatial-holographic escape, leaving the past-boundary seed.
- **[`E-QTM-0032`](../../../test/experiment/quantum/large-hyperbolic-decay.ts)** - on a genuine 20k-cell hyperbolic tessellation shell growth is exponential and the local shared past collapses, confirming the curvature mechanism on the committed substrate.
- **[`E-QTM-0033`](../../../test/experiment/quantum/measurement-independence-signature.ts)** - the measured shared past sets a critical separation for the quantum value, smaller on the curved substrate, the violation contingent on settings aligned with the shared past.
- **[`E-QTM-0083`](../../../test/experiment/quantum/critical-separation-genuine.ts)** - the critical-separation signature on the GENUINE {3,4,3,4} substrate (no Bethe-tree stand-in): the shared past never reaches the Tsirelson threshold at any resolvable separation (critical separation zero), so the quantum value is not locally reachable on the real curved substrate, while the flat {3,4,3,4} reaches it at short range, a sharper negative than the tree gave.
- **[`E-QTM-0034`](../../../test/experiment/quantum/cusp-shared-past-power-law.ts)** - the shared past is exponential in bulk distance but only power-law in physical cusp distance, inheriting the holographic shortcut, no shortcut in the flat control.
- **[`E-QTM-0035`](../../../test/experiment/quantum/bulk-chsh-reach.ts)** - through the bulk shortcut the Tsirelson violation is reachable out to an exponentially larger physical distance than on the flat substrate, with no action at a distance.
- **[`E-QTM-0036`](../../../test/experiment/quantum/expanding-bulk-origin-channel.ts)** - on the expanding bulk the common ancestor recedes to the origin as distance grows, so the only distance-independent shared past is the shared origin.
- **[`E-QTM-0037`](../../../test/experiment/quantum/future-boundary-correlation.ts)** - a point in the common future of two spacelike past points correlates them (a connected three-point signal), a causally-disconnected future point gives exactly zero.
- **[`E-QTM-0039`](../../../test/experiment/quantum/genuine-hyperbolic-power-law.ts)** - on a genuine {7,3} tessellation the shared past is exponential in bulk distance and bulk distance is logarithmic in physical distance, composing to a power law, so [`E-QTM-0034`](../../../test/experiment/quantum/cusp-shared-past-power-law.ts) is not a tree artifact.
- **[`E-QTM-0040`](../../../test/experiment/quantum/two-ended-classical-ceiling.ts)** - the classical two-ended correlation is causal but washes out with a larger future boundary, so the strong flat correlation must come from the emergent quantum layer.
- **[`E-QTM-0042`](../../../test/experiment/quantum/bell-deviation-prediction.ts)** - near distance the model Bell violation is exactly Tsirelson (matching every lab test), beyond a crossover it declines as a power law in physical distance while quantum mechanics stays flat, a falsifiable cosmological-scale signature.

### 5. Measurement, settling, and decoherence

The measurement story: a definite record forms by deterministic settling at an open edge, coherence is lost to the wake without a collapse postulate, and the definite outcome survives noise. Selection among symmetric alternatives is the acknowledged open problem.

- **[`E-QTM-0016`](../../../test/experiment/quantum/measurement-settling.ts)** - measurement as deterministic settling: the open edge forms a definite irreversible record, the closed system stays coherent (Loschmidt echo recovers it exactly).
- **[`E-QTM-0019`](../../../test/experiment/quantum/pointer-basis-selection.ts)** - a drain coupled along one axis writes the record along that axis and not the orthogonal one, an axis-selection consistency result for the pointer basis.
- **[`E-QTM-0043`](../../../test/experiment/quantum/single-outcome-no-spontaneous-selection.ts)** - the single outcome is deterministic, but SELECTION among symmetric alternatives is not provided by the reversible rule (symmetric drains hold the pointer at zero), the same no-spontaneous-breaking obstruction as the three generations.
- **[`E-QTM-0044`](../../../test/experiment/quantum/selection-from-symmetry-breaking.ts)** - the selection obstruction is resolved in principle by spontaneous symmetry breaking: below a critical point an infinitesimal bias selects a branch and susceptibility diverges, and the model has such a transition.
- **[`E-QTM-0045`](../../../test/experiment/quantum/selection-at-the-selves-layer.ts)** - the sharp either-or is demonstrated at the emergent-self layer in a nucleation toy: a seed below the critical radius dies, above it persists as a definite localized self, the tie to the committed rule staying open.
- **[`E-QTM-0084`](../../../test/experiment/quantum/no-amplifier-in-reversible-rule.ts)** - the dynamical ROOT of the selection obstruction, measured: the committed reversible rule does not scramble (a single-slot perturbation stays microscopic across sizes, a chaotic rule would reach one half) and generic microstates drain to the null pointer even with dissipation, while a metastable bistable attractor does select, so the amplifier requires the emergent attractor layer, not the bare rule or simple dissipation.
- **[`E-QTM-0085`](../../../test/experiment/quantum/arrow-is-the-amplifier.ts)** - the amplifier IS the arrow (the fifth base thing): with the value direction on, the active committed rule scrambles a single-cell seed to about a third of the mesh (sensitive dependence, robust across size), so a microscopic seed selects a macroscopic branch, while the same rule at dead peace (arrow off) keeps the seed microscopic, supplying from within the committed base the amplifier the reversible rule lacks ([`E-QTM-0084`](../../../test/experiment/quantum/no-amplifier-in-reversible-rule.ts)).
- **[`E-QTM-0086`](../../../test/experiment/quantum/record-needs-a-self.ts)** - the record must be a SELF (the capstone): with the arrow on the rule amplifies but never settles (its coarse record keeps churning), with the arrow off and a drain it settles but dies (drains to empty), so the bare rule holds no live definite record, while an emergent self stays alive and holds a definite configuration, tying the definite outcome to the selves layer as an ingredient (the amplifier is the arrow, the holder is the self).
- **[`E-QTM-0087`](../../../test/experiment/quantum/self-records-the-bit.ts)** - the measurement ASSEMBLED: a system bit clamped as a source during the interaction is recorded by the self into a definite held pointer that tracks the bit (plus settles left of minus, robust across size) and holds still after release, so the two pointer states are inherited from the measured system through the interaction (the arrow amplifies, the self holds), a single self alone being monostable so the two-ness comes from the system.
- **[`E-QTM-0088`](../../../test/experiment/quantum/amplifier-lyapunov-exponent.ts)** - the amplifier QUANTIFIED: the fitted Lyapunov exponent of the arrow-driven rule is essentially zero at dead peace (the reversible rule is non-chaotic, ~0.003 per beat) and clearly positive for arrow above zero (~0.03 to 0.085 per beat, peaking near arrow 0.05), so the arrow supplies a measured positive exponential amplification rate the reversible rule lacks, and the peak explains [`E-QTM-0085`](../../../test/experiment/quantum/arrow-is-the-amplifier.ts)'s non-monotonic scrambling.
- **[`E-QTM-0089`](../../../test/experiment/quantum/record-lives-on-the-flat-layer.ts)** - WHERE the record lives, from geometry: a compact charge blob disperses on the raw hyperbolic {3,4,3,4} bulk (exponential shell growth dilutes it to ~0.19 of initial) while it persists on the flat D4 lattice (~0.86), so curvature disperses records rather than binding them, locating the holder ([`E-QTM-0086`](../../../test/experiment/quantum/record-needs-a-self.ts)) on the emergent flat horosphere one layer up from the substrate.
- **[`E-QTM-0090`](../../../test/experiment/quantum/holder-derived-from-the-rule.ts)** - the holder DERIVED from the rule: the committed conserving rule keeps a compact charge structure bound at ~0.86 of initial indefinitely on the flat layer with no added cohesion (stable from beat 400 to 800), while curvature disperses it (~0.17), so the self-maintaining holder [`E-QTM-0086`](../../../test/experiment/quantum/record-needs-a-self.ts)/0087 modeled with the self-kit emerges from the base rule itself, closing the holder half of the [`E-QTM-0045`](../../../test/experiment/quantum/selection-at-the-selves-layer.ts) tie.
- **[`E-QTM-0091`](../../../test/experiment/quantum/collapse-is-not-the-weight.ts)** - the honest EDGE of the arc: the definite outcome and its Born weight are separate mechanisms. The emergent holder settles every run to a definite branch (collapse works) but the fraction settling to A is a STEP in the bias (flat on each side of the midpoint, jumping across it), not the proportional or squared Born weight, so |amplitude|^2 is not microstate counting on the holder and must come from the conserved norm ([`E-QTM-0067`](../../../test/experiment/quantum/born-norm-concentration.ts)) or envariance ([`E-QTM-0012`](../../../test/experiment/quantum/envariance-born.ts)).
- **[`E-QTM-0092`](../../../test/experiment/quantum/lyapunov-recordability-ceiling.ts)** - the UPPER edge of the recordability window: a coherent record survives only below a Lyapunov ceiling. Sweeping the arrow on the flat layer, the record contrast anticorrelates with the fitted Lyapunov exponent (high lambda at small arrow scrambles the seeded excess away, near-zero lambda at large arrow holds it), so with the arrow-supplied amplifier ([`E-QTM-0084`](../../../test/experiment/quantum/no-amplifier-in-reversible-rule.ts)/0085/0088, the lower edge) records live in a Lyapunov window, mirroring the Timeless Dynamics Hyperion threshold where coherent records persist only below the chaos rate. Because the same arrow both forms and erases a record, a persistent record needs the self-holder ([`E-QTM-0086`](../../../test/experiment/quantum/record-needs-a-self.ts)/0090).
- **[`E-QTM-0049`](../../../test/experiment/quantum/decoherence-immunity.ts)** - the definite outcome persists while coherence is destroyed across a size sweep, so vibe reaches the Orch-OR destination with no coherence bill (Hameroff bridge).
- **[`E-QTM-0050`](../../../test/experiment/quantum/thermal-record-immunity.ts)** - the definite outcome survives thermal noise, the warm prong of the Tegmark objection (Hameroff bridge).
- **[`E-QTM-0051`](../../../test/experiment/quantum/energy-time-collapse-law.ts)** - the walk model's dephasing (collapse) time is set by the energy gap, t = pi/dE, the deterministic reconstruction of Penrose OR.
- **[`E-QTM-0065`](../../../test/experiment/quantum/lindblad-collisions.ts)** - fresh-environment collisions give exact exponential Lindblad decay while a reused environment revives, Markovianity from causal freshness.
- **[`E-QTM-0066`](../../../test/experiment/quantum/measurement-chain.ts)** - the copy chain turns a micro superposition into a macroscopic record: coherence decays exponentially, a 20-cell fragment carries the full pointer, ten disjoint fragments each suffice (redundant objectivity).

### 6. Reversibility, ontology, and quantum codes

The base rule is an exact reversible permutation. That underwrites purification, an ontological beable basis, and the smallest quantum error-detecting codes.

- **[`E-QTM-0008`](../../../test/experiment/quantum/cycle-reversibility.ts)** - no persistent charge circulation around closed loops.
- **[`E-QTM-0020`](../../../test/experiment/quantum/purification.ts)** - the reversible knit realizes purification: a mixed local marginal is the recoverable view of a pure reversible whole (Chiribella, D'Ariano), a lossy control fails to recover.
- **[`E-QTM-0026`](../../../test/experiment/quantum/reversible-point.ts)** - local detailed balance holds at all arrow rates.
- **[`E-QTM-0052`](../../../test/experiment/quantum/ontological-basis.ts)** - the reversible rule permutes the microstates (finite recurrence plus injectivity, a beable cycle) while a lossy rule never recurs, the t Hooft ontological basis.
- **[`E-QTM-0054`](../../../test/experiment/quantum/css-codes-from-ladder.ts)** - the classical codes under D4 and E8 lift by CSS to the [[4,2,2]] and [[8,3,2]] quantum codes exactly, a non-nested pair anticommutes, the quantum-code ladder from the geometric ladder.
- **[`E-QTM-0055`](../../../test/experiment/quantum/conservation-as-stabilizer.ts)** - the conserved charge is a stabilizer check: single-site errors are detected at the exact beat with zero false positives, a leaky rule fires with no error.

### 7. Reflection positivity, the quantum field, and the vacuum

The field-theoretic side: whether the substrate is reflection-positive (a genuine quantum field), its vacuum structure, and the path integral. Several results are negatives locating RP at the emergent flat layer, not the raw scaffold.

- **[`E-QTM-0009`](../../../test/experiment/quantum/deterministic-spatial-rp.ts)** - the deterministic field is long-range and reflection-positive.
- **[`E-QTM-0013`](../../../test/experiment/quantum/flat-spatial-rp.ts)** - the field is generically massive on flat too, the rule not the geometry causes it.
- **[`E-QTM-0014`](../../../test/experiment/quantum/horosphere-dynamics.ts)** - the field is massive on the emergent flat layer too (horosphere dynamics).
- **[`E-QTM-0017`](../../../test/experiment/quantum/near-critical-rp.ts)** - spatial reflection positivity belongs to the emergent flat layer, not the scaffold.
- **[`E-QTM-0021`](../../../test/experiment/quantum/quantum-field.ts)** - the vacuum is field-like with virtual pairs and a causal cone.
- **[`E-QTM-0025`](../../../test/experiment/quantum/reflection-positivity.ts)** - in the massive regime spatial reflection positivity is undecided (an open question).
- **[`E-QTM-0028`](../../../test/experiment/quantum/time-reflection-positivity.ts)** - the beat-autocorrelation Hankel is positive semidefinite within noise (time reflection positivity).
- **[`E-QTM-0018`](../../../test/experiment/quantum/path-integral.ts)** - a 2D Lorentzian causal-set path integral recovers a mean dimension near two.
- **[`E-QTM-0048`](../../../test/experiment/quantum/memory-kernel-width-dial.ts)** - one memory-kernel width carries a packet from ballistic (the quantum end) to diffusive (the gravity end), Leizerman's one-dial QM-to-gravity map.

### 8. Many-body exchange statistics

Bosons, fermions, Pauli exclusion, and bound states from the exchange structure of the walk.

- **[`E-QTM-0006`](../../../test/experiment/quantum/bound-composite.ts)** - two attracting particles form a true bound state with discrete levels.
- **[`E-QTM-0063`](../../../test/experiment/quantum/hong-ou-mandel.ts)** - bosons never coincide at the balanced splitter (permanent zero, the Hong-Ou-Mandel dip), fermions always do (determinant one), distinguishable particles sit at one half.
- **[`E-QTM-0064`](../../../test/experiment/quantum/fock-structure.ts)** - the N-fermion amplitude is the Slater determinant of propagator entries (matched to brute force), exact Pauli exclusion and unit norm at six particles, bosons bunch by the permanent.


## Added or first run by the 2026-08-31 audit

- **[`E-QTM-0093`](../../../test/experiment/quantum/toric-code-from-the-mesh.ts)** (L2) - the toric code built from the {3,4,3,4} mesh complex (qubits on D4 edges, X-checks on cells, Z-checks on root triangles) has exactly four logical qubits per connected component, four at side 3 and eight at side 4 where the even side splits the mesh in two, while an open patch has zero and every X-check commutes with every Z-check

- **[`E-QTM-0094`](../../../test/experiment/quantum/ehrenfest-theorem.ts)** (L2) - the Ehrenfest theorem on the coined Dirac walk model: a packet built from the positive band of cos E = cos m cos k follows the classical trajectory of its own momentum distribution to 9e-14 cells free and 0.002 cells under a slow force over 45 cells, momentum exact to 4e-16, once the packet's Berry-connection offset and the midpoint momentum of the step are in the prediction. A force of 0.8 leaves 26 percent in the band and misses by 14 cells, and the equal-chirality rest seed (21 percent negative-energy) lags by 19 cells

## What this arena establishes

- **The single-particle quantum laws are reproducible on the walk model.** The unitary ballistic walk yields the Dirac and Schrodinger dispersion, uncertainty, an S-matrix, tunneling, and the Aharonov-Bohm phase, mostly at L1 and L2 with lossy controls.
- **The Born rule is reachable three independent ways.** Branch-counting additivity, envariance, and norm concentration all land |amplitude|^2, each with a control that fails, and the imaginary unit and continuous phase emerge from the real coin rather than being inserted.
- **Nonlocality is real but carries no action at a distance.** The model singlet hits Tsirelson while marginals stay setting-independent, the violation is monogamous, and GHZ and contextuality reproduce exactly.
- **Spacelike Bell correlations come from a shared past, and curvature sets their reach.** The largest cluster shows the {3,4,3,4} bulk shortcut lets the Tsirelson violation reach exponentially larger physical distances, with a falsifiable power-law decay beyond a crossover that quantum mechanics does not predict.
- **Measurement is deterministic settling plus loss to an open edge.** A definite record forms and holds, coherence leaks to the wake with no collapse law, and the outcome survives decoherence and thermal noise. Selection among symmetric alternatives stays the acknowledged open problem, resolved only in principle by symmetry breaking.
- **Reversibility underwrites the information-theoretic and code structure.** Purification, the ontological beable basis, and the [[4,2,2]] and [[8,3,2]] quantum codes follow from the exact reversible permutation, with lossy and non-nested controls that fail.

## Completeness

All 67 experiments **[`E-QTM-0001`](../../../test/experiment/quantum/alignment.ts)** through **[`E-QTM-0067`](../../../test/experiment/quantum/born-norm-concentration.ts)** appear exactly once above. Counts by sub-theme: 9 + 6 + 11 + 13 + 10 + 6 + 9 + 3 = 67.
