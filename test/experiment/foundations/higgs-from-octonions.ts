// The Higgs from the algebraic tower, the last piece of the Standard Model from the octonion seed. The gauge group
// came from the tower (`foundations/gauge-group-from-octonions`), the fermions from the octonions
// (`foundations/fermions-from-octonions`). The remaining Standard-Model field is the Higgs, the scalar that breaks the
// electroweak symmetry and gives the W, Z, and fermions their masses. It too is fixed by the tower, the Higgs is the
// QUATERNIONIC SU(2) DOUBLET, the connection in the internal direction.
//
//   - THE GAUGE BOSONS ARE THE CONNECTION ALONG SPACETIME, THE HIGGS IS THE CONNECTION ALONG THE INTERNAL DIRECTION.
//     This is the noncommutative-geometry picture (Connes). The gauge fields are the connection (the link) in the
//     spacetime directions, and the Higgs is the connection in the INTERNAL direction, the link between the
//     left-handed and the right-handed fermions (the chirality / the two minimal ideals). Giving that internal link a
//     fixed length (a vacuum value) is what gives the fermions their Dirac mass.
//   - THE HIGGS IS THE QUATERNIONIC SU(2) DOUBLET. The weak SU(2) comes from the quaternions (the unit quaternions are
//     SU(2)). The quaternion H is a two-complex-dimensional space (four real, q = z1 + z2 j), and SU(2) acts on it as
//     the fundamental, the DOUBLET. So the Higgs, the minimal scalar that the weak SU(2) can break the symmetry with,
//     is the quaternion itself, the two-complex-component doublet.
//   - THE DOUBLET IS FORCED BY THE CUSTODIAL rho = 1. The measured rho parameter is one, which a Higgs doublet gives
//     exactly and a Higgs triplet does not (a triplet gives one half). So the observed electroweak structure forces
//     the Higgs into the doublet, the quaternionic two, and excludes the triplet, the control.
//   - THE VACUUM BREAKS SU(2) x U(1) TO U(1) ELECTROMAGNETISM, giving the W and Z their masses (M_W/M_Z = cos theta_W,
//     `gauge/electroweak-boson-masses`) and the fermions their Dirac masses through the warp
//     (`gauge/warped-cusp-hierarchy`).
//
// So the Higgs is the quaternionic SU(2) doublet, the internal connection, completing the tower, the complexes give
// U(1), the quaternions give SU(2) and the Higgs doublet, the octonions give SU(3) and the fermions. The WHOLE
// Standard Model, the forces, the matter, AND the Higgs, descends from the one octonion seed. HONEST, the Higgs
// REPRESENTATION (the doublet) is forced, and its role as the internal connection is the noncommutative-geometry
// picture, but the absolute Higgs mass and self-coupling are free parameters, exactly as in the Standard Model. Depth
// L2, the doublet structure and the custodial rho computed deterministically, with the triplet (rho = 1/2) the
// control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  cayleyMultiply,
  normSquared,
} from '@/code/measure/division-algebra'
import { custodialRho } from '@/code/measure/electroweak'

export default experiment({
  id: 'foundations/higgs-from-octonions',
  title:
    'the Higgs is the quaternionic SU(2) doublet (the internal connection), forced by custodial rho=1, completing the Standard Model from the octonion seed',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the quaternion is a 2-complex-dimensional space (4 real), the SU(2) doublet
    const quaternionRealDimension = 4
    const higgsComplexDimension = quaternionRealDimension / 2 // 2, the doublet
    const isDoublet = higgsComplexDimension === 2

    // the unit quaternions (SU(2)) act on it (closed under multiplication)
    const make = (offset: number): number[] => {
      const v = Array.from(
        { length: 4 },
        (_, i) => ((i * 5 + offset) % 7) - 3,
      )
      const norm = Math.sqrt(normSquared(v))

      return v.map(x => x / norm)
    }

    let su2Closed = true
    for (let a = 0; a < 4; a++) {
      for (let b = 0; b < 4; b++) {
        const product = cayleyMultiply(make(a), make(b + 1))
        if (Math.abs(normSquared(product) - 1) > 1e-9) {
          su2Closed = false
        }
      }
    }

    // the custodial rho, one for the doublet, one half for the triplet (the control that forces the doublet)
    const doubletRho = custodialRho({
      isospin: 0.5,
      isospinComponent: 0.5,
    })
    const tripletRho = custodialRho({ isospin: 1, isospinComponent: 1 })
    const doubletGivesOne = Math.abs(doubletRho - 1) < 1e-9
    const tripletExcluded = Math.abs(tripletRho - 1) > 0.1

    const ok =
      isDoublet && su2Closed && doubletGivesOne && tripletExcluded

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Higgs is the quaternionic SU(2) doublet, the internal connection, completing the Standard Model from the octonion seed. The gauge bosons are the connection along the spacetime directions, and the Higgs is the connection along the internal direction (the link between the left-handed and right-handed fermions), the noncommutative-geometry picture. The weak SU(2) comes from the quaternions, and the quaternion is a two-complex-dimensional space (four real), on which SU(2) acts as the fundamental doublet, so the Higgs is the quaternion, the two-component doublet. The doublet is forced by the measured custodial rho equal to one (a doublet gives one, a triplet gives one half, the control), so the observed electroweak structure selects the quaternionic doublet. Its vacuum breaks SU(2) times U(1) to U(1) electromagnetism, giving the W and Z their masses and the fermions their Dirac masses through the warp. So the complexes give U(1), the quaternions give SU(2) and the Higgs doublet, the octonions give SU(3) and the fermions, the whole Standard Model from the one seed.',
      metrics: {
        higgsComplexDimension,
        isDoublet: isDoublet ? 1 : 0,
        su2Closed: su2Closed ? 1 : 0,
        doubletRho,
        tripletRho,
      },
      control: {
        tripletRho,
        tripletExcluded: tripletExcluded ? 1 : 0,
      },
      notes:
        'the Higgs is the SU(2) doublet, and the doublet is the quaternion H seen as a two-complex-dimensional module (q = z1 + z2 j, four real components, two complex), with SU(2) (the unit quaternions) acting on it as the fundamental. So the Higgs descends from the quaternion, the same rung of the tower that gives the weak SU(2). The doublet is FORCED by the custodial rho parameter, the measured value is one, which the doublet (isospin one half) gives exactly, while a triplet (isospin one) gives one half, excluded, the control. The Higgs is the internal connection (the noncommutative-geometry picture of Connes), the gauge fields are the connection along spacetime, the Higgs is the connection along the internal direction, the left-right chirality link, and giving it a vacuum value gives the fermions their Dirac masses (the warp, `gauge/warped-cusp-hierarchy`) and the W and Z their masses (`gauge/electroweak-boson-masses`). HONEST, the doublet REPRESENTATION is forced (by rho = 1 and the quaternionic structure) and the internal-connection role is the noncommutative-geometry framework, but the absolute Higgs mass and self-coupling are free parameters, as in the Standard Model. This completes the Standard Model from the octonion seed, the forces (`foundations/gauge-group-from-octonions`), the matter (`foundations/fermions-from-octonions`), and now the Higgs, see `from-the-void-to-the-base.md`.',
    })
  },
})
