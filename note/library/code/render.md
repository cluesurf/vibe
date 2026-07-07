# render (renderer-agnostic tessellation scenes)

Centralized hyperbolic tessellation rendering. One generic geometry core builds a renderer-agnostic `Scene` (a Schlafli symbol plus edges in Poincare-ball coordinates), and many adapters draw it. The same code path makes a 2D tiling and a 3D honeycomb, so a single tessellation can feed a node rasterizer, a react/three view, and a WebGPU renderer without rewriting the geometry. Ported from the three.js code that drove the clue.surf `/vibe/mesh` page and made independent of react and three.js so it runs in node. For the friendly using-guide, read `../api/draw-and-render.md` and `code/render/readme.md`.

Import from `@/code/render/<file>`.

## The core (scene and geometry)

| module | key exports | what it gives you |
| --- | --- | --- |
| `scene` | `Scene`, `SceneEdge`, `SceneFace`, `ballNorm`, `Vec` | the renderer-agnostic intermediate representation (dimension, symbol, edges in the Poincare ball) |
| `geometry/honeycomb` | `buildHoneycombScene`, `buildSphericalScene`, `buildEuclideanScene`, `buildTilingScene`, `hasFiniteCell` | the unified generator, builds a tiling or honeycomb by the Coxeter reflection method |
| `geometry/isometry` | `mobiusAdd`, `gyroScale`, `geodesicPoints`, `glide`, `rotateAboutOrigin`, `transformScene` | hyperbolic isometries on Poincare-ball points and whole scenes |
| `geometry/cell-shape` | `buildCellShape`, `CellShape` | the shape of one cell |
| `geometry/tiling-faces` | `buildTilingFaces`, `TilingFaces` | the filled faces of a 2D tiling |
| `geometry/projection` | `liftToHyperboloid`, `applyModel`, `modelIsBounded`, `ProjectionModel` | the disk, ball, and hyperboloid model conversions |
| `geometry/truncate` | `truncateScene`, `TruncateOptions` | truncate the cells of a scene |
| `geometry/pattern` | `patternClass`, `patternClassCount`, `PatternScheme` | colour-pattern classes over the tiling |
| `mirrors` | `canonicalMirrors` | the canonical Coxeter mirror set for a symbol |
| `palette` | `PALETTE_RGB01`, `PALETTE_HEX`, `shade`, `hexToRgb01`, `HUE_ORDER`, `SHADES` | the shared colour palette (hue and shade lookup) |
| `camera` | `Camera`, `CameraOptions` | the CPU camera |

## The adapters

| module | key exports | what it gives you |
| --- | --- | --- |
| `adapter/raster` | `renderSceneToPng`, `renderSceneToRgba`, `RasterOptions`, `Rgb` | the node CPU renderer, projects and draws a Scene to a PNG or RGBA buffer |
| `react/vibe-view` | `VibeView`, `VibeViewProps` | the react component that mounts the GPU renderer |

## The GPU fold engine

| module | key exports | what it gives you |
| --- | --- | --- |
| `gpu/engine` | `VibeRenderer` | the WebGPU renderer object (the live fold-fractal engine) |
| `gpu/fold-scene` | `createFoldScene`, `FoldScene`, `FoldMode` | the fold-fractal scene (2D and 3D kaleidoscopic folding) |
| `gpu/headless` | `createHeadlessFoldScene` | the headless (no-canvas) fold scene for node |
| `gpu/camera` | `makeCamera`, `Camera` | the GPU camera |
| `gpu/input` | `attachControls`, `Controls` | drag-to-look interaction |
| `gpu/uniform` | `packFold2D`, `packFold3D`, `Fold2DUniform`, `Fold3DUniform`, `FOLD_ITERATIONS` | the uniform buffers packed for the shader |
| `fold.wgsl` | (WGSL string) | the fold-fractal shader |

## The run scripts

`code/render/run/` holds the validation and demo scripts (run with `npx tsx`, output to `make/`). Highlights:

- `run/73/index.ts` the `{7,3}` heptagonal tiling to the disk.
- `run/534/` the `{5,3,4}` honeycomb work, subfoldered into `band/` (the horosphere band, `band-life`, `gravity`, `infall`, `lightcone`, `moving-self`, `persistence`, `pure-rule`), `horosphere/` (`anim`, `glide`, `ripple`), and `nesting/` (`base`, `wave`, `zoom`).
- `run/3434/` the `{3,4,3,4}` scripts (`cusp-glider`, `cusp-vol`).
- Top-level `run/` scripts: `fold`, `flythrough`, `flythrough-4d`, `flyover`, `jewel-mesh`, `tessellations`, `geometries`, `walk`, `wave`, `fibonacci*` (the railway and ternary Fibonacci renders), `web-export`.

## Entry points

### `buildHoneycombScene({ symbol })`
Build the tessellation by the Coxeter reflection method (reflect one cell across its mirror walls). The SAME code path makes a 2D tiling (`{7,3}`) and a 3D honeycomb (`{5,3,4}`), reading the dimension from the mirror frame of the symbol. Returns a `Scene`. The spherical and Euclidean variants are `buildSphericalScene` and `buildEuclideanScene`.

### `renderSceneToPng({ scene })`
Project and draw a Scene to a PNG buffer. A 2D tiling goes straight to the disk, a 3D honeycomb is rotated, orthographically projected, and depth-shaded. `renderSceneToRgba` returns the raw buffer instead. Reuses `code/draw/png` for encoding.

### `VibeRenderer` and `VibeView`
The live WebGPU fold engine. `VibeRenderer` (from `gpu/engine`) drives the kaleidoscopic fold-fractal render, `VibeView` (from `react/vibe-view`) is the react wrapper that mounts it and wires the drag controls.

## Used by

The render scripts produce the tessellation figures for the papers and the `/vibe/mesh` page. The `Scene` and `buildHoneycombScene` core is the shared geometry the GPU, react, and raster adapters consume. `palette` and `renderSceneToPng` are the drawing bridge to `draw.md`. The `run/534/band/` scripts render the horosphere selfhood work (`../coarse-graining-and-selves.md`).

## See also

- `code/render/readme.md`, the Scene and adapter design and the validation scripts.
- `draw.md`, the 2D drawing primitives (`encodePng`, the canvas) this uses.
- `compute.md`, the headless WebGPU rule runners.
- `../api/draw-and-render.md`, the friendly using-guide.
