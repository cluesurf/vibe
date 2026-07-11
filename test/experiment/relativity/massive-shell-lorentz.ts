// Exact Lorentz invariance of the MASSIVE sector, in deformed variables, the second half of the
// clever route. E-RLT-0042 made the light sector exactly boost covariant and left the massive
// sector to the deformed (doubly-special) regime. Here the deformation is made exact: from the
// walk dispersion cos(omega) = cos(mass) cos(k) follows the identity
// sin^2(omega) - cos^2(mass) sin^2(k) = sin^2(mass), EXACTLY, at every momentum in the zone. So
// in the variables E = sin(omega), P = cos(mass) sin(k), the massive shell is a genuine Lorentz
// hyperbola E^2 - P^2 = sin^2(mass): the STANDARD continuous boosts act on (E, P) exactly, the
// invariant rest mass is sin(mass), and the group velocity measured from the dynamics equals
// P / E, the relativistic velocity formula in deformed variables. Boosting a dynamical mode and
// mapping back gives another dynamical mode of the same walk, to machine precision.
//
// So the massive sector is not approximately Lorentz invariant: it is EXACTLY Lorentz invariant
// under a deformed (invertible, continuum-converging) change of variables, with sin(mass) as the
// invariant mass, going to mass in the continuum. What the lattice deforms is the map from
// frequency to energy, not the symmetry. The boost range is bounded by the zone edge (the
// deformed energy cannot exceed one), the single genuinely discrete signature.
//
// The control is the naive variables: omega^2 - k^2 is NOT invariant across the zone (it varies
// by a finite spread), so the deformation is necessary, not decoration.
//
// Depth L2. It establishes the exact deformed Lorentz invariance of the massive walk shell
// (identity, boost closure onto dynamical modes, relativistic velocity law) against the naive
// variable control, completing the Lorentz reconciliation begun in E-RLT-0042.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { omegaFromDynamics } from '@/code/dynamics/walk-dispersion'
import {
  shellVariables,
  boostShell,
} from '@/code/measure/discrete-boost'

const MASS = 0.5
const ZONE_MOMENTA = [0.2, 0.8, 1.5, 2.5]
const RAPIDITY = 0.4

export default experiment({
  id: 'relativity/massive-shell-lorentz',
  code: 'E-RLT-0043',
  title:
    'the massive walk shell is exactly Lorentz invariant in deformed variables: E^2 - P^2 = sin^2(mass) at every momentum, boosts map dynamical modes to dynamical modes, and the group velocity is P/E',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the exact shell identity across the zone, frequencies measured from the dynamics
    let worstShell = 0
    let naiveSpreadMin = Infinity
    let naiveSpreadMax = -Infinity

    for (const k of ZONE_MOMENTA) {
      const omega = omegaFromDynamics({ k, mass: MASS })
      const { energy, momentum } = shellVariables({
        omega,
        k,
        mass: MASS,
      })

      worstShell = Math.max(
        worstShell,
        Math.abs(
          energy * energy -
            momentum * momentum -
            Math.sin(MASS) * Math.sin(MASS),
        ),
      )

      const naive = omega * omega - k * k

      naiveSpreadMin = Math.min(naiveSpreadMin, naive)
      naiveSpreadMax = Math.max(naiveSpreadMax, naive)
    }

    // the boost maps a dynamical mode to a dynamical mode: boosted energy equals the walk's own
    // frequency at the boosted momentum, measured from the dynamics
    const k0 = 0.6
    const omega0 = omegaFromDynamics({ k: k0, mass: MASS })
    const pair = shellVariables({ omega: omega0, k: k0, mass: MASS })
    const boosted = boostShell({ ...pair, rapidity: RAPIDITY })

    const boostedMomentum = Math.asin(boosted.momentum / Math.cos(MASS))
    const boostedOmega = omegaFromDynamics({
      k: boostedMomentum,
      mass: MASS,
    })

    const boostClosure = Math.abs(
      Math.asin(boosted.energy) - boostedOmega,
    )

    // the relativistic velocity law: measured group velocity equals P / E
    const groupVelocity =
      (omegaFromDynamics({ k: k0 + 1e-5, mass: MASS }) - omega0) / 1e-5

    const velocityLaw = Math.abs(
      groupVelocity - pair.momentum / pair.energy,
    )

    const shellExact = worstShell < 1e-12
    const closes = boostClosure < 1e-9
    const velocityMatches = velocityLaw < 1e-4
    // CONTROL: the naive omega^2 - k^2 varies across the zone, no invariance without deformation
    const naiveNotInvariant = naiveSpreadMax - naiveSpreadMin > 0.1

    const ok =
      shellExact && closes && velocityMatches && naiveNotInvariant

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'with frequencies measured from the walk dynamics, the deformed variables E = sin(omega) and P = cos(mass) sin(k) satisfy E^2 - P^2 = sin^2(mass) to machine precision at every momentum across the zone (an exact Lorentz hyperbola with invariant rest mass sin(mass), converging to mass in the continuum), a standard boost on (E, P) lands exactly on another dynamical mode of the same walk (closure at machine precision), and the measured group velocity equals P over E (the relativistic velocity law in deformed variables), while the naive omega^2 - k^2 varies by a finite spread across the same momenta, so the massive sector is exactly Lorentz invariant under the deformation and what the lattice changes is the frequency-to-energy map, not the symmetry, the boost range bounded only by the zone edge',
      metrics: {
        worstShellIdentity: Number(worstShell.toExponential(2)),
        boostClosure: Number(boostClosure.toExponential(2)),
        velocityLawError: Number(velocityLaw.toExponential(2)),
        invariantMass: Number(Math.sin(MASS).toFixed(5)),
        naiveSpread: Number(
          (naiveSpreadMax - naiveSpreadMin).toFixed(4),
        ),
      },
      // CONTROL: the naive variables are not invariant, the deformation is necessary.
      control: {
        naiveSpread: Number(
          (naiveSpreadMax - naiveSpreadMin).toFixed(4),
        ),
      },
      notes:
        'The massive completion of E-RLT-0042: exact Lorentz invariance in the deformed variables (sin omega, cos mass sin k), invariant mass sin(mass). The doubly-special deformation (E-RLT-0010) is thus an exact symmetry in the right variables, and the zone edge is the one discrete signature.',
    })
  },
})
