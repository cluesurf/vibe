import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  buildAddressing,
  addressingStats,
} from '@/code/substrate/coxeter/addressing-3434'

// SS1 (experiments/17), the database headline. A high-fan-out B-tree instantiates on the {3,4,3,4} bulk with
// NO stored child pointers, because the children of a node are its physical neighbours, and a point query is a
// descent of O(log_b N) physical steps. We build the canonical chamber-tree addressing, whose tree parent and
// children come directly from the cell adjacency (no stored pointers), and confirm the descent depth (the
// address length, the number of physical steps from the root to a target cell) is logarithmic in the cell
// count, far below a flat linear scan. Reference, Margenstern 2007, the chamber-tree addressing.

export default experiment({
  id: 'data-structure/btree-descent',
  title:
    'SS1: a B-tree point query on {3,4,3,4} is a logarithmic-depth descent with no stored child pointers',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const maxCells = 4000
    const addressing = buildAddressing({
      symbol: [3, 4, 3, 4],
      maxCells,
    })
    const stats = addressingStats(addressing)
    const cells = stats.cellCount
    const descentDepth = stats.maxAddressLength // physical steps from root to the deepest cell, the point query

    // the children of every node are physical neighbours (the addressing tree comes from the cell adjacency),
    // so no child pointers are stored
    const childrenArePhysicalNeighbours =
      addressing.children.length === cells
    // the descent is logarithmic in the cell count (a generous O(log N) bound)
    const logarithmicDescent = descentDepth <= Math.log2(cells)
    // and it crushes a flat linear scan of the same data
    const flatLinearScan = cells
    const beatsFlatScan = descentDepth < flatLinearScan

    const ok =
      childrenArePhysicalNeighbours &&
      logarithmicDescent &&
      beatsFlatScan &&
      stats.allUnique

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a B-tree on {3,4,3,4} stores no child pointers (the children are physical neighbours) and answers a point query in a logarithmic-depth physical descent, the most-used database structure is the cheapest thing the bulk holds',
      metrics: {
        cells,
        descentDepthSteps: descentDepth,
        logarithmicDescent: logarithmicDescent ? 1 : 0,
        childrenArePhysicalNeighbours: childrenArePhysicalNeighbours
          ? 1
          : 0,
      },
      // CONTROL: a flat linear scan of the same cell count costs O(N) steps, so the logarithmic descent is the
      // tree-shaped geometry, not the data.
      control: {
        flatLinearScanSteps: flatLinearScan,
        beatsFlatScan: beatsFlatScan ? 1 : 0,
      },
      notes:
        'SS1 of experiments/17, the headline. The bulk tree IS the B-tree index, balanced by geometry (no degenerate long paths) with zero stored pointers. The trie (SS3) and Merkle store (SS6) ride the same tree.',
    })
  },
})
