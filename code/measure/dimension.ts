// Dimension estimators. Two paths: the Myrheim-Meyer order-theoretic estimator
// for causal sets (reads dimension off the ordering fraction), and ball-growth
// for graphs where there is no Lorentzian order.

import { linearFit, logLogSlope } from '@/code/measure/regression'
import { Poset, relationCount } from '@/code/tool/poset'
import { Substrate, undirectedAdjacency } from '@/code/tool/substrate'

// Lanczos approximation to the natural log of the gamma function. Standard
// coefficients (g = 7, n = 9). Accurate to ~1e-10 for the range we solve over.
const LANCZOS_G = 7
const LANCZOS_COEFFICIENTS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
]

function lgamma(x: number): number {
  if (x < 0.5) {
    // Reflection formula for the left half-plane.
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x)
  }

  const z = x - 1

  let a = LANCZOS_COEFFICIENTS[0] ?? 0

  const t = z + LANCZOS_G + 0.5

  for (let i = 1; i < LANCZOS_COEFFICIENTS.length; i++)
    a += (LANCZOS_COEFFICIENTS[i] ?? 0) / (z + i)

  return (
    0.5 * Math.log(2 * Math.PI) +
    (z + 0.5) * Math.log(t) -
    t +
    Math.log(a)
  )
}

// The Myrheim-Meyer relation: expected ordering fraction inside an interval as a
// function of dimension d. f(d) = (1/2) * gamma(d+1) gamma(d/2) / gamma(3d/2).
// Check: f(1) = 1 (every pair on a line is causally related) and f(2) = 1/2 (two
// points in a causal diamond are comparable with probability 1/2). f is monotone
// decreasing in d, so bisection on f(d) = r is well posed.
function myrheimMeyerFraction(d: number): number {
  const logValue = lgamma(d + 1) + lgamma(d / 2) - lgamma((3 * d) / 2)

  return 0.5 * Math.exp(logValue)
}

// Invert the Myrheim-Meyer relation: dimension from an ordering fraction r, by
// bisection on f(d) = r over [0.5, 12]. r <= 0 returns 0.
export function dimensionFromOrderingFraction(r: number): number {
  if (r <= 0) return 0

  let lo = 0.5
  let hi = 12

  // f is decreasing: f(lo) is the largest value, f(hi) the smallest. If r lies
  // outside the bracket, clamp to the nearest endpoint.
  if (r >= myrheimMeyerFraction(lo)) return lo

  if (r <= myrheimMeyerFraction(hi)) return hi

  for (let iteration = 0; iteration < 80; iteration++) {
    const mid = 0.5 * (lo + hi)
    const fMid = myrheimMeyerFraction(mid)

    if (fMid > r) {
      // mid dimension too small (fraction too high), move right.
      lo = mid
    } else hi = mid
  }

  return 0.5 * (lo + hi)
}

// Estimate the effective dimension of a causal set from its ordering fraction.
export function myrheimMeyerDimension(input: { poset: Poset }): number {
  const n = input.poset.size

  if (n < 2) return 0

  const totalPairs = (n * (n - 1)) / 2

  return dimensionFromOrderingFraction(
    relationCount(input.poset) / totalPairs,
  )
}

// Cumulative count of nodes within each radius 0..maxRadius, by BFS over the
// undirected adjacency. growth[k] is the size of the ball of radius k.
export function ballGrowth(input: {
  substrate: Substrate
  center: number
  maxRadius: number
}): Uint32Array {
  const adjacency = undirectedAdjacency({ substrate: input.substrate })
  const size = input.substrate.size
  const growth = new Uint32Array(input.maxRadius + 1)
  const distance = new Int32Array(size).fill(-1)

  distance[input.center] = 0

  let frontier: number[] = [input.center]
  let reached = 1

  growth[0] = reached

  for (let radius = 1; radius <= input.maxRadius; radius++) {
    const next: number[] = []

    for (const node of frontier) {
      const row = adjacency[node] ?? new Uint32Array(0)

      for (const value of row) {
        const neighbor = value ?? 0

        if ((distance[neighbor] ?? -1) === -1) {
          distance[neighbor] = radius
          reached++
          next.push(neighbor)
        }
      }
    }

    growth[radius] = reached
    frontier = next

    if (next.length === 0) {
      // No more reachable nodes: every larger ball is the same size.
      for (let r = radius + 1; r <= input.maxRadius; r++)
        growth[r] = reached

      break
    }
  }

  return growth
}

// The ball-growth (box-counting) dimension of a graph given as a neighbor list, averaged over a set of
// centers. For each center it does a BFS, accumulates the cumulative ball size N(r) out to maxRadius,
// and fits the log-log slope of N(r) versus r (the exponent d in N ~ r^d). Averaging over interior
// centers gives the spatial dimension of the graph, the (d-1)-space of a coexisting spacetime slice.
export function ballGrowthDimension(input: {
  neighbors: readonly (readonly number[])[]
  centers: readonly number[]
  maxRadius: number
}): number {
  const { neighbors, centers, maxRadius } = input
  const slopes: number[] = []

  for (const c of centers) {
    const dist = new Map<number, number>()

    dist.set(c, 0)

    let frontier = [c]

    const counts: number[] = new Array(maxRadius + 1).fill(0)

    counts[0] = 1

    for (let r = 1; r <= maxRadius; r++) {
      const nextFrontier: number[] = []

      for (const v of frontier) {
        for (const w of neighbors[v] ?? []) {
          if (!dist.has(w)) {
            dist.set(w, r)
            nextFrontier.push(w)
          }
        }
      }

      counts[r] = counts[r - 1]! + nextFrontier.length
      frontier = nextFrontier
    }

    const xs: number[] = []
    const ys: number[] = []

    for (let r = 1; r <= maxRadius; r++) {
      if (counts[r]! > counts[r - 1]!) {
        xs.push(r)
        ys.push(counts[r]!)
      }
    }

    if (xs.length >= 2) slopes.push(logLogSlope(xs, ys))
  }

  return slopes.reduce((a, b) => a + b, 0) / Math.max(1, slopes.length)
}

// The box-counting (Minkowski) dimension of a set of cells on an L x L grid, where cell i has x = i %
// L and y = floor(i / L). For each box size b it counts how many b x b boxes the set touches, then fits
// the slope of log N(b) versus log(1/b). A space-filling sheet gives dimension near 2, a thin film
// less. Returns 0 for sets too small to fit.
export function boxCountingDimension(input: {
  cells: readonly number[]
  sideLength: number
  boxSizes?: readonly number[]
}): number {
  const { cells, sideLength: L } = input

  if (cells.length < 4) return 0

  const sizes = input.boxSizes ?? [2, 4, 8, 16, 32]
  const inverseBoxSizes: number[] = []
  const boxCounts: number[] = []

  for (const b of sizes) {
    const boxes = new Set<number>()
    const K = Math.ceil(L / b)

    for (const i of cells) {
      const x = i % L
      const y = Math.floor(i / L)

      boxes.add(Math.floor(x / b) * K + Math.floor(y / b))
    }

    inverseBoxSizes.push(1 / b)
    boxCounts.push(boxes.size)
  }

  return logLogSlope(inverseBoxSizes, boxCounts)
}

// Is a substrate's reachability (ball growth) exponential? Picks the highest-degree
// cell as centre, takes the cumulative ball growth out to maxRadius, and averages the
// per-step ratios in the UNSATURATED regime (ball below half the final size). The mean
// ratio above `threshold` (default 1.8) is the exponential-reach signature of a
// negatively curved substrate. The substrate-survey sibling of growthIsExponential,
// with the survey's own thresholds.
export function reachIsExponential(input: {
  substrate: Substrate
  maxRadius?: number
  threshold?: number
}): boolean {
  const { substrate } = input
  const maxRadius = input.maxRadius ?? 16
  const threshold = input.threshold ?? 1.8
  const adjacency = undirectedAdjacency({ substrate })

  let center = 0
  let best = -1

  for (let i = 0; i < substrate.size; i++) {
    const d = (adjacency[i] ?? new Uint32Array(0)).length

    if (d > best) {
      best = d
      center = i
    }
  }

  const growth = ballGrowth({ substrate, center, maxRadius })
  const final = growth[growth.length - 1] ?? 1
  const ratios: number[] = []

  for (let r = 1; r < growth.length; r++) {
    const prev = growth[r - 1] ?? 0
    const cur = growth[r] ?? 0

    if (prev >= 2 && prev < 0.5 * final && cur > prev)
      ratios.push(cur / prev)
  }

  return (
    ratios.length > 0 &&
    ratios.reduce((a, b) => a + b, 0) / ratios.length > threshold
  )
}

// Heuristic: is ball growth exponential rather than polynomial? Look at the late
// log-differences of the cumulative counts. Exponential growth has a roughly
// constant, positive log-slope; polynomial growth has a log-slope that decays
// toward zero. We compare the average late slope against a small threshold and
// check that the slope does not collapse the way r^d does at large r.
export function growthIsExponential(input: {
  growth: Uint32Array
}): boolean {
  const g = input.growth
  const last = g[g.length - 1] ?? 0

  if (g.length < 4 || last < 8) return false

  // Successive ball-count ratios in the UNSATURATED regime (count below 60% of
  // the final size). Saturation from a finite substrate would otherwise drive
  // every late ratio toward 1 and hide exponential growth.
  const ratios: number[] = []

  for (let r = 1; r < g.length; r++) {
    const prev = g[r - 1] ?? 0
    const cur = g[r] ?? 0

    if (prev >= 4 && cur > prev && cur < 0.6 * last)
      ratios.push(cur / prev)
  }

  if (ratios.length < 2) return false

  const mean = ratios.reduce((sum, s) => sum + s, 0) / ratios.length
  const first = ratios[0] ?? 1
  const lastRatio = ratios[ratios.length - 1] ?? 1

  // Exponential growth keeps the per-step ratio multiplicative and roughly flat.
  // Polynomial growth (r^d) has ratios that decay toward 1 as r grows.
  return mean > 1.4 && lastRatio > 0.7 * first
}

// The mean per-step ball-growth ratio over the UNSATURATED radii, i.e. the average
// of growth[r] / growth[r-1] across radii where the ball is still growing and is
// below `saturationFraction` of the final size (so finite-substrate saturation does
// not drag the ratio toward 1). Only radii with growth[r-1] >= minimumPrevious
// count. Returns NaN when no radius qualifies. Exponential reach shows a mean ratio
// well above 1; polynomial reach decays toward 1.
export function meanUnsaturatedGrowthRatio(input: {
  growth: Uint32Array
  minimumPrevious?: number
  saturationFraction?: number
}): number {
  const g = input.growth
  const minimumPrevious = input.minimumPrevious ?? 2
  const saturationFraction = input.saturationFraction ?? 0.5
  const final = g[g.length - 1] ?? 1
  const ratios: number[] = []

  for (let r = 1; r < g.length; r++) {
    const prev = g[r - 1] ?? 0
    const cur = g[r] ?? 0

    if (
      prev >= minimumPrevious &&
      prev < saturationFraction * final &&
      cur > prev
    )
      ratios.push(cur / prev)
  }

  if (ratios.length === 0) return NaN

  return ratios.reduce((a, b) => a + b, 0) / ratios.length
}

// The GEOMETRIC mean of the unsaturated per-step ball-growth ratios, i.e.
// exp(mean(log(growth[r+1]/growth[r]))) over radii where the ball is still growing
// and below `saturationFraction` of the final size, counting only radii with
// growth[r] > minimumPrevious. The geometric mean is more robust than the
// arithmetic one at constant density (where the disc saturates fast). Above 1 for
// exponential reach; toward 1 for polynomial growth. Returns 0 when no radius
// qualifies.
export function geometricUnsaturatedGrowthRatio(input: {
  growth: Uint32Array
  total: number
  minimumPrevious?: number
  saturationFraction?: number
}): number {
  const { growth, total } = input
  const minimumPrevious = input.minimumPrevious ?? 1
  const saturationFraction = input.saturationFraction ?? 0.6

  let logSum = 0
  let count = 0

  for (let r = 0; r + 1 < growth.length; r++) {
    const cur = growth[r] ?? 0
    const next = growth[r + 1] ?? 0

    if (
      cur > minimumPrevious &&
      cur < saturationFraction * total &&
      next > cur
    ) {
      logSum += Math.log(next / cur)
      count += 1
    }
  }

  return count > 0 ? Math.exp(logSum / count) : 0
}

// The boundary two-point correlator falloff exponent of a Bethe lattice (regular tree)
// of coordination number `degree`. With branching b = degree - 1, the smallest root
// mu = (degree - sqrt(degree^2 - 4b)) / (2b) of the recurrence gives the correlator
// decay G(r) ~ r^(-alpha) with alpha = 2 ln(1/mu) / ln(b). A flat-bulk 3D hyperbolic
// honeycomb (degree 12) reads alpha near 2, the clean 1/r^2 falloff. Returns 0 when
// the branching is too small (degree <= 2) for the formula. Rounded to two decimals.
export function betheCorrelatorExponent(degree: number): number {
  const b = degree - 1

  if (b <= 1) return 0

  const mu = (degree - Math.sqrt(degree * degree - 4 * b)) / (2 * b)

  return Math.round(((2 * Math.log(1 / mu)) / Math.log(b)) * 100) / 100
}

// The spectral dimension of a graph from a lazy random-walk return probability. A
// lazy walk (stay with probability 1/2, otherwise step to a uniform neighbour) keeps
// P(t) = probability of being back at the start after t steps, and on a
// d_s-dimensional space P(t) ~ t^(-d_s/2), so d_s = -2 dlogP/dlogt read between two
// times t1 and t2. Isolated nodes (degree 0) are absorbing. Neighbors-native so a
// CellGraph (number[][]) feeds it directly.
export function spectralDimension(input: {
  neighbors: readonly (readonly number[])[]
  start: number
  t1: number
  t2: number
}): number {
  const { neighbors, start, t1, t2 } = input
  const N = neighbors.length

  let p = new Float64Array(N)

  p[start] = 1

  let np = new Float64Array(N)

  const P: number[] = []

  for (let t = 0; t <= t2; t++) {
    P.push(p[start]!)
    np.fill(0)

    for (let i = 0; i < N; i++) {
      const pi = p[i]!

      if (!pi) continue

      const row = neighbors[i] ?? []
      const d = row.length

      if (d === 0) {
        np[i] = np[i]! + pi
        continue
      }

      np[i] = np[i]! + 0.5 * pi

      const sh = (0.5 * pi) / d

      for (const j of row) np[j] = np[j]! + sh
    }

    const tmp = p

    p = np
    np = tmp
  }

  return (
    (-2 * (Math.log(P[t2]!) - Math.log(P[t1]!))) /
    (Math.log(t2) - Math.log(t1))
  )
}

// Spatial dimension read INTRINSICALLY off shell counts (no coordinates). On a flat
// mesh of dimension d the shell |S(r)| ~ r^(d-1), so the log-log slope of |S| against
// r over a window [rLo, rHi] is d-1 and the dimension is that plus one. Returns the
// dimension and the fit quality r2. shell[r] is the number of nodes at exactly graph
// distance r (e.g. bfsShells(...).shellCounts).
export function shellDimension(input: {
  shell: readonly number[]
  rLo: number
  rHi: number
}): { dimension: number; r2: number } {
  const xs: number[] = []
  const ys: number[] = []

  for (let r = input.rLo; r <= input.rHi; r++) {
    xs.push(Math.log(r))
    ys.push(Math.log(input.shell[r] ?? 1))
  }

  const f = linearFit({ xs, ys })

  return { dimension: f.slope + 1, r2: f.r2 }
}

// The power-law (log-log) fit quality of shell counts over [rLo, rHi]. High on a flat
// mesh (shells grow as a power of r), lower on a curved mesh (shells grow
// exponentially), so it pairs with shellExponentialFit to classify curvature.
export function shellPowerR2(input: {
  shell: readonly number[]
  rLo: number
  rHi: number
}): number {
  const xs: number[] = []
  const ys: number[] = []

  for (let r = input.rLo; r <= input.rHi; r++) {
    xs.push(Math.log(r))
    ys.push(Math.log(input.shell[r] ?? 1))
  }

  return linearFit({ xs, ys }).r2
}

// Effective dimension and average shell ratio from a list of shell sizes. The
// dimension is the log-log slope of the CUMULATIVE count C(r) ~ r^d (so a Euclidean
// disk reads near 2, a ball near 3), and the ratio is the mean shell-to-shell growth
// (near 1 for flat, well above 1 for exponential/curved). Used to classify an
// extracted sheet as flat (polynomial) versus the bulk's exponential growth.
export function growthFromShells(sizes: readonly number[]): {
  dim: number
  ratio: number
} {
  const cum: number[] = []

  let s = 0

  for (const x of sizes) {
    s += x
    cum.push(s)
  }

  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  let m = 0

  for (let r = 1; r < cum.length; r++) {
    const x = Math.log(r + 1)
    const y = Math.log(cum[r]!)

    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
    m++
  }

  const dim = m > 1 ? (m * sxy - sx * sy) / (m * sxx - sx * sx) : 0

  let rs = 0
  let rc = 0

  for (let r = 2; r < sizes.length; r++) {
    if (sizes[r - 1]! > 0) {
      rs += sizes[r]! / sizes[r - 1]!
      rc++
    }
  }

  return { dim, ratio: rc > 0 ? rs / rc : 0 }
}

// The exponential growth ratio of shell counts over [rLo, rHi]. On a negatively
// curved mesh |S(r)| ~ g^r, so the slope of log|S| against r (linear, not log-log) is
// log g and the growth ratio is exp(slope). A ratio above 1 with a higher r2 than the
// power-law fit is the fingerprint of hyperbolic curvature.
export function shellExponentialFit(input: {
  shell: readonly number[]
  rLo: number
  rHi: number
}): { growthRatio: number; r2: number } {
  const xs: number[] = []
  const ys: number[] = []

  for (let r = input.rLo; r <= input.rHi; r++) {
    xs.push(r)
    ys.push(Math.log(input.shell[r] ?? 1))
  }

  const f = linearFit({ xs, ys })

  return { growthRatio: Math.exp(f.slope), r2: f.r2 }
}
