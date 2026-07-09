# The Math of Vibe

This is the catalog of every piece of math the Vibe simulator runs. The simulator is split into two trees. `test/` holds the experiments, each one a question with a verdict. `code/` holds the pure science the experiments call: no thresholds, no verdicts, just math. This document tables `code/`. It exists so a reader can look up any object (a Laplacian, a Lorentz test, the lattice-gas rule, the 24-cell) and immediately see what it is, where it lives, what it needs, and which experiments use it.

The math flows strictly upward. At the bottom sit foundations: the mesh, the tone alphabet, integers, bitsets, graphs, posets, the seeded RNG. On top of those sits the base rule (the collision and the directional lattice gas) and its invariant checks. Above the rule sit geometry and algebra (root systems, the 24-cell, quaternions, octonions, Clifford algebra, dense and sparse linear algebra), then the substrate builders (Coxeter groups, hyperbolic honeycombs, lattices). Operators (Laplacian, Dirac, lattice fermions, gauge) and measures (dimension, Lorentz, gravity, entanglement, ...) read off those substrates. Dynamics (MCMC, tempering, lattice gauge, RK4 integrators) drive them in time. Coarse-graining renormalizes them. The experiments sit at the very top and import downward only.

The core math-bearing modules have a conformance test under `test/code/` that mirrors the path. So `code/operator/dirac.ts` is checked by `test/code/operator/dirac.ts`, and so on. Run the whole math-conformance tree with `pnpm call test/code/run.ts`. The "Math it implements" column is taken from each module's own header. The other columns are computed from the static dependency map.

## How to read this

Each layer below is one table. The columns are:

- **Module**: path under `code/` (drop the `.ts`). Core modules have a test mirror at the same path under `test/code/`.
- **Math it implements**: one concise phrase from the module's own header.
- **Key exports**: the main named exports (truncated with `...` when long).
- **Prerequisites**: other `code/` modules it imports. These must be understood first. `-` means it depends on nothing else in `code/` (a leaf).
- **Used by (experiments)**: the experiment areas under `test/` that import it, directly or transitively. `-` means no experiment imports it yet (it is a building block used by other `code/` modules, or staged for future use).

Layers are listed in dependency order. A module never depends on anything in a later layer.

## 1. Foundations (`code/tool`, `code/tone`)

The substrate primitives. The mesh and the tone are the two objects everything else rests on. `tool/mesh` is the uniform interface every substrate exposes (cells, directions, neighbours). `tone/will` is the entire state of the world: one ternary tone per cell per direction.

### tool: substrate, arithmetic, containers, randomness
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `tool/balanced-ternary` | Balanced ternary, base three with digits {-1, 0, +1}, which is exactly the tone alphabet | `balancedTernaryCap`, `toBalancedTernary`, `fromBalancedTernary`, `isBalancedTernaryField` | - | gravity |
| `tool/bitset` | Bit-packed relation matrix | `BitMatrix`, `makeBitMatrix`, `setBit`, `getBit`, ... | - | cosmology |
| `tool/embedding` | Optional provenance for a substrate that came from sprinkling a manifold | `ElementId`, `WaveProfile`, `ManifoldSpec`, `Embedding`, ... | - | - |
| `tool/gauge-field` | A gauge field is a connection: a group element on every directed edge that parallel-transports along that link | `GaugeGroup`, `DirectedEdge`, `GaugeField`, `edgeKey`, ... | `tool/graph` | gauge |
| `tool/graph` | A general substrate graph: the mesh or tiling form | `Graph`, `makeGraph`, `degree`, `withScrambledEmbedding`, ... | `tool/embedding` | addressing, computation, cosmology, data-structure, foundations, gauge, +9 |
| `tool/graph-store` | Persist a cell graph (CSR adjacency) and a tone state to disk, so a large graph can be precomputed once and reloaded for long runs, checkpoints, an... | `StoredGraph`, `saveGraph`, `loadGraph`, `saveState`, ... | - | substrate-survey |
| `tool/grid-gauge` | A U(1) gauge field on a 2D periodic square lattice, stored as link phases | `GridGauge`, `makeGridGrid`, `plaquetteFlux`, `gridWilsonLoop`, ... | - | gauge |
| `tool/integer` | Small integer helpers shared across the substrate, the operators, and the finite-field arithmetic | `modulo` | - | - |
| `tool/mesh` | The uniform mesh interface | `Mesh`, `shellDistances`, `squareMesh`, `d4Mesh`, ... | `algebra/group/root-system`, `tool/integer` | associative, computation, fluids, foundations, gauge, gravity, +4 |
| `tool/poset` | A causal set: a locally finite partial order | `Poset`, `makePosetFromFuture`, `makePosetFromRelation`, `precedes`, ... | `tool/bitset`, `tool/embedding` | cosmology, gravity |
| `tool/rng` | Seeded deterministic PRNG | `Rng`, `makeRng`, `poissonSample`, `sampleEmpiricalFrequencies`, ... | - | addressing, associative, computation, cosmology, data-structure, foundations, +10 |
| `tool/substrate` | The substrate union and a shared adjacency view, so measurements that need only adjacency run on either a Poset (causal set) or a Graph (mesh / til... | `Substrate`, `AdjacencyView`, `embeddingOf`, `adjacencyOf`, ... | `tool/embedding`, `tool/graph`, `tool/poset` | addressing, geometry, relativity, selves, substrate-survey |

### tone: the ternary alphabet and configuration
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `tone/alphabet` | Finite tone alphabets | `Alphabet`, `slotsPerElement`, `valueCount`, `randomValue` | - | foundations |
| `tone/configuration` | A configuration assigns a tone value to every element (or every component of every element, for the spinor alphabet) | `Configuration`, `makeConfiguration`, `getTone`, `setTone`, ... | `tone/alphabet`, `tool/rng` | foundations, selves |
| `tone/pack` | The tone bit-pack, the second-order memory of a cell carried in one integer | `pack`, `currentOf`, `previousOf`, `signedTone`, ... | - | cosmology |
| `tone/will` | The will: one ternary tone per cell per direction, the entire state of the world | `Tone`, `Will`, `makeWill`, `cloneWill`, ... | `tool/mesh` | associative, fluids, foundations, gravity, method, quantum, +2 |

## 2. The base rule (`code/rule`, `code/check`)

The one committed law and its audits. `rule/collision` is the local in-place map on a cell's direction slots. `rule/lattice-gas` streams then collides over any mesh. `check/*` turns the rule's claims (charge conservation, momentum conservation, reversibility) into predicates that are verified rather than trusted.

| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `check/invariant` | Checkable conservation predicates of the rule: total charge, total momentum, reversibility | `totalMomentum`, `conservesMomentum`, `conservesCharge`, `isReversible` | `rule/collision`, `rule/lattice-gas`, `tone/will` | fluids, foundations, relativity, selves |
| `check/lattice-gas-laws` | The conservative-logic laws of the directional lattice gas, as reusable checks | `streamIsPermutation`, `toneCensus`, `censusEqual` | `rule/lattice-gas`, `tool/mesh` | foundations |
| `check/reversibility` | Reversibility round-trip check for the directional lattice gas: run the knit forward a number of beats then backward the same number, and measure t... | `roundtrip` | `rule/collision`, `rule/lattice-gas`, `tone/will` | foundations, quantum |
| `check/structure` | Structure diagnostics on a will: occupied cells, cluster count, spread, displacement, momentum | `occupiedSet`, `occupiedCells`, `componentCount`, `diameter`, ... | `rule/collision`, `rule/lattice-gas`, `tone/will`, `tool/mesh` | selves |
| `rule/asynchronous` | Asynchronous rule: update one element at a time | `asynchronousRule` | `rule/rule`, `tone/configuration`, `tool/rng`, `tool/substrate` | - |
| `rule/collision` | The local in-place collision map on one cell's direction slots (charge- and momentum-conserving, reversible) | `Collision`, `passThrough`, `momentumRotate2D`, `PAIR_FORWARD`, ... | `tone/will` | associative, computation, fluids, foundations, gravity, method, +3 |
| `rule/gauge` | Gauge rule (P8): carry a Z_q phase on each directed link and update it by a local loop (plaquette) move toward lower Wilson action | `gaugeRule` | `rule/rule`, `tool/gauge-field` | - |
| `rule/lattice-gas` | The committed directional lattice-gas engine: a beat is stream then collide, generic over any mesh | `stream`, `streamInverse`, `collide`, `beat`, ... | `rule/collision`, `tone/will`, `tool/mesh` | associative, fluids, foundations, method, quantum, relativity, +1 |
| `rule/perception-permutation` | The exact 9-state ternary perception permutation on an ordered pair of tones (values in -1, 0, +1) | `perceptionPermutation`, `PERCEPTION_FORWARD`, `PERCEPTION_INVERSE`, `perceptionMatchingSweepCsr`, ... | - | foundations, gauge, relativity, renormalization, selves |
| `rule/reversible` | Reversible even/odd rule: update the even sublattice from the odd, then the odd from the even | `reversibleEvenOdd` | `rule/rule`, `tone/configuration`, `tool/substrate` | foundations |
| `rule/rewrite` | Rewrite rule: change the substrate (graph) itself, not just the tones | `rewriteRule` | `rule/rule`, `tool/substrate` | - |
| `rule/rule` | A rule maps the current configuration to the next, reading only a bounded neighborhood per element | `RuleStepInput`, `RuleStepOutput`, `Rule`, `LocalMap`, ... | `tone/configuration`, `tool/rng`, `tool/substrate` | - |
| `rule/symmetry` | The discrete C, P, T operations on the lattice gas, and the CPT theorem | `chargeConjugate`, `timeReverse`, `parityReflect`, `chargeParityTime` | `tone/will` | foundations |
| `rule/synchronous` | Synchronous rule: apply the local tone map to every element at once, reading every neighborhood tone from the SAME (input) configuration | `synchronousRule` | `rule/rule`, `tone/configuration`, `tool/substrate` | - |
| `rule/viscous-collision` | A richer momentum-mixing collision, to give the lattice gas a FINITE bulk viscosity | `buildViscousQuads`, `controlledViscousRotate`, `viscousRotate` | `rule/collision` | fluids |

## 3. Geometry (`code/geometry`)

| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `geometry/distance` | The one hyperbolic distance, in its two equivalent forms | `poincareCoshFromParts`, `poincareCosh`, `poincareDistance`, `poincareDistanceIndexed`, ... | - | gauge |
| `geometry/packing` | Sphere-packing and kissing-configuration helpers | `unit`, `maxPairwiseCosine`, `isKissingConfiguration`, `canExtendKissing`, ... | - | foundations |
| `geometry/tree-embedding` | Sarkar embedding of a tree into the Poincare disk, and the same recursive placement in the Euclidean plane, for the tree-embedding-distortion data-... | `hyperbolicDistance`, `completeTree`, `treeDistance`, `embedTree`, ... | - | data-structure |

## 4. Algebra (`code/algebra`)

Exact group theory and linear algebra. The group layer carries the discrete symmetry of the base (D4 and F4 root systems, the 24-cell, quaternions, triality, Clifford and octonion and Jordan algebras). The linear layer is the numerical engine (complex and dense matrices, eigensolvers, Lanczos, the kernel-polynomial method, Bethe resolvents).

### algebra: top level
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `algebra/binary-tetrahedral` | The binary tetrahedral group 2T, the 24 unit Hurwitz quaternions, which are the 24 directions of the cell seen as the double cover of the rotation... | `Quaternion`, `quaternionMultiply`, `quaternionConjugate`, `binaryTetrahedralGroup`, ... | - | spin |
| `algebra/helicity` | Helicity of a polarization, the spin of a wave read off how its polarization rotates | `Matrix3`, `rotationZ`, `conjugateTensor`, `tensorInner`, ... | - | gravity |
| `algebra/jordan` | The Hermitian octonionic matrices and their Jordan product | `OctonionMatrix`, `hermitianOctonionDimension`, `octonionMatrixZero`, `octonionMatrixIdentity`, ... | `algebra/octonion` | spin |
| `algebra/octonion` | The octonions O, the 8-dimensional normed division algebra | `Octonion`, `OCTONION_DIM`, `octonionZero`, `octonionUnit`, ... | - | spin |
| `algebra/stabilizer` | Stabilizer quantum-code algebra over GF(2), for small codes | `Pauli`, `popcount`, `pauliWeight`, `pauliSupport`, ... | - | holography |
| `algebra/vector` | Real Euclidean and Minkowski vector operations on plain number arrays | `Vec`, `dot`, `norm`, `add`, ... | - | geometry, gravity, relativity, selves |

### algebra/group: discrete symmetry
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `algebra/group/automorphism` | Symmetry counts for a root system: the Weyl (reflection) group order, the full automorphism group order, the outer automorphism order (their ratio)... | `weylGroupOrder`, `automorphismGroupOrder`, `outerAutomorphismOrder`, `diagramAutomorphismOrder` | `algebra/group/root-system` | foundations, geometry, gravity |
| `algebra/group/cell-24` | The 24-cell as the 24 unit Hurwitz quaternions (binary tetrahedral 2T), with triality cosets | `cell24Vertices`, `omega`, `trialityClasses` | `algebra/group/quaternion` | foundations, substrate-survey |
| `algebra/group/clifford` | Clifford algebra: the Pauli matrices, the 3+1D Dirac gamma matrices, and the spin generators | `ComplexMatrix`, `cmZero`, `cmIdentity`, `cmMultiply`, ... | `algebra/linear/complex` | gauge, relativity, spin |
| `algebra/group/dihedral` | Representation theory of the dihedral group D_n (order 2n: n rotations, n reflections) | `dihedralFacePermutationDecomposition` | - | spin |
| `algebra/group/disclination` | Spin from a topological defect: a disclination in a director field | `directorLoop`, `spinorHolonomy`, `disclinationHolonomy`, `collectiveModeOverlap` | `algebra/group/clifford`, `algebra/linear/complex` | spin |
| `algebra/group/finite-group` | Generic finite-group utilities over any element type: the subgroup generated by a set (closure), the commutator subgroup, and membership | `GroupOps`, `closure`, `commutatorSubgroup`, `contains` | - | foundations, gauge, spin |
| `algebra/group/icosahedral` | The icosahedral rotation group A5 (order 60) and the decomposition of its 12-direction permutation representation | `icosahedralFacePermutationDecomposition` | `algebra/group/root-system`, `algebra/group/rotation` | spin |
| `algebra/group/invariant-theory` | Molien-style counting of the dimension of the space of degree-d invariant polynomials of a finite matrix group G acting on R^n | `invariantPolynomialDimension` | - | gauge |
| `algebra/group/quaternion` | Unit quaternions and the binary tetrahedral group, the algebra behind the 24-cell, the D4 coin, and triality | `Quaternion`, `quaternion`, `multiply`, `conjugate`, ... | - | foundations, geometry, spin, substrate-survey |
| `algebra/group/root-system` | The D4 and F4 root systems, the symmetry algebra of the coin | `rootsDn`, `rootsAn`, `dotVec`, `vecEqExact`, ... | - | data-structure, fluids, foundations, gauge, geometry, gravity, +3 |
| `algebra/group/rotation` | The two ways a unit-quaternion rotation acts: on a vector and on a spinor | `rotateVector`, `rotateSpinor`, `rotateSpinorTimes`, `rotateVectorTimes`, ... | `algebra/group/quaternion` | spin |
| `algebra/group/rotation-matrix` | Real 3x3 rotation matrices and the basic matrix operations on them, the SO(3) prototype for non-abelian lattice gauge fields | `Matrix3`, `IDENTITY3`, `multiply3`, `transpose3`, ... | - | gauge |
| `algebra/group/so8-triality` | The three 8-dimensional representations of SO(8) realised on the 24-cell / D4 coordinates, and the triality automorphism that cycles them | `vectorRep8`, `spinorRepEven8`, `spinorRepOdd8`, `applyTriality`, ... | - | foundations, gauge, spin |
| `algebra/group/special-linear` | The special linear groups over a finite field, SL(2,p), and their projective quotients PSL(2,p) | `MatrixModP`, `specialLinear`, `identityModP`, `minusIdentityModP`, ... | - | spin |

### algebra/linear: numerical linear algebra
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `algebra/linear/bethe-resolvent` | The Bethe lattice (infinite regular tree) resolvent by the cavity recursion | `betheCavityDecay`, `betheBoundaryExponent`, `finiteTreeResolventRatio` | - | gravity, holography |
| `algebra/linear/complex` | Complex scalars for operator APIs | `Complex`, `complex`, `cAdd`, `cMul`, ... | - | gauge, relativity, spin |
| `algebra/linear/complex-vector` | A dense complex vector stored as split real and imaginary Float64Arrays, the layout the iterative spectral methods want (Lanczos, the kernel polyno... | `Cx`, `newCx`, `dotR` | - | gauge |
| `algebra/linear/dense` | Small dense matrices on typed arrays, row-major | `DenseMatrix`, `makeDense`, `denseGet`, `denseSet`, ... | - | foundations, gauge |
| `algebra/linear/eig-hermitian` | Complex Hermitian eigendecomposition, built by embedding the n-by-n Hermitian matrix H = A + iB (A real symmetric, B real antisymmetric) as the 2n-... | `HermitianEigen`, `eigHermitian`, `hermitianMatrixSign`, `countNearZeroEigenvalues` | `algebra/linear/dense`, `algebra/linear/eig-jacobi` | foundations, gauge |
| `algebra/linear/eig-jacobi` | Symmetric real eigensolver by the cyclic Jacobi method | `jacobiEigenvalues3`, `jacobiEigenvalues`, `EigenResult`, `eigSymmetric` | `algebra/linear/dense` | foundations, gauge, geometry, gravity, quantum |
| `algebra/linear/eig-lanczos` | Lanczos iteration for the low spectrum of a large symmetric operator | `lowestEigenvalues` | `algebra/linear/dense`, `algebra/linear/eig-jacobi`, `algebra/linear/sparse` | gauge |
| `algebra/linear/eig-lanczos-complex` | Lanczos iteration for the low spectrum of a large HERMITIAN operator given only as a matrix-free apply (no stored matrix), with complex state | `ComplexVector`, `HermitianApply`, `largestEigenvalueOfSquare`, `lowestAbsoluteEigenvalues` | `algebra/linear/dense`, `algebra/linear/eig-jacobi` | spin |
| `algebra/linear/kernel-polynomial` | The kernel polynomial method: approximate a spectral function of a large Hermitian operator by its Chebyshev moments, using only matrix-vector prod... | `HermitianOperator`, `absoluteValueCoefficients`, `jacksonKernel`, `chebyshevMoments`, ... | `algebra/linear/complex-vector`, `tool/rng` | gauge |
| `algebra/linear/power-iteration` | Lowest eigenpairs (values AND vectors) of a symmetric LinearOperator by shifted power iteration with deflation | `Eigenpair`, `lowestEigenpairs` | `algebra/linear/sparse`, `tool/rng` | quantum, spin |
| `algebra/linear/sparse` | Compressed-sparse-row matrix for large operators (Laplacian, Dirac) | `SparseMatrix`, `Triplet`, `sparseFromTriplets`, `sparseMatVec`, ... | - | gauge, spin |
| `algebra/linear/voigt` | Voigt encoding of a symmetric 3x3 tensor as a 6-vector, with the orthonormal (energy-preserving) sqrt(2) weighting on the off-diagonal entries so t... | `symmetricTensorToVoigt`, `voigtToSymmetricTensor`, `operatorToVoigtMatrix` | `algebra/linear/dense` | - |

## 5. Substrate (`code/substrate`)

The space builders. These turn the symmetry of the algebra layer into concrete cell graphs: Coxeter groups and their tessellations, hyperbolic honeycombs, flat lattices, Margenstern tiling addresses, and a catalog of Schläfli symbols. Measures and operators run on whatever these produce.

### substrate: top level
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `substrate/bethe-tree` | A Bethe lattice: a regular tree of coordination number q, grown outward from a root to the given depth | `betheTree` | - | geometry |
| `substrate/branching-order` | A 1+1 causal set grown by a pure local branching rule, with no metric imposed | `growBranchingOrder` | `tool/bitset`, `tool/poset`, `tool/rng` | cosmology |
| `substrate/causal-lattice` | A 1+1 causal lattice: integer points in a Minkowski diamond, with the causal order dt > 0 and dt >= \|dx\| | `causalLattice` | `tool/embedding`, `tool/poset` | relativity |
| `substrate/cellwalker` | The cellwalker, a turtle on a tiling, the single navigation primitive HyperRogue is built around and the one all our distance, pattern, and CA-on-a... | `CellWalker`, `cellWalker`, `rotate`, `wstep`, ... | `substrate/tile-source` | - |
| `substrate/coxeter` | One machine for all the regular tessellations: the Coxeter (reflection-group) construction | `coxeterMeshGraph`, `coxeterTessellation` | `substrate/coxeter/engine`, `substrate/hyperbolic-graph`, `substrate/hyperbolic-honeycomb`, `tool/graph` | cosmology, geometry, substrate-survey |
| `substrate/cubic-lattice` | A d-dimensional cubic lattice of the given side length, the regular Euclidean control mesh for the potential-and-curvature experiments | `CubicLattice`, `cubicLattice`, `cubicLatticeCenter`, `cubicLatticeCenterBySide`, ... | - | associative, geometry, gravity |
| `substrate/d4-torus` | A finite D4 torus: the even-sum integer 4-vectors modulo M (M even keeps the even-sum condition well defined), with the 24 D4 roots as the step dir... | `buildD4Torus` | `algebra/group/root-system` | substrate-survey |
| `substrate/geometric-mesh` | Lightweight 2D meshes: a plain neighbor list plus per-node coordinates in the unit square | `Mesh`, `randomGeometricMesh`, `squareLatticeMesh`, `centerNode` | `tool/rng` | relativity |
| `substrate/graph-rewrite` | A deterministic content-free graph-rewrite grower, the Wolfram-style "geometry from a running rule" seed | `RewriteGraph`, `gridRefinementRewrite`, `degreeHistogram`, `bulkDegree` | - | foundations |
| `substrate/grow-csg` | Classical sequential growth (Rideout-Sorkin): grow a causal set by adding elements one at a time, each born to the future of a random subset of the... | `growCsg` | `tool/bitset`, `tool/poset`, `tool/rng` | cosmology |
| `substrate/growing-pentagrid` | A {5,4} pentagrid that grows one cell at a time at its frontier, append-only, with no randomness and no rebuild | `GrowingPentagrid` | - | cosmology |
| `substrate/horosphere` | Horosphere and cusp helpers, the geometry of the bulk-to-cusp projection | `idealDirection`, `busemann`, `horoFrame`, `horocyclicProject`, ... | `algebra/vector` | cosmology, relativity, renormalization |
| `substrate/hyperbolic-graph` | Hyperbolic graphs: hyperbolic (so exponential reach) and Lorentz-safe (so no preferred frame) | `hyperbolicGraph`, `hyperbolicHalton`, `hyperbolicTiling`, `hyperbolicSunflower` | `geometry/distance`, `tool/embedding`, `tool/graph`, `tool/rng` | addressing, foundations, geometry, relativity, renormalization, selves, +1 |
| `substrate/hyperbolic-honeycomb` | The dodecagrid: the regular {5,3,4} hyperbolic honeycomb in 3-space (dodecahedral cells, three around each edge of a face, four cells around each e... | `hyperbolicDodecagrid` | `geometry/distance`, `tool/embedding`, `tool/graph` | addressing, data-structure, gauge, geometry |
| `substrate/lattice` | The regular lattice control | `lattice` | `tool/embedding`, `tool/graph`, `tool/poset`, `tool/substrate` | addressing, foundations, gauge, geometry, relativity, spin, +1 |
| `substrate/lattice-ball` | Breadth-first ball and word-metric distance on a lattice generated by integer step vectors (a Cayley graph of Z^d with the given generators) | `latticeBall`, `latticeWordDistance` | `algebra/vector` | geometry |
| `substrate/layered-order` | A layered Kleitman-Rothschild order: three antichain layers (bottom, middle, top) with every element of a lower layer below every element of a high... | `kleitmanRothschildOrder` | `tool/poset` | cosmology |
| `substrate/modular-group` | The modular group PSL(2, Z): the parameter-free hyperbolic base | `IntegerMatrix`, `normalizeModularMatrix`, `multiplyIntegerMatrix`, `modularGraph`, ... | `tool/embedding`, `tool/graph` | cosmology, geometry, substrate-survey |
| `substrate/modular-mesh` | A modular mesh: numCells cohesive cells of cellSize vibes each, dense inside (fill +1, the cohesion that makes a cell a self), sparse and weak betw... | `modularMesh` | `tool/graph`, `tool/rng` | selves |
| `substrate/perfect-tensor-tree` | The HaPPY holographic code on a `branching`-ary perfect-tensor tree | `perfectTensorRecoverable`, `perfectTensorMinimalKillSet`, `perfectTensorContiguousThreshold` | - | holography |
| `substrate/proximity-graph` | The intrinsic surface connectivity of a point cloud: a nearest-neighbour proximity graph | `proximityGraph`, `centerNearestOrigin` | `geometry/distance` | geometry, quantum |
| `substrate/psl-cayley` | The Cayley graph of a projective special linear group PSL(2, p) over the finite field F_p, a boundary-free closed hyperbolic lattice | `ProjectiveMatrix`, `projectiveMultiply`, `projectiveCanonicalKey`, `standardPslGenerators`, ... | - | geometry, substrate-survey |
| `substrate/radial-tree` | Radial structure of an embedded cell graph, used by the boundary-coupling (bulk-tree propagator) gravity probes | `innermostCell`, `boundaryByRadius`, `surfaceDistances`, `radialBfsTree` | `tool/graph` | gravity, relativity |
| `substrate/regular-graph` | A random degree-regular graph via the configuration model (hyperbolic-expander proxy at scale) | `buildRegularGraph` | `tool/rng` | substrate-survey |
| `substrate/ring` | 1D periodic ring (cycle) substrate, used by the line dynamics (reversible wave, conserving perception sweep) | `ringNeighbors`, `ringEdges` | - | relativity |
| `substrate/sprinkle-box` | Poisson sprinkle of points into a 2D Minkowski box [0, tMax] x [-xMax, xMax] | `SprinkledPoint`, `sprinkleBox` | `tool/rng` | - |
| `substrate/sprinkle-curved` | Sprinkling curved spacetimes for P5 (does geometry recover uniquely) and the curved cases | `sprinkleCurved` | `tool/embedding`, `tool/poset`, `tool/rng` | - |
| `substrate/sprinkle-desitter` | A causal set sprinkled into a 2D de Sitter / FRW patch ds^2 = -dtau^2 + a(tau)^2 dx^2 with a(tau) = e^{H tau} | `sprinkleDeSitter` | `tool/bitset`, `tool/poset`, `tool/rng` | cosmology |
| `substrate/sprinkle-minkowski` | Poisson sprinkling of a causal diamond in d-dimensional Minkowski space | `sprinkleMinkowski` | `tool/embedding`, `tool/poset`, `tool/rng` | cosmology, foundations, geometry, gravity, relativity, renormalization, +1 |
| `substrate/tessellation-catalog` | The catalog of regular hyperbolic tessellations, the full enumerated set from Klitzing's reference (bendwavy.org/klitzing/dimensions/hyperbolic.htm... | `TessellationClass`, `Tessellation`, `TESSELLATIONS` | - | associative, substrate-survey |
| `substrate/tile-source` | A WALKABLE tiling, abstract over HOW its cells come into being | `FaceStep`, `TileSource` | - | - |
| `substrate/tiling-pq` | The {p,q} hyperbolic tiling, grown by Margenstern's splitting method, with Fibonacci / Zeckendorf addressing | `tilingPQ` | `tool/graph` | cosmology, relativity |
| `substrate/torus-grid` | A flat d-dimensional periodic mesh (a discrete torus) of side length L, grown by the local rule "each cell joins its two neighbors along every axis" | `torusGrid` | - | cosmology, geometry |
| `substrate/tree-addressing` | Margenstern-style tree addressing on an embedded graph | `AddressedTree`, `buildAddressedTree`, `routeByAddress` | `tool/graph` | addressing |
| `substrate/triangulated-surface` | A triangulated surface mesh with optional periodic wrap, so we can control its topology | `triangulatedSurface` | `tool/graph` | spin |

### substrate/coxeter: Coxeter groups and tessellations
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `substrate/coxeter/addressing-3434` | Self-describing O(log n) addressing for the {3,4,3,4} 4D hyperbolic honeycomb (Margenstern's splitting / Fibonacci-addressing program, extended fro... | `Addressing`, `buildAddressing`, `ConfluenceAutomaton`, `buildConfluenceAutomaton`, ... | `substrate/coxeter/cell-direct` | addressing, computation, data-structure, gauge, geometry, gravity, +1 |
| `substrate/coxeter/cell-direct` | Cell-direct Coxeter engine | `CellGraph`, `buildCellGraph`, `buildEuclideanLattice`, `HorospherePatch`, ... | `substrate/coxeter/frame`, `substrate/coxeter/minkowski`, `substrate/coxeter/schlafli`, `tool/graph` | associative, computation, cosmology, foundations, gauge, geometry, +8 |
| `substrate/coxeter/cell-scale` | Scalable EXACT cell engine for the dodecagrid {5,3,4}, via modular fingerprints (the binary-encoding path) | `ScaleGraph`, `buildDodecagrid`, `buildDodecagridFast`, `buildSliver`, ... | `tool/graph`, `tool/integer` | addressing, computation, foundations, gauge, holography, quantum, +4 |
| `substrate/coxeter/coxeter-growth` | Coxeter growth series from the Steinberg formula | `coxeterGrowthSeries`, `expandSeries`, `recurrenceFromDenominator`, `polyToString`, ... | - | - |
| `substrate/coxeter/embedding` | A Poincare-ball embedding of any hyperbolic Coxeter tessellation, from its Schlafli symbol alone | `coxeterPoincareGraph` | `algebra/linear/eig-jacobi`, `substrate/coxeter/matrix-group`, `tool/embedding`, `tool/graph` | data-structure, substrate-survey |
| `substrate/coxeter/engine` | The general Coxeter engine | `CoxeterMesh`, `buildCoxeterMesh` | `substrate/coxeter/schlafli` | cosmology, foundations, geometry, gravity, holography, selves |
| `substrate/coxeter/exact-modular` | EXACT, geometry-free cell navigation for ANY regular tessellation, by modular integer arithmetic, the rank-general version of the verified {5,3,4}... | `ExactEngine`, `makeExactEngine`, `buildTilingExact` | - | - |
| `substrate/coxeter/frame` | The Coxeter CELL frame for a Schlafli symbol, the shared setup every cell engine needs, the mirror frame, the cell stabilizer H (the finite group f... | `CoxeterCellFrame`, `coxeterCellFrame` | `substrate/coxeter/minkowski`, `substrate/coxeter/schlafli` | gauge |
| `substrate/coxeter/gram-signature` | The signature of the Coxeter Gram matrix for a linear Schlafli symbol, the count of negative and zero eigenvalues | `symbolContainsSubdiagram`, `gramSignature` | `algebra/linear/dense`, `algebra/linear/eig-jacobi` | substrate-survey |
| `substrate/coxeter/growth` | Exact hyperbolic growth series: how many cells (or polygons) are ADDED at each layer (generation) out from a starting cell, for the tilings we use,... | `RecurrenceSpec`, `sequence`, `polygonsAddedPerLayer73`, `polygonsAddedPerLayer54`, ... | - | cosmology, data-structure, holography |
| `substrate/coxeter/lazy-tiling` | A LAZY, effectively infinite walkable tiling for any regular symbol {p,q} (and {p,q,r}) | `makeLazyTiling` | `render/geometry/isometry`, `substrate/coxeter/frame`, `substrate/coxeter/minkowski`, `substrate/tile-source` | - |
| `substrate/coxeter/matrix-group` | The matrix-rep Coxeter reflection group as a cell graph | `reflections`, `multiply`, `matrixKey`, `buildCoxeterMatrixMesh` | `substrate/coxeter/schlafli` | cosmology, data-structure, gravity, holography, substrate-survey |
| `substrate/coxeter/minkowski` | The ONE Minkowski linear-algebra mechanism for the Coxeter tessellation engine | `Mat`, `Vec`, `innerJ`, `matMul`, ... | - | gauge |
| `substrate/coxeter/schlafli` | The exact Coxeter math behind the general engine: the Schlafli (Gram) matrix of a linear Coxeter symbol {p, q, r, ...}, its signature (which decide... | `Geometry`, `gramMatrix`, `symmetricEigen`, `classifyGeometry`, ... | - | foundations, geometry |
| `substrate/coxeter/streaming-shell-count` | Streaming shell counter for the {p,q,r,...} Coxeter cell graph | `streamingShellCounts` | `substrate/coxeter/frame`, `substrate/coxeter/minkowski` | holography |
| `substrate/coxeter/tessellation` | Generic tessellation front-end | `Compactness`, `Builder`, `TessellationDescriptor`, `describeTessellation`, ... | `measure/shells`, `substrate/coxeter/cell-direct`, `substrate/coxeter/schlafli` | substrate-survey |
| `substrate/coxeter/word` | The word-problem engine: exact, coordinate-free enumeration of a Coxeter group | `Word`, `coxeterMatrix`, `normalForm`, `WordMesh`, ... | - | addressing |

### substrate/margenstern: tiling addresses
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `substrate/margenstern/fibonacci-tree` | The standard Fibonacci tree of the pentagrid/heptagrid, navigated by PURE ADDRESS ARITHMETIC, no geometry | `father`, `continuator`, `nodeType`, `sons`, ... | `substrate/margenstern/zeckendorf` | - |
| `substrate/margenstern/grid` | A complete Margenstern-addressed, walkable hyperbolic grid for ANY regular tessellation, the pentagrid {5,4} and heptagrid {7,3} in 2D, the dodecag... | `TileColor`, `MargensternGrid`, `buildMargensternGrid` | `substrate/coxeter/cell-direct`, `substrate/margenstern/zeckendorf`, `substrate/tile-source` | - |
| `substrate/margenstern/numeration` | A general positional NUMERATION in a grid's own growth basis, Margenstern's "language of the splitting" (Vol I, Ch 3.3.3) generalized past the pent... | `Numeration`, `makeNumeration`, `recurrenceBasis`, `growthBasis` | - | - |
| `substrate/margenstern/pentagrid` | The pentagrid {5,4} navigated by PURE ADDRESS ARITHMETIC, Margenstern's Theorem 5 (Vol I, Ch 3.2.4), with NO geometry and NO floating point | `PentaTile`, `pentagridNeighbors`, `pentagridRoots`, `buildPentagridPure` | `substrate/margenstern/fibonacci-tree` | - |
| `substrate/margenstern/splitting-tree` | Margenstern's splitting tree for the pentagrid {5,4} and (by the twin theorem {p,4} <-> {p+2,3}) the heptagrid {7,3}, as a REGULAR LANGUAGE over Ze... | `TileColor`, `SECTOR_ROOT`, `colorOf`, `childrenOf`, ... | `substrate/margenstern/zeckendorf` | - |
| `substrate/margenstern/zeckendorf` | The Fibonacci numeral system (Zeckendorf representation), the exact integer coordinate Margenstern gives every tile of the pentagrid {5,4} and, by... | `toZeckendorf`, `fromZeckendorf`, `isZeckendorf`, `appendContinuator`, ... | - | - |

## 6. Operators (`code/operator`)

Linear and nonlinear operators that act on a substrate or a field: Laplacians, the Kahler-Dirac and gauge-Dirac operators, lattice fermions, Maxwell and Einstein operators, cellular-automaton Hamiltonians, register and logic machines built from the rule itself.

| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `operator/associative-memory` | A content-addressable associative memory on any cell graph, Potter's SITDAC model realized on a tessellation | `AssociativeMemory`, `makeAssociativeMemory`, `ternaryWord`, `storeWord`, ... | `measure/shells` | associative |
| `operator/benincasa-dowker` | The smeared Benincasa-Dowker d'Alembertian acting on a scalar test function, built only from the causal order of a 2D Minkowski sprinkling | `benincasaDowkerDalembertian` | `dynamics/action`, `tool/poset` | gravity |
| `operator/block` | 2x2 complex Wilson-Dirac blocks and the shared sub-block assembler | `Block`, `addComplexBlock` | `algebra/linear/dense` | - |
| `operator/block-ca` | Partitioned (Margolus-style) reversible cellular automata | `BlockGate`, `cnotGate`, `toffoliGate`, `commutingBlockHamiltonian`, ... | `algebra/linear/dense` | foundations |
| `operator/ca-hamiltonian` | The Hamiltonian of a reversible cellular automaton, and its locality profile | `hamiltonianMatrix`, `pauliLocalityProfile` | `algebra/linear/dense` | foundations |
| `operator/chain-operators` | The hopping adjacency and graph Laplacian of a 1D open chain of n sites | `chainOperators` | `algebra/linear/dense` | quantum |
| `operator/conway-life` | Conway's Game of Life, the canonical strongly-universal cellular automaton | `mooreOffsets`, `lifeStep`, `cellSetEqual`, `cellSetCentroid` | - | computation |
| `operator/coxeter-mesh-gas` | The reversible charge-conserving lattice-gas rule on a generated Coxeter matrix mesh (the adjacency from buildCoxeterMatrixMesh) | `streamCoxeterMeshGas`, `collideCoxeterMeshGas`, `eraseCoxeterMeshGas`, `countCoxeterMeshGas` | - | cosmology, gravity, substrate-survey |
| `operator/d4-lattice-gas` | The directional lattice-gas rule on a finite D4 torus (the {3,4,3,4} 24-direction substrate) | `D4_DIRECTIONS`, `d4OppositeDirections`, `streamD4`, `streamD4Inverse`, ... | - | substrate-survey |
| `operator/dcube-poisson` | The discrete Poisson Green's function on a flat d-cube of side L: solve (-Laplacian) x = delta with a unit point source at the center and Dirichlet... | `dCubePoissonGreens` | - | gravity |
| `operator/dirac` | The discrete Kahler-Dirac operator D = d + delta on a cell complex derived from a substrate | `CellComplex`, `cellComplexOf`, `kahlerDirac`, `diracSpectrum`, ... | `algebra/linear/eig-lanczos`, `algebra/linear/sparse`, `tool/substrate` | gauge, spin |
| `operator/dirac-skyrmion` | Shared 3D Dirac operator on a hedgehog/skyrmion background (Dirac(4) x isospin(2) = 8 complex components) | `BgMode`, `background`, `makeDirac` | `algebra/linear/complex-vector` | gauge, spin |
| `operator/directional-charge-stream` | Per-port directional charge streaming on a neighbors graph, the substrate-general form of the rule's streaming step | `streamDirectionalChargeStep`, `streamDirectionalCharge`, `totalDirectionalCharge` | - | substrate-survey |
| `operator/directional-lattice-gas` | One fully-specified discrete directional rule on a periodic L x L grid | `LatticeGasState`, `makeLatticeGas`, `cloneLatticeGas`, `latticeIndex`, ... | - | computation |
| `operator/dodecagrid-register-machine` | A conserving Minsky register machine wired onto the {5,3,4} dodecagrid: registers are charge held in address-ordered blocks of cells carved from th... | `buildDodecagridRegisterMachine` | `operator/register-machine`, `substrate/coxeter/cell-scale` | computation |
| `operator/evolution` | The P1 evolution operator and Hamiltonian | `StateSpace`, `makeStateSpace`, `permutationOfRule`, `hamiltonianFromPermutation` | `rule/rule`, `tone/alphabet`, `tone/configuration`, `tool/rng` +1 more | foundations |
| `operator/exchange-unitary` | The spin-exchange unitary on two charge-qubits, generated by H = XX + YY, applied at angle theta | `applyExchangeUnitary` | - | quantum |
| `operator/exterior-derivative` | Discrete exterior calculus on a cell complex: the boundary maps, the exterior derivative d, the codifferential delta, and the Kahler-Dirac operator... | `Matrix`, `CellComplex`, `transpose`, `multiply`, ... | - | spin |
| `operator/gauge-dirac` | The covariant Kahler-Dirac operator: the same d + delta block structure as kahlerDirac, but the vertex<->edge (grade 0 <-> 1) hopping entries are m... | `covariantKahlerDirac` | `algebra/linear/sparse`, `operator/dirac`, `tool/gauge-field` | gauge |
| `operator/gauge-index` | The lattice index theorem: the overlap fermion in a U(1) gauge background | `totalFlux`, `gaugeWilsonDirac`, `overlapIndex` | `algebra/linear/complex`, `algebra/linear/dense`, `algebra/linear/eig-hermitian`, `operator/block` +1 more | gauge |
| `operator/graph-laplacian` | Apply the unweighted graph Laplacian L = D - A to a vector, reading adjacency from a plain neighbor list | `graphLaplacian`, `solveGraphPoisson`, `graphLaplacianGreensFunction` | - | gravity |
| `operator/graviton` | The graviton operator DERIVED from the action, not typed in | `einsteinOp`, `gravitonFromAction` | `algebra/linear/eig-jacobi`, `algebra/linear/voigt`, `operator/linearized-curvature` | gravity |
| `operator/hopfield` | Dense ternary Hopfield memory: stored patterns become attractors of a fully connected signed-Hebbian coupling | `sign`, `storedPatterns`, `hebbianFills`, `toneOverlap`, ... | `tool/rng` | associative, quantum, selves |
| `operator/ising-rg` | The exact one-dimensional Ising real-space renormalization group by block-spin decimation | `isingDecimationBySummation`, `isingDecimationFormula`, `isingBetaFunction`, `sampleIsingChain`, ... | `tool/rng` | general, renormalization |
| `operator/jackiw-rebbi` | The 1D Jackiw-Rebbi Dirac Hamiltonian, a two-component fermion in a kink (soliton) mass background | `jackiwRebbiHamiltonian` | - | gauge |
| `operator/landau` | The Landau problem in the harmonic-oscillator (ladder) basis: a charged particle in a uniform magnetic field | `diracLandauHamiltonian`, `scalarLandauSquared` | `algebra/linear/dense` | gauge |
| `operator/laplacian` | The discrete graph Laplacian L = D - A over a substrate's undirected adjacency | `laplacian`, `laplacianSpectrum`, `laplacianGreensFunction` | `algebra/linear/eig-lanczos`, `algebra/linear/sparse`, `tool/substrate` | foundations |
| `operator/lattice-fermion` | Lattice fermions and the chirality wall (P4 / P8 Stage D) | `latticeDiracEnergy1d`, `Mat2`, `mat2`, `PAULI_X`, ... | `algebra/linear/complex`, `algebra/linear/dense`, `algebra/linear/eig-jacobi` | gauge, relativity, spin |
| `operator/lattice-green-kspace` | The free-space (infinite-volume) cubic-lattice Green's function of the discrete Laplacian, evaluated in momentum space | `latticeGreenDifferenceX` | - | gravity |
| `operator/lattice-poisson-jacobi` | The discrete Poisson equation -nabla^2 Phi = source solved by Jacobi relaxation on a neighbor-list lattice with Dirichlet boundaries | `latticePoissonJacobi` | - | gravity |
| `operator/linearized-curvature` | The linearized curvature pipeline in momentum space, Christoffel -> Ricci -> Einstein, built from a spatial metric perturbation h_ij at wavevector... | `linearizedChristoffel`, `linearizedRicci`, `linearizedEinsteinTensor` | - | - |
| `operator/linearized-einstein` | The linearized Einstein operator on a periodic 4D lattice, the discrete graviton | `GRAVITON_DIMENSION`, `TensorField`, `gravitonSiteIndex`, `gravitonCoordsOf`, ... | `algebra/linear/dense`, `algebra/linear/eig-jacobi` | gravity |
| `operator/logic-gate` | Boolean logic built from the model's OWN signed-majority rule | `Bit`, `ruleGate`, `nand`, `not`, ... | - | computation |
| `operator/macro-rule` | The coarse-grained (renormalized) signed-majority rule on a blocked graph | `Effective`, `effectiveCouplings`, `naiveMacroStep`, `renormMacroStep` | `tool/graph` | renormalization, selves |
| `operator/maintain-to-target` | CONSERVING maintenance of a tone field back toward a `target` pattern, using only two charge-conserving moves (no charge minted from nothing): 1 | `conservingMaintainToTarget` | - | selves |
| `operator/margolus-billiard` | The Margolus billiard-ball cellular automaton (BBMCA), a reversible block rule proven Turing-complete | `margolusStep` | - | computation |
| `operator/maxwell-lattice` | The lattice Maxwell (curl-curl) operator on a periodic L^3 cubic lattice, the free U(1) gauge field | `maxwellLatticeSpectrum` | `algebra/linear/dense`, `algebra/linear/eig-jacobi` | gauge, renormalization |
| `operator/numeric-search` | Potter's associative numeric-search functions, the maximum, minimum, and next-value searches over a per-cell field | `maxIndex`, `minIndex`, `nextHigherIndex`, `nextLowerIndex`, ... | - | associative |
| `operator/overlap-condensate` | The chiral condensate of the overlap fermion in a dynamical U(1) gauge field (the 2D Schwinger model, P8 / A4) | `chiralCondensateSignal` | `algebra/linear/dense`, `algebra/linear/eig-hermitian`, `operator/block`, `tool/integer` +1 more | gauge |
| `operator/overlap-su2` | B2 down-payment: the chiral overlap fermion in a dynamical NON-ABELIAN (SU(2)) gauge field | `chiralCondensateSignalSU2` | `algebra/linear/dense`, `algebra/linear/eig-hermitian`, `tool/integer`, `tool/rng` | gauge |
| `operator/radial-schrodinger` | The radial Schrodinger operator, for bound states of a central potential | `radialSchrodingerLevels` | `algebra/linear/dense`, `algebra/linear/eig-jacobi` | spin |
| `operator/register-machine` | A Minsky counter machine running on the model's ternary charge | `Instr`, `RegisterMachine`, `minskyAddProgram`, `minskyMultiplyProgram`, ... | - | computation |
| `operator/screened-greens-function` | The screened (massive) graph-Laplacian Green's function: the solution phi of (D - A + m^2) phi = delta_start on a plain neighbor list | `screenedGreensFunction`, `clampedLeakyDiffusion` | - | gravity |
| `operator/signed-majority` | The ternary signed-majority rule and its per-edge coupling field | `symmetricEdgeFills`, `signedMajorityStep`, `runAsynchronousSignedMajority` | `tool/rng` | foundations, geometry, relativity, renormalization, selves |
| `operator/signed-majority-settle` | Asynchronous (Hopfield-style) relaxation of the ternary signed-majority rule | `settleAsync` | `tool/graph`, `tool/rng` | selves |
| `operator/substrate-gate` | Logic gates built on the model's OWN running dynamics, not as pure functions | `SubstrateCircuit`, `makeCircuit`, `addCell`, `link`, ... | `operator/logic-gate`, `tool/rng` | computation |
| `operator/ternary-permutation` | The DETERMINISTIC conserving perception rule on a ternary tone pair, as an explicit permutation table (no randomness, the deterministic sibling of... | `ternaryPairPermutation`, `parityBlockBeat3D` | - | substrate-survey |
| `operator/tight-binding` | Nearest-neighbour tight-binding (free-fermion hopping) Hamiltonians on periodic lattices, as dense single-particle matrices | `ringHoppingHamiltonian`, `weakBondChainHamiltonian`, `mediatorChainHamiltonian`, `staggeredMassChainHamiltonian`, ... | `algebra/linear/dense` | gravity, holography, quantum, spin |
| `operator/unitary-evolution` | Unitary time evolution of a complex state under a Hermitian (here real-symmetric) Hamiltonian H, via its eigendecomposition: psi(t) = e^{-iHt} psi(0) | `evolveByEigendecomposition` | - | quantum |

## 7. Measures (`code/measure`)

The biggest layer. A measure reads a number off a state, a substrate, an operator spectrum, or a time series. These are the diagnostics the experiments turn into verdicts. Grouped by theme below. Every measure module is listed exactly once.

### Geometry, dimension, shells
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `measure/dimension` | Dimension estimators | `dimensionFromOrderingFraction`, `myrheimMeyerDimension`, `ballGrowth`, `ballGrowthDimension`, ... | `measure/regression`, `tool/poset`, `tool/substrate` | addressing, cosmology, foundations, geometry, quantum, relativity, +2 |
| `measure/boundary-dimension` | The intrinsic dimension of a cell graph's outer boundary shell, the dimension the holographic dual would live in (an S^2 screen reads ~2, an S^3 sc... | `boundaryDimension` | `algebra/vector`, `measure/dimension`, `substrate/coxeter/cell-direct`, `tool/graph` | holography |
| `measure/cusp-dimension` | The dimension of a regular hyperbolic honeycomb, read the curvature-AWARE way | `CuspDimension`, `cuspDimension` | `measure/dimension`, `measure/shells`, `substrate/coxeter/cell-direct`, `substrate/proximity-graph` | geometry |
| `measure/curvature` | Combinatorial curvature | `formanRicci`, `meanCurvature`, `CurvatureSign`, `shellGrowthCurvature`, ... | `tool/rng`, `tool/substrate` | geometry, gravity |
| `measure/distance` | Distance measures | `graphDistance`, `longestChain` | `tool/poset`, `tool/substrate` | addressing |
| `measure/isotropy` | Angular isotropy measures, the rotational half of Lorentz invariance | `frontCoefficientOfVariation`, `angularAnisotropy`, `harmonicAnisotropy`, `nearestLinkHarmonicAnisotropy`, ... | `algebra/linear/eig-jacobi`, `algebra/vector` | geometry, gravity, method, relativity, substrate-survey |
| `measure/shell-growth` | The shell growth rate of a tessellation, the geometric constant behind the fermion mass hierarchy | `shellCountsFromGraph`, `growthRatioFromShellCounts`, `euclideanL1ShellCount`, `euclideanL1ShellRatio`, ... | - | gauge, geometry |
| `measure/shell-growth-ratio` | The near-shell arithmetic-mean growth ratio used across the substrate survey (the cosmology / hierarchy branching factor) | `shellGrowthRatio` | - | substrate-survey |
| `measure/shells` | Breadth-first shell traversal on a neighbors graph | `bfsShells`, `branchingRatio`, `midShellGrowthRatio`, `geometricGrowthRatio`, ... | - | associative, computation, cosmology, gauge, geometry, gravity, +5 |
| `measure/radial` | Radial (Busemann) structure of an embedded hyperbolic graph, for the multiresolution and cusp data-structure experiments | `graphBusemann`, `busemannLevels` | `algebra/vector`, `substrate/horosphere`, `tool/graph` | data-structure |
| `measure/point-set` | Shape measures for a set of occupied lattice cells | `centroidOfCellSet`, `recenterCellSet`, `cellSetOverlap`, `radiusOfGyrationOfCellSet`, ... | - | selves |
| `measure/density-contrast` | The density contrast of a point set, the relative fluctuation in how many points fall in each cell of a regular grid over the unit cube | `densityContrast` | - | cosmology |
| `measure/crystallographic` | The crystallographic (root-system) integer test on a set of direction vectors | `directionsAreCrystallographic` | `algebra/vector` | substrate-survey |
| `measure/probe-directions` | Deterministic probe direction sets for isotropy and dispersion-anisotropy tests | `coordinateAxes`, `probeDirections` | - | relativity, spin |

### Relativity and Lorentz
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `measure/lorentz` | Lorentz isotropy: the decisive P3 test | `lorentzIsotropy`, `latticeAnisotropy`, `lorentzSafety` | `measure/dispersion`, `measure/group-speed`, `measure/isotropy`, `tool/embedding` +2 more | addressing, cosmology, foundations, geometry, relativity, selves, +1 |
| `measure/rapidity` | Rapidity of timelike causal links in a 1+1 causal set, and the Lorentz boost of the coordinates | `linkRapidities`, `boostEnergyMomentum`, `addVelocities`, `relativisticEnergy`, ... | - | relativity |
| `measure/swerve-diffusion` | The swerve diffusion: the slope of rapidity variance versus proper time (the diffusion constant: variance = 2 k tau) | `swerveDiffusion` | `dynamics/swerve-walk`, `measure/regression`, `substrate/sprinkle-box`, `tool/rng` | relativity |
| `measure/doubly-special` | Doubly-special-relativity diagnostics for an emergent dispersion | `continuumDispersion`, `DispersionBand`, `scanDispersionBand` | - | relativity |
| `measure/light-cone` | The light cone: charge seeded per direction and its causal spreading front | `lightConeRadii`, `streamingConeRadii`, `perturbationConeRadii` | `rule/collision`, `rule/lattice-gas`, `tone/will`, `tool/mesh` | relativity |
| `measure/manifoldlike` | Manifold-likeness: a composite test for whether a causal set looks like a smooth spacetime rather than a random order | `manifoldLikeness` | `measure/dimension`, `tool/poset` | cosmology |
| `measure/order-stats` | Order statistics that separate a manifold-like causal set from a layered Kleitman-Rothschild (KR) order | `causalSliceWidths`, `posetHeight`, `orderStatistics` | `measure/dimension`, `tool/bitset`, `tool/poset` | cosmology, foundations, gravity, substrate-survey |
| `measure/dispersion` | Wave dispersion of a discrete rule from its neighbour direction set | `relativisticDispersionFit`, `latticeDispersion`, `dispersionAxisDiagonalAnisotropy`, `waveModeFrequency`, ... | `algebra/vector`, `measure/regression` | relativity |
| `measure/group-speed` | Group speed of a dispersion relation and its directional anisotropy | `groupSpeed`, `groupVelocity1d`, `groupSpeedAnisotropy` | - | relativity |
| `measure/front-speed` | Directional wavefront speeds on an embedded graph | `directionalFrontDistances`, `differenceRmsWidthRing`, `rangeAnisotropy` | `algebra/vector`, `geometry/distance` | relativity |
| `measure/sound-wave` | The emergent sound wave of the conserving lattice gas, MEASURED from the running dynamics (distinct from the analytic lattice dispersion in measure... | `coinLines`, `densityWaveAlongAxis`, `stripeContrast`, `firstMinimumTime` | `measure/profile`, `tone/will`, `tool/mesh` | relativity, selves |
| `measure/acoustic-horizon` | Analog (acoustic / sonic) horizon kinematics | `tanhHorizonSpeed`, `rayFreezeSurfaceGravity` | `measure/regression` | gravity |
| `measure/unruh` | The Unruh-DeWitt detector response and the temperature read off its detailed balance | `unruhDetectorResponse`, `temperatureFromDetailedBalance` | - | gravity |
| `measure/action-fluctuation` | The scaling of a causal-set action's fluctuation with spacetime volume | `actionFluctuationExponent` | `dynamics/action`, `measure/regression`, `substrate/sprinkle-minkowski`, `tool/rng` | cosmology |

### Gravity
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `measure/entropic-gravity` | Entropic gravity, the Verlinde route | `ballRegion`, `screenBitSeries`, `logLogExponent`, `verlindeForceLaw` | `measure/entanglement` | gravity |
| `measure/gravity-exponent` | The gravity falloff exponent alpha in phi ~ r^(-alpha), measured from the screened graph-Laplacian Green's function | `gravityExponent` | `measure/regression`, `measure/shells`, `operator/screened-greens-function` | relativity |
| `measure/gravity-potential` | Closed-form static gravitational potentials, the weak-field falloff laws used to compare substrate dimensionality | `newtonianPotential3D`, `branePotential`, `weakFieldLightDeflection` | - | gravity |
| `measure/newton-falloff` | The Newton-potential falloff exponent on a flat lattice, recovered cleanly by receding the finite-box boundary | `NewtonFalloff`, `newtonFalloffExponent` | `measure/profile`, `measure/regression`, `operator/dcube-poisson` | gravity |
| `measure/rotation-curve` | Galactic rotation curve from a radial potential profile | `rotationCurveFromPotential` | `measure/regression` | gravity |
| `measure/shadow-gravity` | Le Sage shadow gravity, the geometry of the mutual shadow | `fibonacciSphereDirections`, `isotropicShadowFraction`, `directionalShadowFraction`, `leSageDrag`, ... | - | gravity |
| `measure/black-hole-thermodynamics` | Closed-form Schwarzschild and de Sitter horizon thermodynamics in geometric units (G = c = hbar = k_B = 1) | `schwarzschildRadius`, `schwarzschildArea`, `schwarzschildEntropy`, `schwarzschildSurfaceGravity`, ... | - | gravity |
| `measure/gravitational-wave` | Closed-form general-relativistic gravitational-wave physics of a circular compact binary (geometric units G = c = 1) | `keplerFrequency`, `chirpMass`, `binaryQuadrupoleStrain`, `quadrupoleRadiatedPower`, ... | - | gravity |
| `measure/greens-function` | Lattice Green-function (static potential) falloff exponent under Dirichlet boundaries | `dirichletGreensFunction`, `greensFunctionExponent`, `greensDecayClass` | `measure/regression`, `operator/graph-laplacian`, `tool/graph` | geometry, gravity |

### Quantum and information
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `measure/bell` | CHSH: the Bell hinge (P7) | `Lambda`, `chsh`, `chshShared` | `tool/rng` | foundations, quantum |
| `measure/born-rule` | The Born-rule self-consistency measures | `patchesFromAmplitudes`, `quadratureAdditivityResidual`, `exponentResidual`, `fairSampleFrequencies` | `tool/rng` | quantum |
| `measure/contextuality` | The Peres-Mermin magic square: state-independent quantum contextuality, computed on the two-qubit Pauli algebra (which is the {3,4,3,4} cell's own... | `peresMerminSquare` | `algebra/group/clifford`, `algebra/linear/complex` | quantum |
| `measure/leggett-garg` | The Leggett-Garg temporal inequality on a single qubit (the cell's two-state spin) | `temporalCorrelator`, `leggettGarg` | `algebra/group/clifford`, `algebra/linear/complex` | quantum |
| `measure/two-qubit` | Entanglement measures of a pure two-qubit state, given as length-4 real/imag amplitude arrays in the basis \|00>, \|01>, \|10>, \|11> | `twoQubitCorrelationMatrix`, `horodeckiMaxChsh`, `twoQubitConcurrence` | `algebra/linear/dense`, `algebra/linear/eig-jacobi` | quantum |
| `measure/walk-entanglement` | Entanglement entropy from the knit's OWN coined Dirac walk, not a Hamiltonian proxy | `coinedWalkIntervalEntropy` | `algebra/linear/dense`, `algebra/linear/eig-jacobi` | gravity |
| `measure/entanglement` | Free-fermion entanglement measurements | `freeFermionCorrelationMatrix`, `regionEntanglementEntropy`, `crossCutConnectivity`, `pageAverageEntropy` | `algebra/linear/dense`, `algebra/linear/eig-jacobi` | gravity, holography |
| `measure/localization` | The quantum return probability, the standard diagnostic for whether an excitation PROPAGATES (extended phase) or stays TRAPPED (localized phase) un... | `returnProbability`, `boundStateDecayExponent` | `algebra/linear/sparse` | gauge, spin |
| `measure/fringe` | Interference-fringe statistics of a 1D distribution read on its populated parity (a coined walk fills only every-other site at a given step) | `fringeStatistics` | - | quantum |
| `measure/winding` | Topological winding of a phase field on a ring | `phaseWinding`, `directorWinding` | - | selves, spin |
| `measure/wavefront` | The angular profile of a wave packet's intensity in an annulus around a source | `wavefrontProfile` | `algebra/linear/dense`, `algebra/linear/eig-jacobi`, `operator/unitary-evolution`, `substrate/geometric-mesh` | relativity |
| `measure/integration` | Integration correlates (P9) | `algebraicConnectivity`, `integrationCorrelates`, `toneIntegration` | `tone/configuration`, `tool/rng`, `tool/substrate` | selves |
| `measure/two-point` | Equal-time vacuum two-point functions (Green's functions) of lattice field theories, summed over momentum modes with a positive spectral weight | `diracEqualTimeCorrelator` | - | quantum |
| `measure/hankel` | The Osterwalder-Schrader / Kallen-Lehmann spectral-positivity test in its Hankel form | `hankelMatrix`, `symmetricEigenvalues`, `symmetricMinEigenvalue`, `hankelMinEigenvalue` | `algebra/linear/dense`, `algebra/linear/eig-jacobi` | quantum |
| `measure/connected-correlation` | Connected two-point correlation C(r) = <s_x s_y> - <s>^2 binned by graph distance | `connectedCorrelationByDistance`, `timeAveragedRingCorrelation`, `correlationLengthFromDecay` | `tool/graph` | quantum, renormalization |
| `measure/persistence` | Persistence of a coarse-field time series: mean lag-correlation over a window | `lagAutocorrelation` | `measure/statistics` | renormalization |
| `measure/dirac-sea-energy` | The Dirac sea energy of a single-particle Hamiltonian, the sum of every negative eigenvalue | `seaEnergyFromEigenvalues`, `diracSeaEnergy` | `algebra/linear/eig-jacobi` | gauge |

### Gauge and topology
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `measure/wilson-loop` | Wilson loops: gauge-invariant observables on a gauge field | `wilsonLoopPhase`, `wilsonLoopValue`, `creutzRatioFromLoops`, `staticPotentialProxy` | `tool/gauge-field` | gauge |
| `measure/aharonov-bohm` | Aharonov-Bohm phase: the phase a charged particle accumulates around a loop, even where the local field strength is zero | `aharonovBohmPhase` | `measure/wilson-loop`, `tool/gauge-field` | - |
| `measure/anyon-braiding` | Anyon braiding, the mutual statistics of a Z_n gauge theory | `squareLoop`, `zNVortexHolonomy` | - | spin |
| `measure/quantum-double` | The Z_N quantum double, the deconfined topological phase of the gauged ternary tone | `toricCodeGroundStateDegeneracy`, `squareLatticeCellCounts`, `anyonTypeCount`, `mutualBraidingPhase`, ... | - | spin |
| `measure/redundancy-code` | A classical holographic redundancy code: a bulk logical bit stored redundantly across N boundary sites, recovered by majority vote | `recoverByMajority`, `corruptConnectedRegion` | - | holography |
| `measure/topological-charge` | The lattice topological-charge density of a unit-vector (direction) field, via the signed solid angle subtended by a spherical triangle of three un... | `sphericalTriangleArea` | - | - |
| `measure/skyrme-energy` | Exchange and Skyrme energies, and the topological (skyrmion) charge, of a unit-vector (direction) field on a 2D or 3D lattice | `hedgehogTexture3d`, `blankDirectionField2d`, `placeSkyrmion2d`, `directionFieldEnergy2d`, ... | `measure/topological-charge` | gauge |

### Standard Model and matter
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `measure/division-algebra` | The Cayley-Dickson tower of normed algebras, R, C, H, O, S (the reals, complexes, quaternions, octonions, sedenions), and where it stops being a di... | `cayleyConjugate`, `cayleyMultiply`, `normSquared`, `hasZeroDivisor`, ... | - | foundations |
| `measure/octonion-fermions` | One generation of Standard-Model fermions from the complexified octonions (the Furey / Dixon / Gunaydin-Gursey construction) | `octonionFermionGeneration` | `measure/division-algebra` | foundations, gauge |
| `measure/standard-model-charges` | The Standard Model fermion charges of one generation, the 16 of so(10) (15 SM Weyl fermions plus one right-handed neutrino), and the group-theory n... | `GenerationFermion`, `STANDARD_MODEL_GENERATION`, `generationFermionCount`, `weinbergAngleAtUnification`, ... | - | gauge |
| `measure/generation-structure` | The threefold-generation structure of the exceptional Jordan algebra J3(O), measured (not assumed) from the Jordan primitives | `exceptionalJordanGenerationStructure` | `algebra/jordan`, `measure/standard-model-charges` | gauge |
| `measure/flavor-mixing` | Flavor mixing from the mass hierarchy | `mixingAngleFromMassRatio`, `mixingElementFromMassRatio`, `wolfensteinHierarchy` | - | gauge |
| `measure/electroweak` | Electroweak boson masses from the Higgs mechanism | `custodialRho`, `wToZMassRatio` | - | foundations, gauge |
| `measure/nuclear-binding` | The nuclear binding curve, the Bethe-Weizsacker semi-empirical mass formula (the liquid-drop model) | `nuclearBindingEnergy`, `bindingPerNucleonAtMass`, `bindingCurvePeak` | - | spin |
| `measure/atomic-energy` | Atomic ground-state energies for the multi-electron atom, in Hartree atomic units (the Rydberg is one half Hartree, one Hartree is 27.211 eV) | `twoElectronEnergy`, `optimalScreenedCharge`, `heliumVariationalEnergy`, `heliumPerturbativeEnergy`, ... | - | spin |
| `measure/molecular-bond` | The molecular bond, the hydrogen molecular ion H2+, the simplest molecule (two protons sharing one electron) and the prototype of the covalent bond | `hydrogenMolecularIonBondingEnergy`, `hydrogenMolecularIonAntibondingEnergy`, `hydrogenMolecularIonVariationalBond`, `hydrogenMolecularIonSimpleBond` | - | spin |
| `measure/fermion-propagation` | Whether the Kahler-Dirac fermion on a given cell graph PROPAGATES (the extended phase) or LOCALIZES | `kahlerDiracReturn` | `algebra/linear/sparse`, `measure/localization`, `operator/dirac`, `tool/graph` | substrate-survey |
| `measure/superfluid` | Superfluid measurements | `landauCriticalVelocity`, `vortexCirculation` | - | fluids |

### Tone fields and fluid measures
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `measure/agreement` | Agreement measures between two ternary tone vectors, plus coarse-graining a tone field to cluster majorities | `agreementFraction`, `disagreementFraction`, `targetFidelity`, `clusterMajority` | - | renormalization, selves |
| `measure/alignment` | Alignment measures: coherence, conflict, resonance, and decisiveness, read off tone patterns | `coherenceOrder`, `conflictFraction`, `pairConflict`, `meanPairwiseConflict`, ... | - | selves |
| `measure/tone-census` | Scalar summaries of a ternary tone buffer (values in -1, 0, +1) | `totalCharge`, `liveCount` | - | foundations, holography, quantum, relativity, substrate-survey |
| `measure/tone-entropy` | The Shannon entropy (in bits) of the ternary tone histogram over a chosen set of slot indices | `ternaryToneEntropyBits` | - | quantum |
| `measure/statistics` | Small statistical measures shared across experiments | `mean`, `populationVariance`, `standardDeviation`, `pearson`, ... | - | foundations, geometry, gravity, holography, quantum, relativity, +2 |
| `measure/histogram` | Shape statistics of a one-dimensional distribution, read off a fixed-width histogram | `histogramFlatness` | - | relativity |
| `measure/profile` | Measures over a one-dimensional spatial profile and over a weighted point cloud | `chargeDensityProfile`, `profileGradient`, `radialFieldProfile`, `weightedGridRadiusOfGyration` | `tone/will` | gravity, selves |
| `measure/regression` | Least-squares regression measures used to read off scaling exponents from experiment data | `logLogSlope`, `powerLawExponent`, `fitForm`, `linearFit`, ... | - | cosmology, foundations, gauge, geometry, gravity, holography, +3 |
| `measure/spectrum` | Small spectral-classification kit | `distinctLevels`, `zeroModeCensus` | - | gauge, renormalization |
| `measure/churn` | Churn of the second-order reversible mod-q wave on a neighbors graph, the count of cells whose tone changes from one beat to the next, summed over... | `churnCount` | - | substrate-survey |
| `measure/enstrophy` | The enstrophy-like quadratic of the lattice gas: the sum over all sites of tone squared, which for ternary tone is the count of nonzero sites | `enstrophy` | `tone/will` | fluids |
| `measure/momentum` | The momentum current of the directional lattice gas: the vector sum, over every site, of its tone times the site's direction vector (a D4 root) | `totalMomentum`, `momentumDrift` | `algebra/group/root-system`, `tone/will` | relativity |
| `measure/continuity` | Coarse-grained continuity of the directional lattice gas | `coarseContinuityResidual` | `rule/collision`, `rule/lattice-gas`, `tone/will` | gravity, method |
| `measure/graph-continuity` | The discrete continuity (divergence) law on a region of a mesh graph | `regionBall`, `cellDistances`, `regionCharge`, `continuityResidual` | - | cosmology, gravity |
| `measure/field-laplacian` | The discrete Laplacian of a scalar field sampled on a 2D integer grid, the five-point stencil lap(f)(i, j) = f(i+h, j) + f(i-h, j) + f(i, j+h) + f(... | `fieldLaplacianProfile` | - | gravity |
| `measure/fill-coherence` | Measures on a ternary tone field with per-edge fills (the perception substrate) | `fillCoherence`, `adaptFills`, `largestSharingPatch` | - | selves |
| `measure/hydrodynamics` | Hydrodynamics on the committed D4 lattice gas | `coordAlong`, `cellMomentum`, `coarseGradientEnergy`, `shearSetup`, ... | `rule/collision`, `rule/lattice-gas`, `tone/will`, `tool/mesh` | fluids, relativity |
| `measure/cell-graph-spectral` | The bulk spectral readout of a Coxeter cell graph, the most-duplicated structural measurement in the tessellation survey | `cellGraphSpectral` | `measure/dimension`, `substrate/coxeter/cell-direct`, `tool/graph` | substrate-survey |
| `measure/collision-family` | The family of momentum-conserving reversible knit rules, and how the 24-cell symmetry forces it | `linePairingFamily` | - | foundations |
| `measure/base-forcing` | Forcing the base choices, the ternary tone and the four dimensions | `toneAlphabetQualifies`, `minimalQualifyingAlphabetSize`, `dynkinAutomorphismOrder`, `hasTriality` | - | foundations |
| `measure/numerology-density` | Numerology density, a refutation tool | `closedFormHitCount` | - | gauge |
| `measure/factor-complexity` | Factor (subword) complexity of a finite sequence: p(n) is the number of distinct length-n factors that appear in it | `factorComplexity`, `factorComplexityProfile`, `aboveComplexityLine`, `differenceSignSequence` | - | computation |

### Self, memory, data structure, holography
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `measure/associative-memory` | Deterministic vector-symbolic (hyperdimensional) associative memory, for the capacity data-structure experiment | `vsaRecallAccuracy` | - | data-structure |
| `measure/associative-recall` | Measures for a content-addressable associative memory, recall accuracy, capacity versus radius, and search latency | `exactRecallRate`, `nearestRecallRate`, `falsePositiveRate`, `coverageRadius`, ... | `measure/shells`, `operator/associative-memory`, `tool/rng` | associative |
| `measure/navigation` | Navigation without addressing: can a vibe route a message using only its neighbors and embedding coordinates, with no global table and no Fibonacci... | `greedyRouteHops`, `greedyRoutingSuccess`, `routingWithBacktrack` | `geometry/distance`, `tool/graph`, `tool/rng` | addressing, data-structure, relativity, substrate-survey |
| `measure/sketch` | Deterministic Bloom-filter false-positive measurement, for the boundary-sketch data-structure experiment | `cellHash`, `hashTableProbeStats`, `bloomFalsePositiveRate` | - | data-structure |
| `measure/imprint-retention` | Cohesive-memory retention on a stored graph | `imprintRetention` | `dynamics/perception-edge-beat`, `tool/graph`, `tool/rng` | substrate-survey |
| `measure/recoverability` | Herbert's recoverability functional R = accessible / total, the single currency that unifies thermodynamics (entropy as lost recoverability), decoh... | `RecoverabilityPoint`, `recoverabilityTrace` | `rule/collision`, `rule/lattice-gas`, `tone/will` | gravity |
| `measure/self-occlusion` | The perceivable fraction of a self's Being, computed several ways from the {3,4,3,4} geometry | `directionalFacingFraction`, `trialityChiralFraction`, `dimensionalCuspFraction`, `tetrahedronFaceFraction`, ... | `algebra/group/root-system`, `algebra/vector` | geometry |
| `measure/holography` | Holographic measurements on a tiling | `bulkShortcutScaling`, `ryuTakayanagiScaling` | - | holography |
| `measure/avalanche` | Avalanche sizes by damage spreading | `toneDensity`, `settledAvalancheSizes`, `avalancheSizes` | - | foundations, renormalization, selves |
| `measure/locality` | Locality range (P1, operational form) | `ruleLocalityRange` | `measure/distance`, `rule/rule`, `tone/alphabet`, `tone/configuration` +2 more | foundations |
| `measure/transport` | Entropic optimal transport | `sinkhornW1` | - | geometry |
| `measure/tessellation-battery` | The single reusable battery that runs against ANY regular hyperbolic tessellation, given its Schläfli symbol | `TessellationMeasurement`, `measureTessellation` | `measure/associative-recall`, `measure/fermion-propagation`, `measure/shells`, `operator/associative-memory` +2 more | associative, substrate-survey |
| `measure/tessellation-profile` | A universal data-structure profile for ANY hyperbolic Coxeter tessellation, given only its Schlafli symbol | `TessellationProfile`, `cellCoordination`, `tessellationDataProfile` | `substrate/coxeter/growth`, `substrate/coxeter/matrix-group` | data-structure |
| `measure/tessellation-survey` | The shared per-symbol measurement used by the hyperbolic-tessellation survey experiments (2d/3d/4d/5d) | `surveyTessellation` | `measure/dimension`, `measure/shell-growth-ratio`, `measure/shells`, `substrate/coxeter/cell-direct` | substrate-survey |

## 8. Dynamics (`code/dynamics`)

Time evolution. Monte Carlo over causal sets (MCMC, parallel tempering, Wang-Landau, uniform sampling, exact enumeration), lattice gauge dynamics (Wilson, SU(2), Schwinger), RK4 integrators (Friedmann, inflaton, orbits, free fall), reduced field models (Ginzburg-Landau, shell-model turbulence, morphogenesis), and the perception sweeps that run the rule on edge lists.

| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `dynamics/action` | A causal-set action: a real-valued functional of the order, the weight exponent in the sum over histories | `Action`, `benincasaDowkerAction`, `smearedKernel2D`, `smearedBenincasaDowker`, ... | `measure/dimension`, `tool/bitset`, `tool/poset` | cosmology, foundations, gravity, quantum, substrate-survey |
| `dynamics/bath` | Boundary operations modelling the open or growing substrate on a finite lattice | `isBoundaryCell`, `absorbBoundary`, `frontierToPeace` | `tone/will` | selves |
| `dynamics/central-force-orbit` | Planar orbits under a central gravitational force in d spatial dimensions, integrated with RK4 | `centralForceAcceleration`, `integrateCentralForceOrbit` | - | cosmology |
| `dynamics/clock-winding` | A clock field on a ring and its topological WINDING | `ClockRing`, `clockWinding`, `stepClockRing`, `makeTwist` | - | selves |
| `dynamics/coarsegrain` | Random coarse-graining (decimation) of a causal set: keep each element with a fixed probability and inherit the induced order on the survivors | `decimate` | `tool/poset`, `tool/rng` | renormalization |
| `dynamics/cohesive-sweep` | One beat of the cohesive (company-driven) perception sweep over an edge list | `agreeCount`, `cohesiveEdgeSweep` | `tool/rng` | holography, selves |
| `dynamics/coined-walk-distribution` | The position distribution of a discrete-time coined walk on a line, both the coherent (quantum) and the incoherent (classical) versions, started fr... | `coinedWalkQuantumDistribution`, `coinedWalkClassicalDistribution` | - | computation, quantum |
| `dynamics/conserving-sweep` | One beat of the conserving perception rule over an undirected edge list | `conservingEdgeSweep`, `conservingEdgeSweepTunable`, `conservingChainSweep`, `conservingRingSweep`, ... | `tool/rng` | computation, foundations, gauge, holography, quantum, relativity, +2 |
| `dynamics/director-relaxation` | Nematic director relaxation on a ring: heat flow (gradient descent of the Frank elastic energy) on the director angle, respecting the headless n ~... | `relaxDirector` | - | spin |
| `dynamics/exact-enumeration` | Exact enumeration of causal sets at small N | `exactCausalSetAverages` | `dynamics/action`, `tool/bitset`, `tool/poset` | foundations |
| `dynamics/fill-gated-sweep` | One beat of conserved exchange on a ternary field with per-edge fills | `fillGatedSweep` | `tool/rng` | selves |
| `dynamics/flat-willed-drift-sweep` | One beat of a willed drift on a flat 2D square grid | `flatWilledDriftSweep` | `tool/rng` | selves |
| `dynamics/free-fall` | Free fall in a potential, the geodesic motion of a body of mass cells down a field | `freeFallStep` | - | selves |
| `dynamics/friedmann` | The Friedmann-Lemaitre cosmological dynamics, integrated forward with RK4 | `FluidComponent`, `friedmannStep`, `integrateFriedmann`, `decelerationParameter` | - | gravity |
| `dynamics/genesis` | Genesis dynamics: the conserving perception rule run from a chosen initial tone | `chargedCount`, `chargeTrajectory`, `genesisProfile`, `wakeDrivenSweep`, ... | `dynamics/conserving-sweep`, `model/self-kit`, `tool/graph`, `tool/rng` | cosmology |
| `dynamics/ginzburg-landau` | Relaxation (gradient flow) of a complex order-parameter field on a ring, the Ginzburg-Landau / XY-model heat flow | `Complex2`, `ringFieldWithWinding`, `ringDefectPair`, `ringFieldEnergy`, ... | - | spin |
| `dynamics/goal-directed-search` | Two bit-string searches toward a target pattern, the goal-directed and the aimless | `solveGoalDirected`, `solveUndirected` | - | computation |
| `dynamics/graded-index-ray` | Geodesics of an effective metric, traced as rays in a graded-index medium | `traceGradedIndexRay`, `rayDeflection`, `softenedMassIndexField` | - | gravity |
| `dynamics/gravity-field` | A discrete gravity field, an integer potential sourced by mass, the legitimate way to add a discrete attraction (a field with its own dynamics, not... | `bulkMass`, `relaxPotential`, `gravityMoves`, `vacuumDensity` | - | gravity, selves |
| `dynamics/higgs-mechanism` | The Higgs mechanism for a real scalar with the Mexican-hat potential V(phi) = -mu2 phi^2 + lambda phi^4 | `mexicanHatVacuum`, `higgsBosonMassSquared`, `gaugeBosonMass` | - | gauge |
| `dynamics/inflaton` | Slow-roll inflaton dynamics, integrated with RK4 | `inflatonHubble`, `inflatonStep` | - | cosmology |
| `dynamics/leapfrog-wave` | The deterministic reversible (leapfrog) wave on a periodic 1D line | `leapfrogWaveStep`, `blockAverage`, `evolveLeapfrogWave`, `leapfrogWaveCommutingError`, ... | `measure/statistics` | renormalization |
| `dynamics/mcmc` | Metropolis Monte Carlo over labelled causal sets: the testbed's approximation of Bombelli's sum over histories | `transitiveClosure`, `sampleCausalSets` | `dynamics/action`, `tool/bitset`, `tool/poset`, `tool/rng` | cosmology, quantum, substrate-survey |
| `dynamics/measurement` | Measurement as deterministic settling of a coherent body coupled to an open bath | `bornAtPeace`, `slabOccupancy`, `pointerTrajectory`, `loschmidtEcho`, ... | `measure/agreement`, `measure/profile`, `rule/collision`, `rule/lattice-gas` +2 more | quantum |
| `dynamics/morphogenesis` | Deterministic morphogenesis: a discrete activator-inhibitor rule on a ring that forms a stable, regular striped pattern from a fixed structured see... | `morphogenesis` | - | selves |
| `dynamics/nucleation` | Deterministic nucleation: the critical-nucleus threshold behind abiogenesis | `nucleate` | - | selves |
| `dynamics/optical-ray` | Gravity as time dilation, the optical metric | `refractiveDeflection` | - | gravity |
| `dynamics/oscillator-bath` | A bound coordinate (a captured body's internal degree of freedom, in an attractive well) coupled to a radiative field-chain bath | `OscillatorBathInput`, `oscillatorBathTrajectory`, `TwoBodyBathInput`, `twoBodyBathTrajectory`, ... | - | selves |
| `dynamics/parallel-tempering` | Parallel tempering (replica exchange) for the causal-set sum over histories | `parallelTempering` | `dynamics/action`, `dynamics/mcmc`, `tool/bitset`, `tool/poset` +1 more | gravity |
| `dynamics/peierls-wavepacket` | A 2D tight-binding charged wavepacket evolved with Peierls phases in the Landau gauge A_y = B*x, so the y-hops carry a phase e^{i B x} | `peierlsWavepacketDrift` | - | gauge |
| `dynamics/perception-edge-beat` | One beat of the perception rule on an edge list, dispatching between the cohesive sweep (company-driven hops, so blobs form, annihilating opposite... | `perceptionEdgeBeat` | `dynamics/cohesive-sweep`, `dynamics/conserving-sweep`, `tool/rng` | substrate-survey |
| `dynamics/phase-field` | A phase field on a ring, the minimal carrier of a topological winding (the spinor phase of the 8s/8c sector) | `phaseRelaxStep`, `phaseWaveStep`, `gradientStructure`, `windingKinkWithLump` | - | selves |
| `dynamics/pumped-reserve-sweep` | One beat of conserved hops with a self-vs-field pump/leak structure | `pumpedReserveSweep` | `tool/rng` | selves |
| `dynamics/quantum-walk` | Discrete-time coined quantum walk on a line, the unitary cousin of the classical random walk | `coinedWalkMSD`, `continuousQuantumWalkMsd`, `continuousClassicalWalkMsd`, `coinedWalkDispersion`, ... | `measure/regression` | quantum, relativity, renormalization, spin |
| `dynamics/random-walk` | Random walks on a neighbors graph | `classicalWalkMSD`, `graphWalkMsdExponent`, `randomWalkEndpoint`, `randomWalkPath`, ... | `measure/shells`, `tool/rng` | quantum, relativity, spin |
| `dynamics/renormalization-blocks` | Block (cluster) constructions for real-space renormalization on a graph, and the coherence-tunable edge fills that set whether coherent domains can... | `csrVoronoiBlocks`, `geometricBlocks`, `domainBlocks`, `coherentFills` | `tool/graph`, `tool/rng` | renormalization, selves |
| `dynamics/renormalization-group` | One-loop renormalization-group running of gauge couplings and quark masses | `oneLoopInverseCoupling`, `couplingMeetingTime`, `oneLoopStrongCoupling`, `qcdRunningMassFactor`, ... | - | gauge |
| `dynamics/replication` | Deterministic self-replication: a constructor that copies a template pattern, the basis of heredity | `replicate` | - | computation |
| `dynamics/reversible-wave` | The second-order reversible wave on a neighbors graph, the deterministic (no-RNG) dynamics that propagates ballistically (z=1) instead of diffusing | `reversibleWaveStep`, `reversibleWaveStepNonlinear` | - | gravity, relativity |
| `dynamics/schwarzschild-photon` | Strong-field photon orbits in the Schwarzschild geometry, the black-hole shadow | `schwarzschildPhotonDeflection`, `photonSphereShadowRadius`, `measuredShadowRadius` | - | gravity |
| `dynamics/schwinger-coupled` | The coupled fermion-plus-gauge evolution on a 1+1D ring, the lattice Schwinger model realized as the substrate's photon (gauge) and fermion (spinor... | `CoupledSchwingerInput`, `CoupledSchwingerResult`, `runCoupledSchwinger` | `algebra/linear/complex` | gauge |
| `dynamics/shadow-pressure` | Discrete radiation-pressure (Casimir-shadow) attraction, binding by radiation | `ShadowPressureResult`, `shadowPressureRun`, `shadowPressureD4`, `selfContainedShadowD4`, ... | `algebra/group/root-system`, `tool/mesh` | gravity, selves |
| `dynamics/shell-model` | The GOY shell model of turbulence, the standard reduced model of the Kolmogorov energy cascade | `goyShellSpectrum`, `spectrumSlope` | - | fluids |
| `dynamics/skyrmion-field` | A reduced continuous spin field that hosts a DM-stabilized bound Skyrmion, the reduced model of localized REVERSIBLE TOPOLOGICAL BINDING (the bindi... | `Spin`, `SkyrmionParams`, `relaxSpins`, `precessSpins`, ... | - | selves |
| `dynamics/soc-sweep` | One beat of a self-organized-criticality activity sweep around an edge | `localActivity`, `socEdgeSweep` | `tool/rng` | selves |
| `dynamics/static-metric-photon` | Deriving the Schwarzschild metric from the bare dynamics by the self-consistent bootstrap, gravity gravitates, and the photon deflection on a gener... | `spatialMetricBootstrap`, `staticMetricPhotonDeflection` | - | gravity |
| `dynamics/su2-lattice` | Non-Abelian SU(2) lattice gauge theory on a periodic hypercubic lattice | `Quat`, `Su2Lattice`, `makeSu2Lattice`, `metropolisSweep`, ... | `tool/rng` | gauge |
| `dynamics/swerve-walk` | The Dowker-Henson-Sorkin swerve walk on a 2D causal set | `swerveWalk` | `substrate/sprinkle-box` | - |
| `dynamics/ternary-field` | A reduced per-cell ternary field, the tone read as Z3 ({-1,0,+1} = {2,0,1} mod 3) on a 1D chain, evolved by an exactly reversible second-order cell... | `TernaryField`, `TernaryRule`, `TernaryBoundary`, `makeTernaryField`, ... | - | selves |
| `dynamics/uniform-sampler` | A correct uniform-measure sampler for causal sets | `State`, `makeState`, `isRelated`, `toggle`, ... | `tool/bitset`, `tool/rng` | cosmology, foundations, geometry |
| `dynamics/wang-landau` | Wang-Landau estimation of the density of states for causal sets, over the integer HEIGHT (longest chain) | `WangLandauResult`, `wangLandauHeight`, `windowedWangLandau`, `manifoldFractionAt`, ... | `dynamics/uniform-sampler`, `tool/bitset`, `tool/rng` | renormalization |
| `dynamics/wave-field` | A reduced integer second-order field, a discrete wave equation with an on-site force, on a 1D chain | `WaveField`, `Acceleration`, `WaveBoundary`, `makeWaveField`, ... | - | selves |
| `dynamics/wilson` | Lattice gauge dynamics on a substrate graph: the Wilson action over plaquettes (smallest oriented loops) and a Metropolis heat-bath sweep over the... | `plaquettesOf`, `wilsonAction`, `heatBathSweep` | `tool/gauge-field`, `tool/graph`, `tool/rng` | gauge |
| `dynamics/wilson-grid` | The Wilson lattice gauge action on a periodic L^3 cubic lattice, in the link-index representation (link variables theta[d + 3 * site]) | `PlaquetteLink`, `gridPlaquettes`, `gridWilsonAction`, `gridMaxwellAction` | - | gauge |

## 9. Coarse-graining (`code/coarse`)

Renormalization and emergence: blocking a graph, decimating a field, fitting effective rules, extracting the macroscopic law from the microscopic one.

| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `coarse/active-persistence` | Active persistence, a self acting to survive (the observer chunk, the act-to-persist frontier of E1) | `PersistenceResult`, `activePersistence` | `model/self-kit`, `tool/rng` | selves |
| `coarse/block-charge-tower` | Real-space block-charge renormalization tower on a 1D field | `BlockChargeLevel`, `blockChargeTower` | - | renormalization |
| `coarse/causal-emergence` | The causal-emergence layer (Hoel effective information) of the coarse-graining engine | `effectiveInformation`, `coarseGrainTpm`, `emergenceGain` | - | selves |
| `coarse/driven-self` | A central self driven by a structured sectored environment, for the observer experiments (the self as a model-builder, E1) | `DrivenSelfSeries`, `drivenSelf` | `model/self-kit`, `tool/rng` | selves |
| `coarse/group-field` | Coarse-grain a per-cell field to a per-group field by averaging | `coarseFieldByGroup`, `sumFieldByGroup`, `cubicBlockGroups` | - | renormalization |
| `coarse/individuality` | The individuality-transition measures (multi-level-selves plan, E5) | `fitnessVariancePartition` | - | selves |
| `coarse/level-stack` | The level stack of the coarse-graining engine | `Level`, `effectiveVibeCount`, `isCleanLevel` | - | selves |
| `coarse/macro-unit` | The macro-unit layer of the coarse-graining engine (see the multi-level-selves plan) | `Graph`, `MacroUnit`, `extractUnits`, `coarseLabels`, ... | - | - |
| `coarse/pattern-persistence` | Pattern persistence against the churn (the persistence problem, PS1) | `patternSurvivalTime` | `model/self-kit`, `tool/rng` | selves |
| `coarse/self-criteria` | The three self-criteria of the multi-level-selves plan, as reusable measures (E1) | `Graph`, `correlation`, `partialCorrelation`, `blanketScreening`, ... | - | selves |
| `coarse/self-trajectory` | Shared micro source for the coarse-graining experiments (E2, E3, E4 in the multi-level-selves plan) | `makeRng`, `Trajectory`, `selfTrajectory`, `positionBin`, ... | `coarse/macro-unit`, `model/self-kit` | selves |
| `coarse/surrogate` | Learned surrogate dynamics for a self, the reusable heart of the multiscale tower | `fitMarkovSurrogate`, `marginalDistribution`, `predictiveLogLikelihood`, `marginalLogLikelihood`, ... | `coarse/transition-matrix` | selves |
| `coarse/surrogate-tower` | The temporal renormalization tower of surrogates (the multiscale-self program, MS3 and MS6) | `TowerLevel`, `surrogateTower`, `towerAccuracyAtLag` | `coarse/surrogate` | selves |
| `coarse/transition-matrix` | The Markov-state-model layer of the coarse-graining engine (see the multi-level-selves plan, E2 and E3) | `quantileLabels`, `countMatrix`, `detailedBalanceViolation`, `rowStochastic`, ... | - | quantum, selves |
| `coarse/two-self` | Two-self machinery for the multiscale interaction experiments (MS2) | `SelfShape`, `emergeSelfShape`, `stampShape`, `plusCount`, ... | `coarse/self-trajectory`, `model/self-kit` | selves |
| `coarse/valence-drift` | Valence drift, the approach-avoid response of a self to a tone gradient (the observer chunk, E4) | `valenceDrift`, `valenceDifferential` | `model/self-kit`, `tool/rng` | selves |
| `coarse/validator` | The validator of the coarse-graining engine, the commuting square (see the multi-level-selves plan, E3) | `commutingSquareError`, `mostProbableNext` | - | selves |

## 10. Controls and model (`code/control`, `code/model`)

Controls are the null baselines a real result must beat. Model holds shared model-level constructions used across experiments.

### control: null baselines
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `control/lossy-collision` | A lossy, non-invertible collision, the negative control for reversibility and purification experiments | `erasingCollision` | `rule/collision` | fluids, foundations, gravity, method, quantum, relativity |
| `control/null` | Null controls (shuffled / charge-preserving baselines) a real result must beat | `randomNull`, `preservesCharge`, `shuffledToneField` | `tone/will`, `tool/rng` | renormalization |

### model: shared constructions
| Module | Math it implements | Key exports | Prerequisites | Used by (experiments) |
|:--- |:--- |:--- |:--- |:--- |
| `model/deliberation` | Deliberation: a phenomenological model of how a DETERMINISTIC self makes a choice | `Tone`, `ternaryVector`, `makeSelf`, `settle`, ... | `operator/hopfield`, `tool/rng` | computation, selves |
| `model/selection` | Deterministic evolution: variation plus persistence-selection, with no randomness | `evolvePopulation` | `model/deliberation`, `operator/hopfield`, `tool/rng` | selves |
| `model/self-kit` | Shared dynamics for the self experiments (P178 to P184) | `Graph`, `Rng`, `toCSR`, `bulkGraph`, ... | `substrate/coxeter/cell-direct`, `substrate/coxeter/cell-scale`, `tool/rng` | cosmology, geometry, selves, substrate-survey |
| `model/trajectory` | A lived trajectory: a deterministic self acting on a world over many beats, so the IMPACT of its steering can be measured as the gap between the li... | `Tone`, `Agent`, `runTrajectory`, `multiAgentTrajectory`, ... | - | selves |
| `model/vibe` | A tiny DSL for the committed Vibe Theory model, so the whole model reads at a glance | `MeshKind`, `ToneKind`, `FillKind`, `RuleKind`, ... | `measure/dimension`, `measure/integration`, `measure/lorentz`, `operator/laplacian` +7 more | foundations |

## Rendering and compute (not findings-bearing math)

Four folders exist purely to draw and accelerate, not to produce findings. They sit outside the experiment math chain and are not tabled here:

- `code/draw` (6 modules): low-level drawing primitives.
- `code/render` (61 modules): rendering of fields, graphs, and substrates to images and frames.
- `code/viz` (5 modules): visualization helpers.
- `code/compute` (40 modules): GPU and compute-kernel acceleration of math already defined in the layers above.

These render or speed up the science. They never define a finding. An experiment's verdict never depends on them.

## Prerequisite spine

Almost everything traces back to a small set of load-bearing modules. The core chain:

```
tool/mesh  +  tone/will                 (the space and its state)
      |
      v
rule/collision  +  rule/lattice-gas     (the one committed law: stream then collide)
      |
      +--> check/invariant, check/structure   (charge, momentum, reversibility)
      |
      v
operator/* (Laplacian, Dirac, ...)  +  measure/* (dimension, Lorentz, ...)
      |
      v
dynamics/* (MCMC, lattice gauge, RK4)  +  coarse/* (renormalization)
      |
      v
experiments under test/
```

The most-depended-on leaves, by `code/` importer count, are `tool/rng` (the seeded deterministic PRNG, used everywhere because reproducibility is a hard requirement), `tool/graph` (the substrate graph), `tool/poset` (the causal set), `tool/substrate` (the graph/poset union), and `tool/embedding` (optional coordinates for validation only). The two foundations the whole physics rests on are `tool/mesh` and `tone/will`. Remove either and nothing above the foundation layer can run.
