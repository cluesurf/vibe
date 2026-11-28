// THE EXACT TUBE (E-SLF-0198): every dock of the {3,4,3,4} honeycomb within `radius`
// facet steps of a segment of one mesh line, in exact Z[sqrt 2] arithmetic. A ball centred on one dock cannot hold a
// self spread along a line (the R = 4 ball holds 9 docks of the line through its centre), and a ball wide enough for
// 23 docks would hold more docks than any run can store. The tube holds the segment and its light cone only.
//
// THE BUILD is buildExactBall's (code/substrate/coxeter/exact-3434), unchanged but for its seeds: the frames of the
// segment's docks, g_p = k_dir^p (p > 0) and k_opp^(-p) (p < 0), all at distance 0, then breadth-first over frames
// g -> g k_a with a cell keyed by its exact centre and checked by its chamber point. A mesh line keeps its slot label
// (the stream copies slot d of dock x to slot d of the dock beyond facet d), so walking slot `dir` from dock 0 walks
// the line. Docks are numbered seeds first (position 0 is dock 0, then 1..to, then -1..from), then breadth-first.
//
// THE GATES are the ball's (labelled Gram exact, the inversion exchanges antipodes, the opposite labels are
// OPPOSITE, 0 inconsistent steps, every in-tube step returns by its opposite slot, every slot in range or -1) and two
// of the tube's own: the seeds are distinct cells, and from each seed slot `dir` reaches the next seed.
//
// NOTHING MOVES: this file builds a table.

import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  exactCell,
  matrixProduct,
  matrixVector,
  type ExactCell,
  type ExactMatrix,
} from '@/code/substrate/coxeter/exact-3434'
import { type Mesh } from '@/code/tool/mesh'

const SLOTS = 24
const DIM = 5

export type ExactTube = {
  readonly mesh: Mesh
  readonly cells: number
  readonly radius: number
  readonly dir: number
  readonly from: number
  readonly to: number
  // cells * 24, -1 for a neighbour outside the tube
  readonly table: Int32Array
  // facet steps from the segment
  readonly distance: Int32Array
  readonly shells: number[]
  // the segment: line position -> dock and dock -> line position
  readonly dockAt: ReadonlyMap<number, number>
  readonly pos: ReadonlyMap<number, number>
  readonly frontierSlots: number
  readonly gates: {
    gramExact: boolean
    inversionExchangesAntipodes: boolean
    oppositeIsKnitOpposite: boolean
    consistent: boolean
    returnsExactly: boolean
    inRange: boolean
    seedsDistinct: boolean
    lineWalk: boolean
  }
}

const keyOf = (values: readonly bigint[]): string => values.join(',')

function identityMatrix(): ExactMatrix {
  const m = new Array<bigint>(2 * DIM * DIM).fill(0n)

  for (let i = 0; i < DIM; i++) {
    m[2 * (i * DIM + i)] = 1n
  }

  return m
}

export function exactTube(input: {
  dir: number
  from: number
  to: number
  radius: number
  cell?: ExactCell
}): ExactTube {
  const { dir, from, to, radius } = input

  if (!(from <= 0 && to >= 0 && Number.isInteger(from) && Number.isInteger(to))) {
    throw new Error(`exactTube: the segment ${from}..${to} must hold position 0`)
  }

  if (!(Number.isInteger(radius) && radius >= 0)) {
    throw new Error(`exactTube: radius ${radius} is not a count`)
  }

  const cell = input.cell ?? exactCell()
  const back = OPPOSITE[dir]!
  const stepCenter = cell.transports.map(k => matrixVector(k, cell.center))
  const stepChamber = cell.transports.map(k => matrixVector(k, cell.chamberPoint))

  // the seeds: position 0, then 1..to, then -1..from
  const seedFrames: { p: number; g: ExactMatrix }[] = [{ p: 0, g: identityMatrix() }]

  for (let p = 1; p <= to; p++) {
    seedFrames.push({ p, g: matrixProduct(seedFrames[seedFrames.length - 1]!.g, cell.transports[dir]!) })
  }

  let g = seedFrames[0]!.g

  for (let p = -1; p >= from; p--) {
    g = matrixProduct(g, cell.transports[back]!)
    seedFrames.push({ p, g })
  }

  const frames: (ExactMatrix | undefined)[] = []
  const chamberKeys: string[] = []
  const distance: number[] = []
  const index = new Map<string, number>()
  const dockAt = new Map<number, number>()
  const pos = new Map<number, number>()

  let seedsDistinct = true

  for (const s of seedFrames) {
    const key = keyOf(matrixVector(s.g, cell.center))

    if (index.has(key)) {
      seedsDistinct = false
      continue
    }

    const id = frames.length

    index.set(key, id)
    frames.push(s.g)
    chamberKeys.push(keyOf(matrixVector(s.g, cell.chamberPoint)))
    distance.push(0)
    dockAt.set(s.p, id)
    pos.set(id, s.p)
  }

  const rows: Int32Array[] = []

  let inconsistentSteps = 0

  for (let head = 0; head < frames.length; head++) {
    const f = frames[head]!
    const row = new Int32Array(SLOTS).fill(-1)
    const here = distance[head]!

    for (let k = 0; k < SLOTS; k++) {
      const key = keyOf(matrixVector(f, stepCenter[k]!))
      const chamber = keyOf(matrixVector(f, stepChamber[k]!))

      let id = index.get(key)

      if (id === undefined && here < radius) {
        id = frames.length
        index.set(key, id)
        frames.push(matrixProduct(f, cell.transports[k]!))
        chamberKeys.push(chamber)
        distance.push(here + 1)
      } else if (id !== undefined && chamberKeys[id] !== chamber) {
        inconsistentSteps++
      }

      row[k] = id ?? -1
    }

    rows.push(row)
    frames[head] = undefined
  }

  const cells = rows.length
  const table = new Int32Array(cells * SLOTS)

  rows.forEach((row, c) => table.set(row, c * SLOTS))

  let returnsExactly = true
  let inRange = true
  let frontierSlots = 0

  for (let c = 0; c < cells; c++) {
    for (let k = 0; k < SLOTS; k++) {
      const n = table[c * SLOTS + k]!

      if (n < 0) {
        frontierSlots++
        inRange &&= n === -1
        continue
      }

      inRange &&= n < cells

      const b = table[n * SLOTS + cell.opposite[k]!]!

      if (b >= 0 && b !== c) {
        returnsExactly = false
      }
    }
  }

  let lineWalk = true

  for (let p = from; p < to; p++) {
    const x = dockAt.get(p)
    const y = dockAt.get(p + 1)

    lineWalk &&= x !== undefined && y !== undefined && table[x * SLOTS + dir] === y && table[y * SLOTS + back] === x
  }

  const shells: number[] = []

  for (const d of distance) {
    shells[d] = (shells[d] ?? 0) + 1
  }

  const gates = {
    gramExact: cell.gramExact,
    inversionExchangesAntipodes: cell.inversionExchangesAntipodes,
    oppositeIsKnitOpposite: cell.opposite.length === SLOTS && cell.opposite.every((o, k) => o === OPPOSITE[k]),
    consistent: inconsistentSteps === 0,
    returnsExactly,
    inRange,
    seedsDistinct,
    lineWalk,
  }

  const mesh: Mesh = {
    id: `exact-3434-tube-${dir}-${from}-${to}-${radius}`,
    degree: SLOTS,
    cellCount: cells,
    neighbour(c, direction) {
      return table[c * SLOTS + direction] ?? -1
    },
    opposite(direction) {
      return OPPOSITE[direction] ?? direction
    },
  }

  return {
    mesh,
    cells,
    radius,
    dir,
    from,
    to,
    table,
    distance: Int32Array.from(distance),
    shells,
    dockAt,
    pos,
    frontierSlots,
    gates,
  }
}
