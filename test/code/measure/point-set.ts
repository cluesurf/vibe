// Conformance for code/measure/point-set. Shape measures on a set of occupied lattice cells:
// centroid, recentering, overlap, radius of gyration, and the Jaccard distance of id sets. Every
// value is hand-computed from the small explicit cell sets.

import {
  suite,
  check,
  equal,
  close,
  exactArray,
  ok,
} from '@/test/code/harness'
import {
  centroidOfCellSet,
  recenterCellSet,
  cellSetOverlap,
  radiusOfGyrationOfCellSet,
  jaccardDistance,
} from '@/code/measure/point-set'

const TOL = 1e-12

suite('measure/point-set: centroid and recenter', [
  check('centroid of a symmetric square is its center', () => {
    const cells = new Set(['0,0', '2,0', '0,2', '2,2'])

    exactArray(centroidOfCellSet(cells), [1, 1])
  }),
  check('recenter shifts the rounded centroid to the origin', () => {
    const cells = new Set(['0,0', '2,0', '0,2', '2,2'])
    const out = recenterCellSet(cells)

    // centroid (1,1) -> each cell minus (1,1).
    ok(out.has('-1,-1'))
    ok(out.has('1,-1'))
    ok(out.has('-1,1'))
    ok(out.has('1,1'))
    equal(out.size, 4)
  }),
])

suite('measure/point-set: overlap and gyration', [
  check('overlap is intersection over the larger size', () => {
    // {0,0;1,0} vs {1,0;2,0}: one shared cell, max size 2 -> 0.5.
    const a = new Set(['0,0', '1,0'])
    const b = new Set(['1,0', '2,0'])

    close(cellSetOverlap(a, b), 0.5, TOL)
  }),
  check('radius of gyration of two unit-offset cells is 1', () => {
    // {-1,0;1,0}: centroid (0,0), mean square distance (1+1)/2=1 -> sqrt = 1.
    close(radiusOfGyrationOfCellSet(new Set(['-1,0', '1,0'])), 1, TOL)
  }),
])

suite('measure/point-set: jaccardDistance', [
  check('half-overlapping id sets have distance 1/2', () => {
    // {1,2,3} vs {2,3,4}: intersection 2, union 4 -> 1 - 2/4 = 0.5.
    close(
      jaccardDistance(new Set([1, 2, 3]), new Set([2, 3, 4])),
      0.5,
      TOL,
    )
  }),
  check('identical sets have distance 0', () => {
    equal(jaccardDistance(new Set([1, 2]), new Set([1, 2])), 0)
  }),
  check('disjoint sets have distance 1', () => {
    equal(jaccardDistance(new Set([1]), new Set([2])), 1)
  }),
])
