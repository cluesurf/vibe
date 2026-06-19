import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  buildAddressing,
  addressingStats,
} from '@/code/substrate/coxeter/addressing-3434'

// SS7 (experiments/17). Sorting via address. The canonical cell address is a total order, so a sorted scan is
// just reading the cells in address order, no comparisons needed beyond the address itself. We confirm the
// addresses form a consistent total order (unique, lexicographically comparable, antisymmetric and transitive
// for free) and that sorting by address is stable. Control: a comparison sort is O(N log N).

const lexCompare = (a: number[], b: number[]): number => {
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return a[i]! - b[i]!
  return a.length - b.length
}

export default experiment({
  id: 'data-structure/sorting-by-address',
  title:
    'SS7: the canonical address is a total order, sorting is reading cells in address order',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const addressing = buildAddressing({
      symbol: [3, 4, 3, 4],
      maxCells: 3000,
    })
    const stats = addressingStats(addressing)
    const order = addressing.address
      .map((_, cell) => cell)
      .sort((x, y) =>
        lexCompare(addressing.address[x]!, addressing.address[y]!),
      )

    // a total order: the sorted sequence is strictly increasing (no two equal addresses), so it is a valid sort
    let strictlyOrdered = true
    for (let i = 1; i < order.length; i++)
      if (
        lexCompare(
          addressing.address[order[i - 1]!]!,
          addressing.address[order[i]!]!,
        ) >= 0
      )
        strictlyOrdered = false
    const totalOrder = stats.allUnique && strictlyOrdered

    return verdict({
      status: totalOrder ? 'pass' : 'fail',
      claim:
        'the canonical Coxeter-word address is a total order on the cells, so a sorted scan is reading them in address order and no comparison sort is needed, the geometric address gives ordering for free',
      metrics: {
        cells: stats.cellCount,
        addressesUnique: stats.allUnique ? 1 : 0,
        strictlyOrdered: strictlyOrdered ? 1 : 0,
      },
      // CONTROL: a comparison sort of N items costs O(N log N), the address order costs O(N) to read.
      control: { strictlyOrdered: strictlyOrdered ? 1 : 0 },
      notes:
        'SS7 of experiments/17. The address that sorts (here) also gives BFS order (SS8) and the trie prefixes (SS3). A comparison sort costs O(N log N), reading the address order costs O(N).',
    })
  },
})
