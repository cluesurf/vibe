// Per-cell PATTERN labels for a Margenstern-addressed tiling (HyperRogue's patterninfo). A pattern is a
// coloring that repeats coherently across the tiling because it is read off the tile's ADDRESS, not its
// position, so the same rule paints every congruent cell the same way. These labels drive coherent face
// colorings and give the cellular-automaton capstone its symmetry classes. See
// note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

import type { MargensternGrid } from '@/code/substrate/margenstern/grid'

export type PatternScheme =
  | 'sector' // which of the central cell's subtrees the tile lives in (the angular sector)
  | 'node' // the splitting node type, white (3-node) vs black (2-node)
  | 'ring' // the breadth-first depth from the center (concentric rings)
  | 'characteristic' // the last digit of the Zeckendorf word (Margenstern's characteristic chi)

// the pattern class index of a cell under a scheme (a small non-negative integer, the color slot)
export function patternClass(
  grid: MargensternGrid,
  cell: number,
  scheme: PatternScheme,
): number {
  switch (scheme) {
    case 'sector': {
      const address = grid.address(cell)

      return address.length === 0 ? 0 : address[0]! + 1 // 0 = the center, 1.. = each sector
    }

    case 'node':
      return grid.color(cell) === 'white'
        ? 0
        : grid.color(cell) === 'black'
          ? 1
          : 2
    case 'ring':
      return grid.depth(cell)

    case 'characteristic': {
      const z = grid.zeckendorf(cell)

      return z.endsWith('0') ? 0 : 1
    }
  }
}

// how many distinct classes a scheme uses across the grid (for sizing a palette)
export function patternClassCount(
  grid: MargensternGrid,
  scheme: PatternScheme,
): number {
  let max = 0

  for (let c = 0; c < grid.size; c++) {
    max = Math.max(max, patternClass(grid, c, scheme))
  }

  return max + 1
}
