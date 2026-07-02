// Conformance for code/dynamics/peierls-wavepacket: a charged tight-binding packet under Peierls phases.
// Invariants:
//   - THE LORENTZ DEFLECTION REVERSES WITH THE FIELD: relative to the zero-field baseline (which is a small
//     nonzero lattice-boundary offset, not 0), +B and -B deflect the packet in OPPOSITE transverse
//     directions by ~ the same amount. This is the genuine field effect, isolated from the baseline.
//   - DETERMINISM: the [re, im] evolution is reproducible bit-for-bit.

import { suite, check, close, ok, equal } from '@/test/code/harness'
import { peierlsWavepacketDrift } from '@/code/dynamics/peierls-wavepacket'

suite('dynamics/peierls-wavepacket: gauge field deflection', [
  check(
    'the deflection reverses sign with the field (Lorentz force)',
    () => {
      const opts = { length: 16, steps: 8, momentum: 1.0 }
      const baseline = peierlsWavepacketDrift({ field: 0, ...opts })
      const plus =
        peierlsWavepacketDrift({ field: 0.3, ...opts }) - baseline

      const minus =
        peierlsWavepacketDrift({ field: -0.3, ...opts }) - baseline

      ok(Math.abs(plus) > 1e-3, 'the field actually deflects')
      ok(
        plus * minus < 0,
        'reversing the field reverses the deflection',
      )
      // the magnitudes are comparable (the small residual asymmetry is the lattice-boundary nonlinearity in B)
      close(
        plus,
        -minus,
        Math.max(Math.abs(plus), Math.abs(minus)) * 0.3,
        '+B and -B deflect by ~ the same amount',
      )
    },
  ),
  check('the drift is deterministic under identical inputs', () => {
    const run = (): number =>
      peierlsWavepacketDrift({
        field: 0.25,
        length: 16,
        steps: 6,
        momentum: 1.0,
      })

    equal(run(), run(), 'reproducible')
  }),
])
