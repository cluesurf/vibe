# The Spectral Engine

The eigensolver and spectral-method toolkit the operators rely on. It diagonalizes Laplacians and Dirac
operators, builds the matrix sign for the overlap fermion, and gives the exact boundary propagator on a
tree. This is the linear-algebra layer under the field, the fermion, and the gravity experiments.

> These routines were pulled out of the experiments and made reusable. Anything that needs a spectrum, a
> spectral function, or a tree resolvent goes through one of these methods. The same Jacobi rotation diagonalizes a
> Lanczos tridiagonal, a small Hamiltonian, and (through a real embedding) a complex Hermitian matrix. The
> KPM gets a spectral function from mat-vecs alone, so the overlap operator never needs a full diagonalization.

Source, `code/algebra/linear/`. Used across the operator and fermion engines.

---

## What it does

Given a large sparse symmetric operator, a small dense matrix, or a complex Hermitian matrix, the engine,

- gets the LOWEST few eigenvalues of a big sparse operator by Lanczos, in O(n * nnz * k), never forming a
  dense matrix,
- diagonalizes a small dense symmetric matrix exactly by Jacobi rotations,
- diagonalizes a complex Hermitian matrix by a 2n real embedding, then reuses the real solver,
- builds the matrix sign and counts zero modes for the overlap fermion,
- expands a spectral function (like `|H|` or `sign(H)`) in Chebyshev polynomials from mat-vecs alone (KPM),
- gives the EXACT resolvent and boundary correlator exponent on a regular tree (Bethe lattice).

The split is by size. Small and dense goes to Jacobi. Large and sparse goes to Lanczos or KPM. The tree case
is closed-form, no matrix at all.

---

## The components

| file | role |
| ---- | ---- |
| `eig-jacobi.ts` | the real symmetric solver, cyclic Jacobi rotations (`eigSymmetric`, `jacobiEigenvalues`) |
| `eig-lanczos.ts` | lowest-k eigenvalues of a large sparse operator via a Krylov tridiagonal (`lowestEigenvalues`) |
| `eig-hermitian.ts` | complex Hermitian via the 2n real embedding, plus matrix sign and zero-mode count |
| `kernel-polynomial.ts` | the KPM, Chebyshev moments, Jackson kernel, `|x|` coefficients, spectral bound |
| `bethe-resolvent.ts` | the exact tree resolvent and boundary correlator exponent |
| `sparse.ts` | CSR matrix, mat-vec, the `LinearOperator` interface, the Aubry-Andre potential |
| `dense.ts` | small dense and complex matrices, determinant, linear solve |

Start with `sparse.ts` to present an operator, then pick the solver by size.

---

## How to use it

### Lowest eigenvalues of a sparse operator

```ts
import { sparseFromTriplets, operatorFromSparse } from '@/code/algebra/linear/sparse'
import { lowestEigenvalues } from '@/code/algebra/linear/eig-lanczos'

// build the Laplacian (or Dirac) as triplets, then a LinearOperator
const matrix = sparseFromTriplets({ rows: n, cols: n, triplets })
const operator = operatorFromSparse(matrix)

const low = lowestEigenvalues({ operator, count: 8, steps: 60 })
// low[0]  -> the spectral gap (smallest eigenvalue)
```

### Complex Hermitian eigenvalues (overlap operator)

```ts
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian, countNearZeroEigenvalues } from '@/code/algebra/linear/eig-hermitian'

const eig = eigHermitian({ matrix: hermitian })   // eig.values ascending, vectorsRe / vectorsIm
const zeroModes = countNearZeroEigenvalues({ matrix: hermitian, tolerance: 1e-8 })
```

### The boundary propagator on a tree

```ts
import { betheBoundaryExponent, betheCavityDecay } from '@/code/algebra/linear/bethe-resolvent'

const mu = betheCavityDecay({ coordination: 4, energy: 4 })       // massless point, mu = 1 / b
const alpha = betheBoundaryExponent({ coordination: 4, energy: 4 }) // the boundary 1/r^alpha exponent
// at the massless Laplacian point alpha = 2 (the holographic 1/r law)
```

---

## How it works

Each method is one idea.

1. **Lanczos** (`lowestEigenvalues`). To get the lowest few eigenvalues of a big symmetric operator without a
   dense O(n^3) diagonalization, build a Krylov basis. Apply the operator to a start vector, subtract off the
   previous two directions (`alpha`, `beta`), and the operator projected onto this basis is TRIDIAGONAL. With
   full reorthogonalization against the stored basis (the Krylov dimension `m` is small) the tridiagonal stays
   clean. Diagonalize that small tridiagonal with Jacobi and take the lowest `count` values. Cost is `m`
   mat-vecs, O(n * nnz * m), not O(n^3). The start vector is a fixed-seed PRNG, never all-ones (that is exactly
   the Laplacian null vector), so the spectrum is reproducible run to run.

2. **Jacobi** (`eigSymmetric`). To diagonalize a small dense symmetric matrix, sweep over off-diagonal pairs
   and zero each one with a plane rotation. The rotation angle is `phi = 0.5 * atan2(2 a_pq, a_qq - a_pp)`.
   Apply it on both sides, accumulate the rotations into the eigenvector matrix, repeat sweeps until the
   off-diagonal sum is tiny. Robust, dependency-free, eigenvectors included. `jacobiEigenvalues` is the
   values-only sibling for spectra where only the levels and degeneracies matter.

3. **Complex Hermitian** (`eigHermitian`). A complex Hermitian `H = A + iB` (A symmetric, B antisymmetric)
   maps to the 2n-by-2n real symmetric matrix `[[A, -B], [B, A]]`. Diagonalize THAT with the real Jacobi
   solver. Each complex eigenvalue appears twice, so take one column of each degenerate pair. For an embedded
   eigenvector `(u, w)` the complex eigenvector is `u + i w`. `hermitianMatrixSign` then builds
   `sum_i sign(lambda_i) |v_i><v_i|`, the matrix sign for the overlap operator, and `countNearZeroEigenvalues`
   counts its zero modes, the lattice index.

4. **Kernel polynomial method** (`chebyshevMoments`). To get a spectral function of a large operator without
   diagonalizing it, expand it in Chebyshev polynomials. First scale `H` into `[-1, 1]` with `spectralBound`
   (the largest eigenvalue of `H^2` by power iteration). Compute the moments
   `mu_n = <probe| T_n(H/scale) |probe>` by the Chebyshev three-term recurrence, MAT-VECS only. For a
   non-smooth target like `|x|` at zero, multiply the `absoluteValueCoefficients` by the `jacksonKernel` to
   damp the Gibbs ringing. Combined with a stochastic trace this estimates `Tr|H|`, the Dirac-sea energy, with
   no full spectrum.

5. **Bethe resolvent** (`betheCavityDecay`, `betheBoundaryExponent`). On an infinite regular tree the
   adjacency resolvent decays by a fixed factor `mu` per step, the root of `b mu^2 - E mu + 1 = 0` for
   branching `b = z - 1`. The massless Laplacian point is `E = z`, giving `mu = 1 / b`. The boundary distance
   grows as `b^(tree-distance / 2)`, so a bulk-mediated boundary correlator decays as `1 / r^alpha` with
   `alpha = 2 ln(1/mu) / ln(b)`. At the massless point `alpha = 2`, the holographic `1/r` law, exact and
   free of finite-patch artifacts. `finiteTreeResolventRatio` validates it against a directly-solved finite
   rooted tree.

---

## Capabilities and limits

When to use which solver,

- **Lanczos** for a large sparse operator when you need only the LOW end of the spectrum (the gap, the
  near-zero modes). It scales with `nnz` and the number of wanted eigenvalues, not `n^3`. It does not give the
  full spectrum, and interior eigenvalues need more Krylov steps or a shift.
- **Jacobi** for a small dense matrix (up to a few hundred) when you want everything, values and vectors,
  exactly. It is O(n^3) per sweep, so it does not scale to large `n`.
- **KPM** when you want a spectral FUNCTION (a trace, a density of states, the matrix sign) rather than
  individual eigenvalues, and the operator is too big to diagonalize. Accuracy is set by the Chebyshev order.
  The Jackson kernel trades a little resolution for no ringing, important for a non-smooth target like `|x|`
  or `sign`.
- **Bethe** when the geometry is (locally) a regular tree. It is exact and closed-form, no matrix.

The reusable presentation is `LinearOperator` from `sparse.ts`. Anything that exposes `size` and `apply` plugs
into Lanczos and KPM, so the same solver runs on a Laplacian, a Dirac operator, or an operator with the
deterministic Aubry-Andre potential added (`sparseWithAubryAndrePotential`, the localization control).

---

## Why it matters

The operators in the model are spectral. The field gap is the lowest Laplacian eigenvalue. The fermion content
is the near-zero spectrum of the Dirac operator. The overlap fermion is built from the matrix sign. The
Dirac-sea energy is `Tr|H|`. The holographic boundary law is the tree resolvent exponent. All of these come
from this one toolkit, so the experiments measure spectra the same way everywhere, and the heavy cases
(overlap, condensate) run from mat-vecs instead of dense diagonalizations they could not afford.

## See also

- `api/algebra.md`, the brief consumer guide to the linear-algebra layer (this doc is the deeper dive).
- `fermion-engine.md`, the Dirac and overlap operators that consume the matrix sign and the zero-mode count.
- `code/algebra/linear/`, the source for every method named here.
- The overlap and condensate experiments under `test/experiment/`, which use `eigHermitian`,
  `hermitianMatrixSign`, and the KPM `Tr|H|` estimate.
- The holographic boundary-correlator experiment, which uses `betheBoundaryExponent` for the `1/r` law.
