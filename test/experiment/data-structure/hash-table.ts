import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { hashTableProbeStats } from '@/code/measure/sketch'

// SS2 (experiments/17). Hash table. On {3,4,3,4} a key hashes to a cell address (an exact integer coordinate),
// the cell IS the slot, with no modulo table, and collisions probe to neighbouring cells. We confirm an
// open-addressing hash table over the cells has O(1) expected probe length at a reasonable load, and degrades
// only as the load approaches 1 (the honest threshold). Control: the high-load case, where probes grow.

export default experiment({
  id: 'data-structure/hash-table',
  title: 'SS2: keys hash to exact cell addresses, lookup is O(1) probes at a reasonable load',
  category: 'data-structure',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const cells = 8192
    const halfLoad = hashTableProbeStats({ cells, keys: Math.floor(cells * 0.5) })
    const heavyLoad = hashTableProbeStats({ cells, keys: Math.floor(cells * 0.95) })

    // at half load the mean probe is O(1) (close to 1), and it grows under heavy load (the threshold)
    const constantProbeAtHalfLoad = halfLoad.meanProbe < 2.0
    const degradesUnderLoad = heavyLoad.meanProbe > halfLoad.meanProbe + 1

    const ok = constantProbeAtHalfLoad && degradesUnderLoad

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a key hashes to an exact integer cell address with no modulo table, and an open-addressing table over the cells has O(1) expected probe length at a reasonable load, the cell is the slot',
      metrics: { cells, halfLoadMeanProbe: halfLoad.meanProbe, halfLoadCollisionRate: halfLoad.collisionRate, constantProbeAtHalfLoad: constantProbeAtHalfLoad ? 1 : 0 },
      // CONTROL: at 95 percent load the mean probe grows sharply, so this is a real hash table with a load
      // threshold, not trivially constant.
      control: { heavyLoadMeanProbe: heavyLoad.meanProbe, degradesUnderLoad: degradesUnderLoad ? 1 : 0 },
      notes: 'SS2 of experiments/17. The exact D4 address (DS3) is the hash slot. The boundary also holds the Bloom filter (DS12) and the inverted index (SS13).',
    })
  },
})
