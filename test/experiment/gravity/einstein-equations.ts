// P32: ANALYTIC / CONSISTENCY CHECK of the linearized Einstein operator.
// This is NOT an emergent test of the vibe substrate. It does NOT show the substrate
// produces the Einstein equations. It ASSUMES the linearized Einstein operator G[h]
// (the imported einsteinOp from p24, itself built to be the standard transverse,
// traceless wave operator) and verifies algebraic properties that the operator was
// constructed to have:
//   - Conservation (the contracted Bianchi identity): k . G[h] = 0 for any h. This is
//     transversality, which the operator is defined to satisfy. The check is a
//     consistency check on the imported operator, not an emergent derivation.
//   - The Newtonian limit: the static equation is ASSUMED to reduce to the Poisson
//     equation with the standard 1/r point-source solution (the assumed Green's
//     function, see P16). This is asserted, not derived here.
//   - The graviton dispersion: the eigenvalue of the assumed operator gives omega = |k|
//     by construction, so the wave speed comes out at 1.
// GIVEN the assumed operator, all of these follow as algebra. They are properties of the
// plugged-in operator, not evidence that the substrate generates general relativity.
// See note/questions/frontiers.md. Run: npx tsx code/experiment/p32-einstein-equations.ts

import { makeRng } from '@/code/tool/rng'
import {
  einsteinOp,
  gravitonFromAction,
} from '@/code/operator/graviton'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Residual of the contracted Bianchi identity k_i G_ij[h], averaged over random
// symmetric perturbations h. Zero means the Einstein tensor is transverse, which is
// energy-momentum conservation built into the equation of motion.
export function bianchiResidual(input: {
  k: number[]
  samples: number
  seed: number
}): number {
  const rng = makeRng({ seed: input.seed })

  let worst = 0

  for (let s = 0; s < input.samples; s++) {
    const h: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]

    for (let i = 0; i < 3; i++) {
      for (let j = i; j < 3; j++) {
        const v = rng.next() * 2 - 1
        h[i]![j] = v
        h[j]![i] = v
      }
    }

    const g = einsteinOp(h, input.k)

    let hn = 0

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        hn += (h[i]?.[j] ?? 0) ** 2
      }
    }

    // k_i G_ij summed over i, for each j, then the norm of that 3-vector.
    let div2 = 0

    for (let j = 0; j < 3; j++) {
      let d = 0

      for (let i = 0; i < 3; i++) {
        d += (input.k[i] ?? 0) * (g[i]?.[j] ?? 0)
      }

      div2 += d * d
    }

    const rel = hn > 0 ? Math.sqrt(div2) / Math.sqrt(hn) : 0
    worst = Math.max(worst, rel)
  }

  return worst
}

// Graviton wave speed omega/|k| from the vacuum equation. The graviton eigenvalue of
// G is (1/2)|k|^2, so the wave dispersion is omega = sqrt(2 * eigenvalue) = |k|, hence
// speed omega/|k| = 1 (the speed of light), independent of frequency (massless).
export function gravitonSpeed(kMag: number): number {
  const r = gravitonFromAction({ k: [kMag, 0, 0] })
  const omega = Math.sqrt(2 * r.gravitonEigenvalue)

  return omega / kMag
}

export default experiment({
  id: 'gravity/einstein-equations',
  title: 'conservation (transverse G) and a c-speed graviton',
  category: 'gravity',
  substrates: 'any',
  depth: 'L0',
  paper: false,
  run() {
    const res = bianchiResidual({ k: [2, 1, 3], samples: 30, seed: 1 })
    const speed = gravitonSpeed(0.5)
    const ok = res < 1e-10 && Math.abs(speed - 1) < 1e-6

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the assumed linearized Einstein tensor is transverse and its graviton propagates at the speed of light',
      metrics: { bianchiResidual: res, gravitonSpeed: speed },
      notes:
        'analytic consistency check of the plugged-in Einstein operator, not a derivation of general relativity from the substrate',
    })
  },
})
