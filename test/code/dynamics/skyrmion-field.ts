// Conformance for code/dynamics/skyrmion-field: the DM-stabilized Skyrmion spin field. Invariants:
//   - SPIN NORMALIZATION: makeSkyrmionField, relaxSpins, precessSpins, and snapToTrits all return unit spins.
//   - the topological degree of a uniform (all-up) field is 0.
//   - a Neel Skyrmion seed carries degree ~ -1 (the self's integer identity).
//   - REVERSIBLE PRECESSION preserves spin length (length-conserving rotation).
//   - DETERMINISM.

import { suite, check, close, equal } from '@/test/code/harness'
import {
  makeSkyrmionField,
  relaxSpins,
  precessSpins,
  skyrmionDegree,
  snapToTrits,
  Spin,
} from '@/code/dynamics/skyrmion-field'

const size = 16
const params = { size, exchange: 1, dm: 0.6, field: 0.3 }

const unitLength = (spins: Spin[]): void => {
  for (const s of spins) {
    close(Math.hypot(s[0], s[1], s[2]), 1, 1e-9, 'unit spin')
  }
}

suite('dynamics/skyrmion-field: normalization', [
  check(
    'the Skyrmion seed and the snapped-to-trit field are unit spins',
    () => {
      const spins = makeSkyrmionField({ size, coreRadius: 5 })
      unitLength(spins)
      unitLength(snapToTrits(spins))
    },
  ),
  check('relaxSpins and precessSpins preserve unit length', () => {
    let spins = makeSkyrmionField({ size, coreRadius: 5 })
    spins = relaxSpins({ spins, params, rate: 0.2 })
    unitLength(spins)
    spins = precessSpins({ spins, params, dt: 0.1, open: false })
    unitLength(spins)
  }),
])

suite('dynamics/skyrmion-field: topological degree', [
  check('a uniform all-up field has degree 0', () => {
    const uniform: Spin[] = Array.from(
      { length: size * size },
      () => [0, 0, 1] as Spin,
    )

    close(skyrmionDegree(uniform, size), 0, 1e-9, 'uniform degree 0')
  }),
  check('a Neel Skyrmion seed carries degree ~ -1', () => {
    const spins = makeSkyrmionField({ size, coreRadius: 5 })
    close(skyrmionDegree(spins, size), -1, 0.15, 'degree ~ -1')
  }),
])

suite('dynamics/skyrmion-field: determinism', [
  check('two precession runs agree', () => {
    const run = (): Spin[] => {
      let spins = makeSkyrmionField({ size, coreRadius: 5 })

      for (let t = 0; t < 10; t++) {
        spins = precessSpins({ spins, params, dt: 0.1, open: false })
      }

      return spins
    }

    const a = run()
    const b = run()

    for (let i = 0; i < a.length; i++) {
      equal(a[i]![0], b[i]![0], `x ${i}`)
      equal(a[i]![1], b[i]![1], `y ${i}`)
      equal(a[i]![2], b[i]![2], `z ${i}`)
    }
  }),
])
