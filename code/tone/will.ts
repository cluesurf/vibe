import { Mesh } from '@/code/tool/mesh'

export type Tone = -1 | 0 | 1

// The will of the mesh: one ternary tone per cell per direction, the full
// directional fill. The data is laid out as data[cell * degree + direction].
// This is the entire state of the world, with nothing stored anywhere else.
export type Will = {
  readonly mesh: Mesh
  readonly data: Int8Array
}

export function makeWill(mesh: Mesh): Will {
  return { mesh, data: new Int8Array(mesh.cellCount * mesh.degree) }
}

export function cloneWill(will: Will): Will {
  return { mesh: will.mesh, data: will.data.slice() }
}

// Fill every slot with a deterministic structured ternary pattern. The base is
// deterministic, never random, so a test initial condition is a fixed function of
// the slot index, not a pseudo-random draw. `phase` shifts the pattern for a second
// independent (still deterministic) initial condition.
export function fillWillPattern(will: Will, phase = 0): void {
  for (let index = 0; index < will.data.length; index++) {
    will.data[index] = ((index + phase) % 3) - 1
  }
}

// Fill every slot of a periodic 4D mesh of the given side with a deterministic texture that
// depends on all four cell coordinates and the slot: phase = (x + 2y + 3z + 5w + d) mod 7,
// tone = (phase mod 3) - 1. Two gravity experiments each carried this.
export function fillCoordinateTexture(will: Will, side: number): void {
  const { mesh, data } = will

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const x = cell % side
    const y = Math.floor(cell / side) % side
    const z = Math.floor(cell / (side * side)) % side
    const w = Math.floor(cell / (side * side * side)) % side

    for (let d = 0; d < mesh.degree; d++) {
      const phase = (x + 2 * y + 3 * z + 5 * w + d) % 7

      data[cell * mesh.degree + d] = (phase % 3) - 1
    }
  }
}

// Fill one slot of every cell with a PERIODIC function of one coordinate, and the remaining slots
// with a fixed flux-carrying pattern. `pattern` is the repeating run of tone values written into the
// target slot, indexed by the cell's coordinate along `axis` modulo the pattern length.
//
// This exists because whether a coarse conservation test can SEE a violation turns on the periodic
// structure of the quantity being violated. A sink that removes one slot destroys, per block, the sum
// of that slot's pattern over the block, so the pattern's period and its per-period sum are the two
// controls that decide whether the loss cancels inside a block or survives to be measured. Making
// them explicit parameters is what turns that from an accident of a fill into something testable.
export function fillPeriodicSlot(input: {
  will: Will
  meshSide: number
  slot: number
  axis: number
  pattern: readonly number[]
  otherAxis?: number
}): void {
  const { will, meshSide, slot, axis, pattern, otherAxis = 1 } = input
  const degree = will.mesh.degree
  const period = pattern.length

  const coordinate = (cell: number, which: number): number =>
    Math.floor(cell / meshSide ** which) % meshSide

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    for (let d = 0; d < degree; d++) {
      will.data[cell * degree + d] =
        d === slot
          ? pattern[coordinate(cell, axis) % period]!
          : ((coordinate(cell, otherAxis) + d) % 3) - 1
    }
  }
}

// A single charge at one cell pointing one direction, the minimal deterministic test structure.
export function loneParticle(
  mesh: Mesh,
  cell: number,
  direction: number,
  tone: Tone = 1,
): Will {
  const will = makeWill(mesh)

  will.data[cell * mesh.degree + direction] = tone

  return will
}

// A co-moving glider, `length` charges of one tone all in direction `direction`, on consecutive cells along
// that line so they stream together as one structure. Returns the will and the line of cells it occupies.
export function gliderLine(input: {
  mesh: Mesh
  start: number
  direction: number
  tone?: Tone
  length: number
}): { will: Will; cells: number[] } {
  const { mesh, start, direction, length } = input
  const tone = input.tone ?? 1
  const will = makeWill(mesh)
  const cells: number[] = []

  let cell = start

  for (let index = 0; index < length; index++) {
    will.data[cell * mesh.degree + direction] = tone
    cells.push(cell)
    cell = mesh.neighbour(cell, direction)
  }

  return { will, cells }
}

// the total tone over the whole mesh, the conserved charge.
export function charge(will: Will): number {
  let sum = 0

  const data = will.data

  for (const value of data) {
    sum += value ?? 0
  }

  return sum
}

// the scalar tone of one cell, the sum of its directional slots (the NET charge, which can be
// zero even when the cell is full of tone, because opposite slots cancel).
export function cellTone(will: Will, cell: number): number {
  const degree = will.mesh.degree
  const base = cell * degree

  let sum = 0

  for (let direction = 0; direction < degree; direction++) {
    sum += will.data[base + direction] ?? 0
  }

  return sum
}

// the activity of one cell, the total tone MAGNITUDE summed over its directional slots. Unlike
// the net charge (cellTone), this is the amount of distinction present at the cell, and it is
// nonzero whenever any slot is occupied, even for a charge-balanced cell. This is the right
// distinguishable content for a Fisher-Rao distribution.
export function cellActivity(will: Will, cell: number): number {
  const degree = will.mesh.degree
  const base = cell * degree

  let sum = 0

  for (let direction = 0; direction < degree; direction++) {
    sum += Math.abs(will.data[base + direction] ?? 0)
  }

  return sum
}
