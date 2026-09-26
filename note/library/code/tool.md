# tool (the substrate-agnostic primitives)

The building blocks every experiment is made of. The Weyl and Kronecker sequences, graphs, posets, bitsets, meshes, gauge fields, and the small helpers that move between them. Everything here is deterministic: no `Math.random`, no seed, no pseudo-random generator and no hash used as a draw (E-MTH-0015). The whole library is a pure function of its parameters and the stated starts. This file is the full module index. For the friendly using-guide, read `../api/tool.md`.

Import from `@/code/tool/<file>`.

## Modules

| module | key exports | what it gives you |
|:--- |:--- |:--- |
| `weyl` | `makeWeyl`, `Weyl`, `weyl`, `weylFill`, `weylCell`, `weylPermutation`, `weylUnitVector`, `weylOrthogonal`, `weylUnitary`, `weylStreamPrime`, `inverseNormal`, `poissonSample`, `sampleEmpiricalFrequencies`, `GOLDEN`, `SILVER` | the Kronecker stream (`next`, `nextInt`, `nextGaussian`), one prime per start, equidistributed in up to 64 dimensions per window and independent across starts, plus golden and silver fills and the helpers built on it |
| `weyl-point` | `weylPoint`, `weylRates` | random access into the stream: up to 64 jointly equidistributed choices per index (a fill and a sign per site, a product measure over a dock's slots) |
| `rng` | none in use | the retired seeded generator, kept only until it is deleted by hand; nothing imports it and E-MTH-0015 fails any file that does |
| `graph` | `makeGraph`, `Graph`, `degree`, `meanDegree`, `toCsr`, `edgesFromCsr`, `csrDistances`, `csrBallNodes`, `largestComponent`, `greedyEdgeColoring`, `withScrambledEmbedding` | graphs, the compact CSR sparse form, BFS and distance helpers, edge colouring |
| `poset` | `makePosetFromRelation`, `makePosetFromFuture`, `Poset`, `precedes`, `relationCount`, `intervalSize`, `pastMatrix`, `subPoset` | causal sets, built from a precedence test |
| `bitset` | `makeBitMatrix`, `setBit`, `getBit`, `clearBit`, `popcountRow`, `popcountAnd`, `popcountAndBetween`, `forEachSetBit`, `bitMatrixTransitiveClosure`, `bitMatrixRank`, `ternaryMatrixRank` | dense bit storage for reachability matrices, GF(2) rank, and rank over the field of three elements |
| `shuffle` | `shuffled` | a Fisher-Yates shuffle driven by a caller's stream (`weylPermutation` is the stream form) |
| `substrate` | `Substrate`, `AdjacencyView`, `adjacencyOf`, `undirectedAdjacency`, `substrateMeanDegree`, `embeddingOf` | the `Poset | Graph` union and a shared adjacency view, measure on either form |
| `mesh` | `Mesh`, `squareMesh`, `cubicMesh`, `d4Mesh`, `b4Mesh`, `betheMesh`, `shellDistances`, `meshOpposites`, `meshNeighbors` | the uniform coin-of-directions interface and its builders. `d4Mesh` on an EVEN side is two disconnected lattices (see its PARITY note) |
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

### `makeWeyl({ start })`
The Kronecker stream. `next()` is a value in `[0, 1)`, `nextInt({ max })` an integer in `[0, max)`, `nextGaussian()` the inverse normal of one value. Draw k is frac(m sqrt(q_j P)), slot j = k mod 64, step m = floor(k / 64) + 1, q_j the j-th prime and P the prime the start owns, in exact 32-bit fixed point, so it is bit-identical on every machine. A start picks which equidistributed sequence is read; it is not a seed. A sampler driven by it is a deterministic dynamics with a quasi-random schedule, not a Markov chain. There is no source of randomness in the library.

### `weylPoint({ start, index, slot })`
The stream's draw 64 index + slot, without reading the draws before it. Use it where several independent choices are made per site: two `weylCell` values of one key at two beats differ by a fixed shift, so a threshold on one decides the other (test/code/tool/weyl-point shows the empty cells), and two slots of one index do not.

### `makeGraph({ size, directed, neighbors })`
Build a graph from neighbor lists. `toCsr(g.neighbors)` gives the compact `{ offsets, adj }` sparse form, and `csrDistances`, `csrBallNodes`, `largestComponent` do BFS and connectivity on it. The `Graph` and `Poset` types unite as `Substrate`, so a measure can run on either.

### `makePosetFromRelation({ size, precedes })`
Build a causal set from a precedence test over time-sorted elements. `precedes({ a, b })` returns whether `a` is in the past of `b`. `relationCount(p)` counts the ordered pairs, `pastMatrix(p)` gives the reachability matrix.

### `d4Mesh(...)`, `cubicMesh(...)`, `squareMesh(...)`
The mesh builders. A `Mesh` is a coin of directions per cell, the uniform interface the lattice-gas operators and the isotropy measures run on. `shellDistances` gives BFS radii from a root, `meshOpposites` the opposite-direction map.

## Used by

Every code dir and every experiment. `weyl` and `weyl-point` are the determinism backbone (the methodology forbids `Math.random`, seeds, generators and hash draws). `makeGraph` and `toCsr` back the substrate and measure layers. `poset` and `bitset` back the causal-set sampler (`../causal-set-sampler.md`). `mesh` backs the lattice gas (`../rule-engine.md`, `../spinor-coin.md`). `gauge-field` and `grid-gauge` back the gauge operators (`../lattice-gauge-engine.md`).

## See also

- `../api/tool.md`, the friendly using-guide with snippets.
- `../api/substrate.md`, the mesh builders and the `Substrate` union in full.
- `measure.md`, `operator.md`, what reads these primitives.
