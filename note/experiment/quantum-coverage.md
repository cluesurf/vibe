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
| superposition and interference | QTM-0004 born-interference (L2 walk), QTM-0022 quantum-formalism (L2 walk), QTM-0041 emergent-imaginary-unit (L2 walk), QTM-0047 continuous-phase-from-discrete-coin (L2 walk), QTM-0023 quantum-walk ballistic (L2 walk) | reproduced on the walk. From the rule: **no**, E-FND-0080 measures zero cross term |
| Born rule | QTM-0005 (L1), QTM-0012 envariance (L1), QTM-0046 (L1), QTM-0067 norm concentration (L1), QTM-0091 collapse-is-not-the-weight (L2) | known arguments restated. The square enters by construction in each. Open from the rule |
| uncertainty relation | QTM-0059 uncertainty-principle (L1 Hilbert) | Gaussian saturation, known math |
| Schrodinger (nonrelativistic) limit | QTM-0060 schrodinger-limit (L2 walk) | omega = m + k^2 / (2 tan m), the walk's own effective mass |
| Ehrenfest theorem, classical limit | none by title. QTM-0048 memory-kernel-width-dial (L2) spans ballistic to diffusive | **open** |
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
| propagators, Dirac plus Maxwell | SCL-0006 (L1, fermion dispersion typed, Maxwell spectrum real) | the fermion half must be measured off an operator. **open** |
| gauge invariance, Gauss law, Ward identity | FRC-0014 emergent-gauge (L2, partial), FRC-0008 coupled-qed-3434 (L2), FRC-0016 Wilson loop (L2) | the Gauss law is measured. A Ward identity (longitudinal photon decoupling) is **open** |
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
2. **A measured Ward identity** on the lattice Maxwell operator
   (roadmap quantum-coverage-0004), replacing "zero modes exist".
3. **The fermion propagator measured off an operator** for SCL-0006,
   from `operator/lattice-fermion`, not a typed dispersion.
4. **Dynamical spin-statistics**: a spinor defect on the mesh exchanged
   with another and the sign read off the dynamics.
5. **Ehrenfest, harmonic oscillator, adiabatic theorem, Berry phase,
   Goldstone, coherent states, density matrices**: cheap L2 fills on
   existing models, worth doing only once labeled honestly as such.
6. **SPN-0001** rebuilt as a real Z_3 gauge theory on the mesh's
   plaquettes, which would also exercise the period-three vacuum.

## Reading this table

A row that says "walk" or "Hilbert" is a correct reproduction of known
physics and can be cited as such with its prior art. It is not evidence
about the base. A row that says "rule" is the only kind that counts
toward the goal, and today that column holds one negative result.
