// Conformance for code/dynamics/nucleation: the critical-nucleus threshold (deterministic, no RNG).
// Invariant (a known-limit / threshold result): with the calibrated hysteresis rule, a small seed droplet
// dies (surface tension shrinks it) while a large one survives and spreads. The transition is monotone in
// seed size. Parameters match the abiogenesis-threshold experiment. Deterministic.

import { suite, check, ok, equal } from '@/test/code/harness'
import { nucleate } from '@/code/dynamics/nucleation'

const common = {
  side: 81,
  neighborRadius: 3,
  stay: 0.42,
  grow: 0.55,
  beats: 60,
}

suite('dynamics/nucleation: critical nucleus', [
  check('a small seed dies out', () => {
    const small = nucleate({ ...common, seedRadius: 2 })
    ok(!small.survived, 'sub-critical seed dies')
    ok(small.finalFraction < 0.004, 'fraction collapses to ~ 0')
  }),
  check('a large seed survives and spreads', () => {
    const large = nucleate({ ...common, seedRadius: 8 })
    ok(large.survived, 'super-critical seed persists')
    ok(
      large.finalFraction > large.initialFraction * 0.5,
      'holds most of its mass',
    )
  }),
  check(
    'persistence is monotone in seed size (no large dies, no small survives)',
    () => {
      const radii = [2, 3, 4, 6, 8, 10]
      const survived = radii.map(
        seedRadius => nucleate({ ...common, seedRadius }).survived,
      )

      for (let i = 1; i < survived.length; i++) {
        ok(
          !(survived[i] === false && survived[i - 1] === true),
          `monotone at radius ${radii[i]}`,
        )
      }
    },
  ),
])

suite('dynamics/nucleation: determinism', [
  check('two runs agree', () => {
    const a = nucleate({ ...common, seedRadius: 8 })
    const b = nucleate({ ...common, seedRadius: 8 })
    equal(a.finalFraction, b.finalFraction, 'final fraction')
    equal(a.survived, b.survived, 'survived')
  }),
])
