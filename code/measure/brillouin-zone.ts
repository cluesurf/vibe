// Read the structure of a band function over the Brillouin-zone torus: where
// its zeros are, whether they are isolated points or extended lines, and the
// group velocity of a cone around a band-touching point. The zero scan works
// in reciprocal fractions (s1, s2) on the unit torus, the cone velocities in
// Cartesian momentum.

import { proportionalFit } from '@/code/measure/regression'

export interface TorusZeroScan {
  // the number of connected near-zero clusters on the grid
  clusterCount: number
  // the pixel count of each cluster, descending
  clusterSizes: number[]
  // the centroid of each cluster in reciprocal fractions, same order as clusterSizes
  clusterCentroids: { s1: number; s2: number }[]
  // the total number of grid points below the threshold
  nearZeroCount: number
  // the smallest band value among grid points outside every cluster
  minimumOutsideClusters: number
}

// Scan |band| on a resolution x resolution grid over the unit torus, mark the
// points below the threshold, and group the marked points into connected
// clusters (8-neighbour adjacency with periodic wrap). An isolated conical
// zero shows up as a small cluster whose pixel count stays O(1) when the
// threshold scales as 1/resolution, a zero LINE shows up as a cluster whose
// pixel count grows linearly with resolution. Centroids are taken with
// minimal-image offsets from each cluster's first pixel, so a cluster
// straddling the torus seam still reads out one location.
export function scanTorusZeroSet(input: {
  band: (s1: number, s2: number) => number
  resolution: number
  threshold: number
}): TorusZeroScan {
  const { band, resolution, threshold } = input
  const n = resolution
  const marked = new Uint8Array(n * n)

  let nearZeroCount = 0
  let minimumOutsideClusters = Infinity

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const value = Math.abs(band(i / n, j / n))

      if (value < threshold) {
        marked[i * n + j] = 1
        nearZeroCount++
      } else if (value < minimumOutsideClusters) {
        minimumOutsideClusters = value
      }
    }
  }

  const wrap = (delta: number): number => {
    if (delta > n / 2) {
      return delta - n
    }

    if (delta < -n / 2) {
      return delta + n
    }

    return delta
  }

  const seen = new Uint8Array(n * n)
  const clusters: { size: number; s1: number; s2: number }[] = []
  const stack: number[] = []

  for (let start = 0; start < n * n; start++) {
    if (!marked[start] || seen[start]) {
      continue
    }

    const startI = Math.floor(start / n)
    const startJ = start % n

    let size = 0
    let sumI = 0
    let sumJ = 0

    stack.push(start)
    seen[start] = 1

    while (stack.length > 0) {
      const cell = stack.pop()!
      const i = Math.floor(cell / n)
      const j = cell % n

      size++
      sumI += startI + wrap(i - startI)
      sumJ += startJ + wrap(j - startJ)

      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) {
            continue
          }

          const ni = (i + di + n) % n
          const nj = (j + dj + n) % n
          const neighbour = ni * n + nj

          if (marked[neighbour] && !seen[neighbour]) {
            seen[neighbour] = 1
            stack.push(neighbour)
          }
        }
      }
    }

    const centroidI = (((sumI / size) % n) + n) % n
    const centroidJ = (((sumJ / size) % n) + n) % n
    clusters.push({ size, s1: centroidI / n, s2: centroidJ / n })
  }

  clusters.sort((a, b) => b.size - a.size)

  return {
    clusterCount: clusters.length,
    clusterSizes: clusters.map(c => c.size),
    clusterCentroids: clusters.map(c => ({ s1: c.s1, s2: c.s2 })),
    nearZeroCount,
    minimumOutsideClusters,
  }
}

// The torus distance between two points in reciprocal fractions, each
// coordinate taken modulo 1 with the minimal image.
export function torusFractionDistance(
  a: { s1: number; s2: number },
  b: { s1: number; s2: number },
): number {
  const d1 = Math.abs(a.s1 - b.s1)
  const d2 = Math.abs(a.s2 - b.s2)

  return Math.hypot(Math.min(d1, 1 - d1), Math.min(d2, 1 - d2))
}

// Sample |E| on rays of small radius q out of a band-touching point, one ray
// per direction, and fit E = v q through the origin on each. Returns the
// fitted velocity and the r^2 per direction. An isotropic linear cone gives
// the same v in every direction with r^2 near 1, a flat direction (a zero
// LINE through the point) gives v near 0 along the line, and a quadratic
// touching gives a poor through-origin linear fit.
export function directionalConeVelocities(input: {
  energy: (kx: number, ky: number) => number
  centerX: number
  centerY: number
  radii: readonly number[]
  directionCount: number
}): { velocities: number[]; rSquares: number[] } {
  const { energy, centerX, centerY, radii, directionCount } = input
  const velocities: number[] = []
  const rSquares: number[] = []

  for (let d = 0; d < directionCount; d++) {
    const theta = (2 * Math.PI * d) / directionCount
    const ux = Math.cos(theta)
    const uy = Math.sin(theta)
    const energies = radii.map(q =>
      energy(centerX + q * ux, centerY + q * uy),
    )

    const fit = proportionalFit({ xs: [...radii], ys: energies })
    velocities.push(fit.slope)
    rSquares.push(fit.r2)
  }

  return { velocities, rSquares }
}
