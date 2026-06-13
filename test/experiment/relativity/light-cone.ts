import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lightConeRadii } from '@/code/measure/light-cone'

// The discrete light cone on the cubic cusp. A free charge front advances exactly
// one cell per beat, a finite frame-independent maximum speed, z = 1.
export default defineExperiment({
  id: 'relativity/light-cone',
  title: 'Ballistic z = 1 light cone on the cubic cusp',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const radii = lightConeRadii({ side: 33, beats: 12 })
    const ballistic = radii.every((radius, index) => radius === index + 1)
    return verdict({
      status: ballistic ? 'pass' : 'fail',
      claim: 'a free charge front advances exactly one cell per beat, z = 1',
      metrics: { beats: radii.length, finalRadius: radii[radii.length - 1] ?? 0 },
    })
  },
})
