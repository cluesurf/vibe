// The base ternary has no intrinsic give-versus-restrain asymmetry, a surfaced negative. A monist
// triad cosmology (the Zohar's three columns, right as mercy and giving, left as judgment and
// restraint, a balancing middle) invites reading the substrate's ternary tone, plus one, zero, minus
// one, as give, balance, restrain. It is a tempting rhyme, so it is worth testing rather than
// asserting. Tested on the substrate's own rule, it fails at the base: the rule is exactly symmetric
// under swapping plus and minus (charge conjugation), so the two poles carry no intrinsic difference
// in kind, and there is no give-versus-restrain asymmetry to be had at the bottom.
//
// A configuration and its exact sign-flip are evolved under the committed conserving rule, and the
// net charge of one plus the net charge of the other is tracked over the whole run. If plus and
// minus were treated differently the two would not mirror and this sum would drift from zero. It
// stays exactly zero at every step: the dynamics of the flipped configuration is the exact mirror of
// the original, so the base ternary is charge-conjugation symmetric and the plus and minus poles are
// interchangeable, differing only in a sign, not in role.
//
// The control is a hand-made asymmetric rule that drains positive charge only (a give-versus-restrain
// asymmetry imposed by hand): under it the mirror sum is large, so the measure does detect a real
// asymmetry when one is present. The base rule shows none.
//
// The reading, stated plainly: the three-column give-balance-restrain mapping is inspiration, not
// structure. Any give-versus-restrain asymmetry in the emergent world cannot come from the base
// ternary, which is symmetric, and must be sought elsewhere (in the growth arrow, not the charge),
// exactly the discipline that separates a structural rhyme from an imported claim.
//
// Depth L1. It measures the charge-conjugation symmetry of the committed rule exactly (mirror sum
// zero) against a hand-made asymmetric control (mirror sum large), settling the tempting triad
// reading as a surfaced negative: the base has no give-versus-restrain asymmetry. Known symmetry of
// the rule, made explicit as the honest test of a cosmological rhyme.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { chargeConjugationAsymmetry } from '@/code/measure/monism-rhymes'

const LENGTH = 200
const BEATS = 60
const SHARE = 0.3

export default experiment({
  id: 'foundations/charge-conjugation-symmetry',
  code: 'E-FND-0068',
  title:
    'the base ternary is exactly charge-conjugation symmetric (a configuration and its sign-flip mirror exactly), so the plus and minus poles carry no intrinsic give-versus-restrain asymmetry, while a hand-made asymmetric rule is detected',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const baseAsymmetry = chargeConjugationAsymmetry({
      length: LENGTH,
      beats: BEATS,
      share: SHARE,
      seed: 3,
      asymmetric: false,
    })

    // CONTROL: a rule that drains positive charge only, a give-versus-restrain asymmetry by hand
    const asymmetricControl = chargeConjugationAsymmetry({
      length: LENGTH,
      beats: BEATS,
      share: SHARE,
      seed: 3,
      asymmetric: true,
    })

    const baseIsSymmetric = baseAsymmetry === 0
    const controlIsDetected = asymmetricControl > 5

    const ok = baseIsSymmetric && controlIsDetected

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'evolving a ternary configuration and its exact sign-flip under the committed conserving rule keeps the sum of their net charges at exactly zero over the whole run, so the flipped configuration is the exact mirror of the original and the base ternary is charge-conjugation symmetric with the plus and minus poles interchangeable (differing only in a sign, not in role), so the three-column give-balance-restrain reading is not a base structure but inspiration, and any give-versus-restrain asymmetry in the emergent world must come from the growth arrow rather than the charge, while a hand-made rule that drains positive charge only is detected by the same measure as a large mirror mismatch, so the null at the base is a real result and not a blind test',
      metrics: {
        baseAsymmetry,
        asymmetricControl,
      },
      // CONTROL: the hand-made positive-only sink is detected (large mirror mismatch).
      control: { asymmetricControl },
      notes:
        'Surfaced negative: the base ternary has no give-versus-restrain asymmetry (exact charge conjugation). The triad rhyme with emanation cosmology (the Zohar three columns) is inspiration, not structure. The discipline of testing a rhyme rather than asserting it. paper true.',
    })
  },
})
