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
    }
    // already present

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

// Grow a kissing configuration by DETERMINISTIC greedy insertion: walk the candidate directions in the given
// fixed order and accept each one that stays at least minAngle from every direction accepted so far. This is the
// constructive counterpart to `canExtendKissing`. Non-extendability of a known answer says the answer is
// maximal; it does NOT say a growth process arrives at it, because greedy insertion can JAM at a maximal
// configuration that is smaller than the optimum. Running the growth is the only way to tell the two apart.
export function greedyKissingGrowth(
  candidates: number[][],
  minAngle: number,
): number[][] {
  const limit = Math.cos((minAngle * Math.PI) / 180)
  const accepted: number[][] = []

  for (const candidate of candidates) {
    const direction = unit(candidate)
    let fits = true

    for (const held of accepted) {
      const cosine = held.reduce(
        (sum, value, axis) => sum + value * direction[axis]!,
        0,
      )

      // a tiny tolerance, so a pair sitting exactly at the limit angle counts as fitting
      if (cosine > limit + 1e-9) {
        fits = false
        break
      }
    }

    if (fits) {
      accepted.push(direction)
    }
  }

  return accepted
}

// The rotation-invariant fingerprint of a configuration: the sorted multiset of all pairwise cosines, rounded to
// `places`. Two configurations related by a rotation or reflection have identical spectra, so a spectrum match is
// NECESSARY for the two to be the same configuration up to rigid motion. It is not sufficient on its own, which
// is why callers pair it with the min angle and the coordination histogram rather than reading it as a proof of
// congruence.
export function cosineSpectrum(
  directions: number[][],
  places = 6,
): number[] {
  const scale = Math.pow(10, places)
  const spectrum: number[] = []

  for (let i = 0; i < directions.length; i++) {
    const left = unit(directions[i]!)

    for (let j = i + 1; j < directions.length; j++) {
      const right = unit(directions[j]!)
      const cosine = left.reduce(
        (sum, value, axis) => sum + value * right[axis]!,
        0,
      )

      spectrum.push(Math.round(cosine * scale) / scale)
    }
  }

  return spectrum.sort((a, b) => a - b)
}

// Whether two configurations share a cosine spectrum within `tolerance`, the rotation-invariant sameness test.
export function sameCosineSpectrum(
  left: number[][],
  right: number[][],
  tolerance = 1e-4,
): boolean {
  if (left.length !== right.length) {
    return false
  }

  const a = cosineSpectrum(left)
  const b = cosineSpectrum(right)

  return a.every((value, index) => Math.abs(value - b[index]!) <= tolerance)
}

// A deterministic straight-line blend of two equal-sized configurations, paired by index and renormalized to the
// sphere. `fraction` zero returns the first, one returns the second. Used to walk from a generic start toward a
// target and locate the fraction at which descent starts flowing into the target, which measures how wide the
// target's basin is rather than merely whether one particular start falls into it.
export function mixConfigurations(
  from: number[][],
  to: number[][],
  fraction: number,
): number[][] {
  return from.map((point, index) =>
    unit(
      point.map(
        (value, axis) =>
          (1 - fraction) * value + fraction * to[index]![axis]!,
      ),
    ),
  )
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
