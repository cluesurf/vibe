// EXTERNAL THEORY: Roy Herbert (Chronoflux), the objection he raises against a finite carrier. His
// argument is that a finite complex "conserves only across the boundaries it was given", that its
// locality, orientation and terminal scale are already built into it, and that changing the complex
// changes the available conservation structure. If that were true without qualification, the discrete
// balance law would be an artefact of one chosen adjacency rather than a law, and E-FND-0073 would not
// settle it, because that experiment varied PARTITIONS on a FIXED mesh and never varied the adjacency.
//
// This experiment varies the adjacency itself. The balance is measured on three genuinely different
// complexes, a square coin of degree four, a cubic coin of degree six, and the {3,4,3,4} D4 coin of
// degree twenty-four, each with its own conserving rule, each read through partitions built to carry no
// geometry (single cells, index-interleaved, integer-scrambled).
//
// The measured answer separates two things his objection runs together.
//
// THE LAW IS NOT COMPLEX-RELATIVE. The continuity residual is exactly zero on every complex, for every
// rule, through every partition, under integer equality with no tolerance, while those partitions carry
// large real flux. So the balance law is not a property of one adjacency.
//
// THE CONSERVED CONTENT IS SELECTIVE, AND THE INSTRUMENT PROVES IT CAN SEE THAT. Momentum, a vector
// quantity that needs the coin's direction vectors rather than only its adjacency, is conserved by the
// head-on rotating collision and NOT by the pair collision, and that split is the same on all three
// complexes. This is the anti-tautology leg: a battery in which everything came out conserved would be
// suspect, and this one demonstrably discriminates.
//
// So the honest verdict is partly corrective. What changes with the complex is the RICHNESS of the
// available structure, the number of independent directional slots and whether spinors exist at all, a
// point vibe already makes with the {5,3,4} no-spinor result. What does NOT change with the complex is
// the balance law, nor charge conservation, nor reversibility. CONTROL: a one-signed sink breaks the
// residual on every complex, so the zero is a result the measurement could have denied.

import {
  cubicMesh,
  d4Mesh,
  meshOpposites,
  squareMesh,
  CUBIC_DIRECTIONS,
  SQUARE_DIRECTIONS,
  type Mesh,
} from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { headOnRotate, pairCollision } from '@/code/rule/collision'
import { drainingCollision } from '@/code/control/lossy-collision'
import { makeWill } from '@/code/tone/will'
import {
  conservesCharge,
  conservesMomentum,
  isReversible,
} from '@/code/check/invariant'
import { regionContinuityResidual } from '@/code/measure/continuity'
import { integerMix } from '@/code/tool/integer'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BEATS = 4

// classes used by the two deliberately non-geometric partitions
const INTERLEAVE_CLASSES = 7
const SCRAMBLE_CLASSES = 13

export default experiment({
  id: 'foundations/adjacency-invariance',
  code: 'E-FND-0075',
  title:
    'the discrete balance law is the same on three different complexes (degree 4, 6 and 24), so it is not an artefact of one adjacency, while momentum conservation is rule-selective, which shows the battery can tell conservation structures apart',
  category: 'foundations',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const complexes: { name: string; mesh: Mesh; directions: number[][] }[] =
      [
        {
          name: 'square',
          mesh: squareMesh({ side: 8 }),
          directions: SQUARE_DIRECTIONS,
        },
        {
          name: 'cubic',
          mesh: cubicMesh({ side: 6 }),
          directions: CUBIC_DIRECTIONS,
        },
        {
          name: 'd4',
          mesh: d4Mesh({ side: 6 }),
          directions: rootsD4(),
        },
      ]

    let lawExactEverywhere = true
    let allPartitionsCarryFlux = true
    let chargeConservedEverywhere = true
    let reversibleEverywhere = true
    let lossyBreaksEverywhere = true

    // the discriminating leg: which rules conserve the vector quantity, per complex
    const rotateMomentum: number[] = []
    const pairMomentum: number[] = []
    const degrees: number[] = []
    const worstResidual: number[] = []

    for (const { mesh, directions } of complexes) {
      const degree = mesh.degree
      const opposite = meshOpposites(mesh)
      const knit = pairCollision({ opposite })
      const knitInverse = pairCollision({ opposite, forward: false })
      const rotate = headOnRotate({ opposite })

      degrees.push(degree)

      // one deterministic fill, defined from the cell index so it is complex-agnostic
      const build = () => {
        const will = makeWill(mesh)

        for (let cell = 0; cell < mesh.cellCount; cell++) {
          for (let d = 0; d < degree; d++) {
            will.data[cell * degree + d] = ((cell + 2 * d) % 3) - 1
          }
        }

        return will
      }

      const partitions: {
        regionOf: (cell: number) => number
        regionCount: number
      }[] = [
        { regionOf: cell => cell, regionCount: mesh.cellCount },
        {
          regionOf: cell => cell % INTERLEAVE_CLASSES,
          regionCount: INTERLEAVE_CLASSES,
        },
        {
          regionOf: cell => integerMix(cell) % SCRAMBLE_CLASSES,
          regionCount: SCRAMBLE_CLASSES,
        },
      ]

      let worst = 0

      for (const rule of [knit, rotate]) {
        for (const partition of partitions) {
          const measured = regionContinuityResidual({
            will: build(),
            collision: rule,
            regionOf: partition.regionOf,
            regionCount: partition.regionCount,
          })

          if (
            measured.absResidual !== 0 ||
            measured.maxRegionResidual !== 0
          ) {
            lawExactEverywhere = false
          }

          if (measured.totalFlux <= 0) {
            allPartitionsCarryFlux = false
          }

          worst = Math.max(worst, measured.maxRegionResidual)
        }
      }

      worstResidual.push(worst)

      // the base invariants, on each complex
      if (!conservesCharge(build(), knit, BEATS)) {
        chargeConservedEverywhere = false
      }

      if (!isReversible(build(), knit, BEATS, knitInverse)) {
        reversibleEverywhere = false
      }

      // the vector quantity: rule-selective, measured per complex
      rotateMomentum.push(
        conservesMomentum(build(), rotate, BEATS, directions) ? 1 : 0,
      )
      pairMomentum.push(
        conservesMomentum(build(), knit, BEATS, directions) ? 1 : 0,
      )

      // CONTROL: a one-signed sink must break the balance on this complex
      const lossy = regionContinuityResidual({
        will: build(),
        collision: drainingCollision,
        regionOf: cell => cell % INTERLEAVE_CLASSES,
        regionCount: INTERLEAVE_CLASSES,
      })

      if (lossy.absResidual === 0) {
        lossyBreaksEverywhere = false
      }
    }

    // the law transferred across every adjacency
    const lawUniversal =
      lawExactEverywhere &&
      allPartitionsCarryFlux &&
      chargeConservedEverywhere &&
      reversibleEverywhere

    // the instrument can tell conservation structures apart: the rotating rule keeps momentum on every
    // complex, the pair rule keeps it on none, so a zero residual is not a blind instrument
    const momentumDiscriminates =
      rotateMomentum.every(v => v === 1) &&
      pairMomentum.every(v => v === 0)

    const ok = lawUniversal && momentumDiscriminates && lossyBreaksEverywhere

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'varying the adjacency itself, not merely the partition, the discrete continuity balance is exactly zero on a square coin of degree four, a cubic coin of degree six and the D4 coin of degree twenty-four, for two different conserving rules, through partitions that carry no geometry and do carry large real flux, with charge conserved and the rule reversible on each, so the balance law is not an artefact of one chosen adjacency, while momentum, which needs the coin vectors rather than only its adjacency, is kept by the rotating rule and lost by the pair rule on all three complexes, which shows the battery discriminates between conservation structures rather than reporting yes to everything, and a one-signed sink breaks the balance on every complex',
      metrics: {
        complexes: complexes.length,
        degreeSquare: degrees[0]!,
        degreeCubic: degrees[1]!,
        degreeD4: degrees[2]!,
        worstResidualSquare: worstResidual[0]!,
        worstResidualCubic: worstResidual[1]!,
        worstResidualD4: worstResidual[2]!,
        lawExactEverywhere: lawExactEverywhere ? 1 : 0,
        chargeConservedEverywhere: chargeConservedEverywhere ? 1 : 0,
        reversibleEverywhere: reversibleEverywhere ? 1 : 0,
        rotateKeepsMomentumOnAll: rotateMomentum.every(v => v === 1)
          ? 1
          : 0,
        pairKeepsMomentumOnNone: pairMomentum.every(v => v === 0) ? 1 : 0,
      },
      control: {
        lossyBreaksEverywhere: lossyBreaksEverywhere ? 1 : 0,
        pairMomentumSquare: pairMomentum[0]!,
        pairMomentumCubic: pairMomentum[1]!,
        pairMomentumD4: pairMomentum[2]!,
      },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh). The seeds and measurements here are local, so the result stands on the component the seed lives in; roadmap item 0017 tracks the switch to an odd side. ' +
        'L2, and the point of it is to answer a specific external objection rather than to add physics. Herbert argues that a finite complex conserves only across the boundaries it was given, so that changing the complex changes the available conservation structure. E-FND-0073 could not settle that, because it varied partitions on a FIXED mesh. Here the adjacency itself varies across degree 4, 6 and 24 coins. The result splits his claim. The balance law, charge conservation and reversibility are the SAME on every complex, so those are not artefacts of one adjacency. What is selective is the vector quantity: momentum is kept by the head-on rotating collision and lost by the pair collision, identically on all three complexes, so here the selectivity is rule-borne rather than complex-borne. That leg is deliberately included as the anti-tautology control, since a battery reporting conservation everywhere would be indistinguishable from a blind one. Where his objection does hold is the RICHNESS of the structure a complex can carry, the count of independent directional slots and whether spinors exist at all, which vibe itself demonstrates with the {5,3,4} no-spinor result. So the honest summary is that the law is adjacency-independent while the available content is not, and the two must not be argued as one thing. Fully deterministic, one index-defined fill per complex, no random source, the integer mix being a fixed scramble rather than an rng.',
    })
  },
})
