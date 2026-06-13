# Drawing and Rendering

The visual half of `@cluesurf/vibe`. Small 2D drawing primitives and the tone palette, renderer-agnostic tessellation scenes, and the headless WebGPU runners that evolve the rule at millions of cells.

## Drawing primitives (`@/code/draw/`)

| module | what it gives you |
|---|---|
| `@/code/draw/color` | the one tone palette. `PEACE` `PLEASURE` `PAIN` (each an `[r,g,b]`) and `TONE_COLORS`, indexed by packed tone (0 peace, 1 pleasure/blue, 2 pain/red). |
| `@/code/draw/raster` | RGBA canvas drawing. `makeCanvas` (background-filled buffer), `setPixel`, `drawDisk` (filled, clipped, sub-pixel). `Color` type. |
| `@/code/draw/png` | `encodePng(rgba, width, height)` returns a PNG `Buffer`. No dependency. |
| `@/code/draw/animation` | numbered frames. `frameName` (zero-padded name) and `writeFrame` (encode + write one frame to a dir). Pair with ffmpeg. |
| `@/code/draw/vector` | tiny vector math. `norm` `dot` `subtract` `scaled` `normalize`. |

## Render scripts (`@/code/render/`) and GPU compute (`@/code/compute/`)

`@/code/render/` is renderer-agnostic tessellation geometry. One math core builds a `Scene` (a Schlafli symbol plus edges in Poincare-ball coordinates), and an adapter draws it. `buildHoneycombScene({ symbol })` from `@/code/render/geometry/honeycomb` builds a 2D tiling or a 3D honeycomb from the same code path. `renderSceneToPng({ scene })` from `@/code/render/adapter/raster` projects and draws it to a PNG buffer. Validation scripts live in `@/code/render/run/` (`533`, `73`, `534`, `wave.ts`, `jewel-mesh.ts`).

`@/code/compute/` holds the headless WebGPU runners. They evolve the rule on the GPU via the `webgpu` package (Dawn), no browser. Each runner self-checks the GPU against a CPU reference of the same rule on a small grid, then benchmarks at scale. A green run proves correctness.

Key runners:

- `run-pure-rule.ts` the pure five-thing rule (one reversible 9-state permutation) as conflict-free color passes. Checks conservation and reversibility.
- `run-wave.ts` the flat-field wave. `run-bulk.ts` the wave on the {5,3,4} bulk graph. `run-bulk-3434.ts` the {3,4,3,4} 4D bulk (24-neighbour).
- `run-emergent-layers.ts` coarse-grains the pure rule to hunt for persistent middle layers.
- `run-model.ts` exports `runModel(graph, seed)` returning `{ deterministic, evolves, nonzeroFraction }`.
- `wave.wgsl.ts` the shared WGSL (`WAVE_STEP_WGSL`, `BULK_STEP_WGSL`) used by both the runners and the browser viz.

These need a real GPU, so they are NOT in the test suite. Run them directly with `pnpm call`. Output goes to `make/` (gitignored). Use ffmpeg (or `task/render-video.sh`) to assemble frames into video.

## Use it

Tone palette lookup and a disk:

```ts
import { TONE_COLORS } from '@/code/draw/color'
import { makeCanvas, drawDisk } from '@/code/draw/raster'
import { encodePng } from '@/code/draw/png'

const rgba = makeCanvas({ width: 256, height: 256, background: TONE_COLORS[0] })
drawDisk({ rgba, width: 256, height: 256, centerX: 128, centerY: 128, radius: 40, color: TONE_COLORS[1] })
const png = encodePng(rgba, 256, 256) // Buffer
```

Run a GPU runner (needs a real GPU):

```
pnpm call code/compute/run-pure-rule.ts
pnpm call code/compute/run-wave.ts
```

## See also

- `@/code/compute/readme.md` the GPU renderer catalog, tuning knobs, and the selfhood test.
- `@/code/render/readme.md` the Scene / adapter design and the validation scripts.
- `@/code/viz/` browser-facing visualization exports (`clock-24`, `curvature`, `gravity-test`, `horosphere-export`, `maintenance-export`).
