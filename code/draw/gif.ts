// Animated GIF encoder for the flyover animations, one self-contained looping file instead of a folder of
// PNGs plus ffmpeg. We wrap the gifenc npm library (a small, fast, well-tested GIF89a encoder) rather than
// hand-rolling the LZW + palette logic. gifenc quantizes each frame to a 256-color palette and writes the
// netscape looping extension for us.

// gifenc only exposes a CommonJS default under ESM, so we destructure from the default import.
import gifenc from 'gifenc'

// gifenc ships no type declarations, so we describe the small slice of its API we use at this boundary.
interface GifFrameOptions {
  palette: number[][]
  delay: number
  repeat: number
  first: boolean
}

interface GifEncoderInstance {
  writeFrame: (
    index: Uint8Array,
    width: number,
    height: number,
    options: GifFrameOptions,
  ) => void
  finish: () => void
  bytesView: () => Uint8Array
}

interface GifEnc {
  GIFEncoder: () => GifEncoderInstance
  quantize: (frame: Uint8Array, maxColors: number) => number[][]
  applyPalette: (frame: Uint8Array, palette: number[][]) => Uint8Array
}

const { GIFEncoder, quantize, applyPalette } =
  gifenc as unknown as GifEnc

// encode RGBA frames (each width*height*4) into an animated, looping GIF. delayMs is the per-frame delay.
export function encodeGif(input: {
  frames: Uint8Array[]
  width: number
  height: number
  delayMs?: number
}): Buffer {
  const { frames, width, height, delayMs = 50 } = input
  const gif = GIFEncoder()

  // one shared palette from the first frame keeps every frame color-stable across the animation (the violet
  // tessellation lines never drift) and keeps the file small, the global table is written once.
  const palette = quantize(frames[0]!, 256)

  frames.forEach((frame, i) => {
    const index = applyPalette(frame, palette)
    gif.writeFrame(index, width, height, {
      palette,
      delay: delayMs,
      repeat: 0,
      first: i === 0,
    })
  })

  gif.finish()

  return Buffer.from(gif.bytesView())
}
