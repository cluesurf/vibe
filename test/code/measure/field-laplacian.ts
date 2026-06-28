// Conformance for code/measure/field-laplacian: the five-point discrete Laplacian of a sampled field.
// A linear field is harmonic, so the integrated |Laplacian| is zero. For f = x^2 + y^2 the discrete
// Laplacian is exactly 4 h^2 at every cell, so the integrated total is 4 h^2 (2 radius + 1)^2, an exact
// closed form. A single localized bump has its |Laplacian| peak at the origin (peakRadius 0).

import { suite, check, close, ok, equal } from '@/test/code/harness'
import { fieldLaplacianProfile } from '@/code/measure/field-laplacian'

suite('measure/field-laplacian: harmonic and quadratic fields', [
  // A linear (harmonic) field has zero Laplacian everywhere.
  check('a linear field integrates to zero', () => {
    const r = fieldLaplacianProfile({
      field: (x, y) => 3 * x - 2 * y + 1,
      radius: 4,
    })
    close(r.total, 0, 1e-9)
  }),
  // f = x^2 + y^2: five-point Laplacian = 2h^2 + 2h^2 = 4h^2 per cell, over (2r+1)^2 cells.
  check('a paraboloid integrates to 4 (2r+1)^2 at step 1', () => {
    const radius = 3
    const r = fieldLaplacianProfile({ field: (x, y) => x * x + y * y, radius })
    close(r.total, 4 * (2 * radius + 1) ** 2, 1e-9)
  }),
  // The same with step h: per-cell Laplacian scales as 4 h^2.
  check('the step h scales the Laplacian as 4 h^2', () => {
    const radius = 3
    const h = 2
    const r = fieldLaplacianProfile({ field: (x, y) => x * x + y * y, radius, step: h })
    close(r.total, 4 * h * h * (2 * radius + 1) ** 2, 1e-9)
  }),
])

suite('measure/field-laplacian: localized source', [
  // A bump 1/(1 + x^2 + y^2) has its |Laplacian| peak at the center.
  check('a single bump peaks at the origin', () => {
    const r = fieldLaplacianProfile({
      field: (x, y) => 1 / (1 + x * x + y * y),
      radius: 6,
    })
    equal(r.peakRadius, 0)
    ok(r.total > 0, 'a curved field has positive integrated curvature')
  }),
])
