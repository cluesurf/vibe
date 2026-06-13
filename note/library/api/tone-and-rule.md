# Tone and Rule (the State and the Dynamics)

The state is a ternary tone per direction per cell. The rule is a directional lattice gas that streams and collides it. Both live over any `Mesh`.

## The key pieces

| module | what it gives you |
| ------ | ----------------- |
| `@/code/tone/will` | `makeWill`, `fillWillPattern`, `charge`, `cellTone`, the `Will` state (one ternary `Tone` per direction per cell) and the `Tone` type (`-1 \| 0 \| 1`) |
| `@/code/rule/lattice-gas` | `beat` (collide then stream), `run`, `inverseBeat`, `stream`, the engine |
| `@/code/rule/collision` | `pairCollision`, the 9-state pair table run on every opposite line. Also `momentumRotate2D`, `passThrough`, `headOnRotate`, `stickyReflect`, `bindAndMove`, `PAIR_FORWARD` |
| `@/code/check/invariant` | `conservesCharge`, `isReversible` |
| `@/code/tool/mesh` | `squareMesh`, `d4Mesh`, the `Mesh` you fill |

## The shape of the state

A `Will` is `{ mesh, data }` where `data` is an `Int8Array` laid out as `data[cell * degree + direction]`. Each slot holds one `Tone`. That is the whole world. Nothing is stored anywhere else.

- `charge(will)` is the total tone, the conserved quantity.
- `cellTone(will, cell)` is one cell's scalar tone, the sum of its slots.

## Use it

Build a mesh, make a will, fill it, run beats.

```ts
import { squareMesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern } from '@/code/tone/will'
import { momentumRotate2D } from '@/code/rule/collision'
import { run } from '@/code/rule/lattice-gas'
import { conservesCharge } from '@/code/check/invariant'

const mesh = squareMesh({ side: 48 })
const will = makeWill(mesh)
fillWillPattern(will)

const after = run(will, momentumRotate2D, 200)
const ok = conservesCharge(will, momentumRotate2D, 200) // true
```

The committed 24-direction rule uses `pairCollision` over the `d4Mesh`. The collision needs the mesh's opposite map.

```ts
import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern } from '@/code/tone/will'
import { pairCollision } from '@/code/rule/collision'
import { conservesCharge, isReversible } from '@/code/check/invariant'

const mesh = d4Mesh({ side: 6 })
const will = makeWill(mesh)
fillWillPattern(will, 1)

const opposite = Array.from({ length: mesh.degree }, (_, d) => mesh.opposite(d))
const forward = pairCollision({ opposite, forward: true })
const inverse = pairCollision({ opposite, forward: false })

conservesCharge(will, forward, 60)         // true
isReversible(will, forward, 60, inverse)   // true
```

Two notes on reversibility.

- An involution (like `momentumRotate2D`, `passThrough`, `headOnRotate`, `stickyReflect`) is its own inverse. Call `isReversible(will, collision, beats)` with no fourth argument.
- A non-involution table (`pairCollision`, `bindAndMove`) has a paired inverse. Pass `forward: false` to build it, and hand it to `isReversible` as the fourth argument.

## A real run

See `test/experiment/foundations/directional-rule.ts`. It builds both the `squareMesh` 4-direction toy and the `d4Mesh` 24-direction rule, fills each with `fillWillPattern`, then asserts `conservesCharge` and `isReversible`.

## See also

- `@/code/rule/collision` for the other tables. `headOnRotate` and `stickyReflect` are involutions, `bindAndMove` is the mobility-plus-binding variant.
- `@/code/tone/pack` for the `(current, previous)` bit-pack and `toneColor` used by renders.
- `@/code/tone/configuration` and `@/code/tone/alphabet` for the higher-order alphabet state (spinor slots), separate from the `Will`.
