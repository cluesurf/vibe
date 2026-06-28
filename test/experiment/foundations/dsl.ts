// P36: the model DSL, the committed model written and run at a glance.
// The whole committed model of note/the-model.md is a few fluent lines. We print it
// (the block that goes in the paper), build and run it, read the emergent structures
// off the same mesh, and then swap ONE option to express the Lorentz-violating lattice
// alternative, showing why the random hyperbolic mesh is the committed choice.
// See code/model/vibe.ts and note/the-model.md. Run: npx tsx code/experiment/p36-dsl.ts

import { vibe } from '@/code/model/vibe'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function dslDemo(): {
  committedAnisotropy: number
  committedReach: boolean
  committedBoundedBelow: boolean
  latticeAnisotropy: number
  toneMix: boolean
} {
  const world = vibe().size(1200).seed(1).build().run(40)
  const r = world.read()
  const lattice = vibe()
    .mesh('lattice')
    .size(900)
    .seed(1)
    .build()
    .run(10)
    .read()

  // A converged non-trivial mix: both poles populated, not collapsed to all-zero.
  const toneMix =
    r.toneHistogram.minus > 0.1 * 1200 &&
    r.toneHistogram.plus > 0.1 * 1200

  return {
    committedAnisotropy: r.lorentzAnisotropy,
    committedReach: r.exponentialReach,
    committedBoundedBelow: r.hamiltonianBoundedBelow,
    latticeAnisotropy: lattice.lorentzAnisotropy,
    toneMix,
  }
}

export default experiment({
  id: 'foundations/dsl',
  code: 'E-FND-0015',
  title: 'the DSL builds the committed model and expresses variants',
  category: 'foundations',
  substrates: ['534'],
  depth: 'L1',
  paper: false,
  run() {
    const d = dslDemo()
    const describesModel = vibe().describe().includes('signed-majority')
    const ok =
      describesModel &&
      d.committedAnisotropy < 0.2 &&
      d.committedReach &&
      d.committedBoundedBelow &&
      d.toneMix &&
      d.latticeAnisotropy > 0.8

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'vibe() builds the committed Lorentz-safe model and a single swap expresses the Lorentz-violating lattice variant',
      metrics: {
        committedAnisotropy: d.committedAnisotropy,
        latticeAnisotropy: d.latticeAnisotropy,
      },
    })
  },
})
