# Addressing arena

How cells are **addressed and located** in the hyperbolic honeycomb. This arena builds the addressing scheme. Every cell gets a unique tree address, neighbours come from the address by formula, and a walker navigates with only local information. It is the basis of **self-localization and routing** on the substrate.

The core result is that a cell's **name encodes its position**. Addresses are short (logarithmic), the tree has no cousin edges, and greedy descent in the coordinates reaches any target. From there the arena reads the address structure as meaning for a self. Depth is renormalization scale, a boundary loop anchors an object, and the one substrate splits into a global-access bulk and a local cusp.

## The {3,4,3,4} addressing scheme

The base scheme. Each cell carries a unique tree address of logarithmic length, the numeration is a clean bijection, and exact integer word-arithmetic reconstructs neighbours and cell counts.

- **[`E-NVG-0001`](../../../test/experiment/addressing/addressing-3434.ts)** - the cells carry unique O(log n) tree addresses with no cousin edges and exact neighbour reconstruction.
- **[`E-NVG-0002`](../../../test/experiment/addressing/addressing-3434-scale.ts)** - the addressing invariants survive growth, clean at two build sizes.
- **[`E-NVG-0007`](../../../test/experiment/addressing/word-engine.ts)** - ShortLex normal forms give exact finite group orders and exact cell facet counts, integer-only.

## Neighbours from the address

Structure computed on demand. Both branches confirm the graph is recoverable from names alone, with no stored adjacency, so addresses route signals directly.

- **[`E-NVG-0005`](../../../test/experiment/addressing/lazy-neighbors.ts)** - on-demand neighbor computation reproduces the exact dodecagrid graph with no stored adjacency.
- **[`E-NVG-0004`](../../../test/experiment/addressing/fibonacci-navigation.ts)** - address arithmetic routes every signal exactly and efficiently on the heptagrid.

## Greedy geometric routing

Navigation with local information only. Greedy descent in hyperbolic coordinates delivers at low stretch, and the scrambled-coordinate control stalls, isolating the coordinates as the cause.

- **[`E-NVG-0003`](../../../test/experiment/addressing/dodecagrid-navigation.ts)** - greedy hyperbolic-address routing delivers at low stretch on the dodecagrid.
- **[`E-NVG-0010`](../../../test/experiment/addressing/greedy-walkway.ts)** - local greedy descent routes with 100 percent success and unit stretch, the exact walkway, while a scrambled map stalls.
- **[`E-NVG-0006`](../../../test/experiment/addressing/study.ts)** - the addressing-versus-Lorentz fork, whether one substrate can hold reach, isotropy, and navigability at once.

## Depth, anchors, and the bulk-cusp split

What addresses buy for a self. The route depth is a coarse-graining scale, a boundary loop pins a definite region, recall is a hierarchical descent, and the substrate carries two navigation regimes at once.

- **[`E-NVG-0008`](../../../test/experiment/addressing/routing-depth-is-scale.ts)** - the bulk depth a route reaches equals the logarithm of the boundary separation, the holographic depth-is-RG-scale law, against a linear flat-chain control.
- **[`E-NVG-0009`](../../../test/experiment/addressing/bulk-cusp-navigation-split.ts)** - the bulk diameter grows logarithmically (global access) while the cusp grows as N^(1/3) (locality), one substrate splitting into mind-fast and physics-local regimes.
- **[`E-NVG-0011`](../../../test/experiment/addressing/hierarchical-recall.ts)** - recalling a memory is a coarse-to-fine descent of the bulk hierarchy in log(N) steps, and scrambling the coarse patterns collapses recall to chance.
- **[`E-NVG-0012`](../../../test/experiment/addressing/loop-encloses-region.ts)** - a boundary loop encloses a definite bulk region, disjoint loops enclose disjoint regions, and a wider loop reaches deeper, an exact composable anchor for an object.

## What it establishes

A cell's **address encodes where it is**. Names are short, unique, and cousin-free, neighbours follow from the name by exact arithmetic, and greedy descent in the coordinates is a **near-perfect walkway** a self can follow with only local information. Read as structure for a mind, the addressing gives **depth as renormalization scale**, **loops as object anchors**, and **hierarchical coarse-to-fine recall**. The same substrate carries two regimes at once. A **logarithmic-access bulk** for global reach and a **local cusp** for physics-scale locality.
