// Deterministic morphogenesis. From a fixed structured seed, a discrete activator-inhibitor rule (short-range
// activation, long-range inhibition) self-organizes a stable, regular, balanced striped pattern, with no
// randomness. The wavelength is selected by the inhibition range, not by the seed: a short range gives fine
// stripes, a long range coarse ones. That rule-set wavelength is the Turing signature, the basis of how a
// butterfly wing or any body pattern forms without a designer.
//
// L2, reproduces Turing pattern formation on the substrate, with a control (wavelength changes with the rule).
// Compute in code/dynamics/morphogenesis.

import { morphogenesis } from '@/code/dynamics/morphogenesis'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'selves/morphogenesis-pattern',
  title:
    'an activator-inhibitor rule self-organizes a regular striped pattern whose wavelength is set by the rule, not the seed',
  category: 'selves',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const sizes = [96, 144]
    const results = sizes.map(n => {
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

      return { coarse, coarseWavelength, fineWavelength }
    })

    const patternForms = results.every(
      r =>
        r.coarse.stable &&
        r.coarse.balanced &&
        r.coarse.regularity < 0.2 &&
        r.coarse.walls > 2,
    )
    const wavelengthSelected = results.every(
      r => r.coarseWavelength > r.fineWavelength * 1.5,
    )

    const ok = patternForms && wavelengthSelected

    const last = results[results.length - 1]!

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a deterministic activator-inhibitor rule forms a stable, regular, balanced striped pattern from a fixed seed, and the stripe wavelength is selected by the inhibition range (a longer range gives coarser stripes), the Turing signature of pattern formation without a designer',
      metrics: {
        walls: last.coarse.walls,
        regularity: last.coarse.regularity,
        coarseWavelength: last.coarseWavelength,
      },
      control: { fineWavelength: last.fineWavelength },
      notes:
        'L2 deterministic Turing pattern formation on the substrate, no randomness. the wavelength is intrinsic to the rule, the basis of morphogenesis (butterfly wings, body plans)',
    })
  },
})
