// P36: the model DSL, the committed model written and run at a glance.
// The whole committed model of note/the-model.md is a few fluent lines. We print it
// (the block that goes in the paper), build and run it, read the emergent structures
// off the same mesh, and then swap ONE option to express the Lorentz-violating lattice
// alternative, showing why the random hyperbolic mesh is the committed choice.
// See code/model/vibe.ts and note/the-model.md. Run: npx tsx code/experiment/p36-dsl.ts

import { pathToFileURL } from 'node:url'
import { vibe } from '~/model/vibe'

export function dslDemo(): {
  committedAnisotropy: number
  committedReach: boolean
  committedBoundedBelow: boolean
  latticeAnisotropy: number
  toneMix: boolean
} {
  const world = vibe().size(1200).seed(1).build().run(40)
  const r = world.read()
  const lattice = vibe().mesh('lattice').size(900).seed(1).build().run(10).read()
  // A converged non-trivial mix: both poles populated, not collapsed to all-zero.
  const toneMix = r.toneHistogram.minus > 0.1 * 1200 && r.toneHistogram.plus > 0.1 * 1200
  return {
    committedAnisotropy: r.lorentzAnisotropy,
    committedReach: r.exponentialReach,
    committedBoundedBelow: r.hamiltonianBoundedBelow,
    latticeAnisotropy: lattice.lorentzAnisotropy,
    toneMix,
  }
}

export function main(): void {
  console.log('P36: the model DSL, the committed model at a glance')
  console.log('')
  const model = vibe().size(1500).seed(1)
  console.log(model.describe())
  console.log('')
  const world = model.build().run(40)
  const r = world.read()
  console.log('  built and run (40 beats), emergent structures read off the same mesh:')
  console.log(`    mean degree ${r.meanDegree.toFixed(1)}, Lorentz anisotropy ${r.lorentzAnisotropy.toFixed(3)}, exponential reach ${r.exponentialReach}`)
  console.log(`    emergent Hamiltonian bounded below: ${r.hamiltonianBoundedBelow} (min eigenvalue ${r.hamiltonianMin.toFixed(4)})`)
  console.log(`    converged tones  -1: ${r.toneHistogram.minus}   0: ${r.toneHistogram.zero}   +1: ${r.toneHistogram.plus}   (a non-trivial stable pattern)`)
  console.log('')
  const lattice = vibe().mesh('lattice').size(900).seed(1).build().run(10).read()
  console.log("  variant: vibe().mesh('lattice'), the alternative the DSL can express:")
  console.log(`    lattice Lorentz anisotropy ${lattice.lorentzAnisotropy.toFixed(3)} (high, a preferred frame) versus hyperbolic ${r.lorentzAnisotropy.toFixed(3)} (low)`)
  console.log('')
  console.log('  The whole model is a few fluent lines. It prints at a glance, builds, runs, and')
  console.log('  reads off the emergent physics. Swapping one option (the mesh) expresses the')
  console.log('  Lorentz-violating lattice, which shows why the random hyperbolic mesh is the')
  console.log('  committed choice. This is the model definition for the paper.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
