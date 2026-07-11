// Conformance for code/measure/graph-continuity: the discrete divergence law on a cell graph.
//   - regionBall and cellDistances are plain BFS, checked on a path graph.
//   - regionCharge sums all direction slots in a region.
//   - continuityResidual = (enclosed-charge change) - (net boundary flux). For a conservative
//     transport step it is exactly 0; for charge destroyed inside the region it equals minus the
//     charge destroyed. Both are worked out by hand on a tiny two-cell graph.

import { suite, check, equal } from '@/test/code/harness'
import {
  regionBall,
  cellDistances,
  regionCharge,
  continuityResidual,
} from '@/code/measure/graph-continuity'

// path graph 0 - 1 - 2 - 3.
const path = [[1], [0, 2], [1, 3], [2]]

suite('measure/graph-continuity: regionBall and cellDistances', [
  check('the radius-r ball grows hop by hop', () => {
    equal(
      [...regionBall(path, 0, 1)].sort((a, b) => a - b).join(','),
      '0,1',
    )

    equal(
      [...regionBall(path, 0, 2)].sort((a, b) => a - b).join(','),
      '0,1,2',
    )

    equal(
      [...regionBall(path, 0, 3)].sort((a, b) => a - b).join(','),
      '0,1,2,3',
    )
  }),
  check('cellDistances from an end is 0,1,2,3', () => {
    equal(cellDistances(path, 0).join(','), '0,1,2,3')
  }),
])

suite('measure/graph-continuity: regionCharge', [
  check('sums every slot of every cell in the region', () => {
    const state = [[1, 2], [3], [-1, -1]]

    equal(regionCharge(state, new Set([0, 1])), 6) // 1+2+3
    equal(regionCharge(state, new Set([0, 1, 2])), 4) // 6 + (-2)
  }),
])

suite('measure/graph-continuity: continuityResidual', [
  check('a conservative transport beat has residual exactly 0', () => {
    // two cells, one slot each, the slot streams to the other cell.
    const adjacency = [[1], [0]]
    const before = [[1], [0]]
    const streamed = [[1], [0]] // the tone about to move out of cell 0
    const after = [[0], [1]] // it arrived at cell 1
    const residual = continuityResidual({
      before,
      streamed,
      after,
      adjacency,
      region: new Set([0]),
    })

    equal(residual, 0)
  }),
  check(
    'charge destroyed inside the region shows up as a negative residual',
    () => {
      // nothing streams (streamed all zero), yet cell 0 lost its unit of charge.
      const adjacency = [[1], [0]]
      const before = [[1], [0]]
      const streamed = [[0], [0]]
      const after = [[0], [0]]
      const residual = continuityResidual({
        before,
        streamed,
        after,
        adjacency,
        region: new Set([0]),
      })

      equal(residual, -1) // minus the one unit destroyed inside
    },
  ),
])
