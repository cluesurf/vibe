# Quantum mechanics and quantum field theory coverage

Which standard results the suite reproduces, at what honest depth, on
what object, and which it does not. Built from `test/catalog.csv` after
the 2026-08-31 audit. Depths are the catalog's. "walk" means the
hand-written coined Dirac walk (`code/dynamics/coined-dirac-walk`),
"Hilbert" means a small hand-built Hilbert space, "lattice" means a
tight-binding or lattice-gauge model with no {3,4,3,4} in it, "rule"
means the committed lattice-gas rule on a real mesh. The L3 target is
"rule". As of this date **no quantum result runs on the rule** except
the negative that says why (`foundations/rule-has-no-amplitudes`,
E-FND-0080).

## Quantum mechanics

| topic | experiments (depth, object) | status |
| --- | --- | --- |
| superposition and interference | QTM-0004 born-interference (L2 walk), QTM-0022 quantum-formalism (L2 walk), QTM-0041 emergent-imaginary-unit (L2 walk), QTM-0047 continuous-phase-from-discrete-coin (L2 walk), QTM-0023 quantum-walk ballistic (L2 walk) | reproduced on the walk. From the rule: **no**, and now exactly why: FND-0080 (L2, zero cross term on the charge rule), FND-0081 (L2, the momentum rule's lone tone is an exact ballistic classical particle, signs pass through), FND-0082 (L1, a reversible rule lifted to superpositions is a permutation matrix, so no phase on configurations can interfere), FND-0083 (L1, the induced map on two-tone pairs is a permutation too), and the survivor FND-0084 (L2, the Z_3 coarse amplitude: the flashing vacuum cancels exactly, a defect carries the vacuum clock as a phase, but every defect has the same phase so two never interfere) |
| interference from the dynamics | FND-0086 growth-shifts-the-clock (L3): domains born 1 or 2 beats apart host defects that interfere with cross = 2|A||B|cos exactly, destructive beats included | the arrow supplies the phase, nothing beyond the five things needed |
| measurement at the base | FND-0091 wall-measures-the-clock (L3): the domain wall amplifies exactly one clock class (72/75, quiet controls exact) with counting weights (response = exact sum of singles) | projective collapse yes, quadratic Born weight no: defects occupy one class each and the detector adds counts |
| the sixth-thing specification | FND-0090 madelung-gap, FND-0092 clock-coupled-swap-addition (L2): the walk obeys J = rho grad theta / tan m, the rules have phases without currents and currents without phases, and the minimal coupling transports but amplifies | the surviving construction: reversible conserving transport along phase gradients that preserves the coarse magnitude |
| relative phase between defects | FND-0085 birth-beat-interference (L2): defects made in different beats of the vacuum clock carry different phases, relative 60/300 or 120 degrees, cross term 2 A B cos(rel) exactly, values 6, 3, -3 | interference in the coarse amplitude exists between defects of different birth beat. Open: the rule making such a defect on its own |
| Born rule | QTM-0005 (L1), QTM-0012 envariance (L1), QTM-0046 (L1), QTM-0067 norm concentration (L1), QTM-0091 collapse-is-not-the-weight (L2) | known arguments restated. The square enters by construction in each. Open from the rule |
| uncertainty relation | QTM-0059 uncertainty-principle (L1 Hilbert) | Gaussian saturation, known math |
| Schrodinger (nonrelativistic) limit | QTM-0060 schrodinger-limit (L2 walk) | omega = m + k^2 / (2 tan m), the walk's own effective mass |
| Ehrenfest theorem, classical limit | QTM-0094 ehrenfest-theorem (L2 walk) | a positive-band packet follows the classical path of its own momentum distribution to 0.002 cells over 45, momentum exact, once the Berry-connection offset and the midpoint momentum are in the prediction. A fast force (Zener) and a mixed-band seed break it |
| harmonic oscillator spectrum | none by title. SPN-0002 atoms-shell-filling (L2 lattice) uses a harmonic well but measures shells | **open** as a spectrum |
| hydrogen and atoms | SPN-0018 hydrogen-spectrum (L2 lattice, Rydberg series), SPN-0017 helium (L1 formula), SPN-0023 H2+ (L1 formula), SPN-0002 shells (L2 lattice) | reproduced |
| tunneling | QTM-0056 tunneling-law (L2 walk), QTM-0082 landau-zener (L2 walk) | reproduced, with the exact discrete law |
| Dirac equation and dispersion | SPN-0009 dirac-3plus1-3434 (L2), SPN-0030 sp-spinor-field-3434 (L2), RLT-0008 dirac-from-discrete (L2 walk), QTM-0072 zitterbewegung (L2 walk), QTM-0073 klein (L2 walk), SPN-0043 chiral-fermion-no-doubling (L2), SPN-0004 chirality (L2 lattice) | reproduced. RLT-0008 does not derive the walk from the rule |
| spin-1/2 and the 2 pi sign | SPN-0029 rotation-2pi (L1), SPN-0031 (L1), SPN-0042 (L2), SPN-0026 persistent-spinor-defect (L2 director field), SPN-0012, 0028, 0033 ({5,3,4}, L2) | known group arithmetic on the coin, plus defect and holonomy versions |
| spin-statistics and exclusion | SPN-0014 fermi-exclusion (L1), SPN-0013 exchange-phase (L0), QTM-0063 hong-ou-mandel (L1), QTM-0064 fock-structure (L2 Slater determinants) | the sign is an input everywhere. A dynamical spin-statistics result is **open** |
| entanglement, Bell, contextuality | QTM-0011 (L1 Hilbert), QTM-0003, 0038, 0057, 0058, 0061 (L1), QTM-0007 Peres-Mermin (L2), QTM-0015 Leggett-Garg (L2) | known Hilbert-space facts. The Tsirelson value is textbook, not "the substrate's own dynamics" |
| Bell correlations from the substrate | QTM-0029 to 0040, 0083 shared-past family (L2, on real meshes) | an honest **negative**: on the genuine {3,4,3,4} tessellation the shared past never reaches the Tsirelson threshold (QTM-0083) |
| measurement, decoherence, records | QTM-0016, 0043 to 0045, 0049 to 0052, 0065, 0066, 0070, 0071, 0084 to 0092 (L2, several on the committed rule with the arrow) | the strongest quantum-adjacent work on the rule: the arrow as amplifier, the record needing a self, a Lyapunov ceiling |
| Lindblad, open systems | QTM-0065 lindblad-collisions (L2) | reproduced |
| adiabatic theorem, Berry phase | none by title | **open** |
| Aharonov-Bohm, flux quantization | FRC-0016 emergent-u1-gauge (L2 lattice), QTM-0062 flux-period (L2) | reproduced |
| Landau levels, cyclotron, g-factor | FRC-0021 g-factor-3434 (L2), QTM-0078 cyclotron-orbits (L2 walk), FRC-0040 magnetism (L2) | reproduced |
| Zeeman, Stark, spin-orbit | none by title | **open** |
| quantum Zeno | SLF-0171 zeno-holding (L2, selves arena) | present, mislocated |
| no-cloning, teleportation | FND-0065 (L2), QTM-0068 (L2), HLG-0035 (L2) | reproduced |
| path integral | QTM-0018 (L2 causal set) | reproduced |
| scattering, S-matrix | QTM-0053 emergent-s-matrix (L2 walk) | reproduced |
| topological phases, anyons | QTM-0077 to 0081 (L2 walk), SPN-0038 ternary-anyons (L2), SPN-0001 anyon-deconfinement (L1 formula) | reproduced. SPN-0001 should build the Z_3 gauge theory on the mesh (roadmap idea) |
| quantum error correction | QTM-0054 css-codes (L1), QTM-0055 conservation-as-stabilizer (L2) | known constructions |
| density matrices, Wigner functions, coherent states | none by title | **open** |

## Quantum field theory

| topic | experiments (depth, object) | status |
| --- | --- | --- |
| the vacuum as a field, virtual pairs | QTM-0021 quantum-field (L2) | reproduced. Note: the committed rule's own vacuum is a period-three flash (E-FND-0080), a fact the QFT rows have not yet used |
| reflection positivity, Osterwalder-Schrader | QTM-0009, 0013, 0017, 0025, 0028 (L2), RLT-0005 (L2) | measured, one undecided (QTM-0025) |
| Fock space, second quantization | QTM-0064 (L2), FRC-0002 anomaly-free generation (L2 octonion Clifford), foundations fermions-from-octonions | algebraic. The bridge from the rule to "one mode filled" is **open** (next-paper ideas) |
| propagators, Dirac plus Maxwell | SCL-0006 (L1, fermion dispersion typed, Maxwell spectrum real, its zero-mode count now compared with the predicted sites + 2) | the fermion half must be measured off an operator. **open** |
| gauge invariance, Gauss law, Ward identity | FRC-0014 emergent-gauge (L2, partial), FRC-0008 coupled-qed-3434 (L2), FRC-0016 Wilson loop (L2), FRC-0072 ward-identity-maxwell (L2 lattice) | the Gauss law is measured, and the Ward identity is now measured exactly: the Maxwell operator annihilates every gradient field, has exactly sites + 2 zero modes (gradients plus the three torus Wilson lines), a Proca mass breaks both by exactly m squared |
| non-abelian gauge, Yang-Mills, confinement | FRC-0007 confinement (L2 lattice SU(2)), FRC-0039 (L2), FRC-0038 (L2), FRC-0048 condensate (L2), FRC-0049 (L2 1D) | reproduced lattice gauge theory |
| Higgs mechanism | FRC-0027 higgs (L0), FRC-0012 W and Z masses (L2 formula) | the L0 is circular. A measured Higgs mechanism on a lattice is **open** |
| Goldstone theorem | none by title | **open** |
| anomalies, index theorem, charge quantization | FRC-0002 (L2), FRC-0028 index-theorem (L2), FRC-0003 (L0), FRC-0045 schwinger condensate (L2) | reproduced, one circular |
| fermion doubling, chirality | FRC-0004 chiral-gauge (L0), SPN-0043 (L2), SPN-0004 (L2) | reproduced, one circular |
| running couplings, unification, proton decay | FRC-0044, 0054, 0056, 0019 (L2), FRC-0043 (L2) | textbook one-loop running of measured inputs |
| renormalization group of a field theory | SCL-0003 (L2 block spin), SCL-0012 (L1 1D decimation), SCL-0011 keystone (L3, effective parameters across sizes) | a beta function of a lattice field coupling is **open** |
| CPT, Lorentz | SPN-0037 CPT exact (L2), RLT-0030 propagating-mode-3434 (L3), RLT-0042, 0043 exact discrete boosts (L2), RLT-0018 (L3) | measured on {3,4,3,4} |
| Casimir effect | SLF-0017, 0018 (L2, selves arena) | present, mislocated |
| Hawking and Unruh | GRV-0001 analog-hawking (L2), GRV-0026 hawking (L2, mentions Unruh), GRV-0051 (L2) | reproduced analogues |
| Schwinger pair production, vacuum energy | none by title (FRC-0045 is the Schwinger model condensate, not pair production) | **open** |
| black-body spectrum, photoelectric | none | **open** (and arguably out of scope until a photon field runs on the rule) |

## The gaps, ranked by what closing them would settle

1. **Anything from the rule.** Every row above is on a walk, a Hilbert
   space or a lattice model. The one experiment on the rule is the
   negative. The bridge (a coarse-graining from ternary configurations
   to amplitudes) is the program's open problem, and the next-paper
   `ideas.md` lists candidate constructions with the test each must
   pass.
2. **A measured Ward identity** on the lattice Maxwell operator. Done
   (E-FRC-0072), and it corrected its own first prediction: the count
   is sites + 2, not sites - 1, because the three constant link fields
   are closed but not exact on the torus.
3. **The fermion propagator measured off an operator** for SCL-0006,
   from `operator/lattice-fermion`, not a typed dispersion.
4. **Dynamical spin-statistics**: a spinor defect on the mesh exchanged
   with another and the sign read off the dynamics.
5. **Ehrenfest, harmonic oscillator, adiabatic theorem, Berry phase,
   Goldstone, coherent states, density matrices**: cheap L2 fills on
   existing models, worth doing only once labeled honestly as such.
6. **SPN-0001** rebuilt as a real Z_3 gauge theory on the mesh's
   plaquettes, which would also exercise the period-three vacuum.

## Quantum codes, error correction, qubits, and automata in hyperbolic spaces

What exists, on what object, and what the base can and cannot yet do.

| topic | experiments (depth, object) | status |
| --- | --- | --- |
| a stabilizer code from the mesh complex | QTM-0093 toric-code-from-the-mesh (L2, the D4 complex of `d4Mesh`): qubits on edges, X-checks on cells, Z-checks on root triangles, k = 4 per four-torus measured by GF(2) rank, open patch k = 0, checks commute | reproduced on the substrate's own complex. Found on the way that an even-sided `d4Mesh` is two disconnected lattices (roadmap 0017) |
| the Z_3 (qutrit) code on the same complex | QTM-0095 qutrit-toric-code-from-the-mesh (L2): oriented boundary maps over the field of three elements, checks commute, k = 4 per four-torus by rank over Z_3, open patch 0 | the code whose alphabet is the tone. Next: compare the conserved charge with the vertex checks directly, and the hyperbolic version on a closed quotient |
| classical codes under the lattices | FND-0067 codes-under-the-lattices (L1), QTM-0054 css-codes-from-ladder (L1, the [[4,2,2]] and [[8,3,2]] from D4 and E8) | known algebra |
| the rule as a classical code | QTM-0055 conservation-as-stabilizer (L2, the conserved charge as a check), HLG-0007 growing-code (L3, erasure thresholds rising with shell on {5,3,4} under the tone dynamics), HLG-0013 holographic-memory (L3, a spread encoding survives an erasure a blob does not) | measured on the rule. These are the only error-correction results that run the base |
| holographic (HaPPY) codes | HLG-0008 happy-code-534, HLG-0009 happy-tiling-534, HLG-0012 holographic-code-534, HLG-0014 holography-from-rule (all L2, {5,3,4}) | reproduced constructions on the hyperbolic tiling |
| qubits from the rule | none | **cannot be posed yet**: the rule has no amplitudes (E-FND-0080). A qubit needs a two-dimensional complex state space; the closest object on the rule is a ternary slot |
| a qutrit (Z_3) code matching the ternary tone | none | **posable now**: the same complex over GF(3), k = b_1 with Z_3 coefficients (still 4 on the torus), and the Z_3 anyons of SPN-0038 as its excitations. Not built |
| hyperbolic surface codes with constant rate (Breuckmann and Terhal 2016) | none | **posable with one more builder**: needs a closed quotient of {5,3,4} or {7,3} (a compact hyperbolic manifold tiling) so k grows with n at fixed rate. The suite has only open patches of those tilings today |
| automata in hyperbolic spaces (Margenstern) | CMP-0001 computation-73 (L1, the {7,3} railway prerequisites), CMP-0006 p213-universality, CMP-0012 universality (L2), CMP-0007 and 0008 reversible-universality (L2, the pair table is a bijection and Toffoli computes NAND), CMP-0011 turing-3434 (L2, routing, gates and memory on {3,4,3,4}), FND-0046 beat-computes-on-mesh (L2), the addressing arena (Fibonacci and {3,4,3,4} addressing, greedy routing) | reproduced. Universality is argued from the primitives (bijection, NAND, routing, memory), each measured, but no single experiment runs a complete universal machine on the mesh end to end |
| a running automaton from the rule | FND-0046 beat-computes-on-mesh, CMP-0011 turing-3434 | partial: gates and routing run under the knit, a full program (a counter, a Turing tape) does not yet |

The honest gap list here: a qutrit code on the D4 complex (cheap), a
closed hyperbolic quotient builder (medium, unlocks constant-rate
codes and closed-surface automata), a complete machine run end to end
under the knit (medium), and qubits from the rule (blocked on the
middle layer, like everything with an amplitude).

## The rule-level rows: can each be posed on the lattice gas at all?

Every "none from the rule" cell above is one of three kinds. Saying
which is a finding, not a blank.

| cell | kind | why |
| --- | --- | --- |
| superposition, interference, Born rule, entanglement and Bell, Dirac dispersion, tunneling, topological phases, S-matrix, Landau-Zener | **cannot be posed yet**, and the obstruction is now exact | each needs a complex amplitude. E-FND-0082 shows a reversible rule lifted to superpositions of configurations is a permutation matrix (49 branches, 49 images, cross term 0, norm conserved), so a phase assigned to configurations is relabelled, never added, whatever the phase. E-FND-0083 shows the induced map on two-tone pairs is a permutation as well (1104 states, 1104 images). E-FND-0081 shows the momentum rule's single tone is an exact ballistic classical particle whose sign is not a phase. So the middle layer cannot be a phase on configurations or on pairs. What is left is a coarser variable (a count or density over many cells or beats) whose induced dynamics is many-to-one and unitary on the coarse space. The candidates and the test each must pass are in the monorepo's `note/research/vibe/next-paper/ideas.md` |
| the Ward identity, gauge invariance | **posable now, on the rule's own conserved charge** | the pair table conserves charge per pair (E-FRC-0014 measures the Gauss law). The rule-level Ward statement is that the conserved charge current is the only thing a coupled gauge field can see. It is posable as a lattice-gauge experiment on `d4Mesh` with the tone as the matter current, and has not been done |
| spin-statistics, exclusion | **posable now, as a dynamics** | two spinor defects on the mesh (E-SPN-0026 has one) exchanged by a sequence of beats and the sign read off. Open |
| the uncertainty relation, the Schrodinger limit, Ehrenfest, harmonic oscillator, Zeeman, Berry phase, coherent states, density matrices | **cannot be posed yet** | all presuppose an amplitude, the same obstruction as the first row |
| measurement, records, decoherence | **posed already** | E-QTM-0084 to 0092 run the committed rule with the arrow and measure amplification, records and a Lyapunov ceiling. These are the only quantum-adjacent results on the rule and they are about the classical side of measurement, which is consistent with the rule having no amplitudes |
| the vacuum | **posed already** | the rule's vacuum is a period-three flash (E-FND-0080), and no QFT row has yet used that fact |
| CPT, Lorentz | **posed already** | E-SPN-0037, E-RLT-0030, E-RLT-0018 measure them on {3,4,3,4} |
| Hawking, Unruh, Casimir, Schwinger, black-body | **cannot be posed yet** | field-theoretic quantities on top of a quantum field the rule does not have |

So the quantum arena's honest situation is: everything that needs an
amplitude waits on one construction, two things (the rule-level Ward
identity and dynamical spin-statistics) could be attempted today, and
the measurement and vacuum results already on the rule are classical
facts about it.

## Reading this table

A row that says "walk" or "Hilbert" is a correct reproduction of known
physics and can be cited as such with its prior art. It is not evidence
about the base. A row that says "rule" is the only kind that counts
toward the goal, and today that column holds one negative result.
