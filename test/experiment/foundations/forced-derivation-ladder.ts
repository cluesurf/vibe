// From nothing to the mesh, as one executable derivation, kept current with the latest
// results. This is the register-one spine run as code: seven rungs, each a uniqueness fact
// recomputed by enumerating its candidate space and counting the survivors, so the canonical
// numbers (3, 8, 24, 81, 10395, the growth ratio) come OUT of the computation rather than
// being asserted. The capstone (foundations/capstone) runs the model's DYNAMICS end to end.
// This runs the timeless SPEC: the forced chain that fixes the equipment, before any beat
// ticks.
//
// The seven rungs, each with its candidate space and its survivor, at the current state of
// the derivation:
//   1 tone     over EVERY subset of {-2..2}, the ones with a vacuum and a mirror, the
//              minimal is size three, the ternary tone (exhaustive, not a curated list).
//   2 arrow    over the division tower, a level is orderable when no basis unit squares
//              negative, COMPUTED from the real Cayley-Dickson products at every level,
//              and only level zero (the line) survives, so counting is one-way.
//   4 eight    the pinch, both bounds now theorems: reversibility (no zero divisors,
//              computed) caps the tower at dimension eight, and TRIALITY (the order-three
//              Dynkin symmetry, computed, unique to D4 whose vector dimension is eight)
//              floors it there, retiring the maximal-differentiation premise (E-FND-0050).
//   5 census   the 81 four-slot words partition exactly as 1 + 8 + 24 + 32 + 16.
//   6 cell     among the stepping shells only the 24 is self-dual, with corners and faces
//              DERIVED by facet enumeration, not a table; spin confirms the winner (the
//              16-cell is also spinful, so self-duality is the isolating filter).
//   7 mesh     the {3,4,3,4} shell counts, unfolded from the real graph, grow with the
//              outer ratio in a tight band around the warp factor, whose exact value is
//              the largest root of x^3 - 21 x^2 + 51 x - 23 (E-GMT-0031).
//   8 law      the 10395 line-pairings collapse to exactly ONE under the crystallographic
//              B4 symmetry. The full F4 admits none, B4 is the maximal symmetry any law
//              can have (exhaustive stabilizer scan, E-FND-0059), and the triality the law
//              cannot keep reappears as the three generations, the coset index
//              [F4:B4] = 3 (E-FND-0054).
// Downstream of the ladder, the wake is forced too: a reversible law on a fixed finite
// mesh recurs (Poincare), so unbounded accumulation of distinction requires growth
// (E-FND-0055), and reversibility itself is the seed restated (a difference cannot vanish
// means no two states merge, which is injectivity, E-FND-0060).
//
// THE HONEST RESIDUAL LEAP MAP, what the chain still takes rather than derives:
//   - the seed itself, that anything exists (irreducible by design), and its least-content
//     reading (among qualifying alphabets, take the smallest).
//   - that a site can be empty and every charge has an opposite (the vacuum and the mirror).
//   - that distinctions COMBINE at all (a structure, not a heap), and that combining is a
//     binary product with two-sided division.
//   - the real-completion step: the computed facts (squares, zero divisors) are integer
//     exact, but the COMPLETENESS of the division-algebra list (only 1, 2, 4, 8) is
//     Hurwitz's theorem over the real numbers, cited, a continuum scaffold under a discrete
//     base.
//   - that geometric composition must associate (selects the quaternion core as space).
//   - that the nearest-neighbour cloud is the ternary word cloud (directions identified
//     with tone words).
//   - the TILING CHOICE: the 24-cell tiles flat four-space too (the honeycomb {3,4,3,3},
//     three cells around each face, the Voronoi tiling of D4, which is exactly the flat
//     d4Mesh control used across the suite). Choosing the hyperbolic {3,4,3,4} (four
//     around each face) is a premise, motivated by the exponential room, the boundary
//     (cusp) observers need, the holographic bound, and the spectral gap, all MEASURED
//     differentiators (E-HLG-0032, E-FND-0058, E-GRV-0050) but not yet a derivation. The
//     older claim that the 24-cell does not fit flat space was wrong and is retired.
//   - the law's minimal-support ansatz (the head-on pair rotation family of 10395).
//   - the valence reading of the tone (interpretive, outside physics).
//
// CONTROL: the forcing is real only if RELAXING a rung's constraint restores
// non-uniqueness. Relaxing rung one (drop the mirror, keep the vacuum) collapses the
// minimal alphabet from three to one, so the mirror is load-bearing. The exact totals
// (81, 10395, the shell integers) are enumeration self-checks a wrong candidate space
// would miss.
//
// Grade L1: every rung is known mathematics confirmed by exhaustive computation, and the
// contribution is the ASSEMBLY, the whole forced chain recomputed in one runnable object
// with the survivor counts and the leap map stated. It reuses the library rung machinery
// (base-forcing, division-algebra, cell-forcing, collision-family, mesh-unfolding).

import {
  forcedLadder,
  octonionNonassociativeTriples,
} from '@/code/measure/forced-ladder'
import {
  minimalQualifyingAlphabetSize,
  minimalVacuumOnlySize,
} from '@/code/measure/base-forcing'
import {
  unfoldMeshShells,
  CANONICAL_SHELLS,
} from '@/code/substrate/mesh-unfolding'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'foundations/forced-derivation-ladder',
  code: 'E-FND-0043',
  title:
    'the from-nothing derivation run as one chain, current: seven rungs (tone, arrow, eight, census, cell, mesh, law) each recompute their canonical number by exhaustive enumeration, with the arrow squares computed, the dimension-eight floor forced by triality, the cell faces derived, the law forced to exactly one by the crystallographic B4, and the honest residual leap map (the hyperbolic tiling choice over the flat {3,4,3,3} included) stated rather than glossed',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    // rung seven reads the {3,4,3,4} shell counts off the ACTUAL honeycomb graph, unfolded
    // here by reflective addressing, not from a hardcoded literal. Through shell three gives
    // 1, 24, 456, 8376, and it is cross-checked against the canonical sequence (the oracle).
    const bulkShellCounts = unfoldMeshShells({
      throughShell: 3,
      maxCells: 12000,
    })

    const shellCountsMatchCanonical =
      bulkShellCounts.length === 4 &&
      bulkShellCounts.every((v, i) => v === CANONICAL_SHELLS[i])

    const rungs = forcedLadder({ shellCounts: bulkShellCounts })

    // 1. every rung is forced (unique survivor, or exact census, or the tight growth band)
    const allForced = rungs.every(r => r.forced)

    // 2. the canonical numbers come out right, read from the rung records
    const by = (name: string): (typeof rungs)[number] =>
      rungs.find(r => r.name === name)!

    const toneIsThree = by('tone').produces === 3
    const eightIsEight = by('eight').produces === 8
    const censusIsTwentyFour = by('census').produces === 24
    const cellIsTwentyFour = by('cell').produces === 24
    const lawCandidatesAre10395 = by('law').candidates === 10395
    // the law is forced to exactly ONE by the crystallographic B4 (the tight gate)
    const lawIsUnique = by('law').survivors === 1
    // the outer shell ratio sits in a tight band around the warp factor 18.2787 (the exact
    // cubic surd of E-GMT-0031), measured from the unfolded graph
    const meshRatio = by('mesh').produces
    const meshGrowsExponentially = meshRatio > 15 && meshRatio < 20

    const numbersEmerge =
      toneIsThree &&
      eightIsEight &&
      censusIsTwentyFour &&
      cellIsTwentyFour &&
      lawCandidatesAre10395 &&
      lawIsUnique &&
      meshGrowsExponentially

    // 3. the octonion non-associativity is the exact 28 (of 35 imaginary triples), the
    // last luxury shed, a further exact enumeration on the pinch rung
    const nonassociativeTriples = octonionNonassociativeTriples()
    const nonassociativityExact = nonassociativeTriples === 28

    // 4. the control: relaxing rung one (vacuum only, no mirror) collapses the minimal
    // alphabet to size one, so the mirror requirement is what forces the three. Both sizes
    // come from the exhaustive enumeration over {-3..3}.
    const relaxedMinimal = minimalVacuumOnlySize(3)
    const strictMinimal = minimalQualifyingAlphabetSize()
    const mirrorIsLoadBearing =
      strictMinimal === 3 && relaxedMinimal === 1

    const solved =
      allForced &&
      numbersEmerge &&
      nonassociativityExact &&
      mirrorIsLoadBearing &&
      shellCountsMatchCanonical

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the from-nothing derivation runs end to end as one computation, current with the latest results: the ternary three from the exhaustive vacuum-and-mirror enumeration, the ordered line as the one-way arrow with every basis square computed from the real Cayley-Dickson products, dimension eight pinched by two theorems (the reversibility ceiling and the triality floor, no maximal-differentiation premise), the exact 1 + 8 + 24 + 32 + 16 = 81 census, the 24-cell selected by self-duality with corners and faces derived by facet enumeration, the {3,4,3,4} growth in a tight band around the warp factor whose exact value is the largest root of x^3 - 21 x^2 + 51 x - 23, and the 10395 line-pairings collapsing to exactly ONE law under the crystallographic B4, whose unreachable triality is the three generations (the coset index three). The octonion non-associativity is the exact 28 of 35 triples, and dropping the mirror collapses the alphabet to one, the control. The residual premises are stated as a leap map in the file rather than glossed, including the genuine tiling choice between the flat {3,4,3,3} and the hyperbolic {3,4,3,4}, which the older too-wide-for-flat-space claim mis-stated.',
      metrics: {
        rungsForced: rungs.filter(r => r.forced).length,
        rungCount: rungs.length,
        tone: by('tone').produces,
        arrowSurvivors: by('arrow').survivors,
        eight: by('eight').produces,
        census81: by('census').candidates,
        cell24: by('cell').produces,
        lawCandidates10395: by('law').candidates,
        lawSurvivors: by('law').survivors,
        meshGrowthRatio: by('mesh').produces,
        octonionNonassociativeTriples: nonassociativeTriples,
        strictMinimalAlphabet: strictMinimal,
        shellCountsMatchCanonical: shellCountsMatchCanonical ? 1 : 0,
      },
      control: {
        // relaxing rung one (vacuum only, no mirror) drops the minimal alphabet to 1,
        // so the mirror requirement is load-bearing and the ternary three is forced,
        // not chosen
        relaxedMinimalAlphabet: relaxedMinimal,
        strictMinimalAlphabet: strictMinimal,
      },
      notes:
        'L1, the executable assembly of the from-nothing derivation, every rung recomputed from its candidate space by the reused library (base-forcing exhaustive alphabets, division-algebra Cayley-Dickson squares and zero divisors, cell-forcing derived facets, collision-family pairings, mesh-unfolding shells). Updated to the latest thinking after the audit: the arrow rung now COMPUTES every basis square instead of restating the answer, the dimension-eight floor is the computed triality uniqueness (E-FND-0050) instead of the vector-equals-spinor coincidence, the law gate is exactly one survivor under B4 with the F4-admits-none and B4-maximality facts in E-FND-0059 and the generation index in E-FND-0054, the wake is forced by recurrence escape (E-FND-0055), and reversibility is the seed restated (E-FND-0060). The header carries the honest residual leap map, most notably the hyperbolic tiling choice: the 24-cell also tiles flat four-space as {3,4,3,3} (the flat d4Mesh control itself), so taking {3,4,3,4} is a premise whose measured differentiators are the holographic bound, the cusp stability, and the spectral gap, not yet a derivation. Rung zero (nothing cannot be) is the one non-computational step, the seed, and is not coded.',
    })
  },
})
