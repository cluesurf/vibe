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
import {
  linePairingForcingCurve,
  maxMatchingStabilizer,
} from '@/code/measure/collision-family'

export default experiment({
  id: 'foundations/b4-maximal-collision-symmetry',
  code: 'E-FND-0059',
  title:
    'B4 is the maximal symmetry of ANY collision law, proven by exhaustive stabilizer scan: over all 10395 laws the maximum stabilizer in F4 is exactly the B4 image (order 192), attained by exactly THREE laws, the knit and its two triality images, one per generation frame, while the forcing window falls 10395 to (75, 3) to 1 at B4 to ZERO at F4, so B4 is the forced sweet spot and choosing the knit is choosing a generation frame',
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
    const belowB4NotForced =
      conservationOnly > 1 && partialOne > 1 && partialTwo > 1

    const aboveB4OverConstrains = atF4 === 0
    const b4IsTheSweetSpot =
      b4IsUnique && belowB4NotForced && aboveB4OverConstrains

    // the exhaustive maximality scan: over ALL 10395 laws, the maximum stabilizer inside the
    // F4 image is exactly the B4 image order 192, so no law anywhere is more symmetric than
    // the knit, not even under some other subgroup that does not contain B4. Exactly three
    // laws attain the maximum, the knit and its two triality images (orbit-stabilizer,
    // 576 / 192 = 3), one per conjugate B4, one per generation frame.
    const scan = maxMatchingStabilizer()
    const noLawMoreSymmetric = scan.maxStabilizerOrder === 192
    const maxAttainedByTrialityOrbit = scan.lawsAttainingMax === 3
    const knitAttainsTheMax = scan.maxIsTheKnit

    // the triality B4 cannot reach is exactly the three generations: [F4:B4] = order 3
    const generationIndex =
      result.b4LineGroupOrder > 0
        ? result.f4LineGroupOrder / result.b4LineGroupOrder
        : 0

    const trialityIsThreeGenerations = generationIndex === 3

    const solved =
      b4IsTheSweetSpot &&
      trialityIsThreeGenerations &&
      noLawMoreSymmetric &&
      maxAttainedByTrialityOrbit &&
      knitAttainsTheMax

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'B4 is the maximal symmetry of ANY collision law, proven exhaustively, and triality lives one level above the dynamics. The forcing window: 10395 laws by conservation alone, still many under partial symmetry (75, then 3), exactly one at full B4 (the knit), and zero at the full F4 that adds triality. And the stabilizer scan over ALL 10395 laws shows the maximum stabilizer inside the F4 image is exactly the B4 image, order 192, so no law anywhere is more symmetric, not even under a subgroup that does not contain B4. Exactly three laws attain that maximum, the knit and its two triality images, one per conjugate B4, one per generation frame (orbit-stabilizer, 576 over 192 is 3, the same 3 as the coset index), so choosing the knit is choosing a generation frame, and the triality the law cannot keep is exactly the three generations. For subgroups containing B4 the scan is not even needed, the index 3 is prime, so nothing sits properly between B4 and F4.',
      metrics: {
        conservationOnlyLaws: conservationOnly,
        partialSymmetryLawsOne: partialOne,
        partialSymmetryLawsTwo: partialTwo,
        fullB4Laws: atB4,
        fullF4Laws: atF4,
        generationIndex,
        maxStabilizerOrder: scan.maxStabilizerOrder,
        lawsAttainingMax: scan.lawsAttainingMax,
        knitAttainsTheMax: knitAttainsTheMax ? 1 : 0,
        b4LineGroupOrder: result.b4LineGroupOrder,
        f4LineGroupOrder: result.f4LineGroupOrder,
      },
      control: {
        // less symmetry gives many laws, more gives none, and the exhaustive scan caps every law
        // at stabilizer 192, so B4 is the singled-out ceiling, not a choice
        belowB4Laws: partialTwo,
        atB4Laws: atB4,
        aboveB4Laws: atF4,
        maxStabilizerOverAllLaws: scan.maxStabilizerOrder,
      },
      notes:
        'L2, the forcing window plus the exhaustive stabilizer scan, reusing code/measure/collision-family. The scan closes the gap the endpoints left open: it was conceivable some other law had a large stabilizer under a subgroup not containing B4 (an order-288 subgroup, say), and the scan rules it out, the maximum over all 10395 laws is 192, attained by exactly the three laws of the knit triality orbit. That the count of maximal laws (3) equals the coset index [F4:B4] (3, three-generations-cosets E-FND-0054) is orbit-stabilizer, and it makes the generation story concrete: the three maximally-symmetric laws are the three generation frames, triality permutes them, and a universe running one knit has spontaneously picked one frame. Dynamics symmetry (B4) and generation symmetry (triality) live at different levels, which is why no law is triality-invariant and the breaking is three generations, not a defect. Deterministic, no random.',
    })
  },
})
