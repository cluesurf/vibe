// Conformance for code/substrate/proximity-graph: the nearest-neighbour proximity graph of a point cloud.
// Two points connect when their distance is below a multiple of the MEDIAN nearest-neighbour distance, so
// the construction is symmetric and adapts to spacing. We test on an explicit 1D cloud whose threshold we
// compute by hand. Adjacency is exact; the centre-nearest-origin is an exact argmin.

import { suite, check, equal, ok } from '@/test/code/harness'
import {
  proximityGraph,
  centerNearestOrigin,
} from '@/code/substrate/proximity-graph'

const lineDist = (a: number[], b: number[]): number =>
  Math.abs(a[0]! - b[0]!)

suite('substrate/proximity-graph: adaptive connectivity', [
  check('a 1D cloud connects exactly the near pairs', () => {
    // Points at 0,1,2,10. Nearest-neighbour distances: 1,1,1,8.
    // Sorted [1,1,1,8], median = index floor(4/2)=2 -> 1. threshold = 1.7.
    const coords = [[0], [1], [2], [10]]
    const n = proximityGraph({ coords, distance: lineDist })

    // pairs below 1.7: (0,1)=1, (1,2)=1; (0,2)=2 excluded; 10 isolated.
    equal(n[0]!.join(','), '1', 'point 0 connects to 1')
    equal(
      n[1]!.sort((a, b) => a - b).join(','),
      '0,2',
      'point 1 connects to 0 and 2',
    )
    equal(n[2]!.join(','), '1', 'point 2 connects to 1')
    equal(n[3]!.length, 0, 'the far point 10 is isolated')
  }),
  check('adjacency is symmetric', () => {
    const coords = [[0], [1], [2], [3], [4]]
    const n = proximityGraph({ coords, distance: lineDist })
    const sets = n.map(row => new Set(row))

    for (let i = 0; i < coords.length; i++) {
      for (const j of n[i]!) {
        ok(sets[j]!.has(i), `edge ${i}-${j} is mutual`)
      }
    }
  }),
])

suite('substrate/proximity-graph: the seed point', [
  check('centerNearestOrigin is the smallest-norm point', () => {
    equal(
      centerNearestOrigin([
        [3, 0],
        [0, 0.1],
        [5, 5],
      ]),
      1,
      'nearest the origin',
    )

    equal(
      centerNearestOrigin([[-1], [2], [0.5]]),
      2,
      '1D nearest origin',
    )
  }),
])
