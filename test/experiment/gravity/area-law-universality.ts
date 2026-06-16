// Frontier 1, the proxy is the knit's own field, resolved as far as universality allows. The gravity story rests
// on the entanglement area law, which was measured on a free-fermion gapped insulator. The honest worry, is that an
// ARBITRARY proxy, or is it the KNIT's emergent field? This experiment closes most of the gap two ways.
//
//   1. The area law is UNIVERSAL. The measured area-law exponent is the same (near two) across a range of gapped
//      masses, it does not depend on the proxy's specific mass, only on the field being gapped. So the area law is
//      not a feature of any particular proxy, it is the universal property of a gapped field (a finite correlation
//      length, Hastings' theorem).
//   2. The proxy IS a relativistic massive Dirac field. Its spectral gap is EXACTLY twice the mass (a linear Dirac
//      gap), the staggered mass is the Dirac mass, so the proxy is the same massive Dirac field that the directional
//      knit realizes (relativity/dirac-from-discrete, P230, the knit's single-particle sector is a Dirac walk with a
//      tunable emergent mass and a gapped dispersion). The massless case has gap zero, the gapless boundary, the
//      control.
//
// So the area law belongs to the knit's emergent massive Dirac field, the proxy is a representative of the knit's
// universality class, not an arbitrary stand-in. The honest residual, the explicit entanglement computed from the
// raw three-dimensional knit dynamics rather than its established Dirac description, remains future work. Depth L2,
// the universality of the exponent and the linearity of the Dirac gap measured deterministically, with the gapless
// massless case the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { staggeredMassCubicHamiltonian } from '@/code/operator/tight-binding'
import { freeFermionCorrelationMatrix } from '@/code/measure/entanglement'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { screenBitSeries, logLogExponent } from '@/code/measure/entropic-gravity'

const AREA_SIDE = 8
const GAP_SIDE = 6
const RADII = [2, 3, 4]
const MASSES = [0.4, 0.8, 1.2, 1.6]

// the half-filling spectral gap of the staggered-mass cubic fermion, the Dirac gap
function spectralGap(mass: number): number {
  const n = GAP_SIDE ** 3
  const h = staggeredMassCubicHamiltonian({ side: GAP_SIDE, mass, periodic: true })
  const values = [...eigSymmetric({ matrix: h }).values].sort((a, b) => a - b)
  return values[n / 2]! - values[n / 2 - 1]!
}

// the area-law exponent of the gapped ground state at a given mass
function areaExponent(mass: number): number {
  const n = AREA_SIDE ** 3
  const h = staggeredMassCubicHamiltonian({ side: AREA_SIDE, mass, periodic: true })
  const c = freeFermionCorrelationMatrix({ h, n })
  const series = screenBitSeries({ c, n, side: AREA_SIDE, radii: RADII })
  return logLogExponent(series.radii, series.bits)
}

export default experiment({
  id: 'gravity/area-law-universality',
  title: 'the area law is universal across gapped masses and the proxy is a relativistic Dirac field, so it is the knit emergent field, not an arbitrary stand-in',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // 1. the area-law exponent across gapped masses, it should be universal (mass-independent, near two)
    const exponents = MASSES.map(areaExponent)
    const exponentSpread = Math.max(...exponents) - Math.min(...exponents)

    // 2. the spectral gap is exactly twice the mass (a relativistic Dirac gap), the proxy is a massive Dirac field
    const gaps = MASSES.map(spectralGap)
    const gapRatios = gaps.map((g, i) => g / MASSES[i]!)
    const gapRatioSpread = Math.max(...gapRatios) - Math.min(...gapRatios)

    // the control, the massless field is gapless (gap zero), the boundary of the gapped universality class
    const masslessGap = spectralGap(0)

    // the area law is universal (the exponent near two and barely moving with mass), the gap is the Dirac gap
    // (twice the mass, the ratio constant near two), and the massless control is gapless
    const universalExponent =
      exponents.every((e) => e > 1.7 && e < 2.1) && exponentSpread < 0.15
    const diracGap = gapRatios.every((r) => Math.abs(r - 2) < 0.05) && gapRatioSpread < 0.05
    const masslessIsGapless = masslessGap < 1e-6
    const ok = universalExponent && diracGap && masslessIsGapless

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the entanglement area law is a UNIVERSAL property of the gapped field, the measured exponent is near two and barely moves across a range of gapped masses (it does not depend on the proxy details, only on the field being gapped), and the proxy is a relativistic massive Dirac field, its spectral gap is exactly twice the mass (a linear Dirac gap). The directional knit realizes exactly this massive Dirac field (dirac-from-discrete, P230), so the area law belongs to the knit emergent field, the proxy is a representative of the knit universality class rather than an arbitrary stand-in. The massless field is gapless (gap zero, the class boundary, the control).',
      metrics: {
        exponentMin: Number(Math.min(...exponents).toFixed(3)),
        exponentMax: Number(Math.max(...exponents).toFixed(3)),
        exponentSpread: Number(exponentSpread.toFixed(3)),
        gapRatioMin: Number(Math.min(...gapRatios).toFixed(3)),
        gapRatioMax: Number(Math.max(...gapRatios).toFixed(3)),
        masslessGap: Number(masslessGap.toFixed(6)),
      },
      control: { masslessGap: Number(masslessGap.toFixed(6)) },
      notes:
        'the exponent is mass-independent (the universality of the area law for gapped fields), so it is not a proxy artifact. The gap equal to twice the mass identifies the staggered fermion as the relativistic massive Dirac field of P230, the knit single-particle sector, so the area-law field IS the knit emergent field. The honest residual is the entanglement computed directly from the raw three-dimensional knit dynamics (the knit is classical-reversible, its entanglement lives in its Doi-Peliti and single-particle Dirac description, Q6 and P230), which is the deepest remaining work. The gapless massless case is the control, outside the gapped class.',
    })
  },
})
