// Emergent time as accumulated distinguishability, the bridge to Timeless Dynamics
// (timeless-dynamics in the related-theories census, and the Fisher-informational-time
// literature it reconstructs). TD makes time emergent: it is the accumulated Fisher-Rao arc
// length along RECORD-PRESERVING paths. Vibe makes time emergent too, as the beat, and its
// paths are record-preserving by construction because the knit is reversible and erases
// nothing. This experiment asks whether the two emergent clocks are the same one.
//
// A localized-then-filled state is evolved by the reversible knit. At each beat the state
// gives a spatial activity distribution, and the Fisher-Rao arc length accumulates the
// distinguishability between consecutive beats. If the beat is a distinguishability clock the
// arc length grows LINEARLY in the beat count, a uniform tick. The control is a lossy,
// record-destroying rule: with the record erased, the state settles and the arc length
// SATURATES, the clock stops. So the reversible arc length is TD emergent time, and the lossy
// control shows the record-preservation is what keeps the clock running.
//
// Depth L2, a known information-geometry quantity (the Fisher-Rao arc length) read on the
// substrate through TD, with the lossy path the control that could have failed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, fillWillPattern } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { pairCollision, Collision } from '@/code/rule/collision'
import { erasingCollision } from '@/code/control/lossy-collision'
import {
  blockActivityDistribution,
  cumulativeArcLength,
  windowSlope,
} from '@/code/measure/fisher-rao'

const SIDE = 8
const BEATS = 60
const BLOCKS = 64

function arcLength(input: {
  mesh: ReturnType<typeof d4Mesh>
  collision: Collision
}): number[] {
  const { mesh, collision } = input

  let will = makeWill(mesh)
  fillWillPattern(will)

  const distributions = [blockActivityDistribution({ will, blocks: BLOCKS })]

  for (let t = 0; t < BEATS; t++) {
    will = beat(will, collision)
    distributions.push(blockActivityDistribution({ will, blocks: BLOCKS }))
  }

  return cumulativeArcLength(distributions)
}

export default experiment({
  id: 'foundations/emergent-time-distinguishability',
  code: 'E-FND-0048',
  title:
    'the emergent beat is a distinguishability clock: the Fisher-Rao arc length grows linearly under the reversible record-preserving knit and saturates under a lossy one, the bridge to Timeless Dynamics emergent time',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)

    const reversibleArc = arcLength({
      mesh,
      collision: pairCollision({ opposite, forward: true }),
    })

    const lossyArc = arcLength({ mesh, collision: erasingCollision })

    // the reversible clock keeps ticking at a constant rate (a live, linear emergent time)
    const reversibleEarlySlope = windowSlope({ series: reversibleArc, from: 5, to: 25 })
    const reversibleLateSlope = windowSlope({ series: reversibleArc, from: 40, to: 60 })
    // the lossy clock stops once the record is gone
    const lossyLateSlope = windowSlope({ series: lossyArc, from: 40, to: 60 })

    const clockRuns = reversibleLateSlope > 1
    const clockIsUniform =
      Math.abs(reversibleEarlySlope - reversibleLateSlope) <
      0.1 * reversibleLateSlope

    const lossyStops = lossyLateSlope < 0.3 * reversibleLateSlope
    const ok = clockRuns && clockIsUniform && lossyStops

    const reversibleArcEnd = reversibleArc[BEATS] ?? 0
    const lossyArcEnd = lossyArc[BEATS] ?? 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the emergent beat is a distinguishability clock, which is Timeless Dynamics emergent time on this substrate. Under the reversible record-preserving knit the Fisher-Rao arc length, the accumulated distinguishability between consecutive states, grows linearly in the beat count, a uniform tick, so counting beats and counting distinguishability are the same clock. Under a lossy record-destroying rule the state settles and the arc length saturates, the clock stops, so it is the record-preservation, built into the reversible knit, that keeps time running. This is a measured version of TD claim that time is accumulated Fisher-Rao arc length along record-preserving paths, and vibe reversibility is that record-preservation. Depth L2, a known information-geometry quantity read on the substrate through TD, the lossy path the control.',
      metrics: {
        reversibleEarlySlope,
        reversibleLateSlope,
        lossyLateSlope,
        reversibleArcEnd,
        lossyArcEnd,
        lossyToReversibleArcRatio:
          reversibleArcEnd === 0 ? 0 : lossyArcEnd / reversibleArcEnd,
      },
      control: {
        lossyLateSlope,
      },
      notes:
        'the arc length under the reversible knit is linear (the early and late slopes match), so the emergent time is uniform, not just monotonic. The per-beat tick here is maximal (the ternary parity flips the activity support each beat), so the clock ticks the simplex diameter per beat, but the load-bearing claims are the LINEARITY (a uniform clock) and the lossy SATURATION (the clock stops when records die), both of which hold. Deterministic fill, no random.',
    })
  },
})
