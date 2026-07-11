// Conformance for code/coarse/driven-self: a central self driven by a sectored environment. The clean,
// derivable fact is the CONTROL: with dynamics off the interior never integrates the boundary signal,
// so every interior reading stays exactly 0 (the interior cells are never written, no beat moves
// charge into them). The series shapes are exact, and the run is reproducible.

import { suite, check, equal, close, ok } from '@/test/code/harness'
import { drivenSelf } from '@/code/coarse/driven-self'

suite('coarse/driven-self: the no-dynamics control', [
  // With withDynamics false there is no beat, so charge never propagates from the input ring to the
  // deep interior: the interior reads 0 at every beat.
  check(
    'the interior never integrates the signal without dynamics',
    () => {
      const r = drivenSelf({
        L: 40,
        beats: 12,
        seed: 1,
        withDynamics: false,
        sectors: 4,
      })

      equal(r.interior.length, 12)

      for (const v of r.interior)
        close(v, 0, 1e-12, 'interior stays 0 with dynamics off')
    },
  ),
])

suite('coarse/driven-self: shapes and reproducibility', [
  check('series shapes match the requested beats and sectors', () => {
    const r = drivenSelf({
      L: 40,
      beats: 9,
      seed: 4,
      withDynamics: true,
      sectors: 5,
    })

    equal(r.interior.length, 9)
    equal(r.environment.length, 9)
    equal(r.sectorSignals.length, 5)

    for (const row of r.sectorSignals) {
      equal(row.length, 9, 'one signal per beat per sector')

      for (const s of row)
        ok(s === 1 || s === -1, 'each sector signal is +-1')
    }
  }),
  check('the driven run is reproducible for a fixed seed', () => {
    const opts = { L: 40, beats: 9, seed: 8, withDynamics: true }
    const a = drivenSelf(opts)
    const b = drivenSelf(opts)

    for (let i = 0; i < a.interior.length; i++) {
      close(a.interior[i]!, b.interior[i]!, 0, 'reproducible interior')
      close(
        a.environment[i]!,
        b.environment[i]!,
        0,
        'reproducible environment',
      )
    }
  }),
])
