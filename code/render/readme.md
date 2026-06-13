# render

Centralized, renderer-agnostic hyperbolic tessellation rendering for the vibe project. Ported from the
three.js code that drove the clue.surf `/vibe/mesh` page
(`mesh/site/clue.surf/home/site/tool/honeycomb/`), and made fully independent of react and three.js so it
runs in node (backend) today, with browser and GPU adapters planned.

## The idea

One generic geometry core produces a renderer-agnostic **Scene**. Many **adapters** consume that Scene and
draw it. This is what lets a single tessellation feed a node rasterizer, a react/three view, and a webgpu
renderer without rewriting the geometry each time.

```
symbol {p,q} or {p,q,r}
      |
      v
geometry/honeycomb.ts  ->  Scene  ->  adapter/raster.ts   (node, PNG)        [done]
   (pure math)               (IR)  ->  adapter/three.ts    (react, WebGL)     [planned]
                                   ->  adapter/webgpu.ts    (node/browser GPU) [planned]
```

## The pieces

- `scene.ts` the renderer-agnostic intermediate representation. A `Scene` is a dimension (2 disk or 3 ball),
  a Schlafli symbol, and a list of edges (struts) in Poincare-ball coordinates. No three.js, no react, no GPU
  types.
- `geometry/minkowski.ts` the dimension-general Minkowski math (hyperboloid model, reflections, matrices,
  null vectors). Takes an explicit metric and time axis, so it works in any rank.
- `geometry/honeycomb.ts` the unified generator. `buildHoneycombScene({ symbol })` builds the tessellation by
  the Coxeter reflection method (reflect one cell across its mirror walls). The SAME code path makes a 2D
  tiling ({7,3}) and a 3D honeycomb ({5,3,4}), reading the dimension from `mirrorFrame(symbol)`.
- `adapter/raster.ts` the node CPU renderer. `renderSceneToPng({ scene })` projects and draws the Scene to a
  PNG buffer (a 2D tiling straight to the disk, a 3D honeycomb rotated, orthographically projected, and
  depth-shaded). Reuses `code/gpu/png` for encoding.
- `run/` validation scripts.

## Validation (done)

Both run on the backend, no browser.

```
npx tsx code/render/run/render-73.ts    # {7,3} 2D heptagonal tiling  -> make/render/tessellation-73.png
npx tsx code/render/run/render-534.ts   # {5,3,4} 3D honeycomb        -> make/render/tessellation-534.png
```

`{5,3,4}` renders as the dodecahedral honeycomb crowding the Poincare ball boundary. `{7,3}` renders as the
Escher heptagonal tiling in the disk. Both from one generator and one adapter.

## Adapter plan

- **raster** (done) node CPU to PNG, the backend validation renderer.
- **three / react** (planned) build three.js objects (instanced strut cylinders, the original look) from the
  same Scene, for the live `/vibe/mesh` page. The original `view.ts` interaction (drag to look around)
  becomes a thin shell over this adapter.
- **webgpu** (planned) feed the Scene edges to a GPU pipeline (the `code/gpu` engine) for very large
  tessellations and animated dynamics on the geometry.

## Scope note

This module centralizes the TESSELLATION geometry and its rendering. The flat-layer DYNAMICS renderers from
the same vibe page (the wave, perception, horosphere, and maintenance canvas renderers) are a separate
concern (the effective-level animator, already partly mirrored in `code/gpu`), and can be ported into an
adapter here next.
