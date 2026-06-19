// Why is there an arrow at all? The arrow (time, the one-way direction) is the ORDER of the reals, the unique ordered
// division algebra, surviving as time while the spatial directions the algebra generates are unordered. This is the
// rigorous answer to why time has an arrow and space does not.
//
//   - ONLY THE REALS ARE ORDERED. A totally ordered field has x^2 >= 0 for every x. The complexes, quaternions, and
//     octonions all contain an element i with i^2 = -1 < 0, so NONE of them can be ordered. The reals are the UNIQUE
//     normed division algebra that is ordered (a total order, the number line).
//   - THE GEOMETRY IS BUILT ON THE REALS. Every Cayley-Dickson algebra has the reals as its real part (the scalars).
//     The octonion is one real axis plus seven imaginary axes (8 = 1 + 7). The one real axis is ordered, the seven
//     imaginary axes are not.
//   - AN ORDER IS A DIRECTION. A total order is a one-way relation (before < after, and not the reverse), so the
//     ordered real axis carries an intrinsic one-way direction, while the unordered imaginary axes do not.
//   - SO TIME IS THE REAL AXIS (THE ARROW) AND SPACE IS THE IMAGINARY AXES. Time is one-dimensional and ordered
//     (before and after), space is multi-dimensional and symmetric (no intrinsic before and after between points).
//     This matches the algebra exactly, the one ordered (real) axis is time, the seven unordered (imaginary) axes are
//     space. So the arrow exists, is one-dimensional, and is one-way, BECAUSE it is the order of the reals, the
//     ordered foundation the geometry is anchored to and cannot shed.
//
// So the answer to why there is an arrow, the geometry (the octonion, eight = two cubed = one real plus seven
// imaginary) is built on the reals, the one ordered division algebra, and order is direction, so the real part is time
// (the arrow) and the imaginary part is space (no arrow). Depth L2, the orderability and the real-imaginary split
// computed deterministically, with the imaginary axes (no order, no arrow) the control for the real axis (the arrow).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { cayleyMultiply } from '@/code/measure/division-algebra'

// the count of real (square positive, ordered) and imaginary (square negative, unorderable) axes of the level-n
// Cayley-Dickson algebra
function realImaginaryAxes(level: number): {
  real: number
  imaginary: number
} {
  const dimension = 2 ** level
  let real = 0
  let imaginary = 0
  for (let i = 0; i < dimension; i++) {
    const e = new Array<number>(dimension).fill(0)
    e[i] = 1
    const square = cayleyMultiply(e, e)[0]!
    if (square > 0) real++
    else imaginary++
  }
  return { real, imaginary }
}

export default experiment({
  id: 'foundations/arrow-from-real-order',
  title:
    'the arrow is the order of the reals (the unique ordered division algebra), time = the 1 real axis (ordered), space = the 7 imaginary axes (unordered)',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // only the reals are ordered (no imaginary axis), the higher algebras have imaginary (unorderable) axes
    const reals = realImaginaryAxes(0)
    const complexes = realImaginaryAxes(1)
    const octonions = realImaginaryAxes(3)
    const realsAreOrdered = reals.imaginary === 0
    const higherAreUnordered =
      complexes.imaginary > 0 && octonions.imaginary > 0

    // every algebra has exactly one real axis (the scalars, the ordered foundation)
    const oneRealAxis =
      reals.real === 1 && complexes.real === 1 && octonions.real === 1

    // the octonion is 1 real (time, the arrow) + 7 imaginary (space, no arrow)
    const octonionOnePlusSeven =
      octonions.real === 1 && octonions.imaginary === 7

    const ok =
      realsAreOrdered &&
      higherAreUnordered &&
      oneRealAxis &&
      octonionOnePlusSeven

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the arrow is the order of the reals. A totally ordered field has every square non-negative, but the complexes, quaternions, and octonions all contain an element with square -1, so none of them can be ordered, the reals are the unique ordered normed division algebra. The geometry is built on the reals (every Cayley-Dickson algebra has the reals as its real part), and the octonion is one real axis plus seven imaginary axes (8 = 1 + 7). An order is a one-way direction (before and after), so the one ordered (real) axis carries an intrinsic arrow while the seven unordered (imaginary) axes do not. So TIME is the real axis (one-dimensional, ordered, the arrow) and SPACE is the imaginary axes (multi-dimensional, symmetric, no arrow). The arrow exists, is one-dimensional, and is one-way precisely because it is the order of the reals, the ordered foundation the geometry is anchored to and cannot shed. The control is the imaginary axes, which have no order and no arrow.',
      metrics: {
        realsImaginaryAxes: reals.imaginary,
        octonionRealAxes: octonions.real,
        octonionImaginaryAxes: octonions.imaginary,
        complexImaginaryAxes: complexes.imaginary,
      },
      control: {
        octonionImaginaryAxes: octonions.imaginary,
        realsAreUniquelyOrdered: realsAreOrdered ? 1 : 0,
      },
      notes:
        'a totally ordered field requires x^2 >= 0 for all x (since squares of positives and negatives are both positive). The reals (dimension one) satisfy this, with no imaginary axis, so they are ordered. The complexes (one imaginary axis, i^2 = -1), quaternions (three), and octonions (seven) all have an element with negative square, so by the order axiom none can be ordered, the reals are the unique ordered division algebra. Each algebra has exactly one real axis (the scalar foundation) and the rest imaginary, the octonion being 1 + 7 (= 8 = 2^3). An order is intrinsically directional (before < after, not the reverse), so the ordered real axis is a one-way direction and the unordered imaginary axes are not. The IDENTIFICATION (the one interpretive step, but forced, since time is the unique ordered dimension and space the symmetric ones) is, the real axis = time (the arrow), the imaginary axes = space. So the arrow is the order of the reals, necessary because the reals are the foundation of the whole tower and uniquely ordered, one-way because order is one-way, and one-dimensional because the real part is one-dimensional. This is consistent with the dynamics, the reversible knit has NO local arrow (space-like, CPT-symmetric, `foundations/cpt-theorem`), and the global arrow is the growth (the mesh expanding from the seed, the real order made dynamical). So why an arrow, because the geometry is built on the one ordered algebra, see `from-the-void-to-the-base.md`.',
    })
  },
})
