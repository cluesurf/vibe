# code/tone

The state layer. A **tone** is one ternary value per direction per cell, and this folder holds every way to store that state. It sits between the substrate and the rule in the pipeline (`substrate -> tone -> rule -> dynamics -> coarse -> model`). The substrate gives you a mesh, the tone puts a value on it, and the rule reads and rewrites that value each beat. The committed state is the `Will`, a flat `Int8Array` of one ternary tone per cell per direction with no hidden state anywhere else. The other files (`alphabet`, `configuration`, `pack`) are the generic and packed alternatives for experiments that need a different alphabet or a two-frame layout.

## Modules

| file | key exports | what it is |
|:--- |:--- |:--- |
| `will.ts` | `Will`, `Tone`, `makeWill`, `fillWillPattern`, `charge`, `cellTone` | the committed state, one ternary tone per cell per direction in a flat `Int8Array` |
| `alphabet.ts` | `Alphabet`, `slotsPerElement`, `valueCount`, `randomValue` | the generic finite tone alphabet (boolean, ternary, clock, spinor) |
| `configuration.ts` | `Configuration`, `makeConfiguration`, `getTone`, `setTone`, `cloneConfiguration` | a dense value-per-element store over any alphabet |
| `pack.ts` | `pack`, `currentOf`, `previousOf`, `signedTone`, `toneColor` | pack a current and previous ternary code into one integer, plus tone-to-color |

## The Will (the committed state)

`will.ts` is the state the base rule runs on. Everything else in the model is a pattern in it.

- `Tone` is `-1 | 0 | 1`, peace `0`, pleasure `+1`, pain `-1`.
- `Will` is `{ mesh, data }` where `data` is an `Int8Array` laid out as `data[cell * degree + direction]`. There is no other state.
- `makeWill(mesh): Will` allocates the vacuum, every slot `0`.
- `cloneWill(will): Will` deep-copies a will.
- `fillWillPattern(will, phase?): void` writes a **deterministic** structured ternary pattern into every slot, never random. `phase` shifts the pattern. This is the standard way to seed a run.
- `loneParticle(mesh, cell, direction, tone?): Will` puts a single charge at one cell pointing one way.
- `gliderLine({ mesh, start, direction, tone?, length }): { will, cells }` lays a co-moving line of charges (a glider) along consecutive cells.
- `charge(will): number` is the total tone over the whole mesh, the conserved charge.
- `cellTone(will, cell): number` is the net charge of one cell (sum of its directional slots).
- `cellActivity(will, cell): number` is the total tone magnitude of one cell (sum of absolute slots).

## The generic alternatives

- `alphabet.ts` describes a finite tone alphabet as a tagged union: `boolean`, `ternary`, `clock` (with `q` states), or `spinor` (with `components` slots). `slotsPerElement` and `valueCount` report the layout, `randomValue({ alphabet, u })` maps a uniform `u` to a value.
- `configuration.ts` is a dense store of one value per element over any `Alphabet`. `makeConfiguration({ alphabet, size, rng? })` allocates it, `getTone` and `setTone` read and write by `{ element, slot? }`, `cloneConfiguration` copies it. Use this when the state is not the committed directional ternary will.
- `pack.ts` packs a current and previous ternary code into one integer (`pack`, `currentOf`, `previousOf`) for two-frame layouts, and maps a code to a signed tone (`signedTone`) or an RGB triple (`toneColor`).

## Used by

- **Narrated in** [rule-engine.md](../rule-engine.md) (the `Will` is the state the base rule streams and collides) and the consumer guide [api/tone-and-rule.md](../api/tone-and-rule.md).
- **Consumed by** `code/rule/*` (every collision and beat reads a `Will`), `code/dynamics/*` (sweeps and walks over states), and the model DSL `code/model/vibe.ts`.
- **Example arenas** `test/experiment/foundations/` (the directional-rule reversibility and charge tests build a `Will`, fill it with `fillWillPattern`, and check `charge`), and any arena that runs the base dynamics.
