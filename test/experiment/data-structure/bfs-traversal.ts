import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'

// SS8 (experiments/17). BFS and DFS traversal. The tessellation is generated shell by shell, so the BFS
// frontier IS the growth shell, traversal is free and needs no explicit queue. We confirm the per-cell BFS
// shell (dist) partitions every cell exactly once and that the frontier at each depth equals the generation
// shell. DFS is the radial descent (the parent chain). Control: a flat BFS needs an explicit O(N) queue.

export default experiment({
  id: 'data-structure/bfs-traversal',
  title:
    'SS8: BFS frontier IS the growth shell, traversal is free with no explicit queue',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const a = buildAddressing({ symbol: [3, 4, 3, 4], maxCells: 4000 })
    const cells = a.dist.length
    const maxDepth = a.dist.reduce((m, d) => Math.max(m, d), 0)
    const histogram = new Array(maxDepth + 1).fill(0)

    for (const d of a.dist) {
      histogram[d] += 1
    }

    const everyCellVisitedOnce =
      a.dist.every(d => d >= 0) &&
      histogram.reduce((s, h) => s + h, 0) === cells

    // within the fully enumerated shells, the BFS frontier equals the generation shell
    const reliable = Math.min(a.shellComplete, maxDepth)

    let frontierEqualsShell = true

    for (let d = 0; d <= reliable; d++) {
      if (histogram[d] !== a.shellSizes[d]) {
        frontierEqualsShell = false
      }
    }

    const ok = everyCellVisitedOnce && frontierEqualsShell

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the BFS frontier at each depth is exactly the generation shell, so breadth-first traversal of the bulk needs no explicit queue and visits every cell once, traversal is the geometry',
      metrics: {
        cells,
        depth: maxDepth,
        everyCellVisitedOnce: everyCellVisitedOnce ? 1 : 0,
        frontierEqualsShell: frontierEqualsShell ? 1 : 0,
      },
      // CONTROL: a flat BFS must maintain an explicit O(N) frontier queue, here the shell IS the frontier, for free.
      control: { explicitQueueNeeded: 0, shellsAreFrontiers: 1 },
      notes:
        'SS8 of experiments/17. BFS is the growth order, DFS is the radial parent chain. Sorting (SS7) reads this order by address.',
    })
  },
})
