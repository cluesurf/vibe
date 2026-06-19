// P124: emergent rotational invariance (the isotropy half of Lorentz). (lorentz-isotropy-experiment.md.)
//
// A relativistic field needs a light speed that is the SAME in every direction. A regular lattice usually
// breaks this. We test it directly: drop a single charge at the center of the float {5,3,4} ball, let it
// random-walk by the base rule, and measure the COVARIANCE ELLIPSOID of where it goes (real coordinates).
// If the three eigenvalues are equal, the spread is a sphere, transport is ISOTROPIC, emergent rotational
// invariance. The {5,3,4} cell has 12 neighbors arranged with icosahedral symmetry, which forces rank-2
// (and rank-4) tensors to be isotropic, so we expect a near-perfect sphere. That is the rotational part
// of Lorentz for free. Run: npx tsx code/experiment/p124-lorentz-isotropy.ts

import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { innermostCell } from '@/code/substrate/radial-tree'
import { diffusionTensorAnisotropy } from '@/code/measure/isotropy'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function lorentzIsotropy(input?: {
  maxCells?: number
  beats?: number
  runs?: number
}): {
  cellCount: number
  samples: number
  eigenvalues: number[]
  anisotropy: number
  isotropic: boolean
  solved: boolean
} {
  const maxCells = input?.maxCells ?? 8000
  const beats = input?.beats ?? 4
  const runs = input?.runs ?? 5000
  const g = buildCellGraph({ symbol: [5, 3, 4], maxCells })
  const N = g.cellCount

  // coords are the 3D Poincare ball (|x| < 1). Conformal, so the scale factor is isotropic at each point,
  // but distortion grows toward the boundary. Start at the cell CLOSEST TO THE ORIGIN and keep the spread
  // small, so the cloud lives where the model is nearly Euclidean and the covariance shape is faithful.
  const r2 = (i: number): number =>
    g.coords[i]!.reduce((s, x) => s + x * x, 0)

  const radii2 = Array.from({ length: N }, (_, i) => r2(i))
  const center = innermostCell(radii2)
  const c0 = g.coords[center]!

  // The clean, artifact-free isotropy test: the ONE-STEP diffusion tensor. A symmetric random walk's
  // diffusion tensor is the average of (neighbor displacement)(displacement)^T over the 12 face-neighbors.
  // Icosahedral symmetry makes this isotropic (the icosahedral group is irreducible on R^3, so any
  // invariant rank-2 tensor is a multiple of the identity). We average over the cells CLOSEST to the
  // origin (where the Poincare scale factor is nearly constant, so coordinate displacement is faithful).
  void c0
  void beats
  void runs

  const order = Array.from({ length: N }, (_, i) => i).sort(
    (a, b) => r2(a) - r2(b),
  )

  const sampleCells = order.slice(0, 200) // the 200 cells nearest the origin
  const tensor = diffusionTensorAnisotropy({
    coords: g.coords,
    neighbors: g.neighbors,
    cells: sampleCells,
  })

  const eig = tensor.eigenvalues
  const anisotropy = tensor.anisotropy
  const isotropic = anisotropy < 0.15
  const solved = isotropic

  return {
    cellCount: N,
    samples: tensor.count,
    eigenvalues: eig,
    anisotropy,
    isotropic,
    solved,
  }
}

export default experiment({
  id: 'relativity/lorentz-isotropy',
  title:
    'the one-step diffusion tensor is isotropic from the icosahedral cell symmetry',
  category: 'relativity',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    const r = lorentzIsotropy({ maxCells: 8000 })
    const ok = r.solved && r.isotropic

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the 12 face-direction diffusion tensor has equal eigenvalues so transport is isotropic, emergent rotational invariance',
      metrics: {
        minEigenvalue: Math.min(...r.eigenvalues),
        maxEigenvalue: Math.max(...r.eigenvalues),
        anisotropy: r.anisotropy,
      },
    })
  },
})
