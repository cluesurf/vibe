# Findings 2, Computation and Information

What the geometry can compute, and how it stores and moves information, all native to the mesh. Companion to
`findings.md`. Every claim is built and measured. Cite `\cite{pollard2026vibetest}`, with Margenstern for hyperbolic
cellular automata and Potter for associative computing.

## Turing universality on {3,4,3,4}, a four-leg proof

The knit (the law, collide then stream) can compute anything computable, shown four independent ways that together
close the proof. First, the geometry supplies a Fibonacci tree giving `O(log N)` addressing and junctions of degree
24, far more than the three independent tracks Margenstern's railway model needs for switches and crossings, so
signals can be routed and gated anywhere. Second, the model's own signed-majority rule on the ternary tone IS the
NAND gate (a `+1` bias with two `-1` fills), and NAND is functionally complete, so it builds every Boolean gate and
in particular Rule 110, which is Cook-universal, matched against a reference. Third, a Minsky register machine runs
directly, registers are ternary CHARGE held in addressed subtrees, increment is the arrow creating a `+1/-1` pair,
decrement is annihilation, the total tone stays conserved, and real programs (addition, multiplication like 3x4=12
and 6x6=36, monus) compute exactly. Fourth, a glider on the cubic cusp reproduces Conway's Game of Life, itself
universal. Why it matters, nothing the theory needs is beyond its law, computation is not bolted on, it is what the
knit already does.

## Reversibility is no obstacle, Toffoli and the billiard ball

The knit is REVERSIBLE (a bijection on the nine line-states, forward then inverse returns the start bit-for-bit), and
reversibility costs nothing computationally. The Toffoli gate (controlled-controlled-NOT) is itself a bijection, and
Toffoli with one fixed ancilla input computes NAND, so a reversible rule reaches functional completeness. The
Margolus billiard-ball model runs on the cusp, signals as ballistic balls, collisions as gates, exactly reversible.
This consolidates onto `{3,4,3,4}` (the committed knit rule, degree 24 supplies the railway tracks, routing and gates
and memory all present), with the `{5,3,4}` dodecagrid kept as a comparative cross-geometry case. Why it matters,
a microscopically reversible universe (the kind quantum mechanics demands) can still be a universal computer, the
apparent tension dissolves.

## Conservation and faithfulness under computation

A 64-by-64 lattice gas evolved under the knit conserves charge AND momentum exactly, runs forward then inverse to
recover the initial state bit-for-bit, and its coarse-grained density stays smooth. Register-machine runs conserve
charge to the last trit. Why it matters, the substrate computes without ever leaking or minting the conserved
quantities, the arithmetic is exact, not approximate.

## Navigation, a finite light cone and near-perfect routing

Information moves at most one dock per beat, a finite light cone built in before any physics. The number of docks
within `n` steps grows exponentially, yet the path between any two is still only about `n` long, so the space is
huge but shallow. Greedy routing (always step nearer the target) delivers near-perfectly at low stretch (1.004 on
`{3,4,3,4}` to two million docks). Bulk diameter grows as `O(log N)` across 4000 to 64000 docks (under 2x growth),
where a Euclidean cube would grow as the cube root, so a vast system coordinates in a few hops. Direction-intention
search, a walker biased toward a goal, solves in about `K` steps where an aimless walker fails. Hierarchical
problem-solving coordinates in `O(log N)`. Movement off the growing edge is one-way (the bath drains it). Why it
matters, the geometry is not just navigable, it is the most efficient possible medium for reaching and coordinating,
which is what makes both computation and (later) thought fast.

## Data structures, the geometry IS a database

Every classical data structure is native to the bulk with NO stored pointers, each built and measured. Addresses are
`O(log n)`, neighbors are implicit in the D4 coordinate. The catalog, a B-tree (`O(log N)` descent), a trie, a Merkle
proof (`O(log n)`), a list as a path and a stack as a ray, a hash table (`O(1)` probe), a distributed hash table
(`O(log N)` hops with `O(1)` state), a skip-list (log diameter), a horoball R-tree, a Busemann mipmap (level-of-detail
by radial depth), a radial heap (peek-min `O(1)`), LSM levels, a Bloom filter, union-find, an output-sensitive
inverted index, a low-distortion tree embedding (which flat space cannot give), sorting as address order, and
breadth-first search as the growth ring. The honest caveats, a range scan visits exponentially many docks, and dense
arrays belong on the flat horosphere, not the sparse bulk interior. The structural universality holds across all 42
buildable tessellations. Why it matters, the addressing tree is simultaneously a search index, a sorted order, and a
routing fabric, computer science comes for free with the geometry, no software layer added.

## Associative memory, recall from a fragment

Content-addressable memory in the Potter sense (recall a whole pattern from a piece of it) is native, and the
hyperbolic bulk gives it astronomically more room than flat space. Capacity grows EXPONENTIALLY with radius where
flat space grows polynomially (a capacity ratio of 1.3-plus versus 1.0-1.1), search cost stays constant in
parallel, and spreading activation runs in `O(log N)` where flat space needs `N^(1/3)`. The honest negative, the
BARE reversible knit cleans a 20-percent-corrupted cue only to about 15 percent (near chance), a dissipative Hopfield
layer is needed to clean it to 85-plus percent, so error-correcting recall requires a lossy step on top of the
reversible base. Why it matters, the bulk recalls an entire memory from a hint with exponential capacity, the
substrate for thought and the tree of knowledge, with the honest boundary that cleaning noise needs dissipation.

## The information picture in one line

The mesh is a universal computer and a content-addressable database at once, exact and reversible at the base,
navigable with no stored map, with exponential memory room, where the only thing the bare reversible law cannot do
alone is forget, which is exactly the operation a separate dissipative layer (and the bath) supplies.

## Where to look (code and experiments)

- Turing universality, the four legs: `computation/turing-3434`. Reversible universality:
  `computation/reversible-universality-3434` (canonical, on the committed knit rule) and
  `computation/reversible-universality` (the `{5,3,4}` comparative case), plus the Margolus billiard-ball check.
- Register machines and end-to-end conservation: `computation/means-computation`, `computation/substrate-computer`,
  `computation/discrete-rule-endtoend`, `computation/hierarchical-solving`.
- The knit itself, the collision table and the lattice-gas engine: `code/rule/collision.ts`,
  `code/rule/lattice-gas.ts`.
- Data structures (all native, no pointers): `data-structure/*` (b-tree, trie, hash-table, dht-routing, radial-heap,
  skip-list, horoball-rtree, merkle-proof, union-find, inverted-index, tree-embedding, and the rest).
- Associative memory and its capacity: `associative/*` (capacity-scaling, capacity-vs-curvature, parallel-cost,
  spreading-activation), and the honest recall limit in `associative/hopfield-emergent-recall`.
