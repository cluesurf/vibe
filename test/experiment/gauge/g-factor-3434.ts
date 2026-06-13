// PH6 (the g-factor, now DERIVED not assumed): the old magnetism test (gauge/ph-magnetism-3434)
// inputs g = 2 by hand and integrates the Larmor equation, an L0 circular demonstration. This
// MEASURES the spinor g-factor from the substrate's Dirac structure instead. We build the
// 2-component Dirac operator sigma_x pi_x + sigma_y pi_y + sigma_z m in a uniform magnetic field,
// with the kinetic momenta carrying the magnetic algebra [pi_x, pi_y] = i q B exactly (the ladder
// basis, code/operator/landau), and diagonalize it. The relativistic Landau spectrum that comes
// out, E = +/- sqrt(m^2 + 2 q B n), has a ZERO MODE at E^2 = m^2 that a spinless (scalar) particle
// in the same field does NOT have (its lowest level sits at m^2 + qB). That gap difference is the
// spin magnetic moment, and it reads back g = 2.
//
// g is NOT input anywhere. It emerges from the Clifford algebra {gamma, gamma} = 2 eta that the
// 24-direction coin carries (clifford.ts), through the squared operator (pi^2 + m^2) - qB sigma_z.
// The scalar particle is the discriminating control: no spin term, no zero mode, no moment.
//
// g measured = 2 (scalar lowest E^2 - Dirac lowest E^2) / (qB). Robust across field strength and
// mass, and the full Landau ladder matches the relativistic sqrt(m^2 + 2qBn) form.

import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { diracLandauHamiltonian, scalarLandauSquared } from '@/code/operator/landau'
import { distinctLevels } from '@/code/measure/spectrum'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// measure g from one (field, mass) setting by diagonalizing the Dirac and scalar operators
function measureG(input: { levels: number; fieldStrength: number; mass: number }): {
  g: number
  diracLowestSquared: number
  scalarLowestSquared: number
  ladderResidual: number
} {
  const { levels, fieldStrength, mass } = input
  const dirac = eigHermitian({ matrix: diracLandauHamiltonian(input) })
  const diracLevels = distinctLevels(Array.from(dirac.values).map((x) => x * x))
  const scalar = eigSymmetric({ matrix: scalarLandauSquared(input) })
  const scalarLevels = distinctLevels(Array.from(scalar.values))

  const diracLowest = diracLevels[0]!
  const scalarLowest = scalarLevels[0]!
  const g = (2 * (scalarLowest - diracLowest)) / fieldStrength

  // how well the low Dirac ladder matches the relativistic E^2 = m^2 + 2 q B n
  let ladderResidual = 0
  for (let n = 0; n < 4; n++) {
    const predicted = mass * mass + 2 * fieldStrength * n
    ladderResidual = Math.max(ladderResidual, Math.abs(diracLevels[n]! - predicted))
  }
  return { g, diracLowestSquared: diracLowest, scalarLowestSquared: scalarLowest, ladderResidual }
}

export function gFactor(): {
  gAtFieldA: number
  gAtFieldB: number
  gAtHeavierMass: number
  diracHasZeroMode: boolean
  scalarHasNoZeroMode: boolean
  ladderRelativistic: boolean
} {
  const levels = 28
  // two field strengths and a heavier mass: g must be the same (field- and mass-independent)
  const a = measureG({ levels, fieldStrength: 0.2, mass: 0.5 })
  const b = measureG({ levels, fieldStrength: 0.35, mass: 0.5 })
  const heavy = measureG({ levels, fieldStrength: 0.2, mass: 1.3 })

  // the Dirac zero mode sits at E^2 = m^2 (within rounding), the scalar's lowest is m^2 + qB
  const massSquaredA = 0.5 * 0.5
  const diracHasZeroMode = Math.abs(a.diracLowestSquared - massSquaredA) < 1e-3
  const scalarHasNoZeroMode = Math.abs(a.scalarLowestSquared - (massSquaredA + 0.2)) < 1e-3
  const ladderRelativistic = a.ladderResidual < 1e-3 && b.ladderResidual < 1e-3

  return {
    gAtFieldA: a.g,
    gAtFieldB: b.g,
    gAtHeavierMass: heavy.g,
    diracHasZeroMode,
    scalarHasNoZeroMode,
    ladderRelativistic,
  }
}

export default defineExperiment({
  id: 'gauge/g-factor-3434',
  title: 'the spinor g-factor is measured as 2 from the Dirac Landau spectrum, not assumed',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = gFactor()
    const gMeasured = (r.gAtFieldA + r.gAtFieldB + r.gAtHeavierMass) / 3
    const gIsTwo =
      Math.abs(r.gAtFieldA - 2) < 0.05 &&
      Math.abs(r.gAtFieldB - 2) < 0.05 &&
      Math.abs(r.gAtHeavierMass - 2) < 0.05
    const ok = gIsTwo && r.diracHasZeroMode && r.scalarHasNoZeroMode && r.ladderRelativistic
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'diagonalizing the 2-component Dirac operator in a uniform magnetic field gives the relativistic Landau spectrum with a zero mode the spinless scalar lacks, and that spin gap reads back a gyromagnetic ratio g = 2, the same at two field strengths and two masses, with g nowhere put in by hand',
      metrics: {
        gMeasured,
        gAtFieldA: r.gAtFieldA,
        gAtFieldB: r.gAtFieldB,
        gAtHeavierMass: r.gAtHeavierMass,
        diracHasZeroMode: r.diracHasZeroMode ? 1 : 0,
        ladderRelativistic: r.ladderRelativistic ? 1 : 0,
      },
      control: {
        // the spinless scalar in the SAME field has no spin term: its lowest Landau level is
        // m^2 + qB, not the Dirac zero mode at m^2. No spinor, no magnetic moment.
        scalarHasNoZeroMode: r.scalarHasNoZeroMode ? 1 : 0,
      },
      notes:
        'L2, known physics (the Dirac g = 2) realized on the substrate spinor. g is DERIVED, not assumed: it is read out of the diagonalized Dirac Landau spectrum, whose zero mode at E^2 = m^2 is the magnetic moment the scalar control lacks. The g = 2 comes from the Clifford algebra the 24-direction coin carries, through the squared operator (pi^2 + m^2) - qB sigma_z. This replaces the old gauge/ph-magnetism-3434 PH6 part, which set g = 2 by hand and integrated Larmor (L0 circular). The ladder basis (code/operator/landau) gives [pi_x, pi_y] = i q B exactly with no fermion doublers. Robust across two fields and two masses.',
    })
  },
})
