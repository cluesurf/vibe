# Operators (Matrices on a Substrate)

An operator turns a substrate (or a cell complex built from one) into a matrix you can diagonalize or evolve. The Laplacian gives you diffusion and effective dimension. The Dirac operator gives you fermions and zero modes. Diagonalize for a spectrum, or exponentiate for time evolution.

## The key operators

### Laplacian and diffusion

| operator (`@/code/operator/<file>`) | what it builds |
|:--- |:--- |
| `laplacian({ substrate })` (`laplacian`) | The graph Laplacian `L = D - A` as a `SparseMatrix`. The base of diffusion and the static-force sector. |
| `laplacianSpectrum({ substrate, count })` (`laplacian`) | The lowest `count` eigenvalues of `L`, ascending, via Lanczos. Gives effective dimension and the heat-kernel return. |
| `laplacianGreensFunction({ substrate, center })` (`laplacian`) | The static potential `phi` solving `L phi = delta`, neutralized. A potential that decays with graph distance. |
| `graphLaplacian({ ... })`, `graphLaplacianGreensFunction({ ... })`, `solveGraphPoisson({ ... })` (`graph-laplacian`) | The same family on an explicit adjacency graph. Used for the Newtonian-gravity tests. |

### Dirac and fermions

| operator (`@/code/operator/<file>`) | what it builds |
|:--- |:--- |
| `cellComplexOf({ substrate, maxGrade })` (`dirac`) | The cell complex (vertices, edges, faces) over a substrate. The input every Dirac operator wants. |
| `kahlerDirac({ complex })` (`dirac`) | The Kahler-Dirac operator `D = d + delta` as a `SparseMatrix`. Fermions as differential forms. |
| `diracSpectrum({ complex, count })` (`dirac`) | The lowest `count` eigenvalues of `D`, ascending. |
| `kahlerDiracZeroModes({ complex, count, threshold })` (`dirac`) | The smallest `|eigenvalues|` of `D` plus a zero-mode count (the Betti sum, a topological invariant). |
| `polygonComplex(sides)`, `exteriorDerivative(complex, grade)`, `kahlerDirac(complex)` (`exterior-derivative`) | The dense-matrix path. Build a polygon complex, take its `d`, fold to `D = d + delta`. Good for small hand-checkable cases. |
| `naiveDirac2D`, `wilsonDirac2D`, `overlapDirac2D`, `scanBrillouin` (`lattice-fermion`) | The 2x2 momentum-space lattice fermions. `scanBrillouin` sweeps the Brillouin zone to find doublers. |

### Gauge fields

| operator (`@/code/operator/<file>`) | what it builds |
|:--- |:--- |
| `covariantKahlerDirac({ complex, field, charge })` (`gauge-dirac`) | The Kahler-Dirac operator with a gauge field threaded through the edges (link phases). |
| `overlapIndex({ length, charge })` (`gauge-index`) | The overlap-fermion index (spectral asymmetry) plus the total flux. The lattice index theorem. |
| `gaugeWilsonDirac({ length, charge })` (`gauge-index`) | The Wilson-Dirac matrix in a fixed U(1) flux background, the input to the overlap. |
| `chiralCondensateSignal({ ... })` (`overlap-condensate`), `chiralCondensateSignalSU2({ ... })` (`overlap-su2`) | The near-zero eigenvalue density of disordered overlap fermions. The chiral condensate (U(1) and SU(2)). |
| `diracLandauHamiltonian({ levels, fieldStrength, mass })` (`landau`) | The Dirac Hamiltonian in a magnetic field. Its zero mode encodes the spin g-factor. |
| `scalarLandauSquared({ levels, fieldStrength, mass })` (`landau`) | The spinless control with no zero mode. The gap between this and Dirac is the magnetic moment. |

### Evolution and tight-binding

| operator (`@/code/operator/<file>`) | what it builds |
|:--- |:--- |
| `evolveByEigendecomposition({ eig, n, re0, im0, t })` (`unitary-evolution`) | Exact unitary time evolution `e^{-iHt}` once you have the eigendecomposition. |
| `ringHoppingHamiltonian`, `staggeredMassChainHamiltonian`, `torusHoppingHamiltonian`, `openChainPotentialApply` (`tight-binding`) | Tight-binding hoppers on a ring, a staggered-mass chain, a torus, or an open well. The free-particle baselines. |
| `hamiltonianMatrix({ perm })` (`ca-hamiltonian`) | The permutation Hamiltonian of a reversible cellular automaton, ready to diagonalize. |
| `addComplexBlock({ ... })` (`block`) | The shared 2x2 spinor-block assembler. The brick under the gauge Dirac operators. |
| `commutingBlockHamiltonian`, `blockCaPermutation` (`block-ca`) | Block-cellular-automaton Hamiltonians and their permutations. |

Specialized operators (graviton, linearized Einstein, Jackiw-Rebbi, register machines, Hopfield, Ising RG, lattice gases, logic gates) live in the same folder and follow the same shape. Reach for them only when an experiment names them.

## Use it

Build a Laplacian and read its low spectrum.

```ts
import { laplacian, laplacianSpectrum } from '@/code/operator/laplacian'

const matrix = laplacian({ substrate })
const lowest = laplacianSpectrum({ substrate, count: 16 })
```

Build the Kahler-Dirac operator on a cell complex and count its zero modes.

```ts
import { cellComplexOf, kahlerDirac, kahlerDiracZeroModes } from '@/code/operator/dirac'

const complex = cellComplexOf({ substrate, maxGrade: 2 })
const dirac = kahlerDirac({ complex })
const { zeroModes } = kahlerDiracZeroModes({ complex, count: 8, threshold: 1e-6 })
```

The g-factor from the Landau Hamiltonian and its spinless control.

```ts
import { diracLandauHamiltonian, scalarLandauSquared } from '@/code/operator/landau'

const dirac = diracLandauHamiltonian({ levels: 32, fieldStrength: 0.1, mass: 1 })
const scalar = scalarLandauSquared({ levels: 32, fieldStrength: 0.1, mass: 1 })
```

### Worked examples

- `test/experiment/spin/kahler-dirac-534.ts` uses `polygonComplex` and `kahlerDirac` to put fermions on `{5,3,4}` as forms.
- `test/experiment/gauge/g-factor-3434.ts` uses `diracLandauHamiltonian` and `scalarLandauSquared` for the spin g-factor.
- `test/experiment/gravity/newtonian.ts` uses `graphLaplacianGreensFunction` for the static potential.
- `test/experiment/gauge/su2-condensate.ts` uses `chiralCondensateSignalSU2` for the chiral condensate.

## See also

- `substrate.md` for building the mesh the operators run on.
- `measure.md` for the dimension and curvature probes that read these spectra.
- `algebra.md` for the eigensolvers (`lowestEigenvalues`, `eigHermitian`) the operators call.
