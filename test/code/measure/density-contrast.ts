// Conformance for code/measure/density-contrast: delta = std(counts) / mean(counts) over a regular
// grid of cells. Two exact configurations pin it down: one point per cell (perfectly uniform) gives
// delta = 0 at any occupancy; all points in a single cell gives delta = sqrt(C - 1) where C is the
// number of cells, independent of the point count (derived by hand below).

import { suite, check, close } from '@/test/code/harness'
import { densityContrast } from '@/code/measure/density-contrast'

// the 3D cell centers of a binsPerAxis^3 grid in the unit cube, one point per cell
function cellCenters(binsPerAxis: number): number[][] {
  const points: number[][] = []

  for (let i = 0; i < binsPerAxis; i++) {
    for (let j = 0; j < binsPerAxis; j++) {
      for (let k = 0; k < binsPerAxis; k++) {
        points.push([
          (i + 0.5) / binsPerAxis,
          (j + 0.5) / binsPerAxis,
          (k + 0.5) / binsPerAxis,
        ])
      }
    }
  }

  return points
}

suite('measure/density-contrast: uniform occupancy', [
  // One point per cell: every count is 1, so mean = 1 and the contrast is 0.
  check('one point per cell gives mean 1 and zero contrast', () => {
    const r = densityContrast({
      points: cellCenters(4),
      binsPerAxis: 4,
    })

    close(r.meanCount, 1, 1e-12)
    close(r.delta, 0, 1e-12)
  }),
  // Two points per cell: mean = 2, contrast still 0.
  check('two points per cell gives mean 2 and zero contrast', () => {
    const centers = cellCenters(4)
    const r = densityContrast({
      points: [...centers, ...centers],
      binsPerAxis: 4,
    })

    close(r.meanCount, 2, 1e-12)
    close(r.delta, 0, 1e-12)
  }),
])

suite('measure/density-contrast: maximal clumping', [
  // All N points in one of C = binsPerAxis^3 cells: counts are (N, 0, ..., 0), so mean = N/C and the
  // standard deviation is N sqrt(C-1)/C, giving delta = sqrt(C - 1) regardless of N.
  check('all points in one cell gives delta = sqrt(C - 1)', () => {
    const bins = 4
    const cells = bins ** 3 // 64
    const n = 100
    const points = Array.from({ length: n }, () => [0.01, 0.01, 0.01])
    const r = densityContrast({ points, binsPerAxis: bins })

    close(r.meanCount, n / cells, 1e-12)
    close(r.delta, Math.sqrt(cells - 1), 1e-9)
  }),
  // The contrast is independent of the number of clumped points.
  check('the clumped contrast does not depend on point count', () => {
    const bins = 4
    const a = densityContrast({
      points: Array.from({ length: 30 }, () => [0.01, 0.01, 0.01]),
      binsPerAxis: bins,
    })

    const b = densityContrast({
      points: Array.from({ length: 300 }, () => [0.01, 0.01, 0.01]),
      binsPerAxis: bins,
    })

    close(a.delta, b.delta, 1e-9)
  }),
])
