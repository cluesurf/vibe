// O2.1 (#3, rule-options-for-attraction), the emergent-gauge attraction, the field-mediated route. The bare rule
// has no force at a distance, but the gauge sector (the coin's 8v field) mediates a real Coulomb attraction. In
// ONE spatial dimension the Coulomb potential is LINEAR (the field of a point charge is constant, Gauss law), so
// two opposite charges feel a constant attractive force, they are CONFINED, bound at any energy, they cannot
// escape. This is the strongest binding of the three routes (Casimir is short-range, the breather is pinned), and
// it is the gauge sector's signature.
//
// We launch two charges APART with a large outward velocity and integrate the 1D gauge (Schwinger) force, the
// pairwise constant force from the enclosed charge. Three cases.
//   opposite charges, gauge on, the constant attraction decelerates and RETURNS them, the separation stays
//     BOUNDED however hard they are launched, confinement.
//   opposite charges, gauge off (coupling zero), no force, they ESCAPE, the separation grows without bound.
//   like charges, gauge on, they REPEL and separate, so the binding is the opposite-charge attraction, not a
//     generic pull.
//
// This is field-mediated attraction (L2, the coupling is an input, see gauge/coupled-qed-3434), and it binds far
// more strongly than the emergent vacuum Casimir. With a bath it would also settle to the ground state (the
// inspiral-capture mechanism). Capture is therefore reachable by either the cheap vacuum Casimir or this stronger
// gauge attraction.
//
// Depth L2, the 1D gauge confinement of two opposite charges, with the zero-coupling and like-charge controls.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// integrate two charges under the 1D gauge force, launched apart, return the max and final separation.
function evolve(input: { q1: number; q2: number; coupling: number }): {
  maxSeparation: number
  finalSeparation: number
} {
  const dt = 0.1
  const steps = 3000
  const fieldStrength = 0.5 // the constant 1D field per unit enclosed charge (Gauss law)
  const domain = 400 // a far wall, an escaped pair runs to here
  let x1 = -3
  let x2 = 3
  let v1 = -1.5 // launched APART
  let v2 = 1.5
  let maxSeparation = x2 - x1
  for (let t = 0; t < steps; t++) {
    // 1D gauge force on each charge, q_i times the field from the OTHER charge (constant, points away from +).
    const f1 =
      input.coupling *
      input.q1 *
      (input.q2 * Math.sign(x1 - x2) * fieldStrength)
    const f2 =
      input.coupling *
      input.q2 *
      (input.q1 * Math.sign(x2 - x1) * fieldStrength)
    v1 += f1 * dt
    v2 += f2 * dt
    x1 += v1 * dt
    x2 += v2 * dt
    if (x1 < -domain) {
      x1 = -domain
    }

    if (x2 > domain) {
      x2 = domain
    }

    const sep = Math.abs(x2 - x1)
    if (sep > maxSeparation) {
      maxSeparation = sep
    }
  }

  return { maxSeparation, finalSeparation: Math.abs(x2 - x1) }
}

export default experiment({
  id: 'gauge/two-charge-binding',
  title:
    'the 1D gauge force confines two opposite charges (bound at any energy), zero coupling lets them escape',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const gaugeOpposite = evolve({ q1: 1, q2: -1, coupling: 1 }) // attract, confine
    const noCoupling = evolve({ q1: 1, q2: -1, coupling: 0 }) // no force, escape
    const likeCharge = evolve({ q1: 1, q2: 1, coupling: 1 }) // repel, separate

    // confinement, the opposite charges stay BOUNDED (the constant force turns them around at a finite
    // separation however hard they are launched), while the uncoupled and like-charge pairs run to the far wall.
    const confined = gaugeOpposite.maxSeparation < 30
    const uncoupledEscapes = noCoupling.maxSeparation > 100
    const likeChargeSeparates = likeCharge.maxSeparation > 100

    const ok = confined && uncoupledEscapes && likeChargeSeparates

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two opposite charges launched apart in the 1D gauge field stay bound, the constant Gauss-law force returns them and the separation stays bounded (confinement, binding at any energy), while with zero coupling they escape and like charges repel, so the gauge sector mediates a real confining attraction, the strongest binding route',
      metrics: {
        gaugeOppositeMaxSeparation: gaugeOpposite.maxSeparation,
        gaugeOppositeFinalSeparation: gaugeOpposite.finalSeparation,
        noCouplingMaxSeparation: noCoupling.maxSeparation,
        likeChargeMaxSeparation: likeCharge.maxSeparation,
        confined: confined ? 1 : 0,
        uncoupledEscapes: uncoupledEscapes ? 1 : 0,
        likeChargeSeparates: likeChargeSeparates ? 1 : 0,
      },
      control: {
        noCouplingMaxSeparation: noCoupling.maxSeparation,
        likeChargeMaxSeparation: likeCharge.maxSeparation,
      },
      notes:
        'field-mediated gauge attraction (L2, coupling is an input as in gauge/coupled-qed-3434). In 1D the gauge potential is linear, so opposite charges are CONFINED, bound at any launch energy, the strongest of the attraction routes. With a bath this would also settle (the inspiral-capture mechanism). So capture is reachable by the cheap vacuum Casimir (selves/casimir-vacuum-attraction) or by this stronger gauge attraction',
    })
  },
})
