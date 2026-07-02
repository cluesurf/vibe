// Conformance for code/measure/hydrodynamics. We check the two independently-derivable kinematic
// helpers: coordAlong (the mixed-radix coordinate of a cell along one of the four d4 axes) and
// cellMomentum (the sum over slots of tone times the slot direction's component). The full
// shear/charge-wave evolution is dynamics orchestration over the lattice-gas beat and is covered by
// the rule-level tests, so it is not re-run here.

import { suite, check, equal } from '@/test/code/harness'
import { Will } from '@/code/tone/will'
import { Mesh } from '@/code/tool/mesh'
import { coordAlong, cellMomentum } from '@/code/measure/hydrodynamics'

suite('measure/hydrodynamics: coordAlong', [
  check('mixed-radix coordinate along each axis (side 3)', () => {
    // cell = 1 + 2*3 + 1*9 = 16 -> coordinates (1, 2, 1, 0) for side 3.
    equal(coordAlong(16, 0, 3), 1)
    equal(coordAlong(16, 1, 3), 2)
    equal(coordAlong(16, 2, 3), 1)
    equal(coordAlong(16, 3, 3), 0)
  }),
])

suite('measure/hydrodynamics: cellMomentum', [
  check('net momentum is sum of tone * direction component', () => {
    // degree-4 coin with directions +x,-x,+y,-y. One cell, slots: +x carries +1, -y carries +1.
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]

    const will = {
      mesh: { degree: 4, cellCount: 1 } as unknown as Mesh,
      data: Int8Array.from([1, 0, 0, 1]),
    } as Will

    // x-momentum: (+1)*(+1) + ... = 1. y-momentum: (+1 in -y slot)*(-1) = -1.
    equal(cellMomentum(will, 0, directions, 0), 1)
    equal(cellMomentum(will, 0, directions, 1), -1)
  }),
])
