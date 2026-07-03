// Conformance for code/operator/overlap-su2: the Banks-Casher chiral-condensate signal of the
// overlap fermion in a random NON-ABELIAN SU(2) gauge field. As for the Abelian case, the
// condensate is a statistical ensemble quantity (physics, tested at the experiment level) and
// the exact linear algebra lives in the helpers. The re-derivable facts of THIS public API:
//   - The near-zero density is a genuine fraction in [0, 1].
//   - At disorder 0 every SU(2) link is the identity regardless of the RNG (randomSu2 returns
//     the unit quaternion), so the free-field signal is deterministic: seed- and config-count
//     independent.

import { suite, check, ok, equal } from '@/test/code/harness'
import { chiralCondensateSignalSU2 } from '@/code/operator/overlap-su2'
import { makeRng } from '@/code/tool/rng'

suite('operator/overlap-su2: signal sanity', [
  check('the near-zero density is a fraction in [0, 1]', () => {
    const result = chiralCondensateSignalSU2({
      length: 3,
      disorder: 0.5,
      configs: 1,
      rng: makeRng({ seed: 11 }),
    })

    ok(Number.isFinite(result.nearZeroDensity), 'finite')
    ok(
      result.nearZeroDensity >= 0 && result.nearZeroDensity <= 1,
      'in [0,1]',
    )
  }),
  check(
    'the free field (disorder 0) is deterministic across RNG seeds',
    () => {
      const a = chiralCondensateSignalSU2({
        length: 3,
        disorder: 0,
        configs: 1,
        rng: makeRng({ seed: 2 }),
      })

      const b = chiralCondensateSignalSU2({
        length: 3,
        disorder: 0,
        configs: 1,
        rng: makeRng({ seed: 555 }),
      })

      equal(
        a.nearZeroDensity,
        b.nearZeroDensity,
        'seed independence at disorder 0',
      )
    },
  ),
  check(
    'the free field is deterministic across the number of configs averaged',
    () => {
      const one = chiralCondensateSignalSU2({
        length: 3,
        disorder: 0,
        configs: 1,
        rng: makeRng({ seed: 2 }),
      })

      const two = chiralCondensateSignalSU2({
        length: 3,
        disorder: 0,
        configs: 2,
        rng: makeRng({ seed: 2 }),
      })

      equal(
        one.nearZeroDensity,
        two.nearZeroDensity,
        'config-count independence at disorder 0',
      )
    },
  ),
])
