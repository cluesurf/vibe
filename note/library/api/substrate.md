# Substrates (Building a Mesh)

A substrate is the discrete space your vibes live on. It is a graph of cells, each with a fixed coin of directions to its neighbours. You build one, then stream tones across it. This guide covers the builders a consumer actually uses.

## The key builders

### Regular hyperbolic tessellations

| builder | what it gives you |
| ------- | ----------------- |
| `buildCoxeterMatrixMesh(schlafli, maxCells)` (`@/code/substrate/coxeter/matrix-group`) | The uniform reflection-group mesh for ANY regular tessellation. Returns `{ shells, adjacency }`. The fast, exact path. Pass a Schlafli array like `[5,3,4]` or `[3,4,3,4]`. |
| `buildCellGraph({ symbol, maxCells })` (`@/code/substrate/coxeter/cell-direct`) | A `CellGraph` with `neighbors`, `coords` (Poincare ball), `generation` shells, and `faceNeighbor` (per-direction neighbour, for addressing automata). Use when you need geometry or directional faces. |
| `buildCoxeterMesh({ symbol, depth, maxChambers })` (`@/code/substrate/coxeter/engine`) | The full `CoxeterMesh`: facet-adjacency plus Poincare coordinates and generation distances. The general engine when you want everything. |

### The {3,4,3,4} coin mesh (the home substrate)

| builder | what it gives you |
| ------- | ----------------- |
| `d4Mesh({ side })` (`@/code/tool/mesh`) | The flat 24-direction D4 coin, the canonical free-spin substrate. Returns a `Mesh` (uniform `neighbour` / `opposite`). The toy you stream on by default. |
| `b4Mesh({ side })` (`@/code/tool/mesh`) | The B4 root-lattice variant of the coin. |
| `buildDodecagrid({ maxCells })` (`@/code/substrate/coxeter/cell-scale`) | The {3,4,3,4} honeycomb as a `ScaleGraph`. `buildDodecagridFast` and `buildDodecagridLazy` are the scaling variants for big patches. |

### Flat and lattice

| builder | what it gives you |
| ------- | ----------------- |
| `cubicMesh({ side })` (`@/code/tool/mesh`) | The 6-direction cubic lattice `Mesh`. The Euclidean control. |
| `squareMesh({ side })` (`@/code/tool/mesh`) | The 4-direction square lattice `Mesh`. The 2D toy. |
| `buildEuclideanLattice({ symbol, maxCells })` (`@/code/substrate/coxeter/cell-direct`) | A flat-tessellation `CellGraph` (e.g. `[4,3,4]`), same shape as `buildCellGraph`. The flat baseline for comparisons. |
| `lattice({ dimension, extent, signature })` (`@/code/substrate/lattice`) | An integer-grid `Substrate` with a chosen metric signature (`lorentzian` or `riemannian`). Time is axis 0. |

### Horospheres and sprinklings

| builder | what it gives you |
| ------- | ----------------- |
| `buildHorosphere({ symbol, maxCells, level })` (`@/code/substrate/coxeter/cell-direct`) | A `HorospherePatch`, the flat horosphere slice through a hyperbolic honeycomb. |
| `buildHorosphereBand({ symbol, maxBand, half })` (`@/code/substrate/coxeter/cell-direct`) | A thickened horosphere band, for layer and renormalization studies. |
| `sprinkleMinkowski({ dimension, count, rng })` (`@/code/substrate/sprinkle-minkowski`) | A causal-set `Poset` from a Poisson sprinkle in a Minkowski diamond. The Lorentz-invariant continuum control. |

### The catalog

| builder | what it gives you |
| ------- | ----------------- |
| `TESSELLATIONS` (`@/code/substrate/tessellation-catalog`) | The full list of named regular tessellations with their Schlafli symbols, dimension, class, and a `buildable` flag. Look up a symbol here before you build it. |

## Use it

Build a hyperbolic {5,3,4} mesh and read its shell sizes.

```ts
import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'

const { shells, adjacency } = buildCoxeterMatrixMesh([5, 3, 4], 3000)
// shells[k] = number of cells at graph distance k from the seed
```

Build the D4 coin and walk a direction.

```ts
import { d4Mesh } from '@/code/tool/mesh'

const mesh = d4Mesh({ side: 9 })
const next = mesh.neighbour(0, 3) // leave cell 0 through direction 3
const back = mesh.opposite(3) // the reverse direction, for clean streaming
```

Build a {3,4,3,4} cell graph with directional faces (the addressing substrate).

```ts
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'

const g = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells: 5000 })
// g.neighbors, g.coords (Poincare), g.faceNeighbor[cell][faceIndex]
```

Worked examples in `test/experiment/`: `data-structure/capacity.ts` (`buildCoxeterMatrixMesh`), `gravity/gravity-3434.ts` (`buildCellGraph`), `relativity/light-cone-3434.ts` (`d4Mesh`).

## See also

- `note/library/api/architecture.md` for how substrates feed the rule and flow layers.
- `code/tool/graph.ts` for `makeGraph`, the `Graph` type, `toCsr`, and BFS / distance helpers over any adjacency.
- The `Mesh` interface in `code/tool/mesh.ts`. Every substrate exposes the same `neighbour` / `opposite` shape, so a consumer never cares which builder produced it.
