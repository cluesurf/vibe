// Conformance for code/measure/shells: BFS shell traversal and its growth ratios. The
// shell depths and counts on a path and a cycle are hand-derived (a path's shells are
// all size 1; a 6-cycle's shells are 1,2,2,1). Growth-ratio helpers are checked on
// geometric series with a known ratio.

import {
  suite,
  check,
  equal,
  close,
  exactArray,
} from '@/test/code/harness'
import {
  bfsShells,
  branchingRatio,
  midShellGrowthRatio,
  geometricGrowthRatio,
  geodesicBall,
} from '@/code/measure/shells'

// A path 0-1-2-...-(n-1) neighbor list.
function pathNeighbors(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    [i - 1, i + 1].filter(j => j >= 0 && j < n),
  )
}

// A cycle of n nodes.
function cycleNeighbors(n: number): number[][] {
  return Array.from({ length: n }, (_, i) => [
    (i - 1 + n) % n,
    (i + 1) % n,
  ])
}

suite('measure/shells: bfsShells', [
  check('a path from one end has depths 0..n-1 and unit shells', () => {
    const out = bfsShells({ neighbors: pathNeighbors(6), root: 0 })

    exactArray(out.depth, [0, 1, 2, 3, 4, 5])
    exactArray(out.shellCounts, [1, 1, 1, 1, 1, 1])
  }),
  check('a 6-cycle from a node has shells 1,2,2,1', () => {
    const out = bfsShells({ neighbors: cycleNeighbors(6), root: 0 })

    // depth: 0->0, 1->1, 5->1, 2->2, 4->2, 3->3.
    exactArray(out.depth, [0, 1, 2, 3, 2, 1])
    exactArray(out.shellCounts, [1, 2, 2, 1])
  }),
  check('maxRadius caps the traversal depth', () => {
    const out = bfsShells({
      neighbors: pathNeighbors(10),
      root: 0,
      maxRadius: 3,
    })

    exactArray(out.shellCounts, [1, 1, 1, 1])
  }),
])

suite('measure/shells: growth ratios', [
  check('geometricGrowthRatio of a doubling series is 2', () => {
    close(geometricGrowthRatio([1, 2, 4, 8, 16]), 2, 1e-12)
  }),
  check('geometricGrowthRatio of a flat series is 1', () => {
    close(geometricGrowthRatio([5, 5, 5, 5]), 1, 1e-12)
  }),
  check('branchingRatio of a doubling shell series is 2', () => {
    close(
      branchingRatio({ shellCounts: [1, 2, 4, 8, 16, 32] }),
      2,
      1e-12,
    )
  }),
  check(
    'midShellGrowthRatio reads the doubling of the middle shells',
    () => {
      close(
        midShellGrowthRatio({ shellCounts: [1, 1, 1, 2, 4, 8, 16] }),
        2,
        1e-12,
      )
    },
  ),
])

suite('measure/shells: geodesicBall', [
  check('a ball of radius 2 on a path holds 3 nodes', () => {
    const ball = geodesicBall({
      neighbors: pathNeighbors(7),
      root: 0,
      radius: 2,
    })

    equal(ball.length, 3)
    exactArray(
      [...ball].sort((a, b) => a - b),
      [0, 1, 2],
    )
  }),
  check('a ball of radius 2 on a 6-cycle holds 5 nodes', () => {
    const ball = geodesicBall({
      neighbors: cycleNeighbors(6),
      root: 0,
      radius: 2,
    })

    equal(ball.length, 5)
    exactArray(
      [...ball].sort((a, b) => a - b),
      [0, 1, 2, 4, 5],
    )
  }),
])
