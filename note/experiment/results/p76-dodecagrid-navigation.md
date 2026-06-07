# P76: 3D Addressed Navigation on the Dodecagrid

**Status: solved. Greedy address routing delivers across the 3D crystal at minimal stretch.**

## The question

P42 routed a signal between any two cells of the 2D heptagrid by address. The roadmap asks for
the 3D analogue on the dodecagrid {5,3,4}, the real spatial crystal.

## Result

On a dodecagrid of about 1550 cells, each cell's address is its position in the hyperbolic
embedding. Routing is greedy: step to the neighbor whose address is closest, in hyperbolic
distance, to the target. Over 300 random source-target pairs:

- delivery success rate: 100 percent
- mean stretch (path length over shortest path): 1.00

## Reading

The exact addressed routing of P42 carries over from the 2D heptagrid to the real 3D crystal. A
signal can be sent from any cell to any other using local address comparisons alone, with no
global map, and the paths found are the shortest possible. The hyperbolic geometry is what makes
greedy routing work, the same curvature that keeps the substrate Lorentz-safe.

## See also

`p42-fibonacci-navigation.md`, `p45-dodecagrid.md`, `p49-crystal-hidden-hierarchical.md`.
