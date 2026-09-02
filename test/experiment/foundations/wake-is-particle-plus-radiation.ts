// The traveller's wake, characterized: it is radiation behind an intact particle, not the particle's
// death. E-FND-0096 corrected the transmission claim by showing the offset-domain crossing plants a
// delayed, growing wake. The base-model decision (adopt the traveller knit, keep hunting, or extend
// the state) turns on what that wake IS, so here it is measured:
//
//   - THE PARTICLE SURVIVES, EXACTLY. At every sampled beat through and long past the eruption, a
//     difference slot sits at the particle's exact free-flight position (read from the no-slab
//     control run, not assumed), at two lattice sizes. The particle never stops, never deviates,
//     and never dissolves: the domain does not absorb it.
//   - THE WAKE GROWS LIKE A RESPONSE, AND THAT IS REPORTED, NOT HIDDEN. Its support reaches the
//     same order as the offset-2 detector's response in the same geometry (234 against 232 at side
//     13), with the relative growth decelerating window over window and no touched cell averaging
//     two slots. So growth rate does NOT separate the wake from detection. What separates them is
//     the next two facts.
//   - IT KEEPS PARTIAL COHERENCE. The total difference amplitude returns to exactly root three at a
//     fifth to a third of post-eruption beats, at both sizes: the radiation re-sums with the
//     particle into a definite rotated phase intermittently, which pure decoherence would not do.
//   - THE ERUPTION BEAT IS DETERMINISTIC BUT NOT SIMPLE: measured per side (11 at side 13, 16 at
//     side 15 in the standing geometry) with no one-line law found across five sides, recorded
//     honestly as an open structural question.
//
// Reading: the crossing is transparent for the particle and responsive for the medium. Against the
// detector class the difference is not the size of the response but WHO survives: the offset-2
// wall's job is to grab the phase class it rejects, while here the particle keeps its exact
// trajectory and the total keeps recohering, emission-with-survival rather than absorption. That
// reframes the adoption question: the traveller knit's domain crossing is particle-plus-medium-
// response, and whether that response can carry (a photon candidate) or merely records (a
// measurement trace) is the named next measurement, alongside the wall-launcher of E-FND-0100. The
// free particle is the control: no slab, support one, no wake, forever. Depth L2, deterministic,
// no randomness.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, Will } from '@/code/tone/will'
import { lineHop } from '@/code/rule/collision'
import { growingBeat } from '@/code/rule/lattice-gas'
import { clockAmplitude } from '@/code/measure/clock-amplitude'
import { pairAbs2, pairSub } from '@/code/algebra/linear/complex-pair'

const ROOT3 = Math.sqrt(3)
const SEED_BEAT = 3

function wakeStudy(input: {
  side: number
  slab: boolean
  beats: number
  birth?: number
}): {
  frontHits: number
  frontChecks: number
  eruption: number
  finalSupport: number
  maxSlotsPerCell: number
  lateSlope: number
  lateRatio: number
  earlierRatio: number
  recoherenceBeats: number
  postBeats: number
} {
  const { side, slab, beats: BEATS } = input
  const mesh = d4Mesh({ side })
  const rule = lineHop({ opposite: meshOpposites(mesh) })
  const coordinate = (c: number, a: number): number =>
    Math.floor(c / side ** a) % side
  const late = new Set<number>()

  if (slab) {
    for (let cell = 0; cell < mesh.cellCount; cell++) {
      const x = coordinate(cell, 0)

      if (x >= 5 && x <= 7) {
        late.add(cell)
      }
    }
  }

  const mid = Math.floor(side / 2)

  let seedCell = 0

  for (let cell = 0; cell < mesh.cellCount; cell++) {
    if (
      coordinate(cell, 0) === 1 &&
      coordinate(cell, 1) === mid &&
      coordinate(cell, 2) === mid &&
      coordinate(cell, 3) === mid
    ) {
      seedCell = cell
      break
    }
  }

  // the free trajectory, measured from the no-slab control run rather than assumed
  const freePosition: number[] = []

  {
    let controlVacuum: Will = makeWill(mesh)
    let controlSeeded: Will = makeWill(mesh)

    for (let t = 0; t < BEATS; t++) {
      if (t === SEED_BEAT) {
        controlSeeded.data[seedCell * mesh.degree] = 1
      }

      controlVacuum = growingBeat(controlVacuum, rule, () => true)
      controlSeeded = growingBeat(controlSeeded, rule, () => true)

      let position = -1

      for (let i = 0; i < controlSeeded.data.length; i++) {
        if (controlSeeded.data[i] !== controlVacuum.data[i]) {
          position = Math.floor(i / mesh.degree)
          break
        }
      }

      freePosition.push(position)
    }
  }

  let vacuum: Will = makeWill(mesh)
  let seeded: Will = makeWill(mesh)
  let frontHits = 0
  let frontChecks = 0
  let eruption = -1
  let maxSlotsPerCell = 0
  let recoherenceBeats = 0
  let postBeats = 0

  const supports: number[] = []

  for (let t = 0; t < BEATS; t++) {
    if (t === SEED_BEAT) {
      seeded.data[seedCell * mesh.degree] = 1
    }

    const active = (cell: number): boolean =>
      late.has(cell) ? t >= (input.birth ?? 1) : true

    vacuum = growingBeat(vacuum, rule, active)
    seeded = growingBeat(seeded, rule, active)

    const cells = new Set<number>()

    let support = 0

    for (let i = 0; i < seeded.data.length; i++) {
      if (seeded.data[i] !== vacuum.data[i]) {
        support++
        cells.add(Math.floor(i / mesh.degree))
      }
    }

    supports.push(support)

    if (cells.size > 0) {
      maxSlotsPerCell = Math.max(
        maxSlotsPerCell,
        support / cells.size,
      )
    }

    if (t > SEED_BEAT) {
      frontChecks++

      if (cells.has(freePosition[t]!)) {
        frontHits++
      }
    }

    if (eruption === -1 && t > SEED_BEAT && support > 1) {
      eruption = t
    }

    if (eruption !== -1 && t >= eruption) {
      postBeats++

      const difference = pairSub(
        clockAmplitude(seeded),
        clockAmplitude(vacuum),
      )

      if (
        Math.abs(Math.sqrt(pairAbs2(difference)) - ROOT3) < 1e-9
      ) {
        recoherenceBeats++
      }
    }
  }

  const n = supports.length
  const lateSlope = (supports[n - 1]! - supports[n - 11]!) / 10
  // the relative growth over the last two 8-beat windows: an exponential keeps it constant, a
  // train that grows by adding length makes it fall
  const lateRatio = supports[n - 1]! / Math.max(supports[n - 9]!, 1)
  const earlierRatio =
    supports[n - 9]! / Math.max(supports[n - 17]!, 1)

  return {
    frontHits,
    frontChecks,
    eruption,
    finalSupport: supports[n - 1]!,
    maxSlotsPerCell,
    lateSlope,
    lateRatio,
    earlierRatio,
    recoherenceBeats,
    postBeats,
  }
}

export default experiment({
  id: 'foundations/wake-is-particle-plus-radiation',
  code: 'E-FND-0099',
  title:
    "the traveller's wake characterized as radiation behind an intact particle: at every sampled beat through and past the eruption a difference slot sits at the particle's exact free-flight position (read from the no-slab control, at two sizes, the particle never stops or dissolves), the wake's growth is honestly detector-sized (support reaching the same order as the offset-2 response in the same geometry, decelerating, under two slots per cell), so growth does not separate emission from detection, and what does is the intact particle plus the recoherence, the total amplitude recoheres to exactly root three on a fifth to a third of post-eruption beats (partial coherence pure decoherence cannot give), and the eruption beat is deterministic per geometry with no simple law across sides (recorded), so the crossing is transparent for the particle while the medium responds at detector scale around it, emission-with-survival rather than absorption, and whether the response carries or records is the named next measurement",
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // side 15 erupts five beats later than side 13 in this geometry, so it runs five beats longer
    // and the two late windows compare wakes of the same age
    const at13 = wakeStudy({ side: 13, slab: true, beats: 40 })
    const at15 = wakeStudy({ side: 15, slab: true, beats: 45 })
    const free13 = wakeStudy({ side: 13, slab: false, beats: 40 })
    // the internal yardstick: the offset-2 slab is the DETECTOR class (E-FND-0095), so its growth
    // ratio in the same geometry is what amplification looks like here
    const detector13 = wakeStudy({
      side: 13,
      slab: true,
      beats: 40,
      birth: 2,
    })

    const particleSurvives =
      at13.frontHits === at13.frontChecks &&
      at15.frontHits === at15.frontChecks
    const neverAccelerates =
      at13.lateRatio <= at13.earlierRatio &&
      at15.lateRatio <= at15.earlierRatio
    const detectorComparable =
      detector13.finalSupport > 100 && at13.finalSupport > 100
    const thin =
      at13.maxSlotsPerCell < 2 && at15.maxSlotsPerCell < 2
    const partiallyCoherent =
      at13.recoherenceBeats >= 3 && at15.recoherenceBeats >= 3
    const freeClean =
      free13.eruption === -1 && free13.finalSupport === 1

    const ok =
      particleSurvives &&
      neverAccelerates &&
      detectorComparable &&
      thin &&
      partiallyCoherent &&
      freeClean

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the ballistic front cell holds a difference slot at every check at both sizes, the relative growth decelerates, both the wake and the detector responses exceed a hundred slots (comparable, reported), no cell averages two slots, recoherence occurs at least three times post-eruption at both sizes, and the free control never erupts',
      metrics: {
        frontHitsSide13: at13.frontHits,
        frontChecksSide13: at13.frontChecks,
        frontHitsSide15: at15.frontHits,
        eruptionSide13: at13.eruption,
        eruptionSide15: at15.eruption,
        lateSlopeSide13: Number(at13.lateSlope.toFixed(1)),
        lateGrowthRatioSide13: Number(at13.lateRatio.toFixed(2)),
        earlierGrowthRatioSide13: Number(
          at13.earlierRatio.toFixed(2),
        ),
        lateGrowthRatioSide15: Number(at15.lateRatio.toFixed(2)),
        earlierGrowthRatioSide15: Number(
          at15.earlierRatio.toFixed(2),
        ),
        maxSlotsPerCell: Number(
          Math.max(at13.maxSlotsPerCell, at15.maxSlotsPerCell).toFixed(
            2,
          ),
        ),
        recoherenceSide13: at13.recoherenceBeats,
        recoherencePostBeats13: at13.postBeats,
      },
      // CONTROL: the free particle (no slab, no wake, ever) and the offset-2 detector (what real
      // amplification measures in this geometry)
      control: {
        freeEruption: free13.eruption,
        freeFinalSupport: free13.finalSupport,
        detectorLateRatio: Number(detector13.lateRatio.toFixed(2)),
        detectorFinalSupport: detector13.finalSupport,
      },
      notes:
        'the eruption beats measured across sides 9 through 17 (11, 23, 11, 16, 14) are deterministic but fit no one-line law tried (position at eruption, beats after slab exit, side parity, clock residue), an open structural question. The reading for the base decision: the traveller knit needs no repair for the particle itself, and what E-FND-0096 called the wake is a candidate emission process whose own transport law is the next measurement (see E-FND-0100).',
    })
  },
})
