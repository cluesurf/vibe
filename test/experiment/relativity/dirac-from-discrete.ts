// P230 (derive the Dirac walk FROM the discrete rule, by simulation, not the analytic formula): the directional
// rule's single-particle sector is a 2-component (left/right mover) walk. We SIMULATE the discrete rule and
// MEASURE its dispersion E(k) (the oscillation frequency of a real plane wave, by DFT). Discreteness, the
// MASSLESS case is EXACTLY a discrete shift (a permutation), giving E(k) = k, the relativistic LIGHT CONE with
// no continuity at all. The MASS is the emergent coarse-grained mixing (discrete direction-flips at a rate),
// and with it the measured dispersion is the Dirac relation cos E = cos(m) cos(k). So the base is the discrete
// shift + discrete flips, the Dirac equation is the emergent description. Run: npx tsx code/experiment/p230-dirac-from-discrete.ts

import { measuredCoinedWalkFrequency } from '@/code/dynamics/quantum-walk'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const LX = 256

// simulate the 2-component discrete walk, return the measured frequency E for a given wavenumber index kIdx
function measureE(kIdx: number, mass: number, T: number): number {
  return measuredCoinedWalkFrequency({
    wavenumberIndex: kIdx,
    size: LX,
    mass,
    beats: T,
  })
}

export function diracFromDiscrete(): {
  masslessOk: boolean
  massiveOk: boolean
} {
  const T = 512

  // (1) MASSLESS = exactly the discrete shift -> E(k) = k (the light cone), no continuity
  let masslessOk = true

  for (const kIdx of [8, 16, 32, 48]) {
    const k = (2 * Math.PI * kIdx) / LX,
      E = measureE(kIdx, 0, T)

    const ok = Math.abs(E - k) < 0.05

    if (!ok) {
      masslessOk = false
    }
  }

  // (2) MASSIVE (emergent mixing rate m) -> cos E = cos(m) cos(k), the Dirac relation
  const m = 0.6

  let massiveOk = true

  for (const kIdx of [8, 24, 48]) {
    const k = (2 * Math.PI * kIdx) / LX,
      E = measureE(kIdx, m, T)

    const lhs = Math.cos(E),
      rhs = Math.cos(m) * Math.cos(k)

    const ok = Math.abs(lhs - rhs) < 0.05

    if (!ok) {
      massiveOk = false
    }
  }

  const E0 = measureE(2, m, T)

  return { masslessOk, massiveOk }
}

export default experiment({
  id: 'relativity/dirac-from-discrete',
  code: 'E-RLT-0008',
  title:
    'the discrete walk dispersion measured by DFT, massless light cone and massive Dirac',
  category: 'relativity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = diracFromDiscrete()
    const mass = 0.6
    const massCheckK = (2 * Math.PI * 24) / 256
    const massE = measureE(24, mass, 512)
    const ok = r.masslessOk && r.massiveOk

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the dispersion measured by DFT from the simulated two-component discrete walk is the light cone E = k when massless and the Dirac relation cos E = cos(m) cos(k) when massive',
      metrics: {
        measuredCosE: Math.cos(massE),
        expectedCosEMassive: Math.cos(mass) * Math.cos(massCheckK),
      },
      notes:
        'L2, the Dirac quantum walk reproduced on the discrete shift. The dispersion is MEASURED (the dominant DFT frequency of the real plane wave), not assumed. The massless case is an exact permutation giving E = k, which is the control against the massive Dirac branch. The mass is the emergent coarse-grained direction-flip rate. No random seeds, the walk is deterministic from a fixed plane-wave start.',
    })
  },
})
