// Breadth-first shell traversal on a neighbors graph. The single most duplicated block in the experiments
// (62 files reinvented the "fill(-1), BFS, count per shell, take a branching ratio" loop). One canonical
// home, neighbors-native so a CellGraph (number[][]) and a tool Graph (Uint32Array[]) both feed it. The
// shell-growth on a typed Substrate stays in measure/dimension.ts (ballGrowth), this is its plain-neighbors
// sibling, and both share the same BFS shape.

type Neighbors = ReadonlyArray<ReadonlyArray<number>>

// BFS from a root, returning the geodesic depth of every node and the size of each shell.
export function bfsShells(input: {
  neighbors: Neighbors
  root?: number
}): { depth: Int32Array; shellCounts: number[] } {
  const neighbors = input.neighbors
  const n = neighbors.length
  const root = input.root ?? 0
  const depth = new Int32Array(n).fill(-1)
  if (n === 0) return { depth, shellCounts: [] }
  depth[root] = 0
  let frontier = [root]
  const shellCounts: number[] = [1]
  while (frontier.length) {
    const next: number[] = []
    for (const u of frontier) {
      const row = neighbors[u] ?? []
      for (let k = 0; k < row.length; k++) {
        const v = row[k]!
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
      for (let k = 0; k < row.length; k++) {
        const v = row[k]!
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
