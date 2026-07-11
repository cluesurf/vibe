// The Coxeter CELL frame for a Schlafli symbol, the shared setup every cell engine needs, the mirror frame,
// the cell stabilizer H (the finite group fixing the cell center), the FACE reflections (the H-orbit of the
// outer generator, one per facet), and the cell center c0. This is lifted out of cell-direct's buildCellGraph
// (which now calls it) so the eager builder, the horosphere band, and the LAZY walker all share one exact
// construction, no duplicated group BFS. See note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

import { mirrorFrame } from '@/code/substrate/coxeter/schlafli'
import {
  Mat,
  Vec,
  matMul,
  matVec,
  identity,
  reflectionMatrix,
  cellCenter,
  pointKey,
} from '@/code/substrate/coxeter/minkowski'

export type CoxeterCellFrame = {
  readonly symbol: number[]
  readonly dim: number
  readonly normals: Vec[]
  readonly metric: number[]
  readonly timeAxis: number
  // the face reflection matrices, one per facet, the H-orbit of the outer generator. A cell tracked by its
  // group matrix g reaches its facet neighbors as g * faces[i], and faces[i] is an involution, so face i is a
  // consistent, self-reciprocal "direction type" (stepping across face i and back across face i is identity).
  readonly faces: Mat[]
  // the cell center in the Lorentzian frame (fixed by the cell stabilizer), the neighbor center is g * c0.
  readonly center: Vec
}

// build the shared cell frame for a symbol. Order of the faces matches buildCellGraph's historical order (the
// stabilizer orbit order), so faceNeighbor indices stay consistent for the addressing code that depends on it.
export function coxeterCellFrame(symbol: number[]): CoxeterCellFrame {
  const { normals, metric, timeAxis } = mirrorFrame(symbol)
  const dim = metric.length
  const cellMirrors = symbol.length // the generators that FIX the cell center

  const reflections: Mat[] = normals.map(normal =>
    reflectionMatrix(normal, metric),
  )

  // the cell stabilizer H = <R[0..cellMirrors-1]>, a finite group, by BFS over its matrices
  const stab: Mat[] = [identity(dim)]
  const stabSeen = new Set<string>([pointKey(stab[0]!.flat())])

  for (const stabilizer of stab) {
    for (let i = 0; i < cellMirrors; i++) {
      const g = matMul(reflections[i]!, stabilizer)
      const k = pointKey(g.flat())

      if (!stabSeen.has(k)) {
        stabSeen.add(k)
        stab.push(g)
      }
    }

    if (stab.length > 100000) break
    // safety
  }

  // the facet (outer) generator's normal, and the facet normals = the H-orbit of it
  const outerNormal = normals[normals.length - 1]!
  const faceNormals: Vec[] = []
  const faceSeen = new Set<string>()

  for (const h of stab) {
    const fn = matVec(h, outerNormal)
    const k = pointKey(fn)

    if (!faceSeen.has(k)) {
      faceSeen.add(k)
      faceNormals.push(fn)
    }
  }

  const faces: Mat[] = faceNormals.map(fn =>
    reflectionMatrix(fn, metric),
  )

  const center = cellCenter(normals, metric, cellMirrors, timeAxis)

  return {
    symbol: symbol.slice(),
    dim,
    normals,
    metric,
    timeAxis,
    faces,
    center,
  }
}
