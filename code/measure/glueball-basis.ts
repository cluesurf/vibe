// A variational basis for the scalar glueball and the ground state it projects out.
//
// - spatialLoopSlices: the 0++ operator built from w x h spatial Wilson loops, one value per time
//   slice. The 1 x 1 loop is the plaquette operator of spatialPlaquetteSlices. Larger loops on
//   smeared links are larger operators, and a basis mixing loop size with smearing depth spans the
//   glueball's size far better than smearing alone (Teper 1987, Lucini, Teper and Wenger 2004).
// - projectedCorrelator: the variational method with fixed eigenvectors (Michael 1985, Luscher and
//   Wolff 1990, Blossier et al. 2009). The generalized eigenproblem C(t1) v = lambda C(t0) v is
//   solved once, and the ground-state eigenvector v projects the whole correlator matrix onto one
//   correlator c(t) = v^T C(t) v, whose effective mass can then be read at every t. Solving once and
//   projecting is the stable choice at large t, where re-solving the eigenproblem on noise picks up
//   the noise.

import { GaugeLattice, linkSlot } from '@/code/dynamics/gauge-lattice'
import {
  MatrixSlot,
  copyMatrix,
  multiplyInto,
} from '@/code/algebra/group/unitary-matrix'
import { connectedCorrelatorMatrix } from '@/code/measure/lattice-gauge-observable'
import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'

// The product of `length` links from `site` along `mu`, into `out`, using `scratch` as the second
// buffer. Returns the site the line ends on.
function lineInto(input: {
  lattice: GaugeLattice
  site: number
  mu: number
  length: number
  out: MatrixSlot
  scratch: MatrixSlot
}): number {
  const { lattice, mu, out, scratch } = input
  const { n, geometry } = lattice
  const { dim, up } = geometry

  let at = input.site

  copyMatrix({ n, from: linkSlot({ lattice, site: at, mu }), out })
  at = up[at * dim + mu] ?? 0

  for (let step = 1; step < input.length; step++) {
    copyMatrix({ n, from: out, out: scratch })
    multiplyInto({
      n,
      a: scratch,
      b: linkSlot({ lattice, site: at, mu }),
      out,
    })
    at = up[at * dim + mu] ?? 0
  }

  return at
}

// Re Tr (a b^dag)
function realTraceOfDaggerProduct(input: {
  n: number
  a: MatrixSlot
  b: MatrixSlot
}): number {
  const size = input.n * input.n

  let total = 0

  for (let e = 0; e < size; e++) {
    const ka = input.a.offset + 2 * e
    const kb = input.b.offset + 2 * e

    total +=
      (input.a.data[ka] ?? 0) * (input.b.data[kb] ?? 0) +
      (input.a.data[ka + 1] ?? 0) * (input.b.data[kb + 1] ?? 0)
  }

  return total
}

// The sum over each time slice of (1 / N) Re Tr of every w x h spatial Wilson loop, in every spatial
// plane and both orientations (a w x h and an h x w loop, when w != h), so the operator is invariant
// under the cubic rotations and carries J^PC = 0++. Time is the last axis.
export function spatialLoopSlices(input: {
  lattice: GaugeLattice
  width: number
  height: number
}): number[] {
  const { lattice, width, height } = input
  const { n, geometry } = lattice
  const { dim, sites, lengths } = geometry
  const timeAxis = dim - 1
  const timeLength = lengths[timeAxis] ?? 1
  const spatialVolume = sites / timeLength
  const size = 2 * n * n
  const buffer = new Float64Array(6 * size)
  const slot = (k: number): MatrixSlot => ({
    data: buffer,
    offset: k * size,
  })
  const first = slot(0)
  const second = slot(1)
  const line = slot(2)
  const scratch = slot(3)
  const lower = slot(4)
  const upper = slot(5)
  const shapes =
    width === height
      ? [[width, height]]
      : [
          [width, height],
          [height, width],
        ]
  const slices = new Array<number>(timeLength).fill(0)

  for (let site = 0; site < sites; site++) {
    const t = Math.floor(site / spatialVolume)

    for (let mu = 0; mu < timeAxis; mu++) {
      for (let nu = mu + 1; nu < timeAxis; nu++) {
        for (const [w = 1, h = 1] of shapes) {
          // lower-right path: L_mu(x, w) L_nu(x + w mu, h)
          const right = lineInto({
            lattice,
            site,
            mu,
            length: w,
            out: first,
            scratch,
          })

          lineInto({
            lattice,
            site: right,
            mu: nu,
            length: h,
            out: line,
            scratch,
          })
          multiplyInto({ n, a: first, b: line, out: lower })

          // upper-left path: L_nu(x, h) L_mu(x + h nu, w)
          const top = lineInto({
            lattice,
            site,
            mu: nu,
            length: h,
            out: second,
            scratch,
          })

          lineInto({
            lattice,
            site: top,
            mu,
            length: w,
            out: line,
            scratch,
          })
          multiplyInto({ n, a: second, b: line, out: upper })

          slices[t] =
            (slices[t] ?? 0) +
            realTraceOfDaggerProduct({ n, a: lower, b: upper }) / n
        }
      }
    }
  }

  return slices
}

// The ground-state eigenvector of the generalized eigenproblem C(t1) v = lambda C(t0) v, normalized
// so v^T C(t0) v = 1, or undefined when C(t0) is not positive definite.
export function groundStateVector(input: {
  a: readonly (readonly number[])[]
  b: readonly (readonly number[])[]
}): number[] | undefined {
  const { a, b } = input
  const n = b.length
  const lower = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  )

  for (let j = 0; j < n; j++) {
    let diagonal = b[j]?.[j] ?? 0

    for (let k = 0; k < j; k++) {
      diagonal -= (lower[j]?.[k] ?? 0) ** 2
    }

    if (!(diagonal > 0)) {
      return undefined
    }

    const pivot = Math.sqrt(diagonal)
    const row = lower[j]

    if (row !== undefined) {
      row[j] = pivot
    }

    for (let i = j + 1; i < n; i++) {
      let value = b[i]?.[j] ?? 0

      for (let k = 0; k < j; k++) {
        value -= (lower[i]?.[k] ?? 0) * (lower[j]?.[k] ?? 0)
      }

      const target = lower[i]

      if (target !== undefined) {
        target[j] = value / pivot
      }
    }
  }

  // inverse of the lower-triangular factor
  const inverse = Array.from({ length: n }, () =>
    new Array<number>(n).fill(0),
  )

  for (let column = 0; column < n; column++) {
    for (let i = 0; i < n; i++) {
      let value = i === column ? 1 : 0

      for (let k = 0; k < i; k++) {
        value -= (lower[i]?.[k] ?? 0) * (inverse[k]?.[column] ?? 0)
      }

      const target = inverse[i]

      if (target !== undefined) {
        target[column] = value / (lower[i]?.[i] ?? 1)
      }
    }
  }

  // M = L^-1 A L^-T, symmetric, whose top eigenvector w gives v = L^-T w
  const reduced = makeDense({ rows: n, cols: n })

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let total = 0

      for (let p = 0; p < n; p++) {
        for (let q = 0; q < n; q++) {
          total +=
            (inverse[i]?.[p] ?? 0) *
            (((a[p]?.[q] ?? 0) + (a[q]?.[p] ?? 0)) / 2) *
            (inverse[j]?.[q] ?? 0)
        }
      }

      reduced.data[i * n + j] = total
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const mean =
        ((reduced.data[i * n + j] ?? 0) + (reduced.data[j * n + i] ?? 0)) /
        2

      reduced.data[i * n + j] = mean
      reduced.data[j * n + i] = mean
    }
  }

  const { vectors } = eigSymmetric({ matrix: reduced })
  // eigenvalues ascend, so the ground state (the largest lambda) is the last column
  const w = Array.from(
    { length: n },
    (_, i) => vectors[i * n + (n - 1)] ?? 0,
  )

  return Array.from({ length: n }, (_, i) => {
    let total = 0

    for (let k = 0; k < n; k++) {
      total += (inverse[k]?.[i] ?? 0) * (w[k] ?? 0)
    }

    return total
  })
}

// The correlator matrix of per-slice operators projected onto the ground state of the generalized
// eigenproblem at (t0, t1): c(t) = v^T C(t) v for t = 0 .. maxT. slices[configuration][operator][t].
// Returns NaN everywhere when C(t0) is not positive definite.
export function projectedCorrelator(input: {
  slices: readonly (readonly (readonly number[])[])[]
  t0: number
  t1: number
  maxT: number
}): number[] {
  const { slices, t0, t1, maxT } = input
  const matrices = Array.from({ length: maxT + 1 }, (_, t) =>
    connectedCorrelatorMatrix({ slices, t }),
  )
  const v = groundStateVector({
    a: matrices[t1] ?? [],
    b: matrices[t0] ?? [],
  })

  if (v === undefined) {
    return new Array<number>(maxT + 1).fill(Number.NaN)
  }

  return matrices.map(c =>
    c.reduce(
      (sum, row, i) =>
        sum +
        row.reduce(
          (inner, value, j) => inner + (v[i] ?? 0) * value * (v[j] ?? 0),
          0,
        ),
      0,
    ),
  )
}
