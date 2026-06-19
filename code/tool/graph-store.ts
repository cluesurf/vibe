// Persist a cell graph (CSR adjacency) and a tone state to disk, so a large graph can be precomputed
// once and reloaded for long runs, checkpoints, and examination. Binary format, little-endian Int32.
//
// Graph file layout: [int32 cellCount][int32 adjLen][int32 * (cellCount+1) offsets][int32 * adjLen adj]
// State file layout: [int32 cellCount][int8 * cellCount tone]

import { readFileSync, writeFileSync } from 'node:fs'

export interface StoredGraph {
  cellCount: number
  offsets: Int32Array
  adj: Int32Array
}

export function saveGraph(path: string, g: StoredGraph): void {
  const header = Int32Array.from([g.cellCount, g.adj.length])
  const buf = Buffer.concat([
    Buffer.from(header.buffer, header.byteOffset, header.byteLength),
    Buffer.from(
      g.offsets.buffer,
      g.offsets.byteOffset,
      g.offsets.byteLength,
    ),
    Buffer.from(g.adj.buffer, g.adj.byteOffset, g.adj.byteLength),
  ])

  writeFileSync(path, buf)
}

export function loadGraph(path: string): StoredGraph {
  const buf = readFileSync(path)
  const header = new Int32Array(buf.buffer, buf.byteOffset, 2)
  const cellCount = header[0]!
  const adjLen = header[1]!

  let off = 8

  const offsets = new Int32Array(cellCount + 1)
  offsets.set(
    new Int32Array(buf.buffer, buf.byteOffset + off, cellCount + 1),
  )
  off += (cellCount + 1) * 4
  const adj = new Int32Array(adjLen)
  adj.set(new Int32Array(buf.buffer, buf.byteOffset + off, adjLen))

  return { cellCount, offsets, adj }
}

export function saveState(path: string, tone: Int8Array): void {
  const header = Int32Array.from([tone.length])
  const buf = Buffer.concat([
    Buffer.from(header.buffer, header.byteOffset, header.byteLength),
    Buffer.from(tone.buffer, tone.byteOffset, tone.byteLength),
  ])

  writeFileSync(path, buf)
}

export function loadState(path: string): Int8Array {
  const buf = readFileSync(path)
  const header = new Int32Array(buf.buffer, buf.byteOffset, 1)
  const n = header[0]!
  const tone = new Int8Array(n)
  tone.set(new Int8Array(buf.buffer, buf.byteOffset + 4, n))

  return tone
}
