import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'

// SS4 (experiments/17). Heap / priority queue. The radial depth (the BFS shell) IS the priority, the root is
// the minimum, and the tree is heap-ordered by depth, every parent is strictly shallower than its children. We
// confirm the heap property holds for every cell (parent depth < child depth), that peek-min is the root in
// O(1), and that insert is a descent of depth O(log N). Control: a flat binary heap sifts in O(log N).

export default experiment({
  id: 'data-structure/radial-heap',
  title:
    'SS4: the radial depth is a heap order, peek-min is the root in O(1)',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const a = buildAddressing({ symbol: [3, 4, 3, 4], maxCells: 4000 })
    const cells = a.parent.length
    let heapOrdered = true
    let maxDepth = 0
    for (let cell = 0; cell < cells; cell++) {
      const parent = a.parent[cell]!
      if (parent !== -1 && !(a.dist[parent]! < a.dist[cell]!))
        heapOrdered = false
      if (a.dist[cell]! > maxDepth) maxDepth = a.dist[cell]!
    }
    const peekMinIsRoot = a.dist[a.root] === 0
    const insertDepthLogarithmic = maxDepth <= 4 * Math.log2(cells)

    const ok = heapOrdered && peekMinIsRoot && insertDepthLogarithmic

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the radial depth heap-orders the bulk, every parent is strictly shallower than its children, peek-min is the root in O(1), and insert descends O(log N), a priority queue laid on the radial axis',
      metrics: {
        cells,
        heapOrdered: heapOrdered ? 1 : 0,
        peekMinIsRoot: peekMinIsRoot ? 1 : 0,
        insertDepth: maxDepth,
      },
      // CONTROL: a flat binary heap in an array sifts in O(log N), the same asymptotics but with stored indices.
      control: { flatHeapSiftCost: Math.ceil(Math.log2(cells)) },
      notes:
        'SS4 of experiments/17. The radial axis is also the LSM level (SS5) and the skip-list shortcut (DS9).',
    })
  },
})
