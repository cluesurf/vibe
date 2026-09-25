// Does coarse-graining the committed rule restore a symmetry of the tone that the rule breaks at the
// scale of one cell? E-FRC-0093 finds that of the six relabellings of the three tone values (S3, the
// Weyl group of SU(3)) only the identity commutes with the rule, exactly. An SU(3) that is not exact
// could still be emergent, the way lattice anisotropy disappears at long distance: the breaking
// would then shrink as the state is viewed through larger and larger blocks.
//
// Measured directly. The committed turning weave runs through beat on the D4 mesh from two fixed
// structured starts (a coordinate texture on every slot, and the vacuum with that texture only in a
// central ball), and from each relabelled start, for two schedule periods. Both runs are
// coarse-grained into b^4 blocks of cells, each block's variable the fractions of its slots holding
// -1, 0 and +1, and D_b is the mean total-variation distance between the relabelled run's block
// populations and the relabelled populations of the plain run (code/coarse/tone-population). The
// survival ratio D_L / D_1 compares the whole mesh (one block) to single cells. At L = 9 and L = 15.
//
// Calibrations, each of which must come out as its construction says:
// - pure streaming commutes with every relabelling: D_b = 0 at every b;
// - turning every tone round the cycle -1 -> 0 -> +1 breaks the three transpositions at every scale
//   (survival near one) and keeps the two 3-cycles exactly (D = 0);
// - reversing a lone +1 on its line breaks four relabellings at the cell scale (D_1 > 0, the fifth,
//   exchanging 0 and +1, it keeps exactly) but never changes a cell's populations, so the whole-mesh
//   populations commute exactly (D_L = 0), the shape of a breaking that coarse-graining removes.
//
// No random numbers: the starts are fixed functions of the coordinates, and every run is exact.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import {
  Collision,
  passThrough,
  turningWeave,
} from '@/code/rule/collision'
import { Will, fillCoordinateTexture, makeWill } from '@/code/tone/will'
import { TONE_PERMUTATIONS } from '@/code/check/tone-permutation-symmetry'
import {
  CoarseBreaking,
  ToneRelabel,
  coarseRelabellingBreaking,
  cycleTones,
  reversePositive,
} from '@/code/coarse/tone-population'

const PERIOD = 24
// charge conjugation: -1 and +1 exchanged, the vacuum tone 0 fixed
const CONJUGATION: ToneRelabel = [1, 0, -1]
// the other four nontrivial relabellings all move the vacuum tone
const MOVES_VACUUM = TONE_PERMUTATIONS.slice(1).filter(
  relabel => relabel.join(',') !== CONJUGATION.join(','),
)
const THREE_CYCLES: readonly ToneRelabel[] = [
  [0, 1, -1],
  [1, -1, 0],
]

// the two structured starts on a side-L mesh
function starts(side: number): Will[] {
  const mesh = d4Mesh({ side })
  const texture = makeWill(mesh)
  const ball = makeWill(mesh)
  const center = (side - 1) / 2

  fillCoordinateTexture(texture, side)

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    const coordinates = [
      cell % side,
      Math.floor(cell / side) % side,
      Math.floor(cell / (side * side)) % side,
      Math.floor(cell / (side * side * side)) % side,
    ]
    const radiusSquared = coordinates.reduce(
      (sum, c) => sum + (c - center) ** 2,
      0,
    )

    if (radiusSquared <= (side / 3) ** 2) {
      for (let d = 0; d < mesh.degree; d++) {
        ball.data[cell * mesh.degree + d] =
          texture.data[cell * mesh.degree + d] ?? 0
      }
    }
  }

  return [texture, ball]
}

function breaking(input: {
  side: number
  blocks: readonly number[]
  schedule: (beatIndex: number) => Collision
  relabels: readonly ToneRelabel[]
}): CoarseBreaking[] {
  return coarseRelabellingBreaking({
    starts: starts(input.side),
    schedule: input.schedule,
    relabels: input.relabels,
    side: input.side,
    blocks: input.blocks,
    beats: 2 * PERIOD,
  })
}

const finest = (b: CoarseBreaking): number => b.mean[0] ?? 0
const coarsest = (b: CoarseBreaking): number =>
  b.mean[b.mean.length - 1] ?? 0

export default experiment({
  id: 'gauge/rule-coarse-tone-symmetry',
  code: 'E-FRC-0096',
  title:
    'coarse-graining the committed rule restores no tone symmetry: the four relabellings that move the vacuum tone stay broken at the whole-mesh scale at about 86 percent of their single-cell size, and charge conjugation falls to a volume-independent floor instead of to zero, so no S3 (the Weyl skeleton of SU(3)) emerges at long distance',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L3',
  paper: false,
  run() {
    const opposite9 = meshOpposites(d4Mesh({ side: 9 }))
    const opposite15 = meshOpposites(d4Mesh({ side: 15 }))
    const allRelabels = TONE_PERMUTATIONS.slice(1)

    const committed9 = breaking({
      side: 9,
      blocks: [1, 3, 9],
      schedule: turningWeave({ opposite: opposite9 }),
      relabels: allRelabels,
    })
    // the larger mesh, for the volume dependence of the conjugation floor and one vacuum-moving
    // relabelling (the four behave alike at L = 9)
    const committed15 = breaking({
      side: 15,
      blocks: [1, 3, 5, 15],
      schedule: turningWeave({ opposite: opposite15 }),
      relabels: [CONJUGATION, MOVES_VACUUM[0] ?? CONJUGATION],
    })
    const streaming = breaking({
      side: 9,
      blocks: [1, 3, 9],
      schedule: () => passThrough,
      relabels: allRelabels,
    })
    const cycle = breaking({
      side: 9,
      blocks: [1, 3, 9],
      schedule: () => cycleTones,
      relabels: allRelabels,
    })
    const reversing = reversePositive({ opposite: opposite9 })
    const local = breaking({
      side: 9,
      blocks: [1, 3, 9],
      schedule: () => reversing,
      relabels: allRelabels,
    })

    const find = (
      list: readonly CoarseBreaking[],
      relabel: ToneRelabel,
    ): CoarseBreaking | undefined =>
      list.find(b => b.relabel.join(',') === relabel.join(','))
    const vacuumMoving9 = MOVES_VACUUM.map(r =>
      find(committed9, r),
    ).filter((b): b is CoarseBreaking => b !== undefined)
    const conjugation9 = find(committed9, CONJUGATION)
    const conjugation15 = find(committed15, CONJUGATION)
    const vacuumMoving15 = find(
      committed15,
      MOVES_VACUUM[0] ?? CONJUGATION,
    )
    const survival = (b: CoarseBreaking | undefined): number =>
      b === undefined ? Number.NaN : coarsest(b) / finest(b)

    const vacuumSurvivals = [
      ...vacuumMoving9.map(survival),
      survival(vacuumMoving15),
    ]
    const conjugationFloor9 =
      conjugation9 === undefined ? Number.NaN : coarsest(conjugation9)
    const conjugationFloor15 =
      conjugation15 === undefined ? Number.NaN : coarsest(conjugation15)
    // incoherent cancellation would shrink the floor by sqrt of the cell-count ratio from L = 9 to 15
    const incoherentShrink = Math.sqrt((15 / 9) ** 4)
    const floorRatio = conjugationFloor15 / conjugationFloor9

    // the committed rule: vacuum-moving breaking survives, conjugation keeps a floor
    const vacuumStays = vacuumSurvivals.every(s => s > 0.5)
    const conjugationShrinks =
      survival(conjugation9) < 0.5 && survival(conjugation15) < 0.5
    const conjugationFloorStays =
      conjugationFloor9 > 0 && Math.abs(floorRatio - 1) < 0.25
    // the calibrations
    const streamingZero = streaming.every(b =>
      b.mean.every(v => v === 0),
    )
    const cycleCalibrated =
      THREE_CYCLES.every(r =>
        (find(cycle, r)?.mean ?? [1]).every(v => v === 0),
      ) &&
      cycle
        .filter(
          b =>
            !THREE_CYCLES.some(
              r => r.join(',') === b.relabel.join(','),
            ),
        )
        .every(b => survival(b) > 0.5)
    // reversing a lone +1 commutes exactly with exchanging 0 and +1 (it maps the reversal condition to
    // itself), so it breaks the other four at the cell scale, and all five commute at the mesh scale
    const localBrokenAtCell = local.filter(b => finest(b) > 0).length
    const localCalibrated =
      localBrokenAtCell === 4 && local.every(b => coarsest(b) < 1e-12)
    const ok =
      vacuumStays &&
      conjugationShrinks &&
      conjugationFloorStays &&
      streamingZero &&
      cycleCalibrated &&
      localCalibrated

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'under coarse-graining into blocks up to the whole mesh, the committed rule keeps no tone symmetry: the four relabellings that move the vacuum tone survive at the whole-mesh scale at about 86 percent of their single-cell breaking at L = 9 and L = 15, and charge conjugation shrinks about elevenfold but to a floor that does not fall with volume, while streaming commutes at every scale, a tone cycle breaks at every scale, and a breaking that only moves tones inside cells vanishes exactly at the whole-mesh scale',
      metrics: {
        vacuumMovingSurvivalSmallest: Math.min(...vacuumSurvivals),
        vacuumMovingSurvivalLargest: Math.max(...vacuumSurvivals),
        vacuumMovingSingleCellL9:
          vacuumMoving9[0] === undefined ? 0 : finest(vacuumMoving9[0]),
        vacuumMovingWholeMeshL15:
          vacuumMoving15 === undefined ? 0 : coarsest(vacuumMoving15),
        conjugationSingleCellL9:
          conjugation9 === undefined ? 0 : finest(conjugation9),
        conjugationWholeMeshL9: conjugationFloor9,
        conjugationWholeMeshL15: conjugationFloor15,
        conjugationSurvivalL9: survival(conjugation9),
        conjugationSurvivalL15: survival(conjugation15),
        conjugationFloorRatioL15OverL9: floorRatio,
        incoherentFloorRatioPredicted: 1 / incoherentShrink,
      },
      control: {
        streamingLargestD: Math.max(...streaming.flatMap(b => b.mean)),
        cycleTranspositionSurvivalSmallest: Math.min(
          ...cycle
            .filter(
              b =>
                !THREE_CYCLES.some(
                  r => r.join(',') === b.relabel.join(','),
                ),
            )
            .map(survival),
        ),
        cycleThreeCycleLargestD: Math.max(
          ...THREE_CYCLES.flatMap(
            r => find(cycle, r)?.mean ?? [Number.NaN],
          ),
        ),
        localBrokenAtCellScale: localBrokenAtCell,
        localSingleCellSmallestBroken: Math.min(
          ...local.map(finest).filter(v => v > 0),
        ),
        localWholeMeshLargest: Math.max(...local.map(coarsest)),
      },
      notes:
        'L3 format, an honest negative: the committed rule runs through beat on the D4 mesh at two sizes, with three calibrations that each come out as constructed. The coarse variable is the tone population of a block, the only block quantity a relabelling of tone values acts on without a choice of basis, so this tests the S3 Weyl skeleton of SU(3) and nothing continuous. The vacuum tone 0 is where the clock (the arrow) creates and annihilates pairs, and every relabelling that moves it stays broken at every scale, which is the coarse form of the E-FRC-0093 obstruction. Charge conjugation, which fixes the vacuum, is approximately restored by averaging (about elevenfold) but keeps a floor, and the floor is the same at L = 9 and L = 15 instead of shrinking by the 2.8 of incoherent cancellation, so the remaining breaking is coherent. Two starts and two schedule periods, deterministic. Coarse variables other than populations (block currents, correlations) are not tested.',
    })
  },
})
