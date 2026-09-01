// The Ward identity of the lattice Maxwell operator, MEASURED rather than inferred. Gauge invariance of
// the free U(1) field says a pure-gauge configuration, the lattice gradient of any scalar chi, is
// invisible to the dynamics: H (d chi) = 0 exactly. That is the Ward identity in its operator form (the
// longitudinal mode decouples, the photon propagator is transverse), and it has a countable
// consequence: on a connected periodic lattice the gradients span a space of dimension sites - 1, and
// the three-torus adds exactly three closed-but-not-exact link fields, the constant field in each
// direction (the Wilson lines around the torus, the first Betti number of T^3), which have zero curl but
// are no scalar's gradient. So the operator has exactly sites - 1 + 3 = sites + 2 zero modes. The first
// draft of this experiment predicted sites - 1 and measured sites + 2, and the measurement was right.
//
// Before 2026-08-31 the suite's Ward check (renormalization/dirac-maxwell-propagators) was "the zero-mode
// count is positive". Here the identity is applied: a structured scalar (a sum of two lattice cosines, no
// random) is turned into its gradient link field and pushed through the operator, the residual is
// measured against the field's own size, and the zero-mode count is compared with the predicted integer
// at two lattice sizes. The control is a Proca mass, which breaks gauge invariance by construction: the
// same gradient field then returns m^2 times itself exactly, the identity fails by a known amount, and
// the zero-mode count drops to zero. A second control is a transverse (non-gradient) field, which the
// massless operator does NOT annihilate, so the identity is specific to gradients.
//
// Depth L2: known lattice gauge theory, measured exactly on a cubic lattice with no {3,4,3,4} in it.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  applyMaxwell,
  gradientLinkField,
  linkField,
  maxwellLatticeMatrix,
  maxwellLatticeSpectrum,
} from '@/code/operator/maxwell-lattice'
import { zeroModeCensus } from '@/code/measure/spectrum'

const SIDES = [4, 5]
const PROCA_MASS = 0.5
const EXACT = 1e-12

function maxAbs(values: Float64Array): number {
  let worst = 0

  for (const v of values) {
    worst = Math.max(worst, Math.abs(v))
  }

  return worst
}

// a structured, deterministic scalar with weight in two directions, so its gradient has no zero components
function scalar(side: number): (x: number, y: number, z: number) => number {
  return (x, y, z) =>
    Math.cos((2 * Math.PI * x) / side) +
    2 * Math.cos((2 * Math.PI * y) / side) +
    0.5 * Math.cos((2 * Math.PI * (x + z)) / side)
}

export default experiment({
  id: 'gauge/ward-identity-maxwell',
  code: 'E-FRC-0072',
  title:
    'the Ward identity of the lattice Maxwell operator measured exactly: a pure-gauge gradient field is annihilated to machine precision and the zero-mode count equals sites plus two (the gradients plus the three torus Wilson lines) at two lattice sizes, while a Proca mass returns the gradient times m squared and empties the zero-mode space, and a transverse field is not annihilated',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    let worstRelativeResidual = 0
    let zeroModesMatchEverySize = true
    let worstProcaError = 0
    let procaZeroModes = 0
    let transverseResponse = 0
    let worstConstantResidual = 0

    const zeroModeCounts: number[] = []

    for (const side of SIDES) {
      const sites = side * side * side
      const massless = maxwellLatticeMatrix({ side, mass: 0 })
      const gradient = gradientLinkField({ side, scalar: scalar(side) })
      const scale = maxAbs(gradient)

      // the identity: H (d chi) = 0
      const residual = applyMaxwell({ matrix: massless, field: gradient })

      worstRelativeResidual = Math.max(
        worstRelativeResidual,
        maxAbs(residual) / scale,
      )

      // the three constant link fields, closed but not exact, are zero modes too
      for (let direction = 0; direction < 3; direction++) {
        const constant = linkField({
          side,
          value: (_x, _y, _z, d) => (d === direction ? 1 : 0),
        })

        worstConstantResidual = Math.max(
          worstConstantResidual,
          maxAbs(applyMaxwell({ matrix: massless, field: constant })),
        )
      }

      // the count: exactly sites - 1 + 3 exact zero modes
      const census = zeroModeCensus(maxwellLatticeSpectrum({ side, mass: 0 }))

      zeroModeCounts.push(census.zero)

      if (census.zero !== sites + 2) {
        zeroModesMatchEverySize = false
      }

      // CONTROL 1: a Proca mass breaks the identity by exactly m^2 (d chi), and removes every zero mode
      const proca = maxwellLatticeMatrix({ side, mass: PROCA_MASS })
      const procaResidual = applyMaxwell({ matrix: proca, field: gradient })

      for (let i = 0; i < gradient.length; i++) {
        worstProcaError = Math.max(
          worstProcaError,
          Math.abs(
            procaResidual[i]! - PROCA_MASS * PROCA_MASS * gradient[i]!,
          ) / scale,
        )
      }

      procaZeroModes = Math.max(
        procaZeroModes,
        zeroModeCensus(maxwellLatticeSpectrum({ side, mass: PROCA_MASS })).zero,
      )

      // CONTROL 2: a transverse field (A_y varying along x) is physical, the massless operator does not kill it
      const transverse = linkField({
        side,
        value: (x, _y, _z, direction) =>
          direction === 1 ? Math.cos((2 * Math.PI * x) / side) : 0,
      })

      transverseResponse = Math.max(
        transverseResponse,
        maxAbs(applyMaxwell({ matrix: massless, field: transverse })) /
          maxAbs(transverse),
      )
    }

    const identityExact =
      worstRelativeResidual < EXACT && worstConstantResidual < EXACT
    const procaBreaksExactly = worstProcaError < EXACT && procaZeroModes === 0
    const transverseIsPhysical = transverseResponse > 0.1

    const ok =
      identityExact &&
      zeroModesMatchEverySize &&
      procaBreaksExactly &&
      transverseIsPhysical

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the lattice Maxwell operator annihilates the gradient of a structured scalar to machine precision at sides 4 and 5 and has exactly sites plus two zero modes (66 and 127, the sites minus one gradients plus the three constant link fields, which are closed but not exact on the three-torus and are annihilated to machine precision as well), the operator form of the Ward identity, while a Proca mass of 0.5 returns exactly m squared times the gradient and leaves no zero mode, and a transverse field is not annihilated, so longitudinal decoupling is measured, specific to gradients, and broken by exactly the mass term that breaks gauge invariance',
      metrics: {
        worstRelativeResidual: Number(worstRelativeResidual.toExponential(2)),
        zeroModesAtSide4: zeroModeCounts[0]!,
        zeroModesAtSide5: zeroModeCounts[1]!,
        predictedAtSide4: 4 * 4 * 4 + 2,
        predictedAtSide5: 5 * 5 * 5 + 2,
        worstConstantResidual: Number(worstConstantResidual.toExponential(2)),
        transverseResponse: Number(transverseResponse.toFixed(4)),
      },
      control: {
        procaWorstError: Number(worstProcaError.toExponential(2)),
        procaZeroModes,
      },
      notes:
        'Known lattice gauge theory (the exact gauge invariance of the compact-free curl-curl operator), measured on a cubic lattice with no {3,4,3,4} in it, so L2. It replaces the "zero modes exist" check that renormalization/dirac-maxwell-propagators used as its Ward identity, and that experiment now compares its zero-mode count with the same predicted integer.',
    })
  },
})
