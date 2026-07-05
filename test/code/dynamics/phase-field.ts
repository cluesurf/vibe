// Conformance for code/dynamics/phase-field: phase dynamics on a ring (dissipative relax + reversible wave).
// Invariants:
//   - gradientStructure of a uniform field is 0.
//   - a UNIFORM field is a fixed point of the dissipative relaxation (no gradient, no change).
//   - HEALING: relaxing a kink-with-lump field drives the gradient structure down over time.
//   - DETERMINISM.

import { suite, check, close, ok, equal } from '@/test/code/harness'
import {
  phaseRelaxStep,
  gradientStructure,
  windingKinkWithLump,
} from '@/code/dynamics/phase-field'

suite('dynamics/phase-field: uniform fixed point', [
  check('gradientStructure of a uniform field is 0', () => {
    const uniform = new Array<number>(20).fill(0.7)
    close(gradientStructure(uniform), 0, 1e-12, 'no gradient')
  }),
  check('a uniform field is unchanged by the relaxation', () => {
    const uniform = new Array<number>(20).fill(0.7)
    const next = phaseRelaxStep(uniform, 0.2)

    for (let i = 0; i < next.length; i++) {
      close(next[i]!, 0.7, 1e-12, `cell ${i}`)
    }
  }),
])

suite('dynamics/phase-field: healing', [
  check(
    'relaxation drives a perturbed field toward smoothness (structure decays)',
    () => {
      let field = windingKinkWithLump({
        size: 64,
        winding: 1,
        lumpAmplitude: 1.0,
        lumpWidth: 5,
      })

      const s0 = gradientStructure(field)

      for (let t = 0; t < 200; t++) {
        field = phaseRelaxStep(field, 0.1)
      }

      ok(gradientStructure(field) < s0, 'gradient structure decreased')
    },
  ),
])

suite('dynamics/phase-field: determinism', [
  check('two relaxations agree', () => {
    const seed = windingKinkWithLump({
      size: 32,
      winding: 1,
      lumpAmplitude: 0.5,
    })

    const run = (): number[] => {
      let f = seed.slice()

      for (let t = 0; t < 50; t++) {
        f = phaseRelaxStep(f, 0.1)
      }

      return f
    }

    const a = run()
    const b = run()

    for (let i = 0; i < a.length; i++) {
      equal(a[i]!, b[i]!, `cell ${i}`)
    }
  }),
])
