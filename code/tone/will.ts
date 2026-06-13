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

// the total tone over the whole mesh, the conserved charge.
export function charge(will: Will): number {
  let sum = 0
  const data = will.data
  for (let index = 0; index < data.length; index++) sum += data[index] ?? 0
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
