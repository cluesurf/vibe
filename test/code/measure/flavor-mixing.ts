// Conformance for code/measure/flavor-mixing: the Gatto-Sartori-Tonin relation tan(theta) =
// sqrt(m_light / m_heavy) and the Wolfenstein hierarchy. The mixing element |V| = sin(theta) has the
// independent closed form sqrt(r / (1 + r)) with r = m_light / m_heavy, which is checked directly,
// along with the monotonic small-mixing-from-steep-hierarchy behavior and the lambda^n scaling.

import { suite, check, close, ok } from '@/test/code/harness'
import {
  mixingAngleFromMassRatio,
  mixingElementFromMassRatio,
  wolfensteinHierarchy,
} from '@/code/measure/flavor-mixing'

const TOL = 1e-12

suite('measure/flavor-mixing: Gatto-Sartori-Tonin', [
  // theta = atan(sqrt(r)); a degenerate pair (r=1) gives the maximal angle pi/4.
  check('degenerate masses give the maximal angle pi/4', () => {
    close(mixingAngleFromMassRatio({ lightMass: 1, heavyMass: 1 }), Math.PI / 4, TOL)
  }),
  // |V| = sin(atan(sqrt(r))) = sqrt(r / (1 + r)), an independent closed form.
  check('the mixing element is sqrt(r / (1 + r))', () => {
    for (const [light, heavy] of [
      [0.05, 1],
      [0.001, 1],
      [0.5, 1],
      [2, 3],
    ]) {
      const r = light! / heavy!
      close(
        mixingElementFromMassRatio({ lightMass: light!, heavyMass: heavy! }),
        Math.sqrt(r / (1 + r)),
        TOL,
      )
    }
  }),
  // The Cabibbo angle: m_d/m_s ~ 0.05 gives |V_us| ~ 0.22 (the observed quark mixing).
  check('the Cabibbo element is about 0.22 for m_d/m_s ~ 0.05', () => {
    close(mixingElementFromMassRatio({ lightMass: 0.05, heavyMass: 1 }), 0.218, 0.01)
  }),
  // A steep hierarchy gives smaller mixing than a mild one.
  check('steeper hierarchy means smaller mixing', () => {
    const steep = mixingElementFromMassRatio({ lightMass: 0.001, heavyMass: 1 })
    const mild = mixingElementFromMassRatio({ lightMass: 0.5, heavyMass: 1 })
    ok(steep < mild, `expected ${steep} < ${mild}`)
  }),
])

suite('measure/flavor-mixing: Wolfenstein hierarchy', [
  // [lambda, lambda^2, lambda^3] for [|V_us|, |V_cb|, |V_ub|].
  check('the three scales are powers of lambda', () => {
    const lambda = 0.22
    const h = wolfensteinHierarchy(lambda)
    close(h.vus, lambda, TOL)
    close(h.vcb, lambda * lambda, TOL)
    close(h.vub, lambda ** 3, TOL)
  }),
  check('the hierarchy is strictly decreasing for lambda < 1', () => {
    const h = wolfensteinHierarchy(0.22)
    ok(h.vus > h.vcb && h.vcb > h.vub, 'expected vus > vcb > vub')
  }),
])
