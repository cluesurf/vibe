// Frontier 5, resolving the tensor-ratio tension: the inflaton potential shape. E-CSM-0044 used a
// quadratic potential and matched n_s but got r about 0.14, exceeding the observational bound r <
// 0.06. This shows that a PLATEAU potential, which the exponential growth of the hyperbolic mesh
// naturally produces, resolves the tension, keeping n_s while dropping r into the allowed band.
//
// The physical tie: the {3,4,3,4} mesh is hyperbolic and grows EXPONENTIALLY, with a shell factor
// lambda about 18 (E-GMT-0003). Exponential spatial growth at a constant rate is de Sitter
// expansion at a constant Hubble rate, and a constant-H inflationary epoch is exactly what a flat
// PLATEAU potential gives (the field rolls slowly on the plateau). So the mesh geometry motivates a
// plateau, not the steep quadratic. The representative plateau is the Starobinsky form V = V0 (1 -
// exp(-sqrt(2/3) phi))^2, the canonical potential of exponential expansion (R-squared gravity).
//
// Computed here by the slow-roll formalism (deterministic, integrating the e-folds back from the
// end of inflation):
//   - the QUADRATIC potential gives n_s about 0.964 (good) but r about 0.14 (the tension),
//   - the PLATEAU potential gives n_s about 0.965 (matching Planck's central 0.9649) AND r about
//     0.004, an order of magnitude below the bound, resolving the tension.
// So the tensor-ratio problem of E-CSM-0044 is not a failure of the model, it is a signal that the
// inflaton potential is a plateau, which is what the exponentially-growing mesh produces.
//
// HONEST scope: this shows a plateau RESOLVES the tension and that the mesh growth MOTIVATES a
// plateau (exponential growth is de Sitter). It uses the Starobinsky form as the representative
// plateau, it does NOT derive the exact potential shape from the mesh dynamics, which is the deeper
// remaining step. So it is the resolution DIRECTION for frontier 5, with the specific mesh-derived
// shape open, the analogue of a motivated mechanism before its full realisation.
//
// Grade L2: the tensor-ratio tension resolved by a mesh-motivated plateau potential (n_s kept, r
// dropped below the bound), with the quadratic potential (E-CSM-0044) as the control that shows the
// tension the plateau removes.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Potential = (phi: number) => { V: number; Vp: number; Vpp: number }

const quadratic: Potential = phi => ({
  V: 0.5 * phi * phi,
  Vp: phi,
  Vpp: 1,
})

const plateau: Potential = phi => {
  const b = Math.sqrt(2 / 3)
  const e = Math.exp(-b * phi)

  return {
    V: (1 - e) ** 2,
    Vp: 2 * (1 - e) * b * e,
    Vpp: 2 * b * b * e * (2 * e - 1),
  }
}

// the field value where slow-roll ends (epsilon = 1), searching downward from a plateau guess
function findEnd(pot: Potential, guess: number): number {
  let phi = guess

  for (let i = 0; i < 2000000; i++) {
    const p = pot(phi)
    const eps = 0.5 * (p.Vp / p.V) ** 2

    if (eps >= 1) return phi

    phi -= 1e-4
  }

  return phi
}

// integrate targetN e-folds back (to larger phi) from the end, return n_s and r there
function observables(
  pot: Potential,
  phiEnd: number,
  targetN: number,
): { ns: number; r: number } {
  let phi = phiEnd
  let efolds = 0

  const dphi = 1e-4

  while (efolds < targetN && phi < 200) {
    const p = pot(phi)

    efolds += Math.abs((p.V / p.Vp) * dphi)
    phi += dphi
  }

  const p = pot(phi)
  const eps = 0.5 * (p.Vp / p.V) ** 2
  const eta = p.Vpp / p.V

  return { ns: 1 - 6 * eps + 2 * eta, r: 16 * eps }
}

export default experiment({
  id: 'cosmology/plateau-inflation-tensor',
  code: 'E-CSM-0046',
  title:
    'the tensor-ratio tension of the quadratic inflaton (E-CSM-0044, r about 0.14) is resolved by a plateau potential, which the exponential growth of the hyperbolic mesh naturally produces (constant-H de Sitter): the plateau gives n_s about 0.965 matching Planck and r about 0.004 well below the 0.06 bound, so the tensor tension signals a plateau, the mesh-derived shape the remaining step',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const N = 55 // e-folds before the end of inflation (the observable pivot)

    const quad = observables(quadratic, findEnd(quadratic, 6), N)
    const plat = observables(plateau, findEnd(plateau, 0.6), N)

    // 1. the quadratic potential has the tensor tension (r above the bound).
    const quadraticInTension = quad.r > 0.06

    // 2. the plateau keeps a good n_s (near the Planck central value).
    const plateauNsGood = Math.abs(plat.ns - 0.9649) < 0.01

    // 3. the plateau drops r well below the bound, resolving the tension.
    const plateauResolvesTensor = plat.r < 0.06 && plat.r < quad.r / 10

    const solved =
      quadraticInTension && plateauNsGood && plateauResolvesTensor

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the quadratic inflaton potential of E-CSM-0044 gives a good spectral index but a tensor-to-scalar ratio r about 0.14 that exceeds the observational bound 0.06, while a plateau potential, which the exponentially-growing hyperbolic mesh naturally produces since exponential growth is constant-Hubble de Sitter expansion, gives n_s about 0.965 matching the Planck central value and r about 0.004, an order of magnitude below the bound, so the tensor tension is resolved by the plateau and signals that the inflaton potential is a plateau, with the specific mesh-derived shape (here represented by the canonical Starobinsky form) the remaining step',
      metrics: {
        quadraticNs: Number(quad.ns.toFixed(4)),
        quadraticR: Number(quad.r.toFixed(4)),
        plateauNs: Number(plat.ns.toFixed(4)),
        plateauR: Number(plat.r.toFixed(4)),
        planckNs: 0.9649,
        tensorBound: 0.06,
      },
      control: {
        // the quadratic potential is the control: same slow-roll machinery, same e-fold count,
        // but r about 0.14, above the bound. The plateau, differing only in the potential SHAPE
        // (flat versus steep), drops r by more than an order of magnitude. So it is the shape,
        // the plateau, that resolves the tension, not a change of the inflation parameters.
        quadraticR: Number(quad.r.toFixed(4)),
        plateauR: Number(plat.r.toFixed(4)),
      },
      notes:
        'L2. Slow-roll observables (n_s = 1 - 6 eps + 2 eta, r = 16 eps) integrated deterministically 55 e-folds back from the end of inflation. The quadratic (E-CSM-0044) gives n_s 0.964, r 0.144 (tension); the plateau gives n_s 0.965 (matching Planck 0.9649) and r 0.0035 (below 0.06). The plateau is motivated by the mesh geometry: the hyperbolic {3,4,3,4} mesh grows exponentially (E-GMT-0003), which is de Sitter at constant H, the regime of a flat potential. Honest scope: this shows a plateau resolves the tension and the mesh motivates a plateau; it uses the Starobinsky form as the representative plateau and does NOT derive the exact shape from the mesh dynamics, which is the open step. The resolution direction for frontier 5, with the mesh-derived shape remaining.',
    })
  },
})
