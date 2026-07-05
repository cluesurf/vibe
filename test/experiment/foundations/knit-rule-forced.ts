// Is the knit rule forced, or one of a family. The committed knit (headOnRotate) rotates a
// zero-momentum head-on pair (both slots of one line carrying the same tone) between PAIRED
// lines, conserving charge and momentum and being a reversible involution. The free part is
// the PAIRING of the 12 lines (the 12 opposite-direction pairs of the 24 directions) into 6
// pairs. This experiment counts the family and tests how much symmetry forces a unique rule,
// as a CURVE, and verifies the symmetry group rather than assuming it.
//
//   - BY CONSERVATION ALONE, A VAST FAMILY. Any pairing of the 12 lines gives a valid
//     momentum-conserving reversible knit, and there are 10395 perfect matchings of 12 lines.
//   - THE FORCING IS A CURVE, NOT A JUMP. Demanding invariance under the B4 generators one at a
//     time, the survivor count descends 10395, 75, 3, 3, 1: one generator is not enough, the
//     full B4 is, so the symmetry is genuinely load-bearing and the uniqueness is not a knife
//     edge.
//   - THE GROUP IS VERIFIED, NOT ASSUMED. The four generators close to a permutation group of
//     order 192 on the 12 lines, which is the image of the order-384 hyperoctahedral B4 (the
//     signed coordinate permutations of the 24-cell), whose kernel on unordered lines is the
//     central minus one. So "the B4 symmetry" is a computed fact.
//   - B4 FORCES A UNIQUE KNIT, TRIALITY BREAKS IT. Exactly one matching is B4-invariant, the
//     knit, and it pairs the two lines of each coordinate pair. But extending to the FULL F4
//     symmetry of the 24-cell (order 1152, image 576 on the lines, B4 plus triality) leaves
//     ZERO invariant matchings. So no collision law is triality-invariant: the knit respects
//     the crystallographic signed-permutation symmetry B4 but explicitly breaks triality, which
//     is the symmetry that mixes the three generations 8v, 8s, 8c. This is the honest scope,
//     and it is more precise than "the full symmetry narrows it further".
//
// So the knit is forced UNIQUE by the crystallographic B4 symmetry (with conservation,
// reversibility, minimal support), and demanding the full F4 over-constrains to nothing, so
// triality is broken by any specific dynamics. Depth L2, the family, the forcing curve, the
// verified group order, and the F4 over-constraint all counted deterministically.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { linePairingForcingCurve } from '@/code/measure/collision-family'

export default experiment({
  id: 'foundations/knit-rule-forced',
  code: 'E-FND-0028',
  title:
    'the knit is one of 10395 by conservation alone, and the crystallographic B4 symmetry (verified order-192 on the lines) forces it UNIQUE along a descending curve 10395 to 75 to 3 to 1, while the full F4 (triality) over-constrains to ZERO, so the knit respects B4 but breaks triality',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const result = linePairingForcingCurve()

    // by conservation alone the family is vast (the perfect matchings of 12 lines)
    const vastFamily = result.totalPairings === 10395

    // the forcing curve descends to exactly one at full B4, and is above one before then
    const curveEndsAtOne =
      result.curve[result.curve.length - 1]!.survivors === 1
    const curveStartsVast = result.curve[0]!.survivors === 10395
    const curveNeedsFullB4 = result.curve
      .slice(0, result.curve.length - 1)
      .every(point => point.survivors > 1)
    const curveDescends = curveEndsAtOne && curveStartsVast && curveNeedsFullB4

    // the group is verified: the four generators close to order 192 on the lines (the image of
    // the order-384 B4), and F4 to 576 (the image of the order-1152 F4)
    const b4GroupVerified = result.b4LineGroupOrder === 192
    const f4GroupVerified = result.f4LineGroupOrder === 576

    // B4 forces exactly one, and it pairs same-coordinate-pair lines
    const b4ForcesUnique = result.b4Survivors === 1
    const survivorIdentified = result.survivorPairsSameCoordinatePair

    // triality breaks it: the full F4 leaves zero invariant matchings
    const trialityOverConstrains = result.f4Survivors === 0

    const solved =
      vastFamily &&
      curveDescends &&
      b4GroupVerified &&
      f4GroupVerified &&
      b4ForcesUnique &&
      survivorIdentified &&
      trialityOverConstrains

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the knit is forced by the crystallographic B4 symmetry and no more. By conservation and reversibility alone there are 10395 line-pairings, and demanding the B4 signed-permutation symmetry of the 24-cell forces exactly one, the knit, along a descending curve (10395, 75, 3, 3, 1) so the uniqueness is not a knife edge but the result of the full symmetry. The four generators are verified to close to order 192 on the 12 lines (the image of the order-384 B4, kernel the central minus one), so the group is computed, not assumed. The unique knit pairs the two lines of each coordinate pair. Extending to the full F4 symmetry of the 24-cell (order 1152, image 576, B4 plus triality) leaves ZERO invariant matchings, so no collision law is triality-invariant: the knit respects B4 but explicitly breaks triality, the symmetry that mixes the three generations. So the knit is unique under the crystallographic symmetry, and triality is broken by any specific dynamics, the honest scope.',
      metrics: {
        totalPairings: result.totalPairings,
        curveOneGenerator: result.curve[1]!.survivors,
        curveTwoGenerators: result.curve[2]!.survivors,
        b4Survivors: result.b4Survivors,
        f4Survivors: result.f4Survivors,
        b4LineGroupOrder: result.b4LineGroupOrder,
        f4LineGroupOrder: result.f4LineGroupOrder,
      },
      control: {
        // conservation alone gives 10395 (not 1), and partial symmetry gives 75 then 3 (not
        // 1), so the full B4 is load-bearing; and the F4 over-constraint gives 0, the honest
        // limit of how symmetric a collision law can be
        conservationOnlySurvivors: result.curve[0]!.survivors,
        oneGeneratorSurvivors: result.curve[1]!.survivors,
        f4Survivors: result.f4Survivors,
      },
      notes:
        'the committed headOnRotate rotates a zero-momentum head-on pair (both slots of a line carrying the same tone) to a paired empty line, conserving charge and 4-momentum and being its own inverse. The 10395 = 11!! matchings are the family by conservation. The forcing is reported as a CURVE (invariance under the first k B4 generators: 10395, 75, 3, 3, 1) so the uniqueness is shown to need the full symmetry, not a single lucky constraint. The generators are VERIFIED to generate the order-192 image of B4 on the lines (the order-384 signed-permutation group modulo the central minus one that fixes every unordered line). The honest correction to the earlier version: the full F4 symmetry (order 1152, image 576, B4 plus the triality reflections built from the F4 roots) leaves ZERO invariant matchings, so the knit is NOT F4-symmetric, it respects the crystallographic B4 but breaks triality. That is expected, a specific collision law cannot be invariant under the triality that permutes the three generations, so triality is broken by the dynamics, not by the substrate. Reuses code/measure/collision-family.',
    })
  },
})
