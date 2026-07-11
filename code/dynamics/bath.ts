import { Will } from '@/code/tone/will'

// Boundary operations that model the OPEN or GROWING substrate on a finite lattice. The bulk rule is untouched,
// these act only at the edge, standing in for the infinite lattice (radiation leaves and never returns) and for
// growth (new cells born at peace at the frontier).

// the side length of a 4D side^4 lattice from its cell count.
function sideOf(will: Will): number {
  return Math.round(Math.pow(will.mesh.cellCount, 1 / 4))
}

// is a cell on the boundary shell, any of its four coordinates at the lattice edge (0 or side-1).
export function isBoundaryCell(cell: number, side: number): boolean {
  const x = cell % side
  const y = Math.floor(cell / side) % side
  const z = Math.floor(cell / (side * side)) % side
  const w = Math.floor(cell / (side * side * side)) % side

  return (
    x === 0 ||
    x === side - 1 ||
    y === 0 ||
    y === side - 1 ||
    z === 0 ||
    z === side - 1 ||
    w === 0 ||
    w === side - 1
  )
}

// the absorbing boundary (the bath), set every boundary cell to peace, whatever radiated to the edge has left to
// infinity and does not return. Call after each beat. A closed system simply does not call this.
export function absorbBoundary(will: Will): void {
  const side = sideOf(will)
  const degree = will.mesh.degree

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    if (isBoundaryCell(cell, side)) {
      const base = cell * degree

      for (let d = 0; d < degree; d++) {
        will.data[base + d] = 0
      }
    }
  }
}

// growth, a frontier slab (cells at a fixed x-coordinate) born at peace each beat, a low-entropy source that
// gives the open system its arrow and keeps the bath empty.
export function frontierToPeace(will: Will, frontierX: number): void {
  const side = sideOf(will)
  const degree = will.mesh.degree

  for (let cell = 0; cell < will.mesh.cellCount; cell++) {
    if (cell % side === frontierX) {
      const base = cell * degree

      for (let d = 0; d < degree; d++) {
        will.data[base + d] = 0
      }
    }
  }
}
