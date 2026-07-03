// Conformance for code/measure/probe-directions. coordinateAxes returns the 2*dim
// signed axes exactly. probeDirections returns unit vectors and must be
// NON-degenerate: the audit fixed a plastic-number bug where (because rho^3 = rho + 1)
// coordinate 3 came out the exact negative of coordinate 2 on every sample, folding the
// whole set onto a plane. These checks fail loudly if that degeneracy returns.

import {
  suite,
  check,
  close,
  equal,
  exactArray,
  ok,
} from '@/test/code/harness'
import {
  coordinateAxes,
  probeDirections,
} from '@/code/measure/probe-directions'

suite('measure/probe-directions: coordinateAxes', [
  check('dimension 3 returns the 6 signed coordinate axes', () => {
    const axes = coordinateAxes(3)
    equal(axes.length, 6)
    exactArray(axes[0]!, [1, 0, 0])
    exactArray(axes[1]!, [-1, 0, 0])
    exactArray(axes[2]!, [0, 1, 0])
    exactArray(axes[3]!, [0, -1, 0])
    exactArray(axes[4]!, [0, 0, 1])
    exactArray(axes[5]!, [0, 0, -1])
  }),
  check('dimension 4 returns 8 = 2*dim axes', () => {
    equal(coordinateAxes(4).length, 8)
  }),
])

suite('measure/probe-directions: probeDirections unit vectors', [
  check('every direction is a unit vector (dim 3 and 4)', () => {
    for (const dimension of [3, 4]) {
      const dirs = probeDirections({ count: 50, dimension })
      equal(dirs.length, 50)

      for (const d of dirs) {
        equal(d.length, dimension)
        close(Math.hypot(...d), 1, 1e-12)
      }
    }
  }),
])

suite('measure/probe-directions: non-degeneracy (plastic-number fix)', [
  check(
    'REGRESSION: coord 3 is never the exact negative of coord 2 (dim 3, 4)',
    () => {
      for (const dimension of [3, 4]) {
        const dirs = probeDirections({ count: 64, dimension })

        let degenerate = 0

        for (const d of dirs) {
          // The fixed bug forced d[2] === -d[1] on EVERY sample. Count any that still do.
          if ((d[1]! + d[2]!) === 0) {degenerate++}
        }

        equal(degenerate, 0)
      }
    },
  ),
  check(
    'the directions span all axes (no axis collapses to a constant)',
    () => {
      // If the set folded onto a plane, some axis would carry near-zero spread.
      const dirs = probeDirections({ count: 256, dimension: 4 })

      for (let axis = 0; axis < 4; axis++) {
        const values = dirs.map(d => d[axis]!)
        const mean = values.reduce((a, b) => a + b, 0) / values.length
        const variance =
          values.reduce((a, v) => a + (v - mean) ** 2, 0) /
          values.length

        ok(
          variance > 0.01,
          `axis ${axis} must carry real spread, got var ${variance}`,
        )
      }
    },
  ),
  check('the mean direction is ~ 0 (a well-spread set)', () => {
    const dirs = probeDirections({ count: 1000, dimension: 3 })
    const mean = [0, 0, 0]

    for (const d of dirs) {
      for (let i = 0; i < 3; i++) {mean[i]! += d[i]! / dirs.length}
    }

    ok(
      Math.hypot(...mean) < 0.1,
      `mean direction ${String(mean)} should be near origin`,
    )
  }),
])
