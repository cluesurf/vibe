// The cellwalker, a turtle on a tiling, the single navigation primitive HyperRogue is built around and the
// one all our distance, pattern, and CA-on-a-tiling code will use. A cellwalker is a cell, a SPIN (which edge
// it currently faces, the cyclic edge index), and a MIRROR bit (its handedness). From these three you can walk
// the whole infinite tiling without ever storing it, just step and turn.
//
// It rides on a TileSource, so the SAME walker drives a lazy infinite {7,3}, an eager finite cell graph, or a
// future Margenstern address grid. See note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

import type { TileSource } from '@/code/substrate/tile-source'

export interface CellWalker {
  // the cell the walker stands on
  readonly cell: number
  // which edge the walker faces, the cyclic edge index 0..degree-1
  readonly spin: number
  // the walker's handedness, flipped each time it crosses a mirror edge (non-orientable tilings only)
  readonly mirror: boolean
}

// a fresh walker on a cell, facing edge `spin` (default 0)
export function cellWalker(
  cell: number,
  spin = 0,
  mirror = false,
): CellWalker {
  return { cell, spin, mirror }
}

// turn in place by `turns` edges, counterclockwise for a right-handed walker, clockwise for a mirrored one
export function rotate(
  source: TileSource,
  walker: CellWalker,
  turns: number,
): CellWalker {
  const degree = source.degree(walker.cell)
  const delta = walker.mirror ? -turns : turns
  const spin = (((walker.spin + delta) % degree) + degree) % degree

  return { cell: walker.cell, spin, mirror: walker.mirror }
}

// step forward across the faced edge, re-seating the spin to point back the way it came (the HyperRogue
// `wstep`). This is an involution, wstep(wstep(w)) === w.
export function wstep(
  source: TileSource,
  walker: CellWalker,
): CellWalker {
  const next = source.step(walker.cell, walker.spin)

  return {
    cell: next.cell,
    spin: next.back,
    mirror: walker.mirror !== next.mirror,
  }
}

// flip the walker's handedness in place (face the same edge from the mirror side)
export function flip(walker: CellWalker): CellWalker {
  return {
    cell: walker.cell,
    spin: walker.spin,
    mirror: !walker.mirror,
  }
}

// step forward then turn, the common "move into the cell ahead and face along its corridor" motion
export function wstepRotate(
  source: TileSource,
  walker: CellWalker,
  turns: number,
): CellWalker {
  return rotate(source, wstep(source, walker), turns)
}

// the cells touching the current cell's vertex that the faced edge starts from, walked by going around the
// vertex (step out, turn one edge, repeat) until the walker returns. Returns the ring of cells around that
// vertex, the q cells of a {p,q} vertex figure.
export function vertexRing(
  source: TileSource,
  walker: CellWalker,
): number[] {
  const ring: number[] = []
  let current = walker
  const startCell = walker.cell
  const startSpin = walker.spin
  for (let i = 0; i < 64; i++) {
    current = wstepRotate(source, current, 1)
    ring.push(current.cell)
    if (current.cell === startCell && current.spin === startSpin) {
      break
    }
  }

  return ring
}
