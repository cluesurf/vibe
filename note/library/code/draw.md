# draw (2D drawing primitives)

The small, dependency-free 2D drawing kit. An RGBA canvas, a filled disk, a PNG encoder, a GIF encoder, numbered animation frames, the tone palette, and a little vector math. Everything writes plain buffers, so it runs in node with no browser and no image library. This is the low-level drawing layer, the render scripts and the viz exports build on it. For the friendly using-guide, read `../api/draw-and-render.md`.

Import from `@/code/draw/<file>`.

## Modules

| module | key exports | what it gives you |
| --- | --- | --- |
| `color` | `PEACE`, `PLEASURE`, `PAIN`, `TONE_COLORS` | the one tone palette, each an `[r,g,b]`, indexed by packed tone (0 peace, 1 pleasure/blue, 2 pain/red) |
| `raster` | `makeCanvas`, `setPixel`, `drawDisk`, `Color` | RGBA canvas drawing, background fill and a clipped sub-pixel filled disk |
| `png` | `encodePng` | encode an RGBA buffer to a PNG `Buffer`, no dependency |
| `gif` | `encodeGif` | encode frames to an animated GIF `Buffer` |
| `animation` | `frameName`, `writeFrame` | numbered frames, a zero-padded name and encode-plus-write for one frame |
| `vector` | `norm`, `dot`, `subtract`, `scaled`, `normalize` | tiny vector math |

## Entry points

### `makeCanvas({ width, height, background })` and `drawDisk({ ... })`
Allocate a background-filled RGBA buffer, then paint. `drawDisk` draws a filled, clipped, sub-pixel disk at a centre with a radius and a colour. `setPixel` writes one pixel. `Color` is `[r, g, b]`.

### `encodePng(rgba, width, height): Buffer`
Encode an RGBA buffer straight to a PNG buffer. No dependency, pure TypeScript. `encodeGif({ ... })` does the animated-GIF equivalent for a sequence of frames.

### `frameName({ ... })` and `writeFrame({ ... })`
Numbered animation frames. `frameName` builds a zero-padded name, `writeFrame` encodes and writes one frame to a directory. Pair the output with ffmpeg (or `task/render-video.sh`) to assemble a video.

### `TONE_COLORS`
The palette lookup. `TONE_COLORS[0]` is peace (near-black), `[1]` is pleasure (blue), `[2]` is pain (red). The one colour scheme every vibe figure uses so the tones read consistently.

## Used by

`code/render/adapter/raster` and the render scripts encode their output through `png` and `gif`. The `code/viz/` exports use the palette and canvas. Any experiment that wants a figure imports `makeCanvas`, `drawDisk`, and `encodePng` directly. The GPU runners in `code/compute` also encode frames through `png`.

## See also

- `../api/draw-and-render.md`, the friendly using-guide with snippets.
- `render.md`, the renderer-agnostic tessellation scenes that draw through this.
- `viz.md`, the browser-facing visualization exports.
