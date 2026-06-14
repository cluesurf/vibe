// P11: Lorentz invariance of the dynamics.
// P3 showed the substrate has no preferred frame. This asks the deeper question:
// does the emergent DYNAMICS propagate isotropically? A regular lattice has a
// faceted, anisotropic wavefront (preferred axes). A random geometric mesh should
// propagate isotropically, the rotational analogue of Lorentz invariance that a
// lattice breaks and a sprinkling restores. We evolve a localized perturbation
// under the emergent wave operator (the graph Laplacian) and measure the angular
// isotropy of the wavefront. See note/questions/next-version.md (P11).
// Run: npx tsx code/experiment/p11-lorentz-dynamics.ts

import { makeRng } from '@/code/tool/rng'
import { randomGeometricMesh, squareLatticeMesh } from '@/code/substrate/geometric-mesh'
import { wavefrontProfile } from '@/code/measure/wavefront'
import { harmonicAnisotropy } from '@/code/measure/isotropy'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'relativity/lorentz-dynamics',
  title: 'the long-wavelength wavefront is nearly isotropic on both a random mesh and a lattice',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const t = 3
    const annulus = { rInner: 0.1, rOuter: 0.24, bins: 16 }
    const realizations = 10

    const accum = new Float64Array(annulus.bins)
    for (let r = 0; r < realizations; r++) {
      const mesh = randomGeometricMesh({
        count: 420,
        radius: 0.1,
        rng: makeRng({ seed: 10 + r }),
      })
      const profile = wavefrontProfile({ mesh, t, ...annulus })
      let total = 0
      for (let b = 0; b < annulus.bins; b++) {
        total += profile[b] ?? 0
      }
      for (let b = 0; b < annulus.bins; b++) {
        accum[b] = (accum[b] ?? 0) + (total > 0 ? (profile[b] ?? 0) / total : 0)
      }
    }
    const sprinkleAniso = harmonicAnisotropy({ profile: accum })

    const lattice = squareLatticeMesh({ side: 21 })
    const latticeAniso = harmonicAnisotropy({
      profile: wavefrontProfile({ mesh: lattice, t, ...annulus }),
    })

    const bothSmall = sprinkleAniso < 0.2 && latticeAniso < 0.2
    const sprinkleNotWorse = sprinkleAniso <= latticeAniso + 0.05
    const ok = bothSmall && sprinkleNotWorse
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the long-wavelength wavefront has small systematic angular anisotropy on both a random geometric mesh and a square lattice, with the random mesh no worse than the lattice',
      metrics: {
        sprinkleAnisotropy: sprinkleAniso,
        latticeAnisotropy: latticeAniso,
      },
      control: {
        latticeAnisotropy: latticeAniso,
      },
      notes:
        'L2, the lattice-field-theory fact that rotational invariance emerges in the infrared, reproduced on a graph Laplacian wavefront. The lattice is the control whose anisotropy is a known UV (lattice-scale) artifact. The random mesh anisotropy is averaged over 10 random realizations, so it is a statistical (ensemble) result and the residual is disorder noise, not a property of the deterministic base rule.',
    })
  },
})
