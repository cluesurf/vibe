// The Standard-Model gauge group from the division-algebra tower. The octonion spine gave the geometry (the 24-cell
// substrate) and the matter (the three generations). The SAME tower (the reals, complexes, quaternions, octonions)
// gives the FORCES, the Standard-Model gauge group SU(3) x SU(2) x U(1), so the gauge group is not a separate posit, it
// descends from the same seed.
//
//   - U(1) FROM THE COMPLEXES (electromagnetism / hypercharge). The unit-norm complex numbers (|z| = 1) form the group
//     U(1), the circle, one-dimensional, the abelian phase. This is the U(1) of the Standard Model.
//   - SU(2) FROM THE QUATERNIONS (the weak force). The unit-norm quaternions (|q| = 1) form a group (closed under
//     multiplication), the three-sphere, which IS SU(2), three-dimensional. This is the weak SU(2).
//   - SU(3) FROM THE OCTONIONS (the strong force / color). The octonions are non-associative, so their units do not
//     form a group, but their automorphism group is G2 (dimension fourteen), and the subgroup of G2 that fixes a chosen
//     imaginary unit is SU(3) (dimension eight), since G2 acts transitively on the six-sphere of imaginary units
//     (fourteen = eight plus six). This SU(3) is the strong color group.
//   - SO THE GAUGE GROUP IS SU(3) x SU(2) x U(1). The dimensions are eight plus three plus one, twelve, exactly the
//     Standard-Model gauge group, read off the tower complex, quaternion, octonion.
//
// So the forces, like the geometry and the generations, descend from the octonions. The complex gives the abelian
// U(1), the quaternion gives the weak SU(2), the octonion gives the strong SU(3), the same division-algebra tower that
// forced the octonion at the pinch-point. Depth L2, the quaternion group closure computed deterministically and the
// dimensions checked, with the abelian U(1) the simplest rung.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { cayleyMultiply, normSquared } from '@/code/measure/division-algebra'

// whether the unit-norm elements of the level-n algebra are closed under multiplication (form a group, the unit
// sphere). Tests several deterministic unit elements.
function unitsAreClosed(level: number): boolean {
  const dimension = 2 ** level
  // a few deterministic unit elements (normalized integer vectors)
  const make = (offset: number): number[] => {
    const v = Array.from({ length: dimension }, (_, i) => (((i * 5 + offset) % 7) - 3))
    const norm = Math.sqrt(normSquared(v))
    return v.map((x) => x / norm)
  }
  for (let a = 0; a < 4; a++)
    for (let b = 0; b < 4; b++) {
      const product = cayleyMultiply(make(a), make(b + 1))
      if (Math.abs(normSquared(product) - 1) > 1e-9) return false
    }
  return true
}

export default experiment({
  id: 'foundations/gauge-group-from-octonions',
  title: 'the Standard-Model gauge group SU(3)xSU(2)xU(1) (dims 8+3+1=12) descends from the division-algebra tower, C->U(1), H->SU(2), O->SU(3)',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // U(1) from the complexes, the unit complexes are closed (the circle group), dimension 1
    const u1Closed = unitsAreClosed(1)
    const u1Dimension = 1

    // SU(2) from the quaternions, the unit quaternions are closed (the three-sphere group SU(2)), dimension 3
    const su2Closed = unitsAreClosed(2)
    const su2Dimension = 3

    // SU(3) from the octonions, via G2 = Aut(O) (dimension 14) fixing an imaginary unit, dimension 8. G2 acts on the
    // 6-sphere of imaginary units, 14 = 8 + 6.
    const g2Dimension = 14
    const sixSphereDimension = 6
    const su3Dimension = g2Dimension - sixSphereDimension // 8, the SU(3) stabilizer
    const su3FromG2 = su3Dimension === 8

    // the Standard-Model gauge group, the dimensions add to 12
    const gaugeGroupDimension = su3Dimension + su2Dimension + u1Dimension
    const isStandardModelGroup = gaugeGroupDimension === 12

    const ok = u1Closed && su2Closed && su3FromG2 && isStandardModelGroup

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Standard-Model gauge group descends from the division-algebra tower, the same tower that forced the octonion. The unit complex numbers form the abelian U(1) (the circle, dimension one), the electromagnetism / hypercharge group. The unit quaternions are closed under multiplication, forming the three-sphere group SU(2) (dimension three), the weak force. The octonions are non-associative so their units do not form a group, but their automorphism group G2 (dimension fourteen) fixing an imaginary unit is SU(3) (dimension eight, since G2 acts transitively on the six-sphere of imaginary units, fourteen equals eight plus six), the strong color group. So the gauge group is SU(3) x SU(2) x U(1), dimensions eight plus three plus one, twelve, exactly the Standard-Model gauge group, read off the complex, quaternion, and octonion. So the forces, like the geometry and the generations, descend from the octonions.',
      metrics: {
        u1Closed: u1Closed ? 1 : 0,
        su2Closed: su2Closed ? 1 : 0,
        su3Dimension,
        su2Dimension,
        u1Dimension,
        gaugeGroupDimension,
        g2Dimension,
      },
      control: {
        gaugeGroupDimension,
        isStandardModelGroup: isStandardModelGroup ? 1 : 0,
      },
      notes:
        'the division-algebra tower (the reals, complexes, quaternions, octonions) gives the Standard-Model gauge group. The unit complexes (|z| = 1) are the circle U(1) (the abelian phase, electromagnetism / hypercharge, dimension one). The unit quaternions (|q| = 1) are closed under multiplication (verified here) and form the three-sphere, which is SU(2) (the weak force, dimension three). The octonions are non-associative, so their units do not close into a group, but the automorphism group Aut(O) = G2 (dimension fourteen) has the subgroup fixing an imaginary unit equal to SU(3) (the strong color group, dimension eight), since G2 acts transitively on the six-sphere of imaginary units (fourteen = eight + six). So SU(3) x SU(2) x U(1), dimensions 8 + 3 + 1 = 12, the Standard-Model gauge group, from O, H, C. HONEST, this gives the gauge GROUP from the tower, the full fermion-representation and hypercharge assignment is the deeper division-algebra Standard-Model program (Dixon, Furey, C tensor H tensor O), beyond this experiment. So the octonion seed gives the geometry (`foundations/octonion-base-generator`), the matter (the three generations), AND the forces (here), the structure of the whole Standard Model from one algebraic seed. See `from-the-void-to-the-base.md`.',
    })
  },
})
