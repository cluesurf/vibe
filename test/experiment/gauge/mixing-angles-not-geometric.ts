// The generation mixing angles are not geometric. The octonions plus the substrate arrow fix the
// number of fermion families at three, each a quaternionic subalgebra through the preferred unit,
// cyclically related by an order-three family symmetry (E-FRC-0069). A natural next hope is that the
// Cabibbo-Kobayashi-Maskawa mixing angles, which rotate the mass eigenbasis of one generation into
// another, come out of the geometry between those three subalgebras. They do not.
//
// Each generation subalgebra is the real line together with a Fano-line triple of imaginary units,
// four orthonormal coordinate axes. Two generation subalgebras share exactly two axes (the real line
// and the preferred unit) and are orthogonal in the other two. So the principal angles between any
// two generations are 0, 0, 90, 90: two directions perfectly aligned, two perfectly orthogonal, and
// nothing in between. There is no small mixing angle. The Cabibbo angle is 13.02 degrees, and the
// other CKM angles are smaller still, none of them anywhere near 0 or 90, so the mixing matrix is a
// free input, exactly like the absolute masses (E-FRC-0067) and the Koide phase (E-FRC-0066).
//
// The control is the family symmetry itself, which IS geometric: the three subalgebras are permuted
// by an order-three octonion automorphism, a 120-degree rotation in the family space (E-FRC-0069).
// So the geometry fixes the family symmetry (a definite rotation of order three) but not the mixing
// angles (which come out degenerate at 0 and 90), the same split as the Koide result where the
// amplitude is geometric and the phase is free.
//
// Depth L1. It computes the principal angles between the generation subalgebras and shows they are
// degenerate (0 and 90), so no CKM-sized mixing angle is geometric, while the order-three family
// rotation is. A negative surfaced for the paper. Companion to E-FRC-0066 and E-FRC-0067.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  subalgebrasThroughUnit,
  subalgebraPrincipalAngles,
  familyPermutation,
} from '@/code/measure/quaternionic-generations'

const PREFERRED_UNIT = 7
const CABIBBO_DEGREES = 13.02

export default experiment({
  id: 'gauge/mixing-angles-not-geometric',
  code: 'E-FRC-0070',
  title:
    'the generation mixing angles are degenerate at 0 and 90 degrees (no geometric Cabibbo angle) while the order-three family symmetry IS geometric, the CKM matrix a free input',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const generations = subalgebrasThroughUnit(PREFERRED_UNIT)

    // the principal angles between every pair of generations
    const allAngles: number[] = []

    for (let i = 0; i < generations.length; i++) {
      for (let j = i + 1; j < generations.length; j++) {
        allAngles.push(
          ...subalgebraPrincipalAngles(
            generations[i]!,
            generations[j]!,
          ),
        )
      }
    }

    // every angle is degenerate (0 or 90), none intermediate
    const allDegenerate = allAngles.every(
      angle => angle === 0 || angle === 90,
    )

    // the closest any principal angle comes to the Cabibbo angle
    const closestToCabibbo = Math.min(
      ...allAngles.map(angle => Math.abs(angle - CABIBBO_DEGREES)),
    )

    const noCabibbo = closestToCabibbo > 10

    // CONTROL: the family symmetry is geometric, an order-three automorphism (a 120-degree rotation)
    const familyRotation = familyPermutation(PREFERRED_UNIT)
    const familySymmetryGeometric = familyRotation !== null

    const ok = allDegenerate && noCabibbo && familySymmetryGeometric

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the principal angles between the three generation subalgebras are degenerate at 0 and 90 degrees (each pair shares the real line and the preferred unit, and is orthogonal in the other two directions), so no intermediate mixing angle exists in the geometry and the closest approach to the Cabibbo angle of 13.02 degrees is more than ten degrees away, so the CKM mixing matrix is a free input like the absolute masses, while the order-three family symmetry that permutes the generations IS geometric (a 120-degree octonion automorphism), the same split as the Koide result where the amplitude is geometric and the phase is free',
      metrics: {
        distinctAngleValues: new Set(allAngles).size,
        intermediateAngleCount: allAngles.filter(
          angle => angle !== 0 && angle !== 90,
        ).length,
        closestToCabibboDegrees: Number(closestToCabibbo.toFixed(2)),
        familySymmetryGeometric: familySymmetryGeometric ? 1 : 0,
      },
      // CONTROL: the family symmetry is geometric (an order-three automorphism exists).
      control: {
        familySymmetryGeometric: familySymmetryGeometric ? 1 : 0,
      },
      notes:
        'CKM mixing is a free input, surfaced negative. The geometry fixes the family count and the order-three family symmetry (E-FRC-0069) but not the mixing angles. Companion to Koide phase (E-FRC-0066) and absolute Yukawas (E-FRC-0067).',
    })
  },
})
