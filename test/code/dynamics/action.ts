// Conformance for code/dynamics/action: the causal-set actions. We re-derive the
// Benincasa-Dowker action on hand posets (a 3-chain, a 3-antichain, a V) by the published
// closed form and the smeared 2D action by its kernel, independently of the module, and
// check the smeared kernel against its algebraic form. The dimension-target action is
// the squared deviation of the Myrheim-Meyer dimension from a target.

import { suite, check, equal, close, ok } from '@/test/code/harness'
import {
  benincasaDowkerAction,
  smearedBenincasaDowker,
  smearedKernel2D,
  dimensionTargetAction,
} from '@/code/dynamics/action'
import { makePosetFromRelation, Poset } from '@/code/tool/poset'
import { myrheimMeyerDimension } from '@/code/measure/dimension'

// The 3-chain (total order 0 < 1 < 2), the 3-antichain, and the V (0 < 1, 0 < 2).
const chain3 = makePosetFromRelation({ size: 3, precedes: () => true })
const antichain3 = makePosetFromRelation({
  size: 3,
  precedes: () => false,
})

const vPoset = makePosetFromRelation({
  size: 3,
  precedes: ({ a }) => a === 0,
})

// The sharp 2D Benincasa-Dowker value re-derived: combination = relations - (N0 - 2 N1 + N2),
// where N_k is the count of related pairs whose Alexandrov interval has k elements.
function sharp2d(poset: Poset): number {
  return benincasaDowkerAction({ epsilon: 1, dimension: 2 }).value({
    poset,
  })
}

suite('dynamics/action: sharp Benincasa-Dowker (2D)', [
  check('3-chain value is 3', () => {
    // relations 3, N0 = 2 (the two covering pairs), N1 = 1 (the 0<2 interval {1}).
    // 3 - (1*2 - 2*1 + 1*0) = 3.
    equal(sharp2d(chain3), 3, 'chain: combination must be 3')
  }),
  check('3-antichain value is 0', () => {
    equal(sharp2d(antichain3), 0, 'antichain: no relations, value 0')
  }),
  check('V value is 0', () => {
    // relations 2 (both intervals empty), 2 - (1*2) = 0.
    equal(sharp2d(vPoset), 0, 'V: combination must be 0')
  }),
  check(
    'chain has strictly higher action than the V (monotone in relations)',
    () => {
      ok(
        sharp2d(chain3) > sharp2d(vPoset),
        'more curvature content -> larger action',
      )
    },
  ),
])

suite('dynamics/action: smeared 2D kernel', [
  check('closed forms at epsilon 0.1', () => {
    const e = 0.1

    close(smearedKernel2D({ n: 0, epsilon: e }), 1, 1e-12, 'f(0) = 1')
    close(
      smearedKernel2D({ n: 1, epsilon: e }),
      1 - 3 * e,
      1e-12,
      'f(1) = 1 - 3e',
    )

    close(
      smearedKernel2D({ n: 2, epsilon: e }),
      1 - 6 * e + 6 * e * e,
      1e-12,
      'f(2) = 1 - 6e + 6e^2',
    )
  }),
  check('at epsilon 1 only n=0 survives (sharp limit)', () => {
    equal(smearedKernel2D({ n: 0, epsilon: 1 }), 1, 'f(0) = 1')
    equal(smearedKernel2D({ n: 1, epsilon: 1 }), 0, 'f(1) = 0')
    equal(smearedKernel2D({ n: 2, epsilon: 1 }), 0, 'f(2) = 0')
  }),
  check('kernel is monotone decreasing in n at small epsilon', () => {
    const e = 0.1
    const f0 = smearedKernel2D({ n: 0, epsilon: e })
    const f1 = smearedKernel2D({ n: 1, epsilon: e })
    const f2 = smearedKernel2D({ n: 2, epsilon: e })

    ok(f0 > f1 && f1 > f2, 'f(0) > f(1) > f(2)')
  }),
])

suite('dynamics/action: smeared Benincasa-Dowker action (2D)', [
  check('3-chain value matches -N/2 + eps*(2 f(0) + f(1))', () => {
    const e = 0.1
    const value = smearedBenincasaDowker({
      epsilon: e,
      dimension: 2,
    }).value({ poset: chain3 })

    // sum over related pairs of f(interval): two interval-0 pairs and one interval-1 pair.
    const expected = -3 / 2 + e * (2 * 1 + (1 - 3 * e))

    close(value, expected, 1e-12, 'chain smeared action')
  }),
  check('3-antichain value is -N/2 (no related pairs)', () => {
    const e = 0.25
    const value = smearedBenincasaDowker({
      epsilon: e,
      dimension: 2,
    }).value({
      poset: antichain3,
    })

    close(value, -3 / 2, 1e-12, 'antichain smeared action = -N/2')
  }),
])

suite('dynamics/action: dimension-target action', [
  check(
    'value is the squared deviation of the Myrheim-Meyer dimension',
    () => {
      const d = myrheimMeyerDimension({ poset: chain3 })

      close(
        dimensionTargetAction({ target: d }).value({ poset: chain3 }),
        0,
        1e-9,
        'target = measured dimension -> 0',
      )

      close(
        dimensionTargetAction({ target: d + 2 }).value({
          poset: chain3,
        }),
        4,
        1e-9,
        'target offset by 2 -> 4',
      )
    },
  ),
])
