# Algebra (Symmetry and Linear Algebra)

The symmetry-group and linear-algebra toolkit behind the vibe experiments.
It gives you spinors, root systems, octonions, the exceptional Jordan algebra, and fast eigensolvers for big sparse matrices.

## Group and spinor algebra

| module | what it gives you |
| --- | --- |
| `@/code/algebra/group/quaternion` | `quaternion`, `multiply`, `conjugate`. `binaryTetrahedral()` (24 cells) and `binaryIcosahedral()` (120 cells) return the finite spin groups as quaternion lists. |
| `@/code/algebra/group/rotation` | `rotateVector(g, v)` and `rotateSpinor(g, psi)`. A spinor picks up a sign under a full turn, a vector does not. `rotationMatrixAxisAngle` for 3x3 rotations. |
| `@/code/algebra/group/clifford` | `pauli()`, `diracGamma()`, `diracGamma5()`, `diracHamiltonian({ px, py, pz, mass })`. Complex-matrix helpers `cmMultiply`, `cmCommutator`, `cmAntiCommutator`. |
| `@/code/algebra/group/root-system` | `rootsD4()` (24 roots), `rootsF4()` (48 roots), `icosahedronVertexDirections()`. Plus `rootsDn`, `rootsAn`, `isRootSystem`. |
| `@/code/algebra/group/cell-24` | `cell24Vertices()` and `trialityClasses()`. Splits the 24-cell into its three triality classes (vector, two spinors). |
| `@/code/algebra/group/so8-triality` | `vectorRep8`, `spinorRepEven8`, `spinorRepOdd8`, `applyTriality`. The SO(8) triality swap. |
| `@/code/algebra/group/disclination` | `disclinationHolonomy({ winding, steps })` and `spinorHolonomy`. Transports a spinor around a defect, returns the `(-1)^winding` sign. |
| `@/code/algebra/group/finite-group` | Generic `closure`, `commutatorSubgroup`, `contains` over any `GroupOps<T>`. |
| `@/code/algebra/group/special-linear` | `specialLinear(prime)` builds SL(2, p) mod a prime. `multiplyModP`, `centre`. |
| `@/code/algebra/octonion` | `octonionMultiply`, `octonionConjugate`, `octonionNormSquared`. The 8-dim non-associative algebra (coefficients on `e0..e7`). |
| `@/code/algebra/jordan` | The exceptional Jordan algebra J3(O). `hermitianOctonionDimension(n)`, `diagonalJordanFrame(n)`, `jordanProduct`, `maxJordanIdentityResidual(n)` (near zero for n<=3, large for n>=4). |
| `@/code/algebra/vector` | Real-vector basics. `dot`, `norm`, `add`, `sub`, `scale`, `normalize`. |
| `@/code/algebra/stabilizer` | Pauli stabilizer codes. `stabilizerGroup`, `logicalOperators`, `codeDistance`. |

## Linear algebra (matrices, eigensolvers, spectral methods)

| module | what it gives you |
| --- | --- |
| `@/code/algebra/linear/complex` | `complex({ re, im })`, `cAdd`, `cMul`, `cConj`, `cAbs`, `cFromPhase`. |
| `@/code/algebra/linear/dense` | `makeDense`, `denseMatVec`, `matrixProduct`, `determinant`, `solveLinearSystem`. |
| `@/code/algebra/linear/sparse` | `sparseFromTriplets({ rows, cols, triplets })`, `sparseMatVec`, `operatorFromSparse`. CSR matrices and the `LinearOperator` interface the eigensolvers consume. |
| `@/code/algebra/linear/eig-jacobi` | `eigSymmetric({ matrix })` for real symmetric matrices. Returns all eigenvalues and eigenvectors. |
| `@/code/algebra/linear/eig-hermitian` | `eigHermitian({ matrix })` for complex Hermitian matrices. Ascending values, real and imaginary eigenvector parts. |
| `@/code/algebra/linear/eig-lanczos` | `lowestEigenvalues({ operator, count })`. Lanczos solver for the smallest eigenvalues of a huge sparse operator. |
| `@/code/algebra/linear/kernel-polynomial` | Kernel polynomial method (KPM). `chebyshevMoments`, `jacksonKernel`, `spectralBound`. Approximate spectral densities without diagonalizing. |
| `@/code/algebra/linear/bethe-resolvent` | `betheBoundaryExponent`, `betheCavityDecay`, `finiteTreeResolventRatio`. Cavity method on tree graphs. |

## Use it

Root system of D4 (the 24 directions).

```ts
import { rootsD4 } from '@/code/algebra/group/root-system'

const roots = rootsD4() // 24 vectors in R^4
```

Lowest eigenvalues of a big sparse operator via Lanczos.

```ts
import { sparseFromTriplets, operatorFromSparse } from '@/code/algebra/linear/sparse'
import { lowestEigenvalues } from '@/code/algebra/linear/eig-lanczos'

const matrix = sparseFromTriplets({ rows: n, cols: n, triplets })
const values = lowestEigenvalues({ operator: operatorFromSparse(matrix), count: 4 })
```

Hermitian eigenproblem (dense, complex).

```ts
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'

const { values, vectorsRe, vectorsIm } = eigHermitian({ matrix })
// values ascending. component a of eigenvector i = vectorsRe[a*n+i] + i*vectorsIm[a*n+i]
```

The exceptional Jordan algebra J3(O). It stays a Jordan algebra only up to size 3.

```ts
import { maxJordanIdentityResidual } from '@/code/algebra/jordan'

maxJordanIdentityResidual(3) // near 0, the identity holds
maxJordanIdentityResidual(4) // large, it fails over the octonions
```

Real experiments that drive these:

- `test/experiment/spin/spinor-triality.ts` and `test/experiment/spin/triality-generations.ts` use the 24-cell triality classes.
- `test/experiment/spin/generations-f4-jordan.ts` uses octonions, J3(O), and the F4 roots for the three generations.
- `test/experiment/spin/generation-family-symmetry-3434.ts` uses the Jordan frame.
- `test/experiment/gauge/g-factor-3434.ts` for the spinor g-factor.
- `test/experiment/relativity/symmetry-restoration-3434.ts` and `isotropy-24dir.ts` use the D4/F4 root systems.

## See also

- `@/code/algebra/linear/sparse` `sparseWithAubryAndrePotential` for deterministic (no-randomness) localization.
- The quaternion spin groups feed `@/code/algebra/group/rotation` for the spinor sign tests.
- Group plumbing for finite groups lives in `@/code/algebra/group/finite-group` (`closure`, `commutatorSubgroup`).
