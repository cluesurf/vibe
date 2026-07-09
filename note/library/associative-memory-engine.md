# The Associative Memory Engine

A content-addressable memory on any cell graph. Each cell holds a
ternary WORD. You broadcast a query and every cell compares it to its
own word in parallel, and the matching cells answer. This is Potter's
SITDAC search realized on a tessellation, the computing layer of the
model, and the hyperbolic geometry makes the search logarithmic-latency
with exponential capacity.

> Memory here is not a lookup table at an address. It is
> content-addressable, you ask by WHAT a thing is, not WHERE it is, and
> every cell answers at once. On a hyperbolic substrate a query wave
> reaches the whole bulk in O(log N) beats and the storable words within
> a radius grow exponentially, so the geometry is the speedup.

Source, `code/operator/associative-memory.ts` and
`code/measure/associative-recall.ts`. The GPU realization is
`code/compute/run-associative.ts`. Validated by
`test/experiment/data-structure/associative-memory.ts`.

## What it does

- Stores a ternary WORD (slots in {0,1,2}) at each cell of a graph.
- SEARCHES by content, broadcast a comparand (a query word) with an
  optional don't-care mask, and every occupied cell reports how well its
  word matches.
- Returns the RESPONDERS, the cells that match exactly, or the single
  best match, or the responder nearest a seed.
- Broadcasts a query as a WAVE on the mesh, one ring per beat, and
  reports the search latency and the coverage time.
- Measures recall accuracy, capacity versus radius, and the
  false-positive rate.

## The components

| file                                                     | role                                                                                                                                                                    |
|:--- |:--- |
| `code/operator/associative-memory.ts`                    | the SITDAC engine, `makeAssociativeMemory`, `ternaryWord`, `storeWord`, `readWord`, `matchScore`, `search`, `searchExact`, `searchBest`, `pickNearest`, `broadcastWave` |
| `code/measure/associative-recall.ts`                     | the measures, `exactRecallRate`, `nearestRecallRate`, `falsePositiveRate`, `coverageRadius`, `radiusCapacity`                                                           |
| `code/measure/associative-memory.ts`                     | the vector-symbolic (hyperdimensional) variant, `vsaRecallAccuracy`, bind and bundle and unbind and clean up                                                            |
| `code/compute/run-associative.ts`, `associative.wgsl.ts` | the WebGPU parallel match, one dispatch, self-checked bit-for-bit against the CPU ground truth                                                                          |
| `code/operator/hopfield.ts`                              | the attractor (Hopfield) flavor, for contrast, a relaxation rather than a parallel match                                                                                |

## How to use it

Build a memory on a substrate, store a distinct word per cell, then
recall by content.

```ts
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import {
  makeAssociativeMemory,
  ternaryWord,
  storeWord,
  searchExact,
  searchBest,
} from '@/code/operator/associative-memory'

const cells = buildCellGraph({ symbol: [3, 4, 3, 4], maxCells: 2000 })
const memory = makeAssociativeMemory({
  neighbors: cells.neighbors,
  wordBits: 21,
})

// store one distinct word per cell (the decorrelating hash keeps them far apart in content)
for (let c = 0; c < memory.cellCount; c++)
  storeWord(memory, c, ternaryWord(c, 21))

// recall by content, no address needed
const exact = searchExact({
  memory,
  comparand: ternaryWord(42, 21),
}).at(0) // -> cell 42
const best = searchBest({ memory, comparand: someNoisyWord }) // -> { cell, score } nearest match
```

Score the memory, and read the geometric search latency.

```ts
import {
  exactRecallRate,
  coverageRadius,
  radiusCapacity,
} from '@/code/measure/associative-recall'

exactRecallRate(memory) // 1.0 when every word recalls itself uniquely
coverageRadius({ neighbors: cells.neighbors, seed: 0 }) // the beats to reach the whole bulk, O(log N) hyperbolic
radiusCapacity({ neighbors: cells.neighbors, seed: 0 }) // cumulative storable words within each radius
```

## How it works

The engine is one idea, COMPARE IN PARALLEL, then let the geometry
deliver the query.

1. **A distinct word per cell** (`ternaryWord`). A bijective
   multiplicative hash (Knuth) decorrelates neighbouring indices, then
   the result is read out in base 3. The words are distinct and far
   apart in content, so an exact query returns exactly one cell.
   `wordBits` of at least 21 holds the full 32-bit hash with no
   collision.
2. **The per-cell note** (`matchScore`). A cell compares the comparand
   to its own word and counts the equal compared slots. A don't-care
   mask skips slots. This is one vibe reading the query, and an empty
   cell scores minus one.
3. **The responder set** (`search`, `searchExact`, `searchBest`).
   `search` returns every occupied cell scoring at least `minScore`.
   `searchExact` requires every compared slot to match. `searchBest`
   returns the single highest-scoring cell, the nearest content. Every
   cell is independent, so the search is embarrassingly parallel.
4. **The GPU does it in one dispatch.** The CPU scan is the ground
   truth. The WebGPU runner computes the identical responder set in a
   single dispatch, the maximally parallel realization, and self-checks
   against the CPU bit-for-bit.
5. **The geometric broadcast** (`broadcastWave`). A query wave spreads
   from a seed one ring per beat, the bucket brigade. A cell's arrival
   beat is its graph distance from the seed. The first beat a responder
   is reached is the SEARCH LATENCY, and the beat the whole built region
   is reached is the COVERAGE time. On a hyperbolic graph the coverage
   time is O(log N), because the bulk diameter is logarithmic. On a flat
   lattice it is O(N^(1/d)).
6. **Capacity grows with radius** (`radiusCapacity`). The words storable
   within a given search latency are the cells within that radius. On a
   hyperbolic substrate the cell count per radius is exponential, so the
   memory holds exponentially more within a fixed latency.

The vector-symbolic variant (`vsaRecallAccuracy`) is a second flavor.
Key-value bindings are bound by an elementwise product and bundled by
superposition into one vector of dimension `dim`, then each value is
recalled by unbinding and cleaning up to the nearest stored value. Its
capacity scales with `dim`, which in the bulk is the cell count in a
radius, exponential in the radius again.

## Capabilities and limits

What it handles,

- Any cell graph, so the same memory runs on any tessellation (or the
  flat control).
- Exact and nearest (noisy) recall, with a don't-care mask for partial
  queries.
- A CPU ground truth and a GPU parallel realization that agree exactly.
- Deterministic, the words are a fixed hash and the noisy-recall
  corruption uses a seeded rng, never `Math.random`.

The distinctions,

- This is the base-layer SITDAC flavor, a parallel MATCH, compatible
  with the reversible rule. It is not an attractor relaxation. The
  Hopfield flavor (`operator/hopfield`) is the attractor variant, a
  settling dynamics, kept separate.
- The geometric advantage is in the BROADCAST latency and the capacity
  per radius, both consequences of the hyperbolic growth, not of the
  match itself.

## Why it matters

Content-addressable memory is the computing layer of the model, asking
by what a thing is rather than where it is, with every cell answering at
once. On a hyperbolic substrate the broadcast reaches the whole bulk in
logarithmic time and the capacity within that time is exponential, so
the geometry is the speedup. This is the flagship of the
data-structures-on-hyperbolic-space work, where classic structures
(trees, routing, indexes) get logarithmic depth from the same growth.

## See also

- `api/computing-and-data-structures.md`, the brief consumer guide and
  the full data-structure catalog this is the flagship of.
- `tessellation-engine.md`, the substrate this memory is laid on.
- `evolution-and-propagation.md`, the wave evolution the broadcast is a
  discrete version of.
- `test/experiment/data-structure/associative-memory.ts` (the capacity
  result) and `code/compute/run-associative.ts` (the GPU match).
