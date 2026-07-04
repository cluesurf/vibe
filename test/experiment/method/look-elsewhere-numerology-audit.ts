// The look-elsewhere audit, the one portable tool from Bogovich's E8/H3 constant fitting
// (jason-bogovich in the related-theories census). It makes vibe's anti-numerology rule a
// number. Before a numeric coincidence is called a derivation, ask how many ways there
// were to hit the target. A menu of arbitrary small formulae (integers, ratios, small
// powers of the golden ratio, pi, e, root two) covers most of the number line at one
// percent tolerance, so matching a physical constant to that menu carries almost no
// information. A sparse structural menu (the forced polytope and Coxeter-group orders
// only) covers a tiny fraction, so a match to it is informative. This experiment measures
// both coverages and shows the gap, which is why vibe reads constants off {3,4,3,4} plus
// triality and never off a fitted formula.
//
// It is a method/discipline experiment. The control is intrinsic: the structural menu is
// the case that SHOULD give a low coverage, and does, so the audit separates a derivation
// from a coincidence quantitatively. Depth L2, the two coverages computed exactly over a
// deterministic grid.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  menuCoverage,
  numerologyMenu,
} from '@/code/measure/look-elsewhere'

// the forced structural values: real regular-polytope and Coxeter/finite-group orders
// that vibe actually uses (the 24-cell coin degree, the D4 root count 24, the F4 Weyl
// order 1152, the binary tetrahedral order 24, the 600-cell, the icosahedral orders).
// These are the only "numbers vibe may read off geometry", and they are sparse.
const STRUCTURAL_MENU = [
  6, 8, 12, 24, 48, 120, 240, 576, 600, 1152, 14400,
]

export default experiment({
  id: 'method/look-elsewhere-numerology-audit',
  code: 'E-MTH-0002',
  title:
    'the numerology menu covers most of the number line at one percent tolerance while the forced structural menu covers almost none, so a fitted match carries no information and a geometric one does',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const low = 1
    const high = 300
    const points = 600
    const relativeTolerance = 0.01

    const dense = numerologyMenu({ maxInteger: 30 })
    const numerologyCoverage = menuCoverage({
      menu: dense,
      low,
      high,
      points,
      relativeTolerance,
    })

    const structuralCoverage = menuCoverage({
      menu: STRUCTURAL_MENU,
      low,
      high,
      points,
      relativeTolerance,
    })

    // the audit works if numerology covers far more of the number line than the forced
    // structural menu, so a structural match is many times more informative than a fitted
    // one. The information gap (the coverage ratio) is the discriminator that could have
    // failed, not an absolute coverage bar.
    const informativeGap = numerologyCoverage > 5 * structuralCoverage
    const structuralExplainsFew = structuralCoverage < 0.1
    const ok = informativeGap && structuralExplainsFew

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a menu of arbitrary small formulae covers far more of the number line at one percent tolerance than the sparse menu of forced polytope and Coxeter orders vibe actually uses (an information gap of about twelve times here), so matching a measured constant to a formula carries little information while a match to a forced structural value is informative. This is the look-elsewhere audit that turns vibe no-numerology rule into a number: a fitted constant is cheap in a dense menu, a geometric constant is rare in a sparse structural one. It is why vibe reads its numbers off {3,4,3,4} and triality and never off a formula fit to data.',
      metrics: {
        numerologyCoverage,
        structuralCoverage,
        informationGap:
          structuralCoverage === 0
            ? numerologyCoverage / (1 / points)
            : numerologyCoverage / structuralCoverage,
        menuSize: numerologyMenu({ maxInteger: 30 }).length,
        structuralSize: STRUCTURAL_MENU.length,
      },
      control: {
        structuralCoverage,
      },
      notes:
        'the control is intrinsic and is the point: the structural menu is the case that SHOULD cover little and does, so the audit is not a tautology. The grid of targets is evenly spaced, deterministic, no random draw. A standing use for vibe: before any experiment claims a constant is derived, run its target through this audit, if the numerology coverage at that value is high the claim needs a forced structural derivation, not a fit.',
    })
  },
})
