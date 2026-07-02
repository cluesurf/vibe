// Conformance for code/substrate/layered-order: the three-layer Kleitman-Rothschild order. Every element
// of a lower layer precedes every element of a higher one, so the relation count is bottom*middle +
// bottom*top + middle*top, and the order is a genuine strict partial order (irreflexive, antisymmetric,
// transitive). The layer sizes are floor(n/4), the middle, floor(n/4). EXACT.

import { suite, check, equal, ok, notOk } from '@/test/code/harness'
import { kleitmanRothschildOrder } from '@/code/substrate/layered-order'
import { precedes, relationCount } from '@/code/tool/poset'

suite('substrate/layered-order: the layered partial order', [
  check('the relation count is the cross-layer product sum', () => {
    const n = 12
    const p = kleitmanRothschildOrder({ size: n })
    // bottom = top = floor(12/4) = 3, middle = 12 - 3 - 3 = 6.
    const bottom = 3
    const top = 3
    const middle = 6
    const expected = bottom * middle + bottom * top + middle * top
    equal(relationCount(p), expected, 'cross-layer relations')
    equal(expected, 45, 'explicit count')
  }),
  check('the order is irreflexive and antisymmetric', () => {
    const p = kleitmanRothschildOrder({ size: 16 })

    for (let i = 0; i < p.size; i++) {
      notOk(
        precedes(p, { a: i, b: i }),
        `no element precedes itself (${i})`,
      )
    }

    for (let a = 0; a < p.size; a++) {
      for (let b = 0; b < p.size; b++) {
        if (precedes(p, { a, b })) {
          notOk(
            precedes(p, { a: b, b: a }),
            `${a}<${b} forbids ${b}<${a}`,
          )
        }
      }
    }
  }),
  check('the order is transitive', () => {
    const p = kleitmanRothschildOrder({ size: 16 })

    for (let a = 0; a < p.size; a++) {
      for (let b = 0; b < p.size; b++) {
        if (!precedes(p, { a, b })) {
          continue
        }

        for (let c = 0; c < p.size; c++) {
          if (precedes(p, { a: b, b: c })) {
            ok(
              precedes(p, { a, b: c }),
              `${a}<${b}<${c} implies ${a}<${c}`,
            )
          }
        }
      }
    }
  }),
])
