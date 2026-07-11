// Conformance for code/substrate/branching-order: a 1+1 causal set grown by a local branching rule. The
// growth is a pure DETERMINISTIC function (a cell spawns a second child on the golden-ratio criterion, no
// randomness), so it yields the same widths and the same order on every run (determinism is required of the
// testbed). The resulting order is a genuine strict partial order (irreflexive, antisymmetric, transitive,
// because the past is inherited transitively). Widths stay >= 1.

import {
  suite,
  check,
  equal,
  ok,
  notOk,
  exactArray,
} from '@/test/code/harness'
import { growBranchingOrder } from '@/code/substrate/branching-order'
import { precedes } from '@/code/tool/poset'

const params = {
  generations: 6,
  initialWidth: 2,
  spawnFraction: 0.5,
  horizon: 0.4,
}

suite('substrate/branching-order: determinism', [
  check('repeated runs yield the same widths and order', () => {
    const a = growBranchingOrder(params)
    const b = growBranchingOrder(params)

    exactArray(a.widthPerGen, b.widthPerGen, 'widths identical')
    equal(a.poset.size, b.poset.size, 'same element count')

    for (let i = 0; i < a.poset.size; i++) {
      for (let j = 0; j < a.poset.size; j++) {
        equal(
          precedes(a.poset, { a: i, b: j }),
          precedes(b.poset, { a: i, b: j }),
          `relation ${i}<${j} identical`,
        )
      }
    }
  }),
  check(
    'the width vector has one entry per generation and stays positive',
    () => {
      const r = growBranchingOrder(params)

      equal(
        r.widthPerGen.length,
        params.generations + 1,
        'widths length',
      )
      equal(r.widthPerGen[0], params.initialWidth, 'initial width')

      for (const w of r.widthPerGen) ok(w >= 1, 'width at least 1')
    },
  ),
])

suite('substrate/branching-order: it is a partial order', [
  check('irreflexive, antisymmetric, transitive', () => {
    const { poset } = growBranchingOrder(params)

    for (let i = 0; i < poset.size; i++)
      notOk(precedes(poset, { a: i, b: i }), `no self-relation (${i})`)

    for (let a = 0; a < poset.size; a++) {
      for (let b = 0; b < poset.size; b++) {
        if (precedes(poset, { a, b })) {
          notOk(
            precedes(poset, { a: b, b: a }),
            `${a}<${b} forbids reverse`,
          )

          for (let c = 0; c < poset.size; c++) {
            if (precedes(poset, { a: b, b: c })) {
              ok(
                precedes(poset, { a, b: c }),
                `${a}<${b}<${c} implies ${a}<${c}`,
              )
            }
          }
        }
      }
    }
  }),
])
