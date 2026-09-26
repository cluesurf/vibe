// Rank-2 tensors read off a knit's response, and the comparisons an emergent metric needs.
//
// A single emergent metric g absorbs a knit's anisotropy only when every independent rank-2 response
// tensor is proportional to g^-1: then a linear change of coordinates makes all of them isotropic at
// once. Two tensors that are not proportional cannot both be made isotropic, whatever the coordinates.
//
// - quadraticFit: the symmetric 4 x 4 matrix Q with value(n) = n^T Q n / |n|^2 closest in least squares
//   to measured values on wavevectors n (ten unknowns), and the relative residual, which is zero only
//   when the values ARE a quadratic form (only then are they a rank-2 tensor at all)
// - kineticValue: from a charge wave's relaxation after one beat, r(1) = mean over the carriers of
//   cos(k . d), so 2 (1 - r(1)) / |k|^2 is the second moment of the carriers' velocities along k (the
//   short-time curvature, the f-sum rule), exact up to order k^2
// - peakFrequency: the frequency of the strongest line in a relaxation curve's spectrum (a sound speed
//   when a single mode dominates, and a mixture of stream frequencies when none does)
// - gramTensor: sum over vectors of v v^T / count, e.g. the lone-tone currents on the vacuum
// - tensorDistance: the Frobenius distance between the two tensors each scaled to unit norm, zero for
//   proportional tensors, at most 2
// - anisotropy: the norm of the traceless part over the norm of the isotropic part

import { solveLinearSystem } from '@/code/algebra/linear/dense'

export function quadraticFit(input: {
  wavevectors: readonly (readonly number[])[]
  values: readonly number[]
}): { tensor: number[][]; residual: number } {
  const { wavevectors, values } = input
  const pairs: [number, number][] = [
    [0, 0], [1, 1], [2, 2], [3, 3],
    [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3],
  ]
  const rows = wavevectors.map(n => {
    const norm2 = n.reduce((s, x) => s + x * x, 0)

    return pairs.map(([i, j]) =>
      ((i === j ? 1 : 2) * (n[i] ?? 0) * (n[j] ?? 0)) / norm2,
    )
  })
  const normal = pairs.map((_, a) =>
    pairs.map((__, b) =>
      rows.reduce((s, row) => s + (row[a] ?? 0) * (row[b] ?? 0), 0),
    ),
  )
  const rhs = pairs.map((_, a) =>
    rows.reduce((s, row, r) => s + (row[a] ?? 0) * (values[r] ?? 0), 0),
  )
  const x = solveLinearSystem({ matrix: normal, rightHandSide: rhs })
  const tensor = [0, 1, 2, 3].map(() => [0, 0, 0, 0])

  pairs.forEach(([i, j], a) => {
    ;(tensor[i] as number[])[j] = x[a] ?? 0
    ;(tensor[j] as number[])[i] = x[a] ?? 0
  })

  let misfit = 0
  let size = 0

  rows.forEach((row, r) => {
    const predicted = row.reduce((s, v, a) => s + v * (x[a] ?? 0), 0)

    misfit += (predicted - (values[r] ?? 0)) ** 2
    size += (values[r] ?? 0) ** 2
  })

  return { tensor, residual: Math.sqrt(misfit / size) }
}

export function kineticValue(input: { relaxationAfterOneBeat: number; kSquared: number }): number {
  return (2 * (1 - input.relaxationAfterOneBeat)) / input.kSquared
}

export function peakFrequency(curve: readonly number[], resolution = 3000): number {
  const mean = curve.reduce((a, b) => a + b, 0) / curve.length
  let best = 0
  let bestPower = -1

  for (let s = 1; s < resolution; s++) {
    const w = (Math.PI * s) / resolution
    let re = 0
    let im = 0

    curve.forEach((x, t) => {
      re += (x - mean) * Math.cos(w * t)
      im += (x - mean) * Math.sin(w * t)
    })

    const power = re * re + im * im

    if (power > bestPower) {
      bestPower = power
      best = w
    }
  }

  return best
}

export function gramTensor(vectors: readonly (readonly number[])[]): number[][] {
  return [0, 1, 2, 3].map(i =>
    [0, 1, 2, 3].map(
      j =>
        vectors.reduce((s, v) => s + (v[i] ?? 0) * (v[j] ?? 0), 0) /
        vectors.length,
    ),
  )
}

function frobenius(m: readonly (readonly number[])[]): number {
  return Math.sqrt(m.reduce((s, row) => s + row.reduce((t, x) => t + x * x, 0), 0))
}

export function tensorDistance(
  a: readonly (readonly number[])[],
  b: readonly (readonly number[])[],
): number {
  const na = frobenius(a)
  const nb = frobenius(b)

  return frobenius(
    a.map((row, i) => row.map((x, j) => x / na - (b[i]?.[j] ?? 0) / nb)),
  )
}

export function anisotropy(m: readonly (readonly number[])[]): number {
  const trace = [0, 1, 2, 3].reduce((s, i) => s + (m[i]?.[i] ?? 0), 0) / 4
  const traceless = m.map((row, i) => row.map((x, j) => x - (i === j ? trace : 0)))

  return frobenius(traceless) / (2 * Math.abs(trace))
}
