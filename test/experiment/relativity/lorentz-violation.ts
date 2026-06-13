// P27: Lorentz violation, and why the causal-set substrate avoids it.
// Discreteness is widely expected to break Lorentz invariance: a regular lattice has
// a modified dispersion and preferred axes, so the speed of light becomes
// energy-dependent and direction-dependent (Lorentz violation, LIV), which gamma-ray-
// burst photon timing tightly constrains. We show two things. First, a lattice DOES
// have LIV: its group velocity becomes anisotropic and energy-dependent at high
// energy. Second, the causal-set substrate (a random Poisson sprinkling) is Lorentz-
// invariant in distribution, so at the discreteness scale its link directions are
// ISOTROPIC, unlike the lattice's preferred axes. So Vibe Theory's discreteness
// predicts NO first-order LIV, matching the observed null results, where lattice
// discreteness would not. See note/questions/frontiers.md. Run:
// npx tsx code/experiment/p27-lorentz-violation.ts

import { makeRng, Rng } from '@/code/tool/rng'
import { latticeDispersion } from '@/code/measure/dispersion'
import { groupSpeedAnisotropy } from '@/code/measure/group-speed'
import { nearestLinkHarmonicAnisotropy } from '@/code/measure/isotropy'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Lattice scalar dispersion omega(k) = sqrt(sum 4 sin^2(k_i/2)), the square-lattice
// nearest-neighbour dispersion. The continuum is omega = |k| (speed 1, isotropic).
const SQUARE_DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]]
function omega(kx: number, ky: number): number {
  return Math.sqrt(latticeDispersion({ directions: SQUARE_DIRECTIONS, wave: [kx, ky] }))
}

// Group-speed anisotropy at a fixed momentum magnitude: (max - min) / mean over
// directions. Zero is perfectly Lorentz-safe, large is strong LIV.
export function latticeAnisotropy(kMag: number): { meanSpeed: number; anisotropy: number } {
  return groupSpeedAnisotropy({ omega, kMag, samples: 24 })
}

function sprinklePoints(input: { count: number; rng: Rng }): { x: number; y: number }[] {
  return Array.from({ length: input.count }, () => ({ x: input.rng.next(), y: input.rng.next() }))
}
function latticePoints(side: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < side; i++) {
    for (let j = 0; j < side; j++) {
      pts.push({ x: i / side, y: j / side })
    }
  }
  return pts
}

export function lorentzSafety(): { sprinkle: number; lattice: number } {
  const sprinkle = nearestLinkHarmonicAnisotropy({ points: sprinklePoints({ count: 900, rng: makeRng({ seed: 1 }) }) })
  const lattice = nearestLinkHarmonicAnisotropy({ points: latticePoints(30) })
  return { sprinkle, lattice }
}

export default defineExperiment({
  id: 'relativity/lorentz-violation',
  title: 'a lattice violates Lorentz invariance while a sprinkling is Lorentz-safe',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const low = latticeAnisotropy(0.2).anisotropy
    const high = latticeAnisotropy(2.6).anisotropy
    const s = lorentzSafety()
    const ok =
      high > low && high > 0.1 && low < 0.05 && s.sprinkle < 0.2 && s.lattice > 0.8
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a lattice has energy-dependent anisotropy (Lorentz-violating) while a sprinkling stays isotropic (Lorentz-safe)',
      metrics: {
        anisotropyLow: low,
        anisotropyHigh: high,
        linkIsotropySprinkle: s.sprinkle,
        linkIsotropyLattice: s.lattice,
      },
    })
  },
})
