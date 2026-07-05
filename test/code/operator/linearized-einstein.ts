// Conformance for code/operator/linearized-einstein: the linearized Einstein (graviton)
// operator on a periodic 4D lattice. Re-derivable facts of a massless spin-2 field:
//   - Lattice gauge invariance is EXACT: a pure-gauge field h_{mu nu} = d_mu xi_nu + d_nu xi_mu
//     built from the same central first differences is annihilated (the operator's stencil is
//     designed to compose exactly with them).
//   - The momentum-space spectrum has exactly 4 gauge zero modes (the diffeomorphisms in 4D)
//     and exactly 2 physical (transverse-traceless, propagating) polarizations.
//   - The operator is linear, and the index/coords maps round-trip.

import { suite, check, equal, close, ok } from '@/test/code/harness'
import {
  linearizedEinstein,
  makeTensorField,
  gravitonCoordsOf,
  gravitonSiteIndex,
  gravitonShift,
  tensorFieldMaxAbs,
  gravitonPolarizationsFromSpectrum,
  GRAVITON_DIMENSION,
} from '@/code/operator/linearized-einstein'

const D = GRAVITON_DIMENSION

suite('operator/linearized-einstein: index maps', [
  check('site index and coords round-trip', () => {
    const L = 4
    const n = Math.pow(L, D)

    for (let i = 0; i < n; i++) {
      equal(
        gravitonSiteIndex(gravitonCoordsOf(i, L), L),
        i,
        `roundtrip ${i}`,
      )
    }
  }),
])

suite('operator/linearized-einstein: lattice gauge invariance', [
  check(
    'a pure-gauge field h = d xi + (d xi)^T is annihilated exactly',
    () => {
      const L = 4
      const kz = (2 * Math.PI * 1) / L
      const amplitude = [0.3, -0.2, 0.5, 0.4]

      // vector field xi_nu(x) = amplitude_nu * cos(kz * z)
      const xi: Float64Array[] = []

      for (let s = 0; s < Math.pow(L, D); s++) {
        const c = gravitonCoordsOf(s, L)
        const phase = Math.cos(kz * (c[3] ?? 0))
        const v = new Float64Array(D)

        for (let nu = 0; nu < D; nu++) {
          v[nu] = (amplitude[nu] ?? 0) * phase
        }

        xi.push(v)
      }

      const centralDiff = (
        s: number,
        axis: number,
        fn: (site: number) => number,
      ): number => {
        const c = gravitonCoordsOf(s, L)
        const plus = gravitonSiteIndex(gravitonShift(c, axis, 1, L), L)
        const minus = gravitonSiteIndex(
          gravitonShift(c, axis, -1, L),
          L,
        )

        return (fn(plus) - fn(minus)) / 2
      }

      const h = makeTensorField(L)

      for (let s = 0; s < h.data.length; s++) {
        for (let mu = 0; mu < D; mu++) {
          for (let nu = 0; nu < D; nu++) {
            h.data[s]![mu * D + nu] =
              centralDiff(s, mu, site => xi[site]![nu] ?? 0) +
              centralDiff(s, nu, site => xi[site]![mu] ?? 0)
          }
        }
      }

      ok(
        tensorFieldMaxAbs(h) > 0.1,
        'the pure-gauge field is nontrivial',
      )
      close(
        tensorFieldMaxAbs(linearizedEinstein(h)),
        0,
        1e-12,
        'pure-gauge residual',
      )
    },
  ),
])

suite(
  'operator/linearized-einstein: polarization count from spectrum',
  [
    check('2 physical polarizations and 4 gauge zero modes', () => {
      const result = gravitonPolarizationsFromSpectrum({
        side: 4,
        mode: 1,
      })

      equal(result.physical, 2, 'physical (TT) polarizations')
      equal(result.gauge, 4, 'gauge (diffeomorphism) zero modes')
    }),
  ],
)
