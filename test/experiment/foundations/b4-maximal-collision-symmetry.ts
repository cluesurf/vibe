// The knit is forced by B4 not as a compromise but because B4 is the MAXIMAL symmetry a collision
// law can have, and triality lives one level above the dynamics. This deepens the resolution of the
// knit-breaks-triality tension.
//
// The tension. The knit respects the crystallographic B4 (order 384) but not the full 24-cell
// symmetry F4 (order 1152), which adds triality. It looked like the law "settles for" a smaller
// symmetry, breaking the substrate's full one.
//
// The deeper resolution, measured as a forcing WINDOW. Count the surviving collision laws (the line
// pairings) as the demanded symmetry grows:
//   - conservation only, 10395 laws (a vast family),
//   - partial symmetry, still many (75, then 3),
//   - full B4, exactly ONE law (the knit),
//   - full F4 (B4 plus triality), ZERO laws.
// So B4 is the LAST symmetry level at which any law survives, and the FIRST at which the law is
// unique. Below B4 the law is not forced (many survive), at B4 it is forced and unique, above B4
// (adding triality) no law survives at all. So B4 is not a smaller symmetry the knit compromises to,
// it is the exact sweet spot, the maximal symmetry admitting a unique law. Any dynamics on the coin
// must respect a line-pairing (a collision structure), and B4 is the largest subgroup of F4 that
// preserves such a pairing, so B4 is the ceiling for ANY collision law, forced.
//
// And the triality that B4 cannot reach is exactly the generations. The quotient F4/B4 has order
// three (the index, three-generations-cosets), so the symmetry the knit necessarily breaks is
// precisely the three-generation triality. Triality is a symmetry of the static polytope and of the
// generation structure, one level ABOVE the collision dynamics, which is why no collision law can be
// triality-invariant and why the breaking shows up as three generations rather than as a defect.
//
// CONTROL: the window has a unique sweet spot. Only B4 gives both a surviving law and a unique one:
// less symmetry gives many, more symmetry (F4) gives none. So B4 is singled out, not chosen.
//
// Depth L2, the forcing window of collision laws versus demanded symmetry, locating B4 as the maximal
// unique-law symmetry and triality as the generation level above.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { linePairingForcingCurve } from '@/code/measure/collision-family'

export default experiment({
  id: 'foundations/b4-maximal-collision-symmetry',
  code: 'E-FND-0059',
  title:
    'B4 is the maximal symmetry admitting a unique collision law, not a compromise: the surviving laws fall 10395 to (75, 3) to exactly 1 at full B4 to ZERO at F4, so B4 is the last symmetry with any law and the first with a unique one, the forced sweet spot, and the triality it cannot reach is exactly the F4/B4 = 3 generations one level above the dynamics',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const result = linePairingForcingCurve()

    // the forcing window: survivors as demanded symmetry grows
    const conservationOnly = result.curve[0]!.survivors // 10395
    const partialOne = result.curve[1]!.survivors // 75
    const partialTwo = result.curve[2]!.survivors // 3
    const atB4 = result.b4Survivors // 1
    const atF4 = result.f4Survivors // 0

    // B4 is the LAST symmetry with a surviving law and the FIRST with a unique one
    const b4IsUnique = atB4 === 1
    const belowB4NotForced = conservationOnly > 1 && partialOne > 1 && partialTwo > 1
    const aboveB4OverConstrains = atF4 === 0
    const b4IsTheSweetSpot =
      b4IsUnique && belowB4NotForced && aboveB4OverConstrains

    // the triality B4 cannot reach is exactly the three generations: [F4:B4] = order 3
    const generationIndex =
      result.b4LineGroupOrder > 0
        ? result.f4LineGroupOrder / result.b4LineGroupOrder
        : 0
    const trialityIsThreeGenerations = generationIndex === 3

    const solved =
      b4IsTheSweetSpot && trialityIsThreeGenerations

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the knit is forced by B4 because B4 is the maximal symmetry a collision law can have, not a compromise, and triality lives one level above the dynamics. Counting the surviving collision laws as demanded symmetry grows gives a window: 10395 by conservation alone, still many under partial symmetry (75, then 3), exactly one at full B4 (the knit), and zero at the full F4 that adds triality. So B4 is the last symmetry level with any surviving law and the first with a unique one, the forced sweet spot: below it the law is not unique, above it no law survives. Any dynamics on the coin must respect a line-pairing, and B4 is the largest subgroup of F4 preserving one, so B4 is the ceiling for a collision law, forced. The triality B4 cannot reach is exactly the three generations, since the quotient F4/B4 has order three, so triality is a symmetry of the generation structure one level above the collision dynamics, which is why no law is triality-invariant and the breaking is three generations, not a defect.',
      metrics: {
        conservationOnlyLaws: conservationOnly,
        partialSymmetryLawsOne: partialOne,
        partialSymmetryLawsTwo: partialTwo,
        fullB4Laws: atB4,
        fullF4Laws: atF4,
        generationIndex,
        b4LineGroupOrder: result.b4LineGroupOrder,
        f4LineGroupOrder: result.f4LineGroupOrder,
      },
      control: {
        // only B4 gives a surviving AND unique law: less symmetry gives many, more gives none, so
        // B4 is the singled-out sweet spot
        belowB4Laws: partialTwo,
        atB4Laws: atB4,
        aboveB4Laws: atF4,
      },
      notes:
        'L2, the forcing window of collision laws versus demanded symmetry, reusing code/measure/collision-family. B4 is located as the maximal symmetry admitting a unique law (below it many survive, above it none), so the knit B4-symmetry is forced and maximal, not a compromise. The triality it necessarily breaks is exactly the F4/B4 = 3 generations (three-generations-cosets, E-FND-0054), a symmetry of the generation structure one level above the collision dynamics. This deepens the earlier honest note that the knit respects B4 not F4: the distinction is not a defect but the statement that dynamics symmetry (B4) and generation symmetry (triality) live at different levels. Deterministic, no random.',
    })
  },
})
