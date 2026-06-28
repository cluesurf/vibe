// Conformance for code/operator/overlap-condensate: the Banks-Casher chiral-condensate signal
// of the gamma5-Hermitian overlap fermion in a random U(1) gauge field (2D Schwinger model).
// The condensate value is a STATISTICAL quantity over a gauge ensemble (a physics claim tested
// at the experiment level), and the exact linear algebra it rests on (the matrix sign being an
// involution, gamma5-Hermiticity) lives in the eig-hermitian / block helpers, tested there. The
// re-derivable facts exposed by THIS public API are:
//   - The returned near-zero density is a genuine fraction in [0, 1].
//   - The free field (disorder 0) makes every link phase identically 0 regardless of the RNG, so
//     the signal is deterministic: independent of the seed and of how many configs are averaged.

import { suite, check, ok, equal } from '@/test/code/harness'
import { chiralCondensateSignal } from '@/code/operator/overlap-condensate'
import { makeRng } from '@/code/tool/rng'

suite('operator/overlap-condensate: signal sanity', [
  check('the near-zero density is a fraction in [0, 1]', () => {
    const result = chiralCondensateSignal({
      length: 3,
      disorder: 0.5,
      configs: 1,
      rng: makeRng({ seed: 7 }),
    })
    ok(Number.isFinite(result.nearZeroDensity), 'finite')
    ok(result.nearZeroDensity >= 0 && result.nearZeroDensity <= 1, 'in [0,1]')
  }),
  check('the free field (disorder 0) is deterministic across RNG seeds', () => {
    const a = chiralCondensateSignal({ length: 3, disorder: 0, configs: 1, rng: makeRng({ seed: 1 }) })
    const b = chiralCondensateSignal({ length: 3, disorder: 0, configs: 1, rng: makeRng({ seed: 999 }) })
    equal(a.nearZeroDensity, b.nearZeroDensity, 'seed independence at disorder 0')
  }),
  check('the free field is deterministic across the number of configs averaged', () => {
    const one = chiralCondensateSignal({ length: 3, disorder: 0, configs: 1, rng: makeRng({ seed: 1 }) })
    const three = chiralCondensateSignal({ length: 3, disorder: 0, configs: 3, rng: makeRng({ seed: 1 }) })
    equal(one.nearZeroDensity, three.nearZeroDensity, 'config-count independence at disorder 0')
  }),
])
