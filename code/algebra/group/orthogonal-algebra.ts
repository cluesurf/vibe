// The Lie algebra so(p,q) as explicit matrices, with the closure predicate. The
// conformal group of the n-sphere is O(n,1), so the boundary conformal symmetry
// algebra of hyperbolic n-space is so(n,1). We build its generators and check
// that all their commutators stay in the algebra, the seed of the celestial
// symmetry algebra sitting on the ideal boundary.

export type Matrix = number[][]

// the diagonal metric with `plus` entries of +1 then `minus` entries of -1
export function metricSignature(plus: number, minus: number): number[] {
  return [
    ...Array.from({ length: plus }, () => 1),
    ...Array.from({ length: minus }, () => -1),
  ]
}

export function matrixMultiply(a: Matrix, b: Matrix): Matrix {
  const n = a.length
  const out: Matrix = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => 0),
  )

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const aik = a[i]![k]!

      if (aik === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        out[i]![j]! += aik * b[k]![j]!
      }
    }
  }

  return out
}

export function commutator(a: Matrix, b: Matrix): Matrix {
  const ab = matrixMultiply(a, b)
  const ba = matrixMultiply(b, a)

  return ab.map((row, i) => row.map((v, j) => v - ba[i]![j]!))
}

// M is in so(metric) iff M^T eta + eta M = 0, that is eta_c M_cd + M_dc eta_d = 0
// for the diagonal metric eta. Returns the largest violation, zero when M is in
// the algebra.
export function algebraViolation(m: Matrix, metric: number[]): number {
  const n = metric.length

  let worst = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const value = metric[i]! * m[i]![j]! + m[j]![i]! * metric[j]!

      worst = Math.max(worst, Math.abs(value))
    }
  }

  return worst
}

// The generators of so(metric): one antisymmetric-in-the-metric generator per
// index pair i < j. M_ij has M[i][j] = metric[j], M[j][i] = -metric[i]. Rotation
// generators for two like-sign axes, boost generators for a mixed pair.
export function orthogonalGenerators(metric: number[]): Matrix[] {
  const n = metric.length
  const generators: Matrix[] = []

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const m: Matrix = Array.from({ length: n }, () =>
        Array.from({ length: n }, () => 0),
      )

      m[i]![j] = metric[j]!
      m[j]![i] = -metric[i]!
      generators.push(m)
    }
  }

  return generators
}
