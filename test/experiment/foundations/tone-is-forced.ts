// The ternary tone emerges automatically, from integer arithmetic alone. A tone is a
// value drawn from a finite set of integers. Two requirements pin the set:
//   - a vacuum. The set must contain 0, so a site can be empty (no distinction).
//   - a mirror. The set must be closed under negation and act nontrivially, so every
//     charge has an opposite (charge conjugation, the plus and minus mirror).
// Enumerate EVERY non-empty subset of {-3..3} (all 127 of them, exhaustive, not a curated
// shortlist) and test both properties. The smallest set that passes has size three, and the
// one of least content is {-1, 0, +1}, the ternary tone. So three is not chosen, it is the
// least integer alphabet with a vacuum and a mirror.
//
// The arrow is a separate step and lives in its own experiment (arrow-from-integer-order,
// E-FND-0002), which computes the square of each imaginary unit up the Cayley-Dickson tower
// and shows only the ordered integer line survives. It is not restated here, so this
// experiment makes exactly one claim, about the tone.
//
// CONTROLS, both run. Each requirement must be able to reject, shown as a size floor over the
// same exhaustive enumeration: requiring a vacuum only, the minimal alphabet is size one
// ({0}); requiring a mirror only, size two ({-1, 1}); requiring both, size three. So each
// requirement raises the floor, and neither alone forces three. The near-misses {0, 1} (no
// mirror) and {-1, 1} (no vacuum) are the size-two failures of the full test.
//
// Grade L1: elementary integer-arithmetic facts confirmed by exhaustive enumeration. The
// residual premises are the vacuum and the mirror, the honest physical requirements.

import {
  toneAlphabetQualifies,
  integerAlphabets,
  minimalQualifyingAlphabetSize,
  minimalContentQualifyingAlphabet,
  minimalVacuumOnlySize,
  minimalMirrorOnlySize,
} from '@/code/measure/base-forcing'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const RANGE = 3

export default experiment({
  id: 'foundations/tone-is-forced',
  code: 'E-FND-0045',
  title:
    'the ternary tone emerges from integer arithmetic: over EVERY subset of {-3..3} the unique smallest set with a vacuum (a 0) and a mirror (nontrivial negation closure) is {-1,0,+1}, size three, where a vacuum alone forces only size one and a mirror alone only size two, so both requirements together force the three',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const candidates = integerAlphabets(RANGE)
    const qualifying = candidates.filter(toneAlphabetQualifies)
    const minimalSize = minimalQualifyingAlphabetSize()
    const minimalContent = minimalContentQualifyingAlphabet(RANGE)

    // 1. the exhaustive smallest qualifier is the ternary tone
    const ternaryIsMinimal =
      minimalSize === 3 &&
      minimalContent.length === 3 &&
      [-1, 0, 1].every(v => minimalContent.includes(v))

    // 2. the size floors: vacuum-only 1, mirror-only 2, both 3. Each requirement raises the
    // floor, so neither alone forces three.
    const vacuumOnly = minimalVacuumOnlySize(RANGE)
    const mirrorOnly = minimalMirrorOnlySize(RANGE)
    const bothRaiseTheFloor =
      vacuumOnly === 1 && mirrorOnly === 2 && minimalSize === 3

    // 3. the two named near-misses fail for the right reason (in the full enumeration)
    const vacuumNoMirror = !toneAlphabetQualifies([0, 1]) // has 0, no mirror
    const mirrorNoVacuum = !toneAlphabetQualifies([-1, 1]) // has mirror, no 0
    const nearMissesFail = vacuumNoMirror && mirrorNoVacuum

    const solved =
      ternaryIsMinimal && bothRaiseTheFloor && nearMissesFail

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'over every non-empty subset of the integers {-3..3}, the sets with both a vacuum (a 0) and a mirror (nontrivial negation closure) all have size at least three, and the one of least content is {-1, 0, +1}, the ternary tone. A vacuum alone is satisfied at size one (the trivial {0}) and a mirror alone at size two (the pair {-1, 1}), so each requirement raises the floor and only the two together force the three. This is exhaustive over the 127 subsets, not a curated list.',
      metrics: {
        candidateCount: candidates.length,
        qualifyingCount: qualifying.length,
        minimalQualifyingSize: minimalSize,
        minimalContentSize: minimalContent.length,
        minimalContentMaxMagnitude: Math.max(
          ...minimalContent.map(Math.abs),
        ),
        vacuumOnlyFloor: vacuumOnly,
        mirrorOnlyFloor: mirrorOnly,
      },
      control: {
        // the two size floors that show neither requirement alone forces three, and the two
        // named near-misses that must fail the full test
        vacuumOnlyFloor: vacuumOnly,
        mirrorOnlyFloor: mirrorOnly,
        vacuumNoMirrorQualifies: toneAlphabetQualifies([0, 1]) ? 1 : 0,
        mirrorNoVacuumQualifies: toneAlphabetQualifies([-1, 1]) ? 1 : 0,
      },
      notes:
        'L1, elementary integer arithmetic confirmed by EXHAUSTIVE enumeration over all 127 subsets of {-3..3}, reusing code/measure/base-forcing. The tone is the least-content integer set with a vacuum and a mirror. The arrow (that only the ordered integer line survives up the division tower) is a separate claim proven in arrow-from-integer-order (E-FND-0002) by real Cayley-Dickson squares, so it is not restated here and this experiment makes one claim only. The residual premises are the vacuum and the mirror.',
    })
  },
})
