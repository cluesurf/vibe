// Conformance for code/substrate/sprinkle-box: a Poisson sprinkle into a Minkowski rectangle. The point
// count is round(density * area); the points lie inside the box; they come back sorted by time; and the
// whole sprinkle is a pure function of the seed, so the same seed reproduces the same points exactly. The
// count and ordering are EXACT; coordinates are reproduced exactly under a fixed seed.

import { suite, check, equal, ok } from '@/test/code/harness'
import { sprinkleBox } from '@/code/substrate/sprinkle-box'
import { makeWeyl } from '@/code/tool/weyl'

const cfg = { density: 5, tMax: 4, xMax: 3 }

suite('substrate/sprinkle-box: count, bounds, order', [
  check('the point count is round(density * area)', () => {
    const pts = sprinkleBox({ ...cfg, rng: makeWeyl({ start: 1 }) })

    // area = tMax * 2 * xMax = 4 * 6 = 24, expected count round(5*24) = 120.
    equal(pts.length, 120, 'count = density * area')
  }),
  check('points lie inside the box and are sorted by time', () => {
    const pts = sprinkleBox({ ...cfg, rng: makeWeyl({ start: 1 }) })

    for (const p of pts) {
      ok(p.t >= 0 && p.t <= cfg.tMax, 'time in range')
      ok(p.x >= -cfg.xMax && p.x <= cfg.xMax, 'space in range')
    }

    for (let i = 1; i < pts.length; i++) {
      ok(pts[i]!.t >= pts[i - 1]!.t, 'sorted by time')
    }
  }),
])

suite('substrate/sprinkle-box: determinism', [
  check('the same seed reproduces the same points', () => {
    const a = sprinkleBox({ ...cfg, rng: makeWeyl({ start: 42 }) })
    const b = sprinkleBox({ ...cfg, rng: makeWeyl({ start: 42 }) })

    equal(a.length, b.length, 'same count')

    for (let i = 0; i < a.length; i++) {
      equal(a[i]!.t, b[i]!.t, `time ${i} identical`)
      equal(a[i]!.x, b[i]!.x, `space ${i} identical`)
    }
  }),
])
