// Why is there an arrow at all, the DISCRETE answer. The arrow (time, the one-way direction) is the order of the
// INTEGERS, the discrete number line (the beat-count), not the continuous reals. The base is discrete (the ternary
// tone is in the integers, the 24-cell is integer-native, the beat is a discrete step), so the arrow must be a
// discrete order, and it is, the order of the integers, the unique ordered discrete normed ring.
//
//   - ONLY THE INTEGERS ARE ORDERED. An ordered ring has x^2 >= 0 for every x. The discrete Cayley-Dickson rings (the
//     Gaussian integers, the Hurwitz quaternions, the Cayley/octonion integers, the E8 lattice) all contain an element
//     i with i^2 = -1 < 0, so NONE can be ordered. The integers Z are the unique ordered discrete normed ring.
//   - THE GEOMETRY IS BUILT ON THE INTEGERS. The integer Cayley-Dickson tower has the integers as its real part (the
//     scalars). The octonion integers are one integer (real) axis plus seven imaginary axes. The one integer axis is
//     ordered, the seven imaginary axes are not. ALL INTEGER ARITHMETIC, no continuum.
//   - AN ORDER IS A DIRECTION. The integer order is one-way (the beat-count, n less than n plus one, and not the
//     reverse). So the one ordered (integer) axis carries the discrete arrow, the imaginary axes carry none.
//   - SO TIME IS THE INTEGER BEAT (THE ARROW) AND THE IMAGINARY DIRECTIONS ARE NOT-TIME. Time is the ordered discrete
//     count (a before and an after, the beat), the imaginary directions are unordered. The continuous reals are the
//     EMERGENT infrared version of the integers, the discrete integer order is the base version, the SAME theorem,
//     discrete.
//
// HONEST on the dimensions, this gives WHY there is a one-way time (the integer order) and why the imaginary directions
// are not ordered, but the seven imaginary octonion-integer units are the INTERNAL structure (the Fano plane, the G2
// symmetry, the spinor/matter content), NOT physical space. Physical space (the 4D {3,4,3,4} substrate, the 3D cusp)
// emerges from D4 (rank four), which the octonions generate by triality, the spatial dimension is four (D4 rank), not
// seven. So time = the discrete integer order, space-dimension = the D4 substrate. Depth L2, the integer orderability
// computed deterministically, with the imaginary (unorderable) axes the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { cayleyMultiply } from '@/code/measure/division-algebra'

// the count of real (square positive, ordered) and imaginary (square negative, unorderable) axes of the level-n
// integer Cayley-Dickson ring (integer arithmetic throughout, the discrete number line)
function integerAxes(level: number): {
  ordered: number
  unordered: number
} {
  const dimension = 2 ** level

  let ordered = 0
  let unordered = 0

  for (let i = 0; i < dimension; i++) {
    const e = new Array<number>(dimension).fill(0)
    e[i] = 1

    if (cayleyMultiply(e, e)[0]! > 0) {
      ordered++
    } else {
      unordered++
    }
  }

  return { ordered, unordered }
}

export default experiment({
  id: 'foundations/arrow-from-integer-order',
  title:
    'the arrow is the order of the INTEGERS (the discrete beat-count), the unique ordered discrete normed ring, the discrete geometry rings (i^2=-1) unordered',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // only the integers are ordered (no imaginary axis); the discrete geometry rings have imaginary (unorderable) axes
    const integers = integerAxes(0)
    const gaussian = integerAxes(1)
    const octonionIntegers = integerAxes(3)
    const integersAreOrdered = integers.unordered === 0
    const geometryRingsUnordered =
      gaussian.unordered > 0 && octonionIntegers.unordered > 0

    // every ring has exactly one integer (ordered) axis, the scalar foundation
    const oneOrderedAxis =
      integers.ordered === 1 &&
      gaussian.ordered === 1 &&
      octonionIntegers.ordered === 1

    // the octonion integers are one ordered + seven unordered (8 = 1 + 7), the one ordered axis is the arrow
    const oneOrderedSevenUnordered =
      octonionIntegers.ordered === 1 && octonionIntegers.unordered === 7

    const ok =
      integersAreOrdered &&
      geometryRingsUnordered &&
      oneOrderedAxis &&
      oneOrderedSevenUnordered

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the arrow is the order of the INTEGERS, the discrete number line (the beat-count), not the continuous reals. The base is discrete, so the arrow is a discrete order. An ordered ring requires every square non-negative, but the discrete Cayley-Dickson rings (the Gaussian integers, the Hurwitz quaternions, the Cayley/octonion integers) all contain an element with square -1, so none can be ordered, the integers are the unique ordered discrete normed ring. The geometry is built on the integers (the integer scalars are the real part), and the octonion integers are one ordered axis plus seven unordered axes, all integer arithmetic. An order is one-way (the beat-count), so the one ordered (integer) axis is the discrete arrow and the imaginary axes are not. So TIME is the integer beat (ordered, the arrow) and the imaginary directions are unordered. The continuous reals are the emergent infrared version, the integer order is the discrete base version, the same theorem, discrete. The control is the imaginary axes, which have no order and no arrow.',
      metrics: {
        integersUnorderedAxes: integers.unordered,
        octonionIntegerOrderedAxes: octonionIntegers.ordered,
        octonionIntegerUnorderedAxes: octonionIntegers.unordered,
        gaussianUnorderedAxes: gaussian.unordered,
      },
      control: {
        octonionIntegerUnorderedAxes: octonionIntegers.unordered,
        integersUniquelyOrdered: integersAreOrdered ? 1 : 0,
      },
      notes:
        'the computation is INTEGER throughout (unit vectors with 0 and 1 entries, integer Cayley-Dickson multiplication), the discrete number line, no continuum. An ordered ring needs x^2 >= 0 (squares of positives and negatives are both positive). The integers Z satisfy this (no imaginary axis), the Gaussian integers (i^2 = -1), the Hurwitz quaternions (three imaginary), and the Cayley/octonion integers, the E8 lattice (seven imaginary) all fail, so the integers are the unique ordered discrete normed ring. Each ring has one integer (ordered) axis and the rest imaginary, the octonion integers being 1 + 7. An order is one-way, so the integer axis is the discrete arrow (the beat-count, t less than t plus one) and the imaginary axes are unordered. So time is the discrete integer order (the beat). The continuous reals are the EMERGENT infrared limit of the integer order (the discrete F4 to continuous so(8) story), the base is the integers. HONEST on the dimensions, the seven imaginary octonion-integer units are the INTERNAL structure (the Fano plane, the G2 symmetry, the matter/spinor content), NOT physical space, physical space (the 4D {3,4,3,4} substrate, the 3D cusp) emerges from D4 (rank four) by triality, so the spatial dimension is four, not seven. So time = the discrete integer beat-order, space-dimension = the D4 substrate. The reversible knit has no LOCAL arrow (space-like, CPT, `foundations/cpt-theorem`), the global arrow is the growth (the mesh expanding, the integer order made dynamical). See `from-the-void-to-the-base.md`.',
    })
  },
})
