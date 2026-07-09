# code/substrate

The geometry layer, the base of the pipeline (`substrate -> tone -> rule -> dynamics -> coarse -> model`). Everything physical lives on a graph this folder produces. A substrate is a discrete geometry, a mesh of cells with neighbour lists and coordinates, and this folder builds every kind the project needs: any regular hyperbolic or Euclidean tessellation from its Schlafli symbol (the Coxeter engine), flat cubic lattices and tori, negatively-curved trees, causal-set sprinklings of curved spacetime, and Cayley graphs of the modular group. The output shape is uniform, a graph with `neighbors[i]` and often `coords[i]`, so the rule and the operators run on any of them through the same code.

## Modules by theme

### Regular tessellations (the Coxeter engine)

| file | key exports | one-line |
|:--- |:--- |:--- |
| `coxeter.ts` | `coxeterMeshGraph`, `coxeterTessellation` | the unified reflection-group engine, facet-adjacency for any Schlafli symbol |
| `tessellation-catalog.ts` | `TESSELLATIONS`, `Tessellation`, `TessellationClass` | the enumerated ground-truth catalog of regular hyperbolic tessellations up to 5D |
| `hyperbolic-honeycomb.ts` | `hyperbolicDodecagrid` | the {5,3,4} dodecahedral honeycomb by face-plane reflection |
| `hyperbolic-graph.ts` | `hyperbolicGraph`, `hyperbolicHalton` | random and low-discrepancy sprinklings on the hyperbolic disc |
| `tiling-pq.ts` | `tilingPQ` | a {p,q} tiling grown by Margenstern splitting with Fibonacci addressing |
| `coxeter/` (subdir) | `engine.ts`, `schlafli.ts`, `cell-direct.ts`, `tessellation.ts`, `word.ts`, `addressing-3434.ts` | the exact Coxeter math, Gram signature, orbit BFS, and coordinate-free addressing |
| `margenstern/` (subdir) | `pentagrid.ts`, `fibonacci-tree.ts`, `zeckendorf.ts`, `splitting-tree.ts` | Margenstern hyperbolic addressing, the exact {5,4} pentagrid |

### Flat lattices and grids

| file | key exports | one-line |
|:--- |:--- |:--- |
| `cubic-lattice.ts` | `cubicLattice`, `cubicBoxRows`, `cubicLatticeCenter`, `cubicLatticeDistance` | the d-dimensional cubic lattice, row-major, with neighbours and coordinates |
| `lattice.ts` | `lattice` | a regular integer lattice with Lorentzian (causal) or Riemannian signature |
| `lattice-ball.ts` | `latticeBall`, `latticeWordDistance` | a BFS ball of integer points reachable from generator vectors |
| `torus-grid.ts` | `torusGrid` | a periodic d-dimensional torus, no boundary |
| `d4-torus.ts` | `buildD4Torus` | the finite D4 torus, even-sum 4-vectors mod M with the 24 roots as steps |
| `causal-lattice.ts` | `causalLattice` | the 1+1 Minkowski diamond lattice as a poset |

### Trees and addressing

| file | key exports | one-line |
|:--- |:--- |:--- |
| `bethe-tree.ts` | `betheTree` | a regular q-ary tree, the cleanest negatively-curved discrete space |
| `radial-tree.ts` | `radialBfsTree`, `boundaryByRadius`, `surfaceDistances`, `innermostCell` | a BFS radial tree rooted at the innermost cell, with a boundary and LCA |
| `tree-addressing.ts` | `buildAddressedTree`, `routeByAddress`, `AddressedTree` | a spanning tree where a node's address routes messages by arithmetic |
| `growing-pentagrid.ts` | `GrowingPentagrid` | a stateful {5,4} pentagrid grown one cell at a time |

### Causal sets and sprinklings

| file | key exports | one-line |
|:--- |:--- |:--- |
| `sprinkle-minkowski.ts` | `sprinkleMinkowski` | a uniform-by-volume Poisson sprinkle of a flat causal diamond |
| `sprinkle-curved.ts` | `sprinkleCurved` | sprinkle into curved spacetimes (wave-burst, de Sitter, hyperbolic) |
| `sprinkle-desitter.ts` | `sprinkleDeSitter` | a 2D de Sitter proper-volume sprinkle with exponential expansion |
| `sprinkle-box.ts` | `sprinkleBox`, `SprinkledPoint` | a Poisson sprinkle into a rectangular 2D Minkowski box |
| `grow-csg.ts` | `growCsg` | classical sequential causal-set growth (Rideout-Sorkin) |
| `branching-order.ts` | `growBranchingOrder` | a 1+1 causal set grown by a local branching rule, no metric |

### Graphs, navigation, and helpers

| file | key exports | one-line |
|:--- |:--- |:--- |
| `geometric-mesh.ts` | `randomGeometricMesh`, `squareLatticeMesh`, `centerNode`, `Mesh` | 2D random-geometric and square-lattice meshes in the unit square |
| `proximity-graph.ts` | `proximityGraph`, `centerNearestOrigin` | connect a point cloud by nearest-neighbour proximity |
| `regular-graph.ts` | `buildRegularGraph` | a degree-regular graph by the configuration model |
| `modular-mesh.ts` | `modularMesh` | dense cells weakly coupled, for the coarse-graining tests |
| `graph-rewrite.ts` | `gridRefinementRewrite`, `degreeHistogram`, `bulkDegree`, `RewriteGraph` | deterministic content-free grid-refinement growth |
| `psl-cayley.ts` | `pslCayleyGraph`, `standardPslGenerators`, `projectiveMultiply` | the PSL(2,p) Cayley graph over a finite field |
| `modular-group.ts` | `modularGraph`, `rationalFromContinuedFraction` | the PSL(2,Z) modular group Cayley graph in the disc |
| `cellwalker.ts` | `cellWalker`, `wstep`, `rotate`, `flip`, `vertexRing` | a turtle-graphics walker for stepping and turning across a tiling |
| `tile-source.ts` | `TileSource`, `FaceStep` | the abstract walkable-tiling interface |
| `horosphere.ts` | `busemann`, `idealDirection`, `horoFrame`, `horocyclicProject`, `extractBand` | the horosphere flat-layer extraction, Busemann height and cusp slice |
| `triangulated-surface.ts` | `triangulatedSurface` | a triangulated surface mesh, optional periodic wrap |
| `mesh-unfolding.ts` | `unfoldMeshShells`, `shellRatios`, `CANONICAL_SHELLS`, `unfoldingIsDeterministic` | exact {3,4,3,4} shell counts by reflective addressing |
| `perfect-tensor-tree.ts` | `perfectTensorRecoverable`, `perfectTensorMinimalKillSet`, `perfectTensorContiguousThreshold` | the HaPPY holographic code recovery on a tensor tree |
| `ring.ts` | `ringNeighbors`, `ringEdges` | the 1D periodic ring |

## Main entry points

- `coxeterMeshGraph({ schlafli, depth?, maxChambers? }): Graph` is the unified engine, it builds the full facet-adjacency graph for any Schlafli symbol `{p,q}` or `{p,q,r}`. `coxeterTessellation({ schlafli, maxVertices? })` is the named front-end with automatic parameters. The deeper `coxeter/tessellation.ts` classifies a symbol (geometry, cell, vertex figure, buildability) before building.
- `cubicLattice(side, dim): CubicLattice` builds a flat cubic lattice with `neighbors` and `coords`, `cubicBoxRows({ side, dim })` repacks it for the spectral-dimension and Green's-function measures, and `cubicLatticeCenter` finds the centre site.
- `betheTree(q, depth): Uint32Array[]` and `radialBfsTree({ neighbors, radii })` build the tree substrates. `buildAddressedTree(g)` plus `routeByAddress(tree, s, t)` give address-based routing on any graph.
- `sprinkleMinkowski({ dimension, count, rng })` and `sprinkleCurved({ manifold, count, rng })` return a `Poset` of sprinkled spacetime points, the input to the causal-set action and MCMC.
- `busemann({ coords, ideal })` and `extractBand({ busemann, level?, half? })` extract the emergent flat horosphere layer from a hyperbolic mesh, the sheet the flat dynamics runs on.
- `unfoldMeshShells({ throughShell, maxCells })` returns the exact integer shell counts of the {3,4,3,4} bulk (`CANONICAL_SHELLS` is `[1, 24, 456, 8376, 153192]`), and `shellRatios` gives the growth ratios that converge to the hyperbolic warp.

## Used by

- **Narrated in full by** [tessellation-engine.md](../tessellation-engine.md) (the Coxeter engine) and [causal-set-sampler.md](../causal-set-sampler.md) (the sprinklings and posets). Consumer guide, [api/substrate.md](../api/substrate.md).
- **Feeds** `code/rule` (the mesh the beat runs on), `code/dynamics` (the graph the walks, waves, and gauge fields live on), and `code/algebra/linear` (the operators built over these graphs).
- **Example arenas** `test/experiment/substrate-survey/` (the generic-tessellation-engine validation and the whole-catalog survey), `test/experiment/holography/` (trees and the horosphere), `test/experiment/cosmology/` and `gravity/` (the sprinklings), and `test/experiment/addressing/` (tree and Coxeter addressing).
