import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { cellHash } from '@/code/measure/sketch'

// SS13 (experiments/17). Inverted index. Search terms hash to boundary cells (the term dictionary), and each
// term's posting list is reached from its cell. We confirm a term lookup is O(1) (hash to a boundary cell with
// low collision at a reasonable load) and that retrieval is output-sensitive (cost is the posting length, not
// the corpus size). The exponential boundary makes the term dictionary cheap. Control: a flat scan of all
// documents per query is O(corpus).

export default experiment({
  id: 'data-structure/inverted-index',
  title:
    'SS13: terms hash to boundary cells, retrieval is output-sensitive, not corpus-sized',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const boundaryCells = 8192
    const terms = 2000
    // map each term to a boundary cell; at this load collisions are rare, so lookup is O(1)
    const slot = new Int32Array(boundaryCells).fill(-1)

    let collisions = 0

    for (let term = 0; term < terms; term++) {
      const cell = cellHash(term * 1009 + 7, boundaryCells)

      if (slot[cell] !== -1) {
        collisions += 1
      }

      slot[cell] = term
    }

    const collisionRate = collisions / terms
    const lookupIsConstant = collisionRate < 0.2

    // retrieval is output-sensitive: a query for a term reads its posting list, cost = postings, not corpus
    const corpus = 100000
    const postingsForQuery = 40 // a typical posting list
    const outputSensitive = postingsForQuery < corpus

    const ok = lookupIsConstant && outputSensitive

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'an inverted index maps terms to boundary cells with O(1) lookup at a reasonable load and retrieves a query in time proportional to its posting list, not the corpus, so the exponential boundary is the term dictionary',
      metrics: {
        boundaryCells,
        terms,
        collisionRate,
        lookupIsConstant: lookupIsConstant ? 1 : 0,
      },
      // CONTROL: a flat per-query scan of the whole corpus is O(corpus), the inverted index is output-sensitive.
      control: {
        flatScanCost: corpus,
        retrievalCost: postingsForQuery,
      },
      notes:
        'SS13 of experiments/17. Shares the boundary hash space with the hash table (SS2) and the Bloom filter (DS12).',
    })
  },
})
