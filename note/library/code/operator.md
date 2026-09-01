# operator (matrices on a substrate)

An operator turns a substrate (or a cell complex built from one) into a matrix you diagonalize or evolve, or into a local update rule you step. The Laplacian gives diffusion and effective dimension. The Dirac operator gives fermions and zero modes. The gauge operators thread a link field through the edges. The lattice-gas and cellular-automaton operators are the local reversible dynamics. This file is the full module index (about 50 files). For the friendly using-guide with snippets, read `../api/operator.md`.

Import from `@/code/operator/<file>`.

## Laplacian and diffusion

| module | key exports | what it builds |
|:--- |:--- |:--- |
| `laplacian` | `laplacian`, `laplacianSpectrum`, `laplacianGreensFunction` | the graph Laplacian `L = D - A`, its low spectrum, its Green's function |
| `graph-laplacian` | `graphLaplacian`, `solveGraphPoisson`, `graphLaplacianGreensFunction` | the same family on an explicit adjacency graph (the gravity tests) |
| `lattice-poisson-jacobi` | `latticePoissonJacobi` | Jacobi-iterated Poisson solve on a lattice |
| `dcube-poisson` | `dCubePoissonGreens` | the Green's function of the d-cube |
| `screened-greens-function` | `screenedGreensFunction`, `clampedLeakyDiffusion` | a screened (massive) Green's function |
| `lattice-green-kspace` | `latticeGreenDifferenceX` | the lattice Green's function in momentum space |
| `maxwell-lattice` | `maxwellLatticeSpectrum`, `maxwellLatticeMatrix`, `applyMaxwell`, `gradientLinkField`, `linkField`, `maxwellLinkIndex` | the lattice Maxwell (photon) spectrum, the dense curl-curl matrix and its action, pure-gauge and explicit link fields |
| `toric-code` | `d4CellComplex`, `vertexCheckMatrix`, `triangleCheckMatrix`, `toricCodeParameters`, `complexComponents`, `ternaryVertexCheckRows`, `ternaryTriangleCheckRows`, `ternaryChecksCommute` | the D4 cell complex of `d4Mesh` (vertices, root edges, root triangles), its X and Z checks, and the code parameters by GF(2) rank |
| `radial-schrodinger` | `radialSchrodingerLevels` | radial Schrodinger energy levels |

## Dirac and fermions

| module | key exports | what it builds |
|:--- |:--- |:--- |
| `dirac` | `cellComplexOf`, `kahlerDirac`, `diracSpectrum`, `kahlerDiracZeroModes` | the Kahler-Dirac operator `D = d + delta` as a sparse matrix, plus its zero modes (the Betti sum) |
| `exterior-derivative` | `polygonComplex`, `exteriorDerivative`, `kahlerDirac`, `boundaryOfBoundaryIsZero` | the dense-matrix path, good for small hand-checkable cases |
| `lattice-fermion` | `naiveDirac2D`, `wilsonDirac2D`, `overlapDirac2D`, `scanBrillouin`, `ginspargWilsonResidual` | the 2x2 momentum-space lattice fermions and the doubler scan |
| `dirac-skyrmion` | `makeDirac`, `background` | a Dirac operator in a Skyrmion background |
| `jackiw-rebbi` | `jackiwRebbiHamiltonian` | the Jackiw-Rebbi domain-wall bound state |
| `benincasa-dowker` | `benincasaDowkerDalembertian` | the causal-set d'Alembertian |
| `two-point` (`measure`) | see `measure.md` | the fermion correlators that read these operators |

## Gauge and magnetic fields

| module | key exports | what it builds |
|:--- |:--- |:--- |
| `gauge-dirac` | `covariantKahlerDirac` | the Kahler-Dirac operator with link phases (a gauge field on the edges) |
| `gauge-index` | `overlapIndex`, `gaugeWilsonDirac`, `totalFlux` | the overlap index (spectral asymmetry) and total flux, the lattice index theorem |
| `overlap-condensate` | `chiralCondensateSignal` | the near-zero eigenvalue density (U(1) chiral condensate) |
| `overlap-su2` | `chiralCondensateSignalSU2` | the SU(2) chiral condensate |
| `landau` | `diracLandauHamiltonian`, `scalarLandauSquared` | the Dirac Hamiltonian in a magnetic field and its spinless control (the g-factor) |
| `bloch-band` | `honeycombBandEnergy`, `honeycombDiracPoints`, `squareLatticeBand` | Bloch band structure and Dirac points |
| `tight-binding` | `ringHoppingHamiltonian`, `staggeredMassChainHamiltonian`, `torusHoppingHamiltonian`, `openChainPotentialApply` | tight-binding hoppers, the free-particle baselines |

## Gravity operators

| module | key exports | what it builds |
|:--- |:--- |:--- |
| `graviton` | `einsteinOp`, `gravitonFromAction` | the graviton (spin-2) operator |
| `linearized-curvature` | `linearizedChristoffel`, `linearizedRicci`, `linearizedEinsteinTensor` | linearized curvature tensors |
| `linearized-einstein` | `linearizedEinstein`, `makeTensorField`, `gravitonPolarizationsFromSpectrum` | the linearized Einstein operator and its polarizations |

## Evolution, tight-binding, and blocks

| module | key exports | what it builds |
|:--- |:--- |:--- |
| `unitary-evolution` | `evolveByEigendecomposition` | exact unitary time evolution `e^{-iHt}` from an eigendecomposition |
| `evolution` | `makeStateSpace`, `permutationOfRule`, `hamiltonianFromPermutation` | the state space and the Hamiltonian of a reversible rule |
| `ca-hamiltonian` | `hamiltonianMatrix`, `pauliLocalityProfile` | the permutation Hamiltonian of a reversible CA |
| `block` | `addComplexBlock`, `Block` | the shared 2x2 spinor-block assembler (the brick under the gauge Dirac operators) |
| `block-ca` | `commutingBlockHamiltonian`, `blockCaPermutation`, `cnotGate`, `toffoliGate` | block-cellular-automaton Hamiltonians and permutations |
| `chain-operators` | `chainOperators` | compose a chain of operators |
| `exchange-unitary` | `applyExchangeUnitary` | the two-particle exchange unitary |
| `ternary-permutation` | `ternaryPairPermutation`, `parityBlockBeat3D` | the ternary block permutation beat |
| `margolus-billiard` | `margolusStep` | the Margolus block (billiard-ball) step |

## Lattice gas and directional charge

| module | key exports | what it builds |
|:--- |:--- |:--- |
| `directional-lattice-gas` | `makeLatticeGas`, `collide`, `stream`, `streamInverse`, `latticeCharge`, `latticeMomentum` | the reversible directional lattice gas, collide-then-stream and its inverse |
| `d4-lattice-gas` | `streamD4`, `streamD4Inverse`, `d4CollisionInvolution`, `d4Count`, `d4Momentum`, `D4_DIRECTIONS` | the 24-direction D4 lattice gas |
| `coxeter-mesh-gas` | `streamCoxeterMeshGas`, `collideCoxeterMeshGas`, `eraseCoxeterMeshGas`, `countCoxeterMeshGas` | the lattice gas on any Coxeter mesh |
| `directional-charge-stream` | `streamDirectionalCharge`, `streamDirectionalChargeStep`, `totalDirectionalCharge` | the plain directional charge stream |

## Cellular automata, logic, and machines

| module | key exports | what it builds |
|:--- |:--- |:--- |
| `conway-life` | `lifeStep`, `mooreOffsets`, `cellSetCentroid` | Conway's Life, the classical-CA baseline |
| `logic-gate` | `nand`, `toffoli`, `fullAdder`, `ruleGate`, `functionFromTable` | logic gates from the rule |
| `substrate-gate` | `makeCircuit`, `addCell`, `nandBus`, `settle`, `isFixedPoint` | a settling logic circuit on a substrate |
| `register-machine` | `minskyAddProgram`, `minskyMultiplyProgram`, `carveRegisters`, `RegisterMachine` | a Minsky register machine |
| `dodecagrid-register-machine` | `buildDodecagridRegisterMachine` | the register machine realized on the dodecagrid |
| `macro-rule` | `effectiveCouplings`, `naiveMacroStep`, `renormMacroStep` | the coarse-grained macro rule |
| `signed-majority` | `signedMajorityStep`, `runAsynchronousSignedMajority`, `symmetricEdgeFills` | the signed-majority settling rule |
| `signed-majority-settle` | `settleAsync` | the asynchronous settle to a fixed point |
| `maintain-to-target` | `conservingMaintainToTarget` | the conserving maintenance rule (a self held to an identity) |

## Memory and renormalization

| module | key exports | what it builds |
|:--- |:--- |:--- |
| `associative-memory` | `makeAssociativeMemory`, `ternaryWord`, `storeWord`, `search`, `searchExact`, `searchBest`, `broadcastWave` | content-addressable memory on a cell graph (the flagship, deep dive `../associative-memory-engine.md`) |
| `hopfield` | `hebbianFills`, `hopfieldStep`, `nearestPattern`, `runHopfieldPair`, `bankOverlap` | a Hopfield network on the tones |
| `ising-rg` | `isingDecimationBySummation`, `isingBetaFunction`, `sampleIsingChain`, `measuredBlockSpinCoupling` | Ising renormalization by decimation |
| `numeric-search` | `numericSearchSteps`, `nextHigherIndex`, `maxIndex` | numeric search over a sorted array |

## Entry points

### `laplacian({ substrate })` and `laplacianSpectrum({ substrate, count })`
Build the graph Laplacian as a `SparseMatrix`, then take its lowest `count` eigenvalues (ascending, via Lanczos). The spectrum gives effective dimension and the heat-kernel return. `laplacianGreensFunction({ substrate, center })` solves `L phi = delta` for the static potential.

### `cellComplexOf({ substrate, maxGrade })`, `kahlerDirac({ complex })`, `kahlerDiracZeroModes({ complex, count, threshold })`
Build the cell complex over a substrate, fold it into the Kahler-Dirac operator `D = d + delta`, and count its zero modes (the Betti sum, a topological invariant). Fermions as differential forms. See `../fermion-engine.md`.

### `diracLandauHamiltonian({ levels, fieldStrength, mass })` and `scalarLandauSquared(...)`
The Dirac Hamiltonian in a magnetic field and its spinless scalar control. The gap between them is the magnetic moment, so the pair gives the spin g-factor.

### `makeLatticeGas(...)`, `collide`, `stream`, `streamInverse`
The reversible directional lattice gas. Collide permutes tones within a cell, stream gathers along the neighbour map, and `streamInverse` runs it backward. Exactly reversible and charge-conserving (checked by `check.md`). Deep dive `../rule-engine.md`.

### `evolveByEigendecomposition({ eig, n, re0, im0, t })`
Exact unitary time evolution once you have the eigendecomposition. The propagation half of `../evolution-and-propagation.md`.

## Used by

The Laplacian and Dirac operators feed the geometry, spin, and gauge arenas (`test/experiment/geometry/`, `spin/`, `gauge/`). The lattice-gas operators are the base dynamics for the matter, relativity, and foundations arenas. `associative-memory` and `hopfield` drive the memory and data-structure arenas. The gravity operators drive the gravity arena. The eigensolvers these call live in `code/algebra` (deep dive `../spectral-engine.md`).

## See also

- `../api/operator.md`, the friendly using-guide.
- `measure.md`, the probes that read these spectra.
- `../fermion-engine.md`, `../spectral-engine.md`, `../lattice-gauge-engine.md`, the deep dives.
