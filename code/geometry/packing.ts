// Sphere-packing and kissing-configuration helpers. A set of equal-norm directions is a KISSING configuration
// when every distinct pair subtends at least 60 degrees (normalized dot at most 1/2), the densest local contact
// shell. The 24-cell (the D4 roots) is the optimal 4D kissing shell, 24 directions, the proven 4D kissing
// number. These helpers also run a deterministic energy relaxation on the sphere, to test whether the dock
// SELF-ASSEMBLES from a generic start (it does not under local descent, an honest negative).

// the unit-normalized copy of a vector.
export function unit(vector: number[]): number[] {
  const norm = Math.hypot(...vector)

  return vector.map(value => value / norm)
}

function dot(a: number[], b: number[]): number {
  return a.reduce((sum, value, index) => sum + value * b[index]!, 0)
}

// The largest cosine between any two DISTINCT unit directions, the cosine of the minimum pairwise angle.
export function maxPairwiseCosine(directions: number[][]): number {
  const units = directions.map(unit)

  let maximum = -1

  for (let i = 0; i < units.length; i++) {
    for (let j = i + 1; j < units.length; j++) {
      maximum = Math.max(maximum, dot(units[i]!, units[j]!))
    }
  }

  return maximum
}

// Whether the directions are a kissing configuration: every distinct pair at least minAngle degrees apart.
export function isKissingConfiguration(
  directions: number[][],
  minAngleDegrees = 60,
): boolean {
  const threshold = Math.cos((minAngleDegrees * Math.PI) / 180)

  return maxPairwiseCosine(directions) <= threshold + 1e-9
}

// Whether any candidate direction can be added to the configuration while keeping every pair at least minAngle
// apart. For the 24-cell at 60 degrees this is false (24 is the 4D kissing maximum), so greedy densest growth is
// forced to the 24-coin.
export function canExtendKissing(
  directions: number[][],
  candidates: number[][],
  minAngleDegrees = 60,
): boolean {
  const threshold = Math.cos((minAngleDegrees * Math.PI) / 180)
  const units = directions.map(unit)

  return candidates.some(candidate => {
    const candidateUnit = unit(candidate)

    if (
      units.some(existing => dot(existing, candidateUnit) > 1 - 1e-9)
    ) {
      return false
    } // already present

    return units.every(
      existing => dot(existing, candidateUnit) <= threshold + 1e-9,
    )
  })
}

// The coordination histogram at the minimum angle: how many neighbors each direction has at the closest spacing.
// The 24-cell is 8-regular at 60 degrees, so a relaxed config is the 24-cell only if every count is 8.
export function coordinationAtMinAngle(
  directions: number[][],
): Record<number, number> {
  const units = directions.map(unit)
  const maximum = maxPairwiseCosine(directions)
  const histogram: Record<number, number> = {}

  for (let i = 0; i < units.length; i++) {
    let neighbors = 0

    for (let j = 0; j < units.length; j++) {
      if (
        i !== j &&
        Math.abs(dot(units[i]!, units[j]!) - maximum) < 0.02
      ) {
        neighbors++
      }
    }

    histogram[neighbors] = (histogram[neighbors] ?? 0) + 1
  }

  return histogram
}

// A DETERMINISTIC generic point set on the unit sphere in `dimension` dimensions, a golden-ratio spiral (no RNG).
// Used as the starting configuration for self-assembly tests, generic and not the target polytope.
export function deterministicSpiral(
  count: number,
  dimension: number,
): number[][] {
  const phi = (1 + Math.sqrt(5)) / 2
  const points: number[][] = []

  for (let index = 0; index < count; index++) {
    const coordinates: number[] = []

    let factor = 1

    for (let axis = 0; axis < dimension; axis++) {
      const angle = index * Math.pow(phi, axis + 1)

      if (axis < dimension - 1) {
        coordinates.push(factor * Math.sin(angle))
        factor *= Math.cos(angle)
      } else {
        coordinates.push(factor)
      }
    }

    points.push(unit(coordinates))
  }

  return points
}

// Relax points on the unit sphere under a repulsive Riesz potential by deterministic gradient descent, with a
// power-continuation schedule (soft to hard) and a decaying step. Returns the relaxed configuration. This tests
// whether a generic start FLOWS to the optimal packing. For 24 points on S^3 it does NOT reach the 24-cell, it
// traps near 55 degrees, the honest negative that local minimization does not self-assemble the dock.
export function relaxRiesz(
  start: number[][],
  options: {
    steps: number
    powerStart?: number
    powerEnd?: number
    stepSize?: number
  },
): number[][] {
  const dimension = start[0]!.length
  const count = start.length
  const powerStart = options.powerStart ?? 0.5
  const powerEnd = options.powerEnd ?? 4
  const baseStep = options.stepSize ?? 0.01

  let points = start.map(unit)

  for (let step = 0; step < options.steps; step++) {
    const progress = step / options.steps
    const power = powerStart + (powerEnd - powerStart) * progress
    const learningRate = baseStep * (1 - 0.9 * progress)
    const forces: number[][] = points.map(() =>
      new Array<number>(dimension).fill(0),
    )

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        if (i !== j) {
          const difference = points[i]!.map(
            (value, axis) => value - points[j]![axis]!,
          )

          const distanceSquared = difference.reduce(
            (sum, value) => sum + value * value,
            0,
          )

          const scale = power / Math.pow(distanceSquared, power / 2 + 1)

          for (let axis = 0; axis < dimension; axis++) {
            forces[i]![axis]! += scale * difference[axis]!
          }
        }
      }
    }

    points = points.map((point, index) =>
      unit(
        point.map(
          (value, axis) => value + learningRate * forces[index]![axis]!,
        ),
      ),
    )
  }

  return points
}
