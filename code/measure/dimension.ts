// Dimension estimators. Two paths: the Myrheim-Meyer order-theoretic estimator
// for causal sets (reads dimension off the ordering fraction), and ball-growth
// for graphs where there is no Lorentzian order. See testbed/04-measurements.md.

import { Poset, relationCount } from '~/core/poset'
import { Substrate, undirectedAdjacency } from '~/core/substrate'

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
    return (
      Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x)
    )
  }
  const z = x - 1
  let a = LANCZOS_COEFFICIENTS[0] ?? 0
  const t = z + LANCZOS_G + 0.5
  for (let i = 1; i < LANCZOS_COEFFICIENTS.length; i++) {
    a += (LANCZOS_COEFFICIENTS[i] ?? 0) / (z + i)
  }
  return (
    0.5 * Math.log(2 * Math.PI) +
    (z + 0.5) * Math.log(t) -
    t +
    Math.log(a)
  )
}

function tgamma(x: number): number {
  return Math.exp(lgamma(x))
}

// The Myrheim-Meyer relation: expected ordering fraction inside an interval as a
// function of dimension d. f(d) = (3/2) * gamma(d+1) gamma(d/2) / gamma(3d/2).
// f is monotone decreasing in d, so bisection on f(d) = r is well posed.
function myrheimMeyerFraction(d: number): number {
  const logValue =
    lgamma(d + 1) + lgamma(d / 2) - lgamma((3 * d) / 2)
  return 1.5 * Math.exp(logValue)
}

// Estimate the effective dimension of a causal set from its ordering fraction.
// r <= 0 (an antichain) returns 0. Solves f(d) = r by bisection on [0.5, 12].
export function myrheimMeyerDimension(input: { poset: Poset }): number {
  const n = input.poset.size
  if (n < 2) {
    return 0
  }
  const totalPairs = (n * (n - 1)) / 2
  const r = relationCount(input.poset) / totalPairs
  if (r <= 0) {
    return 0
  }

  let lo = 0.5
  let hi = 12
  // f is decreasing: f(lo) is the largest value, f(hi) the smallest. If r lies
  // outside the bracket, clamp to the nearest endpoint.
  const fLo = myrheimMeyerFraction(lo)
  const fHi = myrheimMeyerFraction(hi)
  if (r >= fLo) {
    return lo
  }
  if (r <= fHi) {
    return hi
  }
  for (let iteration = 0; iteration < 80; iteration++) {
    const mid = 0.5 * (lo + hi)
    const fMid = myrheimMeyerFraction(mid)
    if (fMid > r) {
      // mid dimension too small (fraction too high), move right.
      lo = mid
    } else {
      hi = mid
    }
  }
  return 0.5 * (lo + hi)
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
      for (let k = 0; k < row.length; k++) {
        const neighbor = row[k] ?? 0
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
      for (let r = radius + 1; r <= input.maxRadius; r++) {
        growth[r] = reached
      }
      break
    }
  }
  return growth
}

// Heuristic: is ball growth exponential rather than polynomial? Look at the late
// log-differences of the cumulative counts. Exponential growth has a roughly
// constant, positive log-slope; polynomial growth has a log-slope that decays
// toward zero. We compare the average late slope against a small threshold and
// check that the slope does not collapse the way r^d does at large r.
export function growthIsExponential(input: { growth: Uint32Array }): boolean {
  const g = input.growth
  if (g.length < 4) {
    return false
  }
  // Use the second half of the radii, where the asymptotic regime shows.
  const start = Math.max(1, Math.floor(g.length / 2))
  const slopes: number[] = []
  for (let r = start; r < g.length; r++) {
    const prev = g[r - 1] ?? 0
    const cur = g[r] ?? 0
    if (prev > 0 && cur > 0) {
      slopes.push(Math.log(cur) - Math.log(prev))
    }
  }
  if (slopes.length < 2) {
    return false
  }
  const mean =
    slopes.reduce((sum, s) => sum + s, 0) / slopes.length
  if (mean <= 0.15) {
    return false
  }
  // Polynomial growth: the log-slope decays markedly across the window.
  // Exponential growth: the log-slope stays roughly flat. Compare the last
  // slope to the first in the window.
  const first = slopes[0] ?? 0
  const last = slopes[slopes.length - 1] ?? 0
  const decayed = first > 0 && last < 0.5 * first
  return !decayed && mean > 0.15
}
