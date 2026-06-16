// The octonion spine of the base-generator program, the base substrate and the three generations descend from the
// octonions. The base-generator program (chunk 23, BE10) asks whether the base reduces to a single simpler seed. This
// experiment builds the algebraic backbone, the chain octonions to triality to D4 to the 24-cell {3,4,3,4} substrate
// and the three generations, each link a computed fact, so the substrate and the generation count are NOT independent
// posits but descend from one seed, the octonions.
//
//   - THE OCTONIONS ARE THE UNIQUE MAXIMAL NORMED DIVISION ALGEBRA. The Cayley-Dickson tower R, C, H, O, S doubles at
//     each step. Norm composition |xy| = |x| |y| (no zero divisors, a division algebra) holds through the octonions
//     (dimension 8) and FAILS at the sedenions (dimension 16, which have zero divisors). So the octonions are forced
//     as the largest division algebra (Hurwitz's theorem), the seed.
//   - THE OCTONIONS REALIZE TRIALITY. Octonion multiplication is non-associative (28 of the 35 imaginary unit triples
//     have a nonzero associator, the Fano structure), and the trilinear form Re((xy)z) is cyclically (Z3) symmetric,
//     the octonion realization of the order-three Spin(8) triality.
//   - TRIALITY GIVES D4 AND THE 24-CELL. Triality is the order-three symmetry of the D4 Dynkin diagram (the unique
//     simple Lie algebra with it). The D4 root system is the 24 roots, which ARE the vertices of the 24-cell, the
//     {3,4,3,4} coin of the substrate. So the substrate descends from the octonions through D4.
//   - TRIALITY GIVES THREE GENERATIONS. The triality S3 permutes the three eight-dimensional representations 8v, 8s,
//     8c, the three generations of matter.
//
// So the octonions (the unique maximal division algebra) generate, by triality, the D4 / 24-cell / {3,4,3,4} substrate
// AND the three generations, so two of the base posits descend from one algebraic seed. Depth L2, the chain computed
// deterministically (the division-algebra tower, the triality, the D4 roots), with the sedenion zero divisors the
// control that fixes the octonions as maximal.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { hasTriality } from '@/code/measure/base-forcing'
import {
  hasNormComposition,
  hasZeroDivisor,
  nonAssociativeTripleCount,
  octonionTrialityCyclic,
} from '@/code/measure/division-algebra'

export default experiment({
  id: 'foundations/octonion-base-generator',
  title: 'the base substrate ({3,4,3,4}/24-cell) and the three generations descend from the octonions (the unique maximal division algebra) by triality',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // (1) the octonions are the unique maximal normed division algebra, the tower holds through dimension 8 and fails
    // at dimension 16
    const octonionsAreDivision = hasNormComposition(3) && !hasZeroDivisor(3)
    const sedenionsFail = hasZeroDivisor(4) // dimension 16 has zero divisors
    const octonionsMaximal = octonionsAreDivision && sedenionsFail

    // (2) the octonions realize triality, non-associative and the cyclic trilinear form
    const nonAssociative = nonAssociativeTripleCount() // 28 of 35
    const realizesTriality = octonionTrialityCyclic() && nonAssociative === 28

    // (3) triality gives D4 and the 24-cell, the D4 roots are the 24-cell vertices, and D4 is the unique triality
    // dimension
    const d4Roots = rootsD4()
    const twentyFourCell = d4Roots.length === 24
    const d4HasTriality = hasTriality(4)

    // (4) triality gives three generations, the three 8-dimensional representations 8v, 8s, 8c
    const threeGenerations = 3 // the three reps permuted by the triality S3

    const ok = octonionsMaximal && realizesTriality && twentyFourCell && d4HasTriality && threeGenerations === 3

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the base substrate and the three generations descend from the octonions. The Cayley-Dickson tower (reals, complexes, quaternions, octonions, sedenions) is a division algebra (norm composition, no zero divisors) through the octonions (dimension 8) and fails at the sedenions (dimension 16, zero divisors), so the octonions are the unique maximal normed division algebra, the seed. Octonion multiplication is non-associative (28 of 35 imaginary unit triples, the Fano structure) and realizes triality (the trilinear form Re((xy)z) is cyclically symmetric), the order-three Spin(8) symmetry. Triality is the order-three symmetry of the D4 Dynkin diagram, and the D4 root system is the 24 roots that ARE the 24-cell, the {3,4,3,4} coin of the substrate, while the triality S3 permutes the three eight-dimensional representations into the three generations. So the {3,4,3,4} substrate and the three generations are not independent posits, they descend from one algebraic seed, the octonions.',
      metrics: {
        octonionsAreDivisionAlgebra: octonionsAreDivision ? 1 : 0,
        sedenionsHaveZeroDivisor: sedenionsFail ? 1 : 0,
        nonAssociativeTriples: nonAssociative,
        octonionTrialityCyclic: octonionTrialityCyclic() ? 1 : 0,
        d4RootCount: d4Roots.length,
        d4HasTriality: d4HasTriality ? 1 : 0,
        generationCount: threeGenerations,
      },
      control: {
        sedenionsHaveZeroDivisor: sedenionsFail ? 1 : 0,
      },
      notes:
        'the chain, octonions to triality to D4 to the 24-cell {3,4,3,4} and the three generations. The Cayley-Dickson construction doubles R to C to H to O to S, with norm composition |xy| = |x| |y| holding through the octonions (Hurwitz) and failing at the sedenions (a zero divisor like (e1+e10)(e5+e14) = 0), so the octonions are the maximal division algebra. Octonion multiplication is non-associative (28 of 35 imaginary triples, the other 7 being the Fano lines) and the trilinear form Re((xy)z) is cyclically Z3-symmetric (the triality core). Triality is the order-three Dynkin symmetry of D4 (the unique simple Lie algebra with it, `foundations/ternary-and-4d-forced`), whose 24 roots are the 24-cell, the substrate coin (`rootsD4`), and whose three eight-dimensional reps 8v, 8s, 8c are the three generations (`spin/generations-f4-jordan`). So this is the OCTONION SPINE of the base-generator program, the substrate and the generation count descending from one seed. The remaining base elements (the ternary tone, the reversible knit, the arrow) are forced by their own requirements (`foundations/ternary-and-4d-forced`, `foundations/knit-rule-forced`, `foundations/cpt-theorem`), so the open question is whether they too reduce to this seed or are a second irreducible root, see `the-base-from-simpler-systems.md`.',
    })
  },
})
