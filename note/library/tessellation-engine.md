# The Tessellation Engine

The exact Coxeter reflection engine. It classifies and builds ANY
regular hyperbolic (or Euclidean) tessellation from its Schlafli symbol,
and produces the cell-adjacency graph the dynamics runs on. This is the
substrate layer, everything physical in the model lives on a graph this
engine produces.

> This is the substrate layer the whole program rests on, delivered
> generically. Any hyperbolic tessellation is classified and built
> through one robust API, so the experiments run on {3,4,3,4} (or
> anything else) through the same machinery. The whole-catalog survey is
> built on top of this engine, see the catalog in
> `code/substrate/tessellation-catalog`, the battery in
> `code/measure/tessellation-battery`, and
> `note/cross-tessellation-experiments.md` for how to run an experiment
> against every tessellation at once.

Source, `code/substrate/coxeter/`. Validated by
`test/experiment/substrate-survey/generic-tessellation-engine.ts`.

## What it does

Given a linear Schlafli symbol like `{7,3}`, `{5,3,4}`, or `{3,4,3,4}`,
the engine,

- CLASSIFIES the geometry (spherical, Euclidean, hyperbolic), the cell,
  the vertex figure, and the compactness (compact, paracompact),
- decides whether it can be BUILT and by which method,
- BUILDS the cell-adjacency graph (each cell is a node, joined to its
  facet-neighbours) with coordinates in the Poincare ball,
- works for ANY rank (2D tilings, 3D honeycombs, 4D hyper-honeycombs)
  with no per-symbol code.

A Schlafli convention reminder, a k-entry symbol tiles k-dimensional
space. `{5,3,4}` (3 entries) tiles hyperbolic 3-space. `{3,4,3,4}` (4
entries) tiles hyperbolic 4-space. The CELL is the symbol minus its last
entry, the VERTEX FIGURE is the symbol minus its first entry.

## The components

| file                 | role                                                                                        |
|:--- |:--- |
| `schlafli.ts`        | the exact Coxeter math, Gram matrix, geometry classification, the mirror frame              |
| `cell-direct.ts`     | the reflection-orbit engine, builds the cell graph for any rank, plus horosphere extraction |
| `tessellation.ts`    | the generic FRONT-END, classify, route, build, inspect, never degenerates                   |
| `cell-scale.ts`      | the exact high-precision {5,3,4} builders (double-double arithmetic) for scale              |
| `word.ts`            | Coxeter-word machinery (coordinate-free addressing)                                         |
| `coxeter-growth.ts`  | exact growth series (Steinberg formula), shell-count combinatorics                          |
| `addressing-3434.ts` | the {3,4,3,4} addressing automaton experiments                                              |

Start with `tessellation.ts`. It is the one entry point a caller should
use.

## How to use it

### Classify a symbol (no build)

```ts
import { describeTessellation } from '@/code/substrate/coxeter/tessellation'

const d = describeTessellation([3, 4, 3, 4])
// d.geometry           -> 'hyperbolic'
// d.spaceDimension     -> 4
// d.cell               -> [3,4,3]   (the 24-cell)
// d.cellGeometry       -> 'spherical' (finite cell, so the orbit engine applies)
// d.vertexFigure       -> [4,3,4]   (the cubic honeycomb, the cusp)
// d.vertexFigureGeometry -> 'euclidean'
// d.compactness        -> 'paracompact'  (ideal vertices)
// d.buildable          -> true
// d.builder            -> 'orbit'
// d.note               -> 'hyperbolic 4D honeycomb, paracompact, exact reflection-orbit engine applies'
```

### Build the cell graph

```ts
import {
  buildTessellation,
  inspectTessellation,
} from '@/code/substrate/coxeter/tessellation'

const { descriptor, graph } = buildTessellation({
  symbol: [3, 4, 3, 4],
  maxCells: 50000,
})
if (graph) {
  // graph.cellCount      -> number of cells built
  // graph.neighbors[i]   -> array of neighbour cell ids of cell i (facet-adjacency)
  // graph.coords[i]      -> Poincare-ball coordinates of cell i
  // graph.facetCount     -> the cell's facet degree (24 for the 24-cell)
  const info = inspectTessellation(graph)
  // info.facetDegree     -> 24
  // info.shellCounts     -> BFS shell sizes (exponential for hyperbolic)
  // info.growthRatios    -> shell-to-shell ratios
}
```

If a symbol cannot be built by the orbit engine, `graph` is `null` and
`descriptor.note` says why. Nothing silently degenerates.

### Extract the flat layer (horosphere)

```ts
import { buildHorosphereBand } from '@/code/substrate/coxeter/cell-direct'

// the flat 2D Euclidean slice of {5,3,4}, the emergent flat layer, as a graph the dynamics runs on
const sheet = buildHorosphereBand({
  symbol: [5, 3, 4],
  maxBand: 120000,
  half: 0.5,
})
// sheet.cellCount, sheet.neighbors, sheet.coords, sheet.busemann, sheet.idealPoint
```

### Lower-level pieces (if needed)

```ts
import {
  classifyGeometry,
  gramMatrix,
  mirrorFrame,
} from '@/code/substrate/coxeter/schlafli'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'

classifyGeometry([7, 3]) // 'hyperbolic'
gramMatrix([5, 3, 4]) // the 4x4 Gram matrix of the mirror normals
mirrorFrame([5, 3, 4]) // { normals, metric, timeAxis } in the model space
buildCellGraph({ symbol: [7, 3], maxCells: 5000 }) // direct, hyperbolic only, finite-cell only
```

## How it works

The whole engine is one idea, REFLECTION. A regular tessellation is the
orbit of a single fundamental chamber under a group generated by
reflections in its walls (a Coxeter group). The pipeline,

1. **Gram matrix** (`gramMatrix`). From the symbol `{p1,...,pk}`, build
   the matrix of mirror-normal inner products, `G_ii = 1`,
   `G_{i,i+1} = -cos(pi / p_i)`, zero for non-adjacent mirrors.
2. **Signature, hence geometry** (`classifyGeometry`). Diagonalize G (a
   small Jacobi eigensolver). The count of negative eigenvalues decides
   the geometry, zero negatives is spherical, a zero eigenvalue is
   Euclidean, exactly one negative is hyperbolic (a Lorentzian model
   space), more is "higher".
3. **Mirror frame** (`mirrorFrame`). From the eigendecomposition, place
   the mirror normals in a model space with a diagonal metric (one
   timelike axis for the hyperbolic case), so their inner products
   reproduce G exactly. Each mirror gives a reflection matrix.
4. **Cell centre and cell stabilizer**. The first few generators fix the
   cell centre. Enumerate the finite cell-stabilizer group, and the
   facet normals are its orbit of the outer generator. This is why the
   cell must be FINITE (spherical), the stabilizer must be a finite
   group.
5. **Orbit BFS** (`buildCellGraph`). Track each cell by a group-element
   matrix, its centre is the matrix times the seed centre, its
   neighbours are reached by the facet reflections. Breadth-first from
   the seed, deduplicating cells by their rounded Poincare coordinates,
   until `maxCells`.
6. **Project to the Poincare ball**. Divide out the timelike coordinate,
   giving points in the unit ball, the familiar conformal picture.

The result is exact in structure (correct adjacency and facet degree)
and floating-point in coordinates. For high-precision scaling there is a
double-double variant (`cell-scale.ts`).

## Capabilities and limits

What it handles,

- ANY rank, 2D tilings through 4D (and higher) honeycombs, with no
  per-symbol code.
- Compact and PARACOMPACT honeycombs (finite cells with ideal vertices,
  like {3,4,3,4}).
- Euclidean honeycombs, routed to a flat-lattice builder
  (`buildEuclideanLattice`).
- Horosphere and cusp extraction (the emergent flat layer).

The one hard precondition,

- The CELL must be finite (spherical). A honeycomb whose cell is
  Euclidean or hyperbolic (for example {6,3,3}, whose cell {6,3} is the
  flat hexagonal tiling) has an infinite cell-stabilizer, so the orbit
  engine cannot build it. The front-end DETECTS this and returns
  `buildable: false` with the reason, rather than producing a degenerate
  graph.

What is not yet built (the next pieces),

- Exact-coordinate scaling for arbitrary symbols (the double-double
  engine is {5,3,4}-specific so far).
- The rank-5 (and general) WORD engine, coordinate-free addressing of 4D
  honeycomb cells by Coxeter words.

## Worked examples (verified, `substrate-survey/generic-tessellation-engine`)

| symbol    | geometry   | dimension         | cell               | facet degree       | compactness              |
|:--- |:--- |:--- |:--- |:--- |:--- |
| {7,3}     | hyperbolic | 2D                | heptagon           | 7                  | compact                  |
| {5,3,4}   | hyperbolic | 3D                | dodecahedron       | 12                 | compact                  |
| {3,5,3}   | hyperbolic | 3D                | icosahedron        | 20                 | compact                  |
| {3,3,6}   | hyperbolic | 3D                | tetrahedron        | 4                  | paracompact              |
| {3,4,3,4} | hyperbolic | 4D                | 24-cell            | 24                 | paracompact (cubic cusp) |
| {4,3,3,5} | hyperbolic | 4D                | tesseract          | 8                  | compact                  |
| {6,3,3}   | hyperbolic | 3D                | (infinite cell)    | not buildable      | flagged                  |
| {3,4,3}   | spherical  | finite 4-polytope | the 24-cell itself | not a tessellation | flagged                  |
| {4,3,4}   | euclidean  | 3D                | cube               | (lattice builder)  | compact                  |

## Why it matters

This engine is the substrate the whole model rests on. The dynamics (the
discrete ternary rule), the flat layer (the horosphere), the field,
gravity, and the selves all run on graphs this produces. Making it
GENERIC means the project is no longer tied to {5,3,4}, the same
machinery now builds {3,4,3,4} (the 4D candidate, with its exact flat 3D
cubic cusp) and the whole hyperbolic tessellation zoo, which is what the
frontier research agenda needs.

## See also

- `api/substrate.md`, the brief consumer guide to building a mesh (this
  doc is the deeper dive on the engine under it).
- `../cross-tessellation-experiments.md`, how to run an experiment
  against every regular hyperbolic tessellation.
- `code/substrate/tessellation-catalog.ts`, the full enumerated catalog
  of regular hyperbolic tessellations.
- `code/measure/tessellation-battery.ts`, the one reusable battery that
  measures any tessellation.
- `test/experiment/substrate-survey/generic-tessellation-engine.ts` (the
  engine validation) and
  `test/experiment/substrate-survey/tessellation-survey.ts` (the
  whole-catalog survey).
- `note/research/vibe/notes/theory-v0.7.0/paper/tessellations.csv`,
  every substrate and its measured properties.
- The source catalog notes in
  `note/research/vibe/explorations/emergent-geometry/paper/notes/hyperbolic-tessellations`.
