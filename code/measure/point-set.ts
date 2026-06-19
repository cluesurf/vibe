// Shape measures for a set of occupied lattice cells. Two reps are supported.
//
// A "cell set" is a Set of comma-joined integer coordinate keys, e.g. "0,0" in 2D or
// "1,2,3" in 3D. These come from reading the occupied cells of a pattern frame, where a
// string key is the natural deduplicating identity. The centroid, recentering, jaccard
// overlap, and radius of gyration on this rep are the standard "is it a localized
// propagating self" measures (same FORM in a co-moving frame, compactness through time).
//
// A "cell id set" is a Set of integer cell ids, where the jaccard distance is the
// turnover (1 - intersection-over-union) of one frame versus the next.

const parseKey = (key: string): number[] => key.split(',').map(Number)

// Centroid of a cell set, the mean of each coordinate. Works in any dimension.
export function centroidOfCellSet(cells: Set<string>): number[] {
  const sums: number[] = []
  for (const key of cells) {
    const point = parseKey(key)
    for (let d = 0; d < point.length; d++) {
      sums[d] = (sums[d] ?? 0) + point[d]!
    }
  }
  const size = Math.max(1, cells.size)
  return sums.map(s => s / size)
}

// Translate a cell set so its (rounded) centroid sits at the origin, giving the pattern
// in a co-moving frame so two frames can be compared for the same FORM.
export function recenterCellSet(cells: Set<string>): Set<string> {
  const centroid = centroidOfCellSet(cells).map(c => Math.round(c))
  const out = new Set<string>()
  for (const key of cells) {
    const point = parseKey(key)
    out.add(point.map((v, d) => v - (centroid[d] ?? 0)).join(','))
  }
  return out
}

// Overlap of two cell sets, intersection over the larger size, in [0,1]. A value near 1
// means the same occupied cells (same FORM when the sets are recentered first).
export function cellSetOverlap(a: Set<string>, b: Set<string>): number {
  let intersection = 0
  for (const key of a) {
    if (b.has(key)) {
      intersection++
    }
  }
  return intersection / Math.max(1, Math.max(a.size, b.size))
}

// Radius of gyration of a cell set, the root-mean-square distance of its cells from the
// centroid. A self stays compact, so this does not grow without bound over time.
export function radiusOfGyrationOfCellSet(cells: Set<string>): number {
  const centroid = centroidOfCellSet(cells)
  let sum = 0
  for (const key of cells) {
    const point = parseKey(key)
    let d2 = 0
    for (let d = 0; d < point.length; d++) {
      d2 += (point[d]! - (centroid[d] ?? 0)) ** 2
    }
    sum += d2
  }
  return Math.sqrt(sum / Math.max(1, cells.size))
}

// Jaccard distance of two integer cell-id sets, one minus intersection over union, in
// [0,1]. The turnover of a self, the fraction of its membership that flowed through.
export function jaccardDistance(
  a: Set<number>,
  b: Set<number>,
): number {
  let intersection = 0
  for (const x of a) {
    if (b.has(x)) {
      intersection++
    }
  }
  const union = a.size + b.size - intersection
  return union > 0 ? 1 - intersection / union : 0
}
