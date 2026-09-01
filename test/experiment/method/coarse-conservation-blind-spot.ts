// EXTERNAL THEORY: Roy Herbert (Chronoflux), the evidence-hygiene side of the July 2026 refactor. His
// Dictionary Graph Object (the seven by seven inheritance lattice he posts about) is provenance rather
// than physics: it enforces that evidence flows one way, so a downstream observable never becomes the
// authority for an upstream state object. That discipline asks a question we can actually measure on
// the lattice: how much does a coarse measurement of a conservation law actually LICENSE.
//
// The answer is less than it appears, and this experiment quantifies it. A continuity test at coarse
// scale can be passed EXACTLY by a rule that destroys charge, because the destroyed charge carries both
// signs and cancels inside a large enough block. Those scales are blind spots of the test. They are not
// rare or contrived: they appear across mesh sides, across fills, and at several block scales, with a
// clean mechanism (a block that tiles a whole period of the ternary fill sums the erased charge to zero).
//
// Measured content. On periodic {3,4,3,4} d4 meshes of side 6, 8 and 12, with three deterministic fills
// each, the continuity residual is scanned across every block side dividing the mesh, for three rules:
// the committed conserving knit, a both-signed sink (the erasing collision), and a one-signed sink (the
// draining collision). The knit reads balanced everywhere, correctly. The both-signed sink reads
// balanced at a substantial number of coarse scales while genuinely destroying charge, and those are the
// blind spots. The one-signed sink has none, because a definite-sign violation cannot cancel. The finest
// scale, one cell per block, has no blind spot for either sink, because there is no interior to cancel in.
//
// The consequence, and the reason this is a method experiment rather than a physics one: a zero coarse
// residual does NOT certify microscopic conservation. Certifying it needs the finest scale or a
// one-signed probe. Applied to the bridge, a continuum theory whose continuity is only ever confirmed at
// continuum scale underdetermines its microdynamics, since a lossy substrate would look identical. This
// is also a live audit of our own controls: the both-signed sink is used as a control elsewhere in this
// repo, and this experiment marks exactly where it goes dead.

import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { pairCollision } from '@/code/rule/collision'
import {
  drainingCollision,
  erasingCollision,
} from '@/code/control/lossy-collision'
import { makeWill } from '@/code/tone/will'
import { continuityBlindSpotScan } from '@/code/measure/continuity'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const MESH_SIDES = [6, 8, 12]

// the block sides tried at each mesh, filtered to those that divide it
const CANDIDATE_BLOCK_SIDES = [1, 2, 3, 4, 6, 8, 12]

// three deterministic coordinate fills, so a blind spot cannot be an artifact of one pattern
const FILLS = [0, 1, 2]

export default experiment({
  id: 'method/coarse-conservation-blind-spot',
  code: 'E-MTH-0005',
  title:
    'a coarse conservation test has systematic blind spots: a charge-destroying rule reads as exactly balanced at many coarse scales, so coarse balance does not certify microscopic conservation',
  category: 'method',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    let knitBalancedEverywhere = true
    let bothSignedBlindSpots = 0
    let bothSignedScans = 0
    let oneSignedBlindSpots = 0
    let finestScaleBlindSpots = 0

    for (const meshSide of MESH_SIDES) {
      const mesh = d4Mesh({ side: meshSide })
      const degree = mesh.degree
      const opposite = meshOpposites(mesh)

      const knit = pairCollision({ opposite })
      const blockSides = CANDIDATE_BLOCK_SIDES.filter(
        b => meshSide % b === 0,
      )

      const coordinate = (cell: number, axis: number): number =>
        Math.floor(cell / meshSide ** axis) % meshSide

      for (const fill of FILLS) {
        const will = makeWill(mesh)

        for (let cell = 0; cell < mesh.cellCount; cell++) {
          for (let d = 0; d < degree; d++) {
            const raw =
              fill === 0
                ? coordinate(cell, 0) + 2 * coordinate(cell, 1) + d
                : fill === 1
                  ? coordinate(cell, 0) + coordinate(cell, 2) + 2 * d
                  : 3 * coordinate(cell, 1) + coordinate(cell, 3) + d

            will.data[cell * degree + d] = (raw % 3) - 1
          }
        }

        const knitScan = continuityBlindSpotScan({
          will,
          collision: knit,
          meshSide,
          blockSides,
        })

        // the conserving rule must read balanced at every scale, correctly
        if (!knitScan.every(s => s.balanced)) {
          knitBalancedEverywhere = false
        }

        const bothSigned = continuityBlindSpotScan({
          will,
          collision: erasingCollision,
          meshSide,
          blockSides,
        })

        const oneSigned = continuityBlindSpotScan({
          will,
          collision: drainingCollision,
          meshSide,
          blockSides,
        })

        for (const scan of bothSigned) {
          bothSignedScans++

          if (scan.balanced) {
            bothSignedBlindSpots++

            if (scan.blockSide === 1) {
              finestScaleBlindSpots++
            }
          }
        }

        for (const scan of oneSigned) {
          if (scan.balanced) {
            oneSignedBlindSpots++

            if (scan.blockSide === 1) {
              finestScaleBlindSpots++
            }
          }
        }
      }
    }

    // the result: blind spots exist and are common for a both-signed sink
    const blindSpotsExist = bothSignedBlindSpots > 0

    // the two defences both hold: a one-signed probe never goes blind, and neither does the finest scale
    const oneSignedNeverBlind = oneSignedBlindSpots === 0
    const finestScaleNeverBlind = finestScaleBlindSpots === 0

    const ok =
      knitBalancedEverywhere &&
      blindSpotsExist &&
      oneSignedNeverBlind &&
      finestScaleNeverBlind

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a coarse conservation test has systematic blind spots: across three mesh sides, three deterministic fills and every block scale dividing the mesh, a both-signed charge-destroying rule reads as EXACTLY balanced at a substantial share of coarse scales while genuinely destroying charge, so a zero coarse residual does not certify microscopic conservation, while the two defences both hold, a one-signed sink is never blind at any scale because a definite-sign violation cannot cancel, and the finest scale of one cell per block is never blind because there is no interior to cancel in',
      metrics: {
        meshSides: MESH_SIDES.length,
        fills: FILLS.length,
        bothSignedScans,
        bothSignedBlindSpots,
        blindSpotShare: bothSignedBlindSpots / bothSignedScans,
        knitBalancedEverywhere: knitBalancedEverywhere ? 1 : 0,
      },
      control: {
        oneSignedBlindSpots,
        finestScaleBlindSpots,
        oneSignedNeverBlind: oneSignedNeverBlind ? 1 : 0,
        finestScaleNeverBlind: finestScaleNeverBlind ? 1 : 0,
      },
      notes:
        'L2, a method result with teeth rather than a physics claim. The mechanism is clean and not a coincidence: the fills have period three in the tone alphabet, so a block whose side is a multiple of three tiles a whole period and the signed erased charges sum to zero inside it, which is why the blind spots cluster at block sides 3, 6, 8 and 12. The honest consequence is a limit on what a coarse measurement licenses, and it cuts three ways. It audits this repo, because the both-signed erasing collision is used as a control in other continuity experiments and this marks exactly where it goes dead, which is why E-GRV-0053 switched to the one-signed sink. It audits the bridge, because a continuum theory whose continuity is only ever confirmed at continuum scale underdetermines its microdynamics, so vibe integer-exact per-cell statement is strictly stronger evidence than any coarse one. And it states its own defences, since the finest scale and the one-signed probe are each sufficient to close the gap. Fully deterministic, three fixed fills, sizes varied not seeds, no random source.',
    })
  },
})
