// Is there a scale at which a coarse observer PERMANENTLY loses the past? An honest negative.
//
// E-FND-0074 established that recoverability and persistence are separate gates, and E-GRV-0040 showed a
// block-averaging observer recovers under half of the structure that is still completely present. Read
// together those invite an appealing hypothesis: that spatial coarse-graining has a SHARP threshold, a
// recoverability horizon, above which distinct fine histories become indistinguishable forever. Such a
// threshold would be an emergent origin of irreversibility from bookkeeping alone.
//
// This experiment tests that hypothesis and REFUTES it. The result is a negative, and it is reported as
// one, because the negative is more informative than the hypothesis would have been.
//
// The method hides a fine difference where a coarse observer cannot see it, then asks whether it ever
// surfaces. Two cells inside the SAME block have their entire slot contents swapped, so at the initial
// beat every block total is identical to the unswapped run, and the two states are invisible to that
// observer by construction. Both are then evolved under the committed knit and their coarse charge
// TRAJECTORIES are compared beat by beat.
//
// Measured, on the {3,4,3,4} d4 mesh of side 8:
//
//   block side 1, the two cells sit in different blocks, so the difference is visible at beat 1.
//   block side 2, hidden at first, and surfaces at beat 1 anyway.
//   block side 4, hidden at first, and surfaces at beat 1 anyway.
//   block side 8, the whole mesh is ONE block, and the difference NEVER surfaces.
//
// So there is no intermediate horizon. At every resolution short of the degenerate one, a difference
// hidden inside a block leaks across the block boundary within a SINGLE beat and shows up in the block
// totals, because streaming moves tones between cells and conservation forbids the difference from
// simply vanishing. The only resolution at which the past is permanently lost is the degenerate one
// where the coarse observable is the global conserved charge, and that answer is trivial rather than
// physical, since a conserved total is constant by construction and so distinguishes nothing at all.
//
// The substantive lesson is a distinction the recoverability discussion tends to blur. A coarse SNAPSHOT
// really does lose information, which is what E-GRV-0040 measured. A coarse TRAJECTORY does not, at any
// non-degenerate scale here. So the loss of recoverability under coarse-graining is a statement about
// instantaneous readout, not about what a patient coarse observer can eventually reconstruct, and the
// two must not be quoted interchangeably.
//
// CONTROL: the degenerate whole-mesh scale returns "never", which proves the measurement is capable of
// reporting permanent indistinguishability. That is what licenses reading "beat 1" at the other scales
// as a real finding rather than as an insensitive test.

import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { pairCollision } from '@/code/rule/collision'
import { cloneWill, makeWill } from '@/code/tone/will'
import { blockCount, blockIndexer } from '@/code/tool/block'
import {
  coarseChargeTrajectory,
  firstDistinguishedBeat,
} from '@/code/measure/recoverability'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const MESH_SIDE = 8
const BLOCK_SIDES = [1, 2, 4, 8]
const BEATS = 12

// the two cells whose entire slot contents are exchanged. Adjacent along the first axis, so they share a
// block at every block side of two or more.
const CELL_A = 0
const CELL_B = 1

export default experiment({
  id: 'foundations/recoverability-horizon',
  code: 'E-FND-0076',
  title:
    'honest negative: there is no intermediate recoverability horizon, a difference hidden inside a coarse block surfaces in the coarse trajectory within one beat at every scale short of the degenerate whole-system one',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: MESH_SIDE })
    const degree = mesh.degree
    const opposite = meshOpposites(mesh)

    const knit = pairCollision({ opposite })

    const base = () => {
      const will = makeWill(mesh)

      for (let cell = 0; cell < mesh.cellCount; cell++) {
        for (let d = 0; d < degree; d++) {
          will.data[cell * degree + d] = ((cell + 2 * d) % 3) - 1
        }
      }

      return will
    }

    // the same state with two cells' entire contents exchanged
    const swapped = () => {
      const will = base()

      for (let d = 0; d < degree; d++) {
        const held = will.data[CELL_A * degree + d]!

        will.data[CELL_A * degree + d] =
          will.data[CELL_B * degree + d]!
        will.data[CELL_B * degree + d] = held
      }

      return will
    }

    // the swap must actually change the fine state, else the whole test is vacuous
    const left = base()
    const right = swapped()

    let fineStatesDiffer = false

    for (let i = 0; i < left.data.length; i++) {
      if (left.data[i] !== right.data[i]) {
        fineStatesDiffer = true
        break
      }
    }

    const results = BLOCK_SIDES.map(blockSide => {
      const regionOf = blockIndexer({ meshSide: MESH_SIDE, blockSide })
      const regionCount = blockCount({ meshSide: MESH_SIDE, blockSide })

      const sameBlock = regionOf(CELL_A) === regionOf(CELL_B)

      const plain = coarseChargeTrajectory({
        will: cloneWill(left),
        collision: knit,
        beats: BEATS,
        regionOf,
        regionCount,
      })

      const altered = coarseChargeTrajectory({
        will: cloneWill(right),
        collision: knit,
        beats: BEATS,
        regionOf,
        regionCount,
      })

      return {
        blockSide,
        regionCount,
        sameBlock,
        // null means a coarse observer at this resolution never told them apart
        firstBeat: firstDistinguishedBeat(plain, altered),
      }
    })

    // the degenerate scale is the one where the whole mesh is a single block
    const degenerate = results.filter(r => r.regionCount === 1)
    const nonDegenerate = results.filter(r => r.regionCount > 1)

    // the hypothesis under test was a sharp intermediate horizon. It fails if every non-degenerate
    // resolution distinguishes the two histories, and quickly.
    const everyNonDegenerateDistinguishes = nonDegenerate.every(
      r => r.firstBeat !== null,
    )

    const allWithinOneBeat = nonDegenerate.every(r => r.firstBeat === 1)

    // and the hidden case really was hidden to begin with, at the scales where the cells share a block
    const someScaleHidTheDifference = nonDegenerate.some(r => r.sameBlock)

    // CONTROL: the degenerate scale must return never, proving the measure can report that
    const degenerateNeverDistinguishes =
      degenerate.length > 0 && degenerate.every(r => r.firstBeat === null)

    const noIntermediateHorizon =
      everyNonDegenerateDistinguishes && allWithinOneBeat

    const ok =
      fineStatesDiffer &&
      someScaleHidTheDifference &&
      noIntermediateHorizon &&
      degenerateNeverDistinguishes

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the hypothesis of a sharp intermediate recoverability horizon is refuted: a difference constructed to be invisible to a coarse observer, by exchanging the whole contents of two cells sharing a block, surfaces in that observer coarse charge trajectory within a SINGLE beat at every resolution short of the degenerate whole-system one, because streaming carries the difference across the block boundary and conservation forbids it from vanishing, and the only resolution at which the past is permanently lost is the degenerate single-block case whose observable is the constant global conserved charge and therefore distinguishes nothing by construction, which means the loss of recoverability under coarse-graining is a fact about instantaneous readout rather than about what a patient coarse observer can eventually reconstruct',
      metrics: {
        meshSide: MESH_SIDE,
        beats: BEATS,
        scales: BLOCK_SIDES.length,
        firstBeatBlock1: results[0]!.firstBeat ?? -1,
        firstBeatBlock2: results[1]!.firstBeat ?? -1,
        firstBeatBlock4: results[2]!.firstBeat ?? -1,
        firstBeatBlock8: results[3]!.firstBeat ?? -1,
        sameBlockAtBlock2: results[1]!.sameBlock ? 1 : 0,
        noIntermediateHorizon: noIntermediateHorizon ? 1 : 0,
      },
      control: {
        degenerateNeverDistinguishes: degenerateNeverDistinguishes ? 1 : 0,
        degenerateRegionCount: degenerate[0]?.regionCount ?? -1,
        fineStatesDiffer: fineStatesDiffer ? 1 : 0,
        someScaleHidTheDifference: someScaleHidTheDifference ? 1 : 0,
      },
      notes:
        'L2, and an HONEST NEGATIVE on the hypothesis it set out to test. I expected a sharp intermediate horizon and there is none. Two things make the negative trustworthy rather than an artefact. The swap is verified to change the fine state, so the test is not vacuous, and it is verified to be hidden at the scales where the two cells share a block, so the coarse observer really did start blind. The degenerate whole-mesh scale returns never, which demonstrates the measurement is capable of reporting permanent indistinguishability, so the beat-one answers elsewhere are a finding rather than an insensitive instrument. The interpretation worth carrying forward is the snapshot-versus-trajectory distinction: E-GRV-0040 measured a coarse SNAPSHOT losing over half the structure, which is true, and this shows the coarse TRAJECTORY loses none of it at any non-degenerate scale, so those two results are about different observers and must not be quoted interchangeably. A caveat on scope: this tests one deterministic hidden difference at one mesh size, so it refutes a sharp horizon at these scales rather than proving no horizon can exist anywhere. Fully deterministic, fixed fill, fixed swap, no random source.',
    })
  },
})
