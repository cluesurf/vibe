# control (the null baselines)

The negative controls. A vibe result only counts if it beats a baseline that could have produced the same number by accident. These generators destroy the thing under test (spatial structure, hyperbolic geometry, reversibility) while preserving what should not matter (the tone multiset, total charge, the degree sequence). Run the measure on the real object and on its control. A clean gap means the measure reads structure, not an artefact. The audit found that the difference between a deep (L3) result and a circular one is almost always the control, so these are first-class library code, not per-experiment scratch.

Import from `@/code/control/<file>`.

## Modules

| module | key exports | what it gives you |
|:--- |:--- |:--- |
| `null` | `randomNull`, `preservesCharge`, `shuffledToneField` | the reshuffle nulls that keep the tone histogram and total charge but destroy spatial pattern |
| `scramble` | `scrambleNeighbors` | a degree-preserving graph rewiring that keeps every node's degree but destroys the hyperbolic geometry |
| `lossy-collision` | `erasingCollision` | a non-invertible collision that erases information, the case a reversibility test MUST fail |

## Entry points

### `randomNull(will, seed): Will`
Clone a `Will` and Fisher-Yates shuffle its slot data. Same tone multiset, same total charge, spatial structure gone. A measure that scores high on the real will and near zero here is reading structure. `preservesCharge(will, seed): boolean` asserts the shuffle kept the charge (it always should, it only permutes slots).

### `shuffledToneField({ tone, rng }): Int8Array`
The field version of the same idea. Permutes the cells of a tone field (`Int8Array`) with an injected `rng`, preserving the multiset and total charge, destroying all spatial coherence. The control a coarse-graining coherence claim must beat to prove it measures structure and not plain averaging.

### `scrambleNeighbors({ neighbors, seed?, passes? }): number[][]`
Degree-preserving double-edge swap on a neighbor-list graph. Picks two edges `a-b` and `c-d`, rewires to `a-d` and `c-b` when no self-loop or duplicate results. Every node keeps its exact degree, only connectivity is randomized. Deterministic given `seed` (default 1), `passes` sets swap count (default 4 times the edge count). This is the "run the same rule on a scrambled non-hyperbolic graph" baseline. A geometric constant that holds on `{3,4,3,4}` and vanishes here is an L3 emergent result, not an L2 kinematic accident.

### `erasingCollision: Collision`
A `Collision` (from `@/code/rule/collision`) that zeroes slot 0 of every cell, destroying information. A genuine reversible collision never erases, so this is the case that must FAIL any recoverability or purification test. Pass it where an experiment normally passes the real collision to prove the passing result means something.

## Used by

Almost every L3 experiment in `test/experiment/` pairs its measure with a control from here. `scrambleNeighbors` is the geometry control for relativity, holography, gravity, and data-structure arenas. `randomNull` and `shuffledToneField` are the structure controls for the selves and coarse-graining work (see `../coarse-graining-and-selves.md`). `erasingCollision` is the negative control for the reversibility and purification tests (see `../rule-engine.md` and `check.md`). The methodology that requires them is `../../experimental-methodology.md`.

## See also

- `check.md`, the invariant checks the real dynamics must pass (the positive side of the same coin).
- `../coarse-graining-and-selves.md`, the deep dive whose null result these controls establish.
