// The instrument that tells a forced number from a numerological coincidence. Number mysticism, old
// and new, works by matching a measured quantity to a famous number and reading meaning into the
// match. The discipline vibe holds is that a number matters only when it is derived, an exact count
// or algebraic integer from the structure, and never when it is fitted to a target within a
// tolerance. This experiment builds and self-tests the auditor that draws the line, on two axes:
// exactness (is the match at machine precision, forced, or only within a loose tolerance, fitted) and
// the look-elsewhere count (how many comparably-simple targets sit within the same tolerance, so how
// unavoidable the match was).
//
// A forced identity scores high: the E8 kissing number is exactly two hundred forty, an integer with
// no rival simple target at a tiny tolerance, and the octave ratio is exactly two, the reduced
// fraction two over one, unique. A coincidence scores low: a measured ratio near one and a quarter,
// matched to a simple fraction only within a few hundredths, sits among several comparably-simple
// rivals, so the match carries almost no information. And a tempting integer attribution scores low
// too: reading the derived warp trace twenty-one as five plus seven plus nine is only one of the
// twenty-seven ways to write twenty-one as three distinct positive integers, so the attribution to
// those particular numbers is unforced even though the trace itself is exact.
//
// Measured: the forced cases have zero error and exactly one simple target within a tight tolerance,
// while the coincidental ratio has several simple targets within its loose tolerance and the integer
// attribution has many rival decompositions, so the auditor separates the forced from the fitted on
// its two axes, and it is self-validating (it grants the forced cases and refuses the coincidental
// ones).
//
// The control is the pairing of the two verdicts: the same measure that certifies two hundred forty
// and the octave also refuses one and a quarter and the five-plus-seven-plus-nine attribution, so the
// auditor is a live discriminator and not a rubber stamp.
//
// Depth L1. It builds and self-tests the forced-versus-coincidental auditor (exactness and look-
// elsewhere), granting the derived counts and refusing the fitted and the unforced-attribution cases,
// the discipline instrument for number claims. Known counting, assembled as the anti-numerology tool.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  simpleTargetsWithin,
  distinctTripleSums,
} from '@/code/measure/number-structure'

export default experiment({
  id: 'method/coincidence-auditor',
  code: 'E-MTH-0004',
  title:
    'the forced-versus-coincidental auditor certifies exact derived numbers with unique simple targets (E8 240, octave 2:1) and refuses fitted ratios with many rivals (1.25 within 0.03) and unforced integer attributions (21 = 5+7+9, one of 27 ways), a self-tested discipline instrument',
  category: 'method',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    // FORCED: the E8 kissing number 240 is exact with a unique simple target
    const forcedInteger = simpleTargetsWithin({
      value: 240,
      tolerance: 1e-9,
      maxDenominator: 12,
    })

    // FORCED: the octave ratio is exactly two over one, unique
    const forcedRatio = simpleTargetsWithin({
      value: 2,
      tolerance: 1e-9,
      maxDenominator: 12,
    })

    // COINCIDENTAL: a measured ratio near 1.25 matched within a loose tolerance has several rivals
    const coincidentalRivals = simpleTargetsWithin({
      value: 1.27,
      tolerance: 0.03,
      maxDenominator: 12,
    })

    // UNFORCED ATTRIBUTION: reading 21 as 5 + 7 + 9 is one of many triple decompositions
    const attributionRivals = distinctTripleSums(21)

    const forcedCertified = forcedInteger === 1 && forcedRatio === 1
    const coincidenceRefused = coincidentalRivals >= 2
    const attributionRefused = attributionRivals >= 10

    const ok =
      forcedCertified && coincidenceRefused && attributionRefused

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the auditor certifies a forced number when it is exact with a unique comparably-simple target (the E8 kissing number two hundred forty is an exact integer with one simple target at a tight tolerance, and the octave ratio is exactly the reduced fraction two over one, unique) and refuses a coincidence when the match is only within a loose tolerance and shares that tolerance with several comparably-simple rivals (a ratio near one and a quarter has several simple fractions within a few hundredths), and refuses an unforced integer attribution when the target integer has many rival decompositions (reading the derived warp trace twenty-one as five plus seven plus nine is one of twenty-seven ways to write twenty-one as three distinct positive integers), so the auditor separates the forced from the fitted on exactness and the look-elsewhere count and is self-validating, granting the derived cases and refusing the coincidental ones with the same measure',
      metrics: {
        forcedIntegerTargets: forcedInteger,
        forcedRatioTargets: forcedRatio,
        coincidentalRivals,
        attributionRivals,
      },
      // CONTROL: the same measure that certifies the forced cases refuses the coincidental ones.
      control: { coincidentalRivals, attributionRivals },
      notes:
        'The anti-numerology instrument: forced (exact, unique) versus coincidental (fitted, dense rivals). Certifies E8 240 and the octave, refuses 1.25 and the 5+7+9 attribution of 21. The discipline the Zohar and numerology notes call for. Pairs with the Perron-growth result (E-GMT-0038).',
    })
  },
})
