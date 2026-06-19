// P73: the fully-discrete graviton.
// P24 gave the graviton operator in the continuum limit, P32 the linearized Einstein equation.
// Here is the graviton operator built directly on a discrete lattice, with finite differences,
// and shown to have the three defining properties of a massless spin-2 field:
//   1. Gauge invariance. The linearized Einstein operator annihilates any pure-gauge
//      perturbation h = d xi + (d xi)^T (an infinitesimal diffeomorphism). This is the spin-2
//      gauge symmetry, the discrete analogue of general covariance, and it is what protects the
//      graviton's masslessness.
//   2. Masslessness. The operator has no mass term: it is built entirely from derivatives, so a
//      constant perturbation costs nothing, and a plane wave costs an amount proportional to k^2,
//      with no gap. The dispersion passes through the origin.
//   3. Spin two. For a given direction there are exactly two transverse-traceless polarizations,
//      the two graviton helicities.
// All three are read off the discrete operator on the lattice, so this is the genuinely discrete
// graviton, not the continuum operator. Run: npx tsx code/experiment/p73-discrete-graviton.ts

import { makeRng } from '@/code/tool/rng'
import {
  GRAVITON_DIMENSION as D,
  linearizedEinstein,
  makeTensorField as makeField,
  gravitonSiteIndex as siteIndex,
  gravitonCoordsOf as coordsOf,
  gravitonShift as shift,
  tensorFieldMaxAbs as maxAbs,
  gravitonPolarizationsFromSpectrum,
} from '@/code/operator/linearized-einstein'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function discreteGraviton(input: { seed: number }): {
  gaugeResidual: number
  massTermResidual: number
  planeWaveEigenOverK2: number[]
  dispersionMassless: boolean
  polarizations: number
  polarizationGaugeModes: number
  polarizationSpectrum: number[]
  solved: boolean
} {
  const L = 8
  const rng = makeRng({ seed: input.seed })

  // 1. Gauge invariance: h = d_mu xi_nu + d_nu xi_mu for a smooth random xi. G[h] should vanish.
  const xi: Float64Array[] = Array.from(
    { length: Math.pow(L, D) },
    () => new Float64Array(D),
  )

  // smooth xi: a few low-frequency modes
  for (let site = 0; site < xi.length; site++) {
    const c = coordsOf(site, L)

    for (let mu = 0; mu < D; mu++) {
      let v = 0

      for (let k = 1; k <= 2; k++) {
        v +=
          (rng.next() - 0.5) *
          Math.cos((2 * Math.PI * k * (c[mu] ?? 0)) / L)
      }

      xi[site]![mu] = v
    }
  }

  const hGauge = makeField(L)

  for (let site = 0; site < hGauge.data.length; site++) {
    const coords = coordsOf(site, L)

    const dxi = (alpha: number, mu: number): number => {
      const p = siteIndex(shift(coords, alpha, 1, L), L)
      const m = siteIndex(shift(coords, alpha, -1, L), L)

      return ((xi[p]![mu] ?? 0) - (xi[m]![mu] ?? 0)) / 2
    }

    for (let mu = 0; mu < D; mu++) {
      for (let nu = 0; nu < D; nu++) {
        hGauge.data[site]![mu * D + nu] = dxi(mu, nu) + dxi(nu, mu)
      }
    }
  }

  const gaugeResidual =
    maxAbs(linearizedEinstein(hGauge)) / Math.max(1e-12, maxAbs(hGauge))

  // 2. Mass term: a constant (uniform) perturbation. A mass term would give G != 0 for it; a
  // massless operator gives exactly 0 (it is all derivatives).
  const hConst = makeField(L)

  for (let site = 0; site < hConst.data.length; site++) {
    hConst.data[site]![1 * D + 1] = 0.7 // a constant h_xx
  }

  const massTermResidual = maxAbs(linearizedEinstein(hConst))

  // 3. Dispersion: a transverse-traceless plane wave with spatial wavevector k along z. The
  // operator eigenvalue should be proportional to k^2 (massless), going to zero as k -> 0.
  const eigenOverK2: number[] = []

  for (const kn of [1, 2, 3]) {
    const kz = (2 * Math.PI * kn) / L
    const h = makeField(L)

    // TT polarization for k along z: h_xx = +1, h_yy = -1 (transverse to z, traceless).
    for (let site = 0; site < h.data.length; site++) {
      const c = coordsOf(site, L)
      const phase = Math.cos(kz * (c[3] ?? 0))
      h.data[site]![1 * D + 1] = phase
      h.data[site]![2 * D + 2] = -phase
    }

    const g = linearizedEinstein(h)

    // eigenvalue: G_xx / h_xx at a site where h_xx is near its max
    let best = 0
    let bestPhase = 0

    for (let site = 0; site < h.data.length; site++) {
      const hxx = h.data[site]![1 * D + 1] ?? 0

      if (Math.abs(hxx) > bestPhase) {
        bestPhase = Math.abs(hxx)
        best = (g.data[site]![1 * D + 1] ?? 0) / hxx
      }
    }

    // lattice k^2 for the central-difference-squared operator: the eigenvalue is sin(kz)^2
    const latticeK2 = Math.pow(Math.sin(kz), 2)
    eigenOverK2.push(best / latticeK2)
  }

  // massless: eigenvalue proportional to k^2 with the SAME constant across k (so eigen/k^2 is flat)
  const mean =
    eigenOverK2.reduce((a, b) => a + b, 0) / eigenOverK2.length

  const spread = Math.max(...eigenOverK2.map(x => Math.abs(x - mean)))
  const dispersionMassless =
    massTermResidual < 1e-9 &&
    spread / Math.max(1e-9, Math.abs(mean)) < 0.05

  // 4. Polarizations: MEASURED from the operator's momentum-space spectrum (not asserted).
  const pol = gravitonPolarizationsFromSpectrum({ side: L, mode: 2 })
  const polarizations = pol.physical

  return {
    gaugeResidual,
    massTermResidual,
    planeWaveEigenOverK2: eigenOverK2,
    dispersionMassless,
    polarizations,
    polarizationGaugeModes: pol.gauge,
    polarizationSpectrum: pol.eigenvalues,
    solved:
      gaugeResidual < 1e-9 &&
      massTermResidual < 1e-9 &&
      dispersionMassless &&
      polarizations === 2,
  }
}

export default experiment({
  id: 'gravity/discrete-graviton',
  title:
    'discrete graviton is gauge-invariant, massless, two polarizations verified as eigenmodes',
  category: 'gravity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = discreteGraviton({ seed: 1 })
    const ok =
      r.solved &&
      r.gaugeResidual < 1e-9 &&
      r.massTermResidual < 1e-9 &&
      r.dispersionMassless &&
      r.polarizations === 2 &&
      r.polarizationGaugeModes === 4

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the lattice linearized Einstein operator is gauge-invariant and massless with two transverse-traceless eigenmodes and four gauge zeros',
      metrics: {
        gaugeResidual: r.gaugeResidual,
        massTermResidual: r.massTermResidual,
        polarizations: r.polarizations,
        polarizationGaugeModes: r.polarizationGaugeModes,
      },
    })
  },
})
