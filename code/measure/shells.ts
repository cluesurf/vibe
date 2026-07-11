// Breadth-first shell traversal on a neighbors graph. The single most duplicated block in the experiments
// (62 files reinvented the "fill(-1), BFS, count per shell, take a branching ratio" loop). One canonical
// home, neighbors-native so a CellGraph (number[][]) and a tool Graph (Uint32Array[]) both feed it. The
// shell-growth on a typed Substrate stays in measure/dimension.ts (ballGrowth), this is its plain-neighbors
// sibling, and both share the same BFS shape.

type Neighbors = readonly ArrayLike<number>[]

// BFS from a root, returning the geodesic depth of every node and the size of each
// shell. maxRadius caps the traversal depth (the shell list then holds at most
// maxRadius + 1 entries), so callers that only read a near window do not pay for the
// whole graph.
export function bfsShells(input: {
  neighbors: Neighbors
  root?: number
  maxRadius?: number
}): { depth: Int32Array; shellCounts: number[] } {
  const neighbors = input.neighbors
  const n = neighbors.length
  const root = input.root ?? 0
  const maxRadius = input.maxRadius ?? Infinity
  const depth = new Int32Array(n).fill(-1)

  if (n === 0) return { depth, shellCounts: [] }

  depth[root] = 0

  let frontier = [root]

  const shellCounts: number[] = [1]

  let r = 0

  while (frontier.length && r < maxRadius) {
    r++

    const next: number[] = []

    for (const u of frontier) {
      const row = neighbors[u] ?? []

      for (const v of Array.from(row)) {
        if (depth[v]! < 0) {
          depth[v] = depth[u]! + 1
          next.push(v)
        }
      }
    }

    if (next.length) shellCounts.push(next.length)

    frontier = next
  }

  return { depth, shellCounts }
}

// The average shell-to-shell ratio over a window (default a stable middle window). The hyperbolic branching
// factor, or 1-ish for a flat graph. Skips the first ratios (transient) and any trailing truncated shell.
export function branchingRatio(input: {
  shellCounts: number[]
  from?: number
  to?: number
}): number {
  const s = input.shellCounts
  const from = input.from ?? 2
  const to = input.to ?? s.length - 1

  let sum = 0
  let count = 0

  for (let i = Math.max(1, from); i < Math.min(to, s.length); i++) {
    const prev = s[i - 1]!

    if (prev > 0) {
      sum += s[i]! / prev
      count++
    }
  }

  return count ? sum / count : 0
}

// The mean consecutive growth ratio of the MIDDLE shells (default window shells 2..7, skipping the
// lattice-artifact innermost shells and the saturating outer ones), rounded to two decimals. On a flat
// substrate this sits near a small constant; on a hyperbolic one it stays well above 1 (exponential).
// Returns 0 when the window has fewer than two shells.
export function midShellGrowthRatio(input: {
  shellCounts: readonly number[]
  from?: number
  to?: number
}): number {
  const { shellCounts } = input
  const from = input.from ?? 2
  const to = input.to ?? 8
  const mid = shellCounts.slice(from, Math.min(to, shellCounts.length))

  if (mid.length < 2) return 0

  let sum = 0

  for (let i = 1; i < mid.length; i++) sum += mid[i]! / mid[i - 1]!

  return Math.round((sum / (mid.length - 1)) * 100) / 100
}

// The geometric-mean growth ratio of a width (or shell-size) series across steps, exp(mean log(b/a)).
// The geometric mean is the natural average of a multiplicative expansion rate: a static front gives 1,
// a steadily expanding one gives a value above 1. Non-positive entries are skipped (no log).
export function geometricGrowthRatio(
  widths: readonly number[],
): number {
  let logSum = 0
  let count = 0

  for (let g = 1; g < widths.length; g++) {
    const a = widths[g - 1] ?? 1
    const b = widths[g] ?? 1

    if (a > 0 && b > 0) {
      logSum += Math.log(b / a)
      count += 1
    }
  }

  return count > 0 ? Math.exp(logSum / count) : 1
}

// The average metric-distance step between consecutive BFS shells around a center. For each
// shell (graph-distance label > 0) the mean metric distance from the center is taken, and the
// step is the average gap between successive shell means. On a hyperbolic substrate (distance =
// Poincare distance) this is the natural inter-shell spacing a localized mode moves through.
export function meanShellDistanceStep(input: {
  count: number
  center: number
  shell: ArrayLike<number>
  shellCount: number
  distance: (a: number, b: number) => number
}): number {
  const { count, center, shell, shellCount, distance } = input
  const maxShell = shellCount - 1
  const sums = new Float64Array(maxShell + 1)
  const counts = new Int32Array(maxShell + 1)

  for (let i = 0; i < count; i++) {
    const s = shell[i] ?? -1

    if (s > 0) {
      sums[s]! += distance(center, i)
      counts[s]! += 1
    }
  }

  const means: number[] = []

  for (let s = 1; s <= maxShell; s++) {
    if (counts[s]! > 0) means.push(sums[s]! / counts[s]!)
  }

  let stepSum = 0

  for (let i = 1; i < means.length; i++)
    stepSum += means[i]! - means[i - 1]!

  return means.length > 1 ? stepSum / (means.length - 1) : 0
}

// All nodes within a geodesic radius of the root (the ball, in BFS order).
export function geodesicBall(input: {
  neighbors: Neighbors
  root: number
  radius: number
}): number[] {
  const { neighbors, root, radius } = input
  const n = neighbors.length
  const seen = new Int8Array(n)
  const ball: number[] = []

  let frontier = [root]

  seen[root] = 1
  ball.push(root)

  for (let r = 0; r < radius && frontier.length; r++) {
    const next: number[] = []

    for (const u of frontier) {
      const row = neighbors[u] ?? []

      for (const v of Array.from(row)) {
        if (!seen[v]) {
          seen[v] = 1
          ball.push(v)
          next.push(v)
        }
      }
    }

    frontier = next
  }

  return ball
}
