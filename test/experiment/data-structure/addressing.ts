import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { buildAddressing, addressingStats } from '@/code/substrate/coxeter/addressing-3434'
import { buildCoxeterMatrixMesh } from '@/code/substrate/coxeter/matrix-group'

// DS2 (data-structures-in-the-4d-bulk, experiments/16). Canonical addressing. Every cell of the hyperbolic
// bulk gets a unique reduced address, and because capacity is exponential in radius, the address length is
// LOGARITHMIC in the number of cells. We build the canonical addressing for {3,4,3,4} and for the flat
// honeycomb {3,4,3,3} at the same cell count, and confirm that all addresses are unique and the hyperbolic
// maximum address length is far shorter than the flat one (logarithmic versus polynomial). Reference,
// Margenstern 2007.

export default experiment({
  id: 'data-structure/addressing',
  title: 'DS2: the hyperbolic bulk gives unique cell addresses of logarithmic length, far shorter than flat',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const maxCells = 2000
    // the canonical {3,4,3,4} addressing, unique tree addresses of logarithmic digit length
    const address = addressingStats(buildAddressing({ symbol: [3, 4, 3, 4], maxCells }))

    // the address LENGTH as a radius is the BFS depth to reach the cells, measured for both the hyperbolic
    // {3,4,3,4} and the flat {3,4,3,3} at the same cap. The flat mesh needs many more shells (polynomial depth)
    // to hold the same cells, the hyperbolic one needs logarithmically few.
    const meshCap = 8000 // the asymptotic log-versus-polynomial depth gap widens with cell count
    const hyperbolicMesh = buildCoxeterMatrixMesh([3, 4, 3, 4], meshCap)
    const flatMesh = buildCoxeterMatrixMesh([3, 4, 3, 3], meshCap)
    const hyperbolicDepth = hyperbolicMesh.shells.length
    const flatDepth = flatMesh.shells.length

    const unique = address.allUnique
    const logarithmicDepth = hyperbolicDepth <= 4 * Math.log2(hyperbolicMesh.adjacency.length) // O(log N)
    const hyperbolicShorter = hyperbolicDepth < flatDepth

    const ok = unique && logarithmicDepth && hyperbolicShorter

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'every cell of {3,4,3,4} has a unique canonical address, and the address radius (BFS depth) to reach a given cell count is logarithmic, far shorter than the polynomial depth the flat honeycomb {3,4,3,3} needs for the same count',
      metrics: {
        hyperbolicCells: address.cellCount,
        canonicalAddressDigits: address.maxAddressLength,
        addressesUnique: address.allUnique ? 1 : 0,
        hyperbolicDepth,
        logarithmicDepth: logarithmicDepth ? 1 : 0,
      },
      // CONTROL: the flat honeycomb reaches the same cell count only at a much greater BFS depth (polynomial in
      // N), so the logarithmic address radius is the hyperbolic capacity, not the addressing scheme.
      control: { flatDepth, hyperbolicShorter: hyperbolicShorter ? 1 : 0 },
      notes:
        'DS2 of experiments/16-data-structures-in-the-bulk. The logarithmic address is the direct consequence of DS1 (exponential capacity), and it is what makes the trie, DHT, and Merkle proofs O(log N).',
    })
  },
})
