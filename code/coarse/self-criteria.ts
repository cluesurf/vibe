// The three self-criteria of the multi-level-selves plan, as reusable measures (E1). A cluster is a genuine
// self when it has a Markov blanket (its shell screens interior from exterior), autopoietic closure (the
// interior regenerates the boundary), and a cognitive light cone (it corrects perturbations within a
// radius). This module gives the statistical primitives, the experiments supply the dynamics and controls.

export type Graph = {
  cellCount: number
  offsets: Int32Array
  adj: Int32Array
}

// Pearson correlation of two equal-length series.
export function correlation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)

  if (n === 0) {
    return 0
  }

  let mx = 0
  let my = 0

  for (let i = 0; i < n; i++) {
    mx += x[i]!
    my += y[i]!
  }

  mx /= n
  my /= n
  let sxy = 0
  let sxx = 0
  let syy = 0

  for (let i = 0; i < n; i++) {
    const dx = x[i]! - mx
    const dy = y[i]! - my
    sxy += dx * dy
    sxx += dx * dx
    syy += dy * dy
  }

  const d = Math.sqrt(sxx * syy)

  return d > 1e-12 ? sxy / d : 0
}

// Partial correlation of x and y controlling for z. Near zero means z screens x from y, the Markov-blanket
// signature when z is the shell, x the interior, and y the exterior.
export function partialCorrelation(
  x: number[],
  y: number[],
  z: number[],
): number {
  const rxy = correlation(x, y)
  const rxz = correlation(x, z)
  const ryz = correlation(y, z)
  const d = Math.sqrt((1 - rxz * rxz) * (1 - ryz * ryz))

  return d > 1e-12 ? (rxy - rxz * ryz) / d : 0
}

// The Markov-blanket screening of an interior, shell, exterior triple of time series. The raw coupling is
// the interior-exterior correlation. The screened coupling conditions on the shell. The reduction is how
// much the shell removes, near 1 for a clean blanket (the shell fully screens), near 0 for none.
export function blanketScreening(input: {
  interior: number[]
  shell: number[]
  exterior: number[]
}): { raw: number; screened: number; reduction: number } {
  const raw = Math.abs(correlation(input.interior, input.exterior))
  const screened = Math.abs(
    partialCorrelation(input.interior, input.exterior, input.shell),
  )

  const reduction = raw > 1e-6 ? (raw - screened) / raw : 0

  return { raw, screened, reduction }
}

// Partition a cluster into interior (cells whose neighbors are all in the cluster), shell (the rest of the
// cluster, its boundary), and exterior (cells outside the cluster adjacent to the shell).
export function regionPartition(input: {
  cluster: number[]
  graph: Graph
}): { interior: number[]; shell: number[]; exterior: number[] } {
  const { cluster, graph } = input
  const inSet = new Set(cluster)
  const interior: number[] = []
  const shell: number[] = []
  const exteriorSet = new Set<number>()

  for (const c of cluster) {
    let allIn = true

    for (let p = graph.offsets[c]!; p < graph.offsets[c + 1]!; p++) {
      const w = graph.adj[p]!

      if (!inSet.has(w)) {
        allIn = false
        exteriorSet.add(w)
      }
    }

    if (allIn) {
      interior.push(c)
    } else {
      shell.push(c)
    }
  }

  return { interior, shell, exterior: [...exteriorSet] }
}

// Graph distances from a source cell by breadth-first search, used to size a cognitive light cone.
export function distancesFrom(input: {
  graph: Graph
  source: number
}): Int32Array {
  const { graph, source } = input
  const dist = new Int32Array(graph.cellCount).fill(-1)
  dist[source] = 0
  let frontier = [source]

  while (frontier.length) {
    const next: number[] = []

    for (const u of frontier) {
      for (let p = graph.offsets[u]!; p < graph.offsets[u + 1]!; p++) {
        const w = graph.adj[p]!

        if (dist[w] === -1) {
          dist[w] = dist[u]! + 1
          next.push(w)
        }
      }
    }

    frontier = next
  }

  return dist
}
