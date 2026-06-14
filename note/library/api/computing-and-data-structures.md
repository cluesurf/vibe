# Computing and Data Structures on Hyperbolic Space

The library treats the hyperbolic bulk as a computer. Two properties of the geometry do the work. The bulk DIAMETER is logarithmic in the cell count, so anything that descends or routes through it is O(log N). And the bulk GROWS exponentially per radius, so the capacity reachable within a given latency is exponential. Classic data structures laid on the mesh inherit these for free, and content-addressable memory becomes logarithmic-latency search. This guide is the consumer entry point, the deep dive on the flagship engine is `associative-memory-engine.md`.

## The core idea

| geometric property | what it gives a data structure |
| ------------------ | ------------------------------ |
| logarithmic diameter | log-depth descent, routing, and proofs, the bulk is shallow everywhere |
| exponential growth per radius | exponential capacity within a fixed search radius |
| unique cell addresses (Coxeter words) | hashing, tries, total orders, zero-storage neighbours |
| the radial (Busemann) structure | heaps, LSM levels, mipmaps, R-trees by depth |
| a flat 2D boundary and cusp | dense arrays and Bloom filters where flatness is wanted |

## Associative (content-addressable) memory

Ask by WHAT a thing is, not WHERE it is. Every cell holds a ternary word and compares a broadcast query in parallel. Full detail in `associative-memory-engine.md`.

| piece | what it gives you |
| ----- | ----------------- |
| `makeAssociativeMemory`, `ternaryWord`, `storeWord`, `readWord` (`@/code/operator/associative-memory`) | a memory on any cell graph, one distinct word per cell |
| `search`, `searchExact`, `searchBest`, `pickNearest` (`@/code/operator/associative-memory`) | the parallel content search, the responders, the best match |
| `broadcastWave` (`@/code/operator/associative-memory`) | the query wave, the search latency and the coverage time |
| `exactRecallRate`, `nearestRecallRate`, `falsePositiveRate`, `coverageRadius`, `radiusCapacity` (`@/code/measure/associative-recall`) | recall accuracy, capacity per radius, latency |
| `vsaRecallAccuracy` (`@/code/measure/associative-memory`) | the vector-symbolic variant, bind and bundle and unbind |

```ts
import { makeAssociativeMemory, ternaryWord, storeWord, searchExact } from '@/code/operator/associative-memory'

const memory = makeAssociativeMemory({ neighbors, wordBits: 21 })
for (let c = 0; c < memory.cellCount; c++) storeWord(memory, c, ternaryWord(c, 21))
const responders = searchExact({ memory, comparand: ternaryWord(42, 21) }) // -> [42]
```

## The data structures (one experiment each)

Each is a classic structure realized on the hyperbolic mesh, showing it inherits the geometry's complexity. All in `test/experiment/data-structure/`.

### Addressing and indexing (unique log-length addresses)

| structure | what it shows | experiment |
| --------- | ------------- | ---------- |
| cell addressing | unique cell addresses of logarithmic length | `data-structure/addressing` |
| prefix trie | addresses form a trie, each extends its parent by one symbol | `data-structure/trie-prefix` |
| hash table | keys hash to exact cell addresses, O(1) probes | `data-structure/hash-table` |
| sorting by address | the canonical address is a total order, sorting is reading cells in order | `data-structure/sorting-by-address` |
| implicit neighbours | neighbours computed from the coordinate, zero stored pointers | `data-structure/implicit-neighbors` |
| inverted index | terms hash to boundary cells, output-sensitive retrieval | `data-structure/inverted-index` |

### Logarithmic-depth trees and routing (the shallow bulk)

| structure | what it shows | experiment |
| --------- | ------------- | ---------- |
| B-tree descent | a point query is a logarithmic-depth descent | `data-structure/btree-descent` |
| DHT routing | key lookup routes up to the common prefix and down in O(log N) | `data-structure/dht-routing` |
| greedy routing | greedy routing delivers on the hyperbolic metric, degrades on flat | `data-structure/greedy-routing` |
| skip-list shortcut | the bulk diameter is logarithmic, every cell is a short path away | `data-structure/skip-list-shortcut` |
| union-find | logarithmic find depth from the cell tree | `data-structure/union-find` |
| Merkle proof | a logarithmic-length inclusion proof on the bulk tree | `data-structure/merkle-proof` |
| tree embedding | a tree embeds in the hyperbolic disk at low distortion | `data-structure/tree-embedding` |
| horoball R-tree | nested horoballs are an R-tree hierarchy, a query descends logarithmically | `data-structure/horoball-rtree` |

### Exponential capacity per radius (the growing bulk)

| structure | what it shows | experiment |
| --------- | ------------- | ---------- |
| capacity | the bulk holds exponentially more cells per radius | `data-structure/capacity` |
| associative memory | content-memory capacity scales with dimension, exponential in the radius | `data-structure/associative-memory` |
| range scan | a range scan visits exponentially many cells | `data-structure/range-scan` |
| boundary sketch (Bloom) | a Bloom filter on the exponential boundary has a low false-positive rate | `data-structure/boundary-sketch` |
| radial mipmap | the radial Busemann levels form a multiresolution pyramid | `data-structure/radial-mipmap` |

### Radial and shell structure (the Busemann depth)

| structure | what it shows | experiment |
| --------- | ------------- | ---------- |
| radial heap | the radial depth is a heap order, peek-min is the root in O(1) | `data-structure/radial-heap` |
| LSM levels | the radial shells are geometric LSM levels with a stable fan-out | `data-structure/lsm-levels` |
| path structures | a list is a cell path and a stack is a radial ray, O(1) per step | `data-structure/path-structures` |
| BFS traversal | the BFS frontier IS the growth shell, traversal is free | `data-structure/bfs-traversal` |
| cusp array | a dense array belongs on the flat horosphere, not the bulk interior | `data-structure/cusp-array` |

### Honest limits

| structure | what it shows | experiment |
| --------- | ------------- | ---------- |
| interior empty | the bulk is boundary-dominated, almost all cells lie near the boundary | `data-structure/interior-empty` |

## Across all tessellations

The data-structure profile is itself a cross-tessellation measurement. `tessellationDataProfile` (`@/code/measure/tessellation-profile`) returns the profile (diameter, growth, addressing length, capacity) for any Schläfli symbol, the same one-module-for-every-tessellation pattern as the substrate battery.

```ts
import { tessellationDataProfile } from '@/code/measure/tessellation-profile'
const profile = tessellationDataProfile({ symbol: [3, 4, 3, 4], maxCells: 2000 })
```

The `data-structure/universal-profile` experiment runs this across the 2D-to-5D catalog. See `note/cross-tessellation-experiments.md` for the pattern.

## Supporting code

| module | what it gives you |
| ------ | ----------------- |
| `@/code/measure/sketch` | `cellHash`, `hashTableProbeStats`, `bloomFalsePositiveRate`, the hashing and sketch math |
| `@/code/measure/radial` | `graphBusemann`, `busemannLevels`, the radial depth structure |
| `@/code/measure/navigation` | greedy-routing and addressing navigation measures |
| `@/code/substrate/hyperbolic-honeycomb` | the honeycomb builder several data-structure experiments use |

## See also

- `associative-memory-engine.md`, the deep dive on the flagship engine.
- `api/substrate.md`, building the mesh these structures live on.
- `note/cross-tessellation-experiments.md`, running a profile against every tessellation.
- `tessellation-engine.md`, the addressing and Coxeter-word machinery the unique addresses come from.
