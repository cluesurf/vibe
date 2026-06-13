// The covariant Kahler-Dirac operator: the same d + delta block structure as
// kahlerDirac, but the vertex<->edge (grade 0 <-> 1) hopping entries are
// multiplied by the U(1) link variable. Our sparse matrices are real symmetric,
// so we use cos(charge * phase) as a real-valued stand-in for the complex link
// factor e^{i charge phase}. This keeps the operator real-symmetric so
// diracSpectrum can run on it. A full implementation would carry separate
// re / im channels and build a Hermitian complex operator.

import { CellComplex } from '@/code/operator/dirac'
import { GaugeField, linkPhase } from '@/code/tool/gauge-field'
import { SparseMatrix, Triplet, sparseFromTriplets } from '@/code/algebra/linear/sparse'

export function covariantKahlerDirac(input: {
  complex: CellComplex
  field: GaugeField
  charge: number
}): SparseMatrix {
  const cellCount = input.complex.cellCount
  const grades = cellCount.length

  // Offsets of each grade block within the stacked vector.
  const offset: number[] = new Array<number>(grades + 1)
  offset[0] = 0
  for (let k = 0; k < grades; k++) {
    offset[k + 1] = (offset[k] ?? 0) + (cellCount[k] ?? 0)
  }
  const total = offset[grades] ?? 0

  // To map an edge column back to its endpoints (for the link phase) we read the
  // boundary[1] map: each edge column has a +1 at its head vertex and a -1 at
  // its tail vertex. We invert it into a per-edge {tail, head} table.
  const boundary1 = input.complex.boundary[1]
  const edgeTail: number[] = new Array<number>(cellCount[1] ?? 0).fill(-1)
  const edgeHead: number[] = new Array<number>(cellCount[1] ?? 0).fill(-1)
  if (boundary1) {
    for (let r = 0; r < boundary1.rows; r++) {
      const start = boundary1.rowPtr[r] ?? 0
      const end = boundary1.rowPtr[r + 1] ?? 0
      for (let p = start; p < end; p++) {
        const edge = boundary1.colIdx[p] ?? 0
        const value = boundary1.value[p] ?? 0
        if (value > 0) {
          edgeHead[edge] = r
        } else {
          edgeTail[edge] = r
        }
      }
    }
  }

  const triplets: Triplet[] = []
  for (let k = 1; k < grades; k++) {
    const b = input.complex.boundary[k]
    if (!b) {
      continue
    }
    const lowOffset = offset[k - 1] ?? 0
    const highOffset = offset[k] ?? 0
    const isVertexEdge = k === 1
    for (let r = 0; r < b.rows; r++) {
      const start = b.rowPtr[r] ?? 0
      const end = b.rowPtr[r + 1] ?? 0
      for (let p = start; p < end; p++) {
        const c = b.colIdx[p] ?? 0
        let value = b.value[p] ?? 0
        if (isVertexEdge) {
          // Weight the vertex <-> edge coupling by the real-valued link factor
          // cos(charge * phase) along the edge's tail -> head direction.
          const tail = edgeTail[c] ?? -1
          const head = edgeHead[c] ?? -1
          if (tail >= 0 && head >= 0) {
            const phase = linkPhase(input.field, { from: tail, to: head })
            value *= Math.cos(input.charge * phase)
          }
        }
        // delta block (high grade -> low grade) and its transpose (d block).
        triplets.push({ row: lowOffset + r, col: highOffset + c, value })
        triplets.push({ row: highOffset + c, col: lowOffset + r, value })
      }
    }
  }

  return sparseFromTriplets({ rows: total, cols: total, triplets })
}
