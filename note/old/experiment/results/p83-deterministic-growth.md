# P83: Deterministic Eternal Growth, Not Static Placement

**Status: solved. The mesh grows one cell at a time, forever, append-only, with the geometry emerging.**

## The question

P48 and P51 build the base by a deterministic automaton, but as a static orbit, generated all at
once for a fixed number of rings and read off. The model's claim is stronger: the universe grows
one vibe at a time, forever, at its frontier, and the geometry emerges from the growth.

## Result

A GrowingMesh adds cells one at a time using the pentagrid {5,4} splitting rule (each cell
deterministically spawns 3 or 2 children by its type), breadth-first, append-only, no randomness,
no rebuild. Four checks:

- **Resumable.** Growing in many small steps gives exactly the same mesh as one big step. Nothing
  is recomputed, so growth can continue forever.
- **Append-only.** Once a cell is added, its links never change. The interior is frozen as the
  past, the activity all at the leading edge that is the present.
- **Faithful.** The grown mesh matches the static tiling ring for ring.
- **Geometry emerges.** The ball-growth ratio converges to 2.6186, the pentagrid's golden-ratio
  law (3 + sqrt 5)/2 = 2.6180. The curvature is not put in. It comes out of the growth. Degree
  stays bounded (max 5), as a finite-cell crystal requires.

## Reading

The mesh now grows the way the model says the universe does: one cell at a time, at the frontier,
by a fixed deterministic rule, with no randomness and no rebuilding. The past is frozen, the
present is the growing edge, and the hyperbolic geometry emerges from the growth rather than being
assumed. This is the eternal-growth version of the base that P48 and P51 built only as a static
orbit.

## See also

`p48-modular-base.md`, `p51-full-ladder.md`, `p41-margenstern.md`, `p1-foundations.md` (the arrow).
