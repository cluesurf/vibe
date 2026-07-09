# code/algebra

The symmetry-and-linear-algebra layer. It is not a stage the state flows through, it is the toolbox the operators and spinor experiments draw from beside the pipeline (`substrate -> tone -> rule -> dynamics -> coarse -> model`). Two halves. The **symmetry algebra** is the discrete group theory the {3,4,3,4} model rests on, the D4, F4, and E8 root systems, the quaternion groups (Q8, the binary tetrahedral 2T, the binary icosahedral 2I), the Clifford and Dirac matrices, SO(8) triality cycling the three 8-dimensional representations, the octonions, and the J3(O) Jordan algebra that forces a rank of 3. The **linear algebra** is the numerical engine the field operators need, dense and sparse matrices, complex arithmetic, the eigensolvers (Jacobi, Lanczos real and complex), the kernel-polynomial method, power iteration with deflation, and the Bethe resolvent.

## Symmetry algebra (top level)

| file | key exports | one-line |
|:--- |:--- |:--- |
| `octonion.ts` | `Octonion`, `octonionMultiply`, `octonionConjugate`, `octonionNormSquared` | the 8-dimensional non-associative division algebra, Fano-plane product |
| `jordan.ts` | `jordanProduct`, `diagonalJordanFrame`, `isJordanIdempotent`, `maxJordanIdentityResidual`, `isJordanAutomorphism` | the Hermitian octonionic Jordan algebra H_n(O), the rank-3 structure |
| `binary-tetrahedral.ts` | `binaryTetrahedralGroup`, `quaternionMultiply`, `spinorAction`, `vectorAction`, `isClosedUnderMultiplication` | the 24 unit Hurwitz quaternions (2T), the double cover of the 24-cell rotations |
| `helicity.ts` | `plusSelfOverlap`, `plusToCrossOverlap`, `rotationZ`, `PLUS_POLARIZATION`, `CROSS_POLARIZATION` | graviton spin-2 verification, cos 2θ and sin 2θ under rotation |
| `stabilizer.ts` | `stabilizerGroup`, `logicalOperators`, `codeDistance`, `pauliCommute`, `erasureCorrectable` | GF(2) stabilizer quantum codes, the [[5,1,3]] perfect code |
| `vector.ts` | `dot`, `norm`, `add`, `sub`, `scale`, `normalize`, `innerJ`, `normJ` | Euclidean and Minkowski vector operations on number arrays |

## Symmetry algebra (`group/` subdir)

The discrete groups and root systems.

- `root-system.ts` builds the root systems and tests closure, `rootsD4()` (24), `rootsF4()` (48), `rootsE8()` (240), `rootsB4()`, plus `reflectRoot`, `isRootSystem`, `reflectionClosure`, `cartanMatrix`, `spinorWeightsDn`, and `standardModelEmbedsInRootSystem`.
- `quaternion.ts` is the object-style quaternion with `multiply`, `conjugate`, `negate`, and the three groups `quaternionGroup()` (Q8), `binaryTetrahedral()` (2T, 24), `binaryIcosahedral()` (2I, 120).
- `clifford.ts` is the spinor machinery, `pauli()`, `diracGamma()`, `diracGamma5()`, `diracHamiltonian({ px, py, pz, mass })`, the complex-matrix helpers (`cmMultiply`, `cmKron`, `cmCommutator`, `cmAntiCommutator`), and the `minkowski` metric.
- `so8-triality.ts` cycles the representations, `vectorRep8()` (8v), `spinorRepEven8()` (8s), `spinorRepOdd8()` (8c), and `applyTriality` (the Hadamard map).
- `cell-24.ts` and `cell-forcing.ts` give the 24-cell vertices, their triality classes, and the ternary-tone closure that forces the stepping-shell geometry (`twentyFourCellForced`, `steppingShellPolytopes`).
- `rotation.ts`, `rotation-matrix.ts`, `orthogonal-algebra.ts`, `finite-group.ts`, `automorphism.ts` give the quaternion-on-vector and spinor rotations, the Rodrigues 3x3 rotation, the O(p,q) Lie generators, the generic `closure`/`commutatorSubgroup`, and the Weyl and automorphism-group orders.
- `max-flow.ts` is Dinic max-flow and `undirectedMinCut`, the Ryu-Takayanagi minimal-surface and bit-thread count. `special-linear.ts` builds SL(2,p), `invariant-theory.ts` the Molien invariant dimension, `dihedral.ts`/`icosahedral.ts`/`disclination.ts` the face permutations and disclination holonomy.

## Linear algebra (`linear/` subdir)

The numerical engine.

| file | key exports | one-line |
|:--- |:--- |:--- |
| `complex.ts` | `Complex`, `cAdd`, `cMul`, `cConj`, `cAbs`, `cFromPhase` | complex-number arithmetic |
| `complex-vector.ts` | `Cx`, `newCx`, `dotR` | complex vectors as split real and imaginary `Float64Array` halves |
| `dense.ts` | `makeDense`, `denseMatVec`, `matrixProduct`, `determinant`, `solveLinearSystem` | dense matrices and Gaussian elimination |
| `sparse.ts` | `SparseMatrix`, `sparseFromTriplets`, `sparseMatVec`, `LinearOperator`, `operatorFromSparse`, `sparseWithAubryAndrePotential` | CSR sparse matrices and the large-operator interface |
| `eig-jacobi.ts` | `eigSymmetric`, `jacobiEigenvalues`, `jacobiEigenvalues3` | the Jacobi eigensolver for symmetric matrices |
| `eig-hermitian.ts` | `eigHermitian`, `hermitianMatrixSign`, `countNearZeroEigenvalues` | the Hermitian eigensolver, lowest eigenpairs |
| `eig-lanczos.ts` | `lowestEigenvalues` | Lanczos for the low spectrum of a large symmetric operator |
| `eig-lanczos-complex.ts` | `lowestAbsoluteEigenvalues`, `largestEigenvalueOfSquare`, `HermitianApply` | Lanczos for complex Hermitian operators |
| `kernel-polynomial.ts` | `chebyshevMoments`, `absoluteValueCoefficients`, `jacksonKernel`, `spectralBound` | the kernel-polynomial method, Chebyshev moments of a spectral function |
| `power-iteration.ts` | `lowestEigenpairs`, `Eigenpair` | shifted power iteration with deflation |
| `bethe-resolvent.ts` | `betheCavityDecay`, `betheBoundaryExponent`, `finiteTreeResolventRatio` | the Bethe-ansatz cavity decay and resolvent bounds on a tree |
| `voigt.ts` | `symmetricTensorToVoigt`, `voigtToSymmetricTensor`, `operatorToVoigtMatrix` | Voigt notation for symmetric rank-2 tensors |

## Main entry points

- `octonionMultiply(a, b): Octonion` is the non-associative product, and `jordanProduct(A, B)` the symmetrized `(AB + BA)/2` on Hermitian octonionic matrices. `maxJordanIdentityResidual(n)` and `diagonalJordanFrame(n)` are the tests that the rank is forced to 3.
- `binaryTetrahedralGroup(): Quaternion[]` returns the 24 unit quaternions of the coin, `vectorAction(q, v)` is the conjugation rotation and `spinorAction(q, s)` the left multiplication that carries the minus sign under a full turn.
- `rootsD4()`, `rootsF4()`, `rootsE8()` return the root systems, and `applyTriality` cycles 8v, 8s, 8c.
- `eigSymmetric({ matrix })`, `lowestEigenvalues({ operator, count, steps? })`, and `lowestAbsoluteEigenvalues({ operator, count, dim })` are the eigensolvers the field operators call, `chebyshevMoments({ operator, scale, probe, count, dim })` the KPM spectral-density engine, and `sparseFromTriplets({ rows, cols, triplets })` plus `operatorFromSparse` the way an operator is assembled from a substrate.

## Used by

- **Narrated by** [spinor-coin.md](../spinor-coin.md) (the 24-direction D4 coin, 2T, triality, the 2pi sign), [fermion-engine.md](../fermion-engine.md) (Clifford and the Dirac operator), and [spectral-engine.md](../spectral-engine.md) (the eigensolvers, KPM, the Bethe resolvent). Consumer guide, [api/algebra.md](../api/algebra.md).
- **Feeds** `code/operator` (the matrices are built with `linear/`) and `code/measure` (spectral measures diagonalize through the eigensolvers).
- **Example arenas** `test/experiment/spin/` (2T, triality, the graviton helicity), `test/experiment/quantum/` and `test/experiment/gauge/` (the Dirac and stabilizer machinery), and `test/experiment/holography/` (max-flow min-cut for Ryu-Takayanagi).
