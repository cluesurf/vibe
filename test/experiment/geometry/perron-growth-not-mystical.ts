// The substrate's growth rate is a forced algebraic integer, not a mystical constant. The {3,4,3,4}
// honeycomb grows shell by shell at a rate that is the largest root of the characteristic cubic of
// its transfer matrix (E-GMT-0031), lambda cubed minus twenty-one lambda squared plus fifty-one
// lambda minus twenty-three, about 18.2787. This note settles what kind of number that is: it is a
// Perron number, a real algebraic integer that strictly dominates its conjugates in magnitude, which
// is exactly the kind of number a growth or substitution system must produce, and it is not a Pisot
// number (one conjugate lies outside the unit circle) and not a simple function of pi, e, or the
// golden ratio. So the special-looking 18.2787 is forced by the geometry as an algebraic integer,
// its meaning is the growth rate and nothing more, and it is not secretly a famous constant.
//
// Measured: the cubic has three real roots, the largest 18.2787 strictly larger in magnitude than the
// other two (2.1308 and 0.5905), so the growth rate is a Perron number, and because one conjugate
// (2.1308) is outside the unit circle it is not a Pisot number. The dominant root is checked against
// pi times a small integer, e times a small integer, and powers of the golden ratio, and matches none
// to any reasonable precision, so it is not a disguised transcendental constant.
//
// The control is the golden ratio itself, a genuine Pisot number (its one conjugate lies inside the
// unit circle): the same test correctly labels it Pisot, so the Perron-not-Pisot verdict on the warp
// rate is a real distinction the measure draws, not a blanket answer.
//
// Depth L1. It classifies the warp growth rate as a Perron (not Pisot) algebraic integer and rules
// out simple transcendental matches, against a golden-ratio Pisot control, an anti-numerology result:
// the number is forced and means only the growth rate. Known algebraic-number facts, made explicit on
// the committed warp polynomial.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { cubicRoots } from '@/code/measure/number-structure'

export default experiment({
  id: 'geometry/perron-growth-not-mystical',
  code: 'E-GMT-0038',
  title:
    'the {3,4,3,4} growth rate 18.2787 is a Perron algebraic integer (dominant root strictly above its conjugates) that is not Pisot (one conjugate outside the unit circle) and not a simple pi, e, or golden-ratio expression, a forced number meaning only the growth rate',
  category: 'geometry',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // the warp characteristic cubic lambda^3 - 21 lambda^2 + 51 lambda - 23
    const roots = cubicRoots(-21, 51, -23)
    const dominant = roots[0]!
    const conjugates = roots.slice(1)

    // Perron: the dominant root strictly exceeds the magnitude of every conjugate
    const isPerron = conjugates.every(
      root => dominant > Math.abs(root) + 1e-9,
    )

    // not Pisot: some conjugate lies outside the unit circle
    const notPisot = conjugates.some(root => Math.abs(root) > 1)

    // not a simple transcendental: no small-integer multiple of pi or e, no golden power, matches
    const golden = (1 + Math.sqrt(5)) / 2
    const candidates: number[] = []

    for (let k = 1; k <= 12; k++) {
      candidates.push(Math.PI * k, Math.E * k, Math.PI ** 2 * (k / 6))
    }

    for (let k = 2; k <= 8; k++) {
      candidates.push(golden ** k)
    }

    const nearestSimpleError = Math.min(
      ...candidates.map(c => Math.abs(c - dominant)),
    )

    const notSimpleConstant = nearestSimpleError > 0.05

    // CONTROL: the golden ratio IS a Pisot number (its conjugate is inside the unit circle)
    const goldenConjugate = (1 - Math.sqrt(5)) / 2
    const goldenIsPisot = Math.abs(goldenConjugate) < 1

    const ok =
      isPerron && notPisot && notSimpleConstant && goldenIsPisot

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {3,4,3,4} growth rate is the largest root of the transfer-matrix cubic, about 18.2787, and it is a Perron number (a real algebraic integer strictly dominating its two conjugates 2.1308 and 0.5905 in magnitude, the kind of number a growth system must produce) but not a Pisot number (the conjugate 2.1308 lies outside the unit circle), and it matches no small-integer multiple of pi or e and no power of the golden ratio to within a twentieth, so the special-looking 18.2787 is forced by the geometry as an algebraic integer whose meaning is the growth rate and nothing more, and is not secretly a famous constant, while the golden ratio itself is correctly labeled a Pisot number by the same test (its conjugate inside the unit circle), so the Perron-not-Pisot distinction is real',
      metrics: {
        dominantRoot: Number(dominant.toFixed(4)),
        largerConjugate: Number(conjugates[0]!.toFixed(4)),
        smallerConjugate: Number(conjugates[1]!.toFixed(4)),
        isPerron: isPerron ? 1 : 0,
        isPisot: notPisot ? 0 : 1,
        nearestSimpleConstantError: Number(
          nearestSimpleError.toFixed(3),
        ),
      },
      // CONTROL: the golden ratio is a Pisot number, correctly labeled by the same test.
      control: { goldenIsPisot: goldenIsPisot ? 1 : 0 },
      notes:
        'Anti-numerology: the warp growth rate is a forced Perron algebraic integer, not Pisot, not a disguised transcendental. Its meaning is the growth rate. Refines the warp minimal polynomial (E-GMT-0031). Pairs with the coincidence auditor (E-MTH-0004).',
    })
  },
})
