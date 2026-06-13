// Holographic measurements on a tiling. The Ryu-Takayanagi scaling: the entanglement entropy of a
// boundary interval is the length of the minimal bulk surface anchored on the interval's endpoints. In
// a 2D bulk that minimal surface is the bulk GEODESIC between the two endpoints, and its length is the
// RT entropy. On a HYPERBOLIC (negatively curved, holographic) tiling the geodesic dips into the bulk and
// its length grows as LOG of the boundary interval (the 2D CFT area law, S ~ (c/3) log L). On a FLAT
// tiling the minimal path hugs the boundary and grows LINEARLY with the interval (a volume law). The
// log-versus-linear scaling is the holographic signature.

const bfsGeodesic = (neighbors: number[][], from: number, to: number): number => {
  const distance = new Int32Array(neighbors.length).fill(-1)
  distance[from] = 0
  let frontier = [from]
  while (frontier.length) {
    const next: number[] = []
    for (const node of frontier) {
      for (const neighbor of neighbors[node]!) {
        if (distance[neighbor] === -1) {
          distance[neighbor] = distance[node]! + 1
          if (neighbor === to) return distance[neighbor]!
          next.push(neighbor)
        }
      }
    }
    frontier = next
  }
  return distance[to]!
}

// least-squares slope and residual of y against x
const fit = (x: number[], y: number[]): { slope: number; residual: number } => {
  const n = x.length
  const meanX = x.reduce((a, b) => a + b, 0) / n
  const meanY = y.reduce((a, b) => a + b, 0) / n
  let cov = 0
  let varX = 0
  for (let i = 0; i < n; i++) {
    cov += (x[i]! - meanX) * (y[i]! - meanY)
    varX += (x[i]! - meanX) ** 2
  }
  const slope = cov / varX
  let residual = 0
  for (let i = 0; i < n; i++) residual += (y[i]! - (meanY + slope * (x[i]! - meanX))) ** 2
  return { slope, residual }
}

export function ryuTakayanagiScaling(input: {
  neighbors: number[][]
  coords: number[][]
  arcs?: number[]
}): {
  arcs: number[]
  geodesics: number[]
  logResidual: number
  linearResidual: number
  isLogarithmic: boolean
} {
  const { neighbors, coords } = input
  const n = neighbors.length

  // the center is the cell closest to the origin, the boundary is the outer two shells
  let center = 0
  let nearest = Infinity
  for (let i = 0; i < n; i++) {
    const radius = Math.hypot(...coords[i]!)
    if (radius < nearest) {
      nearest = radius
      center = i
    }
  }
  const depth = new Int32Array(n).fill(-1)
  depth[center] = 0
  let frontier = [center]
  let maxDepth = 0
  while (frontier.length) {
    const next: number[] = []
    for (const node of frontier) {
      for (const neighbor of neighbors[node]!) {
        if (depth[neighbor] === -1) {
          depth[neighbor] = depth[node]! + 1
          maxDepth = Math.max(maxDepth, depth[neighbor]!)
          next.push(neighbor)
        }
      }
    }
    frontier = next
  }
  const center2D = coords[center]!
  const boundary = [...Array(n).keys()]
    .filter((i) => depth[i]! >= maxDepth - 1)
    .sort(
      (i, j) =>
        Math.atan2(coords[i]![1]! - center2D[1]!, coords[i]![0]! - center2D[0]!) -
        Math.atan2(coords[j]![1]! - center2D[1]!, coords[j]![0]! - center2D[0]!),
    )
  const boundaryCount = boundary.length

  const arcs = (input.arcs ?? [2, 4, 8, 16, 32]).filter((arc) => arc < boundaryCount / 2)
  // average the geodesic over several start points around the boundary, for robustness
  const geodesics = arcs.map((arc) => {
    let sum = 0
    let count = 0
    const stride = Math.max(1, Math.floor(boundaryCount / 8))
    for (let start = 0; start < boundaryCount; start += stride) {
      sum += bfsGeodesic(neighbors, boundary[start]!, boundary[(start + arc) % boundaryCount]!)
      count++
    }
    return sum / count
  })

  const logFit = fit(arcs.map((arc) => Math.log(arc)), geodesics)
  const linearFit = fit(arcs, geodesics)
  return {
    arcs,
    geodesics,
    logResidual: logFit.residual,
    linearResidual: linearFit.residual,
    isLogarithmic: logFit.residual < linearFit.residual,
  }
}
