// Conformance for code/dynamics/morphogenesis: the deterministic activator-inhibitor (Turing) rule on a
// ring (no RNG). Invariant (the Turing signature): short-range activation plus long-range inhibition forms
// a stable, regular, balanced striped pattern with a finite wavelength SELECTED by the inhibition range, so a
// longer inhibition range gives coarser stripes than a shorter one. Parameters match the morphogenesis
// experiment. Deterministic.

import { suite, check, ok, equal } from '@/test/code/harness'
import { morphogenesis } from '@/code/dynamics/morphogenesis'

const n = 240

suite('dynamics/morphogenesis: Turing pattern formation', [
  check(
    'the long-range rule forms a stable, regular, balanced striped pattern',
    () => {
      const coarse = morphogenesis({
        n,
        activateRadius: 2,
        inhibitRadius: 10,
        inhibition: 1,
        beats: 200,
      })

      ok(coarse.stable, 'pattern settles')
      ok(coarse.balanced, 'both signs present')
      ok(coarse.walls > 2, 'multiple stripes')
      ok(coarse.regularity < 0.2, 'evenly spaced stripes')
    },
  ),
  check(
    'a longer inhibition range selects a coarser wavelength',
    () => {
      const coarse = morphogenesis({
        n,
        activateRadius: 2,
        inhibitRadius: 10,
        inhibition: 1,
        beats: 200,
      })

      const fine = morphogenesis({
        n,
        activateRadius: 1,
        inhibitRadius: 4,
        inhibition: 1,
        beats: 200,
      })

      const coarseWavelength = n / Math.max(1, coarse.walls)
      const fineWavelength = n / Math.max(1, fine.walls)

      ok(
        coarseWavelength > fineWavelength * 1.5,
        'longer range -> coarser stripes',
      )
    },
  ),
])

suite('dynamics/morphogenesis: determinism', [
  check('two runs agree', () => {
    const a = morphogenesis({
      n,
      activateRadius: 2,
      inhibitRadius: 10,
      inhibition: 1,
      beats: 100,
    })

    const b = morphogenesis({
      n,
      activateRadius: 2,
      inhibitRadius: 10,
      inhibition: 1,
      beats: 100,
    })

    equal(a.walls, b.walls, 'walls')
    equal(a.regularity, b.regularity, 'regularity')
  }),
])
