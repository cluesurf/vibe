// Conformance for code/dynamics/exact-enumeration: exact Boltzmann averages over every
// naturally-labelled causal set at small N. We hand-enumerate the small cases:
//   - N=2: 2 transitive relations; N=3: 7 (all eight upper-triangular relations except the
//     intransitive {0<1, 1<2} missing 0<2).
//   - with the action = relation count, the partition function and the mean relation count
//     match the closed-form Boltzmann sums independently re-derived.

import { suite, check, equal, close } from '@/test/code/harness'
import { exactCausalSetAverages } from '@/code/dynamics/exact-enumeration'
import { Action } from '@/code/dynamics/action'
import { relationCount, Poset } from '@/code/tool/poset'

// Action whose value is the number of related pairs, so the Boltzmann sums are closed-form.
const relationAction: Action = {
  form: 'action',
  name: 'relation-count',
  epsilon: 0,
  value: ({ poset }) => relationCount(poset),
}

const countObserver = ({ poset }: { poset: Poset }): number => relationCount(poset)

suite('dynamics/exact-enumeration: transitive-relation counts', [
  check('N=2 has 2 transitive relations', () => {
    const { count } = exactCausalSetAverages({
      size: 2,
      betas: [0],
      action: relationAction,
      observers: [countObserver],
    })
    equal(count, 2, 'empty and 0<1')
  }),
  check('N=3 has 7 transitive relations', () => {
    const { count } = exactCausalSetAverages({
      size: 3,
      betas: [0],
      action: relationAction,
      observers: [countObserver],
    })
    equal(count, 7, 'all 8 subsets except the intransitive {0<1,1<2}')
  }),
])

suite('dynamics/exact-enumeration: Boltzmann averages', [
  check('N=2, betas [0,1]: partition function and mean relation count', () => {
    const { z, means } = exactCausalSetAverages({
      size: 2,
      betas: [0, 1],
      action: relationAction,
      observers: [countObserver],
    })
    // relations over the two states: 0 and 1. weight = exp(-beta * relations).
    close(z[0]!, 2, 1e-12, 'Z(0) = 1 + 1 = 2')
    close(z[1]!, 1 + Math.exp(-1), 1e-12, 'Z(1) = 1 + e^-1')
    close(means[0]![0]!, 1 / 2, 1e-12, 'uniform mean = (0+1)/2')
    close(
      means[1]![0]!,
      Math.exp(-1) / (1 + Math.exp(-1)),
      1e-12,
      'mean = e^-1 / (1 + e^-1)',
    )
  }),
  check('N=3 uniform (beta=0) mean relation count is 10/7', () => {
    const { z, means } = exactCausalSetAverages({
      size: 3,
      betas: [0],
      action: relationAction,
      observers: [countObserver],
    })
    // relation counts of the 7 transitive orders: 0,1,1,1,2,2,3 -> sum 10.
    close(z[0]!, 7, 1e-12, 'Z(0) = 7')
    close(means[0]![0]!, 10 / 7, 1e-12, 'uniform mean relation count')
  }),
])
