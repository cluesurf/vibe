// Writing an animation as numbered PNG frames in a directory, the last step every
// renderer shares. Pair with ffmpeg or similar to assemble the frames into a
// video.

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { encodePng } from '@/code/draw/png'

// The zero-padded frame file name, e.g. frame_0007.png.
export function frameName(input: {
  index: number
  prefix?: string
  pad?: number
  extension?: string
}): string {
  const prefix = input.prefix ?? 'frame_'
  const pad = input.pad ?? 4
  const extension = input.extension ?? 'png'
  return `${prefix}${String(input.index).padStart(pad, '0')}.${extension}`
}

// Encode an RGBA buffer to PNG and write it as one numbered frame in a directory.
export function writeFrame(input: {
  dir: string
  index: number
  rgba: Uint8Array
  width: number
  height: number
  prefix?: string
  pad?: number
}): void {
  const name = frameName({ index: input.index, prefix: input.prefix, pad: input.pad })
  writeFileSync(join(input.dir, name), encodePng(input.rgba, input.width, input.height))
}
