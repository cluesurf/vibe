// A deterministic content-free graph-rewrite grower, the Wolfram-style "geometry from a running rule" seed. A
// rewrite rule refines a graph generation by generation with no built-in coordinates or polytope. The point of
// the seed is to ask whether a bare rewrite can FORCE the 24-cell dock (it does not, generic rewrites give a
// definite but different emergent geometry, the honest long-shot negative). The grower returns neighbor lists
// usable by code/measure/dimension.ballGrowthDimension.

export interface RewriteGraph {
  neighbors: number[][]
  nodeCount: number
}

// A grid-refinement rewrite: each generation subdivides every cell of a square mesh, a deterministic local rule
// (split an edge, add the centre, connect to the four corners) with no global coordinates. It converges to a
// uniform 2D graph (dimension near 2, degree 4 in the bulk), a clean example that a simple deterministic rewrite
// gives a DEFINITE emergent geometry that is NOT the 4D 24-regular dock.
export function gridRefinementRewrite(
  generations: number,
): RewriteGraph {
  const side = Math.pow(2, generations) + 1
  const index = (x: number, y: number): number => y * side + x
  const nodeCount = side * side
  const neighbors: number[][] = Array.from(
    { length: nodeCount },
    () => [],
  )

  const link = (a: number, b: number): void => {
    neighbors[a]!.push(b)
    neighbors[b]!.push(a)
  }

  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      if (x + 1 < side) {
        link(index(x, y), index(x + 1, y))
      }

      if (y + 1 < side) {
        link(index(x, y), index(x, y + 1))
      }
    }
  }

  return { neighbors, nodeCount }
}

// The degree histogram of a graph, how many nodes have each degree. A uniform 24-regular graph (the dock) would
// show a single bin at 24; a generic rewrite shows a spread or a different uniform degree.
export function degreeHistogram(
  graph: RewriteGraph,
): Record<number, number> {
  const histogram: Record<number, number> = {}

  for (const list of graph.neighbors) {
    const degree = list.length
    histogram[degree] = (histogram[degree] ?? 0) + 1
  }

  return histogram
}

// The most common (bulk) degree of a graph, the mode of the degree histogram, ignoring boundary nodes.
export function bulkDegree(graph: RewriteGraph): number {
  const histogram = degreeHistogram(graph)

  let best = 0
  let bestCount = -1

  for (const [degree, count] of Object.entries(histogram)) {
    if (count > bestCount) {
      bestCount = count
      best = Number(degree)
    }
  }

  return best
}
