import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'

// SS3 (experiments/17). Trie / radix tree. A cell's canonical address is its parent's address extended by one
// digit, so the set of cells is a trie, a prefix is a physical path, and a prefix query descends digit by
// digit. We confirm every non-root cell's address equals its parent's address plus exactly one digit (the trie
// prefix property), so prefixes are physical and equality is address equality. Control: a flat trie stores a
// child pointer per edge. Reference, Margenstern 2007.

const isPrefixPlusOne = (parent: number[], child: number[]): boolean => {
  if (child.length !== parent.length + 1) return false
  for (let i = 0; i < parent.length; i++) if (parent[i] !== child[i]) return false
  return true
}

export default experiment({
  id: 'data-structure/trie-prefix',
  title: 'SS3: cell addresses form a trie, every address extends its parent by one digit',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const a = buildAddressing({ symbol: [3, 4, 3, 4], maxCells: 3000 })
    const cells = a.address.length
    let prefixConsistent = true
    let checked = 0
    for (let cell = 0; cell < cells; cell++) {
      const parent = a.parent[cell]!
      if (parent === -1) continue
      checked += 1
      if (!isPrefixPlusOne(a.address[parent]!, a.address[cell]!)) prefixConsistent = false
    }

    return verdict({
      status: prefixConsistent && checked > 0 ? 'pass' : 'fail',
      claim:
        'the cell addresses form a trie, every cell address is its parent address plus one digit, so prefixes are physical paths, a prefix query descends digit by digit, and equality is address equality',
      metrics: { cells, edgesChecked: checked, prefixConsistent: prefixConsistent ? 1 : 0 },
      // CONTROL: a flat trie stores one child pointer per edge, here the edge is the physical parent-child adjacency.
      control: { flatTriePointersStored: checked, bulkPointersStored: 0 },
      notes: 'SS3 of experiments/17, extends DS2. The same address sorts (SS7) and gives the Merkle path (DS11).',
    })
  },
})
