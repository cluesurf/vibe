# The Fermion Engine

The discrete Kahler-Dirac operator on a cell complex. It puts a fermion
on ANY oriented substrate, as differential forms (cochains) rather than
direction labels, through the single operator D = d + delta. This is the
field layer, the way a spinor lives on a graph the tessellation engine
produced.

> This is how a fermion goes on a substrate whose directions carry no
> spinor. Instead of attaching a spin representation to the
> face-directions (which fails on {5,3,4}, where the 12 directions are
> 1+3+3'+5 with no spinor), we attach a value to every CELL across
> grades and let the boundary maps do the work. The result is a genuine
> Dirac operator on the {5,3,4} bulk, validated by
> `test/experiment/spin/kahler-dirac-534.ts` and made to MOVE by
> `test/experiment/spin/kahler-dirac-propagation-534.ts`.

Source, `code/operator/dirac.ts` and
`code/operator/exterior-derivative.ts`.

## What it does

Given a substrate (any graph the tessellation engine builds), the
engine,

- builds a CELL COMPLEX from it, 0-cells are vertices, 1-cells are
  edges, 2-cells are triangles, with boundary maps that carry
  orientation signs,
- assembles D = d + delta on the direct sum of all cochain spaces, one
  symmetric block matrix,
- gives the SPECTRUM (the dispersion relation, the fermion-doubling
  check) via Lanczos,
- finds the ZERO MODES, the harmonic forms, a topological invariant
  equal to the Betti sum.

A spinor here is one element of the direct sum of cochain spaces, that
is, one value per cell across grades. No spin structure on the
directions is required. This works on any oriented complex, which is
exactly why it delivers a fermion on {5,3,4} where the direction labels
cannot.

## The components

| file                     | role                                                                                                                                           |
|:--- |:--- |
| `exterior-derivative.ts` | the dense reference: boundary maps, `transpose`, `multiply`, `exteriorDerivative`, `kahlerDirac`, `polygonComplex`, `boundaryOfBoundaryIsZero` |
| `dirac.ts`               | the sparse production engine: `CellComplex`, `cellComplexOf`, `kahlerDirac`, `diracSpectrum`, `kahlerDiracZeroModes`                           |

Use `exterior-derivative.ts` for small exact checks (the pentagon, the
d-squared-is-zero identity). Use `dirac.ts` to run D on a real {5,3,4}
bulk graph, where sparse storage and Lanczos are required.

## How to use it

### Build a cell complex from a substrate graph

```ts
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { makeGraph } from '@/code/tool/graph'
import { cellComplexOf } from '@/code/operator/dirac'

const bulk = buildCellGraph({ symbol: [5, 3, 4], maxCells: 2000 })
const graph = makeGraph({
  size: bulk.cellCount,
  directed: false,
  neighbors: bulk.neighbors,
})

const complex = cellComplexOf({ substrate: graph, maxGrade: 1 })
// complex.cellCount  -> [vertexCount, edgeCount]  (add triangles with maxGrade: 2)
// complex.boundary[1] -> the edge -> vertex boundary map, with +1/-1 orientation signs
```

### Assemble D and read its spectrum

```ts
import { kahlerDirac, diracSpectrum } from '@/code/operator/dirac'

const dirac = kahlerDirac({ complex }) // one symmetric sparse matrix on the stacked cochain vector
const low = diracSpectrum({ complex, count: 32 }) // the lowest 32 eigenvalues, the dispersion relation
```

### Find the zero modes (the topological invariant)

```ts
import { kahlerDiracZeroModes } from '@/code/operator/dirac'

const { smallestMagnitudes, zeroModes } = kahlerDiracZeroModes({
  complex,
  count: 16,
  threshold: 1e-6,
})
// zeroModes -> the count of harmonic forms, equal to the Betti sum of the complex
```

### Exact small checks (dense)

```ts
import {
  polygonComplex,
  kahlerDirac,
  multiply,
  boundaryOfBoundaryIsZero,
} from '@/code/operator/exterior-derivative'

const face = polygonComplex(5) // the {5} face of {5,3,4}
boundaryOfBoundaryIsZero(face) // -> true, d composed with d is zero
const operator = kahlerDirac(face)
const squared = multiply(operator, operator) // -> the Hodge Laplacian, block-diagonal across grades
```

## How it works

The whole engine is one idea, REPLACE the direction label with a form on
the complex. The pipeline,

1. **Build the cell complex** (`cellComplexOf`). The 0-cells are
   vertices, the 1-cells are undirected edges `a < b`, the 2-cells are
   triangles (3-cliques) when `maxGrade >= 2`. Orientation is fixed by
   ascending vertex order. The boundary map `boundary[1]` sends an edge
   `(a, b)` to `+b - a` (a difference along the edge). The boundary map
   `boundary[2]` sends a triangle `(a, b, c)` with `a<b<c` to
   `(b,c) - (a,c) + (a,b)`. These signs make boundary-of-boundary
   exactly zero, the defining identity of a complex.
2. **A spinor is a stacked cochain**. The state vector is
   `[0-cochains, 1-cochains, 2-cochains]`, one value per cell, with
   grade `k` starting at `offset[k]`. There is no spin index, the grade
   structure carries it.
3. **Stack d and delta in mirror positions** (`kahlerDirac`). For each
   boundary map `B_k`, place `B_k` itself as the DELTA block (it maps
   grade k down to grade k-1, at rows `offset[k-1]`, cols `offset[k]`)
   and place its transpose `B_k^T` as the D block (it maps grade k-1 up
   to grade k, the mirror position). Putting a map and its transpose in
   mirror positions makes the whole operator SYMMETRIC, so Lanczos
   applies.
4. **D squared is the Hodge Laplacian** (`multiply(D, D)`). Because d
   and delta move between adjacent grades only, `D^2` is BLOCK-DIAGONAL
   across grades, with no grade mixing. That block-diagonal structure is
   the Dirac signature, D is a square root of the Laplacian.
5. **Zero modes** (`kahlerDiracZeroModes`). D is indefinite, so its zero
   modes sit in the MIDDLE of its spectrum. We find them as the smallest
   eigenvalues of the positive operator `D^2` (Lanczos), then take
   square roots. The count below a small threshold is the number of
   harmonic forms, a topological invariant equal to the Betti sum of the
   complex.

The dense `exterior-derivative.ts` and the sparse `dirac.ts` agree by
construction, the second is the first in CSR form with a Lanczos solver
bolted on.

## Capabilities and limits

What it handles,

- ANY oriented complex, so a fermion lands on {5,3,4}, {7,3}, {3,4,3,4},
  or any tessellation graph, with no spin structure on the directions.
- The full spectrum (the dispersion, the doubling check) and the
  harmonic zero modes (the topological count).
- Propagation under the unitary `exp(-i D t)`, shown extended on the
  clean bulk and localized under an Aubry-Andre potential (the
  propagation test).

The caveats,

- The Kahler-Dirac operator on a single complex is a MULTIPLET, not one
  Dirac field. In the continuum it carries `2^(n/2)` copies, one per
  form grade, the staggered-fermion multiplicity. A single physical
  Dirac field needs STAGGERING, the distillation that projects out one
  copy. That projection is not done here, the engine delivers the full
  Kahler-Dirac multiplet.
- The static spectrum alone is geometry, not dynamics. The propagation
  result (does the fermion MOVE) is a separate measurement, and the
  stronger relativistic Dirac-CONE dispersion `omega ~ |k|` is NOT
  claimed, the substrate irregularity makes a clean momentum-space
  dispersion hard.

## Why it matters

The {5,3,4} face-directions carry no spinor. The spinor test proved the
12 directions decompose as 1+3+3'+5, with no spinor piece, so the direct
route to a fermion fails on the committed substrate. The Kahler-Dirac
route sidesteps the obstruction entirely. It builds the fermion from
FORMS on the complex, which exist on any oriented graph. So the model
gets a genuine, propagating fermion on {5,3,4} without abandoning the
substrate, and the same engine carries a fermion to {3,4,3,4} or any
other tessellation for free.

## See also

- `api/operator.md`, the brief consumer guide to the operator layer
  (this doc is the deeper dive under it).
- `test/experiment/spin/kahler-dirac-534.ts`, the structural proof, D
  squares to the block-diagonal Laplacian on a {5,3,4} face.
- `test/experiment/spin/kahler-dirac-propagation-534.ts`, the dynamics,
  the {5,3,4} fermion propagates on the clean bulk and localizes under a
  deterministic quasiperiodic potential.
- `evolution-and-propagation.md`, the deep dive on how the fermion
  PROPAGATES under `exp(-i D t)` and how the extended-versus-localized
  phases are measured.
