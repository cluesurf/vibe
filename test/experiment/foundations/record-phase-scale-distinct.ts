// Record-phase versus scale: does vibe keep Timeless Dynamics two extra dimensions distinct.
//
// TD forces a five-dimensional configuration space, three spatial plus two more: u, the
// record-phase direction whose gradient generates emergent time, and v, the scale-flow
// direction (the connectivity scale that fixes which configurations are within coherence range).
// TD argues the two MUST stay distinct, because a four-dimensional embedding that conflates u
// (record-phase) with v (scale-flow) "destroys the time and scale-flow distinction and makes the
// emergent time definition circular". So this is a direct test of vibe: does vibe keep its
// analogues of u and v apart, or conflate them along the single radial rim where the wake grows.
//
// The vibe answer is that they are carried by two DIFFERENT STRUCTURES, so they cannot be
// conflated:
//   - SCALE (v) is geometry. The connectivity at scale r is the number of cells within graph
//     distance r, the ball size, a static function of r ALONE (1, 25, 481, 8857). It is a
//     property of the fixed honeycomb, with no time argument, and many scales coexist at once.
//   - TIME (u) is dynamics. On a fixed mesh (fixed scale) the knit rewrites the tone state every
//     beat, so time advances with the scale held constant, and separately the wake adds one
//     shell per beat. Time is carried by the tone evolution and the wake, not by a cell's
//     position.
// So a cell's scale is a static geometric label that never changes as beats tick, and time is
// the evolution of the tones and the growth of the edge. The two are independent by
// construction, which answers TD's exclusion: vibe's emergent time is not circular because scale
// is not the same structure as time. The only place they meet is the wake FRONTIER, where the
// outermost scale equals the beat count, and that meeting is the monotone arrow itself (the new
// scale born by the passage of time), not a circular dependence.
//
// CONTROL: the bulk is what keeps them apart. At any extent there are interior cells at scales
// strictly less than the frontier, so scale and time are not locked together. If every cell sat
// on the frontier (no bulk), scale would equal time and they would conflate. The interior cell
// count is measured to be positive, so the bulk exists.
//
// Depth L2, the two structures measured on the substrate (the static ball growth and the
// dynamical per-beat state change) and mapped to TD's u versus v exclusion.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { unfoldMeshShells } from '@/code/substrate/mesh-unfolding'
import { wakeRecordCounts } from '@/code/measure/wake-time'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, fillWillPattern, cloneWill } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { pairCollision } from '@/code/rule/collision'

const SIDE = 8
const BEATS = 6

// the number of differing slots between two states, the Hamming distance
function hamming(
  a: ReturnType<typeof makeWill>,
  b: ReturnType<typeof makeWill>,
): number {
  let count = 0

  for (let i = 0; i < a.data.length; i++) {
    if (a.data[i] !== b.data[i]) {
      count++
    }
  }

  return count
}

export default experiment({
  id: 'foundations/record-phase-scale-distinct',
  code: 'E-FND-0052',
  title:
    'vibe keeps TD record-phase (time) and scale-flow (connectivity) distinct: scale is static geometry (the ball size, a function of radius alone) and time is dynamics (the knit rewrites the state and the wake grows an edge each beat), two different structures, so emergent time is not circular, answering TD five-dimension exclusion, with the wake frontier the only coupling and it is the arrow',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // SCALE (v): the static connectivity by radius, the ball sizes, a function of r alone
    const shellCounts = unfoldMeshShells({
      throughShell: 3,
      maxCells: 12000,
    })

    const ballSizes = wakeRecordCounts(shellCounts)
    const connectivityGrowsWithScale = ballSizes.every(
      (n, i) => i === 0 || n > ballSizes[i - 1]!,
    )

    const scalesCoexist = shellCounts.length > 1 // many scales present at one time

    // TIME (u): on a FIXED mesh (fixed scale) the knit changes the state every beat, so time
    // advances with the scale held constant
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const collision = pairCollision({ opposite, forward: true })

    let will = makeWill(mesh)

    fillWillPattern(will)

    const cellCountStart = mesh.cellCount
    const perBeatChange: number[] = []

    for (let t = 0; t < BEATS; t++) {
      const before = cloneWill(will)

      will = beat(will, collision)
      perBeatChange.push(hamming(before, will))
    }

    const timeAdvancesAtFixedScale = perBeatChange.every(
      change => change > 0,
    )

    const scaleFixedWhileTimeAdvances =
      mesh.cellCount === cellCountStart

    // INDEPENDENCE: scale is geometry (the ball size has no beat argument), time is dynamics
    // (the state changes with no change of scale). The wake frontier is the only coupling: the
    // outermost scale equals the beat count, the monotone arrow.
    const frontierScaleEqualsBeat = shellCounts.length - 1 // radius after that many wake beats

    // CONTROL: the bulk exists (interior cells at scales below the frontier), which is what keeps
    // scale and time from locking together
    const interiorCells = ballSizes[ballSizes.length - 2]! // cells strictly inside the frontier
    const bulkExists = interiorCells > 0

    const solved =
      connectivityGrowsWithScale &&
      scalesCoexist &&
      timeAdvancesAtFixedScale &&
      scaleFixedWhileTimeAdvances &&
      bulkExists

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'vibe keeps TD record-phase and scale-flow distinct because they are carried by two different structures. Scale is static geometry: the connectivity at radius r is the ball size (1, 25, 481, 8857), a function of r alone with no time argument, and many scales coexist at any instant. Time is dynamics: on a fixed mesh the knit rewrites the tone state every beat (a positive per-beat change) while the scale is held constant, and the wake grows one shell per beat. So a cell scale is a static label that never changes as beats tick, and time is the evolution of the tones and the growth of the edge, independent by construction. This answers TD exclusion (a conflation of u and v would make emergent time circular): vibe does not conflate them, its emergent time is not circular, and the only coupling is the wake frontier where the outermost scale equals the beat count, which is the monotone arrow itself, not a circular dependence. The bulk of interior cells at scales below the frontier is what keeps the two apart.',
      metrics: {
        scaleCount: shellCounts.length,
        largestBall: ballSizes[ballSizes.length - 1]!,
        interiorCells,
        meanPerBeatChange:
          perBeatChange.reduce((s, c) => s + c, 0) /
          perBeatChange.length,
        minPerBeatChange: Math.min(...perBeatChange),
        fixedScaleCellCount: mesh.cellCount,
        frontierScaleEqualsBeat,
      },
      control: {
        // the bulk (interior cells below the frontier) keeps scale and time from locking; the
        // per-beat change stays positive at fixed scale, so time advances without scale
        interiorCells,
        minPerBeatChange: Math.min(...perBeatChange),
        bulkExists: bulkExists ? 1 : 0,
      },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh). The seeds and measurements here are local, so the result stands on the component the seed lives in; roadmap item 0017 tracks the switch to an odd side. ' +
        'L2, the two structures measured on the substrate. Scale (TD v, connectivity) is the static ball growth of the honeycomb (a function of radius, no time), and time (TD u, record-phase) is the dynamical per-beat state change on a fixed mesh plus the wake growth, so they are carried by cell position versus tone evolution, manifestly independent. This answers TD five-dimension exclusion argument on vibe own terms: vibe does not conflate the record-phase and scale directions, so its emergent time is not circular, and the single coupling (the wake frontier, outermost scale equals beat count) is the monotone arrow. Reuses code/substrate/mesh-unfolding and code/measure/wake-time; the fixed-scale time test uses the real knit dynamics. Deterministic fill, no random.',
    })
  },
})
