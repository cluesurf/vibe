// Conformance for code/dynamics/replication: deterministic self-replication. Invariants:
//   - POPULATION GROWTH: each generation doubles the population, so after g generations there are 2^g copies.
//   - FAITHFUL inheritance: a lossless constructor keeps every copy bit-identical (meanIdentity = 1).
//   - LOSSY constructor breaks the identity (meanIdentity < 1, not all identical).
//   - DETERMINISM (no RNG).

import { suite, check, equal, ok } from '@/test/code/harness'
import { replicate } from '@/code/dynamics/replication'

const template = Int8Array.from([1, -1, 1, 1, -1, 1, -1, 1])

suite('dynamics/replication: faithful inheritance', [
  check('population doubles each generation and stays bit-identical', () => {
    for (const g of [1, 3, 5]) {
      const out = replicate({ template, generations: g, faithful: true })
      equal(out.copies, 2 ** g, `2^${g} copies`)
      equal(out.meanIdentity, 1, 'every copy is identical to the template')
      ok(out.allIdentical, 'allIdentical flag set')
    }
  }),
])

suite('dynamics/replication: lossy constructor', [
  check('a lossy copier breaks the identity', () => {
    const out = replicate({ template, generations: 4, faithful: false })
    ok(out.meanIdentity < 1, 'mean identity drops below 1')
    ok(!out.allIdentical, 'not all identical')
  }),
])

suite('dynamics/replication: determinism', [
  check('two identical runs agree', () => {
    const a = replicate({ template, generations: 4, faithful: false })
    const b = replicate({ template, generations: 4, faithful: false })
    equal(a.copies, b.copies, 'copies')
    equal(a.meanIdentity, b.meanIdentity, 'mean identity')
  }),
])
