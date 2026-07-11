// Conformance for code/operator/lattice-green-kspace: the infinite-volume cubic-lattice
// Green's function difference G(r) - G(r0) along the x-axis, evaluated by a Brillouin-zone
// grid sum. The function never returns G itself, only the regularised difference, so the
// re-derivable facts are the algebraic identities the difference must obey EXACTLY (up to the
// grid being identical), plus the physical sign:
//   - G(r) - G(r) = 0 exactly (the cosine difference vanishes mode by mode).
//   - Antisymmetry: diff(a, b) = -diff(b, a) exactly (swapping negates the integrand).
//   - Additivity / path independence: diff(a, c) = diff(a, b) + diff(b, c) (the same G cancels),
//     which forces the result to be a genuine difference of a single potential function.
//   - The potential decreases with distance (continuum limit 1/(4 pi r)), so diff(r>r0) < 0.

import { suite, check, ok, close } from '@/test/code/harness'
import { latticeGreenDifferenceX } from '@/code/operator/lattice-green-kspace'

const M = 20

suite('operator/lattice-green-kspace: difference identities', [
  check('G(r) - G(r) is exactly zero', () => {
    for (const r of [1, 2, 4]) {
      close(
        latticeGreenDifferenceX({ r, r0: r, gridPoints: M }),
        0,
        0,
        `diff(${r},${r})`,
      )
    }
  }),
  check('antisymmetry: diff(a,b) = -diff(b,a)', () => {
    const ab = latticeGreenDifferenceX({ r: 4, r0: 1, gridPoints: M })
    const ba = latticeGreenDifferenceX({ r: 1, r0: 4, gridPoints: M })

    close(ab + ba, 0, 1e-13, 'antisymmetry')
  }),
  check('additivity: diff(4,1) = diff(4,2) + diff(2,1)', () => {
    const total = latticeGreenDifferenceX({
      r: 4,
      r0: 1,
      gridPoints: M,
    })

    const part1 = latticeGreenDifferenceX({
      r: 4,
      r0: 2,
      gridPoints: M,
    })

    const part2 = latticeGreenDifferenceX({
      r: 2,
      r0: 1,
      gridPoints: M,
    })

    close(total, part1 + part2, 1e-12, 'path independence')
  }),
  check(
    'the potential decays: diff(larger, smaller) is negative',
    () => {
      ok(
        latticeGreenDifferenceX({ r: 2, r0: 1, gridPoints: M }) < 0,
        'G(2) < G(1)',
      )

      ok(
        latticeGreenDifferenceX({ r: 4, r0: 2, gridPoints: M }) < 0,
        'G(4) < G(2)',
      )
    },
  ),
])
