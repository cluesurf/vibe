# check (invariants and verification)

The positive controls. A rule that claims to conserve charge, conserve momentum, or run in reverse can be checked, not trusted. These are the reusable predicates that read the base invariants off a state or a run. Reversibility is a forward-then-backward roundtrip with an exact Hamming distance. Conservation is a before-and-after census. Everything here is integer and exact, so a passing check asserts equality, not a tolerance. Live in `code`, not in any one experiment, because every lattice-gas experiment reads the same laws.

Import from `@/code/check/<file>`.

## Modules

| module | key exports | what it gives you |
| --- | --- | --- |
| `invariant` | `totalMomentum`, `conservesMomentum`, `conservesCharge`, `isReversible` | the base conserved currents and the reversibility predicate of the committed rule |
| `reversibility` | `roundtrip` | the forward-then-backward Hamming-distance roundtrip on the directional lattice gas |
| `lattice-gas-laws` | `streamIsPermutation`, `toneCensus`, `censusEqual` | the Toffoli/Fredkin conservative-logic laws (no fan-out, conserved multiset) |
| `structure` | `occupiedSet`, `occupiedCells`, `componentCount`, `diameter`, `travelDistance`, `maxOccupancy`, `momentum` | localization and structure diagnostics on a will |

## Entry points

### `conservesCharge(will, ...): boolean` and `conservesMomentum(will, ...): boolean`
Run the will forward `beats` beats and confirm the total tone (the U(1) charge) or the total momentum vector is unchanged, exactly, integer. Momentum is the second conserved current beyond charge, the one a relativistic `z = 1` mode and hydrodynamics both require. `totalMomentum(will, ...): number[]` returns the raw vector, the sum over every occupied slot of its tone times its direction vector.

### `isReversible(will, ...): boolean`
Run forward `beats` beats, then backward `beats` beats, and confirm the start is recovered exactly with zero error. For an involution collision the inverse is the same map (the default). A bijective (non-involution) collision must be given its paired inverse, which the backward beat applies after un-streaming.

### `roundtrip({ will, ... }): { hamming, evolved }`
The measured version of the reversibility check. Returns the Hamming distance from the start after forward-then-backward (0 means exact recovery, positive means lost information) plus the forward-only evolved state for measuring the intermediate marginal. `inverseCollision` defaults to the forward collision, correct only for an involution. A non-involution collide MUST pass its paired inverse, or the roundtrip reports a false nonzero distance.

### `streamIsPermutation(mesh): boolean`
True when the stream's gather table is a permutation of the slots, Toffoli's no-fan-out law. Holds exactly on a periodic mesh, fails on a leaking boundary, which is the discriminator. `toneCensus(tone): { minus, zero, plus }` is the conserved ternary multiset, and `censusEqual(a, b)` compares two censuses.

### Structure diagnostics
`occupiedCells(will)` counts charge-bearing cells, `componentCount(will)` counts connected clusters (one is a bound composite, two or more means the structures parted), `diameter(will)` is the spread, `travelDistance({ will, ... })` is how far charge reached from a start cell (ballistic growth versus pinning), `maxOccupancy(will, ...)` is the phase-independent peak occupancy over a run, and `momentum(will, roots)` is the vector momentum over any coin's root list.

## Used by

The lattice-gas and rule experiments (`test/experiment/foundations/`, `test/experiment/relativity/`) assert `conservesCharge`, `conservesMomentum`, and `isReversible` as their gate. `roundtrip` and `erasingCollision` (from `control.md`) are the paired positive and negative of every recoverability and purification test. The `structure` diagnostics feed the composite, scatter, and travel measurements across the matter and selves arenas. The rule these check is the deep dive in `../rule-engine.md`.

## See also

- `control.md`, the negative controls (`erasingCollision`) these checks pair with.
- `../rule-engine.md`, the reversible charge-conserving lattice gas whose laws these verify.
