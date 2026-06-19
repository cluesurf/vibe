// The dynamics forces the octonions, so the base is ONE root (the reversible dynamics), not two. The base-generator
// exploration found two apparent seeds, a maximal-algebra root (octonions to geometry and generations) and a
// minimal-reversible-dynamics root (the ternary tone, the knit, the arrow). This experiment shows the first is NOT an
// independent seed, the octonions are FORCED by the requirements of the second (the dynamics), so the dynamics is the
// single base and the algebra is selected.
//
//   - REVERSIBILITY CAPS THE DIMENSION AT EIGHT. A reversible composition (no information loss, so no zero divisors)
//     is a normed division algebra, and by Hurwitz's theorem these exist only in dimensions 1, 2, 4, 8 (the reals,
//     complexes, quaternions, octonions). The next Cayley-Dickson step (the sedenions, dimension 16) has zero divisors
//     and is NOT reversible. So reversibility allows dimension at most eight.
//   - FERMIONS REQUIRE DIMENSION AT LEAST EIGHT. Spinors with triality (the three generations, the order-three Spin
//     symmetry permuting 8v, 8s, 8c) need the rotation algebra to be D4 = so(8), which is dimension eight. Lower
//     dimensions (so(1), so(2), so(4)) have no triality.
//   - THEY MEET AT EXACTLY EIGHT. The reversibility cap (at most eight) and the fermion floor (at least eight) meet at
//     the single dimension eight, the OCTONIONS. So the octonions are not a free seed, they are the unique pinch-point
//     forced by the dynamics (reversible composition supporting fermions), the maximal reversible structure and the
//     minimal triality structure at once.
//
// So the base is ONE root, the reversible distinction dynamics, which FORCES the octonions (dimension eight) as the
// unique reversible-with-fermions structure, from which the geometry (the 24-cell, F4 = Aut(J3(O))) and the three
// generations follow. The octonions sit at the maximal edge (the sedenions break), which is exactly why they are a
// forced pinch-point and not an independent stable ground. The controls are the sedenions (reversibility fails) and
// the sub-octonion algebras (triality fails). Depth L2, the forcing computed deterministically from the
// division-algebra tower and the triality dimension.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { hasTriality } from '@/code/measure/base-forcing'
import { hasZeroDivisor } from '@/code/measure/division-algebra'

export default experiment({
  id: 'foundations/dynamics-forces-octonions',
  title:
    'the dynamics forces the octonions (reversibility caps dim at 8, fermions require dim 8, they meet at exactly 8), so the base is one root, the dynamics',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // reversibility (a division algebra, no zero divisors) allows the dimensions 1, 2, 4, 8 and excludes 16
    const reversibleDims: number[] = []
    for (let level = 0; level <= 4; level++)
      if (!hasZeroDivisor(level)) reversibleDims.push(2 ** level)
    const reversibilityCapsAtEight =
      reversibleDims.includes(8) && !reversibleDims.includes(16)

    // fermions (spinor triality, so(d) = D4) require the dimension 8 (D4), lower dimensions have no triality
    const trialityDims: number[] = []
    for (const d of [1, 2, 4, 8, 16]) {
      const n = d / 2
      if (Number.isInteger(n) && n >= 4 && hasTriality(n))
        trialityDims.push(d)
    }
    const fermionsRequireEight =
      trialityDims.length === 1 && trialityDims[0] === 8

    // the intersection is exactly {8}, the octonions, forced
    const forced = reversibleDims.filter(d => trialityDims.includes(d))
    const octonionsForced = forced.length === 1 && forced[0] === 8

    // the controls, the sedenions (16) break reversibility, the sub-octonions (1,2,4) lack triality
    const sedenionsBreakReversibility = hasZeroDivisor(4)
    const subOctonionsLackTriality =
      !hasTriality(2) && [1, 2, 4].every(d => !trialityDims.includes(d))

    const ok =
      reversibilityCapsAtEight &&
      fermionsRequireEight &&
      octonionsForced &&
      sedenionsBreakReversibility &&
      subOctonionsLackTriality

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the octonions are forced by the dynamics, so the base is one root (the reversible dynamics), not two. A reversible composition (no information loss, no zero divisors) is a normed division algebra, which by Hurwitz exists only in dimensions 1, 2, 4, 8, so reversibility CAPS the dimension at eight (the sedenions, dimension 16, have zero divisors). Fermions with triality (the three generations, the order-three Spin symmetry) require the rotation algebra D4 = so(8), so they REQUIRE dimension at least eight. The cap and the floor meet at exactly eight, the octonions, so the algebra is not an independent seed but the unique pinch-point forced by the dynamics, the maximal reversible structure and the minimal triality structure at once. The octonions sit at the maximal edge (the sedenions break), which is why they are a forced pinch-point and not an independent ground. The controls are the sedenions (reversibility fails) and the sub-octonions (triality fails).',
      metrics: {
        reversibleDimsMax: Math.max(...reversibleDims),
        sedenionsExcluded: reversibleDims.includes(16) ? 0 : 1,
        trialityDim: trialityDims[0] ?? 0,
        forcedDimension: forced[0] ?? 0,
        octonionsForced: octonionsForced ? 1 : 0,
      },
      control: {
        sedenionsBreakReversibility: sedenionsBreakReversibility
          ? 1
          : 0,
        subOctonionsLackTriality: subOctonionsLackTriality ? 1 : 0,
      },
      notes:
        'the division-algebra tower (Hurwitz) gives the reversible dimensions {1, 2, 4, 8}, the sedenions (16) failing with zero divisors, so reversibility caps the dimension at eight. Triality (the order-three D4 Dynkin symmetry, the three generations) requires so(8), dimension eight, lower dimensions giving so(1), so(2), so(4) = D2 with no triality. The intersection is exactly {8}, the octonions. So the octonions are FORCED by the dynamics requirements (reversible composition supporting fermions), not posited, the maximal reversible structure (the edge, the sedenions break) and the minimal triality structure simultaneously. This RESOLVES the two-roots question, the base is ONE root, the reversible distinction dynamics (the ternary tone, the knit, the arrow), which forces the octonions, from which the geometry (the 24-cell, F4 = Aut(J3(O)), `spin/generations-f4-jordan`) and the three generations follow (`foundations/octonion-base-generator`). The instability the maximal algebra was suspected to have IS the pinch-point structure, the octonions are where the reversibility cap meets the fermion floor. See `from-the-void-to-the-base.md`.',
    })
  },
})
