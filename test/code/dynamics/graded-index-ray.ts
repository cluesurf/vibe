// Conformance for code/dynamics/graded-index-ray: geodesics traced as rays in a graded-index medium.
// Invariants:
//   - NO GRADIENT, NO BENDING: a massless (mass 0) index field is uniform, so the ray passes straight.
//   - the analytic gradient of softenedMassIndexField matches a finite-difference of its index.
//   - WEAK LENSING: a positive mass bends the ray toward the matter (rayDeflection > 0).
//   - DETERMINISM.

import { suite, check, close, ok, equal } from '@/test/code/harness'
import {
  traceGradedIndexRay,
  rayDeflection,
  softenedMassIndexField,
} from '@/code/dynamics/graded-index-ray'

suite('dynamics/graded-index-ray: index field', [
  check('the analytic gradient matches a central finite difference', () => {
    const { index, indexGradient } = softenedMassIndexField({ mass: 2, soft: 1 })
    const h = 1e-5
    for (const [x, y] of [[3, 2], [-4, 1], [5, -3]] as const) {
      const [gx, gy] = indexGradient(x, y)
      const numGx = (index(x + h, y) - index(x - h, y)) / (2 * h)
      const numGy = (index(x, y + h) - index(x, y - h)) / (2 * h)
      close(gx, numGx, 1e-4, `dn/dx at (${x},${y})`)
      close(gy, numGy, 1e-4, `dn/dy at (${x},${y})`)
    }
  }),
])

suite('dynamics/graded-index-ray: deflection', [
  check('a uniform field (mass 0) bends nothing', () => {
    const field = softenedMassIndexField({ mass: 0 })
    const out = traceGradedIndexRay({ impact: 5, ...field })
    close(out.tangentY, 0, 1e-9, 'tangent stays along +x')
    close(rayDeflection({ impact: 5, ...field }), 0, 1e-9, 'zero deflection')
  }),
  check('a positive mass bends the ray toward the matter', () => {
    const field = softenedMassIndexField({ mass: 3, soft: 1 })
    ok(rayDeflection({ impact: 5, ...field }) > 0, 'bends toward the mass')
  }),
  check('the trace is deterministic', () => {
    const field = softenedMassIndexField({ mass: 2 })
    const run = (): number => rayDeflection({ impact: 4, ...field })
    equal(run(), run(), 'reproducible')
  }),
])
