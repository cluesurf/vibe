// The ONE Minkowski linear-algebra mechanism for the Coxeter tessellation engine. Points are vectors and
// isometries are square matrices in the `number[][]` (row-major) layout the whole tessellation stack uses.
// The metric is a diagonal signature (each entry +1 spacelike or -1 timelike), so the same routines serve
// hyperbolic, spherical, and Euclidean frames. Both the base cell engine (cell-direct) and the renderer
// (render/geometry/honeycomb) build on this, so the reflection, matrix, and projection math lives in exactly
// one place. See note/research/vibe/notes/theory-v0.8.0/plans/hyperrogue-port-roadmap.md.

export type Mat = number[][]
export type Vec = number[]

// the Minkowski inner product under a diagonal metric
export function innerJ(x: Vec, y: Vec, metric: number[]): number {
  let s = 0

  for (let a = 0; a < x.length; a++) {
    s += (metric[a] ?? 1) * (x[a] ?? 0) * (y[a] ?? 0)
  }

  return s
}

export function matMul(a: Mat, b: Mat): Mat {
  const n = a.length
  const out: Mat = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
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

export function matVec(a: Mat, x: Vec): Vec {
  const n = a.length
  const out: Vec = new Array<number>(n).fill(0)

  for (let i = 0; i < n; i++) {
    let s = 0

    for (let j = 0; j < n; j++) {
      s += a[i]![j]! * (x[j] ?? 0)
    }

    out[i] = s
  }

  return out
}

export function identity(n: number): Mat {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  )
}

// reflection matrix across a J-unit normal, M[a][b] = delta_ab - 2 n_a (J_b n_b)
export function reflectionMatrix(normal: Vec, metric: number[]): Mat {
  const n = normal.length
  const out: Mat = identity(n)

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      out[a]![b]! -= 2 * normal[a]! * (metric[b] ?? 1) * normal[b]!
    }
  }

  return out
}

export function determinant(a: Mat): number {
  const n = a.length

  if (n === 0) {
    return 1
  }

  const m = a.map(row => row.slice())

  let det = 1

  for (let col = 0; col < n; col++) {
    let pivot = col

    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r]![col]!) > Math.abs(m[pivot]![col]!)) {
        pivot = r
      }
    }

    if (Math.abs(m[pivot]![col]!) < 1e-15) {
      return 0
    }

    if (pivot !== col) {
      const tmp = m[pivot]!
      m[pivot] = m[col]!
      m[col] = tmp
      det = -det
    }

    det *= m[col]![col]!

    for (let r = col + 1; r < n; r++) {
      const f = m[r]![col]! / m[col]![col]!

      for (let c = col; c < n; c++) {
        m[r]![c]! -= f * m[col]![c]!
      }
    }
  }

  return det
}

// scale a timelike vector to the unit hyperboloid, with the time component positive
export function normalizeTimelike(
  x: Vec,
  metric: number[],
  timeAxis: number,
): Vec {
  const norm = innerJ(x, x, metric)
  const scale = 1 / Math.sqrt(Math.abs(norm))
  const out = x.map(v => v * scale)

  if ((out[timeAxis] ?? 0) < 0) {
    for (let a = 0; a < out.length; a++) {
      out[a] = -(out[a] ?? 0)
    }
  }

  return out
}

// the cell center, the meet of the first cellMirrors mirror planes, normalized onto the hyperboloid
export function cellCenter(
  normals: Mat,
  metric: number[],
  cellMirrors: number,
  timeAxis: number,
): Vec {
  const m = metric.length
  const rows: Mat = []

  for (let i = 0; i < cellMirrors; i++) {
    rows.push(normals[i]!.map((val, a) => (metric[a] ?? 1) * val))
  }

  const c: Vec = new Array<number>(m).fill(0)

  for (let j = 0; j < m; j++) {
    const sub = rows.map(row => row.filter((_, col) => col !== j))
    c[j] = (j % 2 === 0 ? 1 : -1) * determinant(sub)
  }

  return normalizeTimelike(c, metric, timeAxis)
}

// project a hyperboloid point to the Poincare ball or disk (drop the time axis, divide by 1 + time)
export function toPoincare(x: Vec, timeAxis: number): Vec {
  const time = x[timeAxis] ?? 1
  const out: Vec = []

  for (let a = 0; a < x.length; a++) {
    if (a !== timeAxis) {
      out.push((x[a] ?? 0) / (1 + time))
    }
  }

  return out
}

// the hyperbolic distance between two hyperboloid points
export function hyperbolicDistance(
  a: Vec,
  b: Vec,
  metric: number[],
): number {
  return Math.acosh(Math.max(1, -innerJ(a, b, metric)))
}

// is this a hyperbolic (Lorentzian) frame? A spherical or Euclidean frame has an all-positive metric.
export function isHyperbolicMetric(metric: number[]): boolean {
  return metric.some(g => g < 0)
}

// normalize a model point to the unit quadric of its geometry: the hyperboloid <x,x> = -1 for a hyperbolic
// (Lorentzian) frame, or the unit sphere |x| = 1 for a spherical (positive-definite) frame. The same call
// works in every signature, so the cell engine is geometry-general. The hyperbolic branch keeps the
// hemisphere flip (a consistent timelike representative); the spherical branch must NOT flip, since the cells
// genuinely cover the whole sphere and folding antipodes would collapse the orbit.
export function normalizeModelPoint(
  x: Vec,
  metric: number[],
  timeAxis: number,
): Vec {
  if (isHyperbolicMetric(metric)) {
    return normalizeTimelike(x, metric, timeAxis)
  }

  const n = Math.sqrt(Math.max(1e-30, innerJ(x, x, metric)))

  return x.map(v => v / n)
}

// the geodesic distance between two model points, in whichever geometry the metric describes: the hyperbolic
// distance acosh(-<a,b>) for a Lorentzian frame, the angular distance acos(<a,b>/(|a||b|)) on the sphere.
export function geodesicDistance(
  a: Vec,
  b: Vec,
  metric: number[],
): number {
  if (isHyperbolicMetric(metric)) {
    return hyperbolicDistance(a, b, metric)
  }

  const cos =
    innerJ(a, b, metric) /
    Math.sqrt(innerJ(a, a, metric) * innerJ(b, b, metric))

  return Math.acos(Math.max(-1, Math.min(1, cos)))
}

// Stereographic projection of a unit-sphere point to the (m-1)-dimensional ball, from the antipode of `pole`
// (a unit direction). The pole's own point maps to the origin and its antipode to infinity, so passing the
// central cell's direction as the pole puts that cell at the centre of the disk, the spherical analogue of the
// Poincare recentering. `basis` is an orthonormal basis of the hyperplane orthogonal to `pole`, the ball axes.
export function stereographic(x: Vec, pole: Vec, basis: Vec[]): Vec {
  let dotPole = 0

  for (let a = 0; a < x.length; a++) {
    dotPole += (x[a] ?? 0) * (pole[a] ?? 0)
  }

  const denom = 1 + dotPole
  const scale = Math.abs(denom) < 1e-12 ? 1e12 : 1 / denom

  return basis.map(u => {
    let d = 0

    for (let a = 0; a < x.length; a++) {
      d += (x[a] ?? 0) * (u[a] ?? 0)
    }

    return d * scale
  })
}

// an orthonormal basis of the hyperplane orthogonal to a unit vector `pole`, by Gram-Schmidt over the standard
// axes. Returns m-1 vectors in R^m, the ball axes for `stereographic`.
export function orthogonalComplementBasis(pole: Vec): Vec[] {
  const m = pole.length
  const basis: Vec[] = []

  for (let axis = 0; axis < m && basis.length < m - 1; axis++) {
    const e: Vec = new Array<number>(m).fill(0)
    e[axis] = 1
    // remove the pole component and every chosen basis component
    let dp = 0

    for (let a = 0; a < m; a++) {
      dp += e[a]! * (pole[a] ?? 0)
    }

    for (let a = 0; a < m; a++) {
      e[a] = e[a]! - dp * (pole[a] ?? 0)
    }

    for (const u of basis) {
      let du = 0

      for (let a = 0; a < m; a++) {
        du += e[a]! * u[a]!
      }

      for (let a = 0; a < m; a++) {
        e[a] = e[a]! - du * u[a]!
      }
    }

    let len = 0

    for (let a = 0; a < m; a++) {
      len += e[a]! * e[a]!
    }

    len = Math.sqrt(len)

    if (len < 1e-9) {
      continue
    }

    basis.push(e.map(v => v / len))
  }

  return basis
}

// reflect a point across a J-unit normal
export function reflectPoint(
  p: Vec,
  normal: Vec,
  metric: number[],
): Vec {
  const nn = innerJ(normal, normal, metric)

  if (Math.abs(nn) < 1e-12) {
    return p.slice()
  }

  const f = (2 * innerJ(p, normal, metric)) / nn

  return p.map((v, a) => v - f * normal[a]!)
}

// round a vector to a stable string key (for deduping coincident points)
export function pointKey(p: Vec): string {
  return p.map(v => Math.round(v * 1e6) / 1e6).join(',')
}

// the spatial axes of a frame (every axis except the timelike one)
export function spatialAxes(dim: number, timeAxis: number): number[] {
  const out: number[] = []

  for (let i = 0; i < dim; i++) {
    if (i !== timeAxis) {
      out.push(i)
    }
  }

  return out
}

// the vector J-perpendicular to every given normal (the meet of those mirror planes), by cofactor expansion
export function nullVector(normals: Mat, metric: number[]): Vec {
  const dim = metric.length
  const M = normals.map(n => n.map((nk, k) => (metric[k] ?? 1) * nk))
  const v = new Array<number>(dim).fill(0)

  for (let i = 0; i < dim; i++) {
    const minor = M.map(row => row.filter((_, k) => k !== i))
    v[i] = (i % 2 === 0 ? 1 : -1) * determinant(minor)
  }

  return v
}
