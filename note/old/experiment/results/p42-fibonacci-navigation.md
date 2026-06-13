# P42: Addressed Propagation (Fibonacci-Tree Navigation)

**Status: demonstrated. Exact, local, efficient routing on the heptagrid by address arithmetic.**

## The question

P37 showed a disturbance propagates with a causal light-cone. Margenstern's tool adds the
next thing: give every cell of the heptagrid {7,3} a tree address (the Fibonacci-tree
coordinate) and route a signal between any two cells by address arithmetic alone, no
global map. Does it deliver exactly and efficiently?

## What we did

Lay a breadth-first spanning tree on the heptagrid (children ordered by angle, so the
addressing is deterministic). Each cell's address is the path of child-ordinals from the
root. Routing from s to t: go up to the common ancestor (follow parents), then down by
the target's address suffix (follow ordered children). This uses only each cell's local
parent and children, never a global shortest-path computation.

## Result

- heptagrid {7,3}: 2202 cells, spanning-tree depth 11.
- ring sizes grow by about **1.42 per ring in the bulk** (exponential, Fibonacci-like,
  before the finite-patch boundary).
- **exact delivery rate: 100 percent** (every signal reaches its named target).
- mean hops per route: **10.0** (logarithmic in the cell count, efficient).
- mean stretch versus the true shortest path: **1.35** (routes are near-optimal).

## Reading

Every signal reaches its target exactly, using no global map, only each cell's address
and its local parent and children. The route length grows like the tree depth,
logarithmic in the number of cells. This turns P37 from "a disturbance propagates" into
"a signal is routed to a named destination," the exact navigation Margenstern built on
the heptagrid, now on the model substrate.

Combined with P40 and P41, the regular hyperbolic tilings are Lorentz-safe AND exactly
addressable, which solves the both-worlds problem of P3 better than the random graph did:
the random graph had to give up exact addressing for approximate greedy routing, while
the tiling keeps both.

## Honest reading

This uses a breadth-first spanning tree, the essence of Margenstern's scheme (a tree
coordinate plus common-ancestor routing). His full Fibonacci coordinate system is more
refined and exploits the geometry for even lower stretch. The point established here is
exactness, locality, and efficiency, which all hold.

## See also

`p37-one-rule-propagation.md` (propagation), `p40-non-random-substrates.md`,
`p41-margenstern-tilings.md`, and `p42-fibonacci-navigation` (the experiment).
