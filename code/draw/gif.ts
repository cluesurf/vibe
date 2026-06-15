// A minimal animated GIF89a encoder, so a sequence of RGBA frames becomes ONE self-contained looping file
// with no external tool. Frames are quantized to a fixed 6x6x6 color cube plus a 40-step grey ramp (256
// colors), which is plenty for the violet-on-dark tessellation renders, then LZW-compressed per the GIF
// spec. This is the optimized output path for the flyover animations, one small file instead of a folder of
// PNGs plus ffmpeg.

// build the 256-entry global palette, a 6x6x6 RGB cube (216) followed by a 40-step grey ramp
function buildPalette(): { table: Uint8Array; indexOf: (r: number, g: number, b: number) => number } {
  const table = new Uint8Array(256 * 3)
  const levels = [0, 51, 102, 153, 204, 255]
  let i = 0
  for (let r = 0; r < 6; r++) for (let g = 0; g < 6; g++) for (let b = 0; b < 6; b++) {
    table[i * 3] = levels[r]!
    table[i * 3 + 1] = levels[g]!
    table[i * 3 + 2] = levels[b]!
    i++
  }
  for (let k = 0; k < 40; k++) {
    const v = Math.round((k / 39) * 255)
    table[i * 3] = v
    table[i * 3 + 1] = v
    table[i * 3 + 2] = v
    i++
  }
  const indexOf = (r: number, g: number, b: number): number => {
    // grey if the channels are close, else the nearest cube cell
    const mx = Math.max(r, g, b)
    const mn = Math.min(r, g, b)
    if (mx - mn < 12) return 216 + Math.min(39, Math.round((((r + g + b) / 3) / 255) * 39))
    const q = (x: number): number => Math.min(5, Math.round((x / 255) * 5))
    return q(r) * 36 + q(g) * 6 + q(b)
  }
  return { table, indexOf }
}

// LZW-compress an index stream into GIF sub-blocks, minimum code size 8 (256-color table)
function lzwCompress(indices: Uint8Array): Uint8Array {
  const minCodeSize = 8
  const clearCode = 1 << minCodeSize
  const endCode = clearCode + 1
  const out: number[] = []
  let bitBuffer = 0
  let bitCount = 0
  const emit = (code: number, width: number): void => {
    bitBuffer |= code << bitCount
    bitCount += width
    while (bitCount >= 8) {
      out.push(bitBuffer & 0xff)
      bitBuffer >>= 8
      bitCount -= 8
    }
  }

  let dict = new Map<string, number>()
  const resetDict = (): void => {
    dict = new Map<string, number>()
    for (let c = 0; c < clearCode; c++) dict.set(String(c), c)
  }
  let codeWidth = minCodeSize + 1
  let next = endCode + 1
  resetDict()
  emit(clearCode, codeWidth)

  let prefix = String(indices[0])
  for (let p = 1; p < indices.length; p++) {
    const c = indices[p]!
    const combined = `${prefix},${c}`
    if (dict.has(combined)) {
      prefix = combined
    } else {
      emit(dict.get(prefix)!, codeWidth)
      dict.set(combined, next)
      next++
      if (next === 1 << codeWidth && codeWidth < 12) codeWidth++
      if (next > 4095) {
        emit(clearCode, codeWidth)
        resetDict()
        codeWidth = minCodeSize + 1
        next = endCode + 1
      }
      prefix = String(c)
    }
  }
  emit(dict.get(prefix)!, codeWidth)
  emit(endCode, codeWidth)
  if (bitCount > 0) out.push(bitBuffer & 0xff)

  // pack into sub-blocks of at most 255 bytes
  const blocks: number[] = [minCodeSize]
  for (let i = 0; i < out.length; i += 255) {
    const chunk = out.slice(i, i + 255)
    blocks.push(chunk.length, ...chunk)
  }
  blocks.push(0)
  return Uint8Array.from(blocks)
}

// encode RGBA frames (each width*height*4) into an animated GIF. delayMs is the per-frame delay.
export function encodeGif(input: {
  frames: Uint8Array[]
  width: number
  height: number
  delayMs?: number
}): Buffer {
  const { frames, width, height, delayMs = 50 } = input
  const { table, indexOf } = buildPalette()
  const bytes: number[] = []
  const push = (...b: number[]): void => {
    for (const x of b) bytes.push(x & 0xff)
  }
  const word = (v: number): void => push(v & 0xff, (v >> 8) & 0xff)

  // header and logical screen descriptor, global color table of 256 entries
  for (const ch of 'GIF89a') push(ch.charCodeAt(0))
  word(width)
  word(height)
  push(0xf7, 0, 0) // global table present, 256 entries, background 0
  for (let i = 0; i < table.length; i++) push(table[i]!)

  // netscape looping extension
  push(0x21, 0xff, 0x0b)
  for (const ch of 'NETSCAPE2.0') push(ch.charCodeAt(0))
  push(0x03, 0x01, 0x00, 0x00, 0x00)

  const delay = Math.round(delayMs / 10)
  for (const frame of frames) {
    const indices = new Uint8Array(width * height)
    for (let p = 0; p < width * height; p++) {
      indices[p] = indexOf(frame[p * 4]!, frame[p * 4 + 1]!, frame[p * 4 + 2]!)
    }
    // graphic control extension (delay, no transparency)
    push(0x21, 0xf9, 0x04, 0x00, delay & 0xff, (delay >> 8) & 0xff, 0x00, 0x00)
    // image descriptor
    push(0x2c)
    word(0)
    word(0)
    word(width)
    word(height)
    push(0x00)
    const data = lzwCompress(indices)
    for (let i = 0; i < data.length; i++) push(data[i]!)
  }

  push(0x3b) // trailer
  return Buffer.from(bytes)
}
