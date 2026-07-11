// Conformance for code/dynamics/coined-walk-distribution: the position distribution of a coined walk.
// Invariants:
//   - QUANTUM UNITARITY: |psi|^2 sums to 1 (Born-rule norm), exactly conserved by the Hadamard walk.
//   - CLASSICAL CONSERVATION: the incoherent distribution sums to 1.
//   - SYMMETRY: the symmetric seed gives a left-right symmetric distribution about the offset.
//   - LATTICE LAYOUT: width = 2T + 3, offset = T + 1.
//   - DETERMINISM (no RNG).

import { suite, check, close, equal } from '@/test/code/harness'
import {
  coinedWalkQuantumDistribution,
  coinedWalkClassicalDistribution,
} from '@/code/dynamics/coined-walk-distribution'

suite('dynamics/coined-walk-distribution: conservation', [
  check(
    'the quantum distribution carries unit norm (unitarity)',
    () => {
      for (const steps of [5, 20, 50]) {
        const { norm } = coinedWalkQuantumDistribution({ steps })

        close(norm, 1, 1e-9, `norm = 1 at T=${steps}`)
      }
    },
  ),
  check('the classical distribution sums to 1', () => {
    for (const steps of [5, 20, 50]) {
      const { distribution } = coinedWalkClassicalDistribution({
        steps,
      })

      let sum = 0

      for (const p of distribution) sum += p

      close(sum, 1, 1e-9, `classical sum = 1 at T=${steps}`)
    }
  }),
])

suite('dynamics/coined-walk-distribution: layout and symmetry', [
  check('lattice width = 2T+3 and offset = T+1', () => {
    const q = coinedWalkQuantumDistribution({ steps: 7 })

    equal(q.width, 2 * 7 + 3, 'width')
    equal(q.offset, 7 + 1, 'offset')
  }),
  check(
    'the symmetric seed gives a left-right symmetric distribution',
    () => {
      const { distribution, offset } = coinedWalkQuantumDistribution({
        steps: 12,
      })

      for (let d = 1; d <= 12; d++) {
        close(
          distribution[offset + d]!,
          distribution[offset - d]!,
          1e-9,
          `symmetry at d=${d}`,
        )
      }
    },
  ),
  check('the classical distribution is also symmetric', () => {
    const { distribution, offset } = coinedWalkClassicalDistribution({
      steps: 12,
    })

    for (let d = 1; d <= 12; d++) {
      close(
        distribution[offset + d]!,
        distribution[offset - d]!,
        1e-12,
        `classical symmetry at d=${d}`,
      )
    }
  }),
])

suite('dynamics/coined-walk-distribution: determinism', [
  check('two quantum runs are bit-for-bit equal', () => {
    const a = coinedWalkQuantumDistribution({ steps: 20 }).distribution
    const b = coinedWalkQuantumDistribution({ steps: 20 }).distribution

    for (let i = 0; i < a.length; i++) equal(a[i]!, b[i]!, `cell ${i}`)
  }),
])
