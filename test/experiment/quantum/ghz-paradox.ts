// The GHZ all-versus-nothing paradox on the emergent layer. Bell tests rule out local hidden
// variables statistically, but the Greenberger-Horne-Zeilinger argument does it with certainty:
// on the GHZ state the four Pauli products XXX, XYY, YXY, YYX have definite values plus one,
// minus one, minus one, minus one, yet any local assignment of fixed values to each party's X and
// Y forces the product of the four observables to plus one (every local variable appears exactly
// twice), while the quantum values multiply to minus one. A single run, not a statistical
// inequality, separates the emergent quantum layer from every local-hidden-variable account.
//
// Measured exactly: the four expectations on the GHZ state come out plus one and three times
// minus one to machine precision, and an exhaustive enumeration of all sixty-four local
// assignments finds not one satisfying the four constraints, the all-versus-nothing gap.
//
// The control is the product state |000>: all four expectations vanish (no correlations at all),
// and a local assignment trivially exists for its statistics, so the paradox is specifically the
// payoff of the GHZ entanglement, not of the observable set.
//
// Depth L1. It confirms the exact GHZ argument (definite quantum values, exhaustively no local
// assignment) at the emergent layer, completing the nonlocality suite: statistical (CHSH,
// E-QTM-0011), structural (no-signaling E-QTM-0057, monogamy E-QTM-0058), and now
// all-versus-nothing.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  ghzState,
  pauliExpectation3,
} from '@/code/measure/bell-structure'

const OBSERVABLES: readonly (readonly ('x' | 'y')[])[] = [
  ['x', 'x', 'x'],
  ['x', 'y', 'y'],
  ['y', 'x', 'y'],
  ['y', 'y', 'x'],
]

export default experiment({
  id: 'quantum/ghz-paradox',
  code: 'E-QTM-0061',
  title:
    'the GHZ state gives XXX = +1 and XYY = YXY = YYX = -1 exactly while no local assignment of all sixty-four satisfies the four constraints, nonlocality with certainty (all-versus-nothing), absent on a product state',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const ghz = ghzState()
    const values = OBSERVABLES.map(paulis =>
      pauliExpectation3({ state: ghz, paulis }),
    )

    const quantumDefinite =
      Math.abs(values[0]! - 1) < 1e-12 &&
      values.slice(1).every(value => Math.abs(value + 1) < 1e-12)

    // exhaustive: no local assignment of plus or minus one to each party's X and Y works
    let localAssignmentExists = false

    for (let bits = 0; bits < 64; bits++) {
      const sign = (index: number): number =>
        ((bits >> index) & 1) === 1 ? 1 : -1

      const x = [sign(0), sign(1), sign(2)]
      const y = [sign(3), sign(4), sign(5)]

      const xxxProduct = x[0]! * x[1]! * x[2]!
      const xyyProduct = x[0]! * y[1]! * y[2]!
      const yxyProduct = y[0]! * x[1]! * y[2]!
      const yyxProduct = y[0]! * y[1]! * x[2]!

      if (
        xxxProduct === 1 &&
        xyyProduct === -1 &&
        yxyProduct === -1 &&
        yyxProduct === -1
      ) {
        localAssignmentExists = true
      }
    }

    // CONTROL: the product state has no correlations, all four expectations vanish
    const product = [1, 0, 0, 0, 0, 0, 0, 0]
    const productValues = OBSERVABLES.map(paulis =>
      pauliExpectation3({ state: product, paulis }),
    )

    const productUncorrelated = productValues.every(
      value => Math.abs(value) < 1e-12,
    )

    const ok =
      quantumDefinite && !localAssignmentExists && productUncorrelated

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the GHZ state the four Pauli products take the definite values XXX = +1 and XYY = YXY = YYX = -1 to machine precision, whose product is -1, while every one of the sixty-four local assignments of fixed values to each party X and Y forces the product to +1 (each local variable appears exactly twice) so exhaustively not one satisfies the four constraints, the all-versus-nothing refutation of local hidden variables by certainty rather than statistics, and on the product state all four expectations vanish so the paradox is the payoff of the GHZ entanglement',
      metrics: {
        xxx: Number(values[0]!.toFixed(6)),
        xyy: Number(values[1]!.toFixed(6)),
        yxy: Number(values[2]!.toFixed(6)),
        yyx: Number(values[3]!.toFixed(6)),
        localAssignments: localAssignmentExists ? 1 : 0,
      },
      // CONTROL: the product state carries no correlations, no paradox without entanglement.
      control: {
        productWorstExpectation: Number(
          Math.max(...productValues.map(Math.abs)).toExponential(2),
        ),
      },
      notes:
        'GHZ all-versus-nothing (Greenberger-Horne-Zeilinger, Mermin). Completes the nonlocality suite: CHSH statistics (E-QTM-0011), Tsirelson structure (E-QTM-0038), no-signaling (E-QTM-0057), monogamy (E-QTM-0058), and certainty (this).',
    })
  },
})
