// Verified deterministic binary disk cache for exact {3,4,3,4} Coxeter balls
// (exact-ball-mesh.ts) and exact cusp neighborhoods (exact-cusp.ts).
//
// Files live under <repo>/tmp/mesh-cache/ and never touch /tmp or delete files.
// Every file carries an 8-byte magic header ('VIBEMESH'), a uint32 schema
// version, a uint32 record kind, a UTF-8 parameter key, a uint32 payload length,
// and a 32-byte SHA-256 digest over the header prefix, key, and payload. Any
// missing, truncated, corrupted, or parameter-mismatched file returns null and
// falls back cleanly to the exact arithmetic builder.

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  exactBallMesh,
  type ExactBallMesh,
} from '@/code/substrate/coxeter/exact-ball-mesh'
import {
  buildExactCusp,
  type CuspTranslations,
  type ExactCusp,
} from '@/code/substrate/coxeter/exact-cusp'
import { type ExactBall, type ExactMatrix } from '@/code/substrate/coxeter/exact-3434'
import { type Mesh } from '@/code/tool/mesh'

const SLOTS = 24
const MATRIX_LEN = 50
const DEFAULT_CUSP_OFFSET = -0.4686

const CACHE_MAGIC = Buffer.from('VIBEMESH', 'ascii')
const HEADER_SIZE = 56 // 8 magic + 4 version + 4 kind + 4 keyLen + 4 payloadLen + 32 sha256
const KIND_EXACT_BALL = 1
const KIND_EXACT_CUSP = 2

export const CACHE_SCHEMA_VERSION = 1

const IS_LITTLE_ENDIAN =
  new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1

function resolveRepoRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url))

  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, 'package.json'))) {
      return dir
    }

    const parent = dirname(dir)

    if (parent === dir) {
      break
    }

    dir = parent
  }

  return resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
}

const DEFAULT_CACHE_DIR = join(resolveRepoRoot(), 'tmp', 'mesh-cache')

export function meshCacheDir(override?: string): string {
  return override ?? DEFAULT_CACHE_DIR
}

function float64Hex(value: number): string {
  const buf = Buffer.allocUnsafe(8)

  buf.writeDoubleBE(value, 0)

  return buf.toString('hex')
}

function exactBallKey(radius: number): string {
  return `exact-ball:v${CACHE_SCHEMA_VERSION}:r=${radius}`
}

function exactCuspKey(period: number, floor: number, offset: number): string {
  return `exact-cusp:v${CACHE_SCHEMA_VERSION}:p=${period}:f=${floor}:o=${float64Hex(offset)}`
}

export function exactBallCachePath(radius: number, cacheDir?: string): string {
  return join(meshCacheDir(cacheDir), `exact-ball-r${radius}.vbm`)
}

export function exactCuspCachePath(
  options: { period: number; floor: number; offset?: number },
  cacheDir?: string,
): string {
  const theta = options.offset ?? DEFAULT_CUSP_OFFSET
  const suffix =
    theta === DEFAULT_CUSP_OFFSET ? '' : `-o${float64Hex(theta)}`

  return join(
    meshCacheDir(cacheDir),
    `exact-cusp-p${options.period}-f${options.floor}${suffix}.vbm`,
  )
}

function writeInt32ArrayLE(buf: Buffer, offset: number, arr: Int32Array): number {
  if (IS_LITTLE_ENDIAN) {
    Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength).copy(buf, offset)
  } else {
    for (let i = 0; i < arr.length; i++) {
      buf.writeInt32LE(arr[i]!, offset + i * 4)
    }
  }

  return offset + arr.length * 4
}

function readInt32ArrayLE(
  buf: Buffer,
  offset: number,
  length: number,
): Int32Array {
  const out = new Int32Array(length)

  if (IS_LITTLE_ENDIAN) {
    new Uint8Array(out.buffer).set(buf.subarray(offset, offset + length * 4))
  } else {
    for (let i = 0; i < length; i++) {
      out[i] = buf.readInt32LE(offset + i * 4)
    }
  }

  return out
}

function writeUint8Array(buf: Buffer, offset: number, arr: Uint8Array): number {
  buf.set(arr, offset)

  return offset + arr.length
}

function readUint8Array(
  buf: Buffer,
  offset: number,
  length: number,
): Uint8Array {
  const out = new Uint8Array(length)

  out.set(buf.subarray(offset, offset + length))

  return out
}

function wrapEnvelope(kind: number, key: string, payload: Buffer): Buffer {
  const keyBytes = Buffer.from(key, 'utf8')
  const totalLength = HEADER_SIZE + keyBytes.length + payload.length
  const out = Buffer.allocUnsafe(totalLength)

  CACHE_MAGIC.copy(out, 0)
  out.writeUInt32LE(CACHE_SCHEMA_VERSION, 8)
  out.writeUInt32LE(kind, 12)
  out.writeUInt32LE(keyBytes.length, 16)
  out.writeUInt32LE(payload.length, 20)
  keyBytes.copy(out, HEADER_SIZE)
  payload.copy(out, HEADER_SIZE + keyBytes.length)

  const digest = createHash('sha256')
    .update(out.subarray(0, 24))
    .update(out.subarray(HEADER_SIZE))
    .digest()

  digest.copy(out, 24)

  return out
}

function unwrapEnvelope(
  buf: Buffer,
  expectedKind: number,
  expectedKey: string,
): Buffer | null {
  if (buf.length < HEADER_SIZE) {
    return null
  }

  if (!buf.subarray(0, 8).equals(CACHE_MAGIC)) {
    return null
  }

  if (buf.readUInt32LE(8) !== CACHE_SCHEMA_VERSION) {
    return null
  }

  if (buf.readUInt32LE(12) !== expectedKind) {
    return null
  }

  const keyLen = buf.readUInt32LE(16)
  const payloadLen = buf.readUInt32LE(20)

  if (HEADER_SIZE + keyLen + payloadLen !== buf.length) {
    return null
  }

  const keyStr = buf
    .subarray(HEADER_SIZE, HEADER_SIZE + keyLen)
    .toString('utf8')

  if (keyStr !== expectedKey) {
    return null
  }

  const actualDigest = createHash('sha256')
    .update(buf.subarray(0, 24))
    .update(buf.subarray(HEADER_SIZE))
    .digest()

  if (!actualDigest.equals(buf.subarray(24, 56))) {
    return null
  }

  return buf.subarray(HEADER_SIZE + keyLen)
}

function makeTableMesh(id: string, cells: number, table: Int32Array): Mesh {
  return {
    id,
    degree: SLOTS,
    cellCount: cells,
    neighbour(c, direction) {
      return table[c * SLOTS + direction] ?? -1
    },
    opposite(direction) {
      return OPPOSITE[direction] ?? direction
    },
  }
}

export function encodeExactBallMesh(data: ExactBallMesh): Buffer {
  const { cells, radius, frontierSlots, classConflicts, classOf, gates, ball } =
    data
  const shells = ball.shells
  const gatesMask =
    (gates.gramExact ? 1 : 0) |
    (gates.inversionExchangesAntipodes ? 2 : 0) |
    (gates.oppositeIsKnitOpposite ? 4 : 0) |
    (gates.consistent ? 8 : 0) |
    (gates.returnsExactly ? 16 : 0) |
    (gates.inRange ? 32 : 0)

  const payloadLen =
    28 + shells.length * 4 + cells * SLOTS * 4 + cells * 4 + cells
  const payload = Buffer.allocUnsafe(payloadLen)
  let off = 0

  payload.writeUInt32LE(cells, off)
  off += 4
  payload.writeUInt32LE(radius, off)
  off += 4
  payload.writeUInt32LE(frontierSlots, off)
  off += 4
  payload.writeUInt32LE(classConflicts, off)
  off += 4
  payload.writeUInt32LE(ball.inconsistentSteps, off)
  off += 4
  payload.writeUInt32LE(gatesMask, off)
  off += 4
  payload.writeUInt32LE(shells.length, off)
  off += 4

  for (const count of shells) {
    payload.writeUInt32LE(count, off)
    off += 4
  }

  off = writeInt32ArrayLE(payload, off, ball.table)
  off = writeInt32ArrayLE(payload, off, ball.distance)
  writeUint8Array(payload, off, classOf)

  return wrapEnvelope(KIND_EXACT_BALL, exactBallKey(radius), payload)
}

export function decodeExactBallMesh(
  buf: Buffer,
  expectedRadius: number,
): ExactBallMesh | null {
  const payload = unwrapEnvelope(
    buf,
    KIND_EXACT_BALL,
    exactBallKey(expectedRadius),
  )

  if (payload === null || payload.length < 28) {
    return null
  }

  let off = 0
  const cells = payload.readUInt32LE(off)
  off += 4
  const radius = payload.readUInt32LE(off)
  off += 4
  const frontierSlots = payload.readUInt32LE(off)
  off += 4
  const classConflicts = payload.readUInt32LE(off)
  off += 4
  const inconsistentSteps = payload.readUInt32LE(off)
  off += 4
  const gatesMask = payload.readUInt32LE(off)
  off += 4
  const shellsLen = payload.readUInt32LE(off)
  off += 4

  if (
    radius !== expectedRadius ||
    cells < 1 ||
    gatesMask !== 0x3f ||
    inconsistentSteps !== 0
  ) {
    return null
  }

  const expectedPayloadLen =
    28 + shellsLen * 4 + cells * SLOTS * 4 + cells * 4 + cells

  if (payload.length !== expectedPayloadLen) {
    return null
  }

  const shells: number[] = []

  for (let i = 0; i < shellsLen; i++) {
    shells.push(payload.readUInt32LE(off))
    off += 4
  }

  const table = readInt32ArrayLE(payload, off, cells * SLOTS)
  off += cells * SLOTS * 4
  const distance = readInt32ArrayLE(payload, off, cells)
  off += cells * 4
  const classOf = readUint8Array(payload, off, cells)

  const id = `exact-3434-ball-${radius}`
  const ball: ExactBall = {
    mesh: makeTableMesh(id, cells, table),
    cells,
    radius,
    distance,
    table,
    shells,
    inconsistentSteps,
    returnsExactly: true,
  }

  return {
    mesh: makeTableMesh(id, cells, table),
    ball,
    cells,
    radius,
    frontierSlots,
    classOf,
    classConflicts,
    gates: {
      gramExact: true,
      inversionExchangesAntipodes: true,
      oppositeIsKnitOpposite: true,
      consistent: true,
      returnsExactly: true,
      inRange: true,
    },
  }
}

interface SerializedTranslations {
  layerSlots: number[]
  axes: {
    slot: number
    partner: number
    translation: string[]
    inverse: string[]
    twist: string[]
  }[]
  gates: CuspTranslations['gates']
}

function serializeTranslations(t: CuspTranslations): Buffer {
  const wire: SerializedTranslations = {
    layerSlots: [...t.layerSlots],
    axes: t.axes.map(a => ({
      slot: a.slot,
      partner: a.partner,
      translation: a.translation.map(v => v.toString()),
      inverse: a.inverse.map(v => v.toString()),
      twist: a.twist.map(v => v.toString()),
    })),
    gates: { ...t.gates },
  }

  return Buffer.from(JSON.stringify(wire), 'utf8')
}

function parseExactMatrix(raw: unknown): ExactMatrix | null {
  if (!Array.isArray(raw) || raw.length !== MATRIX_LEN) {
    return null
  }

  const entries: readonly unknown[] = raw
  const out: bigint[] = new Array<bigint>(MATRIX_LEN)

  for (let i = 0; i < MATRIX_LEN; i++) {
    const entry = entries[i]

    if (typeof entry !== 'string') {
      return null
    }

    try {
      out[i] = BigInt(entry)
    } catch {
      return null
    }
  }

  return out
}

function deserializeTranslations(buf: Buffer): CuspTranslations | null {
  let parsed: unknown

  try {
    parsed = JSON.parse(buf.toString('utf8'))
  } catch {
    return null
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return null
  }

  const obj = parsed as Record<string, unknown>
  const layerSlotsRaw = obj.layerSlots
  const axesRaw = obj.axes
  const gatesRaw = obj.gates

  if (
    !Array.isArray(layerSlotsRaw) ||
    layerSlotsRaw.length !== 6 ||
    !layerSlotsRaw.every(v => typeof v === 'number' && Number.isInteger(v))
  ) {
    return null
  }

  if (!Array.isArray(axesRaw) || axesRaw.length !== 3) {
    return null
  }

  const axes: CuspTranslations['axes'] = []

  for (const rawAxis of axesRaw) {
    if (typeof rawAxis !== 'object' || rawAxis === null) {
      return null
    }

    const ax = rawAxis as Record<string, unknown>

    if (
      typeof ax.slot !== 'number' ||
      !Number.isInteger(ax.slot) ||
      typeof ax.partner !== 'number' ||
      !Number.isInteger(ax.partner)
    ) {
      return null
    }

    const translation = parseExactMatrix(ax.translation)
    const inverse = parseExactMatrix(ax.inverse)
    const twist = parseExactMatrix(ax.twist)

    if (!translation || !inverse || !twist) {
      return null
    }

    axes.push({
      slot: ax.slot,
      partner: ax.partner,
      translation,
      inverse,
      twist,
    })
  }

  if (typeof gatesRaw !== 'object' || gatesRaw === null) {
    return null
  }

  const g = gatesRaw as Record<string, unknown>
  const gateKeys: (keyof CuspTranslations['gates'])[] = [
    'sixLayerSlots',
    'oneTranslationPerSlot',
    'slotsPairIntoInverses',
    'translationsCommute',
    'twistsInvolutions',
    'twistsCommute',
    'kernelIsTwoZ3',
    'twistsMinusReflections',
  ]

  for (const k of gateKeys) {
    if (g[k] !== true) {
      return null
    }
  }

  return {
    layerSlots: layerSlotsRaw as number[],
    axes,
    gates: {
      sixLayerSlots: true,
      oneTranslationPerSlot: true,
      slotsPairIntoInverses: true,
      translationsCommute: true,
      twistsInvolutions: true,
      twistsCommute: true,
      kernelIsTwoZ3: true,
      twistsMinusReflections: true,
    },
  }
}

export function encodeExactCusp(
  data: ExactCusp,
  offset = DEFAULT_CUSP_OFFSET,
): Buffer {
  const {
    cells,
    period,
    floor,
    floorSlots,
    classConflicts,
    margin,
    depthCounts,
    table,
    distance,
    depth,
    classOf,
    translations,
    gates,
  } = data

  const gatesMask =
    (gates.translations ? 1 : 0) |
    (gates.layerSize ? 2 : 0) |
    (gates.layerDegreeSix ? 4 : 0) |
    (gates.consistent ? 8 : 0) |
    (gates.periodic ? 16 : 0) |
    (gates.returnsExactly ? 32 : 0) |
    (gates.oppositeIsKnitOpposite ? 64 : 0) |
    (gates.marginPositive ? 128 : 0) |
    (gates.connected ? 256 : 0)

  const translationsBuf = serializeTranslations(translations)
  const payloadLen =
    40 +
    depthCounts.length * 4 +
    cells * SLOTS * 4 +
    cells * 4 +
    cells +
    cells +
    translationsBuf.length
  const payload = Buffer.allocUnsafe(payloadLen)
  let off = 0

  payload.writeUInt32LE(cells, off)
  off += 4
  payload.writeUInt32LE(period, off)
  off += 4
  payload.writeUInt32LE(floor, off)
  off += 4
  payload.writeUInt32LE(floorSlots, off)
  off += 4
  payload.writeUInt32LE(classConflicts, off)
  off += 4
  payload.writeUInt32LE(gatesMask, off)
  off += 4
  payload.writeDoubleLE(margin, off)
  off += 8
  payload.writeUInt32LE(depthCounts.length, off)
  off += 4
  payload.writeUInt32LE(translationsBuf.length, off)
  off += 4

  for (const count of depthCounts) {
    payload.writeUInt32LE(count, off)
    off += 4
  }

  off = writeInt32ArrayLE(payload, off, table)
  off = writeInt32ArrayLE(payload, off, distance)
  off = writeUint8Array(payload, off, depth)
  off = writeUint8Array(payload, off, classOf)
  translationsBuf.copy(payload, off)

  return wrapEnvelope(
    KIND_EXACT_CUSP,
    exactCuspKey(period, floor, offset),
    payload,
  )
}

export function decodeExactCusp(
  buf: Buffer,
  expected: { period: number; floor: number; offset?: number },
): ExactCusp | null {
  const theta = expected.offset ?? DEFAULT_CUSP_OFFSET
  const payload = unwrapEnvelope(
    buf,
    KIND_EXACT_CUSP,
    exactCuspKey(expected.period, expected.floor, theta),
  )

  if (payload === null || payload.length < 40) {
    return null
  }

  let off = 0
  const cells = payload.readUInt32LE(off)
  off += 4
  const period = payload.readUInt32LE(off)
  off += 4
  const floor = payload.readUInt32LE(off)
  off += 4
  const floorSlots = payload.readUInt32LE(off)
  off += 4
  const classConflicts = payload.readUInt32LE(off)
  off += 4
  const gatesMask = payload.readUInt32LE(off)
  off += 4
  const margin = payload.readDoubleLE(off)
  off += 8
  const depthCountsLen = payload.readUInt32LE(off)
  off += 4
  const translationsLen = payload.readUInt32LE(off)
  off += 4

  if (
    period !== expected.period ||
    floor !== expected.floor ||
    cells < 1 ||
    gatesMask !== 0x1ff ||
    !Number.isFinite(margin) ||
    margin <= 1e-9
  ) {
    return null
  }

  const expectedPayloadLen =
    40 +
    depthCountsLen * 4 +
    cells * SLOTS * 4 +
    cells * 4 +
    cells +
    cells +
    translationsLen

  if (payload.length !== expectedPayloadLen) {
    return null
  }

  const depthCounts: number[] = []

  for (let i = 0; i < depthCountsLen; i++) {
    depthCounts.push(payload.readUInt32LE(off))
    off += 4
  }

  const table = readInt32ArrayLE(payload, off, cells * SLOTS)
  off += cells * SLOTS * 4
  const distance = readInt32ArrayLE(payload, off, cells)
  off += cells * 4
  const depth = readUint8Array(payload, off, cells)
  off += cells
  const classOf = readUint8Array(payload, off, cells)
  off += cells

  const translations = deserializeTranslations(
    payload.subarray(off, off + translationsLen),
  )

  if (translations === null) {
    return null
  }

  const id = `exact-3434-cusp-${period}-floor-${floor}`

  return {
    mesh: makeTableMesh(id, cells, table),
    cells,
    period,
    floor,
    table,
    depth,
    depthCounts,
    distance,
    floorSlots,
    classOf,
    classConflicts,
    margin,
    translations,
    gates: {
      translations: true,
      layerSize: true,
      layerDegreeSix: true,
      consistent: true,
      periodic: true,
      returnsExactly: true,
      oppositeIsKnitOpposite: true,
      marginPositive: true,
      connected: true,
    },
  }
}

export function readExactBallMeshCache(
  radius: number,
  cacheDir?: string,
): ExactBallMesh | null {
  try {
    const filePath = exactBallCachePath(radius, cacheDir)

    if (!existsSync(filePath)) {
      return null
    }

    return decodeExactBallMesh(readFileSync(filePath), radius)
  } catch {
    return null
  }
}

export function writeExactBallMeshCache(
  data: ExactBallMesh,
  cacheDir?: string,
): boolean {
  try {
    const dir = meshCacheDir(cacheDir)

    mkdirSync(dir, { recursive: true })
    writeFileSync(
      exactBallCachePath(data.radius, cacheDir),
      encodeExactBallMesh(data),
    )

    return true
  } catch {
    return false
  }
}

export function readExactCuspCache(options: {
  period: number
  floor: number
  offset?: number
  cacheDir?: string
}): ExactCusp | null {
  try {
    const filePath = exactCuspCachePath(options, options.cacheDir)

    if (!existsSync(filePath)) {
      return null
    }

    return decodeExactCusp(readFileSync(filePath), options)
  } catch {
    return null
  }
}

export function writeExactCuspCache(
  data: ExactCusp,
  options?: { offset?: number; cacheDir?: string },
): boolean {
  try {
    const dir = meshCacheDir(options?.cacheDir)

    mkdirSync(dir, { recursive: true })
    writeFileSync(
      exactCuspCachePath(
        { period: data.period, floor: data.floor, offset: options?.offset },
        options?.cacheDir,
      ),
      encodeExactCusp(data, options?.offset),
    )

    return true
  } catch {
    return false
  }
}

export type CachedExactBall = ExactBallMesh & {
  readonly table: Int32Array
  readonly distance: Int32Array
  readonly shells: number[]
  readonly shellCounts: number[]
}

export function cachedExactBall(
  radius: number,
  options?: { cacheDir?: string },
): CachedExactBall {
  let result: ExactBallMesh

  if (options?.cacheDir !== undefined) {
    const hit = readExactBallMeshCache(radius, options.cacheDir)

    if (hit !== null) {
      result = hit
    } else {
      result = exactBallMesh({ radius, cache: false })
      writeExactBallMeshCache(result, options.cacheDir)
    }
  } else {
    result = exactBallMesh({ radius, cache: true })
  }

  return {
    ...result,
    table: result.ball.table,
    distance: result.ball.distance,
    shells: result.ball.shells,
    shellCounts: result.ball.shells,
  }
}

export type CachedExactCusp = ExactCusp & {
  readonly layerSize: number
}

export function cachedExactCusp(options: {
  period: number
  floor: number
  offset?: number
  cacheDir?: string
}): CachedExactCusp {
  let result: ExactCusp

  if (options.cacheDir !== undefined) {
    const hit = readExactCuspCache(options)

    if (hit !== null) {
      result = hit
    } else {
      result = buildExactCusp({
        period: options.period,
        floor: options.floor,
        offset: options.offset,
        cache: false,
      })
      writeExactCuspCache(result, {
        offset: options.offset,
        cacheDir: options.cacheDir,
      })
    }
  } else {
    result = buildExactCusp({
      period: options.period,
      floor: options.floor,
      offset: options.offset,
      cache: true,
    })
  }

  return {
    ...result,
    layerSize: result.depthCounts[0] ?? 0,
  }
}
