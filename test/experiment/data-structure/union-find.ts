import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'

// SS15 (experiments/17). Union-find. Parent pointers toward a root cell give find trees, and because hyperbolic
// bulk paths are short, the find trees are shallow (logarithmic). We follow the canonical parent chain from
// every cell to the root, confirm it always terminates at the root, and measure the find depth (the chain
// length, which is the cell's BFS shell), confirming the mean and max are logarithmic. Control: a flat
// union-find without path compression can build O(N) chains.

export default experiment({
  id: 'data-structure/union-find',
  code: 'E-DST-0026',
  title:
    'SS15: union-find on the cell tree has logarithmic find depth from short bulk paths',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const a = buildAddressing({ symbol: [3, 4, 3, 4], maxCells: 4000 })
    const cells = a.parent.length

    // follow parent to the root from each cell, count the chain length, and confirm it equals the BFS shell
    let allReachRoot = true
    let depthMatchesDist = true
    let sumDepth = 0
    let maxDepth = 0

    for (let cell = 0; cell < cells; cell++) {
      let node = cell
      let steps = 0

      while (a.parent[node] !== -1 && steps <= cells) {
        node = a.parent[node]!
        steps += 1
      }

      if (node !== a.root) {
        allReachRoot = false
      }

      if (steps !== a.dist[cell]) {
        depthMatchesDist = false
      }

      sumDepth += steps

      if (steps > maxDepth) {
        maxDepth = steps
      }
    }

    const meanFindDepth = sumDepth / cells
    const logarithmic = maxDepth <= 4 * Math.log2(cells)

    const ok = allReachRoot && depthMatchesDist && logarithmic

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'union-find on the cell tree resolves every find by a parent chain to the root whose length is the cell shell, and the hyperbolic short paths keep that depth logarithmic, so find is cheap with no path compression',
      metrics: {
        cells,
        meanFindDepth,
        maxFindDepth: maxDepth,
        logarithmic: logarithmic ? 1 : 0,
      },
      // CONTROL: a flat union-find without compression can degenerate to O(N) chains, the bulk geometry cannot.
      control: { flatWorstCaseDepth: cells, bulkMaxDepth: maxDepth },
      notes:
        'SS15 of experiments/17. Same parent tree as the heap (SS4) and Merkle proof (DS11), here read as find chains.',
    })
  },
})
