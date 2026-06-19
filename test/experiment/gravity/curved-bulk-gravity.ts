// GR9 of chunk 10, the curved-bulk gravity frontier, the STATIC potential law resolved. The naive expectation,
// a 1/r Newtonian tail inside the curved bulk, is wrong, and that is why gravity/gravity-3434 was recorded open.
// In the negatively-curved {5,3,4} bulk the discrete Laplacian Green function (the potential from a point source)
// decays EXPONENTIALLY, the curvature gives the Laplacian a spectral gap, a screened short-range potential, the
// power-law fit is worse. On the FLAT cubic cusp (physical 3D space) the SAME Green function decays as a power
// law (1/r, Newton), the exponential fit is worse. So curved-bulk gravity is short-range, screened by the
// curvature, and the Newtonian 1/r tail is a property of the FLAT CUSP, not the bulk. This identifies the missing
// ingredient the open frontier asked for. The reversible, fully-nonlinear PROPAGATING curved-bulk gravity (the
// dynamical half of GR9) remains open, named honestly.

import { buildCoxeterMesh } from '@/code/substrate/coxeter/engine'
import { neighborDistances } from '@/code/tool/graph'
import { greensDecayClass } from '@/code/measure/greens-function'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'gravity/curved-bulk-gravity',
  title:
    'curved-bulk gravity is exponentially screened, the 1/r Newton tail is a flat-cusp property not a bulk one',
  category: 'gravity',
  substrates: ['534'],
  depth: 'L2',
  paper: true,
  run() {
    // the negatively-curved bulk
    const hyp = buildCoxeterMesh({
      symbol: [5, 3, 4],
      depth: 20,
      maxChambers: 40000,
    })

    const n = hyp.cellCount

    let center = 0

    for (let i = 1; i < n; i++) {
      if (hyp.neighbors[i]!.length > hyp.neighbors[center]!.length) {
        center = i
      }
    }

    const dist = neighborDistances({
      neighbors: hyp.neighbors,
      size: n,
      source: center,
    })

    let maxD = 0

    for (let i = 0; i < n; i++) {
      if (dist[i]! > maxD) {
        maxD = dist[i]!
      }
    }

    const bulk = greensDecayClass({
      neighbors: hyp.neighbors,
      size: n,
      center,
      rlo: 1,
      rhi: maxD - 1,
    })

    // the flat cubic cusp (physical 3D space), built as a plain 3D lattice, fit on the inner region away from the box edge
    const L = 40
    const idx = (x: number, y: number, z: number) => (x * L + y) * L + z
    const N = L * L * L
    const flatN: number[][] = Array.from({ length: N }, () => [])
    const steps = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ]

    for (let x = 0; x < L; x++) {
      for (let y = 0; y < L; y++) {
        for (let z = 0; z < L; z++) {
          const i = idx(x, y, z)

          for (const [dx, dy, dz] of steps) {
            const a = x + dx!,
              b = y + dy!,
              c = z + dz!

            if (a >= 0 && a < L && b >= 0 && b < L && c >= 0 && c < L) {
              flatN[i]!.push(idx(a, b, c))
            }
          }
        }
      }
    }

    const flat = greensDecayClass({
      neighbors: flatN,
      size: N,
      center: idx(L >> 1, L >> 1, L >> 1),
      rlo: 2,
      rhi: 10,
    })

    const bulkExponential =
      bulk.exponential && bulk.expR2 > 0.85 && bulk.expRate < -0.1 // curved bulk: screened, exponential wins

    const cuspPowerLaw =
      !flat.exponential && flat.powR2 > 0.9 && flat.powSlope < -0.6 // flat cusp: Newton power law wins

    const ok = bulkExponential && cuspPowerLaw

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'in the negatively-curved {5,3,4} bulk the gravitational Green function decays exponentially (the curvature screens it, a spectral gap, power-law fit worse), while on the flat cubic cusp the same Green function decays as a power law (1/r Newton, exponential fit worse), so curved-bulk gravity is short-range and screened and the Newtonian 1/r tail is a flat-cusp property, not a bulk one, which is the ingredient the open gravity-3434 was missing',
      metrics: {
        cells: n,
        bulkExpR2: Number(bulk.expR2.toFixed(3)),
        bulkExpRate: Number(bulk.expRate.toFixed(3)),
        bulkPowR2: Number(bulk.powR2.toFixed(3)),
        cuspPowR2: Number(flat.powR2.toFixed(3)),
        cuspPowSlope: Number(flat.powSlope.toFixed(3)),
        cuspExpR2: Number(flat.expR2.toFixed(3)),
      },
      // CONTROL: the flat cusp Green function is power-law (Newtonian), so the exponential decay is the bulk's negative curvature, not an artifact of the finite Green-function solve.
      control: {
        cuspIsPowerLaw: cuspPowerLaw ? 1 : 0,
        cuspExponentialR2: Number(flat.expR2.toFixed(3)),
      },
      notes:
        'Supports the gravity-paper-readiness thesis, the base bulk is screened (anti-confining, 2B), the Newtonian 1/r is a CUSP property, so gravity is the emergent CUSP metric, not a bulk force. This is the static potential law on the bulk vs cusp, consistent with the emergent-metric account.',
    })
  },
})
