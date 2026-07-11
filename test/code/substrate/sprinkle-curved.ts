// Conformance for code/substrate/sprinkle-curved: sprinkling a causal set into a (conformal) box. The
// pairwise flat light-cone relation (dt > 0 and dt^2 >= |dx|^2) is a genuine strict partial order: in flat
// Minkowski causal precedence is irreflexive, antisymmetric, and transitive (by the cone triangle
// inequality). The build is a pure function of the seed. Relations and determinism are EXACT.

import { suite, check, ok, notOk, equal } from '@/test/code/harness'
import { sprinkleCurved } from '@/code/substrate/sprinkle-curved'
import { precedes } from '@/code/tool/poset'
import { makeRng } from '@/code/tool/rng'
import { ManifoldSpec } from '@/code/tool/embedding'

const manifold: ManifoldSpec = { form: 'minkowski', dimension: 2 }

suite('substrate/sprinkle-curved: the causal order', [
  check(
    'the flat light-cone relation is a strict partial order',
    () => {
      const p = sprinkleCurved({
        manifold,
        count: 50,
        rng: makeRng({ seed: 4 }),
      })

      for (let i = 0; i < p.size; i++) {
        notOk(precedes(p, { a: i, b: i }), `no self-relation (${i})`)
      }

      for (let a = 0; a < p.size; a++) {
        for (let b = 0; b < p.size; b++) {
          if (precedes(p, { a, b })) {
            notOk(
              precedes(p, { a: b, b: a }),
              `${a}<${b} forbids reverse`,
            )

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
      }
    },
  ),
])

suite('substrate/sprinkle-curved: determinism', [
  check('the same seed reproduces the same order', () => {
    const a = sprinkleCurved({
      manifold,
      count: 40,
      rng: makeRng({ seed: 13 }),
    })

    const b = sprinkleCurved({
      manifold,
      count: 40,
      rng: makeRng({ seed: 13 }),
    })

    equal(a.size, b.size, 'same element count')

    for (let i = 0; i < a.size; i++) {
      for (let j = 0; j < a.size; j++) {
        equal(
          precedes(a, { a: i, b: j }),
          precedes(b, { a: i, b: j }),
          `relation ${i}<${j} identical`,
        )
      }
    }
  }),
])
