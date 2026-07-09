# code/geometry

The hyperbolic-geometry helper layer. These are the small, pure math primitives the substrate and holography work call: hyperbolic distance in the Poincare ball, Mobius isometries, sphere-packing and kissing-number checks, and tree-into-hyperbolic embeddings with a distortion measure. It sits beside the substrate layer of the pipeline (`substrate -> tone -> rule -> dynamics -> coarse -> model`), a toolbox the mesh builders and geometric measures draw from rather than a stage the state flows through. Nothing here holds tone state, every function takes coordinates or a tree and returns a number or new coordinates.

## Modules

| file | key exports | what it is |
|:--- |:--- |:--- |
| `distance.ts` | `poincareDistance`, `poincareCosh`, `poincareDistanceIndexed`, `polarCoshFromParts`, `poincareCoshFromParts` | hyperbolic distance in the Poincare ball |
| `mobius.ts` | `ballIsometry`, `ballBoundaryConformalFactor` | Mobius ball isometries (hyperbolic translations) and the boundary conformal factor |
| `packing.ts` | `deterministicSpiral`, `relaxRiesz`, `isKissingConfiguration`, `maxPairwiseCosine`, `coordinationAtMinAngle`, `canExtendKissing`, `unit` | sphere point sets, kissing-number checks, deterministic Riesz relaxation |
| `tree-embedding.ts` | `completeTree`, `embedTree`, `treeDistance`, `embeddingDistortion`, `hyperbolicDistance` | build a tree, embed it in the disk, measure distortion |

## Distance (`distance.ts`)

- `poincareDistance(left, right): number` is the hyperbolic distance between two Poincare-ball points.
- `poincareCosh(left, right): number` is `cosh` of that distance (skips the final `acosh`, cheaper when you only need to compare).
- `poincareDistanceIndexed(coords, dimension, a, b): number` takes a flat coordinate buffer and two indices, for large point sets.
- `poincareCoshFromParts(differenceSquared, oneMinusLeft, oneMinusRight)` and `polarCoshFromParts(coshLeft, sinhLeft, coshRight, sinhRight, angleBetween)` build the same `cosh` from precomputed pieces, for hot loops.

## Mobius (`mobius.ts`)

- `ballIsometry(a): (x) => Vec` returns the hyperbolic translation that sends the origin to point `a`, the basic ball isometry.
- `ballBoundaryConformalFactor(a, x): number` is the conformal stretch of that boundary map at a point `x` on the unit sphere.

## Packing (`packing.ts`)

Deterministic sphere-packing helpers, no RNG anywhere.

- `deterministicSpiral(count, dimension): number[][]` lays `count` points on the unit sphere by a golden-ratio spiral.
- `relaxRiesz(start, { steps, powerStart?, powerEnd?, stepSize? }): number[][]` relaxes a point set by gradient descent on a repulsive Riesz potential with a power-continuation schedule.
- `isKissingConfiguration(directions, minAngleDegrees = 60): boolean` checks that every pair of directions is at least the minimum angle apart.
- `maxPairwiseCosine(directions): number` is the largest cosine between any two directions (the smallest pairwise angle).
- `coordinationAtMinAngle(directions): Record<number, number>` histograms neighbour counts at the minimum angle.
- `canExtendKissing(directions, candidates, minAngleDegrees = 60): boolean` asks whether any candidate can be added while keeping the kissing separation.
- `unit(vector): number[]` normalizes a vector.

## Tree embedding (`tree-embedding.ts`)

- `completeTree({ branching, depth }): { size, parent, children }` builds a complete b-ary tree.
- `treeDistance(parent, depth, u, v): number` is the hop distance via the lowest common ancestor.
- `embedTree({ parent, children, edge, hyperbolic }): { coords, depth }` places the tree in the Poincare disk (or the Euclidean plane) with a fixed edge length.
- `embeddingDistortion({ coords, depth, parent, hyperbolic }): number` is the worst-case ratio of embedded distance to tree distance, normalized to 1 at the best scale. This is the number that shows a tree embeds into hyperbolic space with far less distortion than into flat space.
- `hyperbolicDistance(z, w): number` is the disk distance for the complex-point convention this file uses.

## Used by

- **Narrated in** [tessellation-engine.md](../tessellation-engine.md) and [spinor-coin.md](../spinor-coin.md) (kissing / coordination on the D4 directions), plus the consumer guide [api/substrate.md](../api/substrate.md).
- **Consumed by** `code/substrate/*` (Poincare coordinates, tree addressing, hyperbolic graphs) and `code/measure/*` (geometric measures like curvature and distortion).
- **Example arenas** `test/experiment/geometry/` and `test/experiment/holography/` (tree embeddings and hyperbolic distance drive the bulk-boundary and distortion tests), `test/experiment/spin/` (kissing configuration on the coin directions).
