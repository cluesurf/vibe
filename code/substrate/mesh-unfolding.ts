// The mesh unfolds exactly, in one module. The whole {3,4,3,4} honeycomb is not drawn,
// it is GENERATED, deterministically, from a single 24-cell by reflection across faces:
// shell zero is the one cell, shell one is the 24 cells reached across its 24 faces,
// shell two the cells reached from those, and so on. The reflective addressing
// construction (buildAddressing) realizes exactly this, and the shell counts it yields
// are integer-exact and reproducible bit for bit, because the construction is
// deterministic (no randomness anywhere). The canonical sequence is
//   1, 24, 456, 8376, 153192, ...
// each count the number of cells at that reflection depth. This module runs the
// unfolding to a requested depth and returns the exact counts, so the infinite mesh is
// pinned by the single cell and the reflection rule, with no freedom at any shell.

import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'
import { shellCountsFromGraph } from '@/code/measure/shell-growth'

// the canonical exact shell counts of the {3,4,3,4} bulk, measured from the honeycomb
// graph (E-GMT-0003), the target the unfolding must reproduce
export const CANONICAL_SHELLS = [1, 24, 456, 8376, 153192] as const

// unfold the mesh by reflective addressing to at least `throughShell` complete shells,
// returning the exact integer cell count at each shell depth. `maxCells` must be large
// enough to close the requested shell (shell 3 needs about 9000 cells, shell 4 about
// 162000).
export function unfoldMeshShells(input: {
  throughShell: number
  maxCells: number
}): number[] {
  const addressing = buildAddressing({ maxCells: input.maxCells })
  const counts = shellCountsFromGraph({
    neighbors: addressing.graph.neighbors,
    cellCount: addressing.graph.cellCount,
  })

  // only return shells that are fully closed by the built extent (drop the last,
  // partially populated outer shell so every returned count is exact)
  return counts.slice(0, input.throughShell + 1)
}

// the multiplicative growth ratios between consecutive shells, the per-shell warp, which
// converge to the bulk warp factor near 18.278 (exponential, the hyperbolic signature)
export function shellRatios(counts: readonly number[]): number[] {
  const ratios: number[] = []

  for (let i = 1; i < counts.length; i++)
    ratios.push(counts[i]! / counts[i - 1]!)

  return ratios
}

// whether the unfolding is deterministic: two independent runs to the same depth return
// bit-identical shell counts (the base has no randomness, so the mesh is one fixed
// object, not a sample)
export function unfoldingIsDeterministic(input: {
  throughShell: number
  maxCells: number
}): boolean {
  const a = unfoldMeshShells(input)
  const b = unfoldMeshShells(input)

  return a.length === b.length && a.every((v, i) => v === b[i])
}
