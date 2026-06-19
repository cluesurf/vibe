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

import {
  latticeAnisotropy,
  lorentzSafety,
} from '@/code/measure/lorentz'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'relativity/lorentz-violation',
  title:
    'a lattice violates Lorentz invariance while a sprinkling is Lorentz-safe',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const low = latticeAnisotropy(0.2).anisotropy
    const high = latticeAnisotropy(2.6).anisotropy
    const s = lorentzSafety()
    const ok =
      high > low &&
      high > 0.1 &&
      low < 0.05 &&
      s.sprinkle < 0.2 &&
      s.lattice > 0.8

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
