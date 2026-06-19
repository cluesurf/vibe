import { Mesh } from '@/code/tool/mesh'

export type Tone = -1 | 0 | 1

// The will of the mesh: one ternary tone per cell per direction, the full
// directional fill. The data is laid out as data[cell * degree + direction].
// This is the entire state of the world, with nothing stored anywhere else.
export interface Will {
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
  for (let index = 0; index < data.length; index++)
    sum += data[index] ?? 0
  return sum
}

// the scalar tone of one cell, the sum of its directional slots.
export function cellTone(will: Will, cell: number): number {
  const degree = will.mesh.degree
  const base = cell * degree
  let sum = 0
  for (let direction = 0; direction < degree; direction++) {
    sum += will.data[base + direction] ?? 0
  }
  return sum
}
