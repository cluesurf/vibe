# vibe sample app

A minimal React Router 7 + Vite SPA that mounts the vibe WebGPU renderer. It is a thin host: every bit of
rendering and navigation lives in the package's `code/render`, this app only instantiates `<VibeView />`.

## Run

```
pnpm install
pnpm dev
```

Then open the printed URL (port 5180). Needs a WebGPU-capable browser (recent Chrome, Edge, or Safari Technology
Preview).

## Pages

- `/tiling` — 2D `{p,q}` tilings (Poincaré disk), walk and turn.
- `/honeycomb` — 3D `{p,q,r}` honeycombs sphere-traced, dive in from outside.
- `/rooms` — first-person interior, the textured solid cells.

## Controls

`W`/`A`/`S`/`D` or arrows move and turn, `Q`/`E` strafe, `Space`/`Shift` rise and sink (3D), drag to look,
wheel to zoom (2D) or dolly (3D). All of this is implemented in `code/render/gpu/input.ts`, not here.

## Architecture

The renderer is an adapter system over one device-agnostic core (`code/render/gpu/fold-scene.ts`):

- the **browser** adapter (`code/render/gpu/engine.ts`) draws into a canvas every frame (this app),
- the **headless** adapter (`code/render/gpu/headless.ts`) reads back to PNG / GIF (the runners),

both sharing the same fold shaders, camera, and controls. Nothing about the tiling math is duplicated per target.
