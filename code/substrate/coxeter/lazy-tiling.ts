// A LAZY, effectively infinite walkable tiling for any regular symbol {p,q} (and {p,q,r}). It grows the cell
// graph ON DEMAND as a walker visits cells, never enumerating a fixed batch up front, so you can walk forever
// and far-away cells materialize exactly when you reach them. This is the HyperRogue-class lazy generation
// (the same on-demand mechanism the verified exact {5,3,4} engine in cell-scale.ts proves), generalized to
// any symbol in floating point, with cells deduplicated by their center key. The maximally-optimal Margenstern
// integer-address form is the Phase 2 replacement that drops in behind the same TileSource seam.
//
// Each cell is tracked by its group matrix g (center = g * c0), and its facet neighbors are g * faces[i] for
// the shared face reflections. In 2D the neighbors are then ordered cyclically (counterclockwise) around the
// cell center so the spin is the cyclic edge index a cellwalker expects. See
// note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

import { coxeterCellFrame } from '@/code/substrate/coxeter/frame'
import {
  Mat,
  matMul,
  matVec,
  toPoincare,
  pointKey,
  identity,
} from '@/code/substrate/coxeter/minkowski'
import { mobiusAdd, negate } from '@/code/render/geometry/isometry'
import type { TileSource, FaceStep } from '@/code/substrate/tile-source'

type CellRecord = {
  readonly matrix: Mat // the group element g, center = g * c0
  readonly center: number[] // the cell center in the Poincare ball/disk
  spin: number[] | null // spin -> neighbor cell id, cyclically ordered, computed lazily on first expand
}

export function makeLazyTiling(input: {
  symbol: number[]
}): TileSource {
  const symbol = input.symbol
  const frame = coxeterCellFrame(symbol)
  const { faces, center: c0, timeAxis } = frame
  const ballDim = frame.dim - 1
  const twoD = ballDim === 2

  const records: CellRecord[] = []
  const idOf = new Map<string, number>()

  // find or create the cell at this group matrix, deduplicated by its center key
  function intern(matrix: Mat): number {
    const center = toPoincare(matVec(matrix, c0), timeAxis)
    const key = pointKey(center)
    const existing = idOf.get(key)

    if (existing !== undefined) {
      return existing
    }

    const id = records.length
    idOf.set(key, id)
    records.push({ matrix, center, spin: null })

    return id
  }

  // the cyclic angle of a neighbor as seen from a cell center, by translating the cell center to the origin
  // (an exact hyperbolic isometry) and reading the Euclidean angle of the neighbor there
  function angleFrom(
    cellCenter: number[],
    neighborCenter: number[],
  ): number {
    const local = mobiusAdd(negate(cellCenter), neighborCenter)

    return Math.atan2(local[1] ?? 0, local[0] ?? 0)
  }

  // materialize a cell's ordered neighbor list (its edges), creating neighbor cells as needed
  function expand(cell: number): number[] {
    const record = records[cell]!

    if (record.spin) {
      return record.spin
    }

    const neighbors: { id: number; angle: number }[] = []

    for (let i = 0; i < faces.length; i++) {
      const neighborMatrix = matMul(record.matrix, faces[i]!)
      const id = intern(neighborMatrix)

      if (id === cell) {
        continue
      } // a face that folds back onto the cell itself (degenerate), skip

      const angle = twoD
        ? angleFrom(record.center, records[id]!.center)
        : i

      if (!neighbors.some(n => n.id === id)) {
        neighbors.push({ id, angle })
      }
    }

    // 2D, order the edges counterclockwise so spin is the cyclic edge index. 3D, keep the face-index order.
    if (twoD) {
      neighbors.sort((a, b) => a.angle - b.angle)
    }

    const spin = neighbors.map(n => n.id)
    record.spin = spin

    return spin
  }

  const origin = intern(identity(frame.dim))

  function step(cell: number, spin: number): FaceStep {
    const here = expand(cell)
    const degree = here.length
    const neighbor = here[((spin % degree) + degree) % degree]!
    const there = expand(neighbor)
    const back = there.indexOf(cell)

    return { cell: neighbor, back, mirror: false }
  }

  return {
    symbol: symbol.slice(),
    origin,
    degree: (cell: number): number => expand(cell).length,
    position: (cell: number): number[] => records[cell]!.center,
    step,
    get size(): number {
      return records.length
    },
  }
}
