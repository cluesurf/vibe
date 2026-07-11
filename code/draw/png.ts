// A minimal dependency-free PNG encoder (RGBA, 8-bit) shared by the headless GPU renderers. Uses Node's
// zlib for the IDAT stream and a small CRC32 for the chunk checksums.

import zlib from 'node:zlib'

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)

  for (let n = 0; n < 256; n++) {
    let c = n

    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }

    t[n] = c >>> 0
  }

  return t
})()

function crc32(buf: Buffer): number {
  let c = 0xffffffff

  for (const byte of buf) {
    c = CRC_TABLE[(c ^ byte) & 0xff]! ^ (c >>> 8)
  }

  return (c ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4)

  len.writeUInt32BE(data.length, 0)

  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)

  crc.writeUInt32BE(crc32(body), 0)

  return Buffer.concat([len, body, crc])
}

export function encodePng(
  rgba: Uint8Array,
  width: number,
  height: number,
): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)

  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type 6, RGBA

  const stride = width * 4
  const raw = Buffer.alloc(height * (stride + 1))

  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter type 0 per scanline
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1,
    )
  }

  const idat = zlib.deflateSync(raw)

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}
