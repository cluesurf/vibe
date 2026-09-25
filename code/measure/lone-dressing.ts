// A lone tone's dressing, followed sparsely: the slots where a run seeded with one extra vibe differs from
// the empty vacuum's run, beat by beat.
//
// The vacuum born empty stays the same in every cell, since every cell collides alike and streaming moves
// equal values, so it is one cell's 24 slots evolved by the collision alone. The seeded run differs from it
// only on a finite set of cells, and a cell that holds the vacuum's state collides into the vacuum's next
// state, so only the differing cells are collided and streamed. It gives exactly what the dense
// instrument of E-FRC-0125 gives (difference(seeded, vacuum) after every beat), at a cost set by the
// support rather than the box, and it also sorts the differing slots:
// - hole: the seeded run is calm where the vacuum holds a vibe
// - extra: the seeded run holds a vibe where the vacuum is calm
// - flip: both hold vibes of opposite sign
// The seeded run carries one more unit of charge than the vacuum, so extra - hole is odd, and
// (extra - hole - 1) / 2 is the number of pairs the lone tone has left made beyond the vacuum's own.

import { type Collision } from '@/code/rule/collision'
import { type Mesh } from '@/code/tool/mesh'

export type DressingBeat = {
  readonly support: number
  readonly hole: number
  readonly extra: number
  readonly flip: number
  readonly cells: number
}

export function neighbourTable(mesh: Mesh): Int32Array {
  const table = new Int32Array(mesh.cellCount * mesh.degree)

  for (let x = 0; x < mesh.cellCount; x++) {
    for (let d = 0; d < mesh.degree; d++) {
      table[x * mesh.degree + d] = mesh.neighbour(x, d)
    }
  }

  return table
}

// the vacuum's one-cell state after each beat, from empty
export function vacuumCells(input: { forward: (t: number) => Collision; beats: number; degree?: number }): Int8Array[] {
  const degree = input.degree ?? 24
  const out: Int8Array[] = []
  const cell = new Int8Array(degree)

  for (let t = 0; t < input.beats; t++) {
    input.forward(t)(cell, 0, degree)
    out.push(Int8Array.from(cell))
  }

  return out
}

export function loneDressing(input: {
  neighbours: Int32Array
  forward: (t: number) => Collision
  vacuum: readonly Int8Array[]
  cell: number
  direction: number
  beats: number
  tone?: number
  // stop after the beat where this holds of (beat, support): the later beats are then not reported
  stop?: (t: number, support: number) => boolean
  // called after every beat with the cells that differ from the vacuum and their states
  watch?: (t: number, live: ReadonlyMap<number, Int8Array>, vacuum: Int8Array) => void
}): DressingBeat[] {
  const { neighbours, forward, vacuum, cell, direction, beats, stop } = input
  const degree = 24
  const out: DressingBeat[] = []
  const seed = new Int8Array(degree)

  seed[direction] = input.tone ?? 1

  let live = new Map<number, Int8Array>([[cell, seed]])

  for (let t = 0; t < beats; t++) {
    const collision = forward(t)
    const vac = vacuum[t] ?? new Int8Array(degree)
    const next = new Map<number, Int8Array>()

    let support = 0
    let hole = 0
    let extra = 0
    let flip = 0

    for (const [x, state] of live) {
      collision(state, 0, degree)

      for (let d = 0; d < degree; d++) {
        const v = state[d] ?? 0
        const u = vac[d] ?? 0

        if (v === u) {
          continue
        }

        const y = neighbours[x * degree + d] ?? 0

        let target = next.get(y)

        if (!target) {
          target = Int8Array.from(vac)
          next.set(y, target)
        }

        target[d] = v
        support++
        hole += v === 0 ? 1 : 0
        extra += u === 0 ? 1 : 0
        flip += v !== 0 && u !== 0 ? 1 : 0
      }
    }

    live = next
    out.push({ support, hole, extra, flip, cells: next.size })
    input.watch?.(t, live, vac)

    if (stop?.(t, support)) {
      break
    }
  }

  return out
}
