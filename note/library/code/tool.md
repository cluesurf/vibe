# tool (the substrate-agnostic primitives)

The building blocks every experiment is made of. The seeded random source, graphs, posets, bitsets, meshes, gauge fields, and the small helpers that move between them. Everything here is deterministic. The whole library is a pure function of `(seed, parameters)`, so nothing calls `Math.random`. This file is the full module index. For the friendly using-guide, read `../api/tool.md`.

Import from `@/code/tool/<file>`.

## Modules

| module | key exports | what it gives you |
|:--- |:--- |:--- |
| `rng` | `makeRng`, `deriveSeed`, `poissonSample`, `sampleEmpiricalFrequencies`, `Rng` | the seeded PRNG (`next`, `nextInt`, `nextGaussian`), child seeds for scans, sampling helpers |
| `graph` | `makeGraph`, `Graph`, `degree`, `meanDegree`, `toCsr`, `edgesFromCsr`, `csrDistances`, `csrBallNodes`, `largestComponent`, `greedyEdgeColoring`, `withScrambledEmbedding` | graphs, the compact CSR sparse form, BFS and distance helpers, edge colouring |
| `poset` | `makePosetFromRelation`, `makePosetFromFuture`, `Poset`, `precedes`, `relationCount`, `intervalSize`, `pastMatrix`, `subPoset` | causal sets, built from a precedence test |
| `bitset` | `makeBitMatrix`, `setBit`, `getBit`, `clearBit`, `popcountRow`, `popcountAnd`, `forEachSetBit`, `bitMatrixTransitiveClosure` | dense bit storage for reachability matrices |
| `substrate` | `Substrate`, `AdjacencyView`, `adjacencyOf`, `undirectedAdjacency`, `substrateMeanDegree`, `embeddingOf` | the `Poset | Graph` union and a shared adjacency view, measure on either form |
| `mesh` | `Mesh`, `squareMesh`, `cubicMesh`, `d4Mesh`, `b4Mesh`, `betheMesh`, `shellDistances`, `meshOpposites`, `meshNeighbors` | the uniform coin-of-directions interface and its builders |
| `embedding` | `Embedding`, `coordOf`, `ElementId`, `WaveProfile`, `ManifoldSpec` | optional coordinate provenance for a sprinkled substrate, output-only, never read by a rule |
| `integer` | `modulo` | the sign-correct remainder for torus wrap and field reduction |
| `balanced-ternary` | `toBalancedTernary`, `fromBalancedTernary`, `balancedTernaryCap`, `isBalancedTernaryField` | balanced-ternary encoding (the tone alphabet's number system) |
| `gauge-field` | `makeGaugeField`, `linkPhase`, `edgeKey`, `GaugeField`, `GaugeGroup`, `PlaquetteSet` | a gauge field on directed edges, link phases for the covariant operators |
| `grid-gauge` | `makeGridGrid`, `plaquetteFlux`, `gridWilsonLoop`, `vortexGaugeField`, `gridGaugeTransform` | a gauge field on a clean square grid, plaquette flux and vortices |
| `graph-store` | `saveGraph`, `loadGraph`, `saveState`, `loadState`, `StoredGraph` | serialize a graph or state to disk (deterministic replay) |
| `orbit` | `orbitClosure` | the orbit closure of a set under a group action |
| `polytope` | `fourPolytopeFacets`, `fourPolytopeFacetCount`, `orthogonalToThree` | 4-polytope facet geometry |
| `perturbation-audit` | `auditResult` | audit a result's sensitivity to a small perturbation |

## Entry points

### `makeRng({ seed })`
The seeded PRNG. `next()` is a float in `[0, 1)`, `nextInt({ max })` an integer in `[0, max)`, `nextGaussian()` a standard normal. Same seed always gives the same stream. `deriveSeed({ base, index })` mints child seeds so a whole scan rebuilds from one number. This is the only source of randomness in the library.

### `makeGraph({ size, directed, neighbors })`
Build a graph from neighbor lists. `toCsr(g.neighbors)` gives the compact `{ offsets, adj }` sparse form, and `csrDistances`, `csrBallNodes`, `largestComponent` do BFS and connectivity on it. The `Graph` and `Poset` types unite as `Substrate`, so a measure can run on either.

### `makePosetFromRelation({ size, precedes })`
Build a causal set from a precedence test over time-sorted elements. `precedes({ a, b })` returns whether `a` is in the past of `b`. `relationCount(p)` counts the ordered pairs, `pastMatrix(p)` gives the reachability matrix.

### `d4Mesh(...)`, `cubicMesh(...)`, `squareMesh(...)`
The mesh builders. A `Mesh` is a coin of directions per cell, the uniform interface the lattice-gas operators and the isotropy measures run on. `shellDistances` gives BFS radii from a root, `meshOpposites` the opposite-direction map.

## Used by

Every code dir and every experiment. `makeRng` and `deriveSeed` are the determinism backbone (the methodology forbids `Math.random`). `makeGraph` and `toCsr` back the substrate and measure layers. `poset` and `bitset` back the causal-set sampler (`../causal-set-sampler.md`). `mesh` backs the lattice gas (`../rule-engine.md`, `../spinor-coin.md`). `gauge-field` and `grid-gauge` back the gauge operators (`../lattice-gauge-engine.md`).

## See also

- `../api/tool.md`, the friendly using-guide with snippets.
- `../api/substrate.md`, the mesh builders and the `Substrate` union in full.
- `measure.md`, `operator.md`, what reads these primitives.
