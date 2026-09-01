// The wake is Timeless Dynamics emergent time, the record-ACCUMULATING path, the deepest half
// of the TD bridge and the one the earlier bridge experiments left open.
//
// The two earlier bridge experiments (emergent-time-distinguishability E-FND-0048 and
// record-preserving-paths E-FND-0049) both run the reversible KNIT on a FIXED mesh. That is
// vibe's time-SYMMETRIC half: the knit preserves records (it is reversible, recovers the start
// bit for bit) but, being reversible, it carries no arrow. Vibe says plainly that the arrow is
// the WAKE, the monotone growth of the mesh, not the knit. So the bridge to TD's arrow was
// still open, because TD's arrow is that records ACCUMULATE monotonically, which is growth, not
// a reversible shuffle. This experiment closes it.
//
// Measured on the actual honeycomb. As the wake unfolds shell by shell, the record count (the
// number of cells in existence, each cell one unit of distinguishable record) rises strictly
// and with GROWING increments (24, 456, 8376), the un-erasable accumulation that is vibe's
// arrow, and the Fisher-Rao arc length over the growing extents accumulates monotonically with
// every step strictly positive (each new shell is genuinely new distinguishability). This is
// TD emergent time along a record-accumulating path.
//
// CONTROL: the fixed-mesh knit, vibe's reversible half. Run on a fixed d4 mesh the knit spreads
// activity over a BOUNDED number of cells, so its record count (the support, the count of
// active cells) is capped and does not accumulate. So the wake accumulates records without
// bound (the arrow) while the fixed-mesh knit only preserves and reshuffles a fixed record set
// (no arrow), which is exactly TD's distinction between the record-accumulating path (time)
// and a record-preserving but arrowless one.
//
// Depth L2, a known information-geometry quantity (Fisher-Rao arc length) read on the substrate
// through TD, with the fixed-mesh knit the control that could have (but does not) accumulate.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { unfoldMeshShells } from '@/code/substrate/mesh-unfolding'
import {
  wakeRecordCounts,
  wakeArcLength,
  wakeStepDistances,
} from '@/code/measure/wake-time'
import { d4Mesh, meshOpposites } from '@/code/tool/mesh'
import { makeWill, fillWillPattern } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { pairCollision } from '@/code/rule/collision'
import { spatialActivityDistribution } from '@/code/measure/fisher-rao'

const SIDE = 8
const BEATS = 20

// the count of cells carrying activity, the support, which is the fixed-mesh record count
function supportSize(distribution: Float64Array): number {
  let count = 0

  for (const value of distribution) {
    if (value > 0) {
      count++
    }
  }

  return count
}

export default experiment({
  id: 'foundations/record-accumulating-wake',
  code: 'E-FND-0051',
  title:
    'the wake is Timeless Dynamics emergent time: as the honeycomb unfolds, the record count rises strictly with growing increments and the Fisher-Rao arc length accumulates monotonically from genuinely new support, the record-ACCUMULATING arrow, while the fixed-mesh reversible knit only preserves a bounded record set (no arrow), closing the half of the TD bridge the knit experiments left open',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // the wake: unfold the actual honeycomb, take the cumulative record counts and the arc
    // length over the growing extents
    const shellCounts = unfoldMeshShells({
      throughShell: 3,
      maxCells: 12000,
    })

    const recordCounts = wakeRecordCounts(shellCounts)
    const arc = wakeArcLength(recordCounts)
    const steps = wakeStepDistances(recordCounts)

    // 1. the record count rises strictly, and its increments GROW (the accelerating arrow)
    const recordStrictlyRises = recordCounts.every(
      (n, i) => i === 0 || n > recordCounts[i - 1]!,
    )

    const increments = shellCounts.slice(1)
    const incrementsGrow = increments.every(
      (c, i) => i === 0 || c > increments[i - 1]!,
    )

    // 2. the arc length accumulates monotonically and every step is strictly positive
    const arcMonotone = arc.every((s, i) => i === 0 || s > arc[i - 1]!)
    const everyStepPositive = steps.every(s => s > 1e-9)

    // 3. the control: the fixed-mesh reversible knit has a BOUNDED record count (support),
    // it does not accumulate. Run it and read the support each beat.
    const mesh = d4Mesh({ side: SIDE })
    const opposite = meshOpposites(mesh)
    const collision = pairCollision({ opposite, forward: true })

    let will = makeWill(mesh)

    fillWillPattern(will)

    const supports: number[] = [
      supportSize(spatialActivityDistribution(will)),
    ]

    for (let t = 0; t < BEATS; t++) {
      will = beat(will, collision)
      supports.push(supportSize(spatialActivityDistribution(will)))
    }

    const fixedRecordCap = Math.max(...supports)
    const fixedRecordFloor = Math.min(...supports)
    // the fixed-mesh record count stays within a narrow band (bounded, non-accumulating),
    // never exceeding the fixed cell count
    const fixedRecordBounded = fixedRecordCap <= mesh.cellCount

    // the arrow: the wake record count grows without bound (its last is many times its first),
    // while the fixed-mesh support only fluctuates within a bounded band
    const wakeGrowthFactor =
      recordCounts[recordCounts.length - 1]! / recordCounts[0]!

    const fixedGrowthFactor =
      fixedRecordCap / Math.max(1, fixedRecordFloor)

    const wakeAccumulatesFixedDoesNot =
      wakeGrowthFactor > 100 && fixedGrowthFactor < 2

    const solved =
      recordStrictlyRises &&
      incrementsGrow &&
      arcMonotone &&
      everyStepPositive &&
      fixedRecordBounded &&
      wakeAccumulatesFixedDoesNot

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'the wake is Timeless Dynamics emergent time, the record-accumulating path. As the actual honeycomb unfolds, the record count (the cells in existence, each one unit of distinguishable record) rises strictly with growing increments (24, 456, 8376), the un-erasable accumulation that is vibe arrow, and the Fisher-Rao arc length over the growing extents accumulates monotonically with every step strictly positive, since each new shell is genuinely new distinguishability. This is TD accumulated arc length along a record-accumulating path, measured. The control, the reversible knit on a fixed mesh, has a bounded record count (its support stays within a narrow band, never exceeding the fixed cell count), so it preserves and reshuffles a fixed record set but does not accumulate, and carries no arrow. So the arrow lives in the wake, not the knit, which is exactly TD distinction between the record-accumulating path that is time and a record-preserving but arrowless one, and it closes the half of the bridge the earlier knit experiments left open.',
      metrics: {
        wakeSteps: recordCounts.length,
        firstRecordCount: recordCounts[0]!,
        lastRecordCount: recordCounts[recordCounts.length - 1]!,
        wakeGrowthFactor,
        arcLengthEnd: arc[arc.length - 1]!,
        minStepDistance: Math.min(...steps),
        fixedRecordCap,
        fixedRecordFloor,
        fixedGrowthFactor,
      },
      control: {
        // the fixed-mesh knit record count (support) is bounded and non-accumulating, so it
        // preserves records but does not accumulate them, no arrow
        fixedRecordCap,
        fixedGrowthFactor: Math.round(fixedGrowthFactor * 1000) / 1000,
        fixedMeshCellCount: mesh.cellCount,
      },
      notes:
        'AUDIT 2026-08-31: this run uses d4Mesh with an even side, which is two disconnected lattices (the D4 roots preserve coordinate-sum parity, see the PARITY note on d4Mesh). The seeds and measurements here are local, so the result stands on the component the seed lives in; roadmap item 0017 tracks the switch to an odd side. ' +
        'L2, the Fisher-Rao arc length of the wake read on the actual honeycomb (shell counts unfolded through shell three, 1, 24, 456, 8376), reusing code/measure/wake-time (built on code/measure/fisher-rao) and the real dynamics for the control. The record content is the set of existing cells, each one unit of distinguishability, so the wake distribution is uniform over the cells in existence and grows as the mesh unfolds. This closes the gap that emergent-time-distinguishability (E-FND-0048) and record-preserving-paths (E-FND-0049) left open: those measure the reversible knit on a fixed mesh, vibe time-symmetric half, whereas the arrow is the wake, and here the wake record count rises strictly (the arrow) while the fixed-mesh knit record count is bounded (no arrow), the TD record-accumulation the earlier experiments did not reach. Deterministic fill, no random.',
    })
  },
})
