// Conformance for code/substrate/cubic-lattice: the d-dimensional hypercubic mesh. Interior cells have
// degree 2d, corners fewer; adjacency is symmetric; the centre index is at floor(side/2) on every axis; and
// Euclidean distance is the ordinary integer-coordinate metric. All exact except the sqrt distance.

import {
  suite,
  check,
  equal,
  ok,
  notOk,
  close,
} from '@/test/code/harness'
import {
  cubicLattice,
  cubicLatticeCenter,
  cubicLatticeCenterBySide,
  cubicLatticeDistance,
} from '@/code/substrate/cubic-lattice'

suite('substrate/cubic-lattice: degrees and adjacency', [
  check(
    'a 3x3 mesh has the interior degree 2d and corner degree d',
    () => {
      const lat = cubicLattice(3, 2)

      equal(lat.size, 9, 'cell count')
      equal(lat.neighbors[4]!.length, 4, 'centre degree 2d=4')
      equal(lat.neighbors[0]!.length, 2, 'corner degree 2')
      equal(lat.neighbors[1]!.length, 3, 'edge degree 3')
    },
  ),
  check(
    'a 3x3x3 mesh centre has degree 6 and degree sum is 2*edges',
    () => {
      const lat = cubicLattice(3, 3)

      equal(lat.size, 27, 'cell count')
      equal(lat.neighbors[13]!.length, 6, 'centre degree 2d=6')

      let degSum = 0

      for (const row of lat.neighbors) {
        degSum += row.length
      }

      // a 3^3 grid has 3 axes * (2 edges per line) * 9 lines = 54 edges.
      equal(degSum / 2, 54, 'edge count')
    },
  ),
  check('adjacency is symmetric with no self-loops', () => {
    const lat = cubicLattice(4, 2)
    const sets = lat.neighbors.map(row => new Set(row))

    for (let i = 0; i < lat.size; i++) {
      notOk(sets[i]!.has(i), `cell ${i} has no self-loop`)

      for (const j of lat.neighbors[i]!) {
        ok(sets[j]!.has(i), `edge ${i}-${j} is mutual`)
      }
    }
  }),
])

suite('substrate/cubic-lattice: centre and distance', [
  check('the centre index agrees from both routes', () => {
    const lat = cubicLattice(5, 3)
    const a = cubicLatticeCenter({ lattice: lat, side: 5 })
    const b = cubicLatticeCenterBySide({ side: 5, dim: 3 })

    equal(a, b, 'centre index')
    // floor(5/2)=2 on every axis: index = 2 + 2*5 + 2*25 = 62.
    equal(a, 62, 'explicit centre index')
  }),
  check('Euclidean distance is the integer-coordinate metric', () => {
    const lat = cubicLattice(3, 2)

    // index 0 = (0,0), index 8 = (2,2): distance sqrt(8).
    close(
      cubicLatticeDistance({ lattice: lat, from: 0, to: 8 }),
      Math.sqrt(8),
      1e-12,
      '(0,0)-(2,2)',
    )

    close(
      cubicLatticeDistance({ lattice: lat, from: 0, to: 1 }),
      1,
      1e-12,
      'adjacent',
    )

    close(
      cubicLatticeDistance({ lattice: lat, from: 4, to: 4 }),
      0,
      1e-12,
      'self',
    )
  }),
])
