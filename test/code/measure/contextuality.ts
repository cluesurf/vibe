// Conformance for code/measure/contextuality: the Peres-Mermin magic square. The textbook
// result (state-independent contextuality) is that the quantum value of the six-context
// combination is 6 while any noncontextual value assignment is bounded by 4. Both numbers are
// COMPUTED by the module (6 from the operator products, 4 by brute force over 2^9 assignments),
// so the test pins the known answers and the structural facts that force them.

import { suite, check, equal, ok } from '@/test/code/harness'
import { peresMerminSquare } from '@/code/measure/contextuality'

suite('measure/contextuality: Peres-Mermin magic square', [
  check('every observable is an involution (squares to +I)', () => {
    ok(peresMerminSquare().allInvolutions, 'each grid operator must square to the identity')
  }),
  check('observables within every row and every column commute', () => {
    const s = peresMerminSquare()
    ok(s.rowsCommute, 'rows must be jointly measurable')
    ok(s.colsCommute, 'columns must be jointly measurable')
  }),
  check('rows multiply to +I, columns to +I except the third which gives -I', () => {
    const s = peresMerminSquare()
    equal(s.rowSigns[0], 1)
    equal(s.rowSigns[1], 1)
    equal(s.rowSigns[2], 1)
    equal(s.colSigns[0], 1)
    equal(s.colSigns[1], 1)
    equal(s.colSigns[2], -1) // the single -I is the obstruction
  }),
  check('quantum value is 6, the noncontextual bound is 4', () => {
    const s = peresMerminSquare()
    // QM: rowSigns sum (1+1+1) + col0 + col1 - col2 = 3 + 1 + 1 - (-1) = 6.
    equal(s.quantumValue, 6)
    // brute force over all 512 sign assignments cannot beat 4.
    equal(s.noncontextualBound, 4)
    ok(s.quantumValue > s.noncontextualBound, 'contextuality: 6 exceeds the classical 4')
  }),
])
