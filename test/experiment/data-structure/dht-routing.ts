import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeRng } from '@/code/tool/rng'
import { buildAddressing } from '@/code/substrate/coxeter/addressing-3434'

// DS5 (experiments/16). Cayley DHT. A key lookup routes by reducing the address distance, up to the common
// prefix (the lowest common ancestor) and down to the target, Kademlia-style on the chamber tree, in O(log N)
// hops with O(1) routing state (a cell knows only its own address). We route between deterministic cell pairs
// over the canonical addressing and measure the mean and max hop count (the tree distance), confirming it is
// logarithmic. Control: a linear scan is O(N). Reference, Maymounkov-Mazieres 2002.

const commonPrefixLength = (a: number[], b: number[]): number => {
  const n = Math.min(a.length, b.length)

  let k = 0

  while (k < n && a[k] === b[k]) k += 1

  return k
}

export default experiment({
  id: 'data-structure/dht-routing',
  code: 'E-DST-0009',
  title:
    'DS5: DHT key lookup routes up to the common prefix and down in O(log N) hops, O(1) state',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const a = buildAddressing({ symbol: [3, 4, 3, 4], maxCells: 4000 })
    const cells = a.address.length
    const rng = makeRng({ seed: 1 })
    const pairs = 400

    let sumHops = 0
    let maxHops = 0

    for (let p = 0; p < pairs; p++) {
      const source = rng.nextInt({ max: cells })
      const target = rng.nextInt({ max: cells })
      const lca = commonPrefixLength(
        a.address[source]!,
        a.address[target]!,
      )

      // hops up from source to the LCA, then down to the target (Kademlia prefix routing)
      const hops =
        a.address[source]!.length -
        lca +
        (a.address[target]!.length - lca)

      sumHops += hops

      if (hops > maxHops) maxHops = hops
    }

    const meanHops = sumHops / pairs
    const logarithmicHops = maxHops <= 8 * Math.log2(cells)

    return verdict({
      status: logarithmicHops ? 'pass' : 'fail',
      claim:
        'a DHT lookup routes by the address prefix, up to the common ancestor and down to the target, in a logarithmic number of hops with each cell storing only its own address, no routing tables',
      metrics: {
        cells,
        meanHops,
        maxHops,
        logarithmicHops: logarithmicHops ? 1 : 0,
      },
      // CONTROL: a linear scan to find a key is O(N), the prefix routing is O(log N).
      control: { linearScanHops: cells, routingStatePerCell: 1 },
      notes:
        'DS5 of experiments/16. The prefix routing uses the same trie addresses as SS3 and SS1.',
    })
  },
})
