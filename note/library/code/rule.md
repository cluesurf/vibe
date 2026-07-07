# code/rule

The base-dynamics layer, the law the whole model obeys. It sits between the tone and the dynamics in the pipeline (`substrate -> tone -> rule -> dynamics -> coarse -> model`). A **beat** moves the world forward by collide then stream, and every beat can be run exactly backward. The engine is generic in the mesh degree, so the degree-4 square toy and the degree-24 D4 coin run through the same code. It is exactly reversible and exactly charge-conserving by construction, and both facts are checkable predicates (in `code/check/invariant.ts`), not claims. The engine is `lattice-gas.ts`, the collision you choose is in `collision.ts`, and the rest of the folder holds alternative schedules, wall and gauge collisions, symmetry operations, and the substrate-rewrite abstraction.

## Modules

| file | key exports | what it is |
| ---- | ----------- | ---------- |
| `lattice-gas.ts` | `stream`, `streamInverse`, `collide`, `beat`, `inverseBeat`, `run`, `beatInto`, `streamSourceTable` | the reversible collide-then-stream engine, generic in mesh degree |
| `collision.ts` | `Collision`, `pairCollision`, `PAIR_FORWARD`, `PAIR_INVERSE`, `passThrough`, `momentumRotate2D`, `bindAndMove`, `leakyConfine`, `headOnRotate`, `stickyReflect` | the shipped local in-place collisions, the committed 9-state pair table plus variants |
| `rule.ts` | `Rule`, `RuleStepInput`, `RuleStepOutput`, `LocalMap`, `runRule` | the generic rule interface over a `Substrate` and `Configuration` |
| `synchronous.ts` | `synchronousRule` | a global synchronous rule from a local map |
| `asynchronous.ts` | `asynchronousRule` | one-element-at-a-time updates, sequential or random order |
| `reversible.ts` | `reversibleEvenOdd` | the even/odd sublattice reversible scheme |
| `rewrite.ts` | `rewriteRule` | a substrate-rewriting rule, one match applied per beat |
| `channel.ts` | `channelCollision`, `slotReversal` | dispatch a wall collision on wall cells, a bulk collision elsewhere |
| `gauge.ts` | `gaugeRule` | a Monte Carlo gauge-field update with Metropolis on the Wilson action |
| `symmetry.ts` | `chargeConjugate`, `timeReverse`, `parityReflect`, `chargeParityTime` | the discrete C, P, T, and CPT operations on a `Will` |
| `attention.ts` | `attentionBeat`, `activeCells`, `cellToken`, `isOneHotRouting`, `vacuumIsFixed` | a beat that collides only active cells, plus routing diagnostics |
| `perception-permutation.ts` | `perceptionPermutation`, `perceptionMatchingSweepCsr`, `perceptionMatchingSweep3d`, `perceptionBlockBeat`, `perceptionEdgeColoringSweep` | the asynchronous pairwise-matching perception rule on graphs, grids, and rings |
| `viscous-collision.ts` | `viscousRotate`, `saturatedViscousRotate`, `controlledViscousRotate`, `buildViscousQuads` | momentum-matched viscous collisions for hydrodynamic behaviour |

## The engine (`lattice-gas.ts`)

Drive this. A beat is two bijections, so the whole evolution is a bijection, which is why charge is conserved and the rule reverses exactly.

- `stream(will): Will` moves each slot to the neighbour it points at, an involution per direction. `streamInverse(will): Will` is the same shift the other way.
- `collide(will, collision): void` applies the collision in place at every cell at once, reading only that cell's own slots.
- `beat(will, collision): Will` is collide then stream. `inverseBeat(will, collision): Will` is un-stream then collide (the order flips).
- `run(will, collision, beats): Will` iterates `beat` for `beats` steps using a double-buffered precomputed gather table. To go backward, iterate `inverseBeat`.
- `streamSourceTable(mesh): Int32Array` precomputes the gather indices, `beatInto({ src, dst, table, collision })` runs one allocation-free beat into `dst`.

## The collisions (`collision.ts`)

A `Collision` is `(slots: Int8Array, base: number, degree: number) => void`, a local in-place map on one cell's slots.

- `pairCollision({ opposite, forward? })` is the committed rule. It runs the 9-state ternary `PAIR_FORWARD` table on every opposite-direction pair, the create-flip-annihilate cycle, keyed by `pairKey(left, right)`. The table is a bijection but not an involution, so reversal uses `PAIR_INVERSE` (pass `forward: false`).
- `passThrough` does nothing. `momentumRotate2D` rotates zero-momentum head-on pairs on the degree-4 mesh (an involution).
- `bindAndMove({ opposite, forward? })` moves lone charges ballistically and binds opposite pairs. `leakyConfine({ opposite })` confines charged pairs but lets neutral pairs stream. `headOnRotate({ opposite })` rotates head-on pairs between disjoint lines conserving momentum. `stickyReflect({ opposite })` reflects charges in crowded cells.

## Alternative rules and operations

- `rule.ts` is the generic interface for rules that act on a `Substrate` plus a `Configuration`, `runRule({ rule, substrate, configuration, beats, rng })` drives it. `synchronousRule`, `asynchronousRule`, `reversibleEvenOdd`, and `rewriteRule` construct rules of each scheme from a `LocalMap` or match/apply pair.
- `symmetry.ts` gives the discrete symmetry operations on a `Will`, `chargeConjugate` negates every tone, `timeReverse` reverses velocities, `parityReflect` reflects one axis with direction remapping, and `chargeParityTime` composes all three.
- `viscous-collision.ts` and `perception-permutation.ts` are the hydrodynamic and perception-matching variants, both reversible pairwise sweeps.

## Used by

- **Narrated in full by** [rule-engine.md](../rule-engine.md), the deep dive on why the beat is exactly reversible and charge-conserving. Consumer guide, [api/tone-and-rule.md](../api/tone-and-rule.md).
- **Depends on** `code/tone` (the `Will` state) and `code/tool/mesh` (the mesh and its `opposite` map). Checked by `code/check/invariant.ts` (`conservesCharge`, `isReversible`).
- **Example arenas** `test/experiment/foundations/directional-rule.ts` (reversibility and charge conservation across degrees), `test/experiment/fluids/` (the viscous and lattice-gas collisions), and `test/experiment/gauge/` (the gauge rule).
