// Conformance for code/dynamics/swerve-walk: the Dowker-Henson-Sorkin swerve on a 2D causal set.
// The walk is DETERMINISTIC (it always hops to the future element whose rapidity is closest to the
// current one). Invariants:
//   - DETERMINISM: the same point set gives the same trace.
//   - PROPER TIME accumulates strictly (each hop adds a positive proper time in [tauLo, tauHi]).
//   - STRAIGHT-LINE limit: if a directly-ahead (dx = 0) element is always available, the rapidity stays
//     0 (no swerve) and proper time advances by the shell time each step.

import { suite, check, equal, ok, close } from '@/test/code/harness'
import { swerveWalk } from '@/code/dynamics/swerve-walk'
import { SprinkledPoint } from '@/code/substrate/sprinkle-box'

// A causal set with a straight column directly ahead (x = 0) at every integer time, plus a few
// off-axis timelike elements (rapidity != 0) so the closest-to-current selection is non-trivial.
function points(): SprinkledPoint[] {
  const pts: SprinkledPoint[] = []

  for (let t = 1; t <= 12; t++) {
    pts.push({ t, x: 0 })
  }

  // off-axis but timelike from the origin column (|dx| < dt)
  pts.push({ t: 4, x: 1 })
  pts.push({ t: 6, x: -2 })
  pts.push({ t: 8, x: 3 })

  return pts
}

suite('dynamics/swerve-walk: determinism', [
  check('the same point set gives an identical trace', () => {
    const a = swerveWalk({
      points: points(),
      steps: 6,
      tauLo: 0.5,
      tauHi: 1.5,
    })

    const b = swerveWalk({
      points: points(),
      steps: 6,
      tauLo: 0.5,
      tauHi: 1.5,
    })

    equal(a.length, b.length, 'same trace length')

    for (let i = 0; i < a.length; i++) {
      equal(a[i]!.tau, b[i]!.tau, `tau ${i}`)
      equal(a[i]!.rapidity, b[i]!.rapidity, `rapidity ${i}`)
    }
  }),
])

suite('dynamics/swerve-walk: proper time and the straight limit', [
  check('proper time strictly increases along the trace', () => {
    const trace = swerveWalk({
      points: points(),
      steps: 6,
      tauLo: 0.5,
      tauHi: 1.5,
    })

    ok(trace.length > 1, 'walk took several steps')

    for (let i = 1; i < trace.length; i++) {
      ok(trace[i]!.tau > trace[i - 1]!.tau, `tau increases at ${i}`)
    }
  }),
  check(
    'a straight-ahead element keeps the rapidity at 0 (no swerve)',
    () => {
      const trace = swerveWalk({
        points: points(),
        steps: 6,
        tauLo: 0.5,
        tauHi: 1.5,
      })

      for (const s of trace) {
        close(
          s.rapidity,
          0,
          1e-12,
          'rapidity stays 0 on the straight column',
        )
      }
    },
  ),
])
