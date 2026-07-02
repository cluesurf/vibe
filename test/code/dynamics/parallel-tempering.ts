// Conformance for code/dynamics/parallel-tempering: replica exchange over causal sets.
// We test deterministically checkable mechanics, not statistical convergence:
//   - the swap acceptance min(1, exp((beta_a - beta_b)(S_a - S_b))) is exactly 1 when the
//     two betas are EQUAL (the exponent is 0, so every attempted swap is accepted).
//   - with a single replica no swaps are attempted, so the swap acceptance is 0.
//   - the run is deterministic under a fixed seed.

import { suite, check, equal } from '@/test/code/harness'
import { parallelTempering } from '@/code/dynamics/parallel-tempering'
import { benincasaDowkerAction } from '@/code/dynamics/action'
import { relationCount, Poset } from '@/code/tool/poset'
import { makeRng } from '@/code/tool/rng'

const action = benincasaDowkerAction({ epsilon: 1, dimension: 2 })
const observe = ({ poset }: { poset: Poset }): number =>
  relationCount(poset)

suite('dynamics/parallel-tempering: swap acceptance', [
  check('equal betas accept every swap (acceptance exactly 1)', () => {
    const result = parallelTempering({
      size: 4,
      betas: [1, 1],
      action,
      sweeps: 8,
      movesPerSweep: 2,
      observe,
      rng: makeRng({ seed: 5 }),
    })

    equal(
      result.swapAcceptance,
      1,
      'a zero exponent makes every swap accepted',
    )
  }),
  check('a single replica attempts no swaps (acceptance 0)', () => {
    const result = parallelTempering({
      size: 4,
      betas: [1],
      action,
      sweeps: 8,
      movesPerSweep: 2,
      observe,
      rng: makeRng({ seed: 5 }),
    })

    equal(
      result.swapAcceptance,
      0,
      'no adjacent pair, so no swap attempts',
    )
  }),
])

suite('dynamics/parallel-tempering: determinism', [
  check('two runs with the same seed agree exactly', () => {
    const run = (): ReturnType<typeof parallelTempering> =>
      parallelTempering({
        size: 4,
        betas: [0.5, 1.5, 2.5],
        action,
        sweeps: 10,
        movesPerSweep: 2,
        observe,
        rng: makeRng({ seed: 777 }),
      })

    const a = run()
    const b = run()
    equal(a.swapAcceptance, b.swapAcceptance, 'swap acceptance')
    equal(
      a.samplesByBeta.length,
      b.samplesByBeta.length,
      'replica count',
    )

    for (let r = 0; r < a.samplesByBeta.length; r++) {
      const sa = a.samplesByBeta[r]!
      const sb = b.samplesByBeta[r]!
      equal(sa.length, sb.length, `beta ${r}: sample count`)

      for (let i = 0; i < sa.length; i++) {
        equal(sa[i], sb[i], `beta ${r} sample ${i}`)
      }
    }
  }),
])
