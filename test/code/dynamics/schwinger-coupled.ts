// Conformance for code/dynamics/schwinger-coupled: the coupled fermion + gauge evolution on a 1+1D ring.
// Invariants:
//   - DECOUPLING at e = 0: with zero coupling the back-reaction vanishes, so the electric field never leaves
//     its constant background and the sourced field energy is EXACTLY 0.
//   - COUPLING SOURCES THE FIELD: a nonzero coupling with a moving charge sources field energy (> 0).
//   - DETERMINISM (a fixed Gaussian seed, no randomness).

import { suite, check, close, ok, equal } from '@/test/code/harness'
import { runCoupledSchwinger } from '@/code/dynamics/schwinger-coupled'

const base = {
  sites: 48,
  mass: 0.3,
  flavors: 1,
  backgroundField: 0.2,
  momentumStart: 0.5,
  steps: 30,
  dt: 0.1,
}

suite('dynamics/schwinger-coupled: decoupling and sourcing', [
  check('zero coupling sources exactly zero field energy', () => {
    const out = runCoupledSchwinger({ ...base, coupling: 0 })

    close(
      out.fieldEnergy,
      0,
      1e-9,
      'no coupling, no sourced field energy',
    )
  }),
  check('a nonzero coupling sources field energy', () => {
    const out = runCoupledSchwinger({ ...base, coupling: 0.4 })

    ok(out.fieldEnergy > 0, 'the moving charge sources the field')
  }),
])

suite('dynamics/schwinger-coupled: determinism', [
  check('two identical runs agree', () => {
    const a = runCoupledSchwinger({ ...base, coupling: 0.4 })
    const b = runCoupledSchwinger({ ...base, coupling: 0.4 })

    equal(a.fieldEnergy, b.fieldEnergy, 'field energy')
    equal(a.momentumDrift, b.momentumDrift, 'momentum drift')
  }),
])
