// Conformance for code/measure/associative-recall. The recall-rate measures run over the
// associative-memory engine (orchestration), but coverageRadius and radiusCapacity are pure graph
// quantities built on BFS shells: coverageRadius is the eccentricity (max graph distance) from the
// seed, and radiusCapacity is the cumulative shell population by radius. We re-derive both on a path
// and a cycle, exactly as the shells exemplar does.

import { suite, check, equal, exactArray } from '@/test/code/harness'
import {
  coverageRadius,
  radiusCapacity,
} from '@/code/measure/associative-recall'

function pathNeighbors(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    [i - 1, i + 1].filter(j => j >= 0 && j < n),
  )
}

function cycleNeighbors(n: number): number[][] {
  return Array.from({ length: n }, (_, i) => [(i - 1 + n) % n, (i + 1) % n])
}

suite('measure/associative-recall: coverageRadius', [
  check('a path of 6 from one end has eccentricity 5', () => {
    equal(coverageRadius({ neighbors: pathNeighbors(6), seed: 0 }), 5)
  }),
  check('a 6-cycle from a node has eccentricity 3', () => {
    equal(coverageRadius({ neighbors: cycleNeighbors(6), seed: 0 }), 3)
  }),
])

suite('measure/associative-recall: radiusCapacity', [
  check('a path accumulates one cell per radius', () => {
    // shells are all size 1 -> cumulative 1,2,3,4,5,6.
    exactArray(
      radiusCapacity({ neighbors: pathNeighbors(6), seed: 0 }),
      [1, 2, 3, 4, 5, 6],
    )
  }),
  check('a 6-cycle accumulates 1,3,5,6 by radius', () => {
    // shells 1,2,2,1 -> cumulative 1,3,5,6.
    exactArray(
      radiusCapacity({ neighbors: cycleNeighbors(6), seed: 0 }),
      [1, 3, 5, 6],
    )
  }),
])
