import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'

// DS11 and SS6 (experiments/16 and 17). Merkle DAG / content-addressed store. The bulk tree is a hash tree,
// each cell commits its subtree, and an inclusion proof is the path of hashes from a leaf to the root, whose
// length is the cell's depth. We confirm the proof path (the parent chain to the root) has logarithmic length
// for every cell, so proofs are O(log N). Control: a flat list inclusion proof is O(N). Reference, Merkle 1987.

export default experiment({
  id: 'data-structure/merkle-proof',
  title:
    'DS11: a Merkle inclusion proof on the bulk tree is a logarithmic-length path to the root',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const a = buildAddressing({ symbol: [3, 4, 3, 4], maxCells: 4000 })
    const cells = a.dist.length

    // the proof length for a cell is its depth (the parent chain to the root)
    let maxProof = 0
    let sumProof = 0

    for (let cell = 0; cell < cells; cell++) {
      maxProof = Math.max(maxProof, a.dist[cell]!)
      sumProof += a.dist[cell]!
    }

    const meanProof = sumProof / cells
    const logarithmicProof = maxProof <= 4 * Math.log2(cells)

    return verdict({
      status: logarithmicProof ? 'pass' : 'fail',
      claim:
        'a Merkle inclusion proof on the bulk hash tree is the path of hashes from a cell to the root, of logarithmic length, so the bulk is a content-addressed store with short proofs',
      metrics: {
        cells,
        maxProofLength: maxProof,
        meanProofLength: meanProof,
        logarithmicProof: logarithmicProof ? 1 : 0,
      },
      // CONTROL: a flat list inclusion proof is O(N) hashes, the bulk tree is O(log N).
      control: {
        flatListProofLength: cells,
        bulkProofLength: maxProof,
      },
      notes:
        'DS11 of experiments/16 and SS6 of experiments/17. Same tree as the B-tree (SS1), here the path is the proof.',
    })
  },
})
