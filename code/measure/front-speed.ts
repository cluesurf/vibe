// Directional wavefront speeds on an embedded graph. Given a set of probe
// directions (unit vectors) and a field of activated cells, each activated cell is
// assigned to the probe direction nearest in angle, and the farthest activated cell
// (in hyperbolic distance from the centre) per direction gives that direction's
// front distance. Dividing by the number of beats gives the front speed in each
// direction. A nearly uniform set of speeds is an emergent isotropic light speed;
// the spread (max - min) / mean is the anisotropy.

import { norm } from '@/code/algebra/vector'
import { poincareDistance } from '@/code/geometry/distance'

// Per-direction farthest hyperbolic distance reached by the activated field.
// `activated(i)` is true for cells in the wavefront; cell `center` is the source.
export function directionalFrontDistances(input: {
  coords: number[][]
  directions: number[][]
  center: number
  activated: (index: number) => boolean
}): number[] {
  const { coords, directions, center } = input
  const dim = coords[0]?.length ?? 0
  const frontDist = new Array<number>(directions.length).fill(0)

  for (let i = 0; i < coords.length; i++) {
    if (i === center) {
      continue
    }

    if (!input.activated(i)) {
      continue
    }

    const c = coords[i]!
    const n = norm(c)

    if (n < 1e-9) {
      continue
    }

    // nearest probe direction by angle
    let best = 0
    let bestDot = -Infinity

    for (let m = 0; m < directions.length; m++) {
      let dot = 0

      for (let k = 0; k < dim; k++) {
        dot += (c[k]! / n) * directions[m]![k]!
      }

      if (dot > bestDot) {
        bestDot = dot
        best = m
      }
    }

    const d = poincareDistance(coords[center]!, c)

    if (d > frontDist[best]!) {
      frontDist[best] = d
    }
  }

  return frontDist
}

// Range anisotropy (max - min) / mean of a set of speeds; 0 means perfectly
// uniform. Returns 1 (maximally anisotropic) when fewer than two speeds.
// The RMS width of the difference between two same-length states on a periodic ring of length L,
// measured as the root-mean-square periodic distance from `center` over the cells where the two
// states disagree. The damage-spread (butterfly) front width used to read a transport exponent:
// a deterministic ballistic wave grows it linearly in time, a diffusive rule as the square root.
export function differenceRmsWidthRing(input: {
  a: ArrayLike<number>
  b: ArrayLike<number>
  length: number
  center: number
}): number {
  const { a, b, length: L, center } = input

  let weight = 0
  let sumSquared = 0

  for (let x = 0; x < L; x++) {
    if (a[x] !== b[x]) {
      const d = Math.min(Math.abs(x - center), L - Math.abs(x - center))
      weight++
      sumSquared += d * d
    }
  }

  return weight > 0 ? Math.sqrt(sumSquared / weight) : 0
}

export function rangeAnisotropy(speeds: number[]): {
  meanSpeed: number
  anisotropy: number
} {
  const meanSpeed =
    speeds.reduce((s, x) => s + x, 0) / Math.max(1, speeds.length)

  if (speeds.length < 2) {
    return { meanSpeed, anisotropy: 1 }
  }

  let mn = Infinity
  let mx = -Infinity

  for (const v of speeds) {
    if (v < mn) {
      mn = v
    }

    if (v > mx) {
      mx = v
    }
  }

  return { meanSpeed, anisotropy: (mx - mn) / meanSpeed }
}
