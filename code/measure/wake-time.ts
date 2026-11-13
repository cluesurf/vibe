// The wake as Timeless Dynamics emergent time, the record-ACCUMULATING half of the bridge.
//
// UNDER REVIEW (decision 001, one present, note/project/vibe/roadmap/one-present/review.md). The account below
// is the wrong picture, kept as written so the experiments that call this module can be read. Three claims in
// it fail under one present:
//
//   - "records" here are just the cells that exist. No state is evolved, so a count of cells is the mesh's size,
//     which says its age, but it is not a record and not an arrow. A record is a correlation inside the present
//     (one part of today's state matching another), and time's arrow is the second law (E-FND-0146, E-FND-0147).
//   - the wake "cannot be run backward" is wrong. The growth law writes each new dock in one fixed state and the
//     frontier reflects, so it is an injective map: run back, each newest shell returns to that state and leaves.
//     Item 0010 writes the inverse step and runs it to check.
//   - the wake is not time. It is how the one present grows: new docks join the present, they are not the
//     present, and the older docks are not a stored past.
//
// The verdicts that read time or an arrow off these counts (E-FND-0051, E-FND-0052, E-FND-0055's wake half,
// E-CSM-0001) are under review pending items 0012 and 0013. The arithmetic below is unchanged.
//
// The original account:
//
// TD makes time the accumulated Fisher-Rao arc length along RECORD-PRESERVING paths, and its
// arrow is that records accumulate monotonically and are never erased. Vibe has two dynamics,
// and they play two different TD roles. The knit is REVERSIBLE, so it PRESERVES records (a
// record made is a record kept, measured in record-preserving-paths), but being reversible it
// has no arrow. The WAKE is the monotone growth of the mesh, new cells born at the edge and
// none removed, and IT is what accumulates records and cannot be run backward (un-creating a
// cell is itself a new distinction). So the wake, not the knit, is TD's record-accumulating
// path, and this module measures its accumulated distinguishability.
//
// The record content of the wake is the set of existing cells: each cell, once created, is one
// unit of distinguishable record. So the distribution over the wake is uniform over the cells
// that exist, and as the wake unfolds a shell the support grows, the record count rises, and
// the Fisher-Rao arc length between consecutive extents accumulates, monotone, from genuinely
// new support each step. The record count is the measured shell growth of the actual honeycomb,
// not a posited sequence.

import {
  fisherRaoDistance,
  cumulativeArcLength,
} from '@/code/measure/fisher-rao'

// the cumulative record counts along the wake: the number of cells in existence after each
// shell is unfolded, the running total of the per-shell counts. Strictly increasing, the arrow.
export function wakeRecordCounts(
  shellCounts: readonly number[],
): number[] {
  const cumulative: number[] = []

  let total = 0

  for (const count of shellCounts) {
    total += count
    cumulative.push(total)
  }

  return cumulative
}

// the activity distribution over the wake once `recordCount` cells exist: uniform over those
// cells (each existing cell one unit of record), zero on the `total - recordCount` cells not
// yet created. This is the record distribution TD accumulates arc length along.
export function wakeDistribution(input: {
  recordCount: number
  total: number
}): Float64Array {
  const distribution = new Float64Array(input.total)

  for (let cell = 0; cell < input.recordCount; cell++) {
    distribution[cell] = 1 / input.recordCount
  }

  return distribution
}

// the cumulative Fisher-Rao arc length along the wake, over the sequence of growing uniform
// record distributions. This is TD emergent time accumulated along the record-accumulating
// path, computed with the same Fisher-Rao distance the knit bridge uses.
export function wakeArcLength(
  recordCounts: readonly number[],
): number[] {
  const total = recordCounts[recordCounts.length - 1] ?? 0
  const distributions = recordCounts.map(recordCount =>
    wakeDistribution({ recordCount, total }),
  )

  return cumulativeArcLength(distributions)
}

// the per-step Fisher-Rao distance between consecutive wake extents, the amount of new
// distinguishability each unfolded shell adds. Every step is strictly positive because each new
// shell adds support absent before, so the arc length cannot stall while the wake grows.
export function wakeStepDistances(
  recordCounts: readonly number[],
): number[] {
  const total = recordCounts[recordCounts.length - 1] ?? 0
  const steps: number[] = []

  for (let k = 1; k < recordCounts.length; k++) {
    const before = wakeDistribution({
      recordCount: recordCounts[k - 1]!,
      total,
    })

    const after = wakeDistribution({
      recordCount: recordCounts[k]!,
      total,
    })

    steps.push(fisherRaoDistance(before, after))
  }

  return steps
}
