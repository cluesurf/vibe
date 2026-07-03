// Conformance for code/coarse/active-persistence: a self relocating toward a refuge under a pervasive
// decay. The dynamics carry a stochastic hop, so the checkable math is structural: the result is
// reproducible (same seed -> identical), the surviving size is a non-negative count, and the reported
// final centroid is either -1 (the self died) or a column inside the lattice. The physics claim (it
// relocates to the refuge and survives) lives in test/experiment, not here.

import { suite, check, equal, ok } from '@/test/code/harness'
import { activePersistence } from '@/code/coarse/active-persistence'

suite('coarse/active-persistence: structure and reproducibility', [
  check('the run is reproducible for a fixed seed', () => {
    const opts = {
      L: 24,
      beats: 10,
      seed: 2,
      refuge: 'right' as const,
    }

    const a = activePersistence(opts)
    const b = activePersistence(opts)
    equal(
      a.survivingSize,
      b.survivingSize,
      'same seed, same surviving size',
    )
    equal(a.finalX, b.finalX, 'same seed, same final centroid')
  }),
  check('outputs are structurally valid for every refuge mode', () => {
    for (const refuge of ['left', 'right', 'none'] as const) {
      const r = activePersistence({ L: 24, beats: 10, seed: 5, refuge })
      ok(r.survivingSize >= 0, 'surviving size is a non-negative count')
      ok(
        r.finalX === -1 || (r.finalX >= 0 && r.finalX < 24),
        'final centroid is -1 (dead) or a valid column',
      )
    }
  }),
])
