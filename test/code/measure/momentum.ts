// Conformance for code/measure/momentum: the momentum current of the directional lattice gas,
// sum over (cell, direction) of tone * D4-root(direction).
//   - A single +1 tone in direction d contributes exactly that root; root[0] = (1,1,0,0),
//     root[1] = (1,-1,0,0) by the rootsD4 ordering, re-derived here.
//   - A cell with +1 in EVERY direction sums to zero, because the D4 roots come in +/- pairs and
//     sum to the zero vector (a root-system symmetry, independent of the impl).
//   - momentumDrift is the max absolute component difference.

import { suite, check, close, equal, exactArray } from '@/test/code/harness'
import { totalMomentum, momentumDrift } from '@/code/measure/momentum'
import { Will } from '@/code/tone/will'
import { Mesh } from '@/code/tool/mesh'

// a one-cell mesh with the 24-direction D4 coin (only degree / cellCount are read by totalMomentum).
const mesh: Mesh = {
  id: 'test-d4-one-cell',
  degree: 24,
  cellCount: 1,
  neighbour: () => 0,
  opposite: d => d,
}

function willWith(set: (data: Int8Array) => void): Will {
  const data = new Int8Array(24)
  set(data)

  return { mesh, data }
}

suite('measure/momentum: totalMomentum', [
  check('a single +1 in direction 0 yields root[0] = (1,1,0,0)', () => {
    const p = totalMomentum(willWith(d => (d[0] = 1)))
    exactArray(p, [1, 1, 0, 0])
  }),
  check('a single +1 in direction 1 yields root[1] = (1,-1,0,0)', () => {
    const p = totalMomentum(willWith(d => (d[1] = 1)))
    exactArray(p, [1, -1, 0, 0])
  }),
  check('a -1 tone negates the root contribution', () => {
    const p = totalMomentum(willWith(d => (d[0] = -1)))
    exactArray(p, [-1, -1, 0, 0])
  }),
  check('all directions +1 sum to zero (the roots come in +/- pairs)', () => {
    const p = totalMomentum(willWith(d => d.fill(1)))
    exactArray(p, [0, 0, 0, 0])
  }),
  check('the empty will has zero momentum', () => {
    const p = totalMomentum(willWith(() => undefined))
    exactArray(p, [0, 0, 0, 0])
  }),
])

suite('measure/momentum: momentumDrift', [
  check('the largest absolute component gap', () => {
    close(momentumDrift([1, 2, 3, 4], [1, 2, 5, 4]), 2, 0)
  }),
  check('identical vectors have zero drift', () => {
    equal(momentumDrift([1, 2, 3, 4], [1, 2, 3, 4]), 0)
  }),
])
