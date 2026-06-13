# The Rule Engine

The base dynamics. A reversible, charge-conserving local rule (a directional lattice gas) that runs on any mesh
the tessellation engine produces. This is the layer everything physical sits on top of. Every beat moves the
world forward by collide then stream, and every beat can be run exactly backward.

> This is the law the whole program obeys, delivered as one small engine. The rule is generic in the mesh
> degree, so the 2D four-direction toy and the {3,4,3,4} twenty-four-direction substrate run through the same
> code. It is exactly reversible and exactly charge-conserving by construction, and both facts are checkable
> predicates, not claims. See `api/tone-and-rule.md` for the brief consumer guide above it.

Source, `code/rule/lattice-gas.ts`, `code/rule/collision.ts`, `code/tone/will.ts`. Invariants in
`code/check/invariant.ts`. Validated by `test/experiment/foundations/directional-rule.ts`.

---

## What it does

Given a `Will` (the full directional state of the world) and a `Collision` (the local interaction), the engine,

- STREAMS, moves every direction-occupation across its direction to the neighbour cell, an involution per
  direction,
- COLLIDES, applies a local in-place map at every cell at once, on its opposite-direction pairs,
- runs a BEAT, which is collide then stream, and an INVERSE beat, which is un-stream then collide,
- guarantees EXACT reversibility, forward then inverse recovers the start bit for bit,
- guarantees EXACT charge conservation, the total tone is unchanged every step.

The state is the `Will`. One ternary tone per cell per direction, laid out flat as `data[cell * degree +
direction]` in an `Int8Array`. Nothing is stored anywhere else. There is no hidden state.

---

## The components

| file | role |
| ---- | ---- |
| `code/tone/will.ts` | the `Will` state, `Tone` (`-1 | 0 | 1`), `makeWill`, `fillWillPattern`, `charge`, `cellTone` |
| `code/rule/lattice-gas.ts` | the engine, `stream`, `streamInverse`, `collide`, `beat`, `inverseBeat`, `run` |
| `code/rule/collision.ts` | the collisions, `pairCollision`, the 9-state `PAIR_FORWARD` / `PAIR_INVERSE` table, `pairKey`, `passThrough`, `momentumRotate2D` |
| `code/check/invariant.ts` | the checkable invariants, `conservesCharge`, `isReversible` |

Start with `lattice-gas.ts`. It is the engine a caller drives. The collision is the one thing you choose.

---

## How to use it

### Build a mesh, fill a will, run the rule

```ts
import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern, charge } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import { run } from '@/code/rule/lattice-gas'

const mesh = d4Mesh({ side: 6 })    // the 24-direction D4 coin, the committed substrate

const will = makeWill(mesh)         // every slot 0, the vacuum
fillWillPattern(will)               // a deterministic ternary fill, never random

// the opposite-direction index for each direction, what makes streaming well defined
const opposite = Array.from({ length: mesh.degree }, (_, d) => mesh.opposite(d))

const collision = pairCollision({ opposite })
const after = run(will, collision, 100)   // 100 beats forward

charge(after) === charge(will)      // true, the total tone is conserved
```

### Check the invariants

```ts
import { conservesCharge, isReversible } from '@/code/check/invariant'
import { pairCollision, PAIR_FORWARD, PAIR_INVERSE } from '@/code/rule/collision'

const forward = pairCollision({ opposite })
const inverse = pairCollision({ opposite, forward: false })

conservesCharge(will, forward, 200)            // true
isReversible(will, forward, 200, inverse)      // true, run forward then back recovers the start
```

The 9-state table is a bijection that is not an involution, so reversal uses the PAIRED inverse. For an
involution collision (`passThrough`, `momentumRotate2D`) the inverse is the same map, so the fourth argument is
omitted.

---

## How it works

A beat is two steps, COLLIDE then STREAM. Each step is a bijection on the integer state, so the whole beat is a
bijection, which is why charge is conserved and the rule reverses exactly.

1. **Stream** (`stream`). Each slot moves to the neighbour it points at. The new value of slot `direction` at a
   cell is the value the back-neighbour was sending forward along that same line,
   `out(cell, direction) = in(neighbour(cell, opposite(direction)), direction)`. Read along one direction this
   is a shift of the whole line. It is an INVOLUTION per direction, because the neighbour of the neighbour
   (across `direction` then `opposite(direction)`) is the cell itself. `streamInverse` is the same shift the
   other way, reading from `neighbour(cell, direction)`.

2. **Collide** (`collide`). Apply the local collision at every cell at once, in place. The collision touches
   only that cell's own slots, at offset `cell * degree`, so all cells collide independently. No neighbour is
   read, so the order of cells does not matter.

3. **The pair table** (`PAIR_FORWARD`). The committed collision runs a 9-state ternary table on each
   opposite-direction pair. A pair is the two slots whose directions are opposite, the two tones moving head-on
   through the cell. The nine states are keyed by `pairKey(left, right) = (left + 1) * 3 + (right + 1)`. The
   table is the create-flip-annihilate cycle. Like signs are inert. A charge hops past a peace. Peace creates a
   balanced pair `(0,0) -> (1,-1)`, the pair flips `(1,-1) -> (-1,1)`, then annihilates `(-1,1) -> (0,0)`. Each
   line keeps its pair sum, so the cell tone and the total charge are conserved.

4. **A permutation, hence reversible** (`PAIR_INVERSE`). The table is a BIJECTION on the nine states, a
   permutation. `invertPairTable` reads the forward table backward to build the exact inverse. The create cycle
   is a 3-cycle, so the table is not its own inverse, it is a true bijection with a paired inverse.

5. **The beat** (`beat`). Collide then stream. **The inverse beat** (`inverseBeat`). Un-stream then collide.
   Note the order flips, the inverse of `stream . collide` is `collideInverse . streamInverse`. So
   `inverseBeat` un-streams first, then applies the (paired-inverse) collision.

6. **Run** (`run`). Iterate `beat` for `beats` steps. To go backward, iterate `inverseBeat` for `beats` steps.

The core idea. Stream is a permutation of slots (a per-direction involution). Collide is a permutation of each
cell's local states (the table is a bijection). A composition of permutations is a permutation. Therefore the
whole evolution is a bijection on the finite integer state space. A bijection is exactly reversible (run forward
then inverse and every `Int8` recovers its start value, checked by `isReversible`), and because each per-cell
state map keeps the pair sum, the total tone is invariant (checked by `conservesCharge`).

---

## Capabilities and limits

What it handles,

- ANY mesh degree, the same engine runs the degree-4 square toy and the degree-24 D4 coin.
- ANY per-line reversible table, `pairCollision` is the committed one, but the engine also ships
  `momentumRotate2D` (involution), `headOnRotate`, `bindAndMove`, and `stickyReflect`.
- EXACT integer dynamics, no floating point, so reversibility is bit-exact with zero error.

The structural facts,

- The collision sees ONLY one cell's slots. All interaction is local, the only nonlocal step is the
  fixed-pattern stream across mesh edges.
- The state is the WHOLE world. No counters, no clocks, no per-cell memory beyond the directional tones.
- A non-involution collision needs its paired inverse to reverse, which the engine wires through `inverseBeat`.

The base 5. Mesh, ternary tone, this conserving rule, reflection-and-growth, and the arrow of beats. Nothing
else is base. Cohesion bias, maintenance, will, and repair are not part of the rule and never injected.

---

## Why it matters

This rule is the law the whole model runs on. The flat layer, the fields, gravity, and the selves are all
patterns that this one rule produces from a fill of ternary tones. Making it reversible and charge-conserving by
construction (not by tuning) is what lets the project claim emergent physics honestly. If a phenomenon does not
fall out of these five base pieces, the honest answer is the negative, not a new term added to the rule. Making
it generic in the mesh degree is what lets the same dynamics run on the {3,4,3,4} substrate the frontier agenda
needs, through the identical code that runs the 2D reference toy.

## See also

- `api/tone-and-rule.md`, the brief consumer guide to the tone and the rule (this doc is the deeper dive under
  it).
- `tessellation-engine.md`, the substrate engine that builds the mesh this rule runs on.
- `test/experiment/foundations/directional-rule.ts`, the validation of the directional rule (reversibility and
  charge conservation across degrees).
- `code/rule/collision.ts`, every shipped collision, the committed pair table plus the binding and momentum
  variants.
- `code/check/invariant.ts`, `conservesCharge` and `isReversible`, the predicates that test any rule.
