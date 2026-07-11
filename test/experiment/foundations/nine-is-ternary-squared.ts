// The nine is the ternary squared. The substrate's tone is ternary, three values, minus one, zero,
// plus one, forced as the minimal alphabet carrying a vacuum and a charge conjugation (E-FND-0038).
// So wherever two tones meet, the number of joint states is three squared, nine. A bond between two
// cells, a two-digit balanced-ternary place value, a pair of interacting tones: each is a nine-state
// object, and the nine is not a chosen number but the square of the forced three. In balanced
// ternary the two-trit values, the high tone weighted by three plus the low, run over exactly nine
// distinct values from minus four to plus four, the full symmetric range, so nine is the natural
// alphabet of a tone pair.
//
// Measured: a pair of ternary tones has exactly nine joint states (three squared), the two-trit
// balanced-ternary place spans exactly nine distinct values from minus four to plus four
// symmetrically, and the count is the square of the forced ternary alphabet size, so nine appears as
// three squared with no extra input.
//
// The control is a binary alphabet: two binary values give four joint states, two squared, not nine,
// so the nine is specifically the ternary squared and depends on the tone being three-valued, which
// the vacuum-plus-conjugation minimality forces.
//
// Depth L1. It confirms that the nine of a tone pair is the square of the forced ternary alphabet
// (nine joint states, nine balanced-ternary two-trit values, symmetric range minus four to plus
// four) against a binary control giving four, so nine is three squared. Known counting, tied to the
// forced ternary. The number 9 as ternary squared.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { ternaryPairStates } from '@/code/measure/number-structure'

export default experiment({
  id: 'foundations/nine-is-ternary-squared',
  code: 'E-FND-0071',
  title:
    'a pair of ternary tones has exactly nine joint states (three squared) and the balanced two-trit place spans nine values symmetrically from minus four to plus four, so nine is the forced ternary squared, while a binary pair gives only four',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const pair = ternaryPairStates()

    const isTernarySquared = pair.count === 3 ** 2
    const nineJointStates = pair.count === 9
    const symmetricRange = pair.min === -4 && pair.max === 4

    // CONTROL: a binary pair has four states, not nine
    const binaryPair = new Set<number>()

    for (const a of [0, 1]) {
      for (const b of [0, 1]) binaryPair.add(2 * a + b)
    }

    const binaryGivesFour = binaryPair.size === 4

    const ok =
      nineJointStates &&
      symmetricRange &&
      isTernarySquared &&
      binaryGivesFour

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a pair of ternary tones (each minus one, zero, or plus one) has exactly nine joint states, three squared, and the two-trit balanced-ternary place value, the high tone weighted by three plus the low tone, spans exactly nine distinct values from minus four to plus four symmetrically, so nine appears as the square of the forced ternary alphabet with no extra input, the natural alphabet of a tone pair, while a binary pair has only four joint states (two squared), so the nine is specifically the ternary squared and depends on the tone being three-valued which the vacuum-plus-conjugation minimality forces',
      metrics: {
        jointStates: pair.count,
        rangeMin: pair.min,
        rangeMax: pair.max,
        ternarySquared: 3 ** 2,
        binaryPairStates: binaryPair.size,
      },
      // CONTROL: a binary pair gives four states, not nine.
      control: { binaryPairStates: binaryPair.size },
      notes:
        'Nine as the forced ternary squared: nine two-tone states, nine balanced two-trit values, symmetric minus four to plus four. Tied to the ternary-and-4D forcing (E-FND-0038). The number 9 = 3 squared.',
    })
  },
})
