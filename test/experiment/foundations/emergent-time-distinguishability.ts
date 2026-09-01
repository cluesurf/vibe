// The geometry of the fixed-mesh knit path in distinguishability space, and why it is NOT the
// arrow. This corrects the earlier version of this experiment, which read a cell's content as
// its NET CHARGE (the signed sum of its slots). The net charge cancels: a charge-balanced cell
// full of tone reads as empty, so the old distribution was all zeros and the Fisher-Rao
// distance between two empty distributions is the constant arccos(0) doubled, a spurious flat
// "pi per beat clock". That number measured nothing. The content is now read as OCCUPANCY (the
// count of occupied directional slots, cellActivity), which never sums the signed tones (the
// knit still only merges and streams them), so a live state reads as live.
//
// With the honest measure, a localized packet (a single tone streaming ballistically) shows the
// real geometry, and it is the opposite of a smooth TD geodesic:
//   - NEAR-MAXIMAL STEPS. Each beat the packet fully relocates, so consecutive occupancy
//     distributions are nearly disjoint and the per-step Fisher-Rao distance is near pi, the
//     simplex diameter. This is the discreteness signature: on the raw discrete substrate
//     distinguishability jumps maximally per beat, it does not flow smoothly.
//   - A RECURRENT CLOSED LOOP. The knit is reversible on a finite mesh, so the packet returns to
//     its start, the distribution comes back to where it began. The path is a closed loop, not a
//     one-way advance, so it carries no arrow.
//   - FAR FROM GEODESIC. The accumulated path length is many times the direct Fisher-Rao
//     distance between the start and the farthest state, so the path wanders and returns rather
//     than moving along a shortest curve. It is not a TD geodesic.
// So TD's smooth geodesic flow is a CONTINUUM idealization, not a property of the raw discrete
// knit, and the monotone one-way TD time is the WAKE (record-accumulating-wake, E-FND-0051),
// not this reversible loop.
//
// CONTROL: a lossy erasing rule destroys the packet, so the loop never closes (the distribution
// never returns to its start), which is the record-destruction that breaks both the recurrence
// and the reversibility.
//
// Depth L2, the Fisher-Rao path geometry of the knit read honestly on the substrate through TD,
// with the lossy rule the control and the wake the monotone counterpart.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { loneParticle } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { pairCollision } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import {
  spatialActivityDistribution,
  fisherRaoDistance,
} from '@/code/measure/fisher-rao'

const SIDE = 16
const BEATS = 40

function pathGeometry(input: {
  mesh: ReturnType<typeof d4Mesh>
  collision: ReturnType<typeof pairCollision>
}): {
  stepDistances: number[]
  fromStart: number[]
} {
  const { mesh, collision } = input

  let will = loneParticle(mesh, 0, 0, 1)

  const start = spatialActivityDistribution(will)

  let previous = start

  const stepDistances: number[] = []
  const fromStart: number[] = []

  for (let t = 0; t < BEATS; t++) {
    will = beat(will, collision)

    const current = spatialActivityDistribution(will)

    stepDistances.push(fisherRaoDistance(previous, current))
    fromStart.push(fisherRaoDistance(start, current))
    previous = current
  }

  return { stepDistances, fromStart }
}

export default experiment({
  id: 'foundations/emergent-time-distinguishability',
  code: 'E-FND-0048',
  title:
    'the fixed-mesh reversible knit is NOT TD emergent time: read honestly (occupancy, not the cancelling net charge) a localized packet traces a recurrent closed loop in distinguishability space with near-maximal discrete steps and a path length far exceeding the direct distance, so it is not a geodesic and carries no arrow, and the monotone TD time is the wake, not the knit',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)

    const reversible = pathGeometry({
      mesh,
      collision: pairCollision({ opposite, forward: true }),
    })

    // near-maximal steps: the average of the non-trivial steps is close to the simplex diameter
    const movingSteps = reversible.stepDistances.filter(d => d > 0.1)
    const meanMovingStep =
      movingSteps.reduce((s, d) => s + d, 0) /
      Math.max(1, movingSteps.length)

    const stepsAreNearMaximal = meanMovingStep > 3.0 // pi is about 3.1416

    // recurrent closed loop: the distribution returns to its start (reversible), so the minimum
    // distance-from-start after the first beat is essentially zero
    const returnDistance = Math.min(...reversible.fromStart)
    const pathRecurs = returnDistance < 1e-6

    // far from geodesic: the path length hugely exceeds the direct distance to the farthest state
    const pathLength = reversible.stepDistances.reduce(
      (s, d) => s + d,
      0,
    )

    const maxGeodesic = Math.max(...reversible.fromStart)
    const pathToGeodesicRatio = pathLength / Math.max(1e-9, maxGeodesic)
    const notGeodesic = pathToGeodesicRatio > 3

    // control: a lossy erasing rule destroys the packet, so the loop never closes
    const lossy = pathGeometry({ mesh, collision: erasingCollision })
    const lossyReturnDistance = Math.min(...lossy.fromStart.slice(1))
    const lossyNeverRecurs = lossyReturnDistance > 1e-6

    const solved =
      stepsAreNearMaximal &&
      pathRecurs &&
      notGeodesic &&
      lossyNeverRecurs

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the fixed-mesh reversible knit is not TD emergent time and not a geodesic. Read honestly, as occupancy (the count of occupied slots, which never sums the signed tones the way the cancelling net charge did), a single ballistic tone traces a recurrent closed loop in Fisher-Rao distinguishability space: the per-step distance is near-maximal (close to the simplex diameter pi, the discreteness signature that on the raw substrate distinguishability jumps maximally per beat), the distribution returns exactly to its start (the reversible loop, so no arrow), and the accumulated path length is many times the direct distance to the farthest state (so the path wanders and returns, not a shortest curve, not a geodesic). A lossy erasing rule destroys the packet so the loop never closes. This corrects the earlier version, which read the net charge, compared all-zero distributions, and reported a spurious flat pi-per-beat clock. So TD smooth geodesic flow is a continuum idealization, not a property of the raw discrete knit, and the monotone one-way TD time is the wake (E-FND-0051), not this reversible loop.',
      metrics: {
        meanMovingStepDistance: meanMovingStep,
        returnDistance,
        pathLength,
        maxGeodesicDistance: maxGeodesic,
        pathToGeodesicRatio,
        lossyReturnDistance,
      },
      control: {
        // the lossy rule destroys the packet, so the distribution never returns to its start
        lossyReturnDistance,
        lossyNeverRecurs: lossyNeverRecurs ? 1 : 0,
      },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh). The seeds and measurements here are local, so the result stands on the component the seed lives in; roadmap item 0017 tracks the switch to an odd side. ' +
        'L2, the honest Fisher-Rao path geometry of the fixed-mesh knit, reusing code/measure/fisher-rao (now reading cellActivity, the occupancy count, not the cancelling net charge cellTone). The finding corrects and replaces the earlier claim: the knit path is a recurrent closed loop (reversible, returns to start, no arrow), takes near-maximal discrete steps (the discreteness signature), and is far from geodesic (path length many times the direct distance), so it is not the smooth TD geodesic and not a monotone clock. The monotone arrow and TD emergent time are the WAKE, measured in record-accumulating-wake (E-FND-0051), which this experiment now points to as its counterpart. The lossy rule is the control that breaks the recurrence. Deterministic initial condition (a single tone), no random.',
    })
  },
})
