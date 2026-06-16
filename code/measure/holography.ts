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

// BFS distance from a source over the full graph, or restricted to an allowed node set.
const bfsField = (neighbors: number[][], source: number, allowed?: Set<number>): Int32Array => {
  const distance = new Int32Array(neighbors.length).fill(-1)
  distance[source] = 0
  let frontier = [source]
  while (frontier.length) {
    const next: number[] = []
    for (const node of frontier) {
      for (const neighbor of neighbors[node]!) {
        if (distance[neighbor] === -1 && (!allowed || allowed.has(neighbor))) {
          distance[neighbor] = distance[node]! + 1
          next.push(neighbor)
        }
      }
    }
    frontier = next
  }
  return distance
}

// The Ryu-Takayanagi scaling for any-dimension bulk, measured intrinsically (no embedding angle). For two cells
// in the boundary band, L is their WITHIN-BOUNDARY geodesic distance and S is their THROUGH-BULK geodesic
// distance, the discrete minimal surface anchored on the pair. On a HYPERBOLIC bulk the bulk provides a shortcut
// so S grows as the LOG of L (the holographic area law, the bulk geodesic dips through the small-diameter
// interior), with a sub-linear S/L slope. On a FLAT bulk there is no shortcut, S equals L (slope one, a volume
// law). The saturated plateau (S at the graph diameter) is excluded so the fit is clean. Returns the slope and
// the log-versus-linear residuals, the holographic signature.
export function bulkShortcutScaling(input: {
  neighbors: number[][]
  coords: number[][]
  bandWidth?: number
}): { slope: number; logResidual: number; linearResidual: number; isLogarithmic: boolean } {
  const { neighbors, coords } = input
  const bandWidth = input.bandWidth ?? 2
  const n = neighbors.length
  const norm = (v: number[]): number => Math.sqrt(v.reduce((s, x) => s + x * x, 0))

  // center = closest to the origin, radial depth, the boundary band = the outer `bandWidth` shells (the cusp)
  let center = 0
  let nearest = Infinity
  for (let i = 0; i < n; i++) {
    const radius = norm(coords[i]!)
    if (radius < nearest) {
      nearest = radius
      center = i
    }
  }
  const depth = bfsField(neighbors, center)
  let maxDepth = 0
  for (let i = 0; i < n; i++) if (depth[i]! > maxDepth) maxDepth = depth[i]!
  const band = new Set([...Array(n).keys()].filter((i) => depth[i]! > maxDepth - bandWidth))

  const anchor = [...band][0]!
  const within = bfsField(neighbors, anchor, band) // within the boundary band
  const through = bfsField(neighbors, anchor) // through the full bulk

  // mean through-bulk distance S at each within-boundary distance L
  const byL = new Map<number, number[]>()
  for (const cell of band) {
    const l = within[cell]!
    const s = through[cell]!
    if (l > 0 && s >= 0) {
      if (!byL.has(l)) byL.set(l, [])
      byL.get(l)!.push(s)
    }
  }
  let ls: number[] = []
  let ss: number[] = []
  for (const l of [...byL.keys()].sort((a, b) => a - b)) {
    const arr = byL.get(l)!
    if (arr.length >= 3) {
      ls.push(l)
      ss.push(arr.reduce((a, b) => a + b, 0) / arr.length)
    }
  }
  // exclude the saturated plateau (S near the graph diameter), keep the strictly informative regime
  const maxS = Math.max(...ss)
  const unsaturated = ss.map((s) => s < 0.9 * maxS)
  ls = ls.filter((_, i) => unsaturated[i])
  ss = ss.filter((_, i) => unsaturated[i])

  const logFit = fit(ls.map((l) => Math.log(l)), ss)
  const linearFit = fit(ls, ss)
  const slope = (ss[ss.length - 1]! - ss[0]!) / (ls[ls.length - 1]! - ls[0]!)
  return {
    slope,
    logResidual: logFit.residual,
    linearResidual: linearFit.residual,
    isLogarithmic: logFit.residual < linearFit.residual,
  }
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
