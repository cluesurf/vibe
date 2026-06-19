// Are the ternary tone and the four dimensions forced (BE4, BE5). The base posits a ternary tone {-1, 0, +1} on a 4D
// {3,4,3,4} substrate. This experiment shows each is forced by a short, natural requirement, so they are not arbitrary
// choices.
//
//   - THE TERNARY TONE IS FORCED. The tone must support a vacuum (a zero, so a cell can be empty) AND charge
//     conjugation (a sign-flip symmetry, so the +1 and -1 charges are mirror images). Binary {0, 1} has a vacuum but
//     no charge conjugation (no negative). The signs {-1, +1} have charge conjugation but no vacuum. The minimal
//     alphabet with BOTH is ternary {-1, 0, +1}, so a tone that can be absent and can be charge-conjugated is forced
//     to be ternary.
//   - THE FOUR DIMENSIONS ARE FORCED BY TRIALITY. The substrate is the D4 root system (the 24-cell). D4 is the UNIQUE
//     simple Lie algebra whose Dynkin diagram has an order-three symmetry (triality, the S3 permuting the three outer
//     nodes), which permutes the three eight-dimensional representations 8v, 8s, 8c, the three generations of matter.
//     For D_n with n not equal to four the diagram has only a Z2 (no order-three element). So triality, and the three
//     generations it gives, exist only in four dimensions.
//   - THE CONTROLS. Binary (no charge conjugation) and the signs (no vacuum) are the controls for the tone, and D5,
//     D6, D7 (Dynkin automorphism order two, no triality) are the controls for the dimension.
//
// So the ternary tone is the minimal one with a vacuum and charge conjugation, and four dimensions is the unique one
// with triality (the three generations), each base choice forced by a natural requirement. Depth L2, the alphabet and
// the Dynkin symmetries enumerated deterministically, with the non-qualifying alphabets and the triality-free D_n the
// controls.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  dynkinAutomorphismOrder,
  hasTriality,
  minimalQualifyingAlphabetSize,
  toneAlphabetQualifies,
} from '@/code/measure/base-forcing'

export default experiment({
  id: 'foundations/ternary-and-4d-forced',
  title:
    'the ternary tone (minimal with a vacuum and charge conjugation) and the four dimensions (the unique triality D4) are forced',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the ternary tone is the minimal qualifying alphabet (a vacuum plus charge conjugation)
    const ternaryQualifies = toneAlphabetQualifies([-1, 0, 1])
    const binaryFails = !toneAlphabetQualifies([0, 1]) // no charge conjugation
    const signsFail = !toneAlphabetQualifies([-1, 1]) // no vacuum
    const minimalSize = minimalQualifyingAlphabetSize()
    const ternaryIsMinimal = minimalSize === 3

    // four dimensions is the unique one with triality (the D4 Dynkin order-three symmetry)
    const d4Order = dynkinAutomorphismOrder(4)
    const d4HasTriality = hasTriality(4)
    const higherDnNoTriality =
      !hasTriality(5) && !hasTriality(6) && !hasTriality(7)

    const fourDimensionsForced = d4HasTriality && higherDnNoTriality

    const ok =
      ternaryQualifies &&
      binaryFails &&
      signsFail &&
      ternaryIsMinimal &&
      fourDimensionsForced

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the ternary tone and the four dimensions are forced. The tone is the minimal alphabet with both a vacuum (a zero) and charge conjugation (a nontrivial sign flip), binary {0, 1} lacking charge conjugation and the signs {-1, +1} lacking a vacuum, so ternary {-1, 0, +1} is forced. The four dimensions are forced by triality, D4 is the unique simple Lie algebra whose Dynkin diagram has an order-three symmetry (the S3 permuting the three outer nodes, automorphism order six), which permutes the three eight-dimensional representations into the three generations, while D_n for n not four has only a Z2 (order two, no triality). So the base ternary-and-4D choice is forced by a vacuum-plus-charge-conjugation tone and a triality (three-generation) dimension.',
      metrics: {
        ternaryQualifies: ternaryQualifies ? 1 : 0,
        binaryFails: binaryFails ? 1 : 0,
        signsFail: signsFail ? 1 : 0,
        minimalAlphabetSize: minimalSize,
        d4DynkinAutomorphismOrder: d4Order,
        d5DynkinAutomorphismOrder: dynkinAutomorphismOrder(5),
        d6DynkinAutomorphismOrder: dynkinAutomorphismOrder(6),
        d4HasTriality: d4HasTriality ? 1 : 0,
      },
      control: {
        binaryFails: binaryFails ? 1 : 0,
        signsFail: signsFail ? 1 : 0,
        d5DynkinAutomorphismOrder: dynkinAutomorphismOrder(5),
      },
      notes:
        'the tone must support a vacuum (a cell can be empty, the zero) and charge conjugation (the +1 and -1 are mirror images under a nontrivial sign flip closing the alphabet). Binary {0, 1} fails (no negative), the signs {-1, +1} fail (no zero), and the minimal alphabet with both is ternary (size three). For the dimension, the substrate is the D4 root system (the 24-cell), and D4 is the unique simple Lie algebra with triality, its Dynkin diagram is the star with three outer nodes (automorphism group S3, order six), so the three eight-dimensional representations 8v, 8s, 8c are permuted by the order-three element, the three generations. D_n for n at least five has the chain-with-a-fork diagram (automorphism Z2, order two, no order-three element), so no triality and no three generations. So four dimensions is forced by demanding triality (three generations), the answer to BE4 (ternary) and BE5 (four dimensions). This complements `foundations/base-uniqueness-theorem` (the 24-cell unique) and `spin/generations-f4-jordan` (the three generations).',
    })
  },
})
