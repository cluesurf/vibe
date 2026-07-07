# Data-structure arena

How the substrate **stores and moves information**. This arena treats the `{3,4,3,4}` hyperbolic lattice as a computer's data plane. Wires, buses, queues, stacks, memory cells, indexes, and routing tables all appear as **emergent geometric structures**, never as stored bookkeeping.

The through-line is one geometric fact. The bulk grows **exponentially** with radius, so cell addresses are **logarithmic** in length and every classic data structure inherits log-scale cost for free. The 28 experiments walk from that base fact out to whole databases, then check the caveats where the geometry hurts, then show the profile holds on every buildable tessellation.

## Exponential capacity and its price

The base resource. Negative curvature packs exponentially many cells into each radial shell, which is what makes addresses short. The same growth also creates the interior sparsity and the range-scan cost, the two candid caveats.

- **E-DST-0006** - the 4D bulk holds exponentially more cells per radius than the flat 24-cell honeycomb, the exponential-capacity signature.
- **E-DST-0001** - cells carry unique addresses of logarithmic length, far shorter than the flat honeycomb needs.
- **E-DST-0014** - the bulk is boundary-dominated, almost every cell sits in the outermost shell, so the interior is nearly empty.
- **E-DST-0008** - a dense array belongs on the flat horosphere slice, the sparse bulk interior would waste an array.
- **E-DST-0021** - a contiguous range scan visits exponentially many cells, the structure the bulk is worst at (the candid negative).

## Structure without storage

Adjacency, order, and coordinates are **computed**, not stored. The address is a coordinate, neighbours come from arithmetic, and sorting is just reading in address order.

- **E-DST-0013** - a cell's 24 neighbours are its D4 coordinate plus the 24 roots, computed by arithmetic, zero stored adjacency.
- **E-DST-0025** - cell addresses form a trie, every address extends its parent by exactly one digit.
- **E-DST-0023** - the canonical address is a total order, so sorting is reading the cells in address order.
- **E-DST-0007** - the exact B-tree order (cell coordination) of every tessellation, computed straight from its Schlafli symbol.

## Database indexes on the radial shells

The database headline. B-trees, hash tables, heaps, R-trees, LSM levels, inverted indexes, and Bloom filters all instantiate on the shells with logarithmic or constant cost and no stored pointers.

- **E-DST-0005** - a B-tree point query is a logarithmic-depth descent, its child pointers are the physical neighbours.
- **E-DST-0011** - keys hash to exact cell addresses, lookup is O(1) probes at a reasonable load and degrades only near full.
- **E-DST-0016** - the radial shells are geometric LSM levels with a stable fan-out and a logarithmic level count.
- **E-DST-0019** - the radial depth is a heap order, peek-min is the root in O(1).
- **E-DST-0012** - nested horoballs form an R-tree, a query descends logarithmically many bounding volumes.
- **E-DST-0015** - terms hash to boundary cells, retrieval is output-sensitive rather than corpus-sized.
- **E-DST-0004** - a Bloom filter on the exponential boundary has a false-positive rate that falls with radius.
- **E-DST-0020** - the radial Busemann levels form a multiresolution mipmap, fine levels hold geometrically more cells.
- **E-DST-0002** - associative-memory capacity scales with dimension, exponential in the bulk radius, the content-addressable bridge.

## Paths, stacks, and traversal

Linear structures as physical walks. A list is a cell path, a stack is a radial ray, and the BFS frontier is a shell that needs no queue.

- **E-DST-0018** - a list is a cell path and a stack is a radial ray, O(1) per step, the depth is the stack height.
- **E-DST-0003** - the BFS frontier IS the growth shell, so traversal is free with no explicit queue.
- **E-DST-0026** - union-find on the cell tree has logarithmic find depth because bulk paths are short.

## Routing, shortcuts, and embeddings

Moving a message across the substrate. Greedy geometric routing, DHT lookup, and the logarithmic diameter give short delivery paths, and the disk embeds trees the flat plane cannot.

- **E-DST-0010** - greedy routing delivers on the hyperbolic metric and collapses on the scrambled Euclidean control.
- **E-DST-0009** - DHT key lookup routes up to the common prefix and back down in O(log N) hops with O(1) state.
- **E-DST-0022** - the bulk diameter is logarithmic, so every cell is a short skip-list-style hop away.
- **E-DST-0024** - a tree embeds in the hyperbolic disk at low distortion, the Euclidean plane cannot.
- **E-DST-0017** - a Merkle inclusion proof on the bulk tree is a logarithmic-length path to the root.

## Universality across tessellations

The profile is not special to `{3,4,3,4}`. One module runs the structural measures on any hyperbolic Coxeter tessellation, and the two headline claims hold for the whole family.

- **E-DST-0027** - greedy routing and the Busemann mipmap run on every tessellation via the Coxeter embedding.
- **E-DST-0028** - one module profiles every 2D-to-5D tessellation, all have exponential capacity and logarithmic tree depth.

## What it establishes

The `{3,4,3,4}` bulk is a **general-purpose data plane**. Databases, indexes, queues, routers, and proofs all live on the lattice as geometry, paying **logarithmic or constant** cost with **no stored adjacency or pointers**. The wins come from **exponential capacity plus logarithmic addresses**, and they hold on every buildable tessellation. The caveats are surfaced plainly. The interior is sparse, dense arrays want the flat cusp, and contiguous range scans are expensive.
