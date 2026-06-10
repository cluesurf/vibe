# GPU vibe-field renderers

Headless WebGPU tools that run the vibe dynamics on the {5,3,4} system and render images and videos, all in
Node via the `webgpu` package (Dawn), no browser. The same WGSL also drives the browser viz.

## Prerequisites

- A GPU (on macOS this uses Metal via Dawn).
- The `webgpu` package (already a dependency): `pnpm add webgpu`.
- `ffmpeg` on the PATH (for assembling videos).
- WebGPU types come from TypeScript's lib.dom, no extra types package is needed.

All output is written to `make/` (gitignored).

## The renderers

| script | what it does |
|---|---|
| `run-wave.ts` | self-checks the flat-field GPU wave against a CPU reference, then benchmarks |
| `run-scale.ts` | scale sweep of the flat field, cells and beats per second per grid size |
| `run-bulk.ts` | the wave on the {5,3,4} bulk graph on the GPU, self-checked and benchmarked |
| `render-wave.ts` | renders one flat-field frame (the relativistic lightcone) to `make/field.png` |
| `render-horosphere.ts` | one frame of the horosphere slice extracted from the evolved bulk |
| `render-horosphere-anim.ts` | per-beat animation of the horosphere slice (full bulk, then slice) |
| `render-band-anim.ts` | per-beat animation of the TARGETED horosphere band (the free wave, hundreds of thousands of cells) |
| `render-band-life-anim.ts` | per-beat animation of the band under the COHESIVE rule (charges cluster, but blobs flicker) |
| `render-persistence-anim.ts [free\|maintained]` | the SELFHOOD test, colours by persistence-of-identity, flicker stays dark, a maintained self glows |

## Render a horosphere video (the main flow)

1. Generate the per-beat frames into `make/frames/`:

   ```
   pnpm tsx code/gpu/render-band-anim.ts
   ```

   This grows only the horosphere band (a Busemann-pruned BFS, O(band) not O(bulk)), evolves it on the GPU
   with the free wave, and writes one PNG per beat.

2. Assemble the frames into `make/horosphere.mp4`:

   ```
   task/render-video.sh          # default 20 fps
   task/render-video.sh 30       # custom fps
   ```

For self EMERGENCE (clusters condensing rather than static), use the cohesive variant instead of step 1:

```
pnpm tsx code/gpu/render-band-life-anim.ts
task/render-video.sh
```

## Testing for selves (the honest result)

A connected same-sign blob is NOT a self, it flickers, it is the shallow proxy the theory rejects. A real
self is persistent, bounded, self-maintaining, and integrated, recognized by its dynamics, not its momentary
tones (`note/research/vibe/notes/theory-v0.5.0/the-definition-of-a-self.md`).

`render-persistence-anim.ts` makes this visible by colouring each charge by how long it has continuously held
its identity. Run both modes and compare:

```
pnpm tsx code/gpu/render-persistence-anim.ts free        # the bare cohesive rule
pnpm tsx code/gpu/render-persistence-anim.ts maintained  # a seeded self held by conserving maintenance
```

Measured result, average persistence inside the self vs the background, over 200 beats:

- FREE, self and background both about 0 to 1, everything flickers, NO selves form. The bare reversible rule
  has no attractors (P159), so left alone every pattern churns. This is the honest negative, visualized.
- MAINTAINED, the self pins at about 41 (the cap) while the background stays about 1. The maintained self
  glows as a bright bounded structure amid the dark churn, the one thing that is not flickering. That is a
  self by definition, persistent and bounded because maintenance pays work to hold it (P178, P107).

So selves do not emerge for free from the bare rule, they require active, conserving maintenance, exactly as
P178 found. The persistence colouring is the test, the self is the thing that glows.

## Tuning knobs (top of each render script)

- `MAX_BAND` or `MAX_CELLS`, how many cells. Larger is denser. The GPU adjacency buffer caps the band near
  700k on a 128 MiB-limit device. At a few hundred thousand the band reads as a continuum, at 50k to 100k the
  cluster structure is legible.
- `FRAMES`, beats rendered (one frame per beat).
- `IMG`, output pixel size. `RADIUS`, dot size per cell.
- `ZOOM_FIT`, fraction of band cells to fit in frame, lower zooms harder on the dense core.
- For `render-band-life-anim.ts` only, `SEED_DENSITY` (material to coarsen, higher gives bigger selves),
  `COHESION` (surface tension), `ARROW` (creation rate).

## Notes

- These scripts need a GPU, so they are NOT in the test suite. Correctness is self-checked at run time
  (`run-wave.ts`, `run-bulk.ts` compare the GPU to a CPU reference).
- The horosphere flattening uses a stereographic inversion from the ideal point (an orthographic drop folds
  the horosphere into a ring).
- Scaling, precision, and the path to millions of cells are documented in
  `note/research/vibe/notes/gpu-simulation-options.md`, `horosphere-extraction-algorithms.md`, and
  `note/plan/vibe-webgpu-billion-cell-sim.md`.
