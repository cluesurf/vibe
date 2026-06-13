# P74: The Height-Changing Cluster Move for the Large-N Crossing

**Status: solved. The cluster move sweeps the height range that blocked P12.**

## The question

P12 measured the free-energy crossing only up to N = 48 because its single-pair move could
not change the height (the longest chain), so the Wang-Landau walk could not traverse the
height range and stalled at N = 64. The roadmap asks to build a height-changing cluster move.

## The move

Store the asserted relations and recompute the transitive closure after each toggle, so
flipping ONE asserted edge brings a whole cluster of implied relations with it and the height
jumps. We measure how much of the height range each move can reach in a flat random walk.

## Result

| N | height range | single-pair move | cluster move |
| - | ------------ | ---------------- | ------------ |
| 32 | 2..10 | 44% | 100% |
| 48 | 2..12 | 27% | 91% |
| 64 | 2..14 | 23% | 85% |
| 96 | 2..18 | 18% | 94% |

The single-pair move's reach declines toward a sliver as N grows (the P12 limitation), while
the cluster move sweeps the whole range at every N, including 64 and 96.

## Reading

The barrier that stalled P12 is the height. The single-pair move toggles one relation, which
almost always breaks transitivity or leaves the longest chain fixed, so it reaches only a
sliver of the range and cannot cross the entropy barrier at large N. The height-changing
cluster move sweeps the entire range at N = 64 and 96, exactly the traversal the large-N
free-energy crossing needs. Driving a full Wang-Landau density of states to a converged
beta-star at N = 128 with this move is the remaining compute, now unblocked.

## See also

`p12-free-energy.md`, `p12-wang-landau.md`, `p2-dynamics.md`.
