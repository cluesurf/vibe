import { Will, cellTone } from '@/code/tone/will'
import { Collision } from '@/code/rule/collision'
import { beat } from '@/code/rule/lattice-gas'
import { shellDistances } from '@/code/tool/mesh'

// Structure diagnostics on a will, the shared measures the lattice-gas experiments read off a state: which
// cells carry charge, how many connected clusters they form, how spread out they are, how far they have
// travelled, and the total momentum. Reusable, so they live in code, not in any one experiment.

// the set of cells holding at least one nonzero slot.
export function occupiedSet(will: Will): Set<number> {
  const mesh = will.mesh
  const degree = mesh.degree
  const set = new Set<number>()
  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const base = cell * degree
    for (let direction = 0; direction < degree; direction++) {
      if (will.data[base + direction] !== 0) {
        set.add(cell)
        break
      }
    }
  }

  return set
}

// the number of cells holding charge, the coarsest localization measure.
export function occupiedCells(will: Will): number {
  return occupiedSet(will).size
}

// the number of connected clusters among the occupied cells, adjacency by the mesh coin. One tight cluster is a
// bound composite, two or more separated clusters mean the structures parted (pass-through or scatter).
export function componentCount(will: Will): number {
  const mesh = will.mesh
  const occupied = occupiedSet(will)
  const seen = new Set<number>()
  let components = 0
  for (const start of occupied) {
    if (seen.has(start)) {
      continue
    }

    components++
    const stack = [start]
    seen.add(start)
    while (stack.length > 0) {
      const cell = stack.pop()!
      for (let direction = 0; direction < mesh.degree; direction++) {
        const next = mesh.neighbour(cell, direction)
        if (occupied.has(next) && !seen.has(next)) {
          seen.add(next)
          stack.push(next)
        }
      }
    }
  }

  return components
}

// the spread of the occupied set, the max graph distance from one occupied cell to any other (an eccentricity,
// within a factor of the true diameter). Small for a tight structure, large for a dispersed one.
export function diameter(will: Will): number {
  const occupied = [...occupiedSet(will)]
  if (occupied.length <= 1) {
    return 0
  }

  const dist = shellDistances(will.mesh, occupied[0]!)
  let max = 0
  for (const cell of occupied) {
    if (dist[cell]! > max) {
      max = dist[cell]!
    }
  }

  return max
}

// the distance the charge has reached from a start cell, the max graph distance over all nonzero cells. The
// signature of ballistic travel (it grows with the beat count) versus pinning (it stays near zero).
export function travelDistance(input: {
  will: Will
  start: number
}): number {
  const dist = shellDistances(input.will.mesh, input.start)
  let max = 0
  for (let cell = 0; cell < input.will.mesh.cellCount; cell++) {
    if (cellTone(input.will, cell) !== 0 && dist[cell]! > max) {
      max = dist[cell]!
    }
  }

  return max
}

// the maximum occupied-cell count reached over a run, phase-independent (the create cycle breathes globally, so
// a single snapshot is phase-dependent, but the max over the trajectory robustly flags an active vacuum).
export function maxOccupancy(
  will: Will,
  collision: Collision,
  beats: number,
): number {
  let current: Will = { mesh: will.mesh, data: will.data.slice() }
  let max = occupiedCells(current)
  for (let step = 0; step < beats; step++) {
    current = beat(current, collision)
    const count = occupiedCells(current)
    if (count > max) {
      max = count
    }
  }

  return max
}

// the total momentum of a will, the vector sum of tone times direction-root over every slot. `roots` is the
// coin's root list (rootsD4, rootsB4), so the same measure works on any coin.
export function momentum(
  will: Will,
  roots: number[][],
): [number, number, number, number] {
  const m: [number, number, number, number] = [0, 0, 0, 0]
  const degree = will.mesh.degree
  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    const base = cell * degree
    for (let direction = 0; direction < degree; direction++) {
      const tone = will.data[base + direction] ?? 0
      if (tone !== 0) {
        const root = roots[direction]!
        for (let axis = 0; axis < 4; axis++) {
          m[axis]! += tone * (root[axis] ?? 0)
        }
      }
    }
  }

  return m
}
