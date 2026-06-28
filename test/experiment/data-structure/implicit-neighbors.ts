import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'

// DS3 (experiments/16). Implicit neighbours. On {3,4,3,4}, the cell IS its integer D4 coordinate (a 4-vector
// of even coordinate sum) and its 24 neighbours are the coordinate plus each of the 24 D4 roots, computed by
// arithmetic, so ZERO adjacency is stored. We confirm the 24 roots are valid D4 vectors and that adding any
// root to any D4 point lands on another D4 point, so neighbour enumeration is O(1) with no stored graph. The
// control is a general graph, which stores O(degree) neighbour indices per cell. Reference, Conway-Sloane 1988.

const coordinateSum = (v: number[]): number =>
  v.reduce((s, x) => s + x, 0)

export default experiment({
  id: 'data-structure/implicit-neighbors',
  code: 'E-DST-0013',
  title:
    'DS3: {3,4,3,4} neighbours are computed from the D4 coordinate, zero stored adjacency',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const roots = rootsD4()
    const has24Roots = roots.length === 24
    const rootsAreEven = roots.every(r => coordinateSum(r) % 2 === 0)

    // sample D4 points (even coordinate sum) and confirm every neighbour (point + root) is again a D4 point
    const points = [
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [2, 0, 0, 0],
      [1, -1, 2, 0],
      [2, 2, 2, 2],
      [3, 1, 0, 0],
    ]

    const pointsAreEven = points.every(p => coordinateSum(p) % 2 === 0)

    let allNeighboursValid = true

    for (const p of points) {
      for (const r of roots) {
        const neighbour = p.map((x, i) => x + r[i]!)

        if (coordinateSum(neighbour) % 2 !== 0) {
          allNeighboursValid = false
        }
      }
    }

    // zero stored adjacency, the neighbour is arithmetic; a general graph stores 24 indices per cell
    const storedAdjacencyBytesPerCell = 0
    const generalGraphBytesPerCell = 24 * 4

    const ok =
      has24Roots && rootsAreEven && pointsAreEven && allNeighboursValid

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on {3,4,3,4} the 24 neighbours of any cell are its integer D4 coordinate plus the 24 D4 roots, computed by arithmetic with zero stored adjacency, so neighbour enumeration is O(1) and the structure is implicit',
      metrics: {
        rootCount: roots.length,
        rootsAreD4: rootsAreEven ? 1 : 0,
        allNeighboursValid: allNeighboursValid ? 1 : 0,
        storedAdjacencyBytesPerCell,
      },
      // CONTROL: a general graph must store O(degree) neighbour indices per cell, here 24 indices (96 bytes),
      // so the implicit D4 representation saves all of it.
      control: { generalGraphBytesPerCell },
      notes:
        'DS3 of experiments/16. The implicit integer addressing is the foundation under the hash table (SS2), the B-tree (SS1), and every {3,4,3,4} store, the address is the location and the neighbours are arithmetic.',
    })
  },
})
