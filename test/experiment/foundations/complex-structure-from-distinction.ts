// Where i comes from: the complex structure of the emergent quantum, built from the base
// distinction and the beat alone, with no imaginary unit and no complex phase put into the
// substrate. This closes the deepest gap in the quantum surface, why the emergent layer is
// complex rather than assumed, and grounds the self-reference lineage (Kauffman, the calculus
// of distinction, and Ord) that almost no physics survey includes.
//
// Kauffman's iterant construction. A time-alternating tone value is an iterant, the pair
// [a, b] of what the tone is on even and odd beats, represented as the diagonal diag(a, b).
// The beat carries a temporal shift, the swap eta = [[0, 1], [1, 0]] that exchanges even and
// odd. The iterant e = [a, b] eta = [[0, a], [b, 0]] squares to e^2 = (a b) I. So the signed
// tone alternation [+1, -1], the base distinction between the two nonzero tones carried by the
// beat, gives an element with e^2 = -I. That element IS the imaginary unit i. The span
// {x I + y e} closes into the complex numbers, and the iterant algebra is non-commutative (the
// swap and a nontrivial diagonal do not commute), the seed of the spinor structure.
//
// The control is the tone alphabet. The complex structure needs a SIGNED distinction. The
// unsigned binary alternation [0, 1] gives e^2 = 0 (nilpotent, no i), and the constant tone
// [+1, +1] (no distinction) gives e^2 = +I (a real involution, no i). Only the signed
// alternation the ternary tone carries gives e^2 = -I, so the emergent complex structure is
// forced by the signed distinction plus the beat, not put in by hand.
//
// Depth L2. It reconstructs the complex structure from the committed base (ternary tone plus
// beat) by the Kauffman iterant route, with a control on the tone alphabet. It is a
// from-below account of the emergent i, complementary to the two-component walk derivation
// (E-QTM-0046), not a new physical claim.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// a two-by-two real matrix as [m00, m01, m10, m11]
type Matrix = [number, number, number, number]

function multiply(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
  ]
}

function distance(a: Matrix, b: Matrix): number {
  return Math.max(
    ...a.map((value, index) => Math.abs(value - b[index]!)),
  )
}

const IDENTITY: Matrix = [1, 0, 0, 1]
const NEGATIVE_IDENTITY: Matrix = [-1, 0, 0, -1]
const ZERO: Matrix = [0, 0, 0, 0]
// the beat's temporal shift, the swap of even and odd
const BEAT_SWAP: Matrix = [0, 1, 1, 0]

// the iterant e = diag(a, b) * swap, the alternating tone carried by the beat
function iterant(a: number, b: number): Matrix {
  return multiply([a, 0, 0, b], BEAT_SWAP)
}

export default experiment({
  id: 'foundations/complex-structure-from-distinction',
  code: 'E-FND-0062',
  title:
    'the emergent complex unit i is built from the signed tone distinction and the beat alone (Kauffman iterant), with a tone-alphabet control',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the signed alternation carried by the beat gives an element squaring to -I
    const i = iterant(1, -1)
    const iSquared = multiply(i, i)
    const iSquaredResidual = distance(iSquared, NEGATIVE_IDENTITY)

    // the span {x I + y i} closes into the complex numbers:
    // (x1 I + y1 i)(x2 I + y2 i) = (x1 x2 - y1 y2) I + (x1 y2 + y1 x2) i
    const combination = (x: number, y: number): Matrix => [x, y, -y, x]
    const product = multiply(combination(2, 3), combination(4, 5))
    const expected = combination(2 * 4 - 3 * 5, 2 * 5 + 3 * 4)
    const complexClosureResidual = distance(product, expected)

    // the iterant algebra is non-commutative (the seed of the spinor structure)
    const diagonal: Matrix = [1, 0, 0, -1]
    const nonCommutator = distance(
      multiply(BEAT_SWAP, diagonal),
      multiply(diagonal, BEAT_SWAP),
    )

    // control: the tone alphabet. only the signed distinction gives i.
    const binary = iterant(0, 1) // unsigned binary alternation
    const binarySquaredIsZero = distance(multiply(binary, binary), ZERO)
    const constant = iterant(1, 1) // no distinction
    const constantSquaredIsIdentity = distance(
      multiply(constant, constant),
      IDENTITY,
    )

    const iEmerges = iSquaredResidual < 1e-12
    const complexCloses = complexClosureResidual < 1e-12
    const nonCommutative = nonCommutator > 0.5
    const binaryFails = binarySquaredIsZero < 1e-12 // e^2 = 0, no i
    const constantFails = constantSquaredIsIdentity < 1e-12 // e^2 = +I, no i
    const ok =
      iEmerges &&
      complexCloses &&
      nonCommutative &&
      binaryFails &&
      constantFails

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the signed tone alternation [+1, -1] carried by the beat swap gives an iterant squaring to -I, the imaginary unit i, whose real span closes into the complex numbers and whose algebra is non-commutative, so the emergent complex structure is built from the base distinction and the beat with no i put in, while the unsigned binary alternation squares to zero and the constant tone squares to +I, so the signed distinction is what forces it',
      metrics: {
        iSquaredResidual,
        complexClosureResidual,
        nonCommutator,
      },
      // CONTROL: only the signed distinction gives i. Binary squares to zero, constant to +I.
      control: {
        binarySquaredIsZero,
        constantSquaredIsIdentity,
      },
      notes:
        "Where i comes from (Kauffman iterants, Ord, the D'Ariano spin route). A from-below account of the emergent complex structure, complementary to the two-component walk derivation (E-QTM-0046). The quaternionic and spinor extension follows by tensoring two anticommuting iterants, noted as the next step.",
    })
  },
})
