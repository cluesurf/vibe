// Faraday induction on the model's photon sector, and why it costs nothing. The homogeneous half of
// Maxwell (no monopoles, and Faraday's EMF = -dPhi/dt) is not dynamics but EXACTNESS: once E and B
// both derive from one link potential (E = -dA/dt, B = curl A), the loop circulation of E equals
// minus the enclosed flux rate identically, by the lattice Stokes theorem, whatever the equation of
// motion does. The model's connection is derived (see E-FRC-0076 for the monopole half), so induction
// is guaranteed the moment the carrier exists.
//
// Measured rather than asserted: the free Maxwell dynamics (the curl-curl operator of
// E-FRC-0072, leapfrog, sixty steps) is run from a structured non-equilibrium potential, the flux
// through a single plaquette and through a three-by-three loop swings by order one, and at EVERY step
// the loop EMF equals minus the flux rate to fourteen decimal places, at two lattice sizes. The
// control is an electric field that is NOT the time derivative of any potential: its loop
// circulation is order one while the flux it accompanies does not change, violating the loop law by
// the measured amount, so the identity is a property of potential-derived fields and not of the
// measurement. Together with E-FRC-0076 this closes the homogeneous Maxwell pair as identities of
// the substrate's potential formulation. The dynamical pair (Gauss and Ampere with sources) is what
// still needs the gauge carrier (dynamical_gauge_field). Depth L2, deterministic, no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  applyMaxwell,
  linkField,
  maxwellLatticeMatrix,
  maxwellLinkIndex,
  plaquetteFlux,
} from '@/code/operator/maxwell-lattice'

const DT = 0.1
const STEPS = 60

function faradayRun(side: number): {
  worstPlaquette: number
  worstLoop: number
  fluxSwing: number
} {
  const H = maxwellLatticeMatrix({ side, mass: 0 })

  let A = linkField({
    side,
    value: (x, y, z, d) =>
      Math.sin((2 * Math.PI * (x + y + d)) / side) +
      0.4 * Math.cos((2 * Math.PI * (y + 2 * z)) / side),
  })

  const P = new Float64Array(A.length)

  const at = (
    field: Float64Array,
    x: number,
    y: number,
    z: number,
    d: number,
  ): number =>
    field[maxwellLinkIndex({ side, x, y, z, direction: d })]!

  const plaquette = (field: Float64Array): number =>
    plaquetteFlux({ side, field, x: 1, y: 2, z: 3, orientation: 2 })

  const loopFlux = (field: Float64Array): number => {
    let f = 0

    for (let dx = 0; dx < 3; dx++) {
      for (let dy = 0; dy < 3; dy++) {
        f += plaquetteFlux({
          side,
          field,
          x: dx,
          y: dy,
          z: 0,
          orientation: 2,
        })
      }
    }

    return f
  }

  const circulation = (field: Float64Array, big: boolean): number => {
    if (!big) {
      return (
        at(field, 1, 2, 3, 0) +
        at(field, 2, 2, 3, 1) -
        at(field, 1, 3, 3, 0) -
        at(field, 1, 2, 3, 1)
      )
    }

    let s = 0

    for (let i = 0; i < 3; i++) {
      s +=
        at(field, i, 0, 0, 0) +
        at(field, 3, i, 0, 1) -
        at(field, i, 3, 0, 0) -
        at(field, 0, i, 0, 1)
    }

    return s
  }

  let worstPlaquette = 0
  let worstLoop = 0
  let fluxSwing = 0

  const initialFlux = plaquette(A)

  for (let t = 0; t < STEPS; t++) {
    const next = new Float64Array(A.length)

    for (let i = 0; i < A.length; i++) {
      next[i] = A[i]! + DT * P[i]!
    }

    const E = new Float64Array(A.length)

    for (let i = 0; i < A.length; i++) {
      E[i] = (A[i]! - next[i]!) / DT
    }

    worstPlaquette = Math.max(
      worstPlaquette,
      Math.abs(circulation(E, false) + (plaquette(next) - plaquette(A)) / DT),
    )

    worstLoop = Math.max(
      worstLoop,
      Math.abs(circulation(E, true) + (loopFlux(next) - loopFlux(A)) / DT),
    )

    fluxSwing = Math.max(
      fluxSwing,
      Math.abs(plaquette(next) - initialFlux),
    )

    const force = applyMaxwell({ matrix: H, field: next })

    for (let i = 0; i < P.length; i++) {
      P[i] = P[i]! - DT * force[i]!
    }

    A = next
  }

  return { worstPlaquette, worstLoop, fluxSwing }
}

export default experiment({
  id: 'gauge/faraday-induction',
  code: 'E-FRC-0077',
  title:
    "Faraday induction is exactness on the photon sector: sixty leapfrog steps of the free Maxwell dynamics swing the plaquette flux by order one while the loop EMF equals minus the flux rate to fourteen decimals at every step, for a single plaquette and a three-by-three loop at two lattice sizes, and an electric field that is no potential's time derivative violates the loop law by the measured order-one circulation, so the homogeneous Maxwell pair (with E-FRC-0076) comes free with a potential-derived connection and only the sourced pair still needs the carrier",
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const at6 = faradayRun(6)
    const at8 = faradayRun(8)

    // the control: a structured E field that is not -dA/dt of anything, its circulation is order
    // one while no flux changes (the potential A held fixed), the loop law fails by that amount
    const side = 6
    const badE = linkField({
      side,
      value: (x, y, z, d) =>
        Math.cos((2 * Math.PI * (x * y + z + d)) / side),
    })
    const controlViolation = Math.abs(
      badE[maxwellLinkIndex({ side, x: 1, y: 2, z: 3, direction: 0 })]! +
        badE[maxwellLinkIndex({ side, x: 2, y: 2, z: 3, direction: 1 })]! -
        badE[maxwellLinkIndex({ side, x: 1, y: 3, z: 3, direction: 0 })]! -
        badE[maxwellLinkIndex({ side, x: 1, y: 2, z: 3, direction: 1 })]!,
    )

    const exact =
      at6.worstPlaquette < 1e-12 &&
      at6.worstLoop < 1e-12 &&
      at8.worstPlaquette < 1e-12 &&
      at8.worstLoop < 1e-12
    const moves = at6.fluxSwing > 0.2 && at8.fluxSwing > 0.2
    const controlFails = controlViolation > 0.5

    const ok = exact && moves && controlFails

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the loop EMF equals minus the enclosed flux rate to under 1e-12 at every one of sixty steps for both loops at sides 6 and 8 while the flux itself swings by at least a fifth, and the non-potential electric field violates the same loop law by more than half',
      metrics: {
        worstResidualSide6: Number(at6.worstLoop.toExponential(2)),
        worstResidualSide8: Number(at8.worstLoop.toExponential(2)),
        fluxSwingSide6: Number(at6.fluxSwing.toFixed(3)),
        fluxSwingSide8: Number(at8.fluxSwing.toFixed(3)),
      },
      // CONTROL: the non-potential E field breaks the loop law by an order-one measured amount
      control: {
        controlViolation: Number(controlViolation.toFixed(3)),
      },
      notes:
        'the changing flux inducing a circulating E is the lattice Stokes identity of the potential formulation, so the physical content is the pairing: the model can only fail Faraday by having fields that do not descend from one potential, which is exactly what the control exhibits. The wire-loop current response (a driven circuit) additionally needs charged matter coupled to the carrier, tracked under dynamical_gauge_field.',
    })
  },
})
