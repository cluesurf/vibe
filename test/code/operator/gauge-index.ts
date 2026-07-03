// Conformance for code/operator/gauge-index: the overlap fermion in a 2D U(1)
// gauge background and the lattice index theorem. The re-derivable facts:
//   - the total gauge flux is exactly 2 pi Q (flux quantization).
//   - the Wilson-Dirac kernel H_W = gamma5 (D_W - m0) is Hermitian (self-check).
//   - the overlap index is an INTEGER and equals +/- Q (Atiyah-Singer on the
//     lattice): the chiral fermion sees the gauge topology as an integer.
// We check flux against 2 pi Q for several (L, Q), and the index against |Q| for
// Q in {0, 1, -1} on a 5x5 torus.

import { suite, check, equal, ok, close } from '@/test/code/harness'
import {
  totalFlux,
  gaugeWilsonDirac,
  overlapIndex,
} from '@/code/operator/gauge-index'

suite('operator/gauge-index: flux quantization', [
  check('total flux equals 2 pi Q exactly', () => {
    for (const length of [4, 5, 6]) {
      for (const charge of [0, 1, 2, -1, -2]) {
        close(
          totalFlux({ length, charge }),
          2 * Math.PI * charge,
          1e-9,
          `flux on ${length}x${length} torus, Q=${charge}`,
        )
      }
    }
  }),
  check(
    'the gauge Wilson-Dirac operator has the expected dimension 2 L^2',
    () => {
      const d = gaugeWilsonDirac({ length: 5, charge: 1 })
      equal(d.rows, 2 * 25, 'rows')
      equal(d.cols, 2 * 25, 'cols')
    },
  ),
])

suite('operator/gauge-index: lattice index theorem', [
  check('the Wilson-Dirac kernel H_W is Hermitian (self-check)', () => {
    for (const charge of [0, 1, -1]) {
      const result = overlapIndex({ length: 5, charge })
      close(
        result.hermiticityError,
        0,
        1e-10,
        `H_W Hermiticity for Q=${charge}`,
      )
    }
  }),
  check('the overlap index is an integer', () => {
    for (const charge of [0, 1, -1]) {
      const { index } = overlapIndex({ length: 5, charge })
      equal(index, Math.round(index), `index integer for Q=${charge}`)
    }
  }),
  check(
    'the overlap index magnitude equals |Q| (Atiyah-Singer on the lattice)',
    () => {
      equal(
        overlapIndex({ length: 5, charge: 0 }).index,
        0,
        'Q=0 -> index 0',
      )
      equal(
        Math.abs(overlapIndex({ length: 5, charge: 1 }).index),
        1,
        '|index| = 1 for Q=1',
      )
      equal(
        Math.abs(overlapIndex({ length: 5, charge: -1 }).index),
        1,
        '|index| = 1 for Q=-1',
      )
    },
  ),
  check(
    'the index sign tracks the charge sign (Q=1 and Q=-1 give opposite indices)',
    () => {
      const plus = overlapIndex({ length: 5, charge: 1 }).index
      const minus = overlapIndex({ length: 5, charge: -1 }).index
      ok(
        plus === -minus,
        `index(+1) = ${plus} must be -index(-1) = ${-minus}`,
      )
    },
  ),
])
