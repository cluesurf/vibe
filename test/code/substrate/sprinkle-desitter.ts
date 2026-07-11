// Conformance for code/substrate/sprinkle-desitter: a causal set sprinkled into a de Sitter / FRW patch by
// proper volume, with the light cone read in conformal time and then transitively closed. The result is a
// genuine partial order (irreflexive, antisymmetric, transitive after closure), proper time comes back
// sorted, and the whole build is a pure function of the seed. EXACT relations and determinism.

import { suite, check, ok, notOk, equal } from '@/test/code/harness'
import { sprinkleDeSitter } from '@/code/substrate/sprinkle-desitter'
import { precedes } from '@/code/tool/poset'
import { makeRng } from '@/code/tool/rng'

const cfg = { count: 50, hubble: 1, properTime: 2, comovingWidth: 1 }

suite('substrate/sprinkle-desitter: the closed causal order', [
  check('the order is irreflexive, antisymmetric, transitive', () => {
    const { poset } = sprinkleDeSitter({
      ...cfg,
      rng: makeRng({ seed: 6 }),
    })

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
  check('proper time comes back sorted ascending', () => {
    const { tau } = sprinkleDeSitter({
      ...cfg,
      rng: makeRng({ seed: 6 }),
    })

    equal(tau.length, cfg.count, 'one tau per element')

    for (let i = 1; i < tau.length; i++)
      ok(tau[i]! >= tau[i - 1]!, 'tau ascending')
  }),
])

suite('substrate/sprinkle-desitter: determinism', [
  check('the same seed reproduces the same order', () => {
    const a = sprinkleDeSitter({ ...cfg, rng: makeRng({ seed: 21 }) })
    const b = sprinkleDeSitter({ ...cfg, rng: makeRng({ seed: 21 }) })

    for (let i = 0; i < a.tau.length; i++)
      equal(a.tau[i], b.tau[i], `tau ${i} identical`)

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
])
