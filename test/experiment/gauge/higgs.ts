// P22: the Higgs (spontaneous symmetry breaking and mass generation).
// P14 put mass in by hand. The Higgs mechanism generates it: a scalar field with a
// Mexican-hat potential V = -mu^2 phi^2 + lambda phi^4 settles at a nonzero vacuum
// value v (symmetry breaking), and a gauge field coupled to it eats the Goldstone
// mode and becomes MASSIVE, mass = g v. So the massless photon (P20) acquires a mass
// in the broken phase. We compute the vacuum value, then add the Higgs mass term to
// the photon operator (P20) and show the photon goes from massless to massive in
// proportion to v. See note/questions/frontiers.md. Run: npx tsx code/experiment/p22-higgs.ts

import { maxwellLatticeSpectrum } from '@/code/operator/maxwell-lattice'
import {
  mexicanHatVacuum,
  higgsBosonMassSquared,
  gaugeBosonMass,
} from '@/code/dynamics/higgs-mechanism'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// The photon gap (smallest mode of the lattice Maxwell operator) when the gauge field
// gets a Higgs mass term m^2 = (g v)^2. In the symmetric phase (v = 0) this is zero,
// the massless photon, in the broken phase it is (g v)^2, a massive vector.
function photonGap(input: {
  side: number
  coupling: number
  vev: number
}): number {
  const m = gaugeBosonMass(input.coupling, input.vev)
  const spectrum = maxwellLatticeSpectrum({ side: input.side, mass: m })

  return spectrum.reduce((a, b) => Math.min(a, b), Infinity)
}

export function higgsStudy(input: { side: number; coupling: number }): {
  vevSymmetric: number
  vevBroken: number
  higgsMassBroken: number
  photonGapSymmetric: number
  photonGapBroken: number
  expectedGapBroken: number
} {
  const lambda = 0.5
  const vevSymmetric = mexicanHatVacuum(-1, lambda) // mu2 < 0: unbroken
  const vevBroken = mexicanHatVacuum(1, lambda) // mu2 > 0: broken

  return {
    vevSymmetric,
    vevBroken,
    higgsMassBroken: Math.sqrt(higgsBosonMassSquared(1, lambda)),
    photonGapSymmetric: photonGap({
      side: input.side,
      coupling: input.coupling,
      vev: vevSymmetric,
    }),
    photonGapBroken: photonGap({
      side: input.side,
      coupling: input.coupling,
      vev: vevBroken,
    }),
    expectedGapBroken: (input.coupling * vevBroken) ** 2,
  }
}

export default experiment({
  id: 'gauge/higgs',
  title:
    'symmetry breaking gives a nonzero vacuum value and a massive photon while the symmetric phase stays massless',
  category: 'gauge',
  substrates: 'any',
  depth: 'L0',
  paper: false,
  run() {
    const r = higgsStudy({ side: 4, coupling: 1 })
    const ok =
      Math.abs(r.vevSymmetric) < 1e-9 &&
      r.vevBroken > 0.5 &&
      Math.abs(r.photonGapSymmetric) < 1e-3 &&
      r.photonGapBroken > 0.5 &&
      Math.abs(r.photonGapBroken - r.expectedGapBroken) < 1e-3 &&
      r.higgsMassBroken > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'spontaneous symmetry breaking generates a nonzero vacuum value and the photon eats the Goldstone to gain a mass gv squared, massless in the symmetric phase',
      metrics: {
        vevSymmetric: r.vevSymmetric,
        vevBroken: r.vevBroken,
        photonGapBroken: r.photonGapBroken,
        higgsMassBroken: r.higgsMassBroken,
      },
      notes:
        'an analytic check of the assumed Higgs mechanism, not a derivation of symmetry breaking from the substrate',
    })
  },
})
