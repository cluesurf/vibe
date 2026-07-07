# Features and Capabilities at a Glance

What `@cluesurf/vibe` solves for, in tables. The library builds discrete
substrates and reads physics off them. The rows below are the physics it
can model and measure, the substrates it can build, the operators and
measures and dynamics it ships, and the headline results it has
established. Each row points to where to look.

Status key for the physics rows: **solid** is verified with a control
that could fail, **partial** is a real structure established with the
final step open, **open** is a genuine frontier (open in physics, not
just here), **negative** is a result correctly reporting a no.

## Physics it solves for

### Geometry and space

| capability                                | what it does                                                               | where                                              |
| ----------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------- |
| build any regular hyperbolic tessellation | 2D tilings through 5D pentacombs, the full enumerated catalog              | `api/substrate`, `tessellation-engine.md`          |
| measure dimension                         | spectral, ball-growth, box-counting, Myrheim-Meyer                         | `measure/dimension`, `geometry/dimension`          |
| measure curvature                         | Forman-Ricci, mean curvature, Gromov hyperbolicity, the shell growth ratio | `measure/curvature`, `measure/shell-growth-ratio`  |
| confirm flatness vs hyperbolicity         | the Gram signature and growth ratio per substrate                          | `measure/tessellation-battery`                     |
| the flat cusp of a hyperbolic honeycomb   | the horosphere, flat 3D space inside {3,4,3,4}                             | `substrate/horosphere`, `geometry/horosphere-flat` |
| recover the metric from graph distance    | the emergent metric matches Euclidean on the flat coin                     | `geometry/gm-geometry-3434`                        |
| select 3+1 dimensions                     | why the substrate lands on three space plus one time                       | `geometry/why-3plus1`                              |

### Relativity

| capability                             | what it does                                            | status / where                                        |
| -------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| a finite isotropic light cone          | a ballistic causal cone with an emergent speed c        | solid, `relativity/light-cone-3434`                   |
| emergent Lorentz isotropy              | the cone is direction-independent, 24 directions beat 6 | solid, `measure/lorentz`, `relativity/isotropy-24dir` |
| relativistic dispersion                | E squared equals p squared plus m squared, measured     | solid, `relativity/measured-dispersion-3434`          |
| boost invariance and velocity addition | the IR Lorentz group, the UV lattice breaking           | solid, `relativity/emergent-boost-3434`               |
| the arrow of time                      | entropy rises under the reversible rule                 | solid, `relativity/`                                  |
| symmetry restoration                   | discrete F4 anisotropy vanishes in the infrared         | solid, `relativity/symmetry-restoration-3434`         |

### Spin and fermions

| capability                                       | what it does                                              | status / where                                                            |
| ------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| spin-half, the 2pi double-cover sign             | a spinor flips at 2pi, returns at 4pi                     | solid, `spin/rotation-2pi`, `algebra/group/rotation`                      |
| the D4 spinor coin (8v + 8s + 8c)                | the 24-cell directions carry two spinor sectors           | solid, `spin/spinor-triality`, `algebra/group/cell-24`                    |
| a fermion propagates on any hyperbolic substrate | the Kahler-Dirac fermion is in the extended phase         | solid, `measure/fermion-propagation`, `spin/kahler-dirac-propagation-534` |
| spin from a topological defect                   | a disclination gives the spinor minus-one, vector blind   | solid, `spin/disclination-spin-534`, `algebra/group/disclination`         |
| a collective mode carries spin                   | the spinor sign is a field property, not a probe artifact | solid, `spin/collective-spinor-534`                                       |
| the spin connection on a curved substrate        | the edge-loop holonomy is the double cover                | solid, `spin/spin-connection-534`                                         |
| full 3+1D Dirac                                  | gamma matrices, the Clifford algebra, the dispersion      | solid, `spin/dirac-3plus1-3434`, `algebra/group/clifford`                 |
| the g-factor, measured                           | g equals 2 from the Dirac Landau spectrum, not assumed    | solid, `gauge/g-factor-3434`, `operator/landau`                           |
| the mass mechanism, measured                     | mass is the 8s-8c chirality coupling, Weyl limit when off | solid, `relativity/measured-emergent-mass-3434`                           |
| spin AND curvature on one substrate              | a fermion propagates on the 5D D4 pentacomb               | solid, `substrate-survey/pentacomb-propagation`                           |

### Gauge fields and forces

| capability                             | what it does                                             | status / where                                                  |
| -------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| an emergent photon                     | a massless transverse spin-1 mode                        | solid, `gauge/ph-photon-3434`                                   |
| local U(1) gauge invariance            | the global charge promotes to a local symmetry           | solid, `gauge/ph-photon-3434`                                   |
| the lattice Lorentz force              | a charged wavepacket deflects in a B-field               | solid, `gauge/ph-magnetism-3434`, `dynamics/peierls-wavepacket` |
| lattice QED, coupled                   | the Schwinger model on the substrate sectors             | solid, `gauge/coupled-qed-3434`, `dynamics/schwinger-coupled`   |
| photon-fermion co-emergence, dynamical | the sectors source and deflect each other under one rule | solid, `gauge/coemergence-dynamical-3434`                       |
| non-abelian gauge                      | the SU(2) algebra closes with self-interaction           | solid, `gauge/non-abelian-3434`                                 |
| the chiral condensate                  | dynamical mass from a gauge interaction                  | solid, `operator/overlap-condensate`, `gauge/su2-condensate`    |
| the lattice index theorem              | the overlap index equals the gauge topology              | solid, `operator/gauge-index`                                   |
| the coupling value (the 1/137 problem) | the bare rule fixes the form, not the value              | negative, `gauge/coupling-not-fixed-3434`                |

### Mass and generations

| capability                 | what it does                                               | status / where                                          |
| -------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| the mass mechanism         | the 8s-8c chirality coupling, measured two agreeing ways   | solid, `relativity/measured-emergent-mass-3434`         |
| the F4 to J3(O) chain      | the 24 directions force a rank-three exceptional structure | partial, `spin/generations-f4-jordan`, `algebra/jordan` |
| the family symmetry        | an exact S3 permutes the three Jordan slots                | partial, `spin/generation-family-symmetry-3434`         |
| three distinct generations | splitting the three degenerate slots (Boyle's conjecture)  | open, the slots are degenerate                          |

### Gravity

| capability                                  | what it does                                                  | status / where                                                      |
| ------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| an effective metric that responds to matter | a discrete Einstein-like equation                             | `gravity/gr-einstein-equations`, `operator/linearized-einstein`     |
| black-hole thermodynamics                   | the first law, Smarr, the M-cubed evaporation                 | `gravity/gr-black-hole-thermo`, `measure/black-hole-thermodynamics` |
| a graviton mode                             | a spin-2 mode from the action                                 | `gravity/graviton-from-action`, `operator/graviton`                 |
| gravitational waves                         | linearized propagation                                        | `gravity/gr-gravitational-waves`                                    |
| analog Hawking and Unruh                    | horizon thermodynamics                                        | `gravity/analog-hawking`, `measure/unruh`                           |
| curved-bulk Newton screening                | clean 3D Newton is the flat cusp, the hyperbolic bulk screens | negative, `measure/gravity-potential`                        |

### Holography

| capability                         | what it does                                           | status / where                                                      |
| ---------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| the 1/r boundary propagator        | the holographic boundary two-point function            | solid, `algebra/linear/bethe-resolvent`, `holography/bethe-gravity` |
| the Ryu-Takayanagi area law        | boundary entanglement equals the minimal bulk geodesic | solid, `measure/holography`, `holography/ryu-takayanagi-73`         |
| holographic error-correcting codes | the HaPPY code and perfect tensors on the bulk         | `holography/happy-code-534`, `holography/holographic-code-534`      |
| persistence by the boundary code   | a deep self is exponentially protected                 | `holography/happy-tiling-534`, `measure/redundancy-code`            |

### Quantum and information

| capability             | what it does                                   | where                                         |
| ---------------------- | ---------------------------------------------- | --------------------------------------------- |
| Bell and CHSH          | the classical bound and its emergent violation | `measure/bell`, `quantum/bell`                |
| the Born rule          | probabilities from amplitudes                  | `quantum/born-rule`, `measure/born-rule`      |
| reflection positivity  | a consistent quantum theory from the rule      | `quantum/reflection-positivity`               |
| entanglement entropy   | region entropy and the area law                | `measure/entanglement`                        |
| the quantum walk       | the Dirac walk and its distribution            | `dynamics/quantum-walk`, `operator/evolution` |
| integrated information | a self measure                                 | `measure/integration`                         |

### Cosmology

| capability                                | what it does                         | where                                                         |
| ----------------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| exponential expansion                     | de Sitter growth and the Hubble rate | `cosmology/expansion`, `dynamics/friedmann`                   |
| inflation                                 | an inflaton-like early phase         | `cosmology/inflation`, `dynamics/inflaton`                    |
| the cosmological constant and dark energy | the vacuum energy and its scale      | `cosmology/cosmological-constant`, `cosmology/dark-energy-4d` |
| the primordial spectrum                   | structure from the growth            | `cosmology/primordial-spectrum`                               |
| singularity resolution                    | a non-singular start                 | `cosmology/singularity-resolution`                            |
| baryogenesis                              | a matter-antimatter asymmetry        | `cosmology/baryogenesis`                                      |

### Renormalization and layers

| capability                 | what it does                                     | where                                                           |
| -------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| coarse-graining            | block the rule and read the effective one        | `dynamics/coarsegrain`, `renormalization/coarse-graining-chain` |
| renormalization-group flow | flow to a fixed point                            | `dynamics/renormalization-group`, `renormalization/rg-step`     |
| the layer tower            | persistence by scale, the emergent middle layers | `coarse/level-stack`, `renormalization/form-tower-3434`         |
| Wang-Landau and tempering  | the density of states and replica sampling       | `dynamics/wang-landau`, `dynamics/parallel-tempering`           |

### Selves and observers

| capability                        | what it does                                        | where                                                        |
| --------------------------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| causal emergence                  | a macro level with more causal power than the micro | `coarse/causal-emergence`, `selves/causal-emergence`         |
| persistent localized structure    | solitons, defects, topological protection           | `selves/topological-persistence-3434`, `measure/persistence` |
| the churn baseline                | the no-persistence null result               | `selves/bare-rule-persistence-3434`                          |
| Markov blankets and individuality | the boundary of a self                              | `coarse/individuality`, `coarse/macro-unit`                  |
| integrated information and memory | self measures                                       | `measure/integration`, `selves/permanent-memory`             |

### Computation

| capability                        | what it does                          | where                                                            |
| --------------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| universality                      | the rule computes anything            | `computation/reversible-universality`, `computation/turing-3434` |
| logic gates and register machines | a substrate computer                  | `operator/logic-gate`, `operator/register-machine`               |
| greedy geometric routing          | addressing and navigation on the mesh | `addressing/`, `measure/navigation`                              |

### Computing and data structures on hyperbolic space

The bulk has a logarithmic diameter and grows exponentially per radius,
so it is a natural substrate for log-depth structures and content
search. Full catalog in `api/computing-and-data-structures.md`.

| capability                                     | what it does                                                           | where                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| content-addressable memory                     | ask by content, every cell matches in parallel, the O(log N) broadcast | `operator/associative-memory`, `associative-memory-engine.md`      |
| recall, capacity, latency                      | exact and noisy recall, capacity per radius, search latency            | `measure/associative-recall`                                       |
| vector-symbolic memory                         | bind, bundle, unbind, capacity scales with dimension                   | `measure/associative-memory`                                       |
| logarithmic-depth structures                   | B-tree, DHT routing, skip list, union-find, Merkle proof, R-tree       | `data-structure/btree-descent`, `dht-routing`, `merkle-proof`, ... |
| addressing and indexing                        | unique log-length addresses, hashing, tries, total orders              | `data-structure/addressing`, `hash-table`, `trie-prefix`           |
| radial structures                              | heaps, LSM levels, mipmaps by Busemann depth                           | `data-structure/radial-heap`, `lsm-levels`, `radial-mipmap`        |
| exponential capacity                           | Bloom filters and range scans on the growing boundary                  | `data-structure/boundary-sketch`, `range-scan`, `capacity`         |
| the data-structure profile of any tessellation | one module, every tessellation                                         | `measure/tessellation-profile`, `data-structure/universal-profile` |

## Substrates you can build

| substrate                                | symbol or builder                                  | where                                                      |
| ---------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| any regular hyperbolic tessellation      | a Schläfli symbol, the Coxeter engine              | `substrate/coxeter/matrix-group`, `tessellation-engine.md` |
| the {3,4,3,4} D4 spinor coin             | `d4Mesh`, the 24-direction mesh                    | `tool/mesh`                                                |
| the {5,3,4} dodecagrid                   | `buildCellGraph`, `buildDodecagrid`                | `substrate/coxeter/cell-direct`, `cell-scale`              |
| the flat cusp (horosphere)               | `buildHorosphere`, `buildHorosphereBand`           | `substrate/coxeter/cell-direct`                            |
| flat lattices (square, cubic, Euclidean) | `squareMesh`, `cubicMesh`, `buildEuclideanLattice` | `tool/mesh`, `substrate/coxeter/cell-direct`               |
| the 5D pentacombs                        | a 5-entry Schläfli symbol                          | `substrate/coxeter/matrix-group`                           |
| causal-set sprinklings                   | Minkowski, de Sitter, curved                       | `substrate/sprinkle-minkowski`, `sprinkle-desitter`        |
| trees and Bethe lattices                 | regular trees, the cavity                          | `substrate/bethe-tree`, `radial-tree`                      |
| the full catalog (45 tessellations)      | `TESSELLATIONS`                                    | `substrate/tessellation-catalog`                           |

## Operators you can build

| operator                           | what it builds                                | where                                                  |
| ---------------------------------- | --------------------------------------------- | ------------------------------------------------------ |
| the graph Laplacian                | diffusion, the spectrum, the Green's function | `operator/laplacian`                                   |
| the Kahler-Dirac operator          | a fermion on the form complex (d + delta)     | `operator/dirac`, `exterior-derivative`                |
| the gauge-covariant Dirac          | minimal coupling                              | `operator/gauge-dirac`                                 |
| the overlap fermion                | exact chiral symmetry, the condensate         | `operator/lattice-fermion`, `overlap-condensate`       |
| the Landau levels                  | a fermion in a magnetic field, the g-factor   | `operator/landau`                                      |
| the cellular-automaton Hamiltonian | a local bounded-below Hamiltonian             | `operator/ca-hamiltonian`                              |
| Maxwell on the lattice             | the gauge field dynamics                      | `operator/maxwell-lattice`                             |
| unitary evolution                  | exp(-i H t) by leapfrog                       | `operator/unitary-evolution`, `dynamics/leapfrog-wave` |

## Measures you can take

| theme                          | what you can read                                                | where                                                       |
| ------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| geometry                       | dimension, curvature, shells, distance, crystallographic         | `measure/dimension`, `curvature`, `shells`                  |
| relativity                     | the light cone, isotropy, dispersion, front speed                | `measure/light-cone`, `lorentz`, `dispersion`               |
| quantum                        | CHSH, entanglement, the Born rule, integration                   | `measure/bell`, `entanglement`                              |
| fields and gravity             | Wilson loops, Aharonov-Bohm, the Green's function, the potential | `measure/wilson-loop`, `aharonov-bohm`, `gravity-potential` |
| holography                     | Ryu-Takayanagi, the boundary propagator                          | `measure/holography`                                        |
| propagation                    | the return probability, localization                             | `measure/fermion-propagation`, `localization`               |
| statistics and fits            | power-law fits, histograms, the spectrum                         | `measure/regression`, `spectrum`                            |
| the cross-tessellation battery | every property at once, per substrate                            | `measure/tessellation-battery`                              |

## Dynamics you can run

| capability                         | what it does                                    | where                                                          |
| ---------------------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| the reversible conserving rule     | the base lattice gas                            | `rule/lattice-gas`, `rule/collision`                           |
| MCMC and uniform sampling          | the path integral, the causal-set measure       | `dynamics/mcmc`, `uniform-sampler`                             |
| parallel tempering and Wang-Landau | replica sampling, the density of states         | `dynamics/parallel-tempering`, `wang-landau`                   |
| lattice gauge sweeps               | SU(2), Wilson, the heat bath                    | `dynamics/su2-lattice`, `wilson-grid`                          |
| wave and walk evolution            | the quantum walk, leapfrog waves, Peierls drift | `dynamics/quantum-walk`, `leapfrog-wave`, `peierls-wavepacket` |
| coupled QED                        | the Schwinger evolution                         | `dynamics/schwinger-coupled`                                   |
| renormalization                    | coarse-graining and RG flow                     | `dynamics/renormalization-group`, `coarsegrain`                |

## Algebra you can use

| capability                       | what it gives you                                                        | where                                                       |
| -------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| the symmetry groups              | D4 and F4 roots, the binary tetrahedral and icosahedral groups, triality | `algebra/group/root-system`, `quaternion`, `cell-24`        |
| spinor and Clifford algebra      | the Pauli and gamma matrices, gamma5, rotations                          | `algebra/group/clifford`, `rotation`                        |
| octonions and the Jordan algebra | J3(O), the exceptional rank-three structure                              | `algebra/octonion`, `jordan`                                |
| disclination holonomy            | spin from a defect                                                       | `algebra/group/disclination`                                |
| eigensolvers                     | dense Jacobi, complex Hermitian, Lanczos lowest eigenvalues              | `algebra/linear/eig-jacobi`, `eig-hermitian`, `eig-lanczos` |
| spectral methods                 | the kernel-polynomial method, the Bethe resolvent                        | `algebra/linear/kernel-polynomial`, `bethe-resolvent`       |
| sparse and dense matrices        | triplets, mat-vec, the complex matrix                                    | `algebra/linear/sparse`, `dense`, `complex`                 |

## The headline results (the crown jewels)

The proven, controlled results, distilled. The full scoreboard is in
`note/research/vibe/notes/theory-v0.7.0/paper/recent-results.md`.

| result                                                             | status                              |
| ------------------------------------------------------------------ | ----------------------------------- |
| matter propagates on EVERY regular hyperbolic substrate            | solid (universal)                   |
| the spinor coin is exactly the seven 24-cell-faceted tessellations | solid (rare, dimension-gated)       |
| spin-half emerges (the 2pi sign), the D4 coin carries it           | solid                               |
| the g-factor is measured as 2, not assumed                         | solid                               |
| the mass is the chirality coupling, measured                       | solid                               |
| the photon and fermion sectors couple dynamically, both ways       | solid                               |
| the Ryu-Takayanagi area law on the boundary                        | solid                               |
| a fermion propagates on the pentacomb (spin AND curvature)         | solid (the trade resolved)          |
| the F4 to J3(O) rank-three structure, the family symmetry          | partial (slots degenerate)          |
| three generations, the coupling value, the mass values             | open (open in physics)              |
| curved-bulk gravity screening                                      | open (does not measure cleanly yet) |

## See also

- [readme.md](readme.md), the map of the per-domain guides.
- [overview.md](overview.md), how the library works.
- `note/research/vibe/notes/theory-v0.7.0/paper/recent-results.md`, the
  full results scoreboard.
- `note/research/vibe/notes/theory-v0.7.0/paper/tessellations.csv`,
  every substrate and its measured properties.
