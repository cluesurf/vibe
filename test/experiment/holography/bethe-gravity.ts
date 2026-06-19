// P239 (TOOLKIT A+F, the Bethe-lattice exact propagator with geodesic distance, the clean gravity/holographic
// fix): instead of a finite Euclidean-distance patch (confounded, p210), use the EXACT infinite-tree (Bethe)
// Green's function via the cavity recursion, with TREE (geodesic) distance. For the Laplacian L = zI - A (the
// static Coulomb / massless propagator), the per-step decay mu solves b*mu^2 - z*mu + 1 = 0, and the
// bulk-mediated BOUNDARY correlator decays as 1/r^alpha with alpha = 2*ln(1/mu)/ln(b), r = boundary distance ~
// b^(tree-distance/2). We get a CLEAN exponent (no finite-patch artifact), and validate the recursion against a
// directly-solved finite tree. Run: npx tsx code/experiment/p239-bethe-gravity.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  betheCavityDecay,
  betheBoundaryExponent,
  finiteTreeResolventRatio,
} from '@/code/algebra/linear/bethe-resolvent'

// local aliases keeping the (z, E) call shape of this experiment; the finite-tree validation solve lives
// in code/algebra/linear/bethe-resolvent.
const muFor = (z: number, E: number): number =>
  betheCavityDecay({ coordination: z, energy: E })
const boundaryExponent = (z: number, E: number): number =>
  betheBoundaryExponent({ coordination: z, energy: E })
const validateTree = (z: number, depth: number): number =>
  finiteTreeResolventRatio({ coordination: z, depth })

export function betheGravity(): {
  alpha24: number
  alpha12: number
  massiveAlpha: number
  validated: boolean
} {
  const alpha24 = Math.round(boundaryExponent(24, 24) * 1000) / 1000 // {3,4,3,4} bulk, z=24, Laplacian E=z
  const alpha12 = Math.round(boundaryExponent(12, 12) * 1000) / 1000 // {5,3,4} bulk, z=12
  // massive bulk field, E > z -> mu smaller -> alpha larger (screened / Yukawa-like)
  const massiveAlpha =
    Math.round(boundaryExponent(24, 30) * 1000) / 1000
  // validate the recursion against a directly-solved finite tree
  const measured = validateTree(12, 3),
    predicted = muFor(12, 12)
  const validated = Math.abs(measured - predicted) < 0.05

  return { alpha24, alpha12, massiveAlpha, validated }
}

export default experiment({
  id: 'holography/bethe-gravity',
  title:
    'the exact Bethe bulk-mediated boundary correlator is a clean universal 1/r^2',
  category: 'holography',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = betheGravity()
    const ok =
      Math.abs(r.alpha24 - 2) < 0.01 &&
      Math.abs(r.alpha12 - 2) < 0.01 &&
      r.massiveAlpha > 2 &&
      r.validated

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the exact infinite-tree Bethe Green function gives a massless bulk-mediated boundary correlator that decays as a clean universal 1/r^2 at both coordination 24 and 12, a massive bulk field decays steeper, and the cavity recursion is validated against a directly-solved finite tree',
      metrics: {
        alpha24: r.alpha24,
        alpha12: r.alpha12,
        massiveAlpha: r.massiveAlpha,
        validated: r.validated ? 1 : 0,
      },
      notes:
        'L1, known math. This is the analytic Bethe-lattice cavity recursion with geodesic distance, validated against a finite-tree solve, which is the consistency check. The massless-vs-massive comparison shows the exponent responds correctly. This is the bulk-mediated holographic boundary correlator, distinct from the physical-space Newtonian potential. It fixes the earlier finite-patch confound but is established math, not an emergence claim.',
    })
  },
})
