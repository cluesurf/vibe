// From nothing to the mesh, as one executable derivation. This is the register-one
// spine of primer/02-from-nothing-to-the-mesh-worked.md run as code: seven rungs, each
// a uniqueness fact recomputed by enumerating its candidate space and counting the
// survivors, so the canonical numbers (3, 8, 24, 81, the census, 10395, the growth
// ratio) come OUT of the computation rather than being asserted. The capstone
// (foundations/capstone) runs the model's DYNAMICS end to end. This runs the timeless
// SPEC: the forced chain that fixes the equipment, before any beat ticks.
//
// The seven rungs, each with its candidate space and its survivor:
//   1 tone     over small integer alphabets, the ones with a vacuum and a mirror, the
//              minimal is size three, the ternary tone.
//   2 arrow    over the division tower, only the ordered line survives (a square is
//              never negative, and i squared is minus one), so counting is one-way.
//   4 eight    the pinch: reversibility (no zero divisors) caps the tower at dimension
//              eight, and one substance (vector equals Weyl spinor) floors it at eight.
//   5 census   the 81 four-slot words partition exactly as 1 + 8 + 24 + 32 + 16,
//              isolating the 24 two-step diagonals.
//   6 cell     among the stepping shells only the 24 is self-dual (corners equal
//              faces) and it carries triality (the spinors), so it is the cell.
//   7 mesh     the {3,4,3,4} honeycomb shell counts grow exponentially (ratio near the
//              warp factor 18.25), the hyperbolic signature.
//   8 law      the 10395 line-pairings collapse under the full symmetry to a vanishing
//              remnant, the knit.
//
// CONTROL: the forcing is real only if RELAXING a rung's constraint restores
// non-uniqueness. We relax rung one (drop the mirror requirement, keeping only the
// vacuum) and show the minimal qualifying alphabet then falls to size one (the trivial
// {0}), so the mirror is load-bearing, the three is not free. The rung-eight candidate
// count (10395 exactly, the double factorial 11!!) and the census total (81 exactly)
// are themselves controls: a wrong enumeration would miss them.
//
// Grade L1: every rung is known mathematics confirmed by exhaustive computation, and
// the contribution is the ASSEMBLY, the whole forced chain recomputed in one runnable
// object with the survivor counts, honestly the executable form of the derivation, not
// a new physical result. It reuses the library rung machinery rather than re-deriving
// it (base-forcing, division-algebra, collision-family, shell-growth).

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
    'the from-nothing derivation run as one chain: seven rungs (tone, arrow, eight, census, cell, mesh, law) each recompute their canonical number by enumerating a candidate space and counting survivors, so 3, 8, 24, 81, 10395, and the growth ratio come out of the computation, and relaxing a rung restores non-uniqueness',
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

    // 1. every rung is forced (unique survivor, or exact census, or exponential growth)
    const allForced = rungs.every(r => r.forced)

    // 2. the canonical numbers come out right, read from the rung records
    const by = (name: string): (typeof rungs)[number] =>
      rungs.find(r => r.name === name)!

    const toneIsThree = by('tone').produces === 3
    const eightIsEight = by('eight').produces === 8
    const censusIsTwentyFour = by('census').produces === 24
    const cellIsTwentyFour = by('cell').produces === 24
    const lawCandidatesAre10395 = by('law').candidates === 10395
    // the outer shell ratio sits in a tight band around the 18.278 warp factor, not a loose
    // greater-than-ten, and it is measured from the unfolded graph
    const meshRatio = by('mesh').produces
    const meshGrowsExponentially = meshRatio > 15 && meshRatio < 20

    const numbersEmerge =
      toneIsThree &&
      eightIsEight &&
      censusIsTwentyFour &&
      cellIsTwentyFour &&
      lawCandidatesAre10395 &&
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
        'the from-nothing derivation runs end to end as one computation: over its candidate space each rung has a unique survivor (or an exact census), yielding the ternary three from the vacuum-and-mirror alphabets, the ordered line as the one-way arrow, dimension eight from the reversibility ceiling and the vector-equals-spinor floor, the exact 1 + 8 + 24 + 32 + 16 = 81 word census isolating the 24, the 24-cell as the unique self-dual triality-carrying shell, the exponential {3,4,3,4} growth (ratio near 18.25 from the measured shell counts), and the 10395 line-pairings cut by symmetry to the knit, with the octonion non-associativity the exact 28 of 35 triples, and relaxing rung one (dropping the mirror) collapses the minimal alphabet from three to one, so every canonical number is forced by its rung and none is a free input',
      metrics: {
        rungsForced: rungs.filter(r => r.forced).length,
        rungCount: rungs.length,
        tone: by('tone').produces,
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
        'L1, the executable assembly of the from-nothing derivation (primer/02), every rung recomputed from its candidate space by the reused library (base-forcing tone test, division-algebra Cayley-Dickson tower, collision-family line-pairing, shell-growth ratio). The rung-seven shell counts are UNFOLDED in-experiment from the actual {3,4,3,4} reflective-addressing graph (through shell three, 1, 24, 456, 8376) and cross-checked against the canonical sequence, so the growth ratio is read off the substrate, not hardcoded, and rung six now derives corners and faces by facet enumeration rather than a table. The forcing of each rung rests on its stated physical requirement (a vacuum and a mirror, reversibility, one substance, self-duality, full symmetry), which is the honest residual input, the same residual the primer names. Rung zero (nothing cannot be) is the one non-computational step, the seed, and is not coded. This is the timeless spec, register one, distinct from foundations/capstone which runs the dynamics.',
    })
  },
})
